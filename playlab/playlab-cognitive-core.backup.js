(function () {
  'use strict';

  const CONFIG = window.PLAYLAB_COGNITIVE_CONFIG || {};
  const MODES = {
    pattern: '규칙을 보고 다음 그림을 고르세요.',
    missing: '같은 무리에 들어갈 그림을 고르세요.',
    memory: '순서를 보고 알맞은 그림을 고르세요.',
    switch: '규칙을 확인하고 맞는 그림을 고르세요.',
    emotion: '표정과 상황에 어울리는 마음을 고르세요.',
    maze: '목표까지 가는 첫 방향을 고르세요.',
    analogy: '앞의 관계를 보고 빈칸에 들어갈 그림을 고르세요.',
    sound: '소리를 듣고 알맞은 그림을 고르세요.',
    reaction: '신호 규칙에 맞게 빠르게 고르세요.',
    story: '이야기 순서를 보고 다음 장면을 고르세요.'
  };
  const BG_COUNT = 11;
  const DEFAULT_ACCENT = CONFIG.accent || '#0ea5e9';
  const $ = (id) => document.getElementById(id);
  const state = {
    stageIndex: 0,
    questionIndex: 0,
    questions: [],
    correct: 0,
    wrong: 0,
    score: 0,
    logs: [],
    stageStartedAt: 0,
    questionStartedAt: 0,
    savedRunId: '',
    answering: false,
    mazeRun: null,
    memorySequenceTimer: null
  };
  let audioContext = null;
  const feedbackAudioCache = {};

  const els = {
    shell: document.querySelector('.cognitive-shell'),
    stageLabel: $('shellStageLabel'),
    stageButton: $('stageSelectButton'),
    helpButton: $('helpButton'),
    stageView: $('stageSelectView'),
    lessonView: $('lessonView'),
    resultView: $('resultView'),
    stageGrid: $('stageGrid'),
    lessonMount: $('lessonMount'),
    resultMount: $('resultMount'),
    helpModal: $('cognitiveHelpModal'),
    helpClose: $('cognitiveHelpClose')
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function shuffle(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const pick = Math.floor(Math.random() * (index + 1));
      [result[index], result[pick]] = [result[pick], result[index]];
    }
    return result;
  }

  function pick(items, count, offset = 0) {
    if (!items.length) return [];
    const shuffled = shuffle(items);
    const rotated = shuffled.slice(offset).concat(shuffled.slice(0, offset));
    return rotated.slice(0, Math.min(count, rotated.length));
  }

  function clearMemorySequenceTimer() {
    if (state.memorySequenceTimer) {
      window.clearTimeout(state.memorySequenceTimer);
      state.memorySequenceTimer = null;
    }
  }

  function normalizeAsset(asset) {
    return {
      id: asset.id || asset.file_path || asset.name_ko,
      name: asset.name_ko || asset.name || '그림',
      nameEn: asset.name_en || asset.name || asset.file_name || '',
      category: asset.category || 'object',
      categoryKo: asset.category_ko || '그림',
      type: asset.asset_type || '',
      src: asset.file_path || asset.path || ''
    };
  }

  function loadAssets() {
    const manifest = window.CARDLAB_WEBP_MANIFEST || {};
    const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
    const byKey = new Map();
    assets.forEach((asset) => {
      const normalized = normalizeAsset(asset);
      if (!normalized.src || !/[가-힣]/.test(normalized.name)) return;
      const key = `${normalized.category}:${normalized.name}:${normalized.type}`;
      if (!byKey.has(key)) byKey.set(key, normalized);
    });
    return Array.from(byKey.values());
  }

  const ALL_ASSETS = loadAssets();
  const MISSING_ASSET_PATHS = new Set([
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
  const CATEGORY_ASSETS = ALL_ASSETS.filter((asset) => asset.src.includes('/category/'));
  const USABLE_CATEGORY_ASSETS = CATEGORY_ASSETS.filter((asset) => !MISSING_ASSET_PATHS.has(asset.src));
  const ILLUST_ASSETS = USABLE_CATEGORY_ASSETS.filter((asset) => asset.type === 'illust' || asset.src.includes('-illust'));
  const PHOTO_ASSETS = USABLE_CATEGORY_ASSETS.filter((asset) => asset.type === 'photo' || asset.src.includes('-photo'));
  const CATEGORY_ALIASES = {
    transport: ['vehicle', 'conveyance'],
    emotion: ['movement', 'state', 'family']
  };

  const FALLBACK_ASSETS = [
    { id: 'apple', name: '사과', category: 'fruit', categoryKo: '과일', src: 'images/category/fruit-apple-illust.webp', type: 'illust' },
    { id: 'banana', name: '바나나', category: 'fruit', categoryKo: '과일', src: 'images/category/fruit-banana-illust.webp', type: 'illust' },
    { id: 'cat', name: '고양이', category: 'animal', categoryKo: '동물', src: 'images/category/animal-cat-illust.webp', type: 'illust' },
    { id: 'puppy', name: '강아지', category: 'animal', categoryKo: '동물', src: 'images/category/animal-puppy-illust.webp', type: 'illust' },
    { id: 'bus', name: '버스', category: 'vehicle', categoryKo: '탈것', src: 'images/category/vehicle-bus-illust.webp', type: 'illust' },
    { id: 'chair', name: '의자', category: 'object', categoryKo: '사물', src: 'images/category/object-chair-illust.webp', type: 'illust' }
  ];

  function normalizeCategories(categories) {
    if (!categories || !categories.length) return [];
    return Array.from(new Set(categories.flatMap((category) => CATEGORY_ALIASES[category] || category)));
  }

  function assetsFor(categories, options = {}) {
    const normalizedCategories = normalizeCategories(categories);
    const source = options.photo ? PHOTO_ASSETS : ILLUST_ASSETS.length ? ILLUST_ASSETS : CATEGORY_ASSETS;
    const selected = source.filter((asset) => !normalizedCategories.length || normalizedCategories.includes(asset.category));
    return selected.length >= (options.min || 4) ? selected : FALLBACK_ASSETS;
  }

  function assetByName(category, name) {
    return assetsFor([category], { min: 1 }).find((asset) => asset.name === name);
  }

  function assetCard(asset, label = asset.name) {
    return `
      <div class="cognitive-card-mini">
        ${asset && asset.src ? `<img src="${escapeHtml(asset.src)}" alt="${escapeHtml(label)}">` : ''}
        <span>${escapeHtml(label)}</span>
      </div>
    `;
  }

  function assetImageOnlyCard(asset) {
    return `
      <div class="cognitive-card-mini is-image-only">
        ${asset && asset.src ? `<img src="${escapeHtml(asset.src)}" alt="${escapeHtml(asset.name)}">` : ''}
      </div>
    `;
  }

  const PATTERN_TOKENS = [
    { id: 'red-dot', label: '빨간 도트', shape: 'dot', color: '#f97316', soft: '#fff7ed' },
    { id: 'blue-circle', label: '파란 원', shape: 'circle', color: '#0ea5e9', soft: '#eff6ff' },
    { id: 'green-triangle', label: '초록 세모', shape: 'triangle', color: '#22c55e', soft: '#f0fdf4' },
    { id: 'yellow-square', label: '노란 네모', shape: 'square', color: '#facc15', soft: '#fefce8' },
    { id: 'pink-dot', label: '분홍 도트', shape: 'dot', color: '#ec4899', soft: '#fdf2f8' },
    { id: 'violet-circle', label: '보라 원', shape: 'circle', color: '#8b5cf6', soft: '#f5f3ff' },
    { id: 'teal-triangle', label: '청록 세모', shape: 'triangle', color: '#14b8a6', soft: '#f0fdfa' },
    { id: 'indigo-square', label: '남색 네모', shape: 'square', color: '#6366f1', soft: '#eef2ff' }
  ];

  function patternTokenCard(token, variant = '') {
    const shape = token && token.shape ? token.shape : 'dot';
    return `
      <div class="cognitive-pattern-token-card ${variant ? `is-${escapeHtml(variant)}` : ''}" data-pattern-token="${escapeHtml(token.id)}" aria-label="${escapeHtml(token.label)}" style="--pattern-color:${escapeHtml(token.color)}; --pattern-soft:${escapeHtml(token.soft)}">
        <div class="cognitive-pattern-symbol is-${escapeHtml(shape)}" aria-hidden="true"></div>
      </div>
    `;
  }

  function patternUnitForStage(stageIndex, tokens) {
    if (stageIndex < 2) return [tokens[0], tokens[1]];
    if (stageIndex < 4) return [tokens[0], tokens[0], tokens[1]];
    if (stageIndex < 6) return [tokens[0], tokens[1], tokens[1]];
    if (stageIndex < 8) return [tokens[0], tokens[1], tokens[2]];
    return [tokens[0], tokens[1], tokens[2], tokens[3]];
  }

  function patternBlankIndex(unitLength, questionIndex, length) {
    const offsets = Array.from({ length: Math.max(1, unitLength - 1) }, (_, index) => index + 1);
    const offset = offsets[questionIndex % offsets.length];
    return Math.min(length - 1, unitLength + offset);
  }

  function questionMark() {
    return '<div class="cognitive-question-mark" data-answer-drop="true">?</div>';
  }

  function patternArrow() {
    return '<span class="cognitive-pattern-arrow" aria-hidden="true"></span>';
  }

  function choice(label, correct, asset) {
    return {
      label,
      correct: Boolean(correct),
      asset: asset || null,
      id: `${label}-${Math.random().toString(36).slice(2)}`
    };
  }

  function patternChoice(token, correct) {
    return {
      label: token.label,
      correct: Boolean(correct),
      asset: null,
      patternToken: token,
      id: `${token.id}-${Math.random().toString(36).slice(2)}`
    };
  }

  function defaultStages() {
    return Array.from({ length: 9 }, (_, index) => {
      const level = index + 1;
      return {
        title: `${level}단계`,
        subtitle: level < 4 ? '기초 규칙을 천천히 확인해요.' : level < 7 ? '단서를 기억하며 골라요.' : '복합 규칙을 빠르게 판단해요.',
        badge: level < 4 ? '입문' : level < 7 ? '도전' : '집중',
        questions: 8,
        scoreTarget: 600 + index * 80
      };
    });
  }

  function getStages() {
    const base = Array.isArray(CONFIG.stages) && CONFIG.stages.length ? CONFIG.stages : defaultStages();
    return base.slice(0, 9).map((stage, index) => ({
      ...stage,
      title: stage.title || `${index + 1}단계`,
      subtitle: stage.subtitle || '문제를 보고 알맞은 답을 골라요.',
      badge: stage.badge || (index < 3 ? '입문' : index < 6 ? '도전' : '집중'),
      questions: stage.questions || 8,
      scoreTarget: stage.scoreTarget || 600 + index * 80
    }));
  }

  const STAGES = getStages();

  function buildPatternQuestion(stageIndex, questionIndex) {
    const pool = pick(PATTERN_TOKENS, 8, stageIndex + questionIndex);
    const unit = patternUnitForStage(stageIndex, pool);
    const length = 8;
    const sequence = Array.from({ length }, (_, index) => unit[index % unit.length]);
    const blankIndex = patternBlankIndex(unit.length, questionIndex, sequence.length);
    const answer = sequence[blankIndex];
    const wrongPool = pool
      .filter((token) => token.id !== answer.id)
      .filter((token, index, list) => list.findIndex((item) => item.id === token.id) === index);
    const choices = shuffle([patternChoice(answer, true), ...pick(wrongPool, 3).map((token) => patternChoice(token, false))]);
    return {
      prompt: '빈칸에 들어갈 색과 모양을 고르세요.',
      lead: '',
      visual: `<div class="cognitive-sequence is-pattern-sequence" style="--item-count:${sequence.length}" data-pattern-unit-length="${unit.length}" data-pattern-blank-index="${blankIndex}" data-pattern-answer="${escapeHtml(answer.id)}" data-pattern-sequence="${escapeHtml(sequence.map((token) => token.id).join(','))}">${sequence.map((token, index) => `${index > 0 ? patternArrow() : ''}${index === blankIndex ? questionMark() : patternTokenCard(token, 'sequence')}`).join('')}</div>`,
      choices,
      answer: answer.label,
      axis: 'visualPattern'
    };
  }

  function buildMissingQuestion(stageIndex, questionIndex) {
    const categories = ['animal', 'fruit', 'vegetable', 'food', 'transport', 'object'];
    const category = categories[(stageIndex + questionIndex) % categories.length];
    const same = pick(assetsFor([category]), 5, questionIndex);
    const other = pick(assetsFor(categories.filter((item) => item !== category)), 5, stageIndex);
    const answer = same[3] || same[0];
    const choices = shuffle([choice(answer.name, true, answer), ...other.slice(0, 3).map((asset) => choice(asset.name, false, asset))]);
    return {
      prompt: `${same[0]?.categoryKo || '같은 무리'}에 어울리는 그림을 고르세요.`,
      lead: '왼쪽 그림들과 같은 무리를 찾아요.',
      visual: `<div class="cognitive-grid-visual">${same.slice(0, 3).map((asset) => assetCard(asset)).join('')}${questionMark()}</div>`,
      choices,
      answer: answer.name,
      axis: 'visualClassification'
    };
  }

  function memoryOrdinal(index) {
    return ['첫번째', '두번째', '세번째', '네번째', '다섯번째'][index] || `${index + 1}번째`;
  }

  function buildMemoryQuestion(stageIndex, questionIndex) {
    const count = Math.min(5, 3 + Math.floor(stageIndex / 3));
    const stage = STAGES[stageIndex] || {};
    const pool = pick(assetsFor(['animal', 'fruit', 'food', 'object', 'transport']), count + 5, stageIndex + questionIndex);
    const sequence = pool.slice(0, count);
    const targetIndex = Math.max(0, Math.min(count - 1, Number(stage.memoryTargetIndex) || 0));
    const targetLabel = memoryOrdinal(targetIndex);
    const answer = sequence[targetIndex] || sequence[0];
    const choices = shuffle([choice(answer.name, true, answer), ...pool.slice(count, count + 3).map((asset) => choice(asset.name, false, asset))]);
    return {
      prompt: `${targetLabel} 그림을 기억하세요.`,
      lead: `그림이 한 장씩 지나간 뒤, ${targetLabel} 그림을 찾아보세요.`,
      visual: `<div class="cognitive-sequence is-memory-review" style="--item-count:${sequence.length}">${sequence.map((asset) => assetImageOnlyCard(asset)).join('')}</div>`,
      choices,
      answer: answer.name,
      sequence,
      memoryTargetIndex: targetIndex,
      memoryTargetLabel: targetLabel,
      axis: 'workingMemory'
    };
  }

  function buildSwitchQuestion(stageIndex, questionIndex) {
    const categories = ['animal', 'fruit', 'vegetable', 'food', 'transport', 'object'];
    const targetCategory = categories[(stageIndex + questionIndex) % categories.length];
    const ruleSame = (stageIndex + questionIndex) % 2 === 0;
    const target = pick(assetsFor([targetCategory]), 1, questionIndex)[0];
    const same = pick(assetsFor([targetCategory]), 3, questionIndex + 1);
    const diff = pick(assetsFor(categories.filter((item) => item !== targetCategory)), 5, questionIndex);
    const answer = ruleSame ? same[0] : diff[0];
    const wrongs = ruleSame ? diff.slice(0, 3) : same.concat(diff.slice(1, 3)).slice(0, 3);
    return {
      prompt: ruleSame ? '같은 무리 그림을 고르세요.' : '다른 무리 그림을 고르세요.',
      lead: '규칙이 문제마다 바뀌니 먼저 규칙을 확인해요.',
      visual: `<div class="cognitive-sequence" style="--item-count:1">${assetCard(target, `기준: ${target.name}`)}</div>`,
      choices: shuffle([choice(answer.name, true, answer), ...wrongs.map((asset) => choice(asset.name, false, asset))]),
      answer: answer.name,
      axis: 'cognitiveFlexibility'
    };
  }

  const EMOTION_SCENES = [
    { label: '재미있어요', group: 'play', src: 'images/emotion-mind/emotion-mind-01-fun-game.webp', prompt: '게임기를 하며 활짝 웃고 있어요.', conflicts: ['기대돼요', '신기해요'] },
    { label: '설레요', group: 'affection', src: 'images/emotion-mind/emotion-mind-02-flutter-watch.webp', prompt: '좋아하는 사람을 멀리서 바라보며 두근거려요.', conflicts: ['사랑해요', '기대돼요', '부끄러워요'] },
    { label: '사랑해요', group: 'affection', src: 'images/emotion-mind/emotion-mind-03-love-heart.webp', prompt: '서로 손을 잡고 하트를 보며 마음을 전해요.', conflicts: ['설레요', '고마워요', '안심돼요'] },
    { label: '신기해요', group: 'interest', src: 'images/emotion-mind/emotion-mind-04-magic-amazed.webp', prompt: '마술사가 보여준 마술을 보고 눈이 커졌어요.', conflicts: ['궁금해요', '깜짝 놀랐어요', '재미있어요'] },
    { label: '궁금해요', group: 'interest', src: 'images/emotion-mind/emotion-mind-05-curious-magnifier.webp', prompt: '돋보기로 상자를 살피며 무엇인지 알고 싶어 해요.', conflicts: ['신기해요', '기대돼요'] },
    { label: '기대돼요', group: 'positive', src: 'images/emotion-mind/emotion-mind-06-expect-gift.webp', prompt: '선물 상자를 열기 전이라 마음이 기다려져요.', conflicts: ['설레요', '궁금해요', '재미있어요'] },
    { label: '당당해요', group: 'positive', src: 'images/emotion-mind/emotion-mind-07-confident-stand.webp', prompt: '가슴을 펴고 자신 있게 서 있어요.', conflicts: ['뿌듯해요'] },
    { label: '외로워요', group: 'sad', src: 'images/emotion-mind/emotion-mind-08-lonely-bench.webp', prompt: '혼자 벤치에 앉아 친구를 기다리고 있어요.', conflicts: ['속상해요', '삐졌어요'] },
    { label: '짜증나요', group: 'anger', src: 'images/emotion-mind/emotion-mind-09-annoyed-arms.webp', prompt: '마음대로 되지 않아 팔짱을 끼고 찡그리고 있어요.', conflicts: ['화나요', '삐졌어요'] },
    { label: '깜짝 놀랐어요', group: 'arousal', src: 'images/emotion-mind/emotion-mind-10-surprised-jump.webp', prompt: '갑자기 풍선이 터져서 몸이 움찔했어요.', conflicts: ['신기해요', '긴장돼요', '무서워요'] },
    { label: '부끄러워요', group: 'social', src: 'images/emotion-mind/emotion-mind-11-shy-blush.webp', prompt: '칭찬을 듣고 얼굴이 빨개졌어요.', conflicts: ['설레요', '긴장돼요'] },
    { label: '뿌듯해요', group: 'positive', src: 'images/emotion-mind/emotion-mind-12-proud-award.webp', prompt: '열심히 한 일로 상장을 받아 마음이 꽉 차요.', conflicts: ['당당해요', '고마워요'] },
    { label: '속상해요', group: 'sad', src: 'images/emotion-mind/emotion-mind-13-upset-tears.webp', prompt: '아끼던 장난감이 망가져 눈물이 나요.', conflicts: ['외로워요', '삐졌어요'] },
    { label: '긴장돼요', group: 'arousal', src: 'images/emotion-mind/emotion-mind-14-nervous-presentation.webp', prompt: '발표 차례가 되어 손에 땀이 나요.', conflicts: ['깜짝 놀랐어요', '무서워요', '부끄러워요'] },
    { label: '삐졌어요', group: 'anger', src: 'images/emotion-mind/emotion-mind-15-sulking-turn.webp', prompt: '마음이 상해서 등을 돌리고 입을 내밀었어요.', conflicts: ['짜증나요', '속상해요', '화나요'] },
    { label: '화나요', group: 'anger', src: 'images/emotion-mind/emotion-mind-16-angry-02-classroom-photo.webp', prompt: '블록 탑이 무너져서 주먹을 꼭 쥐고 화가 났어요.', conflicts: ['짜증나요', '삐졌어요'] },
    { label: '배고파요', group: 'body-food', src: 'images/emotion-mind/emotion-mind-17-hungry-belly.webp', prompt: '배에서 꼬르륵 소리가 나서 먹고 싶어요.', conflicts: ['목말라요', '배불러요'] },
    { label: '배불러요', group: 'body-food', src: 'images/emotion-mind/emotion-mind-18-full-belly.webp', prompt: '밥을 많이 먹어서 배를 톡톡 두드려요.', conflicts: ['배고파요', '맛있어요'] },
    { label: '맛있어요', group: 'taste', src: 'images/emotion-mind/emotion-mind-19-delicious-food.webp', prompt: '음식을 먹고 웃으며 엄지를 들어요.', conflicts: ['배불러요', '맛없어요'] },
    { label: '맛없어요', group: 'taste', src: 'images/emotion-mind/emotion-mind-20-bad-taste.webp', prompt: '한입 먹고 얼굴을 찡그렸어요.', conflicts: ['맛있어요', '짜증나요'] },
    { label: '목말라요', group: 'body-food', src: 'images/emotion-mind/emotion-mind-21-thirst-02-park-photo.webp', prompt: '공원에서 뛰고 난 뒤 물병을 찾으며 목말라해요.', conflicts: ['배고파요', '더워요'] },
    { label: '힘들어요', group: 'body', src: 'images/emotion-mind/emotion-mind-22-hard-tired.webp', prompt: '달리기를 해서 지쳐 보여요.', conflicts: ['졸려요', '더워요'] },
    { label: '더워요', group: 'temperature', src: 'images/emotion-mind/emotion-mind-23-hot-fan.webp', prompt: '햇볕 아래에서 부채질을 하며 땀을 흘려요.', conflicts: ['목말라요', '힘들어요'] },
    { label: '추워요', group: 'temperature', src: 'images/emotion-mind/emotion-mind-24-cold-shiver.webp', prompt: '목도리를 하고 몸을 떨며 추워하고 있어요.', conflicts: ['무서워요'] },
    { label: '졸려요', group: 'body', src: 'images/emotion-mind/emotion-mind-25-sleepy-yawn.webp', prompt: '눈이 감기고 크게 하품을 해요.', conflicts: ['힘들어요', '안심돼요'] },
    { label: '무서워요', group: 'arousal', src: 'images/emotion-mind/emotion-mind-26-scared-dark.webp', prompt: '어두운 방에서 그림자를 보고 뒤로 물러나요.', conflicts: ['긴장돼요', '깜짝 놀랐어요', '추워요'] },
    { label: '고마워요', group: 'positive', src: 'images/emotion-mind/emotion-mind-27-thankful-gift.webp', prompt: '친구가 도와주자 두 손을 모아 고마워해요.', conflicts: ['사랑해요', '뿌듯해요', '안심돼요'] },
    { label: '안심돼요', group: 'positive', src: 'images/emotion-mind/emotion-mind-28-relieved-hug.webp', prompt: '걱정하던 일이 괜찮아져 편안하게 숨을 쉬어요.', conflicts: ['사랑해요', '고마워요', '졸려요'] }
  ];
  const EMOTION_VARIANTS =   {
      "재미있어요": [
          {
              "src": "images/emotion-mind/emotion-mind-01-fun-game.webp",
              "prompt": "게임기를 하며 활짝 웃고 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-01-fun-02-playground-laugh-photo.webp",
              "prompt": "놀이터 미끄럼틀을 타며 재미있게 웃고 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-01-fun-03-boardgame-family-illust.webp",
              "prompt": "가족과 보드게임을 하며 즐겁게 웃고 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-01-fun-04-adult-karaoke-photo.webp",
              "prompt": "노래를 부르며 신나고 재미있어해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-01-fun-05-science-bubbles-illust.webp",
              "prompt": "비눗방울 놀이를 하며 재미있게 웃고 있어요."
          }
      ],
      "설레요": [
          {
              "src": "images/emotion-mind/emotion-mind-02-flutter-watch.webp",
              "prompt": "좋아하는 사람을 멀리서 바라보며 두근거려요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-02-flutter-02-school-hall-photo.webp",
              "prompt": "학교 복도에서 좋아하는 사람을 멀리서 보며 설레요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-02-flutter-03-cafe-window-illust.webp",
              "prompt": "창밖의 좋아하는 사람을 바라보며 마음이 두근거려요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-02-flutter-04-flower-path-photo.webp",
              "prompt": "꽃을 들고 좋아하는 사람을 기다리며 설레요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-02-flutter-05-classroom-note-illust.webp",
              "prompt": "교실에서 좋아하는 친구를 바라보며 설레요."
          }
      ],
      "사랑해요": [
          {
              "src": "images/emotion-mind/emotion-mind-03-love-heart.webp",
              "prompt": "서로 손을 잡고 하트를 보며 마음을 전해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-03-love-02-couple-heart-photo.webp",
              "prompt": "두 사람이 손을 잡고 사랑하는 마음을 전해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-03-love-03-parent-child-illust.webp",
              "prompt": "부모와 아이가 안아주며 사랑을 느껴요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-03-love-04-grandparent-photo.webp",
              "prompt": "할머니와 손자가 손을 잡고 따뜻한 사랑을 나눠요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-03-love-05-friends-heart-illust.webp",
              "prompt": "친구에게 하트 카드를 주며 사랑하는 마음을 표현해요."
          }
      ],
      "신기해요": [
          {
              "src": "images/emotion-mind/emotion-mind-04-magic-amazed.webp",
              "prompt": "마술사가 보여준 마술을 보고 눈이 커졌어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-04-amazed-02-magic-hat-photo.webp",
              "prompt": "마술 모자에서 색깔 천이 나와서 신기해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-04-amazed-03-floating-card-illust.webp",
              "prompt": "카드가 공중에 떠서 신기하게 바라봐요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-04-amazed-04-science-glow-photo.webp",
              "prompt": "과학 실험이 빛나서 신기해해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-04-amazed-05-rabbit-magic-illust.webp",
              "prompt": "마술 모자에서 토끼가 나와 신기해요."
          }
      ],
      "궁금해요": [
          {
              "src": "images/emotion-mind/emotion-mind-05-curious-magnifier.webp",
              "prompt": "돋보기로 상자를 살피며 무엇인지 알고 싶어 해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-05-curious-02-mystery-box-photo.webp",
              "prompt": "수상한 상자 안에 무엇이 있는지 궁금해해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-05-curious-03-bug-magnifier-illust.webp",
              "prompt": "돋보기로 작은 벌레를 보며 궁금해해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-05-curious-04-adult-map-photo.webp",
              "prompt": "지도를 보며 어디로 가는지 궁금해해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-05-curious-05-door-crack-illust.webp",
              "prompt": "살짝 열린 문 안쪽이 궁금해서 들여다봐요."
          }
      ],
      "기대돼요": [
          {
              "src": "images/emotion-mind/emotion-mind-06-expect-gift.webp",
              "prompt": "선물 상자를 열기 전이라 마음이 기다려져요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-06-expect-02-birthday-wait-photo.webp",
              "prompt": "생일 케이크 상자를 기다리며 기대돼요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-06-expect-03-curtain-stage-illust.webp",
              "prompt": "무대 커튼이 열리기 전이라 기대돼요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-06-expect-04-airport-arrival-photo.webp",
              "prompt": "공항에서 가족을 기다리며 기대돼요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-06-expect-05-calendar-trip-illust.webp",
              "prompt": "소풍 가는 날을 기다리며 기대돼요."
          }
      ],
      "당당해요": [
          {
              "src": "images/emotion-mind/emotion-mind-07-confident-stand.webp",
              "prompt": "가슴을 펴고 자신 있게 서 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-07-confident-02-speech-photo.webp",
              "prompt": "발표를 마치고 자신 있게 서 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-07-confident-03-super-pose-illust.webp",
              "prompt": "허리에 손을 올리고 당당하게 서 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-07-confident-04-adult-meeting-photo.webp",
              "prompt": "회의에서 자신 있게 발표하고 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-07-confident-05-sports-winner-illust.webp",
              "prompt": "달리기 전 자신감 있게 서 있어요."
          }
      ],
      "외로워요": [
          {
              "src": "images/emotion-mind/emotion-mind-08-lonely-bench.webp",
              "prompt": "혼자 벤치에 앉아 친구를 기다리고 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-08-lonely-02-cafeteria-photo.webp",
              "prompt": "식탁에 혼자 앉아 외로워 보여요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-08-lonely-03-rain-window-illust.webp",
              "prompt": "비 오는 창밖을 혼자 바라보며 외로워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-08-lonely-04-adult-park-photo.webp",
              "prompt": "공원 벤치에 혼자 앉아 외로워 보여요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-08-lonely-05-empty-playground-illust.webp",
              "prompt": "빈 놀이터에 혼자 서 있어 외로워 보여요."
          }
      ],
      "짜증나요": [
          {
              "src": "images/emotion-mind/emotion-mind-09-annoyed-arms.webp",
              "prompt": "마음대로 되지 않아 팔짱을 끼고 찡그리고 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-09-annoyed-02-homework-photo.webp",
              "prompt": "숙제가 잘 안 풀려서 짜증난 얼굴이에요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-09-annoyed-03-toy-wont-work-illust.webp",
              "prompt": "장난감이 작동하지 않아 짜증나요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-09-annoyed-04-adult-line-photo.webp",
              "prompt": "긴 줄을 기다리며 짜증난 표정이에요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-09-annoyed-05-noise-illust.webp",
              "prompt": "계속 나는 소리 때문에 짜증나요."
          }
      ],
      "깜짝 놀랐어요": [
          {
              "src": "images/emotion-mind/emotion-mind-10-surprised-jump.webp",
              "prompt": "갑자기 풍선이 터져서 몸이 움찔했어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-10-surprised-02-balloon-photo.webp",
              "prompt": "풍선이 갑자기 터져서 깜짝 놀랐어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-10-surprised-03-jackbox-illust.webp",
              "prompt": "상자에서 인형이 튀어나와 깜짝 놀랐어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-10-surprised-04-adult-phone-photo.webp",
              "prompt": "갑자기 휴대폰 알람이 울려 깜짝 놀랐어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-10-surprised-05-cat-door-illust.webp",
              "prompt": "문 뒤에서 고양이가 튀어나와 깜짝 놀랐어요."
          }
      ],
      "부끄러워요": [
          {
              "src": "images/emotion-mind/emotion-mind-11-shy-blush.webp",
              "prompt": "칭찬을 듣고 얼굴이 빨개졌어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-11-shy-02-compliment-photo.webp",
              "prompt": "칭찬을 받고 얼굴을 가리며 부끄러워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-11-shy-03-stage-bow-illust.webp",
              "prompt": "작은 공연 후 인사를 하며 부끄러워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-11-shy-04-adult-intro-photo.webp",
              "prompt": "처음 인사하는 자리에서 수줍게 웃어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-11-shy-05-class-attention-illust.webp",
              "prompt": "모두가 그림을 봐서 얼굴이 빨개졌어요."
          }
      ],
      "뿌듯해요": [
          {
              "src": "images/emotion-mind/emotion-mind-12-proud-award.webp",
              "prompt": "열심히 한 일로 상장을 받아 마음이 꽉 차요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-12-proud-02-puzzle-photo.webp",
              "prompt": "퍼즐을 완성해서 뿌듯해해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-12-proud-03-clean-room-illust.webp",
              "prompt": "방을 깨끗이 정리해서 뿌듯해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-12-proud-04-adult-cooking-photo.webp",
              "prompt": "직접 만든 음식을 보며 뿌듯해해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-12-proud-05-plant-grown-illust.webp",
              "prompt": "키운 식물이 자라서 뿌듯해해요."
          }
      ],
      "속상해요": [
          {
              "src": "images/emotion-mind/emotion-mind-13-upset-tears.webp",
              "prompt": "아끼던 장난감이 망가져 눈물이 나요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-13-upset-02-spilled-icecream-photo.webp",
              "prompt": "아이스크림을 떨어뜨려 속상해해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-13-upset-03-broken-crayon-illust.webp",
              "prompt": "크레파스와 그림이 망가져 속상해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-13-upset-04-adult-message-photo.webp",
              "prompt": "아쉬운 소식을 보고 속상한 표정이에요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-13-upset-05-lost-toy-illust.webp",
              "prompt": "좋아하는 장난감을 잃어버려 속상해요."
          }
      ],
      "긴장돼요": [
          {
              "src": "images/emotion-mind/emotion-mind-14-nervous-presentation.webp",
              "prompt": "발표 차례가 되어 손에 땀이 나요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-14-nervous-02-test-photo.webp",
              "prompt": "시험을 앞두고 손에 힘이 들어가 긴장돼요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-14-nervous-03-doctor-wait-illust.webp",
              "prompt": "진료 차례를 기다리며 긴장돼요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-14-nervous-04-adult-interview-photo.webp",
              "prompt": "면접을 앞두고 긴장된 표정이에요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-14-nervous-05-music-recital-illust.webp",
              "prompt": "연주 발표 전이라 긴장돼요."
          }
      ],
      "삐졌어요": [
          {
              "src": "images/emotion-mind/emotion-mind-15-sulking-turn.webp",
              "prompt": "마음이 상해서 등을 돌리고 입을 내밀었어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-15-sulking-02-back-turned-photo.webp",
              "prompt": "친구에게서 등을 돌리고 삐진 표정이에요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-15-sulking-03-toy-share-illust.webp",
              "prompt": "장난감을 못 써서 삐졌어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-15-sulking-04-adult-sofa-photo.webp",
              "prompt": "소파에 앉아 입을 내밀고 삐진 표정이에요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-15-sulking-05-dinner-table-illust.webp",
              "prompt": "원하는 것을 못 먹어서 삐졌어요."
          }
      ],
      "화나요": [
          {
              "src": "images/emotion-mind/emotion-mind-16-angry-02-classroom-photo.webp",
              "prompt": "블록 탑이 무너져서 주먹을 꼭 쥐고 화가 났어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-16-angry-03-sibling-toy-illust.webp",
              "prompt": "동생이 장난감을 망가뜨려서 화가 났어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-16-angry-04-adult-traffic-photo.webp",
              "prompt": "버스를 놓쳐서 얼굴을 찡그리고 화가 났어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-16-angry-05-toy-illust.webp",
              "prompt": "망가진 장난감을 보며 화가 났어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-16-angry-06-teen-game-photo.webp",
              "prompt": "게임에서 져서 주먹을 쥐고 화가 났어요."
          }
      ],
      "배고파요": [
          {
              "src": "images/emotion-mind/emotion-mind-17-hungry-belly.webp",
              "prompt": "배에서 꼬르륵 소리가 나서 먹고 싶어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-17-hungry-02-lunchbox-photo.webp",
              "prompt": "도시락을 보며 배고파해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-17-hungry-03-food-thought-illust.webp",
              "prompt": "음식을 떠올리며 배고파해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-17-hungry-04-adult-kitchen-photo.webp",
              "prompt": "냉장고 앞에서 배고파해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-17-hungry-05-after-sports-illust.webp",
              "prompt": "운동 후 샌드위치를 보며 배고파해요."
          }
      ],
      "배불러요": [
          {
              "src": "images/emotion-mind/emotion-mind-18-full-belly.webp",
              "prompt": "밥을 많이 먹어서 배를 톡톡 두드려요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-18-full-02-restaurant-photo.webp",
              "prompt": "식사를 마치고 배를 두드리며 배불러해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-18-full-03-picnic-illust.webp",
              "prompt": "소풍 음식을 먹고 배불러해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-18-full-04-adult-dinner-photo.webp",
              "prompt": "저녁을 먹고 배가 불러 만족해해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-18-full-05-party-cake-illust.webp",
              "prompt": "케이크를 먹고 배불러해요."
          }
      ],
      "맛있어요": [
          {
              "src": "images/emotion-mind/emotion-mind-19-delicious-food.webp",
              "prompt": "음식을 먹고 웃으며 엄지를 들어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-19-delicious-02-noodle-photo.webp",
              "prompt": "국수를 먹고 맛있어서 웃어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-19-delicious-03-strawberry-illust.webp",
              "prompt": "딸기 디저트를 먹고 맛있어해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-19-delicious-04-adult-soup-photo.webp",
              "prompt": "국물을 맛보고 맛있어해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-19-delicious-05-lunchbox-illust.webp",
              "prompt": "도시락을 먹으며 맛있어해요."
          }
      ],
      "맛없어요": [
          {
              "src": "images/emotion-mind/emotion-mind-20-bad-taste.webp",
              "prompt": "한입 먹고 얼굴을 찡그렸어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-20-bad-taste-02-vegetable-photo.webp",
              "prompt": "쓴 채소를 먹고 맛없어해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-20-bad-taste-03-sour-lemon-illust.webp",
              "prompt": "신 레몬을 먹고 얼굴을 찡그려요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-20-bad-taste-04-adult-coffee-photo.webp",
              "prompt": "음료를 마시고 맛없어하는 표정이에요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-20-bad-taste-05-burnt-toast-illust.webp",
              "prompt": "탄 토스트를 보고 맛없어해요."
          }
      ],
      "목말라요": [
          {
              "src": "images/emotion-mind/emotion-mind-21-thirst-02-park-photo.webp",
              "prompt": "공원에서 뛰고 난 뒤 물병을 찾으며 목말라해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-21-thirst-03-sports-photo.webp",
              "prompt": "운동을 마친 뒤 빈 물병을 들고 목말라해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-21-thirst-04-adult-office-photo.webp",
              "prompt": "책상 앞에서 빈 컵을 보고 물을 마시고 싶어 해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-21-thirst-05-hiking-illust.webp",
              "prompt": "산책길에서 빈 물통을 보며 목말라해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-21-thirst-06-library-photo.webp",
              "prompt": "공부하다가 목을 만지며 물을 마시고 싶어 해요."
          }
      ],
      "힘들어요": [
          {
              "src": "images/emotion-mind/emotion-mind-22-hard-tired.webp",
              "prompt": "달리기를 해서 지쳐 보여요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-22-tired-hard-02-stairs-photo.webp",
              "prompt": "무거운 가방을 메고 계단을 올라 힘들어해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-22-tired-hard-03-cleaning-illust.webp",
              "prompt": "장난감을 치우느라 힘들어해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-22-tired-hard-04-adult-box-photo.webp",
              "prompt": "무거운 상자를 옮기고 힘들어해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-22-tired-hard-05-exercise-illust.webp",
              "prompt": "운동을 끝내고 지쳐 힘들어해요."
          }
      ],
      "더워요": [
          {
              "src": "images/emotion-mind/emotion-mind-23-hot-fan.webp",
              "prompt": "햇볕 아래에서 부채질을 하며 땀을 흘려요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-23-hot-02-fan-photo.webp",
              "prompt": "더운 방에서 부채질하며 땀을 흘려요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-23-hot-03-beach-illust.webp",
              "prompt": "강한 햇볕 아래에서 더워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-23-hot-04-adult-bus-photo.webp",
              "prompt": "더운 버스 안에서 손부채질을 해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-23-hot-05-playground-illust.webp",
              "prompt": "놀이터 그늘에서 땀을 흘리며 더워해요."
          }
      ],
      "추워요": [
          {
              "src": "images/emotion-mind/emotion-mind-24-cold-shiver.webp",
              "prompt": "목도리를 하고 몸을 떨며 추워하고 있어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-24-cold-02-winter-photo.webp",
              "prompt": "겨울 외투를 입고 몸을 웅크리며 추워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-24-cold-03-blanket-illust.webp",
              "prompt": "담요를 두르고 이를 떨며 추워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-24-cold-04-adult-snow-photo.webp",
              "prompt": "눈 오는 날 어깨를 움츠리며 추워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-24-cold-05-ice-rink-illust.webp",
              "prompt": "빙판 옆에서 목도리를 하고 추워해요."
          }
      ],
      "졸려요": [
          {
              "src": "images/emotion-mind/emotion-mind-25-sleepy-yawn.webp",
              "prompt": "눈이 감기고 크게 하품을 해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-25-sleepy-02-desk-photo.webp",
              "prompt": "책상 앞에서 하품하며 졸려해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-25-sleepy-03-bedtime-illust.webp",
              "prompt": "베개 옆에서 눈을 비비며 졸려해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-25-sleepy-04-adult-train-photo.webp",
              "prompt": "지하철에서 꾸벅꾸벅 졸려해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-25-sleepy-05-storybook-illust.webp",
              "prompt": "책을 보다가 눈이 감겨 졸려해요."
          }
      ],
      "무서워요": [
          {
              "src": "images/emotion-mind/emotion-mind-26-scared-dark.webp",
              "prompt": "어두운 방에서 그림자를 보고 뒤로 물러나요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-26-scared-02-dark-hall-photo.webp",
              "prompt": "어두운 복도에서 담요를 잡고 무서워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-26-scared-03-thunder-illust.webp",
              "prompt": "천둥 소리에 귀를 막고 무서워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-26-scared-04-adult-movie-photo.webp",
              "prompt": "영화를 보다가 손을 얼굴 가까이 대고 무서워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-26-scared-05-shadow-illust.webp",
              "prompt": "벽에 비친 큰 그림자를 보고 무서워해요."
          }
      ],
      "고마워요": [
          {
              "src": "images/emotion-mind/emotion-mind-27-thankful-gift.webp",
              "prompt": "친구가 도와주자 두 손을 모아 고마워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-27-thankful-02-dropped-books-photo.webp",
              "prompt": "친구가 책을 주워줘서 고마워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-27-thankful-03-umbrella-illust.webp",
              "prompt": "우산을 함께 써줘서 고마워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-27-thankful-04-adult-door-photo.webp",
              "prompt": "문을 잡아준 사람에게 고마워해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-27-thankful-05-bandage-illust.webp",
              "prompt": "상처를 돌봐줘서 고마워해요."
          }
      ],
      "안심돼요": [
          {
              "src": "images/emotion-mind/emotion-mind-28-relieved-hug.webp",
              "prompt": "걱정하던 일이 괜찮아져 편안하게 숨을 쉬어요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-28-relieved-02-found-pet-photo.webp",
              "prompt": "잃어버린 반려동물을 찾아 안심해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-28-relieved-03-test-result-illust.webp",
              "prompt": "괜찮다는 말을 듣고 안심해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-28-relieved-04-adult-lost-wallet-photo.webp",
              "prompt": "잃어버린 지갑을 찾아 안심해요."
          },
          {
              "src": "images/emotion-mind/emotion-mind-28-relieved-05-caregiver-hug-illust.webp",
              "prompt": "보호자에게 안겨 마음이 편안해져요."
          }
      ]
  };

  function sceneVariant(scene) {
    const overrideVariants = EMOTION_VARIANTS[scene.label];
    const variants = Array.isArray(overrideVariants) ? overrideVariants : (Array.isArray(scene.variants) ? scene.variants.filter((variant) => variant && variant.src) : []);
    const pool = Array.isArray(overrideVariants) ? variants : (scene.src ? [{ src: scene.src, prompt: scene.prompt }, ...variants] : variants);
    if (!pool.length) return { src: scene.src || '', prompt: scene.prompt || '' };
    return pool[Math.floor(Math.random() * pool.length)] || pool[0];
  }

  function sceneAsset(scene, variant) {
    const src = (variant && variant.src) || scene.src;
    if (src) {
      return { src, name: scene.label, category: 'emotion', categoryKo: '마음', type: 'illust' };
    }
    return assetByName(scene.assetCategory, scene.assetName) || assetsFor([scene.assetCategory], { min: 1 })[0] || FALLBACK_ASSETS[0];
  }

  function pickEmotionDistractors(scene, stageIndex, questionIndex) {
    const blocked = new Set([scene.label].concat(scene.conflicts || []));
    const seed = (stageIndex + 1) * 17 + questionIndex * 7;
    const clearPool = EMOTION_SCENES.filter((item) => !blocked.has(item.label) && item.group !== scene.group);
    const fallbackPool = EMOTION_SCENES.filter((item) => !blocked.has(item.label));
    const mixed = pick(clearPool, 3, seed);
    if (mixed.length >= 3) return mixed;
    fallbackPool.forEach((item) => {
      if (mixed.length < 3 && !mixed.some((seen) => seen.label === item.label)) mixed.push(item);
    });
    return mixed.slice(0, 3);
  }

  function buildEmotionQuestion(stageIndex, questionIndex) {
    const stage = STAGES[stageIndex] || STAGES[0];
    const scene = EMOTION_SCENES[((stageIndex * stage.questions) + questionIndex) % EMOTION_SCENES.length];
    const variant = sceneVariant(scene);
    const hintText = variant.prompt || scene.prompt || '';
    const answerAsset = sceneAsset(scene, variant);
    const distractors = pickEmotionDistractors(scene, stageIndex, questionIndex);
    const choices = shuffle([choice(scene.label, true), ...distractors.map((item) => choice(item.label, false))]);
    return {
      prompt: '',
      lead: '',
      hintText,
      visual: `
        <div class="cognitive-emotion-scene">
          <div class="cognitive-emotion-image-card">
            ${answerAsset && answerAsset.src ? `<img src="${escapeHtml(answerAsset.src)}" alt="마음 단서 그림">` : ''}
          </div>
          <button type="button" class="cognitive-hint-button" data-hint-toggle data-hint-value="${escapeHtml(hintText)}">힌트보기</button>
        </div>
      `,
      choices,
      answer: scene.label,
      axis: 'socialCognition'
    };
  }

  function buildMaze(stageIndex, questionIndex) {
    if (CONFIG.mazeGame === true) return buildMazeGameQuestion(stageIndex, questionIndex);
    return buildMazeChoiceQuestion(stageIndex, questionIndex);
  }

  function buildMazeChoiceQuestion(stageIndex, questionIndex) {
    const map = generateMazeMap(stageIndex, questionIndex, { size: 5, loops: 3 });
    const firstMove = getShortestPath(map)[0]?.name || '오른쪽';
    const cells = renderMazeChoiceCells(map);
    return {
      prompt: '도착까지 갈 수 있는 첫 방향을 고르세요.',
      lead: '막힌 길을 피해서 한 칸씩 계획해요.',
      visual: `<div class="cognitive-maze" style="--maze-size:${map.size}">${cells}</div>`,
      choices: shuffle(['위', '아래', '왼쪽', '오른쪽'].map((label) => choice(label, label === firstMove))),
      answer: firstMove,
      axis: 'planning'
    };
  }

  function renderMazeChoiceCells(map) {
    let cells = '';
    for (let y = 0; y < map.size; y += 1) {
      for (let x = 0; x < map.size; x += 1) {
        const key = `${x},${y}`;
        const cls = key === `${map.start.x},${map.start.y}` ? ' cognitive-maze-start' : key === `${map.goal.x},${map.goal.y}` ? ' cognitive-maze-goal' : map.walls.has(key) ? ' cognitive-maze-wall' : '';
        const text = key === `${map.start.x},${map.start.y}` ? '출발' : key === `${map.goal.x},${map.goal.y}` ? '도착' : '';
        cells += `<div class="cognitive-maze-cell${cls}">${escapeHtml(text)}</div>`;
      }
    }
    return cells;
  }

  function mazeRng(seed) {
    let value = Math.max(1, Math.floor(seed) % 2147483647);
    return function random() {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  function mazeSeed(stageIndex, mapIndex) {
    const runSeed = state.mazeRun && state.mazeRun.seed ? state.mazeRun.seed : Date.now();
    return runSeed + (stageIndex + 1) * 1009 + (mapIndex + 1) * 7919;
  }

  function mazeStageSettings(stage, stageIndex) {
    const fallbackSize = 7 + Math.floor(stageIndex / 2) * 2;
    const rawCols = Number(stage.mazeCols || stage.mazeSize || fallbackSize);
    const rawRows = Number(stage.mazeRows || stage.mazeSize || fallbackSize + 6 + stageIndex * 2);
    const cols = Math.max(5, rawCols % 2 === 0 ? rawCols + 1 : rawCols);
    const rows = Math.max(7, rawRows % 2 === 0 ? rawRows + 1 : rawRows);
    const rawVisible = Number(stage.mazeVisibleSize || CONFIG.mazeVisibleSize || 7);
    const visibleSize = Math.max(5, rawVisible % 2 === 0 ? rawVisible + 1 : rawVisible);
    const loops = 4 + stageIndex * 4;
    return { cols, rows, visibleSize, loops };
  }

  function generateMazeMap(stageIndex, mapIndex, override = {}) {
    const stage = STAGES[stageIndex] || {};
    const settings = { ...mazeStageSettings(stage, stageIndex), ...override };
    const cols = Math.max(5, settings.cols || settings.size || 7);
    const rows = Math.max(7, settings.rows || settings.size || cols);
    const visibleSize = Math.min(Math.max(5, settings.visibleSize || 7), cols, rows);
    const random = mazeRng(mazeSeed(stageIndex, mapIndex));
    const walls = new Set();
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) walls.add(`${x},${y}`);
    }
    const start = { x: 1, y: 1 };
    const goal = { x: cols - 2, y: rows - 2 };
    const carve = (x, y) => walls.delete(`${x},${y}`);
    carve(start.x, start.y);
    const stack = [start];
    const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]];
    while (stack.length) {
      const current = stack[stack.length - 1];
      const nextDirs = shuffle(dirs).sort(() => random() - 0.5);
      const nextDir = nextDirs.find(([dx, dy]) => {
        const nx = current.x + dx;
        const ny = current.y + dy;
        return nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 && walls.has(`${nx},${ny}`);
      });
      if (!nextDir) {
        stack.pop();
        continue;
      }
      const [dx, dy] = nextDir;
      const nx = current.x + dx;
      const ny = current.y + dy;
      carve(current.x + dx / 2, current.y + dy / 2);
      carve(nx, ny);
      stack.push({ x: nx, y: ny });
    }
    const candidates = [];
    for (let y = 1; y < rows - 1; y += 1) {
      for (let x = 1; x < cols - 1; x += 1) {
        const key = `${x},${y}`;
        if (!walls.has(key)) continue;
        const horizontal = !walls.has(`${x - 1},${y}`) && !walls.has(`${x + 1},${y}`);
        const vertical = !walls.has(`${x},${y - 1}`) && !walls.has(`${x},${y + 1}`);
        if (horizontal || vertical) candidates.push({ x, y });
      }
    }
    shuffle(candidates).slice(0, settings.loops || 0).forEach((cell) => walls.delete(`${cell.x},${cell.y}`));
    walls.delete(`${start.x},${start.y}`);
    walls.delete(`${goal.x},${goal.y}`);
    return {
      id: `maze-${stageIndex + 1}-${mapIndex + 1}`,
      size: Math.max(cols, rows),
      cols,
      rows,
      visibleSize,
      walls,
      start,
      goal,
      player: { ...start },
      direction: 'down',
      moves: 0,
      wrongMoves: 0,
      trail: [`${start.x},${start.y}`],
      shortestPathLength: getShortestPath({ cols, rows, walls, start, goal }).length
    };
  }

  function getShortestPath(map) {
    const cols = map.cols || map.size;
    const rows = map.rows || map.size;
    const steps = [
      { dx: 1, dy: 0, name: '오른쪽', dir: 'right' },
      { dx: 0, dy: 1, name: '아래', dir: 'down' },
      { dx: -1, dy: 0, name: '왼쪽', dir: 'left' },
      { dx: 0, dy: -1, name: '위', dir: 'up' }
    ];
    const queue = [{ x: map.start.x, y: map.start.y, path: [] }];
    const seen = new Set([`${map.start.x},${map.start.y}`]);
    while (queue.length) {
      const node = queue.shift();
      if (node.x === map.goal.x && node.y === map.goal.y) return node.path;
      steps.forEach((step) => {
        const x = node.x + step.dx;
        const y = node.y + step.dy;
        const key = `${x},${y}`;
        if (x < 0 || y < 0 || x >= cols || y >= rows || map.walls.has(key) || seen.has(key)) return;
        seen.add(key);
        queue.push({ x, y, path: node.path.concat(step) });
      });
    }
    return [];
  }

  function buildMazeGameQuestion(stageIndex, questionIndex) {
    return generateMazeMap(stageIndex, questionIndex, mazeStageSettings(STAGES[stageIndex] || {}, stageIndex));
  }

  function buildMazeGameRun(stage, stageIndex) {
    const pool = Array.from({ length: 20 }, (_, index) => buildMazeGameQuestion(stageIndex, index));
    const count = Math.max(3, Math.min(6, Number(stage.questions || 4) || 4));
    return shuffle(pool).slice(0, count).map((map, index) => ({
      ...map,
      runIndex: index,
      player: { ...map.start },
      direction: 'down',
      moves: 0,
      wrongMoves: 0,
      trail: [`${map.start.x},${map.start.y}`]
    }));
  }

  function buildAnalogyQuestion(stageIndex, questionIndex) {
    const photos = PHOTO_ASSETS.length ? PHOTO_ASSETS : CATEGORY_ASSETS;
    const illust = ILLUST_ASSETS.length ? ILLUST_ASSETS : CATEGORY_ASSETS;
    const pairs = photos.map((photo) => {
      const match = illust.find((asset) => asset.name === photo.name && asset.category === photo.category && asset.src !== photo.src);
      return match ? { photo, match } : null;
    }).filter(Boolean);
    const pairPool = pairs.length >= 4 ? pairs : assetsFor(['animal', 'food', 'object']).map((asset) => ({ photo: asset, match: asset }));
    const first = pairPool[(stageIndex + questionIndex) % pairPool.length];
    const second = pairPool[(stageIndex + questionIndex + 3) % pairPool.length];
    const distractors = pick(pairPool.map((pair) => pair.match).filter((asset) => asset.name !== second.match.name), 3, questionIndex);
    return {
      prompt: '앞의 관계처럼 빈칸에 들어갈 그림을 고르세요.',
      lead: '사진은 그림으로, 같은 이름끼리 연결해요.',
      visual: `
        <div class="cognitive-analogy">
          ${assetCard(first.photo)}
          <div class="cognitive-symbol">→</div>
          ${assetCard(first.match)}
          <div class="cognitive-symbol">/</div>
          ${assetCard(second.photo)}
          <div class="cognitive-symbol">→</div>
          ${questionMark()}
        </div>
      `,
      choices: shuffle([choice(second.match.name, true, second.match), ...distractors.map((asset) => choice(asset.name, false, asset))]),
      answer: second.match.name,
      axis: 'reasoning'
    };
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  function buildSoundQuestion(stageIndex, questionIndex) {
    const count = Math.min(4, 2 + Math.floor(stageIndex / 3));
    const pool = pick(assetsFor(['animal', 'food', 'fruit', 'object']), count + 4, stageIndex + questionIndex);
    const heard = pool.slice(0, count);
    const answer = heard[heard.length - 1];
    return {
      prompt: '듣고 마지막에 들린 그림을 고르세요.',
      lead: '듣기 버튼을 누른 뒤 순서를 기억해요.',
      visual: `
        <div class="cognitive-sequence" style="--item-count:1">
          <button type="button" class="cognitive-action-btn" data-speak="${escapeHtml(heard.map((asset) => asset.name).join(', '))}">듣기</button>
        </div>
      `,
      choices: shuffle([choice(answer.name, true, answer), ...pool.slice(count, count + 3).map((asset) => choice(asset.name, false, asset))]),
      answer: answer.name,
      speakText: heard.map((asset) => asset.name).join(', '),
      axis: 'auditoryMemory'
    };
  }

  function buildReactionQuestion(stageIndex, questionIndex) {
    const pool = pick(assetsFor(['animal', 'fruit', 'food', 'object', 'transport']), 8, stageIndex + questionIndex);
    const target = pool[0];
    const signalSame = (stageIndex + questionIndex) % 3 !== 1;
    const samePool = assetsFor([target.category], { min: 2 }).filter((asset) => asset.name !== target.name);
    const differentPool = assetsFor(['animal', 'fruit', 'food', 'object', 'transport'])
      .filter((asset) => asset.category !== target.category && asset.name !== target.name);
    const answer = signalSame ? samePool[0] || pool[1] : differentPool[0] || pool[2];
    const wrongSource = signalSame
      ? differentPool.concat(pool.filter((asset) => asset.category !== target.category))
      : samePool.concat(pool.filter((asset) => asset.category === target.category && asset.name !== target.name));
    const wrongs = pick(wrongSource.filter((asset) => asset.name !== answer.name), 3, questionIndex);
    return {
      prompt: signalSame ? '초록 신호: 같은 특성을 가진 그림을 찾으세요.' : '빨강 신호: 다른 특성을 가진 그림을 찾으세요.',
      signal: signalSame ? 'green' : 'red',
      lead: '신호 색을 먼저 보고 반응을 바꿔요.',
      visual: `<div class="cognitive-sequence" style="--item-count:1">${assetCard(target, `기준: ${target.name}`)}</div>`,
      choices: shuffle([choice(answer.name, true, answer), ...wrongs.map((asset) => choice(asset.name, false, asset))]),
      answer: answer.name,
      axis: 'inhibition'
    };
  }

  const STORY_SETS = [
    ['손을 씻어요', '간식을 먹어요', '그릇을 정리해요', '손 씻기 다음에 하는 일은?'],
    ['씨앗을 심어요', '물을 줘요', '싹이 나요', '씨앗을 심은 뒤에는?'],
    ['가방을 멥니다', '학교에 갑니다', '교실에 앉습니다', '학교에 가기 전에는?'],
    ['양말을 신어요', '신발을 신어요', '밖으로 나가요', '신발을 신기 전에 하는 일은?']
  ];

  function buildStoryQuestion(stageIndex, questionIndex) {
    const story = STORY_SETS[(stageIndex + questionIndex) % STORY_SETS.length];
    const ask = questionIndex % 3;
    const answer = story[ask];
    const wrongs = shuffle(STORY_SETS.flat().filter((text) => text !== answer && !text.endsWith('?'))).slice(0, 3);
    const display = story.slice(0, 3).map((step, index) => `
      ${index > 0 ? '<div class="cognitive-story-arrow" aria-hidden="true">→</div>' : ''}
      ${index === ask ? questionMark() : `<div class="cognitive-story-card"><strong>${escapeHtml(step)}</strong></div>`}
    `).join('');
    return {
      prompt: '',
      lead: '',
      visual: `<div class="cognitive-story">${display}</div>`,
      choices: shuffle([choice(answer, true), ...wrongs.map((text) => choice(text, false))]),
      answer,
      axis: 'story'
    };
  }

  function buildQuestion(stageIndex, questionIndex) {
    const builders = {
      pattern: buildPatternQuestion,
      missing: buildMissingQuestion,
      memory: buildMemoryQuestion,
      switch: buildSwitchQuestion,
      emotion: buildEmotionQuestion,
      maze: buildMaze,
      analogy: buildAnalogyQuestion,
      sound: buildSoundQuestion,
      reaction: buildReactionQuestion,
      story: buildStoryQuestion
    };
    const builder = builders[CONFIG.mode] || builders.pattern;
    return builder(stageIndex, questionIndex);
  }

  function renderStages() {
    const stageGroupLabel = CONFIG.stageGroupLabel || '인지 놀이 단계 학습';
    const stageGroupEnglish = CONFIG.stageGroupEnglish || 'Cognitive Play Stage Learning';
    const stageHeadClasses = ['cognitive-stage-head', 'playlab-stage-label-block', CONFIG.centerStageKicker === true ? 'is-kicker-centered' : ''].filter(Boolean).join(' ');
    els.stageGrid.innerHTML = `
      <div class="${stageHeadClasses}" style="grid-column:1/-1">
        <div>
          <h1 class="cognitive-stage-title">${escapeHtml(stageGroupLabel)}</h1>
          <p>${escapeHtml(stageGroupEnglish)}</p>
        </div>
      </div>
      ${STAGES.map((stage, index) => `
        <button type="button" class="cognitive-stage-card" data-stage="${index}">
          <span class="cognitive-stage-card-top">
            <span class="cognitive-stage-no">${pad2(index + 1)}</span>
            <span class="cognitive-stage-score">${stage.scoreTarget}점 목표</span>
          </span>
          <h3>${escapeHtml(stage.title)}</h3>
          <p>${escapeHtml(stage.subtitle)}</p>
        </button>
      `).join('')}
    `;
    els.stageGrid.querySelectorAll('[data-stage]').forEach((button) => {
      button.addEventListener('click', () => startStage(Number(button.dataset.stage)));
    });
  }

  function show(view) {
    [els.stageView, els.lessonView, els.resultView].forEach((element) => {
      element.classList.toggle('is-active', element === view);
    });
    els.stageButton.classList.toggle('shell-hidden', view === els.stageView);
    els.stageLabel.classList.toggle('shell-hidden', view === els.stageView);
  }

  function startStage(stageIndex) {
    clearMemorySequenceTimer();
    const stage = STAGES[stageIndex];
    state.stageIndex = stageIndex;
    state.questionIndex = 0;
    state.correct = 0;
    state.wrong = 0;
    state.score = 0;
    state.logs = [];
    state.savedRunId = '';
    state.stageStartedAt = Date.now();
    state.mazeRun = CONFIG.mazeGame === true && CONFIG.mode === 'maze' ? { seed: Date.now(), poolSize: 20 } : null;
    state.questions = state.mazeRun
      ? buildMazeGameRun(stage, stageIndex)
      : Array.from({ length: stage.questions }, (_, index) => buildQuestion(stageIndex, index));
    els.stageLabel.textContent = stage.title;
    show(els.lessonView);
    renderQuestion();
  }

  function renderQuestion() {
    clearMemorySequenceTimer();
    const stage = STAGES[state.stageIndex];
    const question = state.questions[state.questionIndex];
    state.answering = false;
    state.questionStartedAt = Date.now();
    if (CONFIG.mazeGame === true && CONFIG.mode === 'maze') {
      renderMazeGameQuestion(stage, question);
      return;
    }
    const hasVisualChoices = question.choices.some((item) => item.asset || item.patternToken);
    const isEmotionMode = CONFIG.mode === 'emotion';
    const isMemoryMode = CONFIG.mode === 'memory';
    const isPatternMode = CONFIG.mode === 'pattern';
    const isMissingMode = CONFIG.mode === 'missing';
    const modeClass = CONFIG.mode ? `is-${CONFIG.mode}-mode` : '';
    const promptText = Object.prototype.hasOwnProperty.call(question, 'prompt') ? question.prompt : (MODES[CONFIG.mode] || '');
    const leadText = CONFIG.hideQuestionLead === true ? '' : (Object.prototype.hasOwnProperty.call(question, 'lead') ? question.lead : '');
    const signalMatch = /^([^:]+):\s*(.+)$/.exec(promptText);
    const titleHtml = question.signal && signalMatch
      ? (CONFIG.hideSignalPromptBadge === true
        ? `<h2>${escapeHtml(signalMatch[2])}</h2>`
        : `<h2 class="cognitive-signal-title"><span class="cognitive-signal-badge is-${escapeHtml(question.signal)}">${escapeHtml(signalMatch[1])}</span><span>${escapeHtml(signalMatch[2])}</span></h2>`)
      : (promptText ? `<h2>${escapeHtml(promptText)}</h2>` : '');
    const signalClass = question.signal ? `is-signal-${question.signal}` : '';
    const memorySequence = isMemoryMode && Array.isArray(question.sequence) ? question.sequence : [];
    const memoryTargetLabel = question.memoryTargetLabel || '첫번째';
    const memoryFrameMs = 980;
    const memoryIntroMs = 1180;
    const memoryIntroOverlay = memorySequence.length ? `
      <div class="cognitive-memory-start-modal" role="status" aria-live="polite">
        <strong>${escapeHtml(memoryTargetLabel)} 그림을 기억하세요!</strong>
      </div>
    ` : '';
    const memoryVisual = memorySequence.length ? `
      <div class="cognitive-memory-player" style="--memory-count:${memorySequence.length}; --memory-frame-ms:${memoryFrameMs}ms; --memory-intro-ms:${memoryIntroMs}ms">
        ${memorySequence.map((asset, index) => `
          <div class="cognitive-memory-frame" style="--frame-index:${index}">
            ${assetImageOnlyCard(asset)}
          </div>
        `).join('')}
      </div>
    ` : question.visual;
    els.lessonMount.innerHTML = `
      <article class="cognitive-game-card ${isEmotionMode ? 'is-emotion-mode' : ''} ${modeClass} ${signalClass}">
        <div class="cognitive-game-head">
          <div class="cognitive-game-title">
            ${CONFIG.hideLessonBadge === true ? '' : `<span class="cognitive-pill">${escapeHtml(stage.badge)}</span>`}
            ${isEmotionMode ? '' : `
              ${titleHtml}
              ${leadText ? `<p class="cognitive-lead">${escapeHtml(leadText)}</p>` : ''}
            `}
          </div>
          <div class="cognitive-score-board">
            <span class="cognitive-pill">${state.questionIndex + 1} / ${state.questions.length}</span>
            <span class="cognitive-pill">${state.score}점</span>
          </div>
        </div>
        <div class="cognitive-workspace">
          <section class="cognitive-panel cognitive-question-panel">
            <div class="cognitive-visual">${memoryVisual || questionMark()}</div>
          </section>
          <section class="cognitive-panel cognitive-choice-panel ${isMemoryMode ? 'is-memory-choice-waiting' : ''}">
            <div class="cognitive-choice-grid ${hasVisualChoices ? '' : 'text-only'} ${isMemoryMode ? 'is-memory-image-grid' : ''} ${isPatternMode ? 'is-pattern-image-grid' : ''}">
              ${question.choices.map((item, index) => `
                <button type="button" class="cognitive-choice" data-choice="${index}" draggable="true" ${item.patternToken ? `aria-label="${escapeHtml(item.label)}"` : ''} ${isMemoryMode ? 'disabled' : ''}>
                  ${item.asset ? `<img src="${escapeHtml(item.asset.src)}" alt="${escapeHtml(item.label)}">` : ''}
                  ${item.patternToken ? patternTokenCard(item.patternToken, 'choice') : ''}
                  ${isMemoryMode || isPatternMode ? '' : `<span>${escapeHtml(item.label)}</span>`}
                </button>
              `).join('')}
            </div>
            <div id="cognitiveFeedback" class="cognitive-feedback">${isMemoryMode ? '그림을 차례대로 보고 있어요.' : isPatternMode || CONFIG.hideAnswerPrompt ? '' : (Object.prototype.hasOwnProperty.call(CONFIG, 'initialFeedbackText') ? escapeHtml(CONFIG.initialFeedbackText || '') : '답을 골라보세요.')}</div>
          </section>
        </div>
        ${memoryIntroOverlay}
      </article>
    `;
    if (isMemoryMode && memorySequence.length) {
      state.answering = true;
      const mountedQuestionIndex = state.questionIndex;
      const waitMs = memoryIntroMs + memorySequence.length * memoryFrameMs + 240;
      state.memorySequenceTimer = window.setTimeout(() => {
        if (CONFIG.mode !== 'memory' || mountedQuestionIndex !== state.questionIndex) return;
        state.answering = false;
        state.memorySequenceTimer = null;
        const card = els.lessonMount.querySelector('.cognitive-game-card');
        const title = els.lessonMount.querySelector('.cognitive-game-title h2');
        const lead = els.lessonMount.querySelector('.cognitive-lead');
        const visual = els.lessonMount.querySelector('.cognitive-visual');
        const choicePanel = els.lessonMount.querySelector('.cognitive-choice-panel');
        const feedback = $('cognitiveFeedback');
        if (card) card.classList.add('is-memory-recall-ready');
        if (title) title.textContent = `${memoryTargetLabel} 그림을 찾아보세요.`;
        if (lead) lead.textContent = `아래 그림 4장 중 ${memoryTargetLabel}로 본 그림을 고르세요.`;
        if (visual) visual.innerHTML = '<div class="cognitive-memory-recall-mark">?</div>';
        if (choicePanel) choicePanel.classList.remove('is-memory-choice-waiting');
        els.lessonMount.querySelectorAll('[data-choice]').forEach((button) => {
          button.disabled = false;
        });
        if (feedback) feedback.textContent = `${memoryTargetLabel} 그림을 골라보세요.`;
      }, waitMs);
    }
    els.lessonMount.querySelectorAll('[data-hint-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.classList.contains('is-open')) return;
        button.textContent = button.dataset.hintValue || '상황을 보고 마음을 골라요.';
        button.classList.add('is-open');
        button.setAttribute('aria-label', '힌트 내용');
      });
    });
    els.lessonMount.querySelectorAll('[data-choice]').forEach((button) => {
      button.addEventListener('click', (event) => {
        if (button.dataset.dragSuppress === 'true') {
          event.preventDefault();
          button.dataset.dragSuppress = '';
          return;
        }
        submitAnswer(Number(button.dataset.choice));
      });
      button.addEventListener('dragstart', (event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', button.dataset.choice || '');
      });
    });
    if (isMissingMode) setupPointerChoiceDrag();
    els.lessonMount.querySelectorAll('[data-answer-drop], .cognitive-question-panel').forEach((target) => {
      target.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        target.classList.add('is-drag-ready');
      });
      target.addEventListener('dragleave', () => target.classList.remove('is-drag-ready'));
      target.addEventListener('drop', (event) => {
        event.preventDefault();
        target.classList.remove('is-drag-ready');
        const raw = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
        if (raw === '') return;
        const choiceIndex = Number(raw);
        if (Number.isInteger(choiceIndex)) submitAnswer(choiceIndex);
      });
    });
    els.lessonMount.querySelectorAll('[data-speak]').forEach((button) => {
      button.addEventListener('click', () => speak(button.dataset.speak || ''));
    });
    if (question.speakText) {
      window.setTimeout(() => speak(question.speakText), 280);
    }
  }

  function setupPointerChoiceDrag() {
    const buttons = Array.from(els.lessonMount.querySelectorAll('[data-choice]'));
    const dropTargets = Array.from(els.lessonMount.querySelectorAll('[data-answer-drop], .cognitive-question-panel'));
    if (!buttons.length || !dropTargets.length) return;
    buttons.forEach((button) => {
      button.addEventListener('pointerdown', (event) => {
        if (state.answering || button.disabled || event.button > 0) return;
        const startX = event.clientX;
        const startY = event.clientY;
        let dragging = false;
        let ghost = null;
        let activeTarget = null;
        const clearActiveTarget = () => {
          if (activeTarget) activeTarget.classList.remove('is-drag-ready');
          activeTarget = null;
        };
        const cleanup = () => {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
          document.removeEventListener('pointercancel', onCancel);
          clearActiveTarget();
          if (ghost) ghost.remove();
        };
        const findDropTarget = (x, y) => dropTargets.find((target) => {
          const rect = target.getBoundingClientRect();
          return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }) || null;
        const moveGhost = (x, y) => {
          if (!ghost) return;
          ghost.style.left = `${x}px`;
          ghost.style.top = `${y}px`;
        };
        const beginDrag = (x, y) => {
          dragging = true;
          button.dataset.dragSuppress = 'true';
          ghost = button.cloneNode(true);
          ghost.classList.add('cognitive-drag-ghost');
          ghost.removeAttribute('data-choice');
          ghost.setAttribute('aria-hidden', 'true');
          document.body.appendChild(ghost);
          moveGhost(x, y);
        };
        const onMove = (moveEvent) => {
          const delta = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
          if (!dragging && delta > 8) beginDrag(moveEvent.clientX, moveEvent.clientY);
          if (!dragging) return;
          moveEvent.preventDefault();
          moveGhost(moveEvent.clientX, moveEvent.clientY);
          const nextTarget = findDropTarget(moveEvent.clientX, moveEvent.clientY);
          if (nextTarget !== activeTarget) {
            clearActiveTarget();
            activeTarget = nextTarget;
            if (activeTarget) activeTarget.classList.add('is-drag-ready');
          }
        };
        const onUp = (upEvent) => {
          const dropped = dragging ? findDropTarget(upEvent.clientX, upEvent.clientY) : null;
          cleanup();
          if (dropped) submitAnswer(Number(button.dataset.choice));
          window.setTimeout(() => {
            button.dataset.dragSuppress = '';
          }, 0);
        };
        const onCancel = () => {
          cleanup();
          button.dataset.dragSuppress = '';
        };
        document.addEventListener('pointermove', onMove, { passive: false });
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onCancel);
      });
    });
  }

  function renderMazeGameQuestion(stage, map) {
    if (!map) {
      renderResult();
      return;
    }
    const cols = map.cols || map.size;
    const rows = map.rows || map.size;
    const visibleCols = Math.min(map.visibleSize || 7, cols);
    const visibleRows = Math.min(map.visibleSize || 7, rows);
    const cameraX = Math.max(0, Math.min(cols - visibleCols, map.player.x - Math.floor(visibleCols / 2)));
    const cameraY = Math.max(0, Math.min(rows - visibleRows, map.player.y - Math.floor(visibleRows / 2)));
    const goalReached = map.player.x === map.goal.x && map.player.y === map.goal.y;
    const best = Math.max(1, map.shortestPathLength || 1);
    const dogSrc = CONFIG.mazeDogSrc || 'images/etc/playlab-maze-planner.gif';
    const trail = Array.isArray(map.trail) && map.trail.length ? map.trail : [`${map.start.x},${map.start.y}`];
    const trailIndexByKey = new Map(trail.map((key, index) => [key, index]));
    let cells = '';
    for (let row = 0; row < visibleRows; row += 1) {
      for (let col = 0; col < visibleCols; col += 1) {
        const x = cameraX + col;
        const y = cameraY + row;
        const key = `${x},${y}`;
        const isWall = map.walls.has(key);
        const isPlayer = map.player.x === x && map.player.y === y;
        const isGoal = map.goal.x === x && map.goal.y === y;
        const isStart = map.start.x === x && map.start.y === y;
        const trailIndex = trailIndexByKey.has(key) ? trailIndexByKey.get(key) : -1;
        const cls = [
          'maze-tile',
          isWall ? 'is-wall' : 'is-path',
          isStart ? 'is-start' : '',
          isGoal ? 'is-goal' : '',
          trailIndex >= 0 && !isWall && !isPlayer ? 'is-trail' : '',
          trailIndex >= 0 && !isWall && !isPlayer ? `trail-color-${(trailIndex % 6) + 1}` : '',
          isPlayer ? 'is-player' : ''
        ].filter(Boolean).join(' ');
        const tag = isWall ? 'div' : 'button';
        const disabled = isWall ? '' : ' type="button"';
        const label = isPlayer ? '강아지 현재 위치' : isGoal ? '목적지' : isStart ? '출발점' : `이동 칸 ${x + 1}, ${y + 1}`;
        cells += `<${tag}${disabled} class="${cls}" data-x="${x}" data-y="${y}" aria-label="${escapeHtml(label)}">`;
        if (isPlayer) {
          cells += `<img class="maze-dog is-${escapeHtml(map.direction || 'down')}" src="${escapeHtml(dogSrc)}" alt="강아지">`;
        }
        if (isGoal && !isPlayer) cells += '<span class="maze-goal-marker">도착</span>';
        cells += `</${tag}>`;
      }
    }
    let miniCells = '';
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const key = `${x},${y}`;
        const cls = [
          'maze-mini-cell',
          map.walls.has(key) ? 'is-wall' : 'is-path',
          trailIndexByKey.has(key) ? 'is-trail' : '',
          map.goal.x === x && map.goal.y === y ? 'is-goal' : '',
          map.player.x === x && map.player.y === y ? 'is-player' : ''
        ].filter(Boolean).join(' ');
        miniCells += `<span class="${cls}"></span>`;
      }
    }
    els.lessonMount.innerHTML = `
      <article class="cognitive-game-card is-maze-mode">
        <div class="maze-game-layout">
          <section class="maze-board-panel">
            <div class="maze-board-wrap">
              <div id="mazeBoard" class="maze-board" style="--maze-visible:${visibleCols}" tabindex="0" aria-label="강아지 미로판">
                ${cells}
              </div>
            </div>
          </section>
          <aside class="maze-status-panel">
            <div class="maze-status-top">
              <div class="maze-stage-badge">${escapeHtml(stage.badge)}</div>
              <div class="maze-minimap" style="--mini-cols:${cols}; --mini-rows:${rows}" aria-label="전체 미로와 현재 위치">
                ${miniCells}
              </div>
            </div>
            <h2>강아지를 목적지까지 데려가요</h2>
            <div class="maze-progress">
              <span>${state.questionIndex + 1} / ${state.questions.length}</span>
              <span>${cols} x ${rows}</span>
              <span>화면 ${visibleCols} x ${visibleRows}</span>
            </div>
            <div class="maze-stat-grid">
              <div><span>이동</span><strong>${map.moves}</strong></div>
              <div><span>최단</span><strong>${best}</strong></div>
              <div><span>막힘</span><strong>${map.wrongMoves}</strong></div>
              <div><span>점수</span><strong>${state.score}</strong></div>
            </div>
          </aside>
        </div>
      </article>
    `;
    els.lessonMount.querySelectorAll('.maze-tile.is-path').forEach((tile) => {
      tile.addEventListener('click', () => moveMazeTo(Number(tile.dataset.x), Number(tile.dataset.y), 'click'));
    });
    const board = $('mazeBoard');
    if (board) board.focus({ preventScroll: true });
  }

  function getCurrentMaze() {
    return CONFIG.mazeGame === true && CONFIG.mode === 'maze' ? state.questions[state.questionIndex] : null;
  }

  function moveMazeByDirection(direction) {
    const map = getCurrentMaze();
    if (!map || state.answering) return;
    const vector = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    }[direction];
    if (!vector) return;
    moveMazeTo(map.player.x + vector[0], map.player.y + vector[1], 'key', direction);
  }

  function moveMazeTo(x, y, inputType, forcedDirection) {
    const map = getCurrentMaze();
    if (!map || state.answering) return;
    const cols = map.cols || map.size;
    const rows = map.rows || map.size;
    const dx = x - map.player.x;
    const dy = y - map.player.y;
    const isAdjacent = Math.abs(dx) + Math.abs(dy) === 1;
    const direction = forcedDirection || (dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up');
    const key = `${x},${y}`;
    if (!isAdjacent || x < 0 || y < 0 || x >= cols || y >= rows || map.walls.has(key)) {
      failMazeMove(map);
      return;
    }
    map.direction = direction;
    map.player = { x, y };
    map.moves += 1;
    const trail = Array.isArray(map.trail) && map.trail.length ? map.trail.slice() : [`${map.start.x},${map.start.y}`];
    const existingIndex = trail.indexOf(key);
    map.trail = existingIndex >= 0 ? trail.slice(0, existingIndex + 1) : trail.concat(key);
    if (x === map.goal.x && y === map.goal.y) {
      completeMazeQuestion(map, inputType || 'move');
      return;
    }
    renderMazeGameQuestion(STAGES[state.stageIndex], map);
  }

  function failMazeMove(map) {
    map.wrongMoves += 1;
    state.wrong += 1;
    playTone(false);
    playFeedbackSound(false);
    if (navigator.vibrate) navigator.vibrate(120);
    const board = $('mazeBoard');
    if (board) {
      board.classList.remove('is-shaking');
      void board.offsetWidth;
      board.classList.add('is-shaking');
    }
    window.setTimeout(() => renderMazeGameQuestion(STAGES[state.stageIndex], map), 420);
  }

  function completeMazeQuestion(map, inputType) {
    state.answering = true;
    const elapsed = Date.now() - state.questionStartedAt;
    const best = Math.max(1, map.shortestPathLength || 1);
    const efficiency = Math.max(0, best / Math.max(best, map.moves));
    const bonus = Math.round(120 * efficiency) + Math.max(0, 90 - map.wrongMoves * 18);
    state.correct += 1;
    state.score += 180 + state.stageIndex * 18 + bonus;
    state.logs.push({
      question: `${map.cols || map.size}x${map.rows || map.size} 미로`,
      targetAnswer: '목적지 도착',
      submittedAnswer: `${map.moves}회 이동`,
      correct: true,
      elapsedMs: elapsed,
      axis: 'planning',
      inputType: inputType || 'move',
      wrongMoves: map.wrongMoves,
      shortestPathLength: best
    });
    playTone(true);
    playFeedbackSound(true);
    if (window.HahaFeedbackOverlay) {
      window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
    }
    renderMazeGameQuestion(STAGES[state.stageIndex], map);
    window.setTimeout(() => {
      state.questionIndex += 1;
      if (state.questionIndex >= state.questions.length) {
        renderResult();
      } else {
        renderQuestion();
      }
    }, 760);
  }

  function playTone(ok) {
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = ok ? 'sine' : 'triangle';
      osc.frequency.value = ok ? 740 : 180;
      gain.gain.value = 0.045;
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + (ok ? 0.16 : 0.22));
    } catch (error) {
      /* Audio feedback is optional. */
    }
  }

  function playFeedbackSound(ok) {
    const feedbackSounds = CONFIG.feedbackSounds;
    if (!feedbackSounds || typeof Audio === 'undefined') return;
    const src = typeof feedbackSounds === 'object'
      ? (ok ? feedbackSounds.correct : feedbackSounds.wrong)
      : (ok ? '../sound/correct.mp3' : '../sound/error.mp3');
    if (!src) return;
    try {
      const key = ok ? 'correct' : 'wrong';
      const audio = feedbackAudioCache[key] || new Audio(src);
      feedbackAudioCache[key] = audio;
      const volume = typeof feedbackSounds === 'object' ? Number(feedbackSounds.volume) : 0.65;
      audio.volume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.65;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    } catch (error) {
      /* File-based feedback is optional for browsers that block media. */
    }
  }

  function submitAnswer(choiceIndex) {
    if (state.answering) return;
    clearMemorySequenceTimer();
    state.answering = true;
    const question = state.questions[state.questionIndex];
    const picked = question.choices[choiceIndex];
    const correct = Boolean(picked && picked.correct);
    const elapsed = Date.now() - state.questionStartedAt;
    const buttons = els.lessonMount.querySelectorAll('[data-choice]');
    const shouldRetryUntilCorrect = CONFIG.retryUntilCorrect === true;
    const shouldHideRetryFeedback = shouldRetryUntilCorrect && CONFIG.hideAnswerPrompt === true;
    const shouldHideFeedbackText = CONFIG.hideAnswerPrompt === true;
    buttons.forEach((button, index) => {
      const item = question.choices[index];
      button.disabled = true;
      if (index === choiceIndex) button.classList.add('is-selected');
      if (item.correct && (correct || !shouldRetryUntilCorrect)) button.classList.add('is-correct');
      if (index === choiceIndex && !item.correct) button.classList.add('is-wrong');
    });
    const feedback = $('cognitiveFeedback');
    feedback.textContent = shouldHideFeedbackText ? '' : (CONFIG.mode === 'emotion'
      ? (correct ? `${question.answer} 마음이에요.` : (shouldHideRetryFeedback ? '' : (shouldRetryUntilCorrect ? '다시 골라보세요.' : `정답: ${question.answer}`)))
      : (correct ? '정답이에요.' : (shouldHideRetryFeedback ? '' : (shouldRetryUntilCorrect ? '다시 골라보세요.' : `정답: ${question.answer}`))));
    feedback.classList.toggle('is-correct', correct);
    feedback.classList.toggle('is-wrong', !correct);
    state.correct += correct ? 1 : 0;
    state.wrong += correct ? 0 : 1;
    const speedBonus = Math.max(0, 80 - Math.round(elapsed / 100));
    state.score += correct ? 100 + state.stageIndex * 12 + speedBonus : 10;
    state.logs.push({
      question: question.prompt,
      targetAnswer: question.answer,
      submittedAnswer: picked ? picked.label : '',
      correct,
      elapsedMs: elapsed,
      axis: question.axis || CONFIG.mode
    });
    playTone(correct);
    playFeedbackSound(correct);
    if (window.HahaFeedbackOverlay) {
      window.HahaFeedbackOverlay.showQuestionComplete(correct ? 'correct' : 'wrong', { sound: false });
    }
    if (!correct && (CONFIG.mode === 'missing' || shouldRetryUntilCorrect)) {
      window.setTimeout(() => {
        buttons.forEach((button) => {
          button.disabled = false;
          button.classList.remove('is-selected', 'is-wrong', 'is-correct');
        });
        feedback.textContent = shouldHideRetryFeedback ? '' : (shouldRetryUntilCorrect ? '다시 골라보세요.' : '다시 찾아보세요.');
        feedback.classList.remove('is-wrong', 'is-correct');
        state.answering = false;
      }, 720);
      return;
    }
    window.setTimeout(() => {
      state.questionIndex += 1;
      if (state.questionIndex >= state.questions.length) {
        renderResult();
      } else {
        renderQuestion();
      }
    }, correct ? 850 : 1200);
  }

  function getReportTone(accuracy) {
    if (accuracy >= 90) return { label: '매우 안정', className: 'is-strong' };
    if (accuracy >= 70) return { label: '안정', className: 'is-good' };
    return { label: '추가 연습', className: 'is-watch' };
  }

  function getAxisSummary() {
    const labels = {
      pattern: '규칙 찾기',
      missing: '범주 추론',
      memory: '작업기억',
      switch: '인지 전환',
      emotion: '사회적 추론',
      maze: '계획 세우기',
      analogy: '관계 추론',
      sound: '청각 기억',
      reaction: '주의 조절',
      story: '순서 이해'
    };
    const totals = {};
    const corrects = {};
    state.logs.forEach((log) => {
      const axis = log.axis || CONFIG.mode || 'playlab';
      totals[axis] = (totals[axis] || 0) + 1;
      corrects[axis] = (corrects[axis] || 0) + (log.correct ? 1 : 0);
    });
    return Object.keys(totals).map((axis) => ({
      label: labels[axis] || '인지 수행',
      value: Math.round((corrects[axis] / totals[axis]) * 100)
    }));
  }

  function renderCognitiveReport(stage, total, accuracy, elapsedMs) {
    const tone = getReportTone(accuracy);
    const axisSummary = getAxisSummary();
    const avgSeconds = Math.max(1, Math.round((elapsedMs / Math.max(total, 1)) / 1000));
    const wrongCount = Math.max(0, state.wrong);
    const mainAxis = axisSummary[0] || { label: '인지 수행', value: accuracy };
    const observation = accuracy >= 90
      ? `${escapeHtml(stage.title)} 단계에서 문제 단서를 안정적으로 유지하고 선택까지 이어가는 모습이 좋았습니다.`
      : accuracy >= 70
        ? `${escapeHtml(stage.title)} 단계의 핵심 규칙은 이해하고 있으며, 일부 문항에서 선택 전 확인 시간이 더 필요합니다.`
        : `${escapeHtml(stage.title)} 단계는 단서 확인과 선택 전략을 나누어 다시 연습하면 수행 안정성이 좋아질 수 있습니다.`;
    const guide = accuracy >= 80
      ? '다음 단계에서는 답을 고르기 전에 무엇을 보고 골랐는지 한 문장으로 말하게 하면 추론 언어화에 도움이 됩니다.'
      : '같은 유형을 다시 할 때 보기 2개부터 시작해 성공 경험을 만든 뒤, 보기 수를 늘리면 부담을 줄일 수 있습니다.';
    const reportKicker = String(CONFIG.labKind || '').trim().toLowerCase() === 'cardlab' ? 'CARDLAB REPORT' : 'PLAYLAB REPORT';
    const axisHtml = axisSummary.map((axis) => `
      <div class="cognitive-report-axis">
        <span>${escapeHtml(axis.label)}</span>
        <strong>${axis.value}%</strong>
      </div>
    `).join('');
    return `
      <section class="cognitive-report ${tone.className}" aria-label="학습 리포트">
        <div class="cognitive-report-head">
          <div>
            <span class="cognitive-report-kicker">${reportKicker}</span>
            <h3>인지 학습 소견</h3>
          </div>
          <strong class="cognitive-report-badge">${tone.label}</strong>
        </div>
        <div class="cognitive-report-metrics">
          <div><span>핵심 영역</span><strong>${escapeHtml(mainAxis.label)}</strong></div>
          <div><span>평균 반응</span><strong>${avgSeconds}초</strong></div>
          <div><span>오답 부담</span><strong>${wrongCount}회</strong></div>
        </div>
        ${axisHtml ? `<div class="cognitive-report-axis-list">${axisHtml}</div>` : ''}
        <article class="cognitive-report-note">
          <h4>관찰 요약</h4>
          <p>${observation}</p>
        </article>
        <article class="cognitive-report-note">
          <h4>다음 지도 방향</h4>
          <p>${guide}</p>
        </article>
      </section>
    `;
  }

  function renderResult() {
    clearMemorySequenceTimer();
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.hide === 'function') {
      window.HahaFeedbackOverlay.hide();
    }
    const stage = STAGES[state.stageIndex];
    const total = state.questions.length;
    const accuracy = total ? Math.round((state.correct / total) * 100) : 0;
    const elapsedMs = Date.now() - state.stageStartedAt;
    saveLearningReport(stage, total, accuracy, elapsedMs);
    const grade = accuracy >= 90 ? '집중 탐정' : accuracy >= 70 ? '규칙 해결사' : '다시 도전 준비';
    els.resultMount.innerHTML = `
      <article class="cognitive-result-card">
        <span class="cognitive-stage-kicker">${escapeHtml(stage.title)}</span>
        <h2 class="cognitive-result-title">${escapeHtml(grade)}</h2>
        <p class="cognitive-stage-note">${escapeHtml(CONFIG.title || '플레이랩')} 결과입니다.</p>
        <div class="cognitive-result-score">${state.score}점</div>
        <div class="cognitive-result-stats">
          <div class="cognitive-result-stat"><span>정답</span><strong>${state.correct}</strong></div>
          <div class="cognitive-result-stat"><span>정확도</span><strong>${accuracy}%</strong></div>
          <div class="cognitive-result-stat"><span>시간</span><strong>${Math.round(elapsedMs / 1000)}초</strong></div>
        </div>
        ${CONFIG.hideResultReport === true ? '' : '<div id="cognitiveReport"></div>'}
        <div class="cognitive-actions">
          <button type="button" id="retryStage" class="cognitive-action-btn">다시 하기</button>
          <button type="button" id="backStages" class="cognitive-secondary-btn">스테이지 선택</button>
        </div>
      </article>
    `;
    const reportMount = $('cognitiveReport');
    if (reportMount && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === 'function') {
      try {
        const report = window.PlaylabReportEngine.buildReport({
          title: CONFIG.title || '플레이랩',
          stageTitle: stage.title,
          reportType: CONFIG.reportType || 'visual',
          totalItems: total,
          totalQuestions: total,
          correctCount: state.correct,
          wrongCount: state.wrong,
          elapsedMs,
          avgQuestionMs: Math.round(elapsedMs / Math.max(total, 1)),
          accuracyRate: accuracy,
          completionRate: 100,
          firstTryRate: accuracy,
          questionLogs: state.logs,
          accentColor: DEFAULT_ACCENT
        });
        const reportHtml = report && report.isSimpleResult ? '' : window.PlaylabReportEngine.renderHtml(report);
        reportMount.innerHTML = reportHtml || '';
      } catch (error) {
        reportMount.innerHTML = '';
      }
    }
    $('retryStage').addEventListener('click', () => startStage(state.stageIndex));
    $('backStages').addEventListener('click', () => show(els.stageView));
    show(els.resultView);
  }

  function saveLearningReport(stage, total, accuracy, elapsedMs) {
    const labKind = String(CONFIG.labKind || '').trim().toLowerCase();
    const shouldSave = CONFIG.saveToClientReport === true || CONFIG.persistToClientReport === true || labKind === 'cardlab';
    if (!shouldSave || !labKind || state.savedRunId || !window.HahaLabLearningHarness) return;
    const wrongWords = state.logs
      .filter((log) => !log.correct)
      .map((log) => log.targetAnswer || log.submittedAnswer || '')
      .filter(Boolean);
    const focusLabel = CONFIG.mode === 'emotion' ? '감정 어휘 이해' : stage.title;
    const record = window.HahaLabLearningHarness.recordSession({
      labKind,
      reportScope: CONFIG.reportScope || labKind,
      curriculumKey: CONFIG.curriculumKey || `${labKind}-${CONFIG.id || CONFIG.mode || 'cognitive'}`,
      stageKey: `stage-${state.stageIndex + 1}`,
      stageTitle: stage.title,
      labTitle: CONFIG.cardlabTitle || CONFIG.title || 'CardLab 학습',
      totalQuestions: total,
      correctCount: state.correct,
      wrongCount: state.wrong,
      score: accuracy,
      accuracyScore: accuracy,
      durationSeconds: elapsedMs / 1000,
      startedAtMs: state.stageStartedAt || Date.now(),
      reportType: CONFIG.reportType || 'review',
      saveToClientReport: true,
      summary: CONFIG.reportSummary || `${CONFIG.title || '카드랩'}에서 시각 단서와 보기 단어를 연결했습니다.`,
      overview: CONFIG.reportOverview || '카드 기반 선택 과제 수행을 통해 시각 단서 활용, 어휘 의미 연결, 첫 반응 정확도, 오류 후 자기점검을 함께 확인합니다.',
      recommendations: Array.isArray(CONFIG.reportRecommendations) ? CONFIG.reportRecommendations : [
        '오답 단어는 그림의 어떤 단서를 보고 선택했는지 말로 설명하게 합니다.',
        '비슷한 감정 표현은 실제 상황 예시를 함께 비교하며 어휘 경계를 분명히 해주세요.'
      ],
      focusKey: CONFIG.focusKey || CONFIG.mode || 'cardlab-cognitive',
      focusLabel,
      details: {
        mode: CONFIG.mode || '',
        question_answers: state.logs.map((log) => log.targetAnswer).filter(Boolean),
        wrong_words: wrongWords,
        report_domain: CONFIG.reportDomain || focusLabel
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

  function setupHelp() {
    $('cognitiveHelpTitle').textContent = `${CONFIG.title || 'PLAYLAB'} 안내`;
    $('cognitiveHelpIntro').textContent = CONFIG.helpSummary || CONFIG.description || '재미있는 문제를 풀며 인지 전략을 연습합니다.';
    $('cognitiveHelpHow').innerHTML = (CONFIG.helpHow || '스테이지를 고르고 문제를 본 뒤 알맞은 답을 선택합니다.').split('\n').map((line) => `<p>${escapeHtml(line)}</p>`).join('');
    const benefitText = [
      CONFIG.helpBenefit || '주의 집중, 작업기억, 시각 변별, 문제 해결 전략을 함께 연습합니다.',
      '센터와 가정에서는 정답률뿐 아니라 문제를 시작하기 전 망설임, 규칙 전환 후 오류, 후반부 집중 유지, 오답 이후 다시 시도하는 방식을 함께 관찰하면 인지 전략의 변화와 다음 난이도 조정 방향을 더 분명하게 볼 수 있습니다.'
    ].join('\n');
    $('cognitiveHelpBenefit').innerHTML = benefitText.split('\n').map((line) => `<p>${escapeHtml(line)}</p>`).join('');
    els.helpButton.addEventListener('click', openHelp);
    els.helpClose.addEventListener('click', closeHelp);
    els.helpModal.querySelectorAll('[data-modal-close]').forEach((node) => node.addEventListener('click', closeHelp));
  }

  function setupShell() {
    document.documentElement.style.setProperty('--cognitive-accent', DEFAULT_ACCENT);
    if (CONFIG.themeClass && els.shell) {
      els.shell.classList.add(`is-${String(CONFIG.themeClass).replace(/[^a-z0-9_-]/gi, '')}`);
    }
    const background = `images/bg/bg-${pad2(Math.floor(Math.random() * BG_COUNT) + 1)}.webp`;
    document.documentElement.style.setProperty('--shell-page-bg', `url('${background}')`);
    document.documentElement.style.setProperty('--shell-intro-bg', `url('${background}')`);
    const title = CONFIG.title || '플레이랩';
    document.title = title;
    $('cognitiveTitle').textContent = title;
    els.stageButton.addEventListener('click', () => show(els.stageView));
  }

  function setupMazeKeyboard() {
    if (!(CONFIG.mazeGame === true && CONFIG.mode === 'maze')) return;
    document.addEventListener('keydown', (event) => {
      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right'
      };
      const direction = keyMap[event.key];
      if (!direction || !els.lessonView.classList.contains('is-active')) return;
      event.preventDefault();
      moveMazeByDirection(direction);
    });
  }

  function init() {
    if (!els.stageGrid || !els.lessonMount) return;
    setupShell();
    setupHelp();
    setupMazeKeyboard();
    renderStages();
    show(els.stageView);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
