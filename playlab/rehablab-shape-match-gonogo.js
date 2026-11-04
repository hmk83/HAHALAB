(function () {
  "use strict";

  const LAB_TITLE = "도형 일치-반응 억제 훈련";
  const REPORT_TYPE = "rehablab-shape-match-gonogo";
  const REPORT_SCOPE = "rehab";
  const SUPABASE_URL = "https://gxungzlecmibgvykoiib.supabase.co";
  const SUPABASE_KEY = "sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE";
  const LAB_SESSION_COMPLETION_ACTION = "게임 완료";
  const TOTAL_ROUNDS = 12;

  const AGE_GROUPS = {
    toddler: {
      label: "유아",
      range: "4-6세",
      normProfile: "preschool",
      benchmarkMs: 1500,
      baseTimeMs: 3200,
      minTimeMs: 1550,
      maxTimeMs: 3800,
      shapes: ["circle", "square", "triangle"],
      patterns: ["solid", "outline"],
      speedWeight: 0.65,
      falseAlarmPenalty: 9,
      missPenalty: 7,
      rehabAllowance: 0.16
    },
    child: {
      label: "초등",
      range: "7-12세",
      normProfile: "lower-elementary",
      benchmarkMs: 1150,
      baseTimeMs: 2600,
      minTimeMs: 1200,
      maxTimeMs: 3300,
      shapes: ["circle", "square", "triangle", "pentagon", "diamond"],
      patterns: ["solid", "outline", "stripe", "dot"],
      speedWeight: 0.78,
      falseAlarmPenalty: 11,
      missPenalty: 8,
      rehabAllowance: 0.1
    },
    teen: {
      label: "청소년",
      range: "13-18세",
      normProfile: "upper-elementary",
      benchmarkMs: 950,
      baseTimeMs: 2200,
      minTimeMs: 950,
      maxTimeMs: 2900,
      shapes: ["circle", "square", "triangle", "pentagon", "hexagon", "star", "diamond"],
      patterns: ["solid", "outline", "stripe", "dot", "grid"],
      speedWeight: 0.9,
      falseAlarmPenalty: 12,
      missPenalty: 9,
      rehabAllowance: 0.06
    },
    adult: {
      label: "성인",
      range: "19-64세",
      normProfile: "adult",
      benchmarkMs: 1250,
      baseTimeMs: 2800,
      minTimeMs: 1250,
      maxTimeMs: 3600,
      shapes: ["circle", "square", "triangle", "pentagon", "hexagon", "star", "diamond"],
      patterns: ["solid", "outline", "stripe", "dot", "grid"],
      speedWeight: 0.72,
      falseAlarmPenalty: 10,
      missPenalty: 8,
      rehabAllowance: 0.14
    },
    senior: {
      label: "고령자",
      range: "65세 이상",
      normProfile: "senior",
      benchmarkMs: 1700,
      baseTimeMs: 3800,
      minTimeMs: 1650,
      maxTimeMs: 4400,
      shapes: ["circle", "square", "triangle", "hexagon", "pentagon", "diamond"],
      patterns: ["solid", "outline", "stripe", "dot"],
      speedWeight: 0.54,
      falseAlarmPenalty: 8,
      missPenalty: 6,
      rehabAllowance: 0.22
    }
  };

  const LEVELS = [
    { id: "lv1", index: 1, label: "기준 형성", timeRatio: 1, matchRate: 0.58, shapeCount: 3, patternCount: 1, rotationRate: 0, similarShapeRate: 0, desc: "모양 기준을 안정적으로 익혀요." },
    { id: "lv2", index: 2, label: "색 방해 억제", timeRatio: 0.9, matchRate: 0.54, shapeCount: 3, patternCount: 2, rotationRate: 0, similarShapeRate: 0, desc: "색이 달라도 모양을 먼저 봐요." },
    { id: "lv3", index: 3, label: "무늬 방해 억제", timeRatio: 0.8, matchRate: 0.5, shapeCount: 4, patternCount: 3, rotationRate: 0, similarShapeRate: 0, desc: "패턴 방해 속에서 모양 기준을 유지해요." },
    { id: "lv4", index: 4, label: "세부 변별", timeRatio: 0.68, matchRate: 0.46, shapeCount: 5, patternCount: 4, rotationRate: 0, similarShapeRate: 0.12, desc: "유사한 윤곽을 천천히 구분해요." },
    { id: "lv5", index: 5, label: "고부하 선택", timeRatio: 0.56, matchRate: 0.42, shapeCount: 6, patternCount: 5, rotationRate: 0, similarShapeRate: 0.24, desc: "짧은 시간에 반응과 억제를 선택해요." },
    { id: "lv6", index: 6, label: "임상 심화", timeRatio: 0.46, matchRate: 0.38, shapeCount: 7, patternCount: 5, rotationRate: 0.55, similarShapeRate: 0.38, desc: "각도 변화까지 포함해 정밀하게 판단해요." }
  ];

  const COLORS = ["#2563eb", "#f97316", "#14b8a6", "#7c3aed", "#ef4444", "#0f766e", "#f59e0b"];
  const STROKES = ["#0f172a", "#1e3a8a", "#7f1d1d", "#064e3b", "#4c1d95"];
  const SVG_NS = "http://www.w3.org/2000/svg";
  const JOYSTICK_BUTTON_COLORS = {
    0: "YELLOW",
    1: "RED",
    2: "BLUE",
    3: "GREEN",
    4: "WHITE",
    5: "ORANGE",
    6: "INDIGO",
    7: "VIOLET"
  };
  const JOYSTICK_RESPONSE_BUTTONS = new Set(Object.keys(JOYSTICK_BUTTON_COLORS).map(Number));
  const audioState = {
    context: null
  };

  const els = {};
  const state = {
    ageKey: "",
    levelId: "",
    roundIndex: 0,
    startedAtMs: 0,
    trialStartMs: 0,
    trialLimitMs: 0,
    trialTimer: 0,
    feedbackTimer: 0,
    rafId: 0,
    gamepadRafId: 0,
    pressedGamepadButtons: new Set(),
    joystickConnected: false,
    active: false,
    savedRunId: "",
    currentTrial: null,
    logs: []
  };

  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const round = (value) => Math.round(Number(value || 0));
  const percent = (value, total) => total ? Math.round((Number(value || 0) / total) * 100) : 0;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const average = (items) => {
    const nums = items.map(Number).filter((value) => Number.isFinite(value) && value > 0);
    return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : 0;
  };

  function setScreen(name) {
    ["menuView", "gameView", "resultView"].forEach((id) => {
      els[id].classList.toggle("is-active", id === `${name}View`);
    });
    els.stageButton.classList.toggle("shape-hidden", name === "menu");
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

  function getTrialLimitMs(age, level) {
    return clamp(round(age.baseTimeMs * level.timeRatio), age.minTimeMs || 900, age.maxTimeMs || 4200);
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

  function availableShapes(age, level) {
    return age.shapes.slice(0, Math.max(3, Math.min(age.shapes.length, level.shapeCount)));
  }

  function availablePatterns(age, level) {
    return age.patterns.slice(0, Math.max(1, Math.min(age.patterns.length, level.patternCount)));
  }

  function getShapeFamily(shape) {
    return shape === "diamond" ? "square" : shape;
  }

  function makeTrial() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    const shapes = availableShapes(age, level);
    const patterns = availablePatterns(age, level);
    const isMatch = Math.random() < level.matchRate;
    const baseShape = pick(shapes);
    const baseSize = 0.72 + (Math.random() * 0.12);
    const rightShape = isMatch ? baseShape : chooseDifferentShape(baseShape, shapes, level);
    const rightSize = isMatch ? clamp(baseSize + ((Math.random() - 0.5) * 0.18), 0.58, 0.9) : baseSize;

    const rotationAllowed = level.rotationRate > 0;
    const leftRotation = getShapeRotation(baseShape, rotationAllowed);
    const rightRotation = rotationAllowed && Math.random() < level.rotationRate
      ? getDifferentRotation(baseShape, leftRotation)
      : leftRotation;
    return {
      isMatch,
      left: makeShapeSpec(baseShape, baseSize, patterns, leftRotation),
      right: makeShapeSpec(rightShape, clamp(rightSize, 0.52, 0.9), patterns, rightRotation),
      interference: {
        rotated: rotationAllowed && leftRotation !== rightRotation,
        colorDiff: true,
        patternDiff: patterns.length > 1
      }
    };
  }

  function chooseDifferentShape(baseShape, shapes, level) {
    const baseFamily = getShapeFamily(baseShape);
    const candidates = shapes.filter((shape) => getShapeFamily(shape) !== baseFamily);
    const similarMap = {
      pentagon: ["hexagon"],
      hexagon: ["pentagon"]
    };
    const similarCandidates = (similarMap[baseShape] || []).filter((shape) => candidates.includes(shape));
    if (similarCandidates.length && Math.random() < Number(level.similarShapeRate || 0)) {
      return pick(similarCandidates);
    }
    const clearCandidates = candidates.filter((shape) => !(similarMap[baseShape] || []).includes(shape));
    return pick(clearCandidates.length ? clearCandidates : candidates);
  }

  function getShapeRotation(shape, rotationAllowed) {
    if (!rotationAllowed) return shape === "diamond" ? 45 : 0;
    if (shape === "circle") return 0;
    if (shape === "diamond") return pick([45, 0, 90]);
    return pick([0, 15, 30, 45, 60, 90]);
  }

  function getDifferentRotation(shape, currentRotation) {
    const candidates = shape === "circle"
      ? [0]
      : shape === "diamond"
        ? [45, 0, 90]
        : [0, 15, 30, 45, 60, 90];
    const filtered = candidates.filter((value) => value !== currentRotation);
    return filtered.length ? pick(filtered) : currentRotation;
  }

  function makeShapeSpec(shape, size, patterns, rotate) {
    const pattern = pick(patterns);
    return {
      shape,
      size,
      pattern,
      fill: pick(COLORS),
      stroke: pick(STROKES),
      outlineOnly: pattern === "outline" || Math.random() < 0.18,
      rotate
    };
  }

  function polygonPoints(sides, radius, cx, cy, startAngle) {
    const points = [];
    for (let index = 0; index < sides; index += 1) {
      const angle = startAngle + ((Math.PI * 2 * index) / sides);
      points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
    }
    return points.join(" ");
  }

  function starPoints(cx, cy, outer, inner) {
    const points = [];
    for (let index = 0; index < 10; index += 1) {
      const radius = index % 2 === 0 ? outer : inner;
      const angle = (-Math.PI / 2) + ((Math.PI * index) / 5);
      points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
    }
    return points.join(" ");
  }

  function createShapeElement(spec, index) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `${spec.shape} ${spec.pattern}`);
    const defs = document.createElementNS(SVG_NS, "defs");
    const patternId = `shapePattern-${state.roundIndex}-${index}-${spec.pattern}`;
    const pattern = document.createElementNS(SVG_NS, "pattern");
    pattern.setAttribute("id", patternId);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "18");
    pattern.setAttribute("height", "18");

    if (spec.pattern === "stripe") {
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("width", "18");
      rect.setAttribute("height", "18");
      rect.setAttribute("fill", spec.fill);
      const line = document.createElementNS(SVG_NS, "path");
      line.setAttribute("d", "M-4 18 L18 -4 M4 22 L22 4");
      line.setAttribute("stroke", "rgba(255,255,255,0.72)");
      line.setAttribute("stroke-width", "5");
      pattern.append(rect, line);
    } else if (spec.pattern === "dot") {
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("width", "18");
      rect.setAttribute("height", "18");
      rect.setAttribute("fill", spec.fill);
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", "9");
      dot.setAttribute("cy", "9");
      dot.setAttribute("r", "3.4");
      dot.setAttribute("fill", "rgba(255,255,255,0.78)");
      pattern.append(rect, dot);
    } else if (spec.pattern === "grid") {
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("width", "18");
      rect.setAttribute("height", "18");
      rect.setAttribute("fill", spec.fill);
      const grid = document.createElementNS(SVG_NS, "path");
      grid.setAttribute("d", "M0 9 H18 M9 0 V18");
      grid.setAttribute("stroke", "rgba(255,255,255,0.62)");
      grid.setAttribute("stroke-width", "2.5");
      pattern.append(rect, grid);
    }
    if (pattern.childNodes.length) {
      defs.append(pattern);
      svg.append(defs);
    }

    const size = 78 * spec.size;
    const cx = 100;
    const cy = 100;
    const attrs = {
      fill: spec.outlineOnly ? "rgba(255,255,255,0.18)" : pattern.childNodes.length ? `url(#${patternId})` : spec.fill,
      stroke: spec.stroke,
      "stroke-width": spec.outlineOnly ? "9" : "6",
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
      transform: `rotate(${spec.rotate} ${cx} ${cy})`
    };
    let shapeNode;
    if (spec.shape === "circle") {
      shapeNode = document.createElementNS(SVG_NS, "circle");
      shapeNode.setAttribute("cx", cx);
      shapeNode.setAttribute("cy", cy);
      shapeNode.setAttribute("r", size);
    } else if (spec.shape === "square" || spec.shape === "diamond") {
      shapeNode = document.createElementNS(SVG_NS, "rect");
      shapeNode.setAttribute("x", cx - size);
      shapeNode.setAttribute("y", cy - size);
      shapeNode.setAttribute("width", size * 2);
      shapeNode.setAttribute("height", size * 2);
      shapeNode.setAttribute("rx", spec.shape === "square" ? "4" : "0");
    } else if (spec.shape === "triangle") {
      shapeNode = document.createElementNS(SVG_NS, "polygon");
      shapeNode.setAttribute("points", polygonPoints(3, size * 1.14, cx, cy + 10, -Math.PI / 2));
    } else if (spec.shape === "pentagon") {
      shapeNode = document.createElementNS(SVG_NS, "polygon");
      shapeNode.setAttribute("points", polygonPoints(5, size * 1.08, cx, cy, -Math.PI / 2));
    } else if (spec.shape === "hexagon") {
      shapeNode = document.createElementNS(SVG_NS, "polygon");
      shapeNode.setAttribute("points", polygonPoints(6, size * 1.05, cx, cy, Math.PI / 6));
    } else {
      shapeNode = document.createElementNS(SVG_NS, "polygon");
      shapeNode.setAttribute("points", starPoints(cx, cy, size * 1.08, size * 0.52));
    }
    Object.entries(attrs).forEach(([key, value]) => shapeNode.setAttribute(key, value));
    svg.append(shapeNode);
    return svg;
  }

  function renderTrial(trial) {
    clearFeedbackEffect();
    els.leftShape.replaceChildren(createShapeElement(trial.left, "left"));
    els.rightShape.replaceChildren(createShapeElement(trial.right, "right"));
    els.gameView.dataset.trialType = trial.isMatch ? "match" : "nogo";
    els.matchButton.dataset.trialType = trial.isMatch ? "match" : "nogo";
    els.ruleText.textContent = "모양 기준";
  }

  function stopRoundTimers() {
    window.clearTimeout(state.trialTimer);
    window.clearTimeout(state.feedbackTimer);
    if (state.rafId) window.cancelAnimationFrame(state.rafId);
    state.trialTimer = 0;
    state.feedbackTimer = 0;
    state.rafId = 0;
    state.active = false;
  }

  function startGamepadLoop() {
    if (state.gamepadRafId) return;
    const poll = () => {
      pollGamepads();
      state.gamepadRafId = window.requestAnimationFrame(poll);
    };
    state.gamepadRafId = window.requestAnimationFrame(poll);
  }

  function stopGamepadLoop() {
    if (state.gamepadRafId) {
      window.cancelAnimationFrame(state.gamepadRafId);
      state.gamepadRafId = 0;
    }
    state.pressedGamepadButtons.clear();
  }

  function pollGamepads() {
    if (!navigator.getGamepads) return;
    const pads = Array.from(navigator.getGamepads()).filter(Boolean);
    if (pads.length) setJoystickConnected("gamepad");
    const currentlyPressed = new Set();
    pads.forEach((pad) => {
      pad.buttons.forEach((button, index) => {
        if (!JOYSTICK_RESPONSE_BUTTONS.has(index) || !button || !button.pressed) return;
        const key = `${pad.index}:${index}`;
        currentlyPressed.add(key);
        if (!state.pressedGamepadButtons.has(key)) handleJoystickPress(index);
      });
    });
    state.pressedGamepadButtons = currentlyPressed;
  }

  function setJoystickConnected(source) {
    state.joystickConnected = true;
    const label = source === "keyboard" ? "키보드 입력 연결됨" : "조이스틱 연결됨";
    [els.joystickStatus, els.gameJoystickStatus].filter(Boolean).forEach((status) => {
      status.classList.add("is-connected");
      const textNode = status.querySelector("strong");
      if (textNode) textNode.textContent = label;
    });
  }

  function handleJoystickPress(buttonIndex) {
    setJoystickConnected("gamepad");
    handleMatchClick({
      source: "gamepad",
      buttonIndex,
      color: JOYSTICK_BUTTON_COLORS[buttonIndex] || `B${buttonIndex}`
    });
  }

  function startGame() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    if (!age || !level) return;
    state.roundIndex = 0;
    state.logs = [];
    state.startedAtMs = Date.now();
    state.savedRunId = "";
    primeAudio();
    startGamepadLoop();
    els.gameKicker.textContent = `${age.label} ${age.range} · ${level.label}`;
    setScreen("game");
    window.setTimeout(startRound, 160);
  }

  function startRound() {
    stopRoundTimers();
    state.roundIndex += 1;
    const age = getSelectedAge();
    const level = getSelectedLevel();
    state.currentTrial = makeTrial();
    state.trialLimitMs = getTrialLimitMs(age, level);
    state.trialStartMs = Date.now();
    state.active = true;
    els.matchButton.disabled = false;
    els.roundCounter.textContent = `문항 ${state.roundIndex} / ${TOTAL_ROUNDS}`;
    renderTrial(state.currentTrial);
    updateTimerBar();
    state.trialTimer = window.setTimeout(() => {
      if (!state.active) return;
      if (state.currentTrial && state.currentTrial.isMatch) {
        endRound("MISS", state.trialLimitMs, "일치 도형을 놓쳤어요.", "watch", { source: "timeout" });
      } else {
        endRound("CORRECT_REJECT", state.trialLimitMs, "잘 참았어요.", "good", { source: "timeout" });
      }
    }, state.trialLimitMs);
  }

  function updateTimerBar() {
    if (!state.active) return;
    const elapsed = Date.now() - state.trialStartMs;
    const remain = clamp(state.trialLimitMs - elapsed, 0, state.trialLimitMs);
    const ratio = state.trialLimitMs ? remain / state.trialLimitMs : 0;
    els.timerBar.style.width = `${ratio * 100}%`;
    els.trialTimer.textContent = `${(remain / 1000).toFixed(1)}초`;
    if (remain <= state.trialLimitMs * 0.28) {
      els.timerBar.style.background = "linear-gradient(90deg, #ef4444, #f97316)";
    } else {
      els.timerBar.style.background = "linear-gradient(90deg, #22c55e, #14b8a6, #2563eb)";
    }
    if (remain > 0) state.rafId = window.requestAnimationFrame(updateTimerBar);
  }

  function handleMatchClick(inputInfo) {
    if (!state.active || !state.currentTrial) return;
    const reactionMs = Date.now() - state.trialStartMs;
    if (state.currentTrial.isMatch) {
      endRound("HIT", reactionMs, "정확하게 눌렀어요.", "good", inputInfo);
    } else {
      endRound("FALSE_ALARM", reactionMs, "다른 도형에서는 멈춰야 해요.", "watch", inputInfo);
    }
  }

  function endRound(outcome, reactionMs, message, tone, inputInfo) {
    if (!state.active) return;
    state.active = false;
    window.clearTimeout(state.trialTimer);
    if (state.rafId) window.cancelAnimationFrame(state.rafId);
    els.matchButton.disabled = true;
    els.timerBar.style.width = "0%";
    els.trialTimer.textContent = "0.0초";
    const correct = outcome === "HIT" || outcome === "CORRECT_REJECT";
    const trial = state.currentTrial || {};
    state.logs.push({
      round: state.roundIndex,
      outcome,
      correct,
      isMatch: Boolean(trial.isMatch),
      reactionMs: Math.max(0, round(reactionMs)),
      limitMs: state.trialLimitMs,
      inputSource: inputInfo && inputInfo.source ? inputInfo.source : "screen",
      inputKey: inputInfo && inputInfo.key ? inputInfo.key : "",
      joystickButtonIndex: inputInfo && Number.isFinite(Number(inputInfo.buttonIndex)) ? Number(inputInfo.buttonIndex) : null,
      joystickButtonColor: inputInfo && inputInfo.color ? String(inputInfo.color) : "",
      leftShape: trial.left && trial.left.shape,
      rightShape: trial.right && trial.right.shape,
      leftSize: trial.left && Number(trial.left.size || 0).toFixed(2),
      rightSize: trial.right && Number(trial.right.size || 0).toFixed(2),
      leftPattern: trial.left && trial.left.pattern,
      rightPattern: trial.right && trial.right.pattern,
      rotatedInterference: Boolean(trial.interference && trial.interference.rotated),
      leftRotation: trial.left && trial.left.rotate,
      rightRotation: trial.right && trial.right.rotate
    });
    playFeedbackSound(correct);
    playFeedbackEffect(correct ? "correct" : "wrong");
    showToast(message, tone);
    state.feedbackTimer = window.setTimeout(() => {
      if (state.roundIndex >= TOTAL_ROUNDS) finishGame();
      else startRound();
    }, correct ? 620 : 820);
  }

  function showToast(message, tone) {
    els.feedbackToast.textContent = message;
    els.feedbackToast.dataset.tone = tone || "";
    els.feedbackToast.classList.add("is-visible");
    window.clearTimeout(els.feedbackToast._timer);
    els.feedbackToast._timer = window.setTimeout(() => {
      els.feedbackToast.classList.remove("is-visible");
    }, 760);
  }

  function getAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioState.context) audioState.context = new AudioContext();
    return audioState.context;
  }

  function primeAudio() {
    const context = getAudioContext();
    if (context && context.state === "suspended") {
      context.resume().catch(() => {});
    }
  }

  function playFeedbackSound(isCorrect) {
    try {
      const context = getAudioContext();
      if (!context) return;
      if (context.state === "suspended") context.resume().catch(() => {});
      const now = context.currentTime;
      const gain = context.createGain();
      gain.connect(context.destination);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(isCorrect ? 0.12 : 0.1, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isCorrect ? 0.34 : 0.42));
      const freqs = isCorrect ? [660, 880] : [260, 185];
      freqs.forEach((freq, index) => {
        const osc = context.createOscillator();
        osc.type = isCorrect ? "sine" : "triangle";
        const start = now + (index * 0.12);
        osc.frequency.setValueAtTime(freq, start);
        osc.connect(gain);
        osc.start(start);
        osc.stop(start + 0.16);
      });
    } catch (_error) {}
  }

  function clearFeedbackEffect() {
    if (els.shapePair) {
      els.shapePair.classList.remove("is-correct", "is-wrong");
    }
    if (els.matchButton) {
      els.matchButton.classList.remove("is-correct", "is-wrong");
    }
  }

  function playFeedbackEffect(type) {
    clearFeedbackEffect();
    const className = type === "correct" ? "is-correct" : "is-wrong";
    els.shapePair.classList.add(className);
    els.matchButton.classList.add(className);
    window.setTimeout(clearFeedbackEffect, 520);
  }

  function getMetrics() {
    const logs = state.logs.slice();
    const hit = logs.filter((entry) => entry.outcome === "HIT").length;
    const miss = logs.filter((entry) => entry.outcome === "MISS").length;
    const hold = logs.filter((entry) => entry.outcome === "CORRECT_REJECT").length;
    const falseAlarm = logs.filter((entry) => entry.outcome === "FALSE_ALARM").length;
    const matchTotal = logs.filter((entry) => entry.isMatch).length;
    const noGoTotal = logs.filter((entry) => !entry.isMatch).length;
    const correct = hit + hold;
    const wrong = miss + falseAlarm;
    const avgReactionMs = round(average(logs.filter((entry) => entry.outcome === "HIT").map((entry) => entry.reactionMs)));
    const accuracyRate = percent(correct, TOTAL_ROUNDS);
    const matchAccuracy = percent(hit, matchTotal);
    const inhibitionRate = percent(hold, noGoTotal);
    const age = getSelectedAge();
    const level = getSelectedLevel();
    const rehabAllowance = Number(age.rehabAllowance || 0);
    const difficultyBonus = level.index * (1.4 + rehabAllowance);
    const adjustedAccuracy = clamp(round(accuracyRate + (rehabAllowance * 100 * 0.22)), 0, 100);
    const adjustedMatchAccuracy = clamp(round(matchAccuracy + (rehabAllowance * 100 * 0.18)), 0, 100);
    const adjustedInhibitionRate = clamp(round(inhibitionRate + (rehabAllowance * 100 * 0.2)), 0, 100);
    const speedScore = avgReactionMs
      ? clamp(round(76 + ((age.benchmarkMs - avgReactionMs) / age.benchmarkMs) * (24 * age.speedWeight) + difficultyBonus), 22, 100)
      : clamp(round(48 + (rehabAllowance * 32)), 22, 74);
    const discriminationScore = clamp(round((adjustedMatchAccuracy * 0.62) + (adjustedAccuracy * 0.3) + difficultyBonus - (miss * age.missPenalty * 0.45)), 20, 100);
    const inhibitionScore = clamp(round((adjustedInhibitionRate * 0.72) + ((100 - falseAlarm * age.falseAlarmPenalty) * 0.22) + (adjustedAccuracy * 0.06) + difficultyBonus), 18, 100);
    const attentionScore = clamp(round((adjustedAccuracy * 0.5) + ((100 - miss * age.missPenalty) * 0.25) + (adjustedInhibitionRate * 0.25)), 18, 100);
    const selfMonitoringScore = clamp(round(100 - (falseAlarm * age.falseAlarmPenalty) - (miss * age.missPenalty) + difficultyBonus + (rehabAllowance * 12)), 18, 100);
    const integratedScore = clamp(round(
      discriminationScore * 0.28 +
      inhibitionScore * 0.28 +
      attentionScore * 0.2 +
      speedScore * 0.12 +
      selfMonitoringScore * 0.12
    ), 0, 100);
    return {
      logs,
      hit,
      miss,
      hold,
      falseAlarm,
      matchTotal,
      noGoTotal,
      correct,
      wrong,
      avgReactionMs,
      accuracyRate,
      matchAccuracy,
      inhibitionRate,
      speedScore,
      discriminationScore,
      inhibitionScore,
      attentionScore,
      selfMonitoringScore,
      integratedScore,
      age,
      level,
      elapsedMs: Date.now() - state.startedAtMs
    };
  }

  function getClinicalFeedback(metrics) {
    if (metrics.falseAlarm >= 2) {
      return "불일치 자극에서 빠르게 누른 반응이 관찰되어 시각 확인 후 행동을 보류하는 억제 루틴이 우선 권장됩니다.";
    }
    if (metrics.miss >= 2) {
      return "일치 자극을 놓친 문항이 누적되어 시각 탐색 속도와 주의 지속의 안정화가 필요합니다.";
    }
    if (metrics.integratedScore >= 85) {
      return "방해 자극이 포함된 조건에서도 모양 기준을 안정적으로 유지했습니다.";
    }
    return "기본 규칙 수행은 가능하나 난이도 상승 시 변별 기준과 반응 억제의 균형을 더 구조화할 필요가 있습니다.";
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
      reportType: REPORT_TYPE,
      reportProfile: "visual-discrimination",
      reportProfileLabel: "도형 일치 Go/No-Go",
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
      replayCount: metrics.falseAlarm,
      visualReplayCount: metrics.miss,
      targetCount: metrics.matchTotal,
      distractorKinds: Math.max(1, metrics.noGoTotal),
      questionLogs,
      accentColor: "#0f766e"
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
    els.resultSummary.textContent = `총 ${TOTAL_ROUNDS}문항에서 정답 ${metrics.correct}개, 오경보 ${metrics.falseAlarm}회, 미반응 ${metrics.miss}회가 기록되었습니다.`;
    els.resultStats.innerHTML = [
      ["정답 여부", `${metrics.correct}/${TOTAL_ROUNDS}`],
      ["게임 점수(임상 지표 아님)", `${metrics.integratedScore}점`],
      ["일치 반응률", `${metrics.matchAccuracy}%`],
      ["억제 성공률", `${metrics.inhibitionRate}%`],
      ["반응시간 중앙값", formatReportReactionMs(reportInput.reactionTimeSample.medianMs)],
      ["반응시간 IQR", formatReportReactionMs(reportInput.reactionTimeSample.iqrMs)],
      ["유효 RT 표본", `${reportInput.reactionTimeSample.included}/${reportInput.reactionTimeSample.totalLogs}`],
      ["평균 반응시간(호환용)", formatReportReactionMs(reportInput.reactionTimeSample.meanMs)],
      ["오경보 / 미반응", `${metrics.falseAlarm}회 / ${metrics.miss}회`]
    ].map(([label, value]) => `<div class="shape-stat"><span>${label}</span><strong>${value}</strong></div>`).join("");
    els.professionalReport.innerHTML = report && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === "function"
      ? window.PlaylabReportEngine.renderHtml(report, { variant: "standalone" })
      : `<p>${report.briefOpinion}</p>`;
    saveReports(reportInput, report, metrics);
    setScreen("result");
  }

  function finishGame() {
    stopRoundTimers();
    stopGamepadLoop();
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
    const guardianSummary = report.guardianSummary || "이번 재활 활동에서는 도형 일치와 반응 억제 과제의 참여 흐름과 반응 양상이 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.";
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
      curriculumKey: REPORT_TYPE,
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
      reportType: REPORT_TYPE,
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
      focusKey: "shape-match-inhibitory-control",
      focusLabel: "도형 일치와 반응 억제",
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
        report_domain: "시각 변별, 주의 지속, Go/No-Go 반응 억제",
        age_group: state.ageKey,
        age_group_label: metrics.age.label,
        age_range: metrics.age.range,
        level_id: metrics.level.id,
        level_label: metrics.level.label,
        trial_limit_ms: getTrialLimitMs(metrics.age, metrics.level),
        match_rate: metrics.level.matchRate,
        match_total: metrics.matchTotal,
        no_go_total: metrics.noGoTotal,
        hit_count: metrics.hit,
        miss_count: metrics.miss,
        hold_count: metrics.hold,
        false_alarm_count: metrics.falseAlarm,
        match_accuracy: metrics.matchAccuracy,
        inhibition_rate: metrics.inhibitionRate,
        avg_reaction_ms: reportInput.avgQuestionMs,
        game_avg_reaction_ms: metrics.avgReactionMs,
        question_logs: metrics.logs
      },
      metadata: {
        session_id: reportInput.sessionId,
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_type: REPORT_TYPE,
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
    if (!window.__shapeMatchGoNoGoSupabaseClient) {
      window.__shapeMatchGoNoGoSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return window.__shapeMatchGoNoGoSupabaseClient;
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
      source_page: String(window.location.pathname || "").split("/").pop() || "rehablab-shape-match-gonogo.html"
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
        report_type: REPORT_TYPE,
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
      console.error("[rehablab-shape-match-gonogo] history save failed:", error);
      return { error };
    }
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
    els.matchButton.addEventListener("click", () => handleMatchClick({ source: "screen" }));
    els.stageButton.addEventListener("click", () => setScreen("menu"));
    els.retryButton.addEventListener("click", startGame);
    els.menuButton.addEventListener("click", () => setScreen("menu"));
    els.helpButton.addEventListener("click", openHelp);
    els.helpClose.addEventListener("click", closeHelp);
    els.helpModal.addEventListener("click", (event) => {
      if (event.target && event.target.matches("[data-close-modal]")) closeHelp();
    });
    document.addEventListener("keydown", (event) => {
      if ((event.key === " " || event.key === "Enter") && els.gameView.classList.contains("is-active")) {
        event.preventDefault();
        setJoystickConnected("keyboard");
        handleMatchClick({ source: "keyboard", key: event.key });
      }
      if (event.key === "Escape") closeHelp();
    });
    window.addEventListener("gamepadconnected", () => {
      setJoystickConnected("gamepad");
      startGamepadLoop();
    });
    window.addEventListener("gamepaddisconnected", () => state.pressedGamepadButtons.clear());
  }

  function init() {
    [
      "menuView", "gameView", "resultView", "levelGrid", "startButton", "stageButton",
      "gameKicker", "roundCounter", "timerBar", "trialTimer", "leftShape",
      "rightShape", "shapePair", "feedbackToast", "ruleText", "matchButton", "resultTitle",
      "resultSummary", "resultStats", "professionalReport", "retryButton",
      "menuButton", "helpButton", "helpModal", "helpClose", "joystickStatus", "gameJoystickStatus"
    ].forEach((id) => {
      els[id] = $(id);
    });
    renderLevels();
    updateMenuState();
    bindEvents();
    setScreen("menu");
    startGamepadLoop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
