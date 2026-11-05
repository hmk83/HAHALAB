(function () {
  'use strict';

  const QUESTIONS_PER_STAGE = 10;
  const MODE_SEQUENCE = ['read', 'build', 'dictation'];
  const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const ALL_FINALS = ['ㅇ', 'ㄴ', 'ㅁ', 'ㄹ', 'ㄱ', 'ㅋ', 'ㄲ', 'ㅂ', 'ㅍ', 'ㄷ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ', 'ㅆ', 'ㄶ', 'ㅀ', 'ㄻ', 'ㅄ', 'ㄺ', 'ㄼ'];
  const KEYBOARD_ROWS = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '⌫'],
    ['space', '힌트']
  ];
  const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const CHO_INDEX = Object.fromEntries(CHOSEONG.map((item, index) => [item, index]));
  const JUNG_INDEX = Object.fromEntries(JUNGSEONG.map((item, index) => [item, index]));
  const JONG_INDEX = Object.fromEntries(JONGSUNG.map((item, index) => [item, index]));
  const VOWELS = new Set(JUNGSEONG);
  const VERTICAL_VOWELS = new Set(['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅣ']);
  const DOUBLE_INITIALS = { ㄱ: 'ㄲ', ㄷ: 'ㄸ', ㅂ: 'ㅃ', ㅅ: 'ㅆ', ㅈ: 'ㅉ' };
  const DOUBLE_FINALS = { ㄱ: 'ㄲ', ㅅ: 'ㅆ' };
  const COMBINE_VOWELS = {
    'ㅗㅏ': 'ㅘ',
    'ㅗㅐ': 'ㅙ',
    'ㅗㅣ': 'ㅚ',
    'ㅜㅓ': 'ㅝ',
    'ㅜㅔ': 'ㅞ',
    'ㅜㅣ': 'ㅟ',
    'ㅡㅣ': 'ㅢ'
  };
  const SPLIT_FINALS = { ㄳ: ['ㄱ', 'ㅅ'], ㄵ: ['ㄴ', 'ㅈ'], ㄶ: ['ㄴ', 'ㅎ'], ㄺ: ['ㄹ', 'ㄱ'], ㄻ: ['ㄹ', 'ㅁ'], ㄼ: ['ㄹ', 'ㅂ'], ㄽ: ['ㄹ', 'ㅅ'], ㄾ: ['ㄹ', 'ㅌ'], ㄿ: ['ㄹ', 'ㅍ'], ㅀ: ['ㄹ', 'ㅎ'], ㅄ: ['ㅂ', 'ㅅ'] };
  const COMBINE_FINALS = Object.fromEntries(Object.entries(SPLIT_FINALS).map(([final, parts]) => [parts.join(''), final]));
  const GOOGLE_TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  const GOOGLE_TTS_VOICE = {
    languageCode: 'ko-KR',
    name: 'ko-KR-Neural2-A'
  };
  const GOOGLE_TTS_AUDIO_CONFIG = {
    audioEncoding: 'MP3',
    speakingRate: 0.88,
    pitch: 0
  };
  const BATCHIM_AUDIO_BASE_URL = '../../sound/cardlab-batchim/';
  const sounds = {
    correct: new Audio('../sound/correct.mp3'),
    wrong: new Audio('../sound/error.mp3')
  };

  const STAGES = [
    {
      id: 'nasal-ng',
      badge: '01',
      title: '1장 콧소리 ㅇ',
      focus: '목구멍 뒤쪽에서 울림이 남는 기본 받침',
      desc: '소리와 모양이 비교적 일치하는 ㅇ 받침을 안정적으로 읽고 씁니다.',
      finals: ['ㅇ'],
      options: ['ㅇ', 'ㄴ', 'ㅁ', 'ㄹ'],
      accent: '#2f80ed',
      words: ['강', '공', '방', '빵', '병', '왕', '창', '종', '땅', '콩', '상', '양', '형', '동', '장', '강아지', '공룡', '가방', '사탕', '운동장', '호랑이', '고양이', '풍선', '냉장고', '생강', '방울', '종이', '공원', '강물', '방문', '상자', '시장', '동그라미', '강당', '장난감', '왕관', '콩나물', '병원', '창문', '상상', '방석', '공책', '장미', '풍경', '신랑', '사랑', '운동', '가랑비', '구멍', '설탕']
    },
    {
      id: 'nasal-n',
      badge: '02',
      title: '2장 혀끝소리 ㄴ',
      focus: '혀끝을 윗잇몸에 대며 만드는 받침',
      desc: 'ㄴ 받침이 들어간 생활 낱말을 읽고, 받침 위치를 정확히 인식합니다.',
      finals: ['ㄴ'],
      options: ['ㄴ', 'ㅇ', 'ㅁ', 'ㄹ'],
      accent: '#10b981',
      words: ['산', '문', '눈', '손', '돈', '연', '선', '신발', '편지', '전화', '친구', '한글', '신문', '연필', '분홍', '단추', '반지', '인형', '운동화', '건물', '문장', '산책', '눈물', '손톱', '손수건', '문구', '문어', '사진', '소년', '눈사람', '간식', '천사', '분필', '번호', '언니', '눈길', '편안', '안경', '안개', '선물', '분수', '간장', '단어', '단풍', '잔디', '진주', '찬물', '군밤', '난로', '먼지']
    },
    {
      id: 'nasal-m',
      badge: '03',
      title: '3장 입술소리 ㅁ',
      focus: '입술을 닫으며 울림을 남기는 받침',
      desc: '입 모양이 닫히는 원리를 느끼며 ㅁ 받침 낱말을 학습합니다.',
      finals: ['ㅁ'],
      options: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ'],
      accent: '#f59e0b',
      words: ['몸', '밤', '마음', '곰', '감', '김', '섬', '숨', '봄', '잠', '이름', '구름', '사람', '바람', '그림', '점심', '냄비', '참외', '김밥', '감자', '감기', '엄마', '삼촌', '솜사탕', '염소', '담요', '남자', '음악', '음식', '햄버거', '냄새', '감옥', '심장', '봄날', '곰돌이', '밤하늘', '마음씨', '소금', '주름', '여름', '아름', '기름', '필름', '발음', '얼음', '웃음', '처음', '다음', '모음', '자음']
    },
    {
      id: 'liquid-l',
      badge: '04',
      title: '4장 흐름소리 ㄹ',
      focus: '혀가 살짝 굴러가며 흐르는 받침',
      desc: 'ㄹ 받침의 유연한 소리 특성을 생활 낱말 속에서 구분합니다.',
      finals: ['ㄹ'],
      options: ['ㄹ', 'ㄴ', 'ㅁ', 'ㅇ'],
      accent: '#8b5cf6',
      words: ['칼', '발', '거울', '하늘', '달', '별', '물', '불', '길', '돌', '벌', '말', '쌀', '솔', '귤', '딸기', '설날', '얼굴', '놀이터', '갈매기', '달력', '발자국', '물고기', '불꽃', '골목', '열쇠', '팔찌', '울타리', '일기', '칠판', '풀잎', '돌멩이', '별빛', '말소리', '빨래', '갈색', '일요일', '월요일', '날개', '살구', '밀가루', '벌레', '물병', '불빛', '길가', '달팽이', '볼펜', '줄넘기', '팔꿈치', '털실']
    },
    {
      id: 'stop-k',
      badge: '05',
      title: '5장 터짐소리 ㄱ 계열',
      focus: 'ㄱ, ㅋ, ㄲ이 대표음 ㄱ으로 모이는 규칙',
      desc: '표기는 달라도 끝소리는 ㄱ으로 들리는 대표음 규칙을 익힙니다.',
      finals: ['ㄱ', 'ㅋ', 'ㄲ'],
      options: ['ㄱ', 'ㅋ', 'ㄲ', 'ㅇ', 'ㅂ', 'ㄴ'],
      accent: '#ef4444',
      words: ['국', '수박', '부엌', '밖', '낚시', '책', '약', '떡', '목', '벽', '가족', '음악', '학교', '입학', '축구', '낙엽', '부탁', '기억', '주먹', '새벽', '속담', '깍두기', '볶음밥', '밖으로', '부엌문', '책상', '색종이', '국수', '목걸이', '약속', '박수', '복숭아', '낙타', '북극', '독서', '작가', '국어', '기차역', '벽돌', '옥수수', '식탁', '악기', '각도', '깎다', '섞다', '묶다', '닦다', '볶다', '꺾다', '깜짝']
    },
    {
      id: 'stop-p',
      badge: '06',
      title: '6장 입술막음 ㅂ 계열',
      focus: 'ㅂ, ㅍ이 입술을 닫는 대표음 ㅂ으로 모이는 규칙',
      desc: '입술이 닫히며 끝나는 소리를 듣고 ㅂ/ㅍ 표기를 구별합니다.',
      finals: ['ㅂ', 'ㅍ'],
      options: ['ㅂ', 'ㅍ', 'ㅁ', 'ㄱ', 'ㄷ', 'ㄴ'],
      accent: '#06b6d4',
      words: ['컵', '무릎', '숲', '밥', '집', '잎', '앞', '옆', '입', '덮개', '깊다', '높다', '좁다', '잡다', '접다', '씹다', '업다', '입다', '밥상', '집안', '숲속', '잎사귀', '앞문', '옆집', '입술', '컵밥', '무릎담요', '손잡이', '덮밥', '덥다', '춥다', '곱다', '쉽다', '어렵다', '가볍다', '무겁다', '새롭다', '귀엽다', '아름답다', '밉다', '맵다', '짭짤하다', '굽다', '줍다', '눕다', '뽑다', '입구', '입학', '밥풀', '숲길']
    },
    {
      id: 'stop-t',
      badge: '07',
      title: '7장 대표음 ㄷ 계열',
      focus: 'ㄷ, ㅅ, ㅈ, ㅊ, ㅌ, ㅎ, ㅆ이 대표음 ㄷ으로 모이는 규칙',
      desc: '가장 혼동이 큰 끝소리 규칙을 표기 중심으로 안정화합니다.',
      finals: ['ㄷ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ', 'ㅆ'],
      options: ['ㄷ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ', 'ㅆ'],
      accent: '#f97316',
      words: ['옷', '빗', '낮', '꽃', '밭', '끝', '낱말', '젖', '빛', '낯', '솥', '곧', '듣다', '걷다', '묻다', '웃다', '있다', '같다', '좋다', '놓다', '닫다', '돋보기', '돗자리', '햇빛', '빗물', '옷장', '꽃잎', '밭일', '낮잠', '첫눈', '첫째', '못', '맛', '멋', '젓가락', '잣', '낫', '팥', '숯', '붙다', '쫓다', '맞다', '찾다', '쌓다', '낳다', '넣다', '빻다', '찧다', '솟다', '씻다']
    },
    {
      id: 'liaison',
      badge: '08',
      title: '8장 소리의 연결',
      focus: '받침이 뒤 모음으로 자연스럽게 넘어가는 연음',
      desc: '읽을 때 소리가 이어지는 낱말을 듣고 표기와 발음을 함께 연결합니다.',
      finals: ['ㅇ', 'ㄴ', 'ㅁ', 'ㄹ', 'ㄱ', 'ㅋ', 'ㄲ', 'ㅂ', 'ㅍ', 'ㄷ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ', 'ㅆ'],
      options: ['ㅇ', 'ㄴ', 'ㅁ', 'ㄹ', 'ㄱ', 'ㅂ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ'],
      accent: '#14b8a6',
      words: ['할아버지', '웃음', '음악이', '국어', '꽃이', '밭에', '옷을', '별이', '달이', '물이', '집에', '앞에', '숲이', '낮에', '맛이', '빛이', '부엌에', '밖으로', '책을', '밥을', '강아지', '공원이', '산에', '문을', '손이', '몸이', '밤에', '곰이', '길을', '돌이', '색연필', '낙엽이', '수박을', '입안', '잎이', '옆으로', '끝에', '젖은', '좋아', '놓아', '있어', '웃어', '꽃을', '밭을', '국을', '벽에', '약을', '컵에', '숲을', '빛을']
    },
    {
      id: 'cluster-basic',
      badge: '09',
      title: '9장 겹받침 기초',
      focus: 'ㄵ, ㄶ, ㅀ, ㄻ, ㄾ처럼 두 자음 중 일부가 소리 나는 구조',
      desc: '기초 겹받침의 표기 형태와 실제 읽기 차이를 단계적으로 다룹니다.',
      finals: ['ㄵ', 'ㄶ', 'ㅀ', 'ㄻ', 'ㄾ'],
      options: ['ㄵ', 'ㄶ', 'ㅀ', 'ㄻ', 'ㄾ', 'ㄴ', 'ㄹ', 'ㅁ'],
      accent: '#a855f7',
      words: ['앉다', '앉아', '앉은', '앉고', '앉기', '많다', '많은', '많아', '많고', '많지', '닮다', '닮은', '닮아', '닮고', '닮기', '않다', '않은', '않아', '않고', '않기', '괜찮다', '괜찮은', '괜찮아', '끊다', '끊어', '끊고', '끊기', '삶다', '삶아', '삶고', '젊다', '젊은', '젊어', '굶다', '굶어', '굶고', '옮다', '옮아', '옮고', '싫다', '싫어', '싫고', '앓다', '앓아', '앓고', '뚫다', '뚫어', '뚫고', '핥다', '핥아']
    },
    {
      id: 'cluster-advanced',
      badge: '10',
      title: '10장 겹받침 심화',
      focus: 'ㄳ, ㅄ, ㄺ, ㄼ 등 생활 속 난도 높은 겹받침',
      desc: '읽기와 쓰기에서 오류가 잦은 겹받침을 실생활 낱말 중심으로 훈련합니다.',
      finals: ['ㄳ', 'ㅄ', 'ㄺ', 'ㄼ', 'ㄵ', 'ㄽ', 'ㄾ', 'ㄿ'],
      options: ['ㄳ', 'ㅄ', 'ㄺ', 'ㄼ', 'ㄵ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㄱ', 'ㅂ'],
      accent: '#334155',
      words: ['읽다', '읽어', '읽고', '읽기', '읽은', '밟다', '밟아', '밟고', '밟기', '밟은', '없다', '없어', '없고', '없는', '없이', '값', '값이', '값을', '몫', '몫을', '넋', '넋이', '닭', '닭이', '닭을', '맑다', '맑은', '맑아', '맑고', '얇다', '얇은', '얇아', '얇고', '넓다', '넓은', '넓어', '넓고', '여덟', '여덟째', '읊다', '읊어', '읊고', '훑다', '훑어', '훑고', '삯', '곬', '흙', '붉다', '붉은']
    }
  ];

  const state = {
    stage: null,
    questions: [],
    index: 0,
    correct: 0,
    wrong: 0,
    modeStats: {},
    startedAtMs: 0,
    selectedFinal: '',
    currentAnswered: false,
    speech: null,
    savedRecordId: '',
    autoTimer: null,
    modalTimer: null,
    composer: { cho: '', jung: '', jong: '' },
    answerRevealed: false,
    activeAudio: null,
    isNativeComposing: false,
    batchimAudioManifest: null,
    batchimAudioManifestPromise: null,
    googleVoice: null,
    voicesReady: false,
    googleTtsCache: new Map(),
    virtualKeyTimers: new Map()
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

  function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  }

  function normalizeAnswer(value) {
    return String(value || '').replace(/\s+/g, '').trim();
  }

  function getGoogleTtsApiKey() {
    try {
      return String(
        window.CARDLAB_BATCHIM_GOOGLE_TTS_API_KEY ||
        window.HAHALAB_GOOGLE_TTS_API_KEY ||
        window.localStorage.getItem('cardlab_google_tts_api_key') ||
        window.localStorage.getItem('hahalab_google_tts_api_key') ||
        ''
      ).trim();
    } catch (_error) {
      return '';
    }
  }

  function getAvailableVoices() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== 'function') return [];
    return window.speechSynthesis.getVoices() || [];
  }

  function pickGoogleKoreanVoice() {
    const voices = getAvailableVoices();
    const koreanVoices = voices.filter((voice) => /^ko(-|_)?KR/i.test(voice.lang || '') || /^ko/i.test(voice.lang || ''));
    return koreanVoices.find((voice) => /google/i.test(voice.name || '')) ||
      voices.find((voice) => /google/i.test(voice.name || '') && /^ko/i.test(voice.lang || '')) ||
      koreanVoices[0] ||
      null;
  }

  function warmGoogleVoices() {
    if (!window.speechSynthesis) return;
    const assignVoice = () => {
      state.googleVoice = pickGoogleKoreanVoice();
      state.voicesReady = true;
    };
    assignVoice();
    if (!state.googleVoice && typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', assignVoice, { once: true });
    }
  }

  function clearAutoTimer() {
    if (state.autoTimer) {
      clearTimeout(state.autoTimer);
      state.autoTimer = null;
    }
  }

  function clearModalTimer() {
    if (state.modalTimer) {
      clearTimeout(state.modalTimer);
      state.modalTimer = null;
    }
  }

  function stopAudio() {
    if (state.activeAudio) {
      try {
        state.activeAudio.pause();
        state.activeAudio.currentTime = 0;
      } catch (_error) {}
      state.activeAudio = null;
    }
  }

  function stopPlayback() {
    clearAutoTimer();
    stopAudio();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    state.speech = null;
  }

  function leaveCurrentActivity() {
    stopPlayback();
    clearModalTimer();
    hideCorrectModal();
  }

  function playEffect(type) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopAudio();
    const audio = sounds[type];
    if (!audio) return;
    try {
      audio.currentTime = 0;
      state.activeAudio = audio;
      audio.play().catch(() => {});
    } catch (_error) {}
  }

  function logAudioEvent(event, detail) {
    if (Array.isArray(window.__audioLog)) {
      window.__audioLog.push({
        at: Date.now(),
        event,
        detail: detail || null
      });
    }
  }

  function getJong(syllable) {
    const code = String(syllable || '').charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return '';
    return JONGSUNG[(code - 0xac00) % 28] || '';
  }

  function removeJong(syllable) {
    const code = String(syllable || '').charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return syllable;
    const offset = code - 0xac00;
    const jong = offset % 28;
    return String.fromCharCode(code - jong);
  }

  function getSyllableParts(syllable) {
    const code = String(syllable || '').charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return null;
    const offset = code - 0xac00;
    return {
      cho: CHOSEONG[Math.floor(offset / (21 * 28))],
      jung: JUNGSEONG[Math.floor((offset % (21 * 28)) / 28)],
      jong: JONGSUNG[offset % 28] || ''
    };
  }

  function getJamoLayout(parts) {
    const isVertical = VERTICAL_VOWELS.has(parts && parts.jung);
    return isVertical
      ? {
          cho: { x: 54, y: 74, size: 70 },
          jung: { x: 106, y: 74, size: 70 },
          jong: { x: 80, y: 126, size: 54 },
          guide: { x: 51, y: 105, width: 58, height: 32, radius: 11 }
        }
      : {
          cho: { x: 80, y: 58, size: 70 },
          jung: { x: 80, y: 90, size: 68 },
          jong: { x: 80, y: 129, size: 54 },
          guide: { x: 51, y: 108, width: 58, height: 32, radius: 11 }
        };
  }

  function getFinalFontSize(final) {
    return Array.from(String(final || '')).length > 1 ? 42 : 54;
  }

  function renderBuildTargetSyllable(question, char) {
    const parts = getSyllableParts(char) || getSyllableParts(question.base);
    if (!parts) return `<span class="batchim-letter-box">${escapeHtml(char)}</span>`;
    const layout = getJamoLayout(parts);
    const finalSize = getFinalFontSize(question.final);
    return `<span class="batchim-syllable batchim-syllable-svg" data-base="${escapeHtml(question.base)}" data-target-final="${escapeHtml(question.final)}">
      <span class="batchim-syllable-metric">${escapeHtml(char)}</span>
      <svg class="batchim-jamo-svg" viewBox="0 0 160 160" role="img" aria-label="${escapeHtml(question.base)} 받침 빈칸">
        <g class="batchim-jamo-layer batchim-jamo-initial" data-layer="initial">
          <text class="batchim-jamo-text" x="${layout.cho.x}" y="${layout.cho.y}" style="font-size:${layout.cho.size}px">${escapeHtml(parts.cho)}</text>
        </g>
        <g class="batchim-jamo-layer batchim-jamo-vowel" data-layer="vowel">
          <text class="batchim-jamo-text" x="${layout.jung.x}" y="${layout.jung.y}" style="font-size:${layout.jung.size}px">${escapeHtml(parts.jung)}</text>
        </g>
        <g class="batchim-jamo-layer batchim-jamo-final-target" data-layer="final" data-anchor-x="${layout.jong.x}" data-anchor-y="${layout.jong.y}">
          <rect class="batchim-jamo-final-guide" x="${layout.guide.x}" y="${layout.guide.y}" width="${layout.guide.width}" height="${layout.guide.height}" rx="${layout.guide.radius}" ry="${layout.guide.radius}"></rect>
          <text class="batchim-jamo-text batchim-jamo-final-fill" x="${layout.jong.x}" y="${layout.jong.y}" style="font-size:${finalSize}px"></text>
        </g>
      </svg>
      <button type="button" id="finalSlot" class="batchim-final-slot batchim-final-hitbox" aria-label="받침 넣는 곳"></button>
    </span>`;
  }

  function composeBaseWithFinal(base, final) {
    const parts = getSyllableParts(base);
    if (!parts) return `${base || ''}${final || ''}`;
    return composeSyllable(parts.cho, parts.jung, final || '');
  }

  function findTargetIndex(word, finals) {
    const chars = Array.from(word);
    const allowed = new Set(finals);
    const beforeVowel = chars.findIndex((char, index) => {
      const final = getJong(char);
      const next = chars[index + 1];
      return allowed.has(final) && next && /[아어오우으이야여요유에애]/.test(next);
    });
    if (beforeVowel >= 0) return beforeVowel;
    const first = chars.findIndex((char) => allowed.has(getJong(char)));
    return first >= 0 ? first : chars.findIndex((char) => getJong(char));
  }

  function buildQuestion(stage, word, index) {
    const targetIndex = findTargetIndex(word, stage.finals);
    const chars = Array.from(word);
    const targetChar = chars[targetIndex] || chars[0] || '';
    const final = getJong(targetChar);
    const base = removeJong(targetChar);
    const mode = MODE_SEQUENCE[index % MODE_SEQUENCE.length];
    return {
      id: `${stage.id}-${index}-${word}`,
      stageId: stage.id,
      word,
      mode,
      targetIndex,
      final,
      base,
      prompt: buildPrompt(stage, mode, word, final)
    };
  }

  function getCleanStageTitle(stage = state.stage) {
    return String((stage && stage.title) || '').replace(/^\d+장\s*/, '').trim();
  }

  function getFinalSpeechName(final) {
    const names = {
      'ㅇ': '이응',
      'ㄴ': '니은',
      'ㅁ': '미음',
      'ㄹ': '리을',
      'ㄱ': '기역',
      'ㅋ': '키읔',
      'ㄲ': '쌍기역',
      'ㅂ': '비읍',
      'ㅍ': '피읖',
      'ㄷ': '디귿',
      'ㅅ': '시옷',
      'ㅈ': '지읒',
      'ㅊ': '치읓',
      'ㅌ': '티읕',
      'ㅎ': '히읗',
      'ㅆ': '쌍시옷'
    };
    return names[final] || final;
  }

  function getSpeechFocusTitle(stage = state.stage) {
    return getCleanStageTitle(stage)
      .replace(/\s*[ㄱ-ㅎㅏ-ㅣ]+(?:\s*계열)?/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function buildPrompt(stage, mode, word, final) {
    const title = getCleanStageTitle(stage);
    if (mode === 'read') return `${title} 받침을 소리내어 읽어보세요.`;
    if (mode === 'build') return '빈칸에 알맞은 받침을 넣으세요.';
    return '들은 낱말을 정확히 입력하세요.';
  }

  function buildReadInstructionText(question) {
    const finalName = getFinalSpeechName(question && question.final ? question.final : state.stage.finals[0]);
    return `${getSpeechFocusTitle()} ${finalName} 받침을 소리내서 읽어보세요.`;
  }

  function buildRun(stage) {
    const shuffled = shuffle(stage.words);
    if (stage.id === 'nasal-ng' && shuffled.includes('창문')) {
      shuffled.splice(shuffled.indexOf('창문'), 1);
      shuffled.unshift('창문');
    }
    return shuffled.slice(0, QUESTIONS_PER_STAGE).map((word, index) => buildQuestion(stage, word, index));
  }

  function modeLabel(mode) {
    if (mode === 'read') return '소리내어 읽기';
    if (mode === 'build') return '드래그 받침 채우기';
    return '듣고 받아쓰기';
  }

  function feedback(text, type) {
    els.feedback.textContent = text || '';
    els.feedback.className = `batchim-feedback${type ? ` is-${type}` : ''}`;
  }

  function normalizeAudioText(text) {
    return String(text || '').replace(/\s+/g, '').trim();
  }

  function getBatchimAudioManifest() {
    if (state.batchimAudioManifest) return state.batchimAudioManifest;
    if (window.CARDLAB_BATCHIM_MANIFEST) return window.CARDLAB_BATCHIM_MANIFEST;
    if (window.CARDLAB_SOUND_MANIFESTS && window.CARDLAB_SOUND_MANIFESTS['cardlab-batchim']) {
      return window.CARDLAB_SOUND_MANIFESTS['cardlab-batchim'];
    }
    return null;
  }

  function loadBatchimAudioManifest() {
    const existing = getBatchimAudioManifest();
    if (existing) {
      state.batchimAudioManifest = existing;
      return Promise.resolve(existing);
    }
    if (state.batchimAudioManifestPromise) return state.batchimAudioManifestPromise;
    state.batchimAudioManifestPromise = fetch(`${BATCHIM_AUDIO_BASE_URL}manifest.json?v=20260517-static-audio-1`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((manifest) => {
        state.batchimAudioManifest = manifest || null;
        return state.batchimAudioManifest;
      })
      .catch(() => null);
    return state.batchimAudioManifestPromise;
  }

  function resolveBatchimAudioUrl(filePath) {
    const raw = String(filePath || '').trim();
    if (!raw) return '';
    if (/^(?:https?:|data:|blob:|file:|\/)/.test(raw)) return raw;
    return `${BATCHIM_AUDIO_BASE_URL}${raw.replace(/^\.?\//, '')}`;
  }

  async function findBatchimStaticAudioUrl(text) {
    const manifest = await loadBatchimAudioManifest();
    const normalized = normalizeAudioText(text);
    if (!manifest || !normalized) return '';
    const items = Array.isArray(manifest.items) ? manifest.items : [];
    const item = items.find((entry) => {
      if (!entry) return false;
      return normalizeAudioText(entry.normalizedText || entry.text) === normalized;
    });
    return item ? resolveBatchimAudioUrl(item.filePath || item.file_path || item.file) : '';
  }

  async function playStaticBatchimAudio(text) {
    const audioUrl = await findBatchimStaticAudioUrl(text);
    if (!audioUrl) {
      logAudioEvent('static-audio-miss', { text });
      return Promise.resolve(false);
    }
    stopAudio();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const audio = new Audio(audioUrl);
    audio.currentTime = 0;
    audio.preload = 'auto';
    state.activeAudio = audio;
    logAudioEvent('static-audio-start', { text, audioUrl });
    return new Promise((resolve) => {
      audio.addEventListener('ended', () => {
        logAudioEvent('static-audio-ended', { text, audioUrl });
        resolve(true);
      }, { once: true });
      audio.addEventListener('error', () => {
        logAudioEvent('static-audio-error', { text, audioUrl });
        resolve(false);
      }, { once: true });
      audio.play().then(() => {
        logAudioEvent('static-audio-playing', { text, audioUrl });
      }).catch((error) => {
        logAudioEvent('static-audio-blocked', { text, audioUrl, message: error && error.message });
        resolve(false);
      });
    });
  }

  function playText(text) {
    return playStaticBatchimAudio(text).then((playedStatic) => {
      if (playedStatic) return true;
      return playGoogleTts(text);
    });
  }

  async function playGoogleCloudTts(text) {
    const spokenText = String(text || '').trim();
    const apiKey = getGoogleTtsApiKey();
    if (!spokenText || !apiKey) return false;
    try {
      const cacheKey = `${GOOGLE_TTS_VOICE.name}:${GOOGLE_TTS_AUDIO_CONFIG.speakingRate}:${spokenText}`;
      let audioUrl = state.googleTtsCache.get(cacheKey);
      if (!audioUrl) {
        const response = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: spokenText },
            voice: GOOGLE_TTS_VOICE,
            audioConfig: GOOGLE_TTS_AUDIO_CONFIG
          })
        });
        if (!response.ok) return false;
        const data = await response.json();
        const audioContent = String(data && data.audioContent || '').trim();
        if (!audioContent) return false;
        audioUrl = `data:audio/mp3;base64,${audioContent}`;
        state.googleTtsCache.set(cacheKey, audioUrl);
      }
      stopAudio();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      const audio = new Audio(audioUrl);
      audio.currentTime = 0;
      state.activeAudio = audio;
      return await new Promise((resolve) => {
        audio.addEventListener('ended', () => resolve(true), { once: true });
        audio.addEventListener('error', () => resolve(false), { once: true });
        audio.play().catch(() => resolve(false));
      });
    } catch (_error) {
      return false;
    }
  }

  async function playGoogleTts(text) {
    const playedCloudTts = await playGoogleCloudTts(text);
    if (playedCloudTts) return true;
    return speakText(text);
  }

  function speakText(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      logAudioEvent('speech-unsupported', { text });
      return Promise.resolve(false);
    }
    stopAudio();
    window.speechSynthesis.cancel();
    if (!state.voicesReady || !state.googleVoice) warmGoogleVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    if (state.googleVoice) utterance.voice = state.googleVoice;
    utterance.rate = 0.86;
    utterance.pitch = 1.04;
    state.speech = utterance;
    return new Promise((resolve) => {
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      window.speechSynthesis.speak(utterance);
    });
  }

  function initElements() {
    ['stageView', 'gameView', 'completeView', 'stageGrid', 'stageLabel', 'stageButton', 'helpButton', 'helpModal', 'helpClose', 'gameTitle', 'modeTabs', 'questionCounter', 'progressBar', 'promptText', 'wordArea', 'finalBank', 'answerPanel', 'answerSlots', 'answerInput', 'checkButton', 'listenButton', 'readDoneButton', 'nextButton', 'feedback', 'hangulKeyboard', 'correctModal', 'correctWordText', 'sideStage', 'sideFocus', 'sideRegistered', 'sideQuestionCount', 'reportCapture', 'retryButton', 'otherStageButton'].forEach((id) => {
      els[id] = $(id);
    });
  }

  function showScreen(name) {
    if (name !== 'gameView') leaveCurrentActivity();
    [els.stageView, els.gameView, els.completeView].forEach((el) => el && el.classList.remove('is-active'));
    if (els[name]) els[name].classList.add('is-active');
    const inStage = name === 'stageView';
    els.stageButton.classList.toggle('shell-hidden', inStage);
    els.stageLabel.classList.add('shell-hidden');
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="batchim-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--accent:${stage.accent}">
        <span class="badge">${stage.badge}</span>
        <h2>${escapeHtml(stage.title)}</h2>
        <div class="batchim-final-chip">${escapeHtml(stage.finals.join(' · '))}</div>
      </button>
    `).join('');
    els.stageGrid.querySelectorAll('[data-stage-id]').forEach((button) => {
      button.addEventListener('click', () => startStage(button.dataset.stageId));
    });
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    state.stage = stage;
    state.questions = buildRun(stage);
    state.index = 0;
    state.correct = 0;
    state.wrong = 0;
    state.modeStats = {};
    state.startedAtMs = Date.now();
    state.savedRecordId = '';
    els.stageLabel.textContent = stage.title;
    showScreen('gameView');
    renderQuestion();
  }

  function renderModeTabs(mode) {
    els.modeTabs.innerHTML = MODE_SEQUENCE.map((item) => `
      <span class="batchim-mode-chip${item === mode ? ' is-active' : ''}">${modeLabel(item)}</span>
    `).join('');
  }

  function renderQuestion() {
    stopPlayback();
    const question = state.questions[state.index];
    if (!question) {
      renderReport();
      return;
    }
    state.currentAnswered = false;
    state.selectedFinal = '';
    state.composer = { cho: '', jung: '', jong: '' };
    state.answerRevealed = false;
    state.isNativeComposing = false;
    const progress = Math.round((state.index / state.questions.length) * 100);
    if (els.progressBar) els.progressBar.style.width = `${progress}%`;
    els.questionCounter.textContent = `문항 ${state.index + 1} / ${state.questions.length}`;
    els.gameTitle.textContent = state.stage.title;
    if (els.sideStage) els.sideStage.textContent = state.stage.title;
    if (els.sideFocus) els.sideFocus.textContent = state.stage.finals.join(' · ');
    if (els.sideRegistered) els.sideRegistered.textContent = `${state.stage.words.length}개`;
    if (els.sideQuestionCount) els.sideQuestionCount.textContent = `${QUESTIONS_PER_STAGE}개`;
    renderModeTabs(question.mode);
    els.promptText.textContent = question.prompt;
    const promptCard = document.querySelector('.batchim-prompt-card');
    if (promptCard) {
      promptCard.classList.remove('is-read', 'is-build', 'is-dictation');
      promptCard.classList.add(`is-${question.mode}`);
    }
    els.listenButton.hidden = false;
    els.readDoneButton.hidden = true;
    els.answerPanel.hidden = question.mode !== 'dictation';
    els.finalBank.hidden = question.mode !== 'build';
    els.checkButton.hidden = question.mode !== 'dictation';
    els.nextButton.hidden = question.mode !== 'read';
    els.checkButton.disabled = false;
    els.answerInput.value = '';
    els.answerInput.dataset.committed = '';
    if (els.answerSlots) els.answerSlots.innerHTML = '';
    feedback('', '');
    if (question.mode === 'read') {
      renderRead(question);
    } else if (question.mode === 'build') {
      renderBuild(question);
    } else {
      renderDictation(question);
    }
  }

  function renderRead(question) {
    const chars = Array.from(question.word);
    els.wordArea.className = 'batchim-word-display';
    els.wordArea.innerHTML = `
      <div class="batchim-read-word-card" aria-label="읽을 낱말">
        ${chars.map((char, index) => `<span class="batchim-letter-box${index === question.targetIndex ? ' target' : ''}">${escapeHtml(char)}</span>`).join('')}
      </div>
    `;
    els.finalBank.innerHTML = '';
    playText(buildReadInstructionText(question)).then(() => {
      if (state.questions[state.index] === question && !state.currentAnswered) playText(question.word);
    });
  }

  function renderBuild(question) {
    const chars = Array.from(question.word);
    els.wordArea.className = 'batchim-masked-word';
    els.wordArea.innerHTML = `<div class="batchim-build-word-card" aria-label="받침을 채울 낱말">` + chars.map((char, index) => {
      if (index !== question.targetIndex) return `<span class="batchim-letter-box">${escapeHtml(char)}</span>`;
      return renderBuildTargetSyllable(question, char);
    }).join('') + `</div>`;
    const options = buildOptions(question);
    els.finalBank.innerHTML = options.map((final) => `<button type="button" class="batchim-final-tile" draggable="true" data-final="${escapeHtml(final)}">${escapeHtml(final)}</button>`).join('');
    const slot = $('finalSlot');
    const setMagnet = (active) => {
      const syllable = slot && slot.closest('.batchim-syllable');
      if (!slot || !syllable || state.currentAnswered) return;
      slot.classList.toggle('is-hover', Boolean(active));
      syllable.classList.toggle('is-magnet', Boolean(active));
    };
    const findTile = (final) => Array.from(els.finalBank.querySelectorAll('[data-final]')).find((tile) => tile.dataset.final === final) || null;
    const isNearSlot = (x, y) => {
      if (!slot) return false;
      const rect = slot.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const thresholdX = Math.max(72, rect.width * 0.78);
      const thresholdY = Math.max(58, rect.height * 0.82);
      return Math.abs(x - centerX) <= thresholdX && Math.abs(y - centerY) <= thresholdY;
    };
    let pointerDrag = null;
    const removePointerGhost = () => {
      if (pointerDrag && pointerDrag.ghost) pointerDrag.ghost.remove();
    };
    const movePointerDrag = (event) => {
      if (!pointerDrag || state.currentAnswered) return;
      const moved = Math.hypot(event.clientX - pointerDrag.startX, event.clientY - pointerDrag.startY);
      if (!pointerDrag.active && moved < 6) return;
      if (!pointerDrag.active) {
        pointerDrag.active = true;
        pointerDrag.tile.classList.add('is-dragging');
        pointerDrag.ghost = document.createElement('div');
        pointerDrag.ghost.className = 'batchim-drag-ghost';
        pointerDrag.ghost.textContent = pointerDrag.final;
        pointerDrag.ghost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(pointerDrag.ghost);
      }
      pointerDrag.ghost.style.left = `${event.clientX}px`;
      pointerDrag.ghost.style.top = `${event.clientY}px`;
      setMagnet(isNearSlot(event.clientX, event.clientY));
      event.preventDefault();
    };
    const endPointerDrag = (event) => {
      if (!pointerDrag) return;
      document.removeEventListener('pointermove', movePointerDrag);
      document.removeEventListener('pointerup', endPointerDrag);
      document.removeEventListener('pointercancel', endPointerDrag);
      const shouldSubmit = pointerDrag.active && isNearSlot(event.clientX, event.clientY);
      const tile = pointerDrag.tile;
      const final = pointerDrag.final;
      if (pointerDrag.active) {
        tile.dataset.dragConsumed = 'true';
        window.setTimeout(() => { tile.dataset.dragConsumed = ''; }, 180);
      }
      removePointerGhost();
      tile.classList.remove('is-dragging');
      setMagnet(false);
      pointerDrag = null;
      if (shouldSubmit) submitFinal(final, { sourceElement: tile, snapped: true });
    };
    const startPointerDrag = (event, tile) => {
      if (state.currentAnswered || (event.pointerType === 'mouse' && event.button !== 0)) return;
      pointerDrag = {
        tile,
        final: tile.dataset.final || '',
        startX: event.clientX,
        startY: event.clientY,
        active: false,
        ghost: null
      };
      try { tile.setPointerCapture(event.pointerId); } catch (_error) {}
      document.addEventListener('pointermove', movePointerDrag);
      document.addEventListener('pointerup', endPointerDrag);
      document.addEventListener('pointercancel', endPointerDrag);
    };
    els.finalBank.querySelectorAll('[data-final]').forEach((tile) => {
      tile.addEventListener('click', () => {
        if (tile.dataset.dragConsumed === 'true') return;
        submitFinal(tile.dataset.final, { sourceElement: tile, snapped: true });
      });
      tile.addEventListener('pointerdown', (event) => startPointerDrag(event, tile));
      tile.addEventListener('dragstart', (event) => {
        tile.classList.add('is-dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', tile.dataset.final);
        }
      });
      tile.addEventListener('dragend', () => {
        tile.classList.remove('is-dragging', 'is-snapping');
        setMagnet(false);
      });
    });
    slot.addEventListener('dragenter', (event) => {
      event.preventDefault();
      setMagnet(true);
    });
    slot.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      setMagnet(true);
    });
    slot.addEventListener('dragleave', () => setMagnet(false));
    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      setMagnet(false);
      const final = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
      submitFinal(final, { sourceElement: findTile(final), snapped: true });
    });
    playText('빈칸에 알맞은 받침을 넣으세요.').then(() => {
      if (state.questions[state.index] === question && !state.currentAnswered) playText(question.word);
    });
  }

  function renderDictation(question) {
    els.wordArea.className = 'batchim-dictation-display';
    els.wordArea.innerHTML = '';
    els.finalBank.innerHTML = '';
    renderAnswerSlots(question);
    renderKeyboard();
    window.setTimeout(focusDictationInput, 0);
    state.autoTimer = setTimeout(() => {
      playText('지금 들리는 낱말을 받침까지 정확히 입력하세요.').then(() => {
        if (state.questions[state.index] === question && !state.currentAnswered) playText(question.word);
      });
    }, 200);
  }

  function isAnswerRevealStage(question) {
    return Boolean(question && question.mode === 'dictation');
  }

  function buildOptions(question) {
    const stageOptions = state.stage.options && state.stage.options.length ? state.stage.options : state.stage.finals;
    const size = Math.max(4, Math.min(8, stageOptions.length || 4));
    const distractors = Array.from(new Set(stageOptions.concat(ALL_FINALS).filter((final) => final && final !== question.final)));
    return shuffle([question.final].concat(shuffle(distractors).slice(0, size - 1)));
  }

  function selectFinal(final, options = {}) {
    state.selectedFinal = String(final || '').trim();
    const slot = $('finalSlot');
    const syllable = slot && slot.closest('.batchim-syllable');
    const finalFill = syllable && syllable.querySelector('.batchim-jamo-final-fill');
    if (slot) {
      slot.dataset.final = state.selectedFinal || '';
      slot.setAttribute('aria-label', state.selectedFinal ? `선택한 받침 ${state.selectedFinal}` : '받침 넣는 곳');
      slot.textContent = '';
    }
    if (syllable && finalFill) {
      finalFill.textContent = state.selectedFinal || '';
      finalFill.style.fontSize = `${getFinalFontSize(state.selectedFinal || syllable.dataset.targetFinal)}px`;
      syllable.classList.toggle('is-filled', Boolean(state.selectedFinal));
      if (options.snapped) {
        syllable.classList.remove('is-snapping', 'is-magnet');
        void syllable.offsetWidth;
        syllable.classList.add('is-snapping');
        window.setTimeout(() => syllable.classList.remove('is-snapping'), 360);
      }
    }
    if (options.sourceElement) {
      options.sourceElement.classList.remove('is-snapping');
      void options.sourceElement.offsetWidth;
      options.sourceElement.classList.add('is-snapping');
      window.setTimeout(() => options.sourceElement.classList.remove('is-snapping'), 360);
    }
  }

  function flashPrompt(type) {
    const card = document.querySelector('.batchim-prompt-card');
    if (!card) return;
    card.classList.remove('is-correct', 'is-wrong');
    void card.offsetWidth;
    card.classList.add(type === 'good' ? 'is-correct' : 'is-wrong');
  }

  function showCorrectModal(word) {
    if (!els.correctModal || !els.correctWordText) return;
    clearModalTimer();
    els.correctWordText.textContent = word;
    els.correctModal.classList.add('is-active');
    els.correctModal.setAttribute('aria-hidden', 'false');
    state.modalTimer = setTimeout(() => {
      state.modalTimer = null;
      els.correctModal.classList.remove('is-active');
      els.correctModal.setAttribute('aria-hidden', 'true');
      nextQuestion();
    }, 1300);
  }

  function hideCorrectModal() {
    if (!els.correctModal) return;
    els.correctModal.classList.remove('is-active');
    els.correctModal.setAttribute('aria-hidden', 'true');
  }

  function submitFinal(final, options = {}) {
    if (state.currentAnswered) return;
    const question = state.questions[state.index];
    if (!question || question.mode !== 'build') return;
    if (String(final || '') === question.final) {
      selectFinal(final, options);
      markResult(true, { autoNext: true });
    } else {
      selectFinal('', {});
      playEffect('wrong');
      flashPrompt('bad');
      feedback('다시 시도해요. 받침 소리를 듣고 빈칸에 맞는 받침을 넣으세요.', 'bad');
      state.selectedFinal = '';
      const slot = $('finalSlot');
      const syllable = slot && slot.closest('.batchim-syllable');
      if (slot) {
        slot.textContent = '';
        slot.classList.add('is-wrong');
        setTimeout(() => slot.classList.remove('is-wrong'), 420);
      }
      if (syllable) syllable.classList.remove('is-filled', 'is-magnet', 'is-snapping');
    }
  }

  function markResult(isCorrect, options = {}) {
    const question = state.questions[state.index];
    if (state.currentAnswered) return;
    state.currentAnswered = true;
    const stat = state.modeStats[question.mode] || { total: 0, correct: 0, wrong: 0 };
    stat.total += 1;
    if (isCorrect) {
      state.correct += 1;
      stat.correct += 1;
      playEffect('correct');
      flashPrompt('good');
      feedback('좋아요. 받침 소리와 표기를 정확하게 연결했어요.', 'good');
      if (question.mode !== 'read') {
        state.autoTimer = setTimeout(() => {
          state.autoTimer = null;
          showCorrectModal(question.word);
          playText(question.word);
        }, 360);
      }
    } else {
      state.wrong += 1;
      stat.wrong += 1;
      playEffect('wrong');
      flashPrompt('bad');
      feedback('다시 확인해요. 같은 문제를 한 번 더 풀어보세요.', 'bad');
      state.currentAnswered = false;
    }
    state.modeStats[question.mode] = stat;
    els.nextButton.hidden = question.mode !== 'read' || !isCorrect;
    els.checkButton.disabled = !isCorrect;
    if (els.progressBar) els.progressBar.style.width = `${Math.round(((state.index + 1) / state.questions.length) * 100)}%`;
    if (isCorrect && options.autoNext && question.mode !== 'read') return;
  }

  function checkCurrent() {
    const question = state.questions[state.index];
    if (!question || state.currentAnswered) return;
    if (question.mode === 'read') {
      markResult(true);
      return;
    }
    if (question.mode === 'build') {
      if (!state.selectedFinal) {
        feedback('받침을 먼저 선택하거나 빈칸에 끌어 넣어주세요.', 'bad');
        return;
      }
      markResult(state.selectedFinal === question.final);
      return;
    }
    const answer = normalizeAnswer(els.answerInput.value);
    if (!answer) {
      feedback('들은 낱말을 입력해 주세요.', 'bad');
      return;
    }
    markResult(answer === normalizeAnswer(question.word));
  }

  function nextQuestion() {
    stopPlayback();
    clearModalTimer();
    hideCorrectModal();
    state.index += 1;
    renderQuestion();
  }

  function composeSyllable(cho, jung, jong = '') {
    if (CHO_INDEX[cho] == null || JUNG_INDEX[jung] == null) return `${cho || ''}${jung || ''}${jong || ''}`;
    return String.fromCharCode(0xac00 + (CHO_INDEX[cho] * 21 * 28) + (JUNG_INDEX[jung] * 28) + (JONG_INDEX[jong] || 0));
  }

  function getComposerText() {
    const { cho, jung, jong } = state.composer;
    if (!cho && !jung && !jong) return '';
    if (cho && jung) return composeSyllable(cho, jung, jong);
    return `${cho || ''}${jung || ''}${jong || ''}`;
  }

  function commitComposer() {
    const text = getComposerText();
    if (text) {
      const next = (els.answerInput.dataset.committed || '') + text;
      els.answerInput.dataset.committed = next;
      els.answerInput.value = next;
    }
    state.composer = { cho: '', jung: '', jong: '' };
  }

  function updateComposerInput() {
    const base = els.answerInput.dataset.committed || '';
    els.answerInput.value = base + getComposerText();
    renderAnswerSlots();
  }

  function resetComposerFromInput() {
    els.answerInput.dataset.committed = els.answerInput.value || '';
    state.composer = { cho: '', jung: '', jong: '' };
    renderAnswerSlots();
  }

  function appendJamo(jamo) {
    const question = state.questions[state.index];
    if (!question || question.mode !== 'dictation' || state.currentAnswered) return;
    const composer = state.composer;
    if (VOWELS.has(jamo)) {
      if (!composer.cho) {
        composer.cho = 'ㅇ';
        composer.jung = jamo;
      } else if (!composer.jung) {
        composer.jung = jamo;
      } else if (!composer.jong) {
        const combined = COMBINE_VOWELS[composer.jung + jamo];
        if (combined) composer.jung = combined;
        else {
          commitComposer();
          state.composer = { cho: 'ㅇ', jung: jamo, jong: '' };
        }
      } else {
        const final = composer.jong;
        const split = SPLIT_FINALS[final];
        if (split) {
          composer.jong = split[0];
          commitComposer();
          state.composer = { cho: split[1], jung: jamo, jong: '' };
        } else {
          composer.jong = '';
          commitComposer();
          state.composer = { cho: final, jung: jamo, jong: '' };
        }
      }
    } else {
      if (!composer.cho) {
        const committed = els.answerInput.dataset.committed || els.answerInput.value || '';
        const chars = Array.from(committed);
        const last = chars[chars.length - 1];
        if (last === jamo && DOUBLE_INITIALS[jamo]) {
          chars[chars.length - 1] = DOUBLE_INITIALS[jamo];
          els.answerInput.dataset.committed = chars.join('');
          els.answerInput.value = els.answerInput.dataset.committed;
          renderAnswerSlots();
          validateDictationProgress();
          return;
        }
        composer.cho = jamo;
      }
      else if (!composer.jung) {
        const doubled = composer.cho === jamo ? DOUBLE_INITIALS[jamo] : '';
        if (doubled) composer.cho = doubled;
        else {
          commitComposer();
          state.composer.cho = jamo;
        }
      } else if (!composer.jong) composer.jong = jamo;
      else {
        const doubledFinal = composer.jong === jamo ? DOUBLE_FINALS[jamo] : '';
        const combinedFinal = COMBINE_FINALS[`${composer.jong}${jamo}`];
        if (doubledFinal) composer.jong = doubledFinal;
        else if (combinedFinal) composer.jong = combinedFinal;
        else {
          commitComposer();
          state.composer.cho = jamo;
        }
      }
    }
    updateComposerInput();
    validateDictationProgress();
  }

  function appendSpace() {
    const question = state.questions[state.index];
    if (!question || question.mode !== 'dictation' || state.currentAnswered) return;
    commitComposer();
    const committed = els.answerInput.dataset.committed || els.answerInput.value || '';
    els.answerInput.dataset.committed = `${committed} `;
    els.answerInput.value = els.answerInput.dataset.committed;
    renderAnswerSlots();
    validateDictationProgress();
  }

  function backspaceInput() {
    const question = state.questions[state.index];
    if (!question || question.mode !== 'dictation' || state.currentAnswered) return;
    if (getComposerText()) {
      const composer = state.composer;
      if (composer.jong) composer.jong = '';
      else if (composer.jung) composer.jung = '';
      else composer.cho = '';
      updateComposerInput();
      return;
    }
    const committed = els.answerInput.dataset.committed || els.answerInput.value || '';
    const next = Array.from(committed).slice(0, -1).join('');
    els.answerInput.dataset.committed = next;
    els.answerInput.value = next;
    renderAnswerSlots();
  }

  function renderAnswerSlots(questionOverride) {
    if (!els.answerSlots) return;
    const question = questionOverride || state.questions[state.index];
    if (!question || question.mode !== 'dictation') {
      els.answerSlots.innerHTML = '';
      return;
    }
    const targetChars = Array.from(normalizeAnswer(question.word));
    const answerChars = Array.from(normalizeAnswer(els.answerInput.value));
    els.answerSlots.innerHTML = targetChars.map((_, index) => `
      <span class="batchim-answer-slot${answerChars[index] ? ' is-filled' : ''}">${escapeHtml(answerChars[index] || '')}</span>
    `).join('');
  }

  function isPartialDictationAnswer(answer, target) {
    const answerChars = Array.from(normalizeAnswer(answer));
    const targetChars = Array.from(normalizeAnswer(target));
    if (!answerChars.length) return true;
    if (answerChars.length > targetChars.length) return false;
    const firstMismatch = answerChars.findIndex((char, index) => char !== targetChars[index]);
    if (firstMismatch < 0) return true;
    if (firstMismatch !== answerChars.length - 1) return false;
    for (let index = 0; index < firstMismatch; index += 1) {
      if (answerChars[index] !== targetChars[index]) return false;
    }
    const answerParts = getSyllableParts(answerChars[firstMismatch]);
    const targetParts = getSyllableParts(targetChars[firstMismatch]);
    if (!answerParts || !targetParts) return false;
    if (answerParts.cho !== targetParts.cho || answerParts.jung !== targetParts.jung) return false;
    if (!answerParts.jong && targetParts.jong) return true;
    const targetFinalParts = SPLIT_FINALS[targetParts.jong];
    return Boolean(targetFinalParts && targetFinalParts[0] === answerParts.jong);
  }

  function validateDictationProgress() {
    const question = state.questions[state.index];
    if (!question || question.mode !== 'dictation' || state.currentAnswered) return;
    renderAnswerSlots(question);
  }

  function confirmDictationAnswer() {
    const question = state.questions[state.index];
    if (!question || question.mode !== 'dictation' || state.currentAnswered) return;
    if (getComposerText()) commitComposer();
    const answer = normalizeAnswer(els.answerInput.value);
    const target = normalizeAnswer(question.word);
    if (!answer) {
      feedback('들은 낱말을 입력해 주세요.', 'bad');
      return;
    }
    if (answer === target) markResult(true, { autoNext: true });
    else handleDictationWrong();
  }

  function handleDictationWrong() {
    if (state.currentAnswered) return;
    state.wrong += 1;
    const question = state.questions[state.index];
    const stat = state.modeStats[question.mode] || { total: 0, correct: 0, wrong: 0 };
    stat.total += 1;
    stat.wrong += 1;
    state.modeStats[question.mode] = stat;
    playEffect('wrong');
    flashPrompt('bad');
    feedback('다시 들어보고 입력해요. 글자 수와 받침 위치를 확인하세요.', 'bad');
    els.answerInput.value = '';
    els.answerInput.dataset.committed = '';
    state.composer = { cho: '', jung: '', jong: '' };
    renderAnswerSlots(question);
    focusDictationInput();
    state.autoTimer = setTimeout(() => playText(question.word), 650);
  }

  function revealDictationAnswer() {
    const question = state.questions[state.index];
    if (!isAnswerRevealStage(question) || state.answerRevealed) return;
    stopPlayback();
    state.answerRevealed = true;
    if (getComposerText()) commitComposer();
    const lastChar = Array.from(question.word).pop() || '';
    const suffix = getJong(lastChar) ? '이에요' : '예요';
    feedback(`정답은 ${question.word}${suffix}. 보고 직접 입력해요.`, 'good');
    playText(question.word);
  }

  function focusDictationInput() {
    const question = state.questions[state.index];
    if (!els.answerInput || !question || question.mode !== 'dictation' || state.currentAnswered) return;
    if (!shouldFocusNativeInput()) return;
    try {
      els.answerInput.focus({ preventScroll: true });
    } catch (_error) {
      try { els.answerInput.focus(); } catch (_innerError) {}
    }
  }

  function shouldFocusNativeInput() {
    if (!window.matchMedia) return true;
    return window.matchMedia('(pointer: fine)').matches;
  }

  function handleDictationKeydown(event) {
    const question = state.questions[state.index];
    if (!question || question.mode !== 'dictation' || state.currentAnswered) return false;
    if (event.metaKey || event.ctrlKey || event.altKey) return false;
    if (state.isNativeComposing) return false;
    if (event.key === 'Enter') {
      event.preventDefault();
      confirmDictationAnswer();
      return true;
    }
    return false;
  }

  function getVirtualKeyButton(key) {
    if (!els.hangulKeyboard || !key) return null;
    return Array.from(els.hangulKeyboard.querySelectorAll('.batchim-key')).find((button) => button.dataset.key === key) || null;
  }

  function pressVirtualKey(key) {
    const button = getVirtualKeyButton(key);
    if (!button) return;
    const previousTimer = state.virtualKeyTimers.get(key);
    if (previousTimer) window.clearTimeout(previousTimer);
    button.classList.remove('is-pressed');
    void button.offsetWidth;
    button.classList.add('is-pressed');
    button.setAttribute('aria-pressed', 'true');
    const timer = window.setTimeout(() => {
      button.classList.remove('is-pressed');
      button.removeAttribute('aria-pressed');
      state.virtualKeyTimers.delete(key);
    }, 170);
    state.virtualKeyTimers.set(key, timer);
  }

  function clearVirtualKeyPresses() {
    state.virtualKeyTimers.forEach((timer) => window.clearTimeout(timer));
    state.virtualKeyTimers.clear();
    if (!els.hangulKeyboard) return;
    els.hangulKeyboard.querySelectorAll('.batchim-key.is-pressed').forEach((button) => {
      button.classList.remove('is-pressed');
      button.removeAttribute('aria-pressed');
    });
  }

  function renderKeyboard() {
    if (!els.hangulKeyboard) return;
    clearVirtualKeyPresses();
    els.hangulKeyboard.innerHTML = KEYBOARD_ROWS.map((row) => `
      <div class="batchim-keyboard-row">
        ${row.map((key) => `<button type="button" class="batchim-key" data-key="${escapeHtml(key)}">${escapeHtml(key === 'space' ? '스페이스' : key)}</button>`).join('')}
      </div>
    `).join('');
    els.hangulKeyboard.querySelectorAll('[data-key]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.key;
        pressVirtualKey(key);
        if (key === '⌫') backspaceInput();
        else if (key === '힌트') revealDictationAnswer();
        else if (key === 'space') appendSpace();
        else appendJamo(key);
      });
    });
  }

  function getScore() {
    return clampScore((state.correct / Math.max(1, state.questions.length)) * 100);
  }

  function getDurationSeconds() {
    return Math.max(1, Math.round((Date.now() - state.startedAtMs) / 1000));
  }

  function buildOpinion(score) {
    const stage = state.stage;
    if (score >= 90) return `${stage.title}에서 받침 소리, 시각적 표기, 받아쓰기 반응이 안정적으로 통합되었습니다. 현재 단계의 일반화 가능성이 높아 다음 단원으로 확장해도 좋습니다.`;
    if (score >= 75) return `${stage.title}의 핵심 받침 인식은 형성되어 있으나, 일부 문항에서 표기 선택 또는 받아쓰기 전환 시 오류가 관찰됩니다. 동일 받침군의 짧은 반복 훈련이 효과적입니다.`;
    return `${stage.title}에서 소리와 표기를 동시에 유지하는 부담이 아직 큽니다. 소리내어 읽기와 받침 카드 매칭을 먼저 안정화한 뒤 받아쓰기로 확장하는 순서가 필요합니다.`;
  }

  function buildRecommendations(score) {
    if (score >= 90) return ['다음 단원으로 이동하되, 시작 전 3문항 빠른 복습을 포함합니다.', '받침이 들어간 짧은 문장 읽기로 일반화를 확인합니다.', '듣고 받아쓰기 문항 비율을 조금씩 높입니다.'];
    if (score >= 75) return ['오답 받침만 따로 모아 소리-입모양-표기 순서로 재확인합니다.', '드래그 받침 채우기를 1회 더 수행한 뒤 받아쓰기를 진행합니다.', '비슷한 소리의 받침을 두 개씩 비교하는 변별 훈련을 추가합니다.'];
    return ['소리내어 읽기 문항을 먼저 반복해 목표 받침의 청각 단서를 강화합니다.', '보기 수를 2개로 줄인 받침 선택 과제부터 다시 시작합니다.', '정답 단어를 따라 말한 뒤 손가락으로 받침 위치를 짚는 루틴을 적용합니다.'];
  }

  function renderReport() {
    const score = getScore();
    const duration = getDurationSeconds();
    const accuracy = Math.round((state.correct / Math.max(1, state.questions.length)) * 100);
    const recommendations = buildRecommendations(score);
    const modeRows = MODE_SEQUENCE.map((mode) => {
      const stat = state.modeStats[mode] || { total: 0, correct: 0 };
      return `${modeLabel(mode)} ${stat.correct}/${stat.total}`;
    }).join(' · ');
    els.reportCapture.innerHTML = `
      <article class="batchim-report-card">
        <div class="batchim-report-top">
          <div>
            <span class="batchim-kicker">BATCHIM REPORT</span>
            <h2 class="batchim-report-title">${escapeHtml(state.stage.title)}</h2>
            <p>${escapeHtml(state.stage.focus)}</p>
          </div>
          <button type="button" class="batchim-btn is-primary" id="reportNextStage">다른 단원 보기</button>
        </div>
        <div class="batchim-report-metrics">
          <div class="batchim-pill"><small>정답 여부</small><strong>${state.correct}/${state.questions.length}</strong></div>
          <div class="batchim-pill"><small>통합 수행점수</small><strong>${score}점</strong></div>
          <div class="batchim-pill"><small>정확도</small><strong>${accuracy}%</strong></div>
          <div class="batchim-pill"><small>소요 시간</small><strong>${duration}초</strong></div>
          <div class="batchim-pill"><small>스테이지 문항 수</small><strong>${QUESTIONS_PER_STAGE}개</strong></div>
          <div class="batchim-pill"><small>실제 등록 문항</small><strong>${state.stage.words.length}개</strong></div>
        </div>
        <section class="batchim-report-section">
          <h3>전문 소견</h3>
          <p>${escapeHtml(buildOpinion(score))}</p>
        </section>
        <section class="batchim-report-section">
          <h3>학습 방식별 결과</h3>
          <p>${escapeHtml(modeRows)}</p>
        </section>
        <section class="batchim-report-section">
          <h3>권장 훈련 방향</h3>
          <p>${recommendations.map(escapeHtml).join('<br>')}</p>
        </section>
        <section class="batchim-report-section">
          <h3>실제 등록된 문항</h3>
          <div class="batchim-registered-list">${state.stage.words.map((word) => `<span>${escapeHtml(word)}</span>`).join('')}</div>
        </section>
        <div class="batchim-actions batchim-report-actions">
          <button type="button" class="batchim-btn is-orange" id="reportRetry">같은 단원 다시 하기</button>
          <button type="button" class="batchim-btn" id="reportOther">스테이지 선택</button>
        </div>
      </article>
    `;
    showScreen('completeView');
    $('reportRetry').addEventListener('click', () => startStage(state.stage.id));
    $('reportOther').addEventListener('click', () => showScreen('stageView'));
    $('reportNextStage').addEventListener('click', () => showScreen('stageView'));
    saveReport(score, duration, accuracy);
  }

  function saveReport(score, durationSeconds, accuracy) {
    if (state.savedRecordId || !window.HahaLabLearningHarness) return;
    const modeBreakdown = {};
    MODE_SEQUENCE.forEach((mode) => {
      const stat = state.modeStats[mode] || { total: 0, correct: 0, wrong: 0 };
      modeBreakdown[mode] = {
        label: modeLabel(mode),
        total: stat.total,
        correct: stat.correct,
        wrong: stat.wrong || Math.max(0, stat.total - stat.correct)
      };
    });
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'cardlab',
      reportScope: 'playlab',
      curriculumKey: 'cardlab-batchim',
      labTitle: '받침 체계 학습',
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      totalQuestions: state.questions.length,
      correctCount: state.correct,
      wrongCount: state.wrong,
      score,
      accuracyScore: accuracy,
      startedAtMs: state.startedAtMs,
      durationSeconds,
      reportType: 'batchim-integrated-literacy',
      focusKey: state.stage.id,
      focusLabel: state.stage.title,
      briefOpinion: buildOpinion(score),
      recommendations: buildRecommendations(score),
      details: {
        stage_name: state.stage.title,
        stage_question_count: QUESTIONS_PER_STAGE,
        registered_question_count: state.stage.words.length,
        registered_items: state.stage.words,
        target_finals: state.stage.finals,
        mode_breakdown: modeBreakdown,
        report_domain: '한글 받침 소리-표기 통합'
      }
    });
    state.savedRecordId = record && record.id ? record.id : String(Date.now());
  }

  function bindEvents() {
    els.stageButton.addEventListener('click', () => {
      leaveCurrentActivity();
      showScreen('stageView');
    });
    els.helpButton.addEventListener('click', () => els.helpModal.classList.add('is-active'));
    els.helpClose.addEventListener('click', () => els.helpModal.classList.remove('is-active'));
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.dataset.closeModal != null) els.helpModal.classList.remove('is-active');
    });
    els.listenButton.addEventListener('click', () => {
      stopPlayback();
      const question = state.questions[state.index];
      if (!question) return;
      playText(question.word);
    });
    els.readDoneButton.addEventListener('click', checkCurrent);
    els.checkButton.addEventListener('click', checkCurrent);
    els.nextButton.addEventListener('click', () => {
      stopPlayback();
      const question = state.questions[state.index];
      if (question && question.mode === 'read' && !state.currentAnswered) markResult(true);
      nextQuestion();
    });
    els.answerPanel.addEventListener('click', focusDictationInput);
    els.answerInput.addEventListener('keydown', (event) => {
      handleDictationKeydown(event);
    });
    document.addEventListener('keydown', (event) => {
      if (event.target === els.answerInput) return;
      if (els.helpModal && els.helpModal.classList.contains('is-active')) return;
      handleDictationKeydown(event);
    });
    els.answerInput.addEventListener('compositionstart', () => {
      state.isNativeComposing = true;
    });
    els.answerInput.addEventListener('compositionend', () => {
      state.isNativeComposing = false;
      resetComposerFromInput();
      validateDictationProgress();
    });
    els.answerInput.addEventListener('input', () => {
      if (state.isNativeComposing) return;
      resetComposerFromInput();
      validateDictationProgress();
    });
    if (els.retryButton) {
      els.retryButton.textContent = '현재 단계 다시 풀기';
      els.retryButton.addEventListener('click', () => state.stage && startStage(state.stage.id));
    }
    if (els.otherStageButton) {
      els.otherStageButton.textContent = '다른 단계 선택하기';
      els.otherStageButton.addEventListener('click', () => showScreen('stageView'));
    }
  }

  function validateStages() {
    const issues = STAGES.flatMap((stage) => {
      const badWords = stage.words.filter((word) => findTargetIndex(word, stage.finals) < 0);
      return [
        stage.words.length !== 50 ? `${stage.title}: ${stage.words.length}개` : '',
        badWords.length ? `${stage.title}: 받침 탐지 실패 ${badWords.join(', ')}` : ''
      ].filter(Boolean);
    });
    if (issues.length) console.warn('[CardLabBatchim] validation issues:', issues);
    window.CARDLAB_BATCHIM_STAGES = STAGES;
    window.CARDLAB_BATCHIM_DEBUG = {
      stages: STAGES,
      getCurrentQuestion: () => state.questions[state.index] || null
    };
  }

  function init() {
    initElements();
    warmGoogleVoices();
    validateStages();
    renderStages();
    bindEvents();
    showScreen('stageView');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
