(function () {
  'use strict';

  const QUESTIONS_PER_STAGE = 10;
  const STAGES = [
    { id: 'word-animal', badge: '01', title: '동물 단어 설명', desc: '동물 단어카드를 보고 쉬운 설명 빈칸 3개를 채워요.', mode: 'word', category: 'animal', blankCount: 3, accent: '#38bdf8' },
    { id: 'word-vegetable', badge: '02', title: '야채 단어 설명', desc: '야채 단어카드를 보고 설명 빈칸 4개를 채워요.', mode: 'word', category: 'vegetable', blankCount: 4, accent: '#22c55e' },
    { id: 'word-fruit', badge: '03', title: '과일 단어 설명', desc: '과일 단어카드를 보고 설명 빈칸 4개를 채워요.', mode: 'word', category: 'fruit', blankCount: 4, accent: '#f59e0b' },
    { id: 'diary-school', badge: '04', title: '그림일기 학교편', desc: '학교 운동장에서 있었던 일을 4개 핵심어로 완성해요.', mode: 'diary', theme: 'school', blankCount: 4, accent: '#8b5cf6' },
    { id: 'diary-travel', badge: '05', title: '그림일기 여행편', desc: '여행과 소풍에서 있었던 장면을 4개 핵심어로 연결해요.', mode: 'diary', theme: 'travel', blankCount: 4, accent: '#0ea5e9' },
    { id: 'diary-free', badge: '06', title: '그림일기 자유주제', desc: '일상 경험을 읽고 3개 핵심어로 완성해요.', mode: 'diary', theme: 'free', blankCount: 3, accent: '#06b6d4' },
    { id: 'news-lower', badge: '07', title: '어린이뉴스 저학년', desc: '학교 소식을 읽고 3개 중요한 정보를 연결해요.', mode: 'news', theme: 'lower', blankCount: 3, accent: '#ec4899' },
    { id: 'news-info', badge: '08', title: '어린이뉴스 정보편', desc: '활동의 목적과 배운 내용을 3개 핵심어로 파악해요.', mode: 'news', theme: 'info', blankCount: 3, accent: '#14b8a6' },
    { id: 'news-social', badge: '09', title: '사회뉴스', desc: '생활 속 사회 이슈를 읽고 3개 핵심어로 연결해요.', mode: 'news', theme: 'social', blankCount: 3, accent: '#334155' }
  ];

  const FIXED_WORD_QUESTIONS = {
    animal: [
      { name: '박쥐', text: '이 동물은 [[박쥐]]예요. 밤에 날아다니고 [[벌레를]] 먹어요. [[동굴이나]] 나무 구멍에서 쉬어요.' },
      { name: '곰', text: '이 동물은 [[곰]]이에요. 몸집이 크고 [[꿀과]] 물고기, 열매를 먹어요. 겨울에는 [[동굴에서]] 지내기도 해요.' },
      { name: '송아지', text: '이 동물은 [[송아지]]예요. 엄마 소의 젖을 먹고 자라는 [[어린 소]]예요. 농장의 [[외양간에서]] 지내요.' },
      { name: '낙타', text: '이 동물은 [[낙타]]예요. 아주 더운 [[사막에서]] 살아요. 등에 [[혹이]] 있어요.' },
      { name: '고양이', text: '이 동물은 [[고양이]]예요. 사람과 함께 집에서 살기도 해요. [[생선이나]] 사료를 먹고 [[살금살금]] 걸어요.' },
      { name: '카멜레온', text: '이 동물은 [[카멜레온]]이에요. 더운 나라의 [[나무 위에서]] 살아요. 몸 [[색깔을]] 바꿀 수 있어요.' },
      { name: '치타', text: '이 동물은 [[치타]]예요. 넓은 [[들판에]] 살고 고기를 먹어요. 아주 [[빠르게]] 달릴 수 있어요.' },
      { name: '소', text: '이 동물은 [[소]]예요. 농장의 [[외양간에서]] 지내요. [[풀을]] 먹고 “음메” 하고 울어요.' },
      { name: '악어', text: '이 동물은 [[악어]]예요. 늪이나 [[강가에]] 살아요. 날카로운 [[이빨로]] 먹이를 잡아요.' },
      { name: '사슴', text: '이 동물은 [[사슴]]이에요. 푸른 [[숲에서]] 살아요. 긴 다리로 [[폴짝폴짝]] 뛰어다녀요.' }
    ],
    vegetable: [
      { name: '브로콜리', text: '이 채소는 [[브로콜리]]예요. 작은 나무처럼 생겼고 색은 [[초록색]]이에요. 데치면 [[아삭아삭]] 씹히고 [[반찬으로]] 먹어요.' },
      { name: '배추', text: '이 채소는 [[배추]]예요. 잎이 [[겹겹이]] 쌓여 있어요. [[아삭한 잎으로]] [[김치를]] 만들어요.' },
      { name: '당근', text: '이 채소는 [[당근]]이에요. 색은 [[주황색]]이에요. 씹으면 [[아삭아삭]]하고 [[주스로]] 만들 수 있어요.' },
      { name: '옥수수', text: '이 채소는 [[옥수수]]예요. [[노란색]] 알이 줄지어 붙어 있어요. [[고소한]] 맛이 나서 [[간식]]으로 먹어요.' },
      { name: '오이', text: '이 채소는 [[오이]]예요. 모양이 [[길쭉해요]]. 먹으면 [[시원해요]]. [[반찬]]으로 먹어요.' },
      { name: '가지', text: '이 채소는 [[가지]]예요. 색은 [[보라색]]이에요. 익히면 [[부드러운]] 식감이 나고 [[나물로]] 먹어요.' },
      { name: '마늘', text: '이 채소는 [[마늘]]이에요. 색은 [[하얀색]]이에요. 맛은 [[매워요]]. 음식에는 [[양념]]으로 넣어요.' },
      { name: '버섯', text: '이 채소는 [[버섯]]이에요. 나무 밑이나 [[습한 곳에서]] 자라요. [[쫄깃쫄깃]] 씹히고 [[찌개에]] 넣어 먹어요.' },
      { name: '양파', text: '이 채소는 [[양파]]예요. [[껍질을]] 까면 눈물이 나기도 해요. 익히면 [[달콤한]] 맛이 나고 [[국에]] 넣어 먹어요.' },
      { name: '파프리카', text: '이 채소는 [[파프리카]]예요. 색깔이 [[다양해요]]. 씹으면 [[아삭아삭]]하고 [[샐러드로]] 먹어요.' }
    ],
    fruit: [
      { name: '사과', text: '이 과일은 [[사과]]예요. 껍질은 [[빨간색]]이에요. 씹으면 [[아삭아삭해요]]. 맛은 [[달콤해요]].' },
      { name: '아보카도', text: '이 과일은 [[아보카도]]예요. 속살은 [[초록색]]이에요. 맛은 [[고소해요]]. 식감은 [[부드러워요]].' },
      { name: '바나나', text: '이 과일은 [[바나나]]예요. 껍질은 [[노란색]]이에요. 먹을 때는 껍질을 [[벗겨요]]. 맛은 [[달콤해요]].' },
      { name: '블루베리', text: '이 과일은 [[블루베리]]예요. 색은 [[보라색]]이에요. 크기는 [[작아요]]. 맛은 [[상큼해요]].' },
      { name: '체리', text: '이 과일은 [[체리]]예요. 색은 [[빨간색]]이에요. 크기는 [[작아요]]. 맛은 [[새콤달콤해요]].' },
      { name: '포도', text: '이 과일은 [[포도]]예요. 색은 [[보라색]]이에요. 알은 [[송이로]] 모여 있어요. 맛은 [[달콤해요]].' },
      { name: '키위', text: '이 과일은 [[키위]]예요. 껍질은 [[갈색]]이에요. 속은 [[초록색]]이고 맛은 [[새콤달콤해요]].' },
      { name: '참외', text: '이 과일은 [[참외]]예요. 껍질은 [[노란색]]이에요. 씹으면 [[아삭해요]]. 맛은 [[달콤해요]].' },
      { name: '귤', text: '이 과일은 [[귤]]이에요. 껍질은 [[주황색]]이에요. 손으로 [[까서]] 먹고 맛은 [[상큼해요]].' },
      { name: '망고', text: '이 과일은 [[망고]]예요. 속살은 [[노란색]]이에요. 맛은 [[달콤해요]]. 식감은 [[부드러워요]].' }
    ]
  };

  const FIXED_TEXT_QUESTIONS = {
    school: [
      { title: '운동장 달리기', image: 'images/category/recreation-playground-running-illust.webp', text: '오늘은 [[날씨가 맑아서]] 친구들과 [[학교 운동장에서]] 달리기를 하기로 했다. 운동장에 모여 신나게 뛰어놀다가 갑자기 [[비둘기 떼가]] 날아와 모두 깜짝 놀랐다. 우리는 웃으며 다시 뛰었지만 조금 놀라서 [[가슴이 두근거렸다]].' },
      { title: '피구 시간', image: 'images/category/play-dodgeball-apology-illust.webp', text: '오늘은 점심시간에 친구들과 [[학교 운동장에서]] [[피구를]] 하기로 했다. 열심히 공을 던지다가 내가 던진 공이 [[친구 얼굴에]] 살짝 맞았다. 친구에게 미안해서 바로 [[사과했고]], 다행히 친구가 괜찮다고 해서 안심했다.' },
      { title: '숨바꼭질', image: 'images/category/play-hide-and-seek-tree-illust.webp', text: '오늘은 날씨가 좋아서 친구들과 학교 운동장에서 [[숨바꼭질을]] 하기로 했다. 나는 [[나무 뒤에]] 숨었는데 선생님께서 운동장을 지나가셔서 들킬까 봐 [[조용히]] 숨었다. 결국 끝까지 들키지 않아서 [[기분이 아주 좋았다]].' },
      { title: '줄넘기 연습', image: 'images/category/play-jump-rope-practice-illust.webp', text: '오늘은 체육 시간에 친구들과 [[학교 운동장에서]] [[줄넘기를]] 했다. 열심히 뛰다가 줄에 발이 걸려 [[넘어질 뻔했다]]. 조심해서 다시 하니 점점 잘하게 되어 [[뿌듯했다]].' },
      { title: '공놀이', image: 'images/category/play-ball-window-illust.webp', text: '오늘은 친구들과 학교 운동장에서 [[공놀이를]] 하기로 했다. 재미있게 놀다가 공이 [[교실 창문 근처까지]] 날아갔다. 다행히 [[창문은]] 깨지지 않았지만 모두 [[조심해야겠다고]] 생각했다.' }
    ],
    travel: [
      { title: '바다 여행', image: 'images/category/recreation-sea-wave-illust.webp', text: '오늘은 가족과 함께 [[바다로]] 여행을 갔다. [[모래사장에서]] 신나게 뛰어놀다가 파도가 갑자기 발까지 밀려와 [[깜짝 놀랐다]]. 차가웠지만 재미있어서 계속 [[웃음이 났다]].' },
      { title: '소풍 도시락', image: 'images/category/food-rice-roll-picnic-illust.webp', text: '오늘은 학교에서 친구들과 [[소풍을]] 갔다. 돗자리를 펴고 맛있는 [[도시락을]] 먹다가 친구의 김밥이 [[바닥에 떨어졌다]]. 친구가 속상해했지만 함께 나눠 먹어서 다시 [[기분이 좋아졌다]].' },
      { title: '산 여행', image: 'images/category/recreation-mountain-hiking-illust.webp', text: '오늘은 가족과 함께 [[산으로]] 여행을 갔다. 열심히 올라가다가 [[다리가 아파]] 잠깐 쉬었다. 정상에 도착해 [[멋진 풍경을]] 보니 힘든 마음이 모두 [[사라졌다]].' },
      { title: '공원 소풍', image: 'images/category/recreation-playground-rain-illust.webp', text: '오늘은 친구들과 [[공원으로]] 소풍을 갔다. 신나게 놀다가 [[갑자기]] [[비가]] 조금씩 내리기 시작했다. 우리는 웃으며 비를 피해 [[뛰어갔다]].' },
      { title: '놀이공원', image: 'images/category/recreation-amusementpark-ride-illust.webp', text: '오늘은 가족과 함께 [[놀이공원에]] 갔다. 무서운 [[놀이기구를]] 타다가 너무 놀라 [[소리를 크게 질렀다]]. 처음에는 무서웠지만 다시 타고 싶을 만큼 [[재미있었다]].' }
    ],
    free: [
      { title: '책 읽기', image: 'images/category/movement-reading-book-illust.webp', text: '오늘은 집에서 좋아하는 [[책을]] 읽었다. 재미있는 이야기에 빠져 [[시간 가는 줄 몰랐다]]. 다 읽고 나니 또 다른 책을 [[읽고 싶어졌다]].' },
      { title: '간식 만들기', image: 'images/category/food-cookie-making-illust.webp', text: '오늘은 엄마와 함께 맛있는 [[간식을]] 만들었다. 직접 만든 [[쿠키가]] 생각보다 더 맛있어서 놀랐다. 다음에는 친구들과 같이 [[만들어 보고 싶다]].' },
      { title: '공원 산책', image: 'images/category/movement-walking-park-illust.webp', text: '오늘은 날씨가 좋아서 [[동네 공원을]] 산책했다. 바람이 [[시원하게]] 불어서 기분이 아주 좋았다. 다음에도 자주 나와서 [[걷고 싶다]].' },
      { title: '게임 연습', image: 'images/category/electronics-game-practice-illust.webp', text: '오늘은 숙제를 빨리 끝내고 [[게임을]] 했다. 처음에는 잘 안 됐지만 점점 [[실력이 늘어서]] 재미있었다. 열심히 연습하면 더 [[잘할 수 있을 것 같다]].' },
      { title: '가족 이야기', image: 'images/category/movement-talk-family-illust.webp', text: '오늘은 저녁에 가족과 함께 [[이야기를]] 나눴다. 하루 동안 있었던 일을 서로 이야기하며 많이 [[웃었다]]. 이런 시간이 계속 이어지면 [[좋겠다고]] 생각했다.' }
    ],
    lower: [
      { title: '작은 운동회', image: 'images/etc/cardlab-cloze-connect-01-01.webp', text: '오늘 우리 학교 운동장에서 [[작은 운동회가]] 열렸어요. 학생들은 [[달리기와]] 공 던지기 같은 다양한 경기에 참여했어요. 모두 즐겁게 웃으며 서로 [[응원하는 모습이]] 보기 좋았어요.' },
      { title: '특별 급식', image: 'images/etc/cardlab-cloze-connect-01-02.webp', text: '오늘 급식실에서는 [[특별 메뉴가]] 나왔어요. 학생들이 좋아하는 [[돈가스와]] 과일이 함께 제공되었어요. 친구들은 맛있게 먹으며 즐거운 [[점심시간을]] 보냈어요.' },
      { title: '새 책', image: 'images/etc/cardlab-cloze-connect-01-03.webp', text: '오늘 학교 도서관에 [[새 책이]] 많이 들어왔어요. 학생들은 새로운 책을 보며 읽고 싶은 책을 [[골랐어요]]. 책을 읽는 즐거운 [[시간이]] 이어졌어요.' },
      { title: '안전 교육', image: 'images/etc/cardlab-cloze-connect-01-04.webp', text: '오늘 교실에서 [[안전 교육이]] 진행되었어요. 선생님은 화재가 났을 때 어떻게 [[대피해야 하는지]] 알려주셨어요. 학생들은 차분하게 설명을 듣고 [[따라 해 보았어요]].' },
      { title: '학교 화단', image: 'images/etc/cardlab-cloze-connect-01-05.webp', text: '오늘 학교 화단에 [[예쁜 꽃이]] 피었어요. 학생들은 꽃을 보며 자연의 [[소중함을]] 느꼈어요. 앞으로도 꽃을 잘 가꾸기로 [[약속했어요]].' }
    ],
    info: [
      { title: '환경 보호 캠페인', image: 'images/etc/cardlab-cloze-connect-02-01.webp', text: '오늘 우리 학교에서는 [[환경 보호 캠페인이]] 열렸어요. 학생들은 교실과 운동장을 돌며 쓰레기를 줍고 [[분리수거 방법을]] 다시 배웠어요. 이번 활동을 통해 [[작은 실천이]] 중요하다는 것을 알게 되었어요.' },
      { title: '과학 실험', image: 'images/etc/cardlab-cloze-connect-02-02.webp', text: '오늘 과학실에서는 간단한 [[실험 수업이]] 진행되었어요. 학생들은 물과 기름이 섞이지 않는 이유를 직접 [[관찰하며]] 원리를 이해했어요. 이 수업을 통해 과학이 우리 생활과 [[가까이 있다는 것을]] 느낄 수 있었어요.' },
      { title: '독서 발표', image: 'images/etc/cardlab-cloze-connect-02-03.webp', text: '오늘 학교 도서관에서는 [[독서 발표 시간이]] 있었어요. 학생들은 자신이 읽은 책의 내용을 정리해 친구들 앞에서 [[발표했어요]]. 이 활동을 통해 생각을 정리하고 말하는 [[힘을]] 기를 수 있었어요.' },
      { title: '협동 게임', image: 'images/etc/cardlab-cloze-connect-02-04.webp', text: '오늘 체육 시간에는 [[협동 게임이]] 진행되었어요. 학생들은 팀을 이루어 함께 문제를 해결하며 서로 [[도왔어요]]. 이를 통해 협력의 중요성과 친구와 [[이야기하는 방법을]] 배울 수 있었어요.' },
      { title: '안전 점검', image: 'images/etc/cardlab-cloze-connect-02-05.webp', text: '오늘 학교에서는 [[안전 점검 활동이]] 이루어졌어요. 교실과 복도, 계단 등을 살펴보며 위험한 곳이 없는지 [[확인했어요]]. 학생들은 안전한 학교를 만들기 위해 모두의 [[노력이]] 필요하다는 것을 알게 되었어요.' }
    ],
    social: [
      { title: '횡단보도 안전', image: 'images/etc/cardlab-cloze-connect-03-01.webp', text: '요즘 학교 주변에서 횡단보도를 안전하게 이용하자는 [[캠페인이]] 진행되고 있어요. 신호를 지키지 않아 생기는 사고가 늘어나면서 학생들의 [[안전을]] 지키기 위해 시작된 활동이에요. 전문가들은 작은 규칙을 지키는 것이 큰 사고를 [[막을 수 있다고]] 강조하고 있어요.' },
      { title: '일회용품 줄이기', image: 'images/etc/cardlab-cloze-connect-03-02.webp', text: '최근 일부 지역에서는 [[일회용품 사용을]] 줄이기 위한 노력이 이어지고 있어요. 카페에서는 플라스틱 빨대 대신 [[종이 빨대를]] 사용하거나 개인 컵을 가져오도록 안내하고 있어요. 이러한 변화는 환경 오염을 줄이는 데 [[도움이]] 될 것으로 기대되고 있어요.' },
      { title: '온열 질환 주의', image: 'images/etc/cardlab-cloze-connect-03-03.webp', text: '요즘 날씨가 갑자기 더워지면서 [[온열 질환에]] 대한 주의가 필요하다는 소식이에요. 특히 낮 시간에는 햇볕이 강해 오래 밖에 있으면 [[어지러움을]] 느낄 수 있어요. 전문가들은 물을 자주 마시고 그늘에서 [[쉬는 것이]] 중요하다고 말하고 있어요.' },
      { title: '지역 도서관', image: 'images/etc/cardlab-cloze-connect-03-04.webp', text: '최근 지역 도서관을 찾는 학생들이 점점 [[늘어나고]] 있어요. 다양한 체험 프로그램과 독서 활동이 마련되면서 많은 [[관심을]] 받고 있어요. 도서관은 단순히 책을 읽는 곳을 넘어 배움의 [[공간으로]] 바뀌고 있어요.' },
      { title: '스마트폰 사용', image: 'images/etc/cardlab-cloze-connect-03-05.webp', text: '요즘 스마트폰 사용 시간이 늘어나면서 [[올바른 사용 습관이]] 중요해지고 있어요. 장시간 사용하면 눈 건강에 좋지 않고 [[집중력이]] 떨어질 수 있어요. 전문가들은 사용 시간을 정하고 휴식 시간을 꼭 [[지키는 것이]] 중요하다고 조언하고 있어요.' }
    ]
  };

  const DIARY_BANKS = {
    picnic: {
      people: ['친구들', '반 친구', '짝꿍', '선생님', '동생'],
      places: ['공원', '잔디밭', '숲길', '놀이터', '호수 앞'],
      objects: ['도시락', '돗자리', '물병', '김밥', '사진'],
      actions: ['나누어 먹었어요', '뛰어놀았어요', '사진을 찍었어요', '쉬었어요', '노래를 불렀어요'],
      feelings: ['신나는', '즐거운', '설레는', '가벼운', '행복한'],
      memories: ['소풍 이야기', '맛있는 도시락', '친구 얼굴', '푸른 잔디', '웃긴 놀이']
    },
    mart: {
      people: ['엄마', '가족', '동생', '아빠', '할머니'],
      places: ['마트', '과일 코너', '계산대', '우유 코너', '카트 앞'],
      objects: ['카트', '사과', '우유', '과자', '장바구니'],
      actions: ['밀어 보았어요', '골라 담았어요', '차례를 기다렸어요', '가격을 보았어요', '함께 들었어요'],
      feelings: ['뿌듯한', '고마운', '재미있는', '바쁜', '든든한'],
      memories: ['장 본 일', '엄마 미소', '무거운 장바구니', '계산한 순간', '집에 갈 길']
    },
    amusement: {
      people: ['부모님', '엄마', '아빠', '가족', '동생'],
      places: ['놀이공원', '회전목마 앞', '관람차 아래', '매표소', '분수대'],
      objects: ['입장권', '풍선', '팝콘', '관람차', '사진'],
      actions: ['손을 잡았어요', '줄을 섰어요', '크게 웃었어요', '높이 올라갔어요', '간식을 먹었어요'],
      feelings: ['두근거리는', '신나는', '짜릿한', '행복한', '잊지 못할'],
      memories: ['놀이기구', '부모님 손', '높은 관람차', '달콤한 팝콘', '반짝이는 불빛']
    },
    soccer: {
      people: ['친구', '반 친구', '형', '동생', '짝꿍'],
      places: ['운동장', '잔디밭', '학교 앞', '공원', '골대 앞'],
      objects: ['축구공', '운동화', '골대', '물병', '유니폼'],
      actions: ['힘껏 찼어요', '패스를 했어요', '응원했어요', '땀을 닦았어요', '골을 넣었어요'],
      feelings: ['신나는', '아쉬운', '뿌듯한', '뜨거운', '활기찬'],
      memories: ['축구 경기', '멋진 골', '친구 응원', '땀난 얼굴', '다시 하고 싶은 마음']
    },
    grandma: {
      people: ['할머니', '할아버지', '엄마', '아빠', '가족'],
      places: ['할머니 집', '부엌', '마당', '거실', '식탁 앞'],
      objects: ['반찬', '사진첩', '과일', '이불', '꽃'],
      actions: ['인사드렸어요', '함께 먹었어요', '이야기를 들었어요', '도와드렸어요', '웃었어요'],
      feelings: ['따뜻한', '고마운', '편안한', '반가운', '행복한'],
      memories: ['할머니 목소리', '맛있는 밥', '오래된 사진', '마당의 꽃', '따뜻한 손']
    },
    rain: {
      people: ['엄마', '친구', '동생', '아빠', '선생님'],
      places: ['집 앞', '학교 가는 길', '버스 정류장', '놀이터', '골목길'],
      objects: ['우산', '장화', '빗방울', '웅덩이', '비옷'],
      actions: ['조심히 걸었어요', '폴짝 뛰었어요', '함께 썼어요', '비를 보았어요', '물소리를 들었어요'],
      feelings: ['차분한', '재미있는', '촉촉한', '상쾌한', '조용한'],
      memories: ['비 오는 길', '우산 소리', '웅덩이 놀이', '젖은 장화', '창문 빗방울']
    },
    birthday: {
      people: ['친구들', '가족', '엄마', '아빠', '동생'],
      places: ['집', '거실', '케이크 앞', '식탁', '파티방'],
      objects: ['케이크', '촛불', '선물', '풍선', '카드'],
      actions: ['노래를 불렀어요', '촛불을 껐어요', '박수를 쳤어요', '선물을 열었어요', '사진을 찍었어요'],
      feelings: ['기쁜', '설레는', '고마운', '특별한', '행복한'],
      memories: ['생일 노래', '반짝인 촛불', '예쁜 선물', '친구 웃음', '감사한 마음']
    },
    libraryDay: {
      people: ['엄마', '친구', '동생', '사서 선생님', '선생님'],
      places: ['도서관', '책장 앞', '창가 자리', '열람실', '이야기방'],
      objects: ['동화책', '책갈피', '대출증', '연필', '가방'],
      actions: ['조용히 읽었어요', '책을 골랐어요', '기록했어요', '추천받았어요', '반납했어요'],
      feelings: ['차분한', '궁금한', '뿌듯한', '조용한', '집중한'],
      memories: ['읽은 책', '마음에 든 장면', '조용한 자리', '새로운 이야기', '빌린 책']
    }
  };

  const WORD_STYLE_BANKS = {
    animal: {
      modifiers: ['커다란', '작은', '빠른', '느린', '귀여운', '날쌘', '깜깜한 곳을 좋아하는', '긴 꼬리를 가진', '부드러운 털이 있는', '튼튼한'],
      movements: ['엉금엉금', '폴짝폴짝', '살금살금', '훨훨', '재빠르게', '느릿느릿', '뒤뚱뒤뚱', '사뿐사뿐', '힘차게', '조용히'],
      places: ['숲속', '물가', '나무 위', '동굴', '풀밭', '바다', '하늘', '우리 주변', '동물원', '땅속']
    },
    vegetable: {
      textures: ['아삭아삭한', '부드러운', '단단한', '싱싱한', '길쭉한', '둥근', '매끈한', '푸릇푸릇한', '향긋한', '커다란'],
      colors: ['초록색', '주황색', '노란색', '하얀색', '보라색', '빨간색', '연두색', '짙은 초록색', '밝은 색', '알록달록한'],
      uses: ['반찬', '샐러드', '국', '볶음 요리', '도시락', '김밥', '주스', '간식', '건강한 밥상', '시장 바구니']
    },
    fruit: {
      tastes: ['달콤한', '새콤한', '상큼한', '시원한', '부드러운', '향긋한', '진한', '아삭한', '말랑한', '맛있는'],
      juices: ['촉촉한', '과즙이 많은', '입안에 퍼지는', '시원하게 흐르는', '향이 나는', '부드럽게 씹히는', '상큼하게 터지는', '달콤하게 퍼지는', '가득한', '시원한'],
      colors: ['빨간색', '노란색', '초록색', '보라색', '주황색', '분홍색', '하얀색', '갈색', '알록달록한', '밝은 색'],
      moments: ['간식 시간', '소풍날', '아침', '점심 뒤', '더운 날', '친구와 함께', '가족과 함께', '마트에서', '도시락 옆', '후식 시간']
    }
  };

  const state = {
    stage: null,
    questions: [],
    index: 0,
    filled: [],
    score: 0,
    attempts: 0,
    wrongAttempts: 0,
    questionSolved: false,
    activeBlankIndex: -1,
    drag: null,
    effectAudio: null,
    startedAtMs: 0,
    savedRunId: '',
    assetMap: new Map(),
    categoryPools: new Map()
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

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function pick(list, index, offset = 0) {
    return list[(index + offset) % list.length];
  }

  function hasFinalConsonant(value) {
    const chars = Array.from(String(value || '').trim());
    if (!chars.length) return false;
    const code = chars[chars.length - 1].charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return false;
    return (code - 0xac00) % 28 > 0;
  }

  function josa(value, pair) {
    const withFinal = hasFinalConsonant(value);
    if (pair === '은/는') return withFinal ? '은' : '는';
    if (pair === '이/가') return withFinal ? '이' : '가';
    if (pair === '을/를') return withFinal ? '을' : '를';
    if (pair === '과/와') return withFinal ? '과' : '와';
    return '';
  }

  function keyFor(category, name) {
    return `${category}:${name}`;
  }

  function parseQuestion(question, maxBlanks = 6) {
    const answers = [];
    const parts = [];
    const pattern = /\[\[([^\]]+)]]/g;
    let lastIndex = 0;
    let blankCount = 0;
    let match;
    while ((match = pattern.exec(question.text))) {
      parts.push(question.text.slice(lastIndex, match.index));
      if (blankCount < maxBlanks) {
        answers.push(match[1]);
        parts.push({ blankIndex: answers.length - 1 });
        blankCount += 1;
      } else {
        parts.push(match[1]);
      }
      lastIndex = pattern.lastIndex;
    }
    parts.push(question.text.slice(lastIndex));
    return { parts, answers };
  }

  function renderSentenceTextPart(text) {
    return escapeHtml(text).replace(/\.\s*(?=\S)/g, '.<br>');
  }

  function buildAssetMap() {
    const manifest = window.CARDLAB_WEBP_MANIFEST || {};
    const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
    assets.forEach((asset) => {
      if (!asset || asset.is_active === false || String(asset.asset_type || '') !== 'illust') return;
      const category = String(asset.category || '').trim();
      const name = String(asset.name_ko || asset.name_ko_auto || '').trim();
      const image = String(asset.file_path || '').trim();
      if (!category || !name || !image) return;
      const row = {
        category,
        categoryKo: String(asset.category_ko || category).trim(),
        name,
        image,
        description: String(asset.description_ko || '').trim()
      };
      if (!state.assetMap.has(keyFor(category, name))) state.assetMap.set(keyFor(category, name), row);
      if (!state.categoryPools.has(category)) state.categoryPools.set(category, []);
      if (!state.categoryPools.get(category).some((item) => item.name === name)) {
        state.categoryPools.get(category).push(row);
      }
    });
  }

  function buildWordQuestion(stage, index) {
    const fixedQuestions = FIXED_WORD_QUESTIONS[stage.category] || [];
    const fixed = fixedQuestions[index % fixedQuestions.length] || null;
    const name = fixed?.name || '단어';
    const asset = state.assetMap.get(keyFor(stage.category, name)) || (state.categoryPools.get(stage.category) || [])[index % ((state.categoryPools.get(stage.category) || []).length || 1)];
    const categoryKo = asset?.categoryKo || stage.category;
    return {
      id: `${stage.id}-${index + 1}`,
      mode: 'word',
      category: stage.category,
      categoryKo,
      name,
      image: asset?.image || '',
      text: fixed?.text || `[[${name}]]${josa(name, '은/는')} 그림에 나온 [[${categoryKo}]] 단어예요. 이름과 설명을 읽고 [[알맞은 단어]]로 문장을 완성해요.`
    };
  }

  function themeFor(stage, index) {
    if (stage.theme !== 'mix') return DIARY_BANKS[stage.theme];
    const keys = Object.keys(DIARY_BANKS);
    return DIARY_BANKS[keys[index % keys.length]];
  }

  function buildDiaryQuestion(stage, index) {
    const fixedQuestions = FIXED_TEXT_QUESTIONS[stage.theme] || [];
    const fixed = fixedQuestions[index % fixedQuestions.length] || null;
    if (fixed) {
      return {
        id: `${stage.id}-${index + 1}`,
        mode: stage.mode,
        categoryKo: stage.mode === 'news' ? '어린이뉴스' : '그림일기',
        name: fixed.title || '',
        image: fixed.image || '',
        text: fixed.text
      };
    }
    const theme = themeFor(stage, index);
    const place = pick(theme.places, index);
    const person = pick(theme.people, index, 1);
    const object = pick(theme.objects, index, 2);
    const action = pick(theme.actions, index, 3).replace(/^함께\s+/, '');
    const feeling = pick(theme.feelings, index, 1);
    return {
      id: `${stage.id}-${index + 1}`,
      mode: 'diary',
      categoryKo: '그림일기',
      name: '',
      text: `오늘 [[${person}${josa(person, '과/와')}]] [[${place}에]] 갔어요. [[${object}${josa(object, '이/가')}]] 가장 기억나요. 함께 [[${action}]]. [[${feeling} 마음으로]] 일기장에 [[오늘 일을]] 적었어요.`
    };
  }

  function questionCountForStage(stage) {
    if (stage.mode === 'word') return FIXED_WORD_QUESTIONS[stage.category]?.length || QUESTIONS_PER_STAGE;
    return FIXED_TEXT_QUESTIONS[stage.theme]?.length || QUESTIONS_PER_STAGE;
  }

  function blankLabelForStage(stage) {
    const source = stage.mode === 'word' ? FIXED_WORD_QUESTIONS[stage.category] : FIXED_TEXT_QUESTIONS[stage.theme];
    if (!Array.isArray(source) || !source.length) return `${stage.blankCount}빈칸`;
    const counts = source.map((question) => parseQuestion(question, stage.blankCount).answers.length);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    return min === max ? `${max}빈칸` : `${min}~${max}빈칸`;
  }

  function stageQuestions(stage) {
    const count = questionCountForStage(stage);
    return Array.from({ length: count }, (_, index) => (
      stage.mode === 'word' ? buildWordQuestion(stage, index) : buildDiaryQuestion(stage, index)
    ));
  }

  function setScreen(name) {
    const map = { stage: els.stageView, game: els.gameView, complete: els.completeView };
    Object.entries(map).forEach(([key, element]) => element.classList.toggle('is-active', key === name));
    els.stageButton.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel.classList.toggle('shell-hidden', name === 'stage');
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="cloze-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-accent:${escapeHtml(stage.accent)}">
        <span class="cloze-stage-badge">${escapeHtml(stage.badge)} · ${blankLabelForStage(stage)} · ${questionCountForStage(stage)}문항</span>
        <strong>${escapeHtml(stage.title)}</strong>
        <p>${escapeHtml(stage.desc)}</p>
        <div class="cloze-stage-tags">
          <span>${stage.mode === 'word' ? '단어카드 설명' : stage.mode === 'news' ? '뉴스 읽기' : '그림일기 읽기'}</span>
        </div>
      </button>
    `).join('');
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    state.stage = stage;
    state.questions = stageQuestions(stage);
    state.index = 0;
    state.score = 0;
    state.attempts = 0;
    state.wrongAttempts = 0;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    els.stageLabel.textContent = `${stage.badge} ${stage.title}`;
    setScreen('game');
    renderQuestion();
  }

  function currentQuestion() {
    return state.questions[state.index] || null;
  }

  function renderMedia(question) {
    const hasImage = Boolean(question.image);
    els.cardHead.classList.toggle('is-diary', question.mode !== 'word');
    if (!hasImage) {
      els.cardImage.removeAttribute('src');
      els.cardImage.alt = '';
      els.cardImage.classList.add('is-hidden');
      els.imagePlaceholder.classList.remove('is-hidden');
      els.imagePlaceholder.querySelector('span').textContent = question.mode === 'word' ? '이미지 준비중' : question.mode === 'news' ? '뉴스 읽기' : '그림일기';
      return;
    }
    els.imagePlaceholder.classList.add('is-hidden');
    els.imagePlaceholder.querySelector('span').textContent = '이미지 준비중';
    els.cardImage.classList.remove('is-hidden');
    els.cardImage.src = question.image;
    els.cardImage.alt = `${question.name || question.categoryKo || '학습'} 카드`;
  }

  function renderQuestion() {
    const question = currentQuestion();
    if (!question) {
      renderComplete();
      return;
    }
    const parsed = parseQuestion(question, state.stage?.blankCount || 6);
    state.filled = Array(parsed.answers.length).fill(null);
    state.currentAnswers = parsed.answers;
    state.questionSolved = false;
    state.activeBlankIndex = nextEmptyIndexFrom(Array(parsed.answers.length).fill(null), parsed.answers);
    els.feedbackText.textContent = '';
    els.feedbackText.className = 'cloze-feedback';
    renderMedia(question);
    els.sentenceText.innerHTML = parsed.parts.map((part) => (
      typeof part === 'string'
        ? renderSentenceTextPart(part)
        : `<button type="button" class="cloze-blank" data-blank-index="${part.blankIndex}" aria-label="빈칸 ${part.blankIndex + 1}"></button>`
    )).join('');
    const tokens = parsed.answers.map((answer, index) => ({ answer, tokenId: `${index}-${answer}` }));
    els.wordBank.innerHTML = shuffle(tokens).map((token) => `
      <button type="button" class="cloze-token" draggable="false" data-token-id="${escapeHtml(token.tokenId)}" data-token-text="${escapeHtml(token.answer)}">${escapeHtml(token.answer)}</button>
    `).join('');
    bindDynamicQuestionEvents();
  }

  function nextEmptyBlankIndex() {
    if (state.activeBlankIndex >= 0 && !state.filled[state.activeBlankIndex] && !isBlankCorrect(state.activeBlankIndex)) {
      return state.activeBlankIndex;
    }
    return nextEmptyIndexFrom(state.filled, state.currentAnswers);
  }

  function nextEmptyIndexFrom(filled, answers) {
    return filled.findIndex((value, index) => !(value && value.text === answers[index]));
  }

  function tokenById(tokenId) {
    return Array.from(els.wordBank.querySelectorAll('.cloze-token')).find((token) => token.dataset.tokenId === tokenId) || null;
  }

  function blankByIndex(index) {
    return els.sentenceText.querySelector(`[data-blank-index="${index}"]`);
  }

  function clearValidation() {
    els.sentenceText.querySelectorAll('.cloze-blank').forEach((blank) => blank.classList.remove('is-wrong', 'is-pop-correct', 'is-pop-wrong'));
    els.feedbackText.className = 'cloze-feedback';
  }

  function playEffectSound(kind) {
    const path = kind === 'wrong' ? '../sound/error.mp3' : '../sound/correct.mp3';
    try {
      if (state.effectAudio) {
        state.effectAudio.pause();
        state.effectAudio.currentTime = 0;
      }
      const audio = new Audio(path);
      audio.volume = kind === 'wrong' ? 0.42 : 0.5;
      state.effectAudio = audio;
      audio.addEventListener('ended', () => {
        if (state.effectAudio === audio) state.effectAudio = null;
      }, { once: true });
      audio.play().catch(() => {});
    } catch (_error) {}
  }

  function burstEffect(target, kind) {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const count = kind === 'wrong' ? 6 : 10;
    target.classList.remove('is-pop-correct', 'is-pop-wrong');
    window.requestAnimationFrame(() => {
      target.classList.add(kind === 'wrong' ? 'is-pop-wrong' : 'is-pop-correct');
      window.setTimeout(() => target.classList.remove('is-pop-correct', 'is-pop-wrong'), 430);
    });
    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement('span');
      const angle = (Math.PI * 2 * index) / count;
      const distance = kind === 'wrong' ? 28 : 38;
      particle.className = `cloze-effect-particle is-${kind}`;
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      document.body.appendChild(particle);
      window.setTimeout(() => particle.remove(), 560);
    }
  }

  function updateActiveBlank() {
    const nextIndex = nextEmptyBlankIndex();
    if (nextIndex < 0) {
      state.activeBlankIndex = -1;
    } else if (state.activeBlankIndex < 0 || state.filled[state.activeBlankIndex] || isBlankCorrect(state.activeBlankIndex)) {
      state.activeBlankIndex = nextIndex;
    }
    els.sentenceText.querySelectorAll('.cloze-blank').forEach((blank) => {
      blank.classList.toggle('is-active-target', Number(blank.dataset.blankIndex) === state.activeBlankIndex);
    });
  }

  function setActiveBlank(blankIndex) {
    if (state.questionSolved || isBlankCorrect(blankIndex)) return;
    state.activeBlankIndex = blankIndex;
    updateActiveBlank();
  }

  function isBlankCorrect(index) {
    const placed = state.filled[index];
    return Boolean(placed && placed.text === state.currentAnswers[index]);
  }

  function releasePlacedToken(placed) {
    if (!placed) return;
    const token = tokenById(placed.tokenId);
    if (token) {
      token.disabled = false;
      token.classList.remove('is-used', 'is-correct-choice');
    }
  }

  function clearBlank(blankIndex) {
    const blank = blankByIndex(blankIndex);
    state.filled[blankIndex] = null;
    if (blank) {
      blank.textContent = '';
      blank.className = 'cloze-blank';
    }
    state.activeBlankIndex = blankIndex;
    updateActiveBlank();
  }

  function placeToken(token, blankIndex = nextEmptyBlankIndex()) {
    if (!token || blankIndex < 0 || state.questionSolved) return;
    if (isBlankCorrect(blankIndex)) return;
    clearValidation();
    const tokenId = token.dataset.tokenId;
    const tokenText = token.dataset.tokenText;
    const previous = state.filled[blankIndex];
    releasePlacedToken(previous);
    state.filled[blankIndex] = { tokenId, text: tokenText };
    const blank = blankByIndex(blankIndex);
    if (blank) {
      blank.textContent = tokenText;
      blank.classList.add('is-filled');
    }
    token.disabled = true;
    token.classList.add('is-used');
    validatePlacedToken(blankIndex, token);
    updateActiveBlank();
  }

  function getRectOverlapArea(left, right) {
    const width = Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left));
    const height = Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top));
    return width * height;
  }

  function findBlankByOverlap(rect) {
    let best = null;
    let bestArea = 0;
    els.sentenceText.querySelectorAll('.cloze-blank').forEach((blank) => {
      const index = Number(blank.dataset.blankIndex);
      if (isBlankCorrect(index)) return;
      const area = getRectOverlapArea(rect, blank.getBoundingClientRect());
      if (area > bestArea) {
        best = blank;
        bestArea = area;
      }
    });
    return bestArea > 18 ? best : null;
  }

  function setDropTargetByGhost(ghost) {
    const rect = ghost.getBoundingClientRect();
    const target = findBlankByOverlap(rect);
    els.sentenceText.querySelectorAll('.cloze-blank').forEach((blank) => {
      blank.classList.toggle('is-drop-target', blank === target);
    });
    return target;
  }

  function clearDropTargets() {
    els.sentenceText.querySelectorAll('.cloze-blank').forEach((blank) => blank.classList.remove('is-drop-target'));
  }

  function endTokenDrag(token, movedEnough) {
    const drag = state.drag;
    if (!drag || drag.token !== token) return;
    const target = drag.ghost ? setDropTargetByGhost(drag.ghost) : null;
    if (drag.ghost && drag.ghost.parentNode) drag.ghost.parentNode.removeChild(drag.ghost);
    token.classList.remove('is-drag-source');
    state.drag = null;
    clearDropTargets();
    if (target) {
      placeToken(token, Number(target.dataset.blankIndex));
      return;
    }
    if (!movedEnough && !token.disabled) placeToken(token);
  }

  function moveTokenDrag(event) {
    const drag = state.drag;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const movedEnough = Math.hypot(dx, dy) > 6;
    drag.movedEnough = drag.movedEnough || movedEnough;
    if (!drag.ghost && drag.movedEnough) {
      const ghost = drag.token.cloneNode(true);
      ghost.classList.add('cloze-token-drag-ghost');
      ghost.style.width = `${drag.rect.width}px`;
      ghost.style.height = `${drag.rect.height}px`;
      document.body.appendChild(ghost);
      drag.ghost = ghost;
      drag.token.classList.add('is-drag-source');
    }
    if (!drag.ghost) return;
    drag.ghost.style.left = `${event.clientX - drag.offsetX}px`;
    drag.ghost.style.top = `${event.clientY - drag.offsetY}px`;
    setDropTargetByGhost(drag.ghost);
  }

  function startTokenPointerDrag(event, token) {
    if (token.disabled || state.questionSolved || event.button > 0) return;
    const rect = token.getBoundingClientRect();
    state.drag = {
      token,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      movedEnough: false,
      ghost: null
    };
    token.setPointerCapture?.(event.pointerId);
  }

  function removeBlank(blank) {
    if (state.questionSolved) return;
    const blankIndex = Number(blank.dataset.blankIndex);
    if (isBlankCorrect(blankIndex)) return;
    const placed = state.filled[blankIndex];
    if (!placed) return;
    releasePlacedToken(placed);
    clearBlank(blankIndex);
    clearValidation();
    updateActiveBlank();
  }

  function validatePlacedToken(blankIndex, token) {
    state.attempts += 1;
    const blank = blankByIndex(blankIndex);
    const placed = state.filled[blankIndex];
    const isCorrect = placed && placed.text === state.currentAnswers[blankIndex];
    if (blank) {
      blank.classList.toggle('is-correct', Boolean(isCorrect));
      blank.classList.toggle('is-wrong', !isCorrect);
    }
    if (isCorrect) {
      token.classList.add('is-correct-choice');
      els.feedbackText.textContent = '';
      els.feedbackText.className = 'cloze-feedback';
      playEffectSound('correct');
      burstEffect(blank, 'correct');
      if (state.filled.every((item, index) => item && item.text === state.currentAnswers[index])) {
        completeQuestion();
      } else {
        state.activeBlankIndex = nextEmptyIndexFrom(state.filled, state.currentAnswers);
        updateActiveBlank();
      }
      return;
    }
    state.wrongAttempts += 1;
    els.feedbackText.textContent = '';
    els.feedbackText.className = 'cloze-feedback';
    playEffectSound('wrong');
    burstEffect(blank, 'wrong');
    window.setTimeout(() => {
      const current = state.filled[blankIndex];
      if (!current || current.tokenId !== placed.tokenId) return;
      releasePlacedToken(current);
      clearBlank(blankIndex);
    }, 620);
  }

  function completeQuestion() {
    if (state.questionSolved) return;
    state.questionSolved = true;
    window.setTimeout(() => {
      state.score += 1;
      els.feedbackText.textContent = '';
      els.feedbackText.className = 'cloze-feedback';
      window.setTimeout(nextQuestion, 520);
    }, 180);
  }

  function nextQuestion() {
    state.index += 1;
    renderQuestion();
  }

  function renderComplete() {
    saveLearningReport();
    els.completeTitle.textContent = `${state.stage.title} 완료!`;
    els.completeSummary.textContent = `${state.questions.length}문항을 읽고 빈칸을 완성했어요.`;
    els.completeStats.innerHTML = `
      <div class="cloze-stat"><span>완성 문항</span><strong>${state.score} / ${state.questions.length}</strong></div>
      <div class="cloze-stat"><span>선택 횟수</span><strong>${state.attempts}회</strong></div>
      <div class="cloze-stat"><span>스테이지 문항</span><strong>${state.questions.length}개</strong></div>
    `;
    setScreen('complete');
  }

  function saveLearningReport() {
    if (!window.HahaLabLearningHarness || !state.stage || state.savedRunId) return;
    const total = Math.max(1, state.questions.length);
    const blankCounts = state.questions.map((question) => parseQuestion(question, state.stage.blankCount || 6).answers.length);
    const actualBlankCount = blankCounts.length ? Math.max(...blankCounts) : Number(state.stage.blankCount || 0);
    const wrongAttempts = Math.max(0, state.wrongAttempts || 0);
    const score = Math.max(0, Math.min(100, Math.round((state.score / total) * 100) - Math.min(24, wrongAttempts * 4)));
    const modeLabel = state.stage.mode === 'word' ? '단어카드 설명 빈칸' : state.stage.mode === 'news' ? '어린이뉴스 읽기 빈칸' : '그림일기 읽기 빈칸';
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'cardlab',
      reportScope: 'rehab',
      curriculumKey: 'cardlab-cloze-connect',
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      labTitle: 'CardLab 빈칸 연결 설명',
      totalQuestions: total,
      correctCount: state.score,
      wrongCount: wrongAttempts,
      score,
      accuracyScore: Math.round((state.score / total) * 100),
      durationSeconds: (Date.now() - (state.startedAtMs || Date.now())) / 1000,
      startedAtMs: state.startedAtMs || Date.now(),
      summary: `${modeLabel}에서 문장에 맞는 핵심 단어 선택과 읽기 흐름을 확인했습니다.`,
      overview: '문장 안의 빈칸을 순서대로 완성하는 과정은 어휘 의미 이해, 문장 구조 파악, 읽기 흐름 유지, 오류 후 자기수정을 함께 보여줍니다.',
      recommendations: [
        '틀린 빈칸은 바로 정답을 알려주기보다 앞뒤 단어를 다시 읽게 합니다.',
        '그림일기 단계에서는 완성 문장을 소리 내어 한 번 더 읽게 하면 읽기 이해가 안정됩니다.'
      ],
      focusKey: state.stage.mode === 'word' ? 'vocabulary-syntax' : state.stage.mode === 'news' ? 'news-reading' : 'diary-reading',
      focusLabel: modeLabel,
      details: {
        blank_count: actualBlankCount,
        blank_count_min: blankCounts.length ? Math.min(...blankCounts) : actualBlankCount,
        blank_count_total: blankCounts.reduce((sum, count) => sum + count, 0),
        configured_blank_count: Number(state.stage.blankCount || 0),
        mode: state.stage.mode
      }
    });
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
  }

  function bindDynamicQuestionEvents() {
    els.wordBank.querySelectorAll('.cloze-token').forEach((token) => {
      token.addEventListener('pointerdown', (event) => {
        startTokenPointerDrag(event, token);
      });
      token.addEventListener('pointermove', moveTokenDrag);
      token.addEventListener('pointerup', () => {
        endTokenDrag(token, Boolean(state.drag && state.drag.movedEnough));
      });
      token.addEventListener('pointercancel', () => {
        if (!state.drag || state.drag.token !== token) return;
        if (state.drag.ghost && state.drag.ghost.parentNode) state.drag.ghost.parentNode.removeChild(state.drag.ghost);
        token.classList.remove('is-drag-source');
        state.drag = null;
        clearDropTargets();
      });
      token.addEventListener('dragstart', (event) => {
        event.preventDefault();
      });
    });
    els.sentenceText.querySelectorAll('.cloze-blank').forEach((blank) => {
      blank.addEventListener('click', () => {
        if (state.filled[Number(blank.dataset.blankIndex)]) {
          removeBlank(blank);
          return;
        }
        setActiveBlank(Number(blank.dataset.blankIndex));
      });
      blank.addEventListener('dragover', (event) => {
        event.preventDefault();
        blank.classList.add('is-drop-target');
      });
      blank.addEventListener('dragleave', () => blank.classList.remove('is-drop-target'));
      blank.addEventListener('drop', (event) => {
        event.preventDefault();
        blank.classList.remove('is-drop-target');
        placeToken(tokenById(event.dataTransfer.getData('text/plain')), Number(blank.dataset.blankIndex));
      });
    });
    updateActiveBlank();
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
    els.stageGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (button) startStage(button.dataset.stageId);
    });
    els.stageButton.addEventListener('click', () => setScreen('stage'));
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || STAGES[0].id));
    els.otherStageButton.addEventListener('click', () => setScreen('stage'));
    els.helpButton.addEventListener('click', openHelp);
    els.helpClose.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHelp();
    });
  }

  function cacheElements() {
    [
      'stageView', 'gameView', 'completeView', 'stageGrid', 'stageLabel', 'stageButton',
      'cardHead', 'cardImage', 'imagePlaceholder',
      'feedbackText', 'sentenceText', 'wordBank', 'completeTitle', 'completeSummary', 'completeStats',
      'retryButton', 'otherStageButton', 'helpButton', 'helpModal', 'helpClose'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function init() {
    cacheElements();
    buildAssetMap();
    renderStages();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
