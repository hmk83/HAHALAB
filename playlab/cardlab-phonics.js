(function () {
  'use strict';

  const stages = [
    { id: 'phonics-01', code: '01', band: '도입', descriptor: 'ㅏ 찾기', criteria: [{ type: 'medial', value: 'ㅏ' }], color: 'ffb347', soft: 'rgba(255, 179, 71, 0.16)' },
    { id: 'phonics-02', code: '02', band: '도입', descriptor: 'ㅗ 찾기', criteria: [{ type: 'medial', value: 'ㅗ' }], color: 'ffad5f', soft: 'rgba(255, 173, 95, 0.16)' },
    { id: 'phonics-03', code: '03', band: '기초', descriptor: 'ㅓ · ㅜ 찾기', criteria: [{ type: 'medial', value: 'ㅓ' }, { type: 'medial', value: 'ㅜ' }], color: '7ad7a8', soft: 'rgba(122, 215, 168, 0.16)' },
    { id: 'phonics-04', code: '04', band: '기초', descriptor: 'ㅡ · ㅣ 찾기', criteria: [{ type: 'medial', value: 'ㅡ' }, { type: 'medial', value: 'ㅣ' }], color: '66c6ff', soft: 'rgba(102, 198, 255, 0.16)' },
    { id: 'phonics-05', code: '05', band: '확장', descriptor: 'ㄱ · ㄴ 찾기', criteria: [{ type: 'initial', value: 'ㄱ' }, { type: 'initial', value: 'ㄴ' }], color: '8f86ff', soft: 'rgba(143, 134, 255, 0.16)' },
    { id: 'phonics-06', code: '06', band: '확장', descriptor: 'ㅁ · ㅂ · ㅅ 찾기', criteria: [{ type: 'initial', value: 'ㅁ' }, { type: 'initial', value: 'ㅂ' }, { type: 'initial', value: 'ㅅ' }], color: '6fc7ff', soft: 'rgba(111, 199, 255, 0.16)' },
    { id: 'phonics-07', code: '07', band: '응용', descriptor: 'ㄴ · ㅁ · ㅇ 찾기', criteria: [{ type: 'final', value: 'ㄴ' }, { type: 'final', value: 'ㅁ' }, { type: 'final', value: 'ㅇ' }], color: 'ff95b7', soft: 'rgba(255, 149, 183, 0.16)' },
    { id: 'phonics-08', code: '08', band: '응용', descriptor: 'ㄱ · ㄹ · ㅂ 찾기', criteria: [{ type: 'final', value: 'ㄱ' }, { type: 'final', value: 'ㄹ' }, { type: 'final', value: 'ㅂ' }], color: 'ffb273', soft: 'rgba(255, 178, 115, 0.16)' },
    { id: 'phonics-09', code: '09', band: '심화', descriptor: 'ㅐ · ㅔ 찾기', criteria: [{ type: 'medial', value: 'ㅐ' }, { type: 'medial', value: 'ㅔ' }], color: 'b68cff', soft: 'rgba(182, 140, 255, 0.16)' },
    { id: 'phonics-10', code: '10', band: '심화', descriptor: 'ㅘ · ㅝ · ㅟ 찾기', criteria: [{ type: 'medial', value: 'ㅘ' }, { type: 'medial', value: 'ㅝ' }, { type: 'medial', value: 'ㅟ' }], color: '83d6ff', soft: 'rgba(131, 214, 255, 0.16)' },
    { id: 'phonics-11', code: '11', band: '심화', descriptor: 'ㄲ · ㄸ · ㅃ · ㅆ · ㅉ 찾기', criteria: [{ type: 'initial', value: 'ㄲ' }, { type: 'initial', value: 'ㄸ' }, { type: 'initial', value: 'ㅃ' }, { type: 'initial', value: 'ㅆ' }, { type: 'initial', value: 'ㅉ' }], color: 'f48bd1', soft: 'rgba(244, 139, 209, 0.16)' },
    { id: 'phonics-12', code: '12', band: '종합', descriptor: '종합 찾기', criteria: 'mixed', color: 'f3bf4b', soft: 'rgba(243, 191, 75, 0.16)' }
  ];

  const stageSelectView = document.getElementById('stageSelectView');
  const lessonView = document.getElementById('lessonView');
  const completeView = document.getElementById('completeView');
  const stageGrid = document.getElementById('stageGrid');
  const targetGlyph = document.getElementById('targetGlyph');
  const helpButton = document.getElementById('helpButton');
  const questionPhrase = document.getElementById('questionPhrase');
  const slotBoard = document.getElementById('slotBoard');
  const choiceBoard = document.getElementById('choiceBoard');
  const effectLayer = document.getElementById('phonicsEffectLayer');
  const listButton = document.getElementById('listButton');
  const exitButton = document.getElementById('exitButton');
  const completeScoreText = document.getElementById('completeScoreText');
  const completeSummaryText = document.getElementById('completeSummaryText');
  const completeStageLabel = document.getElementById('completeStageLabel');
  const completeCorrectCount = document.getElementById('completeCorrectCount');
  const completeWrongCount = document.getElementById('completeWrongCount');
  const completeStageButton = document.getElementById('completeStageButton');
  const completeRetryButton = document.getElementById('completeRetryButton');
  const confirmModal = document.getElementById('confirmModal');
  const confirmModalTitle = document.getElementById('confirmModalTitle');
  const confirmModalDesc = document.getElementById('confirmModalDesc');
  const confirmModalOk = document.getElementById('confirmModalOk');
  const confirmModalCancel = document.getElementById('confirmModalCancel');

  if (!stageSelectView || !lessonView || !completeView || !stageGrid || !targetGlyph || !questionPhrase || !slotBoard || !choiceBoard || !effectLayer || !listButton || !helpButton || !completeScoreText || !completeSummaryText || !completeStageLabel || !completeCorrectCount || !completeWrongCount || !completeStageButton || !completeRetryButton || !confirmModal || !confirmModalTitle || !confirmModalDesc || !confirmModalOk || !confirmModalCancel) {
    return;
  }

  const PHONICS_SYLLABLE_BANK = Array.from(new Set([
    '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하', '까', '따', '빠', '싸', '짜', '야',
    '고', '노', '도', '로', '모', '보', '소', '오', '조', '초', '코', '토', '포', '호', '꼬', '또', '뽀', '쏘', '쪼',
    '거', '너', '더', '러', '머', '버', '서', '어', '저', '처', '커', '터', '퍼', '허', '꺼', '떠', '뻐', '써', '쩌',
    '구', '누', '두', '루', '무', '부', '수', '우', '주', '추', '쿠', '투', '푸', '후', '꾸', '뚜', '뿌', '쑤', '쭈',
    '그', '느', '드', '르', '므', '브', '스', '으', '즈', '츠', '크', '트', '프', '흐',
    '기', '니', '디', '리', '미', '비', '시', '이', '지', '치', '키', '티', '피', '히',
    '개', '내', '대', '래', '매', '배', '새', '애', '재', '채', '캐', '태', '패', '해',
    '게', '네', '데', '레', '메', '베', '세', '에', '제', '체', '케', '테', '페', '헤',
    '과', '와', '화', '꽈', '좌', '봐',
    '워', '원', '월', '궈', '줘', '뭐',
    '위', '귀', '뒤', '쉬', '휘', '뉘', '뮈', '쥐',
    '간', '건', '곤', '군', '근', '난', '넌', '논', '눈', '단', '던', '돈', '둔', '란', '런', '론', '룬', '만', '먼', '문', '산', '선', '안', '잔', '찬', '천', '탄', '한',
    '감', '검', '곰', '금', '김', '담', '덤', '돔', '듬', '람', '럼', '름', '맘', '멈', '몸', '뭄', '밤', '범', '봄', '붐', '삼', '섬', '솜', '숨', '암', '엄', '움', '잠', '점', '춤',
    '강', '경', '공', '궁', '광', '꽝', '냉', '농', '당', '동', '랑', '롱', '망', '멍', '몽', '방', '봉', '붕', '상', '생', '성', '송', '숭', '앙', '영', '옹', '웅', '장', '종', '중', '청', '총', '충', '칭', '퉁', '풍', '흥', '빵', '짱',
    '각', '걱', '곡', '국', '극', '녹', '덕', '독', '득', '락', '락', '막', '먹', '목', '묵', '박', '복', '북', '석', '속', '숙', '악', '옥', '육', '직', '축', '턱', '폭', '흑',
    '갈', '걸', '골', '굴', '글', '길', '날', '달', '돌', '둘', '들', '랄', '럴', '롤', '룰', '말', '멜', '몰', '물', '밀', '발', '벌', '볼', '불', '별', '실', '얼', '열', '울', '율', '일', '절', '줄', '칠', '팔', '풀', '훌',
    '갑', '값', '겁', '곱', '굽', '급', '답', '덥', '돕', '밥', '법', '섭', '습', '압', '업', '옵', '입', '잡', '좁', '집', '컵', '합',
    '까', '깨', '꼬', '꾀', '꿰', '꾸', '따', '때', '또', '뚜', '빠', '빼', '뽀', '뿌', '싸', '쌔', '써', '쏘', '쑤', '씨', '짜', '쨔', '쩌', '쪼', '쭈', '찌'
  ]));
  const PHONICS_COLORS = [
    { bg: ['#FF7A90', '#EF3057'], border: '#C91842', text: '#FFFFFF', lift: '#AC1238', textShadow: '0 2px 0 rgba(98, 12, 35, 0.38)' },
    { bg: ['#FFB95C', '#F97316'], border: '#EA580C', text: '#FFFFFF', lift: '#C2410C', textShadow: '0 2px 0 rgba(124, 45, 18, 0.34)' },
    { bg: ['#FFE872', '#FACC15'], border: '#EAB308', text: '#713F12', lift: '#B7791F', textShadow: '0 1px 0 rgba(255, 250, 210, 0.75)' },
    { bg: ['#48D986', '#16A34A'], border: '#15803D', text: '#FFFFFF', lift: '#166534', textShadow: '0 2px 0 rgba(20, 83, 45, 0.34)' },
    { bg: ['#5BD7F2', '#0284C7'], border: '#0369A1', text: '#FFFFFF', lift: '#075985', textShadow: '0 2px 0 rgba(12, 74, 110, 0.34)' },
    { bg: ['#7CA7FF', '#2563EB'], border: '#1D4ED8', text: '#FFFFFF', lift: '#1E40AF', textShadow: '0 2px 0 rgba(30, 64, 175, 0.34)' },
    { bg: ['#A78BFA', '#7C3AED'], border: '#6D28D9', text: '#FFFFFF', lift: '#5B21B6', textShadow: '0 2px 0 rgba(59, 7, 100, 0.34)' },
    { bg: ['#F9A8D4', '#DB2777'], border: '#BE185D', text: '#FFFFFF', lift: '#9D174D', textShadow: '0 2px 0 rgba(131, 24, 67, 0.34)' },
    { bg: ['#7DD3FC', '#38BDF8'], border: '#0EA5E9', text: '#075985', lift: '#0284C7', textShadow: '0 1px 0 rgba(224, 242, 254, 0.72)' },
    { bg: ['#D9F99D', '#84CC16'], border: '#65A30D', text: '#365314', lift: '#4D7C0F', textShadow: '0 1px 0 rgba(247, 254, 231, 0.72)' },
    { bg: ['#FDE68A', '#F59E0B'], border: '#D97706', text: '#78350F', lift: '#B45309', textShadow: '0 1px 0 rgba(255, 251, 235, 0.7)' },
    { bg: ['#94A3B8', '#334155'], border: '#1E293B', text: '#FFFFFF', lift: '#0F172A', textShadow: '0 2px 0 rgba(15, 23, 42, 0.42)' }
  ];

  const PHONICS_COMMON_INITIALS = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  const PHONICS_BASIC_MEDIALS = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
  ];
  const PHONICS_COMMON_FINALS = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ',
    'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  const PHONICS_SPEECH_MAP = {
    'ㅏ': '아',
    'ㅐ': '애',
    'ㅑ': '야',
    'ㅒ': '얘',
    'ㅓ': '어',
    'ㅔ': '에',
    'ㅕ': '여',
    'ㅖ': '예',
    'ㅗ': '오',
    'ㅘ': '와',
    'ㅙ': '왜',
    'ㅚ': '외',
    'ㅛ': '요',
    'ㅜ': '우',
    'ㅝ': '워',
    'ㅞ': '웨',
    'ㅟ': '위',
    'ㅠ': '유',
    'ㅡ': '으',
    'ㅢ': '의',
    'ㅣ': '이',
    'ㄱ': '기역',
    'ㄲ': '쌍기역',
    'ㄴ': '니은',
    'ㄷ': '디귿',
    'ㄸ': '쌍디귿',
    'ㄹ': '리을',
    'ㅁ': '미음',
    'ㅂ': '비읍',
    'ㅃ': '쌍비읍',
    'ㅅ': '시옷',
    'ㅆ': '쌍시옷',
    'ㅇ': '이응',
    'ㅈ': '지읒',
    'ㅉ': '쌍지읒',
    'ㅊ': '치읓',
    'ㅋ': '키읔',
    'ㅌ': '티읕',
    'ㅍ': '피읖',
    'ㅎ': '히읗',
    '종합': '종합'
  };

  const PHONICS_SOUND_MANIFEST = window.CARDLAB_PHONICS_SOUND_MANIFEST || null;
  const SELECTION_BACKGROUNDS = [
    'images/bg/s-space-bg.webp'
  ];
  const LEARNING_BACKGROUNDS = [
    'images/bg/animal-bg.webp',
    'images/bg/city-bg.webp',
    'images/bg/sea-bg.webp'
  ];
  const EFFECT_SOUND_VOLUME = 0.7;

  const AUDIO_FILES = {
    select: '../sound/select.mp3',
    correct: '../sound/correct.mp3',
    wrong: '../sound/error.mp3',
    complete: '../sound/happy_victory.mp3'
  };
  const QUESTION_TRANSITION_EFFECT_DURATION = 760;

  const audioCache = new Map();
  const voiceAudioCache = new Map();
  let activeVoiceAudio = null;
  let audioEnabled = true;

  const state = {
    view: 'select',
    selectedStageId: getInitialStageId(),
    run: null,
    pendingModalAction: '',
    selectionBackground: '',
    learningBackground: ''
  };

  let nextQuestionTimer = null;
  let completionFxPlayed = false;

  function getInitialStageId() {
    const hashStageId = (window.location.hash || '').replace(/^#/, '').trim();
    return stages.some((stage) => stage.id === hashStageId) ? hashStageId : stages[0].id;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCardStyleVars(card) {
    if (!card) return '';
    return [
      `--card-border:${card.border || '#dbe3f0'}`,
      `--card-bg-start:${card.bgStart || '#fff0bd'}`,
      `--card-bg-end:${card.bgEnd || '#ffe0a2'}`,
      `--card-text:${card.text || '#8a2707'}`,
      `--card-lift:${card.lift || '#cf965f'}`,
      `--card-text-shadow:${card.textShadow || '0 1px 0 rgba(255, 245, 200, 0.75)'}`
    ].join(';');
  }

  function parseStageNumber(stageId) {
    const match = String(stageId || '').match(/(\d{2})$/);
    return match ? Number(match[1]) || 1 : 1;
  }

  function getStageQuestionTotal(stageId) {
    return parseStageNumber(stageId) >= 7 ? 20 : 10;
  }

  function pickRandomBackground(list) {
    return list[Math.floor(Math.random() * list.length)] || list[0] || '';
  }

  function pickSelectionBackground() {
    return pickRandomBackground(SELECTION_BACKGROUNDS);
  }

  function pickLearningBackground() {
    return pickRandomBackground(LEARNING_BACKGROUNDS);
  }

  function getTargetCount(template) {
    if (!template) return 3;
    if (template.criteria === 'mixed') return 5;
    const criteriaLength = Array.isArray(template.criteria) ? template.criteria.length : 0;
    if (criteriaLength >= 5) return 5;
    if (criteriaLength >= 2) return 4;
    return 3;
  }

  function setPhonicsBackground(imagePath) {
    if (!imagePath || !document.documentElement || !document.documentElement.style) return;
    document.documentElement.style.setProperty('--phonics-page-bg', "url('" + imagePath + "')");
  }

  function getCardCount(template) {
    return getTargetCount(template) >= 5 ? 10 : 8;
  }

  function getStageLabel(stage) {
    if (!stage) return '도입 01';
    return `${stage.band} ${stage.code}`;
  }

  function getStageCriteriaValues(stage) {
    if (!stage || !Array.isArray(stage.criteria)) return [];
    return stage.criteria.map((entry) => String(entry?.value || '').trim()).filter(Boolean);
  }

  function getPhonicsSpeechText(text) {
    const normalized = String(text == null ? '' : text).trim();
    if (!normalized) return '';
    return PHONICS_SPEECH_MAP[normalized] || normalized;
  }

  function buildPhonicsSoundLookup(manifest) {
    const lookup = new Map();
    const items = Array.isArray(manifest?.items) ? manifest.items : [];
    items.forEach((item) => {
      const displayText = String(item?.displayText || item?.text || '').trim();
      if (!displayText) return;
      lookup.set(displayText, item);
      const speechText = String(item?.speechText || '').trim();
      if (speechText && !lookup.has(speechText)) {
        lookup.set(speechText, item);
      }
    });
    return lookup;
  }

  const phonicsSoundLookup = buildPhonicsSoundLookup(PHONICS_SOUND_MANIFEST);

  function resolvePhonicsSoundEntry(text) {
    const normalized = String(text == null ? '' : text).trim();
    if (!normalized) return null;
    return phonicsSoundLookup.get(normalized) || phonicsSoundLookup.get(getPhonicsSpeechText(normalized)) || null;
  }

  function stopVoiceAudio() {
    if (activeVoiceAudio) {
      try {
        activeVoiceAudio.pause();
        activeVoiceAudio.currentTime = 0;
      } catch (_error) {
        // ignore
      }
    }
    activeVoiceAudio = null;
  }

  function playPhonicsVoice(text, onComplete) {
    const entry = resolvePhonicsSoundEntry(text);
    if (entry && entry.publicPath) {
      const cacheKey = entry.publicPath;
      let audio = voiceAudioCache.get(cacheKey);
      if (!audio) {
        audio = new Audio(cacheKey);
        audio.preload = 'auto';
        audio.playbackRate = 1.05;
        voiceAudioCache.set(cacheKey, audio);
      }
      stopVoiceAudio();
      activeVoiceAudio = audio;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (activeVoiceAudio === audio) {
          activeVoiceAudio = null;
        }
        if (typeof onComplete === 'function') {
          onComplete();
        }
      };
      try {
        audio.onended = finish;
        audio.onerror = () => {
          if (activeVoiceAudio === audio) {
            activeVoiceAudio = null;
          }
        };
        audio.playbackRate = 1.05;
        audio.currentTime = 0;
        audio.play().catch(() => {
          activeVoiceAudio = null;
        });
        return true;
      } catch (_error) {
        activeVoiceAudio = null;
      }
      return true;
    }

    return false;
  }

  function renderStageCriteriaChips(stage) {
    const values = getStageCriteriaValues(stage);
    if (!values.length) {
      return '<span class="phonics-stage-criteria-chip is-mixed" data-pronounce-text="종합">종합</span>';
    }
    return values.map((value, index) => {
      const criteria = Array.isArray(stage.criteria) ? stage.criteria[index] : null;
      const type = String(criteria?.type || '');
      const labelClass = type === 'initial'
        ? 'is-initial'
        : type === 'medial'
          ? 'is-medial'
          : 'is-final';
      const speechText = getPhonicsSpeechText(value);
      return `<span class="phonics-stage-criteria-chip ${labelClass}" data-pronounce-text="${escapeHtml(speechText)}">${escapeHtml(value)}</span>`;
    }).join(' ');
  }

  function createRng(seed) {
    let value = (seed >>> 0) || 1;
    return () => {
      value += 0x6D2B79F5;
      let next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function stopAllSounds(options) {
    const keepVoice = Boolean(options && options.keepVoice);
    if (!keepVoice) {
      stopVoiceAudio();
    }
    audioCache.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_error) {
        // ignore audio stop failures
      }
    });
  }

  function playSound(type, options) {
    if (!audioEnabled || !AUDIO_FILES[type]) return;
    stopAllSounds(options);
    let audio = audioCache.get(type);
    if (!audio) {
      audio = new Audio(AUDIO_FILES[type]);
      audio.preload = 'auto';
      audioCache.set(type, audio);
    }
    try {
      audio.currentTime = 0;
      if (type === 'correct' || type === 'wrong') {
        audio.volume = EFFECT_SOUND_VOLUME;
      }
      audio.play().catch(() => {
        audioEnabled = false;
      });
    } catch (_error) {
      audioEnabled = false;
    }
  }

  function getEffectOrigin(targetElement) {
    const layerRect = effectLayer.getBoundingClientRect();
    const targetRect = (targetElement || effectLayer).getBoundingClientRect();
    return {
      x: targetRect.left + (targetRect.width / 2) - layerRect.left,
      y: targetRect.top + (targetRect.height / 2) - layerRect.top
    };
  }

  function spawnParticles(kind, targetElement, count) {
    const origin = getEffectOrigin(targetElement);
    const total = Math.max(8, count || 14);
    const colors = kind === 'wrong'
      ? ['#ff7d7d', '#ffb4b4', '#ffd0d0']
      : kind === 'complete'
        ? ['#ffe17a', '#8fe0ff', '#f6a8ff', '#8fffb4']
        : ['#ffe182', '#ffd36d', '#fff4b0', '#96e1ff'];

    for (let index = 0; index < total; index += 1) {
      const particle = document.createElement('span');
      const angle = (Math.PI * 2 * index) / total + (Math.random() * 0.35);
      const distance = 42 + (Math.random() * 60);
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - (kind === 'wrong' ? 10 : 0);
      const size = kind === 'complete' ? (8 + Math.random() * 6) : (6 + Math.random() * 4);
      particle.className = `phonics-effect-particle is-${kind}`;
      particle.style.left = `${origin.x}px`;
      particle.style.top = `${origin.y}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = colors[index % colors.length];
      particle.style.setProperty('--tx', `${tx.toFixed(1)}px`);
      particle.style.setProperty('--ty', `${ty.toFixed(1)}px`);
      particle.style.setProperty('--rot', `${Math.round((Math.random() * 500) - 250)}deg`);
      particle.style.animationDelay = `${Math.random() * 90}ms`;
      effectLayer.appendChild(particle);
      window.setTimeout(() => {
        particle.remove();
      }, 1050);
    }
  }

  function pulseElement(element, className, timeout) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    window.setTimeout(() => {
      element.classList.remove(className);
    }, timeout || 520);
  }

  function pick(list, rng) {
    if (!Array.isArray(list) || !list.length) return '';
    return list[Math.floor(rng() * list.length)] || '';
  }

  function decomposeHangulSyllable(char) {
    const code = String(char || '').charCodeAt(0);
    if (!code || code < 0xAC00 || code > 0xD7A3) return null;
    const offset = code - 0xAC00;
    const initialIndex = Math.floor(offset / 588);
    const medialIndex = Math.floor((offset % 588) / 28);
    const finalIndex = offset % 28;
    return {
      char,
      initial: PHONICS_COMMON_INITIALS[initialIndex] || '',
      medial: PHONICS_BASIC_MEDIALS[medialIndex] || '',
      final: PHONICS_COMMON_FINALS[finalIndex] || ''
    };
  }

  function normalizeCriteria(template) {
    if (!template || template.criteria === 'mixed') {
      return [
        { type: 'initial', value: 'ㄱ' },
        { type: 'medial', value: 'ㅏ' },
        { type: 'final', value: 'ㄴ' }
      ];
    }
    return Array.isArray(template.criteria) ? template.criteria : [];
  }

  function getCriteriaText(template) {
    if (!template) return '';
    if (template.criteria === 'mixed') return '종합';
    const values = Array.isArray(template.criteria)
      ? template.criteria.map((entry) => String(entry?.value || '').trim()).filter(Boolean)
      : [];
    return values.join(' · ');
  }

  function getQuestionPrompt(template) {
    if (!template) return '글자를 찾아요.';
    if (template.criteria === 'mixed') return '음운을 찾아요.';
    return '글자를 찾아요.';
  }

  function stageCriteriaSet(template) {
    return normalizeCriteria(template);
  }

  function getSyllableBank(template) {
    const criteriaList = stageCriteriaSet(template);
    return PHONICS_SYLLABLE_BANK.filter((char) => matchesCriteria(char, criteriaList));
  }

  function getDistractorBank(template) {
    const criteriaList = stageCriteriaSet(template);
    return PHONICS_SYLLABLE_BANK.filter((char) => !matchesCriteria(char, criteriaList));
  }

  function pickUniqueSyllables(source, count, seed, excludeSet) {
    const available = Array.from(new Set(source.filter((char) => char && !excludeSet.has(char))));
    const rng = createRng(seed);
    for (let i = available.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    return available.slice(0, count);
  }

  function matchesCriteria(character, criteriaList) {
    const dec = decomposeHangulSyllable(character);
    if (!dec) return false;
    return criteriaList.some((criteria) => {
      if (!criteria || !criteria.type || !criteria.value) return false;
      return dec[criteria.type] === criteria.value;
    });
  }

  function generatePhonicsQuestion(template, questionSeed) {
    const criteriaList = stageCriteriaSet(template);
    const targetCount = getTargetCount(template);
    const cardCount = getCardCount(template);
    const targetSource = getSyllableBank(template);
    const distractorSource = getDistractorBank(template);
    const targetChars = pickUniqueSyllables(targetSource, targetCount, questionSeed, new Set());
    const targetSet = new Set(targetChars);
    const distractorChars = pickUniqueSyllables(distractorSource, Math.max(0, cardCount - targetChars.length), questionSeed + 777, targetSet);
    const allChars = [...targetChars, ...distractorChars];
    const shuffleRng = createRng(questionSeed + 1551);
    for (let i = allChars.length - 1; i > 0; i -= 1) {
      const j = Math.floor(shuffleRng() * (i + 1));
      [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
    }

    return {
      id: `phonics-q-${questionSeed}`,
      criteriaText: getCriteriaText(template),
      promptText: getQuestionPrompt(template),
      cards: allChars.map((char, index) => {
        const palette = PHONICS_COLORS[index % PHONICS_COLORS.length];
        return {
          char,
          id: `pc-${questionSeed}-${index}`,
          isTarget: targetSet.has(char),
          border: palette.border,
          text: palette.text,
          lift: palette.lift,
          textShadow: palette.textShadow,
          bgStart: palette.bg[0],
          bgEnd: palette.bg[1]
        };
      }),
      totalTargets: targetChars.length
    };
  }

  function generatePhonicsStageQuestions(template, count) {
    const questions = [];
    for (let i = 0; i < count; i += 1) {
      const seed = Math.floor(Math.random() * 100000) + (i * 97);
      const question = generatePhonicsQuestion(template, seed);
      if (question) questions.push({ ...question, questionIndex: i + 1 });
    }
    return questions;
  }

  function createQuestionState(question) {
    if (!question) return null;
    const totalTargets = Math.max(1, Number(question.totalTargets || 0) || 0);
    return {
      ...question,
      pool: question.cards.map((card) => ({ ...card, placed: false })),
      slots: Array.from({ length: totalTargets }, () => null),
      hasWrongAttempt: false,
      errorId: '',
      selectedCardId: '',
      draggedCardId: '',
      dragOverSlotIndex: null
    };
  }

  function clearNextQuestionTimer() {
    if (nextQuestionTimer) {
      window.clearTimeout(nextQuestionTimer);
      nextQuestionTimer = null;
    }
  }

  function showQuestionTransitionEffect(questionState) {
    const result = questionState && questionState.hasWrongAttempt ? 'wrong' : 'correct';
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.showQuestionComplete === 'function') {
      window.HahaFeedbackOverlay.showQuestionComplete(result, {
        durationMs: QUESTION_TRANSITION_EFFECT_DURATION,
        sound: false
      });
      return;
    }
    document.dispatchEvent(new CustomEvent('hahalab:question-complete', {
      detail: {
        result,
        options: {
          durationMs: QUESTION_TRANSITION_EFFECT_DURATION,
          sound: false
        }
      }
    }));
  }

  function updateTopBar() {
    if (state.view === 'lesson' && state.run) {
      listButton.classList.remove('shell-hidden');
      helpButton.classList.add('shell-hidden');
      listButton.textContent = '학습 목록';
      if (exitButton) exitButton.textContent = '학습 종료';
      document.title = `${state.run.stageLabel} · 음운 인식`;
      return;
    }

    if (state.view === 'complete' && state.run) {
      listButton.classList.add('shell-hidden');
      helpButton.classList.add('shell-hidden');
      if (exitButton) exitButton.textContent = '종료';
      document.title = `${state.run.stageLabel} 완료`;
      return;
    }

    const stage = stages.find((item) => item.id === state.selectedStageId) || stages[0];
    listButton.classList.add('shell-hidden');
    helpButton.classList.remove('shell-hidden');
    if (exitButton) exitButton.textContent = '종료';
    document.title = `${getStageLabel(stage)} · 음운 인식`;
  }

  function renderStageCards() {
    stageGrid.innerHTML = stages.map((stage) => {
      const active = stage.id === state.selectedStageId;
      const style = `--stage-accent:#${stage.color};--stage-soft:${stage.soft};`;
      return '' +
        `<button type="button" class="phonics-stage-card" data-stage-id="${escapeHtml(stage.id)}" aria-pressed="${active ? 'true' : 'false'}" style="${style}">` +
        '  <div class="phonics-stage-top">' +
        `    <span class="phonics-stage-band">${escapeHtml(stage.band)}</span>` +
        `    <span class="phonics-stage-code">${escapeHtml(stage.code)}</span>` +
        '  </div>' +
        '  <div class="phonics-stage-main">' +
        `    ${renderStageCriteriaChips(stage)}` +
        '    <span class="phonics-stage-main-action">찾기</span>' +
        '  </div>' +
        `</button>`;
    }).join('');

    stageGrid.querySelectorAll('.phonics-stage-card').forEach((button) => {
      button.addEventListener('click', () => {
        playSound('select');
        startLesson(button.getAttribute('data-stage-id') || '');
      });
    });

    stageGrid.querySelectorAll('.phonics-stage-criteria-chip').forEach((chip) => {
      chip.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const pronounceText = chip.getAttribute('data-pronounce-text') || chip.textContent || '';
        playPhonicsVoice(pronounceText);
        pulseElement(chip, 'is-phonics-sound', 320);
      });
    });
  }

  function renderSlotBoard() {
    const run = state.run;
    if (!run || !run.current) {
      slotBoard.innerHTML = '';
      return;
    }

    const current = run.current;
    slotBoard.innerHTML = '' +
      '<div class="phonics-slot-grid">' +
      current.slots.map((slot, index) => {
        const isFilled = Boolean(slot);
        const card = slot || null;
        const cardHtml = isFilled
          ? '' +
            `<div class="phonics-slot-card" style="${getCardStyleVars(card)}">` +
            '  <div class="phonics-card-shell">' +
            `    <span class="phonics-slot-char">${escapeHtml(card.char)}</span>` +
            '  </div>' +
            '</div>'
          : '<div class="phonics-slot-empty"><span>드래그 또는 클릭</span></div>';
        return '' +
          `<div class="phonics-slot ${isFilled ? 'is-active' : ''}" data-slot-index="${index}">` +
          `  <div class="phonics-slot-inner">${cardHtml}</div>` +
          '</div>';
      }).join('') +
      '</div>';

    slotBoard.querySelectorAll('.phonics-slot').forEach((slot) => {
      const slotIndex = Number(slot.getAttribute('data-slot-index') || '-1');
      slot.addEventListener('dragover', (event) => {
        event.preventDefault();
        slot.classList.add('is-active');
      });
      slot.addEventListener('dragleave', () => {
        slot.classList.remove('is-active');
      });
      slot.addEventListener('drop', (event) => {
        event.preventDefault();
        slot.classList.remove('is-active');
        const cardId = event.dataTransfer.getData('text/plain');
        if (cardId) commitCard(cardId, slotIndex);
      });
    });
  }

  function renderChoiceBoard() {
    const run = state.run;
    if (!run || !run.current) {
      choiceBoard.innerHTML = '';
      return;
    }

    const current = run.current;
    choiceBoard.innerHTML = '' +
      '<div class="phonics-choice-grid">' +
      current.pool.map((card) => {
        const disabled = card.placed || Boolean(current.errorId) && current.errorId === card.id;
        const selected = current.selectedCardId === card.id;
        return '' +
          `<button type="button" class="phonics-choice-card ${selected ? 'is-selected' : ''}" data-card-id="${escapeHtml(card.id)}" aria-pressed="${selected ? 'true' : 'false'}" draggable="${disabled ? 'false' : 'true'}" ${disabled ? 'disabled' : ''} style="${getCardStyleVars(card)}">` +
          '  <div class="phonics-card-shell">' +
          `    <span class="phonics-choice-char ${card.placed ? 'is-placed' : ''}">${escapeHtml(card.char)}</span>` +
          '  </div>' +
          '</button>';
      }).join('') +
      '</div>';

    choiceBoard.querySelectorAll('.phonics-choice-card').forEach((button) => {
      const cardId = button.getAttribute('data-card-id') || '';
      button.addEventListener('click', () => {
        const card = current.pool.find((item) => item.id === cardId && !item.placed);
        if (card) {
          playPhonicsVoice(card.char);
          commitCard(cardId);
          return;
        }
        commitCard(cardId);
      });
      button.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', cardId);
        event.dataTransfer.effectAllowed = 'move';
        current.draggedCardId = cardId;
        current.selectedCardId = cardId;
        const card = current.pool.find((item) => item.id === cardId && !item.placed);
        if (card) {
          playPhonicsVoice(card.char);
        }
      });
      button.addEventListener('dragend', () => {
        current.draggedCardId = '';
      });
    });
  }

  function renderLessonQuestion() {
    const run = state.run;
    if (!run || !run.current) {
      slotBoard.innerHTML = '';
      choiceBoard.innerHTML = '';
      return;
    }

    const current = run.current;
    targetGlyph.textContent = current.criteriaText || '종합';
    questionPhrase.textContent = current.promptText || '글자를 찾아요.';

    renderSlotBoard();
    renderChoiceBoard();
  }

  function renderCompleteView() {
    const run = state.run;
    if (!run) return;
    const totalQuestions = run.questions.length;
    const correctCards = Number(run.correctCount || 0);
    const wrongCount = Number(run.wrongCount || 0);
    const totalAttempts = correctCards + wrongCount;
    const accuracy = totalAttempts > 0 ? Math.round((correctCards / totalAttempts) * 100) : 100;

    completeScoreText.textContent = `총 ${totalQuestions}문제 완료!`;
    completeSummaryText.textContent = `총 ${totalQuestions}문제 중 정답 카드 ${correctCards}개 · 오답 ${wrongCount}번 · 정답률 ${accuracy}%`;
    completeStageLabel.textContent = `${run.stageLabel} 완료`;
    completeCorrectCount.textContent = `${correctCards}개`;
    completeWrongCount.textContent = `${wrongCount}번`;

    if (!completionFxPlayed) {
      completionFxPlayed = true;
      playSound('complete');
      requestAnimationFrame(() => {
        spawnParticles('complete', completeView, 22);
        pulseElement(completeView.querySelector('.phonics-complete-hero'), 'is-complete-bounce', 900);
      });
    }
  }

  function renderCurrentView() {
    if (state.view === 'lesson') {
      state.learningBackground = state.learningBackground || pickLearningBackground();
      setPhonicsBackground(state.learningBackground);
      stageSelectView.classList.remove('is-active');
      stageSelectView.classList.add('is-hidden');
      completeView.classList.remove('is-active');
      completeView.classList.add('is-hidden');
      lessonView.classList.add('is-active');
      lessonView.classList.remove('is-hidden');
      updateTopBar();
      renderLessonQuestion();
      return;
    }

    if (state.view === 'complete') {
      state.learningBackground = state.learningBackground || pickLearningBackground();
      setPhonicsBackground(state.learningBackground);
      stageSelectView.classList.remove('is-active');
      stageSelectView.classList.add('is-hidden');
      lessonView.classList.remove('is-active');
      lessonView.classList.add('is-hidden');
      completeView.classList.add('is-active');
      completeView.classList.remove('is-hidden');
      updateTopBar();
      renderCompleteView();
      return;
    }

    state.selectionBackground = state.selectionBackground || pickSelectionBackground();
    setPhonicsBackground(state.selectionBackground);
    lessonView.classList.remove('is-active');
    lessonView.classList.add('is-hidden');
    completeView.classList.remove('is-active');
    completeView.classList.add('is-hidden');
    stageSelectView.classList.add('is-active');
    stageSelectView.classList.remove('is-hidden');
    updateTopBar();
    renderStageCards();
  }

  function finishRun() {
    clearNextQuestionTimer();
    if (!state.run) return;
    state.run.completed = true;
    state.view = 'complete';
    renderCurrentView();
  }

  function nextQuestion() {
    clearNextQuestionTimer();
    if (!state.run || !state.run.current) return;
    if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();

    const completedQuestion = state.run.current;
    const nextIndex = state.run.questionIndex + 1;
    if (nextIndex >= state.run.questions.length) {
      showQuestionTransitionEffect(completedQuestion);
      finishRun();
      return;
    }

    state.run.questionIndex = nextIndex;
    state.run.current = createQuestionState(state.run.questions[nextIndex]);
    renderCurrentView();
    showQuestionTransitionEffect(completedQuestion);
  }

  function scheduleNextQuestion() {
    clearNextQuestionTimer();
    nextQuestionTimer = window.setTimeout(nextQuestion, 550);
  }

  function commitCard(cardId, targetSlotIndex = null) {
    if (!state.run || !state.run.current || state.run.completed) return;

    const current = state.run.current;

    const card = current.pool.find((item) => item.id === cardId && !item.placed);
    if (!card) return;

    if (!card.isTarget) {
      current.hasWrongAttempt = true;
      current.errorId = card.id;
      current.selectedCardId = '';
      state.run.wrongCount += 1;
      playSound('wrong', { keepVoice: true });
      showMeaningToast(current.criteriaText || '종합', getPhonicsMeaningText(current), {
        module: 'phonics',
        criteriaText: current.criteriaText
      });
      renderCurrentView();
      window.requestAnimationFrame(() => {
        const wrongButton = choiceBoard.querySelector(`[data-card-id="${card.id}"]`);
        pulseElement(choiceBoard, 'is-wrong-feedback', 520);
        spawnParticles('wrong', wrongButton || choiceBoard, 10);
        if (wrongButton) {
          pulseElement(wrongButton, 'is-wrong-card', 520);
        }
      });
      window.setTimeout(() => {
        if (state.run && state.run.current) {
          state.run.current.errorId = '';
          renderCurrentView();
        }
      }, 420);
      return;
    }

    const slotIndex = Number.isInteger(targetSlotIndex)
      ? targetSlotIndex
      : current.slots.findIndex((slot) => slot === null);
    if (slotIndex < 0 || slotIndex >= current.slots.length) return;
    if (current.slots[slotIndex]) return;

    current.slots[slotIndex] = card;
    card.placed = true;
    current.selectedCardId = '';
    current.errorId = '';
    state.run.correctCount += 1;
    playSound('correct', { keepVoice: true });
    showMeaningToast(current.criteriaText || '종합', getPhonicsMeaningText(current), {
      module: 'phonics',
      criteriaText: current.criteriaText
    });
    renderCurrentView();
    window.requestAnimationFrame(() => {
      const slotElement = slotBoard.querySelector(`[data-slot-index="${slotIndex}"]`);
      pulseElement(slotBoard, 'is-correct-feedback', 520);
      spawnParticles('correct', slotElement || slotBoard, 12);
      if (slotElement) {
        pulseElement(slotElement, 'is-correct-slot', 520);
      }
    });

    if (current.slots.every(Boolean)) {
      scheduleNextQuestion();
    }
  }

  function startLesson(stageId) {
    const stage = stages.find((item) => item.id === stageId) || stages[0];
    if (!stage) return;

    clearNextQuestionTimer();
    stopAllSounds();
    if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
    state.view = 'lesson';
    state.selectedStageId = stage.id;
    state.learningBackground = pickLearningBackground();
    const questionCount = getStageQuestionTotal(stage.id);
    const questions = generatePhonicsStageQuestions(stage, questionCount);

    state.run = {
      id: `${stage.id}-${Date.now()}`,
      stageId: stage.id,
      stageLabel: getStageLabel(stage),
      descriptor: stage.descriptor,
      questions,
      questionIndex: 0,
      completed: false,
      current: createQuestionState(questions[0]),
      correctCount: 0,
      wrongCount: 0
    };
    completionFxPlayed = false;

    history.replaceState(null, '', `#${stage.id}`);
    renderCurrentView();
    enterFullscreen();
  }

  function showStageSelection() {
    clearNextQuestionTimer();
    stopAllSounds();
    if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
    state.view = 'select';
    state.run = null;
    completionFxPlayed = false;
    state.selectionBackground = pickSelectionBackground();
    renderCurrentView();
  }

  function restartCurrentStage() {
    if (!state.selectedStageId) return;
    stopAllSounds();
    startLesson(state.selectedStageId);
  }

  function goToPreviousPage() {
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

  async function enterFullscreen() {
    return false;
  }

  async function leaveFullscreen() {
    return false;
  }

  function openConfirmModal(action) {
    stopAllSounds();
    state.pendingModalAction = action;
    if (action === 'exit') {
      confirmModalTitle.textContent = '학습 종료';
      confirmModalDesc.textContent = '현재 학습을 끝내고 이전 페이지로 돌아갈까요?';
      confirmModalOk.textContent = '종료';
    } else {
      confirmModalTitle.textContent = '학습 목록';
      confirmModalDesc.textContent = '현재 학습을 끝내고 다시 목록으로 돌아갈까요?';
      confirmModalOk.textContent = '다시 목록으로';
    }
    confirmModal.classList.add('is-active');
    confirmModal.setAttribute('aria-hidden', 'false');
  }

  function closeConfirmModal() {
    state.pendingModalAction = '';
    confirmModal.classList.remove('is-active');
    confirmModal.setAttribute('aria-hidden', 'true');
  }

  function handleHashChange() {
    const nextStageId = (window.location.hash || '').replace(/^#/, '').trim();
    if (!nextStageId) return;
    if (!stages.some((stage) => stage.id === nextStageId)) return;
    state.selectedStageId = nextStageId;
    if (state.view === 'select') {
      renderCurrentView();
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

  function getPhonicsMeaningText(current) {
    const criteriaText = String(current?.criteriaText || '').trim();
    if (!criteriaText) return '';
    if (criteriaText === '종합') {
      return '여러 음운을 함께 찾아요.';
    }
    const spoken = PHONICS_SPEECH_MAP[criteriaText] || criteriaText;
    return `${spoken} 소리입니다.`;
  }

  listButton.addEventListener('click', function () {
    openConfirmModal('list');
  });
  if (exitButton) {
    exitButton.addEventListener('click', function () {
      openConfirmModal('exit');
    });
  }
  completeStageButton.textContent = '다른 단계 선택하기';
  completeRetryButton.textContent = '현재 단계 다시 풀기';
  completeStageButton.addEventListener('click', function () {
    playSound('select');
    showStageSelection();
  });
  completeRetryButton.addEventListener('click', restartCurrentStage);
  confirmModalOk.addEventListener('click', async function () {
    const action = state.pendingModalAction || 'exit';
    closeConfirmModal();
    if (action === 'list') {
      showStageSelection();
      return;
    }
    await leaveFullscreen();
    goToPreviousPage();
  });
  confirmModalCancel.addEventListener('click', closeConfirmModal);
  confirmModal.addEventListener('click', function (event) {
    if (event.target && event.target.hasAttribute('data-modal-close')) {
      closeConfirmModal();
    }
  });
  window.addEventListener('hashchange', handleHashChange);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeConfirmModal();
    }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAllSounds();
    }
  });
  window.addEventListener('pagehide', stopAllSounds, { passive: true });

  renderCurrentView();

  if (shouldAutoStartFromUrl()) {
    startLesson(state.selectedStageId);
  }
})();
