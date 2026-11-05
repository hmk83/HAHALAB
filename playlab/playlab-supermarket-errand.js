(function () {
  'use strict';

  const SECTIONS = [
    { id: 'fruit', title: '과일 코너', imageSrc: '/playlab/images/supermarket/section-fruit.webp', labelSrc: '/playlab/images/supermarket/label-fruit.webp', color: '#ffb347', x: 8.9, y: 27.5, w: 16.9, h: 11.3 },
    { id: 'vegetable', title: '채소 코너', imageSrc: '/playlab/images/supermarket/section-vegetable.webp', labelSrc: '/playlab/images/supermarket/label-vegetable.webp', color: '#83d86f', x: 42.1, y: 30.9, w: 16.9, h: 11.3 },
    { id: 'snack', title: '과자류 코너', imageSrc: '/playlab/images/supermarket/section-snack.webp', labelSrc: '/playlab/images/supermarket/label-snack.webp', color: '#ff9fc7', x: 75.0, y: 27.5, w: 16.9, h: 11.3 },
    { id: 'drink', title: '음료 코너', imageSrc: '/playlab/images/supermarket/section-drink.webp', labelSrc: '/playlab/images/supermarket/label-drink.webp', color: '#8ed7ff', x: 74.9, y: 2.5, w: 16.9, h: 11.3 },
    { id: 'bakery', title: '빵류 코너', imageSrc: '/playlab/images/supermarket/section-bakery.webp', labelSrc: '/playlab/images/supermarket/label-bakery.webp', color: '#f8b56b', x: 8.7, y: 2.4, w: 16.9, h: 11.3 },
    { id: 'seafood', title: '수산물 코너', imageSrc: '/playlab/images/supermarket/section-seafood.webp', labelSrc: '/playlab/images/supermarket/label-seafood.webp', color: '#79d5ea', x: 8.8, y: 71.4, w: 16.9, h: 11.3 },
    { id: 'meat', title: '육류 코너', imageSrc: '/playlab/images/supermarket/section-meat.webp', labelSrc: '/playlab/images/supermarket/label-meat.webp', color: '#ff9a9a', x: 8.9, y: 50.6, w: 16.9, h: 11.3 },
    { id: 'cold', title: '냉장 및 냉동식품 코너', imageSrc: '/playlab/images/supermarket/section-cold.webp', labelSrc: '/playlab/images/supermarket/label-cold.webp', color: '#a9d9ff', x: 41.8, y: 2.5, w: 16.9, h: 11.3 },
    { id: 'processed', title: '가공식품 및 양념 코너', imageSrc: '/playlab/images/supermarket/section-processed.webp', labelSrc: '/playlab/images/supermarket/label-processed.webp', color: '#ffd86f', x: 75.0, y: 50.7, w: 16.9, h: 11.3 }
  ];

  const CHECKOUT_ZONE = {
    title: '계산대',
    labelSrc: '/playlab/images/supermarket/label-checkout.webp',
    color: '#8ee0a4',
    x: 41.9,
    y: 56.9,
    w: 16.9,
    h: 11.3
  };

  const PRODUCT_NAMES = {
    fruit: ['사과', '바나나', '포도', '딸기', '오렌지', '배', '복숭아', '키위', '수박', '멜론', '귤', '망고', '자두', '블루베리', '파인애플'],
    vegetable: ['당근', '오이', '상추', '양파', '감자', '고구마', '브로콜리', '양배추', '호박', '토마토', '버섯', '파프리카', '대파', '가지', '시금치'],
    snack: ['포테토칩', '초코송이', '에이스', '하리보젤리', '츄파츕스', '초코칩', '팝콘', '쌀로별', '새우깡', '웨하스', '프레첼', '오예스', '초코파이', '프링글스', '양파링', '바나나킥'],
    drink: ['생수', '우유', '베지밀', '탄산수', '요구르트', '하늘보리', '포카리스웨트', '딸기우유', '초코우유', '사과주스', '오렌지주스', '커피우유', '식혜', '아이스티'],
    bakery: ['식빵', '크루아상', '바게트', '소보로빵', '단팥빵', '머핀', '베이글', '카스테라', '롤케이크', '치즈빵', '마늘빵', '피자빵', '도넛', '모닝빵', '호두파이', '10원빵', '두쫀쿠', '버터떡', '치즈케이크', '초코케이크', '망고케이크'],
    seafood: ['고등어', '새우', '오징어', '연어', '조개', '문어', '갈치', '멸치', '꽃게', '홍합', '꽁치', '전복', '굴', '대구', '어묵'],
    meat: ['소고기', '수육용고기', '닭고기', '삼겹살', '목살', '갈비', '불고기', '스테이크'],
    cold: ['아이스크림', '냉동만두', '냉동피자', '비요뜨', '치즈', '버터', '냉동볶음밥', '냉동돈가스', '떡갈비', '냉면', '두부', '순두부', '김치', '계란', '냉동감자', '냉동새우', '새우튀김', '순대', '햄', '닭가슴살', '베이컨', '미트볼', '훈제오리', '아이스크림 케이크'],
    processed: ['너구리', '안성탕면', '짜파게티', '참치캔', '스팸', '카레', '시리얼', '파스타면', '토마토소스', '케첩', '김', '즉석밥', '된장', '고추장', '간장', '식용유', '통조림옥수수', '마요네즈']
  };

  const PRODUCT_IMAGE_SLUGS = {
    '사과': 'apple', '바나나': 'banana', '포도': 'grape', '딸기': 'strawberry', '오렌지': 'orange', '배': 'pear', '복숭아': 'peach', '키위': 'kiwi', '수박': 'watermelon', '멜론': 'melon', '귤': 'tangerine', '망고': 'mango', '자두': 'plum', '블루베리': 'blueberry', '파인애플': 'pineapple',
    '당근': 'carrot', '오이': 'cucumber', '상추': 'lettuce', '양파': 'onion', '감자': 'potato', '고구마': 'sweet-potato', '브로콜리': 'broccoli', '양배추': 'cabbage', '호박': 'zucchini', '토마토': 'tomato', '버섯': 'mushroom', '파프리카': 'paprika', '대파': 'green-onion', '가지': 'eggplant', '시금치': 'spinach',
    '포테토칩': 'potato-chip', '초코송이': 'choco-songi', '에이스': 'ace-cracker', '하리보젤리': 'haribo-jelly', '츄파츕스': 'chupa-chups', '초코칩': 'choco-chip', '팝콘': 'popcorn', '쌀로별': 'ssalrobyeol', '새우깡': 'shrimp-cracker', '웨하스': 'wafer', '프레첼': 'pretzel', '오예스': 'oh-yes', '초코파이': 'choco-pie', '프링글스': 'pringles', '양파링': 'onion-ring', '바나나킥': 'banana-kick',
    '생수': 'water', '우유': 'milk', '베지밀': 'vegemil', '탄산수': 'sparkling-water', '요구르트': 'yogurt-drink', '하늘보리': 'barley-tea', '포카리스웨트': 'pocari-sweat', '딸기우유': 'strawberry-milk', '초코우유': 'chocolate-milk', '사과주스': 'apple-juice', '오렌지주스': 'orange-juice', '커피우유': 'coffee-milk', '식혜': 'sikhye', '아이스티': 'iced-tea',
    '식빵': 'white-bread', '크루아상': 'croissant', '바게트': 'baguette', '소보로빵': 'soboro-bread', '단팥빵': 'red-bean-bread', '머핀': 'muffin', '베이글': 'bagel', '카스테라': 'castella', '롤케이크': 'roll-cake', '치즈빵': 'cheese-bread', '마늘빵': 'garlic-bread', '피자빵': 'pizza-bread', '도넛': 'donut', '모닝빵': 'dinner-roll', '호두파이': 'walnut-pie', '10원빵': 'ten-won-bread', '두쫀쿠': 'duzzonku', '버터떡': 'butter-rice-cake', '치즈케이크': 'cheese-cake', '초코케이크': 'chocolate-cake', '망고케이크': 'mango-cake',
    '고등어': 'mackerel', '새우': 'shrimp', '오징어': 'squid', '연어': 'salmon', '조개': 'clam', '문어': 'octopus', '갈치': 'hairtail', '멸치': 'anchovy', '꽃게': 'blue-crab', '홍합': 'mussel', '꽁치': 'saury', '전복': 'abalone', '굴': 'oyster', '대구': 'cod', '어묵': 'fish-cake',
    '소고기': 'beef', '수육용고기': 'boiled-pork-meat', '닭고기': 'chicken', '삼겹살': 'pork-belly', '목살': 'pork-neck', '갈비': 'galbi', '순대': 'sundae', '햄': 'ham', '닭가슴살': 'chicken-breast', '불고기': 'bulgogi', '스테이크': 'steak', '베이컨': 'bacon', '미트볼': 'meatball', '훈제오리': 'smoked-duck',
    '아이스크림': 'ice-cream', '냉동만두': 'frozen-dumpling', '냉동피자': 'frozen-pizza', '비요뜨': 'biyotte', '치즈': 'cheese', '버터': 'butter', '냉동볶음밥': 'frozen-fried-rice', '냉동돈가스': 'frozen-pork-cutlet', '떡갈비': 'tteokgalbi', '냉면': 'cold-noodle', '두부': 'tofu', '순두부': 'soft-tofu', '김치': 'kimchi', '계란': 'egg', '냉동감자': 'frozen-fries', '냉동새우': 'frozen-shrimp', '새우튀김': 'fried-shrimp', '아이스크림 케이크': 'ice-cream-cake',
    '너구리': 'neoguri', '안성탕면': 'ansungtangmyun', '짜파게티': 'jjapagetti', '참치캔': 'tuna-can', '스팸': 'spam', '카레': 'curry', '시리얼': 'cereal', '파스타면': 'pasta-noodle', '토마토소스': 'tomato-sauce', '케첩': 'ketchup', '김': 'seaweed', '즉석밥': 'instant-rice', '된장': 'doenjang', '고추장': 'gochujang', '간장': 'soy-sauce', '식용유': 'cooking-oil', '통조림옥수수': 'canned-corn', '마요네즈': 'mayonnaise'
  };

  const PRODUCT_PRICES = {
    '사과': 1980, '바나나': 3980, '포도': 9980, '딸기': 12900, '오렌지': 1500, '배': 3500, '복숭아': 2500, '키위': 990, '수박': 22000, '멜론': 12000, '귤': 7980, '망고': 3500, '자두': 1200, '블루베리': 7980, '파인애플': 5980,
    '당근': 1200, '오이': 900, '상추': 2980, '양파': 3980, '감자': 4980, '고구마': 6980, '브로콜리': 2980, '양배추': 3980, '호박': 1980, '토마토': 6980, '버섯': 1980, '파프리카': 2200, '대파': 2980, '가지': 1500, '시금치': 2980,
    '포테토칩': 1980, '초코송이': 1980, '에이스': 2500, '하리보젤리': 1980, '츄파츕스': 500, '초코칩': 3500, '팝콘': 2500, '쌀로별': 1980, '새우깡': 1500, '웨하스': 2500, '프레첼': 2500, '오예스': 5980, '초코파이': 5980, '프링글스': 2980, '양파링': 1500, '바나나킥': 1500,
    '생수': 500, '우유': 3200, '베지밀': 1100, '탄산수': 900, '요구르트': 3500, '하늘보리': 1500, '포카리스웨트': 1800, '딸기우유': 1500, '초코우유': 1500, '사과주스': 2300, '오렌지주스': 2300, '커피우유': 1500, '식혜': 1200, '아이스티': 1500,
    '식빵': 3500, '크루아상': 2500, '바게트': 3900, '소보로빵': 1800, '단팥빵': 1800, '머핀': 2500, '베이글': 2500, '카스테라': 4500, '롤케이크': 12000, '치즈빵': 2500, '마늘빵': 3900, '피자빵': 2800, '도넛': 1800, '모닝빵': 3500, '호두파이': 4500, '10원빵': 3500, '두쫀쿠': 3200, '버터떡': 2800, '치즈케이크': 5900, '초코케이크': 5900, '망고케이크': 6500,
    '고등어': 4500, '새우': 9980, '오징어': 4500, '연어': 12900, '조개': 6980, '문어': 12000, '갈치': 9000, '멸치': 6980, '꽃게': 15000, '홍합': 4980, '꽁치': 3500, '전복': 12900, '굴': 7980, '대구': 12000, '어묵': 2980,
    '소고기': 12900, '수육용고기': 9800, '닭고기': 6980, '삼겹살': 9800, '목살': 9800, '갈비': 15900, '순대': 4980, '햄': 3980, '닭가슴살': 3500, '불고기': 9900, '스테이크': 15900, '베이컨': 5980, '미트볼': 5980, '훈제오리': 9800,
    '아이스크림': 1200, '냉동만두': 8980, '냉동피자': 7980, '비요뜨': 1600, '치즈': 5980, '버터': 6980, '냉동볶음밥': 7980, '냉동돈가스': 9980, '떡갈비': 8980, '냉면': 5980, '두부': 2000, '순두부': 2200, '김치': 9900, '계란': 7980, '냉동감자': 7980, '냉동새우': 9980, '새우튀김': 9980, '아이스크림 케이크': 24900,
    '너구리': 4800, '안성탕면': 4500, '짜파게티': 5200, '참치캔': 2800, '스팸': 4500, '카레': 2800, '시리얼': 6980, '파스타면': 2980, '토마토소스': 3980, '케첩': 3500, '김': 5980, '즉석밥': 1800, '된장': 4500, '고추장': 5500, '간장': 4500, '식용유': 7500, '통조림옥수수': 2500, '마요네즈': 4500
  };

  const PRODUCT_COLORS = ['#ff6b6b', '#ffd43b', '#51cf66', '#4dabf7', '#b197fc', '#ff922b', '#20c997', '#f06595', '#94a3b8'];
  const STORY_IMAGES = {
    female: {
      intro: '/playlab/images/supermarket/errand-intro.webp',
      success: '/playlab/images/supermarket/errand-success.webp',
      fail: '/playlab/images/supermarket/errand-fail.webp'
    },
    male: {
      intro: '/playlab/images/supermarket/errand-intro-m.webp',
      success: '/playlab/images/supermarket/errand-success-m.webp',
      fail: '/playlab/images/supermarket/errand-fail-m.webp'
    }
  };
  const SOUND_BASE = '/sound/etc/';
  const STORY_AUDIO_FILES = {
    intro: [
      'mart-errand-request-20260510.wav',
      'yes-mom-20260510.wav',
      'arrive-mart-start-shopping-20260510.wav'
    ],
    success: [
      'mom-i-finished-shopping-20260510.wav',
      'mom-praise-success-20260510.wav',
      'thank-you-mom-20260510.wav'
    ],
    fail: [
      'mom-i-finished-shopping-fail-20260510.wav',
      'mom-wrong-items-20260510.wav',
      'child-confused-20260510.wav',
      'mom-try-again-next-time-20260510.wav'
    ]
  };
  const BUDGET_OVER_AUDIO = 'budget-over-remove-item-20260510.wav';
  const NO_ITEMS_AUDIO = 'no-items-purchased-20260513.wav';
  const COUNTER_CHOICE_AUDIO = 'counter.wav';
  const SELF_PRODUCT_LAYOUT = [
    { x: 7, y: 10, rotate: -8 },
    { x: 30, y: 5, rotate: 6 },
    { x: 54, y: 13, rotate: -3 },
    { x: 18, y: 32, rotate: 10 },
    { x: 42, y: 29, rotate: -11 },
    { x: 66, y: 27, rotate: 5 },
    { x: 10, y: 49, rotate: 4 },
    { x: 34, y: 46, rotate: -6 },
    { x: 58, y: 43, rotate: 9 }
  ];
  const SELF_DRAG_THRESHOLD = 8;
  const MALE_AUDIO_OVERRIDES = {
    'arrive-mart-start-shopping-20260510.wav': 'arrive-mart-start-shopping-20260510-m.wav',
    'budget-over-remove-item-20260510.wav': 'budget-over-remove-item-20260510-m.wav',
    'child-confused-20260510.wav': 'child-confused-20260510-m.wav',
    'mom-i-finished-shopping-20260510.wav': 'mom-i-finished-shopping-20260510-m.wav',
    'mom-i-finished-shopping-fail-20260510.wav': 'mom-i-finished-shopping-fail-20260510-m.wav',
    'mom-praise-success-20260510.wav': 'mom-praise-success-20260510-m.wav',
    'no-items-purchased-20260513.wav': 'no-items-purchased-20260513-m.wav',
    'thank-you-mom-20260510.wav': 'thank-you-mom-20260510-m.wav',
    'yes-mom-20260510.wav': 'yes-mom-20260510-m.wav'
  };
  const STAGES = {
    'visible-list': {
      id: 'visible-list',
      label: '1단계',
      title: '엄마 심부름을 가요!',
      helper: '심부름 목록을 보며 물건과 수량을 맞춰 담아요.',
      showList: true
    },
    'teacher-memory': {
      id: 'teacher-memory',
      label: '2단계',
      title: '듣고 기억해서 장보기',
      helper: '선생님이 알려준 물건을 기억하고 목록 없이 장을 봐요.',
      showList: false
    },
    'budget-shopping': {
      id: 'budget-shopping',
      label: '3단계',
      title: '금액에 맞게 물건을 사요!',
      helper: '가진 돈 안에서 물건을 골라 거스름돈을 확인해요.',
      showList: false,
      budgetMode: true
    }
  };

  const state = {
    screen: 'stage',
    stage: null,
    products: [],
    productsById: new Map(),
    sectionId: '',
    shelfIndex: 0,
    target: {},
    cart: {},
    hintVisible: false,
    budgetAmount: 0,
    budgetLocked: false,
    startedAtMs: 0,
    savedRunId: '',
    storyAudio: null,
    storyAudioToken: 0,
    characterGender: '',
    pendingStageId: '',
    pendingReceiptResult: null,
    selfCheckout: {
      items: [],
      scanned: [],
      bag: null,
      phone: '',
      paymentReady: false,
      scanning: false
    }
  };

  const els = {};
  let selfDragState = null;

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

  function formatWon(value) {
    return `${Number(value || 0).toLocaleString('ko-KR')}원`;
  }

  function formatReceiptNumber(value) {
    return Number(value || 0).toLocaleString('ko-KR');
  }

  function displayWidth(value) {
    return Array.from(String(value == null ? '' : value)).reduce((width, char) => width + (/[^\x00-\xff]/.test(char) ? 2 : 1), 0);
  }

  function padDisplay(value, length, align) {
    const text = String(value == null ? '' : value);
    const spaces = Math.max(0, length - displayWidth(text));
    return align === 'left' ? `${text}${' '.repeat(spaces)}` : `${' '.repeat(spaces)}${text}`;
  }

  function formatReceiptDate(date) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function storyAudioUrl(fileName) {
    const selectedFileName = state.characterGender === 'male'
      ? (MALE_AUDIO_OVERRIDES[fileName] || fileName)
      : fileName;
    return `${SOUND_BASE}${encodeURIComponent(selectedFileName)}`;
  }

  function stopStoryAudio() {
    state.storyAudioToken += 1;
    if (state.storyAudio) {
      state.storyAudio.pause();
      state.storyAudio.currentTime = 0;
      state.storyAudio = null;
    }
  }

  function playStoryAudioSequence(kind) {
    const files = STORY_AUDIO_FILES[kind] || [];
    const token = state.storyAudioToken + 1;
    state.storyAudioToken = token;
    let index = 0;
    const playNext = () => {
      if (token !== state.storyAudioToken || index >= files.length) return;
      const audio = new Audio(storyAudioUrl(files[index]));
      state.storyAudio = audio;
      index += 1;
      audio.addEventListener('ended', playNext, { once: true });
      audio.addEventListener('error', playNext, { once: true });
      audio.play().catch(() => {});
    };
    playNext();
  }

  function playBlockingAudio(fileName, onDone) {
    stopStoryAudio();
    state.budgetLocked = true;
    if (els.budgetTalk) els.budgetTalk.hidden = false;
    renderTaskPanels();
    const audio = new Audio(storyAudioUrl(fileName));
    state.storyAudio = audio;
    const finish = () => {
      state.budgetLocked = false;
      state.storyAudio = null;
      if (els.budgetTalk) els.budgetTalk.hidden = true;
      renderTaskPanels();
      if (typeof onDone === 'function') onDone();
    };
    audio.addEventListener('ended', finish, { once: true });
    audio.addEventListener('error', finish, { once: true });
    audio.play().catch(finish);
  }

  function playPromptAudio(fileName) {
    stopStoryAudio();
    const audio = new Audio(storyAudioUrl(fileName));
    state.storyAudio = audio;
    const finish = () => {
      if (state.storyAudio === audio) state.storyAudio = null;
    };
    audio.addEventListener('ended', finish, { once: true });
    audio.addEventListener('error', finish, { once: true });
    audio.play().catch(finish);
  }

  function playScanBeep() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
    } catch (_error) {}
  }

  function showSelfToast(message) {
    let toast = document.querySelector('.mart-self-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'mart-self-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('is-visible');
    window.clearTimeout(showSelfToast.timer);
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
      showSelfToast.timer = window.setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 1300);
    });
  }

  function selfLayoutVars(index) {
    const item = SELF_PRODUCT_LAYOUT[index % SELF_PRODUCT_LAYOUT.length];
    return `--self-x:${item.x}%; --self-y:${item.y}%; --self-rotate:${item.rotate}deg; --self-index:${index}`;
  }

  function storyImage(kind) {
    const gender = state.characterGender === 'male' ? 'male' : 'female';
    return (STORY_IMAGES[gender] && STORY_IMAGES[gender][kind]) || STORY_IMAGES.female[kind];
  }

  function shelfVisibleCount() {
    return window.matchMedia('(min-width: 768px)').matches ? 4 : 3;
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function buildProducts() {
    const products = [];
    SECTIONS.forEach((section, sectionIndex) => {
      PRODUCT_NAMES[section.id].forEach((name, itemIndex) => {
        const shelf = Math.floor(itemIndex / 6);
        const price = 900 + sectionIndex * 180 + itemIndex * 170 + (itemIndex % 3) * 300;
        products.push({
          id: `${section.id}-${String(itemIndex + 1).padStart(2, '0')}`,
          sectionId: section.id,
          sectionTitle: section.title,
          sectionImageSrc: section.imageSrc,
          shelf,
          name,
          imageSrc: PRODUCT_IMAGE_SLUGS[name] ? `/playlab/images/supermarket/${PRODUCT_IMAGE_SLUGS[name]}.webp` : '',
          price: PRODUCT_PRICES[name] || price,
          color: PRODUCT_COLORS[(sectionIndex + itemIndex) % PRODUCT_COLORS.length]
        });
      });
    });
    state.products = products;
    state.productsById = new Map(products.map((item) => [item.id, item]));
  }

  function targetEntries() {
    return Object.entries(state.target).map(([id, qty]) => ({ product: state.productsById.get(id), qty })).filter((item) => item.product);
  }

  function cartEntries() {
    return Object.entries(state.cart).map(([id, qty]) => ({ product: state.productsById.get(id), qty })).filter((item) => item.product);
  }

  function expandedCartEntries() {
    return cartEntries().flatMap(({ product, qty }) => Array.from({ length: qty }, (_item, index) => ({
      key: `${product.id}-${index}`,
      product
    })));
  }

  function selfCheckoutTotal() {
    const bagPrice = state.selfCheckout.bag ? state.selfCheckout.bag.price : 0;
    return totalPrice() + bagPrice;
  }

  function totalPrice() {
    return cartEntries().reduce((sum, item) => sum + item.product.price * item.qty, 0);
  }

  function isBudgetStage() {
    return Boolean(state.stage && state.stage.budgetMode);
  }

  function randomBudgetAmount() {
    return (1 + Math.floor(Math.random() * 8)) * 10000;
  }

  function setScreen(name) {
    state.screen = name;
    ['stageView', 'errandIntroView', 'teacherView', 'mapView', 'cornerView', 'counterChoiceView', 'selfCheckoutView', 'checkoutView', 'receiptView', 'errandResultView'].forEach((id) => {
      const element = els[id];
      if (element) element.classList.toggle('is-active', id === `${name}View`);
    });
    requestAnimationFrame(() => {
      const main = document.querySelector('.shell-main');
      if (main && typeof main.scrollTo === 'function') main.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
    els.martStageButton.classList.toggle('shell-hidden', name === 'stage');
    els.martStageChip.classList.toggle('shell-hidden', name === 'stage');
    els.martStageChip.textContent = state.stage ? `${state.stage.label} · ${state.stage.title}` : '스테이지 선택';
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'receipt', {
        title: () => `대형마트 심부름-${state.stage ? state.stage.title : '리포트'}`
      });
    }
  }

  function generateVisibleTarget() {
    const pool = shuffle(state.products);
    const count = 5 + Math.floor(Math.random() * 3);
    const selected = pool.slice(0, count);
    return selected.reduce((acc, product, index) => {
      acc[product.id] = index % 3 === 0 ? 2 : 1;
      return acc;
    }, {});
  }

  function startStage(stageId) {
    stopStoryAudio();
    const stage = STAGES[stageId] || STAGES['visible-list'];
    state.stage = stage;
    state.cart = {};
    state.target = {};
    state.sectionId = '';
    state.shelfIndex = 0;
    state.hintVisible = false;
    state.budgetAmount = stage.budgetMode ? randomBudgetAmount() : 0;
    state.budgetLocked = false;
    state.selfCheckout = { items: [], scanned: [], bag: null, phone: '', paymentReady: false };
    state.pendingReceiptResult = null;
    if (els.budgetTalk) els.budgetTalk.hidden = true;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    if (stage.id === 'teacher-memory') {
      renderTeacherSetup();
      setScreen('teacher');
      return;
    }
    if (stage.budgetMode) {
      renderMap();
      setScreen('map');
      return;
    }
    if (els.errandIntroImage) {
      els.errandIntroImage.src = storyImage('intro');
    }
    setScreen('errandIntro');
    playStoryAudioSequence('intro');
  }

  function beginVisibleErrand() {
    stopStoryAudio();
    state.target = generateVisibleTarget();
    state.startedAtMs = Date.now();
    renderMap();
    setScreen('map');
    openErrandListModal();
  }

  function resetToStage() {
    stopStoryAudio();
    state.stage = null;
    state.cart = {};
    state.target = {};
    state.budgetAmount = 0;
    state.budgetLocked = false;
    state.characterGender = '';
    state.pendingStageId = '';
    state.selfCheckout = { items: [], scanned: [], bag: null, phone: '', paymentReady: false };
    if (els.budgetTalk) els.budgetTalk.hidden = true;
    setScreen('stage');
  }

  function requestStageStart(stageId) {
    state.pendingStageId = stageId || 'visible-list';
    openGenderModal();
  }

  function openStageModal() {
    els.stageModal.classList.add('is-open');
    els.stageModal.setAttribute('aria-hidden', 'false');
  }

  function closeStageModal() {
    els.stageModal.classList.remove('is-open');
    els.stageModal.setAttribute('aria-hidden', 'true');
  }

  function openGenderModal() {
    els.genderModal.classList.add('is-open');
    els.genderModal.setAttribute('aria-hidden', 'false');
  }

  function closeGenderModal() {
    els.genderModal.classList.remove('is-open');
    els.genderModal.setAttribute('aria-hidden', 'true');
  }

  function chooseGender(gender) {
    state.characterGender = gender === 'male' ? 'male' : 'female';
    const stageId = state.pendingStageId || 'visible-list';
    state.pendingStageId = '';
    closeGenderModal();
    startStage(stageId);
  }

  function openErrandListModal() {
    if (!els.errandListModal || !els.errandListModalBody) return;
    els.errandListModalBody.innerHTML = buildListPreviewHtml();
    els.errandListModal.classList.add('is-open');
    els.errandListModal.setAttribute('aria-hidden', 'false');
  }

  function closeErrandListModal() {
    if (!els.errandListModal) return;
    els.errandListModal.classList.remove('is-open');
    els.errandListModal.setAttribute('aria-hidden', 'true');
  }

  function productCard(product, options) {
    const qty = options && options.qty ? Number(options.qty) : 0;
    const showPrice = !options || options.showPrice !== false;
    const qtyBadge = qty > 0 ? `<span class="mart-product-qty">×${qty}</span>` : '';
    const displayImageSrc = product.imageSrc || product.sectionImageSrc || '';
    const media = displayImageSrc
      ? `<img class="mart-product-image ${product.imageSrc ? '' : 'is-section-fallback'}" src="${escapeHtml(displayImageSrc)}" alt="${escapeHtml(product.imageSrc ? product.name : product.sectionTitle)}">`
      : `<span class="mart-product-initial">${escapeHtml(product.name.slice(0, 2))}</span>`;
    return `
      <button type="button" class="mart-product-card ${displayImageSrc ? 'has-image' : ''}" data-product-id="${escapeHtml(product.id)}" style="--product-color:${escapeHtml(product.color)}">
        ${qtyBadge}
        <span class="mart-product-box" aria-hidden="true">
          <span class="mart-product-shine"></span>
          ${media}
        </span>
        <span class="mart-product-label">
          <span class="mart-product-name">${escapeHtml(product.name)}</span>
          ${showPrice ? `<span class="mart-product-price">${escapeHtml(formatWon(product.price))}</span>` : ''}
        </span>
      </button>
    `;
  }

  function renderMap() {
    els.martMap.innerHTML = `
      ${SECTIONS.map((section) => `
      <button
        type="button"
        class="mart-zone"
        data-section-id="${escapeHtml(section.id)}"
        style="--zone-color:${escapeHtml(section.color)}; --zone-x:${section.x}%; --zone-y:${section.y}%; --zone-w:${section.w}%; --zone-h:${section.h}%"
      >
        <img class="mart-zone-label" src="${escapeHtml(section.labelSrc)}" alt="${escapeHtml(section.title)}">
      </button>
    `).join('')}
      <button
        type="button"
        class="mart-zone is-checkout"
        data-action="checkout"
        style="--zone-color:${escapeHtml(CHECKOUT_ZONE.color)}; --zone-x:${CHECKOUT_ZONE.x}%; --zone-y:${CHECKOUT_ZONE.y}%; --zone-w:${CHECKOUT_ZONE.w}%; --zone-h:${CHECKOUT_ZONE.h}%"
      >
        <img class="mart-zone-label" src="${escapeHtml(CHECKOUT_ZONE.labelSrc)}" alt="${escapeHtml(CHECKOUT_ZONE.title)}">
      </button>
    `;
    els.martMap.querySelectorAll('[data-section-id]').forEach((button) => {
      button.addEventListener('click', () => openSection(button.dataset.sectionId));
    });
    const checkoutZone = els.martMap.querySelector('[data-action="checkout"]');
    if (checkoutZone) checkoutZone.addEventListener('click', openCounterChoice);
    renderTaskPanels();
    renderCartDocks();
  }

  function renderTaskPanels() {
    const html = buildTaskPanelHtml();
    els.taskPanel.innerHTML = html;
    els.cornerTaskPanel.innerHTML = html;
    bindBudgetRemoveButtons();
    renderMapHintAction();
  }

  function bindBudgetRemoveButtons() {
    [els.taskPanel, els.cornerTaskPanel].forEach((panel) => {
      panel.querySelectorAll('[data-budget-remove]').forEach((button) => {
        button.addEventListener('click', () => removeProduct(button.dataset.budgetRemove));
      });
      panel.querySelectorAll('[data-budget-scroll]').forEach((button) => {
        button.addEventListener('click', () => {
          const wrap = button.closest('.mart-budget-cart-wrap');
          const list = wrap ? wrap.querySelector('.mart-budget-cart') : null;
          if (!list) return;
          const direction = button.dataset.budgetScroll === 'up' ? -1 : 1;
          list.scrollBy({ top: direction * Math.max(92, list.clientHeight * 0.72), behavior: 'smooth' });
          window.setTimeout(() => updateBudgetScrollButtons(wrap), 260);
        });
      });
      panel.querySelectorAll('.mart-budget-cart-wrap').forEach((wrap) => {
        const list = wrap.querySelector('.mart-budget-cart');
        if (!list) return;
        list.addEventListener('scroll', () => updateBudgetScrollButtons(wrap), { passive: true });
        requestAnimationFrame(() => updateBudgetScrollButtons(wrap));
      });
    });
  }

  function updateBudgetScrollButtons(wrap) {
    if (!wrap) return;
    const list = wrap.querySelector('.mart-budget-cart');
    if (!list) return;
    const hasOverflow = list.scrollHeight > list.clientHeight + 2;
    const atTop = list.scrollTop <= 2;
    const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
    wrap.classList.toggle('has-overflow', hasOverflow);
    wrap.classList.toggle('at-top', !hasOverflow || atTop);
    wrap.classList.toggle('at-bottom', !hasOverflow || atBottom);
  }

  function buildTaskPanelHtml() {
    if (!state.stage) return '';
    if (isBudgetStage()) return buildBudgetPanelHtml();
    if (!state.stage.showList) {
      if (!state.hintVisible) {
        return `
          <div class="mart-memory-panel">
            <strong>기억해서 장보기</strong>
            <span>필요할 때 아래 힌트 버튼으로 목록을 확인해요.</span>
          </div>
        `;
      }
      return buildVisibleListHtml();
    }
    return buildVisibleListHtml();
  }

  function renderMapHintAction() {
    const shouldShow = Boolean(state.stage && !state.stage.showList && !state.stage.budgetMode);
    [els.goCheckoutButton, els.cornerHintButton].forEach((button) => {
      if (!button) return;
      button.hidden = !shouldShow;
      if (!shouldShow) {
        button.removeAttribute('aria-expanded');
        button.classList.remove('is-open');
        return;
      }
      button.textContent = state.hintVisible ? '힌트닫기' : '힌트보기';
      button.setAttribute('aria-expanded', String(state.hintVisible));
      button.classList.toggle('is-open', state.hintVisible);
    });
  }

  function toggleHint() {
    if (!state.stage || state.stage.showList) return;
    state.hintVisible = !state.hintVisible;
    renderTaskPanels();
  }

  function buildVisibleListHtml() {
    const list = targetEntries().map(({ product, qty }) => {
      const current = state.cart[product.id] || 0;
      const done = current === qty;
      const over = current > qty;
      return `
        <li class="${done ? 'is-done' : ''} ${over ? 'is-over' : ''}">
          <span>${escapeHtml(product.name)}</span>
          <span>${current}/${qty}개</span>
        </li>
      `;
    }).join('');
    return `
      <h3>심부름 목록</h3>
      <p>수량을 맞게 담으면 줄이 그어져요.</p>
      <ul class="mart-list">${list}</ul>
    `;
  }

  function buildBudgetPanelHtml() {
    const entries = cartEntries();
    const total = totalPrice();
    const remaining = state.budgetAmount - total;
    const isOver = remaining < 0;
    const rows = entries.length
      ? entries.map(({ product, qty }) => `
        <li>
          <span>${escapeHtml(product.name)}</span>
          <small>${qty}개 × ${escapeHtml(formatWon(product.price))}</small>
          <strong>${escapeHtml(formatWon(product.price * qty))}</strong>
          <button type="button" data-budget-remove="${escapeHtml(product.id)}">-1개</button>
        </li>
      `).join('')
      : '<li class="is-empty"><span>아직 담은 물건이 없어요.</span></li>';
    return `
      <div class="mart-budget-panel ${isOver ? 'is-over' : ''} ${state.budgetLocked ? 'is-locked' : ''}">
        <h3>가진 돈</h3>
        <strong class="mart-budget-limit">${escapeHtml(formatWon(state.budgetAmount))}</strong>
        <div class="mart-budget-cart-wrap at-top at-bottom">
          <button type="button" class="mart-budget-scroll is-up" data-budget-scroll="up" aria-label="담은 물건 목록 위로 보기">▲</button>
          <ul class="mart-budget-cart">${rows}</ul>
          <button type="button" class="mart-budget-scroll is-down" data-budget-scroll="down" aria-label="담은 물건 목록 아래로 보기">▼</button>
        </div>
        <div class="mart-budget-total">
          <span>담은 금액</span>
          <strong>${escapeHtml(formatWon(total))}</strong>
        </div>
        <div class="mart-budget-balance">
          <span>${isOver ? '금액 오바' : '남은 금액'}</span>
          <strong>${escapeHtml(formatWon(Math.abs(remaining)))}</strong>
        </div>
        ${state.budgetLocked ? '<p class="mart-budget-warning">내가 가진 돈보다 더 많이 나온거 같아. 물건을 빼야겠어.</p>' : '<p>장바구니에 담은 물건을 다시 누르면 1개씩 빠져요.</p>'}
      </div>
    `;
  }

  function buildListPreviewHtml() {
    const list = targetEntries().map(({ product, qty }) => {
      const current = state.cart[product.id] || 0;
      const done = current === qty;
      const over = current > qty;
      const image = product.imageSrc || product.sectionImageSrc || '';
      return `
        <li class="${done ? 'is-done' : ''} ${over ? 'is-over' : ''}">
          ${image ? `<img src="${escapeHtml(image)}" alt="">` : '<span class="mart-list-preview-dot" aria-hidden="true"></span>'}
          <strong>${escapeHtml(product.name)}</strong>
          <span>${current}/${qty}개</span>
        </li>
      `;
    }).join('');
    return `<ul class="mart-list-preview">${list}</ul>`;
  }

  function renderCartDocks() {
    const entries = cartEntries();
    const html = entries.length
      ? entries.map(({ product, qty }) => `
        <button type="button" class="mart-cart-chip" data-cart-remove="${escapeHtml(product.id)}" aria-label="${escapeHtml(product.name)} 1개 빼기">
          ${product.imageSrc || product.sectionImageSrc ? `<img class="mart-cart-chip-image" src="${escapeHtml(product.imageSrc || product.sectionImageSrc)}" alt="">` : ''}
          ${escapeHtml(product.name)} ×${qty}
        </button>
      `).join('')
      : '<span class="mart-empty">아직 장바구니가 비어 있어요.</span>';
    els.cartDock.innerHTML = html;
    els.cornerCartDock.innerHTML = html;
    [els.cartDock, els.cornerCartDock].forEach((dock) => {
      dock.querySelectorAll('[data-cart-remove]').forEach((button) => {
        button.addEventListener('click', () => removeProduct(button.dataset.cartRemove));
      });
    });
    updateCartDockControls();
  }

  function activeCartDock() {
    return state.screen === 'corner' ? els.cornerCartDock : els.cartDock;
  }

  function cartDockRows() {
    return [els.cartDock, els.cornerCartDock]
      .filter(Boolean)
      .map((dock) => ({ dock, row: dock.closest('.mart-cart-row') }))
      .filter((item) => item.row);
  }

  function updateCartDockControls() {
    cartDockRows().forEach(({ dock, row }) => {
      const hasOverflow = dock.scrollWidth > dock.clientWidth + 2;
      const atStart = dock.scrollLeft <= 2;
      const atEnd = dock.scrollLeft + dock.clientWidth >= dock.scrollWidth - 2;
      row.classList.toggle('has-overflow', hasOverflow);
      row.classList.toggle('at-start', !hasOverflow || atStart);
      row.classList.toggle('at-end', !hasOverflow || atEnd);
    });
  }

  function scrollCartDock(button) {
    const row = button.closest('.mart-cart-row');
    const dock = row ? row.querySelector('.mart-cart-dock') : null;
    if (!dock) return;
    const direction = button.dataset.cartNav === 'left' ? -1 : 1;
    dock.scrollBy({ left: direction * Math.max(180, dock.clientWidth * 0.72), behavior: 'smooth' });
    window.setTimeout(updateCartDockControls, 240);
  }

  function showCartDelta(productId, deltaText) {
    const dock = activeCartDock();
    if (!dock) return;
    const chip = Array.from(dock.querySelectorAll('[data-cart-remove]'))
      .find((node) => node.getAttribute('data-cart-remove') === String(productId));
    const row = dock.closest('.mart-cart-row');
    const target = row || dock;
    const badge = document.createElement('span');
    badge.className = `mart-cart-delta ${deltaText.startsWith('-') ? 'is-minus' : 'is-plus'}`;
    badge.textContent = deltaText;
    if (row && chip) {
      const rowBox = row.getBoundingClientRect();
      const chipBox = chip.getBoundingClientRect();
      const center = chipBox.left - rowBox.left + chipBox.width / 2;
      badge.style.left = `${Math.min(Math.max(center, 30), rowBox.width - 30)}px`;
    }
    target.appendChild(badge);
    if (chip) {
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    window.setTimeout(updateCartDockControls, 260);
    badge.addEventListener('animationend', () => badge.remove(), { once: true });
  }

  function openSection(sectionId) {
    if (state.budgetLocked) return;
    state.sectionId = sectionId;
    state.shelfIndex = 0;
    renderCorner();
    setScreen('corner');
  }

  function renderCorner() {
    const section = SECTIONS.find((item) => item.id === state.sectionId) || SECTIONS[0];
    const sectionProducts = state.products.filter((item) => item.sectionId === section.id);
    const visibleCount = shelfVisibleCount();
    const totalShelves = Math.max(1, Math.ceil(sectionProducts.length / visibleCount));
    state.shelfIndex = Math.min(state.shelfIndex, totalShelves - 1);
    const products = sectionProducts.slice(state.shelfIndex * visibleCount, (state.shelfIndex + 1) * visibleCount);
    els.cornerIcon.textContent = '';
    els.cornerTitle.textContent = section.title;
    els.shelfLabel.textContent = `진열대 ${state.shelfIndex + 1} / ${totalShelves}`;
    els.shelfProducts.style.setProperty('--shelf-visible-count', String(visibleCount));
    els.shelfProducts.innerHTML = products.map((product) => productCard(product)).join('');
    els.shelfProducts.querySelectorAll('[data-product-id]').forEach((button) => {
      button.addEventListener('click', () => addProduct(button.dataset.productId, button));
    });
    els.prevShelfButton.disabled = state.shelfIndex <= 0;
    els.nextShelfButton.disabled = state.shelfIndex >= totalShelves - 1;
    renderTaskPanels();
    renderCartDocks();
  }

  function animateProductToCart(sourceElement) {
    if (!sourceElement) return;
    const sourceBox = sourceElement.querySelector('.mart-product-image') || sourceElement.querySelector('.mart-product-box') || sourceElement;
    const targetDock = state.screen === 'corner' ? els.cornerCartDock : els.cartDock;
    if (!targetDock || typeof sourceBox.getBoundingClientRect !== 'function') return;
    const from = sourceBox.getBoundingClientRect();
    const to = targetDock.getBoundingClientRect();
    if (!from.width || !from.height || !to.width || !to.height) return;

    sourceElement.classList.remove('is-adding');
    void sourceElement.offsetWidth;
    sourceElement.classList.add('is-adding');
    window.setTimeout(() => sourceElement.classList.remove('is-adding'), 360);

    const flyItem = sourceBox.cloneNode(true);
    flyItem.classList.add('mart-fly-item');
    flyItem.style.left = `${from.left}px`;
    flyItem.style.top = `${from.top}px`;
    flyItem.style.width = `${from.width}px`;
    flyItem.style.height = `${from.height}px`;
    document.body.appendChild(flyItem);

    const targetX = to.left + Math.min(to.width * 0.5, Math.max(36, to.width - 36)) - from.left - from.width / 2;
    const targetY = to.top + to.height * 0.55 - from.top - from.height / 2;
    const midY = Math.max(34, targetY * 0.72);
    const animation = flyItem.animate([
      { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
      { transform: `translate3d(${targetX * 0.32}px, ${midY}px, 0) scale(0.82)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate3d(${targetX}px, ${targetY}px, 0) scale(0.34)`, opacity: 0 }
    ], {
      duration: 620,
      easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)'
    });
    targetDock.classList.remove('is-catching');
    void targetDock.offsetWidth;
    window.setTimeout(() => targetDock.classList.add('is-catching'), 360);
    window.setTimeout(() => targetDock.classList.remove('is-catching'), 760);
    animation.finished.finally(() => flyItem.remove()).catch(() => flyItem.remove());
  }

  function addProduct(productId, sourceElement) {
    if (state.budgetLocked) return;
    const product = state.productsById.get(productId);
    if (!product) return;
    animateProductToCart(sourceElement);
    state.cart[productId] = (state.cart[productId] || 0) + 1;
    renderTaskPanels();
    renderCartDocks();
    showCartDelta(productId, '+1');
  }

  function removeProduct(productId) {
    if (state.budgetLocked || !state.cart[productId]) return;
    state.cart[productId] -= 1;
    if (state.cart[productId] <= 0) delete state.cart[productId];
    renderTaskPanels();
    renderCartDocks();
    showCartDelta(productId, '-1');
  }

  function renderTeacherSetup() {
    els.teacherProductGrid.innerHTML = state.products.map((product) => productCard(product, {
      qty: state.target[product.id] || 0,
      showPrice: false,
    })).join('');
    els.teacherProductGrid.querySelectorAll('[data-product-id]').forEach((button) => {
      button.addEventListener('click', () => teacherAdd(button.dataset.productId));
    });
    renderTeacherBasket();
  }

  function renderTeacherBasket() {
    const entries = targetEntries();
    els.teacherBasket.innerHTML = entries.length
      ? entries.map(({ product, qty }) => `<button type="button" class="mart-teacher-chip" data-teacher-remove="${escapeHtml(product.id)}">${escapeHtml(product.name)} ×${qty}</button>`).join('')
      : '<span class="mart-empty">선택한 심부름 물건이 여기에 보여요.</span>';
    els.teacherStartButton.disabled = entries.length === 0;
  }

  function teacherAdd(productId) {
    state.target[productId] = (state.target[productId] || 0) + 1;
    renderTeacherSetup();
  }

  function teacherRemove(productId) {
    if (!state.target[productId]) return;
    state.target[productId] -= 1;
    if (state.target[productId] <= 0) delete state.target[productId];
    renderTeacherSetup();
  }

  function startTeacherErrand() {
    state.cart = {};
    state.hintVisible = false;
    state.startedAtMs = Date.now();
    renderMap();
    setScreen('map');
    openErrandListModal();
  }

  function openCounterChoice() {
    if (!cartEntries().length) {
      playPromptAudio(NO_ITEMS_AUDIO);
      return;
    }
    if (isBudgetStage() && totalPrice() > state.budgetAmount) {
      playBlockingAudio(BUDGET_OVER_AUDIO);
      return;
    }
    setScreen('counterChoice');
    playPromptAudio(COUNTER_CHOICE_AUDIO);
  }

  function resetSelfCheckout() {
    stopStoryAudio();
    const items = expandedCartEntries();
    state.selfCheckout = {
      items,
      scanned: [],
      bag: null,
      phone: '',
      paymentReady: false,
      scanning: false,
      scanStarted: false
    };
    if (els.selfStartScreen) els.selfStartScreen.hidden = false;
    if (els.selfScanScreen) els.selfScanScreen.hidden = true;
    if (els.selfCardAnimation) els.selfCardAnimation.hidden = true;
    if (els.selfReceiptSlip) els.selfReceiptSlip.hidden = true;
    if (els.selfReceiptPreview) els.selfReceiptPreview.hidden = true;
    if (els.selfPayButton) {
      els.selfPayButton.disabled = true;
      els.selfPayButton.textContent = '결제하기';
      els.selfPayButton.dataset.selfPayState = 'scan';
    }
    renderSelfCheckout();
  }

  function openSelfCheckout() {
    resetSelfCheckout();
    setScreen('selfCheckout');
  }

  function renderSelfCheckout() {
    const scannedKeys = new Set(state.selfCheckout.scanned);
    const remaining = state.selfCheckout.items.filter((item) => !scannedKeys.has(item.key));
    const scanned = state.selfCheckout.items.filter((item) => scannedKeys.has(item.key));
    const productButton = (item, index, extraClass = '') => `
      <button type="button" class="mart-self-product ${extraClass}" data-self-item-key="${escapeHtml(item.key)}" style="${selfLayoutVars(index)}" draggable="false">
        ${item.product.imageSrc ? `<img src="${escapeHtml(item.product.imageSrc)}" alt="">` : ''}
        <span>${escapeHtml(item.product.name)}</span>
      </button>
    `;
    els.selfBeforeShelf.innerHTML = remaining.length
      ? remaining.map((item, index) => productButton(item, index)).join('')
      : '<p class="mart-self-empty">스캔할 상품이 없습니다.</p>';
    els.selfAfterShelf.innerHTML = scanned.length
      ? scanned.map((item, index) => productButton(item, index, 'is-scanned')).join('')
      : '<p class="mart-self-empty">스캔 후 상품</p>';

    const bag = state.selfCheckout.bag;
    const bagLine = bag ? `
      <div class="mart-self-scan-row is-bag">
        <span>${escapeHtml(bag.name)}</span>
        <strong>${escapeHtml(formatWon(bag.price))}</strong>
      </div>
    ` : '';
    els.selfScanList.innerHTML = `
      ${bagLine}
      ${scanned.map((item) => `
        <div class="mart-self-scan-row">
          <span>${escapeHtml(item.product.name)}</span>
          <strong>${escapeHtml(formatWon(item.product.price))}</strong>
        </div>
      `).join('')}
    `;
    if (els.selfCheckoutTotalBar) {
      els.selfCheckoutTotalBar.innerHTML = `
        <span>전체금액</span>
        <strong>${escapeHtml(formatWon(selfCheckoutTotal()))}</strong>
      `;
    }
    if (els.selfBagStatus) {
      els.selfBagStatus.textContent = bag
        ? `${bag.name} ${formatWon(bag.price)} 선택됨`
        : '선택한 장바구니 없음';
    }
    document.querySelectorAll('[data-bag-choice]').forEach((button) => {
      button.classList.toggle('is-selected', !!bag && button.dataset.bagChoice === bag.id);
    });

    const allScanned = state.selfCheckout.items.length > 0 && scanned.length === state.selfCheckout.items.length;
    els.selfPayButton.disabled = !allScanned;
    els.selfScreenTitle.textContent = allScanned ? '상품 스캔 완료' : '상품을 스캔해주세요';
    els.selfScreenHint.textContent = allScanned
      ? '결제하기를 눌러 포인트 적립과 카드 결제를 진행해주세요.'
      : '스캔 완료 후, 상품을 오른쪽에 올려주세요.';

    els.selfBeforeShelf.querySelectorAll('[data-self-item-key]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.selfDragMoved === 'true') {
          button.dataset.selfDragMoved = 'false';
          return;
        }
        scanSelfItem(button.dataset.selfItemKey, button);
      });
      button.addEventListener('pointerdown', (event) => beginSelfProductDrag(event, button));
    });
  }

  function startSelfScanning() {
    state.selfCheckout.scanStarted = true;
    els.selfStartScreen.hidden = true;
    els.selfScanScreen.hidden = false;
    renderSelfCheckout();
  }

  function chooseBag(button) {
    state.selfCheckout.bag = {
      id: button.dataset.bagChoice || 'basket',
      name: button.dataset.bagName || '장바구니',
      price: Number(button.dataset.bagPrice || 0)
    };
    renderSelfCheckout();
  }

  function flySelfProductToScanner(sourceElement, done) {
    const productImage = sourceElement && sourceElement.querySelector('img');
    const scanner = els.selfScannerDrop;
    if (!productImage || !scanner) {
      done();
      return;
    }
    const from = productImage.getBoundingClientRect();
    const to = scanner.getBoundingClientRect();
    const flyer = productImage.cloneNode(true);
    flyer.className = 'mart-self-scan-flyer';
    flyer.style.left = `${from.left}px`;
    flyer.style.top = `${from.top}px`;
    flyer.style.width = `${from.width}px`;
    flyer.style.height = `${from.height}px`;
    flyer.style.setProperty('--scan-dx', `${to.left + to.width / 2 - from.left - from.width / 2}px`);
    flyer.style.setProperty('--scan-dy', `${to.top + to.height / 2 - from.top - from.height / 2}px`);
    document.body.appendChild(flyer);
    flyer.addEventListener('animationend', () => {
      flyer.remove();
      done();
    }, { once: true });
  }

  function beginSelfProductDrag(event, sourceElement) {
    if (event.button !== undefined && event.button !== 0) return;
    if (!sourceElement || sourceElement.classList.contains('is-scanned')) return;
    if (!state.selfCheckout.scanStarted) {
      showSelfToast('스캔 시작하기 버튼을 클릭하세요.');
      return;
    }
    if (state.selfCheckout.scanning) return;
    const productImage = sourceElement.querySelector('img');
    if (!productImage) return;
    selfDragState = {
      pointerId: event.pointerId,
      sourceElement,
      itemKey: sourceElement.dataset.selfItemKey,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      flyer: null
    };
    sourceElement.setPointerCapture?.(event.pointerId);
    sourceElement.addEventListener('pointermove', moveSelfProductDrag);
    sourceElement.addEventListener('pointerup', endSelfProductDrag);
    sourceElement.addEventListener('pointercancel', cancelSelfProductDrag);
  }

  function createSelfDragFlyer(sourceElement, x, y) {
    const productImage = sourceElement && sourceElement.querySelector('img');
    if (!productImage) return null;
    const rect = productImage.getBoundingClientRect();
    const flyer = productImage.cloneNode(true);
    flyer.className = 'mart-self-drag-flyer';
    flyer.style.width = `${rect.width}px`;
    flyer.style.height = `${rect.height}px`;
    document.body.appendChild(flyer);
    moveSelfDragFlyer(flyer, x, y);
    return flyer;
  }

  function moveSelfDragFlyer(flyer, x, y) {
    if (!flyer) return;
    flyer.style.left = `${x}px`;
    flyer.style.top = `${y}px`;
  }

  function moveSelfProductDrag(event) {
    if (!selfDragState || event.pointerId !== selfDragState.pointerId) return;
    const distance = Math.hypot(event.clientX - selfDragState.startX, event.clientY - selfDragState.startY);
    if (!selfDragState.moved && distance < SELF_DRAG_THRESHOLD) return;
    event.preventDefault();
    if (!selfDragState.moved) {
      selfDragState.moved = true;
      selfDragState.sourceElement.dataset.selfDragMoved = 'true';
      selfDragState.sourceElement.classList.add('is-moving');
      selfDragState.flyer = createSelfDragFlyer(selfDragState.sourceElement, event.clientX, event.clientY);
    }
    moveSelfDragFlyer(selfDragState.flyer, event.clientX, event.clientY);
  }

  function scannerContainsPoint(x, y) {
    if (!els.selfScannerDrop) return false;
    const rect = els.selfScannerDrop.getBoundingClientRect();
    const padX = rect.width * 1.8;
    const padY = rect.height * 1.8;
    return x >= rect.left - padX && x <= rect.right + padX && y >= rect.top - padY && y <= rect.bottom + padY;
  }

  function clearSelfDragState() {
    if (!selfDragState) return;
    const { sourceElement, pointerId, flyer } = selfDragState;
    sourceElement.removeEventListener('pointermove', moveSelfProductDrag);
    sourceElement.removeEventListener('pointerup', endSelfProductDrag);
    sourceElement.removeEventListener('pointercancel', cancelSelfProductDrag);
    sourceElement.releasePointerCapture?.(pointerId);
    if (flyer) flyer.remove();
    selfDragState = null;
  }

  function endSelfProductDrag(event) {
    if (!selfDragState || event.pointerId !== selfDragState.pointerId) return;
    const drag = selfDragState;
    const shouldScan = drag.moved && scannerContainsPoint(event.clientX, event.clientY);
    clearSelfDragState();
    drag.sourceElement.classList.remove('is-moving');
    if (shouldScan) {
      scanSelfItem(drag.itemKey, drag.sourceElement, { skipFly: true });
      return;
    }
    window.setTimeout(() => {
      if (drag.sourceElement) drag.sourceElement.dataset.selfDragMoved = 'false';
    }, 0);
  }

  function cancelSelfProductDrag(event) {
    if (!selfDragState || event.pointerId !== selfDragState.pointerId) return;
    const sourceElement = selfDragState.sourceElement;
    clearSelfDragState();
    sourceElement.classList.remove('is-moving');
    sourceElement.dataset.selfDragMoved = 'false';
  }

  function completeSelfScan(itemKey, sourceElement, delay = 120) {
    window.setTimeout(() => {
      state.selfCheckout.scanned.push(itemKey);
      state.selfCheckout.scanning = false;
      if (sourceElement) {
        sourceElement.classList.remove('is-moving');
        sourceElement.dataset.selfDragMoved = 'false';
      }
      renderSelfCheckout();
    }, delay);
  }

  function scanSelfItem(itemKey, sourceElement = null, options = {}) {
    if (!itemKey || state.selfCheckout.scanned.includes(itemKey) || state.selfCheckout.scanning) return;
    if (!state.selfCheckout.scanStarted) {
      showSelfToast('스캔 시작하기 버튼을 클릭하세요.');
      return;
    }
    state.selfCheckout.scanning = true;
    playScanBeep();
    if (sourceElement) sourceElement.classList.add('is-moving');
    if (options.skipFly) {
      completeSelfScan(itemKey, sourceElement, 170);
      return;
    }
    flySelfProductToScanner(sourceElement, () => {
      completeSelfScan(itemKey, sourceElement, 120);
    });
  }

  function openPointModal() {
    els.pointModal.classList.add('is-open');
    els.pointModal.setAttribute('aria-hidden', 'false');
    state.selfCheckout.phone = '';
    renderPointPhone();
  }

  function closePointModal() {
    els.pointModal.classList.remove('is-open');
    els.pointModal.setAttribute('aria-hidden', 'true');
  }

  function renderPointPhone() {
    const digits = state.selfCheckout.phone;
    const first = digits.slice(0, 4);
    const second = digits.slice(4, 8);
    els.pointPhoneDisplay.textContent = `010-${first}${second ? `-${second}` : ''}`;
  }

  function handlePointKey(value) {
    if (value === 'skip') {
      state.selfCheckout.phone = '';
      finishPointInput();
      return;
    }
    if (value === 'back') {
      state.selfCheckout.phone = state.selfCheckout.phone.slice(0, -1);
      renderPointPhone();
      return;
    }
    if (/^\d$/.test(value) && state.selfCheckout.phone.length < 8) {
      state.selfCheckout.phone += value;
      renderPointPhone();
    }
  }

  function finishPointInput() {
    closePointModal();
    runSelfCardPayment();
  }

  function runSelfCardPayment() {
    state.selfCheckout.paymentReady = true;
    els.selfPayButton.disabled = true;
    els.selfPayButton.textContent = '카드 승인 중';
    els.selfPayButton.dataset.selfPayState = 'paying';
    els.selfCardAnimation.hidden = false;
    els.selfReceiptSlip.hidden = true;
    els.selfReceiptPreview.hidden = true;
    els.selfScreenTitle.textContent = '카드를 삽입해주세요';
    els.selfScreenHint.textContent = `NICEPAD 결제 금액 ${formatWon(selfCheckoutTotal())}`;
    setTimeout(() => {
      els.selfPayButton.disabled = true;
      els.selfPayButton.textContent = '영수증 발행 중';
      els.selfPayButton.dataset.selfPayState = 'printing';
      els.selfScreenTitle.textContent = '결제가 완료되었습니다';
      els.selfScreenHint.textContent = '영수증을 자동으로 발행합니다.';
      setTimeout(printSelfReceipt, 260);
    }, 1400);
  }

  function printSelfReceipt() {
    els.selfPayButton.disabled = true;
    els.selfCardAnimation.hidden = true;
    els.selfScreenTitle.textContent = '영수증을 발행합니다';
    els.selfScreenHint.textContent = '프린터에서 영수증이 나오고 있어요.';
    els.selfReceiptSlip.hidden = false;
    setTimeout(showSelfReceiptPreview, 850);
  }

  function buildSelfReceiptText(options = {}) {
    const receiptLabel = options.receiptLabel || 'SELF CHECKOUT';
    const closingText = options.closingText || '영수증을 확인한 뒤 완료를 눌러주세요.';
    const paymentLabel = options.paymentLabel || 'NICEPAD 승인';
    const includeBag = options.includeBag !== false;
    const entries = cartEntries();
    const bag = includeBag ? state.selfCheckout.bag : null;
    const subtotal = totalPrice();
    const bagPrice = bag ? bag.price : 0;
    const total = subtotal + bagPrice;
    const taxable = Math.round(total / 1.1 / 10) * 10;
    const vat = total - taxable;
    const dash = '-'.repeat(32);
    const orderNo = String((state.startedAtMs || Date.now()) % 10000).padStart(4, '0');
    const rows = entries.map(({ product, qty }) => [
      padDisplay(product.name, 12, 'left'),
      padDisplay(formatReceiptNumber(product.price), 7),
      padDisplay(qty, 3),
      padDisplay(formatReceiptNumber(product.price * qty), 8)
    ].join(' '));
    if (bag) {
      rows.push([
        padDisplay(bag.name, 12, 'left'),
        padDisplay(formatReceiptNumber(bag.price), 7),
        padDisplay(1, 3),
        padDisplay(formatReceiptNumber(bag.price), 8)
      ].join(' '));
    }
    return [
      '          re-MART',
      `        ${receiptLabel}`,
      `[주 문]${formatReceiptDate(new Date())}`,
      dash,
      `${padDisplay('상품명', 12, 'left')} ${padDisplay('단가', 7)} ${padDisplay('수량', 3)} ${padDisplay('금액', 8)}`,
      dash,
      ...(rows.length ? rows : ['구매한 물건이 없습니다.']),
      dash,
      `${padDisplay('과세물품', 16, 'left')}${padDisplay(formatReceiptNumber(taxable), 16)}`,
      `${padDisplay('부가세', 16, 'left')}${padDisplay(formatReceiptNumber(vat), 16)}`,
      `${padDisplay('합계', 16, 'left')}${padDisplay(formatReceiptNumber(total), 16)}`,
      `${padDisplay('카드결제', 16, 'left')}${padDisplay(formatReceiptNumber(total), 16)}`,
      dash,
      `${paymentLabel}  일시불`,
      `주문번호 : ${orderNo}`,
      '',
      closingText
    ].join('\n');
  }

  function showSelfReceiptPreview() {
    const result = evaluate();
    state.pendingReceiptResult = result;
    saveReport(result);
    els.selfReceiptPreviewText.textContent = buildSelfReceiptText();
    els.selfReceiptPreview.hidden = false;
  }

  function finishSelfReceiptPreview() {
    els.selfReceiptPreview.hidden = true;
    showErrandResult(state.pendingReceiptResult || evaluate());
  }

  function renderCheckout() {
    stopStoryAudio();
    const entries = cartEntries();
    els.checkoutLines.innerHTML = entries.length
      ? entries.map(({ product, qty }) => `
        <div class="mart-line-item">
          <span>${escapeHtml(product.name)}</span>
          <span>×${qty}</span>
          <strong>${escapeHtml(formatWon(product.price * qty))}</strong>
        </div>
      `).join('')
      : '<p class="mart-empty">결제할 물건이 없어요.</p>';
    els.checkoutTotal.textContent = formatWon(totalPrice());
    setScreen('checkout');
  }

  function evaluate() {
    const target = targetEntries();
    const cart = cartEntries();
    let correctKinds = 0;
    let overKinds = 0;
    let missingKinds = 0;
    target.forEach(({ product, qty }) => {
      const current = state.cart[product.id] || 0;
      if (current === qty) correctKinds += 1;
      else if (current > qty) overKinds += 1;
      else missingKinds += 1;
    });
    const extraKinds = cart.filter(({ product }) => !state.target[product.id]).length;
    const targetQty = target.reduce((sum, item) => sum + item.qty, 0);
    const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);
    return {
      correctKinds,
      overKinds,
      missingKinds,
      extraKinds,
      targetKinds: target.length,
      targetQty,
      cartQty,
      accuracy: target.length ? Math.round((correctKinds / target.length) * 100) : 0
    };
  }

  function renderReceipt() {
    if (isBudgetStage()) {
      renderBudgetReceipt();
      return;
    }
    const result = evaluate();
    const receipt = buildSelfReceiptText({
      receiptLabel: 'REGULAR CHECKOUT',
      paymentLabel: '일반계산대 승인',
      includeBag: false,
      closingText: `${result.targetKinds}가지 중 ${result.correctKinds}가지를 정확한 수량으로 담았어요.`
    });
    els.receiptTitle.textContent = 're-MART';
    els.receiptSummary.textContent = '';
    els.receiptStats.innerHTML = '';
    els.receiptLines.innerHTML = `<pre class="mart-receipt-paper">${escapeHtml(receipt)}</pre>`;
    state.pendingReceiptResult = result;
    saveReport(result);
    setScreen('receipt');
  }

  function renderBudgetReceipt() {
    const entries = cartEntries();
    const total = totalPrice();
    const change = Math.max(0, state.budgetAmount - total);
    const dash = '-'.repeat(42);
    const orderNo = String((state.startedAtMs || Date.now()) % 10000).padStart(4, '0');
    const rows = entries.map(({ product, qty }) => [
      padDisplay(product.name, 14, 'left'),
      padDisplay(formatReceiptNumber(product.price), 8),
      padDisplay(qty, 4),
      padDisplay(formatReceiptNumber(product.price * qty), 9)
    ].join('  '));
    const receipt = [
      '              re-MART',
      '',
      `[주 문]${formatReceiptDate(new Date())}`,
      dash,
      `${padDisplay('상품명', 14, 'left')}  ${padDisplay('단가', 8)}  ${padDisplay('수량', 4)}  ${padDisplay('금액', 9)}`,
      dash,
      ...(rows.length ? rows : ['구매한 물건이 없습니다.']),
      dash,
      '        거스름돈 계산',
      '',
      `${padDisplay('가진 돈', 16, 'left')}${padDisplay(formatReceiptNumber(state.budgetAmount), 18)}원`,
      `${padDisplay('- 결제금액', 16, 'left')}${padDisplay(formatReceiptNumber(total), 18)}원`,
      '        --------------------------',
      `${padDisplay('거스름돈', 16, 'left')}${padDisplay(formatReceiptNumber(change), 18)}원`,
      dash,
      `총 ${formatReceiptNumber(state.budgetAmount)}원이 있었고`,
      `결제한 금액은 ${formatReceiptNumber(total)}원,`,
      `거스름돈은 ${formatReceiptNumber(change)}원입니다.`,
      dash,
      `        주문번호 : ${orderNo}`
    ].join('\n');
    els.receiptTitle.textContent = 're-MART';
    els.receiptSummary.textContent = '';
    els.receiptStats.innerHTML = '';
    els.receiptLines.innerHTML = `<pre class="mart-receipt-paper mart-budget-receipt-paper">${escapeHtml(receipt)}</pre>`;
    state.pendingReceiptResult = null;
    saveBudgetReport(total, change);
    setScreen('receipt');
  }

  function isSuccessfulResult(result) {
    return result.targetKinds > 0
      && result.correctKinds === result.targetKinds
      && result.missingKinds === 0
      && result.overKinds === 0
      && result.extraKinds === 0;
  }

  function showErrandResult(result) {
    const success = isSuccessfulResult(result);
    const kind = success ? 'success' : 'fail';
    els.errandResultImage.src = storyImage(kind);
    els.errandResultImage.alt = success ? '심부름 성공' : '심부름 다시 확인';
    setScreen('errandResult');
    playStoryAudioSequence(kind);
  }

  function confirmReceipt() {
    if (state.pendingReceiptResult) {
      showErrandResult(state.pendingReceiptResult);
      return;
    }
    resetToStage();
  }

  function saveReport(result) {
    if (!window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function' || state.savedRunId || !state.stage) return;
    try {
      const record = window.HahaLabLearningHarness.recordSession({
        app: 'playlab',
        labKind: 'playlab',
        learningId: 'playlab-supermarket-errand',
        learningTitle: '대형마트에 심부름을 가요!',
        stageKey: state.stage.id,
        stageTitle: state.stage.title,
        totalQuestions: result.targetKinds,
        correctCount: result.correctKinds,
        wrongCount: Math.max(0, result.targetKinds - result.correctKinds) + result.extraKinds,
        accuracy: result.accuracy,
        score: result.correctKinds,
        durationSeconds: Math.round((Date.now() - state.startedAtMs) / 1000),
        startedAtMs: state.startedAtMs,
        endedAtMs: Date.now(),
        detail: {
          target: targetEntries().map(({ product, qty }) => ({ id: product.id, name: product.name, qty })),
          cart: cartEntries().map(({ product, qty }) => ({ id: product.id, name: product.name, qty })),
          overKinds: result.overKinds,
          missingKinds: result.missingKinds,
          extraKinds: result.extraKinds,
          totalPrice: totalPrice()
        },
        saveToClientReport: true
      });
      state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
    } catch (error) {
      console.warn('[playlab-supermarket-errand] report save failed:', error);
    }
  }

  function saveBudgetReport(total, change) {
    if (!window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function' || state.savedRunId || !state.stage) return;
    try {
      const success = total <= state.budgetAmount;
      const record = window.HahaLabLearningHarness.recordSession({
        app: 'playlab',
        labKind: 'playlab',
        learningId: 'playlab-supermarket-errand',
        learningTitle: '대형마트에 심부름을 가요!',
        stageKey: state.stage.id,
        stageTitle: state.stage.title,
        totalQuestions: 1,
        correctCount: success ? 1 : 0,
        wrongCount: success ? 0 : 1,
        accuracy: success ? 100 : 0,
        score: success ? 1 : 0,
        durationSeconds: Math.round((Date.now() - state.startedAtMs) / 1000),
        startedAtMs: state.startedAtMs,
        endedAtMs: Date.now(),
        detail: {
          budgetAmount: state.budgetAmount,
          totalPrice: total,
          change,
          cart: cartEntries().map(({ product, qty }) => ({ id: product.id, name: product.name, qty, price: product.price }))
        },
        saveToClientReport: true
      });
      state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
    } catch (error) {
      console.warn('[playlab-supermarket-errand] budget report save failed:', error);
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
    document.querySelectorAll('[data-stage-id]').forEach((button) => {
      button.addEventListener('click', () => requestStageStart(button.dataset.stageId));
    });
    els.teacherBasket.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-teacher-remove]');
      if (chip) teacherRemove(chip.dataset.teacherRemove);
    });
    els.prevShelfButton.addEventListener('click', () => {
      state.shelfIndex = Math.max(0, state.shelfIndex - 1);
      renderCorner();
    });
    els.nextShelfButton.addEventListener('click', () => {
      const totalShelves = Math.max(1, Math.ceil(state.products.filter((item) => item.sectionId === state.sectionId).length / shelfVisibleCount()));
      state.shelfIndex = Math.min(totalShelves - 1, state.shelfIndex + 1);
      renderCorner();
    });
    els.cornerBackButton.addEventListener('click', () => {
      renderMap();
      setScreen('map');
    });
    els.goCheckoutButton.addEventListener('click', toggleHint);
    els.cornerHintButton.addEventListener('click', toggleHint);
    els.checkoutBackButton.addEventListener('click', () => {
      renderMap();
      setScreen('map');
    });
    els.payButton.addEventListener('click', renderReceipt);
    document.querySelectorAll('[data-counter-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.counterChoice === 'self') {
          openSelfCheckout();
          return;
        }
        renderCheckout();
      });
    });
    document.querySelectorAll('[data-cart-nav]').forEach((button) => {
      button.addEventListener('click', () => scrollCartDock(button));
    });
    [els.cartDock, els.cornerCartDock].forEach((dock) => {
      dock.addEventListener('scroll', updateCartDockControls, { passive: true });
    });
    els.selfStartButton.addEventListener('click', startSelfScanning);
    document.querySelectorAll('[data-bag-choice]').forEach((button) => {
      button.addEventListener('click', () => chooseBag(button));
    });
    els.selfScannerDrop.addEventListener('dragover', (event) => event.preventDefault());
    els.selfScannerDrop.addEventListener('drop', (event) => {
      event.preventDefault();
      const itemKey = event.dataTransfer.getData('text/plain');
      scanSelfItem(itemKey, els.selfBeforeShelf.querySelector(`[data-self-item-key="${CSS.escape(itemKey)}"]`));
    });
    els.selfBeforeShelf.addEventListener('click', (event) => {
      const button = event.target.closest('[data-self-item-key]');
      if (!button || !els.selfBeforeShelf.contains(button)) return;
      if (button.dataset.selfDragMoved === 'true') {
        button.dataset.selfDragMoved = 'false';
        return;
      }
      scanSelfItem(button.dataset.selfItemKey, button);
    });
    els.selfPayButton.addEventListener('click', () => {
      if (els.selfPayButton.dataset.selfPayState === 'receipt') {
        printSelfReceipt();
        return;
      }
      openPointModal();
    });
    document.querySelectorAll('[data-keypad]').forEach((button) => {
      button.addEventListener('click', () => handlePointKey(button.dataset.keypad));
    });
    els.pointDoneButton.addEventListener('click', finishPointInput);
    els.selfReceiptDoneButton.addEventListener('click', finishSelfReceiptPreview);
    els.teacherStartButton.addEventListener('click', startTeacherErrand);
    els.receiptConfirmButton.addEventListener('click', confirmReceipt);
    els.errandStartButton.addEventListener('click', beginVisibleErrand);
    els.errandRetryButton.addEventListener('click', () => startStage('visible-list'));
    els.martStageButton.addEventListener('click', () => {
      if (state.budgetLocked) return;
      resetToStage();
    });
    document.querySelectorAll('[data-modal-stage-id]').forEach((button) => {
      button.addEventListener('click', () => {
        closeStageModal();
        requestStageStart(button.dataset.modalStageId);
      });
    });
    els.stageModalCancelButton.addEventListener('click', closeStageModal);
    els.stageModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-stage-modal-close]')) closeStageModal();
    });
    document.querySelectorAll('[data-gender]').forEach((button) => {
      button.addEventListener('click', () => chooseGender(button.dataset.gender));
    });
    els.genderModalCancelButton.addEventListener('click', closeGenderModal);
    els.genderModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-gender-modal-close]')) closeGenderModal();
    });
    els.errandListCloseButton.addEventListener('click', closeErrandListModal);
    document.addEventListener('click', (event) => {
      const hintButton = event.target.closest('[data-action="toggle-hint"]');
      if (!hintButton) return;
      toggleHint();
    });
    els.helpButton.addEventListener('click', openHelp);
    els.helpCloseButton.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    window.addEventListener('resize', () => {
      if (state.screen === 'corner') renderCorner();
      updateCartDockControls();
    });
  }

  function cacheElements() {
    [
      'stageView', 'errandIntroView', 'teacherView', 'mapView', 'cornerView', 'counterChoiceView', 'selfCheckoutView', 'checkoutView', 'receiptView', 'errandResultView',
      'martStageChip', 'martStageButton', 'martMap', 'taskPanel', 'cornerTaskPanel',
      'goCheckoutButton', 'cartDock', 'cornerCartDock', 'cornerBackButton',
      'cornerHintButton',
      'cornerIcon', 'cornerTitle', 'shelfLabel', 'prevShelfButton', 'nextShelfButton', 'shelfProducts',
      'teacherProductGrid', 'teacherBasket', 'teacherStartButton', 'checkoutLines', 'checkoutTotal',
      'checkoutBackButton', 'payButton', 'receiptTitle', 'receiptSummary', 'receiptStats', 'receiptLines',
      'receiptConfirmButton', 'errandStartButton', 'errandIntroImage', 'errandResultImage', 'errandRetryButton',
      'helpButton', 'helpModal', 'helpCloseButton', 'stageModal', 'stageModalCancelButton',
      'genderModal', 'genderModalCancelButton',
      'errandListModal', 'errandListModalBody', 'errandListCloseButton', 'budgetTalk',
      'selfBeforeShelf', 'selfAfterShelf', 'selfStartScreen', 'selfStartButton', 'selfScanScreen', 'selfScanList',
      'selfPayButton', 'selfScreenTitle', 'selfScreenHint', 'selfScannerDrop', 'selfCardAnimation',
      'selfReceiptSlip', 'selfReceiptPreview', 'selfReceiptPreviewText', 'selfReceiptDoneButton',
      'selfCheckoutTotalBar', 'selfBagStatus', 'pointModal', 'pointPhoneDisplay', 'pointDoneButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function init() {
    cacheElements();
    buildProducts();
    bindEvents();
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.preload === 'function') {
      window.HahaFeedbackOverlay.preload();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
