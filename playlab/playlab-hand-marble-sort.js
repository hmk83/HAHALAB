(function () {
  "use strict";

  const COLORS = [
    { id: "red", label: "빨강", hex: "#ef4444" },
    { id: "blue", label: "파랑", hex: "#3b82f6" },
    { id: "yellow", label: "노랑", hex: "#facc15" },
    { id: "green", label: "초록", hex: "#22c55e" },
    { id: "purple", label: "보라", hex: "#a855f7" }
  ];

  const STAGES = [
    { id: "stage-01", title: "한 색 구슬 담기", colors: 1, marbles: 6, timeLimit: 0, score: 40 },
    { id: "stage-02", title: "두 색 구슬 담기", colors: 2, marbles: 8, timeLimit: 0, score: 50 },
    { id: "stage-03", title: "세 색 기초 분류", colors: 3, marbles: 9, timeLimit: 0, score: 60 },
    { id: "stage-04", title: "세 색 빠른 분류", colors: 3, marbles: 12, timeLimit: 75, score: 70 },
    { id: "stage-05", title: "네 색 구슬 담기", colors: 4, marbles: 12, timeLimit: 0, score: 75 },
    { id: "stage-06", title: "네 색 제한 시간", colors: 4, marbles: 16, timeLimit: 70, score: 85 },
    { id: "stage-07", title: "다섯 색 집중 분류", colors: 5, marbles: 15, timeLimit: 0, score: 90 },
    { id: "stage-08", title: "다섯 색 속도 분류", colors: 5, marbles: 20, timeLimit: 75, score: 95 },
    { id: "stage-09", title: "마스터 챌린지", colors: 5, marbles: 25, timeLimit: 60, score: 100 }
  ];

  const HAND_CONNECTIONS_FALLBACK = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17]
  ];

  const GRAB_RADIUS = 138;
  const DROP_PADDING_X = 52;
  const DROP_PADDING_Y = 64;
  const PINCH_GRAB_DISTANCE = 0.075;
  const PINCH_RELEASE_DISTANCE = 0.105;
  const PINCH_GRAB_RATIO = 0.5;
  const PINCH_RELEASE_RATIO = 0.72;
  const RELEASE_FRAME_COUNT = 2;

  const els = {
    stageView: document.getElementById("stageView"),
    gameView: document.getElementById("gameView"),
    resultView: document.getElementById("resultView"),
    stageGrid: document.getElementById("stageGrid"),
    stageLabel: document.getElementById("stageLabel"),
    stageButton: document.getElementById("stageButton"),
    helpButton: document.getElementById("helpButton"),
    helpModal: document.getElementById("helpModal"),
    helpCloseButton: document.getElementById("helpCloseButton"),
    taskKicker: document.getElementById("taskKicker"),
    taskTitle: document.getElementById("taskTitle"),
    timerChip: document.getElementById("timerChip"),
    progressChip: document.getElementById("progressChip"),
    binRow: document.getElementById("binRow"),
    arenaField: document.getElementById("arenaField"),
    marbleCanvas: document.getElementById("marbleCanvas"),
    handCursor: document.getElementById("handCursor"),
    completeOverlay: document.getElementById("completeOverlay"),
    handVideo: document.getElementById("handVideo"),
    handCanvas: document.getElementById("handCanvas"),
    cameraPlaceholder: document.getElementById("cameraPlaceholder"),
    cameraButton: document.getElementById("cameraButton"),
    cameraStatus: document.getElementById("cameraStatus"),
    resultTitle: document.getElementById("resultTitle"),
    resultSummary: document.getElementById("resultSummary"),
    resultStats: document.getElementById("resultStats"),
    reportOpinion: document.getElementById("reportOpinion"),
    retryButton: document.getElementById("retryButton"),
    otherStageButton: document.getElementById("otherStageButton")
  };

  const marbleCtx = els.marbleCanvas.getContext("2d");
  const handCtx = els.handCanvas.getContext("2d");

  const state = {
    stageIndex: 0,
    stage: STAGES[0],
    marbles: [],
    bins: [],
    running: false,
    complete: false,
    lastFrame: 0,
    rafId: 0,
    timerId: 0,
    startedAt: 0,
    endedAt: 0,
    timeRemaining: 0,
    grabbedId: null,
    activePointer: null,
    cameraReady: false,
    handPinching: false,
    handPoint: null,
    metrics: null,
    audio: null,
    hands: null,
    camera: null,
    stream: null
  };
  state.cameraStarting = false;
  state.handOpenFrames = 0;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const minute = Math.floor(total / 60);
    const second = String(total % 60).padStart(2, "0");
    return minute + ":" + second;
  }

  function showScreen(target) {
    [els.stageView, els.gameView, els.resultView].forEach(function (screen) {
      screen.classList.toggle("is-active", screen === target);
    });
    els.stageButton.classList.toggle("shell-hidden", target === els.stageView);
    els.stageLabel.classList.toggle("shell-hidden", target === els.stageView);
  }

  function ensureAudio() {
    if (state.audio) return state.audio;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    state.audio = new AudioContext();
    return state.audio;
  }

  function playSound(type) {
    const audio = ensureAudio();
    if (!audio) return;
    const now = audio.currentTime;
    const gain = audio.createGain();
    const osc = audio.createOscillator();
    gain.connect(audio.destination);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.0001, now);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.26);
      return;
    }

    if (type === "complete") {
      [440, 660, 880].forEach(function (freq, index) {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = "triangle";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, now + index * 0.12);
        g.gain.exponentialRampToValueAtTime(0.16, now + index * 0.12 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.22);
        o.connect(g);
        g.connect(audio.destination);
        o.start(now + index * 0.12);
        o.stop(now + index * 0.12 + 0.24);
      });
      return;
    }

    osc.type = type === "wrong" ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(type === "wrong" ? 160 : 360, now);
    if (type === "wrong") osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(type === "wrong" ? 0.14 : 0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  function renderStages() {
    els.stageGrid.innerHTML = '<div class="hand-stage-head playlab-stage-label-block"><h1>시각 놀이 단계 학습</h1><p>Visual Play Stage Learning</p></div>' + STAGES.map(function (stage, index) {
      const timerText = stage.timeLimit ? stage.timeLimit + "초" : "시간 자유";
      return [
        '<button type="button" class="hand-stage-card" data-stage-index="' + index + '">',
        '  <div class="hand-stage-card-top">',
        '    <span class="hand-stage-no">' + String(index + 1).padStart(2, "0") + '</span>',
        '    <span class="hand-stage-meta">',
        '      <span>' + stage.colors + '색</span>',
        '      <span>' + stage.marbles + '개</span>',
        '      <span>' + timerText + '</span>',
        '    </span>',
        '  </div>',
        '  <h3>' + escapeHtml(stage.title) + '</h3>',
        '</button>'
      ].join("");
    }).join("");
  }

  function getArenaSize() {
    const rect = els.arenaField.getBoundingClientRect();
    return { width: Math.max(320, rect.width), height: Math.max(260, rect.height) };
  }

  function resizeCanvas(canvas, size) {
    const ratio = window.devicePixelRatio || 1;
    const nextWidth = Math.round(size.width * ratio);
    const nextHeight = Math.round(size.height * ratio);
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      canvas.style.width = size.width + "px";
      canvas.style.height = size.height + "px";
      const ctx = canvas.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  }

  function syncCanvases() {
    resizeCanvas(els.marbleCanvas, getArenaSize());
    const handRect = els.handCanvas.getBoundingClientRect();
    resizeCanvas(els.handCanvas, {
      width: Math.max(240, handRect.width),
      height: Math.max(180, handRect.height)
    });
  }

  function buildBins() {
    const activeColors = COLORS.slice(0, state.stage.colors);
    els.binRow.style.setProperty("--bin-count", activeColors.length);
    els.binRow.innerHTML = activeColors.map(function (color) {
      return [
        '<div class="hand-bin" data-color="' + color.id + '" style="--bin-color:' + color.hex + '">',
        '  <strong>' + color.label + '</strong>',
        '  <div class="hand-bin-dots" data-dot-row="' + color.id + '"></div>',
        '</div>'
      ].join("");
    }).join("");
    state.bins = activeColors.map(function (color, index) {
      const target = Math.floor(state.stage.marbles / activeColors.length)
        + (index < state.stage.marbles % activeColors.length ? 1 : 0);
      return { id: color.id, label: color.label, hex: color.hex, placed: 0, target: target };
    });
  }

  function getBinAtPoint(point) {
    const fieldRect = els.arenaField.getBoundingClientRect();
    const rows = Array.from(els.binRow.querySelectorAll(".hand-bin"));
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      const local = {
        left: rect.left - fieldRect.left,
        right: rect.right - fieldRect.left,
        top: rect.top - fieldRect.top,
        bottom: rect.bottom - fieldRect.top
      };
      const inDropZone = point.x >= local.left - DROP_PADDING_X
        && point.x <= local.right + DROP_PADDING_X
        && point.y >= local.top - DROP_PADDING_Y
        && point.y <= local.bottom + DROP_PADDING_Y;
      if (inDropZone) return row.dataset.color;
    }
    return null;
  }

  function createMarbles() {
    const size = getArenaSize();
    const activeColors = COLORS.slice(0, state.stage.colors);
    const marbles = [];
    for (let i = 0; i < state.stage.marbles; i += 1) {
      const color = activeColors[i % activeColors.length];
      marbles.push({
        id: "marble-" + i,
        colorId: color.id,
        colorHex: color.hex,
        label: color.label,
        radius: 28 + (i % 3) * 3,
        x: 74 + Math.random() * Math.max(90, size.width - 148),
        y: size.height - 76 - Math.random() * Math.min(120, size.height * 0.3),
        vx: (Math.random() - 0.5) * 2.8,
        vy: -Math.random() * 1.5,
        placed: false,
        attempts: 0
      });
    }
    state.marbles = marbles.sort(function () {
      return Math.random() - 0.5;
    });
  }

  function resetMetrics() {
    state.metrics = {
      placed: 0,
      firstTry: 0,
      retrySuccess: 0,
      wrongDrops: 0,
      freeDrops: 0,
      grabs: 0,
      completed: false,
      timedOut: false
    };
  }

  function updateBinDots() {
    state.bins.forEach(function (bin) {
      const row = els.binRow.querySelector('[data-dot-row="' + bin.id + '"]');
      if (!row) return;
      row.innerHTML = Array.from({ length: bin.target }, function (_, index) {
        return '<i class="' + (index < bin.placed ? "is-filled" : "") + '" style="--bin-color:' + bin.hex + '"></i>';
      }).join("");
    });
  }

  function updateProgress() {
    els.progressChip.textContent = state.metrics.placed + " / " + state.stage.marbles;
  }

  function updateTimerChip() {
    if (!state.stage.timeLimit) {
      els.timerChip.textContent = "시간 제한 없음";
      return;
    }
    els.timerChip.textContent = "남은 시간 " + Math.max(0, state.timeRemaining) + "초";
  }

  function startTimer() {
    window.clearInterval(state.timerId);
    if (!state.stage.timeLimit) {
      updateTimerChip();
      return;
    }
    state.timeRemaining = state.stage.timeLimit;
    updateTimerChip();
    state.timerId = window.setInterval(function () {
      if (!state.running || state.complete) return;
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      state.timeRemaining = Math.max(0, state.stage.timeLimit - elapsed);
      updateTimerChip();
      if (state.timeRemaining <= 0) {
        finishStage(false, true);
      }
    }, 250);
  }

  function startStage(index) {
    ensureAudio();
    stopLoop();
    state.stageIndex = index;
    state.stage = STAGES[index];
    state.complete = false;
    state.grabbedId = null;
    state.handOpenFrames = 0;
    state.startedAt = Date.now();
    state.endedAt = 0;
    resetMetrics();
    buildBins();
    showScreen(els.gameView);
    syncCanvases();
    createMarbles();
    updateBinDots();
    updateProgress();
    els.taskKicker.textContent = "스테이지 " + String(index + 1).padStart(2, "0") + " · " + state.stage.colors + "색";
    els.taskTitle.textContent = state.stage.title;
    els.stageLabel.textContent = String(index + 1).padStart(2, "0") + " " + state.stage.title;
    els.completeOverlay.classList.remove("is-active");
    els.completeOverlay.setAttribute("aria-hidden", "true");
    state.running = true;
    state.lastFrame = performance.now();
    if (!state.cameraReady && !state.cameraStarting) {
      startCamera();
    }
    startTimer();
    state.rafId = window.requestAnimationFrame(gameLoop);
  }

  function stopLoop() {
    state.running = false;
    window.cancelAnimationFrame(state.rafId);
    window.clearInterval(state.timerId);
  }

  function drawMarble(marble) {
    marbleCtx.save();
    marbleCtx.beginPath();
    marbleCtx.arc(marble.x, marble.y, marble.radius, 0, Math.PI * 2);
    marbleCtx.fillStyle = marble.colorHex;
    marbleCtx.shadowColor = "rgba(15, 23, 42, 0.24)";
    marbleCtx.shadowBlur = 12;
    marbleCtx.shadowOffsetY = 5;
    marbleCtx.fill();
    marbleCtx.shadowBlur = 0;
    marbleCtx.lineWidth = marble.id === state.grabbedId ? 5 : 3;
    marbleCtx.strokeStyle = marble.id === state.grabbedId ? "#0ea5e9" : "rgba(255, 255, 255, 0.86)";
    marbleCtx.stroke();
    marbleCtx.beginPath();
    marbleCtx.arc(marble.x - marble.radius * 0.32, marble.y - marble.radius * 0.34, marble.radius * 0.28, 0, Math.PI * 2);
    marbleCtx.fillStyle = "rgba(255, 255, 255, 0.58)";
    marbleCtx.fill();
    marbleCtx.restore();
  }

  function drawBoard() {
    const size = getArenaSize();
    marbleCtx.clearRect(0, 0, size.width, size.height);
    marbleCtx.save();
    marbleCtx.fillStyle = "rgba(14, 165, 233, 0.08)";
    marbleCtx.fillRect(0, size.height - 84, size.width, 84);
    marbleCtx.fillStyle = "rgba(255, 255, 255, 0.56)";
    marbleCtx.fillRect(0, size.height - 84, size.width, 6);
    marbleCtx.restore();
    state.marbles.filter(function (m) { return !m.placed; }).forEach(drawMarble);
  }

  function updatePhysics(dt) {
    const size = getArenaSize();
    const gravity = 0.58 * dt;
    const grabbed = getGrabbedMarble();
    state.marbles.forEach(function (marble) {
      if (marble.placed) return;
      if (grabbed && grabbed.id === marble.id) return;
      marble.vy += gravity;
      marble.x += marble.vx * dt;
      marble.y += marble.vy * dt;

      if (marble.x < marble.radius) {
        marble.x = marble.radius;
        marble.vx = Math.abs(marble.vx) * 0.82;
      }
      if (marble.x > size.width - marble.radius) {
        marble.x = size.width - marble.radius;
        marble.vx = -Math.abs(marble.vx) * 0.82;
      }
      if (marble.y < marble.radius) {
        marble.y = marble.radius;
        marble.vy = Math.abs(marble.vy) * 0.7;
      }
      if (marble.y > size.height - marble.radius) {
        marble.y = size.height - marble.radius;
        marble.vy = -Math.abs(marble.vy) * 0.42;
        marble.vx *= 0.986;
      }
    });
  }

  function gameLoop(now) {
    if (!state.running) return;
    const dt = Math.min(2.2, Math.max(0.4, (now - state.lastFrame) / 16.67));
    state.lastFrame = now;
    updatePhysics(dt);
    drawBoard();
    state.rafId = window.requestAnimationFrame(gameLoop);
  }

  function getGrabbedMarble() {
    return state.marbles.find(function (marble) {
      return marble.id === state.grabbedId;
    }) || null;
  }

  function pickNearestMarble(point) {
    let best = null;
    let bestDistance = Infinity;
    state.marbles.forEach(function (marble) {
      if (marble.placed) return;
      const distance = Math.hypot(marble.x - point.x, marble.y - point.y);
      if (distance < Math.max(GRAB_RADIUS, marble.radius * 4.8) && distance < bestDistance) {
        best = marble;
        bestDistance = distance;
      }
    });
    if (!best) return null;
    state.grabbedId = best.id;
    best.vx = 0;
    best.vy = 0;
    state.metrics.grabs += 1;
    playSound("pick");
    return best;
  }

  function moveGrabbed(point) {
    const marble = getGrabbedMarble();
    if (!marble) return;
    const size = getArenaSize();
    marble.x = Math.min(size.width - marble.radius, Math.max(marble.radius, point.x));
    marble.y = Math.min(size.height - marble.radius, Math.max(marble.radius, point.y));
  }

  function releaseGrabbed(point) {
    const marble = getGrabbedMarble();
    if (!marble) return;
    const targetColor = getBinAtPoint(point || marble);
    if (!targetColor) {
      state.metrics.freeDrops += 1;
      marble.vx = (Math.random() - 0.5) * 4;
      marble.vy = -5;
      state.grabbedId = null;
      return;
    }

    marble.attempts += 1;
    if (targetColor === marble.colorId) {
      marble.placed = true;
      state.grabbedId = null;
      const bin = state.bins.find(function (item) { return item.id === targetColor; });
      if (bin) bin.placed += 1;
      state.metrics.placed += 1;
      if (marble.attempts === 1) state.metrics.firstTry += 1;
      else state.metrics.retrySuccess += 1;
      updateBinDots();
      updateProgress();
      playSound("success");
      if (state.metrics.placed >= state.stage.marbles) {
        finishStage(true, false);
      }
      return;
    }

    state.metrics.wrongDrops += 1;
    marble.vx = (Math.random() - 0.5) * 6;
    marble.vy = 5;
    state.grabbedId = null;
    playSound("wrong");
  }

  function handleGrabInput(point, isPinching, shouldRelease) {
    if (!state.running || state.complete) return;
    showHandCursor(point, isPinching);
    if (isPinching && !state.handPinching && !state.grabbedId) {
      pickNearestMarble(point);
    }
    if (isPinching) {
      moveGrabbed(point);
    }
    if (shouldRelease && state.handPinching) {
      releaseGrabbed(point);
    }
    state.handPinching = isPinching && !shouldRelease;
  }

  function showHandCursor(point, isPinching) {
    els.handCursor.style.left = point.x + "px";
    els.handCursor.style.top = point.y + "px";
    els.handCursor.classList.add("is-visible");
    els.handCursor.classList.toggle("is-pinching", Boolean(isPinching));
  }

  function hideHandCursor() {
    els.handCursor.classList.remove("is-visible", "is-pinching");
  }

  function bindPointerControls() {
    els.marbleCanvas.addEventListener("pointerdown", function (event) {
      if (!state.running || state.complete) return;
      ensureAudio();
      els.marbleCanvas.setPointerCapture(event.pointerId);
      state.activePointer = event.pointerId;
      const point = getCanvasPoint(event);
      showHandCursor(point, true);
      pickNearestMarble(point);
      moveGrabbed(point);
    });

    els.marbleCanvas.addEventListener("pointermove", function (event) {
      if (state.activePointer !== event.pointerId) return;
      const point = getCanvasPoint(event);
      showHandCursor(point, true);
      moveGrabbed(point);
    });

    ["pointerup", "pointercancel"].forEach(function (type) {
      els.marbleCanvas.addEventListener(type, function (event) {
        if (state.activePointer !== event.pointerId) return;
        const point = getCanvasPoint(event);
        releaseGrabbed(point);
        state.activePointer = null;
        hideHandCursor();
      });
    });
  }

  function getCanvasPoint(event) {
    const rect = els.marbleCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function finishStage(completed, timedOut) {
    if (state.complete) return;
    state.complete = true;
    state.metrics.completed = Boolean(completed);
    state.metrics.timedOut = Boolean(timedOut);
    state.endedAt = Date.now();
    window.clearInterval(state.timerId);
    if (completed) {
      els.completeOverlay.classList.add("is-active");
      els.completeOverlay.setAttribute("aria-hidden", "false");
      playSound("complete");
    } else {
      playSound("wrong");
    }
    window.setTimeout(function () {
      renderResult();
      showScreen(els.resultView);
      stopLoop();
    }, completed ? 1150 : 450);
  }

  function calcScore() {
    const total = state.stage.marbles;
    const placedRate = total ? state.metrics.placed / total : 0;
    const accuracy = state.metrics.placed ? state.metrics.firstTry / state.metrics.placed : 0;
    const timeBonus = state.stage.timeLimit
      ? Math.round((Math.max(0, state.timeRemaining) / state.stage.timeLimit) * 12)
      : 8;
    const penalty = Math.min(18, state.metrics.wrongDrops * 3);
    return Math.max(0, Math.min(100, Math.round(placedRate * 70 + accuracy * 20 + timeBonus - penalty)));
  }

  function renderResult() {
    const elapsedMs = Math.max(0, (state.endedAt || Date.now()) - state.startedAt);
    const score = calcScore();
    const completedText = state.metrics.completed ? "모든 구슬을 분류했습니다." : "시간 안에 모두 분류하지 못했습니다.";
    els.resultTitle.textContent = state.metrics.completed ? "색 구슬 분류 성공!" : "분류 결과";
    els.resultSummary.textContent = completedText + " 색을 보고 손 움직임을 조절한 기록을 확인해요.";
    els.resultStats.innerHTML = [
      statHtml("점수", score + "점"),
      statHtml("걸린 시간", formatTime(elapsedMs)),
      statHtml("한 번에 성공", state.metrics.firstTry + "개"),
      statHtml("다시 성공", state.metrics.retrySuccess + "개"),
      statHtml("잘못 넣은 횟수", state.metrics.wrongDrops + "회"),
      statHtml("완료 구슬", state.metrics.placed + " / " + state.stage.marbles),
      statHtml("색상 수", state.stage.colors + "색"),
      statHtml("제한 시간", state.stage.timeLimit ? state.stage.timeLimit + "초" : "없음")
    ].join("");

    renderReport(score, elapsedMs);
    recordHarness(score, elapsedMs);
  }

  function statHtml(label, value) {
    return '<div class="hand-stat"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
  }

  function renderReport(score, elapsedMs) {
    const engine = window.PlaylabReportEngine;
    if (!engine || typeof engine.buildReport !== "function" || typeof engine.renderHtml !== "function") {
      els.reportOpinion.innerHTML = "";
      return;
    }
    const report = engine.buildReport({
      title: "손 구슬 색상 분류",
      stageTitle: state.stage.title,
      score: score,
      totalQuestions: state.stage.marbles,
      correctCount: state.metrics.placed,
      wrongCount: state.metrics.wrongDrops,
      elapsedMs: elapsedMs,
      reportType: "visual",
      profileKey: "visual-motor-coordination",
      metrics: {
        speed: state.stage.timeLimit ? Math.max(40, Math.round((state.timeRemaining / state.stage.timeLimit) * 100)) : 78,
        attention: Math.max(45, Math.round((state.metrics.placed / state.stage.marbles) * 100)),
        search: Math.max(40, 100 - state.metrics.wrongDrops * 8),
        accuracy: Math.round((state.metrics.firstTry / Math.max(1, state.metrics.placed)) * 100),
        selfMonitoring: Math.max(40, 100 - state.metrics.wrongDrops * 10)
      },
      observations: [
        "색상 단서를 확인하고 같은 색 목표 칸에 분류하는 과제입니다.",
        "구슬의 중력 움직임을 예측하며 손 움직임을 조절하는 시각-운동 협응을 봅니다.",
        state.stage.timeLimit ? "제한 시간이 있어 속도와 정확도 균형을 함께 확인합니다." : "제한 시간 없이 정확한 분류 흐름을 먼저 안정화합니다."
      ]
    });
    els.reportOpinion.innerHTML = engine.renderHtml(report);
  }

  function recordHarness(score, elapsedMs) {
    const harness = window.HahaLabLearningHarness;
    if (!harness || typeof harness.recordSession !== "function") return;
    try {
      harness.recordSession({
        labKind: "playlab",
        reportScope: "playlab",
        saveToClientReport: true,
        curriculumKey: "playlab-hand-marble-sort",
        stageKey: state.stage.id,
        labTitle: "손 구슬 색상 분류",
        stageTitle: state.stage.title,
        score: score,
        totalQuestions: state.stage.marbles,
        correctCount: state.metrics.placed,
        wrongCount: state.metrics.wrongDrops,
        elapsedMs: elapsedMs,
        details: {
          colorCount: state.stage.colors,
          timeLimit: state.stage.timeLimit,
          firstTry: state.metrics.firstTry,
          retrySuccess: state.metrics.retrySuccess,
          freeDrops: state.metrics.freeDrops,
          completed: state.metrics.completed
        }
      });
    } catch (error) {
      console.warn("Failed to save hand marble report", error);
    }
  }

  function showStages() {
    stopLoop();
    showScreen(els.stageView);
  }

  async function startCamera() {
    ensureAudio();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      els.cameraStatus.textContent = "이 브라우저에서는 카메라를 사용할 수 없어 마우스/터치 모드로 진행합니다.";
      return;
    }

    try {
      state.cameraStarting = true;
      els.cameraButton.disabled = true;
      els.cameraStatus.textContent = "카메라 권한을 확인하는 중입니다.";
      state.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      els.handVideo.srcObject = state.stream;
      await els.handVideo.play();
      state.cameraReady = true;
      els.cameraPlaceholder.style.display = "none";
      els.cameraStatus.textContent = "손가락 전체가 보이면 엄지와 검지를 모아 구슬을 잡을 수 있어요.";
      await initHandTracker();
      els.cameraButton.textContent = "카메라 사용 중";
    } catch (error) {
      const expectedCameraFallback = /NotSupportedError|NotAllowedError|NotFoundError|OverconstrainedError/i.test(String(error && (error.name || error.message) || error || ""));
      if (!expectedCameraFallback) {
        console.warn("Camera start failed", error);
      }
      els.cameraButton.disabled = false;
      els.cameraStatus.textContent = "카메라를 열지 못했습니다. 마우스/터치로 학습을 진행해 주세요.";
    } finally {
      state.cameraStarting = false;
    }
  }

  async function initHandTracker() {
    if (!window.Hands) {
      els.cameraStatus.textContent = "손 인식 라이브러리를 불러오지 못해 카메라 미리보기만 표시합니다.";
      drawCameraFallbackLoop();
      return;
    }
    state.hands = new window.Hands({
      locateFile: function (file) {
        return "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file;
      }
    });
    state.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.55
    });
    state.hands.onResults(handleHandResults);

    if (window.Camera) {
      state.camera = new window.Camera(els.handVideo, {
        onFrame: async function () {
          if (state.hands) await state.hands.send({ image: els.handVideo });
        },
        width: 640,
        height: 480
      });
      await state.camera.start();
    } else {
      drawCameraFallbackLoop();
    }
  }

  function drawCameraFallbackLoop() {
    function draw() {
      drawCameraBase();
      window.requestAnimationFrame(draw);
    }
    draw();
  }

  function drawCameraBase() {
    const rect = els.handCanvas.getBoundingClientRect();
    handCtx.clearRect(0, 0, rect.width, rect.height);
  }

  function handleHandResults(results) {
    drawCameraBase();
    const landmarks = results.multiHandLandmarks && results.multiHandLandmarks[0];
    if (!landmarks) {
      state.handPoint = null;
      if (!state.activePointer) hideHandCursor();
      return;
    }
    drawLandmarks(landmarks);
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const arena = getArenaSize();
    const pinchDistance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
    const palmWidth = Math.hypot(landmarks[5].x - landmarks[17].x, landmarks[5].y - landmarks[17].y);
    const palmHeight = Math.hypot(landmarks[0].x - landmarks[9].x, landmarks[0].y - landmarks[9].y);
    const handScale = Math.max(0.045, palmWidth, palmHeight * 0.78);
    const pinchRatio = pinchDistance / handScale;
    const hasGrabbed = Boolean(state.grabbedId);
    const isGrabGesture = pinchDistance < PINCH_GRAB_DISTANCE || pinchRatio < PINCH_GRAB_RATIO;
    const isOpenGesture = (pinchDistance > PINCH_RELEASE_DISTANCE && pinchRatio > 0.52)
      || pinchRatio > PINCH_RELEASE_RATIO;
    const isHoldingGesture = hasGrabbed ? !isOpenGesture : isGrabGesture;
    if (hasGrabbed && isOpenGesture) {
      state.handOpenFrames += 1;
    } else {
      state.handOpenFrames = 0;
    }
    const shouldRelease = hasGrabbed && state.handOpenFrames >= RELEASE_FRAME_COUNT;
    const controlPoint = isHoldingGesture
      ? { x: (indexTip.x + thumbTip.x) / 2, y: (indexTip.y + thumbTip.y) / 2 }
      : indexTip;
    const point = {
      x: (1 - controlPoint.x) * arena.width,
      y: controlPoint.y * arena.height
    };
    state.handPoint = point;
    handleGrabInput(point, isHoldingGesture, shouldRelease);
  }

  function drawLandmarks(landmarks) {
    const rect = els.handCanvas.getBoundingClientRect();
    const connections = window.HAND_CONNECTIONS || HAND_CONNECTIONS_FALLBACK;
    handCtx.save();
    handCtx.lineCap = "round";
    connections.forEach(function (pair) {
      const a = landmarks[pair[0]];
      const b = landmarks[pair[1]];
      handCtx.beginPath();
      handCtx.moveTo((1 - a.x) * rect.width, a.y * rect.height);
      handCtx.lineTo((1 - b.x) * rect.width, b.y * rect.height);
      handCtx.lineWidth = 5;
      handCtx.strokeStyle = "rgba(14, 165, 233, 0.9)";
      handCtx.stroke();
      handCtx.lineWidth = 2;
      handCtx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      handCtx.stroke();
    });
    landmarks.forEach(function (point, index) {
      const x = (1 - point.x) * rect.width;
      const y = point.y * rect.height;
      handCtx.beginPath();
      handCtx.arc(x, y, index === 4 || index === 8 ? 7 : 5, 0, Math.PI * 2);
      handCtx.fillStyle = index === 4 || index === 8 ? "#f97316" : "#ffffff";
      handCtx.fill();
      handCtx.lineWidth = 2;
      handCtx.strokeStyle = "#0ea5e9";
      handCtx.stroke();
    });
    handCtx.restore();
  }

  function bindEvents() {
    renderStages();
    bindPointerControls();

    els.stageGrid.addEventListener("click", function (event) {
      const card = event.target.closest("[data-stage-index]");
      if (!card) return;
      startStage(Number(card.dataset.stageIndex));
    });

    els.stageButton.addEventListener("click", showStages);
    els.retryButton.addEventListener("click", function () {
      startStage(state.stageIndex);
    });
    els.otherStageButton.addEventListener("click", showStages);
    els.cameraButton.addEventListener("click", startCamera);

    els.helpButton.addEventListener("click", function () {
      els.helpModal.classList.add("is-open");
      els.helpModal.setAttribute("aria-hidden", "false");
    });
    els.helpCloseButton.addEventListener("click", closeHelp);
    els.helpModal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-close-modal")) closeHelp();
    });

    window.addEventListener("resize", function () {
      syncCanvases();
      drawBoard();
    });

    window.__HAND_MARBLE_SORT_DEBUG__ = {
      startStage: startStage,
      forceComplete: function () {
        state.marbles.forEach(function (marble) {
          if (!marble.placed) {
            marble.placed = true;
            state.metrics.placed += 1;
            state.metrics.firstTry += 1;
            const bin = state.bins.find(function (item) { return item.id === marble.colorId; });
            if (bin) bin.placed += 1;
          }
        });
        updateBinDots();
        updateProgress();
        finishStage(true, false);
      },
      getState: function () {
        return {
          stage: state.stage,
          metrics: state.metrics,
          marbles: state.marbles.length,
          bins: state.bins.length
        };
      }
    };
  }

  function closeHelp() {
    els.helpModal.classList.remove("is-open");
    els.helpModal.setAttribute("aria-hidden", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }
})();
