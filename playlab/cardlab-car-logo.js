(function () {
  'use strict';

  const DEFAULT_SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const STORAGE_USER_KEY = 'haha_lab_session';
  const STORAGE_PAGE_KEY = 'haha_lab_page_state';
  const LAB_LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
  const CURRICULUM_KEY = 'car-logo';
  const STAGE_META = {
    study: {
      key: 'car-logo-card-study',
      order: 1,
      title: '자동차 로고 카드 보기'
    },
    ko: {
      key: 'car-logo-ko-quiz',
      order: 2,
      title: '자동차 로고 객관식'
    },
    en: {
      key: 'car-logo-en-quiz',
      order: 3,
      title: '자동차 로고 영문 객관식'
    }
  };

  const RAW_BRANDS = [
    ['hyundal', '현대', 'Hyundai'],
    ['kia', '기아', 'Kia'],
    ['genesis', '제네시스', 'Genesis'],
    ['ford', '포드', 'Ford'],
    ['Kgm', 'KGM', 'KGM'],
    ['renault', '르노', 'Renault'],
    ['chevrolet', '쉐보레', 'Chevrolet'],
    ['tesla', '테슬라', 'Tesla'],
    ['Jeep', '지프', 'Jeep'],
    ['Cadillac', '캐딜락', 'Cadillac'],
    ['Lincoln', '링컨', 'Lincoln'],
    ['Dodge', '닷지', 'Dodge'],
    ['Benz', '벤츠', 'Benz'],
    ['Bmw', 'BMW', 'BMW'],
    ['Audi', '아우디', 'Audi'],
    ['volkswagen', '폭스바겐', 'Volkswagen'],
    ['porsche', '포르쉐', 'Porsche'],
    ['Maybach', '마이바흐', 'Maybach'],
    ['toyota', '도요타', 'Toyota'],
    ['honda', '혼다', 'Honda'],
    ['nissan', '닛산', 'Nissan'],
    ['lexus', '렉서스', 'Lexus'],
    ['mazda', '마쓰다', 'Mazda'],
    ['subaru', '스바루', 'Subaru'],
    ['land-rover', '랜드로버', 'Land Rover'],
    ['Jaguar', '재규어', 'Jaguar'],
    ['Bentley', '벤틀리', 'Bentley'],
    ['Rolls-Royce', '롤스로이스', 'Rolls-Royce'],
    ['mini', '미니', 'MINI'],
    ['Ferrari', '페라리', 'Ferrari'],
    ['Maserati', '마세라티', 'Maserati'],
    ['polestar', '폴스타', 'Polestar']
  ];

  const FILE_OVERRIDES = {
    Kgm: 'kgm',
    Jeep: 'jeep',
    Dodge: 'dodge',
    Benz: 'benz',
    Bmw: 'bmw',
    Audi: 'audi'
  };

  const state = {
    cards: [],
    studyIndex: 0,
    revealed: false,
    quizItems: [],
    quizIndex: 0,
    quizMode: 'ko',
    score: 0,
    answered: false,
    advanceTimer: null,
    activeAudio: null,
    activeMode: 'study',
    studyRunId: '',
    studyStartedAt: '',
    studyVisitedIds: {},
    quizRunId: '',
    quizStartedAt: '',
    savedRunIds: {},
    wrongAttemptsById: {},
    wrongChoicesById: {},
    answerResults: [],
    dragChoiceId: '',
    pointerDrag: null,
    suppressNextClickChoiceId: ''
  };

  const sounds = {
    correct: new Audio('../sound/correct.mp3'),
    wrong: new Audio('../sound/error.mp3')
  };

  const $ = (id) => document.getElementById(id);

  function readStoredJson(storage, key) {
    try {
      const raw = storage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_error) {
      return null;
    }
  }

  function getQueryValue(name) {
    try {
      return String(new URLSearchParams(window.location.search).get(name) || '').trim();
    } catch (_error) {
      return '';
    }
  }

  function getStoredLabLaunchPayload() {
    const launchKey = getQueryValue('labLaunchKey');
    if (!launchKey || !launchKey.startsWith(LAB_LAUNCH_CONTEXT_STORAGE_PREFIX)) return {};
    return readStoredJson(sessionStorage, launchKey) || {};
  }

  function normalizeRequestedMode(value) {
    const key = String(value || '').trim().toLowerCase();
    if (!key) return '';
    if (['study', 'learn', 'card', 'cards', 'logo-card', 'car-logo-card'].includes(key)) return 'study';
    if (['quiz', 'ko', 'korean', 'car-logo-ko-quiz', 'objective'].includes(key)) return 'quiz';
    if (['quiz-en', 'en', 'english', 'car-logo-en-quiz'].includes(key)) return 'quiz-en';
    return '';
  }

  function getRequestedStartMode() {
    const launchPayload = getStoredLabLaunchPayload();
    return normalizeRequestedMode(
      getQueryValue('mode')
      || getQueryValue('stage')
      || getQueryValue('stageKey')
      || launchPayload.mode
      || launchPayload.stage
      || launchPayload.stageKey
      || launchPayload.stage_key
    );
  }

  function getStoredLabSessionContext() {
    const launchPayload = getStoredLabLaunchPayload();
    const storedUser = readStoredJson(localStorage, STORAGE_USER_KEY)
      || readStoredJson(sessionStorage, STORAGE_USER_KEY)
      || {};
    const storedPage = readStoredJson(sessionStorage, STORAGE_PAGE_KEY)
      || readStoredJson(localStorage, STORAGE_PAGE_KEY)
      || {};
    const currentSession = storedPage && typeof storedPage.currentSession === 'object'
      ? storedPage.currentSession
      : {};
    const resolvedClient = currentSession.client && typeof currentSession.client === 'object'
      ? currentSession.client
      : {};
    const teacherId = String(
      launchPayload.teacherId
      || launchPayload.teacher_id
      || getQueryValue('teacherId')
      || currentSession.teacherId
      || currentSession.teacher_id
      || storedUser.teacherId
      || storedUser.teacher_id
      || ''
    ).trim();
    const clientId = String(
      launchPayload.clientId
      || launchPayload.client_id
      || getQueryValue('clientId')
      || currentSession.clientId
      || currentSession.client_id
      || resolvedClient.id
      || ''
    ).trim();
    const clientName = String(
      launchPayload.clientName
      || launchPayload.client_name
      || getQueryValue('clientName')
      || currentSession.clientName
      || currentSession.client_name
      || resolvedClient.name
      || ''
    ).trim();
    return {
      teacherId,
      clientId,
      clientName,
      currentSession
    };
  }

  function createSupabaseClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    return window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
  }

  const elements = {
    modeHomeButton: $('modeHomeButton'),
    introScreen: $('introScreen'),
    studyScreen: $('studyScreen'),
    quizScreen: $('quizScreen'),
    emptyScreen: $('emptyScreen'),
    completeScreen: $('completeScreen'),
    studyProgress: $('studyProgress'),
    studyPrevButton: $('studyPrevButton'),
    studyNextButton: $('studyNextButton'),
    studyCard: $('studyCard'),
    studyIndex: $('studyIndex'),
    studyImage: $('studyImage'),
    studyBrandName: $('studyBrandName'),
    quizProgress: $('quizProgress'),
    quizScore: $('quizScore'),
    quizIndex: $('quizIndex'),
    quizKicker: $('quizKicker'),
    quizTitle: $('quizTitle'),
    quizQuestionCard: $('quizQuestionCard'),
    quizImage: $('quizImage'),
    choiceGrid: $('choiceGrid'),
    quizFeedback: $('quizFeedback'),
    nextQuestionButton: $('nextQuestionButton'),
    completeKicker: $('completeKicker'),
    completeTitle: $('completeTitle'),
    completeDescription: $('completeDescription') || $('completeSummary'),
    completePrimaryLabel: $('completePrimaryLabel'),
    completePrimaryValue: $('completePrimaryValue'),
    completeCorrectCount: $('completeCorrectCount'),
    completeTotalCount: $('completeTotalCount'),
    completeSecondaryLabel: $('completeSecondaryLabel'),
    completeSecondaryValue: $('completeSecondaryValue'),
    completeTertiaryLabel: $('completeTertiaryLabel'),
    completeTertiaryValue: $('completeTertiaryValue'),
    completeWrongCount: $('completeWrongCount'),
    completeDuration: $('completeDuration'),
    retryQuizButton: $('retryQuizButton'),
    otherStageButton: $('otherStageButton')
  };

  const supabase = createSupabaseClient();

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function shuffle(list) {
    const next = list.slice();
    for (let index = next.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = next[index];
      next[index] = next[swapIndex];
      next[swapIndex] = temp;
    }
    return next;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildCandidateCards() {
    return RAW_BRANDS.map(([key, name, englishName], index) => {
      const fileStem = FILE_OVERRIDES[key] || key;
      return {
        id: key.toLowerCase(),
        key,
        name,
        englishName,
        image: `images/car/${fileStem}.webp`,
        order: index + 1
      };
    });
  }

  function clearAdvanceTimer() {
    if (state.advanceTimer) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
    }
  }

  function stopAudio() {
    Object.keys(sounds).forEach((key) => {
      const audio = sounds[key];
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_error) {
        // noop
      }
    });
    state.activeAudio = null;
  }

  function playEffectSound(type) {
    stopAudio();
    const audio = sounds[type];
    if (!audio) return;
    state.activeAudio = audio;
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    } catch (_error) {
      // noop
    }
  }

  function cleanupTransientState() {
    clearAdvanceTimer();
    stopAudio();
  }

  function formatDuration(seconds) {
    const value = Math.max(0, Math.round(Number(seconds) || 0));
    if (value < 60) return `${value}초`;
    const minutes = Math.floor(value / 60);
    const rest = value % 60;
    return rest ? `${minutes}분 ${rest}초` : `${minutes}분`;
  }

  function elapsedSeconds(startedAt) {
    const startedAtTime = new Date(startedAt || '').getTime();
    if (!startedAtTime) return 0;
    return Math.max(1, Math.round((Date.now() - startedAtTime) / 1000));
  }

  function canLoadImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  async function loadCards() {
    const candidates = buildCandidateCards();
    const results = await Promise.all(candidates.map(async (card) => {
      const ok = await canLoadImage(card.image);
      return ok ? card : null;
    }));
    state.cards = results.filter(Boolean);
  }

  function showScreen(name) {
    [
      ['intro', elements.introScreen],
      ['study', elements.studyScreen],
      ['quiz', elements.quizScreen],
      ['empty', elements.emptyScreen],
      ['complete', elements.completeScreen]
    ].forEach(([screenName, element]) => {
      if (!element) return;
      element.classList.toggle('is-active', screenName === name);
    });

    if (elements.modeHomeButton) {
      elements.modeHomeButton.classList.toggle('shell-hidden', name === 'intro');
    }
  }

  function startStudy(index = 0) {
    if (!state.cards.length) {
      showScreen('empty');
      return;
    }
    cleanupTransientState();
    state.activeMode = 'study';
    state.studyRunId = `${CURRICULUM_KEY}-study-${Date.now()}`;
    state.studyStartedAt = new Date().toISOString();
    state.studyVisitedIds = {};
    state.studyIndex = Math.max(0, Math.min(index, state.cards.length - 1));
    state.revealed = false;
    renderStudy();
    showScreen('study');
  }

  function renderStudy() {
    const card = state.cards[state.studyIndex];
    if (!card) return;
    state.studyVisitedIds[card.id] = true;
    if (elements.studyProgress) {
      elements.studyProgress.textContent = `${state.studyIndex + 1} / ${state.cards.length}`;
    }
    if (elements.studyIndex) elements.studyIndex.textContent = pad(state.studyIndex + 1);
    if (elements.studyImage) {
      elements.studyImage.src = card.image;
      elements.studyImage.alt = `${card.name} 로고`;
    }
    if (elements.studyBrandName) {
      elements.studyBrandName.textContent = state.revealed ? card.name : '카드를 클릭하세요';
    }
  }

  function moveStudy(delta) {
    const total = state.cards.length;
    if (!total) return;
    const viewedCount = Object.keys(state.studyVisitedIds || {}).length;
    if (delta > 0 && state.studyIndex >= total - 1 && viewedCount >= total) {
      completeStudy();
      return;
    }
    state.studyIndex = (state.studyIndex + delta + total) % total;
    state.revealed = false;
    renderStudy();
  }

  function getChoiceSet(answer) {
    const others = shuffle(state.cards.filter((card) => card.id !== answer.id)).slice(0, 3);
    return shuffle([answer].concat(others));
  }

  function getChoiceLabel(card) {
    if (state.quizMode === 'en') return card.englishName || card.name;
    return card.name;
  }

  function getStageMeta(mode = state.quizMode) {
    return STAGE_META[mode] || STAGE_META.ko;
  }

  function beginQuizRun() {
    state.activeMode = state.quizMode === 'en' ? 'en' : 'ko';
    state.quizRunId = `${CURRICULUM_KEY}-${state.quizMode}-${Date.now()}`;
    state.quizStartedAt = new Date().toISOString();
    state.wrongAttemptsById = {};
    state.wrongChoicesById = {};
    state.answerResults = [];
  }

  function recordWrongAttempt(answer, choiceId) {
    if (!answer) return;
    const answerId = String(answer.id || '').trim();
    if (!answerId) return;
    state.wrongAttemptsById[answerId] = (state.wrongAttemptsById[answerId] || 0) + 1;
    const selected = state.cards.find((card) => card.id === choiceId);
    if (!state.wrongChoicesById[answerId]) state.wrongChoicesById[answerId] = [];
    if (selected) {
      state.wrongChoicesById[answerId].push({
        id: selected.id,
        label: getChoiceLabel(selected),
        koreanName: selected.name,
        englishName: selected.englishName
      });
    }
  }

  function recordCorrectAnswer(answer) {
    if (!answer) return;
    const answerId = String(answer.id || '').trim();
    state.answerResults[state.quizIndex] = {
      assetId: answerId,
      word: getChoiceLabel(answer),
      koreanName: answer.name,
      englishName: answer.englishName,
      solved: true,
      wrongAttempts: Number(state.wrongAttemptsById[answerId] || 0),
      wrongChoices: state.wrongChoicesById[answerId] || []
    };
  }

  function getWrongAttemptCount() {
    return Object.keys(state.wrongAttemptsById || {}).reduce((sum, id) => {
      return sum + Number(state.wrongAttemptsById[id] || 0);
    }, 0);
  }

  function buildHarnessPayload(snapshot, sessionContext) {
    return {
      labKind: 'cardlab',
      reportScope: 'cardlab',
      curriculumKey: CURRICULUM_KEY,
      labTitle: '자동차 마크 맞히기',
      stageKey: snapshot.stageMeta.key,
      stageTitle: snapshot.stageMeta.title,
      stageOrder: snapshot.stageMeta.order,
      totalQuestions: snapshot.totalQuestions,
      correctCount: snapshot.correctCount,
      wrongCount: snapshot.wrongCount,
      score: snapshot.score,
      accuracyScore: snapshot.score,
      cleared: snapshot.cleared,
      durationSeconds: snapshot.durationSeconds,
      clientId: sessionContext.clientId || '',
      clientName: sessionContext.clientName || '',
      teacherId: sessionContext.teacherId || '',
      sessionId: sessionContext.currentSession?.id || sessionContext.currentSession?.sessionId || '',
      summary: snapshot.summary,
      focusLabel: snapshot.stageMeta.title,
      details: {
        mode: snapshot.mode,
        studyOnly: snapshot.mode === 'study',
        completedCardCount: snapshot.mode === 'study' ? snapshot.correctCount : undefined
      }
    };
  }

  function buildQuizAttemptPayload() {
    const sessionContext = getStoredLabSessionContext();
    const clientId = String(sessionContext.clientId || '').trim();
    const teacherId = String(sessionContext.teacherId || '').trim();
    const totalQuestions = state.quizItems.length;
    if (!state.quizRunId || !state.quizStartedAt || !totalQuestions) {
      return null;
    }
    if (state.savedRunIds[state.quizRunId]) return null;

    const stageMeta = getStageMeta();
    const correctCount = state.answerResults.filter((item) => item && item.solved).length;
    const wrongAssetIds = state.quizItems
      .filter((card) => Number(state.wrongAttemptsById[card.id] || 0) > 0)
      .map((card) => card.id);
    const wrongWords = state.quizItems
      .filter((card) => Number(state.wrongAttemptsById[card.id] || 0) > 0)
      .map((card) => getChoiceLabel(card));
    const wrongCount = getWrongAttemptCount();
    const score = Math.max(0, Math.min(100, Math.round(totalQuestions / Math.max(totalQuestions + wrongCount, 1) * 100)));
    const durationSeconds = elapsedSeconds(state.quizStartedAt);
    const summary = state.quizMode === 'en'
      ? `자동차 로고 영문 객관식 ${totalQuestions}문항을 완료했어요.`
      : `자동차 로고 객관식 ${totalQuestions}문항을 완료했어요.`;
    const rpcPayload = clientId && teacherId ? {
      p_client_id: clientId,
      p_teacher_id: teacherId,
      p_curriculum_key: CURRICULUM_KEY,
      p_stage_key: stageMeta.key,
      p_stage_order: stageMeta.order,
      p_stage_title: stageMeta.title,
      p_total_questions: totalQuestions,
      p_correct_count: correctCount,
      p_wrong_count: wrongCount,
      p_score: score,
      p_cleared: correctCount >= totalQuestions,
      p_duration_seconds: durationSeconds,
      p_wrong_asset_ids: wrongAssetIds,
      p_wrong_words: wrongWords,
      p_question_snapshot: state.quizItems.map((card, index) => ({
        assetId: card.id,
        word: getChoiceLabel(card),
        koreanName: card.name,
        englishName: card.englishName,
        difficultyScore: 1,
        order: index + 1,
        tokens: ['car-logo', state.quizMode, card.key].filter(Boolean)
      })),
      p_result_snapshot: state.quizItems.map((card, index) => {
        const result = state.answerResults[index] || {};
        const wrongAttempts = Number(state.wrongAttemptsById[card.id] || result.wrongAttempts || 0);
        return {
          assetId: card.id,
          word: getChoiceLabel(card),
          koreanName: card.name,
          englishName: card.englishName,
          solved: Boolean(result.solved),
          wrongAttempts,
          wrongChoices: state.wrongChoicesById[card.id] || [],
          score: wrongAttempts > 0 ? 70 : 100
        };
      })
    } : null;

    const snapshot = {
      runId: state.quizRunId,
      mode: state.quizMode === 'en' ? 'en' : 'ko',
      stageMeta,
      totalQuestions,
      correctCount,
      wrongCount,
      score,
      cleared: correctCount >= totalQuestions,
      durationSeconds,
      summary,
      payload: rpcPayload
    };
    snapshot.harnessPayload = buildHarnessPayload(snapshot, sessionContext);
    return snapshot;
  }

  function buildStudyAttemptPayload() {
    const sessionContext = getStoredLabSessionContext();
    const clientId = String(sessionContext.clientId || '').trim();
    const teacherId = String(sessionContext.teacherId || '').trim();
    const totalQuestions = state.cards.length;
    const viewedCount = Object.keys(state.studyVisitedIds || {}).length;
    if (!state.studyRunId || !state.studyStartedAt || !totalQuestions) return null;
    if (state.savedRunIds[state.studyRunId]) return null;

    const stageMeta = getStageMeta('study');
    const completedCount = Math.max(1, Math.min(viewedCount || totalQuestions, totalQuestions));
    const score = Math.max(0, Math.min(100, Math.round(completedCount / totalQuestions * 100)));
    const durationSeconds = elapsedSeconds(state.studyStartedAt);
    const summary = `자동차 로고 카드 ${completedCount}개를 확인했어요.`;
    const rpcPayload = clientId && teacherId ? {
      p_client_id: clientId,
      p_teacher_id: teacherId,
      p_curriculum_key: CURRICULUM_KEY,
      p_stage_key: stageMeta.key,
      p_stage_order: stageMeta.order,
      p_stage_title: stageMeta.title,
      p_total_questions: totalQuestions,
      p_correct_count: completedCount,
      p_wrong_count: 0,
      p_score: score,
      p_cleared: completedCount >= totalQuestions,
      p_duration_seconds: durationSeconds,
      p_wrong_asset_ids: [],
      p_wrong_words: [],
      p_question_snapshot: state.cards.map((card, index) => ({
        assetId: card.id,
        word: card.name,
        koreanName: card.name,
        englishName: card.englishName,
        difficultyScore: 1,
        order: index + 1,
        tokens: ['car-logo', 'study', card.key].filter(Boolean)
      })),
      p_result_snapshot: state.cards.map((card, index) => ({
        assetId: card.id,
        word: card.name,
        koreanName: card.name,
        englishName: card.englishName,
        solved: Boolean(state.studyVisitedIds[card.id]),
        wrongAttempts: 0,
        wrongChoices: [],
        score: state.studyVisitedIds[card.id] ? 100 : 0,
        order: index + 1
      }))
    } : null;

    const snapshot = {
      runId: state.studyRunId,
      mode: 'study',
      stageMeta,
      totalQuestions,
      correctCount: completedCount,
      wrongCount: 0,
      score,
      cleared: completedCount >= totalQuestions,
      durationSeconds,
      summary,
      payload: rpcPayload
    };
    snapshot.harnessPayload = buildHarnessPayload(snapshot, sessionContext);
    return snapshot;
  }

  async function persistAttemptSnapshot(snapshot) {
    if (!snapshot) return false;
    if (state.savedRunIds[snapshot.runId]) return false;
    state.savedRunIds[snapshot.runId] = 'saving';
    let harnessSaved = false;
    let remoteSaved = !snapshot.payload;

    try {
      if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === 'function') {
        const result = window.HahaLabLearningHarness.recordSession(snapshot.harnessPayload);
        if (result && typeof result.then === 'function') await result;
        harnessSaved = true;
      }
    } catch (error) {
      console.error('[CardLabCarLogo] harness save failed:', error);
    }

    if (snapshot.payload && supabase) {
      try {
        const result = await supabase.rpc('record_cardlab_learning_attempt', snapshot.payload);
        if (result && result.error) throw result.error;
        remoteSaved = true;
      } catch (error) {
        console.error('[CardLabCarLogo] save failed:', error);
      }
    }

    if (harnessSaved || remoteSaved) {
      state.savedRunIds[snapshot.runId] = 'completed';
      return true;
    }
    delete state.savedRunIds[snapshot.runId];
    return false;
  }

  function persistQuizAttempt() {
    return persistAttemptSnapshot(buildQuizAttemptPayload());
  }

  function persistStudyAttempt() {
    return persistAttemptSnapshot(buildStudyAttemptPayload());
  }

  function setElementText(element, value) {
    if (element) element.textContent = String(value);
  }

  function setPrimaryResultValue(current, total) {
    if (!elements.completePrimaryValue) return;
    elements.completePrimaryValue.innerHTML = [
      '<span id="completeCorrectCount"></span>',
      '<span aria-hidden="true"> / </span>',
      '<span id="completeTotalCount"></span>'
    ].join('');
    elements.completeCorrectCount = $('completeCorrectCount');
    elements.completeTotalCount = $('completeTotalCount');
    setElementText(elements.completeCorrectCount, current);
    setElementText(elements.completeTotalCount, total);
  }

  function setTertiaryResultValue(value, options = {}) {
    if (!elements.completeTertiaryValue) return;
    if (options.numericWrong) {
      elements.completeTertiaryValue.innerHTML = '<span id="completeWrongCount"></span>회';
      elements.completeWrongCount = $('completeWrongCount');
      setElementText(elements.completeWrongCount, value);
      return;
    }
    elements.completeTertiaryValue.innerHTML = '<span></span>';
    elements.completeWrongCount = null;
    const visible = elements.completeTertiaryValue.querySelector('span');
    setElementText(visible, value);
  }

  function updateCompleteResult(snapshot) {
    if (!snapshot) return;
    const isStudy = snapshot.mode === 'study';
    setElementText(elements.completeKicker, isStudy ? 'CARD STUDY COMPLETE' : 'CARDLAB RESULT');
    setElementText(elements.completeTitle, '학습 완료');
    setElementText(elements.completeDescription, snapshot.summary);
    setElementText(elements.completePrimaryLabel, isStudy ? '진행 카드' : '정답');
    setPrimaryResultValue(snapshot.correctCount, snapshot.totalQuestions);
    setElementText(elements.completeSecondaryLabel, isStudy ? '확인율' : '정확도');
    setElementText(elements.completeSecondaryValue, `${snapshot.score}%`);
    setElementText(elements.completeTertiaryLabel, isStudy ? '결과' : '오답');
    setTertiaryResultValue(isStudy ? '완료' : snapshot.wrongCount, { numericWrong: !isStudy });
    setElementText(elements.completeDuration, formatDuration(snapshot.durationSeconds));
    if (elements.retryQuizButton) {
      elements.retryQuizButton.textContent = '현재 단계 다시 풀기';
    }
  }

  function startQuiz(mode = 'ko') {
    if (state.cards.length < 4) {
      showScreen('empty');
      return;
    }
    state.quizMode = mode === 'en' ? 'en' : 'ko';
    state.quizItems = shuffle(state.cards);
    state.quizIndex = 0;
    state.score = 0;
    state.answered = false;
    cleanupTransientState();
    beginQuizRun();
    renderQuiz();
    showScreen('quiz');
  }

  function renderQuiz() {
    const answer = state.quizItems[state.quizIndex];
    if (!answer) {
      completeQuiz();
      return;
    }
    clearAdvanceTimer();
    state.answered = false;
    if (elements.quizQuestionCard) {
      elements.quizQuestionCard.classList.remove('is-correct', 'is-wrong', 'is-drop-ready');
    }
    if (elements.quizKicker) {
      elements.quizKicker.textContent = state.quizMode === 'en' ? 'ENGLISH QUIZ' : '4 CHOICE QUIZ';
    }
    if (elements.quizTitle) {
      elements.quizTitle.textContent = state.quizMode === 'en'
        ? '왼쪽 로고의 영어 브랜드명을 고르세요.'
        : '왼쪽 로고의 브랜드를 고르세요.';
    }
    if (elements.quizProgress) {
      elements.quizProgress.textContent = `${state.quizIndex + 1} / ${state.quizItems.length}`;
    }
    if (elements.quizScore) {
      elements.quizScore.textContent = `점수 ${state.score}`;
    }
    if (elements.quizIndex) elements.quizIndex.textContent = pad(state.quizIndex + 1);
    if (elements.quizImage) {
      elements.quizImage.src = answer.image;
      elements.quizImage.alt = `${answer.name} 로고`;
    }
    if (elements.quizFeedback) {
      elements.quizFeedback.textContent = '보기를 클릭하거나 로고 위로 끌어 놓으세요.';
      elements.quizFeedback.classList.remove('is-correct', 'is-wrong');
    }
    if (elements.nextQuestionButton) {
      elements.nextQuestionButton.disabled = true;
      elements.nextQuestionButton.textContent = state.quizIndex + 1 >= state.quizItems.length ? '결과 보기' : '다음 문제';
    }
    renderChoices(answer);
  }

  function renderChoices(answer) {
    if (!elements.choiceGrid) return;
    const choices = getChoiceSet(answer);
    elements.choiceGrid.innerHTML = choices.map((choice) => (
      `<button type="button" class="car-choice-button" draggable="true" data-choice-id="${escapeHtml(choice.id)}">${escapeHtml(getChoiceLabel(choice))}</button>`
    )).join('');
  }

  function handleChoice(choiceId) {
    if (state.answered) return;
    clearDragState();
    const answer = state.quizItems[state.quizIndex];
    if (!answer) return;
    const correct = choiceId === answer.id;
    playEffectSound(correct ? 'correct' : 'wrong');
    if (elements.quizQuestionCard) {
      elements.quizQuestionCard.classList.remove('is-correct', 'is-wrong');
      void elements.quizQuestionCard.offsetWidth;
      elements.quizQuestionCard.classList.add(correct ? 'is-correct' : 'is-wrong');
    }

    if (!correct) {
      recordWrongAttempt(answer, choiceId);
      const selectedButton = Array.prototype.slice.call(elements.choiceGrid?.querySelectorAll('.car-choice-button') || [])
        .find((button) => button.dataset.choiceId === choiceId);
      if (selectedButton) {
        selectedButton.disabled = true;
        selectedButton.classList.add('is-wrong');
      }
      if (elements.quizFeedback) {
        elements.quizFeedback.textContent = '다시 골라보세요. 다른 보기를 클릭하거나 끌어 놓을 수 있어요.';
        elements.quizFeedback.classList.remove('is-correct');
        elements.quizFeedback.classList.add('is-wrong');
      }
      if (elements.nextQuestionButton) {
        elements.nextQuestionButton.disabled = true;
      }
      return;
    }

    state.answered = true;
    state.score += 1;
    recordCorrectAnswer(answer);

    Array.prototype.slice.call(elements.choiceGrid.querySelectorAll('.car-choice-button')).forEach((button) => {
      const isAnswer = button.dataset.choiceId === answer.id;
      button.disabled = true;
      button.classList.toggle('is-correct', isAnswer);
      button.classList.remove('is-wrong');
    });

    if (elements.quizScore) {
      elements.quizScore.textContent = `점수 ${state.score}`;
    }
    if (elements.quizFeedback) {
      elements.quizFeedback.textContent = getChoiceLabel(answer);
      elements.quizFeedback.classList.add('is-correct');
      elements.quizFeedback.classList.remove('is-wrong');
    }
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
    if (elements.nextQuestionButton) {
      elements.nextQuestionButton.disabled = false;
    }
    state.advanceTimer = setTimeout(nextQuestion, 900);
  }

  function getChoiceButtonFromEvent(event) {
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return null;
    return target.closest('.car-choice-button');
  }

  function clearDragState() {
    state.dragChoiceId = '';
    elements.quizQuestionCard?.classList.remove('is-drop-ready');
    elements.choiceGrid?.querySelectorAll('.car-choice-button.is-dragging').forEach((button) => {
      button.classList.remove('is-dragging');
    });
    if (state.pointerDrag?.ghost) {
      state.pointerDrag.ghost.remove();
    }
    state.pointerDrag = null;
  }

  function isPointInsideQuestionCard(x, y) {
    if (!elements.quizQuestionCard) return false;
    const rect = elements.quizQuestionCard.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function updatePointerGhost(event) {
    const drag = state.pointerDrag;
    if (!drag?.ghost) return;
    drag.ghost.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 14}px)`;
    elements.quizQuestionCard?.classList.toggle('is-drop-ready', isPointInsideQuestionCard(event.clientX, event.clientY));
  }

  function startPointerChoiceDrag(event) {
    const button = getChoiceButtonFromEvent(event);
    if (!button || button.disabled || state.answered || event.pointerType === 'mouse') return;
    state.pointerDrag = {
      choiceId: button.dataset.choiceId || '',
      button,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      ghost: null
    };
    try {
      button.setPointerCapture(event.pointerId);
    } catch (_error) {
      // noop
    }
  }

  function movePointerChoiceDrag(event) {
    const drag = state.pointerDrag;
    if (!drag || state.answered) return;
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.active && distance < 8) return;
    event.preventDefault();
    if (!drag.active) {
      drag.active = true;
      drag.button.classList.add('is-dragging');
      elements.quizQuestionCard?.classList.add('is-drop-ready');
      const ghost = document.createElement('div');
      ghost.className = 'car-choice-drag-ghost';
      ghost.textContent = drag.button.textContent || '';
      document.body.appendChild(ghost);
      drag.ghost = ghost;
    }
    updatePointerGhost(event);
  }

  function endPointerChoiceDrag(event) {
    const drag = state.pointerDrag;
    if (!drag) return;
    const choiceId = drag.choiceId;
    const shouldDrop = drag.active && isPointInsideQuestionCard(event.clientX, event.clientY);
    if (drag.active) {
      state.suppressNextClickChoiceId = choiceId;
    }
    clearDragState();
    if (shouldDrop) {
      handleChoice(choiceId);
    }
  }

  function nextQuestion() {
    if (!state.answered) return;
    state.quizIndex += 1;
    if (state.quizIndex >= state.quizItems.length) {
      completeQuiz();
      return;
    }
    renderQuiz();
  }

  function completeStudy() {
    cleanupTransientState();
    const snapshot = buildStudyAttemptPayload();
    updateCompleteResult(snapshot);
    persistAttemptSnapshot(snapshot);
    showScreen('complete');
  }

  function completeQuiz() {
    cleanupTransientState();
    const snapshot = buildQuizAttemptPayload();
    updateCompleteResult(snapshot);
    persistAttemptSnapshot(snapshot);
    showScreen('complete');
  }

  function bindEvents() {
    document.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mode;
        if (mode === 'study') startStudy();
        if (mode === 'quiz') startQuiz();
        if (mode === 'quiz-en') startQuiz('en');
      });
    });

    elements.modeHomeButton?.addEventListener('click', () => {
      cleanupTransientState();
      showScreen('intro');
    });
    elements.studyPrevButton?.addEventListener('click', () => moveStudy(-1));
    elements.studyNextButton?.addEventListener('click', () => moveStudy(1));
    elements.studyCard?.addEventListener('click', () => {
      state.revealed = true;
      renderStudy();
    });
    elements.choiceGrid?.addEventListener('click', (event) => {
      const button = event.target.closest('.car-choice-button');
      if (!button) return;
      if (state.suppressNextClickChoiceId && state.suppressNextClickChoiceId === button.dataset.choiceId) {
        state.suppressNextClickChoiceId = '';
        return;
      }
      state.suppressNextClickChoiceId = '';
      handleChoice(button.dataset.choiceId || '');
    });
    elements.choiceGrid?.addEventListener('dragstart', (event) => {
      const button = getChoiceButtonFromEvent(event);
      if (!button || button.disabled || state.answered) return;
      state.dragChoiceId = button.dataset.choiceId || '';
      button.classList.add('is-dragging');
      elements.quizQuestionCard?.classList.add('is-drop-ready');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', state.dragChoiceId);
      }
    });
    elements.choiceGrid?.addEventListener('dragend', clearDragState);
    elements.choiceGrid?.addEventListener('pointerdown', startPointerChoiceDrag);
    elements.choiceGrid?.addEventListener('pointermove', movePointerChoiceDrag);
    elements.choiceGrid?.addEventListener('pointerup', endPointerChoiceDrag);
    elements.choiceGrid?.addEventListener('pointercancel', clearDragState);
    elements.quizQuestionCard?.addEventListener('dragover', (event) => {
      if (!state.dragChoiceId || state.answered) return;
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      elements.quizQuestionCard.classList.add('is-drop-ready');
    });
    elements.quizQuestionCard?.addEventListener('dragleave', (event) => {
      if (event.relatedTarget instanceof Node && elements.quizQuestionCard.contains(event.relatedTarget)) return;
      elements.quizQuestionCard.classList.toggle('is-drop-ready', Boolean(state.dragChoiceId));
    });
    elements.quizQuestionCard?.addEventListener('drop', (event) => {
      if (state.answered) return;
      event.preventDefault();
      const choiceId = event.dataTransfer?.getData('text/plain') || state.dragChoiceId;
      clearDragState();
      handleChoice(choiceId);
    });
    elements.nextQuestionButton?.addEventListener('click', nextQuestion);
    elements.retryQuizButton?.addEventListener('click', () => {
      if (state.activeMode === 'study') startStudy();
      else startQuiz(state.activeMode === 'en' ? 'en' : 'ko');
    });
    elements.otherStageButton?.addEventListener('click', () => {
      cleanupTransientState();
      showScreen('intro');
    });

    document.addEventListener('keydown', (event) => {
      const activeStudy = elements.studyScreen?.classList.contains('is-active');
      if (!activeStudy) return;
      if (event.key === 'ArrowLeft') moveStudy(-1);
      if (event.key === 'ArrowRight') moveStudy(1);
      if (event.key === 'Enter' || event.key === ' ') {
        state.revealed = true;
        renderStudy();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cleanupTransientState();
    });
    window.addEventListener('blur', stopAudio, { passive: true });
    window.addEventListener('pagehide', cleanupTransientState, { passive: true });
    window.addEventListener('beforeunload', cleanupTransientState, { passive: true });
  }

  async function init() {
    bindEvents();
    await loadCards();
    if (!state.cards.length) {
      showScreen('empty');
      return;
    }
    const requestedMode = getRequestedStartMode();
    if (requestedMode === 'study') {
      startStudy();
    } else if (requestedMode === 'quiz') {
      startQuiz();
    } else if (requestedMode === 'quiz-en') {
      startQuiz('en');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
