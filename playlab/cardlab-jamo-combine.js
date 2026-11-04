(function () {
  'use strict';

  const STAGES = [
    {
      id: 'basic-vowels',
      badge: '01',
      title: '기본 모음 결합',
      desc: '자음과 ㅏ·ㅓ·ㅣ·ㅔ 계열 모음이 만나 낱말이 되는 과정을 봅니다.',
      focus: '초성+중성',
      accent: '#2f80ed',
      words: ['사자', '거미', '나비', '개미', '매미', '제비', '지네', '메기', '가재', '대게', '파리', '자라', '하마', '라마', '치타', '기러기', '해파리', '개나리', '가지', '바나나', '체리', '카레', '피자', '젤리', '야채', '세제', '베개', '기차', '바지', '치마', '카메라', '다리미', '지퍼', '머리띠', '가게', '나사', '마차', '마녀', '바다', '다리', '머리', '허리', '어깨', '치아', '아기', '아빠', '여자', '제기', '해바라기']
    },
    {
      id: 'round-vowels',
      badge: '02',
      title: '둥근 모음 결합',
      desc: 'ㅜ·ㅠ·ㅗ·ㅛ 계열 모음이 들어간 낱말을 조합합니다.',
      focus: 'ㅜ·ㅠ·ㅗ·ㅛ',
      accent: '#10b981',
      words: ['우유', '우주', '우표', '유부', '유도', '구두', '두부', '수수', '수도', '수표', '부부', '주부']
    },
    {
      id: 'final-consonants',
      badge: '03',
      title: '받침 포함 결합',
      desc: '초성, 중성, 받침이 함께 모여 완성되는 낱말을 확인합니다.',
      focus: '초성+중성+종성',
      accent: '#f59e0b',
      words: ['책상', '연필', '색칠', '공책', '칠판', '운동', '공장', '동물', '식물', '곤충', '공룡', '신발', '양말', '장갑', '얼굴', '눈썹', '입술', '손톱', '발톱', '설탕', '떡국', '국밥', '반찬', '선물', '빗물', '창문', '방문', '신문', '경찰', '학생', '선생님', '공원', '풀잎', '꽃밭', '산길', '물병']
    }
  ];

  const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const JONGSEONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  const state = {
    stage: null,
    words: [],
    index: 0,
    revealed: false,
    startedAtMs: 0,
    savedRunId: '',
    assetMap: new Map(),
    soundLookup: new Map(),
    soundBaseUrl: '',
    soundLoaded: false,
    audio: null,
    missingImages: new Set()
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

  function decomposeSyllable(char) {
    const code = char.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return [char];
    const offset = code - 0xac00;
    const initial = Math.floor(offset / 588);
    const medial = Math.floor((offset % 588) / 28);
    const final = offset % 28;
    return [CHOSEONG[initial], JUNGSEONG[medial]].concat(final ? [JONGSEONG[final]] : []);
  }

  function decomposeWord(word) {
    return Array.from(word).map(decomposeSyllable);
  }

  function buildAssetMap() {
    const manifest = window.CARDLAB_WEBP_MANIFEST || {};
    const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
    const localAssets = Array.isArray(window.CARDLAB_JAMO_COMBINE_LOCAL_ASSETS)
      ? window.CARDLAB_JAMO_COMBINE_LOCAL_ASSETS
      : [];
    assets.forEach((asset) => {
      if (!asset || asset.is_active === false) return;
      const type = String(asset.asset_type || '').trim();
      if (type && type !== 'illust') return;
      const name = String(asset.name_ko || asset.name_ko_auto || '').trim();
      const image = String(asset.file_path || '').trim();
      if (!name || !image || state.assetMap.has(name)) return;
      state.assetMap.set(name, {
        name,
        category: String(asset.category_ko || asset.category || '').trim(),
        image
      });
    });
    localAssets.forEach((asset) => {
      const name = String(asset?.name || '').trim();
      const image = String(asset?.path || '').trim();
      if (!name || !image || state.assetMap.has(name)) return;
      state.assetMap.set(name, {
        name,
        category: String(asset.category || '').trim(),
        image,
        isGenerated: true
      });
    });
  }

  function getCurrentWord() {
    return state.words[state.index] || '';
  }

  function getCurrentAsset() {
    return state.assetMap.get(getCurrentWord()) || null;
  }

  function normalize(value) {
    return String(value == null ? '' : value).replace(/\s+/g, '').trim();
  }

  async function loadSoundManifest() {
    if (state.soundLoaded) return;
    state.soundLoaded = true;
    try {
      const url = window.location.protocol === 'file:' ? '../sound/card/manifest.json' : '/sound/card/manifest.json';
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('sound manifest unavailable');
      const manifest = await response.json();
      const items = Array.isArray(manifest.items) ? manifest.items : [];
      state.soundBaseUrl = new URL('.', response.url).href;
      items.forEach((item) => {
        const kind = String(item.kind || '').trim();
        const name = String(item.name_ko || '').trim();
        const text = String(item.text || '').trim();
        const filePath = String(item.filePath || item.file_path || '').trim();
        if (!filePath) return;
        if (kind && name) state.soundLookup.set(`${kind}:${normalize(name)}`, filePath);
        if (kind && text) state.soundLookup.set(`${kind}:text:${normalize(text)}`, filePath);
      });
    } catch (error) {
      state.soundBaseUrl = window.location.protocol === 'file:'
        ? new URL('../sound/card/', window.location.href).href
        : new URL('/sound/card/', window.location.href).href;
    }
  }

  function resolveSoundPath(rawPath) {
    const raw = String(rawPath || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
    const file = raw.replace(/^sound\/card\//, '');
    return new URL(file, state.soundBaseUrl || new URL('/sound/card/', window.location.href).href).href;
  }

  function stopAudio() {
    if (state.audio) {
      try {
        state.audio.pause();
        state.audio.currentTime = 0;
      } catch (error) {
        /* Audio may be unavailable in restricted browser contexts. */
      }
    }
  }

  async function playNameAudio(word) {
    await loadSoundManifest();
    const key = `name:${normalize(word)}`;
    const path = state.soundLookup.get(key) || state.soundLookup.get(`name:text:${normalize(word)}`) || '';
    if (!path) return false;
    stopAudio();
    try {
      const audio = state.audio || new Audio();
      state.audio = audio;
      audio.src = resolveSoundPath(path);
      audio.currentTime = 0;
      await audio.play();
      return true;
    } catch (error) {
      return false;
    }
  }

  function setScreen(name) {
    const map = { stage: els.stageView, game: els.gameView, complete: els.completeView };
    Object.entries(map).forEach(([key, element]) => element.classList.toggle('is-active', key === name));
    els.stageButton.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel.classList.toggle('shell-hidden', name === 'stage');
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="jamo-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--accent:${escapeHtml(stage.accent)}">
        <span class="jamo-stage-badge">${escapeHtml(stage.badge)}</span>
        <h2>${escapeHtml(stage.title)}</h2>
        <p>${escapeHtml(stage.desc)}</p>
        <div class="jamo-stage-meta">
          <span>${escapeHtml(stage.focus)}</span>
          <span>${stage.words.length}개 단어</span>
        </div>
      </button>
    `).join('');
  }

  function renderFormula(word) {
    const groups = decomposeWord(word);
    els.jamoFormula.innerHTML = `
      <div class="jamo-parts-row" aria-hidden="false">
        ${groups.map((parts) => `
          <div class="jamo-syllable">
            ${parts.map((part, index) => `
              ${index > 0 ? '<span class="jamo-plus">+</span>' : ''}
              <span class="jamo-part" style="--merge-x:${mergeOffset(index, parts.length)}">${escapeHtml(part)}</span>
            `).join('')}
          </div>
        `).join('')}
      </div>
      <div class="jamo-complete-word" aria-hidden="true">${escapeHtml(word)}</div>
    `;
  }

  function mergeOffset(index, total) {
    if (total <= 1) return '0px';
    const center = (total - 1) / 2;
    return `${Math.round((center - index) * 18)}px`;
  }

  function renderCard(word) {
    const asset = state.assetMap.get(word);
    els.answerCard.classList.remove('is-revealed', 'has-no-image', 'is-resetting');
    els.cardQuestion.hidden = false;
    els.answerImage.removeAttribute('src');
    els.answerImage.alt = '';
    els.answerImage.classList.remove('has-image');
    if (asset) {
      els.answerImage.src = asset.image;
      els.answerImage.alt = `${word} 이미지`;
    } else {
      els.answerCard.classList.add('has-no-image');
    }
  }

  function resetAnswerCard() {
    els.answerCard.classList.remove('is-revealed', 'has-no-image');
    els.answerCard.classList.add('is-resetting');
    els.cardQuestion.hidden = false;
    els.answerImage.classList.remove('has-image');
    els.answerImage.removeAttribute('src');
    els.answerImage.alt = '';
  }

  function renderQuestion() {
    const word = getCurrentWord();
    if (!word) {
      renderComplete();
      return;
    }
    state.revealed = false;
    els.gameCard.classList.remove('is-revealed');
    els.stageKicker.textContent = state.stage.focus;
    els.gameTitle.textContent = `${word.length}글자 낱말을 만들어 보세요`;
    els.questionCounter.textContent = `${state.index + 1} / ${state.words.length}`;
    els.revealButton.hidden = false;
    els.nextButton.hidden = true;
    renderFormula(word);
    renderCard(word);
  }

  function revealAnswer() {
    if (state.revealed) return;
    const word = getCurrentWord();
    const asset = getCurrentAsset();
    state.revealed = true;
    els.gameCard.classList.add('is-revealed');
    els.answerCard.classList.add('is-revealed');
    if (asset) {
      els.answerImage.classList.add('has-image');
    } else {
      state.missingImages.add(word);
    }
    els.revealButton.hidden = true;
    els.nextButton.hidden = false;
    playNameAudio(word);
    if (window.HahaFeedbackOverlay) {
      window.HahaFeedbackOverlay.showQuestionComplete('correct');
    }
  }

  function nextQuestion() {
    stopAudio();
    resetAnswerCard();
    els.gameCard.classList.add('is-changing');
    els.gameCard.classList.remove('is-revealed');
    window.setTimeout(() => {
      state.index += 1;
      renderQuestion();
      window.requestAnimationFrame(() => {
        els.gameCard.classList.remove('is-changing');
      });
    }, 90);
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    state.stage = stage;
    state.words = shuffle(stage.words);
    state.index = 0;
    state.revealed = false;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    state.missingImages = new Set();
    stopAudio();
    els.stageLabel.textContent = `${stage.badge} ${stage.title}`;
    setScreen('game');
    renderQuestion();
  }

  function renderComplete() {
    stopAudio();
    saveLearningReport();
    const missing = Array.from(state.missingImages);
    els.completeTitle.textContent = `${state.stage.title} 완료!`;
    els.completeSummary.textContent = `${state.words.length}개 낱말의 자모 결합 과정을 확인했어요.`;
    els.completeStats.innerHTML = `
      <div class="jamo-stat"><span>스테이지</span><strong>${escapeHtml(state.stage.badge)}</strong></div>
      <div class="jamo-stat"><span>확인 단어</span><strong>${state.words.length}개</strong></div>
      <div class="jamo-stat"><span>이미지 미연동</span><strong>${missing.length}개</strong></div>
    `;
    els.missingImageList.innerHTML = missing.length
      ? `<div class="jamo-missing-list">${missing.map((word) => `<span>${escapeHtml(word)}</span>`).join('')}</div>`
      : '<div class="jamo-empty-missing">모든 단어 이미지가 연결되어 있어요.</div>';
    setScreen('complete');
  }

  function saveLearningReport() {
    if (!window.HahaLabLearningHarness || !state.stage || state.savedRunId) return;
    const missing = Array.from(state.missingImages);
    const linkedCount = Math.max(0, state.words.length - missing.length);
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'cardlab',
      reportScope: 'literacy',
      curriculumKey: 'cardlab-jamo-combine',
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      labTitle: 'CardLab 자모 결합 단어',
      totalQuestions: state.words.length,
      correctCount: state.words.length,
      wrongCount: 0,
      score: 100,
      accuracyScore: 100,
      durationSeconds: (Date.now() - (state.startedAtMs || Date.now())) / 1000,
      startedAtMs: state.startedAtMs || Date.now(),
      summary: '분리된 자음, 모음, 받침이 하나의 낱말로 결합되는 과정을 시각적으로 확인했습니다.',
      overview: '자모 결합 시각화는 초성·중성·종성의 위치를 안정적으로 인식하고, 낱말 의미 이미지와 연결해 초기 한글 해독의 자동화를 돕습니다.',
      recommendations: [
        '정답을 보기 전 아이가 먼저 자모를 손가락으로 짚으며 소리 내어 읽게 해주세요.',
        '이미지가 없는 단어는 실제 사진 카드나 그림 자료를 추가하면 의미 연결 효과가 더 좋아집니다.'
      ],
      focusKey: 'jamo-combination',
      focusLabel: state.stage.focus,
      details: {
        image_linked_count: linkedCount,
        missing_image_words: missing,
        word_count: state.words.length
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
    els.nextButton.addEventListener('click', nextQuestion);
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || STAGES[0].id));
    els.otherStageButton.addEventListener('click', () => setScreen('stage'));
    els.helpButton.addEventListener('click', openHelp);
    els.helpClose.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHelp();
      if (event.key === 'Enter' && els.gameView.classList.contains('is-active')) {
        if (state.revealed) nextQuestion();
        else revealAnswer();
      }
    });
  }

  function cacheElements() {
    [
      'stageView', 'gameView', 'completeView', 'stageGrid', 'stageLabel', 'stageButton',
      'helpButton', 'helpModal', 'helpClose', 'gameCard', 'stageKicker', 'gameTitle',
      'questionCounter', 'jamoFormula', 'answerCard', 'cardQuestion',
      'answerImage', 'imageFallback', 'revealButton', 'nextButton', 'completeTitle',
      'completeSummary', 'completeStats', 'missingImageList', 'retryButton', 'otherStageButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function init() {
    cacheElements();
    buildAssetMap();
    renderStages();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
