(function () {
  'use strict';

  const DATA = window.HAHA_LAB_SITUATION_SEQUENCE || {};
  const STAGES = Array.isArray(DATA.stages) ? DATA.stages : [];
  const CURRICULUM_KEY = DATA.curriculumKey || 'cardlab-situation-sequence';
  const LAB_TITLE = DATA.title || '상황별 스크립트 순서 맞추기';
  const DEFAULT_RANDOM_COUNT = 10;
  const MAX_CUSTOM_COUNT = 100;
  const CUSTOM_STAGE_ID = 'custom-select';
  const AUDIO_FILES = {
    select: '../sound/select.mp3',
    correct: '../sound/correct.mp3',
    wrong: '../sound/error.mp3',
    complete: '../sound/happy_victory.mp3'
  };

  const els = {
    stageView: document.getElementById('stageView'),
    customView: document.getElementById('customView'),
    gameView: document.getElementById('gameView'),
    resultView: document.getElementById('resultView'),
    stageGrid: document.getElementById('stageGrid'),
    stageLabel: document.getElementById('stageLabel'),
    stageButton: document.getElementById('stageButton'),
    helpButton: document.getElementById('helpButton'),
    helpModal: document.getElementById('helpModal'),
    helpCloseButton: document.getElementById('helpCloseButton'),
    customList: document.getElementById('customList'),
    customSummary: document.getElementById('customSummary'),
    customCountInput: document.getElementById('customCountInput'),
    customSelectAllButton: document.getElementById('customSelectAllButton'),
    customClearButton: document.getElementById('customClearButton'),
    customStartButton: document.getElementById('customStartButton'),
    questionPrompt: document.getElementById('questionPrompt'),
    questionToast: document.getElementById('questionToast'),
    questionToastText: document.getElementById('questionToastText'),
    advanceToast: document.getElementById('advanceToast'),
    advanceToastText: document.getElementById('advanceToastText'),
    advanceNextButton: document.getElementById('advanceNextButton'),
    slotBoard: document.getElementById('slotBoard'),
    cardBank: document.getElementById('cardBank'),
    feedbackText: document.getElementById('feedbackText'),
    resultTitle: document.getElementById('resultTitle'),
    resultSummary: document.getElementById('resultSummary'),
    resultCorrect: document.getElementById('resultCorrect'),
    resultWrong: document.getElementById('resultWrong'),
    resultScore: document.getElementById('resultScore'),
    resultStageButton: document.getElementById('resultStageButton'),
    resultRetryButton: document.getElementById('resultRetryButton'),
    effectLayer: document.getElementById('effectLayer')
  };

  if (!els.stageView || !els.stageGrid || !STAGES.length) return;

  const state = {
    selectedStageId: getInitialStageId(),
    phase: 'stage',
    run: null,
    draggedCardId: '',
    pointerDrag: null,
    suppressCardClick: '',
    awaitingAdvance: false,
    savedRunId: '',
    customSelectedIds: new Set(),
    customInitialized: false,
    toastTimer: 0
  };

  const audioCache = new Map();

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shuffle(items) {
    const next = Array.isArray(items) ? items.slice() : [];
    for (let index = next.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [next[index], next[swap]] = [next[swap], next[index]];
    }
    return next;
  }

  function sampleItems(items, count) {
    const limit = Math.max(1, Math.min(Number(count) || DEFAULT_RANDOM_COUNT, items.length));
    return shuffle(items).slice(0, limit);
  }

  function pickStage() {
    if (state.selectedStageId === CUSTOM_STAGE_ID) {
      return {
        id: CUSTOM_STAGE_ID,
        title: '직접 선택',
        badge: '선택 출제',
        accent: '#8b5cf6',
        summary: '카테고리와 문제 제목을 보고 필요한 문제만 골라 풀어요.'
      };
    }
    return STAGES.find((stage) => stage.id === state.selectedStageId) || STAGES[0];
  }

  function getInitialStageId() {
    const hash = decodeURIComponent(String(window.location.hash || '').replace(/^#/, ''));
    if (hash === CUSTOM_STAGE_ID) return hash;
    if (STAGES.some((stage) => stage.id === hash)) return hash;
    return STAGES[0]?.id || '';
  }

  function getPlayableQuestions(stage) {
    return (Array.isArray(stage?.questions) ? stage.questions : []).filter((question) => {
      return question && question.enabled !== false && Array.isArray(question.cards) && question.cards.length === 5;
    });
  }

  function getAllPlayableQuestions() {
    return STAGES.flatMap((stage) => {
      return getPlayableQuestions(stage).map((question) => Object.assign({}, question, {
        stageId: stage.id,
        stageTitle: stage.title,
        stageBadge: stage.badge,
        stageAccent: stage.accent
      }));
    });
  }

  function showScreen(name) {
    state.phase = name;
    const map = {
      stage: els.stageView,
      custom: els.customView,
      game: els.gameView,
      result: els.resultView
    };
    Object.entries(map).forEach(([key, node]) => {
      if (!node) return;
      node.classList.toggle('is-active', key === name);
    });
    const stage = pickStage();
    const inStage = name === 'stage';
    els.stageButton?.classList.toggle('shell-hidden', inStage);
    els.stageLabel?.classList.toggle('shell-hidden', inStage);
    if (els.stageLabel) els.stageLabel.textContent = inStage ? '' : stage.title;
    document.documentElement.style.setProperty('--situation-accent', stage.accent || '#22c55e');
    document.title = inStage ? LAB_TITLE : `${LAB_TITLE} · ${stage.title}`;
  }

  function playAudio(kind) {
    const src = AUDIO_FILES[kind];
    if (!src) return;
    try {
      let audio = audioCache.get(src);
      if (!audio) {
        audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = kind === 'wrong' ? 0.55 : 0.7;
        audioCache.set(src, audio);
      }
      audio.currentTime = 0;
      void audio.play();
    } catch (_error) {}
  }

  function vibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (_error) {}
  }

  function renderStages() {
    const customStage = {
      id: CUSTOM_STAGE_ID,
      title: '직접 선택',
      badge: '선택 출제',
      accent: '#8b5cf6',
      summary: '카테고리와 문제 제목을 보고 1개부터 100개까지 직접 골라요.',
      custom: true
    };
    els.stageGrid.innerHTML = STAGES.concat(customStage).map((stage) => {
      const active = stage.id === state.selectedStageId;
      const playable = stage.custom ? getAllPlayableQuestions().length : getPlayableQuestions(stage).length;
      const countLabel = stage.custom ? '1~100문항' : `${Math.min(DEFAULT_RANDOM_COUNT, playable)}문제 랜덤`;
      return [
        `<button type="button" class="wordbuild-stage-card" data-stage-id="${escapeHtml(stage.id)}" aria-pressed="${active ? 'true' : 'false'}" style="--stage-accent:${escapeHtml(stage.accent || '#22c55e')};--stage-soft:rgba(34,197,94,0.14)">`,
        '  <div class="wordbuild-stage-top">',
        `    <span class="wordbuild-stage-chip">${escapeHtml(stage.badge || 'STAGE')}</span>`,
        `    <span class="wordbuild-stage-code">${escapeHtml(countLabel)}</span>`,
        '  </div>',
        '  <div class="wordbuild-stage-main">',
        `    <div class="wordbuild-stage-name">${escapeHtml(stage.title)}</div>`,
        `    <div class="wordbuild-stage-detail">${escapeHtml(stage.summary || '')}</div>`,
        '  </div>',
        '</button>'
      ].join('');
    }).join('');

    els.stageGrid.querySelectorAll('[data-stage-id]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedStageId = button.getAttribute('data-stage-id') || state.selectedStageId;
        history.replaceState(null, '', `#${state.selectedStageId}`);
        playAudio('select');
        if (state.selectedStageId === CUSTOM_STAGE_ID) {
          renderCustomBuilder();
          showScreen('custom');
          return;
        }
        startStage();
      });
    });
  }

  function renderCustomBuilder() {
    const questions = getAllPlayableQuestions();
    if (!state.customInitialized) {
      state.customInitialized = true;
    }
    const byStage = STAGES.map((stage) => ({
      stage,
      questions: questions.filter((question) => question.stageId === stage.id)
    }));
    els.customList.innerHTML = byStage.map(({ stage, questions: stageQuestions }) => {
      return [
        `<section class="situation-custom-group" style="--stage-accent:${escapeHtml(stage.accent || '#22c55e')}">`,
        `  <div class="situation-custom-category">${escapeHtml(stage.title)} <span>${stageQuestions.length}문항</span></div>`,
        '  <div class="situation-custom-items">',
        stageQuestions.map((question) => {
          const selected = state.customSelectedIds.has(question.id);
          return `<button type="button" class="situation-custom-item${selected ? ' is-selected' : ''}" data-question-id="${escapeHtml(question.id)}" aria-pressed="${selected ? 'true' : 'false'}"><span>${escapeHtml(String(question.number).padStart(2, '0'))}</span>${escapeHtml(question.title)}</button>`;
        }).join(''),
        '  </div>',
        '</section>'
      ].join('');
    }).join('');
    els.customList.querySelectorAll('[data-question-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const questionId = button.getAttribute('data-question-id') || '';
        if (state.customSelectedIds.has(questionId)) {
          state.customSelectedIds.delete(questionId);
        } else {
          state.customSelectedIds.add(questionId);
        }
        button.classList.toggle('is-selected', state.customSelectedIds.has(questionId));
        button.setAttribute('aria-pressed', state.customSelectedIds.has(questionId) ? 'true' : 'false');
        updateCustomSummary();
      });
    });
    updateCustomSummary();
  }

  function requestedCustomCount() {
    const value = Number(els.customCountInput?.value || DEFAULT_RANDOM_COUNT);
    return Math.max(1, Math.min(MAX_CUSTOM_COUNT, Math.round(value || DEFAULT_RANDOM_COUNT)));
  }

  function updateCustomSummary() {
    if (els.customCountInput) els.customCountInput.value = String(requestedCustomCount());
    const selectedCount = state.customSelectedIds.size;
    const willRun = Math.min(selectedCount, requestedCustomCount());
    if (els.customSummary) {
      els.customSummary.textContent = selectedCount
        ? `${selectedCount}개 선택됨 · 실제 출제 ${willRun}문제`
        : '문제를 1개 이상 선택해 주세요.';
    }
    if (els.customStartButton) els.customStartButton.disabled = selectedCount < 1;
  }

  function buildRun(stage, options = {}) {
    const sourceQuestions = Array.isArray(options.questions) ? options.questions : getPlayableQuestions(stage);
    const requestedCount = Number(options.requestedCount) || DEFAULT_RANDOM_COUNT;
    const questions = sampleItems(sourceQuestions, Math.min(requestedCount, sourceQuestions.length));
    return {
      id: `${stage.id}-${Date.now()}`,
      stage,
      selectionMode: options.selectionMode || 'stage',
      requestedCount,
      sourceQuestions,
      startedAtMs: Date.now(),
      questions,
      currentIndex: 0,
      completed: 0,
      wrongCount: 0,
      solvedIds: [],
      wrongByQuestion: {},
      slots: [],
      bank: []
    };
  }

  function startStage() {
    const stage = pickStage();
    const run = buildRun(stage, { requestedCount: DEFAULT_RANDOM_COUNT });
    if (!run.questions.length) return;
    state.run = run;
    state.savedRunId = '';
    renderQuestion();
    showScreen('game');
  }

  function restartStage() {
    const run = state.run;
    if (run?.selectionMode === 'custom') {
      startCustomRun(run.sourceQuestions, run.requestedCount);
      return;
    }
    startStage();
  }

  function startCustomRun(sourceQuestions, requestedCount) {
    const questions = Array.isArray(sourceQuestions) ? sourceQuestions : getAllPlayableQuestions().filter((question) => state.customSelectedIds.has(question.id));
    const stage = pickStage();
    const run = buildRun(stage, {
      questions,
      requestedCount: Math.min(MAX_CUSTOM_COUNT, Number(requestedCount) || requestedCustomCount()),
      selectionMode: 'custom'
    });
    if (!run.questions.length) {
      updateCustomSummary();
      return;
    }
    state.run = run;
    state.savedRunId = '';
    renderQuestion();
    showScreen('game');
  }

  function currentQuestion() {
    return state.run?.questions?.[state.run.currentIndex] || null;
  }

  function resetQuestionState(question) {
    state.run.slots = Array.from({ length: 5 }, () => null);
    state.run.bank = shuffle(question.cards);
    state.draggedCardId = '';
  }

  function renderQuestion() {
    const run = state.run;
    const question = currentQuestion();
    if (!run || !question) {
      completeStage();
      return;
    }
    resetQuestionState(question);
    state.awaitingAdvance = false;
    hideAdvanceToast();
    const prompt = question.prompt || `${question.title} 해요!`;
    if (els.questionPrompt) els.questionPrompt.textContent = prompt;
    els.feedbackText.textContent = '첫 번째 장면부터 골라보세요.';
    renderSlots();
    renderBank();
    updateProgress();
    showQuestionToast(prompt);
  }

  function updateProgress() {
    const filled = state.run?.slots?.filter(Boolean).length || 0;
    if (els.feedbackText && filled > 0) {
      els.feedbackText.textContent = `${filled}번째 장면까지 맞췄어요.`;
    }
  }

  function showQuestionToast(prompt) {
    if (!els.questionToast || !els.questionToastText) return;
    window.clearTimeout(state.toastTimer);
    els.questionToastText.textContent = prompt;
    els.questionToast.setAttribute('aria-hidden', 'false');
    els.questionToast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => {
      els.questionToast.classList.remove('is-visible');
      els.questionToast.setAttribute('aria-hidden', 'true');
    }, 1500);
  }

  function renderSlots() {
    const slots = state.run?.slots || [];
    els.slotBoard.innerHTML = slots.map((card, index) => {
      if (card) {
        return `<button type="button" class="situation-slot is-filled" data-slot-index="${index}" aria-label="${index + 1}번째 장면 제거"><img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.alt)}"><span class="situation-card-order">${index + 1}</span></button>`;
      }
      return `<div class="situation-slot" data-slot-index="${index}" aria-label="${index + 1}번째 장면"><span>${index + 1}</span></div>`;
    }).join('');

    els.slotBoard.querySelectorAll('.situation-slot').forEach((slot) => {
      slot.addEventListener('dragover', onSlotDragOver);
      slot.addEventListener('dragleave', () => slot.classList.remove('is-drop-ready'));
      slot.addEventListener('drop', onSlotDrop);
      slot.addEventListener('click', () => removeSlotCard(Number(slot.getAttribute('data-slot-index'))));
    });
  }

  function renderBank() {
    const placed = new Set((state.run?.slots || []).filter(Boolean).map((card) => card.id));
    els.cardBank.innerHTML = (state.run?.bank || []).map((card) => {
      const disabled = placed.has(card.id);
      return [
        `<button type="button" class="situation-card" data-card-id="${escapeHtml(card.id)}" draggable="${disabled ? 'false' : 'true'}" ${disabled ? 'disabled' : ''}>`,
        `  <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.alt)}">`,
        '</button>'
      ].join('');
    }).join('');

    els.cardBank.querySelectorAll('.situation-card').forEach((cardButton) => {
      cardButton.addEventListener('click', () => {
        const cardId = cardButton.getAttribute('data-card-id') || '';
        if (state.suppressCardClick === cardId) return;
        placeByClick(cardId);
      });
      cardButton.addEventListener('pointerdown', onCardPointerDown);
      cardButton.addEventListener('dragstart', (event) => {
        if (cardButton.disabled) return;
        state.draggedCardId = cardButton.getAttribute('data-card-id') || '';
        event.dataTransfer?.setData('text/plain', state.draggedCardId);
        event.dataTransfer.effectAllowed = 'move';
      });
      cardButton.addEventListener('dragend', () => {
        state.draggedCardId = '';
        els.slotBoard.querySelectorAll('.is-drop-ready').forEach((node) => node.classList.remove('is-drop-ready'));
      });
    });
  }

  function onCardPointerDown(event) {
    const button = event.currentTarget;
    if (!button || button.disabled || event.pointerType === 'mouse' && event.button !== 0) return;
    state.pointerDrag = {
      cardId: button.getAttribute('data-card-id') || '',
      source: button,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      started: false,
      ghost: null
    };
  }

  function onPointerMove(event) {
    const drag = state.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.started && Math.hypot(dx, dy) < 8) return;
    event.preventDefault();
    if (!drag.started) startPointerDrag(drag, event);
    drag.currentX = event.clientX;
    drag.currentY = event.clientY;
    movePointerGhost(drag);
    updatePointerDropTarget(event.clientX, event.clientY);
  }

  function onPointerUp(event) {
    const drag = state.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    state.pointerDrag = null;
    clearPointerDropTargets();
    if (drag.started) {
      event.preventDefault();
      const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.situation-slot');
      if (slot) tryPlaceCard(drag.cardId, Number(slot.getAttribute('data-slot-index')));
      state.suppressCardClick = drag.cardId;
      setTimeout(() => {
        if (state.suppressCardClick === drag.cardId) state.suppressCardClick = '';
      }, 80);
    }
    if (drag.source) drag.source.classList.remove('is-pointer-dragging');
    drag.ghost?.remove();
    state.draggedCardId = '';
  }

  function onPointerCancel(event) {
    const drag = state.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    state.pointerDrag = null;
    clearPointerDropTargets();
    if (drag.source) drag.source.classList.remove('is-pointer-dragging');
    drag.ghost?.remove();
    state.draggedCardId = '';
  }

  function startPointerDrag(drag, event) {
    drag.started = true;
    state.draggedCardId = drag.cardId;
    drag.source.classList.add('is-pointer-dragging');
    const rect = drag.source.getBoundingClientRect();
    const ghost = drag.source.cloneNode(true);
    ghost.className = `${drag.source.className} situation-drag-ghost`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    document.body.appendChild(ghost);
    drag.ghost = ghost;
    movePointerGhost(drag, event.clientX, event.clientY);
  }

  function movePointerGhost(drag) {
    if (!drag.ghost) return;
    drag.ghost.style.transform = `translate(${drag.currentX}px, ${drag.currentY}px) translate(-50%, -50%) scale(1.03)`;
  }

  function updatePointerDropTarget(x, y) {
    const target = document.elementFromPoint(x, y)?.closest?.('.situation-slot');
    els.slotBoard.querySelectorAll('.is-drop-ready').forEach((slot) => {
      if (slot !== target) slot.classList.remove('is-drop-ready');
    });
    if (target) target.classList.add('is-drop-ready');
  }

  function clearPointerDropTargets() {
    els.slotBoard.querySelectorAll('.is-drop-ready').forEach((slot) => slot.classList.remove('is-drop-ready'));
  }

  function findCard(cardId) {
    const question = currentQuestion();
    return question?.cards?.find((card) => card.id === cardId) || null;
  }

  function nextEmptySlotIndex() {
    return (state.run?.slots || []).findIndex((card) => !card);
  }

  function placeByClick(cardId) {
    const index = nextEmptySlotIndex();
    if (index < 0) return;
    tryPlaceCard(cardId, index);
  }

  function onSlotDragOver(event) {
    if (!state.draggedCardId) return;
    event.preventDefault();
    event.currentTarget.classList.add('is-drop-ready');
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  function onSlotDrop(event) {
    event.preventDefault();
    const slot = event.currentTarget;
    slot.classList.remove('is-drop-ready');
    const cardId = event.dataTransfer?.getData('text/plain') || state.draggedCardId;
    const index = Number(slot.getAttribute('data-slot-index'));
    tryPlaceCard(cardId, index);
  }

  function tryPlaceCard(cardId, slotIndex) {
    const card = findCard(cardId);
    if (!card || !state.run || state.awaitingAdvance || state.run.slots[slotIndex]) return;
    if (card.order !== slotIndex + 1) {
      markWrong(cardId, slotIndex);
      return;
    }
    state.run.slots[slotIndex] = card;
    playAudio('correct');
    renderSlots();
    renderBank();
    updateProgress();
    els.feedbackText.textContent = `${slotIndex + 1}번째 장면이 맞아요.`;
    if (state.run.slots.every(Boolean)) {
      setTimeout(completeQuestion, 420);
    }
  }

  function markWrong(cardId, slotIndex) {
    const run = state.run;
    const question = currentQuestion();
    if (!run || !question) return;
    run.wrongCount += 1;
    run.wrongByQuestion[question.id] = Number(run.wrongByQuestion[question.id] || 0) + 1;
    playAudio('wrong');
    vibrate([70, 30, 70]);
    els.feedbackText.textContent = `${slotIndex + 1}번째 순서가 아니에요. 다시 골라보세요.`;
    const cardNode = els.cardBank.querySelector(`[data-card-id="${CSS.escape(cardId)}"]`);
    const slotNode = els.slotBoard.querySelector(`[data-slot-index="${slotIndex}"]`);
    [cardNode, slotNode].forEach((node) => {
      if (!node) return;
      node.classList.add('is-wrong');
      setTimeout(() => node.classList.remove('is-wrong'), 380);
    });
  }

  function removeSlotCard(slotIndex) {
    if (state.awaitingAdvance || !state.run?.slots?.[slotIndex]) return;
    state.run.slots[slotIndex] = null;
    renderSlots();
    renderBank();
    updateProgress();
    els.feedbackText.textContent = `${slotIndex + 1}번째 칸을 비웠어요.`;
  }

  function completeQuestion() {
    const run = state.run;
    const question = currentQuestion();
    if (!run || !question) return;
    run.completed += 1;
    run.solvedIds.push(question.id);
    state.awaitingAdvance = true;
    playClearEffect();
    els.feedbackText.textContent = '상황을 보고 이야기를 해봐요.';
    setTimeout(showAdvanceToast, 360);
  }

  function showAdvanceToast() {
    if (!state.awaitingAdvance || !els.advanceToast) return;
    if (els.advanceToastText) els.advanceToastText.textContent = '상황을 보고 이야기를 해봐요.';
    if (els.advanceNextButton) {
      els.advanceNextButton.textContent = currentQuestionIsLast() ? '결과 보기' : '다음';
    }
    els.advanceToast.setAttribute('aria-hidden', 'false');
    els.advanceToast.classList.add('is-visible');
  }

  function hideAdvanceToast() {
    els.advanceToast?.setAttribute('aria-hidden', 'true');
    els.advanceToast?.classList.remove('is-visible');
  }

  function currentQuestionIsLast() {
    const run = state.run;
    return !run || run.currentIndex >= run.questions.length - 1;
  }

  function advanceAfterStory() {
    const run = state.run;
    if (!run || !state.awaitingAdvance) return;
    hideAdvanceToast();
    state.awaitingAdvance = false;
    if (currentQuestionIsLast()) {
      completeStage();
      return;
    }
    run.currentIndex += 1;
    renderQuestion();
  }

  function playClearEffect() {
    playAudio('complete');
    const layer = els.effectLayer;
    if (!layer) return;
    const colors = ['#22c55e', '#3b82f6', '#f97316', '#facc15', '#ec4899'];
    for (let i = 0; i < 28; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'situation-confetti';
      piece.style.left = `${15 + Math.random() * 70}%`;
      piece.style.top = `${10 + Math.random() * 20}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 160}ms`;
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 1200);
    }
  }

  function completeStage() {
    const run = state.run;
    if (!run) return;
    const total = run.questions.length;
    const score = Math.max(0, Math.min(100, Math.round((total / Math.max(total + run.wrongCount, 1)) * 100)));
    els.resultTitle.textContent = `${run.stage.title} 완료!`;
    els.resultSummary.textContent = `${total}개의 상황을 5단계 순서로 맞췄어요. 틀린 시도는 ${run.wrongCount}회입니다.`;
    els.resultCorrect.textContent = `${run.completed}개`;
    els.resultWrong.textContent = `${run.wrongCount}회`;
    els.resultScore.textContent = `${score}점`;
    persistResult(score);
    showScreen('result');
  }

  function persistResult(score) {
    const run = state.run;
    if (!run || state.savedRunId || !window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function') return;
    const total = run.questions.length;
    const weakQuestions = Object.entries(run.wrongByQuestion)
      .filter(([, count]) => Number(count) > 0)
      .map(([questionId, count]) => {
        const question = run.questions.find((item) => item.id === questionId);
        return `${question?.title || questionId} ${count}회`;
      });
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'cardlab',
      reportScope: 'cardlab',
      saveToClientReport: true,
      curriculumKey: CURRICULUM_KEY,
      stageKey: run.stage.id,
      stageTitle: run.stage.title,
      labTitle: LAB_TITLE,
      title: run.stage.title,
      focusKey: 'situation-script-sequence',
      focusLabel: '상황 스크립트 순서화',
      totalQuestions: total,
      correctCount: run.completed,
      wrongCount: run.wrongCount,
      score,
      accuracyScore: Math.round((run.completed / Math.max(total, 1)) * 100),
      startedAtMs: run.startedAtMs,
      durationSeconds: Math.max(1, Math.round((Date.now() - run.startedAtMs) / 1000)),
      summary: `${run.stage.title}에서 상황 그림을 보고 5단계 행동 순서를 구성했습니다.`,
      overview: '상황별 스크립트 순서 맞추기는 일상 상황을 시간 순서로 조직하며 시각 단서 해석, 순차 작업기억, 실행 계획을 함께 관찰하는 카드랩 과제입니다.',
      guardianSummary: `${run.stage.title} 활동에서 그림을 보고 처음부터 끝까지 이어지는 행동 순서를 맞춰 보았습니다. 보호자 공유에서는 정답 수보다 어떤 상황에서 다시 확인이 필요했는지를 중심으로 봅니다.`,
      teacherReviewNote: '오답은 곧바로 이해 부족으로 보지 않고, 그림 해석 혼동, 순서 기억 부담, 상황 경험 부족 가능성을 함께 확인합니다.',
      actionPlanSummary: weakQuestions.length ? `${weakQuestions.slice(0, 3).join(', ')} 상황은 다음 회기에서 실제 말하기 순서로 다시 확인합니다.` : '다음 활동은 같은 단계의 새 상황을 짧게 반복한 뒤 난이도 확장을 검토합니다.',
      recommendations: [
        '그림을 맞춘 뒤 “먼저, 그다음, 마지막” 표현으로 말하게 해 순서 언어를 함께 연결해 주세요.',
        '오답 상황은 실제 생활 경험 부족인지, 그림 단서 해석 혼동인지 나누어 관찰해 주세요.'
      ],
      details: {
        report_type: 'cardlab-situation-sequence',
        situation_sequence_questions: run.questions.map((question) => ({
          id: question.id,
          number: question.number,
          title: question.title,
          wrongAttempts: Number(run.wrongByQuestion[question.id] || 0)
        })),
        asset_audit: DATA.assetAudit || null
      }
    });
    state.savedRunId = record?.id || run.id;
  }

  function openHelp() {
    els.helpModal?.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    els.helpModal?.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
    els.stageButton?.addEventListener('click', () => showScreen('stage'));
    els.resultStageButton?.addEventListener('click', () => showScreen('stage'));
    els.resultRetryButton?.addEventListener('click', restartStage);
    els.customCountInput?.addEventListener('input', updateCustomSummary);
    els.customSelectAllButton?.addEventListener('click', () => {
      state.customSelectedIds = new Set(getAllPlayableQuestions().map((question) => question.id));
      state.customInitialized = true;
      renderCustomBuilder();
    });
    els.customClearButton?.addEventListener('click', () => {
      state.customSelectedIds.clear();
      state.customInitialized = true;
      renderCustomBuilder();
    });
    els.customStartButton?.addEventListener('click', () => {
      const selected = getAllPlayableQuestions().filter((question) => state.customSelectedIds.has(question.id));
      startCustomRun(selected, requestedCustomCount());
    });
    els.advanceNextButton?.addEventListener('click', advanceAfterStory);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerCancel);
    els.helpButton?.addEventListener('click', openHelp);
    els.helpCloseButton?.addEventListener('click', closeHelp);
    els.helpModal?.addEventListener('click', (event) => {
      if (event.target && event.target.hasAttribute('data-help-close')) closeHelp();
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHelp();
    });
  }

  renderStages();
  if (state.selectedStageId === CUSTOM_STAGE_ID) renderCustomBuilder();
  bindEvents();
  showScreen('stage');

  window.CardlabSituationSequence = {
    data: DATA,
    getPlayableQuestions,
    getAllPlayableQuestions,
    state
  };
})();
