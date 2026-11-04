(function () {
  const DEFAULT_ACCENT = "#0f67d6";
  const DEFAULT_NORM_PROFILE = "lower-elementary";
  const REHAB_BENCHMARK_MS = {
    "rehab-cognitive-legacy": 7200,
    "rehablab-shape-match-gonogo": 3600,
    "rehablab-traffic-go-nogo": 3200,
    "rehablab-stroop-color-word": 4300
  };
  const REHAB_REFERENCE_LINKS = [
    {
      label: "Digital cognitive training in MCI/dementia, 2025 network meta-analysis",
      url: "https://pubmed.ncbi.nlm.nih.gov/40073511/"
    },
    {
      label: "Technology-based cognitive training and rehabilitation for MCI/dementia, systematic review",
      url: "https://pubmed.ncbi.nlm.nih.gov/32373018/"
    },
    {
      label: "Computerized cognitive training with older adults, systematic review",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK109272/"
    },
    {
      label: "Beery VMI standardized visual-motor assessment reference",
      url: "https://www.pearsonassessments.com/store/en/usd/p/100000663.html"
    },
    {
      label: "DTVP-3 standardized visual perception assessment reference",
      url: "https://www.proedinc.com/Products/13700/dtvp3-developmental-test-of-visual-perception-.aspx?bCategory=cog%21avpm"
    }
  ];
  const NORM_PROFILES = {
    general: {
      label: "일반 학습 기준",
      scoreBands: [
        { min: 92, label: "매우 우수", tone: "excellent" },
        { min: 84, label: "우수", tone: "strong" },
        { min: 74, label: "양호", tone: "good" },
        { min: 62, label: "보통", tone: "steady" },
        { min: 0, label: "보완 필요", tone: "watch" }
      ],
      clinicalCutoffs: {
        strong: 85,
        moderate: 72
      },
      difficultyBoostScale: 2.4,
      benchmarkMs: {
        "numberlab-number-sense": 5200,
        "numberlab-number-bundle": 6200,
        "numberlab-number-calc": 7000,
        "standalone-icon-find": 5600,
        "standalone-icon-odd-find": 6200,
        "standalone-doorlock": 7200,
        "standalone-color-memory": 6800,
        "standalone-color-trace": 5400,
        "standalone-shape": 4200,
        "time-dayparts-quiz": 5200,
        "time-dayparts-sequence": 8200,
        "time-dayparts-relative": 3800,
        "language-sound-find": 6400,
        "language-syllable-find": 7600,
        "rehab-cognitive-legacy": 6800,
        "rehablab-shape-match-gonogo": 3400,
        "rehablab-traffic-go-nogo": 3000,
        "rehablab-stroop-color-word": 4000,
        default: 4600
      }
    },
    preschool: {
      label: "유아/취학 전 관찰 기준",
      scoreBands: [
        { min: 86, label: "매우 우수", tone: "excellent" },
        { min: 76, label: "우수", tone: "strong" },
        { min: 64, label: "양호", tone: "good" },
        { min: 52, label: "보통", tone: "steady" },
        { min: 0, label: "보완 필요", tone: "watch" }
      ],
      clinicalCutoffs: {
        strong: 76,
        moderate: 60
      },
      difficultyBoostScale: 1.25,
      benchmarkMs: Object.assign({}, REHAB_BENCHMARK_MS, {
        "numberlab-number-sense": 7600,
        "numberlab-number-bundle": 9000,
        "numberlab-number-calc": 9800,
        "standalone-icon-find": 8000,
        "standalone-icon-odd-find": 9000,
        "standalone-doorlock": 9800,
        "standalone-color-memory": 9200,
        "standalone-color-trace": 7200,
        "standalone-shape": 6200,
        "time-dayparts-quiz": 7600,
        "time-dayparts-sequence": 11200,
        "time-dayparts-relative": 5400,
        "language-sound-find": 9000,
        "language-syllable-find": 10400,
        "rehab-cognitive-legacy": 8200,
        "rehablab-shape-match-gonogo": 4300,
        "rehablab-traffic-go-nogo": 3900,
        "rehablab-stroop-color-word": 5200,
        default: 6500
      })
    },
    "lower-elementary": {
      label: "초등 저학년 기준",
      scoreBands: [
        { min: 88, label: "매우 우수", tone: "excellent" },
        { min: 80, label: "우수", tone: "strong" },
        { min: 68, label: "양호", tone: "good" },
        { min: 56, label: "보통", tone: "steady" },
        { min: 0, label: "보완 필요", tone: "watch" }
      ],
      clinicalCutoffs: {
        strong: 80,
        moderate: 66
      },
      difficultyBoostScale: 1.7,
      benchmarkMs: {
        "numberlab-number-sense": 6500,
        "numberlab-number-bundle": 7600,
        "numberlab-number-calc": 8400,
        "standalone-icon-find": 7000,
        "standalone-icon-odd-find": 7800,
        "standalone-doorlock": 8800,
        "standalone-color-memory": 8200,
        "standalone-color-trace": 6400,
        "standalone-shape": 5000,
        "time-dayparts-quiz": 6400,
        "time-dayparts-sequence": 9600,
        "time-dayparts-relative": 4200,
        "language-sound-find": 7600,
        "language-syllable-find": 9200,
        "rehab-cognitive-legacy": 7600,
        "rehablab-shape-match-gonogo": 3900,
        "rehablab-traffic-go-nogo": 3500,
        "rehablab-stroop-color-word": 4700,
        default: 5600
      }
    },
    "upper-elementary": {
      label: "초등 고학년/청소년 관찰 기준",
      scoreBands: [
        { min: 90, label: "매우 우수", tone: "excellent" },
        { min: 82, label: "우수", tone: "strong" },
        { min: 70, label: "양호", tone: "good" },
        { min: 58, label: "보통", tone: "steady" },
        { min: 0, label: "보완 필요", tone: "watch" }
      ],
      clinicalCutoffs: {
        strong: 82,
        moderate: 68
      },
      difficultyBoostScale: 1.95,
      benchmarkMs: Object.assign({}, REHAB_BENCHMARK_MS, {
        "numberlab-number-sense": 5800,
        "numberlab-number-bundle": 6900,
        "numberlab-number-calc": 7600,
        "standalone-icon-find": 6100,
        "standalone-icon-odd-find": 6900,
        "standalone-doorlock": 7800,
        "standalone-color-memory": 7400,
        "standalone-color-trace": 5800,
        "standalone-shape": 4600,
        "time-dayparts-quiz": 5800,
        "time-dayparts-sequence": 9000,
        "time-dayparts-relative": 3900,
        "language-sound-find": 7000,
        "language-syllable-find": 8400,
        "rehab-cognitive-legacy": 7000,
        "rehablab-shape-match-gonogo": 3500,
        "rehablab-traffic-go-nogo": 3100,
        "rehablab-stroop-color-word": 4200,
        default: 5000
      })
    },
    adult: {
      label: "성인 훈련 관찰 기준",
      scoreBands: [
        { min: 92, label: "매우 우수", tone: "excellent" },
        { min: 86, label: "우수", tone: "strong" },
        { min: 76, label: "양호", tone: "good" },
        { min: 64, label: "보통", tone: "steady" },
        { min: 0, label: "보완 필요", tone: "watch" }
      ],
      clinicalCutoffs: {
        strong: 86,
        moderate: 74
      },
      difficultyBoostScale: 2.25,
      benchmarkMs: Object.assign({}, REHAB_BENCHMARK_MS, {
        "numberlab-number-sense": 4800,
        "numberlab-number-bundle": 5800,
        "numberlab-number-calc": 6500,
        "standalone-icon-find": 5200,
        "standalone-icon-odd-find": 5800,
        "standalone-doorlock": 6800,
        "standalone-color-memory": 6400,
        "standalone-color-trace": 5000,
        "standalone-shape": 4000,
        "time-dayparts-quiz": 5000,
        "time-dayparts-sequence": 7800,
        "time-dayparts-relative": 3400,
        "language-sound-find": 6100,
        "language-syllable-find": 7200,
        "rehab-cognitive-legacy": 6400,
        "rehablab-shape-match-gonogo": 3100,
        "rehablab-traffic-go-nogo": 2800,
        "rehablab-stroop-color-word": 3800,
        default: 4300
      })
    },
    senior: {
      label: "고령자/인지재활 관찰 기준",
      scoreBands: [
        { min: 86, label: "매우 우수", tone: "excellent" },
        { min: 78, label: "우수", tone: "strong" },
        { min: 66, label: "양호", tone: "good" },
        { min: 54, label: "보통", tone: "steady" },
        { min: 0, label: "보완 필요", tone: "watch" }
      ],
      clinicalCutoffs: {
        strong: 78,
        moderate: 64
      },
      difficultyBoostScale: 1.35,
      benchmarkMs: Object.assign({}, REHAB_BENCHMARK_MS, {
        "numberlab-number-sense": 7200,
        "numberlab-number-bundle": 8600,
        "numberlab-number-calc": 9600,
        "standalone-icon-find": 7800,
        "standalone-icon-odd-find": 8600,
        "standalone-doorlock": 9800,
        "standalone-color-memory": 9200,
        "standalone-color-trace": 7000,
        "standalone-shape": 5800,
        "time-dayparts-quiz": 7200,
        "time-dayparts-sequence": 10800,
        "time-dayparts-relative": 5200,
        "language-sound-find": 8400,
        "language-syllable-find": 9800,
        "rehab-cognitive-legacy": 8400,
        "rehablab-shape-match-gonogo": 4400,
        "rehablab-traffic-go-nogo": 4000,
        "rehablab-stroop-color-word": 5400,
        default: 6200
      })
    }
  };

  const AXIS_PRESETS = {
    visual: [
      { id: "speed", label: "반응속도" },
      { id: "attention", label: "집중지속" },
      { id: "memory", label: "작업기억" },
      { id: "inhibition", label: "억제조절" },
      { id: "search", label: "시지각탐색" },
      { id: "accuracy", label: "정확도" }
    ],
    language: [
      { id: "speed", label: "반응속도" },
      { id: "attention", label: "집중지속" },
      { id: "memory", label: "작업기억" },
      { id: "inhibition", label: "억제조절" },
      { id: "language", label: "언어인출" },
      { id: "accuracy", label: "정확도" }
    ],
    review: [
      { id: "speed", label: "반응속도" },
      { id: "attention", label: "집중지속" },
      { id: "visualCue", label: "단서활용" },
      { id: "language", label: "명칭회상" },
      { id: "selfMonitoring", label: "자기점검" },
      { id: "completion", label: "수행완료" }
    ],
    number: [
      { id: "speed", label: "반응속도" },
      { id: "attention", label: "집중지속" },
      { id: "numberSense", label: "수개념" },
      { id: "calculation", label: "연산정확" },
      { id: "memory", label: "작업기억" },
      { id: "selfMonitoring", label: "자기점검" }
    ],
    time: [
      { id: "speed", label: "반응속도" },
      { id: "attention", label: "집중지속" },
      { id: "timeSense", label: "시간개념" },
      { id: "sequencing", label: "순서조직" },
      { id: "language", label: "표현이해" },
      { id: "selfMonitoring", label: "자기점검" }
    ],
    doorlock: [
      { id: "speed", label: "반응속도" },
      { id: "attention", label: "집중지속" },
      { id: "memory", label: "순차기억" },
      { id: "sequencing", label: "순서조직" },
      { id: "inhibition", label: "억제조절" },
      { id: "accuracy", label: "정확도" }
    ]
  };

  const ROLE_LABELS = {
    psychology: "심리 전문가 소견",
    rehab: "인지재활 전문가 소견",
    language: "언어재활 전문가 소견",
    behavior: "행동발달 전문가 소견"
  };

  const REPORT_PROFILES = {
    "visual-search-basic": {
      label: "기초 시각 탐색형",
      family: "시지각 탐색",
      primaryAxis: "search",
      secondaryAxis: "attention",
      summary: "넓은 배열 안에서 목표 자극을 찾고 시선을 조직하는 능력을 중심으로 해석합니다.",
      expertFocus: "시각 탐색 경로, 표적 유지, 선택적 주의 분배를 함께 봅니다.",
      trainingTitle: "표적 탐색 경로 고정 훈련",
      trainingDesc: "왼쪽 위에서 오른쪽 아래로 훑는 순서를 고정하고, 찾은 표적을 손가락으로 짚은 뒤 반응하는 루틴을 반복해 주세요."
    },
    "visual-discrimination": {
      label: "시각 변별 정밀형",
      family: "시지각 변별",
      primaryAxis: "search",
      secondaryAxis: "inhibition",
      summary: "비슷한 자극 사이의 미세 차이를 구분하고 비표적 반응을 억제하는 능력을 중심으로 해석합니다.",
      expertFocus: "유사 자극 변별, 방해 자극 억제, 반응 전 확인 절차의 안정성을 함께 봅니다.",
      trainingTitle: "유사 자극 변별 훈련",
      trainingDesc: "정답과 헷갈리는 보기를 나란히 두고 다른 점을 말로 확인한 뒤 선택하는 방식으로 변별 기준을 또렷하게 만들어 주세요."
    },
    "visual-attention-sustain": {
      label: "시각 주의 지속형",
      family: "주의 지속",
      primaryAxis: "attention",
      secondaryAxis: "completion",
      summary: "목표 자극에 대한 주의 초점을 유지하고 후반부까지 수행 흐름을 이어가는 힘을 중심으로 해석합니다.",
      expertFocus: "주의 이탈, 피로 누적, 세트 길이에 따른 수행 안정성을 함께 봅니다.",
      trainingTitle: "짧은 세트 집중 유지 훈련",
      trainingDesc: "성공률이 높은 3~5문항 세트부터 시작해 쉬는 시간을 짧게 넣고, 세트 길이를 한 문항씩 늘려 주세요."
    },
    "visual-sequential-scan": {
      label: "시각 순차 탐색형",
      family: "순차 처리",
      primaryAxis: "search",
      secondaryAxis: "memory",
      summary: "시각 단서를 순서대로 따라가며 목표를 연결하는 순차 탐색 능력을 중심으로 해석합니다.",
      expertFocus: "탐색 순서 유지, 색-번호 매핑, 눈-손 연결의 안정성을 함께 봅니다.",
      trainingTitle: "순서 말하기 후 연결 훈련",
      trainingDesc: "누르기 전에 목표 순서를 짧게 말해보고, 같은 순서를 손가락으로 한 번 짚은 뒤 실제 연결을 시작해 주세요."
    },
    "visual-motor-coordination": {
      label: "시각-운동 협응형",
      family: "운동 협응",
      primaryAxis: "search",
      secondaryAxis: "accuracy",
      summary: "눈으로 확인한 정보를 손의 정확한 선택 반응으로 옮기는 협응 능력을 중심으로 해석합니다.",
      expertFocus: "시선 고정, 터치 정확성, 반응 위치 조절을 함께 봅니다.",
      trainingTitle: "보고-짚고-누르기 훈련",
      trainingDesc: "목표를 눈으로 본 뒤 손가락으로 한 번 가리키고 누르는 3단계 반응을 반복해 터치 정확도를 높여 주세요."
    },
    "memory-sequence": {
      label: "순차 작업기억형",
      family: "작업기억",
      primaryAxis: "memory",
      secondaryAxis: "sequencing",
      summary: "제시된 순서를 짧게 유지하고 같은 순서로 재현하는 작업기억 능력을 중심으로 해석합니다.",
      expertFocus: "순서 유지, 즉각 재현, 기억 길이 확장 가능성을 함께 봅니다.",
      trainingTitle: "3-4-5 순서 길이 확장 훈련",
      trainingDesc: "3개 순서를 안정적으로 맞힌 뒤 4개, 5개로 늘리고, 틀리면 바로 길이를 낮춰 성공 경험을 회복해 주세요."
    },
    "memory-working-load": {
      label: "작업기억 부하 조절형",
      family: "작업기억",
      primaryAxis: "memory",
      secondaryAxis: "attention",
      summary: "여러 정보를 동시에 붙잡고 필요한 순간에 갱신하는 능력을 중심으로 해석합니다.",
      expertFocus: "동시 처리량, 기억 갱신, 재확인 의존도를 함께 봅니다.",
      trainingTitle: "정보량 단계 조절 훈련",
      trainingDesc: "규칙은 그대로 두고 기억해야 할 개수만 조금씩 늘려 작업기억 부담을 세밀하게 조절해 주세요."
    },
    "memory-color-binding": {
      label: "색-위치 결합 기억형",
      family: "연합 기억",
      primaryAxis: "memory",
      secondaryAxis: "search",
      summary: "색, 위치, 순서를 하나의 묶음으로 저장하고 다시 선택하는 연합 기억을 중심으로 해석합니다.",
      expertFocus: "색 단서 저장, 위치 재인, 순차 선택 안정성을 함께 봅니다.",
      trainingTitle: "색-위치 묶음 회상 훈련",
      trainingDesc: "색 이름과 위치를 함께 말한 뒤 가리고 선택하게 하여 색 단서와 공간 단서가 함께 저장되도록 도와주세요."
    },
    "inhibition-impulse": {
      label: "충동 반응 억제형",
      family: "억제 조절",
      primaryAxis: "inhibition",
      secondaryAxis: "accuracy",
      summary: "바로 누르고 싶은 반응을 멈추고 정답 기준을 확인하는 억제 능력을 중심으로 해석합니다.",
      expertFocus: "충동 선택, 오반응 억제, 반응 전 멈춤 시간을 함께 봅니다.",
      trainingTitle: "멈춤 신호 반응 훈련",
      trainingDesc: "정답을 알 것 같아도 1초 멈춘 뒤 기준을 한 번 말하고 누르는 규칙을 고정해 주세요."
    },
    "self-monitoring-error": {
      label: "오류 자기점검형",
      family: "자기점검",
      primaryAxis: "selfMonitoring",
      secondaryAxis: "accuracy",
      summary: "오류를 알아차리고 다음 반응에서 전략을 조정하는 자기점검 능력을 중심으로 해석합니다.",
      expertFocus: "오류 인식, 수정 전략, 반복 실수 감소 흐름을 함께 봅니다.",
      trainingTitle: "오답 직후 기준 재확인 훈련",
      trainingDesc: "틀린 직후 같은 문제를 바로 다시 누르기보다 기준 자극을 읽고, 왜 틀렸는지 한 문장으로 말하게 해 주세요."
    },
    "processing-speed": {
      label: "처리 속도 효율형",
      family: "처리 속도",
      primaryAxis: "speed",
      secondaryAxis: "attention",
      summary: "자극을 보고 반응을 시작하기까지의 속도와 효율을 중심으로 해석합니다.",
      expertFocus: "반응 개시 시간, 속도-정확도 균형, 후반부 속도 저하를 함께 봅니다.",
      trainingTitle: "정확도 유지 속도 훈련",
      trainingDesc: "정확도가 유지되는 범위에서만 반응 시간을 조금씩 줄이고, 속도가 빨라지며 오답이 늘면 즉시 난이도를 낮춰 주세요."
    },
    "response-consistency": {
      label: "반응 일관성 안정형",
      family: "수행 안정성",
      primaryAxis: "attention",
      secondaryAxis: "speed",
      summary: "문항마다 반응 시간이 크게 흔들리지 않고 일정하게 유지되는지를 중심으로 해석합니다.",
      expertFocus: "반응 시간 변동성, 피로 누적, 수행 리듬의 안정성을 함께 봅니다.",
      trainingTitle: "일정 리듬 반응 훈련",
      trainingDesc: "너무 빠르게 누르기보다 매 문항 비슷한 속도로 보고-확인-반응하는 리듬을 먼저 만들어 주세요."
    },
    "auditory-discrimination": {
      label: "청각 변별-명칭 연결형",
      family: "청각 언어",
      primaryAxis: "language",
      secondaryAxis: "attention",
      summary: "소리를 듣고 목표 단어 또는 그림과 연결하는 청각 변별 능력을 중심으로 해석합니다.",
      expertFocus: "청각 단서 유지, 음운 변별, 소리-의미 연결을 함께 봅니다.",
      trainingTitle: "소리 듣고 따라 말하기 훈련",
      trainingDesc: "정답을 고르기 전에 들은 소리를 짧게 따라 말하고, 그림 또는 단어와 연결하는 반복을 넣어 주세요."
    },
    "phonological-retrieval": {
      label: "음운 인출형",
      family: "언어 인출",
      primaryAxis: "language",
      secondaryAxis: "memory",
      summary: "소리 단서를 바탕으로 목표 어휘를 빠르게 떠올리는 음운 인출 능력을 중심으로 해석합니다.",
      expertFocus: "첫소리 단서, 음절 수, 목표 어휘 활성화 속도를 함께 봅니다.",
      trainingTitle: "첫소리-전체말 인출 훈련",
      trainingDesc: "첫소리를 들려준 뒤 전체 단어를 말하게 하고, 바로 그림을 확인해 음운 단서와 의미 단서를 연결해 주세요."
    },
    "syllable-assembly": {
      label: "음절 조합 조직형",
      family: "초기 문해",
      primaryAxis: "language",
      secondaryAxis: "sequencing",
      summary: "낱음절을 순서대로 조합해 의미 있는 단어로 만드는 초기 문해 능력을 중심으로 해석합니다.",
      expertFocus: "음절 순서, 음운 작업기억, 단어 완성 전략을 함께 봅니다.",
      trainingTitle: "음절 순서 재구성 훈련",
      trainingDesc: "정답 단어를 박수 리듬으로 나누어 말하고, 같은 순서로 음절 카드를 배열하는 연습을 반복해 주세요."
    },
    "lexical-semantic": {
      label: "어휘-의미 연결형",
      family: "어휘 의미",
      primaryAxis: "language",
      secondaryAxis: "accuracy",
      summary: "단어와 의미, 그림 정보를 연결해 정확한 명칭을 선택하는 능력을 중심으로 해석합니다.",
      expertFocus: "의미 단서 활용, 어휘 친숙도, 명칭 정확성을 함께 봅니다.",
      trainingTitle: "뜻 말하고 이름 찾기 훈련",
      trainingDesc: "그림을 보기 전에 뜻을 한 문장으로 듣고, 후보 단어 중 의미가 맞는 이름을 고르는 연습을 해 주세요."
    },
    "naming-fluency": {
      label: "명칭 회상 유창성형",
      family: "명칭 회상",
      primaryAxis: "language",
      secondaryAxis: "speed",
      summary: "익숙한 사물의 이름을 빠르고 안정적으로 떠올리는 명칭 회상 능력을 중심으로 해석합니다.",
      expertFocus: "명칭 회상 속도, 친숙 어휘 인출, 초회 성공률을 함께 봅니다.",
      trainingTitle: "빠른 이름 말하기 훈련",
      trainingDesc: "친숙한 그림 3~5개를 짧게 보여주고 이름을 바로 말하게 한 뒤, 점차 범주와 개수를 늘려 주세요."
    },
    "category-concept": {
      label: "범주 개념 분류형",
      family: "개념 분류",
      primaryAxis: "language",
      secondaryAxis: "visualCue",
      summary: "사물을 공통 특징으로 묶고 범주 안에서 구분하는 개념 분류 능력을 중심으로 해석합니다.",
      expertFocus: "범주 단서, 공통 속성, 의미적 유사성 변별을 함께 봅니다.",
      trainingTitle: "같은 범주 묶기 훈련",
      trainingDesc: "동물, 음식, 도구처럼 범주를 먼저 말하고 같은 특징을 가진 보기를 묶어 설명하게 해 주세요."
    },
    "time-concept": {
      label: "시간 개념 기준형",
      family: "시간 개념",
      primaryAxis: "timeSense",
      secondaryAxis: "language",
      summary: "오전, 오후, 오늘, 내일처럼 시간 표현의 기준점을 이해하는 능력을 중심으로 해석합니다.",
      expertFocus: "현재 기준점, 시간 어휘 이해, 생활 장면 연결을 함께 봅니다.",
      trainingTitle: "생활 장면 시간말 연결 훈련",
      trainingDesc: "아침, 낮, 저녁 사진을 보며 지금 기준에서 어떤 시간말이 맞는지 말하고 달력 또는 하루표에 붙여 보세요."
    },
    "temporal-sequencing": {
      label: "시간 순서 조직형",
      family: "시간 순서",
      primaryAxis: "sequencing",
      secondaryAxis: "timeSense",
      summary: "시간 장면을 앞뒤 순서로 배열하고 흐름을 이야기처럼 구성하는 능력을 중심으로 해석합니다.",
      expertFocus: "앞뒤 관계, 장면 배열, 순서 언어 사용을 함께 봅니다.",
      trainingTitle: "먼저-다음-마지막 배열 훈련",
      trainingDesc: "세 장면을 먼저, 다음, 마지막으로 나누어 놓고 각 장면을 한 문장으로 말하게 해 주세요."
    },
    "relative-time": {
      label: "상대 시간 판단형",
      family: "시간 지남력",
      primaryAxis: "timeSense",
      secondaryAxis: "selfMonitoring",
      summary: "오늘을 기준으로 어제, 내일, 지난달, 다음달처럼 상대적 시간을 판단하는 능력을 중심으로 해석합니다.",
      expertFocus: "기준 시점 고정, 앞뒤 이동, 날짜 언어 이해를 함께 봅니다.",
      trainingTitle: "기준 날짜 앞뒤 이동 훈련",
      trainingDesc: "오늘 카드를 가운데 놓고 왼쪽에는 이전, 오른쪽에는 이후 날짜를 놓으며 말로 확인하게 해 주세요."
    },
    "number-sense": {
      label: "수 감각 기초형",
      family: "수개념",
      primaryAxis: "numberSense",
      secondaryAxis: "attention",
      summary: "수량의 크기, 많고 적음, 순서 감각을 직관적으로 이해하는 능력을 중심으로 해석합니다.",
      expertFocus: "수량 비교, 수 순서, 직관적 수 감각을 함께 봅니다.",
      trainingTitle: "수량 비교 말하기 훈련",
      trainingDesc: "같은 물건 묶음 두 개를 보여주고 어느 쪽이 더 많은지 말한 뒤 숫자 기호와 연결해 주세요."
    },
    "quantity-symbol": {
      label: "수량-기호 대응형",
      family: "수-기호 연결",
      primaryAxis: "numberSense",
      secondaryAxis: "memory",
      summary: "실제 수량과 숫자 기호를 안정적으로 연결하는 능력을 중심으로 해석합니다.",
      expertFocus: "일대일 대응, 숫자 기호화, 묶음 단위 이해를 함께 봅니다.",
      trainingTitle: "개수 세고 숫자 붙이기 훈련",
      trainingDesc: "물건을 하나씩 짚으며 세고, 마지막 수를 숫자 카드와 연결하는 과정을 반복해 주세요."
    },
    "calculation-procedure": {
      label: "연산 절차 정확형",
      family: "연산",
      primaryAxis: "calculation",
      secondaryAxis: "selfMonitoring",
      summary: "계산 절차를 순서대로 유지하고 결과를 점검하는 능력을 중심으로 해석합니다.",
      expertFocus: "연산 순서, 중간 단계 유지, 결과 확인 루틴을 함께 봅니다.",
      trainingTitle: "계산 단계 말하기 훈련",
      trainingDesc: "식을 바로 풀기보다 첫 단계, 다음 단계, 확인 단계를 말로 짚으며 계산하게 해 주세요."
    },
    "spatial-shape": {
      label: "공간 도형 지각형",
      family: "공간 지각",
      primaryAxis: "search",
      secondaryAxis: "memory",
      summary: "도형의 위치, 방향, 형태 차이를 지각하고 맞추는 공간 처리 능력을 중심으로 해석합니다.",
      expertFocus: "형태 비교, 위치 관계, 회전 또는 방향 단서 활용을 함께 봅니다.",
      trainingTitle: "도형 방향 비교 훈련",
      trainingDesc: "같은 도형을 다른 방향으로 놓고 어디가 같은지, 어디가 다른지 말한 뒤 맞추게 해 주세요."
    },
    "part-whole": {
      label: "부분-전체 통합형",
      family: "시각 통합",
      primaryAxis: "visualCue",
      secondaryAxis: "search",
      summary: "일부 단서를 전체 형태나 의미로 통합해 추론하는 능력을 중심으로 해석합니다.",
      expertFocus: "부분 단서 추출, 전체 형태 추론, 단서 통합 전략을 함께 봅니다.",
      trainingTitle: "부분 보고 전체 말하기 훈련",
      trainingDesc: "가려진 그림의 일부를 보고 가능한 후보를 말한 뒤, 추가 단서를 하나씩 열어가며 추론을 조정해 주세요."
    },
    "rule-shifting": {
      label: "규칙 전환 적응형",
      family: "인지 유연성",
      primaryAxis: "selfMonitoring",
      secondaryAxis: "attention",
      summary: "과제 규칙이 바뀔 때 이전 반응을 조절하고 새 기준에 맞게 적응하는 능력을 중심으로 해석합니다.",
      expertFocus: "규칙 전환, 이전 규칙 억제, 새 기준 적용 속도를 함께 봅니다.",
      trainingTitle: "규칙 바꾸기 훈련",
      trainingDesc: "처음에는 색 기준, 다음에는 모양 기준처럼 한 번에 하나의 기준만 바꾸며 새 규칙을 말하고 반응하게 해 주세요."
    },
    "clue-inference": {
      label: "단서 기반 추론형",
      family: "추론",
      primaryAxis: "visualCue",
      secondaryAxis: "language",
      summary: "제한된 단서를 해석해 가능한 답을 좁혀가는 추론 능력을 중심으로 해석합니다.",
      expertFocus: "단서 선택, 가설 수정, 설명 언어화를 함께 봅니다.",
      trainingTitle: "단서 말하고 추론하기 훈련",
      trainingDesc: "정답을 바로 말하기보다 보이는 단서, 아닌 것, 가능한 후보를 차례로 말하게 해 추론 과정을 구조화해 주세요."
    },
    "completion-persistence": {
      label: "과제 지속 완결형",
      family: "수행 완결성",
      primaryAxis: "completion",
      secondaryAxis: "attention",
      summary: "시작한 과제를 끝까지 유지하고 마무리하는 수행 완결성을 중심으로 해석합니다.",
      expertFocus: "세션 지속, 후반부 피로, 마무리 루틴을 함께 봅니다.",
      trainingTitle: "완료 목표 시각화 훈련",
      trainingDesc: "남은 문항 수를 눈에 보이게 표시하고, 짧은 완료 목표를 세워 끝까지 수행하는 경험을 강화해 주세요."
    },
    "adaptive-difficulty": {
      label: "난이도 적응 조절형",
      family: "학습 적응",
      primaryAxis: "accuracy",
      secondaryAxis: "selfMonitoring",
      summary: "난이도 변화에 맞춰 속도와 정확도 전략을 조절하는 학습 적응 능력을 중심으로 해석합니다.",
      expertFocus: "난이도 상승 반응, 전략 수정, 성공률 유지 범위를 함께 봅니다.",
      trainingTitle: "성공률 기준 난이도 조절 훈련",
      trainingDesc: "정확도 80% 이상이 유지될 때만 난이도를 올리고, 흔들리면 한 단계 낮춰 안정성을 먼저 회복해 주세요."
    }
  };

  const REPORT_PROFILE_KEYS = Object.keys(REPORT_PROFILES);

  const AXIS_CLINICAL_TERMS = {
    speed: {
      domain: "처리 속도 및 반응 개시",
      strong: [
        "자극 제시 이후 반응 개시가 지연 없이 이어지며 처리 효율이 안정적으로 유지되고 있습니다.",
        "시각적 정보 입력 후 선택 반응으로 전환되는 시간이 비교적 짧고 일정하게 유지됩니다.",
        "반응 개시 지연이 크지 않아 과제 흐름이 끊기지 않는 수행 패턴이 확인됩니다."
      ],
      moderate: [
        "기본적인 처리 속도는 확보되어 있으나 과제 부하가 높아질 때 반응 개시 시간이 다소 늘어날 수 있습니다.",
        "속도 저하는 크지 않지만 후반부 또는 복합 자극 조건에서 반응 편차가 일부 관찰될 수 있습니다.",
        "평균 반응 시간은 임상적으로 수용 가능한 수준이나 고난도 조건에서는 추가 안정화가 필요합니다."
      ],
      risk: [
        "반응 개시가 일정하지 않아 과제 난이도 상승 시 처리 지연이 두드러질 가능성이 있습니다.",
        "속도-정확도 균형이 아직 충분히 안정되지 않아 반응 시간의 변동성이 비교적 큽니다.",
        "처리 속도 유지가 어려워 과제 후반부에서 수행 효율 저하가 나타날 가능성을 시사합니다."
      ]
    },
    attention: {
      domain: "선택적 주의 및 지속적 주의",
      strong: [
        "목표 자극에 대한 선택적 주의 유지가 안정적이며 수행 중 주의 이탈이 크지 않습니다.",
        "과제 전반에서 주의 초점이 비교적 일정하게 유지되어 지속 수행력이 양호합니다.",
        "주의 자원을 과제에 재배치하는 회복력이 좋아 장면 전환 이후에도 집중이 안정적으로 이어집니다."
      ],
      moderate: [
        "선택적 주의는 유지되지만 세트 길이가 길어질수록 주의 지속 폭이 감소할 여지가 있습니다.",
        "집중 시작은 원활하나 중간 이후 주의 효율이 다소 낮아질 가능성이 있습니다.",
        "기본적인 주의 유지 능력은 보이나 난이도 상승 시 선택적 주의 통제가 흔들릴 수 있습니다."
      ],
      risk: [
        "지속적 주의 유지가 충분히 안정되지 않아 후반부에서 주의 이탈 가능성이 높습니다.",
        "선택적 주의 통제가 약화되면 비표적 자극에 반응이 분산될 소지가 있습니다.",
        "과제 길이가 길어질수록 집중 자원의 유지가 어려워 수행 편차가 커질 수 있습니다."
      ]
    },
    memory: {
      domain: "작업기억 및 순차 정보 유지",
      strong: [
        "과제 수행 중 핵심 정보를 단기적으로 유지하고 재사용하는 작업기억 효율이 양호합니다.",
        "순차적 정보 유지와 규칙 보존이 안정적으로 이루어져 다단계 과제 확장 가능성이 높습니다.",
        "즉각적인 정보 저장과 갱신이 비교적 원활하여 과제 구조를 안정적으로 따라갑니다."
      ],
      moderate: [
        "기본적인 정보 유지 능력은 보이나 기억 부하가 커질수록 재현 정확도가 저하될 수 있습니다.",
        "작업기억 기반은 확보되어 있으나 동시 처리 정보량이 많아지면 효율 저하가 예상됩니다.",
        "순차 유지 자체는 가능하나 재확인 과정이 길어지면서 수행 속도가 영향을 받을 수 있습니다."
      ],
      risk: [
        "작업기억 부하가 증가할수록 정보 유지 효율이 감소할 가능성이 높습니다.",
        "여러 단서를 동시에 보유해야 하는 조건에서 기억 유지와 갱신의 변동성이 크게 나타날 수 있습니다.",
        "순차 정보 재생 및 유지 전략이 아직 충분히 자동화되지 않아 추가 훈련이 필요합니다."
      ]
    },
    inhibition: {
      domain: "억제 통제 및 오류 모니터링",
      strong: [
        "비표적 자극에 대한 충동 반응을 비교적 잘 억제하며 오류 모니터링이 안정적으로 이루어집니다.",
        "반응 전 확인 과정이 유지되어 불필요한 오반응을 낮추는 통제력이 양호합니다.",
        "과제 요구에 맞지 않는 반응을 걸러내는 억제 조절이 전반적으로 안정적입니다."
      ],
      moderate: [
        "기본적인 억제 조절은 가능하나 시간 압박 조건에서 통제 효율이 저하될 수 있습니다.",
        "오류 이후 반응 속도가 빨라지면서 재확인 절차가 짧아질 가능성이 있습니다.",
        "충동 반응은 크지 않지만 과제 부담이 높아질수록 자기점검 루틴이 흔들릴 여지가 있습니다."
      ],
      risk: [
        "반응 억제와 오류 점검이 충분히 안정되지 않아 충동적 선택 가능성이 상대적으로 높습니다.",
        "시간 압박 또는 유사 자극 조건에서 오반응 억제가 어려울 수 있습니다.",
        "오류 직후 재확인 없이 즉시 반응하는 경향이 수행 정확도에 부담을 줄 가능성이 있습니다."
      ]
    },
    search: {
      domain: "시지각 탐색 및 표적 변별",
      strong: [
        "시각적 배열 내에서 표적을 탐색하고 변별하는 효율이 비교적 안정적으로 유지됩니다.",
        "넓은 보드 조건에서도 탐색 경로가 크게 무너지지 않아 표적 탐색 전략이 양호합니다.",
        "유사 자극 사이에서 핵심 특징을 빠르게 구분하는 시지각 변별력이 강점으로 확인됩니다."
      ],
      moderate: [
        "기본 탐색은 가능하나 자극량이 많아질수록 탐색 경로의 효율이 다소 낮아질 수 있습니다.",
        "표적 변별은 유지되지만 보드 복잡도가 상승하면 시각 탐색 시간이 늘어날 가능성이 있습니다.",
        "탐색 전략은 형성되어 있으나 넓은 시야 조건에서 재탐색 빈도가 증가할 수 있습니다."
      ],
      risk: [
        "시각 탐색 경로의 일관성이 낮아 표적 탐색 시간이 길어질 가능성이 높습니다.",
        "유사 자극 간 미세 차이 변별에서 부담이 커질 경우 탐색 오류가 증가할 수 있습니다.",
        "넓은 배열 조건에서 탐색 순서가 흔들리며 표적 누락 위험이 상대적으로 높습니다."
      ]
    },
    accuracy: {
      domain: "정반응 정확성 및 자기점검",
      strong: [
        "정반응 정확성이 안정적으로 유지되어 자기점검 과정이 비교적 잘 작동하고 있습니다.",
        "반응의 정밀도가 양호하며 오류 발생률이 낮아 수행 신뢰도가 높게 해석됩니다.",
        "초회 반응 정확성이 안정적이어서 과제 규칙을 일관되게 적용하는 능력이 확인됩니다."
      ],
      moderate: [
        "정확성은 전반적으로 양호하나 속도 압박 상황에서는 오반응이 증가할 수 있습니다.",
        "기본 정확도는 확보되어 있으나 후반부 피로 또는 반복 자극 조건에서 편차가 생길 수 있습니다.",
        "자기점검은 이루어지지만 세부 확인 절차가 짧아지면 정확도 저하 가능성이 있습니다."
      ],
      risk: [
        "정반응 정확성의 일관성이 낮아 과제 조건 변화에 따른 오류 증가가 예상됩니다.",
        "자기점검 절차가 충분히 자동화되지 않아 반응 신뢰도 확보가 우선 과제로 보입니다.",
        "초회 반응 정확도가 낮을 경우 반복 수정에 의존하는 수행 양상이 나타날 수 있습니다."
      ]
    },
    language: {
      domain: "언어 인출 및 음운-의미 연결",
      strong: [
        "목표 어휘 인출과 음운 단서 활용이 비교적 안정적으로 연결되고 있습니다.",
        "명칭 회상 과정이 원활하여 언어 인출 효율이 전반적으로 양호합니다.",
        "음운 정보와 의미 정보를 통합해 반응하는 흐름이 비교적 매끄럽게 유지됩니다."
      ],
      moderate: [
        "언어 인출은 가능하나 초회 반응의 즉시성은 자극 친숙도에 따라 다소 달라질 수 있습니다.",
        "음운 단서 활용은 유지되지만 인출 속도의 일관성은 추가 관찰이 필요합니다.",
        "명칭 회상 기반은 있으나 복합 자극 조건에서는 단서 의존도가 높아질 수 있습니다."
      ],
      risk: [
        "언어 인출의 즉시성이 낮아 단서가 주어져도 반응 안정성이 흔들릴 가능성이 있습니다.",
        "음운 단서와 의미 단서를 통합하는 과정에서 부하가 커질 경우 인출 지연이 예상됩니다.",
        "명칭 회상 효율이 충분히 안정되지 않아 반복적 인출 훈련이 필요한 상태로 해석됩니다."
      ]
    },
    visualCue: {
      domain: "시각 단서 활용 및 규칙 매칭",
      strong: [
        "시각 단서를 활용해 규칙을 빠르게 파악하고 적용하는 능력이 안정적으로 유지됩니다.",
        "핵심 단서를 추출해 과제 규칙으로 연결하는 과정이 비교적 효율적입니다.",
        "단서 기반 문제 해결 전략이 형성되어 있어 과제 구조 이해가 양호합니다."
      ],
      moderate: [
        "시각 단서 활용은 가능하나 단서 수가 늘어나면 처리 효율이 다소 낮아질 수 있습니다.",
        "핵심 단서를 찾는 능력은 보이나 복합 단서 조건에서는 재확인 빈도가 증가할 수 있습니다.",
        "규칙 매칭은 유지되지만 정보량이 많을수록 단서 선별 효율이 흔들릴 여지가 있습니다."
      ],
      risk: [
        "핵심 단서를 선택하고 유지하는 과정의 일관성이 낮아 규칙 적용 효율 저하가 예상됩니다.",
        "시각 단서 해석 이후 반응으로 이어지는 연결 과정에서 변동성이 크게 나타날 수 있습니다.",
        "복합 단서 조건에서 단서 간 우선순위를 정하는 데 어려움이 있을 가능성이 있습니다."
      ]
    },
    selfMonitoring: {
      domain: "자기 모니터링 및 수행 점검",
      strong: [
        "수행 중 자기점검이 안정적으로 이루어져 오류 이후에도 흐름을 비교적 잘 회복합니다.",
        "반응 전후 점검 루틴이 유지되어 수행 완결성과 정확도 보존에 도움이 되고 있습니다.",
        "자기 모니터링 능력이 양호하여 과제 규칙 이탈을 빠르게 수정하는 편입니다."
      ],
      moderate: [
        "자기점검은 이루어지나 시간 압박 상황에서 점검 깊이가 얕아질 수 있습니다.",
        "오류 이후 수정은 가능하지만 선제적 점검의 일관성은 추가 보강이 필요합니다.",
        "기본적인 모니터링 능력은 있으나 반복 자극 조건에서 확인 절차가 생략될 수 있습니다."
      ],
      risk: [
        "자기 모니터링의 자동화 수준이 낮아 오류 이후 즉각적인 조정이 어려울 수 있습니다.",
        "반응 전 확인 루틴이 충분히 정착되지 않아 수행 안정성 확보가 우선 과제로 보입니다.",
        "오류 인식 이후 재조정 과정에서 지연 또는 생략이 발생할 가능성이 있습니다."
      ]
    },
    completion: {
      domain: "과제 지속 및 수행 완결성",
      strong: [
        "과제 종료 시점까지 수행을 유지하는 완결성이 양호하여 세션 이탈 가능성이 낮습니다.",
        "과제 지속력과 마무리 효율이 안정적으로 관찰되어 훈련 확장 기반이 충분합니다.",
        "후반부까지 수행을 끌고 가는 힘이 유지되어 반복 세션 적응도가 양호합니다."
      ],
      moderate: [
        "과제 완결성은 확보되어 있으나 후반부 피로가 누적되면 속도 또는 정확도 저하가 나타날 수 있습니다.",
        "세션 유지 자체는 가능하나 장시간 조건에서는 집중 효율 저하가 동반될 수 있습니다.",
        "과제 마무리 능력은 있으나 부담이 증가하면 수행 리듬이 다소 느슨해질 가능성이 있습니다."
      ],
      risk: [
        "과제 지속과 마무리 과정의 안정성이 낮아 후반부 이탈 또는 효율 저하 가능성이 있습니다.",
        "수행 완결성 확보가 아직 충분하지 않아 짧은 단위 성공 경험 축적이 우선되어야 합니다.",
        "세션 후반으로 갈수록 수행 유지력이 감소할 가능성이 있어 구조화된 종료 루틴이 필요합니다."
      ]
    },
    numberSense: {
      domain: "수개념 형성 및 양-숫자 대응",
      strong: [
        "수량과 숫자 기호를 연결하는 기초 수개념이 비교적 안정적으로 형성되어 있습니다.",
        "수의 크기, 순서, 묶음 단위를 파악하는 흐름이 자연스럽게 이어져 기초 수 감각이 양호합니다.",
        "수 세기와 숫자 대응 과정에서 혼선이 크지 않아 수개념 기반이 잘 유지되고 있습니다."
      ],
      moderate: [
        "기본적인 수개념은 확보되어 있으나 자극 조건이 바뀌면 수량-숫자 대응 속도가 다소 흔들릴 수 있습니다.",
        "수의 순서와 크기 비교는 가능하지만 묶음 단위나 중간 수 개념에서는 재확인이 더 필요할 수 있습니다.",
        "기초 수 감각은 보이나 과제 형식이 달라질 때 개념 전이가 다소 느려질 여지가 있습니다."
      ],
      risk: [
        "수량과 숫자 기호를 연결하는 과정의 일관성이 낮아 기초 수개념 보강이 우선적으로 필요합니다.",
        "수의 크기나 순서를 안정적으로 유지하는 데 부담이 있어 단계적 수개념 훈련이 필요해 보입니다.",
        "양-숫자 대응이 충분히 자동화되지 않아 수 세기와 기호화 과정에서 혼선이 반복될 가능성이 있습니다."
      ]
    },
    calculation: {
      domain: "연산 절차 및 계산 정확성",
      strong: [
        "연산 절차를 비교적 안정적으로 따라가며 계산 정확성이 잘 유지되고 있습니다.",
        "수식 구조를 파악한 뒤 정답으로 연결하는 흐름이 자연스러워 계산 기반이 양호합니다.",
        "자리값과 연산 방향을 유지하는 힘이 좋아 계산 수행의 신뢰도가 높은 편입니다."
      ],
      moderate: [
        "기본적인 계산은 가능하지만 과제 부담이 높아지면 절차 확인 시간이 다소 길어질 수 있습니다.",
        "연산 정확도는 유지되나 자리값 또는 계산 순서를 점검하는 추가 루틴이 더 도움이 될 수 있습니다.",
        "기초 계산력은 보이나 난이도 상승 시 속도와 정확도의 균형이 흔들릴 가능성이 있습니다."
      ],
      risk: [
        "연산 절차 유지가 충분히 안정되지 않아 계산 중간 단계에서 오류가 누적될 가능성이 있습니다.",
        "계산 정확성을 보존하기 위한 자기점검 루틴이 아직 약해 구조화된 연산 연습이 필요합니다.",
        "자리값, 계산 순서, 결과 확인을 동시에 유지하는 데 부담이 커 추가적인 단계화 훈련이 권장됩니다."
      ]
    },
    timeSense: {
      domain: "시간 개념 이해 및 기준점 설정",
      strong: [
        "현재-과거-미래의 기준점을 비교적 안정적으로 세우며 시간 표현의 상대적 의미를 잘 구분합니다.",
        "오전·오후·저녁 또는 오늘·어제·내일처럼 시간 축 위의 위치를 비교적 정확하게 파악하고 있습니다.",
        "달력과 일과 장면을 시간말과 연결하는 과정이 자연스러워 시간 개념 표상이 안정적으로 형성되고 있습니다.",
        "기준 시점을 중심으로 시간 표현을 앞뒤로 이동해 해석하는 능력이 양호하여 시간말 이해가 비교적 정교합니다.",
        "생활 장면과 시간 어휘를 연결하는 의미 매핑이 안정적이어서 일상 기반 시간 개념이 잘 유지됩니다.",
        "지금을 기준으로 이전과 이후를 구분하는 시간 지남력이 비교적 또렷하게 유지되는 양상입니다."
      ],
      moderate: [
        "기본적인 시간 개념은 형성되어 있으나 유사한 시간 표현이 연속 제시될 때 기준점 유지가 다소 흔들릴 수 있습니다.",
        "오전·오후처럼 가까운 범주의 구분은 가능하지만 달·년 단위로 확장되면 추가 확인이 필요할 수 있습니다.",
        "시간 표현의 방향성은 이해하나 현재를 기준으로 앞뒤를 빠르게 전환하는 과정에서는 반응 편차가 남아 있습니다.",
        "생활 장면과 시간말 연결은 가능하지만 낯선 예시나 긴 시간 단위에서는 의미 고정이 조금 더 필요합니다.",
        "시간 축의 기본 구조는 따라가지만 복수 단서를 동시에 처리할 때 기준 시점이 일시적으로 흔들릴 수 있습니다.",
        "현재-이전-이후의 구조는 이해하나 달력형 정보와 언어 표현을 동시에 통합할 때 속도 저하가 예상됩니다."
      ],
      risk: [
        "시간 표현의 기준 시점을 안정적으로 고정하는 과정에 부담이 있어 상대적 시간 판단이 흔들릴 가능성이 있습니다.",
        "오늘·어제·내일처럼 가까운 시간 개념에서도 앞뒤 방향을 즉시 판단하는 데 추가 구조화가 필요해 보입니다.",
        "일상 장면을 시간말과 연결하는 의미 고리가 아직 충분히 자동화되지 않아 반복 학습이 우선 요구됩니다.",
        "현재를 기준으로 과거와 미래를 이동하는 시간 지남력이 불안정하여 시각적 단서 보조가 함께 필요합니다.",
        "달·년과 같은 긴 시간 단위로 갈수록 개념 표상이 약해져 언어적 설명보다 시각 구조화가 먼저 필요할 수 있습니다.",
        "시간 어휘를 장면에 적용하는 과정에서 기준점 전환이 늦어 의미 판단의 일관성이 낮아질 가능성이 있습니다."
      ]
    },
    sequencing: {
      domain: "시간 순서 조직화 및 연속성 파악",
      strong: [
        "시간 표현을 선형 순서로 조직하는 능력이 안정적이어서 앞뒤 관계를 비교적 빠르게 정렬합니다.",
        "오전-오후-저녁 또는 오늘-내일-모레처럼 연속되는 시간 흐름을 자연스럽게 배열하는 강점이 확인됩니다.",
        "순차적 장면 배열에서 시간 흐름을 유지하는 힘이 좋아 사건 순서화와 계획 언어 기반이 양호합니다.",
        "시간 단서를 연속된 이야기 구조로 묶는 능력이 비교적 좋아 하루와 달력 흐름을 일관되게 해석합니다.",
        "장면 간 시간 관계를 앞뒤로 배치하는 전략이 안정적이라 순서 배열 과제의 수행 완결성이 높습니다.",
        "순서화 과정에서 큰 혼선이 없어 시간 표현을 구조적으로 묶어 이해하는 능력이 잘 보존됩니다."
      ],
      moderate: [
        "기본적인 시간 순서는 파악하나 유사한 장면이 섞일 때 배열 전략의 속도와 안정성이 다소 낮아질 수 있습니다.",
        "순차 구조는 이해하지만 중간 단계가 많아질수록 다시 확인하는 빈도가 늘어날 가능성이 있습니다.",
        "앞뒤 순서를 맞추는 기초는 있으나 과제 부담이 높아지면 배열 리듬이 느슨해질 수 있습니다.",
        "시간 흐름 자체는 알고 있으나 실제 카드를 놓거나 이동하는 과정에서 재정렬 시간이 더 필요할 수 있습니다.",
        "순서화 전략은 형성되어 있으나 유사 범주 간 경계가 겹치면 일시적 혼선이 나타날 수 있습니다.",
        "연속되는 시간 표현을 구성하는 힘은 있으나 여러 개념을 동시에 비교할 때 작업 효율이 다소 낮아집니다."
      ],
      risk: [
        "시간 순서를 선형으로 조직하는 과정이 아직 충분히 안정되지 않아 배열 오류가 반복될 수 있습니다.",
        "앞뒤 개념을 구분하더라도 실제 순서로 배치하는 과정에서 혼선이 커 구조화된 반복이 필요합니다.",
        "시간 흐름을 이야기처럼 연결하는 능력이 약해 중간 단계를 생략하거나 위치를 바꾸는 오류가 예상됩니다.",
        "연속성 파악이 불안정하여 순서 배열 과제에서 자기 수정 이전에 외부 단서 지원이 필요할 수 있습니다.",
        "유사한 시간 장면이 섞이면 배열 전략이 쉽게 흔들려 순차적 판단의 일관성 확보가 우선 과제로 보입니다.",
        "시간 표현의 연결 고리를 유지하는 힘이 낮아 작업기억 보조와 단계적 순서화 훈련이 함께 요구됩니다."
      ]
    }
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round(value) {
    return Math.round(Number(value || 0));
  }

  function average(list) {
    if (!Array.isArray(list) || !list.length) return 0;
    return list.reduce(function (sum, value) {
      return sum + Number(value || 0);
    }, 0) / list.length;
  }

  function hashString(input) {
    const text = String(input || "");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function pick(list, seed, salt) {
    if (!Array.isArray(list) || !list.length) return "";
    const index = Math.abs(hashString(String(seed) + "::" + String(salt))) % list.length;
    return list[index];
  }

  function getNormProfile(input) {
    const requestedKey = input && input.normProfile && NORM_PROFILES[input.normProfile]
      ? input.normProfile
      : DEFAULT_NORM_PROFILE;
    const profile = NORM_PROFILES[requestedKey] || NORM_PROFILES[DEFAULT_NORM_PROFILE];
    return {
      key: NORM_PROFILES[requestedKey] ? requestedKey : DEFAULT_NORM_PROFILE,
      profile: profile
    };
  }

  function getAxisProfile(axis) {
    const fallbackLabel = axis && axis.label ? axis.label : "핵심 수행";
    return AXIS_CLINICAL_TERMS[axis && axis.id] || {
      domain: fallbackLabel,
      strong: [
        "해당 수행 영역의 효율이 비교적 안정적으로 유지되고 있습니다."
      ],
      moderate: [
        "기본 수행은 가능하나 난이도 상승 시 추가 안정화가 필요합니다."
      ],
      risk: [
        "수행 변동성이 비교적 커 추가 중재 필요성이 시사됩니다."
      ]
    };
  }

  function getAxisClinicalComment(axis, seed, salt, normProfile) {
    const profile = getAxisProfile(axis);
    const cutoffs = normProfile && normProfile.clinicalCutoffs
      ? normProfile.clinicalCutoffs
      : NORM_PROFILES[DEFAULT_NORM_PROFILE].clinicalCutoffs;
    const bucket = axis && axis.score >= cutoffs.strong
      ? "strong"
      : axis && axis.score >= cutoffs.moderate
        ? "moderate"
        : "risk";
    return pick(profile[bucket], seed, String(salt) + "-" + String(axis && axis.id || "axis") + "-" + bucket);
  }

  function getReportProfile(input, axes) {
    const requested = String(input && (input.reportProfileId || input.reportProfile || input.profileId) || "").trim();
    if (REPORT_PROFILES[requested]) return Object.assign({ id: requested }, REPORT_PROFILES[requested]);

    const reportType = String(input && input.reportType || "");
    const title = String(input && (input.title || input.stageTitle || input.labTitle || "") || "");
    const focusKey = String(input && input.focusKey || "").toLowerCase();
    const domain = String(input && input.domain || "").toLowerCase();
    const lowered = (reportType + " " + title + " " + focusKey + " " + domain).toLowerCase();
    let profileKey = "";

    if (reportType === "standalone-color-trace") profileKey = "visual-sequential-scan";
    else if (reportType === "standalone-color-memory") profileKey = "memory-color-binding";
    else if (reportType === "standalone-doorlock") profileKey = "memory-sequence";
    else if (reportType === "standalone-icon-find") profileKey = "visual-search-basic";
    else if (reportType === "standalone-icon-odd-find") profileKey = "visual-discrimination";
    else if (reportType === "rehablab-shape-match-gonogo") profileKey = "inhibition-impulse";
    else if (reportType === "rehablab-traffic-go-nogo") profileKey = "inhibition-impulse";
    else if (reportType === "rehablab-stroop-color-word") profileKey = "rule-shifting";
    else if (reportType === "rehab-cognitive-legacy" && /(working-memory|sequential|associative|memory|기억)/i.test(lowered)) profileKey = "memory-working-load";
    else if (reportType === "rehab-cognitive-legacy" && /(trail|hanoi|planning|pattern|symbol|balance|계획|추론|문제해결|전환)/i.test(lowered)) profileKey = "rule-shifting";
    else if (reportType === "rehab-cognitive-legacy" && /(rotation|figure|spatial|visual|시각|시지각|공간|변별|탐색)/i.test(lowered)) profileKey = "visual-discrimination";
    else if (reportType === "rehab-cognitive-legacy" && /(language|sound|syllable|word|언어|음운|명칭)/i.test(lowered)) profileKey = "lexical-semantic";
    else if (reportType === "standalone-shape") profileKey = "spatial-shape";
    else if (reportType === "language-sound-find") profileKey = "auditory-discrimination";
    else if (reportType === "language-syllable-find") profileKey = "syllable-assembly";
    else if (reportType === "time-dayparts-quiz") profileKey = "time-concept";
    else if (reportType === "time-dayparts-sequence") profileKey = "temporal-sequencing";
    else if (reportType === "time-dayparts-relative") profileKey = "relative-time";
    else if (reportType === "numberlab-number-sense") profileKey = "number-sense";
    else if (reportType === "numberlab-number-bundle") profileKey = "quantity-symbol";
    else if (reportType === "numberlab-number-calc") profileKey = "calculation-procedure";
    else if (reportType === "review-name" && /(스포트라이트|spotlight|추론|카드)/i.test(lowered)) profileKey = "clue-inference";
    else if (reportType === "review-name" && /(이름|명칭|name)/i.test(lowered)) profileKey = "naming-fluency";

    if (!profileKey && Array.isArray(axes) && axes.length) {
      const sorted = axes.slice().sort(function (left, right) {
        return Number(right.score || 0) - Number(left.score || 0);
      });
      const weakest = sorted[sorted.length - 1];
      if (weakest && weakest.id === "speed") profileKey = "processing-speed";
      else if (weakest && weakest.id === "attention") profileKey = "visual-attention-sustain";
      else if (weakest && weakest.id === "memory") profileKey = "memory-working-load";
      else if (weakest && weakest.id === "inhibition") profileKey = "inhibition-impulse";
      else if (weakest && weakest.id === "selfMonitoring") profileKey = "self-monitoring-error";
      else if (weakest && weakest.id === "completion") profileKey = "completion-persistence";
      else if (weakest && weakest.id === "language") profileKey = "lexical-semantic";
      else if (weakest && weakest.id === "timeSense") profileKey = "time-concept";
      else if (weakest && weakest.id === "sequencing") profileKey = "temporal-sequencing";
      else if (weakest && weakest.id === "numberSense") profileKey = "number-sense";
      else if (weakest && weakest.id === "calculation") profileKey = "calculation-procedure";
      else if (weakest && weakest.id === "accuracy") profileKey = "adaptive-difficulty";
      else if (weakest && weakest.id === "visualCue") profileKey = "part-whole";
      else profileKey = "visual-search-basic";
    }

    const resolvedKey = REPORT_PROFILES[profileKey] ? profileKey : "adaptive-difficulty";
    return Object.assign({ id: resolvedKey }, REPORT_PROFILES[resolvedKey]);
  }

  function getProfileAxis(reportProfile, axisLabels, fallbackAxis) {
    if (!reportProfile || !axisLabels) return fallbackAxis;
    return axisLabels[reportProfile.primaryAxis] || axisLabels[reportProfile.secondaryAxis] || fallbackAxis;
  }

  function getProfileSentence(reportProfile, seed, salt) {
    if (!reportProfile) return "";
    return pick([
      reportProfile.label + " 관점에서는 " + reportProfile.summary,
      reportProfile.family + " 영역을 중심으로 보면 " + reportProfile.expertFocus,
      "이 결과는 " + reportProfile.label + " 프로파일로 분류되며, " + reportProfile.summary
    ], seed, "profile-" + String(salt || "sentence") + "-" + String(reportProfile.id || reportProfile.label));
  }

  function formatDuration(totalMs) {
    const totalSeconds = Math.max(0, Math.round(Number(totalMs || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function formatSeconds(totalMs) {
    const seconds = Number(totalMs || 0) / 1000;
    if (!Number.isFinite(seconds) || seconds <= 0) return "-";
    return seconds.toFixed(seconds >= 10 ? 1 : 2) + "초";
  }

  function getBand(score, normProfile) {
    const safeScore = round(score);
    const scoreBands = normProfile && Array.isArray(normProfile.scoreBands) && normProfile.scoreBands.length
      ? normProfile.scoreBands
      : NORM_PROFILES[DEFAULT_NORM_PROFILE].scoreBands;
    for (let index = 0; index < scoreBands.length; index += 1) {
      if (safeScore >= scoreBands[index].min) return scoreBands[index];
    }
    return scoreBands[scoreBands.length - 1];
  }

  function getPercent(part, total) {
    const denominator = Math.max(1, Number(total || 0));
    return clamp(round((Number(part || 0) / denominator) * 100), 0, 100);
  }

  function speedScore(avgMs, benchmarkMs, difficultyBoost) {
    const safeAvg = Math.max(350, Number(avgMs || benchmarkMs || 1));
    const safeBenchmark = Math.max(350, Number(benchmarkMs || safeAvg));
    const ratio = safeBenchmark / safeAvg;
    const base = 66 + ((ratio - 1) * 34) + Number(difficultyBoost || 0);
    return clamp(round(base), 24, 99);
  }

  function consistencyScore(logs) {
    if (!Array.isArray(logs) || logs.length < 2) return 72;
    const durations = logs
      .map(function (entry) {
        return Number(entry.durationMs || 0);
      })
      .filter(function (value) {
        return value > 0;
      });
    if (durations.length < 2) return 72;
    const mean = average(durations);
    if (!mean) return 72;
    const variance = average(durations.map(function (value) {
      const distance = value - mean;
      return distance * distance;
    }));
    const cv = Math.sqrt(variance) / mean;
    return clamp(round(92 - (cv * 68)), 36, 98);
  }

  function renderRadarSvg(axes, accentColor) {
    const axisCount = Array.isArray(axes) ? axes.length : 0;
    if (!axisCount) return "";
    const center = 110;
    const radius = 82;
    const levels = [0.25, 0.5, 0.75, 1];
    const angleStep = (Math.PI * 2) / axisCount;

    function pointAt(score, index, distanceFactor) {
      const angle = (-Math.PI / 2) + (angleStep * index);
      const factor = typeof distanceFactor === "number" ? distanceFactor : clamp(Number(score || 0), 0, 100) / 100;
      return {
        x: center + (Math.cos(angle) * radius * factor),
        y: center + (Math.sin(angle) * radius * factor)
      };
    }

    const gridPolygons = levels.map(function (level, gridIndex) {
      const points = axes.map(function (_axis, axisIndex) {
        const point = pointAt(100, axisIndex, level);
        return point.x.toFixed(2) + "," + point.y.toFixed(2);
      }).join(" ");
      return '<polygon class="playlab-report-radar-grid level-' + gridIndex + '" points="' + points + '"></polygon>';
    }).join("");

    const spokes = axes.map(function (_axis, axisIndex) {
      const point = pointAt(100, axisIndex, 1);
      return '<line class="playlab-report-radar-spoke" x1="' + center + '" y1="' + center + '" x2="' + point.x.toFixed(2) + '" y2="' + point.y.toFixed(2) + '"></line>';
    }).join("");

    const polygonPoints = axes.map(function (axis, axisIndex) {
      const point = pointAt(axis.score, axisIndex);
      return point.x.toFixed(2) + "," + point.y.toFixed(2);
    }).join(" ");

    const dots = axes.map(function (axis, axisIndex) {
      const point = pointAt(axis.score, axisIndex);
      return '<circle class="playlab-report-radar-dot" cx="' + point.x.toFixed(2) + '" cy="' + point.y.toFixed(2) + '" r="4.5"></circle>';
    }).join("");

    const labels = axes.map(function (axis, axisIndex) {
      const point = pointAt(100, axisIndex, 1.18);
      return '<text class="playlab-report-radar-label" x="' + point.x.toFixed(2) + '" y="' + point.y.toFixed(2) + '">' + escapeHtml(axis.label) + "</text>";
    }).join("");

    return '' +
      '<svg class="playlab-report-radar" viewBox="0 0 220 220" role="img" aria-label="이번 과제 비표준화 자동 관찰값 방사형 요약" style="--playlab-report-accent:' + escapeHtml(accentColor || DEFAULT_ACCENT) + ';">' +
        '<g class="playlab-report-radar-grid-wrap">' + gridPolygons + "</g>" +
        '<g class="playlab-report-radar-spokes">' + spokes + "</g>" +
        '<polygon class="playlab-report-radar-area" points="' + polygonPoints + '"></polygon>' +
        '<polyline class="playlab-report-radar-line" points="' + polygonPoints + '"></polyline>' +
        '<g class="playlab-report-radar-dots">' + dots + "</g>" +
        '<g class="playlab-report-radar-labels">' + labels + "</g>" +
      "</svg>";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderReportRadarFigure(report) {
    return '<div class="playlab-report-radar-figure">' + renderRadarSvg(report.axes, report.accentColor) + '</div>';
  }

  function splitSentences(value) {
    const normalized = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    if (!normalized) return [];
    const matches = normalized.match(/[^.]+(?:\.|$)/g);
    if (!matches) return [normalized];
    return matches.map(function (sentence) {
      return sentence.trim();
    }).filter(Boolean);
  }

  function formatRichText(value) {
    const sentences = splitSentences(value);
    if (!sentences.length) return escapeHtml(value);
    return sentences.map(function (sentence, index) {
      const isLead = index === 0;
      const isWatch = /(보완|필요|우선|권장|저하|위험|부담|낮아질|흔들|변동|추가 중재)/.test(sentence);
      const isStrong = !isWatch && /(강점|양호|우수|안정|확인되|보존|높습니다|가능성이 높|효율이)/.test(sentence);
      const toneClass = isLead ? " is-lead" : isWatch ? " is-watch" : isStrong ? " is-strong" : "";
      return '<span class="playlab-report-sentence' + toneClass + '">' + escapeHtml(sentence) + "</span>";
    }).join("<br>");
  }

  function getAxisPreset(reportType) {
    if (reportType === "standalone-doorlock") return AXIS_PRESETS.doorlock;
    if (String(reportType || "").indexOf("time-dayparts-") === 0) return AXIS_PRESETS.time;
    if (String(reportType || "").indexOf("numberlab-") === 0) return AXIS_PRESETS.number;
    if (reportType === "review-name") return AXIS_PRESETS.review;
    if (reportType === "language-sound-find" || reportType === "language-syllable-find") return AXIS_PRESETS.language;
    return AXIS_PRESETS.visual;
  }

  function buildAxisScores(input) {
    const reportType = String(input.reportType || "");
    const normProfile = getNormProfile(input).profile;
    const total = Math.max(1, Number(input.totalItems || input.totalQuestions || 0));
    const correct = Number(input.correctCount ?? input.seenCount ?? 0);
    const completion = Number(input.completionCount ?? correct);
    const wrong = Number(input.wrongCount ?? input.retryCount ?? 0);
    const replay = Number(input.replayCount || 0);
    const visualReplay = Number(input.visualReplayCount || 0);
    const audioReplay = Number(input.audioReplayCount || 0);
    const perfect = Number(input.perfectCount || 0);
    const elapsedMs = Math.max(0, Number(input.elapsedMs || 0));
    const questionLogs = Array.isArray(input.questionLogs) ? input.questionLogs : [];
    const avgMs = Number(input.avgQuestionMs ?? (completion > 0 ? elapsedMs / completion : 0)) || 0;
    const firstTryRate = input.firstTryRate != null
      ? clamp(round(Number(input.firstTryRate)), 0, 100)
      : getPercent(perfect || Math.max(0, correct - wrong), total);
    const accuracyRate = input.accuracyRate != null
      ? clamp(round(Number(input.accuracyRate)), 0, 100)
      : getPercent(correct, total);
    const completionRate = input.completionRate != null
      ? clamp(round(Number(input.completionRate)), 0, 100)
      : getPercent(completion, total);
    const consistency = consistencyScore(questionLogs);
    const difficulty = Number(input.difficultyIndex || 0);
    const benchmarkMs = Number(input.benchmarkMs || 6000);
    const difficultyBoostScale = Number(normProfile.difficultyBoostScale || 2.4);
    const baseSpeed = speedScore(avgMs || benchmarkMs, benchmarkMs, difficulty * difficultyBoostScale);

    if (reportType === "standalone-color-memory") {
      return {
        speed: baseSpeed,
        attention: clamp(round((accuracyRate * 0.44) + (firstTryRate * 0.24) + (consistency * 0.18) + (completionRate * 0.14)), 28, 99),
        memory: clamp(round((accuracyRate * 0.48) + (firstTryRate * 0.18) + 22 + (difficulty * 18)), 25, 99),
        inhibition: clamp(round((100 - (wrong * 7)) * 0.54 + (firstTryRate * 0.26) + (consistency * 0.2)), 22, 98),
        search: clamp(round((accuracyRate * 0.36) + (baseSpeed * 0.24) + 30 + (difficulty * 10)), 22, 97),
        accuracy: clamp(round((accuracyRate * 0.62) + (firstTryRate * 0.22) + (consistency * 0.16)), 20, 99)
      };
    }

    if (reportType === "standalone-color-trace") {
      return {
        speed: baseSpeed,
        attention: clamp(round((accuracyRate * 0.46) + (consistency * 0.22) + (firstTryRate * 0.18) + (completionRate * 0.14)), 24, 99),
        memory: clamp(round((accuracyRate * 0.38) + (firstTryRate * 0.24) + 28 + (difficulty * 15)), 24, 98),
        inhibition: clamp(round((100 - (wrong * 7)) * 0.58 + (consistency * 0.16) + (firstTryRate * 0.26)), 20, 97),
        search: clamp(round((accuracyRate * 0.3) + (baseSpeed * 0.24) + 28 + (difficulty * 16)), 20, 96),
        accuracy: clamp(round((accuracyRate * 0.66) + (firstTryRate * 0.18) + (consistency * 0.16)), 20, 99)
      };
    }

    if (reportType === "standalone-icon-find" || reportType === "standalone-icon-odd-find") {
      const inhibitionBoost = reportType === "standalone-icon-odd-find" ? 12 : 6;
      return {
        speed: baseSpeed,
        attention: clamp(round((accuracyRate * 0.36) + (completionRate * 0.18) + (consistency * 0.2) + (baseSpeed * 0.26)), 22, 99),
        memory: clamp(round((accuracyRate * 0.24) + (consistency * 0.22) + 26 + (difficulty * 10)), 20, 95),
        inhibition: clamp(round((100 - (wrong * 8)) * 0.52 + (firstTryRate * 0.24) + (consistency * 0.14) + inhibitionBoost), 18, 99),
        search: clamp(round((accuracyRate * 0.34) + (baseSpeed * 0.24) + 26 + (difficulty * 22)), 24, 99),
        accuracy: clamp(round((accuracyRate * 0.58) + (firstTryRate * 0.22) + (completionRate * 0.2)), 20, 99)
      };
    }

    if (reportType === "standalone-doorlock") {
      const isAudioMode = String(input.mode || "").indexOf("audio") >= 0;
      const sequenceLength = Math.max(4, Number(input.sequenceLength || 4));
      const memoryLoad = clamp((sequenceLength - 3) / 3, 0.18, 1);
      const replayPenalty = Math.min(18, replay * 4);
      const visualCuePenalty = Math.min(22, visualReplay * 6);
      const audioCuePenalty = Math.min(20, audioReplay * 5);
      return {
        speed: clamp(round(baseSpeed * (isAudioMode ? 0.92 : 0.98) + 4), 22, 98),
        attention: clamp(round((accuracyRate * 0.34) + (completionRate * 0.18) + (consistency * 0.2) + (baseSpeed * 0.18) + 12 - (replayPenalty * 0.32) - (visualCuePenalty * 0.34) - (audioCuePenalty * 0.28)), 22, 99),
        memory: clamp(round((accuracyRate * 0.42) + (firstTryRate * 0.2) + 22 + (memoryLoad * 16) + (isAudioMode ? 4 : 0) - replayPenalty - (visualCuePenalty * 0.68) - (audioCuePenalty * 0.58)), 24, 99),
        sequencing: clamp(round((accuracyRate * 0.36) + (firstTryRate * 0.22) + (consistency * 0.18) + 20 + (memoryLoad * 14) - (replayPenalty * 0.52) - (visualCuePenalty * 0.74) - (audioCuePenalty * 0.62)), 24, 99),
        inhibition: clamp(round((100 - (wrong * 9) - (replay * 3)) * 0.5 + (firstTryRate * 0.24) + (consistency * 0.14) + 10), 18, 98),
        accuracy: clamp(round((accuracyRate * 0.64) + (firstTryRate * 0.22) + (completionRate * 0.14) - (replayPenalty * 0.28)), 20, 99)
      };
    }

    if (reportType === "standalone-shape") {
      return {
        speed: baseSpeed,
        attention: clamp(round((accuracyRate * 0.42) + (firstTryRate * 0.2) + (consistency * 0.18) + 16), 22, 96),
        memory: clamp(round((accuracyRate * 0.24) + 34 + (difficulty * 12) + (consistency * 0.16)), 24, 95),
        inhibition: clamp(round((100 - (wrong * 7)) * 0.48 + (firstTryRate * 0.26) + 12), 22, 97),
        search: clamp(round((accuracyRate * 0.42) + (baseSpeed * 0.18) + 20 + (difficulty * 16)), 22, 97),
        accuracy: clamp(round((accuracyRate * 0.66) + (firstTryRate * 0.2) + (consistency * 0.14)), 22, 99)
      };
    }

    if (reportType === "language-sound-find") {
      return {
        speed: baseSpeed,
        attention: clamp(round((completionRate * 0.24) + (firstTryRate * 0.34) + (baseSpeed * 0.18) + 22), 24, 98),
        memory: clamp(round((firstTryRate * 0.28) + (accuracyRate * 0.2) + 30 + (difficulty * 8)), 22, 96),
        inhibition: clamp(round((100 - (wrong * 10)) * 0.54 + (firstTryRate * 0.24) + 8), 22, 98),
        language: clamp(round((firstTryRate * 0.42) + (completionRate * 0.2) + (baseSpeed * 0.14) + 24), 24, 99),
        accuracy: clamp(round((firstTryRate * 0.72) + (completionRate * 0.18) + 10), 20, 99)
      };
    }

    if (reportType === "language-syllable-find") {
      return {
        speed: baseSpeed,
        attention: clamp(round((completionRate * 0.22) + (firstTryRate * 0.34) + (baseSpeed * 0.18) + 22), 24, 98),
        memory: clamp(round((firstTryRate * 0.3) + 28 + (difficulty * 12) + (consistency * 0.12)), 24, 98),
        inhibition: clamp(round((100 - (wrong * 10)) * 0.5 + (firstTryRate * 0.24) + 12), 22, 98),
        language: clamp(round((firstTryRate * 0.38) + (completionRate * 0.16) + 30 + (difficulty * 12)), 24, 99),
        accuracy: clamp(round((firstTryRate * 0.72) + (completionRate * 0.16) + 12), 20, 99)
      };
    }

    if (reportType === "numberlab-number-sense") {
      return {
        speed: clamp(round(baseSpeed * 0.94 + 4), 24, 98),
        attention: clamp(round((accuracyRate * 0.26) + (completionRate * 0.22) + (consistency * 0.22) + (baseSpeed * 0.18) + 18), 24, 98),
        numberSense: clamp(round((accuracyRate * 0.4) + (firstTryRate * 0.18) + (completionRate * 0.14) + 24 + (difficulty * 16)), 26, 99),
        calculation: clamp(round((accuracyRate * 0.3) + (firstTryRate * 0.12) + 18 + (difficulty * 10)), 22, 96),
        memory: clamp(round((accuracyRate * 0.18) + (consistency * 0.2) + 26 + (difficulty * 10)), 24, 96),
        selfMonitoring: clamp(round((100 - (wrong * 10)) * 0.46 + (consistency * 0.22) + (firstTryRate * 0.18)), 24, 98)
      };
    }

    if (reportType === "numberlab-number-bundle") {
      return {
        speed: clamp(round(baseSpeed * 0.92 + 6), 24, 98),
        attention: clamp(round((accuracyRate * 0.24) + (completionRate * 0.2) + (consistency * 0.24) + (baseSpeed * 0.16) + 18), 24, 98),
        numberSense: clamp(round((accuracyRate * 0.34) + (completionRate * 0.18) + 24 + (difficulty * 18)), 24, 99),
        calculation: clamp(round((accuracyRate * 0.28) + (firstTryRate * 0.16) + 22 + (difficulty * 14)), 24, 98),
        memory: clamp(round((accuracyRate * 0.2) + (consistency * 0.22) + 28 + (difficulty * 18)), 24, 98),
        selfMonitoring: clamp(round((100 - (wrong * 10)) * 0.44 + (consistency * 0.24) + (firstTryRate * 0.18)), 24, 98)
      };
    }

    if (reportType === "numberlab-number-calc") {
      return {
        speed: clamp(round(baseSpeed * 0.9 + 6), 22, 98),
        attention: clamp(round((accuracyRate * 0.24) + (completionRate * 0.18) + (consistency * 0.2) + (baseSpeed * 0.18) + 18), 24, 98),
        numberSense: clamp(round((accuracyRate * 0.24) + 22 + (difficulty * 14) + (firstTryRate * 0.12)), 24, 97),
        calculation: clamp(round((accuracyRate * 0.42) + (firstTryRate * 0.18) + (completionRate * 0.12) + 22 + (difficulty * 18)), 26, 99),
        memory: clamp(round((accuracyRate * 0.2) + (consistency * 0.22) + 26 + (difficulty * 16)), 24, 98),
        selfMonitoring: clamp(round((100 - (wrong * 10)) * 0.48 + (consistency * 0.22) + (firstTryRate * 0.14)), 24, 99)
      };
    }

    if (reportType === "review-name") {
      const assistedRate = clamp(round(Number(input.assistedRate || input.promptedCorrectRate || 0) || 0), 0, 100);
      const independentAccuracy = clamp(round(Number(input.independentAccuracyRate ?? input.firstTryRate ?? accuracyRate) || 0), 0, 100);
      const cueRecovery = clamp(round(Math.max(0, accuracyRate - independentAccuracy)), 0, 100);
      return {
        speed: baseSpeed,
        attention: clamp(round((accuracyRate * 0.24) + (completionRate * 0.18) + (consistency * 0.22) + (baseSpeed * 0.18) + 16 - (assistedRate * 0.08)), 24, 99),
        visualCue: clamp(round((accuracyRate * 0.3) + (independentAccuracy * 0.12) + (cueRecovery * 0.18) + (completionRate * 0.16) + (consistency * 0.14) + 22 + (difficulty * 8)), 26, 99),
        language: clamp(round((independentAccuracy * 0.38) + (accuracyRate * 0.14) + (firstTryRate * 0.14) + (baseSpeed * 0.1) + 24 - (assistedRate * 0.1)), 24, 99),
        selfMonitoring: clamp(round(((100 - (wrong * 8)) * 0.4) + (independentAccuracy * 0.18) + (cueRecovery * 0.16) + (consistency * 0.16) + 14), 24, 98),
        completion: clamp(round((completionRate * 0.74) + (accuracyRate * 0.12) + 10), 20, 99)
      };
    }

    if (reportType === "time-dayparts-quiz") {
      const conceptCoverage = clamp(round(Number(input.conceptCoverage || accuracyRate)), 0, 100);
      const correctionRecovery = clamp(round(Number(input.correctionRecoveryRate || Math.max(0, 100 - (wrong * 6)))), 0, 100);
      return {
        speed: clamp(round(baseSpeed * 0.96 + 4), 24, 99),
        attention: clamp(round((accuracyRate * 0.3) + (completionRate * 0.18) + (consistency * 0.2) + (baseSpeed * 0.16) + 16), 24, 99),
        timeSense: clamp(round((accuracyRate * 0.34) + (firstTryRate * 0.2) + (conceptCoverage * 0.24) + 14 + (difficulty * 12)), 26, 99),
        sequencing: clamp(round((firstTryRate * 0.26) + (consistency * 0.24) + (accuracyRate * 0.18) + 18 + (difficulty * 10)), 24, 98),
        language: clamp(round((accuracyRate * 0.28) + (firstTryRate * 0.22) + (completionRate * 0.16) + 16), 24, 98),
        selfMonitoring: clamp(round((correctionRecovery * 0.46) + (consistency * 0.2) + (firstTryRate * 0.18) + 12), 24, 98)
      };
    }

    if (reportType === "time-dayparts-sequence") {
      const placementAccuracy = clamp(round(Number(input.placementAccuracy || accuracyRate)), 0, 100);
      const transitionStability = clamp(round(Number(input.transitionStability || consistency)), 0, 100);
      return {
        speed: clamp(round(baseSpeed * 0.92 + 6), 24, 98),
        attention: clamp(round((completionRate * 0.28) + (transitionStability * 0.24) + (baseSpeed * 0.18) + 18), 24, 98),
        timeSense: clamp(round((placementAccuracy * 0.3) + (firstTryRate * 0.18) + (completionRate * 0.16) + 20 + (difficulty * 12)), 26, 99),
        sequencing: clamp(round((placementAccuracy * 0.34) + (firstTryRate * 0.24) + (transitionStability * 0.18) + 20 + (difficulty * 16)), 28, 99),
        language: clamp(round((placementAccuracy * 0.22) + (completionRate * 0.18) + (firstTryRate * 0.18) + 18), 24, 97),
        selfMonitoring: clamp(round(((100 - (wrong * 7)) * 0.46) + (transitionStability * 0.22) + (firstTryRate * 0.16) + 12), 24, 98)
      };
    }

    if (reportType === "time-dayparts-relative") {
      const cueTracking = clamp(round(Number(input.cueTracking || completionRate)), 0, 100);
      return {
        speed: clamp(round(baseSpeed * 0.9 + 8), 24, 96),
        attention: clamp(round((completionRate * 0.3) + (consistency * 0.2) + 22), 24, 96),
        timeSense: clamp(round((completionRate * 0.34) + (cueTracking * 0.24) + 20 + (difficulty * 10)), 28, 98),
        sequencing: clamp(round((completionRate * 0.28) + (consistency * 0.24) + (cueTracking * 0.18) + 18), 26, 97),
        language: clamp(round((completionRate * 0.24) + (cueTracking * 0.2) + 22), 24, 96),
        selfMonitoring: clamp(round((completionRate * 0.22) + (consistency * 0.22) + 28), 26, 96)
      };
    }

    return {
      speed: baseSpeed,
      attention: clamp(round((completionRate * 0.36) + (baseSpeed * 0.22) + 22), 24, 97),
      visualCue: clamp(round((completionRate * 0.34) + 30 + (difficulty * 8)), 26, 95),
      language: clamp(round((completionRate * 0.36) + (baseSpeed * 0.14) + 22), 24, 97),
      selfMonitoring: clamp(round((completionRate * 0.22) + (baseSpeed * 0.12) + 42), 30, 96),
      completion: clamp(round((completionRate * 0.76) + 10), 20, 99)
    };
  }

  function getIntegratedScore(axisList) {
    if (!Array.isArray(axisList) || !axisList.length) return 0;
    return round(axisList.reduce(function (sum, axis) {
      return sum + Number(axis.score || 0);
    }, 0) / axisList.length);
  }

  function getDifficultyIndex(input) {
    const reportType = String(input.reportType || "");
    if (reportType === "time-dayparts-quiz") {
      return clamp(((Number(input.totalQuestions || input.totalItems || 0) / 12) + 0.34), 0.28, 0.78);
    }
    if (reportType === "time-dayparts-sequence") {
      return clamp(((Number(input.totalQuestions || input.totalItems || 0) / 10) + 0.42), 0.34, 0.84);
    }
    if (reportType === "time-dayparts-relative") {
      return clamp(((Number(input.totalQuestions || input.totalItems || 0) / 10) + 0.22), 0.2, 0.62);
    }
    if (reportType === "numberlab-number-sense") {
      const totalQuestions = Math.max(1, Number(input.totalQuestions || input.totalItems || 0));
      return clamp(((totalQuestions / 10) + 0.28), 0.24, 0.72);
    }
    if (reportType === "numberlab-number-bundle") {
      const totalQuestions = Math.max(1, Number(input.totalQuestions || input.totalItems || 0));
      return clamp(((totalQuestions / 10) + 0.36), 0.32, 0.84);
    }
    if (reportType === "numberlab-number-calc") {
      const totalQuestions = Math.max(1, Number(input.totalQuestions || input.totalItems || 0));
      return clamp(((totalQuestions / 10) + 0.42), 0.38, 0.92);
    }
    if (reportType === "standalone-icon-find" || reportType === "standalone-icon-odd-find") {
      const rows = Math.max(1, Number(input.rows || 0));
      const cols = Math.max(1, Number(input.cols || 0));
      const targetCount = Math.max(1, Number(input.targetCount || 0));
      const distractorKinds = Math.max(1, Number(input.distractorKinds || 0));
      return clamp((((rows * cols) / 80) + (targetCount / 12) + (distractorKinds / 10) + (Number(input.oddCount || 0) * 0.3)) / 3, 0.2, 1);
    }
    if (reportType === "standalone-doorlock") {
      const sequenceLength = Math.max(4, Number(input.sequenceLength || 4));
      const audioBias = String(input.mode || "").indexOf("audio") >= 0 ? 0.24 : 0.12;
      return clamp(((sequenceLength / 7) + audioBias), 0.28, 0.86);
    }
    if (reportType === "standalone-color-memory" || reportType === "standalone-color-trace") {
      const connectionCount = Math.max(1, Number(input.connectionCount || 0));
      const memoryBias = reportType === "standalone-color-memory" ? 0.25 : 0.12;
      const memoryWindow = Math.max(900, Number(input.memoryMs || 2600));
      return clamp(((connectionCount / 8) + ((3200 - memoryWindow) / 3200) + memoryBias), 0.18, 1);
    }
    if (reportType === "standalone-shape") {
      return clamp(((Number(input.optionCount || 2) / 5) + 0.2), 0.18, 0.82);
    }
    if (reportType === "language-syllable-find") {
      return 0.62;
    }
    if (reportType === "language-sound-find") {
      return 0.54;
    }
    return 0.32;
  }

  function getBenchmarkMs(input, normProfile) {
    const reportType = String(input.reportType || "");
    const benchmarkMap = normProfile && normProfile.benchmarkMs
      ? normProfile.benchmarkMs
      : NORM_PROFILES[DEFAULT_NORM_PROFILE].benchmarkMs;
    return Number(benchmarkMap[reportType] || benchmarkMap.default || 4600);
  }

  function getRehabLevelNumber(input) {
    const candidates = [
      input && input.levelNumber,
      input && input.level,
      input && input.levelId,
      input && input.levelKey,
      input && input.levelLabel,
      input && input.difficultyLabel,
      input && input.stageTitle,
      input && input.title
    ];
    for (let index = 0; index < candidates.length; index += 1) {
      const value = candidates[index];
      if (value == null) continue;
      if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.min(5, Math.max(1, Math.round(value)));
      const text = String(value).trim();
      const match = text.match(/(?:level|lv|레벨|단계)\s*[-_ ]*(\d+)/i) || text.match(/(\d+)\s*(?:단계|레벨|level|lv)/i);
      if (match) return Math.min(5, Math.max(1, Number(match[1])));
      if (/기초|쉬움|초급|beginner|easy/i.test(text)) return 1;
      if (/중급|보통|normal|medium/i.test(text)) return 2;
      if (/상급|어려움|advanced|hard/i.test(text)) return 3;
    }
    return 2;
  }

  function getRehabLevelFactor(input) {
    const levelNumber = getRehabLevelNumber(input);
    const factorMap = {
      1: 0.92,
      2: 1,
      3: 1.1,
      4: 1.18,
      5: 1.26
    };
    return {
      levelNumber: levelNumber,
      factor: factorMap[levelNumber] || 1,
      label: input && (input.levelLabel || input.difficultyLabel)
        ? String(input.levelLabel || input.difficultyLabel)
        : "레벨 " + String(levelNumber)
    };
  }

  function isRehabReportInput(input) {
    const scope = String(input && (input.reportScope || input.labKind || "") || "").toLowerCase();
    const type = String(input && input.reportType || "").toLowerCase();
    return scope === "rehab" || type.indexOf("rehab") === 0;
  }

  function buildObservationBenchmark(input, stats) {
    if (!isRehabReportInput(input)) return null;
    const avgQuestionMs = Number(input.avgQuestionMs || 0);
    const baseBenchmarkMs = Math.max(1, Number(input.benchmarkMs || 0));
    if (!avgQuestionMs || !baseBenchmarkMs) return null;
    const levelMeta = getRehabLevelFactor(input);
    const benchmarkMs = Math.max(1000, Math.round(baseBenchmarkMs * levelMeta.factor));
    const ratio = avgQuestionMs / benchmarkMs;
    const accuracyRate = clamp(round(Number(stats && stats.accuracyRate || input.accuracyRate || 0)), 0, 100);
    const completionRate = clamp(round(Number(stats && stats.completionRate || input.completionRate || 0)), 0, 100);
    const total = Math.max(1, Number(input.totalItems || input.totalQuestions || 0));
    const wrongCount = Math.max(0, Number(input.wrongCount || input.retryCount || 0));
    const wrongRate = total > 0 ? wrongCount / total : 0;
    let timeBand = "기준 범위";
    let timeTone = "steady";
    if (ratio <= 0.85) {
      timeBand = "빠른 편";
      timeTone = "strong";
    } else if (ratio <= 1.15) {
      timeBand = "기준 범위";
      timeTone = "good";
    } else if (ratio <= 1.35) {
      timeBand = "지연 관찰";
      timeTone = "watch";
    } else {
      timeBand = "과제 부담 높음";
      timeTone = "risk";
    }

    let decision = "maintain";
    let decisionLabel = "현재 레벨 유지";
    const reasons = [];
    const nextActions = [];
    if (accuracyRate >= 85 && completionRate >= 90 && wrongRate <= 0.12 && ratio <= 1.15) {
      decision = "up";
      decisionLabel = "다음 회기 상향 검토";
      reasons.push("정확도와 완수율이 안정적이고 평균 반응이 현재 연령·레벨 관찰 기준 안에 있습니다.");
      nextActions.push("동일 유형을 1회 더 확인한 뒤 자극 수 또는 규칙 복잡도를 한 단계 올려도 좋습니다.");
    } else if (accuracyRate < 70 || completionRate < 70 || ratio >= 1.35) {
      decision = "down";
      decisionLabel = "레벨 하향 또는 단서 강화";
      reasons.push("정확도, 완수율, 반응시간 중 한 지표 이상에서 현재 단계 부담이 관찰됩니다.");
      nextActions.push("문항 수를 줄이거나 보기 수·규칙 수를 낮춘 단계에서 성공 경험을 먼저 확보합니다.");
    } else {
      reasons.push("일부 지표는 안정적이지만 상향 판단에는 정확도, 속도, 완수율의 동시 안정성이 더 필요합니다.");
      nextActions.push("현재 레벨에서 같은 유형을 반복하며 오류 양상과 후반 집중 유지 여부를 확인합니다.");
    }
    if (accuracyRate >= 85 && ratio > 1.15) {
      decision = "maintain";
      decisionLabel = "현재 레벨 유지";
      reasons.push("정답률은 높지만 처리 시간이 길어 속도 안정화 후 상향을 검토하는 편이 안전합니다.");
      nextActions.push("시간 제한을 강하게 주기보다 정확한 탐색 루틴을 유지한 채 반응 지연 구간을 관찰합니다.");
    }
    if (accuracyRate < 80 && ratio <= 0.85 && wrongRate > 0.18) {
      decision = "maintain";
      decisionLabel = "충동 반응 점검";
      reasons.push("반응은 빠르지만 오류 부담이 있어 충동적 선택 가능성을 함께 관찰해야 합니다.");
      nextActions.push("선택 전 1초 멈춤, 다시 보기 단서를 넣어 억제조절을 확인합니다.");
    }

    const summary = "동일 시스템 내 " + String(input.normProfileLabel || "연령") + "·" + levelMeta.label + " 관찰 기준 대비 평균 반응은 " + timeBand + "입니다.";
    return {
      available: true,
      benchmarkMs: benchmarkMs,
      benchmarkLabel: formatSeconds(benchmarkMs),
      avgQuestionMs: avgQuestionMs,
      avgQuestionLabel: formatSeconds(avgQuestionMs),
      ratio: Number(ratio.toFixed(2)),
      ratioPercent: Math.round(ratio * 100),
      timeBand: timeBand,
      timeTone: timeTone,
      decision: decision,
      decisionLabel: decisionLabel,
      levelNumber: levelMeta.levelNumber,
      levelLabel: levelMeta.label,
      normProfileLabel: String(input.normProfileLabel || ""),
      ageGroupLabel: String(input.ageGroupLabel || input.ageRangeLabel || ""),
      summary: summary,
      reasons: reasons.slice(0, 4),
      nextActions: nextActions.slice(0, 3),
      disclaimer: "표준화 검사 점수가 아니라 회기 수행을 비교하기 위한 전문 관찰 기준입니다."
    };
  }

  function buildHeadline(input, integratedScore, seed, normProfile, reportProfile) {
    const band = getBand(integratedScore, normProfile);
    const titles = {
      excellent: [
        "수행 흐름이 안정적으로 유지되며 고난도 자극에서도 정확도가 잘 보존되었습니다.",
        "빠른 반응과 안정된 선택이 함께 유지되어 전반적인 학습 효율이 높게 관찰되었습니다.",
        "과제 규칙을 흔들림 없이 유지하며 상위 수준의 수행 안정성이 확인되었습니다."
      ],
      strong: [
        "전반적인 수행은 우수하며 핵심 과제에서 안정적인 집중이 유지되었습니다.",
        "정확도와 처리 흐름이 균형 있게 나타나 학습 적응력이 좋은 편으로 보입니다.",
        "대체로 안정된 수행을 보였고, 일부 구간만 다듬으면 더 높은 완성도로 이어질 수 있습니다."
      ],
      good: [
        "전반 수행은 양호하며 과제 규칙을 유지하는 힘이 비교적 안정적으로 나타났습니다.",
        "핵심 문항은 잘 처리했으며, 속도와 정교함을 조금 더 맞추면 더 좋은 결과가 기대됩니다.",
        "기본 수행 기반은 충분하고 특정 상황에서의 흔들림만 보완하면 상위 구간으로 올라갈 수 있습니다."
      ],
      steady: [
        "현재 수행은 기본 틀을 유지하고 있으나 난이도 상승 구간에서 흔들림이 일부 관찰됩니다.",
        "집중 유지와 정확성은 확보되었지만 속도 조절 또는 오류 억제 쪽 보강이 필요해 보입니다.",
        "핵심 규칙은 따라가고 있으나 과제 후반 또는 복잡한 자극에서 안정도가 다소 낮아집니다."
      ],
      watch: [
        "현재는 속도보다 정확한 규칙 유지와 오류 조절을 먼저 안정화하는 접근이 적절해 보입니다.",
        "과제 요구가 높아질수록 수행 변동이 커져 기초 수준의 반복 훈련이 우선 필요합니다.",
        "지금 단계에서는 반응을 서두르기보다 짧은 단위 성공 경험을 반복하며 안정성을 쌓는 편이 좋습니다."
      ]
    };
    const base = pick(titles[band.tone] || titles.steady, seed, "headline");
    return reportProfile && reportProfile.label
      ? reportProfile.label + " 기준에서 " + base
      : base;
  }

  function buildBriefOpinion(report, seed) {
    const dominant = report.sortedAxes[0];
    const weakest = report.sortedAxes[report.sortedAxes.length - 1];
    const dominantProfile = getAxisProfile(dominant);
    const weakestProfile = getAxisProfile(weakest);
    const lead = pick([
      "이번 학습 수행 자료를 종합하면",
      "이번 세션의 수행 프로파일을 임상적으로 해석하면",
      "현재 결과를 구조적으로 정리하면"
    ], seed, "brief-lead");
    const bandSummary = pick({
      excellent: [
        "전반적인 수행 안정성이 상위 수준으로 확인됩니다.",
        "전반적 수행 효율과 정확성이 매우 양호한 범위에 속합니다.",
        "과제 적응도와 수행 완결성이 모두 높은 수준으로 해석됩니다."
      ],
      strong: [
        "전반적인 수행은 우수한 범위에서 유지되고 있습니다.",
        "핵심 수행 지표가 비교적 안정적으로 유지되는 프로파일입니다.",
        "주요 수행 지표의 균형이 양호한 편으로 판단됩니다."
      ],
      good: [
        "기본 수행 기반은 충분하며 상위 구간으로의 확장 가능성이 확인됩니다.",
        "핵심 규칙 수행은 가능하나 일부 축의 보강이 병행되면 더 안정적인 결과가 기대됩니다.",
        "전반 수행은 양호하나 난이도 상승 조건에서의 유지력은 추가 관찰이 필요합니다."
      ],
      steady: [
        "기초 수행은 형성되어 있으나 특정 조건에서 변동성이 관찰됩니다.",
        "수행 가능성은 확보되어 있으나 안정성 측면의 추가 중재가 필요합니다.",
        "핵심 과제는 따라가고 있으나 조건 변화에 대한 적응 폭은 더 넓혀야 합니다."
      ],
      watch: [
        "현재는 수행 안정성 확보가 우선 과제로 해석됩니다.",
        "기초 정확도와 자기점검 루틴을 먼저 안정화하는 접근이 권장됩니다.",
        "상위 난이도 확장보다 기본 수행 리듬 형성이 우선되는 상태로 보입니다."
      ]
    }[report.band.tone] || [], seed, "brief-band");
    const accuracySentence = report.accuracyRate >= 88 && report.firstTryRate >= 82
      ? pick([
          "초회 반응 정확도도 함께 유지되어 실제 수행 전략이 비교적 잘 내재화된 것으로 보입니다.",
          "정확도와 초회 성공률이 함께 확보되어 반복 훈련의 일반화 가능성이 높습니다.",
          "오류 수정에 과도하게 의존하지 않고 초기 반응에서 비교적 안정된 선택이 이루어지고 있습니다."
        ], seed, "brief-accuracy-strong")
      : pick([
          "정확도에 비해 초회 반응 안정성이 상대적으로 낮다면 반응 전 확인 루틴을 더 구조화할 필요가 있습니다.",
          "반복 수정 비율이 높다면 초기 자극 변별과 자기점검 절차를 함께 보강하는 것이 좋습니다.",
          "초회 수행의 일관성을 높이면 전체 통합 점수 개선 폭이 더 커질 가능성이 있습니다."
        ], seed, "brief-accuracy-watch");
    return (
      lead + " " +
      getProfileSentence(report.reportProfile, seed, "brief") + " " +
      bandSummary + " " +
      dominant.label + " 축에서는 " + dominantProfile.domain + " 측면의 강점이 확인되며, " +
      getAxisClinicalComment(dominant, seed, "brief-dominant", report.normProfile) + " 반면 " +
      weakest.label + " 축에서는 " + weakestProfile.domain + " 측면의 보완 필요성이 시사되며, " +
      getAxisClinicalComment(weakest, seed, "brief-weakest", report.normProfile) + " " +
      accuracySentence
    );
  }

  function buildLongOpinion(report, seed) {
    const topA = report.sortedAxes[0];
    const topB = report.sortedAxes[1];
    const weakA = report.sortedAxes[report.sortedAxes.length - 1];
    const weakB = report.sortedAxes[report.sortedAxes.length - 2];
    const opener = pick([
      "다학제 해석 관점에서 보면 현재 프로파일은 강점 축과 취약 축이 비교적 명확하게 구분됩니다.",
      "학습 수행 데이터를 기준으로 정리하면 상위 기능과 보완이 필요한 기능의 분화가 분명합니다.",
      "이번 결과는 특정 수행 자원이 안정적으로 작동하는 반면 일부 영역에서는 조건 의존적 변동성이 남아 있음을 시사합니다."
    ], seed, "long-opener");
    const stabilityStrongCutoff = report.normProfile && report.normProfile.clinicalCutoffs
      ? report.normProfile.clinicalCutoffs.strong
      : 84;
    const stability = report.integratedScore >= stabilityStrongCutoff
      ? pick([
          "통합 점수 수준을 고려하면 전반적인 수행 조직화 능력은 양호한 편입니다.",
          "통합 수행 점수는 훈련 적응도와 규칙 유지력의 안정성을 뒷받침합니다.",
          "전체 프로파일은 상위권 안정성을 기반으로 다음 단계 훈련 확장이 가능한 수준으로 해석됩니다."
        ], seed, "long-stability-strong")
      : pick([
          "통합 점수 수준을 고려하면 기초 수행은 확보되었으나 조건 변화에 대한 적응 폭은 더 넓힐 필요가 있습니다.",
          "전체 프로파일은 기본 수행 가능성을 보여주지만, 취약 축의 안정화가 병행되어야 상위 단계 확장이 용이합니다.",
          "통합 점수는 현재 수행 가능성을 보여주되, 약한 축의 변동성이 전체 효율을 제한하고 있음을 시사합니다."
        ], seed, "long-stability-watch");
    const closer = pick([
      "따라서 다음 중재는 강점 축을 유지 자원으로 활용하고, 취약 축은 짧은 세트의 반복 훈련으로 변동성을 낮추는 방향이 적절합니다.",
      "향후 학습 계획은 상위 축의 성공 경험을 유지하면서 하위 축에 대한 점진적 부하 조절을 병행하는 방식이 권장됩니다.",
      "훈련 설계 시 강점 축은 일반화의 기반으로 삼고, 취약 축은 반응 전 확인과 반복 재현을 중심으로 세분화해 접근하는 것이 효과적입니다."
    ], seed, "long-closer");
    return (
      opener + " " +
      getProfileSentence(report.reportProfile, seed, "long") + " " +
      stability + " " +
      topA.label + " 및 " + topB.label + " 축은 각각 " +
      getAxisClinicalComment(topA, seed, "long-topA", report.normProfile) + " " +
      getAxisClinicalComment(topB, seed, "long-topB", report.normProfile) + " " +
      "반면 " + weakA.label + "과 " + weakB.label + " 축은 각각 " +
      getAxisClinicalComment(weakA, seed, "long-weakA", report.normProfile) + " " +
      getAxisClinicalComment(weakB, seed, "long-weakB", report.normProfile) + " " +
      closer
    );
  }

  function buildRoleNotes(report, seed) {
    const best = report.sortedAxes[0];
    const weak = report.sortedAxes[report.sortedAxes.length - 1];
    const medium = report.sortedAxes[Math.floor(report.sortedAxes.length / 2)];
    const normProfile = report.normProfile || NORM_PROFILES[DEFAULT_NORM_PROFILE];
    const strongCutoff = normProfile.clinicalCutoffs && Number.isFinite(normProfile.clinicalCutoffs.strong)
      ? normProfile.clinicalCutoffs.strong
      : 84;
    const moderateCutoff = normProfile.clinicalCutoffs && Number.isFinite(normProfile.clinicalCutoffs.moderate)
      ? normProfile.clinicalCutoffs.moderate
      : 72;
    const attentionAxis = report.axisLabels.attention || report.axisLabels.completion || best;
    const controlAxis = report.axisLabels.inhibition || report.axisLabels.selfMonitoring || weak;
    const memoryAxis = report.axisLabels.memory || report.axisLabels.visualCue || medium;
    const searchAxis = report.axisLabels.search || report.axisLabels.accuracy || best;
    const languageAxis = report.axisLabels.language;
    const reportProfile = report.reportProfile;
    const profileAxis = getProfileAxis(reportProfile, report.axisLabels, best);

    function roleProfileComment(roleId) {
      if (!reportProfile) return "";
      const roleFocus = {
        psychology: "주의 유지와 정서적 과제 지속성 안에서 이 유형의 부담을 관찰하는 것이 중요합니다.",
        rehab: "훈련 설계에서는 핵심 축을 단일 과제로 분리한 뒤 실제 과제와 다시 통합하는 접근이 적절합니다.",
        language: "언어 반응이 포함될 때는 목표 단서를 짧게 말로 정리한 뒤 반응하도록 구조화하는 것이 좋습니다.",
        behavior: "행동 루틴은 반응 전 확인과 오류 이후 재진입 절차가 자동화되도록 설계하는 편이 좋습니다."
      };
      return reportProfile.label + " 분류에서는 " + profileAxis.label + " 축을 우선 관찰 지표로 두며, " + roleFocus[roleId];
    }

    const psychology = attentionAxis.score >= (strongCutoff - 1)
      ? pick([
          attentionAxis.label + " 지표를 중심으로 볼 때, 선택적 주의와 지속적 주의 유지가 비교적 안정적인 수준으로 관찰됩니다. 과제 초반부터 후반까지 목표 자극에 대한 주의 배분이 크게 무너지지 않아 세션 내 심리적 피로 누적이 상대적으로 적은 패턴입니다. 또한 " + controlAxis.label + " 축도 함께 유지되어 과제 수행 중 자기통제 자원이 효율적으로 작동하는 것으로 해석됩니다.",
          "심리적 수행 양상에서는 " + attentionAxis.label + " 중심의 주의 조절 능력이 비교적 잘 유지되고 있습니다. 정답 선택 이전의 확인 과정이 안정적으로 이어져 불필요한 반응 분산이 낮고, 반복 자극 상황에서도 과제 몰입이 비교적 지속되는 패턴입니다. 이는 후속 세션에서 과제 길이를 점진적으로 확장할 수 있는 기반으로 볼 수 있습니다.",
          attentionAxis.label + "과 " + controlAxis.label + " 축의 조합을 보면 목표 자극 유지와 반응 통제가 함께 작동하는 프로파일입니다. 심리적 측면에서 주의 전환 이후 재집중 속도가 비교적 빠르며, 오류 이후에도 과제 흐름을 회복하는 능력이 양호한 편으로 판단됩니다."
        ], seed, "psych-strong")
      : pick([
          "심리 전문가 관점에서는 " + attentionAxis.label + " 축의 변동성이 상대적으로 우선 관찰됩니다. 과제 시작 자체는 가능하나 세트가 길어지거나 오류 경험이 누적될수록 선택적 주의 유지 폭이 감소할 가능성이 있습니다. 따라서 짧은 성공 경험을 자주 제공하며 재집중 간격을 구조화하는 접근이 필요합니다.",
          attentionAxis.label + "과 " + controlAxis.label + " 결과를 함께 보면 집중 시작보다 유지 구간에서의 부담이 더 크게 작용하는 프로파일로 해석됩니다. 특히 조건 변화 이후 주의 자원을 다시 과제에 모으는 과정이 늦어질 수 있으므로, 짧은 세션 단위로 집중 회복 루틴을 반복하는 것이 적절합니다.",
          "현재 심리적 수행 패턴은 목표 자극에 대한 주의 고정은 가능하나 지속적 유지와 자기통제가 동시에 요구될 때 효율 저하가 예상됩니다. 이는 난이도 상승 조건에서 수행 편차로 연결될 수 있으므로, 초기에는 자극량을 줄이고 확인 절차를 명시적으로 안내하는 방식이 도움이 됩니다."
        ], seed, "psych-watch");

    const rehab = (memoryAxis.id === "memory" || memoryAxis.id === "visualCue")
      ? pick([
          "인지재활 관점에서는 " + memoryAxis.label + " 영역이 현재 훈련 설계의 핵심 변수로 보입니다. 작업기억 또는 단서 유지 능력은 기본적으로 형성되어 있으나 동시 처리 정보량이 증가하면 수행 효율이 저하될 수 있으므로, 자극 수를 세분화해 점진적으로 확대하는 방식이 권장됩니다. 아울러 " + searchAxis.label + " 전략을 함께 정교화하면 전체 수행 안정성이 더 빠르게 향상될 가능성이 있습니다.",
          memoryAxis.label + " 축은 과제 규칙을 머릿속에 유지하고 반응으로 연결하는 인지 처리의 중심 역할을 합니다. 현재 결과는 기본 유지 능력은 보이지만 부하 증가 시 재확인 의존도가 높아질 가능성을 시사하므로, 동일 규칙 안에서 정보량만 미세하게 조절하는 단계적 훈련이 적절합니다. 이는 재활적 일반화 가능성을 높이는 데도 도움이 됩니다.",
          "인지재활적 해석으로는 " + memoryAxis.label + "과 " + searchAxis.label + " 사이의 상호작용이 중요합니다. 핵심 정보 유지가 흔들리면 탐색 효율과 정확도가 함께 저하될 수 있으므로, 훈련 초기에는 규칙 유지와 시각 탐색을 분리해 연습하고 이후 통합하는 접근이 더 안정적입니다."
        ], seed, "rehab-memory")
      : pick([
          "인지재활 전문가 관점에서는 " + searchAxis.label + "과 " + controlAxis.label + "이 실제 수행 효율을 좌우하는 중심 축으로 판단됩니다. 자극량이 많은 조건에서 탐색 경로와 반응 억제가 동시에 요구되므로, 눈의 이동 순서와 반응 전 확인 시간을 구조화하는 훈련이 우선되어야 합니다. 이러한 기초 전략이 자리 잡으면 이후 난이도 상승에 대한 적응 폭이 더 넓어질 수 있습니다.",
          "현재 프로파일은 규칙 이해 자체보다 실제 수행 과정에서의 탐색 효율과 반응 조절이 결과를 크게 좌우하는 양상입니다. 따라서 인지재활 중재는 단순 반복보다 탐색 순서 고정, 비표적 자극 배제, 자기점검 언어화와 같은 전략 훈련 중심으로 설계하는 편이 효과적입니다. 특히 " + weak.label + " 축을 짧고 자주 반복하는 구성이 필요합니다.",
          searchAxis.label + " 영역의 변동성은 과제 수행 전개 전체에 파급될 가능성이 있습니다. 인지재활적으로는 자극 배열을 작은 구역으로 분할하고, 한 구역씩 탐색하는 방식으로 시각 탐색 전략을 구조화할 필요가 있습니다. 동시에 " + controlAxis.label + " 루틴을 병행하면 오류 부담을 더 효과적으로 줄일 수 있습니다."
        ], seed, "rehab-search");

    const language = languageAxis
      ? (languageAxis.score >= strongCutoff
          ? pick([
              "언어재활 관점에서는 " + languageAxis.label + " 효율이 비교적 안정적으로 유지됩니다. 음운 단서 처리와 명칭 인출이 자연스럽게 연결되어 친숙 자극뿐 아니라 변형 자극에서도 반응 기반이 유지될 가능성이 높습니다. 향후에는 음절 길이 확장, 범주 전환, 문장 수준 표현 과제로의 일반화를 고려할 수 있습니다.",
              languageAxis.label + " 점수는 언어 인출과 단서 활용의 통합이 양호한 수준임을 시사합니다. 초회 반응에서 목표 어휘를 비교적 안정적으로 활성화하고 있으며, 반복 학습 시 인출 자동화가 빠르게 강화될 가능성이 있습니다. 추후에는 의미 범주 확장과 설명하기 과제로 자연스럽게 연결해도 무리가 적겠습니다.",
              "언어재활 전문가 시각에서 현재 결과는 음운-의미 연결 효율과 명칭 회상 안정성이 비교적 잘 보존된 상태로 해석됩니다. 과제 수행 중 단서 의존도가 과도하지 않고 인출 흐름이 매끄러워, 표현 길이와 문맥 복잡도를 서서히 높이는 훈련 설계가 가능합니다."
            ], seed, "lang-strong")
          : pick([
              "언어재활 관점에서는 " + languageAxis.label + "의 즉시성이 충분히 안정되지 않은 상태로 해석됩니다. 단서가 주어질 때는 반응이 가능하더라도 초회 인출의 일관성이 떨어질 수 있어, 소리-그림-단어를 짧은 묶음으로 반복하는 구조화된 인출 훈련이 필요합니다. 특히 친숙 어휘에서 빠른 성공 경험을 먼저 확보하는 순서가 적절합니다.",
              languageAxis.label + " 결과는 명칭 회상 자체는 가능하나 인출 속도와 정확성의 동시 유지에는 추가 보강이 필요함을 시사합니다. 음운 단서와 의미 단서를 단계적으로 제시하고, 정답 제시 직후 즉각 회상 반복을 넣으면 인출 안정성 향상에 도움이 됩니다. 이후 유사 어휘 간 변별 과제로 확장하는 것이 좋겠습니다.",
              "현재 언어 수행은 단서 활용 능력은 있으나 자극 친숙도와 부하 수준에 따라 인출 효율의 편차가 남아 있는 프로파일입니다. 따라서 언어재활 중재에서는 초회 반응 정확도 향상, 음운 단서 활용 자동화, 짧은 구문 수준의 반복 산출을 함께 설계하는 것이 권장됩니다."
            ], seed, "lang-watch"))
      : "해당 학습은 언어재활 쪽 소견 내용이 없습니다.";

    const behavior = weak.score >= (moderateCutoff + 2)
      ? pick([
          "행동발달 측면에서는 과제 지속과 자기조절이 비교적 안정적으로 유지되는 편입니다. 실수 이후에도 수행 루틴을 크게 잃지 않고 다시 과제 흐름으로 복귀하는 양상이 관찰되어, 구조화된 학습 환경 안에서 행동 조절 자원이 효율적으로 작동하는 것으로 해석됩니다. 이는 반복 세션 누적 시 긍정적인 적응 지표가 될 수 있습니다.",
          "현재 결과는 행동 조절 면에서 과제 완결성과 자기점검의 기본 틀이 형성되어 있음을 보여줍니다. 반응을 지나치게 서두르기보다 규칙을 유지하려는 경향이 비교적 확인되며, 이는 난이도 상승 상황에서도 중재 효과를 기대할 수 있는 긍정 요인입니다. 향후에는 세트 길이만 점진적으로 늘려도 무리가 크지 않을 것으로 판단됩니다.",
          controlAxis.label + "과 " + (report.axisLabels.completion ? report.axisLabels.completion.label : weak.label) + " 지표를 보면 행동적 자기조절의 기초는 비교적 안정적입니다. 수행 중 일시적 흔들림이 있더라도 전반적인 과제 지속성은 유지되는 편이며, 오류 이후 재참여 속도도 양호한 편으로 해석됩니다. 후속 훈련에서는 규칙 유지 경험을 충분히 강화하는 구성이 적절합니다."
        ], seed, "behavior-strong")
      : pick([
          "행동발달 관점에서는 자기점검과 반응 억제의 안정화가 우선 과제로 보입니다. 특히 오류 직후 즉시 반응하려는 경향이 개입되면 수행 정확도가 빠르게 낮아질 수 있으므로, '멈춤-확인-반응' 절차를 외현화하여 반복 연습하는 것이 필요합니다. 쉬운 조건에서 이 루틴을 자동화한 뒤 점차 자극량을 늘리는 접근이 적절합니다.",
          "현재 수행은 과제 지속성 자체보다 반응 전 확인 절차의 일관성 부족이 결과 변동에 더 큰 영향을 미치는 양상입니다. 따라서 행동중재는 정답 유무보다 반응 이전의 점검 행동을 강화하는 방향으로 설계하는 것이 바람직합니다. 예를 들어 시선 고정, 기준 자극 다시 보기, 손 멈춤 신호 등 구체적 자기조절 단서를 함께 사용하는 것이 도움이 됩니다.",
          controlAxis.label + " 축의 변동성은 행동적 충동 조절과 자기 모니터링의 추가 중재 필요성을 시사합니다. 반응 속도를 직접 요구하기보다 확인 절차를 먼저 안정화하고, 성공률이 유지되는 범위에서만 속도를 점진적으로 높여야 합니다. 이는 장기적으로 수행 안정성과 학습 일반화 모두에 유리한 방향입니다."
        ], seed, "behavior-watch");

    return [
      { id: "psychology", title: ROLE_LABELS.psychology, text: psychology + " " + roleProfileComment("psychology") },
      { id: "rehab", title: ROLE_LABELS.rehab, text: rehab + " " + roleProfileComment("rehab") },
      { id: "language", title: ROLE_LABELS.language, text: language + " " + roleProfileComment("language") },
      { id: "behavior", title: ROLE_LABELS.behavior, text: behavior + " " + roleProfileComment("behavior") }
    ];
  }

  function buildRecommendations(report, seed) {
    const sortedWeak = report.sortedAxes.slice(-3).reverse();
    const recommendations = [];
    const added = {};

    function addRecommendation(key, title, desc) {
      if (added[key]) return;
      added[key] = true;
      recommendations.push({
        title: title,
        desc: desc
      });
    }

    if (report.reportProfile && report.reportProfile.trainingTitle) {
      addRecommendation(
        "profile-" + String(report.reportProfile.id || report.reportProfile.label),
        report.reportProfile.trainingTitle,
        report.reportProfile.trainingDesc
      );
    }

    sortedWeak.forEach(function (axis, index) {
      if (axis.id === "speed") {
        addRecommendation(
          "speed",
          "짧은 시간 제한 반응 훈련",
          pick([
            "2~4문항 단위의 짧은 세트에서 반응 시간을 조금씩 줄이며 처리 속도를 안정화해 주세요.",
            "속도 자체보다 반응 전 확인 시간을 1초 내외로 고정한 뒤 점진적으로 빠르게 하는 방식이 적절합니다.",
            "같은 유형을 짧게 반복하며 '보고-확인-반응' 간격을 일정하게 만드는 훈련이 도움이 됩니다."
          ], seed, "rec-speed-" + index)
        );
      }
      if (axis.id === "attention" || axis.id === "completion") {
        addRecommendation(
          "attention",
          "집중 유지 시간 늘리기",
          pick([
            "성공률이 높은 짧은 과제부터 시작해 세트 길이를 1~2문항씩 늘려 지속 주의 시간을 점진적으로 확장해 주세요.",
            "중간 피로가 오기 전 3~5분 단위로 짧게 끊어 집중을 다시 모으는 훈련 구성이 좋습니다.",
            "과제 전환 없이 같은 규칙을 유지하는 짧은 반복 세트를 통해 집중 유지 폭을 먼저 확보해 주세요."
          ], seed, "rec-attention-" + index)
        );
      }
      if (axis.id === "memory") {
        addRecommendation(
          "memory",
          "순차 기억 묶음 훈련",
          pick([
            "3개 단위 순서를 안정화한 뒤 4개, 5개로 늘리는 방식으로 작업기억 부하를 세분화해 주세요.",
            "보는 시간은 조금 넉넉하게 두고 재현 길이만 늘리면 기억 유지 전략을 만들기 좋습니다.",
            "같은 규칙 안에서 길이만 조절하는 순서 기억 훈련이 현재 프로파일에 가장 잘 맞습니다."
          ], seed, "rec-memory-" + index)
        );
      }
      if (axis.id === "inhibition" || axis.id === "selfMonitoring") {
        addRecommendation(
          "inhibition",
          "멈춤-확인-반응 루틴",
          pick([
            "정답을 누르기 전 한 번 더 확인하는 고정 루틴을 말로 짧게 안내하며 억제 조절을 훈련해 주세요.",
            "오답이 나왔을 때 즉시 다시 누르기보다 표적 특징을 한 번 더 읽고 반응하도록 속도 조절을 걸어주는 방식이 좋습니다.",
            "방해자극이 많은 과제에서 반응 전에 기준을 말하거나 손가락으로 짚어보는 자기점검 훈련이 도움이 됩니다."
          ], seed, "rec-inhibition-" + index)
        );
      }
      if (axis.id === "search" || axis.id === "visualCue") {
        addRecommendation(
          "search",
          "시각 탐색 순서 고정 훈련",
          pick([
            "왼쪽 위에서 오른쪽 아래로 훑는 등 눈의 이동 순서를 고정하면 탐색 오류를 줄이기 쉽습니다.",
            "보드가 넓은 과제는 화면을 작은 구역으로 나누어 차례로 찾는 연습이 효과적입니다.",
            "정답을 찾는 기준 자극을 먼저 충분히 본 뒤 탐색을 시작하는 루틴을 훈련해 주세요."
          ], seed, "rec-search-" + index)
        );
      }
      if (axis.id === "language") {
        addRecommendation(
          "language",
          "소리-그림-단어 연결 훈련",
          pick([
            "명칭을 바로 떠올리기 어려운 자극은 소리 듣기, 그림 보기, 따라 말하기 순서로 짧게 반복해 주세요.",
            "음절 수가 짧은 어휘부터 시작해 비슷한 말끼리 묶어 연습하면 인출 안정성이 높아집니다.",
            "정답을 본 직후 바로 다시 말해보는 회상 반복을 넣으면 언어 인출 유지에 도움이 됩니다."
          ], seed, "rec-language-" + index)
        );
      }
      if (axis.id === "accuracy") {
        addRecommendation(
          "accuracy",
          "정확도 우선 훈련",
          pick([
            "처음에는 속도보다 정확도 기준을 먼저 세우고, 오답이 줄어든 뒤 속도를 소폭 올리는 방식이 적절합니다.",
            "한 세트 안의 목표를 '빠르게'가 아니라 '틀리지 않기'로 두면 수행 안정성을 더 빨리 확보할 수 있습니다.",
            "오답 유형을 바로 확인하고 같은 규칙을 1~2문항 더 반복하는 보강이 효과적입니다."
          ], seed, "rec-accuracy-" + index)
        );
      }
      if (axis.id === "numberSense") {
        addRecommendation(
          "numberSense",
          "수량-숫자 대응 훈련",
          pick([
            "실제 물건을 하나씩 짚으며 세고 마지막 수를 숫자 카드와 연결해 수량과 기호의 대응을 안정화해 주세요.",
            "많고 적음 비교를 먼저 충분히 한 뒤 숫자 기호를 붙이면 수 감각의 전이가 더 자연스럽습니다.",
            "작은 수 묶음부터 시작해 같은 개수를 다른 배열로 바꾸어 보여주며 수 보존 개념을 함께 다져 주세요."
          ], seed, "rec-numberSense-" + index)
        );
      }
      if (axis.id === "calculation") {
        addRecommendation(
          "calculation",
          "연산 절차 말하기 훈련",
          pick([
            "계산을 시작하기 전에 첫 단계, 다음 단계, 확인 단계를 말로 짚어 절차 누락을 줄여 주세요.",
            "정답보다 풀이 순서를 먼저 설명하게 하면 계산 중간 단계의 자기점검이 안정화됩니다.",
            "같은 구조의 쉬운 식을 반복한 뒤 숫자만 조금씩 바꾸어 절차 유지력을 높여 주세요."
          ], seed, "rec-calculation-" + index)
        );
      }
      if (axis.id === "timeSense") {
        addRecommendation(
          "timeSense",
          "시간 기준점 고정 훈련",
          pick([
            "오늘 또는 지금 카드를 가운데 놓고 이전과 이후 표현을 양쪽에 배치하며 시간 기준점을 고정해 주세요.",
            "생활 장면 사진을 시간말과 연결해 말하게 하면 추상적인 시간 표현을 더 쉽게 이해할 수 있습니다.",
            "오전, 오후, 저녁처럼 가까운 시간말부터 익힌 뒤 날짜, 달, 해 단위로 확장해 주세요."
          ], seed, "rec-timeSense-" + index)
        );
      }
      if (axis.id === "sequencing") {
        addRecommendation(
          "sequencing",
          "앞뒤 순서 배열 훈련",
          pick([
            "먼저, 다음, 마지막 말을 사용해 장면이나 카드의 앞뒤 관계를 말로 확인하며 배열해 주세요.",
            "세 단계 순서를 안정화한 뒤 중간 단계를 하나씩 추가하면 순서 조직 부담을 안전하게 늘릴 수 있습니다.",
            "배열을 마친 뒤 처음부터 다시 이야기하게 하면 순차 정보 유지와 자기점검을 함께 훈련할 수 있습니다."
          ], seed, "rec-sequencing-" + index)
        );
      }
    });

    if (recommendations.length < 3) {
      addRecommendation(
        "general",
        "성공 경험 중심 난이도 조절",
        pick([
          "한 번에 난이도를 많이 올리기보다 성공 경험이 유지되는 범위 안에서 작은 단위로 확장해 주세요.",
          "현재 강점 축은 유지하고 약한 축만 한 단계씩 조절하는 방식이 가장 효율적입니다.",
          "훈련 직후 짧은 피드백을 주고 같은 유형을 한 번 더 반복하면 일반화가 쉬워집니다."
        ], seed, "rec-general")
      );
    }

    return recommendations.slice(0, 3);
  }

  function buildHighlights(input, report) {
    const total = Math.max(1, Number(input.totalItems || input.totalQuestions || 0));
    const completed = Number(input.completionCount || input.correctCount || input.seenCount || 0);
    const avgMs = Number(input.avgQuestionMs || 0);
    const wrong = Number(input.wrongCount || input.retryCount || 0);
    const firstTry = Number(input.firstTryRate || 0);
    const accuracy = Number(input.accuracyRate || 0);
    const highlights = [
      { label: "통합 점수", value: report.integratedScore + "점" },
      { label: "완료 항목", value: String(completed) + " / " + String(total) },
      { label: "평균 반응", value: formatSeconds(avgMs) }
    ];
    if (String(input.reportType || "") === "review-name") {
      highlights.push({ label: "확인 완료율", value: String(report.completionRate) + "%" });
      if (Number(input.assistedCorrectCount || input.teacherCueCount || 0) > 0) {
        highlights.push({ label: "단서 후 정답", value: String(input.assistedCorrectCount || input.teacherCueCount) + "개" });
        highlights.push({ label: "독립 정답률", value: String(input.independentAccuracyRate ?? firstTry) + "%" });
      }
    } else {
      highlights.push({ label: "초회 성공률", value: String(firstTry) + "%" });
      highlights.push({ label: "오류 부담", value: String(wrong) + "회" });
      highlights.push({ label: "정확도", value: String(accuracy) + "%" });
    }
    if (Number(input.elapsedMs || 0) > 0) {
      highlights.push({ label: "총 소요 시간", value: formatDuration(input.elapsedMs) });
    }
    if (input.normProfileLabel) {
      highlights.push({ label: "해석 기준", value: input.normProfileLabel });
    }
    if (input.ageRangeLabel || input.ageGroupLabel) {
      highlights.push({ label: "연령 기준", value: [input.ageGroupLabel, input.ageRangeLabel].filter(Boolean).join(" ") });
    }
    if (input.levelLabel || input.difficultyLabel) {
      highlights.push({ label: "난이도 기준", value: String(input.levelLabel || input.difficultyLabel) });
    }
    if (report.observationBenchmark && report.observationBenchmark.available) {
      highlights.push({ label: "관찰 기준", value: report.observationBenchmark.benchmarkLabel });
      highlights.push({ label: "레벨 권고", value: report.observationBenchmark.decisionLabel });
    }
    if (input.reportProfileLabel) {
      highlights.push({ label: "리포트 유형", value: input.reportProfileLabel });
    }
    return highlights;
  }

  function buildEvidenceBasis(input, reportProfile, normProfile) {
    const items = [];
    const scope = String(input.reportScope || input.labKind || "");
    if (scope === "rehab" || String(input.reportType || "").indexOf("rehab") === 0) {
      items.push("회기 내 정확도, 평균 반응시간, 오류 부담, 과제 완수율을 함께 해석했습니다.");
      items.push("Go/No-Go, Stroop, Trail-making 계열 지표는 억제조절, 인지 유연성, 처리속도 관찰 자료로 사용하되 단독 진단 지표로 사용하지 않습니다.");
      items.push("시지각/시각-운동 과제는 표준화 검사 결과가 아니라 훈련 수행 중 관찰된 기능적 수행 지표로 기록합니다.");
      items.push("연령과 레벨별 표준 시간은 HAHA LAB 동일 시스템 내 회기 관찰 기준으로 사용하며 진단 점수로 사용하지 않습니다.");
    }
    if (normProfile && normProfile.label) {
      items.push(normProfile.label + "의 회기 관찰 기준으로 상대 해석했습니다.");
    }
    if (reportProfile && reportProfile.label) {
      items.push(reportProfile.label + " 프로파일에 맞춰 다음 훈련 방향을 제안했습니다.");
    }
    return items;
  }

  function buildReferenceLinks(input) {
    const scope = String(input.reportScope || input.labKind || "");
    if (scope !== "rehab" && String(input.reportType || "").indexOf("rehab") !== 0) return [];
    return REHAB_REFERENCE_LINKS.slice();
  }

  function getRuntimeReportScope() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const labKind = String(params.get("labKind") || "").trim().toLowerCase();
      const fileName = String(window.location.pathname || "").split("/").pop() || "";
      if (labKind === "rehab" || fileName.indexOf("rehablab-") === 0) return "rehab";
      if (labKind === "cardlab" || labKind === "card" || fileName.indexOf("cardlab-") === 0) return "cardlab";
      if (labKind === "playlab" || fileName.indexOf("playlab-") === 0) return "playlab";
      if (labKind === "numberlab" || labKind === "number" || fileName.indexOf("number-") === 0) return "numberlab";
    } catch (_error) {}
    return "";
  }

  function getRuntimeLearningFileName() {
    try {
      return String(window.location.pathname || "").split("/").pop().toLowerCase();
    } catch (_error) {
      return "";
    }
  }

  function normalizeReportScope(value) {
    return String(value || "").trim().toLowerCase();
  }

  function shouldUseSimplePlaylabReport(input) {
    const fileName = getRuntimeLearningFileName();
    const runtimeScope = normalizeReportScope(getRuntimeReportScope());
    const labKind = normalizeReportScope(input && (input.labKind || input.lab_kind));
    const labScope = normalizeReportScope(input && (input.labScope || input.lab_scope));
    const reportScope = normalizeReportScope(input && (input.reportScope || input.report_scope));
    const reportType = String(input && input.reportType || input && input.report_type || "").trim().toLowerCase();
    const simpleScopes = ["playlab", "cardlab", "card", "numberlab", "number"];
    const isSimpleLearningFile = /^(cardlab-|playlab-|number-)/.test(fileName)
      && fileName !== "playlab-history-report-viewer.html";
    const isRehabLearningFile = fileName.indexOf("rehablab-") === 0;

    if (isSimpleLearningFile) return true;
    if (
      isRehabLearningFile ||
      labKind === "rehab" ||
      labKind === "rehablab" ||
      labScope === "rehab" ||
      labScope === "rehablab" ||
      runtimeScope === "rehab" ||
      runtimeScope === "rehablab" ||
      reportType.indexOf("rehab") === 0
    ) {
      return false;
    }
    return [labKind, labScope, reportScope, runtimeScope].some((scope) => simpleScopes.indexOf(scope) !== -1);
  }

  function getReportScopeForOutput(input) {
    const fileName = getRuntimeLearningFileName();
    const runtimeScope = normalizeReportScope(getRuntimeReportScope());
    const labKind = normalizeReportScope(input && (input.labKind || input.lab_kind));
    const labScope = normalizeReportScope(input && (input.labScope || input.lab_scope));
    const reportScope = normalizeReportScope(input && (input.reportScope || input.report_scope));
    const reportType = String(input && input.reportType || input && input.report_type || "").trim().toLowerCase();
    if (
      fileName.indexOf("rehablab-") === 0 ||
      labKind === "rehab" ||
      labKind === "rehablab" ||
      labScope === "rehab" ||
      labScope === "rehablab" ||
      reportScope === "rehab" ||
      reportScope === "rehablab" ||
      runtimeScope === "rehab" ||
      runtimeScope === "rehablab" ||
      reportType.indexOf("rehab") === 0
    ) {
      return "rehab";
    }
    return reportScope || labScope || labKind || runtimeScope || "playlab";
  }

  function buildSimplePlaylabReport(input, stats) {
    const total = Math.max(1, Number(input.totalItems || input.totalQuestions || 0));
    const correct = Math.max(0, Number(input.correctCount || input.seenCount || input.completionCount || 0));
    const wrong = Math.max(0, Number(input.wrongCount || input.retryCount || 0));
    const accuracy = Number.isFinite(Number(stats && stats.accuracyRate)) ? Number(stats.accuracyRate) : getPercent(correct, total);
    const guardianSummary = "이번 활동에서는 참여 흐름과 정답 반응이 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 활동 요약만 간단히 확인합니다.";
    const teacherReviewNote = "PlayLab 단순 결과는 수업 참여와 활동 완료 흐름을 보는 참고 기록입니다. 세부 조정은 담당 선생님이 내담자의 컨디션과 수업 맥락을 함께 확인해 결정합니다.";
    return {
      isSimpleResult: true,
      integratedScore: accuracy,
      band: { label: accuracy >= 80 ? "완료" : "다시 연습", tone: accuracy >= 80 ? "strong" : "weak" },
      axes: [],
      sortedAxes: [],
      roleNotes: [],
      recommendations: [],
      highlights: [
        { label: "정답", value: String(correct) + "/" + String(total) },
        { label: "오답", value: String(wrong) },
        { label: "정확도", value: String(accuracy) + "%" }
      ],
      completionRate: Number(stats && stats.completionRate != null ? stats.completionRate : accuracy),
      accuracyRate: accuracy,
      firstTryRate: Number(stats && stats.firstTryRate != null ? stats.firstTryRate : accuracy),
      elapsedMs: Number(input.elapsedMs || 0),
      avgQuestionMs: Number(input.avgQuestionMs || 0),
      headline: accuracy >= 80 ? "학습을 잘 마쳤습니다." : "정답을 확인하고 다시 연습해 주세요.",
      briefOpinion: guardianSummary,
      guardianSummary: guardianSummary,
      teacherReviewNote: teacherReviewNote,
      actionPlanSummary: "다음 활동은 자동 확정하지 않고 선생님 검토 후 조정합니다.",
      reportModeHints: {
        guardian: "보호자 공유 모드는 활동 참여와 변화 흐름만 쉽게 요약합니다.",
        teacher: "전문가 분석 모드는 저장된 로그를 바탕으로 선생님이 검토할 수 있는 참고 자료입니다."
      },
      longOpinion: "",
      disclaimer: "",
      accentColor: String(input.accentColor || DEFAULT_ACCENT)
    };
  }

  function getComparableHistoryMeta(input) {
    const explicitCount = Number(input && (
      input.comparableHistoryCount ||
      input.comparableRecordCount ||
      input.historyCount ||
      input.recordCount
    ));
    const historyCandidates = [
      input && input.comparableHistory,
      input && input.sessionHistory,
      input && input.previousRecords,
      input && input.history,
      input && input.records
    ];
    const history = historyCandidates.find(function (candidate) {
      return Array.isArray(candidate);
    });
    const count = Number.isFinite(explicitCount) && explicitCount >= 0
      ? Math.floor(explicitCount)
      : (history ? history.length : 0);
    return {
      count: count,
      hasComparableHistory: count >= 2,
      hasTrend: count >= 3,
      comparisonStage: count >= 3 ? "trend" : (count === 2 ? "point-comparison" : "baseline"),
      wording: count >= 3
        ? "동일한 과제·난이도·기기 조건의 기록이 3회 이상 있어 수행 흐름을 확인할 수 있습니다. 반복효과와 당일 컨디션을 함께 검토합니다."
        : count === 2
          ? "동일 조건의 두 기록을 점 단위로 비교합니다. 아직 변화 추세로 해석하지 않습니다."
          : "비교 가능한 동일 조건 기록이 충분하지 않아 이번 기록을 기준선 관찰로 사용합니다. 향상·저하 또는 추세를 판단하지 않습니다."
    };
  }

  function normalizeReportRawInput(input, options) {
    const config = options || {};
    const original = input && typeof input === 'object' && !Array.isArray(input) ? JSON.parse(JSON.stringify(input)) : {};
    const normalized = JSON.parse(JSON.stringify(original));
    const source = config.source || original.reportDataQuality && original.reportDataQuality.source || 'live-input';
    const metricSources = {};
    function numeric(keys) {
      for (const key of keys) {
        const value = original[key];
        if ((typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) && Number(value) >= 0) return Number(value);
      }
      return null;
    }
    const aliases = {
      totalItems: ['totalItems', 'totalQuestions', 'total_items', 'total_questions'], correctCount: ['correctCount', 'correct_count'],
      wrongCount: ['wrongCount', 'wrong_count'], completionCount: ['completionCount', 'completion_count'], perfectCount: ['perfectCount', 'perfect_count'],
      accuracyRate: ['accuracyRate', 'accuracy_rate'], firstTryRate: ['firstTryRate', 'first_try_rate'], completionRate: ['completionRate', 'completion_rate'],
      avgQuestionMs: ['avgQuestionMs', 'avg_question_ms', 'avgReactionMs', 'avg_reaction_ms'], elapsedMs: ['elapsedMs', 'elapsed_ms'],
      startedAtMs: ['startedAtMs', 'started_at_ms']
    };
    Object.keys(aliases).forEach(function (key) { normalized[key] = numeric(aliases[key]); metricSources[key] = normalized[key] === null ? 'unavailable' : 'observed'; });
    for (const name of ['questionLogs', 'question_logs', 'trialLogs', 'trial_logs']) {
      let logs = original[name];
      if (typeof logs === 'string') { try { logs = JSON.parse(logs); } catch (_error) { logs = null; } }
      if (Array.isArray(logs) && logs.length) { normalized.questionLogs = JSON.parse(JSON.stringify(logs)); break; }
    }
    if (!Array.isArray(normalized.questionLogs)) normalized.questionLogs = [];
    function derive(key, value) { if (normalized[key] === null && value !== null && Number.isFinite(value)) { normalized[key] = value; metricSources[key] = 'derived'; } }
    if (normalized.totalItems > 0) {
      derive('accuracyRate', normalized.correctCount === null ? null : getPercent(normalized.correctCount, normalized.totalItems));
      derive('firstTryRate', normalized.perfectCount === null ? null : getPercent(normalized.perfectCount, normalized.totalItems));
      derive('completionRate', normalized.completionCount === null ? null : getPercent(normalized.completionCount, normalized.totalItems));
    }
    const responseTimes = normalized.questionLogs.map(function (log) {
      if (!log || typeof log !== 'object') return null;
      if (log.isValid === false || log.excluded === true || log.timedOut === true || log.timeout === true || log.responded === false || log.noResponse === true) return null;
      if (/TIME.?OUT|MISS|OMISSION|CORRECT.?REJECT|WITHHOLD|NO.?RESPONSE|HELD|HOLD/i.test(String(log.outcome || log.result || log.responseType || ''))) return null;
      const value = log.responseMs ?? log.reactionMs ?? log.responseTimeMs;
      return (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
    }).filter(function (value) { return value !== null; });
    if (responseTimes.length) derive('avgQuestionMs', responseTimes.reduce(function (sum, value) { return sum + value; }, 0) / responseTimes.length);
    normalized.reportDataQuality = Object.assign({}, original.reportDataQuality || {}, { source: source, metricSources: metricSources, missingMetrics: Object.keys(metricSources).filter(function (key) { return metricSources[key] === 'unavailable'; }) });
    if (metricSources.avgQuestionMs === 'derived') normalized.reportDataQuality.reactionTimeSample = { included: responseTimes.length, totalLogs: normalized.questionLogs.length, rule: 'positive-response-only; timeout, omission, no-response and excluded trials omitted' };
    normalized.originalReportInput = original.originalReportInput || original;
    return normalized;
  }

  // Evidence-backed observations. No trained model, external API or inferred diagnosis.
  const OPINION_VERSION = '2026-11-observation-1';
  const OPINION_EVIDENCE = {
    'OP-E01': { title: '게임화와 Stroop 측정 조건 연구 (2024)', url: 'https://games.jmir.org/2024/1/e50315/' },
    'OP-E02': { title: '소아 대면·원격 인지평가 비교 (2025)', url: 'https://pubmed.ncbi.nlm.nih.gov/41102265/' },
    'OP-E03': { title: '소아 재활 공동 의사결정 연구 (2026)', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0352677' },
    'OP-E04': { title: '아동용 NIH Toolbox 타당도 문헌검토 (2025)', url: 'https://pubmed.ncbi.nlm.nih.gov/40693328/' },
    'OP-E05': { title: '어린 아동 원격평가 실무 지침 (2024)', url: 'https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2024.1376090/full' }
  };
  function opinionNumber(value) {
    return (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
  }
  function buildEvidenceOpinion(raw) {
    const input = raw && typeof raw === 'object' ? raw : {};
    const facts = [], candidates = [], next = [], evidenceIds = ['OP-E04', 'OP-E03'];
    const add = function (fact, candidate, action, evidence) {
      facts.push(fact); if (candidate) candidates.push(candidate); if (action) next.push(action);
      if (evidence && !evidenceIds.includes(evidence)) evidenceIds.push(evidence);
    };
    const total = opinionNumber(input.totalItems ?? input.totalQuestions);
    const correct = opinionNumber(input.correctCount);
    const wrong = opinionNumber(input.wrongCount);
    if (Number.isSafeInteger(total) && total > 0 && Number.isSafeInteger(correct) && correct <= total) {
      add('전체 ' + total + '문항 중 ' + correct + '문항이 과제의 정답 기준을 충족했습니다.',
        '이 정답 수에는 과제 이해, 제시 방식과 입력 조작이 함께 영향을 줄 수 있어 한 가지 능력으로 분리해 해석하지 않습니다.',
        '같은 과제 조건을 유지하고 설명 이해 여부와 입력 조작의 어려움을 선생님이 따로 확인합니다.');
    }
    const type = String(input.reportType || '');
    const logs = Array.isArray(input.questionLogs) ? input.questionLogs : [];
    const isGo = ['rehablab-traffic-go-nogo', 'rehablab-shape-match-gonogo'].includes(type);
    if (isGo && logs.length && logs.length === total) {
      const outcomes = logs.map(function (log) { return String(log && log.outcome || ''); });
      const accepted = ['HIT', 'MISS', 'SUCCESS_HOLD', 'CORRECT_REJECT', 'COMMISSION', 'FALSE_ALARM', 'ANTICIPATORY'];
      if (outcomes.every(function (outcome) { return accepted.includes(outcome); }) && outcomes.filter(function (outcome) { return outcome === 'HIT' || outcome === 'SUCCESS_HOLD' || outcome === 'CORRECT_REJECT'; }).length === correct && Number.isSafeInteger(wrong) && correct + wrong === total) {
        const n = function (types) { return outcomes.filter(function (outcome) { return types.includes(outcome); }).length; };
        const hit = n(['HIT']), miss = n(['MISS']), hold = n(['SUCCESS_HOLD', 'CORRECT_REJECT']);
        const commission = n(['COMMISSION', 'FALSE_ALARM']), early = n(['ANTICIPATORY']);
        // Anticipatory presses may occur before the signal: do not assign a Go/NoGo denominator.
        add('반응 성공 ' + hit + '회, 반응 누락 ' + miss + '회, 멈춤 성공 ' + hold + '회, 멈춤 조건의 반응 ' + commission + '회, 신호 전 반응 ' + early + '회가 기록되었습니다.');
        if (miss > 0) add('반응해야 하는 시행에서 누락이 ' + miss + '회 있었습니다.',
          '누락은 신호 확인, 규칙 이해, 입력 지연 등 여러 조건과 관련될 수 있습니다. 로그만으로 원인을 특정하지 않습니다.',
          '신호를 알아차렸는지와 버튼을 누르려 했는지를 확인하고, 입력 기기를 유지한 채 기다리는 시간을 조정해 볼지 검토합니다.', 'OP-E02');
        if (commission > 0 || early > 0) add('멈춤 조건 또는 신호 전 반응이 관찰되었습니다.',
          '누르는 시점의 오류는 기다리기 규칙의 이해나 자극 제시·입력 조건을 함께 확인해야 합니다. 충동성으로 단정하지 않습니다.',
          '누르는 조건과 기다리는 조건을 각각 설명해 보도록 한 뒤 같은 조건에서 재확인합니다.', 'OP-E01');
        if (miss === 0 && commission === 0 && early === 0) next.push('이번 시행에서는 기록된 누락·잘못 누르기·신호 전 반응이 없었습니다. 다른 날 같은 조건에서도 유지되는지 확인합니다.');
      }
    }
    const cats = input.stroopResponseCategories;
    if (type === 'rehablab-stroop-color-word' && cats && ['withinTimeCorrect', 'wrongChoice', 'lateCorrect', 'total'].every(function (key) { return Number.isSafeInteger(cats[key]) && cats[key] >= 0; })
      && cats.total === total && cats.total > 0 && cats.withinTimeCorrect + cats.wrongChoice + cats.lateCorrect === cats.total
      && cats.withinTimeCorrect === correct && cats.wrongChoice === wrong) {
      add('시간 내 정답 ' + cats.withinTimeCorrect + '개, 오선택 ' + cats.wrongChoice + '개, 정답 선택·시간 초과 ' + cats.lateCorrect + '개입니다.');
      if (cats.lateCorrect > 0) add('정답을 선택했으나 제한시간을 넘긴 문항이 있었습니다.',
        '늦은 정답은 잘못된 선택과 구분해야 합니다. 규칙 확인에 걸린 시간과 입력 조작 시간이 함께 포함될 수 있습니다.',
        '다음에는 선생님 검토 후 제한시간만 완화한 조건에서 정답 선택이 유지되는지 확인합니다.', 'OP-E01');
      if (cats.wrongChoice > 0) add('잘못된 선택이 ' + cats.wrongChoice + '개 기록되었습니다.',
        '글자와 색 중 어떤 규칙을 따랐는지는 선택별 자극과 답을 대조해야 합니다. 오선택 수만으로 간섭 효과를 계산하지 않습니다.',
        '색을 고르는 규칙을 말이나 시범으로 확인하고 문항별 선택을 함께 살펴봅니다.', 'OP-E01');
    }
    const supported = opinionNumber(input.supportedCount);
    if (input.scoreKind === 'language-support-weighted-percent' && Number.isSafeInteger(supported) && total > 0 && supported <= total && Number.isSafeInteger(correct) && correct + supported <= total) {
      add('독립 정답 ' + correct + '개와 도움 후 성공 ' + supported + '개가 구분되어 기록되었습니다.',
        '도움 후 성공은 독립 수행과 구분해 보며, 제공한 단서의 종류와 양을 확인해야 합니다.',
        '동일 문항 조건에서 단서 수준을 기록하고, 다음 회기에는 단서 없이 가능한지 확인합니다.');
    }
    if (type === 'rehablab-color-block-count') {
      const distance = opinionNumber(input.averageAnswerDistance);
      const hidden = opinionNumber(input.hiddenTotal);
      if (distance !== null) add('선택한 수와 실제 수의 절대 오차 평균은 ' + distance + '개입니다.',
        '평균 오차만으로 빠뜨린 위치나 세기 전략을 알아낼 수 없습니다.',
        '다음 활동에서 세는 순서와 빠뜨리거나 중복해 센 위치를 선생님이 직접 기록합니다.');
      if (hidden !== null) add('과제 구성상 숨은 블록이 합계 ' + hidden + '개 포함되었습니다.',
        '숨은 블록이 포함되었다는 사실은 그 문항에서 오류가 났거나 공간 추론이 어려웠다는 뜻은 아닙니다.',
        '숨은 블록 포함 여부별 정답과 사용한 단서를 기록한 뒤 조건 차이를 확인합니다.');
    }
    if (!facts.length) facts.push('전문 해석에 사용할 문항별 수행 정보가 충분하지 않습니다. 확인되지 않은 오류나 도움 반응은 만들지 않습니다.');
    const scope = String(input.reportScope || input.labKind || '');
    if (/^(?:literacy|cardlab|language)$/.test(scope) || /^cardlab-/.test(type)) {
      next.push('언어 활동은 틀린 문항의 글자·소리·어휘 조건을 구분해 기록합니다. 정답 수만으로 읽기·말하기의 세부 어려움을 판단하지 않습니다.');
    } else if (/^(?:numberlab|number|math)$/.test(scope) || /^numberlab-/.test(type)) {
      next.push('숫자 활동은 수량 비교·숫자 연결·계산 중 실제 과제 유형과 사용한 도움을 기록하고 같은 유형끼리 확인합니다.');
    } else if (/^(?:musicart|music|art)$/.test(scope)) {
      next.push('음악·미술 활동은 실제 선택·완료 기록과 제공한 도움을 확인합니다. 참여 점수만으로 정서나 사회성을 추정하지 않습니다.');
    }
    if (!candidates.length) candidates.push('확인된 수치만으로 수행의 원인이나 일상생활에서의 능력을 확정하기 어렵습니다. 실제 문항과 수업 맥락을 함께 검토합니다.');
    if (!next.length) next.push('다음 활동에서 문항 조건, 사용한 단서와 도움 수준을 함께 기록해 해석 범위를 넓힙니다.');
    const limits = '하하랩 자체 과제의 관찰 기반 소견 초안입니다. 표준검사·진단·치료 효과 판정이 아니며, 피로·환경·도움 여부는 직접 기록된 경우에만 해석에 반영합니다. 최종 설명과 활동 조정은 담당 선생님이 확인합니다.';
    const guardianFacts = facts.filter(function (text) { return !/절대 오차|합계 .*개 포함/.test(text); }).slice(0, 3);
    return {
      version: OPINION_VERSION, evidenceIds: evidenceIds, reviewStatus: 'draft',
      provenance: { ruleId: 'observed-task-patterns', ruleVersion: OPINION_VERSION, sourceFields: ['reportType', 'totalItems', 'correctCount', 'wrongCount', 'questionLogs', 'stroopResponseCategories', 'supportedCount', 'averageAnswerDistance', 'hiddenTotal'].filter(function (key) { return input[key] !== undefined; }), dataStatus: facts[0].includes('정보가 충분하지') ? 'insufficient' : 'observed' },
      guardianSummary: guardianFacts.join(' '),
      guardianLongSummary: next.slice(0, 2).join(' ') + ' 이번 기록만으로 아이의 전반적인 능력이나 변화를 단정하지 않습니다.',
      teacherReviewNote: facts.join(' '), longOpinion: candidates.join(' '),
      recommendations: next.map(function (text) { return { title: '다음 관찰 후보', desc: text }; }),
      sections: [ { id: 'facts', title: '관찰 사실', text: facts.join(' ') }, { id: 'interpretation', title: '해석 후보', text: candidates.join(' ') },
        { id: 'next', title: '다음 회기 확인', text: next.join(' ') }, { id: 'limits', title: '해석 한계와 확인', text: limits } ]
    };
  }

  function buildLongitudinalOpinion(records) {
    const fields = ['task_id', 'task_version', 'difficulty', 'device_class', 'input_method', 'session_context'];
    const rows = Array.isArray(records) ? records.filter(function (row) { return row && typeof row === 'object'; }) : [];
    const value = function (v) { return typeof v === 'string' && v.trim() !== '' ? v.trim() : typeof v === 'number' && Number.isFinite(v) ? String(v) : null; };
    const hasConditions = function (r) { return fields.every(function (f) { return value(r[f]) !== null; }); };
    const validTime = function (r) { return typeof r.playedAt === 'string' || r.playedAt instanceof Date ? Date.parse(r.playedAt) : NaN; };
    const limits = ['동일 조건' + '의 3회 기준은 내부 관찰 기준이며 임상적으로 검증된 변화 판정 기준이 아닙니다.', '반복 연습과 당일 환경의 영향을 분리한 치료 효과로 해석하지 않습니다.'];
    const base = { version: OPINION_VERSION, stage: 'held', statusLabel: '조건 확인 필요', matchedCount: 0, excludedCount: rows.length, conditionFields: fields, limits: limits,
      guardianOverview: '같은 조건에서 수행한 기록인지 확인한 뒤 변화 흐름을 살펴봅니다.', guardianSynthesis: '활동과 도움 조건이 달라지면 결과도 달라질 수 있어 변화 판단을 기다립니다.', guardianGuidance: '다음 활동에서 어떤 도움이 필요했는지 선생님과 함께 확인해 주세요.',
      overview: '과제·버전·난이도·기기·입력 방식·수행 맥락과 회기 식별자를 확인한 기록끼리 비교합니다.',
      synthesis: '비교 조건 또는 기록 순서가 확인되지 않아 누적 변화 해석을 보류합니다.', guidance: '다음 기록부터 동일 조건 정보와 회기 식별자를 함께 남기고, 선생님이 도움 제공 방식도 확인합니다.' };
    if (!rows.length || rows.some(function (r) { return !Number.isFinite(validTime(r)); })) return base;
    const sorted = rows.slice().sort(function (a, b) { return validTime(a) - validTime(b); });
    const latest = sorted[sorted.length - 1];
    if (!hasConditions(latest) || value(latest.session_id) === null) return base;
    const key = function (r) { return JSON.stringify(fields.map(function (f) { return value(r[f]); })); };
    const allSessions = new Map();
    for (const r of sorted) {
      const id = value(r.session_id);
      if (id === null) continue;
      const previous = allSessions.get(id);
      const signature = function (entry) { return JSON.stringify([key(entry), validTime(entry), opinionNumber(entry.accuracyRate), opinionNumber(entry.avgQuestionMs), value(entry.reaction_time_rule)]); };
      if (previous && signature(previous) !== signature(r)) { base.synthesis = '같은 회기 식별자에 서로 다른 조건·시각·측정값이 있어 원자료 확인 전 비교를 보류합니다.'; return base; }
      allSessions.set(id, r);
    }
    const candidates = sorted.filter(function (r) { return hasConditions(r) && key(r) === key(latest) && value(r.session_id) !== null; });
    const sessionMap = new Map(); let conflict = false;
    candidates.forEach(function (r) {
      const id = value(r.session_id), previous = sessionMap.get(id);
      if (previous && (validTime(previous) !== validTime(r) || opinionNumber(previous.accuracyRate) !== opinionNumber(r.accuracyRate) || opinionNumber(previous.avgQuestionMs) !== opinionNumber(r.avgQuestionMs))) conflict = true;
      else sessionMap.set(id, r);
    });
    if (conflict) { base.synthesis = '같은' + ' 회기 식별자에 서로 다른 값이 있어 원자료 확인 전 비교를 보류합니다.'; return base; }
    const matched = Array.from(sessionMap.values());
    base.matchedCount = matched.length; base.excludedCount = rows.length - matched.length;
    if (matched.length === 1) return Object.assign(base, { stage: 'baseline', statusLabel: '기준 기록', guardianOverview: '같은 조건으로 확인할 수 있는 활동 기록이 한 번 있습니다. 다음 활동에서 다시 살펴봅니다.', overview: '동일 조건의 확인 가능한 기록은 1회입니다.', synthesis: '이번 기록을 기준으로 보관하고 향상·저하를 판단하지 않습니다.' });
    const first = matched[0], last = matched[matched.length - 1];
    if (validTime(first) === validTime(last)) return Object.assign(base, { synthesis: '기록 시각이 같아 선후 관계를 확인할 수 없습니다.' });
    const observations = [];
    const a = opinionNumber(first.accuracyRate), b = opinionNumber(last.accuracyRate);
    if (a !== null && b !== null && a <= 100 && b <= 100) observations.push('처음과 최근 정확도는 각각 ' + a + '%, ' + b + '%입니다(차이 ' + Math.round((b - a) * 100) / 100 + '%p).');
    const rtA = opinionNumber(first.avgQuestionMs), rtB = opinionNumber(last.avgQuestionMs);
    // Same sampling policy is needed in addition to task/device conditions for RT comparisons.
    if (rtA > 0 && rtB > 0 && value(first.reaction_time_rule) !== null && matched.every(function (r) { return value(r.reaction_time_rule) === value(first.reaction_time_rule); })) observations.push('같은 표본 정의의 평균 반응시간은 처음 ' + rtA + 'ms, 최근 ' + rtB + 'ms입니다. 속도 차이를 정확도 차이와 합산하지 않습니다.');
    if (!observations.length) return Object.assign(base, { synthesis: '동일 조건 기록은 있으나 처음과 최근에 공통으로 측정된 지표가 충분하지 않습니다.' });
    return Object.assign(base, { stage: matched.length === 2 ? 'point-comparison' : 'trend-candidate', statusLabel: matched.length === 2 ? '두 기록 비교' : '수행 흐름 검토',
      guardianOverview: '같은 조건에서 수행한 서로 다른 활동 ' + matched.length + '회를 확인했습니다. ' + (matched.length === 2 ? '두 기록의 차이를 살펴보는 단계입니다.' : '여러 기록의 흐름을 선생님과 함께 살펴볼 수 있습니다.'),
      overview: '동일 조건의 서로 다른 회기 ' + matched.length + '회를 확인했습니다. ' + observations.join(' '),
      synthesis: matched.length === 2 ? '두 시점의 기술적 차이이며 아직 추세로 해석하지 않습니다.' : '처음과 최근 차이만으로 지속적인 향상을 말하지 않습니다. 중간 기록과 도움 수준, 반복 연습의 영향을 선생님이 확인합니다.',
      guidance: '동일 조건에서 정확성과 반응시간을 별도로 살펴보고, 다음 수업 목표는 아이·보호자의 관찰과 함께 담당 선생님이 정합니다.' });
  }

  function renderOpinionSections(opinion, audience) {
    if (!opinion) return '';
    const items = audience === 'guardian'
      ? [{ title: '오늘의 수행 관찰', text: opinion.guardianSummary }, { title: '다음 활동에서 확인', text: opinion.guardianLongSummary }]
      : opinion.sections;
    return '<section class="playlab-report-evidence playlab-report-observation-opinion" data-opinion-version="' + escapeHtml(opinion.version) + '">' +
      '<h4 class="playlab-report-section-title">' + (audience === 'guardian' ? '활동 관찰과 다음 확인' : '근거를 연결한 관찰 소견 · 선생님 검토용') + '</h4>' +
      items.map(function (item) { return '<article><h5>' + escapeHtml(item.title) + '</h5><p>' + escapeHtml(item.text) + '</p></article>'; }).join('') +
      (audience === 'guardian' ? '' : '<p>자동 생성한 관찰 소견 초안 · 최종 소견은 선생님 확인 후 설명합니다. 오류 분류와 조건 조정은 직접 기록을 확인하기 위한 운영 후보입니다.</p><details><summary>해석 기준과 참고 연구</summary><p>아래 연구는 해석 범위를 정하는 참고 자료이며, 이 게임이나 학생의 소견 자체를 검증한 연구는 아닙니다.</p><ul>' + opinion.evidenceIds.filter(function (id) { return OPINION_EVIDENCE[id]; }).map(function (id) { const source = OPINION_EVIDENCE[id]; return '<li><a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(source.title) + '</a></li>'; }).join('') + '</ul><p>규칙 버전: ' + escapeHtml(opinion.version) + '</p></details>') + '</section>';
  }

  function extendRehabObservedReport(report, input) {
    const type = input.reportType;
    if (input.reportEvidenceMode !== 'observed-only' || !['rehablab-traffic-go-nogo', 'rehablab-stroop-color-word', 'rehablab-shape-match-gonogo'].includes(type)) return report;
    const sample = input.reactionTimeSample;
    const count = function (value) { return Number.isSafeInteger(value) && value >= 0; };
    const time = function (value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0; };
    const format = function (value) { return value === null ? '미기록' : String(Math.round(value * 100) / 100) + 'ms'; };
    if (sample && count(sample.included) && count(sample.totalLogs) && count(sample.excluded)
      && sample.included + sample.excluded === sample.totalLogs
      && sample.totalLogs === input.questionLogs.length && sample.meanMs === input.avgQuestionMs
      && (sample.included === 0 ? sample.meanMs === null && sample.medianMs === null && sample.iqrMs === null
        : time(sample.meanMs) && sample.meanMs > 0 && time(sample.medianMs) && sample.medianMs > 0 && time(sample.iqrMs))) {
      const label = type === 'rehablab-stroop-color-word' ? '실제 선택 응답(정·오답 및 늦은 응답 포함)' : '정답 Go 응답';
      report.highlights = [
        { label: '반응시간 중앙값', value: format(sample.medianMs) },
        { label: '반응시간 IQR', value: format(sample.iqrMs) },
        { label: '유효 RT 표본', value: sample.included + '/' + sample.totalLogs + ' · ' + label },
        { label: 'RT 제외 표본', value: sample.excluded + '개' },
        { label: '평균 반응시간(호환용)', value: format(sample.meanMs) }
      ].concat(report.highlights.filter(function (item) { return item.label !== '평균 반응시간'; }));
      report.reactionTimeSample = sample;
      report.avgQuestionMs = sample.meanMs;
      report.teacherReviewNote += ' 반응시간은 ' + label + '의 기술 통계이며, 연령 규준이나 임상 점수가 아닙니다.';
    }
    const categories = input.stroopResponseCategories;
    if (type === 'rehablab-stroop-color-word' && categories
      && ['withinTimeCorrect', 'wrongChoice', 'lateCorrect', 'total'].every(function (key) { return count(categories[key]); })
      && categories.total > 0 && categories.withinTimeCorrect + categories.wrongChoice + categories.lateCorrect === categories.total
      && categories.total === input.totalItems && categories.withinTimeCorrect === input.correctCount && categories.wrongChoice === input.wrongCount
      && input.accuracyRate === Math.round(categories.withinTimeCorrect / categories.total * 100)) {
      report.highlights = report.highlights.filter(function (item) { return item.label !== '첫 시도 정답률'; }).map(function (item) {
        const labels = { '정답': '시간 내 정답', '오답': '오선택', '정확도': '시간 내 정답률' };
        return { label: labels[item.label] || item.label, value: item.value };
      });
      report.highlights.push({ label: '정답 선택·시간 초과', value: String(categories.lateCorrect) });
      const summary = '총 ' + categories.total + '문항 중 시간 내 정답 ' + categories.withinTimeCorrect + '개, 오선택 ' + categories.wrongChoice
        + '개, 정답 선택·시간 초과 ' + categories.lateCorrect + '개가 기록되었습니다. 시간 내 정답률은 ' + String(input.accuracyRate) + '%입니다.';
      report.guardianSummary = summary;
      report.briefOpinion = summary;
      report.longOpinion = summary;
      report.teacherReviewNote = summary + ' 늦은 정답과 오선택은 구분하며, 실제 선택이 없는 반응시간은 추정하지 않습니다.';
      report.stroopResponseCategories = categories;
    }
    return report;
  }

  function buildObservedOnlyReport(input) {
    const quality = input.reportDataQuality;
    const languageSupportScore = input.scoreKind === 'language-support-weighted-percent';
    const highlights = [
      ['전체 문항', input.totalItems, ''], [languageSupportScore ? '독립 정답' : '정답', input.correctCount, ''], [input.wrongCountKind === 'wrong-attempts' || input.measurementContext && input.measurementContext.wrongCountKind === 'wrong-attempts' ? '오답 시도' : '오답', input.wrongCount, ''],
      [languageSupportScore ? '독립 정답률' : '정확도', input.accuracyRate, '%'], ['첫 시도 정답률', input.firstTryRate, '%'], ['평균 반응시간', input.avgQuestionMs, 'ms']
    ];
    if (languageSupportScore) {
      function measured(value) { return (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null; }
      highlights.push(['지원 가중 수행 점수', measured(input.score), '%'], ['도움 후 성공', measured(input.supportedCount), '']);
    }
    const displayedHighlights = highlights.map(function (metric) { return { label: metric[0], value: metric[1] === null ? '미기록' : String(round(metric[1])) + metric[2] }; });
    const summary = '저장된 수행 원자료에서 확인되는 값만 표시합니다. 미기록 값은 추정하지 않으며, 이 기록만으로 인지 기능이나 반응 조절 수준을 판단하지 않습니다.';
    const report = {
      isObservedOnly: true, reportEvidenceMode: 'observed-only', reportScope: getReportScopeForOutput(input),
      title: input.title || input.stageTitle || '활동 수행 기록', stageTitle: input.stageTitle || '',
      originalReportInput: input.originalReportInput, reportDataQuality: quality,
      totalItems: input.totalItems, correctCount: input.correctCount, wrongCount: input.wrongCount,
      accuracyRate: input.accuracyRate, firstTryRate: input.firstTryRate, avgQuestionMs: input.avgQuestionMs,
      elapsedMs: input.elapsedMs, startedAtMs: input.startedAtMs, completionRate: input.completionRate,
      completionCount: input.completionCount, perfectCount: input.perfectCount,
      integratedScore: null, axes: [], sortedAxes: [], roleNotes: [], recommendations: [], observationBenchmark: null,
      band: { label: '수행 원기록', tone: 'neutral' }, headline: '확인된 수행 기록', highlights: displayedHighlights,
      briefOpinion: summary, guardianSummary: summary, guardianLongSummary: '활동 중 도움이 된 조건과 직접 관찰한 반응은 담당 선생님과 함께 확인해 주세요.',
      longOpinion: summary, teacherReviewNote: summary, accentColor: String(input.accentColor || DEFAULT_ACCENT)
    };
    extendRehabObservedReport(report, input);
    const opinion = buildEvidenceOpinion(input);
    report.observationOpinion = opinion;
    report.guardianSummary = opinion.guardianSummary;
    report.guardianLongSummary = opinion.guardianLongSummary;
    report.teacherReviewNote += ' ' + opinion.teacherReviewNote;
    report.longOpinion = opinion.longOpinion;
    report.recommendations = opinion.recommendations;
    return report;
  }

  function buildReport(input) {
    const normalizedInput = normalizeReportRawInput(input);
    if (normalizedInput.reportEvidenceMode === 'observed-only' || normalizedInput.reportDataQuality.source === 'history-aggregate' || !(normalizedInput.totalItems > 0) || ['correctCount', 'wrongCount', 'completionCount', 'elapsedMs', 'firstTryRate', 'avgQuestionMs'].some(function (key) { return normalizedInput[key] === null; })) return buildObservedOnlyReport(normalizedInput);
    const normMeta = getNormProfile(normalizedInput);
    normalizedInput.normProfile = normMeta.key;
    normalizedInput.normProfileLabel = normMeta.profile.label;
    normalizedInput.difficultyIndex = getDifficultyIndex(normalizedInput);
    normalizedInput.benchmarkMs = getBenchmarkMs(normalizedInput, normMeta.profile);

    const total = Math.max(1, Number(normalizedInput.totalItems || normalizedInput.totalQuestions || 0));
    const completionCount = Number(normalizedInput.completionCount ?? normalizedInput.correctCount ?? normalizedInput.seenCount ?? 0);
    const accuracyRate = normalizedInput.accuracyRate != null
      ? clamp(round(normalizedInput.accuracyRate), 0, 100)
      : getPercent(Number(normalizedInput.correctCount || normalizedInput.seenCount || 0), total);
    const completionRate = normalizedInput.completionRate != null
      ? clamp(round(normalizedInput.completionRate), 0, 100)
      : getPercent(completionCount, total);
    const firstTryRate = normalizedInput.firstTryRate != null
      ? clamp(round(normalizedInput.firstTryRate), 0, 100)
      : getPercent(Number(normalizedInput.perfectCount || 0), total);
    const avgQuestionMs = normalizedInput.avgQuestionMs != null
      ? Number(normalizedInput.avgQuestionMs || 0)
      : (completionCount > 0 ? Number(normalizedInput.elapsedMs || 0) / completionCount : 0);
    normalizedInput.avgQuestionMs = avgQuestionMs;
    normalizedInput.accuracyRate = accuracyRate;
    normalizedInput.completionRate = completionRate;
    normalizedInput.firstTryRate = firstTryRate;
    const observationBenchmark = buildObservationBenchmark(normalizedInput, {
      accuracyRate: accuracyRate,
      completionRate: completionRate,
      firstTryRate: firstTryRate,
      avgQuestionMs: avgQuestionMs
    });
    if (observationBenchmark && observationBenchmark.available) {
      normalizedInput.benchmarkMs = observationBenchmark.benchmarkMs;
    }
    const comparableHistory = getComparableHistoryMeta(normalizedInput);

    if (shouldUseSimplePlaylabReport(normalizedInput)) {
      return Object.assign(buildSimplePlaylabReport(normalizedInput, {
        accuracyRate: accuracyRate,
        completionRate: completionRate,
        firstTryRate: firstTryRate
      }), { originalReportInput: normalizedInput.originalReportInput, reportDataQuality: normalizedInput.reportDataQuality });
    }

    const axisPreset = getAxisPreset(normalizedInput.reportType);
    const axisScores = buildAxisScores(normalizedInput);
    const axes = axisPreset.map(function (axis) {
      return {
        id: axis.id,
        label: axis.label,
        score: clamp(round(axisScores[axis.id] || 0), 0, 100)
      };
    });
    const reportProfile = getReportProfile(normalizedInput, axes);
    normalizedInput.reportProfileId = reportProfile.id;
    normalizedInput.reportProfileLabel = reportProfile.label;
    const integratedScore = getIntegratedScore(axes);
    const seed = hashString(JSON.stringify([
      normalizedInput.reportType,
      normalizedInput.title,
      normalizedInput.stageTitle,
      normalizedInput.startedAtMs,
      normalizedInput.elapsedMs,
      normalizedInput.totalItems,
      normalizedInput.correctCount,
      normalizedInput.wrongCount,
      normalizedInput.retryCount,
      normalizedInput.perfectCount,
      normalizedInput.completionCount,
      normalizedInput.avgQuestionMs
    ]));
    const band = getBand(integratedScore, normMeta.profile);
    const sortedAxes = axes.slice().sort(function (left, right) {
      return right.score - left.score;
    });
    const axisLabels = {};
    axes.forEach(function (axis) {
      axisLabels[axis.id] = axis;
    });

    const report = {
      reportScope: getReportScopeForOutput(normalizedInput),
      title: String(normalizedInput.title || normalizedInput.stageTitle || "재활랩 리포트"),
      stageTitle: String(normalizedInput.stageTitle || normalizedInput.title || "재활랩"),
      subtitle: String(normalizedInput.subtitle || normalizedInput.categoryLabel || normalizedInput.labTitle || "재활랩 수행 분석"),
      completedAtMs: normalizedInput.completedAtMs ?? normalizedInput.endedAtMs ?? null,
      totalItems: total,
      correctCount: Number(normalizedInput.correctCount ?? normalizedInput.seenCount ?? 0),
      wrongCount: Number(normalizedInput.wrongCount ?? normalizedInput.retryCount ?? 0),
      integratedScore: integratedScore,
      band: band,
      axes: axes,
      axisLabels: axisLabels,
      sortedAxes: sortedAxes,
      normProfile: normMeta.profile,
      normProfileKey: normMeta.key,
      normProfileLabel: normMeta.profile.label,
      reportProfile: reportProfile,
      reportProfileId: reportProfile.id,
      reportProfileLabel: reportProfile.label,
      headline: buildHeadline(normalizedInput, integratedScore, seed, normMeta.profile, reportProfile),
      briefOpinion: buildBriefOpinion({
        sortedAxes: sortedAxes,
        band: band,
        integratedScore: integratedScore,
        accuracyRate: accuracyRate,
        firstTryRate: firstTryRate,
        normProfile: normMeta.profile,
        reportProfile: reportProfile
      }, seed),
      guardianSummary: "이번 활동에서는 " + reportProfile.label + " 과제의 참여 흐름과 반응 양상이 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.",
      guardianLongSummary: "세부 점수와 오류 유형은 전문가 분석 화면에서 담당 선생님이 확인하고, 다음 활동은 내담자의 컨디션과 수업 맥락을 함께 본 뒤 조정합니다.",
      longOpinion: buildLongOpinion({
        sortedAxes: sortedAxes,
        band: band,
        integratedScore: integratedScore,
        normProfile: normMeta.profile,
        reportProfile: reportProfile
      }, seed),
      roleNotes: buildRoleNotes({
        sortedAxes: sortedAxes,
        axisLabels: axisLabels,
        band: band,
        integratedScore: integratedScore,
        normProfile: normMeta.profile,
        reportProfile: reportProfile
      }, seed),
      recommendations: buildRecommendations({
        sortedAxes: sortedAxes,
        axisLabels: axisLabels,
        reportProfile: reportProfile
      }, seed),
      highlights: buildHighlights(normalizedInput, {
        integratedScore: integratedScore,
        completionRate: completionRate,
        observationBenchmark: observationBenchmark
      }),
      evidenceBasis: buildEvidenceBasis(normalizedInput, reportProfile, normMeta.profile),
      referenceLinks: buildReferenceLinks(normalizedInput),
      observationBenchmark: observationBenchmark,
      comparableHistory: comparableHistory,
      completionRate: completionRate,
      accuracyRate: accuracyRate,
      firstTryRate: firstTryRate,
      elapsedMs: Number(normalizedInput.elapsedMs || 0),
      avgQuestionMs: avgQuestionMs,
      disclaimer: "본 리포트는 회기 내 수행 자료를 바탕으로 한 임상 참고용 자동 소견입니다. 표준화 신경심리검사, 작업치료/언어치료 평가, 의학적 진단 또는 치료적 판정을 대체하지 않으며, 담당 전문가의 직접 관찰과 병력 정보를 함께 고려해야 합니다.",
      accentColor: String(normalizedInput.accentColor || DEFAULT_ACCENT)
    };

    report.originalReportInput = normalizedInput.originalReportInput;
    report.reportDataQuality = normalizedInput.reportDataQuality;
    return report;
  }

  function renderAxisList(axes) {
    return axes.map(function (axis) {
      return '' +
        '<div class="playlab-report-axis-item">' +
          '<span class="playlab-report-axis-label">' + escapeHtml(axis.label) + "</span>" +
          '<strong class="playlab-report-axis-value">' + escapeHtml(String(axis.score)) + "</strong>" +
        "</div>";
    }).join("");
  }

  function renderHighlights(highlights) {
    return (highlights || []).map(function (item) {
      return '' +
        '<div class="playlab-report-highlight-item">' +
          '<span class="playlab-report-highlight-label">' + escapeHtml(item.label) + "</span>" +
          '<strong class="playlab-report-highlight-value">' + escapeHtml(item.value) + "</strong>" +
        "</div>";
    }).join("");
  }

  function renderRoleNotes(roleNotes, options) {
    const config = options || {};
    return (roleNotes || []).map(function (item) {
      const title = item && (item.title || item.label || item.name) || "전문가 소견";
      const text = item && (item.text || item.desc || item.description || item.summary || item.detailedOpinion) || "";
      if (config.collapsible) {
        const safeTitle = String(title).replace(/전문가\s*소견/g, "관찰 관점").replace(/소견/g, "관찰");
        return '' +
          '<article class="playlab-report-role-card playlab-report-role-detail">' +
            '<header><small>디지털 수행기록 기반 자동 관찰 초안</small><h5>' + escapeHtml(safeTitle) + '</h5></header>' +
            '<p class="playlab-report-role-copy">' + formatRichText(text) + '</p>' +
          '</article>';
      }
      return '' +
        '<article class="playlab-report-role-card">' +
          '<span class="playlab-report-role-source">디지털 학습 기록 기반 해석 후보</span>' +
          '<h5 class="playlab-report-role-title">' + escapeHtml(title) + "</h5>" +
          '<p class="playlab-report-role-copy">' + formatRichText(text) + "</p>" +
        "</article>";
    }).join("");
  }

  function renderRecommendations(recommendations, options) {
    const config = options || {};
    return (recommendations || []).map(function (item, index) {
      const normalized = typeof item === "string" ? { title: "학습 전략", desc: item } : (item || {});
      const title = normalized.title || normalized.label || normalized.name || "학습 전략";
      const text = normalized.desc || normalized.text || normalized.description || normalized.summary || "";
      return '' +
        '<div class="playlab-report-training-item">' +
          (config.indexed ? '<span class="playlab-report-plan-index">0' + String(index + 1) + '</span>' : '') +
          '<strong class="playlab-report-training-title">' + escapeHtml(title) + "</strong>" +
          '<p class="playlab-report-training-copy">' + formatRichText(text) + "</p>" +
        "</div>";
    }).join("");
  }

  function renderEvidenceBasis(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return '' +
      '<section class="playlab-report-evidence">' +
        '<h4 class="playlab-report-section-title">해석 기준</h4>' +
        '<ul class="playlab-report-evidence-list">' +
          items.map(function (item) {
            return '<li>' + formatRichText(item) + "</li>";
          }).join("") +
        "</ul>" +
      "</section>";
  }

  function renderReferenceLinks(items) {
    if (!Array.isArray(items) || !items.length) return "";
    const links = items.map(function (item) {
      if (typeof item === "string") {
        return { label: item, url: "" };
      }
      return {
        label: item && (item.label || item.title || item.name || item.url) || "",
        url: item && item.url || ""
      };
    }).filter(function (item) {
      return item.label;
    });
    if (!links.length) return "";
    return '' +
      '<section class="playlab-report-reference">' +
        '<h4 class="playlab-report-section-title">참고 기준</h4>' +
        '<ul class="playlab-report-reference-list">' +
          links.map(function (item) {
            if (!item.url) return '<li>' + escapeHtml(item.label) + "</li>";
            return '<li><a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.label) + "</a></li>";
          }).join("") +
        "</ul>" +
      "</section>";
  }

  const REPORT_MODE_STORAGE_KEY = "haha_lab_rehab_report_mode_v1";
  const REPORT_TAB_HOST_SELECTOR = [
    ".playlab-snack-report-card",
    ".playlab-iceword-report-card",
    ".traffic-result-card",
    ".shape-result-card",
    ".stroop-result-card",
    ".legacy-result-card",
    ".playlab-result-card",
    ".spotlight-result-card",
    ".colorseq-result-card",
    ".time-result-panel",
    ".cognitive-result-card",
    ".number-agency-result-card"
  ].join(",");

  function normalizeReportMode(mode) {
    const normalizer = window.HahaLabReportDualMode && window.HahaLabReportDualMode.normalizeMode;
    if (typeof normalizer === "function") {
      const normalizedByPolicy = normalizer(mode);
      if (normalizedByPolicy === "guardian" || normalizedByPolicy === "teacher") return normalizedByPolicy;
    }
    const normalized = String(mode || "").trim().toLowerCase();
    if (normalized === "guardian" || normalized === "parent" || normalized === "family" || normalized === "caregiver") return "guardian";
    if (normalized === "teacher" || normalized === "professional" || normalized === "clinician" || normalized === "institution") return "teacher";
    return "teacher";
  }

  function readRuntimeReportMode(options) {
    const explicit = options && (options.reportMode || options.mode);
    if (explicit) return normalizeReportMode(explicit);
    try {
      return normalizeReportMode(window.localStorage && window.localStorage.getItem(REPORT_MODE_STORAGE_KEY));
    } catch (_error) {
      return "teacher";
    }
  }

  function writeRuntimeReportMode(mode) {
    try {
      window.localStorage && window.localStorage.setItem(REPORT_MODE_STORAGE_KEY, normalizeReportMode(mode));
    } catch (_error) {}
  }

  function getReportModeCopy(mode) {
    const normalized = normalizeReportMode(mode);
    const policyConfig = window.HahaLabReportDualMode && window.HahaLabReportDualMode.getReportModeConfig
      ? window.HahaLabReportDualMode.getReportModeConfig(normalized)
      : null;
    if (normalized === "guardian") {
      return {
        kicker: "GUARDIAN SHARE",
        title: policyConfig && policyConfig.label ? policyConfig.label : "보호자 공유 모드",
        description: "보호자에게 공유하기 쉬운 관찰 요약만 보여주고, 세부 전문 분석은 선생님 검토 화면에 남겨둡니다."
      };
    }
    return {
      kicker: "PROFESSIONAL ANALYSIS",
      title: policyConfig && policyConfig.label ? policyConfig.label : "전문가 분석 모드",
      description: "선생님 검토를 위해 수행 지표, 오류 유형, 반응 패턴, 조정 후보를 자세히 보여줍니다."
    };
  }

  function getReportModeDisclaimers(mode) {
    const builder = window.HahaLabReportDualMode && window.HahaLabReportDualMode.buildReportDisclaimer;
    if (typeof builder === "function") return builder(normalizeReportMode(mode));
    return [
      "본 리포트는 학습 수행 기록을 바탕으로 한 관찰 자료이며, 진단이나 치료 효과 판정이 아닙니다.",
      "활동 조정은 내담자의 컨디션, 수업 맥락, 선생님의 전문 판단을 함께 고려해 결정합니다."
    ];
  }

  function sanitizeGuardianText(text) {
    return String(text || "")
      .replace(/임상적으?로/g, "수업 관찰상")
      .replace(/임상/g, "관찰")
      .replace(/전문가별/g, "선생님 확인")
      .replace(/전문 소견/g, "관찰 요약")
      .replace(/권장 훈련 방향/g, "다음 활동 검토")
      .replace(/권장/g, "검토")
      .replace(/훈련/g, "활동")
      .replace(/치료/g, "지원")
      .replace(/진단/g, "판정")
      .replace(/확정/g, "검토")
      .replace(/자동으로 스케줄링합니다/g, "선생님 검토 후 조정 후보로 제안합니다")
      .replace(/다음 주 활동을 진행합니다/g, "다음 활동 전 선생님이 상태를 확인해 조정합니다");
  }

  function renderReportModeSwitcher(mode) {
    return '' +
      '<div class="playlab-report-mode-panel">' +
        '<div class="playlab-report-mode-actions" role="tablist" aria-label="리포트 보기 모드">' +
          '<button type="button" id="playlabReportGuardianTab" class="playlab-report-mode-btn" role="tab" data-report-mode-target="guardian" aria-controls="playlabReportGuardianPanel" aria-selected="' + (mode === "guardian" ? "true" : "false") + '" aria-pressed="' + (mode === "guardian" ? "true" : "false") + '" onclick="window.PlaylabReportEngine&&window.PlaylabReportEngine.setReportModeFromButton&&window.PlaylabReportEngine.setReportModeFromButton(this, \'guardian\')"><span class="playlab-report-mode-check" aria-hidden="true"></span><span class="playlab-report-mode-label">학부모 리포트</span><small>관찰 요약</small></button>' +
          '<button type="button" id="playlabReportTeacherTab" class="playlab-report-mode-btn" role="tab" data-report-mode-target="teacher" aria-controls="playlabReportTeacherPanel" aria-selected="' + (mode === "teacher" ? "true" : "false") + '" aria-pressed="' + (mode === "teacher" ? "true" : "false") + '" onclick="window.PlaylabReportEngine&&window.PlaylabReportEngine.setReportModeFromButton&&window.PlaylabReportEngine.setReportModeFromButton(this, \'teacher\')"><span class="playlab-report-mode-check" aria-hidden="true"></span><span class="playlab-report-mode-label">전문가 리포트</span><small>통합·분야별 소견</small></button>' +
        '</div>' +
      '</div>';
  }

  function getReportShellForModeButton(button) {
    if (!button || !button.closest) return null;
    const ownShell = button.closest(".playlab-report-shell");
    if (ownShell) return ownShell;
    const controlledPanel = button.getAttribute && document.getElementById(button.getAttribute("aria-controls") || "");
    if (controlledPanel && controlledPanel.closest) {
      const controlledShell = controlledPanel.closest(".playlab-report-shell");
      if (controlledShell) return controlledShell;
    }
    const host = button.closest(REPORT_TAB_HOST_SELECTOR);
    if (host && host.querySelector) {
      const hostedShell = host.querySelector(".playlab-report-shell");
      if (hostedShell) return hostedShell;
    }
    return document.querySelector(".playlab-report-shell");
  }

  function promoteReportModePanel(shell) {
    if (!shell || !shell.querySelector || !shell.closest) return;
    if (document.body && document.body.classList && document.body.classList.contains("playlab-report-document-flow")) return;
    const panel = shell.querySelector(".playlab-report-mode-panel");
    if (!panel) return;
    panel.classList.remove("playlab-report-mode-panel-top");
    if (document.body && panel.parentElement !== document.body) {
      const existing = document.body.querySelector(".playlab-report-mode-panel[data-playlab-promoted='true']");
      if (existing && existing !== panel) existing.remove();
      panel.setAttribute("data-playlab-promoted", "true");
      document.body.appendChild(panel);
    }
  }

  function promoteAllReportModePanels(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(".playlab-report-shell").forEach(promoteReportModePanel);
  }

  function scheduleReportModePanelPromotion(root) {
    const run = function () {
      promoteAllReportModePanels(root);
      scheduleParentReportLayout(true);
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(run);
    } else {
      window.setTimeout(run, 0);
    }
  }

  function renderReportModeNotice(mode) {
    const copy = getReportModeCopy(mode);
    const disclaimers = getReportModeDisclaimers(mode);
    return '' +
      '<div class="playlab-report-mode-notice">' +
        '<div>' +
          '<p class="playlab-report-mode-kicker">' + escapeHtml(copy.kicker) + '</p>' +
          '<strong>' + escapeHtml(copy.title) + '</strong>' +
          '<span>' + escapeHtml(copy.description) + '</span>' +
        '</div>' +
        '<ul>' +
          disclaimers.slice(0, 3).map(function (item) {
            return '<li>' + escapeHtml(item) + '</li>';
          }).join('') +
        '</ul>' +
      '</div>';
  }

  function formatReportDate(ms) {
    const value = Number(ms || 0);
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (_error) {
      return "";
    }
  }

  function getReportTitle(report) {
    return String(report && (report.stageTitle || report.title || report.reportProfileLabel) || "재활랩 리포트");
  }

  function getReportSubtitle(report) {
    const profile = report && (report.reportProfileLabel || report.normProfileLabel);
    const subtitle = report && report.subtitle;
    return [profile, subtitle].filter(Boolean).join(" · ") || "신뢰도 5개 영역 분석";
  }

  function renderReportHeroVisual() {
    return '' +
      '<div class="playlab-report-hero-visual" aria-hidden="true">' +
        '<div class="playlab-report-hero-card playlab-report-hero-card-main">' +
          '<span></span><span></span><span></span>' +
          '<i></i><i></i><i></i>' +
        '</div>' +
        '<div class="playlab-report-hero-card playlab-report-hero-card-side">' +
          '<b></b><b></b>' +
        '</div>' +
        '<div class="playlab-report-hero-pie"></div>' +
        '<div class="playlab-report-hero-leaf playlab-report-hero-leaf-left"></div>' +
        '<div class="playlab-report-hero-leaf playlab-report-hero-leaf-right"></div>' +
      '</div>';
  }

  function renderReportMetaIcon(name) {
    const paths = {
      calendar: "M7 2v4M17 2v4M4 9h16M6 4h12a2 2 0 0 1 2 2v14H4V6a2 2 0 0 1 2-2z",
      user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
      article: "M6 3h9l3 3v15H6V3zM15 3v4h4M9 12h6M9 16h6",
      timer: "M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
    };
    const path = paths[name] || paths.article;
    return '<span class="playlab-report-hero-meta-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="' + path + '"></path></svg></span>';
  }

  function renderReportMetaStrip(report) {
    const items = [
      { label: "완료일", icon: "calendar", value: formatReportDate(report.completedAtMs) || "기록 완료" },
      { label: "대상 기준", icon: "user", value: report.normProfileLabel || "관찰 기준" },
      { label: "문항", icon: "article", value: String(report.totalItems || 0) + "문항" },
      { label: "소요 시간", icon: "timer", value: formatDuration(report.elapsedMs) || "-" }
    ];
    return '<div class="playlab-report-hero-meta">' + items.map(function (item) {
      return '' +
        '<div class="playlab-report-hero-meta-item">' +
          renderReportMetaIcon(item.icon) +
          '<span>' + escapeHtml(item.value) + '</span>' +
        '</div>';
    }).join("") + '</div>';
  }

  function renderReportHero(report) {
    return '' +
      '<header class="playlab-report-hero">' +
        '<div class="playlab-report-hero-copy">' +
          '<p class="playlab-report-hero-kicker">PLAYLAB SESSION REPORT</p>' +
          '<h3 class="playlab-report-hero-title">' + escapeHtml(getReportTitle(report)) + '</h3>' +
          '<p class="playlab-report-hero-subtitle">' + escapeHtml(getReportSubtitle(report)) + '</p>' +
          renderReportMetaStrip(report) +
        '</div>' +
        renderReportHeroVisual() +
      '</header>';
  }

  function renderScoreRing(report) {
    const score = clamp(round(Number(report.integratedScore || 0)), 0, 100);
    return '' +
      '<div class="playlab-report-score-ring" style="--score:' + String(score) + ';">' +
        '<div class="playlab-report-score-ring-inner">' +
          '<strong>' + escapeHtml(String(score)) + '</strong>' +
          '<span>점수</span>' +
        '</div>' +
      '</div>';
  }

  function renderReportMetricGrid(report) {
    const source = []
      .concat(Array.isArray(report.highlights) ? report.highlights : [])
      .concat((Array.isArray(report.axes) ? report.axes : []).map(function (axis) {
        return { label: axis.label, value: String(axis.score) };
      }));
    const seen = {};
    const items = source.filter(function (item) {
      const key = String(item && item.label || "");
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
    return '<div class="playlab-report-metric-grid">' + items.map(function (item) {
      return '' +
        '<div class="playlab-report-metric-card">' +
          '<span class="playlab-report-metric-icon" aria-hidden="true"></span>' +
          '<span class="playlab-report-metric-label">' + escapeHtml(item.label) + '</span>' +
          '<strong class="playlab-report-metric-value">' + escapeHtml(item.value) + '</strong>' +
        '</div>';
    }).join("") + '</div>';
  }

  function getStandaloneSessionMetrics(report) {
    const allowedLabels = {
      "완료 항목": "완료 항목",
      "확인 완료율": "확인 완료율",
      "단서 후 정답": "단서 후 정답",
      "독립 정답률": "독립 정답률",
      "초회 성공률": "초회 성공률",
      "오류 부담": "오류 기록",
      "정확도": "정확도",
      "총 소요 시간": "소요 시간",
      "평균 반응": "평균 반응",
      "리포트 유형": "과제 유형",
      "난이도 기준": "선택 난이도"
    };
    const seen = {};
    return (Array.isArray(report.highlights) ? report.highlights : []).filter(function (item) {
      const label = String(item && item.label || "");
      if (!allowedLabels[label] || seen[label]) return false;
      seen[label] = true;
      return true;
    }).slice(0, 8).map(function (item) {
      return { label: allowedLabels[item.label], value: item.value };
    });
  }

  function renderStandaloneSessionMetrics(report) {
    const items = getStandaloneSessionMetrics(report);
    return '<div class="playlab-report-session-metric-grid">' + items.map(function (item) {
      return '' +
        '<article class="playlab-report-session-metric">' +
          '<span>' + escapeHtml(item.label) + '</span>' +
          '<strong>' + escapeHtml(item.value) + '</strong>' +
        '</article>';
    }).join("") + '</div>';
  }

  function renderStandaloneProfile(report, options) {
    const config = options || {};
    const isGuardian = config.audience === "guardian";
    const titleId = isGuardian ? "playlabGuardianProfileTitle" : "playlabStandaloneProfileTitle";
    const axes = Array.isArray(report.axes) ? report.axes : [];
    const radarAxes = axes.filter(function (axis) {
      return Number.isFinite(Number(axis && axis.score)) && Number(axis.score) > 0;
    });
    const radarReport = Object.assign({}, report, { axes: radarAxes });
    return '' +
      '<section class="playlab-report-profile-card' + (isGuardian ? ' playlab-report-guardian-profile' : '') + '" aria-labelledby="' + titleId + '">' +
        '<div class="playlab-report-section-head">' +
          '<div>' +
            '<p class="playlab-report-section-eyebrow">FUNCTIONAL OBSERVATION</p>' +
            '<h4 id="' + titleId + '" class="playlab-report-section-title">과제별 관찰지표 시각화</h4>' +
          '</div>' +
          '<span class="playlab-report-section-chip">비표준화 자동 관찰값</span>' +
        '</div>' +
        '<p class="playlab-report-section-intro">이번 과제에서 기록된 수행값을 기능 영역별로 정리했습니다.</p>' +
        '<div class="playlab-report-profile-visual-layout">' +
          (radarAxes.length >= 3 ? '' +
            '<figure class="playlab-report-standalone-radar">' +
              '<div class="playlab-report-radar-kicker">비표준화 자동 관찰값</div>' +
              '<figcaption>이번 과제 자동 관찰값 · 방사형 요약</figcaption>' +
              renderReportRadarFigure(radarReport) +
              '<small>동일 회기의 과제 내 산출값이며 축 간 상대 모양만 확인합니다.</small>' +
            '</figure>' : '') +
          '<div class="playlab-report-functional-grid">' + axes.map(function (axis) {
          const value = clamp(round(Number(axis && axis.score || 0)), 0, 100);
          const hasValue = Number(axis && axis.score) > 0;
          return '' +
            '<article class="playlab-report-functional-card">' +
              '<div class="playlab-report-functional-head"><span>' + escapeHtml(axis.label) + '</span><strong>' + escapeHtml(hasValue ? String(value) : '자료 없음') + '</strong></div>' +
              (hasValue ? '<meter min="0" max="100" value="' + escapeHtml(String(value)) + '" aria-label="' + escapeHtml(axis.label + ' 자동 관찰지표 ' + value) + '"></meter>' : '<span class="playlab-report-functional-missing">산출 근거가 저장되지 않았습니다.</span>') +
              '<small>' + (hasValue ? '이번 과제 자동 관찰값' : '0점으로 대체하지 않음') + '</small>' +
            '</article>';
          }).join("") + '</div>' +
        '</div>' +
      '</section>';
  }

  function renderStandaloneReportFooter() {
    return '' +
      '<footer class="playlab-report-shared-footer">' +
        '<p>본 리포트는 회기 내 수행 자료를 바탕으로 한 임상 참고용 자동 소견입니다.</p>' +
        '<p>표준화 신경심리검사, 작업치료/언어치료 평가, 의학적 진단 또는 치료적 판정을 대체하지 않으며, 담당 전문가의 직접 관찰과 병력 정보를 함께 고려해야 합니다.</p>' +
        '<small>© 2026 HAHA LAB. All rights reserved.</small>' +
      '</footer>';
  }

  function renderStandaloneObservationSummary(report, audienceText) {
    const history = report.comparableHistory || getComparableHistoryMeta({});
    const accuracy = Number(report.accuracyRate);
    const errorCount = Number(report.wrongCount || 0);
    const observed = Number.isFinite(accuracy)
      ? '이번 조건에서 정확 반응 ' + String(clamp(round(accuracy), 0, 100)) + '%가 기록되었습니다.'
      : '이번 회기의 완료 흐름과 반응 기록을 확인했습니다.';
    const recheck = errorCount > 0
      ? '오류 ' + String(errorCount) + '회가 기록되어 같은 조건에서 오류 전후의 확인 절차를 다시 살펴봅니다.'
      : '같은 과제 조건에서 반응이 반복되는지 다음 회기에 다시 확인합니다.';
    const sanitizeNarrative = function (value) {
      return String(value || "").split(/(?<=[.!?。])\s+/).filter(function (sentence) {
        return sentence && !/(통합\s*점수|우수\s*영역|보완\s*영역|연령\s*기준|표준\s*시간|레벨\s*권고)/.test(sentence);
      }).join(" ").trim();
    };
    const brief = sanitizeNarrative(audienceText.teacherBrief);
    const long = sanitizeNarrative(audienceText.teacherLong);
    return '' +
      '<section class="playlab-report-visual-summary" aria-labelledby="playlabStandaloneSummaryTitle">' +
        '<div class="playlab-report-section-head">' +
          '<div><p class="playlab-report-section-eyebrow">SESSION INTERPRETATION</p><h4 id="playlabStandaloneSummaryTitle" class="playlab-report-section-title">통합 관찰 초안</h4></div>' +
          '<span class="playlab-report-section-chip">디지털 수행기록 기반</span>' +
        '</div>' +
        '<div class="playlab-report-observation-grid">' +
          '<article><span>01 · 관찰 사실</span><strong>' + escapeHtml(observed) + '</strong></article>' +
          '<article><span>02 · 재확인</span><strong>' + escapeHtml(recheck) + '</strong></article>' +
          '<article><span>03 · 비교 범위</span><strong>' + escapeHtml(history.wording) + '</strong></article>' +
        '</div>' +
        '<div class="playlab-report-summary-narrative">' +
          '<p>' + formatRichText(brief) + '</p>' +
          '<section class="playlab-report-summary-detail"><h5>통합 해석 전문소견</h5><p>' + formatRichText(long) + '</p></section>' +
        '</div>' +
      '</section>';
  }

  function renderReportSummaryBadges(report) {
    const axes = Array.isArray(report.sortedAxes) && report.sortedAxes.length ? report.sortedAxes : report.axes || [];
    const items = axes.slice(0, 2).map(function (axis) {
      return { tone: "is-strong", label: "우수 영역", value: axis.label };
    }).concat(axes.slice(-2).map(function (axis) {
      return { tone: "is-watch", label: "보완 영역", value: axis.label };
    }));
    return '<div class="playlab-report-summary-badges">' + items.map(function (item) {
      return '<div><span class="' + item.tone + '">' + item.label + '</span><b>' + escapeHtml(item.value) + '</b></div>';
    }).join("") + '</div>';
  }

  function renderReportSupportGrid(report) {
    return '' +
      '<div class="playlab-report-support-grid">' +
        '<section class="playlab-report-roles">' +
          '<div class="playlab-report-section-head">' +
              '<h4 class="playlab-report-section-title">전문가별 소견</h4>' +
          '</div>' +
          '<div class="playlab-report-role-grid">' + renderRoleNotes(report.roleNotes) + '</div>' +
        '</section>' +
        '<div class="playlab-report-side-stack">' +
          '<section class="playlab-report-training playlab-report-training-plan">' +
            '<div class="playlab-report-section-head">' +
              '<h4 class="playlab-report-section-title">권장 훈련 방향</h4>' +
            '</div>' +
            '<div class="playlab-report-training-list">' + renderRecommendations(report.recommendations || []) + '</div>' +
          '</section>' +
          renderEvidenceBasis(report.evidenceBasis) +
        '</div>' +
      '</div>';
  }

  function renderGuardianHighlights(report) {
    const highlights = [
      { label: "활동 흐름", value: "기록됨" },
      { label: "정답 반응", value: "관찰됨" },
      { label: "다음 확인", value: "선생님 검토" }
    ];
    return '<div class="playlab-report-highlight-grid playlab-report-guardian-highlight-grid">' + renderHighlights(highlights) + '</div>';
  }

  function getGuardianDocumentItems(report) {
    const axes = Array.isArray(report.sortedAxes) && report.sortedAxes.length
      ? report.sortedAxes
      : (Array.isArray(report.axes) ? report.axes : []);
    const observedStrength = axes[0]
      ? axes[0].label + " 반응이 이번 활동 안에서 상대적으로 안정적으로 관찰되었습니다."
      : "활동을 시작하고 마무리하는 참여 흐름이 관찰되었습니다.";
    const supportAxis = axes.length > 1 ? axes[axes.length - 1] : null;
    const recommendation = Array.isArray(report.recommendations) && report.recommendations[0]
      ? report.recommendations[0]
      : null;
    const recommendationText = recommendation && (recommendation.desc || recommendation.text || recommendation.description);
    const supportCondition = recommendationText
      ? sanitizeGuardianText(recommendationText)
      : (supportAxis
        ? supportAxis.label + " 반응은 문항 수, 제시 속도, 도움 단서가 맞을 때 더 안정적인지 확인이 필요합니다."
        : "짧은 문항, 충분한 기다림, 한 번에 하나의 단서를 제공했을 때 반응을 확인합니다.");
    const history = report.comparableHistory || { hasComparableHistory: false };
    return [
      {
        label: "활동",
        value: getReportTitle(report) + " 활동에서 시작, 유지, 마무리까지의 참여와 반응을 관찰했습니다."
      },
      { label: "관찰된 강점", value: observedStrength },
      { label: "도움이 되는 조건", value: supportCondition },
      {
        label: "가정에서의 반응",
        value: "정답 연습을 늘리기보다 충분히 기다렸을 때, 다시 보기를 제안했을 때, 도움을 요청할 때의 반응을 편하게 관찰해 주세요."
      },
      {
        label: "다음 회기 확인",
        value: history.hasComparableHistory
          ? "동일한 과제 조건에서 오늘 관찰된 반응이 다시 나타나는지 확인한 뒤 활동 조건을 조정합니다."
          : "이번 기록은 기준선 관찰입니다. 다음 회기에 동일한 과제 조건에서 반응을 다시 확인하며, 현재 자료만으로 변화 추세를 말하지 않습니다."
      }
    ];
  }

  function renderGuardianActionItems(report) {
    const items = (report.recommendations || []).slice(0, 3);
    if (!items.length) return "";
    return '' +
      '<section class="playlab-report-guardian-actions">' +
        '<h4 class="playlab-report-section-title">다음 활동 검토 후보</h4>' +
        '<div class="playlab-report-training-list">' +
          items.map(function (item) {
            return '' +
              '<div class="playlab-report-training-item">' +
                '<strong class="playlab-report-training-title">' + escapeHtml(sanitizeGuardianText(item.title || "선생님 확인")) + '</strong>' +
                '<p class="playlab-report-training-copy">' + formatRichText(sanitizeGuardianText(item.desc || "다음 활동 전 담당 선생님이 컨디션과 수업 맥락을 함께 확인합니다.")) + '</p>' +
              '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  function renderGuardianCounselingGuide(report) {
    const title = getReportTitle(report);
    const profile = String(report && report.reportProfileLabel ? report.reportProfileLabel : "재활 활동");
    const items = [
      {
        label: "활동 흐름",
        expert: "재활 세션 관찰",
        cue: "시작-유지-마무리 흐름",
        clinical: "전문가는 " + title + " 수행에서 과제를 시작하는 속도, 중간에 주의가 흔들리는 순간, 다시 참여로 돌아오는 과정을 함께 봅니다. 이 흐름은 " + profile + " 활동에서 안정적인 참여 루틴이 형성되는지를 확인하는 기준입니다.",
        plain: "보호자에게는 '오늘은 잘 맞혔는지만 보지 않고, 시작하고 끝까지 따라오는 힘을 같이 봤습니다. 중간에 흔들린 부분은 아이가 못해서라기보다 컨디션과 단서가 맞았는지 함께 확인하겠습니다.'라고 설명합니다."
      },
      {
        label: "정답 반응",
        expert: "언어·인지 반응 분석",
        cue: "정답보다 단서 처리 과정",
        clinical: "전문가는 정답 여부만 보지 않고 단서를 듣거나 보고 이해한 뒤 반응까지 이어지는 과정을 봅니다. 오답이 있어도 어떤 단서에서 안정적으로 반응했는지, 다시 확인했을 때 반응이 좋아지는지를 상담 포인트로 삼습니다.",
        plain: "보호자에게는 '몇 개 맞혔는지보다 어떤 도움을 주면 반응이 좋아지는지가 더 중요합니다. 오늘 기록은 집에서 더 시키라는 뜻이 아니라, 다음 수업에서 어떤 단서가 도움이 되는지 찾기 위한 자료입니다.'라고 풀어 말합니다."
      },
      {
        label: "다음 확인",
        expert: "수업 조정 계획",
        cue: "다음 활동은 선생님 검토 후 결정",
        clinical: "전문가는 오늘 결과를 바로 난이도 확정이나 진단처럼 말하지 않고, 다음 회기에 다시 확인할 관찰 질문으로 정리합니다. 활동 흐름과 정답 반응이 모두 안정적이면 난이도를 올리고, 한쪽이 흔들리면 단서나 속도를 먼저 조정합니다.",
        plain: "보호자에게는 '오늘 결과만으로 단계를 결정하지는 않겠습니다. 다음 시간에 같은 반응이 반복되는지 보고 조정하겠습니다. 가정에서는 정답을 훈련시키기보다 기다림, 다시 보기, 도움 요청이 나오는지만 편하게 관찰해 주세요.'라고 안내합니다."
      }
    ];
    return '' +
      '<section class="playlab-report-guardian-counseling">' +
        '<div class="playlab-report-section-head">' +
          '<h4 class="playlab-report-section-title">학부모 상담 가이드</h4>' +
          '<span class="playlab-report-section-chip">어떻게 이야기할까요</span>' +
        '</div>' +
        '<div class="playlab-report-counseling-grid">' +
          items.map(function (item) {
            return '' +
              '<article class="playlab-report-counseling-card">' +
                '<span class="playlab-report-counseling-label">' + escapeHtml(item.label) + '</span>' +
                '<strong>' + escapeHtml(item.cue) + '</strong>' +
                '<div class="playlab-report-counseling-block">' +
                  '<b>전문가 설명</b>' +
                  '<p>' + formatRichText(sanitizeGuardianText(item.clinical)) + '</p>' +
                '</div>' +
                '<div class="playlab-report-counseling-block is-plain">' +
                  '<b>보호자에게는 이렇게</b>' +
                  '<p>' + formatRichText(sanitizeGuardianText(item.plain)) + '</p>' +
                '</div>' +
              '</article>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  function looksLikeGuardianSummaryText(text) {
    const value = String(text || "");
    if (!value) return false;
    return /보호자|가정|활동|참여|컨디션|수업 맥락|선생님|간단히|부담이 큰 세부 수치|공유/.test(value);
  }

  function looksLikeTeacherAnalysisText(text) {
    const value = String(text || "");
    if (!value) return false;
    return /전문가|전문 소견|임상|프로파일|지표|축|정확도|반응속도|작업기억|억제|시지각|표준화|신경심리|재활|해석/.test(value);
  }

  function resolveReportAudienceText(report) {
    const guardianBrief = String(report && report.guardianSummary || "").trim();
    const guardianLong = String(report && report.guardianLongSummary || "").trim();
    const teacherBrief = String(report && report.briefOpinion || "").trim();
    const teacherLong = String(report && report.longOpinion || "").trim();
    const isBriefSwapped = looksLikeTeacherAnalysisText(guardianBrief) && looksLikeGuardianSummaryText(teacherBrief);
    const isLongSwapped = looksLikeTeacherAnalysisText(guardianLong) && looksLikeGuardianSummaryText(teacherLong);
    return {
      guardianBrief: isBriefSwapped ? teacherBrief : (guardianBrief || teacherBrief),
      guardianLong: isLongSwapped ? teacherLong : (guardianLong || "세부 판단은 수업 맥락과 컨디션을 함께 본 뒤 담당 선생님이 조정합니다."),
      teacherBrief: isBriefSwapped ? guardianBrief : (teacherBrief || guardianBrief),
      teacherLong: isLongSwapped ? guardianLong : teacherLong
    };
  }

  function renderGuardianReportHtml(report, config) {
    const items = getGuardianDocumentItems(report);
    const isStandaloneRehab = config && config.variant === "standalone" && report.reportScope === "rehab";
    if (isStandaloneRehab) {
      return '' +
        '<div id="playlabReportGuardianPanel" class="playlab-report-mode-content playlab-report-mode-content-guardian" role="tabpanel" aria-labelledby="playlabReportGuardianTab">' +
          '<section class="playlab-report-guardian-visual">' +
            '<div class="playlab-report-section-head">' +
              '<div><p class="playlab-report-section-eyebrow">PARENT SUMMARY</p><h4 class="playlab-report-section-title">오늘의 활동 관찰</h4></div>' +
              '<span class="playlab-report-section-chip">수치보다 활동 맥락 중심</span>' +
            '</div>' +
            '<p class="playlab-report-section-intro">오늘 무엇을 했고 어떤 조건에서 반응이 이어졌는지 짧게 정리했습니다.</p>' +
            '<div class="playlab-report-guardian-visual-grid">' + items.map(function (item, index) {
              return '' +
                '<article class="playlab-report-guardian-visual-card">' +
                  '<span class="playlab-report-card-index">0' + String(index + 1) + '</span>' +
                  '<h5>' + escapeHtml(item.label) + '</h5>' +
                  '<p>' + formatRichText(item.value) + '</p>' +
                '</article>';
            }).join('') + '</div>' +
          '</section>' +
          renderStandaloneProfile(report, { audience: "guardian" }) +
        '</div>';
    }
    return '' +
      '<div id="playlabReportGuardianPanel" class="playlab-report-mode-content playlab-report-mode-content-guardian" role="tabpanel" aria-labelledby="playlabReportGuardianTab">' +
        '<div class="playlab-report-guardian-card">' +
          '<p class="playlab-report-score-kicker">보호자 공유 문서</p>' +
          '<h4 class="playlab-report-guardian-title">활동 관찰 기록</h4>' +
          '<p class="playlab-report-score-copy">점수보다 활동 중 관찰된 반응과 도움이 된 조건을 중심으로 정리했습니다.</p>' +
        '</div>' +
        '<section class="playlab-report-guardian-counseling">' +
          '<div class="playlab-report-section-head">' +
            '<h4 class="playlab-report-section-title">학부모 상담 가이드</h4>' +
            '<span class="playlab-report-section-chip">전문가 설명을 보호자에게는 이렇게</span>' +
          '</div>' +
          '<dl class="playlab-report-clinical-list playlab-report-guardian-document">' +
            items.map(function (item) {
              return '<div class="playlab-report-counseling-card">' +
                '<dt class="playlab-report-counseling-label">' + escapeHtml(item.label) + '</dt>' +
                '<dd class="playlab-report-counseling-block is-plain"><p>' + formatRichText(item.value) + '</p></dd>' +
              '</div>';
            }).join('') +
          '</dl>' +
        '</section>' +
        '<p class="playlab-report-disclaimer">' + escapeHtml(getReportModeDisclaimers("guardian")[0] || "") + '</p>' +
      '</div>';
  }

  function renderTeacherReportHtml(report, config) {
    const audienceText = resolveReportAudienceText(report);
    const history = report.comparableHistory || getComparableHistoryMeta({});
    const limitations = [
      "종합값과 영역 축은 HAHA LAB이 회기 수행을 정리하기 위해 자체 구성한 관찰 지표이며 표준화 점수나 규준 기반 척도가 아닙니다.",
      history.wording,
      "자동 생성된 해석과 계획은 후보안입니다. 직접 관찰, 병력, 과제 조건, 컨디션을 확인한 담당 전문가의 판단이 우선합니다."
    ];
    const isStandaloneRehab = config && config.variant === "standalone" && report.reportScope === "rehab";
    if (isStandaloneRehab) {
      return '' +
        '<div id="playlabReportTeacherPanel" class="playlab-report-mode-content playlab-report-mode-content-teacher" role="tabpanel" aria-labelledby="playlabReportTeacherTab">' +
          '<section class="playlab-report-session-card">' +
            '<div class="playlab-report-section-head">' +
              '<div><p class="playlab-report-section-eyebrow">SESSION RECORD</p><h4 class="playlab-report-section-title">이번 회기 수행 원기록</h4></div>' +
            '</div>' +
            '<p class="playlab-report-section-intro">정확도, 완수, 반응시간, 오류와 실제 선택한 과제 조건을 분리해 기록합니다.</p>' +
            renderStandaloneSessionMetrics(report) +
          '</section>' +
          renderStandaloneProfile(report) +
          renderStandaloneObservationSummary(report, audienceText) +
          '<section class="playlab-report-detail-evidence">' +
            '<div class="playlab-report-section-head">' +
              '<div><p class="playlab-report-section-eyebrow">CLINICAL REVIEW</p><h4 class="playlab-report-section-title">분야별 관찰 근거</h4></div>' +
              '<span class="playlab-report-section-chip">디지털 수행기록 기반</span>' +
            '</div>' +
            '<p class="playlab-report-section-intro">자동 관찰 초안입니다. 기록과 직접 관련된 내용만 확인하고 담당 전문가가 수정·승인합니다.</p>' +
            '<div class="playlab-report-role-grid is-static">' + renderRoleNotes((report.roleNotes || []).filter(function (item) { const title = String(item && (item.title || item.label || '') || ''); const text = String(item && (item.text || item.desc || '') || ''); return !(/언어/.test(title) && /소견\s*내용이\s*없/.test(text)); }), { collapsible: true }) + '</div>' +
          '</section>' +
          '<section class="playlab-report-training playlab-report-training-plan playlab-report-visual-plan">' +
            '<div class="playlab-report-section-head">' +
              '<div><p class="playlab-report-section-eyebrow">NEXT SESSION</p><h4 class="playlab-report-section-title">다음 회기 확인 후보</h4></div>' +
              '<span class="playlab-report-section-chip">전문가 승인 전 미확정</span>' +
            '</div>' +
            '<div class="playlab-report-training-list">' + renderRecommendations(report.recommendations || [], { indexed: true }) + '</div>' +
          '</section>' +
          '<section class="playlab-report-evidence-drawer">' +
            '<div class="playlab-report-evidence-heading"><p class="playlab-report-section-eyebrow">REFERENCE</p><h4 class="playlab-report-section-title">제한점 · 해석 근거 · 참고 자료</h4></div>' +
            '<div class="playlab-report-evidence-stack">' +
              '<section class="playlab-report-evidence playlab-report-limitations"><h4 class="playlab-report-section-title">제한점</h4><ul class="playlab-report-evidence-list">' + limitations.map(function (item) { return '<li>' + formatRichText(item) + '</li>'; }).join('') + '</ul></section>' +
              renderEvidenceBasis(report.evidenceBasis) +
              renderReferenceLinks(report.referenceLinks) +
            '</div>' +
          '</section>' +
        '</div>';
    }
    return '' +
      '<div id="playlabReportTeacherPanel" class="playlab-report-mode-content playlab-report-mode-content-teacher" role="tabpanel" aria-labelledby="playlabReportTeacherTab">' +
        '<div class="playlab-report-dashboard">' +
          '<div class="playlab-report-score-card playlab-report-score-card-ring">' +
            '<div class="playlab-report-score-kicker">관찰 지표 및 조건</div>' +
            '<h4 class="playlab-report-clinical-heading">이번 회기 기록</h4>' +
            '<p class="playlab-report-score-copy">정확도, 완수율, 반응시간과 과제 조건을 함께 기록합니다. 수치는 수행 사실이며 진단 점수가 아닙니다.</p>' +
            renderReportMetricGrid(report) +
          "</div>" +
          '<div class="playlab-report-radar-card playlab-report-radar-card-large">' +
            '<div class="playlab-report-section-head">' +
              '<h4 class="playlab-report-section-title">영역 프로파일 시각화</h4>' +
              '<span class="playlab-report-section-chip">자체 관찰 지표</span>' +
            "</div>" +
            '<div class="playlab-report-radar-layout">' +
              renderReportRadarFigure(report) +
              '<div class="playlab-report-axis-list">' + renderAxisList(report.axes) + "</div>" +
            "</div>" +
            '<p class="playlab-report-indicator-note">표시된 종합값과 축은 표준화 검사가 아닌 HAHA LAB 자체 관찰 지표입니다.</p>' +
          "</div>" +
        "</div>" +
        '<section class="playlab-report-summary-card">' +
          '<h4 class="playlab-report-section-title">통합 소견 <span class="playlab-report-legacy-label">자동 해석 후보</span></h4>' +
          '<p class="playlab-report-summary-brief">' + formatRichText(audienceText.teacherBrief) + "</p>" +
          renderReportSummaryBadges(report) +
          '<p class="playlab-report-summary-long">' + formatRichText(audienceText.teacherLong) + "</p>" +
        "</section>" +
        '<section class="playlab-report-roles">' +
          '<div class="playlab-report-section-head">' +
            '<h4 class="playlab-report-section-title">분야별 관찰 관점</h4>' +
            '<span class="playlab-report-section-chip">자동 해석 후보 · 전문가 확인 필요</span>' +
          '</div>' +
          '<div class="playlab-report-role-grid">' + renderRoleNotes(report.roleNotes || []) + '</div>' +
        '</section>' +
        '<section class="playlab-report-training playlab-report-training-plan">' +
          '<div class="playlab-report-section-head">' +
            '<h4 class="playlab-report-section-title">계획 후보 <span class="playlab-report-legacy-label">전문가별 소견 · 권장 훈련 방향</span></h4>' +
          '</div>' +
          '<div class="playlab-report-training-list">' + renderRecommendations(report.recommendations || []) + '</div>' +
        '</section>' +
        '<section class="playlab-report-evidence playlab-report-limitations">' +
          '<h4 class="playlab-report-section-title">제한점</h4>' +
          '<ul class="playlab-report-evidence-list">' + limitations.map(function (item) {
            return '<li>' + formatRichText(item) + '</li>';
          }).join('') + '</ul>' +
        '</section>' +
        renderEvidenceBasis(report.evidenceBasis) +
        renderReferenceLinks(report.referenceLinks) +
        '<p class="playlab-report-disclaimer">' + escapeHtml(report.disclaimer) + "</p>" +
      "</div>";
  }

  function renderHtml(report, options) {
    // Historical automatic axes/bands are retained as stored data, but are not
    // presented as professional conclusions. Render observations from source.
    if (report && !report.isObservedOnly && !report.isSimpleResult) {
      report = buildObservedOnlyReport(normalizeReportRawInput(report.originalReportInput || report));
    }
    if (report && report.isObservedOnly) {
      const config = options || {};
      if (config.variant === 'standalone') setReportDocumentFlowActive(true);
      const mode = config.sharedAudience === 'guardian' ? 'guardian' : readRuntimeReportMode(config);
      const observedMetrics = '<div class="playlab-report-highlights">' + report.highlights.map(function (item) { return '<p class="playlab-report-highlight-item"><span>' + escapeHtml(item.label) + ': </span><strong>' + escapeHtml(item.value) + '</strong></p>'; }).join('') + '</div>';
      return '<section class="playlab-report-shell" data-report-mode="' + escapeHtml(mode) + '" data-report-scope="' + escapeHtml(report.reportScope) + '"' + (config.sharedAudience === 'guardian' ? ' data-shared-audience="guardian"' : '') + '>' +
        (config.sharedAudience === 'guardian' ? '' : renderReportModeSwitcher(mode)) +
        '<h3>' + escapeHtml(report.title) + '</h3><h4>확인된 수행 기록</h4>' +
        '<div class="playlab-report-mode-content playlab-report-mode-content-guardian"><p>' + escapeHtml(report.observationOpinion ? '이번 활동에서 기록된 사실과 다음 확인 사항을 안내합니다.' : report.guardianSummary) + '</p>' + (report.observationOpinion ? renderOpinionSections(report.observationOpinion, 'guardian') : '<p>' + escapeHtml(report.guardianLongSummary) + '</p>') + '</div>' +
        (config.sharedAudience === 'guardian' ? '' : '<div class="playlab-report-mode-content playlab-report-mode-content-teacher">' + observedMetrics + (report.observationOpinion ? '' : '<p>' + escapeHtml(report.teacherReviewNote) + '</p>') + renderOpinionSections(report.observationOpinion, 'teacher') + '<p>미기록 항목: ' + escapeHtml(report.reportDataQuality.missingMetrics.map(function (key) { return ({ totalItems: '전체 문항', correctCount: '정답 수', wrongCount: '오답 수', completionCount: '완료 수', perfectCount: '첫 시도 정답 수', accuracyRate: '정확도', firstTryRate: '첫 시도 정답률', completionRate: '완료율', avgQuestionMs: '평균 반응시간', elapsedMs: '활동 소요시간', startedAtMs: '시작 시각' })[key] || '추가 측정값'; }).join(', ') || '없음') + '</p></div>') + '</section>';
    }
    if (report && report.isSimpleResult) return "";
    const config = Object.assign({
      variant: "default"
    }, options || {});
    const sharedAudience = config.sharedAudience === "guardian" ? "guardian" : "";
    const reportMode = sharedAudience || readRuntimeReportMode(config);
    const bandClass = report.band && report.band.tone ? " is-" + report.band.tone : "";
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      setReportDocumentFlowActive(true);
      window.setTimeout(function () {
        setReportDocumentFlowActive(true);
        scheduleParentReportLayout(true);
        promoteAllReportModePanels(document);
      }, 0);
    }
    return '' +
      '<section class="playlab-report-shell playlab-report-shell-' + escapeHtml(config.variant) + bandClass + '" data-report-mode="' + escapeHtml(reportMode) + '" data-report-scope="' + escapeHtml(report.reportScope || "playlab") + '"' + (sharedAudience ? ' data-shared-audience="guardian"' : '') + ' style="--playlab-report-accent:' + escapeHtml(report.accentColor || DEFAULT_ACCENT) + ';">' +
        (sharedAudience ? '' : renderReportModeSwitcher(reportMode)) +
        renderReportHero(report) +
        renderGuardianReportHtml(report, config) +
        '<div class="playlab-report-mode-content playlab-report-mode-content-guardian">' + renderOpinionSections(buildEvidenceOpinion(report.originalReportInput || report), 'guardian') + '</div>' +
        (sharedAudience ? '' : renderTeacherReportHtml(report, config) + '<div class="playlab-report-mode-content playlab-report-mode-content-teacher">' + renderOpinionSections(buildEvidenceOpinion(report.originalReportInput || report), 'teacher') + '</div>') +
        ((config.variant === "standalone" && report.reportScope === "rehab") ? renderStandaloneReportFooter() : '') +
      "</section>";
  }

  function getDocumentLayoutHeight() {
    const body = document.body;
    const html = document.documentElement;
    const candidates = [
      body && body.scrollHeight,
      body && body.offsetHeight,
      html && html.scrollHeight,
      html && html.offsetHeight,
      body && body.getBoundingClientRect && body.getBoundingClientRect().height,
      html && html.getBoundingClientRect && html.getBoundingClientRect().height
    ].map(function (value) {
      return Number(value) || 0;
    });
    [
      ".playlab-report-shell",
      ".playlab-report-dynamic:not(:empty)",
      ".playlab-snack-report-card.is-standard-report",
      ".playlab-iceword-report-card.is-standard-report",
      ".playlab-snack-modal.is-open",
      ".playlab-iceword-modal.is-open",
      "#resultScreen.is-active",
      ".hevi-result-card:not(:empty)"
    ].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        try {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (style.display === "none" || style.visibility === "hidden") return;
          if (!Number(rect.width) || !Number(rect.height)) return;
          candidates.push(window.scrollY + rect.bottom);
        } catch (_error) {
          // noop
        }
      });
    });
    return Math.ceil(Math.max(0, ...candidates));
  }

  function notifyParentReportLayout(active) {
    if (window.parent === window) return;
    try {
      window.parent.postMessage({
        type: "HAHA_LAB_REPORT_LAYOUT",
        active: Boolean(active),
        height: getDocumentLayoutHeight()
      }, "*");
    } catch (_error) {
      // noop
    }
  }

  function scheduleParentReportLayout(active) {
    const send = function () {
      notifyParentReportLayout(active);
    };
    send();
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(send);
    }
    window.setTimeout(send, 160);
    window.setTimeout(send, 520);
    window.setTimeout(send, 900);
    window.setTimeout(send, 1400);
  }

  function setReportDocumentFlowActive(active) {
    document.body.classList.toggle("playlab-report-document-flow", Boolean(active));
  }

  function scrollReportShellToTop(shell) {
    if (!shell || !shell.getBoundingClientRect) return;
    const rect = shell.getBoundingClientRect();
    const currentTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const topbar = document.querySelector(".shell-topbar");
    const topbarRect = topbar && topbar.getBoundingClientRect ? topbar.getBoundingClientRect() : null;
    const safeOffset = topbarRect && topbarRect.bottom > 0 ? Math.ceil(topbarRect.bottom + 14) : 14;
    const targetTop = Math.max(0, currentTop + rect.top - safeOffset);
    try {
      window.scrollTo({ top: targetTop, left: 0, behavior: "auto" });
    } catch (error) {
      window.scrollTo(0, targetTop);
    }
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  }

  function scheduleReportModeScroll(shell) {
    const run = function () {
      scrollReportShellToTop(shell);
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(run);
    } else {
      window.setTimeout(run, 0);
    }
    window.setTimeout(run, 120);
  }

  function setReportModeFromButton(button, mode) {
    const normalized = normalizeReportMode(mode);
    const shell = getReportShellForModeButton(button);
    if (!shell) return;
    shell.setAttribute("data-report-mode", normalized);
    writeRuntimeReportMode(normalized);
    const modeCopy = shell.querySelector(".playlab-report-mode-panel .playlab-report-mode-copy");
    if (modeCopy) {
      const copy = getReportModeCopy(normalized);
      modeCopy.innerHTML = '' +
        '<p class="playlab-report-mode-kicker">' + escapeHtml(copy.kicker) + '</p>' +
        '<strong>' + escapeHtml(copy.title) + '</strong>' +
        '<span>' + escapeHtml(copy.description) + '</span>';
    }
    const buttonScope = button && button.closest ? (button.closest(".playlab-report-mode-panel") || shell) : shell;
    buttonScope.querySelectorAll(".playlab-report-mode-btn").forEach(function (item) {
      const active = item.getAttribute("data-report-mode-target") === normalized;
      item.setAttribute("aria-pressed", active ? "true" : "false");
      item.setAttribute("aria-selected", active ? "true" : "false");
    });
    scheduleParentReportLayout(true);
    scheduleReportModeScroll(shell);
  }

  function mount(card, report, options) {
    if (!card || !report) return null;
    let container = card.querySelector(".playlab-report-dynamic");
    if (!container) {
      container = document.createElement("div");
      container.className = "playlab-report-dynamic";
      card.appendChild(container);
    }
    container.innerHTML = renderHtml(report, options);
    scheduleReportModePanelPromotion(card);
    const shouldUseDocumentFlow = !(report && report.isSimpleResult);
    setReportDocumentFlowActive(shouldUseDocumentFlow);
    scheduleParentReportLayout(shouldUseDocumentFlow);
    return container;
  }

  function getPdfTitle(options) {
    const config = options || {};
    if (typeof config.title === "function") {
      return String(config.title() || "").trim();
    }
    return String(config.title || document.title || "PlayLab 리포트").trim();
  }

  function sanitizeReportFileName(value) {
    const clean = String(value || "PlayLab 리포트")
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return clean || "PlayLab 리포트";
  }

  function getActiveReportShell() {
    const activeShell = Array.from(document.querySelectorAll(".playlab-report-shell")).find(function (shell) {
      const rect = shell.getBoundingClientRect();
      const style = window.getComputedStyle(shell);
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });
    return activeShell || document.querySelector(".playlab-report-shell");
  }

  function loadHtml2CanvasRenderer() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (window.__playlabHtml2CanvasPromise) return window.__playlabHtml2CanvasPromise;
    window.__playlabHtml2CanvasPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      const engineScript = Array.from(document.scripts || []).find(function (item) {
        return item.src && item.src.indexOf("playlab-report-engine.js") !== -1;
      });
      script.src = new URL("vendor/html2canvas.min.js", (engineScript && engineScript.src) || window.location.href).href;
      script.async = true;
      script.onload = function () {
        if (window.html2canvas) {
          resolve(window.html2canvas);
        } else {
          reject(new Error("리포트 이미지 렌더러를 불러오지 못했습니다."));
        }
      };
      script.onerror = function () {
        reject(new Error("리포트 이미지 렌더러 파일을 찾지 못했습니다."));
      };
      document.head.appendChild(script);
    });
    return window.__playlabHtml2CanvasPromise;
  }

  async function triggerJpgSave(options) {
    const shell = getActiveReportShell();
    if (!shell) return;
    const config = options || {};
    const title = getPdfTitle(config);
    const renderer = await loadHtml2CanvasRenderer();
    const rect = shell.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(shell.scrollHeight || rect.height);
    const scale = Math.max(1, Math.min(2, 12000 / height, 6000 / width));
    const canvas = await renderer(shell, {
      backgroundColor: "#ffffff",
      scale: scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: width,
      height: height,
      windowWidth: Math.max(document.documentElement.scrollWidth || 0, width),
      windowHeight: Math.max(document.documentElement.scrollHeight || 0, height),
      onclone: function (clonedDocument) {
        const clonedShell = clonedDocument.querySelector(".playlab-report-shell");
        if (clonedShell) {
          clonedShell.style.width = width + "px";
          clonedShell.style.maxWidth = width + "px";
          clonedShell.style.margin = "0";
          if (clonedShell.getAttribute("data-report-scope") === "rehab") {
            clonedDocument.documentElement.style.background = "#ffffff";
            clonedDocument.body.style.background = "#ffffff";
            clonedDocument.body.style.backgroundImage = "none";
            clonedShell.style.background = "#ffffff";
            clonedShell.style.backgroundImage = "none";
            var parent = clonedShell.parentElement;
            while (parent && parent !== clonedDocument.body) {
              parent.style.background = "#ffffff";
              parent.style.backgroundImage = "none";
              parent = parent.parentElement;
            }
          }
        }
        clonedDocument.querySelectorAll(".playlab-report-mode-panel").forEach(function (panel) {
          panel.style.position = "relative";
          panel.style.left = "auto";
          panel.style.right = "auto";
          panel.style.top = "auto";
          panel.style.bottom = "auto";
          panel.style.transform = "none";
        });
      }
    });
    const blob = await new Promise(function (resolve) {
      canvas.toBlob(resolve, "image/jpeg", 0.94);
    });
    if (!blob) return;
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = sanitizeReportFileName(title) + ".jpg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(objectUrl);
    }, 800);
  }

  function loadPdfExporter() {
    if (window.PlaylabReportPdf) return Promise.resolve(window.PlaylabReportPdf);
    if (window.__playlabPdfExporterPromise) return window.__playlabPdfExporterPromise;
    window.__playlabPdfExporterPromise = new Promise(function (resolve, reject) {
      const engineScript = Array.from(document.scripts || []).find(function (item) { return item.src && item.src.indexOf('playlab-report-engine.js') !== -1; });
      const script = document.createElement('script');
      const timer = window.setTimeout(function () { script.remove(); reject(new Error('PDF 저장 준비 시간이 초과되었습니다.')); }, 20000);
      script.src = new URL('playlab-report-pdf.js?v=20261104-1', engineScript && engineScript.src || new URL('playlab/', document.baseURI)).href;
      script.onload = function () { window.clearTimeout(timer); if (window.PlaylabReportPdf) resolve(window.PlaylabReportPdf); else reject(new Error('PDF 저장 도구를 준비하지 못했습니다.')); };
      script.onerror = function () { window.clearTimeout(timer); script.remove(); reject(new Error('PDF 저장 파일을 불러오지 못했습니다.')); };
      document.head.appendChild(script);
    }).catch(function (error) { window.__playlabPdfExporterPromise = null; throw error; });
    return window.__playlabPdfExporterPromise;
  }

  async function triggerPdfSave(options) {
    const config = options || {};
    const shell = config.root || getActiveReportShell();
    if (!shell) throw new Error('저장할 리포트를 찾지 못했습니다.');
    const exporter = await loadPdfExporter();
    return exporter.download(shell, Object.assign({}, config, { title: getPdfTitle(config) }));
  }

  function ensurePdfSaveButton(options) {
    const config = Object.assign({
      id: "playlabReportPdfButton",
      topbarSelector: ".shell-topbar-side",
      beforeSelector: ".shell-help-btn"
    }, options || {});
    let button = document.getElementById(config.id);
    if (!button) {
      const topbar = document.querySelector(config.topbarSelector);
      if (!topbar) return null;
      button = document.createElement("button");
      button.type = "button";
      button.id = config.id;
      button.className = "shell-icon-btn playlab-report-save-btn shell-hidden";
      button.setAttribute("aria-label", "리포트 저장");
      button.setAttribute("title", "리포트 저장");
      button.innerHTML = '' +
        '<svg class="playlab-report-save-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M6 3.75h9.5l4.75 4.75v11A1.5 1.5 0 0 1 18.75 21h-13.5A1.5 1.5 0 0 1 3.75 19.5v-14A1.5 1.5 0 0 1 5.25 4h.75z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
          '<path d="M8 3.75v5h7v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
          '<path d="M8 16.25h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '</svg>' +
        '<span class="playlab-report-save-label">리포트 저장</span>';
      button.addEventListener("click", function () {
        if (button.disabled) return;
        button.disabled = true;
        button.classList.add("is-saving");
        Promise.resolve(triggerPdfSave(button.__playlabPdfOptions || {})).catch(function (error) {
          console.error("[playlab-report] PDF save failed", error);
          window.alert(error && error.message || 'PDF 저장에 실패했습니다. 다시 시도해 주세요.');
        }).finally(function () {
          button.disabled = false;
          button.classList.remove("is-saving");
        });
      });
      const before = config.beforeSelector ? topbar.querySelector(config.beforeSelector) : null;
      topbar.insertBefore(button, before || null);
    }
    button.__playlabPdfOptions = config;
    return button;
  }

  function setPdfButtonVisible(visible, options) {
    const button = ensurePdfSaveButton(options);
    if (!button) return null;
    if (shouldUseSimplePlaylabReport()) {
      visible = false;
    }
    button.classList.toggle("shell-hidden", !visible);
    button.classList.toggle("is-hidden", !visible);
    setReportDocumentFlowActive(Boolean(visible));
    scheduleParentReportLayout(Boolean(visible));
    return button;
  }

  if (typeof window.MutationObserver === "function") {
    const reportModePanelObserver = new window.MutationObserver(function (mutations) {
      if (!mutations.some(function (mutation) {
        return Array.from(mutation.addedNodes || []).some(function (node) {
          return node && node.nodeType === 1 && (
            (node.matches && node.matches(".playlab-report-shell")) ||
            (node.querySelector && node.querySelector(".playlab-report-shell"))
          );
        });
      })) return;
      scheduleReportModePanelPromotion(document);
    });
    if (document.body) {
      reportModePanelObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        reportModePanelObserver.observe(document.body, { childList: true, subtree: true });
      }, { once: true });
    }
  }

  window.PlaylabReportEngine = {
    buildReport: buildReport,
    buildEvidenceOpinion: buildEvidenceOpinion,
    buildLongitudinalOpinion: buildLongitudinalOpinion,
    renderOpinionSections: renderOpinionSections,
    renderHtml: renderHtml,
      mount: mount,
      ensurePdfSaveButton: ensurePdfSaveButton,
      setPdfButtonVisible: setPdfButtonVisible,
      setReportModeFromButton: setReportModeFromButton,
      promoteReportModePanel: promoteReportModePanel,
      promoteAllReportModePanels: promoteAllReportModePanels,
      triggerJpgSave: triggerJpgSave,
      triggerPdfSave: triggerPdfSave,
      notifyParentReportLayout: notifyParentReportLayout,
      setReportDocumentFlowActive: setReportDocumentFlowActive,
      normalizeReportMode: normalizeReportMode,
      buildObservationBenchmark: buildObservationBenchmark,
      normalizeReportRawInput: normalizeReportRawInput,
      formatDuration: formatDuration,
      formatSeconds: formatSeconds,
      formatRichText: formatRichText,
      reportProfiles: REPORT_PROFILES,
      reportProfileKeys: REPORT_PROFILE_KEYS
  };
  window.RehabLabReportEngine = window.PlaylabReportEngine;
})();
