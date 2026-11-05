(function () {
  'use strict';

  const DEFAULT_METHOD = [
    '문제를 먼저 읽고, 화면에서 요구하는 목표 자극과 반응 방식을 확인합니다.',
    '카드, 숫자, 소리, 그림, 버튼 등 제시된 단서를 비교하면서 정답을 선택합니다.',
    '정답과 오답 피드백을 확인한 뒤 같은 기준을 다음 문항에 적용해 수행 흐름을 이어 갑니다.'
  ];
  const DEFAULT_BENEFIT = [
    '주의 집중, 과제 이해, 반응 전 확인 루틴을 함께 연습할 수 있습니다.',
    '시각 단서, 청각 단서, 언어 정보를 연결해 의미를 해석하는 힘을 기릅니다.',
    '반복 수행을 통해 기억 유지, 오류 수정, 반응 자신감을 높입니다.'
  ];
  const NUMBERLAB_HELP = {
    'number-learn': {
      subtitle: '숫자 모양, 읽기, 쓰기, 수량 개념을 함께 연결하는 기초 수 인지 학습입니다.',
      methodItems: ['숫자 모양을 보고 소리를 들으며 읽기를 연결합니다.', '주어진 수만큼 세어 보며 기호와 수량을 맞춥니다.', '따라 쓰기와 반복 확인으로 숫자 형태를 안정적으로 익힙니다.'],
      benefitItems: ['초기 수 개념과 수량 지각 형성에 도움이 됩니다.', '숫자 읽기와 쓰기의 기초 자동화를 돕습니다.', '기본 수 문해력을 키워 후속 수학 학습을 준비합니다.']
    },
    'number-explore': {
      subtitle: '숫자 찾기, 연결, 세기를 통합하여 수 개념을 확장하는 활동입니다.',
      methodItems: ['주어진 숫자 단서를 빠르게 식별하고 찾습니다.', '순서와 연결 규칙을 확인하며 수의 흐름을 익힙니다.', '보기와 수량을 비교하며 정답을 선택합니다.'],
      benefitItems: ['시각적 수 판별 속도가 향상됩니다.', '순서, 비교, 매칭 같은 기초 사고 기능을 함께 기릅니다.', '수 탐색 자신감을 키울 수 있습니다.']
    },
    'number-animal-code': {
      subtitle: '동물 수를 정확히 세고 순서대로 읽어 숫자 코드로 바꾸는 활동입니다.',
      methodItems: ['동물 종류를 구분하고 각각의 수를 차례대로 셉니다.', '제시된 순서를 지키며 수를 읽습니다.', '보기 코드를 비교하여 알맞은 표현을 고릅니다.'],
      benefitItems: ['수 세기와 순차 처리 능력을 함께 키울 수 있습니다.', '대상을 정보로 바꾸는 기초 코딩식 사고에 도움이 됩니다.', '집중력과 시각 분류 실력을 안정적으로 기릅니다.']
    },
    'number-sequence': {
      subtitle: '앞수, 뒷수, 중간수, 뛰어 세기를 통해 수 체계를 이해하는 활동입니다.',
      methodItems: ['주어진 수 흐름을 읽고 빈칸에 들어갈 수를 추론합니다.', '오름차순과 내림차순을 함께 경험합니다.', '일정한 간격으로 뛰어 세며 패턴을 찾습니다.'],
      benefitItems: ['수 체계와 순서 규칙 이해가 단단해집니다.', '계산 전 단계에 필요한 수 선행 사고를 키웁니다.', '빈칸 추론과 규칙 발견 능력을 기릅니다.']
    },
    'number-add-basic': {
      subtitle: '가로 수식을 보고 정답을 선택하거나 끌어 놓으며 덧셈 구조를 익히는 활동입니다.',
      methodItems: ['앞 수와 뒤 수를 보고 합을 먼저 생각합니다.', '보기 중 알맞은 결과를 고르거나 빈칸에 넣습니다.', '비슷한 수 표현을 비교하며 판단합니다.'],
      benefitItems: ['덧셈식을 전체로 보는 기초 계산 시야를 키웁니다.', '수 합성과 결과 예측 능력이 좋아집니다.', '문장제와 세로 계산 학습의 기초를 만듭니다.']
    },
    'number-sub-basic': {
      subtitle: '가로 수식에서 남는 수를 찾아 뺄셈 구조와 결과를 이해하는 활동입니다.',
      methodItems: ['전체 수에서 얼마를 빼는지 먼저 확인합니다.', '보기 결과를 비교하며 남는 수를 고릅니다.', '표현 순서를 유지하며 식 흐름을 읽습니다.'],
      benefitItems: ['뺄셈을 수량 변화로 이해하는 감각을 기릅니다.', '비교와 차이 판단 실력이 향상됩니다.', '생활 속 남는 양을 파악하는 힘을 돕습니다.']
    },
    'number-add-vertical': {
      subtitle: '자리값과 열 맞추기를 통해 세로 덧셈 구조를 익히는 활동입니다.',
      methodItems: ['위아래 수의 위치를 보며 같은 자리를 맞춥니다.', '세로줄 흐름대로 계산하고 정답을 선택합니다.', '두 수의 구성을 비교하며 합의 변화를 확인합니다.'],
      benefitItems: ['자리값 감각이 길러져 세로 계산 자신감이 높아집니다.', '식 정렬과 계산 절차 이해가 좋아집니다.', '학교 수학 형식에 적응하는 기초 습관을 만듭니다.']
    },
    'number-sub-vertical': {
      subtitle: '세로 계산에서 위치 맞추기와 남는 수 파악을 함께 훈련하는 활동입니다.',
      methodItems: ['세로로 정렬된 수를 자리별로 구분합니다.', '어느 수에서 어느 수를 빼는지 순서를 확인합니다.', '보기와 결과를 비교하며 오답 차이를 파악합니다.'],
      benefitItems: ['자리값 기반 뺄셈 구조를 안정적으로 익힙니다.', '수 차이 이해와 계산 절차 집중력을 키울 수 있습니다.', '세로 계산 문제의 정확도를 높입니다.']
    },
    'number-add-family': {
      subtitle: '하나의 기준 수를 유지한 채 다양한 수를 더하며 규칙을 찾는 활동입니다.',
      methodItems: ['기준 수가 어떻게 고정되는지 먼저 확인합니다.', '더해지는 수가 바뀔 때 결과가 어떻게 달라지는지 비교합니다.', '패턴을 이용해 더 빠르게 정답을 예측합니다.'],
      benefitItems: ['덧셈 규칙 일반화 능력을 기를 수 있습니다.', '계산을 암기가 아닌 구조 이해로 접근하게 됩니다.', '두 자리 수 확장 학습 준비가 쉬워집니다.']
    },
    'number-operation-board': {
      subtitle: '길을 따라 더하고 빼며 중간값과 도착값을 추적하는 연산 탐색 활동입니다.',
      methodItems: ['출발 숫자와 화살표 연산 순서를 먼저 확인합니다.', '각 칸을 지나며 중간 결과를 차례대로 계산합니다.', '시작, 중간, 끝값 중 무엇을 묻는지 확인하고 답합니다.'],
      benefitItems: ['연산 순서 처리와 절차적 사고를 키웁니다.', '문제 해결 과정을 끝까지 추적하는 집중력을 기릅니다.', '과정 중심 계산 능력을 키워 문장제 대비에 도움이 됩니다.']
    }
  };
  const CARDLAB_HELP = {
    quiz: {
      subtitle: '시각 카드의 이름과 특징을 빠르게 확인하며 범주화와 어휘 회상을 함께 훈련하는 활동입니다.',
      methodItems: ['제시된 카드의 시각 단서를 보고 사물명과 범주를 먼저 떠올립니다.', '비슷한 카드 간 핵심 특징을 비교하며 정답을 선택하거나 확인합니다.', '반복 노출을 통해 이름 회상, 범주 판단, 반응 속도를 안정적으로 높입니다.'],
      benefitItems: ['시각 단서에서 의미를 빠르게 추출하는 어휘 접근 능력을 강화합니다.', '범주화, 변별, 명칭 회상 과정을 함께 자극해 표현 어휘 확장에 도움이 됩니다.', '주의 집중과 처리 속도, 기억 유지 능력을 관찰하고 훈련할 수 있습니다.']
    },
    association: {
      subtitle: '핵심 단어와 의미가 이어지는 낱말을 연결하며 어휘 의미망과 연상 회상을 확장하는 학습입니다.',
      methodItems: ['제시어의 의미 범주와 관련 경험을 먼저 떠올립니다.', '후보 단어를 비교하며 의미적 관련성, 상위·하위 범주, 기능 관계를 판단합니다.', '정답 확인 후 연결 이유를 말로 설명하며 다음 문항으로 이어 갑니다.'],
      benefitItems: ['어휘 간 의미 관계를 조직화해 독해와 표현 언어의 기반을 강화합니다.', '단어 인출 속도와 의미 범주화 능력을 함께 높입니다.', '추론, 설명하기, 연상 전환 능력 향상에 도움이 됩니다.']
    },
    wordbuild: {
      subtitle: '그림과 의미 단서를 바탕으로 음절과 자모를 조합해 단어를 완성하는 초기 문해 학습입니다.',
      methodItems: ['이미지와 설명을 보고 목표 단어를 예측합니다.', '음절 순서와 자모 구조를 확인하며 빈칸을 채웁니다.', '힌트와 소리 단서를 활용해 스스로 오류를 수정합니다.'],
      benefitItems: ['음운 인식, 자모 결합, 철자화 능력을 통합적으로 훈련합니다.', '읽기 해독과 받아쓰기 준비에 필요한 소리-글자 대응을 강화합니다.', '시각 의미 단서와 문자 정보를 연결하는 초기 문해 기반을 다집니다.']
    },
    phonics: {
      subtitle: '소리와 글자의 대응을 듣고 구분하며 읽기와 쓰기의 기초를 세우는 음운 인식 학습입니다.',
      methodItems: ['제시된 소리를 듣고 해당 자모 또는 음절을 찾습니다.', '비슷한 소리를 비교하며 차이를 구분합니다.', '정답을 고른 뒤 소리와 글자를 다시 연결해 확인합니다.'],
      benefitItems: ['자모-음가 대응이 안정되어 초기 해독 정확도가 높아집니다.', '음운 변별과 청각 주의 집중 능력을 함께 기릅니다.', '읽기, 철자, 발음 교정의 기초 능력 향상에 도움이 됩니다.']
    },
    context: {
      subtitle: '문장 속 단서를 읽고 빈칸에 알맞은 낱말을 고르며 어휘와 문맥 이해를 함께 훈련합니다.',
      methodItems: ['빈칸 앞뒤 문장을 천천히 읽고 핵심 단서를 찾습니다.', '후보 낱말의 의미와 문장 흐름을 비교합니다.', '선택한 낱말을 넣어 자연스럽게 읽히는지 다시 확인합니다.'],
      benefitItems: ['문맥 기반 어휘 추론과 독해 이해력이 향상됩니다.', '어휘 선택, 문장 완성, 의미 통합 과정을 함께 연습합니다.', '읽기 이해와 쓰기 표현에서 적절한 낱말을 고르는 힘을 기릅니다.']
    },
    connective: {
      subtitle: '앞뒤 문장의 관계를 파악해 알맞은 접속어를 고르는 문장 연결 학습입니다.',
      methodItems: ['두 문장의 의미 관계를 먼저 확인합니다.', '원인-결과, 대조, 순서, 조건 등 연결 유형을 구분합니다.', '가장 자연스러운 접속어를 넣고 문장 전체를 다시 읽습니다.'],
      benefitItems: ['문장 간 논리 관계를 이해하는 독해력이 좋아집니다.', '서술형 쓰기와 말하기에서 자연스러운 연결 표현을 선택하는 능력을 기릅니다.', '추론, 비교, 순서화 같은 실행 기능 기반 언어 처리를 돕습니다.']
    },
    josa: {
      subtitle: '문장 성분과 받침 유무를 살펴 알맞은 조사를 고르는 기초 문법 학습입니다.',
      methodItems: ['빈칸 앞 단어와 뒤 문장 성분을 함께 읽습니다.', '받침 유무와 조사 기능을 비교해 자연스러운 조사를 고릅니다.', '정답 문장을 소리 내어 읽으며 어색함을 점검합니다.'],
      benefitItems: ['주어, 목적어, 장소, 방향 등 문장 성분 이해가 강화됩니다.', '받침에 따른 조사 선택과 문법적 정확성이 향상됩니다.', '읽기와 쓰기에서 어색한 문장 표현을 줄이는 데 도움이 됩니다.']
    },
    synonym: {
      subtitle: '제시어의 의미를 기준으로 유의어와 반의어를 구분하며 어휘 의미망을 확장합니다.',
      methodItems: ['제시어의 뜻과 쓰임을 먼저 떠올립니다.', '후보 낱말이 같은 뜻인지 반대 뜻인지 비교합니다.', '문맥에 넣어 가장 자연스러운 표현을 확인합니다.'],
      benefitItems: ['어휘 의미 관계를 체계적으로 조직화할 수 있습니다.', '독해에서 낱말 뜻을 추론하고 표현을 정교하게 선택하는 힘을 기릅니다.', '서술형 답안과 말하기에서 다양한 표현을 사용하는 데 도움이 됩니다.']
    },
    idiom: {
      subtitle: '속담, 관용 표현, 사자성어의 의미와 상황 맥락을 연결하는 고급 어휘 학습입니다.',
      methodItems: ['표현을 읽고 문자 그대로의 뜻과 실제 쓰임을 구분합니다.', '그림, 예문, 뜻풀이를 함께 보며 사용 상황을 파악합니다.', '정답을 확인한 뒤 비슷한 상황에서 어떻게 말할 수 있는지 떠올립니다.'],
      benefitItems: ['비유적 언어 이해와 고급 어휘 해석 능력을 강화합니다.', '문맥 추론, 사회적 상황 이해, 표현 선택 능력에 도움이 됩니다.', '독해와 대화에서 관용 표현을 자연스럽게 이해하는 기반을 만듭니다.']
    },
    sentence: {
      subtitle: '흩어진 문장 성분을 의미와 어순에 맞게 조립하며 문장 구성 능력을 기르는 학습입니다.',
      methodItems: ['제시된 낱말 또는 구를 읽고 문장의 핵심 의미를 파악합니다.', '주어, 서술어, 목적어, 수식어의 위치를 생각하며 순서를 맞춥니다.', '완성한 문장을 다시 읽고 자연스러운 어순인지 확인합니다.'],
      benefitItems: ['문장 구조 인식과 어순 처리 능력이 향상됩니다.', '읽기 이해, 쓰기 조직화, 문장 표현 정확도를 함께 훈련합니다.', '문법적 오류를 스스로 점검하는 메타언어 능력에 도움이 됩니다.']
    },
    'car-logo': {
      subtitle: '자동차 브랜드 로고를 시각적으로 변별하고 이름과 연결하는 시각-언어 매칭 학습입니다.',
      methodItems: ['로고의 형태, 색, 글자 단서를 관찰합니다.', '비슷한 로고를 비교하며 브랜드명을 떠올립니다.', '정답 확인 후 핵심 특징을 말로 설명합니다.'],
      benefitItems: ['시각 변별, 형태 기억, 명칭 회상을 함께 자극합니다.', '주의 집중과 세부 특징 탐색 능력을 기릅니다.', '일상 사물과 상징 정보를 언어로 연결하는 능력에 도움이 됩니다.']
    },
    cloze: {
      subtitle: '문장 빈칸에 알맞은 말을 넣으며 의미 예측과 문장 완성 능력을 훈련합니다.',
      methodItems: ['문장 전체를 읽고 빈칸의 역할을 파악합니다.', '앞뒤 의미 단서와 문법 단서를 함께 비교합니다.', '정답을 넣은 문장을 다시 읽어 자연스러운지 확인합니다.'],
      benefitItems: ['문맥 추론과 문장 이해의 정확도가 높아집니다.', '어휘 선택과 문법 판단을 동시에 연습할 수 있습니다.', '독해와 쓰기에서 빠진 정보를 예측하는 힘을 기릅니다.']
    },
    batchim: {
      subtitle: '받침이 있는 음절 구조를 보고 듣고 구분하며 한글 해독 정확도를 높이는 학습입니다.',
      methodItems: ['제시된 음절의 초성, 중성, 종성 위치를 확인합니다.', '받침 유무와 받침 소리를 비교해 목표 글자를 찾습니다.', '정답 음절을 읽으며 소리와 글자 구조를 연결합니다.'],
      benefitItems: ['종성 인식과 음절 구조 분석 능력이 향상됩니다.', '받침 읽기 오류를 줄이고 해독 정확도를 높입니다.', '받아쓰기와 초기 맞춤법 학습의 기반을 강화합니다.']
    },
    jamo: {
      subtitle: '자음과 모음을 결합해 음절을 만들며 한글 조합 원리를 익히는 학습입니다.',
      methodItems: ['목표 음절을 보고 필요한 자음과 모음을 구분합니다.', '자모를 조합해 완성 글자와 비교합니다.', '소리 내어 읽으며 자모 결합 결과를 확인합니다.'],
      benefitItems: ['한글의 조합 원리와 음절 구성 감각을 기릅니다.', '초기 읽기, 쓰기, 철자화의 기초 능력을 강화합니다.', '자모 단위 분석과 합성 능력을 함께 훈련합니다.']
    },
    hangul: {
      subtitle: '자음, 모음, 받침을 단계적으로 조합해 목표 한글 음절을 완성하는 구성 학습입니다.',
      methodItems: ['왼쪽 문제 음절의 구성 요소를 먼저 살펴봅니다.', '자음, 모음, 받침을 조절해 같은 음절을 만듭니다.', '완성 글자를 확인하고 정답 음절과 비교합니다.'],
      benefitItems: ['초성, 중성, 종성 위치 인식이 명확해집니다.', '한글 조합 원리와 음운-문자 대응 능력을 강화합니다.', '읽기와 쓰기 전 단계의 음절 구성 자신감을 높입니다.']
    },
    description: {
      subtitle: '설명을 듣거나 읽고 알맞은 카드를 찾으며 의미 단서 처리와 어휘 이해를 훈련합니다.',
      methodItems: ['제시된 설명에서 기능, 모양, 범주 단서를 찾습니다.', '후보 카드의 특징을 비교해 가장 알맞은 답을 고릅니다.', '정답 확인 후 어떤 단서가 결정적이었는지 말해 봅니다.'],
      benefitItems: ['언어 설명을 시각 정보와 연결하는 이해력이 향상됩니다.', '핵심 단서 추출, 범주화, 추론 능력을 함께 훈련합니다.', '청각·시각 정보를 통합해 어휘 의미를 확장합니다.']
    },
    zoo: {
      subtitle: '동물 소리를 듣고 알맞은 동물을 찾으며 청각 변별과 의미 연결을 훈련합니다.',
      methodItems: ['소리를 집중해서 듣고 동물의 특징을 떠올립니다.', '보기 동물의 이름과 이미지를 비교해 정답을 고릅니다.', '정답 소리와 이름을 다시 연결하며 기억합니다.'],
      benefitItems: ['청각 주의, 소리 변별, 의미 연결 능력을 강화합니다.', '동물 어휘와 특징 지식을 함께 확장합니다.', '듣기 기반 추론과 반응 선택 능력 향상에 도움이 됩니다.']
    },
    'half-reveal': {
      subtitle: '일부만 보이는 카드 단서를 전체 이미지로 통합하며 시지각 추론을 훈련합니다.',
      methodItems: ['가려진 카드에서 보이는 부분의 모양과 색을 관찰합니다.', '전체 사물을 예측하고 후보와 비교합니다.', '정답을 확인하며 어떤 단서가 도움이 됐는지 점검합니다.'],
      benefitItems: ['부분-전체 통합, 시각 폐쇄, 형태 추론 능력을 강화합니다.', '불완전한 정보를 바탕으로 의미를 예측하는 힘을 기릅니다.', '주의 깊은 관찰과 범주 단서 활용 능력을 높입니다.']
    }
  };

  function cleanText(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s*\n\s*/g, '\n')
      .trim();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cloneReadableText(node) {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll('button, script, style, audio, img, svg').forEach((child) => child.remove());
    clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
    return cleanText(clone.textContent || '');
  }

  function splitItems(value, fallback) {
    const text = cleanText(value);
    if (!text) return fallback.slice();
    const lines = text
      .split(/\n+/)
      .map((line) => line.replace(/^\s*(?:\d+[\.)]|[-•·])\s*/, '').trim())
      .filter(Boolean);
    if (lines.length > 1) return lines;
    const sentences = text
      .split(/(?<=[.!?]|[다요죠까임함됨됨니다세요])\s+/)
      .map((line) => line.replace(/^\s*(?:\d+[\.)]|[-•·])\s*/, '').trim())
      .filter(Boolean);
    return sentences.length ? sentences : fallback.slice();
  }

  function findSectionText(modal, regex) {
    if (!modal) return '';
    const headings = Array.from(modal.querySelectorAll('h3, h4, strong, b, .help-modal-section-title'));
    const heading = headings.find((node) => regex.test(cleanText(node.textContent || '')));
    if (!heading) return '';
    const section = heading.closest('section, article, .help-modal-section, .playlab-help-section, .playlab-snack-help-section, .playlab-iceword-help-section') || heading.parentElement;
    if (!section) return '';
    const clone = section.cloneNode(true);
    const clonedHeading = clone.querySelector('h3, h4, strong, b');
    if (clonedHeading) clonedHeading.remove();
    return cloneReadableText(clone);
  }

  function inferCardlabKey() {
    const config = window.CARDLAB_HELP_PAGE_CONFIG || {};
    const configuredKey = String(config.pageKey || '').trim();
    if (configuredKey) return configuredKey;
    const fileName = String(location.pathname || '').split('/').pop() || '';
    if (/car-logo/.test(fileName)) return 'car-logo';
    if (/cloze/.test(fileName)) return 'cloze';
    if (/batchim/.test(fileName)) return 'batchim';
    if (/jamo/.test(fileName)) return 'jamo';
    if (/hangul/.test(fileName)) return 'hangul';
    if (/description/.test(fileName)) return 'description';
    if (/zoo/.test(fileName)) return 'zoo';
    if (/half-reveal/.test(fileName)) return 'half-reveal';
    if (/idiom/.test(fileName)) return 'idiom';
    if (/sentence/.test(fileName)) return 'sentence';
    return '';
  }

  function inferConfigFromGlobals() {
    const config = window.PLAYLAB_PAGE_CONFIG || {};
    const cognitiveConfig = window.PLAYLAB_COGNITIVE_CONFIG || {};
    const cardlabConfig = window.CARDLAB_HELP_PAGE_CONFIG || {};
    const numberlabConfig = window.NUMBERLAB_STANDALONE_CONFIG || {};
    const numberHelp = NUMBERLAB_HELP[String(numberlabConfig.categoryId || '').trim()] || null;
    const cardlabKey = inferCardlabKey();
    const cardlabHelp = CARDLAB_HELP[cardlabKey] || null;
    const fileName = String(window.location.pathname || '').split('/').pop() || '';
    const isRehabLab = fileName.startsWith('rehablab-') || String(new URLSearchParams(window.location.search || '').get('labKind') || '').trim().toLowerCase() === 'rehab';
    const isCardlab = Boolean(cardlabHelp || fileName.startsWith('cardlab-'));
    const isNumberLab = Boolean(numberHelp || fileName.startsWith('number-'));
    const title = config.title || cognitiveConfig.title || cardlabConfig.title || document.title || '학습 안내';
    const subtitle = config.helpSummary || cognitiveConfig.helpSummary || cardlabConfig.subtitle || numberHelp?.subtitle || cardlabHelp?.subtitle || config.description || cognitiveConfig.description || (isRehabLab ? '인지재활 회기에서 과제 수행 방법과 관찰 지표를 확인합니다.' : '');
    return {
      title,
      subtitle,
      method: Array.isArray(cardlabConfig.methodItems) ? cardlabConfig.methodItems.join('\n') : (Array.isArray(numberHelp?.methodItems) ? numberHelp.methodItems.join('\n') : (Array.isArray(cardlabHelp?.methodItems) ? cardlabHelp.methodItems.join('\n') : (config.helpHow || cognitiveConfig.helpHow || ''))),
      benefit: Array.isArray(cardlabConfig.benefitItems) ? cardlabConfig.benefitItems.join('\n') : (Array.isArray(numberHelp?.benefitItems) ? numberHelp.benefitItems.join('\n') : (Array.isArray(cardlabHelp?.benefitItems) ? cardlabHelp.benefitItems.join('\n') : (config.helpBenefit || cognitiveConfig.helpBenefit || ''))),
      preferGlobal: Boolean(numberHelp || cardlabHelp),
      guideLabel: config.guideLabel || cognitiveConfig.guideLabel || (numberHelp ? 'NUMBER GUIDE' : (isRehabLab ? 'REHABLAB GUIDE' : (isCardlab ? 'CARDLAB GUIDE' : 'PLAYLAB GUIDE'))),
      fileName,
      isRehabLab,
      isCardlab,
      isNumberLab,
      cognitiveMode: String(cognitiveConfig.mode || '').trim(),
      cardlabKey,
      numberCategoryId: String(numberlabConfig.categoryId || '').trim()
    };
  }

  function buildSpecializedHelp(context) {
    const fileName = String(context.fileName || '').toLowerCase();
    const mode = String(context.cognitiveMode || '').toLowerCase();
    const title = String(context.title || '').trim();
    const includes = (...tokens) => tokens.some((token) => fileName.includes(token) || title.includes(token));
    const pack = (subtitle, method, benefit, professional) => ({ subtitle, method: method.join('\n'), benefit: benefit.join('\n'), professional });

    if (includes('maze') || mode === 'maze') {
      return pack(
        '강아지를 목적지까지 데려가며 경로 계획, 공간 방향 판단, 오류 수정 전략을 함께 보는 미로 실행기능 학습입니다.',
        ['강아지와 목적지, 막힌 길의 위치를 먼저 확인합니다.', '바로 누르기보다 갈 수 있는 길을 눈으로 따라가며 예상 경로를 세웁니다.', '한 칸씩 이동하면서 현재 위치와 목적지 방향을 계속 비교합니다.', '막다른 길을 만나면 되돌아가 다른 경로를 다시 계획합니다.'],
        ['계획 세우기와 경로 예측을 연습합니다.', '공간 방향 이해, 위치 추적, 시각 탐색을 지원합니다.', '충동적 선택을 줄이고 멈춰서 확인하는 반응 조절을 돕습니다.', '시각-운동 협응과 오류 후 재진입 전략을 관찰할 수 있습니다.'],
        ['첫 이동 전 대기 시간, 막힌 길 진입 횟수, 되돌아가기 전략, 현재 위치 재확인 여부를 함께 기록합니다.', '도착 여부만 보지 않고 경로 수정 방식과 도움 단서 의존도를 보면 실행기능, 시각-공간 처리, 반응 억제 수준을 회기 안에서 더 구체적으로 설명할 수 있습니다.']
      );
    }
    if (includes('doorlock')) {
      return pack(
        '제시된 비밀번호를 기억해 같은 순서로 입력하며 순차 작업기억과 기능적 기억 사용을 관찰하는 학습입니다.',
        ['불빛, 숫자, 소리 등 제시 단서를 끝까지 확인합니다.', '숫자와 #의 순서를 머릿속으로 유지합니다.', '제시가 끝난 뒤 같은 순서로 도어락을 입력합니다.', '오류가 나면 어느 위치에서 순서가 흔들렸는지 다시 확인합니다.'],
        ['순차 작업기억과 청각·시각 정보 유지에 도움이 됩니다.', '일상 도어락, 비밀번호, 절차 기억과 연결해 연습할 수 있습니다.', '주의 지속, 순서 조직, 입력 전 자기점검을 지원합니다.', '반응 억제와 오류 수정 과정을 관찰할 수 있습니다.'],
        ['전문가 활용 시에는 첫 오류 위치, 반복 오류 숫자, 제시 후 입력까지의 지연 시간, # 입력 누락 여부를 기록합니다.', '비밀번호 전체를 외우는지, 묶어서 기억하는지, 한 자리씩 따라가는지에 따라 작업기억 전략과 일상 기능 지원 수준을 구분할 수 있습니다.']
      );
    }
    if (includes('dot-memory', 'orbit-color-memory', 'color-sequence') || mode === 'color-sequence') {
      return pack(
        '짧게 제시된 색, 위치, 순서 정보를 유지하고 다시 선택하며 시각 작업기억과 순차 처리를 보는 학습입니다.',
        ['먼저 제시되는 색이나 위치의 순서를 차분히 봅니다.', '사라진 뒤에도 순서를 말로 되뇌거나 위치를 떠올립니다.', '기억한 순서대로 선택하거나 같은 색을 찾습니다.', '틀렸을 때는 색 변별 문제인지 순서 유지 문제인지 다시 확인합니다.'],
        ['시각 단기기억과 순차 작업기억을 지원합니다.', '주의 유지, 색 변별, 위치 기억을 함께 연습합니다.', '제시 후 반응까지 정보를 붙잡아 두는 힘을 기릅니다.', '오류 후 자기점검과 재시도 전략을 관찰할 수 있습니다.'],
        ['정답률보다 제시 중 시선 유지, 반응 전 망설임, 앞부분 또는 뒷부분 오류 반복을 함께 봅니다.', '색 이름 말하기, 위치 말하기, 손가락으로 순서 짚기 같은 단서가 수행을 안정화하는지 확인하면 다음 난이도와 치료 단서 수준을 정하기 쉽습니다.']
      );
    }
    if (includes('icon-find', 'visual-cancellation', 'figure-ground')) {
      return pack(
        '복잡한 보기 안에서 목표 자극을 찾으며 선택적 주의, 시각 탐색, 세부 변별을 관찰하는 학습입니다.',
        ['목표 그림의 모양, 색, 방향 같은 핵심 특징을 먼저 확인합니다.', '왼쪽에서 오른쪽, 위에서 아래처럼 일정한 탐색 순서를 정합니다.', '비슷한 보기와 목표 보기를 비교하며 정확히 선택합니다.', '놓친 항목이 있는지 마지막에 다시 훑어봅니다.'],
        ['선택적 주의와 시각 탐색 전략을 지원합니다.', '유사 자극 사이의 세부 변별 능력을 기릅니다.', '과제 지속성과 반응 정확도를 함께 연습합니다.', '학습지, 교실 게시물, 생활 물건 찾기 장면과 연결해 볼 수 있습니다.'],
        ['전문가는 탐색 방향의 일관성, 같은 위치 반복 누락, 좌우 또는 상하 편향, 빠른 오답 클릭 여부를 기록합니다.', '속도만 높이는 것보다 체계적 탐색 루틴을 만드는 것이 중요하며, 필요하면 줄 가리개나 손가락 추적 단서를 단계적으로 줄여 갑니다.']
      );
    }
    if (includes('reaction-switch')) {
      return pack(
        '기준 그림을 먼저 보고, 색 신호에 따라 “같은 범주” 또는 “다른 범주” 보기로 반응을 바꾸는 신호-규칙 전환 학습입니다.',
        ['기준 그림의 범주를 먼저 확인합니다. 예: 동물, 음식, 탈것처럼 어떤 무리에 속하는지 봅니다.', '문제 신호 색을 확인합니다. 초록 신호는 같은 무리, 빨강 신호는 다른 무리를 고릅니다.', '보기 그림을 하나씩 비교하며 기준 그림과 같은 범주인지, 다른 범주인지 판단합니다.', '누르기 전에 “초록=같은 무리, 빨강=다른 무리” 규칙을 한 번 멈춰 확인합니다.', '오답이 나오면 그림 이름보다 신호 색과 범주 판단 중 어디에서 흔들렸는지 다시 봅니다.'],
        ['충동적으로 먼저 보이는 그림을 누르는 반응을 줄이고, 신호를 확인한 뒤 선택하는 억제 조절을 연습합니다.', '같은 자극을 보더라도 초록/빨강 신호에 따라 반응 기준을 바꾸는 인지전환을 지원합니다.', '그림 이름 맞히기보다 범주화, 선택주의, 반응속도-정확도 균형을 함께 다룹니다.', '교실 지시 따르기, 규칙이 바뀌는 게임, “멈추고 다시 확인하기” 같은 일상 실행기능과 연결됩니다.'],
        ['전문가는 정답률만 보지 말고 첫 반응까지의 시간, 신호 색 확인 여부, 초록/빨강 전환 직후 오류, 같은 범주와 다른 범주 중 어느 조건에서 오류가 많은지를 분리해 기록합니다.', '오답 해석은 어휘 지식 부족, 범주화 어려움, 신호-반응 규칙 혼동, 충동적 클릭을 구분해야 합니다. 같은 그림 자극에서도 신호에 따라 정반대 반응이 요구되므로, 수행 결과는 반응억제와 인지유연성 관찰 자료로 보는 것이 적절합니다.', '중재 시에는 속도를 먼저 높이기보다 “기준 확인 → 신호 색 말하기 → 같은/다른 판단 → 선택” 루틴을 안정화합니다. 안정되면 보기 유사도, 신호 전환 빈도, 제한 시간을 단계적으로 올립니다.']
      );
    }
    if (includes('icon-odd', 'shape-match-gonogo', 'traffic-go-nogo', 'stroop') || mode === 'reaction') {
      return pack(
        '규칙에 맞게 반응을 선택하거나 멈추며 억제 조절, 인지 전환, 규칙 유지를 관찰하는 학습입니다.',
        ['현재 문제의 규칙이나 신호를 먼저 확인합니다.', '익숙한 반응을 바로 누르지 않고 잠깐 멈춘 뒤 비교합니다.', '같은 것, 다른 것, 누르면 안 되는 것을 구분해 선택합니다.', '오답 후에는 신호와 기준을 다시 말로 확인합니다.'],
        ['반응 억제와 선택 주의를 연습합니다.', '규칙이 바뀌는 상황에서 인지 전환을 지원합니다.', '속도와 정확도의 균형을 치료적으로 관찰할 수 있습니다.', '교실 규칙 따르기, 차례 기다리기, 충동적 선택 줄이기와 연결됩니다.'],
        ['첫 반응까지의 시간, 신호 확인 여부, 같은 유형의 반복 오답, 규칙 전환 직후 오류를 기록합니다.', '오답을 “실패”로만 보지 말고 아이가 어떤 단서를 놓쳤는지 확인하면 억제 조절 문제인지, 규칙 이해 문제인지, 시각 변별 문제인지 나누어 볼 수 있습니다.']
      );
    }
    if (includes('pattern', 'missing-piece', 'partial-card', 'shape-piece', 'shape-sequence', 'mental-rotation') || mode === 'pattern') {
      return pack(
        '시각 단서의 규칙, 부분-전체 관계, 형태 변화를 비교하며 비언어 추론과 시지각 통합을 보는 학습입니다.',
        ['제시된 그림이나 도형의 공통점을 먼저 찾습니다.', '색, 모양, 방향, 위치, 반복 순서를 나누어 비교합니다.', '빈칸이나 빠진 조각에 들어갈 후보를 추론합니다.', '정답 후에는 어떤 단서가 결정적이었는지 말로 정리합니다.'],
        ['시각 추론과 규칙 발견을 지원합니다.', '부분-전체 통합, 형태 변별, 공간 관계 이해를 연습합니다.', '작업기억 안에서 여러 단서를 유지하고 비교하는 힘을 기릅니다.', '말로 근거를 설명하며 메타인지와 표현을 함께 다룰 수 있습니다.'],
        ['정답 여부와 함께 어떤 차원을 먼저 보았는지, 한 가지 단서에만 고착되는지, 회전·방향·위치 변화에서 오류가 늘어나는지 기록합니다.', '난이도 조절은 보기 수보다 단서 차원 수, 유사도, 규칙 길이를 기준으로 하는 것이 임상적으로 더 유용합니다.']
      );
    }
    if (includes('memory-train', 'spatial-item-memory', 'face-name-memory', 'pair-memory', 'sequence-memory')) {
      return pack(
        '제시된 정보의 위치, 순서, 짝, 이름을 유지하고 다시 찾아내며 기억 부호화와 인출 과정을 관찰하는 학습입니다.',
        ['처음 제시되는 그림, 위치, 이름, 순서를 천천히 확인합니다.', '기억해야 할 목표를 말로 되뇌거나 특징과 연결합니다.', '화면이 바뀐 뒤 같은 정보나 알맞은 짝을 선택합니다.', '틀렸을 때는 저장 단계와 찾기 단계 중 어디가 어려웠는지 확인합니다.'],
        ['시각 기억, 연합 기억, 작업기억 유지에 도움이 됩니다.', '주의 깊게 보고 의미 있게 연결하는 부호화 전략을 연습합니다.', '지연 후 다시 떠올리는 인출 과정을 관찰할 수 있습니다.', '이름 기억, 물건 위치 기억, 지시 따르기 같은 생활 기능과 연결됩니다.'],
        ['전문가는 제시 중 시선 유지, 말로 되뇌기 사용, 보기 전환 후 혼동 항목, 유사 자극 간 오류를 기록합니다.', '기억 실패가 저장 부족인지 인출 단서 부족인지 구분하기 위해 즉시 재인, 단서 제공 후 재인, 반복 노출 후 수행 변화를 비교하는 것이 좋습니다.']
      );
    }
    if (includes('card-spotlight', 'spotlight')) {
      return pack(
        '짧게 비춰지는 그림 단서를 보고 이름과 특징을 판단하며 시각 주의, 빠른 명칭 회상, 의미 단서 연결을 보는 학습입니다.',
        ['그림이 보이는 동안 전체 윤곽과 핵심 특징을 빠르게 확인합니다.', '색, 모양, 부분 단서, 배경 단서를 이용해 어떤 대상인지 떠올립니다.', '정답과 오답 버튼을 누르기 전에 대상 이름과 근거를 한 번 더 확인합니다.', '정답 후에는 어떤 단서로 알았는지 짧게 말해 봅니다.'],
        ['선택적 시각 주의와 세부 관찰을 지원합니다.', '빠르게 본 정보를 이름으로 연결하는 명칭 회상과 의미 접근을 연습합니다.', '부분 단서에서 전체 대상을 추론하는 시각 폐쇄와 범주화를 돕습니다.', '반응 속도와 정확도의 균형, 충동적 판단 여부를 함께 관찰할 수 있습니다.'],
        ['전문가는 첫 반응까지의 시간, 부분 단서만 보고 성급히 판단하는지, 이름은 알지만 버튼 선택에서 흔들리는지, 오답 후 근거 설명이 가능한지를 기록합니다.', '이 활동은 단순한 그림 맞히기가 아니라 시각 정보 처리, 어휘 인출, 의미 범주화, 반응 억제가 동시에 요구되는 과제이므로 수행 결과를 영역별로 나누어 해석하는 것이 좋습니다.']
      );
    }
    if (includes('situation-sequence', 'story-sequence')) {
      return pack(
        '상황 그림의 앞뒤 관계를 파악해 순서대로 배열하며 이야기 이해, 시간 개념, 사건 조직화를 관찰하는 학습입니다.',
        ['각 그림에서 누가 무엇을 하는지 먼저 확인합니다.', '처음, 다음, 마지막에 해당하는 장면 단서를 찾습니다.', '원인과 결과가 자연스럽게 이어지도록 카드를 순서대로 놓습니다.', '완성 후 전체 이야기를 한 문장씩 말하며 흐름을 다시 확인합니다.'],
        ['시간 순서 이해와 이야기 조직화를 지원합니다.', '원인-결과 추론, 장면 간 연결, 핵심 사건 파악을 연습합니다.', '말하기와 쓰기 전 단계에서 사건을 차례대로 설명하는 힘을 기릅니다.', '생활 루틴 이해, 사회적 상황 파악, 이야기 회상 활동과 연결할 수 있습니다.'],
        ['전문가는 아이가 장면을 개별로만 보는지, 전후 관계를 비교하는지, 원인-결과 단서를 활용하는지, 순서를 맞힌 뒤 말로 재구성할 수 있는지를 함께 기록합니다.', '정답 배열만 확인하지 말고 “왜 이 장면이 먼저인지”를 설명하게 하면 언어 이해, 추론, 작업기억, 표현 조직화 수준을 더 구체적으로 볼 수 있습니다.']
      );
    }
    if (includes('snack', 'icecream', 'photo-word', 'initial-sound', 'sound-find', 'syllable')) {
      return pack(
        '그림, 소리, 음절, 이름을 연결하며 어휘 접근, 음운 인식, 청각-시각 통합을 관찰하는 언어 기반 학습입니다.',
        ['그림이나 소리를 먼저 확인하고 목표 낱말을 떠올립니다.', '첫소리, 음절 수, 이름 단서를 비교합니다.', '보기 중 가장 알맞은 이름이나 소리 단서를 선택합니다.', '정답 후에는 단어를 다시 말하거나 음절로 나누어 확인합니다.'],
        ['어휘 이해와 명칭 회상을 지원합니다.', '청각 변별, 음운 인식, 음절 조합을 연습합니다.', '그림-소리-문자 연결을 강화합니다.', '발음, 읽기 준비, 표현 어휘 확장 활동과 연결할 수 있습니다.'],
        ['오답이 음운 혼동인지, 이름 인출 어려움인지, 그림 의미 이해 부족인지 나누어 기록합니다.', '전문가 활용 시에는 정답 뒤에 “왜 그 소리인지”, “몇 음절인지”, “첫소리가 무엇인지”를 짧게 말하게 하여 음운 단서 사용과 의미 연결을 함께 확인합니다.']
      );
    }
    if (includes('hamburger', 'supermarket', 'time-dayparts', 'taegeukgi')) {
      return pack(
        '생활 장면 안에서 순서 파악, 선택 유지, 상황 단서 이해, 기능적 의사결정을 함께 다루는 일상 기반 학습입니다.',
        ['현재 화면이 어떤 장소와 상황인지 먼저 확인합니다.', '해야 할 행동의 순서를 말로 정리합니다.', '필요한 메뉴, 물건, 시간 표현, 상징 단서를 선택합니다.', '마지막에 내가 한 선택이 상황에 맞는지 다시 확인합니다.'],
        ['일상생활 절차 이해와 실행기능을 지원합니다.', '상황 단서 읽기, 선택 유지, 순서 기억을 연습합니다.', '기능적 어휘와 의사소통 표현을 자연스럽게 다룰 수 있습니다.', '가정, 지역사회, 학교생활 장면으로 일반화하기 좋습니다.'],
        ['전문가는 화면 전환마다 목표를 이해하는지, 불필요한 선택을 억제하는지, 순서를 놓쳤을 때 도움 단서로 회복하는지 기록합니다.', '실제 생활 과제와 연결할 때는 정답률보다 준비-선택-확인-완료의 루틴이 안정되는지를 보는 것이 중요합니다.']
      );
    }
    if (context.isNumberLab || fileName.startsWith('number-')) {
      return {
        professional: [
          '수학 활동은 답만 맞히는 과제가 아니라 수량 확인, 순서 추적, 중간값 유지, 절차적 주의가 어떻게 작동하는지 보는 관찰 장면입니다. 아이가 어떤 수를 먼저 보았는지, 손가락 세기나 말로 세기를 사용하는지, 중간 계산을 유지하는지 함께 기록합니다.',
          '난이도 조절은 숫자 크기, 보기 유사도, 단계 수, 시간 압박을 기준으로 천천히 조정합니다. 설명하게 하기, 수량을 다시 세게 하기, 오류가 난 위치를 표시하기를 활용하면 수 감각과 자기점검을 함께 지원할 수 있습니다.'
        ]
      };
    }
    return {};
  }

  function buildProfessionalAnalysis(context, methodItems, benefitItems) {
    if (Array.isArray(context.professionalItems) && context.professionalItems.length) {
      return context.professionalItems;
    }
    const methodText = methodItems.join(' ');
    const benefitText = benefitItems.join(' ');
    const fileName = String(context.fileName || '').toLowerCase();
    if (context.isRehabLab) {
      return [
        '재활 환경에서는 이 활동을 단순한 게임이 아니라 회기 내 수행 관찰 과제로 사용할 수 있습니다. 정답률만 보지 않고 반응 전 멈춤, 오류 후 재시도 방식, 후반부 피로도, 단서 의존도, 평균 반응시간을 함께 보면 주의 지속, 작업기억, 억제 조절, 시지각 처리의 변화를 더 안정적으로 설명할 수 있습니다.',
        '인지재활에서는 같은 난이도를 반복해 수행 안정성을 확인한 뒤 자극 수, 보기 유사도, 시간 제한, 규칙 전환을 조금씩 조절하는 방식이 적절합니다. 보호자 상담이나 임상 기록에서는 화면 과제 결과를 일상 기능으로 바로 단정하지 않고, 실제 책상 활동, 물건 찾기, 순서 기억, 대화 중 자기점검과 연결해 해석하는 것이 좋습니다.'
      ];
    }
    if (context.isNumberLab || /number/.test(fileName)) {
      return [
        '수학 학습 환경에서는 숫자를 암기시키기보다 수량, 순서, 자리값, 연산 절차를 시각적으로 확인하게 하는 데 초점을 둡니다. 정답까지의 과정, 중간값 추적, 오답 선택 패턴을 함께 보면 수 감각, 작업기억, 절차적 주의가 어느 부분에서 흔들리는지 파악할 수 있습니다.',
        '센터나 가정 지도에서는 속도보다 정확한 수량 확인과 설명을 우선합니다. 아이가 어떤 수를 어떻게 세었는지 말로 설명하게 하면 계산 결과뿐 아니라 수 개념의 형성 정도, 규칙 이해, 문장제 준비도를 함께 관찰할 수 있습니다.'
      ];
    }
    if (context.isCardlab || /cardlab/.test(fileName)) {
      const isLanguageHeavy = /(phonics|josa|cloze|context|connective|wordbuild|sentence|idiom|synonym|batchim|jamo|hangul)/.test(String(context.cardlabKey || '') + ' ' + fileName);
      if (isLanguageHeavy) {
        return [
          '언어치료와 문해 지도 환경에서는 소리, 글자, 의미, 문장 맥락을 연결하는 과정을 관찰하는 데 활용할 수 있습니다. 아이가 정답을 맞혔는지뿐 아니라 어떤 단서에 주목했는지, 음운 단서를 활용했는지, 문장 전체 의미를 다시 확인했는지를 함께 보는 것이 중요합니다.',
          '읽기·쓰기 준비 단계에서는 반복 노출보다 정확한 단서 연결이 더 중요합니다. 정답 후에는 왜 그 답이 되는지 짧게 말하게 하거나, 비슷한 표현과 비교하게 하면 어휘 의미망, 음운 인식, 문법 판단, 자기점검 능력을 함께 강화할 수 있습니다.'
        ];
      }
      return [
        '인지·언어 통합 환경에서는 카드의 모양, 색, 범주, 이름을 빠르게 연결하는 수행을 관찰할 수 있습니다. 시각 변별, 명칭 회상, 범주화, 의미 연결이 동시에 요구되므로 오답이 발생한 지점을 보면 단순 기억 문제인지, 시각 단서 처리 문제인지, 이름 인출 문제인지 구분하는 데 도움이 됩니다.',
        '가정과 센터에서는 정답 카드만 반복하기보다 핵심 특징을 말로 설명하게 하는 방식이 좋습니다. “무엇을 보고 알았는지”를 말하게 하면 관찰력, 표현 언어, 의미 추론, 주의 집중을 함께 다룰 수 있습니다.'
      ];
    }
    if (/taegeukgi-maker/.test(fileName)) {
      return [
        '이 활동은 국경일과 태극기 게양일을 태극기 만들기 과제와 연결해, 아이가 날짜와 상징의 의미를 함께 이해하도록 돕습니다. 날짜 지도에서 날의 의미를 먼저 확인한 뒤 태극 문양과 4괘를 직접 구성하므로 역사 이해, 상징 인식, 시각 구성 활동이 자연스럽게 이어집니다.',
        '지도 시에는 정답 여부만 확인하기보다 어떤 국경일인지, 왜 태극기를 다는지, 태극기의 어느 부분을 먼저 놓았는지 짧게 말하게 하면 좋습니다. 이 과정에서 나라 사랑, 절차 계획, 위치 기억, 오류 수정 전략을 함께 관찰할 수 있습니다.'
      ];
    }
    if (/playlab-maze-planner/.test(fileName) || context.cognitiveMode === 'maze') {
      return [
        '이 활동은 강아지를 목적지까지 이동시키는 미로 과제를 통해 계획 수립, 공간 방향 판단, 경로 유지, 오류 수정 과정을 관찰하는 데 적합합니다. 아이가 바로 누르기 전에 전체 길과 막힌 길을 살펴보는지, 막다른 길을 만났을 때 되돌아가거나 다른 경로를 찾는지 확인할 수 있습니다.',
        '전문가 활용 시에는 정답 도착 여부만 보지 말고 첫 이동 전 대기 시간, 막힌 길 진입 횟수, 되돌아가는 전략, 현재 위치 재확인, 도움말 없이 경로를 다시 잡는지를 함께 기록합니다. 주의 지속, 시각-공간 처리, 실행기능, 반응 억제, 시각-운동 협응을 회기 안에서 관찰하는 자료로 사용할 수 있습니다.'
      ];
    }
    return [
      `이 활동은 ${benefitText || '주의 집중, 기억 유지, 단서 활용'}을 회기 안에서 반복 관찰하는 데 도움이 됩니다. 학습 방법은 ${methodText || '문제 확인, 단서 비교, 정답 선택'}의 흐름으로 구성되어 있어 아이가 과제 규칙을 이해하고 스스로 점검하는 과정을 확인할 수 있습니다.`,
      '활용 시에는 한 번의 점수보다 반복 회기에서의 변화가 더 중요합니다. 정답률, 반응시간, 오답 후 회복, 도움 단서 사용 여부를 함께 기록하면 학습 효과와 다음 난이도 조정 방향을 더 분명하게 정할 수 있습니다.'
    ];
  }

  function inferConfigFromModal() {
    const modal = document.getElementById('helpModal');
    const globals = inferConfigFromGlobals();
    const specialized = buildSpecializedHelp(globals);
    const enhancedGlobals = Object.assign({}, globals, {
      professionalItems: Array.isArray(specialized.professional) ? specialized.professional : []
    });
    const modalTitle = modal && modal.querySelector('#helpModalTitle, #helpTitle, .help-modal-title, .playlab-snack-modal-title, .playlab-iceword-modal-title, .spotlight-modal-title, .colorseq-help-card h3, h3');
    const summaryNode = modal && modal.querySelector('#helpModalDesc, #helpSummary, .help-modal-subtitle, .playlab-help-summary, .playlab-snack-help-summary, .playlab-iceword-help-summary, .spotlight-modal-copy');
    const directHowNode = modal && modal.querySelector('#helpHow');
    const directBenefitNode = modal && modal.querySelector('#helpBenefit');
    const legacyMethod = cloneReadableText(directHowNode) || findSectionText(modal, /(하는\s*방법|학습\s*방법|학습방법)/);
    const legacyBenefit = cloneReadableText(directBenefitNode) || findSectionText(modal, /(어디에\s*좋은가요|학습\s*효과|학습효과|학습\s*포인트|도움)/);
    const method = specialized.method || (globals.preferGlobal ? (globals.method || legacyMethod) : (legacyMethod || globals.method));
    const benefit = specialized.benefit || (globals.preferGlobal ? (globals.benefit || legacyBenefit) : (legacyBenefit || globals.benefit));
    return {
      title: cleanText(modalTitle && modalTitle.textContent) || globals.title || '학습 안내',
      subtitle: specialized.subtitle || cloneReadableText(summaryNode) || globals.subtitle || '학습을 시작하기 전에 방법과 효과를 먼저 확인해 보세요.',
      methodItems: splitItems(method, DEFAULT_METHOD),
      benefitItems: splitItems(benefit, DEFAULT_BENEFIT),
      guideLabel: globals.guideLabel || 'PLAYLAB GUIDE',
      globals: enhancedGlobals
    };
  }

  function buildList(items) {
    return items
      .map((item, index) => `<li data-index="${index + 1}">${escapeHtml(item)}</li>`)
      .join('');
  }

  function ensureModal() {
    let modal = document.getElementById('playlabUnifiedHelpModal');
    if (modal) return modal;
    const content = inferConfigFromModal();
    modal = document.createElement('div');
    modal.id = 'playlabUnifiedHelpModal';
    modal.className = 'playlab-unified-help-modal';
    modal.setAttribute('aria-hidden', 'true');
    const professionalItems = buildProfessionalAnalysis(content.globals || {}, content.methodItems, content.benefitItems);
    modal.innerHTML = [
      '<div class="playlab-unified-help-backdrop" data-unified-help-close></div>',
      '<section class="playlab-unified-help-card" role="dialog" aria-modal="true" aria-labelledby="playlabUnifiedHelpTitle" aria-describedby="playlabUnifiedHelpSummary">',
      '  <div class="playlab-unified-help-inner">',
      '    <div class="playlab-unified-help-head">',
      '      <div class="playlab-unified-help-heading">',
      `      <span class="playlab-unified-help-eyebrow">${escapeHtml(content.guideLabel)}</span>`,
      `      <h2 id="playlabUnifiedHelpTitle" class="playlab-unified-help-title">${escapeHtml(content.title)}</h2>`,
      `      <p id="playlabUnifiedHelpSummary" class="playlab-unified-help-summary">${escapeHtml(content.subtitle)}</p>`,
      '      </div>',
      '    </div>',
      '    <div class="playlab-unified-help-grid">',
      '      <article class="playlab-unified-help-section is-method">',
      '        <h3><span class="playlab-unified-help-badge">1</span>학습방법</h3>',
      `        <ol class="playlab-unified-help-list">${buildList(content.methodItems)}</ol>`,
      '      </article>',
      '      <article class="playlab-unified-help-section is-benefit">',
      '        <h3><span class="playlab-unified-help-badge">2</span>어디에 좋은가요</h3>',
      `        <ul class="playlab-unified-help-list">${buildList(content.benefitItems)}</ul>`,
      '      </article>',
      '    </div>',
      '    <article class="playlab-unified-help-prose">',
      '      <h3>전문 활용 포인트</h3>',
      professionalItems.map((item) => `      <p>${escapeHtml(item)}</p>`).join(''),
      '    </article>',
      '    <div class="playlab-unified-help-actions">',
      '      <button type="button" class="playlab-unified-help-dismiss" data-unified-help-primary>다시 보지 않기</button>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join('');
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.matches('[data-unified-help-close]')) closeModal();
      if (target.matches('[data-unified-help-primary]')) {
        closeModal();
      }
    });
    return modal;
  }

  function closeLegacyModal() {
    const legacyModal = document.getElementById('helpModal');
    if (!legacyModal) return;
    legacyModal.setAttribute('aria-hidden', 'true');
    legacyModal.classList.remove('is-open', 'is-active', 'active', 'show');
  }

  function openModal() {
    closeLegacyModal();
    const modal = ensureModal();
    modal.dataset.openMode = 'manual';
    const primaryButton = modal.querySelector('[data-unified-help-primary]');
    if (primaryButton) {
      primaryButton.textContent = '닫기';
      primaryButton.classList.remove('playlab-unified-help-dismiss');
      primaryButton.classList.add('playlab-unified-help-bottom-close');
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('playlab-unified-help-open');
    const button = modal.querySelector('[data-unified-help-dismiss]');
    if (button) window.setTimeout(() => button.focus({ preventScroll: true }), 30);
  }

  function closeModal() {
    const modal = document.getElementById('playlabUnifiedHelpModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('playlab-unified-help-open');
  }

  let initialized = false;

  function revealHelpButton(helpButton) {
    if (!helpButton) return;
    helpButton.classList.remove('shell-hidden', 'is-hidden', 'hidden');
    helpButton.hidden = false;
    helpButton.removeAttribute('aria-hidden');
    helpButton.removeAttribute('tabindex');
  }

  function bindHelpButton(helpButton) {
    if (!helpButton || helpButton.dataset.unifiedHelpBound === '1') return false;
    helpButton.dataset.unifiedHelpBound = '1';
    revealHelpButton(helpButton);
    initialized = true;
    closeLegacyModal();
    helpButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openModal();
    }, true);
    return true;
  }

  function init() {
    if (initialized) return;
    const immediateButton = document.getElementById('helpButton');
    if (bindHelpButton(immediateButton)) return;
    const observer = new MutationObserver(() => {
      const helpButton = document.getElementById('helpButton');
      if (bindHelpButton(helpButton)) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 8000);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
