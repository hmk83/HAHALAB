(function () {
  'use strict';

  const LAB_TITLE = 'PlayLab 색 격자 더하기·빼기';
  const CURRICULUM_KEY = 'playlab-grid-color-arithmetic';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';

  const COLORS = [
    { id: 'yellow', label: '노랑', hex: '#facc15' },
    { id: 'green', label: '초록', hex: '#22c55e' },
    { id: 'blue', label: '파랑', hex: '#3b82f6' },
    { id: 'red', label: '빨강', hex: '#ef4444' },
    { id: 'purple', label: '보라', hex: '#8b5cf6' },
    { id: 'orange', label: '주황', hex: '#fb923c' }
  ];

  const STAGES = [
    { size: 2, mode: 'add', label: '2x2 더하기 입문', focus: '두 격자의 색을 합쳐요.', colorCount: 3, fillA: 2, fillB: 1, overlap: false },
    { size: 2, mode: 'add', label: '2x2 더하기 확장', focus: '더 많은 색을 합쳐요.', colorCount: 4, fillA: 2, fillB: 2, overlap: false },
    { size: 2, mode: 'subtract', label: '2x2 빼기 입문', focus: '두 번째 격자 위치를 빼요.', colorCount: 3, fillA: 3, remove: 1 },
    { size: 2, mode: 'subtract', label: '2x2 빼기 확장', focus: '남는 색 위치를 확인해요.', colorCount: 4, fillA: 4, remove: 2 },
    { size: 3, mode: 'add', label: '3x3 더하기 입문', focus: '넓어진 격자에서 색을 더해요.', colorCount: 4, fillA: 3, fillB: 2, overlap: false },
    { size: 3, mode: 'add', label: '3x3 더하기 확장', focus: '겹치는 위치까지 확인해요.', colorCount: 5, fillA: 4, fillB: 3, overlap: true },
    { size: 3, mode: 'subtract', label: '3x3 빼기 입문', focus: '표시된 위치를 지워요.', colorCount: 4, fillA: 5, remove: 2 },
    { size: 3, mode: 'subtract', label: '3x3 빼기 확장', focus: '여러 위치를 제외해요.', colorCount: 5, fillA: 6, remove: 3 },
    { size: 4, mode: 'add', label: '4x4 더하기 입문', focus: '복잡한 색 위치를 합쳐요.', colorCount: 5, fillA: 5, fillB: 4, overlap: true },
    { size: 4, mode: 'subtract', label: '4x4 빼기 입문', focus: '필요한 위치만 지워 답을 만들어요.', colorCount: 5, fillA: 8, remove: 3 },
    { size: 5, mode: 'add', label: '5x5 더하기 도전', focus: '큰 격자에서 색 패턴을 완성해요.', colorCount: 6, fillA: 8, fillB: 6, overlap: true },
    { size: 5, mode: 'subtract', label: '5x5 빼기 도전', focus: '여러 위치를 한 번에 제외해요.', colorCount: 6, fillA: 12, remove: 5 }
  ].map((stage, index) => Object.assign({
    id: `stage-${index + 1}`,
    index: index + 1,
    questions: 5,
    tutorial: index === 0 || index === 2
  }, stage));

  const state = {
    stage: null,
    questions: [],
    questionIndex: 0,
    answer: [],
    selectedColor: COLORS[0].id,
    isPainting: false,
    tutorialActive: false,
    tutorialSkipped: false,
    tutorialTimer: 0,
    tutorialStep: 0,
    tutorialAutoAdvancing: false,
    startedAtMs: 0,
    stageStartedAtMs: 0,
    savedRunId: '',
    reportSessionId: '', pendingReport: null, pendingRecord: null, pendingDirectRow: null,
    supabaseClientPromise: null,
    metrics: {
      correct: 0,
      attempts: 0,
      wrong: 0,
      responseTimes: []
    },
    isAdvancing: false
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

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function colorById(id) {
    return COLORS.find((color) => color.id === id) || COLORS[0];
  }

  function setScreen(name) {
    ['stageView', 'gameView', 'resultView'].forEach((id) => {
      els[id].classList.toggle('is-active', id === `${name}View`);
    });
    const inStage = name === 'stage';
    els.stageSelectButton.classList.toggle('shell-hidden', inStage);
    els.shellStageLabel.classList.toggle('shell-hidden', inStage);
    if (name !== 'stage' && state.stage) {
      els.shellStageLabel.textContent = `${state.stage.index}단계`;
    }
    window.scrollTo(0, 0);
  }

  function stageModeLabel(mode) {
    if (mode === 'add') return '더하기';
    if (mode === 'subtract') return '빼기';
    return '규칙';
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="gridcalc-stage-card" data-stage-index="${stage.index}" style="--stage-color:${stage.mode === 'subtract' ? '#ef4444' : stage.mode === 'mixed' ? '#8b5cf6' : '#0ea5e9'}">
        <span class="gridcalc-stage-badge">${stage.index}단계 · ${stage.size}x${stage.size}</span>
        <strong>${escapeHtml(stage.label)}</strong>
        <p>${escapeHtml(stageModeLabel(stage.mode))} · ${escapeHtml(stage.focus)}</p>
      </button>
    `).join('');
  }

  function makeEmptyGrid(size) {
    return Array.from({ length: size * size }, () => null);
  }

  function fillRandomCells(grid, count, palette, options = {}) {
    const allowPositions = options.allowPositions || grid.map((_, index) => index);
    const blocked = new Set(options.blockedPositions || []);
    const candidates = shuffle(allowPositions.filter((index) => !blocked.has(index)));
    const picked = candidates.slice(0, Math.min(count, candidates.length));
    picked.forEach((index) => {
      grid[index] = palette[randomInt(0, palette.length - 1)].id;
    });
    return picked;
  }

  function serialize(grid) {
    return grid.map((cell) => cell || '_').join('|');
  }

  function makeQuestion(stage, usedSignatures) {
    const palette = COLORS.slice(0, stage.colorCount);
    const total = stage.size * stage.size;
    const allPositions = Array.from({ length: total }, (_, index) => index);

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const op = stage.mode === 'mixed'
        ? (Math.random() > 0.48 ? 'add' : 'subtract')
        : stage.mode;
      const left = makeEmptyGrid(stage.size);
      const right = makeEmptyGrid(stage.size);
      let target = makeEmptyGrid(stage.size);

      if (op === 'add') {
        const leftCount = Math.min(total - 1, randomInt(Math.max(1, stage.fillA - 1), stage.fillA + 1));
        const rightCount = Math.min(total - 1, randomInt(Math.max(1, stage.fillB - 1), stage.fillB + 1));
        const leftPositions = fillRandomCells(left, leftCount, palette);
        fillRandomCells(right, rightCount, palette, {
          blockedPositions: stage.overlap ? [] : leftPositions
        });
        target = left.slice();
        right.forEach((cell, index) => {
          if (cell) target[index] = cell;
        });
      } else {
        const leftCount = Math.min(total - 1, randomInt(Math.max(2, stage.fillA - 1), Math.min(total, stage.fillA + 1)));
        const leftPositions = fillRandomCells(left, leftCount, palette);
        const removeCount = Math.min(leftPositions.length - 1, randomInt(Math.max(1, stage.remove - 1), stage.remove + 1));
        const removePositions = shuffle(leftPositions).slice(0, removeCount);
        removePositions.forEach((index) => {
          right[index] = left[index];
        });
        target = left.slice();
        removePositions.forEach((index) => {
          target[index] = null;
        });
      }

      if (!target.some(Boolean)) continue;
      const signature = [op, stage.size, serialize(left), serialize(right), serialize(target)].join('::');
      if (!usedSignatures.has(signature)) {
        usedSignatures.add(signature);
        return { op, size: stage.size, left, right, target, palette };
      }
    }

    usedSignatures.clear();
    return makeQuestion(stage, usedSignatures);
  }

  function buildQuestions(stage) {
    const signatures = new Set();
    const questions = Array.from({ length: stage.questions }, () => makeQuestion(stage, signatures));
    if (stage.tutorial) {
      questions.unshift(makeTutorialQuestion(stage));
    }
    return questions;
  }

  function makeTutorialQuestion(stage) {
    const palette = COLORS.slice(0, Math.max(3, stage.colorCount));
    if (stage.mode === 'subtract') {
      return {
        op: 'subtract',
        size: 2,
        tutorial: true,
        left: ['yellow', 'green', 'blue', null],
        right: [null, 'green', null, null],
        target: ['yellow', null, 'blue', null],
        palette
      };
    }
    return {
      op: 'add',
      size: 2,
      tutorial: true,
      left: ['yellow', null, 'blue', null],
      right: [null, 'green', null, null],
      target: ['yellow', 'green', 'blue', null],
      palette
    };
  }

  function clearTutorialTimer() {
    window.clearTimeout(state.tutorialTimer);
    state.tutorialTimer = 0;
  }

  function tutorialLines(question) {
    if (!question || question.op === 'subtract') {
      return [
        '더하기 빼기 표시를 잘 보고 시작해요.',
        '빼기는 첫 번째 격자에서 두 번째 격자 위치를 빼는 거예요.',
        '두 번째 격자에 있는 초록 위치는 답에서 비워요.',
        '남은 노랑과 파랑만 답 격자에 넣으면 돼요.'
      ];
    }
    return [
      '더하기 빼기 표시를 잘 보고 시작해요.',
      '더하기는 첫 번째 격자와 두 번째 격자를 모두 합쳐요.',
      '첫 번째 격자의 색을 같은 위치에 먼저 넣어요.',
      '두 번째 격자의 색도 같은 위치에 넣으면 답이 완성돼요.'
    ];
  }

  function getTutorialFillIndexes(question) {
    return question.target
      .map((cell, index) => cell ? index : -1)
      .filter((index) => index >= 0);
  }

  function setTutorialBubble(text) {
    if (!els.tutorialBubble || !els.tutorialBubbleText) return;
    els.tutorialBubbleText.textContent = text || '';
    els.tutorialBubble.classList.toggle('is-open', Boolean(text));
    if (els.tutorialNextButton) {
      els.tutorialNextButton.hidden = !text;
      els.tutorialNextButton.textContent = isTutorialFinalStep() ? '시작' : '다음';
      els.tutorialNextButton.disabled = Boolean(state.tutorialAutoAdvancing);
    }
  }

  function hideVirtualMouse() {
    if (!els.virtualMouse) return;
    els.virtualMouse.classList.remove('is-visible', 'is-clicking');
    els.virtualMouse.style.transform = 'translate3d(-200px, -200px, 0)';
  }

  function moveVirtualMouseToElement(element) {
    if (!els.virtualMouse || !element) return;
    const rect = element.getBoundingClientRect();
    const mouseRect = els.virtualMouse.getBoundingClientRect();
    const x = rect.left + rect.width * 0.5 - mouseRect.width * 0.18;
    const y = rect.top + rect.height * 0.5 - mouseRect.height * 0.12;
    els.virtualMouse.classList.add('is-visible');
    els.virtualMouse.classList.remove('is-clicking');
    els.virtualMouse.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  function moveVirtualMouseToCell(cellIndex) {
    const cell = els.answerGrid ? els.answerGrid.querySelector(`[data-cell-index="${cellIndex}"]`) : null;
    moveVirtualMouseToElement(cell);
  }

  function clearTutorialHighlights() {
    [els.leftGrid, els.rightGrid, els.answerGrid].forEach((grid) => {
      if (!grid) return;
      const panel = grid.closest('.gridcalc-panel');
      if (panel) panel.classList.remove('is-tutorial-highlight');
      grid.querySelectorAll('.is-tutorial-cell-highlight').forEach((cell) => {
        cell.classList.remove('is-tutorial-cell-highlight');
      });
    });
    if (els.operatorMark) els.operatorMark.classList.remove('is-tutorial-highlight');
    if (els.palette) {
      els.palette.querySelectorAll('.is-tutorial-swatch-highlight').forEach((swatch) => {
        swatch.classList.remove('is-tutorial-swatch-highlight');
      });
    }
  }

  function highlightGrid(grid, indexes = []) {
    if (!grid) return;
    const panel = grid.closest('.gridcalc-panel');
    if (panel) panel.classList.add('is-tutorial-highlight');
    indexes.forEach((index) => {
      const cell = grid.querySelector(`[data-grid-cell-index="${index}"], [data-cell-index="${index}"]`);
      if (cell) cell.classList.add('is-tutorial-cell-highlight');
    });
  }

  function nonEmptyIndexes(gridValues) {
    return gridValues.map((cell, index) => cell ? index : -1).filter((index) => index >= 0);
  }

  function applyTutorialHighlight() {
    clearTutorialHighlights();
    const question = state.questions[state.questionIndex];
    if (!state.tutorialActive || !question || !question.tutorial) return;
    const lines = tutorialLines(question);
    if (state.tutorialStep === 0) {
      if (els.operatorMark) els.operatorMark.classList.add('is-tutorial-highlight');
      return;
    }
    if (state.tutorialStep === 1) {
      highlightGrid(els.leftGrid, nonEmptyIndexes(question.left));
      highlightGrid(els.rightGrid, nonEmptyIndexes(question.right));
      return;
    }
    if (state.tutorialStep === 2) {
      const targetGrid = question.op === 'subtract' ? els.rightGrid : els.leftGrid;
      const source = question.op === 'subtract' ? question.right : question.left;
      highlightGrid(targetGrid, nonEmptyIndexes(source));
      return;
    }
    if (state.tutorialStep === 3) {
      if (question.op === 'subtract') {
        highlightGrid(els.leftGrid, nonEmptyIndexes(question.target));
        highlightGrid(els.answerGrid, nonEmptyIndexes(question.target));
      } else {
        highlightGrid(els.rightGrid, nonEmptyIndexes(question.right));
      }
      return;
    }
    const fillStep = state.tutorialStep - lines.length;
    const fillIndexes = getTutorialFillIndexes(question);
    if (fillStep >= 0 && fillStep < fillIndexes.length) {
      const cellIndex = fillIndexes[fillStep];
      highlightGrid(els.answerGrid, [cellIndex]);
      const colorId = question.target[cellIndex];
      const swatch = els.palette ? els.palette.querySelector(`[data-color-id="${colorId}"]`) : null;
      if (swatch) swatch.classList.add('is-tutorial-swatch-highlight');
    }
  }

  function playVirtualMouseClick() {
    if (!els.virtualMouse) return;
    els.virtualMouse.classList.remove('is-clicking');
    void els.virtualMouse.offsetWidth;
    els.virtualMouse.classList.add('is-clicking');
  }

  function isTutorialFinalStep() {
    const question = state.questions[state.questionIndex];
    if (!question || !question.tutorial) return false;
    return state.tutorialStep >= tutorialLines(question).length + getTutorialFillIndexes(question).length;
  }

  function runTutorialStep() {
    clearTutorialTimer();
    const question = state.questions[state.questionIndex];
    if (!state.tutorialActive || !question || !question.tutorial) return;
    const lines = tutorialLines(question);
    const fillIndexes = getTutorialFillIndexes(question);
    if (state.tutorialStep < lines.length) {
      setTutorialBubble(lines[state.tutorialStep]);
      hideVirtualMouse();
      applyTutorialHighlight();
      return;
    }
    const fillStep = state.tutorialStep - lines.length;
    if (fillStep < fillIndexes.length) {
      const cellIndex = fillIndexes[fillStep];
      setTutorialBubble(`${cellIndex + 1}번 칸을 크게 보세요. 마우스로 ${colorById(question.target[cellIndex]).label}을 넣어볼게요.`);
      applyTutorialHighlight();
      return;
    }
    setTutorialBubble('이제 직접 풀어볼 차례예요.');
    clearTutorialHighlights();
  }

  function nextTutorialStep() {
    if (!state.tutorialActive) return;
    const question = state.questions[state.questionIndex];
    if (!question || !question.tutorial) return;
    const lines = tutorialLines(question);
    const fillIndexes = getTutorialFillIndexes(question);
    if (state.tutorialStep < lines.length) {
      state.tutorialStep += 1;
      runTutorialStep();
      return;
    }
    const fillStep = state.tutorialStep - lines.length;
    if (fillStep < fillIndexes.length) {
      const cellIndex = fillIndexes[fillStep];
      const colorId = question.target[cellIndex];
      if (els.tutorialNextButton) els.tutorialNextButton.disabled = true;
      clearTutorialHighlights();
      highlightGrid(els.answerGrid, [cellIndex]);
      const swatch = els.palette ? els.palette.querySelector(`[data-color-id="${colorId}"]`) : null;
      if (swatch) swatch.classList.add('is-tutorial-swatch-highlight');
      moveVirtualMouseToElement(swatch);
      state.tutorialTimer = window.setTimeout(() => {
        playVirtualMouseClick();
        state.selectedColor = colorId;
        renderPalette(question.palette);
        const nextSwatch = els.palette ? els.palette.querySelector(`[data-color-id="${colorId}"]`) : null;
        if (nextSwatch) nextSwatch.classList.add('is-tutorial-swatch-highlight');
        state.tutorialTimer = window.setTimeout(() => {
          moveVirtualMouseToCell(cellIndex);
          state.tutorialTimer = window.setTimeout(() => {
            playVirtualMouseClick();
            state.answer[cellIndex] = colorId;
            renderAnswerGrid();
            highlightGrid(els.answerGrid, [cellIndex]);
            state.tutorialTimer = window.setTimeout(() => {
              state.tutorialStep += 1;
              const nextFillStep = state.tutorialStep - lines.length;
              if (nextFillStep > 0 && nextFillStep < fillIndexes.length) {
                state.tutorialAutoAdvancing = true;
                runTutorialStep();
                state.tutorialTimer = window.setTimeout(nextTutorialStep, 850);
              } else {
                state.tutorialAutoAdvancing = false;
                runTutorialStep();
              }
            }, 360);
          }, 560);
        }, 420);
      }, 560);
      return;
    }
    finishTutorial();
  }

  function startTutorialIfNeeded() {
    const question = state.questions[state.questionIndex];
    if (!question || !question.tutorial || state.tutorialSkipped) {
      state.tutorialActive = false;
      setTutorialBubble('');
      return;
    }
    state.tutorialActive = true;
    state.tutorialStep = 0;
    if (els.skipTutorialButton) {
      els.skipTutorialButton.hidden = false;
      els.skipTutorialButton.disabled = false;
    }
    runTutorialStep();
  }

  function finishTutorial() {
    clearTutorialTimer();
    state.tutorialActive = false;
    state.tutorialAutoAdvancing = false;
    setTutorialBubble('');
    hideVirtualMouse();
    clearTutorialHighlights();
    if (els.skipTutorialButton) els.skipTutorialButton.hidden = true;
    state.questionIndex += 1;
    renderQuestion();
  }

  function skipTutorial() {
    state.tutorialSkipped = true;
    finishTutorial();
  }

  function getRealQuestionNumber() {
    const tutorialOffset = state.questions[0] && state.questions[0].tutorial ? 1 : 0;
    return Math.max(1, state.questionIndex + 1 - tutorialOffset);
  }

  function gridMarkup(grid, size, options = {}) {
    const editable = !!options.editable;
    const subtractMarkers = !!options.subtractMarkers;
    return grid.map((cell, index) => {
      const color = cell ? colorById(cell).hex : '#ffffff';
      const markerClass = subtractMarkers && cell ? ' gridcalc-subtract-marker' : '';
      if (editable) {
        return `<button type="button" class="gridcalc-answer-cell" data-cell-index="${index}" style="--cell-color:${color}" aria-label="${index + 1}번 답 칸"></button>`;
      }
      return `<div class="gridcalc-cell${markerClass}" data-grid-cell-index="${index}" style="--cell-color:${color}" aria-hidden="true"></div>`;
    }).join('');
  }

  function setGridSize(element, size) {
    element.style.setProperty('--grid-size', String(size));
  }

  function renderQuestion() {
    const question = state.questions[state.questionIndex];
    state.answer = makeEmptyGrid(question.size);
    state.isAdvancing = false;
    state.tutorialActive = Boolean(question.tutorial && !state.tutorialSkipped);
    state.startedAtMs = performance.now();
    els.feedbackText.textContent = '';
    els.gameKicker.textContent = question.op === 'add' ? 'GRID ADD' : 'GRID SUBTRACT';
    els.gameTitle.textContent = question.op === 'add'
      ? '색을 더해서 오른쪽 격자를 완성해요.'
      : '두 번째 격자 위치를 빼고 남은 색을 칠해요.';
    els.operatorMark.textContent = question.op === 'add' ? '+' : '-';
    els.stageChip.textContent = `${state.stage.index}단계`;
    els.questionChip.textContent = question.tutorial
      ? '설명 문제'
      : `문제 ${getRealQuestionNumber()} / ${state.stage.questions}`;
    if (els.skipTutorialButton) {
      els.skipTutorialButton.hidden = !state.tutorialActive;
    }

    [els.leftGrid, els.rightGrid, els.answerGrid].forEach((grid) => setGridSize(grid, question.size));
    els.leftGrid.innerHTML = gridMarkup(question.left, question.size);
    els.rightGrid.innerHTML = gridMarkup(question.right, question.size);
    renderAnswerGrid();
    renderPalette(question.palette);
    startTutorialIfNeeded();
  }

  function renderAnswerGrid() {
    const question = state.questions[state.questionIndex];
    els.answerGrid.innerHTML = gridMarkup(state.answer, question.size, { editable: true });
  }

  function renderPalette(palette) {
    const swatches = palette.map((color) => `
      <button type="button" class="gridcalc-swatch${state.selectedColor === color.id ? ' is-selected' : ''}" data-color-id="${color.id}" style="--swatch-color:${color.hex}" aria-label="${escapeHtml(color.label)}"></button>
    `);
    swatches.push(`<button type="button" class="gridcalc-swatch${state.selectedColor === 'empty' ? ' is-selected' : ''}" data-color-id="empty">지우개</button>`);
    els.palette.innerHTML = swatches.join('');
  }

  function startStage(stageIndex) {
    clearTutorialTimer();
    state.stage = STAGES[stageIndex - 1] || STAGES[0];
    state.questions = buildQuestions(state.stage);
    state.questionIndex = 0;
    state.selectedColor = COLORS[0].id;
    state.tutorialActive = false;
    state.tutorialSkipped = false;
    state.tutorialAutoAdvancing = false;
    state.tutorialStep = 0;
    state.stageStartedAtMs = Date.now();
    state.savedRunId = '';
    state.reportSessionId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), (value) => value.toString(16).padStart(2, '0')).join('');
    state.pendingReport = null; state.pendingRecord = null; state.pendingDirectRow = null;
    state.metrics = { correct: 0, attempts: 0, wrong: 0, responseTimes: [] };
    renderQuestion();
    setScreen('game');
  }

  function paintCell(cellIndex) {
    const question = state.questions[state.questionIndex];
    if (!question || state.isAdvancing || state.tutorialActive || cellIndex < 0 || cellIndex >= question.target.length) return;
    state.answer[cellIndex] = state.selectedColor === 'empty' ? null : state.selectedColor;
    const cell = els.answerGrid.querySelector(`[data-cell-index="${cellIndex}"]`);
    if (cell) {
      const color = state.answer[cellIndex] ? colorById(state.answer[cellIndex]).hex : '#ffffff';
      cell.style.setProperty('--cell-color', color);
    }
    checkAnswerAutomatically();
  }

  function isCorrectAnswer() {
    const target = state.questions[state.questionIndex].target;
    return target.every((value, index) => (value || null) === (state.answer[index] || null));
  }

  function completeQuestion() {
    if (state.isAdvancing) return;
    state.isAdvancing = true;
    state.metrics.correct += 1;
    state.metrics.attempts += 1;
    state.metrics.responseTimes.push(Math.max(0.1, (performance.now() - state.startedAtMs) / 1000));
    els.feedbackText.textContent = '';
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.showQuestionComplete === 'function') {
      window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false, durationMs: 760 });
    }
    window.setTimeout(() => {
      state.questionIndex += 1;
      if (state.questionIndex >= state.questions.length) {
        showResult();
      } else {
        renderQuestion();
      }
    }, 840);
  }

  function checkAnswerAutomatically() {
    if (isCorrectAnswer()) {
      completeQuestion();
    }
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
    if (state.supabaseClientPromise) return state.supabaseClientPromise;
    state.supabaseClientPromise = Promise.resolve().then(() => {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }).catch(() => null);
    return state.supabaseClientPromise;
  }

  function buildResultPayload(payload) {
    const stage = state.stage || {};
    const stageTitle = stage.label || `${payload.stage || ''}단계`;
    const gridSize = stage.size ? `${stage.size}x${stage.size}` : '';
    const modeLabel = stageModeLabel(stage.mode);
    const startedAtMs = Number(state.stageStartedAtMs || Date.now());
    const durationSeconds = Math.max(0, Math.round((Date.now() - startedAtMs) / 1000));
    const briefOpinion = `${stageTitle}에서 색 위치를 비교하고 ${modeLabel} 규칙에 맞춰 답 격자를 완성했습니다.`;
    const guardianSummary = `${stageTitle} 학습을 ${payload.total}문항 완료했습니다. 정답률은 ${payload.accuracy}%이고, 평균 반응 시간은 ${payload.averageResponse}초입니다.`;
    const teacherReviewNote = '색 단서, 격자 위치, 더하기·빼기 규칙 전환을 함께 확인한 PlayLab 수행 기록입니다.';
    const actionPlanSummary = '다음 회기에는 같은 격자 크기에서 정확도가 유지되는지 확인한 뒤, 안정되면 한 단계 높은 격자 또는 반대 연산 규칙으로 확장합니다.';
    const reportInput = {
      curriculumKey: CURRICULUM_KEY,
      labTitle: LAB_TITLE,
      stageKey: stage.id || '',
      stageTitle,
      gridSize,
      mode: stage.mode || '',
      modeLabel,
      totalQuestions: payload.total,
      correctCount: payload.correct,
      wrongCount: payload.wrong,
      accuracyRate: payload.accuracy,
      averageResponseSeconds: payload.averageResponse,
      attempts: payload.attempts,
      startedAtMs,
      elapsedMs: durationSeconds * 1000,
      reportType: 'playlab-simple-result'
    };
    return {
      labKind: 'playlab',
      sessionId: state.reportSessionId,
      reportScope: 'playlab',
      labScope: 'playlab',
      saveToClientReport: true,
      curriculumKey: CURRICULUM_KEY,
      stageKey: stage.id || '',
      stageId: stage.id || '',
      stageTitle,
      stageLabel: stageTitle,
      labTitle: LAB_TITLE,
      reportTitle: stageTitle,
      totalQuestions: payload.total,
      correctCount: payload.correct,
      wrongCount: payload.wrong,
      incorrectCount: payload.wrong,
      score: payload.accuracy,
      accuracyScore: payload.accuracy,
      durationSeconds,
      startedAtMs,
      reportType: 'playlab-simple-result',
      reportInput,
      briefOpinion,
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      overview: `${briefOpinion}\n보호자 공유에서는 점수보다 색 위치를 차례대로 비교하는 루틴, 규칙 전환, 자기점검 흐름을 함께 확인합니다.`,
      recommendations: [
        '완료 후에는 같은 격자를 말로 설명하며 위치 단서를 다시 확인합니다.',
        '오답 시도가 늘어나면 격자 크기를 낮추고 색 개수를 줄여 다시 시작합니다.'
      ],
      focusKey: 'color-grid-arithmetic',
      focusLabel: '색 격자 연산',
      details: {
        curriculum_key: CURRICULUM_KEY,
        stage_key: stage.id || '',
        session_id: state.reportSessionId,
        report_scope: 'playlab',
        lab_scope: 'playlab',
        lab_label: '플레이랩',
        lab_title: LAB_TITLE,
        game_name: LAB_TITLE,
        report_title: stageTitle,
        category_title: LAB_TITLE,
        stage_id: stage.id || '',
        stage_title: stageTitle,
        score: payload.accuracy,
        accuracy_score: payload.accuracy,
        correct_count: payload.correct,
        wrong_count: payload.wrong,
        total_questions: payload.total,
        average_response_seconds: payload.averageResponse,
        report_brief_opinion: briefOpinion,
        report_guardian_summary: guardianSummary,
        report_teacher_review_note: teacherReviewNote,
        report_action_plan_summary: actionPlanSummary,
        report_display_modes: ['guardian'],
        report_focus_key: 'color-grid-arithmetic',
        report_focus_label: '색 격자 연산',
        report_domain: '시지각-공간 작업기억 및 규칙 전환',
        grid_size: gridSize,
        operation_mode: stage.mode || '',
        source_page: 'playlab-grid-color-arithmetic.html'
      }
    };
  }

  async function saveSupabaseReport(payload) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) throw new Error('GRID_LAUNCH_CONTEXT_REQUIRED');
    const client = await getSupabaseClient();
    if (!client) throw new Error('GRID_CLIENT_UNAVAILABLE');
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(payload.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(payload.durationSeconds || 0) / 60));
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
      report_brief_opinion: payload.briefOpinion,
      report_overview: payload.overview,
      report_recommendations: payload.recommendations,
      report_focus_key: payload.focusKey,
      report_focus_label: payload.focusLabel,
      report_guardian_summary: payload.guardianSummary,
      report_teacher_review_note: payload.teacherReviewNote,
      report_action_plan_summary: payload.actionPlanSummary,
      curriculum_key: payload.curriculumKey,
      stage_key: payload.stageKey,
      source_page: 'playlab-grid-color-arithmetic.html'
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
    // A detached degraded path uses the same atomic session receipt, never a
    // second INSERT whose success could erase unrelated pending records.
    const canonical = state.pendingDirectRow || (state.pendingDirectRow = row);
    const result = await client.rpc('record_learning_session', { p_session_id: payload.sessionId, p_history: canonical, p_cardlab_attempt: null });
    if (result && result.error) throw result.error;
    const receipt = result?.data;
    if (!receipt || !['committed', 'already_committed'].includes(receipt.status) || receipt.session_id !== payload.sessionId || typeof receipt.history_id !== 'string' || !receipt.history_id.trim()) throw new Error('GRID_SESSION_RECEIPT_MISMATCH');
    return result;
  }

  function pruneSyncedHarnessQueue() {
    // Only the shared atomic-RPC receipt owner may remove an acknowledged job.
    // A different successful INSERT is not proof that any queued run was saved.
    const harness = window.HahaLabLearningHarness;
    return harness && typeof harness.flushSyncQueue === 'function'
      ? harness.flushSyncQueue() : Promise.resolve({ skipped: true });
  }

  function saveResult(payload) {
    if (!state.stage || state.savedRunId) return;
    const reportPayload = state.pendingReport || (state.pendingReport = buildResultPayload(payload));
    state.savedRunId = `saving-${Date.now()}`;
    try {
      const harness = window.HahaLabLearningHarness;
      if (harness && typeof harness.recordSession === 'function') {
        const record = state.pendingRecord || (state.pendingRecord = harness.recordSession(reportPayload));
        if (!record?.id) throw new Error('GRID_PENDING_RECORD_REQUIRED');
        if (record?.pendingDurable === false) {
          if (typeof harness.queueSyncRecord !== 'function' || !harness.queueSyncRecord(record, { durable: true })) throw new Error('GRID_PENDING_STORAGE_FAILED');
          record.pendingDurable = true;
        }
        state.savedRunId = record?.id || '';
        if (state.savedRunId) void pruneSyncedHarnessQueue().catch((error) => console.warn('[gridcalc] pending sync', error));
        return;
      }
    } catch (error) {
      state.savedRunId = '';
      console.warn('[gridcalc] report save pending', error);
      if (els.resultSummary && !els.resultSummary.textContent.includes('기록 저장 대기 중')) els.resultSummary.textContent += ' 기록 저장 대기 중입니다. 동기화될 때까지 이 화면을 유지해 주세요.';
      return;
    }
    if (window.parent && window.parent !== window) {
      state.savedRunId = `parent-pending-${state.reportSessionId}`;
      window.dispatchEvent(new CustomEvent('hahalab:playlab-event', { detail: { type: 'study-complete', detail: reportPayload } }));
      return;
    }
    saveSupabaseReport(reportPayload)
      .then(() => { if (state.reportSessionId === reportPayload.sessionId) state.savedRunId = reportPayload.sessionId; })
      .catch((error) => {
        if (state.reportSessionId !== reportPayload.sessionId) return;
        state.savedRunId = '';
        if (els.resultSummary && !els.resultSummary.textContent.includes('기록 저장 대기 중')) els.resultSummary.textContent += ' 기록 저장 대기 중입니다. 동기화될 때까지 이 화면을 유지해 주세요.';
        console.error('[gridcalc] history save failed:', error);
      });
  }

  function showResult() {
    const total = state.stage.questions;
    const wrong = state.metrics.wrong;
    const accuracy = Math.round((state.metrics.correct / total) * 100);
    const averageResponse = average(state.metrics.responseTimes);
    const payload = {
      total,
      correct: state.metrics.correct,
      wrong,
      accuracy,
      averageResponse: Number(averageResponse.toFixed(1)),
      attempts: state.metrics.attempts,
      stage: state.stage ? state.stage.index : 0
    };
    els.resultTitle.textContent = `${state.stage.index}단계 완료`;
    els.resultSummary.textContent = `${state.stage.label}에서 ${total}문제를 끝냈어요.`;
    els.resultStats.innerHTML = [
      ['완료 문항', `${total}개`],
      ['정확도', `${accuracy}%`],
      ['다시 시도', `${wrong}회`],
      ['평균 반응', `${payload.averageResponse}초`]
    ].map(([label, value]) => `<div class="playlab-result-stat"><span class="playlab-result-stat-label">${label}</span><strong>${value}</strong></div>`).join('');
    saveResult(payload);
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
    els.stageGrid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-stage-index]');
      if (!card) return;
      startStage(Number(card.getAttribute('data-stage-index')));
    });

    els.palette.addEventListener('click', (event) => {
      const swatch = event.target.closest('[data-color-id]');
      if (!swatch) return;
      state.selectedColor = swatch.getAttribute('data-color-id');
      renderPalette(state.questions[state.questionIndex].palette);
    });

    els.answerGrid.addEventListener('pointerdown', (event) => {
      const cell = event.target.closest('[data-cell-index]');
      if (!cell) return;
      state.isPainting = true;
      cell.setPointerCapture?.(event.pointerId);
      paintCell(Number(cell.getAttribute('data-cell-index')));
    });

    els.answerGrid.addEventListener('pointermove', (event) => {
      if (!state.isPainting) return;
      const point = document.elementFromPoint(event.clientX, event.clientY);
      const cell = point && point.closest ? point.closest('[data-cell-index]') : null;
      if (!cell || !els.answerGrid.contains(cell)) return;
      paintCell(Number(cell.getAttribute('data-cell-index')));
    });

    document.addEventListener('pointerup', () => {
      state.isPainting = false;
    });

    els.stageSelectButton.addEventListener('click', () => {
      clearTutorialTimer();
      setTutorialBubble('');
      setScreen('stage');
    });
    els.otherStageButton.addEventListener('click', () => {
      clearTutorialTimer();
      setTutorialBubble('');
      setScreen('stage');
    });
    els.retryButton.addEventListener('click', () => {
      startStage(state.stage ? state.stage.index : 1);
    });
    els.helpButton.addEventListener('click', openHelp);
    els.skipTutorialButton.addEventListener('click', skipTutorial);
    els.tutorialNextButton.addEventListener('click', nextTutorialStep);
    els.helpCloseButton.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
  }

  function exposeHarnessApi() {
    window.__gridcalcHarness = {
      stages: () => STAGES.map((stage) => Object.assign({}, stage)),
      currentQuestion: () => {
        const question = state.questions[state.questionIndex];
        return question ? JSON.parse(JSON.stringify(question)) : null;
      },
      paintCorrect: () => {
        const question = state.questions[state.questionIndex];
        if (!question) return false;
        state.answer = question.target.slice();
        renderAnswerGrid();
        checkAnswerAutomatically();
        return true;
      },
      finishStage: () => {
        if (!state.stage) startStage(1);
        state.metrics.correct = state.stage.questions;
        state.metrics.attempts = state.stage.questions;
        state.metrics.wrong = 0;
        state.metrics.responseTimes = Array.from({ length: state.stage.questions }, () => 1);
        showResult();
        return true;
      }
    };
  }

  function init() {
    [
      'stageView',
      'gameView',
      'resultView',
      'stageGrid',
      'leftGrid',
      'rightGrid',
      'answerGrid',
      'palette',
      'gameKicker',
      'gameTitle',
      'operatorMark',
      'stageChip',
      'questionChip',
      'feedbackText',
      'tutorialBubble',
      'tutorialBubbleText',
      'tutorialNextButton',
      'virtualMouse',
      'skipTutorialButton',
      'stageSelectButton',
      'shellStageLabel',
      'otherStageButton',
      'retryButton',
      'resultTitle',
      'resultSummary',
      'resultStats',
      'helpButton',
      'helpModal',
      'helpCloseButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
    renderStages();
    bindEvents();
    exposeHarnessApi();
    if (new URLSearchParams(window.location.search).has('harness-result')) {
      window.setTimeout(() => {
        window.__gridcalcHarness.finishStage();
      }, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
