(function () {
  'use strict';

  const TITLE = '상황별 스크립트 순서 맞추기';
  const missingGroups = new Set([34, 36, 45, 62, 65]);
  const deletedGroups = new Set([50]);
  const titles = {
    1: '마트에서 장보기',
    2: '편의점에서 간식 사기',
    3: '빵집에서 빵 사기',
    4: '식당에서 밥 먹기',
    5: '카페에서 음료 주문하기',
    6: '병원 진료받기',
    7: '약국에서 약 받기',
    8: '미용실에서 머리 자르기',
    9: '도서관에서 책 빌리기',
    10: '문구점에서 준비물 사기',
    11: '장난감 가게에서 장난감 사기',
    12: '우체국에서 택배 보내기',
    13: '버스 타기',
    14: '지하철 타기',
    15: '놀이터에서 놀기',
    16: '키즈카페 이용하기',
    17: '수영장 이용하기',
    18: '영화관에서 영화 보기',
    19: '화장실 이용하기',
    20: '다이소에서 물건 사기',
    21: '무인 아이스크림 가게 이용하기',
    22: '무인 문구점 이용하기',
    23: '탕후루 가게에서 사기',
    24: '분식점에서 떡볶이 사기',
    25: '인형뽑기방에서 인형 뽑기',
    26: '마라탕 가게에서 먹기',
    27: '햄버거 가게 이용하기',
    28: '아이스크림 가게에서 주문하기',
    29: '서점에서 책 사기',
    30: '오락실에서 게임하기',
    31: '친구에게 인사하기',
    32: '친구에게 같이 놀자고 하기',
    33: '친구에게 장난감 빌려주기',
    34: '친구와 차례 기다리기',
    35: '급식에서 순서대로 급식을 받아요',
    36: '친구와 의견이 다를 때 말하기',
    37: '친구가 울 때 위로하기',
    38: '친구에게 사과하기',
    39: '친구가 나를 밀었을 때 말하기',
    40: '친구와 간식 나누기',
    41: '학교에 등교하기',
    42: '수업 시간에 발표하기',
    43: '선생님께 도움 요청하기',
    44: '숙제를 깜빡했을 때',
    45: '물건을 잃어버렸을 때 찾기',
    46: '미술 시간 활동하기',
    47: '체육 시간 활동하기',
    48: '가족과 외식하기',
    49: '부모님께 부탁하기',
    51: '낯선 사람이 말을 걸 때',
    52: '낯선 사람이 따라오라고 할 때',
    53: '길을 잃었을 때',
    54: '마트에서 부모님을 놓쳤을 때',
    55: '집에 혼자 있는데 문을 두드릴 때 대처하기',
    56: '모르는 전화가 왔을 때 대처하기',
    57: '길에서 돈을 주웠을 때',
    58: '친구가 위험한 장난을 할 때',
    59: '뜨거운 물건을 봤을 때',
    60: '비 오는 날 길 걷기',
    61: '횡단보도 건너기',
    62: '엘리베이터 타기',
    63: '에스컬레이터 타기',
    64: '물건을 잃어버렸을 때',
    65: '장난감이 고장 났을 때 해결하기',
    66: '넘어져서 다쳤을 때',
    67: '친구가 다쳤을 때',
    68: '불이 났을 때',
    69: '지진이 났을 때',
    70: '유리컵이 깨졌을 때'
  };

  const stages = [
    {
      id: 'daily-place',
      title: '생활 장소 상황',
      badge: '생활 장소',
      range: [1, 30],
      accent: '#22c55e',
      summary: '가게, 병원, 도서관처럼 생활 장소에서 필요한 행동 순서를 맞춰요.'
    },
    {
      id: 'friend-family-school',
      title: '친구·가족·학교 상황',
      badge: '관계와 학교',
      range: [31, 50],
      accent: '#3b82f6',
      summary: '친구, 가족, 학교생활에서 말하고 행동하는 순서를 살펴봐요.'
    },
    {
      id: 'safety-problem',
      title: '안전·문제해결 상황',
      badge: '안전 해결',
      range: [51, 70],
      accent: '#f97316',
      summary: '낯선 상황, 안전 문제, 응급 상황에서 해야 할 순서를 익혀요.'
    }
  ];

  function toPrompt(title) {
    return String(title || '')
      .replace(/하기$/, '해요!')
      .replace(/받기$/, '받아요!')
      .replace(/사기$/, '사요!')
      .replace(/먹기$/, '먹어요!')
      .replace(/읽기$/, '읽어요!')
      .replace(/보기$/, '봐요!')
      .replace(/타기$/, '타요!')
      .replace(/이용하기$/, '이용해요!')
      .replace(/주기$/, '줘요!')
      .replace(/나누기$/, '나눠요!')
      .replace(/말하기$/, '말해요!')
      .replace(/대처하기$/, '대처해요!')
      .replace(/요청하기$/, '요청해요!')
      .replace(/확인하기$/, '확인해요!')
      .replace(/해결하기$/, '해결해요!')
      .replace(/처치하기$/, '처치해요!')
      .replace(/도와주기$/, '도와줘요!')
      .replace(/대피하기$/, '대피해요!')
      .replace(/걷기$/, '걸어요!')
      .replace(/기다리기$/, '기다려요!')
      .replace(/등교하기$/, '등교해요!')
      .replace(/활동하기$/, '활동해요!');
  }

  function buildQuestion(number) {
    const stepNumbers = [1, 2, 3, 4, 5];
    const title = titles[number] || `${number}번 상황`;
    const enabled = !missingGroups.has(number);
    return {
      id: `situation-${number}`,
      number,
      title,
      prompt: toPrompt(title),
      enabled,
      expectedSteps: [1, 2, 3, 4, 5],
      cards: stepNumbers.map((step, index) => ({
        id: `situation-${number}-${index + 1}`,
        order: index + 1,
        fileStep: step,
        image: `images/situation/situation-${number}-${step}.webp`,
        alt: `${title} ${index + 1}단계`
      }))
    };
  }

  window.HAHA_LAB_SITUATION_SEQUENCE = {
    title: TITLE,
    curriculumKey: 'cardlab-situation-sequence',
    stages: stages.map((stage) => {
      const questions = [];
      for (let number = stage.range[0]; number <= stage.range[1]; number += 1) {
        if (deletedGroups.has(number)) {
          continue;
        }
        questions.push(buildQuestion(number));
      }
      return Object.assign({}, stage, {
        questionCount: questions.length,
        playableCount: questions.filter((question) => question.enabled).length,
        questions
      });
    }),
    assetAudit: {
      expectedGroups: 69,
      playableGroups: 64,
      missingGroups: Array.from(missingGroups),
      deletedGroups: Array.from(deletedGroups),
      irregularGroups: []
    }
  };
})();
