(function () {
  'use strict';

  const QUESTION_LIMIT = 10;
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const LAB_LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
  const REPORT_SCOPE = resolveRuntimeLabScope();
  const LAB_TITLE = REPORT_SCOPE === 'rehab' ? '재활랩 부분 단서 시각추론' : 'PlayLab 부분 단서 시각추론';
  const REHAB_AGE_GROUPS = [
    { id: 'preschool', label: '유아', range: '4-6세', accent: '#14b8a6', categories: ['animal', 'fruit', 'food'], clinical: '친숙한 대상의 윤곽과 대표 특징을 이용해 전체 대상을 떠올리는 기초 시지각 폐쇄를 봅니다.' },
    { id: 'elementary', label: '초등', range: '7-12세', accent: '#3b82f6', categories: ['animal', 'fruit', 'food', 'object', 'bird'], clinical: '친숙 범주를 중심으로 부분 단서를 언어화하고 이름 회상과 선택적 주의를 함께 관찰합니다.' },
    { id: 'teen', label: '청소년', range: '13-18세', accent: '#8b5cf6', categories: ['animal', 'food', 'electronics', 'object', 'insect', 'fruit', 'bird', 'sea-animal'], clinical: '유사한 시각 단서 간 간섭을 줄이며 추론 속도와 정확도의 균형을 확인합니다.' },
    { id: 'adult', label: '성인', range: '19-64세', accent: '#f97316', categories: ['animal', 'food', 'electronics', 'object', 'insect', 'fruit', 'bird', 'sea-animal'], clinical: '부분 단서 통합, 어휘 인출, 자기 점검을 함께 보는 표준 인지재활형 시각추론 과제입니다.' },
    { id: 'senior', label: '고령자', range: '65세+', accent: '#64748b', categories: ['animal', 'fruit', 'food', 'object', 'bird'], clinical: '대상 친숙도를 높이고 단서량을 단순화해 성공 경험을 우선 확보하는 고령자 인지재활 과제입니다.' }
  ];
  const REHAB_LEVELS = [
    { id: 'lv1', index: 1, label: '윤곽 적응', desc: '대표 윤곽이 뚜렷한 친숙한 그림으로 시작해요.', typeMode: 'illust', categoryCount: 2 },
    { id: 'lv2', index: 2, label: '기초 통합', desc: '친숙한 범주 안에서 부분 단서를 전체로 연결해요.', typeMode: 'illust', categoryCount: 3 },
    { id: 'lv3', index: 3, label: '표준 추론', desc: '실사와 그림을 섞어 이름 회상과 주의 전환을 봐요.', typeMode: 'mixed', categoryCount: 4 },
    { id: 'lv4', index: 4, label: '간섭 조절', desc: '비슷한 범주를 섞어 오반응 억제와 자기 점검을 봐요.', typeMode: 'mixed', categoryCount: 5 },
    { id: 'lv5', index: 5, label: '고부하 추론', desc: '실사 중심으로 복잡한 단서를 빠르게 통합해요.', typeMode: 'photo', categoryCount: 6 },
    { id: 'lv6', index: 6, label: '임상 심화', desc: '범주를 넓혀 반응시간과 정답 안정성을 함께 봐요.', typeMode: 'mixed', categoryCount: 8 }
  ];
  const CATEGORY_GROUPS = [
    { key: 'animal', label: '동물', categories: ['animal'], accent: '#2f80ed' },
    { key: 'food', label: '음식', categories: ['food'], accent: '#f59e0b' },
    { key: 'electronics', label: '가전', categories: ['electronics'], accent: '#8b5cf6' },
    { key: 'object', label: '사물', categories: ['object'], accent: '#64748b' },
    { key: 'insect', label: '곤충', categories: ['insect'], accent: '#22c55e' },
    { key: 'fruit', label: '과일', categories: ['fruit'], accent: '#fb7185' },
    { key: 'bird', label: '조류', categories: ['bird', 'joryu'], accent: '#38bdf8' },
    { key: 'sea-animal', label: '해양동물', categories: ['sea-animal', 'seaanimals'], accent: '#06b6d4' }
  ];
  const TYPES = [
    { key: 'photo', label: '실사', suffix: '실사 카드' },
    { key: 'illust', label: '일러스트', suffix: '일러스트 카드' }
  ];
  const KNOWN_MISSING_IMAGE_PATHS = new Set([
    'images/category/animal-crocodile-photo.webp',
    'images/category/animal-mouse-illust.webp',
    'images/category/animal-mouse-photo.webp',
    'images/category/clothing-shirt-illust.webp',
    'images/category/electronics-lamp-photo.webp',
    'images/category/food-malatang-illust.webp',
    'images/category/food-malatang-photo.webp',
    'images/category/food-tanghuru-illust.webp',
    'images/category/food-tanghuru-photo.webp',
    'images/category/food-yoajung-illust.webp',
    'images/category/food-yoajung-photo.webp',
    'images/category/house-fence-illust.webp',
    'images/category/play-squishy-illust.webp',
    'images/category/play-squishy-photo.webp'
  ]);

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
    assetPool: [],
    stage: null,
    selectedAgeId: '',
    selectedLevelId: '',
    questions: [],
    index: 0,
    revealed: false,
    correctCount: 0,
    assistedCount: 0,
    wrongCount: 0,
    startedAtMs: 0,
    questionStartedAtMs: 0,
    results: [],
    savedRunId: '',
    supabaseClientPromise: null,
    reportSaveState: '',
    currentAudio: null
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

  function formatSeconds(ms) {
    return `${(Math.max(0, Number(ms) || 0) / 1000).toFixed(1)}초`;
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

  function normalizeAsset(asset) {
    const name = String(asset.name_ko || asset.name_ko_auto || '').trim();
    const image = String(asset.file_path || '').trim();
    if (!name || !image) return null;
    if (KNOWN_MISSING_IMAGE_PATHS.has(image)) return null;
    return {
      id: String(asset.id || `${asset.category}-${asset.asset_type}-${name}`),
      name,
      image,
      description: String(asset.description_ko || '').trim(),
      nameSoundPath: normalizeSoundPath(asset.name_sound_path || ''),
      category: String(asset.category || '').trim(),
      categoryKo: String(asset.category_ko || asset.category || '').trim(),
      assetType: String(asset.asset_type || '').trim()
    };
  }

  function normalizeSoundPath(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/^(https?:|data:|blob:|file:)/i.test(text)) return text;
    if (text.startsWith('/')) return text;
    if (text.startsWith('sound/')) {
      return window.location.protocol === 'file:' ? `../../${text}` : `/${text}`;
    }
    return text;
  }

  function getManifestAssets() {
    const manifest = window.CARDLAB_WEBP_MANIFEST || {};
    return Array.isArray(manifest.assets)
      ? manifest.assets.filter((asset) => asset && asset.is_active !== false).map(normalizeAsset).filter(Boolean)
      : [];
  }

  function buildStages() {
    state.assetPool = getManifestAssets();
  }

  function getSelectedAge() {
    return REHAB_AGE_GROUPS.find((item) => item.id === state.selectedAgeId) || null;
  }

  function getSelectedLevel() {
    return REHAB_LEVELS.find((item) => item.id === state.selectedLevelId) || null;
  }

  function filterAssetsForStage(age, level) {
    const allowedCategories = new Set(age.categories.slice(0, level.categoryCount));
    let items = state.assetPool.filter((asset) => allowedCategories.has(asset.category));
    if (level.typeMode === 'illust') items = items.filter((asset) => asset.assetType === 'illust');
    if (level.typeMode === 'photo') items = items.filter((asset) => asset.assetType === 'photo');
    if (items.length < 16) {
      items = state.assetPool.filter((asset) => age.categories.includes(asset.category));
    }
    if (level.typeMode === 'illust' && items.some((asset) => asset.assetType === 'illust')) {
      items = items.filter((asset) => asset.assetType === 'illust');
    }
    if (level.typeMode === 'photo' && items.some((asset) => asset.assetType === 'photo')) {
      items = items.filter((asset) => asset.assetType === 'photo');
    }
    return items;
  }

  function buildStageFromSelection() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    if (!age || !level) return null;
    const items = filterAssetsForStage(age, level);
    if (!items.length) return null;
    return {
      id: `${age.id}-${level.id}`,
      badge: `LV${level.index}`,
      title: `${age.label} · ${level.label}`,
      categoryLabel: age.label,
      typeLabel: level.label,
      age,
      level,
      desc: level.desc,
      accent: age.accent,
      items
    };
  }

  function setScreen(name) {
    const map = { stage: els.stageView, game: els.gameView, complete: els.completeView };
    Object.entries(map).forEach(([key, element]) => element.classList.toggle('is-active', key === name));
    els.stageButton.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel.classList.add('shell-hidden');
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'complete', {
        title: () => `${LAB_TITLE}-${state.stage?.title || '리포트'}`
      });
    }
  }

  function renderStages() {
    const age = getSelectedAge();
    els.levelGrid.innerHTML = REHAB_LEVELS.map((level) => {
      const selected = state.selectedLevelId === level.id;
      return `
        <button type="button" class="traffic-level-card${selected ? ' is-selected' : ''}" data-level-id="${escapeHtml(level.id)}" aria-pressed="${selected ? 'true' : 'false'}"${age ? '' : ' disabled'}>
          <span>LV${level.index}</span>
          <h2>${escapeHtml(level.label)}</h2>
          <p>${escapeHtml(level.desc)}</p>
        </button>
      `;
    }).join('');
    document.querySelectorAll('[data-age]').forEach((button) => {
      button.classList.toggle('is-selected', button.getAttribute('data-age') === state.selectedAgeId);
    });
    els.startButton.disabled = !age || !getSelectedLevel();
    els.startButton.textContent = age && getSelectedLevel()
      ? `${age.label} · ${getSelectedLevel().label} 시작`
      : '연령과 레벨을 선택해 주세요';
  }

  function getCurrentQuestion() {
    return state.questions[state.index] || null;
  }

  function stopAudio() {
    if (state.currentAudio) {
      state.currentAudio.pause();
      state.currentAudio.currentTime = 0;
      state.currentAudio = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function speakName(card) {
    stopAudio();
    if (card.nameSoundPath) {
      const audio = new Audio(card.nameSoundPath);
      state.currentAudio = audio;
      audio.play().catch(() => speakWithTts(card.name));
      return;
    }
    speakWithTts(card.name);
  }

  function speakWithTts(text) {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.86;
    utterance.pitch = 1.04;
    window.speechSynthesis.speak(utterance);
  }

  function renderQuestion() {
    const card = getCurrentQuestion();
    if (!card) {
      renderComplete();
      return;
    }
    stopAudio();
    state.revealed = false;
    els.gameCard.classList.remove('is-revealed', 'is-correct-flash', 'is-wrong-flash');
    els.stageKicker.textContent = `${state.stage.categoryLabel} ${state.stage.typeLabel}`;
    els.gameTitle.textContent = '왼쪽 반쪽 단서를 보고 이름을 말해보세요';
    els.questionCounter.textContent = `${state.index + 1} / ${state.questions.length}`;
    els.cardImage.src = card.image;
    els.cardImage.alt = `${card.name} 반쪽 카드`;
    els.answerName.textContent = '';
    els.answerEmpty.hidden = false;
    els.answerResult.hidden = true;
    els.answerSoundButton.hidden = true;
    els.revealButton.hidden = false;
    els.markActions.hidden = true;
    els.correctButton.classList.remove('is-selected');
    els.assistedButton.classList.remove('is-selected');
    els.wrongButton.classList.remove('is-selected');
    els.correctButton.disabled = false;
    els.assistedButton.disabled = false;
    els.wrongButton.disabled = false;
    state.questionStartedAtMs = performance.now();
  }

  function revealAnswer() {
    const card = getCurrentQuestion();
    if (!card || state.revealed) return;
    state.revealed = true;
    els.gameCard.classList.add('is-revealed');
    els.answerEmpty.hidden = true;
    els.answerResult.hidden = false;
    els.answerName.textContent = card.name;
    els.answerSoundButton.hidden = false;
    els.revealButton.hidden = true;
    els.markActions.hidden = false;
    speakName(card);
  }

  function markAnswer(outcome) {
    if (!state.revealed) revealAnswer();
    stopAudio();
    const normalizedOutcome = outcome === true ? 'correct' : outcome === false ? 'wrong' : String(outcome || 'wrong');
    const isCorrect = normalizedOutcome === 'correct';
    const isAssisted = normalizedOutcome === 'assisted';
    const isWrong = normalizedOutcome === 'wrong';
    const isSuccess = isCorrect || isAssisted;
    const className = isSuccess ? 'is-correct-flash' : 'is-wrong-flash';
    els.gameCard.classList.remove('is-correct-flash', 'is-wrong-flash');
    void els.gameCard.offsetWidth;
    els.gameCard.classList.add(className);
    els.correctButton.classList.toggle('is-selected', isCorrect);
    els.assistedButton.classList.toggle('is-selected', isAssisted);
    els.wrongButton.classList.toggle('is-selected', isWrong);
    els.correctButton.disabled = true;
    els.assistedButton.disabled = true;
    els.wrongButton.disabled = true;
    const card = getCurrentQuestion();
    if (!card || card.marked) return;
    card.marked = true;
    const durationMs = Math.max(0, performance.now() - (state.questionStartedAtMs || performance.now()));
    state.results.push({
      id: card.id,
      name: card.name,
      category: state.stage.categoryLabel,
      assetType: state.stage.typeLabel,
      outcome: normalizedOutcome,
      correct: isSuccess,
      independentCorrect: isCorrect,
      assistedCorrect: isAssisted,
      teacherCue: isAssisted,
      durationMs,
      revealed: Boolean(state.revealed)
    });
    if (isCorrect) state.correctCount += 1;
    else if (isAssisted) state.assistedCount += 1;
    else state.wrongCount += 1;
    window.setTimeout(nextQuestion, 520);
  }

  function nextQuestion() {
    stopAudio();
    const card = getCurrentQuestion();
    if (card && state.revealed && !card.marked) {
      card.marked = true;
    }
    state.index += 1;
    renderQuestion();
  }

  function startStage(stageId) {
    const stage = stageId
      ? buildStageFromSelection()
      : buildStageFromSelection();
    if (!stage) return;
    state.stage = stage;
    state.questions = shuffle(stage.items).slice(0, Math.min(QUESTION_LIMIT, stage.items.length)).map((card) => ({ ...card, marked: false }));
    state.index = 0;
    state.revealed = false;
    state.correctCount = 0;
    state.assistedCount = 0;
    state.wrongCount = 0;
    state.startedAtMs = Date.now();
    state.questionStartedAtMs = 0;
    state.results = [];
    state.savedRunId = '';
    state.reportSaveState = '';
    els.stageLabel.textContent = `${stage.age.label} · ${stage.level.label}`;
    els.stageLabel.classList.remove('shell-hidden');
    setScreen('game');
    renderQuestion();
  }

  function renderComplete() {
    stopAudio();
    const successCount = state.correctCount + state.assistedCount;
    const unmarked = state.questions.length - successCount - state.wrongCount;
    const reportInput = buildReportInput();
    const report = buildProfessionalReport(reportInput);
    const averageMs = reportInput.avgQuestionMs || 0;
    els.completeTitle.textContent = `${state.stage.title} 완료!`;
    els.completeSummary.textContent = `${state.questions.length}개 카드의 부분 단서를 보고 전체 대상을 추론했어요. 독립 정답 ${state.correctCount}개, 교사 단서 후 정답 ${state.assistedCount}개로 관찰되었습니다.`;
    els.completeStats.innerHTML = `
      <div class="half-stat"><span>문항</span><strong>${state.questions.length}개</strong></div>
      <div class="half-stat"><span>정답</span><strong>${state.correctCount}개</strong></div>
      <div class="half-stat"><span>단서 후 정답</span><strong>${state.assistedCount}개</strong></div>
      <div class="half-stat"><span>오답</span><strong>${state.wrongCount}개</strong></div>
      <div class="half-stat"><span>평균 반응</span><strong>${formatSeconds(averageMs)}</strong></div>
      <div class="half-stat"><span>성공률</span><strong>${reportInput.accuracyRate}%</strong></div>
      <div class="half-stat"><span>독립 정답률</span><strong>${reportInput.independentAccuracyRate}%</strong></div>
      <div class="half-stat"><span>미표시</span><strong>${Math.max(0, unmarked)}개</strong></div>
    `;
    if (els.professionalReport) {
      els.professionalReport.innerHTML = report && !report.isSimpleResult && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === 'function'
        ? window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' })
        : '';
    }
    saveLearningReport(reportInput, report);
    setScreen('complete');
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

  function buildReportInput() {
    const total = state.questions.length || 1;
    const successCount = state.correctCount + state.assistedCount;
    const independentAccuracy = Math.round((state.correctCount / total) * 100);
    const assistedRate = Math.round((state.assistedCount / total) * 100);
    const accuracy = Math.round((successCount / total) * 100);
    const elapsedMs = Math.max(0, Date.now() - (state.startedAtMs || Date.now()));
    const completed = state.results.length;
    const avgQuestionMs = completed
      ? state.results.reduce((sum, item) => sum + Number(item.durationMs || 0), 0) / completed
      : 0;
    return {
      reportType: 'review-name',
      reportProfileId: 'clue-inference',
      title: '부분 단서 시각추론',
      stageTitle: state.stage?.title || '',
      ageGroupLabel: state.stage?.age?.label || '',
      ageGroupRange: state.stage?.age?.range || '',
      levelLabel: state.stage?.level?.label || '',
      levelDescription: state.stage?.level?.desc || '',
      clinicalNote: state.stage?.age?.clinical || '',
      guardianSummary: `${state.stage?.age?.label || ''} 대상의 친숙한 단서를 보고 전체 대상을 추론하는 시지각 폐쇄와 이름 회상 과제를 수행했습니다.`,
      teacherReviewNote: `독립 정답 ${state.correctCount}개 / 단서 후 정답 ${state.assistedCount}개 / 오답 ${state.wrongCount}개`,
      totalItems: total,
      totalQuestions: total,
      correctCount: successCount,
      independentCorrectCount: state.correctCount,
      assistedCorrectCount: state.assistedCount,
      teacherCueCount: state.assistedCount,
      wrongCount: state.wrongCount,
      completionCount: completed,
      perfectCount: state.correctCount,
      firstTryRate: independentAccuracy,
      accuracyRate: accuracy,
      independentAccuracyRate: independentAccuracy,
      assistedRate,
      promptedCorrectRate: assistedRate,
      completionRate: Math.round((completed / total) * 100),
      elapsedMs,
      avgQuestionMs,
      benchmarkMs: 6500,
      startedAtMs: state.startedAtMs || Date.now(),
      accentColor: state.stage?.accent || '#0ea5e9',
      category: state.stage?.categoryLabel || '',
      assetType: state.stage?.typeLabel || '',
      questionLogs: state.results.map((item, index) => ({
        questionIndex: index,
        success: item.correct,
        durationMs: item.durationMs,
        wrongAttempts: item.correct ? 0 : 1,
        questionType: 'partial-card-visual-closure',
        answerName: item.name,
        outcome: item.outcome,
        independentCorrect: Boolean(item.independentCorrect),
        assistedCorrect: Boolean(item.assistedCorrect),
        teacherCue: Boolean(item.teacherCue)
      }))
    };
  }

  function buildProfessionalReport(reportInput) {
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function') {
      return window.PlaylabReportEngine.buildReport(reportInput);
    }
    return {
      integratedScore: reportInput.accuracyRate,
      accuracyRate: reportInput.accuracyRate,
      elapsedMs: reportInput.elapsedMs,
      briefOpinion: '부분 단서를 전체 대상으로 통합하는 시지각 폐쇄와 명칭 회상 수행을 관찰했습니다.',
      longOpinion: '반응시간과 정확도를 함께 보며, 빠르게 답을 말하는 능력보다 보이는 단서를 안정적으로 모아 전체 대상을 추론하는 과정이 중요합니다.',
      recommendations: [
        { title: '단서 언어화', desc: '정답 확인 전 보이는 색, 윤곽, 질감 단서를 말로 정리합니다.' },
        { title: '반응 전 멈춤', desc: '충동적인 추측을 줄이고 2초 동안 관찰한 뒤 답을 말합니다.' }
      ],
      axes: [
        { id: 'speed', label: '반응속도', score: Math.max(20, Math.min(98, Math.round(100 - reportInput.avgQuestionMs / 120))) },
        { id: 'attention', label: '집중지속', score: reportInput.accuracyRate },
        { id: 'visualCue', label: '단서활용', score: reportInput.accuracyRate },
        { id: 'language', label: '명칭회상', score: reportInput.accuracyRate },
        { id: 'selfMonitoring', label: '자기점검', score: Math.max(20, Math.min(98, 100 - (reportInput.wrongCount * 8))) },
        { id: 'completion', label: '수행완료', score: reportInput.completionRate }
      ]
    };
  }

  function recommendationLines(report) {
    return (Array.isArray(report && report.recommendations) ? report.recommendations : []).map((item) => {
      if (!item) return '';
      const title = String(item.title || '').trim();
      const desc = String(item.desc || '').trim();
      return title && desc ? `${title}: ${desc}` : (title || desc);
    }).filter(Boolean);
  }

  function saveLearningReport(reportInput, report) {
    if (!state.stage || state.savedRunId) return;
    if (REPORT_SCOPE !== 'rehab') return;
    state.savedRunId = `saving-${Date.now()}`;
    saveLocalReport(reportInput, report);
    saveSupabaseReport(reportInput, report).then((result) => {
      state.reportSaveState = result && result.error ? 'error' : result && result.skipped ? 'skipped' : 'saved';
    });
  }

  function saveLocalReport(reportInput, report) {
    if (!window.HahaLabLearningHarness) return;
    window.HahaLabLearningHarness.recordSession(buildReportPayload(reportInput, report));
  }

  function buildReportPayload(reportInput, report) {
    const score = Number(report.integratedScore || reportInput.accuracyRate || 0) || 0;
    const assistedSummary = reportInput.assistedCorrectCount
      ? `교사 단서 후 정답 ${reportInput.assistedCorrectCount}개가 포함되어, 독립 명칭 회상과 단서 활용 후 회복 반응을 분리해 해석합니다.`
      : '교사 단서 없이 독립적으로 정답을 산출한 문항 비율을 중심으로 해석합니다.';
    return {
      labKind: REPORT_SCOPE,
      reportScope: REPORT_SCOPE,
      curriculumKey: 'playlab-partial-card-reasoning',
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
      briefOpinion: report.briefOpinion,
      overview: `${report.longOpinion || ''}\n${assistedSummary}\n임상 참고: 이 과제는 시지각 폐쇄, 선택적 주의, 명칭 회상, 교사 단서 반응성, 반응시간-정확도 균형을 회기 관찰 지표로 해석합니다.`,
      recommendations: recommendationLines(report),
      cognitiveScore: getAxisAverage(report, ['visualCue', 'language', 'attention']) || score,
      reactionScore: getAxisAverage(report, ['speed', 'selfMonitoring', 'completion']) || score,
      focusKey: 'partial-card-visual-closure',
      focusLabel: `${state.stage.age.label} ${state.stage.level.label}`,
      details: {
        report_headline: String(report.headline || '').trim(),
        report_integrated_score: Number(report.integratedScore || 0) || 0,
        report_axes: Array.isArray(report.axes) ? report.axes.map((axis) => ({
          id: String(axis.id || '').trim(),
          label: String(axis.label || '').trim(),
          score: Number(axis.score || 0) || 0
        })) : [],
        report_domain: '부분 단서 기반 시지각 폐쇄 및 명칭 회상',
        independent_correct_count: reportInput.independentCorrectCount,
        assisted_correct_count: reportInput.assistedCorrectCount,
        teacher_cue_count: reportInput.teacherCueCount,
        independent_accuracy_rate: reportInput.independentAccuracyRate,
        assisted_rate: reportInput.assistedRate,
        success_rate: reportInput.accuracyRate,
        category: state.stage.categoryLabel,
        asset_type: state.stage.typeLabel,
        age_group: state.stage.age.label,
        age_range: state.stage.age.range,
        level_label: state.stage.level.label,
        clinical_note: state.stage.age.clinical,
        avg_question_ms: reportInput.avgQuestionMs,
        question_names: state.questions.map((card) => card.name),
        question_logs: reportInput.questionLogs
      }
    };
  }

  async function saveSupabaseReport(reportInput, report) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = await getSupabaseClient();
    if (!client) return { skipped: true };
    const payload = buildReportPayload(reportInput, report);
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(reportInput.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(reportInput.elapsedMs || 0) / 60000));
    const details = Object.assign({
      report_scope: REPORT_SCOPE,
      lab_scope: REPORT_SCOPE,
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
        source_page: String(window.location.pathname || '').split('/').pop() || 'playlab-partial-card-reasoning.html'
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
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_integrated_score: details.report_integrated_score,
        report_cognitive_score: details.report_cognitive_score,
        report_reaction_score: details.report_reaction_score,
        duration_minutes: durationMinutes,
        duration: `${durationMinutes} minutes`
      },
      memo: payload.stageTitle || LAB_TITLE
    };
    try {
      const result = await client.from('histories').insert(row);
      if (result && result.error) throw result.error;
      return result;
    } catch (error) {
      console.error('[playlab-partial-card-reasoning] history save failed:', error);
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
    document.querySelectorAll('[data-age]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedAgeId = String(button.getAttribute('data-age') || '').trim();
        state.selectedLevelId = '';
        document.querySelectorAll('[data-age]').forEach((node) => {
          node.classList.toggle('is-selected', node.getAttribute('data-age') === state.selectedAgeId);
        });
        renderStages();
      });
    });
    els.levelGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-level-id]');
      if (!button || !state.selectedAgeId) return;
      state.selectedLevelId = String(button.getAttribute('data-level-id') || '').trim();
      renderStages();
    });
    els.stageButton.addEventListener('click', () => {
      stopAudio();
      els.stageLabel.classList.add('shell-hidden');
      setScreen('stage');
    });
    els.startButton.addEventListener('click', () => startStage());
    els.revealButton.addEventListener('click', revealAnswer);
    els.answerSoundButton.addEventListener('click', () => {
      const card = getCurrentQuestion();
      if (card && state.revealed) speakName(card);
    });
    els.correctButton.addEventListener('click', () => markAnswer('correct'));
    els.assistedButton.addEventListener('click', () => markAnswer('assisted'));
    els.wrongButton.addEventListener('click', () => markAnswer('wrong'));
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || ''));
    els.otherStageButton.addEventListener('click', () => {
      els.stageLabel.classList.add('shell-hidden');
      setScreen('stage');
    });
    els.helpButton.addEventListener('click', openHelp);
    els.helpClose.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHelp();
      if (event.key === 'Enter' && els.gameView.classList.contains('is-active')) {
        if (!state.revealed) revealAnswer();
      }
    });
  }

  function cacheElements() {
    [
      'stageView', 'gameView', 'completeView', 'stageGrid', 'stageLabel', 'stageButton',
      'levelGrid', 'startButton',
      'helpButton', 'helpModal', 'helpClose', 'gameCard', 'stageKicker', 'gameTitle',
      'questionCounter', 'cardImage', 'answerEmpty', 'answerResult', 'answerName',
      'answerSoundButton', 'revealButton', 'markActions', 'correctButton', 'assistedButton', 'wrongButton', 'completeTitle',
      'completeSummary', 'completeStats', 'professionalReport', 'retryButton', 'otherStageButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function init() {
    cacheElements();
    buildStages();
    renderStages();
    els.stageLabel.classList.add('shell-hidden');
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
