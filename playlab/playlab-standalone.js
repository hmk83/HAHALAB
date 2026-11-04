(function () {
  const PAGE_CONFIG = window.PLAYLAB_PAGE_CONFIG || {};
  const TYPE = String(PAGE_CONFIG.type || '').trim();
  if (!TYPE) return;
  const IS_SHAPE = TYPE === 'shape-match';
  const IS_COLOR_TRACE = TYPE === 'color-trace';
  const IS_COLOR_MEMORY = TYPE === 'color-memory';
  const IS_ICON_FIND = TYPE === 'icon-find';
  const IS_ICON_ODD_FIND = TYPE === 'icon-odd-find';
  const IS_FOOD_HEALTH_FIND = TYPE === 'food-health-find';
  const IS_DOORLOCK = TYPE === 'doorlock';
  const IS_ICON_GAME = IS_ICON_FIND || IS_ICON_ODD_FIND || IS_FOOD_HEALTH_FIND;
  const IS_TIMED_GAME = IS_ICON_GAME || IS_DOORLOCK;
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const PLAYLAB_REPORT_SCOPE = resolveRuntimeLabScope();
  const PLAYLAB_LABEL = PLAYLAB_REPORT_SCOPE === 'rehab' ? '재활랩' : '플레이랩';
  const LAB_LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
  const REHAB_MENU_MODE = PLAYLAB_REPORT_SCOPE === 'rehab';
  const REHAB_AGE_GROUPS = [
    { id: 'preschool', label: '유아', range: '4-6세', shift: -2, extraLives: 1, note: '시각 단서를 천천히 확인하며 기본 규칙을 형성합니다.' },
    { id: 'elementary', label: '초등', range: '7-12세', shift: -1, extraLives: 0, note: '기초 정확도와 선택 주의 유지, 자기 점검을 함께 봅니다.' },
    { id: 'teen', label: '청소년', range: '13-18세', shift: 0, extraLives: 0, note: '속도와 정확도를 함께 유지하며 고부하 조건을 조절합니다.' },
    { id: 'adult', label: '성인', range: '19-64세', shift: 1, extraLives: 0, note: '작업기억 부하와 선택 억제를 함께 관찰합니다.' },
    { id: 'senior', label: '고령자', range: '65세+', shift: -2, extraLives: 1, note: '처리 속도보다 안정적 수행과 반복 성공 경험을 우선합니다.' }
  ];

  const REHAB_LEVEL_LIBRARY = {
    doorlock: [
      { id: 'lv1', index: 1, label: '시각 3자리 기초', desc: '불빛 3자리를 보고 순차 입력 규칙을 익힙니다.', mode: 'visual', sequenceLength: 3, totalQuestions: 5 },
      { id: 'lv2', index: 2, label: '청각 3자리 기초', desc: '숫자 소리 3자리를 순서대로 유지합니다.', mode: 'audio', sequenceLength: 3, totalQuestions: 5 },
      { id: 'lv3', index: 3, label: '시각 4자리 표준', desc: '시각 단서 4자리를 안정적으로 입력합니다.', mode: 'visual', sequenceLength: 4, totalQuestions: 6 },
      { id: 'lv4', index: 4, label: '청각 4자리 표준', desc: '청각 단서 4자리를 유지하며 순서를 점검합니다.', mode: 'audio', sequenceLength: 4, totalQuestions: 6 },
      { id: 'lv5', index: 5, label: '시각 5자리 확장', desc: '5자리 시각 비밀번호에서 고부하 작업기억을 관찰합니다.', mode: 'visual', sequenceLength: 5, totalQuestions: 6 },
      { id: 'lv6', index: 6, label: '청각 5자리 심화', desc: '청각 5자리와 자기 점검을 함께 요구하는 심화 단계입니다.', mode: 'audio', sequenceLength: 5, totalQuestions: 6 }
    ],
    'color-trace': [
      { id: 'lv1', index: 1, label: '3색 연결 기초', desc: '짧은 연결 순서를 보고 기본 규칙을 익힙니다.', connectionCount: 3, totalQuestions: 5 },
      { id: 'lv2', index: 2, label: '4색 연결 준비', desc: '도트 위치가 달라도 4단계를 유지합니다.', connectionCount: 4, totalQuestions: 5 },
      { id: 'lv3', index: 3, label: '4색 연결 표준', desc: '순서 유지와 오반응 억제를 함께 봅니다.', connectionCount: 4, totalQuestions: 6 },
      { id: 'lv4', index: 4, label: '5색 연결 확장', desc: '시지각 추적과 작업기억 부하를 높입니다.', connectionCount: 5, totalQuestions: 6 },
      { id: 'lv5', index: 5, label: '6색 연결 고부하', desc: '더 긴 색 순서를 연속해서 유지합니다.', connectionCount: 6, totalQuestions: 7 },
      { id: 'lv6', index: 6, label: '7색 연결 심화', desc: '복합 순서와 자기 점검을 동시에 요구합니다.', connectionCount: 7, totalQuestions: 7 }
    ],
    'color-memory': [
      { id: 'lv1', index: 1, label: '시범 따라가기', desc: '짧은 시각 순서를 보고 그대로 재현합니다.', templateBaseIndex: 0 },
      { id: 'lv2', index: 2, label: '기초 순차 기억', desc: '2-3단계 기억 유지와 클릭 정확도를 봅니다.', templateBaseIndex: 2 },
      { id: 'lv3', index: 3, label: '표준 순차 기억', desc: '4단계 전후의 작업기억을 표준 부하로 관찰합니다.', templateBaseIndex: 5 },
      { id: 'lv4', index: 4, label: '숫자 순서 유지', desc: '숫자-색 이중 부호화로 간섭을 조절합니다.', templateBaseIndex: 8 },
      { id: 'lv5', index: 5, label: '혼합 기억 확장', desc: '유형 전환과 순차 기억을 함께 요구합니다.', templateBaseIndex: 12 },
      { id: 'lv6', index: 6, label: '혼합 기억 심화', desc: '짧은 노출 시간과 긴 순서를 동시에 유지합니다.', templateBaseIndex: 16 }
    ],
    'icon-find': [
      { id: 'lv1', index: 1, label: '작은 보드 탐색', desc: '작은 보드에서 목표 아이콘을 정확히 찾습니다.', templateBaseIndex: 0 },
      { id: 'lv2', index: 2, label: '기초 선택 탐색', desc: '같은 자극 사이에서 목표를 안정적으로 골라냅니다.', templateBaseIndex: 2 },
      { id: 'lv3', index: 3, label: '표준 시각 탐색', desc: '4-5단계 크기 보드에서 선택적 주의를 유지합니다.', templateBaseIndex: 4 },
      { id: 'lv4', index: 4, label: '넓은 보드 탐색', desc: '넓어진 시야 안에서 탐색 지속성을 봅니다.', templateBaseIndex: 7 },
      { id: 'lv5', index: 5, label: '고밀도 탐색', desc: '방해 자극이 많은 조건에서 시각 스캔을 유지합니다.', templateBaseIndex: 10 },
      { id: 'lv6', index: 6, label: '임상 심화 탐색', desc: '고밀도 보드와 긴 탐색 지속을 요구합니다.', templateBaseIndex: 14 }
    ],
    'icon-odd-find': [
      { id: 'lv1', index: 1, label: '다른 그림 1개 기초', desc: '작은 보드에서 다른 자극 1개를 찾습니다.', templateBaseIndex: 0 },
      { id: 'lv2', index: 2, label: '기초 변별 확장', desc: '배치가 넓어져도 다른 자극을 골라냅니다.', templateBaseIndex: 2 },
      { id: 'lv3', index: 3, label: '표준 시지각 변별', desc: '선택적 주의와 시각 변별을 함께 봅니다.', templateBaseIndex: 4 },
      { id: 'lv4', index: 4, label: '얼굴 자극 변별', desc: '유사도가 높은 자극에서 차이를 판단합니다.', templateBaseIndex: 7 },
      { id: 'lv5', index: 5, label: '다중 이탈 자극', desc: '2개 이상의 다른 자극을 끝까지 추적합니다.', templateBaseIndex: 10 },
      { id: 'lv6', index: 6, label: '고부하 변별 심화', desc: '고밀도 얼굴 자극 속 미세 차이를 유지합니다.', templateBaseIndex: 14 }
    ]
  };

  const FEEDBACK_SOUNDS = {
    correct: '../sound/correct.mp3',
    wrong: '../sound/error.mp3',
    select: '../sound/select.mp3',
    doorHash: '../sound/number/number-SARP.mp3',
    doorDigit: '../sound/number/number-read-',
    doorOpen: '../sound/number/number-opendoor.mp3',
    doorVisualKey: '../sound/etc/opendoor-',
    doorError: '../sound/etc/opendoor-error.mp3',
    doorErrorStep: '../sound/etc/opendoor-error-2.mp3'
  };

  function resolveRuntimeLabScope() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const labKind = String(params.get('labKind') || '').trim().toLowerCase();
      const fileName = String(window.location.pathname || '').split('/').pop() || '';
      if (labKind === 'rehab' || fileName.startsWith('rehablab-')) return 'rehab';
    } catch (_error) {}
    return 'playlab';
  }

  const DOORLOCK_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  const DOORLOCK_VISUAL_START_DELAY_MS = 980;
  const DOORLOCK_VISUAL_STEP_GAP_MS = 1000;
  const DOORLOCK_AUDIO_START_DELAY_MS = 720;
  const DOORLOCK_AUDIO_STEP_GAP_MS = 680;
  const DOORLOCK_VISUAL_KEY_SOUND_MAP = {
    '1': '1',
    '2': '4',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '1',
    '9': '4',
    '*': '3',
    '0': '4',
    '#': '4'
  };

  const DOORLOCK_STAGE_TEMPLATES = [
    {
      id: 'doorlock-stage-01',
      badge: '01',
      title: '불빛 비밀번호',
      subtitle: '도어락 숫자판에 들어오는 불빛을 보고 4자리 비밀번호와 #을 눌러요.',
      totalQuestions: 6,
      mode: 'visual',
      sequenceLength: 4,
      lives: 5
    },
    {
      id: 'doorlock-stage-02',
      badge: '02',
      title: '소리 비밀번호',
      subtitle: '숫자 소리를 듣고 4자리 비밀번호와 #을 순서대로 눌러요.',
      totalQuestions: 6,
      mode: 'audio',
      sequenceLength: 4,
      lives: 5
    },
    {
      id: 'doorlock-stage-03',
      badge: '03',
      title: '불빛 비밀번호 5자리',
      subtitle: '도어락 숫자판에 들어오는 불빛을 보고 5자리 비밀번호와 #을 눌러요.',
      totalQuestions: 6,
      mode: 'visual',
      sequenceLength: 5,
      lives: 5
    },
    {
      id: 'doorlock-stage-04',
      badge: '04',
      title: '소리 비밀번호 5자리',
      subtitle: '숫자 소리 5개를 듣고 비밀번호와 #을 순서대로 눌러요.',
      totalQuestions: 6,
      mode: 'audio',
      sequenceLength: 5,
      lives: 5
    }
  ];

  const COLOR_TRACE_LEGEND = [
    { code: '1', label: '빨강', color: '#ef4444' },
    { code: '2', label: '주황', color: '#fb923c' },
    { code: '3', label: '노랑', color: '#facc15' },
    { code: '4', label: '초록', color: '#22c55e' },
    { code: '5', label: '파랑', color: '#3b82f6' },
    { code: '6', label: '보라', color: '#8b5cf6' },
    { code: '7', label: '분홍', color: '#ec4899' },
    { code: '8', label: '회색', color: '#9ca3af' },
    { code: '9', label: '갈색', color: '#92400e' },
    { code: '10', label: '하늘', color: '#06b6d4' }
  ];

  const COLOR_TRACE_BOARD_VARIANTS = ['pentagon', 'square', 'hexagon', 'heptagon', 'circle', 'octagon', 'grid-3x4'];

  const COLOR_MEMORY_STAGE_TEMPLATES = [
    { title: '따라 클릭하기 01', subtitle: '짧은 클릭 순서를 보고 그대로 따라가요.', totalQuestions: 5, connectionCount: 3, mode: 'demo-follow', memoryMs: 3200, boardVariants: ['circle', 'pentagon'], legendPoolSize: 4 },
    { title: '따라 클릭하기 02', subtitle: '도트 위치가 달라도 클릭 순서를 기억해요.', totalQuestions: 5, connectionCount: 3, mode: 'demo-follow', memoryMs: 3000, boardVariants: ['square', 'circle'], legendPoolSize: 4 },
    { title: '따라 클릭하기 03', subtitle: '클릭 순서를 끝까지 유지하며 다시 눌러요.', totalQuestions: 6, connectionCount: 4, mode: 'demo-follow', memoryMs: 2850, boardVariants: ['pentagon', 'hexagon'], legendPoolSize: 5 },
    { title: '따라 클릭하기 04', subtitle: '비슷한 색 속에서도 순서를 놓치지 않아요.', totalQuestions: 6, connectionCount: 4, mode: 'demo-follow', memoryMs: 2700, boardVariants: ['hexagon', 'heptagon'], legendPoolSize: 5 },
    { title: '따라 클릭하기 05', subtitle: '더 긴 클릭 순서를 보고 다시 재현해요.', totalQuestions: 7, connectionCount: 5, mode: 'demo-follow', memoryMs: 2500, boardVariants: ['heptagon', 'octagon'], legendPoolSize: 6 },
    { title: '따라 클릭하기 06', subtitle: '속도가 달라져도 클릭 순서를 안정적으로 따라가요.', totalQuestions: 7, connectionCount: 5, mode: 'demo-follow', memoryMs: 2350, boardVariants: ['octagon', 'grid-3x4'], legendPoolSize: 6 },
    { title: '숫자 기억 01', subtitle: '숫자와 색을 함께 보고 순서를 기억해요.', totalQuestions: 6, connectionCount: 3, mode: 'number-memory', memoryMs: 3000, boardVariants: ['circle', 'square'], legendPoolSize: 5 },
    { title: '숫자 기억 02', subtitle: '잠깐 본 숫자 순서를 머릿속에 유지해요.', totalQuestions: 6, connectionCount: 4, mode: 'number-memory', memoryMs: 2700, boardVariants: ['pentagon', 'hexagon'], legendPoolSize: 6 },
    { title: '숫자 기억 03', subtitle: '숫자가 사라져도 색과 순서를 함께 떠올려요.', totalQuestions: 7, connectionCount: 4, mode: 'number-memory', memoryMs: 2400, boardVariants: ['hexagon', 'heptagon'], legendPoolSize: 6 },
    { title: '숫자 기억 04', subtitle: '더 많은 숫자를 짧게 보고 정확히 기억해요.', totalQuestions: 7, connectionCount: 5, mode: 'number-memory', memoryMs: 2150, boardVariants: ['heptagon', 'octagon'], legendPoolSize: 7 },
    { title: '숫자 기억 05', subtitle: '헷갈리는 색 배치 속에서도 숫자 순서를 유지해요.', totalQuestions: 8, connectionCount: 5, mode: 'number-memory', memoryMs: 1900, boardVariants: ['octagon', 'grid-3x4'], legendPoolSize: 7 },
    { title: '숫자 기억 06', subtitle: '긴 숫자 순서를 더 짧은 시간 안에 기억해요.', totalQuestions: 8, connectionCount: 6, mode: 'number-memory', memoryMs: 1650, boardVariants: ['grid-3x4', 'octagon'], legendPoolSize: 8 },
    { title: '혼합 기억 01', subtitle: '클릭 기억과 숫자 기억이 번갈아 나와요.', totalQuestions: 8, connectionCount: 4, mode: 'mixed', memoryMs: 2500, boardVariants: ['circle', 'pentagon', 'square'], legendPoolSize: 6 },
    { title: '혼합 기억 02', subtitle: '유형이 바뀌어도 순서를 빠르게 파악해요.', totalQuestions: 8, connectionCount: 4, mode: 'mixed', memoryMs: 2300, boardVariants: ['hexagon', 'heptagon', 'square'], legendPoolSize: 6 },
    { title: '혼합 기억 03', subtitle: '순서를 본 뒤 바로 다른 방식으로 재현해요.', totalQuestions: 9, connectionCount: 5, mode: 'mixed', memoryMs: 2100, boardVariants: ['pentagon', 'hexagon', 'octagon'], legendPoolSize: 7 },
    { title: '혼합 기억 04', subtitle: '도트 수가 늘어나도 두 규칙을 함께 처리해요.', totalQuestions: 9, connectionCount: 5, mode: 'mixed', memoryMs: 1900, boardVariants: ['heptagon', 'octagon', 'grid-3x4'], legendPoolSize: 7 },
    { title: '혼합 기억 05', subtitle: '짧은 노출 시간 안에서도 핵심 순서를 잡아내요.', totalQuestions: 9, connectionCount: 6, mode: 'mixed', memoryMs: 1700, boardVariants: ['hexagon', 'octagon', 'grid-3x4'], legendPoolSize: 8 },
    { title: '혼합 기억 06', subtitle: '유형 전환과 긴 순서를 동시에 버텨내요.', totalQuestions: 10, connectionCount: 6, mode: 'mixed', memoryMs: 1500, boardVariants: ['heptagon', 'octagon', 'grid-3x4'], legendPoolSize: 8 },
    { title: '혼합 기억 07', subtitle: '헷갈리는 배치 속에서도 순서를 끝까지 유지해요.', totalQuestions: 10, connectionCount: 7, mode: 'mixed', memoryMs: 1350, boardVariants: ['octagon', 'grid-3x4'], legendPoolSize: 9 },
    { title: '혼합 기억 08', subtitle: '가장 짧은 노출 시간에도 정확히 기억해 마무리해요.', totalQuestions: 10, connectionCount: 7, mode: 'mixed', memoryMs: 1200, boardVariants: ['octagon', 'grid-3x4'], legendPoolSize: 10 }
  ];

  const ICON_FIND_POOL = [
    { symbol: '😀', label: '웃는 얼굴' },
    { symbol: '😴', label: '졸린 얼굴' },
    { symbol: '😉', label: '윙크 얼굴' },
    { symbol: '😳', label: '놀란 얼굴' },
    { symbol: '😎', label: '선글라스 얼굴' },
    { symbol: '🤔', label: '생각하는 얼굴' },
    { symbol: '😆', label: '활짝 웃는 얼굴' },
    { symbol: '🥳', label: '파티 얼굴' },
    { symbol: '😍', label: '하트 눈 얼굴' },
    { symbol: '🤠', label: '카우보이 얼굴' },
    { symbol: '🤖', label: '로봇' },
    { symbol: '👻', label: '유령' },
    { symbol: '🐶', label: '강아지' },
    { symbol: '🐱', label: '고양이' },
    { symbol: '🐼', label: '판다' },
    { symbol: '🐸', label: '개구리' },
    { symbol: '🦊', label: '여우' },
    { symbol: '🐵', label: '원숭이' },
    { symbol: '🐻', label: '곰' },
    { symbol: '🐯', label: '호랑이' },
    { symbol: '🍎', label: '사과' },
    { symbol: '🍋', label: '레몬' },
    { symbol: '🍓', label: '딸기' },
    { symbol: '🍇', label: '포도' },
    { symbol: '🍒', label: '체리' },
    { symbol: '⭐', label: '별' },
    { symbol: '☀️', label: '해' },
    { symbol: '🌈', label: '무지개' },
    { symbol: '⚽', label: '축구공' },
    { symbol: '🧩', label: '퍼즐' },
    { symbol: '🎈', label: '풍선' },
    { symbol: '🚗', label: '자동차' },
    { symbol: '🚌', label: '버스' },
    { symbol: '🚲', label: '자전거' },
    { symbol: '✈️', label: '비행기' },
    { symbol: '🚀', label: '로켓' }
  ];

  const ICON_FIND_STAGE_TEMPLATES = [
    { rows: 3, cols: 3, totalQuestions: 4, targetCount: 3, distractorKinds: 3, lives: 5 },
    { rows: 3, cols: 3, totalQuestions: 5, targetCount: 4, distractorKinds: 4, lives: 5 },
    { rows: 4, cols: 4, totalQuestions: 5, targetCount: 4, distractorKinds: 4, lives: 5 },
    { rows: 4, cols: 4, totalQuestions: 6, targetCount: 5, distractorKinds: 5, lives: 5 },
    { rows: 5, cols: 5, totalQuestions: 5, targetCount: 5, distractorKinds: 5, lives: 5 },
    { rows: 5, cols: 5, totalQuestions: 6, targetCount: 6, distractorKinds: 6, lives: 5 },
    { rows: 6, cols: 6, totalQuestions: 5, targetCount: 6, distractorKinds: 6, lives: 5 },
    { rows: 6, cols: 6, totalQuestions: 6, targetCount: 7, distractorKinds: 7, lives: 5 },
    { rows: 7, cols: 7, totalQuestions: 5, targetCount: 7, distractorKinds: 7, lives: 5 },
    { rows: 7, cols: 7, totalQuestions: 6, targetCount: 8, distractorKinds: 8, lives: 5 },
    { rows: 7, cols: 7, totalQuestions: 7, targetCount: 9, distractorKinds: 8, lives: 5 },
    { rows: 8, cols: 8, totalQuestions: 6, targetCount: 8, distractorKinds: 8, lives: 5 },
    { rows: 8, cols: 8, totalQuestions: 7, targetCount: 9, distractorKinds: 9, lives: 5 },
    { rows: 8, cols: 8, totalQuestions: 7, targetCount: 10, distractorKinds: 10, lives: 5 },
    { rows: 9, cols: 9, totalQuestions: 6, targetCount: 10, distractorKinds: 10, lives: 5 },
    { rows: 9, cols: 9, totalQuestions: 7, targetCount: 11, distractorKinds: 11, lives: 5 },
    { rows: 9, cols: 9, totalQuestions: 7, targetCount: 12, distractorKinds: 12, lives: 5 },
    { rows: 10, cols: 10, totalQuestions: 6, targetCount: 12, distractorKinds: 12, lives: 5 },
    { rows: 10, cols: 10, totalQuestions: 7, targetCount: 13, distractorKinds: 13, lives: 5 },
    { rows: 10, cols: 10, totalQuestions: 8, targetCount: 14, distractorKinds: 14, lives: 5 }
  ];

  const FOOD_HEALTH_FIND_POOL = [
    { id: 'apple', label: '사과', group: 'fruit', imageSrc: 'images/category/fruit-apple-illust.webp' },
    { id: 'banana', label: '바나나', group: 'fruit', imageSrc: 'images/category/fruit-banana-illust.webp' },
    { id: 'grape', label: '포도', group: 'fruit', imageSrc: 'images/category/fruit-grape-illust.webp' },
    { id: 'orange', label: '오렌지', group: 'fruit', imageSrc: 'images/category/fruit-orange-illust.webp' },
    { id: 'strawberry', label: '딸기', group: 'fruit', imageSrc: 'images/category/fruit-strawberry-illust.webp' },
    { id: 'watermelon', label: '수박', group: 'fruit', imageSrc: 'images/category/fruit-watermelon-illust.webp' },
    { id: 'broccoli', label: '브로콜리', group: 'vegetable', imageSrc: 'images/category/vegetable-broccoli-illust.webp' },
    { id: 'carrot', label: '당근', group: 'vegetable', imageSrc: 'images/category/vegetable-carrot-illust.webp' },
    { id: 'cucumber', label: '오이', group: 'vegetable', imageSrc: 'images/category/vegetable-cucumber-illust.webp' },
    { id: 'spinach', label: '시금치', group: 'vegetable', imageSrc: 'images/category/vegetable-spinach-illust.webp' },
    { id: 'tomato', label: '토마토', group: 'vegetable', imageSrc: 'images/category/vegetable-tomato-illust.webp' },
    { id: 'tofu', label: '두부', group: 'protein', imageSrc: 'images/category/food-tofu-illust.webp' },
    { id: 'hamburger', label: '햄버거', group: 'fastfood', imageSrc: 'images/category/food-hamburger-illust.webp' },
    { id: 'pizza', label: '피자', group: 'fastfood', imageSrc: 'images/category/food-pizza-illust.webp' },
    { id: 'chicken', label: '치킨', group: 'fastfood', imageSrc: 'images/category/food-chicken-illust.webp' },
    { id: 'hot-dog', label: '핫도그', group: 'fastfood', imageSrc: 'images/category/food-hot-dog-illust.webp' },
    { id: 'icecream', label: '아이스크림', group: 'sweet', imageSrc: 'images/category/food-icecream-illust.webp' },
    { id: 'cake', label: '케이크', group: 'sweet', imageSrc: 'images/category/food-cake-illust.webp' },
    { id: 'jelly', label: '젤리', group: 'sweet', imageSrc: 'images/category/food-jelly-illust.webp' },
    { id: 'sugar', label: '설탕', group: 'sweet', imageSrc: 'images/category/food-sugar-illust.webp' }
  ];

  const FOOD_HEALTH_FIND_STAGE_TEMPLATES = [
    { title: '과일을 찾아요', prompt: '과일을 모두 찾아보세요.', guidance: '과일 그림을 잘 보고 1개를 골라요.', targetGroups: ['fruit'], rows: 2, cols: 2, totalQuestions: 4, targetCount: 1, mode: 'fruit', lives: 5 },
    { title: '채소를 찾아요', prompt: '채소를 모두 찾아보세요.', guidance: '채소 그림을 잘 보고 1개를 골라요.', targetGroups: ['vegetable'], rows: 2, cols: 3, totalQuestions: 4, targetCount: 1, mode: 'vegetable', lives: 5 },
    { title: '과일과 채소 찾기', prompt: '과일과 채소를 모두 찾아보세요.', guidance: '2개의 목표 음식을 끝까지 찾아요.', targetGroups: ['fruit', 'vegetable'], rows: 3, cols: 3, totalQuestions: 5, targetCount: 2, mode: 'produce', lives: 5 },
    { title: '패스트푸드를 찾아요', prompt: '패스트푸드를 모두 찾아보세요.', guidance: '빠르게 먹는 음식 그림을 찾아요.', targetGroups: ['fastfood'], rows: 3, cols: 3, totalQuestions: 5, targetCount: 2, mode: 'fastfood', lives: 5 },
    { title: '달콤한 간식을 찾아요', prompt: '달콤한 간식을 모두 찾아보세요.', guidance: '달거나 단 간식을 2개 찾아요.', targetGroups: ['sweet'], rows: 3, cols: 4, totalQuestions: 5, targetCount: 2, mode: 'sweet', lives: 5 },
    { title: '가끔 먹는 간식 찾기', prompt: '가끔 먹는 간식을 모두 찾아보세요.', guidance: '패스트푸드와 달콤한 간식을 3개 찾아요.', targetGroups: ['fastfood', 'sweet'], rows: 4, cols: 4, totalQuestions: 6, targetCount: 3, mode: 'sometimes', lives: 5 },
    { title: '몸에 좋은 음식 찾기', prompt: '몸을 튼튼하게 하는 음식을 모두 찾아보세요.', guidance: '과일·채소·두부처럼 자주 먹기 좋은 음식을 3개 찾아요.', targetGroups: ['fruit', 'vegetable', 'protein'], rows: 4, cols: 4, totalQuestions: 6, targetCount: 3, mode: 'healthy', lives: 5 },
    { title: '가끔 먹는 음식 찾기', prompt: '가끔 먹는 음식을 모두 찾아보세요.', guidance: '양과 횟수를 생각해 고르는 종합 단계예요.', targetGroups: ['fastfood', 'sweet'], rows: 4, cols: 5, totalQuestions: 6, targetCount: 4, mode: 'sometimes', lives: 5 }
  ];

  const ICON_ODD_GROUPS = [
    { id: 'vehicle-basic', kind: 'vehicle', symbols: ['🚗', '🚘', '🚙', '🚕'] },
    { id: 'vehicle-public', kind: 'vehicle', symbols: ['🚌', '🚐', '🚑', '🚒', '🚚'] },
    { id: 'color-hearts', kind: 'object', symbols: ['❤️', '🩷', '🧡', '💛', '💚', '💙', '💜'] },
    { id: 'color-circles', kind: 'object', symbols: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'] },
    { id: 'books', kind: 'object', symbols: ['📕', '📗', '📘', '📙'] },
    { id: 'smile-soft', kind: 'face-soft', symbols: ['🙂', '😊', '☺️', '😌', '😉', '🙃'] },
    { id: 'smile-bright', kind: 'face-soft', symbols: ['😀', '😃', '😄', '😁', '😆'] },
    { id: 'kiss-faces', kind: 'face-soft', symbols: ['😘', '😗', '😙', '😚'] },
    { id: 'playful-faces', kind: 'face-hard', symbols: ['😋', '😛', '😜', '😝'] },
    { id: 'thinking-faces', kind: 'face-hard', symbols: ['🤔', '🧐', '🤨', '🙄', '😐'] },
    { id: 'love-faces', kind: 'face-hard', symbols: ['😍', '🥰', '😻', '🤩'] },
    { id: 'cool-faces', kind: 'face-hard', symbols: ['😎', '🥸', '🤓', '😏'] }
  ];

  const ICON_ODD_STAGE_TEMPLATES = [
    { rows: 3, cols: 3, totalQuestions: 4, oddCount: 1, groupKinds: ['vehicle', 'object'], lives: 5 },
    { rows: 4, cols: 3, totalQuestions: 4, oddCount: 1, groupKinds: ['vehicle', 'object'], lives: 5 },
    { rows: 4, cols: 4, totalQuestions: 5, oddCount: 1, groupKinds: ['vehicle', 'object'], lives: 5 },
    { rows: 5, cols: 4, totalQuestions: 5, oddCount: 1, groupKinds: ['vehicle', 'object'], lives: 5 },
    { rows: 5, cols: 5, totalQuestions: 5, oddCount: 1, groupKinds: ['vehicle', 'object'], lives: 5 },
    { rows: 6, cols: 5, totalQuestions: 5, oddCount: 1, groupKinds: ['vehicle', 'object', 'face-soft'], lives: 5 },
    { rows: 6, cols: 6, totalQuestions: 6, oddCount: 1, groupKinds: ['vehicle', 'object', 'face-soft'], lives: 5 },
    { rows: 7, cols: 6, totalQuestions: 6, oddCount: 1, groupKinds: ['object', 'face-soft'], lives: 5 },
    { rows: 7, cols: 7, totalQuestions: 6, oddCount: 1, groupKinds: ['face-soft'], lives: 5 },
    { rows: 8, cols: 7, totalQuestions: 6, oddCount: 1, groupKinds: ['face-soft'], lives: 5 },
    { rows: 8, cols: 8, totalQuestions: 6, oddCount: 2, groupKinds: ['face-soft'], lives: 5 },
    { rows: 9, cols: 8, totalQuestions: 6, oddCount: 2, groupKinds: ['face-soft', 'face-hard'], lives: 5 },
    { rows: 9, cols: 9, totalQuestions: 7, oddCount: 2, groupKinds: ['face-soft', 'face-hard'], lives: 5 },
    { rows: 10, cols: 8, totalQuestions: 7, oddCount: 2, groupKinds: ['face-hard'], lives: 5 },
    { rows: 10, cols: 9, totalQuestions: 7, oddCount: 2, groupKinds: ['face-hard'], lives: 5 },
    { rows: 10, cols: 10, totalQuestions: 7, oddCount: 2, groupKinds: ['face-hard'], lives: 5 },
    { rows: 11, cols: 10, totalQuestions: 7, oddCount: 2, groupKinds: ['face-hard'], lives: 5 },
    { rows: 12, cols: 10, totalQuestions: 8, oddCount: 2, groupKinds: ['face-hard'], lives: 5 },
    { rows: 13, cols: 10, totalQuestions: 8, oddCount: 2, groupKinds: ['face-hard'], lives: 5 },
    { rows: 14, cols: 10, totalQuestions: 8, oddCount: 2, groupKinds: ['face-hard'], lives: 5 }
  ];

  const SHAPE_PATTERNS = [
    {
      id: 'bird',
      label: '새 모양',
      pieces: [
        { type: 'triLarge', color: '#38bdf8' },
        { type: 'triLarge', color: '#fde047' },
        { type: 'square', color: '#f472b6' },
        { type: 'triSmall', color: '#facc15' },
        { type: 'rectH', color: '#a78bfa' }
      ],
      layout: [
        { type: 'triLarge', color: '#38bdf8', x: 34, y: 88, rotate: 0 },
        { type: 'triLarge', color: '#fde047', x: 108, y: 46, rotate: 0 },
        { type: 'square', color: '#f472b6', x: 164, y: 92, rotate: 0 },
        { type: 'triSmall', color: '#facc15', x: 190, y: 44, rotate: 90 },
        { type: 'rectH', color: '#a78bfa', x: 110, y: 150, rotate: 0 }
      ]
    },
    {
      id: 'house',
      label: '집 모양',
      pieces: [
        { type: 'square', color: '#60a5fa' },
        { type: 'square', color: '#f472b6' },
        { type: 'triLarge', color: '#facc15' },
        { type: 'triMedium', color: '#38bdf8' },
        { type: 'rectV', color: '#f59e0b' }
      ],
      layout: [
        { type: 'square', color: '#60a5fa', x: 102, y: 98, rotate: 0 },
        { type: 'square', color: '#f472b6', x: 146, y: 98, rotate: 0 },
        { type: 'triLarge', color: '#facc15', x: 98, y: 30, rotate: 0 },
        { type: 'triMedium', color: '#38bdf8', x: 56, y: 104, rotate: 90 },
        { type: 'rectV', color: '#f59e0b', x: 138, y: 142, rotate: 0 }
      ]
    },
    {
      id: 'boat',
      label: '배 모양',
      pieces: [
        { type: 'rectH', color: '#f43f5e' },
        { type: 'triLarge', color: '#38bdf8' },
        { type: 'triMedium', color: '#fde047' },
        { type: 'triSmall', color: '#facc15' },
        { type: 'para', color: '#a78bfa' }
      ],
      layout: [
        { type: 'rectH', color: '#f43f5e', x: 60, y: 136, rotate: 0 },
        { type: 'triLarge', color: '#38bdf8', x: 40, y: 76, rotate: 0 },
        { type: 'triMedium', color: '#fde047', x: 120, y: 82, rotate: 90 },
        { type: 'triSmall', color: '#facc15', x: 136, y: 44, rotate: 0 },
        { type: 'para', color: '#a78bfa', x: 56, y: 172, rotate: 0 }
      ]
    },
    {
      id: 'robot',
      label: '로봇 모양',
      pieces: [
        { type: 'square', color: '#f472b6' },
        { type: 'rectH', color: '#38bdf8' },
        { type: 'square', color: '#a78bfa' },
        { type: 'square', color: '#a78bfa' },
        { type: 'triSmall', color: '#fde047' }
      ],
      layout: [
        { type: 'square', color: '#f472b6', x: 116, y: 48, rotate: 0 },
        { type: 'rectH', color: '#38bdf8', x: 74, y: 102, rotate: 0 },
        { type: 'square', color: '#a78bfa', x: 82, y: 148, rotate: 0 },
        { type: 'square', color: '#a78bfa', x: 142, y: 148, rotate: 0 },
        { type: 'triSmall', color: '#fde047', x: 120, y: 10, rotate: 0 }
      ]
    },
    {
      id: 'fish',
      label: '물고기 모양',
      pieces: [
        { type: 'triLarge', color: '#38bdf8' },
        { type: 'triLarge', color: '#fde047' },
        { type: 'para', color: '#f43f5e' },
        { type: 'triSmall', color: '#fca5a5' },
        { type: 'square', color: '#c4b5fd' }
      ],
      layout: [
        { type: 'triLarge', color: '#38bdf8', x: 42, y: 96, rotate: 270 },
        { type: 'triLarge', color: '#fde047', x: 138, y: 92, rotate: 90 },
        { type: 'para', color: '#f43f5e', x: 96, y: 62, rotate: 0 },
        { type: 'triSmall', color: '#fca5a5', x: 182, y: 56, rotate: 180 },
        { type: 'square', color: '#c4b5fd', x: 148, y: 50, rotate: 0 }
      ]
    },
    {
      id: 'rocket',
      label: '로켓 모양',
      pieces: [
        { type: 'rectV', color: '#38bdf8' },
        { type: 'triLarge', color: '#fde047' },
        { type: 'triMedium', color: '#f43f5e' },
        { type: 'triMedium', color: '#a78bfa' },
        { type: 'triSmall', color: '#facc15' }
      ],
      layout: [
        { type: 'rectV', color: '#38bdf8', x: 112, y: 58, rotate: 0 },
        { type: 'triLarge', color: '#fde047', x: 76, y: 114, rotate: 180 },
        { type: 'triMedium', color: '#f43f5e', x: 62, y: 154, rotate: 90 },
        { type: 'triMedium', color: '#a78bfa', x: 154, y: 154, rotate: 270 },
        { type: 'triSmall', color: '#facc15', x: 122, y: 18, rotate: 0 }
      ]
    }
  ];

  const SHAPE_STAGE_TEMPLATES = [
    { title: '같은 조각 찾기', subtitle: '왼쪽 그림을 만든 조각 묶음을 골라요.', patternIds: ['bird', 'house', 'boat'] },
    { title: '부분-전체 연결 1', subtitle: '부분 도형을 보고 전체 구성을 떠올려요.', patternIds: ['robot', 'fish', 'rocket'] },
    { title: '부분-전체 연결 2', subtitle: '비슷한 조각 속에서 맞는 묶음을 가려요.', patternIds: ['bird', 'robot', 'fish'] },
    { title: '색이 같은 조각 찾기', subtitle: '색과 모양을 함께 보며 정답을 골라요.', patternIds: ['house', 'boat', 'rocket'] },
    { title: '도형 수 비교하기', subtitle: '같은 조각 수를 가진 묶음을 찾는 단계예요.', patternIds: ['bird', 'house', 'robot'] },
    { title: '도형 회전 구분', subtitle: '회전된 조각도 같은 도형인지 살펴봐요.', patternIds: ['fish', 'rocket', 'boat'] },
    { title: '세밀한 조각 분해', subtitle: '작은 조각 차이까지 구분하며 매칭해요.', patternIds: ['bird', 'fish', 'rocket'] },
    { title: '복합 도형 매칭', subtitle: '여러 모양이 섞여도 전체를 떠올려요.', patternIds: ['house', 'robot', 'boat'] },
    { title: '빠른 도형 추리', subtitle: '짧은 시간 안에 맞는 조각 묶음을 골라요.', patternIds: ['rocket', 'bird', 'house'] },
    { title: '부분 힌트 매칭', subtitle: '핵심 조각만 보고 전체 묶음을 찾는 단계예요.', patternIds: ['robot', 'fish', 'boat'] },
    { title: '시지각 집중 매칭', subtitle: '비슷한 선택지 사이에서 끝까지 집중해요.', patternIds: ['house', 'rocket', 'bird'] },
    { title: '종합 도형 조각', subtitle: '지금까지 본 조각 패턴을 모두 활용해 마무리해요.', patternIds: ['bird', 'house', 'boat', 'robot', 'fish', 'rocket'] }
  ];

  const THEME = IS_SHAPE
    ? {
        accent: '#8b5cf6',
        accentSoft: '#f3e8ff',
        accentStrong: '#7c3aed',
        eyebrowBg: 'rgba(255,255,255,0.88)',
        eyebrowText: '#7c3aed'
      }
    : IS_ICON_GAME
      ? {
          accent: '#f97316',
          accentSoft: '#ffedd5',
          accentStrong: '#ea580c',
          eyebrowBg: 'rgba(255,255,255,0.92)',
          eyebrowText: '#c2410c'
        }
    : IS_DOORLOCK
      ? {
          accent: '#0f766e',
          accentSoft: '#ccfbf1',
          accentStrong: '#0f766e',
          eyebrowBg: 'rgba(255,255,255,0.9)',
          eyebrowText: '#115e59'
        }
    : {
        accent: '#0284c7',
        accentSoft: '#e0f2fe',
        accentStrong: '#0369a1',
        eyebrowBg: 'rgba(255,255,255,0.88)',
        eyebrowText: '#0369a1'
      };

  const $ = (selector) => document.querySelector(selector);
  const refs = {
    stageLabel: $('#shellStageLabel'),
    stageSelectButton: $('#stageSelectButton'),
    helpButton: $('#helpButton'),
    topbarSide: document.querySelector('.shell-topbar-side'),
    stageSelectView: $('#stageSelectView'),
    agePanel: document.querySelector('.traffic-age-panel'),
    levelGrid: $('#levelGrid'),
    startButton: $('#startButton'),
    introView: $('#introView'),
    lessonView: $('#lessonView'),
    resultView: $('#resultView'),
    stageGrid: $('#stageGrid'),
    introBadge: $('#introBadge'),
    introTitle: $('#introTitle'),
    introSubtitle: $('#introSubtitle'),
    introStage: $('#introStage'),
    introStartButton: $('#introStartButton'),
    introBackButton: $('#introBackButton'),
    playTitle: $('#playTitle'),
    playCopy: $('#playCopy'),
    playProgress: $('#playProgress'),
    lessonLayout: $('#lessonLayout'),
    resultTitle: $('#resultTitle'),
    resultSummary: $('#resultSummary'),
    resultStats: $('#resultStats'),
    resultRetryButton: $('#resultRetryButton'),
    resultBackButton: $('#resultBackButton'),
    feedbackOverlay: $('#feedbackOverlay'),
    helpModal: $('#helpModal'),
    helpTitle: $('#helpTitle'),
    helpSummary: $('#helpSummary'),
    helpHow: $('#helpHow'),
    helpBenefit: $('#helpBenefit'),
    helpClose: $('#helpClose'),
    confirmModal: $('#confirmModal'),
    confirmTitle: $('#confirmTitle'),
    confirmCopy: $('#confirmCopy'),
    confirmCancel: $('#confirmCancel'),
    confirmOk: $('#confirmOk')
  };

  const state = {
    selectedStageIndex: null,
    selectedRehabStage: null,
    selectedAgeId: '',
    selectedLevelId: '',
    run: null,
    confirmAction: null,
    feedbackTimer: null,
    feedbackAudio: null,
    selectAudio: null,
    previewTimers: [],
    hudTimer: null,
    doorAudio: null,
    doorAudioToken: 0,
    doorKeyTimer: null,
    supabaseClientPromise: null,
    lastWrongTraceCode: '',
    lastTraceInput: {
      code: '',
      time: 0
    },
    lastIconInput: {
      id: '',
      time: 0
    }
  };
  const launchContext = readLaunchContext();

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
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search || '');
      const launchKey = String(params.get('labLaunchKey') || '').trim();
      if (launchKey && launchKey.indexOf(LAB_LAUNCH_CONTEXT_STORAGE_PREFIX) === 0 && typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem(launchKey);
        const parsed = parseMaybeJson(raw, null);
        if (parsed && typeof parsed === 'object') return parsed;
      }

      const teacherId = String(params.get('teacherId') || '').trim();
      const clientId = String(params.get('clientId') || '').trim();
      if (teacherId && clientId) {
        return {
          teacherId: teacherId,
          teacherName: String(params.get('teacherName') || '').trim(),
          clientId: clientId,
          clientName: String(params.get('clientName') || '').trim(),
          clientType: String(params.get('clientType') || 'client').trim() || 'client',
          kind: String(params.get('labKind') || 'playlab').trim() || 'playlab',
          source: 'query'
        };
      }
    } catch (_error) {}
    return null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getRehabAge(ageId) {
    return REHAB_AGE_GROUPS.find((age) => age.id === ageId) || null;
  }

  function getRehabLevels() {
    return REHAB_LEVEL_LIBRARY[TYPE] || [];
  }

  function getSelectedRehabLevel() {
    return getRehabLevels().find((level) => level.id === state.selectedLevelId) || null;
  }

  function pickTemplate(templates, baseIndex, ageShift) {
    const safeTemplates = Array.isArray(templates) ? templates : [];
    if (!safeTemplates.length) return null;
    const index = clamp((Number(baseIndex) || 0) + (Number(ageShift) || 0), 0, safeTemplates.length - 1);
    return Object.assign({}, safeTemplates[index]);
  }

  function buildRehabStageFromSelection(ageId, levelId) {
    const age = getRehabAge(ageId);
    const level = getRehabLevels().find((item) => item.id === levelId);
    if (!age || !level) return null;

    if (TYPE === 'doorlock') {
      return {
        id: `${TYPE}-${age.id}-${level.id}`,
        badge: `LV${level.index}`,
        title: `${age.label} · ${level.label}`,
        subtitle: `${age.range} 기준 · ${level.desc}`,
        totalQuestions: level.totalQuestions,
        mode: level.mode,
        sequenceLength: level.sequenceLength,
        lives: 5 + Number(age.extraLives || 0),
        rehabAge: age,
        rehabLevel: level
      };
    }

    if (TYPE === 'color-trace') {
      const connectionCount = clamp(level.connectionCount + Math.max(0, Number(age.shift || 0)), 3, 10);
      return {
        id: `${TYPE}-${age.id}-${level.id}`,
        badge: `LV${level.index}`,
        title: `${age.label} · ${level.label}`,
        subtitle: `${age.range} 기준 · ${level.desc}`,
        totalQuestions: level.totalQuestions + (age.id === 'teen' || age.id === 'adult' ? 1 : 0),
        connectionCount,
        boardVariant: COLOR_TRACE_BOARD_VARIANTS[(level.index - 1) % COLOR_TRACE_BOARD_VARIANTS.length],
        rehabAge: age,
        rehabLevel: level
      };
    }

    if (TYPE === 'color-memory') {
      const template = pickTemplate(COLOR_MEMORY_STAGE_TEMPLATES, level.templateBaseIndex, age.shift);
      if (!template) return null;
      return {
        id: `${TYPE}-${age.id}-${level.id}`,
        badge: `LV${level.index}`,
        title: `${age.label} · ${level.label}`,
        subtitle: `${age.range} 기준 · ${level.desc}`,
        totalQuestions: template.totalQuestions,
        connectionCount: template.connectionCount,
        mode: template.mode,
        memoryMs: template.memoryMs + (age.id === 'preschool' || age.id === 'senior' ? 260 : age.id === 'elementary' ? 120 : 0),
        boardVariant: Array.isArray(template.boardVariants) ? template.boardVariants[0] : template.boardVariant,
        lives: 5 + Number(age.extraLives || 0),
        rehabAge: age,
        rehabLevel: level
      };
    }

    if (TYPE === 'icon-find') {
      const template = pickTemplate(ICON_FIND_STAGE_TEMPLATES, level.templateBaseIndex, age.shift);
      if (!template) return null;
      return {
        id: `${TYPE}-${age.id}-${level.id}`,
        badge: `LV${level.index}`,
        title: `${age.label} · ${level.label}`,
        subtitle: `${age.range} 기준 · ${level.desc}`,
        totalQuestions: template.totalQuestions,
        rows: template.rows,
        cols: template.cols,
        targetCount: template.targetCount,
        distractorKinds: template.distractorKinds,
        lives: Number(template.lives || 5) + Number(age.extraLives || 0),
        rehabAge: age,
        rehabLevel: level
      };
    }

    if (TYPE === 'icon-odd-find') {
      const template = pickTemplate(ICON_ODD_STAGE_TEMPLATES, level.templateBaseIndex, age.shift);
      if (!template) return null;
      return {
        id: `${TYPE}-${age.id}-${level.id}`,
        badge: `LV${level.index}`,
        title: `${age.label} · ${level.label}`,
        subtitle: `${age.range} 기준 · ${level.desc}`,
        totalQuestions: template.totalQuestions,
        rows: template.rows,
        cols: template.cols,
        oddCount: template.oddCount,
        groupKinds: template.groupKinds,
        lives: Number(template.lives || 5) + Number(age.extraLives || 0),
        rehabAge: age,
        rehabLevel: level
      };
    }

    return null;
  }

  function getSupabaseClient() {
    if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
    if (state.supabaseClientPromise) return state.supabaseClientPromise;
    state.supabaseClientPromise = Promise.resolve().then(function () {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        return null;
      }
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }).catch(function () {
      return null;
    });
    return state.supabaseClientPromise;
  }

  function normalizeLabScope(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'playlab' || normalized === 'gamelab' || normalized === 'game') return PLAYLAB_REPORT_SCOPE;
    return normalized;
  }

  function buildLabSessionHistoryInsertRow(params) {
    const session = params && params.session ? params.session : {};
    const completedAt = String(params && params.completedAt || new Date().toISOString()).trim();
    const startedAt = String(params && params.startedAt || session.startedAt || completedAt).trim();
    const normalizedScope = normalizeLabScope(params && (params.reportScope || params.labScope));
    const detailPayload = {
      report_scope: normalizedScope,
      lab_scope: normalizeLabScope(params && (params.labScope || params.reportScope)),
      lab_label: String(params && params.labLabel || '').trim(),
      lab_title: String(params && (params.title || params.contentTitle || params.stageTitle || params.levelTitle) || '').trim(),
      category_id: String(params && params.categoryId || '').trim(),
      category_title: String(params && params.categoryTitle || '').trim(),
      content_id: String(params && params.contentId || '').trim(),
      content_title: String(params && params.contentTitle || '').trim(),
      level_id: String(params && params.levelId || '').trim(),
      level_title: String(params && params.levelTitle || '').trim(),
      stage_id: String(params && params.stageId || '').trim(),
      stage_title: String(params && params.stageTitle || '').trim(),
      score: Number(params && params.score || 0) || 0,
      correct_count: Number(params && params.correctCount || 0) || 0,
      wrong_count: Number(params && params.wrongCount || 0) || 0,
      total_questions: Number(params && params.totalQuestions || 0) || 0,
      duration_minutes: Number(params && params.durationMinutes || 0) || 0,
      report_display_modes: params && params.reportDisplayModes || null,
      report_guardian_summary: String(params && params.guardianSummary || '').trim(),
      report_teacher_review_note: String(params && params.teacherReviewNote || '').trim(),
      report_action_plan_summary: String(params && params.actionPlanSummary || '').trim(),
      report_action_plan_policy: String(params && params.actionPlanPolicy || '').trim(),
      completed_at: completedAt,
      started_at: startedAt,
      session_kind: normalizedScope
    };
    const metadataPayload = {
      report_scope: normalizedScope,
      lab_scope: normalizeLabScope(params && (params.labScope || params.reportScope)),
      lab_label: String(params && params.labLabel || '').trim(),
      action_type: String(params && (params.labLabel || params.title || params.contentTitle || params.stageTitle || params.levelTitle) || '').trim(),
      duration_minutes: Number(params && params.durationMinutes || 0) || 0,
      report_display_modes: params && params.reportDisplayModes || null,
      report_guardian_summary: String(params && params.guardianSummary || '').trim(),
      report_teacher_review_note: String(params && params.teacherReviewNote || '').trim(),
      report_action_plan_summary: String(params && params.actionPlanSummary || '').trim(),
      duration: `${Math.max(0, Math.round(Number(params && params.durationMinutes || 0) || 0))} minutes`
    };

    return {
      teacher_id: String(session.teacherId || '').trim(),
      client_id: String(session.clientId || '').trim(),
      client_name: String(session.clientName || '').trim(),
      type: String(session.clientType || session.type || 'client').trim(),
      category: 'session_history',
      action: LAB_SESSION_COMPLETION_ACTION,
      action_type: String(params && (params.labLabel || params.title || params.contentTitle || params.stageTitle || params.levelTitle) || '').trim(),
      event_datetime: completedAt,
      start_datetime: startedAt,
      end_datetime: completedAt,
      duration: metadataPayload.duration,
      duration_minutes: Number(params && params.durationMinutes || 0) || 0,
      details: JSON.stringify(Object.assign({}, detailPayload, parseMaybeJson(params && params.details, {}))),
      metadata: Object.assign({}, metadataPayload, parseMaybeJson(params && params.metadata, {})),
      memo: String(params && (params.title || params.contentTitle || params.stageTitle || params.levelTitle || params.labLabel) || '').trim()
    };
  }

  function buildReportRecommendationLines(report) {
    return (report && Array.isArray(report.recommendations) ? report.recommendations : []).map(function (item) {
      if (!item) return '';
      const title = String(item.title || '').trim();
      const desc = String(item.desc || '').trim();
      return title && desc ? `${title}: ${desc}` : (title || desc);
    }).filter(Boolean);
  }

  function getReportAxisAverage(report, axisIds) {
    const axes = report && Array.isArray(report.axes) ? report.axes : [];
    const values = axisIds.map(function (id) {
      const axis = axes.find(function (item) {
        return item && item.id === id;
      });
      return axis ? Number(axis.score || 0) || 0 : 0;
    }).filter(function (value) {
      return value > 0;
    });
    if (!values.length) return 0;
    return Math.round(values.reduce(function (sum, value) {
      return sum + value;
    }, 0) / values.length);
  }

  function saveStandaloneResultHistory(reportInput, report, options) {
    if (!reportInput || !report || !launchContext) return Promise.resolve({ skipped: true });
    const session = {
      teacherId: String(launchContext.teacherId || '').trim(),
      clientId: String(launchContext.clientId || '').trim(),
      clientName: String(launchContext.clientName || '').trim(),
      clientType: String(launchContext.clientType || 'client').trim() || 'client'
    };
    if (!session.teacherId || !session.clientId) return Promise.resolve({ skipped: true });

    const harness = window.HahaLabLearningHarness;
    if (harness && typeof harness.recordSession === 'function') {
      const elapsedMs = Number(reportInput.elapsedMs);
      const reportScope = resolveRuntimeLabScope();
      return Promise.resolve(harness.recordSession({
        sessionId: options && options.sessionId,
        labKind: reportScope,
        reportScope,
        saveToClientReport: true,
        curriculumKey: String(window.location.pathname).split('/').pop().replace(/\.html$/i, ''),
        labTitle: String(PAGE_CONFIG.title || PLAYLAB_LABEL),
        stageKey: String(options && options.stageKey || ''),
        stageTitle: String(options && options.stageTitle || reportInput.stageTitle || ''),
        totalQuestions: reportInput.totalQuestions,
        correctCount: reportInput.correctCount,
        wrongCount: reportInput.wrongCount,
        accuracyScore: reportInput.accuracyRate,
        score: reportInput.accuracyRate,
        startedAtMs: reportInput.startedAtMs,
        durationSeconds: elapsedMs / 1000,
        reportType: reportInput.reportType,
        reportInput,
        briefOpinion: report.briefOpinion,
        guardianSummary: report.guardianSummary,
        details: {
          duration_seconds: elapsedMs / 1000,
          duration_minutes: elapsedMs / 60000,
          elapsed_ms: elapsedMs,
          report_integrated_score: null,
          report_cognitive_score: null,
          report_reaction_score: null,
          task_version: '20261104-standalone-raw-1',
          timing_source: 'browser-task-elapsed-including-preview',
          timing_limitation: '문항 시간에는 시범·기억 노출·피드백이 포함되며 자극 제시 후 반응시간과 다릅니다.'
        }
      }));
    }

    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(reportInput.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(report.elapsedMs || reportInput.elapsedMs || 0) / 60000));
    const title = String(PAGE_CONFIG.title || PLAYLAB_LABEL).trim() || PLAYLAB_LABEL;
    const reportScope = resolveRuntimeLabScope();
    const stageTitle = String(options && options.stageTitle || reportInput.stageTitle || '').trim();
    const detailPayload = {
      report_scope: reportScope,
      lab_scope: reportScope,
      lab_label: String(PAGE_CONFIG.labLabel || PLAYLAB_LABEL).trim() || PLAYLAB_LABEL,
      game_name: title,
      report_title: stageTitle,
      category_title: title,
      stage_title: stageTitle,
      score: Number(report.integratedScore || 0) || 0,
      accuracy_score: Number(report.accuracyRate || reportInput.accuracyRate || 0) || 0,
      correct_count: Number(reportInput.correctCount || 0) || 0,
      wrong_count: Number(reportInput.wrongCount || 0) || 0,
      total_questions: Number(reportInput.totalQuestions || reportInput.totalItems || 0) || 0,
      duration_minutes: durationMinutes,
      report_type: String(reportInput.reportType || '').trim(),
      report_input: reportInput,
      report_integrated_score: Number(report.integratedScore || 0) || 0,
      report_headline: String(report.headline || '').trim(),
      report_brief_opinion: String(report.briefOpinion || '').trim(),
      report_guardian_summary: String(report.guardianSummary || report.briefOpinion || '').trim(),
      report_teacher_review_note: String(report.teacherReviewNote || '').trim(),
      report_action_plan_summary: String(report.actionPlanSummary || '').trim(),
      report_action_plan_policy: 'teacher-review-required',
      report_display_modes: {
        guardian: {
          label: '보호자 공유 모드',
          summary: String(report.guardianSummary || report.briefOpinion || '').trim()
        },
        teacher: {
          label: '전문가 분석 모드',
          summary: String(report.teacherReviewNote || '').trim()
        }
      },
      report_overview: String(report.longOpinion || '').trim(),
      report_recommendations: buildReportRecommendationLines(report),
      report_axes: Array.isArray(report.axes) ? report.axes.map(function (axis) {
        return {
          id: String(axis.id || '').trim(),
          label: String(axis.label || '').trim(),
          score: Number(axis.score || 0) || 0
        };
      }) : [],
      report_cognitive_score: getReportAxisAverage(report, ['memory', 'sequencing', 'attention']),
      report_reaction_score: getReportAxisAverage(report, ['speed', 'inhibition', 'accuracy']),
      report_focus_key: String(options && options.focusKey || 'memory').trim(),
      report_focus_label: String(options && options.focusLabel || '작업기억').trim()
    };

    return getSupabaseClient().then(function (client) {
      if (!client) return { skipped: true };
      const row = buildLabSessionHistoryInsertRow({
        session: session,
        reportScope: reportScope,
        labScope: reportScope,
        labLabel: detailPayload.lab_label,
        title: title,
        categoryTitle: title,
        stageTitle: stageTitle,
        score: detailPayload.score,
        correctCount: detailPayload.correct_count,
        wrongCount: detailPayload.wrong_count,
        totalQuestions: detailPayload.total_questions,
        durationMinutes: durationMinutes,
        reportDisplayModes: detailPayload.report_display_modes,
        guardianSummary: detailPayload.report_guardian_summary,
        teacherReviewNote: detailPayload.report_teacher_review_note,
        actionPlanSummary: detailPayload.report_action_plan_summary,
        actionPlanPolicy: detailPayload.report_action_plan_policy,
        startedAt: startedAt,
        completedAt: completedAt,
        details: detailPayload,
        metadata: {
          report_scope: PLAYLAB_REPORT_SCOPE,
          lab_scope: PLAYLAB_REPORT_SCOPE,
          report_display_modes: detailPayload.report_display_modes,
          report_guardian_summary: detailPayload.report_guardian_summary,
          report_teacher_review_note: detailPayload.report_teacher_review_note,
          report_action_plan_summary: detailPayload.report_action_plan_summary,
          report_action_plan_policy: detailPayload.report_action_plan_policy,
          report_integrated_score: detailPayload.report_integrated_score,
          report_cognitive_score: detailPayload.report_cognitive_score,
          report_reaction_score: detailPayload.report_reaction_score
        }
      });
      return client.from('histories').insert(row);
    }).catch(function (error) {
      console.error('[playlab-standalone] history save failed:', error);
      return { error: error };
    });
  }

  function getAverageDuration(logs) {
    if (!Array.isArray(logs) || !logs.length) return 0;
    const durations = logs.map(function (entry) {
      return Number(entry.durationMs || 0);
    }).filter(function (value) {
      return value > 0;
    });
    if (!durations.length) return 0;
    return durations.reduce(function (sum, value) {
      return sum + value;
    }, 0) / durations.length;
  }

  function getStandaloneReportType() {
    if (IS_DOORLOCK) return 'standalone-doorlock';
    if (IS_COLOR_MEMORY) return 'standalone-color-memory';
    if (IS_COLOR_TRACE) return 'standalone-color-trace';
    if (IS_ICON_FIND) return 'standalone-icon-find';
    if (IS_ICON_ODD_FIND) return 'standalone-icon-odd-find';
    if (IS_FOOD_HEALTH_FIND) return 'standalone-food-health-find';
    if (IS_SHAPE) return 'standalone-shape';
    return 'standalone-playlab';
  }

  function ensureSavePdfButton() {
    if (refs.savePdfButton) return refs.savePdfButton;
    if (!refs.topbarSide) return null;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'savePdfButton';
    button.className = 'shell-icon-btn shell-save-btn shell-hidden';
    button.setAttribute('aria-label', 'PDF 저장');
    button.innerHTML = '' +
      '<svg class="shell-save-icon" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M6 3.75h9.5l4.75 4.75v11A1.5 1.5 0 0 1 18.75 21h-13.5A1.5 1.5 0 0 1 3.75 19.5v-14A1.5 1.5 0 0 1 5.25 4h.75z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M8 3.75v5h7v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M8 16.25h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '</svg>';
    refs.topbarSide.insertBefore(button, refs.helpButton || null);
    refs.savePdfButton = button;
    return button;
  }

  function formatStandaloneRichText(value) {
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.formatRichText === 'function') {
      return window.PlaylabReportEngine.formatRichText(value);
    }
    return String(value == null ? '' : value);
  }

  async function triggerPdfSave() {
    const stage = getSelectedStage();
    const nextTitle = `${PAGE_CONFIG.title || 'HAHALAB'}-${stage && stage.title ? stage.title : '리포트'}`;
    const button = refs.savePdfButton;
    if (button && button.disabled) return;
    const root = refs.resultView && (refs.resultView.querySelector('.playlab-report-shell') || refs.resultView);
    const selectedStage = state.selectedStageIndex;
    const mode = root && root.getAttribute('data-report-mode');
    try {
      if (button) { button.disabled = true; button.classList.add('is-saving'); }
      if (!root || !window.PlaylabReportEngine || typeof window.PlaylabReportEngine.triggerPdfSave !== 'function') throw new Error('저장할 리포트를 찾지 못했습니다.');
      await window.PlaylabReportEngine.triggerPdfSave({ title: nextTitle, root, validateBeforeDownload: function () { return selectedStage === state.selectedStageIndex && root.isConnected && root.getAttribute('data-report-mode') === mode && refs.resultView.classList.contains('is-active'); } });
    } catch (error) {
      console.error('[playlab] PDF save failed', error);
      window.alert(error && error.message || 'PDF 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      if (button) { button.disabled = false; button.classList.remove('is-saving'); }
    }
  }

  function beginQuestionTracking(run) {
    if (!run || run.currentQuestionStats) return;
    const question = run.questions[run.questionIndex];
    if (!question) return;
    run.currentQuestionStats = {
      questionIndex: run.questionIndex,
      questionType: question.type || TYPE || '',
      startedAtMs: Date.now(),
      wrongAttempts: 0,
      replayCount: 0,
      visualReplayCount: 0,
      audioReplayCount: 0,
      interactions: 0
    };
  }

  function ensureQuestionTracking(run) {
    if (!run) return null;
    if (!run.currentQuestionStats) {
      beginQuestionTracking(run);
    }
    return run.currentQuestionStats || null;
  }

  function recordQuestionInteraction(run, isWrong) {
    const questionStats = ensureQuestionTracking(run);
    if (!questionStats) return;
    questionStats.interactions += 1;
    if (isWrong) {
      questionStats.wrongAttempts += 1;
    }
  }

  function recordQuestionReplay(run, replayMode) {
    const questionStats = ensureQuestionTracking(run);
    if (!questionStats) return;
    questionStats.interactions += 1;
    questionStats.replayCount = Number(questionStats.replayCount || 0) + 1;
    if (replayMode === 'visual') {
      questionStats.visualReplayCount = Number(questionStats.visualReplayCount || 0) + 1;
    } else if (replayMode === 'audio') {
      questionStats.audioReplayCount = Number(questionStats.audioReplayCount || 0) + 1;
    }
  }

  function finalizeQuestionTracking(run, success, outcome) {
    if (!run || !run.currentQuestionStats) return;
    const questionStats = run.currentQuestionStats;
    const question = run.questions[questionStats.questionIndex] || {};
    const endedAtMs = Date.now();
    const durationMs = Math.max(220, endedAtMs - questionStats.startedAtMs);
    run.questionLogs.push({
      questionIndex: questionStats.questionIndex,
      questionType: questionStats.questionType,
      wrongAttempts: questionStats.wrongAttempts,
      replayCount: Number(questionStats.replayCount || 0),
      visualReplayCount: Number(questionStats.visualReplayCount || 0),
      audioReplayCount: Number(questionStats.audioReplayCount || 0),
      interactions: questionStats.interactions,
      durationMs: durationMs,
      taskElapsedMs: Math.max(0, endedAtMs - questionStats.startedAtMs),
      durationAdjusted: durationMs !== endedAtMs - questionStats.startedAtMs,
      timingSource: 'browser-task-elapsed-including-preview',
      success: Boolean(success),
      outcome: outcome || (success ? 'success' : 'failed'),
      boardSize: Number(question.rows || 0) * Number(question.cols || 0),
      targetCount: Number(question.targetCount || question.oddCount || question.sequenceCodes && question.sequenceCodes.length || 0),
      connectionCount: Number(question.sequenceCodes && question.sequenceCodes.length || 0),
      targetMode: String(question.mode || ''),
      targetFoodIds: Array.isArray(question.cells) ? question.cells.filter((cell) => cell.isTarget).map((cell) => cell.id) : [],
      selectedTargetIds: Array.isArray(run.selectedTargetIds) ? [...run.selectedTargetIds] : []
    });
    run.totalWrongAttempts += questionStats.wrongAttempts;
    run.totalReplayCount += Number(questionStats.replayCount || 0);
    run.visualReplayCount += Number(questionStats.visualReplayCount || 0);
    run.audioReplayCount += Number(questionStats.audioReplayCount || 0);
    if (success && questionStats.wrongAttempts === 0 && Number(questionStats.replayCount || 0) === 0) {
      run.correctOnFirstTryCount += 1;
    }
    run.currentQuestionStats = null;
  }

  function shuffle(items) {
    const next = Array.isArray(items) ? [...items] : [];
    for (let index = next.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
    }
    return next;
  }

  function stopFeedbackAudio() {
    if (state.feedbackAudio) {
      try {
        state.feedbackAudio.pause();
        state.feedbackAudio.currentTime = 0;
      } catch (_error) {}
      state.feedbackAudio = null;
    }
  }

  function stopSelectAudio() {
    if (state.selectAudio) {
      try {
        state.selectAudio.pause();
        state.selectAudio.currentTime = 0;
      } catch (_error) {}
      state.selectAudio = null;
    }
  }

  function stopDoorAudio() {
    state.doorAudioToken += 1;
    if (state.doorAudio) {
      try {
        state.doorAudio.pause();
        state.doorAudio.currentTime = 0;
      } catch (_error) {}
      state.doorAudio = null;
    }
  }

  function clearPreviewTimers() {
    if (!state.previewTimers.length) return;
    state.previewTimers.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    state.previewTimers = [];
  }

  function clearDoorKeyTimer() {
    if (state.doorKeyTimer) {
      window.clearTimeout(state.doorKeyTimer);
      state.doorKeyTimer = null;
    }
  }

  function formatDuration(totalMs) {
    const seconds = Math.max(0, Math.floor(Number(totalMs || 0) / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`;
  }

  function stopHudTimer() {
    if (state.hudTimer) {
      window.clearInterval(state.hudTimer);
      state.hudTimer = null;
    }
  }

  function updateIconHudTimer() {
    if (!IS_TIMED_GAME) return;
    const timerNode = document.querySelector('#playlabHudTimer');
    const run = state.run;
    if (!timerNode || !run || !run.startedAtMs) return;
    const elapsedMs = run.status === 'playing'
      ? Date.now() - run.startedAtMs
      : Number(run.elapsedMs || 0);
    run.elapsedMs = elapsedMs;
    timerNode.textContent = formatDuration(elapsedMs);
  }

  function startHudTimer() {
    stopHudTimer();
    if (!IS_TIMED_GAME) return;
    updateIconHudTimer();
    state.hudTimer = window.setInterval(updateIconHudTimer, 1000);
  }

  function schedulePreview(callback, delay) {
    const timerId = window.setTimeout(() => {
      state.previewTimers = state.previewTimers.filter((entry) => entry !== timerId);
      callback();
    }, delay);
    state.previewTimers.push(timerId);
    return timerId;
  }

  function playFeedbackSound(tone) {
    stopFeedbackAudio();
    const src = tone === 'correct' ? FEEDBACK_SOUNDS.correct : FEEDBACK_SOUNDS.wrong;
    const audio = new Audio(src);
    audio.preload = 'auto';
    state.feedbackAudio = audio;
    audio.play().catch(() => {});
  }

  function playSelectSound() {
    stopSelectAudio();
    const audio = new Audio(FEEDBACK_SOUNDS.select);
    audio.preload = 'auto';
    state.selectAudio = audio;
    audio.play().catch(() => {});
  }

  function getAudioContext() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return null;
    if (!state.doorAudioContext) {
      state.doorAudioContext = new AudioContextConstructor();
    }
    if (state.doorAudioContext.state === 'suspended') {
      state.doorAudioContext.resume().catch(() => {});
    }
    return state.doorAudioContext;
  }

  function playDoorTone(frequency, startOffset, duration, gainValue) {
    const context = getAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime + Number(startOffset || 0);
    const endTime = startTime + Number(duration || 0.08);
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(Number(frequency || 980), startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Number(gainValue || 0.18)), startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.02);
  }

  function playDoorBeep(key) {
    const baseFrequency = key === '#'
      ? 1220
      : key === '*'
        ? 760
        : 940 + ((Number(key) || 0) * 18);
    playDoorTone(baseFrequency, 0, 0.075, 0.16);
  }

  function getDoorVisualKeySoundSrc(key) {
    const soundId = DOORLOCK_VISUAL_KEY_SOUND_MAP[String(key)];
    return soundId ? `${FEEDBACK_SOUNDS.doorVisualKey}${soundId}.mp3` : '';
  }

  function playDoorVisualKeySound(key) {
    const src = getDoorVisualKeySoundSrc(key);
    if (!src) {
      playDoorBeep(key);
      return;
    }
    stopSelectAudio();
    const audio = new Audio(src);
    audio.preload = 'auto';
    state.selectAudio = audio;
    audio.play().catch(() => {
      playDoorBeep(key);
    });
  }

  function playDoorVisualPreviewSound(key, token) {
    return new Promise((resolve) => {
      const src = getDoorVisualKeySoundSrc(key);
      if (!src) {
        playDoorBeep(key);
        window.setTimeout(resolve, 180);
        return;
      }
      if (token !== state.doorAudioToken) {
        resolve();
        return;
      }
      if (state.doorAudio) {
        try {
          state.doorAudio.pause();
          state.doorAudio.currentTime = 0;
        } catch (_error) {}
      }
      const audio = new Audio(src);
      let settled = false;
      let fallbackTimer = null;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        if (state.doorAudio === audio) state.doorAudio = null;
        resolve();
      };
      state.doorAudio = audio;
      audio.preload = 'auto';
      audio.addEventListener('loadedmetadata', () => {
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        const durationMs = Number.isFinite(audio.duration) && audio.duration > 0
          ? Math.ceil(audio.duration * 1000) + 420
          : 30000;
        fallbackTimer = window.setTimeout(finish, Math.min(30000, Math.max(700, durationMs)));
      }, { once: true });
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
      fallbackTimer = window.setTimeout(finish, 30000);
      audio.play().catch(() => {
        playDoorBeep(key);
        finish();
      });
    });
  }

  function playDoorlockKeySound(key, mode) {
    if (mode === 'visual') {
      playDoorVisualKeySound(key);
      return;
    }
    playDoorBeep(key);
  }

  function playDoorWarning() {
    [0, 0.14, 0.28, 0.42].forEach((offset) => {
      playDoorTone(880, offset, 0.095, 0.36);
      playDoorTone(660, offset + 0.018, 0.075, 0.22);
    });
  }

  function playManagedFeedbackAudio(src) {
    stopFeedbackAudio();
    stopSelectAudio();
    return new Promise((resolve) => {
      const audio = new Audio(src);
      let settled = false;
      let fallbackTimer = null;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        if (state.feedbackAudio === audio) state.feedbackAudio = null;
        resolve();
      };
      state.feedbackAudio = audio;
      audio.preload = 'auto';
      audio.addEventListener('loadedmetadata', () => {
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        const durationMs = Number.isFinite(audio.duration) && audio.duration > 0
          ? Math.ceil(audio.duration * 1000) + 350
          : 12000;
        fallbackTimer = window.setTimeout(finish, Math.min(30000, Math.max(900, durationMs)));
      }, { once: true });
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
      fallbackTimer = window.setTimeout(finish, 12000);
      audio.play().catch(finish);
    });
  }

  function playDoorOpenSound() {
    return playManagedFeedbackAudio(FEEDBACK_SOUNDS.doorOpen);
  }

  function playDoorErrorSound(isFinalAttempt) {
    return playManagedFeedbackAudio(isFinalAttempt ? FEEDBACK_SOUNDS.doorError : FEEDBACK_SOUNDS.doorErrorStep);
  }

  function clearFeedback() {
    if (state.feedbackTimer) {
      window.clearTimeout(state.feedbackTimer);
      state.feedbackTimer = null;
    }
    refs.feedbackOverlay.innerHTML = '';
  }

  function showFeedback(tone, options) {
    const feedbackOptions = options || {};
    clearFeedback();
    if (!feedbackOptions.silent) {
      playFeedbackSound(tone);
    }
    const overlay = window.HahaFeedbackOverlay || window.PlaylabFeedbackOverlay;
    if (overlay && typeof overlay.show === 'function') {
      overlay.show(tone === 'correct' ? 'correct' : 'wrong', { sound: false });
    }
    state.feedbackTimer = window.setTimeout(clearFeedback, 640);
  }

  function getStages() {
    if (REHAB_MENU_MODE && REHAB_LEVEL_LIBRARY[TYPE]) {
      return [];
    }
    if (IS_DOORLOCK) {
      return DOORLOCK_STAGE_TEMPLATES.map((stage) => ({ ...stage }));
    }
    if (IS_SHAPE) {
      return SHAPE_STAGE_TEMPLATES.map((stage, index) => ({
        id: `shape-stage-${String(index + 1).padStart(2, '0')}`,
        badge: String(index + 1).padStart(2, '0'),
        title: stage.title,
        subtitle: stage.subtitle,
        totalQuestions: 6,
        optionCount: index < 4 ? 2 : index < 8 ? 3 : 4,
        patternIds: stage.patternIds
      }));
    }
    if (IS_COLOR_MEMORY) {
      return COLOR_MEMORY_STAGE_TEMPLATES.map((stage, index) => ({
        id: `memory-stage-${String(index + 1).padStart(2, '0')}`,
        badge: String(index + 1).padStart(2, '0'),
        title: stage.title,
        subtitle: stage.subtitle,
        totalQuestions: stage.totalQuestions,
        connectionCount: stage.connectionCount,
        mode: stage.mode,
        memoryMs: stage.memoryMs,
        boardVariant: stage.boardVariant
      }));
    }
    if (IS_ICON_FIND) {
      return ICON_FIND_STAGE_TEMPLATES.map((stage, index) => ({
        id: `icon-find-stage-${String(index + 1).padStart(2, '0')}`,
        badge: String(index + 1).padStart(2, '0'),
        title: `${stage.rows}x${stage.cols} 아이콘 찾기`,
        subtitle: `같은 아이콘 ${stage.targetCount}개를 보드에서 모두 찾아 터치해요.`,
        totalQuestions: stage.totalQuestions,
        rows: stage.rows,
        cols: stage.cols,
        targetCount: stage.targetCount,
        distractorKinds: stage.distractorKinds,
        lives: stage.lives
      }));
    }
    if (IS_FOOD_HEALTH_FIND) {
      return FOOD_HEALTH_FIND_STAGE_TEMPLATES.map((stage, index) => ({
        id: `food-health-find-stage-${String(index + 1).padStart(2, '0')}`,
        badge: String(index + 1).padStart(2, '0'),
        title: stage.title,
        subtitle: stage.guidance,
        totalQuestions: stage.totalQuestions,
        rows: stage.rows,
        cols: stage.cols,
        targetCount: stage.targetCount,
        mode: stage.mode,
        prompt: stage.prompt,
        guidance: stage.guidance,
        targetGroups: stage.targetGroups,
        lives: stage.lives
      }));
    }
    if (IS_ICON_ODD_FIND) {
      return ICON_ODD_STAGE_TEMPLATES.map((stage, index) => ({
        id: `icon-odd-stage-${String(index + 1).padStart(2, '0')}`,
        badge: String(index + 1).padStart(2, '0'),
        title: `${stage.rows}x${stage.cols} 다른 아이콘 찾기`,
        subtitle: `같은 아이콘들 사이에서 다른 아이콘 ${stage.oddCount}개를 빠르게 찾아요.`,
        totalQuestions: stage.totalQuestions,
        rows: stage.rows,
        cols: stage.cols,
        oddCount: stage.oddCount,
        groupKinds: stage.groupKinds,
        lives: stage.lives
      }));
    }
    return Array.from({ length: 20 }, (_, index) => {
      const connectionCount = Math.min(3 + Math.floor(index / 2), 10);
      const totalQuestions = Math.min(6 + Math.floor(index / 4), 10);
      return {
        id: `trace-stage-${String(index + 1).padStart(2, '0')}`,
        badge: String(index + 1).padStart(2, '0'),
        title: `${connectionCount}색 연결 ${index + 1}`,
        subtitle: '왼쪽 번호표와 순서를 보고 오른쪽 점을 차례대로 이어요.',
        totalQuestions,
        connectionCount,
        boardVariant: COLOR_TRACE_BOARD_VARIANTS[index % COLOR_TRACE_BOARD_VARIANTS.length]
      };
    });
  }

  const STAGES = getStages();

  function getSelectedStage() {
    if (state.selectedRehabStage) return state.selectedRehabStage;
    return STAGES[state.selectedStageIndex] || null;
  }

  function getStageDisplayTitle(stage) {
    if (!stage) return '';
    if (stage.rehabAge && stage.rehabLevel) {
      return `${stage.rehabAge.label} · ${stage.rehabLevel.label}`;
    }
    return String(stage.title || '').trim();
  }

  function getStageDisplaySubtitle(stage) {
    if (!stage) return '';
    if (stage.rehabAge && stage.rehabLevel) {
      return `${stage.rehabAge.range} 기준 · ${stage.rehabLevel.desc}`;
    }
    return String(stage.subtitle || '').trim();
  }

  function getPatternById(patternId) {
    return SHAPE_PATTERNS.find((pattern) => pattern.id === patternId) || SHAPE_PATTERNS[0];
  }

  function getPieceSize(type) {
    switch (type) {
      case 'triLarge':
        return { width: 82, height: 82 };
      case 'triMedium':
        return { width: 62, height: 62 };
      case 'triSmall':
        return { width: 42, height: 42 };
      case 'square':
        return { width: 46, height: 46 };
      case 'rectH':
        return { width: 74, height: 34 };
      case 'rectV':
        return { width: 34, height: 74 };
      case 'para':
        return { width: 70, height: 40 };
      default:
        return { width: 46, height: 46 };
    }
  }

  function createSvgElement(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  function renderPieceSvg(piece, sizeOverride) {
    const size = sizeOverride || getPieceSize(piece.type);
    const svg = createSvgElement('svg');
    svg.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
    svg.setAttribute('width', size.width);
    svg.setAttribute('height', size.height);
    const fill = piece.color || '#94a3b8';
    let shape;
    if (piece.type === 'triLarge' || piece.type === 'triMedium' || piece.type === 'triSmall') {
      shape = createSvgElement('polygon');
      shape.setAttribute('points', `${size.width / 2},0 ${size.width},${size.height} 0,${size.height}`);
    } else if (piece.type === 'square') {
      shape = createSvgElement('rect');
      shape.setAttribute('x', '3');
      shape.setAttribute('y', '3');
      shape.setAttribute('width', String(size.width - 6));
      shape.setAttribute('height', String(size.height - 6));
      shape.setAttribute('rx', '8');
    } else if (piece.type === 'rectH' || piece.type === 'rectV') {
      shape = createSvgElement('rect');
      shape.setAttribute('x', '3');
      shape.setAttribute('y', '3');
      shape.setAttribute('width', String(size.width - 6));
      shape.setAttribute('height', String(size.height - 6));
      shape.setAttribute('rx', '8');
    } else if (piece.type === 'para') {
      shape = createSvgElement('polygon');
      shape.setAttribute('points', `14,3 ${size.width - 2},3 ${size.width - 14},${size.height - 3} 2,${size.height - 3}`);
    } else {
      shape = createSvgElement('circle');
      shape.setAttribute('cx', String(size.width / 2));
      shape.setAttribute('cy', String(size.height / 2));
      shape.setAttribute('r', String(Math.min(size.width, size.height) / 2 - 4));
    }
    shape.setAttribute('fill', fill);
    shape.setAttribute('stroke', 'rgba(255,255,255,0.92)');
    shape.setAttribute('stroke-width', '4');
    svg.appendChild(shape);
    return svg;
  }

  function renderShapeComposite(pattern) {
    const shell = document.createElement('div');
    shell.className = 'playlab-shape-composite';
    pattern.layout.forEach((piece, index) => {
      const size = getPieceSize(piece.type);
      const node = document.createElement('div');
      node.className = 'playlab-shape-piece';
      node.style.width = `${size.width}px`;
      node.style.height = `${size.height}px`;
      node.style.left = `${piece.x}px`;
      node.style.top = `${piece.y}px`;
      node.style.transform = `rotate(${piece.rotate || 0}deg)`;
      node.appendChild(renderPieceSvg(piece));
      node.setAttribute('data-piece-index', String(index));
      shell.appendChild(node);
    });
    return shell;
  }

  function renderShapeOption(pieces) {
    const grid = document.createElement('div');
    grid.className = 'playlab-piece-grid';
    pieces.forEach((piece) => {
      const cell = document.createElement('div');
      cell.className = 'playlab-piece-cell';
      const baseSize = getPieceSize(piece.type);
      const maxSide = 54;
      const scale = maxSide / Math.max(baseSize.width, baseSize.height);
      const svg = renderPieceSvg(piece, {
        width: Math.max(18, Math.round(baseSize.width * scale)),
        height: Math.max(18, Math.round(baseSize.height * scale))
      });
      cell.appendChild(svg);
      grid.appendChild(cell);
    });
    return grid;
  }

  function createShapeQuestion(stage, questionIndex) {
    const patternIds = Array.isArray(stage.patternIds) && stage.patternIds.length
      ? stage.patternIds
      : SHAPE_PATTERNS.map((pattern) => pattern.id);
    const correctPattern = getPatternById(patternIds[questionIndex % patternIds.length]);
    const distractors = shuffle(
      SHAPE_PATTERNS.filter((pattern) => pattern.id !== correctPattern.id)
    ).slice(0, Math.max(1, stage.optionCount - 1));
    const options = shuffle([
      { id: `${correctPattern.id}-correct-${questionIndex}`, label: correctPattern.label, pieces: correctPattern.pieces, correct: true },
      ...distractors.map((pattern) => ({
        id: `${pattern.id}-option-${questionIndex}`,
        label: pattern.label,
        pieces: pattern.pieces,
        correct: false
      }))
    ]);
    return {
      id: `${stage.id}-question-${questionIndex + 1}`,
      type: 'shape-match',
      prompt: '왼쪽 그림과 조각 구성이 완전히 같은 묶음을 골라보세요.',
      correctPattern,
      options
    };
  }

  function createRegularPolygonVertices(sides, radius, centerX, centerY, rotateDeg) {
    return Array.from({ length: Math.max(3, sides) }, (_, index) => {
      const angle = ((rotateDeg + ((360 / Math.max(3, sides)) * index)) * Math.PI) / 180;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });
  }

  function interpolatePolygonPerimeterPoints(vertices, count) {
    if (!vertices.length || count <= 0) return [];
    if (count <= vertices.length) return vertices.slice(0, count);
    const edges = vertices.map((point, index) => ({
      start: point,
      end: vertices[(index + 1) % vertices.length]
    }));
    return Array.from({ length: count }, (_, index) => {
      const progress = index / count;
      const edgeProgress = progress * edges.length;
      const edgeIndex = Math.min(edges.length - 1, Math.floor(edgeProgress));
      const localT = edgeProgress - edgeIndex;
      const edge = edges[edgeIndex];
      return {
        x: edge.start.x + ((edge.end.x - edge.start.x) * localT),
        y: edge.start.y + ((edge.end.y - edge.start.y) * localT)
      };
    });
  }

  function createGridPoints(columns, rows, count, xStart, xGap, yStart, yGap) {
    const points = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        points.push({
          x: xStart + (column * xGap),
          y: yStart + (row * yGap)
        });
      }
    }
    return points.slice(0, count);
  }

  function getBoardPoints(variant, count) {
    if (variant === 'grid-3x4') return createGridPoints(3, 4, count, 28, 22, 22, 18);
    if (variant === 'circle') return interpolatePolygonPerimeterPoints(createRegularPolygonVertices(Math.max(6, count), 36, 50, 50, -90), count);
    if (variant === 'square') return interpolatePolygonPerimeterPoints(createRegularPolygonVertices(4, 36, 50, 50, -45), count);
    if (variant === 'pentagon') return interpolatePolygonPerimeterPoints(createRegularPolygonVertices(5, 36, 50, 50, -90), count);
    if (variant === 'hexagon') return interpolatePolygonPerimeterPoints(createRegularPolygonVertices(6, 36, 50, 50, -90), count);
    if (variant === 'heptagon') return interpolatePolygonPerimeterPoints(createRegularPolygonVertices(7, 36, 50, 50, -90), count);
    if (variant === 'octagon') return interpolatePolygonPerimeterPoints(createRegularPolygonVertices(8, 36, 50, 50, -90), count);
    return interpolatePolygonPerimeterPoints(createRegularPolygonVertices(5, 36, 50, 50, -90), count);
  }

  function createColorTraceQuestion(stage, questionIndex) {
    const connectionCount = Math.max(3, Math.min(10, Number(stage.connectionCount) || 3));
    const legendPool = COLOR_TRACE_LEGEND.slice(0, Math.min(COLOR_TRACE_LEGEND.length, connectionCount + 2));
    const activeLegend = shuffle(legendPool).slice(0, Math.max(connectionCount, Math.min(connectionCount + 2, legendPool.length)));
    const numberedLegend = activeLegend.map((item, index) => ({ ...item, order: index + 1 }));
    const sequenceItems = shuffle(numberedLegend).slice(0, connectionCount);
    const layoutPoints = getBoardPoints(stage.boardVariant, activeLegend.length);
    return {
      id: `${stage.id}-question-${questionIndex + 1}`,
      type: 'color-trace',
      prompt: '왼쪽 번호표를 보고 오른쪽 점을 같은 순서로 이어보세요.',
      legend: numberedLegend,
      sequenceNumbers: sequenceItems.map((item) => item.order),
      sequenceCodes: sequenceItems.map((item) => item.code),
      boardVariant: stage.boardVariant,
      nodes: numberedLegend.map((item, index) => ({
        id: `${stage.id}-node-${questionIndex + 1}-${item.code}`,
        code: item.code,
        label: item.label,
        color: item.color,
        x: layoutPoints[index] ? layoutPoints[index].x : 50,
        y: layoutPoints[index] ? layoutPoints[index].y : 50
      }))
    };
  }

  function createColorMemoryQuestion(stage, questionIndex) {
    const connectionCount = Math.max(3, Math.min(10, Number(stage.connectionCount) || 3));
    const extraCount = stage.mode === 'number-memory' ? 2 : 1;
    const legendPoolSize = Math.max(connectionCount + extraCount, Math.min(COLOR_TRACE_LEGEND.length, Number(stage.legendPoolSize) || (connectionCount + extraCount + 2)));
    const legendPool = shuffle(COLOR_TRACE_LEGEND).slice(0, legendPoolSize);
    const activeLegend = shuffle(legendPool).slice(0, Math.max(connectionCount + extraCount, connectionCount));
    const numberedLegend = activeLegend.map((item, index) => ({ ...item, order: index + 1 }));
    const sequenceItems = shuffle(numberedLegend).slice(0, connectionCount);
    const variantPool = Array.isArray(stage.boardVariants) && stage.boardVariants.length ? stage.boardVariants : [stage.boardVariant || 'circle'];
    const boardVariant = shuffle(variantPool)[0] || 'circle';
    const layoutPoints = getBoardPoints(boardVariant, activeLegend.length);
    const memoryMode = stage.mode === 'mixed'
      ? (questionIndex % 2 === 0 ? 'demo-follow' : 'number-memory')
      : stage.mode;
    return {
      id: `${stage.id}-question-${questionIndex + 1}`,
      type: 'color-memory',
      prompt: memoryMode === 'number-memory'
        ? '숫자를 잠깐 보고 기억한 뒤 같은 순서로 눌러보세요.'
        : '보여준 순서를 잘 본 뒤 같은 순서로 따라 눌러보세요.',
      memoryMode,
      rememberCue: stage.mode === 'mixed',
      memoryMs: Math.max(900, Number(stage.memoryMs) || 1800),
      legend: numberedLegend,
      sequenceNumbers: sequenceItems.map((item) => item.order),
      sequenceCodes: sequenceItems.map((item) => item.code),
      boardVariant,
      nodes: numberedLegend.map((item, index) => ({
        id: `${stage.id}-memory-node-${questionIndex + 1}-${item.code}`,
        code: item.code,
        label: item.label,
        color: item.color,
        order: item.order,
        x: layoutPoints[index] ? layoutPoints[index].x : 50,
        y: layoutPoints[index] ? layoutPoints[index].y : 50
      }))
    };
  }

  function createIconFindQuestion(stage, questionIndex) {
    const rows = Math.max(3, Math.min(10, Number(stage.rows) || 3));
    const cols = Math.max(3, Math.min(10, Number(stage.cols) || 3));
    const cellCount = rows * cols;
    const iconPool = shuffle(ICON_FIND_POOL);
    const targetIcon = iconPool[0] || ICON_FIND_POOL[0];
    const distractorKinds = Math.max(2, Math.min(iconPool.length - 1, Number(stage.distractorKinds) || 4));
    const distractors = iconPool.slice(1, distractorKinds + 1);
    const targetCount = Math.max(2, Math.min(cellCount - 1, Number(stage.targetCount) || 3));
    const cells = [];

    for (let index = 0; index < targetCount; index += 1) {
      cells.push({
        id: `${stage.id}-target-${questionIndex + 1}-${index + 1}`,
        symbol: targetIcon.symbol,
        label: targetIcon.label,
        isTarget: true
      });
    }

    for (let index = targetCount; index < cellCount; index += 1) {
      const distractor = distractors[index % distractors.length] || distractors[0] || ICON_FIND_POOL[1];
      cells.push({
        id: `${stage.id}-cell-${questionIndex + 1}-${index + 1}`,
        symbol: distractor.symbol,
        label: distractor.label,
        isTarget: false
      });
    }

    return {
      id: `${stage.id}-question-${questionIndex + 1}`,
      type: 'icon-find',
      prompt: `${targetIcon.symbol} 와 같은 아이콘을 모두 찾아보세요.`,
      rows,
      cols,
      targetCount,
      targetIcon,
      cells: shuffle(cells)
    };
  }

  function createFoodHealthFindQuestion(stage, questionIndex) {
    const rows = Math.max(2, Math.min(4, Number(stage.rows) || 2));
    const cols = Math.max(2, Math.min(5, Number(stage.cols) || 2));
    const cellCount = rows * cols;
    const targetGroups = Array.isArray(stage.targetGroups) && stage.targetGroups.length
      ? stage.targetGroups
      : ['fruit'];
    const targetCount = Math.max(1, Math.min(cellCount - 1, Number(stage.targetCount) || 1));
    const targetPool = FOOD_HEALTH_FIND_POOL.filter((food) => targetGroups.includes(food.group));
    const distractorPool = FOOD_HEALTH_FIND_POOL.filter((food) => !targetGroups.includes(food.group));
    const targets = shuffle(targetPool).slice(0, targetCount);
    const distractors = shuffle(distractorPool).slice(0, cellCount - targetCount);
    const cells = [...targets.map((food, index) => ({
      ...food,
      id: `${stage.id}-target-${questionIndex + 1}-${index + 1}`,
      isTarget: true
    })), ...distractors.map((food, index) => ({
      ...food,
      id: `${stage.id}-cell-${questionIndex + 1}-${index + 1}`,
      isTarget: false
    }))];
    return {
      id: `${stage.id}-question-${questionIndex + 1}`,
      type: 'food-health-find',
      mode: stage.mode,
      prompt: stage.prompt || '음식을 모두 찾아보세요.',
      guidance: stage.guidance || '그림을 잘 보고 목표 음식을 찾아요.',
      rows,
      cols,
      targetCount,
      cells: shuffle(cells)
    };
  }

  function createIconOddFindQuestion(stage, questionIndex) {
    const rows = Math.max(3, Math.min(14, Number(stage.rows) || 3));
    const cols = Math.max(3, Math.min(10, Number(stage.cols) || 3));
    const cellCount = rows * cols;
    const groupKinds = Array.isArray(stage.groupKinds) && stage.groupKinds.length ? stage.groupKinds : ['face-soft'];
    const eligibleGroups = ICON_ODD_GROUPS.filter((group) => groupKinds.includes(group.kind) && group.symbols.length >= 3);
    const groupPool = eligibleGroups.length ? eligibleGroups : ICON_ODD_GROUPS;
    const group = shuffle(groupPool)[0] || ICON_ODD_GROUPS[0];
    const symbolPool = shuffle(group.symbols);
    const baseIcon = symbolPool[0] || group.symbols[0];
    const oddIcon = symbolPool[1] || group.symbols[1] || group.symbols[0];
    const oddCount = Math.max(1, Math.min(2, Number(stage.oddCount) || 1));
    const cells = [];

    for (let index = 0; index < Math.max(1, cellCount - oddCount); index += 1) {
      cells.push({
        id: `${stage.id}-base-${questionIndex + 1}-${index + 1}`,
        symbol: baseIcon,
        label: `${group.id}-base`,
        isTarget: false
      });
    }

    for (let index = 0; index < oddCount; index += 1) {
      cells.push({
        id: `${stage.id}-odd-${questionIndex + 1}-${index + 1}`,
        symbol: oddIcon,
        label: `${group.id}-odd`,
        isTarget: true
      });
    }

    return {
      id: `${stage.id}-question-${questionIndex + 1}`,
      type: 'icon-odd-find',
      mode: 'icon-odd-find',
      prompt: `다른 아이콘 ${oddCount}개를 찾아보세요.`,
      rows,
      cols,
      targetCount: oddCount,
      majorityIcon: baseIcon,
      oddIcon,
      groupId: group.id,
      cells: shuffle(cells)
    };
  }

  function createDoorlockQuestion(stage, questionIndex) {
    const sequenceLength = Math.max(3, Math.min(6, Number(stage.sequenceLength) || 4));
    const digits = [];
    let previousDigit = '';
    for (let index = 0; index < sequenceLength; index += 1) {
      let digit = String(Math.floor(Math.random() * 10));
      if (digit === previousDigit) {
        digit = String((Number(digit) + 3 + questionIndex + index) % 10);
      }
      previousDigit = digit;
      digits.push(digit);
    }
    return {
      id: `${stage.id}-question-${questionIndex + 1}`,
      type: `doorlock-${stage.mode}`,
      mode: stage.mode,
      prompt: stage.mode === 'audio'
        ? '숫자 소리를 듣고 비밀번호를 입력하세요.'
        : '불빛이 들어온 순서를 기억하고 비밀번호를 입력하세요.',
      sequenceCodes: [...digits, '#'],
      digits
    };
  }

  function buildUniqueQuestions(stage, createQuestion, signatureBuilder) {
    const questions = [];
    const seen = new Set();
    const targetCount = Math.max(1, Number(stage.totalQuestions) || 1);
    let attempt = 0;
    while (questions.length < targetCount && attempt < targetCount * 24) {
      const question = createQuestion(stage, attempt);
      const signature = signatureBuilder(question);
      attempt += 1;
      if (seen.has(signature)) continue;
      seen.add(signature);
      questions.push(question);
    }
    while (questions.length < targetCount) {
      questions.push(createQuestion(stage, questions.length + attempt));
    }
    return questions;
  }

  function buildQuestions(stage) {
    if (IS_DOORLOCK) {
      return buildUniqueQuestions(
        stage,
        createDoorlockQuestion,
        (question) => question.sequenceCodes.join('')
      );
    }
    if (IS_SHAPE) {
      return Array.from({ length: stage.totalQuestions }, (_, index) => createShapeQuestion(stage, index));
    }
    if (IS_COLOR_MEMORY) {
      return buildUniqueQuestions(
        stage,
        createColorMemoryQuestion,
        (question) => [
          question.memoryMode,
          question.boardVariant,
          question.sequenceCodes.join(','),
          question.legend.map((item) => `${item.code}:${item.order}`).join('|')
        ].join('::')
      );
    }
    if (IS_ICON_FIND) {
      return buildUniqueQuestions(
        stage,
        createIconFindQuestion,
        (question) => `${question.targetIcon.symbol}::${question.cells.map((cell) => `${cell.symbol}${cell.isTarget ? '1' : '0'}`).join('|')}`
      );
    }
    if (IS_FOOD_HEALTH_FIND) {
      return buildUniqueQuestions(
        stage,
        createFoodHealthFindQuestion,
        (question) => `${question.mode}::${question.cells.map((cell) => `${cell.id}:${cell.isTarget ? '1' : '0'}`).join('|')}`
      );
    }
    if (IS_ICON_ODD_FIND) {
      return buildUniqueQuestions(
        stage,
        createIconOddFindQuestion,
        (question) => `${question.groupId}::${question.majorityIcon}::${question.oddIcon}::${question.targetCount}`
      );
    }
    return Array.from({ length: stage.totalQuestions }, (_, index) => createColorTraceQuestion(stage, index));
  }

  function setScreen(screenName) {
    ['stageSelectView', 'introView', 'lessonView', 'resultView'].forEach((key) => {
      if (refs[key]) refs[key].classList.toggle('is-active', key === screenName);
    });
    const showStageNav = screenName === 'lessonView' || screenName === 'resultView';
    refs.stageSelectButton.classList.toggle('shell-hidden', !showStageNav);
    refs.helpButton.classList.toggle('shell-hidden', screenName !== 'stageSelectView');
    if (refs.savePdfButton) {
      refs.savePdfButton.classList.toggle('shell-hidden', screenName !== 'resultView');
    }
  }

  function resetPageScrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll('.shell-main, .playlab-main, .playlab-screen').forEach((node) => {
      node.scrollTop = 0;
    });
  }

  function resetPageScrollToTopAfterRender() {
    resetPageScrollToTop();
    window.requestAnimationFrame(resetPageScrollToTop);
    window.setTimeout(resetPageScrollToTop, 80);
  }

  function updateStageLabel(text) {
    if (!text) {
      refs.stageLabel.textContent = '';
      refs.stageLabel.classList.add('shell-hidden');
      return;
    }
    refs.stageLabel.textContent = text;
    refs.stageLabel.classList.remove('shell-hidden');
  }

  function openConfirm(title, copy, onConfirm) {
    state.confirmAction = typeof onConfirm === 'function' ? onConfirm : null;
    refs.confirmTitle.textContent = title;
    refs.confirmCopy.textContent = copy;
    refs.confirmModal.classList.add('is-open');
  }

  function closeConfirm() {
    refs.confirmModal.classList.remove('is-open');
    state.confirmAction = null;
  }

  function openHelp() {
    refs.helpTitle.textContent = `${PAGE_CONFIG.title} 학습 안내`;
    if (refs.helpSummary) refs.helpSummary.textContent = PAGE_CONFIG.helpSummary || '';
    refs.helpHow.textContent = PAGE_CONFIG.helpHow || '';
    refs.helpBenefit.textContent = PAGE_CONFIG.helpBenefit || '';
    refs.helpModal.classList.add('is-open');
  }

  function closeHelp() {
    refs.helpModal.classList.remove('is-open');
  }

  function bindReliableNodePress(button, nodeCode, handler) {
    const trigger = (eventType) => {
      const now = Date.now();
      if (
        state.lastTraceInput.code === String(nodeCode)
        && now - state.lastTraceInput.time < 320
      ) {
        return;
      }
      state.lastTraceInput = {
        code: String(nodeCode),
        time: now
      };
      handler(nodeCode);
    };

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      trigger('pointerdown');
    });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      trigger('click');
    });
  }

  function bindReliableIconCellPress(button, cellId) {
    const normalizedCellId = String(cellId || '');
    const trigger = () => {
      const now = Date.now();
      if (
        state.lastIconInput.id === normalizedCellId
        && now - state.lastIconInput.time < 320
      ) {
        return;
      }
      state.lastIconInput = {
        id: normalizedCellId,
        time: now
      };
      handleIconCell(normalizedCellId);
    };

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      trigger();
    });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      trigger();
    });
  }

  function renderStageGrid() {
    if (REHAB_MENU_MODE && refs.levelGrid) {
      renderRehabLevelGrid();
      updateRehabMenuState();
      return;
    }
    refs.stageGrid.innerHTML = '';
    const stageGroupLabel = String(PAGE_CONFIG.stageGroupLabel || resolveStageGroupLabel()).trim();
    if (stageGroupLabel) {
      const stageGroupEnglish = String(PAGE_CONFIG.stageGroupEnglish || resolveStageGroupEnglish()).trim();
      const head = document.createElement('div');
      head.className = 'playlab-stage-head playlab-stage-label-block';
      const heading = document.createElement('h1');
      heading.textContent = stageGroupLabel;
      head.appendChild(heading);
      if (stageGroupEnglish) {
        const english = document.createElement('p');
        english.textContent = stageGroupEnglish;
        head.appendChild(english);
      }
      refs.stageGrid.appendChild(head);
    }
    STAGES.forEach((stage, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'playlab-stage-card';
      const subtitleMarkup = IS_COLOR_TRACE
        ? ''
        : `<p class="playlab-stage-subtitle">${stage.subtitle}</p>`;
      const metaText = IS_SHAPE
        ? `${stage.totalQuestions}문항 · ${stage.optionCount}개 보기`
        : IS_DOORLOCK
          ? `${stage.totalQuestions}문항 · 4자리 + #`
        : IS_COLOR_MEMORY
          ? `${stage.totalQuestions}문항 · ${stage.connectionCount}개 순서`
          : IS_ICON_GAME
            ? `${stage.rows}x${stage.cols} 보드 · ${stage.totalQuestions}문항`
          : `${stage.totalQuestions}문항 · ${stage.connectionCount}색 연결`;
      button.innerHTML = `
        <span class="playlab-stage-badge">${stage.badge}</span>
        <div>
          <h3 class="playlab-stage-title">${stage.title}</h3>
          ${subtitleMarkup}
        </div>
        <p class="playlab-stage-meta">${metaText}</p>
      `;
      button.querySelector('.playlab-stage-badge').style.background = THEME.accentStrong;
      button.addEventListener('click', () => {
        state.selectedStageIndex = index;
        startStage();
      });
      refs.stageGrid.appendChild(button);
    });
  }

  function renderRehabLevelGrid() {
    if (!refs.levelGrid) return;
    const age = getRehabAge(state.selectedAgeId);
    const levels = getRehabLevels();
    refs.levelGrid.innerHTML = levels.map((level) => {
      const disabled = age ? '' : ' disabled';
      const selected = state.selectedLevelId === level.id ? ' is-selected' : '';
      return `
        <button type="button" class="traffic-level-card${selected}" data-level-id="${level.id}" aria-pressed="${state.selectedLevelId === level.id ? 'true' : 'false'}"${disabled}>
          <span>LV${level.index}</span>
          <h2>${level.label}</h2>
          <p>${level.desc}</p>
        </button>
      `;
    }).join('');
  }

  function updateRehabMenuState() {
    const age = getRehabAge(state.selectedAgeId);
    const level = getSelectedRehabLevel();
    if (refs.agePanel) {
      refs.agePanel.querySelectorAll('[data-age]').forEach((button) => {
        button.classList.toggle('is-selected', button.getAttribute('data-age') === state.selectedAgeId);
      });
    }
    if (refs.levelGrid) {
      refs.levelGrid.querySelectorAll('[data-level-id]').forEach((button) => {
        const selected = button.getAttribute('data-level-id') === state.selectedLevelId;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        button.disabled = !age;
      });
    }
    if (refs.startButton) {
      refs.startButton.disabled = !(age && level);
      refs.startButton.textContent = age && level
        ? `${age.label} · ${level.label} 시작`
        : '연령과 레벨을 선택해 주세요';
    }
  }

  function startRehabSelectedStage() {
    const stage = buildRehabStageFromSelection(state.selectedAgeId, state.selectedLevelId);
    if (!stage) return;
    state.selectedRehabStage = stage;
    state.selectedStageIndex = null;
    startStage();
  }

  function resolveStageGroupLabel() {
    if (IS_FOOD_HEALTH_FIND) return '음식 선택 단계 학습';
    if (IS_ICON_GAME || IS_COLOR_TRACE || IS_COLOR_MEMORY) return '시각 놀이 단계 학습';
    if (IS_DOORLOCK) return '인지 놀이 단계 학습';
    return '놀이 단계 학습';
  }

  function resolveStageGroupEnglish() {
    if (IS_FOOD_HEALTH_FIND) return 'Food Choice Stage Learning';
    if (IS_ICON_GAME || IS_COLOR_TRACE || IS_COLOR_MEMORY) return 'Visual Play Stage Learning';
    if (IS_DOORLOCK) return 'Cognitive Play Stage Learning';
    return 'Play Stage Learning';
  }

  function renderIntro() {
    if (REHAB_MENU_MODE && refs.levelGrid) {
      setScreen('stageSelectView');
      updateStageLabel('');
      return;
    }
    const stage = getSelectedStage();
    if (!stage) {
      setScreen('stageSelectView');
      updateStageLabel('');
      return;
    }
    refs.introBadge.textContent = PAGE_CONFIG.labLabel || '플레이랩';
    refs.introBadge.style.background = THEME.eyebrowBg;
    refs.introBadge.style.color = THEME.eyebrowText;
    refs.introTitle.textContent = PAGE_CONFIG.title || '';
    refs.introSubtitle.textContent = stage.subtitle;
    refs.introStage.textContent = `${stage.badge}단계 · ${stage.title}`;
    updateStageLabel(`${stage.badge}단계`);
    setScreen('introView');
    if (IS_ICON_FIND || IS_FOOD_HEALTH_FIND) resetPageScrollToTop();
  }

  function startStage() {
    const stage = getSelectedStage();
    if (!stage) return;
    clearPreviewTimers();
    stopHudTimer();
    stopDoorAudio();
    clearDoorKeyTimer();
    state.run = {
      sessionId: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `standalone-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      stageId: stage.id,
      stageTitle: stage.title,
      status: 'playing',
      startedAtMs: Date.now(),
      elapsedMs: 0,
      questionIndex: 0,
      questions: buildQuestions(stage),
      correctCount: 0,
      locked: false,
      selectedOptionId: '',
      tracePath: [],
      traceStatus: '',
      previewPath: [],
      previewStarted: false,
      showMemoryNumbers: false,
      memoryCueVisible: false,
      memoryRevealIndex: -1,
      selectedTargetIds: [],
      doorInput: [],
      doorStatus: '',
      doorMessage: '',
      doorPreviewIndex: -1,
      activeDoorKey: '',
      lastWrongDoorKey: '',
      doorImageIndex: 1,
      remainingLives: Math.max(1, Number(stage.lives) || 5),
      lastWrongCellId: '',
      revealedFoodCellIds: [],
      endedByFailure: false,
      totalWrongAttempts: 0,
      totalReplayCount: 0,
      visualReplayCount: 0,
      audioReplayCount: 0,
      correctOnFirstTryCount: 0,
      questionLogs: [],
      currentQuestionStats: null
    };
    state.lastWrongTraceCode = '';
    beginQuestionTracking(state.run);
    renderLesson();
    if (IS_ICON_FIND || IS_FOOD_HEALTH_FIND) resetPageScrollToTopAfterRender();
  }

  function goToStageSelect() {
    clearPreviewTimers();
    stopHudTimer();
    stopDoorAudio();
    clearDoorKeyTimer();
    stopFeedbackAudio();
    stopSelectAudio();
    clearFeedback();
    state.run = null;
    state.selectedRehabStage = null;
    state.lastWrongTraceCode = '';
    renderStageGrid();
    updateStageLabel('');
    setScreen('stageSelectView');
    if (IS_ICON_FIND || IS_FOOD_HEALTH_FIND) resetPageScrollToTopAfterRender();
  }

  function completeStage() {
    renderResult();
  }

  function saveFoodHealthFindSession(stage, run, accuracy) {
    if (!IS_FOOD_HEALTH_FIND || !stage || !run || run.harnessSaveStarted) return;
    const harness = window.HahaLabLearningHarness;
    if (!harness || typeof harness.recordSession !== 'function') return;
    run.harnessSaveStarted = true;
    const endedAtMs = Date.now();
    const questions = Array.isArray(run.questions) ? run.questions : [];
    try {
      harness.recordSession({
        labKind: 'playlab',
        reportScope: 'playlab',
        curriculumKey: 'playlab-healthy-food-find',
        learningId: 'playlab-healthy-food-find',
        learningTitle: PAGE_CONFIG.title || '몸에 맞는 음식 찾기',
        labTitle: PAGE_CONFIG.title || '몸에 맞는 음식 찾기',
        title: PAGE_CONFIG.title || '몸에 맞는 음식 찾기',
        stageKey: stage.id,
        stageTitle: stage.title,
        totalQuestions: questions.length,
        correctCount: Number(run.correctCount || 0),
        wrongCount: Number(run.totalWrongAttempts || 0),
        accuracy: accuracy,
        score: accuracy,
        durationSeconds: Math.max(0, Math.round(Number(run.elapsedMs || 0) / 1000)),
        startedAtMs: run.startedAtMs,
        endedAtMs,
        saveToClientReport: true,
        details: {
          learning_id: 'playlab-healthy-food-find',
          learning_title: PAGE_CONFIG.title || '몸에 맞는 음식 찾기',
          targetMode: stage.mode,
          requiredCount: Number(stage.targetCount || 0),
          rounds: questions.map((question) => ({
            questionId: question.id,
            targetMode: question.mode,
            requiredCount: question.targetCount,
            correctFoodIds: question.cells.filter((cell) => cell.isTarget).map((cell) => cell.id),
            selectedFoodIds: (run.questionLogs || []).find((log) => log.questionIndex === questions.indexOf(question))?.selectedTargetIds || []
          })),
          incorrectSelections: Number(run.totalWrongAttempts || 0)
        }
      });
    } catch (_error) {
      run.harnessSaveStarted = false;
    }
  }

  function makeFeedbackClass(option, selectedOptionId, locked) {
    if (!locked) return '';
    if (option.correct) return 'is-correct';
    if (selectedOptionId === option.id) return 'is-wrong';
    return '';
  }

  function renderShapeLesson(stage, question, run) {
    const layout = document.createElement('div');
    layout.className = 'playlab-lesson-grid playlab-shape-grid';

    const left = document.createElement('article');
    left.className = 'playlab-panel-card';
    left.innerHTML = `
      <span class="playlab-panel-eyebrow">TARGET FIGURE</span>
      <div class="playlab-shape-target"></div>
    `;
    left.querySelector('.playlab-panel-eyebrow').style.background = THEME.accentSoft;
    left.querySelector('.playlab-panel-eyebrow').style.color = THEME.accentStrong;
    left.querySelector('.playlab-shape-target').appendChild(renderShapeComposite(question.correctPattern));

    const right = document.createElement('article');
    right.className = 'playlab-panel-card';
    const grid = document.createElement('div');
    grid.className = `playlab-options-grid ${question.options.length === 4 ? 'is-four-options' : ''}`;
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `playlab-option-card ${makeFeedbackClass(option, run.selectedOptionId, run.locked)}`;
      button.innerHTML = `
        <div class="playlab-option-head">
          <span class="playlab-option-index">보기 ${index + 1}</span>
        </div>
      `;
      button.appendChild(renderShapeOption(option.pieces));
      button.disabled = !!run.locked;
      button.addEventListener('click', () => handleShapeChoice(option.id));
      grid.appendChild(button);
    });
    right.appendChild(grid);

    layout.appendChild(left);
    layout.appendChild(right);
    return layout;
  }

  function getTraceNodeShape(boardVariant) {
    if (boardVariant === 'grid-3x4') return '20%';
    return '999px';
  }

  function renderTraceLesson(stage, question, run) {
    const layout = document.createElement('div');
    layout.className = 'playlab-lesson-grid playlab-trace-grid';

    const left = document.createElement('article');
    left.className = 'playlab-panel-card playlab-trace-info-card';
    left.innerHTML = `
      <div class="playlab-trace-legend-grid"></div>
      <div class="playlab-trace-sequence-wrap">
        <div class="playlab-trace-sequence"></div>
      </div>
    `;
    const legendGrid = left.querySelector('.playlab-trace-legend-grid');
    question.legend.forEach((item) => {
      const node = document.createElement('div');
      node.className = 'playlab-trace-legend-item';
      node.innerHTML = `
        <span class="playlab-trace-legend-order">${item.order}</span>
        <span class="playlab-card-copy">${item.label}</span>
      `;
      node.querySelector('.playlab-trace-legend-order').style.background = item.color;
      legendGrid.appendChild(node);
    });
    const sequence = left.querySelector('.playlab-trace-sequence');
    sequence.innerHTML = '';
    question.sequenceNumbers.forEach((order, index) => {
      if (index > 0) {
        const separator = document.createElement('span');
        separator.className = 'playlab-trace-sequence-separator';
        separator.textContent = '-';
        sequence.appendChild(separator);
      }
      const matchedLegend = question.legend.find((item) => item.order === order);
      const item = document.createElement('span');
      item.className = `playlab-trace-sequence-item ${run.tracePath.length > index ? 'is-complete' : ''}`;
      item.textContent = String(order);
      if (matchedLegend) item.style.setProperty('--trace-sequence-color', matchedLegend.color);
      sequence.appendChild(item);
    });

    const right = document.createElement('article');
    right.className = 'playlab-panel-card playlab-trace-board-card';
    right.innerHTML = `
      <div class="playlab-board-shell">
        <div class="playlab-board">
          <svg class="playlab-board-lines" viewBox="0 0 100 100" aria-hidden="true"></svg>
        </div>
      </div>
    `;
    const lineSvg = right.querySelector('.playlab-board-lines');
    const board = right.querySelector('.playlab-board');
    const nodeMap = {};
    question.nodes.forEach((node) => {
      nodeMap[node.code] = node;
    });
    const tracePoints = run.tracePath.map((code) => nodeMap[code]).filter(Boolean);
    tracePoints.forEach((node, index) => {
      const nextNode = tracePoints[index + 1];
      if (!nextNode) return;
      const line = createSvgElement('line');
      line.setAttribute('class', 'playlab-trace-line');
      line.setAttribute('pathLength', '100');
      line.setAttribute('x1', String(node.x));
      line.setAttribute('y1', String(node.y));
      line.setAttribute('x2', String(nextNode.x));
      line.setAttribute('y2', String(nextNode.y));
      line.setAttribute('stroke', node.color);
      line.setAttribute('stroke-width', '1.2');
      line.setAttribute('stroke-linecap', 'round');
      lineSvg.appendChild(line);
    });
    question.nodes.forEach((node) => {
      const button = document.createElement('button');
      button.type = 'button';
      const isDone = run.tracePath.includes(node.code);
      const isActive = run.tracePath[run.tracePath.length - 1] === node.code;
      const isWrong = state.lastWrongTraceCode === node.code;
      const shouldBounce = isActive && (run.traceStatus === 'progress' || run.traceStatus === 'correct');
      button.className = `playlab-node-btn ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''} ${isWrong ? 'is-wrong' : ''}`;
      button.style.left = `${node.x}%`;
      button.style.top = `${node.y}%`;
      const core = document.createElement('div');
      core.className = `playlab-node-core ${shouldBounce ? 'is-hit' : ''}`;
      core.style.background = node.color;
      core.style.borderRadius = getTraceNodeShape(question.boardVariant);
      button.appendChild(core);
      button.disabled = !!run.locked;
      bindReliableNodePress(button, node.code, handleTraceNode);
      board.appendChild(button);
    });

    layout.appendChild(left);
    layout.appendChild(right);
    return layout;
  }

  function startMemoryQuestionPreview(stage, question, run) {
    clearPreviewTimers();
    run.previewStarted = true;
    run.locked = true;
    run.tracePath = [];
    run.previewPath = [];
    run.traceStatus = '';
    run.showMemoryNumbers = question.memoryMode === 'number-memory';
    run.memoryCueVisible = true;
    run.memoryRevealIndex = -1;
    run.memoryCueText = question.memoryMode === 'number-memory'
      ? '숫자를 순서대로 기억해보세요!'
      : '클릭한걸 기억하고<br>똑같이 클릭해보세요!';
    state.run = run;
    renderLesson();

    if (question.memoryMode === 'demo-follow') {
      const leadDelay = question.rememberCue ? 1320 : 1180;
      const stepDelay = Math.max(760, Math.round((question.memoryMs / Math.max(1, question.sequenceCodes.length)) + 260));
      const finalHold = Math.max(720, Math.round(stepDelay * 0.95));
      schedulePreview(() => {
        run.memoryCueVisible = false;
        run.traceStatus = 'progress';
        state.run = run;
        renderLesson();
        question.sequenceCodes.forEach((code, index) => {
          schedulePreview(() => {
            playSelectSound();
            run.previewPath = question.sequenceCodes.slice(0, index + 1);
            state.run = run;
            renderLesson();
          }, index * stepDelay);
        });
        schedulePreview(() => {
          run.previewPath = [];
          run.traceStatus = '';
          run.locked = false;
          state.run = run;
          renderLesson();
        }, (question.sequenceCodes.length * stepDelay) + finalHold);
      }, leadDelay);
      return;
    }

    const cueDelay = question.rememberCue ? 1500 : 1320;
    const stepDelay = Math.max(1100, Math.round((question.memoryMs / Math.max(1, question.sequenceCodes.length)) + 420));
    question.sequenceCodes.forEach((code, index) => {
      schedulePreview(() => {
        run.memoryCueVisible = false;
        playSelectSound();
        run.showMemoryNumbers = true;
        run.memoryRevealIndex = index;
        state.run = run;
        renderLesson();
      }, cueDelay + (index * stepDelay));
    });
    schedulePreview(() => {
      run.showMemoryNumbers = false;
      run.memoryRevealIndex = -1;
      run.locked = false;
      state.run = run;
      renderLesson();
    }, cueDelay + (question.sequenceCodes.length * stepDelay) + Math.max(980, Math.round(stepDelay * 1.15)));
  }

  function replayMemoryQuestion() {
    const run = state.run;
    if (!IS_COLOR_MEMORY || !run || run.locked) return;
    const question = run.questions[run.questionIndex];
    if (!question || !Array.isArray(question.sequenceCodes) || !question.sequenceCodes.length) return;

    clearPreviewTimers();
    recordQuestionReplay(run, 'visual');
    run.locked = true;
    run.previewPath = [];
    run.traceStatus = '';
    run.memoryCueVisible = true;
    run.memoryCueText = question.memoryMode === 'number-memory'
      ? '숫자를 다시 보여줄게요!'
      : '순서를 다시 보여줄게요!';
    run.showMemoryNumbers = question.memoryMode === 'number-memory';
    run.memoryRevealIndex = -1;
    state.run = run;
    renderLesson();

    if (question.memoryMode === 'demo-follow') {
      const leadDelay = 620;
      const stepDelay = Math.max(760, Math.round((question.memoryMs / Math.max(1, question.sequenceCodes.length)) + 260));
      const finalHold = Math.max(720, Math.round(stepDelay * 0.95));
      schedulePreview(() => {
        run.memoryCueVisible = false;
        run.traceStatus = 'progress';
        state.run = run;
        renderLesson();
        question.sequenceCodes.forEach((code, index) => {
          schedulePreview(() => {
            playSelectSound();
            run.previewPath = question.sequenceCodes.slice(0, index + 1);
            state.run = run;
            renderLesson();
          }, index * stepDelay);
        });
        schedulePreview(() => {
          run.previewPath = [];
          run.traceStatus = '';
          run.locked = false;
          state.run = run;
          renderLesson();
        }, (question.sequenceCodes.length * stepDelay) + finalHold);
      }, leadDelay);
      return;
    }

    const cueDelay = 720;
    const stepDelay = Math.max(1100, Math.round((question.memoryMs / Math.max(1, question.sequenceCodes.length)) + 420));
    question.sequenceCodes.forEach((_code, index) => {
      schedulePreview(() => {
        run.memoryCueVisible = false;
        playSelectSound();
        run.showMemoryNumbers = true;
        run.memoryRevealIndex = index;
        state.run = run;
        renderLesson();
      }, cueDelay + (index * stepDelay));
    });
    schedulePreview(() => {
      run.showMemoryNumbers = false;
      run.memoryRevealIndex = -1;
      run.locked = false;
      state.run = run;
      renderLesson();
    }, cueDelay + (question.sequenceCodes.length * stepDelay) + Math.max(980, Math.round(stepDelay * 1.15)));
  }

  function renderMemoryLesson(stage, question, run) {
    const layout = document.createElement('div');
    layout.className = 'playlab-lesson-grid playlab-trace-grid playlab-memory-grid';
    const replayButtonMarkup = `
      <button type="button" class="playlab-secondary-btn playlab-memory-replay-btn" ${run.locked || !run.previewStarted ? 'disabled' : ''}>문제 다시 보기</button>
    `;
    const replayPlacement = String(PAGE_CONFIG.memoryReplayButtonPlacement || '').trim();

    const left = document.createElement('article');
    left.className = 'playlab-panel-card playlab-trace-info-card playlab-memory-info-card';
    left.innerHTML = `
      <div class="playlab-trace-legend-grid playlab-memory-legend-grid"></div>
      <div class="playlab-trace-sequence-wrap playlab-memory-sequence-wrap">
        ${run.memoryCueVisible ? `<div class="playlab-memory-cue">${run.memoryCueText || '기억하세요!'}</div>` : ''}
        <div class="playlab-trace-sequence playlab-memory-sequence"></div>
      </div>
      ${replayPlacement === 'info' ? `<div class="playlab-memory-replay-row">${replayButtonMarkup}</div>` : ''}
    `;
    const legendGrid = left.querySelector('.playlab-memory-legend-grid');
    question.legend.forEach((item) => {
      const node = document.createElement('div');
      node.className = 'playlab-trace-legend-item';
      node.innerHTML = `
        <span class="playlab-trace-legend-order">${item.order}</span>
        <span class="playlab-card-copy">${item.label}</span>
      `;
      node.querySelector('.playlab-trace-legend-order').style.background = item.color;
      legendGrid.appendChild(node);
    });
    const sequence = left.querySelector('.playlab-memory-sequence');
    const progressCount = question.memoryMode === 'number-memory'
      ? run.tracePath.length
      : (run.previewPath.length > 0 ? run.previewPath.length : run.tracePath.length);
    question.sequenceNumbers.forEach((order, index) => {
      if (index > 0) {
        const separator = document.createElement('span');
        separator.className = 'playlab-trace-sequence-separator';
        separator.textContent = '-';
        sequence.appendChild(separator);
      }
      const matchedLegend = question.legend.find((item) => item.order === order);
      const item = document.createElement('span');
      item.className = `playlab-trace-sequence-item ${progressCount > index ? 'is-complete' : ''} ${question.memoryMode === 'demo-follow' ? 'is-ghost' : 'is-question'}`;
      if (matchedLegend) item.style.setProperty('--trace-sequence-color', matchedLegend.color);
      if (question.memoryMode === 'number-memory') {
        item.textContent = (run.showMemoryNumbers || run.tracePath.length > index) ? String(order) : '?';
      } else {
        item.textContent = '';
      }
      sequence.appendChild(item);
    });

    const right = document.createElement('article');
    right.className = 'playlab-panel-card playlab-trace-board-card playlab-memory-board-card';
    let numberOverlayMarkup = '';
    if (question.memoryMode === 'number-memory' && run.showMemoryNumbers && run.memoryRevealIndex >= 0) {
      const activeOrder = question.sequenceNumbers[run.memoryRevealIndex];
      const activeLegend = question.legend.find((item) => item.order === activeOrder);
      numberOverlayMarkup = `
        <div class="playlab-memory-board-overlay is-number-preview">
          <div class="playlab-memory-number-card" style="--memory-color:${activeLegend ? activeLegend.color : '#3b82f6'}">
            <span class="playlab-memory-number-value">${activeOrder}</span>
            <span class="playlab-memory-number-label">${activeLegend ? activeLegend.label : ''}</span>
          </div>
        </div>
      `;
    }
    right.innerHTML = `
      <div class="playlab-board-shell">
        ${replayPlacement === 'info' ? '' : replayButtonMarkup}
        ${run.memoryCueVisible ? `<div class="playlab-memory-board-overlay"><div class="playlab-memory-board-message">${run.memoryCueText || '기억하세요!'}</div></div>` : ''}
        ${numberOverlayMarkup}
        <div class="playlab-board">
          <svg class="playlab-board-lines" viewBox="0 0 100 100" aria-hidden="true"></svg>
        </div>
      </div>
    `;

    const replayButton = replayPlacement === 'info'
      ? left.querySelector('.playlab-memory-replay-btn')
      : right.querySelector('.playlab-memory-replay-btn');
    if (replayButton) {
      replayButton.addEventListener('click', replayMemoryQuestion);
    }
    const lineSvg = right.querySelector('.playlab-board-lines');
    const board = right.querySelector('.playlab-board');
    const nodeMap = {};
    question.nodes.forEach((node) => {
      nodeMap[node.code] = node;
    });
    const visiblePath = question.memoryMode === 'number-memory'
      ? run.tracePath
      : (run.previewPath.length ? run.previewPath : run.tracePath);
    const tracePoints = visiblePath.map((code) => nodeMap[code]).filter(Boolean);
    tracePoints.forEach((node, index) => {
      const nextNode = tracePoints[index + 1];
      if (!nextNode) return;
      const line = createSvgElement('line');
      line.setAttribute('class', 'playlab-trace-line');
      line.setAttribute('pathLength', '100');
      line.setAttribute('x1', String(node.x));
      line.setAttribute('y1', String(node.y));
      line.setAttribute('x2', String(nextNode.x));
      line.setAttribute('y2', String(nextNode.y));
      line.setAttribute('stroke', node.color);
      line.setAttribute('stroke-width', '1.2');
      line.setAttribute('stroke-linecap', 'round');
      lineSvg.appendChild(line);
    });

    question.nodes.forEach((node) => {
      const button = document.createElement('button');
      button.type = 'button';
      const isDone = visiblePath.includes(node.code);
      const isActive = visiblePath[visiblePath.length - 1] === node.code;
      const isWrong = state.lastWrongTraceCode === node.code;
      const shouldBounce = isActive && (run.traceStatus === 'progress' || run.traceStatus === 'correct' || run.previewPath.length > 0);
      const showNodeOrder = question.memoryMode === 'number-memory' && run.showMemoryNumbers && visiblePath.includes(node.code);
      button.className = `playlab-node-btn ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''} ${isWrong ? 'is-wrong' : ''} ${showNodeOrder ? 'has-order' : ''}`;
      button.style.left = `${node.x}%`;
      button.style.top = `${node.y}%`;
      const core = document.createElement('div');
      core.className = `playlab-node-core ${shouldBounce ? 'is-hit' : ''}`;
      core.style.background = node.color;
      core.style.borderRadius = getTraceNodeShape(question.boardVariant);
      button.appendChild(core);
      if (showNodeOrder) {
        const order = document.createElement('span');
        order.className = 'playlab-node-order';
        order.textContent = String(node.order);
        button.appendChild(order);
      }
      button.disabled = !!run.locked;
      bindReliableNodePress(button, node.code, handleTraceNode);
      board.appendChild(button);
    });

    layout.appendChild(left);
    layout.appendChild(right);
    return layout;
  }

  function renderIconFindLesson(stage, question, run) {
    const layout = document.createElement('div');
    layout.className = 'playlab-lesson-grid playlab-icon-find-grid';

    const panel = document.createElement('article');
    panel.className = 'playlab-panel-card playlab-icon-find-card';
    const totalLives = Math.max(1, Number(stage.lives) || 5);
    const isFoodMode = question.type === 'food-health-find';
    const isOddMode = question.mode === 'icon-odd-find';
    const targetPanelMarkup = isFoodMode
      ? `
        <div class="playlab-icon-target-panel is-instruction playlab-food-target-panel">
          <div class="playlab-icon-instruction-mark">${['fastfood', 'sweet', 'sometimes'].includes(question.mode) ? '🍪' : '🥦'}</div>
          <div class="playlab-icon-target-copy">
            <p class="playlab-icon-target-title">${question.prompt}</p>
            <p class="playlab-icon-target-meta">${question.guidance} · ${stage.badge}단계 · ${run.questionIndex + 1}/${run.questions.length}문항</p>
          </div>
        </div>
      `
      : isOddMode
      ? `
        <div class="playlab-icon-target-panel is-instruction">
          <div class="playlab-icon-instruction-mark">!</div>
          <div class="playlab-icon-target-copy">
            <p class="playlab-icon-target-title">다른 아이콘 ${question.targetCount}개를 찾으세요</p>
            <p class="playlab-icon-target-meta">${stage.badge}단계 · ${run.questionIndex + 1}/${run.questions.length}문항 · ${question.rows}x${question.cols} 보드</p>
          </div>
        </div>
      `
      : `
        <div class="playlab-icon-target-panel">
          <div class="playlab-icon-target-symbol">${question.targetIcon.symbol}</div>
          <div class="playlab-icon-target-copy">
            <p class="playlab-icon-target-title">${question.targetIcon.symbol} 모두 터치해주세요</p>
            <p class="playlab-icon-target-meta">${stage.badge}단계 · ${run.questionIndex + 1}/${run.questions.length}문항 · ${question.rows}x${question.cols} 보드</p>
          </div>
        </div>
      `;
    const progressLabel = isFoodMode ? '찾은 음식' : isOddMode ? '찾은 다른 아이콘' : '찾은 개수';

    panel.innerHTML = `
      <div class="playlab-icon-hud">
        <div class="playlab-icon-stars" aria-label="문항 진행도">
          ${Array.from({ length: run.questions.length }, (_, index) => `
            <span class="playlab-icon-star ${index < run.correctCount ? 'is-filled' : index === run.questionIndex ? 'is-current' : ''}">★</span>
          `).join('')}
        </div>
        <div id="playlabHudTimer" class="playlab-icon-timer">${formatDuration(run.elapsedMs || 0)}</div>
        <div class="playlab-icon-lives" aria-label="남은 하트">
          ${Array.from({ length: totalLives }, (_, index) => `
            <span class="playlab-icon-heart ${index < run.remainingLives ? 'is-on' : 'is-off'}">♥</span>
          `).join('')}
        </div>
      </div>
      ${targetPanelMarkup}
      <div class="playlab-icon-progress-copy">
        ${progressLabel} <strong>${run.selectedTargetIds.length}/${question.targetCount}</strong>
      </div>
      <div class="playlab-icon-board" style="--icon-find-cols:${question.cols};">
        ${question.cells.map((cell) => {
          const isFound = run.selectedTargetIds.includes(cell.id);
          const isWrong = run.lastWrongCellId === cell.id;
          const showFoodLabel = isFoodMode && (isFound || isWrong || (run.revealedFoodCellIds || []).includes(cell.id));
          return `
            <button
              type="button"
              class="playlab-icon-cell ${isFound ? 'is-found' : ''} ${isWrong ? 'is-wrong' : ''} ${showFoodLabel ? 'has-food-label' : ''}"
              data-icon-cell-id="${cell.id}"
              aria-label="${cell.label}"
            >
              ${isFoodMode
                ? `<img class="playlab-food-cell-image" src="${cell.imageSrc}" alt="${cell.label}"><span class="playlab-food-cell-label" aria-hidden="true">${cell.label}</span>`
                : `<span class="playlab-icon-cell-symbol">${cell.symbol}</span>`}
              ${isFound ? '<span class="playlab-icon-cell-check">✓</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;

    panel.querySelectorAll('[data-icon-cell-id]').forEach((button) => {
      button.disabled = !!run.locked;
      bindReliableIconCellPress(button, button.getAttribute('data-icon-cell-id') || '');
    });

    layout.appendChild(panel);
    return layout;
  }

  function getDoorAudioSrc(key) {
    return key === '#'
      ? FEEDBACK_SOUNDS.doorHash
      : `${FEEDBACK_SOUNDS.doorDigit}${key}.mp3`;
  }

  function waitMs(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function playDoorAudioFile(src, token) {
    return new Promise((resolve) => {
      if (token !== state.doorAudioToken) {
        resolve();
        return;
      }
      const audio = new Audio(src);
      let settled = false;
      let fallbackTimer = null;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        if (state.doorAudio === audio) state.doorAudio = null;
        resolve();
      };
      state.doorAudio = audio;
      audio.preload = 'auto';
      audio.addEventListener('loadedmetadata', () => {
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        const durationMs = Number.isFinite(audio.duration) && audio.duration > 0
          ? Math.ceil(audio.duration * 1000) + 520
          : 2200;
        fallbackTimer = window.setTimeout(finish, Math.min(8000, Math.max(1800, durationMs)));
      }, { once: true });
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
      fallbackTimer = window.setTimeout(finish, 8000);
      audio.play().catch(finish);
    });
  }

  async function playDoorAudioSequence(question, run) {
    const token = state.doorAudioToken + 1;
    state.doorAudioToken = token;
    run.previewStarted = true;
    run.locked = true;
    run.doorInput = [];
    run.activeDoorKey = '';
    run.lastWrongDoorKey = '';
    run.doorPreviewIndex = -1;
    run.doorStatus = 'audio';
    run.doorMessage = '숫자 소리를 잘 듣고 기억해요.';
    state.run = run;
    renderLesson();
    await waitMs(DOORLOCK_AUDIO_START_DELAY_MS);
    for (let index = 0; index < question.sequenceCodes.length; index += 1) {
      if (token !== state.doorAudioToken || state.run !== run) return;
      run.doorPreviewIndex = index;
      state.run = run;
      renderLesson();
      await playDoorAudioFile(getDoorAudioSrc(question.sequenceCodes[index]), token);
      await waitMs(DOORLOCK_AUDIO_STEP_GAP_MS);
    }
    if (token !== state.doorAudioToken || state.run !== run) return;
    run.locked = false;
    run.doorPreviewIndex = -1;
    run.doorStatus = 'input';
    run.doorMessage = `들은 순서대로 ${question.sequenceCodes.length - 1}자리와 #을 눌러요.`;
    state.run = run;
    renderLesson();
  }

  async function playDoorVisualSequence(question, run) {
    const token = state.doorAudioToken + 1;
    state.doorAudioToken = token;
    run.previewStarted = true;
    run.locked = true;
    run.doorInput = [];
    run.activeDoorKey = '';
    run.lastWrongDoorKey = '';
    run.doorPreviewIndex = -1;
    run.doorStatus = 'preview';
    run.doorMessage = '불빛이 켜지는 순서를 눈으로 따라가요.';
    state.run = run;
    renderLesson();

    await waitMs(DOORLOCK_VISUAL_START_DELAY_MS);
    for (let index = 0; index < question.sequenceCodes.length; index += 1) {
      if (token !== state.doorAudioToken || state.run !== run) return;
      const code = question.sequenceCodes[index];
      run.activeDoorKey = code;
      run.doorPreviewIndex = index;
      state.run = run;
      renderLesson();
      await playDoorVisualPreviewSound(code, token);
      if (token !== state.doorAudioToken || state.run !== run) return;
      run.activeDoorKey = '';
      state.run = run;
      renderLesson();
      await waitMs(DOORLOCK_VISUAL_STEP_GAP_MS);
    }
    if (token !== state.doorAudioToken || state.run !== run) return;
    run.locked = false;
    run.activeDoorKey = '';
    run.doorPreviewIndex = -1;
    run.doorStatus = 'input';
    run.doorMessage = '이제 비밀번호를 눌러 도어락을 열어보세요.';
    state.run = run;
    renderLesson();
  }

  function startDoorlockPreview(stage, question, run) {
    clearPreviewTimers();
    stopDoorAudio();
    clearDoorKeyTimer();
    if (stage.mode === 'audio') {
      playDoorAudioSequence(question, run);
      return;
    }
    playDoorVisualSequence(question, run);
  }

  function renderDoorlockLesson(stage, question, run) {
    const layout = document.createElement('div');
    layout.className = 'playlab-lesson-grid playlab-doorlock-grid';
    const inputLength = Array.isArray(run.doorInput) ? run.doorInput.length : 0;
    const isAudioMode = stage.mode === 'audio';
    const replayLabel = isAudioMode ? '소리 다시 듣기' : '불빛 다시 보기';
    const statusText = run.doorStatus === 'unlocked'
      ? '문이 열렸어요'
      : run.doorStatus === 'wrong'
        ? '다시 확인해요'
        : run.locked
          ? (isAudioMode ? '듣는 중' : '보는 중')
          : '입력하세요';
    const doorImageIndex = Math.max(1, Math.min(4, Number(run.doorImageIndex || 1)));
    const doorImageSrc = `images/etc/door-0${doorImageIndex}.webp`;

    const panel = document.createElement('article');
    panel.className = `playlab-panel-card playlab-doorlock-card is-${stage.mode}`;
    panel.innerHTML = `
      <div class="playlab-doorlock-hud">
        <div id="playlabHudTimer" class="playlab-icon-timer">${formatDuration(run.elapsedMs || 0)}</div>
      </div>
      <div class="playlab-doorlock-body">
        <div class="playlab-doorlock-device ${run.doorStatus === 'unlocked' ? 'is-open' : ''}">
          <div class="playlab-doorlock-top">
            <span class="playlab-doorlock-camera"></span>
            <span class="playlab-doorlock-brand">HAHALOCK</span>
            <span class="playlab-doorlock-sensor"></span>
          </div>
          <div class="playlab-doorlock-screen">
            <span class="playlab-doorlock-status">${statusText}</span>
            <div class="playlab-doorlock-slots" aria-label="입력 진행">
              ${question.sequenceCodes.map((_code, index) => `
                <span class="playlab-doorlock-slot ${inputLength > index ? 'is-filled' : ''}">${inputLength > index ? (run.doorInput[index] === '#' ? '#' : '•') : ''}</span>
              `).join('')}
            </div>
            <p class="playlab-doorlock-message">${run.doorMessage || question.prompt}</p>
            <div class="playlab-doorlock-sound-dots" aria-hidden="true">
              ${question.sequenceCodes.map((_code, index) => `
                <span class="${run.doorPreviewIndex === index ? 'is-active' : ''}"></span>
              `).join('')}
            </div>
          </div>
          <div class="playlab-doorlock-keypad">
            ${DOORLOCK_KEYS.map((key) => {
              const isLit = run.activeDoorKey === key;
              const isWrong = run.lastWrongDoorKey === key;
              return `
                <button type="button" class="playlab-doorlock-key ${isLit ? 'is-lit' : ''} ${isWrong ? 'is-wrong' : ''} ${key === '*' ? 'is-cancel' : ''} ${key === '#' ? 'is-enter' : ''}" data-door-key="${key}" aria-label="${key}">
                  <span>${key}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <div class="playlab-doorlock-visual" aria-hidden="true">
          <img src="${doorImageSrc}" alt="">
        </div>
      </div>
      <button type="button" class="playlab-secondary-btn playlab-doorlock-replay" ${run.locked ? 'disabled' : ''}>${replayLabel}</button>
    `;

    panel.querySelectorAll('[data-door-key]').forEach((button) => {
      button.disabled = !!run.locked;
      button.addEventListener('click', () => {
        handleDoorlockKey(button.getAttribute('data-door-key') || '');
      });
    });
    const replayButton = panel.querySelector('.playlab-doorlock-replay');
    if (replayButton) {
      replayButton.addEventListener('click', handleDoorlockReplay);
    }

    layout.appendChild(panel);
    return layout;
  }

  function renderLesson() {
    const run = state.run;
    const stage = getSelectedStage();
    if (!run || !stage) return;
    beginQuestionTracking(run);
    const question = run.questions[run.questionIndex];
    refs.lessonLayout.innerHTML = '';
    refs.lessonLayout.appendChild(
      IS_SHAPE
        ? renderShapeLesson(stage, question, run)
        : IS_DOORLOCK
          ? renderDoorlockLesson(stage, question, run)
        : IS_ICON_GAME
          ? renderIconFindLesson(stage, question, run)
        : IS_COLOR_MEMORY
          ? renderMemoryLesson(stage, question, run)
          : renderTraceLesson(stage, question, run)
    );
    if (IS_SHAPE || IS_DOORLOCK) {
      updateStageLabel('');
    } else {
      updateStageLabel(`${stage.badge}단계 · ${run.questionIndex + 1}/${run.questions.length}`);
    }
    setScreen('lessonView');
    if (IS_TIMED_GAME) {
      updateIconHudTimer();
      startHudTimer();
    }
    if (IS_DOORLOCK && !run.previewStarted) {
      startDoorlockPreview(stage, question, run);
    }
    if (IS_COLOR_MEMORY && !run.previewStarted) {
      startMemoryQuestionPreview(stage, question, run);
    }
  }

  function renderResult() {
    const stage = getSelectedStage();
    const run = state.run;
    if (!stage || !run) return;
    stopHudTimer();
    stopDoorAudio();
    clearDoorKeyTimer();
    run.elapsedMs = run.elapsedMs || (run.startedAtMs ? Date.now() - run.startedAtMs : 0);
    const accuracy = run.questions.length ? Math.round((run.correctCount / run.questions.length) * 100) : 0;
    const stageDisplayTitle = getStageDisplayTitle(stage);
    const stageDisplaySubtitle = getStageDisplaySubtitle(stage);
    const reportInput = {
      reportEvidenceMode: 'observed-only',
      reportType: getStandaloneReportType(),
      title: PAGE_CONFIG.title || '',
      stageTitle: stageDisplayTitle || stage.title || '',
      totalItems: run.questions.length,
      totalQuestions: run.questions.length,
      correctCount: run.correctCount,
      completionCount: run.correctCount,
      wrongCount: run.totalWrongAttempts,
      wrongCountKind: 'wrong-attempts',
      replayCount: run.totalReplayCount,
      visualReplayCount: run.visualReplayCount,
      audioReplayCount: run.audioReplayCount,
      perfectCount: run.correctOnFirstTryCount,
      firstTryRate: run.questions.length ? Math.round((run.correctOnFirstTryCount / run.questions.length) * 100) : 0,
      accuracyRate: accuracy,
      elapsedMs: run.elapsedMs,
      avgQuestionMs: null,
      avgTaskElapsedMs: run.questionLogs.length
        ? run.questionLogs.reduce((sum, log) => sum + log.taskElapsedMs, 0) / run.questionLogs.length
        : null,
      questionLogs: run.questionLogs,
      startedAtMs: run.startedAtMs,
      rows: stage.rows,
      cols: stage.cols,
      targetCount: stage.targetCount,
      oddCount: stage.oddCount,
      distractorKinds: stage.distractorKinds,
      connectionCount: stage.connectionCount,
      memoryMs: stage.memoryMs,
      optionCount: stage.optionCount,
      sequenceLength: IS_DOORLOCK && run.questions.length ? run.questions[0].sequenceCodes.length - 1 : stage.sequenceLength,
      mode: stage.mode,
      accentColor: THEME.accentStrong,
      ageGroupLabel: stage.rehabAge ? stage.rehabAge.label : '',
      ageGroupRange: stage.rehabAge ? stage.rehabAge.range : '',
      levelLabel: stage.rehabLevel ? stage.rehabLevel.label : '',
      levelDescription: stage.rehabLevel ? stage.rehabLevel.desc : '',
      clinicalNote: stage.rehabAge ? stage.rehabAge.note : '',
      guardianSummary: stage.rehabAge && stage.rehabLevel
        ? `${stage.rehabAge.label} 기준 ${stage.rehabLevel.label} 단계에서 ${accuracy}% 정확도를 보였습니다.`
        : '',
      teacherReviewNote: stage.rehabAge && stage.rehabLevel
        ? `${stageDisplaySubtitle}. 오반응 유형과 반복 재시도 여부를 다음 회기에서 함께 확인합니다.`
        : ''
    };
    const report = window.PlaylabReportEngine
      ? window.PlaylabReportEngine.buildReport(reportInput)
      : null;
    saveFoodHealthFindSession(stage, run, accuracy);
    if (!run.reportSaveStarted && report && !IS_FOOD_HEALTH_FIND) {
      run.reportSaveStarted = true;
      saveStandaloneResultHistory(reportInput, report, {
        sessionId: run.sessionId,
        stageKey: stage.id,
        stageTitle: stageDisplayTitle || stage.title || '',
        focusKey: IS_DOORLOCK ? 'memory' : 'general',
        focusLabel: IS_DOORLOCK ? '작업기억' : '기초 수행'
      }).then(function (result) {
        run.reportSaveState = result && result.error ? 'error' : result && result.skipped ? 'skipped' : 'saved';
      });
    }
    refs.resultTitle.textContent = stageDisplayTitle || stage.title;
    refs.resultSummary.innerHTML = report && !report.isSimpleResult
      ? formatStandaloneRichText(report.briefOpinion)
      : IS_ICON_GAME
        ? run.endedByFailure
          ? `하트를 모두 사용해서 이번 단계는 여기서 마쳤어요. ${run.questions.length}문항 중 ${run.correctCount}문항을 완료했고, 같은 단계를 다시 하거나 다른 단계를 골라 이어갈 수 있어요.`
          : `${run.questions.length}문항 중 ${run.correctCount}문항을 완료했어요. ${PAGE_CONFIG.title} 학습을 한 번 더 반복하거나 다른 단계를 이어서 선택할 수 있어요.`
        : `${run.questions.length}문항 중 ${run.correctCount}문항을 맞혔어요. ${PAGE_CONFIG.title} 학습을 한 번 더 반복하거나 다른 단계를 이어서 선택할 수 있어요.`;
    if (refs.resultStats) {
      if (IS_DOORLOCK) {
        const bannerText = run.endedByFailure ? 'LOCKED' : accuracy >= 95 ? 'OPEN CLEAR' : accuracy >= 80 ? 'NICE UNLOCK' : 'TRY AGAIN';
        const bannerClass = run.endedByFailure ? 'is-keep' : accuracy >= 95 ? 'is-perfect' : accuracy >= 80 ? 'is-great' : 'is-keep';
        refs.resultStats.innerHTML = `
          <div class="playlab-result-banner ${bannerClass}">
            <span class="playlab-result-banner-label">${bannerText}</span>
            <strong>${accuracy}% 완료</strong>
          </div>
          <div class="playlab-result-stats">
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">열기 성공</span>
              <strong>${run.correctCount}/${run.questions.length}</strong>
            </div>
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">비밀번호 길이</span>
              <strong>${stage.sequenceLength || 4}자리 + #</strong>
            </div>
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">소요 시간</span>
              <strong>${formatDuration(run.elapsedMs)}</strong>
            </div>
          </div>
          ${report && !report.isSimpleResult ? window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' }) : ''}
        `;
      } else if (IS_ICON_GAME) {
        const bannerText = run.endedByFailure ? 'TRY AGAIN' : accuracy >= 95 ? 'EAGLE EYE' : accuracy >= 80 ? 'NICE SEARCH' : 'KEEP LOOKING';
        const bannerClass = run.endedByFailure ? 'is-keep' : accuracy >= 95 ? 'is-perfect' : accuracy >= 80 ? 'is-great' : 'is-keep';
        refs.resultStats.innerHTML = `
          <div class="playlab-result-banner ${bannerClass}">
            <span class="playlab-result-banner-label">${bannerText}</span>
            <strong>${accuracy}% 완료</strong>
          </div>
          <div class="playlab-result-stats">
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">완료 문항</span>
              <strong>${run.correctCount}/${run.questions.length}</strong>
            </div>
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">보드 크기</span>
              <strong>${stage.rows}x${stage.cols}</strong>
            </div>
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">소요 시간</span>
              <strong>${formatDuration(run.elapsedMs)}</strong>
            </div>
          </div>
          ${report && !report.isSimpleResult ? window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' }) : ''}
        `;
      } else if (IS_COLOR_TRACE || IS_COLOR_MEMORY) {
        const bannerText = accuracy >= 95 ? 'PERFECT CONNECT' : accuracy >= 80 ? 'GREAT JOB' : 'KEEP GOING';
        const bannerClass = accuracy >= 95 ? 'is-perfect' : accuracy >= 80 ? 'is-great' : 'is-keep';
        const thirdLabel = IS_COLOR_MEMORY ? '기억 순서' : '연결 색상';
        const thirdValue = IS_COLOR_MEMORY ? `${stage.connectionCount}개` : `${stage.connectionCount}개`;
        refs.resultStats.innerHTML = `
          <div class="playlab-result-banner ${bannerClass}">
            <span class="playlab-result-banner-label">${bannerText}</span>
            <strong>${accuracy}% 정확도</strong>
          </div>
          <div class="playlab-result-stats">
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">정답</span>
              <strong>${run.correctCount}/${run.questions.length}</strong>
            </div>
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">클리어 단계</span>
              <strong>${stage.rehabLevel ? stage.rehabLevel.label : `${stage.badge}단계`}</strong>
            </div>
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">${thirdLabel}</span>
              <strong>${thirdValue}</strong>
            </div>
          </div>
          ${report && !report.isSimpleResult ? window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' }) : ''}
        `;
      } else if (IS_SHAPE) {
        refs.resultStats.innerHTML = `
          <div class="playlab-result-banner ${accuracy >= 95 ? 'is-perfect' : accuracy >= 80 ? 'is-great' : 'is-keep'}">
            <span class="playlab-result-banner-label">${accuracy >= 95 ? 'SHAPE MASTER' : accuracy >= 80 ? 'NICE MATCH' : 'KEEP TRYING'}</span>
            <strong>${accuracy}% 정확도</strong>
          </div>
          <div class="playlab-result-stats">
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">정답</span>
              <strong>${run.correctCount}/${run.questions.length}</strong>
            </div>
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">선택지 수</span>
              <strong>${stage.optionCount}개</strong>
            </div>
            <div class="playlab-result-stat">
              <span class="playlab-result-stat-label">소요 시간</span>
              <strong>${formatDuration(run.elapsedMs)}</strong>
            </div>
          </div>
          ${report && !report.isSimpleResult ? window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' }) : ''}
        `;
      } else {
        refs.resultStats.innerHTML = report && !report.isSimpleResult ? window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' }) : '';
      }
    }
    if (IS_SHAPE || IS_DOORLOCK) {
      updateStageLabel('');
    } else {
      updateStageLabel(`${stageDisplayTitle || PAGE_CONFIG.title} · 결과`);
    }
    setScreen('resultView');
  }

  function moveToNextQuestionOrResult(correctIncrement) {
    const run = state.run;
    if (!run) return;
    clearPreviewTimers();
    run.elapsedMs = run.startedAtMs ? Date.now() - run.startedAtMs : run.elapsedMs;
    finalizeQuestionTracking(run, correctIncrement > 0, correctIncrement > 0 ? 'success' : 'failed');
    const nextQuestionIndex = run.questionIndex + 1;
    run.correctCount += correctIncrement;
    if (nextQuestionIndex >= run.questions.length) {
      run.status = 'result';
      state.run = run;
      completeStage();
      return;
    }
    run.questionIndex = nextQuestionIndex;
    run.locked = false;
    run.selectedOptionId = '';
    run.tracePath = [];
    run.traceStatus = '';
    run.previewPath = [];
    run.previewStarted = false;
    run.showMemoryNumbers = false;
    run.memoryCueVisible = false;
    run.memoryRevealIndex = -1;
    run.selectedTargetIds = [];
    run.doorInput = [];
    run.doorStatus = '';
    run.doorMessage = '';
    run.doorPreviewIndex = -1;
    run.activeDoorKey = '';
    run.lastWrongDoorKey = '';
    run.doorImageIndex = 1;
    run.lastWrongCellId = '';
    run.revealedFoodCellIds = [];
    state.lastWrongTraceCode = '';
    beginQuestionTracking(run);
    state.run = run;
    renderLesson();
  }

  function handleShapeChoice(optionId) {
    const run = state.run;
    if (!run || run.locked) return;
    const question = run.questions[run.questionIndex];
    const option = question.options.find((entry) => entry.id === optionId);
    if (!option) return;
    recordQuestionInteraction(run, !option.correct);
    run.locked = true;
    run.selectedOptionId = optionId;
    state.run = run;
    renderLesson();
    showFeedback(option.correct ? 'correct' : 'wrong');
    window.setTimeout(() => {
      if (!option.correct) {
        run.locked = false;
        run.selectedOptionId = '';
        state.run = run;
        renderLesson();
        return;
      }
      moveToNextQuestionOrResult(1);
    }, 420);
  }

  function handleTraceNode(nodeCode) {
    const run = state.run;
    if (!run || run.locked) return;
    playSelectSound();
    const question = run.questions[run.questionIndex];
    const expected = question.sequenceCodes[run.tracePath.length];
    if (!expected) return;
    if (String(nodeCode) !== String(expected)) {
      recordQuestionInteraction(run, true);
      run.locked = true;
      run.traceStatus = 'wrong';
      state.lastWrongTraceCode = String(nodeCode);
      if (navigator.vibrate) {
        navigator.vibrate([70, 35, 100]);
      }
      state.run = run;
      renderLesson();
      showFeedback('wrong');
      window.setTimeout(() => {
        run.locked = false;
        run.traceStatus = '';
        state.lastWrongTraceCode = '';
        state.run = run;
        renderLesson();
      }, 520);
      return;
    }
    recordQuestionInteraction(run, false);
    run.tracePath = [...run.tracePath, nodeCode];
    state.lastWrongTraceCode = '';
    const completed = run.tracePath.length >= question.sequenceCodes.length;
    if (!completed) {
      run.traceStatus = 'progress';
      state.run = run;
      renderLesson();
      return;
    }
    run.locked = true;
    run.traceStatus = 'correct';
    state.run = run;
    renderLesson();
    showFeedback('correct');
    window.setTimeout(() => {
      moveToNextQuestionOrResult(1);
    }, 980);
  }

  function handleIconCell(cellId) {
    const run = state.run;
    if (!run || run.locked) return;
    const question = run.questions[run.questionIndex];
    const cell = question.cells.find((entry) => entry.id === cellId);
    if (!cell) return;
    if (cell.isTarget && run.selectedTargetIds.includes(cellId)) return;

    playSelectSound();

    if (!cell.isTarget) {
      recordQuestionInteraction(run, true);
      run.locked = true;
      run.lastWrongCellId = cellId;
      if (IS_FOOD_HEALTH_FIND && !(run.revealedFoodCellIds || []).includes(cellId)) {
        run.revealedFoodCellIds = [...(run.revealedFoodCellIds || []), cellId];
      }
      run.remainingLives = Math.max(0, run.remainingLives - 1);
      run.elapsedMs = run.startedAtMs ? Date.now() - run.startedAtMs : run.elapsedMs;
      state.run = run;
      renderLesson();
      showFeedback('wrong');
      window.setTimeout(() => {
        if (run.remainingLives <= 0) {
          run.endedByFailure = true;
          run.status = 'result';
          finalizeQuestionTracking(run, false, 'failed');
          state.run = run;
          renderResult();
          return;
        }
        run.locked = false;
        run.lastWrongCellId = '';
        state.run = run;
        renderLesson();
      }, 520);
      return;
    }

    recordQuestionInteraction(run, false);
    run.selectedTargetIds = [...run.selectedTargetIds, cellId];
    run.elapsedMs = run.startedAtMs ? Date.now() - run.startedAtMs : run.elapsedMs;
    state.run = run;
    renderLesson();

    if (run.selectedTargetIds.length < question.targetCount) return;

    run.locked = true;
    state.run = run;
    showFeedback('correct');
    window.setTimeout(() => {
      moveToNextQuestionOrResult(1);
    }, 760);
  }

  function flashDoorKey(key, isWrong) {
    const run = state.run;
    if (!run) return;
    clearDoorKeyTimer();
    run.activeDoorKey = key;
    run.lastWrongDoorKey = isWrong ? key : '';
    state.run = run;
    renderLesson();
    state.doorKeyTimer = window.setTimeout(() => {
      if (!state.run) return;
      state.run.activeDoorKey = '';
      if (!isWrong) {
        state.run.lastWrongDoorKey = '';
      }
      renderLesson();
    }, isWrong ? 520 : 240);
  }

  function handleDoorlockReplay() {
    const run = state.run;
    const stage = getSelectedStage();
    if (!run || !stage || run.locked) return;
    const question = run.questions[run.questionIndex];
    recordQuestionReplay(run, stage.mode);
    clearPreviewTimers();
    stopDoorAudio();
    clearDoorKeyTimer();
    run.previewStarted = false;
    run.doorInput = [];
    run.doorStatus = '';
    run.doorMessage = '';
    run.doorPreviewIndex = -1;
    run.activeDoorKey = '';
    run.lastWrongDoorKey = '';
    run.doorImageIndex = 1;
    state.run = run;
    startDoorlockPreview(stage, question, run);
  }

  function failDoorlockAttempt(run, key) {
    recordQuestionInteraction(run, true);
    const questionStats = ensureQuestionTracking(run);
    const wrongAttempts = Number(questionStats && questionStats.wrongAttempts || 0);
    const isFinalAttempt = wrongAttempts >= 3;
    run.locked = true;
    run.lastWrongDoorKey = key;
    run.activeDoorKey = key;
    run.doorImageIndex = isFinalAttempt ? 4 : (run.doorImageIndex === 1 ? 2 : 1);
    run.doorStatus = 'wrong';
    run.doorMessage = isFinalAttempt
      ? '3번 틀렸어요. 다음 문제로 넘어가요.'
      : `순서가 달라요. ${3 - wrongAttempts}번 더 시도할 수 있어요.`;
    run.elapsedMs = run.startedAtMs ? Date.now() - run.startedAtMs : run.elapsedMs;
    if (navigator.vibrate) {
      navigator.vibrate([60, 30, 90]);
    }
    state.run = run;
    renderLesson();
    showFeedback('wrong', { silent: true });
    playDoorErrorSound(isFinalAttempt).then(() => {
      if (state.run !== run) return;
      if (isFinalAttempt) {
        moveToNextQuestionOrResult(0);
        return;
      }
      run.locked = false;
      run.doorInput = [];
      run.activeDoorKey = '';
      run.lastWrongDoorKey = '';
      run.doorImageIndex = 1;
      run.doorStatus = 'input';
      run.doorMessage = '다시 차분하게 눌러보세요.';
      state.run = run;
      renderLesson();
    });
  }

  function handleDoorlockKey(key) {
    const run = state.run;
    if (!IS_DOORLOCK || !run || run.locked) return;
    const stage = getSelectedStage();
    const question = run.questions[run.questionIndex];
    if (!question || !DOORLOCK_KEYS.includes(key)) return;
    stopFeedbackAudio();

    if (key === '*') {
      playDoorlockKeySound(key, stage && stage.mode);
      run.doorInput = [];
      run.doorStatus = 'input';
      run.doorMessage = '입력을 지웠어요. 처음부터 다시 눌러요.';
      run.doorImageIndex = run.doorImageIndex === 1 ? 2 : 1;
      state.run = run;
      flashDoorKey(key, false);
      return;
    }

    const expected = question.sequenceCodes[run.doorInput.length];
    if (String(key) !== String(expected)) {
      failDoorlockAttempt(run, key);
      return;
    }

    recordQuestionInteraction(run, false);
    run.doorInput = [...run.doorInput, key];
    run.doorStatus = 'input';
    run.doorImageIndex = run.doorImageIndex === 1 ? 2 : 1;
    run.doorMessage = key === '#'
      ? '확인 중이에요.'
      : '좋아요. 다음 숫자를 계속 눌러요.';
    run.elapsedMs = run.startedAtMs ? Date.now() - run.startedAtMs : run.elapsedMs;
    state.run = run;
    flashDoorKey(key, false);

    if (run.doorInput.length < question.sequenceCodes.length) {
      playDoorlockKeySound(key, stage && stage.mode);
      return;
    }

    clearDoorKeyTimer();
    run.locked = true;
    run.activeDoorKey = '#';
    run.doorStatus = 'unlocked';
    run.doorImageIndex = 3;
    run.doorMessage = '띠리릭, 문이 열렸어요!';
    state.run = run;
    renderLesson();
    showFeedback('correct', { silent: true });
    playDoorOpenSound().then(async () => {
      if (state.run !== run) return;
      await waitMs(1300);
      if (state.run !== run) return;
      moveToNextQuestionOrResult(1);
    });
  }

  function handleDoorlockKeyboard(event) {
    if (!IS_DOORLOCK || !refs.lessonView.classList.contains('is-active')) return;
    const key = event.key === 'Enter' ? '#' : event.key;
    if (!DOORLOCK_KEYS.includes(key)) return;
    event.preventDefault();
    handleDoorlockKey(key);
  }

  function bindEvents() {
    ensureSavePdfButton();
    if (refs.introStartButton) refs.introStartButton.addEventListener('click', startStage);
    if (refs.introBackButton) refs.introBackButton.addEventListener('click', goToStageSelect);
    refs.resultRetryButton.addEventListener('click', startStage);
    refs.resultBackButton.addEventListener('click', goToStageSelect);
    if (REHAB_MENU_MODE && refs.agePanel) {
      refs.agePanel.querySelectorAll('[data-age]').forEach((button) => {
        button.addEventListener('click', () => {
          state.selectedAgeId = String(button.getAttribute('data-age') || '').trim();
          state.selectedLevelId = '';
          renderRehabLevelGrid();
          updateRehabMenuState();
        });
      });
    }
    if (REHAB_MENU_MODE && refs.levelGrid) {
      refs.levelGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-level-id]');
        if (!button || !state.selectedAgeId) return;
        state.selectedLevelId = String(button.getAttribute('data-level-id') || '').trim();
        updateRehabMenuState();
      });
    }
    if (REHAB_MENU_MODE && refs.startButton) {
      refs.startButton.addEventListener('click', startRehabSelectedStage);
    }
    refs.stageSelectButton.addEventListener('click', () => {
      if (state.run && refs.lessonView.classList.contains('is-active')) {
        openConfirm('스테이지 선택', '현재 학습을 멈추고 스테이지 목록으로 돌아갈까요?', goToStageSelect);
        return;
      }
      goToStageSelect();
    });
    refs.helpButton.addEventListener('click', openHelp);
    if (refs.savePdfButton) {
      refs.savePdfButton.addEventListener('click', triggerPdfSave);
    }
    refs.helpClose.addEventListener('click', closeHelp);
    if (refs.exitButton) {
      refs.exitButton.addEventListener('click', () => {
        openConfirm('학습 종료', '현재 페이지를 나가고 이전 화면으로 돌아갈까요?', () => {
          stopFeedbackAudio();
          stopSelectAudio();
          if (window.history.length > 1) {
            window.history.back();
          } else {
            goToStageSelect();
          }
        });
      });
    }
    refs.confirmCancel.addEventListener('click', closeConfirm);
    refs.confirmOk.addEventListener('click', () => {
      const action = state.confirmAction;
      closeConfirm();
      if (action) action();
    });
    document.querySelectorAll('[data-modal-close]').forEach((node) => {
      node.addEventListener('click', () => {
        if (node.closest('#helpModal')) closeHelp();
        if (node.closest('#confirmModal')) closeConfirm();
      });
    });
    if (IS_DOORLOCK) {
      document.addEventListener('keydown', handleDoorlockKeyboard);
    }
    window.addEventListener('afterprint', () => {
      if (state.pendingTitleRestore) {
        document.title = state.pendingTitleRestore;
        state.pendingTitleRestore = '';
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearPreviewTimers();
        stopDoorAudio();
        clearDoorKeyTimer();
        stopFeedbackAudio();
        stopSelectAudio();
      }
    });
    window.addEventListener('pagehide', () => {
      clearPreviewTimers();
      stopHudTimer();
      stopDoorAudio();
      clearDoorKeyTimer();
      stopFeedbackAudio();
      stopSelectAudio();
    });
    window.addEventListener('beforeunload', () => {
      clearPreviewTimers();
      stopHudTimer();
      stopDoorAudio();
      clearDoorKeyTimer();
      stopFeedbackAudio();
      stopSelectAudio();
    });
  }

  function applyTheme() {
    document.documentElement.style.setProperty('--playlab-accent', THEME.accent);
    document.title = PAGE_CONFIG.title || '플레이랩';
    refs.helpTitle.textContent = `${PAGE_CONFIG.title} 학습 안내`;
  }

  function init() {
    applyTheme();
    renderStageGrid();
    bindEvents();
    setScreen('stageSelectView');
    updateStageLabel('');
    if (REHAB_MENU_MODE) {
      updateRehabMenuState();
    }
  }

  init();
})();
