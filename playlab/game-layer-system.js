(function () {
  'use strict';

  if (window.HahaGameLayerSystem) return;

  const DEFAULT_THEMES = {
    cardlab: {
      name: 'cardlab-studio',
      background: 'images/bg/bg-03.webp',
      frame: '',
      character: ''
    },
    numberlab: {
      name: 'numberlab-studio',
      background: 'images/bg/bg-06.webp',
      frame: '',
      character: ''
    },
    timelab: {
      name: 'timelab-studio',
      background: 'images/bg/bg-09.webp',
      frame: '',
      character: ''
    },
    playlab: {
      name: 'playlab-studio',
      background: 'images/bg/city-bg.webp',
      frame: '',
      character: ''
    },
    rehablab: {
      name: 'rehablab-studio',
      background: 'images/bg/bg-02.webp',
      frame: '',
      character: ''
    }
  };

  const PAGE_THEME_RULES = [
    {
      pattern: /^number-(add|sub|operation|sequence)/,
      name: 'math-console',
      background: 'images/bg/bg-06.webp',
      frame: 'images/category/school-supplies-blackboard-illust.webp',
      character: 'images/category/craft-spaceship-illust.webp',
      accent: '#ff7a1a',
      panel: 'rgba(255, 244, 204, 0.94)'
    },
    {
      pattern: /^number-(ten-frame|place-value|number-line|estimate|data|fraction)/,
      name: 'number-lab',
      background: 'images/bg/bg-08.webp',
      frame: 'images/category/school-supplies-blackboard-illust.webp',
      character: 'images/category/animal-frog-illust.webp',
      accent: '#34c759',
      panel: 'rgba(245, 255, 218, 0.94)'
    },
    {
      pattern: /clock|time|dayparts/,
      name: 'clock-workshop',
      background: 'images/bg/bg-09.webp',
      frame: 'images/category/object-clock-illust.webp',
      character: 'images/category/object-clock-illust.webp',
      accent: '#6d5dfc',
      panel: 'rgba(235, 241, 255, 0.94)'
    },
    {
      pattern: /^cardlab-(jamo|wordbuild|synonym|josa|connective|context|cloze|description|sentence)/,
      name: 'word-board',
      background: 'images/bg/bg-03.webp',
      frame: 'images/category/school-supplies-blackboard-illust.webp',
      character: 'images/category/animal-turtle-illust.webp',
      accent: '#2f7cf6',
      panel: 'rgba(255, 250, 229, 0.95)'
    },
    {
      pattern: /^cardlab-(study|motion|zoo|animal|car|emotion|spotlight)/,
      name: 'card-arcade',
      background: 'images/bg/animal-bg.webp',
      frame: 'images/category/school-supplies-sketchbook-photo.webp',
      character: 'images/category/animal-panda-illust.webp',
      accent: '#00a8e8',
      panel: 'rgba(234, 249, 255, 0.94)'
    },
    {
      pattern: /^playlab-(pattern|memory|reaction|orbit|shape|maze|analog|sound|story)/,
      name: 'puzzle-park',
      background: 'images/bg/city-bg.webp',
      frame: 'images/category/craft-spaceship-illust.webp',
      character: 'images/category/animal-fox-illust.webp',
      accent: '#ff3f6c',
      panel: 'rgba(255, 241, 246, 0.94)'
    },
    {
      pattern: /^rehablab-/,
      name: 'focus-garden',
      background: 'images/bg/bg-02.webp',
      frame: 'images/category/nature-cloud-illust.webp',
      character: 'images/category/animal-rabbit-illust.webp',
      accent: '#20b970',
      panel: 'rgba(241, 255, 239, 0.94)'
    }
  ];

  function pageName() {
    return String(window.location.pathname || '').split('/').pop() || '';
  }

  function detectFamily(name) {
    const file = String(name || pageName()).toLowerCase();
    if (file.indexOf('number-') === 0) return 'numberlab';
    if (file.indexOf('time-') === 0 || file.indexOf('time-dayparts') !== -1) return 'timelab';
    if (file.indexOf('rehablab-') === 0) return 'rehablab';
    if (file.indexOf('playlab-') === 0) return 'playlab';
    return 'cardlab';
  }

  function mergeTheme(family, override) {
    const customThemes = window.HAHA_GAME_LAYER_THEMES || {};
    return Object.assign(
      {},
      DEFAULT_THEMES[family] || DEFAULT_THEMES.cardlab,
      customThemes[family] || {},
      override || {}
    );
  }

  function pageTheme(name) {
    const file = String(name || pageName()).replace(/\.html$/i, '').toLowerCase();
    return PAGE_THEME_RULES.find(function (rule) {
      return rule.pattern.test(file);
    }) || null;
  }

  const STAGE_LEARNING_LABEL_RULES = [
    [/^cardlab-wordbuild/, '단어 조립 단계 학습'],
    [/^cardlab-jamo/, '자모 결합 단계 학습'],
    [/^cardlab-josa/, '조사 연결 단계 학습'],
    [/^cardlab-connective/, '접속어 연결 단계 학습'],
    [/^cardlab-context/, '상황 어휘 단계 학습'],
    [/^cardlab-association/, '연상 어휘 단계 학습'],
    [/^cardlab-synonym/, '의미 관계 단계 학습'],
    [/^cardlab-description/, '뜻 이해 단계 학습'],
    [/^cardlab-cloze/, '빈칸 추론 단계 학습'],
    [/^cardlab-sentence/, '문장 구성 단계 학습'],
    [/^cardlab-phonics|^cardlab-batchim|^cardlab-hangul/, '한글 해독 단계 학습'],
    [/^cardlab-idiom/, '표현 이해 단계 학습'],
    [/^cardlab-motion/, '동작 이해 단계 학습'],
    [/^cardlab-zoo|^cardlab-study|^cardlab-quiz|^cardlab-car|^cardlab-emotion|^cardlab-half/, '그림카드 인지 단계 학습'],
    [/^number-add-basic/, '기초 덧셈 단계 학습'],
    [/^number-sub-basic/, '기초 뺄셈 단계 학습'],
    [/^number-add-vertical/, '세로 덧셈 단계 학습'],
    [/^number-sub-vertical/, '세로 뺄셈 단계 학습'],
    [/^number-add-family/, '덧셈 규칙 단계 학습'],
    [/^number-operation/, '연산 경로 단계 학습'],
    [/^number-sequence/, '수 순서 단계 학습'],
    [/^number-learn/, '숫자 개념 단계 학습'],
    [/^number-explore/, '숫자 탐색 단계 학습'],
    [/^number-animal/, '수 세기 단계 학습'],
    [/^number-clock|^time-|time-dayparts/, '시간 개념 단계 학습'],
    [/^number-money/, '화폐 개념 단계 학습'],
    [/^number-fraction/, '똑같이 나누기 단계 학습'],
    [/^number-place/, '자리값 이해 단계 학습'],
    [/^number-compare|^number-measure|^number-estimate|^number-data|^number-line|^number-ten/, '수 개념 확장 단계 학습'],
    [/^playlab-icecream|^playlab-snack/, '소리 낱말 단계 학습'],
    [/^playlab-color|^playlab-orbit|^playlab-dot|^playlab-pattern|^playlab-memory|^playlab-reaction|^playlab-rule|^playlab-doorlock|^playlab-icon|^playlab-maze|^playlab-missing|^playlab-story|^playlab-sound|^playlab-analogy|^playlab-partial|^playlab-hand/, '인지 놀이 단계 학습']
  ];

  const STAGE_GRID_SELECTOR = [
    '[data-cardlab-stage-grid="true"]',
    '#stageGrid',
    '.cognitive-stage-grid',
    '.number-agency-stage-grid',
    '.timelab-stage-grid',
    '.wordbuild-stage-grid',
    '.association-stage-grid',
    '.context-stage-grid',
    '.synonym-stage-grid',
    '.df-stage-grid',
    '.jamo-stage-grid',
    '.hand-stage-grid',
    '.time-category-stage-grid',
    '.playlab-stage-grid'
  ].join(', ');

  function getStageLearningLabel(name) {
    const file = String(name || pageName()).replace(/\.html$/i, '').toLowerCase();
    const matched = STAGE_LEARNING_LABEL_RULES.find(function ([pattern]) {
      return pattern.test(file);
    });
    if (matched) return matched[1];
    const visibleTitle = document.querySelector('.shell-brand-title, #cognitiveTitle, h1, h2');
    const title = String(visibleTitle && visibleTitle.textContent || document.title || '').trim();
    const koreanOnly = title.replace(/[A-Za-z]/g, '').replace(/\s+/g, ' ').trim();
    if (/[가-힣]/.test(koreanOnly)) {
      return `${koreanOnly.replace(/\s*[-|].*$/, '').trim()} 단계 학습`;
    }
    const family = detectFamily(file);
    if (family === 'numberlab') return '숫자 개념 단계 학습';
    if (family === 'playlab') return '인지 놀이 단계 학습';
    if (family === 'timelab') return '시간 개념 단계 학습';
    return '카드 인지 단계 학습';
  }

  function getStageLearningEnglish(name) {
    const file = String(name || pageName()).replace(/\.html$/i, '').toLowerCase();
    if (/^number-|^rehablab-number/.test(file)) return 'Number Lab Stage Learning';
    if (/^playlab-icecream|^playlab-snack|^rehablab-icecream|^rehablab-snack/.test(file)) return 'Sound Word Stage Learning';
    if (/^playlab-|^rehablab-/.test(file)) return 'Cognitive Play Stage Learning';
    if (/^cardlab-/.test(file)) return 'Card Lab Stage Learning';
    return 'Stage Learning';
  }

  function shouldSuppressStageHeading(name) {
    const file = String(name || pageName()).replace(/\.html$/i, '').toLowerCase();
    return Boolean(window.HAHA_GAME_LAYER_SUPPRESS_STAGE_HEADING) || /^number-/.test(file);
  }

  function normalizeStageHeadingBlock(heading) {
    if (!heading) return;
    heading.classList.add('playlab-stage-label-block');
    const rawText = String(heading.textContent || '').replace(/\s+/g, ' ').trim();
    const existingTitle = heading.querySelector('h1,h2,h3');
    const existingEnglish = heading.querySelector('p');
    if (!existingTitle) {
      const title = document.createElement('h1');
      title.textContent = rawText || getStageLearningLabel();
      heading.textContent = '';
      heading.appendChild(title);
    }
    if (!existingEnglish) {
      const english = document.createElement('p');
      english.textContent = getStageLearningEnglish();
      heading.appendChild(english);
    }
  }

  function removeNonKoreanStageIntro(grid) {
    if (!grid || !grid.parentElement) return;
    const previous = grid.previousElementSibling;
    if (!previous || previous.hasAttribute('data-game-layer-stage-heading')) return;
    const text = String(previous.textContent || '').trim();
    if (!text || /[가-힣]/.test(text)) return;
    if (text.length <= 48 || /kicker|eyebrow|subtitle|label|intro|heading/i.test(previous.className || '')) {
      previous.remove();
    }
  }

  function ensureStageHeading(grid) {
    if (!grid || !grid.parentElement) return;
    const parent = grid.parentElement;
    if (shouldSuppressStageHeading()) {
      const duplicateHeading = parent.querySelector(':scope > [data-game-layer-stage-heading="true"]');
      if (duplicateHeading) duplicateHeading.remove();
      return;
    }
    removeNonKoreanStageIntro(grid);
    const inlineHeading = grid.querySelector([
      ':scope > .cognitive-stage-head',
      ':scope > .playlab-stage-head',
      ':scope > .spotlight-stage-head',
      ':scope > .half-stage-head',
      ':scope > .colorseq-stage-head',
      ':scope > .orbit-stage-head',
      ':scope > .hand-stage-head'
    ].join(', '));
    const previousHeadingText = String(grid.previousElementSibling && grid.previousElementSibling.textContent || '').trim();
    if (inlineHeading) {
      normalizeStageHeadingBlock(inlineHeading);
      const duplicateHeading = parent.querySelector(':scope > [data-game-layer-stage-heading="true"]');
      if (duplicateHeading) duplicateHeading.remove();
      return;
    }
    if (grid.classList.contains('time-category-stage-grid') || /놀이 단계 학습/.test(previousHeadingText)) {
      const duplicateHeading = parent.querySelector(':scope > [data-game-layer-stage-heading="true"]');
      if (duplicateHeading) duplicateHeading.remove();
      return;
    }
    let heading = parent.querySelector(':scope > [data-game-layer-stage-heading="true"]');
    if (!heading) {
      heading = document.createElement('div');
      heading.className = 'game-layer-stage-heading';
      heading.setAttribute('data-game-layer-stage-heading', 'true');
      parent.insertBefore(heading, grid);
    }
    heading.innerHTML = '';
    const title = document.createElement('h1');
    title.textContent = getStageLearningLabel();
    const english = document.createElement('p');
    english.textContent = getStageLearningEnglish();
    heading.append(title, english);
  }

  function enhanceStageSurfaces(root) {
    const family = detectFamily();
    const scope = root || document;
    const grids = Array.from(scope.querySelectorAll(STAGE_GRID_SELECTOR));
    grids.forEach(function (grid) {
      if (!grid || grid.dataset.gameLayerStageUnified === '1') return;
      const text = String(grid.textContent || '').trim();
      if (!text && grid.children.length === 0) return;
      grid.dataset.gameLayerStageUnified = '1';
      grid.classList.add('game-layer-stage-grid-unified');
      const surface = grid.closest('section, article, main, .shell-main, .cognitive-main, .number-agency-main') || grid.parentElement;
      if (surface) surface.setAttribute('data-game-layer-stage-surface', 'true');
      ensureStageHeading(grid);
    });
  }

  function cloudinaryUrl(publicId, options) {
    const cloudName = String(window.HAHA_CLOUDINARY_CLOUD_NAME || '').trim();
    if (!cloudName || !publicId) return '';
    const transform = String(options && options.transform || 'f_auto,q_auto,w_1600,c_limit').trim();
    return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/${transform}/${String(publicId).replace(/^\/+/, '')}`;
  }

  function resolveAsset(asset, options) {
    if (!asset) return '';
    if (/^https?:\/\//i.test(asset)) return asset;
    if (/^(?:\/|\.\/|\.\.\/)/.test(asset) || /\.(?:webp|png|jpe?g|gif|svg)(?:[?#].*)?$/i.test(asset)) return asset;
    return cloudinaryUrl(asset, options);
  }

  function preload(url, kind) {
    if (!url || !document.head) return;
    const existing = document.head.querySelector(`link[data-game-layer-preload="${kind}"]`);
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('data-game-layer-preload', kind);
    document.head.appendChild(link);
  }

  function setImageVar(root, name, value) {
    if (!root) return;
    root.style.setProperty(name, value ? `url("${value}")` : 'none');
  }

  function setVar(root, name, value) {
    if (!root || value === undefined || value === null || value === '') return;
    root.style.setProperty(name, String(value));
  }

  function ensureScene(root) {
    let scene = root.querySelector(':scope > .game-layer-scene');
    if (scene) return scene;
    scene = document.createElement('div');
    scene.className = 'game-layer-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = [
      '<div class="game-layer-scene__bg"></div>',
      '<div class="game-layer-scene__frame"></div>',
      '<div class="game-layer-scene__character"></div>',
      '<div class="game-layer-scene__overlay"></div>'
    ].join('');
    root.insertBefore(scene, root.firstChild);
    return scene;
  }

  function findDefaultRoot() {
    return document.querySelector([
      '.cardlab-shell',
      '.study-shell',
      '.playlab-snack-shell',
      '.number-agency-shell'
    ].join(', '));
  }

  function mount(options) {
    const root = options && options.root
      ? options.root
      : findDefaultRoot();
    if (!root) return null;
    const family = options && options.family ? options.family : detectFamily();
    const matchedTheme = pageTheme();
    const theme = mergeTheme(family, Object.assign({}, matchedTheme || {}, options && options.theme));
    const background = resolveAsset(theme.background, { transform: 'f_auto,q_auto,w_1600,c_limit' });
    const frame = '';
    const character = '';

    root.classList.add('game-layer-shell');
    root.setAttribute('data-game-layer-family', family);
    if (theme.name) root.setAttribute('data-game-layer-theme', theme.name);
    ensureScene(root);
    setImageVar(root, '--game-layer-bg', background);
    setImageVar(root, '--game-layer-frame', frame);
    setImageVar(root, '--game-layer-character', character);
    setVar(root, '--game-layer-accent', theme.accent);
    setVar(root, '--game-layer-panel', theme.panel);
    preload(background, `${family}-background`);
    preload(frame, `${family}-frame`);
    preload(character, `${family}-character`);
    return { root, family, theme };
  }

  window.HahaGameLayerSystem = {
    detectFamily,
    mount,
    preload,
    resolveAsset
  };

  function autoMount() {
    if (document.documentElement.getAttribute('data-game-layer-system') === 'off') return;
    mount();
  }

  function scheduleAutoMounts() {
    autoMount();
    enhanceStageSurfaces(document);
    window.setTimeout(autoMount, 360);
    window.setTimeout(function () { enhanceStageSurfaces(document); }, 380);
    window.setTimeout(autoMount, 1200);
    window.setTimeout(function () { enhanceStageSurfaces(document); }, 1220);
    window.setTimeout(function () { enhanceStageSurfaces(document); }, 2400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleAutoMounts, { once: true });
  } else {
    window.setTimeout(scheduleAutoMounts, 0);
  }
})();
