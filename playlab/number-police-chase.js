(function () {
  'use strict';

  const LAB_ID = 'number-police-chase';
  const LAB_TITLE = '연산 범임차량을 잡아라!';
  const QUESTION_COUNT = 10;
  const CELL_DISTANCE = 10;
  const MIN_DISTANCE = 18;
  const MAX_DISTANCE = 96;
  const TAXI_X = 74;
  const POLICE_NEAR_X = 54;
  const POLICE_FAR_X = 4;
  const SOUND_PATHS = {
    select: '../sound/cardlab-idiom/select.mp3',
    start: 'https://cdn.pixabay.com/audio/2025/09/01/audio_1b51f0cb48.mp3'
  };
  const STAGES = [
    { id: 'one-digit-addition', index: 1, title: '한자리 덧셈 추격', desc: '1~9 안의 수를 더해 답을 골라요.', ops: ['+'], min: 1, max: 9, targetCorrect: 6, catchGapCells: 4, startDistance: 78, stepCorrect: 10, stepWrong: 4, accent: '#2563eb' },
    { id: 'one-digit-subtraction', index: 2, title: '한자리 뺄셈 추격', desc: '한자리 수끼리 빼며 차이를 찾아요.', ops: ['-'], min: 1, max: 9, targetCorrect: 6, catchGapCells: 4, startDistance: 78, stepCorrect: 10, stepWrong: 4, accent: '#0891b2' },
    { id: 'one-digit-multiplication', index: 3, title: '한자리 곱셈 추격', desc: '한자리 x 한자리 곱셈 답을 골라요.', ops: ['×'], min: 1, max: 9, multiplyMin: 1, multiplyMax: 9, targetCorrect: 7, catchGapCells: 3.5, startDistance: 80, stepCorrect: 9, stepWrong: 4, accent: '#16a34a' },
    { id: 'addition', index: 4, title: '두자리 덧셈 추격', desc: '한자리와 쉬운 두자리 덧셈을 빠르게 골라요.', ops: ['+'], min: 1, max: 20, targetCorrect: 7, catchGapCells: 3.5, startDistance: 82, stepCorrect: 9, stepWrong: 5, accent: '#3b82f6' },
    { id: 'subtraction', index: 5, title: '두자리 뺄셈 추격', desc: '큰 수에서 작은 수를 빼며 차이를 찾아요.', ops: ['-'], min: 1, max: 24, targetCorrect: 7, catchGapCells: 3, startDistance: 82, stepCorrect: 9, stepWrong: 5, accent: '#06b6d4' },
    { id: 'multiplication', index: 6, title: '구구단 곱셈 추격', desc: '2~9단 곱셈 답을 골라요.', ops: ['×'], min: 1, max: 9, multiplyMin: 2, multiplyMax: 9, targetCorrect: 7, catchGapCells: 3, startDistance: 82, stepCorrect: 9, stepWrong: 4, accent: '#22c55e' },
    { id: 'add-sub-mix', index: 7, title: '덧셈 뺄셈 혼합 추격', desc: '연산 기호를 바꿔 보며 답을 골라요.', ops: ['+', '-'], min: 1, max: 30, targetCorrect: 8, catchGapCells: 2.5, startDistance: 84, stepCorrect: 8, stepWrong: 5, accent: '#f97316' },
    { id: 'all-mix', index: 8, title: '세 연산 혼합 추격', desc: '덧셈, 뺄셈, 곱셈을 섞어서 풀어요.', ops: ['+', '-', '×'], min: 1, max: 30, multiplyMin: 2, multiplyMax: 9, targetCorrect: 8, catchGapCells: 2.5, startDistance: 84, stepCorrect: 8, stepWrong: 4, accent: '#8b5cf6' },
    { id: 'adaptive', index: 9, title: '적응형 연산 추격', desc: '정답 흐름에 따라 쉬운 문제와 어려운 문제가 조절돼요.', ops: ['+', '-', '×'], min: 1, max: 36, multiplyMin: 2, multiplyMax: 9, targetCorrect: 8, catchGapCells: 2, startDistance: 86, stepCorrect: 8, stepWrong: 3, adaptive: true, accent: '#e11d48' },
    { id: 'speed-chase', index: 10, title: '문제당 5초 풀이', desc: '각 문제를 5초 안에 풀어야 하고, 시간이 지나면 거리가 조금 멀어져요.', ops: ['+', '-', '×'], min: 1, max: 36, multiplyMin: 2, multiplyMax: 9, targetCorrect: 8, catchGapCells: 2, startDistance: 86, stepCorrect: 8, stepWrong: 5, adaptive: true, timeLimitSeconds: 5, accent: '#dc2626' }
  ];

  const state = {
    stage: null,
    questionIndex: 0,
    correct: 0,
    wrong: 0,
    distance: 62,
    current: null,
    selectedStage: null,
    locked: false,
    startedAtMs: 0,
    questionStartedAt: 0,
    currentAttemptStartedAt: 0,
    currentAttempts: [],
    currentHadWrong: false,
    history: [],
    usedQuestionKeys: new Set(),
    savedRunId: '',
    questionTimerId: 0,
    questionDeadlineMs: 0,
    outcomeSuccess: false
  };
  const audioCache = {};

  const els = {};
  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[randomInt(0, items.length - 1)];
  const shuffle = (items) => {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = randomInt(0, index);
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setScreen(name) {
    if (name !== 'game') clearQuestionTimer();
    ['stage', 'intro', 'game', 'outcome', 'result'].forEach((key) => {
      const element = els[`${key}View`];
      if (element) element.classList.toggle('is-active', key === name);
    });
    els.stageButton?.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel?.classList.toggle('shell-hidden', name === 'stage');
    if (els.stageLabel) {
      els.stageLabel.textContent = state.stage ? `${state.stage.index}단계 · ${state.stage.title}` : '스테이지 선택';
    }
  }

  function getCatchDistance(stage) {
    return Number(stage?.catchGapCells || 2) * CELL_DISTANCE;
  }

  function getDistanceCells(distance = state.distance) {
    return Math.max(0, Math.ceil(Math.max(0, distance) / CELL_DISTANCE));
  }

  function isCaught() {
    return state.distance <= getCatchDistance(state.stage);
  }

  function clearQuestionTimer() {
    if (state.questionTimerId) {
      window.clearInterval(state.questionTimerId);
      state.questionTimerId = 0;
    }
    if (els.timeChip) {
      els.timeChip.hidden = true;
      els.timeChip.classList.remove('is-warning');
      els.timeChip.style.setProperty('--timer-progress', '1');
    }
    if (els.timeLabel) {
      els.timeLabel.textContent = '';
    }
  }

  function startQuestionTimer() {
    clearQuestionTimer();
    const seconds = Number(state.stage?.timeLimitSeconds || 0);
    if (!seconds || !els.timeChip) return;
    state.questionDeadlineMs = Date.now() + seconds * 1000;
    els.timeChip.hidden = false;
    els.timeChip.style.setProperty('--timer-progress', '1');
    const tick = () => {
      const remainingMs = Math.max(0, state.questionDeadlineMs - Date.now());
      const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
      const progress = clamp(remainingMs / (seconds * 1000), 0, 1);
      if (els.timeLabel) els.timeLabel.textContent = `${remaining}초`;
      els.timeChip.style.setProperty('--timer-progress', String(progress));
      els.timeChip.classList.toggle('is-warning', remaining <= 2);
      if (remaining <= 0) {
        handleTimeout();
      }
    };
    tick();
    state.questionTimerId = window.setInterval(tick, 200);
  }

  function calc(left, op, right) {
    if (op === '+') return left + right;
    if (op === '-') return left - right;
    if (op === '×') return left * right;
    return 0;
  }

  function getAdaptiveLevel() {
    const recent = state.history.slice(-3);
    const streakCorrect = recent.length >= 2 && recent.every((item) => item.correct);
    const streakWrong = recent.length >= 2 && recent.every((item) => !item.correct);
    if (streakCorrect) return 'hard';
    if (streakWrong) return 'easy';
    return 'base';
  }

  function makeQuestion(stage) {
    let candidate = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const adaptiveLevel = stage.adaptive ? getAdaptiveLevel() : 'base';
      const ops = adaptiveLevel === 'easy' ? ['+', '-'] : stage.ops;
      const op = pick(ops);
      let max = Number(stage.max || 20);
      if (adaptiveLevel === 'easy') max = Math.min(max, 12);
      if (adaptiveLevel === 'hard') max = Math.min(Math.max(max, 36), 48);

      let left = randomInt(stage.min || 1, op === '×' ? 9 : max);
      let right = randomInt(stage.min || 1, op === '×' ? 9 : max);
      if (op === '-') {
        if (right > left) [left, right] = [right, left];
        if (adaptiveLevel === 'easy') {
          left = randomInt(6, 16);
          right = randomInt(1, Math.min(9, left));
        }
      }
      if (op === '+') {
        if (adaptiveLevel === 'easy') {
          left = randomInt(1, 9);
          right = randomInt(1, 9);
        }
        if (adaptiveLevel === 'hard') {
          left = randomInt(12, max);
          right = randomInt(8, max);
        }
      }
      if (op === '×') {
        const multiplyMin = Number(stage.multiplyMin || 2);
        const multiplyMax = Number(stage.multiplyMax || 9);
        left = randomInt(multiplyMin, multiplyMax);
        right = randomInt(multiplyMin, multiplyMax);
      }
      const answer = calc(left, op, right);
      const key = `${left}${op}${right}`;
      candidate = {
        left,
        op,
        right,
        answer,
        key,
        expression: `${left} ${op} ${right} = ?`,
        difficulty: adaptiveLevel
      };
      if (!state.usedQuestionKeys.has(key)) break;
    }
    return candidate;
  }

  function makeOptions(answer, question) {
    const distractors = new Set();
    const near = [-12, -10, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 10, 12];
    shuffle(near).forEach((delta) => {
      const value = answer + delta;
      if (value >= 0 && value !== answer) distractors.add(value);
    });
    if (question.op === '×') {
      [
        question.left * Math.max(1, question.right - 1),
        question.left * Math.min(9, question.right + 1),
        question.right * Math.max(1, question.left - 1)
      ].forEach((value) => {
        if (value !== answer) distractors.add(value);
      });
    }
    while (distractors.size < 5) {
      const value = randomInt(Math.max(0, answer - 18), answer + 18);
      if (value !== answer) distractors.add(value);
    }
    return shuffle([answer, ...shuffle(Array.from(distractors)).slice(0, 5)]);
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="number-agency-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-color:${escapeHtml(stage.accent)}" aria-label="${escapeHtml(stage.title)} 시작">
        <span class="number-agency-stage-badge">${stage.index}단계</span>
        <strong>${escapeHtml(stage.title)}</strong>
        <p>${escapeHtml(stage.desc)}</p>
        <div class="number-agency-stage-meta">
          <span>${QUESTION_COUNT}문항</span>
          <span>성공 ${stage.catchGapCells}칸 이내</span>
          ${stage.timeLimitSeconds ? `<span>문항당 ${stage.timeLimitSeconds}초</span>` : ''}
        </div>
      </button>
    `).join('');
  }

  function openIntro(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    state.selectedStage = stage;
    els.introKicker.textContent = `${stage.index}단계 · 성공 ${stage.catchGapCells}칸 이내`;
    els.introTitle.textContent = stage.title;
    els.introSummary.textContent = `${stage.desc} 정답을 맞히면 경찰차가 범인 차량과 가까워져요.`;
    setScreen('intro');
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || state.selectedStage || STAGES[0];
    state.stage = stage;
    state.questionIndex = 0;
    state.correct = 0;
    state.wrong = 0;
    state.distance = stage.startDistance;
    state.current = null;
    state.locked = false;
    state.startedAtMs = Date.now();
    state.questionStartedAt = 0;
    state.currentAttemptStartedAt = 0;
    state.currentAttempts = [];
    state.currentHadWrong = false;
    state.history = [];
    state.usedQuestionKeys = new Set();
    state.savedRunId = '';
    state.outcomeSuccess = false;
    setScreen('game');
    renderQuestion();
  }

  function renderQuestion() {
    if (state.questionIndex >= QUESTION_COUNT || isCaught()) {
      showOutcomeThenResult();
      return;
    }
    clearQuestionTimer();
    state.locked = false;
    state.current = makeQuestion(state.stage);
    state.usedQuestionKeys.add(state.current.key);
    state.current.options = makeOptions(state.current.answer, state.current);
    state.questionStartedAt = performance.now();
    state.currentAttemptStartedAt = state.questionStartedAt;
    state.currentAttempts = [];
    state.currentHadWrong = false;
    els.taskTitle.textContent = state.stage.title;
    els.stageKicker.textContent = state.current.difficulty === 'hard' ? 'ADAPTIVE HARD' : state.current.difficulty === 'easy' ? 'ADAPTIVE EASY' : 'NUMBERLAB';
    els.questionChip.textContent = `${state.questionIndex + 1} / ${QUESTION_COUNT}`;
    els.catchChip.textContent = `성공 ${state.stage.catchGapCells}칸`;
    els.questionText.textContent = state.current.expression;
    els.optionGrid.innerHTML = state.current.options.map((value) => `
      <button type="button" class="chase-option" data-answer="${value}" data-choice="true" aria-label="${value} 선택">${value}</button>
    `).join('');
    updateDistanceUI();
    setMessage('정답을 고르면 경찰차가 가까워져요.', '');
    startQuestionTimer();
  }

  function updateDistanceUI() {
    const gapPercent = clamp(state.distance, MIN_DISTANCE, MAX_DISTANCE);
    const distanceRatio = (gapPercent - MIN_DISTANCE) / Math.max(1, MAX_DISTANCE - MIN_DISTANCE);
    const policeX = clamp(POLICE_NEAR_X - (distanceRatio * (POLICE_NEAR_X - POLICE_FAR_X)), POLICE_FAR_X, TAXI_X - 10);
    const carScale = 1 - (distanceRatio * 0.24);
    els.road?.style.setProperty('--police-x', `${policeX}%`);
    els.road?.style.setProperty('--taxi-x', `${TAXI_X}%`);
    els.road?.style.setProperty('--car-scale', carScale.toFixed(3));
    if (els.distanceChip) els.distanceChip.textContent = `거리 ${getDistanceCells(gapPercent)}칸`;
  }

  function setMessage(text, tone) {
    els.chaseMessage.textContent = text;
    els.chaseMessage.classList.toggle('is-good', tone === 'good');
    els.chaseMessage.classList.toggle('is-bad', tone === 'bad');
  }

  function playSelectSound() {
    if (typeof Audio === 'undefined') return;
    try {
      const audio = audioCache.select || new Audio(SOUND_PATHS.select);
      audioCache.select = audio;
      audio.volume = 0.42;
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_error) {
      /* Interaction sound is optional when the browser blocks media playback. */
    }
  }

  function playStartSound() {
    if (typeof Audio === 'undefined') return;
    try {
      const audio = audioCache.start || new Audio(SOUND_PATHS.start);
      audioCache.start = audio;
      audio.volume = 0.58;
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_error) {
      /* Start sound is optional when the browser blocks or cannot load media. */
    }
  }

  function selectAnswer(button) {
    if (state.locked || !state.current) return;
    state.locked = true;
    clearQuestionTimer();
    playSelectSound();
    const selected = Number(button.dataset.answer || NaN);
    const correct = selected === state.current.answer;
    const now = performance.now();
    const elapsedMs = now - state.currentAttemptStartedAt;
    state.currentAttempts.push({
      selected,
      correct,
      elapsedMs
    });
    if (correct) {
      state.correct += 1;
      const moveStep = state.currentHadWrong ? state.stage.stepCorrect / 2 : state.stage.stepCorrect;
      state.distance = Math.max(MIN_DISTANCE, state.distance - moveStep);
      button.classList.add('is-correct');
      setMessage(state.currentHadWrong ? '정답! 다시 풀어서 경찰차가 조금 가까워졌어요.' : '정답! 경찰차가 범인 차량과 가까워졌어요.', 'good');
    } else {
      state.wrong += 1;
      state.currentHadWrong = true;
      state.distance = Math.min(MAX_DISTANCE, state.distance + state.stage.stepWrong);
      button.classList.add('is-wrong');
      button.disabled = true;
      setMessage('다시 풀어보세요. 다른 답을 골라볼 수 있어요.', 'bad');
    }
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.showQuestionComplete === 'function') {
      window.HahaFeedbackOverlay.showQuestionComplete(correct ? 'correct' : 'wrong', { sound: true, durationMs: 900 });
    }
    updateDistanceUI();
    if (!correct) {
      state.currentAttemptStartedAt = performance.now();
      window.setTimeout(() => {
        state.locked = false;
        startQuestionTimer();
      }, 520);
      return;
    }
    els.optionGrid.querySelectorAll('button').forEach((node) => { node.disabled = true; });
    state.history.push({
      questionIndex: state.questionIndex + 1,
      expression: state.current.expression,
      answer: state.current.answer,
      selected,
      correct,
      elapsedMs: performance.now() - state.questionStartedAt,
      distanceAfter: state.distance,
      difficulty: state.current.difficulty,
      attempts: state.currentAttempts.slice(),
      attemptCount: state.currentAttempts.length,
      hadWrongBeforeCorrect: state.currentHadWrong
    });
    state.questionIndex += 1;
    window.setTimeout(renderQuestion, 720);
  }

  function recordTimedOutQuestion() {
    const now = performance.now();
    state.wrong += 1;
    state.distance = Math.min(MAX_DISTANCE, state.distance + Number(state.stage.stepWrong || 5));
    state.currentAttempts.push({
      selected: null,
      correct: false,
      elapsedMs: now - state.currentAttemptStartedAt,
      timeout: true
    });
    state.history.push({
      questionIndex: state.questionIndex + 1,
      expression: state.current.expression,
      answer: state.current.answer,
      selected: null,
      correct: false,
      elapsedMs: now - state.questionStartedAt,
      distanceAfter: state.distance,
      difficulty: state.current.difficulty,
      attempts: state.currentAttempts.slice(),
      attemptCount: state.currentAttempts.length,
      hadWrongBeforeCorrect: true,
      timeout: true
    });
    state.questionIndex += 1;
  }

  function handleTimeout() {
    if (state.locked || !state.current) return;
    state.locked = true;
    clearQuestionTimer();
    recordTimedOutQuestion();
    els.optionGrid.querySelectorAll('button').forEach((node) => { node.disabled = true; });
    setMessage('시간이 지났어요. 범인 차량과 거리가 조금 멀어졌어요.', 'bad');
    updateDistanceUI();
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.showQuestionComplete === 'function') {
      window.HahaFeedbackOverlay.showQuestionComplete('wrong', { sound: true, durationMs: 900 });
    }
    window.setTimeout(renderQuestion, 720);
  }

  function showOutcomeThenResult() {
    clearQuestionTimer();
    state.outcomeSuccess = isCaught();
    const imagePath = state.outcomeSuccess
      ? 'images/number/number-police-chase-caught.webp'
      : 'images/number/number-police-chase-failure.webp';
    if (els.outcomeImage) {
      els.outcomeImage.src = imagePath;
      els.outcomeImage.alt = state.outcomeSuccess ? '경찰차가 범인 차량을 잡은 장면' : '범인 차량을 놓친 장면';
    }
    if (els.outcomeKicker) {
      els.outcomeKicker.textContent = state.outcomeSuccess ? 'CHASE SUCCESS' : 'CHASE TRY AGAIN';
    }
    if (els.outcomeTitle) {
      els.outcomeTitle.textContent = state.outcomeSuccess ? '범인 차량을 잡았어요!' : '조금 더 가까이 가야 해요';
    }
    if (els.outcomeSummary) {
      els.outcomeSummary.textContent = state.outcomeSuccess
        ? '성공 장면을 충분히 본 뒤 결과를 확인해요.'
        : '아쉬운 장면을 확인한 뒤 결과를 확인해요.';
    }
    setScreen('outcome');
  }

  function renderResult() {
    const totalAnswered = state.history.length || state.questionIndex;
    const totalAttempts = state.correct + state.wrong;
    const success = state.outcomeSuccess || isCaught();
    const elapsedMs = Date.now() - state.startedAtMs;
    const avgMs = state.history.length
      ? state.history.reduce((sum, item) => sum + item.elapsedMs, 0) / state.history.length
      : 0;
    els.resultTitle.textContent = success ? '범인 차량 검거 성공!' : '추격 훈련 완료';
    els.resultSummary.textContent = success
      ? `${state.stage.title}에서 범인 차량과 ${state.stage.catchGapCells}칸 이내로 가까워졌어요.`
      : `${state.correct}문항을 맞혔지만 범인 차량과 ${getDistanceCells(state.distance)}칸 떨어져 있어요.`;
    els.resultStats.innerHTML = [
      ['정확도', `${Math.round((state.correct / Math.max(1, totalAttempts)) * 100)}%`],
      ['정답', `${state.correct}개`],
      ['오답', `${state.wrong}개`],
      ['남은 거리', `${getDistanceCells(state.distance)}칸`]
    ].map(([label, value]) => `<div class="chase-result-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
    els.reportOpinion.textContent = buildOpinion(success, avgMs);
    saveResult(success, elapsedMs, avgMs, totalAnswered, totalAttempts);
    setScreen('result');
  }

  function buildOpinion(success, avgMs) {
    if (success) {
      return `추격 게임의 거리 규칙에 따라 검거 성공으로 종료되었습니다. 계획 ${QUESTION_COUNT}문항 중 실제 ${state.history.length}문항을 수행했으며, 목표 거리에 도달하면 일찍 종료될 수 있습니다. 평균 문항 소요시간은 ${(avgMs / 1000).toFixed(1)}초이며 재시도와 피드백 대기시간을 포함합니다. 이 게임 결과는 임상 기준이나 진단 점수가 아닙니다.`;
    }
    return `계획 ${QUESTION_COUNT}문항 중 실제 ${state.history.length}문항을 수행하고 추격 게임을 종료했습니다. 수식과 연산 기호, 선택한 보기를 담당 선생님과 함께 확인해 주세요. 평균 문항 소요시간은 ${(avgMs / 1000).toFixed(1)}초이며 재시도와 피드백 대기시간을 포함합니다. 이 기록만으로 임상 기능을 판단하지 않습니다.`;
  }

  function saveResult(success, elapsedMs, avgMs, totalAnswered, totalAttempts) {
    if (state.savedRunId || !window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function') return;
    const accuracy = Math.round((state.correct / Math.max(1, totalAttempts || totalAnswered)) * 100);
    const payload = {
      labKind: 'numberlab',
      reportScope: 'numberlab',
      labScope: 'numberlab',
      labTitle: LAB_TITLE,
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      totalQuestions: state.history.length,
      totalAttempts,
      correctCount: state.correct,
      wrongCount: state.wrong,
      score: accuracy,
      accuracyScore: accuracy,
      durationSeconds: Math.round(elapsedMs / 1000),
      startedAtMs: state.startedAtMs,
      reportType: 'numberlab-arithmetic-fluency-chase',
      focusKey: 'arithmetic-fluency-operation-switching',
      focusLabel: '산술 유창성/연산 전환',
      saveToClientReport: true,
      briefOpinion: els.resultSummary.textContent,
      overview: '정답률을 먼저 안정화하고, 이후 반응속도와 혼합 연산 전환 부담을 조절하는 숫자랩 산술 유창성 과제입니다.',
      recommendations: [
        success ? '다음 회기에는 더 높은 혼합 연산 단계 또는 목표 정답 수 상향을 고려합니다.' : '같은 단계에서 정답률 70~80% 이상을 먼저 안정화합니다.',
        '오답 문항은 연산 기호 확인 오류인지, 계산 사실 회상 오류인지 구분해 복습합니다.'
      ],
      cognitiveScore: accuracy,
      reactionScore: Math.max(0, Math.min(100, Math.round(100 - avgMs / 80))),
      reportInput: {
        reportEvidenceMode: 'observed-only', reportType: 'numberlab-arithmetic-fluency-chase', reportScope: 'numberlab',
        title: LAB_TITLE, stageTitle: state.stage.title,
        totalItems: state.history.length, totalQuestions: state.history.length,
        plannedTotalQuestions: QUESTION_COUNT, presentedQuestions: state.history.length,
        correctCount: state.correct, wrongCount: state.wrong, accuracyRate: accuracy,
        firstTryRate: state.history.length ? Math.round(state.history.filter(item => item.correct && !item.hadWrongBeforeCorrect).length / state.history.length * 100) : null,
        elapsedMs, startedAtMs: state.startedAtMs,
        measurementContext: { taskVersion: '20261104-chase-observed-1', accuracyKind: 'response-attempt-accuracy', wrongCountKind: 'wrong-attempts', timingKind: 'question-elapsed-including-retries-and-feedback' },
        stageId: state.stage.id,
        operations: state.stage.ops,
        targetCorrect: state.stage.targetCorrect,
        catchGapCells: state.stage.catchGapCells,
        timeLimitSeconds: state.stage.timeLimitSeconds || 0,
        chaseSuccess: success,
        startDistance: state.stage.startDistance,
        finalDistance: state.distance,
        finalDistanceCells: getDistanceCells(state.distance),
        averageResponseMs: avgMs,
        questionLogs: state.history
      },
      details: {
        planned_total_questions: QUESTION_COUNT,
        presented_question_count: state.history.length,
        answered_question_count: state.history.filter(item => item.correct).length,
        wrong_attempt_count: state.wrong,
        completion_reason: success ? 'distance-rule-capture' : 'game-terminal',
        task_version: '20261104-chase-observed-1',
        report_scope: 'numberlab',
        lab_scope: 'numberlab',
        lab_kind: 'numberlab',
        lab_label: '숫자랩',
        source_page: 'number-police-chase.html',
        chase_success: success,
        target_correct: state.stage.targetCorrect,
        catch_gap_cells: state.stage.catchGapCells,
        time_limit_seconds: state.stage.timeLimitSeconds || 0,
        final_distance: state.distance,
        final_distance_cells: getDistanceCells(state.distance),
        operation_set: state.stage.ops,
        report_guardian_summary: els.resultSummary.textContent,
        report_teacher_review_note: buildOpinion(success, avgMs),
        report_action_plan_summary: success ? '다음 단계 또는 혼합 연산으로 확장합니다.' : '현재 단계에서 정확도 안정화 후 확장합니다.',
        research_basis: [
          'Arithmetic fluency should combine accuracy, retrieval practice, strategy reflection, and progress monitoring.',
          'Game-based arithmetic practice is most useful when mathematical choices are integrated into gameplay and feedback is immediate.'
        ]
      }
    };
    const record = window.HahaLabLearningHarness.recordSession(payload);
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
  }

  function bindEvents() {
    els.stageGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (button) openIntro(button.dataset.stageId);
    });
    els.optionGrid.addEventListener('click', (event) => {
      const button = event.target.closest('.chase-option');
      if (button) selectAnswer(button);
    });
    els.startChaseButton.addEventListener('click', () => {
      playStartSound();
      startStage(state.selectedStage?.id || STAGES[0].id);
    });
    els.stageButton.addEventListener('click', () => setScreen('stage'));
    els.outcomeResultButton.addEventListener('click', renderResult);
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || STAGES[0].id));
    els.otherStageButton.addEventListener('click', () => setScreen('stage'));
  }

  function cacheElements() {
    [
      'stageView', 'introView', 'gameView', 'outcomeView', 'resultView', 'stageGrid', 'stageButton', 'stageLabel',
      'introKicker', 'introTitle', 'introSummary', 'startChaseButton',
      'stageKicker', 'taskTitle', 'questionChip', 'catchChip', 'distanceChip', 'timeChip',
      'timeLabel', 'timeFill',
      'distanceBar', 'policeCar', 'taxiCar', 'chaseMessage', 'questionText', 'optionGrid',
      'outcomeKicker', 'outcomeTitle', 'outcomeImage', 'outcomeSummary', 'outcomeResultButton',
      'resultTitle', 'resultSummary', 'resultStats', 'reportOpinion', 'retryButton', 'otherStageButton'
    ].forEach((id) => { els[id] = $(id); });
    els.road = document.querySelector('.chase-road');
  }

  function init() {
    cacheElements();
    renderStages();
    bindEvents();
    setScreen('stage');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
