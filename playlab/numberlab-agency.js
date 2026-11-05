(() => {
  'use strict';

  const makeTimesTableActivity = (factor) => {
    const multiplicationGroups = [2,3,4,5,6,7,8,9];
    const tableGroups = [1,2,3,4,5,6,7,8,9,10];
    const starts = Array.from({ length: 6 }, (_, index) => factor * (index + 1));
    const stages = [
      [`${factor * 10}까지 세기`, '마트 물건을 세어 전체 수를 입력해요.', 8, { ask: 'countPictures', factor, groups: tableGroups, itemSet: 'mixed' }],
      [`${factor}씩 뛰어 세기`, `빈칸에 들어갈 다음 ${factor}배수를 찾아요.`, 8, { ask: 'skipBlank', factor, starts, sequenceLength: 5 }],
      ['차례대로 이어가기', `차례대로 커지는 ${factor}배수를 보고 빈칸을 채워요.`, 8, { ask: 'pathBlank', factor, starts, sequenceLength: 5 }],
      [`${factor}씩 묶어 보기`, `${factor}개씩 묶은 그림의 전체 수를 입력해요.`, 8, { ask: 'groupTotal', factor, groups: multiplicationGroups, itemSet: 'fruit' }],
      ['몇 묶음일까요', `${factor}개씩 묶었을 때 묶음 수를 입력해요.`, 8, { ask: 'groupCount', factor, groups: multiplicationGroups, itemSet: 'mixed' }],
      ['모두 몇 개일까요', `${factor}씩 몇 묶음인지 보고 전체 수를 입력해요.`, 8, { ask: 'pairSentenceTotal', factor, groups: multiplicationGroups, itemSet: 'mixed' }],
      ['덧셈식 연결', `${factor}를 여러 번 더한 값을 입력해요.`, 8, { ask: 'additionTotal', factor, groups: [3,4,5,6,7,8,9], itemSet: 'fruit' }],
      [`${factor}단 한눈에 보기`, `구구단 ${factor}단을 보고 이어진 식의 빈칸을 채워요.`, 9, { ask: 'multiplicationTableTriple', factor, groups: [3,4,5,6,7,8,9,2], tableGroups, displayQuestionCount: 8 }],
      ['가로 곱셈식', `${factor}단 가로 곱셈식의 답을 시간 안에 풀어요.`, 30, { ask: 'timedMultiplication', factor, orientation: 'horizontal', timedDrill: true, itemSet: 'mixed' }],
      ['세로 곱셈식', `${factor}단 세로 곱셈식의 답을 시간 안에 풀어요.`, 30, { ask: 'timedMultiplication', factor, orientation: 'vertical', timedDrill: true, itemSet: 'mixed' }]
    ];
    stages.splice(3, 0, [`${factor}씩 띄어서 차례로 선 이어가기`, `${factor}씩 뛰어 세어 차례로 선을 이어요.`, 6, { ask: 'dotConnect', factor, tableGroups }]);
    stages.splice(stages.length - 2, 0,
      ['곱셈식으로 알맞게 선을 그어요', `${factor}단 곱셈식을 계산해 알맞은 답과 연결해요.`, 10, { ask: 'multiplicationMatch', factor }]
    );
    return {
      title: `구구단 ${factor}단`,
      categoryTitle: `${factor}씩 묶어 세기`,
      description: `마트 물건을 ${factor}개씩 세며 ${factor}단 곱셈으로 연결해요.`,
      accent: '#f97316',
      autoAdvanceOnCorrect: true,
      reportFocus: `${factor}씩 뛰어 세기, 같은 수 묶음, 덧셈식-곱셈식 연결`,
      helpSummary: `마트 물건 단품 이미지를 ${factor}개씩 묶어 보고, ${factor}씩 뛰어 세기와 반복 덧셈을 ${factor}단 곱셈식으로 연결합니다.`,
      methodItems: [
        `처음에는 마트 물건 그림을 직접 세며 ${factor}개씩 묶인 수량을 확인합니다.`,
        `수직선과 순서 빈칸으로 ${factor}씩 뛰어 세는 흐름을 연습합니다.`,
        `후반에는 ${factor}+${factor}+${factor}와 ${factor}×3이 같은 의미임을 보고 숫자키패드로 답을 입력합니다.`
      ],
      benefitItems: [
        `${factor * 10}까지의 ${factor}배수 수열과 수량 보존을 안정적으로 익힙니다.`,
        '묶음 수와 전체 수를 구분해 곱셈의 기초 개념을 만듭니다.',
        '태블릿 키보드 없이 큰 숫자 버튼으로 답을 입력해 터치 부담을 줄입니다.'
      ],
      stages
    };
  };

  const ACTIVITY_CONFIGS = {
    'number-compare-balance': {
      title: '수 크기 저울',
      categoryTitle: '비교와 수 감각',
      description: '두 수량을 직접 비교하며 크다, 작다, 같다를 판단해요.',
      accent: '#4cbdc9',
      reportFocus: '수량 보존, 크기 비교, 기호 이해',
      helpSummary: '수량을 눈으로 묶어 보고 말로 비교하며 수 감각을 안정화합니다.',
      methodItems: [
        '왼쪽과 오른쪽 수량을 직접 세어 보고 비교합니다.',
        '가운데 물음표 자리에 들어갈 >, <, = 기호를 선택합니다.',
        '후반 스테이지에서는 1단위 식과 10단위 식을 비교하며 수 감각을 확장합니다.'
      ],
      benefitItems: [
        '수량을 직접 세기 전에 대략 비교하는 힘을 기릅니다.',
        '자리값을 기준으로 수를 비교하는 전략을 연습합니다.',
        '수학 문장에 필요한 비교 기호 이해를 강화합니다.'
      ],
      stages: [
        ['1~5 수량 비교', '작은 수량을 하나씩 세어 비교해요.', 6, { max: 5, mode: 'quantity', relation: 'mixedEqual' }],
        ['1~10 수량 비교', '도트가 많아져도 빠뜨리지 않고 세어요.', 7, { max: 10, mode: 'quantity', relation: 'mixedEqual' }],
        ['같은 수량 판단', '많다, 적다, 같다를 함께 구별해요.', 7, { max: 12, mode: 'quantity', relation: 'mixedEqual' }],
        ['1단위 식 비교', '4+1, 5+2처럼 더한 값을 비교해요.', 10, { max: 9, mode: 'sum1', relation: 'mixedEqual' }],
        ['10단위 식 비교', '40+10, 50+20처럼 십 단위 합을 비교해요.', 10, { min: 10, max: 90, step: 10, mode: 'sum10', relation: 'mixedEqual' }],
        ['저울 종합', '수량, 숫자, 식 비교를 섞어 해결해요.', 15, { max: 30, min: 1, mode: 'mixedAdvanced', relation: 'mixedEqual' }]
      ]
    },
    'number-ten-frame': {
      title: '10칸 채우기',
      categoryTitle: '10 만들기',
      description: '10칸 틀로 부분과 전체를 보고 10의 보수를 익혀요.',
      accent: '#20b970',
      reportFocus: '부분-전체, 10의 구조, 빠른 수량 인식',
      helpSummary: '10칸 틀을 기준으로 수를 묶어 보며 더 세지 않고 알아보는 전략을 배웁니다.',
      methodItems: [
        '채워진 칸의 수를 보고 전체 10 중 어느 부분인지 확인합니다.',
        '문항에 따라 채워진 수, 빈칸 수, 10을 만들기 위해 필요한 수를 고릅니다.',
        '후반 스테이지에서는 두 줄 10칸과 20칸까지 확장합니다.'
      ],
      benefitItems: [
        '손가락 세기에만 의존하지 않고 5와 10의 구조를 사용합니다.',
        '덧셈 전 단계인 보수 개념을 시각적으로 준비합니다.',
        '빠른 수량 인식과 작업 기억 부담 조절에 도움이 됩니다.'
      ],
      stages: [
        ['1~5 바로 보기', '위 한 줄에서 채워진 수를 읽어요.', 6, { max: 5, ask: 'filled' }],
        ['6~10 바로 보기', '두 줄 틀에서 수를 읽어요.', 7, { min: 6, max: 10, ask: 'filled' }],
        ['빈칸 세기', '10까지 남은 칸을 찾아요.', 7, { min: 1, max: 9, ask: 'empty' }],
        ['10 만들기', '몇 개를 더 채우면 10인지 고릅니다.', 8, { min: 1, max: 9, ask: 'make10' }],
        ['흩어진 10칸', '배치가 달라도 전체 수를 유지해요.', 8, { min: 1, max: 10, ask: 'filled', shuffled: true }],
        ['두 틀 비교', '두 10칸 중 더 많이 채워진 쪽을 골라요.', 8, { max: 10, ask: 'compare' }],
        ['11~15 확장', '10과 몇으로 두 자리 수를 봐요.', 9, { min: 11, max: 15, ask: 'teen' }],
        ['16~20 확장', '두 개의 10칸 틀을 함께 읽어요.', 9, { min: 16, max: 20, ask: 'teen' }],
        ['빠른 빈칸', '20까지 남은 수를 판단해요.', 10, { min: 11, max: 19, ask: 'empty20' }],
        ['10칸 종합', '채워진 수와 남은 수를 섞어 풀어요.', 10, { min: 1, max: 20, ask: 'mixed' }]
      ]
    },
    'number-place-value': {
      title: '십의 자리 탐험',
      categoryTitle: '자리값과 묶음',
      description: '십, 일, 백의 묶음을 시각화해 두 자리와 세 자리 수를 이해해요.',
      accent: '#3478f6',
      reportFocus: '자리값, 십진 묶음, 전개식 이해',
      helpSummary: '막대와 낱개를 이용해 숫자의 위치가 뜻하는 값을 구체적으로 확인합니다.',
      methodItems: [
        '긴 막대는 10, 작은 조각은 1, 큰 판은 100으로 봅니다.',
        '보이는 묶음을 숫자로 읽거나, 숫자에 맞는 묶음을 고릅니다.',
        '후반에는 100, 10, 1의 전개식을 함께 확인합니다.'
      ],
      benefitItems: [
        '두 자리 수를 단순 암기보다 구조로 이해합니다.',
        '받아올림, 받아내림을 배우기 전 필요한 기초 표상을 만듭니다.',
        '큰 수 읽기와 비교에서 자릿값 기준 전략을 강화합니다.'
      ],
      stages: [
        ['10과 1 만나기', '십 막대와 낱개를 구별해요.', 6, { maxTens: 1, maxOnes: 9, ask: 'value' }],
        ['10대 수 만들기', '10과 몇으로 11~19를 읽어요.', 7, { min: 11, max: 19, ask: 'value' }],
        ['20~50 묶음', '십 막대가 여러 개일 때 읽어요.', 7, { min: 20, max: 59, ask: 'value' }],
        ['일의 자리 찾기', '두 자리 수에서 낱개의 수를 찾아요.', 8, { min: 20, max: 79, ask: 'ones' }],
        ['십의 자리 찾기', '두 자리 수에서 십 묶음 수를 찾아요.', 8, { min: 20, max: 99, ask: 'tens' }],
        ['전개식 연결', '예: 47은 40과 7로 나누어 봐요.', 8, { min: 20, max: 99, ask: 'expanded' }],
        ['100 판 도입', '100이 10묶음이라는 것을 봐요.', 9, { min: 100, max: 190, ask: 'value' }],
        ['세 자리 읽기', '백, 십, 일을 차례대로 읽어요.', 9, { min: 120, max: 399, ask: 'value' }],
        ['0이 있는 수', '자리에 0이 있어도 값을 유지해요.', 10, { min: 100, max: 909, zero: true, ask: 'value' }],
        ['자리값 종합', '수와 전개식을 번갈아 연결해요.', 10, { min: 101, max: 999, ask: 'mixed' }]
      ]
    },
    'number-number-line-jump': {
      title: '수직선에서 수 찾기',
      categoryTitle: '수 위치와 거리',
      description: '수직선 위의 수 위치와 두 수 사이의 중간 수를 찾아요.',
      accent: '#8b5cf6',
      autoAdvanceOnCorrect: true,
      reportFocus: '수의 위치감, 거리 추론, 수직선 표상',
      helpSummary: '숫자를 선 위 위치와 거리로 이해해 계산 전 수 감각을 강화합니다.',
      methodItems: [
        '수직선의 시작과 끝 숫자를 먼저 확인합니다.',
        '점의 이동을 보고 알맞은 숫자를 선택합니다.',
        '두 수 사이의 같은 간격을 보고 중간 수를 찾습니다.'
      ],
      benefitItems: [
        '숫자의 상대적 크기와 간격을 직관적으로 이해합니다.',
        '암산과 어림 계산에 필요한 거리 감각을 기릅니다.',
        '수직선 기반 문제 해결로 수학 불안을 낮춥니다.'
      ],
      stages: [
        ['0~10 위치', '점이 움직여 멈춘 숫자를 찾아요.', 6, { start: 0, end: 10, step: 1, ask: 'markerBounce' }],
        ['오른쪽 여러 칸 이동', '1~10칸 이동한 도착 수를 찾아요.', 6, { start: 0, end: 10, step: 1, ask: 'oneStepRight', minMove: 1, maxMove: 10 }],
        ['오른쪽 이동 복습', '이동 칸 수가 달라져도 도착 수를 찾아요.', 6, { start: 0, end: 10, step: 1, ask: 'oneStepRight', minMove: 1, maxMove: 10 }],
        ['두 수 사이에는 얼마일까요?', '1과 5 사이의 중간 수를 찾아요.', 6, { start: 0, end: 10, step: 1, ask: 'betweenMiddle', left: 1, right: 5 }]
      ]
    },
    'number-money-market': {
      title: '화폐를 배워요',
      categoryTitle: '화폐 가치',
      description: '동전과 지폐를 구분하고 돈을 모아 목표 금액을 만들어요.',
      accent: '#f59e0b',
      autoAdvanceOnCorrect: true,
      reportFocus: '화폐 가치, 단위 변환, 실생활 수 감각',
      helpSummary: '우리나라 화폐의 동전과 지폐를 구분하고, 작은 금액이 모여 큰 금액이 되는 관계를 조작 활동으로 익힙니다.',
      methodItems: [
        '동전과 지폐가 각각 어떤 금액을 나타내는지 그림 카드로 먼저 확인합니다.',
        '10원, 50원, 100원, 500원이 모여 더 큰 금액이 되는 과정을 쉬운 말로 읽습니다.',
        '목표 금액이 나오면 알맞은 동전이나 지폐를 눌러 돈을 쌓아 봅니다.'
      ],
      benefitItems: [
        '화폐 단위와 숫자 값을 안정적으로 연결합니다.',
        '5개씩, 2개씩, 10개씩 묶어 세는 기초 수 감각을 자연스럽게 강화합니다.',
        '실제 결제 상황에 필요한 금액 구성과 합산 전략을 준비합니다.'
      ],
      stages: [
        ['동전이 모이면', '10원부터 1,000원까지 동전 관계를 이야기처럼 배워요.', 9, { ask: 'coinStory' }],
        ['500원 만들기', '동전을 눌러 500원을 직접 만들어 봐요.', 6, { ask: 'coinBuild500' }],
        ['지폐를 배워요', '1,000원부터 50,000원까지 지폐를 쉽게 읽어요.', 5, { ask: 'billStory' }],
        ['지폐 금액 만들기', '지폐를 눌러 목표 금액을 만들어 봐요.', 8, { ask: 'billBuild' }]
      ]
    },
    'number-clock-time': {
      title: '시계 숫자 읽기',
      categoryTitle: '시간과 숫자',
      description: '디지털 시계와 바늘 시계를 차례대로 보고 시각을 읽어요.',
      accent: '#0ea5e9',
      autoAdvanceOnCorrect: true,
      reportFocus: '시간 읽기, 5단위 세기, 일상 시간 이해',
      helpSummary: '디지털 시계 표시에서 시작해 아날로그 시계와 24시간 표기까지 단계적으로 읽습니다.',
      methodItems: [
        '숫자로 보이는 디지털 시계와 바늘로 보이는 시계를 먼저 구별합니다.',
        '정시, 30분, 5분 단위와 AM/PM 표기를 차례대로 확인합니다.',
        '후반에는 14:00 같은 24시간 표기와 아날로그 시계를 연결합니다.'
      ],
      benefitItems: [
        '숫자 위치와 시간 단위의 관계를 이해합니다.',
        '5씩 세기와 분 읽기를 실생활 맥락에서 연습합니다.',
        '하루 일과 관리에 필요한 시간 개념을 강화합니다.'
      ],
      stages: [
        ['시계 쉽게 알기', '디지털 시계와 바늘 시계가 무엇인지 알아요.', 4, { intro: true }],
        ['디지털 정시', '숫자로 보이는 정시를 읽어요.', 6, { visual: 'digital', minutes: [0], hours: [1,2,3,4,5,6,7,8,9,10,11,12], ask: 'time' }],
        ['디지털 30분', '숫자 30분 표시를 읽어요.', 7, { visual: 'digital', minutes: [30], hours: [1,2,3,4,5,6,7,8,9,10,11,12], ask: 'time' }],
        ['디지털 5분', '5분 단위 디지털 시각을 읽어요.', 8, { visual: 'digital', minutes: [5,10,15,20,25,35,40,45,50,55], hours: [1,2,3,4,5,6,7,8,9,10,11,12], ask: 'time' }],
        ['AM PM 구별', 'AM과 PM이 무엇인지 알고 24시간 표시로 바꿔요.', 15, { visual: 'digital', minutes: [0,30], hours: [7,8,9,10,11,12,1,2,3,4,5,6], period: true, ask: 'periodIntro' }],
        ['24시간 정시', '14:00, 16:00 같은 시간을 읽어요.', 8, { visual: 'digital24', minutes: [0], hours24: [13,14,15,16,17,18,19,20,21], ask: 'digital24' }],
        ['24시간 5분', '14:05, 16:20처럼 5분 단위로 읽어요.', 9, { visual: 'digital24', minutes: [5,10,15,20,25,30,35,40,45,50,55], hours24: [13,14,15,16,17,18,19,20,21], ask: 'digital24' }],
        ['바늘 정시 30분', '바늘 시계의 정시와 30분을 읽어요.', 8, { visual: 'clock', minutes: [0,30], hours: [1,2,3,4,5,6,7,8,9,10,11,12], ask: 'time' }],
        ['바늘 5분 단위', '긴 바늘 숫자를 5씩 읽어요.', 9, { visual: 'clock', minutes: [5,10,15,20,25,35,40,45,50,55], hours: [1,2,3,4,5,6,7,8,9,10,11,12], ask: 'time' }],
        ['바늘 1분 단위', '작은 눈금 60칸을 1분씩 읽어요.', 15, { visual: 'clock', minutes: Array.from({ length: 60 }, (_, minute) => minute), hours: [1,2,3,4,5,6,7,8,9,10,11,12], ask: 'analogMinuteIntro' }],
        ['몇시 몇분인지 찾아볼까요?', '오후 바늘 시계를 보고 14:00, 16:20처럼 골라요.', 10, { visual: 'clock', minutes: [0,5,10,15,20,25,30,35,40,45,50,55], hours24: [13,14,15,16,17,18,19,20,21], ask: 'analog24' }],
        ['몇시 몇분일까요?', '시와 분을 숫자키패드로 차례대로 입력해요.', 10, { visual: 'clock', minutes: Array.from({ length: 60 }, (_, minute) => minute), hours: [1,2,3,4,5,6,7,8,9,10,11,12], ask: 'clockKeypad' }]
      ]
    },
    'number-times-two': makeTimesTableActivity(2),
    'number-times-three': makeTimesTableActivity(3),
    'number-times-four': makeTimesTableActivity(4),
    'number-times-five': makeTimesTableActivity(5),
    'number-times-six': makeTimesTableActivity(6),
    'number-times-seven': makeTimesTableActivity(7),
    'number-times-eight': makeTimesTableActivity(8),
    'number-times-nine': makeTimesTableActivity(9),
    'number-measure-compare': {
      title: '칸으로 비교하는 길이의 기초',
      categoryTitle: '측정과 단위',
      description: '같은 단위로 길이를 재고 더 길다, 짧다, 같다를 판단해요.',
      accent: '#14b8a6',
      autoAdvanceOnCorrect: true,
      reportFocus: '비표준 단위 측정, 속성 비교, 단위 일관성',
      helpSummary: '눈금과 단위 블록을 이용해 길이·높이·무게 같은 양적 속성을 비교합니다.',
      methodItems: [
        '두 물건을 같은 단위 블록으로 잰 길이를 확인합니다.',
        '질문에 맞게 긴 쪽, 짧은 쪽, 같은 길이를 선택합니다.',
        '후반에는 눈금자 숫자와 단위 수를 함께 읽습니다.'
      ],
      benefitItems: [
        '수와 실제 크기 속성을 연결합니다.',
        '비교할 때 기준 단위가 같아야 함을 익힙니다.',
        '측정 결과를 숫자로 표현하는 기초를 만듭니다.'
      ],
      stages: [
        ['칸으로 비교하는 길이의 기초', '시각적 변별과 수량 인지를 통한 길이의 수치화', 5, { ask: 'blockMeasureIntro' }],
        ['길이 비교', '긴 쪽, 짧은 쪽, 같은 길이를 함께 비교해요.', 10, { max: 5, ask: 'compareBasic' }],
        ['숫자만큼 칠하기', '숫자를 보고 같은 칸만큼 칠해요.', 8, { max: 10, ask: 'paintLength' }],
        ['단위 블록 세기', '블록 몇 칸인지 읽어요.', 8, { max: 10, ask: 'units' }],
        ['길이 합치기', '두 막대를 이어 붙인 길이를 구해요.', 8, { max: 10, ask: 'addLength' }],
        ['길이 빼기', '긴 막대에서 짧은 막대를 뺀 길이를 구해요.', 8, { max: 12, ask: 'subtractLength' }],
        ['세 물건 비교', '가장 긴 물건을 찾아요.', 10, { max: 5, ask: 'three' }]
      ]
    },
    'number-fraction-share': {
      title: '똑같이 나누기',
      categoryTitle: '나눔 기초',
      description: '사과, 피자, 롤케익 그림을 보며 전체와 조각을 구분해요.',
      accent: '#ef4444',
      autoAdvanceOnCorrect: true,
      reportFocus: '전체와 부분, 같은 크기 조각, 분수 기초',
      helpSummary: '사과, 피자, 롤케익 그림을 통해 1개 전체와 2조각, 3조각, 4조각, 6조각처럼 똑같이 나눈 모습을 구분합니다.',
      methodItems: [
        '문제에서 찾으라는 음식과 조각 수를 먼저 읽습니다.',
        '아래 보기 이미지에서 전체인지, 몇 조각으로 나뉘었는지 살펴봅니다.',
        '정답이 아니면 같은 문제를 다시 풀며 그림 단서를 한 번 더 확인합니다.'
      ],
      benefitItems: [
        '하나의 전체와 여러 조각의 관계를 시각적으로 이해합니다.',
        '똑같이 나눈 조각 수를 세며 분수 학습의 기초를 만듭니다.',
        '사과, 피자, 롤케익처럼 다른 대상에서도 같은 조각 수를 일반화합니다.'
      ],
      stages: [
        ['롤케익 나누기', '롤케익이 몇 조각으로 나뉘는지 차례대로 봐요.', 3, { ask: 'splitLesson' }],
        ['몇 조각인가요', '그림을 보고 조각 수를 골라요.', 8, { ask: 'countFromImage' }],
        ['숫자만 보고 찾기', '숫자를 보고 알맞은 그림을 찾아요.', 8, { ask: 'findByNumber' }]
      ]
    },
    'number-data-graph': {
      title: '길이를 배워요',
      categoryTitle: '측정과 단위',
      description: '네모 칸 세기에서 시작해 cm 눈금, 2자리 cm, m 단위까지 차례대로 배워요.',
      accent: '#ffce24',
      autoAdvanceOnCorrect: true,
      reportFocus: '길이 측정, cm 단위 읽기, m 단위 변환',
      helpSummary: '자 사용 전 칸 세기로 길이감을 만들고, 실제 cm, 0.5cm, 0.1cm, 2자리 cm, m 단위로 확장합니다.',
      methodItems: [
        '먼저 색깔 네모가 몇 칸인지 세며 길이의 기본 단위를 경험합니다.',
        '이후 실제 자처럼 cm, 0.5cm, 0.1cm 눈금을 보며 끝점 위치를 읽습니다.',
        '큰 길이는 2자리 cm와 m 단위로 바꾸며 일상 속 키와 물체 높이에 연결합니다.'
      ],
      benefitItems: [
        '칸 세기와 표준 단위 cm를 자연스럽게 연결합니다.',
        '실제 자를 읽기 전 필요한 시작점, 끝점, 눈금 위치 주의를 강화합니다.',
        'cm와 m를 오가며 측정 언어, 수 감각, 생활 속 길이 비교를 함께 기릅니다.'
      ],
      stages: [
        ['네모 칸 세기', '자 전에 색깔 네모의 칸 수를 세어요.', 6, { rulerCount: 1, min: 2, max: 5, ask: 'blocks' }],
        ['cm 눈금 읽기', '실제 자처럼 cm 숫자를 읽어요.', 7, { min: 2, max: 8, ask: 'rulerCm' }],
        ['0.5cm 눈금', '반 칸 눈금이 어디인지 읽어요.', 8, { min: 1, max: 6, ask: 'halfCm' }],
        ['0.5cm 종이', '반 칸에서 끝나는 긴 종이 길이를 읽어요.', 9, { min: 1, max: 8, ask: 'halfObject', objectKinds: ['paper'] }],
        ['0.1cm 눈금', '작은 눈금 한 칸까지 읽어요.', 9, { min: 1, max: 6, ask: 'tenthCm' }],
        ['0.1cm 종이', '긴 종이 끝이 닿는 작은 눈금을 읽어요.', 10, { min: 1, max: 8, ask: 'tenthObject', objectKinds: ['paper'] }],
        ['cm 종합 복습', 'cm, 0.5cm, 0.1cm와 실제 길이를 섞어서 읽어요.', 8, { min: 1, max: 8, ask: 'reviewCm' }],
        ['2자리 cm 배우기', '화면에 맞춘 긴 자에서 2자리 cm를 읽어요.', 8, { min: 12, max: 48, ask: 'twoDigitCm' }],
        ['cm와 m 알기', '사람, 동물, 물건 길이를 cm와 m로 읽어요.', 14, { ask: 'meterIntro' }],
        ['cm와 m 바꾸기', '문제를 보고 보기 버튼에서 답을 골라요.', 10, { ask: 'meterKeypad' }]
      ]
    },
    'number-estimate-jar': {
      title: '어림하기 학습',
      categoryTitle: '어림과 크기감',
      description: '상황에 맞는 영리한 수를 빠르게 고르고 설명해요.',
      accent: '#f97316',
      autoAdvanceOnCorrect: true,
      reportFocus: '어림수, 올림, 버림, 반올림, 묶음 단위 추정',
      helpSummary: '어림을 정확하지 않은 가짜 수가 아니라 상황에 맞는 영리한 수로 이해하고, 올림·버림·반올림을 생활 장면에 맞게 선택합니다.',
      methodItems: [
        '먼저 어림과 어림수의 뜻을 예시로 확인합니다.',
        '한 박스에 10개가 들어 있는 상황을 보고 박스와 낱개를 함께 읽습니다.',
        '올림, 버림, 반올림의 기준을 상황에 맞게 적용해 어림수를 고릅니다.'
      ],
      benefitItems: [
        '수량을 하나씩 세기보다 기준 단위로 빠르게 파악하는 힘을 기릅니다.',
        '견적, 개산, 추산처럼 일상에서 필요한 대략 계산 감각을 강화합니다.',
        '정확한 값과 어림수의 차이를 이해해 계산 결과가 말이 되는지 점검합니다.'
      ],
      stages: [
        ['어림 듣기', '문제를 풀기 전 어림이 왜 필요한지 들어요.', 5, { ask: 'meaningTeachingOnly' }],
        ['묶음으로 어림하기', '10개 묶음과 낱개로 전체 양을 빠르게 봐요.', 10, { ask: 'boxSenseMixed', unit: 10, minBoxes: 2, maxBoxes: 8, minLoose: 1, maxLoose: 9, item: 'mixed' }],
        ['어림 방법 듣기', '올림, 버림, 반올림이 필요한 상황을 들어요.', 6, { ask: 'roundingTeachingOnly' }],
        ['생활 속 어림 선택', '피자, 배, 동전처럼 상황에 맞는 답을 골라요.', 10, { ask: 'lifeEstimateMixed' }],
        ['같은 수 다른 결과', '같은 수라도 방법에 따라 결과가 달라져요.', 10, { ask: 'modeCompare' }],
        ['상황 맞춤 종합', '지금 필요한 어림 방법을 스스로 판단해요.', 10, { ask: 'modeChoiceScenario' }]
      ]
    }
  };

  const stageColors = ['#4cbdc9', '#20b970', '#3478f6', '#8b5cf6', '#f59e0b', '#0ea5e9', '#14b8a6', '#ef4444', '#6366f1', '#f97316'];
  const tokenColors = ['#4cbdc9', '#20b970', '#3478f6', '#ffce24', '#ff7a00', '#8b5cf6', '#ef4444', '#94a3b8'];
  const graphLabels = ['사과', '배', '딸기', '포도', '귤', '수박'];
  const rulerColorSets = [
    { name: '노란색', color: '#ffce24', edge: '#b77900', ink: '#4a2e00' },
    { name: '파란색', color: '#3478f6', edge: '#1d4ed8', ink: '#ffffff' },
    { name: '초록색', color: '#20b970', edge: '#047857', ink: '#ffffff' },
    { name: '분홍색', color: '#ff7a90', edge: '#be123c', ink: '#ffffff' },
    { name: '보라색', color: '#8b5cf6', edge: '#6d28d9', ink: '#ffffff' },
    { name: '주황색', color: '#f97316', edge: '#c2410c', ink: '#ffffff' }
  ];
  const rulerMeasureObjects = [
    { group: 'object', kind: 'pen', name: '볼펜', shape: 'long', color: '#b8e34a', accent: '#353535' },
    { group: 'object', kind: 'marker', name: '사인펜', shape: 'long', color: '#45c1d4', accent: '#353535' },
    { group: 'object', kind: 'pencil', name: '연필', shape: 'long', color: '#f9735b', accent: '#ffdca8' },
    { group: 'object', kind: 'eraser', name: '지우개', shape: 'wide', color: '#f8fafc', accent: '#ff9ab6' },
    { group: 'object', kind: 'paper', name: '노란 종이', shape: 'paper', color: '#ffce24', accent: '#b77900' },
    { group: 'object', kind: 'paper', name: '초록 종이', shape: 'paper', color: '#20b970', accent: '#047857' },
    { group: 'object', kind: 'paper', name: '파란 종이', shape: 'paper', color: '#3478f6', accent: '#1d4ed8' },
    { group: 'object', kind: 'paper', name: '분홍 종이', shape: 'paper', color: '#ff7a90', accent: '#be123c' },
    { group: 'object', kind: 'paper', name: '보라 종이', shape: 'paper', color: '#8b5cf6', accent: '#6d28d9' }
  ];
  const realMeasureExamples = [
    { group: 'people', name: '아빠', image: 'images/etc/dad.svg', label: '180cm', valueCm: 180, direction: 'vertical', note: '아빠 키는 발밑부터 머리 위까지 약 180cm예요.' },
    { group: 'people', name: '엄마', image: 'images/etc/Mom.svg', label: '160cm', valueCm: 160, direction: 'vertical', note: '엄마 키는 발밑부터 머리 위까지 약 160cm예요.' },
    { group: 'people', name: '딸', image: 'images/etc/Daughter.svg', label: '150cm', valueCm: 150, direction: 'vertical', note: '딸 키는 발밑부터 머리 위까지 약 150cm예요.' },
    { group: 'people', name: '아들', image: 'images/etc/son.svg', label: '100cm', valueCm: 100, direction: 'vertical', note: '아들 키는 발밑부터 머리 위까지 약 100cm예요.' },
    { name: '기린', image: 'images/etc/Giraffe.svg', label: '5m', valueCm: 500, direction: 'vertical', note: '기린은 발밑부터 머리 위까지 약 5m예요.' },
    { name: '코끼리', image: 'images/etc/Elephant.svg', label: '3m 50cm', valueCm: 350, direction: 'vertical', note: '코끼리는 발밑부터 등 위까지 약 3m 50cm예요.' },
    { name: '얼룩말', image: 'images/etc/Zebra.svg', label: '160cm', valueCm: 160, direction: 'vertical', note: '얼룩말은 발밑부터 등 위까지 약 160cm예요.' },
    { name: '앵무새', image: 'images/etc/parrot.svg', label: '30cm', valueCm: 30, direction: 'vertical', note: '앵무새는 발밑부터 머리 위까지 약 30cm예요.' },
    { name: '승용차', image: 'images/etc/car.svg', label: '4m 60cm', valueCm: 460, direction: 'horizontal', note: '승용차는 왼쪽 끝부터 오른쪽 끝까지 약 4m 60cm예요.' },
    { name: '경차', image: 'images/etc/Compactcar.svg', label: '3m 60cm', valueCm: 360, direction: 'horizontal', note: '경차는 왼쪽 끝부터 오른쪽 끝까지 약 3m 60cm예요.' },
    { name: '나무 1', image: 'images/etc/Tree-01.svg', label: '7m', valueCm: 700, direction: 'vertical', note: '큰 나무는 땅에서 꼭대기까지 약 7m예요.' },
    { name: '나무 2', image: 'images/etc/Tree-02.svg', label: '4m', valueCm: 400, direction: 'vertical', note: '작은 나무는 땅에서 꼭대기까지 약 4m예요.' }
  ];
  const routineMap = [
    ['아침 식사', 8, 0],
    ['등원 준비', 9, 0],
    ['점심 시간', 12, 0],
    ['간식 시간', 3, 30],
    ['저녁 식사', 6, 30],
    ['잠잘 준비', 9, 0]
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const topicText = (value) => {
    const text = String(value ?? '');
    const last = text.charCodeAt(text.length - 1);
    const hasBatchim = last >= 0xac00 && last <= 0xd7a3 && ((last - 0xac00) % 28) !== 0;
    return `${text}${hasBatchim ? '은' : '는'}`;
  };
  const sentenceBreakHtml = (value) => escapeHtml(value).replace(/([.!?])\s+/g, '$1<br>');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const koreanDigits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const numberToKorean = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    if (!Number.isInteger(number)) return String(value).replace('.', ' 점 ').replace(/\d/g, (digit) => koreanDigits[Number(digit)] || digit);
    if (number === 0) return '영';
    const units = [
      [1000, '천'],
      [100, '백'],
      [10, '십']
    ];
    let rest = number;
    let text = '';
    units.forEach(([unit, label]) => {
      const digit = Math.floor(rest / unit);
      if (digit > 0) {
        text += `${digit > 1 ? koreanDigits[digit] : ''}${label}`;
        rest %= unit;
      }
    });
    if (rest > 0) text += koreanDigits[rest];
    return text;
  };
  const readLengthKorean = (label) => {
    const text = String(label || '').replace(/\s+/g, '');
    const meterCm = text.match(/^(\d+(?:\.\d+)?)m(\d+(?:\.\d+)?)cm$/);
    if (meterCm) return `${numberToKorean(meterCm[1])} 미터 ${numberToKorean(meterCm[2])} 센티미터`;
    const meterOnly = text.match(/^(\d+(?:\.\d+)?)m$/);
    if (meterOnly) return `${numberToKorean(meterOnly[1])} 미터`;
    const cmOnly = text.match(/^(\d+(?:\.\d+)?)cm$/);
    if (cmOnly) return `${numberToKorean(cmOnly[1])} 센티미터`;
    return label;
  };
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[rand(0, items.length - 1)];
  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = rand(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const uniqueChoices = (answer, pool, size = 4) => {
    const values = [String(answer)];
    shuffle(pool.map(String)).forEach((item) => {
      if (values.length < size && !values.includes(item)) values.push(item);
    });
    return shuffle(values);
  };
  const fallbackChoicesFor = (answer) => {
    const text = String(answer);
    const numberValue = Number(text.replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(numberValue) && /원$/.test(text)) {
      return [-1000, -500, -100, 100, 500, 1000]
        .map((delta) => numberValue + delta)
        .filter((value) => value > 0)
        .map(formatMoney);
    }
    if (Number.isFinite(numberValue) && /^-?\d+(\.\d+)?$/.test(text)) {
      return [-3, -2, -1, 1, 2, 3, 5, 10]
        .map((delta) => numberValue + delta)
        .filter((value) => value >= 0)
        .map(String);
    }
    if (Number.isFinite(numberValue) && /^-?\d+(\.\d+)?(cm|칸)$/.test(text)) {
      const suffix = text.endsWith('cm') ? 'cm' : '칸';
      return [-3, -2, -1, 1, 2, 3, 4]
        .map((delta) => numberValue + delta)
        .filter((value) => value >= 0)
        .map((value) => `${value}${suffix}`);
    }
    if (/^\d+:\d{2}$/.test(text)) {
      const [hour, minute] = text.split(':').map(Number);
      if (hour > 12) {
        return [-2, -1, 1, 2].map((delta) => formatDigital24(clamp(hour + delta, 13, 23), minute));
      }
      return [-2, -1, 1, 2].map((delta) => formatTime(clamp(hour + delta, 1, 12), minute));
    }
    if (/^(AM|PM) \d{2}:\d{2}$/.test(text)) {
      const period = text.startsWith('AM') ? 'PM' : 'AM';
      return [text.replace(/^(AM|PM)/, period)];
    }
    if (/^(오전|오후) \d+:\d{2}$/.test(text)) {
      const period = text.startsWith('오전') ? '오후' : '오전';
      return [text.replace(/^(오전|오후)/, period)];
    }
    if (/^\d+\/\d+$/.test(text)) {
      return ['반', '셋 중 하나', '넷 중 하나', '공평해요'];
    }
    if (rulerColorSets.some((item) => item.name === text)) return rulerColorSets.map((item) => item.name);
    if (['왼쪽', '오른쪽', '같아요'].includes(text)) return ['왼쪽', '오른쪽', '같아요'];
    if (['A', 'B', 'C'].includes(text)) return ['A', 'B', 'C'];
    if (['>', '<', '='].includes(text)) return ['>', '<', '='];
    return ['왼쪽이 커요', '오른쪽이 커요', '같아요', '50보다 많아요', '50보다 적어요', '같게 나누었어요', '크기가 달라요'];
  };
  const normalizeQuestion = (question) => {
    if (question?.teaching) {
      return {
        ...question,
        answer: '',
        choices: []
      };
    }
    if (question?.inputMode === 'money-builder' || question?.inputMode === 'measure-paint' || question?.inputMode === 'dot-connect' || question?.inputMode === 'times-match') {
      return {
        ...question,
        answer: String(question.answer ?? ''),
        choices: []
      };
    }
    const answer = String(question?.answer ?? '');
    const choices = Array.isArray(question?.choices) ? question.choices.map(String) : [];
    if (question?.strictChoices) {
      const strict = [];
      [answer, ...choices].forEach((choice) => {
        const text = String(choice ?? '').trim();
        if (text && !strict.includes(text)) strict.push(text);
      });
      return {
        ...question,
        answer,
        choices: question?.preserveChoiceOrder ? strict : shuffle(strict)
      };
    }
    if (question?.preserveChoiceOrder) {
      const ordered = [];
      [...choices, answer].forEach((choice) => {
        const text = String(choice ?? '').trim();
        if (text && !ordered.includes(text)) ordered.push(text);
      });
      return {
        ...question,
        answer,
        choices: ordered
      };
    }
    const normalized = [];
    [answer, ...choices, ...fallbackChoicesFor(answer)].forEach((choice) => {
      const text = String(choice ?? '').trim();
      if (text && !normalized.includes(text)) normalized.push(text);
    });
    const targetSize = Math.min(4, Math.max(2, normalized.length));
    const selected = shuffle([answer, ...shuffle(normalized.filter((choice) => choice !== answer)).slice(0, targetSize - 1)]);
    return {
      ...question,
      answer,
      choices: selected
    };
  };
  const formatMoney = (value) => `${Number(value).toLocaleString('ko-KR')}원`;
  const formatTime = (hour, minute) => `${hour}:${String(minute).padStart(2, '0')}`;
  const formatKoreanClockTime = (hour, minute) => `${hour}시${minute ? ` ${minute}분` : ''}`;
  const formatDigital12 = (hour, minute) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const formatDigital24 = (hour, minute) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const hour12From24 = (hour) => {
    const value = hour % 12;
    return value === 0 ? 12 : value;
  };
  const periodCode = (hour) => hour < 12 ? 'AM' : 'PM';
  const periodKorean = (hour) => hour < 12 ? '오전' : '오후';
  const formatPeriodDigital = (hour, minute) => `${periodCode(hour)} ${formatDigital12(hour12From24(hour), minute)}`;
  const formatKoreanPeriodTime = (hour, minute) => `${periodKorean(hour)} ${formatTime(hour12From24(hour), minute)}`;
  const shareLabel = (den) => `${den}조각으로 똑같이 나누기`;
  const peopleLabel = (den) => `${den}명`;
  const shareFoodNames = {
    2: ['사과', '쿠키', '빵'],
    3: ['과자', '케이크', '귤'],
    4: ['피자', '초콜릿', '떡']
  };
  const shareColors = ['#ff6b6b', '#fbbf24', '#4cbdc9', '#8b5cf6'];
  const fractionImageItems = [
    { key: 'apple-1', food: '사과', den: 1, image: 'images/etc/apple-1.webp' },
    { key: 'apple-2', food: '사과', den: 2, image: 'images/etc/apple-2.webp' },
    { key: 'pizza-2', food: '피자', den: 2, image: 'images/etc/pizza-2.webp' },
    { key: 'pizza-4', food: '피자', den: 4, image: 'images/etc/pizza-4.webp' },
    { key: 'pizza-6', food: '피자', den: 6, image: 'images/etc/pizza-6.webp' },
    { key: 'roll-cake-1', food: '롤케익', den: 1, image: 'images/etc/roll-cake-1.webp' },
    { key: 'roll-cake-2', food: '롤케익', den: 2, image: 'images/etc/roll-cake-2.webp' },
    { key: 'roll-cake-3', food: '롤케익', den: 3, image: 'images/etc/roll-cake-3.webp' },
    { key: 'roll-cake-4', food: '롤케익', den: 4, image: 'images/etc/roll-cake-4.webp' }
  ].map((item) => ({
    ...item,
    label: item.den === 1 ? `${item.food} 1개` : `${item.food} ${item.den}조각`
  }));
  const formatWholeNumber = (value) => Number(value).toLocaleString('ko-KR');
  const ceilToPlace = (value, place) => Math.ceil(value / place) * place;
  const floorToPlace = (value, place) => Math.floor(value / place) * place;
  const roundToPlace = (value, place) => Math.round(value / place) * place;
  const placeLabel = (place) => place >= 100 ? '백의 자리' : '십의 자리';
  const estimateModeLabel = {
    ceil: '올림',
    floor: '버림',
    round: '반올림'
  };
  const estimateSceneImages = {
    pizza: 'images/number/number-estimate-pizza-order.webp',
    boat: 'images/number/number-estimate-boat-boarding.webp',
    coin: 'images/number/number-estimate-coin-exchange.webp',
    school: 'images/number/number-estimate-school-crowd.webp',
    market: 'images/number/number-estimate-market-cart.webp',
    doll: 'images/number/number-estimate-doll-machine.webp'
  };
  const estimateItemPresets = {
    apple: {
      itemName: '묶음 물건',
      unitLabel: '한 박스 10개',
      image: null,
      emoji: '●',
      boxTone: '#f97316',
      looseTone: '#ef4444'
    },
    counters: {
      itemName: '알록달록 물건',
      unitLabel: '한 박스 10개',
      image: null,
      emoji: '●',
      boxTone: '#4cbdc9',
      looseTone: '#8b5cf6'
    }
  };
  const TIMED_MULTIPLICATION_COUNTS = [10, 20, 30];

  const timesTwoItems = {
    fruit: [
      { name: '사과', unit: '개', image: 'images/supermarket/apple.webp', tone: '#ef4444' },
      { name: '바나나', unit: '개', image: 'images/supermarket/banana.webp', tone: '#facc15' }
    ],
    product: [
      { name: '사과', unit: '개', image: 'images/supermarket/apple.webp', tone: '#ef4444' },
      { name: '바나나', unit: '개', image: 'images/supermarket/banana.webp', tone: '#facc15' },
      { name: '당근', unit: '개', image: 'images/supermarket/carrot.webp', tone: '#f97316' },
      { name: '오이', unit: '개', image: 'images/supermarket/cucumber.webp', tone: '#22c55e' },
      { name: '가지', unit: '개', image: 'images/supermarket/eggplant.webp', tone: '#7c3aed' },
      { name: '모닝빵', unit: '개', image: 'images/supermarket/dinner-roll.webp', tone: '#d97706' },
      { name: '도넛', unit: '개', image: 'images/supermarket/donut.webp', tone: '#ec4899' }
    ]
  };

  const configFromPage = () => {
    const raw = window.NUMBERLAB_AGENCY_CONFIG || {};
    const id = String(raw.activityId || raw.categoryId || '').trim();
    return { ...raw, activityId: id };
  };

  const buildStages = (activity) => activity.stages.map(([title, subtitle, questionCount, params], index) => ({
    id: `${activity.id}-stage-${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    title,
    subtitle,
    questionCount,
    params,
    color: stageColors[index % stageColors.length]
  }));

  const normalizeActivity = () => {
    const pageConfig = configFromPage();
    const base = ACTIVITY_CONFIGS[pageConfig.activityId] || ACTIVITY_CONFIGS['number-compare-balance'];
    const activity = {
      ...base,
      ...pageConfig,
      id: pageConfig.activityId || 'number-compare-balance'
    };
    activity.stages = buildStages(activity);
    window.PLAYLAB_PAGE_CONFIG = {
      ...(window.PLAYLAB_PAGE_CONFIG || {}),
      title: activity.title,
      description: activity.description,
      helpTitle: activity.title,
      helpSummary: activity.helpSummary,
      helpHow: activity.methodItems.join('\n'),
      helpBenefit: activity.benefitItems.join('\n'),
      guideLabel: 'NUMBERLAB GUIDE',
      labType: 'numberlab'
    };
    return activity;
  };

  const state = {
    activity: null,
    stage: null,
    questionIndex: 0,
    question: null,
    correct: 0,
    wrong: 0,
    startedAt: 0,
    questionStartedAt: 0,
    responseTimes: [],
    questionLogs: [],
    resultRecorded: false,
    sessionId: '',
    locked: false,
    autoAdvanceTimer: null,
    timedDrillTimer: null,
    keypad: null,
    moneyBuilder: null,
    stageQuestionOrder: [],
    timedDrill: null
  };
  const els = {};
  let activeNumberAudio = null;
  let activeTeachingAudio = null;

  // Preserve actual submitted responses. Retried answers include feedback time,
  // so only the first submission is a latency sample; every attempt is retained.
  const recordSubmittedResponse = (response, correct, expectedResponse = state.question?.answer) => {
    const previous = state.questionLogs.filter((item) => item.questionIndex === state.questionIndex);
    const elapsed = performance.now() - state.questionStartedAt;
    const snapshot = (value) => value === undefined ? null : JSON.parse(JSON.stringify(value));
    state.questionLogs.push({
      itemId: `${state.stage.id}:question-${state.questionIndex + 1}`,
      order: state.questionLogs.length + 1,
      questionIndex: state.questionIndex,
      attemptIndex: previous.length + 1,
      response: snapshot(response),
      expectedResponse: snapshot(expectedResponse),
      correct: correct === true,
      responseMs: elapsed,
      elapsedSinceQuestionRenderMs: elapsed,
      timingSource: 'performance-now',
      isValid: previous.length === 0,
      excluded: previous.length > 0,
      exclusionReason: previous.length ? 'repeat-attempt-includes-feedback-time' : '',
      inputMode: state.question?.inputMode || 'choice',
      stimulus: snapshot({ prompt: state.question?.prompt, visual: state.question?.visual, data: state.question?.data })
    });
  };

  const isCompareBalanceActivity = () => state.activity?.id === 'number-compare-balance';
  const isNumberLineActivity = () => state.activity?.id === 'number-number-line-jump';
  const isEstimateJarActivity = () => state.activity?.id === 'number-estimate-jar';
  const isTimedMultiplicationStage = () => state.stage?.params?.ask === 'timedMultiplication';
  const isTimedDrillRunning = () => isTimedMultiplicationStage() && state.timedDrill && state.timedDrill.startedAt > 0 && !state.timedDrill.completedAt;
  const getActiveQuestionCount = () => Number(state.timedDrill?.questionCount || state.stage?.questionCount || 0) || 0;
  const formatElapsedTime = (milliseconds) => {
    const totalSeconds = Math.max(0, Math.floor(Number(milliseconds || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };
  const isTeachingOnlyMoneyStage = () => (
    (state.activity?.id === 'number-money-market'
      && ['coinStory', 'billStory'].includes(state.stage?.params?.ask))
    || (state.activity?.id === 'number-estimate-jar'
      && ['meaningTeachingOnly', 'roundingTeachingOnly'].includes(state.stage?.params?.ask))
  );

  const feedbackAudioCache = {};

  const playTone = (type) => {
    const normalized = type === 'wrong' ? 'wrong' : 'correct';
    const soundSrc = normalized === 'correct' ? '../sound/correct.mp3' : '../sound/error.mp3';
    if (typeof Audio !== 'undefined') {
      try {
        const audio = feedbackAudioCache[normalized] || new Audio(soundSrc);
        feedbackAudioCache[normalized] = audio;
        audio.volume = normalized === 'correct' ? 0.54 : 0.46;
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
        return;
      } catch (error) {
      }
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      const osc = ctx.createOscillator();
      const now = ctx.currentTime;
      osc.type = normalized === 'correct' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(normalized === 'correct' ? 620 : 180, now);
      osc.frequency.exponentialRampToValueAtTime(normalized === 'correct' ? 980 : 120, now + 0.14);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
      window.setTimeout(() => ctx.close(), 320);
    } catch (error) {
    }
  };

  const playPianoNote = (stepIndex = 0) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const notes = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99];
      const frequency = notes[Math.max(0, Number(stepIndex) || 0) % notes.length];
      if (Array.isArray(window.__numberLabPianoNoteLog)) {
        window.__numberLabPianoNoteLog.push({ stepIndex, frequency });
      }
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const body = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      body.type = 'triangle';
      overtone.type = 'sine';
      body.frequency.setValueAtTime(frequency, now);
      overtone.frequency.setValueAtTime(frequency * 2, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(720, now + 0.28);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);
      body.connect(filter);
      overtone.connect(filter);
      filter.connect(gain).connect(ctx.destination);
      body.start(now);
      overtone.start(now);
      body.stop(now + 0.46);
      overtone.stop(now + 0.32);
      window.setTimeout(() => ctx.close(), 560);
    } catch (error) {
    }
  };

  const stopNumberAudio = () => {
    if (!activeNumberAudio) return;
    try {
      activeNumberAudio.pause();
      activeNumberAudio.currentTime = 0;
    } catch (error) {
    }
    activeNumberAudio = null;
  };

  const stopTeachingAudio = () => {
    if (activeTeachingAudio) {
      try {
        activeTeachingAudio.pause();
        activeTeachingAudio.currentTime = 0;
      } catch (error) {
      }
      activeTeachingAudio = null;
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
      }
    }
    if (els.listenButton) {
      els.listenButton.disabled = false;
      els.listenButton.textContent = '다시 듣기';
    }
  };

  const findKoreanSpeechVoice = () => {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== 'function') return null;
    const voices = window.speechSynthesis.getVoices();
    if (!Array.isArray(voices) || !voices.length) return null;
    const isKorean = (voice) => /^ko([-_]|$)/i.test(voice.lang || '');
    return voices.find((voice) => isKorean(voice) && /google|korea|korean|yuna|sora/i.test(voice.name || ''))
      || voices.find((voice) => (voice.lang || '').toLowerCase() === 'ko-kr')
      || voices.find(isKorean)
      || null;
  };

  const playTeachingAudio = () => {
    const src = state.question?.narrationSrc;
    const narrationText = state.question?.narrationText || [state.question?.prompt, state.question?.instruction]
      .filter(Boolean)
      .join(' ');
    if (!src && !narrationText) return;
    stopTeachingAudio();
    if (!src && window.speechSynthesis && narrationText) {
      try {
        const utterance = new SpeechSynthesisUtterance(narrationText);
        utterance.lang = 'ko-KR';
        const koreanVoice = findKoreanSpeechVoice();
        if (koreanVoice) {
          utterance.voice = koreanVoice;
          utterance.lang = koreanVoice.lang || 'ko-KR';
        }
        utterance.rate = 0.92;
        utterance.pitch = 1.03;
        if (els.listenButton) {
          els.listenButton.disabled = true;
          els.listenButton.textContent = '읽는 중';
        }
        utterance.onend = utterance.onerror = () => {
          if (els.listenButton) {
            els.listenButton.disabled = false;
            els.listenButton.textContent = '다시 듣기';
          }
        };
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        if (els.listenButton) {
          els.listenButton.disabled = false;
          els.listenButton.textContent = '다시 듣기';
        }
      }
      return;
    }
    try {
      const audio = new Audio(src);
      activeTeachingAudio = audio;
      if (els.listenButton) {
        els.listenButton.disabled = true;
        els.listenButton.textContent = '다시 듣기';
      }
      const reset = () => {
        if (activeTeachingAudio === audio) activeTeachingAudio = null;
        if (els.listenButton) {
          els.listenButton.disabled = false;
          els.listenButton.textContent = '다시 듣기';
        }
      };
      audio.addEventListener('ended', reset, { once: true });
      audio.addEventListener('error', reset, { once: true });
      audio.play().catch(reset);
    } catch (error) {
      activeTeachingAudio = null;
    }
  };

  const playNumberAudio = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;
    stopNumberAudio();
    try {
      const audio = new Audio(`../sound/number/number-read-${numericValue}.mp3`);
      activeNumberAudio = audio;
      audio.play().catch(() => {});
    } catch (error) {
    }
  };

  const setView = (name) => {
    ['stageView', 'gameView', 'resultView'].forEach((key) => {
      els[key].classList.toggle('is-active', key === name);
    });
    els.stageButton.classList.toggle('shell-hidden', name === 'stageView');
    els.stageLabel.classList.toggle('shell-hidden', name === 'stageView');
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const updateResultMode = (mode) => {
    const kicker = els.resultView?.querySelector('.number-agency-kicker');
    if (kicker) kicker.textContent = mode === 'complete' ? 'NUMBERLAB COMPLETE' : 'NUMBERLAB RESULT';
    if (els.resultStats) els.resultStats.hidden = mode === 'complete';
    if (els.retryButton) els.retryButton.textContent = mode === 'complete' ? '현재 단계 다시 보기' : '현재 단계 다시 풀기';
    if (els.otherStageButton) els.otherStageButton.textContent = '다른 단계 선택하기';
  };

  const renderStages = () => {
    els.stageGrid.innerHTML = state.activity.stages.map((stage) => {
      const countLabel = Number(stage.params?.displayQuestionCount || 0) > 0
        ? `${Number(stage.params.displayQuestionCount)}문항`
        : stage.params?.timedDrill
        ? '10/20/30문항 선택'
        : ['meaningTeachingOnly', 'roundingTeachingOnly'].includes(stage.params?.ask)
        ? `${stage.questionCount}화면`
        : `${stage.questionCount}문항`;
      return `
      <button type="button" class="number-agency-stage-card" style="--stage-color: ${stage.color}" data-stage-id="${stage.id}" aria-label="${escapeHtml(stage.title)} 시작">
        <span class="number-agency-stage-badge">${stage.order}단계</span>
        <strong>${escapeHtml(stage.title)}</strong>
        <p>${escapeHtml(stage.subtitle)}</p>
        <div class="number-agency-stage-meta">
          <span>${countLabel}</span>
          <span>${state.activity.categoryTitle}</span>
        </div>
      </button>
    `;
    }).join('');
  };

  const tokensHtml = (count, colorOffset = 0) => `<div class="na-tokens">${Array.from({ length: count }, (_, index) => `<span class="na-token" style="--token-color:${tokenColors[(index + colorOffset) % tokenColors.length]}"></span>`).join('')}</div>`;

  const compareDotGroupHtml = (count, colorOffset = 0, group = 'left') => {
    const visibleCount = Math.max(0, Math.min(Number(count) || 0, 30));
    return `
      <div class="na-compare-dot-group" role="group" aria-label="${group === 'left' ? '왼쪽' : '오른쪽'} 점을 하나씩 세기">
        ${Array.from({ length: visibleCount }, (_, index) => `
          <button type="button" class="na-token na-compare-dot" style="--token-color:${tokenColors[(index + colorOffset) % tokenColors.length]}" data-compare-dot-value="${index + 1}" aria-label="${index + 1}번째 점 세기">
            <span class="na-compare-dot-number" aria-hidden="true">${index + 1}</span>
          </button>
        `).join('')}
      </div>
    `;
  };

  const compareExpressionCardHtml = (terms, total, group = 'left') => `
    <button type="button" class="na-compare-expression-card" data-compare-count="${Number(total) || 0}" aria-label="${group === 'left' ? '왼쪽' : '오른쪽'} 식 ${terms.join(' 더하기 ')} 값 듣기">
      ${terms.map((term, index) => `
        ${index ? '<span class="na-compare-expression-plus">+</span>' : ''}
        <span class="na-compare-expression-number">${term}</span>
      `).join('')}
    </button>
  `;

  const renderBalance = (q) => {
    if (q.data.compareBalanceV2) {
      return `
        <div class="number-agency-manipulative na-compare-stack">
          <section class="na-compare-row" aria-label="왼쪽 수량">
            ${q.data.leftVisual || compareDotGroupHtml(q.data.left, 0, 'left')}
          </section>
          <div class="na-compare-center-dot" aria-label="비교 기호 자리">?</div>
          <section class="na-compare-row" aria-label="오른쪽 수량">
            ${q.data.rightVisual || compareDotGroupHtml(q.data.right, 3, 'right')}
          </section>
        </div>
      `;
    }
    return `
      <div class="number-agency-manipulative na-two-zones">
        <section class="na-zone"><p class="na-zone-title">왼쪽</p>${q.data.leftVisual || tokensHtml(q.data.left, 0)}</section>
        <div class="na-symbol">${escapeHtml(q.data.symbol || '?')}</div>
        <section class="na-zone"><p class="na-zone-title">오른쪽</p>${q.data.rightVisual || tokensHtml(q.data.right, 3)}</section>
      </div>
    `;
  };

  const tenFrameHtml = (value, total = 10, shuffled = false) => {
    const filled = new Set();
    const order = shuffled ? shuffle(Array.from({ length: total }, (_, index) => index)) : Array.from({ length: total }, (_, index) => index);
    order.slice(0, value).forEach((index) => filled.add(index));
    return `<div class="na-tenframe">${Array.from({ length: total }, (_, index) => `<span class="na-cell ${filled.has(index) ? 'is-filled' : ''}"></span>`).join('')}</div>`;
  };

  const renderTenFrame = (q) => `<div class="number-agency-manipulative">${tenFrameHtml(q.data.value, q.data.total, q.data.shuffled)}</div>`;

  const renderPlaceValue = (q) => {
    const { hundreds = 0, tens = 0, ones = 0 } = q.data;
    const groups = [];
    if (hundreds) groups.push(`<div class="na-place-group">${Array.from({ length: hundreds }, () => '<div class="na-hundred"></div>').join('')}<div class="na-place-label">백 ${hundreds}</div></div>`);
    groups.push(`<div class="na-place-group">${Array.from({ length: tens }, () => '<div class="na-rod"></div>').join('')}<div class="na-place-label">십 ${tens}</div></div>`);
    groups.push(`<div class="na-place-group"><div class="na-ones">${Array.from({ length: ones }, () => '<span class="na-one"></span>').join('')}</div><div class="na-place-label">일 ${ones}</div></div>`);
    return `<div class="number-agency-manipulative"><div class="na-place-stack">${groups.join('')}</div></div>`;
  };

  const linePercent = (value, start, end) => ((value - start) / (end - start)) * 100;
  const renderNumberLine = (q) => {
    const { start, end, step, marker, jumpStart, jumpEnd } = q.data;
    const ticks = [];
    for (let value = start; value <= end; value += step) {
      ticks.push(`<span class="na-tick" style="left:${linePercent(value, start, end)}%"><span>${value}</span></span>`);
    }
    const markerClass = [
      'na-marker',
      q.data.animateMarker ? 'is-bounce-to-value' : '',
      q.data.correctAnimation === 'jumpRight' ? 'is-jump-dot' : ''
    ].filter(Boolean).join(' ');
    const markerStyle = Number.isFinite(marker)
      ? [
        `left:${linePercent(marker, start, end)}%`,
        Number.isFinite(q.data.markerStart) ? `--marker-start-left:${linePercent(q.data.markerStart, start, end)}%` : '',
        Number.isFinite(q.data.correctMarker) ? `--marker-correct-left:${linePercent(q.data.correctMarker, start, end)}%` : ''
      ].filter(Boolean).join(';')
      : '';
    const singleMarkerHtml = Number.isFinite(marker)
      ? `<span class="${markerClass}" data-number-line-marker="single" style="${markerStyle}"></span>`
      : '';
    const markerListHtml = Array.isArray(q.data.markers)
      ? q.data.markers.map((item, index) => {
        const value = Number(item.value);
        if (!Number.isFinite(value)) return '';
        const moveTo = Number(item.moveTo);
        const className = ['na-marker', 'is-pair-marker', item.role ? `is-${item.role}` : ''].filter(Boolean).join(' ');
        const style = [
          `left:${linePercent(value, start, end)}%`,
          Number.isFinite(moveTo) ? `--marker-correct-left:${linePercent(moveTo, start, end)}%` : ''
        ].filter(Boolean).join(';');
        return `<span class="${className}" data-number-line-marker="${escapeHtml(item.role || `pair-${index}`)}" style="${style}"></span>`;
      }).join('')
      : '';
    const jumpHtml = Number.isFinite(jumpStart) && Number.isFinite(jumpEnd)
      ? `<span class="na-jump${q.data.revealJumpOnCorrect ? ' is-correct-reveal' : ''}" style="left:${linePercent(Math.min(jumpStart, jumpEnd), start, end)}%;width:${Math.abs(linePercent(jumpEnd, start, end) - linePercent(jumpStart, start, end))}%"></span>`
      : '';
    return `<div class="number-agency-manipulative na-number-line"><div class="na-line-track">${ticks.join('')}${jumpHtml}${singleMarkerHtml}${markerListHtml}</div></div>`;
  };

  const moneyTokenClassFor = (value) => Number(value) >= 1000 ? 'na-bill' : 'na-coin';
  const moneyImageFor = (value, side = 'front') => Number(value) >= 1000
    ? `images/money/${Number(value)}.webp`
    : `images/money/${Number(value)}-${side}.webp`;
  const moneyTokenHtml = (rawValue, extraClass = '', index = 0) => {
    const value = typeof rawValue === 'object' ? Number(rawValue.value || 0) : Number(rawValue);
    const label = typeof rawValue === 'object' && rawValue.label ? rawValue.label : formatMoney(value);
    const side = typeof rawValue === 'object' && rawValue.side ? rawValue.side : (index % 2 === 0 ? 'front' : 'back');
    const className = `${moneyTokenClassFor(value)}${extraClass ? ` ${extraClass}` : ''}`;
    const style = (extraClass.includes('na-money-stack-token') || extraClass.includes('na-money-overlap-token')) ? ` style="--stack-index:${index}"` : '';
    return `
      <span class="${className}"${style} aria-label="${escapeHtml(label)}">
        <img src="${escapeHtml(moneyImageFor(value, side))}" alt="" aria-hidden="true">
        <span aria-hidden="true">${escapeHtml(label)}</span>
      </span>
    `;
  };

  const renderMoney = (q) => {
    const data = q.data || {};
    const renderRow = (items = []) => {
      const shouldStackBills = items.length >= 3 && items.every((item) => {
        const value = typeof item === 'object' ? Number(item.value || 0) : Number(item);
        return value >= 1000;
      });
      const rowClass = `na-money-row${shouldStackBills ? ' is-bill-stack' : ''}`;
      return `<div class="${rowClass}">${items.map((item, index) => moneyTokenHtml(item, shouldStackBills ? 'na-money-overlap-token' : '', index)).join('')}</div>`;
    };
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const isCoinSideGrid = groups.length > 0 && groups.every((group) => {
      const items = Array.isArray(group.items) ? group.items : [];
      return items.length === 2 && items.every((item) => Number(item?.value || item) < 1000 && item?.side);
    });
    const isCoinFrontGrid = groups.length === 4 && groups.every((group) => {
      const items = Array.isArray(group.items) ? group.items : [];
      return items.length === 1 && Number(items[0]?.value || items[0]) < 1000 && (!items[0]?.side || items[0]?.side === 'front');
    });
    const isSingleCoinSideGrid = isCoinSideGrid && groups.length === 1;
    if (data.builder) {
      return `
        <div class="number-agency-manipulative na-money-board na-money-builder-board">
          <div class="na-money-build-status">
            <div class="na-money-build-goal">
              <span>목표</span>
              <strong>${escapeHtml(formatMoney(data.target || 0))}</strong>
            </div>
            <div class="na-money-current" data-money-current>현재 ${escapeHtml(formatMoney(0))}</div>
          </div>
          <div class="na-money-stack" data-money-stack>
            <span class="na-money-stack-empty">아래 돈 버튼을 눌러 여기에 쌓아 보세요.</span>
          </div>
        </div>
      `;
    }
    if (groups.length) {
      return `
        <div class="number-agency-manipulative na-money-board${isCoinFrontGrid ? ' is-coin-front-board' : ''}">
          ${data.title ? `<strong class="na-money-board-title">${escapeHtml(data.title)}</strong>` : ''}
          <div class="na-money-group-grid${isCoinSideGrid ? ' is-coin-side-grid' : ''}${isSingleCoinSideGrid ? ' is-single-coin-side-grid' : ''}${isCoinFrontGrid ? ' is-coin-front-grid' : ''}">
            ${groups.map((group) => {
              const items = Array.isArray(group.items) ? group.items : [];
              const isCoinSides = items.length === 2 && items.every((item) => Number(item?.value || item) < 1000 && item?.side);
              const isCoinFront = isCoinFrontGrid && items.length === 1;
              const isBillStack = items.length >= 3 && items.every((item) => Number(item?.value || item) >= 1000);
              const hasBill = items.some((item) => Number(item?.value || item) >= 1000);
              const groupClass = ['na-money-group', isCoinSides ? 'is-coin-sides' : '', isCoinFront ? 'is-coin-front' : '', isSingleCoinSideGrid ? 'is-single-coin-side' : '', hasBill ? 'is-bill-group' : '', isBillStack ? 'is-bill-stack-group' : ''].filter(Boolean).join(' ');
              return `
              <section class="${groupClass}">
                <span>${escapeHtml(group.label || '')}</span>
                ${renderRow(items)}
                ${group.total ? `<em>${escapeHtml(group.total)}</em>` : ''}
              </section>
            `;
            }).join('')}
          </div>
          ${data.note ? `<p class="na-money-note">${escapeHtml(data.note)}</p>` : ''}
        </div>
      `;
    }
    const items = data.items || [];
    return `
      <div class="number-agency-manipulative na-money-board">
        ${data.title ? `<strong class="na-money-board-title">${escapeHtml(data.title)}</strong>` : ''}
        ${renderRow(items)}
        ${data.note ? `<p class="na-money-note">${escapeHtml(data.note)}</p>` : ''}
      </div>
    `;
  };

  const renderClock = (q) => {
    const hour = q.data.hour % 12;
    const minute = q.data.minute;
    const highlightMinute = Number.isFinite(Number(q.data.highlightMinute))
      ? ((Number(q.data.highlightMinute) % 60) + 60) % 60
      : null;
    const hourAngle = (hour * 30) + (minute * 0.5);
    const minuteAngle = minute * 6;
    const minuteTicks = Array.from({ length: 60 }, (_, index) => {
      const angle = (index * 6 - 90) * Math.PI / 180;
      const isMajor = index % 5 === 0;
      const isHighlighted = highlightMinute !== null && index === highlightMinute;
      const outer = 150;
      const inner = isMajor ? 136 : 144;
      const x1 = 170 + Math.cos(angle) * inner;
      const y1 = 170 + Math.sin(angle) * inner;
      const x2 = 170 + Math.cos(angle) * outer;
      const y2 = 170 + Math.sin(angle) * outer;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${isHighlighted ? '#ff8a00' : isMajor ? '#80b8e8' : '#c9def4'}" stroke-width="${isHighlighted ? 7 : isMajor ? 4 : 2}" stroke-linecap="round"></line>`;
    }).join('');
    const nums = Array.from({ length: 12 }, (_, index) => {
      const n = index + 1;
      const angle = (n * 30 - 90) * Math.PI / 180;
      const x = 170 + Math.cos(angle) * 125;
      const y = 170 + Math.sin(angle) * 125;
      return `<text x="${x}" y="${y + 8}" text-anchor="middle" font-size="24" font-weight="900" fill="#41617d">${n}</text>`;
    }).join('');
    return `
      <svg class="na-clock" viewBox="0 0 340 340" role="img" aria-label="시계">
        <circle cx="170" cy="170" r="154" fill="#ffffff" stroke="#b7d7f8" stroke-width="8"></circle>
        ${minuteTicks}
        ${nums}
        <line x1="170" y1="170" x2="170" y2="82" stroke="#3478f6" stroke-width="9" stroke-linecap="round" transform="rotate(${minuteAngle} 170 170)"></line>
        <line x1="170" y1="170" x2="170" y2="105" stroke="#1f2a44" stroke-width="12" stroke-linecap="round" transform="rotate(${hourAngle} 170 170)"></line>
        <circle cx="170" cy="170" r="12" fill="#4cbdc9"></circle>
      </svg>
    `;
  };

  const renderDigitalClock = (q) => {
    const display = q.data.display || formatDigital12(q.data.hour || 12, q.data.minute || 0);
    const period = q.data.period || '';
    return `
      <div class="number-agency-manipulative na-digital-clock-card" role="img" aria-label="디지털 시계 ${escapeHtml(display)}">
        <div class="na-digital-clock-frame">
          <div class="na-digital-clock-speaker" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="na-digital-clock-screen ${period ? 'has-period' : ''}">
            ${period ? `<span class="na-digital-period">${escapeHtml(period)}</span>` : ''}
            <span class="na-digital-time">${escapeHtml(display)}</span>
          </div>
          <div class="na-digital-clock-feet" aria-hidden="true"><span></span><span></span></div>
        </div>
      </div>
    `;
  };

  const renderClockTextLesson = (q) => `
      <div class="number-agency-manipulative na-clock-text-lesson ${(q.data.items || []).length > 2 ? 'is-many' : ''}" role="img" aria-label="${escapeHtml(q.data.alt || '시간 설명')}">
      ${(q.data.items || []).map((item) => {
        const badge = String(item.badge || '');
        const badgeClass = /[0-9:]/.test(badge) ? 'is-digital-badge' : 'is-text-badge';
        return `
        <section class="na-clock-text-card">
          <span class="${badgeClass}">${escapeHtml(badge)}</span>
          <strong>${escapeHtml(item.title || '')}</strong>
          <p>${escapeHtml(item.text || '')}</p>
        </section>
      `;
      }).join('')}
    </div>
  `;

  const renderClockMinuteLesson = (q) => `
    <div class="number-agency-manipulative na-clock-minute-lesson" role="img" aria-label="${escapeHtml(q.data.alt || '1분 단위 바늘 시계 설명')}">
      ${(() => {
        const item = (q.data.items || [])[0] || { hour: 1, minute: 0 };
        return `
          <div class="na-clock-minute-visual">${renderClock({ data: { hour: item.hour, minute: item.minute, highlightMinute: item.minute } })}</div>
        `;
      })()}
    </div>
  `;

  const renderClockKeypad = (q) => {
    const hour = q.data.hour || 1;
    const minute = Number(q.data.minute || 0);
    return `
      <div class="number-agency-manipulative na-clock-keypad-visual" role="img" aria-label="${escapeHtml(formatKoreanClockTime(hour, minute))} 입력 문제">
        <div class="na-clock-keypad-clock">${renderClock({ data: { hour, minute } })}</div>
        <div class="na-clock-keypad-display" aria-live="polite">
          <span class="na-clock-input-box is-active" data-clock-box="hour" aria-label="시 입력칸"></span>
          <span class="na-clock-input-colon">:</span>
          <span class="na-clock-input-box" data-clock-box="minute" aria-label="분 입력칸"></span>
        </div>
      </div>
    `;
  };

  const renderClockIntro = (q) => {
    const cards = q.data.cards || [];
    return `
      <div class="number-agency-manipulative na-clock-intro ${cards.length === 1 ? 'is-single' : ''}" role="img" aria-label="${escapeHtml(q.data.alt || '시계 설명 그림')}">
        ${cards.map((card) => `
          <section class="na-clock-intro-card ${card.type === 'digital' ? 'is-digital' : 'is-analog'}">
            <div class="na-clock-intro-visual">
              ${card.type === 'digital'
                ? `<div class="na-mini-digital"><span>${escapeHtml(card.display || '08:00')}</span></div>`
                : renderClock({ data: { hour: card.hour || 3, minute: card.minute || 0 } })}
            </div>
            <strong>${escapeHtml(card.title)}</strong>
            <p>${escapeHtml(card.text)}</p>
          </section>
        `).join('')}
      </div>
    `;
  };

  const renderMeasureUnit = (item, index) => {
    const countValue = index + 1;
    const isFilled = item.paintable ? false : index < (Number(item.value) || 0);
    if (item.paintable) {
      return `<button type="button" class="na-unit is-clickable is-paintable" data-measure-paint-value="${countValue}" aria-pressed="false" aria-label="${countValue}번째 칸 칠하기"><span class="na-unit-number">${countValue}</span></button>`;
    }
    if (item.countable) {
      return `<button type="button" class="na-unit is-clickable ${isFilled ? 'is-filled' : ''}" data-measure-count-value="${countValue}" aria-pressed="false" aria-label="${countValue}칸 세기"><span class="na-unit-number">${countValue}</span></button>`;
    }
    return `<span class="na-unit ${isFilled ? 'is-filled' : ''}"></span>`;
  };

  const renderMeasure = (q) => {
    const items = q.data.items || [q.data.left, q.data.right].filter(Boolean);
    const question = q.data.questionText ? `
      <div class="na-measure-question">
        <p>${escapeHtml(q.data.questionText)}</p>
        ${q.data.instructionText ? `<span>${escapeHtml(q.data.instructionText)}</span>` : ''}
      </div>
    ` : '';
    const operator = q.data.operator ? `<div class="na-measure-operator" aria-hidden="true">${escapeHtml(q.data.operator)}</div>` : '';
    return `<div class="number-agency-manipulative na-measure-manipulative">${question}<div class="na-measure-row">${items.map((item, index) => {
      const blockCount = clamp(Number(item.blockCount ?? item.value) || 1, 1, 20);
      const color = item.color || '#4cbdc9';
      const edge = item.edge || '#168996';
      const ink = item.ink || '#ffffff';
      return `
        ${index > 0 && operator ? operator : ''}
        <section class="na-measure-item" style="--measure-color:${escapeHtml(color)};--measure-edge:${escapeHtml(edge)};--measure-ink:${escapeHtml(ink)};--measure-block-count:${blockCount};">
          <p class="na-zone-title">${escapeHtml(item.label || (index === 0 ? '막대 1' : '막대 2'))}</p>
          <div class="na-measure-track" aria-label="${escapeHtml(`${item.label || '막대'} ${item.value}칸`)}">${Array.from({ length: blockCount }, (_, unitIndex) => renderMeasureUnit(item, unitIndex)).join('')}</div>
        </section>
      `;
    }).join('')}</div></div>`;
  };

  const fractionSvg = (num, den, shape = 'circle') => {
    if (shape === 'rect') {
      return `<svg class="na-fraction-svg" viewBox="0 0 220 220">${Array.from({ length: den }, (_, i) => {
        const w = 180 / den;
        return `<rect x="${20 + i * w}" y="35" width="${w}" height="150" fill="${i < num ? '#4cbdc9' : '#ffffff'}" stroke="#8bbded" stroke-width="3"></rect>`;
      }).join('')}</svg>`;
    }
    const cx = 110;
    const cy = 110;
    const r = 84;
    const pieces = Array.from({ length: den }, (_, i) => {
      const a1 = (i / den) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 1) / den) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      const x2 = cx + Math.cos(a2) * r;
      const y2 = cy + Math.sin(a2) * r;
      const large = den === 2 ? 0 : (a2 - a1 > Math.PI ? 1 : 0);
      return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${i < num ? '#4cbdc9' : '#ffffff'}" stroke="#8bbded" stroke-width="3"></path>`;
    }).join('');
    return `<svg class="na-fraction-svg" viewBox="0 0 220 220">${pieces}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#8bbded" stroke-width="4"></circle></svg>`;
  };
  const unequalCircleSvg = () => `
    <svg class="na-fraction-svg" viewBox="0 0 220 220">
      <path d="M 110 110 L 110 26 A 84 84 0 1 1 42 159 Z" fill="#4cbdc9" stroke="#8bbded" stroke-width="3"></path>
      <path d="M 110 110 L 42 159 A 84 84 0 0 1 110 26 Z" fill="#ffffff" stroke="#8bbded" stroke-width="3"></path>
      <circle cx="110" cy="110" r="84" fill="none" stroke="#8bbded" stroke-width="4"></circle>
    </svg>`;
  const renderFraction = (q) => `<div class="number-agency-manipulative"><div class="na-fraction-wrap">${fractionSvg(q.data.num, q.data.den, q.data.shape)}</div></div>`;
  const renderFractionImagePrompt = (q) => `
    <div class="number-agency-manipulative na-fraction-image-prompt" role="img" aria-label="${escapeHtml(q.data?.targetLabel || '분수 그림 찾기')}">
      <span>${escapeHtml(q.data?.badge || '찾아보세요')}</span>
      <strong>${escapeHtml(q.data?.targetLabel || '')}</strong>
      <p>${escapeHtml(q.data?.hint || '아래 그림 보기에서 같은 음식을 찾아요.')}</p>
    </div>
  `;
  const renderFractionSplitLesson = (q) => `
    <div class="na-fraction-lesson-frame">
      <div class="na-fraction-lesson-nav-slot is-prev" data-fraction-nav-slot="prev"></div>
      <div class="number-agency-manipulative na-fraction-lesson-card" role="img" aria-label="${escapeHtml(q.data?.title || '롤케익 나누기')}">
        <img src="${escapeHtml(q.data?.image || '')}" alt="${escapeHtml(q.data?.alt || q.data?.title || '')}">
        <div>
          <strong>${escapeHtml(q.data?.title || '')}</strong>
          <p>${escapeHtml(q.data?.text || '')}</p>
        </div>
      </div>
      <div class="na-fraction-lesson-nav-slot is-next" data-fraction-nav-slot="next"></div>
    </div>
  `;
  const renderFractionSingleImage = (q) => `
    <div class="number-agency-manipulative na-fraction-single-card" role="img" aria-label="${escapeHtml(q.data?.label || '조각 그림')}">
      <img src="${escapeHtml(q.data?.image || '')}" alt="${escapeHtml(q.data?.label || '')}">
    </div>
  `;
  const renderFractionNumberTarget = (q) => `
    <div class="number-agency-manipulative na-fraction-number-target" role="img" aria-label="${escapeHtml(q.data?.targetLabel || '조각 수')}">
      <span>찾을 조각 수</span>
      <strong>${escapeHtml(q.data?.targetLabel || '')}</strong>
    </div>
  `;
  const renderShareScene = (q) => {
    const den = Number(q.data.den || 2);
    const food = q.data.food || '간식';
    const pieces = Array.from({ length: den }, (_, index) => `
      <span class="na-share-piece" style="--piece-color:${shareColors[index % shareColors.length]}" aria-hidden="true"></span>
    `).join('');
    const friends = Array.from({ length: den }, (_, index) => `
      <span class="na-share-friend"><span>${index + 1}</span><em>친구</em></span>
    `).join('');
    return `
      <div class="number-agency-manipulative">
        <div class="na-share-scene">
          <div class="na-share-food-card">
            <p>${escapeHtml(food)}</p>
            <div class="na-share-food" data-share-den="${den}">${pieces}</div>
          </div>
          <div class="na-share-friend-row">${friends}</div>
        </div>
      </div>`;
  };
  const renderShareLesson = () => `
    <div class="number-agency-manipulative">
      <div class="na-share-lesson">
        <div class="na-share-lesson-food">${fractionSvg(1, 2, 'circle')}</div>
        <div class="na-share-lesson-copy">
          <strong>똑같이 나누면 공평해요</strong>
          <p>사과 하나를 두 친구가 나누려면 같은 크기 두 조각으로 나누어요. 한 친구가 한 조각씩 가지면 둘 다 같은 만큼 받아요.</p>
        </div>
      </div>
    </div>`;
  const renderShareUnequal = () => `
    <div class="number-agency-manipulative">
      <div class="na-share-scene">
        <div class="na-share-food-card">
          <p>다르게 잘린 간식</p>
          <div class="na-share-unequal">${unequalCircleSvg()}</div>
        </div>
        <div class="na-share-friend-row">
          <span class="na-share-friend"><span>큰</span><em>조각</em></span>
          <span class="na-share-friend"><span>작은</span><em>조각</em></span>
        </div>
      </div>
    </div>`;
  const renderShareSymbolPrompt = (q) => `
    <div class="number-agency-manipulative">
      <div class="na-share-symbol-card">
        <div class="na-share-fraction-symbol" aria-label="${escapeHtml(String(q.data.den))}분의 1">
          <span>1</span>
          <i></i>
          <span>${escapeHtml(String(q.data.den))}</span>
        </div>
        <strong>${escapeHtml(q.data.label)}</strong>
        <p>동그라미가 같은 크기 ${escapeHtml(String(q.data.den))}조각으로 나뉜 보기를 고르세요.</p>
      </div>
    </div>`;

  const renderGraph = (q) => {
    const max = Math.max(...q.data.values, 1);
    return `<div class="number-agency-manipulative"><div class="na-graph">${q.data.values.map((value, index) => `
      <div class="na-bar-col">
        <div class="na-bar-fill" style="height:${Math.max(20, value / max * 190)}px"></div>
        <span class="na-bar-label">${q.data.labels[index]} ${value}</span>
      </div>
    `).join('')}</div></div>`;
  };

  const renderRulerStudy = (q) => {
    const rulers = q.data.rulers || [];
    const mode = q.data.mode || 'rulers';
    if (mode === 'blocks') {
      return `
        <div class="number-agency-manipulative na-ruler-study is-blocks" role="img" aria-label="${escapeHtml(q.data.alt || '색깔 네모 칸 세기')}">
          <div class="na-ruler-board na-block-board">
            ${rulers.map((item) => `
              <section class="na-block-row ${item.highlight ? 'is-target' : ''}" style="--ruler-color:${item.color};--ruler-edge:${item.edge};--ruler-ink:${item.ink};--block-count:${item.value};" aria-label="${escapeHtml(`${item.name} 네모 ${item.value}칸`)}">
                <div class="na-block-line">
                  ${Array.from({ length: item.value }, () => '<span class="na-block-cell"></span>').join('')}
                </div>
              </section>
            `).join('')}
          </div>
          ${q.data.note ? `<p class="na-ruler-note">${escapeHtml(q.data.note)}</p>` : ''}
        </div>
      `;
    }
    const renderTicks = (item) => {
      const startValue = Number(item.startValue || 0);
      const endValue = Math.max(startValue + 1, Number(item.endValue || item.scaleMax || item.value || 10));
      const scaleRange = endValue - startValue;
      const totalSteps = Math.round(scaleRange * 10);
      return Array.from({ length: totalSteps + 1 }, (_, step) => {
        const value = Math.round((startValue + step / 10) * 10) / 10;
        const isMajor = Number.isInteger(value);
        const isHalf = !isMajor && Math.abs(value * 10 % 10 - 5) < 0.01;
        const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
        return `
          <span class="na-ruler-tick ${isMajor ? 'is-major' : isHalf ? 'is-half' : 'is-minor'}" style="--tick-pos:${(step / totalSteps) * 100};">
            ${isMajor ? `<em class="na-ruler-tick-label">${label}</em>` : ''}
          </span>
        `;
      }).join('');
    };
    return `
      <div class="number-agency-manipulative na-ruler-study" role="img" aria-label="${escapeHtml(q.data.alt || '색깔 자 길이 보기')}">
        <div class="na-ruler-board">
          ${rulers.map((item) => {
            const startValue = Number(item.startValue || 0);
            const endValue = Math.max(startValue + 1, Number(item.endValue || item.scaleMax || item.value || 10));
            const measurePercent = item.measureValue == null
              ? 0
              : clamp(((Number(item.measureValue) - startValue) / (endValue - startValue)) * 100, 0, 100);
            return `
            <section class="na-ruler-strip ${item.highlight ? 'is-target' : ''} ${item.measureValue ? 'has-stick' : ''}" style="--ruler-color:${item.color};--ruler-edge:${item.edge};--ruler-ink:${item.ink};--ruler-width:${item.displayPercent || 100}%;--measure-percent:${measurePercent};" aria-label="${escapeHtml(item.alt || `${item.name} 자`)}">
              <div class="na-ruler-object-zone">
                ${item.object ? `
                  <span class="na-measure-object is-css-object ${item.object.shape ? `is-${escapeHtml(item.object.shape)}` : ''} is-${escapeHtml(item.object.kind || 'tool')}" style="--object-main:${escapeHtml(item.object.color || '#b8e34a')};--object-accent:${escapeHtml(item.object.accent || '#353535')};" role="img" aria-label="${escapeHtml(item.object.name)}">
                    <span class="na-css-tool" aria-hidden="true"></span>
                  </span>
                ` : ''}
              </div>
              <div class="na-ruler-track">
                ${renderTicks(item)}
                ${item.measureValue && !item.object ? `<span class="na-measure-stick" aria-hidden="true"></span>` : ''}
              </div>
            </section>
          `; }).join('')}
        </div>
        ${q.data.note ? `<p class="na-ruler-note">${escapeHtml(q.data.note)}</p>` : ''}
      </div>
    `;
  };

  const renderHeightStudy = (q) => {
    const items = q.data.items || [];
    const maxHeight = Math.max(...items.map((item) => Number(item.heightCm || 0)), Number(q.data.maxHeight || 200), 100);
    return `
      <div class="number-agency-manipulative na-height-study" role="img" aria-label="${escapeHtml(q.data.alt || 'cm와 m 길이 비교')}">
        <div class="na-height-stage">
          ${items.map((item) => {
            const heightCm = Number(item.heightCm || 100);
            return `
              <section class="na-height-item is-${escapeHtml(item.kind || 'object')}" style="--height-percent:${clamp((heightCm / maxHeight) * 100, 18, 100)};--height-tone:${escapeHtml(item.color || '#4cbdc9')};">
                <div class="na-height-ruler"><span>${escapeHtml(item.label || `${heightCm}cm`)}</span></div>
                <div class="na-height-figure" aria-hidden="true"><span></span></div>
                <strong>${escapeHtml(item.name || '')}</strong>
              </section>
            `;
          }).join('')}
        </div>
        ${q.data.note ? `<p class="na-ruler-note">${escapeHtml(q.data.note)}</p>` : ''}
      </div>
    `;
  };

  const renderRealMeasureStudy = (q) => {
    const items = q.data.items || null;
    if (Array.isArray(items) && items.length) {
      const scaleMax = Number(q.data.scaleMaxCm || Math.max(...items.map((item) => Number(item.valueCm || 100))) * 1.1);
      const noteHtml = q.data.note ? escapeHtml(q.data.note).replace(/\n/g, '<br>') : '';
      return `
        <div class="number-agency-manipulative na-real-measure-study is-group" role="img" aria-label="${escapeHtml(q.data.alt || '길이 전체 비교')}">
          <div class="na-real-measure-card is-group-card">
            ${items.map((item) => {
              const percent = clamp((Number(item.valueCm || 100) / scaleMax) * 100, 22, 92);
              return `
                <section class="na-real-group-item" style="--real-percent:${percent};">
                  <div class="na-real-object-frame">
                    ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">` : ''}
                  </div>
                  <div class="na-real-tape" aria-hidden="true"><span>${escapeHtml(item.label || '')}</span></div>
                </section>
              `;
            }).join('')}
          </div>
          ${noteHtml ? `<p class="na-ruler-note">${noteHtml}</p>` : ''}
        </div>
      `;
    }
    const item = q.data.item || {};
    const direction = item.direction === 'horizontal' ? 'horizontal' : 'vertical';
    const valueCm = Number(item.valueCm || 100);
    const scaleMax = Number(item.scaleMaxCm || Math.max(valueCm * 1.18, direction === 'horizontal' ? 500 : 210));
    const percent = clamp((valueCm / scaleMax) * 100, direction === 'horizontal' ? 54 : 42, 92);
    const noteHtml = q.data.note ? escapeHtml(q.data.note).replace(/\n/g, '<br>') : '';
    return `
      <div class="number-agency-manipulative na-real-measure-study is-${direction}" role="img" aria-label="${escapeHtml(item.name || '길이 예시')} ${escapeHtml(item.label || '')}">
        <div class="na-real-measure-card" style="--real-percent:${percent};">
          <div class="na-real-object-frame">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">` : ''}
          </div>
          <div class="na-real-tape" aria-hidden="true"><span>${escapeHtml(item.label || '')}</span></div>
        </div>
        ${noteHtml ? `<p class="na-ruler-note">${noteHtml}</p>` : ''}
      </div>
    `;
  };

  const renderMetricConversion = (q) => `
    <div class="number-agency-manipulative na-metric-conversion" role="img" aria-label="${escapeHtml(q.data.alt || 'cm와 m 변환')}">
      <div class="na-metric-card">
        <span>${escapeHtml(q.data.from || '')}</span>
        <i aria-hidden="true">=</i>
        <strong>${escapeHtml(q.data.to || '?')}</strong>
      </div>
      ${q.data.note ? `<p class="na-ruler-note">${escapeHtml(q.data.note)}</p>` : ''}
    </div>
  `;

  const renderEstimateLesson = (q) => `
    <div class="number-agency-manipulative na-estimate-lesson" role="img" aria-label="${escapeHtml(q.data.alt || '어림 설명')}">
      ${q.data.image ? `<img class="na-estimate-hero-image" src="${escapeHtml(q.data.image)}" alt="" aria-hidden="true">` : ''}
      <div class="na-estimate-lesson-cards">
        ${(q.data.items || []).map((item) => `
          <section class="na-estimate-lesson-card">
            <span>${escapeHtml(item.badge || '')}</span>
            <strong>${escapeHtml(item.title || '')}</strong>
            <p>${escapeHtml(item.text || '')}</p>
          </section>
        `).join('')}
      </div>
    </div>
  `;

  const renderEstimateBox = (q) => {
    const data = q.data || {};
    const boxes = Math.max(0, Number(data.boxes || 0));
    const loose = Math.max(0, Number(data.loose || 0));
    const unitSize = Number(data.unitSize || 10);
    const actualValue = Number(data.actualValue || boxes * unitSize + loose);
    const boxTone = data.boxTone || '#f97316';
    const looseTone = data.looseTone || '#ef4444';
    const emoji = data.emoji || '●';
    const multiRowClass = boxes >= 7 ? ' is-multi-row' : '';
    return `
      <div class="number-agency-manipulative na-estimate-box-board" role="img" aria-label="${escapeHtml(data.alt || '박스와 낱개로 어림하기')}">
        ${data.image ? `<img class="na-estimate-scene" src="${escapeHtml(data.image)}" alt="" aria-hidden="true">` : ''}
        <div class="na-estimate-unit-pill">${escapeHtml(data.unitLabel || `한 박스 ${unitSize}개`)}</div>
        <div class="na-estimate-box-row${multiRowClass}" style="--estimate-box-tone:${boxTone};">
          ${Array.from({ length: boxes }, (_, index) => `
            <span class="na-estimate-box" aria-label="${index + 1}번째 박스">
              <span class="na-estimate-box-lid"></span>
              <span class="na-estimate-box-label">${escapeHtml(String(unitSize))}</span>
            </span>
          `).join('')}
        </div>
        <div class="na-estimate-loose-wrap" style="--estimate-loose-tone:${looseTone};">
          <span class="na-estimate-loose-label">낱개</span>
          <div class="na-estimate-loose-items">
            ${loose ? Array.from({ length: loose }, (_, index) => `<button type="button" class="na-estimate-loose-item" data-estimate-loose-index="${index + 1}" aria-pressed="false" aria-label="낱개 ${index + 1}">${escapeHtml(emoji)}</button>`).join('') : '<span class="na-estimate-none">없어요</span>'}
          </div>
        </div>
      </div>
    `;
  };

  const renderEstimate = (q) => `<div class="number-agency-manipulative"><div class="na-estimate-jar">${tokensHtml(q.data.displayCount, 2)}</div></div>`;
  const renderTimesTwoObjects = (q) => {
    const data = q.data || {};
    const item = data.item || {};
    const groups = Math.max(1, Number(data.groups || 1));
    const perGroup = Math.max(1, Number(data.perGroup || 2));
    const unit = data.unit || item.unit || '개';
    const groupLabel = `${perGroup}${unit}씩 ${groups}묶음`;
    const itemSize = perGroup >= 7 ? 'clamp(20px, 2.2vw, 30px)' : perGroup >= 5 ? 'clamp(24px, 2.55vw, 34px)' : 'clamp(34px, 3.8vw, 52px)';
    const focusedItemSize = perGroup >= 7 ? 'clamp(27px, 3.05vw, 40px)' : perGroup >= 5 ? 'clamp(31px, 3.35vw, 46px)' : 'clamp(58px, 5.2vw, 82px)';
    const itemsPerRow = Math.min(3, Math.max(2, Math.ceil(Math.sqrt(perGroup))));
    const groupMinHeight = perGroup >= 7 ? 'clamp(78px, 6.8vw, 104px)' : perGroup >= 5 ? 'clamp(82px, 7vw, 108px)' : 'clamp(96px, 8.2vw, 126px)';
    const groupItems = Array.from({ length: groups }, (_, groupIndex) => `
      <div class="na-times-two-group" style="--group-tone:${escapeHtml(item.tone || '#f97316')};--items-per-row:${itemsPerRow};--item-size:${itemSize};--focused-item-size:${focusedItemSize};--group-min-height:${groupMinHeight};" aria-label="${groupIndex + 1}번째 묶음">
        ${Array.from({ length: perGroup }, (_, itemIndex) => `
          <img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.name || '그림')} ${groupIndex * perGroup + itemIndex + 1}" loading="lazy" decoding="async">
        `).join('')}
      </div>
    `).join('');
    return `
      <div class="number-agency-manipulative na-times-two-board" role="img" aria-label="${escapeHtml(item.name || '그림')} ${escapeHtml(groupLabel)}">
        <div class="na-times-two-title">${escapeHtml(groupLabel)}</div>
        <div class="na-times-two-groups">${groupItems}</div>
      </div>
    `;
  };
  const renderTimesTwoPath = (q) => {
    const data = q.data || {};
    const values = Array.isArray(data.values) ? data.values : [];
    const factor = Math.max(1, Number(data.factor || 2));
    return `
      <div class="number-agency-manipulative na-times-two-path" role="img" aria-label="${escapeHtml(factor)}씩 뛰어 세기">
        <div class="na-times-two-numberline">
          ${values.map((value, index) => `
            <span class="na-times-two-node ${value === null ? 'is-blank' : ''}">
              ${value === null ? '?' : escapeHtml(value)}
              ${index < values.length - 1 ? `<em>+${escapeHtml(factor)}</em>` : ''}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  };
  const renderTimesTwoDotConnect = (q) => {
    const data = q.data || {};
    const nodes = Array.isArray(data.nodes) ? data.nodes : [];
    const values = Array.isArray(data.sequence) ? data.sequence : [];
    const factor = Math.max(1, Number(data.factor || 2));
    const gridSize = Math.max(3, Math.min(5, Number(data.gridSize || 3)));
    const startValue = values[0] || factor;
    const endValue = values[values.length - 1] || factor * 10;
    return `
      <div class="number-agency-manipulative na-times-two-connect is-grid-${escapeHtml(gridSize)}" style="--connect-grid-size:${escapeHtml(gridSize)};" data-dot-connect-board data-dot-sequence="${escapeHtml(values.join(','))}" data-grid-size="${escapeHtml(gridSize)}" data-next-index="0" role="application" aria-label="${escapeHtml(factor)}씩 뛰어 세어 ${escapeHtml(startValue)}부터 ${escapeHtml(endValue)}까지 연결하기">
        <svg class="na-times-two-connect-lines" data-dot-connect-lines aria-hidden="true"></svg>
        <div class="na-times-two-connect-grid">
          ${nodes.map((node) => `
            <button type="button" class="na-times-two-connect-dot" style="--dot-row:${escapeHtml(node.row)};--dot-col:${escapeHtml(node.col)};" data-dot-value="${escapeHtml(node.value)}" aria-label="${escapeHtml(node.value)} 연결">
              <span>${escapeHtml(node.value)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  };
  const renderTimesTwoFormula = (q) => {
    const data = q.data || {};
    const groups = Math.max(1, Number(data.groups || 1));
    const factor = Math.max(1, Number(data.factor || 2));
    const addition = Array.from({ length: groups }, () => String(factor)).join(' + ');
    const answerBox = '<span class="na-times-two-answer-box" aria-hidden="true"></span>';
    const formulaLabel = data.mode === 'multiplication'
      ? `${factor} x ${groups} = 빈칸`
      : `${addition} = 빈칸`;
    const formula = data.mode === 'multiplication'
      ? `${escapeHtml(factor)} x ${escapeHtml(groups)} = ${answerBox}`
      : `${escapeHtml(addition)} = ${answerBox}`;
    return `
      <div class="number-agency-manipulative na-times-two-formula" role="img" aria-label="${escapeHtml(formulaLabel)}">
        <div class="na-times-two-expression">${formula}</div>
        ${data.showMultiplication ? `<div class="na-times-two-expression na-times-two-subexpression">${escapeHtml(factor)} x ${escapeHtml(groups)} = ${answerBox}</div>` : ''}
      </div>
    `;
  };
  const renderTimesTwoTable = (q) => {
    const factor = Math.max(1, Number(q.data?.factor || 2));
    const tableGroups = Array.isArray(q.data?.tableGroups) && q.data.tableGroups.length
      ? q.data.tableGroups
      : [1,2,3,4,5,6,7,8,9,10];
    return `
      <div class="number-agency-manipulative na-times-two-table" role="img" aria-label="구구단 ${escapeHtml(factor)}단 전체 보기">
        ${tableGroups.map((groups) => `
          <div class="na-times-two-table-row">
            <span>${escapeHtml(factor)} x ${escapeHtml(groups)}</span>
            <em>=</em>
            <strong>${escapeHtml(groups * factor)}</strong>
          </div>
        `).join('')}
      </div>
    `;
  };
  const renderTimesTwoTriple = (q) => {
    const equations = Array.isArray(q.data?.equations) ? q.data.equations : [];
    const factor = Math.max(1, Number(q.data?.factor || 2));
    const answerBox = '<span class="na-times-two-answer-box" aria-hidden="true"></span>';
    return `
      <div class="number-agency-manipulative na-times-two-triple" role="img" aria-label="이어진 ${escapeHtml(factor)}단 곱셈식">
        ${equations.map((item) => `
          <div class="na-times-two-triple-row ${item.blank ? 'is-blank' : ''}">
            <span>${escapeHtml(factor)} x ${escapeHtml(item.groups)}</span>
            <em>=</em>
            ${item.blank ? answerBox : `<strong>${escapeHtml(item.total)}</strong>`}
          </div>
        `).join('')}
      </div>
    `;
  };
  const renderTimesTwoMatch = (q) => {
    const pairs = Array.isArray(q.data?.pairs) ? q.data.pairs : [];
    const answers = Array.isArray(q.data?.answerOrder) ? q.data.answerOrder : pairs.map((pair) => pair.total);
    const factor = Math.max(1, Number(q.data?.factor || pairs[0]?.factor || 2));
    return `
      <div class="number-agency-manipulative na-times-match" data-times-match-board data-matched-count="0" style="--match-count:${escapeHtml(pairs.length || 4)};" role="application" aria-label="${escapeHtml(factor)}단 곱셈식으로 알맞게 선 긋기">
        <svg class="na-times-match-lines" data-times-match-lines aria-hidden="true"></svg>
        <div class="na-times-match-grid" aria-label="위 숫자와 아래 답">
          <div class="na-times-match-factor is-factor" aria-hidden="true">${escapeHtml(factor)}</div>
          <div class="na-times-match-factor is-operator" aria-hidden="true">x</div>
          ${pairs.map((pair, index) => `
            <button type="button" class="na-times-match-card is-expression" data-match-side="expression" data-match-group="${escapeHtml(pair.groups)}" data-match-total="${escapeHtml(pair.total)}" style="--match-col:${escapeHtml(index + 1)};" aria-label="${escapeHtml(pair.factor)} 곱하기 ${escapeHtml(pair.groups)}">
              <span>${escapeHtml(pair.groups)}</span>
            </button>
          `).join('')}
          ${answers.map((total, index) => `
            <button type="button" class="na-times-match-card is-answer" data-match-side="answer" data-match-total="${escapeHtml(total)}" style="--match-col:${escapeHtml(index + 1)};" aria-label="${escapeHtml(total)} 선택">
              <span>${escapeHtml(total)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  };
  const renderTimesTwoWritten = (q) => {
    const data = q.data || {};
    const factor = Math.max(1, Number(data.factor || 2));
    const groups = Math.max(1, Number(data.groups || 1));
    const answerBox = '<span class="na-times-two-answer-box" aria-hidden="true"></span>';
    if (data.orientation === 'vertical') {
      return `
        <div class="number-agency-manipulative na-times-written is-vertical" role="img" aria-label="${escapeHtml(factor)} 곱하기 ${escapeHtml(groups)} 세로식">
          <div class="na-times-written-vertical">
            <span>${escapeHtml(groups)}</span>
            <span class="is-factor">x ${escapeHtml(factor)}</span>
            <em></em>
            ${answerBox}
          </div>
        </div>
      `;
    }
    return `
      <div class="number-agency-manipulative na-times-written is-horizontal" role="img" aria-label="${escapeHtml(factor)} 곱하기 ${escapeHtml(groups)} 가로식">
        <div class="na-times-two-expression">${escapeHtml(factor)} x ${escapeHtml(groups)} = ${answerBox}</div>
      </div>
    `;
  };

  const visualRenderers = {
    balance: renderBalance,
    tenframe: renderTenFrame,
    placevalue: renderPlaceValue,
    numberline: renderNumberLine,
    money: renderMoney,
    clock: renderClock,
    'digital-clock': renderDigitalClock,
    'clock-text-lesson': renderClockTextLesson,
    'clock-minute-lesson': renderClockMinuteLesson,
    'clock-keypad': renderClockKeypad,
    'clock-intro': renderClockIntro,
    measure: renderMeasure,
    fraction: renderFraction,
    'fraction-image-prompt': renderFractionImagePrompt,
    'fraction-split-lesson': renderFractionSplitLesson,
    'fraction-single-image': renderFractionSingleImage,
    'fraction-number-target': renderFractionNumberTarget,
    'share-scene': renderShareScene,
    'share-lesson': renderShareLesson,
    'share-unequal': renderShareUnequal,
    'share-symbol': renderShareSymbolPrompt,
    graph: renderGraph,
    'ruler-study': renderRulerStudy,
    'height-study': renderHeightStudy,
    'real-measure-study': renderRealMeasureStudy,
    'metric-conversion': renderMetricConversion,
    'estimate-lesson': renderEstimateLesson,
    'estimate-box': renderEstimateBox,
    estimate: renderEstimate,
    'times-two-objects': renderTimesTwoObjects,
    'times-two-path': renderTimesTwoPath,
    'times-two-dot-connect': renderTimesTwoDotConnect,
    'times-two-formula': renderTimesTwoFormula,
    'times-two-table': renderTimesTwoTable,
    'times-two-triple': renderTimesTwoTriple,
    'times-two-match': renderTimesTwoMatch,
    'times-two-written': renderTimesTwoWritten
  };

  const makeCompareQuestion = (stage) => {
    const p = stage.params;
    const step = p.step || 1;
    const makeValue = () => {
      const min = p.min || 1;
      const max = p.max || 10;
      return step > 1 ? rand(Math.ceil(min / step), Math.floor(max / step)) * step : rand(min, max);
    };
    const makeExpressionSide = (mode) => {
      if (mode === 'sum10') {
        const firstUnit = rand(1, 7);
        const secondUnit = rand(1, Math.max(1, 9 - firstUnit));
        return { terms: [firstUnit * 10, secondUnit * 10], total: (firstUnit + secondUnit) * 10 };
      }
      const a = rand(1, Math.max(2, Math.min(8, p.max || 9)));
      const b = rand(1, Math.max(2, Math.min(5, p.max || 9)));
      return { terms: [a, b], total: a + b };
    };
    let left = makeValue();
    let right = makeValue();
    if (!/Equal/.test(p.relation) && left === right) right = clamp(right + step, p.min || 1, p.max || 10);
    if (/Equal/.test(p.relation) && Math.random() < 0.25) right = left;
    const mode = p.mode === 'mixed' ? (Math.random() < 0.5 ? 'quantity' : 'number') : (p.mode === 'mixedAdvanced' ? ['quantity', 'number', 'sum1', 'sum10'][rand(0, 3)] : p.mode);
    let leftExpression = null;
    let rightExpression = null;
    if (mode === 'sum1' || mode === 'sum10') {
      leftExpression = makeExpressionSide(mode);
      rightExpression = makeExpressionSide(mode);
      if (!/Equal/.test(p.relation) && leftExpression.total === rightExpression.total) {
        rightExpression = makeExpressionSide(mode);
      }
      if (/Equal/.test(p.relation) && Math.random() < 0.25) {
        rightExpression = { ...leftExpression, terms: [...leftExpression.terms] };
      }
      left = leftExpression.total;
      right = rightExpression.total;
    }
    const relation = left === right ? '=' : (left > right ? '>' : '<');
    if (isCompareBalanceActivity()) {
      const useDotGroups = mode === 'quantity' || (left <= 30 && right <= 30);
      const isExpression = Boolean(leftExpression && rightExpression);
      return {
        prompt: isExpression ? '양쪽 식의 값을 계산하고 알맞은 기호를 골라요.' : '양쪽 점을 하나씩 세고 알맞은 기호를 골라요.',
        instruction: isExpression ? '식을 누르면 계산한 값을 들을 수 있어요.' : '점을 누르면 1부터 차례대로 들을 수 있어요.',
        visual: 'balance',
        data: {
          left,
          right,
          compareBalanceV2: true,
          symbol: '',
          leftVisual: isExpression ? compareExpressionCardHtml(leftExpression.terms, leftExpression.total, 'left') : (useDotGroups ? '' : `<button type="button" class="na-compare-number-card" data-compare-count="${left}" aria-label="왼쪽 수 듣기">${left}</button>`),
          rightVisual: isExpression ? compareExpressionCardHtml(rightExpression.terms, rightExpression.total, 'right') : (useDotGroups ? '' : `<button type="button" class="na-compare-number-card" data-compare-count="${right}" aria-label="오른쪽 수 듣기">${right}</button>`)
        },
        answer: relation,
        choices: ['>', '<', '='],
        preserveChoiceOrder: true,
        explain: `위는 ${left}, 아래는 ${right}입니다.`
      };
    }
    let answer;
    let prompt = '알맞은 답을 고르세요.';
    let choices;
    if (p.relation === 'symbol' || mode === 'symbol') {
      answer = relation;
      choices = ['>', '<', '='];
      prompt = '왼쪽과 오른쪽 사이에 들어갈 기호는 무엇인가요?';
    } else if (p.relation === 'smaller') {
      answer = left < right ? '왼쪽' : (right < left ? '오른쪽' : '같아요');
      choices = ['왼쪽', '오른쪽', '같아요'];
      prompt = '어느 쪽이 더 적나요?';
    } else if (p.relation === 'mixed' || p.relation === 'mixedEqual') {
      answer = relation === '>' ? '왼쪽이 커요' : (relation === '<' ? '오른쪽이 커요' : '같아요');
      choices = ['왼쪽이 커요', '오른쪽이 커요', '같아요'];
      prompt = '비교 결과를 고르세요.';
    } else {
      answer = left > right ? '왼쪽' : (right > left ? '오른쪽' : '같아요');
      choices = ['왼쪽', '오른쪽', '같아요'];
      prompt = '어느 쪽이 더 많거나 큰가요?';
    }
    return {
      prompt,
      instruction: mode === 'quantity' ? '점의 수량을 비교하세요.' : '숫자의 크기를 비교하세요.',
      visual: 'balance',
      data: {
        left,
        right,
        symbol: p.relation === 'symbol' || mode === 'symbol' ? '?' : relation,
        leftVisual: mode === 'number' || mode === 'symbol' ? `<div class="na-symbol">${left}</div>` : '',
        rightVisual: mode === 'number' || mode === 'symbol' ? `<div class="na-symbol">${right}</div>` : ''
      },
      answer,
      choices,
      explain: `${left}와 ${right}를 비교하면 ${left} ${relation} ${right}입니다.`
    };
  };

  const makeTenFrameQuestion = (stage) => {
    const p = stage.params;
    const ask = p.ask === 'mixed' ? pick(['filled', 'empty', 'make10', 'teen', 'empty20']) : p.ask;
    const value = rand(p.min || 1, p.max || 10);
    const total = value > 10 || ask === 'empty20' ? 20 : 10;
    let answer = value;
    let prompt = '채워진 칸은 몇 개인가요?';
    if (ask === 'empty' || ask === 'make10') {
      answer = 10 - value;
      prompt = ask === 'make10' ? '10을 만들려면 몇 칸을 더 채우면 될까요?' : '빈칸은 몇 개인가요?';
    } else if (ask === 'empty20') {
      answer = 20 - value;
      prompt = '20까지 남은 칸은 몇 개인가요?';
    } else if (ask === 'compare') {
      const right = rand(1, 10);
      answer = value === right ? '같아요' : (value > right ? '왼쪽' : '오른쪽');
      return {
        prompt: '더 많이 채워진 10칸은 어느 쪽인가요?',
        instruction: '두 틀의 채워진 칸을 비교하세요.',
        visual: 'balance',
        data: { left: value, right, leftVisual: tenFrameHtml(value, 10), rightVisual: tenFrameHtml(right, 10), symbol: '?' },
        answer,
        choices: ['왼쪽', '오른쪽', '같아요'],
        explain: `왼쪽은 ${value}, 오른쪽은 ${right}입니다.`
      };
    } else if (ask === 'teen') {
      prompt = '10칸 틀을 모두 보고 몇 개인지 고르세요.';
    }
    return {
      prompt,
      instruction: '채워진 점과 빈칸을 10 기준으로 보세요.',
      visual: 'tenframe',
      data: { value, total, shuffled: p.shuffled },
      answer: String(answer),
      choices: uniqueChoices(answer, Array.from({ length: total + 1 }, (_, i) => i), 4),
      explain: `보이는 수는 ${value}, 남은 수는 ${total - value}입니다.`
    };
  };

  const splitPlaceValue = (value) => ({
    hundreds: Math.floor(value / 100),
    tens: Math.floor((value % 100) / 10),
    ones: value % 10
  });
  const makePlaceValueQuestion = (stage) => {
    const p = stage.params;
    let value = rand(p.min || 10, p.max || 99);
    if (p.zero) {
      const variants = [rand(1, 9) * 100 + rand(1, 9), rand(1, 9) * 100 + rand(1, 9) * 10, rand(1, 9) * 100];
      value = pick(variants);
    }
    const parts = splitPlaceValue(value);
    const ask = p.ask === 'mixed' ? pick(['value', 'ones', 'tens', 'expanded']) : p.ask;
    let prompt = '묶음을 보고 알맞은 수를 고르세요.';
    let answer = value;
    let choices = uniqueChoices(value, Array.from({ length: 18 }, (_, i) => clamp(value + (i - 8) * 3, 1, 999)), 4);
    if (ask === 'ones') {
      prompt = `${value}에서 일의 자리 숫자는 무엇인가요?`;
      answer = parts.ones;
      choices = uniqueChoices(answer, [0,1,2,3,4,5,6,7,8,9], 4);
    } else if (ask === 'tens') {
      prompt = `${value}에서 십의 자리 숫자는 무엇인가요?`;
      answer = parts.tens;
      choices = uniqueChoices(answer, [0,1,2,3,4,5,6,7,8,9], 4);
    } else if (ask === 'expanded') {
      prompt = '이 수를 자리값으로 바르게 나눈 것은 무엇인가요?';
      answer = `${Math.floor(value / 10) * 10} + ${parts.ones}`;
      if (parts.hundreds) answer = `${parts.hundreds * 100} + ${parts.tens * 10} + ${parts.ones}`;
      choices = uniqueChoices(answer, [
        `${parts.tens * 10} + ${parts.ones}`,
        `${parts.hundreds * 100} + ${parts.ones} + ${parts.tens * 10}`,
        `${value - 1} + 1`,
        `${Math.max(0, parts.hundreds - 1) * 100} + ${parts.tens * 10} + ${parts.ones + 10}`
      ], 4);
    }
    return {
      prompt,
      instruction: '큰 묶음부터 차례대로 확인하세요.',
      visual: 'placevalue',
      data: parts,
      answer: String(answer),
      choices: choices.map(String),
      explain: `${value}은 백 ${parts.hundreds}, 십 ${parts.tens}, 일 ${parts.ones}로 이루어져 있습니다.`
    };
  };

  const makeNumberLineQuestion = (stage) => {
    const p = stage.params;
    const ask = p.ask === 'mixed' ? pick(['marker', 'jump', 'backJump', 'nearest10', 'middle']) : p.ask;
    const values = [];
    for (let value = p.start; value <= p.end; value += p.step) values.push(value);
    if (ask === 'markerBounce') {
      const marker = pick(values);
      return {
        prompt: '점이 멈춘 수는 무엇인가요?',
        instruction: '점이 통통 움직인 뒤 멈춘 위치를 읽으세요.',
        visual: 'numberline',
        data: { ...p, marker, markerStart: p.start, animateMarker: true },
        answer: String(marker),
        choices: uniqueChoices(marker, values, 4),
        strictChoices: true,
        explain: `점은 ${marker} 위치에 멈췄습니다.`
      };
    }
    if (ask === 'oneStepRight') {
      const minMove = Math.max(1, Number(p.minMove || p.step || 1));
      const maxMove = Math.max(minMove, Math.min(Number(p.maxMove || p.step || 1), p.end - p.start));
      const move = rand(minMove, maxMove);
      const start = Number.isFinite(Number(p.fixedStart)) && Number(p.fixedStart) <= p.end - move
        ? Number(p.fixedStart)
        : rand(p.start, p.end - move);
      const end = start + move;
      return {
        prompt: `${start}에서 오른쪽으로 ${move}칸 이동하면 어디에 도착하나요?`,
        instruction: '정답을 고르면 점이 오른쪽으로 이동해요.',
        visual: 'numberline',
        data: {
          ...p,
          marker: start,
          jumpStart: start,
          jumpEnd: end,
          correctMarker: end,
          correctAnimation: 'jumpRight',
          revealJumpOnCorrect: true
        },
        answer: String(end),
        choices: uniqueChoices(end, values.filter((value) => value !== end), 4),
        strictChoices: true,
        explain: `${start}에서 오른쪽으로 ${move}칸 이동하면 ${end}입니다.`
      };
    }
    if (ask === 'betweenMiddle') {
      const left = Number.isFinite(Number(p.left)) ? Number(p.left) : 1;
      const right = Number.isFinite(Number(p.right)) ? Number(p.right) : 5;
      const answer = (left + right) / 2;
      return {
        prompt: `${left}과 ${right} 사이의 중간 수는 무엇인가요?`,
        instruction: '양쪽 점이 같은 간격으로 움직여 만나는 수를 찾아요.',
        visual: 'numberline',
        data: {
          ...p,
          markers: [
            { value: left, role: 'left', moveTo: answer },
            { value: right, role: 'right', moveTo: answer }
          ],
          correctAnimation: 'meetMiddle'
        },
        answer: String(answer),
        choices: uniqueChoices(answer, [left + p.step, answer, right - p.step, right], 4),
        strictChoices: true,
        explain: `${left}과 ${right} 사이의 중간 수는 ${answer}입니다.`
      };
    }
    if (ask === 'jump' || ask === 'backJump') {
      const jump = p.step;
      const start = ask === 'jump' ? pick(values.slice(0, -2)) : pick(values.slice(2));
      const end = ask === 'jump' ? start + jump : start - jump;
      return {
        prompt: `${start}에서 ${ask === 'jump' ? '오른쪽' : '왼쪽'}으로 한 칸 이동하면 어디에 도착하나요?`,
        instruction: '이동의 시작과 끝을 수직선에서 확인하세요.',
        visual: 'numberline',
        data: { ...p, marker: end, jumpStart: start, jumpEnd: end },
        answer: String(end),
        choices: uniqueChoices(end, values, 4),
        explain: `${start}에서 한 칸 이동하면 ${end}입니다.`
      };
    }
    if (ask === 'nearest10') {
      const value = rand(11, 99);
      const lower = Math.floor(value / 10) * 10;
      const upper = lower + 10;
      const answer = value - lower <= upper - value ? lower : upper;
      return {
        prompt: `${value}는 어느 10에 더 가까운가요?`,
        instruction: '양쪽 10까지의 거리를 비교하세요.',
        visual: 'numberline',
        data: { start: lower, end: upper, step: 5, marker: value },
        answer: String(answer),
        choices: uniqueChoices(answer, [lower, upper, lower - 10, upper + 10], 4),
        explain: `${value}는 ${answer}에 더 가깝습니다.`
      };
    }
    if (ask === 'middle') {
      const start = pick(values.slice(0, -3));
      const end = start + p.step * 2;
      const answer = start + p.step;
      return {
        prompt: `${start}와 ${end} 사이 한가운데 수는 무엇인가요?`,
        instruction: '두 수 사이의 같은 간격을 봅니다.',
        visual: 'numberline',
        data: { ...p, marker: answer },
        answer: String(answer),
        choices: uniqueChoices(answer, values, 4),
        explain: `${start}와 ${end} 사이의 중간 수는 ${answer}입니다.`
      };
    }
    const marker = pick(values);
    return {
      prompt: '빨간 점이 있는 수는 무엇인가요?',
      instruction: '눈금 간격을 확인하고 점의 위치를 읽으세요.',
      visual: 'numberline',
      data: { ...p, marker },
      answer: String(marker),
      choices: uniqueChoices(marker, values, 4),
      explain: `점은 ${marker} 위치에 있습니다.`
    };
  };

  const moneyItems = (value, count) => Array.from({ length: count }, () => value);
  const moneyTotal = (items) => items.reduce((sum, value) => sum + Number(value || 0), 0);
  const makeMoneySet = (values, countMax) => {
    const count = rand(2, countMax);
    return Array.from({ length: count }, () => pick(values)).sort((a, b) => b - a);
  };
  const makeMoneyBoardData = ({ title = '', items = [], groups = [], note = '' }) => ({ title, items, groups, note });
  const makeMoneyTeaching = ({ prompt, instruction, title, groups, items, note, narrationSrc }) => ({
    teaching: true,
    prompt,
    instruction,
    visual: 'money',
    data: makeMoneyBoardData({ title, groups, items, note }),
    narrationSrc,
    explain: instruction
  });
  const makeMoneyChoiceQuestion = ({ prompt, instruction, items, groups, title, note, answer, choices, explain }) => ({
    prompt,
    instruction,
    visual: 'money',
    data: makeMoneyBoardData({ title, items, groups, note }),
    answer,
    choices,
    strictChoices: true,
    explain
  });
  const makeCoinSideTeaching = (value, description) => makeMoneyTeaching({
    prompt: `${formatMoney(value)} 동전을 크게 살펴봐요.`,
    instruction: description,
    title: formatMoney(value),
    groups: [
      { label: formatMoney(value), items: [{ value, label: '앞면', side: 'front' }, { value, label: '뒷면', side: 'back' }], total: '' }
    ]
  });
  const withMoneyNarration = (items, prefix) => items.map((item, index) => ({
    ...item,
    narrationSrc: `../sound/number/number-money-market/${prefix}-${String(index + 1).padStart(2, '0')}.mp3`
  }));
  const moneyCoinStory = withMoneyNarration([
    makeCoinSideTeaching(10, '가장 작고 가벼운 구리색 동전이에요. 옛날 멋진 탑인 다보탑이 그려져 있어요. 많이 모이면 큰 힘을 발휘해요.'),
    makeCoinSideTeaching(50, '우리가 먹는 쌀이 자라는 벼 이삭이 그려져 있어요. 10원짜리 5개가 모이면 50원이 돼요.'),
    makeCoinSideTeaching(100, '우리나라를 지킨 이순신 장군님이 그려져 있어요. 껌이나 작은 사탕을 살 때 자주 만나는 친숙한 동전이에요.'),
    makeCoinSideTeaching(500, '하늘을 멋지게 나는 학이 그려져 있어요. 100원짜리 동전 5개가 모이면 500원이 돼요.'),
    makeMoneyTeaching({
      prompt: '반짝반짝 동전 친구들',
      instruction: '동전은 작고 단단해요. 숫자가 커질수록 우리가 바꿀 수 있는 선물도 더 커져요. 10원은 다보탑, 50원은 벼 이삭, 100원은 이순신 장군님, 500원은 학이 그려져 있어요.',
      title: '반짝반짝 동전 친구들',
      groups: [
        { label: '10원', items: [{ value: 10, label: '10원', side: 'front' }], total: '' },
        { label: '50원', items: [{ value: 50, label: '50원', side: 'front' }], total: '' },
        { label: '100원', items: [{ value: 100, label: '100원', side: 'front' }], total: '' },
        { label: '500원', items: [{ value: 500, label: '500원', side: 'front' }], total: '' }
      ]
    }),
    makeMoneyTeaching({
      prompt: '10원이 5개 모이면 50원이 돼요.',
      instruction: '10, 20, 30, 40, 50. 10원을 다섯 번 세면 50원이 됩니다.',
      groups: [
        { label: '10원 5개', items: moneyItems(10, 5), total: '50원' },
        { label: '같은 금액', items: [50], total: '50원 1개' }
      ],
      note: '작은 동전이 모이면 더 큰 동전과 같은 값이 돼요.'
    }),
    makeMoneyTeaching({
      prompt: '50원이 2개 모이면 100원이 돼요.',
      instruction: '50원, 100원. 두 번 세면 100원이 됩니다.',
      groups: [
        { label: '50원 2개', items: moneyItems(50, 2), total: '100원' },
        { label: '같은 금액', items: [100], total: '100원 1개' }
      ],
      note: '두 묶음은 모양이 달라도 값이 같아요.'
    }),
    makeMoneyTeaching({
      prompt: '10원이 10개 모여도 100원이 돼요.',
      instruction: '10원을 열 번 모으면 100원이 됩니다. 많이 모으면 더 큰 돈이 돼요.',
      groups: [
        { label: '10원 10개', items: moneyItems(10, 10), total: '100원' },
        { label: '같은 금액', items: [100], total: '100원 1개' }
      ]
    }),
    makeMoneyTeaching({
      prompt: '100원이 5개 모이면 500원이 돼요.',
      instruction: '100, 200, 300, 400, 500. 100원을 다섯 번 세면 500원이 됩니다.',
      groups: [
        { label: '100원 5개', items: moneyItems(100, 5), total: '500원' },
        { label: '같은 금액', items: [500], total: '500원 1개' }
      ]
    }),
    makeMoneyTeaching({
      prompt: '500원이 2개, 또는 100원이 10개면 1,000원이 돼요.',
      instruction: '500원 두 개도 1,000원, 100원 열 개도 1,000원이에요.',
      groups: [
        { label: '500원 2개', items: moneyItems(500, 2), total: '1,000원' },
        { label: '100원 10개', items: moneyItems(100, 10), total: '1,000원' },
        { label: '같은 금액', items: [1000], total: '1,000원 1장' }
      ],
      note: '같은 금액을 여러 방법으로 만들 수 있어요.'
    })
  ], 'coin-story');
  const moneyBillStory = withMoneyNarration([
    makeMoneyTeaching({
      prompt: '알록달록 지폐 친구들',
      instruction: '지폐는 종이로 만들어져서 가볍지만, 동전보다 훨씬 더 많은 약속을 담고 있어요. 1,000원은 파란색, 5,000원은 주황색, 10,000원은 초록색, 50,000원은 노란색 친구예요.',
      title: '알록달록 지폐 친구들',
      groups: [
        { label: '지폐', items: [1000, 5000], total: '1,000원, 5,000원' },
        { label: '더 큰 지폐', items: [10000, 50000], total: '10,000원, 50,000원' }
      ]
    }),
    makeMoneyTeaching({
      prompt: '1,000원은 500원 2개와 같아요.',
      instruction: '파란색 이황 할아버지 지폐예요. 편의점에서 아이스크림이나 과자 한 봉지를 살 수 있는 멋진 친구예요.',
      groups: [
        { label: '동전으로', items: moneyItems(500, 2), total: '1,000원' },
        { label: '지폐로', items: [1000], total: '1,000원' }
      ]
    }),
    makeMoneyTeaching({
      prompt: '5,000원은 1,000원 5장과 같아요.',
      instruction: '따뜻한 햇살 같은 주황색 지폐예요. 1,000원짜리 지폐 5장이 모이면 5,000원 한 장이 돼요.',
      groups: [
        { label: '1,000원 5장', items: moneyItems(1000, 5), total: '5,000원' },
        { label: '같은 금액', items: [5000], total: '5,000원 1장' }
      ]
    }),
    makeMoneyTeaching({
      prompt: '10,000원은 5,000원 2장과 같아요.',
      instruction: '초록색 세종대왕님 지폐예요. 5,000원 두 장을 모으면 10,000원이 되고, 예쁜 장난감을 살 때 만날 수 있어요.',
      groups: [
        { label: '5,000원 2장', items: moneyItems(5000, 2), total: '10,000원' },
        { label: '같은 금액', items: [10000], total: '10,000원 1장' }
      ]
    }),
    makeMoneyTeaching({
      prompt: '50,000원은 10,000원 5장과 같아요.',
      instruction: '노란색 신사임당 아주머니 지폐예요. 지폐 중에서 가장 힘이 센 친구라서 옷을 사거나 가족 외식 때 쓰기도 해요.',
      groups: [
        { label: '10,000원 5장', items: moneyItems(10000, 5), total: '50,000원' },
        { label: '같은 금액', items: [50000], total: '50,000원 1장' }
      ],
      note: '지폐도 동전처럼 묶어서 생각하면 쉬워요.'
    })
  ], 'bill-story');
  const makeMoneyBuildQuestion = ({ target, options, prompt, instruction, note }) => ({
    prompt,
    instruction,
    visual: 'money',
    inputMode: 'money-builder',
    data: {
      builder: true,
      target
    },
    buildOptions: options,
    answer: formatMoney(target),
    explain: `${formatMoney(target)}이 되었습니다.`
  });
  const makeMoneyQuestion = (stage) => {
    const ask = stage.params?.ask || 'coinStory';
    if (ask === 'coinStory') return moneyCoinStory[state.questionIndex % moneyCoinStory.length];
    if (ask === 'billStory') return moneyBillStory[state.questionIndex % moneyBillStory.length];
    if (ask === 'coinBuild500') {
      return makeMoneyBuildQuestion({
        target: 500,
        options: [100, 10, 50],
        prompt: '500원을 만들어보세요.',
        instruction: '100원, 10원, 50원 동전을 눌러 목표 금액을 만들어요.'
      });
    }
    const billTargets = [1000, 5000, 10000, 50000, 6000, 15000, 20000, 55000];
    const target = billTargets[state.questionIndex % billTargets.length];
    return makeMoneyBuildQuestion({
      target,
      options: [1000, 5000, 10000, 50000],
      prompt: `${formatMoney(target)}을 만들어보세요.`,
      instruction: '지폐를 눌러 목표 금액을 만들어요.'
    });
  };

  const makeClockIntroQuestion = () => {
    const introQuestions = [
      {
        teaching: true,
        prompt: '디지털 시계는 무엇일까요?',
        instruction: '디지털 시계는 시간을 숫자로 바로 보여주는 시계예요. 08:00처럼 앞 숫자는 시, 뒤 숫자는 분을 알려줘요.',
        visual: 'clock-intro',
        data: {
          alt: '디지털 시계 설명',
          cards: [
            { type: 'digital', display: '08:00', title: '디지털 시계', text: '숫자로 시간이 바로 보여요.' }
          ]
        },
        explain: ''
      },
      {
        teaching: true,
        prompt: '바늘 시계는 무엇일까요?',
        instruction: '바늘 시계는 짧은 바늘과 긴 바늘이 움직이며 시간을 알려주는 시계예요. 짧은 바늘은 시, 긴 바늘은 분을 알려줘요.',
        visual: 'clock-intro',
        data: {
          alt: '바늘 시계 설명',
          cards: [
            { type: 'analog', hour: 4, minute: 30, title: '바늘 시계', text: '짧은 바늘과 긴 바늘을 함께 봐요.' }
          ]
        },
        explain: ''
      },
      {
        prompt: '이 그림은 어떤 시계인가요?',
        instruction: '짧은 바늘과 긴 바늘이 있는지 살펴보세요.',
        visual: 'clock',
        data: { hour: 2, minute: 30 },
        answer: '바늘 시계',
        choices: ['바늘 시계', '디지털 시계'],
        strictChoices: true,
        explain: '짧은 바늘과 긴 바늘이 있으므로 바늘 시계입니다.'
      },
      {
        prompt: '이 그림은 어떤 시계인가요?',
        instruction: '시간이 숫자로 바로 보이는지 살펴보세요.',
        visual: 'digital-clock',
        data: { hour: 8, minute: 0, display: '08:00' },
        answer: '디지털 시계',
        choices: ['바늘 시계', '디지털 시계'],
        strictChoices: true,
        explain: '08:00처럼 숫자로 시간이 보이므로 디지털 시계입니다.'
      }
    ];
    return introQuestions[state.questionIndex % introQuestions.length];
  };

  const makeClockPeriodIntroQuestion = (stage) => {
    const p = stage.params;
    const teachingLessons = [
      {
        prompt: '12시간제는 무엇일까요?',
        instruction: '12시간제는 하루를 오전과 오후로 나누어 읽는 방법이에요. 12시가 지나면 다시 1시부터 시작해요.',
        alt: '12시간제 설명',
        items: [
          { badge: '12H', title: '오전 1~12시', text: '밤 12시 뒤부터 낮 12시 전까지는 오전이에요.' },
          { badge: '12H', title: '오후 1~12시', text: '낮 12시 뒤부터 밤 12시 전까지는 오후예요.' },
          { badge: 'AM', title: '오전 표시', text: '오전 5시는 AM 5:00처럼 써요.' },
          { badge: 'PM', title: '오후 표시', text: '오후 3시는 PM 3:00처럼 써요.' }
        ]
      },
      {
        prompt: 'AM은 무엇일까요?',
        instruction: 'AM은 오전이에요. 밤 12시가 지나고 낮 12시가 되기 전까지의 시간을 말해요.',
        alt: 'AM 설명',
        items: [
          { badge: 'AM', title: '오전', text: '아침에 일어나고, 등원하고, 점심 전까지의 시간이에요.' },
          { badge: '예', title: 'AM 8:00', text: '오전 8시처럼 읽어요.' }
        ]
      },
      {
        prompt: 'PM은 무엇일까요?',
        instruction: 'PM은 오후예요. 낮 12시가 지나고 밤 12시가 되기 전까지의 시간을 말해요.',
        alt: 'PM 설명',
        items: [
          { badge: 'PM', title: '오후', text: '점심 뒤부터 저녁, 밤까지의 시간이에요.' },
          { badge: '예', title: 'PM 7:00', text: '오후 7시처럼 읽어요.' }
        ]
      },
      {
        prompt: '24시간제는 무엇일까요?',
        instruction: '24시간제는 00:00부터 23:59까지 이어서 쓰는 방법이에요. 오전과 오후를 따로 붙이지 않아도 돼요.',
        alt: '24시간제 설명',
        items: [
          { badge: '24H', title: '자정 00:00', text: '하루가 시작되는 밤 12시는 00:00이에요.' },
          { badge: '15:00', title: '오후 3시', text: '오후 3시는 15:00으로 써요.' },
          { badge: '22:00', title: '오후 10시', text: '오후 10시는 22:00으로 써요.' },
          { badge: '정확', title: '헷갈림 줄이기', text: '비행기, 기차, 병원처럼 정확한 시간이 중요할 때 많이 써요.' }
        ]
      },
      {
        prompt: '오전 시간은 어떻게 쓸까요?',
        instruction: 'AM은 오전이에요. 오전 시간은 24시간 표시에서도 숫자를 그대로 써요.',
        alt: '오전 시간 24시간 보기',
        items: [
          { badge: '02:00', title: '오전 2시', text: 'AM 2:00은 02:00이에요.' },
          { badge: '08:00', title: '오전 8시', text: 'AM 8:00은 08:00이에요.' },
          { badge: '11:30', title: '오전 11시 30분', text: 'AM 11:30은 11:30이에요.' },
          { badge: '12:00', title: '밤 12시', text: 'AM 12:00은 00:00으로도 써요.' }
        ]
      },
      {
        prompt: '오후 시간은 어떻게 쓸까요?',
        instruction: 'PM은 오후예요. 오후 1시부터는 12를 더해서 24시간 표시로 써요.',
        alt: '오후 시간 24시간 보기',
        items: [
          { badge: '13:00', title: '오후 1시', text: 'PM 1:00은 13:00이에요.' },
          { badge: '14:00', title: '오후 2시', text: 'PM 2:00은 14:00이에요.' },
          { badge: '16:00', title: '오후 4시', text: 'PM 4:00은 16:00이에요.' },
          { badge: '19:30', title: '오후 7시 30분', text: 'PM 7:30은 19:30이에요.' }
        ]
      },
      {
        prompt: '시간은 어떻게 바꿀까요?',
        instruction: '오후 1시부터 오후 11시까지는 12를 더해요. 24시간제에서 12보다 크면 12를 빼서 오후 시간으로 읽어요.',
        alt: '시간 변환법 설명',
        items: [
          { badge: '+12', title: '오후를 24시간제로', text: 'PM 1:00은 1에 12를 더해 13:00이에요.' },
          { badge: '+12', title: '오후 10시', text: 'PM 10:00은 10에 12를 더해 22:00이에요.' },
          { badge: '-12', title: '24시간제를 오후로', text: '15:00은 15에서 12를 빼서 오후 3시예요.' },
          { badge: '00:00', title: '자정', text: 'AM 12:00은 00:00이에요. 하루가 시작되는 시간이죠.' }
        ]
      },
      {
        prompt: '이렇게 기억해요.',
        instruction: '오전은 그대로, 오후는 12를 더해요. 단, 12시는 특별해서 천천히 확인해요.',
        alt: 'AM PM 기억 규칙',
        items: [
          { badge: 'AM', title: '오전은 그대로', text: 'AM 2:00은 02:00, AM 9:00은 09:00이에요.' },
          { badge: '+12', title: '오후는 12 더하기', text: 'PM 1:00은 13:00, PM 6:00은 18:00이에요.' },
          { badge: '00:00', title: '밤 12시', text: 'AM 12:00은 하루가 시작되는 00:00이에요.' },
          { badge: '12:00', title: '낮 12시', text: 'PM 12:00은 점심 시간인 12:00이에요.' }
        ]
      }
    ];
    if (state.questionIndex < teachingLessons.length) {
      const lesson = teachingLessons[state.questionIndex];
      return {
        teaching: true,
        prompt: lesson.prompt,
        instruction: lesson.instruction,
        visual: 'clock-text-lesson',
        data: {
          alt: lesson.alt,
          items: lesson.items
        },
        explain: ''
      };
    }
    const questionOffset = state.questionIndex - teachingLessons.length;
    const isFirstConversion = questionOffset === 0;
    const minute = isFirstConversion ? 0 : pick(p.minutes);
    const baseHour = isFirstConversion ? 1 : pick(p.hours);
    const period = isFirstConversion ? 'PM' : pick(['AM', 'PM']);
    const periodHour = period === 'PM' && baseHour !== 12 ? baseHour + 12 : (period === 'AM' && baseHour === 12 ? 0 : baseHour);
    const answer = formatDigital24(periodHour, minute);
    const hourLabel = `${period} ${formatDigital12(hour12From24(periodHour), minute)}`;
    const pool = [
      formatDigital24(clamp(periodHour + 1, 0, 23), minute),
      formatDigital24(clamp(periodHour - 1, 0, 23), minute),
      formatDigital24(hour12From24(periodHour), minute),
      formatDigital24(periodHour, minute === 0 ? 30 : 0)
    ];
    return {
      prompt: `${hourLabel}은 24시간 표시로 어떻게 쓰나요?`,
      instruction: period === 'PM' ? 'PM은 오후예요. 오후 시간은 12를 더해 생각해요.' : 'AM은 오전이에요. 오전 시간은 숫자를 그대로 생각해요.',
      visual: 'digital-clock',
      data: {
        hour: hour12From24(periodHour),
        minute,
        period,
        display: formatDigital12(hour12From24(periodHour), minute)
      },
      answer,
      choices: uniqueChoices(answer, pool, 4),
      explain: `${hourLabel}은 ${answer}입니다.`
    };
  };

  const makeClockMinuteIntroQuestion = (stage) => {
    const p = stage.params;
    const minutes = Array.isArray(p.minutes) ? p.minutes : [1, 2, 3, 4, 5];
    const teachingScreens = 10;
    if (state.questionIndex < teachingScreens) {
      let hour = 1;
      let minute = 0;
      if (state.questionIndex === 1) {
        minute = 1;
      } else if (state.questionIndex > 1) {
        hour = pick(p.hours);
        minute = pick(minutes.filter((item) => item > 1));
      }
      return {
        teaching: true,
        prompt: formatKoreanClockTime(hour, minute),
        instruction: state.questionIndex === 0
          ? '처음에는 정각 1:00에서 시작해요. 다음을 누르면 긴 바늘이 작은 눈금 1칸만큼 움직여요.'
          : '바늘 시계의 긴 바늘은 분을 알려줘요. 작은 눈금 한 칸은 1분이에요.',
        visual: 'clock-minute-lesson',
        teachingReadout: {
          digital: formatDigital12(hour, minute),
          korean: formatKoreanClockTime(hour, minute)
        },
        data: {
          alt: `${formatKoreanClockTime(hour, minute)} 바늘 시계 예시`,
          items: [{
            hour,
            minute,
            label: formatKoreanClockTime(hour, minute),
            text: minute === 0
              ? '긴 바늘이 12를 가리키면 정각이에요.'
              : `긴 바늘이 작은 눈금 ${minute}칸에 있어요. 그래서 ${minute}분이에요.`
          }]
        },
        explain: ''
      };
    }
    const hour = pick(p.hours);
    const minute = pick(minutes);
    const answer = formatKoreanClockTime(hour, minute);
    const pool = p.hours
      .flatMap((candidateHour) => minutes.map((candidateMinute) => formatKoreanClockTime(candidateHour, candidateMinute)))
      .filter((choice) => choice !== answer);
    return {
      prompt: '바늘 시계는 몇 시 몇 분인가요?',
      instruction: `긴 바늘이 작은 눈금 ${minute}칸을 가리키면 ${minute}분이에요.`,
      visual: 'clock',
      data: { hour, minute },
      answer,
      choices: uniqueChoices(answer, pool, 4),
      strictChoices: true,
      explain: `짧은 바늘은 ${hour}시를 지나고, 긴 바늘은 ${minute}분을 가리켜서 ${answer}입니다.`
    };
  };

  const makeClockKeypadQuestion = (stage) => {
    const p = stage.params;
    const minutes = Array.isArray(p.minutes) ? p.minutes : Array.from({ length: 60 }, (_, minute) => minute);
    const isFirstQuestion = state.questionIndex === 0;
    const hour = isFirstQuestion ? 1 : pick(p.hours);
    const minute = isFirstQuestion ? 0 : pick(minutes);
    const answer = formatKoreanClockTime(hour, minute);
    return {
      prompt: '몇시 몇분일까요?',
      instruction: '왼쪽 시계를 보고 시를 먼저 입력하세요.',
      visual: 'clock-keypad',
      inputMode: 'clock-keypad',
      data: { hour, minute },
      answer,
      choices: [],
      strictChoices: true,
      explain: `시 입력은 ${hour}, 분 입력은 ${minute}입니다. 그래서 ${answer}입니다.`
    };
  };

  const makeClockAnalog24IntroQuestion = (stage) => {
    const p = stage.params;
    const teachingLessons = [
      {
        prompt: '오후 바늘 시계는 어떻게 읽을까요?',
        instruction: '바늘 시계가 2시를 가리키고 오후 시간이라면 2에 12를 더해 14:00으로 읽어요.',
        cards: [
          { type: 'analog', hour: 2, minute: 0, title: '오후 2시', text: '2에 12를 더해 14:00이에요.' }
        ]
      },
      {
        prompt: '분은 그대로 읽어요.',
        instruction: '오후 4시 20분은 시만 12를 더하고, 분 20은 그대로 두어 16:20으로 써요.',
        cards: [
          { type: 'analog', hour: 4, minute: 20, title: '오후 4시 20분', text: '4에 12를 더하고 분은 그대로라서 16:20이에요.' }
        ]
      },
      {
        prompt: '이제 24시간 표시를 골라요.',
        instruction: '왼쪽 바늘 시계를 오후 시간이라고 생각하고, 알맞은 24시간 표시를 선택해요.',
        cards: [
          { type: 'analog', hour: 5, minute: 45, title: '오후 5시 45분', text: '5에 12를 더해 17:45를 찾으면 돼요.' }
        ]
      }
    ];
    if (state.questionIndex < teachingLessons.length) {
      const lesson = teachingLessons[state.questionIndex];
      return {
        teaching: true,
        prompt: lesson.prompt,
        instruction: lesson.instruction,
        visual: 'clock-intro',
        data: {
          alt: lesson.prompt,
          cards: lesson.cards
        },
        explain: ''
      };
    }
    const questionOffset = state.questionIndex - teachingLessons.length;
    const rawHour = questionOffset === 0 ? 14 : pick(p.hours24);
    const minute = questionOffset === 0 ? 0 : pick(p.minutes);
    const hour = hour12From24(rawHour);
    const answer = formatDigital24(rawHour, minute);
    const pool = [];
    for (let i = 0; i < 8; i += 1) {
      pool.push(formatDigital24(clamp(rawHour + rand(-2, 2), 13, 23), pick(p.minutes)));
    }
    return {
      prompt: '오후 바늘 시계는 몇 시 몇 분인가요?',
      instruction: '오후 시간이라고 생각해요. 짧은 바늘의 시에 12를 더하고, 분은 그대로 읽어요.',
      visual: 'clock',
      data: { hour, minute, display: answer },
      answer,
      choices: uniqueChoices(answer, pool, 4),
      strictChoices: true,
      explain: `오후 ${hour}시 ${minute}분은 ${answer}입니다.`
    };
  };

  const makeClockQuestion = (stage) => {
    const p = stage.params;
    if (p.intro) return makeClockIntroQuestion();
    if (p.ask === 'periodIntro') return makeClockPeriodIntroQuestion(stage);
    if (p.ask === 'analogMinuteIntro') return makeClockMinuteIntroQuestion(stage);
    if (p.ask === 'clockKeypad') return makeClockKeypadQuestion(stage);
    if (p.ask === 'analog24') return makeClockAnalog24IntroQuestion(stage);
    const ask = p.ask === 'mixed' ? pick(['time', 'digital']) : p.ask;
    const routine = ask === 'routine' ? pick(routineMap) : null;
    const hour24 = Array.isArray(p.hours24) ? pick(p.hours24) : null;
    const rawHour = hour24 ?? (routine ? routine[1] : pick(p.hours));
    const hour = hour24 == null ? rawHour : hour12From24(rawHour);
    const minute = routine ? routine[2] : pick(p.minutes);
    const pool = [];
    let answer = formatTime(hour, minute);
    let prompt = routine ? `${routine[0]} 시각으로 알맞은 것은 무엇인가요?` : '시계가 가리키는 시각은 무엇인가요?';
    let instruction = p.visual === 'digital' ? '디지털 시계의 숫자를 왼쪽부터 차례대로 읽으세요.' : '짧은 바늘과 긴 바늘을 함께 확인하세요.';
    let visual = p.visual === 'digital' || p.visual === 'digital24' ? 'digital-clock' : 'clock';
    const data = {
      hour,
      minute,
      display: p.visual === 'digital24' ? formatDigital24(rawHour, minute) : formatDigital12(hour, minute)
    };
    if (ask === 'period') {
      const baseHour = pick(p.hours);
      const period = pick(['AM', 'PM']);
      const periodHour = period === 'PM' && baseHour !== 12 ? baseHour + 12 : (period === 'AM' && baseHour === 12 ? 0 : baseHour);
      answer = formatPeriodDigital(periodHour, minute);
      prompt = 'AM과 PM까지 함께 맞는 시간을 고르세요.';
      instruction = 'AM은 오전, PM은 오후를 뜻해요.';
      visual = 'digital-clock';
      data.hour = hour12From24(periodHour);
      data.minute = minute;
      data.period = periodCode(periodHour);
      data.display = formatDigital12(hour12From24(periodHour), minute);
      pool.push(
        `${period === 'AM' ? 'PM' : 'AM'} ${data.display}`,
        `${period} ${formatDigital12(clamp(data.hour + 1, 1, 12), minute)}`,
        `${period} ${formatDigital12(data.hour, pick([0, 30]))}`,
        `${period === 'AM' ? 'PM' : 'AM'} ${formatDigital12(clamp(data.hour + 1, 1, 12), minute)}`
      );
    } else if (ask === 'digital24') {
      answer = formatKoreanPeriodTime(rawHour, minute);
      prompt = `${formatDigital24(rawHour, minute)}은 하루 시간으로 언제인가요?`;
      instruction = '13시부터는 오후 시간으로 바꾸어 생각해요.';
      visual = 'digital-clock';
      data.hour = hour;
      data.display = formatDigital24(rawHour, minute);
      for (let i = 0; i < 8; i += 1) pool.push(formatKoreanPeriodTime(clamp(rawHour + rand(-2, 2), 13, 23), pick(p.minutes)));
    } else if (ask === 'analog24') {
      answer = formatDigital24(rawHour, minute);
      prompt = '바늘 시계를 보고 24시간 표시를 고르세요.';
      instruction = '오후 시간은 12를 더해 14:00처럼 나타낼 수 있어요.';
      visual = 'clock';
      data.hour = hour;
      data.display = answer;
      for (let i = 0; i < 8; i += 1) pool.push(formatDigital24(clamp(rawHour + rand(-2, 2), 13, 23), pick(p.minutes)));
    } else {
      for (let i = 0; i < 8; i += 1) pool.push(formatTime(clamp(hour + rand(-2, 2), 1, 12), pick(p.minutes)));
    }
    return {
      prompt,
      instruction,
      visual,
      data,
      answer,
      choices: uniqueChoices(answer, pool, 4),
      explain: `시계는 ${answer}을 가리킵니다.`
    };
  };

  const makeMeasureChoices = (answerValue, maxValue = 12) => {
    const answer = `${answerValue}칸`;
    const pool = Array.from({ length: Math.max(maxValue, answerValue + 4) + 1 }, (_, index) => `${index}칸`);
    return uniqueChoices(answer, pool, 4);
  };

  const getMeasureColor = (index = 0) => rulerColorSets[index % rulerColorSets.length];

  const makeMeasureItem = (value, colorIndex, options = {}) => {
    const tone = getMeasureColor(colorIndex);
    return {
      label: options.label || `${tone.name} 막대`,
      value,
      blockCount: options.blockCount ?? value,
      countable: Boolean(options.countable),
      paintable: Boolean(options.paintable),
      color: tone.color,
      edge: tone.edge,
      ink: tone.ink,
      colorName: tone.name
    };
  };

  const makeMeasurePair = (max, options = {}) => {
    const allowEqual = Boolean(options.allowEqual);
    const maxValue = clamp(Number(max) || 5, 2, 20);
    const leftValue = rand(2, maxValue);
    let rightValue = allowEqual && Math.random() < 0.34 ? leftValue : rand(2, maxValue);
    if (!allowEqual) {
      let guard = 0;
      while (rightValue === leftValue && guard < 20) {
        rightValue = rand(2, max);
        guard += 1;
      }
      if (rightValue === leftValue) rightValue = clamp(rightValue + 1, 2, max);
    }
    const colorStart = rand(0, rulerColorSets.length - 1);
    const resolveBlockCount = (value) => options.referenceBlocks === 'value' ? value : Number(options.referenceBlocks || 5);
    return [
      makeMeasureItem(leftValue, colorStart, { blockCount: resolveBlockCount(leftValue), countable: Boolean(options.countable) }),
      makeMeasureItem(rightValue, colorStart + 1, { blockCount: resolveBlockCount(rightValue), countable: Boolean(options.countable) })
    ];
  };

  const makeMeasureQuestionBase = ({ prompt, instruction, items, answer, choices, explain, operator = '', choiceStyle = '', preserveChoiceOrder = false }) => {
    const colorNames = rulerColorSets.map((item) => item.name);
    const hasColorChoice = [answer, ...(choices || [])].some((choice) => colorNames.includes(String(choice)));
    return {
      prompt,
      instruction,
      visual: 'measure',
      layoutMode: 'measure-choice',
      choiceStyle: choiceStyle || (hasColorChoice ? 'measure-color-box' : ''),
      data: {
        items,
        operator,
        questionText: prompt,
        instructionText: instruction
      },
      answer,
      choices,
      strictChoices: true,
      preserveChoiceOrder,
      explain
    };
  };

  const makeBlockMeasureIntroQuestion = () => {
    const blue = makeMeasureItem(2, 1, { blockCount: 5, countable: true, label: '파란색 블록' });
    const green = makeMeasureItem(3, 2, { blockCount: 5, countable: true, label: '초록색 블록' });
    const narrationBase = '../sound/number/number-measure-compare';
    const introScreens = [
      {
        prompt: '칸으로 길이를 확인해요.',
        instruction: '길다, 짧다를 눈으로만 보지 않고 칸의 개수로 바꾸어 생각해요. 같은 기준인 전체 5칸 안에서 파란색은 2칸, 초록색은 3칸을 차지하고 있어요.',
        questionText: '같은 5칸 안에서 길이를 비교해요.',
        instructionText: '색칠된 칸이 몇 개인지 하나씩 눌러 세어보세요.',
        narrationSrc: `${narrationBase}/block-measure-intro-01.mp3`,
        narrationText: '칸으로 길이를 확인해요. 길다, 짧다를 눈으로만 보지 않고 칸의 개수로 바꾸어 생각해요. 같은 기준인 전체 다섯 칸 안에서 파란색은 두 칸, 초록색은 세 칸을 차지하고 있어요.'
      },
      {
        prompt: '파란색 블록을 먼저 세어봐요.',
        instruction: '색칠된 파란색 칸을 손가락으로 콕콕 짚으며 하나, 둘 하고 세어보세요. 파란색 블록의 길이는 2칸이에요.',
        questionText: '파란색 블록은 몇 칸일까요?',
        instructionText: '파란색 칸 2개를 왼쪽부터 눌러보세요.',
        narrationSrc: `${narrationBase}/block-measure-intro-02.mp3`,
        narrationText: '파란색 블록을 먼저 세어봐요. 색칠된 파란색 칸을 손가락으로 콕콕 짚으며 하나, 둘 하고 세어보세요. 파란색 블록의 길이는 두 칸이에요.'
      },
      {
        prompt: '초록색 블록도 세어볼까요?',
        instruction: '이번에는 초록색 칸을 세어봐요. 하나, 둘, 셋. 초록색 블록의 길이는 3칸이에요.',
        questionText: '초록색 블록은 몇 칸일까요?',
        instructionText: '초록색 칸 3개를 왼쪽부터 눌러보세요.',
        narrationSrc: `${narrationBase}/block-measure-intro-03.mp3`,
        narrationText: '초록색 블록도 세어볼까요? 이번에는 초록색 칸을 세어봐요. 하나, 둘, 셋. 초록색 블록의 길이는 세 칸이에요.'
      },
      {
        prompt: '누가 더 짧을까요?',
        instruction: '숫자 2는 3보다 작은 숫자예요. 숫자가 작을수록 블록의 길이는 더 짧아요. 눈으로만 보지 말고 숫자로 칸을 세어보세요.',
        questionText: '2칸과 3칸을 비교해요.',
        instructionText: '칸의 개수가 더 작은 색이 더 짧아요.',
        narrationSrc: `${narrationBase}/block-measure-intro-04.mp3`,
        narrationText: '누가 더 짧을까요? 숫자 이는 삼보다 작은 숫자예요. 숫자가 작을수록 블록의 길이는 더 짧아요. 눈으로만 보지 말고 숫자로 칸을 세어보세요.'
      }
    ];
    const index = state.questionIndex || 0;
    if (index < introScreens.length) {
      const screen = introScreens[index];
      return {
        teaching: true,
        prompt: screen.prompt,
        instruction: screen.instruction,
        visual: 'measure',
        data: {
          items: [blue, green],
          questionText: screen.questionText,
          instructionText: screen.instructionText
        },
        narrationSrc: screen.narrationSrc,
        narrationText: screen.narrationText,
        explain: screen.prompt
      };
    }
    return makeMeasureQuestionBase({
      prompt: '더 짧은 블록의 색깔을 눌러보세요.',
      instruction: '어떤 블록이 더 짧은지 궁금할 때는 칸의 개수를 세어보는 것이 가장 정확해요.',
      items: [blue, green],
      answer: '파란색',
      choices: ['파란색', '초록색'],
      choiceStyle: 'measure-color-box',
      preserveChoiceOrder: true,
      explain: '파란색 블록은 2칸, 초록색 블록은 3칸입니다. 2는 3보다 작기 때문에 파란색 블록이 더 짧아요.'
    });
  };

  const makeMeasureQuestion = (stage) => {
    const p = stage.params;
    let ask = p.ask === 'mixed' ? pick(['longer', 'shorter', 'units', 'paintLength', 'difference', 'addLength', 'subtractLength', 'ruler', 'three']) : p.ask;
    if (ask === 'blockMeasureIntro') return makeBlockMeasureIntroQuestion();
    if (ask === 'compareBasic') ask = pick(['longer', 'shorter', 'mixedEqual']);
    if (ask === 'units' || ask === 'ruler') {
      const value = rand(2, p.max);
      const prompt = ask === 'ruler' ? '막대 끝은 몇 칸 위치인가요?' : '막대 길이는 몇 칸인가요?';
      return makeMeasureQuestionBase({
        prompt,
        instruction: '네모 블록을 왼쪽부터 하나씩 눌러 세어보세요.',
        items: [makeMeasureItem(value, rand(0, rulerColorSets.length - 1), { blockCount: value, countable: true, label: '세기 막대' })],
        answer: `${value}칸`,
        choices: makeMeasureChoices(value, p.max),
        explain: `길이는 ${value}칸입니다.`
      });
    }
    if (ask === 'paintLength') {
      const target = rand(2, p.max);
      const colorStart = rand(0, rulerColorSets.length - 1);
      const item = makeMeasureItem(target, colorStart, { blockCount: p.max, paintable: true, label: `${target}칸 만들기` });
      return {
        prompt: `${target}칸만큼 막대를 칠해보세요.`,
        instruction: '왼쪽부터 한 칸씩 눌러 막대를 완성하세요.',
        visual: 'measure',
        inputMode: 'measure-paint',
        layoutMode: 'measure-paint',
        data: {
          items: [item],
          targetValue: target,
          questionText: `${target}칸만큼 막대를 칠해보세요.`,
          instructionText: '왼쪽부터 한 칸씩 눌러 막대를 완성하세요.'
        },
        answer: `${target}칸`,
        choices: [],
        explain: `${target}칸을 왼쪽부터 정확히 칠했습니다.`
      };
    }
    if (ask === 'difference') {
      const [left, right] = makeMeasurePair(p.max, { referenceBlocks: 'value', countable: true });
      const answer = Math.abs(left.value - right.value);
      return makeMeasureQuestionBase({
        prompt: '두 막대의 길이 차이는 몇 칸인가요?',
        instruction: '두 색 막대의 길이를 비교해서 차이를 고르세요.',
        items: [left, right],
        answer: `${answer}칸`,
        choices: makeMeasureChoices(answer, p.max),
        explain: `차이는 ${answer}칸입니다.`
      });
    }
    if (ask === 'addLength') {
      const leftValue = rand(2, Math.max(3, Math.floor(p.max / 2)));
      const rightValue = rand(2, Math.max(3, p.max - leftValue));
      const colorStart = rand(0, rulerColorSets.length - 1);
      const left = makeMeasureItem(leftValue, colorStart, { blockCount: leftValue, countable: true });
      const right = makeMeasureItem(rightValue, colorStart + 1, { blockCount: rightValue, countable: true });
      const answer = leftValue + rightValue;
      return makeMeasureQuestionBase({
        prompt: '두 막대를 이어 붙이면 모두 몇 칸인가요?',
        instruction: '각 막대의 네모를 하나씩 눌러 세고, 두 길이를 합쳐보세요.',
        items: [left, right],
        operator: '+',
        answer: `${answer}칸`,
        choices: makeMeasureChoices(answer, p.max + 4),
        explain: `${leftValue}칸과 ${rightValue}칸을 합치면 ${answer}칸입니다.`
      });
    }
    if (ask === 'subtractLength') {
      const shortValue = rand(2, Math.max(3, Math.floor(p.max / 2)));
      const longValue = rand(shortValue + 1, p.max);
      const colorStart = rand(0, rulerColorSets.length - 1);
      const longItem = makeMeasureItem(longValue, colorStart, { blockCount: longValue, countable: true, label: `${getMeasureColor(colorStart).name} 긴 막대` });
      const shortItem = makeMeasureItem(shortValue, colorStart + 1, { blockCount: shortValue, countable: true, label: `${getMeasureColor(colorStart + 1).name} 빼는 막대` });
      const answer = longValue - shortValue;
      return makeMeasureQuestionBase({
        prompt: '긴 막대에서 짧은 막대를 빼면 몇 칸 남나요?',
        instruction: '긴 막대와 짧은 막대를 각각 세고, 남는 길이를 고르세요.',
        items: [longItem, shortItem],
        operator: '-',
        answer: `${answer}칸`,
        choices: makeMeasureChoices(answer, p.max),
        explain: `${longValue}칸에서 ${shortValue}칸을 빼면 ${answer}칸입니다.`
      });
    }
    if (ask === 'three') {
      const colorStart = rand(0, rulerColorSets.length - 1);
      const items = [0, 1, 2].map((offset) => makeMeasureItem(rand(2, 5), colorStart + offset, { blockCount: 5 }));
      const max = Math.max(...items.map((item) => item.value));
      const answer = items.find((item) => item.value === max).colorName;
      return makeMeasureQuestionBase({
        prompt: '가장 긴 막대 색상은 무엇인가요?',
        instruction: '세 막대는 모두 5칸 블록 위에 있어요. 막대 길이만 비교하세요.',
        items,
        answer,
        choices: items.map((item) => item.colorName),
        explain: `${answer} 막대가 가장 깁니다.`
      });
    }
    const [left, right] = makeMeasurePair(5, { allowEqual: ask === 'mixedEqual', referenceBlocks: 5 });
    const isEqual = left.value === right.value;
    const answer = isEqual
      ? '같아요'
      : ask === 'shorter'
      ? (left.value < right.value ? left.colorName : right.colorName)
      : (left.value > right.value ? left.colorName : right.colorName);
    const prompt = ask === 'shorter' ? '더 짧은 막대 색상은 무엇인가요?' : '더 긴 막대 색상은 무엇인가요?';
    return makeMeasureQuestionBase({
      prompt,
      instruction: '왼쪽과 오른쪽 블록은 모두 5칸입니다. 색 막대의 실제 길이를 비교하세요.',
      items: [left, right],
      answer,
      choices: [left.colorName, right.colorName, '같아요'],
      explain: `${left.colorName} 막대는 ${left.value}칸, ${right.colorName} 막대는 ${right.value}칸입니다.`
    });
  };

  const makeFractionCircleChoices = (answerDen) => {
    const dens = [2, 3, 4, 5];
    const choices = dens.map(shareLabel);
    const choiceVisuals = dens.reduce((map, den) => {
      const label = shareLabel(den);
      map[label] = `
        <span class="na-choice-circle">${fractionSvg(1, den, 'circle')}</span>
        <span class="na-choice-caption">${den}조각</span>`;
      return map;
    }, {});
    return {
      answer: shareLabel(answerDen),
      choices,
      choiceVisuals,
      strictChoices: true
    };
  };

  const fractionPieceLabel = (den) => den === 1 ? '1개' : `${den}조각`;
  const makeFractionChoiceVisuals = (items) => items.reduce((map, item) => {
    map[item.label] = `
      <span class="na-fraction-image-choice">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.label)}">
      </span>`;
    return map;
  }, {});

  const makeFractionLessonQuestion = (stage, localIndex) => {
    const lessons = [
      {
        title: '롤케익 1개',
        text: '아직 자르지 않은 전체예요.',
        image: 'images/etc/roll-cake-1.webp'
      },
      {
        title: '반으로 나누면 2조각',
        text: '가운데를 한 번 자르면 같은 크기 2조각이 돼요.',
        image: 'images/etc/roll-cake-2.webp'
      },
      {
        title: '3개로 나누면 3조각',
        text: '같은 크기로 세 부분을 만들면 3조각이에요.',
        image: 'images/etc/roll-cake-3.webp'
      }
    ];
    const lesson = lessons[localIndex % lessons.length];
    return {
      teaching: true,
      prompt: '',
      instruction: '',
      visual: 'fraction-split-lesson',
      layoutMode: 'fraction-lesson',
      data: {
        ...lesson,
        alt: lesson.title
      },
      explain: lesson.text
    };
  };

  const makeFractionCountQuestion = (stage, localIndex) => {
    const target = fractionImageItems[localIndex % fractionImageItems.length];
    const answer = fractionPieceLabel(target.den);
    const denPool = [1, 2, 3, 4, 6];
    return {
      prompt: '몇 조각인가요?',
      instruction: '',
      visual: 'fraction-single-image',
      layoutMode: 'fraction-count',
      data: {
        image: target.image,
        label: target.label
      },
      answer,
      choices: uniqueChoices(answer, denPool.map(fractionPieceLabel), 4),
      strictChoices: true,
      explain: `${answer}입니다.`
    };
  };

  const makeFractionImageQuestion = (stage, localIndex) => {
    const params = stage.params || {};
    const targetPool = Array.isArray(params.dens)
      ? fractionImageItems.filter((item) => params.dens.includes(item.den))
      : fractionImageItems;
    const pool = targetPool.length ? targetPool : fractionImageItems;
    const target = pool[localIndex % pool.length];
    const distractors = shuffle([1, 2, 3, 4, 6]
      .filter((den) => den !== target.den)
      .map((den) => pick(fractionImageItems.filter((item) => item.den === den)))
      .filter(Boolean));
    const items = shuffle([target, ...distractors.slice(0, 3)]);
    const targetLabel = fractionPieceLabel(target.den);
    return {
      prompt: '알맞은 그림을 클릭하세요.',
      instruction: '',
      visual: 'fraction-number-target',
      layoutMode: 'fraction-find',
      data: {
        targetLabel
      },
      answer: target.label,
      choices: items.map((item) => item.label),
      choiceVisuals: makeFractionChoiceVisuals(items),
      strictChoices: true,
      explain: `${targetLabel} 그림입니다.`
    };
  };

  const makeFractionQuestion = (stage) => {
    const p = stage.params;
    const questionIndex = state.questionIndex || 0;
    const lessonOffset = p.lesson ? 1 : 0;
    if (p.ask === 'splitLesson') {
      return makeFractionLessonQuestion(stage, questionIndex);
    }
    if (p.ask === 'countFromImage') {
      return makeFractionCountQuestion(stage, questionIndex);
    }
    if (p.ask === 'findByNumber') {
      return makeFractionImageQuestion(stage, questionIndex);
    }
    if (p.lesson && questionIndex === 0) {
      return {
        teaching: true,
        prompt: '먼저 생각해 볼까요?',
        instruction: '같이 먹을 때는 한 친구가 더 많이 가지지 않도록 같은 크기로 나누어요.',
        visual: 'share-lesson',
        explain: '똑같이 나누면 친구들이 같은 만큼 받을 수 있어요.'
      };
    }

    const localIndex = Math.max(0, questionIndex - lessonOffset);
    const denPool = p.ask === 'people' ? [2, 3, 4] : [p.den || 2];
    const den = denPool[localIndex % denPool.length];
    const food = pick(shareFoodNames[den] || ['간식']);
    const useSymbolChoice = localIndex % 2 === 1;

    if (useSymbolChoice) {
      const circleChoices = makeFractionCircleChoices(den);
      return {
        prompt: '왼쪽 분수 모양을 고르세요.',
        instruction: `${food} 하나를 친구 ${den}명이 똑같이 나누면 한 친구가 한 조각씩 가져요.`,
        visual: 'share-symbol',
        data: { den, label: `${den}명에게 한 조각씩` },
        explain: `${den}명이 똑같이 나누려면 같은 크기 ${den}조각이 필요해요.`,
        ...circleChoices
      };
    }

    if (p.ask === 'fair') {
      const isFair = localIndex % 4 !== 2;
      return {
        prompt: '친구들이 공평하게 받을 수 있나요?',
        instruction: '조각의 크기가 모두 같은지 보세요.',
        visual: isFair ? 'share-scene' : 'share-unequal',
        data: isFair ? { den, food } : {},
        answer: isFair ? '공평해요' : '크기가 달라요',
        choices: ['공평해요', '크기가 달라요'],
        strictChoices: true,
        explain: isFair ? '조각 수와 친구 수가 맞고 크기도 같아요.' : '조각 크기가 다르면 친구들이 같은 만큼 받을 수 없어요.'
      };
    }

    if (p.ask === 'people') {
      return {
        prompt: `${food}를 똑같이 나누면 친구 몇 명이 먹을 수 있나요?`,
        instruction: '같은 크기 조각이 몇 개인지 세어 보세요.',
        visual: 'share-scene',
        data: { den, food },
        answer: peopleLabel(den),
        choices: [peopleLabel(2), peopleLabel(3), peopleLabel(4), peopleLabel(5)],
        strictChoices: true,
        explain: `같은 크기 ${den}조각이므로 친구 ${den}명이 한 조각씩 먹을 수 있어요.`
      };
    }

    return {
      prompt: `친구 ${den}명이 똑같이 나누려면 어떻게 해야 할까요?`,
      instruction: `${food} 하나를 친구 수만큼 같은 크기로 나누어요.`,
      visual: 'share-scene',
      data: { den, food },
      answer: shareLabel(den),
      choices: [shareLabel(2), shareLabel(3), shareLabel(4), shareLabel(5)],
      strictChoices: true,
      explain: `친구 ${den}명이 한 조각씩 가지려면 같은 크기 ${den}조각으로 나누면 돼요.`
    };
  };

  const makeRulerStudyQuestion = (stage) => {
    const p = stage.params;
    const ask = p.ask === 'mixed'
      ? pick(['blocks', 'rulerCm', 'objectCm', 'halfCm', 'halfObject', 'stickCm', 'compareLength'])
      : p.ask === 'reviewCm'
      ? pick(['rulerCm', 'halfCm', 'halfObject', 'tenthCm', 'tenthObject', 'realMeasureRead'])
      : p.ask;
    const count = clamp(Number(p.rulerCount || (ask === 'compareLength' ? 3 : 1)), ask === 'compareLength' ? 2 : 1, 4);
    const min = Number(p.min || 2);
    const max = Number(p.max || 10);
    const colors = rulerColorSets.slice(0, count);
    const formatCm = (value) => `${Number.isInteger(value) ? value : value.toFixed(1)}cm`;
    const makeLengthChoices = (answerValue, suffix = 'cm', step = 1, maxChoiceValue = 10) => {
      const base = Number(answerValue);
      const minValue = suffix === 'cm' ? step : 1;
      const deltas = [1, -1, 2, -2, 3, -3, 4].map((value) => value * step);
      const pool = deltas
        .map((delta) => Math.round((base + delta) * 10) / 10)
        .filter((value) => value >= minValue && (suffix !== 'cm' || value <= maxChoiceValue))
        .map((value) => suffix === 'cm' ? formatCm(value) : `${value}칸`);
      return uniqueChoices(suffix === 'cm' ? formatCm(answerValue) : `${answerValue}칸`, pool, 4);
    };
    const makeWindow = (value, span = 14) => {
      const start = Math.max(0, Math.floor(value - 13));
      return { start, end: start + span };
    };
    const readHint = (label) => `읽기: ${label}는 "${readLengthKorean(label)}"라고 읽어요.`;
    const peopleMeasureExamples = realMeasureExamples.filter((item) => item.group === 'people');
    const animalMeasureExamples = realMeasureExamples.filter((item) => !item.group && ['기린', '코끼리', '얼룩말', '앵무새'].includes(item.name));
    const otherMeasureExamples = realMeasureExamples.filter((item) => !item.group && !['기린', '코끼리', '얼룩말', '앵무새'].includes(item.name));
    const makeSingleMeasureLesson = (item) => ({
      prompt: `${item.name} 길이를 읽어보세요.`,
      instruction: item.direction === 'horizontal'
        ? '왼쪽 끝부터 오른쪽 끝까지 줄자를 놓고 길이를 읽어요.'
        : '발밑이나 바닥부터 위쪽 끝까지 줄자를 놓고 길이를 읽어요.',
      visual: 'real-measure-study',
      data: { item, note: `${item.note}\n${readHint(item.label)}` },
      explain: `${item.name} 길이는 약 ${item.label}입니다. ${readHint(item.label)}`
    });
    const meterLessons = [
      ...peopleMeasureExamples.map(makeSingleMeasureLesson),
      {
        prompt: '가족 키를 함께 비교해보세요.',
        instruction: '네 사람의 키를 한 화면에서 비교하며 cm 읽는 법을 확인해요.',
        visual: 'real-measure-study',
        data: {
          items: peopleMeasureExamples,
          scaleMaxCm: 200,
          note: `아빠 180cm, 엄마 160cm, 딸 150cm, 아들 100cm예요.\n${readHint('180cm')}`
        },
        explain: `사람 키도 cm로 읽습니다. ${readHint('180cm')}`
      },
      ...animalMeasureExamples.map(makeSingleMeasureLesson),
      {
        prompt: '동물 길이를 함께 비교해보세요.',
        instruction: '동물 네 가지를 한 화면에서 보며 큰 길이는 m로 읽어요.',
        visual: 'real-measure-study',
        data: {
          items: animalMeasureExamples,
          scaleMaxCm: 540,
          note: `기린 5m, 코끼리 3m 50cm, 얼룩말 160cm, 앵무새 30cm예요.\n${readHint('5m')}`
        },
        explain: `큰 동물 길이는 m와 cm로 읽습니다. ${readHint('3m 50cm')}`
      },
      ...otherMeasureExamples.map(makeSingleMeasureLesson)
    ];
    const meterChoiceQuestions = [
      { prompt: '100cm는 몇 m인가요?', instruction: 'cm는 센티미터, m는 미터라고 읽어요.', answer: '1m', choices: ['1m', '10m', '100m', '0.1m'], from: '100cm', to: '?' },
      { prompt: '200cm는 몇 m인가요?', instruction: '100cm는 "백 센티미터", 1m는 "일 미터"라고 읽어요.', answer: '2m', choices: ['1m', '2m', '20m', '200m'], from: '200cm', to: '?' },
      { prompt: '150cm는 몇 m인가요?', instruction: '150cm는 "백오십 센티미터", 1.5m는 "일 점 오 미터"라고 읽어요.', answer: '1.5m', choices: ['1.5m', '15m', '150m', '0.5m'], from: '150cm', to: '?' }
    ];
    const metricPracticeProblems = [
      { prompt: '100cm는 몇 m인가요?', answer: '1m', from: '100cm', choices: ['1m', '10m', '100m', '0.1m'] },
      { prompt: '200cm는 몇 m인가요?', answer: '2m', from: '200cm', choices: ['1m', '2m', '20m', '200m'] },
      { prompt: '150cm는 몇 m인가요?', answer: '1.5m', from: '150cm', choices: ['1.5m', '15m', '150m', '0.5m'] },
      { prompt: '1m40cm는 몇 cm인가요?', answer: '140cm', from: '1m 40cm', choices: ['140cm', '104cm', '40cm', '1.4cm'] },
      { prompt: '1m20cm는 몇 cm인가요?', answer: '120cm', from: '1m 20cm', choices: ['120cm', '102cm', '20cm', '12cm'] },
      { prompt: '1m65cm는 몇 cm인가요?', answer: '165cm', from: '1m 65cm', choices: ['165cm', '156cm', '65cm', '1.65cm'] },
      { prompt: '1m80cm는 몇 cm인가요?', answer: '180cm', from: '1m 80cm', choices: ['180cm', '108cm', '80cm', '18cm'] },
      { prompt: '4m는 몇 cm인가요?', answer: '400cm', from: '4m', choices: ['400cm', '40cm', '4cm', '100cm'] }
    ];
    const makeValues = (size = count, step = 1) => {
      const values = [];
      const multiplier = Math.round(1 / step);
      let guard = 0;
      while (values.length < size && guard < 160) {
        guard += 1;
        const value = step === 1 ? rand(min, max) : rand(Math.ceil(min * multiplier), Math.floor(max * multiplier)) / multiplier;
        if (!values.includes(value)) values.push(value);
      }
      while (values.length < size) values.push(min + values.length * step);
      return values;
    };
    const values = makeValues(count);
    const targetIndex = rand(0, count - 1);

    if (ask === 'meterIntro') {
      const index = state.questionIndex || 0;
      if (index < meterLessons.length) {
        const lesson = meterLessons[index];
        return {
          teaching: true,
          prompt: lesson.prompt,
          instruction: lesson.instruction,
          visual: lesson.visual,
          data: lesson.data,
          explain: lesson.prompt
        };
      }
      const item = meterChoiceQuestions[(index - meterLessons.length) % meterChoiceQuestions.length];
      return {
        prompt: item.prompt,
        instruction: item.instruction,
        visual: 'metric-conversion',
        data: { from: item.from, to: '?', note: 'cm와 m 관계를 보고 고르세요.' },
        answer: item.answer,
        choices: item.choices,
        strictChoices: true,
        explain: `${item.from}는 ${item.answer}입니다. ${readHint(item.from)} ${readHint(item.answer)}`
      };
    }

    if (ask === 'realMeasureRead') {
      const item = pick(realMeasureExamples);
      const pool = realMeasureExamples
        .filter((example) => example.direction === item.direction)
        .map((example) => example.label);
      return {
        prompt: `${item.name} 길이는 얼마인가요?`,
        instruction: item.direction === 'horizontal' ? '그림 아래 줄자 길이를 읽어보세요.' : '그림 옆 줄자 길이를 읽어보세요.',
        visual: 'real-measure-study',
        data: { item, note: item.direction === 'horizontal' ? '왼쪽 끝부터 오른쪽 끝까지 재요.' : '바닥부터 위쪽 끝까지 재요.' },
        answer: item.label,
        choices: uniqueChoices(item.label, pool, 4),
        strictChoices: true,
        explain: `${item.name} 길이는 약 ${item.label}입니다. ${readHint(item.label)}`
      };
    }

    if (ask === 'meterKeypad') {
      const item = metricPracticeProblems[(state.questionIndex || 0) % metricPracticeProblems.length];
      return {
        prompt: item.prompt,
        instruction: '',
        visual: 'metric-conversion',
        layoutMode: 'metric-choice',
        data: {
          from: item.from,
          to: '?'
        },
        answer: item.answer,
        choices: item.choices,
        strictChoices: true,
        explain: `${item.from}는 ${item.answer}입니다. ${readHint(item.from)} ${readHint(item.answer)}`
      };
    }

    if (ask === 'blocks') {
      const blockValues = makeValues(1);
      const rows = colors.map((color, index) => ({
        ...color,
        value: blockValues[index],
        highlight: index === targetIndex
      }));
      const target = rows[0];
      return {
        prompt: '네모는 몇 칸인가요?',
        instruction: '자 사용 전에 같은 크기의 네모 칸을 먼저 세어보세요.',
        visual: 'ruler-study',
        data: { mode: 'blocks', rulers: rows, note: '네모 한 칸씩 왼쪽부터 세어요.' },
        answer: `${target.value}칸`,
        choices: makeLengthChoices(target.value, '칸'),
        strictChoices: true,
        explain: `${target.name} 네모는 ${target.value}칸입니다.`
      };
    }

    const makeSingleRuler = (value, options = {}) => ({
      ...pick(colors),
      value,
      scaleMax: options.scaleMax || value,
      startValue: options.startValue,
      endValue: options.endValue,
      displayPercent: options.displayPercent || 100,
      measureValue: options.measureValue,
      object: options.object,
      halfLabels: options.halfLabels,
      highlight: true
    });

    if (ask === 'twoDigitCm') {
      const value = rand(min, max);
      const range = makeWindow(value, 14);
      return {
        prompt: '표시선은 몇 cm인가요?',
        instruction: '자 전체가 0부터 시작하지 않아도, 표시선이 닿은 숫자를 읽으면 됩니다.',
        visual: 'ruler-study',
        data: {
          rulers: [makeSingleRuler(value, { startValue: range.start, endValue: range.end, scaleMax: range.end, measureValue: value })],
          note: `${range.start}cm부터 ${range.end}cm까지 보이는 긴 자예요. cm는 센티미터라고 읽어요.`
        },
        answer: formatCm(value),
        choices: makeLengthChoices(value, 'cm', 1, 100),
        strictChoices: true,
        explain: `표시선은 ${formatCm(value)}에 있습니다. ${readHint(formatCm(value))}`
      };
    }

    if (ask === 'rulerCm' || ask === 'halfCm' || ask === 'tenthCm') {
      const step = ask === 'tenthCm' ? 0.1 : ask === 'halfCm' ? 0.5 : 1;
      const multiplier = Math.round(1 / step);
      const value = step === 1 ? rand(min, max) : rand(Math.ceil(min * multiplier), Math.floor(max * multiplier)) / multiplier;
      return {
        prompt: ask === 'tenthCm' ? '표시선은 몇 cm인가요?' : '현재 자는 몇 cm인가요?',
        instruction: ask === 'tenthCm' ? '작은 눈금 한 칸은 0.1cm입니다.' : ask === 'halfCm' ? '0.5, 1, 1.5처럼 반 칸 눈금까지 읽어요.' : '자 안의 숫자를 보고 끝나는 cm를 고르세요.',
        visual: 'ruler-study',
        data: { rulers: [makeSingleRuler(ask === 'tenthCm' ? 10 : value, { scaleMax: ask === 'tenthCm' ? 10 : value, measureValue: ask === 'tenthCm' ? value : undefined, halfLabels: ask === 'halfCm' })], note: ask === 'tenthCm' ? '0과 1 사이에는 작은 눈금이 10개 있어요. cm는 센티미터라고 읽어요.' : '숫자는 자 안에서 읽어요. cm는 센티미터라고 읽어요.' },
        answer: formatCm(value),
        choices: makeLengthChoices(value, 'cm', step),
        strictChoices: true,
        explain: ask === 'tenthCm' ? `표시선은 ${formatCm(value)}에 있습니다. ${readHint(formatCm(value))}` : `이 자는 ${formatCm(value)}까지 표시되어 있습니다. ${readHint(formatCm(value))}`
      };
    }

    if (ask === 'objectCm' || ask === 'halfObject' || ask === 'tenthObject' || ask === 'stickCm') {
      const step = ask === 'tenthObject' ? 0.1 : ask === 'halfObject' ? 0.5 : 1;
      const multiplier = Math.round(1 / step);
      const measureValue = step === 1 ? rand(min, max) : rand(Math.ceil(min * multiplier), Math.floor(max * multiplier)) / multiplier;
      const allowedKinds = p.objectKinds || (p.ask === 'reviewCm' && (ask === 'halfObject' || ask === 'tenthObject') ? ['paper'] : null);
      const objectPool = rulerMeasureObjects.filter((item) => {
        const groupOk = !p.objectGroup || item.group === p.objectGroup;
        const kindOk = !allowedKinds || allowedKinds.includes(item.kind);
        return groupOk && kindOk;
      });
      const object = ask === 'stickCm' ? null : pick(objectPool.length ? objectPool : rulerMeasureObjects);
      const ruler = makeSingleRuler(10, {
        scaleMax: 10,
        measureValue,
        object,
        halfLabels: ask === 'halfObject'
      });
      return {
        prompt: object ? `${topicText(object.name)} 몇 cm인가요?` : '막대는 몇 cm인가요?',
        instruction: ask === 'tenthObject' ? '물체 끝이 닿는 작은 눈금을 0.1cm 단위로 읽어보세요.' : object ? '물체의 오른쪽 끝이 닿는 눈금을 읽어보세요.' : '색 막대의 오른쪽 끝이 닿는 눈금을 읽어보세요.',
        visual: 'ruler-study',
        data: { rulers: [ruler], note: object ? '물체는 0cm에서 시작해요.' : '막대의 끝점이 길이를 알려줘요.' },
        answer: formatCm(measureValue),
        choices: makeLengthChoices(measureValue, 'cm', step),
        strictChoices: true,
        explain: `${object ? topicText(object.name) : '막대는'} 끝이 ${formatCm(measureValue)} 눈금에 닿았습니다. ${readHint(formatCm(measureValue))}`
      };
    }

    if (ask === 'compareLength') {
      const compareValues = makeValues(count);
      const displayMax = Math.max(...compareValues);
      const rulers = colors.map((color, index) => ({
        ...color,
        value: compareValues[index],
        scaleMax: compareValues[index],
        displayPercent: clamp((compareValues[index] / displayMax) * 100, 38, 100),
        halfLabels: false
      }));
      const useLong = Math.random() < 0.5;
      const target = useLong ? Math.max(...compareValues) : Math.min(...compareValues);
      const answer = rulers[compareValues.indexOf(target)].name;
      return {
        prompt: useLong ? '가장 긴 자는 어떤 색인가요?' : '가장 짧은 자는 어떤 색인가요?',
        instruction: '자 끝 위치를 서로 비교하세요.',
        visual: 'ruler-study',
        data: { rulers: rulers.map((item) => ({ ...item, highlight: item.name === answer })), note: '비교 문제는 이 단계에서만 연습해요.' },
        answer,
        choices: colors.map((item) => item.name),
        strictChoices: true,
        explain: `${answer} 자가 ${useLong ? '가장 깁니다' : '가장 짧습니다'}.`
      };
    }

    const displayMax = Math.max(...values);
    const rulers = colors.map((color, index) => ({
      ...color,
      value: values[index],
      scaleMax: values[index],
      displayPercent: clamp((values[index] / displayMax) * 100, 45, 100),
      halfLabels: false,
      highlight: index === targetIndex
    }));
    const target = rulers[targetIndex];
    return {
      prompt: `${target.name} 자는 몇 cm인가요?`,
      instruction: '색 이름은 문제에서만 확인하고, 화면에서는 자의 길이를 읽으세요.',
      visual: 'ruler-study',
      data: { rulers, note: '색깔 이름은 자 옆에 쓰지 않고 색으로만 구분해요.' },
      answer: formatCm(target.value),
      choices: makeLengthChoices(target.value, 'cm'),
      strictChoices: true,
      explain: `${target.name} 자는 ${formatCm(target.value)}입니다.`
    };
  };

  const estimateTeachingNarrations = {
    meaningTeachingOnly: [
      {
        text: '어림은 정확하지 않은 가짜 수가 아니라 빠르게 판단을 돕는 영리한 수예요. 피자를 주문하기 전, 친구 수와 조각 수를 보고 몇 판쯤 필요할지 먼저 생각해요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-01.mp3'
      },
      {
        text: '장을 볼 때 물건값을 하나씩 전부 더하기 전에, 대략 얼마쯤 필요할지 생각하면 빠르게 결정할 수 있어요. 이때 약, 대략, 쯤이라는 말을 자주 써요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-02.mp3'
      },
      {
        text: '모두 배를 타야 하는 상황에서는 모자라면 안 돼요. 조금 남는 사람이 있어도 배를 한 척 더 준비해야 하므로 올림을 사용해요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-03.mp3'
      },
      {
        text: '동전이나 지폐처럼 완성된 단위만 인정하는 상황도 있어요. 100원이 안 되는 남은 돈은 아직 한 묶음이 아니므로 버림으로 생각해요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-04.mp3'
      },
      {
        text: '학교 인원처럼 큰 수는 정확한 수보다 가까운 백 단위로 말하면 이해하기 쉬워요. 어느 기준 수에 더 가까운지 보는 것이 반올림이에요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-05.mp3'
      }
    ],
    roundingTeachingOnly: [
      {
        text: '올림은 모자라면 안 되는 상황에서 써요. 피자가 조금 부족하면 모두 먹을 수 없으니, 남는 조각이 있더라도 한 판 더 주문해요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-06.mp3'
      },
      {
        text: '배에 사람을 태울 때도 올림이 필요해요. 열 명씩 타는 배에 서른한 명이 있다면 세 척으로는 한 명이 남으니 네 척이 필요해요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-07.mp3'
      },
      {
        text: '버림은 완성된 것만 인정하는 방법이에요. 100원 묶음이 되지 않는 남은 동전은 바꿀 수 없으니, 꽉 찬 묶음만 세어요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-08.mp3'
      },
      {
        text: '인형 뽑기처럼 1000원짜리 지폐로 준비할 때는 완성된 1000원 단위만 봐요. 남은 100원 단위는 빼고 생각하는 것이 버림이에요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-09.mp3'
      },
      {
        text: '반올림은 가까운 곳으로 말하는 방법이에요. 기준 아래 숫자가 4 이하면 낮은 쪽, 5 이상이면 높은 쪽으로 생각해요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-10.mp3'
      },
      {
        text: '상황에 따라 어림 방법은 달라져요. 부족하면 안 되면 올림, 완성된 것만 보면 버림, 가까운 수로 말하면 반올림을 선택해요.',
        src: '../sound/number/estimate-jar/number-estimate-jar-teach-11.mp3'
      }
    ]
  };

  const makeEstimateLesson = ({ prompt, instruction, image, items, narrationText, narrationSrc }) => ({
    teaching: true,
    prompt,
    instruction,
    visual: 'estimate-lesson',
    data: { image, items },
    narrationText: narrationText || [prompt, instruction, ...(items || []).flatMap((item) => [item.title, item.text])]
      .filter(Boolean)
      .join(' '),
    narrationSrc,
    explain: ''
  });

  const estimateStageIndex = (length) => {
    const order = Array.isArray(state.stageQuestionOrder) ? state.stageQuestionOrder : [];
    const raw = Number.isFinite(order[state.questionIndex]) ? order[state.questionIndex] : state.questionIndex;
    return raw % Math.max(1, length);
  };

  const makeEstimateConceptQuestion = (stage) => {
    const ask = stage.params.ask;
    const meaningTeaching = [
      makeEstimateLesson({
        prompt: '어림은 무엇일까요?',
        instruction: '정확하지 않은 가짜 수가 아니라, 상황을 빠르게 판단하게 도와주는 영리한 수예요.',
        image: estimateSceneImages.pizza,
        items: [
          { badge: '어림', title: '대강 짐작하기', text: '하나하나 끝까지 세지 않아도 전체 크기를 빠르게 봐요.' },
          { badge: '생활', title: '먼저 생각하기', text: '피자가 몇 판쯤 필요할지 미리 예상할 때 도움이 돼요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '어림은 언제 쓸까요?',
        instruction: '빠른 판단이 필요하거나 정확한 값이 꼭 필요하지 않을 때 사용해요.',
        image: estimateSceneImages.market,
        items: [
          { badge: '장보기', title: '돈이 충분할까?', text: '물건값을 하나씩 정확히 더하기 전에 대략 필요한 돈을 생각해요.' },
          { badge: '약', title: '약, 대략, 쯤', text: '어림수를 말할 때 자주 쓰는 표현이에요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '필요한 양을 예상해요',
        instruction: '모자라면 안 되는 상황에서는 조금 넉넉하게 생각해야 해요.',
        image: estimateSceneImages.boat,
        items: [
          { badge: '배', title: '모두 타야 해요', text: '사람이 한 명이라도 남으면 배가 한 척 더 필요해요.' },
          { badge: '올림', title: '부족하지 않게', text: '남는 수가 있으면 다음 묶음까지 준비해요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '완성된 것만 볼 때도 있어요',
        instruction: '동전이나 지폐처럼 완성된 단위만 인정할 때는 남는 부분을 빼고 생각해요.',
        image: estimateSceneImages.coin,
        items: [
          { badge: '버림', title: '완성된 묶음만', text: '100원이 안 되는 남은 동전은 아직 완성된 묶음이 아니에요.' },
          { badge: '단위', title: '기준을 정해요', text: '10, 100, 1000처럼 기준 단위를 먼저 확인해요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '가까운 수로 말해요',
        instruction: '학교 인원처럼 많은 수는 가까운 백 단위로 말하면 이해하기 쉬워요.',
        image: estimateSceneImages.school,
        items: [
          { badge: '반올림', title: '가까운 곳으로', text: '어느 기준 수에 더 가까운지 보고 말해요.' },
          { badge: '예', title: '약 1,200명', text: '정확한 인원 대신 듣기 쉬운 어림수로 표현해요.' }
        ]
      })
    ];
    const roundingTeaching = [
      makeEstimateLesson({
        prompt: '올림: 모자라면 안 돼',
        instruction: '남는 것이 하나라도 있으면 다음 묶음까지 준비해요.',
        image: estimateSceneImages.pizza,
        items: [
          { badge: '올림', title: '피자는 부족하면 안 돼요', text: '조각이 남더라도 한 판 더 주문해야 모두 먹을 수 있어요.' },
          { badge: '핵심', title: '남으면 하나 더', text: '나누고 남는 수가 있으면 답을 올려요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '올림은 배에도 필요해요',
        instruction: '사람이 모두 타야 하므로 남는 사람이 있으면 배가 더 필요해요.',
        image: estimateSceneImages.boat,
        items: [
          { badge: '상황', title: '모두 태우기', text: '10명씩 타는 배에 31명이면 3척으로는 부족해요.' },
          { badge: '답', title: '4척', text: '남는 1명도 타야 하므로 4척이 필요해요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '버림: 완성된 것만',
        instruction: '완성된 단위만 인정하고 남은 작은 부분은 빼고 생각해요.',
        image: estimateSceneImages.coin,
        items: [
          { badge: '버림', title: '100원 묶음만', text: '100원이 되지 않는 남은 동전은 아직 바꿀 수 없어요.' },
          { badge: '핵심', title: '아래 자리는 버려요', text: '기준보다 작은 남은 부분은 답에서 제외해요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '버림은 지폐 준비에도 써요',
        instruction: '완성된 1000원 단위만 준비할 수 있는 상황을 생각해요.',
        image: estimateSceneImages.doll,
        items: [
          { badge: '상황', title: '인형 뽑기', text: '1000원짜리 지폐로만 준비한다면 남은 100원 단위는 빼요.' },
          { badge: '답', title: '완성된 만큼', text: '꽉 찬 단위만 인정하는 것이 버림이에요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '반올림: 가까운 곳으로',
        instruction: '어느 기준 수에 더 가까운지 보고 가까운 쪽으로 말해요.',
        image: estimateSceneImages.school,
        items: [
          { badge: '0~4', title: '아래쪽에 가까워요', text: '기준 아래 숫자가 4 이하이면 낮은 기준 수로 봐요.' },
          { badge: '5~9', title: '위쪽에 가까워요', text: '기준 아래 숫자가 5 이상이면 높은 기준 수로 봐요.' }
        ]
      }),
      makeEstimateLesson({
        prompt: '상황에 따라 방법이 달라요',
        instruction: '모자라면 안 되는지, 완성된 것만 보는지, 가까운 수로 말하는지 먼저 판단해요.',
        image: estimateSceneImages.market,
        items: [
          { badge: '판단', title: '왜 어림할까?', text: '목적을 먼저 생각하면 올림, 버림, 반올림을 고를 수 있어요.' },
          { badge: '연습', title: '다음 단계에서 선택해요', text: '생활 장면을 보고 알맞은 어림 결과를 골라요.' }
        ]
      })
    ];
    const sets = { meaningTeachingOnly: meaningTeaching, roundingTeachingOnly: roundingTeaching };
    const lessons = sets[ask] || meaningTeaching;
    const lessonIndex = state.questionIndex % lessons.length;
    const narration = (estimateTeachingNarrations[ask] || estimateTeachingNarrations.meaningTeachingOnly)[lessonIndex];
    return {
      ...lessons[lessonIndex],
      narrationText: narration?.text || lessons[lessonIndex].narrationText,
      narrationSrc: narration?.src || lessons[lessonIndex].narrationSrc
    };
  };

  const makeEstimateBoxData = ({ boxes, loose, item = 'apple', modeLabel = '', unit = 10 }) => {
    const preset = estimateItemPresets[item] || estimateItemPresets.apple;
    return {
      ...preset,
      boxes,
      loose,
      unitSize: unit,
      actualValue: boxes * unit + loose,
      modeLabel,
      alt: `${preset.itemName} ${boxes}박스와 낱개 ${loose}개`
    };
  };

  const makeEstimateVisualQuestion = ({ prompt, instruction, image, items, answer, choices, explain, wrongHint }) => ({
    prompt,
    instruction,
    visual: 'estimate-lesson',
    data: { image, items },
    answer,
    choices,
    strictChoices: true,
    explain,
    wrongHint
  });

  const estimateMeaningSituations = [
    {
      image: estimateSceneImages.market,
      prompt: '마트에서 장을 볼 때 돈이 충분한지 빠르게 확인하려면?',
      answer: '대강 어림해서 더하기',
      choices: ['대강 어림해서 더하기', '하나하나 끝까지 세기', '아무 숫자나 말하기', '가격표를 가리기'],
      explain: '돈이 충분한지 빠르게 판단할 때는 대강 어림해서 더하면 편리합니다.'
    },
    {
      image: estimateSceneImages.market,
      prompt: '사과가 43개쯤 보일 때 편하게 말하는 방법은?',
      answer: '약 40개쯤',
      choices: ['약 40개쯤', '정확히 43개만', '4개쯤', '400개쯤'],
      explain: '43개는 가까운 10단위로 약 40개쯤이라고 말할 수 있습니다.'
    },
    {
      image: estimateSceneImages.school,
      prompt: '학교 전체 인원을 신문에 대강 소개하려면 어떤 말이 자연스러울까요?',
      answer: '대략 가까운 백 단위로 말하기',
      choices: ['대략 가까운 백 단위로 말하기', '마지막 한 명까지 모두 쓰기', '인원을 숨기기', '늘 같은 수로 말하기'],
      explain: '많은 사람 수를 소개할 때는 대략 가까운 백 단위로 말하면 이해하기 쉽습니다.'
    },
    {
      image: estimateSceneImages.boat,
      prompt: '배가 몇 척 필요한지 빨리 판단해야 할 때 어림은 어떤 도움을 줄까요?',
      answer: '필요한 양을 빠르게 예상해요',
      choices: ['필요한 양을 빠르게 예상해요', '항상 정확한 수만 말해요', '수를 더 헷갈리게 해요', '남는 사람을 무시해요'],
      explain: '어림은 필요한 양을 빠르게 예상하는 데 도움을 줍니다.'
    },
    {
      image: estimateSceneImages.pizza,
      prompt: '친구들과 피자를 주문하기 전에 먼저 생각하면 좋은 것은?',
      answer: '몇 판쯤 필요할지 어림하기',
      choices: ['몇 판쯤 필요할지 어림하기', '아무 판이나 주문하기', '조각 수를 보지 않기', '항상 한 판만 주문하기'],
      explain: '피자는 모자라면 안 되므로 몇 판쯤 필요한지 먼저 어림하면 좋습니다.'
    }
  ];

  const estimateModeWrongHint = {
    ceil: '그 답은 버림이나 반올림 결과일 수 있어요. 지금은 모자라면 안 되는 올림 상황입니다.',
    floor: '그 답은 올림이나 반올림 결과일 수 있어요. 지금은 완성된 묶음만 인정하는 버림 상황입니다.',
    round: '그 답은 올림이나 버림 결과일 수 있어요. 지금은 어느 기준 수에 더 가까운지 보는 반올림 상황입니다.'
  };

  const makeEstimateMeaningSituationQuestion = () => {
    const scenario = pick(estimateMeaningSituations);
    return makeEstimateVisualQuestion({
      prompt: scenario.prompt,
      instruction: '어림은 정확하지 않은 가짜 수가 아니라 빠른 판단을 돕는 영리한 수예요.',
      image: scenario.image,
      items: [
        { badge: '약', title: '대략 보기', text: '하나씩 끝까지 세지 않아도 전체 크기를 빠르게 볼 수 있어요.' },
        { badge: '쯤', title: '상황에 맞게', text: '정확한 값이 꼭 필요하지 않을 때 어림수를 사용해요.' }
      ],
      answer: scenario.answer,
      choices: scenario.choices,
      explain: scenario.explain,
      wrongHint: '어림은 아무 수나 말하는 것이 아니라 상황에 맞게 빠르게 판단하는 방법이에요.'
    });
  };

  const makeEstimateNumberSituationQuestion = () => {
    const value = pick([23, 28, 34, 37, 43, 48, 56, 62, 67, 74, 81, 87, 93]);
    const rounded = roundToPlace(value, 10);
    const floorValue = floorToPlace(value, 10);
    const ceilValue = ceilToPlace(value, 10);
    const item = pick(['사과', '과자', '색연필', '스티커', '구슬']);
    return makeEstimateVisualQuestion({
      prompt: `${item} ${value}개를 편하게 말하면?`,
      instruction: '약, 대략, 쯤이라는 말을 떠올리며 가까운 10단위를 고르세요.',
      image: estimateSceneImages.market,
      items: [
        { badge: '정확', title: `${value}개`, text: '하나씩 세어 얻은 자세한 수예요.' },
        { badge: '어림수', title: `약 ${rounded}개쯤`, text: '빠르게 말하려고 가까운 10단위로 나타낸 수예요.' }
      ],
      answer: `약 ${rounded}개쯤`,
      choices: uniqueChoices(`약 ${rounded}개쯤`, [`약 ${floorValue}개쯤`, `약 ${ceilValue}개쯤`, `정확히 ${value}개`, `약 ${Math.max(0, rounded - 20)}개쯤`], 4),
      explain: `${value}개는 가까운 10단위로 약 ${rounded}개쯤이라고 말할 수 있습니다.`,
      wrongHint: '정확한 수 대신 가까운 10단위에 약, 대략, 쯤을 붙여 말해 보세요.'
    });
  };

  const ceilScenarios = [
    { image: estimateSceneImages.boat, thing: '사람', valuePool: [23, 31, 43, 47, 58, 69, 72, 86], unit: 10, groupName: '배', answerUnit: '척', context: '한 배에 10명씩 탈 수 있어요.', reason: '사람이 남으면 배가 한 척 더 필요해요.' },
    { image: estimateSceneImages.pizza, thing: '친구', valuePool: [17, 19, 25, 31, 38, 44], unit: 8, groupName: '피자', answerUnit: '판', context: '피자 한 판은 8조각으로 나누어 먹어요.', reason: '조각이 모자라면 피자를 한 판 더 주문해야 해요.' }
  ];

  const floorScenarios = [
    { image: estimateSceneImages.coin, valuePool: [1234, 1470, 1688, 2134, 2545, 3890], place: 100, suffix: '원', context: '100원 단위로만 바꿀 수 있어요.', reason: '100원으로 꽉 채워지는 금액만 인정해요.' },
    { image: estimateSceneImages.doll, valuePool: [2350, 2780, 3190, 4520, 5860], place: 1000, suffix: '원', context: '1000원짜리 지폐로만 준비해요.', reason: '완성된 1000원 묶음만 준비할 수 있어요.' }
  ];

  const roundScenarios = [
    { image: estimateSceneImages.school, valuePool: [1234, 1567, 1821, 2476, 3412, 4289], place: 100, suffix: '명', context: '신문에 전교생 수를 대략 소개해요.' },
    { image: estimateSceneImages.market, valuePool: [1320, 1680, 2420, 2860, 3190, 3740], place: 100, suffix: '원', context: '장보기 금액을 대략 말해요.' },
    { image: estimateSceneImages.market, valuePool: [43, 58, 76, 87, 94, 126], place: 10, suffix: '개', context: '마트의 여러 물건 수를 빠르게 말해요.' }
  ];

  const makeEstimateCeilScenarioQuestion = () => {
    const scenario = pick(ceilScenarios);
    const value = pick(scenario.valuePool);
    const answer = Math.ceil(value / scenario.unit);
    const countSuffix = scenario.thing === '사람' || scenario.thing === '친구' ? '명' : '개';
    const action = scenario.groupName === '배' ? '태우려면' : scenario.groupName === '피자' ? '나누어 먹으려면' : '담으려면';
    return makeEstimateVisualQuestion({
      prompt: `${value}${countSuffix}을 ${scenario.groupName} 한 ${scenario.answerUnit}에 ${scenario.unit}${countSuffix}씩 ${action} 몇 ${scenario.answerUnit} 필요할까요?`,
      instruction: '모자라면 안 돼요. 남는 것이 하나라도 있으면 올림하세요.',
      image: scenario.image,
      items: [
        { badge: '올림', title: '모자라면 안 돼', text: scenario.context },
        { badge: '왜?', title: scenario.reason, text: `${value}을 ${scenario.unit}씩 나누고 남는 수를 확인해요.` }
      ],
      answer: `${answer}${scenario.answerUnit}`,
      choices: uniqueChoices(`${answer}${scenario.answerUnit}`, [answer - 1, answer + 1, answer + 2, Math.max(1, answer - 2)].map((item) => `${item}${scenario.answerUnit}`), 4),
      explain: `${value}을 ${scenario.unit}씩 나누면 남는 수가 있으므로 ${answer}${scenario.answerUnit}가 필요합니다.`,
      wrongHint: estimateModeWrongHint.ceil
    });
  };

  const makeEstimateFloorScenarioQuestion = () => {
    const scenario = pick(floorScenarios);
    const value = pick(scenario.valuePool);
    const answer = floorToPlace(value, scenario.place);
    return makeEstimateVisualQuestion({
      prompt: `${formatWholeNumber(value)}${scenario.suffix}에서 완성된 ${formatWholeNumber(scenario.place)}${scenario.suffix} 단위만 인정하면?`,
      instruction: '완성된 것만 인정해요. 남는 부분은 버림하세요.',
      image: scenario.image,
      items: [
        { badge: '버림', title: '완성된 것만', text: scenario.context },
        { badge: '왜?', title: scenario.reason, text: `${formatWholeNumber(scenario.place)}${scenario.suffix} 아래 남는 부분은 아직 완성되지 않았어요.` }
      ],
      answer: `${formatWholeNumber(answer)}${scenario.suffix}`,
      choices: makeRoundingChoices(answer, [ceilToPlace(value, scenario.place), roundToPlace(value, scenario.place), value], scenario.suffix, scenario.place),
      explain: `${formatWholeNumber(value)}${scenario.suffix}에서 완성된 ${formatWholeNumber(scenario.place)}${scenario.suffix} 단위만 보면 ${formatWholeNumber(answer)}${scenario.suffix}입니다.`,
      wrongHint: estimateModeWrongHint.floor
    });
  };

  const makeEstimateRoundScenarioQuestion = () => {
    const scenario = pick(roundScenarios);
    const value = pick(scenario.valuePool);
    const answer = roundToPlace(value, scenario.place);
    return makeEstimateVisualQuestion({
      prompt: `${formatWholeNumber(value)}${scenario.suffix}을 ${placeLabel(scenario.place)}까지 반올림하면?`,
      instruction: '어디에 더 가까운지 보세요. 기준 아래 숫자가 5 이상이면 올려요.',
      image: scenario.image,
      items: [
        { badge: '반올림', title: '어디에 더 가까울까?', text: scenario.context },
        { badge: '5', title: '5 이상이면 올림', text: `${placeLabel(scenario.place)} 바로 아래 자리 숫자를 확인해요.` }
      ],
      answer: `${formatWholeNumber(answer)}${scenario.suffix}`,
      choices: makeRoundingChoices(answer, [ceilToPlace(value, scenario.place), floorToPlace(value, scenario.place), value], scenario.suffix, scenario.place),
      explain: `${formatWholeNumber(value)}${scenario.suffix}을 ${placeLabel(scenario.place)}까지 반올림하면 ${formatWholeNumber(answer)}${scenario.suffix}입니다.`,
      wrongHint: estimateModeWrongHint.round
    });
  };

  const makeEstimateModeCompareQuestion = () => {
    const value = pick([1234, 1567, 1821, 2476, 3412, 4289]);
    const mode = pick(['ceil', 'floor', 'round']);
    const place = 100;
    const answer = mode === 'ceil' ? ceilToPlace(value, place) : mode === 'floor' ? floorToPlace(value, place) : roundToPlace(value, place);
    return makeEstimateVisualQuestion({
      prompt: `${formatWholeNumber(value)}명을 백의 자리까지 ${estimateModeLabel[mode]}하면?`,
      instruction: '같은 수라도 올림, 버림, 반올림에 따라 결과가 달라져요.',
      image: estimateSceneImages.school,
      items: [
        { badge: '올림', title: `${formatWholeNumber(ceilToPlace(value, place))}명`, text: '남는 수가 있으면 다음 백으로 올려요.' },
        { badge: '버림', title: `${formatWholeNumber(floorToPlace(value, place))}명`, text: '완성된 백 단위만 인정해요.' },
        { badge: '반올림', title: `${formatWholeNumber(roundToPlace(value, place))}명`, text: '어느 백 단위에 가까운지 봐요.' }
      ],
      answer: `${formatWholeNumber(answer)}명`,
      choices: makeRoundingChoices(answer, [ceilToPlace(value, place), floorToPlace(value, place), roundToPlace(value, place), value], '명', place),
      explain: `${formatWholeNumber(value)}명을 백의 자리까지 ${estimateModeLabel[mode]}하면 ${formatWholeNumber(answer)}명입니다.`,
      wrongHint: estimateModeWrongHint[mode]
    });
  };

  const makeEstimateModeChoiceQuestion = () => {
    const scenarios = [
      { image: estimateSceneImages.pizza, prompt: '친구들이 모두 먹을 피자를 주문할 때 알맞은 어림 방법은?', answer: '올림', reason: '모자라면 안 되므로 남는 조각이 있어도 한 판 더 준비해요.' },
      { image: estimateSceneImages.boat, prompt: '모든 사람이 배에 타야 할 때 알맞은 어림 방법은?', answer: '올림', reason: '사람이 한 명이라도 남으면 배가 더 필요해요.' },
      { image: estimateSceneImages.doll, prompt: '인형 뽑기 기계에 넣을 지폐를 준비할 때 알맞은 어림 방법은?', answer: '버림', reason: '완성된 지폐 단위로 바꿀 수 있는 만큼만 준비해요.' },
      { image: estimateSceneImages.coin, prompt: '동전을 100원 단위로 바꿀 때 알맞은 어림 방법은?', answer: '버림', reason: '100원이 되지 않는 남은 동전은 완성된 묶음이 아니에요.' },
      { image: estimateSceneImages.school, prompt: '친구들에게 우리 학교 인원수를 대강 말할 때 알맞은 어림 방법은?', answer: '반올림', reason: '가까운 백 단위로 말하면 듣는 사람이 빠르게 이해해요.' },
      { image: estimateSceneImages.market, prompt: '마트 장보기 금액을 대략 말할 때 알맞은 어림 방법은?', answer: '반올림', reason: '가까운 금액으로 말하면 전체 규모를 빠르게 알 수 있어요.' }
    ];
    const scenario = pick(scenarios);
    return makeEstimateVisualQuestion({
      prompt: scenario.prompt,
      instruction: '상황에 따라 정답이 달라질 수 있어요. 지금 필요한 어림 방법을 고르세요.',
      image: scenario.image,
      items: [
        { badge: scenario.answer, title: scenario.reason, text: '상황의 목적을 먼저 생각하면 어림 방법을 고를 수 있어요.' },
        { badge: '선택', title: '어림 대장처럼 판단하기', text: '모자라면 안 되는지, 완성된 것만 볼지, 가까운 수를 말할지 생각해요.' }
      ],
      answer: scenario.answer,
      choices: ['올림', '버림', '반올림'],
      explain: `${scenario.reason} 그래서 ${scenario.answer}을 사용합니다.`,
      wrongHint: `다시 생각해요. ${scenario.reason}`
    });
  };

  const makeBoxScenario = (stage, options = {}) => {
    const p = stage.params || {};
    const unit = Number(p.unit || 10);
    const boxes = rand(Number(p.minBoxes || 2), Number(p.maxBoxes || 8));
    const minLoose = Number.isFinite(Number(p.minLoose)) ? Number(p.minLoose) : 0;
    const maxLoose = Number.isFinite(Number(p.maxLoose)) ? Number(p.maxLoose) : unit - 1;
    const upperLoose = Math.min(unit - 1, maxLoose);
    const loose = options.roundingLoose
      ? pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((value) => value >= minLoose && value <= upperLoose))
      : rand(minLoose, upperLoose);
    const item = !p.item || p.item === 'mixed' ? pick(['apple', 'counters']) : p.item;
    return { unit, boxes, loose, item, actual: boxes * unit + loose };
  };

  const makeRoundingChoices = (answer, candidates, suffix = '', step = 10) => {
    const normalizedAnswer = `${formatWholeNumber(answer)}${suffix}`;
    const pool = [];
    const push = (value) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric < 0) return;
      const text = `${formatWholeNumber(numeric)}${suffix}`;
      if (text !== normalizedAnswer && !pool.includes(text)) pool.push(text);
    };
    candidates.forEach(push);
    [answer - step * 2, answer - step, answer + step, answer + step * 2, answer + step * 3].forEach(push);
    return uniqueChoices(normalizedAnswer, pool, 4);
  };

  const makeLargeRoundingQuestion = (mode) => {
    const value = pick([1234, 1567, 1821, 2476, 3412, 4289]);
    const place = 100;
    const calculator = mode === 'ceil' ? ceilToPlace : mode === 'floor' ? floorToPlace : roundToPlace;
    const answer = calculator(value, place);
    const choices = [
      ceilToPlace(value, place),
      floorToPlace(value, place),
      roundToPlace(value, place),
      value
    ];
    return {
      prompt: `${formatWholeNumber(value)}명을 ${placeLabel(place)}까지 ${estimateModeLabel[mode]}하면?`,
      instruction: `${placeLabel(place)} 아래 자리 숫자를 보고 ${estimateModeLabel[mode]} 규칙을 적용하세요.`,
      visual: 'estimate-lesson',
      data: {
        image: estimateSceneImages.school,
        items: [
          { badge: estimateModeLabel[mode], title: `${formatWholeNumber(value)}명`, text: `${placeLabel(place)}까지 대략 나타내요.` },
          { badge: placeLabel(place), title: `${formatWholeNumber(answer)}명`, text: mode === 'ceil' ? '남는 수가 있으면 다음 백으로 올려요.' : mode === 'floor' ? '백의 자리 아래 수는 버려요.' : '십의 자리 숫자가 4 미만인지, 6 이상인지 확인해요.' }
        ]
      },
      answer: `${formatWholeNumber(answer)}명`,
      choices: makeRoundingChoices(answer, choices, '명', 100),
      strictChoices: true,
      explain: `${formatWholeNumber(value)}명을 ${placeLabel(place)}까지 ${estimateModeLabel[mode]}하면 ${formatWholeNumber(answer)}명입니다.`
    };
  };

  const makeEstimateQuestion = (stage) => {
    const p = stage.params || {};
    const ask = p.ask || 'nearestBox10';
    if (ask === 'boxSenseMixed') {
      const modes = ['boxCount', 'nearestBox10', 'boxCount', 'nearestBox10', 'nearestBox10', 'boxCount', 'nearestBox10', 'boxCount', 'nearestBox10', 'boxCount'];
      return makeEstimateQuestion({ ...stage, params: { ...p, ask: modes[estimateStageIndex(modes.length)] } });
    }
    if (ask === 'lifeEstimateMixed') {
      const modes = ['ceil', 'floor', 'round', 'ceil', 'floor', 'round', 'ceil', 'floor', 'round', 'ceil'];
      const mode = modes[estimateStageIndex(modes.length)];
      if (mode === 'ceil') return makeEstimateCeilScenarioQuestion();
      if (mode === 'floor') return makeEstimateFloorScenarioQuestion();
      return makeEstimateRoundScenarioQuestion();
    }
    if (ask === 'meaningSituation') return makeEstimateMeaningSituationQuestion();
    if (ask === 'estimateNumberSituation') return makeEstimateNumberSituationQuestion();
    if (ask === 'ceilScenario') return makeEstimateCeilScenarioQuestion();
    if (ask === 'floorScenario') return makeEstimateFloorScenarioQuestion();
    if (ask === 'roundScenario') return makeEstimateRoundScenarioQuestion();
    if (ask === 'modeCompare') return makeEstimateModeCompareQuestion();
    if (ask === 'modeChoiceScenario') return makeEstimateModeChoiceQuestion();
    if (ask === 'largeRoundingMixed') return makeLargeRoundingQuestion(pick(['ceil', 'floor', 'round']));
    if (['meaningTeachingOnly', 'roundingTeachingOnly', 'meaningIntro', 'estimateNumberIntro', 'ceilIntro', 'floorIntro', 'roundIntro'].includes(ask)) {
      return makeEstimateConceptQuestion(stage);
    }
    if (ask === 'mixedBoxRounding' && p.includeHundreds && Math.random() < 0.35) {
      return makeLargeRoundingQuestion(pick(['ceil', 'floor', 'round']));
    }
    const mixedMode = ask === 'mixedBoxRounding' ? pick(['ceil', 'floor', 'round']) : '';
    const scenario = makeBoxScenario(stage, { roundingLoose: ask === 'nearestBox10' || mixedMode === 'round' });
    const data = makeEstimateBoxData({
      boxes: scenario.boxes,
      loose: scenario.loose,
      item: scenario.item,
      unit: scenario.unit,
      modeLabel: ask === 'ceilBox' ? '올림' : ask === 'floorBox' ? '버림' : ask === 'mixedBoxRounding' ? '상황에 맞는 어림' : '어림수'
    });
    if (ask === 'boxCount') {
      const answer = scenario.actual;
      return {
        prompt: `한 박스에 ${scenario.unit}개씩 있습니다. 모두 몇 개인가요?`,
        instruction: '박스 수와 낱개를 합쳐서 확인하세요.',
        visual: 'estimate-box',
        data,
        answer: `${answer}개`,
        choices: makeRoundingChoices(answer, [answer - 10, answer + 10, answer - 1, answer + 1].filter((value) => value > 0), '개', scenario.unit),
        strictChoices: true,
        explain: `${scenario.boxes}박스는 ${scenario.boxes * scenario.unit}개이고 낱개 ${scenario.loose}개를 더하면 ${answer}개입니다.`
      };
    }
    if (ask === 'nearestBox10') {
      const answer = roundToPlace(scenario.actual, scenario.unit);
      return {
        prompt: `${scenario.actual}개는 가까운 ${scenario.unit}단위로 얼마쯤일까요?`,
        instruction: '낱개가 6개 이상이면 올림, 4개 미만이면 내림으로 생각해요.',
        visual: 'estimate-box',
        data,
        answer: `${answer}개`,
        choices: makeRoundingChoices(answer, [floorToPlace(scenario.actual, scenario.unit), ceilToPlace(scenario.actual, scenario.unit), answer - 20, answer + 20].filter((value) => value > 0), '개', scenario.unit),
        strictChoices: true,
        explain: `${scenario.actual}개는 가까운 ${scenario.unit}단위로 ${answer}개쯤입니다.`
      };
    }
    if (ask === 'ceilBox') {
      const answer = ceilToPlace(scenario.actual, scenario.unit) / scenario.unit;
      return {
        prompt: `${scenario.actual}개를 ${scenario.unit}개씩 담으려면 박스가 몇 개 필요할까요?`,
        instruction: '낱개가 하나라도 남으면 박스가 하나 더 필요해요.',
        visual: 'estimate-box',
        data,
        answer: `${answer}박스`,
        choices: uniqueChoices(`${answer}박스`, [answer - 1, answer + 1, answer + 2].filter((value) => value > 0).map((value) => `${value}박스`), 4),
        strictChoices: true,
        explain: `${scenario.boxes}박스에 낱개 ${scenario.loose}개가 남으므로 ${answer}박스가 필요합니다.`
      };
    }
    if (ask === 'floorBox') {
      const answer = floorToPlace(scenario.actual, scenario.unit) / scenario.unit;
      return {
        prompt: `${scenario.actual}개에서 완성된 ${scenario.unit}개 박스는 몇 박스인가요?`,
        instruction: '낱개는 버리고 완성된 박스만 세어보세요.',
        visual: 'estimate-box',
        data,
        answer: `${answer}박스`,
        choices: uniqueChoices(`${answer}박스`, [answer + 1, answer - 1, answer + 2].filter((value) => value > 0).map((value) => `${value}박스`), 4),
        strictChoices: true,
        explain: `낱개 ${scenario.loose}개를 버리면 완성된 박스는 ${answer}박스입니다.`
      };
    }
    const mode = mixedMode || pick(['ceil', 'floor', 'round']);
    const place = scenario.unit;
    const calculator = mode === 'ceil' ? ceilToPlace : mode === 'floor' ? floorToPlace : roundToPlace;
    const answer = calculator(scenario.actual, place);
    return {
      prompt: `${scenario.actual}개를 ${placeLabel(place)}까지 ${estimateModeLabel[mode]}하면?`,
      instruction: `${estimateModeLabel[mode]} 규칙을 적용해 어림수를 고르세요.`,
      visual: 'estimate-box',
      data: { ...data, modeLabel: estimateModeLabel[mode] },
      answer: `${answer}개`,
      choices: makeRoundingChoices(answer, [ceilToPlace(scenario.actual, place), floorToPlace(scenario.actual, place), roundToPlace(scenario.actual, place), scenario.actual], '개', place),
      strictChoices: true,
      explain: `${scenario.actual}개를 ${placeLabel(place)}까지 ${estimateModeLabel[mode]}하면 ${answer}개입니다.`
    };
  };
  const getTimesTwoItem = (itemSet = 'mixed') => {
    const pool = itemSet === 'fruit'
      ? timesTwoItems.fruit
      : timesTwoItems.product;
    return pick(pool);
  };
  const getTimesTwoGroupCount = (stage) => {
    const groups = Array.isArray(stage.params?.groups) && stage.params.groups.length
      ? stage.params.groups
      : [2,3,4,5,6,7,8,9];
    const index = state.stageQuestionOrder[state.questionIndex] ?? state.questionIndex;
    return Number(groups[index % groups.length]) || pick(groups);
  };
  const buildTimesTwoDotConnectData = (factor, questionIndex = 0) => {
    const pathSets = {
      3: [
        [0,1,2,5,8,7],
        [6,3,0,1,4,5],
        [2,1,4,7,8,5]
      ],
      4: [
        [0,1,5,6,2,3,7,11],
        [12,8,4,5,1,2,6,10]
      ],
      5: [
        [0,1,6,7,2,3,8,13,12,17],
        [20,15,16,11,12,7,2,3,8,13]
      ]
    };
    const questionPlan = [
      { gridSize: 3, pathIndex: 0 },
      { gridSize: 3, pathIndex: 1 },
      { gridSize: 4, pathIndex: 0 },
      { gridSize: 4, pathIndex: 1 },
      { gridSize: 5, pathIndex: 0 },
      { gridSize: 5, pathIndex: 1 }
    ];
    const plan = questionPlan[questionIndex % questionPlan.length] || questionPlan[0];
    const gridSize = plan.gridSize;
    const path = pathSets[gridSize][plan.pathIndex % pathSets[gridSize].length];
    const sequence = Array.from({ length: path.length }, (_, index) => factor * (index + 1));
    const cellCount = gridSize * gridSize;
    const distractorPool = Array.from({ length: Math.max(30, cellCount + 10) }, (_, index) => index + 1)
      .filter((value) => !sequence.includes(value));
    const offset = (questionIndex * 3) % distractorPool.length;
    const distractors = Array.from({ length: cellCount - sequence.length }, (_, index) => distractorPool[(offset + index) % distractorPool.length]);
    const valuesByCell = Array.from({ length: cellCount }, () => null);
    path.forEach((cellIndex, index) => {
      valuesByCell[cellIndex] = sequence[index];
    });
    let distractorIndex = 0;
    valuesByCell.forEach((value, cellIndex) => {
      if (value == null) {
        valuesByCell[cellIndex] = distractors[distractorIndex];
        distractorIndex += 1;
      }
    });
    return {
      factor,
      gridSize,
      sequence,
      path,
      nodes: valuesByCell.map((value, cellIndex) => ({
        value,
        row: Math.floor(cellIndex / gridSize) + 1,
        col: (cellIndex % gridSize) + 1
      }))
    };
  };
  const buildTimesTwoMatchData = (factor, questionIndex = 0) => {
    const groupSets = [
      [4,7,9,8],
      [5,2,6,3],
      [1,8,4,10],
      [7,3,5,9],
      [2,10,6,8],
      [9,1,7,4],
      [6,5,3,10],
      [8,2,9,4],
      [1,6,10,5],
      [3,7,2,8]
    ];
    const answerPermutations = [
      [2,0,3,1],
      [3,1,0,2],
      [1,3,2,0],
      [2,1,3,0],
      [1,0,3,2],
      [3,2,0,1],
      [2,3,1,0],
      [1,3,0,2],
      [3,0,2,1],
      [2,0,1,3]
    ];
    const groups = groupSets[questionIndex % groupSets.length] || groupSets[0];
    const pairs = groups.map((group) => ({ factor, groups: group, total: factor * group }));
    const order = answerPermutations[questionIndex % answerPermutations.length] || answerPermutations[0];
    const baseAnswerOrder = order.map((index) => pairs[index].total);
    const answerOrder = shuffle(baseAnswerOrder);
    return { factor, pairs, answerOrder };
  };

  const buildTimedMultiplicationGroups = (count) => {
    const safeCount = TIMED_MULTIPLICATION_COUNTS.includes(Number(count)) ? Number(count) : 10;
    const pool = [1,2,3,4,5,6,7,8,9,10];
    const groups = [];
    while (groups.length < safeCount) {
      groups.push(...shuffle(pool));
    }
    return groups.slice(0, safeCount);
  };

  const makeTimesTwoQuestion = (stage) => {
    const p = stage.params || {};
    const ask = p.ask || 'multiplicationTotal';
    const factor = Math.max(1, Number(p.factor || 2));
    const groups = getTimesTwoGroupCount(stage);
    const total = groups * factor;
    const item = getTimesTwoItem(p.itemSet);
    const itemUnit = item.unit || '개';
    const pairLabel = `${factor}${itemUnit}씩`;
    const keypadData = { unit: itemUnit, maxDigits: 2, allowDecimal: false };
    if (ask === 'dotConnect') {
      const questionOrder = state.questionIndex;
      const data = buildTimesTwoDotConnectData(factor, questionOrder);
      const startValue = data.sequence[0] || factor;
      const previewValues = data.sequence.slice(1, 4).join(', ');
      const endValue = data.sequence[data.sequence.length - 1] || factor * 10;
      return {
        prompt: `${factor}씩 뛰어 세어 차례대로 선을 이어보세요.`,
        instruction: `${startValue}에서 시작해 ${previewValues} 순서로 ${endValue}까지 도트를 연결하세요.`,
        visual: 'times-two-dot-connect',
        inputMode: 'dot-connect',
        data,
        answer: 'connected',
        choices: [],
        explain: `${startValue}부터 ${endValue}까지 ${factor}씩 뛰어 세며 모두 연결했어요.`
      };
    }
    if (ask === 'multiplicationMatch') {
      const questionOrder = state.stageQuestionOrder[state.questionIndex] ?? state.questionIndex;
      const data = buildTimesTwoMatchData(factor, questionOrder);
      return {
        prompt: '곱셈식으로 알맞게 선을 그어요.',
        instruction: `${factor} x 위 숫자를 계산하고 아래 답을 눌러 연결하세요.`,
        visual: 'times-two-match',
        inputMode: 'times-match',
        data,
        answer: 'matched',
        choices: [],
        explain: '위 숫자와 아래 답을 모두 알맞게 연결했어요.'
      };
    }
    if (ask === 'timedMultiplication') {
      const drillGroups = Array.isArray(state.timedDrill?.questionGroups) ? state.timedDrill.questionGroups : [];
      const practiceGroup = Number(drillGroups[state.questionIndex] || groups || 1);
      const answer = factor * practiceGroup;
      const orientation = p.orientation === 'vertical' ? 'vertical' : 'horizontal';
      return {
        prompt: orientation === 'vertical' ? '세로 곱셈식의 답은 무엇일까요?' : '가로 곱셈식의 답은 무엇일까요?',
        instruction: '',
        visual: 'times-two-written',
        inputMode: 'number-keypad',
        data: { ...keypadData, unit: '', factor, groups: practiceGroup, orientation, maxDigits: 3 },
        answer,
        choices: [],
        explain: `${factor} x ${practiceGroup} = ${answer}입니다.`
      };
    }
    if (ask === 'horizontalMultiplication' || ask === 'verticalMultiplication') {
      const practiceGroups = Array.isArray(p.groups) && p.groups.length ? p.groups : multiplicationGroups;
      const practiceGroup = Number(practiceGroups[state.questionIndex % practiceGroups.length]) || groups;
      const answer = factor * practiceGroup;
      const vertical = ask === 'verticalMultiplication';
      return {
        prompt: vertical ? '세로 곱셈식의 답을 입력하세요.' : '가로 곱셈식의 답을 입력하세요.',
        instruction: `${factor}를 ${practiceGroup}번 더한 값으로 생각해 보세요.`,
        visual: 'times-two-written',
        inputMode: 'number-keypad',
        data: { ...keypadData, unit: '', factor, groups: practiceGroup, orientation: vertical ? 'vertical' : 'horizontal' },
        answer,
        choices: [],
        explain: `${factor} x ${practiceGroup} = ${answer}입니다.`
      };
    }
    if (ask === 'countPictures') {
      const itemSubject = topicText(item.name);
      return {
        prompt: `${itemSubject} 모두 몇 ${itemUnit}일까요?`,
        instruction: '그림을 하나씩 세고 아래 숫자 버튼으로 답을 입력하세요.',
        visual: 'times-two-objects',
        inputMode: 'number-keypad',
        data: { ...keypadData, factor, groups, perGroup: factor, item },
        answer: total,
        choices: [],
        explain: `${itemSubject} ${pairLabel} ${groups}묶음이라서 모두 ${total}${itemUnit}입니다.`
      };
    }
    if (ask === 'skipBlank' || ask === 'pathBlank') {
      const start = Number(Array.isArray(p.starts) ? p.starts[state.questionIndex % p.starts.length] : p.starts) || 2;
      const length = Number(p.sequenceLength || 5);
      const values = Array.from({ length }, (_, index) => start + index * factor);
      const blankIndex = ask === 'pathBlank'
        ? clamp(2 + (state.questionIndex % Math.max(1, length - 2)), 1, length - 1)
        : clamp(1 + (state.questionIndex % Math.max(1, length - 1)), 1, length - 1);
      const answer = values[blankIndex];
      const shown = values.map((value, index) => index === blankIndex ? null : value);
      return {
        prompt: '빈칸에 들어갈 수는 무엇일까요?',
        instruction: '앞 숫자에서 2씩 뛰어 세어 보세요.',
        visual: 'times-two-path',
        inputMode: 'number-keypad',
        data: { ...keypadData, unit: '', factor, values: shown },
        answer,
        choices: [],
        explain: `${values[blankIndex - 1]}에서 ${factor}를 더하면 ${answer}입니다.`
      };
    }
    if (ask === 'groupCount') {
      return {
        prompt: `${pairLabel} 묶으면 몇 묶음일까요?`,
        instruction: '점선 묶음을 세고 묶음 수를 입력하세요.',
        visual: 'times-two-objects',
        inputMode: 'number-keypad',
        data: { ...keypadData, unit: '묶음', factor, groups, perGroup: factor, item },
        answer: groups,
        choices: [],
        explain: `${pairLabel} 묶은 덩어리가 ${groups}개라서 ${groups}묶음입니다.`
      };
    }
    if (ask === 'groupTotal' || ask === 'pairSentenceTotal') {
      return {
        prompt: `${pairLabel} ${groups}묶음이면 모두 몇 ${itemUnit}일까요?`,
        instruction: '묶음 수를 보고 2씩 더해 전체 수를 입력하세요.',
        visual: 'times-two-objects',
        inputMode: 'number-keypad',
        data: { ...keypadData, factor, groups, perGroup: factor, item },
        answer: total,
        choices: [],
        explain: `${pairLabel} ${groups}묶음은 ${Array.from({ length: groups }, () => String(factor)).join(' + ')}라서 ${total}${itemUnit}입니다.`
      };
    }
    if (ask === 'additionTotal') {
      return {
        prompt: '덧셈식의 답을 입력하세요.',
        instruction: '2를 몇 번 더했는지 보고 모두 더해요.',
        visual: 'times-two-formula',
        inputMode: 'number-keypad',
        data: { ...keypadData, factor, groups, mode: 'addition', showMultiplication: true },
        answer: total,
        choices: [],
        explain: `${factor}를 ${groups}번 더하면 ${total}입니다. 같은 뜻으로 ${factor} x ${groups} = ${total}입니다.`
      };
    }
    if (ask === 'multiplicationTableTriple') {
      const tableGroups = Array.isArray(p.tableGroups) && p.tableGroups.length ? p.tableGroups : [1,2,3,4,5,6,7,8,9,10];
      if (state.questionIndex === 0) {
        return {
          teaching: true,
          prompt: `구구단 ${factor}단을 한눈에 살펴보세요.`,
          instruction: `${factor}씩 커지는 답을 보고 다음 문제에서 빈칸을 채워요.`,
          visual: 'times-two-table',
          data: { factor, tableGroups },
          choices: [],
          explain: ''
        };
      }
      const practiceGroups = Array.isArray(p.groups) && p.groups.length ? p.groups : [2,3,4,5,6,7,8,9];
      const centerIndex = (state.questionIndex - 1) % practiceGroups.length;
      const center = Number(practiceGroups[centerIndex]) || 2;
      const equationGroups = [center - 1, center, center + 1].map((value) => clamp(value, 1, 10));
      const answer = center * factor;
      return {
        prompt: '빈칸에 들어갈 답을 입력하세요.',
        instruction: '',
        visual: 'times-two-triple',
        inputMode: 'number-keypad',
        data: {
          unit: '',
          maxDigits: 2,
          allowDecimal: false,
          factor,
          equations: equationGroups.map((value) => ({
            groups: value,
            total: value * factor,
            blank: value === center
          }))
        },
        answer,
        choices: [],
        explain: `${factor} x ${center}은 ${factor}를 ${center}번 더한 값이라서 ${answer}입니다.`
      };
    }
    return {
      prompt: `${factor} x ${groups}의 답은 무엇일까요?`,
      instruction: `${factor}단 곱셈식의 답을 숫자 버튼으로 입력하세요.`,
      visual: 'times-two-formula',
      inputMode: 'number-keypad',
      data: { ...keypadData, factor, groups, mode: 'multiplication' },
      answer: total,
      choices: [],
      explain: `${factor} x ${groups}은 ${factor}를 ${groups}번 더한다는 뜻이라서 ${total}입니다.`
    };
  };

  const questionMakers = {
    'number-compare-balance': makeCompareQuestion,
    'number-ten-frame': makeTenFrameQuestion,
    'number-place-value': makePlaceValueQuestion,
    'number-number-line-jump': makeNumberLineQuestion,
    'number-money-market': makeMoneyQuestion,
    'number-clock-time': makeClockQuestion,
    'number-measure-compare': makeMeasureQuestion,
    'number-fraction-share': makeFractionQuestion,
    'number-data-graph': makeRulerStudyQuestion,
    'number-estimate-jar': makeEstimateQuestion,
    'number-times-two': makeTimesTwoQuestion,
    'number-times-three': makeTimesTwoQuestion,
    'number-times-four': makeTimesTwoQuestion,
    'number-times-five': makeTimesTwoQuestion,
    'number-times-six': makeTimesTwoQuestion,
    'number-times-seven': makeTimesTwoQuestion,
    'number-times-eight': makeTimesTwoQuestion,
    'number-times-nine': makeTimesTwoQuestion
  };

  const makeQuestion = () => {
    const maker = questionMakers[state.activity.id] || makeCompareQuestion;
    return normalizeQuestion(maker(state.stage));
  };

  const clearAutoAdvanceTimer = () => {
    if (state.autoAdvanceTimer) {
      clearTimeout(state.autoAdvanceTimer);
      state.autoAdvanceTimer = null;
    }
  };

  const clearTimedDrillTimer = () => {
    if (state.timedDrillTimer) {
      clearInterval(state.timedDrillTimer);
      state.timedDrillTimer = null;
    }
  };

  const updateTimedDrillTimer = () => {
    if (!isTimedDrillRunning()) return;
    const elapsed = performance.now() - state.timedDrill.startedAt;
    els.scoreChip.textContent = `시간 ${formatElapsedTime(elapsed)}`;
  };

  const startTimedDrillTimer = () => {
    clearTimedDrillTimer();
    updateTimedDrillTimer();
    state.timedDrillTimer = setInterval(updateTimedDrillTimer, 500);
  };

  const updateEstimateLooseCounting = () => {
    if (!isEstimateJarActivity() || state.question?.visual !== 'estimate-box') return;
    const looseTotal = Number(state.question?.data?.loose || 0);
    const needsCounting = looseTotal > 0;
    const counted = els.visual.querySelectorAll('.na-estimate-loose-item.is-counted').length;
    const complete = !needsCounting || counted >= looseTotal;
    els.choiceGrid.querySelectorAll('.number-agency-choice').forEach((button) => {
      button.disabled = !complete;
      button.classList.toggle('is-disabled-by-count', !complete);
    });
    if (needsCounting && !complete) {
      els.answerSlot.textContent = `낱개를 하나씩 눌러 ${counted + 1}까지 세어보세요.`;
      els.answerSlot.dataset.choice = '';
      els.answerSlot.classList.remove('is-ready', 'is-correct', 'is-wrong');
    } else if (needsCounting && complete && !els.answerSlot.classList.contains('is-ready')) {
      els.answerSlot.textContent = '보기 카드를 클릭하거나 이 빈칸으로 끌어오세요.';
    }
  };

  const resetEstimateLooseCounting = () => {
    if (!isEstimateJarActivity() || state.question?.visual !== 'estimate-box') return;
    els.visual.querySelectorAll('.na-estimate-loose-item.is-counted').forEach((button) => {
      button.classList.remove('is-counted');
      button.setAttribute('aria-pressed', 'false');
    });
    updateEstimateLooseCounting();
  };

  const renderClockKeypadControls = () => {
    const keys = ['1','2','3','4','5','6','7','8','9','clear','0','submit'];
    return `
      <div class="na-clock-keypad-panel" data-clock-keypad-panel>
        <div class="na-clock-keypad-current">
          <span>입력</span>
          <span class="na-clock-keypad-preview">
            <strong data-keypad-preview></strong>
            <em data-keypad-preview-unit>시</em>
          </span>
        </div>
        <div class="na-clock-keypad-buttons" aria-label="시계 숫자키패드">
          ${keys.map((key) => {
            if (key === 'clear') {
              return '<button type="button" class="na-clock-keypad-button is-command" data-keypad-action="clear">지우기</button>';
            }
            if (key === 'submit') {
              return '<button type="button" class="na-clock-keypad-button is-submit" data-keypad-action="submit">확인</button>';
            }
            return `<button type="button" class="na-clock-keypad-button" data-keypad-value="${key}">${key}</button>`;
          }).join('')}
        </div>
      </div>
    `;
  };

  const renderNumberKeypadControls = () => {
    const isTimesTablePractice = state.activity?.id?.startsWith('number-times-')
      && state.stage?.params?.ask === 'multiplicationTableTriple'
      && state.question?.inputMode === 'number-keypad';
    const keys = isTimesTablePractice
      ? ['1','2','3','4','5','6','7','8','9','clear','0','submit']
      : state.question?.data?.allowDecimal === false
      ? ['0','1','2','3','4','5','6','7','8','9','clear','submit']
      : ['1','2','3','4','5','6','7','8','9','0','.','clear','submit'];
    return `
      <div class="na-clock-keypad-panel na-number-keypad-panel" data-number-keypad-panel>
        <div class="na-clock-keypad-current na-number-keypad-current">
          <span>답 입력</span>
          <span class="na-clock-keypad-preview">
            <strong data-keypad-preview></strong>
            <em data-keypad-preview-unit></em>
          </span>
        </div>
        <div class="na-number-keypad-buttons" aria-label="숫자키패드">
          ${keys.map((key, index) => {
            if (key === 'clear') {
              return '<button type="button" class="na-clock-keypad-button is-command" data-keypad-action="clear">삭제</button>';
            }
            if (key === 'submit') {
              return '<button type="button" class="na-clock-keypad-button is-submit" data-keypad-action="submit">확인</button>';
            }
            return `<button type="button" class="na-clock-keypad-button" style="--key-tone:${tokenColors[index % tokenColors.length]}" data-keypad-value="${key}">${key}</button>`;
          }).join('')}
        </div>
      </div>
    `;
  };

  const renderMoneyBuilderControls = () => {
    const options = state.question?.buildOptions || [];
    return `
      <div class="na-money-builder-controls" data-money-builder-panel>
        <div class="na-money-builder-options" aria-label="화폐 선택">
          ${options.map((value) => `
            <button type="button" class="na-money-builder-button" data-money-value="${value}" aria-label="${escapeHtml(formatMoney(value))} 추가">
              ${moneyTokenHtml(value, 'na-money-builder-token')}
            </button>
          `).join('')}
        </div>
        <button type="button" class="na-money-builder-reset" data-money-action="clear">다시 만들기</button>
      </div>
    `;
  };

  const updateMoneyBuilderUi = () => {
    if (state.question?.inputMode !== 'money-builder' || !state.moneyBuilder) return;
    const stack = els.visual.querySelector('[data-money-stack]');
    const current = els.visual.querySelector('[data-money-current]');
    const items = state.moneyBuilder.items || [];
    if (stack) {
      stack.innerHTML = items.length
        ? items.map((value, index) => moneyTokenHtml(value, 'na-money-stack-token', index)).join('')
        : '<span class="na-money-stack-empty">아래 돈 버튼을 눌러 여기에 쌓아 보세요.</span>';
    }
    if (current) {
      current.textContent = `현재 ${formatMoney(state.moneyBuilder.total || 0)}`;
      current.classList.toggle('is-complete', state.moneyBuilder.total === state.moneyBuilder.target);
      current.classList.toggle('is-over', state.moneyBuilder.total > state.moneyBuilder.target);
    }
  };

  const resetMoneyBuilder = () => {
    if (!state.moneyBuilder) return;
    state.moneyBuilder.total = 0;
    state.moneyBuilder.items = [];
    updateMoneyBuilderUi();
  };

  const handleMoneyBuilderButton = (button) => {
    if (!button || state.question?.inputMode !== 'money-builder' || state.locked || !state.moneyBuilder) return;
    const action = button.dataset.moneyAction;
    if (action === 'clear') {
      resetMoneyBuilder();
      els.feedback.textContent = '';
      return;
    }
    const value = Number(button.dataset.moneyValue);
    if (!Number.isFinite(value)) return;
    state.moneyBuilder.items.push(value);
    state.moneyBuilder.total += value;
    updateMoneyBuilderUi();
    const { target, total } = state.moneyBuilder;
    if (total < target) {
      els.feedback.textContent = `현재 ${formatMoney(total)}이에요. 조금 더 모아보세요.`;
      return;
    }
    state.locked = true;
    recordSubmittedResponse(total, total === target, target);
    state.responseTimes.push(performance.now() - state.questionStartedAt);
    if (total === target) {
      state.correct += 1;
      els.scoreChip.textContent = `정답 ${state.correct}`;
      els.feedback.textContent = state.question.explain;
      playTone('correct');
      if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
      state.autoAdvanceTimer = setTimeout(() => {
        state.autoAdvanceTimer = null;
        nextQuestion();
      }, 900);
      return;
    }
    state.wrong += 1;
    els.scoreChip.textContent = `정답 ${state.correct}`;
    els.feedback.textContent = `${formatMoney(total)}이에요. 목표보다 많아졌어요. 다시 만들어볼게요.`;
    playTone('wrong');
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('wrong', { sound: false });
    state.autoAdvanceTimer = setTimeout(() => {
      state.autoAdvanceTimer = null;
      resetMoneyBuilder();
      els.feedback.textContent = '';
      state.locked = false;
    }, 760);
  };

  const updateClockKeypadUi = () => {
    if (state.question?.inputMode !== 'clock-keypad' || !state.keypad) return;
    const { phase, input, hourValue, minuteValue } = state.keypad;
    const hourBox = els.visual.querySelector('[data-clock-box="hour"]');
    const minuteBox = els.visual.querySelector('[data-clock-box="minute"]');
    const preview = els.choiceGrid.querySelector('[data-keypad-preview]');
    const previewUnit = els.choiceGrid.querySelector('[data-keypad-preview-unit]');
    if (hourBox) {
      hourBox.textContent = hourValue == null ? '' : String(hourValue);
      hourBox.classList.toggle('is-active', phase === 'hour');
      hourBox.classList.toggle('is-filled', hourValue != null);
    }
    if (minuteBox) {
      minuteBox.textContent = minuteValue == null ? '' : String(minuteValue).padStart(2, '0');
      minuteBox.classList.toggle('is-active', phase === 'minute');
      minuteBox.classList.toggle('is-filled', minuteValue != null);
    }
    if (preview) preview.textContent = input;
    if (previewUnit) previewUnit.textContent = phase === 'hour' ? '시' : '분';
  };

  const resetClockKeypadInput = () => {
    if (!state.keypad) return;
    state.keypad.input = '';
    updateClockKeypadUi();
  };

  const shakeClockKeypad = () => {
    const activeBox = els.visual.querySelector('.na-clock-input-box.is-active');
    const panel = els.choiceGrid.querySelector('[data-clock-keypad-panel]');
    [activeBox, panel].filter(Boolean).forEach((node) => {
      node.classList.remove('is-shake');
      void node.offsetWidth;
      node.classList.add('is-shake');
      setTimeout(() => node.classList.remove('is-shake'), 420);
    });
  };

  const submitClockKeypadInput = () => {
    if (!state.keypad || state.locked) return;
    const valueText = state.keypad.input.trim();
    const parsed = Number(valueText);
    const { hour, minute } = state.question.data;
    const expected = state.keypad.phase === 'hour' ? Number(hour) : Number(minute);
    if (!valueText || !Number.isFinite(parsed) || parsed !== expected) {
      recordSubmittedResponse(valueText, false, expected);
      state.wrong += 1;
      els.scoreChip.textContent = `정답 ${state.correct}`;
      resetClockKeypadInput();
      shakeClockKeypad();
      playTone('wrong');
      if (navigator.vibrate) navigator.vibrate(160);
      return;
    }
    if (state.keypad.phase === 'hour') {
      playTone('correct');
      state.keypad.hourValue = hour;
      state.keypad.phase = 'minute';
      state.keypad.input = '';
      els.prompt.textContent = '몇분인가요?';
      els.instruction.textContent = '이번에는 분을 입력하세요.';
      updateClockKeypadUi();
      return;
    }
    state.locked = true;
    recordSubmittedResponse({ hour: state.keypad.hourValue, minute: parsed }, true, { hour, minute });
    state.keypad.minuteValue = minute;
    state.keypad.input = '';
    updateClockKeypadUi();
    state.correct += 1;
    state.responseTimes.push(performance.now() - state.questionStartedAt);
    els.scoreChip.textContent = `정답 ${state.correct}`;
    els.feedback.textContent = state.question.explain;
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
    state.autoAdvanceTimer = setTimeout(() => {
      state.autoAdvanceTimer = null;
      nextQuestion();
    }, 850);
  };

  const handleClockKeypadButton = (button) => {
    if (!button || state.question?.inputMode !== 'clock-keypad' || state.locked) return;
    const value = button.dataset.keypadValue;
    const action = button.dataset.keypadAction;
    if (value != null) {
      const limit = state.keypad?.phase === 'hour' ? 2 : 2;
      state.keypad.input = `${state.keypad.input}${value}`.slice(0, limit);
      updateClockKeypadUi();
      return;
    }
    if (action === 'clear') {
      resetClockKeypadInput();
      return;
    }
    if (action === 'submit') submitClockKeypadInput();
  };

  const updateNumberKeypadUi = () => {
    if (state.question?.inputMode !== 'number-keypad' || !state.keypad) return;
    const preview = els.choiceGrid.querySelector('[data-keypad-preview]');
    const previewUnit = els.choiceGrid.querySelector('[data-keypad-preview-unit]');
    if (preview) preview.textContent = state.keypad.input;
    if (previewUnit) previewUnit.textContent = state.question.data?.unit || '';
  };

  const shakeNumberKeypad = () => {
    const panel = els.choiceGrid.querySelector('[data-number-keypad-panel]');
    if (!panel) return;
    panel.classList.remove('is-shake');
    void panel.offsetWidth;
    panel.classList.add('is-shake');
    setTimeout(() => panel.classList.remove('is-shake'), 420);
  };

  const resetNumberKeypadInput = () => {
    if (!state.keypad) return;
    state.keypad.input = '';
    updateNumberKeypadUi();
  };

  const clearTimesWrittenAnswerReveal = () => {
    if (state.question?.visual !== 'times-two-written') return;
    const answerBox = els.visual.querySelector('.na-times-two-answer-box');
    if (!answerBox) return;
    answerBox.textContent = '';
    answerBox.setAttribute('aria-hidden', 'true');
    answerBox.classList.remove('is-revealed-correct', 'is-revealed-wrong');
  };

  const revealTimesWrittenAnswer = (valueText, isCorrect) => {
    if (state.question?.visual !== 'times-two-written') return;
    const answerBox = els.visual.querySelector('.na-times-two-answer-box');
    if (!answerBox) return;
    answerBox.textContent = valueText;
    answerBox.removeAttribute('aria-hidden');
    answerBox.classList.toggle('is-revealed-correct', isCorrect);
    answerBox.classList.toggle('is-revealed-wrong', !isCorrect);
  };

  const submitNumberKeypadInput = () => {
    if (!state.keypad || state.locked) return;
    const valueText = state.keypad.input.trim();
    const parsed = Number(valueText);
    const expected = Number(state.question.answer);
    const isCorrect = Boolean(valueText && Number.isFinite(parsed) && Math.abs(parsed - expected) <= 0.0001);
    recordSubmittedResponse(valueText, isCorrect, expected);
    recordTimedDrillAnswer(valueText, isCorrect);
    revealTimesWrittenAnswer(valueText, isCorrect);
    if (!isCorrect) {
      state.wrong += 1;
      els.scoreChip.textContent = isTimedDrillRunning()
        ? `시간 ${formatElapsedTime(performance.now() - state.timedDrill.startedAt)}`
        : `정답 ${state.correct}`;
      els.feedback.textContent = '다시 확인해요. 같은 문제를 한 번 더 풀어보세요.';
      resetNumberKeypadInput();
      shakeNumberKeypad();
      playTone('wrong');
      if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('wrong', { sound: false });
      if (navigator.vibrate) navigator.vibrate(160);
      return;
    }
    state.locked = true;
    state.correct += 1;
    state.responseTimes.push(performance.now() - state.questionStartedAt);
    els.scoreChip.textContent = isTimedDrillRunning()
      ? `시간 ${formatElapsedTime(performance.now() - state.timedDrill.startedAt)}`
      : `정답 ${state.correct}`;
    els.feedback.textContent = state.question.explain;
    playTone('correct');
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
    state.autoAdvanceTimer = setTimeout(() => {
      state.autoAdvanceTimer = null;
      nextQuestion();
    }, 850);
  };

  const handleNumberKeypadButton = (button) => {
    if (!button || state.question?.inputMode !== 'number-keypad' || state.locked) return;
    const value = button.dataset.keypadValue;
    const action = button.dataset.keypadAction;
    if (value != null) {
      if (value === '.' && state.keypad.input.includes('.')) return;
      const limit = Number(state.question.data?.maxDigits || 4);
      if (String(state.keypad.input || '').length >= limit) {
        shakeNumberKeypad();
        if (navigator.vibrate) navigator.vibrate(120);
        return;
      }
      clearTimesWrittenAnswerReveal();
      state.keypad.input = `${state.keypad.input}${value}`;
      updateNumberKeypadUi();
      return;
    }
    if (action === 'clear') {
      clearTimesWrittenAnswerReveal();
      resetNumberKeypadInput();
      return;
    }
    if (action === 'submit') submitNumberKeypadInput();
  };

  const getTimesMatchBoard = () => els.visual.querySelector('[data-times-match-board]');

  const getBoardRelativeCenter = (element, board) => {
    const rect = element.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - boardRect.left,
      y: rect.top + rect.height / 2 - boardRect.top
    };
  };

  const drawTimesMatchLine = (fromCard, toCard, board, color) => {
    const svg = board.querySelector('[data-times-match-lines]');
    if (!svg || !fromCard || !toCard) return;
    const boardRect = board.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${Math.max(1, boardRect.width)} ${Math.max(1, boardRect.height)}`);
    const from = getBoardRelativeCenter(fromCard, board);
    const to = getBoardRelativeCenter(toCard, board);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(from.x));
    line.setAttribute('y1', String(from.y));
    line.setAttribute('x2', String(to.x));
    line.setAttribute('y2', String(to.y));
    line.setAttribute('class', 'na-times-match-line');
    line.style.setProperty('--match-color', color);
    svg.appendChild(line);
  };

  const clearTimesMatchSelection = (board) => {
    board?.querySelectorAll('.na-times-match-card.is-selected').forEach((card) => card.classList.remove('is-selected'));
    if (board) {
      delete board.dataset.selectedSide;
      delete board.dataset.selectedTotal;
      delete board.dataset.selectedGroup;
    }
  };

  const completeTimesMatchQuestion = () => {
    if (state.locked || state.question?.inputMode !== 'times-match') return;
    state.locked = true;
    recordSubmittedResponse(Array.from(els.visual.querySelectorAll('[data-match-side="expression"].is-matched')).map((item) => ({ group: item.dataset.matchGroup, total: item.dataset.matchTotal })), true, state.question.data?.pairs);
    state.correct += 1;
    state.responseTimes.push(performance.now() - state.questionStartedAt);
    els.scoreChip.textContent = `정답 ${state.correct}`;
    els.feedback.textContent = state.question.explain;
    playTone('correct');
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
    state.autoAdvanceTimer = setTimeout(() => {
      state.autoAdvanceTimer = null;
      nextQuestion();
    }, 850);
  };

  const handleTimesMatchTarget = (card) => {
    if (!card || state.question?.inputMode !== 'times-match' || state.locked) return;
    const board = getTimesMatchBoard();
    if (!board || card.classList.contains('is-matched')) return;
    const side = card.dataset.matchSide;
    const total = Number(card.dataset.matchTotal);
    if (!side || !Number.isFinite(total)) return;
    const selectedSide = board.dataset.selectedSide;
    const selectedTotal = Number(board.dataset.selectedTotal);
    const selectedGroup = board.dataset.selectedGroup || '';
    if (!selectedSide || selectedSide === side) {
      clearTimesMatchSelection(board);
      card.classList.add('is-selected');
      board.dataset.selectedSide = side;
      board.dataset.selectedTotal = String(total);
      board.dataset.selectedGroup = card.dataset.matchGroup || '';
      return;
    }
    const selectedSelector = selectedSide === 'expression'
      ? `[data-match-side="expression"][data-match-group="${CSS.escape(selectedGroup)}"]`
      : `[data-match-side="answer"][data-match-total="${CSS.escape(String(selectedTotal))}"]`;
    const selectedCard = board.querySelector(selectedSelector);
    if (!selectedCard) {
      clearTimesMatchSelection(board);
      return;
    }
    if (selectedTotal !== total) {
      recordSubmittedResponse({ selectedTotal, total }, false, selectedTotal);
      state.wrong += 1;
      els.scoreChip.textContent = `정답 ${state.correct}`;
      els.feedback.textContent = '다시 확인해요. 곱셈식의 답을 계산해 보세요.';
      card.classList.add('is-wrong');
      selectedCard.classList.add('is-wrong');
      board.classList.remove('is-shake');
      void board.offsetWidth;
      board.classList.add('is-shake');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        selectedCard.classList.remove('is-wrong');
        board.classList.remove('is-shake');
      }, 420);
      clearTimesMatchSelection(board);
      playTone('wrong');
      if (navigator.vibrate) navigator.vibrate(160);
      return;
    }
    const order = Number(board.dataset.matchedCount || 0);
    const color = getDotConnectColor(order);
    card.classList.add('is-matched');
    selectedCard.classList.add('is-matched');
    card.style.setProperty('--match-color', color);
    selectedCard.style.setProperty('--match-color', color);
    card.setAttribute('aria-pressed', 'true');
    selectedCard.setAttribute('aria-pressed', 'true');
    const expressionCard = side === 'expression' ? card : selectedCard;
    const answerCard = side === 'answer' ? card : selectedCard;
    drawTimesMatchLine(expressionCard, answerCard, board, color);
    board.dataset.matchedCount = String(order + 1);
    clearTimesMatchSelection(board);
    els.feedback.textContent = `${total}과 연결했어요.`;
    playPianoNote(order);
    const totalPairs = Array.isArray(state.question.data?.pairs) ? state.question.data.pairs.length : 4;
    if (order + 1 >= totalPairs) completeTimesMatchQuestion();
  };

  const completeMeasurePaintQuestion = () => {
    if (state.locked || state.question?.inputMode !== 'measure-paint') return;
    state.locked = true;
    recordSubmittedResponse(Array.from(els.visual.querySelectorAll('[data-measure-paint-value].is-counted')).map((item) => Number(item.dataset.measurePaintValue)), true, state.question.data?.targetValue);
    state.correct += 1;
    state.responseTimes.push(performance.now() - state.questionStartedAt);
    els.scoreChip.textContent = `정답 ${state.correct}`;
    els.feedback.textContent = state.question.explain;
    playTone('correct');
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
    state.autoAdvanceTimer = setTimeout(() => {
      state.autoAdvanceTimer = null;
      nextQuestion();
    }, 850);
  };

  const handleMeasurePaintCell = (button) => {
    if (!button || state.question?.inputMode !== 'measure-paint' || state.locked) return;
    if (button.classList.contains('is-counted')) return;
    const target = Number(state.question.data?.targetValue || 0);
    const value = Number(button.dataset.measurePaintValue || 0);
    const nextValue = els.visual.querySelectorAll('[data-measure-paint-value].is-counted').length + 1;
    if (value !== nextValue) {
      button.classList.add('is-wrong');
      els.feedback.textContent = '왼쪽 첫 칸부터 차례대로 칠해보세요.';
      playTone('wrong');
      if (navigator.vibrate) navigator.vibrate(120);
      setTimeout(() => button.classList.remove('is-wrong'), 420);
      return;
    }
    button.classList.add('is-counted');
    button.setAttribute('aria-pressed', 'true');
    playNumberAudio(value);
    els.feedback.textContent = `${value}칸까지 칠했어요.`;
    if (value === target) {
      completeMeasurePaintQuestion();
    }
  };

  const getDotConnectBoard = () => els.visual.querySelector('[data-dot-connect-board]');

  const getDotConnectCenter = (dot, board) => {
    const dotRect = dot.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    return {
      x: dotRect.left + dotRect.width / 2 - boardRect.left,
      y: dotRect.top + dotRect.height / 2 - boardRect.top
    };
  };

  const getDotConnectColor = (order = 0) => {
    const colors = [
      '#22c55e',
      '#3b82f6',
      '#f97316',
      '#a855f7',
      '#ef4444',
      '#14b8a6',
      '#eab308',
      '#ec4899',
      '#6366f1',
      '#84cc16'
    ];
    return colors[Math.max(0, Number(order) || 0) % colors.length];
  };

  const drawDotConnectLine = (fromDot, toDot, board) => {
    const svg = board.querySelector('[data-dot-connect-lines]');
    if (!svg || !fromDot || !toDot) return;
    const boardRect = board.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${Math.max(1, boardRect.width)} ${Math.max(1, boardRect.height)}`);
    const from = getDotConnectCenter(fromDot, board);
    const to = getDotConnectCenter(toDot, board);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(from.x));
    line.setAttribute('y1', String(from.y));
    line.setAttribute('x2', String(to.x));
    line.setAttribute('y2', String(to.y));
    line.setAttribute('class', 'na-times-two-connect-line');
    line.style.setProperty('--connect-color', toDot.style.getPropertyValue('--connect-color') || getDotConnectColor(toDot.dataset.dotOrder));
    svg.appendChild(line);
  };

  const completeDotConnectQuestion = () => {
    if (state.locked || state.question?.inputMode !== 'dot-connect') return;
    state.locked = true;
    recordSubmittedResponse(Array.from(els.visual.querySelectorAll('[data-dot-value].is-connected')).map((item) => Number(item.dataset.dotValue)), true, state.question.data?.sequence);
    state.correct += 1;
    state.responseTimes.push(performance.now() - state.questionStartedAt);
    els.scoreChip.textContent = `정답 ${state.correct}`;
    els.feedback.textContent = state.question.explain;
    playTone('correct');
    if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
    state.autoAdvanceTimer = setTimeout(() => {
      state.autoAdvanceTimer = null;
      nextQuestion();
    }, 900);
  };

  const handleDotConnectTarget = (dot) => {
    if (!dot || state.question?.inputMode !== 'dot-connect' || state.locked) return;
    const board = getDotConnectBoard();
    const sequence = Array.isArray(state.question.data?.sequence) ? state.question.data.sequence.map(Number) : [];
    const nextIndex = Number(board?.dataset?.nextIndex || 0);
    const expected = sequence[nextIndex];
    const value = Number(dot.dataset.dotValue);
    if (!board || !Number.isFinite(value) || !Number.isFinite(expected)) return;
    if (dot.classList.contains('is-connected')) return;
    if (value !== expected) {
      recordSubmittedResponse(value, false, expected);
      state.wrong += 1;
      els.scoreChip.textContent = `정답 ${state.correct}`;
      els.feedback.textContent = `${expected}을 찾아 이어보세요.`;
      dot.classList.remove('is-wrong');
      void dot.offsetWidth;
      dot.classList.add('is-wrong');
      board.classList.remove('is-shake');
      void board.offsetWidth;
      board.classList.add('is-shake');
      window.setTimeout(() => {
        dot.classList.remove('is-wrong');
        board.classList.remove('is-shake');
      }, 420);
      playTone('wrong');
      if (navigator.vibrate) navigator.vibrate(160);
      return;
    }
    const previousDot = nextIndex > 0
      ? board.querySelector(`[data-dot-order="${nextIndex - 1}"]`)
      : null;
    dot.classList.add('is-connected');
    dot.dataset.dotOrder = String(nextIndex);
    dot.style.setProperty('--connect-color', getDotConnectColor(nextIndex));
    dot.setAttribute('aria-pressed', 'true');
    if (previousDot) drawDotConnectLine(previousDot, dot, board);
    board.dataset.nextIndex = String(nextIndex + 1);
    const progress = board.querySelector('[data-dot-connect-progress]');
    if (progress) {
      progress.textContent = nextIndex + 1 >= sequence.length
        ? '완성했어요.'
        : `다음: ${sequence[nextIndex + 1]}`;
    }
    els.feedback.textContent = `${value}까지 연결했어요.`;
    playPianoNote(nextIndex);
    if (nextIndex + 1 >= sequence.length) {
      completeDotConnectQuestion();
    }
  };

  const renderTimedDrillIntro = () => {
    clearAutoAdvanceTimer();
    clearTimedDrillTimer();
    state.locked = false;
    const selectedCount = Number(state.timedDrill?.selectedCount || 10);
    els.roundChip.textContent = '준비';
    els.scoreChip.hidden = false;
    els.scoreChip.textContent = '시간 0:00';
    els.taskTitle.textContent = state.stage.title;
    els.taskSubtitle.textContent = state.stage.subtitle;
    els.prompt.textContent = `${state.stage.title} 문항 수를 선택하세요.`;
    els.instruction.innerHTML = '';
    els.gameView.classList.remove('is-clock-keypad-mode', 'is-number-keypad-mode', 'is-dot-connect-mode', 'is-times-match-mode', 'is-money-builder-mode', 'is-measure-paint-mode', 'is-times-table-overview-mode', 'is-times-table-practice-mode');
    els.gameView.classList.add('is-timed-drill-intro-mode');
    els.visual.classList.remove('is-number-line-correct');
    els.visual.innerHTML = `
      <div class="number-agency-manipulative na-times-drill-intro" role="group" aria-label="${escapeHtml(state.stage.title)} 문항 수 선택">
        <div class="na-times-drill-intro-card">
          <strong>${escapeHtml(state.stage.title)}</strong>
          <p>시작 버튼을 누르면 타이머가 흐르고, 결과에서 전체 시간과 문항별 풀이 시간을 확인합니다.</p>
          <div class="na-times-drill-counts" aria-label="문항 수">
            ${TIMED_MULTIPLICATION_COUNTS.map((count) => `
              <button type="button" class="na-times-drill-count${count === selectedCount ? ' is-selected' : ''}" data-times-drill-count="${count}" aria-pressed="${count === selectedCount ? 'true' : 'false'}">${count}문항</button>
            `).join('')}
          </div>
          <button type="button" class="na-times-drill-start" data-times-drill-start="true">시작</button>
        </div>
      </div>
    `;
    els.choiceGrid.innerHTML = '';
    els.answerSlot.hidden = true;
    els.feedback.textContent = '';
    els.nextButton.hidden = true;
    if (els.listenButton) els.listenButton.hidden = true;
    if (els.previousButton) els.previousButton.hidden = true;
  };

  const placeFractionLessonNavigation = () => {
    const isFractionLesson = state.activity?.id === 'number-fraction-share' && state.question?.layoutMode === 'fraction-lesson';
    const actionsParent = els.defaultActionsParent || els.nextButton?.parentNode;
    if (!els.defaultActionsParent && actionsParent) els.defaultActionsParent = actionsParent;

    if (!isFractionLesson) {
      if (els.defaultActionsParent && els.nextButton?.parentNode !== els.defaultActionsParent) {
        if (els.nextButton) els.defaultActionsParent.appendChild(els.nextButton);
        if (els.previousButton && els.nextButton) {
          els.defaultActionsParent.insertBefore(els.previousButton, els.nextButton);
        } else if (els.previousButton) {
          els.defaultActionsParent.appendChild(els.previousButton);
        }
      }
      return;
    }

    const previousSlot = els.visual.querySelector('[data-fraction-nav-slot="prev"]');
    const nextSlot = els.visual.querySelector('[data-fraction-nav-slot="next"]');
    if (previousSlot && els.previousButton) previousSlot.appendChild(els.previousButton);
    if (nextSlot && els.nextButton) nextSlot.appendChild(els.nextButton);
  };

  const setTimedDrillCount = (count) => {
    if (!isTimedMultiplicationStage() || !state.timedDrill || state.timedDrill.startedAt) return;
    state.timedDrill.selectedCount = TIMED_MULTIPLICATION_COUNTS.includes(Number(count)) ? Number(count) : 10;
    renderTimedDrillIntro();
  };

  const startTimedDrill = () => {
    if (!isTimedMultiplicationStage() || !state.timedDrill || state.timedDrill.startedAt) return;
    const questionCount = TIMED_MULTIPLICATION_COUNTS.includes(Number(state.timedDrill.selectedCount)) ? Number(state.timedDrill.selectedCount) : 10;
    state.timedDrill = {
      selectedCount: questionCount,
      questionCount,
      orientation: state.stage.params?.orientation === 'vertical' ? 'vertical' : 'horizontal',
      questionGroups: buildTimedMultiplicationGroups(questionCount),
      startedAt: performance.now(),
      completedAt: 0,
      records: []
    };
    state.questionIndex = 0;
    state.correct = 0;
    state.wrong = 0;
    state.responseTimes = [];
    state.questionLogs = [];
    state.resultRecorded = false;
    state.stageQuestionOrder = Array.from({ length: questionCount }, (_, index) => index);
    els.gameView.classList.remove('is-timed-drill-intro-mode');
    startTimedDrillTimer();
    renderQuestion();
  };

  const ensureTimedDrillRecord = () => {
    if (!isTimedDrillRunning() || !state.question || state.question.inputMode !== 'number-keypad') return null;
    const records = state.timedDrill.records;
    if (!records[state.questionIndex]) {
      const factor = Number(state.question.data?.factor || state.stage.params?.factor || 0);
      const groups = Number(state.question.data?.groups || 0);
      records[state.questionIndex] = {
        index: state.questionIndex + 1,
        factor,
        groups,
        expression: `${factor} x ${groups}`,
        answer: Number(state.question.answer),
        orientation: state.timedDrill.orientation,
        attempts: 0,
        wrongAnswers: [],
        wasWrong: false,
        startedAtMs: Math.max(0, Math.round(performance.now() - state.timedDrill.startedAt)),
        durationMs: 0,
        status: '진행'
      };
    }
    return records[state.questionIndex];
  };

  const recordTimedDrillAnswer = (valueText, isCorrect) => {
    const record = ensureTimedDrillRecord();
    if (!record) return;
    record.attempts += 1;
    const parsed = Number(valueText);
    if (!isCorrect) {
      record.wasWrong = true;
      record.wrongAnswers.push(Number.isFinite(parsed) ? parsed : valueText);
      record.status = '오답 후 재시도';
      return;
    }
    record.durationMs = Math.max(0, Math.round(performance.now() - state.questionStartedAt));
    record.completedAtMs = Math.max(0, Math.round(performance.now() - state.timedDrill.startedAt));
    record.status = record.wasWrong ? '오답' : '정답';
  };

  const renderQuestion = () => {
    clearAutoAdvanceTimer();
    stopTeachingAudio();
    state.locked = false;
    state.question = makeQuestion();
    state.questionStartedAt = performance.now();
    const compareBalance = isCompareBalanceActivity();
    const activeQuestionCount = getActiveQuestionCount();
    const isTimesTableStage = state.activity?.id?.startsWith('number-times-') && state.stage?.params?.ask === 'multiplicationTableTriple';
    const isTimesTableOverview = Boolean(isTimesTableStage && state.question.teaching && state.question.visual === 'times-two-table');
    const isTimesTablePractice = Boolean(isTimesTableStage && state.question.inputMode === 'number-keypad' && state.question.visual === 'times-two-triple');
    els.roundChip.textContent = `${state.questionIndex + 1} / ${activeQuestionCount}`;
    els.scoreChip.textContent = isTimedDrillRunning()
      ? `시간 ${formatElapsedTime(performance.now() - state.timedDrill.startedAt)}`
      : `정답 ${state.correct}`;
    els.scoreChip.hidden = Boolean(state.question.teaching) || isTeachingOnlyMoneyStage() || state.question.layoutMode === 'fraction-lesson';
    els.taskTitle.textContent = state.stage.title;
    els.taskSubtitle.textContent = state.stage.subtitle;
    els.gameView.classList.remove('is-times-table-overview-mode', 'is-times-table-practice-mode');
    els.gameView.classList.toggle('is-clock-keypad-mode', state.question.inputMode === 'clock-keypad');
    els.gameView.classList.toggle('is-number-keypad-mode', state.question.inputMode === 'number-keypad');
    els.gameView.classList.toggle('is-dot-connect-mode', state.question.inputMode === 'dot-connect');
    els.gameView.classList.toggle('is-times-match-mode', state.question.inputMode === 'times-match');
    els.gameView.classList.toggle('is-times-table-overview-mode', isTimesTableOverview);
    els.gameView.classList.toggle('is-times-table-practice-mode', isTimesTablePractice);
    els.gameView.classList.toggle('is-timed-drill-mode', isTimedDrillRunning());
    els.gameView.classList.remove('is-timed-drill-intro-mode');
    els.gameView.classList.toggle('is-money-builder-mode', state.question.inputMode === 'money-builder');
    els.gameView.classList.toggle('is-measure-paint-mode', state.question.inputMode === 'measure-paint');
    els.gameView.classList.toggle('is-metric-choice-mode', state.question.layoutMode === 'metric-choice');
    els.gameView.classList.toggle('is-measure-choice-mode', state.question.layoutMode === 'measure-choice');
    els.gameView.classList.toggle('is-fraction-lesson-mode', state.question.layoutMode === 'fraction-lesson');
    els.gameView.classList.toggle('is-fraction-count-mode', state.question.layoutMode === 'fraction-count');
    els.gameView.classList.toggle('is-fraction-find-mode', state.question.layoutMode === 'fraction-find');
    els.prompt.classList.remove('is-clock-teaching-readout');
    if (state.question.teachingReadout) {
      els.prompt.classList.add('is-clock-teaching-readout');
      els.prompt.innerHTML = `
        <span>${escapeHtml(state.question.teachingReadout.digital)}</span>
        <strong>${escapeHtml(state.question.teachingReadout.korean)}</strong>
      `;
      els.instruction.textContent = '';
    } else if (state.question.layoutMode === 'measure-choice') {
      els.prompt.textContent = '';
      els.instruction.textContent = '';
    } else {
      els.prompt.textContent = state.question.prompt;
      els.instruction.innerHTML = state.activity?.id?.startsWith('number-times-')
        ? ''
        : sentenceBreakHtml(state.question.instruction || '');
    }
    const renderer = visualRenderers[state.question.visual] || (() => '');
    els.visual.classList.remove('is-number-line-correct');
    els.visual.innerHTML = renderer(state.question);
    const isTeaching = Boolean(state.question.teaching);
    const isClockKeypad = state.question.inputMode === 'clock-keypad';
    const isNumberKeypad = state.question.inputMode === 'number-keypad';
    const isDotConnect = state.question.inputMode === 'dot-connect';
    const isTimesMatch = state.question.inputMode === 'times-match';
    const isMoneyBuilder = state.question.inputMode === 'money-builder';
    const isMeasurePaint = state.question.inputMode === 'measure-paint';
    const numberLine = isNumberLineActivity();
    state.keypad = isClockKeypad
      ? { phase: 'hour', input: '', hourValue: null, minuteValue: null }
      : isNumberKeypad
      ? { input: '' }
      : null;
    state.moneyBuilder = isMoneyBuilder
      ? { target: Number(state.question.data?.target || 0), total: 0, items: [] }
      : null;
    const choiceVisuals = state.question.choiceVisuals || null;
    els.choiceGrid.classList.toggle('is-clock-keypad-grid', isClockKeypad);
    els.choiceGrid.classList.toggle('is-number-keypad-grid', isNumberKeypad);
    els.choiceGrid.classList.toggle('is-money-builder-grid', isMoneyBuilder);
    els.choiceGrid.classList.toggle('is-measure-paint-grid', isMeasurePaint);
    els.choiceGrid.classList.toggle('is-metric-choice-grid', state.question.layoutMode === 'metric-choice');
    els.choiceGrid.classList.toggle('is-measure-choice-grid', state.question.layoutMode === 'measure-choice');
    els.choiceGrid.classList.toggle('is-measure-color-box-grid', state.question.choiceStyle === 'measure-color-box');
    els.choiceGrid.classList.toggle('is-visual-choice-grid', Boolean(choiceVisuals));
    els.choiceGrid.innerHTML = isClockKeypad
      ? renderClockKeypadControls()
      : isNumberKeypad
      ? renderNumberKeypadControls()
      : isDotConnect
      ? ''
      : isTimesMatch
      ? ''
      : isMoneyBuilder
      ? renderMoneyBuilderControls()
      : isMeasurePaint
      ? ''
      : isTeaching
      ? ''
      : state.question.choices.map((choice) => {
      const visualChoice = choiceVisuals?.[choice];
      const clickOnly = state.question.layoutMode === 'measure-choice' || state.activity?.id === 'number-fraction-share';
      const draggable = clickOnly ? 'false' : 'true';
      const colorBoxChoice = state.question.choiceStyle === 'measure-color-box';
      return `
      <button type="button" class="number-agency-choice${compareBalance ? ' is-compare-symbol-choice' : ''}${visualChoice ? ' is-visual-choice' : ''}${colorBoxChoice ? ' is-measure-color-box-choice' : ''}" draggable="${draggable}" data-choice="${escapeHtml(choice)}" aria-label="${escapeHtml(choice)} 선택">${visualChoice || escapeHtml(choice)}</button>
    `;
    }).join('');
    els.answerSlot.textContent = state.question.layoutMode === 'measure-choice' || numberLine ? '' : '보기 카드를 클릭하거나 이 빈칸으로 끌어오세요.';
    els.answerSlot.dataset.choice = '';
    els.answerSlot.classList.remove('is-ready', 'is-dragover', 'is-correct', 'is-wrong');
    els.answerSlot.hidden = compareBalance || numberLine || isTeaching || isClockKeypad || isNumberKeypad || isDotConnect || isTimesMatch || isMoneyBuilder || isMeasurePaint || state.question.layoutMode === 'measure-choice' || state.activity?.id === 'number-fraction-share';
    els.feedback.textContent = '';
    els.nextButton.hidden = !isTeaching;
    els.nextButton.textContent = state.questionIndex + 1 >= activeQuestionCount ? '완료' : '다음';
    if (els.listenButton) {
      els.listenButton.hidden = !(state.question.narrationSrc || state.question.narrationText);
      els.listenButton.disabled = false;
      els.listenButton.textContent = '다시 듣기';
    }
    if (els.narrationTextPanel) {
      const shouldShowNarrationText = isEstimateJarActivity() && isTeaching && Boolean(state.question.narrationText);
      els.narrationTextPanel.hidden = !shouldShowNarrationText;
      els.gameView.classList.toggle('is-teaching-audio-mode', shouldShowNarrationText);
      if (shouldShowNarrationText) {
        els.narrationTextBody.textContent = state.question.narrationText;
      } else {
        els.narrationTextBody.textContent = '';
      }
    }
    if (els.previousButton) {
      els.previousButton.hidden = !isTeaching || isTimesTableOverview;
      els.previousButton.disabled = state.questionIndex === 0;
    }
    placeFractionLessonNavigation();
    if (isClockKeypad) updateClockKeypadUi();
    if (isNumberKeypad) updateNumberKeypadUi();
    if (isMoneyBuilder) updateMoneyBuilderUi();
    updateEstimateLooseCounting();
    els.visual.classList.remove('number-agency-pulse');
    void els.visual.offsetWidth;
    els.visual.classList.add('number-agency-pulse');
    if (state.activity?.id === 'number-clock-time') {
      requestAnimationFrame(() => {
        els.gameView?.scrollIntoView({ block: 'start' });
      });
    }
    if (state.question.narrationSrc || state.question.narrationText) {
      window.setTimeout(playTeachingAudio, 80);
    }
  };

  const startStage = (stageId) => {
    clearAutoAdvanceTimer();
    clearTimedDrillTimer();
    stopNumberAudio();
    stopTeachingAudio();
    const stage = state.activity.stages.find((item) => item.id === stageId) || state.activity.stages[0];
    state.stage = stage;
    state.sessionId = `number-agency:${state.activity.id}:${window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    state.questionIndex = 0;
    state.correct = 0;
    state.wrong = 0;
    state.startedAt = performance.now();
    state.responseTimes = [];
    state.questionLogs = [];
    state.resultRecorded = false;
    state.stageQuestionOrder = shuffle(Array.from({ length: stage.questionCount }, (_, index) => index));
    state.timedDrill = stage.params?.timedDrill ? { selectedCount: 10, startedAt: 0, records: [] } : null;
    els.stageLabel.textContent = `${stage.order}단계`;
    setView('gameView');
    if (stage.params?.timedDrill) {
      renderTimedDrillIntro();
      return;
    }
    renderQuestion();
  };

  const formatSeconds = (milliseconds) => `${(Math.max(0, Number(milliseconds || 0)) / 1000).toFixed(1)}초`;

  const buildTimedDrillResult = () => {
    const drill = state.timedDrill || {};
    const records = Array.from({ length: Number(drill.questionCount || 0) || 0 }, (_, index) => {
      const record = drill.records?.[index] || {};
      const factor = Number(record.factor || state.stage.params?.factor || 0);
      const groups = Number(record.groups || drill.questionGroups?.[index] || 0);
      const answer = Number(record.answer || factor * groups || 0);
      return {
        index: index + 1,
        factor,
        groups,
        expression: record.expression || `${factor} x ${groups}`,
        answer,
        orientation: record.orientation || drill.orientation || state.stage.params?.orientation || 'horizontal',
        attempts: Math.max(1, Number(record.attempts || 1)),
        wrongAnswers: Array.isArray(record.wrongAnswers) ? record.wrongAnswers : [],
        wasWrong: Boolean(record.wasWrong),
        status: record.wasWrong ? '오답' : '정답',
        durationMs: Math.max(0, Math.round(Number(record.durationMs || 0))),
        completedAtMs: Math.max(0, Math.round(Number(record.completedAtMs || 0)))
      };
    });
    const totalQuestions = records.length;
    const wrongOnceCount = records.filter((record) => record.wasWrong).length;
    const firstTryCount = Math.max(0, totalQuestions - wrongOnceCount);
    const totalDurationMs = Math.max(0, Math.round((drill.completedAt || performance.now()) - (drill.startedAt || performance.now())));
    const averageQuestionMs = records.length
      ? Math.round(records.reduce((sum, record) => sum + record.durationMs, 0) / records.length)
      : 0;
    return {
      type: 'timed_multiplication',
      stageTitle: state.stage.title,
      factor: Number(state.stage.params?.factor || 0),
      orientation: drill.orientation || state.stage.params?.orientation || 'horizontal',
      totalQuestions,
      firstTryCount,
      wrongOnceCount,
      totalDurationMs,
      totalDurationSeconds: Number((totalDurationMs / 1000).toFixed(2)),
      averageQuestionMs,
      averageQuestionSeconds: Number((averageQuestionMs / 1000).toFixed(2)),
      records
    };
  };

  const renderTimedDrillResult = (drillResult) => {
    const accuracy = drillResult.totalQuestions
      ? Math.round((drillResult.firstTryCount / drillResult.totalQuestions) * 100)
      : 0;
    updateResultMode('result');
    els.resultTitle.textContent = `${state.stage.title} 결과`;
    els.resultSummary.textContent = `${drillResult.totalQuestions}문항을 ${formatElapsedTime(drillResult.totalDurationMs)}에 풀었어요. 한 번이라도 틀린 문항은 오답으로 표시했습니다.`;
    els.resultStats.hidden = false;
    els.resultStats.innerHTML = `
      <div class="number-agency-result-stat"><span>전체 시간</span><strong>${formatElapsedTime(drillResult.totalDurationMs)}</strong></div>
      <div class="number-agency-result-stat"><span>첫 시도 정답</span><strong>${drillResult.firstTryCount}</strong></div>
      <div class="number-agency-result-stat"><span>오답 문항</span><strong>${drillResult.wrongOnceCount}</strong></div>
      <div class="number-agency-result-stat"><span>평균 문항</span><strong>${formatSeconds(drillResult.averageQuestionMs)}</strong></div>
      <div class="na-times-drill-result">
        <div class="na-times-drill-result-head">
          <span>문항</span>
          <span>식</span>
          <span>정답</span>
          <span>판정</span>
          <span>정답까지</span>
          <span>시간</span>
        </div>
        ${drillResult.records.map((record) => `
          <div class="na-times-drill-result-row${record.wasWrong ? ' is-wrong' : ' is-correct'}">
            <span>${record.index}</span>
            <span>${escapeHtml(record.expression)}</span>
            <span>${record.answer}</span>
            <span>${record.wasWrong ? '오답' : '정답'}</span>
            <span>${record.attempts}번</span>
            <span>${formatSeconds(record.durationMs)}</span>
          </div>
        `).join('')}
      </div>
    `;
    if (els.reportOpinion) {
      els.reportOpinion.textContent = '';
      els.reportOpinion.hidden = true;
    }
    return accuracy;
  };

  const finishStage = () => {
    clearAutoAdvanceTimer();
    if (isTimedDrillRunning()) {
      state.timedDrill.completedAt = performance.now();
    }
    clearTimedDrillTimer();
    stopNumberAudio();
    stopTeachingAudio();
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.hide === 'function') {
      window.HahaFeedbackOverlay.hide();
    }
    const total = state.correct + state.wrong;
    if (isTeachingOnlyMoneyStage()) {
      updateResultMode('complete');
      els.resultTitle.textContent = `${state.stage.title} 학습 완료`;
      els.resultSummary.textContent = '설명을 끝까지 살펴봤어요. 같은 내용을 다시 보거나 다른 스테이지로 이동할 수 있어요.';
      els.resultStats.innerHTML = '';
      if (els.reportOpinion) {
        els.reportOpinion.textContent = '';
        els.reportOpinion.hidden = true;
      }
      setView('resultView');
      return;
    }
    if (isTimedMultiplicationStage() && state.timedDrill?.startedAt) {
      const drillResult = buildTimedDrillResult();
      const accuracy = renderTimedDrillResult(drillResult);
      recordResult({
        total: drillResult.totalQuestions,
        accuracy,
        avg: drillResult.averageQuestionSeconds,
        passed: accuracy >= 75,
        timedDrillResult: drillResult
      });
      setView('resultView');
      return;
    }
    updateResultMode('result');
    const accuracy = total ? Math.round((state.correct / total) * 100) : 0;
    const avg = state.responseTimes.length
      ? (state.responseTimes.reduce((sum, value) => sum + value, 0) / state.responseTimes.length / 1000)
      : 0;
    const passed = accuracy >= 75;
    els.resultTitle.textContent = `${state.stage.title} 완료`;
    els.resultSummary.textContent = `${total}문항 중 ${state.correct}문항을 정확하게 수행했어요.`;
    els.resultStats.innerHTML = [
      ['정확도', `${accuracy}%`],
      ['정답', state.correct],
      ['오답', state.wrong],
      ['평균 반응', `${avg.toFixed(1)}초`]
    ].map(([label, value]) => `<div class="number-agency-result-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
    if (els.reportOpinion) {
      els.reportOpinion.textContent = '';
      els.reportOpinion.hidden = true;
    }
    recordResult({ total, accuracy, avg, passed });
    setView('resultView');
  };

  const buildNumberLabGuardianSummary = () => {
    return '이번 숫자 활동에서는 정답 흐름과 참여 상태가 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.';
  };

  const buildNumberLabTeacherReviewNote = () => {
    return `NumberLab 결과는 수 개념, 선택적 주의, 반응 정확도를 함께 보는 참고 기록입니다. 다음 활동과 난이도는 담당 선생님이 내담자의 컨디션과 수업 맥락을 함께 확인해 조정합니다.`;
  };

  const buildNumberLabReportDisplayModes = ({ guardianSummary, teacherReviewNote } = {}) => ({
    guardian: {
      label: '보호자 공유',
      summary: String(guardianSummary || '').trim()
    },
    teacher: {
      label: '전문가 분석',
      summary: String(teacherReviewNote || '').trim()
    }
  });

  const recordResult = ({ total, accuracy, avg, passed, timedDrillResult = null }) => {
    if (state.resultRecorded) return;
    const firstResponses = state.questionLogs.filter((item) => item.attemptIndex === 1);
    const firstTryRate = firstResponses.length
      ? Math.round(firstResponses.filter((item) => item.correct).length / firstResponses.length * 100)
      : null;
    const guardianSummary = buildNumberLabGuardianSummary({ total, accuracy });
    const teacherReviewNote = buildNumberLabTeacherReviewNote();
    const actionPlanSummary = '다음 숫자 활동은 자동 확정하지 않고 선생님 검토 후 조정합니다.';
    const reportDisplayModes = buildNumberLabReportDisplayModes({ guardianSummary, teacherReviewNote });
    const effectiveCorrectCount = timedDrillResult ? timedDrillResult.firstTryCount : state.correct;
    const effectiveWrongCount = timedDrillResult ? timedDrillResult.wrongOnceCount : state.wrong;
    const timedMetadata = timedDrillResult ? {
      report_type: 'number_timed_multiplication',
      timed_drill_type: timedDrillResult.type,
      timed_drill_orientation: timedDrillResult.orientation,
      timed_drill_factor: timedDrillResult.factor,
      timed_drill_total_seconds: timedDrillResult.totalDurationSeconds,
      timed_drill_average_seconds: timedDrillResult.averageQuestionSeconds,
      timed_drill_first_try_count: timedDrillResult.firstTryCount,
      timed_drill_wrong_once_count: timedDrillResult.wrongOnceCount,
      timed_drill_records: timedDrillResult.records
    } : {};
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === 'function') {
      window.HahaLabLearningHarness.recordSession({
        sessionId: state.sessionId,
        labKind: 'numberlab',
        reportScope: 'numberlab',
        saveToClientReport: true,
        curriculumKey: state.activity.id,
        stageKey: state.stage.id,
        stageTitle: state.stage.title,
        labTitle: `NumberLab ${state.activity.title}`,
        totalQuestions: total,
        correctCount: effectiveCorrectCount,
        wrongCount: effectiveWrongCount,
        score: accuracy,
        accuracyScore: accuracy,
        durationSeconds: (performance.now() - (state.startedAt || performance.now())) / 1000,
        startedAtMs: Date.now() - (performance.now() - (state.startedAt || performance.now())),
        reportType: 'number',
        reportInput: {
          reportEvidenceMode: 'observed-only',
          reportType: 'number',
          reportScope: 'numberlab',
          title: state.activity.title,
          stageTitle: state.stage.title,
          totalItems: total,
          totalQuestions: total,
          correctCount: effectiveCorrectCount,
          wrongCount: effectiveWrongCount,
          accuracyRate: accuracy,
          completionCount: state.questionLogs.filter((item) => item.correct).length,
          firstTryRate,
          elapsedMs: timedDrillResult?.totalDurationMs ?? performance.now() - state.startedAt,
          questionLogs: state.questionLogs.map((item) => JSON.parse(JSON.stringify(item))),
          measurementContext: {
            taskVersion: '20261104-agency-raw-1',
            countUnit: timedDrillResult ? 'timed-item' : 'submitted-answer-attempt',
            rawLogUnit: 'submitted-answer-attempt',
            firstTryDenominator: 'distinct-rendered-question',
            timingSource: 'performance-now',
            timingOrigin: 'question-render',
            retryTimingExcluded: true,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
          }
        },
        summary: `${state.activity.title} ${state.stage.title}에서 ${state.activity.categoryTitle} 과제를 수행했습니다.`,
        overview: `${state.activity.title}은 ${state.activity.reportFocus} 영역을 중심으로 수 개념, 선택적 주의, 반응 정확도를 함께 확인하는 숫자랩 과제입니다.`,
        guardianSummary,
        teacherReviewNote,
        actionPlanSummary,
        actionPlanPolicy: 'teacher-review-required',
        reportDisplayModes,
        recommendations: [
          passed ? '현재 단계는 안정적으로 수행되어 다음 단계로 확장해도 좋습니다.' : '같은 스테이지를 한 번 더 반복하며 시각 단서를 충분히 확인하세요.',
          '오답 문항은 정답만 확인하지 않고 왜 그 답이 되는지 수량, 위치, 단위 기준을 말로 설명하게 해주세요.'
        ],
        focusKey: state.activity.id,
        focusLabel: state.activity.reportFocus,
        metadata: timedMetadata,
        details: {
          category_id: state.activity.id,
          category_title: state.activity.categoryTitle,
          stage_order: state.stage.order,
          average_response_seconds: Number(avg.toFixed(2)),
          passed,
          report_guardian_summary: guardianSummary,
          report_teacher_review_note: teacherReviewNote,
          report_action_plan_summary: actionPlanSummary,
          report_action_plan_policy: 'teacher-review-required',
          report_display_modes: reportDisplayModes,
          report_domain: state.activity.reportFocus,
          ...timedMetadata
        }
      });
    }
    // Guard both the common persistence path and local event history. A storage
    // quota failure must not make a second completion create another session.
    state.resultRecorded = true;
    const detail = {
      lab_kind: 'numberlab',
      category_id: state.activity.id,
      category_title: state.activity.categoryTitle,
      content_title: state.activity.title,
      stage_id: state.stage.id,
      stage_order: state.stage.order,
      stage_title: state.stage.title,
      total_questions: total,
      correct_count: effectiveCorrectCount,
      wrong_count: effectiveWrongCount,
      accuracy,
      average_response_seconds: Number(avg.toFixed(2)),
      passed,
      focus: state.activity.reportFocus,
      report_guardian_summary: guardianSummary,
      report_teacher_review_note: teacherReviewNote,
      report_action_plan_summary: actionPlanSummary,
      report_action_plan_policy: 'teacher-review-required',
      report_display_modes: reportDisplayModes,
      ...timedMetadata,
      completed_at: new Date().toISOString()
    };
    try {
      window.dispatchEvent(new CustomEvent('hahalab:learning-result', { detail }));
      const key = `hahalab.numberlab.agency.results:${state.activity.id}`;
      const rows = JSON.parse(localStorage.getItem(key) || '[]');
      rows.unshift(detail);
      localStorage.setItem(key, JSON.stringify(rows.slice(0, 30)));
    } catch (error) {
    }
  };

  const fillAnswerSlot = (choice) => {
    if (isCompareBalanceActivity()) return;
    els.answerSlot.textContent = choice;
    els.answerSlot.dataset.choice = choice;
    els.answerSlot.classList.add('is-ready');
  };

  const triggerNumberLineCorrectAnimation = () => {
    if (!isNumberLineActivity() || state.question?.visual !== 'numberline') return false;
    if (!state.question?.data?.correctAnimation) return false;
    els.visual.classList.remove('is-number-line-correct');
    void els.visual.offsetWidth;
    els.visual.classList.add('is-number-line-correct');
    return true;
  };

  const selectChoice = (button) => {
    if (state.locked || !button || button.disabled) return;
    state.locked = true;
    const estimateJar = state.activity?.id === 'number-estimate-jar';
    const rulerStudy = state.activity?.id === 'number-data-graph';
    const fractionShare = state.activity?.id === 'number-fraction-share';
    const measureCompare = state.activity?.id === 'number-measure-compare';
    const numberLine = isNumberLineActivity();
    const retryOnWrong = true;
    const choice = button.dataset.choice;
    fillAnswerSlot(choice);
    const isCorrect = String(choice) === String(state.question.answer);
    recordSubmittedResponse(choice, isCorrect);
    state.responseTimes.push(performance.now() - state.questionStartedAt);
    if (isCorrect) {
      state.correct += 1;
      button.classList.add('is-correct');
      els.answerSlot.classList.add('is-correct');
      els.feedback.textContent = state.question.explain;
      const hasNumberLineAnimation = triggerNumberLineCorrectAnimation();
      playTone('correct');
      window.setTimeout(() => {
        if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
      }, hasNumberLineAnimation ? 420 : 0);
      const shouldAutoAdvance = !state.question?.teaching;
      if (shouldAutoAdvance) {
        state.autoAdvanceTimer = setTimeout(() => {
          state.autoAdvanceTimer = null;
          nextQuestion();
        }, numberLine ? 1250 : estimateJar ? 1050 : 850);
      }
    } else {
      state.wrong += 1;
      button.classList.add('is-wrong');
      els.answerSlot.classList.add('is-wrong');
      if (!retryOnWrong) {
        const correctButton = Array.from(els.choiceGrid.querySelectorAll('.number-agency-choice'))
          .find((item) => String(item.dataset.choice) === String(state.question.answer));
        if (correctButton) correctButton.classList.add('is-correct');
      }
      els.feedback.textContent = estimateJar
        ? (state.question.wrongHint || '다시 확인해요. 지금 상황에 맞는 어림 방법을 한 번 더 생각해 보세요.')
        : state.activity?.id === 'number-clock-time'
        ? '다시 확인해요. 같은 문제를 한 번 더 풀어보세요.'
        : isCompareBalanceActivity()
        ? '다시 세어 보고 알맞은 기호를 찾아요.'
        : rulerStudy
        ? '다시 확인해요. 같은 문제를 한 번 더 풀어보세요.'
        : fractionShare
        ? '그림을 다시 보고 같은 음식과 조각 수를 찾아보세요.'
        : measureCompare
        ? '다시 세어 보고 같은 문제를 한 번 더 풀어보세요.'
        : `다시 확인해요. ${state.question.explain}`;
      playTone('wrong');
      if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('wrong', { sound: false });
      if (retryOnWrong) {
        setTimeout(() => {
          button.classList.remove('is-wrong');
          els.answerSlot.classList.remove('is-wrong');
          els.answerSlot.classList.remove('is-ready');
          els.answerSlot.textContent = numberLine ? '' : '보기 카드를 클릭하거나 이 빈칸으로 끌어오세요.';
          els.answerSlot.dataset.choice = '';
          if (estimateJar) resetEstimateLooseCounting();
          state.locked = false;
        }, estimateJar ? 780 : 520);
      }
    }
    els.scoreChip.textContent = `정답 ${state.correct}`;
    els.nextButton.hidden = true;
  };

  const nextQuestion = () => {
    clearAutoAdvanceTimer();
    stopTeachingAudio();
    if (state.questionIndex + 1 >= getActiveQuestionCount()) {
      finishStage();
      return;
    }
    state.questionIndex += 1;
    renderQuestion();
    if (isCompareBalanceActivity()) {
      window.requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  };

  const previousQuestion = () => {
    clearAutoAdvanceTimer();
    stopTeachingAudio();
    if (state.questionIndex <= 0) return;
    state.questionIndex -= 1;
    renderQuestion();
  };

  const initElements = () => {
    [
      'stageView', 'gameView', 'resultView', 'stageGrid', 'stageLabel', 'stageButton',
      'taskTitle', 'taskSubtitle', 'roundChip', 'scoreChip', 'visual', 'prompt',
      'instruction', 'choiceGrid', 'feedback', 'nextButton', 'retryButton', 'otherStageButton',
      'resultTitle', 'resultSummary', 'resultStats', 'reportOpinion'
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
    if (!els.answerSlot) {
      els.answerSlot = document.createElement('div');
      els.answerSlot.id = 'answerSlot';
      els.answerSlot.className = 'number-agency-answer-slot';
      els.answerSlot.setAttribute('role', 'button');
      els.answerSlot.setAttribute('tabindex', '0');
      els.answerSlot.setAttribute('aria-label', '정답을 넣는 빈칸');
      els.choiceGrid.parentNode.insertBefore(els.answerSlot, els.choiceGrid);
    }
    if (!els.narrationTextPanel && els.choiceGrid?.parentNode) {
      els.narrationTextPanel = document.createElement('section');
      els.narrationTextPanel.id = 'narrationTextPanel';
      els.narrationTextPanel.className = 'number-agency-narration-panel';
      els.narrationTextPanel.hidden = true;
      els.narrationTextPanel.setAttribute('aria-label', '음성 글');
      els.narrationTextPanel.innerHTML = '<strong class="number-agency-narration-label">음성 글</strong><p class="number-agency-narration-text"></p>';
      els.narrationTextBody = els.narrationTextPanel.querySelector('.number-agency-narration-text');
      els.choiceGrid.parentNode.insertBefore(els.narrationTextPanel, els.choiceGrid);
    }
    if (!els.previousButton && els.nextButton?.parentNode) {
      els.previousButton = document.createElement('button');
      els.previousButton.id = 'previousButton';
      els.previousButton.type = 'button';
      els.previousButton.className = 'number-agency-btn is-ghost';
      els.previousButton.textContent = '이전';
      els.previousButton.hidden = true;
      els.nextButton.parentNode.insertBefore(els.previousButton, els.nextButton);
    }
    els.defaultActionsParent = els.nextButton?.parentNode || null;
    if (!els.listenButton && els.nextButton?.parentNode) {
      els.listenButton = document.createElement('button');
      els.listenButton.id = 'listenButton';
      els.listenButton.type = 'button';
      els.listenButton.className = 'number-agency-btn is-audio';
      els.listenButton.textContent = '다시 듣기';
      els.listenButton.hidden = true;
      els.nextButton.parentNode.insertBefore(els.listenButton, els.previousButton || els.nextButton);
    }
  };

  const bindEvents = () => {
    els.stageGrid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-stage-id]');
      if (card) startStage(card.dataset.stageId);
    });
    els.choiceGrid.addEventListener('click', (event) => {
      const keypadButton = event.target.closest('.na-clock-keypad-button');
      if (keypadButton) {
        if (state.question?.inputMode === 'number-keypad') {
          handleNumberKeypadButton(keypadButton);
        } else {
          handleClockKeypadButton(keypadButton);
        }
        return;
      }
      const moneyButton = event.target.closest('[data-money-value], [data-money-action]');
      if (moneyButton && state.question?.inputMode === 'money-builder') {
        handleMoneyBuilderButton(moneyButton);
        return;
      }
      selectChoice(event.target.closest('.number-agency-choice'));
    });
    els.visual.addEventListener('click', (event) => {
      const timedCountButton = event.target.closest('[data-times-drill-count]');
      if (timedCountButton && isTimedMultiplicationStage()) {
        setTimedDrillCount(timedCountButton.dataset.timesDrillCount);
        return;
      }
      const timedStartButton = event.target.closest('[data-times-drill-start]');
      if (timedStartButton && isTimedMultiplicationStage()) {
        startTimedDrill();
        return;
      }
      const timesMatchTarget = event.target.closest('[data-match-side]');
      if (timesMatchTarget && state.question?.inputMode === 'times-match') {
        handleTimesMatchTarget(timesMatchTarget);
        return;
      }
      const dotConnectTarget = event.target.closest('[data-dot-value]');
      if (dotConnectTarget && state.question?.inputMode === 'dot-connect') {
        handleDotConnectTarget(dotConnectTarget);
        return;
      }
      if (isEstimateJarActivity()) {
        const looseTarget = event.target.closest('[data-estimate-loose-index]');
        if (looseTarget) {
          if (looseTarget.classList.contains('is-counted')) return;
          looseTarget.classList.add('is-counted');
          looseTarget.setAttribute('aria-pressed', 'true');
          playNumberAudio(looseTarget.dataset.estimateLooseIndex);
          updateEstimateLooseCounting();
          return;
        }
      }
      const measureCountTarget = event.target.closest('[data-measure-count-value]');
      if (measureCountTarget) {
        measureCountTarget.classList.add('is-counted');
        measureCountTarget.setAttribute('aria-pressed', 'true');
        playNumberAudio(measureCountTarget.dataset.measureCountValue);
        return;
      }
      const measurePaintTarget = event.target.closest('[data-measure-paint-value]');
      if (measurePaintTarget) {
        handleMeasurePaintCell(measurePaintTarget);
        return;
      }
      if (!isCompareBalanceActivity()) return;
      const dotTarget = event.target.closest('[data-compare-dot-value]');
      if (dotTarget) {
        dotTarget.classList.add('is-counted');
        dotTarget.setAttribute('aria-pressed', 'true');
        playNumberAudio(dotTarget.dataset.compareDotValue);
        return;
      }
      const countTarget = event.target.closest('[data-compare-count]');
      if (countTarget) playNumberAudio(countTarget.dataset.compareCount);
    });
    els.visual.addEventListener('pointerdown', (event) => {
      const dotConnectTarget = event.target.closest('[data-dot-value]');
      if (!dotConnectTarget || state.question?.inputMode !== 'dot-connect') return;
      const board = getDotConnectBoard();
      if (board) board.dataset.dragging = 'true';
      handleDotConnectTarget(dotConnectTarget);
    });
    els.visual.addEventListener('pointerover', (event) => {
      const dotConnectTarget = event.target.closest('[data-dot-value]');
      const board = getDotConnectBoard();
      if (!dotConnectTarget || state.question?.inputMode !== 'dot-connect' || board?.dataset.dragging !== 'true') return;
      handleDotConnectTarget(dotConnectTarget);
    });
    els.visual.addEventListener('pointermove', (event) => {
      const board = getDotConnectBoard();
      if (state.question?.inputMode !== 'dot-connect' || board?.dataset.dragging !== 'true') return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-dot-value]');
      if (target && els.visual.contains(target)) handleDotConnectTarget(target);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
      els.visual.addEventListener(eventName, () => {
        const board = getDotConnectBoard();
        if (board) board.dataset.dragging = 'false';
      });
    });
    els.choiceGrid.addEventListener('dragstart', (event) => {
      const button = event.target.closest('.number-agency-choice');
      if (!button || state.locked || button.disabled) {
        event.preventDefault();
        return;
      }
      button.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', button.dataset.choice || '');
    });
    els.choiceGrid.addEventListener('dragend', (event) => {
      const button = event.target.closest('.number-agency-choice');
      if (button) button.classList.remove('is-dragging');
      els.answerSlot.classList.remove('is-dragover');
    });
    els.answerSlot.addEventListener('dragover', (event) => {
      if (state.locked) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      els.answerSlot.classList.add('is-dragover');
    });
    els.answerSlot.addEventListener('dragleave', () => {
      els.answerSlot.classList.remove('is-dragover');
    });
    els.answerSlot.addEventListener('drop', (event) => {
      if (state.locked) return;
      event.preventDefault();
      els.answerSlot.classList.remove('is-dragover');
      const choice = event.dataTransfer.getData('text/plain');
      const button = Array.from(els.choiceGrid.querySelectorAll('.number-agency-choice'))
        .find((item) => String(item.dataset.choice) === String(choice));
      selectChoice(button);
    });
    els.nextButton.addEventListener('click', nextQuestion);
    if (els.previousButton) els.previousButton.addEventListener('click', previousQuestion);
    if (els.listenButton) els.listenButton.addEventListener('click', playTeachingAudio);
    els.stageButton.addEventListener('click', () => {
      clearTimedDrillTimer();
      stopTeachingAudio();
      setView('stageView');
    });
    els.otherStageButton.addEventListener('click', () => {
      clearTimedDrillTimer();
      stopTeachingAudio();
      setView('stageView');
    });
    els.retryButton.addEventListener('click', () => startStage(state.stage.id));
    window.addEventListener('keydown', (event) => {
      if (!els.gameView.classList.contains('is-active')) return;
      if (state.question?.inputMode === 'clock-keypad') {
        if (/^[0-9]$/.test(event.key)) {
          handleClockKeypadButton({ dataset: { keypadValue: event.key } });
          event.preventDefault();
          return;
        }
        if (event.key === 'Backspace' || event.key === 'Delete') {
          handleClockKeypadButton({ dataset: { keypadAction: 'clear' } });
          event.preventDefault();
          return;
        }
        if (event.key === 'Enter') {
          handleClockKeypadButton({ dataset: { keypadAction: 'submit' } });
          event.preventDefault();
          return;
        }
      }
      if (state.question?.inputMode === 'number-keypad') {
        if (/^[0-9.]$/.test(event.key)) {
          handleNumberKeypadButton({ dataset: { keypadValue: event.key } });
          event.preventDefault();
          return;
        }
        if (event.key === 'Backspace' || event.key === 'Delete') {
          handleNumberKeypadButton({ dataset: { keypadAction: 'clear' } });
          event.preventDefault();
          return;
        }
        if (event.key === 'Enter') {
          handleNumberKeypadButton({ dataset: { keypadAction: 'submit' } });
          event.preventDefault();
          return;
        }
      }
      const index = Number(event.key) - 1;
      if (index >= 0 && index < 4 && !state.locked) {
        selectChoice(els.choiceGrid.querySelectorAll('.number-agency-choice')[index]);
      }
      if (event.key === 'Enter' && !els.nextButton.hidden) nextQuestion();
    });
  };

  const init = () => {
    state.activity = normalizeActivity();
    document.title = state.activity.title;
    document.documentElement.style.setProperty('--shell-page-bg', "url('images/bg/bg-03.webp')");
    document.documentElement.style.setProperty('--shell-intro-bg', "url('images/bg/bg-03.webp')");
    document.documentElement.dataset.numberlabCategory = state.activity.id;
    initElements();
    $('.shell-brand-title').textContent = state.activity.title;
    renderStages();
    bindEvents();
    setView('stageView');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
