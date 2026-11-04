(function initTimeLabStandalone() {
  const root = document.getElementById("root");
  if (!root) return;

  const STAGES = [
    {
      id: "time-stage-01",
      number: 1,
      title: "시간의 흐름 이해",
      subtitle: "아침, 점심, 저녁, 오전, 오후를 비교하며 하루의 순서를 익혀요.",
      summary: "생활 장면과 하늘 색 변화로 시간대가 바뀌는 감각을 먼저 잡는 단계입니다.",
      method:
        "아침에는 해가 올라오고 등교를 준비하며, 점심에는 해가 높고 활동이 활발해요. 저녁에는 노을과 귀가 장면이 보인다는 점을 연결해서 먼저와 나중의 순서를 시각적으로 익힙니다.",
      test:
        "노을 사진, 점심 식사 그림, 등교 장면처럼 서로 다른 스타일의 이미지를 보고 알맞은 시간대를 고르거나, 시간 순서대로 나열하는 활동으로 확인합니다.",
      focus: ["아침-점심-저녁 순서", "오전과 오후 감각", "생활 장면 연결"],
      flow: [
        { title: "아침", caption: "해가 올라오고 하루가 시작돼요." },
        { title: "점심", caption: "해가 높고 활동이 가장 많아요." },
        { title: "저녁", caption: "노을이 지고 하루를 마무리해요." }
      ],
      question: "점심 다음 시간대로 가장 알맞은 것은 무엇일까요?",
      choices: ["아침", "새벽", "저녁", "자정"],
      answerIndex: 2,
      successFeedback: "맞아요. 점심 다음에는 해가 지기 시작하는 저녁으로 이어져요.",
      retryFeedback: "시간의 흐름은 아침, 점심, 저녁 순서로 흘러가요."
    },
    {
      id: "time-stage-02",
      number: 2,
      title: "시계의 구조 파악",
      subtitle: "시계판 숫자 1~12와 시침, 분침의 이름과 역할을 구분해요.",
      summary: "시계 읽기의 뼈대가 되는 숫자 위치와 바늘 이름을 정확히 알아보는 단계입니다.",
      method:
        "시계판에 숫자 1부터 12까지가 원형으로 배치된다는 점을 익히고, 짧은 바늘은 시침으로 시를, 긴 바늘은 분침으로 분을 알려 준다는 역할 차이를 분명히 구분합니다.",
      test:
        "시침과 분침을 각각 가리켜 보기, 빈 시계판에 숫자 1~12를 올바른 위치에 채워 넣기, 긴 바늘 이름 말하기 같은 활동으로 구조 이해를 확인합니다.",
      focus: ["1~12 숫자 배치", "짧은 바늘 = 시침", "긴 바늘 = 분침"],
      rules: ["시침은 짧아요", "분침은 길어요", "숫자는 시계 둘레에 있어요"],
      clock: {
        hour: 10,
        minute: 10,
        second: 0,
        hideSecond: true,
        digitalLabel: "10:10",
        caption: "짧은 시침과 긴 분침의 길이 차이를 함께 살펴봐요."
      },
      question: "긴 바늘의 이름은 무엇일까요?",
      choices: ["시침", "분침", "초침", "날짜침"],
      answerIndex: 1,
      successFeedback: "맞아요. 긴 바늘은 분을 읽는 분침이에요.",
      retryFeedback: "짧은 바늘은 시침, 긴 바늘은 분침으로 구분해 주세요."
    },
    {
      id: "time-stage-03",
      number: 3,
      title: "정각 읽기",
      subtitle: "긴 바늘이 12를 가리킬 때 정각임을 배우고 O시를 읽어요.",
      summary: "시침이 가리키는 숫자를 그대로 읽는 가장 기본적인 시계 읽기 단계입니다.",
      method:
        "분침이 12에 있을 때는 분이 0이라서 정각이라고 부릅니다. 이때는 시침이 가리키는 숫자를 그대로 읽으면 돼요. 예를 들어 시침이 4에 있으면 4시입니다.",
      test:
        "분침은 12에 고정하고 시침만 움직이는 여러 시계를 보며 지금은 몇 시인가요라고 묻는 방식으로 확인합니다.",
      focus: ["분침이 12면 정각", "시침 숫자를 그대로 읽기", "몇 시 표현"],
      clock: {
        hour: 4,
        minute: 0,
        second: 0,
        hideSecond: true,
        digitalLabel: "4:00",
        caption: "긴 바늘이 12에 있고 짧은 바늘이 4를 가리키면 4시예요."
      },
      question: "시계가 가리키는 시각은 무엇일까요?",
      choices: ["3시", "4시", "4시 30분", "5시"],
      answerIndex: 1,
      successFeedback: "정답이에요. 분침이 12에 있으니 정각이고, 시침이 4를 가리켜서 4시입니다.",
      retryFeedback: "분침이 12에 있는지 먼저 확인한 뒤, 시침 숫자를 읽어 보세요."
    },
    {
      id: "time-stage-04",
      number: 4,
      title: "30분 읽기",
      subtitle: "긴 바늘이 6을 가리킬 때 O시 30분을 읽고, 시침 위치를 함께 봐요.",
      summary: "시침이 두 숫자 사이에 걸쳐 있어도 앞 숫자를 기준으로 읽는 연습을 합니다.",
      method:
        "분침이 6에 있으면 30분입니다. 이때 시침은 다음 숫자로 완전히 가기 전이라서 두 숫자 사이에 있어요. 4시 30분이면 시침은 4와 5 사이에 있지만 아직 4시 30분으로 읽습니다.",
      test:
        "4시 30분을 가리키는 시계를 보고 4시 30분인지 5시 30분인지 구별하기, 시침이 어느 숫자에서 출발했는지 말해 보기로 확인합니다.",
      focus: ["분침이 6이면 30분", "시침은 앞 숫자 기준", "두 숫자 사이 위치 읽기"],
      clock: {
        hour: 4,
        minute: 30,
        second: 0,
        hideSecond: true,
        digitalLabel: "4:30",
        caption: "시침이 4와 5 사이에 있어도 아직 4시 30분이에요."
      },
      question: "이 시계를 가장 정확하게 읽은 것은 무엇일까요?",
      choices: ["4시", "4시 30분", "5시 30분", "5시"],
      answerIndex: 1,
      successFeedback: "좋아요. 분침이 6이면 30분, 시침은 아직 4를 지나고 있으니 4시 30분입니다.",
      retryFeedback: "시침이 두 숫자 사이에 있을 때는 앞 숫자를 기준으로 읽어 주세요."
    },
    {
      id: "time-stage-05",
      number: 5,
      title: "5분 단위 읽기",
      subtitle: "시계 숫자와 5분 단위를 연결해 15분, 40분처럼 읽어요.",
      summary: "시계 둘레 숫자를 5분 간격으로 바꾸어 읽는 규칙을 익히는 단계입니다.",
      method:
        "시계 숫자 하나가 5분씩 늘어난다고 생각합니다. 1은 5분, 2는 10분, 3은 15분, 8은 40분처럼 5단 구구단과 연결해서 읽습니다.",
      test:
        "분침이 3을 가리키면 15분, 8을 가리키면 40분이라고 바로 말하기, 분침 숫자를 보고 해당 분을 빠르게 연결하는 방식으로 확인합니다.",
      focus: ["숫자 하나 = 5분", "5단 규칙 연결", "15분과 40분 즉각 읽기"],
      clock: {
        hour: 2,
        minute: 40,
        second: 0,
        hideSecond: true,
        digitalLabel: "2:40",
        caption: "분침이 8이면 8 곱하기 5로 40분이에요."
      },
      question: "긴 바늘이 8을 가리키면 몇 분일까요?",
      choices: ["35분", "40분", "45분", "50분"],
      answerIndex: 1,
      successFeedback: "맞아요. 시계의 8은 40분을 뜻해요.",
      retryFeedback: "숫자마다 5분씩 늘어난다고 생각하면 8은 40분입니다."
    },
    {
      id: "time-stage-06",
      number: 6,
      title: "1분 단위 읽기",
      subtitle: "숫자 사이의 작은 눈금 한 칸이 1분임을 알고 18분, 27분처럼 읽어요.",
      summary: "5분 단위 사이의 작은 눈금까지 읽으며 시계를 더 정밀하게 해석하는 단계입니다.",
      method:
        "큰 숫자 사이에는 작은 눈금이 있고, 한 칸마다 1분씩 늘어납니다. 예를 들어 15분에서 눈금 3칸을 더 가면 18분이 되므로, 큰 숫자와 작은 눈금을 함께 읽는 연습을 합니다.",
      test:
        "7시 18분처럼 작은 눈금을 포함한 시계를 보고 정확하게 읽기, 25분에서 눈금 2칸을 더해 27분이라고 말하기로 확인합니다.",
      focus: ["작은 눈금 한 칸 = 1분", "5분 이후 세부 읽기", "정밀한 시각 읽기"],
      clock: {
        hour: 7,
        minute: 18,
        second: 0,
        hideSecond: true,
        digitalLabel: "7:18",
        caption: "15분에서 작은 눈금 3칸을 더 가면 18분이 됩니다."
      },
      question: "이 시계를 읽은 것으로 맞는 것은 무엇일까요?",
      choices: ["7시 15분", "7시 18분", "7시 20분", "8시 18분"],
      answerIndex: 1,
      successFeedback: "잘했어요. 15분 지점에서 눈금 3칸 더 가서 18분이에요.",
      retryFeedback: "먼저 5분 단위를 찾고, 그다음 작은 눈금을 더해 보세요."
    },
    {
      id: "time-stage-07",
      number: 7,
      title: "오전과 오후, 24시간제",
      subtitle: "하루 두 번의 12시간을 오전과 오후로 나누고 24시간제와 연결해요.",
      summary: "같은 시각 표시라도 낮과 밤에 따라 다르게 읽고 쓰는 방법을 익히는 단계입니다.",
      method:
        "하루는 오전 12시간과 오후 12시간으로 나뉩니다. 오후 시각은 24시간제로 바꿀 때 12를 더해 읽을 수 있어요. 예를 들어 오후 2시는 14시입니다.",
      test:
        "오후 5시는 24시간제로 몇 시인가요처럼 오전과 오후를 24시간제로 바꾸기, 낮과 밤 장면을 보고 오전인지 오후인지 선택하기로 확인합니다.",
      focus: ["오전과 오후 구분", "24시간제로 바꾸기", "낮과 밤 상황 연결"],
      digitalExamples: [
        { title: "오후 2시", caption: "24시간제로 14시" },
        { title: "오후 5시", caption: "24시간제로 17시" },
        { title: "밤 9시", caption: "24시간제로 21시" }
      ],
      clock: {
        hour: 14,
        minute: 0,
        second: 0,
        hideSecond: true,
        digitalLabel: "14:00",
        caption: "아날로그 시계로는 2시처럼 보여도, 오후라면 24시간제로 14시예요."
      },
      question: "오후 2시는 24시간제로 몇 시일까요?",
      choices: ["02시", "12시", "14시", "22시"],
      answerIndex: 2,
      successFeedback: "맞아요. 오후 시각은 12를 더해서 14시로 바꿔 읽어요.",
      retryFeedback: "오후 1시부터는 12를 더하면 24시간제로 바꿀 수 있어요."
    },
    {
      id: "time-stage-08",
      number: 8,
      title: "시간의 단위 환산",
      subtitle: "1시간은 60분, 1분은 60초라는 단위 관계를 바꿔 읽어요.",
      summary: "시간 단위를 다른 단위로 바꾸는 기초 환산 감각을 익히는 단계입니다.",
      method:
        "1시간은 60분이고 1분은 60초입니다. 80분처럼 60분이 넘는 값은 1시간을 먼저 꺼내고 남은 분을 읽으면 돼요. 80분은 60분 더하기 20분이라서 1시간 20분입니다.",
      test:
        "80분은 몇 시간 몇 분인가요처럼 분을 시간과 분으로 바꾸기, 2시간을 분으로 바꾸기 같은 활동으로 단위 전환을 확인합니다.",
      focus: ["1시간 = 60분", "1분 = 60초", "60을 기준으로 나누기"],
      digitalExamples: [
        { title: "80분", caption: "1시간 20분" },
        { title: "120분", caption: "2시간 0분" },
        { title: "90분", caption: "1시간 30분" }
      ],
      question: "80분은 몇 시간 몇 분일까요?",
      choices: ["1시간 10분", "1시간 20분", "2시간", "2시간 20분"],
      answerIndex: 1,
      successFeedback: "정답입니다. 80분은 60분과 20분으로 나눠서 1시간 20분이에요.",
      retryFeedback: "먼저 60분을 1시간으로 묶고 남는 분을 찾아보세요."
    },
    {
      id: "time-stage-09",
      number: 9,
      title: "시간의 덧셈",
      subtitle: "받아올림이 없는 쉬운 시간 더하기를 시와 분으로 나누어 생각해요.",
      summary: "기준 시각에 일정 시간이 지난 뒤의 시각을 구하는 기초 연산 단계입니다.",
      method:
        "시간 더하기에서는 시는 시끼리, 분은 분끼리 생각합니다. 먼저 기준 시각을 읽고, 더해지는 시간이 몇 분인지 확인한 뒤 분부터 계산합니다. 받아올림이 없으면 그대로 읽으면 됩니다.",
      test:
        "2시 10분에서 30분이 지나면 몇 시 몇 분인가요처럼 기준 시각에 시간이 지난 뒤를 묻는 문제로 확인합니다.",
      focus: ["기준 시각 읽기", "분 먼저 더하기", "받아올림 없는 더하기"],
      clock: {
        hour: 2,
        minute: 40,
        second: 0,
        hideSecond: true,
        digitalLabel: "2:40",
        caption: "2시 10분에서 30분이 지나면 2시 40분이 돼요."
      },
      question: "2시 10분에서 30분이 지나면 몇 시 몇 분일까요?",
      choices: ["2시 30분", "2시 40분", "3시 10분", "3시 40분"],
      answerIndex: 1,
      successFeedback: "좋아요. 10분에 30분을 더하면 40분이 되어 2시 40분입니다.",
      retryFeedback: "시는 그대로 두고, 분만 10 더하기 30으로 계산해 보세요."
    },
    {
      id: "time-stage-10",
      number: 10,
      title: "시간의 뺄셈",
      subtitle: "받아내림이 없는 쉬운 시간 빼기를 시와 분으로 나누어 생각해요.",
      summary: "어떤 시각에서 일정 시간 전을 찾는 기초 시간 계산 단계입니다.",
      method:
        "시간 빼기에서는 먼저 기준 시각을 읽고, 몇 분 전인지 확인합니다. 받아내림이 필요하지 않으면 분에서 분을 바로 빼고 시는 그대로 두면 됩니다.",
      test:
        "4시 50분에서 20분 전은 몇 시 몇 분인가요처럼 일정 시간 전의 시각을 묻는 문제로 확인합니다.",
      focus: ["기준 시각 읽기", "분에서 분 빼기", "받아내림 없는 뺄셈"],
      clock: {
        hour: 4,
        minute: 30,
        second: 0,
        hideSecond: true,
        digitalLabel: "4:30",
        caption: "4시 50분에서 20분 전은 4시 30분이에요."
      },
      question: "4시 50분에서 20분 전은 몇 시 몇 분일까요?",
      choices: ["4시 20분", "4시 30분", "4시 40분", "5시 30분"],
      answerIndex: 1,
      successFeedback: "맞아요. 50분에서 20분을 빼면 30분이 남아서 4시 30분입니다.",
      retryFeedback: "50분에서 20분을 빼면 몇 분인지 먼저 계산해 보세요."
    },
    {
      id: "time-stage-11",
      number: 11,
      title: "시간의 연산 심화",
      subtitle: "60분이 넘어가면 시로 올리고, 부족하면 시에서 60분을 빌려와요.",
      summary: "받아올림과 받아내림이 필요한 시간 계산을 다루는 심화 단계입니다.",
      method:
        "분 계산 결과가 60분을 넘으면 1시간으로 바꾸어 시에 더합니다. 반대로 뺄셈에서 분이 모자라면 시에서 1시간을 빌려와 60분을 더한 뒤 계산합니다.",
      test:
        "10시 45분부터 35분 동안 운동했다면 끝난 시각은처럼 60분을 넘는 상황을 계산하는 문제로 확인합니다.",
      focus: ["60분 넘으면 1시간 올리기", "분이 모자라면 60분 빌리기", "복합 시간 계산"],
      clock: {
        hour: 11,
        minute: 20,
        second: 0,
        hideSecond: true,
        digitalLabel: "11:20",
        caption: "10시 45분에 35분을 더하면 80분이 되어 1시간 20분으로 바뀝니다."
      },
      question: "10시 45분부터 35분 동안 운동했다면 끝난 시각은 언제일까요?",
      choices: ["11시 10분", "11시 20분", "10시 80분", "12시 20분"],
      answerIndex: 1,
      successFeedback: "정답이에요. 45분 더하기 35분은 80분이므로 1시간 20분으로 바꿔 11시 20분이 됩니다.",
      retryFeedback: "분 계산이 60을 넘으면 1시간으로 바꾸어 시에 더해야 해요."
    },
    {
      id: "time-stage-12",
      number: 12,
      title: "시간과 기간의 응용",
      subtitle: "특정 시각과 걸린 시간을 연결해 일상 속 문장제를 해결해요.",
      summary: "언제 시작해서 언제 끝났는지를 바탕으로 총 걸린 시간을 구하는 응용 단계입니다.",
      method:
        "시각은 한 점을 말하고, 기간은 두 시각 사이의 간격을 말합니다. 시작 시각과 끝 시각을 비교하면서 시 단위와 분 단위를 나누어 생각하면 총 걸린 시간을 구할 수 있습니다.",
      test:
        "오전 9시 30분에 시작해 오후 1시 15분에 끝났다면 몇 시간 공부했나요처럼 실제 생활 문장제로 총 걸린 시간을 계산합니다.",
      focus: ["시각과 기간 구분", "시 단위와 분 단위 합치기", "생활 문제 해결"],
      digitalExamples: [
        { title: "시작", caption: "오전 9시 30분" },
        { title: "끝", caption: "오후 1시 15분" },
        { title: "총 시간", caption: "3시간 45분" }
      ],
      clock: {
        hour: 13,
        minute: 15,
        second: 0,
        hideSecond: true,
        digitalLabel: "13:15",
        caption: "오전 9시 30분부터 오후 1시 15분까지는 총 3시간 45분입니다."
      },
      question: "오전 9시 30분에 시작해 오후 1시 15분에 끝났다면 총 얼마나 공부했을까요?",
      choices: ["3시간 15분", "3시간 45분", "4시간 15분", "4시간 45분"],
      answerIndex: 1,
      successFeedback: "잘했어요. 9시 30분에서 1시 15분까지는 3시간 45분입니다.",
      retryFeedback: "9시 30분에서 12시까지 2시간 30분, 12시부터 1시 15분까지 1시간 15분으로 나누어 생각해 보세요."
    }
  ];

  const CATEGORIES = [
    {
      id: "time-basics",
      badge: "01",
      shortLabel: "기초",
      icon: "🌤️",
      tone: "sun",
      title: "시간 기초 감각",
      description: "하루의 흐름과 시계의 구조, 정각 읽기까지 가장 기본이 되는 감각을 다집니다.",
      stageIds: ["time-stage-01", "time-stage-02", "time-stage-03"]
    },
    {
      id: "time-reading",
      badge: "02",
      shortLabel: "읽기",
      icon: "🕰️",
      tone: "sky",
      title: "시계 읽기 확장",
      description: "30분, 5분 단위, 1분 단위까지 시계를 더 자세하게 읽는 단계입니다.",
      stageIds: ["time-stage-04", "time-stage-05", "time-stage-06"]
    },
    {
      id: "time-conversion",
      badge: "03",
      shortLabel: "표현",
      icon: "⏳",
      tone: "mint",
      title: "시간 표현과 환산",
      description: "오전과 오후, 24시간제, 시간 단위 환산을 연결해서 이해합니다.",
      stageIds: ["time-stage-07", "time-stage-08", "time-stage-09"]
    },
    {
      id: "time-application",
      badge: "04",
      shortLabel: "응용",
      icon: "📘",
      tone: "rose",
      title: "시간 계산과 응용",
      description: "시간의 뺄셈, 받아올림 연산, 기간 계산까지 응용 문제로 확장합니다.",
      stageIds: ["time-stage-10", "time-stage-11", "time-stage-12"]
    }
  ];

  const state = {
    currentStageId: "",
    answers: {}
  };

  const STAGE_CARD_DESCRIPTION_MAP = {
    "time-stage-01": "아침·점심·저녁",
    "time-stage-02": "숫자와 바늘",
    "time-stage-03": "분침 12",
    "time-stage-04": "분침 6",
    "time-stage-05": "5분씩 읽기",
    "time-stage-06": "작은 눈금 읽기",
    "time-stage-07": "오전·오후",
    "time-stage-08": "60 단위 바꾸기",
    "time-stage-09": "시간 더하기",
    "time-stage-10": "시간 빼기",
    "time-stage-11": "받아올림·받아내림",
    "time-stage-12": "생활 속 시간"
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getCategoryById(categoryId) {
    return CATEGORIES.find((category) => category.id === categoryId) || null;
  }

  function getStageById(stageId) {
    return STAGES.find((stage) => stage.id === stageId) || null;
  }

  function getStagesForCategory(categoryId) {
    const category = getCategoryById(categoryId);
    if (!category) return [];
    return category.stageIds.map((stageId) => getStageById(stageId)).filter(Boolean);
  }

  function getCurrentView() {
    return state.currentStageId ? "stage" : "home";
  }

  function getCategoryForStage(stageId) {
    return CATEGORIES.find((category) => category.stageIds.includes(stageId)) || null;
  }

  function getStageCardDescription(stage) {
    if (!stage) return "";
    return STAGE_CARD_DESCRIPTION_MAP[stage.id] || (Array.isArray(stage.focus) && stage.focus.length ? stage.focus[0] : stage.summary || "");
  }

  function renderTopbar() {
    const currentView = getCurrentView();
    const actionButton = currentView === "home"
      ? `<button class="shell-icon-btn shell-header-change-btn timelab-btn timelab-btn-primary" data-action="open-stage" data-stage-id="time-stage-01">1단계 시작</button>`
      : `<button class="shell-icon-btn shell-header-change-btn timelab-btn timelab-btn-ghost" data-action="back-home">목록</button>`;

    return `
      <header class="shell-topbar">
        <div class="shell-topbar-inner">
          <div class="shell-brand">
            <div class="shell-logo">T</div>
            <div class="shell-brand-copy">
              <small>TIME LAB</small>
              <strong>시간을 배워요</strong>
            </div>
          </div>
          <div class="shell-topbar-side">
            ${actionButton}
          </div>
        </div>
      </header>
    `;
  }

  function renderHome() {
    const stageCards = STAGES.map((stage) => {
      const category = getCategoryForStage(stage.id);
      const compactDescription = getStageCardDescription(stage);
      return `
        <button class="timelab-btn timelab-stage-card" data-cardlab-stage-card="true" data-action="open-stage" data-stage-id="${stage.id}">
          <div class="timelab-stage-card-head">
            <span class="timelab-stage-order">${stage.number}단계</span>
            <span class="timelab-stage-status">${escapeHtml(category?.shortLabel || "시간")}</span>
          </div>
          <h3 class="timelab-stage-card-title" data-cardlab-stage-title="true">${escapeHtml(stage.title)}</h3>
          <p class="timelab-stage-card-desc">${escapeHtml(compactDescription)}</p>
          <div class="timelab-stage-card-bottom">
            <span class="timelab-stage-cta" data-cardlab-stage-cta="true">시작</span>
          </div>
        </button>
      `;
    }).join("");

    return `
      <section class="timelab-home">
        <section class="timelab-home-hero timelab-home-grid-shell">
          <div class="timelab-stage-grid numberlab-shell-stage-grid" data-cardlab-stage-grid="true" aria-label="시간 학습 전체 스테이지">
            ${stageCards}
          </div>
        </section>
      </section>
    `;
  }

  function renderClock(clockConfig) {
    if (!clockConfig) return "";
    const hourValue = Number(clockConfig.hour || 0);
    const minuteValue = Number(clockConfig.minute || 0);
    const secondValue = Number(clockConfig.second || 0);
    const hourDegree = (hourValue % 12) * 30 + minuteValue * 0.5;
    const minuteDegree = minuteValue * 6 + secondValue * 0.1;
    const secondDegree = secondValue * 6;

    const numberNodes = Array.from({ length: 12 }, (_, index) => {
      const value = index === 0 ? 12 : index;
      const degree = index * 30;
      return `
        <li style="transform: rotate(${degree}deg)">
          <i style="transform: translateX(-50%) rotate(${-degree}deg)">${value}</i>
        </li>
      `;
    }).join("");

    const ticks = Array.from({ length: 60 }, (_, index) => {
      const degree = index * 6;
      const className = index % 5 === 0 ? "fives" : "";
      return `<span class="${className}" style="transform: translate(-50%, -50%) rotate(${degree}deg) translateY(-132px)"></span>`;
    }).join("");

    return `
      <div class="timelab-clock-card">
        <div class="timelab-clock-wrap">
          <section class="clock" aria-label="${escapeHtml(clockConfig.digitalLabel || "")}">
            <ul>${numberNodes}</ul>
            ${ticks}
            <div class="minutes" style="transform: rotate(${minuteDegree}deg)"></div>
            <div class="hours" style="transform: rotate(${hourDegree}deg)"></div>
            <div class="seconds ${clockConfig.hideSecond ? "is-hidden" : ""}" style="transform: rotate(${secondDegree}deg)"></div>
            <div class="cercle"></div>
          </section>
        </div>
        <div class="timelab-clock-meta">
          <div class="timelab-clock-digital">${escapeHtml(clockConfig.digitalLabel || "")}</div>
          <p class="timelab-clock-caption">${escapeHtml(clockConfig.caption || "")}</p>
        </div>
      </div>
    `;
  }

  function renderFlowStrip(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `
      <div class="timelab-flow-strip">
        ${items.map((item) => `
          <div class="timelab-flow-chip">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.caption)}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderDigitalStrip(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `
      <div class="timelab-digital-strip">
        ${items.map((item) => `
          <div class="timelab-digital-chip">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.caption)}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderRuleChips(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `
      <div class="timelab-rules">
        ${items.map((item) => `<span class="timelab-rule-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
    `;
  }

  function renderVisualPanel(stage) {
    return `
      <div class="timelab-panel">
        <div class="timelab-visual-stack">
          <div class="timelab-image-placeholder">
            <div class="timelab-placeholder-copy">
              <strong>1:1 이미지 영역</strong>
              <span>실사, 일러스트, 풍경 이미지는 추후 채워 넣을 예정입니다.</span>
            </div>
          </div>
          <p class="timelab-visual-caption">${escapeHtml(stage.subtitle)}</p>
          ${renderFlowStrip(stage.flow)}
          ${renderDigitalStrip(stage.digitalExamples)}
          ${renderRuleChips(stage.rules)}
          ${renderClock(stage.clock)}
        </div>
      </div>
    `;
  }

  function getStageFeedback(stage) {
    const selectedIndex = state.answers[stage.id];
    if (selectedIndex == null) {
      return {
        title: "테스트해 보기",
        body: "오른쪽 보기 중 하나를 눌러서 지금 단계의 핵심 개념을 바로 확인해 보세요."
      };
    }
    if (selectedIndex === stage.answerIndex) {
      return {
        title: "정답",
        body: stage.successFeedback
      };
    }
    return {
      title: "다시 보기",
      body: stage.retryFeedback
    };
  }

  function renderQuizPanel(stage) {
    const selectedIndex = state.answers[stage.id];
    const feedback = getStageFeedback(stage);
    const choices = stage.choices.map((choice, index) => {
      let className = "timelab-btn timelab-choice";
      if (selectedIndex === index && index === stage.answerIndex) className += " is-correct";
      if (selectedIndex === index && index !== stage.answerIndex) className += " is-wrong";
      return `
        <button class="${className}" data-action="select-answer" data-stage-id="${stage.id}" data-choice-index="${index}">
          ${escapeHtml(choice)}
        </button>
      `;
    }).join("");

    return `
      <div class="timelab-panel timelab-quiz">
        <h3>단계 테스트</h3>
        <div class="timelab-question">${escapeHtml(stage.question)}</div>
        <div class="timelab-choices">${choices}</div>
        <div class="timelab-feedback">
          <strong>${escapeHtml(feedback.title)}</strong>
          <p>${escapeHtml(feedback.body)}</p>
        </div>
      </div>
    `;
  }

  function renderCopyPanel(title, body, focusItems) {
    return `
      <div class="timelab-panel timelab-copy-block">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
        <div class="timelab-focus-list">
          ${(focusItems || []).map((item) => `<span class="timelab-focus-item">${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function renderStageView() {
    const stage = getStageById(state.currentStageId);
    if (!stage) return renderHome();
    const category = getCategoryForStage(stage.id);
    const stageIndex = STAGES.findIndex((item) => item.id === stage.id);
    const prevStage = stageIndex > 0 ? STAGES[stageIndex - 1] : null;
    const nextStage = stageIndex < STAGES.length - 1 ? STAGES[stageIndex + 1] : null;

    return `
      <section class="timelab-stage-view numberlab-shell-learning">
        <section class="timelab-stage-shell">
          <h2 class="timelab-title" style="font-size:clamp(1.9rem,3.4vw,2.8rem);">${escapeHtml(stage.title)}</h2>
          <p class="timelab-subtitle">${escapeHtml(stage.summary)}</p>
          <div class="timelab-stage-layout">
            ${renderVisualPanel(stage)}
            <div class="timelab-right-grid">
              ${renderCopyPanel("학습 방법", stage.method, stage.focus)}
              ${renderQuizPanel(stage)}
              ${renderCopyPanel("테스트 방식", stage.test, ["핵심 표현 확인", "시각 자료 비교", "말로 읽기 연습"])}
            </div>
          </div>
          <div class="timelab-nav">
            <button class="timelab-btn timelab-btn-ghost" data-action="back-home">스테이지 목록</button>
            <div class="timelab-toolbar">
              <button class="timelab-btn timelab-btn-ghost" data-action="open-stage" data-stage-id="${prevStage ? prevStage.id : ""}" ${prevStage ? "" : "disabled"}>이전 단계</button>
              <button class="timelab-btn timelab-btn-primary" data-action="open-stage" data-stage-id="${nextStage ? nextStage.id : ""}" ${nextStage ? "" : "disabled"}>다음 단계</button>
            </div>
          </div>
        </section>
      </section>
    `;
  }

  function renderContent() {
    const currentView = getCurrentView();
    if (currentView === "stage") return renderStageView();
    return renderHome();
  }

  function syncShellBackground() {
    const currentView = getCurrentView();
    const selectionBackground = "url('images/bg/s-space-bg.webp')";
    const learningBackground = "url('images/bg/city-bg.webp')";
    document.documentElement.style.setProperty("--shell-intro-bg", selectionBackground);
    document.documentElement.style.setProperty("--shell-page-bg", currentView === "stage" ? learningBackground : selectionBackground);
  }

  function renderApp() {
    syncShellBackground();
    root.innerHTML = `
      <div class="cardlab-shell numberlab-shell timelab-shell">
        ${renderTopbar()}
        <main class="shell-main numberlab-shell-main">
          <section class="shell-screen is-active">
            ${renderContent()}
          </section>
        </main>
      </div>
    `;
  }

  function handleAction(action, target) {
    if (action === "back-home") {
      state.currentStageId = "";
      renderApp();
      return;
    }
    if (action === "back-category") {
      state.currentStageId = "";
      renderApp();
      return;
    }
    if (action === "open-stage") {
      const stageId = String(target.dataset.stageId || "").trim();
      const stage = getStageById(stageId);
      if (!stage) return;
      state.currentStageId = stageId;
      renderApp();
      return;
    }
    if (action === "select-answer") {
      const stageId = String(target.dataset.stageId || "");
      const choiceIndex = Number(target.dataset.choiceIndex || 0);
      if (!stageId) return;
      state.answers[stageId] = choiceIndex;
      const stage = getStageById(stageId);
      if (stage && window.HahaFeedbackOverlay) {
        window.HahaFeedbackOverlay.showQuestionComplete(choiceIndex === stage.answerIndex ? 'correct' : 'wrong');
      }
      renderApp();
    }
  }

  root.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    handleAction(actionTarget.dataset.action, actionTarget);
  });

  renderApp();
})();
