import * as THREE from "https://esm.sh/three@0.164.1";

(function () {
  "use strict";

  const LAB_TITLE = "신호등-반응 억제 훈련";
  const REPORT_SCOPE = "rehab";
  const SUPABASE_URL = "https://gxungzlecmibgvykoiib.supabase.co";
  const SUPABASE_KEY = "sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE";
  const LAB_SESSION_COMPLETION_ACTION = "게임 완료";
  const TOTAL_ROUNDS = 10;
  const CAR_HORN_SRC = "/sound/car-horn.mp3";

  const AGE_GROUPS = {
    toddler: { label: "유아", range: "2-6세", maxTime: 3000, normProfile: "preschool", benchmarkMs: 1700 },
    child: { label: "초등", range: "7-12세", maxTime: 2500, normProfile: "lower-elementary", benchmarkMs: 1300 },
    teen: { label: "청소년", range: "13-17세", maxTime: 2000, normProfile: "upper-elementary", benchmarkMs: 1050 },
    adult: { label: "성인", range: "18-64세", maxTime: 2000, normProfile: "adult", benchmarkMs: 950 },
    senior: { label: "고령자", range: "65세 이상", maxTime: 3000, normProfile: "senior", benchmarkMs: 1450 }
  };

  const LEVELS = [
    { id: "lv1", index: 1, label: "반응 안정화", speed: 2000, goRate: 0.5, desc: "멈춤과 출발의 기본 규칙을 안정적으로 형성해요." },
    { id: "lv2", index: 2, label: "기초 억제", speed: 1800, goRate: 0.5, desc: "신호 확인 후 행동을 시작하는 억제 기초를 봐요." },
    { id: "lv3", index: 3, label: "표준 억제", speed: 1500, goRate: 0.4, desc: "No-Go 시행에서 충동 반응을 조절하는지 관찰해요." },
    { id: "lv4", index: 4, label: "선택 억제", speed: 1200, goRate: 0.4, desc: "짧은 창 안에서 신호 선택과 반응 보류를 훈련해요." },
    { id: "lv5", index: 5, label: "고부하 억제", speed: 1000, goRate: 0.3, desc: "멈춰야 하는 시행이 많은 조건에서 억제 지속성을 봐요." },
    { id: "lv6", index: 6, label: "임상 심화", speed: 800, goRate: 0.3, desc: "높은 부하 조건에서 안정적인 인지 제어를 관찰해요." }
  ];

  const els = {};
  const state = {
    ageKey: "",
    levelId: "",
    roundIndex: 0,
    signal: "idle",
    trialType: "",
    trialStartMs: 0,
    trialLimitMs: 0,
    startedAtMs: 0,
    waitingTimer: 0,
    trialTimer: 0,
    countdownTimer: 0,
    crossing: false,
    crossingStartMs: 0,
    pendingReactionMs: 0,
    savedRunId: "",
    logs: [],
    sceneReady: false
  };

  const audioState = {
    context: null,
    current: null,
    hornBuffer: null
  };

  const three = {
    scene: null,
    camera: null,
    renderer: null,
    canvas: null,
    character: null,
    characterBody: null,
    trafficLight: null,
    cars: [],
    clock: null,
    initialized: false
  };

  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const round = (value) => Math.round(Number(value || 0));
  const percent = (value, total) => total ? Math.round((Number(value || 0) / total) * 100) : 0;
  const average = (items) => {
    const nums = items.map(Number).filter((value) => Number.isFinite(value) && value > 0);
    return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : 0;
  };

  function setScreen(name) {
    ["menuView", "gameView", "resultView"].forEach((id) => {
      els[id].classList.toggle("is-active", id === `${name}View`);
    });
    els.stageButton.classList.toggle("traffic-hidden", name === "menu");
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === "function") {
      window.PlaylabReportEngine.setPdfButtonVisible(name === "result", {
        title: () => `${LAB_TITLE}-${getSelectedLevel()?.label || "리포트"}`
      });
    }
    if (name !== "game") stopRoundTimers();
  }

  function getSelectedAge() {
    return AGE_GROUPS[state.ageKey] || null;
  }

  function getSelectedLevel() {
    return LEVELS.find((item) => item.id === state.levelId) || null;
  }

  function renderLevels() {
    els.levelGrid.innerHTML = LEVELS.map((level) => (
      `<button type="button" class="traffic-level-card" data-level="${level.id}" aria-pressed="false">
        <span>LV${level.index}</span>
        <h2>${level.label}</h2>
        <p>${level.desc}</p>
      </button>`
    )).join("");
  }

  function updateMenuState() {
    document.querySelectorAll("[data-age]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.age === state.ageKey);
    });
    document.querySelectorAll("[data-level]").forEach((button) => {
      const selected = button.dataset.level === state.levelId;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    const age = getSelectedAge();
    const level = getSelectedLevel();
    els.startButton.disabled = !age || !level;
    els.startButton.textContent = age && level
      ? `${age.label} · ${level.label} 훈련 시작`
      : "연령과 레벨을 선택해 주세요";
  }

  function playTone(type) {
    stopAudio();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioState.context) audioState.context = new AudioContext();
      const ctx = audioState.context;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      const map = {
        good: { freq: 720, end: 0.18, wave: "sine", gain: 0.12 },
        miss: { freq: 260, end: 0.22, wave: "square", gain: 0.09 },
        tick: { freq: 520, end: 0.08, wave: "sine", gain: 0.07 }
      };
      const config = map[type] || map.tick;
      oscillator.type = config.wave;
      oscillator.frequency.setValueAtTime(config.freq, now);
      gain.gain.setValueAtTime(config.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + config.end);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + config.end);
      audioState.current = oscillator;
    } catch (_error) {}
  }

  function playCarHorn() {
    stopAudio();
    try {
      const audio = new Audio(CAR_HORN_SRC);
      audio.preload = "auto";
      audio.volume = 0.95;
      audioState.current = audio;
      audio.addEventListener("ended", () => {
        if (audioState.current === audio) audioState.current = null;
      }, { once: true });
      audio.play().catch(() => {
        if (audioState.current === audio) audioState.current = null;
      });
    } catch (_error) {
      audioState.current = null;
    }
  }

  function preloadCarHorn() {
    if (audioState.hornBuffer) return audioState.hornBuffer;
    const audio = new Audio(CAR_HORN_SRC);
    audio.preload = "auto";
    audio.volume = 0.95;
    try { audio.load(); } catch (_error) {}
    audioState.hornBuffer = audio;
    return audio;
  }

  function stopAudio() {
    if (audioState.current) {
      try { audioState.current.stop(); } catch (_error) {}
      try { audioState.current.pause(); } catch (_error) {}
      try { audioState.current.currentTime = 0; } catch (_error) {}
      audioState.current = null;
    }
  }

  function showToast(message, tone) {
    els.feedbackToast.textContent = message;
    els.feedbackToast.dataset.tone = tone || "";
    els.feedbackToast.classList.add("is-visible");
    window.setTimeout(() => els.feedbackToast.classList.remove("is-visible"), 900);
  }

  function setSignal(signal) {
    if (signal === "green") clearCarsFromCrosswalk();
    state.signal = signal;
    const labelMap = { idle: "대기", yellow: "준비", green: "초록불", red: "빨간불" };
    els.signalLabel.textContent = labelMap[signal] || "대기";
    els.trialTimer.textContent = signal === "green" || signal === "red" ? `${(state.trialLimitMs / 1000).toFixed(1)}초` : "--";
    document.querySelector(".traffic-light").dataset.signal = signal;
  }

  function stopRoundTimers() {
    window.clearTimeout(state.waitingTimer);
    window.clearTimeout(state.trialTimer);
    window.clearInterval(state.countdownTimer);
    state.waitingTimer = 0;
    state.trialTimer = 0;
    state.countdownTimer = 0;
  }

  function startGame() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    if (!age || !level) return;
    state.roundIndex = 0;
    state.logs = [];
    state.startedAtMs = Date.now();
    state.savedRunId = "";
    els.gameKicker.textContent = `${age.label} ${age.range} · ${level.label}`;
    setScreen("game");
    initThree();
    resetCharacter();
    window.setTimeout(startRound, 200);
  }

  function startRound() {
    stopRoundTimers();
    resetCharacter();
    state.crossing = false;
    const age = getSelectedAge();
    const level = getSelectedLevel();
    state.roundIndex += 1;
    state.trialType = "";
    state.trialStartMs = 0;
    state.trialLimitMs = Math.min(age.maxTime, level.speed);
    els.roundCounter.textContent = `문항 ${state.roundIndex} / ${TOTAL_ROUNDS}`;
    els.ruleText.textContent = "노란불에는 기다리고, 초록불에만 건너요.";
    els.crossButton.disabled = false;
    setSignal("yellow");
    playTone("tick");
    const waitMs = 1000 + Math.floor(Math.random() * 501);
    state.waitingTimer = window.setTimeout(() => activateTrial(), waitMs);
  }

  function activateTrial() {
    const level = getSelectedLevel();
    state.trialType = Math.random() < level.goRate ? "go" : "nogo";
    state.trialStartMs = Date.now();
    setSignal(state.trialType === "go" ? "green" : "red");
    els.ruleText.textContent = state.trialType === "go"
      ? "초록불이에요. 안전하게 건너세요."
      : "빨간불이에요. 멈추고 기다리세요.";
    startCountdown();
    state.trialTimer = window.setTimeout(() => {
      if (state.trialType === "go") endRound("MISS", state.trialLimitMs, "초록불에 건너지 못했어요.");
      else endRound("SUCCESS_HOLD", state.trialLimitMs, "잘 멈췄어요.");
    }, state.trialLimitMs);
  }

  function startCountdown() {
    window.clearInterval(state.countdownTimer);
    state.countdownTimer = window.setInterval(() => {
      if (!state.trialStartMs) return;
      const remain = Math.max(0, state.trialLimitMs - (Date.now() - state.trialStartMs));
      els.trialTimer.textContent = `${(remain / 1000).toFixed(1)}초`;
    }, 80);
  }

  function handleCrossAttempt() {
    if (!els.gameView.classList.contains("is-active") || state.crossing) return;
    if (state.signal === "yellow") {
      playCarHorn();
      endRound("COMMISSION", 0, "노란불에는 아직 기다려요.");
      return;
    }
    if (state.signal === "red") {
      playCarHorn();
      endRound("COMMISSION", Date.now() - state.trialStartMs, "빨간불에는 멈춰요.");
      return;
    }
    if (state.signal !== "green") return;
    const reactionMs = Date.now() - state.trialStartMs;
    if (reactionMs < 150) {
      endRound("ANTICIPATORY", reactionMs, "너무 빨리 눌렀어요.");
      return;
    }
    stopRoundTimers();
    state.crossing = true;
    state.crossingStartMs = Date.now();
    state.pendingReactionMs = reactionMs;
    playTone("good");
    showToast("건너갑니다", "good");
  }

  function completeCrossing() {
    if (!state.crossing) return;
    const reactionMs = state.pendingReactionMs || (Date.now() - state.trialStartMs);
    state.crossing = false;
    state.pendingReactionMs = 0;
    endRound("HIT", reactionMs, "초록불에 잘 건넜어요.", true);
  }

  function endRound(outcome, reactionMs, message, alreadyMoved) {
    stopRoundTimers();
    const isError = ["COMMISSION", "ANTICIPATORY", "MISS"].includes(outcome);
    if (outcome === "ANTICIPATORY") playCarHorn();
    if (outcome === "MISS") playTone("miss");
    if (outcome === "SUCCESS_HOLD") playTone("good");
    if (!alreadyMoved && (outcome === "COMMISSION" || outcome === "ANTICIPATORY")) shakeCharacter();
    showToast(message, isError ? "warn" : "good");
    state.logs.push({
      round: state.roundIndex,
      signal: state.trialType || state.signal,
      outcome,
      reactionMs: Math.max(0, round(reactionMs)),
      limitMs: state.trialLimitMs,
      ageGroup: state.ageKey,
      level: state.levelId,
      correct: outcome === "HIT" || outcome === "SUCCESS_HOLD"
    });
    els.crossButton.disabled = true;
    window.setTimeout(() => {
      if (state.roundIndex >= TOTAL_ROUNDS) finishGame();
      else startRound();
    }, outcome === "HIT" ? 850 : 1050);
  }

  function getMetrics() {
    const logs = state.logs.slice();
    const hit = logs.filter((item) => item.outcome === "HIT").length;
    const miss = logs.filter((item) => item.outcome === "MISS").length;
    const hold = logs.filter((item) => item.outcome === "SUCCESS_HOLD").length;
    const commission = logs.filter((item) => item.outcome === "COMMISSION").length;
    const anticipatory = logs.filter((item) => item.outcome === "ANTICIPATORY").length;
    const goTotal = logs.filter((item) => item.signal === "go").length;
    const noGoTotal = logs.filter((item) => item.signal === "nogo").length;
    const correct = hit + hold;
    const avgReactionMs = average(logs.filter((item) => item.outcome === "HIT").map((item) => item.reactionMs));
    const accuracyRate = percent(correct, logs.length || TOTAL_ROUNDS);
    const goAccuracy = percent(hit, goTotal);
    const inhibitionRate = percent(hold, noGoTotal);
    const errorCount = miss + commission + anticipatory;
    const age = getSelectedAge();
    const level = getSelectedLevel();
    const speedScore = avgReactionMs
      ? clamp(round(100 - Math.max(0, avgReactionMs - age.benchmarkMs) / 18), 35, 100)
      : 45;
    const inhibitionScore = clamp(round((inhibitionRate * 0.72) + Math.max(0, 100 - (commission + anticipatory) * 18) * 0.28), 20, 100);
    const attentionScore = clamp(round((accuracyRate * 0.52) + (goAccuracy * 0.24) + (inhibitionRate * 0.24)), 20, 100);
    const safetyScore = clamp(round((hold * 100 / Math.max(1, noGoTotal)) - (commission * 8) - (anticipatory * 6) + 18), 20, 100);
    const integratedScore = clamp(round((accuracyRate * 0.4) + (inhibitionScore * 0.28) + (speedScore * 0.16) + (attentionScore * 0.16)), 0, 100);
    return {
      logs,
      hit,
      miss,
      hold,
      commission,
      anticipatory,
      goTotal,
      noGoTotal,
      correct,
      wrong: errorCount,
      avgReactionMs,
      accuracyRate,
      goAccuracy,
      inhibitionRate,
      speedScore,
      inhibitionScore,
      attentionScore,
      safetyScore,
      integratedScore,
      age,
      level,
      elapsedMs: Date.now() - state.startedAtMs
    };
  }

  function getClinicalFeedback(metrics) {
    const errorText = metrics.commission + metrics.miss > 2
      ? "오경보와 미반응이 누적되어 자극 선택 후 행동을 멈추는 과정의 안정화가 우선 권장됩니다."
      : "멈춤과 출발 규칙을 비교적 안정적으로 유지했습니다.";
    if (state.ageKey === "toddler") {
      return metrics.commission + metrics.miss > 2
        ? "유아 기준에서는 감각 게이팅과 공동 주의 전환이 아직 흔들릴 수 있는 패턴입니다. 짧은 규칙 안내와 즉각 피드백을 반복하는 방식이 적절합니다."
        : "유아 기준에서는 신호 변화에 대한 공동 주의와 기본 억제 반응이 안정적으로 관찰됩니다. 놀이 맥락에서 성공 경험을 유지하며 속도를 조금씩 높일 수 있습니다.";
    }
    if (state.ageKey === "child" || state.ageKey === "teen") {
      return metrics.commission > 1
        ? "학령기 기준에서는 빨간불 반응 억제에서 충동성 주의가 관찰됩니다. 신호를 보고 한 박자 멈춘 뒤 반응하는 자기점검 루틴을 우선 훈련해 주세요."
        : "학령기 기준에서는 실행 기능과 억제 능력이 양호하게 관찰됩니다. 반응 속도보다 규칙 유지가 먼저 안정화된 점이 긍정적입니다.";
    }
    if (state.ageKey === "adult") {
      return metrics.commission > 1
        ? "성인 기준에서는 스트레스성 충동 반응 또는 조급 반응 가능성이 관찰됩니다. 과제 전 호흡-확인-반응 순서를 고정하는 훈련이 도움이 됩니다."
        : "성인 기준에서는 안정적인 인지 제어와 반응 선택이 관찰됩니다. 빠른 반응보다 No-Go 억제를 유지한 점이 강점입니다.";
    }
    if (state.ageKey === "senior") {
      return metrics.accuracyRate < 70
        ? "고령자 기준에서는 정확도가 낮아 신호 구분과 반응 억제의 부담이 커진 상태로 해석됩니다. 낮은 레벨에서 자극 시간을 늘려 반복 관찰하는 것이 필요합니다."
        : "고령자 기준에서는 정상 노화 범위에서 기대할 수 있는 신호 구분과 억제 반응이 유지됩니다. 피로 누적에 따른 변동성만 함께 관찰해 주세요.";
    }
    return errorText;
  }

  let reportRunLogsReference = null;
  let reportRunSessionId = "";
  let reportRunSessionCounter = 0;

  function getReportRunSessionId() {
    if (reportRunLogsReference !== state.logs || !reportRunSessionId) {
      reportRunLogsReference = state.logs;
      reportRunSessionCounter += 1;
      let unique = "";
      try {
        if (window.crypto && typeof window.crypto.randomUUID === "function") unique = window.crypto.randomUUID();
        else if (window.crypto && typeof window.crypto.getRandomValues === "function") {
          unique = Array.from(window.crypto.getRandomValues(new Uint8Array(16)), (value) => value.toString(16).padStart(2, "0")).join("");
        }
      } catch (_error) {}
      reportRunSessionId = `rehab-run-${unique || `${Date.now().toString(36)}-${reportRunSessionCounter.toString(36)}-${Math.random().toString(36).slice(2)}`}`;
    }
    return reportRunSessionId;
  }

  // Reporting samples are separate from legacy game points and raw state.logs.
  // No response window, age setting or zero sentinel is treated as a measured RT.
  function getReportReactionSample(metrics) {
    const logs = Array.isArray(metrics.logs) ? metrics.logs : [];
    const correctGoOnly = true;
    const reasons = {};
    const values = [];
    let respondedCount = 0;
    const questionLogs = logs.map((item) => {
      const outcome = String(item.outcome || "").toUpperCase();
      const withheld = /SUCCESS_HOLD|CORRECT_REJECT|WITHHOLD|NO_RESPONSE|HELD|HOLD/.test(outcome);
      const omitted = /MISS|OMISSION|TIME.?OUT/.test(outcome);
      const flaggedNoResponse = item.responded === false || item.noResponse === true || item.timedOut === true || item.timeout === true || item.source === "timeout" || item.inputSource === "timeout";
      const responded = !withheld && !omitted && !flaggedNoResponse;
      if (responded) respondedCount += 1;
      const raw = item.reactionMs;
      const numeric = (typeof raw === "number" || (typeof raw === "string" && raw.trim() !== "")) && Number.isFinite(Number(raw)) && Number(raw) > 0 ? Number(raw) : null;
      const reason = withheld ? "correct-withhold-no-response" : omitted ? "omission-or-timeout" : flaggedNoResponse ? "flagged-no-response" : outcome === "ANTICIPATORY" ? "existing-anticipatory-outcome" : item.isValid === false || item.excluded === true ? "originally-excluded" : correctGoOnly && outcome !== "HIT" ? "not-correct-go-response" : numeric === null ? "nonpositive-or-unmeasured-time" : "";
      const included = !reason;
      if (included) values.push(numeric);
      else reasons[reason] = (reasons[reason] || 0) + 1;
      return Object.assign({}, item, {
        rawReactionMs: raw === undefined ? null : raw,
        rawCorrect: item.correct,
        reactionMs: included ? numeric : null,
        responseMs: included ? numeric : null,
        durationMs: included ? numeric : null,
        responseWindowMs: item.limitMs ?? null,
        correct: item.correct,
        responded,
        isValid: included,
        excluded: !included,
        exclusionScope: "reaction-time-only",
        reactionTimeIncluded: included,
        reactionTimeExclusionReason: reason || null
      });
    });
    const sorted = values.slice().sort((a, b) => a - b);
    const quantile = (p) => {
      if (!sorted.length) return null;
      const position = (sorted.length - 1) * p;
      const lower = Math.floor(position), fraction = position - lower;
      return sorted[lower] + (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction;
    };
    const meanMs = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    return {
      questionLogs,
      meanMs,
      medianMs: quantile(0.5),
      iqrMs: sorted.length ? quantile(0.75) - quantile(0.25) : null,
      included: values.length,
      totalLogs: logs.length,
      respondedCount,
      excluded: logs.length - values.length,
      exclusionReasons: reasons,
      sampleRule: correctGoOnly ? "positive-correct-go-only; existing anticipatory outcome, no-response, errors and nonpositive times excluded" : "positive-observed-choice-responses; correct/error/late responses included; no-response and nonpositive times excluded",
      sampleLabel: correctGoOnly ? "정답 Go 응답" : "실제 선택 응답(정·오답 및 늦은 응답 포함)",
      quantileMethod: "linear interpolation at (n-1)*p; descriptive only",
      source: "recorded-trial-reactionMs; not response-window or age benchmark"
    };
  }

  function formatReportReactionMs(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0
      ? `${Math.round(value * 100) / 100}ms` : "미기록";
  }

  function buildReportInput(metrics) {
    const reactionSample = getReportReactionSample(metrics);
    const { questionLogs, ...reactionTimeSample } = reactionSample;
    return {
      reportEvidenceMode: "observed-only",
      title: LAB_TITLE,
      sessionId: getReportRunSessionId(),
      reactionTimeSample,
      gameScore: metrics.integratedScore,
      gameScoreKind: "legacy-game-points-not-clinical",
      reportType: "rehablab-traffic-go-nogo",
      reportProfile: "visual-discrimination",
      reportProfileLabel: "Go/No-Go 억제 제어",
      normProfile: metrics.age.normProfile,
      normProfileLabel: `${metrics.age.label} ${metrics.age.range} 게임 설정 · 규준 아님`,
      stageTitle: `${metrics.age.label} · ${metrics.level.label}`,
      categoryTitle: LAB_TITLE,
      totalItems: TOTAL_ROUNDS,
      totalQuestions: TOTAL_ROUNDS,
      correctCount: metrics.correct,
      wrongCount: metrics.wrong,
      completionCount: TOTAL_ROUNDS,
      perfectCount: metrics.hit + metrics.hold,
      accuracyRate: metrics.accuracyRate,
      completionRate: 100,
      firstTryRate: metrics.accuracyRate,
      avgQuestionMs: reactionSample.meanMs,
      elapsedMs: metrics.elapsedMs,
      benchmarkMs: null,
      gameConditions: { ageGroup: state.ageKey, level: state.levelId, benchmarkMs: metrics.age.benchmarkMs, interpretation: "existing game setting; not validated clinical norm" },
      difficultyIndex: metrics.level.index / 6,
      replayCount: metrics.commission + metrics.anticipatory,
      visualReplayCount: metrics.miss,
      questionLogs,
      accentColor: "#0f6fbd"
    };
  }

  function buildReport(metrics, reportInput) {
    const engineReport = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === "function"
      ? window.PlaylabReportEngine.buildReport(reportInput) : null;
    const summary = "이번 과제의 정오답과 실제 기록된 응답만 확인합니다. 미기록 반응시간은 추정하지 않으며, 게임 점수나 연령 설정으로 인지 기능·임상 상태를 판정하지 않습니다.";
    const observed = engineReport && engineReport.isObservedOnly ? engineReport : {
      isObservedOnly: true, reportEvidenceMode: "observed-only", reportScope: REPORT_SCOPE,
      title: LAB_TITLE, stageTitle: reportInput.stageTitle, originalReportInput: reportInput,
      reportDataQuality: { source: "live-input", missingMetrics: reportInput.avgQuestionMs === null ? ["avgQuestionMs"] : [] },
      integratedScore: null, axes: [], sortedAxes: [], roleNotes: [], recommendations: [], observationBenchmark: null,
      accuracyRate: reportInput.accuracyRate, firstTryRate: reportInput.firstTryRate,
      completionRate: reportInput.completionRate, avgQuestionMs: reportInput.avgQuestionMs,
      elapsedMs: reportInput.elapsedMs, band: { label: "수행 원기록", tone: "neutral" },
      headline: "확인된 수행 기록", briefOpinion: summary, longOpinion: summary,
      guardianSummary: summary, guardianLongSummary: "활동 조건과 관찰한 반응은 담당 선생님과 함께 확인해 주세요.",
      teacherReviewNote: summary, highlights: [
        { label: "전체 문항", value: String(reportInput.totalItems) },
        { label: "정답", value: String(reportInput.correctCount) },
        { label: "오답", value: String(reportInput.wrongCount) },
        { label: "정확도", value: `${reportInput.accuracyRate}%` }
      ]
    };
    const sample = reportInput.reactionTimeSample;
    const technicalHighlights = [
      { label: "반응시간 중앙값", value: formatReportReactionMs(sample.medianMs) },
      { label: "반응시간 IQR", value: formatReportReactionMs(sample.iqrMs) },
      { label: "유효 RT 표본", value: `${sample.included}/${sample.totalLogs} · ${sample.sampleLabel}` },
      { label: "RT 제외 표본", value: `${sample.excluded}개` },
      { label: "평균 반응시간(호환용)", value: formatReportReactionMs(sample.meanMs) }
    ];
    // The shared observed-only renderer hides these technical highlights in its
    // guardian audience; never replace its null axes with legacy game profiles.
    return Object.assign({}, observed, {
      highlights: technicalHighlights.filter((item) => !(observed.highlights || []).some((existing) => existing.label === item.label)).concat((observed.highlights || []).filter((item) => item.label !== "평균 반응시간")),
      reactionTimeSample: sample
    });
  }

  function renderResult(metrics, report, reportInput) {
    els.resultTitle.textContent = `${metrics.age.label} ${metrics.level.label} 완료`;
    els.resultSummary.textContent = `총 ${TOTAL_ROUNDS}문항에서 정답 ${metrics.correct}개, 오경보 ${metrics.commission}회, 미반응 ${metrics.miss}회가 기록되었습니다.`;
    els.resultStats.innerHTML = [
      ["정답 여부", `${metrics.correct}/${TOTAL_ROUNDS}`],
      ["게임 점수(임상 지표 아님)", `${metrics.integratedScore}점`],
      ["반응시간 중앙값", formatReportReactionMs(reportInput.reactionTimeSample.medianMs)],
      ["반응시간 IQR", formatReportReactionMs(reportInput.reactionTimeSample.iqrMs)],
      ["유효 RT 표본", `${reportInput.reactionTimeSample.included}/${reportInput.reactionTimeSample.totalLogs}`],
      ["평균 반응시간(호환용)", formatReportReactionMs(reportInput.reactionTimeSample.meanMs)],
      ["억제 성공률", `${metrics.inhibitionRate}%`],
      ["오경보", `${metrics.commission}회`],
      ["예측 반응", `${metrics.anticipatory}회`]
    ].map(([label, value]) => `<div class="traffic-stat"><span>${label}</span><strong>${value}</strong></div>`).join("");

    els.professionalReport.innerHTML = report && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === "function"
      ? window.PlaylabReportEngine.renderHtml(report, { variant: "standalone" })
      : `<p>${report.briefOpinion}</p>`;

    saveReports(reportInput, report, metrics);
    setScreen("result");
  }

  function finishGame() {
    stopRoundTimers();
    setSignal("idle");
    const metrics = getMetrics();
    const reportInput = buildReportInput(metrics);
    const report = buildReport(metrics, reportInput);
    renderResult(metrics, report, reportInput);
  }

  function recommendationLines(report) {
    return (report && Array.isArray(report.recommendations) ? report.recommendations : []).map((item) => {
      const title = String(item.title || "").trim();
      const desc = String(item.desc || "").trim();
      return title && desc ? `${title}: ${desc}` : (title || desc);
    }).filter(Boolean);
  }

  function getAxisAverage(report, ids) {
    const axes = report && Array.isArray(report.axes) ? report.axes : [];
    const values = ids.map((id) => axes.find((axis) => axis.id === id)).filter(Boolean).map((axis) => Number(axis.score || 0)).filter((value) => value > 0);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  }

  function buildRehabDualModeFields({ report, metrics } = {}) {
    const guardianSummary = report.guardianSummary || "이번 재활 활동에서는 신호 기반 억제 제어 과제의 참여 흐름과 반응 양상이 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.";
    const teacherReviewNote = report.teacherReviewNote || "RehabLab 결과는 반응 정확도, 반응 속도, 오류 패턴, 자기조절 흐름을 함께 보는 전문 참고 기록입니다. 다음 활동과 난이도는 담당 선생님이 내담자의 컨디션과 수업 맥락을 함께 확인해 조정합니다.";
    const actionPlanSummary = "다음 재활 활동은 자동 확정하지 않고 선생님 검토 후 조정합니다.";
    return {
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      actionPlanPolicy: "teacher-review-required",
      reportDisplayModes: {
        guardian: { label: "보호자 공유", summary: guardianSummary },
        teacher: { label: "전문가 분석", summary: teacherReviewNote }
      }
    };
  }

  function buildReportPayload(reportInput, report, metrics) {
    const score = Number(report.integratedScore || metrics.integratedScore || 0) || 0;
    const dualModeFields = buildRehabDualModeFields({ report, metrics });
    return {
      labKind: REPORT_SCOPE,
      reportScope: REPORT_SCOPE,
      sessionId: reportInput.sessionId,
      curriculumKey: "rehablab-traffic-go-nogo",
      stageKey: `${state.ageKey}-${state.levelId}`,
      stageTitle: `${metrics.age.label} ${metrics.level.label}`,
      labTitle: LAB_TITLE,
      totalQuestions: TOTAL_ROUNDS,
      correctCount: metrics.correct,
      wrongCount: metrics.wrong,
      score,
      accuracyScore: metrics.accuracyRate,
      durationSeconds: metrics.elapsedMs / 1000,
      startedAtMs: state.startedAtMs,
      reportType: "rehablab-traffic-go-nogo",
      reportInput,
      scoreKind: "legacy-game-points-not-clinical",
      reportEvidenceMode: "observed-only",
      briefOpinion: report.briefOpinion,
      guardianSummary: dualModeFields.guardianSummary,
      teacherReviewNote: dualModeFields.teacherReviewNote,
      actionPlanSummary: dualModeFields.actionPlanSummary,
      actionPlanPolicy: dualModeFields.actionPlanPolicy,
      reportDisplayModes: dualModeFields.reportDisplayModes,
      overview: report.longOpinion,
      recommendations: recommendationLines(report),
      cognitiveScore: null,
      reactionScore: null,
      focusKey: "go-nogo-inhibitory-control",
      focusLabel: "신호 기반 억제 제어",
      details: {
        session_id: reportInput.sessionId,
        report_headline: String(report.headline || "").trim(),
        report_integrated_score: null,
        legacy_game_score: score,
        report_evidence_mode: "observed-only",
        reaction_time_sample: reportInput.reactionTimeSample,
        report_metric_provenance: { cognitive: "unavailable", reaction: "unavailable", integrated: "unavailable", reactionTime: reportInput.reactionTimeSample.included ? "observed-trial-sample" : "unavailable" },
        report_guardian_summary: dualModeFields.guardianSummary,
        report_teacher_review_note: dualModeFields.teacherReviewNote,
        report_action_plan_summary: dualModeFields.actionPlanSummary,
        report_action_plan_policy: dualModeFields.actionPlanPolicy,
        report_display_modes: dualModeFields.reportDisplayModes,
        report_axes: Array.isArray(report.axes) ? report.axes.map((axis) => ({
          id: String(axis.id || "").trim(),
          label: String(axis.label || "").trim(),
          score: Number(axis.score || 0) || 0
        })) : [],
        report_domain: "Go/No-Go 억제 제어 및 안전 판단",
        age_group: state.ageKey,
        age_group_label: metrics.age.label,
        age_range: metrics.age.range,
        level_id: metrics.level.id,
        level_label: metrics.level.label,
        level_speed_ms: metrics.level.speed,
        go_rate: metrics.level.goRate,
        hit_count: metrics.hit,
        miss_count: metrics.miss,
        hold_count: metrics.hold,
        commission_count: metrics.commission,
        anticipatory_count: metrics.anticipatory,
        inhibition_rate: metrics.inhibitionRate,
        go_accuracy: metrics.goAccuracy,
        avg_reaction_ms: reportInput.avgQuestionMs,
        game_avg_reaction_ms: metrics.avgReactionMs,
        question_logs: metrics.logs
      },
      metadata: {
        session_id: reportInput.sessionId,
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_integrated_score: null,
        legacy_game_score: score,
        report_evidence_mode: "observed-only",
        reaction_time_sample: reportInput.reactionTimeSample,
        report_metric_provenance: { cognitive: "unavailable", reaction: "unavailable", integrated: "unavailable", reactionTime: reportInput.reactionTimeSample.included ? "observed-trial-sample" : "unavailable" },
        report_cognitive_score: null,
        report_reaction_score: null,
        report_guardian_summary: dualModeFields.guardianSummary,
        report_teacher_review_note: dualModeFields.teacherReviewNote,
        report_action_plan_summary: dualModeFields.actionPlanSummary,
        report_action_plan_policy: dualModeFields.actionPlanPolicy,
        report_display_modes: dualModeFields.reportDisplayModes
      }
    };
  }

  function saveReports(reportInput, report, metrics) {
    if (state.savedRunId) return;
    state.savedRunId = `saved-${Date.now()}`;
    const payload = buildReportPayload(reportInput, report, metrics);
    const harnessRecord = window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === "function"
      ? window.HahaLabLearningHarness.recordSession(payload)
      : null;
    if (!harnessRecord) saveSupabaseReport(payload, reportInput, report, metrics);
  }

  function parseMaybeJson(value, fallback) {
    if (!value) return fallback;
    if (typeof value === "object") return value;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function readLaunchContext() {
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.readLaunchContext === "function") {
      return window.HahaLabLearningHarness.readLaunchContext();
    }
    return null;
  }

  async function getSupabaseClient() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") return null;
    if (!window.__trafficSupabaseClient) {
      window.__trafficSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return window.__trafficSupabaseClient;
  }

  async function saveSupabaseReport(payload, reportInput, report, metrics) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = await getSupabaseClient();
    if (!client) return { skipped: true };
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(state.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(metrics.elapsedMs / 60000));
    const details = Object.assign({
      report_scope: REPORT_SCOPE,
      lab_scope: REPORT_SCOPE,
      lab_label: "재활랩",
      lab_title: LAB_TITLE,
      game_name: LAB_TITLE,
      report_title: payload.stageTitle,
      category_title: LAB_TITLE,
      stage_id: payload.stageKey,
      stage_title: payload.stageTitle,
      score: payload.score,
      accuracy_score: payload.accuracyScore,
      correct_count: payload.correctCount,
      wrong_count: payload.wrongCount,
      total_questions: payload.totalQuestions,
      duration_minutes: durationMinutes,
      completed_at: completedAt,
      started_at: startedAt,
      report_type: payload.reportType,
      report_input: reportInput,
      report_integrated_score: Number(report.integratedScore || 0) || 0,
      report_headline: String(report.headline || "").trim(),
      report_brief_opinion: payload.briefOpinion,
      report_overview: payload.overview,
      report_recommendations: payload.recommendations,
      report_axes: payload.details.report_axes,
      report_cognitive_score: payload.cognitiveScore,
      report_reaction_score: payload.reactionScore,
      report_focus_key: payload.focusKey,
      report_focus_label: payload.focusLabel,
      source_page: String(window.location.pathname || "").split("/").pop() || "rehablab-traffic-go-nogo.html"
    }, payload.details);
    const row = {
      teacher_id: String(launchContext.teacherId || "").trim(),
      client_id: String(launchContext.clientId || "").trim(),
      client_name: String(launchContext.clientName || "").trim(),
      type: String(launchContext.clientType || "client").trim() || "client",
      category: "session_history",
      action: LAB_SESSION_COMPLETION_ACTION,
      action_type: LAB_TITLE,
      event_datetime: completedAt,
      start_datetime: startedAt,
      end_datetime: completedAt,
      duration: `${durationMinutes} minutes`,
      duration_minutes: durationMinutes,
      details: JSON.stringify(details),
      metadata: Object.assign({
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_integrated_score: details.report_integrated_score,
        report_cognitive_score: details.report_cognitive_score,
        report_reaction_score: details.report_reaction_score,
        duration_minutes: durationMinutes,
        duration: `${durationMinutes} minutes`
      }, parseMaybeJson(payload.metadata, {})),
      memo: payload.stageTitle || LAB_TITLE
    };
    try {
      const result = await client.from("histories").insert(row);
      if (result && result.error) throw result.error;
      return result;
    } catch (error) {
      console.error("[rehablab-traffic-go-nogo] history save failed:", error);
      return { error };
    }
  }

  function initThree() {
    if (three.initialized) {
      resizeThree();
      return;
    }
    three.canvas = els.trafficCanvas;
    three.scene = new THREE.Scene();
    three.scene.background = new THREE.Color(0xc9f0ff);
    const wrap = three.canvas.parentElement;
    const width = Math.max(640, wrap.clientWidth);
    const height = Math.max(420, wrap.clientHeight);
    three.camera = new THREE.OrthographicCamera(-180, 180, 120, -120, 0.1, 1000);
    configureTrafficCamera(width, height);
    three.renderer = new THREE.WebGLRenderer({ canvas: three.canvas, antialias: true, alpha: false });
    three.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    three.renderer.setSize(width, height, false);
    three.renderer.shadowMap.enabled = true;
    three.clock = new THREE.Clock();

    three.scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const light = new THREE.DirectionalLight(0xffffff, 1.6);
    light.position.set(-180, -220, 300);
    light.castShadow = true;
    three.scene.add(light);

    buildTrafficScene();
    three.initialized = true;
    window.addEventListener("resize", resizeThree);
    three.renderer.setAnimationLoop(animateThree);
  }

  function resizeThree() {
    if (!three.renderer || !three.canvas) return;
    const wrap = three.canvas.parentElement;
    const width = Math.max(640, wrap.clientWidth);
    const height = Math.max(420, wrap.clientHeight);
    three.renderer.setSize(width, height, false);
    configureTrafficCamera(width, height);
  }

  function configureTrafficCamera(width, height) {
    if (!three.camera) return;
    const size = 300;
    const viewRatio = width / Math.max(1, height);
    const cameraWidth = viewRatio < 1 ? size : size * viewRatio;
    const cameraHeight = viewRatio < 1 ? size / viewRatio : size;
    three.camera.left = cameraWidth / -2;
    three.camera.right = cameraWidth / 2;
    three.camera.top = cameraHeight / 2;
    three.camera.bottom = cameraHeight / -2;
    three.camera.near = 100;
    three.camera.far = 900;
    three.camera.up.set(0, 0, 1);
    three.camera.position.set(300, -300, 300);
    three.camera.lookAt(0, 0, 0);
    three.camera.updateProjectionMatrix();
  }

  function material(color) {
    return new THREE.MeshLambertMaterial({ color, flatShading: true });
  }

  function addBox(name, size, position, color) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material(color));
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    three.scene.add(mesh);
    return mesh;
  }

  function buildTrafficScene() {
    addBox("grass-left", [380, 80, 4], [0, -90, -2], 0xbaf455);
    addBox("grass-right", [380, 80, 4], [0, 90, -2], 0xbaf455);
    addBox("road", [380, 118, 5], [0, 0, 0], 0x3f4655);
    addBox("sidewalk-a", [380, 18, 6], [0, -68, 2], 0xd6dbe1);
    addBox("sidewalk-b", [380, 18, 6], [0, 68, 2], 0xd6dbe1);
    for (let y = -42; y <= 42; y += 21) {
      addBox(`crosswalk-${y}`, [118, 11, 7], [0, y, 4], 0xffffff);
    }
    for (let x = -150; x <= 150; x += 90) {
      addBox(`lane-${x}`, [38, 4, 8], [x, 0, 7], 0xffd447);
    }
    buildCars();
    buildSignalPost();
    buildCharacter();
  }

  function buildCars() {
    three.cars = [];
    const laneMinX = -240;
    const laneMaxX = 240;
    const laneSpan = laneMaxX - laneMinX;
    const cars = [
      { offset: 0, y: -36, color: 0xef4444, speed: 52, direction: 1 },
      { offset: 160, y: -36, color: 0xf59e0b, speed: 52, direction: 1 },
      { offset: 320, y: -36, color: 0x3b82f6, speed: 52, direction: 1 },
      { offset: 0, y: 36, color: 0x22c55e, speed: 48, direction: -1 },
      { offset: 160, y: 36, color: 0xa855f7, speed: 48, direction: -1 },
      { offset: 320, y: 36, color: 0x0ea5e9, speed: 48, direction: -1 }
    ];
    cars.forEach((car) => {
      const group = new THREE.Group();
      const initialX = car.direction > 0
        ? laneMinX + car.offset
        : laneMaxX - car.offset;
      group.position.set(initialX, car.y, 8);
      if (car.direction < 0) group.rotation.z = Math.PI;
      const body = new THREE.Mesh(new THREE.BoxGeometry(48, 22, 14), material(car.color));
      body.position.z = 8;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(24, 18, 12), material(0xeaf6ff));
      cabin.position.set(-5, 0, 21);
      const wheelA = new THREE.Mesh(new THREE.BoxGeometry(9, 24, 9), material(0x1f2937));
      wheelA.position.set(-16, 0, 4);
      const wheelB = wheelA.clone();
      wheelB.position.x = 16;
      group.add(body, cabin, wheelA, wheelB);
      three.scene.add(group);
      three.cars.push({
        group,
        speed: car.speed,
        direction: car.direction,
        laneY: car.y,
        offset: car.offset,
        laneMinX,
        laneMaxX,
        laneSpan
      });
    });
  }

  function clearCarsFromCrosswalk() {
    if (!three.cars.length) return;
    const rightMovingStops = [-230, -150, -90];
    const leftMovingStops = [230, 150, 90];
    let rightMovingIndex = 0;
    let leftMovingIndex = 0;
    three.cars.forEach((car) => {
      if (car.direction > 0) {
        car.group.position.x = rightMovingStops[rightMovingIndex % rightMovingStops.length];
        rightMovingIndex += 1;
      } else {
        car.group.position.x = leftMovingStops[leftMovingIndex % leftMovingStops.length];
        leftMovingIndex += 1;
      }
      car.group.position.y = car.laneY;
    });
  }

  function buildSignalPost() {
    addBox("signal-post", [8, 8, 84], [-130, -84, 42], 0x2f3a4a);
    addBox("signal-head", [28, 12, 52], [-130, -84, 94], 0x172033);
    three.trafficLight = {
      red: addBox("signal-red", [18, 14, 12], [-130, -84, 112], 0x3a1a1a),
      yellow: addBox("signal-yellow", [18, 14, 12], [-130, -84, 94], 0x3a321a),
      green: addBox("signal-green", [18, 14, 12], [-130, -84, 76], 0x123322)
    };
  }

  function buildCharacter() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(18, 15, 26), material(0xffffff));
    body.position.z = 18;
    const head = new THREE.Mesh(new THREE.BoxGeometry(16, 16, 16), material(0xffd6a5));
    head.position.z = 40;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(18, 18, 5), material(0x0f6fbd));
    cap.position.z = 50;
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 22), material(0xffc48f));
    leftArm.position.set(-13, 0, 22);
    leftArm.rotation.y = 0.2;
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 22), material(0xffc48f));
    rightArm.position.set(13, 0, 22);
    rightArm.rotation.y = -0.2;
    const bag = new THREE.Mesh(new THREE.BoxGeometry(8, 18, 18), material(0xffb703));
    bag.position.set(-12, 0, 23);
    group.add(leftArm, rightArm, body, head, cap, bag);
    group.rotation.z = 0;
    three.character = group;
    three.characterBody = body;
    three.scene.add(group);
    resetCharacter();
  }

  function resetCharacter() {
    if (!three.character) return;
    three.character.position.set(0, -82, 8);
    three.character.rotation.z = 0;
  }

  function shakeCharacter() {
    if (!three.character) return;
    const start = Date.now();
    const originalX = three.character.position.x;
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      three.character.position.x = originalX + Math.sin(elapsed / 24) * 5;
      if (elapsed > 360) {
        window.clearInterval(timer);
        three.character.position.x = originalX;
      }
    }, 16);
  }

  function updateSignalMesh() {
    if (!three.trafficLight) return;
    const active = state.signal;
    three.trafficLight.red.material.color.setHex(active === "red" ? 0xff2222 : 0x3a1a1a);
    three.trafficLight.yellow.material.color.setHex(active === "yellow" ? 0xffc928 : 0x3a321a);
    three.trafficLight.green.material.color.setHex(active === "green" ? 0x18d472 : 0x123322);
  }

  function animateThree() {
    const delta = three.clock ? three.clock.getDelta() : 0;
    updateSignalMesh();
    animateCars(delta);
    if (state.crossing && three.character) {
      const duration = 720;
      const progress = clamp((Date.now() - state.crossingStartMs) / duration, 0, 1);
      three.character.position.y = -82 + (164 * progress);
      three.character.position.z = 8 + Math.sin(progress * Math.PI * 8) * 4;
      if (progress >= 1) completeCrossing();
    }
    if (three.renderer && three.scene && three.camera) three.renderer.render(three.scene, three.camera);
  }

  function animateCars(delta) {
    if (!three.cars.length || !delta) return;
    const shouldMove = state.signal !== "green";
    if (!shouldMove) return;
    three.cars.forEach((car) => {
      car.group.position.x += car.direction * car.speed * delta;
      if (car.direction > 0 && car.group.position.x > car.laneMaxX) {
        car.group.position.x -= car.laneSpan;
      }
      if (car.direction < 0 && car.group.position.x < car.laneMinX) {
        car.group.position.x += car.laneSpan;
      }
    });
  }

  function openHelp() {
    els.helpModal.classList.add("is-open");
    els.helpModal.setAttribute("aria-hidden", "false");
  }

  function closeHelp() {
    els.helpModal.classList.remove("is-open");
    els.helpModal.setAttribute("aria-hidden", "true");
  }

  function bindEvents() {
    preloadCarHorn();
    document.querySelectorAll("[data-age]").forEach((button) => {
      button.addEventListener("click", () => {
        state.ageKey = button.dataset.age;
        updateMenuState();
      });
    });
    els.levelGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-level]");
      if (!button) return;
      state.levelId = button.dataset.level;
      updateMenuState();
    });
    els.startButton.addEventListener("click", startGame);
    els.crossButton.addEventListener("click", handleCrossAttempt);
    els.retryButton.addEventListener("click", startGame);
    els.menuButton.addEventListener("click", () => {
      stopAudio();
      setScreen("menu");
    });
    els.stageButton.addEventListener("click", () => {
      stopAudio();
      setScreen("menu");
    });
    els.helpButton.addEventListener("click", openHelp);
    els.helpClose.addEventListener("click", closeHelp);
    els.helpModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-close-modal]")) closeHelp();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeHelp();
      if (event.code === "Space" || event.key === "Enter") {
        if (els.gameView.classList.contains("is-active")) {
          event.preventDefault();
          handleCrossAttempt();
        }
      }
    });
  }

  function cacheElements() {
    [
      "menuView", "gameView", "resultView", "levelGrid", "startButton", "stageButton",
      "helpButton", "helpModal", "helpClose", "gameKicker", "gameTitle", "roundCounter",
      "trafficCanvas", "signalLabel", "trialTimer", "feedbackToast", "ruleText",
      "crossButton", "resultTitle", "resultSummary", "resultStats", "professionalReport",
      "retryButton", "menuButton"
    ].forEach((id) => { els[id] = $(id); });
  }

  function init() {
    cacheElements();
    renderLevels();
    bindEvents();
    updateMenuState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
