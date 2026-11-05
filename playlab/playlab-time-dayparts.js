(function () {
  const TIME_IMAGE_LIBRARY = {
    morning: [
      ['time-dayparts/morning-wake-up', '일어나기'],
      ['time-dayparts/morning-breakfast', '식사'],
      ['time-dayparts/morning-school-arrival', '등교'],
      ['time-dayparts/morning-school-prep', '등교 준비'],
      ['time-dayparts/morning-ready-for-school', '등교준비'],
      ['time-dayparts/morning-school-bag', '책가방 준비'],
      ['time-dayparts/morning-school-greeting', '등교 후 인사'],
      ['time-dayparts/morning-class', '수업']
    ],
    afternoon: [
      ['time-dayparts/afternoon-lunch-time', '점심시간'],
      ['time-dayparts/afternoon-break-time', '쉬는시간'],
      ['time-dayparts/afternoon-study', '공부'],
      ['time-dayparts/afternoon-class', '수업'],
      ['time-dayparts/afternoon-playground-free-time', '운동장 자유시간'],
      ['time-dayparts/afternoon-leaving-school', '하교'],
      ['time-dayparts/afternoon-school-hallway', '하교 복도'],
      ['time-dayparts/afternoon-dismissal-prep', '하교 준비']
    ],
    evening: [
      ['time-dayparts/night-late-snack', '야식'],
      ['time-dayparts/night-dinner', '식사'],
      ['time-dayparts/night-dinner-out', '외식'],
      ['time-dayparts/night-homework', '숙제'],
      ['time-dayparts/night-homework-with-mom', '엄마랑 숙제']
    ]
  };

  function buildTimeImageSet(groupName) {
    const entries = TIME_IMAGE_LIBRARY[groupName] || [];
    return entries.map(function (entry, index) {
      const order = String(index + 1).padStart(2, '0');
      const baseName = entry[0];
      return [
        {
          id: groupName + '-photo-' + order,
          pairId: groupName + '-' + order,
          path: 'images/category/' + baseName + '-photo.webp',
          variant: 'photo'
        },
        {
          id: groupName + '-illust-' + order,
          pairId: groupName + '-' + order,
          path: 'images/category/' + baseName + '-illust.webp',
          variant: 'illust'
        }
      ];
    }).flat();
  }

  const GROUPS = [
    {
      id: 'morning',
      labels: ['아침', '오전'],
      images: buildTimeImageSet('morning')
    },
    {
      id: 'afternoon',
      labels: ['점심', '오후'],
      images: buildTimeImageSet('afternoon')
    },
    {
      id: 'evening',
      labels: ['저녁', '밤'],
      images: buildTimeImageSet('evening')
    }
  ];

  const LABEL_INFO = {
    '아침': {
      groupId: 'morning',
      title: '아침',
      body: '하루를 시작하는 이른 시간이에요. 해가 뜨고 정신이 반짝 깨어나는 때예요.',
      relation: '아침은 오전 시간에 들어가요.'
    },
    '오전': {
      groupId: 'morning',
      title: '오전',
      body: '아침부터 점심 전까지예요. 해가 떠 있는 앞쪽 시간이예요.',
      relation: '오전 안에 아침 시간이 들어가요.'
    },
    '점심': {
      groupId: 'afternoon',
      title: '점심',
      body: '낮에 밥을 먹는 시간이에요. 배가 고파서 맛있게 밥을 먹는 때예요.',
      relation: '이 학습에서는 점심을 오후 묶음으로 함께 배워요.'
    },
    '오후': {
      groupId: 'afternoon',
      title: '오후',
      body: '점심을 먹고 나서 저녁 전까지예요. 해가 아직 밝은 낮 시간이예요.',
      relation: '오후 묶음 안에 점심 시간이 함께 들어가요.'
    },
    '저녁': {
      groupId: 'evening',
      title: '저녁',
      body: '해가 지기 시작하고 하루를 마무리하는 시간이에요. 저녁밥을 먹는 때이기도 해요.',
      relation: '저녁 다음에는 밤이 와요.'
    },
    '밤': {
      groupId: 'evening',
      title: '밤',
      body: '해가 지고 어두워진 뒤의 시간이에요. 자고 쉬는 시간이 가까워져요.',
      relation: '밤은 저녁 뒤에 오는 어두운 시간이에요.'
    }
  };

  const CHOICE_TONES = ['sun', 'sky', 'moon'];
  const QUESTIONS_PER_LABEL = 2;
  const LEARN_AUDIO_PATHS = {
    morning: '../sound/cardlab-time/learn-morning.mp3',
    afternoon: '../sound/cardlab-time/learn-afternoon.mp3',
    evening: '../sound/cardlab-time/learn-evening.mp3'
  };
  const LABEL_AUDIO_PATHS = {
    '아침': '../sound/cardlab-time/early-morning.mp3',
    '오전': '../sound/cardlab-time/morning.mp3',
    '점심': '../sound/cardlab-time/lunch.mp3',
    '오후': '../sound/cardlab-time/afternoon.mp3',
    '저녁': '../sound/cardlab-time/evening.mp3',
    '밤': '../sound/cardlab-time/night.mp3'
  };
  const EFFECT_AUDIO_PATHS = {
    correct: '../sound/correct.mp3',
    wrong: '../sound/error.mp3'
  };
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAB_LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const PLAYLAB_REPORT_SCOPE = resolveRuntimeLabScope();
  const PLAYLAB_LABEL = PLAYLAB_REPORT_SCOPE === 'cardlab' ? '카드랩' : (PLAYLAB_REPORT_SCOPE === 'rehab' ? '재활랩' : '플레이랩');
  const PAGE_TITLE = '시간 표현 배우기';
  const CARDLAB_TIME_DAYPARTS_CURRICULUM_KEY = 'cardlab-time-dayparts';
  const RELATIVE_CUE_AUDIO_PATHS = {
    dayBeforeYesterday: '../sound/cardlab-time/day-before-yesterday.mp3',
    yesterday: '../sound/cardlab-time/yesterday.mp3',
    today: '../sound/cardlab-time/today.mp3',
    tomorrow: '../sound/cardlab-time/tomorrow.mp3',
    dayAfterTomorrow: '../sound/cardlab-time/day-after-tomorrow.mp3',
    everyDay: '../sound/cardlab-time/every-day.mp3',
    monthBeforeLast: '../sound/cardlab-time/month-before-last.mp3',
    lastMonth: '../sound/cardlab-time/last-month.mp3',
    thisMonth: '../sound/cardlab-time/this-month.mp3',
    nextMonth: '../sound/cardlab-time/next-month.mp3',
    monthAfterNext: '../sound/cardlab-time/month-after-next.mp3',
    everyMonth: '../sound/cardlab-time/every-month.mp3',
    yearBeforeLast: '../sound/cardlab-time/year-before-last.mp3',
    lastYear: '../sound/cardlab-time/last-year.mp3',
    thisYear: '../sound/cardlab-time/this-year.mp3',
    nextYear: '../sound/cardlab-time/next-year.mp3',
    yearAfterNext: '../sound/cardlab-time/year-after-next.mp3',
    everyYear: '../sound/cardlab-time/every-year.mp3'
  };

  function resolveRuntimeLabScope() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const labKind = String(params.get('labKind') || '').trim().toLowerCase();
      const fileName = String(window.location.pathname || '').split('/').pop() || '';
      if (labKind === 'cardlab' || labKind === 'card' || fileName.startsWith('cardlab-')) return 'cardlab';
      if (labKind === 'rehab' || fileName.startsWith('rehablab-')) return 'rehab';
    } catch (_error) {}
    return 'playlab';
  }

  const KOREA_PUBLIC_HOLIDAYS_BY_YEAR = {
    2026: [
      '2026-01-01',
      '2026-02-16',
      '2026-02-17',
      '2026-02-18',
      '2026-03-01',
      '2026-03-02',
      '2026-05-01',
      '2026-05-05',
      '2026-05-24',
      '2026-05-25',
      '2026-06-03',
      '2026-06-06',
      '2026-08-15',
      '2026-08-17',
      '2026-09-24',
      '2026-09-25',
      '2026-09-26',
      '2026-10-03',
      '2026-10-05',
      '2026-10-09',
      '2026-12-25'
    ]
  };
  const RELATIVE_JUMP_AUDIO_PATH = '../sound/cartoon-jump.mp3';
  const SEQUENCE_TOTAL_ROUNDS = 8;
  const LEARN_ITEMS = [
    {
      id: 'morning',
      label: '오전',
      groupId: 'morning',
      description: '오전은 아침부터 점심 전까지예요. 해가 떠 있고 하루가 활짝 시작된 시간이에요.'
    },
    {
      id: 'afternoon',
      label: '점심',
      groupId: 'afternoon',
      description: '점심은 낮에 밥을 먹는 시간이에요. 이 학습에서는 점심을 오후 묶음으로 함께 배워요.'
    },
    {
      id: 'evening',
      label: '저녁',
      groupId: 'evening',
      description: '저녁은 해가 지기 시작하고 하루를 마무리하는 시간이에요.'
    }
  ];
  const RELATIVE_DAY_ITEMS = [
    {
      id: 'today',
      label: '오늘',
      title: '오늘은 언제일까요?',
      description: '지금 기분이 어때요? 오늘 우리 같이 재미있는 공부를 하고 있는 바로 지금 이 시간을 오늘이라고 해요.',
      audioPath: '../sound/cardlab-time/today-story.mp3',
      boxOffsets: [-1, 0, 1],
      focusOffset: 0,
      startOffset: 0,
      jumpPath: [0],
      jumpCueIds: ['today']
    },
    {
      id: 'yesterday',
      label: '어제',
      title: '어제는 언제였을까요?',
      description: '어제 뭐 먹었어요? 어제는 이미 잠을 자고 일어났기 때문에 다 지나가 버린 날을 말해요.',
      audioPath: '../sound/cardlab-time/yesterday-story.mp3',
      boxOffsets: [-2, -1, 0],
      focusOffset: -1,
      startOffset: 0,
      jumpPath: [0, -1],
      jumpCueIds: ['today', 'yesterday']
    },
    {
      id: 'dayBeforeYesterday',
      label: '그저께',
      title: '그저께는 언제였을까요?',
      description: '어제보다 더 전에 무엇을 했나요? 잠을 한 번 자고 또 한 번 더 잤던 아주 전날을 그저께라고 해요.',
      audioPath: '../sound/cardlab-time/day-before-yesterday-story.mp3',
      boxOffsets: [-2, -1, 0],
      focusOffset: -2,
      startOffset: 0,
      jumpPath: [0, -1, -2],
      jumpCueIds: ['today', 'yesterday', 'dayBeforeYesterday']
    },
    {
      id: 'tomorrow',
      label: '내일',
      title: '내일은 언제일까요?',
      description: '내일은 약속이 있나요? 오늘 밤에 잠을 쿨쿨 자고 일어나면 새롭게 만나는 기분 좋은 날이 내일이에요.',
      audioPath: '../sound/cardlab-time/tomorrow-story.mp3',
      boxOffsets: [0, 1, 2],
      focusOffset: 1,
      startOffset: 0,
      jumpPath: [0, 1],
      jumpCueIds: ['today', 'tomorrow']
    },
    {
      id: 'dayAfterTomorrow',
      label: '모레',
      title: '모레는 언제일까요?',
      description: '내일 말고 잠을 한 번 더 자야 해요. 조금 더 기다려야 만날 수 있는 내일 다음 날을 모레라고 해요.',
      audioPath: '../sound/cardlab-time/day-after-tomorrow-story.mp3',
      boxOffsets: [0, 1, 2],
      focusOffset: 2,
      startOffset: 0,
      jumpPath: [0, 1, 2],
      jumpCueIds: ['today', 'tomorrow', 'dayAfterTomorrow']
    },
    {
      id: 'everyDay',
      label: '매일',
      title: '매일은 언제일까요?',
      description: '어제도 해가 떴고 오늘도 해가 떴지요? 내일도 해는 꼭 떠요. 이렇게 하루도 빠지지 않는 것을 매일이라고 해요.',
      audioPath: '../sound/cardlab-time/every-day-story.mp3',
      boxOffsets: [-1, 0, 1],
      focusOffset: 0,
      startOffset: 0,
      jumpPath: [0, 1, 0, -1, 0],
      jumpCueIds: ['today', 'tomorrow', 'today', 'yesterday', 'today']
    }
  ];
  const RELATIVE_MONTH_ITEMS = [
    {
      id: 'thisMonth',
      label: '이번달',
      title: '이번달은 언제일까요?',
      description: '지금 우리 달력을 같이 볼까요? 달력에 크게 적힌 숫자와 지금 우리가 살고 있는 이 달이 이번달이에요.',
      audioPath: '../sound/cardlab-time/this-month-story.mp3',
      boxOffsets: [-1, 0, 1],
      focusOffset: 0,
      startOffset: 0,
      jumpPath: [0],
      jumpCueIds: ['thisMonth']
    },
    {
      id: 'lastMonth',
      label: '지난달',
      title: '지난달은 언제였을까요?',
      description: '지난달에 어디 놀러 갔던 적이 있나요? 이미 다 써서 휙 넘겨버린 달력의 바로 앞 페이지를 지난달이라고 해요.',
      audioPath: '../sound/cardlab-time/last-month-story.mp3',
      boxOffsets: [-2, -1, 0],
      focusOffset: -1,
      startOffset: 0,
      jumpPath: [0, -1],
      jumpCueIds: ['thisMonth', 'lastMonth']
    },
    {
      id: 'monthBeforeLast',
      label: '지지난달',
      title: '지지난달은 언제였을까요?',
      description: '지난달보다 더 전에는 무엇을 했나요? 달력을 한 장, 두 장 앞으로 넘겨야 나오는 아주 예전의 달을 지지난달이라고 해요.',
      audioPath: '../sound/cardlab-time/month-before-last-story.mp3',
      boxOffsets: [-2, -1, 0],
      focusOffset: -2,
      startOffset: 0,
      jumpPath: [0, -1, -2],
      jumpCueIds: ['thisMonth', 'lastMonth', 'monthBeforeLast']
    },
    {
      id: 'nextMonth',
      label: '다음달',
      title: '다음달은 언제일까요?',
      description: '다음달에는 어떤 일이 생길까요? 지금 달력을 다 쓰고 나서 한 장을 뒤로 넘기면 나오는 새로운 종이가 다음달이에요.',
      audioPath: '../sound/cardlab-time/next-month-story.mp3',
      boxOffsets: [0, 1, 2],
      focusOffset: 1,
      startOffset: 0,
      jumpPath: [0, 1],
      jumpCueIds: ['thisMonth', 'nextMonth']
    },
    {
      id: 'monthAfterNext',
      label: '다다음달',
      title: '다다음달은 언제일까요?',
      description: '다음달이 지나면 또 어떤 달이 올까요? 달력을 한 장, 두 장 뒤로 넘겨야 만날 수 있는 조금 먼 미래의 달을 다다음달이라고 해요.',
      audioPath: '../sound/cardlab-time/month-after-next-story.mp3',
      boxOffsets: [0, 1, 2],
      focusOffset: 2,
      startOffset: 0,
      jumpPath: [0, 1, 2],
      jumpCueIds: ['thisMonth', 'nextMonth', 'monthAfterNext']
    },
    {
      id: 'everyMonth',
      label: '매달',
      title: '매달은 언제일까요?',
      description: '매달 용돈을 받거나 키를 재나요? 달력 종이가 한 장씩 넘어갈 때마다 빠지지 않고 계속하는 것을 매달이라고 해요.',
      audioPath: '../sound/cardlab-time/every-month-story.mp3',
      boxOffsets: [-1, 0, 1],
      focusOffset: 0,
      startOffset: 0,
      jumpPath: [0, 1, 0, -1, 0],
      jumpCueIds: ['thisMonth', 'nextMonth', 'thisMonth', 'lastMonth', 'thisMonth']
    }
  ];
  const RELATIVE_YEAR_ITEMS = [
    {
      id: 'thisYear',
      label: '올해',
      title: '올해는 언제일까요?',
      description: '올해는 몇 살이 되었나요? 내가 지금 형아나 언니로 멋지게 지내고 있는 바로 지금 이 연도를 올해라고 해요.',
      audioPath: '../sound/cardlab-time/this-year-story.mp3',
      boxOffsets: [-1, 0, 1],
      focusOffset: 0,
      startOffset: 0,
      jumpPath: [0],
      jumpCueIds: ['thisYear']
    },
    {
      id: 'lastYear',
      label: '작년',
      title: '작년은 언제였을까요?',
      description: '작년에는 어떤 유치원이나 학교에 다녔나요? 내가 지금보다 한 살 더 어렸던 바로 전 연도를 작년이라고 해요.',
      audioPath: '../sound/cardlab-time/last-year-story.mp3',
      boxOffsets: [-2, -1, 0],
      focusOffset: -1,
      startOffset: 0,
      jumpPath: [0, -1],
      jumpCueIds: ['thisYear', 'lastYear']
    },
    {
      id: 'yearBeforeLast',
      label: '재작년',
      title: '재작년은 언제였을까요?',
      description: '작년보다 더 옛날을 기억하나요? 내가 아주 꼬마였을 때처럼 작년보다 일 년 더 앞선 연도를 재작년이라고 해요.',
      audioPath: '../sound/cardlab-time/year-before-last-story.mp3',
      boxOffsets: [-2, -1, 0],
      focusOffset: -2,
      startOffset: 0,
      jumpPath: [0, -1, -2],
      jumpCueIds: ['thisYear', 'lastYear', 'yearBeforeLast']
    },
    {
      id: 'nextYear',
      label: '내년',
      title: '내년은 언제일까요?',
      description: '내년에는 키가 얼마나 클까요? 한 살을 더 먹고 지금보다 더 높은 학년이 되는 다가올 연도를 내년이라고 해요.',
      audioPath: '../sound/cardlab-time/next-year-story.mp3',
      boxOffsets: [0, 1, 2],
      focusOffset: 1,
      startOffset: 0,
      jumpPath: [0, 1],
      jumpCueIds: ['thisYear', 'nextYear']
    },
    {
      id: 'yearAfterNext',
      label: '내후년',
      title: '내후년은 언제일까요?',
      description: '내년보다 시간이 더 흐르면 어떻게 될까요? 내년이 지나고 일 년이 더 지나야 만날 수 있는 아주 먼 미래를 내후년이라고 해요.',
      audioPath: '../sound/cardlab-time/year-after-next-story.mp3',
      boxOffsets: [0, 1, 2],
      focusOffset: 2,
      startOffset: 0,
      jumpPath: [0, 1, 2],
      jumpCueIds: ['thisYear', 'nextYear', 'yearAfterNext']
    },
    {
      id: 'everyYear',
      label: '매년',
      title: '매년은 언제일까요?',
      description: '생일 파티는 언제 하나요? 내 생일처럼 아주 오래 기다리면 일 년에 한 번씩 꼭 돌아오는 것을 매년이라고 해요.',
      audioPath: '../sound/cardlab-time/every-year-story.mp3',
      boxOffsets: [-1, 0, 1],
      focusOffset: 0,
      startOffset: 0,
      jumpPath: [0, 1, 0, -1, 0],
      jumpCueIds: ['thisYear', 'nextYear', 'thisYear', 'lastYear', 'thisYear']
    }
  ];
  const RELATIVE_MODULES = {
    day: {
      title: '오늘, 어제, 내일을 날짜로 볼까요?',
      introTitle: '날짜 학습 시작',
      introDesc: '오늘을 알아볼까요?',
      items: RELATIVE_DAY_ITEMS,
      reviewOrder: [
        'dayBeforeYesterday',
        'yesterday',
        'today',
        'tomorrow',
        'dayAfterTomorrow',
        'everyDay'
      ],
      formatInfo: formatDateInfo
    },
    month: {
      title: '이번달, 지난달, 다음달을 달력으로 볼까요?',
      introTitle: '달 학습 시작',
      introDesc: '이번달을 알아볼까요?',
      items: RELATIVE_MONTH_ITEMS,
      reviewOrder: [
        'monthBeforeLast',
        'lastMonth',
        'thisMonth',
        'nextMonth',
        'monthAfterNext',
        'everyMonth'
      ],
      formatInfo: formatMonthInfo
    },
    year: {
      title: '올해, 작년, 내년을 해의 흐름으로 볼까요?',
      introTitle: '년 학습 시작',
      introDesc: '올해를 알아볼까요?',
      items: RELATIVE_YEAR_ITEMS,
      reviewOrder: [
        'yearBeforeLast',
        'lastYear',
        'thisYear',
        'nextYear',
        'yearAfterNext',
        'everyYear'
      ],
      formatInfo: formatYearInfo
    }
  };
  const SEQUENCE_GROUPS = [
    {
      id: 'morning',
      label: '오전',
      images: [
        { path: 'images/category/time-dayparts/morning-wake-up-illust.webp', caption: '일어나기' },
        { path: 'images/category/time-dayparts/morning-breakfast-illust.webp', caption: '식사' },
        { path: 'images/category/time-dayparts/morning-school-arrival-illust.webp', caption: '등교' },
        { path: 'images/category/time-dayparts/morning-school-prep-illust.webp', caption: '등교 준비' },
        { path: 'images/category/time-dayparts/morning-ready-for-school-illust.webp', caption: '등교준비' },
        { path: 'images/category/time-dayparts/morning-school-bag-illust.webp', caption: '책가방 준비' },
        { path: 'images/category/time-dayparts/morning-school-greeting-illust.webp', caption: '등교 후 인사' },
        { path: 'images/category/time-dayparts/morning-class-illust.webp', caption: '수업' }
      ]
    },
    {
      id: 'afternoon',
      label: '오후',
      images: [
        { path: 'images/category/time-dayparts/afternoon-lunch-time-illust.webp', caption: '점심시간' },
        { path: 'images/category/time-dayparts/afternoon-break-time-illust.webp', caption: '쉬는시간' },
        { path: 'images/category/time-dayparts/afternoon-study-illust.webp', caption: '공부' },
        { path: 'images/category/time-dayparts/afternoon-class-illust.webp', caption: '수업' },
        { path: 'images/category/time-dayparts/afternoon-playground-free-time-illust.webp', caption: '운동장 자유시간' },
        { path: 'images/category/time-dayparts/afternoon-leaving-school-illust.webp', caption: '하교' },
        { path: 'images/category/time-dayparts/afternoon-school-hallway-illust.webp', caption: '하교 복도' },
        { path: 'images/category/time-dayparts/afternoon-dismissal-prep-illust.webp', caption: '하교 준비' }
      ]
    },
    {
      id: 'evening',
      label: '저녁',
      images: [
        { path: 'images/category/time-dayparts/night-late-snack-illust.webp', caption: '야식' },
        { path: 'images/category/time-dayparts/night-dinner-illust.webp', caption: '식사' },
        { path: 'images/category/time-dayparts/night-dinner-out-illust.webp', caption: '외식' },
        { path: 'images/category/time-dayparts/night-homework-illust.webp', caption: '숙제' },
        { path: 'images/category/time-dayparts/night-homework-with-mom-illust.webp', caption: '엄마랑 숙제' },
        { path: 'images/category/time-dayparts/night-bedtime-reading-illust.webp', caption: '자기전 독서' }
      ]
    }
  ];
  const SEQUENCE_ORDER = SEQUENCE_GROUPS.map(function (group) {
    return group.id;
  });

  const refs = {
    stageSelectButton: document.getElementById('stageSelectButton'),
    helpButton: document.getElementById('helpButton'),
    learnModeButton: document.getElementById('learnModeButton'),
    quizModeButton: document.getElementById('quizModeButton'),
    sequenceModeButton: document.getElementById('sequenceModeButton'),
    relativeDayModeButton: document.getElementById('relativeDayModeButton'),
    relativeMonthModeButton: document.getElementById('relativeMonthModeButton'),
    relativeYearModeButton: document.getElementById('relativeYearModeButton'),
    learnPrevButton: document.getElementById('learnPrevButton'),
    learnNextButton: document.getElementById('learnNextButton'),
    relativePrevButton: document.getElementById('relativePrevButton'),
    relativeNextButton: document.getElementById('relativeNextButton'),
    restartButton: document.getElementById('restartButton'),
    categoryView: document.getElementById('categoryView'),
    learnView: document.getElementById('learnView'),
    quizView: document.getElementById('quizView'),
    sequenceView: document.getElementById('sequenceView'),
    relativeDayView: document.getElementById('relativeDayView'),
    resultView: document.getElementById('resultView'),
    learnCardGrid: document.getElementById('learnCardGrid'),
    learnTitle: document.getElementById('learnTitle'),
    learnOrderChip: document.getElementById('learnOrderChip'),
    relativeDayTitle: document.getElementById('relativeDayTitle'),
    relativeDayChip: document.getElementById('relativeDayChip'),
    relativeReviewSection: document.getElementById('relativeReviewSection'),
    relativeReviewGrid: document.getElementById('relativeReviewGrid'),
    questionTitle: document.getElementById('questionTitle'),
    progressChip: document.getElementById('progressChip'),
    scoreChip: document.getElementById('scoreChip'),
    sequenceProgressChip: document.getElementById('sequenceProgressChip'),
    sequenceScoreChip: document.getElementById('sequenceScoreChip'),
    questionImage: document.getElementById('questionImage'),
    choiceList: document.getElementById('choiceList'),
    sequenceBoard: document.getElementById('sequenceBoard'),
    sequenceSlots: document.getElementById('sequenceSlots'),
    sequenceTray: document.getElementById('sequenceTray'),
    relativeScene: document.getElementById('relativeScene'),
    relativeDateRail: document.getElementById('relativeDateRail'),
    relativeWorld: document.getElementById('relativeWorld'),
    meaningToast: document.getElementById('meaningToast'),
    meaningToastClose: document.getElementById('meaningToastClose'),
    meaningTitle: document.getElementById('meaningTitle'),
    meaningBody: document.getElementById('meaningBody'),
    feedbackBurst: document.getElementById('feedbackBurst'),
    resultTitle: document.getElementById('resultTitle'),
    resultSummary: document.getElementById('resultSummary'),
    resultCorrect: document.getElementById('resultCorrect'),
    resultCorrectLabel: document.getElementById('resultCorrectLabel'),
    resultWrong: document.getElementById('resultWrong'),
    resultWrongLabel: document.getElementById('resultWrongLabel'),
    resultTotal: document.getElementById('resultTotal'),
    resultTotalLabel: document.getElementById('resultTotalLabel'),
    resultReport: document.getElementById('resultReport'),
    relativeIntroModal: document.getElementById('relativeIntroModal'),
    relativeIntroModalTitle: document.getElementById('relativeIntroModalTitle'),
    relativeIntroModalDesc: document.getElementById('relativeIntroModalDesc'),
    relativeIntroModalOk: document.getElementById('relativeIntroModalOk'),
    confirmModal: document.getElementById('confirmModal'),
    confirmModalCancel: document.getElementById('confirmModalCancel'),
    confirmModalOk: document.getElementById('confirmModalOk')
  };

  if (Object.values(refs).some(function (node) { return !node; })) {
    return;
  }

  const state = {
    phase: 'intro',
    questions: [],
    index: 0,
    correctCount: 0,
    wrongCount: 0,
    quizStartedAtMs: 0,
    questionStartedAtMs: 0,
    questionLogs: [],
    currentQuestionWrongAttempts: 0,
    locked: false,
    learnActiveId: '',
    learnDeck: [],
    learnAudioPlaying: false,
    learnCategoryIndex: 0,
    sequenceCards: [],
    sequenceSlots: [null, null, null],
    sequenceLocked: false,
    sequenceStatus: 'idle',
    sequenceTimer: 0,
    sequenceDragId: '',
    sequencePointerDrag: null,
    sequenceSuppressClickUntil: 0,
    sequencePulseTimer: 0,
    sequenceRoundIndex: 0,
    sequenceCorrectCount: 0,
    sequenceWrongCount: 0,
    sequenceStartedAtMs: 0,
    sequenceRoundStartedAtMs: 0,
    sequenceRoundLogs: [],
    sequenceCurrentWrongAttempts: 0,
    sequenceImageQueues: {},
    sequenceLastImagePathByGroup: {},
    resultMode: 'quiz',
    relativeModuleKey: 'day',
    relativeDayIndex: 0,
    relativeAudioPlaying: false,
    relativeJumping: false,
    relativeJumpTimers: [],
    relativeCurrentOffset: 0,
    relativeWorldReady: false,
    relativePlaybackToken: 0,
    relativeLearnedIds: [],
    relativeReviewUnlocked: false,
    relativeAfterAudioAction: null,
    relativePromptNext: false
  };

  function readLaunchContext() {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search || '');
      const launchKey = String(params.get('labLaunchKey') || '').trim();
      if (launchKey && launchKey.indexOf(LAB_LAUNCH_CONTEXT_STORAGE_PREFIX) === 0 && typeof sessionStorage !== 'undefined') {
        const transient = window.HahaLabLearningHarness?.readLaunchContext?.();
        const raw = transient ? JSON.stringify(transient) : sessionStorage.getItem(launchKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
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
    } catch (_error) {
      return null;
    }
    return null;
  }

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

  function normalizeLabScope(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return '';
    if (normalized === 'playlab' || normalized === 'gamelab' || normalized === 'game') {
      return PLAYLAB_REPORT_SCOPE;
    }
    return normalized;
  }

  function buildLabSessionHistoryInsertRow(params) {
    const session = params && params.session ? params.session : {};
    const endTime = String((params && params.completedAt) || new Date().toISOString()).trim();
    const startTime = String((params && params.startedAt) || session.startedAt || endTime).trim();
    const normalizedScope = normalizeLabScope((params && (params.reportScope || params.labScope)) || '');
    const detailPayload = {
      report_scope: normalizedScope,
      lab_scope: normalizeLabScope((params && (params.labScope || params.reportScope)) || ''),
      lab_label: String((params && params.labLabel) || '').trim(),
      lab_title: String((params && (params.title || params.contentTitle || params.stageTitle || params.levelTitle)) || '').trim(),
      category_id: String((params && params.categoryId) || '').trim(),
      category_title: String((params && params.categoryTitle) || '').trim(),
      content_id: String((params && params.contentId) || '').trim(),
      content_title: String((params && params.contentTitle) || '').trim(),
      level_id: String((params && params.levelId) || '').trim(),
      level_title: String((params && params.levelTitle) || '').trim(),
      stage_id: String((params && params.stageId) || '').trim(),
      stage_title: String((params && params.stageTitle) || '').trim(),
      score: Number((params && params.score) || 0) || 0,
      correct_count: Number((params && params.correctCount) || 0) || 0,
      wrong_count: Number((params && params.wrongCount) || 0) || 0,
      total_questions: Number((params && params.totalQuestions) || 0) || 0,
      duration_minutes: Number((params && params.durationMinutes) || 0) || 0,
      completed_at: endTime,
      started_at: startTime,
      session_kind: normalizedScope
    };

    const detailPayloadText = JSON.stringify(Object.assign(
      {},
      detailPayload,
      parseMaybeJson(params && params.details, {})
    ));

    const metadataPayload = Object.assign(
      {
        report_scope: normalizedScope,
        lab_scope: normalizeLabScope((params && (params.labScope || params.reportScope)) || ''),
        lab_label: String((params && params.labLabel) || '').trim(),
        action_type: String((params && (params.labLabel || params.title || params.contentTitle || params.stageTitle || params.levelTitle)) || '').trim(),
        duration_minutes: Number((params && params.durationMinutes) || 0) || 0,
        duration: String(Math.max(0, Math.round(Number((params && params.durationMinutes) || 0) || 0))) + ' minutes'
      },
      parseMaybeJson(params && params.metadata, {})
    );

    return {
      teacher_id: String(session.teacherId || '').trim(),
      client_id: String(session.clientId || '').trim(),
      client_name: String(session.clientName || '').trim(),
      type: String(session.clientType || session.type || 'client').trim(),
      category: 'session_history',
      action: LAB_SESSION_COMPLETION_ACTION,
      action_type: String((params && (params.labLabel || params.title || params.contentTitle || params.stageTitle || params.levelTitle)) || '').trim(),
      event_datetime: endTime,
      start_datetime: startTime,
      end_datetime: endTime,
      duration: String(Math.max(0, Math.round(Number((params && params.durationMinutes) || 0) || 0))) + ' minutes',
      duration_minutes: Number((params && params.durationMinutes) || 0) || 0,
      details: detailPayloadText,
      metadata: metadataPayload,
      memo: String((params && (params.title || params.contentTitle || params.stageTitle || params.levelTitle || params.labLabel)) || '').trim()
    };
  }

  let supabaseClientPromise = null;
  const launchContext = readLaunchContext();

  function getSupabaseClient() {
    if (window.supabaseClient) {
      return Promise.resolve(window.supabaseClient);
    }
    if (supabaseClientPromise) {
      return supabaseClientPromise;
    }
    supabaseClientPromise = Promise.resolve().then(function () {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        return null;
      }
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      window.supabaseClient = client;
      return client;
    });
    return supabaseClientPromise;
  }

  const learnAudioMap = Object.keys(LEARN_AUDIO_PATHS).reduce(function (accumulator, key) {
    const audio = new Audio(LEARN_AUDIO_PATHS[key]);
    audio.preload = 'auto';
    accumulator[key] = audio;
    return accumulator;
  }, {});
  const labelAudioMap = Object.keys(LABEL_AUDIO_PATHS).reduce(function (accumulator, key) {
    const audio = new Audio(LABEL_AUDIO_PATHS[key]);
    audio.preload = 'auto';
    accumulator[key] = audio;
    return accumulator;
  }, {});
  const effectAudioMap = Object.keys(EFFECT_AUDIO_PATHS).reduce(function (accumulator, key) {
    const audio = new Audio(EFFECT_AUDIO_PATHS[key]);
    audio.preload = 'auto';
    accumulator[key] = audio;
    return accumulator;
  }, {});
  const relativeAllItems = Object.keys(RELATIVE_MODULES).reduce(function (accumulator, key) {
    return accumulator.concat(RELATIVE_MODULES[key].items);
  }, []);
  const relativeAudioMap = relativeAllItems.reduce(function (accumulator, item) {
    const audio = new Audio(item.audioPath);
    audio.preload = 'auto';
    accumulator[item.id] = audio;
    return accumulator;
  }, {});
  const relativeCueAudioMap = Object.keys(RELATIVE_CUE_AUDIO_PATHS).reduce(function (accumulator, key) {
    const audio = new Audio(RELATIVE_CUE_AUDIO_PATHS[key]);
    audio.preload = 'auto';
    accumulator[key] = audio;
    return accumulator;
  }, {});
  const relativeJumpAudio = new Audio(RELATIVE_JUMP_AUDIO_PATH);
  relativeJumpAudio.preload = 'auto';
  let currentLearnAudio = null;
  let currentLabelAudio = null;
  let currentEffectAudio = null;
  let currentRelativeAudio = null;
  let currentRelativeTransientAudio = null;
  let currentRelativeTravelAnimation = null;
  Object.keys(learnAudioMap).forEach(function (key) {
    learnAudioMap[key].addEventListener('ended', function () {
      state.learnAudioPlaying = false;
      if (currentLearnAudio === learnAudioMap[key]) {
        currentLearnAudio = null;
      }
      if (state.phase === 'learn' && state.learnActiveId) {
        state.learnActiveId = '';
        renderLearnCards();
      }
    });
  });
  Object.keys(relativeAudioMap).forEach(function (key) {
    relativeAudioMap[key].addEventListener('ended', function () {
      state.relativeAudioPlaying = false;
      if (currentRelativeAudio === relativeAudioMap[key]) {
        currentRelativeAudio = null;
      }
      state.relativePromptNext = state.relativeDayIndex < getRelativeItems().length - 1;
      const unlockedNow = markRelativeLearned(key);
      const afterAudioAction = state.relativeAfterAudioAction;
      state.relativeAfterAudioAction = null;
      updateRelativeButtonState();
      if (typeof afterAudioAction === 'function') {
        window.setTimeout(afterAudioAction, 220);
      } else if (unlockedNow) {
        window.setTimeout(scrollRelativeReviewIntoView, 220);
      }
    });
  });

  function shuffle(list) {
    const copy = list.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temp;
    }
    return copy;
  }

  function sample(list, count) {
    return shuffle(list).slice(0, count);
  }

  function sampleGroupImages(group, countsByVariant) {
    const pool = group ? group.images : [];
    const pairMap = pool.reduce(function (accumulator, item) {
      if (!accumulator[item.pairId]) {
        accumulator[item.pairId] = {};
      }
      accumulator[item.pairId][item.variant] = item;
      return accumulator;
    }, {});
    const pairIds = shuffle(Object.keys(pairMap));
    const selected = [];
    const photoCount = countsByVariant.photo || 0;
    const illustCount = countsByVariant.illust || 0;
    const usedPairIds = new Set();

    pairIds.forEach(function (pairId) {
      if (selected.length >= photoCount) return;
      if (!pairMap[pairId].photo) return;
      selected.push(pairMap[pairId].photo);
      usedPairIds.add(pairId);
    });

    pairIds.forEach(function (pairId) {
      if (selected.length >= photoCount + illustCount) return;
      if (usedPairIds.has(pairId)) return;
      if (!pairMap[pairId].illust) return;
      selected.push(pairMap[pairId].illust);
      usedPairIds.add(pairId);
    });

    return shuffle(selected);
  }

  function buildLearnDeck() {
    const currentItem = LEARN_ITEMS[state.learnCategoryIndex];
    const group = GROUPS.find(function (entry) {
      return entry.id === currentItem.groupId;
    });
    return sampleGroupImages(group, { photo: 2, illust: 1 }).map(function (imageItem, index) {
      return {
        id: currentItem.id + '-' + index,
        key: currentItem.id,
        label: currentItem.label,
        description: currentItem.description,
        title: currentItem.title,
        imagePath: imageItem.path
      };
    });
  }

  function setPhase(nextPhase) {
    state.phase = nextPhase;
    refs.categoryView.classList.toggle('is-active', nextPhase === 'categories');
    refs.learnView.classList.toggle('is-active', nextPhase === 'learn');
    refs.quizView.classList.toggle('is-active', nextPhase === 'quiz');
    refs.sequenceView.classList.toggle('is-active', nextPhase === 'sequence');
    refs.relativeDayView.classList.toggle('is-active', nextPhase === 'relativeDay');
    refs.resultView.classList.toggle('is-active', nextPhase === 'result');
    refs.stageSelectButton.classList.toggle('shell-hidden', nextPhase === 'categories');
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(nextPhase === 'result', {
        title: () => `시간 표현 배우기-${refs.resultTitle ? refs.resultTitle.textContent || '리포트' : '리포트'}`
      });
    }
    if (nextPhase !== 'result' && refs.resultReport) {
      refs.resultReport.innerHTML = '';
    }
  }

  function showConfirmModal() {
    refs.confirmModal.classList.add('is-active');
    refs.confirmModal.setAttribute('aria-hidden', 'false');
  }

  function hideConfirmModal() {
    refs.confirmModal.classList.remove('is-active');
    refs.confirmModal.setAttribute('aria-hidden', 'true');
  }

  function showRelativeIntroModal() {
    refs.relativeIntroModal.classList.add('is-active');
    refs.relativeIntroModal.setAttribute('aria-hidden', 'false');
  }

  function hideRelativeIntroModal() {
    refs.relativeIntroModal.classList.remove('is-active');
    refs.relativeIntroModal.setAttribute('aria-hidden', 'true');
  }

  function getRelativeModuleHelpContent() {
    if (state.relativeModuleKey === 'month') {
      return {
        title: '달 흐름 학습 안내',
        subtitle: '이번달, 지난달, 다음달을 달력의 앞뒤 흐름 속에서 이해하는 시간 개념 학습입니다.',
        methodTitle: '학습방법',
        methodItems: [
          '확인 버튼을 누른 뒤 화살표를 눌러 공이 달 칸을 따라 이동하는 모습을 봅니다.',
          '이번달에서 지난달, 다음달로 이어지는 순서를 소리와 함께 반복해서 확인합니다.',
          '학습이 끝난 뒤에는 복습 버튼을 눌러 원하는 달 표현을 다시 들어 봅니다.'
        ],
        benefitTitle: '학습효과',
        benefitItems: [
          '월 단위 시간 이동을 시각적으로 경험하며 달력 기반 시간 표상과 월 순서 개념을 안정적으로 형성합니다.',
          '현재를 기준으로 과거와 미래의 달을 비교하는 상대적 시간 추론 능력과 순차 처리 능력을 촉진합니다.',
          '별자리 정보와 함께 월 이름을 반복 노출해 시기 단서와 언어 표현을 통합적으로 기억하는 데 도움이 됩니다.'
        ]
      };
    }
    if (state.relativeModuleKey === 'year') {
      return {
        title: '해 흐름 학습 안내',
        subtitle: '올해, 작년, 내년을 해의 변화와 함께 이해하며 장기 시간 개념을 확장하는 학습입니다.',
        methodTitle: '학습방법',
        methodItems: [
          '확인 버튼을 누른 뒤 화살표를 눌러 공이 해 칸을 따라 이동하는 흐름을 봅니다.',
          '올해를 기준으로 작년, 재작년, 내년, 내후년이 어떻게 달라지는지 소리와 함께 확인합니다.',
          '마지막 복습 버튼에서 원하는 해 표현을 다시 눌러 반복 학습합니다.'
        ],
        benefitTitle: '학습효과',
        benefitItems: [
          '연 단위 시간 표상을 시각적으로 구조화해 장기 시간 개념과 연도 순서 이해를 강화합니다.',
          '자기 경험을 과거와 미래 연도로 연결하며 자전적 기억 회상과 미래 예측 기반의 시간 조망 능력을 자극합니다.',
          '12지 띠 단서를 함께 제시해 연도 정보의 의미 부호화와 회상 단서 활용 능력을 높이는 데 도움이 됩니다.'
        ]
      };
    }
    return {
      title: '날짜 흐름 학습 안내',
      subtitle: '오늘, 어제, 내일을 날짜와 요일의 흐름 속에서 이해하는 기초 시간 개념 학습입니다.',
      methodTitle: '학습방법',
      methodItems: [
        '확인 버튼을 누른 뒤 화살표를 눌러 공이 날짜 칸을 따라 이동하는 모습을 봅니다.',
        '오늘을 기준으로 어제, 그저께, 내일, 모레가 어떻게 이어지는지 소리와 함께 확인합니다.',
        '학습이 끝난 뒤 복습 버튼을 눌러 원하는 날짜 말을 다시 들어 봅니다.'
      ],
      benefitTitle: '학습효과',
      benefitItems: [
        '일 단위 시간 순서를 시각과 청각으로 함께 처리하며 기초 시간 방향성 인식과 날짜 순차 개념을 강화합니다.',
        '현재를 기준점으로 과거와 미래를 이동해 보는 경험이 상대적 시간 판단과 시간 지남력 형성에 도움을 줍니다.',
        '요일과 날짜를 함께 반복 제시해 일상 일정 이해, 회상 질문 응답, 시간 관련 어휘 사용의 정확도를 높입니다.'
      ]
    };
  }

  function getCurrentHelpContent() {
    if (state.phase === 'learn') {
      return {
        title: '오전, 오후, 저녁 알아보기 안내',
        subtitle: '사진을 누르며 하루 시간대를 직관적으로 익히는 기초 시간말 학습입니다.',
        methodTitle: '학습방법',
        methodItems: [
          '보이는 사진을 하나씩 눌러 시간말 소리와 설명을 듣습니다.',
          '좌우 화살표를 눌러 오전, 점심, 저녁 묶음을 차례대로 살펴봅니다.',
          '같은 시간대의 여러 장면을 비교하며 어떤 때인지 말로 따라 해 봅니다.'
        ],
        benefitTitle: '학습효과',
        benefitItems: [
          '시각 장면과 시간 어휘를 연결해 의미 매핑 정확도와 어휘 범주화 능력을 높입니다.',
          '하루 일과 장면을 시간대와 연결하며 일상 기반 시간 개념과 상황 이해력을 확장합니다.',
          '반복 청취를 통해 청각적 어휘 입력과 표현 회상 속도를 함께 강화합니다.'
        ]
      };
    }
    if (state.phase === 'quiz') {
      return {
        title: '지금은 언제인가요? 안내',
        subtitle: '그림을 보고 알맞은 시간말을 선택하며 시간 구분 능력을 점검하는 선택형 학습입니다.',
        methodTitle: '학습방법',
        methodItems: [
          '그림을 먼저 보고 지금이 어느 시간대인지 생각합니다.',
          '세 개의 보기 중 가장 알맞은 답을 눌러 확인합니다.',
          '정답과 오답 설명을 들으며 다음 문제로 넘어갑니다.'
        ],
        benefitTitle: '학습효과',
        benefitItems: [
          '시각 단서 기반 판단을 반복해 시간대 변별력과 의미 선택 정확도를 높입니다.',
          '유사한 시간 표현을 비교하며 의미 억제와 선택 주의집중 능력을 함께 훈련합니다.',
          '즉각 피드백 구조가 정오 반응 학습과 자기 수정 전략 형성에 도움을 줍니다.'
        ]
      };
    }
    if (state.phase === 'sequence') {
      return {
        title: '순서대로 카드 연결하기 안내',
        subtitle: '오전, 오후, 저녁 카드의 자연스러운 순서를 배열하며 시간 흐름을 조직화하는 학습입니다.',
        methodTitle: '학습방법',
        methodItems: [
          '아래 카드를 보고 오전, 오후, 저녁 순서를 먼저 생각합니다.',
          '카드를 드래그하거나 눌러 위 칸에 차례대로 놓습니다.',
          '8문제를 이어서 풀고 결과 화면에서 다시 확인합니다.'
        ],
        benefitTitle: '학습효과',
        benefitItems: [
          '시간대의 선형 순서를 직접 배열하며 순차적 추론과 시간 조직화 능력을 강화합니다.',
          '행동 장면을 시간대 범주에 배치하는 과정이 사건 순서화와 계획 언어 이해에 도움이 됩니다.',
          '오류 수정과 재배치를 반복하며 작업기억과 시각적 순서 점검 전략을 함께 자극합니다.'
        ]
      };
    }
    if (state.phase === 'relativeDay') {
      return getRelativeModuleHelpContent();
    }
    if (state.phase === 'result') {
      return {
        title: '학습 결과 안내',
        subtitle: '방금 끝낸 학습을 다시 하거나 다른 시간 학습으로 이어서 확장할 수 있습니다.',
        methodTitle: '학습방법',
        methodItems: [
          '결과 수치를 보고 내가 어느 부분을 잘했는지 먼저 확인합니다.',
          '같은 학습을 다시 하며 반복 연습하거나 스테이지 선택으로 돌아갑니다.',
          '익숙해진 뒤에는 다른 시간 학습으로 넘어가 표현 범위를 넓혀 봅니다.'
        ],
        benefitTitle: '학습효과',
        benefitItems: [
          '반복 수행 결과를 확인하는 과정이 자기 모니터링과 수행 인식 형성에 도움이 됩니다.',
          '누적 학습 경험이 시간 어휘의 장기 기억 고정과 일반화된 사용 가능성을 높입니다.',
          '단계 간 확장 학습을 통해 시간 표현 체계를 범주별로 통합하는 데 유리합니다.'
        ]
      };
    }
    return {
      title: '시간 표현 배우기 안내',
      subtitle: '하루 시간대와 날짜, 달, 해의 흐름을 단계별로 배우는 통합 시간말 학습입니다.',
      methodTitle: '학습방법',
      methodItems: [
        '배우고 싶은 카테고리를 고른 뒤 화면 안내에 따라 차례대로 진행합니다.',
        '사진, 선택지, 카드 배열, 공 점프 활동을 통해 시간 흐름을 다양한 방식으로 경험합니다.',
        '소리와 설명을 반복해서 들으며 시간 표현을 일상 장면과 연결합니다.'
      ],
      benefitTitle: '학습효과',
      benefitItems: [
        '시간 관련 어휘를 범주별로 구조화해 시간 개념 형성과 언어 이해의 기초를 다집니다.',
        '시각, 청각, 선택, 순서 배열을 함께 활용해 다중감각 기반 시간 정보 처리 능력을 확장합니다.',
        '일상 생활의 사건을 시간 축 위에 배치하는 능력이 향상되어 표현력과 상황 이해력이 함께 자랍니다.'
      ]
    };
  }

  function getAverageDuration(logs) {
    const safeLogs = Array.isArray(logs) ? logs : [];
    const durations = safeLogs.map(function (entry) {
      return Number(entry && entry.durationMs) || 0;
    }).filter(function (value) {
      return value > 0;
    });
    if (!durations.length) return 0;
    return Math.round(durations.reduce(function (sum, value) {
      return sum + value;
    }, 0) / durations.length);
  }

  function getReportAxisAverage(report, axisIds) {
    if (!report || !Array.isArray(report.axes)) return 0;
    const values = report.axes.filter(function (axis) {
      return axisIds.indexOf(axis.id) !== -1;
    }).map(function (axis) {
      return Number(axis.score || 0) || 0;
    }).filter(function (value) {
      return value > 0;
    });
    if (!values.length) return 0;
    return Math.round(values.reduce(function (sum, value) {
      return sum + value;
    }, 0) / values.length);
  }

  function getQuizStageTitle() {
    return '지금은 언제인가요?';
  }

  function getSequenceStageTitle() {
    return '순서대로 카드 연결하기';
  }

  function buildQuizReportInput() {
    const totalQuestions = Math.max(1, state.questions.length);
    const correctCount = Math.max(0, Number(state.correctCount) || 0);
    const wrongCount = Math.max(0, Number(state.wrongCount) || 0);
    const firstTryPerfectCount = state.questionLogs.filter(function (log) {
      return Number(log && log.wrongAttempts) === 0;
    }).length;
    const coverageSet = new Set(state.questionLogs.map(function (log) {
      return String(log && log.groupId || '').trim();
    }).filter(Boolean));
    const elapsedMs = Math.max(0, Date.now() - Number(state.quizStartedAtMs || Date.now()));
    const accuracyRate = Math.round((correctCount / Math.max(correctCount + wrongCount, totalQuestions)) * 100);
    const conceptCoverage = Math.round((coverageSet.size / GROUPS.length) * 100);
    const correctionRecoveryRate = Math.max(0, Math.min(100, 100 - (wrongCount * 6)));

    return {
      reportType: 'time-dayparts-quiz',
      reportScope: PLAYLAB_REPORT_SCOPE,
      labScope: PLAYLAB_REPORT_SCOPE,
      labKind: PLAYLAB_REPORT_SCOPE,
      title: PAGE_TITLE,
      stageTitle: getQuizStageTitle(),
      totalItems: totalQuestions,
      totalQuestions: totalQuestions,
      correctCount: correctCount,
      completionCount: correctCount,
      wrongCount: wrongCount,
      perfectCount: firstTryPerfectCount,
      firstTryRate: Math.round((firstTryPerfectCount / totalQuestions) * 100),
      accuracyRate: accuracyRate,
      elapsedMs: elapsedMs,
      avgQuestionMs: getAverageDuration(state.questionLogs),
      questionLogs: state.questionLogs.slice(),
      startedAtMs: state.quizStartedAtMs || Date.now(),
      conceptCoverage: conceptCoverage,
      correctionRecoveryRate: correctionRecoveryRate,
      normProfile: 'lower-elementary',
      accentColor: '#f59e0b'
    };
  }

  function buildSequenceReportInput() {
    const totalRounds = Math.max(1, SEQUENCE_TOTAL_ROUNDS);
    const wrongPlacements = Math.max(0, Number(state.sequenceWrongCount) || 0);
    const perfectRounds = state.sequenceRoundLogs.filter(function (log) {
      return Number(log && log.wrongAttempts) === 0;
    }).length;
    const totalPlacements = totalRounds * 3;
    const elapsedMs = Math.max(0, Date.now() - Number(state.sequenceStartedAtMs || Date.now()));
    const placementAccuracy = Math.round((totalPlacements / Math.max(totalPlacements + wrongPlacements, 1)) * 100);
    const transitionStability = Math.max(0, Math.min(100, 100 - (wrongPlacements * 5)));

    return {
      reportType: 'time-dayparts-sequence',
      reportScope: PLAYLAB_REPORT_SCOPE,
      labScope: PLAYLAB_REPORT_SCOPE,
      labKind: PLAYLAB_REPORT_SCOPE,
      title: PAGE_TITLE,
      stageTitle: getSequenceStageTitle(),
      totalItems: totalRounds,
      totalQuestions: totalRounds,
      correctCount: totalRounds,
      completionCount: totalRounds,
      wrongCount: wrongPlacements,
      perfectCount: perfectRounds,
      firstTryRate: Math.round((perfectRounds / totalRounds) * 100),
      accuracyRate: placementAccuracy,
      elapsedMs: elapsedMs,
      avgQuestionMs: getAverageDuration(state.sequenceRoundLogs),
      questionLogs: state.sequenceRoundLogs.slice(),
      startedAtMs: state.sequenceStartedAtMs || Date.now(),
      placementAccuracy: placementAccuracy,
      transitionStability: transitionStability,
      normProfile: 'lower-elementary',
      accentColor: '#8b5cf6'
    };
  }

  function renderResultReport(report) {
    if (!refs.resultReport) return;
    if (report && report.isSimpleResult) {
      refs.resultReport.innerHTML = '';
      return;
    }
    if (!report || !window.PlaylabReportEngine || typeof window.PlaylabReportEngine.renderHtml !== 'function') {
      refs.resultReport.innerHTML = '';
      return;
    }
    refs.resultReport.innerHTML = window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' });
  }

  function buildReportRecommendationLines(report) {
    return (report && Array.isArray(report.recommendations) ? report.recommendations : []).map(function (item) {
      if (!item) return '';
      const title = String(item.title || '').trim();
      const desc = String(item.desc || '').trim();
      return title && desc ? title + ': ' + desc : (title || desc);
    }).filter(Boolean);
  }

  function buildTimeDaypartsDualModeFields(reportInput, report, options) {
    const stageTitle = String(options && options.stageTitle || PAGE_TITLE).trim() || PAGE_TITLE;
    const guardianSummary = '이번 시간 개념 활동에서는 ' + stageTitle + ' 과제의 정답 흐름과 참여 상태가 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.';
    const teacherReviewNote = '시간 개념 결과는 순서 이해, 언어 단서 처리, 반응 정확도를 함께 보는 참고 기록입니다. 다음 활동과 난이도는 담당 선생님이 내담자의 컨디션과 수업 맥락을 함께 확인해 조정합니다.';
    const actionPlanSummary = '다음 시간 개념 활동은 자동 확정하지 않고 선생님 검토 후 조정합니다.';
    return {
      guardianSummary: guardianSummary,
      teacherReviewNote: teacherReviewNote,
      actionPlanSummary: actionPlanSummary,
      actionPlanPolicy: 'teacher-review-required',
      reportDisplayModes: {
        guardian: {
          label: '보호자 공유',
          summary: guardianSummary
        },
        teacher: {
          label: '전문가 분석',
          summary: teacherReviewNote
        }
      }
    };
  }

  function saveResultHistory(reportInput, report, options) {
    if (PLAYLAB_REPORT_SCOPE !== 'rehab' && PLAYLAB_REPORT_SCOPE !== 'cardlab') return Promise.resolve({ skipped: true });
    const stageTitle = String(options && options.stageTitle || '').trim();
    const session = {
      teacherId: String(launchContext && launchContext.teacherId || '').trim(),
      clientId: String(launchContext && launchContext.clientId || '').trim(),
      clientName: String(launchContext && launchContext.clientName || '').trim(),
      clientType: String(launchContext && launchContext.clientType || 'client').trim() || 'client'
    };
    if (!session.teacherId || !session.clientId) {
      return Promise.resolve({ skipped: true });
    }

    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(reportInput.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(report.elapsedMs || reportInput.elapsedMs || 0) / 60000));
    const dualModeFields = buildTimeDaypartsDualModeFields(reportInput, report, options);
    const detailPayload = {
      report_scope: PLAYLAB_REPORT_SCOPE,
      lab_scope: PLAYLAB_REPORT_SCOPE,
      lab_label: PLAYLAB_LABEL,
      game_name: PAGE_TITLE,
      report_title: stageTitle,
      category_title: PAGE_TITLE,
      stage_title: stageTitle,
      score: Number(report.integratedScore || 0) || 0,
      accuracy_score: Number(report.accuracyRate || 0) || 0,
      correct_count: Number(reportInput.correctCount || 0) || 0,
      wrong_count: Number(reportInput.wrongCount || 0) || 0,
      total_questions: Number(reportInput.totalQuestions || reportInput.totalItems || 0) || 0,
      duration_minutes: durationMinutes,
      report_type: String(reportInput.reportType || '').trim(),
      report_input: reportInput,
      report_integrated_score: Number(report.integratedScore || 0) || 0,
      report_headline: String(report.headline || '').trim(),
      report_brief_opinion: String(report.briefOpinion || '').trim(),
      report_guardian_summary: dualModeFields.guardianSummary,
      report_teacher_review_note: dualModeFields.teacherReviewNote,
      report_action_plan_summary: dualModeFields.actionPlanSummary,
      report_action_plan_policy: dualModeFields.actionPlanPolicy,
      report_display_modes: dualModeFields.reportDisplayModes,
      report_overview: String(report.longOpinion || '').trim(),
      report_recommendations: buildReportRecommendationLines(report),
      report_axes: Array.isArray(report.axes) ? report.axes.map(function (axis) {
        return {
          id: String(axis.id || '').trim(),
          label: String(axis.label || '').trim(),
          score: Number(axis.score || 0) || 0
        };
      }) : [],
      report_cognitive_score: getReportAxisAverage(report, ['timeSense', 'sequencing', 'language']),
      report_reaction_score: getReportAxisAverage(report, ['speed', 'attention', 'selfMonitoring']),
      report_focus_key: String(options && options.focusKey || 'time').trim(),
      report_focus_label: String(options && options.focusLabel || '시간 개념').trim()
    };

    return getSupabaseClient().then(function (client) {
      if (!client) return { skipped: true };
      const row = buildLabSessionHistoryInsertRow({
        session: session,
        reportScope: PLAYLAB_REPORT_SCOPE,
        labScope: PLAYLAB_REPORT_SCOPE,
        labLabel: PLAYLAB_LABEL,
        title: PAGE_TITLE,
        categoryTitle: PAGE_TITLE,
        stageTitle: stageTitle,
        score: Number(report.integratedScore || 0) || 0,
        correctCount: Number(reportInput.correctCount || 0) || 0,
        wrongCount: Number(reportInput.wrongCount || 0) || 0,
        totalQuestions: Number(reportInput.totalQuestions || reportInput.totalItems || 0) || 0,
        durationMinutes: durationMinutes,
        startedAt: startedAt,
        completedAt: completedAt,
        details: detailPayload,
        metadata: {
          report_scope: PLAYLAB_REPORT_SCOPE,
          lab_scope: PLAYLAB_REPORT_SCOPE,
          report_integrated_score: Number(report.integratedScore || 0) || 0,
          report_cognitive_score: detailPayload.report_cognitive_score,
          report_reaction_score: detailPayload.report_reaction_score,
          report_guardian_summary: dualModeFields.guardianSummary,
          report_teacher_review_note: dualModeFields.teacherReviewNote,
          report_action_plan_summary: dualModeFields.actionPlanSummary,
          report_action_plan_policy: dualModeFields.actionPlanPolicy,
          report_display_modes: dualModeFields.reportDisplayModes
        }
      });
      const historyPromise = client.from('histories').insert(row).then(function (result) {
        if (result && result.error) throw result.error;
        return result;
      });
      if (PLAYLAB_REPORT_SCOPE !== 'cardlab') return historyPromise;
      const totalQuestions = Number(reportInput.totalQuestions || reportInput.totalItems || 0) || 0;
      const correctCount = Number(reportInput.correctCount || 0) || 0;
      const wrongCount = Number(reportInput.wrongCount || 0) || 0;
      const durationSeconds = Math.max(1, Math.round(Number(report.elapsedMs || reportInput.elapsedMs || 0) / 1000));
      const stageKey = String(reportInput.reportType || options && options.focusKey || 'time-dayparts').trim() || 'time-dayparts';
      const stageOrder = stageKey === 'time-dayparts-sequence' || stageKey === 'time-sequence' ? 2 : 1;
      const cardlabPayload = {
        p_client_id: session.clientId,
        p_teacher_id: session.teacherId,
        p_curriculum_key: CARDLAB_TIME_DAYPARTS_CURRICULUM_KEY,
        p_stage_key: stageKey,
        p_stage_order: stageOrder,
        p_stage_title: stageTitle || PAGE_TITLE,
        p_total_questions: totalQuestions,
        p_correct_count: correctCount,
        p_wrong_count: wrongCount,
        p_score: Number(report.integratedScore || detailPayload.accuracy_score || 0) || 0,
        p_cleared: totalQuestions > 0 && correctCount >= totalQuestions,
        p_duration_seconds: durationSeconds,
        p_wrong_asset_ids: [],
        p_wrong_words: [],
        p_question_snapshot: Array.isArray(reportInput.questionLogs) ? reportInput.questionLogs : [],
        p_result_snapshot: []
      };
      const cardlabAttemptPromise = client.rpc('record_cardlab_learning_attempt', cardlabPayload).then(function (result) {
        if (result && result.error) throw result.error;
        return result;
      });
      return Promise.all([historyPromise, cardlabAttemptPromise]);
    }).catch(function (error) {
      console.error('[time-dayparts] history save failed:', error);
      return { error: error };
    });
  }

  function playAudio(id) {
    const audio = learnAudioMap[id];
    if (!audio) return;
    try {
      state.learnAudioPlaying = true;
      Object.keys(learnAudioMap).forEach(function (key) {
        const item = learnAudioMap[key];
        item.pause();
        item.currentTime = 0;
      });
      currentLearnAudio = audio;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    } catch (error) {
      // Ignore blocked autoplay errors for tap interactions.
    }
  }

  function playLabelAudio(label) {
    const audio = labelAudioMap[label];
    if (!audio) return;
    try {
      if (currentLabelAudio) {
        currentLabelAudio.pause();
        currentLabelAudio.currentTime = 0;
      }
      currentLabelAudio = audio;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    } catch (error) {
      // Ignore blocked autoplay errors for tap interactions.
    }
  }

  function playEffectAudio(kind) {
    const audio = effectAudioMap[kind];
    if (!audio) return;
    try {
      if (currentEffectAudio && currentEffectAudio !== audio) {
        currentEffectAudio.pause();
        currentEffectAudio.currentTime = 0;
      }
      currentEffectAudio = audio;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    } catch (error) {
      // Ignore blocked autoplay errors for tap interactions.
    }
  }

  function vibrate(pattern) {
    if (navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  }

  function getRelativeModule() {
    return RELATIVE_MODULES[state.relativeModuleKey] || RELATIVE_MODULES.day;
  }

  function getRelativeItems() {
    return getRelativeModule().items;
  }

  function getRelativeDayItem() {
    return getRelativeItems()[state.relativeDayIndex];
  }

  function getOffsetLabel(offset) {
    if (offset === -2) return '그저께';
    if (offset === -1) return '어제';
    if (offset === 0) return '오늘';
    if (offset === 1) return '내일';
    if (offset === 2) return '모레';
    return '날짜';
  }

  function getMonthOffsetLabel(offset) {
    if (offset === -2) return '지지난달';
    if (offset === -1) return '지난달';
    if (offset === 0) return '이번달';
    if (offset === 1) return '다음달';
    if (offset === 2) return '다다음달';
    return '달';
  }

  function getYearOffsetLabel(offset) {
    if (offset === -2) return '재작년';
    if (offset === -1) return '작년';
    if (offset === 0) return '올해';
    if (offset === 1) return '내년';
    if (offset === 2) return '내후년';
    return '해';
  }

  function buildDateByOffset(offset) {
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    base.setDate(base.getDate() + offset);
    return base;
  }

  function formatDateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function getDateTone(date) {
    const dateKey = formatDateKey(date);
    const holidaySet = KOREA_PUBLIC_HOLIDAYS_BY_YEAR[date.getFullYear()] || [];
    if (holidaySet.indexOf(dateKey) !== -1 || date.getDay() === 0) {
      return 'holiday';
    }
    if (date.getDay() === 6) {
      return 'saturday';
    }
    return 'default';
  }

  function formatDateInfo(offset) {
    const date = buildDateByOffset(offset);
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return {
      offset: offset,
      label: getOffsetLabel(offset),
      fullDate: (date.getMonth() + 1) + '월 ' + date.getDate() + '일',
      subText: weekdays[date.getDay()],
      tone: getDateTone(date)
    };
  }

  function buildMonthByOffset(offset) {
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    base.setDate(1);
    base.setMonth(base.getMonth() + offset);
    return base;
  }

  function getMonthConstellation(month) {
    const constellations = {
      1: '염소자리 · 물병자리',
      2: '물병자리 · 물고기자리',
      3: '물고기자리 · 양자리',
      4: '양자리 · 황소자리',
      5: '황소자리 · 쌍둥이자리',
      6: '쌍둥이자리 · 게자리',
      7: '게자리 · 사자자리',
      8: '사자자리 · 처녀자리',
      9: '처녀자리 · 천칭자리',
      10: '천칭자리 · 전갈자리',
      11: '전갈자리 · 사수자리',
      12: '사수자리 · 염소자리'
    };
    return constellations[month] || '';
  }

  function formatMonthInfo(offset) {
    const date = buildMonthByOffset(offset);
    const month = date.getMonth() + 1;
    return {
      offset: offset,
      label: getMonthOffsetLabel(offset),
      fullDate: month + '월',
      subText: getMonthConstellation(month),
      tone: 'default'
    };
  }

  function getYearZodiac(year) {
    const zodiacs = ['쥐띠', '소띠', '호랑이띠', '토끼띠', '용띠', '뱀띠', '말띠', '양띠', '원숭이띠', '닭띠', '개띠', '돼지띠'];
    return zodiacs[(year - 4) % 12] || '';
  }

  function formatYearInfo(offset) {
    const baseYear = new Date().getFullYear();
    const year = baseYear + offset;
    return {
      offset: offset,
      label: getYearOffsetLabel(offset),
      fullDate: year + '년',
      subText: getYearZodiac(year),
      tone: 'default'
    };
  }

  function clearRelativeTimers() {
    state.relativeJumpTimers.forEach(function (timerId) {
      window.clearTimeout(timerId);
    });
    state.relativeJumpTimers = [];
    state.relativeJumping = false;
    state.relativePlaybackToken += 1;
    state.relativeAfterAudioAction = null;
    state.relativePromptNext = false;
    if (refs.relativeScene) {
      refs.relativeScene.classList.remove('is-traveling');
    }
    if (refs.relativeWorld) {
      refs.relativeWorld.classList.remove('is-jumping');
      refs.relativeWorld.style.top = '';
      if (currentRelativeTravelAnimation) {
        currentRelativeTravelAnimation.cancel();
        currentRelativeTravelAnimation = null;
      }
    }
    updateRelativeButtonState();
  }

  function stopRelativeAudio() {
    state.relativePlaybackToken += 1;
    state.relativeAfterAudioAction = null;
    state.relativePromptNext = false;
    if (currentRelativeAudio) {
      currentRelativeAudio.pause();
      currentRelativeAudio.currentTime = 0;
      currentRelativeAudio = null;
    }
    state.relativeAudioPlaying = false;
    if (currentRelativeTransientAudio) {
      currentRelativeTransientAudio.pause();
      currentRelativeTransientAudio.currentTime = 0;
      currentRelativeTransientAudio = null;
    }
    updateRelativeButtonState();
  }

  function updateRelativeButtonState() {
    const isBusy = state.relativeAudioPlaying || state.relativeJumping;
    const relativeItems = getRelativeItems();
    refs.relativePrevButton.disabled = isBusy || state.relativeDayIndex === 0;
    refs.relativeNextButton.disabled = isBusy || state.relativeDayIndex === relativeItems.length - 1;
    refs.relativeNextButton.classList.toggle(
      'is-attention',
      state.phase === 'relativeDay' && !isBusy && state.relativePromptNext && state.relativeDayIndex < relativeItems.length - 1
    );
    if (refs.relativeReviewGrid) {
      Array.prototype.slice.call(refs.relativeReviewGrid.querySelectorAll('.time-relative-review-btn')).forEach(function (button) {
        button.disabled = isBusy;
      });
    }
  }

  function initRelativeWorld() {
    if (state.relativeWorldReady || !refs.relativeWorld) return;
    refs.relativeWorld.innerHTML =
      '<div class="cube-container" aria-hidden="true">' +
      '  <div class="cube"></div>' +
      '</div>';
    state.relativeWorldReady = true;
  }

  function resizeRelativeWorld() {
    return;
  }

  function triggerRelativeWorldJump() {
    if (!refs.relativeWorld) return;
    refs.relativeWorld.classList.remove('is-jumping');
    void refs.relativeWorld.offsetWidth;
    refs.relativeWorld.classList.add('is-jumping');
    const jumpResetTimer = window.setTimeout(function () {
      refs.relativeWorld.classList.remove('is-jumping');
    }, 620);
    state.relativeJumpTimers.push(jumpResetTimer);
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function playRelativeTransientAudio(audio, volume) {
    if (!audio) return Promise.resolve();
    return new Promise(function (resolve) {
      try {
        if (currentRelativeTransientAudio && currentRelativeTransientAudio !== audio) {
          currentRelativeTransientAudio.pause();
          currentRelativeTransientAudio.currentTime = 0;
        }
        currentRelativeTransientAudio = audio;
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;

        const cleanup = function () {
          audio.removeEventListener('ended', cleanup);
          audio.removeEventListener('pause', cleanup);
          audio.removeEventListener('error', cleanup);
          if (currentRelativeTransientAudio === audio) {
            currentRelativeTransientAudio = null;
          }
          resolve();
        };

        audio.addEventListener('ended', cleanup, { once: true });
        audio.addEventListener('pause', cleanup, { once: true });
        audio.addEventListener('error', cleanup, { once: true });

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            cleanup();
          });
        }
      } catch (error) {
        resolve();
      }
    });
  }

  function playRelativeCue(cueId) {
    if (!cueId) return Promise.resolve();
    return playRelativeTransientAudio(relativeCueAudioMap[cueId], 0.96);
  }

  function playRelativeJumpSound() {
    return playRelativeTransientAudio(relativeJumpAudio, 0.15);
  }

  function clearRelativeJourneyClasses() {
    Array.prototype.slice.call(refs.relativeDateRail.querySelectorAll('.time-relative-date-card')).forEach(function (card) {
      card.classList.remove('is-current', 'is-cleared', 'is-landing');
    });
  }

  function applyRelativeJourneyState(currentOffset, visitedOffsets, landingOffset) {
    clearRelativeJourneyClasses();
    visitedOffsets.forEach(function (offset) {
      const card = refs.relativeDateRail.querySelector('[data-offset="' + offset + '"]');
      if (card) {
        card.classList.add('is-cleared');
      }
    });
    if (currentOffset !== null && currentOffset !== undefined) {
      const currentCard = refs.relativeDateRail.querySelector('[data-offset="' + currentOffset + '"]');
      if (currentCard) {
        currentCard.classList.add('is-current');
      }
    }
    if (landingOffset !== null && landingOffset !== undefined) {
      const landingCard = refs.relativeDateRail.querySelector('[data-offset="' + landingOffset + '"]');
      if (landingCard) {
        landingCard.classList.add('is-landing');
      }
    }
  }

  function playRelativeAudio(itemId) {
    const audio = relativeAudioMap[itemId];
    if (!audio) return;
    try {
      stopRelativeAudio();
      currentRelativeAudio = audio;
      state.relativeAudioPlaying = true;
      updateRelativeButtonState();
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          state.relativeAudioPlaying = false;
          updateRelativeButtonState();
        });
      }
    } catch (error) {
      state.relativeAudioPlaying = false;
      updateRelativeButtonState();
    }
  }

  function getRelativeCardCenter(offset) {
    const currentItem = getRelativeDayItem();
    let target = null;
    if (currentItem && Array.isArray(currentItem.boxOffsets)) {
      const targetIndex = currentItem.boxOffsets.indexOf(offset);
      if (targetIndex !== -1) {
        target = refs.relativeDateRail.children[targetIndex] || null;
      }
    }
    if (!target) {
      target = refs.relativeDateRail.querySelector('[data-offset="' + offset + '"]');
    }
    if (!target) return refs.relativeScene.clientWidth / 2;
    const sceneRect = refs.relativeScene.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return targetRect.left - sceneRect.left + (targetRect.width / 2);
  }

  function moveRelativeWorldAlongCurve(fromOffset, toOffset, durationMs) {
    if (!refs.relativeWorld || fromOffset === toOffset) return Promise.resolve();

    if (currentRelativeTravelAnimation) {
      currentRelativeTravelAnimation.cancel();
      currentRelativeTravelAnimation = null;
    }

    const startLeft = getRelativeCardCenter(fromOffset);
    const endLeft = getRelativeCardCenter(toOffset);
    const startTop = refs.relativeWorld.offsetTop || 7;
    const distance = endLeft - startLeft;
    const arcHeight = Math.max(18, Math.min(42, Math.abs(distance) * 0.18));

    refs.relativeWorld.style.left = startLeft + 'px';
    refs.relativeWorld.style.top = startTop + 'px';

    const animation = refs.relativeWorld.animate(
      [
        { left: startLeft + 'px', top: startTop + 'px', offset: 0, easing: 'ease-out' },
        { left: startLeft + (distance * 0.5) + 'px', top: (startTop - arcHeight) + 'px', offset: 0.5, easing: 'ease-in-out' },
        { left: endLeft + 'px', top: startTop + 'px', offset: 1, easing: 'ease-in' }
      ],
      {
        duration: durationMs || 520,
        easing: 'linear',
        fill: 'forwards'
      }
    );

    currentRelativeTravelAnimation = animation;

    return new Promise(function (resolve) {
      const finish = function () {
        if (currentRelativeTravelAnimation === animation) {
          currentRelativeTravelAnimation = null;
        }
        refs.relativeWorld.style.left = endLeft + 'px';
        refs.relativeWorld.style.top = startTop + 'px';
        resolve();
      };

      animation.addEventListener('finish', finish, { once: true });
      animation.addEventListener('cancel', finish, { once: true });
    });
  }

  function placeRelativeSheep(offset, shouldJump) {
    const center = getRelativeCardCenter(offset);
    refs.relativeWorld.style.left = center + 'px';
    state.relativeCurrentOffset = offset;
    if (shouldJump) {
      triggerRelativeWorldJump();
    }
  }

  async function playRelativeJump(item) {
    clearRelativeTimers();
    const path = item.jumpPath.slice();
    if (!path.length) return;

    const playbackToken = state.relativePlaybackToken;
    state.relativeJumping = true;
    if (refs.relativeScene) {
      refs.relativeScene.classList.toggle('is-traveling', path.length > 1);
    }
    updateRelativeButtonState();
    const visitedOffsets = [];

    applyRelativeJourneyState(path[0], visitedOffsets, null);
    placeRelativeSheep(path[0], false);

    playRelativeJumpSound();
    placeRelativeSheep(path[0], true);
    applyRelativeJourneyState(path[0], visitedOffsets, path[0]);
    await delay(520);
    if (playbackToken !== state.relativePlaybackToken) return;

    if (path.length === 1) {
      await playRelativeCue(item.jumpCueIds && item.jumpCueIds[0]);
      if (playbackToken !== state.relativePlaybackToken) return;
      applyRelativeJourneyState(path[0], visitedOffsets, path[0]);
      if (refs.relativeScene) {
        refs.relativeScene.classList.remove('is-traveling');
      }
      state.relativeJumping = false;
      updateRelativeButtonState();
      playRelativeAudio(item.id);
      return;
    }

    await playRelativeCue(item.jumpCueIds && item.jumpCueIds[0]);
    if (playbackToken !== state.relativePlaybackToken) return;
    await delay(120);
    if (playbackToken !== state.relativePlaybackToken) return;

    for (let index = 1; index < path.length; index += 1) {
      const currentOffset = path[index - 1];
      const nextOffset = path[index];
      if (playbackToken !== state.relativePlaybackToken) return;
      playRelativeJumpSound();
      triggerRelativeWorldJump();
      await moveRelativeWorldAlongCurve(currentOffset, nextOffset, 520);
      state.relativeCurrentOffset = nextOffset;
      applyRelativeJourneyState(nextOffset, visitedOffsets.concat(currentOffset), nextOffset);
      visitedOffsets.push(currentOffset);
      if (playbackToken !== state.relativePlaybackToken) return;
      await playRelativeCue(item.jumpCueIds && item.jumpCueIds[index]);
      if (playbackToken !== state.relativePlaybackToken) return;
      await delay(120);
      if (playbackToken !== state.relativePlaybackToken) return;
    }

    if (refs.relativeScene) {
      refs.relativeScene.classList.remove('is-traveling');
    }
    state.relativeJumping = false;
    updateRelativeButtonState();
    playRelativeAudio(item.id);
  }

  function showRelativeMeaning(item) {
    refs.meaningTitle.textContent = item.label;
    refs.meaningBody.textContent = item.description;
    refs.meaningToast.classList.add('is-visible');
    refs.meaningToast.setAttribute('aria-hidden', 'false');
  }

  function runRelativeCurrentItem() {
    const item = getRelativeDayItem();
    if (!item || state.relativeAudioPlaying || state.relativeJumping) return;
    state.relativePromptNext = false;
    updateRelativeButtonState();
    showRelativeMeaning(item);
    playRelativeJump(item);
  }

  function getRelativeTitleMarkup(item) {
    if (!item) return '';
    const accent = '<span class="time-relative-title-accent">' + item.label + '</span>';
    return item.title.replace(item.label, accent);
  }

  function scrollRelativeReviewIntoView() {
    if (!refs.relativeReviewSection || refs.relativeReviewSection.hidden) return;
    refs.relativeReviewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function markRelativeLearned(itemId) {
    if (state.relativeLearnedIds.indexOf(itemId) === -1) {
      state.relativeLearnedIds.push(itemId);
    }
    const allLearned = state.relativeLearnedIds.length >= getRelativeItems().length;
    const justUnlocked = allLearned && !state.relativeReviewUnlocked;
    state.relativeReviewUnlocked = allLearned;
    renderRelativeReviewButtons();
    return justUnlocked;
  }

  function renderRelativeReviewButtons() {
    if (!refs.relativeReviewSection || !refs.relativeReviewGrid) return;
    refs.relativeReviewSection.hidden = !state.relativeReviewUnlocked;
    refs.relativeReviewGrid.innerHTML = '';
    if (!state.relativeReviewUnlocked) return;

    getRelativeModule().reviewOrder.forEach(function (itemId) {
      const item = getRelativeItems().find(function (candidate) {
        return candidate.id === itemId;
      });
      if (!item) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'time-relative-review-btn';
      button.textContent = item.label;
      button.disabled = state.relativeAudioPlaying || state.relativeJumping;
      button.addEventListener('click', function () {
        if (state.relativeAudioPlaying || state.relativeJumping) return;
        stopRelativeAudio();
        clearRelativeTimers();
        hideMeaningToast();
        state.relativeDayIndex = getRelativeItems().findIndex(function (candidate) {
          return candidate.id === itemId;
        });
        renderRelativeDayView();
        state.relativeAfterAudioAction = scrollRelativeReviewIntoView;
        runRelativeCurrentItem();
      });
      refs.relativeReviewGrid.appendChild(button);
    });
  }

  function renderRelativeDayView() {
    const module = getRelativeModule();
    const item = getRelativeDayItem();
    if (!item) return;

    refs.relativeDayTitle.innerHTML = getRelativeTitleMarkup(item);
    refs.relativeDayChip.textContent = String(state.relativeDayIndex + 1) + ' / ' + String(getRelativeItems().length);
    refs.relativeDateRail.innerHTML = '';

    item.boxOffsets.map(module.formatInfo).forEach(function (info) {
      const card = document.createElement('div');
      card.className = 'time-relative-date-card time-relative-date-card--' + info.tone + (info.offset === item.focusOffset ? ' is-focus' : '');
      card.dataset.offset = String(info.offset);
      card.innerHTML =
        '<span class="time-relative-date-badge">' + info.label + '</span>' +
        '<strong class="time-relative-date-full">' + info.fullDate + '</strong>' +
        (info.subText ? '<span class="time-relative-date-weekday">' + info.subText + '</span>' : '');
      refs.relativeDateRail.appendChild(card);
    });

    placeRelativeSheep(item.startOffset, false);
    applyRelativeJourneyState(item.startOffset, [], null);
    renderRelativeReviewButtons();
    updateRelativeButtonState();
  }

  function changeRelativeDay(step) {
    const relativeItems = getRelativeItems();
    const nextIndex = state.relativeDayIndex + step;
    if (nextIndex < 0 || nextIndex >= relativeItems.length) return;
    stopRelativeAudio();
    clearRelativeTimers();
    hideMeaningToast();
    state.relativePromptNext = false;
    state.relativeDayIndex = nextIndex;
    renderRelativeDayView();
    runRelativeCurrentItem();
  }

  function startRelativeLearning(moduleKey) {
    const module = RELATIVE_MODULES[moduleKey] || RELATIVE_MODULES.day;
    hideRelativeIntroModal();
    initRelativeWorld();
    resizeRelativeWorld();
    stopCurrentAudio();
    stopLabelAudio();
    if (currentEffectAudio) {
      currentEffectAudio.pause();
      currentEffectAudio.currentTime = 0;
      currentEffectAudio = null;
    }
    stopRelativeAudio();
    clearSequenceTimer();
    clearSequencePulseTimer();
    clearRelativeTimers();
    hideMeaningToast();
    state.relativeModuleKey = RELATIVE_MODULES[moduleKey] ? moduleKey : 'day';
    state.relativeDayIndex = 0;
    state.relativeLearnedIds = [];
    state.relativeReviewUnlocked = false;
    state.relativeAfterAudioAction = null;
    state.relativePromptNext = false;
    refs.relativeIntroModalTitle.textContent = module.introTitle;
    refs.relativeIntroModalDesc.textContent = module.introDesc;
    setPhase('relativeDay');
    renderRelativeDayView();
    showRelativeIntroModal();
  }

  function startRelativeDayLearning() {
    startRelativeLearning('day');
  }

  function renderLearnCards() {
    refs.learnTitle.textContent = '지금이 언제인지 이야기해볼까요?';
    refs.learnOrderChip.textContent = String(state.learnCategoryIndex + 1) + ' / ' + String(LEARN_ITEMS.length);
    refs.learnPrevButton.disabled = state.learnCategoryIndex === 0;
    refs.learnNextButton.disabled = state.learnCategoryIndex === LEARN_ITEMS.length - 1;
    refs.learnCardGrid.innerHTML = '';
    state.learnDeck.forEach(function (item) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'time-learn-photo-btn' + (state.learnActiveId === item.id ? ' is-active' : '');
      button.disabled = state.learnAudioPlaying;
      button.innerHTML =
        '<div class="time-learn-photo-media">' +
        '  <img class="time-learn-photo-image" src="' + item.imagePath + '" alt="' + item.label + ' 사진">' +
        '</div>';
      button.addEventListener('click', function () {
        if (state.learnAudioPlaying) return;
        state.learnActiveId = item.id;
        renderLearnCards();
        playAudio(item.key);
        refs.meaningTitle.textContent = item.label;
        refs.meaningBody.textContent = item.description;
        refs.meaningToast.classList.add('is-visible');
        refs.meaningToast.setAttribute('aria-hidden', 'false');
      });
      refs.learnCardGrid.appendChild(button);
    });
  }

  function buildQuestionSet() {
    const questions = [];

    GROUPS.forEach(function (group) {
      const groupImages = sampleGroupImages(group, { photo: 2, illust: 2 });
      let imageCursor = 0;
      group.labels.forEach(function (label) {
        for (let index = 0; index < QUESTIONS_PER_LABEL; index += 1) {
          const imageItem = groupImages[imageCursor];
          imageCursor += 1;
          questions.push({
            groupId: group.id,
            correctLabel: label,
            imagePath: imageItem.path
          });
        }
      });
    });

    return shuffle(questions);
  }

  function buildSequenceRound() {
    return shuffle(SEQUENCE_GROUPS.map(function (group) {
      const picked = drawSequenceImage(group);
      const fileName = picked.path.split('/').pop().replace('.webp', '');
      return {
        id: group.id + '-' + fileName,
        groupId: group.id,
        label: group.label,
        caption: picked.caption,
        imagePath: picked.path
      };
    }));
  }

  function buildSequenceImageQueues() {
    return SEQUENCE_GROUPS.reduce(function (accumulator, group) {
      accumulator[group.id] = shuffle(group.images.slice());
      return accumulator;
    }, {});
  }

  function drawSequenceImage(group) {
    const groupId = group.id;
    let queue = state.sequenceImageQueues[groupId];
    const lastPath = state.sequenceLastImagePathByGroup[groupId] || '';

    if (!queue || !queue.length) {
      queue = shuffle(group.images.slice());
      if (queue.length > 1 && queue[0].path === lastPath) {
        queue.push(queue.shift());
      }
      state.sequenceImageQueues[groupId] = queue;
    }

    const picked = queue.shift();
    state.sequenceLastImagePathByGroup[groupId] = picked.path;
    return picked;
  }

  function clearSequenceTimer() {
    if (!state.sequenceTimer) return;
    window.clearTimeout(state.sequenceTimer);
    state.sequenceTimer = 0;
  }

  function clearSequencePulseTimer() {
    if (!state.sequencePulseTimer) return;
    window.clearTimeout(state.sequencePulseTimer);
    state.sequencePulseTimer = 0;
  }

  function pulseSequenceElement(selector, className, duration) {
    const node = document.querySelector(selector);
    if (!node) return;
    node.classList.remove(className);
    void node.offsetWidth;
    node.classList.add(className);
    clearSequencePulseTimer();
    state.sequencePulseTimer = window.setTimeout(function () {
      node.classList.remove(className);
      state.sequencePulseTimer = 0;
    }, duration || 420);
  }

  function resetSequenceRound(keepCards) {
    clearSequenceTimer();
    clearSequencePulseTimer();
    state.sequenceLocked = false;
    state.sequenceStatus = 'idle';
    state.sequenceDragId = '';
    state.sequencePointerDrag = null;
    state.sequenceSuppressClickUntil = 0;
    state.sequenceCurrentWrongAttempts = 0;
    state.sequenceRoundStartedAtMs = Date.now();
    state.sequenceSlots = [null, null, null];
    state.sequenceCards = keepCards && state.sequenceCards.length
      ? shuffle(state.sequenceCards.slice())
      : buildSequenceRound();
    renderSequenceActivity();
  }

  function getSequenceCardById(cardId) {
    return state.sequenceCards.find(function (card) {
      return card.id === cardId;
    }) || null;
  }

  function removeSequenceCard(cardId) {
    if (state.sequenceLocked) return;
    const slotIndex = state.sequenceSlots.indexOf(cardId);
    if (slotIndex === -1) return;
    state.sequenceSlots[slotIndex] = null;
    state.sequenceStatus = 'idle';
    renderSequenceActivity();
  }

  function moveSequenceCard(cardId, slotIndex) {
    if (state.sequenceLocked) return;
    const fromIndex = state.sequenceSlots.indexOf(cardId);
    const targetCardId = state.sequenceSlots[slotIndex];

    if (fromIndex === slotIndex) return;

    if (fromIndex !== -1) {
      state.sequenceSlots[fromIndex] = targetCardId || null;
    }
    state.sequenceSlots[slotIndex] = cardId;
    state.sequenceStatus = 'idle';
    renderSequenceActivity();
    checkSequenceAnswer();
  }

  function placeSequenceCard(cardId) {
    if (state.sequenceLocked) return;
    const emptyIndex = state.sequenceSlots.indexOf(null);
    if (emptyIndex === -1) return;
    attemptSequencePlacement(cardId, emptyIndex);
  }

  function clearSequenceDropTargets() {
    Array.prototype.slice.call(document.querySelectorAll('.time-sequence-slot, .time-sequence-tray')).forEach(function (node) {
      node.classList.remove('is-drop-target');
    });
  }

  function handleSequenceDragStart(event, cardId) {
    if (state.sequenceLocked) {
      event.preventDefault();
      return;
    }
    state.sequenceDragId = cardId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', cardId);
    }
    event.currentTarget.classList.add('is-dragging');
  }

  function handleSequenceDragEnd(event) {
    state.sequenceDragId = '';
    event.currentTarget.classList.remove('is-dragging');
    clearSequenceDropTargets();
  }

  function getSequenceDropTargetFromPoint(clientX, clientY) {
    const node = document.elementFromPoint(clientX, clientY);
    const slot = node && node.closest ? node.closest('.time-sequence-slot') : null;
    if (slot && slot.dataset) {
      const slotIndex = Number(slot.dataset.slotIndex);
      if (Number.isInteger(slotIndex) && slotIndex >= 0) {
        return { type: 'slot', slotIndex: slotIndex, node: slot };
      }
    }
    const tray = node && node.closest ? node.closest('.time-sequence-tray') : null;
    if (tray) return { type: 'tray', node: tray };
    return null;
  }

  function updateSequencePointerDropTarget(clientX, clientY) {
    clearSequenceDropTargets();
    const target = getSequenceDropTargetFromPoint(clientX, clientY);
    if (target && target.node) {
      target.node.classList.add('is-drop-target');
    }
    return target;
  }

  function cleanupSequencePointerDrag() {
    if (state.sequencePointerDrag && state.sequencePointerDrag.node) {
      state.sequencePointerDrag.node.classList.remove('is-dragging');
      try {
        state.sequencePointerDrag.node.releasePointerCapture(state.sequencePointerDrag.pointerId);
      } catch (_error) {}
    }
    state.sequencePointerDrag = null;
    clearSequenceDropTargets();
  }

  function handleSequencePointerDown(event, cardId) {
    if (state.sequenceLocked || event.pointerType === 'mouse') return;
    state.sequencePointerDrag = {
      cardId: cardId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      node: event.currentTarget
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (_error) {}
  }

  function handleSequencePointerMove(event) {
    const drag = state.sequencePointerDrag;
    if (!drag || drag.pointerId !== event.pointerId || state.sequenceLocked) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.active && Math.hypot(deltaX, deltaY) < 8) return;
    drag.active = true;
    state.sequenceDragId = drag.cardId;
    if (drag.node) drag.node.classList.add('is-dragging');
    event.preventDefault();
    updateSequencePointerDropTarget(event.clientX, event.clientY);
  }

  function handleSequencePointerUp(event) {
    const drag = state.sequencePointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.active) {
      cleanupSequencePointerDrag();
      return;
    }
    event.preventDefault();
    state.sequenceSuppressClickUntil = Date.now() + 350;
    const target = updateSequencePointerDropTarget(event.clientX, event.clientY);
    const cardId = drag.cardId;
    cleanupSequencePointerDrag();
    state.sequenceDragId = '';
    if (!target || !cardId) return;
    if (target.type === 'slot') {
      attemptSequencePlacement(cardId, target.slotIndex);
      return;
    }
    if (target.type === 'tray') {
      removeSequenceCard(cardId);
    }
  }

  function handleSequencePointerCancel(event) {
    const drag = state.sequencePointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    cleanupSequencePointerDrag();
    state.sequenceDragId = '';
  }

  function handleSequenceDrop(event, slotIndex) {
    event.preventDefault();
    const cardId = state.sequenceDragId || (event.dataTransfer ? event.dataTransfer.getData('text/plain') : '');
    event.currentTarget.classList.remove('is-drop-target');
    if (!cardId) return;
    attemptSequencePlacement(cardId, slotIndex);
  }

  function handleSequenceTrayDrop(event) {
    event.preventDefault();
    const cardId = state.sequenceDragId || (event.dataTransfer ? event.dataTransfer.getData('text/plain') : '');
    refs.sequenceTray.classList.remove('is-drop-target');
    if (!cardId) return;
    removeSequenceCard(cardId);
  }

  function failSequencePlacement(slotIndex) {
    state.sequenceStatus = 'wrong';
    state.sequenceWrongCount += 1;
    state.sequenceCurrentWrongAttempts += 1;
    refs.sequenceBoard.classList.add('is-wrong');
    playEffectAudio('wrong');
    vibrate([70, 35, 90]);
    updateSequenceHud();
    showFeedback('wrong', '다시 한번 생각해세요.');
    pulseSequenceElement('#sequenceSlots [data-slot-index="' + slotIndex + '"]', 'is-error', 420);
    clearSequenceTimer();
    state.sequenceTimer = window.setTimeout(function () {
      state.sequenceStatus = 'idle';
      refs.sequenceBoard.classList.remove('is-wrong');
      state.sequenceTimer = 0;
    }, 420);
  }

  function attemptSequencePlacement(cardId, slotIndex) {
    if (state.sequenceLocked) return;
    if (!Number.isInteger(Number(slotIndex)) || Number(slotIndex) < 0 || Number(slotIndex) >= SEQUENCE_ORDER.length) return;
    const card = getSequenceCardById(cardId);
    if (!card) return;

    slotIndex = Number(slotIndex);
    const expectedGroupId = SEQUENCE_ORDER[slotIndex];
    if (card.groupId !== expectedGroupId) {
      failSequencePlacement(slotIndex);
      return;
    }

    moveSequenceCard(cardId, slotIndex);
    playLabelAudio(card.label);
    pulseSequenceElement('#sequenceSlots [data-slot-index="' + slotIndex + '"]', 'is-success', 360);
  }

  function updateSequenceHud() {
    refs.sequenceProgressChip.textContent = String(Math.min(state.sequenceRoundIndex + 1, SEQUENCE_TOTAL_ROUNDS)) + ' / ' + String(SEQUENCE_TOTAL_ROUNDS);
    refs.sequenceScoreChip.textContent = '성공 ' + String(state.sequenceCorrectCount);
  }

  function checkSequenceAnswer() {
    if (state.sequenceSlots.some(function (cardId) { return cardId === null; })) {
      return;
    }

    const isCorrect = state.sequenceSlots.every(function (cardId, index) {
      const card = getSequenceCardById(cardId);
      return card && card.groupId === SEQUENCE_ORDER[index];
    });

    state.sequenceLocked = true;
    state.sequenceStatus = isCorrect ? 'correct' : 'wrong';
    if (isCorrect) {
      state.sequenceCorrectCount += 1;
      state.sequenceRoundLogs.push({
        id: 'sequence-round-' + String(state.sequenceRoundIndex + 1),
        wrongAttempts: state.sequenceCurrentWrongAttempts,
        durationMs: Math.max(300, Date.now() - Number(state.sequenceRoundStartedAtMs || Date.now()))
      });
    }
    renderSequenceActivity();
    playEffectAudio(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      vibrate([24, 30, 24]);
    } else {
      vibrate([90, 40, 90]);
    }
    showFeedback(isCorrect ? 'correct' : 'wrong', isCorrect ? '순서 성공!' : '다시 놓아 보자!');
    updateSequenceHud();

    clearSequenceTimer();
    state.sequenceTimer = window.setTimeout(function () {
      if (isCorrect) {
        state.sequenceRoundIndex += 1;
        if (state.sequenceRoundIndex >= SEQUENCE_TOTAL_ROUNDS) {
          showSequenceResult();
          return;
        }
      }
      resetSequenceRound(!isCorrect);
    }, 2000);
  }

  function createSequenceCardButton(card, isPlaced) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-sequence-item' + (isPlaced ? ' is-placed' : ' is-tray');
    button.draggable = !state.sequenceLocked;
    button.innerHTML =
      '<div class="time-sequence-item-media">' +
      '  <img class="time-sequence-item-image" src="' + card.imagePath + '" alt="' + card.caption + '">' +
      '</div>' +
      '<span class="time-sequence-item-caption">' + card.caption + '</span>';
    button.addEventListener('dragstart', function (event) {
      handleSequenceDragStart(event, card.id);
    });
    button.addEventListener('dragend', handleSequenceDragEnd);
    button.addEventListener('pointerdown', function (event) {
      handleSequencePointerDown(event, card.id);
    });
    button.addEventListener('pointermove', handleSequencePointerMove);
    button.addEventListener('pointerup', handleSequencePointerUp);
    button.addEventListener('pointercancel', handleSequencePointerCancel);
    button.addEventListener('click', function () {
      if (Date.now() < state.sequenceSuppressClickUntil) return;
      if (isPlaced) {
        removeSequenceCard(card.id);
        return;
      }
      placeSequenceCard(card.id);
    });
    return button;
  }

  function renderSequenceActivity() {
    refs.sequenceBoard.classList.toggle('is-correct', state.sequenceStatus === 'correct');
    refs.sequenceBoard.classList.toggle('is-wrong', state.sequenceStatus === 'wrong');
    refs.sequenceSlots.innerHTML = '';
    refs.sequenceTray.innerHTML = '';

    state.sequenceSlots.forEach(function (cardId, index) {
      const slot = document.createElement('div');
      const card = cardId ? getSequenceCardById(cardId) : null;
      const isFilled = !!card;
      const isMatch = card && card.groupId === SEQUENCE_ORDER[index];
      slot.className =
        'time-sequence-slot' +
        (isFilled ? ' is-filled' : '') +
        (state.sequenceStatus === 'correct' && isFilled ? ' is-correct' : '') +
        (state.sequenceStatus === 'wrong' && isFilled && !isMatch ? ' is-wrong' : '');
      slot.dataset.slotIndex = String(index);
      slot.innerHTML = '<span class="time-sequence-slot-order">' + String(index + 1) + '</span>';
      slot.addEventListener('dragover', function (event) {
        if (state.sequenceLocked) return;
        event.preventDefault();
        slot.classList.add('is-drop-target');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('is-drop-target');
      });
      slot.addEventListener('drop', function (event) {
        handleSequenceDrop(event, index);
      });

      if (card) {
        slot.appendChild(createSequenceCardButton(card, true));
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'time-sequence-slot-placeholder';
        placeholder.textContent = '여기에 놓기';
        slot.appendChild(placeholder);
      }

      refs.sequenceSlots.appendChild(slot);
    });

    const remainingCards = state.sequenceCards.filter(function (card) {
      return !state.sequenceSlots.includes(card.id);
    });

    if (!remainingCards.length) {
      const complete = document.createElement('div');
      complete.className = 'time-sequence-tray-empty';
      complete.textContent = '칸을 눌러 다시 바꿔 볼 수 있어요.';
      refs.sequenceTray.appendChild(complete);
      return;
    }

    remainingCards.forEach(function (card) {
      refs.sequenceTray.appendChild(createSequenceCardButton(card, false));
    });
  }

  function buildChoices(question) {
    const distractors = GROUPS.filter(function (group) {
      return group.id !== question.groupId;
    }).map(function (group) {
      return sample(group.labels, 1)[0];
    });

    return shuffle([question.correctLabel].concat(distractors));
  }

  function renderMeaning(label) {
    const info = LABEL_INFO[label];
    if (!info) return;

    refs.meaningTitle.textContent = info.title;
    refs.meaningBody.textContent = info.body + ' ' + info.relation;
    refs.meaningToast.classList.add('is-visible');
    refs.meaningToast.setAttribute('aria-hidden', 'false');
  }

  function hideMeaningToast() {
    refs.meaningToast.classList.remove('is-visible');
    refs.meaningToast.setAttribute('aria-hidden', 'true');
  }

  function stopCurrentAudio() {
    if (!currentLearnAudio) return;
    currentLearnAudio.pause();
    currentLearnAudio.currentTime = 0;
    currentLearnAudio = null;
    state.learnAudioPlaying = false;
  }

  function stopLabelAudio() {
    if (!currentLabelAudio) return;
    currentLabelAudio.pause();
    currentLabelAudio.currentTime = 0;
    currentLabelAudio = null;
  }

  function stopEffectAudio() {
    if (!currentEffectAudio) return;
    currentEffectAudio.pause();
    currentEffectAudio.currentTime = 0;
    currentEffectAudio = null;
  }

  function stopAllAudio() {
    stopCurrentAudio();
    stopLabelAudio();
    stopEffectAudio();
    stopRelativeAudio();
  }

  function showFeedback(kind, text) {
    refs.feedbackBurst.textContent = '';
    refs.feedbackBurst.className = 'time-feedback-burst';
    const overlay = window.HahaFeedbackOverlay || window.PlaylabFeedbackOverlay;
    if (overlay && typeof overlay.show === 'function') {
      overlay.show(kind === 'correct' ? 'correct' : 'wrong', { sound: false });
    }
  }

  function updateHud() {
    const total = state.questions.length;
    refs.progressChip.textContent = (state.index + 1) + ' / ' + total;
    refs.scoreChip.textContent = '정답 ' + state.correctCount;
  }

  function renderQuestion() {
    const question = state.questions[state.index];
    if (!question) {
      showResult();
      return;
    }

    state.locked = false;
    state.questionStartedAtMs = Date.now();
    state.currentQuestionWrongAttempts = 0;
    refs.questionTitle.textContent = '그림을 보고 지금이 언제인지 맞춰보세요.';
    refs.questionImage.src = question.imagePath;
    refs.questionImage.alt = '시간 학습 문제 그림';
    refs.choiceList.innerHTML = '';
    refs.meaningTitle.textContent = '버튼을 누르면 설명이 나와요.';
    refs.meaningBody.textContent = '그림을 보고 마음에 드는 답을 눌러 보세요.';
    hideMeaningToast();
    updateHud();

    buildChoices(question).forEach(function (label, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'time-choice-btn';
      button.dataset.label = label;
      button.dataset.tone = CHOICE_TONES[index % CHOICE_TONES.length];
      button.innerHTML =
        '<span class="time-choice-word">' + label + '</span>' +
        '<span class="time-choice-note">눌러서 뜻 보기</span>';
      button.addEventListener('click', function () {
        handleChoice(button, question, label);
      });
      refs.choiceList.appendChild(button);
    });
  }

  function moveNext() {
    state.index += 1;
    if (state.index >= state.questions.length) {
      showResult();
      return;
    }
    renderQuestion();
  }

  function handleChoice(button, question, label) {
    if (state.locked) return;

    const isCorrect = label === question.correctLabel;
    playLabelAudio(label);
    renderMeaning(label);

    if (!isCorrect) {
      if (!button.classList.contains('is-disabled')) {
        state.wrongCount += 1;
        state.currentQuestionWrongAttempts += 1;
      }
      button.classList.remove('is-correct');
      button.classList.add('is-wrong', 'is-disabled');
      updateHud();
      showFeedback('wrong', '다시 생각!');
      window.setTimeout(function () {
        button.classList.remove('is-wrong');
      }, 480);
      return;
    }

    state.locked = true;
    state.correctCount += 1;
    state.questionLogs.push({
      id: question.groupId + '-' + state.index,
      groupId: question.groupId,
      correctLabel: question.correctLabel,
      selectedLabel: label,
      wrongAttempts: state.currentQuestionWrongAttempts,
      durationMs: Math.max(200, Date.now() - Number(state.questionStartedAtMs || Date.now()))
    });
    button.classList.add('is-correct');
    updateHud();
    showFeedback('correct', '정답!');

    Array.prototype.slice.call(refs.choiceList.querySelectorAll('.time-choice-btn')).forEach(function (choiceButton) {
      if (choiceButton !== button) {
        choiceButton.classList.add('is-disabled');
      }
    });

    window.setTimeout(moveNext, 2000);
  }

  function showResult() {
    hideMeaningToast();
    const reportInput = buildQuizReportInput();
    const report = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function'
      ? window.PlaylabReportEngine.buildReport(reportInput)
      : null;
    state.resultMode = 'quiz';
    setPhase('result');
    refs.resultTitle.textContent = '시간 말을 끝까지 배웠어요.';
    refs.resultCorrect.textContent = String(state.correctCount);
    refs.resultCorrectLabel.textContent = '정답';
    refs.resultWrong.textContent = String(state.wrongCount);
    refs.resultWrongLabel.textContent = '오답';
    refs.resultTotal.textContent = String(state.questions.length);
    refs.resultTotalLabel.textContent = '문항';
    refs.resultSummary.textContent =
      '총 ' + state.questions.length + '문제를 풀고, 정답 ' + state.correctCount + '개를 맞혔어요.';
    renderResultReport(report);
    if (report) {
      saveResultHistory(reportInput, report, {
        stageTitle: getQuizStageTitle(),
        focusKey: 'time',
        focusLabel: '시간 개념'
      });
    }
  }

  function showSequenceResult() {
    hideMeaningToast();
    const reportInput = buildSequenceReportInput();
    const report = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function'
      ? window.PlaylabReportEngine.buildReport(reportInput)
      : null;
    state.resultMode = 'sequence';
    setPhase('result');
    refs.resultTitle.textContent = '카드 연결 8문제를 끝냈어요.';
    refs.resultCorrect.textContent = String(state.sequenceCorrectCount);
    refs.resultCorrectLabel.textContent = '성공';
    refs.resultWrong.textContent = String(state.sequenceWrongCount);
    refs.resultWrongLabel.textContent = '실수';
    refs.resultTotal.textContent = String(SEQUENCE_TOTAL_ROUNDS);
    refs.resultTotalLabel.textContent = '문제';
    refs.resultSummary.textContent =
      '총 ' + SEQUENCE_TOTAL_ROUNDS + '문제를 연결하고, 성공 ' + state.sequenceCorrectCount + '번과 실수 ' + state.sequenceWrongCount + '번을 했어요.';
    renderResultReport(report);
    if (report) {
      saveResultHistory(reportInput, report, {
        stageTitle: getSequenceStageTitle(),
        focusKey: 'time-sequence',
        focusLabel: '시간 순서'
      });
    }
  }

  function startGame() {
    stopCurrentAudio();
    stopLabelAudio();
    stopRelativeAudio();
    clearRelativeTimers();
    if (currentEffectAudio) {
      currentEffectAudio.pause();
      currentEffectAudio.currentTime = 0;
      currentEffectAudio = null;
    }
    clearSequenceTimer();
    clearSequencePulseTimer();
    state.questions = buildQuestionSet();
    state.index = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.quizStartedAtMs = Date.now();
    state.questionStartedAtMs = 0;
    state.questionLogs = [];
    state.currentQuestionWrongAttempts = 0;
    state.resultMode = 'quiz';
    setPhase('quiz');
    renderQuestion();
  }

  function startSequenceGame() {
    stopCurrentAudio();
    stopLabelAudio();
    stopRelativeAudio();
    clearRelativeTimers();
    if (currentEffectAudio) {
      currentEffectAudio.pause();
      currentEffectAudio.currentTime = 0;
      currentEffectAudio = null;
    }
    clearSequenceTimer();
    clearSequencePulseTimer();
    hideMeaningToast();
    state.resultMode = 'sequence';
    state.sequenceRoundIndex = 0;
    state.sequenceCorrectCount = 0;
    state.sequenceWrongCount = 0;
    state.sequenceStartedAtMs = Date.now();
    state.sequenceRoundStartedAtMs = 0;
    state.sequenceRoundLogs = [];
    state.sequenceCurrentWrongAttempts = 0;
    state.sequenceImageQueues = buildSequenceImageQueues();
    state.sequenceLastImagePathByGroup = {};
    setPhase('sequence');
    resetSequenceRound(false);
    updateSequenceHud();
  }

  function handleCategoryModeClick(event) {
    if (state.phase !== 'categories') return;
    const target = event.target && event.target.closest ? event.target.closest('#learnModeButton, #sequenceModeButton, #relativeDayModeButton, #relativeMonthModeButton, #relativeYearModeButton, #quizModeButton') : null;
    if (!target) return;
    if (target.id === 'learnModeButton') {
      hideRelativeIntroModal();
      stopRelativeAudio();
      clearRelativeTimers();
      clearSequenceTimer();
      clearSequencePulseTimer();
      state.learnActiveId = '';
      state.learnCategoryIndex = 0;
      state.learnDeck = buildLearnDeck();
      stopLabelAudio();
      hideMeaningToast();
      setPhase('learn');
      renderLearnCards();
      return;
    }
    if (target.id === 'sequenceModeButton') {
      hideRelativeIntroModal();
      stopRelativeAudio();
      clearRelativeTimers();
      startSequenceGame();
      return;
    }
    if (target.id === 'relativeDayModeButton') {
      startRelativeDayLearning();
      return;
    }
    if (target.id === 'relativeMonthModeButton') {
      startRelativeLearning('month');
      return;
    }
    if (target.id === 'relativeYearModeButton') {
      startRelativeLearning('year');
      return;
    }
    if (target.id === 'quizModeButton') {
      startGame();
    }
  }

  if (window.CARDLAB_HELP_PAGE_CONFIG && typeof window.CARDLAB_HELP_PAGE_CONFIG === 'object') {
    window.CARDLAB_HELP_PAGE_CONFIG.getContent = getCurrentHelpContent;
  }

  refs.learnModeButton.addEventListener('click', function () {
    hideRelativeIntroModal();
    stopRelativeAudio();
    clearRelativeTimers();
    clearSequenceTimer();
    clearSequencePulseTimer();
    state.learnActiveId = '';
    state.learnCategoryIndex = 0;
    state.learnDeck = buildLearnDeck();
    stopLabelAudio();
    hideMeaningToast();
    setPhase('learn');
    renderLearnCards();
  });
  refs.sequenceModeButton.addEventListener('click', function () {
    hideRelativeIntroModal();
    stopRelativeAudio();
    clearRelativeTimers();
    startSequenceGame();
  });
  refs.relativeDayModeButton.addEventListener('click', startRelativeDayLearning);
  refs.relativeMonthModeButton.addEventListener('click', function () {
    startRelativeLearning('month');
  });
  refs.relativeYearModeButton.addEventListener('click', function () {
    startRelativeLearning('year');
  });
  refs.sequenceTray.addEventListener('dragover', function (event) {
    if (state.sequenceLocked) return;
    event.preventDefault();
    refs.sequenceTray.classList.add('is-drop-target');
  });
  refs.sequenceTray.addEventListener('dragleave', function () {
    refs.sequenceTray.classList.remove('is-drop-target');
  });
  refs.sequenceTray.addEventListener('drop', handleSequenceTrayDrop);
  refs.quizModeButton.addEventListener('click', startGame);
  document.addEventListener('click', handleCategoryModeClick);
  refs.relativePrevButton.addEventListener('click', function () {
    changeRelativeDay(-1);
  });
  refs.relativeNextButton.addEventListener('click', function () {
    changeRelativeDay(1);
  });
  refs.relativeIntroModalOk.addEventListener('click', function () {
    hideRelativeIntroModal();
    runRelativeCurrentItem();
  });
  refs.learnPrevButton.addEventListener('click', function () {
    if (state.learnCategoryIndex <= 0) return;
    stopCurrentAudio();
    state.learnCategoryIndex -= 1;
    state.learnActiveId = '';
    state.learnDeck = buildLearnDeck();
    hideMeaningToast();
    renderLearnCards();
  });
  refs.learnNextButton.addEventListener('click', function () {
    if (state.learnCategoryIndex >= LEARN_ITEMS.length - 1) return;
    stopCurrentAudio();
    state.learnCategoryIndex += 1;
    state.learnActiveId = '';
    state.learnDeck = buildLearnDeck();
    hideMeaningToast();
    renderLearnCards();
  });
  refs.restartButton.addEventListener('click', function () {
    if (state.resultMode === 'sequence') {
      startSequenceGame();
      return;
    }
    startGame();
  });
  refs.meaningToastClose.addEventListener('click', hideMeaningToast);
  refs.stageSelectButton.addEventListener('click', function () {
    showConfirmModal();
  });
  Array.prototype.slice.call(document.querySelectorAll('[data-modal-close]')).forEach(function (node) {
    node.addEventListener('click', hideConfirmModal);
  });
  refs.confirmModalCancel.addEventListener('click', hideConfirmModal);
  refs.confirmModalOk.addEventListener('click', function () {
    hideConfirmModal();
    hideRelativeIntroModal();
    stopAllAudio();
    clearSequenceTimer();
    clearSequencePulseTimer();
    clearRelativeTimers();
    hideMeaningToast();
    setPhase('categories');
  });
  window.addEventListener('resize', function () {
    resizeRelativeWorld();
    if (state.phase !== 'relativeDay') return;
    const item = getRelativeDayItem();
    if (!item) return;
    window.requestAnimationFrame(function () {
      placeRelativeSheep(state.relativeCurrentOffset || item.startOffset, false);
    });
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAllAudio();
      clearRelativeTimers();
    }
  });
  window.addEventListener('blur', stopAllAudio, { passive: true });
  window.addEventListener('pagehide', function () {
    stopAllAudio();
    clearRelativeTimers();
  }, { passive: true });
  window.addEventListener('beforeunload', function () {
    stopAllAudio();
    clearRelativeTimers();
  }, { passive: true });

  setPhase('categories');
})();
