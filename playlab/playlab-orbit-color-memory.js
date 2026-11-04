(function () {
  'use strict';

  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const REPORT_SCOPE = resolveRuntimeLabScope();
  const LAB_LABEL = REPORT_SCOPE === 'rehab' ? '재활랩' : 'PlayLab';
  const LAB_TITLE = `${LAB_LABEL} 색 궤도 기억 훈련`;
  const REHAB_HELP_STORAGE_KEY = 'rehablab-orbit-color-memory-help-hidden-v1';
  const REHAB_AGE_GROUPS = [
    { id: 'preschool', label: '유아', range: '4-6세', shift: -2, note: '짧은 순서와 충분한 제시 시간으로 시각 작업기억의 기초를 안정화합니다.' },
    { id: 'elementary', label: '초등', range: '7-12세', shift: -1, note: '3-4항목 순차 기억과 선택 주의를 함께 관찰합니다.' },
    { id: 'teen', label: '청소년', range: '13-18세', shift: 0, note: '속도와 정확도를 함께 요구하는 표준 부하 조건입니다.' },
    { id: 'adult', label: '성인', range: '19-64세', shift: 1, note: '고부하 순차 유지와 자기 점검을 함께 요구합니다.' },
    { id: 'senior', label: '고령자', range: '65세+', shift: -2, note: '처리 속도보다 안정적인 성공 경험과 반복 유지가 우선입니다.' }
  ];
  const REHAB_LEVELS = [
    { id: 'lv1', index: 1, label: '2색 기초 유지', desc: '짧은 순서와 기본 반응 규칙을 익힙니다.', baseIndex: 0 },
    { id: 'lv2', index: 2, label: '3색 순차 준비', desc: '2-3단계 순서를 안정적으로 유지합니다.', baseIndex: 2 },
    { id: 'lv3', index: 3, label: '3색 표준 기억', desc: '표준 순차 작업기억 부하를 관찰합니다.', baseIndex: 4 },
    { id: 'lv4', index: 4, label: '4색 확장 기억', desc: '기억 폭과 주의 지속을 함께 확장합니다.', baseIndex: 6 },
    { id: 'lv5', index: 5, label: '5색 고부하 유지', desc: '긴 순서를 끝까지 유지하는 고부하 단계입니다.', baseIndex: 8 },
    { id: 'lv6', index: 6, label: '6색 임상 심화', desc: '고난도 순차 기억과 자기 점검을 요구합니다.', baseIndex: 10 }
  ];

  const COLORS = [
    { id: 'green', button: 'B3', label: '초록', hex: '#20b970', text: '#ffffff' },
    { id: 'blue', button: 'B2', label: '파랑', hex: '#3478f6', text: '#ffffff' },
    { id: 'white', button: 'B4', label: '흰색', hex: '#f8fafc', text: '#334155' },
    { id: 'gray', button: 'B6', label: '회색', hex: '#94a3b8', text: '#ffffff' },
    { id: 'red', button: 'B1', label: '빨강', hex: '#ff0000', text: '#ffffff' },
    { id: 'yellow', button: 'B0', label: '노랑', hex: '#ffce24', text: '#4a3410' },
    { id: 'black', button: 'B5', label: '검정', hex: '#000000', text: '#ffffff' },
    { id: 'violet', button: 'B7', label: '보라', hex: '#8b5cf6', text: '#ffffff' }
  ];

  const STAGES = [
    { id: 'stage-01', title: '2색 천천히 기억', shortRule: '순서대로', colorCount: 2, sequenceLength: 2, rounds: 5, orbitMs: 7200, task: 'forward', accent: '#814ab1', focus: '초기 주의 고정' },
    { id: 'stage-02', title: '2색 순서 반복', shortRule: '순서대로', colorCount: 2, sequenceLength: 2, rounds: 6, orbitMs: 7000, task: 'forward', accent: '#4cbdc9', focus: '2색 순서 안정화' },
    { id: 'stage-03', title: '3색 순서 기억', shortRule: '순서대로', colorCount: 3, sequenceLength: 3, rounds: 7, orbitMs: 6800, task: 'forward', accent: '#ffce24', focus: '순차 작업기억' },
    { id: 'stage-04', title: '3색 순서 반복', shortRule: '순서대로', colorCount: 3, sequenceLength: 3, rounds: 8, orbitMs: 6600, task: 'forward', accent: '#ff2d74', focus: '3색 순서 안정화' },
    { id: 'stage-05', title: '3색 순서 집중', shortRule: '순서대로', colorCount: 3, sequenceLength: 3, rounds: 9, orbitMs: 6400, task: 'forward', accent: '#20b970', focus: '순서 유지 집중' },
    { id: 'stage-06', title: '4색 순서 확장', shortRule: '순서대로', colorCount: 4, sequenceLength: 4, rounds: 10, orbitMs: 8000, task: 'forward', accent: '#3478f6', focus: '기억 폭 확장' },
    { id: 'stage-07', title: '4색 순서 반복', shortRule: '순서대로', colorCount: 4, sequenceLength: 4, rounds: 12, orbitMs: 8000, task: 'forward', accent: '#f97316', focus: '4색 순서 안정화' },
    { id: 'stage-08', title: '5색 순서 기억', shortRule: '순서대로', colorCount: 5, sequenceLength: 5, rounds: 12, orbitMs: 9000, task: 'forward', accent: '#0ea5e9', focus: '선택적 주의' },
    { id: 'stage-09', title: '5색 순서 반복', shortRule: '순서대로', colorCount: 5, sequenceLength: 5, rounds: 14, orbitMs: 9000, task: 'forward', accent: '#a855f7', focus: '5색 순서 안정화' },
    { id: 'stage-10', title: '5색 순서 집중', shortRule: '순서대로', colorCount: 5, sequenceLength: 5, rounds: 15, orbitMs: 9000, task: 'forward', accent: '#ef4444', focus: '고부하 순서 유지' },
    { id: 'stage-11', title: '6색 순서 기억', shortRule: '순서대로', colorCount: 6, sequenceLength: 6, rounds: 18, orbitMs: 10000, task: 'forward', accent: '#14b8a6', focus: '6색 순서 확장' },
    { id: 'stage-12', title: '6색 순서 집중', shortRule: '순서대로', colorCount: 6, sequenceLength: 6, rounds: 20, orbitMs: 10000, task: 'forward', accent: '#64748b', focus: '전환 없는 순차 기억' }
  ];

  const DOT_STAGGER_MS = 900;

  function resolveRuntimeLabScope() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const labKind = String(params.get('labKind') || '').trim().toLowerCase();
      const fileName = String(window.location.pathname || '').split('/').pop() || '';
      if (labKind === 'rehab' || fileName.startsWith('rehablab-')) return 'rehab';
    } catch (_error) {}
    return 'playlab';
  }

  const state = {
    stage: null,
    selectedAgeId: '',
    selectedLevelId: '',
    rounds: [],
    roundIndex: 0,
    phase: 'stage',
    input: [],
    startedAtMs: 0,
    responseStartedAt: 0,
    observeTimer: 0,
    advanceTimer: 0,
    savedRunId: '',
    gamepadButtons: new Map(),
    joystickConnected: false,
    audio: {},
    reportSaveState: '',
    metrics: {
      correct: 0,
      wrong: 0,
      replays: 0,
      responseTimes: [],
      roundSummaries: []
    }
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function getAge(ageId) {
    return REHAB_AGE_GROUPS.find((age) => age.id === ageId) || null;
  }

  function getLevel(levelId) {
    return REHAB_LEVELS.find((level) => level.id === levelId) || null;
  }

  function buildStageForSelection(ageId, levelId) {
    const age = getAge(ageId);
    const level = getLevel(levelId);
    if (!age || !level) return null;
    const stageIndex = clamp(level.baseIndex + age.shift, 0, STAGES.length - 1);
    const template = Object.assign({}, STAGES[stageIndex]);
    return Object.assign(template, {
      id: `${template.id}-${age.id}-${level.id}`,
      title: `${age.label} · ${level.label}`,
      shortRule: template.shortRule,
      subtitle: `${age.range} 기준 · ${level.desc}`,
      rehabAge: age,
      rehabLevel: level
    });
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
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value) {
    return Math.round(Number(value || 0));
  }

  function colorById(id) {
    return COLORS.find((color) => color.id === id) || COLORS[0];
  }

  function labelFor(id) {
    return colorById(id).label;
  }

  function stageColors(stage) {
    return COLORS;
  }

  function formatMs(ms) {
    return `${(Math.max(0, ms) / 1000).toFixed(1)}초`;
  }

  function setScreen(name) {
    ['stageView', 'gameView', 'resultView'].forEach((id) => {
      els[id].classList.toggle('is-active', id === `${name}View`);
    });
    els.stageButton.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel.classList.toggle('shell-hidden', name === 'stage');
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'result', {
        title: () => `색-궤도-기억-${state.stage ? state.stage.title : '리포트'}`
      });
    }
  }

  function renderStages() {
    if (REPORT_SCOPE === 'rehab' && els.levelGrid) {
      renderRehabLevels();
      updateRehabMenuState();
      return;
    }
    els.stageGrid.innerHTML = '<div class="orbit-stage-head playlab-stage-label-block"><h1>시각 놀이 단계 학습</h1><p>Visual Play Stage Learning</p></div>' + STAGES.map((stage, index) => `
      <button type="button" class="orbit-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-color:${escapeHtml(stage.accent)}">
        <span class="orbit-stage-badge">${String(index + 1).padStart(2, '0')}</span>
        <strong>${escapeHtml(stage.title)}</strong>
        <p>${escapeHtml(stage.focus)} · ${escapeHtml(stage.shortRule)}</p>
        <div class="orbit-stage-meta">
          <span>${stage.colorCount}색</span>
          <span>${stage.rounds}문항</span>
          <span>${formatMs(stage.orbitMs)}</span>
        </div>
      </button>
    `).join('');
  }

  function renderRehabLevels() {
    els.levelGrid.innerHTML = REHAB_LEVELS.map((level) => `
      <button type="button" class="traffic-level-card${state.selectedLevelId === level.id ? ' is-selected' : ''}" data-level-id="${level.id}" ${state.selectedAgeId ? '' : 'disabled'}>
        <span>LV${level.index}</span>
        <h2>${level.label}</h2>
        <p>${level.desc}</p>
      </button>
    `).join('');
  }

  function updateRehabMenuState() {
    const age = getAge(state.selectedAgeId);
    const level = getLevel(state.selectedLevelId);
    if (els.stageView) {
      els.stageView.querySelectorAll('[data-age]').forEach((button) => {
        button.classList.toggle('is-selected', button.getAttribute('data-age') === state.selectedAgeId);
      });
    }
    if (els.levelGrid) {
      els.levelGrid.querySelectorAll('[data-level-id]').forEach((button) => {
        const selected = button.getAttribute('data-level-id') === state.selectedLevelId;
        button.classList.toggle('is-selected', selected);
        button.disabled = !age;
      });
    }
    if (els.startButton) {
      els.startButton.disabled = !(age && level);
      els.startButton.textContent = age && level ? `${age.label} · ${level.label} 시작` : '연령과 레벨을 선택해 주세요';
    }
  }

  function makeSequence(stage, palette) {
    const ids = palette.slice();
    return shuffle(ids).slice(0, Math.min(stage.sequenceLength, ids.length));
  }

  function answerForRound(round) {
    return round.sequence.slice();
  }

  function promptForRound() {
    return '보인 순서대로 누르세요';
  }

  function makeRounds(stage) {
    return Array.from({ length: stage.rounds }, (_item, index) => {
      const palette = shuffle(COLORS.map((color) => color.id)).slice(0, stage.colorCount);
      const sequence = makeSequence(stage, palette);
      return {
        id: `${stage.id}-${index + 1}`,
        index,
        task: 'forward',
        sequence,
        palette
      };
    });
  }

  function clearTimers() {
    window.clearTimeout(state.observeTimer);
    window.clearTimeout(state.advanceTimer);
    state.observeTimer = 0;
    state.advanceTimer = 0;
  }

  function setInputEnabled(enabled) {
    els.colorPad.querySelectorAll('button').forEach((button) => {
      button.disabled = !enabled || button.classList.contains('is-unavailable');
    });
    els.replayButton.disabled = state.phase !== 'input';
  }

  function renderColorPad() {
    els.colorPad.innerHTML = COLORS.map((color) => `
      <button type="button" class="orbit-color-btn"
        data-color-id="${escapeHtml(color.id)}"
        data-label="${escapeHtml(color.label)}"
        data-button="${escapeHtml(color.button)}"
        style="--color:${escapeHtml(color.hex)}; --button-text:${escapeHtml(color.text)}"
        aria-label="${escapeHtml(color.label)}"></button>
    `).join('');
  }

  function renderSlots(round) {
    const answerLength = answerForRound(round).length;
    els.targetSlots.innerHTML = Array.from({ length: answerLength }, (_item, index) => {
      const colorId = state.input[index];
      const color = colorId ? colorById(colorId) : null;
      return `
        <span class="orbit-slot${color ? ' is-filled' : ''}" style="${color ? `--slot-color:${escapeHtml(color.hex)}` : ''}">
          ${color ? escapeHtml(color.label) : index + 1}
        </span>
      `;
    }).join('');
  }

  function renderOrbitDots(round) {
    const sizes = [40, 32, 25, 20, 16, 13];
    els.orbitArena.classList.remove('is-orbiting', 'is-input');
    els.orbitArena.innerHTML = round.sequence.map((colorId, index) => {
      const color = colorById(colorId);
      const size = sizes[index] || 15;
      return `
        <div class="orbit-dot"
          data-color-id="${escapeHtml(color.id)}"
          style="--dot-color:${escapeHtml(color.hex)}; --dot-size:${size}px; --orbit-duration:${state.stage.orbitMs}ms; --orbit-delay:${Math.round(DOT_STAGGER_MS * index)}ms; --dot-layer:${100 - index}"
          aria-label="${escapeHtml(color.label)}"></div>
      `;
    }).join('');
  }

  function showRound() {
    const round = state.rounds[state.roundIndex];
    if (!round) {
      renderResult();
      return;
    }
    clearTimers();
    state.phase = 'observe';
    state.input = [];
    els.taskKicker.textContent = `${state.stage.shortRule} · ${state.stage.colorCount}색`;
    els.taskTitle.textContent = promptForRound(round);
    els.roundChip.textContent = `${state.roundIndex + 1} / ${state.rounds.length}`;
    els.phaseChip.textContent = '보기';
    els.feedbackText.textContent = '';
    els.feedbackText.className = 'orbit-feedback';
    els.nextButton.hidden = true;
    renderColorPad();
    renderSlots(round);
    renderOrbitDots(round);
    startObserve(round);
  }

  function startObserve(round, isReplay) {
    clearTimers();
    state.phase = 'observe';
    els.phaseChip.textContent = isReplay ? '다시 보기' : '보기';
    els.feedbackText.textContent = '';
    els.nextButton.hidden = true;
    setInputEnabled(false);
    els.orbitArena.classList.remove('is-orbiting', 'is-input');
    void els.orbitArena.offsetWidth;
    els.orbitArena.classList.add('is-orbiting');
    state.phase = 'input';
    state.responseStartedAt = Date.now();
    els.phaseChip.textContent = isReplay ? '입력 가능' : '보기·입력';
    els.feedbackText.textContent = '색이 도는 동안에도 입력할 수 있어요';
    setInputEnabled(true);
    const observeMs = state.stage.orbitMs + (Math.max(0, round.sequence.length - 1) * DOT_STAGGER_MS) + 520;
    state.observeTimer = window.setTimeout(() => {
      if (state.phase !== 'input') return;
      els.phaseChip.textContent = '입력';
      els.orbitArena.classList.remove('is-orbiting');
      els.orbitArena.classList.add('is-input');
      els.feedbackText.textContent = state.input.length ? '이어 눌러주세요' : '색을 선택하세요';
      setInputEnabled(true);
    }, observeMs);
  }

  function arraysEqual(left, right) {
    if (left.length !== right.length) return false;
    return left.every((item, index) => item === right[index]);
  }

  function answerText(answer) {
    return answer.map(labelFor).join(' → ');
  }

  function initAudio() {
    state.audio = {
      correct: new Audio('../sound/correct.mp3'),
      wrong: new Audio('../sound/error.mp3')
    };
    Object.values(state.audio).forEach((audio) => {
      audio.preload = 'auto';
      audio.volume = 0.55;
    });
  }

  function playFeedbackSound(kind) {
    const audio = state.audio[kind];
    if (!audio) return;
    try {
      Object.values(state.audio).forEach((item) => {
        item.pause();
        item.currentTime = 0;
      });
      audio.play().catch(() => {});
    } catch (_error) {}
  }

  function triggerFeedbackEffect(kind) {
    const effectClass = kind === 'correct' ? 'is-correct-effect' : 'is-wrong-effect';
    const oppositeClass = kind === 'correct' ? 'is-wrong-effect' : 'is-correct-effect';
    const target = els.gameView;
    target.classList.remove(effectClass, oppositeClass);
    void target.offsetWidth;
    target.classList.add(effectClass);
    window.setTimeout(() => target.classList.remove(effectClass), 720);
  }

  function finishRound(isCorrect) {
    const round = state.rounds[state.roundIndex];
    const answer = answerForRound(round);
    const responseMs = Date.now() - state.responseStartedAt;
    state.phase = 'feedback';
    els.phaseChip.textContent = isCorrect ? '정답' : '확인';
    setInputEnabled(false);
    if (isCorrect) {
      state.metrics.correct += 1;
      state.metrics.responseTimes.push(responseMs);
      els.feedbackText.textContent = '';
      els.feedbackText.className = 'orbit-feedback is-correct';
      playFeedbackSound('correct');
      if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
      triggerFeedbackEffect('correct');
    } else {
      state.metrics.wrong += 1;
      els.feedbackText.textContent = `정답: ${answerText(answer)}`;
      els.feedbackText.className = 'orbit-feedback is-wrong';
      playFeedbackSound('wrong');
      if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('wrong', { sound: false });
      triggerFeedbackEffect('wrong');
    }
    state.metrics.roundSummaries.push({
      round: state.roundIndex + 1,
      task: round.task,
      sequence: round.sequence.map(labelFor),
      expected: answer.map(labelFor),
      input: state.input.map(labelFor),
      correct: isCorrect,
      responseMs
    });
    els.nextButton.hidden = false;
    state.advanceTimer = window.setTimeout(nextRound, isCorrect ? 780 : 1400);
  }

  function handleColorClick(colorId) {
    if (state.phase !== 'input') return;
    const round = state.rounds[state.roundIndex];
    const answer = answerForRound(round);
    if (state.input.length >= answer.length) return;
    state.input.push(colorId);
    renderSlots(round);
    if (state.input.length === answer.length) {
      finishRound(arraysEqual(state.input, answer));
    }
  }

  function colorForJoystickButton(buttonIndex) {
    return COLORS.find((color) => color.button === `B${buttonIndex}`) || null;
  }

  function setJoystickConnected(source) {
    if (state.joystickConnected) return;
    state.joystickConnected = true;
    const label = source === 'keyboard' ? '키보드 입력 연결됨' : '조이스틱 연결됨';
    [els.joystickStatus, els.gameJoystickStatus].forEach((status) => {
      if (!status) return;
      status.classList.add('is-connected');
      const text = status.querySelector('strong');
      if (text) text.textContent = label;
    });
  }

  function handleJoystickButton(buttonIndex, source) {
    setJoystickConnected(source);
    const color = colorForJoystickButton(buttonIndex);
    if (!color || state.phase !== 'input' || !state.stage) return;
    handleColorClick(color.id);
  }

  function pollGamepads() {
    const pads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (!pad) continue;
      const previous = state.gamepadButtons.get(pad.index) || [];
      for (let index = 0; index <= 7; index += 1) {
        const pressed = !!pad.buttons[index]?.pressed;
        if (pressed && !previous[index]) handleJoystickButton(index, 'gamepad');
        previous[index] = pressed;
      }
      state.gamepadButtons.set(pad.index, previous);
    }
    window.requestAnimationFrame(pollGamepads);
  }

  function nextRound() {
    clearTimers();
    state.roundIndex += 1;
    showRound();
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || buildStageForSelection(state.selectedAgeId, state.selectedLevelId) || STAGES[0];
    clearTimers();
    state.stage = stage;
    state.rounds = makeRounds(stage);
    state.roundIndex = 0;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    state.metrics = {
      correct: 0,
      wrong: 0,
      replays: 0,
      responseTimes: [],
      roundSummaries: []
    };
    els.stageLabel.textContent = stage.rehabLevel ? `${stage.rehabAge.label} · ${stage.rehabLevel.label}` : `${String(STAGES.indexOf(stage) + 1).padStart(2, '0')} · ${stage.title}`;
    setScreen('game');
    showRound();
  }

  function buildOpinion(accuracy, avgResponseMs) {
    if (accuracy >= 90) return `색 순서와 규칙을 안정적으로 유지했어요. 평균 반응은 ${formatMs(avgResponseMs)}입니다.`;
    if (accuracy >= 70) return `순서 기억 중 일부 오류가 있었어요. 같은 스테이지를 한 번 더 반복하면 안정화에 도움이 됩니다.`;
    return '현재 단계의 색상 수나 규칙 부하가 높게 작용했습니다. 이전 스테이지에서 성공 경험을 먼저 확보하세요.';
  }

  function getAllResponseMs() {
    return state.metrics.roundSummaries
      .map((round) => Number(round.responseMs || 0))
      .filter((value) => value > 0);
  }

  function getReportAxisAverage(report, ids) {
    const axes = report && Array.isArray(report.axes) ? report.axes : [];
    const values = ids
      .map((id) => axes.find((axis) => axis.id === id))
      .filter(Boolean)
      .map((axis) => Number(axis.score || 0))
      .filter((value) => value > 0);
    return values.length ? round(average(values)) : 0;
  }

  function buildReportInput(accuracy, avgResponseMs, total) {
    const elapsedMs = Date.now() - (state.startedAtMs || Date.now());
    const stageIndex = Math.max(1, STAGES.indexOf(state.stage) + 1);
    const allResponseMs = getAllResponseMs();
    const avgQuestionMs = allResponseMs.length ? round(average(allResponseMs)) : avgResponseMs;
    return {
      reportType: 'rehablab-orbit-color-memory',
      reportProfile: 'memory-color-binding',
      reportProfileLabel: '색 궤도 순차 기억',
      normProfile: 'general',
      normProfileLabel: '인지재활 회기 관찰 기준',
      stageTitle: state.stage.title,
      categoryTitle: LAB_TITLE,
      totalItems: total,
      totalQuestions: total,
      correctCount: state.metrics.correct,
      wrongCount: state.metrics.wrong,
      completionCount: total,
      perfectCount: state.metrics.correct,
      accuracyRate: accuracy,
      completionRate: 100,
      firstTryRate: accuracy,
      avgQuestionMs,
      elapsedMs,
      benchmarkMs: Math.max(2400, state.stage.orbitMs / Math.max(1, state.stage.colorCount)),
      difficultyIndex: stageIndex / STAGES.length,
      ageGroupLabel: state.stage.rehabAge ? state.stage.rehabAge.label : '',
      ageGroupRange: state.stage.rehabAge ? state.stage.rehabAge.range : '',
      levelLabel: state.stage.rehabLevel ? state.stage.rehabLevel.label : '',
      levelDescription: state.stage.rehabLevel ? state.stage.rehabLevel.desc : '',
      replayCount: state.metrics.replays,
      visualReplayCount: state.metrics.replays,
      questionLogs: state.metrics.roundSummaries.map((round) => ({
        durationMs: round.responseMs,
        correct: round.correct,
        outcome: round.correct ? 'correct' : 'wrong',
        sequenceLength: round.expected.length
      })),
      colorCount: state.stage.colorCount,
      sequenceLength: state.stage.sequenceLength,
      orbitMs: state.stage.orbitMs,
      accentColor: state.stage.accent
    };
  }

  function buildClinicalReport(reportInput, accuracy, avgResponseMs) {
    const engineReport = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function'
      ? window.PlaylabReportEngine.buildReport(reportInput)
      : null;
    const total = reportInput.totalQuestions || 1;
    const errorLoad = state.metrics.wrong / total;
    const memoryScore = clamp(round((accuracy * 0.68) + (state.stage.colorCount / 6) * 18 - (state.metrics.replays * 3)), 20, 100);
    const sequencingScore = clamp(round((accuracy * 0.72) + (state.stage.sequenceLength / 6) * 16), 20, 100);
    const attentionScore = clamp(round(100 - (errorLoad * 34) - (state.metrics.replays * 5) + (accuracy * 0.24)), 20, 100);
    const processingScore = clamp(round(100 - Math.max(0, avgResponseMs - reportInput.benchmarkMs) / 90), 20, 100);
    const selfMonitoringScore = clamp(round(100 - (state.metrics.wrong * 6) - (state.metrics.replays * 4)), 20, 100);
    const accuracyScore = clamp(accuracy, 0, 100);
    const integratedScore = clamp(round((memoryScore * 0.28) + (sequencingScore * 0.24) + (attentionScore * 0.18) + (accuracyScore * 0.18) + (processingScore * 0.12)), 0, 100);
    const axes = [
      { id: 'memory', label: '순차 작업기억', score: memoryScore },
      { id: 'sequencing', label: '순서 재현', score: sequencingScore },
      { id: 'attention', label: '주의 지속', score: attentionScore },
      { id: 'processingSpeed', label: '반응 효율', score: processingScore },
      { id: 'selfMonitoring', label: '오류 점검', score: selfMonitoringScore },
      { id: 'accuracy', label: '정확도', score: accuracyScore }
    ];
    const briefOpinion = buildOpinion(accuracy, avgResponseMs);
    const longOpinion = [
      `${state.stage.colorCount}색, ${state.stage.sequenceLength}개 순서 조건에서 시각 자극을 유지하고 동일 순서로 재현하는 과정을 관찰했습니다.`,
      `정확도 ${accuracy}%, 평균 반응 ${formatMs(avgResponseMs)}로 기록되어 순차 작업기억, 주의 지속, 색-버튼 매핑 안정성을 함께 해석합니다.`,
      state.metrics.wrong > 0
        ? '오류 문항에서는 색 순서 저장 또는 반응 직전 자기점검 단계에서 부하가 증가했을 가능성이 있습니다.'
        : '오류 없이 순서를 유지하여 즉각 재현과 선택 반응의 일관성이 긍정적으로 확인됩니다.',
      '본 결과는 회기 내 인지재활 훈련 자료이며 의학적 진단을 대체하지 않고, 피로도와 지시 이해 수준을 함께 고려해야 합니다.'
    ].join(' ');
    return Object.assign({}, engineReport || {}, {
      integratedScore,
      accuracyRate: accuracy,
      firstTryRate: accuracy,
      completionRate: 100,
      axes,
      sortedAxes: axes.slice().sort((a, b) => a.score - b.score),
      headline: integratedScore >= 85
        ? '색 순서 유지와 재현이 안정적으로 관찰됩니다.'
        : '색 순서 유지 시간을 늘리기보다 성공 가능한 색상 수에서 반복 안정화가 필요합니다.',
      briefOpinion,
      longOpinion,
      highlights: [
        { label: '통합 점수', value: `${integratedScore}점` },
        { label: '정답', value: `${state.metrics.correct}/${total}` },
        { label: '평균 반응', value: formatMs(avgResponseMs) },
        { label: '색상 수', value: `${state.stage.colorCount}색` },
        { label: '순서 길이', value: `${state.stage.sequenceLength}개` },
        { label: '다시 보기', value: `${state.metrics.replays}회` }
      ],
      recommendations: [
        {
          title: '색 이름 말하기',
          desc: '도트가 움직일 때 색 이름을 짧게 말해 시각 단서를 언어 단서와 함께 묶어 주세요.'
        },
        {
          title: '성공률 기준 단계 조절',
          desc: '정확도 80% 이상이 2회기 연속 유지될 때 색상 수나 문항 수를 한 단계 올리고, 오류가 늘면 즉시 낮춥니다.'
        },
        {
          title: '반응 전 1초 점검',
          desc: '입력 전 머릿속 순서를 한 번 되짚고 첫 색부터 차례대로 누르는 자기점검 루틴을 고정합니다.'
        }
      ],
      researchNotes: [
        '순차 작업기억 훈련은 짧은 시각 정보를 유지하고 같은 순서로 재현하는 과정을 반복해 주의 지속과 반응 조직을 함께 관찰합니다.',
        '색-버튼 매핑 과제는 조이스틱 반응과 결합될 때 시각-운동 협응 및 반응 선택 안정성을 회기 지표로 확인할 수 있습니다.'
      ]
    });
  }

  function recommendationLines(report) {
    return (Array.isArray(report && report.recommendations) ? report.recommendations : [])
      .map((item) => {
        const title = String(item && item.title || '').trim();
        const desc = String(item && item.desc || '').trim();
        return title && desc ? `${title}: ${desc}` : (title || desc);
      })
      .filter(Boolean);
  }

  function buildReportPayload(reportInput, report, accuracy, avgResponseMs) {
    const score = Number(report.integratedScore || accuracy || 0) || 0;
    return {
      labKind: REPORT_SCOPE,
      reportScope: REPORT_SCOPE,
      curriculumKey: `${REPORT_SCOPE === 'rehab' ? 'rehablab' : 'playlab'}-orbit-color-memory`,
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      labTitle: LAB_TITLE,
      totalQuestions: state.rounds.length,
      correctCount: state.metrics.correct,
      wrongCount: state.metrics.wrong,
      score,
      accuracyScore: accuracy,
      durationSeconds: (Date.now() - (state.startedAtMs || Date.now())) / 1000,
      startedAtMs: state.startedAtMs || Date.now(),
      reportType: reportInput.reportType,
      reportInput,
      briefOpinion: report.briefOpinion,
      summary: `${state.stage.colorCount}색 궤도 자극을 본 뒤 ${state.stage.shortRule} 규칙으로 반응했습니다.`,
      overview: report.longOpinion || '시각 순서 기억, 선택적 주의, 규칙 유지, 반응 선택을 함께 관찰하는 과제입니다.',
      recommendations: recommendationLines(report),
      cognitiveScore: getReportAxisAverage(report, ['memory', 'sequencing', 'attention']) || score,
      reactionScore: getReportAxisAverage(report, ['processingSpeed', 'selfMonitoring', 'accuracy']) || score,
      focusKey: 'orbit-color-memory',
      focusLabel: state.stage.focus,
      details: {
        report_headline: String(report.headline || '').trim(),
        report_integrated_score: score,
        report_axes: Array.isArray(report.axes) ? report.axes.map((axis) => ({
          id: String(axis.id || '').trim(),
          label: String(axis.label || '').trim(),
          score: Number(axis.score || 0) || 0
        })) : [],
        report_domain: '색 궤도 기반 순차 작업기억 및 시각-운동 반응 선택',
        color_count: state.stage.colorCount,
        sequence_length: state.stage.sequenceLength,
        orbit_ms: state.stage.orbitMs,
        task_rule: state.stage.task,
        replay_count: state.metrics.replays,
        average_response_ms: Math.round(avgResponseMs),
        report_cognitive_score: getReportAxisAverage(report, ['memory', 'sequencing', 'attention']) || score,
        report_reaction_score: getReportAxisAverage(report, ['processingSpeed', 'selfMonitoring', 'accuracy']) || score,
        rounds: state.metrics.roundSummaries
      },
      metadata: {
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_integrated_score: score,
        report_cognitive_score: getReportAxisAverage(report, ['memory', 'sequencing', 'attention']) || score,
        report_reaction_score: getReportAxisAverage(report, ['processingSpeed', 'selfMonitoring', 'accuracy']) || score
      }
    };
  }

  function readLaunchContext() {
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.readLaunchContext === 'function') {
      return window.HahaLabLearningHarness.readLaunchContext();
    }
    return null;
  }

  async function getSupabaseClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    if (!window.__orbitColorMemorySupabaseClient) {
      window.__orbitColorMemorySupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return window.__orbitColorMemorySupabaseClient;
  }

  async function saveSupabaseReport(payload, reportInput, report) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = await getSupabaseClient();
    if (!client) return { skipped: true };
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(state.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(payload.durationSeconds || 0) / 60));
    const details = Object.assign({
      report_scope: REPORT_SCOPE,
      lab_scope: REPORT_SCOPE,
      lab_label: LAB_LABEL,
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
      report_headline: String(report.headline || '').trim(),
      report_brief_opinion: payload.briefOpinion,
      report_overview: payload.overview,
      report_recommendations: payload.recommendations,
      report_axes: payload.details.report_axes,
      report_cognitive_score: payload.cognitiveScore,
      report_reaction_score: payload.reactionScore,
      report_focus_key: payload.focusKey,
      report_focus_label: payload.focusLabel,
      source_page: String(window.location.pathname || '').split('/').pop() || 'rehablab-orbit-color-memory.html'
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
      metadata: Object.assign({
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_integrated_score: details.report_integrated_score,
        report_cognitive_score: details.report_cognitive_score,
        report_reaction_score: details.report_reaction_score,
        duration_minutes: durationMinutes,
        duration: `${durationMinutes} minutes`
      }, payload.metadata || {}),
      memo: payload.stageTitle || LAB_TITLE
    };
    try {
      const result = await client.from('histories').insert(row);
      if (result && result.error) throw result.error;
      return result;
    } catch (error) {
      console.error('[playlab-orbit-color-memory] history save failed:', error);
      return { error };
    }
  }

  function saveLearningReport(reportInput, report, accuracy, avgResponseMs) {
    if (!state.stage || state.savedRunId) return;
    state.savedRunId = `saving-${Date.now()}`;
    const payload = buildReportPayload(reportInput, report, accuracy, avgResponseMs);
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === 'function') {
      const record = window.HahaLabLearningHarness.recordSession(payload);
      state.savedRunId = record && record.id ? record.id : state.savedRunId;
    }
    if (REPORT_SCOPE === 'rehab') {
      saveSupabaseReport(payload, reportInput, report).then((result) => {
        state.reportSaveState = result && result.error ? 'error' : result && result.skipped ? 'skipped' : 'saved';
      });
    }
  }

  function renderResult() {
    clearTimers();
    const total = state.rounds.length || 1;
    const accuracy = Math.round((state.metrics.correct / total) * 100);
    const avgResponseMs = Math.round(average(getAllResponseMs()));
    const opinion = buildOpinion(accuracy, avgResponseMs);
    const reportInput = buildReportInput(accuracy, avgResponseMs, total);
    const report = buildClinicalReport(reportInput, accuracy, avgResponseMs);
    saveLearningReport(reportInput, report, accuracy, avgResponseMs);
    els.resultTitle.textContent = `${state.stage.title} 완료`;
    els.resultSummary.textContent = `${total}문항 중 ${state.metrics.correct}문항을 맞혔어요.`;
    els.resultStats.innerHTML = `
      <div class="orbit-stat"><span>정확도</span><strong>${accuracy}%</strong></div>
      <div class="orbit-stat"><span>정답</span><strong>${state.metrics.correct}</strong></div>
      <div class="orbit-stat"><span>오답</span><strong>${state.metrics.wrong}</strong></div>
      <div class="orbit-stat"><span>평균 반응</span><strong>${formatMs(avgResponseMs)}</strong></div>
    `;
    els.reportOpinion.classList.toggle('is-professional', REPORT_SCOPE === 'rehab');
    if (REPORT_SCOPE === 'rehab' && report && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === 'function') {
      els.reportOpinion.innerHTML = window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' });
    } else {
      els.reportOpinion.textContent = opinion;
    }
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

  function hideIntroHelp() {
    try {
      window.localStorage.setItem(REHAB_HELP_STORAGE_KEY, '1');
    } catch (_error) {}
    closeHelp();
  }

  function shouldShowIntroHelp() {
    if (REPORT_SCOPE !== 'rehab') return false;
    try {
      return window.localStorage.getItem(REHAB_HELP_STORAGE_KEY) !== '1';
    } catch (_error) {
      return true;
    }
  }

  function bindEvents() {
    if (els.stageGrid) {
      els.stageGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-stage-id]');
        if (button) startStage(button.dataset.stageId);
      });
    }
    if (REPORT_SCOPE === 'rehab' && els.stageView) {
      els.stageView.querySelectorAll('[data-age]').forEach((button) => {
        button.addEventListener('click', () => {
          state.selectedAgeId = String(button.getAttribute('data-age') || '').trim();
          state.selectedLevelId = '';
          renderRehabLevels();
          updateRehabMenuState();
        });
      });
    }
    if (REPORT_SCOPE === 'rehab' && els.levelGrid) {
      els.levelGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-level-id]');
        if (!button || !state.selectedAgeId) return;
        state.selectedLevelId = String(button.getAttribute('data-level-id') || '').trim();
        updateRehabMenuState();
      });
    }
    if (REPORT_SCOPE === 'rehab' && els.startButton) {
      els.startButton.addEventListener('click', () => {
        const stage = buildStageForSelection(state.selectedAgeId, state.selectedLevelId);
        if (stage) startStage(stage.id);
      });
    }
    els.colorPad.addEventListener('click', (event) => {
      const button = event.target.closest('[data-color-id]');
      if (button) handleColorClick(button.dataset.colorId);
    });
    els.replayButton.addEventListener('click', () => {
      const round = state.rounds[state.roundIndex];
      if (!round || state.phase === 'observe') return;
      state.metrics.replays += 1;
      state.input = [];
      renderSlots(round);
      startObserve(round, true);
    });
    els.nextButton.addEventListener('click', nextRound);
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || STAGES[0].id));
    els.otherStageButton.addEventListener('click', () => {
      clearTimers();
      setScreen('stage');
    });
    els.stageButton.addEventListener('click', () => {
      clearTimers();
      setScreen('stage');
    });
    els.helpButton.addEventListener('click', openHelp);
    els.helpCloseButton.addEventListener('click', closeHelp);
    if (els.helpDontShowButton) els.helpDontShowButton.addEventListener('click', hideIntroHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHelp();
      if (/^[0-7]$/.test(event.key)) handleJoystickButton(Number(event.key), 'keyboard');
    });
  }

  function cacheElements() {
    [
      'stageView', 'gameView', 'resultView', 'stageGrid', 'joystickStatus', 'gameJoystickStatus', 'stageLabel', 'stageButton',
      'helpButton', 'helpModal', 'helpCloseButton', 'taskKicker', 'taskTitle',
      'roundChip', 'phaseChip', 'orbitArena', 'targetSlots', 'colorPad',
      'feedbackText', 'replayButton', 'nextButton', 'resultTitle', 'resultSummary',
      'resultStats', 'reportOpinion', 'retryButton', 'otherStageButton', 'helpDontShowButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
    els.levelGrid = $('levelGrid');
    els.startButton = $('startButton');
  }

  function init() {
    cacheElements();
    initAudio();
    renderStages();
    bindEvents();
    setScreen('stage');
    if (REPORT_SCOPE === 'rehab') updateRehabMenuState();
    window.requestAnimationFrame(pollGamepads);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
