(function () {
  "use strict";

  window.HAHA_LAB_ASSOCIATION_COURSE_GUIDE = {
  "title": "꼬리 물기 연상 코스 안내",
  "summary": "유아 3단계와 초등 1~20단계, 총 23개 스테이지로 구성된 꼬리 물기 연상 코스입니다. 각 스테이지는 60문항 풀에서 매번 다른 문제를 무작위로 뽑아 보여줍니다.",
  "learningFlow": [
    "유아: 친숙한 낱말에서 출발해 같은 범주의 말을 묶는 입문 단계",
    "초등 도입: 집, 놀이터, 감정처럼 일상적인 주제를 묶는 단계",
    "초등 기초: 학교, 마트, 생활 주변 낱말을 넓히는 단계",
    "초등 응용: 생활, 사회, 과학 개념을 빠르게 연결하는 단계",
    "초등 심화: 추상 개념과 긴 문장을 이어 보는 단계"
  ],
  "questionRules": [
    "각 문항은 제시어 1개와 정답 3개, 오답 3개로 구성합니다.",
    "선택지는 매번 무작위로 섞여서 나타납니다.",
    "스테이지마다 60문항 풀을 만들고, 진입할 때마다 8문항을 무작위로 보여줍니다."
  ],
  "timingRules": [
    "유아는 30초",
    "초등 1~4단계는 29초",
    "초등 5~8단계는 28초",
    "초등 9~12단계는 27초",
    "초등 13~16단계는 26초",
    "초등 17~20단계는 25초"
  ]
};
  window.HAHA_LAB_ASSOCIATION_STAGE_TEMPLATES = [
  {
    "id": "tail-01",
    "title": "유아 01",
    "schoolLevelLabel": "01",
    "bandLabel": "유아",
    "descriptor": "나와내물건",
    "grammarFocus": "나와내물건",
    "goalCopy": "나와내물건 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 30,
    "questions": [
      {
        "id": "tail-01-q-01",
        "coreWord": "내얼굴",
        "word": "내얼굴",
        "answer": "눈, 코, 입",
        "targetWords": [
          "눈",
          "코",
          "입"
        ],
        "distractorPool": [
          "신발",
          "양말",
          "장갑"
        ]
      },
      {
        "id": "tail-01-q-02",
        "coreWord": "내몸",
        "word": "내몸",
        "answer": "머리, 어깨, 무릎",
        "targetWords": [
          "머리",
          "어깨",
          "무릎"
        ],
        "distractorPool": [
          "의자",
          "책상",
          "침대"
        ]
      },
      {
        "id": "tail-01-q-03",
        "coreWord": "손",
        "word": "손",
        "answer": "손가락, 손바닥, 손톱",
        "targetWords": [
          "손가락",
          "손바닥",
          "손톱"
        ],
        "distractorPool": [
          "발가락",
          "발바닥",
          "발목"
        ]
      },
      {
        "id": "tail-01-q-04",
        "coreWord": "발",
        "word": "발",
        "answer": "발가락, 발바닥, 발뒤꿈치",
        "targetWords": [
          "발가락",
          "발바닥",
          "발뒤꿈치"
        ],
        "distractorPool": [
          "손가락",
          "손바닥",
          "손톱"
        ]
      },
      {
        "id": "tail-01-q-05",
        "coreWord": "우리가족",
        "word": "우리가족",
        "answer": "엄마, 아빠, 동생",
        "targetWords": [
          "엄마",
          "아빠",
          "동생"
        ],
        "distractorPool": [
          "선생님",
          "친구",
          "이웃"
        ]
      },
      {
        "id": "tail-01-q-06",
        "coreWord": "할아버지댁",
        "word": "할아버지댁",
        "answer": "할아버지, 할머니, 삼촌",
        "targetWords": [
          "할아버지",
          "할머니",
          "삼촌"
        ],
        "distractorPool": [
          "의사",
          "경찰",
          "소방관"
        ]
      },
      {
        "id": "tail-01-q-07",
        "coreWord": "숫자",
        "word": "숫자",
        "answer": "하나, 둘, 셋",
        "targetWords": [
          "하나",
          "둘",
          "셋"
        ],
        "distractorPool": [
          "빨강",
          "노랑",
          "파랑"
        ]
      },
      {
        "id": "tail-01-q-08",
        "coreWord": "색깔",
        "word": "색깔",
        "answer": "빨강, 노랑, 파랑",
        "targetWords": [
          "빨강",
          "노랑",
          "파랑"
        ],
        "distractorPool": [
          "하나",
          "둘",
          "셋"
        ]
      },
      {
        "id": "tail-01-q-09",
        "coreWord": "예쁜색",
        "word": "예쁜색",
        "answer": "분홍, 보라, 초록",
        "targetWords": [
          "분홍",
          "보라",
          "초록"
        ],
        "distractorPool": [
          "검정",
          "회색",
          "갈색"
        ]
      },
      {
        "id": "tail-01-q-10",
        "coreWord": "어두운색",
        "word": "어두운색",
        "answer": "검정, 회색, 갈색",
        "targetWords": [
          "검정",
          "회색",
          "갈색"
        ],
        "distractorPool": [
          "분홍",
          "보라",
          "초록"
        ]
      },
      {
        "id": "tail-01-q-11",
        "coreWord": "모양",
        "word": "모양",
        "answer": "동그라미, 세모, 네모",
        "targetWords": [
          "동그라미",
          "세모",
          "네모"
        ],
        "distractorPool": [
          "강아지",
          "고양이",
          "돼지"
        ]
      },
      {
        "id": "tail-01-q-12",
        "coreWord": "입는옷",
        "word": "입는옷",
        "answer": "바지, 티셔츠, 치마",
        "targetWords": [
          "바지",
          "티셔츠",
          "치마"
        ],
        "distractorPool": [
          "사탕",
          "과자",
          "초콜릿"
        ]
      },
      {
        "id": "tail-01-q-13",
        "coreWord": "겉옷",
        "word": "겉옷",
        "answer": "잠바, 코트, 조끼",
        "targetWords": [
          "잠바",
          "코트",
          "조끼"
        ],
        "distractorPool": [
          "수영복",
          "잠옷",
          "속옷"
        ]
      },
      {
        "id": "tail-01-q-14",
        "coreWord": "머리에",
        "word": "머리에",
        "answer": "모자, 머리띠, 머리핀",
        "targetWords": [
          "모자",
          "머리띠",
          "머리핀"
        ],
        "distractorPool": [
          "신발",
          "양말",
          "장화"
        ]
      },
      {
        "id": "tail-01-q-15",
        "coreWord": "발에",
        "word": "발에",
        "answer": "양말, 신발, 장화",
        "targetWords": [
          "양말",
          "신발",
          "장화"
        ],
        "distractorPool": [
          "장갑",
          "반지",
          "팔찌"
        ]
      },
      {
        "id": "tail-01-q-16",
        "coreWord": "목에",
        "word": "목에",
        "answer": "목도리, 넥타이, 목걸이",
        "targetWords": [
          "목도리",
          "넥타이",
          "목걸이"
        ],
        "distractorPool": [
          "시계",
          "팔찌",
          "반지"
        ]
      },
      {
        "id": "tail-01-q-17",
        "coreWord": "내장난감",
        "word": "내장난감",
        "answer": "로봇, 인형, 블록",
        "targetWords": [
          "로봇",
          "인형",
          "블록"
        ],
        "distractorPool": [
          "냄비",
          "도마",
          "국자"
        ]
      },
      {
        "id": "tail-01-q-18",
        "coreWord": "타는장난감",
        "word": "타는장난감",
        "answer": "씽씽카, 자전거, 붕붕카",
        "targetWords": [
          "씽씽카",
          "자전거",
          "붕붕카"
        ],
        "distractorPool": [
          "그림책",
          "색종이",
          "스케치북"
        ]
      },
      {
        "id": "tail-01-q-19",
        "coreWord": "잠잘때",
        "word": "잠잘때",
        "answer": "침대, 이불, 베개",
        "targetWords": [
          "침대",
          "이불",
          "베개"
        ],
        "distractorPool": [
          "의자",
          "책상",
          "책장"
        ]
      },
      {
        "id": "tail-01-q-20",
        "coreWord": "씻을때",
        "word": "씻을때",
        "answer": "비누, 치약, 칫솔",
        "targetWords": [
          "비누",
          "치약",
          "칫솔"
        ],
        "distractorPool": [
          "장난감",
          "과자",
          "사탕"
        ]
      },
      {
        "id": "tail-01-q-21",
        "coreWord": "목욕",
        "word": "목욕",
        "answer": "물, 수건, 욕조",
        "targetWords": [
          "물",
          "수건",
          "욕조"
        ],
        "distractorPool": [
          "모래",
          "흙",
          "돌"
        ]
      },
      {
        "id": "tail-01-q-22",
        "coreWord": "밥먹을때",
        "word": "밥먹을때",
        "answer": "숟가락, 포크, 젓가락",
        "targetWords": [
          "숟가락",
          "포크",
          "젓가락"
        ],
        "distractorPool": [
          "크레파스",
          "연필",
          "지우개"
        ]
      },
      {
        "id": "tail-01-q-23",
        "coreWord": "그릇",
        "word": "그릇",
        "answer": "밥그릇, 국그릇, 접시",
        "targetWords": [
          "밥그릇",
          "국그릇",
          "접시"
        ],
        "distractorPool": [
          "신발",
          "양말",
          "모자"
        ]
      },
      {
        "id": "tail-01-q-24",
        "coreWord": "거실에",
        "word": "거실에",
        "answer": "소파, 텔레비전, 에어컨",
        "targetWords": [
          "소파",
          "텔레비전",
          "에어컨"
        ],
        "distractorPool": [
          "변기",
          "세면대",
          "욕조"
        ]
      },
      {
        "id": "tail-01-q-25",
        "coreWord": "부엌에",
        "word": "부엌에",
        "answer": "냉장고, 식탁, 가스레인지",
        "targetWords": [
          "냉장고",
          "식탁",
          "가스레인지"
        ],
        "distractorPool": [
          "침대",
          "옷장",
          "장난감상자"
        ]
      },
      {
        "id": "tail-01-q-26",
        "coreWord": "화장실에",
        "word": "화장실에",
        "answer": "변기, 세면대, 휴지",
        "targetWords": [
          "변기",
          "세면대",
          "휴지"
        ],
        "distractorPool": [
          "냉장고",
          "식탁",
          "가스레인지"
        ]
      },
      {
        "id": "tail-01-q-27",
        "coreWord": "공부방",
        "word": "공부방",
        "answer": "책상, 의자, 책장",
        "targetWords": [
          "책상",
          "의자",
          "책장"
        ],
        "distractorPool": [
          "소파",
          "텔레비전",
          "싱크대"
        ]
      },
      {
        "id": "tail-01-q-28",
        "coreWord": "마시는것",
        "word": "마시는것",
        "answer": "물, 우유, 주스",
        "targetWords": [
          "물",
          "우유",
          "주스"
        ],
        "distractorPool": [
          "밥",
          "빵",
          "과자"
        ]
      },
      {
        "id": "tail-01-q-29",
        "coreWord": "단것",
        "word": "단것",
        "answer": "사탕, 젤리, 초콜릿",
        "targetWords": [
          "사탕",
          "젤리",
          "초콜릿"
        ],
        "distractorPool": [
          "소금",
          "간장",
          "고추장"
        ]
      },
      {
        "id": "tail-01-q-30",
        "coreWord": "아플때",
        "word": "아플때",
        "answer": "밴드, 약, 체온계",
        "targetWords": [
          "밴드",
          "약",
          "체온계"
        ],
        "distractorPool": [
          "장난감",
          "놀이터",
          "사탕"
        ]
      },
      {
        "id": "tail-01-q-31",
        "coreWord": "비올때",
        "word": "비올때",
        "answer": "우산, 우비, 장화",
        "targetWords": [
          "우산",
          "우비",
          "장화"
        ],
        "distractorPool": [
          "선글라스",
          "튜브",
          "수영복"
        ]
      },
      {
        "id": "tail-01-q-32",
        "coreWord": "눈올때",
        "word": "눈올때",
        "answer": "눈사람, 장갑, 썰매",
        "targetWords": [
          "눈사람",
          "장갑",
          "썰매"
        ],
        "distractorPool": [
          "선풍기",
          "튜브",
          "샌들"
        ]
      },
      {
        "id": "tail-01-q-33",
        "coreWord": "더울때",
        "word": "더울때",
        "answer": "선풍기, 에어컨, 부채",
        "targetWords": [
          "선풍기",
          "에어컨",
          "부채"
        ],
        "distractorPool": [
          "난로",
          "핫팩",
          "목도리"
        ]
      },
      {
        "id": "tail-01-q-34",
        "coreWord": "추울때",
        "word": "추울때",
        "answer": "난로, 핫팩, 전기장판",
        "targetWords": [
          "난로",
          "핫팩",
          "전기장판"
        ],
        "distractorPool": [
          "선풍기",
          "에어컨",
          "부채"
        ]
      },
      {
        "id": "tail-01-q-35",
        "coreWord": "인사",
        "word": "인사",
        "answer": "안녕, 반가워, 잘가",
        "targetWords": [
          "안녕",
          "반가워",
          "잘가"
        ],
        "distractorPool": [
          "미워",
          "싫어",
          "저리가"
        ]
      },
      {
        "id": "tail-01-q-36",
        "coreWord": "감사",
        "word": "감사",
        "answer": "고마워, 감사해요, 땡큐",
        "targetWords": [
          "고마워",
          "감사해요",
          "땡큐"
        ],
        "distractorPool": [
          "미안해",
          "잘못했어",
          "죄송해요"
        ]
      },
      {
        "id": "tail-01-q-37",
        "coreWord": "사과",
        "word": "사과",
        "answer": "미안해, 잘못했어, 죄송해요",
        "targetWords": [
          "미안해",
          "잘못했어",
          "죄송해요"
        ],
        "distractorPool": [
          "고마워",
          "감사해요",
          "땡큐"
        ]
      },
      {
        "id": "tail-01-q-38",
        "coreWord": "웃음",
        "word": "웃음",
        "answer": "방긋, 하하, 호호",
        "targetWords": [
          "방긋",
          "하하",
          "호호"
        ],
        "distractorPool": [
          "엉엉",
          "흑흑",
          "훌쩍"
        ]
      },
      {
        "id": "tail-01-q-39",
        "coreWord": "울음",
        "word": "울음",
        "answer": "엉엉, 흑흑, 훌쩍",
        "targetWords": [
          "엉엉",
          "흑흑",
          "훌쩍"
        ],
        "distractorPool": [
          "방긋",
          "하하",
          "호호"
        ]
      },
      {
        "id": "tail-01-q-40",
        "coreWord": "박수",
        "word": "박수",
        "answer": "짝짝짝, 쿵쿵쿵, 참잘했어요",
        "targetWords": [
          "짝짝짝",
          "쿵쿵쿵",
          "참잘했어요"
        ],
        "distractorPool": [
          "엉엉",
          "흑흑",
          "훌쩍"
        ]
      },
      {
        "id": "tail-01-q-41",
        "coreWord": "아기",
        "word": "아기",
        "answer": "우유병, 기저귀, 공갈젖꼭지",
        "targetWords": [
          "우유병",
          "기저귀",
          "공갈젖꼭지"
        ],
        "distractorPool": [
          "가방",
          "책",
          "연필"
        ]
      },
      {
        "id": "tail-01-q-42",
        "coreWord": "생일",
        "word": "생일",
        "answer": "케이크, 촛불, 선물",
        "targetWords": [
          "케이크",
          "촛불",
          "선물"
        ],
        "distractorPool": [
          "주사기",
          "약",
          "밴드"
        ]
      },
      {
        "id": "tail-01-q-43",
        "coreWord": "청소",
        "word": "청소",
        "answer": "빗자루, 쓰레받기, 걸레",
        "targetWords": [
          "빗자루",
          "쓰레받기",
          "걸레"
        ],
        "distractorPool": [
          "숟가락",
          "포크",
          "젓가락"
        ]
      },
      {
        "id": "tail-01-q-44",
        "coreWord": "텔레비전",
        "word": "텔레비전",
        "answer": "리모컨, 만화, 화면",
        "targetWords": [
          "리모컨",
          "만화",
          "화면"
        ],
        "distractorPool": [
          "칫솔",
          "치약",
          "비누"
        ]
      },
      {
        "id": "tail-01-q-45",
        "coreWord": "외출",
        "word": "외출",
        "answer": "가방, 신발, 마스크",
        "targetWords": [
          "가방",
          "신발",
          "마스크"
        ],
        "distractorPool": [
          "이불",
          "베개",
          "잠옷"
        ]
      },
      {
        "id": "tail-01-q-46",
        "coreWord": "뜨거운것",
        "word": "뜨거운것",
        "answer": "불, 국, 난로",
        "targetWords": [
          "불",
          "국",
          "난로"
        ],
        "distractorPool": [
          "얼음",
          "아이스크림",
          "눈"
        ]
      },
      {
        "id": "tail-01-q-47",
        "coreWord": "차가운것",
        "word": "차가운것",
        "answer": "얼음, 눈, 아이스크림",
        "targetWords": [
          "얼음",
          "눈",
          "아이스크림"
        ],
        "distractorPool": [
          "불",
          "난로",
          "온수"
        ]
      },
      {
        "id": "tail-01-q-48",
        "coreWord": "밝은것",
        "word": "밝은것",
        "answer": "햇빛, 전등, 손전등",
        "targetWords": [
          "햇빛",
          "전등",
          "손전등"
        ],
        "distractorPool": [
          "밤",
          "그림자",
          "동굴"
        ]
      },
      {
        "id": "tail-01-q-49",
        "coreWord": "어두운것",
        "word": "어두운것",
        "answer": "밤, 그림자, 지하실",
        "targetWords": [
          "밤",
          "그림자",
          "지하실"
        ],
        "distractorPool": [
          "해",
          "전등",
          "불빛"
        ]
      },
      {
        "id": "tail-01-q-50",
        "coreWord": "높은것",
        "word": "높은것",
        "answer": "하늘, 구름, 해",
        "targetWords": [
          "하늘",
          "구름",
          "해"
        ],
        "distractorPool": [
          "땅",
          "바닥",
          "개미"
        ]
      },
      {
        "id": "tail-01-q-51",
        "coreWord": "빠른것",
        "word": "빠른것",
        "answer": "비행기, 기차, 자동차",
        "targetWords": [
          "비행기",
          "기차",
          "자동차"
        ],
        "distractorPool": [
          "달팽이",
          "거북이",
          "지렁이"
        ]
      },
      {
        "id": "tail-01-q-52",
        "coreWord": "느린것",
        "word": "느린것",
        "answer": "달팽이, 거북이, 지렁이",
        "targetWords": [
          "달팽이",
          "거북이",
          "지렁이"
        ],
        "distractorPool": [
          "비행기",
          "기차",
          "자동차"
        ]
      },
      {
        "id": "tail-01-q-53",
        "coreWord": "예쁜것",
        "word": "예쁜것",
        "answer": "꽃, 나비, 무지개",
        "targetWords": [
          "꽃",
          "나비",
          "무지개"
        ],
        "distractorPool": [
          "쓰레기",
          "똥",
          "먼지"
        ]
      },
      {
        "id": "tail-01-q-54",
        "coreWord": "달콤한냄새",
        "word": "달콤한냄새",
        "answer": "사탕, 빵, 과일",
        "targetWords": [
          "사탕",
          "빵",
          "과일"
        ],
        "distractorPool": [
          "방구",
          "쓰레기",
          "땀"
        ]
      },
      {
        "id": "tail-01-q-55",
        "coreWord": "구린냄새",
        "word": "구린냄새",
        "answer": "방구, 똥, 쓰레기",
        "targetWords": [
          "방구",
          "똥",
          "쓰레기"
        ],
        "distractorPool": [
          "꽃",
          "향수",
          "비누"
        ]
      },
      {
        "id": "tail-01-q-56",
        "coreWord": "부드러운것",
        "word": "부드러운것",
        "answer": "솜, 깃털, 털인형",
        "targetWords": [
          "솜",
          "깃털",
          "털인형"
        ],
        "distractorPool": [
          "돌멩이",
          "나무",
          "쇠"
        ]
      },
      {
        "id": "tail-01-q-57",
        "coreWord": "딱딱한것",
        "word": "딱딱한것",
        "answer": "돌멩이, 나무, 책상",
        "targetWords": [
          "돌멩이",
          "나무",
          "책상"
        ],
        "distractorPool": [
          "솜",
          "깃털",
          "털인형"
        ]
      },
      {
        "id": "tail-01-q-58",
        "coreWord": "무거운것",
        "word": "무거운것",
        "answer": "냉장고, 자동차, 코끼리",
        "targetWords": [
          "냉장고",
          "자동차",
          "코끼리"
        ],
        "distractorPool": [
          "깃털",
          "휴지",
          "풍선"
        ]
      },
      {
        "id": "tail-01-q-59",
        "coreWord": "가벼운것",
        "word": "가벼운것",
        "answer": "깃털, 휴지, 풍선",
        "targetWords": [
          "깃털",
          "휴지",
          "풍선"
        ],
        "distractorPool": [
          "냉장고",
          "자동차",
          "코끼리"
        ]
      },
      {
        "id": "tail-01-q-60",
        "coreWord": "소중한것",
        "word": "소중한것",
        "answer": "나, 가족, 친구",
        "targetWords": [
          "나",
          "가족",
          "친구"
        ],
        "distractorPool": [
          "쓰레기",
          "먼지",
          "돌멩이"
        ]
      }
    ]
  },
  {
    "id": "tail-02",
    "title": "유아 02",
    "schoolLevelLabel": "02",
    "bandLabel": "유아",
    "descriptor": "동물과자연",
    "grammarFocus": "동물과자연",
    "goalCopy": "동물과자연 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 30,
    "questions": [
      {
        "id": "tail-02-q-01",
        "coreWord": "농장동물",
        "word": "농장동물",
        "answer": "소, 돼지, 말",
        "targetWords": [
          "소",
          "돼지",
          "말"
        ],
        "distractorPool": [
          "상어",
          "고래",
          "문어"
        ]
      },
      {
        "id": "tail-02-q-02",
        "coreWord": "집동물",
        "word": "집동물",
        "answer": "강아지, 고양이, 햄스터",
        "targetWords": [
          "강아지",
          "고양이",
          "햄스터"
        ],
        "distractorPool": [
          "사자",
          "호랑이",
          "곰"
        ]
      },
      {
        "id": "tail-02-q-03",
        "coreWord": "산속동물",
        "word": "산속동물",
        "answer": "호랑이, 곰, 다람쥐",
        "targetWords": [
          "호랑이",
          "곰",
          "다람쥐"
        ],
        "distractorPool": [
          "돌고래",
          "오징어",
          "불가사리"
        ]
      },
      {
        "id": "tail-02-q-04",
        "coreWord": "바다동물",
        "word": "바다동물",
        "answer": "상어, 고래, 문어",
        "targetWords": [
          "상어",
          "고래",
          "문어"
        ],
        "distractorPool": [
          "토끼",
          "사슴",
          "여우"
        ]
      },
      {
        "id": "tail-02-q-05",
        "coreWord": "새",
        "word": "새",
        "answer": "참새, 까치, 비둘기",
        "targetWords": [
          "참새",
          "까치",
          "비둘기"
        ],
        "distractorPool": [
          "강아지",
          "고양이",
          "햄스터"
        ]
      },
      {
        "id": "tail-02-q-06",
        "coreWord": "벌레",
        "word": "벌레",
        "answer": "개미, 파리, 모기",
        "targetWords": [
          "개미",
          "파리",
          "모기"
        ],
        "distractorPool": [
          "호랑이",
          "사자",
          "코끼리"
        ]
      },
      {
        "id": "tail-02-q-07",
        "coreWord": "예쁜곤충",
        "word": "예쁜곤충",
        "answer": "나비, 무당벌레, 반딧불이",
        "targetWords": [
          "나비",
          "무당벌레",
          "반딧불이"
        ],
        "distractorPool": [
          "바퀴벌레",
          "모기",
          "파리"
        ]
      },
      {
        "id": "tail-02-q-08",
        "coreWord": "물가동물",
        "word": "물가동물",
        "answer": "개구리, 오리, 거북이",
        "targetWords": [
          "개구리",
          "오리",
          "거북이"
        ],
        "distractorPool": [
          "독수리",
          "참새",
          "까치"
        ]
      },
      {
        "id": "tail-02-q-09",
        "coreWord": "목이긴동물",
        "word": "목이긴동물",
        "answer": "기린, 타조, 홍학",
        "targetWords": [
          "기린",
          "타조",
          "홍학"
        ],
        "distractorPool": [
          "돼지",
          "쥐",
          "토끼"
        ]
      },
      {
        "id": "tail-02-q-10",
        "coreWord": "뚱뚱한동물",
        "word": "뚱뚱한동물",
        "answer": "코끼리, 하마, 코뿔소",
        "targetWords": [
          "코끼리",
          "하마",
          "코뿔소"
        ],
        "distractorPool": [
          "개미",
          "모기",
          "파리"
        ]
      },
      {
        "id": "tail-02-q-11",
        "coreWord": "뿔이있는동물",
        "word": "뿔이있는동물",
        "answer": "사슴, 코뿔소, 소",
        "targetWords": [
          "사슴",
          "코뿔소",
          "소"
        ],
        "distractorPool": [
          "고양이",
          "강아지",
          "닭"
        ]
      },
      {
        "id": "tail-02-q-12",
        "coreWord": "꼬리가긴동물",
        "word": "꼬리가긴동물",
        "answer": "원숭이, 호랑이, 뱀",
        "targetWords": [
          "원숭이",
          "호랑이",
          "뱀"
        ],
        "distractorPool": [
          "개구리",
          "토끼",
          "돼지"
        ]
      },
      {
        "id": "tail-02-q-13",
        "coreWord": "동물소리멍멍",
        "word": "동물소리멍멍",
        "answer": "강아지, 개, 바둑이",
        "targetWords": [
          "강아지",
          "개",
          "바둑이"
        ],
        "distractorPool": [
          "고양이",
          "돼지",
          "오리"
        ]
      },
      {
        "id": "tail-02-q-14",
        "coreWord": "동물소리야옹",
        "word": "동물소리야옹",
        "answer": "고양이, 새끼고양이, 길고양이",
        "targetWords": [
          "고양이",
          "새끼고양이",
          "길고양이"
        ],
        "distractorPool": [
          "강아지",
          "닭",
          "소"
        ]
      },
      {
        "id": "tail-02-q-15",
        "coreWord": "동물소리꿀꿀",
        "word": "동물소리꿀꿀",
        "answer": "돼지, 아기돼지, 멧돼지",
        "targetWords": [
          "돼지",
          "아기돼지",
          "멧돼지"
        ],
        "distractorPool": [
          "참새",
          "비둘기",
          "까치"
        ]
      },
      {
        "id": "tail-02-q-16",
        "coreWord": "동물소리삐약",
        "word": "동물소리삐약",
        "answer": "병아리, 새끼새, 아기새",
        "targetWords": [
          "병아리",
          "새끼새",
          "아기새"
        ],
        "distractorPool": [
          "강아지",
          "고양이",
          "돼지"
        ]
      },
      {
        "id": "tail-02-q-17",
        "coreWord": "동물소리음매",
        "word": "동물소리음매",
        "answer": "소, 송아지, 황소",
        "targetWords": [
          "소",
          "송아지",
          "황소"
        ],
        "distractorPool": [
          "오리",
          "거위",
          "닭"
        ]
      },
      {
        "id": "tail-02-q-18",
        "coreWord": "느린동물",
        "word": "느린동물",
        "answer": "거북이, 달팽이, 나무늘보",
        "targetWords": [
          "거북이",
          "달팽이",
          "나무늘보"
        ],
        "distractorPool": [
          "치타",
          "표범",
          "말"
        ]
      },
      {
        "id": "tail-02-q-19",
        "coreWord": "빠른동물",
        "word": "빠른동물",
        "answer": "치타, 표범, 말",
        "targetWords": [
          "치타",
          "표범",
          "말"
        ],
        "distractorPool": [
          "거북이",
          "달팽이",
          "나무늘보"
        ]
      },
      {
        "id": "tail-02-q-20",
        "coreWord": "알낳는동물",
        "word": "알낳는동물",
        "answer": "닭, 오리, 타조",
        "targetWords": [
          "닭",
          "오리",
          "타조"
        ],
        "distractorPool": [
          "강아지",
          "고양이",
          "돼지"
        ]
      },
      {
        "id": "tail-02-q-21",
        "coreWord": "폴짝폴짝",
        "word": "폴짝폴짝",
        "answer": "토끼, 개구리, 캥거루",
        "targetWords": [
          "토끼",
          "개구리",
          "캥거루"
        ],
        "distractorPool": [
          "뱀",
          "지렁이",
          "달팽이"
        ]
      },
      {
        "id": "tail-02-q-22",
        "coreWord": "엉금엉금",
        "word": "엉금엉금",
        "answer": "거북이, 자라, 악어",
        "targetWords": [
          "거북이",
          "자라",
          "악어"
        ],
        "distractorPool": [
          "토끼",
          "캥거루",
          "개구리"
        ]
      },
      {
        "id": "tail-02-q-23",
        "coreWord": "살금살금",
        "word": "살금살금",
        "answer": "고양이, 호랑이, 표범",
        "targetWords": [
          "고양이",
          "호랑이",
          "표범"
        ],
        "distractorPool": [
          "코끼리",
          "하마",
          "코뿔소"
        ]
      },
      {
        "id": "tail-02-q-24",
        "coreWord": "빨간과일",
        "word": "빨간과일",
        "answer": "사과, 딸기, 체리",
        "targetWords": [
          "사과",
          "딸기",
          "체리"
        ],
        "distractorPool": [
          "바나나",
          "레몬",
          "파인애플"
        ]
      },
      {
        "id": "tail-02-q-25",
        "coreWord": "노란과일",
        "word": "노란과일",
        "answer": "바나나, 레몬, 파인애플",
        "targetWords": [
          "바나나",
          "레몬",
          "파인애플"
        ],
        "distractorPool": [
          "수박",
          "딸기",
          "체리"
        ]
      },
      {
        "id": "tail-02-q-26",
        "coreWord": "초록과일",
        "word": "초록과일",
        "answer": "수박, 멜론, 청포도",
        "targetWords": [
          "수박",
          "멜론",
          "청포도"
        ],
        "distractorPool": [
          "바나나",
          "귤",
          "오렌지"
        ]
      },
      {
        "id": "tail-02-q-27",
        "coreWord": "주황과일",
        "word": "주황과일",
        "answer": "귤, 오렌지, 감",
        "targetWords": [
          "귤",
          "오렌지",
          "감"
        ],
        "distractorPool": [
          "수박",
          "사과",
          "체리"
        ]
      },
      {
        "id": "tail-02-q-28",
        "coreWord": "보라과일",
        "word": "보라과일",
        "answer": "포도, 블루베리, 자두",
        "targetWords": [
          "포도",
          "블루베리",
          "자두"
        ],
        "distractorPool": [
          "레몬",
          "바나나",
          "귤"
        ]
      },
      {
        "id": "tail-02-q-29",
        "coreWord": "길쭉한채소",
        "word": "길쭉한채소",
        "answer": "오이, 당근, 대파",
        "targetWords": [
          "오이",
          "당근",
          "대파"
        ],
        "distractorPool": [
          "호박",
          "양파",
          "토마토"
        ]
      },
      {
        "id": "tail-02-q-30",
        "coreWord": "둥근채소",
        "word": "둥근채소",
        "answer": "양파, 호박, 양배추",
        "targetWords": [
          "양파",
          "호박",
          "양배추"
        ],
        "distractorPool": [
          "오이",
          "당근",
          "대파"
        ]
      },
      {
        "id": "tail-02-q-31",
        "coreWord": "초록채소",
        "word": "초록채소",
        "answer": "시금치, 상추, 오이",
        "targetWords": [
          "시금치",
          "상추",
          "오이"
        ],
        "distractorPool": [
          "가지",
          "당근",
          "양파"
        ]
      },
      {
        "id": "tail-02-q-32",
        "coreWord": "매운채소",
        "word": "매운채소",
        "answer": "고추, 마늘, 양파",
        "targetWords": [
          "고추",
          "마늘",
          "양파"
        ],
        "distractorPool": [
          "상추",
          "깻잎",
          "호박"
        ]
      },
      {
        "id": "tail-02-q-33",
        "coreWord": "맛있는과일",
        "word": "맛있는과일",
        "answer": "복숭아, 참외, 배",
        "targetWords": [
          "복숭아",
          "참외",
          "배"
        ],
        "distractorPool": [
          "양파",
          "마늘",
          "고추"
        ]
      },
      {
        "id": "tail-02-q-34",
        "coreWord": "하늘",
        "word": "하늘",
        "answer": "해, 달, 별",
        "targetWords": [
          "해",
          "달",
          "별"
        ],
        "distractorPool": [
          "땅",
          "바다",
          "모래"
        ]
      },
      {
        "id": "tail-02-q-35",
        "coreWord": "낮",
        "word": "낮",
        "answer": "해, 구름, 무지개",
        "targetWords": [
          "해",
          "구름",
          "무지개"
        ],
        "distractorPool": [
          "별",
          "달",
          "어둠"
        ]
      },
      {
        "id": "tail-02-q-36",
        "coreWord": "밤",
        "word": "밤",
        "answer": "달, 별, 어둠",
        "targetWords": [
          "달",
          "별",
          "어둠"
        ],
        "distractorPool": [
          "해",
          "무지개",
          "밝음"
        ]
      },
      {
        "id": "tail-02-q-37",
        "coreWord": "비오는날",
        "word": "비오는날",
        "answer": "우산, 먹구름, 번개",
        "targetWords": [
          "우산",
          "먹구름",
          "번개"
        ],
        "distractorPool": [
          "햇빛",
          "무지개",
          "선글라스"
        ]
      },
      {
        "id": "tail-02-q-38",
        "coreWord": "눈오는날",
        "word": "눈오는날",
        "answer": "눈사람, 눈싸움, 썰매",
        "targetWords": [
          "눈사람",
          "눈싸움",
          "썰매"
        ],
        "distractorPool": [
          "물놀이",
          "수영",
          "모래성"
        ]
      },
      {
        "id": "tail-02-q-39",
        "coreWord": "봄바람",
        "word": "봄바람",
        "answer": "살랑살랑, 산들산들, 솔솔",
        "targetWords": [
          "살랑살랑",
          "산들산들",
          "솔솔"
        ],
        "distractorPool": [
          "쌩쌩",
          "휙휙",
          "윙윙"
        ]
      },
      {
        "id": "tail-02-q-40",
        "coreWord": "강한바람",
        "word": "강한바람",
        "answer": "쌩쌩, 휙휙, 윙윙",
        "targetWords": [
          "쌩쌩",
          "휙휙",
          "윙윙"
        ],
        "distractorPool": [
          "살랑살랑",
          "산들산들",
          "솔솔"
        ]
      },
      {
        "id": "tail-02-q-41",
        "coreWord": "빗소리",
        "word": "빗소리",
        "answer": "주룩주룩, 톡톡, 후두둑",
        "targetWords": [
          "주룩주룩",
          "톡톡",
          "후두둑"
        ],
        "distractorPool": [
          "쨍쨍",
          "반짝반짝",
          "활짝"
        ]
      },
      {
        "id": "tail-02-q-42",
        "coreWord": "눈모양",
        "word": "눈모양",
        "answer": "소복소복, 펑펑, 펄펄",
        "targetWords": [
          "소복소복",
          "펑펑",
          "펄펄"
        ],
        "distractorPool": [
          "주룩주룩",
          "톡톡",
          "후두둑"
        ]
      },
      {
        "id": "tail-02-q-43",
        "coreWord": "꽃",
        "word": "꽃",
        "answer": "장미, 해바라기, 튤립",
        "targetWords": [
          "장미",
          "해바라기",
          "튤립"
        ],
        "distractorPool": [
          "소나무",
          "잡초",
          "바위"
        ]
      },
      {
        "id": "tail-02-q-44",
        "coreWord": "나무",
        "word": "나무",
        "answer": "나뭇잎, 나뭇가지, 열매",
        "targetWords": [
          "나뭇잎",
          "나뭇가지",
          "열매"
        ],
        "distractorPool": [
          "유리",
          "플라스틱",
          "쇠"
        ]
      },
      {
        "id": "tail-02-q-45",
        "coreWord": "바다",
        "word": "바다",
        "answer": "파도, 모래사장, 조개껍데기",
        "targetWords": [
          "파도",
          "모래사장",
          "조개껍데기"
        ],
        "distractorPool": [
          "산",
          "언덕",
          "숲"
        ]
      },
      {
        "id": "tail-02-q-46",
        "coreWord": "산",
        "word": "산",
        "answer": "나무, 바위, 흙",
        "targetWords": [
          "나무",
          "바위",
          "흙"
        ],
        "distractorPool": [
          "파도",
          "조개",
          "미역"
        ]
      },
      {
        "id": "tail-02-q-47",
        "coreWord": "풀숲",
        "word": "풀숲",
        "answer": "잡초, 네잎클로버, 민들레",
        "targetWords": [
          "잡초",
          "네잎클로버",
          "민들레"
        ],
        "distractorPool": [
          "고래",
          "상어",
          "문어"
        ]
      },
      {
        "id": "tail-02-q-48",
        "coreWord": "작은생물",
        "word": "작은생물",
        "answer": "개미, 지렁이, 달팽이",
        "targetWords": [
          "개미",
          "지렁이",
          "달팽이"
        ],
        "distractorPool": [
          "코끼리",
          "하마",
          "기린"
        ]
      },
      {
        "id": "tail-02-q-49",
        "coreWord": "큰생물",
        "word": "큰생물",
        "answer": "고래, 코끼리, 기린",
        "targetWords": [
          "고래",
          "코끼리",
          "기린"
        ],
        "distractorPool": [
          "개미",
          "지렁이",
          "달팽이"
        ]
      },
      {
        "id": "tail-02-q-50",
        "coreWord": "털이있는동물",
        "word": "털이있는동물",
        "answer": "양, 곰, 강아지",
        "targetWords": [
          "양",
          "곰",
          "강아지"
        ],
        "distractorPool": [
          "물고기",
          "뱀",
          "개구리"
        ]
      },
      {
        "id": "tail-02-q-51",
        "coreWord": "매끈한동물",
        "word": "매끈한동물",
        "answer": "뱀, 개구리, 미꾸라지",
        "targetWords": [
          "뱀",
          "개구리",
          "미꾸라지"
        ],
        "distractorPool": [
          "양",
          "곰",
          "강아지"
        ]
      },
      {
        "id": "tail-02-q-52",
        "coreWord": "날개있는것",
        "word": "날개있는것",
        "answer": "나비, 잠자리, 새",
        "targetWords": [
          "나비",
          "잠자리",
          "새"
        ],
        "distractorPool": [
          "강아지",
          "고양이",
          "돼지"
        ]
      },
      {
        "id": "tail-02-q-53",
        "coreWord": "물에사는것",
        "word": "물에사는것",
        "answer": "물고기, 꽃게, 새우",
        "targetWords": [
          "물고기",
          "꽃게",
          "새우"
        ],
        "distractorPool": [
          "호랑이",
          "사자",
          "곰"
        ]
      },
      {
        "id": "tail-02-q-54",
        "coreWord": "땅에사는것",
        "word": "땅에사는것",
        "answer": "사자, 호랑이, 곰",
        "targetWords": [
          "사자",
          "호랑이",
          "곰"
        ],
        "distractorPool": [
          "물고기",
          "꽃게",
          "새우"
        ]
      },
      {
        "id": "tail-02-q-55",
        "coreWord": "땅속에사는것",
        "word": "땅속에사는것",
        "answer": "두더지, 지렁이, 개미",
        "targetWords": [
          "두더지",
          "지렁이",
          "개미"
        ],
        "distractorPool": [
          "새",
          "나비",
          "잠자리"
        ]
      },
      {
        "id": "tail-02-q-56",
        "coreWord": "과일껍질",
        "word": "과일껍질",
        "answer": "바나나껍질, 귤껍질, 수박껍질",
        "targetWords": [
          "바나나껍질",
          "귤껍질",
          "수박껍질"
        ],
        "distractorPool": [
          "사과씨",
          "포도씨",
          "수박씨"
        ]
      },
      {
        "id": "tail-02-q-57",
        "coreWord": "과일씨",
        "word": "과일씨",
        "answer": "수박씨, 사과씨, 포도씨",
        "targetWords": [
          "수박씨",
          "사과씨",
          "포도씨"
        ],
        "distractorPool": [
          "바나나껍질",
          "귤껍질",
          "수박껍질"
        ]
      },
      {
        "id": "tail-02-q-58",
        "coreWord": "열매",
        "word": "열매",
        "answer": "도토리, 밤, 솔방울",
        "targetWords": [
          "도토리",
          "밤",
          "솔방울"
        ],
        "distractorPool": [
          "나뭇잎",
          "뿌리",
          "줄기"
        ]
      },
      {
        "id": "tail-02-q-59",
        "coreWord": "단풍",
        "word": "단풍",
        "answer": "빨간잎, 노란잎, 은행잎",
        "targetWords": [
          "빨간잎",
          "노란잎",
          "은행잎"
        ],
        "distractorPool": [
          "초록잎",
          "새싹",
          "열매"
        ]
      },
      {
        "id": "tail-02-q-60",
        "coreWord": "봄꽃",
        "word": "봄꽃",
        "answer": "벚꽃, 개나리, 진달래",
        "targetWords": [
          "벚꽃",
          "개나리",
          "진달래"
        ],
        "distractorPool": [
          "눈꽃",
          "단풍",
          "낙엽"
        ]
      }
    ]
  },
  {
    "id": "tail-03",
    "title": "유아 03",
    "schoolLevelLabel": "03",
    "bandLabel": "유아",
    "descriptor": "유치원과놀이",
    "grammarFocus": "유치원과놀이",
    "goalCopy": "유치원과놀이 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 30,
    "questions": [
      {
        "id": "tail-03-q-01",
        "coreWord": "유치원",
        "word": "유치원",
        "answer": "선생님, 친구, 유치원버스",
        "targetWords": [
          "선생님",
          "친구",
          "유치원버스"
        ],
        "distractorPool": [
          "경찰",
          "소방관",
          "의사"
        ]
      },
      {
        "id": "tail-03-q-02",
        "coreWord": "선생님",
        "word": "선생님",
        "answer": "칭찬, 피아노, 동화책",
        "targetWords": [
          "칭찬",
          "피아노",
          "동화책"
        ],
        "distractorPool": [
          "수술",
          "주사",
          "도둑"
        ]
      },
      {
        "id": "tail-03-q-03",
        "coreWord": "우리반",
        "word": "우리반",
        "answer": "친구들, 책상, 의자",
        "targetWords": [
          "친구들",
          "책상",
          "의자"
        ],
        "distractorPool": [
          "침대",
          "욕조",
          "가스레인지"
        ]
      },
      {
        "id": "tail-03-q-04",
        "coreWord": "내자리",
        "word": "내자리",
        "answer": "내이름, 내서랍, 내가방",
        "targetWords": [
          "내이름",
          "내서랍",
          "내가방"
        ],
        "distractorPool": [
          "엄마가방",
          "아빠구두",
          "동생장난감"
        ]
      },
      {
        "id": "tail-03-q-05",
        "coreWord": "가방속",
        "word": "가방속",
        "answer": "수첩, 필통, 색연필",
        "targetWords": [
          "수첩",
          "필통",
          "색연필"
        ],
        "distractorPool": [
          "냄비",
          "도마",
          "국자"
        ]
      },
      {
        "id": "tail-03-q-06",
        "coreWord": "필통속",
        "word": "필통속",
        "answer": "연필, 지우개, 자",
        "targetWords": [
          "연필",
          "지우개",
          "자"
        ],
        "distractorPool": [
          "숟가락",
          "포크",
          "젓가락"
        ]
      },
      {
        "id": "tail-03-q-07",
        "coreWord": "미술시간",
        "word": "미술시간",
        "answer": "스케치북, 크레파스, 물감",
        "targetWords": [
          "스케치북",
          "크레파스",
          "물감"
        ],
        "distractorPool": [
          "피아노",
          "리코더",
          "탬버린"
        ]
      },
      {
        "id": "tail-03-q-08",
        "coreWord": "만들기",
        "word": "만들기",
        "answer": "가위, 풀, 색종이",
        "targetWords": [
          "가위",
          "풀",
          "색종이"
        ],
        "distractorPool": [
          "망치",
          "못",
          "드라이버"
        ]
      },
      {
        "id": "tail-03-q-09",
        "coreWord": "점토놀이",
        "word": "점토놀이",
        "answer": "찰흙, 아이클레이, 모양틀",
        "targetWords": [
          "찰흙",
          "아이클레이",
          "모양틀"
        ],
        "distractorPool": [
          "연필",
          "지우개",
          "색연필"
        ]
      },
      {
        "id": "tail-03-q-10",
        "coreWord": "블록놀이",
        "word": "블록놀이",
        "answer": "레고, 나무블록, 자석블록",
        "targetWords": [
          "레고",
          "나무블록",
          "자석블록"
        ],
        "distractorPool": [
          "크레파스",
          "물감",
          "붓"
        ]
      },
      {
        "id": "tail-03-q-11",
        "coreWord": "소꿉놀이",
        "word": "소꿉놀이",
        "answer": "장난감냄비, 장난감접시, 앞치마",
        "targetWords": [
          "장난감냄비",
          "장난감접시",
          "앞치마"
        ],
        "distractorPool": [
          "로봇",
          "자동차",
          "팽이"
        ]
      },
      {
        "id": "tail-03-q-12",
        "coreWord": "병원놀이",
        "word": "병원놀이",
        "answer": "청진기, 주사기, 붕대",
        "targetWords": [
          "청진기",
          "주사기",
          "붕대"
        ],
        "distractorPool": [
          "냄비",
          "접시",
          "국자"
        ]
      },
      {
        "id": "tail-03-q-13",
        "coreWord": "놀이터",
        "word": "놀이터",
        "answer": "미끄럼틀, 그네, 시소",
        "targetWords": [
          "미끄럼틀",
          "그네",
          "시소"
        ],
        "distractorPool": [
          "침대",
          "텔레비전",
          "식탁"
        ]
      },
      {
        "id": "tail-03-q-14",
        "coreWord": "모래놀이",
        "word": "모래놀이",
        "answer": "모래성, 삽, 양동이",
        "targetWords": [
          "모래성",
          "삽",
          "양동이"
        ],
        "distractorPool": [
          "컴퓨터",
          "스마트폰",
          "텔레비전"
        ]
      },
      {
        "id": "tail-03-q-15",
        "coreWord": "숨바꼭질",
        "word": "숨바꼭질",
        "answer": "술래, 숨기, 찾았다",
        "targetWords": [
          "술래",
          "숨기",
          "찾았다"
        ],
        "distractorPool": [
          "공부",
          "시험",
          "독서"
        ]
      },
      {
        "id": "tail-03-q-16",
        "coreWord": "뜀박질",
        "word": "뜀박질",
        "answer": "달리기, 쫓아가기, 잡기놀이",
        "targetWords": [
          "달리기",
          "쫓아가기",
          "잡기놀이"
        ],
        "distractorPool": [
          "잠자기",
          "낮잠",
          "밥먹기"
        ]
      },
      {
        "id": "tail-03-q-17",
        "coreWord": "간식시간",
        "word": "간식시간",
        "answer": "우유, 요플레, 쿠키",
        "targetWords": [
          "우유",
          "요플레",
          "쿠키"
        ],
        "distractorPool": [
          "된장찌개",
          "김치",
          "비빔밥"
        ]
      },
      {
        "id": "tail-03-q-18",
        "coreWord": "점심시간",
        "word": "점심시간",
        "answer": "식판, 숟가락, 포크",
        "targetWords": [
          "식판",
          "숟가락",
          "포크"
        ],
        "distractorPool": [
          "가위",
          "풀",
          "색종이"
        ]
      },
      {
        "id": "tail-03-q-19",
        "coreWord": "맛있는반찬",
        "word": "맛있는반찬",
        "answer": "소시지, 돈까스, 계란말이",
        "targetWords": [
          "소시지",
          "돈까스",
          "계란말이"
        ],
        "distractorPool": [
          "크레파스",
          "연필",
          "지우개"
        ]
      },
      {
        "id": "tail-03-q-20",
        "coreWord": "밥먹고나서",
        "word": "밥먹고나서",
        "answer": "양치질, 입닦기, 정리하기",
        "targetWords": [
          "양치질",
          "입닦기",
          "정리하기"
        ],
        "distractorPool": [
          "뛰어놀기",
          "장난치기",
          "모래놀이"
        ]
      },
      {
        "id": "tail-03-q-21",
        "coreWord": "낮잠시간",
        "word": "낮잠시간",
        "answer": "이불, 베개, 자장가",
        "targetWords": [
          "이불",
          "베개",
          "자장가"
        ],
        "distractorPool": [
          "장난감",
          "놀이터",
          "달리기"
        ]
      },
      {
        "id": "tail-03-q-22",
        "coreWord": "화장실",
        "word": "화장실",
        "answer": "줄서기, 변기, 손씻기",
        "targetWords": [
          "줄서기",
          "변기",
          "손씻기"
        ],
        "distractorPool": [
          "미끄럼틀",
          "그네",
          "시소"
        ]
      },
      {
        "id": "tail-03-q-23",
        "coreWord": "손씻기",
        "word": "손씻기",
        "answer": "비누, 거품, 수건",
        "targetWords": [
          "비누",
          "거품",
          "수건"
        ],
        "distractorPool": [
          "모래",
          "흙",
          "찰흙"
        ]
      },
      {
        "id": "tail-03-q-24",
        "coreWord": "노래하기",
        "word": "노래하기",
        "answer": "피아노, 동요, 율동",
        "targetWords": [
          "피아노",
          "동요",
          "율동"
        ],
        "distractorPool": [
          "받아쓰기",
          "수학",
          "달리기"
        ]
      },
      {
        "id": "tail-03-q-25",
        "coreWord": "악기",
        "word": "악기",
        "answer": "탬버린, 트라이앵글, 캐스터네츠",
        "targetWords": [
          "탬버린",
          "트라이앵글",
          "캐스터네츠"
        ],
        "distractorPool": [
          "연필",
          "지우개",
          "자"
        ]
      },
      {
        "id": "tail-03-q-26",
        "coreWord": "동화책",
        "word": "동화책",
        "answer": "그림, 이야기, 공주님",
        "targetWords": [
          "그림",
          "이야기",
          "공주님"
        ],
        "distractorPool": [
          "뉴스",
          "신문",
          "사전"
        ]
      },
      {
        "id": "tail-03-q-27",
        "coreWord": "동화속주인공",
        "word": "동화속주인공",
        "answer": "왕자님, 공주님, 마녀",
        "targetWords": [
          "왕자님",
          "공주님",
          "마녀"
        ],
        "distractorPool": [
          "경찰관",
          "소방관",
          "의사"
        ]
      },
      {
        "id": "tail-03-q-28",
        "coreWord": "스티커",
        "word": "스티커",
        "answer": "칭찬스티커, 반짝이스티커, 별스티커",
        "targetWords": [
          "칭찬스티커",
          "반짝이스티커",
          "별스티커"
        ],
        "distractorPool": [
          "가위",
          "칼",
          "바늘"
        ]
      },
      {
        "id": "tail-03-q-29",
        "coreWord": "장난감자동차",
        "word": "장난감자동차",
        "answer": "소방차장난감, 경찰차장난감, 구급차장난감",
        "targetWords": [
          "소방차장난감",
          "경찰차장난감",
          "구급차장난감"
        ],
        "distractorPool": [
          "비행기",
          "배",
          "잠수함"
        ]
      },
      {
        "id": "tail-03-q-30",
        "coreWord": "정리시간",
        "word": "정리시간",
        "answer": "장난감상자, 제자리, 청소",
        "targetWords": [
          "장난감상자",
          "제자리",
          "청소"
        ],
        "distractorPool": [
          "어지럽히기",
          "던지기",
          "부수기"
        ]
      },
      {
        "id": "tail-03-q-31",
        "coreWord": "줄서기",
        "word": "줄서기",
        "answer": "차례차례, 앞사람, 뒷사람",
        "targetWords": [
          "차례차례",
          "앞사람",
          "뒷사람"
        ],
        "distractorPool": [
          "새치기",
          "밀기",
          "싸우기"
        ]
      },
      {
        "id": "tail-03-q-32",
        "coreWord": "사이좋게",
        "word": "사이좋게",
        "answer": "양보하기, 빌려주기, 같이놀기",
        "targetWords": [
          "양보하기",
          "빌려주기",
          "같이놀기"
        ],
        "distractorPool": [
          "때리기",
          "뺏기",
          "욕하기"
        ]
      },
      {
        "id": "tail-03-q-33",
        "coreWord": "싸웠을때",
        "word": "싸웠을때",
        "answer": "미안해, 사과하기, 화해하기",
        "targetWords": [
          "미안해",
          "사과하기",
          "화해하기"
        ],
        "distractorPool": [
          "메롱",
          "도망가기",
          "계속싸우기"
        ]
      },
      {
        "id": "tail-03-q-34",
        "coreWord": "인사",
        "word": "인사",
        "answer": "안녕하세요, 안녕히계세요, 감사합니다",
        "targetWords": [
          "안녕하세요",
          "안녕히계세요",
          "감사합니다"
        ],
        "distractorPool": [
          "싫어요",
          "미워요",
          "저리가요"
        ]
      },
      {
        "id": "tail-03-q-35",
        "coreWord": "대답",
        "word": "대답",
        "answer": "네, 알겠습니다, 좋아요",
        "targetWords": [
          "네",
          "알겠습니다",
          "좋아요"
        ],
        "distractorPool": [
          "아니요",
          "싫어요",
          "안할래요"
        ]
      },
      {
        "id": "tail-03-q-36",
        "coreWord": "유치원버스",
        "word": "유치원버스",
        "answer": "안전벨트, 기사님, 노란버스",
        "targetWords": [
          "안전벨트",
          "기사님",
          "노란버스"
        ],
        "distractorPool": [
          "지하철",
          "비행기",
          "배"
        ]
      },
      {
        "id": "tail-03-q-37",
        "coreWord": "소풍",
        "word": "소풍",
        "answer": "도시락, 돗자리, 물통",
        "targetWords": [
          "도시락",
          "돗자리",
          "물통"
        ],
        "distractorPool": [
          "교과서",
          "필통",
          "지우개"
        ]
      },
      {
        "id": "tail-03-q-38",
        "coreWord": "재밌는곳",
        "word": "재밌는곳",
        "answer": "동물원, 놀이공원, 수족관",
        "targetWords": [
          "동물원",
          "놀이공원",
          "수족관"
        ],
        "distractorPool": [
          "병원",
          "주사실",
          "약국"
        ]
      },
      {
        "id": "tail-03-q-39",
        "coreWord": "동물원",
        "word": "동물원",
        "answer": "호랑이, 사자, 원숭이",
        "targetWords": [
          "호랑이",
          "사자",
          "원숭이"
        ],
        "distractorPool": [
          "물고기",
          "꽃게",
          "상어"
        ]
      },
      {
        "id": "tail-03-q-40",
        "coreWord": "수족관",
        "word": "수족관",
        "answer": "상어, 물고기, 가오리",
        "targetWords": [
          "상어",
          "물고기",
          "가오리"
        ],
        "distractorPool": [
          "사자",
          "호랑이",
          "곰"
        ]
      },
      {
        "id": "tail-03-q-41",
        "coreWord": "놀이공원",
        "word": "놀이공원",
        "answer": "회전목마, 솜사탕, 풍선",
        "targetWords": [
          "회전목마",
          "솜사탕",
          "풍선"
        ],
        "distractorPool": [
          "주사기",
          "약",
          "청진기"
        ]
      },
      {
        "id": "tail-03-q-42",
        "coreWord": "재롱잔치",
        "word": "재롱잔치",
        "answer": "율동, 노래, 무대",
        "targetWords": [
          "율동",
          "노래",
          "무대"
        ],
        "distractorPool": [
          "잠자기",
          "밥먹기",
          "화장실"
        ]
      },
      {
        "id": "tail-03-q-43",
        "coreWord": "생일파티",
        "word": "생일파티",
        "answer": "고깔모자, 케이크, 촛불불기",
        "targetWords": [
          "고깔모자",
          "케이크",
          "촛불불기"
        ],
        "distractorPool": [
          "주사",
          "쓴약",
          "반창고"
        ]
      },
      {
        "id": "tail-03-q-44",
        "coreWord": "체육시간",
        "word": "체육시간",
        "answer": "공놀이, 달리기, 훌라후프",
        "targetWords": [
          "공놀이",
          "달리기",
          "훌라후프"
        ],
        "distractorPool": [
          "그림그리기",
          "색칠하기",
          "종이접기"
        ]
      },
      {
        "id": "tail-03-q-45",
        "coreWord": "둥근공",
        "word": "둥근공",
        "answer": "축구공, 농구공, 고무공",
        "targetWords": [
          "축구공",
          "농구공",
          "고무공"
        ],
        "distractorPool": [
          "네모블록",
          "세모블록",
          "책상"
        ]
      },
      {
        "id": "tail-03-q-46",
        "coreWord": "풍선",
        "word": "풍선",
        "answer": "불기, 날리기, 빵터지기",
        "targetWords": [
          "불기",
          "날리기",
          "빵터지기"
        ],
        "distractorPool": [
          "자르기",
          "찢기",
          "먹기"
        ]
      },
      {
        "id": "tail-03-q-47",
        "coreWord": "비눗방울",
        "word": "비눗방울",
        "answer": "후불기, 동그라미, 톡터지기",
        "targetWords": [
          "후불기",
          "동그라미",
          "톡터지기"
        ],
        "distractorPool": [
          "던지기",
          "발로차기",
          "찢기"
        ]
      },
      {
        "id": "tail-03-q-48",
        "coreWord": "역할놀이",
        "word": "역할놀이",
        "answer": "엄마역할, 아빠역할, 아기역할",
        "targetWords": [
          "엄마역할",
          "아빠역할",
          "아기역할"
        ],
        "distractorPool": [
          "강아지",
          "고양이",
          "돼지"
        ]
      },
      {
        "id": "tail-03-q-49",
        "coreWord": "약속",
        "word": "약속",
        "answer": "손가락걸기, 꼭꼭, 지키기",
        "targetWords": [
          "손가락걸기",
          "꼭꼭",
          "지키기"
        ],
        "distractorPool": [
          "거짓말",
          "어기기",
          "도망치기"
        ]
      },
      {
        "id": "tail-03-q-50",
        "coreWord": "위험한것",
        "word": "위험한것",
        "answer": "뜨거운물, 가위, 칼",
        "targetWords": [
          "뜨거운물",
          "가위",
          "칼"
        ],
        "distractorPool": [
          "인형",
          "블록",
          "곰인형"
        ]
      },
      {
        "id": "tail-03-q-51",
        "coreWord": "안전",
        "word": "안전",
        "answer": "천천히걷기, 손잡기, 앞보기",
        "targetWords": [
          "천천히걷기",
          "손잡기",
          "앞보기"
        ],
        "distractorPool": [
          "뛰기",
          "장난치기",
          "밀기"
        ]
      },
      {
        "id": "tail-03-q-52",
        "coreWord": "집에갈때",
        "word": "집에갈때",
        "answer": "가방메기, 신발신기, 인사하기",
        "targetWords": [
          "가방메기",
          "신발신기",
          "인사하기"
        ],
        "distractorPool": [
          "잠옷입기",
          "밥먹기",
          "세수하기"
        ]
      },
      {
        "id": "tail-03-q-53",
        "coreWord": "엄마만날때",
        "word": "엄마만날때",
        "answer": "안아주기, 뽀뽀하기, 웃기",
        "targetWords": [
          "안아주기",
          "뽀뽀하기",
          "웃기"
        ],
        "distractorPool": [
          "울기",
          "화내기",
          "도망가기"
        ]
      },
      {
        "id": "tail-03-q-54",
        "coreWord": "칭찬받을때",
        "word": "칭찬받을때",
        "answer": "기분좋다, 최고, 쓰다듬기",
        "targetWords": [
          "기분좋다",
          "최고",
          "쓰다듬기"
        ],
        "distractorPool": [
          "슬프다",
          "우울하다",
          "혼나다"
        ]
      },
      {
        "id": "tail-03-q-55",
        "coreWord": "아플때",
        "word": "아플때",
        "answer": "양호실, 밴드붙이기, 약바르기",
        "targetWords": [
          "양호실",
          "밴드붙이기",
          "약바르기"
        ],
        "distractorPool": [
          "놀이터",
          "미끄럼틀",
          "그네"
        ]
      },
      {
        "id": "tail-03-q-56",
        "coreWord": "만들기작품",
        "word": "만들기작품",
        "answer": "종이접기, 찰흙인형, 색칠공부",
        "targetWords": [
          "종이접기",
          "찰흙인형",
          "색칠공부"
        ],
        "distractorPool": [
          "밥",
          "반찬",
          "국"
        ]
      },
      {
        "id": "tail-03-q-57",
        "coreWord": "소중한친구",
        "word": "소중한친구",
        "answer": "짝꿍, 단짝, 우리반친구",
        "targetWords": [
          "짝꿍",
          "단짝",
          "우리반친구"
        ],
        "distractorPool": [
          "나쁜사람",
          "도둑",
          "모르는사람"
        ]
      },
      {
        "id": "tail-03-q-58",
        "coreWord": "가을소풍",
        "word": "가을소풍",
        "answer": "도토리, 밤, 단풍잎",
        "targetWords": [
          "도토리",
          "밤",
          "단풍잎"
        ],
        "distractorPool": [
          "눈사람",
          "얼음",
          "썰매"
        ]
      },
      {
        "id": "tail-03-q-59",
        "coreWord": "여름물놀이",
        "word": "여름물놀이",
        "answer": "튜브, 수영복, 물총",
        "targetWords": [
          "튜브",
          "수영복",
          "물총"
        ],
        "distractorPool": [
          "목도리",
          "장갑",
          "패딩"
        ]
      },
      {
        "id": "tail-03-q-60",
        "coreWord": "겨울놀이",
        "word": "겨울놀이",
        "answer": "눈사람, 눈싸움, 썰매",
        "targetWords": [
          "눈사람",
          "눈싸움",
          "썰매"
        ],
        "distractorPool": [
          "모래놀이",
          "물총놀이",
          "수영"
        ]
      }
    ]
  },
  {
    "id": "tail-04",
    "title": "초등 01",
    "schoolLevelLabel": "01",
    "bandLabel": "초등",
    "descriptor": "집과가족",
    "grammarFocus": "집과가족",
    "goalCopy": "집과가족 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 29,
    "questions": [
      {
        "id": "tail-04-q-01",
        "coreWord": "가족",
        "word": "가족",
        "answer": "아빠, 엄마, 동생",
        "targetWords": [
          "아빠",
          "엄마",
          "동생"
        ],
        "distractorPool": [
          "선생님",
          "경찰관",
          "소방관"
        ]
      },
      {
        "id": "tail-04-q-02",
        "coreWord": "거실",
        "word": "거실",
        "answer": "소파, 텔레비전, 에어컨",
        "targetWords": [
          "소파",
          "텔레비전",
          "에어컨"
        ],
        "distractorPool": [
          "미끄럼틀",
          "칠판",
          "신호등"
        ]
      },
      {
        "id": "tail-04-q-03",
        "coreWord": "부엌",
        "word": "부엌",
        "answer": "냉장고, 식탁, 가스레인지",
        "targetWords": [
          "냉장고",
          "식탁",
          "가스레인지"
        ],
        "distractorPool": [
          "침대",
          "세면대",
          "책상"
        ]
      },
      {
        "id": "tail-04-q-04",
        "coreWord": "안방",
        "word": "안방",
        "answer": "침대, 이불, 베개",
        "targetWords": [
          "침대",
          "이불",
          "베개"
        ],
        "distractorPool": [
          "싱크대",
          "신발장",
          "변기"
        ]
      },
      {
        "id": "tail-04-q-05",
        "coreWord": "화장실",
        "word": "화장실",
        "answer": "세면대, 변기, 칫솔",
        "targetWords": [
          "세면대",
          "변기",
          "칫솔"
        ],
        "distractorPool": [
          "프라이팬",
          "텔레비전",
          "우산"
        ]
      },
      {
        "id": "tail-04-q-06",
        "coreWord": "옷",
        "word": "옷",
        "answer": "바지, 티셔츠, 양말",
        "targetWords": [
          "바지",
          "티셔츠",
          "양말"
        ],
        "distractorPool": [
          "안경",
          "시계",
          "반지"
        ]
      },
      {
        "id": "tail-04-q-07",
        "coreWord": "청소",
        "word": "청소",
        "answer": "빗자루, 쓰레받기, 진공청소기",
        "targetWords": [
          "빗자루",
          "쓰레받기",
          "진공청소기"
        ],
        "distractorPool": [
          "연필",
          "지우개",
          "가위"
        ]
      },
      {
        "id": "tail-04-q-08",
        "coreWord": "빨래",
        "word": "빨래",
        "answer": "세탁기, 건조기, 세제",
        "targetWords": [
          "세탁기",
          "건조기",
          "세제"
        ],
        "distractorPool": [
          "냉동고",
          "오븐",
          "식기세척기"
        ]
      },
      {
        "id": "tail-04-q-09",
        "coreWord": "식사",
        "word": "식사",
        "answer": "밥그릇, 국그릇, 숟가락",
        "targetWords": [
          "밥그릇",
          "국그릇",
          "숟가락"
        ],
        "distractorPool": [
          "크레파스",
          "붓",
          "도화지"
        ]
      },
      {
        "id": "tail-04-q-10",
        "coreWord": "목욕",
        "word": "목욕",
        "answer": "비누, 샴푸, 바디워시",
        "targetWords": [
          "비누",
          "샴푸",
          "바디워시"
        ],
        "distractorPool": [
          "간장",
          "고추장",
          "참기름"
        ]
      },
      {
        "id": "tail-04-q-11",
        "coreWord": "현관",
        "word": "현관",
        "answer": "현관문, 신발장, 우산꽂이",
        "targetWords": [
          "현관문",
          "신발장",
          "우산꽂이"
        ],
        "distractorPool": [
          "교탁",
          "칠판",
          "사물함"
        ]
      },
      {
        "id": "tail-04-q-12",
        "coreWord": "시간",
        "word": "시간",
        "answer": "아침, 점심, 저녁",
        "targetWords": [
          "아침",
          "점심",
          "저녁"
        ],
        "distractorPool": [
          "봄",
          "여름",
          "가을"
        ]
      },
      {
        "id": "tail-04-q-13",
        "coreWord": "친척",
        "word": "친척",
        "answer": "할아버지, 할머니, 삼촌",
        "targetWords": [
          "할아버지",
          "할머니",
          "삼촌"
        ],
        "distractorPool": [
          "점원",
          "기사님",
          "의사"
        ]
      },
      {
        "id": "tail-04-q-14",
        "coreWord": "반려동물",
        "word": "반려동물",
        "answer": "강아지, 고양이, 햄스터",
        "targetWords": [
          "강아지",
          "고양이",
          "햄스터"
        ],
        "distractorPool": [
          "호랑이",
          "사자",
          "코끼리"
        ]
      },
      {
        "id": "tail-04-q-15",
        "coreWord": "방",
        "word": "방",
        "answer": "거실, 안방, 다용도실",
        "targetWords": [
          "거실",
          "안방",
          "다용도실"
        ],
        "distractorPool": [
          "운동장",
          "도서관",
          "과학실"
        ]
      },
      {
        "id": "tail-04-q-16",
        "coreWord": "형제",
        "word": "형제",
        "answer": "오빠, 형, 언니",
        "targetWords": [
          "오빠",
          "형",
          "언니"
        ],
        "distractorPool": [
          "이웃",
          "손님",
          "아저씨"
        ]
      },
      {
        "id": "tail-04-q-17",
        "coreWord": "요리도구",
        "word": "요리도구",
        "answer": "냄비, 프라이팬, 도마",
        "targetWords": [
          "냄비",
          "프라이팬",
          "도마"
        ],
        "distractorPool": [
          "수건",
          "칫솔",
          "치약"
        ]
      },
      {
        "id": "tail-04-q-18",
        "coreWord": "신발",
        "word": "신발",
        "answer": "운동화, 장화, 슬리퍼",
        "targetWords": [
          "운동화",
          "장화",
          "슬리퍼"
        ],
        "distractorPool": [
          "모자",
          "장갑",
          "목도리"
        ]
      },
      {
        "id": "tail-04-q-19",
        "coreWord": "장난감",
        "word": "장난감",
        "answer": "블록, 인형, 로봇",
        "targetWords": [
          "블록",
          "인형",
          "로봇"
        ],
        "distractorPool": [
          "교과서",
          "공책",
          "연필"
        ]
      },
      {
        "id": "tail-04-q-20",
        "coreWord": "가구",
        "word": "가구",
        "answer": "옷장, 책상, 책장",
        "targetWords": [
          "옷장",
          "책상",
          "책장"
        ],
        "distractorPool": [
          "냉장고",
          "세탁기",
          "텔레비전"
        ]
      },
      {
        "id": "tail-04-q-21",
        "coreWord": "식기",
        "word": "식기",
        "answer": "젓가락, 포크, 접시",
        "targetWords": [
          "젓가락",
          "포크",
          "접시"
        ],
        "distractorPool": [
          "지우개",
          "가위",
          "색종이"
        ]
      },
      {
        "id": "tail-04-q-22",
        "coreWord": "조명",
        "word": "조명",
        "answer": "형광등, 스탠드, 무드등",
        "targetWords": [
          "형광등",
          "스탠드",
          "무드등"
        ],
        "distractorPool": [
          "세면대",
          "거울",
          "수건"
        ]
      },
      {
        "id": "tail-04-q-23",
        "coreWord": "창문",
        "word": "창문",
        "answer": "방충망, 커튼, 블라인드",
        "targetWords": [
          "방충망",
          "커튼",
          "블라인드"
        ],
        "distractorPool": [
          "현관문",
          "방문",
          "신발장"
        ]
      },
      {
        "id": "tail-04-q-24",
        "coreWord": "아침인사",
        "word": "아침인사",
        "answer": "안녕히주무셨어요, 좋은아침, 학교다녀오겠습니다",
        "targetWords": [
          "안녕히주무셨어요",
          "좋은아침",
          "학교다녀오겠습니다"
        ],
        "distractorPool": [
          "안녕히계세요",
          "잘자",
          "다녀왔습니다"
        ]
      },
      {
        "id": "tail-04-q-25",
        "coreWord": "저녁인사",
        "word": "저녁인사",
        "answer": "다녀왔습니다, 안녕히주무세요, 내일봬요",
        "targetWords": [
          "다녀왔습니다",
          "안녕히주무세요",
          "내일봬요"
        ],
        "distractorPool": [
          "학교다녀오겠습니다",
          "좋은아침",
          "잘다녀와"
        ]
      },
      {
        "id": "tail-04-q-26",
        "coreWord": "바닥청소",
        "word": "바닥청소",
        "answer": "물걸레, 막대걸레, 로봇청소기",
        "targetWords": [
          "물걸레",
          "막대걸레",
          "로봇청소기"
        ],
        "distractorPool": [
          "수세미",
          "행주",
          "칫솔"
        ]
      },
      {
        "id": "tail-04-q-27",
        "coreWord": "쓰레기",
        "word": "쓰레기",
        "answer": "종량제봉투, 휴지통, 분리수거함",
        "targetWords": [
          "종량제봉투",
          "휴지통",
          "분리수거함"
        ],
        "distractorPool": [
          "서랍장",
          "보석함",
          "저금통"
        ]
      },
      {
        "id": "tail-04-q-28",
        "coreWord": "씻는물건",
        "word": "씻는물건",
        "answer": "수건, 때타월, 양치컵",
        "targetWords": [
          "수건",
          "때타월",
          "양치컵"
        ],
        "distractorPool": [
          "냄비",
          "국자",
          "도마"
        ]
      },
      {
        "id": "tail-04-q-29",
        "coreWord": "잠자리",
        "word": "잠자리",
        "answer": "매트리스, 잠옷, 수면안대",
        "targetWords": [
          "매트리스",
          "잠옷",
          "수면안대"
        ],
        "distractorPool": [
          "외출복",
          "모자",
          "선글라스"
        ]
      },
      {
        "id": "tail-04-q-30",
        "coreWord": "냉장고속",
        "word": "냉장고속",
        "answer": "반찬통, 물병, 달걀",
        "targetWords": [
          "반찬통",
          "물병",
          "달걀"
        ],
        "distractorPool": [
          "신발",
          "양말",
          "책"
        ]
      },
      {
        "id": "tail-04-q-31",
        "coreWord": "취미",
        "word": "취미",
        "answer": "독서, 그림그리기, 블록놀이",
        "targetWords": [
          "독서",
          "그림그리기",
          "블록놀이"
        ],
        "distractorPool": [
          "심부름",
          "양치",
          "세수"
        ]
      },
      {
        "id": "tail-04-q-32",
        "coreWord": "간식",
        "word": "간식",
        "answer": "과일, 과자, 우유",
        "targetWords": [
          "과일",
          "과자",
          "우유"
        ],
        "distractorPool": [
          "된장국",
          "김치",
          "밥"
        ]
      },
      {
        "id": "tail-04-q-33",
        "coreWord": "휴식",
        "word": "휴식",
        "answer": "소파, 쿠션, 안마의자",
        "targetWords": [
          "소파",
          "쿠션",
          "안마의자"
        ],
        "distractorPool": [
          "식탁",
          "싱크대",
          "세탁기"
        ]
      },
      {
        "id": "tail-04-q-34",
        "coreWord": "미용",
        "word": "미용",
        "answer": "거울, 빗, 헤어드라이어",
        "targetWords": [
          "거울",
          "빗",
          "헤어드라이어"
        ],
        "distractorPool": [
          "청소기",
          "세탁기",
          "전자레인지"
        ]
      },
      {
        "id": "tail-04-q-35",
        "coreWord": "양념",
        "word": "양념",
        "answer": "소금, 설탕, 간장",
        "targetWords": [
          "소금",
          "설탕",
          "간장"
        ],
        "distractorPool": [
          "비누",
          "샴푸",
          "린스"
        ]
      },
      {
        "id": "tail-04-q-36",
        "coreWord": "그릇씻기",
        "word": "그릇씻기",
        "answer": "주방세제, 수세미, 고무장갑",
        "targetWords": [
          "주방세제",
          "수세미",
          "고무장갑"
        ],
        "distractorPool": [
          "세탁세제",
          "섬유유연제",
          "빗자루"
        ]
      },
      {
        "id": "tail-04-q-37",
        "coreWord": "외출준비",
        "word": "외출준비",
        "answer": "가방, 외투, 마스크",
        "targetWords": [
          "가방",
          "외투",
          "마스크"
        ],
        "distractorPool": [
          "잠옷",
          "이불",
          "베개"
        ]
      },
      {
        "id": "tail-04-q-38",
        "coreWord": "비오는날",
        "word": "비오는날",
        "answer": "우산, 우비, 장화",
        "targetWords": [
          "우산",
          "우비",
          "장화"
        ],
        "distractorPool": [
          "선글라스",
          "샌들",
          "밀짚모자"
        ]
      },
      {
        "id": "tail-04-q-39",
        "coreWord": "추운날",
        "word": "추운날",
        "answer": "핫팩, 장갑, 목도리",
        "targetWords": [
          "핫팩",
          "장갑",
          "목도리"
        ],
        "distractorPool": [
          "부채",
          "선풍기",
          "반팔티"
        ]
      },
      {
        "id": "tail-04-q-40",
        "coreWord": "식탁위",
        "word": "식탁위",
        "answer": "컵, 물티슈, 냅킨",
        "targetWords": [
          "컵",
          "물티슈",
          "냅킨"
        ],
        "distractorPool": [
          "비누",
          "샴푸",
          "때타월"
        ]
      },
      {
        "id": "tail-04-q-41",
        "coreWord": "옷정리",
        "word": "옷정리",
        "answer": "옷걸이, 서랍장, 빨래바구니",
        "targetWords": [
          "옷걸이",
          "서랍장",
          "빨래바구니"
        ],
        "distractorPool": [
          "신발장",
          "우산꽂이",
          "식기건조대"
        ]
      },
      {
        "id": "tail-04-q-42",
        "coreWord": "놀이공간",
        "word": "놀이공간",
        "answer": "놀이방, 텐트, 매트",
        "targetWords": [
          "놀이방",
          "텐트",
          "매트"
        ],
        "distractorPool": [
          "싱크대",
          "세면대",
          "가스레인지"
        ]
      },
      {
        "id": "tail-04-q-43",
        "coreWord": "벽장식",
        "word": "벽장식",
        "answer": "액자, 시계, 달력",
        "targetWords": [
          "액자",
          "시계",
          "달력"
        ],
        "distractorPool": [
          "카펫",
          "러그",
          "발매트"
        ]
      },
      {
        "id": "tail-04-q-44",
        "coreWord": "바닥장식",
        "word": "바닥장식",
        "answer": "카펫, 러그, 발매트",
        "targetWords": [
          "카펫",
          "러그",
          "발매트"
        ],
        "distractorPool": [
          "액자",
          "시계",
          "달력"
        ]
      },
      {
        "id": "tail-04-q-45",
        "coreWord": "여름가전",
        "word": "여름가전",
        "answer": "선풍기, 에어컨, 제습기",
        "targetWords": [
          "선풍기",
          "에어컨",
          "제습기"
        ],
        "distractorPool": [
          "난로",
          "전기장판",
          "가습기"
        ]
      },
      {
        "id": "tail-04-q-46",
        "coreWord": "겨울가전",
        "word": "겨울가전",
        "answer": "보일러, 난로, 전기장판",
        "targetWords": [
          "보일러",
          "난로",
          "전기장판"
        ],
        "distractorPool": [
          "에어컨",
          "선풍기",
          "제습기"
        ]
      },
      {
        "id": "tail-04-q-47",
        "coreWord": "식재료",
        "word": "식재료",
        "answer": "쌀, 채소, 고기",
        "targetWords": [
          "쌀",
          "채소",
          "고기"
        ],
        "distractorPool": [
          "비누",
          "세제",
          "샴푸"
        ]
      },
      {
        "id": "tail-04-q-48",
        "coreWord": "홈카페",
        "word": "홈카페",
        "answer": "머그컵, 티스푼, 쟁반",
        "targetWords": [
          "머그컵",
          "티스푼",
          "쟁반"
        ],
        "distractorPool": [
          "칫솔",
          "수건",
          "빗"
        ]
      },
      {
        "id": "tail-04-q-49",
        "coreWord": "안전용품",
        "word": "안전용품",
        "answer": "구급상자, 반창고, 연고",
        "targetWords": [
          "구급상자",
          "반창고",
          "연고"
        ],
        "distractorPool": [
          "장난감",
          "인형",
          "게임기"
        ]
      },
      {
        "id": "tail-04-q-50",
        "coreWord": "소독",
        "word": "소독",
        "answer": "손소독제, 체온계, 마스크",
        "targetWords": [
          "손소독제",
          "체온계",
          "마스크"
        ],
        "distractorPool": [
          "색연필",
          "지우개",
          "자"
        ]
      },
      {
        "id": "tail-04-q-51",
        "coreWord": "아기용품",
        "word": "아기용품",
        "answer": "젖병, 기저귀, 유모차",
        "targetWords": [
          "젖병",
          "기저귀",
          "유모차"
        ],
        "distractorPool": [
          "자전거",
          "인라인",
          "킥보드"
        ]
      },
      {
        "id": "tail-04-q-52",
        "coreWord": "정리용품",
        "word": "정리용품",
        "answer": "수납장, 바구니, 리빙박스",
        "targetWords": [
          "수납장",
          "바구니",
          "리빙박스"
        ],
        "distractorPool": [
          "냄비",
          "프라이팬",
          "식칼"
        ]
      },
      {
        "id": "tail-04-q-53",
        "coreWord": "정보기기",
        "word": "정보기기",
        "answer": "스마트폰, 태블릿, 컴퓨터",
        "targetWords": [
          "스마트폰",
          "태블릿",
          "컴퓨터"
        ],
        "distractorPool": [
          "냉장고",
          "세탁기",
          "건조기"
        ]
      },
      {
        "id": "tail-04-q-54",
        "coreWord": "음악",
        "word": "음악",
        "answer": "피아노, 리코더, 장난감마이크",
        "targetWords": [
          "피아노",
          "리코더",
          "장난감마이크"
        ],
        "distractorPool": [
          "야구공",
          "축구공",
          "줄넘기"
        ]
      },
      {
        "id": "tail-04-q-55",
        "coreWord": "다과",
        "word": "다과",
        "answer": "과일접시, 포크, 주스",
        "targetWords": [
          "과일접시",
          "포크",
          "주스"
        ],
        "distractorPool": [
          "밥그릇",
          "국그릇",
          "숟가락"
        ]
      },
      {
        "id": "tail-04-q-56",
        "coreWord": "바느질",
        "word": "바느질",
        "answer": "바늘, 실, 가위",
        "targetWords": [
          "바늘",
          "실",
          "가위"
        ],
        "distractorPool": [
          "망치",
          "못",
          "드라이버"
        ]
      },
      {
        "id": "tail-04-q-57",
        "coreWord": "공구",
        "word": "공구",
        "answer": "망치, 드라이버, 못",
        "targetWords": [
          "망치",
          "드라이버",
          "못"
        ],
        "distractorPool": [
          "바늘",
          "실",
          "줄자"
        ]
      },
      {
        "id": "tail-04-q-58",
        "coreWord": "벌레퇴치",
        "word": "벌레퇴치",
        "answer": "파리채, 모기장, 모기향",
        "targetWords": [
          "파리채",
          "모기장",
          "모기향"
        ],
        "distractorPool": [
          "선풍기",
          "에어컨",
          "보일러"
        ]
      },
      {
        "id": "tail-04-q-59",
        "coreWord": "명절가족",
        "word": "명절가족",
        "answer": "이모, 고모, 외삼촌",
        "targetWords": [
          "이모",
          "고모",
          "외삼촌"
        ],
        "distractorPool": [
          "선생님",
          "친구",
          "이웃"
        ]
      },
      {
        "id": "tail-04-q-60",
        "coreWord": "화장대",
        "word": "화장대",
        "answer": "로션, 립스틱, 면봉",
        "targetWords": [
          "로션",
          "립스틱",
          "면봉"
        ],
        "distractorPool": [
          "치약",
          "비누",
          "바디워시"
        ]
      }
    ]
  },
  {
    "id": "tail-05",
    "title": "초등 02",
    "schoolLevelLabel": "02",
    "bandLabel": "초등",
    "descriptor": "놀이터와동네",
    "grammarFocus": "놀이터와동네",
    "goalCopy": "놀이터와동네 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 29,
    "questions": [
      {
        "id": "tail-05-q-01",
        "coreWord": "놀이기구",
        "word": "놀이기구",
        "answer": "그네, 시소, 미끄럼틀",
        "targetWords": [
          "그네",
          "시소",
          "미끄럼틀"
        ],
        "distractorPool": [
          "케이블카",
          "잠수함",
          "비행기"
        ]
      },
      {
        "id": "tail-05-q-02",
        "coreWord": "놀이",
        "word": "놀이",
        "answer": "숨바꼭질, 술래잡기, 얼음땡",
        "targetWords": [
          "숨바꼭질",
          "술래잡기",
          "얼음땡"
        ],
        "distractorPool": [
          "독서",
          "시험",
          "청소"
        ]
      },
      {
        "id": "tail-05-q-03",
        "coreWord": "상점",
        "word": "상점",
        "answer": "미용실, 빵집, 슈퍼마켓",
        "targetWords": [
          "미용실",
          "빵집",
          "슈퍼마켓"
        ],
        "distractorPool": [
          "안방",
          "거실",
          "화장실"
        ]
      },
      {
        "id": "tail-05-q-04",
        "coreWord": "동네사람",
        "word": "동네사람",
        "answer": "이웃, 동네친구, 경비아저씨",
        "targetWords": [
          "이웃",
          "동네친구",
          "경비아저씨"
        ],
        "distractorPool": [
          "외계인",
          "로봇",
          "투명인간"
        ]
      },
      {
        "id": "tail-05-q-05",
        "coreWord": "공원",
        "word": "공원",
        "answer": "벤치, 가로등, 산책로",
        "targetWords": [
          "벤치",
          "가로등",
          "산책로"
        ],
        "distractorPool": [
          "고속도로",
          "활주로",
          "철로"
        ]
      },
      {
        "id": "tail-05-q-06",
        "coreWord": "타는것",
        "word": "타는것",
        "answer": "자전거, 킥보드, 인라인스케이트",
        "targetWords": [
          "자전거",
          "킥보드",
          "인라인스케이트"
        ],
        "distractorPool": [
          "여객선",
          "헬리콥터",
          "우주선"
        ]
      },
      {
        "id": "tail-05-q-07",
        "coreWord": "길건너기",
        "word": "길건너기",
        "answer": "횡단보도, 신호등, 정지선",
        "targetWords": [
          "횡단보도",
          "신호등",
          "정지선"
        ],
        "distractorPool": [
          "무지개",
          "구름",
          "번개"
        ]
      },
      {
        "id": "tail-05-q-08",
        "coreWord": "공공기관",
        "word": "공공기관",
        "answer": "경찰서, 소방서, 우체국",
        "targetWords": [
          "경찰서",
          "소방서",
          "우체국"
        ],
        "distractorPool": [
          "놀이공원",
          "동물원",
          "영화관"
        ]
      },
      {
        "id": "tail-05-q-09",
        "coreWord": "새",
        "word": "새",
        "answer": "참새, 까치, 비둘기",
        "targetWords": [
          "참새",
          "까치",
          "비둘기"
        ],
        "distractorPool": [
          "타조",
          "펭귄",
          "독수리"
        ]
      },
      {
        "id": "tail-05-q-10",
        "coreWord": "바닥",
        "word": "바닥",
        "answer": "모래, 흙, 자갈",
        "targetWords": [
          "모래",
          "흙",
          "자갈"
        ],
        "distractorPool": [
          "구름",
          "별",
          "달"
        ]
      },
      {
        "id": "tail-05-q-11",
        "coreWord": "구기종목",
        "word": "구기종목",
        "answer": "축구, 피구, 농구",
        "targetWords": [
          "축구",
          "피구",
          "농구"
        ],
        "distractorPool": [
          "바둑",
          "체스",
          "숨바꼭질"
        ]
      },
      {
        "id": "tail-05-q-12",
        "coreWord": "식물",
        "word": "식물",
        "answer": "나무, 꽃, 풀",
        "targetWords": [
          "나무",
          "꽃",
          "풀"
        ],
        "distractorPool": [
          "플라스틱",
          "유리",
          "고무"
        ]
      },
      {
        "id": "tail-05-q-13",
        "coreWord": "길",
        "word": "길",
        "answer": "골목길, 공터, 담벼락",
        "targetWords": [
          "골목길",
          "공터",
          "담벼락"
        ],
        "distractorPool": [
          "우주정거장",
          "공항",
          "항구"
        ]
      },
      {
        "id": "tail-05-q-14",
        "coreWord": "간식",
        "word": "간식",
        "answer": "아이스크림, 떡볶이, 솜사탕",
        "targetWords": [
          "아이스크림",
          "떡볶이",
          "솜사탕"
        ],
        "distractorPool": [
          "된장찌개",
          "비빔밥",
          "김치"
        ]
      },
      {
        "id": "tail-05-q-15",
        "coreWord": "치료",
        "word": "치료",
        "answer": "병원, 약국, 보건소",
        "targetWords": [
          "병원",
          "약국",
          "보건소"
        ],
        "distractorPool": [
          "문구점",
          "장난감가게",
          "피시방"
        ]
      },
      {
        "id": "tail-05-q-16",
        "coreWord": "모래놀이",
        "word": "모래놀이",
        "answer": "모래성, 삽, 양동이",
        "targetWords": [
          "모래성",
          "삽",
          "양동이"
        ],
        "distractorPool": [
          "컴퓨터",
          "스마트폰",
          "텔레비전"
        ]
      },
      {
        "id": "tail-05-q-17",
        "coreWord": "모험놀이",
        "word": "모험놀이",
        "answer": "정글짐, 구름사다리, 철봉",
        "targetWords": [
          "정글짐",
          "구름사다리",
          "철봉"
        ],
        "distractorPool": [
          "소파",
          "침대",
          "식탁"
        ]
      },
      {
        "id": "tail-05-q-18",
        "coreWord": "탈것안전",
        "word": "탈것안전",
        "answer": "헬멧, 무릎보호대, 팔꿈치보호대",
        "targetWords": [
          "헬멧",
          "무릎보호대",
          "팔꿈치보호대"
        ],
        "distractorPool": [
          "선글라스",
          "목도리",
          "넥타이"
        ]
      },
      {
        "id": "tail-05-q-19",
        "coreWord": "교통수단",
        "word": "교통수단",
        "answer": "시내버스, 택시, 마마을버스",
        "targetWords": [
          "시내버스",
          "택시",
          "마마을버스"
        ],
        "distractorPool": [
          "우주선",
          "로켓",
          "비행접시"
        ]
      },
      {
        "id": "tail-05-q-20",
        "coreWord": "간식가게",
        "word": "간식가게",
        "answer": "분식집, 아이스크림가게, 떡집",
        "targetWords": [
          "분식집",
          "아이스크림가게",
          "떡집"
        ],
        "distractorPool": [
          "철물점",
          "세탁소",
          "미용실"
        ]
      },
      {
        "id": "tail-05-q-21",
        "coreWord": "학원",
        "word": "학원",
        "answer": "피아노학원, 태권도장, 미술학원",
        "targetWords": [
          "피아노학원",
          "태권도장",
          "미술학원"
        ],
        "distractorPool": [
          "경찰서",
          "소방서",
          "동사무소"
        ]
      },
      {
        "id": "tail-05-q-22",
        "coreWord": "심부름",
        "word": "심부름",
        "answer": "두부사오기, 쓰레기버리기, 우유사오기",
        "targetWords": [
          "두부사오기",
          "쓰레기버리기",
          "우유사오기"
        ],
        "distractorPool": [
          "게임하기",
          "늦잠자기",
          "장난치기"
        ]
      },
      {
        "id": "tail-05-q-23",
        "coreWord": "동네곤충",
        "word": "동네곤충",
        "answer": "개미, 나비, 잠자리",
        "targetWords": [
          "개미",
          "나비",
          "잠자리"
        ],
        "distractorPool": [
          "상어",
          "고래",
          "거북이"
        ]
      },
      {
        "id": "tail-05-q-24",
        "coreWord": "동네동물",
        "word": "동네동물",
        "answer": "길고양이, 산비둘기, 떠돌이개",
        "targetWords": [
          "길고양이",
          "산비둘기",
          "떠돌이개"
        ],
        "distractorPool": [
          "기린",
          "코끼리",
          "얼룩말"
        ]
      },
      {
        "id": "tail-05-q-25",
        "coreWord": "산책",
        "word": "산책",
        "answer": "목줄, 배변봉투, 강아지",
        "targetWords": [
          "목줄",
          "배변봉투",
          "강아지"
        ],
        "distractorPool": [
          "교과서",
          "필통",
          "알림장"
        ]
      },
      {
        "id": "tail-05-q-26",
        "coreWord": "찻길",
        "word": "찻길",
        "answer": "차도, 중앙선, 과속방지턱",
        "targetWords": [
          "차도",
          "중앙선",
          "과속방지턱"
        ],
        "distractorPool": [
          "인도",
          "산책로",
          "등산로"
        ]
      },
      {
        "id": "tail-05-q-27",
        "coreWord": "보행길",
        "word": "보행길",
        "answer": "인도, 보도블록, 육교",
        "targetWords": [
          "인도",
          "보도블록",
          "육교"
        ],
        "distractorPool": [
          "차도",
          "고속도로",
          "터널"
        ]
      },
      {
        "id": "tail-05-q-28",
        "coreWord": "날씨알림",
        "word": "날씨알림",
        "answer": "우산, 장화, 빗웅덩이",
        "targetWords": [
          "우산",
          "장화",
          "빗웅덩이"
        ],
        "distractorPool": [
          "수영복",
          "튜브",
          "모래사장"
        ]
      },
      {
        "id": "tail-05-q-29",
        "coreWord": "동네풍경",
        "word": "동네풍경",
        "answer": "전봇대, 표지판, 쓰레기통",
        "targetWords": [
          "전봇대",
          "표지판",
          "쓰레기통"
        ],
        "distractorPool": [
          "침대",
          "식탁",
          "책상"
        ]
      },
      {
        "id": "tail-05-q-30",
        "coreWord": "놀이터바닥",
        "word": "놀이터바닥",
        "answer": "푹신한고무, 모래밭, 우레탄",
        "targetWords": [
          "푹신한고무",
          "모래밭",
          "우레탄"
        ],
        "distractorPool": [
          "대리석",
          "장판",
          "타일"
        ]
      },
      {
        "id": "tail-05-q-31",
        "coreWord": "식사배달",
        "word": "식사배달",
        "answer": "치킨, 피자, 짜장면",
        "targetWords": [
          "치킨",
          "피자",
          "짜장면"
        ],
        "distractorPool": [
          "연필",
          "지우개",
          "색종이"
        ]
      },
      {
        "id": "tail-05-q-32",
        "coreWord": "동네병원",
        "word": "동네병원",
        "answer": "소아과, 치과, 안과",
        "targetWords": [
          "소아과",
          "치과",
          "안과"
        ],
        "distractorPool": [
          "정육점",
          "과일가게",
          "생선가게"
        ]
      },
      {
        "id": "tail-05-q-33",
        "coreWord": "물건사기",
        "word": "물건사기",
        "answer": "문구점, 서점, 옷가게",
        "targetWords": [
          "문구점",
          "서점",
          "옷가게"
        ],
        "distractorPool": [
          "경찰서",
          "소방서",
          "보건소"
        ]
      },
      {
        "id": "tail-05-q-34",
        "coreWord": "청결유지",
        "word": "청결유지",
        "answer": "공중화장실, 세면대, 비누",
        "targetWords": [
          "공중화장실",
          "세면대",
          "비누"
        ],
        "distractorPool": [
          "모래밭",
          "진흙",
          "흙탕물"
        ]
      },
      {
        "id": "tail-05-q-35",
        "coreWord": "휴식공간",
        "word": "휴식공간",
        "answer": "정자, 벤치, 파라솔",
        "targetWords": [
          "정자",
          "벤치",
          "파라솔"
        ],
        "distractorPool": [
          "도로",
          "차선",
          "횡단보도"
        ]
      },
      {
        "id": "tail-05-q-36",
        "coreWord": "동네운동",
        "word": "동네운동",
        "answer": "배드민턴, 줄넘기, 달리기",
        "targetWords": [
          "배드민턴",
          "줄넘기",
          "달리기"
        ],
        "distractorPool": [
          "잠자기",
          "텔레비전보기",
          "밥먹기"
        ]
      },
      {
        "id": "tail-05-q-37",
        "coreWord": "자전거용품",
        "word": "자전거용품",
        "answer": "자전거벨, 바구니, 페달",
        "targetWords": [
          "자전거벨",
          "바구니",
          "페달"
        ],
        "distractorPool": [
          "리모컨",
          "마우스",
          "키보드"
        ]
      },
      {
        "id": "tail-05-q-38",
        "coreWord": "놀이터소리",
        "word": "놀이터소리",
        "answer": "웃음소리, 발소리, 왁자지껄",
        "targetWords": [
          "웃음소리",
          "발소리",
          "왁자지껄"
        ],
        "distractorPool": [
          "코고는소리",
          "하품소리",
          "자장가"
        ]
      },
      {
        "id": "tail-05-q-39",
        "coreWord": "쓰레기버리기",
        "word": "쓰레기버리기",
        "answer": "재활용장, 헌옷수거함, 음식물쓰레기통",
        "targetWords": [
          "재활용장",
          "헌옷수거함",
          "음식물쓰레기통"
        ],
        "distractorPool": [
          "우체통",
          "현금인출기",
          "공중전화"
        ]
      },
      {
        "id": "tail-05-q-40",
        "coreWord": "동네축제",
        "word": "동네축제",
        "answer": "벼룩시장, 체육대회, 야시장",
        "targetWords": [
          "벼룩시장",
          "체육대회",
          "야시장"
        ],
        "distractorPool": [
          "장례식",
          "제사",
          "시험"
        ]
      },
      {
        "id": "tail-05-q-41",
        "coreWord": "동네친구",
        "word": "동네친구",
        "answer": "소꿉친구, 유치원친구, 옆집친구",
        "targetWords": [
          "소꿉친구",
          "유치원친구",
          "옆집친구"
        ],
        "distractorPool": [
          "도둑",
          "외계인",
          "괴물"
        ]
      },
      {
        "id": "tail-05-q-42",
        "coreWord": "위험한곳",
        "word": "위험한곳",
        "answer": "공사장, 차도, 으슥한골목",
        "targetWords": [
          "공사장",
          "차도",
          "으슥한골목"
        ],
        "distractorPool": [
          "놀이터",
          "공원",
          "도서관"
        ]
      },
      {
        "id": "tail-05-q-43",
        "coreWord": "안내",
        "word": "안내",
        "answer": "이정표, 지도, 방향표시",
        "targetWords": [
          "이정표",
          "지도",
          "방향표시"
        ],
        "distractorPool": [
          "만화책",
          "동화책",
          "일기장"
        ]
      },
      {
        "id": "tail-05-q-44",
        "coreWord": "경찰",
        "word": "경찰",
        "answer": "순찰차, 호루라기, 제복",
        "targetWords": [
          "순찰차",
          "호루라기",
          "제복"
        ],
        "distractorPool": [
          "소방차",
          "구급차",
          "청소차"
        ]
      },
      {
        "id": "tail-05-q-45",
        "coreWord": "소방",
        "word": "소방",
        "answer": "소방차, 사이렌, 소화전",
        "targetWords": [
          "소방차",
          "사이렌",
          "소화전"
        ],
        "distractorPool": [
          "경찰차",
          "택시",
          "자전거"
        ]
      },
      {
        "id": "tail-05-q-46",
        "coreWord": "우편",
        "word": "우편",
        "answer": "우체통, 집배원, 편지",
        "targetWords": [
          "우체통",
          "집배원",
          "편지"
        ],
        "distractorPool": [
          "의사",
          "간호사",
          "주사기"
        ]
      },
      {
        "id": "tail-05-q-47",
        "coreWord": "동네여름",
        "word": "동네여름",
        "answer": "매미소리, 아이스크림, 그늘",
        "targetWords": [
          "매미소리",
          "아이스크림",
          "그늘"
        ],
        "distractorPool": [
          "눈사람",
          "고드름",
          "붕어빵"
        ]
      },
      {
        "id": "tail-05-q-48",
        "coreWord": "동네겨울",
        "word": "동네겨울",
        "answer": "눈싸움, 썰매, 붕어빵",
        "targetWords": [
          "눈싸움",
          "썰매",
          "붕어빵"
        ],
        "distractorPool": [
          "수영장",
          "모기",
          "매미"
        ]
      },
      {
        "id": "tail-05-q-49",
        "coreWord": "봄꽃",
        "word": "봄꽃",
        "answer": "벚꽃, 개나리, 목련",
        "targetWords": [
          "벚꽃",
          "개나리",
          "목련"
        ],
        "distractorPool": [
          "단풍",
          "낙엽",
          "눈꽃"
        ]
      },
      {
        "id": "tail-05-q-50",
        "coreWord": "가을풍경",
        "word": "가을풍경",
        "answer": "단풍나무, 은행나무, 낙엽",
        "targetWords": [
          "단풍나무",
          "은행나무",
          "낙엽"
        ],
        "distractorPool": [
          "새싹",
          "아지랑이",
          "매미"
        ]
      },
      {
        "id": "tail-05-q-51",
        "coreWord": "아파트",
        "word": "아파트",
        "answer": "엘리베이터, 계단, 경비실",
        "targetWords": [
          "엘리베이터",
          "계단",
          "경비실"
        ],
        "distractorPool": [
          "에스컬레이터",
          "탑승구",
          "개찰구"
        ]
      },
      {
        "id": "tail-05-q-52",
        "coreWord": "주택가",
        "word": "주택가",
        "answer": "대문, 마당, 담장",
        "targetWords": [
          "대문",
          "마당",
          "담장"
        ],
        "distractorPool": [
          "엘리베이터",
          "고층",
          "베란다"
        ]
      },
      {
        "id": "tail-05-q-53",
        "coreWord": "분리수거",
        "word": "분리수거",
        "answer": "플라스틱, 종이, 캔",
        "targetWords": [
          "플라스틱",
          "종이",
          "캔"
        ],
        "distractorPool": [
          "밥",
          "국",
          "반찬"
        ]
      },
      {
        "id": "tail-05-q-54",
        "coreWord": "간식거리",
        "word": "간식거리",
        "answer": "호떡, 핫도그, 붕어빵",
        "targetWords": [
          "호떡",
          "핫도그",
          "붕어빵"
        ],
        "distractorPool": [
          "김치",
          "된장",
          "고추장"
        ]
      },
      {
        "id": "tail-05-q-55",
        "coreWord": "인사",
        "word": "인사",
        "answer": "안녕하세요, 고맙습니다, 수고하세요",
        "targetWords": [
          "안녕하세요",
          "고맙습니다",
          "수고하세요"
        ],
        "distractorPool": [
          "싫어요",
          "미워요",
          "저리가요"
        ]
      },
      {
        "id": "tail-05-q-56",
        "coreWord": "약속",
        "word": "약속",
        "answer": "놀이터에서만나, 이따가봐, 내일놀자",
        "targetWords": [
          "놀이터에서만나",
          "이따가봐",
          "내일놀자"
        ],
        "distractorPool": [
          "다시는보지마",
          "절교야",
          "미워"
        ]
      },
      {
        "id": "tail-05-q-57",
        "coreWord": "장난",
        "word": "장난",
        "answer": "간지럼피우기, 그림자밟기, 무궁화꽃이피었습니다",
        "targetWords": [
          "간지럼피우기",
          "그림자밟기",
          "무궁화꽃이피었습니다"
        ],
        "distractorPool": [
          "숙제하기",
          "일기쓰기",
          "시험보기"
        ]
      },
      {
        "id": "tail-05-q-58",
        "coreWord": "놀이터물건",
        "word": "놀이터물건",
        "answer": "주운돌멩이, 나뭇가지, 나뭇잎",
        "targetWords": [
          "주운돌멩이",
          "나뭇가지",
          "나뭇잎"
        ],
        "distractorPool": [
          "다이아몬드",
          "금반지",
          "지폐"
        ]
      },
      {
        "id": "tail-05-q-59",
        "coreWord": "동네슈퍼",
        "word": "동네슈퍼",
        "answer": "과자, 음료수, 라면",
        "targetWords": [
          "과자",
          "음료수",
          "라면"
        ],
        "distractorPool": [
          "자동차",
          "냉장고",
          "텔레비전"
        ]
      },
      {
        "id": "tail-05-q-60",
        "coreWord": "공원풍경",
        "word": "공원풍경",
        "answer": "잔디밭, 분수대, 비둘기",
        "targetWords": [
          "잔디밭",
          "분수대",
          "비둘기"
        ],
        "distractorPool": [
          "차도",
          "터널",
          "주유소"
        ]
      }
    ]
  },
  {
    "id": "tail-06",
    "title": "초등 03",
    "schoolLevelLabel": "03",
    "bandLabel": "초등",
    "descriptor": "감정과상태",
    "grammarFocus": "감정과상태",
    "goalCopy": "감정과상태 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 29,
    "questions": [
      {
        "id": "tail-06-q-01",
        "coreWord": "기쁨",
        "word": "기쁨",
        "answer": "즐거움, 신남, 환희",
        "targetWords": [
          "즐거움",
          "신남",
          "환희"
        ],
        "distractorPool": [
          "우울",
          "슬픔",
          "분노"
        ]
      },
      {
        "id": "tail-06-q-02",
        "coreWord": "슬픔",
        "word": "슬픔",
        "answer": "우울함, 서운함, 속상함",
        "targetWords": [
          "우울함",
          "서운함",
          "속상함"
        ],
        "distractorPool": [
          "뿌듯함",
          "통쾌함",
          "짜릿함"
        ]
      },
      {
        "id": "tail-06-q-03",
        "coreWord": "놀람",
        "word": "놀람",
        "answer": "당황, 경악, 화들짝",
        "targetWords": [
          "당황",
          "경악",
          "화들짝"
        ],
        "distractorPool": [
          "편안함",
          "안도감",
          "차분함"
        ]
      },
      {
        "id": "tail-06-q-04",
        "coreWord": "피로",
        "word": "피로",
        "answer": "졸림, 지침, 피곤함",
        "targetWords": [
          "졸림",
          "지침",
          "피곤함"
        ],
        "distractorPool": [
          "상쾌함",
          "개운함",
          "쌩쌩함"
        ]
      },
      {
        "id": "tail-06-q-05",
        "coreWord": "미각",
        "word": "미각",
        "answer": "맵다, 짜다, 달다",
        "targetWords": [
          "맵다",
          "짜다",
          "달다"
        ],
        "distractorPool": [
          "뜨겁다",
          "차갑다",
          "미지근하다"
        ]
      },
      {
        "id": "tail-06-q-06",
        "coreWord": "온도",
        "word": "온도",
        "answer": "따뜻하다, 시원하다, 차갑다",
        "targetWords": [
          "따뜻하다",
          "시원하다",
          "차갑다"
        ],
        "distractorPool": [
          "불쾌하다",
          "찝찝하다",
          "아프다"
        ]
      },
      {
        "id": "tail-06-q-07",
        "coreWord": "촉감",
        "word": "촉감",
        "answer": "부드럽다, 매끄럽다, 푹신하다",
        "targetWords": [
          "부드럽다",
          "매끄럽다",
          "푹신하다"
        ],
        "distractorPool": [
          "딱딱하다",
          "거칠다",
          "뾰족하다"
        ]
      },
      {
        "id": "tail-06-q-08",
        "coreWord": "분노",
        "word": "분노",
        "answer": "화나다, 짜증나다, 억울하다",
        "targetWords": [
          "화나다",
          "짜증나다",
          "억울하다"
        ],
        "distractorPool": [
          "자랑스럽다",
          "대견하다",
          "기쁘다"
        ]
      },
      {
        "id": "tail-06-q-09",
        "coreWord": "웃음",
        "word": "웃음",
        "answer": "미소, 폭소, 환호",
        "targetWords": [
          "미소",
          "폭소",
          "환호"
        ],
        "distractorPool": [
          "오열",
          "눈물",
          "통곡"
        ]
      },
      {
        "id": "tail-06-q-10",
        "coreWord": "기대",
        "word": "기대",
        "answer": "설렘, 두근거림, 벅참",
        "targetWords": [
          "설렘",
          "두근거림",
          "벅참"
        ],
        "distractorPool": [
          "지루함",
          "따분함",
          "귀찮음"
        ]
      },
      {
        "id": "tail-06-q-11",
        "coreWord": "시각",
        "word": "시각",
        "answer": "캄캄하다, 어둡다, 환하다",
        "targetWords": [
          "캄캄하다",
          "어둡다",
          "환하다"
        ],
        "distractorPool": [
          "시끄럽다",
          "조용하다",
          "구수하다"
        ]
      },
      {
        "id": "tail-06-q-12",
        "coreWord": "고통",
        "word": "고통",
        "answer": "아프다, 쓰라리다, 따갑다",
        "targetWords": [
          "아프다",
          "쓰라리다",
          "따갑다"
        ],
        "distractorPool": [
          "향기롭다",
          "달콤하다",
          "개운하다"
        ]
      },
      {
        "id": "tail-06-q-13",
        "coreWord": "해방감",
        "word": "해방감",
        "answer": "홀가분하다, 후련하다, 개운하다",
        "targetWords": [
          "홀가분하다",
          "후련하다",
          "개운하다"
        ],
        "distractorPool": [
          "답답하다",
          "뻐근하다",
          "무겁다"
        ]
      },
      {
        "id": "tail-06-q-14",
        "coreWord": "청각",
        "word": "청각",
        "answer": "시끄럽다, 조용하다, 고요하다",
        "targetWords": [
          "시끄럽다",
          "조용하다",
          "고요하다"
        ],
        "distractorPool": [
          "알록달록하다",
          "반짝반짝하다",
          "둥글다"
        ]
      },
      {
        "id": "tail-06-q-15",
        "coreWord": "평온",
        "word": "평온",
        "answer": "안심되다, 차분하다, 침착하다",
        "targetWords": [
          "안심되다",
          "차분하다",
          "침착하다"
        ],
        "distractorPool": [
          "허둥지둥하다",
          "조마조마하다",
          "불안하다"
        ]
      },
      {
        "id": "tail-06-q-16",
        "coreWord": "미안함",
        "word": "미안함",
        "answer": "죄송하다, 부끄럽다, 뉘우치다",
        "targetWords": [
          "죄송하다",
          "부끄럽다",
          "뉘우치다"
        ],
        "distractorPool": [
          "자랑스럽다",
          "뻔뻔하다",
          "당당하다"
        ]
      },
      {
        "id": "tail-06-q-17",
        "coreWord": "짜증",
        "word": "짜증",
        "answer": "귀찮다, 성가시다, 불쾌하다",
        "targetWords": [
          "귀찮다",
          "성가시다",
          "불쾌하다"
        ],
        "distractorPool": [
          "즐겁다",
          "신난다",
          "재미있다"
        ]
      },
      {
        "id": "tail-06-q-18",
        "coreWord": "두려움",
        "word": "두려움",
        "answer": "무섭다, 겁나다, 오싹하다",
        "targetWords": [
          "무섭다",
          "겁나다",
          "오싹하다"
        ],
        "distractorPool": [
          "편안하다",
          "따뜻하다",
          "안심되다"
        ]
      },
      {
        "id": "tail-06-q-19",
        "coreWord": "배고픔",
        "word": "배고픔",
        "answer": "출출하다, 꼬르륵거리다, 허기지다",
        "targetWords": [
          "출출하다",
          "꼬르륵거리다",
          "허기지다"
        ],
        "distractorPool": [
          "배부르다",
          "든든하다",
          "소화되다"
        ]
      },
      {
        "id": "tail-06-q-20",
        "coreWord": "배부름",
        "word": "배부름",
        "answer": "든든하다, 소화되다, 배터지다",
        "targetWords": [
          "든든하다",
          "소화되다",
          "배터지다"
        ],
        "distractorPool": [
          "배고프다",
          "출출하다",
          "허기지다"
        ]
      },
      {
        "id": "tail-06-q-21",
        "coreWord": "냄새",
        "word": "냄새",
        "answer": "향기롭다, 구수하다, 매콤하다",
        "targetWords": [
          "향기롭다",
          "구수하다",
          "매콤하다"
        ],
        "distractorPool": [
          "시끄럽다",
          "어둡다",
          "거칠다"
        ]
      },
      {
        "id": "tail-06-q-22",
        "coreWord": "역겨움",
        "word": "역겨움",
        "answer": "지독하다, 퀴퀴하다, 비리다",
        "targetWords": [
          "지독하다",
          "퀴퀴하다",
          "비리다"
        ],
        "distractorPool": [
          "달콤하다",
          "상큼하다",
          "향기롭다"
        ]
      },
      {
        "id": "tail-06-q-23",
        "coreWord": "따뜻함",
        "word": "따뜻함",
        "answer": "포근하다, 훈훈하다, 온화하다",
        "targetWords": [
          "포근하다",
          "훈훈하다",
          "온화하다"
        ],
        "distractorPool": [
          "싸늘하다",
          "으스스하다",
          "시리다"
        ]
      },
      {
        "id": "tail-06-q-24",
        "coreWord": "차가움",
        "word": "차가움",
        "answer": "시리다, 싸늘하다, 서늘하다",
        "targetWords": [
          "시리다",
          "싸늘하다",
          "서늘하다"
        ],
        "distractorPool": [
          "따뜻하다",
          "포근하다",
          "뜨겁다"
        ]
      },
      {
        "id": "tail-06-q-25",
        "coreWord": "더위",
        "word": "더위",
        "answer": "덥다, 푹푹찌다, 뜨겁다",
        "targetWords": [
          "덥다",
          "푹푹찌다",
          "뜨겁다"
        ],
        "distractorPool": [
          "춥다",
          "시원하다",
          "쌀쌀하다"
        ]
      },
      {
        "id": "tail-06-q-26",
        "coreWord": "추위",
        "word": "추위",
        "answer": "쌀쌀하다, 춥다, 으스스하다",
        "targetWords": [
          "쌀쌀하다",
          "춥다",
          "으스스하다"
        ],
        "distractorPool": [
          "덥다",
          "뜨겁다",
          "따뜻하다"
        ]
      },
      {
        "id": "tail-06-q-27",
        "coreWord": "촉감거칠",
        "word": "촉감거칠",
        "answer": "까슬까슬하다, 거칠다, 딱딱하다",
        "targetWords": [
          "까슬까슬하다",
          "거칠다",
          "딱딱하다"
        ],
        "distractorPool": [
          "보들보들하다",
          "매끄럽다",
          "말랑하다"
        ]
      },
      {
        "id": "tail-06-q-28",
        "coreWord": "촉감부드럼",
        "word": "촉감부드럼",
        "answer": "말랑말랑하다, 폭신하다, 보들보들하다",
        "targetWords": [
          "말랑말랑하다",
          "폭신하다",
          "보들보들하다"
        ],
        "distractorPool": [
          "거칠다",
          "뾰족하다",
          "단단하다"
        ]
      },
      {
        "id": "tail-06-q-29",
        "coreWord": "시원함",
        "word": "시원함",
        "answer": "상쾌하다, 서늘하다, 청량하다",
        "targetWords": [
          "상쾌하다",
          "서늘하다",
          "청량하다"
        ],
        "distractorPool": [
          "답답하다",
          "꿉꿉하다",
          "덥다"
        ]
      },
      {
        "id": "tail-06-q-30",
        "coreWord": "답답함",
        "word": "답답함",
        "answer": "숨막히다, 꿉꿉하다, 갑갑하다",
        "targetWords": [
          "숨막히다",
          "꿉꿉하다",
          "갑갑하다"
        ],
        "distractorPool": [
          "시원하다",
          "상쾌하다",
          "확트이다"
        ]
      },
      {
        "id": "tail-06-q-31",
        "coreWord": "신맛",
        "word": "신맛",
        "answer": "새콤하다, 시큼하다, 시다",
        "targetWords": [
          "새콤하다",
          "시큼하다",
          "시다"
        ],
        "distractorPool": [
          "달콤하다",
          "짭짤하다",
          "맵다"
        ]
      },
      {
        "id": "tail-06-q-32",
        "coreWord": "짠맛",
        "word": "짠맛",
        "answer": "짭짤하다, 소금맛이다, 짜다",
        "targetWords": [
          "짭짤하다",
          "소금맛이다",
          "짜다"
        ],
        "distractorPool": [
          "달콤하다",
          "새콤하다",
          "싱겁다"
        ]
      },
      {
        "id": "tail-06-q-33",
        "coreWord": "단맛",
        "word": "단맛",
        "answer": "달콤하다, 달달하다, 달다",
        "targetWords": [
          "달콤하다",
          "달달하다",
          "달다"
        ],
        "distractorPool": [
          "쓰다",
          "맵다",
          "짜다"
        ]
      },
      {
        "id": "tail-06-q-34",
        "coreWord": "쓴맛",
        "word": "쓴맛",
        "answer": "씁쓸하다, 쓰다, 한약맛이다",
        "targetWords": [
          "씁쓸하다",
          "쓰다",
          "한약맛이다"
        ],
        "distractorPool": [
          "달콤하다",
          "새콤하다",
          "고소하다"
        ]
      },
      {
        "id": "tail-06-q-35",
        "coreWord": "무게",
        "word": "무게",
        "answer": "무겁다, 가볍다, 묵직하다",
        "targetWords": [
          "무겁다",
          "가볍다",
          "묵직하다"
        ],
        "distractorPool": [
          "밝다",
          "어둡다",
          "시끄럽다"
        ]
      },
      {
        "id": "tail-06-q-36",
        "coreWord": "속도",
        "word": "속도",
        "answer": "빠르다, 느리다, 쏜알같다",
        "targetWords": [
          "빠르다",
          "느리다",
          "쏜알같다"
        ],
        "distractorPool": [
          "달콤하다",
          "짜다",
          "쓰다"
        ]
      },
      {
        "id": "tail-06-q-37",
        "coreWord": "밝기",
        "word": "밝기",
        "answer": "눈부시다, 화창하다, 밝다",
        "targetWords": [
          "눈부시다",
          "화창하다",
          "밝다"
        ],
        "distractorPool": [
          "캄캄하다",
          "어둡다",
          "침침하다"
        ]
      },
      {
        "id": "tail-06-q-38",
        "coreWord": "어두움",
        "word": "어두움",
        "answer": "캄캄하다, 침침하다, 어둑어둑하다",
        "targetWords": [
          "캄캄하다",
          "침침하다",
          "어둑어둑하다"
        ],
        "distractorPool": [
          "화창하다",
          "눈부시다",
          "밝다"
        ]
      },
      {
        "id": "tail-06-q-39",
        "coreWord": "맑음",
        "word": "맑음",
        "answer": "투명하다, 깨끗하다, 맑다",
        "targetWords": [
          "투명하다",
          "깨끗하다",
          "맑다"
        ],
        "distractorPool": [
          "탁하다",
          "뿌옇다",
          "더럽다"
        ]
      },
      {
        "id": "tail-06-q-40",
        "coreWord": "흐림",
        "word": "흐림",
        "answer": "탁하다, 뿌옇다, 흐릿하다",
        "targetWords": [
          "탁하다",
          "뿌옇다",
          "흐릿하다"
        ],
        "distractorPool": [
          "투명하다",
          "맑다",
          "선명하다"
        ]
      },
      {
        "id": "tail-06-q-41",
        "coreWord": "사랑",
        "word": "사랑",
        "answer": "좋아하다, 아끼다, 소중하다",
        "targetWords": [
          "좋아하다",
          "아끼다",
          "소중하다"
        ],
        "distractorPool": [
          "미워하다",
          "싫어하다",
          "귀찮다"
        ]
      },
      {
        "id": "tail-06-q-42",
        "coreWord": "미움",
        "word": "미움",
        "answer": "싫다, 밉다, 원망스럽다",
        "targetWords": [
          "싫다",
          "밉다",
          "원망스럽다"
        ],
        "distractorPool": [
          "좋다",
          "사랑스럽다",
          "그립다"
        ]
      },
      {
        "id": "tail-06-q-43",
        "coreWord": "그리움",
        "word": "그리움",
        "answer": "보고싶다, 생각난다, 아련하다",
        "targetWords": [
          "보고싶다",
          "생각난다",
          "아련하다"
        ],
        "distractorPool": [
          "귀찮다",
          "지겹다",
          "잊어버리다"
        ]
      },
      {
        "id": "tail-06-q-44",
        "coreWord": "지루함",
        "word": "지루함",
        "answer": "따분하다, 재미없다, 하품난다",
        "targetWords": [
          "따분하다",
          "재미없다",
          "하품난다"
        ],
        "distractorPool": [
          "흥미롭다",
          "신난다",
          "짜릿하다"
        ]
      },
      {
        "id": "tail-06-q-45",
        "coreWord": "재미",
        "word": "재미",
        "answer": "신난다, 흥미진진하다, 웃기다",
        "targetWords": [
          "신난다",
          "흥미진진하다",
          "웃기다"
        ],
        "distractorPool": [
          "지루하다",
          "따분하다",
          "심심하다"
        ]
      },
      {
        "id": "tail-06-q-46",
        "coreWord": "긴장",
        "word": "긴장",
        "answer": "조마조마하다, 떨린다, 굳어지다",
        "targetWords": [
          "조마조마하다",
          "떨린다",
          "굳어지다"
        ],
        "distractorPool": [
          "편안하다",
          "안심된다",
          "늘어지다"
        ]
      },
      {
        "id": "tail-06-q-47",
        "coreWord": "이완",
        "word": "이완",
        "answer": "늘어지다, 편안하다, 나른하다",
        "targetWords": [
          "늘어지다",
          "편안하다",
          "나른하다"
        ],
        "distractorPool": [
          "긴장하다",
          "떨린다",
          "굳어지다"
        ]
      },
      {
        "id": "tail-06-q-48",
        "coreWord": "깨끗함",
        "word": "깨끗함",
        "answer": "산뜻하다, 청결하다, 말끔하다",
        "targetWords": [
          "산뜻하다",
          "청결하다",
          "말끔하다"
        ],
        "distractorPool": [
          "더럽다",
          "찝찝하다",
          "지저분하다"
        ]
      },
      {
        "id": "tail-06-q-49",
        "coreWord": "더러움",
        "word": "더러움",
        "answer": "지저분하다, 찝찝하다, 꼬질꼬질하다",
        "targetWords": [
          "지저분하다",
          "찝찝하다",
          "꼬질꼬질하다"
        ],
        "distractorPool": [
          "산뜻하다",
          "말끔하다",
          "청결하다"
        ]
      },
      {
        "id": "tail-06-q-50",
        "coreWord": "놀이후",
        "word": "놀이후",
        "answer": "땀난다, 숨차다, 헐떡이다",
        "targetWords": [
          "땀난다",
          "숨차다",
          "헐떡이다"
        ],
        "distractorPool": [
          "추워진다",
          "얼어붙는다",
          "편안하다"
        ]
      },
      {
        "id": "tail-06-q-51",
        "coreWord": "감기",
        "word": "감기",
        "answer": "열난다, 기침난다, 콧물난다",
        "targetWords": [
          "열난다",
          "기침난다",
          "콧물난다"
        ],
        "distractorPool": [
          "상쾌하다",
          "개운하다",
          "건강하다"
        ]
      },
      {
        "id": "tail-06-q-52",
        "coreWord": "건강",
        "word": "건강",
        "answer": "튼튼하다, 쌩쌩하다, 건강하다",
        "targetWords": [
          "튼튼하다",
          "쌩쌩하다",
          "건강하다"
        ],
        "distractorPool": [
          "아프다",
          "지치다",
          "병들다"
        ]
      },
      {
        "id": "tail-06-q-53",
        "coreWord": "배탈",
        "word": "배탈",
        "answer": "속쓰리다, 울렁거린다, 토할것같다",
        "targetWords": [
          "속쓰리다",
          "울렁거린다",
          "토할것같다"
        ],
        "distractorPool": [
          "배부르다",
          "소화잘된다",
          "든든하다"
        ]
      },
      {
        "id": "tail-06-q-54",
        "coreWord": "다침",
        "word": "다침",
        "answer": "쑤시다, 욱신거린다, 피난다",
        "targetWords": [
          "쑤시다",
          "욱신거린다",
          "피난다"
        ],
        "distractorPool": [
          "부드럽다",
          "시원하다",
          "간지럽다"
        ]
      },
      {
        "id": "tail-06-q-55",
        "coreWord": "놀이터에서",
        "word": "놀이터에서",
        "answer": "신난다, 숨차다, 즐겁다",
        "targetWords": [
          "신난다",
          "숨차다",
          "즐겁다"
        ],
        "distractorPool": [
          "우울하다",
          "지루하다",
          "졸리다"
        ]
      },
      {
        "id": "tail-06-q-56",
        "coreWord": "숙제할때",
        "word": "숙제할때",
        "answer": "귀찮다, 지루하다, 어렵다",
        "targetWords": [
          "귀찮다",
          "지루하다",
          "어렵다"
        ],
        "distractorPool": [
          "신난다",
          "달콤하다",
          "짜릿하다"
        ]
      },
      {
        "id": "tail-06-q-57",
        "coreWord": "칭찬받을때",
        "word": "칭찬받을때",
        "answer": "우쭐하다, 자랑스럽다, 뿌듯하다",
        "targetWords": [
          "우쭐하다",
          "자랑스럽다",
          "뿌듯하다"
        ],
        "distractorPool": [
          "부끄럽다",
          "억울하다",
          "창피하다"
        ]
      },
      {
        "id": "tail-06-q-58",
        "coreWord": "혼날때",
        "word": "혼날때",
        "answer": "주눅든다, 무섭다, 속상하다",
        "targetWords": [
          "주눅든다",
          "무섭다",
          "속상하다"
        ],
        "distractorPool": [
          "당당하다",
          "자랑스럽다",
          "신난다"
        ]
      },
      {
        "id": "tail-06-q-59",
        "coreWord": "선물받을때",
        "word": "선물받을때",
        "answer": "설렌다, 기쁘다, 고맙다",
        "targetWords": [
          "설렌다",
          "기쁘다",
          "고맙다"
        ],
        "distractorPool": [
          "화난다",
          "억울하다",
          "슬프다"
        ]
      },
      {
        "id": "tail-06-q-60",
        "coreWord": "길잃었을때",
        "word": "길잃었을때",
        "answer": "당황하다, 무섭다, 울고싶다",
        "targetWords": [
          "당황하다",
          "무섭다",
          "울고싶다"
        ],
        "distractorPool": [
          "안심되다",
          "즐겁다",
          "통쾌하다"
        ]
      }
    ]
  },
  {
    "id": "tail-07",
    "title": "초등 04",
    "schoolLevelLabel": "04",
    "bandLabel": "초등",
    "descriptor": "학교와교실",
    "grammarFocus": "학교와교실",
    "goalCopy": "학교와교실 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 29,
    "questions": [
      {
        "id": "tail-07-q-01",
        "coreWord": "필기구",
        "word": "필기구",
        "answer": "연필, 지우개, 볼펜",
        "targetWords": [
          "연필",
          "지우개",
          "볼펜"
        ],
        "distractorPool": [
          "숟가락",
          "포크",
          "국자"
        ]
      },
      {
        "id": "tail-07-q-02",
        "coreWord": "교실물건",
        "word": "교실물건",
        "answer": "칠판, 교탁, 사물함",
        "targetWords": [
          "칠판",
          "교탁",
          "사물함"
        ],
        "distractorPool": [
          "침대",
          "식탁",
          "소파"
        ]
      },
      {
        "id": "tail-07-q-03",
        "coreWord": "주요과목",
        "word": "주요과목",
        "answer": "국어, 수학, 사회",
        "targetWords": [
          "국어",
          "수학",
          "사회"
        ],
        "distractorPool": [
          "수면",
          "식사",
          "양치"
        ]
      },
      {
        "id": "tail-07-q-04",
        "coreWord": "우리반사람",
        "word": "우리반사람",
        "answer": "선생님, 반장, 짝꿍",
        "targetWords": [
          "선생님",
          "반장",
          "짝꿍"
        ],
        "distractorPool": [
          "엄마",
          "아빠",
          "동생"
        ]
      },
      {
        "id": "tail-07-q-05",
        "coreWord": "학교장소",
        "word": "학교장소",
        "answer": "운동장, 도서관, 보건실",
        "targetWords": [
          "운동장",
          "도서관",
          "보건실"
        ],
        "distractorPool": [
          "경찰서",
          "우체국",
          "소방서"
        ]
      },
      {
        "id": "tail-07-q-06",
        "coreWord": "공책종류",
        "word": "공책종류",
        "answer": "알림장, 일기장, 스케치북",
        "targetWords": [
          "알림장",
          "일기장",
          "스케치북"
        ],
        "distractorPool": [
          "게임기",
          "장난감",
          "만화책"
        ]
      },
      {
        "id": "tail-07-q-07",
        "coreWord": "등교준비물",
        "word": "등교준비물",
        "answer": "실내화, 체육복, 교과서",
        "targetWords": [
          "실내화",
          "체육복",
          "교과서"
        ],
        "distractorPool": [
          "잠옷",
          "수영복",
          "튜브"
        ]
      },
      {
        "id": "tail-07-q-08",
        "coreWord": "급식시간",
        "word": "급식시간",
        "answer": "급식실, 식판, 수저",
        "targetWords": [
          "급식실",
          "식판",
          "수저"
        ],
        "distractorPool": [
          "계산대",
          "장바구니",
          "영수증"
        ]
      },
      {
        "id": "tail-07-q-09",
        "coreWord": "학교일과",
        "word": "학교일과",
        "answer": "쉬는시간, 점심시간, 하교",
        "targetWords": [
          "쉬는시간",
          "점심시간",
          "하교"
        ],
        "distractorPool": [
          "출근",
          "퇴근",
          "야근"
        ]
      },
      {
        "id": "tail-07-q-10",
        "coreWord": "수업태도",
        "word": "수업태도",
        "answer": "발표, 질문, 모둠활동",
        "targetWords": [
          "발표",
          "질문",
          "모둠활동"
        ],
        "distractorPool": [
          "싸움",
          "방해",
          "장난"
        ]
      },
      {
        "id": "tail-07-q-11",
        "coreWord": "평가",
        "word": "평가",
        "answer": "시험, 성적표, 백점",
        "targetWords": [
          "시험",
          "성적표",
          "백점"
        ],
        "distractorPool": [
          "진단서",
          "처방전",
          "영수증"
        ]
      },
      {
        "id": "tail-07-q-12",
        "coreWord": "청소도구",
        "word": "청소도구",
        "answer": "빗자루, 쓰레받기, 걸레",
        "targetWords": [
          "빗자루",
          "쓰레받기",
          "걸레"
        ],
        "distractorPool": [
          "인형",
          "로봇",
          "팽이"
        ]
      },
      {
        "id": "tail-07-q-13",
        "coreWord": "예체능",
        "word": "예체능",
        "answer": "미술, 체육, 음악",
        "targetWords": [
          "미술",
          "체육",
          "음악"
        ],
        "distractorPool": [
          "간식",
          "낮잠",
          "외식"
        ]
      },
      {
        "id": "tail-07-q-14",
        "coreWord": "미술도구",
        "word": "미술도구",
        "answer": "크레파스, 물감, 도화지",
        "targetWords": [
          "크레파스",
          "물감",
          "도화지"
        ],
        "distractorPool": [
          "도마",
          "식칼",
          "프라이팬"
        ]
      },
      {
        "id": "tail-07-q-15",
        "coreWord": "학교행사",
        "word": "학교행사",
        "answer": "입학식, 소풍, 운동회",
        "targetWords": [
          "입학식",
          "소풍",
          "운동회"
        ],
        "distractorPool": [
          "제사",
          "환갑잔치",
          "결혼식"
        ]
      },
      {
        "id": "tail-07-q-16",
        "coreWord": "책상위",
        "word": "책상위",
        "answer": "필통, 교과서, 연필깎이",
        "targetWords": [
          "필통",
          "교과서",
          "연필깎이"
        ],
        "distractorPool": [
          "베개",
          "이불",
          "칫솔"
        ]
      },
      {
        "id": "tail-07-q-17",
        "coreWord": "수학도구",
        "word": "수학도구",
        "answer": "삼각자, 각도기, 컴퍼스",
        "targetWords": [
          "삼각자",
          "각도기",
          "컴퍼스"
        ],
        "distractorPool": [
          "물감",
          "붓",
          "팔레트"
        ]
      },
      {
        "id": "tail-07-q-18",
        "coreWord": "복도",
        "word": "복도",
        "answer": "소화기, 신발장, 정수기",
        "targetWords": [
          "소화기",
          "신발장",
          "정수기"
        ],
        "distractorPool": [
          "침대",
          "소파",
          "식탁"
        ]
      },
      {
        "id": "tail-07-q-19",
        "coreWord": "하교준비",
        "word": "하교준비",
        "answer": "가방싸기, 알림장확인, 의자넣기",
        "targetWords": [
          "가방싸기",
          "알림장확인",
          "의자넣기"
        ],
        "distractorPool": [
          "책꺼내기",
          "실내화신기",
          "체육복입기"
        ]
      },
      {
        "id": "tail-07-q-20",
        "coreWord": "친구돕기",
        "word": "친구돕기",
        "answer": "지우개빌려주기, 부축해주기, 위로하기",
        "targetWords": [
          "지우개빌려주기",
          "부축해주기",
          "위로하기"
        ],
        "distractorPool": [
          "놀리기",
          "빼앗기",
          "때리기"
        ]
      },
      {
        "id": "tail-07-q-21",
        "coreWord": "필통속",
        "word": "필통속",
        "answer": "형광펜, 자, 딱풀",
        "targetWords": [
          "형광펜",
          "자",
          "딱풀"
        ],
        "distractorPool": [
          "숟가락",
          "젓가락",
          "주걱"
        ]
      },
      {
        "id": "tail-07-q-22",
        "coreWord": "체육시간",
        "word": "체육시간",
        "answer": "줄넘기, 피구공, 매트",
        "targetWords": [
          "줄넘기",
          "피구공",
          "매트"
        ],
        "distractorPool": [
          "리코더",
          "멜로디언",
          "스케치북"
        ]
      },
      {
        "id": "tail-07-q-23",
        "coreWord": "음악시간",
        "word": "음악시간",
        "answer": "리코더, 멜로디언, 탬버린",
        "targetWords": [
          "리코더",
          "멜로디언",
          "탬버린"
        ],
        "distractorPool": [
          "축구공",
          "야구배트",
          "뜀틀"
        ]
      },
      {
        "id": "tail-07-q-24",
        "coreWord": "교실게시판",
        "word": "교실게시판",
        "answer": "시간표, 청소당번표, 칭찬스티커",
        "targetWords": [
          "시간표",
          "청소당번표",
          "칭찬스티커"
        ],
        "distractorPool": [
          "메뉴판",
          "가격표",
          "영수증"
        ]
      },
      {
        "id": "tail-07-q-25",
        "coreWord": "쉬는시간",
        "word": "쉬는시간",
        "answer": "딱지치기, 공기놀이, 술래잡기",
        "targetWords": [
          "딱지치기",
          "공기놀이",
          "술래잡기"
        ],
        "distractorPool": [
          "시험공부",
          "숙제하기",
          "낮잠자기"
        ]
      },
      {
        "id": "tail-07-q-26",
        "coreWord": "국어시간",
        "word": "국어시간",
        "answer": "동화책, 받아쓰기, 발표",
        "targetWords": [
          "동화책",
          "받아쓰기",
          "발표"
        ],
        "distractorPool": [
          "달리기",
          "뜀틀",
          "피구"
        ]
      },
      {
        "id": "tail-07-q-27",
        "coreWord": "잔반정리",
        "word": "잔반정리",
        "answer": "배식구, 잔반통, 분리수거",
        "targetWords": [
          "배식구",
          "잔반통",
          "분리수거"
        ],
        "distractorPool": [
          "그네",
          "시소",
          "정글짐"
        ]
      },
      {
        "id": "tail-07-q-28",
        "coreWord": "도서관",
        "word": "도서관",
        "answer": "동화책, 대출증, 바코드",
        "targetWords": [
          "동화책",
          "대출증",
          "바코드"
        ],
        "distractorPool": [
          "축구공",
          "줄넘기",
          "체육복"
        ]
      },
      {
        "id": "tail-07-q-29",
        "coreWord": "과학시간",
        "word": "과학시간",
        "answer": "돋보기, 비커, 자석",
        "targetWords": [
          "돋보기",
          "비커",
          "자석"
        ],
        "distractorPool": [
          "리코더",
          "단소",
          "크레파스"
        ]
      },
      {
        "id": "tail-07-q-30",
        "coreWord": "보건실",
        "word": "보건실",
        "answer": "반창고, 연고, 체온계",
        "targetWords": [
          "반창고",
          "연고",
          "체온계"
        ],
        "distractorPool": [
          "칠판",
          "분필",
          "교탁"
        ]
      },
      {
        "id": "tail-07-q-31",
        "coreWord": "교문앞",
        "word": "교문앞",
        "answer": "횡단보도, 녹색어머니, 신호등",
        "targetWords": [
          "횡단보도",
          "녹색어머니",
          "신호등"
        ],
        "distractorPool": [
          "침대",
          "텔레비전",
          "가스레인지"
        ]
      },
      {
        "id": "tail-07-q-32",
        "coreWord": "반당번",
        "word": "반당번",
        "answer": "우유당번, 칠판당번, 청소당번",
        "targetWords": [
          "우유당번",
          "칠판당번",
          "청소당번"
        ],
        "distractorPool": [
          "술래",
          "대장",
          "왕"
        ]
      },
      {
        "id": "tail-07-q-33",
        "coreWord": "바른인사",
        "word": "바른인사",
        "answer": "차렷, 경례, 안녕하십니까",
        "targetWords": [
          "차렷",
          "경례",
          "안녕하십니까"
        ],
        "distractorPool": [
          "메롱",
          "안녕",
          "잘가"
        ]
      },
      {
        "id": "tail-07-q-34",
        "coreWord": "칭찬",
        "word": "칭찬",
        "answer": "참잘했어요, 칭찬스티커, 박수",
        "targetWords": [
          "참잘했어요",
          "칭찬스티커",
          "박수"
        ],
        "distractorPool": [
          "벌점",
          "반성문",
          "회초리"
        ]
      },
      {
        "id": "tail-07-q-35",
        "coreWord": "잘못했을때",
        "word": "잘못했을때",
        "answer": "사과, 반성문, 미안해",
        "targetWords": [
          "사과",
          "반성문",
          "미안해"
        ],
        "distractorPool": [
          "자랑",
          "상장",
          "백점"
        ]
      },
      {
        "id": "tail-07-q-36",
        "coreWord": "방학",
        "word": "방학",
        "answer": "여름방학, 겨울방학, 방학숙제",
        "targetWords": [
          "여름방학",
          "겨울방학",
          "방학숙제"
        ],
        "distractorPool": [
          "개학",
          "입학",
          "소풍"
        ]
      },
      {
        "id": "tail-07-q-37",
        "coreWord": "상장",
        "word": "상장",
        "answer": "개근상, 우수상, 임명장",
        "targetWords": [
          "개근상",
          "우수상",
          "임명장"
        ],
        "distractorPool": [
          "벌금",
          "영수증",
          "청구서"
        ]
      },
      {
        "id": "tail-07-q-38",
        "coreWord": "가위질",
        "word": "가위질",
        "answer": "가위, 색종이, 딱풀",
        "targetWords": [
          "가위",
          "색종이",
          "딱풀"
        ],
        "distractorPool": [
          "국자",
          "도마",
          "식칼"
        ]
      },
      {
        "id": "tail-07-q-39",
        "coreWord": "학교화장실",
        "word": "학교화장실",
        "answer": "변기, 세면대, 화장지",
        "targetWords": [
          "변기",
          "세면대",
          "화장지"
        ],
        "distractorPool": [
          "책상",
          "의자",
          "칠판"
        ]
      },
      {
        "id": "tail-07-q-40",
        "coreWord": "운동회",
        "word": "운동회",
        "answer": "이어달리기, 줄다리기, 박터트리기",
        "targetWords": [
          "이어달리기",
          "줄다리기",
          "박터트리기"
        ],
        "distractorPool": [
          "받아쓰기",
          "독서",
          "수학문제"
        ]
      },
      {
        "id": "tail-07-q-41",
        "coreWord": "봄소풍",
        "word": "봄소풍",
        "answer": "도시락, 돗자리, 김밥",
        "targetWords": [
          "도시락",
          "돗자리",
          "김밥"
        ],
        "distractorPool": [
          "교과서",
          "공책",
          "지우개"
        ]
      },
      {
        "id": "tail-07-q-42",
        "coreWord": "교무실",
        "word": "교무실",
        "answer": "교장선생님, 교감선생님, 회의용탁자",
        "targetWords": [
          "교장선생님",
          "교감선생님",
          "회의용탁자"
        ],
        "distractorPool": [
          "미끄럼틀",
          "시소",
          "모래밭"
        ]
      },
      {
        "id": "tail-07-q-43",
        "coreWord": "방송실",
        "word": "방송실",
        "answer": "마이크, 카메라, 스피커",
        "targetWords": [
          "마이크",
          "카메라",
          "스피커"
        ],
        "distractorPool": [
          "축구공",
          "야구배트",
          "줄넘기"
        ]
      },
      {
        "id": "tail-07-q-44",
        "coreWord": "신발장",
        "word": "신발장",
        "answer": "실내화, 운동화, 장화",
        "targetWords": [
          "실내화",
          "운동화",
          "장화"
        ],
        "distractorPool": [
          "모자",
          "장갑",
          "목도리"
        ]
      },
      {
        "id": "tail-07-q-45",
        "coreWord": "짝꿍과",
        "word": "짝꿍과",
        "answer": "인사하기, 연필빌려주기, 같이놀기",
        "targetWords": [
          "인사하기",
          "연필빌려주기",
          "같이놀기"
        ],
        "distractorPool": [
          "싸우기",
          "때리기",
          "훔치기"
        ]
      },
      {
        "id": "tail-07-q-46",
        "coreWord": "집중태도",
        "word": "집중태도",
        "answer": "바른자세, 눈맞추기, 조용히듣기",
        "targetWords": [
          "바른자세",
          "눈맞추기",
          "조용히듣기"
        ],
        "distractorPool": [
          "떠들기",
          "엎드려자기",
          "돌아다니기"
        ]
      },
      {
        "id": "tail-07-q-47",
        "coreWord": "조별활동",
        "word": "조별활동",
        "answer": "의논하기, 역할나누기, 협동하기",
        "targetWords": [
          "의논하기",
          "역할나누기",
          "협동하기"
        ],
        "distractorPool": [
          "혼자하기",
          "화내기",
          "방해하기"
        ]
      },
      {
        "id": "tail-07-q-48",
        "coreWord": "칠판당번",
        "word": "칠판당번",
        "answer": "분필, 칠판지우개, 칠판닦기",
        "targetWords": [
          "분필",
          "칠판지우개",
          "칠판닦기"
        ],
        "distractorPool": [
          "마우스",
          "키보드",
          "리모컨"
        ]
      },
      {
        "id": "tail-07-q-49",
        "coreWord": "대청소",
        "word": "대청소",
        "answer": "창문열기, 책상밀기, 바닥쓸기",
        "targetWords": [
          "창문열기",
          "책상밀기",
          "바닥쓸기"
        ],
        "distractorPool": [
          "밥먹기",
          "잠자기",
          "텔레비전보기"
        ]
      },
      {
        "id": "tail-07-q-50",
        "coreWord": "집숙제",
        "word": "집숙제",
        "answer": "일기쓰기, 문제풀기, 독서록",
        "targetWords": [
          "일기쓰기",
          "문제풀기",
          "독서록"
        ],
        "distractorPool": [
          "게임하기",
          "늦잠자기",
          "만화보기"
        ]
      },
      {
        "id": "tail-07-q-51",
        "coreWord": "운동복",
        "word": "운동복",
        "answer": "체육복, 반바지, 운동화",
        "targetWords": [
          "체육복",
          "반바지",
          "운동화"
        ],
        "distractorPool": [
          "드레스",
          "정장",
          "넥타이"
        ]
      },
      {
        "id": "tail-07-q-52",
        "coreWord": "자리바꾸기",
        "word": "자리바꾸기",
        "answer": "제비뽑기, 번호표, 새짝꿍",
        "targetWords": [
          "제비뽑기",
          "번호표",
          "새짝꿍"
        ],
        "distractorPool": [
          "시험",
          "평가",
          "채점"
        ]
      },
      {
        "id": "tail-07-q-53",
        "coreWord": "발표수칙",
        "word": "발표수칙",
        "answer": "손들기, 일어서기, 큰목소리",
        "targetWords": [
          "손들기",
          "일어서기",
          "큰목소리"
        ],
        "distractorPool": [
          "숨기",
          "도망치기",
          "속삭이기"
        ]
      },
      {
        "id": "tail-07-q-54",
        "coreWord": "분실물",
        "word": "분실물",
        "answer": "주워주기, 찾아주기, 분실물센터",
        "targetWords": [
          "주워주기",
          "찾아주기",
          "분실물센터"
        ],
        "distractorPool": [
          "숨기기",
          "버리기",
          "훔치기"
        ]
      },
      {
        "id": "tail-07-q-55",
        "coreWord": "학교약속",
        "word": "학교약속",
        "answer": "복도에서안뛰기, 쓰레기안버리기, 지각안하기",
        "targetWords": [
          "복도에서안뛰기",
          "쓰레기안버리기",
          "지각안하기"
        ],
        "distractorPool": [
          "새치기하기",
          "거짓말하기",
          "싸우기"
        ]
      },
      {
        "id": "tail-07-q-56",
        "coreWord": "이름표",
        "word": "이름표",
        "answer": "네임펜, 이름스티커, 유성매직",
        "targetWords": [
          "네임펜",
          "이름스티커",
          "유성매직"
        ],
        "distractorPool": [
          "지우개",
          "물감",
          "크레파스"
        ]
      },
      {
        "id": "tail-07-q-57",
        "coreWord": "미술작품",
        "word": "미술작품",
        "answer": "점토만들기, 그림그리기, 종이접기",
        "targetWords": [
          "점토만들기",
          "그림그리기",
          "종이접기"
        ],
        "distractorPool": [
          "달리기",
          "피구",
          "줄넘기"
        ]
      },
      {
        "id": "tail-07-q-58",
        "coreWord": "음악발표",
        "word": "음악발표",
        "answer": "노래부르기, 리코더불기, 합창",
        "targetWords": [
          "노래부르기",
          "리코더불기",
          "합창"
        ],
        "distractorPool": [
          "독서록쓰기",
          "일기쓰기",
          "수학풀기"
        ]
      },
      {
        "id": "tail-07-q-59",
        "coreWord": "반장선거",
        "word": "반장선거",
        "answer": "후보, 투표, 개표",
        "targetWords": [
          "후보",
          "투표",
          "개표"
        ],
        "distractorPool": [
          "벌당번",
          "청소당번",
          "우유당번"
        ]
      },
      {
        "id": "tail-07-q-60",
        "coreWord": "조회시간",
        "word": "조회시간",
        "answer": "교장선생님, 훈화말씀, 애국가",
        "targetWords": [
          "교장선생님",
          "훈화말씀",
          "애국가"
        ],
        "distractorPool": [
          "급식",
          "낮잠",
          "하교"
        ]
      }
    ]
  },
  {
    "id": "tail-08",
    "title": "초등 05",
    "schoolLevelLabel": "05",
    "bandLabel": "초등",
    "descriptor": "마트와장보기",
    "grammarFocus": "마트와장보기",
    "goalCopy": "마트와장보기 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 28,
    "questions": [
      {
        "id": "tail-08-q-01",
        "coreWord": "마트과일",
        "word": "마트과일",
        "answer": "사과, 수박, 딸기",
        "targetWords": [
          "사과",
          "수박",
          "딸기"
        ],
        "distractorPool": [
          "당근",
          "오이",
          "양파"
        ]
      },
      {
        "id": "tail-08-q-02",
        "coreWord": "마트채소",
        "word": "마트채소",
        "answer": "오이, 배추, 상추",
        "targetWords": [
          "오이",
          "배추",
          "상추"
        ],
        "distractorPool": [
          "사과",
          "바나나",
          "참외"
        ]
      },
      {
        "id": "tail-08-q-03",
        "coreWord": "정육코너",
        "word": "정육코너",
        "answer": "돼지고기, 소고기, 닭고기",
        "targetWords": [
          "돼지고기",
          "소고기",
          "닭고기"
        ],
        "distractorPool": [
          "고등어",
          "오징어",
          "꽁치"
        ]
      },
      {
        "id": "tail-08-q-04",
        "coreWord": "수산물코너",
        "word": "수산물코너",
        "answer": "고등어, 갈치, 새우",
        "targetWords": [
          "고등어",
          "갈치",
          "새우"
        ],
        "distractorPool": [
          "시금치",
          "버섯",
          "감자"
        ]
      },
      {
        "id": "tail-08-q-05",
        "coreWord": "담는물건",
        "word": "담는물건",
        "answer": "카트, 장바구니, 비닐봉지",
        "targetWords": [
          "카트",
          "장바구니",
          "비닐봉지"
        ],
        "distractorPool": [
          "책가방",
          "필통",
          "지갑"
        ]
      },
      {
        "id": "tail-08-q-06",
        "coreWord": "계산원",
        "word": "계산원",
        "answer": "계산대, 바코드, 영수증",
        "targetWords": [
          "계산대",
          "바코드",
          "영수증"
        ],
        "distractorPool": [
          "초대장",
          "편지",
          "일기장"
        ]
      },
      {
        "id": "tail-08-q-07",
        "coreWord": "세일행사",
        "word": "세일행사",
        "answer": "할인, 반값, 원플러스원",
        "targetWords": [
          "할인",
          "반값",
          "원플러스원"
        ],
        "distractorPool": [
          "인상",
          "바가지",
          "할증"
        ]
      },
      {
        "id": "tail-08-q-08",
        "coreWord": "유제품",
        "word": "유제품",
        "answer": "우유, 치즈, 요구르트",
        "targetWords": [
          "우유",
          "치즈",
          "요구르트"
        ],
        "distractorPool": [
          "콜라",
          "사이다",
          "주스"
        ]
      },
      {
        "id": "tail-08-q-09",
        "coreWord": "상품정보",
        "word": "상품정보",
        "answer": "가격표, 성분표, 유통기한",
        "targetWords": [
          "가격표",
          "성분표",
          "유통기한"
        ],
        "distractorPool": [
          "비밀번호",
          "전화번호",
          "주민번호"
        ]
      },
      {
        "id": "tail-08-q-10",
        "coreWord": "마트체험",
        "word": "마트체험",
        "answer": "시식코너, 맛보기, 이쑤시개",
        "targetWords": [
          "시식코너",
          "맛보기",
          "이쑤시개"
        ],
        "distractorPool": [
          "리모컨",
          "마우스",
          "키보드"
        ]
      },
      {
        "id": "tail-08-q-11",
        "coreWord": "마트가구",
        "word": "마트가구",
        "answer": "진열대, 선반, 냉동고",
        "targetWords": [
          "진열대",
          "선반",
          "냉동고"
        ],
        "distractorPool": [
          "옷장",
          "책장",
          "신발장"
        ]
      },
      {
        "id": "tail-08-q-12",
        "coreWord": "군것질거리",
        "word": "군것질거리",
        "answer": "과자, 초콜릿, 젤리",
        "targetWords": [
          "과자",
          "초콜릿",
          "젤리"
        ],
        "distractorPool": [
          "지우개",
          "연필",
          "자"
        ]
      },
      {
        "id": "tail-08-q-13",
        "coreWord": "즉석식품",
        "word": "즉석식품",
        "answer": "라면, 통조림, 즉석밥",
        "targetWords": [
          "라면",
          "통조림",
          "즉석밥"
        ],
        "distractorPool": [
          "비누",
          "샴푸",
          "린스"
        ]
      },
      {
        "id": "tail-08-q-14",
        "coreWord": "자율포장",
        "word": "자율포장",
        "answer": "포장테이프, 노끈, 종이상자",
        "targetWords": [
          "포장테이프",
          "노끈",
          "종이상자"
        ],
        "distractorPool": [
          "칫솔",
          "수건",
          "빗"
        ]
      },
      {
        "id": "tail-08-q-15",
        "coreWord": "마트혜택",
        "word": "마트혜택",
        "answer": "포인트, 적립, 사은품",
        "targetWords": [
          "포인트",
          "적립",
          "사은품"
        ],
        "distractorPool": [
          "벌금",
          "이자",
          "세금"
        ]
      },
      {
        "id": "tail-08-q-16",
        "coreWord": "뿌리채소",
        "word": "뿌리채소",
        "answer": "당근, 무, 고구마",
        "targetWords": [
          "당근",
          "무",
          "고구마"
        ],
        "distractorPool": [
          "사과",
          "포도",
          "바나나"
        ]
      },
      {
        "id": "tail-08-q-17",
        "coreWord": "열매채소",
        "word": "열매채소",
        "answer": "토마토, 가지, 호박",
        "targetWords": [
          "토마토",
          "가지",
          "호박"
        ],
        "distractorPool": [
          "갈치",
          "오징어",
          "조개"
        ]
      },
      {
        "id": "tail-08-q-18",
        "coreWord": "조개류",
        "word": "조개류",
        "answer": "굴, 홍합, 바지락",
        "targetWords": [
          "굴",
          "홍합",
          "바지락"
        ],
        "distractorPool": [
          "돼지고기",
          "소고기",
          "닭고기"
        ]
      },
      {
        "id": "tail-08-q-19",
        "coreWord": "베이커리",
        "word": "베이커리",
        "answer": "식빵, 크루아상, 모닝빵",
        "targetWords": [
          "식빵",
          "크루아상",
          "모닝빵"
        ],
        "distractorPool": [
          "라면",
          "국수",
          "당면"
        ]
      },
      {
        "id": "tail-08-q-20",
        "coreWord": "면종류",
        "word": "면종류",
        "answer": "라면, 소면, 스파게티면",
        "targetWords": [
          "라면",
          "소면",
          "스파게티면"
        ],
        "distractorPool": [
          "식빵",
          "바게트",
          "케이크"
        ]
      },
      {
        "id": "tail-08-q-21",
        "coreWord": "기본양념",
        "word": "기본양념",
        "answer": "간장, 된장, 고추장",
        "targetWords": [
          "간장",
          "된장",
          "고추장"
        ],
        "distractorPool": [
          "비누",
          "샴푸",
          "치약"
        ]
      },
      {
        "id": "tail-08-q-22",
        "coreWord": "가루양념",
        "word": "가루양념",
        "answer": "소금, 설탕, 후추",
        "targetWords": [
          "소금",
          "설탕",
          "후추"
        ],
        "distractorPool": [
          "우유",
          "주스",
          "콜라"
        ]
      },
      {
        "id": "tail-08-q-23",
        "coreWord": "음료수",
        "word": "음료수",
        "answer": "주스, 콜라, 사이다",
        "targetWords": [
          "주스",
          "콜라",
          "사이다"
        ],
        "distractorPool": [
          "소금",
          "설탕",
          "간장"
        ]
      },
      {
        "id": "tail-08-q-24",
        "coreWord": "냉동식품",
        "word": "냉동식품",
        "answer": "아이스크림, 냉동만두, 냉동피자",
        "targetWords": [
          "아이스크림",
          "냉동만두",
          "냉동피자"
        ],
        "distractorPool": [
          "뜨거운커피",
          "군고구마",
          "호빵"
        ]
      },
      {
        "id": "tail-08-q-25",
        "coreWord": "생필품",
        "word": "생필품",
        "answer": "휴지, 물티슈, 칫솔",
        "targetWords": [
          "휴지",
          "물티슈",
          "칫솔"
        ],
        "distractorPool": [
          "장난감",
          "인형",
          "게임기"
        ]
      },
      {
        "id": "tail-08-q-26",
        "coreWord": "세제류",
        "word": "세제류",
        "answer": "주방세제, 세탁세제, 섬유유연제",
        "targetWords": [
          "주방세제",
          "세탁세제",
          "섬유유연제"
        ],
        "distractorPool": [
          "케첩",
          "마요네즈",
          "머스타드"
        ]
      },
      {
        "id": "tail-08-q-27",
        "coreWord": "학용품코너",
        "word": "학용품코너",
        "answer": "스케치북, 색연필, 사인펜",
        "targetWords": [
          "스케치북",
          "색연필",
          "사인펜"
        ],
        "distractorPool": [
          "배추",
          "무",
          "대파"
        ]
      },
      {
        "id": "tail-08-q-28",
        "coreWord": "장난감코너",
        "word": "장난감코너",
        "answer": "로봇, 인형, 보드게임",
        "targetWords": [
          "로봇",
          "인형",
          "보드게임"
        ],
        "distractorPool": [
          "세탁세제",
          "주방세제",
          "휴지"
        ]
      },
      {
        "id": "tail-08-q-29",
        "coreWord": "욕실용품",
        "word": "욕실용품",
        "answer": "샴푸, 린스, 바디워시",
        "targetWords": [
          "샴푸",
          "린스",
          "바디워시"
        ],
        "distractorPool": [
          "프라이팬",
          "냄비",
          "국자"
        ]
      },
      {
        "id": "tail-08-q-30",
        "coreWord": "주방용품",
        "word": "주방용품",
        "answer": "냄비, 프라이팬, 고무장갑",
        "targetWords": [
          "냄비",
          "프라이팬",
          "고무장갑"
        ],
        "distractorPool": [
          "샴푸",
          "칫솔",
          "비누"
        ]
      },
      {
        "id": "tail-08-q-31",
        "coreWord": "식기류",
        "word": "식기류",
        "answer": "밥그릇, 접시, 머그컵",
        "targetWords": [
          "밥그릇",
          "접시",
          "머그컵"
        ],
        "distractorPool": [
          "수건",
          "때타월",
          "발매트"
        ]
      },
      {
        "id": "tail-08-q-32",
        "coreWord": "계산원행동",
        "word": "계산원행동",
        "answer": "바코드찍기, 돈받기, 영수증주기",
        "targetWords": [
          "바코드찍기",
          "돈받기",
          "영수증주기"
        ],
        "distractorPool": [
          "채소썰기",
          "요리하기",
          "식사하기"
        ]
      },
      {
        "id": "tail-08-q-33",
        "coreWord": "손님행동",
        "word": "손님행동",
        "answer": "물건고르기, 카트밀기, 돈내기",
        "targetWords": [
          "물건고르기",
          "카트밀기",
          "돈내기"
        ],
        "distractorPool": [
          "바코드찍기",
          "계산하기",
          "포스기다루기"
        ]
      },
      {
        "id": "tail-08-q-34",
        "coreWord": "가격단위",
        "word": "가격단위",
        "answer": "원, 천원, 만원",
        "targetWords": [
          "원",
          "천원",
          "만원"
        ],
        "distractorPool": [
          "킬로그램",
          "리터",
          "센티미터"
        ]
      },
      {
        "id": "tail-08-q-35",
        "coreWord": "무게단위",
        "word": "무게단위",
        "answer": "그램, 킬로그램, 근",
        "targetWords": [
          "그램",
          "킬로그램",
          "근"
        ],
        "distractorPool": [
          "원",
          "천원",
          "만원"
        ]
      },
      {
        "id": "tail-08-q-36",
        "coreWord": "과일포장",
        "word": "과일포장",
        "answer": "팩, 묶음, 상자",
        "targetWords": [
          "팩",
          "묶음",
          "상자"
        ],
        "distractorPool": [
          "리터",
          "밀리리터",
          "병"
        ]
      },
      {
        "id": "tail-08-q-37",
        "coreWord": "음료포장",
        "word": "음료포장",
        "answer": "페트병, 캔, 유리병",
        "targetWords": [
          "페트병",
          "캔",
          "유리병"
        ],
        "distractorPool": [
          "봉지",
          "팩",
          "상자"
        ]
      },
      {
        "id": "tail-08-q-38",
        "coreWord": "고기부위",
        "word": "고기부위",
        "answer": "삼겹살, 목살, 안심",
        "targetWords": [
          "삼겹살",
          "목살",
          "안심"
        ],
        "distractorPool": [
          "사과",
          "배",
          "귤"
        ]
      },
      {
        "id": "tail-08-q-39",
        "coreWord": "생선손질",
        "word": "생선손질",
        "answer": "비늘벗기기, 내장빼기, 토막내기",
        "targetWords": [
          "비늘벗기기",
          "내장빼기",
          "토막내기"
        ],
        "distractorPool": [
          "껍질깎기",
          "씨빼기",
          "채썰기"
        ]
      },
      {
        "id": "tail-08-q-40",
        "coreWord": "마트주차장",
        "word": "마트주차장",
        "answer": "주차구역, 카트보관소, 주차권",
        "targetWords": [
          "주차구역",
          "카트보관소",
          "주차권"
        ],
        "distractorPool": [
          "계산대",
          "시식코너",
          "정육점"
        ]
      },
      {
        "id": "tail-08-q-41",
        "coreWord": "자율포장대",
        "word": "자율포장대",
        "answer": "빈상자, 테이프, 가위",
        "targetWords": [
          "빈상자",
          "테이프",
          "가위"
        ],
        "distractorPool": [
          "카트",
          "장바구니",
          "지갑"
        ]
      },
      {
        "id": "tail-08-q-42",
        "coreWord": "마트카트",
        "word": "마트카트",
        "answer": "손잡이, 바퀴, 동전투입구",
        "targetWords": [
          "손잡이",
          "바퀴",
          "동전투입구"
        ],
        "distractorPool": [
          "엔진",
          "핸들",
          "브레이크"
        ]
      },
      {
        "id": "tail-08-q-43",
        "coreWord": "결제수단",
        "word": "결제수단",
        "answer": "현금, 신용카드, 모바일결제",
        "targetWords": [
          "현금",
          "신용카드",
          "모바일결제"
        ],
        "distractorPool": [
          "색종이",
          "딱지",
          "구슬"
        ]
      },
      {
        "id": "tail-08-q-44",
        "coreWord": "거스름돈",
        "word": "거스름돈",
        "answer": "오천원권, 천원권, 동전",
        "targetWords": [
          "오천원권",
          "천원권",
          "동전"
        ],
        "distractorPool": [
          "신용카드",
          "체크카드",
          "포인트"
        ]
      },
      {
        "id": "tail-08-q-45",
        "coreWord": "쇼핑목록",
        "word": "쇼핑목록",
        "answer": "메모지, 스마트폰메모, 기억하기",
        "targetWords": [
          "메모지",
          "스마트폰메모",
          "기억하기"
        ],
        "distractorPool": [
          "일기장",
          "동화책",
          "그림책"
        ]
      },
      {
        "id": "tail-08-q-46",
        "coreWord": "짐들기",
        "word": "짐들기",
        "answer": "양손에들기, 트렁크에싣기, 배달시키기",
        "targetWords": [
          "양손에들기",
          "트렁크에싣기",
          "배달시키기"
        ],
        "distractorPool": [
          "발로차기",
          "던지기",
          "찢어버리기"
        ]
      },
      {
        "id": "tail-08-q-47",
        "coreWord": "마트직원",
        "word": "마트직원",
        "answer": "캐셔, 진열직원, 매니저",
        "targetWords": [
          "캐셔",
          "진열직원",
          "매니저"
        ],
        "distractorPool": [
          "선생님",
          "경찰관",
          "소방관"
        ]
      },
      {
        "id": "tail-08-q-48",
        "coreWord": "고객센터",
        "word": "고객센터",
        "answer": "환불, 교환, 분실물찾기",
        "targetWords": [
          "환불",
          "교환",
          "분실물찾기"
        ],
        "distractorPool": [
          "시식",
          "장보기",
          "요리하기"
        ]
      },
      {
        "id": "tail-08-q-49",
        "coreWord": "유통기한확인",
        "word": "유통기한확인",
        "answer": "날짜보기, 신선도확인, 상한것빼기",
        "targetWords": [
          "날짜보기",
          "신선도확인",
          "상한것빼기"
        ],
        "distractorPool": [
          "그냥사기",
          "던져버리기",
          "맛보기"
        ]
      },
      {
        "id": "tail-08-q-50",
        "coreWord": "과일고르기",
        "word": "과일고르기",
        "answer": "색깔보기, 상처확인, 향기맡기",
        "targetWords": [
          "색깔보기",
          "상처확인",
          "향기맡기"
        ],
        "distractorPool": [
          "발로차보기",
          "터뜨려보기",
          "찢어보기"
        ]
      },
      {
        "id": "tail-08-q-51",
        "coreWord": "마트안내방송",
        "word": "마트안내방송",
        "answer": "세일안내, 미아찾기, 폐점안내",
        "targetWords": [
          "세일안내",
          "미아찾기",
          "폐점안내"
        ],
        "distractorPool": [
          "동요",
          "만화주제가",
          "자장가"
        ]
      },
      {
        "id": "tail-08-q-52",
        "coreWord": "에스컬레이터",
        "word": "에스컬레이터",
        "answer": "손잡이잡기, 카트고정, 걷지않기",
        "targetWords": [
          "손잡이잡기",
          "카트고정",
          "걷지않기"
        ],
        "distractorPool": [
          "뛰어다니기",
          "장난치기",
          "거꾸로타기"
        ]
      },
      {
        "id": "tail-08-q-53",
        "coreWord": "대용량",
        "word": "대용량",
        "answer": "벌크포장, 박스단위, 창고형마트",
        "targetWords": [
          "벌크포장",
          "박스단위",
          "창고형마트"
        ],
        "distractorPool": [
          "낱개포장",
          "한입거리",
          "소포장"
        ]
      },
      {
        "id": "tail-08-q-54",
        "coreWord": "반찬코너",
        "word": "반찬코너",
        "answer": "김치, 젓갈, 마른반찬",
        "targetWords": [
          "김치",
          "젓갈",
          "마른반찬"
        ],
        "distractorPool": [
          "케이크",
          "빵",
          "아이스크림"
        ]
      },
      {
        "id": "tail-08-q-55",
        "coreWord": "빵집",
        "word": "빵집",
        "answer": "바게트, 케이크, 단팥빵",
        "targetWords": [
          "바게트",
          "케이크",
          "단팥빵"
        ],
        "distractorPool": [
          "고등어",
          "오징어",
          "갈치"
        ]
      },
      {
        "id": "tail-08-q-56",
        "coreWord": "애완용품",
        "word": "애완용품",
        "answer": "강아지사료, 고양이모래, 개껌",
        "targetWords": [
          "강아지사료",
          "고양이모래",
          "개껌"
        ],
        "distractorPool": [
          "연필",
          "지우개",
          "공책"
        ]
      },
      {
        "id": "tail-08-q-57",
        "coreWord": "캠핑용품",
        "word": "캠핑용품",
        "answer": "텐트, 돗자리, 숯",
        "targetWords": [
          "텐트",
          "돗자리",
          "숯"
        ],
        "distractorPool": [
          "냉장고",
          "세탁기",
          "에어컨"
        ]
      },
      {
        "id": "tail-08-q-58",
        "coreWord": "건전지",
        "word": "건전지",
        "answer": "에이에이, 리모컨약, 충전기",
        "targetWords": [
          "에이에이",
          "리모컨약",
          "충전기"
        ],
        "distractorPool": [
          "물감",
          "붓",
          "도화지"
        ]
      },
      {
        "id": "tail-08-q-59",
        "coreWord": "조미료",
        "word": "조미료",
        "answer": "케첩, 마요네즈, 머스타드",
        "targetWords": [
          "케첩",
          "마요네즈",
          "머스타드"
        ],
        "distractorPool": [
          "비누",
          "샴푸",
          "치약"
        ]
      },
      {
        "id": "tail-08-q-60",
        "coreWord": "장보기끝",
        "word": "장보기끝",
        "answer": "영수증챙기기, 짐싸기, 집으로가기",
        "targetWords": [
          "영수증챙기기",
          "짐싸기",
          "집으로가기"
        ],
        "distractorPool": [
          "물건고르기",
          "카트끌기",
          "시식하기"
        ]
      }
    ]
  },
  {
    "id": "tail-09",
    "title": "초등 06",
    "schoolLevelLabel": "06",
    "bandLabel": "초등",
    "descriptor": "일상생활과행동",
    "grammarFocus": "일상생활과행동",
    "goalCopy": "일상생활과행동 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 28,
    "questions": [
      {
        "id": "tail-09-q-01",
        "coreWord": "아침",
        "word": "아침",
        "answer": "기상, 세수, 양치",
        "targetWords": [
          "기상",
          "세수",
          "양치"
        ],
        "distractorPool": [
          "퇴근",
          "야근",
          "결제"
        ]
      },
      {
        "id": "tail-09-q-02",
        "coreWord": "외출준비",
        "word": "외출준비",
        "answer": "옷입기, 양말신기, 신발신기",
        "targetWords": [
          "옷입기",
          "양말신기",
          "신발신기"
        ],
        "distractorPool": [
          "잠옷입기",
          "이불덮기",
          "베개베기"
        ]
      },
      {
        "id": "tail-09-q-03",
        "coreWord": "청소하기",
        "word": "청소하기",
        "answer": "빗자루질, 청소기돌리기, 걸레질",
        "targetWords": [
          "빗자루질",
          "청소기돌리기",
          "걸레질"
        ],
        "distractorPool": [
          "게임하기",
          "영화보기",
          "낮잠자기"
        ]
      },
      {
        "id": "tail-09-q-04",
        "coreWord": "세탁",
        "word": "세탁",
        "answer": "세탁기돌리기, 빨래널기, 옷개기",
        "targetWords": [
          "세탁기돌리기",
          "빨래널기",
          "옷개기"
        ],
        "distractorPool": [
          "전자레인지돌리기",
          "요리하기",
          "설거지하기"
        ]
      },
      {
        "id": "tail-09-q-05",
        "coreWord": "밥먹기",
        "word": "밥먹기",
        "answer": "숟가락들기, 젓가락질, 음식씹기",
        "targetWords": [
          "숟가락들기",
          "젓가락질",
          "음식씹기"
        ],
        "distractorPool": [
          "가위질하기",
          "풀칠하기",
          "색칠하기"
        ]
      },
      {
        "id": "tail-09-q-06",
        "coreWord": "시청",
        "word": "시청",
        "answer": "텔레비전켜기, 채널바꾸기, 볼륨조절",
        "targetWords": [
          "텔레비전켜기",
          "채널바꾸기",
          "볼륨조절"
        ],
        "distractorPool": [
          "에어컨켜기",
          "선풍기틀기",
          "난로켜기"
        ]
      },
      {
        "id": "tail-09-q-07",
        "coreWord": "씻기",
        "word": "씻기",
        "answer": "샤워하기, 머리감기, 수건으로닦기",
        "targetWords": [
          "샤워하기",
          "머리감기",
          "수건으로닦기"
        ],
        "distractorPool": [
          "그림그리기",
          "색칠하기",
          "오리기"
        ]
      },
      {
        "id": "tail-09-q-08",
        "coreWord": "학교일과",
        "word": "학교일과",
        "answer": "등교하기, 수업듣기, 하교하기",
        "targetWords": [
          "등교하기",
          "수업듣기",
          "하교하기"
        ],
        "distractorPool": [
          "출장가기",
          "출근하기",
          "퇴사하기"
        ]
      },
      {
        "id": "tail-09-q-09",
        "coreWord": "예절",
        "word": "예절",
        "answer": "인사하기, 안부묻기, 배꼽인사",
        "targetWords": [
          "인사하기",
          "안부묻기",
          "배꼽인사"
        ],
        "distractorPool": [
          "싸우기",
          "훔치기",
          "도망치기"
        ]
      },
      {
        "id": "tail-09-q-10",
        "coreWord": "공부",
        "word": "공부",
        "answer": "숙제하기, 책읽기, 연필깎기",
        "targetWords": [
          "숙제하기",
          "책읽기",
          "연필깎기"
        ],
        "distractorPool": [
          "요리하기",
          "설거지하기",
          "분리수거"
        ]
      },
      {
        "id": "tail-09-q-11",
        "coreWord": "수면준비",
        "word": "수면준비",
        "answer": "불끄기, 이불덮기, 눈감기",
        "targetWords": [
          "불끄기",
          "이불덮기",
          "눈감기"
        ],
        "distractorPool": [
          "불켜기",
          "달리기",
          "춤추기"
        ]
      },
      {
        "id": "tail-09-q-12",
        "coreWord": "비오는날",
        "word": "비오는날",
        "answer": "우산쓰기, 장화신기, 우비입기",
        "targetWords": [
          "우산쓰기",
          "장화신기",
          "우비입기"
        ],
        "distractorPool": [
          "선글라스끼기",
          "모자쓰기",
          "선크림바르기"
        ]
      },
      {
        "id": "tail-09-q-13",
        "coreWord": "버리기",
        "word": "버리기",
        "answer": "분리수거하기, 쓰레기통비우기, 봉투묶기",
        "targetWords": [
          "분리수거하기",
          "쓰레기통비우기",
          "봉투묶기"
        ],
        "distractorPool": [
          "선물하기",
          "포장하기",
          "저축하기"
        ]
      },
      {
        "id": "tail-09-q-14",
        "coreWord": "물마시기",
        "word": "물마시기",
        "answer": "냉장고열기, 컵에따르기, 꿀꺽마시기",
        "targetWords": [
          "냉장고열기",
          "컵에따르기",
          "꿀꺽마시기"
        ],
        "distractorPool": [
          "불태우기",
          "부수기",
          "얼리기"
        ]
      },
      {
        "id": "tail-09-q-15",
        "coreWord": "단정하게",
        "word": "단정하게",
        "answer": "머리빗기, 거울보기, 옷매무새고치기",
        "targetWords": [
          "머리빗기",
          "거울보기",
          "옷매무새고치기"
        ],
        "distractorPool": [
          "어지럽히기",
          "찢기",
          "헝클기"
        ]
      },
      {
        "id": "tail-09-q-16",
        "coreWord": "휴식",
        "word": "휴식",
        "answer": "소파에눕기, 눈감기, 기지개켜기",
        "targetWords": [
          "소파에눕기",
          "눈감기",
          "기지개켜기"
        ],
        "distractorPool": [
          "뜀틀넘기",
          "줄넘기",
          "이어달리기"
        ]
      },
      {
        "id": "tail-09-q-17",
        "coreWord": "요리",
        "word": "요리",
        "answer": "재료씻기, 칼질하기, 가스불켜기",
        "targetWords": [
          "재료씻기",
          "칼질하기",
          "가스불켜기"
        ],
        "distractorPool": [
          "빨래개기",
          "청소기돌리기",
          "먼지털기"
        ]
      },
      {
        "id": "tail-09-q-18",
        "coreWord": "쓰레기",
        "word": "쓰레기",
        "answer": "종이접기, 플라스틱모으기, 캔찌그러뜨리기",
        "targetWords": [
          "종이접기",
          "플라스틱모으기",
          "캔찌그러뜨리기"
        ],
        "distractorPool": [
          "밥먹기",
          "국마시기",
          "반찬투정"
        ]
      },
      {
        "id": "tail-09-q-19",
        "coreWord": "손씻기",
        "word": "손씻기",
        "answer": "비누칠하기, 거품내기, 물로헹구기",
        "targetWords": [
          "비누칠하기",
          "거품내기",
          "물로헹구기"
        ],
        "distractorPool": [
          "양치질하기",
          "가글하기",
          "침뱉기"
        ]
      },
      {
        "id": "tail-09-q-20",
        "coreWord": "환기",
        "word": "환기",
        "answer": "창문열기, 공기순환, 냄새빼기",
        "targetWords": [
          "창문열기",
          "공기순환",
          "냄새빼기"
        ],
        "distractorPool": [
          "이불덮기",
          "보일러켜기",
          "전기장판"
        ]
      },
      {
        "id": "tail-09-q-21",
        "coreWord": "식사후",
        "word": "식사후",
        "answer": "그릇치우기, 식탁닦기, 양치하기",
        "targetWords": [
          "그릇치우기",
          "식탁닦기",
          "양치하기"
        ],
        "distractorPool": [
          "요리하기",
          "재료썰기",
          "불켜기"
        ]
      },
      {
        "id": "tail-09-q-22",
        "coreWord": "이불정리",
        "word": "이불정리",
        "answer": "이불개기, 베개놓기, 반듯하게하기",
        "targetWords": [
          "이불개기",
          "베개놓기",
          "반듯하게하기"
        ],
        "distractorPool": [
          "구기기",
          "어지럽히기",
          "던지기"
        ]
      },
      {
        "id": "tail-09-q-23",
        "coreWord": "외출전",
        "word": "외출전",
        "answer": "거울보기, 가방싸기, 문단속하기",
        "targetWords": [
          "거울보기",
          "가방싸기",
          "문단속하기"
        ],
        "distractorPool": [
          "신발벗기",
          "손씻기",
          "잠옷입기"
        ]
      },
      {
        "id": "tail-09-q-24",
        "coreWord": "귀가후",
        "word": "귀가후",
        "answer": "신발정리, 외투벗기, 손씻기",
        "targetWords": [
          "신발정리",
          "외투벗기",
          "손씻기"
        ],
        "distractorPool": [
          "가방싸기",
          "신발신기",
          "문잠그기"
        ]
      },
      {
        "id": "tail-09-q-25",
        "coreWord": "장난감놀이",
        "word": "장난감놀이",
        "answer": "꺼내기, 조립하기, 정리하기",
        "targetWords": [
          "꺼내기",
          "조립하기",
          "정리하기"
        ],
        "distractorPool": [
          "버리기",
          "부수기",
          "숨기기"
        ]
      },
      {
        "id": "tail-09-q-26",
        "coreWord": "화초가꾸기",
        "word": "화초가꾸기",
        "answer": "화분놓기, 물뿌리기, 햇볕쬐기",
        "targetWords": [
          "화분놓기",
          "물뿌리기",
          "햇볕쬐기"
        ],
        "distractorPool": [
          "뽑아버리기",
          "밟기",
          "꺾기"
        ]
      },
      {
        "id": "tail-09-q-27",
        "coreWord": "더울때",
        "word": "더울때",
        "answer": "선풍기틀기, 창문열기, 얼음물마시기",
        "targetWords": [
          "선풍기틀기",
          "창문열기",
          "얼음물마시기"
        ],
        "distractorPool": [
          "난로켜기",
          "핫팩쥐기",
          "패딩입기"
        ]
      },
      {
        "id": "tail-09-q-28",
        "coreWord": "추울때",
        "word": "추울때",
        "answer": "보일러켜기, 이불덮기, 따뜻한물마시기",
        "targetWords": [
          "보일러켜기",
          "이불덮기",
          "따뜻한물마시기"
        ],
        "distractorPool": [
          "에어컨틀기",
          "찬물샤워",
          "아이스크림먹기"
        ]
      },
      {
        "id": "tail-09-q-29",
        "coreWord": "독서",
        "word": "독서",
        "answer": "책꺼내기, 책장넘기기, 밑줄치기",
        "targetWords": [
          "책꺼내기",
          "책장넘기기",
          "밑줄치기"
        ],
        "distractorPool": [
          "텔레비전켜기",
          "리모컨누르기",
          "볼륨높이기"
        ]
      },
      {
        "id": "tail-09-q-30",
        "coreWord": "그림그리기",
        "word": "그림그리기",
        "answer": "스케치북펴기, 연필쥐기, 색칠하기",
        "targetWords": [
          "스케치북펴기",
          "연필쥐기",
          "색칠하기"
        ],
        "distractorPool": [
          "피아노치기",
          "노래부르기",
          "춤추기"
        ]
      },
      {
        "id": "tail-09-q-31",
        "coreWord": "식사준비",
        "word": "식사준비",
        "answer": "수저놓기, 반찬꺼내기, 물따르기",
        "targetWords": [
          "수저놓기",
          "반찬꺼내기",
          "물따르기"
        ],
        "distractorPool": [
          "양치하기",
          "세수하기",
          "머리감기"
        ]
      },
      {
        "id": "tail-09-q-32",
        "coreWord": "옷입기",
        "word": "옷입기",
        "answer": "단추채우기, 지퍼올리기, 허리띠매기",
        "targetWords": [
          "단추채우기",
          "지퍼올리기",
          "허리띠매기"
        ],
        "distractorPool": [
          "벗기",
          "찢기",
          "구기기"
        ]
      },
      {
        "id": "tail-09-q-33",
        "coreWord": "신발신기",
        "word": "신발신기",
        "answer": "뒤꿈치넣기, 끈묶기, 찍찍이붙이기",
        "targetWords": [
          "뒤꿈치넣기",
          "끈묶기",
          "찍찍이붙이기"
        ],
        "distractorPool": [
          "벗어던지기",
          "맨발걷기",
          "밟기"
        ]
      },
      {
        "id": "tail-09-q-34",
        "coreWord": "전화걸기",
        "word": "전화걸기",
        "answer": "번호누르기, 통화버튼누르기, 인사하기",
        "targetWords": [
          "번호누르기",
          "통화버튼누르기",
          "인사하기"
        ],
        "distractorPool": [
          "던지기",
          "부수기",
          "숨기기"
        ]
      },
      {
        "id": "tail-09-q-35",
        "coreWord": "일기쓰기",
        "word": "일기쓰기",
        "answer": "날짜적기, 날씨적기, 생각적기",
        "targetWords": [
          "날짜적기",
          "날씨적기",
          "생각적기"
        ],
        "distractorPool": [
          "지우기",
          "오리기",
          "찢기"
        ]
      },
      {
        "id": "tail-09-q-36",
        "coreWord": "사진찍기",
        "word": "사진찍기",
        "answer": "카메라들기, 웃기, 찰칵하기",
        "targetWords": [
          "카메라들기",
          "웃기",
          "찰칵하기"
        ],
        "distractorPool": [
          "도망가기",
          "숨기",
          "눈감기"
        ]
      },
      {
        "id": "tail-09-q-37",
        "coreWord": "인사예절",
        "word": "인사예절",
        "answer": "고개숙이기, 미소짓기, 큰소리로말하기",
        "targetWords": [
          "고개숙이기",
          "미소짓기",
          "큰소리로말하기"
        ],
        "distractorPool": [
          "노려보기",
          "무시하기",
          "소리치기"
        ]
      },
      {
        "id": "tail-09-q-38",
        "coreWord": "친구만날때",
        "word": "친구만날때",
        "answer": "손흔들기, 반갑게웃기, 안부묻기",
        "targetWords": [
          "손흔들기",
          "반갑게웃기",
          "안부묻기"
        ],
        "distractorPool": [
          "때리기",
          "싸우기",
          "뺏기"
        ]
      },
      {
        "id": "tail-09-q-39",
        "coreWord": "헤어질때",
        "word": "헤어질때",
        "answer": "인사하기, 내일보자하기, 손흔들기",
        "targetWords": [
          "인사하기",
          "내일보자하기",
          "손흔들기"
        ],
        "distractorPool": [
          "다시는보지말기",
          "욕하기",
          "화내기"
        ]
      },
      {
        "id": "tail-09-q-40",
        "coreWord": "화장실사용",
        "word": "화장실사용",
        "answer": "문닫기, 볼일보기, 물내리기",
        "targetWords": [
          "문닫기",
          "볼일보기",
          "물내리기"
        ],
        "distractorPool": [
          "문열어두기",
          "훔쳐보기",
          "장난치기"
        ]
      },
      {
        "id": "tail-09-q-41",
        "coreWord": "목욕탕",
        "word": "목욕탕",
        "answer": "옷벗기, 따뜻한물틀기, 때밀기",
        "targetWords": [
          "옷벗기",
          "따뜻한물틀기",
          "때밀기"
        ],
        "distractorPool": [
          "옷입기",
          "신발신기",
          "화장하기"
        ]
      },
      {
        "id": "tail-09-q-42",
        "coreWord": "냉장고",
        "word": "냉장고",
        "answer": "문열기, 반찬꺼내기, 문닫기",
        "targetWords": [
          "문열기",
          "반찬꺼내기",
          "문닫기"
        ],
        "distractorPool": [
          "문열어두기",
          "부수기",
          "숨기기"
        ]
      },
      {
        "id": "tail-09-q-43",
        "coreWord": "전자레인지",
        "word": "전자레인지",
        "answer": "음식넣기, 시간맞추기, 시작누르기",
        "targetWords": [
          "음식넣기",
          "시간맞추기",
          "시작누르기"
        ],
        "distractorPool": [
          "얼리기",
          "씻기",
          "버리기"
        ]
      },
      {
        "id": "tail-09-q-44",
        "coreWord": "컴퓨터",
        "word": "컴퓨터",
        "answer": "전원켜기, 마우스쥐기, 타자키기",
        "targetWords": [
          "전원켜기",
          "마우스쥐기",
          "타자키기"
        ],
        "distractorPool": [
          "발로차기",
          "물뿌리기",
          "던지기"
        ]
      },
      {
        "id": "tail-09-q-45",
        "coreWord": "스마트폰",
        "word": "스마트폰",
        "answer": "화면켜기, 터치하기, 스크롤하기",
        "targetWords": [
          "화면켜기",
          "터치하기",
          "스크롤하기"
        ],
        "distractorPool": [
          "숨기기",
          "던지기",
          "밟기"
        ]
      },
      {
        "id": "tail-09-q-46",
        "coreWord": "길걷기",
        "word": "길걷기",
        "answer": "앞보기, 똑바로걷기, 좌우살피기",
        "targetWords": [
          "앞보기",
          "똑바로걷기",
          "좌우살피기"
        ],
        "distractorPool": [
          "뛰어가기",
          "눈감기",
          "뒤로걷기"
        ]
      },
      {
        "id": "tail-09-q-47",
        "coreWord": "계단오르기",
        "word": "계단오르기",
        "answer": "손잡이잡기, 한칸씩오르기, 조심하기",
        "targetWords": [
          "손잡이잡기",
          "한칸씩오르기",
          "조심하기"
        ],
        "distractorPool": [
          "뛰어내리기",
          "세칸씩뛰기",
          "장난치기"
        ]
      },
      {
        "id": "tail-09-q-48",
        "coreWord": "엘리베이터",
        "word": "엘리베이터",
        "answer": "버튼누르기, 기다리기, 내린후타기",
        "targetWords": [
          "버튼누르기",
          "기다리기",
          "내린후타기"
        ],
        "distractorPool": [
          "문강제로열기",
          "뛰기",
          "새치기하기"
        ]
      },
      {
        "id": "tail-09-q-49",
        "coreWord": "버스타기",
        "word": "버스타기",
        "answer": "줄서기, 카드찍기, 손잡이잡기",
        "targetWords": [
          "줄서기",
          "카드찍기",
          "손잡이잡기"
        ],
        "distractorPool": [
          "새치기하기",
          "소리치기",
          "밀치기"
        ]
      },
      {
        "id": "tail-09-q-50",
        "coreWord": "횡단보도",
        "word": "횡단보도",
        "answer": "멈추기, 초록불기다리기, 손들고건너기",
        "targetWords": [
          "멈추기",
          "초록불기다리기",
          "손들고건너기"
        ],
        "distractorPool": [
          "빨간불에건너기",
          "무단횡단하기",
          "뛰어가기"
        ]
      },
      {
        "id": "tail-09-q-51",
        "coreWord": "장보기",
        "word": "장보기",
        "answer": "카트밀기, 물건고르기, 계산하기",
        "targetWords": [
          "카트밀기",
          "물건고르기",
          "계산하기"
        ],
        "distractorPool": [
          "도망가기",
          "숨기기",
          "훔치기"
        ]
      },
      {
        "id": "tail-09-q-52",
        "coreWord": "심부름",
        "word": "심부름",
        "answer": "메모하기, 돈챙기기, 거스름돈받기",
        "targetWords": [
          "메모하기",
          "돈챙기기",
          "거스름돈받기"
        ],
        "distractorPool": [
          "잊어버리기",
          "잃어버리기",
          "도망가기"
        ]
      },
      {
        "id": "tail-09-q-53",
        "coreWord": "약먹기",
        "word": "약먹기",
        "answer": "약봉지뜯기, 물마시기, 꿀꺽삼키기",
        "targetWords": [
          "약봉지뜯기",
          "물마시기",
          "꿀꺽삼키기"
        ],
        "distractorPool": [
          "뱉기",
          "버리기",
          "숨기기"
        ]
      },
      {
        "id": "tail-09-q-54",
        "coreWord": "상처치료",
        "word": "상처치료",
        "answer": "소독하기, 연고바르기, 밴드붙이기",
        "targetWords": [
          "소독하기",
          "연고바르기",
          "밴드붙이기"
        ],
        "distractorPool": [
          "긁기",
          "떼어내기",
          "더럽히기"
        ]
      },
      {
        "id": "tail-09-q-55",
        "coreWord": "감기예방",
        "word": "감기예방",
        "answer": "손씻기, 마스크쓰기, 따뜻하게입기",
        "targetWords": [
          "손씻기",
          "마스크쓰기",
          "따뜻하게입기"
        ],
        "distractorPool": [
          "찬물마시기",
          "얇게입기",
          "비맞기"
        ]
      },
      {
        "id": "tail-09-q-56",
        "coreWord": "우산사용",
        "word": "우산사용",
        "answer": "버튼누르기, 우산펴기, 비피하기",
        "targetWords": [
          "버튼누르기",
          "우산펴기",
          "비피하기"
        ],
        "distractorPool": [
          "접기",
          "부러뜨리기",
          "던지기"
        ]
      },
      {
        "id": "tail-09-q-57",
        "coreWord": "눈오는날",
        "word": "눈오는날",
        "answer": "장갑끼기, 눈뭉치기, 눈사람만들기",
        "targetWords": [
          "장갑끼기",
          "눈뭉치기",
          "눈사람만들기"
        ],
        "distractorPool": [
          "선글라스끼기",
          "수영복입기",
          "부채질하기"
        ]
      },
      {
        "id": "tail-09-q-58",
        "coreWord": "미세먼지",
        "word": "미세먼지",
        "answer": "마스크쓰기, 창문닫기, 외출자제하기",
        "targetWords": [
          "마스크쓰기",
          "창문닫기",
          "외출자제하기"
        ],
        "distractorPool": [
          "창문열기",
          "밖에서뛰기",
          "마스크벗기"
        ]
      },
      {
        "id": "tail-09-q-59",
        "coreWord": "칭찬받기",
        "word": "칭찬받기",
        "answer": "미소짓기, 고맙다고하기, 기뻐하기",
        "targetWords": [
          "미소짓기",
          "고맙다고하기",
          "기뻐하기"
        ],
        "distractorPool": [
          "화내기",
          "우울하기",
          "도망가기"
        ]
      },
      {
        "id": "tail-09-q-60",
        "coreWord": "혼나기",
        "word": "혼나기",
        "answer": "반성하기, 죄송하다하기, 고치기",
        "targetWords": [
          "반성하기",
          "죄송하다하기",
          "고치기"
        ],
        "distractorPool": [
          "대들기",
          "도망가기",
          "거짓말하기"
        ]
      }
    ]
  },
  {
    "id": "tail-10",
    "title": "초등 07",
    "schoolLevelLabel": "07",
    "bandLabel": "초등",
    "descriptor": "편의점과간식",
    "grammarFocus": "편의점과간식",
    "goalCopy": "편의점과간식 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 28,
    "questions": [
      {
        "id": "tail-10-q-01",
        "coreWord": "즉석음식",
        "word": "즉석음식",
        "answer": "삼각김밥, 컵라면, 핫바",
        "targetWords": [
          "삼각김밥",
          "컵라면",
          "핫바"
        ],
        "distractorPool": [
          "프라이팬",
          "도마",
          "식칼"
        ]
      },
      {
        "id": "tail-10-q-02",
        "coreWord": "계산기기",
        "word": "계산기기",
        "answer": "바코드, 포스기, 스캐너",
        "targetWords": [
          "바코드",
          "포스기",
          "스캐너"
        ],
        "distractorPool": [
          "침대",
          "소파",
          "장롱"
        ]
      },
      {
        "id": "tail-10-q-03",
        "coreWord": "결제수단",
        "word": "결제수단",
        "answer": "교통카드, 신용카드, 현금",
        "targetWords": [
          "교통카드",
          "신용카드",
          "현금"
        ],
        "distractorPool": [
          "색종이",
          "가위",
          "풀"
        ]
      },
      {
        "id": "tail-10-q-04",
        "coreWord": "차가운것",
        "word": "차가운것",
        "answer": "아이스크림, 얼음컵, 냉동만두",
        "targetWords": [
          "아이스크림",
          "얼음컵",
          "냉동만두"
        ],
        "distractorPool": [
          "핫팩",
          "난로",
          "온수기"
        ]
      },
      {
        "id": "tail-10-q-05",
        "coreWord": "데워먹는것",
        "word": "데워먹는것",
        "answer": "도시락, 핫도그, 햄버거",
        "targetWords": [
          "도시락",
          "핫도그",
          "햄버거"
        ],
        "distractorPool": [
          "아이스크림",
          "얼음",
          "생수"
        ]
      },
      {
        "id": "tail-10-q-06",
        "coreWord": "할인행사",
        "word": "할인행사",
        "answer": "원플러스원, 투플러스원, 행사상품",
        "targetWords": [
          "원플러스원",
          "투플러스원",
          "행사상품"
        ],
        "distractorPool": [
          "세금",
          "벌금",
          "연체료"
        ]
      },
      {
        "id": "tail-10-q-07",
        "coreWord": "증명서",
        "word": "증명서",
        "answer": "영수증, 결제내역, 전자영수증",
        "targetWords": [
          "영수증",
          "결제내역",
          "전자영수증"
        ],
        "distractorPool": [
          "초대장",
          "상장",
          "일기"
        ]
      },
      {
        "id": "tail-10-q-08",
        "coreWord": "일하는사람",
        "word": "일하는사람",
        "answer": "알바생, 점장님, 계산원",
        "targetWords": [
          "알바생",
          "점장님",
          "계산원"
        ],
        "distractorPool": [
          "경찰",
          "소방관",
          "의사"
        ]
      },
      {
        "id": "tail-10-q-09",
        "coreWord": "상점종류",
        "word": "상점종류",
        "answer": "편의점, 슈퍼마켓, 무인점포",
        "targetWords": [
          "편의점",
          "슈퍼마켓",
          "무인점포"
        ],
        "distractorPool": [
          "우체국",
          "경찰서",
          "동사무소"
        ]
      },
      {
        "id": "tail-10-q-10",
        "coreWord": "쓰레기통",
        "word": "쓰레기통",
        "answer": "분리수거함, 일반쓰레기, 음식물수거함",
        "targetWords": [
          "분리수거함",
          "일반쓰레기",
          "음식물수거함"
        ],
        "distractorPool": [
          "저금통",
          "보석함",
          "지갑"
        ]
      },
      {
        "id": "tail-10-q-11",
        "coreWord": "음료수통",
        "word": "음료수통",
        "answer": "캔, 페트병, 종이팩",
        "targetWords": [
          "캔",
          "페트병",
          "종이팩"
        ],
        "distractorPool": [
          "책",
          "공책",
          "지우개"
        ]
      },
      {
        "id": "tail-10-q-12",
        "coreWord": "결제포인트",
        "word": "결제포인트",
        "answer": "기프트카드, 문화상품권, 마일리지",
        "targetWords": [
          "기프트카드",
          "문화상품권",
          "마일리지"
        ],
        "distractorPool": [
          "우표",
          "엽서",
          "편지봉투"
        ]
      },
      {
        "id": "tail-10-q-13",
        "coreWord": "택배업무",
        "word": "택배업무",
        "answer": "반값택배, 송장, 배송비",
        "targetWords": [
          "반값택배",
          "송장",
          "배송비"
        ],
        "distractorPool": [
          "여권",
          "주민등록증",
          "등본"
        ]
      },
      {
        "id": "tail-10-q-14",
        "coreWord": "비상약",
        "word": "비상약",
        "answer": "감기약, 소화제, 파스",
        "targetWords": [
          "감기약",
          "소화제",
          "파스"
        ],
        "distractorPool": [
          "장난감",
          "인형",
          "로봇"
        ]
      },
      {
        "id": "tail-10-q-15",
        "coreWord": "밖에서먹기",
        "word": "밖에서먹기",
        "answer": "파라솔, 야외테이블, 플라스틱의자",
        "targetWords": [
          "파라솔",
          "야외테이블",
          "플라스틱의자"
        ],
        "distractorPool": [
          "침대",
          "책상",
          "식탁"
        ]
      },
      {
        "id": "tail-10-q-16",
        "coreWord": "컵라면조리",
        "word": "컵라면조리",
        "answer": "비닐뜯기, 스프넣기, 뜨거운물붓기",
        "targetWords": [
          "비닐뜯기",
          "스프넣기",
          "뜨거운물붓기"
        ],
        "distractorPool": [
          "냉동실넣기",
          "얼음얼리기",
          "세탁기돌리기"
        ]
      },
      {
        "id": "tail-10-q-17",
        "coreWord": "전자레인지",
        "word": "전자레인지",
        "answer": "시간누르기, 데우기, 꺼내기",
        "targetWords": [
          "시간누르기",
          "데우기",
          "꺼내기"
        ],
        "distractorPool": [
          "얼리기",
          "냉장보관",
          "씻기"
        ]
      },
      {
        "id": "tail-10-q-18",
        "coreWord": "인사말",
        "word": "인사말",
        "answer": "어서오세요, 감사합니다, 안녕히가세요",
        "targetWords": [
          "어서오세요",
          "감사합니다",
          "안녕히가세요"
        ],
        "distractorPool": [
          "나가주세요",
          "싫어요",
          "미워요"
        ]
      },
      {
        "id": "tail-10-q-19",
        "coreWord": "비올때파는것",
        "word": "비올때파는것",
        "answer": "투명우산, 비옷, 수건",
        "targetWords": [
          "투명우산",
          "비옷",
          "수건"
        ],
        "distractorPool": [
          "선글라스",
          "모래삽",
          "튜브"
        ]
      },
      {
        "id": "tail-10-q-20",
        "coreWord": "아침대용",
        "word": "아침대용",
        "answer": "샌드위치, 구운계란, 두유",
        "targetWords": [
          "샌드위치",
          "구운계란",
          "두유"
        ],
        "distractorPool": [
          "스테이크",
          "삼겹살",
          "생선구이"
        ]
      },
      {
        "id": "tail-10-q-21",
        "coreWord": "우유종류",
        "word": "우유종류",
        "answer": "초코우유, 딸기우유, 바나나우유",
        "targetWords": [
          "초코우유",
          "딸기우유",
          "바나나우유"
        ],
        "distractorPool": [
          "참기름",
          "간장",
          "식초"
        ]
      },
      {
        "id": "tail-10-q-22",
        "coreWord": "아이스크림종류",
        "word": "아이스크림종류",
        "answer": "막대아이스크림, 쭈쭈바, 구슬아이스크림",
        "targetWords": [
          "막대아이스크림",
          "쭈쭈바",
          "구슬아이스크림"
        ],
        "distractorPool": [
          "따뜻한차",
          "호빵",
          "찐고구마"
        ]
      },
      {
        "id": "tail-10-q-23",
        "coreWord": "과자종류",
        "word": "과자종류",
        "answer": "감자칩, 초코과자, 비스킷",
        "targetWords": [
          "감자칩",
          "초코과자",
          "비스킷"
        ],
        "distractorPool": [
          "시금치",
          "당근",
          "배추"
        ]
      },
      {
        "id": "tail-10-q-24",
        "coreWord": "젤리모양",
        "word": "젤리모양",
        "answer": "곰돌이모양, 지렁이모양, 과일모양",
        "targetWords": [
          "곰돌이모양",
          "지렁이모양",
          "과일모양"
        ],
        "distractorPool": [
          "네모상자",
          "세모자",
          "둥근공"
        ]
      },
      {
        "id": "tail-10-q-25",
        "coreWord": "편의점커피",
        "word": "편의점커피",
        "answer": "파우치커피, 얼음컵, 캔커피",
        "targetWords": [
          "파우치커피",
          "얼음컵",
          "캔커피"
        ],
        "distractorPool": [
          "믹서기",
          "원두",
          "커피머신"
        ]
      },
      {
        "id": "tail-10-q-26",
        "coreWord": "온수기사용",
        "word": "온수기사용",
        "answer": "버튼누르기, 뜨거운물받기, 조심하기",
        "targetWords": [
          "버튼누르기",
          "뜨거운물받기",
          "조심하기"
        ],
        "distractorPool": [
          "얼음넣기",
          "차가운물받기",
          "장난치기"
        ]
      },
      {
        "id": "tail-10-q-27",
        "coreWord": "쓰레기버리기",
        "word": "쓰레기버리기",
        "answer": "국물버리기, 용기분리하기, 나무젓가락버리기",
        "targetWords": [
          "국물버리기",
          "용기분리하기",
          "나무젓가락버리기"
        ],
        "distractorPool": [
          "바닥에버리기",
          "책상에두기",
          "숨기기"
        ]
      },
      {
        "id": "tail-10-q-28",
        "coreWord": "비닐봉투",
        "word": "비닐봉투",
        "answer": "봉투값, 친환경봉투, 종이봉투",
        "targetWords": [
          "봉투값",
          "친환경봉투",
          "종이봉투"
        ],
        "distractorPool": [
          "책가방",
          "필통",
          "지갑"
        ]
      },
      {
        "id": "tail-10-q-29",
        "coreWord": "포인트적립",
        "word": "포인트적립",
        "answer": "바코드보여주기, 휴대폰번호누르기, 포인트확인하기",
        "targetWords": [
          "바코드보여주기",
          "휴대폰번호누르기",
          "포인트확인하기"
        ],
        "distractorPool": [
          "결제취소하기",
          "물건버리기",
          "도망가기"
        ]
      },
      {
        "id": "tail-10-q-30",
        "coreWord": "나이확인물건",
        "word": "나이확인물건",
        "answer": "술, 담배, 라이터",
        "targetWords": [
          "술",
          "담배",
          "라이터"
        ],
        "distractorPool": [
          "아이스크림",
          "과자",
          "우유"
        ]
      },
      {
        "id": "tail-10-q-31",
        "coreWord": "식사도구",
        "word": "식사도구",
        "answer": "나무젓가락, 일회용숟가락, 포크",
        "targetWords": [
          "나무젓가락",
          "일회용숟가락",
          "포크"
        ],
        "distractorPool": [
          "연필",
          "지우개",
          "볼펜"
        ]
      },
      {
        "id": "tail-10-q-32",
        "coreWord": "편의점기계",
        "word": "편의점기계",
        "answer": "현금인출기, 택배기계, 전자레인지",
        "targetWords": [
          "현금인출기",
          "택배기계",
          "전자레인지"
        ],
        "distractorPool": [
          "세탁기",
          "냉장고",
          "텔레비전"
        ]
      },
      {
        "id": "tail-10-q-33",
        "coreWord": "물건진열",
        "word": "물건진열",
        "answer": "일렬로세우기, 유통기한확인하기, 가격표붙이기",
        "targetWords": [
          "일렬로세우기",
          "유통기한확인하기",
          "가격표붙이기"
        ],
        "distractorPool": [
          "어지럽히기",
          "섞어놓기",
          "숨기기"
        ]
      },
      {
        "id": "tail-10-q-34",
        "coreWord": "편의점음악",
        "word": "편의점음악",
        "answer": "라디오, 최신가요, 광고방송",
        "targetWords": [
          "라디오",
          "최신가요",
          "광고방송"
        ],
        "distractorPool": [
          "자장가",
          "클래식",
          "교향곡"
        ]
      },
      {
        "id": "tail-10-q-35",
        "coreWord": "편의점조명",
        "word": "편의점조명",
        "answer": "밝다, 환하다, 이십사시간켜짐",
        "targetWords": [
          "밝다",
          "환하다",
          "이십사시간켜짐"
        ],
        "distractorPool": [
          "어둡다",
          "캄캄하다",
          "꺼짐"
        ]
      },
      {
        "id": "tail-10-q-36",
        "coreWord": "간편식품",
        "word": "간편식품",
        "answer": "햄버거, 핫도그, 샌드위치",
        "targetWords": [
          "햄버거",
          "핫도그",
          "샌드위치"
        ],
        "distractorPool": [
          "스테이크",
          "파스타",
          "랍스터"
        ]
      },
      {
        "id": "tail-10-q-37",
        "coreWord": "편의점빵",
        "word": "편의점빵",
        "answer": "크림빵, 소보로빵, 캐릭터빵",
        "targetWords": [
          "크림빵",
          "소보로빵",
          "캐릭터빵"
        ],
        "distractorPool": [
          "고등어",
          "갈치",
          "오징어"
        ]
      },
      {
        "id": "tail-10-q-38",
        "coreWord": "계산대앞",
        "word": "계산대앞",
        "answer": "껌, 사탕, 초콜릿",
        "targetWords": [
          "껌",
          "사탕",
          "초콜릿"
        ],
        "distractorPool": [
          "냉동만두",
          "생수",
          "휴지"
        ]
      },
      {
        "id": "tail-10-q-39",
        "coreWord": "음료수칸",
        "word": "음료수칸",
        "answer": "탄산음료, 이온음료, 생수",
        "targetWords": [
          "탄산음료",
          "이온음료",
          "생수"
        ],
        "distractorPool": [
          "간장",
          "고추장",
          "된장"
        ]
      },
      {
        "id": "tail-10-q-40",
        "coreWord": "유제품칸",
        "word": "유제품칸",
        "answer": "요구르트, 스트링치즈, 떠먹는요구르트",
        "targetWords": [
          "요구르트",
          "스트링치즈",
          "떠먹는요구르트"
        ],
        "distractorPool": [
          "라면",
          "국수",
          "과자"
        ]
      },
      {
        "id": "tail-10-q-41",
        "coreWord": "생필품칸",
        "word": "생필품칸",
        "answer": "칫솔, 치약, 물티슈",
        "targetWords": [
          "칫솔",
          "치약",
          "물티슈"
        ],
        "distractorPool": [
          "아이스크림",
          "얼음",
          "냉동식품"
        ]
      },
      {
        "id": "tail-10-q-42",
        "coreWord": "문구류칸",
        "word": "문구류칸",
        "answer": "네임펜, 딱풀, 건전지",
        "targetWords": [
          "네임펜",
          "딱풀",
          "건전지"
        ],
        "distractorPool": [
          "양파",
          "대파",
          "마늘"
        ]
      },
      {
        "id": "tail-10-q-43",
        "coreWord": "거스름돈확인",
        "word": "거스름돈확인",
        "answer": "지폐확인, 동전확인, 지갑에넣기",
        "targetWords": [
          "지폐확인",
          "동전확인",
          "지갑에넣기"
        ],
        "distractorPool": [
          "버리기",
          "찢기",
          "구기기"
        ]
      },
      {
        "id": "tail-10-q-44",
        "coreWord": "카드결제",
        "word": "카드결제",
        "answer": "단말기에꽂기, 결제기다리기, 카드뽑기",
        "targetWords": [
          "단말기에꽂기",
          "결제기다리기",
          "카드뽑기"
        ],
        "distractorPool": [
          "던지기",
          "부러뜨리기",
          "숨기기"
        ]
      },
      {
        "id": "tail-10-q-45",
        "coreWord": "모바일결제",
        "word": "모바일결제",
        "answer": "앱켜기, 바코드보여주기, 결제완료",
        "targetWords": [
          "앱켜기",
          "바코드보여주기",
          "결제완료"
        ],
        "distractorPool": [
          "현금내기",
          "동전찾기",
          "수표내기"
        ]
      },
      {
        "id": "tail-10-q-46",
        "coreWord": "영수증",
        "word": "영수증",
        "answer": "물건이름, 가격, 합계금액",
        "targetWords": [
          "물건이름",
          "가격",
          "합계금액"
        ],
        "distractorPool": [
          "편지내용",
          "일기내용",
          "초대장"
        ]
      },
      {
        "id": "tail-10-q-47",
        "coreWord": "행사상품표시",
        "word": "행사상품표시",
        "answer": "빨간색표시, 행사카드안내, 기간안내",
        "targetWords": [
          "빨간색표시",
          "행사카드안내",
          "기간안내"
        ],
        "distractorPool": [
          "비밀번호",
          "전화번호",
          "주민번호"
        ]
      },
      {
        "id": "tail-10-q-48",
        "coreWord": "편의점입구",
        "word": "편의점입구",
        "answer": "자동문, 환영인사소리, 발매트",
        "targetWords": [
          "자동문",
          "환영인사소리",
          "발매트"
        ],
        "distractorPool": [
          "침대",
          "소파",
          "텔레비전"
        ]
      },
      {
        "id": "tail-10-q-49",
        "coreWord": "핫바데우기",
        "word": "핫바데우기",
        "answer": "비닐조금뜯기, 전자레인지넣기, 꺼내기",
        "targetWords": [
          "비닐조금뜯기",
          "전자레인지넣기",
          "꺼내기"
        ],
        "distractorPool": [
          "그대로넣기",
          "얼리기",
          "물에넣기"
        ]
      },
      {
        "id": "tail-10-q-50",
        "coreWord": "라면먹기",
        "word": "라면먹기",
        "answer": "나무젓가락쪼개기, 면건져먹기, 국물조심하기",
        "targetWords": [
          "나무젓가락쪼개기",
          "면건져먹기",
          "국물조심하기"
        ],
        "distractorPool": [
          "손으로먹기",
          "바닥에흘리기",
          "엎지르기"
        ]
      },
      {
        "id": "tail-10-q-51",
        "coreWord": "아이스크림먹기",
        "word": "아이스크림먹기",
        "answer": "껍질벗기기, 녹기전에먹기, 핥아먹기",
        "targetWords": [
          "껍질벗기기",
          "녹기전에먹기",
          "핥아먹기"
        ],
        "distractorPool": [
          "전자레인지데우기",
          "뜨거운물붓기",
          "끓이기"
        ]
      },
      {
        "id": "tail-10-q-52",
        "coreWord": "삼각김밥뜯기",
        "word": "삼각김밥뜯기",
        "answer": "번호순서대로, 비닐벗기기, 김바삭하게",
        "targetWords": [
          "번호순서대로",
          "비닐벗기기",
          "김바삭하게"
        ],
        "distractorPool": [
          "가위로자르기",
          "뭉개기",
          "주물럭거리기"
        ]
      },
      {
        "id": "tail-10-q-53",
        "coreWord": "물건고르기",
        "word": "물건고르기",
        "answer": "유통기한보기, 가격보기, 필요한것사기",
        "targetWords": [
          "유통기한보기",
          "가격보기",
          "필요한것사기"
        ],
        "distractorPool": [
          "아무거나집기",
          "다사기",
          "던져보기"
        ]
      },
      {
        "id": "tail-10-q-54",
        "coreWord": "친구와함께",
        "word": "친구와함께",
        "answer": "나눠먹기, 같이고르기, 수다떨기",
        "targetWords": [
          "나눠먹기",
          "같이고르기",
          "수다떨기"
        ],
        "distractorPool": [
          "혼자다먹기",
          "뺏어먹기",
          "싸우기"
        ]
      },
      {
        "id": "tail-10-q-55",
        "coreWord": "야간편의점",
        "word": "야간편의점",
        "answer": "환함, 안전함, 심야알바생",
        "targetWords": [
          "환함",
          "안전함",
          "심야알바생"
        ],
        "distractorPool": [
          "캄캄함",
          "무서움",
          "문닫음"
        ]
      },
      {
        "id": "tail-10-q-56",
        "coreWord": "기프트카드",
        "word": "기프트카드",
        "answer": "게임캐시, 금액충전, 선물용",
        "targetWords": [
          "게임캐시",
          "금액충전",
          "선물용"
        ],
        "distractorPool": [
          "교통카드",
          "신용카드",
          "체크카드"
        ]
      },
      {
        "id": "tail-10-q-57",
        "coreWord": "편의점택배",
        "word": "편의점택배",
        "answer": "상자무게재기, 송장출력, 계산대결제",
        "targetWords": [
          "상자무게재기",
          "송장출력",
          "계산대결제"
        ],
        "distractorPool": [
          "편지쓰기",
          "우표붙이기",
          "우체통넣기"
        ]
      },
      {
        "id": "tail-10-q-58",
        "coreWord": "비상상황",
        "word": "비상상황",
        "answer": "비상약사기, 밴드사기, 연고사기",
        "targetWords": [
          "비상약사기",
          "밴드사기",
          "연고사기"
        ],
        "distractorPool": [
          "장난감사기",
          "과자사기",
          "아이스크림사기"
        ]
      },
      {
        "id": "tail-10-q-59",
        "coreWord": "돈이모자랄때",
        "word": "돈이모자랄때",
        "answer": "물건빼기, 결제취소하기, 다른물건고르기",
        "targetWords": [
          "물건빼기",
          "결제취소하기",
          "다른물건고르기"
        ],
        "distractorPool": [
          "그냥가져가기",
          "화내기",
          "훔치기"
        ]
      },
      {
        "id": "tail-10-q-60",
        "coreWord": "편의점알바",
        "word": "편의점알바",
        "answer": "바코드찍기, 물건진열, 매장청소",
        "targetWords": [
          "바코드찍기",
          "물건진열",
          "매장청소"
        ],
        "distractorPool": [
          "농사짓기",
          "요리하기",
          "수술하기"
        ]
      }
    ]
  },
  {
    "id": "tail-11",
    "title": "초등 08",
    "schoolLevelLabel": "08",
    "bandLabel": "초등",
    "descriptor": "감각과변화",
    "grammarFocus": "감각과변화",
    "goalCopy": "감각과변화 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 28,
    "questions": [
      {
        "id": "tail-11-q-01",
        "coreWord": "깨지는소리",
        "word": "깨지는소리",
        "answer": "쨍그랑, 와장창, 우당탕",
        "targetWords": [
          "쨍그랑",
          "와장창",
          "우당탕"
        ],
        "distractorPool": [
          "사뿐사뿐",
          "살금살금",
          "사락사락"
        ]
      },
      {
        "id": "tail-11-q-02",
        "coreWord": "좋은냄새",
        "word": "좋은냄새",
        "answer": "구수하다, 향기롭다, 달콤하다",
        "targetWords": [
          "구수하다",
          "향기롭다",
          "달콤하다"
        ],
        "distractorPool": [
          "비릿하다",
          "역겹다",
          "퀴퀴하다"
        ]
      },
      {
        "id": "tail-11-q-03",
        "coreWord": "맛",
        "word": "맛",
        "answer": "맵다, 짜다, 시다",
        "targetWords": [
          "맵다",
          "짜다",
          "시다"
        ],
        "distractorPool": [
          "차갑다",
          "미지근하다",
          "뜨겁다"
        ]
      },
      {
        "id": "tail-11-q-04",
        "coreWord": "부드러운느낌",
        "word": "부드러운느낌",
        "answer": "뽀송뽀송, 보들보들, 푹신하다",
        "targetWords": [
          "뽀송뽀송",
          "보들보들",
          "푹신하다"
        ],
        "distractorPool": [
          "축축하다",
          "딱딱하다",
          "끈적하다"
        ]
      },
      {
        "id": "tail-11-q-05",
        "coreWord": "아픔",
        "word": "아픔",
        "answer": "얼얼하다, 쓰라리다, 따갑다",
        "targetWords": [
          "얼얼하다",
          "쓰라리다",
          "따갑다"
        ],
        "distractorPool": [
          "개운하다",
          "시원하다",
          "상쾌하다"
        ]
      },
      {
        "id": "tail-11-q-06",
        "coreWord": "땀흘리기",
        "word": "땀흘리기",
        "answer": "뻘뻘, 주룩주룩, 줄줄",
        "targetWords": [
          "뻘뻘",
          "주룩주룩",
          "줄줄"
        ],
        "distractorPool": [
          "솔솔",
          "산들산들",
          "살랑살랑"
        ]
      },
      {
        "id": "tail-11-q-07",
        "coreWord": "커지다",
        "word": "커지다",
        "answer": "늘어나다, 길어지다, 팽창하다",
        "targetWords": [
          "늘어나다",
          "길어지다",
          "팽창하다"
        ],
        "distractorPool": [
          "줄어들다",
          "쪼그라들다",
          "짧아지다"
        ]
      },
      {
        "id": "tail-11-q-08",
        "coreWord": "액체가되다",
        "word": "액체가되다",
        "answer": "녹다, 흐물거리다, 스르르",
        "targetWords": [
          "녹다",
          "흐물거리다",
          "스르르"
        ],
        "distractorPool": [
          "얼다",
          "굳다",
          "딱딱해지다"
        ]
      },
      {
        "id": "tail-11-q-09",
        "coreWord": "색깔변화",
        "word": "색깔변화",
        "answer": "물들다, 붉어지다, 단풍들다",
        "targetWords": [
          "물들다",
          "붉어지다",
          "단풍들다"
        ],
        "distractorPool": [
          "말라죽다",
          "얼어붙다",
          "썩어버리다"
        ]
      },
      {
        "id": "tail-11-q-10",
        "coreWord": "빛나다",
        "word": "빛나다",
        "answer": "반짝반짝, 눈부시다, 영롱하다",
        "targetWords": [
          "반짝반짝",
          "눈부시다",
          "영롱하다"
        ],
        "distractorPool": [
          "어둑어둑",
          "칙칙하다",
          "캄캄하다"
        ]
      },
      {
        "id": "tail-11-q-11",
        "coreWord": "심장소리",
        "word": "심장소리",
        "answer": "쿵쾅거리다, 두근거리다, 펄떡이다",
        "targetWords": [
          "쿵쾅거리다",
          "두근거리다",
          "펄떡이다"
        ],
        "distractorPool": [
          "고요하다",
          "차분하다",
          "조용하다"
        ]
      },
      {
        "id": "tail-11-q-12",
        "coreWord": "소리울림",
        "word": "소리울림",
        "answer": "메아리, 반향, 울려퍼짐",
        "targetWords": [
          "메아리",
          "반향",
          "울려퍼짐"
        ],
        "distractorPool": [
          "침묵",
          "고요",
          "속삭임"
        ]
      },
      {
        "id": "tail-11-q-13",
        "coreWord": "간지러움",
        "word": "간지러움",
        "answer": "가렵다, 근질거리다, 긁고싶다",
        "targetWords": [
          "가렵다",
          "근질거리다",
          "긁고싶다"
        ],
        "distractorPool": [
          "따갑다",
          "편안하다",
          "시원하다"
        ]
      },
      {
        "id": "tail-11-q-14",
        "coreWord": "바람넣기",
        "word": "바람넣기",
        "answer": "부풀다, 빵빵해지다, 커지다",
        "targetWords": [
          "부풀다",
          "빵빵해지다",
          "커지다"
        ],
        "distractorPool": [
          "터지다",
          "찢어지다",
          "쪼그라들다"
        ]
      },
      {
        "id": "tail-11-q-15",
        "coreWord": "멀어지다",
        "word": "멀어지다",
        "answer": "흩어지다, 퍼지다, 분산되다",
        "targetWords": [
          "흩어지다",
          "퍼지다",
          "분산되다"
        ],
        "distractorPool": [
          "뭉치다",
          "모이다",
          "굳어지다"
        ]
      },
      {
        "id": "tail-11-q-16",
        "coreWord": "마르다",
        "word": "마르다",
        "answer": "뽀송하다, 건조하다, 바싹바싹하다",
        "targetWords": [
          "뽀송하다",
          "건조하다",
          "바싹바싹하다"
        ],
        "distractorPool": [
          "축축하다",
          "젖다",
          "흥건하다"
        ]
      },
      {
        "id": "tail-11-q-17",
        "coreWord": "조용함",
        "word": "조용함",
        "answer": "고요하다, 적막하다, 잠잠하다",
        "targetWords": [
          "고요하다",
          "적막하다",
          "잠잠하다"
        ],
        "distractorPool": [
          "시끄럽다",
          "요란하다",
          "왁자지껄하다"
        ]
      },
      {
        "id": "tail-11-q-18",
        "coreWord": "미끄러움",
        "word": "미끄러움",
        "answer": "반질반질하다, 미끈거린다, 미끄덩하다",
        "targetWords": [
          "반질반질하다",
          "미끈거린다",
          "미끄덩하다"
        ],
        "distractorPool": [
          "까칠하다",
          "거칠다",
          "뾰족하다"
        ]
      },
      {
        "id": "tail-11-q-19",
        "coreWord": "어두워짐",
        "word": "어두워짐",
        "answer": "캄캄해지다, 어둑해지다, 흐려지다",
        "targetWords": [
          "캄캄해지다",
          "어둑해지다",
          "흐려지다"
        ],
        "distractorPool": [
          "밝아지다",
          "환해지다",
          "눈부시다"
        ]
      },
      {
        "id": "tail-11-q-20",
        "coreWord": "젖음",
        "word": "젖음",
        "answer": "축축하다, 흥건하다, 흠뻑젖다",
        "targetWords": [
          "축축하다",
          "흥건하다",
          "흠뻑젖다"
        ],
        "distractorPool": [
          "마르다",
          "뽀송하다",
          "건조하다"
        ]
      },
      {
        "id": "tail-11-q-21",
        "coreWord": "걷는소리",
        "word": "걷는소리",
        "answer": "사뿐사뿐, 터벅터벅, 성큼성큼",
        "targetWords": [
          "사뿐사뿐",
          "터벅터벅",
          "성큼성큼"
        ],
        "distractorPool": [
          "쨍그랑",
          "와장창",
          "우당탕"
        ]
      },
      {
        "id": "tail-11-q-22",
        "coreWord": "우는소리",
        "word": "우는소리",
        "answer": "엉엉, 훌쩍훌쩍, 흑흑",
        "targetWords": [
          "엉엉",
          "훌쩍훌쩍",
          "흑흑"
        ],
        "distractorPool": [
          "하하",
          "호호",
          "깔깔"
        ]
      },
      {
        "id": "tail-11-q-23",
        "coreWord": "웃는소리",
        "word": "웃는소리",
        "answer": "하하, 깔깔, 빙그레",
        "targetWords": [
          "하하",
          "깔깔",
          "빙그레"
        ],
        "distractorPool": [
          "엉엉",
          "훌쩍훌쩍",
          "흑흑"
        ]
      },
      {
        "id": "tail-11-q-24",
        "coreWord": "비오는소리",
        "word": "비오는소리",
        "answer": "주룩주룩, 토닥토닥, 후두둑",
        "targetWords": [
          "주룩주룩",
          "토닥토닥",
          "후두둑"
        ],
        "distractorPool": [
          "쨍쨍",
          "반짝반짝",
          "화창하게"
        ]
      },
      {
        "id": "tail-11-q-25",
        "coreWord": "눈오는모양",
        "word": "눈오는모양",
        "answer": "펑펑, 펄펄, 소복소복",
        "targetWords": [
          "펑펑",
          "펄펄",
          "소복소복"
        ],
        "distractorPool": [
          "주룩주룩",
          "토닥토닥",
          "쏴아아"
        ]
      },
      {
        "id": "tail-11-q-26",
        "coreWord": "바람소리",
        "word": "바람소리",
        "answer": "쌩쌩, 윙윙, 살랑살랑",
        "targetWords": [
          "쌩쌩",
          "윙윙",
          "살랑살랑"
        ],
        "distractorPool": [
          "쨍그랑",
          "쿵쾅쿵쾅",
          "우당탕"
        ]
      },
      {
        "id": "tail-11-q-27",
        "coreWord": "물흐르는소리",
        "word": "물흐르는소리",
        "answer": "졸졸, 콸콸, 쏴아아",
        "targetWords": [
          "졸졸",
          "콸콸",
          "쏴아아"
        ],
        "distractorPool": [
          "활활",
          "타닥타닥",
          "지글지글"
        ]
      },
      {
        "id": "tail-11-q-28",
        "coreWord": "불타는모양",
        "word": "불타는모양",
        "answer": "활활, 타닥타닥, 이글이글",
        "targetWords": [
          "활활",
          "타닥타닥",
          "이글이글"
        ],
        "distractorPool": [
          "졸졸",
          "콸콸",
          "찰랑찰랑"
        ]
      },
      {
        "id": "tail-11-q-29",
        "coreWord": "배고픈소리",
        "word": "배고픈소리",
        "answer": "꼬르륵, 쪼르륵, 허기진소리",
        "targetWords": [
          "꼬르륵",
          "쪼르륵",
          "허기진소리"
        ],
        "distractorPool": [
          "트림소리",
          "쩝쩝",
          "꿀꺽"
        ]
      },
      {
        "id": "tail-11-q-30",
        "coreWord": "먹는소리",
        "word": "먹는소리",
        "answer": "냠냠, 쩝쩝, 꿀꺽",
        "targetWords": [
          "냠냠",
          "쩝쩝",
          "꿀꺽"
        ],
        "distractorPool": [
          "꼬르륵",
          "쪼르륵",
          "하품소리"
        ]
      },
      {
        "id": "tail-11-q-31",
        "coreWord": "시큼한맛",
        "word": "시큼한맛",
        "answer": "새콤달콤, 시큼털털, 상큼하다",
        "targetWords": [
          "새콤달콤",
          "시큼털털",
          "상큼하다"
        ],
        "distractorPool": [
          "구수하다",
          "매콤하다",
          "짭짤하다"
        ]
      },
      {
        "id": "tail-11-q-32",
        "coreWord": "매운맛",
        "word": "매운맛",
        "answer": "매콤달콤, 얼큰하다, 칼칼하다",
        "targetWords": [
          "매콤달콤",
          "얼큰하다",
          "칼칼하다"
        ],
        "distractorPool": [
          "달달하다",
          "밍밍하다",
          "느끼하다"
        ]
      },
      {
        "id": "tail-11-q-33",
        "coreWord": "짠맛",
        "word": "짠맛",
        "answer": "짭짤하다, 짭조름하다, 간간하다",
        "targetWords": [
          "짭짤하다",
          "짭조름하다",
          "간간하다"
        ],
        "distractorPool": [
          "달달하다",
          "새콤하다",
          "담백하다"
        ]
      },
      {
        "id": "tail-11-q-34",
        "coreWord": "싱거운맛",
        "word": "싱거운맛",
        "answer": "밍밍하다, 삼삼하다, 담백하다",
        "targetWords": [
          "밍밍하다",
          "삼삼하다",
          "담백하다"
        ],
        "distractorPool": [
          "짜다",
          "맵다",
          "자극적이다"
        ]
      },
      {
        "id": "tail-11-q-35",
        "coreWord": "끈적거림",
        "word": "끈적거림",
        "answer": "끈끈하다, 찐득하다, 질척이다",
        "targetWords": [
          "끈끈하다",
          "찐득하다",
          "질척이다"
        ],
        "distractorPool": [
          "뽀송하다",
          "매끄럽다",
          "보들보들하다"
        ]
      },
      {
        "id": "tail-11-q-36",
        "coreWord": "까슬거림",
        "word": "까슬거림",
        "answer": "까칠하다, 거칠다, 꺼끌거리다",
        "targetWords": [
          "까칠하다",
          "거칠다",
          "꺼끌거리다"
        ],
        "distractorPool": [
          "부드럽다",
          "매끄럽다",
          "미끈거린다"
        ]
      },
      {
        "id": "tail-11-q-37",
        "coreWord": "단단함",
        "word": "단단함",
        "answer": "딱딱하다, 단단하다, 견고하다",
        "targetWords": [
          "딱딱하다",
          "단단하다",
          "견고하다"
        ],
        "distractorPool": [
          "말랑하다",
          "푹신하다",
          "물렁하다"
        ]
      },
      {
        "id": "tail-11-q-38",
        "coreWord": "연함",
        "word": "연함",
        "answer": "말랑말랑하다, 물렁하다, 폭신하다",
        "targetWords": [
          "말랑말랑하다",
          "물렁하다",
          "폭신하다"
        ],
        "distractorPool": [
          "딱딱하다",
          "단단하다",
          "굳다"
        ]
      },
      {
        "id": "tail-11-q-39",
        "coreWord": "차가운느낌",
        "word": "차가운느낌",
        "answer": "오싹하다, 서늘하다, 시리다",
        "targetWords": [
          "오싹하다",
          "서늘하다",
          "시리다"
        ],
        "distractorPool": [
          "포근하다",
          "훈훈하다",
          "후끈하다"
        ]
      },
      {
        "id": "tail-11-q-40",
        "coreWord": "따뜻한느낌",
        "word": "따뜻한느낌",
        "answer": "훈훈하다, 포근하다, 따사롭다",
        "targetWords": [
          "훈훈하다",
          "포근하다",
          "따사롭다"
        ],
        "distractorPool": [
          "오싹하다",
          "서늘하다",
          "시리다"
        ]
      },
      {
        "id": "tail-11-q-41",
        "coreWord": "뜨거운느낌",
        "word": "뜨거운느낌",
        "answer": "후끈하다, 뜨끈하다, 델것같다",
        "targetWords": [
          "후끈하다",
          "뜨끈하다",
          "델것같다"
        ],
        "distractorPool": [
          "차갑다",
          "시원하다",
          "얼음같다"
        ]
      },
      {
        "id": "tail-11-q-42",
        "coreWord": "작아지다",
        "word": "작아지다",
        "answer": "줄어들다, 쪼그라들다, 축소되다",
        "targetWords": [
          "줄어들다",
          "쪼그라들다",
          "축소되다"
        ],
        "distractorPool": [
          "늘어나다",
          "팽창하다",
          "부풀다"
        ]
      },
      {
        "id": "tail-11-q-43",
        "coreWord": "굳어지다",
        "word": "굳어지다",
        "answer": "딱딱해지다, 굳다, 얼어붙다",
        "targetWords": [
          "딱딱해지다",
          "굳다",
          "얼어붙다"
        ],
        "distractorPool": [
          "녹다",
          "흐물거리다",
          "부드러워지다"
        ]
      },
      {
        "id": "tail-11-q-44",
        "coreWord": "부서지다",
        "word": "부서지다",
        "answer": "조각나다, 산산조각나다, 가루가되다",
        "targetWords": [
          "조각나다",
          "산산조각나다",
          "가루가되다"
        ],
        "distractorPool": [
          "뭉치다",
          "합쳐지다",
          "단단해지다"
        ]
      },
      {
        "id": "tail-11-q-45",
        "coreWord": "뭉치다",
        "word": "뭉치다",
        "answer": "덩어리지다, 합쳐지다, 하나가되다",
        "targetWords": [
          "덩어리지다",
          "합쳐지다",
          "하나가되다"
        ],
        "distractorPool": [
          "부서지다",
          "가루가되다",
          "흩어지다"
        ]
      },
      {
        "id": "tail-11-q-46",
        "coreWord": "맑아지다",
        "word": "맑아지다",
        "answer": "투명해지다, 깨끗해지다, 선명해지다",
        "targetWords": [
          "투명해지다",
          "깨끗해지다",
          "선명해지다"
        ],
        "distractorPool": [
          "탁해지다",
          "뿌옇게되다",
          "흐려지다"
        ]
      },
      {
        "id": "tail-11-q-47",
        "coreWord": "흐려지다",
        "word": "흐려지다",
        "answer": "뿌옇게되다, 탁해지다, 불투명해지다",
        "targetWords": [
          "뿌옇게되다",
          "탁해지다",
          "불투명해지다"
        ],
        "distractorPool": [
          "맑아지다",
          "깨끗해지다",
          "투명해지다"
        ]
      },
      {
        "id": "tail-11-q-48",
        "coreWord": "냄새퍼짐",
        "word": "냄새퍼짐",
        "answer": "솔솔풍기다, 진동하다, 코를찌르다",
        "targetWords": [
          "솔솔풍기다",
          "진동하다",
          "코를찌르다"
        ],
        "distractorPool": [
          "사라지다",
          "무향이다",
          "냄새없다"
        ]
      },
      {
        "id": "tail-11-q-49",
        "coreWord": "눈부심",
        "word": "눈부심",
        "answer": "쨍쨍하다, 환하다, 찬란하다",
        "targetWords": [
          "쨍쨍하다",
          "환하다",
          "찬란하다"
        ],
        "distractorPool": [
          "침침하다",
          "어둡다",
          "캄캄하다"
        ]
      },
      {
        "id": "tail-11-q-50",
        "coreWord": "어지러움",
        "word": "어지러움",
        "answer": "빙빙돌다, 핑돌다, 아찔하다",
        "targetWords": [
          "빙빙돌다",
          "핑돌다",
          "아찔하다"
        ],
        "distractorPool": [
          "상쾌하다",
          "개운하다",
          "맑다"
        ]
      },
      {
        "id": "tail-11-q-51",
        "coreWord": "떨림",
        "word": "떨림",
        "answer": "부르르, 파르르, 덜덜",
        "targetWords": [
          "부르르",
          "파르르",
          "덜덜"
        ],
        "distractorPool": [
          "가만히",
          "꼿꼿이",
          "멈춤"
        ]
      },
      {
        "id": "tail-11-q-52",
        "coreWord": "심장뜀",
        "word": "심장뜀",
        "answer": "콩닥콩닥, 두근두근, 벌렁벌렁",
        "targetWords": [
          "콩닥콩닥",
          "두근두근",
          "벌렁벌렁"
        ],
        "distractorPool": [
          "차분함",
          "고요함",
          "평온함"
        ]
      },
      {
        "id": "tail-11-q-53",
        "coreWord": "땀흘림",
        "word": "땀흘림",
        "answer": "뻘뻘, 송글송글, 삐질삐질",
        "targetWords": [
          "뻘뻘",
          "송글송글",
          "삐질삐질"
        ],
        "distractorPool": [
          "오싹오싹",
          "파르르",
          "덜덜"
        ]
      },
      {
        "id": "tail-11-q-54",
        "coreWord": "눈물흘림",
        "word": "눈물흘림",
        "answer": "주룩주룩, 뚝뚝, 펑펑",
        "targetWords": [
          "주룩주룩",
          "뚝뚝",
          "펑펑"
        ],
        "distractorPool": [
          "하하",
          "호호",
          "방긋"
        ]
      },
      {
        "id": "tail-11-q-55",
        "coreWord": "놀란모양",
        "word": "놀란모양",
        "answer": "깜짝, 화들짝, 덜컥",
        "targetWords": [
          "깜짝",
          "화들짝",
          "덜컥"
        ],
        "distractorPool": [
          "차분히",
          "가만히",
          "느긋하게"
        ]
      },
      {
        "id": "tail-11-q-56",
        "coreWord": "천천히",
        "word": "천천히",
        "answer": "느릿느릿, 꾸물꾸물, 엉금엉금",
        "targetWords": [
          "느릿느릿",
          "꾸물꾸물",
          "엉금엉금"
        ],
        "distractorPool": [
          "쌩쌩",
          "쏜알같이",
          "후다닥"
        ]
      },
      {
        "id": "tail-11-q-57",
        "coreWord": "빨리",
        "word": "빨리",
        "answer": "후다닥, 쏜알같이, 번개처럼",
        "targetWords": [
          "후다닥",
          "쏜알같이",
          "번개처럼"
        ],
        "distractorPool": [
          "느릿느릿",
          "꾸물꾸물",
          "엉금엉금"
        ]
      },
      {
        "id": "tail-11-q-58",
        "coreWord": "가벼운느낌",
        "word": "가벼운느낌",
        "answer": "홀가분하다, 날아갈것같다, 가뿐하다",
        "targetWords": [
          "홀가분하다",
          "날아갈것같다",
          "가뿐하다"
        ],
        "distractorPool": [
          "무겁다",
          "뻐근하다",
          "짓눌리다"
        ]
      },
      {
        "id": "tail-11-q-59",
        "coreWord": "무거운느낌",
        "word": "무거운느낌",
        "answer": "뻐근하다, 짓눌리다, 천근만근이다",
        "targetWords": [
          "뻐근하다",
          "짓눌리다",
          "천근만근이다"
        ],
        "distractorPool": [
          "가볍다",
          "홀가분하다",
          "날아갈것같다"
        ]
      },
      {
        "id": "tail-11-q-60",
        "coreWord": "화남",
        "word": "화남",
        "answer": "씩씩거리다, 불같이화내다, 짜증내다",
        "targetWords": [
          "씩씩거리다",
          "불같이화내다",
          "짜증내다"
        ],
        "distractorPool": [
          "미소짓다",
          "환호하다",
          "기뻐하다"
        ]
      }
    ]
  },
  {
    "id": "tail-12",
    "title": "초등 09",
    "schoolLevelLabel": "09",
    "bandLabel": "초등",
    "descriptor": "자연과계절",
    "grammarFocus": "자연과계절",
    "goalCopy": "자연과계절 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 27,
    "questions": [
      {
        "id": "tail-12-q-01",
        "coreWord": "봄꽃",
        "word": "봄꽃",
        "answer": "개나리, 진달래, 벚꽃",
        "targetWords": [
          "개나리",
          "진달래",
          "벚꽃"
        ],
        "distractorPool": [
          "단풍",
          "낙엽",
          "눈꽃"
        ]
      },
      {
        "id": "tail-12-q-02",
        "coreWord": "봄풍경",
        "word": "봄풍경",
        "answer": "새싹, 아지랑이, 봄바람",
        "targetWords": [
          "새싹",
          "아지랑이",
          "봄바람"
        ],
        "distractorPool": [
          "눈사람",
          "썰매",
          "고드름"
        ]
      },
      {
        "id": "tail-12-q-03",
        "coreWord": "여름날씨",
        "word": "여름날씨",
        "answer": "장마, 무더위, 열대야",
        "targetWords": [
          "장마",
          "무더위",
          "열대야"
        ],
        "distractorPool": [
          "꽃샘추위",
          "첫눈",
          "얼음"
        ]
      },
      {
        "id": "tail-12-q-04",
        "coreWord": "여름벌레",
        "word": "여름벌레",
        "answer": "매미, 모기, 잠자리",
        "targetWords": [
          "매미",
          "모기",
          "잠자리"
        ],
        "distractorPool": [
          "펭귄",
          "북극곰",
          "늑대"
        ]
      },
      {
        "id": "tail-12-q-05",
        "coreWord": "피서지",
        "word": "피서지",
        "answer": "바다, 계곡, 수영장",
        "targetWords": [
          "바다",
          "계곡",
          "수영장"
        ],
        "distractorPool": [
          "스키장",
          "눈썰매장",
          "빙어낚시"
        ]
      },
      {
        "id": "tail-12-q-06",
        "coreWord": "가일풍경",
        "word": "가일풍경",
        "answer": "단풍, 낙엽, 허수아비",
        "targetWords": [
          "단풍",
          "낙엽",
          "허수아비"
        ],
        "distractorPool": [
          "새싹",
          "벚꽃",
          "아지랑이"
        ]
      },
      {
        "id": "tail-12-q-07",
        "coreWord": "농사",
        "word": "농사",
        "answer": "수확, 추수, 벼베기",
        "targetWords": [
          "수확",
          "추수",
          "벼베기"
        ],
        "distractorPool": [
          "씨앗뿌리기",
          "모내기",
          "새싹틔우기"
        ]
      },
      {
        "id": "tail-12-q-08",
        "coreWord": "날아다니는것",
        "word": "날아다니는것",
        "answer": "참새, 까치, 기러기",
        "targetWords": [
          "참새",
          "까치",
          "기러기"
        ],
        "distractorPool": [
          "강아지",
          "고양이",
          "사자"
        ]
      },
      {
        "id": "tail-12-q-09",
        "coreWord": "겨울풍경",
        "word": "겨울풍경",
        "answer": "눈사람, 빙판길, 고드름",
        "targetWords": [
          "눈사람",
          "빙판길",
          "고드름"
        ],
        "distractorPool": [
          "해수욕장",
          "에어컨",
          "선풍기"
        ]
      },
      {
        "id": "tail-12-q-10",
        "coreWord": "겨울날씨",
        "word": "겨울날씨",
        "answer": "함박눈, 서리, 한파",
        "targetWords": [
          "함박눈",
          "서리",
          "한파"
        ],
        "distractorPool": [
          "무지개",
          "소나기",
          "폭우"
        ]
      },
      {
        "id": "tail-12-q-11",
        "coreWord": "겨울간식",
        "word": "겨울간식",
        "answer": "붕어빵, 군고구마, 호떡",
        "targetWords": [
          "붕어빵",
          "군고구마",
          "호떡"
        ],
        "distractorPool": [
          "아이스크림",
          "팥빙수",
          "수박"
        ]
      },
      {
        "id": "tail-12-q-12",
        "coreWord": "방한용품",
        "word": "방한용품",
        "answer": "패딩, 코트, 목도리",
        "targetWords": [
          "패딩",
          "코트",
          "목도리"
        ],
        "distractorPool": [
          "반팔",
          "반바지",
          "수영복"
        ]
      },
      {
        "id": "tail-12-q-13",
        "coreWord": "겨울잠",
        "word": "겨울잠",
        "answer": "개구리, 뱀, 곰",
        "targetWords": [
          "개구리",
          "뱀",
          "곰"
        ],
        "distractorPool": [
          "호랑이",
          "독수리",
          "상어"
        ]
      },
      {
        "id": "tail-12-q-14",
        "coreWord": "자연재해",
        "word": "자연재해",
        "answer": "태풍, 홍수, 가뭄",
        "targetWords": [
          "태풍",
          "홍수",
          "가뭄"
        ],
        "distractorPool": [
          "맑음",
          "화창함",
          "선선함"
        ]
      },
      {
        "id": "tail-12-q-15",
        "coreWord": "가을식물",
        "word": "가을식물",
        "answer": "코스모스, 억새, 국화",
        "targetWords": [
          "코스모스",
          "억새",
          "국화"
        ],
        "distractorPool": [
          "매미",
          "모기",
          "에어컨"
        ]
      },
      {
        "id": "tail-12-q-16",
        "coreWord": "봄날씨",
        "word": "봄날씨",
        "answer": "따뜻함, 포근함, 꽃샘추위",
        "targetWords": [
          "따뜻함",
          "포근함",
          "꽃샘추위"
        ],
        "distractorPool": [
          "장마",
          "태풍",
          "폭설"
        ]
      },
      {
        "id": "tail-12-q-17",
        "coreWord": "여름과일",
        "word": "여름과일",
        "answer": "수박, 참외, 복숭아",
        "targetWords": [
          "수박",
          "참외",
          "복숭아"
        ],
        "distractorPool": [
          "귤",
          "사과",
          "배"
        ]
      },
      {
        "id": "tail-12-q-18",
        "coreWord": "가을과일",
        "word": "가을과일",
        "answer": "사과, 배, 감",
        "targetWords": [
          "사과",
          "배",
          "감"
        ],
        "distractorPool": [
          "수박",
          "참외",
          "딸기"
        ]
      },
      {
        "id": "tail-12-q-19",
        "coreWord": "겨울과일",
        "word": "겨울과일",
        "answer": "귤, 한라봉, 딸기",
        "targetWords": [
          "귤",
          "한라봉",
          "딸기"
        ],
        "distractorPool": [
          "수박",
          "복숭아",
          "포도"
        ]
      },
      {
        "id": "tail-12-q-20",
        "coreWord": "하늘의변화",
        "word": "하늘의변화",
        "answer": "구름, 먹구름, 노을",
        "targetWords": [
          "구름",
          "먹구름",
          "노을"
        ],
        "distractorPool": [
          "땅",
          "바다",
          "산"
        ]
      },
      {
        "id": "tail-12-q-21",
        "coreWord": "봄나물",
        "word": "봄나물",
        "answer": "쑥, 냉이, 달래",
        "targetWords": [
          "쑥",
          "냉이",
          "달래"
        ],
        "distractorPool": [
          "미역",
          "다시마",
          "김"
        ]
      },
      {
        "id": "tail-12-q-22",
        "coreWord": "봄곤충",
        "word": "봄곤충",
        "answer": "나비, 꿀벌, 무당벌레",
        "targetWords": [
          "나비",
          "꿀벌",
          "무당벌레"
        ],
        "distractorPool": [
          "매미",
          "모기",
          "파리"
        ]
      },
      {
        "id": "tail-12-q-23",
        "coreWord": "여름철새",
        "word": "여름철새",
        "answer": "제비, 뻐꾸기, 백로",
        "targetWords": [
          "제비",
          "뻐꾸기",
          "백로"
        ],
        "distractorPool": [
          "기러기",
          "독수리",
          "펭귄"
        ]
      },
      {
        "id": "tail-12-q-24",
        "coreWord": "여름꽃",
        "word": "여름꽃",
        "answer": "해바라기, 무궁화, 나팔꽃",
        "targetWords": [
          "해바라기",
          "무궁화",
          "나팔꽃"
        ],
        "distractorPool": [
          "코스모스",
          "국화",
          "동백꽃"
        ]
      },
      {
        "id": "tail-12-q-25",
        "coreWord": "가을꽃",
        "word": "가을꽃",
        "answer": "코스모스, 국화, 들국화",
        "targetWords": [
          "코스모스",
          "국화",
          "들국화"
        ],
        "distractorPool": [
          "개나리",
          "벚꽃",
          "진달래"
        ]
      },
      {
        "id": "tail-12-q-26",
        "coreWord": "겨울새",
        "word": "겨울새",
        "answer": "기러기, 청둥오리, 두루미",
        "targetWords": [
          "기러기",
          "청둥오리",
          "두루미"
        ],
        "distractorPool": [
          "제비",
          "뻐꾸기",
          "참새"
        ]
      },
      {
        "id": "tail-12-q-27",
        "coreWord": "맑은날",
        "word": "맑은날",
        "answer": "화창함, 눈부심, 푸른하늘",
        "targetWords": [
          "화창함",
          "눈부심",
          "푸른하늘"
        ],
        "distractorPool": [
          "먹구름",
          "번개",
          "천둥"
        ]
      },
      {
        "id": "tail-12-q-28",
        "coreWord": "비오는날",
        "word": "비오는날",
        "answer": "우산, 장화, 빗방울",
        "targetWords": [
          "우산",
          "장화",
          "빗방울"
        ],
        "distractorPool": [
          "선글라스",
          "양산",
          "튜브"
        ]
      },
      {
        "id": "tail-12-q-29",
        "coreWord": "눈오는날",
        "word": "눈오는날",
        "answer": "눈사람, 썰매, 장갑",
        "targetWords": [
          "눈사람",
          "썰매",
          "장갑"
        ],
        "distractorPool": [
          "선풍기",
          "에어컨",
          "부채"
        ]
      },
      {
        "id": "tail-12-q-30",
        "coreWord": "태풍오는날",
        "word": "태풍오는날",
        "answer": "강풍, 폭우, 대피",
        "targetWords": [
          "강풍",
          "폭우",
          "대피"
        ],
        "distractorPool": [
          "맑음",
          "화창함",
          "소풍"
        ]
      },
      {
        "id": "tail-12-q-31",
        "coreWord": "지진",
        "word": "지진",
        "answer": "흔들림, 대피, 여진",
        "targetWords": [
          "흔들림",
          "대피",
          "여진"
        ],
        "distractorPool": [
          "폭설",
          "한파",
          "서리"
        ]
      },
      {
        "id": "tail-12-q-32",
        "coreWord": "홍수",
        "word": "홍수",
        "answer": "폭우, 침수, 산사태",
        "targetWords": [
          "폭우",
          "침수",
          "산사태"
        ],
        "distractorPool": [
          "가뭄",
          "메마름",
          "갈라짐"
        ]
      },
      {
        "id": "tail-12-q-33",
        "coreWord": "가뭄",
        "word": "가뭄",
        "answer": "물부족, 메마름, 쩍쩍갈라짐",
        "targetWords": [
          "물부족",
          "메마름",
          "쩍쩍갈라짐"
        ],
        "distractorPool": [
          "홍수",
          "침수",
          "폭우"
        ]
      },
      {
        "id": "tail-12-q-34",
        "coreWord": "화산폭발",
        "word": "화산폭발",
        "answer": "용암, 마그마, 화산재",
        "targetWords": [
          "용암",
          "마그마",
          "화산재"
        ],
        "distractorPool": [
          "눈보라",
          "빙하",
          "얼음"
        ]
      },
      {
        "id": "tail-12-q-35",
        "coreWord": "산의모습",
        "word": "산의모습",
        "answer": "봉우리, 계곡, 등산로",
        "targetWords": [
          "봉우리",
          "계곡",
          "등산로"
        ],
        "distractorPool": [
          "파도",
          "갯벌",
          "모래사장"
        ]
      },
      {
        "id": "tail-12-q-36",
        "coreWord": "바다의모습",
        "word": "바다의모습",
        "answer": "파도, 수평선, 갯벌",
        "targetWords": [
          "파도",
          "수평선",
          "갯벌"
        ],
        "distractorPool": [
          "봉우리",
          "계곡",
          "정상"
        ]
      },
      {
        "id": "tail-12-q-37",
        "coreWord": "강물의모습",
        "word": "강물의모습",
        "answer": "상류, 하류, 물줄기",
        "targetWords": [
          "상류",
          "하류",
          "물줄기"
        ],
        "distractorPool": [
          "사막",
          "오아시스",
          "모래언덕"
        ]
      },
      {
        "id": "tail-12-q-38",
        "coreWord": "밤하늘",
        "word": "밤하늘",
        "answer": "별자리, 은하수, 달",
        "targetWords": [
          "별자리",
          "은하수",
          "달"
        ],
        "distractorPool": [
          "태양",
          "무지개",
          "구름"
        ]
      },
      {
        "id": "tail-12-q-39",
        "coreWord": "달의모양",
        "word": "달의모양",
        "answer": "초승달, 보름달, 반달",
        "targetWords": [
          "초승달",
          "보름달",
          "반달"
        ],
        "distractorPool": [
          "별똥별",
          "유성",
          "은하수"
        ]
      },
      {
        "id": "tail-12-q-40",
        "coreWord": "무지개색",
        "word": "무지개색",
        "answer": "빨강, 노랑, 파랑",
        "targetWords": [
          "빨강",
          "노랑",
          "파랑"
        ],
        "distractorPool": [
          "검정",
          "회색",
          "하양"
        ]
      },
      {
        "id": "tail-12-q-41",
        "coreWord": "소나무",
        "word": "소나무",
        "answer": "솔방울, 솔잎, 푸름",
        "targetWords": [
          "솔방울",
          "솔잎",
          "푸름"
        ],
        "distractorPool": [
          "단풍잎",
          "은행잎",
          "낙엽"
        ]
      },
      {
        "id": "tail-12-q-42",
        "coreWord": "은행나무",
        "word": "은행나무",
        "answer": "노란잎, 은행알, 고약한냄새",
        "targetWords": [
          "노란잎",
          "은행알",
          "고약한냄새"
        ],
        "distractorPool": [
          "솔방울",
          "솔잎",
          "잣"
        ]
      },
      {
        "id": "tail-12-q-43",
        "coreWord": "단풍나무",
        "word": "단풍나무",
        "answer": "빨간잎, 가을산, 별모양잎",
        "targetWords": [
          "빨간잎",
          "가을산",
          "별모양잎"
        ],
        "distractorPool": [
          "벚꽃잎",
          "매화",
          "개나리"
        ]
      },
      {
        "id": "tail-12-q-44",
        "coreWord": "갯벌",
        "word": "갯벌",
        "answer": "조개, 게, 진흙",
        "targetWords": [
          "조개",
          "게",
          "진흙"
        ],
        "distractorPool": [
          "얼음",
          "눈사람",
          "빙하"
        ]
      },
      {
        "id": "tail-12-q-45",
        "coreWord": "사막",
        "word": "사막",
        "answer": "모래, 낙타, 선인장",
        "targetWords": [
          "모래",
          "낙타",
          "선인장"
        ],
        "distractorPool": [
          "북극곰",
          "펭귄",
          "바다표범"
        ]
      },
      {
        "id": "tail-12-q-46",
        "coreWord": "극지방",
        "word": "극지방",
        "answer": "빙하, 북극곰, 펭귄",
        "targetWords": [
          "빙하",
          "북극곰",
          "펭귄"
        ],
        "distractorPool": [
          "낙타",
          "선인장",
          "전갈"
        ]
      },
      {
        "id": "tail-12-q-47",
        "coreWord": "숲속",
        "word": "숲속",
        "answer": "나무, 맑은공기, 산새소리",
        "targetWords": [
          "나무",
          "맑은공기",
          "산새소리"
        ],
        "distractorPool": [
          "매연",
          "자동차소리",
          "빌딩"
        ]
      },
      {
        "id": "tail-12-q-48",
        "coreWord": "동굴",
        "word": "동굴",
        "answer": "박쥐, 종유석, 깜깜함",
        "targetWords": [
          "박쥐",
          "종유석",
          "깜깜함"
        ],
        "distractorPool": [
          "햇빛",
          "무지개",
          "화창함"
        ]
      },
      {
        "id": "tail-12-q-49",
        "coreWord": "아침이슬",
        "word": "아침이슬",
        "answer": "이슬방울, 풀잎, 촉촉함",
        "targetWords": [
          "이슬방울",
          "풀잎",
          "촉촉함"
        ],
        "distractorPool": [
          "바싹마름",
          "건조함",
          "갈라짐"
        ]
      },
      {
        "id": "tail-12-q-50",
        "coreWord": "저녁노을",
        "word": "저녁노을",
        "answer": "붉은하늘, 해질녘, 서쪽하늘",
        "targetWords": [
          "붉은하늘",
          "해질녘",
          "서쪽하늘"
        ],
        "distractorPool": [
          "동쪽하늘",
          "일출",
          "아침해"
        ]
      },
      {
        "id": "tail-12-q-51",
        "coreWord": "한낮",
        "word": "한낮",
        "answer": "쨍쨍함, 태양, 뜨거움",
        "targetWords": [
          "쨍쨍함",
          "태양",
          "뜨거움"
        ],
        "distractorPool": [
          "서늘함",
          "차가움",
          "으스스함"
        ]
      },
      {
        "id": "tail-12-q-52",
        "coreWord": "바다생물",
        "word": "바다생물",
        "answer": "미역, 다시마, 김",
        "targetWords": [
          "미역",
          "다시마",
          "김"
        ],
        "distractorPool": [
          "고사리",
          "버섯",
          "취나물"
        ]
      },
      {
        "id": "tail-12-q-53",
        "coreWord": "민물고기",
        "word": "민물고기",
        "answer": "붕어, 잉어, 송사리",
        "targetWords": [
          "붕어",
          "잉어",
          "송사리"
        ],
        "distractorPool": [
          "고등어",
          "갈치",
          "오징어"
        ]
      },
      {
        "id": "tail-12-q-54",
        "coreWord": "곤충의성장",
        "word": "곤충의성장",
        "answer": "알, 애벌레, 번데기",
        "targetWords": [
          "알",
          "애벌레",
          "번데기"
        ],
        "distractorPool": [
          "강아지",
          "송아지",
          "병아리"
        ]
      },
      {
        "id": "tail-12-q-55",
        "coreWord": "식물의성장",
        "word": "식물의성장",
        "answer": "씨앗, 새싹, 꽃",
        "targetWords": [
          "씨앗",
          "새싹",
          "꽃"
        ],
        "distractorPool": [
          "알",
          "번데기",
          "애벌레"
        ]
      },
      {
        "id": "tail-12-q-56",
        "coreWord": "낙엽",
        "word": "낙엽",
        "answer": "바스락, 갈색, 떨어짐",
        "targetWords": [
          "바스락",
          "갈색",
          "떨어짐"
        ],
        "distractorPool": [
          "돋아남",
          "푸르름",
          "피어남"
        ]
      },
      {
        "id": "tail-12-q-57",
        "coreWord": "첫눈",
        "word": "첫눈",
        "answer": "설렘, 하얀색, 차가움",
        "targetWords": [
          "설렘",
          "하얀색",
          "차가움"
        ],
        "distractorPool": [
          "푹푹찜",
          "더움",
          "땀방울"
        ]
      },
      {
        "id": "tail-12-q-58",
        "coreWord": "장마철",
        "word": "장마철",
        "answer": "습함, 꿉꿉함, 우산",
        "targetWords": [
          "습함",
          "꿉꿉함",
          "우산"
        ],
        "distractorPool": [
          "건조함",
          "메마름",
          "갈라짐"
        ]
      },
      {
        "id": "tail-12-q-59",
        "coreWord": "폭설",
        "word": "폭설",
        "answer": "고립, 제설차, 눈보라",
        "targetWords": [
          "고립",
          "제설차",
          "눈보라"
        ],
        "distractorPool": [
          "가뭄",
          "홍수",
          "태풍"
        ]
      },
      {
        "id": "tail-12-q-60",
        "coreWord": "생태계",
        "word": "생태계",
        "answer": "먹이사슬, 자연보호, 공존",
        "targetWords": [
          "먹이사슬",
          "자연보호",
          "공존"
        ],
        "distractorPool": [
          "파괴",
          "멸종",
          "오염"
        ]
      }
    ]
  },
  {
    "id": "tail-13",
    "title": "초등 10",
    "schoolLevelLabel": "10",
    "bandLabel": "초등",
    "descriptor": "결제와영수증",
    "grammarFocus": "결제와영수증",
    "goalCopy": "결제와영수증 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 27,
    "questions": [
      {
        "id": "tail-13-q-01",
        "coreWord": "현금",
        "word": "현금",
        "answer": "지폐, 동전, 거스름돈",
        "targetWords": [
          "지폐",
          "동전",
          "거스름돈"
        ],
        "distractorPool": [
          "카드",
          "스마트폰",
          "포인트"
        ]
      },
      {
        "id": "tail-13-q-02",
        "coreWord": "카드종류",
        "word": "카드종류",
        "answer": "신용카드, 체크카드, 교통카드",
        "targetWords": [
          "신용카드",
          "체크카드",
          "교통카드"
        ],
        "distractorPool": [
          "가위",
          "연필",
          "지우개"
        ]
      },
      {
        "id": "tail-13-q-03",
        "coreWord": "구매증명",
        "word": "구매증명",
        "answer": "영수증, 결제내역, 전자영수증",
        "targetWords": [
          "영수증",
          "결제내역",
          "전자영수증"
        ],
        "distractorPool": [
          "초대장",
          "편지",
          "일기장"
        ]
      },
      {
        "id": "tail-13-q-04",
        "coreWord": "가격인하",
        "word": "가격인하",
        "answer": "할인, 세일, 반값",
        "targetWords": [
          "할인",
          "세일",
          "반값"
        ],
        "distractorPool": [
          "인상",
          "세금",
          "연체료"
        ]
      },
      {
        "id": "tail-13-q-05",
        "coreWord": "혜택모으기",
        "word": "혜택모으기",
        "answer": "적립, 포인트, 마일리지",
        "targetWords": [
          "적립",
          "포인트",
          "마일리지"
        ],
        "distractorPool": [
          "취소",
          "환불",
          "폐기"
        ]
      },
      {
        "id": "tail-13-q-06",
        "coreWord": "돈관리",
        "word": "돈관리",
        "answer": "용돈기입장, 수입, 지출",
        "targetWords": [
          "용돈기입장",
          "수입",
          "지출"
        ],
        "distractorPool": [
          "동화책",
          "만화책",
          "그림책"
        ]
      },
      {
        "id": "tail-13-q-07",
        "coreWord": "온라인주문",
        "word": "온라인주문",
        "answer": "배달앱, 간편결제, 모바일쇼핑",
        "targetWords": [
          "배달앱",
          "간편결제",
          "모바일쇼핑"
        ],
        "distractorPool": [
          "공책",
          "필통",
          "지우개"
        ]
      },
      {
        "id": "tail-13-q-08",
        "coreWord": "돈모으기",
        "word": "돈모으기",
        "answer": "저축, 돼지저금통, 은행",
        "targetWords": [
          "저축",
          "돼지저금통",
          "은행"
        ],
        "distractorPool": [
          "낭비",
          "파산",
          "대출"
        ]
      },
      {
        "id": "tail-13-q-09",
        "coreWord": "셀프결제",
        "word": "셀프결제",
        "answer": "무인점포, 키오스크, 바코드스캐너",
        "targetWords": [
          "무인점포",
          "키오스크",
          "바코드스캐너"
        ],
        "distractorPool": [
          "경비원",
          "점원",
          "사장님"
        ]
      },
      {
        "id": "tail-13-q-10",
        "coreWord": "자동판매",
        "word": "자동판매",
        "answer": "자판기, 지폐투입구, 동전반환구",
        "targetWords": [
          "자판기",
          "지폐투입구",
          "동전반환구"
        ],
        "distractorPool": [
          "침대",
          "옷장",
          "책상"
        ]
      },
      {
        "id": "tail-13-q-11",
        "coreWord": "돈쓰기",
        "word": "돈쓰기",
        "answer": "소비, 구매, 지불",
        "targetWords": [
          "소비",
          "구매",
          "지불"
        ],
        "distractorPool": [
          "저축",
          "생산",
          "보관"
        ]
      },
      {
        "id": "tail-13-q-12",
        "coreWord": "나눠내기",
        "word": "나눠내기",
        "answer": "할부, 결제일, 이자",
        "targetWords": [
          "할부",
          "결제일",
          "이자"
        ],
        "distractorPool": [
          "무료",
          "사은품",
          "기부"
        ]
      },
      {
        "id": "tail-13-q-13",
        "coreWord": "외화",
        "word": "외화",
        "answer": "환전, 달러, 유로",
        "targetWords": [
          "환전",
          "달러",
          "유로"
        ],
        "distractorPool": [
          "우표",
          "엽서",
          "택배"
        ]
      },
      {
        "id": "tail-13-q-14",
        "coreWord": "남은돈",
        "word": "남은돈",
        "answer": "거스름돈, 차액, 잔돈",
        "targetWords": [
          "거스름돈",
          "차액",
          "잔돈"
        ],
        "distractorPool": [
          "수수료",
          "배송비",
          "세금"
        ]
      },
      {
        "id": "tail-13-q-15",
        "coreWord": "무계획소비",
        "word": "무계획소비",
        "answer": "충동구매, 과소비, 낭비",
        "targetWords": [
          "충동구매",
          "과소비",
          "낭비"
        ],
        "distractorPool": [
          "알뜰쇼핑",
          "계획소비",
          "절약"
        ]
      },
      {
        "id": "tail-13-q-16",
        "coreWord": "결제금액",
        "word": "결제금액",
        "answer": "총액, 합계, 부가세",
        "targetWords": [
          "총액",
          "합계",
          "부가세"
        ],
        "distractorPool": [
          "몸무게",
          "키",
          "길이"
        ]
      },
      {
        "id": "tail-13-q-17",
        "coreWord": "지갑속물건",
        "word": "지갑속물건",
        "answer": "현금, 신용카드, 신분증",
        "targetWords": [
          "현금",
          "신용카드",
          "신분증"
        ],
        "distractorPool": [
          "치약",
          "칫솔",
          "비누"
        ]
      },
      {
        "id": "tail-13-q-18",
        "coreWord": "은행업무",
        "word": "은행업무",
        "answer": "예금, 출금, 송금",
        "targetWords": [
          "예금",
          "출금",
          "송금"
        ],
        "distractorPool": [
          "수술",
          "진찰",
          "요리"
        ]
      },
      {
        "id": "tail-13-q-19",
        "coreWord": "물건값",
        "word": "물건값",
        "answer": "정가, 할인가, 행사가",
        "targetWords": [
          "정가",
          "할인가",
          "행사가"
        ],
        "distractorPool": [
          "체온",
          "온도",
          "습도"
        ]
      },
      {
        "id": "tail-13-q-20",
        "coreWord": "온라인결제",
        "word": "온라인결제",
        "answer": "비밀번호, 인증, 간편결제",
        "targetWords": [
          "비밀번호",
          "인증",
          "간편결제"
        ],
        "distractorPool": [
          "현금",
          "동전",
          "수표"
        ]
      },
      {
        "id": "tail-13-q-21",
        "coreWord": "영수증내용",
        "word": "영수증내용",
        "answer": "상호명, 판매일시, 승인번호",
        "targetWords": [
          "상호명",
          "판매일시",
          "승인번호"
        ],
        "distractorPool": [
          "일기내용",
          "편지내용",
          "동화내용"
        ]
      },
      {
        "id": "tail-13-q-22",
        "coreWord": "결제진행",
        "word": "결제진행",
        "answer": "서명, 단말기, 승인",
        "targetWords": [
          "서명",
          "단말기",
          "승인"
        ],
        "distractorPool": [
          "취소",
          "환불",
          "반품"
        ]
      },
      {
        "id": "tail-13-q-23",
        "coreWord": "은행업무",
        "word": "은행업무",
        "answer": "번호표, 창구, 신분증",
        "targetWords": [
          "번호표",
          "창구",
          "신분증"
        ],
        "distractorPool": [
          "수술",
          "진찰",
          "요리"
        ]
      },
      {
        "id": "tail-13-q-24",
        "coreWord": "용돈받기",
        "word": "용돈받기",
        "answer": "심부름값, 세뱃돈, 칭찬상금",
        "targetWords": [
          "심부름값",
          "세뱃돈",
          "칭찬상금"
        ],
        "distractorPool": [
          "벌금",
          "과태료",
          "세금"
        ]
      },
      {
        "id": "tail-13-q-25",
        "coreWord": "돈모으기",
        "word": "돈모으기",
        "answer": "통장만들기, 돼지저금통, 예금",
        "targetWords": [
          "통장만들기",
          "돼지저금통",
          "예금"
        ],
        "distractorPool": [
          "낭비",
          "과소비",
          "빚"
        ]
      },
      {
        "id": "tail-13-q-26",
        "coreWord": "경제뉴스",
        "word": "경제뉴스",
        "answer": "물가상승, 환율, 주가",
        "targetWords": [
          "물가상승",
          "환율",
          "주가"
        ],
        "distractorPool": [
          "연예뉴스",
          "스포츠",
          "날씨"
        ]
      },
      {
        "id": "tail-13-q-27",
        "coreWord": "할부결제",
        "word": "할부결제",
        "answer": "나눠내기, 개월수, 수수료",
        "targetWords": [
          "나눠내기",
          "개월수",
          "수수료"
        ],
        "distractorPool": [
          "일시불",
          "한번에내기",
          "현금결제"
        ]
      },
      {
        "id": "tail-13-q-28",
        "coreWord": "일시불",
        "word": "일시불",
        "answer": "한번에내기, 수수료없음, 깔끔함",
        "targetWords": [
          "한번에내기",
          "수수료없음",
          "깔끔함"
        ],
        "distractorPool": [
          "나눠내기",
          "할부",
          "이자"
        ]
      },
      {
        "id": "tail-13-q-29",
        "coreWord": "세금",
        "word": "세금",
        "answer": "부가가치세, 소득세, 주민세",
        "targetWords": [
          "부가가치세",
          "소득세",
          "주민세"
        ],
        "distractorPool": [
          "용돈",
          "장학금",
          "세뱃돈"
        ]
      },
      {
        "id": "tail-13-q-30",
        "coreWord": "현금영수증",
        "word": "현금영수증",
        "answer": "휴대폰번호, 소득공제, 혜택",
        "targetWords": [
          "휴대폰번호",
          "소득공제",
          "혜택"
        ],
        "distractorPool": [
          "영수증버리기",
          "탈세",
          "불법"
        ]
      },
      {
        "id": "tail-13-q-31",
        "coreWord": "무인계산대",
        "word": "무인계산대",
        "answer": "바코드스캔, 셀프결제, 카드투입",
        "targetWords": [
          "바코드스캔",
          "셀프결제",
          "카드투입"
        ],
        "distractorPool": [
          "점원결제",
          "현금만가능",
          "외상"
        ]
      },
      {
        "id": "tail-13-q-32",
        "coreWord": "키오스크",
        "word": "키오스크",
        "answer": "화면터치, 주문하기, 결제버튼",
        "targetWords": [
          "화면터치",
          "주문하기",
          "결제버튼"
        ],
        "distractorPool": [
          "전화주문",
          "배달원",
          "종업원"
        ]
      },
      {
        "id": "tail-13-q-33",
        "coreWord": "더치페이",
        "word": "더치페이",
        "answer": "나눠내기, 각자계산, 송금",
        "targetWords": [
          "나눠내기",
          "각자계산",
          "송금"
        ],
        "distractorPool": [
          "내가다내기",
          "한턱쏘기",
          "외상"
        ]
      },
      {
        "id": "tail-13-q-34",
        "coreWord": "모바일상품권",
        "word": "모바일상품권",
        "answer": "바코드화면, 기간연장, 선물하기",
        "targetWords": [
          "바코드화면",
          "기간연장",
          "선물하기"
        ],
        "distractorPool": [
          "현금",
          "동전",
          "지폐"
        ]
      },
      {
        "id": "tail-13-q-35",
        "coreWord": "할인쿠폰",
        "word": "할인쿠폰",
        "answer": "오천원할인, 반값, 바코드",
        "targetWords": [
          "오천원할인",
          "반값",
          "바코드"
        ],
        "distractorPool": [
          "정가결제",
          "바가지",
          "인상"
        ]
      },
      {
        "id": "tail-13-q-36",
        "coreWord": "중고거래",
        "word": "중고거래",
        "answer": "직거래, 당근마켓, 계좌이체",
        "targetWords": [
          "직거래",
          "당근마켓",
          "계좌이체"
        ],
        "distractorPool": [
          "백화점",
          "신상품",
          "명품관"
        ]
      },
      {
        "id": "tail-13-q-37",
        "coreWord": "가계부",
        "word": "가계부",
        "answer": "수입, 지출, 잔액",
        "targetWords": [
          "수입",
          "지출",
          "잔액"
        ],
        "distractorPool": [
          "키",
          "몸무게",
          "시력"
        ]
      },
      {
        "id": "tail-13-q-38",
        "coreWord": "지출",
        "word": "지출",
        "answer": "과자사기, 학용품사기, 교통비",
        "targetWords": [
          "과자사기",
          "학용품사기",
          "교통비"
        ],
        "distractorPool": [
          "세뱃돈받기",
          "용돈받기",
          "상금"
        ]
      },
      {
        "id": "tail-13-q-39",
        "coreWord": "수입",
        "word": "수입",
        "answer": "용돈, 세뱃돈, 상금",
        "targetWords": [
          "용돈",
          "세뱃돈",
          "상금"
        ],
        "distractorPool": [
          "장난감사기",
          "간식사기",
          "요금내기"
        ]
      },
      {
        "id": "tail-13-q-40",
        "coreWord": "물가상승",
        "word": "물가상승",
        "answer": "비싸짐, 돈가치하락, 인플레이션",
        "targetWords": [
          "비싸짐",
          "돈가치하락",
          "인플레이션"
        ],
        "distractorPool": [
          "싸짐",
          "할인",
          "반값"
        ]
      },
      {
        "id": "tail-13-q-41",
        "coreWord": "환율",
        "word": "환율",
        "answer": "달러, 외국돈, 교환비율",
        "targetWords": [
          "달러",
          "외국돈",
          "교환비율"
        ],
        "distractorPool": [
          "우표",
          "택배비",
          "관리비"
        ]
      },
      {
        "id": "tail-13-q-42",
        "coreWord": "은행이자",
        "word": "은행이자",
        "answer": "예금이자, 대출이자, 금리",
        "targetWords": [
          "예금이자",
          "대출이자",
          "금리"
        ],
        "distractorPool": [
          "벌금",
          "과태료",
          "범칙금"
        ]
      },
      {
        "id": "tail-13-q-43",
        "coreWord": "대출",
        "word": "대출",
        "answer": "돈빌리기, 이자내기, 신용",
        "targetWords": [
          "돈빌리기",
          "이자내기",
          "신용"
        ],
        "distractorPool": [
          "돈저축하기",
          "예금하기",
          "적금하기"
        ]
      },
      {
        "id": "tail-13-q-44",
        "coreWord": "주식",
        "word": "주식",
        "answer": "회사투자, 주가상승, 주가하락",
        "targetWords": [
          "회사투자",
          "주가상승",
          "주가하락"
        ],
        "distractorPool": [
          "돼지저금통",
          "적금",
          "예금"
        ]
      },
      {
        "id": "tail-13-q-45",
        "coreWord": "빚",
        "word": "빚",
        "answer": "갚을돈, 마이너스, 대출금",
        "targetWords": [
          "갚을돈",
          "마이너스",
          "대출금"
        ],
        "distractorPool": [
          "플러스",
          "흑자",
          "수익"
        ]
      },
      {
        "id": "tail-13-q-46",
        "coreWord": "흑자",
        "word": "흑자",
        "answer": "이익, 남는돈, 플러스",
        "targetWords": [
          "이익",
          "남는돈",
          "플러스"
        ],
        "distractorPool": [
          "적자",
          "손해",
          "마이너스"
        ]
      },
      {
        "id": "tail-13-q-47",
        "coreWord": "적자",
        "word": "적자",
        "answer": "손해, 모자란돈, 빚",
        "targetWords": [
          "손해",
          "모자란돈",
          "빚"
        ],
        "distractorPool": [
          "흑자",
          "이익",
          "수익"
        ]
      },
      {
        "id": "tail-13-q-48",
        "coreWord": "경제활동",
        "word": "경제활동",
        "answer": "생산, 분배, 소비",
        "targetWords": [
          "생산",
          "분배",
          "소비"
        ],
        "distractorPool": [
          "수면",
          "식사",
          "휴식"
        ]
      },
      {
        "id": "tail-13-q-49",
        "coreWord": "자본주의",
        "word": "자본주의",
        "answer": "자유경쟁, 시장, 이윤추구",
        "targetWords": [
          "자유경쟁",
          "시장",
          "이윤추구"
        ],
        "distractorPool": [
          "공산주의",
          "배급",
          "통제"
        ]
      },
      {
        "id": "tail-13-q-50",
        "coreWord": "소비자",
        "word": "소비자",
        "answer": "물건사기, 서비스이용, 돈내기",
        "targetWords": [
          "물건사기",
          "서비스이용",
          "돈내기"
        ],
        "distractorPool": [
          "물건만들기",
          "판매하기",
          "농사짓기"
        ]
      },
      {
        "id": "tail-13-q-51",
        "coreWord": "생산자",
        "word": "생산자",
        "answer": "공장, 농부, 회사",
        "targetWords": [
          "공장",
          "농부",
          "회사"
        ],
        "distractorPool": [
          "소비자",
          "구매자",
          "손님"
        ]
      },
      {
        "id": "tail-13-q-52",
        "coreWord": "시장경제",
        "word": "시장경제",
        "answer": "수요, 공급, 가격",
        "targetWords": [
          "수요",
          "공급",
          "가격"
        ],
        "distractorPool": [
          "통제",
          "배급",
          "무상"
        ]
      },
      {
        "id": "tail-13-q-53",
        "coreWord": "수출",
        "word": "수출",
        "answer": "외국에팔기, 배, 비행기",
        "targetWords": [
          "외국에팔기",
          "배",
          "비행기"
        ],
        "distractorPool": [
          "사오기",
          "수입",
          "외국물건"
        ]
      },
      {
        "id": "tail-13-q-54",
        "coreWord": "수입",
        "word": "수입",
        "answer": "외국에서사오기, 통관, 세관",
        "targetWords": [
          "외국에서사오기",
          "통관",
          "세관"
        ],
        "distractorPool": [
          "외국에팔기",
          "수출",
          "달러벌기"
        ]
      },
      {
        "id": "tail-13-q-55",
        "coreWord": "무역",
        "word": "무역",
        "answer": "수출, 수입, 관세",
        "targetWords": [
          "수출",
          "수입",
          "관세"
        ],
        "distractorPool": [
          "국내거래",
          "직거래",
          "중고마켓"
        ]
      },
      {
        "id": "tail-13-q-56",
        "coreWord": "독점",
        "word": "독점",
        "answer": "하나뿐임, 가격마음대로, 경쟁없음",
        "targetWords": [
          "하나뿐임",
          "가격마음대로",
          "경쟁없음"
        ],
        "distractorPool": [
          "자유경쟁",
          "세일",
          "가격인하"
        ]
      },
      {
        "id": "tail-13-q-57",
        "coreWord": "담합",
        "word": "담합",
        "answer": "가격맞추기, 불법, 소비자피해",
        "targetWords": [
          "가격맞추기",
          "불법",
          "소비자피해"
        ],
        "distractorPool": [
          "자유경쟁",
          "공정거래",
          "선의의경쟁"
        ]
      },
      {
        "id": "tail-13-q-58",
        "coreWord": "공정거래",
        "word": "공정거래",
        "answer": "정당한경쟁, 소비자보호, 위원회",
        "targetWords": [
          "정당한경쟁",
          "소비자보호",
          "위원회"
        ],
        "distractorPool": [
          "독점",
          "담합",
          "사기"
        ]
      },
      {
        "id": "tail-13-q-59",
        "coreWord": "보이스피싱",
        "word": "보이스피싱",
        "answer": "사기전화, 비밀번호요구, 돈요구",
        "targetWords": [
          "사기전화",
          "비밀번호요구",
          "돈요구"
        ],
        "distractorPool": [
          "적금안내",
          "예금상담",
          "대출상담"
        ]
      },
      {
        "id": "tail-13-q-60",
        "coreWord": "금융사기",
        "word": "금융사기",
        "answer": "스미싱, 해킹, 개인정보유출",
        "targetWords": [
          "스미싱",
          "해킹",
          "개인정보유출"
        ],
        "distractorPool": [
          "이자수익",
          "배당금",
          "용돈"
        ]
      }
    ]
  },
  {
    "id": "tail-14",
    "title": "초등 11",
    "schoolLevelLabel": "11",
    "bandLabel": "초등",
    "descriptor": "환불과교환",
    "grammarFocus": "환불과교환",
    "goalCopy": "환불과교환 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 27,
    "questions": [
      {
        "id": "tail-14-q-01",
        "coreWord": "돈돌려받기",
        "word": "돈돌려받기",
        "answer": "환불, 취소, 반품",
        "targetWords": [
          "환불",
          "취소",
          "반품"
        ],
        "distractorPool": [
          "구매",
          "결제",
          "저축"
        ]
      },
      {
        "id": "tail-14-q-02",
        "coreWord": "필수지참물",
        "word": "필수지참물",
        "answer": "영수증, 구매내역, 결제카드",
        "targetWords": [
          "영수증",
          "구매내역",
          "결제카드"
        ],
        "distractorPool": [
          "포장지",
          "상자",
          "리본"
        ]
      },
      {
        "id": "tail-14-q-03",
        "coreWord": "반품사유",
        "word": "반품사유",
        "answer": "불량품, 파손, 고장",
        "targetWords": [
          "불량품",
          "파손",
          "고장"
        ],
        "distractorPool": [
          "정품",
          "신상품",
          "명품"
        ]
      },
      {
        "id": "tail-14-q-04",
        "coreWord": "제품정보",
        "word": "제품정보",
        "answer": "가격태그, 상표, 바코드",
        "targetWords": [
          "가격태그",
          "상표",
          "바코드"
        ],
        "distractorPool": [
          "얼룩",
          "먼지",
          "냄새"
        ]
      },
      {
        "id": "tail-14-q-05",
        "coreWord": "돌려보내기",
        "word": "돌려보내기",
        "answer": "택배반송, 배송비, 상자포장",
        "targetWords": [
          "택배반송",
          "배송비",
          "상자포장"
        ],
        "distractorPool": [
          "우표",
          "편지",
          "엽서"
        ]
      },
      {
        "id": "tail-14-q-06",
        "coreWord": "돈보내기",
        "word": "돈보내기",
        "answer": "입금, 이체, 송금",
        "targetWords": [
          "입금",
          "이체",
          "송금"
        ],
        "distractorPool": [
          "대출",
          "이자",
          "세금"
        ]
      },
      {
        "id": "tail-14-q-07",
        "coreWord": "도움요청",
        "word": "도움요청",
        "answer": "고객센터, 상담원, 안내데스크",
        "targetWords": [
          "고객센터",
          "상담원",
          "안내데스크"
        ],
        "distractorPool": [
          "계산대",
          "시식코너",
          "화장실"
        ]
      },
      {
        "id": "tail-14-q-08",
        "coreWord": "약속",
        "word": "약속",
        "answer": "규정, 환불기간, 약관",
        "targetWords": [
          "규정",
          "환불기간",
          "약관"
        ],
        "distractorPool": [
          "비밀",
          "소문",
          "농담"
        ]
      },
      {
        "id": "tail-14-q-09",
        "coreWord": "마음바뀜",
        "word": "마음바뀜",
        "answer": "단순변심, 색상교환, 사이즈교환",
        "targetWords": [
          "단순변심",
          "색상교환",
          "사이즈교환"
        ],
        "distractorPool": [
          "제품불량",
          "고장",
          "파손"
        ]
      },
      {
        "id": "tail-14-q-10",
        "coreWord": "공짜선물",
        "word": "공짜선물",
        "answer": "사은품, 증정품, 샘플",
        "targetWords": [
          "사은품",
          "증정품",
          "샘플"
        ],
        "distractorPool": [
          "벌금",
          "수수료",
          "연체료"
        ]
      },
      {
        "id": "tail-14-q-11",
        "coreWord": "결제취소",
        "word": "결제취소",
        "answer": "승인취소, 마이너스결제, 환불처리",
        "targetWords": [
          "승인취소",
          "마이너스결제",
          "환불처리"
        ],
        "distractorPool": [
          "입금",
          "적립",
          "충전"
        ]
      },
      {
        "id": "tail-14-q-12",
        "coreWord": "권리보호",
        "word": "권리보호",
        "answer": "소비자원, 피해구제, 신고",
        "targetWords": [
          "소비자원",
          "피해구제",
          "신고"
        ],
        "distractorPool": [
          "경찰서",
          "소방서",
          "우체국"
        ]
      },
      {
        "id": "tail-14-q-13",
        "coreWord": "품질보장",
        "word": "품질보장",
        "answer": "보증서, 수리, 에이에스",
        "targetWords": [
          "보증서",
          "수리",
          "에이에스"
        ],
        "distractorPool": [
          "영수증",
          "안내장",
          "초대장"
        ]
      },
      {
        "id": "tail-14-q-14",
        "coreWord": "나쁜태도",
        "word": "나쁜태도",
        "answer": "진상손님, 억지, 무례함",
        "targetWords": [
          "진상손님",
          "억지",
          "무례함"
        ],
        "distractorPool": [
          "칭찬",
          "배려",
          "양보"
        ]
      },
      {
        "id": "tail-14-q-15",
        "coreWord": "소비자의힘",
        "word": "소비자의힘",
        "answer": "정당한권리, 당당함, 요구",
        "targetWords": [
          "정당한권리",
          "당당함",
          "요구"
        ],
        "distractorPool": [
          "미안함",
          "부끄러움",
          "도망"
        ]
      },
      {
        "id": "tail-14-q-16",
        "coreWord": "교환불가",
        "word": "교환불가",
        "answer": "사용흔적, 택제거, 세탁후",
        "targetWords": [
          "사용흔적",
          "택제거",
          "세탁후"
        ],
        "distractorPool": [
          "미개봉",
          "새상품",
          "영수증지참"
        ]
      },
      {
        "id": "tail-14-q-17",
        "coreWord": "옷교환",
        "word": "옷교환",
        "answer": "치수변경, 색상변경, 디자인변경",
        "targetWords": [
          "치수변경",
          "색상변경",
          "디자인변경"
        ],
        "distractorPool": [
          "현금결제",
          "카드결제",
          "포인트결제"
        ]
      },
      {
        "id": "tail-14-q-18",
        "coreWord": "불만표현",
        "word": "불만표현",
        "answer": "항의, 컴플레인, 불만접수",
        "targetWords": [
          "항의",
          "컴플레인",
          "불만접수"
        ],
        "distractorPool": [
          "칭찬",
          "환호",
          "응원"
        ]
      },
      {
        "id": "tail-14-q-19",
        "coreWord": "택배반품",
        "word": "택배반품",
        "answer": "반품접수, 방문수거, 반송장",
        "targetWords": [
          "반품접수",
          "방문수거",
          "반송장"
        ],
        "distractorPool": [
          "로켓배송",
          "새벽배송",
          "택배함"
        ]
      },
      {
        "id": "tail-14-q-20",
        "coreWord": "환불금액",
        "word": "환불금액",
        "answer": "전액환불, 부분환불, 배송비차감",
        "targetWords": [
          "전액환불",
          "부분환불",
          "배송비차감"
        ],
        "distractorPool": [
          "용돈",
          "장학금",
          "세뱃돈"
        ]
      },
      {
        "id": "tail-14-q-21",
        "coreWord": "고객센터",
        "word": "고객센터",
        "answer": "상담원, 전화문의, 챗봇상담",
        "targetWords": [
          "상담원",
          "전화문의",
          "챗봇상담"
        ],
        "distractorPool": [
          "진상고객",
          "블랙컨슈머",
          "악플러"
        ]
      },
      {
        "id": "tail-14-q-22",
        "coreWord": "환불불가",
        "word": "환불불가",
        "answer": "포장훼손, 상표제거, 세탁후",
        "targetWords": [
          "포장훼손",
          "상표제거",
          "세탁후"
        ],
        "distractorPool": [
          "미개봉",
          "새상품",
          "보증서지참"
        ]
      },
      {
        "id": "tail-14-q-23",
        "coreWord": "제품불량",
        "word": "제품불량",
        "answer": "작동불량, 오염, 파손",
        "targetWords": [
          "작동불량",
          "오염",
          "파손"
        ],
        "distractorPool": [
          "단순변심",
          "색상불만",
          "사이즈불만"
        ]
      },
      {
        "id": "tail-14-q-24",
        "coreWord": "단순변심",
        "word": "단순변심",
        "answer": "색상마음에안듬, 사이즈안맞음, 다른것으로바꿈",
        "targetWords": [
          "색상마음에안듬",
          "사이즈안맞음",
          "다른것으로바꿈"
        ],
        "distractorPool": [
          "전원안켜짐",
          "깨져있음",
          "찢어져있음"
        ]
      },
      {
        "id": "tail-14-q-25",
        "coreWord": "서비스센터",
        "word": "서비스센터",
        "answer": "무상수리, 유상수리, 부품교체",
        "targetWords": [
          "무상수리",
          "유상수리",
          "부품교체"
        ],
        "distractorPool": [
          "새제품구매",
          "중고판매",
          "환불처리"
        ]
      },
      {
        "id": "tail-14-q-26",
        "coreWord": "품질보증",
        "word": "품질보증",
        "answer": "보증서, 일년무상, 정품인증",
        "targetWords": [
          "보증서",
          "일년무상",
          "정품인증"
        ],
        "distractorPool": [
          "짝퉁",
          "가품",
          "위조품"
        ]
      },
      {
        "id": "tail-14-q-27",
        "coreWord": "영수증분실",
        "word": "영수증분실",
        "answer": "카드결제내역, 앱구매기록, 멤버십조회",
        "targetWords": [
          "카드결제내역",
          "앱구매기록",
          "멤버십조회"
        ],
        "distractorPool": [
          "현금결제모름",
          "증명불가",
          "환불거절"
        ]
      },
      {
        "id": "tail-14-q-28",
        "coreWord": "매장책임자",
        "word": "매장책임자",
        "answer": "점장님, 매니저, 책임자호출",
        "targetWords": [
          "점장님",
          "매니저",
          "책임자호출"
        ],
        "distractorPool": [
          "알바생",
          "손님",
          "구경꾼"
        ]
      },
      {
        "id": "tail-14-q-29",
        "coreWord": "오배송",
        "word": "오배송",
        "answer": "다른물건옴, 주소잘못됨, 수량부족",
        "targetWords": [
          "다른물건옴",
          "주소잘못됨",
          "수량부족"
        ],
        "distractorPool": [
          "정상배송",
          "로켓배송",
          "당일도착"
        ]
      },
      {
        "id": "tail-14-q-30",
        "coreWord": "반품택배",
        "word": "반품택배",
        "answer": "방문수거, 반송장, 배송비동봉",
        "targetWords": [
          "방문수거",
          "반송장",
          "배송비동봉"
        ],
        "distractorPool": [
          "직접가져가기",
          "매장방문",
          "구매확정"
        ]
      },
      {
        "id": "tail-14-q-31",
        "coreWord": "블랙컨슈머",
        "word": "블랙컨슈머",
        "answer": "억지부리기, 과도한보상요구, 악성민원",
        "targetWords": [
          "억지부리기",
          "과도한보상요구",
          "악성민원"
        ],
        "distractorPool": [
          "착한소비자",
          "칭찬하기",
          "양보하기"
        ]
      },
      {
        "id": "tail-14-q-32",
        "coreWord": "소비자보호",
        "word": "소비자보호",
        "answer": "한국소비자원, 피해구제, 분쟁조정",
        "targetWords": [
          "한국소비자원",
          "피해구제",
          "분쟁조정"
        ],
        "distractorPool": [
          "경찰서",
          "소방서",
          "우체국"
        ]
      },
      {
        "id": "tail-14-q-33",
        "coreWord": "인터넷쇼핑환불",
        "word": "인터넷쇼핑환불",
        "answer": "반품버튼누르기, 사유입력, 택배포장",
        "targetWords": [
          "반품버튼누르기",
          "사유입력",
          "택배포장"
        ],
        "distractorPool": [
          "매장가서따지기",
          "전화로욕하기",
          "물건부수기"
        ]
      },
      {
        "id": "tail-14-q-34",
        "coreWord": "결제취소확인",
        "word": "결제취소확인",
        "answer": "카드사문자, 환불입금, 앱알림",
        "targetWords": [
          "카드사문자",
          "환불입금",
          "앱알림"
        ],
        "distractorPool": [
          "현금인출",
          "계좌이체",
          "송금하기"
        ]
      },
      {
        "id": "tail-14-q-35",
        "coreWord": "포장주의",
        "word": "포장주의",
        "answer": "박스테이프, 뽁뽁이, 완충재",
        "targetWords": [
          "박스테이프",
          "뽁뽁이",
          "완충재"
        ],
        "distractorPool": [
          "칼로찢기",
          "박스버리기",
          "영수증버리기"
        ]
      },
      {
        "id": "tail-14-q-36",
        "coreWord": "교환권",
        "word": "교환권",
        "answer": "카카오톡선물, 기프티콘, 바코드",
        "targetWords": [
          "카카오톡선물",
          "기프티콘",
          "바코드"
        ],
        "distractorPool": [
          "현금",
          "동전",
          "수표"
        ]
      },
      {
        "id": "tail-14-q-37",
        "coreWord": "중고거래환불",
        "word": "중고거래환불",
        "answer": "개인간거래, 환불어려움, 신중한구매",
        "targetWords": [
          "개인간거래",
          "환불어려움",
          "신중한구매"
        ],
        "distractorPool": [
          "묻지도따지지도않음",
          "영수증환불",
          "매장환불"
        ]
      },
      {
        "id": "tail-14-q-38",
        "coreWord": "사은품반납",
        "word": "사은품반납",
        "answer": "증정품돌려주기, 샘플반납, 본품만주기",
        "targetWords": [
          "증정품돌려주기",
          "샘플반납",
          "본품만주기"
        ],
        "distractorPool": [
          "사은품은내꺼",
          "몰래가져가기"
        ]
      },
      {
        "id": "tail-14-q-39",
        "coreWord": "음식환불",
        "word": "음식환불",
        "answer": "이물질나옴, 상한음식, 머리카락",
        "targetWords": [
          "이물질나옴",
          "상한음식",
          "머리카락"
        ],
        "distractorPool": [
          "맛이없음",
          "배부름",
          "식음"
        ]
      },
      {
        "id": "tail-14-q-40",
        "coreWord": "배달앱환불",
        "word": "배달앱환불",
        "answer": "가게전화, 고객센터채팅, 사진찍어보내기",
        "targetWords": [
          "가게전화",
          "고객센터채팅",
          "사진찍어보내기"
        ],
        "distractorPool": [
          "다먹고환불요구",
          "별점테러",
          "욕설리뷰"
        ]
      },
      {
        "id": "tail-14-q-41",
        "coreWord": "하자상품",
        "word": "하자상품",
        "answer": "스크래치, 흠집, 올나감",
        "targetWords": [
          "스크래치",
          "흠집",
          "올나감"
        ],
        "distractorPool": [
          "완벽한상태",
          "새것",
          "반짝반짝"
        ]
      },
      {
        "id": "tail-14-q-42",
        "coreWord": "친절한응대",
        "word": "친절한응대",
        "answer": "죄송합니다, 확인하겠습니다, 신속한처리",
        "targetWords": [
          "죄송합니다",
          "확인하겠습니다",
          "신속한처리"
        ],
        "distractorPool": [
          "화내기",
          "따지기",
          "짜증내기"
        ]
      },
      {
        "id": "tail-14-q-43",
        "coreWord": "무례한손님",
        "word": "무례한손님",
        "answer": "반말하기, 소리지르기, 돈던지기",
        "targetWords": [
          "반말하기",
          "소리지르기",
          "돈던지기"
        ],
        "distractorPool": [
          "인사하기",
          "존댓말쓰기",
          "기다리기"
        ]
      },
      {
        "id": "tail-14-q-44",
        "coreWord": "환불기간",
        "word": "환불기간",
        "answer": "구매후칠일, 이주일이내, 기한엄수",
        "targetWords": [
          "구매후칠일",
          "이주일이내",
          "기한엄수"
        ],
        "distractorPool": [
          "일년뒤",
          "십년뒤",
          "평생가능"
        ]
      },
      {
        "id": "tail-14-q-45",
        "coreWord": "묶음상품환불",
        "word": "묶음상품환불",
        "answer": "전체반품, 낱개환불불가, 세트상품",
        "targetWords": [
          "전체반품",
          "낱개환불불가",
          "세트상품"
        ],
        "distractorPool": [
          "하나만반품",
          "먹고반품",
          "쓰고반품"
        ]
      },
      {
        "id": "tail-14-q-46",
        "coreWord": "화장품환불",
        "word": "화장품환불",
        "answer": "트러블진단서, 피부뒤집어짐, 의사소견서",
        "targetWords": [
          "트러블진단서",
          "피부뒤집어짐",
          "의사소견서"
        ],
        "distractorPool": [
          "색상맘에안듬",
          "케이스안이쁨",
          "냄새싫음"
        ]
      },
      {
        "id": "tail-14-q-47",
        "coreWord": "신발교환",
        "word": "신발교환",
        "answer": "사이즈작음, 발볼좁음, 뒤꿈치까짐",
        "targetWords": [
          "사이즈작음",
          "발볼좁음",
          "뒤꿈치까짐"
        ],
        "distractorPool": [
          "밖에서신음",
          "흙묻음",
          "밑창닳음"
        ]
      },
      {
        "id": "tail-14-q-48",
        "coreWord": "전자제품교환",
        "word": "전자제품교환",
        "answer": "전원불량, 화면안나옴, 소리안남",
        "targetWords": [
          "전원불량",
          "화면안나옴",
          "소리안남"
        ],
        "distractorPool": [
          "색상변경",
          "박스버림",
          "단순변심"
        ]
      },
      {
        "id": "tail-14-q-49",
        "coreWord": "환불거절",
        "word": "환불거절",
        "answer": "착용흔적, 세탁완료, 향수냄새",
        "targetWords": [
          "착용흔적",
          "세탁완료",
          "향수냄새"
        ],
        "distractorPool": [
          "미개봉",
          "박스온전",
          "택그대로"
        ]
      },
      {
        "id": "tail-14-q-50",
        "coreWord": "교환절차",
        "word": "교환절차",
        "answer": "영수증제시, 물건확인, 새물건수령",
        "targetWords": [
          "영수증제시",
          "물건확인",
          "새물건수령"
        ],
        "distractorPool": [
          "무작정화내기",
          "물건던지기",
          "경찰부르기"
        ]
      },
      {
        "id": "tail-14-q-51",
        "coreWord": "소비자권리",
        "word": "소비자권리",
        "answer": "알권리, 보상받을권리, 안전할권리",
        "targetWords": [
          "알권리",
          "보상받을권리",
          "안전할권리"
        ],
        "distractorPool": [
          "억지부릴권리",
          "공짜로받을권리",
          "화낼권리"
        ]
      },
      {
        "id": "tail-14-q-52",
        "coreWord": "기업의책임",
        "word": "기업의책임",
        "answer": "안전한제품, 친절한서비스, 정확한정보",
        "targetWords": [
          "안전한제품",
          "친절한서비스",
          "정확한정보"
        ],
        "distractorPool": [
          "속이기",
          "감추기",
          "불량품팔기"
        ]
      },
      {
        "id": "tail-14-q-53",
        "coreWord": "리콜제도",
        "word": "리콜제도",
        "answer": "결함인정, 전량수거, 무상수리",
        "targetWords": [
          "결함인정",
          "전량수거",
          "무상수리"
        ],
        "distractorPool": [
          "은폐",
          "발뺌",
          "무시"
        ]
      },
      {
        "id": "tail-14-q-54",
        "coreWord": "짝퉁피해",
        "word": "짝퉁피해",
        "answer": "가품, 위조품, 정품보장안됨",
        "targetWords": [
          "가품",
          "위조품",
          "정품보장안됨"
        ],
        "distractorPool": [
          "정품인증",
          "보증서",
          "백화점"
        ]
      },
      {
        "id": "tail-14-q-55",
        "coreWord": "해외직구반품",
        "word": "해외직구반품",
        "answer": "복잡한절차, 비싼배송비, 오랜시간",
        "targetWords": [
          "복잡한절차",
          "비싼배송비",
          "오랜시간"
        ],
        "distractorPool": [
          "당일환불",
          "무료반품",
          "동네매장"
        ]
      },
      {
        "id": "tail-14-q-56",
        "coreWord": "정기구독취소",
        "word": "정기구독취소",
        "answer": "해지버튼, 다음달결제막기, 환불요청",
        "targetWords": [
          "해지버튼",
          "다음달결제막기",
          "환불요청"
        ],
        "distractorPool": [
          "평생무료",
          "자동연장",
          "강제가입"
        ]
      },
      {
        "id": "tail-14-q-57",
        "coreWord": "영수증잉크",
        "word": "영수증잉크",
        "answer": "열에약함, 시간이면지워짐, 사진찍어두기",
        "targetWords": [
          "열에약함",
          "시간이면지워짐",
          "사진찍어두기"
        ],
        "distractorPool": [
          "영원함",
          "물에강함",
          "쇠로만듬"
        ]
      },
      {
        "id": "tail-14-q-58",
        "coreWord": "옷수선",
        "word": "옷수선",
        "answer": "기장줄이기, 단추달기, 지퍼고치기",
        "targetWords": [
          "기장줄이기",
          "단추달기",
          "지퍼고치기"
        ],
        "distractorPool": [
          "환불하기",
          "새옷으로교환",
          "반품하기"
        ]
      },
      {
        "id": "tail-14-q-59",
        "coreWord": "진상대처",
        "word": "진상대처",
        "answer": "매뉴얼준수, 침착함유지, 관리자보고",
        "targetWords": [
          "매뉴얼준수",
          "침착함유지",
          "관리자보고"
        ],
        "distractorPool": [
          "같이싸우기",
          "욕하기",
          "때리기"
        ]
      },
      {
        "id": "tail-14-q-60",
        "coreWord": "정당한소비자",
        "word": "정당한소비자",
        "answer": "예의바름, 영수증지참, 정확한요구",
        "targetWords": [
          "예의바름",
          "영수증지참",
          "정확한요구"
        ],
        "distractorPool": [
          "억지",
          "무례함",
          "고집"
        ]
      }
    ]
  },
  {
    "id": "tail-15",
    "title": "초등 12",
    "schoolLevelLabel": "12",
    "bandLabel": "초등",
    "descriptor": "관계와규칙",
    "grammarFocus": "관계와규칙",
    "goalCopy": "관계와규칙 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 27,
    "questions": [
      {
        "id": "tail-15-q-01",
        "coreWord": "다툼해결",
        "word": "다툼해결",
        "answer": "사과, 화해, 용서",
        "targetWords": [
          "사과",
          "화해",
          "용서"
        ],
        "distractorPool": [
          "변명",
          "거짓말",
          "핑계"
        ]
      },
      {
        "id": "tail-15-q-02",
        "coreWord": "듣는태도",
        "word": "듣는태도",
        "answer": "경청, 귀기울임, 공감",
        "targetWords": [
          "경청",
          "귀기울임",
          "공감"
        ],
        "distractorPool": [
          "무시",
          "간섭",
          "하품"
        ]
      },
      {
        "id": "tail-15-q-03",
        "coreWord": "부탁하기",
        "word": "부탁하기",
        "answer": "허락, 동의, 양해",
        "targetWords": [
          "허락",
          "동의",
          "양해"
        ],
        "distractorPool": [
          "명령",
          "강요",
          "지시"
        ]
      },
      {
        "id": "tail-15-q-04",
        "coreWord": "지킬것",
        "word": "지킬것",
        "answer": "규칙, 질서, 규정",
        "targetWords": [
          "규칙",
          "질서",
          "규정"
        ],
        "distractorPool": [
          "자유",
          "방종",
          "무법"
        ]
      },
      {
        "id": "tail-15-q-05",
        "coreWord": "착한마음",
        "word": "착한마음",
        "answer": "배려, 양보, 친절",
        "targetWords": [
          "배려",
          "양보",
          "친절"
        ],
        "distractorPool": [
          "이기심",
          "욕심",
          "새치기"
        ]
      },
      {
        "id": "tail-15-q-06",
        "coreWord": "믿음",
        "word": "믿음",
        "answer": "신뢰, 정직, 솔직함",
        "targetWords": [
          "신뢰",
          "정직",
          "솔직함"
        ],
        "distractorPool": [
          "거짓말",
          "배신",
          "사기"
        ]
      },
      {
        "id": "tail-15-q-07",
        "coreWord": "의견모으기",
        "word": "의견모으기",
        "answer": "다수결, 투표, 합의",
        "targetWords": [
          "다수결",
          "투표",
          "합의"
        ],
        "distractorPool": [
          "독재",
          "폭력",
          "고집"
        ]
      },
      {
        "id": "tail-15-q-08",
        "coreWord": "힘합치기",
        "word": "힘합치기",
        "answer": "협동, 단합, 모둠활동",
        "targetWords": [
          "협동",
          "단합",
          "모둠활동"
        ],
        "distractorPool": [
          "분열",
          "싸움",
          "이기주의"
        ]
      },
      {
        "id": "tail-15-q-09",
        "coreWord": "좋은말",
        "word": "좋은말",
        "answer": "칭찬, 격려, 응원",
        "targetWords": [
          "칭찬",
          "격려",
          "응원"
        ],
        "distractorPool": [
          "비난",
          "흉보기",
          "욕설"
        ]
      },
      {
        "id": "tail-15-q-10",
        "coreWord": "내역할",
        "word": "내역할",
        "answer": "책임감, 마무리, 솔선수범",
        "targetWords": [
          "책임감",
          "마무리",
          "솔선수범"
        ],
        "distractorPool": [
          "회피",
          "포기",
          "떠넘기기"
        ]
      },
      {
        "id": "tail-15-q-11",
        "coreWord": "바른태도",
        "word": "바른태도",
        "answer": "예의, 인사, 존댓말",
        "targetWords": [
          "예의",
          "인사",
          "존댓말"
        ],
        "distractorPool": [
          "반말",
          "욕설",
          "무례함"
        ]
      },
      {
        "id": "tail-15-q-12",
        "coreWord": "성숙한행동",
        "word": "성숙한행동",
        "answer": "시민의식, 분리수거, 차례지키기",
        "targetWords": [
          "시민의식",
          "분리수거",
          "차례지키기"
        ],
        "distractorPool": [
          "무단투기",
          "무단횡단",
          "새치기"
        ]
      },
      {
        "id": "tail-15-q-13",
        "coreWord": "갈등해결",
        "word": "갈등해결",
        "answer": "타협, 대화, 합의점",
        "targetWords": [
          "타협",
          "대화",
          "합의점"
        ],
        "distractorPool": [
          "고집",
          "폭력",
          "단절"
        ]
      },
      {
        "id": "tail-15-q-14",
        "coreWord": "나쁜행동",
        "word": "나쁜행동",
        "answer": "폭력, 왕따, 괴롭힘",
        "targetWords": [
          "폭력",
          "왕따",
          "괴롭힘"
        ],
        "distractorPool": [
          "우정",
          "사랑",
          "배려"
        ]
      },
      {
        "id": "tail-15-q-15",
        "coreWord": "도덕성",
        "word": "도덕성",
        "answer": "양심, 정직, 죄책감",
        "targetWords": [
          "양심",
          "정직",
          "죄책감"
        ],
        "distractorPool": [
          "뻔뻔함",
          "거짓",
          "위선"
        ]
      },
      {
        "id": "tail-15-q-16",
        "coreWord": "사이버예절",
        "word": "사이버예절",
        "answer": "바른말쓰기, 악플안달기, 존중하기",
        "targetWords": [
          "바른말쓰기",
          "악플안달기",
          "존중하기"
        ],
        "distractorPool": [
          "욕설",
          "패드립",
          "신상털기"
        ]
      },
      {
        "id": "tail-15-q-17",
        "coreWord": "층간소음",
        "word": "층간소음",
        "answer": "사뿐히걷기, 매트깔기, 밤에조심하기",
        "targetWords": [
          "사뿐히걷기",
          "매트깔기",
          "밤에조심하기"
        ],
        "distractorPool": [
          "뛰어다니기",
          "피아노치기",
          "고성방가"
        ]
      },
      {
        "id": "tail-15-q-18",
        "coreWord": "식사예절",
        "word": "식사예절",
        "answer": "조용히먹기, 골고루먹기, 감사히먹기",
        "targetWords": [
          "조용히먹기",
          "골고루먹기",
          "감사히먹기"
        ],
        "distractorPool": [
          "돌아다니기",
          "편식하기",
          "소리내기"
        ]
      },
      {
        "id": "tail-15-q-19",
        "coreWord": "도서관예절",
        "word": "도서관예절",
        "answer": "속삭이기, 살금살금걷기, 책소중히다루기",
        "targetWords": [
          "속삭이기",
          "살금살금걷기",
          "책소중히다루기"
        ],
        "distractorPool": [
          "소리치기",
          "뛰어다니기",
          "책찢기"
        ]
      },
      {
        "id": "tail-15-q-20",
        "coreWord": "친구관계",
        "word": "친구관계",
        "answer": "우정, 의리, 단짝",
        "targetWords": [
          "우정",
          "의리",
          "단짝"
        ],
        "distractorPool": [
          "왕따",
          "절교",
          "싸움"
        ]
      },
      {
        "id": "tail-15-q-21",
        "coreWord": "대화예절",
        "word": "대화예절",
        "answer": "눈맞추기, 경청하기, 고개끄덕이기",
        "targetWords": [
          "눈맞추기",
          "경청하기",
          "고개끄덕이기"
        ],
        "distractorPool": [
          "딴청피우기",
          "스마트폰보기",
          "말끊기"
        ]
      },
      {
        "id": "tail-15-q-22",
        "coreWord": "학교폭력",
        "word": "학교폭력",
        "answer": "신체폭력, 언어폭력, 사이버괴롭힘",
        "targetWords": [
          "신체폭력",
          "언어폭력",
          "사이버괴롭힘"
        ],
        "distractorPool": [
          "칭찬하기",
          "도와주기",
          "위로하기"
        ]
      },
      {
        "id": "tail-15-q-23",
        "coreWord": "왕따문제",
        "word": "왕따문제",
        "answer": "따돌림, 은따, 소외시키기",
        "targetWords": [
          "따돌림",
          "은따",
          "소외시키기"
        ],
        "distractorPool": [
          "같이놀기",
          "초대하기",
          "친하게지내기"
        ]
      },
      {
        "id": "tail-15-q-24",
        "coreWord": "방관자",
        "word": "방관자",
        "answer": "모른척하기, 구경하기, 외면하기",
        "targetWords": [
          "모른척하기",
          "구경하기",
          "외면하기"
        ],
        "distractorPool": [
          "말리기",
          "선생님께알리기",
          "도와주기"
        ]
      },
      {
        "id": "tail-15-q-25",
        "coreWord": "방어자",
        "word": "방어자",
        "answer": "용기내기, 말려주기, 어른께알리기",
        "targetWords": [
          "용기내기",
          "말려주기",
          "어른께알리기"
        ],
        "distractorPool": [
          "같이때리기",
          "비웃기",
          "구경하기"
        ]
      },
      {
        "id": "tail-15-q-26",
        "coreWord": "화해하기",
        "word": "화해하기",
        "answer": "미안해, 내가잘못했어, 다시친하게지내자",
        "targetWords": [
          "미안해",
          "내가잘못했어",
          "다시친하게지내자"
        ],
        "distractorPool": [
          "절교야",
          "다시는보지마",
          "꼴도보기싫어"
        ]
      },
      {
        "id": "tail-15-q-27",
        "coreWord": "다문화이해",
        "word": "다문화이해",
        "answer": "편견버리기, 차이존중하기, 평등하게대하기",
        "targetWords": [
          "편견버리기",
          "차이존중하기",
          "평등하게대하기"
        ],
        "distractorPool": [
          "차별하기",
          "놀리기",
          "무시하기"
        ]
      },
      {
        "id": "tail-15-q-28",
        "coreWord": "장애인배려",
        "word": "장애인배려",
        "answer": "휠체어양보, 문잡아주기, 친절하게대하기",
        "targetWords": [
          "휠체어양보",
          "문잡아주기",
          "친절하게대하기"
        ],
        "distractorPool": [
          "쳐다보기",
          "놀리기",
          "흉내내기"
        ]
      },
      {
        "id": "tail-15-q-29",
        "coreWord": "대중교통예절",
        "word": "대중교통예절",
        "answer": "자리양보, 조용히하기, 백팩앞으로메기",
        "targetWords": [
          "자리양보",
          "조용히하기",
          "백팩앞으로메기"
        ],
        "distractorPool": [
          "큰소리통화",
          "다리벌리고앉기",
          "뛰어다니기"
        ]
      },
      {
        "id": "tail-15-q-30",
        "coreWord": "공공장소",
        "word": "공공장소",
        "answer": "도서관, 박물관, 미술관",
        "targetWords": [
          "도서관",
          "박물관",
          "미술관"
        ],
        "distractorPool": [
          "내방",
          "우리집",
          "내침대"
        ]
      },
      {
        "id": "tail-15-q-31",
        "coreWord": "영화관예절",
        "word": "영화관예절",
        "answer": "앞좌석안차기, 휴대폰끄기, 조용히하기",
        "targetWords": [
          "앞좌석안차기",
          "휴대폰끄기",
          "조용히하기"
        ],
        "distractorPool": [
          "스크린찍기",
          "떠들기",
          "전화받기"
        ]
      },
      {
        "id": "tail-15-q-32",
        "coreWord": "자연보호",
        "word": "자연보호",
        "answer": "쓰레기되가져가기, 분리수거, 식물안꺾기",
        "targetWords": [
          "쓰레기되가져가기",
          "분리수거",
          "식물안꺾기"
        ],
        "distractorPool": [
          "쓰레기버리기",
          "나무베기",
          "꽃꺾기"
        ]
      },
      {
        "id": "tail-15-q-33",
        "coreWord": "동물보호",
        "word": "동물보호",
        "answer": "생명존중, 유기견보호, 길고양이배려",
        "targetWords": [
          "생명존중",
          "유기견보호",
          "길고양이배려"
        ],
        "distractorPool": [
          "돌던지기",
          "괴롭히기",
          "버리기"
        ]
      },
      {
        "id": "tail-15-q-34",
        "coreWord": "험담",
        "word": "험담",
        "answer": "뒷담화, 단점말하기, 나쁜소문퍼뜨리기",
        "targetWords": [
          "뒷담화",
          "단점말하기",
          "나쁜소문퍼뜨리기"
        ],
        "distractorPool": [
          "칭찬하기",
          "장점찾기",
          "응원하기"
        ]
      },
      {
        "id": "tail-15-q-35",
        "coreWord": "바른말쓰기",
        "word": "바른말쓰기",
        "answer": "존댓말, 고운말, 칭찬하는말",
        "targetWords": [
          "존댓말",
          "고운말",
          "칭찬하는말"
        ],
        "distractorPool": [
          "욕설",
          "패드립",
          "은어"
        ]
      },
      {
        "id": "tail-15-q-36",
        "coreWord": "약속지키기",
        "word": "약속지키기",
        "answer": "시간맞추기, 수첩에적기, 늦지않기",
        "targetWords": [
          "시간맞추기",
          "수첩에적기",
          "늦지않기"
        ],
        "distractorPool": [
          "지각하기",
          "까먹기",
          "어기기"
        ]
      },
      {
        "id": "tail-15-q-37",
        "coreWord": "식당예절",
        "word": "식당예절",
        "answer": "자리에앉기, 조용히말하기, 흘리지않기",
        "targetWords": [
          "자리에앉기",
          "조용히말하기",
          "흘리지않기"
        ],
        "distractorPool": [
          "뛰어다니기",
          "소리지르기",
          "음식던지기"
        ]
      },
      {
        "id": "tail-15-q-38",
        "coreWord": "질서지키기",
        "word": "질서지키기",
        "answer": "한줄서기, 차례기다리기, 새치기안하기",
        "targetWords": [
          "한줄서기",
          "차례기다리기",
          "새치기안하기"
        ],
        "distractorPool": [
          "밀치기",
          "끼어들기",
          "먼저가기"
        ]
      },
      {
        "id": "tail-15-q-39",
        "coreWord": "공원예절",
        "word": "공원예절",
        "answer": "잔디밭보호, 애완견목줄, 배변봉투챙기기",
        "targetWords": [
          "잔디밭보호",
          "애완견목줄",
          "배변봉투챙기기"
        ],
        "distractorPool": [
          "쓰레기버리기",
          "고성방가",
          "꽃꺾기"
        ]
      },
      {
        "id": "tail-15-q-40",
        "coreWord": "이웃배려",
        "word": "이웃배려",
        "answer": "인사하기, 층간소음조심, 엘리베이터잡아주기",
        "targetWords": [
          "인사하기",
          "층간소음조심",
          "엘리베이터잡아주기"
        ],
        "distractorPool": [
          "문쾅닫기",
          "밤에피아노치기",
          "쓰레기투기"
        ]
      },
      {
        "id": "tail-15-q-41",
        "coreWord": "사이버폭력",
        "word": "사이버폭력",
        "answer": "단톡방괴롭힘, 악플, 허위사실유포",
        "targetWords": [
          "단톡방괴롭힘",
          "악플",
          "허위사실유포"
        ],
        "distractorPool": [
          "선플",
          "응원댓글",
          "정보공유"
        ]
      },
      {
        "id": "tail-15-q-42",
        "coreWord": "온라인예절",
        "word": "온라인예절",
        "answer": "실명처럼행동, 네티켓, 이모티콘인사",
        "targetWords": [
          "실명처럼행동",
          "네티켓",
          "이모티콘인사"
        ],
        "distractorPool": [
          "욕설",
          "도배",
          "혐오표현"
        ]
      },
      {
        "id": "tail-15-q-43",
        "coreWord": "저작권존중",
        "word": "저작권존중",
        "answer": "불법다운안하기, 출처밝히기, 허락받기",
        "targetWords": [
          "불법다운안하기",
          "출처밝히기",
          "허락받기"
        ],
        "distractorPool": [
          "무단복제",
          "불법공유",
          "표절"
        ]
      },
      {
        "id": "tail-15-q-44",
        "coreWord": "양성평등",
        "word": "양성평등",
        "answer": "성차별금지, 남자여자똑같이, 능력으로평가",
        "targetWords": [
          "성차별금지",
          "남자여자똑같이",
          "능력으로평가"
        ],
        "distractorPool": [
          "여자는약해",
          "남자는울면안돼",
          "성별나누기"
        ]
      },
      {
        "id": "tail-15-q-45",
        "coreWord": "노약자배려",
        "word": "노약자배려",
        "answer": "할머니도와주기, 무거운짐들어주기, 자리양보하기",
        "targetWords": [
          "할머니도와주기",
          "무거운짐들어주기",
          "자리양보하기"
        ],
        "distractorPool": [
          "모른척하기",
          "먼저타기",
          "밀치기"
        ]
      },
      {
        "id": "tail-15-q-46",
        "coreWord": "임산부배려",
        "word": "임산부배려",
        "answer": "핑크색좌석비워두기, 양보하기, 짐들어주기",
        "targetWords": [
          "핑크색좌석비워두기",
          "양보하기",
          "짐들어주기"
        ],
        "distractorPool": [
          "임산부석차지",
          "모른척",
          "스마트폰만보기"
        ]
      },
      {
        "id": "tail-15-q-47",
        "coreWord": "리더십",
        "word": "리더십",
        "answer": "솔선수범, 책임감, 배려",
        "targetWords": [
          "솔선수범",
          "책임감",
          "배려"
        ],
        "distractorPool": [
          "권위주의",
          "이기심",
          "독재"
        ]
      },
      {
        "id": "tail-15-q-48",
        "coreWord": "조별과제",
        "word": "조별과제",
        "answer": "역할분담, 기한지키기, 협동하기",
        "targetWords": [
          "역할분담",
          "기한지키기",
          "협동하기"
        ],
        "distractorPool": [
          "무임승차",
          "남에게떠넘기기",
          "연락두절"
        ]
      },
      {
        "id": "tail-15-q-49",
        "coreWord": "갈등조정",
        "word": "갈등조정",
        "answer": "대화하기, 양보하기, 타협하기",
        "targetWords": [
          "대화하기",
          "양보하기",
          "타협하기"
        ],
        "distractorPool": [
          "고집부리기",
          "주먹다짐",
          "절교하기"
        ]
      },
      {
        "id": "tail-15-q-50",
        "coreWord": "규칙의필요성",
        "word": "규칙의필요성",
        "answer": "안전, 평화, 질서유지",
        "targetWords": [
          "안전",
          "평화",
          "질서유지"
        ],
        "distractorPool": [
          "혼란",
          "사고",
          "싸움"
        ]
      },
      {
        "id": "tail-15-q-51",
        "coreWord": "법",
        "word": "법",
        "answer": "헌법, 형법, 도로교통법",
        "targetWords": [
          "헌법",
          "형법",
          "도로교통법"
        ],
        "distractorPool": [
          "교칙",
          "동아리회칙",
          "우리집약속"
        ]
      },
      {
        "id": "tail-15-q-52",
        "coreWord": "정직",
        "word": "정직",
        "answer": "진실말하기, 지갑주워주기, 잘못인정하기",
        "targetWords": [
          "진실말하기",
          "지갑주워주기",
          "잘못인정하기"
        ],
        "distractorPool": [
          "거짓말",
          "컨닝",
          "훔치기"
        ]
      },
      {
        "id": "tail-15-q-53",
        "coreWord": "용기",
        "word": "용기",
        "answer": "잘못고백하기, 약자도와주기, 나쁜일거절하기",
        "targetWords": [
          "잘못고백하기",
          "약자도와주기",
          "나쁜일거절하기"
        ],
        "distractorPool": [
          "방관하기",
          "도망치기",
          "같이괴롭히기"
        ]
      },
      {
        "id": "tail-15-q-54",
        "coreWord": "참을성",
        "word": "참을성",
        "answer": "화가나도참기, 순서기다리기, 끝까지하기",
        "targetWords": [
          "화가나도참기",
          "순서기다리기",
          "끝까지하기"
        ],
        "distractorPool": [
          "분노폭발",
          "새치기",
          "포기하기"
        ]
      },
      {
        "id": "tail-15-q-55",
        "coreWord": "자제력",
        "word": "자제력",
        "answer": "스마트폰그만하기, 게임끄기, 충동억제",
        "targetWords": [
          "스마트폰그만하기",
          "게임끄기",
          "충동억제"
        ],
        "distractorPool": [
          "밤새게임하기",
          "떼쓰기",
          "다사달라고하기"
        ]
      },
      {
        "id": "tail-15-q-56",
        "coreWord": "감사하는마음",
        "word": "감사하는마음",
        "answer": "고맙습니다, 은혜, 보답",
        "targetWords": [
          "고맙습니다",
          "은혜",
          "보답"
        ],
        "distractorPool": [
          "당연하게여기기",
          "불평하기",
          "짜증내기"
        ]
      },
      {
        "id": "tail-15-q-57",
        "coreWord": "부모님은혜",
        "word": "부모님은혜",
        "answer": "효도, 감사, 존경",
        "targetWords": [
          "효도",
          "감사",
          "존경"
        ],
        "distractorPool": [
          "불효",
          "짜증",
          "대들기"
        ]
      },
      {
        "id": "tail-15-q-58",
        "coreWord": "선생님존경",
        "word": "선생님존경",
        "answer": "가르침감사, 바른인사, 수업집중",
        "targetWords": [
          "가르침감사",
          "바른인사",
          "수업집중"
        ],
        "distractorPool": [
          "반항",
          "무시",
          "딴짓"
        ]
      },
      {
        "id": "tail-15-q-59",
        "coreWord": "공중도덕",
        "word": "공중도덕",
        "answer": "화장실깨끗이쓰기, 침안뱉기, 낙서안하기",
        "targetWords": [
          "화장실깨끗이쓰기",
          "침안뱉기",
          "낙서안하기"
        ],
        "distractorPool": [
          "세면대더럽히기",
          "껌뱉기",
          "벽에그리기"
        ]
      },
      {
        "id": "tail-15-q-60",
        "coreWord": "민주시민",
        "word": "민주시민",
        "answer": "투표참여, 법지키기, 사회관심",
        "targetWords": [
          "투표참여",
          "법지키기",
          "사회관심"
        ],
        "distractorPool": [
          "무관심",
          "이기주의",
          "불법행위"
        ]
      }
    ]
  },
  {
    "id": "tail-16",
    "title": "초등 13",
    "schoolLevelLabel": "13",
    "bandLabel": "초등",
    "descriptor": "추상과관용",
    "grammarFocus": "추상과관용",
    "goalCopy": "추상과관용 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 26,
    "questions": [
      {
        "id": "tail-16-q-01",
        "coreWord": "뿌듯함",
        "word": "뿌듯함",
        "answer": "보람, 성취감, 자랑스러움",
        "targetWords": [
          "보람",
          "성취감",
          "자랑스러움"
        ],
        "distractorPool": [
          "허탈함",
          "좌절감",
          "씁쓸함"
        ]
      },
      {
        "id": "tail-16-q-02",
        "coreWord": "끝맺음",
        "word": "끝맺음",
        "answer": "결론, 결과, 마무리",
        "targetWords": [
          "결론",
          "결과",
          "마무리"
        ],
        "distractorPool": [
          "원인",
          "시작",
          "출발"
        ]
      },
      {
        "id": "tail-16-q-03",
        "coreWord": "꾸준함",
        "word": "꾸준함",
        "answer": "티끌모아태산, 저축, 절약",
        "targetWords": [
          "티끌모아태산",
          "저축",
          "절약"
        ],
        "distractorPool": [
          "낭비",
          "과소비",
          "탕진"
        ]
      },
      {
        "id": "tail-16-q-04",
        "coreWord": "좁은생각",
        "word": "좁은생각",
        "answer": "우물안개구리, 편견, 고집",
        "targetWords": [
          "우물안개구리",
          "편견",
          "고집"
        ],
        "distractorPool": [
          "넓은세상",
          "지혜",
          "깨달음"
        ]
      },
      {
        "id": "tail-16-q-05",
        "coreWord": "힘합치기",
        "word": "힘합치기",
        "answer": "백지장도맞들면낫다, 협동, 도움",
        "targetWords": [
          "백지장도맞들면낫다",
          "협동",
          "도움"
        ],
        "distractorPool": [
          "분열",
          "경쟁",
          "이기주의"
        ]
      },
      {
        "id": "tail-16-q-06",
        "coreWord": "실수",
        "word": "실수",
        "answer": "등잔밑이어둡다, 착각, 깜빡함",
        "targetWords": [
          "등잔밑이어둡다",
          "착각",
          "깜빡함"
        ],
        "distractorPool": [
          "완벽함",
          "성공",
          "정답"
        ]
      },
      {
        "id": "tail-16-q-07",
        "coreWord": "앞이캄캄",
        "word": "앞이캄캄",
        "answer": "막막함, 절망, 좌절",
        "targetWords": [
          "막막함",
          "절망",
          "좌절"
        ],
        "distractorPool": [
          "희망",
          "기대",
          "즐거움"
        ]
      },
      {
        "id": "tail-16-q-08",
        "coreWord": "욕심쟁이",
        "word": "욕심쟁이",
        "answer": "이기적, 자기중심, 독단",
        "targetWords": [
          "이기적",
          "자기중심",
          "독단"
        ],
        "distractorPool": [
          "이타적",
          "배려",
          "양보"
        ]
      },
      {
        "id": "tail-16-q-09",
        "coreWord": "입장바꾸기",
        "word": "입장바꾸기",
        "answer": "역지사지, 공감, 이해",
        "targetWords": [
          "역지사지",
          "공감",
          "이해"
        ],
        "distractorPool": [
          "무시",
          "이기주의",
          "편견"
        ]
      },
      {
        "id": "tail-16-q-10",
        "coreWord": "겉과속이다름",
        "word": "겉과속이다름",
        "answer": "위선, 거짓, 가식",
        "targetWords": [
          "위선",
          "거짓",
          "가식"
        ],
        "distractorPool": [
          "진실",
          "솔직",
          "정직"
        ]
      },
      {
        "id": "tail-16-q-11",
        "coreWord": "포기안함",
        "word": "포기안함",
        "answer": "집념, 끈기, 노력",
        "targetWords": [
          "집념",
          "끈기",
          "노력"
        ],
        "distractorPool": [
          "게으름",
          "포기",
          "나태"
        ]
      },
      {
        "id": "tail-16-q-12",
        "coreWord": "속임수",
        "word": "속임수",
        "answer": "조작, 거짓말, 은폐",
        "targetWords": [
          "조작",
          "거짓말",
          "은폐"
        ],
        "distractorPool": [
          "진실",
          "솔직함",
          "폭로"
        ]
      },
      {
        "id": "tail-16-q-13",
        "coreWord": "마음나누기",
        "word": "마음나누기",
        "answer": "공감, 위로, 끄덕임",
        "targetWords": [
          "공감",
          "위로",
          "끄덕임"
        ],
        "distractorPool": [
          "무시",
          "비웃음",
          "외면"
        ]
      },
      {
        "id": "tail-16-q-14",
        "coreWord": "자신을낮춤",
        "word": "자신을낮춤",
        "answer": "겸손, 배려, 벼이삭",
        "targetWords": [
          "겸손",
          "배려",
          "벼이삭"
        ],
        "distractorPool": [
          "거만",
          "오만",
          "자랑"
        ]
      },
      {
        "id": "tail-16-q-15",
        "coreWord": "홀로서기",
        "word": "홀로서기",
        "answer": "자립심, 독립, 스스로",
        "targetWords": [
          "자립심",
          "독립",
          "스스로"
        ],
        "distractorPool": [
          "의존",
          "나약함",
          "기대기"
        ]
      },
      {
        "id": "tail-16-q-16",
        "coreWord": "말조심",
        "word": "말조심",
        "answer": "가는말이고와야오는말이곱다, 발없는말이천리가간다, 낮말은새가듣고밤말은쥐가듣는다",
        "targetWords": [
          "가는말이고와야오는말이곱다",
          "발없는말이천리가간다",
          "낮말은새가듣고밤말은쥐가듣는다"
        ],
        "distractorPool": [
          "소잃고외양간고친다",
          "누워서침뱉기",
          "티끌모아태산"
        ]
      },
      {
        "id": "tail-16-q-17",
        "coreWord": "후회",
        "word": "후회",
        "answer": "소잃고외양간고친다, 뉘우침, 아쉬움",
        "targetWords": [
          "소잃고외양간고친다",
          "뉘우침",
          "아쉬움"
        ],
        "distractorPool": [
          "기대감",
          "설렘",
          "환희"
        ]
      },
      {
        "id": "tail-16-q-18",
        "coreWord": "어려운상황",
        "word": "어려운상황",
        "answer": "고래싸움에새우등터진다, 산넘어산, 설상가상",
        "targetWords": [
          "고래싸움에새우등터진다",
          "산넘어산",
          "설상가상"
        ],
        "distractorPool": [
          "일석이조",
          "꿩먹고알먹고",
          "일거양득"
        ]
      },
      {
        "id": "tail-16-q-19",
        "coreWord": "노력",
        "word": "노력",
        "answer": "공든탑이무너지랴, 칠전팔기, 인내",
        "targetWords": [
          "공든탑이무너지랴",
          "칠전팔기",
          "인내"
        ],
        "distractorPool": [
          "포기",
          "좌절",
          "나태"
        ]
      },
      {
        "id": "tail-16-q-20",
        "coreWord": "긍정적생각",
        "word": "긍정적생각",
        "answer": "희망, 낙관, 긍정",
        "targetWords": [
          "희망",
          "낙관",
          "긍정"
        ],
        "distractorPool": [
          "절망",
          "비관",
          "우울"
        ]
      },
      {
        "id": "tail-16-q-21",
        "coreWord": "시간관련속담",
        "word": "시간관련속담",
        "answer": "세월이유수같다, 십년이면강산도변한다, 세월이약이다",
        "targetWords": [
          "세월이유수같다",
          "십년이면강산도변한다",
          "세월이약이다"
        ],
        "distractorPool": [
          "티끌모아태산",
          "누워서침뱉기",
          "사공이많으면배가산으로간다"
        ]
      },
      {
        "id": "tail-16-q-22",
        "coreWord": "말조심속담",
        "word": "말조심속담",
        "answer": "발없는말이천리가간다, 가는말이고와야오는말이곱다, 낮말은새가듣고밤말은쥐가듣는다",
        "targetWords": [
          "발없는말이천리가간다",
          "가는말이고와야오는말이곱다",
          "낮말은새가듣고밤말은쥐가듣는다"
        ],
        "distractorPool": [
          "개구리올챙이적생각못한다",
          "우물안개구리",
          "도둑이제발저린다"
        ]
      },
      {
        "id": "tail-16-q-23",
        "coreWord": "노력관련속담",
        "word": "노력관련속담",
        "answer": "공든탑이무너지랴, 우물을파도한우물을파라, 천리길도한걸음부터",
        "targetWords": [
          "공든탑이무너지랴",
          "우물을파도한우물을파라",
          "천리길도한걸음부터"
        ],
        "distractorPool": [
          "밑빠진독에물붓기",
          "소잃고외양간고친다",
          "벼룩도낯짝이있다"
        ]
      },
      {
        "id": "tail-16-q-24",
        "coreWord": "협동관련속담",
        "word": "협동관련속담",
        "answer": "백지장도맞들면낫다, 뭉치면살고흩어지면죽는다, 십시일반",
        "targetWords": [
          "백지장도맞들면낫다",
          "뭉치면살고흩어지면죽는다",
          "십시일반"
        ],
        "distractorPool": [
          "사공이많으면배가산으로간다",
          "오합지졸",
          "독불장군"
        ]
      },
      {
        "id": "tail-16-q-25",
        "coreWord": "어리석음속담",
        "word": "어리석음속담",
        "answer": "우물안개구리, 소잃고외양간고친다, 밑빠진독에물붓기",
        "targetWords": [
          "우물안개구리",
          "소잃고외양간고친다",
          "밑빠진독에물붓기"
        ],
        "distractorPool": [
          "지혜로운솔로몬",
          "등잔밑이밝다",
          "천리길도한걸음"
        ]
      },
      {
        "id": "tail-16-q-26",
        "coreWord": "좋은사자성어",
        "word": "좋은사자성어",
        "answer": "일석이조, 꿩먹고알먹고, 일거양득",
        "targetWords": [
          "일석이조",
          "꿩먹고알먹고",
          "일거양득"
        ],
        "distractorPool": [
          "설상가상",
          "엎친데덮친격",
          "사면초가"
        ]
      },
      {
        "id": "tail-16-q-27",
        "coreWord": "나쁜상황성어",
        "word": "나쁜상황성어",
        "answer": "설상가상, 사면초가, 진퇴양난",
        "targetWords": [
          "설상가상",
          "사면초가",
          "진퇴양난"
        ],
        "distractorPool": [
          "금상첨화",
          "일석이조",
          "새옹지마"
        ]
      },
      {
        "id": "tail-16-q-28",
        "coreWord": "비슷한상황",
        "word": "비슷한상황",
        "answer": "유유상종, 가재는게편, 초록은동색",
        "targetWords": [
          "유유상종",
          "가재는게편",
          "초록은동색"
        ],
        "distractorPool": [
          "군계일학",
          "독불장군",
          "일당백"
        ]
      },
      {
        "id": "tail-16-q-29",
        "coreWord": "겉과속이다름",
        "word": "겉과속이다름",
        "answer": "표리부동, 양두구육, 면종복배",
        "targetWords": [
          "표리부동",
          "양두구육",
          "면종복배"
        ],
        "distractorPool": [
          "일편단심",
          "지조",
          "절개"
        ]
      },
      {
        "id": "tail-16-q-30",
        "coreWord": "굳은의지",
        "word": "굳은의지",
        "answer": "일편단심, 칠전팔기, 백절불굴",
        "targetWords": [
          "일편단심",
          "칠전팔기",
          "백절불굴"
        ],
        "distractorPool": [
          "작심삼일",
          "포기",
          "변덕"
        ]
      },
      {
        "id": "tail-16-q-31",
        "coreWord": "행복",
        "word": "행복",
        "answer": "즐거움, 기쁨, 평안함",
        "targetWords": [
          "즐거움",
          "기쁨",
          "평안함"
        ],
        "distractorPool": [
          "불행",
          "고통",
          "절망"
        ]
      },
      {
        "id": "tail-16-q-32",
        "coreWord": "불행",
        "word": "불행",
        "answer": "슬픔, 좌절, 고난",
        "targetWords": [
          "슬픔",
          "좌절",
          "고난"
        ],
        "distractorPool": [
          "행복",
          "기쁨",
          "환희"
        ]
      },
      {
        "id": "tail-16-q-33",
        "coreWord": "희망",
        "word": "희망",
        "answer": "기대, 꿈, 긍정",
        "targetWords": [
          "기대",
          "꿈",
          "긍정"
        ],
        "distractorPool": [
          "절망",
          "포기",
          "비관"
        ]
      },
      {
        "id": "tail-16-q-34",
        "coreWord": "절망",
        "word": "절망",
        "answer": "좌절, 낙담, 비관",
        "targetWords": [
          "좌절",
          "낙담",
          "비관"
        ],
        "distractorPool": [
          "희망",
          "기대",
          "긍정"
        ]
      },
      {
        "id": "tail-16-q-35",
        "coreWord": "사랑",
        "word": "사랑",
        "answer": "애정, 아낌, 소중함",
        "targetWords": [
          "애정",
          "아낌",
          "소중함"
        ],
        "distractorPool": [
          "미움",
          "증오",
          "혐오"
        ]
      },
      {
        "id": "tail-16-q-36",
        "coreWord": "증오",
        "word": "증오",
        "answer": "미움, 혐오, 원망",
        "targetWords": [
          "미움",
          "혐오",
          "원망"
        ],
        "distractorPool": [
          "사랑",
          "애정",
          "용서"
        ]
      },
      {
        "id": "tail-16-q-37",
        "coreWord": "평화",
        "word": "평화",
        "answer": "화합, 공존, 안면",
        "targetWords": [
          "화합",
          "공존",
          "안면"
        ],
        "distractorPool": [
          "전쟁",
          "갈등",
          "파괴"
        ]
      },
      {
        "id": "tail-16-q-38",
        "coreWord": "전쟁",
        "word": "전쟁",
        "answer": "파괴, 갈등, 폭력",
        "targetWords": [
          "파괴",
          "갈등",
          "폭력"
        ],
        "distractorPool": [
          "평화",
          "안식",
          "화합"
        ]
      },
      {
        "id": "tail-16-q-39",
        "coreWord": "자유",
        "word": "자유",
        "answer": "해방, 내마음대로, 속박없음",
        "targetWords": [
          "해방",
          "내마음대로",
          "속박없음"
        ],
        "distractorPool": [
          "구속",
          "억압",
          "통제"
        ]
      },
      {
        "id": "tail-16-q-40",
        "coreWord": "구속",
        "word": "구속",
        "answer": "억압, 통제, 감금",
        "targetWords": [
          "억압",
          "통제",
          "감금"
        ],
        "distractorPool": [
          "자유",
          "해방",
          "독립"
        ]
      },
      {
        "id": "tail-16-q-41",
        "coreWord": "평등",
        "word": "평등",
        "answer": "차별없음, 공평함, 동등함",
        "targetWords": [
          "차별없음",
          "공평함",
          "동등함"
        ],
        "distractorPool": [
          "차별",
          "불평등",
          "편견"
        ]
      },
      {
        "id": "tail-16-q-42",
        "coreWord": "차별",
        "word": "차별",
        "answer": "편견, 선입견, 불공평",
        "targetWords": [
          "편견",
          "선입견",
          "불공평"
        ],
        "distractorPool": [
          "평등",
          "공정",
          "존중"
        ]
      },
      {
        "id": "tail-16-q-43",
        "coreWord": "정의",
        "word": "정의",
        "answer": "올바름, 공정함, 진실",
        "targetWords": [
          "올바름",
          "공정함",
          "진실"
        ],
        "distractorPool": [
          "불의",
          "비리",
          "거짓"
        ]
      },
      {
        "id": "tail-16-q-44",
        "coreWord": "불의",
        "word": "불의",
        "answer": "부패, 비리, 거짓",
        "targetWords": [
          "부패",
          "비리",
          "거짓"
        ],
        "distractorPool": [
          "정의",
          "진실",
          "공정"
        ]
      },
      {
        "id": "tail-16-q-45",
        "coreWord": "지혜",
        "word": "지혜",
        "answer": "슬기로움, 현명함, 깨달음",
        "targetWords": [
          "슬기로움",
          "현명함",
          "깨달음"
        ],
        "distractorPool": [
          "어리석음",
          "무지",
          "멍청함"
        ]
      },
      {
        "id": "tail-16-q-46",
        "coreWord": "어리석음",
        "word": "어리석음",
        "answer": "무지, 바보같음, 미련함",
        "targetWords": [
          "무지",
          "바보같음",
          "미련함"
        ],
        "distractorPool": [
          "지혜",
          "슬기",
          "총명함"
        ]
      },
      {
        "id": "tail-16-q-47",
        "coreWord": "용기",
        "word": "용기",
        "answer": "씩씩함, 담대함, 두려움극복",
        "targetWords": [
          "씩씩함",
          "담대함",
          "두려움극복"
        ],
        "distractorPool": [
          "비겁함",
          "비열함",
          "도망침"
        ]
      },
      {
        "id": "tail-16-q-48",
        "coreWord": "비겁함",
        "word": "비겁함",
        "answer": "비열함, 치사함, 도망침",
        "targetWords": [
          "비열함",
          "치사함",
          "도망침"
        ],
        "distractorPool": [
          "용기",
          "당당함",
          "맞섬"
        ]
      },
      {
        "id": "tail-16-q-49",
        "coreWord": "책임감",
        "word": "책임감",
        "answer": "내역할다하기, 끝까지하기, 믿음직함",
        "targetWords": [
          "내역할다하기",
          "끝까지하기",
          "믿음직함"
        ],
        "distractorPool": [
          "무책임",
          "회피",
          "도망"
        ]
      },
      {
        "id": "tail-16-q-50",
        "coreWord": "무책임",
        "word": "무책임",
        "answer": "떠넘기기, 회피하기, 모른척하기",
        "targetWords": [
          "떠넘기기",
          "회피하기",
          "모른척하기"
        ],
        "distractorPool": [
          "책임감",
          "성실함",
          "솔선수범"
        ]
      },
      {
        "id": "tail-16-q-51",
        "coreWord": "이타심",
        "word": "이타심",
        "answer": "남을위함, 배려, 희생",
        "targetWords": [
          "남을위함",
          "배려",
          "희생"
        ],
        "distractorPool": [
          "이기심",
          "내욕심",
          "나만생각함"
        ]
      },
      {
        "id": "tail-16-q-52",
        "coreWord": "이기심",
        "word": "이기심",
        "answer": "내욕심, 욕심쟁이, 자기중심적",
        "targetWords": [
          "내욕심",
          "욕심쟁이",
          "자기중심적"
        ],
        "distractorPool": [
          "이타심",
          "배려",
          "양보"
        ]
      },
      {
        "id": "tail-16-q-53",
        "coreWord": "낙관",
        "word": "낙관",
        "answer": "긍정, 잘될거야, 희망",
        "targetWords": [
          "긍정",
          "잘될거야",
          "희망"
        ],
        "distractorPool": [
          "비관",
          "안될거야",
          "절망"
        ]
      },
      {
        "id": "tail-16-q-54",
        "coreWord": "비관",
        "word": "비관",
        "answer": "부정, 안될거야, 절망",
        "targetWords": [
          "부정",
          "안될거야",
          "절망"
        ],
        "distractorPool": [
          "낙관",
          "긍정",
          "희망"
        ]
      },
      {
        "id": "tail-16-q-55",
        "coreWord": "자존감",
        "word": "자존감",
        "answer": "나를사랑함, 당당함, 자신감",
        "targetWords": [
          "나를사랑함",
          "당당함",
          "자신감"
        ],
        "distractorPool": [
          "열등감",
          "우울함",
          "주눅듦"
        ]
      },
      {
        "id": "tail-16-q-56",
        "coreWord": "열등감",
        "word": "열등감",
        "answer": "부러움, 비교하기, 주눅듦",
        "targetWords": [
          "부러움",
          "비교하기",
          "주눅듦"
        ],
        "distractorPool": [
          "자존감",
          "자신감",
          "당당함"
        ]
      },
      {
        "id": "tail-16-q-57",
        "coreWord": "인내",
        "word": "인내",
        "answer": "참음, 견딤, 기다림",
        "targetWords": [
          "참음",
          "견딤",
          "기다림"
        ],
        "distractorPool": [
          "포기",
          "짜증",
          "분노폭발"
        ]
      },
      {
        "id": "tail-16-q-58",
        "coreWord": "유연함",
        "word": "유연함",
        "answer": "융통성, 상황에맞춤, 부드러움",
        "targetWords": [
          "융통성",
          "상황에맞춤",
          "부드러움"
        ],
        "distractorPool": [
          "고집",
          "융통성없음",
          "꽉막힘"
        ]
      },
      {
        "id": "tail-16-q-59",
        "coreWord": "고집",
        "word": "고집",
        "answer": "아집, 내말만맞음, 꽉막힘",
        "targetWords": [
          "아집",
          "내말만맞음",
          "꽉막힘"
        ],
        "distractorPool": [
          "유연함",
          "융통성",
          "타협"
        ]
      },
      {
        "id": "tail-16-q-60",
        "coreWord": "우정",
        "word": "우정",
        "answer": "친구관계, 의리, 단짝",
        "targetWords": [
          "친구관계",
          "의리",
          "단짝"
        ],
        "distractorPool": [
          "원수",
          "절교",
          "배신"
        ]
      }
    ]
  },
  {
    "id": "tail-17",
    "title": "초등 14",
    "schoolLevelLabel": "14",
    "bandLabel": "초등",
    "descriptor": "대중교통과이동",
    "grammarFocus": "대중교통과이동",
    "goalCopy": "대중교통과이동 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 26,
    "questions": [
      {
        "id": "tail-17-q-01",
        "coreWord": "승차요금",
        "word": "승차요금",
        "answer": "교통카드, 단말기, 환승",
        "targetWords": [
          "교통카드",
          "단말기",
          "환승"
        ],
        "distractorPool": [
          "우표",
          "편지",
          "택배"
        ]
      },
      {
        "id": "tail-17-q-02",
        "coreWord": "시내이동",
        "word": "시내이동",
        "answer": "버스, 정류장, 하차벨",
        "targetWords": [
          "버스",
          "정류장",
          "하차벨"
        ],
        "distractorPool": [
          "활주로",
          "항구",
          "선착장"
        ]
      },
      {
        "id": "tail-17-q-03",
        "coreWord": "땅속열차",
        "word": "땅속열차",
        "answer": "지하철, 개찰구, 스크린도어",
        "targetWords": [
          "지하철",
          "개찰구",
          "스크린도어"
        ],
        "distractorPool": [
          "신호등",
          "횡단보도",
          "과속방지턱"
        ]
      },
      {
        "id": "tail-17-q-04",
        "coreWord": "먼곳이동",
        "word": "먼곳이동",
        "answer": "기차, 승차권, 케이티엑스",
        "targetWords": [
          "기차",
          "승차권",
          "케이티엑스"
        ],
        "distractorPool": [
          "비행기",
          "헬리콥터",
          "잠수함"
        ]
      },
      {
        "id": "tail-17-q-05",
        "coreWord": "해외여행",
        "word": "해외여행",
        "answer": "비행기, 공항, 여권",
        "targetWords": [
          "비행기",
          "공항",
          "여권"
        ],
        "distractorPool": [
          "지하철역",
          "버스터미널",
          "기차역"
        ]
      },
      {
        "id": "tail-17-q-06",
        "coreWord": "바다이동",
        "word": "바다이동",
        "answer": "배, 항구, 여객선",
        "targetWords": [
          "배",
          "항구",
          "여객선"
        ],
        "distractorPool": [
          "도로",
          "고속도로",
          "철도"
        ]
      },
      {
        "id": "tail-17-q-07",
        "coreWord": "앉는곳",
        "word": "앉는곳",
        "answer": "좌석, 창가자리, 임산부배려석",
        "targetWords": [
          "좌석",
          "창가자리",
          "임산부배려석"
        ],
        "distractorPool": [
          "조종석",
          "엔진",
          "바퀴"
        ]
      },
      {
        "id": "tail-17-q-08",
        "coreWord": "빠른도로",
        "word": "빠른도로",
        "answer": "고속도로, 톨게이트, 휴게소",
        "targetWords": [
          "고속도로",
          "톨게이트",
          "휴게소"
        ],
        "distractorPool": [
          "골목길",
          "공터",
          "놀이터"
        ]
      },
      {
        "id": "tail-17-q-09",
        "coreWord": "교통안전",
        "word": "교통안전",
        "answer": "신호등, 횡단보도, 정지선",
        "targetWords": [
          "신호등",
          "횡단보도",
          "정지선"
        ],
        "distractorPool": [
          "비상구",
          "소화기",
          "대피로"
        ]
      },
      {
        "id": "tail-17-q-10",
        "coreWord": "두바퀴",
        "word": "두바퀴",
        "answer": "자전거, 헬멧, 자전거도로",
        "targetWords": [
          "자전거",
          "헬멧",
          "자전거도로"
        ],
        "distractorPool": [
          "자동차",
          "버스",
          "트럭"
        ]
      },
      {
        "id": "tail-17-q-11",
        "coreWord": "응급차량",
        "word": "응급차량",
        "answer": "구급차, 소방차, 사이렌",
        "targetWords": [
          "구급차",
          "소방차",
          "사이렌"
        ],
        "distractorPool": [
          "택시",
          "배달오토바이",
          "승용차"
        ]
      },
      {
        "id": "tail-17-q-12",
        "coreWord": "공짜탑승",
        "word": "공짜탑승",
        "answer": "무임승차, 벌금, 불법",
        "targetWords": [
          "무임승차",
          "벌금",
          "불법"
        ],
        "distractorPool": [
          "할인",
          "무료",
          "사은품"
        ]
      },
      {
        "id": "tail-17-q-13",
        "coreWord": "자동계단",
        "word": "자동계단",
        "answer": "에스컬레이터, 손잡이, 우측보행",
        "targetWords": [
          "에스컬레이터",
          "손잡이",
          "우측보행"
        ],
        "distractorPool": [
          "미끄럼틀",
          "그네",
          "시소"
        ]
      },
      {
        "id": "tail-17-q-14",
        "coreWord": "요금미터기",
        "word": "요금미터기",
        "answer": "택시, 목적지, 기본요금",
        "targetWords": [
          "택시",
          "목적지",
          "기본요금"
        ],
        "distractorPool": [
          "승차권",
          "개찰구",
          "비행기표"
        ]
      },
      {
        "id": "tail-17-q-15",
        "coreWord": "걷는사람",
        "word": "걷는사람",
        "answer": "보행자, 인도, 육교",
        "targetWords": [
          "보행자",
          "인도",
          "육교"
        ],
        "distractorPool": [
          "차도",
          "터널",
          "차선"
        ]
      },
      {
        "id": "tail-17-q-16",
        "coreWord": "운전수칙",
        "word": "운전수칙",
        "answer": "안전벨트, 과속금지, 정지선준수",
        "targetWords": [
          "안전벨트",
          "과속금지",
          "정지선준수"
        ],
        "distractorPool": [
          "음주운전",
          "무단횡단",
          "신호위반"
        ]
      },
      {
        "id": "tail-17-q-17",
        "coreWord": "역이름",
        "word": "역이름",
        "answer": "환승역, 종착역, 출발역",
        "targetWords": [
          "환승역",
          "종착역",
          "출발역"
        ],
        "distractorPool": [
          "편의점",
          "마트",
          "학교"
        ]
      },
      {
        "id": "tail-17-q-18",
        "coreWord": "공항수속",
        "word": "공항수속",
        "answer": "탑승권, 수하물검사, 여권확인",
        "targetWords": [
          "탑승권",
          "수하물검사",
          "여권확인"
        ],
        "distractorPool": [
          "우표사기",
          "세금내기",
          "장보기"
        ]
      },
      {
        "id": "tail-17-q-19",
        "coreWord": "버스예절",
        "word": "버스예절",
        "answer": "조용히하기, 자리양보, 손잡이잡기",
        "targetWords": [
          "조용히하기",
          "자리양보",
          "손잡이잡기"
        ],
        "distractorPool": [
          "큰소리통화",
          "음식먹기",
          "돌아다니기"
        ]
      },
      {
        "id": "tail-17-q-20",
        "coreWord": "배멀미",
        "word": "배멀미",
        "answer": "멀미약, 파도, 어지러움",
        "targetWords": [
          "멀미약",
          "파도",
          "어지러움"
        ],
        "distractorPool": [
          "식욕",
          "달콤함",
          "상쾌함"
        ]
      },
      {
        "id": "tail-17-q-21",
        "coreWord": "교통체증",
        "word": "교통체증",
        "answer": "꽉막힘, 출퇴근시간, 정체",
        "targetWords": [
          "꽉막힘",
          "출퇴근시간",
          "정체"
        ],
        "distractorPool": [
          "쌩쌩달림",
          "원활함",
          "과속"
        ]
      },
      {
        "id": "tail-17-q-22",
        "coreWord": "노약자석",
        "word": "노약자석",
        "answer": "비워두기, 어르신, 자리양보",
        "targetWords": [
          "비워두기",
          "어르신",
          "자리양보"
        ],
        "distractorPool": [
          "내가앉기",
          "차지하기",
          "스마트폰보기"
        ]
      },
      {
        "id": "tail-17-q-23",
        "coreWord": "택시잡기",
        "word": "택시잡기",
        "answer": "손흔들기, 승강장, 빈차표시",
        "targetWords": [
          "손흔들기",
          "승강장",
          "빈차표시"
        ],
        "distractorPool": [
          "무단횡단",
          "뛰어들기",
          "새치기"
        ]
      },
      {
        "id": "tail-17-q-24",
        "coreWord": "버스환승",
        "word": "버스환승",
        "answer": "내릴때카드찍기, 삼십분이내, 할인혜택",
        "targetWords": [
          "내릴때카드찍기",
          "삼십분이내",
          "할인혜택"
        ],
        "distractorPool": [
          "현금내기",
          "무임승차",
          "뒷문타기"
        ]
      },
      {
        "id": "tail-17-q-25",
        "coreWord": "지하철노선도",
        "word": "지하철노선도",
        "answer": "몇호선, 환승역찾기, 방향확인",
        "targetWords": [
          "몇호선",
          "환승역찾기",
          "방향확인"
        ],
        "distractorPool": [
          "쇼핑몰위치",
          "식당메뉴",
          "영화시간"
        ]
      },
      {
        "id": "tail-17-q-26",
        "coreWord": "기차여행",
        "word": "기차여행",
        "answer": "예매, 플랫폼, 기차도시락",
        "targetWords": [
          "예매",
          "플랫폼",
          "기차도시락"
        ],
        "distractorPool": [
          "여권",
          "비행기표",
          "면세점"
        ]
      },
      {
        "id": "tail-17-q-27",
        "coreWord": "고속버스",
        "word": "고속버스",
        "answer": "터미널, 지정좌석, 휴게소",
        "targetWords": [
          "터미널",
          "지정좌석",
          "휴게소"
        ],
        "distractorPool": [
          "입석",
          "서서가기",
          "환승역"
        ]
      },
      {
        "id": "tail-17-q-28",
        "coreWord": "비행기이륙",
        "word": "비행기이륙",
        "answer": "안전벨트매기, 등받이세우기, 창문덮개열기",
        "targetWords": [
          "안전벨트매기",
          "등받이세우기",
          "창문덮개열기"
        ],
        "distractorPool": [
          "돌아다니기",
          "화장실가기",
          "뛰어놀기"
        ]
      },
      {
        "id": "tail-17-q-29",
        "coreWord": "기내식",
        "word": "기내식",
        "answer": "비행기안, 승무원안내, 식사",
        "targetWords": [
          "비행기안",
          "승무원안내",
          "식사"
        ],
        "distractorPool": [
          "휴게소우동",
          "포장마차",
          "분식집"
        ]
      },
      {
        "id": "tail-17-q-30",
        "coreWord": "선착장",
        "word": "선착장",
        "answer": "배타는곳, 승선권, 신분증확인",
        "targetWords": [
          "배타는곳",
          "승선권",
          "신분증확인"
        ],
        "distractorPool": [
          "개찰구",
          "탑승수속",
          "버스터미널"
        ]
      },
      {
        "id": "tail-17-q-31",
        "coreWord": "케이블카",
        "word": "케이블카",
        "answer": "공중이동, 산정상, 전망",
        "targetWords": [
          "공중이동",
          "산정상",
          "전망"
        ],
        "distractorPool": [
          "잠수",
          "해저탐험",
          "지하동굴"
        ]
      },
      {
        "id": "tail-17-q-32",
        "coreWord": "교통지도",
        "word": "교통지도",
        "answer": "녹색어머니, 경찰관, 교통경찰",
        "targetWords": [
          "녹색어머니",
          "경찰관",
          "교통경찰"
        ],
        "distractorPool": [
          "소방관",
          "의사",
          "요리사"
        ]
      },
      {
        "id": "tail-17-q-33",
        "coreWord": "무단횡단",
        "word": "무단횡단",
        "answer": "불법, 위험함, 사고원인",
        "targetWords": [
          "불법",
          "위험함",
          "사고원인"
        ],
        "distractorPool": [
          "안전함",
          "권장함",
          "칭찬받음"
        ]
      },
      {
        "id": "tail-17-q-34",
        "coreWord": "스쿨존",
        "word": "스쿨존",
        "answer": "어린이보호구역, 서행, 시속삼십",
        "targetWords": [
          "어린이보호구역",
          "서행",
          "시속삼십"
        ],
        "distractorPool": [
          "과속",
          "신호위반",
          "난폭운전"
        ]
      },
      {
        "id": "tail-17-q-35",
        "coreWord": "교통표지판",
        "word": "교통표지판",
        "answer": "속도제한, 정지, 일방통행",
        "targetWords": [
          "속도제한",
          "정지",
          "일방통행"
        ],
        "distractorPool": [
          "간판",
          "광고지",
          "메뉴판"
        ]
      },
      {
        "id": "tail-17-q-36",
        "coreWord": "오토바이",
        "word": "오토바이",
        "answer": "헬멧필수, 이륜차, 배달",
        "targetWords": [
          "헬멧필수",
          "이륜차",
          "배달"
        ],
        "distractorPool": [
          "인도주행",
          "보행자",
          "유모차"
        ]
      },
      {
        "id": "tail-17-q-37",
        "coreWord": "전동킥보드",
        "word": "전동킥보드",
        "answer": "안전모, 보호장구, 면허필요",
        "targetWords": [
          "안전모",
          "보호장구",
          "면허필요"
        ],
        "distractorPool": [
          "초등학생가능",
          "두명타기",
          "장난치기"
        ]
      },
      {
        "id": "tail-17-q-38",
        "coreWord": "음주운전",
        "word": "음주운전",
        "answer": "절대금지, 면허취소, 대형사고",
        "targetWords": [
          "절대금지",
          "면허취소",
          "대형사고"
        ],
        "distractorPool": [
          "가벼운실수",
          "칭찬",
          "상금"
        ]
      },
      {
        "id": "tail-17-q-39",
        "coreWord": "졸음운전",
        "word": "졸음운전",
        "answer": "휴게소쉬기, 스트레칭, 위험함",
        "targetWords": [
          "휴게소쉬기",
          "스트레칭",
          "위험함"
        ],
        "distractorPool": [
          "안전함",
          "과속",
          "무면허"
        ]
      },
      {
        "id": "tail-17-q-40",
        "coreWord": "주차장",
        "word": "주차장",
        "answer": "장애인전용, 임산부전용, 주차선준수",
        "targetWords": [
          "장애인전용",
          "임산부전용",
          "주차선준수"
        ],
        "distractorPool": [
          "가로막기",
          "이중주차",
          "인도주차"
        ]
      },
      {
        "id": "tail-17-q-41",
        "coreWord": "교통사고",
        "word": "교통사고",
        "answer": "일일이신고, 안전확보, 비상등",
        "targetWords": [
          "일일이신고",
          "안전확보",
          "비상등"
        ],
        "distractorPool": [
          "도망치기",
          "모른척하기",
          "싸우기"
        ]
      },
      {
        "id": "tail-17-q-42",
        "coreWord": "길찾기",
        "word": "길찾기",
        "answer": "네비게이션, 지도앱, 이정표",
        "targetWords": [
          "네비게이션",
          "지도앱",
          "이정표"
        ],
        "distractorPool": [
          "요리책",
          "동화책",
          "사전"
        ]
      },
      {
        "id": "tail-17-q-43",
        "coreWord": "심야버스",
        "word": "심야버스",
        "answer": "밤늦은시간, 막차끊김, 야간이동",
        "targetWords": [
          "밤늦은시간",
          "막차끊김",
          "야간이동"
        ],
        "distractorPool": [
          "새벽배송",
          "로켓배송",
          "택배"
        ]
      },
      {
        "id": "tail-17-q-44",
        "coreWord": "출근시간",
        "word": "출근시간",
        "answer": "만원버스, 지옥철, 혼잡함",
        "targetWords": [
          "만원버스",
          "지옥철",
          "혼잡함"
        ],
        "distractorPool": [
          "여유로움",
          "텅빔",
          "조용함"
        ]
      },
      {
        "id": "tail-17-q-45",
        "coreWord": "안내방송",
        "word": "안내방송",
        "answer": "다음정류장, 도착알림, 내릴준비",
        "targetWords": [
          "다음정류장",
          "도착알림",
          "내릴준비"
        ],
        "distractorPool": [
          "광고",
          "뉴스",
          "드라마"
        ]
      },
      {
        "id": "tail-17-q-46",
        "coreWord": "비상사태",
        "word": "비상사태",
        "answer": "비상망치, 유리창깨기, 대피",
        "targetWords": [
          "비상망치",
          "유리창깨기",
          "대피"
        ],
        "distractorPool": [
          "구경하기",
          "사진찍기",
          "숨기"
        ]
      },
      {
        "id": "tail-17-q-47",
        "coreWord": "소화기",
        "word": "소화기",
        "answer": "불끌때, 안전핀뽑기, 바람등지고",
        "targetWords": [
          "불끌때",
          "안전핀뽑기",
          "바람등지고"
        ],
        "distractorPool": [
          "물장난",
          "물총놀이",
          "세수하기"
        ]
      },
      {
        "id": "tail-17-q-48",
        "coreWord": "대합실",
        "word": "대합실",
        "answer": "기다림, 의자, 기차역",
        "targetWords": [
          "기다림",
          "의자",
          "기차역"
        ],
        "distractorPool": [
          "수술실",
          "응급실",
          "입원실"
        ]
      },
      {
        "id": "tail-17-q-49",
        "coreWord": "면세점",
        "word": "면세점",
        "answer": "공항안, 세금면제, 해외여행",
        "targetWords": [
          "공항안",
          "세금면제",
          "해외여행"
        ],
        "distractorPool": [
          "동네슈퍼",
          "편의점",
          "문구점"
        ]
      },
      {
        "id": "tail-17-q-50",
        "coreWord": "수하물",
        "word": "수하물",
        "answer": "비행기짐칸, 무게제한, 컨베이어벨트",
        "targetWords": [
          "비행기짐칸",
          "무게제한",
          "컨베이어벨트"
        ],
        "distractorPool": [
          "장바구니",
          "책가방",
          "비닐봉지"
        ]
      },
      {
        "id": "tail-17-q-51",
        "coreWord": "우측보행",
        "word": "우측보행",
        "answer": "에스컬레이터, 계단, 복도",
        "targetWords": [
          "에스컬레이터",
          "계단",
          "복도"
        ],
        "distractorPool": [
          "좌측보행",
          "뛰어가기",
          "새치기"
        ]
      },
      {
        "id": "tail-17-q-52",
        "coreWord": "안전선",
        "word": "안전선",
        "answer": "노란선, 물러서기, 기차기다림",
        "targetWords": [
          "노란선",
          "물러서기",
          "기차기다림"
        ],
        "distractorPool": [
          "넘어가기",
          "뛰어들기",
          "장난치기"
        ]
      },
      {
        "id": "tail-17-q-53",
        "coreWord": "손잡이",
        "word": "손잡이",
        "answer": "급정거대비, 넘어짐방지, 꼭잡기",
        "targetWords": [
          "급정거대비",
          "넘어짐방지",
          "꼭잡기"
        ],
        "distractorPool": [
          "놓기",
          "매달리기",
          "장난치기"
        ]
      },
      {
        "id": "tail-17-q-54",
        "coreWord": "백팩",
        "word": "백팩",
        "answer": "앞으로메기, 내려놓기, 뒷사람배려",
        "targetWords": [
          "앞으로메기",
          "내려놓기",
          "뒷사람배려"
        ],
        "distractorPool": [
          "크게휘두르기",
          "남치기",
          "무기"
        ]
      },
      {
        "id": "tail-17-q-55",
        "coreWord": "조용히하기",
        "word": "조용히하기",
        "answer": "통화짧게, 이어폰사용, 매너",
        "targetWords": [
          "통화짧게",
          "이어폰사용",
          "매너"
        ],
        "distractorPool": [
          "고성방가",
          "음악크게",
          "노래부르기"
        ]
      },
      {
        "id": "tail-17-q-56",
        "coreWord": "쓰레기",
        "word": "쓰레기",
        "answer": "가져가기, 휴지통에버리기, 깨끗하게",
        "targetWords": [
          "가져가기",
          "휴지통에버리기",
          "깨끗하게"
        ],
        "distractorPool": [
          "바닥에버리기",
          "창밖투기",
          "숨기기"
        ]
      },
      {
        "id": "tail-17-q-57",
        "coreWord": "음식물",
        "word": "음식물",
        "answer": "섭취금지, 냄새배려, 포장만가능",
        "targetWords": [
          "섭취금지",
          "냄새배려",
          "포장만가능"
        ],
        "distractorPool": [
          "라면먹기",
          "햄버거먹기",
          "국물버리기"
        ]
      },
      {
        "id": "tail-17-q-58",
        "coreWord": "새치기",
        "word": "새치기",
        "answer": "질서위반, 얌체, 비매너",
        "targetWords": [
          "질서위반",
          "얌체",
          "비매너"
        ],
        "distractorPool": [
          "칭찬",
          "양보",
          "배려"
        ]
      },
      {
        "id": "tail-17-q-59",
        "coreWord": "안전벨트",
        "word": "안전벨트",
        "answer": "생명줄, 딸깍소리, 전좌석착용",
        "targetWords": [
          "생명줄",
          "딸깍소리",
          "전좌석착용"
        ],
        "distractorPool": [
          "불편함",
          "풀어놓기",
          "장식품"
        ]
      },
      {
        "id": "tail-17-q-60",
        "coreWord": "선진교통문화",
        "word": "선진교통문화",
        "answer": "서로배려, 규칙준수, 양보",
        "targetWords": [
          "서로배려",
          "규칙준수",
          "양보"
        ],
        "distractorPool": [
          "이기주의",
          "무법",
          "새치기"
        ]
      }
    ]
  },
  {
    "id": "tail-18",
    "title": "초등 15",
    "schoolLevelLabel": "15",
    "bandLabel": "초등",
    "descriptor": "공공기관과생활",
    "grammarFocus": "공공기관과생활",
    "goalCopy": "공공기관과생활 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 26,
    "questions": [
      {
        "id": "tail-18-q-01",
        "coreWord": "편지배달",
        "word": "편지배달",
        "answer": "우체국, 우표, 소포",
        "targetWords": [
          "우체국",
          "우표",
          "소포"
        ],
        "distractorPool": [
          "통장",
          "예금",
          "대출"
        ]
      },
      {
        "id": "tail-18-q-02",
        "coreWord": "돈관리기관",
        "word": "돈관리기관",
        "answer": "은행, 통장, 번호표",
        "targetWords": [
          "은행",
          "통장",
          "번호표"
        ],
        "distractorPool": [
          "진단서",
          "백신",
          "수술"
        ]
      },
      {
        "id": "tail-18-q-03",
        "coreWord": "책빌리기",
        "word": "책빌리기",
        "answer": "도서관, 대출, 반납",
        "targetWords": [
          "도서관",
          "대출",
          "반납"
        ],
        "distractorPool": [
          "경찰관",
          "소방관",
          "의사"
        ]
      },
      {
        "id": "tail-18-q-04",
        "coreWord": "행정업무",
        "word": "행정업무",
        "answer": "주민센터, 등본, 전입신고",
        "targetWords": [
          "주민센터",
          "등본",
          "전입신고"
        ],
        "distractorPool": [
          "감기약",
          "처방전",
          "연고"
        ]
      },
      {
        "id": "tail-18-q-05",
        "coreWord": "치안유지",
        "word": "치안유지",
        "answer": "경찰서, 파출소, 순찰",
        "targetWords": [
          "경찰서",
          "파출소",
          "순찰"
        ],
        "distractorPool": [
          "우체통",
          "택배",
          "소포"
        ]
      },
      {
        "id": "tail-18-q-06",
        "coreWord": "화재진압",
        "word": "화재진압",
        "answer": "소방서, 구급차, 소화기",
        "targetWords": [
          "소방서",
          "구급차",
          "소화기"
        ],
        "distractorPool": [
          "도둑",
          "사기꾼",
          "벌금"
        ]
      },
      {
        "id": "tail-18-q-07",
        "coreWord": "전염병예방",
        "word": "전염병예방",
        "answer": "보건소, 백신, 예방접종",
        "targetWords": [
          "보건소",
          "백신",
          "예방접종"
        ],
        "distractorPool": [
          "세금",
          "여권",
          "등본"
        ]
      },
      {
        "id": "tail-18-q-08",
        "coreWord": "폐기물처리",
        "word": "폐기물처리",
        "answer": "종량제봉투, 분리수거, 대형스티커",
        "targetWords": [
          "종량제봉투",
          "분리수거",
          "대형스티커"
        ],
        "distractorPool": [
          "통장",
          "체크카드",
          "신분증"
        ]
      },
      {
        "id": "tail-18-q-09",
        "coreWord": "일꾼뽑기",
        "word": "일꾼뽑기",
        "answer": "선거, 투표소, 기표소",
        "targetWords": [
          "선거",
          "투표소",
          "기표소"
        ],
        "distractorPool": [
          "경매",
          "주식",
          "투자"
        ]
      },
      {
        "id": "tail-18-q-10",
        "coreWord": "유물전시",
        "word": "유물전시",
        "answer": "박물관, 관람, 큐레이터",
        "targetWords": [
          "박물관",
          "관람",
          "큐레이터"
        ],
        "distractorPool": [
          "영화",
          "팝콘",
          "콜라"
        ]
      },
      {
        "id": "tail-18-q-11",
        "coreWord": "도시행정",
        "word": "도시행정",
        "answer": "시청, 시장, 민원실",
        "targetWords": [
          "시청",
          "시장",
          "민원실"
        ],
        "distractorPool": [
          "국회",
          "법원",
          "대통령"
        ]
      },
      {
        "id": "tail-18-q-12",
        "coreWord": "법적다툼",
        "word": "법적다툼",
        "answer": "법원, 판사, 재판",
        "targetWords": [
          "법원",
          "판사",
          "재판"
        ],
        "distractorPool": [
          "의사",
          "간호사",
          "환자"
        ]
      },
      {
        "id": "tail-18-q-13",
        "coreWord": "나랏돈",
        "word": "나랏돈",
        "answer": "세금, 국세청, 납부",
        "targetWords": [
          "세금",
          "국세청",
          "납부"
        ],
        "distractorPool": [
          "용돈",
          "장학금",
          "사은품"
        ]
      },
      {
        "id": "tail-18-q-14",
        "coreWord": "예술작품",
        "word": "예술작품",
        "answer": "미술관, 그림, 조각",
        "targetWords": [
          "미술관",
          "그림",
          "조각"
        ],
        "distractorPool": [
          "축구",
          "농구",
          "야구"
        ]
      },
      {
        "id": "tail-18-q-15",
        "coreWord": "긴급전화",
        "word": "긴급전화",
        "answer": "일일구, 구조, 구급",
        "targetWords": [
          "일일구",
          "구조",
          "구급"
        ],
        "distractorPool": [
          "일일사",
          "안내",
          "번호"
        ]
      },
      {
        "id": "tail-18-q-16",
        "coreWord": "문화생활",
        "word": "문화생활",
        "answer": "문화예술회관, 공연, 오케스트라",
        "targetWords": [
          "문화예술회관",
          "공연",
          "오케스트라"
        ],
        "distractorPool": [
          "경찰서",
          "교도소",
          "유치장"
        ]
      },
      {
        "id": "tail-18-q-17",
        "coreWord": "신분증",
        "word": "신분증",
        "answer": "주민등록증, 여권, 운전면허증",
        "targetWords": [
          "주민등록증",
          "여권",
          "운전면허증"
        ],
        "distractorPool": [
          "도서관대출증",
          "회원카드",
          "학생증"
        ]
      },
      {
        "id": "tail-18-q-18",
        "coreWord": "복지",
        "word": "복지",
        "answer": "노인정, 복지관, 지원금",
        "targetWords": [
          "노인정",
          "복지관",
          "지원금"
        ],
        "distractorPool": [
          "과징금",
          "벌금",
          "세금"
        ]
      },
      {
        "id": "tail-18-q-19",
        "coreWord": "민원처리",
        "word": "민원처리",
        "answer": "불만접수, 민원실, 해결",
        "targetWords": [
          "불만접수",
          "민원실",
          "해결"
        ],
        "distractorPool": [
          "무시",
          "방관",
          "은폐"
        ]
      },
      {
        "id": "tail-18-q-20",
        "coreWord": "공무원",
        "word": "공무원",
        "answer": "경찰관, 소방관, 동사무소직원",
        "targetWords": [
          "경찰관",
          "소방관",
          "동사무소직원"
        ],
        "distractorPool": [
          "가수",
          "배우",
          "운동선수"
        ]
      },
      {
        "id": "tail-18-q-21",
        "coreWord": "소포보내기",
        "word": "소포보내기",
        "answer": "택배상자, 송장작성, 무게재기",
        "targetWords": [
          "택배상자",
          "송장작성",
          "무게재기"
        ],
        "distractorPool": [
          "예금하기",
          "출금하기",
          "대출받기"
        ]
      },
      {
        "id": "tail-18-q-22",
        "coreWord": "우체통",
        "word": "우체통",
        "answer": "빨간색통, 편지넣기, 우표붙이기",
        "targetWords": [
          "빨간색통",
          "편지넣기",
          "우표붙이기"
        ],
        "distractorPool": [
          "분리수거",
          "휴지버리기",
          "음식물버리기"
        ]
      },
      {
        "id": "tail-18-q-23",
        "coreWord": "우편물종류",
        "word": "우편물종류",
        "answer": "일반우편, 등기우편, 국제우편",
        "targetWords": [
          "일반우편",
          "등기우편",
          "국제우편"
        ],
        "distractorPool": [
          "문자메시지",
          "카카오톡",
          "이메일"
        ]
      },
      {
        "id": "tail-18-q-24",
        "coreWord": "은행계좌",
        "word": "은행계좌",
        "answer": "통장개설, 비밀번호, 도장",
        "targetWords": [
          "통장개설",
          "비밀번호",
          "도장"
        ],
        "distractorPool": [
          "영수증",
          "포인트",
          "사은품"
        ]
      },
      {
        "id": "tail-18-q-25",
        "coreWord": "에이티엠기계",
        "word": "에이티엠기계",
        "answer": "현금인출기, 비밀번호가리기, 출금명세서",
        "targetWords": [
          "현금인출기",
          "비밀번호가리기",
          "출금명세서"
        ],
        "distractorPool": [
          "오락기",
          "뽑기기계",
          "자판기"
        ]
      },
      {
        "id": "tail-18-q-26",
        "coreWord": "은행대출",
        "word": "은행대출",
        "answer": "돈빌리기, 이자내기, 신용평가",
        "targetWords": [
          "돈빌리기",
          "이자내기",
          "신용평가"
        ],
        "distractorPool": [
          "저축하기",
          "적금붓기",
          "기부하기"
        ]
      },
      {
        "id": "tail-18-q-27",
        "coreWord": "도서대출",
        "word": "도서대출",
        "answer": "회원증바코드, 빌리는기간, 반납일",
        "targetWords": [
          "회원증바코드",
          "빌리는기간",
          "반납일"
        ],
        "distractorPool": [
          "책찢기",
          "책버리기",
          "책훔치기"
        ]
      },
      {
        "id": "tail-18-q-28",
        "coreWord": "도서관열람실",
        "word": "도서관열람실",
        "answer": "조용히하기, 독서, 공부",
        "targetWords": [
          "조용히하기",
          "독서",
          "공부"
        ],
        "distractorPool": [
          "뛰어다니기",
          "떠들기",
          "밥먹기"
        ]
      },
      {
        "id": "tail-18-q-29",
        "coreWord": "연체",
        "word": "연체",
        "answer": "날짜어김, 대출정지, 늦게반납",
        "targetWords": [
          "날짜어김",
          "대출정지",
          "늦게반납"
        ],
        "distractorPool": [
          "빠른반납",
          "기한엄수",
          "칭찬"
        ]
      },
      {
        "id": "tail-18-q-30",
        "coreWord": "주민센터서류",
        "word": "주민센터서류",
        "answer": "주민등록등본, 가족관계증명서, 인감증명서",
        "targetWords": [
          "주민등록등본",
          "가족관계증명서",
          "인감증명서"
        ],
        "distractorPool": [
          "성적표",
          "건강진단서",
          "영화표"
        ]
      },
      {
        "id": "tail-18-q-31",
        "coreWord": "전입신고",
        "word": "전입신고",
        "answer": "이사감, 새주소등록, 동사무소",
        "targetWords": [
          "이사감",
          "새주소등록",
          "동사무소"
        ],
        "distractorPool": [
          "전학",
          "휴학",
          "퇴학"
        ]
      },
      {
        "id": "tail-18-q-32",
        "coreWord": "주민등록증",
        "word": "주민등록증",
        "answer": "만십칠세, 국가신분증, 지문등록",
        "targetWords": [
          "만십칠세",
          "국가신분증",
          "지문등록"
        ],
        "distractorPool": [
          "학생증",
          "명찰",
          "도서관증"
        ]
      },
      {
        "id": "tail-18-q-33",
        "coreWord": "범죄신고",
        "word": "범죄신고",
        "answer": "일일이, 경찰출동, 조서작성",
        "targetWords": [
          "일일이",
          "경찰출동",
          "조서작성"
        ],
        "distractorPool": [
          "일일구",
          "일일사",
          "안내"
        ]
      },
      {
        "id": "tail-18-q-34",
        "coreWord": "경찰조사",
        "word": "경찰조사",
        "answer": "수사, 목격자진술, 증거수집",
        "targetWords": [
          "수사",
          "목격자진술",
          "증거수집"
        ],
        "distractorPool": [
          "수술",
          "진찰",
          "요리"
        ]
      },
      {
        "id": "tail-18-q-35",
        "coreWord": "유실물센터",
        "word": "유실물센터",
        "answer": "잃어버린물건, 분실물, 찾아주기",
        "targetWords": [
          "잃어버린물건",
          "분실물",
          "찾아주기"
        ],
        "distractorPool": [
          "쓰레기장",
          "재활용장",
          "고물상"
        ]
      },
      {
        "id": "tail-18-q-36",
        "coreWord": "화재신고",
        "word": "화재신고",
        "answer": "일일구, 소방차출동, 불끄기",
        "targetWords": [
          "일일구",
          "소방차출동",
          "불끄기"
        ],
        "distractorPool": [
          "일일이",
          "경찰차출동",
          "도둑잡기"
        ]
      },
      {
        "id": "tail-18-q-37",
        "coreWord": "구조작업",
        "word": "구조작업",
        "answer": "인명구조, 구급대원, 응급처치",
        "targetWords": [
          "인명구조",
          "구급대원",
          "응급처치"
        ],
        "distractorPool": [
          "주차단속",
          "과태료부과",
          "세금징수"
        ]
      },
      {
        "id": "tail-18-q-38",
        "coreWord": "보건소업무",
        "word": "보건소업무",
        "answer": "금연클리닉, 무료접종, 방역",
        "targetWords": [
          "금연클리닉",
          "무료접종",
          "방역"
        ],
        "distractorPool": [
          "대출",
          "예금",
          "송금"
        ]
      },
      {
        "id": "tail-18-q-39",
        "coreWord": "전염병관리",
        "word": "전염병관리",
        "answer": "역학조사, 격리, 소독",
        "targetWords": [
          "역학조사",
          "격리",
          "소독"
        ],
        "distractorPool": [
          "방치",
          "확산",
          "오염"
        ]
      },
      {
        "id": "tail-18-q-40",
        "coreWord": "투표과정",
        "word": "투표과정",
        "answer": "신분증제시, 기표소, 투표함",
        "targetWords": [
          "신분증제시",
          "기표소",
          "투표함"
        ],
        "distractorPool": [
          "경매참여",
          "주식투자",
          "물건사기"
        ]
      },
      {
        "id": "tail-18-q-41",
        "coreWord": "선거종류",
        "word": "선거종류",
        "answer": "대통령선거, 국회의원선거, 지방선거",
        "targetWords": [
          "대통령선거",
          "국회의원선거",
          "지방선거"
        ],
        "distractorPool": [
          "반장선거",
          "회장선거",
          "동아리선거"
        ]
      },
      {
        "id": "tail-18-q-42",
        "coreWord": "박물관관람",
        "word": "박물관관람",
        "answer": "전시물관람, 조용히보기, 설명읽기",
        "targetWords": [
          "전시물관람",
          "조용히보기",
          "설명읽기"
        ],
        "distractorPool": [
          "만지기",
          "사진찍기",
          "뛰어다니기"
        ]
      },
      {
        "id": "tail-18-q-43",
        "coreWord": "문화해설사",
        "word": "문화해설사",
        "answer": "큐레이터, 작품설명, 안내자",
        "targetWords": [
          "큐레이터",
          "작품설명",
          "안내자"
        ],
        "distractorPool": [
          "의사",
          "간호사",
          "소방관"
        ]
      },
      {
        "id": "tail-18-q-44",
        "coreWord": "시청업무",
        "word": "시청업무",
        "answer": "도시계획, 예산관리, 시장님",
        "targetWords": [
          "도시계획",
          "예산관리",
          "시장님"
        ],
        "distractorPool": [
          "재판",
          "판결",
          "수사"
        ]
      },
      {
        "id": "tail-18-q-45",
        "coreWord": "민원",
        "word": "민원",
        "answer": "불편사항건의, 가로등수리, 도로포장요청",
        "targetWords": [
          "불편사항건의",
          "가로등수리",
          "도로포장요청"
        ],
        "distractorPool": [
          "칭찬하기",
          "선물주기",
          "응원하기"
        ]
      },
      {
        "id": "tail-18-q-46",
        "coreWord": "법원재판",
        "word": "법원재판",
        "answer": "판사, 검사, 변호사",
        "targetWords": [
          "판사",
          "검사",
          "변호사"
        ],
        "distractorPool": [
          "의사",
          "간호사",
          "약사"
        ]
      },
      {
        "id": "tail-18-q-47",
        "coreWord": "판결",
        "word": "판결",
        "answer": "유죄, 무죄, 형벌",
        "targetWords": [
          "유죄",
          "무죄",
          "형벌"
        ],
        "distractorPool": [
          "칭찬",
          "상금",
          "용서"
        ]
      },
      {
        "id": "tail-18-q-48",
        "coreWord": "세금종류",
        "word": "세금종류",
        "answer": "부가가치세, 소득세, 재산세",
        "targetWords": [
          "부가가치세",
          "소득세",
          "재산세"
        ],
        "distractorPool": [
          "용돈",
          "월급",
          "수당"
        ]
      },
      {
        "id": "tail-18-q-49",
        "coreWord": "국세청역할",
        "word": "국세청역할",
        "answer": "세금징수, 탈세조사, 국가재정",
        "targetWords": [
          "세금징수",
          "탈세조사",
          "국가재정"
        ],
        "distractorPool": [
          "범인체포",
          "화재진압",
          "우편배달"
        ]
      },
      {
        "id": "tail-18-q-50",
        "coreWord": "미술관예절",
        "word": "미술관예절",
        "answer": "눈으로만보기, 선지키기, 조용히감상",
        "targetWords": [
          "눈으로만보기",
          "선지키기",
          "조용히감상"
        ],
        "distractorPool": [
          "작품만지기",
          "플래시터뜨리기",
          "음식먹기"
        ]
      },
      {
        "id": "tail-18-q-51",
        "coreWord": "공공시설",
        "word": "공공시설",
        "answer": "공원, 놀이터, 체육관",
        "targetWords": [
          "공원",
          "놀이터",
          "체육관"
        ],
        "distractorPool": [
          "내방",
          "우리집",
          "개인정원"
        ]
      },
      {
        "id": "tail-18-q-52",
        "coreWord": "공공재물",
        "word": "공공재물",
        "answer": "아껴쓰기, 깨끗이사용, 모두의것",
        "targetWords": [
          "아껴쓰기",
          "깨끗이사용",
          "모두의것"
        ],
        "distractorPool": [
          "내맘대로쓰기",
          "부수기",
          "가져가기"
        ]
      },
      {
        "id": "tail-18-q-53",
        "coreWord": "여권발급",
        "word": "여권발급",
        "answer": "구청, 시청, 해외여행필수품",
        "targetWords": [
          "구청",
          "시청",
          "해외여행필수품"
        ],
        "distractorPool": [
          "경찰서",
          "소방서",
          "보건소"
        ]
      },
      {
        "id": "tail-18-q-54",
        "coreWord": "청소년수련관",
        "word": "청소년수련관",
        "answer": "동아리활동, 체육프로그램, 문화강좌",
        "targetWords": [
          "동아리활동",
          "체육프로그램",
          "문화강좌"
        ],
        "distractorPool": [
          "감옥",
          "유치장",
          "구치소"
        ]
      },
      {
        "id": "tail-18-q-55",
        "coreWord": "복지관",
        "word": "복지관",
        "answer": "노인돌봄, 무료급식, 소외계층지원",
        "targetWords": [
          "노인돌봄",
          "무료급식",
          "소외계층지원"
        ],
        "distractorPool": [
          "세금징수",
          "범죄수사",
          "재판"
        ]
      },
      {
        "id": "tail-18-q-56",
        "coreWord": "장난전화금지",
        "word": "장난전화금지",
        "answer": "허위신고, 처벌, 위급한사람피해",
        "targetWords": [
          "허위신고",
          "처벌",
          "위급한사람피해"
        ],
        "distractorPool": [
          "재미",
          "스트레스해소",
          "장난"
        ]
      },
      {
        "id": "tail-18-q-57",
        "coreWord": "무인민원발급기",
        "word": "무인민원발급기",
        "answer": "지문인식, 수수료, 서류출력",
        "targetWords": [
          "지문인식",
          "수수료",
          "서류출력"
        ],
        "distractorPool": [
          "현금인출",
          "음료수뽑기",
          "게임하기"
        ]
      },
      {
        "id": "tail-18-q-58",
        "coreWord": "국민의권리",
        "word": "국민의권리",
        "answer": "알권리, 정보공개청구, 투명한행정",
        "targetWords": [
          "알권리",
          "정보공개청구",
          "투명한행정"
        ],
        "distractorPool": [
          "비밀주의",
          "은폐",
          "조작"
        ]
      },
      {
        "id": "tail-18-q-59",
        "coreWord": "공무원태도",
        "word": "공무원태도",
        "answer": "친절함, 공정함, 봉사정신",
        "targetWords": [
          "친절함",
          "공정함",
          "봉사정신"
        ],
        "distractorPool": [
          "불친절",
          "차별",
          "권위주의"
        ]
      },
      {
        "id": "tail-18-q-60",
        "coreWord": "성숙한시민",
        "word": "성숙한시민",
        "answer": "규칙준수, 공공기물아끼기, 질서유지",
        "targetWords": [
          "규칙준수",
          "공공기물아끼기",
          "질서유지"
        ],
        "distractorPool": [
          "새치기",
          "무단투기",
          "파괴"
        ]
      }
    ]
  },
  {
    "id": "tail-19",
    "title": "초등 16",
    "schoolLevelLabel": "16",
    "bandLabel": "초등",
    "descriptor": "경제와현명한소비",
    "grammarFocus": "경제와현명한소비",
    "goalCopy": "경제와현명한소비 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 26,
    "questions": [
      {
        "id": "tail-19-q-01",
        "coreWord": "무리한소비",
        "word": "무리한소비",
        "answer": "과소비, 낭비, 충동구매",
        "targetWords": [
          "과소비",
          "낭비",
          "충동구매"
        ],
        "distractorPool": [
          "저축",
          "절약",
          "합리적소비"
        ]
      },
      {
        "id": "tail-19-q-02",
        "coreWord": "시장장악",
        "word": "시장장악",
        "answer": "독점, 불공정, 가격인상",
        "targetWords": [
          "독점",
          "불공정",
          "가격인상"
        ],
        "distractorPool": [
          "경쟁",
          "할인",
          "혜택"
        ]
      },
      {
        "id": "tail-19-q-03",
        "coreWord": "가격결정",
        "word": "가격결정",
        "answer": "수요와공급, 시장경제, 거래",
        "targetWords": [
          "수요와공급",
          "시장경제",
          "거래"
        ],
        "distractorPool": [
          "통제경제",
          "배급",
          "무상"
        ]
      },
      {
        "id": "tail-19-q-04",
        "coreWord": "친환경소비",
        "word": "친환경소비",
        "answer": "새활용, 리사이클, 재활용",
        "targetWords": [
          "새활용",
          "리사이클",
          "재활용"
        ],
        "distractorPool": [
          "일회용품",
          "쓰레기",
          "낭비"
        ]
      },
      {
        "id": "tail-19-q-05",
        "coreWord": "은행수익",
        "word": "은행수익",
        "answer": "이자, 저축, 원금",
        "targetWords": [
          "이자",
          "저축",
          "원금"
        ],
        "distractorPool": [
          "벌금",
          "세금",
          "수수료"
        ]
      },
      {
        "id": "tail-19-q-06",
        "coreWord": "물가상승",
        "word": "물가상승",
        "answer": "인플레이션, 돈가치하락, 폭등",
        "targetWords": [
          "인플레이션",
          "돈가치하락",
          "폭등"
        ],
        "distractorPool": [
          "할인",
          "세일",
          "디플레이션"
        ]
      },
      {
        "id": "tail-19-q-07",
        "coreWord": "믿음과돈",
        "word": "믿음과돈",
        "answer": "신용, 대출, 이자율",
        "targetWords": [
          "신용",
          "대출",
          "이자율"
        ],
        "distractorPool": [
          "현금",
          "물물교환",
          "기부"
        ]
      },
      {
        "id": "tail-19-q-08",
        "coreWord": "소비자운동",
        "word": "소비자운동",
        "answer": "불매운동, 거부, 항의",
        "targetWords": [
          "불매운동",
          "거부",
          "항의"
        ],
        "distractorPool": [
          "충동구매",
          "사재기",
          "과소비"
        ]
      },
      {
        "id": "tail-19-q-09",
        "coreWord": "착한소비",
        "word": "착한소비",
        "answer": "공정무역, 정당한대가, 제삼세계",
        "targetWords": [
          "공정무역",
          "정당한대가",
          "제삼세계"
        ],
        "distractorPool": [
          "착취",
          "불법",
          "짝퉁"
        ]
      },
      {
        "id": "tail-19-q-10",
        "coreWord": "자산불리기",
        "word": "자산불리기",
        "answer": "투자, 주식, 부동산",
        "targetWords": [
          "투자",
          "주식",
          "부동산"
        ],
        "distractorPool": [
          "기부",
          "저금통",
          "용돈"
        ]
      },
      {
        "id": "tail-19-q-11",
        "coreWord": "국가간돈",
        "word": "국가간돈",
        "answer": "환율, 수출, 수입",
        "targetWords": [
          "환율",
          "수출",
          "수입"
        ],
        "distractorPool": [
          "우표",
          "택배비",
          "교통비"
        ]
      },
      {
        "id": "tail-19-q-12",
        "coreWord": "사고대비",
        "word": "사고대비",
        "answer": "보험, 보상, 질병",
        "targetWords": [
          "보험",
          "보상",
          "질병"
        ],
        "distractorPool": [
          "도박",
          "복권",
          "사기"
        ]
      },
      {
        "id": "tail-19-q-13",
        "coreWord": "국가운영비",
        "word": "국가운영비",
        "answer": "세금, 공공시설, 복지",
        "targetWords": [
          "세금",
          "공공시설",
          "복지"
        ],
        "distractorPool": [
          "용돈",
          "사은품",
          "뇌물"
        ]
      },
      {
        "id": "tail-19-q-14",
        "coreWord": "유행따라가기",
        "word": "유행따라가기",
        "answer": "밴드왜건효과, 쏠림현상, 모방소비",
        "targetWords": [
          "밴드왜건효과",
          "쏠림현상",
          "모방소비"
        ],
        "distractorPool": [
          "개성",
          "합리적소비",
          "절약"
        ]
      },
      {
        "id": "tail-19-q-15",
        "coreWord": "디지털돈",
        "word": "디지털돈",
        "answer": "가상화폐, 비트코인, 블록체인",
        "targetWords": [
          "가상화폐",
          "비트코인",
          "블록체인"
        ],
        "distractorPool": [
          "지폐",
          "동전",
          "수표"
        ]
      },
      {
        "id": "tail-19-q-16",
        "coreWord": "돈의흐름",
        "word": "돈의흐름",
        "answer": "경제, 자본주의, 시장",
        "targetWords": [
          "경제",
          "자본주의",
          "시장"
        ],
        "distractorPool": [
          "자연",
          "우주",
          "기상"
        ]
      },
      {
        "id": "tail-19-q-17",
        "coreWord": "가계부",
        "word": "가계부",
        "answer": "수입, 지출, 잔액",
        "targetWords": [
          "수입",
          "지출",
          "잔액"
        ],
        "distractorPool": [
          "키",
          "몸무게",
          "시력"
        ]
      },
      {
        "id": "tail-19-q-18",
        "coreWord": "중고거래",
        "word": "중고거래",
        "answer": "벼룩시장, 재사용, 직거래",
        "targetWords": [
          "벼룩시장",
          "재사용",
          "직거래"
        ],
        "distractorPool": [
          "새상품",
          "백화점",
          "명품관"
        ]
      },
      {
        "id": "tail-19-q-19",
        "coreWord": "불법돈",
        "word": "불법돈",
        "answer": "위조지폐, 사기, 횡령",
        "targetWords": [
          "위조지폐",
          "사기",
          "횡령"
        ],
        "distractorPool": [
          "저축",
          "기부",
          "납세"
        ]
      },
      {
        "id": "tail-19-q-20",
        "coreWord": "노동의대가",
        "word": "노동의대가",
        "answer": "임금, 월급, 시급",
        "targetWords": [
          "임금",
          "월급",
          "시급"
        ],
        "distractorPool": [
          "벌금",
          "과태료",
          "세금"
        ]
      },
      {
        "id": "tail-19-q-21",
        "coreWord": "합리적소비",
        "word": "합리적소비",
        "answer": "계획구매, 품질비교, 가성비",
        "targetWords": [
          "계획구매",
          "품질비교",
          "가성비"
        ],
        "distractorPool": [
          "충동구매",
          "명품소비",
          "낭비"
        ]
      },
      {
        "id": "tail-19-q-22",
        "coreWord": "가성비",
        "word": "가성비",
        "answer": "가격대비성능, 효율적, 저렴함",
        "targetWords": [
          "가격대비성능",
          "효율적",
          "저렴함"
        ],
        "distractorPool": [
          "가심비",
          "비쌈",
          "사치"
        ]
      },
      {
        "id": "tail-19-q-23",
        "coreWord": "수요현상",
        "word": "수요현상",
        "answer": "사는사람많음, 인기상품, 품절",
        "targetWords": [
          "사는사람많음",
          "인기상품",
          "품절"
        ],
        "distractorPool": [
          "사는사람없음",
          "재고",
          "떨이"
        ]
      },
      {
        "id": "tail-19-q-24",
        "coreWord": "공급현상",
        "word": "공급현상",
        "answer": "파는사람많음, 생산량증가, 풍년",
        "targetWords": [
          "파는사람많음",
          "생산량증가",
          "풍년"
        ],
        "distractorPool": [
          "파는사람없음",
          "희소성",
          "한정판"
        ]
      },
      {
        "id": "tail-19-q-25",
        "coreWord": "희소성",
        "word": "희소성",
        "answer": "구하기어려움, 한정판, 가격상승",
        "targetWords": [
          "구하기어려움",
          "한정판",
          "가격상승"
        ],
        "distractorPool": [
          "흔함",
          "재고넘침",
          "가격하락"
        ]
      },
      {
        "id": "tail-19-q-26",
        "coreWord": "과소비원인",
        "word": "과소비원인",
        "answer": "신용카드, 홈쇼핑마감임박, 원플러스원유혹",
        "targetWords": [
          "신용카드",
          "홈쇼핑마감임박",
          "원플러스원유혹"
        ],
        "distractorPool": [
          "용돈기입장",
          "저축",
          "체크카드"
        ]
      },
      {
        "id": "tail-19-q-27",
        "coreWord": "체크카드",
        "word": "체크카드",
        "answer": "통장잔고만큼, 과소비예방, 계획소비",
        "targetWords": [
          "통장잔고만큼",
          "과소비예방",
          "계획소비"
        ],
        "distractorPool": [
          "외상",
          "할부",
          "빚"
        ]
      },
      {
        "id": "tail-19-q-28",
        "coreWord": "신용카드",
        "word": "신용카드",
        "answer": "외상, 할부결제, 나중에갚을돈",
        "targetWords": [
          "외상",
          "할부결제",
          "나중에갚을돈"
        ],
        "distractorPool": [
          "당장현금내기",
          "잔고한도내사용",
          "저축"
        ]
      },
      {
        "id": "tail-19-q-29",
        "coreWord": "경제뉴스읽기",
        "word": "경제뉴스읽기",
        "answer": "물가지수, 환율변동, 금리인상",
        "targetWords": [
          "물가지수",
          "환율변동",
          "금리인상"
        ],
        "distractorPool": [
          "연예인스캔들",
          "드라마시청률",
          "스포츠결과"
        ]
      },
      {
        "id": "tail-19-q-30",
        "coreWord": "금리",
        "word": "금리",
        "answer": "이자율, 은행예금, 대출이자",
        "targetWords": [
          "이자율",
          "은행예금",
          "대출이자"
        ],
        "distractorPool": [
          "세금",
          "과태료",
          "범칙금"
        ]
      },
      {
        "id": "tail-19-q-31",
        "coreWord": "디플레이션",
        "word": "디플레이션",
        "answer": "물가하락, 소비위축, 경제침체",
        "targetWords": [
          "물가하락",
          "소비위축",
          "경제침체"
        ],
        "distractorPool": [
          "물가상승",
          "인플레이션",
          "화폐가치하락"
        ]
      },
      {
        "id": "tail-19-q-32",
        "coreWord": "자유무역",
        "word": "자유무역",
        "answer": "에프티에이, 관세철폐, 시장개방",
        "targetWords": [
          "에프티에이",
          "관세철폐",
          "시장개방"
        ],
        "distractorPool": [
          "쇄국정책",
          "보호무역",
          "관세장벽"
        ]
      },
      {
        "id": "tail-19-q-33",
        "coreWord": "보호무역",
        "word": "보호무역",
        "answer": "자국산업보호, 관세부과, 수입제한",
        "targetWords": [
          "자국산업보호",
          "관세부과",
          "수입제한"
        ],
        "distractorPool": [
          "자유무역",
          "개방",
          "에프티에이"
        ]
      },
      {
        "id": "tail-19-q-34",
        "coreWord": "기업의목적",
        "word": "기업의목적",
        "answer": "이윤추구, 이익창출, 상품판매",
        "targetWords": [
          "이윤추구",
          "이익창출",
          "상품판매"
        ],
        "distractorPool": [
          "자선사업",
          "무료봉사",
          "기부"
        ]
      },
      {
        "id": "tail-19-q-35",
        "coreWord": "기업의책임",
        "word": "기업의책임",
        "answer": "좋은품질, 친환경, 직원복지",
        "targetWords": [
          "좋은품질",
          "친환경",
          "직원복지"
        ],
        "distractorPool": [
          "환경오염",
          "갑질",
          "착취"
        ]
      },
      {
        "id": "tail-19-q-36",
        "coreWord": "담합피해",
        "word": "담합피해",
        "answer": "불공정거래, 가격상승, 소비자손해",
        "targetWords": [
          "불공정거래",
          "가격상승",
          "소비자손해"
        ],
        "distractorPool": [
          "자유경쟁",
          "가격인하",
          "소비자이익"
        ]
      },
      {
        "id": "tail-19-q-37",
        "coreWord": "주식투자",
        "word": "주식투자",
        "answer": "주주, 배당금, 원금손실위험",
        "targetWords": [
          "주주",
          "배당금",
          "원금손실위험"
        ],
        "distractorPool": [
          "예금",
          "적금",
          "돼지저금통"
        ]
      },
      {
        "id": "tail-19-q-38",
        "coreWord": "부동산",
        "word": "부동산",
        "answer": "땅, 집, 건물",
        "targetWords": [
          "땅",
          "집",
          "건물"
        ],
        "distractorPool": [
          "주식",
          "채권",
          "가상화폐"
        ]
      },
      {
        "id": "tail-19-q-39",
        "coreWord": "신용불량자",
        "word": "신용불량자",
        "answer": "빚못갚음, 대출불가, 카드정지",
        "targetWords": [
          "빚못갚음",
          "대출불가",
          "카드정지"
        ],
        "distractorPool": [
          "부자",
          "저축왕",
          "신용등급일등급"
        ]
      },
      {
        "id": "tail-19-q-40",
        "coreWord": "세금의쓰임",
        "word": "세금의쓰임",
        "answer": "도로건설, 학교운영, 경찰월급",
        "targetWords": [
          "도로건설",
          "학교운영",
          "경찰월급"
        ],
        "distractorPool": [
          "개인용돈",
          "기업이윤",
          "사치품구매"
        ]
      },
      {
        "id": "tail-19-q-41",
        "coreWord": "부가가치세",
        "word": "부가가치세",
        "answer": "물건값에포함, 소비자가냄, 간접세",
        "targetWords": [
          "물건값에포함",
          "소비자가냄",
          "간접세"
        ],
        "distractorPool": [
          "재산세",
          "소득세",
          "직접세"
        ]
      },
      {
        "id": "tail-19-q-42",
        "coreWord": "연말정산",
        "word": "연말정산",
        "answer": "세금돌려받기, 현금영수증, 소득공제",
        "targetWords": [
          "세금돌려받기",
          "현금영수증",
          "소득공제"
        ],
        "distractorPool": [
          "탈세",
          "벌금",
          "과태료"
        ]
      },
      {
        "id": "tail-19-q-43",
        "coreWord": "지디피",
        "word": "지디피",
        "answer": "국내총생산, 국가경제규모, 일년간생산량",
        "targetWords": [
          "국내총생산",
          "국가경제규모",
          "일년간생산량"
        ],
        "distractorPool": [
          "개인소득",
          "용돈",
          "월급"
        ]
      },
      {
        "id": "tail-19-q-44",
        "coreWord": "수출품",
        "word": "수출품",
        "answer": "반도체, 자동차, 스마트폰",
        "targetWords": [
          "반도체",
          "자동차",
          "스마트폰"
        ],
        "distractorPool": [
          "석유",
          "원두커피",
          "바나나"
        ]
      },
      {
        "id": "tail-19-q-45",
        "coreWord": "수입품",
        "word": "수입품",
        "answer": "석유, 천연가스, 커피원두",
        "targetWords": [
          "석유",
          "천연가스",
          "커피원두"
        ],
        "distractorPool": [
          "반도체",
          "자동차",
          "스마트폰"
        ]
      },
      {
        "id": "tail-19-q-46",
        "coreWord": "광고의목적",
        "word": "광고의목적",
        "answer": "상품알리기, 구매유도, 이미지개선",
        "targetWords": [
          "상품알리기",
          "구매유도",
          "이미지개선"
        ],
        "distractorPool": [
          "비밀유지",
          "진실만말하기",
          "소비자보호"
        ]
      },
      {
        "id": "tail-19-q-47",
        "coreWord": "과장광고",
        "word": "과장광고",
        "answer": "허위사실, 속임수, 사실보다크게",
        "targetWords": [
          "허위사실",
          "속임수",
          "사실보다크게"
        ],
        "distractorPool": [
          "정직한정보",
          "객관적사실",
          "진실"
        ]
      },
      {
        "id": "tail-19-q-48",
        "coreWord": "비판적수용",
        "word": "비판적수용",
        "answer": "광고의심하기, 성분따지기, 과장걸러내기",
        "targetWords": [
          "광고의심하기",
          "성분따지기",
          "과장걸러내기"
        ],
        "distractorPool": [
          "무조건믿기",
          "다사기",
          "맹신하기"
        ]
      },
      {
        "id": "tail-19-q-49",
        "coreWord": "공유경제",
        "word": "공유경제",
        "answer": "카셰어링, 숙박공유, 나눠쓰기",
        "targetWords": [
          "카셰어링",
          "숙박공유",
          "나눠쓰기"
        ],
        "distractorPool": [
          "소유하기",
          "독점하기",
          "혼자쓰기"
        ]
      },
      {
        "id": "tail-19-q-50",
        "coreWord": "구독경제",
        "word": "구독경제",
        "answer": "매달결제, 무제한시청, 넷플릭스",
        "targetWords": [
          "매달결제",
          "무제한시청",
          "넷플릭스"
        ],
        "distractorPool": [
          "단건결제",
          "일시불",
          "소유"
        ]
      },
      {
        "id": "tail-19-q-51",
        "coreWord": "플랫폼기업",
        "word": "플랫폼기업",
        "answer": "중개역할, 수수료수익, 배달앱",
        "targetWords": [
          "중개역할",
          "수수료수익",
          "배달앱"
        ],
        "distractorPool": [
          "제조공장",
          "농장",
          "농부"
        ]
      },
      {
        "id": "tail-19-q-52",
        "coreWord": "기부",
        "word": "기부",
        "answer": "나눔, 어려운이웃돕기, 가치있는소비",
        "targetWords": [
          "나눔",
          "어려운이웃돕기",
          "가치있는소비"
        ],
        "distractorPool": [
          "사치",
          "과소비",
          "낭비"
        ]
      },
      {
        "id": "tail-19-q-53",
        "coreWord": "아나바다",
        "word": "아나바다",
        "answer": "아껴쓰기, 나눠쓰기, 다시쓰기",
        "targetWords": [
          "아껴쓰기",
          "나눠쓰기",
          "다시쓰기"
        ],
        "distractorPool": [
          "버리기",
          "새것사기",
          "낭비하기"
        ]
      },
      {
        "id": "tail-19-q-54",
        "coreWord": "리콜",
        "word": "리콜",
        "answer": "결함인정, 무상수리, 제품수거",
        "targetWords": [
          "결함인정",
          "무상수리",
          "제품수거"
        ],
        "distractorPool": [
          "은폐",
          "발뺌",
          "모른척"
        ]
      },
      {
        "id": "tail-19-q-55",
        "coreWord": "가짜상품",
        "word": "가짜상품",
        "answer": "짝퉁, 위조품, 상표권침해",
        "targetWords": [
          "짝퉁",
          "위조품",
          "상표권침해"
        ],
        "distractorPool": [
          "정품",
          "진품",
          "명품"
        ]
      },
      {
        "id": "tail-19-q-56",
        "coreWord": "최저임금",
        "word": "최저임금",
        "answer": "알바생보호, 최소한의월급, 법적보장",
        "targetWords": [
          "알바생보호",
          "최소한의월급",
          "법적보장"
        ],
        "distractorPool": [
          "열정페이",
          "무임금",
          "노동착취"
        ]
      },
      {
        "id": "tail-19-q-57",
        "coreWord": "경제위기",
        "word": "경제위기",
        "answer": "파산, 실업률상승, 불황",
        "targetWords": [
          "파산",
          "실업률상승",
          "불황"
        ],
        "distractorPool": [
          "호황",
          "주가상승",
          "취업률상승"
        ]
      },
      {
        "id": "tail-19-q-58",
        "coreWord": "빈부격차",
        "word": "빈부격차",
        "answer": "양극화, 가난한사람, 부유한사람",
        "targetWords": [
          "양극화",
          "가난한사람",
          "부유한사람"
        ],
        "distractorPool": [
          "평등",
          "공평",
          "복지국가"
        ]
      },
      {
        "id": "tail-19-q-59",
        "coreWord": "복지정책",
        "word": "복지정책",
        "answer": "기초생활보장, 노인연금, 무상급식",
        "targetWords": [
          "기초생활보장",
          "노인연금",
          "무상급식"
        ],
        "distractorPool": [
          "세금인상",
          "대출규제",
          "금리인상"
        ]
      },
      {
        "id": "tail-19-q-60",
        "coreWord": "현명한소비자",
        "word": "현명한소비자",
        "answer": "가치소비, 비교구매, 권리주장",
        "targetWords": [
          "가치소비",
          "비교구매",
          "권리주장"
        ],
        "distractorPool": [
          "충동구매",
          "과소비",
          "진상손님"
        ]
      }
    ]
  },
  {
    "id": "tail-20",
    "title": "초등 17",
    "schoolLevelLabel": "17",
    "bandLabel": "초등",
    "descriptor": "사회와논리",
    "grammarFocus": "사회와논리",
    "goalCopy": "사회와논리 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 25,
    "questions": [
      {
        "id": "tail-20-q-01",
        "coreWord": "정치참여",
        "word": "정치참여",
        "answer": "민주주의, 선거, 다수결",
        "targetWords": [
          "민주주의",
          "선거",
          "다수결"
        ],
        "distractorPool": [
          "독재",
          "억압",
          "통제"
        ]
      },
      {
        "id": "tail-20-q-02",
        "coreWord": "정보전달",
        "word": "정보전달",
        "answer": "언론, 뉴스, 보도",
        "targetWords": [
          "언론",
          "뉴스",
          "보도"
        ],
        "distractorPool": [
          "소설",
          "동화",
          "시"
        ]
      },
      {
        "id": "tail-20-q-03",
        "coreWord": "거짓정보",
        "word": "거짓정보",
        "answer": "가짜뉴스, 선동, 허위사실",
        "targetWords": [
          "가짜뉴스",
          "선동",
          "허위사실"
        ],
        "distractorPool": [
          "진실",
          "객관성",
          "팩트"
        ]
      },
      {
        "id": "tail-20-q-04",
        "coreWord": "약자보호",
        "word": "약자보호",
        "answer": "복지, 연금, 무상급식",
        "targetWords": [
          "복지",
          "연금",
          "무상급식"
        ],
        "distractorPool": [
          "차별",
          "특혜",
          "세금탈루"
        ]
      },
      {
        "id": "tail-20-q-05",
        "coreWord": "다양성",
        "word": "다양성",
        "answer": "다문화, 존중, 공존",
        "targetWords": [
          "다문화",
          "존중",
          "공존"
        ],
        "distractorPool": [
          "차별",
          "배척",
          "편견"
        ]
      },
      {
        "id": "tail-20-q-06",
        "coreWord": "국가교류",
        "word": "국가교류",
        "answer": "세계화, 무역, 통합",
        "targetWords": [
          "세계화",
          "무역",
          "통합"
        ],
        "distractorPool": [
          "고립",
          "쇄국",
          "단절"
        ]
      },
      {
        "id": "tail-20-q-07",
        "coreWord": "논리적글",
        "word": "논리적글",
        "answer": "논설문, 주장, 타당성",
        "targetWords": [
          "논설문",
          "주장",
          "타당성"
        ],
        "distractorPool": [
          "감정",
          "일기",
          "수필"
        ]
      },
      {
        "id": "tail-20-q-08",
        "coreWord": "사람의권리",
        "word": "사람의권리",
        "answer": "인권, 평등, 생명권",
        "targetWords": [
          "인권",
          "평등",
          "생명권"
        ],
        "distractorPool": [
          "차별",
          "노예",
          "억압"
        ]
      },
      {
        "id": "tail-20-q-09",
        "coreWord": "노동자보호",
        "word": "노동자보호",
        "answer": "최저임금, 근로자, 노동법",
        "targetWords": [
          "최저임금",
          "근로자",
          "노동법"
        ],
        "distractorPool": [
          "용돈",
          "세금",
          "뇌물"
        ]
      },
      {
        "id": "tail-20-q-10",
        "coreWord": "목소리내기",
        "word": "목소리내기",
        "answer": "집회, 시위, 평화",
        "targetWords": [
          "집회",
          "시위",
          "평화"
        ],
        "distractorPool": [
          "폭동",
          "테러",
          "범죄"
        ]
      },
      {
        "id": "tail-20-q-11",
        "coreWord": "창작물보호",
        "word": "창작물보호",
        "answer": "저작권, 창작자, 불법다운로드",
        "targetWords": [
          "저작권",
          "창작자",
          "불법다운로드"
        ],
        "distractorPool": [
          "공유",
          "기부",
          "무료"
        ]
      },
      {
        "id": "tail-20-q-12",
        "coreWord": "동물보호",
        "word": "동물보호",
        "answer": "동물권, 유기견, 복지",
        "targetWords": [
          "동물권",
          "유기견",
          "복지"
        ],
        "distractorPool": [
          "학대",
          "안락사",
          "로드킬"
        ]
      },
      {
        "id": "tail-20-q-13",
        "coreWord": "상권내몰림",
        "word": "상권내몰림",
        "answer": "젠트리피케이션, 월세상승, 쫓겨남",
        "targetWords": [
          "젠트리피케이션",
          "월세상승",
          "쫓겨남"
        ],
        "distractorPool": [
          "안정",
          "공존",
          "할인"
        ]
      },
      {
        "id": "tail-20-q-14",
        "coreWord": "가짜영상",
        "word": "가짜영상",
        "answer": "딥페이크, 인공지능, 범죄",
        "targetWords": [
          "딥페이크",
          "인공지능",
          "범죄"
        ],
        "distractorPool": [
          "진실",
          "다큐멘터리",
          "뉴스"
        ]
      },
      {
        "id": "tail-20-q-15",
        "coreWord": "무차별폭력",
        "word": "무차별폭력",
        "answer": "묻지마범죄, 이상동기, 치안불안",
        "targetWords": [
          "묻지마범죄",
          "이상동기",
          "치안불안"
        ],
        "distractorPool": [
          "안전",
          "평화",
          "질서"
        ]
      },
      {
        "id": "tail-20-q-16",
        "coreWord": "사회적갈등",
        "word": "사회적갈등",
        "answer": "층간소음, 주차시비, 이웃분쟁",
        "targetWords": [
          "층간소음",
          "주차시비",
          "이웃분쟁"
        ],
        "distractorPool": [
          "화해",
          "우정",
          "양보"
        ]
      },
      {
        "id": "tail-20-q-17",
        "coreWord": "환경문제",
        "word": "환경문제",
        "answer": "탄소배출, 미세먼지, 기후변화",
        "targetWords": [
          "탄소배출",
          "미세먼지",
          "기후변화"
        ],
        "distractorPool": [
          "경제성장",
          "주가상승",
          "환율안정"
        ]
      },
      {
        "id": "tail-20-q-18",
        "coreWord": "저출산고령화",
        "word": "저출산고령화",
        "answer": "인구감소, 노인복지, 출산장려",
        "targetWords": [
          "인구감소",
          "노인복지",
          "출산장려"
        ],
        "distractorPool": [
          "청년실업",
          "과잉인구",
          "신도시"
        ]
      },
      {
        "id": "tail-20-q-19",
        "coreWord": "토론태도",
        "word": "토론태도",
        "answer": "근거제시, 경청, 반박",
        "targetWords": [
          "근거제시",
          "경청",
          "반박"
        ],
        "distractorPool": [
          "고집",
          "욕설",
          "억지"
        ]
      },
      {
        "id": "tail-20-q-20",
        "coreWord": "시민의역할",
        "word": "시민의역할",
        "answer": "투표참여, 법준수, 사회관심",
        "targetWords": [
          "투표참여",
          "법준수",
          "사회관심"
        ],
        "distractorPool": [
          "무관심",
          "불법",
          "방관"
        ]
      },
      {
        "id": "tail-20-q-21",
        "coreWord": "민주주의원칙",
        "word": "민주주의원칙",
        "answer": "국민주권, 자유, 평등",
        "targetWords": [
          "국민주권",
          "자유",
          "평등"
        ],
        "distractorPool": [
          "독재",
          "신분제",
          "왕정"
        ]
      },
      {
        "id": "tail-20-q-22",
        "coreWord": "선거의원칙",
        "word": "선거의원칙",
        "answer": "비밀선거, 평등선거, 보통선거",
        "targetWords": [
          "비밀선거",
          "평등선거",
          "보통선거"
        ],
        "distractorPool": [
          "공개선거",
          "차등선거",
          "제한선거"
        ]
      },
      {
        "id": "tail-20-q-23",
        "coreWord": "다수결의원칙",
        "word": "다수결의원칙",
        "answer": "가장많은의견, 소수자존중, 합리적결정",
        "targetWords": [
          "가장많은의견",
          "소수자존중",
          "합리적결정"
        ],
        "distractorPool": [
          "다수의횡포",
          "소수무시",
          "독단"
        ]
      },
      {
        "id": "tail-20-q-24",
        "coreWord": "언론의자유",
        "word": "언론의자유",
        "answer": "표현의자유, 알권리, 진실보도",
        "targetWords": [
          "표현의자유",
          "알권리",
          "진실보도"
        ],
        "distractorPool": [
          "언론탄압",
          "검열",
          "은폐"
        ]
      },
      {
        "id": "tail-20-q-25",
        "coreWord": "가짜뉴스위험성",
        "word": "가짜뉴스위험성",
        "answer": "선동, 여론조작, 혼란야기",
        "targetWords": [
          "선동",
          "여론조작",
          "혼란야기"
        ],
        "distractorPool": [
          "정보제공",
          "지식전달",
          "객관성"
        ]
      },
      {
        "id": "tail-20-q-26",
        "coreWord": "비판적사고",
        "word": "비판적사고",
        "answer": "팩트체크, 출처확인, 의심하기",
        "targetWords": [
          "팩트체크",
          "출처확인",
          "의심하기"
        ],
        "distractorPool": [
          "맹신하기",
          "무조건믿기",
          "다퍼나르기"
        ]
      },
      {
        "id": "tail-20-q-27",
        "coreWord": "복지국가",
        "word": "복지국가",
        "answer": "사회적약자보호, 의료보험, 기초생활보장",
        "targetWords": [
          "사회적약자보호",
          "의료보험",
          "기초생활보장"
        ],
        "distractorPool": [
          "빈부격차방치",
          "자유경쟁만강조",
          "각자도생"
        ]
      },
      {
        "id": "tail-20-q-28",
        "coreWord": "다문화사회",
        "word": "다문화사회",
        "answer": "다양한인종, 문화적차이존중, 국제결혼",
        "targetWords": [
          "다양한인종",
          "문화적차이존중",
          "국제결혼"
        ],
        "distractorPool": [
          "단일민족강조",
          "인종차별",
          "배타주의"
        ]
      },
      {
        "id": "tail-20-q-29",
        "coreWord": "세계화영향",
        "word": "세계화영향",
        "answer": "지구촌, 국가간상호의존, 문화교류",
        "targetWords": [
          "지구촌",
          "국가간상호의존",
          "문화교류"
        ],
        "distractorPool": [
          "국경폐쇄",
          "무역중단",
          "문화고립"
        ]
      },
      {
        "id": "tail-20-q-30",
        "coreWord": "논설문구조",
        "word": "논설문구조",
        "answer": "서론, 본론, 결론",
        "targetWords": [
          "서론",
          "본론",
          "결론"
        ],
        "distractorPool": [
          "발단",
          "전개",
          "결말"
        ]
      },
      {
        "id": "tail-20-q-31",
        "coreWord": "주장과근거",
        "word": "주장과근거",
        "answer": "논리성, 객관적자료, 설득력",
        "targetWords": [
          "논리성",
          "객관적자료",
          "설득력"
        ],
        "distractorPool": [
          "억지주장",
          "감정호소",
          "비논리적"
        ]
      },
      {
        "id": "tail-20-q-32",
        "coreWord": "인권존중",
        "word": "인권존중",
        "answer": "모든사람은평등하다, 천부인권, 생명존중",
        "targetWords": [
          "모든사람은평등하다",
          "천부인권",
          "생명존중"
        ],
        "distractorPool": [
          "인종차별",
          "성차별",
          "신분차별"
        ]
      },
      {
        "id": "tail-20-q-33",
        "coreWord": "노사갈등",
        "word": "노사갈등",
        "answer": "임금인상요구, 파업, 근무조건개선",
        "targetWords": [
          "임금인상요구",
          "파업",
          "근무조건개선"
        ],
        "distractorPool": [
          "화해",
          "타협",
          "만장일치"
        ]
      },
      {
        "id": "tail-20-q-34",
        "coreWord": "집회와시위",
        "word": "집회와시위",
        "answer": "평화적수단, 의견표출, 권리행사",
        "targetWords": [
          "평화적수단",
          "의견표출",
          "권리행사"
        ],
        "distractorPool": [
          "폭력시위",
          "도로점거",
          "테러"
        ]
      },
      {
        "id": "tail-20-q-35",
        "coreWord": "저작권침해",
        "word": "저작권침해",
        "answer": "불법다운로드, 무단복제, 표절",
        "targetWords": [
          "불법다운로드",
          "무단복제",
          "표절"
        ],
        "distractorPool": [
          "정품구매",
          "출처표기",
          "허락받기"
        ]
      },
      {
        "id": "tail-20-q-36",
        "coreWord": "동물실험논란",
        "word": "동물실험논란",
        "answer": "동물학대, 생명윤리, 대체실험필요",
        "targetWords": [
          "동물학대",
          "생명윤리",
          "대체실험필요"
        ],
        "distractorPool": [
          "신약개발필수",
          "인간안전우선",
          "동물은도구"
        ]
      },
      {
        "id": "tail-20-q-37",
        "coreWord": "젠트리피케이션",
        "word": "젠트리피케이션",
        "answer": "원주민쫓겨남, 임대료상승, 상권변화",
        "targetWords": [
          "원주민쫓겨남",
          "임대료상승",
          "상권변화"
        ],
        "distractorPool": [
          "지역활성화",
          "상권안정",
          "원주민보호"
        ]
      },
      {
        "id": "tail-20-q-38",
        "coreWord": "딥페이크범죄",
        "word": "딥페이크범죄",
        "answer": "가짜영상제작, 초상권침해, 명예훼손",
        "targetWords": [
          "가짜영상제작",
          "초상권침해",
          "명예훼손"
        ],
        "distractorPool": [
          "영화특수효과",
          "씨지",
          "안면인식"
        ]
      },
      {
        "id": "tail-20-q-39",
        "coreWord": "사이버불링",
        "word": "사이버불링",
        "answer": "온라인괴롭힘, 단톡방따돌림, 악성댓글",
        "targetWords": [
          "온라인괴롭힘",
          "단톡방따돌림",
          "악성댓글"
        ],
        "distractorPool": [
          "선플",
          "칭찬댓글",
          "오프라인폭력"
        ]
      },
      {
        "id": "tail-20-q-40",
        "coreWord": "치안문제",
        "word": "치안문제",
        "answer": "범죄율상승, 씨씨티비확충, 경찰순찰강화",
        "targetWords": [
          "범죄율상승",
          "씨씨티비확충",
          "경찰순찰강화"
        ],
        "distractorPool": [
          "안전한거리",
          "범죄없는마을",
          "평화"
        ]
      },
      {
        "id": "tail-20-q-41",
        "coreWord": "님비현상",
        "word": "님비현상",
        "answer": "지역이기주의, 쓰레기장반대, 내뒷마당은안돼",
        "targetWords": [
          "지역이기주의",
          "쓰레기장반대",
          "내뒷마당은안돼"
        ],
        "distractorPool": [
          "공공시설환영",
          "지하철역환영",
          "병원환영"
        ]
      },
      {
        "id": "tail-20-q-42",
        "coreWord": "탄소중립",
        "word": "탄소중립",
        "answer": "온실가스감축, 나무심기, 친환경에너지",
        "targetWords": [
          "온실가스감축",
          "나무심기",
          "친환경에너지"
        ],
        "distractorPool": [
          "석탄발전소",
          "매연",
          "플라스틱사용"
        ]
      },
      {
        "id": "tail-20-q-43",
        "coreWord": "미세먼지대책",
        "word": "미세먼지대책",
        "answer": "마스크착용, 노후경유차단속, 공기청정기",
        "targetWords": [
          "마스크착용",
          "노후경유차단속",
          "공기청정기"
        ],
        "distractorPool": [
          "야외활동권장",
          "창문열기",
          "환기"
        ]
      },
      {
        "id": "tail-20-q-44",
        "coreWord": "기후위기현상",
        "word": "기후위기현상",
        "answer": "빙하녹음, 해수면상승, 이상기후",
        "targetWords": [
          "빙하녹음",
          "해수면상승",
          "이상기후"
        ],
        "distractorPool": [
          "사계절뚜렷",
          "온화한날씨",
          "풍년"
        ]
      },
      {
        "id": "tail-20-q-45",
        "coreWord": "고령화사회",
        "word": "고령화사회",
        "answer": "노인인구증가, 연금고갈우려, 노인일자리필요",
        "targetWords": [
          "노인인구증가",
          "연금고갈우려",
          "노인일자리필요"
        ],
        "distractorPool": [
          "아동인구증가",
          "초등학교신설",
          "유치원부족"
        ]
      },
      {
        "id": "tail-20-q-46",
        "coreWord": "저출산문제",
        "word": "저출산문제",
        "answer": "출산율저하, 인구절벽, 노동력부족",
        "targetWords": [
          "출산율저하",
          "인구절벽",
          "노동력부족"
        ],
        "distractorPool": [
          "인구폭발",
          "다자녀가구",
          "교실부족"
        ]
      },
      {
        "id": "tail-20-q-47",
        "coreWord": "청년실업",
        "word": "청년실업",
        "answer": "일자리부족, 취업난, 스펙경쟁",
        "targetWords": [
          "일자리부족",
          "취업난",
          "스펙경쟁"
        ],
        "distractorPool": [
          "완전고용",
          "구인난",
          "일자리넘침"
        ]
      },
      {
        "id": "tail-20-q-48",
        "coreWord": "지역균형발전",
        "word": "지역균형발전",
        "answer": "수도권인구집중완화, 지방살리기, 공공기관이전",
        "targetWords": [
          "수도권인구집중완화",
          "지방살리기",
          "공공기관이전"
        ],
        "distractorPool": [
          "서울집중현상",
          "지방소멸",
          "수도권과밀"
        ]
      },
      {
        "id": "tail-20-q-49",
        "coreWord": "양성평등",
        "word": "양성평등",
        "answer": "성별임금격차해소, 유리천장깨기, 가사분담",
        "targetWords": [
          "성별임금격차해소",
          "유리천장깨기",
          "가사분담"
        ],
        "distractorPool": [
          "성역할고정",
          "남존여비",
          "여자는집안일"
        ]
      },
      {
        "id": "tail-20-q-50",
        "coreWord": "촉법소년논란",
        "word": "촉법소년논란",
        "answer": "소년법폐지주장, 강력범죄증가, 교화보다처벌",
        "targetWords": [
          "소년법폐지주장",
          "강력범죄증가",
          "교화보다처벌"
        ],
        "distractorPool": [
          "교화우선",
          "미성년자보호",
          "새출발기회"
        ]
      },
      {
        "id": "tail-20-q-51",
        "coreWord": "사형제도존폐",
        "word": "사형제도존폐",
        "answer": "생명권존중, 오판가능성, 인권문제",
        "targetWords": [
          "생명권존중",
          "오판가능성",
          "인권문제"
        ],
        "distractorPool": [
          "강력범죄예방",
          "피해자위로",
          "정의구현"
        ]
      },
      {
        "id": "tail-20-q-52",
        "coreWord": "낙태죄논란",
        "word": "낙태죄논란",
        "answer": "태아생명권, 여성의자기결정권, 찬반대립",
        "targetWords": [
          "태아생명권",
          "여성의자기결정권",
          "찬반대립"
        ],
        "distractorPool": [
          "만장일치",
          "합의완료",
          "의견일치"
        ]
      },
      {
        "id": "tail-20-q-53",
        "coreWord": "난민수용문제",
        "word": "난민수용문제",
        "answer": "인도주의적지원, 자국민안전우려, 국제사회책임",
        "targetWords": [
          "인도주의적지원",
          "자국민안전우려",
          "국제사회책임"
        ],
        "distractorPool": [
          "전쟁옹호",
          "테러지원",
          "국경폐쇄"
        ]
      },
      {
        "id": "tail-20-q-54",
        "coreWord": "기본소득제도",
        "word": "기본소득제도",
        "answer": "모든국민에게지급, 조건없는현금, 복지정책",
        "targetWords": [
          "모든국민에게지급",
          "조건없는현금",
          "복지정책"
        ],
        "distractorPool": [
          "선별적복지",
          "세금인하",
          "근로의욕저하"
        ]
      },
      {
        "id": "tail-20-q-55",
        "coreWord": "인터넷실명제",
        "word": "인터넷실명제",
        "answer": "악플방지, 표현의자유위축, 본인인증",
        "targetWords": [
          "악플방지",
          "표현의자유위축",
          "본인인증"
        ],
        "distractorPool": [
          "익명성보장",
          "자유로운소통",
          "사생활보호"
        ]
      },
      {
        "id": "tail-20-q-56",
        "coreWord": "알고리즘부작용",
        "word": "알고리즘부작용",
        "answer": "필터버블, 편향된정보, 확증편향",
        "targetWords": [
          "필터버블",
          "편향된정보",
          "확증편향"
        ],
        "distractorPool": [
          "다양한정보노출",
          "객관적시각",
          "균형잡힌뉴스"
        ]
      },
      {
        "id": "tail-20-q-57",
        "coreWord": "플라스틱규제",
        "word": "플라스틱규제",
        "answer": "일회용품금지, 종이빨대, 텀블러사용",
        "targetWords": [
          "일회용품금지",
          "종이빨대",
          "텀블러사용"
        ],
        "distractorPool": [
          "일회용컵사용",
          "비닐봉지무료제공",
          "플라스틱빨대"
        ]
      },
      {
        "id": "tail-20-q-58",
        "coreWord": "디지털소외",
        "word": "디지털소외",
        "answer": "키오스크사용어려움, 노인정보격차, 스마트폰맹",
        "targetWords": [
          "키오스크사용어려움",
          "노인정보격차",
          "스마트폰맹"
        ],
        "distractorPool": [
          "디지털네이티브",
          "정보화사회",
          "코딩교육"
        ]
      },
      {
        "id": "tail-20-q-59",
        "coreWord": "교권추락문제",
        "word": "교권추락문제",
        "answer": "선생님권위하락, 악성민원, 학생인권조례논란",
        "targetWords": [
          "선생님권위하락",
          "악성민원",
          "학생인권조례논란"
        ],
        "distractorPool": [
          "체벌부활",
          "체벌정당화",
          "학생인권무시"
        ]
      },
      {
        "id": "tail-20-q-60",
        "coreWord": "전세사기",
        "word": "전세사기",
        "answer": "깡통전세, 보증금미반환, 사회초년생피해",
        "targetWords": [
          "깡통전세",
          "보증금미반환",
          "사회초년생피해"
        ],
        "distractorPool": [
          "월세수익",
          "집값상승",
          "부동산투자"
        ]
      }
    ]
  },
  {
    "id": "tail-21",
    "title": "초등 18",
    "schoolLevelLabel": "18",
    "bandLabel": "초등",
    "descriptor": "과학과기술",
    "grammarFocus": "과학과기술",
    "goalCopy": "과학과기술 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 25,
    "questions": [
      {
        "id": "tail-21-q-01",
        "coreWord": "우주개발",
        "word": "우주개발",
        "answer": "우주탐사, 로켓, 인공위성",
        "targetWords": [
          "우주탐사",
          "로켓",
          "인공위성"
        ],
        "distractorPool": [
          "잠수함",
          "굴착기",
          "자동차"
        ]
      },
      {
        "id": "tail-21-q-02",
        "coreWord": "기후위기",
        "word": "기후위기",
        "answer": "지구온난화, 빙하녹음, 온실가스",
        "targetWords": [
          "지구온난화",
          "빙하녹음",
          "온실가스"
        ],
        "distractorPool": [
          "한파",
          "빙하기",
          "눈보라"
        ]
      },
      {
        "id": "tail-21-q-03",
        "coreWord": "컴퓨터두뇌",
        "word": "컴퓨터두뇌",
        "answer": "인공지능, 딥러닝, 챗지피티",
        "targetWords": [
          "인공지능",
          "딥러닝",
          "챗지피티"
        ],
        "distractorPool": [
          "주판",
          "타자기",
          "계산기"
        ]
      },
      {
        "id": "tail-21-q-04",
        "coreWord": "해양오염",
        "word": "해양오염",
        "answer": "미세플라스틱, 쓰레기, 생태계위협",
        "targetWords": [
          "미세플라스틱",
          "쓰레기",
          "생태계위협"
        ],
        "distractorPool": [
          "산림욕",
          "공기청정기",
          "정수기"
        ]
      },
      {
        "id": "tail-21-q-05",
        "coreWord": "대체자원",
        "word": "대체자원",
        "answer": "신재생에너지, 태양광, 풍력",
        "targetWords": [
          "신재생에너지",
          "태양광",
          "풍력"
        ],
        "distractorPool": [
          "석탄",
          "석유",
          "화석연료"
        ]
      },
      {
        "id": "tail-21-q-06",
        "coreWord": "전염병",
        "word": "전염병",
        "answer": "바이러스, 감염, 백신",
        "targetWords": [
          "바이러스",
          "감염",
          "백신"
        ],
        "distractorPool": [
          "골절",
          "타박상",
          "화상"
        ]
      },
      {
        "id": "tail-21-q-07",
        "coreWord": "입체인쇄",
        "word": "입체인쇄",
        "answer": "삼디프린터, 적층기술, 신기술",
        "targetWords": [
          "삼디프린터",
          "적층기술",
          "신기술"
        ],
        "distractorPool": [
          "복사기",
          "스캐너",
          "파쇄기"
        ]
      },
      {
        "id": "tail-21-q-08",
        "coreWord": "가상세계",
        "word": "가상세계",
        "answer": "메타버스, 가상현실, 아바타",
        "targetWords": [
          "메타버스",
          "가상현실",
          "아바타"
        ],
        "distractorPool": [
          "현실세계",
          "자연",
          "우주"
        ]
      },
      {
        "id": "tail-21-q-09",
        "coreWord": "강한중력",
        "word": "강한중력",
        "answer": "블랙홀, 우주, 빛흡수",
        "targetWords": [
          "블랙홀",
          "우주",
          "빛흡수"
        ],
        "distractorPool": [
          "태양",
          "달",
          "구름"
        ]
      },
      {
        "id": "tail-21-q-10",
        "coreWord": "땅의흔들림",
        "word": "땅의흔들림",
        "answer": "지진, 규모, 쓰나미",
        "targetWords": [
          "지진",
          "규모",
          "쓰나미"
        ],
        "distractorPool": [
          "폭우",
          "가뭄",
          "태풍"
        ]
      },
      {
        "id": "tail-21-q-11",
        "coreWord": "무인운전",
        "word": "무인운전",
        "answer": "자율주행, 센서, 인공지능",
        "targetWords": [
          "자율주행",
          "센서",
          "인공지능"
        ],
        "distractorPool": [
          "마차",
          "인력거",
          "자전거"
        ]
      },
      {
        "id": "tail-21-q-12",
        "coreWord": "생명공학",
        "word": "생명공학",
        "answer": "유전자가위, 디엔에이, 치료",
        "targetWords": [
          "유전자가위",
          "디엔에이",
          "치료"
        ],
        "distractorPool": [
          "종이접기",
          "가위질",
          "풀칠"
        ]
      },
      {
        "id": "tail-21-q-13",
        "coreWord": "지구의움직임",
        "word": "지구의움직임",
        "answer": "자전과공전, 낮과밤, 계절변화",
        "targetWords": [
          "자전과공전",
          "낮과밤",
          "계절변화"
        ],
        "distractorPool": [
          "우주선",
          "로켓",
          "인공위성"
        ]
      },
      {
        "id": "tail-21-q-14",
        "coreWord": "빛의현상",
        "word": "빛의현상",
        "answer": "굴절, 무지개, 프리즘",
        "targetWords": [
          "굴절",
          "무지개",
          "프리즘"
        ],
        "distractorPool": [
          "그림자",
          "메아리",
          "소리"
        ]
      },
      {
        "id": "tail-21-q-15",
        "coreWord": "식물에너지",
        "word": "식물에너지",
        "answer": "광합성, 햇빛, 이산화탄소",
        "targetWords": [
          "광합성",
          "햇빛",
          "이산화탄소"
        ],
        "distractorPool": [
          "동물",
          "소화",
          "배설"
        ]
      },
      {
        "id": "tail-21-q-16",
        "coreWord": "무인항공기",
        "word": "무인항공기",
        "answer": "드론, 촬영, 배달",
        "targetWords": [
          "드론",
          "촬영",
          "배달"
        ],
        "distractorPool": [
          "여객기",
          "헬리콥터",
          "기구"
        ]
      },
      {
        "id": "tail-21-q-17",
        "coreWord": "인체보안",
        "word": "인체보안",
        "answer": "생체인식, 지문, 홍채",
        "targetWords": [
          "생체인식",
          "지문",
          "홍채"
        ],
        "distractorPool": [
          "비밀번호",
          "열쇠",
          "자물쇠"
        ]
      },
      {
        "id": "tail-21-q-18",
        "coreWord": "우주거리",
        "word": "우주거리",
        "answer": "광년, 빛의속도, 천문학",
        "targetWords": [
          "광년",
          "빛의속도",
          "천문학"
        ],
        "distractorPool": [
          "미터",
          "센티미터",
          "밀리미터"
        ]
      },
      {
        "id": "tail-21-q-19",
        "coreWord": "나노기술",
        "word": "나노기술",
        "answer": "원자단위, 신소재, 미세조작",
        "targetWords": [
          "원자단위",
          "신소재",
          "미세조작"
        ],
        "distractorPool": [
          "거대건축",
          "토목",
          "댐건설"
        ]
      },
      {
        "id": "tail-21-q-20",
        "coreWord": "진공상태",
        "word": "진공상태",
        "answer": "공기없음, 우주공간, 소리안들림",
        "targetWords": [
          "공기없음",
          "우주공간",
          "소리안들림"
        ],
        "distractorPool": [
          "태풍",
          "바람",
          "산소"
        ]
      },
      {
        "id": "tail-21-q-21",
        "coreWord": "온실가스",
        "word": "온실가스",
        "answer": "이산화탄소, 메탄, 프레온가스",
        "targetWords": [
          "이산화탄소",
          "메탄",
          "프레온가스"
        ],
        "distractorPool": [
          "산소",
          "질소",
          "수소"
        ]
      },
      {
        "id": "tail-21-q-22",
        "coreWord": "오존층파괴",
        "word": "오존층파괴",
        "answer": "자외선노출, 피부암위험, 프레온가스",
        "targetWords": [
          "자외선노출",
          "피부암위험",
          "프레온가스"
        ],
        "distractorPool": [
          "미세먼지",
          "산성비",
          "황사"
        ]
      },
      {
        "id": "tail-21-q-23",
        "coreWord": "생태계위협",
        "word": "생태계위협",
        "answer": "종의멸종, 서식지파괴, 외래종침입",
        "targetWords": [
          "종의멸종",
          "서식지파괴",
          "외래종침입"
        ],
        "distractorPool": [
          "자연보호",
          "생물다양성",
          "공존"
        ]
      },
      {
        "id": "tail-21-q-24",
        "coreWord": "우주쓰레기",
        "word": "우주쓰레기",
        "answer": "인공위성잔해, 로켓파편, 우주충돌위험",
        "targetWords": [
          "인공위성잔해",
          "로켓파편",
          "우주충돌위험"
        ],
        "distractorPool": [
          "운석",
          "소행성",
          "별똥별"
        ]
      },
      {
        "id": "tail-21-q-25",
        "coreWord": "지진규모",
        "word": "지진규모",
        "answer": "진도, 리히터규모, 파괴력",
        "targetWords": [
          "진도",
          "리히터규모",
          "파괴력"
        ],
        "distractorPool": [
          "온도",
          "습도",
          "강수량"
        ]
      },
      {
        "id": "tail-21-q-26",
        "coreWord": "화산현상",
        "word": "화산현상",
        "answer": "마그마, 용암, 화산재",
        "targetWords": [
          "마그마",
          "용암",
          "화산재"
        ],
        "distractorPool": [
          "지진해일",
          "쓰나미",
          "단층"
        ]
      },
      {
        "id": "tail-21-q-27",
        "coreWord": "알파고",
        "word": "알파고",
        "answer": "바둑인공지능, 딥러닝, 이세돌승리",
        "targetWords": [
          "바둑인공지능",
          "딥러닝",
          "이세돌승리"
        ],
        "distractorPool": [
          "체스",
          "장기",
          "오목"
        ]
      },
      {
        "id": "tail-21-q-28",
        "coreWord": "빅데이터",
        "word": "빅데이터",
        "answer": "방대한정보, 데이터분석, 맞춤형추천",
        "targetWords": [
          "방대한정보",
          "데이터분석",
          "맞춤형추천"
        ],
        "distractorPool": [
          "플로피디스크",
          "유에스비",
          "씨디"
        ]
      },
      {
        "id": "tail-21-q-29",
        "coreWord": "사물인터넷",
        "word": "사물인터넷",
        "answer": "아이오티, 가전제품연결, 스마트홈",
        "targetWords": [
          "아이오티",
          "가전제품연결",
          "스마트홈"
        ],
        "distractorPool": [
          "유선전화기",
          "타자기",
          "아날로그"
        ]
      },
      {
        "id": "tail-21-q-30",
        "coreWord": "웨어러블기기",
        "word": "웨어러블기기",
        "answer": "스마트워치, 스마트안경, 심박수측정",
        "targetWords": [
          "스마트워치",
          "스마트안경",
          "심박수측정"
        ],
        "distractorPool": [
          "데스크탑",
          "벽걸이티비",
          "냉장고"
        ]
      },
      {
        "id": "tail-21-q-31",
        "coreWord": "태양광발전",
        "word": "태양광발전",
        "answer": "태양전지판, 친환경에너지, 날씨영향받음",
        "targetWords": [
          "태양전지판",
          "친환경에너지",
          "날씨영향받음"
        ],
        "distractorPool": [
          "석탄발전",
          "원자력발전",
          "화력발전"
        ]
      },
      {
        "id": "tail-21-q-32",
        "coreWord": "줄기세포",
        "word": "줄기세포",
        "answer": "만능세포, 난치병치료, 장기재생",
        "targetWords": [
          "만능세포",
          "난치병치료",
          "장기재생"
        ],
        "distractorPool": [
          "적혈구",
          "백혈구",
          "혈소판"
        ]
      },
      {
        "id": "tail-21-q-33",
        "coreWord": "항생제내성",
        "word": "항생제내성",
        "answer": "슈퍼박테리아, 약물남용부작용, 치료어려움",
        "targetWords": [
          "슈퍼박테리아",
          "약물남용부작용",
          "치료어려움"
        ],
        "distractorPool": [
          "백신예방",
          "면역력강화",
          "영양제"
        ]
      },
      {
        "id": "tail-21-q-34",
        "coreWord": "스페이스엑스",
        "word": "스페이스엑스",
        "answer": "재사용로켓, 엘론머스크, 우주비용절감",
        "targetWords": [
          "재사용로켓",
          "엘론머스크",
          "우주비용절감"
        ],
        "distractorPool": [
          "나사",
          "항우연",
          "유럽우주국"
        ]
      },
      {
        "id": "tail-21-q-35",
        "coreWord": "화성탐사",
        "word": "화성탐사",
        "answer": "제이의지구, 물흔적발견, 화성탐사로버",
        "targetWords": [
          "제이의지구",
          "물흔적발견",
          "화성탐사로버"
        ],
        "distractorPool": [
          "금성",
          "수성",
          "목성"
        ]
      },
      {
        "id": "tail-21-q-36",
        "coreWord": "국제우주정거장",
        "word": "국제우주정거장",
        "answer": "무중력실험, 우주인체류, 지구궤도",
        "targetWords": [
          "무중력실험",
          "우주인체류",
          "지구궤도"
        ],
        "distractorPool": [
          "달기지",
          "화성기지",
          "블랙홀탐사"
        ]
      },
      {
        "id": "tail-21-q-37",
        "coreWord": "태양계행성",
        "word": "태양계행성",
        "answer": "수성, 목성, 토성",
        "targetWords": [
          "수성",
          "목성",
          "토성"
        ],
        "distractorPool": [
          "명왕성",
          "달",
          "태양"
        ]
      },
      {
        "id": "tail-21-q-38",
        "coreWord": "뇌컴퓨터연결",
        "word": "뇌컴퓨터연결",
        "answer": "생각으로조종, 비씨아이, 신경과학",
        "targetWords": [
          "생각으로조종",
          "비씨아이",
          "신경과학"
        ],
        "distractorPool": [
          "키보드입력",
          "마우스클릭",
          "터치스크린"
        ]
      },
      {
        "id": "tail-21-q-39",
        "coreWord": "암호화폐",
        "word": "암호화폐",
        "answer": "비트코인, 블록체인, 가상화폐",
        "targetWords": [
          "비트코인",
          "블록체인",
          "가상화폐"
        ],
        "distractorPool": [
          "한국은행",
          "지폐",
          "동전"
        ]
      },
      {
        "id": "tail-21-q-40",
        "coreWord": "산업용로봇",
        "word": "산업용로봇",
        "answer": "공장자동화, 대량생산, 생산성향상",
        "targetWords": [
          "공장자동화",
          "대량생산",
          "생산성향상"
        ],
        "distractorPool": [
          "반려로봇",
          "돌봄로봇",
          "청소로봇"
        ]
      },
      {
        "id": "tail-21-q-41",
        "coreWord": "돌봄로봇",
        "word": "돌봄로봇",
        "answer": "노인말벗, 건강체크, 외로움감소",
        "targetWords": [
          "노인말벗",
          "건강체크",
          "외로움감소"
        ],
        "distractorPool": [
          "용접로봇",
          "조립로봇",
          "무인택배"
        ]
      },
      {
        "id": "tail-21-q-42",
        "coreWord": "수소자동차",
        "word": "수소자동차",
        "answer": "친환경차, 물만배출, 수소연료전지",
        "targetWords": [
          "친환경차",
          "물만배출",
          "수소연료전지"
        ],
        "distractorPool": [
          "경유차",
          "휘발유차",
          "디젤차"
        ]
      },
      {
        "id": "tail-21-q-43",
        "coreWord": "원자력발전",
        "word": "원자력발전",
        "answer": "우라늄, 대용량전기, 방사능위험",
        "targetWords": [
          "우라늄",
          "대용량전기",
          "방사능위험"
        ],
        "distractorPool": [
          "풍력발전",
          "조력발전",
          "지열발전"
        ]
      },
      {
        "id": "tail-21-q-44",
        "coreWord": "해수담수화",
        "word": "해수담수화",
        "answer": "바닷물을식수로, 소금기제거, 물부족해결",
        "targetWords": [
          "바닷물을식수로",
          "소금기제거",
          "물부족해결"
        ],
        "distractorPool": [
          "오폐수정화",
          "하수처리",
          "정수기"
        ]
      },
      {
        "id": "tail-21-q-45",
        "coreWord": "공룡멸종가설",
        "word": "공룡멸종가설",
        "answer": "소행성충돌, 기후변화, 빙하기",
        "targetWords": [
          "소행성충돌",
          "기후변화",
          "빙하기"
        ],
        "distractorPool": [
          "외계인침공",
          "화산재",
          "질병"
        ]
      },
      {
        "id": "tail-21-q-46",
        "coreWord": "판구조론",
        "word": "판구조론",
        "answer": "대륙이동, 지진발생원인, 판의경계",
        "targetWords": [
          "대륙이동",
          "지진발생원인",
          "판의경계"
        ],
        "distractorPool": [
          "지구평평설",
          "지동설",
          "천동설"
        ]
      },
      {
        "id": "tail-21-q-47",
        "coreWord": "인간게놈프로젝트",
        "word": "인간게놈프로젝트",
        "answer": "디엔에이해독, 유전병연구, 맞춤형치료",
        "targetWords": [
          "디엔에이해독",
          "유전병연구",
          "맞춤형치료"
        ],
        "distractorPool": [
          "우주탐사",
          "해저탐험",
          "심해연구"
        ]
      },
      {
        "id": "tail-21-q-48",
        "coreWord": "미생물종류",
        "word": "미생물종류",
        "answer": "세균, 바이러스, 곰팡이",
        "targetWords": [
          "세균",
          "바이러스",
          "곰팡이"
        ],
        "distractorPool": [
          "개미",
          "거미",
          "지렁이"
        ]
      },
      {
        "id": "tail-21-q-49",
        "coreWord": "유익한미생물",
        "word": "유익한미생물",
        "answer": "유산균, 효모, 발효균",
        "targetWords": [
          "유산균",
          "효모",
          "발효균"
        ],
        "distractorPool": [
          "식중독균",
          "콜레라균",
          "코로나바이러스"
        ]
      },
      {
        "id": "tail-21-q-50",
        "coreWord": "달의공전",
        "word": "달의공전",
        "answer": "달모양변화, 초승달, 보름달",
        "targetWords": [
          "달모양변화",
          "초승달",
          "보름달"
        ],
        "distractorPool": [
          "낮과밤",
          "계절변화",
          "일식"
        ]
      },
      {
        "id": "tail-21-q-51",
        "coreWord": "지구의자전",
        "word": "지구의자전",
        "answer": "낮과밤생김, 하루일주, 별의일주운동",
        "targetWords": [
          "낮과밤생김",
          "하루일주",
          "별의일주운동"
        ],
        "distractorPool": [
          "계절변화",
          "일년주기",
          "태양공전"
        ]
      },
      {
        "id": "tail-21-q-52",
        "coreWord": "조수간만",
        "word": "조수간만",
        "answer": "밀물, 썰물, 달의인력",
        "targetWords": [
          "밀물",
          "썰물",
          "달의인력"
        ],
        "distractorPool": [
          "해류",
          "파도",
          "쓰나미"
        ]
      },
      {
        "id": "tail-21-q-53",
        "coreWord": "계절의원인",
        "word": "계절의원인",
        "answer": "지구자전축기울어짐, 태양빛받는양다름, 지구공전",
        "targetWords": [
          "지구자전축기울어짐",
          "태양빛받는양다름",
          "지구공전"
        ],
        "distractorPool": [
          "달의인력",
          "지구자전",
          "별의이동"
        ]
      },
      {
        "id": "tail-21-q-54",
        "coreWord": "열전달",
        "word": "열전달",
        "answer": "전도, 대류, 복사",
        "targetWords": [
          "전도",
          "대류",
          "복사"
        ],
        "distractorPool": [
          "반사",
          "굴절",
          "분산"
        ]
      },
      {
        "id": "tail-21-q-55",
        "coreWord": "자기부상열차",
        "word": "자기부상열차",
        "answer": "자석의밀어내는힘, 마찰력없음, 초고속열차",
        "targetWords": [
          "자석의밀어내는힘",
          "마찰력없음",
          "초고속열차"
        ],
        "distractorPool": [
          "증기기관",
          "석탄원료",
          "바퀴마찰"
        ]
      },
      {
        "id": "tail-21-q-56",
        "coreWord": "소리의전달",
        "word": "소리의전달",
        "answer": "매질필요, 공기진동, 파동",
        "targetWords": [
          "매질필요",
          "공기진동",
          "파동"
        ],
        "distractorPool": [
          "진공전달",
          "빛의속도",
          "전자기파"
        ]
      },
      {
        "id": "tail-21-q-57",
        "coreWord": "상태변화",
        "word": "상태변화",
        "answer": "고체, 액체, 기체",
        "targetWords": [
          "고체",
          "액체",
          "기체"
        ],
        "distractorPool": [
          "원자",
          "분자",
          "세포"
        ]
      },
      {
        "id": "tail-21-q-58",
        "coreWord": "물의기화",
        "word": "물의기화",
        "answer": "수증기됨, 부피팽창, 백도에서끓음",
        "targetWords": [
          "수증기됨",
          "부피팽창",
          "백도에서끓음"
        ],
        "distractorPool": [
          "얼음됨",
          "응고",
          "영하온도"
        ]
      },
      {
        "id": "tail-21-q-59",
        "coreWord": "혈액순환",
        "word": "혈액순환",
        "answer": "심장펌프질, 동맥, 정맥",
        "targetWords": [
          "심장펌프질",
          "동맥",
          "정맥"
        ],
        "distractorPool": [
          "소화과정",
          "위장",
          "대장"
        ]
      },
      {
        "id": "tail-21-q-60",
        "coreWord": "소화기관",
        "word": "소화기관",
        "answer": "위, 소장, 대장",
        "targetWords": [
          "위",
          "소장",
          "대장"
        ],
        "distractorPool": [
          "심장",
          "폐",
          "뇌"
        ]
      }
    ]
  },
  {
    "id": "tail-22",
    "title": "초등 19",
    "schoolLevelLabel": "19",
    "bandLabel": "초등",
    "descriptor": "역사와문화",
    "grammarFocus": "역사와문화",
    "goalCopy": "역사와문화 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 25,
    "questions": [
      {
        "id": "tail-22-q-01",
        "coreWord": "세종대왕",
        "word": "세종대왕",
        "answer": "훈민정음, 한글, 창제",
        "targetWords": [
          "훈민정음",
          "한글",
          "창제"
        ],
        "distractorPool": [
          "이순신",
          "거북선",
          "거중기"
        ]
      },
      {
        "id": "tail-22-q-02",
        "coreWord": "임진왜란",
        "word": "임진왜란",
        "answer": "이순신, 거북선, 의병",
        "targetWords": [
          "이순신",
          "거북선",
          "의병"
        ],
        "distractorPool": [
          "광개토대왕",
          "고구려",
          "신라"
        ]
      },
      {
        "id": "tail-22-q-03",
        "coreWord": "일제강점기",
        "word": "일제강점기",
        "answer": "독립운동, 유관순, 삼일운동",
        "targetWords": [
          "독립운동",
          "유관순",
          "삼일운동"
        ],
        "distractorPool": [
          "흥선대원군",
          "척화비",
          "아관파천"
        ]
      },
      {
        "id": "tail-22-q-04",
        "coreWord": "고려유산",
        "word": "고려유산",
        "answer": "팔만대장경, 청자, 금속활자",
        "targetWords": [
          "팔만대장경",
          "청자",
          "금속활자"
        ],
        "distractorPool": [
          "백자",
          "한글",
          "경복궁"
        ]
      },
      {
        "id": "tail-22-q-05",
        "coreWord": "고구려기상",
        "word": "고구려기상",
        "answer": "광개토대왕, 만주, 고분벽화",
        "targetWords": [
          "광개토대왕",
          "만주",
          "고분벽화"
        ],
        "distractorPool": [
          "백제",
          "신라",
          "가야"
        ]
      },
      {
        "id": "tail-22-q-06",
        "coreWord": "신라통일",
        "word": "신라통일",
        "answer": "불국사, 화랑도, 삼국통일",
        "targetWords": [
          "불국사",
          "화랑도",
          "삼국통일"
        ],
        "distractorPool": [
          "발해",
          "고구려",
          "백제"
        ]
      },
      {
        "id": "tail-22-q-07",
        "coreWord": "조선후기학문",
        "word": "조선후기학문",
        "answer": "실학, 정약용, 거중기",
        "targetWords": [
          "실학",
          "정약용",
          "거중기"
        ],
        "distractorPool": [
          "성리학",
          "과거시험",
          "서당"
        ]
      },
      {
        "id": "tail-22-q-08",
        "coreWord": "서민예술",
        "word": "서민예술",
        "answer": "탈춤, 풍자, 해학",
        "targetWords": [
          "탈춤",
          "풍자",
          "해학"
        ],
        "distractorPool": [
          "궁중음악",
          "종묘제례악",
          "시조"
        ]
      },
      {
        "id": "tail-22-q-09",
        "coreWord": "나라되찾기",
        "word": "나라되찾기",
        "answer": "광복, 일구사오년, 해방",
        "targetWords": [
          "광복",
          "일구사오년",
          "해방"
        ],
        "distractorPool": [
          "임진왜란",
          "병자호란",
          "한국전쟁"
        ]
      },
      {
        "id": "tail-22-q-10",
        "coreWord": "민주주의발전",
        "word": "민주주의발전",
        "answer": "사일구혁명, 오일팔민주화운동, 육월항쟁",
        "targetWords": [
          "사일구혁명",
          "오일팔민주화운동",
          "육월항쟁"
        ],
        "distractorPool": [
          "병인양요",
          "신미양요",
          "갑신정변"
        ]
      },
      {
        "id": "tail-22-q-11",
        "coreWord": "전통옷",
        "word": "전통옷",
        "answer": "한복, 저고리, 치마",
        "targetWords": [
          "한복",
          "저고리",
          "치마"
        ],
        "distractorPool": [
          "정장",
          "드레스",
          "청바지"
        ]
      },
      {
        "id": "tail-22-q-12",
        "coreWord": "겨울채비",
        "word": "겨울채비",
        "answer": "김장, 김치, 품앗이",
        "targetWords": [
          "김장",
          "김치",
          "품앗이"
        ],
        "distractorPool": [
          "송편",
          "떡국",
          "팥빙수"
        ]
      },
      {
        "id": "tail-22-q-13",
        "coreWord": "전통소리",
        "word": "전통소리",
        "answer": "판소리, 소리꾼, 고수",
        "targetWords": [
          "판소리",
          "소리꾼",
          "고수"
        ],
        "distractorPool": [
          "피아노",
          "바이올린",
          "오케스트라"
        ]
      },
      {
        "id": "tail-22-q-14",
        "coreWord": "전통집",
        "word": "전통집",
        "answer": "한옥, 기와, 온돌",
        "targetWords": [
          "한옥",
          "기와",
          "온돌"
        ],
        "distractorPool": [
          "아파트",
          "빌라",
          "빌딩"
        ]
      },
      {
        "id": "tail-22-q-15",
        "coreWord": "세계유산",
        "word": "세계유산",
        "answer": "유네스코, 창덕궁, 석굴암",
        "targetWords": [
          "유네스코",
          "창덕궁",
          "석굴암"
        ],
        "distractorPool": [
          "에펠탑",
          "자유의여신상",
          "피라미드"
        ]
      },
      {
        "id": "tail-22-q-16",
        "coreWord": "고조선",
        "word": "고조선",
        "answer": "단군왕검, 홍익인간, 팔조법",
        "targetWords": [
          "단군왕검",
          "홍익인간",
          "팔조법"
        ],
        "distractorPool": [
          "세종대왕",
          "이순신",
          "장영실"
        ]
      },
      {
        "id": "tail-22-q-17",
        "coreWord": "선사시대",
        "word": "선사시대",
        "answer": "고인돌, 빗살무늬토기, 움집",
        "targetWords": [
          "고인돌",
          "빗살무늬토기",
          "움집"
        ],
        "distractorPool": [
          "아파트",
          "스마트폰",
          "비행기"
        ]
      },
      {
        "id": "tail-22-q-18",
        "coreWord": "명절놀이",
        "word": "명절놀이",
        "answer": "윷놀이, 널뛰기, 제기차기",
        "targetWords": [
          "윷놀이",
          "널뛰기",
          "제기차기"
        ],
        "distractorPool": [
          "컴퓨터게임",
          "보드게임",
          "방탈출"
        ]
      },
      {
        "id": "tail-22-q-19",
        "coreWord": "의학서적",
        "word": "의학서적",
        "answer": "동의보감, 허준, 한의학",
        "targetWords": [
          "동의보감",
          "허준",
          "한의학"
        ],
        "distractorPool": [
          "수학의정석",
          "영어사전",
          "국어사전"
        ]
      },
      {
        "id": "tail-22-q-20",
        "coreWord": "수도한양",
        "word": "수도한양",
        "answer": "숭례문, 경복궁, 한강",
        "targetWords": [
          "숭례문",
          "경복궁",
          "한강"
        ],
        "distractorPool": [
          "불국사",
          "첨성대",
          "석굴암"
        ]
      },
      {
        "id": "tail-22-q-21",
        "coreWord": "석굴암",
        "word": "석굴암",
        "answer": "본존불, 화강암조각, 통일신라미술",
        "targetWords": [
          "본존불",
          "화강암조각",
          "통일신라미술"
        ],
        "distractorPool": [
          "피라미드",
          "스핑크스",
          "만리장성"
        ]
      },
      {
        "id": "tail-22-q-22",
        "coreWord": "첨성대",
        "word": "첨성대",
        "answer": "별관측, 선덕여왕, 신라천문학",
        "targetWords": [
          "별관측",
          "선덕여왕",
          "신라천문학"
        ],
        "distractorPool": [
          "다보탑",
          "석가탑",
          "에펠탑"
        ]
      },
      {
        "id": "tail-22-q-23",
        "coreWord": "거북선",
        "word": "거북선",
        "answer": "철갑선, 이순신, 학익진",
        "targetWords": [
          "철갑선",
          "이순신",
          "학익진"
        ],
        "distractorPool": [
          "항공모함",
          "잠수함",
          "크루즈"
        ]
      },
      {
        "id": "tail-22-q-24",
        "coreWord": "직지심체요절",
        "word": "직지심체요절",
        "answer": "금속활자, 청주흥덕사, 유네스코기록유산",
        "targetWords": [
          "금속활자",
          "청주흥덕사",
          "유네스코기록유산"
        ],
        "distractorPool": [
          "동의보감",
          "난중일기",
          "목민심서"
        ]
      },
      {
        "id": "tail-22-q-25",
        "coreWord": "훈민정음",
        "word": "훈민정음",
        "answer": "해례본, 집현전, 세종대왕",
        "targetWords": [
          "해례본",
          "집현전",
          "세종대왕"
        ],
        "distractorPool": [
          "한자",
          "가나",
          "알파벳"
        ]
      },
      {
        "id": "tail-22-q-26",
        "coreWord": "다보탑",
        "word": "다보탑",
        "answer": "석가탑, 쌍탑, 불국사",
        "targetWords": [
          "석가탑",
          "쌍탑",
          "불국사"
        ],
        "distractorPool": [
          "첨성대",
          "황룡사",
          "미륵사"
        ]
      },
      {
        "id": "tail-22-q-27",
        "coreWord": "팔만대장경",
        "word": "팔만대장경",
        "answer": "해인사, 장경판전, 대장경판",
        "targetWords": [
          "해인사",
          "장경판전",
          "대장경판"
        ],
        "distractorPool": [
          "일기장",
          "동화책",
          "수첩"
        ]
      },
      {
        "id": "tail-22-q-28",
        "coreWord": "수원화성",
        "word": "수원화성",
        "answer": "거중기, 정약용, 정조",
        "targetWords": [
          "거중기",
          "정약용",
          "정조"
        ],
        "distractorPool": [
          "경복궁",
          "덕수궁",
          "창경궁"
        ]
      },
      {
        "id": "tail-22-q-29",
        "coreWord": "경복궁",
        "word": "경복궁",
        "answer": "근정전, 경회루, 조선법궁",
        "targetWords": [
          "근정전",
          "경회루",
          "조선법궁"
        ],
        "distractorPool": [
          "창덕궁",
          "창경궁",
          "덕수궁"
        ]
      },
      {
        "id": "tail-22-q-30",
        "coreWord": "종묘제례악",
        "word": "종묘제례악",
        "answer": "무형문화유산, 제례음악, 일무",
        "targetWords": [
          "무형문화유산",
          "제례음악",
          "일무"
        ],
        "distractorPool": [
          "힙합",
          "발라드",
          "댄스곡"
        ]
      },
      {
        "id": "tail-22-q-31",
        "coreWord": "비빔밥",
        "word": "비빔밥",
        "answer": "나물, 고추장, 전주",
        "targetWords": [
          "나물",
          "고추장",
          "전주"
        ],
        "distractorPool": [
          "스파게티",
          "피자",
          "햄버거"
        ]
      },
      {
        "id": "tail-22-q-32",
        "coreWord": "불고기",
        "word": "불고기",
        "answer": "양념육, 석쇠구이, 한국대표음식",
        "targetWords": [
          "양념육",
          "석쇠구이",
          "한국대표음식"
        ],
        "distractorPool": [
          "초밥",
          "딤섬",
          "타코"
        ]
      },
      {
        "id": "tail-22-q-33",
        "coreWord": "독도",
        "word": "독도",
        "answer": "울릉도, 동도서도, 우리땅",
        "targetWords": [
          "울릉도",
          "동도서도",
          "우리땅"
        ],
        "distractorPool": [
          "제주도",
          "거제도",
          "강화도"
        ]
      },
      {
        "id": "tail-22-q-34",
        "coreWord": "무궁화",
        "word": "무궁화",
        "answer": "국화, 영원히피고지는꽃, 삼천리",
        "targetWords": [
          "국화",
          "영원히피고지는꽃",
          "삼천리"
        ],
        "distractorPool": [
          "장미",
          "튤립",
          "해바라기"
        ]
      },
      {
        "id": "tail-22-q-35",
        "coreWord": "태극기",
        "word": "태극기",
        "answer": "건곤감리, 흰색바탕, 국기",
        "targetWords": [
          "건곤감리",
          "흰색바탕",
          "국기"
        ],
        "distractorPool": [
          "일장기",
          "성조기",
          "오성홍기"
        ]
      },
      {
        "id": "tail-22-q-36",
        "coreWord": "애국가",
        "word": "애국가",
        "answer": "안익태, 동해물과백두산, 국가",
        "targetWords": [
          "안익태",
          "동해물과백두산",
          "국가"
        ],
        "distractorPool": [
          "동요",
          "만화주제가",
          "유행가"
        ]
      },
      {
        "id": "tail-22-q-37",
        "coreWord": "고조선건국",
        "word": "고조선건국",
        "answer": "기원전이삼삼삼년, 단군왕검, 아사달",
        "targetWords": [
          "기원전이삼삼삼년",
          "단군왕검",
          "아사달"
        ],
        "distractorPool": [
          "조선건국",
          "고려건국",
          "신라건국"
        ]
      },
      {
        "id": "tail-22-q-38",
        "coreWord": "삼국시대",
        "word": "삼국시대",
        "answer": "고구려백제신라, 철기문화, 영토전쟁",
        "targetWords": [
          "고구려백제신라",
          "철기문화",
          "영토전쟁"
        ],
        "distractorPool": [
          "조선시대",
          "고려시대",
          "석기시대"
        ]
      },
      {
        "id": "tail-22-q-39",
        "coreWord": "고려건국",
        "word": "고려건국",
        "answer": "왕건, 송악, 태조",
        "targetWords": [
          "왕건",
          "송악",
          "태조"
        ],
        "distractorPool": [
          "이성계",
          "박혁거세",
          "온조"
        ]
      },
      {
        "id": "tail-22-q-40",
        "coreWord": "조선건국",
        "word": "조선건국",
        "answer": "이성계, 한양, 유교국가",
        "targetWords": [
          "이성계",
          "한양",
          "유교국가"
        ],
        "distractorPool": [
          "왕건",
          "김유신",
          "계백"
        ]
      },
      {
        "id": "tail-22-q-41",
        "coreWord": "실학사상",
        "word": "실학사상",
        "answer": "정약용, 박지원, 실생활도움",
        "targetWords": [
          "정약용",
          "박지원",
          "실생활도움"
        ],
        "distractorPool": [
          "성리학",
          "불교",
          "도교"
        ]
      },
      {
        "id": "tail-22-q-42",
        "coreWord": "암행어사",
        "word": "암행어사",
        "answer": "마패, 왕의특사, 탐관오리응징",
        "targetWords": [
          "마패",
          "왕의특사",
          "탐관오리응징"
        ],
        "distractorPool": [
          "경찰",
          "소방관",
          "의사"
        ]
      },
      {
        "id": "tail-22-q-43",
        "coreWord": "서당교육",
        "word": "서당교육",
        "answer": "훈장님, 천자문, 회초리",
        "targetWords": [
          "훈장님",
          "천자문",
          "회초리"
        ],
        "distractorPool": [
          "대학교",
          "연구소",
          "도서관"
        ]
      },
      {
        "id": "tail-22-q-44",
        "coreWord": "한글반포",
        "word": "한글반포",
        "answer": "일사사육년, 백성을위한글, 창제원리",
        "targetWords": [
          "일사사육년",
          "백성을위한글",
          "창제원리"
        ],
        "distractorPool": [
          "한자보급",
          "영어교육",
          "일어학습"
        ]
      },
      {
        "id": "tail-22-q-45",
        "coreWord": "유교문화",
        "word": "유교문화",
        "answer": "효도, 충성, 예절",
        "targetWords": [
          "효도",
          "충성",
          "예절"
        ],
        "distractorPool": [
          "살생",
          "투쟁",
          "반항"
        ]
      },
      {
        "id": "tail-22-q-46",
        "coreWord": "불교문화",
        "word": "불교문화",
        "answer": "사찰, 불상, 탑",
        "targetWords": [
          "사찰",
          "불상",
          "탑"
        ],
        "distractorPool": [
          "성당",
          "교회",
          "향교"
        ]
      },
      {
        "id": "tail-22-q-47",
        "coreWord": "도자기기술",
        "word": "도자기기술",
        "answer": "상감청자, 순백자, 가마터",
        "targetWords": [
          "상감청자",
          "순백자",
          "가마터"
        ],
        "distractorPool": [
          "플라스틱",
          "유리병",
          "캔"
        ]
      },
      {
        "id": "tail-22-q-48",
        "coreWord": "금속활자",
        "word": "금속활자",
        "answer": "상정고금예문, 직지, 인쇄혁명",
        "targetWords": [
          "상정고금예문",
          "직지",
          "인쇄혁명"
        ],
        "distractorPool": [
          "붓글씨",
          "타자기",
          "워드프로세서"
        ]
      },
      {
        "id": "tail-22-q-49",
        "coreWord": "거중기발명",
        "word": "거중기발명",
        "answer": "도르래원리, 수원화성축조, 정약용",
        "targetWords": [
          "도르래원리",
          "수원화성축조",
          "정약용"
        ],
        "distractorPool": [
          "스마트폰",
          "컴퓨터",
          "자동차"
        ]
      },
      {
        "id": "tail-22-q-50",
        "coreWord": "측우기발명",
        "word": "측우기발명",
        "answer": "강우량측정, 세종시대, 장영실",
        "targetWords": [
          "강우량측정",
          "세종시대",
          "장영실"
        ],
        "distractorPool": [
          "온도계",
          "습도계",
          "기압계"
        ]
      },
      {
        "id": "tail-22-q-51",
        "coreWord": "독립협회",
        "word": "독립협회",
        "answer": "독립문, 만민공동회, 서재필",
        "targetWords": [
          "독립문",
          "만민공동회",
          "서재필"
        ],
        "distractorPool": [
          "친일파",
          "밀정",
          "총독부"
        ]
      },
      {
        "id": "tail-22-q-52",
        "coreWord": "임시정부",
        "word": "임시정부",
        "answer": "상하이, 김구, 법통계승",
        "targetWords": [
          "상하이",
          "김구",
          "법통계승"
        ],
        "distractorPool": [
          "총독부",
          "관청",
          "사령부"
        ]
      },
      {
        "id": "tail-22-q-53",
        "coreWord": "육이오전쟁",
        "word": "육이오전쟁",
        "answer": "휴전선, 기습남침, 민족비극",
        "targetWords": [
          "휴전선",
          "기습남침",
          "민족비극"
        ],
        "distractorPool": [
          "임진왜란",
          "병자호란",
          "베트남전쟁"
        ]
      },
      {
        "id": "tail-22-q-54",
        "coreWord": "사일구혁명",
        "word": "사일구혁명",
        "answer": "부정선거항거, 민주주의승리, 학생주도",
        "targetWords": [
          "부정선거항거",
          "민주주의승리",
          "학생주도"
        ],
        "distractorPool": [
          "삼일운동",
          "육월항쟁",
          "오일팔운동"
        ]
      },
      {
        "id": "tail-22-q-55",
        "coreWord": "오일팔운동",
        "word": "오일팔운동",
        "answer": "광주, 민주수호, 시민군",
        "targetWords": [
          "광주",
          "민주수호",
          "시민군"
        ],
        "distractorPool": [
          "삼일운동",
          "사일구혁명",
          "광복"
        ]
      },
      {
        "id": "tail-22-q-56",
        "coreWord": "육월항쟁",
        "word": "육월항쟁",
        "answer": "직선제개헌, 민주화운동, 일구팔칠년",
        "targetWords": [
          "직선제개헌",
          "민주화운동",
          "일구팔칠년"
        ],
        "distractorPool": [
          "갑신정변",
          "을미사변",
          "임오군란"
        ]
      },
      {
        "id": "tail-22-q-57",
        "coreWord": "전통혼례",
        "word": "전통혼례",
        "answer": "연지곤지, 폐백, 함사세요",
        "targetWords": [
          "연지곤지",
          "폐백",
          "함사세요"
        ],
        "distractorPool": [
          "웨딩드레스",
          "시상식",
          "졸업식"
        ]
      },
      {
        "id": "tail-22-q-58",
        "coreWord": "전통제사",
        "word": "전통제사",
        "answer": "지방쓰기, 차례, 조상숭배",
        "targetWords": [
          "지방쓰기",
          "차례",
          "조상숭배"
        ],
        "distractorPool": [
          "생일잔치",
          "돌잔치",
          "환갑잔치"
        ]
      },
      {
        "id": "tail-22-q-59",
        "coreWord": "세시풍속",
        "word": "세시풍속",
        "answer": "설날, 추석, 단오",
        "targetWords": [
          "설날",
          "추석",
          "단오"
        ],
        "distractorPool": [
          "크리스마스",
          "어린이날",
          "어버이날"
        ]
      },
      {
        "id": "tail-22-q-60",
        "coreWord": "민족대명절",
        "word": "민족대명절",
        "answer": "한가위, 까치설날, 귀성길",
        "targetWords": [
          "한가위",
          "까치설날",
          "귀성길"
        ],
        "distractorPool": [
          "평일",
          "기념일",
          "국경일"
        ]
      }
    ]
  },
  {
    "id": "tail-23",
    "title": "초등 20",
    "schoolLevelLabel": "20",
    "bandLabel": "초등",
    "descriptor": "권리와의무",
    "grammarFocus": "권리와의무",
    "goalCopy": "권리와의무 주제를 떠올리며 같은 범주의 낱말 3개를 골라요.",
    "questionPoolLabel": "문항풀 60개",
    "runQuestionCount": 8,
    "timeLimitSeconds": 25,
    "questions": [
      {
        "id": "tail-23-q-01",
        "coreWord": "최고법",
        "word": "최고법",
        "answer": "헌법, 인권, 법률",
        "targetWords": [
          "헌법",
          "인권",
          "법률"
        ],
        "distractorPool": [
          "학칙",
          "교칙",
          "동아리규칙"
        ]
      },
      {
        "id": "tail-23-q-02",
        "coreWord": "국민의의무",
        "word": "국민의의무",
        "answer": "납세, 세금, 국가운영",
        "targetWords": [
          "납세",
          "세금",
          "국가운영"
        ],
        "distractorPool": [
          "탈세",
          "뇌물",
          "용돈"
        ]
      },
      {
        "id": "tail-23-q-03",
        "coreWord": "법적다툼",
        "word": "법적다툼",
        "answer": "재판, 판사, 변호사",
        "targetWords": [
          "재판",
          "판사",
          "변호사"
        ],
        "distractorPool": [
          "의사",
          "간호사",
          "소방관"
        ]
      },
      {
        "id": "tail-23-q-04",
        "coreWord": "법적약속",
        "word": "법적약속",
        "answer": "계약, 서명, 도장",
        "targetWords": [
          "계약",
          "서명",
          "도장"
        ],
        "distractorPool": [
          "사기",
          "협박",
          "폭력"
        ]
      },
      {
        "id": "tail-23-q-05",
        "coreWord": "사생활보호",
        "word": "사생활보호",
        "answer": "개인정보, 통신비밀, 보호",
        "targetWords": [
          "개인정보",
          "통신비밀",
          "보호"
        ],
        "distractorPool": [
          "몰래카메라",
          "해킹",
          "도청"
        ]
      },
      {
        "id": "tail-23-q-06",
        "coreWord": "법만드는곳",
        "word": "법만드는곳",
        "answer": "국회, 입법, 국회의원",
        "targetWords": [
          "국회",
          "입법",
          "국회의원"
        ],
        "distractorPool": [
          "법원",
          "판결",
          "행정부"
        ]
      },
      {
        "id": "tail-23-q-07",
        "coreWord": "국가원수",
        "word": "국가원수",
        "answer": "대통령, 행정부, 청와대",
        "targetWords": [
          "대통령",
          "행정부",
          "청와대"
        ],
        "distractorPool": [
          "판사",
          "국회의원",
          "시장"
        ]
      },
      {
        "id": "tail-23-q-08",
        "coreWord": "투표권리",
        "word": "투표권리",
        "answer": "선거권, 참정권, 만십팔세",
        "targetWords": [
          "선거권",
          "참정권",
          "만십팔세"
        ],
        "distractorPool": [
          "기권",
          "매수",
          "부정선거"
        ]
      },
      {
        "id": "tail-23-q-09",
        "coreWord": "체포시권리",
        "word": "체포시권리",
        "answer": "미란다원칙, 진술거부권, 변호사선임",
        "targetWords": [
          "미란다원칙",
          "진술거부권",
          "변호사선임"
        ],
        "distractorPool": [
          "고문",
          "폭행",
          "자백강요"
        ]
      },
      {
        "id": "tail-23-q-10",
        "coreWord": "유죄전까지",
        "word": "유죄전까지",
        "answer": "무죄추정의원칙, 증거재판, 확정전무죄",
        "targetWords": [
          "무죄추정의원칙",
          "증거재판",
          "확정전무죄"
        ],
        "distractorPool": [
          "마녀사냥",
          "확정범죄",
          "사형"
        ]
      },
      {
        "id": "tail-23-q-11",
        "coreWord": "소비자의힘",
        "word": "소비자의힘",
        "answer": "소비자권리, 환불, 보상",
        "targetWords": [
          "소비자권리",
          "환불",
          "보상"
        ],
        "distractorPool": [
          "독점",
          "바가지",
          "사재기"
        ]
      },
      {
        "id": "tail-23-q-12",
        "coreWord": "이중처벌금지",
        "word": "이중처벌금지",
        "answer": "일사부재리, 판결확정, 헌법원칙",
        "targetWords": [
          "일사부재리",
          "판결확정",
          "헌법원칙"
        ],
        "distractorPool": [
          "무한처벌",
          "복수",
          "보복"
        ]
      },
      {
        "id": "tail-23-q-13",
        "coreWord": "언어폭력",
        "word": "언어폭력",
        "answer": "명예훼손, 허위사실, 악플",
        "targetWords": [
          "명예훼손",
          "허위사실",
          "악플"
        ],
        "distractorPool": [
          "칭찬",
          "표창",
          "격려"
        ]
      },
      {
        "id": "tail-23-q-14",
        "coreWord": "약자보호",
        "word": "약자보호",
        "answer": "아동권리, 학대금지, 교육권",
        "targetWords": [
          "아동권리",
          "학대금지",
          "교육권"
        ],
        "distractorPool": [
          "노동착취",
          "폭행",
          "방치"
        ]
      },
      {
        "id": "tail-23-q-15",
        "coreWord": "성숙한자세",
        "word": "성숙한자세",
        "answer": "민주시민, 준법정신, 책임감",
        "targetWords": [
          "민주시민",
          "준법정신",
          "책임감"
        ],
        "distractorPool": [
          "방관",
          "이기주의",
          "무법"
        ]
      },
      {
        "id": "tail-23-q-16",
        "coreWord": "처벌",
        "word": "처벌",
        "answer": "징역, 벌금, 과태료",
        "targetWords": [
          "징역",
          "벌금",
          "과태료"
        ],
        "distractorPool": [
          "훈장",
          "표창장",
          "상금"
        ]
      },
      {
        "id": "tail-23-q-17",
        "coreWord": "증언",
        "word": "증언",
        "answer": "위증금지, 법정, 선서",
        "targetWords": [
          "위증금지",
          "법정",
          "선서"
        ],
        "distractorPool": [
          "거짓말",
          "사기",
          "모함"
        ]
      },
      {
        "id": "tail-23-q-18",
        "coreWord": "노동자권리",
        "word": "노동자권리",
        "answer": "노동조합, 파업, 교섭권",
        "targetWords": [
          "노동조합",
          "파업",
          "교섭권"
        ],
        "distractorPool": [
          "강제노동",
          "착취",
          "무임금"
        ]
      },
      {
        "id": "tail-23-q-19",
        "coreWord": "불법행위",
        "word": "불법행위",
        "answer": "횡령, 절도, 폭행",
        "targetWords": [
          "횡령",
          "절도",
          "폭행"
        ],
        "distractorPool": [
          "기부",
          "선행",
          "봉사"
        ]
      },
      {
        "id": "tail-23-q-20",
        "coreWord": "공권력",
        "word": "공권력",
        "answer": "경찰, 검찰, 수사",
        "targetWords": [
          "경찰",
          "검찰",
          "수사"
        ],
        "distractorPool": [
          "도둑",
          "해커",
          "사기꾼"
        ]
      },
      {
        "id": "tail-23-q-21",
        "coreWord": "표현의자유",
        "word": "표현의자유",
        "answer": "언론, 출판, 집회",
        "targetWords": [
          "언론",
          "출판",
          "집회"
        ],
        "distractorPool": [
          "검열",
          "억압",
          "침묵"
        ]
      },
      {
        "id": "tail-23-q-22",
        "coreWord": "신체의자유",
        "word": "신체의자유",
        "answer": "불법구속금지, 영장주의, 고문금지",
        "targetWords": [
          "불법구속금지",
          "영장주의",
          "고문금지"
        ],
        "distractorPool": [
          "감금",
          "폭행",
          "납치"
        ]
      },
      {
        "id": "tail-23-q-23",
        "coreWord": "거주이전의자유",
        "word": "거주이전의자유",
        "answer": "이사, 여행, 거주지선택",
        "targetWords": [
          "이사",
          "여행",
          "거주지선택"
        ],
        "distractorPool": [
          "추방",
          "가택연금",
          "유배"
        ]
      },
      {
        "id": "tail-23-q-24",
        "coreWord": "직업선택의자유",
        "word": "직업선택의자유",
        "answer": "취업, 창업, 직업변경",
        "targetWords": [
          "취업",
          "창업",
          "직업변경"
        ],
        "distractorPool": [
          "강제노역",
          "징용",
          "노예"
        ]
      },
      {
        "id": "tail-23-q-25",
        "coreWord": "종교의자유",
        "word": "종교의자유",
        "answer": "신앙, 예배, 선교",
        "targetWords": [
          "신앙",
          "예배",
          "선교"
        ],
        "distractorPool": [
          "박해",
          "탄압",
          "개종강요"
        ]
      },
      {
        "id": "tail-23-q-26",
        "coreWord": "집회의자유",
        "word": "집회의자유",
        "answer": "평화시위, 모임, 의견표출",
        "targetWords": [
          "평화시위",
          "모임",
          "의견표출"
        ],
        "distractorPool": [
          "폭동",
          "테러",
          "해산"
        ]
      },
      {
        "id": "tail-23-q-27",
        "coreWord": "결사의자유",
        "word": "결사의자유",
        "answer": "단체결성, 동호회, 노조",
        "targetWords": [
          "단체결성",
          "동호회",
          "노조"
        ],
        "distractorPool": [
          "해체명령",
          "금지",
          "탄압"
        ]
      },
      {
        "id": "tail-23-q-28",
        "coreWord": "재산권보장",
        "word": "재산권보장",
        "answer": "사유재산, 저작권, 상속",
        "targetWords": [
          "사유재산",
          "저작권",
          "상속"
        ],
        "distractorPool": [
          "몰수",
          "강탈",
          "국유화"
        ]
      },
      {
        "id": "tail-23-q-29",
        "coreWord": "공공복리",
        "word": "공공복리",
        "answer": "공동이익, 사회복지, 공공성",
        "targetWords": [
          "공동이익",
          "사회복지",
          "공공성"
        ],
        "distractorPool": [
          "이기주의",
          "사익편취",
          "독점"
        ]
      },
      {
        "id": "tail-23-q-30",
        "coreWord": "국민주권",
        "word": "국민주권",
        "answer": "국가권력은국민으로부터, 민주주의, 참정권",
        "targetWords": [
          "국가권력은국민으로부터",
          "민주주의",
          "참정권"
        ],
        "distractorPool": [
          "독재",
          "왕정",
          "식민지"
        ]
      },
      {
        "id": "tail-23-q-31",
        "coreWord": "삼권분립",
        "word": "삼권분립",
        "answer": "입법행정사법, 권력견제, 균형",
        "targetWords": [
          "입법행정사법",
          "권력견제",
          "균형"
        ],
        "distractorPool": [
          "독재",
          "집권",
          "일당독재"
        ]
      },
      {
        "id": "tail-23-q-32",
        "coreWord": "입법부",
        "word": "입법부",
        "answer": "국회, 법률제정, 예산심의",
        "targetWords": [
          "국회",
          "법률제정",
          "예산심의"
        ],
        "distractorPool": [
          "법원",
          "청와대",
          "시청"
        ]
      },
      {
        "id": "tail-23-q-33",
        "coreWord": "행정부",
        "word": "행정부",
        "answer": "정부, 정책집행, 국무회의",
        "targetWords": [
          "정부",
          "정책집행",
          "국무회의"
        ],
        "distractorPool": [
          "법정",
          "국회",
          "경찰서"
        ]
      },
      {
        "id": "tail-23-q-34",
        "coreWord": "사법부",
        "word": "사법부",
        "answer": "법원, 법적용, 판결",
        "targetWords": [
          "법원",
          "법적용",
          "판결"
        ],
        "distractorPool": [
          "정당",
          "선거캠프",
          "방송국"
        ]
      },
      {
        "id": "tail-23-q-35",
        "coreWord": "대법원",
        "word": "대법원",
        "answer": "최고법원, 최종판결, 대법관",
        "targetWords": [
          "최고법원",
          "최종판결",
          "대법관"
        ],
        "distractorPool": [
          "지방법원",
          "고등법원",
          "검찰청"
        ]
      },
      {
        "id": "tail-23-q-36",
        "coreWord": "헌법재판소",
        "word": "헌법재판소",
        "answer": "위헌법률심판, 탄핵심판, 정당해산심판",
        "targetWords": [
          "위헌법률심판",
          "탄핵심판",
          "정당해산심판"
        ],
        "distractorPool": [
          "소액재판",
          "이혼재판",
          "교통사고재판"
        ]
      },
      {
        "id": "tail-23-q-37",
        "coreWord": "선거관리위원회",
        "word": "선거관리위원회",
        "answer": "공정선거, 투표관리, 개표",
        "targetWords": [
          "공정선거",
          "투표관리",
          "개표"
        ],
        "distractorPool": [
          "부정선거",
          "매수",
          "조작"
        ]
      },
      {
        "id": "tail-23-q-38",
        "coreWord": "국가인권위원회",
        "word": "국가인권위원회",
        "answer": "인권침해조사, 차별시정, 권고",
        "targetWords": [
          "인권침해조사",
          "차별시정",
          "권고"
        ],
        "distractorPool": [
          "경찰서",
          "검찰청",
          "교도소"
        ]
      },
      {
        "id": "tail-23-q-39",
        "coreWord": "국방의의무",
        "word": "국방의의무",
        "answer": "군대, 병역, 나라지키기",
        "targetWords": [
          "군대",
          "병역",
          "나라지키기"
        ],
        "distractorPool": [
          "탈영",
          "병역기피",
          "매국"
        ]
      },
      {
        "id": "tail-23-q-40",
        "coreWord": "교육의의무",
        "word": "교육의의무",
        "answer": "초등학교, 중학교, 의무교육",
        "targetWords": [
          "초등학교",
          "중학교",
          "의무교육"
        ],
        "distractorPool": [
          "자퇴",
          "학업포기",
          "문맹"
        ]
      },
      {
        "id": "tail-23-q-41",
        "coreWord": "근로의의무",
        "word": "근로의의무",
        "answer": "일하기, 경제자립, 국가발전",
        "targetWords": [
          "일하기",
          "경제자립",
          "국가발전"
        ],
        "distractorPool": [
          "실업",
          "백수",
          "나태"
        ]
      },
      {
        "id": "tail-23-q-42",
        "coreWord": "환경보전의의무",
        "word": "환경보전의의무",
        "answer": "분리수거, 에너지절약, 자연보호",
        "targetWords": [
          "분리수거",
          "에너지절약",
          "자연보호"
        ],
        "distractorPool": [
          "환경오염",
          "투기",
          "파괴"
        ]
      },
      {
        "id": "tail-23-q-43",
        "coreWord": "공정한재판",
        "word": "공정한재판",
        "answer": "공개재판, 증거재판, 삼심제",
        "targetWords": [
          "공개재판",
          "증거재판",
          "삼심제"
        ],
        "distractorPool": [
          "마녀사냥",
          "사적복수",
          "린치"
        ]
      },
      {
        "id": "tail-23-q-44",
        "coreWord": "영장주의",
        "word": "영장주의",
        "answer": "체포영장, 구속영장, 압수수색영장",
        "targetWords": [
          "체포영장",
          "구속영장",
          "압수수색영장"
        ],
        "distractorPool": [
          "임의동행",
          "불심검문",
          "강제연행"
        ]
      },
      {
        "id": "tail-23-q-45",
        "coreWord": "묵비권",
        "word": "묵비권",
        "answer": "불리한진술거부, 자기방어, 미란다원칙",
        "targetWords": [
          "불리한진술거부",
          "자기방어",
          "미란다원칙"
        ],
        "distractorPool": [
          "자백강요",
          "고문",
          "회유"
        ]
      },
      {
        "id": "tail-23-q-46",
        "coreWord": "국선변호인",
        "word": "국선변호인",
        "answer": "무료변론, 약자보호, 법률조력",
        "targetWords": [
          "무료변론",
          "약자보호",
          "법률조력"
        ],
        "distractorPool": [
          "검사",
          "판사",
          "집행관"
        ]
      },
      {
        "id": "tail-23-q-47",
        "coreWord": "민사소송",
        "word": "민사소송",
        "answer": "개인간분쟁, 빌린돈받기, 손해배상",
        "targetWords": [
          "개인간분쟁",
          "빌린돈받기",
          "손해배상"
        ],
        "distractorPool": [
          "형사처벌",
          "감옥",
          "사형"
        ]
      },
      {
        "id": "tail-23-q-48",
        "coreWord": "형사소송",
        "word": "형사소송",
        "answer": "범죄처벌, 국가대개인, 기소",
        "targetWords": [
          "범죄처벌",
          "국가대개인",
          "기소"
        ],
        "distractorPool": [
          "손해배상",
          "위자료",
          "채무이행"
        ]
      },
      {
        "id": "tail-23-q-49",
        "coreWord": "손해배상",
        "word": "손해배상",
        "answer": "정신적피해, 물질적손해, 금전보상",
        "targetWords": [
          "정신적피해",
          "물질적손해",
          "금전보상"
        ],
        "distractorPool": [
          "칭찬",
          "격려",
          "표창"
        ]
      },
      {
        "id": "tail-23-q-50",
        "coreWord": "위자료",
        "word": "위자료",
        "answer": "정신적고통, 위로금, 이혼소송",
        "targetWords": [
          "정신적고통",
          "위로금",
          "이혼소송"
        ],
        "distractorPool": [
          "월급",
          "상너금",
          "보너스"
        ]
      },
      {
        "id": "tail-23-q-51",
        "coreWord": "계약파기",
        "word": "계약파기",
        "answer": "위약금, 일방적취소, 손해발생",
        "targetWords": [
          "위약금",
          "일방적취소",
          "손해발생"
        ],
        "distractorPool": [
          "계약이행",
          "준수",
          "성사"
        ]
      },
      {
        "id": "tail-23-q-52",
        "coreWord": "위약금",
        "word": "위약금",
        "answer": "위반시벌금, 계약금반환, 보상",
        "targetWords": [
          "위반시벌금",
          "계약금반환",
          "보상"
        ],
        "distractorPool": [
          "상금",
          "선물",
          "보너스"
        ]
      },
      {
        "id": "tail-23-q-53",
        "coreWord": "소멸시효",
        "word": "소멸시효",
        "answer": "시간지나면권리사라짐, 채권포기, 기한만료",
        "targetWords": [
          "시간지나면권리사라짐",
          "채권포기",
          "기한만료"
        ],
        "distractorPool": [
          "영원함",
          "무한대",
          "평생보장"
        ]
      },
      {
        "id": "tail-23-q-54",
        "coreWord": "공소시효",
        "word": "공소시효",
        "answer": "처벌못함, 기간만료, 수사종료",
        "targetWords": [
          "처벌못함",
          "기간만료",
          "수사종료"
        ],
        "distractorPool": [
          "무기징역",
          "영구수사",
          "사형"
        ]
      },
      {
        "id": "tail-23-q-55",
        "coreWord": "과태료",
        "word": "과태료",
        "answer": "행정벌, 주차위반, 질서위반",
        "targetWords": [
          "행정벌",
          "주차위반",
          "질서위반"
        ],
        "distractorPool": [
          "포상금",
          "장학금",
          "용돈"
        ]
      },
      {
        "id": "tail-23-q-56",
        "coreWord": "범칙금",
        "word": "범칙금",
        "answer": "경범죄, 신호위반, 무단횡단",
        "targetWords": [
          "경범죄",
          "신호위반",
          "무단횡단"
        ],
        "distractorPool": [
          "훈장",
          "표창",
          "상금"
        ]
      },
      {
        "id": "tail-23-q-57",
        "coreWord": "징역형",
        "word": "징역형",
        "answer": "교도소복역, 자유박탈, 강제노역",
        "targetWords": [
          "교도소복역",
          "자유박탈",
          "강제노역"
        ],
        "distractorPool": [
          "집행유예",
          "벌금형",
          "무죄"
        ]
      },
      {
        "id": "tail-23-q-58",
        "coreWord": "집행유예",
        "word": "집행유예",
        "answer": "형집행미룸, 기회부여, 관용",
        "targetWords": [
          "형집행미룸",
          "기회부여",
          "관용"
        ],
        "distractorPool": [
          "실형",
          "수감",
          "구속"
        ]
      },
      {
        "id": "tail-23-q-59",
        "coreWord": "가석방",
        "word": "가석방",
        "answer": "모범수, 미리풀어줌, 사회복귀",
        "targetWords": [
          "모범수",
          "미리풀어줌",
          "사회복귀"
        ],
        "distractorPool": [
          "만기출소",
          "탈옥",
          "도주"
        ]
      },
      {
        "id": "tail-23-q-60",
        "coreWord": "준법정신",
        "word": "준법정신",
        "answer": "법지키기, 사회질서, 양심",
        "targetWords": [
          "법지키기",
          "사회질서",
          "양심"
        ],
        "distractorPool": [
          "무법",
          "탈법",
          "범법"
        ]
      }
    ]
  }
];
})();
