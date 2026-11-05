(function () {
  'use strict';

  const QUESTION_COUNT = 10;
  const TWENTY_QUESTION_COUNT = 5;
  const CHOICE_COUNT = 4;
  const EASY_CATEGORIES = ['animal', 'bird', 'food', 'fruit', 'vegetable'];
  const HARD_CATEGORIES = ['sea-animal', 'insect', 'tool', 'electronics', 'vehicle', 'public-place', 'livingspace', 'school-supplies'];
  const CATEGORY_LABELS = {
    animal: '동물',
    bird: '새',
    food: '음식',
    fruit: '과일',
    vegetable: '채소',
    'sea-animal': '바다동물',
    insect: '곤충',
    tool: '도구',
    electronics: '전자기기',
    vehicle: '차량',
    'public-place': '장소',
    livingspace: '생활공간',
    'school-supplies': '학용품'
  };
  const DESCRIPTION_ANSWER_OVERRIDES = new Map([
    [
      normalize('깨끗한 강가나 호수에 살아요. 물고기를 냠냠 잡아먹고, 매끈매끈한 몸으로 물 위에서 누워 노는 걸 좋아해요.'),
      '수달'
    ]
  ]);

  const STAGES = [
    {
      id: 'easy-card',
      number: '1단계',
      title: '설명 듣고 카드 찾기',
      mode: 'card',
      categories: EASY_CATEGORIES,
      accent: '#3aa7ff'
    },
    {
      id: 'easy-text',
      number: '2단계',
      title: '설명 듣고 단어 찾기',
      mode: 'text',
      categories: EASY_CATEGORIES,
      accent: '#20bf6b'
    },
    {
      id: 'hard-card',
      number: '3단계',
      title: '설명 듣고 확장 카드 찾기',
      mode: 'card',
      categories: HARD_CATEGORIES,
      accent: '#f59e0b'
    },
    {
      id: 'hard-text',
      number: '4단계',
      title: '설명 듣고 확장 단어 찾기',
      mode: 'text',
      categories: HARD_CATEGORIES,
      accent: '#a855f7'
    },
    {
      id: 'twenty-basic',
      number: '5단계',
      title: '스무고개 기본편',
      mode: 'twenty',
      categories: ['animal', 'device', 'vegetable', 'fruit'],
      twentyLevel: 'basic',
      accent: '#ef4444'
    },
    {
      id: 'twenty-basic-2',
      number: '6단계',
      title: '스무고개 탐색편',
      mode: 'twenty',
      categories: ['animal', 'device', 'vegetable', 'fruit'],
      twentyLevel: 'explore',
      accent: '#f97316'
    },
    {
      id: 'twenty-basic-3',
      number: '7단계',
      title: '스무고개 추론편',
      mode: 'twenty',
      categories: ['animal', 'device', 'vegetable', 'fruit'],
      twentyLevel: 'infer',
      accent: '#14b8a6'
    }
  ];

  const HANGUL_KEYS = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '⌫'],
    ['space']
  ];

  const HANGUL_CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const HANGUL_JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const HANGUL_JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const COMPLEX_VOWELS = {
    'ㅗㅏ': 'ㅘ',
    'ㅗㅐ': 'ㅙ',
    'ㅗㅣ': 'ㅚ',
    'ㅜㅓ': 'ㅝ',
    'ㅜㅔ': 'ㅞ',
    'ㅜㅣ': 'ㅟ',
    'ㅡㅣ': 'ㅢ'
  };
  const SPLIT_COMPLEX_VOWELS = {
    'ㅘ': ['ㅗ', 'ㅏ'],
    'ㅙ': ['ㅗ', 'ㅐ'],
    'ㅚ': ['ㅗ', 'ㅣ'],
    'ㅝ': ['ㅜ', 'ㅓ'],
    'ㅞ': ['ㅜ', 'ㅔ'],
    'ㅟ': ['ㅜ', 'ㅣ'],
    'ㅢ': ['ㅡ', 'ㅣ']
  };
  const COMPLEX_FINALS = {
    'ㄱㅅ': 'ㄳ',
    'ㄴㅈ': 'ㄵ',
    'ㄴㅎ': 'ㄶ',
    'ㄹㄱ': 'ㄺ',
    'ㄹㅁ': 'ㄻ',
    'ㄹㅂ': 'ㄼ',
    'ㄹㅅ': 'ㄽ',
    'ㄹㅌ': 'ㄾ',
    'ㄹㅍ': 'ㄿ',
    'ㄹㅎ': 'ㅀ',
    'ㅂㅅ': 'ㅄ'
  };
  const SPLIT_COMPLEX_FINALS = Object.fromEntries(Object.entries(COMPLEX_FINALS).map(([pair, value]) => [value, pair.split('')]));
  const DOUBLE_INITIALS = { ㄱ: 'ㄲ', ㄷ: 'ㄸ', ㅂ: 'ㅃ', ㅅ: 'ㅆ', ㅈ: 'ㅉ' };
  const DOUBLE_FINALS = { ㄱ: 'ㄲ', ㅅ: 'ㅆ' };

  const CODE_TO_HANGUL_KEY = {
    KeyQ: 'ㅂ',
    KeyW: 'ㅈ',
    KeyE: 'ㄷ',
    KeyR: 'ㄱ',
    KeyT: 'ㅅ',
    KeyY: 'ㅛ',
    KeyU: 'ㅕ',
    KeyI: 'ㅑ',
    KeyO: 'ㅐ',
    KeyP: 'ㅔ',
    KeyA: 'ㅁ',
    KeyS: 'ㄴ',
    KeyD: 'ㅇ',
    KeyF: 'ㄹ',
    KeyG: 'ㅎ',
    KeyH: 'ㅗ',
    KeyJ: 'ㅓ',
    KeyK: 'ㅏ',
    KeyL: 'ㅣ',
    KeyZ: 'ㅋ',
    KeyX: 'ㅌ',
    KeyC: 'ㅊ',
    KeyV: 'ㅍ',
    KeyB: 'ㅠ',
    KeyN: 'ㅜ',
    KeyM: 'ㅡ'
  };
  const QWERTY_TO_HANGUL_KEY = {
    q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
    a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
    z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ'
  };

  const FALLBACK_DESCRIPTIONS = {
    강아지: '사람과 함께 지내는 동물이에요. 꼬리를 흔들고 멍멍 소리를 내요.',
    고양이: '발소리가 조용하고 높은 곳에 잘 올라가요. 야옹 하고 울어요.',
    코끼리: '몸이 아주 크고 긴 코가 있어요. 코로 물건을 집거나 물을 뿌려요.',
    사과: '둥글고 빨갛거나 초록빛이 나요. 아삭하게 씹히는 달콤한 과일이에요.',
    바나나: '길쭉하고 노란 껍질이 있어요. 껍질을 벗겨 부드럽게 먹어요.',
    당근: '주황색 뿌리채소예요. 토끼가 좋아하는 음식으로 자주 나와요.',
    브로콜리: '초록 나무처럼 생긴 채소예요. 데쳐 먹으면 부드럽고 맛있어요.',
    피자: '둥근 빵 위에 치즈와 여러 재료를 올려 구워 먹는 음식이에요.',
    컴퓨터: '화면과 키보드를 사용해 글을 쓰거나 정보를 찾는 전자기기예요.',
    마우스: '손으로 움직여 컴퓨터 화면의 화살표를 옮기는 도구예요.',
    병원: '아플 때 의사 선생님을 만나고 치료를 받으러 가는 장소예요.',
    소방차: '불이 났을 때 출동해요. 사이렌을 울리며 빠르게 달리는 빨간 차예요.'
  };

  const EFFECT_SOUNDS = {
    correct: '../sound/correct.mp3',
    wrong: '../sound/error.mp3',
    complete: '../sound/happy_victory.mp3',
    keyboard: '../sound/etc/keyboard.mp3'
  };

  const KNOWN_MISSING_IMAGE_PATHS = new Set([
    'images/category/animal-crocodile-photo.webp',
    'images/category/animal-mouse-illust.webp',
    'images/category/animal-mouse-photo.webp',
    'images/category/electronics-lamp-photo.webp',
    'images/category/food-malatang-illust.webp',
    'images/category/food-malatang-photo.webp',
    'images/category/food-tanghuru-illust.webp',
    'images/category/food-tanghuru-photo.webp',
    'images/category/food-yoajung-illust.webp',
    'images/category/food-yoajung-photo.webp'
  ]);

  const state = {
    stage: null,
    pool: [],
    questions: [],
    index: 0,
    hintIndex: 0,
    composing: null,
    firstCorrect: 0,
    wrongCount: 0,
    answered: false,
    hadWrong: false,
    audio: null,
    effectAudio: null,
    keyboardAudio: null,
    soundBaseUrl: '',
    soundLookup: new Map(),
    soundLoaded: false,
    textSoundBaseUrl: '',
    textSoundLookup: new Map(),
    textSoundLoaded: false,
    twentySyncingNativeInput: false,
    startedAtMs: 0,
    savedRunId: ''
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

  function formatDescriptionText(value) {
    return escapeHtml(value)
      .replace(/([.!?。！？])\s*/g, '$1<br>')
      .replace(/(?:<br>)+$/g, '');
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFC')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  function shuffle(list) {
    const arr = Array.isArray(list) ? list.slice() : [];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getManifestAssets() {
    const manifest = window.CARDLAB_WEBP_MANIFEST || {};
    if (Array.isArray(manifest)) return manifest;
    if (Array.isArray(manifest.assets)) return manifest.assets;
    if (Array.isArray(manifest.items)) return manifest.items;
    return [];
  }

  function categoryLabel(category) {
    return CATEGORY_LABELS[category] || category || '카드';
  }

  function getQuestionDescription(item) {
    const direct = String(item.description || '').trim();
    if (direct) return direct;
    return FALLBACK_DESCRIPTIONS[item.name] || `${item.name}에 대한 뜻을 보고 알맞은 보기를 찾아보세요.`;
  }

  function imageCandidates(row) {
    const paths = [];
    const add = (value) => {
      const text = String(value || '').trim();
      if (text && !paths.includes(text)) paths.push(text);
    };
    add(row.file_path || row.filePath);
    if (row.file_name || row.fileName) {
      const fileName = row.file_name || row.fileName;
      add(`images/category/${fileName}`);
      add(`images/category/big/${fileName}`);
    }
    return paths;
  }

  function buildCardPool() {
    const grouped = new Map();
    getManifestAssets().forEach((row) => {
      if (!row || row.is_active === false) return;
      const category = String(row.category || '').trim();
      let name = String(row.name_ko || row.nameKo || row.name_ko_auto || row.nameKoAuto || '').trim();
      const filePath = String(row.file_path || row.filePath || '').trim();
      if (!category || !name || !filePath) return;
      if (!EASY_CATEGORIES.includes(category) && !HARD_CATEGORIES.includes(category)) return;
      const description = String(row.description_ko || row.descriptionKo || '').trim();
      const answerOverride = DESCRIPTION_ANSWER_OVERRIDES.get(normalize(description));
      if (answerOverride && name !== answerOverride) return;
      if (answerOverride) name = answerOverride;
      const key = normalize(name);
      if (!key) return;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          name,
          category,
          categoryLabel: String(row.category_ko || row.categoryKo || categoryLabel(category)).trim(),
          description,
          illust: '',
          photo: '',
          image: '',
          nameSoundPath: '',
          descriptionSoundPath: ''
        });
      }
      const item = grouped.get(key);
      const type = normalize(row.asset_type || row.assetType || row.asset_type_ko || row.assetTypeKo);
      const image = imageCandidates(row)[0] || '';
      if (image && KNOWN_MISSING_IMAGE_PATHS.has(image.replace(/^\.?\//, ''))) return;
      if (!item.description && (row.description_ko || row.descriptionKo)) item.description = String(row.description_ko || row.descriptionKo).trim();
      if (!item.nameSoundPath && (row.name_sound_path || row.nameSoundPath)) item.nameSoundPath = String(row.name_sound_path || row.nameSoundPath).trim();
      if (!item.descriptionSoundPath && (row.description_sound_path || row.descriptionSoundPath)) item.descriptionSoundPath = String(row.description_sound_path || row.descriptionSoundPath).trim();
      if (type.includes('illust') && image) item.illust = image;
      if (type.includes('photo') && image) item.photo = image;
      if (!item.image && image) item.image = image;
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        image: item.illust || item.photo || item.image,
        description: getQuestionDescription(item)
      }))
      .filter((item) => item.image && item.name && item.description);
  }

  function getStagePool(stage) {
    const categories = new Set(stage.categories);
    return state.pool.filter((item) => categories.has(item.category));
  }

  function makeQuestion(answer, pool) {
    const distractors = shuffle(pool.filter((item) => item.id !== answer.id)).slice(0, CHOICE_COUNT - 1);
    return {
      answer,
      choices: shuffle([answer, ...distractors])
    };
  }

  function makeQuestions(stage) {
    const pool = getStagePool(stage);
    const byCategory = new Map();
    pool.forEach((item) => {
      if (!byCategory.has(item.category)) byCategory.set(item.category, []);
      byCategory.get(item.category).push(item);
    });
    const picked = [];
    const categoryOrder = shuffle(Array.from(byCategory.keys()));
    while (picked.length < QUESTION_COUNT && picked.length < pool.length) {
      let advanced = false;
      for (const category of categoryOrder) {
        const list = byCategory.get(category) || [];
        const candidate = shuffle(list.filter((item) => !picked.includes(item)))[0];
        if (!candidate) continue;
        picked.push(candidate);
        advanced = true;
        if (picked.length >= QUESTION_COUNT) break;
      }
      if (!advanced) break;
    }
    return shuffle(picked).slice(0, QUESTION_COUNT).map((answer) => makeQuestion(answer, pool));
  }

  function getTwentyData() {
    const source = Array.isArray(window.CARDLAB_TWENTY_QUESTIONS) ? window.CARDLAB_TWENTY_QUESTIONS : [];
    return source.map((item, index) => ({
      ...item,
      textQuestionId: `twenty-${String(index + 1).padStart(4, '0')}`
    }));
  }

  function makeTwentyQuestions(stage) {
    const imageByName = new Map(state.pool.map((item) => [normalize(item.name), item]));
    const stageLevel = stage && stage.twentyLevel ? stage.twentyLevel : 'basic';
    const stageGroups = new Set((stage && stage.categories) || ['animal', 'device', 'vegetable', 'fruit']);
    const eligible = getTwentyData().filter((item) => {
      const group = item.group || 'animal';
      const levels = Array.isArray(item.levels) && item.levels.length ? item.levels : ['basic', 'explore', 'infer'];
      return stageGroups.has(group) && levels.includes(stageLevel);
    });
    const byGroup = new Map();
    eligible.forEach((item) => {
      const group = item.group || 'animal';
      if (!byGroup.has(group)) byGroup.set(group, []);
      byGroup.get(group).push(item);
    });
    const picked = [];
    const groupOrder = shuffle(Array.from(stageGroups).filter((group) => byGroup.has(group)));
    groupOrder.forEach((group) => {
      if (picked.length >= TWENTY_QUESTION_COUNT) return;
      const candidate = shuffle((byGroup.get(group) || []).filter((item) => !picked.includes(item)))[0];
      if (candidate) picked.push(candidate);
    });
    while (picked.length < TWENTY_QUESTION_COUNT && picked.length < eligible.length) {
      const candidate = shuffle(eligible.filter((item) => !picked.includes(item)))[0];
      if (!candidate) break;
      picked.push(candidate);
    }
    return shuffle(picked)
      .slice(0, TWENTY_QUESTION_COUNT)
      .map((item) => {
        const card = imageByName.get(normalize(item.answer)) || null;
        return {
          answer: String(item.answer || '').trim(),
          sourceId: item.textQuestionId || '',
          hints: orderTwentyHints(Array.isArray(item.hints) ? item.hints.filter(Boolean) : []),
          summary: String(item.summary || '').trim(),
          card
        };
      })
      .filter((item) => item.answer && item.hints.length);
  }

  function orderTwentyHints(hints) {
    const clean = hints.filter(Boolean);
    const firstHint = clean[0] || '';
    return [
      firstHint,
      ...shuffle(clean.slice(1, 8)),
      ...clean.slice(8)
    ].filter(Boolean);
  }

  function setScreen(name) {
    const map = {
      select: els.stageSelectView,
      game: els.gameView,
      twenty: els.twentyView,
      complete: els.completeView
    };
    Object.keys(map).forEach((key) => {
      const element = map[key];
      if (!element) return;
      element.classList.toggle('is-active', key === name);
      element.classList.toggle('is-hidden', key !== name);
    });
    if (els.stageSelectButton) els.stageSelectButton.classList.toggle('shell-hidden', name === 'select');
    if (els.shellStageLabel) els.shellStageLabel.classList.toggle('shell-hidden', name === 'select');
    const learningBg = document.documentElement.dataset.learningBg || '';
    if (learningBg && (name === 'game' || name === 'twenty')) {
      document.documentElement.style.setProperty('--shell-page-bg', "url('" + learningBg + "')");
    }
  }

  function renderStageGrid() {
    els.stageGrid.innerHTML = STAGES.map((stage) => {
      const countLabel = stage.mode === 'twenty' ? `${TWENTY_QUESTION_COUNT}문제` : '10문제';
      const tags = stage.mode === 'twenty'
        ? '<span>동물</span><span>전자·생활</span><span>채소</span><span>과일</span>'
        : stage.categories.map((category) => `<span>${escapeHtml(categoryLabel(category))}</span>`).join('');
      return `
        <button type="button" class="df-stage-card" data-stage-id="${escapeHtml(stage.id)}"
          style="--stage-accent:${escapeHtml(stage.accent)};--stage-soft:${escapeHtml(stage.accent)}24">
          <span class="df-stage-number">${escapeHtml(stage.number)} · ${escapeHtml(countLabel)}</span>
          <strong>${escapeHtml(stage.title)}</strong>
          <div class="df-stage-tags">${tags}</div>
        </button>
      `;
    }).join('');
  }

  async function loadSoundManifest() {
    if (state.soundLoaded) return;
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
    } catch (_error) {
      state.soundBaseUrl = window.location.protocol === 'file:'
        ? new URL('../sound/card/', window.location.href).href
        : new URL('/sound/card/', window.location.href).href;
    } finally {
      state.soundLoaded = true;
    }
  }

  async function loadTextSoundManifest() {
    if (state.textSoundLoaded) return;
    try {
      const url = window.location.protocol === 'file:'
        ? '../sound/cardlab-description-find-text/manifest.json'
        : '/sound/cardlab-description-find-text/manifest.json';
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('description text sound manifest unavailable');
      const manifest = await response.json();
      const items = Array.isArray(manifest.items) ? manifest.items : [];
      state.textSoundBaseUrl = new URL('.', response.url).href;
      items.forEach((item) => {
        const id = String(item.id || '').trim();
        const questionId = String(item.questionId || '').trim();
        const textType = String(item.textType || '').trim();
        const order = Number(item.order || 0) || 0;
        const text = String(item.text || '').trim();
        const filePath = String(item.filePath || item.file_path || '').trim();
        if (!filePath) return;
        if (id) state.textSoundLookup.set(`id:${id}`, filePath);
        if (questionId && textType && order) {
          state.textSoundLookup.set(`row:${normalize(questionId)}:${textType}:${order}`, filePath);
        }
        if (textType && text) {
          state.textSoundLookup.set(`text:${textType}:${normalize(text)}`, filePath);
        }
      });
    } catch (_error) {
      state.textSoundBaseUrl = window.location.protocol === 'file:'
        ? new URL('../sound/cardlab-description-find-text/', window.location.href).href
        : new URL('/sound/cardlab-description-find-text/', window.location.href).href;
    } finally {
      state.textSoundLoaded = true;
    }
  }

  function resolveSoundPath(path) {
    const raw = String(path || '').trim();
    if (!raw) return '';
    if (/^(https?:)?\/\//i.test(raw) || /^data:/i.test(raw) || /^blob:/i.test(raw)) return raw;
    if (raw.startsWith('/')) return raw;
    const file = raw.replace(/^sound\/card\//, '');
    return new URL(file, state.soundBaseUrl || new URL('/sound/card/', window.location.href).href).href;
  }

  function resolveTextSoundPath(path) {
    const raw = String(path || '').trim();
    if (!raw) return '';
    if (/^(https?:)?\/\//i.test(raw) || /^data:/i.test(raw) || /^blob:/i.test(raw)) return raw;
    if (raw.startsWith('/')) return raw;
    const file = raw.replace(/^sound\/cardlab-description-find-text\//, '');
    return new URL(file, state.textSoundBaseUrl || new URL('/sound/cardlab-description-find-text/', window.location.href).href).href;
  }

  function textSoundPathFor(questionId, textType, order, text) {
    const type = String(textType || '').trim();
    const safeOrder = Number(order || 0) || 0;
    const byRow = state.textSoundLookup.get(`row:${normalize(questionId)}:${type}:${safeOrder}`);
    if (byRow) return byRow;
    if (type && text) {
      const byText = state.textSoundLookup.get(`text:${type}:${normalize(text)}`);
      if (byText) return byText;
    }
    return '';
  }

  function soundPathFor(item, kind) {
    if (!item) return '';
    if (kind === 'name' && item.nameSoundPath) return item.nameSoundPath;
    if (kind === 'description' && item.descriptionSoundPath) return item.descriptionSoundPath;
    if (kind === 'description') {
      const byText = state.soundLookup.get(`${kind}:text:${normalize(item.description)}`);
      if (byText) return byText;
    }
    const byName = state.soundLookup.get(`${kind}:${normalize(item.name)}`);
    if (byName) return byName;
    return '';
  }

  function stopAudio() {
    if (state.audio) {
      state.audio.pause();
      state.audio.currentTime = 0;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    els.descriptionSpeaker?.classList.remove('is-playing');
  }

  function stopEffectAudio() {
    if (state.effectAudio) {
      state.effectAudio.pause();
      state.effectAudio.currentTime = 0;
    }
  }

  function speak(text) {
    if (!window.speechSynthesis || !text) return Promise.resolve(false);
    window.speechSynthesis.cancel();
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      window.speechSynthesis.speak(utterance);
    });
  }

  async function playAudio(src, options = {}) {
    const url = String(src || '').trim();
    if (!url) return false;
    const audio = options.effect ? (state.effectAudio || new Audio()) : (state.audio || new Audio());
    if (options.effect) {
      stopEffectAudio();
      state.effectAudio = audio;
    } else {
      stopAudio();
      state.audio = audio;
    }
    audio.src = url;
    audio.currentTime = 0;
    audio.volume = options.effect ? 0.72 : 1;
    try {
      await audio.play();
      return true;
    } catch (_error) {
      return false;
    }
  }

  async function playItemName(item, options = {}) {
    await loadTextSoundManifest();
    const textQuestionId = options.questionId || item?.textQuestionId || item?.sourceId || item?.id || '';
    const itemId = item?.id || '';
    const itemName = item?.name || '';
    const localPath = textSoundPathFor(textQuestionId, '정답', 1, itemName)
      || (itemId && itemId !== textQuestionId ? textSoundPathFor(itemId, '정답', 1, itemName) : '')
      || textSoundPathFor('', '정답', 1, itemName);
    if (localPath && await playAudio(resolveTextSoundPath(localPath))) return true;
    await loadSoundManifest();
    const path = soundPathFor(item, 'name');
    if (path && await playAudio(resolveSoundPath(path))) return true;
    return speak(itemName);
  }

  async function playDescription() {
    const question = state.questions[state.index];
    if (!question) return;
    await loadSoundManifest();
    await loadTextSoundManifest();
    const item = question.answer;
    const textPath = textSoundPathFor(item.id, '힌트', 2, item.description);
    const legacyPath = soundPathFor(item, 'description');
    els.descriptionSpeaker.classList.add('is-playing');
    let played = false;
    if (textPath) played = await playAudio(resolveTextSoundPath(textPath));
    if (!played && legacyPath) played = await playAudio(resolveSoundPath(legacyPath));
    if (!played) await speak(item.description);
    els.descriptionSpeaker.classList.remove('is-playing');
  }

  async function playTwentyAnswerSound(question) {
    if (!question) return false;
    const item = question.card
      ? { ...question.card, name: question.answer || question.card.name, textQuestionId: question.sourceId }
      : { id: question.sourceId, name: question.answer, textQuestionId: question.sourceId };
    if (els.twentyModalSpeaker) els.twentyModalSpeaker.classList.add('is-playing');
    try {
      return await playItemName(item, { questionId: question.sourceId });
    } finally {
      if (els.twentyModalSpeaker) els.twentyModalSpeaker.classList.remove('is-playing');
    }
  }

  function playEffect(type) {
    playAudio(EFFECT_SOUNDS[type], { effect: true });
  }

  function playKeyboardSound() {
    const src = EFFECT_SOUNDS.keyboard;
    if (!src) return;
    if (state.keyboardAudio) {
      state.keyboardAudio.pause();
      state.keyboardAudio.currentTime = 0;
    }
    const audio = state.keyboardAudio || new Audio();
    state.keyboardAudio = audio;
    audio.src = src;
    audio.currentTime = 0;
    audio.volume = 0.36;
    audio.play().catch(() => {});
  }

  function setFeedback(text, type) {
    els.feedbackText.textContent = text;
    els.feedbackText.classList.toggle('is-correct', type === 'correct');
    els.feedbackText.classList.toggle('is-wrong', type === 'wrong');
  }

  function setTwentyFeedback(text, type) {
    els.twentyFeedback.textContent = text;
    els.twentyFeedback.classList.toggle('shell-hidden', !text);
    els.twentyFeedback.classList.toggle('is-correct', type === 'correct');
    els.twentyFeedback.classList.toggle('is-wrong', type === 'wrong');
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    if (stage.mode === 'twenty') {
      startTwentyStage(stage);
      return;
    }
    const questions = makeQuestions(stage);
    if (questions.length < QUESTION_COUNT) {
      setFeedback('카드 데이터가 부족해요. 이미지와 뜻이 있는 카드를 확인해 주세요.', 'wrong');
      return;
    }
    stopAudio();
    state.stage = stage;
    state.questions = questions;
    state.index = 0;
    state.firstCorrect = 0;
    state.wrongCount = 0;
    state.answered = false;
    state.hadWrong = false;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    els.shellStageLabel.textContent = `${stage.number} · ${stage.title}`;
    setScreen('game');
    renderQuestion();
  }

  function startTwentyStage(stage) {
    const questions = makeTwentyQuestions(stage);
    if (questions.length < TWENTY_QUESTION_COUNT) {
      setFeedback('스무고개 데이터가 부족해요. 동물 힌트 데이터를 확인해 주세요.', 'wrong');
      return;
    }
    stopAudio();
    state.stage = stage;
    state.questions = questions;
    state.index = 0;
    state.hintIndex = 0;
    state.firstCorrect = 0;
    state.wrongCount = 0;
    state.answered = false;
    state.hadWrong = false;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    els.shellStageLabel.textContent = `${stage.number} · ${stage.title}`;
    setScreen('twenty');
    renderTwentyQuestion();
  }

  function currentQuestion() {
    return state.questions[state.index] || null;
  }

  function renderQuestion() {
    const question = currentQuestion();
    if (!question) {
      finishStage();
      return;
    }
    state.answered = false;
    state.hadWrong = false;
    const stage = state.stage || STAGES[0];
    els.questionProgress.textContent = `문항 ${state.index + 1} / ${state.questions.length}`;
    els.questionTitle.textContent = '';
    els.questionDescription.innerHTML = formatDescriptionText(question.answer.description);
    els.stageModeChip.textContent = '';
    els.stageModeChip.hidden = true;
    setFeedback('', '');
    renderChoices(question, stage);
  }

  function currentTwentyQuestion() {
    return state.questions[state.index] || null;
  }

  function renderTwentyQuestion() {
    const question = currentTwentyQuestion();
    if (!question) {
      finishStage();
      return;
    }
    state.answered = false;
    state.hadWrong = false;
    state.hintIndex = 0;
    els.twentyProgress.textContent = `문항 ${state.index + 1} / ${state.questions.length}`;
    els.twentyAnswerInput.value = '';
    els.twentyAnswerInput.dataset.committed = '';
    els.twentyAnswerInput.disabled = false;
    els.twentyCheckButton.disabled = false;
    renderTwentyHint();
    setTwentyFeedback('', '');
    focusTwentyAnswerInput();
  }

  function renderTwentyHint() {
    const question = currentTwentyQuestion();
    if (!question) return;
    const total = question.hints.length;
    const safeIndex = Math.min(state.hintIndex, total - 1);
    els.twentyHintText.textContent = question.hints[safeIndex];
    els.twentyHintCount.textContent = `힌트 ${safeIndex + 1} / ${total}`;
    const isFinalHint = safeIndex >= total - 1;
    els.nextHintButton.disabled = false;
    els.nextHintButton.classList.toggle('is-answer', isFinalHint);
    els.nextHintButton.setAttribute('aria-label', isFinalHint ? '정답 보기' : '다음 힌트 보기');
    els.nextHintButton.title = isFinalHint ? '정답 보기' : '다음 힌트 보기';
    els.nextHintButton.innerHTML = isFinalHint
      ? '<span class="material-symbols-rounded twenty-next-main" aria-hidden="true">quiz</span>'
      : '<span class="material-symbols-rounded twenty-next-main" aria-hidden="true">arrow_forward</span>';
  }

  function showNextHint() {
    const question = currentTwentyQuestion();
    if (!question || state.answered) return;
    if (state.hintIndex < question.hints.length - 1) {
      state.hintIndex += 1;
      renderTwentyHint();
      setTwentyFeedback('', '');
      return;
    }
    openTwentyAnswerModal(question, { autoplay: false });
  }

  function normalizeAnswer(value) {
    return normalize(value).replace(/[^\u3131-\u318e\uac00-\ud7a3a-z0-9]/gi, '');
  }

  function isConsonant(jamo) {
    return HANGUL_CHO.includes(jamo) || HANGUL_JONG.includes(jamo);
  }

  function isVowel(jamo) {
    return HANGUL_JUNG.includes(jamo);
  }

  function composeSyllable(parts) {
    if (!parts) return '';
    if (!parts.cho || !parts.jung) return `${parts.cho || ''}${parts.jung || ''}${parts.jong || ''}`;
    const cho = HANGUL_CHO.indexOf(parts.cho);
    const jung = HANGUL_JUNG.indexOf(parts.jung);
    const jong = HANGUL_JONG.indexOf(parts.jong || '');
    if (cho < 0 || jung < 0 || jong < 0) return `${parts.cho}${parts.jung}${parts.jong || ''}`;
    return String.fromCharCode(0xac00 + (cho * 21 + jung) * 28 + jong);
  }

  function commitComposing() {
    if (!state.composing) return;
    const committed = els.twentyAnswerInput.dataset.committed || '';
    els.twentyAnswerInput.dataset.committed = committed + composeSyllable(state.composing);
    els.twentyAnswerInput.value = els.twentyAnswerInput.dataset.committed;
    state.composing = null;
  }

  function renderComposing() {
    const base = els.twentyAnswerInput.dataset.committed || '';
    els.twentyAnswerInput.value = base + (state.composing ? composeSyllable(state.composing) : '');
  }

  function syncCommittedFromInput() {
    els.twentyAnswerInput.dataset.committed = els.twentyAnswerInput.value || '';
    state.composing = null;
  }

  function insertHangulJamo(jamo) {
    if (!state.composing && !els.twentyAnswerInput.dataset.committed && els.twentyAnswerInput.value) {
      els.twentyAnswerInput.dataset.committed = els.twentyAnswerInput.value;
    }
    const composing = state.composing;
    if (!composing) {
      if (isConsonant(jamo)) {
        const committed = els.twentyAnswerInput.dataset.committed || els.twentyAnswerInput.value || '';
        const chars = Array.from(committed);
        const last = chars[chars.length - 1];
        if (last === jamo && DOUBLE_INITIALS[jamo]) {
          chars[chars.length - 1] = DOUBLE_INITIALS[jamo];
          els.twentyAnswerInput.dataset.committed = chars.join('');
          renderComposing();
          return;
        }
        state.composing = { cho: jamo, jung: '', jong: '' };
        renderComposing();
        return;
      }
      els.twentyAnswerInput.dataset.committed = (els.twentyAnswerInput.dataset.committed || '') + jamo;
      renderComposing();
      return;
    }

    if (!composing.jung) {
      if (isVowel(jamo)) {
        composing.jung = jamo;
        renderComposing();
        return;
      }
      const doubled = composing.cho === jamo ? DOUBLE_INITIALS[jamo] : '';
      if (doubled) state.composing = { cho: doubled, jung: '', jong: '' };
      else {
        els.twentyAnswerInput.dataset.committed = (els.twentyAnswerInput.dataset.committed || '') + composing.cho;
        state.composing = isConsonant(jamo) ? { cho: jamo, jung: '', jong: '' } : null;
      }
      renderComposing();
      return;
    }

    if (isVowel(jamo)) {
      const complex = COMPLEX_VOWELS[`${composing.jung}${jamo}`];
      if (complex && !composing.jong) {
        composing.jung = complex;
        renderComposing();
        return;
      }
      if (composing.jong) {
        const split = SPLIT_COMPLEX_FINALS[composing.jong];
        if (split) {
          composing.jong = split[0];
          els.twentyAnswerInput.dataset.committed = (els.twentyAnswerInput.dataset.committed || '') + composeSyllable(composing);
          state.composing = { cho: split[1], jung: jamo, jong: '' };
          renderComposing();
          return;
        }
        const nextCho = composing.jong;
        composing.jong = '';
        els.twentyAnswerInput.dataset.committed = (els.twentyAnswerInput.dataset.committed || '') + composeSyllable(composing);
        state.composing = { cho: nextCho, jung: jamo, jong: '' };
        renderComposing();
        return;
      }
      els.twentyAnswerInput.dataset.committed = (els.twentyAnswerInput.dataset.committed || '') + composeSyllable(composing);
      state.composing = { cho: 'ㅇ', jung: jamo, jong: '' };
      renderComposing();
      return;
    }

    if (isConsonant(jamo)) {
      if (!composing.jong && HANGUL_JONG.includes(jamo)) {
        composing.jong = jamo;
        renderComposing();
        return;
      }
      const doubledFinal = composing.jong === jamo ? DOUBLE_FINALS[jamo] : '';
      if (doubledFinal) {
        composing.jong = doubledFinal;
        renderComposing();
        return;
      }
      const complexFinal = COMPLEX_FINALS[`${composing.jong}${jamo}`];
      if (complexFinal) {
        composing.jong = complexFinal;
        renderComposing();
        return;
      }
      els.twentyAnswerInput.dataset.committed = (els.twentyAnswerInput.dataset.committed || '') + composeSyllable(composing);
      state.composing = { cho: jamo, jung: '', jong: '' };
      renderComposing();
    }
  }

  function insertNativeTwentyCharacter(char) {
    const value = String(char || '');
    if (!value) return false;
    if (value === ' ') {
      commitComposing();
      els.twentyAnswerInput.dataset.committed = `${els.twentyAnswerInput.dataset.committed || ''} `;
      renderComposing();
      flashKeyboardKey('space');
      return true;
    }
    if (/^[가-힣]$/.test(value)) {
      commitComposing();
      els.twentyAnswerInput.dataset.committed = (els.twentyAnswerInput.dataset.committed || '') + value;
      renderComposing();
      return true;
    }
    if (/^[ㄱ-ㅎㅏ-ㅣ]$/.test(value)) {
      insertHangulJamo(value);
      flashKeyboardKey(value);
      return true;
    }
    const mapped = QWERTY_TO_HANGUL_KEY[value.toLowerCase()] || '';
    if (mapped) {
      insertHangulJamo(mapped);
      flashKeyboardKey(mapped);
      return true;
    }
    return false;
  }

  function syncTwentyInputFromNativeValue(rawValue) {
    const value = String(rawValue || '').normalize('NFC');
    state.twentySyncingNativeInput = true;
    state.composing = null;
    els.twentyAnswerInput.dataset.committed = '';
    els.twentyAnswerInput.value = '';
    let handledAny = false;
    Array.from(value).forEach((char) => {
      handledAny = insertNativeTwentyCharacter(char) || handledAny;
    });
    if (!handledAny && value) {
      els.twentyAnswerInput.dataset.committed = value;
      renderComposing();
    }
    state.twentySyncingNativeInput = false;
  }

  function insertHangulSpace() {
    if (!els.twentyView.classList.contains('is-active')) return;
    if (state.answered) return;
    commitComposing();
    const committed = els.twentyAnswerInput.dataset.committed || els.twentyAnswerInput.value || '';
    els.twentyAnswerInput.dataset.committed = `${committed} `;
    renderComposing();
  }

  function deleteHangulJamo() {
    if (state.composing) {
      if (state.composing.jong) {
        const splitFinal = SPLIT_COMPLEX_FINALS[state.composing.jong];
        state.composing.jong = splitFinal ? splitFinal[0] : '';
      } else if (state.composing.jung) {
        const splitVowel = SPLIT_COMPLEX_VOWELS[state.composing.jung];
        state.composing.jung = splitVowel ? splitVowel[0] : '';
      } else {
        state.composing = null;
      }
      renderComposing();
      return;
    }
    const committed = els.twentyAnswerInput.dataset.committed || els.twentyAnswerInput.value || '';
    els.twentyAnswerInput.dataset.committed = Array.from(committed).slice(0, -1).join('');
    renderComposing();
  }

  function clearTwentyAnswerInput() {
    state.composing = null;
    els.twentyAnswerInput.value = '';
    els.twentyAnswerInput.dataset.committed = '';
  }

  function checkTwentyAnswer() {
    const question = currentTwentyQuestion();
    if (!question || state.answered) return;
    if (state.composing) {
      const committed = els.twentyAnswerInput.dataset.committed || '';
      els.twentyAnswerInput.value = committed + composeSyllable(state.composing);
      els.twentyAnswerInput.dataset.committed = els.twentyAnswerInput.value;
      state.composing = null;
    }
    const userAnswer = normalizeAnswer(els.twentyAnswerInput.value);
    const answer = normalizeAnswer(question.answer);
    if (!userAnswer) {
      setTwentyFeedback('정답을 입력한 뒤 확인을 눌러주세요.', 'wrong');
      return;
    }
    if (userAnswer === answer) {
      state.answered = true;
      if (!state.hadWrong) state.firstCorrect += 1;
      els.twentyAnswerInput.disabled = true;
      els.twentyCheckButton.disabled = true;
      setTwentyFeedback('', '');
      if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
      playEffect('correct');
      window.setTimeout(() => openTwentyAnswerModal(question, { autoplay: true }), 420);
      return;
    }
    state.hadWrong = true;
    state.wrongCount += 1;
    setTwentyFeedback('아직 아니에요. 다음 힌트를 더 보고 생각해 볼까요?', 'wrong');
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('wrong', { sound: false });
    clearTwentyAnswerInput();
    focusTwentyAnswerInput();
    playEffect('wrong');
  }

  function openTwentyAnswerModal(question, options = {}) {
    const card = question.card;
    els.twentyModalName.textContent = question.answer;
    els.twentyModalDescription.textContent = question.summary || (card && card.description) || question.hints[question.hints.length - 1] || '';
    const image = card && card.image ? card.image : '';
    els.twentyModalImage.hidden = !image;
    els.twentyModalFallback.hidden = !!image;
    if (image) {
      els.twentyModalImage.src = image;
      els.twentyModalImage.alt = question.answer;
    } else {
      els.twentyModalImage.removeAttribute('src');
      els.twentyModalImage.alt = '';
      els.twentyModalFallback.textContent = question.answer.slice(0, 1);
    }
    els.twentyNextQuestionButton.textContent = state.index >= state.questions.length - 1 ? '결과 보기' : '다음 문제';
    if (els.twentyModalSpeaker) {
      els.twentyModalSpeaker.disabled = false;
      els.twentyModalSpeaker.setAttribute('aria-label', `${question.answer} 소리 듣기`);
    }
    els.twentyAnswerModal.classList.add('is-active');
    els.twentyAnswerModal.setAttribute('aria-hidden', 'false');
    if (options.autoplay) {
      window.setTimeout(() => playTwentyAnswerSound(question), 360);
    }
  }

  function closeTwentyAnswerModal() {
    els.twentyAnswerModal.classList.remove('is-active');
    els.twentyAnswerModal.setAttribute('aria-hidden', 'true');
  }

  function nextTwentyQuestion() {
    closeTwentyAnswerModal();
    state.index += 1;
    if (state.index >= state.questions.length) {
      finishStage();
      return;
    }
    renderTwentyQuestion();
  }

  function renderHangulKeyboard() {
    els.hangulKeyboard.innerHTML = HANGUL_KEYS.map((row) => `
      <div class="hangul-keyboard-row">
        ${row.map((key) => `
          <button type="button" class="hangul-key" data-key="${escapeHtml(key)}">${escapeHtml(key === 'space' ? '스페이스' : key)}</button>
        `).join('')}
      </div>
    `).join('');
  }

  function flashKeyboardKey(key) {
    const raw = String(key || '').trim();
    const mapped = raw === 'space' || raw === 'Space'
      ? 'space'
      : (CODE_TO_HANGUL_KEY[raw] || QWERTY_TO_HANGUL_KEY[raw.toLowerCase()] || (raw.length === 1 ? raw : ''));
    if (!mapped) return;
    const button = Array.from(els.hangulKeyboard.querySelectorAll('.hangul-key'))
      .find((item) => item.dataset.key === mapped);
    if (!button) return;
    button.classList.add('is-active');
    window.setTimeout(() => button.classList.remove('is-active'), 160);
  }

  function handleKeyboardClick(event) {
    const key = event.target.closest('.hangul-key');
    if (!key || !els.twentyView.classList.contains('is-active')) return;
    const value = key.dataset.key || '';
    playKeyboardSound();
    if (value === '⌫') {
      deleteHangulJamo();
      flashKeyboardKey(value);
      return;
    }
    if (value === 'space') {
      insertHangulSpace();
      flashKeyboardKey(value);
      return;
    }
    insertHangulJamo(value);
    flashKeyboardKey(value);
  }

  function focusTwentyAnswerInput() {
    if (!els.twentyAnswerInput || state.answered) return;
    if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;
    try {
      els.twentyAnswerInput.focus({ preventScroll: true });
    } catch (_error) {
      try { els.twentyAnswerInput.focus(); } catch (_innerError) {}
    }
  }

  function renderChoices(question, stage) {
    const textMode = stage.mode === 'text';
    els.choiceGrid.classList.toggle('is-text-mode', textMode);
    els.choiceGrid.innerHTML = question.choices.map((choice) => {
      const correct = choice.id === question.answer.id ? 'true' : 'false';
      if (textMode) {
        return `
          <button type="button" class="df-choice df-text-choice" data-choice-id="${escapeHtml(choice.id)}" data-correct="${correct}" aria-label="${escapeHtml(choice.name)}">
            <span class="df-text-word">${escapeHtml(choice.name)}</span>
          </button>
        `;
      }
      return `
        <button type="button" class="df-choice" data-choice-id="${escapeHtml(choice.id)}" data-correct="${correct}" aria-label="${escapeHtml(choice.name)}">
          <span class="df-card-image-wrap"><img src="${escapeHtml(choice.image)}" alt=""></span>
          <span class="df-card-name">${escapeHtml(choice.name)}</span>
        </button>
      `;
    }).join('');
  }

  function findChoiceItem(choiceId) {
    const question = currentQuestion();
    return question ? question.choices.find((item) => item.id === choiceId) || null : null;
  }

  async function handleChoice(event) {
    const button = event.target.closest('.df-choice');
    if (!button || state.answered) return;
    const selected = findChoiceItem(button.dataset.choiceId);
    const question = currentQuestion();
    if (!selected || !question) return;

    button.classList.add('is-revealed');
    const isCorrect = selected.id === question.answer.id;
    if (isCorrect) {
      state.answered = true;
      if (!state.hadWrong) state.firstCorrect += 1;
      button.classList.add('is-correct');
      els.choiceGrid.querySelectorAll('.df-choice').forEach((item) => {
        item.disabled = true;
        if (item !== button) item.classList.add('is-muted');
      });
      setFeedback('', 'correct');
      if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
      playItemName(selected);
      window.setTimeout(() => playEffect('correct'), 380);
      window.setTimeout(nextQuestion, 920);
      return;
    }

    state.hadWrong = true;
    state.wrongCount += 1;
    button.classList.add('is-wrong');
    setFeedback(`${selected.name}은 아니에요. 뜻을 다시 확인하고 골라요.`, 'wrong');
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('wrong', { sound: false });
    playItemName(selected);
    window.setTimeout(() => playEffect('wrong'), 380);
    window.setTimeout(() => {
      button.classList.remove('is-wrong');
      button.disabled = false;
    }, 700);
  }

  function nextQuestion() {
    if (!state.answered) return;
    state.index += 1;
    if (state.index >= state.questions.length) {
      finishStage();
      return;
    }
    renderQuestion();
  }

  function finishStage() {
    stopAudio();
    const total = Math.max(1, state.questions.length);
    const score = Math.round((state.firstCorrect / total) * 100);
    saveLearningReport(score, total);
    els.completeTitle.textContent = `${state.stage ? state.stage.title : '스테이지'} 완료!`;
    els.completeDescription.textContent = '첫 선택 정답을 기준으로 점수를 계산했어요. 틀렸던 낱말도 소리로 한 번 더 확인했어요.';
    els.completeCorrect.textContent = `${state.firstCorrect} / ${total}`;
    els.completeWrong.textContent = `${state.wrongCount}회`;
    els.completeScore.textContent = `${score}점`;
    setScreen('complete');
    playEffect('complete');
  }

  function saveLearningReport(score, total) {
    if (!window.HahaLabLearningHarness || !state.stage || state.savedRunId) return;
    const stage = state.stage;
    const modeLabel = stage.mode === 'twenty' ? '스무고개 단어 추론' : stage.mode === 'text' ? '뜻보고 텍스트 선택' : '뜻보고 카드 선택';
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'cardlab',
      reportScope: 'rehab',
      curriculumKey: 'cardlab-description-find',
      stageKey: stage.id,
      stageTitle: stage.title,
      labTitle: 'CardLab 뜻보고 단어 맞추기',
      totalQuestions: total,
      correctCount: state.firstCorrect,
      wrongCount: state.wrongCount,
      score,
      accuracyScore: score,
      durationSeconds: (Date.now() - (state.startedAtMs || Date.now())) / 1000,
      startedAtMs: state.startedAtMs || Date.now(),
      summary: `${modeLabel}에서 설명을 듣고 목표 단어를 선택했습니다.`,
      overview: '설명 단서를 듣고 단어를 찾는 과제는 수용 어휘, 의미 단서 통합, 선택적 주의, 첫 반응 정확도를 함께 확인하는 카드랩 기록입니다.',
      recommendations: [
        '첫 선택 오류가 반복되는 단어는 특징 단서 두 가지를 말한 뒤 다시 고르게 합니다.',
        '스무고개 단계는 힌트를 하나씩 누적하며 말로 추론 근거를 설명하게 하면 좋습니다.'
      ],
      focusKey: stage.mode === 'twenty' ? 'semantic-inference' : 'receptive-vocabulary',
      focusLabel: modeLabel,
      details: {
        mode: stage.mode,
        twenty_level: stage.twentyLevel || ''
      }
    });
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
  }

  function goStageSelect() {
    stopAudio();
    stopEffectAudio();
    closeTwentyAnswerModal();
    setScreen('select');
  }

  function openHelp() {
    els.helpModal.classList.add('is-active');
    els.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    els.helpModal.classList.remove('is-active');
    els.helpModal.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
    els.stageGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (button) startStage(button.dataset.stageId);
    });
    els.choiceGrid.addEventListener('click', handleChoice);
    els.descriptionSpeaker.addEventListener('click', playDescription);
    els.nextHintButton.addEventListener('click', showNextHint);
    els.twentyCheckButton.addEventListener('click', checkTwentyAnswer);
    els.twentyModalSpeaker.addEventListener('click', () => {
      const question = currentTwentyQuestion();
      if (question) playTwentyAnswerSound(question);
    });
    els.twentyNextQuestionButton.addEventListener('click', nextTwentyQuestion);
    els.hangulKeyboard.addEventListener('click', handleKeyboardClick);
    els.twentyAnswerInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        checkTwentyAnswer();
        return;
      }
      if (!els.twentyView.classList.contains('is-active') || state.answered) return;
      if (event.key === 'Backspace') flashKeyboardKey('⌫');
      else if (event.code === 'Space' || event.key === ' ') flashKeyboardKey('space');
      else flashKeyboardKey(event.key);
    });
    els.twentyAnswerInput.addEventListener('input', () => {
      if (!els.twentyView.classList.contains('is-active') || state.twentySyncingNativeInput) return;
      syncTwentyInputFromNativeValue(els.twentyAnswerInput.value);
      playKeyboardSound();
    });
    els.stageSelectButton.addEventListener('click', goStageSelect);
    els.completeStageButton.textContent = '다른 단계 선택하기';
    els.retryButton.textContent = '현재 단계 다시 풀기';
    els.completeStageButton.addEventListener('click', goStageSelect);
    els.retryButton.addEventListener('click', () => startStage(state.stage ? state.stage.id : STAGES[0].id));
    els.helpButton.addEventListener('click', openHelp);
    els.helpModalOk.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-help-close]')) closeHelp();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHelp();
      if (event.code === 'Space' && els.gameView.classList.contains('is-active')) {
        event.preventDefault();
        playDescription();
      }
      if (els.twentyView.classList.contains('is-active')) {
        if (event.key === 'Backspace') flashKeyboardKey('⌫');
        else if (event.code === 'Space' || event.key === ' ') flashKeyboardKey('space');
        else flashKeyboardKey(event.key);
        flashKeyboardKey(event.code);
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAudio();
        stopEffectAudio();
      }
    });
  }

  function cacheElements() {
    [
      'stageSelectView',
      'gameView',
      'twentyView',
      'completeView',
      'stageGrid',
      'shellStageLabel',
      'stageSelectButton',
      'helpButton',
      'questionProgress',
      'questionTitle',
      'questionDescription',
      'descriptionSpeaker',
      'feedbackText',
      'stageModeChip',
      'choiceGrid',
      'twentyProgress',
      'twentyHintCount',
      'twentyHintText',
      'nextHintButton',
      'twentyAnswerInput',
      'twentyCheckButton',
      'twentyFeedback',
      'hangulKeyboard',
      'completeTitle',
      'completeDescription',
      'completeCorrect',
      'completeWrong',
      'completeScore',
      'retryButton',
      'completeStageButton',
      'helpModal',
      'helpModalOk',
      'twentyAnswerModal',
      'twentyModalImage',
      'twentyModalFallback',
      'twentyModalName',
      'twentyModalDescription',
      'twentyModalSpeaker',
      'twentyNextQuestionButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function init() {
    cacheElements();
    const required = ['stageSelectView', 'gameView', 'completeView', 'stageGrid', 'choiceGrid', 'descriptionSpeaker', 'feedbackText'];
    if (required.some((id) => !els[id])) return;
    state.pool = buildCardPool();
    renderHangulKeyboard();
    renderStageGrid();
    bindEvents();
    loadSoundManifest();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
