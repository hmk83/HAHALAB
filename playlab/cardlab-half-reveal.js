(function () {
  'use strict';

  const QUESTION_LIMIT = 10;
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

  const state = {
    stages: [],
    stage: null,
    questions: [],
    index: 0,
    revealed: false,
    correctCount: 0,
    wrongCount: 0,
    startedAtMs: 0,
    savedRunId: '',
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
    const assets = getManifestAssets();
    const stages = [];
    CATEGORY_GROUPS.forEach((group, groupIndex) => {
      TYPES.forEach((type) => {
        const items = assets.filter((asset) => (
          group.categories.includes(asset.category) && asset.assetType === type.key
        ));
        if (!items.length) return;
        stages.push({
          id: `${group.key}-${type.key}`,
          badge: String(stages.length + 1).padStart(2, '0'),
          title: `${group.label} ${type.label}`,
          categoryLabel: group.label,
          typeLabel: type.label,
          desc: `${group.label} ${type.suffix}의 왼쪽 절반만 보고 이름을 추론합니다.`,
          accent: group.accent,
          items,
          order: groupIndex
        });
      });
    });
    state.stages = stages;
  }

  function setScreen(name) {
    const map = { stage: els.stageView, game: els.gameView, complete: els.completeView };
    Object.entries(map).forEach(([key, element]) => element.classList.toggle('is-active', key === name));
    els.stageButton.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel.classList.add('shell-hidden');
  }

  function renderStages() {
    els.stageGrid.innerHTML = state.stages.map((stage) => `
      <button type="button" class="half-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--accent:${escapeHtml(stage.accent)}">
        <span class="half-stage-badge">${escapeHtml(stage.badge)} ${escapeHtml(stage.typeLabel)}</span>
        <h2>${escapeHtml(stage.categoryLabel)}</h2>
        <p>${escapeHtml(stage.items.length)}장 중 ${Math.min(QUESTION_LIMIT, stage.items.length)}문제를 랜덤으로 봅니다.</p>
      </button>
    `).join('');
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
    els.stageKicker.textContent = '';
    els.gameTitle.textContent = '';
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
    els.wrongButton.classList.remove('is-selected');
    els.correctButton.disabled = false;
    els.wrongButton.disabled = false;
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

  function markAnswer(isCorrect) {
    if (!state.revealed) revealAnswer();
    stopAudio();
    const className = isCorrect ? 'is-correct-flash' : 'is-wrong-flash';
    els.gameCard.classList.remove('is-correct-flash', 'is-wrong-flash');
    void els.gameCard.offsetWidth;
    els.gameCard.classList.add(className);
    els.correctButton.classList.toggle('is-selected', isCorrect);
    els.wrongButton.classList.toggle('is-selected', !isCorrect);
    els.correctButton.disabled = true;
    els.wrongButton.disabled = true;
    const card = getCurrentQuestion();
    if (!card || card.marked) return;
    card.marked = true;
    if (isCorrect) state.correctCount += 1;
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
    const stage = state.stages.find((item) => item.id === stageId) || state.stages[0];
    state.stage = stage;
    state.questions = shuffle(stage.items).slice(0, Math.min(QUESTION_LIMIT, stage.items.length)).map((card) => ({ ...card, marked: false }));
    state.index = 0;
    state.revealed = false;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    setScreen('game');
    renderQuestion();
  }

  function renderComplete() {
    stopAudio();
    saveLearningReport();
    const unmarked = state.questions.length - state.correctCount - state.wrongCount;
    els.completeTitle.textContent = `${state.stage.title} 완료!`;
    els.completeSummary.textContent = `${state.questions.length}개 카드의 부분 단서를 보고 전체 대상을 추론했어요.`;
    els.completeStats.innerHTML = `
      <div class="half-stat"><span>문항</span><strong>${state.questions.length}개</strong></div>
      <div class="half-stat"><span>맞힘</span><strong>${state.correctCount}개</strong></div>
      <div class="half-stat"><span>오답</span><strong>${state.wrongCount}개</strong></div>
      <div class="half-stat"><span>미표시</span><strong>${Math.max(0, unmarked)}개</strong></div>
    `;
    setScreen('complete');
  }

  function saveLearningReport() {
    if (!window.HahaLabLearningHarness || !state.stage || state.savedRunId) return;
    const total = state.questions.length || 1;
    const accuracy = Math.round((state.correctCount / total) * 100);
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'cardlab',
      reportScope: 'visual-perception',
      curriculumKey: 'cardlab-half-reveal',
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      labTitle: 'CardLab 반쪽 카드 추론',
      totalQuestions: total,
      correctCount: state.correctCount,
      wrongCount: state.wrongCount,
      score: accuracy,
      accuracyScore: accuracy,
      durationSeconds: (Date.now() - (state.startedAtMs || Date.now())) / 1000,
      startedAtMs: state.startedAtMs || Date.now(),
      summary: '부분적으로 제시된 시각 단서를 전체 대상 이름으로 통합하는 추론 과제를 수행했습니다.',
      overview: '반쪽 카드 추론은 시각적 폐쇄, 범주 기반 예측, 어휘 명명, 의미 기억 인출을 동시에 요구하는 과제입니다.',
      recommendations: [
        '정답보기 전에 아이가 먼저 범주와 이름을 말하도록 충분한 대기 시간을 주세요.',
        '오답이 반복되는 카테고리는 전체 카드 학습 뒤 다시 반쪽 카드로 돌아와 비교 훈련을 진행하세요.'
      ],
      focusKey: 'partial-visual-closure',
      focusLabel: `${state.stage.categoryLabel} ${state.stage.typeLabel}`,
      details: {
        category: state.stage.categoryLabel,
        asset_type: state.stage.typeLabel,
        question_names: state.questions.map((card) => card.name)
      }
    });
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
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
      const button = event.target.closest('[data-stage-id]');
      if (button) startStage(button.dataset.stageId);
    });
    els.stageButton.addEventListener('click', () => {
      stopAudio();
      setScreen('stage');
    });
    els.revealButton.addEventListener('click', revealAnswer);
    els.answerSoundButton.addEventListener('click', () => {
      const card = getCurrentQuestion();
      if (card && state.revealed) speakName(card);
    });
    els.correctButton.addEventListener('click', () => markAnswer(true));
    els.wrongButton.addEventListener('click', () => markAnswer(false));
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || state.stages[0]?.id));
    els.otherStageButton.addEventListener('click', () => setScreen('stage'));
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
      'helpButton', 'helpModal', 'helpClose', 'gameCard', 'stageKicker', 'gameTitle',
      'questionCounter', 'cardImage', 'answerEmpty', 'answerResult', 'answerName',
      'answerSoundButton', 'revealButton', 'markActions', 'correctButton', 'wrongButton', 'completeTitle',
      'completeSummary', 'completeStats', 'retryButton', 'otherStageButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function init() {
    cacheElements();
    buildStages();
    renderStages();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
