(function () {
  'use strict';

  const LAB_TITLE = '색깔 순서 기억하기';
  const REPORT_SCOPE = 'rehab';
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const LAB_LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
  const COLORS = [
    { id: 'red', label: '빨강', hex: '#ef4444' },
    { id: 'yellow', label: '노랑', hex: '#facc15' },
    { id: 'green', label: '초록', hex: '#22c55e' },
    { id: 'blue', label: '파랑', hex: '#3b82f6' }
  ];
  const REHAB_AGE_GROUPS = [
    { id: 'preschool', label: '유아', range: '4-6세', normProfile: 'preschool', sequenceBase: 2, sequenceMax: 3, previewMs: 960, gapMs: 520, benchmarkMs: 2400, clinical: '짧은 색 순서를 눈으로 보고 바로 재현하는 기초 시각 작업기억과 기다리기 반응을 안정화합니다.' },
    { id: 'elementary', label: '초등', range: '7-12세', normProfile: 'lower-elementary', sequenceBase: 2, sequenceMax: 4, previewMs: 860, gapMs: 460, benchmarkMs: 1900, clinical: '색 순서를 유지하며 첫 입력 전 자기 점검을 적용하는 표준 작업기억 훈련입니다.' },
    { id: 'teen', label: '청소년', range: '13-18세', normProfile: 'upper-elementary', sequenceBase: 3, sequenceMax: 5, previewMs: 760, gapMs: 400, benchmarkMs: 1500, clinical: '간섭이 있는 조건에서도 순서를 유지하는 상위 작업기억과 주의 전환을 관찰합니다.' },
    { id: 'adult', label: '성인', range: '19-64세', normProfile: 'adult', sequenceBase: 3, sequenceMax: 5, previewMs: 720, gapMs: 360, benchmarkMs: 1350, clinical: '정확도와 반응시간을 함께 보며 고부하 순차 작업기억과 실행 기능을 점검합니다.' },
    { id: 'senior', label: '고령자', range: '65세+', normProfile: 'senior', sequenceBase: 2, sequenceMax: 4, previewMs: 980, gapMs: 540, benchmarkMs: 2500, clinical: '부담을 낮춘 제시 속도로 성공 경험을 우선 확보하며 인지재활용 순차 기억을 관찰합니다.' }
  ];
  const REHAB_LEVELS = [
    { id: 'lv1', index: 1, label: '반응 적응', desc: '단일 또는 짧은 순서를 보고 기다린 뒤 따라 눌러요.', addedLength: 0, rounds: 6, previewOffset: 80, allowRepeat: false, burden: '낮음' },
    { id: 'lv2', index: 2, label: '즉시 재현', desc: '2-3항목 순서를 바로 재현하는 기초 단계예요.', addedLength: 0, rounds: 7, previewOffset: 40, allowRepeat: false, burden: '낮음-중간' },
    { id: 'lv3', index: 3, label: '유지 확장', desc: '순서 길이를 늘리고 정확한 유지 여부를 봐요.', addedLength: 1, rounds: 8, previewOffset: 0, allowRepeat: false, burden: '중간' },
    { id: 'lv4', index: 4, label: '간섭 억제', desc: '비슷한 색 반복 간섭을 줄이며 순서를 유지해요.', addedLength: 1, rounds: 8, previewOffset: -40, allowRepeat: true, burden: '중간-상' },
    { id: 'lv5', index: 5, label: '고부하 유지', desc: '긴 순서를 여러 라운드에 걸쳐 안정적으로 수행해요.', addedLength: 2, rounds: 9, previewOffset: -70, allowRepeat: true, burden: '상' },
    { id: 'lv6', index: 6, label: '임상 심화', desc: '고부하 조건에서 반응 속도와 일관성을 함께 관찰해요.', addedLength: 2, rounds: 10, previewOffset: -100, allowRepeat: true, burden: '고부하' }
  ];

  const state = {
    stage: null,
    selectedAgeId: '',
    selectedLevelId: '',
    rounds: [],
    roundIndex: 0,
    input: [],
    phase: 'idle',
    startedAtMs: 0,
    responseStartedAt: 0,
    advanceTimerId: 0,
    elapsedTimerId: 0,
    previewTimers: [],
    savedRunId: '',
    supabaseClientPromise: null,
    reportSaveState: '',
    metrics: {
      correct: 0,
      commission: 0,
      anticipatory: 0,
      responseTimes: [],
      roundSummaries: []
    },
    effectAudio: null
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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

  function standardDeviation(values) {
    if (values.length < 2) return 0;
    const mean = average(values);
    const variance = average(values.map((value) => (value - mean) ** 2));
    return Math.sqrt(variance);
  }

  function formatSeconds(ms) {
    return `${(Math.max(0, Number(ms) || 0) / 1000).toFixed(1)}초`;
  }

  function getSelectedAge() {
    return REHAB_AGE_GROUPS.find((item) => item.id === state.selectedAgeId) || null;
  }

  function getSelectedLevel() {
    return REHAB_LEVELS.find((item) => item.id === state.selectedLevelId) || null;
  }

  function buildDifficultyReport(age, level, sequenceLength) {
    const spanText = `${sequenceLength}색`;
    return {
      spanText,
      burden: level.burden,
      ageBasis: `${age.range} 기준에서 ${spanText} 순서를 짧게 유지한 뒤 동일한 순서로 재현합니다.`,
      clinicalBasis: age.clinical,
      trainingGoal: level.desc,
      safety: sequenceLength >= 5
        ? '오답이 누적되면 직전 단계로 낮추고, 첫 입력 전 1회 되뇌기 전략을 적용합니다.'
        : '연속 오류가 2회 이상이면 같은 단계에서 속도보다 정확도를 먼저 회복합니다.'
    };
  }

  function buildStageFromSelection() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    if (!age || !level) return null;
    const sequenceLength = clamp(age.sequenceBase + level.addedLength, 1, age.sequenceMax);
    const previewMs = clamp(age.previewMs + level.previewOffset, 420, 1200);
    const gapMs = clamp(age.gapMs + Math.round(level.previewOffset / 3), 260, 700);
    return {
      id: `${age.id}-${level.id}`,
      age,
      load: {
        value: level.index,
        label: level.label,
        focus: level.desc
      },
      sequenceLength,
      totalRounds: level.rounds,
      previewMs,
      gapMs,
      allowRepeat: level.allowRepeat,
      warmupLength: Math.max(1, sequenceLength - 1),
      difficultyReport: buildDifficultyReport(age, level, sequenceLength)
    };
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
      if (launchKey && launchKey.indexOf(LAB_LAUNCH_CONTEXT_STORAGE_PREFIX) === 0 && window.sessionStorage) {
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

  function setScreen(name) {
    ['stageView', 'gameView', 'resultView'].forEach((id) => {
      if (els[id]) els[id].classList.toggle('is-active', id === `${name}View`);
    });
    const inStage = name === 'stage';
    if (els.stageSelectButton) els.stageSelectButton.classList.toggle('shell-hidden', inStage);
    if (els.shellStageLabel) els.shellStageLabel.classList.toggle('shell-hidden', inStage);
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'result', {
        title: () => `${LAB_TITLE}-${state.stage ? `${state.stage.age.label} ${state.stage.load.label}` : '리포트'}`
      });
    }
  }

  function renderLevelGrid() {
    const age = getSelectedAge();
    els.levelGrid.innerHTML = REHAB_LEVELS.map((level) => {
      const selected = state.selectedLevelId === level.id;
      return `
        <button type="button" class="traffic-level-card${selected ? ' is-selected' : ''}" data-level-id="${level.id}" aria-pressed="${selected ? 'true' : 'false'}">
          <span>LV${level.index}</span>
          <h2>${level.label}</h2>
          <p>${level.desc}</p>
        </button>
      `;
    }).join('');
  }

  function updateMenuState() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    document.querySelectorAll('[data-age]').forEach((button) => {
      button.classList.toggle('is-selected', button.getAttribute('data-age') === state.selectedAgeId);
    });
    els.startButton.disabled = !age || !level;
    els.startButton.textContent = age && level
      ? `${age.label} · ${level.label} 시작`
      : level
        ? '연령을 선택해 주세요'
        : age
          ? '레벨을 선택해 주세요'
          : '연령과 레벨을 선택해 주세요';
  }

  function renderReadyStage() {
    const spanCount = state.stage ? Math.max(1, Number(state.stage.warmupLength || state.stage.sequenceLength || 1)) : 1;
    clearTimers();
    state.phase = 'idle';
    state.input = [];
    state.responseStartedAt = 0;
    els.roundChip.textContent = state.stage ? `라운드 1 / ${state.stage.totalRounds}` : '라운드 1';
    els.timerChip.textContent = '대기';
    els.gameTitle.textContent = '시작하면 색 순서가 제시돼요.';
    els.sequencePreview.innerHTML = Array.from({ length: spanCount }, (_, index) => (
      `<span class="colorseq-preview-chip" aria-label="${index + 1}번째 색상 자리"></span>`
    )).join('');
    setFeedback('');
    renderPad(true);
  }

  function makeSequence(length, seed, allowRepeat) {
    const sequence = [];
    const colorPool = shuffle(COLORS.map((color) => color.id));
    for (let index = 0; index < length; index += 1) {
      if (!allowRepeat && index < COLORS.length) {
        sequence.push(colorPool[index % colorPool.length]);
      } else {
        const color = COLORS[(seed + index + Math.floor(index / 2)) % COLORS.length];
        sequence.push(color.id);
      }
    }
    if (allowRepeat && length > 3 && seed % 3 === 0) sequence[length - 1] = sequence[0];
    return sequence;
  }

  function makeRounds(stage) {
    return Array.from({ length: stage.totalRounds }, (_, index) => {
      const length = index < 2 ? Math.min(stage.warmupLength, stage.sequenceLength) : stage.sequenceLength;
      return {
        id: `${stage.id}-round-${index + 1}`,
        index,
        sequence: makeSequence(length, index + stage.sequenceLength, stage.allowRepeat)
      };
    });
  }

  function clearTimers() {
    window.clearTimeout(state.advanceTimerId);
    window.clearInterval(state.elapsedTimerId);
    state.advanceTimerId = 0;
    state.elapsedTimerId = 0;
    state.previewTimers.forEach((timer) => window.clearTimeout(timer));
    state.previewTimers = [];
  }

  function updateElapsedChip() {
    if (!state.responseStartedAt) {
      els.timerChip.textContent = '0.0초';
      return;
    }
    els.timerChip.textContent = formatSeconds(Date.now() - state.responseStartedAt);
  }

  function playEffect(kind) {
    const path = kind === 'wrong' ? '../sound/error.mp3' : '../sound/correct.mp3';
    try {
      if (state.effectAudio) {
        state.effectAudio.pause();
        state.effectAudio.currentTime = 0;
      }
      const audio = new Audio(path);
      audio.volume = kind === 'wrong' ? 0.42 : 0.5;
      state.effectAudio = audio;
      audio.play().catch(() => {});
    } catch (_error) {}
  }

  function startStage() {
    state.stage = buildStageFromSelection();
    if (!state.stage) return;
    clearTimers();
    state.rounds = makeRounds(state.stage);
    state.roundIndex = 0;
    state.input = [];
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    state.reportSaveState = '';
    state.metrics = {
      correct: 0,
      commission: 0,
      anticipatory: 0,
      responseTimes: [],
      roundSummaries: []
    };
    els.shellStageLabel.textContent = `${state.stage.age.label} · ${state.stage.load.label}`;
    renderReadyStage();
    setScreen('game');
    renderRound();
  }

  function currentRound() {
    return state.rounds[state.roundIndex] || null;
  }

  function colorById(id) {
    return COLORS.find((color) => color.id === id) || COLORS[0];
  }

  function renderPad(disabled) {
    els.colorPad.innerHTML = COLORS.map((color) => `
      <button type="button" class="colorseq-color-btn" data-color-id="${escapeHtml(color.id)}" style="--button-color:${escapeHtml(color.hex)}" ${disabled ? 'disabled' : ''}>
        ${escapeHtml(color.label)}
      </button>
    `).join('');
  }

  function renderMemorySlots(activeIndex) {
    const round = currentRound();
    if (!round) return;
    const litIndex = typeof activeIndex === 'number' ? activeIndex : -1;
    els.sequencePreview.innerHTML = round.sequence.map((id, index) => {
      const isPreviewLit = state.phase === 'preview' && index === litIndex;
      const inputColorId = state.phase !== 'preview' ? state.input[index] : '';
      const shownColor = isPreviewLit ? colorById(id) : inputColorId ? colorById(inputColorId) : null;
      const style = shownColor ? ` style="--chip-color:${escapeHtml(shownColor.hex)}"` : '';
      const className = [
        'colorseq-preview-chip',
        isPreviewLit ? 'is-lit' : '',
        inputColorId ? 'is-filled' : ''
      ].filter(Boolean).join(' ');
      return `<span class="${className}"${style}></span>`;
    }).join('');
  }

  function setFeedback(text) {
    els.feedbackText.textContent = text || '';
  }

  function renderRound() {
    const round = currentRound();
    if (!round) {
      renderResult();
      return;
    }
    clearTimers();
    state.phase = 'preview';
    state.input = [];
    state.responseStartedAt = 0;
    els.roundChip.textContent = `라운드 ${state.roundIndex + 1} / ${state.rounds.length}`;
    els.timerChip.textContent = '제시 중';
    els.gameTitle.textContent = '색 순서를 기억하세요.';
    setFeedback('제시가 끝나면 같은 순서로 눌러요.');
    renderPad(true);
    renderMemorySlots(-1);

    const stepMs = Math.max(420, Number(state.stage.previewMs || 620));
    const gapMs = Math.max(260, Number(state.stage.gapMs || 360));
    round.sequence.forEach((_id, index) => {
      state.previewTimers.push(window.setTimeout(() => renderMemorySlots(index), 360 + index * stepMs));
      state.previewTimers.push(window.setTimeout(() => renderMemorySlots(-1), 360 + gapMs + index * stepMs));
    });
    state.previewTimers.push(window.setTimeout(startResponse, 520 + round.sequence.length * stepMs));
  }

  function startResponse() {
    state.phase = 'response';
    state.responseStartedAt = Date.now();
    updateElapsedChip();
    state.elapsedTimerId = window.setInterval(updateElapsedChip, 100);
    els.gameTitle.textContent = '같은 순서로 누르세요.';
    setFeedback('');
    renderPad(false);
    renderMemorySlots(-1);
  }

  function handleColorInput(colorId) {
    const round = currentRound();
    if (!round) return;
    if (state.phase === 'preview') {
      state.metrics.anticipatory += 1;
      setFeedback('제시가 끝난 뒤 눌러요.');
      return;
    }
    if (state.phase !== 'response') return;
    const expected = round.sequence[state.input.length];
    state.input.push(colorId);
    renderMemorySlots(-1);
    const button = els.colorPad.querySelector(`[data-color-id="${colorId}"]`);
    if (button) {
      button.classList.add('is-pressed');
      window.setTimeout(() => button.classList.remove('is-pressed'), 140);
    }
    if (colorId !== expected) {
      finishRound(false, 'commission');
      return;
    }
    if (state.input.length === round.sequence.length) {
      finishRound(true, 'correct');
    }
  }

  function finishRound(isCorrect, errorType) {
    if (state.phase === 'finished') return;
    clearTimers();
    state.phase = 'finished';
    renderPad(true);
    const rt = Math.max(0, Date.now() - state.responseStartedAt);
    state.metrics.responseTimes.push(rt);
    updateElapsedChip();
    renderMemorySlots(-1);
    if (isCorrect) {
      state.metrics.correct += 1;
      setFeedback('정확한 순서예요.');
      playEffect('correct');
    } else {
      state.metrics.commission += 1;
      setFeedback('순서가 달랐어요.');
      playEffect('wrong');
    }
    if (window.HahaFeedbackOverlay) {
      window.HahaFeedbackOverlay.showQuestionComplete(isCorrect ? 'correct' : 'wrong', { sound: false });
    }
    state.metrics.roundSummaries.push({
      round: state.roundIndex + 1,
      sequenceLength: currentRound().sequence.length,
      correct: isCorrect,
      errorType,
      responseTimeMs: rt,
      target: currentRound().sequence.join('-'),
      response: state.input.join('-')
    });
    state.advanceTimerId = window.setTimeout(() => {
      state.roundIndex += 1;
      renderRound();
    }, isCorrect ? 760 : 980);
  }

  function buildReport(metrics) {
    const totalRounds = Math.max(1, state.stage ? state.stage.totalRounds : metrics.roundSummaries.length || 1);
    const accuracy = Math.round((metrics.correct / totalRounds) * 100);
    const meanRt = Math.round(average(metrics.responseTimes));
    const iiv = Math.round(standardDeviation(metrics.responseTimes));
    const totalResponseMs = metrics.responseTimes.reduce((sum, value) => sum + value, 0);
    const efficiency = Math.max(0, Math.min(100, Math.round(100 - meanRt / 80 - iiv / 120)));
    const score = Math.max(0, Math.min(100, Math.round((accuracy * 0.7) + (efficiency * 0.3))));
    const anticipatoryRate = Math.round((metrics.anticipatory / totalRounds) * 100);
    const commissionRate = Math.round((metrics.commission / totalRounds) * 100);
    return { accuracy, meanRt, iiv, totalResponseMs, efficiency, score, anticipatoryRate, commissionRate };
  }

  function reportOpinion(report) {
    const stage = state.stage;
    const speedText = report.meanRt ? `평균 해결 시간은 ${formatSeconds(report.meanRt)}이며` : '해결 시간 산출이 제한적이며';
    return [
      {
        title: '과제 해석',
        text: `이 과제는 ${stage.difficultyReport.spanText} 색 자극의 순서를 짧게 유지한 뒤 같은 순서로 재현하는 시각 순차 작업기억 훈련입니다. ${stage.difficultyReport.ageBasis}`
      },
      {
        title: '핵심 수행',
        text: `${stage.age.label} ${stage.load.label}에서 정답률은 ${report.accuracy}%입니다. 난이도 부하는 ${stage.difficultyReport.burden}이며, ${speedText}, 시간 변동성은 ${formatSeconds(report.iiv)}로 산출되었습니다.`
      },
      {
        title: '오류 양상',
        text: `제시 중 예측 반응 ${report.anticipatoryRate}%, 순서 오류 ${report.commissionRate}%로 기록되었습니다. 첫 입력 전 짧게 되뇌기와 자기 확인 전략을 적용하면 간섭 오류를 줄이는 데 도움이 됩니다.`
      },
      {
        title: '다음 단계 제안',
        text: report.accuracy >= 80
          ? `현재 단계가 안정적이면 같은 연령군의 다음 레벨로 확장할 수 있습니다. ${stage.difficultyReport.safety}`
          : `현재 단계 반복이 우선이며, 속도보다 정확한 순서 재현을 먼저 회복하는 것이 적절합니다. ${stage.difficultyReport.safety}`
      }
    ];
  }

  function buildReportInput(report) {
    const stage = state.stage;
    const accuracy = report.accuracy;
    return {
      reportType: 'rehab-color-sequence',
      title: LAB_TITLE,
      stageTitle: `${stage.age.label} ${stage.load.label}`,
      ageGroupLabel: stage.age.label,
      ageGroupRange: stage.age.range,
      levelLabel: stage.load.label,
      levelDescription: stage.load.focus,
      clinicalNote: stage.difficultyReport.clinicalBasis,
      guardianSummary: `${stage.age.label} 기준 ${stage.difficultyReport.spanText} 순서를 재현하는 과제에서 정확도와 반응시간을 함께 관찰했습니다.`,
      teacherReviewNote: `예측 반응 ${report.anticipatoryRate}% / 순서 오류 ${report.commissionRate}% / 평균 반응 ${formatSeconds(report.meanRt)}`,
      totalItems: stage.totalRounds,
      totalQuestions: stage.totalRounds,
      correctCount: state.metrics.correct,
      completionCount: stage.totalRounds,
      wrongCount: stage.totalRounds - state.metrics.correct,
      perfectCount: state.metrics.correct,
      firstTryRate: accuracy,
      accuracyRate: accuracy,
      elapsedMs: report.totalResponseMs,
      avgQuestionMs: report.meanRt,
      benchmarkMs: stage.age.benchmarkMs,
      questionLogs: state.metrics.roundSummaries.map((item) => ({
        id: `round-${item.round}`,
        correct: !!item.correct,
        durationMs: Number(item.responseTimeMs || 0),
        target: item.target,
        response: item.response
      })),
      startedAtMs: state.startedAtMs,
      sequenceLength: stage.sequenceLength,
      memoryMs: stage.previewMs,
      connectionCount: stage.sequenceLength,
      mode: 'color-sequence-recall',
      normProfile: stage.age.normProfile,
      normProfileLabel: `${stage.age.label} 기준`,
      reportProfileId: stage.sequenceLength >= 4 ? 'memory-sequence' : 'memory-color-binding',
      accentColor: '#2563eb'
    };
  }

  function buildProfessionalReport(report) {
    const reportInput = buildReportInput(report);
    const engineReport = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function'
      ? window.PlaylabReportEngine.buildReport(reportInput)
      : null;
    return { reportInput, engineReport };
  }

  function flattenRecommendations(engineReport) {
    return (Array.isArray(engineReport && engineReport.recommendations) ? engineReport.recommendations : [])
      .map((item) => {
        if (!item) return '';
        const title = String(item.title || '').trim();
        const desc = String(item.desc || '').trim();
        return title && desc ? `${title}: ${desc}` : (title || desc);
      })
      .filter(Boolean);
  }

  function recommendationLines(report) {
    return reportOpinion(report).map((item) => `${item.title}: ${item.text}`);
  }

  function buildHistoryPayload(report, reportInput, engineReport) {
    const stage = state.stage;
    const finalScore = Number(engineReport && engineReport.integratedScore ? engineReport.integratedScore : report.score) || report.score;
    const axes = Array.isArray(engineReport && engineReport.axes) ? engineReport.axes : [];
    const axisScores = axes.reduce((map, axis) => {
      map[axis.id] = axis.score;
      return map;
    }, {});
    return {
      labKind: 'rehab',
      reportScope: REPORT_SCOPE,
      curriculumKey: 'rehablab-color-sequence',
      stageKey: stage.id,
      stageTitle: `${stage.age.label} ${stage.load.label}`,
      labTitle: LAB_TITLE,
      totalQuestions: stage.totalRounds,
      correctCount: state.metrics.correct,
      wrongCount: stage.totalRounds - state.metrics.correct,
      score: finalScore,
      accuracyScore: report.accuracy,
      durationSeconds: (Date.now() - state.startedAtMs) / 1000,
      startedAtMs: state.startedAtMs,
      reportType: reportInput.reportType,
      reportInput,
      briefOpinion: String(engineReport && engineReport.briefOpinion ? engineReport.briefOpinion : `정답률 ${report.accuracy}%, 평균 해결 시간 ${formatSeconds(report.meanRt)}입니다.`),
      summary: String(engineReport && engineReport.briefOpinion ? engineReport.briefOpinion : `순차적 작업 기억 과제에서 정답률 ${report.accuracy}%, 평균 해결 시간 ${formatSeconds(report.meanRt)}, 시간 변동성 ${formatSeconds(report.iiv)}를 보였습니다.`),
      overview: String(engineReport && engineReport.longOpinion ? engineReport.longOpinion : '색 순서 재현을 통해 시각 순차 작업기억과 반응 조절을 함께 관찰합니다.'),
      recommendations: flattenRecommendations(engineReport).concat(recommendationLines(report)),
      cognitiveScore: Number(axisScores.memory || axisScores.attention || finalScore),
      reactionScore: Number(axisScores.speed || report.efficiency),
      focusKey: 'working-memory-sequence',
      focusLabel: '시각 순차 작업기억',
      details: {
        report_type: reportInput.reportType,
        report_input: reportInput,
        report_integrated_score: finalScore,
        report_axis_scores: axisScores,
        report_headline: String(engineReport && engineReport.headline ? engineReport.headline : '').trim(),
        age_group: stage.age.label,
        age_range: stage.age.range,
        level_label: stage.load.label,
        sequence_length: stage.sequenceLength,
        total_rounds: stage.totalRounds,
        preview_ms: stage.previewMs,
        gap_ms: stage.gapMs,
        difficulty_burden: stage.difficultyReport.burden,
        clinical_basis: stage.difficultyReport.clinicalBasis,
        average_completion_ms: report.meanRt,
        total_response_ms: report.totalResponseMs,
        time_variability_ms: report.iiv,
        efficiency_score: report.efficiency,
        anticipatory_rate: report.anticipatoryRate,
        commission_rate: report.commissionRate,
        round_summary: state.metrics.roundSummaries,
        source_page: String(window.location.pathname || '').split('/').pop() || 'rehablab-color-sequence.html'
      }
    };
  }

  function saveLocalReport(payload) {
    if (!window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function') return null;
    return window.HahaLabLearningHarness.recordSession(payload);
  }

  async function saveSupabaseReport(payload, report) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = await getSupabaseClient();
    if (!client) return { skipped: true };
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(payload.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(payload.durationSeconds || 0) / 60));
    const details = Object.assign({
      report_scope: REPORT_SCOPE,
      lab_scope: REPORT_SCOPE,
      lab_label: '재활랩',
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
      report_integrated_score: Number(report.integratedScore || payload.score || 0) || 0,
      report_headline: String(report.headline || '').trim(),
      report_brief_opinion: payload.briefOpinion,
      report_overview: payload.overview,
      report_recommendations: payload.recommendations,
      report_focus_key: payload.focusKey,
      report_focus_label: payload.focusLabel
    }, payload.details || {});
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
        report_scope: REPORT_SCOPE,
        report_integrated_score: details.report_integrated_score,
        duration_minutes: durationMinutes
      },
      memo: payload.stageTitle || LAB_TITLE
    };
    try {
      const result = await client.from('histories').insert(row);
      if (result && result.error) throw result.error;
      return result;
    } catch (error) {
      console.error('[playlab-color-sequence] history save failed:', error);
      return { error };
    }
  }

  function saveReport(report, reportInput, engineReport) {
    if (state.savedRunId || !state.stage) return;
    const payload = buildHistoryPayload(report, reportInput, engineReport);
    state.savedRunId = `saving-${Date.now()}`;
    const localRecord = saveLocalReport(payload);
    if (localRecord && localRecord.id) state.savedRunId = localRecord.id;
    saveSupabaseReport(payload, engineReport || {}).then((result) => {
      state.reportSaveState = result && result.error ? 'error' : result && result.skipped ? 'skipped' : 'saved';
    });
  }

  function renderResult() {
    clearTimers();
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.hide === 'function') {
      window.HahaFeedbackOverlay.hide();
    }
    const report = buildReport(state.metrics);
    const professional = buildProfessionalReport(report);
    const engineReport = professional.engineReport;
    saveReport(report, professional.reportInput, engineReport);
    const isSimpleResult = engineReport && engineReport.isSimpleResult;
    const finalScore = Number(engineReport && engineReport.integratedScore ? engineReport.integratedScore : report.score) || report.score;
    const bannerText = isSimpleResult
      ? (report.accuracy >= 80 ? '완료' : '다시 연습')
      : (report.accuracy >= 95 ? 'PERFECT RECALL' : report.accuracy >= 80 ? 'GREAT MEMORY' : 'KEEP TRAINING');
    const bannerClass = report.accuracy >= 95 ? 'is-perfect' : report.accuracy >= 80 ? 'is-great' : 'is-keep';
    els.resultTitle.textContent = `${state.stage.age.label} ${state.stage.load.label} 완료`;
    els.resultSummary.innerHTML = engineReport && !engineReport.isSimpleResult && window.PlaylabReportEngine
      ? window.PlaylabReportEngine.formatRichText(engineReport.briefOpinion)
      : `${state.metrics.correct}/${state.stage.totalRounds}라운드를 정답으로 완료했습니다.`;
    els.resultStats.innerHTML = isSimpleResult ? `
      <div class="playlab-result-banner ${bannerClass}">
        <span class="playlab-result-banner-label">${escapeHtml(bannerText)}</span>
        <strong>${report.accuracy}% 정확도</strong>
      </div>
      <div class="playlab-result-stats">
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">정답 여부</span><strong>${state.metrics.correct}/${state.stage.totalRounds}</strong></div>
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">정확도</span><strong>${report.accuracy}%</strong></div>
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">결과</span><strong>${state.metrics.correct >= state.stage.totalRounds ? '완료' : '진행'}</strong></div>
      </div>
    ` : `
      <div class="playlab-result-banner ${bannerClass}">
        <span class="playlab-result-banner-label">${escapeHtml(bannerText)}</span>
        <strong>${report.accuracy}% 정확도</strong>
      </div>
      <div class="playlab-result-stats">
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">정답 여부</span><strong>${state.metrics.correct}/${state.stage.totalRounds}</strong></div>
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">통합 수행점수</span><strong>${finalScore}점</strong></div>
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">평균 해결 시간</span><strong>${formatSeconds(report.meanRt)}</strong></div>
      </div>
      <div class="playlab-result-stats">
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">연결 색상</span><strong>${escapeHtml(state.stage.difficultyReport.spanText)}</strong></div>
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">시간 변동성</span><strong>${formatSeconds(report.iiv)}</strong></div>
        <div class="playlab-result-stat"><span class="playlab-result-stat-label">순서 오류</span><strong>${report.commissionRate}%</strong></div>
      </div>
      ${engineReport && !engineReport.isSimpleResult && window.PlaylabReportEngine ? window.PlaylabReportEngine.renderHtml(engineReport, { variant: 'standalone' }) : ''}
    `;
    els.reportOpinion.innerHTML = engineReport && engineReport.isSimpleResult ? '' : reportOpinion(report).map((item) => `
      <section>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </section>
    `).join('');
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
    document.querySelectorAll('[data-age]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedAgeId = String(button.getAttribute('data-age') || '').trim();
        renderLevelGrid();
        updateMenuState();
      });
    });
    els.levelGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-level-id]');
      if (!button) return;
      state.selectedLevelId = String(button.getAttribute('data-level-id') || '').trim();
      renderLevelGrid();
      updateMenuState();
    });
    els.startButton.addEventListener('click', startStage);
    els.stageSelectButton.addEventListener('click', () => setScreen('stage'));
    els.retryButton.addEventListener('click', startStage);
    els.otherStageButton.addEventListener('click', () => setScreen('stage'));
    els.helpButton.addEventListener('click', openHelp);
    els.helpCloseButton.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    els.colorPad.addEventListener('click', (event) => {
      const button = event.target.closest('[data-color-id]');
      if (button) handleColorInput(button.dataset.colorId);
    });
  }

  function cacheElements() {
    [
      'stageView', 'gameView', 'resultView', 'shellStageLabel', 'stageSelectButton',
      'levelGrid', 'startButton', 'gameTitle', 'roundChip', 'timerChip', 'sequencePreview', 'colorPad',
      'feedbackText', 'resultTitle', 'resultSummary', 'resultStats', 'reportOpinion', 'retryButton',
      'otherStageButton', 'helpButton', 'helpModal', 'helpCloseButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function init() {
    cacheElements();
    renderLevelGrid();
    renderPad(true);
    updateMenuState();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
