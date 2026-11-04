(function () {
  "use strict";

  const LAB_TITLE = "스트룹 색상-단어 간섭 훈련";
  const REPORT_SCOPE = "rehab";
  const SUPABASE_URL = "https://gxungzlecmibgvykoiib.supabase.co";
  const SUPABASE_KEY = "sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE";
  const LAB_SESSION_COMPLETION_ACTION = "게임 완료";
  const TOTAL_ROUNDS = 10;

  const AGE_GROUPS = {
    toddler: { label: "유아", range: "2-6세", maxTime: 4200, normProfile: "preschool", benchmarkMs: 2300 },
    child: { label: "초등", range: "7-12세", maxTime: 3600, normProfile: "lower-elementary", benchmarkMs: 1700 },
    teen: { label: "청소년", range: "13-17세", maxTime: 3000, normProfile: "upper-elementary", benchmarkMs: 1350 },
    adult: { label: "성인", range: "18-64세", maxTime: 2800, normProfile: "adult", benchmarkMs: 1150 },
    senior: { label: "고령자", range: "65세 이상", maxTime: 4200, normProfile: "senior", benchmarkMs: 2100 }
  };

  const COLORS = {
    red: { label: "빨강", css: "#FF0000", shadow: "#B80000", text: "#fff", button: "B1" },
    yellow: { label: "노랑", css: "#FFCE24", shadow: "#D99B00", text: "#14304d", button: "B0" },
    green: { label: "초록", css: "#20B970", shadow: "#12824C", text: "#fff", button: "B3" },
    blue: { label: "파랑", css: "#3478F6", shadow: "#1D4ED8", text: "#fff", button: "B2" },
    white: { label: "하양", css: "#F8FAFC", shadow: "#CBD5E1", text: "#14304d", button: "B4" },
    orange: { label: "검정", css: "#000000", shadow: "#000000", text: "#fff", button: "B5" },
    indigo: { label: "회색", css: "#94A3B8", shadow: "#64748B", text: "#14304d", button: "B6" },
    violet: { label: "보라", css: "#8B5CF6", shadow: "#6D28D9", text: "#fff", button: "B7" }
  };

  const JOYSTICK_ORDER = ["green", "blue", "white", "indigo", "red", "yellow", "orange", "violet"];
  const OPTION_SETS = {
    2: ["green", "blue"],
    4: ["green", "blue", "red", "yellow"],
    6: ["green", "blue", "white", "red", "yellow", "orange"]
  };

  const LEVELS = [
    { id: "lv1", index: 1, label: "색상 선택 안정화", mode: "ink", choices: 2, limitMs: 3200, desc: "두 가지 보기에서 글자색을 선택해요." },
    { id: "lv2", index: 2, label: "색상 선택 확장", mode: "ink", choices: 4, limitMs: 2800, desc: "네 가지 보기에서 글자색 선택을 유지해요." },
    { id: "lv3", index: 3, label: "색상 선택 고부하", mode: "ink", choices: 6, limitMs: 2400, desc: "여섯 가지 보기에서 글자색을 빠르게 구별해요." },
    { id: "lv4", index: 4, label: "의미 간섭 기초", mode: "meaning", choices: 2, limitMs: 3200, desc: "글자색을 무시하고 글자 의미를 선택해요." },
    { id: "lv5", index: 5, label: "의미 간섭 확장", mode: "meaning", choices: 4, limitMs: 2800, desc: "네 가지 보기에서 의미 기준을 유지해요." },
    { id: "lv6", index: 6, label: "의미 간섭 심화", mode: "meaning", choices: 6, limitMs: 2400, desc: "강한 간섭 조건에서 목표 기준을 유지해요." }
  ];

  const RESEARCH_NOTES = [
    "Stroop 색-단어 간섭 과제는 자동화된 읽기 반응과 목표 색상 선택 사이의 충돌을 이용해 선택적 주의와 억제 제어를 관찰하는 대표적 실행기능 과제입니다.",
    "아동·청소년에서는 ADHD 및 실행기능 관찰 맥락에서 반응 억제, 오류 모니터링, 처리속도 지표로 활용되며, 성인·고령자에서는 인지 억제와 처리속도 변화를 함께 해석합니다.",
    "본 리포트는 회기 내 훈련 수행을 구조화한 관찰 자료이며, 의학적 진단 또는 치료 판정을 대체하지 않습니다."
  ];
  const RESEARCH_REFERENCES = [
    {
      title: "Scarpina & Tagini, 2017. The Stroop Color and Word Test",
      url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00557/full"
    },
    {
      title: "Construct Validity of the Stroop Color-Word Test, 2020",
      url: "https://pubmed.ncbi.nlm.nih.gov/32514527/"
    },
    {
      title: "Meta-analysis of Stroop Color and Word Test with children, 2003",
      url: "https://www.sciencedirect.com/science/article/pii/S088761770300146X"
    }
  ];

  const els = {};
  const state = {
    ageKey: "",
    levelId: "",
    roundIndex: 0,
    current: null,
    startedAtMs: 0,
    roundStartMs: 0,
    savedRunId: "",
    locked: false,
    logs: [],
    gamepadButtons: new Set(),
    gamepadTimer: 0,
    timerFrame: 0,
    joystickConnected: false
  };

  const audioState = {
    context: null,
    current: null
  };

  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const round = (value) => Math.round(Number(value || 0));
  const percent = (value, total) => total ? Math.round((Number(value || 0) / total) * 100) : 0;
  const average = (items) => {
    const nums = items.map(Number).filter((value) => Number.isFinite(value) && value > 0);
    return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : 0;
  };

  function getSelectedAge() {
    return AGE_GROUPS[state.ageKey] || null;
  }

  function getSelectedLevel() {
    return LEVELS.find((item) => item.id === state.levelId) || null;
  }

  function setScreen(name) {
    ["menuView", "gameView", "resultView"].forEach((id) => {
      els[id].classList.toggle("is-active", id === `${name}View`);
    });
    els.stageButton.classList.toggle("stroop-hidden", name === "menu");
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === "function") {
      window.PlaylabReportEngine.setPdfButtonVisible(name === "result", {
        title: () => `${LAB_TITLE}-${getSelectedLevel()?.label || "리포트"}`
      });
    }
    if (name !== "game") stopTimerGauge();
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
        good: { freq: 760, end: 0.18, wave: "sine", gain: 0.11 },
        miss: { freq: 220, end: 0.22, wave: "square", gain: 0.08 },
        tick: { freq: 520, end: 0.08, wave: "sine", gain: 0.06 }
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
    window.setTimeout(() => els.feedbackToast.classList.remove("is-visible"), 760);
  }

  function startGame() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    if (!age || !level) return;
    state.roundIndex = 0;
    state.logs = [];
    state.savedRunId = "";
    state.startedAtMs = Date.now();
    state.locked = false;
    els.gameKicker.textContent = `${age.label} ${age.range} · ${level.label}`;
    setScreen("game");
    startGamepadPolling();
    startRound();
  }

  function makeTrial(level) {
    const options = OPTION_SETS[level.choices].slice();
    const targetKey = options[Math.floor(Math.random() * options.length)];
    let inkKey = targetKey;
    let meaningKey = targetKey;
    if (level.mode === "ink") {
      meaningKey = options[Math.floor(Math.random() * options.length)];
      if (options.length > 1 && meaningKey === inkKey) {
        meaningKey = options.find((key) => key !== inkKey) || meaningKey;
      }
    } else {
      meaningKey = targetKey;
      const candidates = options.filter((key) => key !== meaningKey);
      inkKey = candidates[Math.floor(Math.random() * candidates.length)] || meaningKey;
    }
    return {
      mode: level.mode,
      targetKey,
      inkKey,
      meaningKey,
      options,
      correctButton: COLORS[targetKey].button
    };
  }

  function startRound() {
    const level = getSelectedLevel();
    state.roundIndex += 1;
    state.locked = false;
    state.current = makeTrial(level);
    state.roundStartMs = Date.now();
    els.feedbackToast.textContent = "";
    els.feedbackToast.classList.remove("is-visible");
    els.feedbackToast.dataset.tone = "";
    els.roundCounter.textContent = `문항 ${state.roundIndex} / ${TOTAL_ROUNDS}`;
    els.taskRule.textContent = level.mode === "ink" ? "보이는 글자색을 고르세요" : "뜻이 가리키는 색을 고르세요";
    els.gameTitle.textContent = "색을 빠르게 선택해요";
    if (els.timerBar) {
      els.timerBar.style.transform = "scaleX(1)";
      els.timerBar.dataset.state = "ready";
    }
    renderStimulus();
    renderChoices();
    stopTimerGauge();
    state.timerFrame = window.requestAnimationFrame(updateTimerGauge);
  }

  function renderStimulus() {
    const current = state.current;
    if (!current) return;
    const ink = COLORS[current.inkKey];
    const meaning = COLORS[current.meaningKey];
    els.stimulusWord.textContent = meaning.label;
    els.stimulusWord.style.color = ink.css;
    els.stimulusWord.style.webkitTextStroke = current.inkKey === "white" ? "2px #14304d" : "0";
  }

  function renderChoices() {
    const current = state.current;
    if (!current) return;
    const active = new Set(current.options);
    els.choiceHint.textContent = "";
    els.choiceGrid.innerHTML = JOYSTICK_ORDER.map((key) => {
      const color = COLORS[key];
      const disabled = active.has(key) ? "" : "disabled";
      return `<button type="button" class="stroop-choice-button" data-color="${key}" data-key="${color.button}" ${disabled}
        style="--choice-color:${color.css}; --choice-shadow:${color.shadow}; --choice-text:${color.text};"
        aria-label="${color.label}"></button>`;
    }).join("");
  }

  function handleChoice(colorKey, source) {
    if (state.locked || !state.current || !els.gameView.classList.contains("is-active")) return;
    if (!state.current.options.includes(colorKey)) return;
    state.locked = true;
    stopTimerGauge();
    const reactionMs = Date.now() - state.roundStartMs;
    const level = getSelectedLevel();
    const age = getSelectedAge();
    const correct = colorKey === state.current.targetKey;
    const overtime = reactionMs > Math.min(age.maxTime, level.limitMs);
    const outcome = correct && !overtime ? "CORRECT" : (correct ? "LATE_CORRECT" : "ERROR");
    state.logs.push({
      round: state.roundIndex,
      mode: level.mode,
      choices: level.choices,
      targetKey: state.current.targetKey,
      selectedKey: colorKey,
      inkKey: state.current.inkKey,
      meaningKey: state.current.meaningKey,
      correct,
      overtime,
      outcome,
      reactionMs: round(reactionMs),
      source: source || "screen",
      ageGroup: state.ageKey,
      level: state.levelId
    });
    animateChoice(colorKey);
    playTone(correct && !overtime ? "good" : "miss");
    animateStimulus(correct && !overtime);
    showToast(correct && !overtime ? "정확해요" : (overtime ? "조금 늦었어요" : "다시 확인해요"), correct && !overtime ? "good" : "warn");
    window.setTimeout(() => {
      if (state.roundIndex >= TOTAL_ROUNDS) finishGame();
      else startRound();
    }, 760);
  }

  function animateChoice(colorKey) {
    const button = els.choiceGrid.querySelector(`[data-color="${colorKey}"]`);
    if (!button) return;
    button.classList.add("is-pressed");
    window.setTimeout(() => button.classList.remove("is-pressed"), 180);
  }

  function animateStimulus(good) {
    const card = document.querySelector(".stroop-stimulus-card");
    if (!card) return;
    card.classList.remove("is-good", "is-warn");
    void card.offsetWidth;
    card.classList.add(good ? "is-good" : "is-warn");
  }

  function stopTimerGauge() {
    window.cancelAnimationFrame(state.timerFrame);
    state.timerFrame = 0;
  }

  function getRoundLimitMs() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    if (!age || !level) return 0;
    return Math.min(age.maxTime, level.limitMs);
  }

  function updateTimerGauge() {
    const limitMs = getRoundLimitMs();
    if (!els.timerBar || !limitMs || state.locked || !els.gameView.classList.contains("is-active")) return;
    const elapsed = Date.now() - state.roundStartMs;
    const ratio = clamp(1 - (elapsed / limitMs), 0, 1);
    els.timerBar.style.transform = `scaleX(${ratio})`;
    els.timerBar.dataset.state = ratio < 0.25 ? "danger" : (ratio < 0.5 ? "warn" : "ready");
    if (ratio > 0) state.timerFrame = window.requestAnimationFrame(updateTimerGauge);
  }

  function getMetrics() {
    const logs = state.logs.slice();
    const correctCount = logs.filter((item) => item.correct && !item.overtime).length;
    const lateCorrect = logs.filter((item) => item.correct && item.overtime).length;
    const avgReactionMs = average(logs.map((item) => item.reactionMs));
    const correctAvgMs = average(logs.filter((item) => item.correct).map((item) => item.reactionMs));
    const errorCount = logs.filter((item) => !item.correct).length;
    const wrongCount = errorCount;
    const interferenceErrors = logs.filter((item) => item.mode === "meaning" && !item.correct).length;
    const inkErrors = logs.filter((item) => item.mode === "ink" && !item.correct).length;
    const joystickCount = logs.filter((item) => item.source === "gamepad" || item.source === "keyboard").length;
    const accuracyRate = percent(correctCount, logs.length || TOTAL_ROUNDS);
    const rawAccuracyRate = percent(logs.filter((item) => item.correct).length, logs.length || TOTAL_ROUNDS);
    const age = getSelectedAge();
    const level = getSelectedLevel();
    const speedScore = avgReactionMs
      ? clamp(round(100 - Math.max(0, avgReactionMs - age.benchmarkMs) / 22), 25, 100)
      : 45;
    const inhibitionScore = clamp(round((accuracyRate * 0.65) + Math.max(0, 100 - interferenceErrors * 14 - errorCount * 8) * 0.35), 20, 100);
    const selectiveAttentionScore = clamp(round((accuracyRate * 0.58) + (speedScore * 0.22) + Math.max(0, 100 - lateCorrect * 12) * 0.2), 20, 100);
    const processingScore = clamp(round((speedScore * 0.7) + (rawAccuracyRate * 0.3)), 20, 100);
    const ruleMaintenanceScore = clamp(round(100 - errorCount * 12 - lateCorrect * 8 + (level.choices - 2) * 3), 20, 100);
    const integratedScore = clamp(round((accuracyRate * 0.36) + (inhibitionScore * 0.26) + (selectiveAttentionScore * 0.2) + (processingScore * 0.18)), 0, 100);
    return {
      logs,
      correctCount,
      lateCorrect,
      wrongCount,
      errorCount,
      interferenceErrors,
      inkErrors,
      joystickCount,
      avgReactionMs,
      correctAvgMs,
      accuracyRate,
      rawAccuracyRate,
      speedScore,
      inhibitionScore,
      selectiveAttentionScore,
      processingScore,
      ruleMaintenanceScore,
      integratedScore,
      age,
      level,
      elapsedMs: Date.now() - state.startedAtMs
    };
  }

  function getClinicalFeedback(metrics) {
    if (state.ageKey === "toddler") {
      return metrics.errorCount > 3
        ? "유아 기준에서는 색 이름 읽기와 색상 선택 사이의 간섭 부담이 크게 나타났습니다. 보기 수를 줄이고 손가락으로 목표 색을 짚은 뒤 누르는 방식이 적절합니다."
        : "유아 기준에서는 목표 기준을 비교적 안정적으로 유지했습니다. 놀이 맥락에서 색 이름 말하기와 버튼 선택을 짧게 반복하면 도움이 됩니다.";
    }
    if (state.ageKey === "child" || state.ageKey === "teen") {
      return metrics.interferenceErrors > 1
        ? "학령기 기준에서는 글자 의미 또는 글자색에 자동적으로 끌리는 오류가 관찰됩니다. 문제마다 '색을 볼지, 뜻을 볼지'를 먼저 말하게 하는 자기지시 훈련이 권장됩니다."
        : "학령기 기준에서는 선택적 주의와 간섭 억제 유지가 양호하게 관찰됩니다. 보기 수를 늘려도 규칙 유지가 안정적인지 이어서 확인할 수 있습니다.";
    }
    if (state.ageKey === "adult") {
      return metrics.avgReactionMs > metrics.age.benchmarkMs * 1.45 || metrics.errorCount > 2
        ? "성인 기준에서는 처리속도 저하 또는 간섭 조건에서의 조급 선택이 관찰됩니다. 반응 전 기준 확인 루틴을 고정하고 피로도에 따른 변동을 함께 보세요."
        : "성인 기준에서는 색-단어 간섭 상황에서도 목표 기준 유지와 반응 선택이 안정적으로 관찰됩니다.";
    }
    if (state.ageKey === "senior") {
      return metrics.accuracyRate < 70 || metrics.avgReactionMs > metrics.age.benchmarkMs * 1.5
        ? "고령자 기준에서는 간섭 억제와 처리속도 부담이 함께 높아진 양상입니다. 낮은 보기 수에서 충분한 시간으로 반복 관찰하는 접근이 필요합니다."
        : "고령자 기준에서는 정상 노화 범위에서 기대할 수 있는 선택적 주의와 색-단어 간섭 억제가 비교적 유지됩니다.";
    }
    return "색-단어 간섭 조건에서 목표 기준 유지와 반응 선택을 함께 관찰했습니다.";
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
    const correctGoOnly = false;
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
        responseWindowMs: item.limitMs ?? Math.min(metrics.age.maxTime, metrics.level.limitMs),
        correct: item.correct && !item.overtime,
        taskCriterionMet: item.correct && !item.overtime,
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
      lateCorrectCount: metrics.lateCorrect,
      stroopResponseCategories: { withinTimeCorrect: metrics.correctCount, wrongChoice: metrics.wrongCount, lateCorrect: metrics.lateCorrect, total: TOTAL_ROUNDS },
      responseCountBreakdown: { onTimeCorrect: metrics.correctCount, incorrectChoice: metrics.errorCount, lateCorrect: metrics.lateCorrect, total: metrics.logs.length },
      correctCountDefinition: "correct choice within the existing game response window",
      wrongCountDefinition: "incorrect choice only; late-correct is a separate category",
      gameScore: metrics.integratedScore,
      gameScoreKind: "legacy-game-points-not-clinical",
      reportType: "rehablab-stroop-color-word",
      reportProfile: "stroop-interference-control",
      reportProfileLabel: "색-단어 간섭 억제",
      normProfile: metrics.age.normProfile,
      normProfileLabel: `${metrics.age.label} ${metrics.age.range} 게임 설정 · 규준 아님`,
      stageTitle: `${metrics.age.label} · ${metrics.level.label}`,
      categoryTitle: LAB_TITLE,
      totalItems: TOTAL_ROUNDS,
      totalQuestions: TOTAL_ROUNDS,
      correctCount: metrics.correctCount,
      wrongCount: metrics.wrongCount,
      completionCount: TOTAL_ROUNDS,
      perfectCount: metrics.correctCount,
      accuracyRate: metrics.accuracyRate,
      completionRate: 100,
      firstTryRate: metrics.accuracyRate,
      avgQuestionMs: reactionSample.meanMs,
      elapsedMs: metrics.elapsedMs,
      benchmarkMs: null,
      gameConditions: { ageGroup: state.ageKey, level: state.levelId, benchmarkMs: metrics.age.benchmarkMs, interpretation: "existing game setting; not validated clinical norm" },
      difficultyIndex: metrics.level.index / 6,
      replayCount: metrics.errorCount,
      visualReplayCount: metrics.lateCorrect,
      questionLogs,
      accentColor: "#2563eb"
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
    const factualSummary = `총 ${reportInput.totalItems}문항 중 시간 내 정답 ${metrics.correctCount}개, 오선택 ${metrics.errorCount}개, 정답 선택·시간 초과 ${metrics.lateCorrect}개로 기록되었습니다. 시간 내 정답률은 ${metrics.accuracyRate}%입니다. 과제 수행 기록이며 임상 상태나 인지 능력을 판정하지 않습니다.`;
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
      highlights: technicalHighlights.concat([
        { label: "시간 내 정답", value: String(metrics.correctCount) },
        { label: "오선택", value: String(metrics.errorCount) },
        { label: "정답 선택·시간 초과", value: String(metrics.lateCorrect) },
        { label: "시간 내 정답률", value: `${metrics.accuracyRate}%` }
      ]).filter((item) => !(observed.highlights || []).some((existing) => existing.label === item.label)).concat((observed.highlights || []).filter((item) => !["평균 반응시간", "정답", "오답", "정확도", "첫 시도 정답률"].includes(item.label))),
      briefOpinion: observed.stroopResponseCategories ? observed.briefOpinion : factualSummary,
      longOpinion: observed.stroopResponseCategories ? observed.longOpinion : factualSummary,
      guardianSummary: observed.stroopResponseCategories ? observed.guardianSummary : factualSummary,
      teacherReviewNote: observed.stroopResponseCategories ? observed.teacherReviewNote : `${factualSummary} 실제 선택한 늦은 응답도 RT 기술통계에 포함하며, 시간제한을 반응시간으로 대신 넣지 않습니다.`,
      reactionTimeSample: sample
    });
  }

  function renderResult(metrics, report, reportInput) {
    els.resultTitle.textContent = `${metrics.age.label} ${metrics.level.label} 완료`;
    els.resultSummary.textContent = `총 ${TOTAL_ROUNDS}문항에서 시간 내 정답 ${metrics.correctCount}개, 오선택 ${metrics.errorCount}개, 정답 선택·시간 초과 ${metrics.lateCorrect}개, 반응시간 중앙값 ${formatReportReactionMs(reportInput.reactionTimeSample.medianMs)}가 기록되었습니다.`;
    els.resultStats.innerHTML = [
      ["시간 내 정답", `${metrics.correctCount}/${TOTAL_ROUNDS}`],
      ["오선택", `${metrics.errorCount}개`],
      ["정답 선택·시간 초과", `${metrics.lateCorrect}개`],
      ["시간 내 정답률", `${metrics.accuracyRate}%`],
      ["게임 점수(임상 지표 아님)", `${metrics.integratedScore}점`],
      ["반응시간 중앙값", formatReportReactionMs(reportInput.reactionTimeSample.medianMs)],
      ["반응시간 IQR", formatReportReactionMs(reportInput.reactionTimeSample.iqrMs)],
      ["유효 RT 표본", `${reportInput.reactionTimeSample.included}/${reportInput.reactionTimeSample.totalLogs}`],
      ["평균 반응시간(호환용)", formatReportReactionMs(reportInput.reactionTimeSample.meanMs)],
      ["간섭 오류", `${metrics.interferenceErrors + metrics.inkErrors}회`],
      ["시간 초과", `${metrics.lateCorrect}회`],
      ["보기 색상", `${metrics.level.choices}개`]
    ].map(([label, value]) => `<div class="stroop-stat"><span>${label}</span><strong>${value}</strong></div>`).join("");

    const reportHtml = report && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === "function"
      ? window.PlaylabReportEngine.renderHtml(report, { variant: "standalone" })
      : `<p>${report.briefOpinion}</p>`;
    const referenceHtml = RESEARCH_REFERENCES.map((item) => `<a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>`).join("");
    const researchContext = report.isObservedOnly ? "아래 문헌은 과제 설계 참고자료이며, 이 게임의 연령 규준이나 진단 정확도가 검증되었다는 뜻은 아닙니다." : RESEARCH_NOTES.join(" ");
    els.professionalReport.innerHTML = `${reportHtml}<div class="stroop-research-note"><strong>과제 설계 참고:</strong> ${researchContext}<div class="stroop-reference-list">${referenceHtml}</div></div>`;
    saveReports(reportInput, report, metrics);
    setScreen("result");
  }

  function finishGame() {
    stopTimerGauge();
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
    const guardianSummary = report.guardianSummary || "이번 재활 활동에서는 색-단어 간섭 억제 과제의 참여 흐름과 반응 양상이 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.";
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
      curriculumKey: "rehablab-stroop-color-word",
      stageKey: `${state.ageKey}-${state.levelId}`,
      stageTitle: `${metrics.age.label} ${metrics.level.label}`,
      labTitle: LAB_TITLE,
      totalQuestions: TOTAL_ROUNDS,
      correctCount: metrics.correctCount,
      wrongCount: metrics.wrongCount,
      score,
      accuracyScore: metrics.accuracyRate,
      durationSeconds: metrics.elapsedMs / 1000,
      startedAtMs: state.startedAtMs,
      reportType: "rehablab-stroop-color-word",
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
      focusKey: "stroop-interference-control",
      focusLabel: "색-단어 간섭 억제",
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
        report_domain: "Stroop 색-단어 간섭 억제 및 선택적 주의",
        age_group: state.ageKey,
        age_group_label: metrics.age.label,
        age_range: metrics.age.range,
        level_id: metrics.level.id,
        level_label: metrics.level.label,
        task_mode: metrics.level.mode,
        option_count: metrics.level.choices,
        late_correct_count: metrics.lateCorrect,
        response_count_breakdown: reportInput.responseCountBreakdown,
        avg_reaction_ms: reportInput.avgQuestionMs,
        game_avg_reaction_ms: metrics.avgReactionMs,
        correct_avg_ms: metrics.correctAvgMs,
        late_correct_count: metrics.lateCorrect,
        interference_error_count: metrics.interferenceErrors,
        ink_error_count: metrics.inkErrors,
        research_notes: RESEARCH_NOTES,
        research_references: RESEARCH_REFERENCES,
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
    if (!window.__stroopSupabaseClient) {
      window.__stroopSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return window.__stroopSupabaseClient;
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
      source_page: String(window.location.pathname || "").split("/").pop() || "rehablab-stroop-color-word.html"
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
      console.error("[rehablab-stroop-color-word] history save failed:", error);
      return { error };
    }
  }

  function startGamepadPolling() {
    stopGamepadPolling();
    state.gamepadButtons.clear();
    state.gamepadTimer = window.setInterval(() => {
      const pads = typeof navigator.getGamepads === "function" ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      const pad = pads[0];
      if (!pad || !pad.buttons) return;
      for (let index = 0; index <= 7; index += 1) {
        const pressed = Boolean(pad.buttons[index] && pad.buttons[index].pressed);
        const key = `B${index}`;
        if (pressed && !state.gamepadButtons.has(key)) {
          state.gamepadButtons.add(key);
          handleJoystickKey(key, "gamepad");
        } else if (!pressed) {
          state.gamepadButtons.delete(key);
        }
      }
    }, 60);
  }

  function stopGamepadPolling() {
    window.clearInterval(state.gamepadTimer);
    state.gamepadTimer = 0;
  }

  function setJoystickConnected(source) {
    if (state.joystickConnected) return;
    state.joystickConnected = true;
    const text = source === "keyboard" ? "키보드 입력 연결됨" : "조이스틱 연결됨";
    [els.joystickStatus, els.gameJoystickStatus].filter(Boolean).forEach((item) => {
      item.classList.add("is-connected");
      const label = item.querySelector("strong");
      if (label) label.textContent = text;
    });
  }

  function handleJoystickKey(buttonKey, source) {
    setJoystickConnected(source);
    const colorKey = Object.keys(COLORS).find((key) => COLORS[key].button === buttonKey);
    if (colorKey) handleChoice(colorKey, source);
  }

  function bindEvents() {
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
    els.choiceGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-color]");
      if (!button || button.disabled) return;
      handleChoice(button.dataset.color, "screen");
    });
    els.startButton.addEventListener("click", startGame);
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
      const match = event.code.match(/^(Digit|Numpad)([0-7])$/);
      if (match) {
        event.preventDefault();
        handleJoystickKey(`B${match[2]}`, "keyboard");
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

  function cacheElements() {
    [
      "menuView", "gameView", "resultView", "levelGrid", "startButton", "stageButton",
      "helpButton", "helpModal", "helpClose", "gameKicker", "gameTitle", "roundCounter",
      "taskRule", "stimulusWord", "choiceGrid", "choiceHint", "feedbackToast", "joystickStatus", "gameJoystickStatus", "timerBar",
      "resultTitle", "resultSummary", "resultStats", "professionalReport",
      "retryButton", "menuButton"
    ].forEach((id) => { els[id] = $(id); });
  }

  function init() {
    cacheElements();
    renderLevels();
    bindEvents();
    updateMenuState();
    startGamepadPolling();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
