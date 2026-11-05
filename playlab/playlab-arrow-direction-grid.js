(function () {
  'use strict';

  const LAB_TITLE = 'PlayLab 화살표 방향 맞추기';
  const CURRICULUM_KEY = 'playlab-arrow-direction-grid';
  const ROUNDS_PER_STAGE = 3;
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
  const SELECT_SOUND_PATH = '../sound/select.mp3';

  const COLORS = [
    { key: 'red', label: '빨강', value: '#ef3f6b' },
    { key: 'orange', label: '주황', value: '#ff8a48' },
    { key: 'yellow', label: '노랑', value: '#f5c542' },
    { key: 'green', label: '초록', value: '#20a96b' },
    { key: 'blue', label: '파랑', value: '#3b82f6' },
    { key: 'teal', label: '청록', value: '#35c2c8' },
    { key: 'purple', label: '보라', value: '#7c62d9' },
    { key: 'pink', label: '분홍', value: '#f6a3bb' },
    { key: 'gray', label: '회색', value: '#8a94a6' }
  ];

  const DIRECTIONS = [
    { key: 'up', label: '위', deg: -90 },
    { key: 'right', label: '오른쪽', deg: 0 },
    { key: 'down', label: '아래', deg: 90 },
    { key: 'left', label: '왼쪽', deg: 180 },
    { key: 'up-right', label: '오른쪽 위', deg: -45 },
    { key: 'down-right', label: '오른쪽 아래', deg: 45 },
    { key: 'down-left', label: '왼쪽 아래', deg: 135 },
    { key: 'up-left', label: '왼쪽 위', deg: -135 }
  ];

  const STAGES = [
    { id: 'stage-1', badge: '01', title: '2 x 2 기본 배열', rows: 2, cols: 2, distractors: 0, colorCount: 4, directionCount: 4, accent: '#3b82f6' },
    { id: 'stage-2', badge: '02', title: '2 x 3 위치 확장', rows: 2, cols: 3, distractors: 0, colorCount: 5, directionCount: 6, accent: '#0ea5e9' },
    { id: 'stage-3', badge: '03', title: '3 x 3 방향 확장', rows: 3, cols: 3, distractors: 1, colorCount: 6, directionCount: 6, accent: '#10b981' },
    { id: 'stage-4', badge: '04', title: '3 x 3 방해 보기', rows: 3, cols: 3, distractors: 2, colorCount: 7, directionCount: 8, accent: '#84cc16' },
    { id: 'stage-5', badge: '05', title: '3 x 4 넓은 배열', rows: 3, cols: 4, distractors: 3, colorCount: 8, directionCount: 8, accent: '#f59e0b' },
    { id: 'stage-6', badge: '06', title: '4 x 4 큰 배열', rows: 4, cols: 4, distractors: 4, colorCount: 9, directionCount: 8, accent: '#ff7a1a' },
    { id: 'stage-7', badge: '07', title: '4 x 4 유사 보기', rows: 4, cols: 4, distractors: 6, colorCount: 9, directionCount: 8, accent: '#ef4444' },
    { id: 'stage-8', badge: '08', title: '4 x 4 흔들림 셔플', rows: 4, cols: 4, distractors: 8, colorCount: 9, directionCount: 8, accent: '#8b5cf6', shuffleEveryMs: 20000 }
  ];

  const state = {
    stage: null,
    roundIndex: 0,
    round: null,
    selectedOptionId: '',
    selectedSlotIndex: -1,
    isChecking: false,
    visibleBankCapacity: 8,
    missingAnswerModalOpen: false,
    missingAnswerPromptKey: '',
    wrongSlotIndex: -1,
    placements: [],
    metrics: {
      correct: 0,
      wrong: 0,
      attempts: 0,
      resets: 0,
      dragPlacements: 0,
      clickPlacements: 0,
      responseMs: []
    },
    logs: [],
    startedAtMs: 0,
    roundStartedAtMs: 0,
    savedRunId: '',
    shuffleTimer: 0,
    supabaseClientPromise: null,
    selectAudio: null
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function average(values) {
    const filtered = values.map(Number).filter((value) => Number.isFinite(value) && value >= 0);
    if (!filtered.length) return 0;
    return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
  }

  function formatMs(ms) {
    return `${(Math.max(0, Number(ms) || 0) / 1000).toFixed(1)}초`;
  }

  function playSelectSound() {
    try {
      const audio = state.selectAudio || new Audio(SELECT_SOUND_PATH);
      state.selectAudio = audio;
      audio.volume = 0.38;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    } catch (_error) {}
  }

  function arrowSvg(item) {
    const direction = DIRECTIONS.find((entry) => entry.key === item.direction) || DIRECTIONS[0];
    const color = COLORS.find((entry) => entry.key === item.color) || COLORS[0];
    return `
      <svg class="arrow-icon" viewBox="0 0 100 100" aria-hidden="true" style="--arrow-color:${escapeHtml(color.value)}; transform: rotate(${direction.deg}deg)">
        <path d="M58 10 92 50 58 90 58 66 13 66 13 34 58 34Z"></path>
      </svg>
    `;
  }

  function makeTarget(stage, roundSeed) {
    const total = stage.rows * stage.cols;
    const colors = COLORS.slice(0, stage.colorCount);
    const directions = DIRECTIONS.slice(0, stage.directionCount);
    const offset = roundSeed % colors.length;
    return Array.from({ length: total }, (_, index) => {
      const color = colors[(index + offset + Math.floor(index / stage.cols)) % colors.length];
      const direction = directions[(index * 2 + roundSeed + Math.floor(index / 2)) % directions.length];
      return {
        targetId: `target-${roundSeed}-${index}`,
        color: color.key,
        direction: direction.key,
        answerKey: `${color.key}:${direction.key}`
      };
    });
  }

  function makeDistractors(stage, targets, roundSeed) {
    const targetKeys = new Set(targets.map((item) => item.answerKey));
    const colors = COLORS.slice(0, stage.colorCount);
    const directions = DIRECTIONS.slice(0, stage.directionCount);
    const distractors = [];
    let cursor = roundSeed * 3 + 1;
    while (distractors.length < stage.distractors) {
      const color = colors[cursor % colors.length];
      const direction = directions[(cursor + 3) % directions.length];
      const answerKey = `${color.key}:${direction.key}`;
      cursor += 1;
      if (targetKeys.has(answerKey) && distractors.length < Math.ceil(stage.distractors / 2)) continue;
      distractors.push({
        targetId: `distractor-${roundSeed}-${cursor}`,
        color: color.key,
        direction: direction.key,
        answerKey,
        distractor: true
      });
    }
    return distractors;
  }

  function makeRound(stage, roundIndex) {
    const roundSeed = (STAGES.findIndex((item) => item.id === stage.id) + 1) * 17 + roundIndex * 7;
    const targets = makeTarget(stage, roundSeed);
    const answerOptions = targets.map((target, index) => ({
      ...target,
      optionId: `answer-${roundSeed}-${index}`
    }));
    const distractors = makeDistractors(stage, targets, roundSeed).map((item, index) => ({
      ...item,
      optionId: `distractor-${roundSeed}-${index}`
    }));
    return {
      rows: stage.rows,
      cols: stage.cols,
      targets,
      options: shuffle(answerOptions.concat(distractors))
    };
  }

  function clearShuffleTimer() {
    window.clearInterval(state.shuffleTimer);
    state.shuffleTimer = 0;
  }

  function setScreen(name) {
    const map = { stage: els.stageView, game: els.gameView, result: els.resultView };
    Object.entries(map).forEach(([key, element]) => element.classList.toggle('is-active', key === name));
    els.stageButton.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel.classList.add('shell-hidden');
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'result', {
        title: () => `${LAB_TITLE}-${state.stage?.title || '리포트'}`
      });
    }
  }

  function renderStages() {
    els.stageGrid.innerHTML = `
      ${STAGES.map((stage) => `
        <button type="button" class="arrow-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--accent:${escapeHtml(stage.accent)}">
          <span class="arrow-stage-badge">${escapeHtml(stage.badge)} · ${stage.rows}x${stage.cols}</span>
          <h2>${escapeHtml(stage.title)}</h2>
          <p>필요 ${stage.rows * stage.cols}개${stage.distractors ? ` · 방해 보기 ${stage.distractors}개` : ''}${stage.shuffleEveryMs ? ' · 20초 셔플' : ''}</p>
        </button>
      `).join('')}
    `;
  }

  function optionById(optionId) {
    return state.round.options.find((option) => option.optionId === optionId) || null;
  }

  function isOptionUsed(optionId) {
    return state.placements.includes(optionId);
  }

  function renderBoards() {
    const round = state.round;
    if (state.selectedSlotIndex < 0 && state.placements.some((value) => !value)) {
      state.selectedSlotIndex = nextEmptySlotIndex();
    }
    [els.targetGrid, els.answerGrid].forEach((grid) => {
      grid.dataset.cols = String(round.cols);
      grid.style.gridTemplateRows = `repeat(${round.rows}, minmax(0, 1fr))`;
    });
    els.targetGrid.innerHTML = round.targets.map((target, index) => `
      <div class="arrow-cell" data-target-index="${index}" data-target-direction="${escapeHtml(target.direction)}" data-target-color-key="${escapeHtml(target.color)}" aria-label="${escapeHtml(target.color)} ${escapeHtml(target.direction)}">
        ${arrowSvg(target)}
      </div>
    `).join('');
    els.answerGrid.innerHTML = round.targets.map((target, index) => {
      const placedOption = optionById(state.placements[index]);
      return `
        <button type="button" class="arrow-cell is-slot${placedOption ? ' is-filled' : ''}${state.selectedSlotIndex === index ? ' is-selected-slot' : ''}${state.wrongSlotIndex === index ? ' is-wrong-slot' : ''}" data-slot-index="${index}" data-target-direction="${escapeHtml(target.direction)}" data-target-color-key="${escapeHtml(target.color)}" aria-label="${index + 1}번 빈칸">
          <span class="arrow-slot-number">${index + 1}</span>
          ${placedOption ? arrowSvg(placedOption) : ''}
        </button>
      `;
    }).join('');
    renderOptions();
  }

  function renderOptions() {
    const visibleLimit = Math.max(1, state.visibleBankCapacity);
    promoteCurrentAnswerIntoVisible(visibleLimit);
    const visibleOptionIds = getVisibleOptionIds(visibleLimit);
    els.optionBank.innerHTML = state.round.options.map((option, index) => `
      <button type="button" draggable="true" class="arrow-option${state.selectedOptionId === option.optionId ? ' is-selected' : ''}${isOptionUsed(option.optionId) ? ' is-used' : ''}${!visibleOptionIds.has(option.optionId) && !isOptionUsed(option.optionId) ? ' is-queued' : ''}" data-option-id="${escapeHtml(option.optionId)}" data-option-direction="${escapeHtml(option.direction)}" data-option-color-key="${escapeHtml(option.color)}" aria-label="${escapeHtml(option.color)} ${escapeHtml(option.direction)}">
        ${arrowSvg(option)}
      </button>
    `).join('');
  }

  function getVisibleOptionIds(visibleLimit) {
    const unusedOptions = state.round.options.filter((option) => !isOptionUsed(option.optionId));
    const visibleOptions = unusedOptions.slice(0, Math.max(1, visibleLimit));
    return new Set(visibleOptions.map((option) => option.optionId));
  }

  function getCurrentAnswerOption() {
    const target = state.round.targets[state.selectedSlotIndex] || state.round.targets[nextEmptySlotIndex()];
    if (!target) return null;
    return state.round.options.find((option) => !isOptionUsed(option.optionId) && option.answerKey === target.answerKey) || null;
  }

  function promoteCurrentAnswerIntoVisible(visibleLimit) {
    if (state.isChecking || !state.round || state.placements.every(Boolean)) return;
    const answerOption = getCurrentAnswerOption();
    if (!answerOption) return;
    const visibleOptionIds = getVisibleOptionIds(visibleLimit);
    if (visibleOptionIds.has(answerOption.optionId)) {
      state.missingAnswerPromptKey = '';
      return;
    }
    const usedOptions = state.round.options.filter((option) => isOptionUsed(option.optionId));
    const unusedOptions = state.round.options.filter((option) => !isOptionUsed(option.optionId) && option.optionId !== answerOption.optionId);
    const insertIndex = Math.min(Math.max(0, visibleLimit - 1), unusedOptions.length);
    unusedOptions.splice(insertIndex, 0, answerOption);
    state.round.options = usedOptions.concat(unusedOptions);
    state.missingAnswerPromptKey = '';
    if (state.missingAnswerModalOpen) closeMissingAnswerModal();
  }

  function ensureCurrentAnswerVisible(visibleOptionIds) {
    if (state.isChecking || !state.round || state.placements.every(Boolean)) return;
    const answerOption = getCurrentAnswerOption();
    if (!answerOption || visibleOptionIds.has(answerOption.optionId)) {
      state.missingAnswerPromptKey = '';
      return;
    }
    const promptKey = `${state.stage?.id || ''}:${state.roundIndex}:${state.selectedSlotIndex}:${answerOption.optionId}`;
    if (state.missingAnswerModalOpen || state.missingAnswerPromptKey === promptKey) return;
    state.missingAnswerPromptKey = promptKey;
    window.setTimeout(() => {
      if (!state.round || state.isChecking) return;
      const freshAnswer = getCurrentAnswerOption();
      const freshVisibleLimit = Math.max(1, state.visibleBankCapacity);
      const freshVisibleIds = getVisibleOptionIds(freshVisibleLimit);
      if (freshAnswer && !freshVisibleIds.has(freshAnswer.optionId)) openMissingAnswerModal();
    }, 0);
  }

  function openMissingAnswerModal() {
    state.missingAnswerModalOpen = true;
    els.missingAnswerModal.classList.add('is-open');
    els.missingAnswerModal.setAttribute('aria-hidden', 'false');
  }

  function closeMissingAnswerModal() {
    state.missingAnswerModalOpen = false;
    els.missingAnswerModal.classList.remove('is-open');
    els.missingAnswerModal.setAttribute('aria-hidden', 'true');
  }

  function shuffleCurrentAnswerIntoVisible() {
    closeMissingAnswerModal();
    const answerOption = getCurrentAnswerOption();
    if (!answerOption) return;
    const usedOptions = state.round.options.filter((option) => isOptionUsed(option.optionId));
    const unusedOptions = state.round.options.filter((option) => !isOptionUsed(option.optionId) && option.optionId !== answerOption.optionId);
    const visibleLimit = Math.max(1, state.visibleBankCapacity);
    const shuffled = shuffle(unusedOptions);
    const insertIndex = Math.min(Math.max(0, visibleLimit - 1), Math.floor(Math.random() * Math.max(1, visibleLimit)));
    const nextUnused = shuffled.slice();
    nextUnused.splice(insertIndex, 0, answerOption);
    state.round.options = usedOptions.concat(nextUnused);
    state.missingAnswerPromptKey = '';
    setFeedback('화살표를 섞었어요. 선택된 번호 칸에 맞는 화살표를 찾아요.', '');
    renderOptions();
  }

  function setFeedback(text, tone) {
    els.feedbackText.textContent = text || '';
    els.feedbackText.classList.toggle('is-correct', tone === 'correct');
    els.feedbackText.classList.toggle('is-wrong', tone === 'wrong');
  }

  function showOverlay(kind) {
    const overlay = window.PlaylabFeedbackOverlay || window.HahaFeedbackOverlay;
    if (overlay && typeof overlay.show === 'function') {
      overlay.show(kind === 'correct' ? 'correct' : 'wrong', { sound: true, durationMs: 1150 });
    }
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    clearShuffleTimer();
    state.stage = stage;
    state.roundIndex = 0;
    state.startedAtMs = Date.now();
    state.roundStartedAtMs = 0;
    state.selectedOptionId = '';
    state.selectedSlotIndex = -1;
    state.isChecking = false;
    state.missingAnswerModalOpen = false;
    state.missingAnswerPromptKey = '';
    state.wrongSlotIndex = -1;
    state.savedRunId = '';
    state.metrics = {
      correct: 0,
      wrong: 0,
      attempts: 0,
      resets: 0,
      dragPlacements: 0,
      clickPlacements: 0,
      responseMs: []
    };
    state.logs = [];
    setScreen('game');
    startRound();
  }

  function startRound() {
    clearShuffleTimer();
    if (!state.stage || state.roundIndex >= ROUNDS_PER_STAGE) {
      renderResult();
      return;
    }
    state.round = makeRound(state.stage, state.roundIndex);
    state.placements = Array(state.round.targets.length).fill('');
    state.selectedOptionId = '';
    state.selectedSlotIndex = 0;
    state.isChecking = false;
    state.missingAnswerModalOpen = false;
    state.missingAnswerPromptKey = '';
    state.wrongSlotIndex = -1;
    state.roundStartedAtMs = performance.now();
    els.stageKicker.textContent = `${state.stage.badge} · ${state.stage.rows}x${state.stage.cols}`;
    els.roundChip.textContent = `${state.roundIndex + 1} / ${ROUNDS_PER_STAGE}`;
    els.scoreChip.textContent = `정답 ${state.metrics.correct}`;
    updateVisibleBankCapacity();
    els.bankHint.textContent = state.stage.shuffleEveryMs ? '오른쪽 1번 칸부터 순서대로 넣어요. 20초마다 보기 화살표가 흔들린 뒤 섞입니다.' : '오른쪽 1번 칸부터 순서대로 넣어요.';
    setFeedback('', '');
    renderBoards();
    if (state.stage.shuffleEveryMs) bindStageShuffle();
  }

  function bindStageShuffle() {
    clearShuffleTimer();
    state.shuffleTimer = window.setInterval(() => {
      if (!els.gameView.classList.contains('is-active')) return;
      els.optionBank.classList.add('is-wiggling');
      window.setTimeout(() => {
        const used = new Set(state.placements.filter(Boolean));
        const fixed = state.round.options.filter((option) => used.has(option.optionId));
        const floating = state.round.options.filter((option) => !used.has(option.optionId));
        state.round.options = fixed.concat(shuffle(floating));
        els.optionBank.classList.remove('is-wiggling');
        renderOptions();
        setFeedback('보기가 섞였어요. 선택된 번호 칸에 넣을 화살표를 다시 확인해요.', '');
      }, 900);
    }, state.stage.shuffleEveryMs);
  }

  function placeOption(optionId, slotIndex, method) {
    if (state.isChecking) return;
    if (!optionId || slotIndex < 0 || slotIndex >= state.placements.length) return;
    const expectedIndex = nextEmptySlotIndex();
    if (!state.placements[slotIndex] && expectedIndex >= 0 && slotIndex !== expectedIndex) {
      state.selectedSlotIndex = expectedIndex;
      setFeedback(`${expectedIndex + 1}번 칸부터 순서대로 넣어요.`, '');
      renderBoards();
      return;
    }
    if (isOptionUsed(optionId) && state.placements[slotIndex] !== optionId) return;
    const previous = state.placements[slotIndex];
    if (previous === optionId) return;
    const existingIndex = state.placements.indexOf(optionId);
    if (existingIndex >= 0) state.placements[existingIndex] = '';
    state.placements[slotIndex] = optionId;
    if (method === 'drag') state.metrics.dragPlacements += 1;
    else state.metrics.clickPlacements += 1;
    const placed = optionById(optionId);
    const target = state.round.targets[slotIndex];
    if (!placed || !target || placed.answerKey !== target.answerKey) {
      state.isChecking = true;
      state.wrongSlotIndex = slotIndex;
      state.selectedOptionId = '';
      state.selectedSlotIndex = slotIndex;
      state.metrics.wrong += 1;
      state.metrics.attempts += 1;
      setFeedback('틀렸어요. 이 화살표만 지우고 다시 골라요.', 'wrong');
      showOverlay('wrong');
      renderBoards();
      window.setTimeout(() => {
        state.placements[slotIndex] = '';
        state.wrongSlotIndex = -1;
        state.isChecking = false;
        state.selectedSlotIndex = slotIndex;
        setFeedback(`${slotIndex + 1}번 칸에 맞는 화살표를 다시 선택해요.`, '');
        renderBoards();
      }, 620);
      return;
    }
    state.selectedOptionId = '';
    state.selectedSlotIndex = nextEmptySlotIndex();
    setFeedback('좋아요. 다음 칸을 이어서 채워요.', 'correct');
    renderBoards();
    if (state.placements.every(Boolean)) {
      window.setTimeout(checkRound, 180);
    }
  }

  function removeSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= state.placements.length) return;
    if (!state.placements[slotIndex]) return;
    state.placements[slotIndex] = '';
    state.selectedOptionId = '';
    state.selectedSlotIndex = slotIndex;
    setFeedback('선택한 칸을 다시 채워요.', '');
    renderBoards();
  }

  function nextEmptySlotIndex() {
    return state.placements.findIndex((value) => !value);
  }

  function handleOptionClick(optionId) {
    if (state.isChecking) return;
    if (isOptionUsed(optionId)) return;
    playSelectSound();
    if (state.selectedSlotIndex >= 0) {
      placeOption(optionId, state.selectedSlotIndex, 'click');
      return;
    }
    state.selectedSlotIndex = nextEmptySlotIndex();
    setFeedback(`${state.selectedSlotIndex + 1}번 칸부터 순서대로 넣어요.`, '');
    renderBoards();
  }

  function handleSlotClick(slotIndex) {
    if (state.isChecking) return;
    const expectedIndex = nextEmptySlotIndex();
    if (state.placements[slotIndex]) {
      removeSlot(slotIndex);
    } else if (slotIndex === expectedIndex) {
      state.selectedSlotIndex = slotIndex;
      setFeedback(`${slotIndex + 1}번 칸에 넣을 화살표를 고르세요.`, '');
      renderBoards();
    } else {
      state.selectedSlotIndex = expectedIndex;
      setFeedback(`${expectedIndex + 1}번 칸부터 순서대로 넣어요.`, '');
      renderBoards();
    }
  }

  function resetRound() {
    state.placements = Array(state.round.targets.length).fill('');
    state.selectedOptionId = '';
    state.selectedSlotIndex = 0;
    state.isChecking = false;
    state.metrics.resets += 1;
    setFeedback('다시 놓을 수 있어요. 왼쪽 배열을 천천히 확인해요.', '');
    renderBoards();
  }

  function checkRound() {
    if (state.isChecking) return;
    if (state.placements.some((value) => !value)) {
      setFeedback('아직 비어 있는 칸이 있어요.', 'wrong');
      showOverlay('wrong');
      return;
    }
    state.isChecking = true;
    state.metrics.attempts += 1;
    const mismatches = state.round.targets.filter((target, index) => {
      const placed = optionById(state.placements[index]);
      return !placed || placed.answerKey !== target.answerKey;
    });
    const durationMs = Math.max(0, performance.now() - (state.roundStartedAtMs || performance.now()));
    const correct = mismatches.length === 0;
    state.logs.push({
      roundIndex: state.roundIndex,
      correct,
      wrongAttempts: correct ? 0 : 1,
      mismatchCount: mismatches.length,
      durationMs,
      stageId: state.stage.id,
      grid: `${state.stage.rows}x${state.stage.cols}`,
      distractors: state.stage.distractors
    });
    state.metrics.responseMs.push(durationMs);
    els.gameCard.classList.remove('is-correct-flash', 'is-wrong-flash');
    void els.gameCard.offsetWidth;
    if (correct) {
      state.metrics.correct += 1;
      els.gameCard.classList.add('is-correct-flash');
      setFeedback('맞았어요. 색, 방향, 위치를 정확히 확인했어요.', 'correct');
      showOverlay('correct');
      window.setTimeout(() => {
        state.roundIndex += 1;
        startRound();
      }, 760);
    } else {
      state.metrics.wrong += 1;
      els.gameCard.classList.add('is-wrong-flash');
      setFeedback(`틀렸어요. 전체를 다시 놓아볼게요.`, 'wrong');
      showOverlay('wrong');
      window.setTimeout(resetRound, 760);
    }
    els.scoreChip.textContent = `정답 ${state.metrics.correct}`;
  }

  function buildReportInput(accuracy, avgResponseMs, total) {
    const elapsedMs = Math.max(0, Date.now() - (state.startedAtMs || Date.now()));
    return {
      reportType: 'visuospatial-grid-copy',
      reportProfileId: 'arrow-direction-grid',
      reportProfileLabel: '방향·공간 재구성',
      reportScope: 'playlab',
      labKind: 'playlab',
      title: '화살표 방향 맞추기',
      stageTitle: state.stage?.title || '',
      totalItems: total,
      totalQuestions: total,
      correctCount: state.metrics.correct,
      wrongCount: state.metrics.wrong,
      attemptCount: state.metrics.attempts,
      resetCount: state.metrics.resets,
      accuracyRate: accuracy,
      completionRate: Math.min(100, Math.round((state.logs.length / total) * 100)),
      elapsedMs,
      avgQuestionMs: avgResponseMs,
      benchmarkMs: 9000,
      startedAtMs: state.startedAtMs || Date.now(),
      gridSize: `${state.stage.rows}x${state.stage.cols}`,
      distractorCount: state.stage.distractors,
      shuffleRule: Boolean(state.stage.shuffleEveryMs),
      accentColor: state.stage?.accent || '#2563eb',
      questionLogs: state.logs.map((item) => ({
        questionIndex: item.roundIndex,
        success: item.correct,
        durationMs: item.durationMs,
        wrongAttempts: item.wrongAttempts,
        mismatchCount: item.mismatchCount,
        questionType: 'arrow-direction-grid-copy',
        grid: item.grid,
        distractors: item.distractors
      }))
    };
  }

  function buildProfessionalReport(reportInput, accuracy, avgResponseMs) {
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function') {
      return window.PlaylabReportEngine.buildReport(reportInput);
    }
    const selfMonitoring = Math.max(25, Math.min(98, 100 - (reportInput.wrongCount * 9) - (reportInput.resetCount * 3)));
    return {
      integratedScore: accuracy,
      accuracyRate: accuracy,
      elapsedMs: reportInput.elapsedMs,
      briefOpinion: '색, 방향, 위치 단서를 동시에 비교하여 빈칸에 재구성하는 시지각-공간 작업기억 수행을 관찰했습니다.',
      longOpinion: '정답률뿐 아니라 방해 보기 조건에서의 재확인, 오답 후 수정, 평균 반응 시간을 함께 보며 방향 변별과 위치 유지 전략을 해석합니다.',
      recommendations: [
        { title: '위치 언어화', desc: '왼쪽 위, 가운데, 오른쪽 아래처럼 위치를 말로 짚은 뒤 배치합니다.' },
        { title: '방향 확인 루틴', desc: '색을 고른 뒤 화살표 끝이 향하는 방향을 한 번 더 확인합니다.' },
        { title: '방해 보기 조절', desc: '오답이 많을 때는 방해 보기 수를 줄이고 2x2 또는 2x3 배열부터 다시 시작합니다.' }
      ],
      axes: [
        { id: 'visualCue', label: '시각 단서', score: accuracy },
        { id: 'spatial', label: '공간 위치', score: accuracy },
        { id: 'attention', label: '주의 유지', score: Math.max(20, Math.min(98, accuracy - reportInput.wrongCount * 2 + 8)) },
        { id: 'speed', label: '반응속도', score: Math.max(20, Math.min(98, Math.round(100 - avgResponseMs / 180))) },
        { id: 'selfMonitoring', label: '자기점검', score: selfMonitoring },
        { id: 'completion', label: '수행완료', score: reportInput.completionRate }
      ]
    };
  }

  function getAxisAverage(report, axisIds) {
    const axes = report && Array.isArray(report.axes) ? report.axes : [];
    const values = axisIds.map((id) => {
      const axis = axes.find((item) => item && item.id === id);
      return axis ? Number(axis.score || 0) || 0 : 0;
    }).filter((value) => value > 0);
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }

  function recommendationLines(report) {
    return (Array.isArray(report && report.recommendations) ? report.recommendations : []).map((item) => {
      if (!item) return '';
      const title = String(item.title || '').trim();
      const desc = String(item.desc || '').trim();
      return title && desc ? `${title}: ${desc}` : (title || desc);
    }).filter(Boolean);
  }

  function buildReportPayload(reportInput, report) {
    const score = Number(report.integratedScore || reportInput.accuracyRate || 0) || 0;
    const briefOpinion = String(report.briefOpinion || '색, 방향, 위치 단서를 동시에 비교하여 같은 배열로 재구성하는 수행을 관찰했습니다.').trim();
    const guardianSummary = '화살표의 색, 방향, 위치를 순서대로 확인해 같은 배열로 재구성했습니다. 보호자 공유에서는 점수보다 1번 칸부터 차례대로 확인하는 루틴, 오답 후 다시 시도하는 흐름, 보기 방해 자극 속에서 필요한 화살표를 찾는 과정을 함께 봅니다.';
    const teacherReviewNote = '오답 위치, 보기 탐색 방식, 순서 유지 여부를 함께 보며 시지각-공간 작업기억과 자기점검 전략을 해석합니다.';
    const actionPlanSummary = '다음 회기에는 같은 격자 크기에서 정확도가 유지되는지 확인한 뒤, 안정되면 방해 보기 수나 격자 크기를 한 단계만 올립니다. 흔들리면 2x2 또는 2x3에서 위치 말하기를 함께 사용합니다.';
    const roleNotes = [
      { title: '시지각·공간 처리', desc: '색과 방향을 동시에 비교하고 격자 위치를 유지해 재구성하는 과정을 봅니다.' },
      { title: '주의·실행기능', desc: '방해 보기 속에서 필요한 화살표를 찾고 1번 칸부터 순서를 지키는지를 봅니다.' },
      { title: '수업 적용', desc: '종이 화살표 카드와 위치판을 준비하지 않고 화면에서 난이도와 수행 기록을 함께 관리합니다.' }
    ];
    const evidenceBasis = [
      '색-방향 결합 단서를 활용한 시각 변별',
      '격자 위치를 순서대로 유지하는 공간 작업기억',
      '오답 후 전체 리셋 조건에서의 자기점검 반응',
      '방해 보기 조건에서의 선택적 주의와 탐색 전략'
    ];
    return {
      labKind: 'playlab',
      reportScope: 'playlab',
      saveToClientReport: true,
      curriculumKey: CURRICULUM_KEY,
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      labTitle: LAB_TITLE,
      totalQuestions: reportInput.totalQuestions,
      correctCount: reportInput.correctCount,
      wrongCount: reportInput.wrongCount,
      score,
      accuracyScore: reportInput.accuracyRate,
      durationSeconds: Number(reportInput.elapsedMs || 0) / 1000,
      startedAtMs: reportInput.startedAtMs,
      reportType: reportInput.reportType,
      reportInput,
      briefOpinion,
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      roleNotes,
      evidenceBasis,
      overview: `${report.longOpinion || ''}\n전문 해석: 이 과제는 색-방향 결합, 공간 위치 재구성, 방해 자극 억제, 시각-운동 협응, 오류 후 자기점검을 회기 관찰 지표로 사용합니다.`,
      recommendations: recommendationLines(report),
      cognitiveScore: getAxisAverage(report, ['visualCue', 'spatial', 'attention']) || score,
      reactionScore: getAxisAverage(report, ['speed', 'selfMonitoring', 'completion']) || score,
      focusKey: 'arrow-direction-grid',
      focusLabel: '방향·공간 재구성',
      details: {
        curriculum_key: CURRICULUM_KEY,
        stage_key: state.stage.id,
        report_scope: 'playlab',
        lab_scope: 'playlab',
        report_focus_key: 'arrow-direction-grid',
        report_focus_label: '방향·공간 재구성',
        report_profile_id: reportInput.reportProfileId,
        report_profile_label: reportInput.reportProfileLabel,
        report_type: reportInput.reportType,
        report_headline: String(report.headline || '').trim(),
        report_integrated_score: Number(report.integratedScore || 0) || 0,
        report_brief_opinion: briefOpinion,
        report_guardian_summary: guardianSummary,
        report_teacher_review_note: teacherReviewNote,
        report_action_plan_summary: actionPlanSummary,
        report_action_plan_policy: 'teacher-review-required',
        report_display_modes: ['teacher', 'guardian'],
        report_role_notes: roleNotes,
        report_evidence_basis: evidenceBasis,
        report_axes: Array.isArray(report.axes) ? report.axes.map((axis) => ({
          id: String(axis.id || '').trim(),
          label: String(axis.label || '').trim(),
          score: Number(axis.score || 0) || 0
        })) : [],
        report_domain: '시지각 방향 변별 및 공간 작업기억',
        grid_size: reportInput.gridSize,
        distractor_count: reportInput.distractorCount,
        shuffle_rule: reportInput.shuffleRule,
        reset_count: reportInput.resetCount,
        click_placements: state.metrics.clickPlacements,
        drag_placements: state.metrics.dragPlacements,
        avg_question_ms: reportInput.avgQuestionMs,
        question_logs: reportInput.questionLogs
      }
    };
  }

  function saveLearningReport(reportInput, report) {
    if (!state.stage || state.savedRunId) return;
    const payload = buildReportPayload(reportInput, report);
    state.savedRunId = `saving-${Date.now()}`;
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === 'function') {
      const record = window.HahaLabLearningHarness.recordSession(payload);
      state.savedRunId = record && record.id ? record.id : state.savedRunId;
    }
    saveSupabaseReport(payload, reportInput).catch((error) => {
      console.error('[playlab-arrow-direction-grid] history save failed:', error);
    });
  }

  function parseMaybeJson(value, fallback) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return fallback;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function readLaunchContext() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const launchKey = String(params.get('labLaunchKey') || '').trim();
      if (launchKey && launchKey.indexOf(LAUNCH_CONTEXT_STORAGE_PREFIX) === 0 && window.sessionStorage) {
        const parsed = window.HahaLabLearningHarness?.readLaunchContext?.() || parseMaybeJson(window.sessionStorage.getItem(launchKey), null);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      const teacherId = String(params.get('teacherId') || '').trim();
      const clientId = String(params.get('clientId') || '').trim();
      if (teacherId && clientId) {
        return {
          teacherId,
          teacherName: String(params.get('teacherName') || '').trim(),
          clientId,
          clientName: String(params.get('clientName') || '').trim(),
          clientType: String(params.get('clientType') || 'client').trim() || 'client',
          source: 'query'
        };
      }
    } catch (_error) {}
    return null;
  }

  function getSupabaseClient() {
    if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
    if (state.supabaseClientPromise) return state.supabaseClientPromise;
    state.supabaseClientPromise = Promise.resolve().then(() => {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }).catch(() => null);
    return state.supabaseClientPromise;
  }

  async function saveSupabaseReport(payload, reportInput) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = await getSupabaseClient();
    if (!client) return { skipped: true };
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(reportInput.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(reportInput.elapsedMs || 0) / 60000));
    const details = Object.assign({
      report_scope: 'playlab',
      lab_scope: 'playlab',
      lab_label: '플레이랩',
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
      report_input: payload.reportInput,
      report_integrated_score: Number(payload.details.report_integrated_score || 0) || 0,
      report_headline: payload.details.report_headline,
      report_brief_opinion: payload.briefOpinion,
      report_overview: payload.overview,
      report_recommendations: payload.recommendations,
      report_axes: payload.details.report_axes,
      report_cognitive_score: payload.cognitiveScore,
      report_reaction_score: payload.reactionScore,
      report_focus_key: payload.focusKey,
      report_focus_label: payload.focusLabel,
      report_guardian_summary: payload.guardianSummary,
      report_teacher_review_note: payload.teacherReviewNote,
      report_action_plan_summary: payload.actionPlanSummary,
      report_role_notes: payload.roleNotes,
      report_evidence_basis: payload.evidenceBasis,
      curriculum_key: payload.curriculumKey,
      stage_key: payload.stageKey,
      source_page: 'playlab-arrow-direction-grid.html'
    }, payload.details);
    const row = {
      teacher_id: String(launchContext.teacherId || '').trim(),
      client_id: String(launchContext.clientId || '').trim(),
      client_name: String(launchContext.clientName || '').trim(),
      type: String(launchContext.clientType || 'client').trim() || 'client',
      category: 'session_history',
      action: LAB_SESSION_COMPLETION_ACTION,
      action_type: LAB_TITLE,
      event_datetime: completedAt,
      start_datetime: startedAt,
      end_datetime: completedAt,
      duration: `${durationMinutes} minutes`,
      duration_minutes: durationMinutes,
      details: JSON.stringify(details),
      metadata: {
        report_scope: 'playlab',
        lab_scope: 'playlab',
        report_integrated_score: details.report_integrated_score,
        report_cognitive_score: details.report_cognitive_score,
        report_reaction_score: details.report_reaction_score,
        report_focus_key: details.report_focus_key,
        report_focus_label: details.report_focus_label,
        report_guardian_summary: details.report_guardian_summary,
        report_action_plan_summary: details.report_action_plan_summary,
        curriculum_key: details.curriculum_key,
        duration_minutes: durationMinutes,
        duration: `${durationMinutes} minutes`
      },
      memo: payload.stageTitle || LAB_TITLE
    };
    const result = await client.from('histories').insert(row);
    if (result && result.error) throw result.error;
    return result;
  }

  function renderResult() {
    clearShuffleTimer();
    const total = ROUNDS_PER_STAGE;
    const accuracy = Math.round((state.metrics.correct / total) * 100);
    const avgResponseMs = Math.round(average(state.metrics.responseMs));
    const reportInput = buildReportInput(accuracy, avgResponseMs, total);
    const report = buildProfessionalReport(reportInput, accuracy, avgResponseMs);
    saveLearningReport(reportInput, report);
    els.resultTitle.textContent = `${state.stage.title} 완료`;
    els.resultSummary.textContent = `${total}문항 중 ${state.metrics.correct}문항을 정확히 맞췄어요. 색, 방향, 위치를 함께 확인하는 수행을 기록했습니다.`;
    els.resultStats.innerHTML = `
      <div class="arrow-stat"><span>정확도</span><strong>${accuracy}%</strong></div>
      <div class="arrow-stat"><span>정답</span><strong>${state.metrics.correct}</strong></div>
      <div class="arrow-stat"><span>오답 시도</span><strong>${state.metrics.wrong}</strong></div>
      <div class="arrow-stat"><span>평균 반응</span><strong>${formatMs(avgResponseMs)}</strong></div>
    `;
    els.reportOpinion.innerHTML = report && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === 'function'
      ? window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' })
      : `<p>${escapeHtml(report.longOpinion || report.briefOpinion || '')}</p>`;
    setScreen('result');
  }

  function openHelp() {
    els.helpModal.classList.add('is-open');
    els.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    els.helpModal.classList.remove('is-open');
    els.helpModal.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
    window.addEventListener('resize', () => {
      updateVisibleBankCapacity();
      if (state.round) renderOptions();
    });
    els.stageGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (button) startStage(button.dataset.stageId);
    });
    els.stageButton.addEventListener('click', () => {
      clearShuffleTimer();
      setScreen('stage');
    });
    els.optionBank.addEventListener('click', (event) => {
      const button = event.target.closest('[data-option-id]');
      if (button) handleOptionClick(button.dataset.optionId);
    });
    els.optionBank.addEventListener('dragstart', (event) => {
      const button = event.target.closest('[data-option-id]');
      if (!button || isOptionUsed(button.dataset.optionId)) return;
      event.dataTransfer.setData('text/plain', button.dataset.optionId);
      event.dataTransfer.effectAllowed = 'move';
    });
    els.answerGrid.addEventListener('click', (event) => {
      const slot = event.target.closest('[data-slot-index]');
      if (slot) handleSlotClick(Number(slot.dataset.slotIndex));
    });
    els.answerGrid.addEventListener('dragover', (event) => {
      const slot = event.target.closest('[data-slot-index]');
      if (!slot) return;
      event.preventDefault();
      slot.classList.add('is-drop-target');
    });
    els.answerGrid.addEventListener('dragleave', (event) => {
      const slot = event.target.closest('[data-slot-index]');
      if (slot) slot.classList.remove('is-drop-target');
    });
    els.answerGrid.addEventListener('drop', (event) => {
      const slot = event.target.closest('[data-slot-index]');
      if (!slot) return;
      event.preventDefault();
      slot.classList.remove('is-drop-target');
      placeOption(event.dataTransfer.getData('text/plain'), Number(slot.dataset.slotIndex), 'drag');
    });
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || STAGES[0].id));
    els.otherStageButton.addEventListener('click', () => {
      clearShuffleTimer();
      setScreen('stage');
    });
    els.helpButton.addEventListener('click', openHelp);
    els.helpClose.addEventListener('click', closeHelp);
    els.missingAnswerConfirm.addEventListener('click', shuffleCurrentAnswerIntoVisible);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeHelp();
        if (state.missingAnswerModalOpen) shuffleCurrentAnswerIntoVisible();
      }
    });
  }

  function updateVisibleBankCapacity() {
    if (!els.optionBank) return;
    const width = els.optionBank.clientWidth || 0;
    const optionSize = window.matchMedia && window.matchMedia('(max-width: 560px)').matches ? 74 : 98;
    state.visibleBankCapacity = Math.max(3, Math.floor(Math.max(0, width - 34) / optionSize));
  }

  function cacheElements() {
    [
      'stageView', 'gameView', 'resultView', 'stageGrid', 'stageLabel', 'stageButton',
      'helpButton', 'helpModal', 'helpClose', 'gameCard', 'stageKicker', 'gameTitle',
      'roundChip', 'scoreChip', 'targetGrid', 'answerGrid', 'optionBank', 'bankHint',
      'feedbackText', 'resultTitle', 'resultSummary',
      'resultStats', 'reportOpinion', 'retryButton', 'otherStageButton', 'helpHow', 'helpBenefit',
      'missingAnswerModal', 'missingAnswerConfirm'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function initHelpText() {
    const config = window.PLAYLAB_PAGE_CONFIG || {};
    if (els.helpHow) els.helpHow.textContent = config.helpHow || '';
    if (els.helpBenefit) els.helpBenefit.textContent = config.helpBenefit || '';
  }

  function init() {
    cacheElements();
    initHelpText();
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
