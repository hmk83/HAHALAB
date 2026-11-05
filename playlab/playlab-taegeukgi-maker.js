(function () {
  'use strict';

  const FLAG_DAYS = [
    {
      month: 3,
      day: 1,
      name: '3·1절',
      mapImage: 'korea-1.webp',
      characterImage: '0301_1x.webp',
      audioFile: '0301-samiljeol.mp3',
      type: 'normal',
      explainTitle: '3·1절은 어떤 날일까요?',
      explain: '우리나라 사람들이 모두 함께 대한독립 만세를 외치며\n나라를 사랑하는 마음을 보여준 날이에요.'
    },
    {
      month: 6,
      day: 6,
      name: '현충일',
      mapImage: 'korea-2.webp',
      characterImage: '0606_1x.webp',
      audioFile: '0606-hyeonchungil.mp3',
      type: 'mourning',
      explainTitle: '현충일은 어떤 날일까요?',
      explain: '나라를 지키기 위해 희생하신 분들을 기억하고 고마운 마음을 전하는 날이에요.'
    },
    {
      month: 7,
      day: 17,
      name: '제헌절',
      mapImage: 'korea-3.webp',
      characterImage: '0717_1x.webp',
      audioFile: '0717-jeheonjeol.mp3',
      type: 'normal',
      explainTitle: '제헌절은 어떤 날일까요?',
      explain: '우리나라의 약속인 헌법이 만들어진 날이에요.\n함께 지켜야 할 규칙의 소중함을 생각해요.'
    },
    {
      month: 8,
      day: 15,
      name: '광복절',
      mapImage: 'korea-4.webp',
      characterImage: '0815_1x.webp',
      audioFile: '0815-gwangbokjeol.mp3',
      type: 'normal',
      explainTitle: '광복절은 어떤 날일까요?',
      explain: '우리나라가 다시 자유를 찾은 날이에요.\n모두 함께 기뻐하고 나라를 사랑하는 마음을 나눠요.'
    },
    {
      month: 10,
      day: 1,
      name: '국군의 날',
      mapImage: 'korea-5.webp',
      characterImage: '1001_1x.webp',
      audioFile: '1001-armed-forces-day.mp3',
      type: 'normal',
      explainTitle: '국군의 날은 어떤 날일까요?',
      explain: '우리나라를 지키는 군인들에게 고마운 마음을 전하는 날이에요.'
    },
    {
      month: 10,
      day: 3,
      name: '개천절',
      mapImage: 'korea-6.webp',
      characterImage: '1003_1x.webp',
      audioFile: '1003-gaecheonjeol.mp3',
      type: 'normal',
      explainTitle: '개천절은 어떤 날일까요?',
      explain: '우리 민족이 처음 시작된 이야기를 기억하는 날이에요.\n나라의 뿌리를 생각해요.'
    },
    {
      month: 10,
      day: 9,
      name: '한글날',
      mapImage: 'korea-7.webp',
      characterImage: '1009_1x.webp',
      audioFile: '1009-hangeul-day.mp3',
      type: 'normal',
      explainTitle: '한글날은 어떤 날일까요?',
      explain: '세종대왕이 만든 한글의 소중함을 기념하는 날이에요.\n우리 글을 아끼는 마음을 가져요.'
    }
  ];

  const SLOTS = ['tl', 'tr', 'bl', 'br', 'center-top', 'center-bot'];
  const INITIAL_BOARD = SLOTS.reduce(function (acc, slot) {
    acc[slot] = null;
    return acc;
  }, {});

  const ANSWERS = {
    tl: { type: 'geon', color: 'black' },
    tr: { type: 'gam', color: 'black' },
    bl: { type: 'ri', color: 'black' },
    br: { type: 'gon', color: 'black' },
    'center-top': { type: 'taegeuk-top', color: 'red' },
    'center-bot': { type: 'taegeuk-bot', color: 'blue' }
  };

  const PIECES = [
    { id: 'geon', label: '건', lines: [1, 1, 1] },
    { id: 'gam', label: '감', lines: [0, 1, 0] },
    { id: 'ri', label: '리', lines: [1, 0, 1] },
    { id: 'gon', label: '곤', lines: [0, 0, 0] },
    { id: 'taegeuk-top', label: '태극', circle: true },
    { id: 'taegeuk-bot', label: '태극', circle: true }
  ];

  const COLORS = [
    { id: 'red', label: '빨강', hex: '#cd2e3a' },
    { id: 'blue', label: '파랑', hex: '#0047a0' },
    { id: 'black', label: '검정', hex: '#000000' }
  ];

  const COLOR_MAP = {
    empty: '#e5e7eb',
    red: '#cd2e3a',
    blue: '#0047a0',
    black: '#000000'
  };

  const state = {
    history: [cloneBoard(INITIAL_BOARD)],
    step: 0,
    phase: 'intro',
    activeTool: null,
    dragTool: null,
    errors: [],
    startedAtMs: Date.now(),
    checkedAtMs: 0,
    holiday: null,
    holidayIndex: 0,
    toastTimer: 0,
    holidayAudio: null,
    savedRunId: ''
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cloneBoard(board) {
    return JSON.parse(JSON.stringify(board));
  }

  function currentBoard() {
    return state.history[state.step] || cloneBoard(INITIAL_BOARD);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function makeSvg(type, color) {
    if (type === 'geon') return trigramSvg([1, 1, 1], color);
    if (type === 'gon') return trigramSvg([0, 0, 0], color);
    if (type === 'gam') return trigramSvg([0, 1, 0], color);
    if (type === 'ri') return trigramSvg([1, 0, 1], color);
    if (type === 'taegeuk-top') {
      const fill = color === COLOR_MAP.empty ? '#cbd5e1' : color;
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><path d="M 0,100 A 100,100 0 0,1 200,100 A 50,50 0 0,1 100,100 A 50,50 0 0,0 0,100 Z" fill="${fill}"/></svg>`;
    }
    if (type === 'taegeuk-bot') {
      const fill = color === COLOR_MAP.empty ? '#f1f5f9' : color;
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><path d="M 200,100 A 100,100 0 0,1 0,100 A 50,50 0 0,1 100,100 A 50,50 0 0,0 200,100 Z" fill="${fill}"/></svg>`;
    }
    return '';
  }

  function trigramSvg(lines, color) {
    return `<svg viewBox="0 0 100 65" aria-hidden="true">${lines.map(function (line, index) {
      const y = index * 25;
      if (line === 1) return `<rect x="0" y="${y}" width="100" height="15" fill="${color}" rx="2"/>`;
      return `<rect x="0" y="${y}" width="45" height="15" fill="${color}" rx="2"/><rect x="55" y="${y}" width="45" height="15" fill="${color}" rx="2"/>`;
    }).join('')}</svg>`;
  }

  function dateFromQuery() {
    const value = new URLSearchParams(window.location.search).get('date');
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function nextFlagDay(today) {
    const monthDay = (today.getMonth() + 1) * 100 + today.getDate();
    const thisYear = today.getFullYear();
    const foundIndex = FLAG_DAYS.findIndex(function (item) {
      return item.month * 100 + item.day >= monthDay;
    });
    const found = foundIndex >= 0 ? FLAG_DAYS[foundIndex] : FLAG_DAYS[0];
    const year = foundIndex >= 0 ? thisYear : thisYear + 1;
    return Object.assign({ year, index: foundIndex >= 0 ? foundIndex : 0 }, found);
  }

  function formatDate(item) {
    return `${item.month}월 ${item.day}일`;
  }

  function formatCompactDate(item) {
    return `${item.month}월${item.day}일`;
  }

  function setInitialHoliday() {
    const today = dateFromQuery() || new Date();
    const holiday = nextFlagDay(today);
    state.holidayIndex = holiday.index;
    setHolidayByIndex(holiday.index, holiday.year);
  }

  function setHolidayByIndex(index, year) {
    const normalized = (index + FLAG_DAYS.length) % FLAG_DAYS.length;
    const base = FLAG_DAYS[normalized];
    state.holidayIndex = normalized;
    state.holiday = Object.assign({ year: year || state.holiday?.year || new Date().getFullYear(), index: normalized }, base);
    renderHolidayCopy();
  }

  function renderHolidayCopy() {
    const holiday = state.holiday;
    if (!holiday) return;
    els.introDateChip.textContent = formatDate(holiday);
    els.introTitle.textContent = `${formatCompactDate(holiday)} ${holiday.name}이에요!`;
    els.introLead.textContent = `${holiday.name}에 태극기를 달아요.`;
    els.introExplainTitle.textContent = holiday.explainTitle;
    els.introExplainText.textContent = holiday.explain;
    els.holidayTitle.textContent = `${holiday.name}에 태극기를 달아요!`;
    els.holidayChip.textContent = `${formatDate(holiday)} ${holiday.name}`;
    els.holidaySub.textContent = holiday.type === 'mourning'
      ? '현충일에는 조기를 달아요. 태극기 모양을 완성하며 위치와 색을 익혀요.'
      : '태극 문양과 4괘의 자리를 살펴보고 알맞게 완성해요.';
    updateHolidayMapSelection();
  }

  function moveHoliday(direction) {
    setHolidayByIndex(state.holidayIndex + direction);
    showHolidayToast();
  }

  function holidayAudioSrc(holiday) {
    return holiday && holiday.audioFile
      ? `../playlab/sound/taegeukgi-maker/${holiday.audioFile}`
      : '';
  }

  function stopHolidayAudio() {
    if (!state.holidayAudio) return;
    state.holidayAudio.pause();
    state.holidayAudio.currentTime = 0;
    state.holidayAudio = null;
  }

  function playHolidayAudio() {
    if (!state.holiday) return;
    const src = holidayAudioSrc(state.holiday);
    if (!src) return;
    stopHolidayAudio();
    const audio = new Audio(src);
    state.holidayAudio = audio;
    audio.preload = 'auto';
    audio.addEventListener('ended', function () {
      if (state.holidayAudio === audio) state.holidayAudio = null;
    }, { once: true });
    audio.play().catch(function () {
      if (state.holidayAudio === audio) state.holidayAudio = null;
    });
  }

  function renderHolidayMap() {
    els.holidayMap.innerHTML = FLAG_DAYS.map(function (holiday, index) {
      return `
        <button type="button" class="taegeuk-map-marker" data-holiday-index="${index}" data-index="${index}" aria-label="${formatDate(holiday)} ${escapeHtml(holiday.name)} 설명 보기">
          <img src="../playlab/images/etc/${escapeHtml(holiday.mapImage)}" alt="">
        </button>
      `;
    }).join('');
    updateHolidayMapSelection();
  }

  function updateHolidayMapSelection() {
    if (!els.holidayMap) return;
    els.holidayMap.querySelectorAll('[data-holiday-index]').forEach(function (button) {
      const isActive = Number(button.dataset.holidayIndex) === state.holidayIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function showHolidayToast() {
    if (!els.introToast || !state.holiday) return;
    els.introCharacter.src = `../playlab/images/etc/${state.holiday.characterImage}`;
    els.introCharacter.alt = `${state.holiday.name} 캐릭터`;
    els.introExplainTitle.textContent = state.holiday.explainTitle;
    els.introExplainText.innerHTML = formatExplainLines(state.holiday.explain);
    els.introToast.classList.add('is-open');
    els.introToast.setAttribute('aria-hidden', 'false');
  }

  function hideHolidayToast() {
    if (!els.introToast) return;
    stopHolidayAudio();
    window.clearTimeout(state.toastTimer);
    els.introToast.classList.remove('is-open');
    els.introToast.setAttribute('aria-hidden', 'true');
  }

  function formatExplainLines(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
  }

  function startMaking() {
    stopHolidayAudio();
    state.phase = 'playing';
    state.startedAtMs = Date.now();
    setScreen('play');
    refresh();
  }

  function renderTools() {
    els.pieceTools.innerHTML = PIECES.map(function (piece) {
      const color = piece.circle ? COLOR_MAP.empty : '#111827';
      return `
        <button type="button" class="taegeuk-tool" draggable="true" data-tool-type="piece" data-tool-id="${escapeHtml(piece.id)}" aria-label="${escapeHtml(piece.label)} 조각">
          <span class="taegeuk-tool-preview ${piece.circle ? 'is-circle' : ''}">${makeSvg(piece.id, color)}</span>
          <span class="taegeuk-tool-label">${escapeHtml(piece.label)}</span>
        </button>
      `;
    }).join('');

    els.colorTools.innerHTML = COLORS.map(function (color) {
      return `
        <button type="button" class="taegeuk-color-btn" draggable="true" data-tool-type="color" data-tool-id="${escapeHtml(color.id)}" aria-label="${escapeHtml(color.label)} 색">
          <span class="taegeuk-swatch" style="background:${escapeHtml(color.hex)}"></span>
          <span>${escapeHtml(color.label)}</span>
        </button>
      `;
    }).join('');
  }

  function renderFlag(target, board, options) {
    const readonly = options && options.readonly;
    const errors = options && Array.isArray(options.errors) ? options.errors : [];
    const corrects = options && Array.isArray(options.corrects) ? options.corrects : [];
    const showCenterOutline = !readonly && !board['center-top'] && !board['center-bot'];
    const centerArt = buildCenterArt(board);
    target.innerHTML = (showCenterOutline ? '<div class="taegeuk-center-outline"></div>' : '') + centerArt + SLOTS.map(function (slot) {
      const piece = board[slot];
      const errorClass = errors.includes(slot) ? ' is-error' : '';
      const correctClass = corrects.includes(slot) ? ' is-correct-highlight' : '';
      const readonlyClass = readonly ? ' is-readonly' : '';
      const pieceClass = piece ? ' has-piece' : '';
      const isCenter = slot === 'center-top' || slot === 'center-bot';
      return `
        <button type="button" class="taegeuk-slot${readonlyClass}${pieceClass}${errorClass}${correctClass}" data-slot="${escapeHtml(slot)}" ${readonly ? 'tabindex="-1" aria-hidden="true"' : `aria-label="${slotLabel(slot)}"`}>
          ${piece && !isCenter ? `<span class="taegeuk-piece-wrap">${makeSvg(piece.type, COLOR_MAP[piece.color] || COLOR_MAP.empty)}</span>` : ''}
        </button>
      `;
    }).join('');
  }

  function buildCenterArt(board) {
    const top = board['center-top'];
    const bottom = board['center-bot'];
    if (!top && !bottom) return '';
    return `
      <div class="taegeuk-center-art" aria-hidden="true">
        ${top ? `<span class="taegeuk-center-art-part is-top">${makeSvg(top.type, COLOR_MAP[top.color] || COLOR_MAP.empty)}</span>` : ''}
        ${bottom ? `<span class="taegeuk-center-art-part is-bottom">${makeSvg(bottom.type, COLOR_MAP[bottom.color] || COLOR_MAP.empty)}</span>` : ''}
      </div>
    `;
  }

  function slotLabel(slot) {
    const labels = {
      tl: '왼쪽 위 괘 자리',
      tr: '오른쪽 위 괘 자리',
      bl: '왼쪽 아래 괘 자리',
      br: '오른쪽 아래 괘 자리',
      'center-top': '태극 위쪽 자리',
      'center-bot': '태극 아래쪽 자리'
    };
    return labels[slot] || '태극기 자리';
  }

  function refresh() {
    const board = currentBoard();
    renderFlag(els.flagCanvas, board, { errors: state.errors });
    updateProgress(board);
    updateButtons();
    updateActiveTool();
  }

  function updateProgress(board) {
    return SLOTS.filter(function (slot) {
      const piece = board[slot];
      return piece && piece.color !== 'empty';
    }).length;
  }

  function updateButtons() {
    els.undoButton.disabled = state.step === 0 || state.phase !== 'playing';
    els.clearButton.disabled = state.step === 0 || state.phase !== 'playing';
  }

  function updateActiveTool() {
    document.querySelectorAll('[data-tool-type][data-tool-id]').forEach(function (button) {
      const active = state.activeTool &&
        state.activeTool.type === button.dataset.toolType &&
        state.activeTool.id === button.dataset.toolId;
      button.classList.toggle('is-active', !!active);
    });
  }

  function setActiveTool(type, id) {
    state.activeTool = { type, id };
    const label = toolLabel(type, id);
    setStatus(`${label} 선택 → 자리 누르기`);
    updateActiveTool();
  }

  function toolFromElement(tool) {
    if (!tool) return null;
    return { type: tool.dataset.toolType, id: tool.dataset.toolId };
  }

  function toolLabel(type, id) {
    if (type === 'piece') return (PIECES.find(function (item) { return item.id === id; }) || {}).label || '조각';
    return (COLORS.find(function (item) { return item.id === id; }) || {}).label || '색';
  }

  function applyTool(slot, tool) {
    if (state.phase !== 'playing' || !tool) return;
    const board = cloneBoard(currentBoard());
    if (tool.type === 'piece') {
      board[slot] = { type: tool.id, color: 'empty' };
    } else if (tool.type === 'color') {
      if (!board[slot]) {
        setStatus('먼저 조각 놓기', 'warning');
        return;
      }
      board[slot] = Object.assign({}, board[slot], { color: tool.id });
    }
    const nextHistory = state.history.slice(0, state.step + 1);
    nextHistory.push(board);
    state.history = nextHistory;
    state.step = nextHistory.length - 1;
    state.errors = [];
    setStatus('좋아요');
    refresh();
  }

  function setStatus(message, tone) {
    els.statusMessage.textContent = message;
    els.statusMessage.classList.toggle('is-warning', tone === 'warning');
    els.statusMessage.classList.toggle('is-success', tone === 'success');
  }

  function undo() {
    if (state.step <= 0) return;
    state.step -= 1;
    state.errors = [];
    setStatus('이전 단계');
    refresh();
  }

  function clearBoard() {
    const nextHistory = state.history.slice(0, state.step + 1);
    nextHistory.push(cloneBoard(INITIAL_BOARD));
    state.history = nextHistory;
    state.step = nextHistory.length - 1;
    state.errors = [];
    setStatus('처음부터');
    refresh();
  }

  function openClearModal() {
    if (state.step === 0 || state.phase !== 'playing') return;
    els.clearModal.classList.add('is-open');
    els.clearModal.setAttribute('aria-hidden', 'false');
  }

  function closeClearModal() {
    els.clearModal.classList.remove('is-open');
    els.clearModal.setAttribute('aria-hidden', 'true');
  }

  function confirmClearBoard() {
    closeClearModal();
    clearBoard();
  }

  function boardIsFull(board) {
    return SLOTS.every(function (slot) {
      return board[slot] && board[slot].color !== 'empty';
    });
  }

  function checkAnswer() {
    const board = currentBoard();
    if (!boardIsFull(board)) {
      setStatus('6개 모두 완성', 'warning');
      if (window.PlaylabFeedbackOverlay) window.PlaylabFeedbackOverlay.wrong({ sound: true });
      return;
    }

    const errors = SLOTS.filter(function (slot) {
      const answer = ANSWERS[slot];
      const piece = board[slot];
      return !piece || piece.type !== answer.type || piece.color !== answer.color;
    });
    state.errors = errors;
    state.checkedAtMs = Date.now();
    if (errors.length) {
      setStatus('다시 비교');
      if (window.PlaylabFeedbackOverlay) window.PlaylabFeedbackOverlay.wrong({ sound: true });
    } else {
      setStatus('완성', 'success');
      if (window.PlaylabFeedbackOverlay) window.PlaylabFeedbackOverlay.correct({ sound: true });
      launchConfetti();
    }
    showResult(errors);
  }

  function showResult(errors) {
    const board = currentBoard();
    const perfect = errors.length === 0;
    state.phase = 'result';
    renderFlag(els.myResultFlag, board, { readonly: true, errors });
    renderFlag(els.answerFlag, ANSWERS, { readonly: true, corrects: perfect ? SLOTS : [] });
    els.answerPanel.hidden = perfect;
    els.resultKicker.textContent = perfect ? '정확한 태극기' : '다시 비교하기';
    els.resultTitle.textContent = perfect ? '태극기 완성' : '조금만 더 맞춰봐요';
    els.resultSummary.textContent = perfect
      ? `${state.holiday.name}에 맞춰 태극기의 위치와 색을 모두 정확하게 완성했어요.`
      : `${errors.length}곳을 다시 확인하면 완성할 수 있어요. 깜빡이는 위치를 정답 태극기와 비교해보세요.`;
    renderReportSummary(perfect, errors.length);
    saveLearningReport(perfect, errors.length);
    setScreen('result');
  }

  function renderReportSummary(perfect, errorCount) {
    const elapsedSeconds = Math.max(1, Math.round(((state.checkedAtMs || Date.now()) - state.startedAtMs) / 1000));
    const accuracy = Math.round(((SLOTS.length - errorCount) / SLOTS.length) * 100);
    els.reportSummary.innerHTML = `
      <div><strong>${accuracy}%</strong><span>정확도</span></div>
      <div><strong>${elapsedSeconds}초</strong><span>완성 시간</span></div>
      <div><strong>${perfect ? '완성' : `${errorCount}곳`}</strong><span>비교 결과</span></div>
    `;
  }

  function saveLearningReport(perfect, errorCount) {
    if (!window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function') return;
    const elapsedMs = Math.max(1, (state.checkedAtMs || Date.now()) - state.startedAtMs);
    const accuracy = Math.round(((SLOTS.length - errorCount) / SLOTS.length) * 100);
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'playlab',
      reportScope: 'playlab',
      curriculumKey: 'playlab-taegeukgi-maker',
      title: '태극기 만들기',
      stageTitle: state.holiday ? `${state.holiday.name} 게양일` : '태극기 만들기',
      totalQuestions: SLOTS.length,
      correctCount: SLOTS.length - errorCount,
      wrongCount: errorCount,
      score: accuracy,
      accuracyScore: accuracy,
      durationSeconds: elapsedMs / 1000,
      startedAtMs: state.startedAtMs,
      reportType: 'visual-construction',
      saveToClientReport: true,
      summary: '태극 문양과 4괘를 보고 위치와 색을 맞추는 시각 구성 학습입니다.',
      overview: '조작 기반으로 조각 배치와 색칠을 수행하며, 결과 화면에서 오류 위치를 즉시 비교합니다.',
      recommendations: perfect
        ? ['다음에는 정답 확인 전 스스로 4괘의 이름을 말해보게 합니다.']
        : ['틀린 위치를 정답과 나란히 비교한 뒤 같은 판에서 수정하게 합니다.'],
      extra: {
        holiday_name: state.holiday ? state.holiday.name : '',
        holiday_date: state.holiday ? `${state.holiday.year}-${String(state.holiday.month).padStart(2, '0')}-${String(state.holiday.day).padStart(2, '0')}` : '',
        task_domain: '시각 구성, 위치 기억, 상징 이해',
        evidence_rule: '조작 기반 배치와 즉시 오류 비교 피드백을 사용함'
      }
    });
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
  }

  function pieceColor(piece) {
    if (!piece) return COLOR_MAP.empty;
    if (piece.color === 'empty' && piece.type === 'taegeuk-top') return '#cbd5e1';
    if (piece.color === 'empty' && piece.type === 'taegeuk-bot') return '#f1f5f9';
    return COLOR_MAP[piece.color] || COLOR_MAP.empty;
  }

  function fillRoundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, r);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();
  }

  function drawTrigram(ctx, x, y, width, type, color, rotationDeg) {
    const piece = PIECES.find(function (item) { return item.id === type; });
    if (!piece || !piece.lines) return;
    const height = width * 0.65;
    const barHeight = height * (15 / 65);
    const step = height * (25 / 65);
    const brokenWidth = width * 0.45;
    const corner = barHeight * 0.14;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationDeg * Math.PI / 180);
    ctx.fillStyle = color;
    piece.lines.forEach(function (line, index) {
      const lineY = -height / 2 + index * step;
      if (line === 1) {
        fillRoundRect(ctx, -width / 2, lineY, width, barHeight, corner);
      } else {
        fillRoundRect(ctx, -width / 2, lineY, brokenWidth, barHeight, corner);
        fillRoundRect(ctx, width / 2 - brokenWidth, lineY, brokenWidth, barHeight, corner);
      }
    });
    ctx.restore();
  }

  function drawTaegeuk(ctx, x, y, diameter, topPiece, bottomPiece) {
    if (!topPiece && !bottomPiece) return;
    const topPath = new Path2D('M 0,100 A 100,100 0 0,1 200,100 A 50,50 0 0,1 100,100 A 50,50 0 0,0 0,100 Z');
    const bottomPath = new Path2D('M 200,100 A 100,100 0 0,1 0,100 A 50,50 0 0,1 100,100 A 50,50 0 0,0 200,100 Z');
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-33.69 * Math.PI / 180);
    ctx.scale(diameter / 200, diameter / 200);
    ctx.translate(-100, -100);
    if (topPiece) {
      ctx.fillStyle = pieceColor(topPiece);
      ctx.fill(topPath);
    }
    if (bottomPiece) {
      ctx.fillStyle = pieceColor(bottomPiece);
      ctx.fill(bottomPath);
    }
    ctx.restore();
  }

  function downloadFlagJpg() {
    const board = currentBoard();
    const width = 1500;
    const height = 1000;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const holidayName = state.holiday ? state.holiday.name : '태극기';
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, width - 3, height - 3);
    drawTaegeuk(ctx, width * 0.5, height * 0.5, width * 0.36, board['center-top'], board['center-bot']);
    drawTrigram(ctx, width * 0.18, height * 0.2, width * 0.18, board.tl && board.tl.type, pieceColor(board.tl), -56.31);
    drawTrigram(ctx, width * 0.82, height * 0.2, width * 0.18, board.tr && board.tr.type, pieceColor(board.tr), 56.31);
    drawTrigram(ctx, width * 0.18, height * 0.8, width * 0.18, board.bl && board.bl.type, pieceColor(board.bl), 56.31);
    drawTrigram(ctx, width * 0.82, height * 0.8, width * 0.18, board.br && board.br.type, pieceColor(board.br), -56.31);

    const link = document.createElement('a');
    const safeName = holidayName.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-');
    link.download = `태극기-만들기-${safeName}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.94);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function setScreen(name) {
    if (name !== 'intro') stopHolidayAudio();
    els.introView.classList.toggle('is-active', name === 'intro');
    els.playView.classList.toggle('is-active', name === 'play');
    els.resultView.classList.toggle('is-active', name === 'result');
    if (els.shell) els.shell.dataset.screen = name;
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'result', {
        title: function () { return '태극기 만들기-리포트'; }
      });
    }
  }

  function goStageSelect() {
    stopHolidayAudio();
    closeClearModal();
    closeHelp();
    state.phase = 'intro';
    setScreen('intro');
    hideHolidayToast();
  }

  function retry() {
    stopHolidayAudio();
    state.history = [cloneBoard(INITIAL_BOARD)];
    state.step = 0;
    state.phase = 'intro';
    state.errors = [];
    state.activeTool = null;
    state.startedAtMs = Date.now();
    state.checkedAtMs = 0;
    setScreen('intro');
    setStatus('조각 선택 → 자리 누르기');
    refresh();
  }

  function backToPlay() {
    stopHolidayAudio();
    state.phase = 'playing';
    setScreen('play');
    setStatus('고쳐보기');
    refresh();
  }

  function launchConfetti() {
    const colors = ['#cd2e3a', '#0047a0', '#111827', '#facc15'];
    for (let index = 0; index < 54; index += 1) {
      const chip = document.createElement('span');
      chip.className = 'taegeuk-confetti';
      chip.style.left = `${Math.random() * 100}vw`;
      chip.style.background = colors[index % colors.length];
      chip.style.animationDuration = `${2 + Math.random() * 2.4}s`;
      chip.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(chip);
      window.setTimeout(function () {
        chip.remove();
      }, 5200);
    }
  }

  function openHelp() {
    els.helpModal.classList.add('is-active');
    els.helpModal.classList.add('is-open');
    els.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    els.helpModal.classList.remove('is-active');
    els.helpModal.classList.remove('is-open');
    els.helpModal.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
    document.addEventListener('click', function (event) {
      const holidayMarker = event.target.closest('[data-holiday-index]');
      if (!holidayMarker) stopHolidayAudio();

      const tool = event.target.closest('[data-tool-type][data-tool-id]');
      if (tool) {
        setActiveTool(tool.dataset.toolType, tool.dataset.toolId);
        return;
      }

      const slot = event.target.closest('.taegeuk-slot[data-slot]');
      if (slot && state.phase === 'playing') {
        applyTool(slot.dataset.slot, state.activeTool);
        return;
      }

      if (holidayMarker && state.phase === 'intro') {
        setHolidayByIndex(Number(holidayMarker.dataset.holidayIndex));
        showHolidayToast();
        playHolidayAudio();
      }
    });

    document.addEventListener('pointerdown', function (event) {
      const tool = event.target.closest('[data-tool-type][data-tool-id]');
      if (!tool) return;
      state.dragTool = toolFromElement(tool);
    });

    document.addEventListener('dragstart', function (event) {
      const tool = event.target.closest('[data-tool-type][data-tool-id]');
      if (!tool) return;
      const dragTool = toolFromElement(tool);
      state.dragTool = dragTool;
      setActiveTool(dragTool.type, dragTool.id);
      event.dataTransfer.setData('toolType', dragTool.type);
      event.dataTransfer.setData('toolId', dragTool.id);
      event.dataTransfer.effectAllowed = 'copy';
    });

    document.addEventListener('dragend', function () {
      state.dragTool = null;
    });

    els.flagCanvas.addEventListener('dragover', function (event) {
      const slot = event.target.closest('.taegeuk-slot[data-slot]');
      if (!slot) return;
      event.preventDefault();
      slot.classList.add('is-drop-target');
    });

    els.flagCanvas.addEventListener('dragleave', function (event) {
      const slot = event.target.closest('.taegeuk-slot[data-slot]');
      if (slot) slot.classList.remove('is-drop-target');
    });

    els.flagCanvas.addEventListener('drop', function (event) {
      const slot = event.target.closest('.taegeuk-slot[data-slot]');
      if (!slot) return;
      event.preventDefault();
      slot.classList.remove('is-drop-target');
      const droppedTool = {
        type: event.dataTransfer.getData('toolType') || (state.dragTool && state.dragTool.type) || (state.activeTool && state.activeTool.type),
        id: event.dataTransfer.getData('toolId') || (state.dragTool && state.dragTool.id) || (state.activeTool && state.activeTool.id)
      };
      state.dragTool = null;
      if (droppedTool.type && droppedTool.id) applyTool(slot.dataset.slot, droppedTool);
    });

    els.undoButton.addEventListener('click', undo);
    els.clearButton.addEventListener('click', openClearModal);
    els.clearCancelButton.addEventListener('click', closeClearModal);
    els.clearConfirmButton.addEventListener('click', confirmClearBoard);
    els.checkButton.addEventListener('click', checkAnswer);
    els.saveJpgButton.addEventListener('click', downloadFlagJpg);
    els.retryButton.addEventListener('click', retry);
    els.stageSelectButton.addEventListener('click', goStageSelect);
    els.startButton.addEventListener('click', startMaking);
    els.prevHolidayButton.addEventListener('click', function () { moveHoliday(-1); });
    els.nextHolidayButton.addEventListener('click', function () { moveHoliday(1); });
    els.introToastClose.addEventListener('click', hideHolidayToast);
    els.helpButton.addEventListener('click', openHelp);
    els.helpCloseButton.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', function (event) {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    els.clearModal.addEventListener('click', function (event) {
      if (event.target.matches('[data-close-clear-modal]')) closeClearModal();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeHelp();
        closeClearModal();
      }
    });
  }

  function cacheElements() {
    [
      'holidayChip',
      'holidayMap',
      'introToast',
      'introToastClose',
      'introCharacter',
      'introView',
      'introDateChip',
      'introTitle',
      'introLead',
      'introExplainTitle',
      'introExplainText',
      'startButton',
      'stageSelectButton',
      'prevHolidayButton',
      'nextHolidayButton',
      'holidayTitle',
      'holidaySub',
      'flagCanvas',
      'statusMessage',
      'pieceTools',
      'colorTools',
      'undoButton',
      'clearButton',
      'checkButton',
      'playView',
      'resultView',
      'myResultFlag',
      'answerFlag',
      'answerPanel',
      'resultKicker',
      'resultTitle',
      'resultSummary',
      'reportSummary',
      'saveJpgButton',
      'retryButton',
      'helpButton',
      'helpModal',
      'helpCloseButton',
      'clearModal',
      'clearCancelButton',
      'clearConfirmButton'
    ].forEach(function (id) {
      els[id] = $(id);
    });
    els.shell = document.querySelector('.taegeuk-shell');
  }

  function init() {
    cacheElements();
    setInitialHoliday();
    renderHolidayMap();
    renderTools();
    bindEvents();
    refresh();
    setScreen('intro');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
