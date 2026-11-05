(function () {
  'use strict';
  try {

  const PAGE_CONFIG = window.CARDLAB_WORDBUILD_PAGE_CONFIG || {};
  const STAGE_COLORS = [
    { accent: '#ffb347', soft: 'rgba(255, 179, 71, 0.16)' },
    { accent: '#ff9f1a', soft: 'rgba(255, 159, 26, 0.16)' },
    { accent: '#6fc7ff', soft: 'rgba(111, 199, 255, 0.16)' },
    { accent: '#7ad7a8', soft: 'rgba(122, 215, 168, 0.16)' },
    { accent: '#83d6ff', soft: 'rgba(131, 214, 255, 0.16)' },
    { accent: '#f48bd1', soft: 'rgba(244, 139, 209, 0.16)' },
    { accent: '#ff95b7', soft: 'rgba(255, 149, 183, 0.16)' },
    { accent: '#ffb273', soft: 'rgba(255, 178, 115, 0.16)' },
    { accent: '#b68cff', soft: 'rgba(182, 140, 255, 0.16)' },
    { accent: '#66c6ff', soft: 'rgba(102, 198, 255, 0.16)' },
    { accent: '#8f86ff', soft: 'rgba(143, 134, 255, 0.16)' },
    { accent: '#f3bf4b', soft: 'rgba(243, 191, 75, 0.16)' }
  ];

  const CATEGORY_LABEL_MAP = {
    '의복 및 악세사리': '의복및 악세사리',
    '가전,전자기기': '가전전자기기'
  };

  function normalizeDataList(source) {
    if (Array.isArray(source)) return source;
    if (source && typeof source === 'object') return Object.values(source);
    return [];
  }

  const RAW_WORDS = normalizeDataList(window.CARDLAB_WORDBUILD_WORDS);
  const WORDS = RAW_WORDS.map(normalizeWord).filter(Boolean);
  const WORD_MAP = new Map(WORDS.map((item) => [String(item.id || ''), item]));
  const RAW_STAGES = normalizeDataList(window.CARDLAB_WORDBUILD_STAGE_CONFIG);
  const STAGES = RAW_STAGES.length
    ? RAW_STAGES.filter(Boolean).map(normalizeStage)
    : fallbackStages();

  const TYPE_OPTIONS = Array.isArray(PAGE_CONFIG.typeOptions) && PAGE_CONFIG.typeOptions.length
    ? PAGE_CONFIG.typeOptions
    : [
        { id: 'photo', label: '실사', helper: '실제 사진으로 시작', accent: '#ff9f1a' },
        { id: 'illust', label: '일러스트', helper: '그림 카드로 시작', accent: '#4fb6ff' }
      ];

  const AUDIO_FILES = {
    correct: '../sound/correct.mp3',
    wrong: '../sound/error.mp3',
    complete: '../sound/happy_victory.mp3'
  };
  const ALLOWED_WORD_CATEGORIES = new Set([
    '동물',
    '직업',
    '음식',
    '몸',
    '물건',
    '자연',
    '의복및 악세사리',
    '과일',
    '채소',
    '학용품',
    '차량',
    '곤충',
    '조류',
    '가전전자기기',
    '악기',
    '해양동물',
    '도구',
    '탈것'
  ]);
  const DEFAULT_DESCRIPTION = '그림을 보고 카드 이름과 특징을 함께 이야기해 보세요.';
  const SELECTION_BACKGROUNDS = ['images/bg/s-space-bg.webp'];
  const LEARNING_BACKGROUNDS = ['images/bg/city-bg.webp', 'images/bg/sea-bg.webp', 'images/bg/animal-bg.webp'];

  const INITIALS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const MEDIALS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const FINALS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  const stageSelectView = document.getElementById('stageSelectView');
  const introView = document.getElementById('introView');
  const buildView = document.getElementById('buildView');
  const completeView = document.getElementById('completeView');
  const shellTopbarCenter = document.querySelector('.shell-topbar-center');
  const shellStageLabel = document.getElementById('shellStageLabel');
  const stageGrid = document.getElementById('stageGrid');
  const typeChoiceGrid = document.getElementById('typeChoiceGrid');
  const syllableRail = document.getElementById('syllableRail');
  const choiceBoard = document.getElementById('choiceBoard');
  const selectionChip = document.getElementById('selectionChip');
  const buildMediaFrame = document.getElementById('buildMediaFrame');
  const buildMediaContent = document.getElementById('buildMediaContent');
  const introStageBadge = document.getElementById('introStageBadge') || document.getElementById('introBadge');
  const introStageTitle = document.getElementById('introStageTitle') || document.getElementById('introTitle');
  const introStageSubtitle = document.getElementById('introStageSubtitle') || document.getElementById('introSubtitle');
  const introStageDescription = document.getElementById('introStageDescription') || document.getElementById('introDescription');
  const buildMediaTag = document.getElementById('buildMediaTag');
  const buildMediaLabel = document.getElementById('buildMediaLabel');
  const buildMediaDescription = document.getElementById('buildMediaDescription');
  const buildMediaCaption = document.getElementById('buildMediaCaption');
  const progressChip = document.getElementById('progressChip');
  const hintToggleButton = document.getElementById('hintToggleButton');
  const hintPanel = document.getElementById('hintPanel');
  const hintCopy = document.getElementById('hintCopy');
  const hintToastClose = document.getElementById('hintToastClose');
  const answerRevealPanel = document.getElementById('answerRevealPanel');
  const answerTitle = document.getElementById('answerTitle');
  const answerDescription = document.getElementById('answerDescription');
  const answerModal = document.getElementById('answerModal');
  const answerModalTitle = document.getElementById('answerModalTitle');
  const answerModalDescription = document.getElementById('answerModalDescription');
  const answerModalWordAudioButton = document.getElementById('answerModalWordAudioButton');
  const answerModalDescriptionAudioButton = document.getElementById('answerModalDescriptionAudioButton');
  const answerModalNextButton = document.getElementById('answerModalNextButton');
  const audioHintButton = document.getElementById('audioHintButton');
  const completeTitle = document.getElementById('completeTitle');
  const completeSummary = document.getElementById('completeSummary');
  const completeStageLabel = document.getElementById('completeStageLabel');
  const completeHintCount = document.getElementById('completeHintCount');
  const completeAudioCount = document.getElementById('completeAudioCount');
  const completeStageButtonBack = document.getElementById('completeStageButtonBack');
  const completeRetryButton = document.getElementById('completeRetryButton');
  const stageSelectButton = document.getElementById('stageSelectButton');
  const helpButton = document.getElementById('helpButton');
  const exitButton = document.getElementById('exitButton');
  const introBackButton = document.getElementById('introBackButton');
  const confirmModal = document.getElementById('confirmModal');
  const confirmModalTitle = document.getElementById('confirmModalTitle');
  const confirmModalDesc = document.getElementById('confirmModalDesc');
  const confirmModalOk = document.getElementById('confirmModalOk');
  const confirmModalCancel = document.getElementById('confirmModalCancel');
  const effectLayer = document.getElementById('wordbuildEffectLayer');

  if (!stageSelectView || !introView || !buildView || !completeView || !shellStageLabel || !stageGrid || !typeChoiceGrid || !syllableRail || !choiceBoard || !selectionChip || !buildMediaFrame || !buildMediaContent || !introStageBadge || !introStageTitle || !introStageSubtitle || !introStageDescription || !buildMediaTag || !buildMediaLabel || !buildMediaDescription || !buildMediaCaption || !progressChip || !hintToggleButton || !hintPanel || !hintCopy || !hintToastClose || !answerRevealPanel || !answerTitle || !answerDescription || !answerModal || !answerModalTitle || !answerModalDescription || !answerModalWordAudioButton || !answerModalDescriptionAudioButton || !answerModalNextButton || !audioHintButton || !completeTitle || !completeSummary || !completeStageLabel || !completeHintCount || !completeAudioCount || !completeStageButtonBack || !completeRetryButton || !stageSelectButton || !helpButton || !introBackButton || !confirmModal || !confirmModalTitle || !confirmModalDesc || !confirmModalOk || !confirmModalCancel || !effectLayer) {
    return;
  }

  const audioCache = new Map();
  let activeAudio = null;
  let completionFxPlayed = false;
  let advanceTimer = null;
  let audioSequenceToken = 0;
  let audioSequenceDelayTimer = null;

  const state = {
    phase: 'select',
    selectedStageId: getInitialStageId(),
    mediaType: TYPE_OPTIONS[0]?.id || 'photo',
    selectionBackground: '',
    learningBackground: '',
    pendingModalAction: '',
    hintOpen: false,
    answerOpen: false,
    answerModalOpen: false,
    selectedPieceId: '',
    run: null
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeToken(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/_/g, '-');
  }

  function normalizeCategoryLabel(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return CATEGORY_LABEL_MAP[raw] || raw;
  }

  function normalizeImagePath(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/^(https?:)?\/\//i.test(text) || /^file:/i.test(text) || /^data:/i.test(text) || /^blob:/i.test(text)) {
      return text;
    }
    return text.replace(/^\.\/+/, '').replace(/^\/+/, '');
  }

  function normalizeSoundPath(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/^(https?:)?\/\//i.test(text) || /^file:/i.test(text) || /^data:/i.test(text) || /^blob:/i.test(text)) {
      return text;
    }
    if (text.startsWith('../sound/')) return text;
    if (text.startsWith('sound/')) return `../${text}`;
    if (text.startsWith('/sound/')) return `..${text}`;
    return text.replace(/^\.\/+/, '').replace(/^\/+/, '');
  }

  function normalizeWord(word) {
    if (!word) return null;
    const normalizedCategory = normalizeCategoryLabel(word.categoryKo || word.category_ko || word.category || '');
    return {
      ...word,
      id: String(word.id || ''),
      nameKo: String(word.nameKo || word.name_ko || ''),
      nameEn: String(word.nameEn || word.name_en || ''),
      categoryKo: normalizedCategory,
      descriptionKo: String(word.descriptionKo || word.description_ko || ''),
      nameSoundPath: normalizeSoundPath(word.nameSoundPath || word.name_sound_path || word.nameSoundUrl || word.name_sound_url || ''),
      descriptionSoundPath: normalizeSoundPath(word.descriptionSoundPath || word.description_sound_path || word.descriptionSoundUrl || word.description_sound_url || ''),
      photoPath: normalizeImagePath(word.photoPath || word.photo || ''),
      illustPath: normalizeImagePath(word.illustPath || word.illust || ''),
      category: normalizedCategory
    };
  }

  function isMeaningfulText(value) {
    const text = String(value || '').trim();
    return Boolean(text && text !== DEFAULT_DESCRIPTION);
  }

  function getTopicParticle(word) {
    const text = String(word || '').trim();
    if (!text) return '은';
    const lastChar = text.charCodeAt(text.length - 1);
    if (lastChar < 0xac00 || lastChar > 0xd7a3) return '은';
    return ((lastChar - 0xac00) % 28) === 0 ? '는' : '은';
  }

  function getFallbackCardDescription(asset) {
    const name = String((asset && asset.nameKo) || (asset && asset.nameEn) || '').trim();
    const category = normalizeToken(asset && (asset.category || asset.categoryKo));
    const subject = name || '이 카드';
    const particle = getTopicParticle(subject);

    if (category === 'animal' || category === 'bird' || category === 'sea-animal' || category === 'insect') {
      return `${subject}${particle} 살아 있는 동물이에요. 눈과 귀로 주변을 살피고 움직이며 살아가요.`;
    }
    if (category === 'fruit' || category === 'vegetable' || category === 'food') {
      return `${subject}${particle} 먹을 수 있는 음식이에요. 씹어서 먹으면 몸에 힘을 주고 에너지를 채워 줘요.`;
    }
    if (category === 'clothing') {
      return `${subject}${particle} 몸에 입는 옷이에요. 날씨와 상황에 맞게 입으면 움직이기 편하고 몸을 지켜줘요.`;
    }
    if (category === 'electronics' || category === 'object' || category === 'tool') {
      return `${subject}${particle} 손으로 쓰는 물건이에요. 필요한 순간에 편리하게 도와줘요.`;
    }
    if (category === 'vehicle' || category === 'conveyance' || category === 'craft') {
      return `${subject}${particle} 이동할 때 타는 탈것이에요. 사람이나 짐을 옮기도록 도와줘요.`;
    }
    if (category === 'public-place' || category === 'livingspace' || category === 'recreation') {
      return `${subject}${particle} 사람들이 이용하거나 방문하는 장소예요. 쉬거나 놀거나 필요한 일을 하러 가요.`;
    }
    return `${subject}${particle} 카드예요. 카드 이름과 특징을 함께 이야기해 보세요.`;
  }

  function getCardDisplayDescription(asset) {
    const existing = String(asset && asset.descriptionKo || '').trim();
    if (isMeaningfulText(existing)) return existing;
    return getFallbackCardDescription(asset);
  }

  function normalizeStage(stage, index = 0) {
    const fallbackColor = STAGE_COLORS[index % STAGE_COLORS.length];
    return {
      id: String(stage?.id || `wordbuild-${String(index + 1).padStart(2, '0')}`),
      code: String(stage?.code || String(index + 1).padStart(2, '0')),
      band: String(stage?.band || (index < 2 ? '입문' : index < 5 ? '기초' : index < 8 ? '확장' : index < 10 ? '응용' : '고급')),
      title: String(stage?.title || `스테이지 ${String(index + 1).padStart(2, '0')}`),
      subtitle: String(stage?.subtitle || '단어를 골라 완성하는 스테이지입니다.'),
      detail: String(stage?.detail || '실사와 일러스트를 고르고 자모 블록으로 단어를 완성해요.'),
      questionCountMin: clamp(Number(stage?.questionCountMin || 6) || 6, 6, 12),
      questionCountMax: clamp(Number(stage?.questionCountMax || 12) || 12, 6, 12),
      defaultQuestionCount: clamp(Number(stage?.defaultQuestionCount || 8) || 8, 6, 12),
      wordIds: Array.isArray(stage?.wordIds) ? stage.wordIds.map((id) => String(id)).filter(Boolean) : [],
      wordCount: Number(stage?.wordCount || (Array.isArray(stage?.wordIds) ? stage.wordIds.length : 0)) || 0,
      accent: String(stage?.accent || fallbackColor.accent),
      soft: String(stage?.soft || fallbackColor.soft)
    };
  }

  function fallbackStages() {
    return Array.from({ length: 12 }, (_, index) => normalizeStage({
      id: `wordbuild-${String(index + 1).padStart(2, '0')}`,
      code: String(index + 1).padStart(2, '0'),
      band: index < 2 ? '입문' : index < 5 ? '기초' : index < 8 ? '확장' : index < 10 ? '응용' : '고급',
      title: `스테이지 ${String(index + 1).padStart(2, '0')}`,
      subtitle: '워크북 데이터를 불러오는 중입니다.',
      detail: '실사/일러스트 선택과 자모 블록 배치 화면의 뼈대를 먼저 보여줍니다.',
      wordIds: [],
      wordCount: 0
    }, index));
  }

  function getInitialStageId() {
    const hashStageId = (window.location.hash || '').replace(/^#/, '').trim();
    return STAGES.some((stage) => stage.id === hashStageId) ? hashStageId : STAGES[0].id;
  }

  function pickStage() {
    return STAGES.find((stage) => stage.id === state.selectedStageId) || STAGES[0];
  }

  function pickSelectionBackground() {
    return SELECTION_BACKGROUNDS[Math.floor(Math.random() * SELECTION_BACKGROUNDS.length)] || SELECTION_BACKGROUNDS[0];
  }

  function pickLearningBackground() {
    return LEARNING_BACKGROUNDS[Math.floor(Math.random() * LEARNING_BACKGROUNDS.length)] || LEARNING_BACKGROUNDS[0];
  }

  function setShellBackground(imagePath) {
    if (!imagePath || !document.documentElement || !document.documentElement.style) return;
    const value = `url('${imagePath}')`;
    document.documentElement.style.setProperty('--shell-page-bg', value);
    document.documentElement.style.setProperty('--shell-intro-bg', value);
  }

  function shuffle(list) {
    const arr = Array.isArray(list) ? list.slice() : [];
    for (let index = arr.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [arr[index], arr[swap]] = [arr[swap], arr[index]];
    }
    return arr;
  }

  function sample(list, count) {
    const arr = shuffle(list);
    return arr.slice(0, Math.max(0, Math.min(arr.length, count)));
  }

  function decomposeSyllable(char) {
    const code = String(char || '').charCodeAt(0);
    if (!code || code < 0xAC00 || code > 0xD7A3) return null;
    const offset = code - 0xAC00;
    const initialIndex = Math.floor(offset / 588);
    const medialIndex = Math.floor((offset % 588) / 28);
    const finalIndex = offset % 28;
    return {
      char,
      initial: INITIALS[initialIndex] || '',
      medial: MEDIALS[medialIndex] || '',
      final: FINALS[finalIndex] || ''
    };
  }

  function decomposeWord(word) {
    return Array.from(String(word || '')).map(decomposeSyllable).filter(Boolean);
  }

  function getWordById(id) {
    return WORD_MAP.get(String(id || '')) || null;
  }

  function getWordImagePath(word, mediaType) {
    if (!word) return '';
    return mediaType === 'illust'
      ? (word.illustPath || word.photoPath || '')
      : (word.photoPath || word.illustPath || '');
  }

  function getStagePreviewWord(stage, mediaType) {
    const pool = getStageWordPool(stage);
    return pool.find((word) => mediaType === 'illust' ? Boolean(word.illustPath) : Boolean(word.photoPath))
      || pool.find((word) => Boolean(getWordImagePath(word, mediaType)))
      || pool.find((word) => Boolean(word.photoPath || word.illustPath))
      || null;
  }

  function getStagePairedPreviewWord(stage) {
    return getStageWordPool(stage).find((word) => Boolean(word.photoPath && word.illustPath)) || null;
  }

  function composeHangul(initial, medial, final = '') {
    const initialIndex = INITIALS.indexOf(String(initial || ''));
    const medialIndex = MEDIALS.indexOf(String(medial || ''));
    const finalIndex = final ? FINALS.indexOf(String(final)) : 0;
    if (initialIndex < 0 || medialIndex < 0 || finalIndex < 0) {
      return String(initial || '') + String(medial || '') + String(final || '');
    }
    return String.fromCharCode(0xAC00 + ((initialIndex * 21) + medialIndex) * 28 + finalIndex);
  }

  function getQuestionCount(stage) {
    const min = clamp(Number(stage?.questionCountMin || 6) || 6, 6, 12);
    const max = clamp(Number(stage?.questionCountMax || 12) || 12, min, 12);
    const base = clamp(Number(stage?.defaultQuestionCount || 8) || 8, min, max);
    const wiggle = Math.random() < 0.5 ? -1 : 1;
    return clamp(base + wiggle, min, max);
  }

  function getStageLabel(stage) {
    return `${stage.band} ${stage.code}`;
  }

  function getStageWordPool(stage) {
    return (Array.isArray(stage?.wordIds) ? stage.wordIds : [])
      .map(getWordById)
      .filter(Boolean)
      .filter((word) => ALLOWED_WORD_CATEGORIES.has(normalizeCategoryLabel(word.categoryKo || word.category || '')));
  }

  function createQuestion(word, index) {
    const syllables = decomposeWord(word.nameKo);
    const slots = [];
    const pieces = [];
    syllables.forEach((syllable, syllableIndex) => {
      const parts = [
        { part: 'initial', value: syllable.initial },
        { part: 'medial', value: syllable.medial }
      ];
      if (syllable.final) {
        parts.push({ part: 'final', value: syllable.final });
      }
      parts.forEach((entry) => {
        const slotId = `${word.id}-q${index}-s${syllableIndex}-${entry.part}`;
        slots.push({
          id: slotId,
          syllableIndex,
          part: entry.part,
          expected: entry.value,
          label: syllable.char
        });
        pieces.push({
          id: `${slotId}-piece`,
          part: entry.part,
          value: entry.value,
          slotId
        });
      });
    });

    const desiredCountBase = Math.max(10, pieces.length + 6);
    const desiredCount = desiredCountBase % 2 === 0 ? desiredCountBase : desiredCountBase + 1;
    const distractors = buildDistractors(pieces, desiredCount - pieces.length);
    const bank = shuffle(pieces.concat(distractors));

    return {
      id: `${word.id}-question-${index}`,
      word,
      syllables,
      slots,
      bank,
      placement: {},
      responseAttempts: [],
      shownAtMs: null,
      solved: false
    };
  }

  function buildDistractors(correctPieces, desiredCount) {
    const used = new Set(correctPieces.map((piece) => `${piece.part}:${piece.value}`));
    const pool = [];
    INITIALS.forEach((value) => pool.push({ part: 'initial', value }));
    MEDIALS.forEach((value) => pool.push({ part: 'medial', value }));
    FINALS.filter(Boolean).forEach((value) => pool.push({ part: 'final', value }));
    return shuffle(pool.filter((piece) => !used.has(`${piece.part}:${piece.value}`))).slice(0, Math.max(0, Number(desiredCount || 0))).map((piece, index) => ({
      id: `distractor-${piece.part}-${piece.value}-${index}-${Date.now()}`,
      part: piece.part,
      value: piece.value,
      slotId: ''
    }));
  }

  function buildRun(stage) {
    const pool = getStageWordPool(stage);
    const questionCount = clamp(getQuestionCount(stage), 6, Math.min(12, pool.length || 6));
    const questions = sample(pool, questionCount).map((word, index) => createQuestion(word, index));
    return {
      id: `${stage.id}-${Date.now()}`,
      stage,
      questions,
      index: 0,
      current: null,
      correctCount: 0,
      wrongCount: 0,
      hintCount: 0,
      audioCount: 0,
      startedAtMs: Date.now(),
      saved: false
    };
  }

  function stopActiveAudio() {
    if (!activeAudio) return;
    try {
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (_error) {
      // ignore
    }
    activeAudio = null;
  }

  function stopCachedAudio() {
    audioCache.forEach((audio) => {
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
      } catch (_error) {
        // ignore
      }
    });
    activeAudio = null;
  }

  function cancelAudioSequence() {
    audioSequenceToken += 1;
    if (audioSequenceDelayTimer) {
      window.clearTimeout(audioSequenceDelayTimer);
      audioSequenceDelayTimer = null;
    }
  }

  function waitForAudioSequenceDelay(delayMs, token) {
    return new Promise((resolve) => {
      if (token !== audioSequenceToken) {
        resolve(false);
        return;
      }
      audioSequenceDelayTimer = window.setTimeout(() => {
        audioSequenceDelayTimer = null;
        resolve(token === audioSequenceToken);
      }, delayMs);
    });
  }

  function stopAudio() {
    cancelAudioSequence();
    clearAdvanceTimer();
    stopCachedAudio();
  }

  function clearAdvanceTimer() {
    if (!advanceTimer) return;
    window.clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  function isPiecePlaced(question, pieceId) {
    if (!question || !pieceId) return false;
    return Object.values(question.placement || {}).some((piece) => piece && piece.id === pieceId);
  }

  function vibrateWrong() {
    if (navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate([80, 40, 80]);
    }
  }

  function playAudio(path) {
    const normalized = String(path || '').trim();
    if (!normalized) return Promise.resolve(false);
    stopActiveAudio();
    let audio = audioCache.get(normalized);
    if (!audio) {
      audio = new Audio(normalized);
      audio.preload = 'auto';
      audioCache.set(normalized, audio);
    }
    activeAudio = audio;
    return new Promise((resolve) => {
      let finished = false;
      const finish = (success) => {
        if (finished) return;
        finished = true;
        if (activeAudio === audio) {
          activeAudio = null;
        }
        resolve(Boolean(success));
      };
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      try {
        audio.currentTime = 0;
        audio.play().catch(() => {
          finish(false);
        });
      } catch (_error) {
        finish(false);
      }
    });
  }

  function playSingleAudio(path) {
    cancelAudioSequence();
    clearAdvanceTimer();
    return playAudio(path);
  }

  async function playSequence(paths) {
    const list = Array.isArray(paths) ? paths.filter(Boolean) : [];
    if (!list.length) return false;
    stopAudio();
    const token = audioSequenceToken;
    for (let index = 0; index < list.length; index += 1) {
      if (token !== audioSequenceToken) return false;
      const played = await playAudio(list[index]);
      if (!played || token !== audioSequenceToken) return false;
      if (index < list.length - 1) {
        const delayCompleted = await waitForAudioSequenceDelay(160, token);
        if (!delayCompleted) return false;
      }
    }
    return true;
  }

  async function requestFullscreenMode() {
    return false;
  }

  async function exitFullscreenMode() {
    return false;
  }

  function spawnParticles(kind, targetElement, count) {
    const layerRect = effectLayer.getBoundingClientRect();
    const targetRect = (targetElement || effectLayer).getBoundingClientRect();
    const originX = targetRect.left + (targetRect.width / 2) - layerRect.left;
    const originY = targetRect.top + (targetRect.height / 2) - layerRect.top;
    const total = Math.max(8, Number(count || 14));
    const colors = kind === 'complete'
      ? ['#ffe17a', '#8fe0ff', '#f6a8ff', '#8fffb4']
      : kind === 'wrong'
        ? ['#ff7d7d', '#ffb4b4', '#ffd0d0']
        : ['#ffe182', '#ffd36d', '#fff4b0', '#96e1ff'];
    for (let index = 0; index < total; index += 1) {
      const particle = document.createElement('span');
      const angle = (Math.PI * 2 * index) / total + (Math.random() * 0.35);
      const distance = 42 + (Math.random() * 58);
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - (kind === 'wrong' ? 10 : 0);
      const size = kind === 'complete' ? (8 + Math.random() * 6) : (6 + Math.random() * 4);
      particle.className = `wordbuild-fx-particle is-${kind}`;
      particle.style.left = `${originX}px`;
      particle.style.top = `${originY}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = colors[index % colors.length];
      particle.style.setProperty('--tx', `${tx.toFixed(1)}px`);
      particle.style.setProperty('--ty', `${ty.toFixed(1)}px`);
      particle.style.setProperty('--rot', `${Math.round((Math.random() * 500) - 250)}deg`);
      particle.style.animationDelay = `${Math.random() * 90}ms`;
      effectLayer.appendChild(particle);
      window.setTimeout(() => particle.remove(), 1050);
    }
  }

  function pulseElement(element, className, timeout) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    window.setTimeout(() => element.classList.remove(className), timeout || 520);
  }

  function updateTopBar() {
    const stage = pickStage();
    helpButton.classList.toggle('shell-hidden', state.phase !== 'select');
    if (state.phase === 'select') {
      stageSelectButton.classList.add('shell-hidden');
      shellStageLabel.classList.add('shell-hidden');
      if (exitButton) exitButton.textContent = '학습 종료';
      document.title = PAGE_CONFIG.pageTitle || '단어 만들기';
      return;
    }
    stageSelectButton.classList.remove('shell-hidden');
    stageSelectButton.textContent = '스테이지 선택';
    shellStageLabel.textContent = `${stage.band} ${stage.code}`;
    shellStageLabel.classList.remove('shell-hidden');
    if (exitButton) exitButton.textContent = '학습 종료';
    document.title = `${PAGE_CONFIG.pageTitle || '단어 만들기'} · ${stage.title}`;
  }

  function renderStageCards() {
    stageGrid.innerHTML = STAGES.map((stage) => {
      const active = stage.id === state.selectedStageId;
      const style = `--stage-accent:${stage.accent};--stage-soft:${stage.soft};`;
      return '' +
        `<button type="button" class="wordbuild-stage-card" data-stage-id="${escapeHtml(stage.id)}" aria-pressed="${active ? 'true' : 'false'}" style="${style}">` +
        '  <div class="wordbuild-stage-top">' +
        `    <span class="wordbuild-stage-chip">${escapeHtml(stage.band)}</span>` +
        `    <span class="wordbuild-stage-code">${escapeHtml(stage.code)}</span>` +
        '  </div>' +
        '  <div class="wordbuild-stage-main">' +
        `    <div class="wordbuild-stage-name">${escapeHtml(stage.title)}</div>` +
        `    <div class="wordbuild-stage-detail">${escapeHtml(stage.subtitle)}</div>` +
        '  </div>' +
        '</button>';
    }).join('');

    stageGrid.querySelectorAll('.wordbuild-stage-card').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedStageId = button.getAttribute('data-stage-id') || state.selectedStageId;
        requestFullscreenMode();
        openIntro();
      });
    });
  }

  function renderTypeCards() {
    const stage = pickStage();
    const pairedPreviewWord = getStagePairedPreviewWord(stage);
    typeChoiceGrid.className = 'intro-options intro-options-inline intro-type-grid';
    typeChoiceGrid.innerHTML = TYPE_OPTIONS.map((type) => {
      const active = state.mediaType === type.id;
      const previewWord = pairedPreviewWord || getStagePreviewWord(stage, type.id);
      const previewImage = getWordImagePath(previewWord, type.id);
      const helper = String(type.helper || '');
      const accent = String(type.accent || '#ff9f1a');
      const shadow = type.id === 'illust' ? '#2b90d9' : '#df9d1a';
      const imageMarkup = previewImage
        ? `<img class="intro-option-image wordbuild-type-preview-image" src="${escapeHtml(previewImage)}" alt="${escapeHtml(type.label)} 대표 이미지">`
        : '<div class="wordbuild-type-preview-placeholder" aria-hidden="true"></div>';
      return '' +
        `<button type="button" class="intro-option-card wordbuild-type-choice-card" data-type-id="${escapeHtml(type.id)}" aria-pressed="${active ? 'true' : 'false'}" style="--type-accent: ${escapeHtml(accent)}; --type-shadow: ${escapeHtml(shadow)};">` +
        '  <div class="intro-option-media wordbuild-type-preview">' +
        '    <div class="intro-option-burst" aria-hidden="true"></div>' +
        imageMarkup +
        '  </div>' +
        '  <div class="intro-option-top">' +
        `    <div class="intro-option-name">${escapeHtml(type.label)}</div>` +
        `    <div class="intro-option-desc">${escapeHtml(helper)}</div>` +
        '  </div>' +
        '</button>';
    }).join('');

    typeChoiceGrid.querySelectorAll('.intro-option-card').forEach((button) => {
      button.addEventListener('click', () => {
        state.mediaType = button.getAttribute('data-type-id') || TYPE_OPTIONS[0].id;
        startStage();
      });
    });
  }

  function renderIntro() {
    const stage = pickStage();
    introStageBadge.textContent = '';
    introStageBadge.classList.add('shell-hidden');
    introStageTitle.textContent = stage.title;
    introStageTitle.classList.remove('shell-hidden');
    introStageSubtitle.textContent = '';
    introStageSubtitle.classList.add('shell-hidden');
    introStageDescription.textContent = '실사 또는 일러스트를 선택하세요.';
    introStageDescription.classList.remove('shell-hidden');
    renderTypeCards();
  }

  function renderBuildHeader() {
    progressChip.textContent = '';
    progressChip.classList.add('shell-hidden');
  }

  function renderMedia() {
    const question = state.run?.current;
    const word = question?.word || null;
    if (!word) {
      buildMediaTag.classList.add('shell-hidden');
      buildMediaContent.innerHTML = '';
      return;
    }
    const imagePath = getWordImagePath(word, state.mediaType);
    buildMediaTag.textContent = word.categoryKo || '카테고리';
    buildMediaTag.classList.remove('shell-hidden');
    buildMediaLabel.textContent = word.categoryKo || '단어 카드';
    buildMediaDescription.textContent = '이미지를 보고 오른쪽의 빈칸을 완성해 보세요.';
    buildMediaCaption.textContent = '';
    buildMediaContent.innerHTML = imagePath
      ? `<img class="wordbuild-media-image" src="${escapeHtml(imagePath)}" alt="${escapeHtml(word.nameKo)}">`
      : '<div class="wordbuild-media-placeholder"><div class="wordbuild-media-placeholder-icon" aria-hidden="true"></div><div class="wordbuild-media-placeholder-title">이미지 준비중</div></div>';
  }

  function renderSyllableBoard() {
    const question = state.run?.current;
    if (!question) {
      syllableRail.innerHTML = '';
      return;
    }
    const nextSlot = getNextEmptySlot(question);
    syllableRail.innerHTML = question.syllables.map((syllable, syllableIndex) => {
      const progress = { initial: '', medial: '', final: '' };
      question.slots
        .filter((item) => item.syllableIndex === syllableIndex)
        .forEach((slot) => {
          const piece = question.placement[slot.id];
          if (piece) progress[slot.part] = piece.value;
        });
      const displayValue = progress.initial && progress.medial
        ? composeHangul(progress.initial, progress.medial, progress.final || '')
        : (progress.initial || progress.medial || '');
      const isActive = nextSlot && nextSlot.syllableIndex === syllableIndex;
      const isComplete = question.slots
        .filter((item) => item.syllableIndex === syllableIndex)
        .every((slot) => Boolean(question.placement[slot.id]));
      const isSolved = Boolean(question.solved);
      return '' +
        `<button type="button" class="wordbuild-word-slot ${isActive ? 'is-active' : ''} ${isComplete || isSolved ? 'is-solved' : ''}" data-syllable-index="${syllableIndex}">` +
        `  <div class="wordbuild-word-slot-value">${escapeHtml(displayValue)}</div>` +
        '</button>';
    }).join('');

    syllableRail.querySelectorAll('.wordbuild-word-slot').forEach((slot) => {
      slot.addEventListener('dragover', (event) => {
        event.preventDefault();
        slot.classList.add('is-drop-target');
      });
      slot.addEventListener('dragleave', () => {
        slot.classList.remove('is-drop-target');
      });
      slot.addEventListener('drop', (event) => {
        event.preventDefault();
        slot.classList.remove('is-drop-target');
        const question = state.run?.current;
        if (!question || question.solved) return;
        const nextSlot = getNextEmptySlot(question);
        if (!nextSlot) return;
        const boxIndex = Number(slot.getAttribute('data-syllable-index') || '-1');
        if (boxIndex !== nextSlot.syllableIndex) {
          question.responseAttempts.push({ kind: 'wrong-target', response: boxIndex, expectedResponse: nextSlot.syllableIndex, correct: false, elapsedMs: Date.now() - question.shownAtMs });
          state.run.wrongCount += 1;
          vibrateWrong();
          playSequence([AUDIO_FILES.wrong]);
          pulseElement(slot, 'is-wrong', 420);
          return;
        }
        const pieceId = String(event.dataTransfer?.getData('text/plain') || '');
        if (!pieceId) return;
        const piece = question.bank.find((item) => item.id === pieceId);
        if (!piece) return;
        handlePiecePlacement(piece, nextSlot, slot);
      });
    });
  }

  function getNextEmptySlot(question) {
    if (!question) return null;
    return question.slots.find((slot) => !question.placement[slot.id]) || null;
  }

  function handlePiecePlacement(piece, slot, feedbackElement) {
    const question = state.run?.current;
    if (!question || question.solved || !piece || !slot) return false;
    question.responseAttempts.push({ slotId: slot.id, response: piece.value, expectedResponse: slot.expected, correct: piece.value === slot.expected, elapsedMs: Date.now() - question.shownAtMs });
    // 동일한 자모가 여러 장 보일 때는 part가 달라도 같은 글자면 허용한다.
    if (piece.value !== slot.expected) {
      state.run.wrongCount += 1;
      vibrateWrong();
      playSequence([AUDIO_FILES.wrong]);
      if (feedbackElement && feedbackElement.classList && feedbackElement.classList.contains('wordbuild-choice-card')) {
        pulseElement(feedbackElement, 'is-wrong', 420);
      }
      pulseElement(feedbackElement || choiceBoard, 'is-wrong', 420);
      return false;
    }

    question.placement[slot.id] = piece;
    state.selectedPieceId = piece.id;
    renderBuild();
    if (isQuestionComplete(question)) {
      completeQuestion();
    }
    return true;
  }

  function handlePieceTap(button) {
    const question = state.run?.current;
    if (!question || question.solved) return;
    const pieceId = String(button.getAttribute('data-piece-id') || '');
    const piece = question.bank.find((item) => item.id === pieceId);
    if (!piece || isPiecePlaced(question, piece.id)) return;
    const nextSlot = getNextEmptySlot(question);
    if (!nextSlot) return;
    handlePiecePlacement(piece, nextSlot, button);
  }

  function renderChoiceBoard() {
    const question = state.run?.current;
    if (!question) {
      choiceBoard.innerHTML = '';
      selectionChip.textContent = '';
      return;
    }
    const columnCount = Math.min(4, Math.max(3, Math.ceil(question.bank.length / 3)));
    choiceBoard.style.gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`;
    choiceBoard.innerHTML = question.bank.map((piece) => {
      const placed = isPiecePlaced(question, piece.id);
      const selected = state.selectedPieceId === piece.id;
      return '' +
        `<button type="button" class="wordbuild-choice-card ${placed ? 'is-placed' : ''} ${selected ? 'is-selected' : ''}" data-piece-id="${escapeHtml(piece.id)}" data-piece-part="${escapeHtml(piece.part)}" data-piece-value="${escapeHtml(piece.value)}" ${placed ? 'disabled' : ''} draggable="${placed ? 'false' : 'true'}">` +
        `  ${escapeHtml(piece.value)}` +
        '</button>';
    }).join('');

    choiceBoard.querySelectorAll('.wordbuild-choice-card').forEach((button) => {
      button.addEventListener('dragstart', (event) => {
        if (button.disabled) {
          event.preventDefault();
          return;
        }
        const pieceId = button.getAttribute('data-piece-id') || '';
        event.dataTransfer?.setData('text/plain', pieceId);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      });
      button.addEventListener('dragend', () => {
        choiceBoard.querySelectorAll('.is-drop-target').forEach((slot) => slot.classList.remove('is-drop-target'));
      });
      button.addEventListener('click', () => {
        if (button.disabled) return;
        handlePieceTap(button);
      });
    });

    renderSelectionChip();
  }

  function renderSelectionChip() {
    selectionChip.textContent = '';
  }

  function renderHintPanel() {
    const question = state.run?.current;
    if (!question) {
      hintPanel.classList.add('is-hidden');
      return;
    }
    const word = question.word;
    hintCopy.innerHTML = '' +
      `<div class="wordbuild-toast-syllables">${renderAnswerPreview(question)}</div>` +
      `<div class="wordbuild-toast-subcopy">글자를 보고 차례대로 채워보세요.</div>`;
    hintPanel.classList.toggle('is-hidden', !state.hintOpen);
  }

  function renderRevealPanel() {
    answerRevealPanel.classList.add('is-hidden');
    answerTitle.textContent = '';
    answerDescription.textContent = '';
  }

  function closeAnswerModal() {
    state.answerModalOpen = false;
    answerModal.classList.remove('is-active');
    answerModal.setAttribute('aria-hidden', 'true');
  }

  function openAnswerModal(question) {
    if (!question || !question.word) return;
    const description = getCardDisplayDescription(question.word);
    state.answerModalOpen = true;
    answerModalTitle.textContent = question.word.nameKo || '정답';
    answerModalDescription.textContent = description;
    answerModalNextButton.textContent = state.run && state.run.index < state.run.questions.length - 1 ? '다음 문제' : '학습 결과 보기';
    answerModal.classList.add('is-active');
    answerModal.setAttribute('aria-hidden', 'false');
  }

  function renderBuild() {
    const question = state.run?.current;
    renderBuildHeader();
    renderMedia();
    renderSyllableBoard();
    renderChoiceBoard();
    renderHintPanel();
    renderRevealPanel();
    if (!question) return;
    const word = question.word;
    buildMediaDescription.textContent = '이미지를 보고 오른쪽의 빈칸을 완성해 보세요.';
    buildMediaCaption.textContent = '';
    hintToggleButton.setAttribute('aria-pressed', state.hintOpen ? 'true' : 'false');
    answerModal.classList.toggle('is-active', state.answerModalOpen);
    answerModal.setAttribute('aria-hidden', state.answerModalOpen ? 'false' : 'true');
  }

  function renderComplete() {
    const run = state.run;
    if (!run) return;
    persistCompletedRun(run);
    const stage = run.stage;
    completeTitle.textContent = `${stage.title} 완료!`;
    completeSummary.textContent = `총 ${run.questions.length}문제 중 정답 ${run.correctCount}개 · 힌트 ${run.hintCount}회 · 오디오 ${run.audioCount}회 · 오답 ${run.wrongCount}번`;
    completeStageLabel.textContent = `${stage.band} ${stage.code}`;
    completeHintCount.textContent = `${run.hintCount}회`;
    completeAudioCount.textContent = `${run.audioCount}회`;
    if (!completionFxPlayed) {
      completionFxPlayed = true;
      pulseElement(completeView.querySelector('.wordbuild-complete-hero'), 'is-complete-bounce', 900);
      spawnParticles('complete', completeView, 22);
      playSequence([AUDIO_FILES.complete]);
    }
  }

  function setView(phase) {
    state.phase = phase;
    const isSelect = phase === 'select';
    const isIntro = phase === 'intro';
    const isBuild = phase === 'build';
    const isComplete = phase === 'complete';
    const isSelectionPhase = isSelect || isIntro;
    const showCenter = isBuild || isComplete;

    stageSelectView.classList.toggle('is-active', isSelect);
    stageSelectView.classList.toggle('is-hidden', !isSelect);
    introView.classList.toggle('is-active', isIntro);
    introView.classList.toggle('is-hidden', !isIntro);
    buildView.classList.toggle('is-active', isBuild);
    buildView.classList.toggle('is-hidden', !isBuild);
    completeView.classList.toggle('is-active', isComplete);
    completeView.classList.toggle('is-hidden', !isComplete);
    if (shellTopbarCenter) {
      shellTopbarCenter.classList.toggle('shell-hidden', !showCenter);
    }
    if (!isBuild) {
      closeAnswerModal();
    }

    if (isSelectionPhase) {
      state.selectionBackground = state.selectionBackground || pickSelectionBackground();
      setShellBackground(state.selectionBackground);
    } else {
      state.learningBackground = state.learningBackground || pickLearningBackground();
      setShellBackground(state.learningBackground);
    }

    updateTopBar();

    if (isSelect) {
      renderStageCards();
    } else if (isIntro) {
      renderIntro();
    } else if (isBuild) {
      renderBuild();
    } else if (isComplete) {
      renderComplete();
    }
  }

  function openIntro() {
    stopAudio();
    state.hintOpen = false;
    state.answerOpen = false;
    closeAnswerModal();
    state.selectedPieceId = '';
    state.run = null;
    setView('intro');
  }

  function startStage() {
    stopAudio();
    clearAdvanceTimer();
    if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
    requestFullscreenMode();
    const stage = pickStage();
    if (!stage) return;
    const run = buildRun(stage);
    state.run = run;
    state.hintOpen = false;
    state.answerOpen = false;
    closeAnswerModal();
    state.selectedPieceId = '';
    completionFxPlayed = false;
    state.learningBackground = pickLearningBackground();
    run.current = run.questions[0] || null;
    if (run.current) run.current.shownAtMs = Date.now();
    setView('build');
    history.replaceState(null, '', `#${stage.id}`);
  }

  function loadNextQuestion() {
    if (!state.run) return;
    stopAudio();
    clearAdvanceTimer();
    if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
    state.selectedPieceId = '';
    state.hintOpen = false;
    state.answerOpen = false;
    closeAnswerModal();
    state.run.index += 1;
    if (state.run.index >= state.run.questions.length) {
      state.run = {
        ...state.run,
        current: null
      };
      setView('complete');
      return;
    }
    completionFxPlayed = false;
    state.run.current = state.run.questions[state.run.index];
    state.run.current.shownAtMs = Date.now();
    state.run.current.placement = {};
    state.run.current.solved = false;
    setView('build');
  }

  function restartStage() {
    stopAudio();
    const stage = pickStage();
    if (!stage) return;
    state.selectedStageId = stage.id;
    startStage();
  }

  function goToSelection() {
    stopAudio();
    clearAdvanceTimer();
    if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
    state.run = null;
    state.hintOpen = false;
    state.answerOpen = false;
    closeAnswerModal();
    state.selectedPieceId = '';
    state.selectionBackground = pickSelectionBackground();
    setView('select');
  }

  function openConfirmModal(action) {
    stopAudio();
    state.pendingModalAction = action;
    if (action === 'exit') {
      confirmModalTitle.textContent = '학습 종료';
      confirmModalDesc.textContent = '현재 학습을 끝내고 이전 페이지로 돌아갈까요?';
      confirmModalOk.textContent = '종료';
    } else {
      confirmModalTitle.textContent = '스테이지 선택';
      confirmModalDesc.textContent = '현재 학습을 끝내고 스테이지 목록으로 돌아갈까요?';
      confirmModalOk.textContent = '스테이지 선택';
    }
    confirmModal.classList.add('is-active');
    confirmModal.setAttribute('aria-hidden', 'false');
  }

  function closeConfirmModal() {
    state.pendingModalAction = '';
    confirmModal.classList.remove('is-active');
    confirmModal.setAttribute('aria-hidden', 'true');
  }

  function goBackToPreviousPage() {
    exitFullscreenMode();
    clearAdvanceTimer();
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    if (document.referrer) {
      window.location.href = document.referrer;
      return;
    }
    window.location.href = '../class-new.html';
  }

  function handleHashChange() {
    const nextStageId = (window.location.hash || '').replace(/^#/, '').trim();
    if (!nextStageId || !STAGES.some((stage) => stage.id === nextStageId)) return;
    state.selectedStageId = nextStageId;
    if (state.phase === 'select') {
      renderStageCards();
    }
  }

  function shouldAutoStartFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      return params.get('autostart') === '1'
        || params.get('cardlabLaunch') === '1'
        || params.get('launch') === '1';
    } catch (_error) {
      return false;
    }
  }

  function showMeaningToast(word, meaning, context = {}) {
    const resolvedMeaning = window.CardlabMeaningResolver && typeof window.CardlabMeaningResolver.resolve === 'function'
      ? window.CardlabMeaningResolver.resolve(word, context)
      : '';
    if (window.CardlabMeaningToast && typeof window.CardlabMeaningToast.show === 'function') {
      window.CardlabMeaningToast.show({ word, meaning: resolvedMeaning || meaning });
    }
  }

  function isQuestionComplete(question) {
    return question.slots.every((slot) => Boolean(question.placement[slot.id]));
  }

  async function completeQuestion() {
    const run = state.run;
    const question = run?.current;
    if (!run || !question || question.solved) return;
    question.solved = true;
    question.completedAtMs = Date.now();
    run.correctCount += 1;
    state.answerOpen = true;
    state.hintOpen = false;
    pulseElement(buildView.querySelector('.wordbuild-lesson'), 'is-complete-bounce', 900);
    spawnParticles('correct', buildView, 16);
    run.audioCount += 1;
    clearAdvanceTimer();
    renderBuild();
    const scheduleAutoContinue = (delayMs) => {
      clearAdvanceTimer();
      advanceTimer = window.setTimeout(() => {
        advanceTimer = null;
        if (!state.run || state.run.current !== question || !question.solved) return;
        continueAfterAnswerModal();
      }, delayMs);
    };
    void playSequence([AUDIO_FILES.correct, question.word.nameSoundPath].filter(Boolean)).finally(() => {
      if (!state.run || state.run.current !== question || !question.solved) return;
      scheduleAutoContinue(520);
    });
    scheduleAutoContinue(1900);
  }

  function continueAfterAnswerModal() {
    if (!state.run) return;
    stopAudio();
    closeAnswerModal();
    if (state.run.index < state.run.questions.length - 1) {
      loadNextQuestion();
      return;
    }
    state.run.current = null;
    setView('complete');
  }

  function persistCompletedRun(run) {
    const harness = window.HahaLabLearningHarness;
    if (run.saved || !run.questions.length || !run.questions.every(question => question.solved) || typeof harness?.recordSession !== 'function') return;
    const context = harness.readLaunchContext?.();
    if (!context?.teacherId || !context?.clientId) return;
    const completedAtMs = Date.now();
    const questionLogs = run.questions.map((question, index) => ({
      questionId: question.id, order: index + 1, targetWord: question.word.nameKo,
      expectedResponse: question.slots.map(slot => slot.expected).join(''),
      stimulus: { wordId: question.word.id, word: question.word.nameKo, slots: question.slots.map(slot => ({ id: slot.id, expected: slot.expected, syllableIndex: slot.syllableIndex })) },
      response: question.slots.map(slot => question.placement[slot.id]?.value || '').join(''),
      correct: question.solved,
      wrongAttempts: question.responseAttempts.filter(attempt => !attempt.correct).length,
      responseAttempts: question.responseAttempts.map(attempt => ({ ...attempt })),
      durationMs: question.completedAtMs - question.shownAtMs,
      timingKind: 'question-elapsed-including-piece-placement-and-retries', timingSource: 'browser-wall-clock'
    }));
    const total = questionLogs.length;
    const firstTry = questionLogs.filter(log => !log.wrongAttempts).length;
    const record = harness.recordSession({
      sessionId: `wordbuild-${run.id}`, labKind: 'cardlab', reportScope: 'playlab', saveToClientReport: true,
      curriculumKey: 'cardlab-wordbuild', labTitle: '자모로 단어 만들기', stageKey: run.stage.id, stageTitle: run.stage.title,
      totalQuestions: total, correctCount: run.correctCount, wrongCount: run.wrongCount,
      score: Math.round(run.correctCount / total * 100), accuracyScore: Math.round(run.correctCount / total * 100),
      startedAtMs: run.startedAtMs, durationSeconds: (completedAtMs - run.startedAtMs) / 1000,
      reportType: 'cardlab-wordbuild-observed',
      reportInput: {
        reportEvidenceMode: 'observed-only', reportType: 'cardlab-wordbuild-observed', reportScope: 'playlab',
        title: '자모로 단어 만들기', stageTitle: run.stage.title,
        totalItems: total, correctCount: run.correctCount, wrongCount: run.wrongCount,
        accuracyRate: Math.round(run.correctCount / total * 100), firstTryRate: Math.round(firstTry / total * 100),
        elapsedMs: completedAtMs - run.startedAtMs, startedAtMs: run.startedAtMs, completedAtMs, questionLogs,
        measurementContext: { taskVersion: '20261104-wordbuild-completion-1', timingKind: 'question-elapsed-including-piece-placement-and-retries', wrongCountKind: 'wrong-placement-attempts' }
      },
      questionSnapshot: questionLogs,
      details: { question_logs: questionLogs, wrong_attempt_count: run.wrongCount, wrong_count_kind: 'wrong-placement-attempts', first_try_correct_count: firstTry, task_version: '20261104-wordbuild-completion-1' }
    });
    if (record) run.saved = true;
  }

  function playCurrentWordAudio() {
    const question = state.run?.current;
    if (!question) return;
    state.run.audioCount += 1;
    playSingleAudio(question.word.nameSoundPath);
    pulseElement(audioHintButton, 'is-audio-pulse', 420);
  }

  function playCurrentDescriptionAudio() {
    const question = state.run?.current;
    if (!question) return;
    state.run.audioCount += 1;
    playSingleAudio(question.word.descriptionSoundPath);
  }

  function handleModalAudioTextKeydown(event, playHandler) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    playHandler();
  }

  function renderAnswerPreview(question) {
    if (!question?.word) return '';
    return `<span class="wordbuild-answer-word">${escapeHtml(question.word.nameKo || '')}</span>`;
  }

  function bindStaticEvents() {
    stageSelectButton.addEventListener('click', () => openConfirmModal('list'));
    if (exitButton) {
      exitButton.addEventListener('click', () => openConfirmModal('exit'));
    }
    introBackButton.addEventListener('click', goToSelection);
    completeStageButtonBack.textContent = '다른 단계 선택하기';
    completeRetryButton.textContent = '현재 단계 다시 풀기';
    completeStageButtonBack.addEventListener('click', goToSelection);
    completeRetryButton.addEventListener('click', restartStage);
    hintToggleButton.addEventListener('click', () => {
      if (!state.run?.current) return;
      state.hintOpen = !state.hintOpen;
      if (state.hintOpen) state.run.hintCount += 1;
      renderBuild();
    });
    hintToastClose.addEventListener('click', () => {
      if (!state.run?.current) return;
      state.hintOpen = false;
      renderBuild();
    });
    audioHintButton.addEventListener('click', () => {
      if (!state.run?.current) return;
      playCurrentWordAudio();
    });
    answerModalWordAudioButton.addEventListener('click', () => {
      if (!state.run?.current) return;
      playCurrentWordAudio();
    });
    answerModalTitle.setAttribute('role', 'button');
    answerModalTitle.setAttribute('tabindex', '0');
    answerModalTitle.setAttribute('aria-label', '단어 이름 듣기');
    answerModalTitle.addEventListener('click', () => {
      if (!state.run?.current || !state.answerModalOpen) return;
      playCurrentWordAudio();
    });
    answerModalTitle.addEventListener('keydown', (event) => {
      handleModalAudioTextKeydown(event, () => {
        if (!state.run?.current || !state.answerModalOpen) return;
        playCurrentWordAudio();
      });
    });
    answerModalDescriptionAudioButton.addEventListener('click', () => {
      if (!state.run?.current) return;
      playCurrentDescriptionAudio();
    });
    answerModalDescription.setAttribute('role', 'button');
    answerModalDescription.setAttribute('tabindex', '0');
    answerModalDescription.setAttribute('aria-label', '단어 설명 듣기');
    answerModalDescription.addEventListener('click', () => {
      if (!state.run?.current || !state.answerModalOpen) return;
      playCurrentDescriptionAudio();
    });
    answerModalDescription.addEventListener('keydown', (event) => {
      handleModalAudioTextKeydown(event, () => {
        if (!state.run?.current || !state.answerModalOpen) return;
        playCurrentDescriptionAudio();
      });
    });
    answerModalNextButton.addEventListener('click', () => {
      continueAfterAnswerModal();
    });
    answerTitle.addEventListener('click', () => {
      if (!state.run?.current) return;
      playCurrentWordAudio();
    });
    answerDescription.addEventListener('click', () => {
      if (!state.run?.current) return;
      playCurrentDescriptionAudio();
    });
    confirmModalOk.addEventListener('click', () => {
      const action = state.pendingModalAction || 'exit';
      closeConfirmModal();
      if (action === 'list') {
        goToSelection();
        return;
      }
      goBackToPreviousPage();
    });
    confirmModalCancel.addEventListener('click', closeConfirmModal);
    confirmModal.addEventListener('click', (event) => {
      if (event.target && event.target.hasAttribute('data-modal-close')) {
        closeConfirmModal();
      }
    });
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeConfirmModal();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAudio();
    });
    window.addEventListener('pagehide', stopAudio, { passive: true });
  }

  function initFromStageSelection() {
    state.selectionBackground = pickSelectionBackground();
    state.learningBackground = pickLearningBackground();
    renderStageCards();
    updateTopBar();
    setShellBackground(state.selectionBackground);
    setView('select');
    if (shouldAutoStartFromUrl()) {
      openIntro();
    }
  }

  bindStaticEvents();

  state.selectedStageId = getInitialStageId();
  initFromStageSelection();

  stageGrid.addEventListener('click', () => {
    // stage card handlers are attached inside renderStageCards
  });

  if (shouldAutoStartFromUrl()) {
    const stage = pickStage();
    if (stage) {
      openIntro();
      startStage();
    }
  }

  // Expose helpers for debugging and future tweaks.
  window.CARDLAB_WORDBUILD_DEBUG = {
    stages: STAGES,
    words: WORDS
  };

  renderStageCards();
  updateTopBar();
  setView('select');
  } catch (error) {
    console.error(error);
    const stageGrid = document.getElementById('stageGrid');
    if (stageGrid) {
      stageGrid.innerHTML = '<div class="wordbuild-error-box"><strong>단어 만들기 초기화 실패</strong><div>' + String(error && error.message ? error.message : error) + '</div></div>';
    }
    window.CARDLAB_WORDBUILD_DEBUG = {
      stages: [],
      words: [],
      error: String(error && error.stack ? error.stack : error)
    };
  }
})();
