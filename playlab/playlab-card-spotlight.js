(function () {
  'use strict';

  const PAGE_CONFIG = window.REHABLAB_CARD_SPOTLIGHT_CONFIG || {};
  const IS_REHAB_MODE = Boolean(PAGE_CONFIG.rehabMode) || /rehablab-card-spotlight/i.test(window.location.pathname || '');
  const DEFAULT_QUESTION_COUNT = 10;
  const MOVE_INTERVAL_MS = 620;
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const PLAYLAB_STAGES = [
    { id: 'animal', number: '01', title: '동물 카드', category: 'animal', accent: '#14b8a6' },
    { id: 'food', number: '02', title: '음식 카드', category: 'food', accent: '#f97316' },
    { id: 'fruit', number: '03', title: '과일 카드', category: 'fruit', accent: '#ef4444' },
    { id: 'vehicle', number: '04', title: '차량 카드', category: 'vehicle', accent: '#0ea5e9' },
    { id: 'job', number: '05', title: '직업 카드', category: 'job', accent: '#8b5cf6' },
    { id: 'object', number: '06', title: '물건 카드', category: 'object', accent: '#64748b' },
    { id: 'electronics', number: '07', title: '전자기기 카드', category: 'electronics', accent: '#06b6d4' },
    { id: 'school-supplies', number: '08', title: '학용품 카드', category: 'school-supplies', accent: '#22c55e' },
    { id: 'sea-animal', number: '09', title: '해양동물 카드', category: 'sea-animal', accent: '#2563eb' }
  ];
  const AGE_GROUPS = [
    { id: 'preschool', label: '유아', range: '4-6세', normProfile: 'preschool', baseQuestions: 6, baseSpot: 52, moveMs: 1200, options: '오류 부담 완화', accent: '#14b8a6' },
    { id: 'elementary', label: '초등', range: '7-12세', normProfile: 'lower-elementary', baseQuestions: 9, baseSpot: 42, moveMs: 920, options: '기준 선택지', accent: '#3b82f6' },
    { id: 'teen', label: '청소년', range: '13-18세', normProfile: 'upper-elementary', baseQuestions: 10, baseSpot: 36, moveMs: 780, options: '혼합 보기', accent: '#8b5cf6' },
    { id: 'adult', label: '성인', range: '19-64세', normProfile: 'adult', baseQuestions: 12, baseSpot: 34, moveMs: 680, options: '처리속도 중심', accent: '#f97316' },
    { id: 'senior', label: '고령자', range: '65세+', normProfile: 'senior', baseQuestions: 8, baseSpot: 54, moveMs: 1320, options: '인지재활 보조', accent: '#64748b' }
  ];
  const LEVELS = [
    { id: 'lv1', index: 1, label: '큰 단서 안정화', spotDelta: 10, moveDelta: 260, questionsDelta: -2, pool: ['animal', 'food', 'fruit'], cue: '카테고리 힌트 유지', clinical: '시각 폐쇄 입문과 명칭 회상 안정화' },
    { id: 'lv2', index: 2, label: '친숙 단서 확장', spotDelta: 5, moveDelta: 140, questionsDelta: -1, pool: ['animal', 'food', 'fruit', 'vehicle'], cue: '친숙 범주 중심', clinical: '부분 단서 통합과 선택적 주의 유지' },
    { id: 'lv3', index: 3, label: '기준 수행', spotDelta: 0, moveDelta: 0, questionsDelta: 0, pool: ['animal', 'food', 'fruit', 'vehicle', 'object'], cue: '기본 단서', clinical: '연령 기준 시지각 폐쇄 수행' },
    { id: 'lv4', index: 4, label: '혼합 범주 변별', spotDelta: -6, moveDelta: -100, questionsDelta: 0, pool: ['animal', 'food', 'fruit', 'vehicle', 'object', 'electronics'], cue: '범주 혼합', clinical: '시각 변별과 방해 보기 억제' },
    { id: 'lv5', index: 5, label: '작은 단서 추론', spotDelta: -10, moveDelta: -180, questionsDelta: 1, pool: ['animal', 'food', 'fruit', 'vehicle', 'object', 'electronics', 'school-supplies'], cue: '힌트 최소화', clinical: '세부 단서 탐색과 처리속도 균형' },
    { id: 'lv6', index: 6, label: '고부하 통합', spotDelta: -15, moveDelta: -260, questionsDelta: 2, pool: ['animal', 'food', 'fruit', 'vehicle', 'job', 'object', 'electronics', 'school-supplies', 'sea-animal'], cue: '혼합 고부하', clinical: '시각 폐쇄, 주의 지속, 명칭 인출 통합' }
  ];
  const STAGES = IS_REHAB_MODE ? buildRehabStages() : PLAYLAB_STAGES;
  const KNOWN_MISSING_IMAGE_PATHS = new Set([
    'images/category/animal-mouse-illust.webp',
    'images/category/food-malatang-illust.webp',
    'images/category/food-tanghuru-illust.webp',
    'images/category/food-yoajung-illust.webp'
  ]);

  const state = {
    ageId: '',
    selectedStageId: '',
    stage: null,
    pools: new Map(),
    questions: [],
    index: 0,
    revealed: false,
    questionStartedAt: 0,
    questionElapsed: 0,
    timerId: 0,
    moveId: 0,
    results: [],
    startedAtMs: 0,
    savedRunId: '',
    supabaseSaved: false
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function buildRehabStages() {
    return AGE_GROUPS.flatMap((age, ageIndex) => LEVELS.map((level) => {
      const spotBase = clamp(age.baseSpot + level.spotDelta, 14, 64);
      const questionCount = clamp(age.baseQuestions + level.questionsDelta, 4, 14);
      const moveMs = clamp(age.moveMs + level.moveDelta, 460, 1600);
      return {
        id: `${age.id}-${level.id}`,
        number: `${ageIndex + 1}-${level.index}`,
        title: `${age.label} · 레벨 ${level.index}`,
        category: '',
        poolCategories: level.pool,
        accent: age.accent,
        age,
        level,
        questionCount,
        moveMs,
        spotMin: clamp(spotBase - 4, 12, 66),
        spotMax: clamp(spotBase + 5, 16, 70),
        benchmarkMs: clamp(moveMs * 2.6, 1300, 5200)
      };
    }));
  }

  function currentQuestionCount() {
    return Number(state.stage?.questionCount || DEFAULT_QUESTION_COUNT);
  }

  function getStagePool(stage) {
    if (!stage) return [];
    if (Array.isArray(stage.poolCategories) && stage.poolCategories.length) {
      return stage.poolCategories.flatMap((category) => state.pools.get(category) || []);
    }
    return state.pools.get(stage.category) || [];
  }

  function pickQuestions(pool, count) {
    if (!pool.length) return [];
    const selected = [];
    let candidates = shuffle(pool);
    while (selected.length < count) {
      if (!candidates.length) candidates = shuffle(pool);
      const item = candidates.shift();
      if (item) selected.push(item);
    }
    return selected;
  }

  function resolveImagePath(path) {
    const raw = String(path || '').trim();
    if (!raw) return '';
    if (/^(https?:)?\/\//i.test(raw) || /^data:/i.test(raw) || /^blob:/i.test(raw)) return raw;
    return raw.replace(/^\/+/, '');
  }

  function formatSeconds(ms) {
    return `${(Math.max(0, ms) / 1000).toFixed(1)}초`;
  }

  function updateTimerDock(ms) {
    els.timerDock.textContent = `문제 ${state.index + 1} / ${currentQuestionCount()} · ${formatSeconds(ms)}`;
  }

  function setScreen(name) {
    const map = {
      menu: els.menuView,
      game: els.gameView,
      result: els.resultView
    };
    Object.entries(map).forEach(([key, element]) => {
      if (element) element.classList.toggle('is-active', key === name);
    });
    els.stageButton.classList.toggle('shell-hidden', name === 'menu');
    els.timerDock.classList.toggle('shell-hidden', name !== 'game');
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'result', {
        title: () => `카드 스포트라이트 추론-${state.stage?.title || '리포트'}`
      });
    }
  }

  function categoryLabel(category) {
    const pool = state.pools.get(category) || [];
    return pool[0]?.categoryKo || category;
  }

  function stagePoolLabel(stage) {
    if (!stage) return '';
    if (Array.isArray(stage.poolCategories) && stage.poolCategories.length) {
      return stage.poolCategories.map(categoryLabel).filter(Boolean).slice(0, 3).join(' · ');
    }
    return categoryLabel(stage.category);
  }

  function buildPools() {
    const manifest = window.CARDLAB_WEBP_MANIFEST || {};
    const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
    const byName = new Map();

    assets.forEach((asset) => {
      if (!asset || asset.is_active === false) return;
      if (String(asset.asset_type || '').trim() !== 'illust') return;
      const category = String(asset.category || '').trim();
      const name = String(asset.name_ko || asset.name_ko_auto || '').trim();
      const filePath = resolveImagePath(asset.file_path);
      if (!category || !name || !filePath) return;
      if (KNOWN_MISSING_IMAGE_PATHS.has(filePath)) return;
      const key = `${category}:${name}`;
      if (byName.has(key)) return;
      byName.set(key, {
        id: String(asset.id || key),
        category,
        categoryKo: String(asset.category_ko || category).trim(),
        name,
        description: String(asset.description_ko || '').trim(),
        image: filePath
      });
    });

    const pools = new Map();
    byName.forEach((item) => {
      if (!pools.has(item.category)) pools.set(item.category, []);
      pools.get(item.category).push(item);
    });
    state.pools = pools;
  }

  function getSelectedAge() {
    return AGE_GROUPS.find((age) => age.id === state.ageId) || null;
  }

  function getSelectedMenuStage() {
    return STAGES.find((stage) => stage.id === state.selectedStageId) || null;
  }

  function renderStages() {
    if (IS_REHAB_MODE) {
      const age = getSelectedAge();
      const stages = age ? STAGES.filter((stage) => stage.age.id === age.id) : LEVELS.map((level) => ({ id: '', level }));
      els.levelGrid.innerHTML = stages.map((stage) => `
        <button type="button" class="traffic-level-card" data-stage-id="${escapeHtml(stage.id)}" aria-pressed="false"${age ? '' : ' disabled'}>
          <span>LV${escapeHtml(stage.level.index)}</span>
          <h2>${escapeHtml(stage.level.label)}</h2>
          <p>${escapeHtml(stage.level.clinical)}</p>
        </button>
      `).join('');
      updateMenuState();
      return;
    }

    els.levelGrid.innerHTML = '<div class="spotlight-stage-head playlab-stage-label-block"><h1>시각 놀이 단계 학습</h1><p>Visual Play Stage Learning</p></div>' + STAGES.map((stage) => {
      const count = state.pools.get(stage.category)?.length || 0;
      return `
        <button type="button" class="spotlight-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-accent:${escapeHtml(stage.accent)}">
          <span>${escapeHtml(stage.number)} · 10문제</span>
          <strong>${escapeHtml(stage.title)}</strong>
          <p>${escapeHtml(categoryLabel(stage.category))} 카드 ${count}개 중 10개가 나와요.</p>
        </button>
      `;
    }).join('');
  }

  function updateMenuState() {
    if (!IS_REHAB_MODE) return;
    document.querySelectorAll('[data-age]').forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.age === state.ageId);
    });
    document.querySelectorAll('[data-stage-id]').forEach((button) => {
      const selected = Boolean(state.selectedStageId) && button.dataset.stageId === state.selectedStageId;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    const age = getSelectedAge();
    const stage = getSelectedMenuStage();
    els.startButton.disabled = !age || !stage;
    els.startButton.textContent = age && stage
      ? `${age.label} · ${stage.level.label} 시작`
      : '연령과 레벨을 선택해 주세요';
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    const pool = getStagePool(stage);
    state.stage = stage;
    state.questions = pickQuestions(pool, currentQuestionCount());
    state.index = 0;
    state.results = [];
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    state.supabaseSaved = false;
    setScreen('game');
    renderQuestion();
  }

  function stopTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = 0;
    }
  }

  function startTimer() {
    stopTimer();
    state.questionStartedAt = performance.now();
    state.questionElapsed = 0;
    updateTimerDock(0);
    state.timerId = window.setInterval(() => {
      const elapsed = performance.now() - state.questionStartedAt;
      updateTimerDock(elapsed);
    }, 100);
  }

  function stopSpotlight() {
    if (state.moveId) {
      window.clearInterval(state.moveId);
      state.moveId = 0;
    }
  }

  function moveSpotlight() {
    const x = 18 + Math.random() * 64;
    const y = 16 + Math.random() * 68;
    const minSize = Number(state.stage?.spotMin || 14);
    const maxSize = Number(state.stage?.spotMax || 21);
    const size = minSize + Math.random() * Math.max(1, maxSize - minSize);
    els.cardFrame.style.setProperty('--spot-x', `${x.toFixed(1)}%`);
    els.cardFrame.style.setProperty('--spot-y', `${y.toFixed(1)}%`);
    els.cardFrame.style.setProperty('--spot-size', `${size.toFixed(1)}%`);
  }

  function startSpotlight() {
    stopSpotlight();
    moveSpotlight();
    state.moveId = window.setInterval(moveSpotlight, Number(state.stage?.moveMs || MOVE_INTERVAL_MS));
  }

  function currentQuestion() {
    return state.questions[state.index] || null;
  }

  function renderQuestion() {
    const item = currentQuestion();
    if (!item) {
      renderResult();
      return;
    }
    state.revealed = false;
    els.cardImage.src = item.image;
    els.cardImage.alt = '';
    els.cardFrame.classList.remove('is-revealed');
    els.showAnswerButton.textContent = '답안보기';
    els.showAnswerButton.classList.remove('is-hidden');
    els.answerContent.classList.add('is-hidden');
    els.answerName.textContent = '';
    els.answerDescription.textContent = '';
    els.correctButton.classList.add('is-hidden');
    els.wrongButton.classList.add('is-hidden');
    startSpotlight();
    startTimer();
  }

  function revealAnswer() {
    const item = currentQuestion();
    if (!item || state.revealed) return;
    state.revealed = true;
    state.questionElapsed = performance.now() - state.questionStartedAt;
    stopTimer();
    stopSpotlight();
    updateTimerDock(state.questionElapsed);
    els.cardFrame.classList.add('is-revealed');
    els.cardImage.alt = `${item.name} 카드`;
    els.showAnswerButton.classList.add('is-hidden');
    els.answerName.textContent = item.name;
    els.answerDescription.textContent = item.description || '이 카드의 이름과 그림을 함께 확인해요.';
    els.answerContent.classList.remove('is-hidden');
    els.correctButton.classList.remove('is-hidden');
    els.wrongButton.classList.remove('is-hidden');
  }

  function markAnswer(isCorrect) {
    const item = currentQuestion();
    if (!item || !state.revealed) return;
    if (window.HahaFeedbackOverlay) {
      window.HahaFeedbackOverlay.showQuestionComplete(isCorrect ? 'correct' : 'wrong');
    }
    state.results.push({
      name: item.name,
      category: item.category,
      categoryKo: item.categoryKo,
      correct: Boolean(isCorrect),
      time: state.questionElapsed || (performance.now() - state.questionStartedAt),
      ageGroup: state.stage?.age?.id || '',
      levelId: state.stage?.level?.id || '',
      spotlightSize: `${Math.round(Number(state.stage?.spotMin || 0))}-${Math.round(Number(state.stage?.spotMax || 0))}%`
    });
    state.index += 1;
    renderQuestion();
  }

  function renderResult() {
    stopTimer();
    stopSpotlight();
    const totalQuestions = currentQuestionCount();
    const correct = state.results.filter((item) => item.correct).length;
    const totalMs = state.results.reduce((sum, item) => sum + item.time, 0);
    const averageMs = state.results.length ? totalMs / state.results.length : 0;
    els.resultTitle.textContent = `${state.stage.title} 완료!`;
    els.resultSummary.textContent = `총 ${totalQuestions}문제 중 ${correct}문제를 정답으로 체크했어요. 평균 추론 시간은 ${formatSeconds(averageMs)}입니다.`;
    els.resultStats.innerHTML = `
      <div class="spotlight-stat"><span>정답 체크</span><strong>${correct} / ${totalQuestions}</strong></div>
      <div class="spotlight-stat"><span>오답 체크</span><strong>${totalQuestions - correct}개</strong></div>
      <div class="spotlight-stat"><span>평균 시간</span><strong>${formatSeconds(averageMs)}</strong></div>
    `;
    els.timeList.innerHTML = state.results.map((item, index) => `
      <div class="spotlight-time-item ${item.correct ? '' : 'is-wrong'}">
        <span>${index + 1}. ${escapeHtml(item.name)}</span>
        <strong>${formatSeconds(item.time)}</strong>
      </div>
    `).join('');
    renderProfessionalReport(correct, totalMs, averageMs);
    setScreen('result');
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

  function buildSpotlightReportInput(correct, totalMs, averageMs) {
    const totalQuestions = currentQuestionCount();
    const accuracyRate = Math.round((correct / totalQuestions) * 100);
    const age = state.stage?.age || null;
    const level = state.stage?.level || null;
    return {
      reportType: 'review-name',
      title: IS_REHAB_MODE ? '재활 카드 스포트라이트' : '카드 스포트라이트 추론',
      stageTitle: state.stage?.title || '카드 스포트라이트',
      totalItems: totalQuestions,
      totalQuestions,
      correctCount: correct,
      wrongCount: totalQuestions - correct,
      completionCount: state.results.length,
      perfectCount: correct,
      firstTryRate: accuracyRate,
      accuracyRate,
      elapsedMs: totalMs,
      avgQuestionMs: averageMs,
      startedAtMs: state.startedAtMs || Date.now(),
      accentColor: state.stage?.accent || '#14b8a6',
      normProfile: age?.normProfile || '',
      domain: IS_REHAB_MODE ? 'rehab visual closure naming' : 'visual closure naming',
      ageGroup: age?.id || '',
      ageGroupLabel: age ? `${age.label} ${age.range}` : '',
      levelId: level?.id || '',
      levelIndex: level?.index || 0,
      levelLabel: level?.label || '',
      taskParameters: {
        spotlightMinPercent: state.stage?.spotMin || 0,
        spotlightMaxPercent: state.stage?.spotMax || 0,
        moveIntervalMs: state.stage?.moveMs || MOVE_INTERVAL_MS,
        cueLevel: level?.cue || '',
        poolCategories: state.stage?.poolCategories || []
      },
      questionLogs: state.results.map((item, index) => ({
        questionIndex: index,
        success: item.correct,
        durationMs: item.time,
        wrongAttempts: item.correct ? 0 : 1,
        questionType: 'visual-closure-name',
        itemName: item.name,
        category: item.category,
        categoryKo: item.categoryKo,
        ageGroup: item.ageGroup,
        levelId: item.levelId,
        spotlightSize: item.spotlightSize
      }))
    };
  }

  function buildFallbackReport(reportInput) {
    const score = Math.round((Number(reportInput.accuracyRate || 0) * 0.68) + Math.max(0, 32 - Number(reportInput.avgQuestionMs || 0) / 500));
    return {
      integratedScore: Math.max(0, Math.min(100, score)),
      briefOpinion: '부분 단서를 전체 카드로 통합하는 시지각 폐쇄, 범주 추론, 명칭 회상 흐름을 함께 관찰했습니다.',
      longOpinion: '반응 시간과 정답률을 함께 보면 빠르게 누른 결과보다 단서를 충분히 모아 안정적으로 답을 떠올리는지가 중요합니다. 본 결과는 진단이 아니라 회기 수행 관찰 자료입니다.',
      recommendations: [
        { title: '시각 단서 말하기', desc: '정답 확인 전 보이는 색, 모양, 부분 특징을 한 문장으로 말합니다.' },
        { title: '명칭 인출 루틴', desc: '범주를 먼저 말하고 후보 단어를 좁히는 순서로 연습합니다.' }
      ],
      axes: [
        { id: 'visualCue', score: Math.max(0, Math.min(100, Math.round(reportInput.accuracyRate || 0))) },
        { id: 'language', score: Math.max(0, Math.min(100, Math.round(reportInput.accuracyRate || 0))) },
        { id: 'speed', score: Math.max(0, Math.min(100, Math.round(100 - Number(reportInput.avgQuestionMs || 0) / 90))) }
      ]
    };
  }

  function renderProfessionalReport(correct, totalMs, averageMs) {
    const reportInput = buildSpotlightReportInput(correct, totalMs, averageMs);
    const report = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function'
      ? window.PlaylabReportEngine.buildReport(reportInput)
      : buildFallbackReport(reportInput);
    if (els.spotlightProfessionalReport) {
      if (report && report.isSimpleResult) {
        els.spotlightProfessionalReport.innerHTML = '';
      } else if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === 'function') {
        els.spotlightProfessionalReport.innerHTML = window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' });
      } else {
        els.spotlightProfessionalReport.innerHTML = `
          <section class="spotlight-clinical-note">
            <strong>전문 소견</strong>
            <p>${escapeHtml(report.briefOpinion)}</p>
          </section>
        `;
      }
    }
    saveSpotlightReport(reportInput, report);
  }

  function saveSpotlightReport(reportInput, report) {
    if (!window.HahaLabLearningHarness || state.savedRunId) return;
    const recommendations = (Array.isArray(report.recommendations) ? report.recommendations : []).map((item) => {
      if (!item) return '';
      const title = String(item.title || '').trim();
      const desc = String(item.desc || '').trim();
      return title && desc ? `${title}: ${desc}` : (title || desc);
    }).filter(Boolean);
    const scope = IS_REHAB_MODE ? 'rehab' : 'playlab';
    const labTitle = IS_REHAB_MODE ? 'RehabLab 카드 스포트라이트' : 'PlayLab 카드 스포트라이트 추론';
    const overview = IS_REHAB_MODE
      ? `${report.longOpinion || ''}\n임상 참고: 이 과제는 시지각 폐쇄, 선택적 주의, 명칭 인출, 반응시간-정확도 균형을 연령 및 레벨 기준으로 관찰합니다. DTVP 계열의 시각 폐쇄/배경-도형 관찰 개념과 인지재활의 단계화 원칙을 참고한 회기 자료이며 진단을 대체하지 않습니다.`
      : `${report.longOpinion || ''}\n임상 참고: 이 과제는 시지각 폐쇄/시각탐색, 선택적 주의, 명칭 인출, 반응시간-정확도 균형을 회기 관찰 지표로 해석합니다. 병원 및 치료 상담에서는 진단값이 아니라 수행 변화와 과제 전략을 설명하는 보조 자료로 활용합니다.`;
    const payload = {
      labKind: scope,
      reportScope: scope,
      labTitle,
      stageKey: state.stage?.id || '',
      stageTitle: state.stage?.title || '카드 스포트라이트',
      totalQuestions: currentQuestionCount(),
      correctCount: reportInput.correctCount,
      wrongCount: reportInput.wrongCount,
      score: Number(report.integratedScore || reportInput.accuracyRate || 0) || 0,
      accuracyScore: reportInput.accuracyRate,
      durationSeconds: Number(reportInput.elapsedMs || 0) / 1000,
      startedAtMs: reportInput.startedAtMs,
      reportType: 'review-name',
      reportInput,
      briefOpinion: report.briefOpinion,
      overview,
      recommendations: recommendations.concat([
        IS_REHAB_MODE
          ? '근거 참고: DTVP 시지각 하위영역, INCOG 2.0 인지재활 원칙, Cicerone 계열 인지재활 리뷰, Diamond(2013)의 실행기능 발달 리뷰를 반영했습니다.'
          : '근거 참고: ASHA Practice Portal의 아동 언어 중재 원칙, Diamond(2013)의 실행기능 리뷰, 소아 기능시각 평가 문헌의 시지각 관찰 관점을 반영했습니다.'
      ]),
      cognitiveScore: getAxisAverage(report, ['visualCue', 'language', 'attention']) || report.integratedScore,
      reactionScore: getAxisAverage(report, ['speed', 'selfMonitoring', 'completion']) || report.integratedScore,
      focusKey: 'visual-closure-naming',
      focusLabel: '시지각 추론/명칭 회상',
      details: {
        report_scope: scope,
        lab_scope: scope,
        lab_label: IS_REHAB_MODE ? '재활랩' : '플레이랩',
        age_group: reportInput.ageGroup,
        age_group_label: reportInput.ageGroupLabel,
        level_id: reportInput.levelId,
        level_label: reportInput.levelLabel,
        level_index: reportInput.levelIndex,
        task_parameters: reportInput.taskParameters,
        report_guardian_summary: buildGuardianSummary(reportInput),
        report_teacher_review_note: buildTeacherReviewNote(reportInput),
        report_action_plan_summary: buildActionPlan(reportInput),
        report_action_plan_policy: '정답률 80% 이상이고 평균 반응시간이 연령 기준 범위 안이면 다음 레벨을 고려합니다. 60% 미만이거나 오답이 반복되면 같은 레벨에서 단서 말하기를 추가합니다.',
        report_display_modes: ['guardian', 'teacher'],
        report_headline: String(report.headline || '').trim(),
        report_integrated_score: Number(report.integratedScore || 0) || 0,
        clinical_reference_note: IS_REHAB_MODE
          ? 'DTVP 시각 폐쇄/배경-도형 관찰 개념과 INCOG/Cicerone 인지재활 단계화 원칙을 참고한 회기 관찰 리포트입니다.'
          : 'ASHA 언어 중재, 실행기능/주의 연구, 소아 기능시각 평가 문헌을 참고한 회기 관찰 리포트입니다.',
        source_page: String(window.location.pathname || '').split('/').pop() || ''
      }
    };
    const record = window.HahaLabLearningHarness.recordSession(payload);
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
    if (IS_REHAB_MODE) saveSupabaseReport(payload, reportInput, report);
  }

  function buildGuardianSummary(reportInput) {
    return `${reportInput.ageGroupLabel || '선택 연령'} ${reportInput.levelLabel || ''}에서 부분 단서를 보고 전체 그림을 떠올리는 과제를 수행했습니다. 정답률은 ${reportInput.accuracyRate}%이고 평균 반응 시간은 ${formatSeconds(reportInput.avgQuestionMs)}입니다.`;
  }

  function buildTeacherReviewNote(reportInput) {
    const task = reportInput.taskParameters || {};
    return `단서 범위 ${Math.round(task.spotlightMinPercent || 0)}-${Math.round(task.spotlightMaxPercent || 0)}%, 이동 간격 ${Math.round(task.moveIntervalMs || 0)}ms 조건입니다. 오답 문항의 범주와 반응시간을 함께 검토해 시각 폐쇄, 시각 변별, 명칭 회상 중 어느 축에서 부담이 커졌는지 확인합니다.`;
  }

  function buildActionPlan(reportInput) {
    if (reportInput.accuracyRate >= 80) return '다음 회기에는 동일 연령군에서 한 단계 높은 레벨 또는 더 작은 단서 조건을 시도합니다.';
    if (reportInput.accuracyRate >= 60) return '같은 레벨을 유지하되 보이는 색, 모양, 부분 특징을 말한 뒤 답을 확인하는 전략을 추가합니다.';
    return '한 단계 낮은 레벨에서 단서 크기를 키우고 친숙한 카테고리부터 다시 안정화합니다.';
  }

  function parseMaybeJson(value, fallback) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function readLaunchContext() {
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.readLaunchContext === 'function') {
      return window.HahaLabLearningHarness.readLaunchContext();
    }
    return null;
  }

  function getSupabaseClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    if (!window.__cardSpotlightSupabaseClient) {
      window.__cardSpotlightSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return window.__cardSpotlightSupabaseClient;
  }

  async function saveSupabaseReport(payload, reportInput, report) {
    if (state.supabaseSaved) return { skipped: true };
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = getSupabaseClient();
    if (!client) return { skipped: true };
    state.supabaseSaved = true;
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(reportInput.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(reportInput.elapsedMs || 0) / 60000));
    const details = Object.assign({
      report_scope: 'rehab',
      lab_scope: 'rehab',
      lab_label: '재활랩',
      lab_title: payload.labTitle,
      game_name: payload.labTitle,
      report_title: payload.stageTitle,
      category_title: payload.labTitle,
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
      report_cognitive_score: payload.cognitiveScore,
      report_reaction_score: payload.reactionScore,
      report_focus_key: payload.focusKey,
      report_focus_label: payload.focusLabel,
      source_page: String(window.location.pathname || '').split('/').pop() || 'rehablab-card-spotlight.html'
    }, payload.details || {});
    const row = {
      teacher_id: String(launchContext.teacherId || '').trim(),
      client_id: String(launchContext.clientId || '').trim(),
      client_name: String(launchContext.clientName || '').trim(),
      type: String(launchContext.clientType || 'client').trim() || 'client',
      category: 'session_history',
      action: '게임 완료',
      action_type: payload.labTitle,
      event_datetime: completedAt,
      start_datetime: startedAt,
      end_datetime: completedAt,
      duration: `${durationMinutes} minutes`,
      duration_minutes: durationMinutes,
      details: JSON.stringify(details),
      metadata: Object.assign({
        report_scope: 'rehab',
        lab_scope: 'rehab',
        report_integrated_score: details.report_integrated_score,
        report_cognitive_score: details.report_cognitive_score,
        report_reaction_score: details.report_reaction_score,
        duration_minutes: durationMinutes,
        duration: `${durationMinutes} minutes`
      }, parseMaybeJson(payload.metadata, {})),
      memo: payload.stageTitle || payload.labTitle
    };
    try {
      const result = await client.from('histories').insert(row);
      if (result && result.error) throw result.error;
      return result;
    } catch (error) {
      console.error('[rehablab-card-spotlight] history save failed:', error);
      state.supabaseSaved = false;
      return { error };
    }
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
    if (IS_REHAB_MODE) {
      document.querySelectorAll('[data-age]').forEach((button) => {
        button.addEventListener('click', () => {
          state.ageId = button.dataset.age || '';
          state.selectedStageId = '';
          renderStages();
        });
      });
      els.levelGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-stage-id]');
        if (!button) return;
        state.selectedStageId = button.dataset.stageId || '';
        updateMenuState();
      });
      els.startButton.addEventListener('click', () => {
        const stage = getSelectedMenuStage();
        if (stage) startStage(stage.id);
      });
    } else {
      els.levelGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-stage-id]');
        if (!button) return;
        startStage(button.dataset.stageId);
      });
    }
    els.stageButton.addEventListener('click', () => {
      stopTimer();
      stopSpotlight();
      setScreen('menu');
    });
    els.showAnswerButton.addEventListener('click', revealAnswer);
    els.correctButton.addEventListener('click', () => markAnswer(true));
    els.wrongButton.addEventListener('click', () => markAnswer(false));
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || STAGES[0].id));
    els.otherStageButton.addEventListener('click', () => setScreen('menu'));
    els.helpButton.addEventListener('click', openHelp);
    els.helpClose.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHelp();
      if (event.key === ' ' && els.gameView.classList.contains('is-active') && !state.revealed) {
        event.preventDefault();
        revealAnswer();
      }
    });
  }

  function cacheElements() {
    [
      'menuView', 'gameView', 'resultView', 'levelGrid', 'startButton', 'timerDock', 'stageButton',
      'cardFrame', 'cardImage',
      'showAnswerButton', 'answerContent', 'answerName', 'answerDescription', 'wrongButton', 'correctButton',
      'resultTitle', 'resultSummary', 'resultStats', 'timeList', 'spotlightProfessionalReport', 'retryButton',
      'otherStageButton', 'helpButton', 'helpModal', 'helpClose'
    ].forEach((id) => {
      els[id] = $(id);
    });

    // PlayLab uses the stage-oriented shell, while the RehabLab variant keeps
    // the legacy menu/level IDs. Normalize the two shells before rendering so
    // the shared script never attempts to render into a missing element.
    if (!els.menuView) els.menuView = $('stageView');
    if (!els.levelGrid) els.levelGrid = $('stageGrid');
  }

  function init() {
    cacheElements();
    buildPools();
    renderStages();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
