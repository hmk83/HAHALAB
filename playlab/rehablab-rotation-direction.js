(function () {
  'use strict';

  const LAB_TITLE = '방향 회전 재활 훈련';
  const REPORT_TYPE = 'rehablab-rotation-direction';
  const REPORT_SCOPE = 'rehab';
  const DEFAULT_SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const ASSET_BASE = '/playlab/images/rotation-direction/';
  const TOTAL_QUESTIONS = 10;

  const AGE_GROUPS = {
    toddler: { label: '유아', range: '4-6세', baseLimitMs: 60000, benchmarkMs: 18000, normProfile: 'preschool-supported', allowance: 0.24 },
    child: { label: '초등', range: '7-12세', baseLimitMs: 52000, benchmarkMs: 15000, normProfile: 'elementary-supported', allowance: 0.18 },
    teen: { label: '청소년', range: '13-18세', baseLimitMs: 45000, benchmarkMs: 13000, normProfile: 'adolescent-supported', allowance: 0.14 },
    adult: { label: '성인', range: '19-64세', baseLimitMs: 45000, benchmarkMs: 12000, normProfile: 'adult-rehab-supported', allowance: 0.16 },
    senior: { label: '고령자', range: '65세 이상', baseLimitMs: 65000, benchmarkMs: 20000, normProfile: 'senior-rehab-supported', allowance: 0.26 }
  };

  const OBJECT_ASSETS = [
    { fileName: 'bag.webp', label: '가방' },
    { fileName: 'ball.webp', label: '공' },
    { fileName: 'bear.webp', label: '곰' },
    { fileName: 'car.webp', label: '자동차' },
    { fileName: 'cat.webp', label: '고양이' },
    { fileName: 'chair.webp', label: '의자' },
    { fileName: 'chicken.webp', label: '닭' },
    { fileName: 'chopsticks.webp', label: '젓가락' },
    { fileName: 'clock.webp', label: '시계' },
    { fileName: 'cow.webp', label: '젖소' },
    { fileName: 'crocodile.webp', label: '악어' },
    { fileName: 'cup.webp', label: '컵' },
    { fileName: 'desk.webp', label: '책상' },
    { fileName: 'dog.webp', label: '강아지' },
    { fileName: 'dolphin.webp', label: '돌고래' },
    { fileName: 'duck.webp', label: '오리' },
    { fileName: 'elephant.webp', label: '코끼리' },
    { fileName: 'eraser.webp', label: '지우개' },
    { fileName: 'fish.webp', label: '물고기' },
    { fileName: 'fox.webp', label: '여우' },
    { fileName: 'frying-pan.webp', label: '프라이팬' },
    { fileName: 'giraffe.webp', label: '기린' },
    { fileName: 'goat.webp', label: '염소' },
    { fileName: 'hat.webp', label: '모자' },
    { fileName: 'horse.webp', label: '말' },
    { fileName: 'lion.webp', label: '사자' },
    { fileName: 'monkey.webp', label: '원숭이' },
    { fileName: 'notebook.webp', label: '노트' },
    { fileName: 'pencil.webp', label: '연필' },
    { fileName: 'penguin.webp', label: '펭귄' },
    { fileName: 'pig.webp', label: '돼지' },
    { fileName: 'plate.webp', label: '접시' },
    { fileName: 'pot.webp', label: '냄비' },
    { fileName: 'rabbit.webp', label: '토끼' },
    { fileName: 'sheep.webp', label: '양' },
    { fileName: 'snake.webp', label: '뱀' },
    { fileName: 'sneakers.webp', label: '운동화' },
    { fileName: 'soap.webp', label: '비누' },
    { fileName: 'socks.webp', label: '양말' },
    { fileName: 'spoon.webp', label: '숟가락' },
    { fileName: 'telephone.webp', label: '전화기' },
    { fileName: 'tiger.webp', label: '호랑이' },
    { fileName: 'toothbrush.webp', label: '칫솔' },
    { fileName: 'toothpaste.webp', label: '치약' },
    { fileName: 'towel.webp', label: '수건' },
    { fileName: 'tshirt.webp', label: '티셔츠' },
    { fileName: 'turtle.webp', label: '거북이' },
    { fileName: 'umbrella.webp', label: '우산' },
    { fileName: 'whale.webp', label: '고래' },
    { fileName: 'wolf.webp', label: '늑대' }
  ];

  const SCENE_ASSETS = [
    { fileName: 'baker-02.webp', label: '제빵 장면' },
    { fileName: 'baker-03.webp', label: '제빵 장면' },
    { fileName: 'baker-04.webp', label: '제빵 장면' },
    { fileName: 'baker-05.webp', label: '제빵 장면' },
    { fileName: 'basketball-05.webp', label: '농구 장면' },
    { fileName: 'bathroom-03.webp', label: '화장실 장면' },
    { fileName: 'bathroom-04.webp', label: '화장실 장면' },
    { fileName: 'bathroom-05.webp', label: '화장실 장면' },
    { fileName: 'bedroom-04.webp', label: '침실 장면' },
    { fileName: 'bedroom-05.webp', label: '침실 장면' },
    { fileName: 'brushing-teeth-02.webp', label: '양치 장면' },
    { fileName: 'brushing-teeth-03.webp', label: '양치 장면' },
    { fileName: 'brushing-teeth-04.webp', label: '양치 장면' },
    { fileName: 'brushing-teeth-05.webp', label: '양치 장면' },
    { fileName: 'cafe-02.webp', label: '카페 장면' },
    { fileName: 'cafe-03.webp', label: '카페 장면' },
    { fileName: 'classroom-02.webp', label: '교실 장면' },
    { fileName: 'classroom-03.webp', label: '교실 장면' },
    { fileName: 'classroom-04.webp', label: '교실 장면' },
    { fileName: 'classroom-05.webp', label: '교실 장면' },
    { fileName: 'convenience-store-02.webp', label: '편의점 장면' },
    { fileName: 'convenience-store-04.webp', label: '편의점 장면' },
    { fileName: 'cooking-02.webp', label: '요리 장면' },
    { fileName: 'cooking-03.webp', label: '요리 장면' },
    { fileName: 'cooking-04.webp', label: '요리 장면' },
    { fileName: 'cooking-05.webp', label: '요리 장면' },
    { fileName: 'dentist-02.webp', label: '치과 장면' },
    { fileName: 'dentist-03.webp', label: '치과 장면' },
    { fileName: 'dentist-04.webp', label: '치과 장면' },
    { fileName: 'dentist-05.webp', label: '치과 장면' },
    { fileName: 'hair-designer-02.webp', label: '미용실 장면' },
    { fileName: 'hair-designer-03.webp', label: '미용실 장면' },
    { fileName: 'hair-designer-04.webp', label: '미용실 장면' },
    { fileName: 'hair-designer-05.webp', label: '미용실 장면' },
    { fileName: 'hospital-02.webp', label: '병원 장면' },
    { fileName: 'hospital-03.webp', label: '병원 장면' },
    { fileName: 'hospital-05.webp', label: '병원 장면' },
    { fileName: 'kindergarten-02.webp', label: '유치원 장면' },
    { fileName: 'kindergarten-03.webp', label: '유치원 장면' },
    { fileName: 'kindergarten-04.webp', label: '유치원 장면' },
    { fileName: 'kindergarten-05.webp', label: '유치원 장면' },
    { fileName: 'library-02.webp', label: '도서관 장면' },
    { fileName: 'library-03.webp', label: '도서관 장면' },
    { fileName: 'mart-02.webp', label: '마트 장면' },
    { fileName: 'mart-03.webp', label: '마트 장면' },
    { fileName: 'mart-04.webp', label: '마트 장면' },
    { fileName: 'mart-05.webp', label: '마트 장면' },
    { fileName: 'pharmacy-04.webp', label: '약국 장면' },
    { fileName: 'pharmacy-05.webp', label: '약국 장면' },
    { fileName: 'playground-02.webp', label: '놀이터 장면' },
    { fileName: 'playground-03.webp', label: '놀이터 장면' },
    { fileName: 'playground-04.webp', label: '놀이터 장면' },
    { fileName: 'playground-05.webp', label: '놀이터 장면' },
    { fileName: 'post-office-02.webp', label: '우체국 장면' },
    { fileName: 'post-office-03.webp', label: '우체국 장면' },
    { fileName: 'post-office-04.webp', label: '우체국 장면' },
    { fileName: 'sports-field-04.webp', label: '운동장 장면' },
    { fileName: 'sports-field-05.webp', label: '운동장 장면' },
    { fileName: 'stationery-store-02.webp', label: '문구점 장면' },
    { fileName: 'stationery-store-03.webp', label: '문구점 장면' },
    { fileName: 'stationery-store-04.webp', label: '문구점 장면' },
    { fileName: 'stationery-store-05.webp', label: '문구점 장면' },
    { fileName: 'swimming-pool-03.webp', label: '수영장 장면' },
    { fileName: 'swimming-pool-04.webp', label: '수영장 장면' },
    { fileName: 'swimming-pool-05.webp', label: '수영장 장면' },
    { fileName: 'taekwondo-02.webp', label: '태권도 장면' },
    { fileName: 'taekwondo-03.webp', label: '태권도 장면' },
    { fileName: 'taekwondo-04.webp', label: '태권도 장면' },
    { fileName: 'taekwondo-05.webp', label: '태권도 장면' }
  ];

  const ROTATION_ASSETS = OBJECT_ASSETS.concat(SCENE_ASSETS);

  const ASSET_POOL = ROTATION_ASSETS.map((asset) => {
    const stem = asset.fileName.replace(/\.webp$/i, '');
    return {
      id: stem,
      topicId: stem.replace(/-(02|03|04|05)$/i, ''),
      label: asset.label,
      suffix: stem.match(/-(02|03|04|05)$/i)?.[1] || '',
      src: `${ASSET_BASE}${encodeURIComponent(asset.fileName)}`
    };
  });

  const DIRECTION_OPTIONS = [
    { key: 'up', label: '위', degrees: 0 },
    { key: 'right', label: '오른쪽', degrees: 90 },
    { key: 'down', label: '아래', degrees: 180 },
    { key: 'left', label: '왼쪽', degrees: 270 }
  ];

  const LEVELS = [
    {
      key: 'lv1-single-under',
      index: 1,
      title: '단일 방향 회전',
      clinicalLabel: '시지각 회전 기초',
      desc: '오른쪽 또는 왼쪽 한 방향으로 90-270도만 회전합니다.',
      questionCount: TOTAL_QUESTIONS,
      labKind: 'rehab',
      maxUnderOneTurn: true,
      requiresOverOneTurn: false,
      mixedDirections: false,
      limitMs: 0,
      timeRatio: 1,
      turns: [[90], [-90], [180], [-180], [270], [-270], [90], [-90], [180], [-180]]
    },
    {
      key: 'lv2-single-over',
      index: 2,
      title: '한 방향 누적 회전',
      clinicalLabel: '회전 작업기억 확장',
      desc: '같은 방향 회전 지시를 2개 이상 합쳐 한 바퀴 이상 누적합니다.',
      questionCount: TOTAL_QUESTIONS,
      labKind: 'rehab',
      maxUnderOneTurn: false,
      requiresOverOneTurn: true,
      mixedDirections: false,
      limitMs: 45000,
      timeRatio: 1.18,
      turns: [[270, 180], [-270, -180], [180, 270], [-180, -270], [270, 270], [-270, -270], [180, 180], [-180, -180], [90, 270], [-90, -270]]
    },
    {
      key: 'lv3-mixed-under',
      index: 3,
      title: '좌우 혼합 회전',
      clinicalLabel: '방향 전환 억제',
      desc: '왼쪽과 오른쪽 지시를 섞되 전체 회전 부담은 한 바퀴를 넘지 않습니다.',
      questionCount: TOTAL_QUESTIONS,
      labKind: 'rehab',
      maxUnderOneTurn: true,
      requiresOverOneTurn: false,
      mixedDirections: true,
      limitMs: 50000,
      timeRatio: 1.28,
      turns: [[90, -90], [-90, 180], [180, -90], [-180, 90], [90, -180], [-90, 180], [90, -180], [-90, 180], [90, -90, 90], [-90, 90, -90]]
    },
    {
      key: 'lv4-mixed-over',
      index: 4,
      title: '복합 누적 회전',
      clinicalLabel: '고부하 공간 추론',
      desc: '좌우 회전 지시를 2개 이상 합쳐 한 바퀴 이상 누적합니다.',
      questionCount: TOTAL_QUESTIONS,
      labKind: 'rehab',
      maxUnderOneTurn: false,
      requiresOverOneTurn: true,
      mixedDirections: true,
      limitMs: 60000,
      timeRatio: 1.45,
      turns: [[270, -90, 180], [-270, 90, -180], [180, 270, -90], [-180, -270, 90], [270, 270, -180], [-270, -270, 180], [180, -90, 270], [-180, 90, -270], [270, -180, 270], [-270, 180, -270]]
    }
  ];

  const RESEARCH_NOTES = [
    'Mental rotation 과제는 회전 각도 부담이 커질수록 정답률이 낮아지고 반응시간이 길어지는 경향이 있어 정확도와 처리시간을 함께 해석합니다.',
    '재활·언어치료·발달장애 아동 사용 맥락에서는 초반부터 빠른 반응을 요구하기보다 정확한 전략 형성과 충분한 반응 대기 시간을 우선합니다.',
    '본 결과는 회기 내 수행을 구조화한 재활 관찰 자료이며 의학적 진단을 대체하지 않습니다.'
  ];

  const RESEARCH_REFERENCES = [
    { title: 'Scientific Reports, 2026. Unraveling children’s mental rotation', url: 'https://www.nature.com/articles/s41598-026-40912-w' },
    { title: 'Frontiers in Psychology, 2020. Is Early Spatial Skills Training Effective?', url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.01938/full' },
    { title: 'Frontiers in Psychology, 2018. Three-year-olds and mental rotation', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6180201/' }
  ];

  const elements = {};
  const state = {
    ageKey: '',
    levelKey: '',
    questions: [],
    index: 0,
    startedAt: 0,
    questionStartedAt: 0,
    timerId: 0,
    rafId: 0,
    locked: false,
    savedRunId: '',
    logs: []
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const percent = (value, total) => total ? Math.round((Number(value || 0) / total) * 100) : 0;
  const average = (items) => {
    const nums = items.map(Number).filter((value) => Number.isFinite(value) && value > 0);
    return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : 0;
  };

  function normalizeDegrees(value) {
    return ((value % 360) + 360) % 360;
  }

  function buildTurns(rawTurns) {
    return rawTurns.map((degrees) => ({
      direction: degrees >= 0 ? 'right' : 'left',
      degrees,
      label: `${degrees >= 0 ? '오른쪽' : '왼쪽'} ${Math.abs(degrees)}도`
    }));
  }

  function isValidTurnSequence(stage, turns) {
    if (!Array.isArray(turns) || !turns.length) return false;
    if (turns.some((degrees) => !Number.isInteger(degrees) || degrees === 0 || Math.abs(degrees) % 90 !== 0)) return false;
    const absoluteTotal = turns.reduce((sum, degrees) => sum + Math.abs(degrees), 0);
    const hasRight = turns.some((degrees) => degrees > 0);
    const hasLeft = turns.some((degrees) => degrees < 0);
    if (stage.maxUnderOneTurn && absoluteTotal >= 360) return false;
    if (stage.requiresOverOneTurn && absoluteTotal < 360) return false;
    if (stage.mixedDirections && !(hasRight && hasLeft)) return false;
    if (!stage.mixedDirections && hasRight && hasLeft) return false;
    return true;
  }

  function enumerateTurnBank(stage) {
    const lengths = stage.index === 1
      ? [1]
      : (stage.requiresOverOneTurn
        ? (stage.mixedDirections ? [3] : [2])
        : (stage.mixedDirections ? [2, 3] : [1]));
    const candidates = [90, 180, 270, -90, -180, -270];
    const seen = new Set();
    const bank = [];

    function visit(targetLength, stack) {
      if (stack.length === targetLength) {
        if (!isValidTurnSequence(stage, stack)) return;
        const key = stack.join(',');
        if (seen.has(key)) return;
        seen.add(key);
        bank.push(stack.slice());
        return;
      }
      candidates.forEach((degrees) => {
        stack.push(degrees);
        visit(targetLength, stack);
        stack.pop();
      });
    }

    lengths.forEach((length) => visit(length, []));
    return bank;
  }

  function buildQuestionItem(stage, turns, index, asset) {
    const normalizedTurns = buildTurns(turns);
    const answerDegrees = normalizeDegrees(normalizedTurns.reduce((sum, turn) => sum + turn.degrees, 0));
    return {
      id: `${stage.key}-${index + 1}`,
      asset,
      order: index + 1,
      turns: normalizedTurns,
      answerDegrees,
      options: DIRECTION_OPTIONS.map((option) => Object.assign({}, option, { correct: option.degrees === answerDegrees }))
    };
  }

  function buildStageItems(stage, turnSets, assetList) {
    return turnSets.map((turns, index) => {
      const fallbackIndex = ((stage.index - 1) * TOTAL_QUESTIONS) + index;
      const asset = assetList[index] || ASSET_POOL[fallbackIndex] || ASSET_POOL[index % ASSET_POOL.length];
      return buildQuestionItem(stage, turns, index, asset);
    });
  }

  function buildRandomStageItems(stage) {
    const turns = shuffle(stage.turnBank).slice(0, stage.questionCount);
    const assets = shuffle(ASSET_POOL).slice(0, stage.questionCount);
    return buildStageItems(stage, turns, assets);
  }

  LEVELS.forEach((stage) => {
    stage.turnBank = enumerateTurnBank(stage);
    stage.items = buildStageItems(stage, stage.turns, ASSET_POOL.slice((stage.index - 1) * TOTAL_QUESTIONS));
  });

  function getAge() {
    return AGE_GROUPS[state.ageKey] || null;
  }

  function getLevel() {
    return LEVELS.find((level) => level.key === state.levelKey) || null;
  }

  function getLimitMs(age, level) {
    if (!level || Number(level.limitMs) <= 0) return 0;
    const ageBase = Number(age?.baseLimitMs || level.limitMs || 0);
    const levelFloor = Number(level.limitMs || 0);
    return Math.round(Math.max(ageBase, levelFloor) * (level.timeRatio || 1));
  }

  function shuffle(list) {
    const copy = Array.isArray(list) ? list.slice() : [];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function showFeedback(kind) {
    const overlay = window.HahaFeedbackOverlay || window.PlaylabFeedbackOverlay;
    if (overlay && typeof overlay.showQuestionComplete === 'function') {
      overlay.showQuestionComplete(kind, { sound: true, durationMs: 850 });
    }
  }

  function setScreen(name) {
    ['menuView', 'gameView', 'resultView'].forEach((id) => {
      elements[id].classList.toggle('is-active', id === `${name}View`);
    });
    elements.stageButton.classList.toggle('odd-hidden', name === 'menu');
    if (name === 'menu') {
      elements.progressChip.textContent = '스테이지 선택';
    } else if (name === 'result') {
      elements.progressChip.textContent = '리포트';
    }
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'result', {
        title: () => `${LAB_TITLE}-${getLevel()?.title || '리포트'}`
      });
    }
    if (name !== 'game') stopTimer();
  }

  function renderLevels() {
    elements.levelGrid.innerHTML = LEVELS.map((level) => (
      `<button type="button" class="traffic-level-card" data-level="${level.key}" aria-pressed="false">
        <span>LV${level.index}</span>
        <h2>${level.title}</h2>
        <p>${level.desc}</p>
      </button>`
    )).join('');
  }

  function polarToCartesian(centerX, centerY, radius, degrees) {
    const radians = ((degrees - 90) * Math.PI) / 180;
    return {
      x: centerX + (radius * Math.cos(radians)),
      y: centerY + (radius * Math.sin(radians))
    };
  }

  function buildTurnArcPath(startDegrees, turnDegrees) {
    const radius = 24;
    const start = polarToCartesian(36, 36, radius, startDegrees);
    const end = polarToCartesian(36, 36, radius, normalizeDegrees(startDegrees + turnDegrees));
    const largeArcFlag = Math.abs(turnDegrees) > 180 ? 1 : 0;
    const sweepFlag = turnDegrees > 0 ? 1 : 0;
    return `M${start.x.toFixed(2)} ${start.y.toFixed(2)} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }

  function renderTurnIcon(turn, index, startDegrees) {
    const units = clamp(Math.round(Math.abs(turn.degrees) / 90), 1, 3);
    const directionLabel = turn.direction === 'right' ? '오른쪽' : '왼쪽';
    const markerId = `rotation-arrow-${state.index}-${index}-${turn.direction}-${units}`;
    const path = buildTurnArcPath(startDegrees, turn.degrees);
    const stepDots = Array.from({ length: units }, () => '<i aria-hidden="true"></i>').join('');
    return `<span class="odd-rotation-cue ${turn.direction === 'right' ? 'is-right' : 'is-left'}" aria-label="${index + 1}번째 지시: ${directionLabel} 회전">
      <b>${index + 1}</b>
      <svg class="odd-rotation-icon" viewBox="0 0 72 72" aria-hidden="true" focusable="false">
        <defs>
          <marker id="${markerId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z"></path>
          </marker>
        </defs>
        <path class="odd-axis" d="M36 8 V64 M8 36 H64"></path>
        <circle class="odd-center-dot" cx="36" cy="36" r="2.4"></circle>
        <path class="odd-arc" d="${path}" marker-end="url(#${markerId})"></path>
      </svg>
      <span class="odd-turn-meta" aria-hidden="true"><em>${stepDots}</em></span>
    </span>`;
  }

  function updateMenuState() {
    document.querySelectorAll('[data-age]').forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.age === state.ageKey);
    });
    document.querySelectorAll('[data-level]').forEach((button) => {
      const selected = button.dataset.level === state.levelKey;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    const age = getAge();
    const level = getLevel();
    elements.startButton.disabled = !(age && level);
    elements.startButton.textContent = age && level
      ? `${age.label} · ${level.title} 시작`
      : '연령과 레벨을 선택해 주세요';
  }

  function startGame() {
    const age = getAge();
    const level = getLevel();
    if (!age || !level) return;
    state.questions = buildRandomStageItems(level).map((item) => Object.assign({}, item, { options: shuffle(item.options) }));
    state.index = 0;
    state.startedAt = Date.now();
    state.savedRunId = '';
    state.logs = [];
    elements.gameKicker.textContent = `${age.label} ${age.range} · ${level.clinicalLabel}`;
    setScreen('game');
    renderQuestion();
  }

  function renderQuestion() {
    const question = state.questions[state.index];
    const age = getAge();
    const level = getLevel();
    if (!question || !age || !level) {
      finishGame();
      return;
    }
    state.locked = false;
    state.questionStartedAt = Date.now();
    const limitMs = getLimitMs(age, level);
    elements.progressChip.textContent = `${state.index + 1} / ${state.questions.length}`;
    elements.roundCounter.textContent = `문항 ${state.index + 1} / ${state.questions.length}`;
    elements.gameTitle.textContent = '그림을 지시대로 돌리면 어느 방향이 될까요?';
    elements.questionImage.src = question.asset.src;
    elements.questionImage.alt = `${question.asset.label} 회전 기준 그림`;
    elements.questionImage.style.transform = 'rotate(0deg)';
    elements.cueList.dataset.count = String(question.turns.length);
    let startDegrees = 0;
    elements.cueList.innerHTML = question.turns.map((turn, index) => {
      const markup = renderTurnIcon(turn, index, startDegrees);
      startDegrees = normalizeDegrees(startDegrees + turn.degrees);
      return markup;
    }).join('');
    elements.choiceGrid.innerHTML = question.options.map((option) => (
      `<button type="button" class="odd-choice" data-degrees="${option.degrees}" data-correct="${option.correct ? 'true' : 'false'}" aria-label="${option.label} 방향">
        <span class="odd-choice-label">${option.label}</span>
        <img src="${question.asset.src}" alt="" style="transform: rotate(${option.degrees}deg);">
      </button>`
    )).join('');
    elements.choiceGrid.querySelectorAll('[data-degrees]').forEach((button) => {
      button.addEventListener('click', () => chooseAnswer(button, false));
    });
    elements.timerText.textContent = limitMs > 0 ? `${Math.round(limitMs / 1000)}초` : '시간 제한 없음';
    elements.feedbackToast.textContent = '';
    elements.feedbackToast.classList.remove('is-visible');
    startTimer(limitMs);
  }

  function startTimer(limitMs) {
    stopTimer();
    if (!Number.isFinite(limitMs) || limitMs <= 0) {
      elements.timerBar.style.transform = 'scaleX(1)';
      return;
    }
    const startedAt = Date.now();
    elements.timerBar.style.transform = 'scaleX(1)';
    function tick() {
      const elapsed = Date.now() - startedAt;
      const remain = Math.max(0, limitMs - elapsed);
      elements.timerText.textContent = `${Math.ceil(remain / 1000)}초`;
      elements.timerBar.style.transform = `scaleX(${clamp(remain / limitMs, 0, 1)})`;
      if (remain <= 0) {
        handleTimeout();
        return;
      }
      state.rafId = window.requestAnimationFrame(tick);
    }
    state.timerId = window.setTimeout(handleTimeout, limitMs + 60);
    state.rafId = window.requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (state.timerId) window.clearTimeout(state.timerId);
    if (state.rafId) window.cancelAnimationFrame(state.rafId);
    state.timerId = 0;
    state.rafId = 0;
  }

  function handleTimeout() {
    if (state.locked) return;
    const correctButton = elements.choiceGrid.querySelector('[data-correct="true"]');
    chooseAnswer(correctButton, true);
  }

  function chooseAnswer(button, timeout) {
    if (state.locked) return;
    state.locked = true;
    stopTimer();
    const question = state.questions[state.index];
    const age = getAge();
    const level = getLevel();
    const responseMs = Math.max(0, Date.now() - state.questionStartedAt);
    const isCorrect = !timeout && button && button.dataset.correct === 'true';
    if (button) button.classList.add(isCorrect ? 'is-correct' : 'is-timeout');
    const correctButton = elements.choiceGrid.querySelector('[data-correct="true"]');
    if (correctButton) correctButton.classList.add('is-correct');
    elements.choiceGrid.querySelectorAll('button').forEach((choice) => { choice.disabled = true; });
    state.logs.push({
      id: question.id,
      assetId: question.asset.id,
      label: question.asset.label,
      order: question.order,
      levelKey: level.key,
      levelTitle: level.title,
      ageKey: state.ageKey,
      ageLabel: age.label,
      turns: question.turns,
      answerDegrees: question.answerDegrees,
      selectedDegrees: timeout || !button ? null : Number(button.dataset.degrees),
      correct: isCorrect,
      timeout: Boolean(timeout),
      responseMs
    });
    elements.feedbackToast.textContent = timeout
      ? '시간이 지나 정답 방향을 확인해요.'
      : (isCorrect ? '맞았어요. 회전 방향을 잘 추적했어요.' : '다시 확인해요. 정답 방향을 표시했어요.');
    elements.feedbackToast.classList.add('is-visible');
    showFeedback(isCorrect ? 'correct' : 'wrong');
    window.setTimeout(nextQuestion, timeout ? 1050 : 850);
  }

  function nextQuestion() {
    state.index += 1;
    renderQuestion();
  }

  function buildAnalysis() {
    const age = getAge();
    const level = getLevel();
    const total = state.logs.length || 1;
    const correct = state.logs.filter((log) => log.correct).length;
    const timeouts = state.logs.filter((log) => log.timeout).length;
    const avgMs = Math.round(average(state.logs.filter((log) => log.correct).map((log) => log.responseMs)));
    const accuracy = percent(correct, total);
    const speedScore = avgMs > 0 ? clamp(Math.round((age.benchmarkMs / Math.max(avgMs, 1)) * 84), 45, 100) : 65;
    const adjustedAccuracy = clamp(Math.round(accuracy + (age.allowance * 10)), 0, 100);
    const rotationLoadScore = clamp(Math.round((adjustedAccuracy * 0.82) + (speedScore * 0.18) - (timeouts * 2) + level.index), 0, 100);
    const mixedErrors = state.logs.filter((log) => level.mixedDirections && !log.correct).length;
    const timeoutRate = percent(timeouts, total);
    const timeLimitMs = getLimitMs(age, level);
    const supportLevel = accuracy >= 80 && timeouts === 0
      ? '독립 수행 관찰'
      : accuracy >= 60
        ? '전략 단서 필요'
        : '치료자 모델링 필요';
    return { age, level, total, correct, timeouts, avgMs, accuracy, speedScore, rotationLoadScore, mixedErrors, timeoutRate, timeLimitMs, supportLevel };
  }

  function buildReportInput(analysis) {
    const guardianSummary = buildGuardianSummary(analysis);
    const guardianLongSummary = buildGuardianLongSummary(analysis);
    const teacherReviewNote = buildTeacherReviewNote(analysis);
    const teacherLongOpinion = buildTeacherLongOpinion(analysis);
    const actionPlanSummary = buildActionPlanSummary(analysis);
    return {
      reportType: REPORT_TYPE,
      reportScope: 'rehab',
      labKind: 'rehab',
      title: LAB_TITLE,
      labTitle: LAB_TITLE,
      stageTitle: analysis.level.title,
      ageGroup: analysis.age.label,
      ageRange: analysis.age.range,
      normProfile: analysis.age.normProfile,
      score: analysis.rotationLoadScore,
      accuracyScore: analysis.accuracy,
      correctCount: analysis.correct,
      totalQuestions: analysis.total,
      totalItems: analysis.total,
      completionCount: analysis.total,
      accuracyRate: analysis.accuracy,
      completionRate: 100,
      firstTryRate: analysis.accuracy,
      durationSeconds: Math.max(1, Math.round((Date.now() - state.startedAt) / 1000)),
      elapsedMs: Math.max(1, Date.now() - state.startedAt),
      avgQuestionMs: analysis.avgMs || analysis.age.benchmarkMs,
      reactionTimeMs: analysis.avgMs,
      timeoutCount: analysis.timeouts,
      errorCount: analysis.total - analysis.correct,
      focusLabel: '시공간 회전 추론',
      focusKey: 'visual-spatial-mental-rotation',
      overview: `${analysis.age.label} ${analysis.level.title} 조건에서 그림 회전 방향을 한 문항씩 추적한 시공간 재활 과제입니다. 반응시간은 빠름/느림 판정이 아니라 처리 부담과 전략 지원 필요도를 보는 보조 지표입니다.`,
      guardianSummary,
      guardianLongSummary,
      briefOpinion: teacherReviewNote,
      teacherReviewNote,
      longOpinion: teacherLongOpinion,
      actionPlanSummary,
      actionPlanPolicy: 'teacher-review-required',
      reportDisplayModes: {
        guardian: { label: '학부모용', summary: guardianSummary },
        teacher: { label: '전문가용', summary: teacherReviewNote }
      },
      recommendations: buildRecommendations(analysis),
      details: {
        report_type: REPORT_TYPE,
        selected_age: analysis.age.label,
        selected_age_range: analysis.age.range,
        selected_level: analysis.level.title,
        clinical_label: analysis.level.clinicalLabel,
        support_level: analysis.supportLevel,
        per_question_limit_ms: analysis.timeLimitMs,
        time_limit_policy: analysis.timeLimitMs > 0 ? 'supported-observation-limit' : 'untimed-foundation',
        report_guardian_summary: guardianSummary,
        report_guardian_long_summary: guardianLongSummary,
        report_teacher_review_note: teacherReviewNote,
        report_teacher_long_opinion: teacherLongOpinion,
        report_action_plan_summary: actionPlanSummary,
        report_action_plan_policy: 'teacher-review-required',
        report_display_modes: {
          guardian: { label: '학부모용', summary: guardianSummary },
          teacher: { label: '전문가용', summary: teacherReviewNote }
        },
        average_response_ms: analysis.avgMs,
        timeout_rate: analysis.timeoutRate,
        rotation_load_score: analysis.rotationLoadScore,
        research_notes: RESEARCH_NOTES,
        research_references: RESEARCH_REFERENCES
      }
    };
  }

  function buildGuardianSummary(analysis) {
    const limitText = analysis.timeLimitMs > 0
      ? `문항당 약 ${Math.round(analysis.timeLimitMs / 1000)}초 안에서`
      : '시간 제한 없이';
    return `${analysis.level.title} 활동에서 ${analysis.total}문항 중 ${analysis.correct}문항을 맞혔습니다. 이 활동은 빨리 누르는 과제가 아니라 그림을 머릿속으로 돌려 보는 연습이며, 오늘은 ${limitText} 방향을 생각하고 고르는 과정을 관찰했습니다.`;
  }

  function buildGuardianLongSummary(analysis) {
    if (analysis.accuracy >= 80 && analysis.timeouts === 0) {
      return '회전 방향을 비교적 안정적으로 따라갔습니다. 가정에서는 컵, 책, 장난감처럼 익숙한 물건을 오른쪽 또는 왼쪽으로 한 번 돌려 보고 어느 쪽을 보는지 말해 보는 정도로 이어 가면 충분합니다. 세부 난이도 조정은 담당 선생님이 수업 중 반응과 피로도를 함께 보고 결정합니다.';
    }
    if (analysis.accuracy >= 60) {
      return '일부 문항은 스스로 해결했지만, 방향이 여러 번 이어지거나 좌우가 섞일 때 부담이 올라간 모습이 기록되었습니다. 틀린 문항은 실패로 보지 않고, 손가락으로 화살표를 따라가며 마지막 방향을 다시 확인하는 연습으로 연결해 주세요. 다음 난이도는 선생님 확인 후 조정하는 것이 좋습니다.';
    }
    return '현재 단계에서는 그림을 머릿속으로 돌려 보는 과정에 도움이 필요했습니다. 시간초과나 오답은 능력 판정이 아니라 과제 부담 신호로 기록됩니다. 다음 활동에서는 시간 제한을 줄이거나 끄고, 한 방향 90도 회전부터 선생님 시범과 함께 다시 시작하는 것이 적절합니다.';
  }

  function buildTeacherReviewNote(analysis) {
    const limitText = analysis.timeLimitMs > 0 ? `${Math.round(analysis.timeLimitMs / 1000)}초` : '무제한';
    return `${analysis.supportLevel}: ${analysis.age.label} ${analysis.level.clinicalLabel} 조건에서 정답률 ${analysis.accuracy}%, 평균 반응 ${analysis.avgMs || 0}ms, 시간초과 ${analysis.timeouts}회가 관찰되었습니다. 제한시간은 ${limitText}로 적용했으며, 반응시간은 속도 판정이 아니라 시공간 회전 부하와 전략 단서 필요도를 보는 보조 지표로 해석합니다.`;
  }

  function buildTeacherLongOpinion(analysis) {
    const loadText = analysis.level.mixedDirections
      ? '좌우 방향 전환과 순차 작업기억 부담이 동시에 포함된 조건입니다.'
      : '한 방향 회전 누적을 통해 회전 각도 추적과 시각적 작업기억 부담을 관찰하는 조건입니다.';
    const timeText = analysis.timeLimitMs > 0
      ? `문항당 ${Math.round(analysis.timeLimitMs / 1000)}초의 충분한 관찰 시간을 두었습니다.`
      : '기초 단계로 시간 제한을 적용하지 않았습니다.';
    return `${loadText} ${timeText} 결과 해석은 정확도를 1차 지표로 보고, 평균 반응시간과 시간초과는 처리 부담, 피로, 보기 탐색 전략의 보조 지표로만 사용합니다. 오류가 반복되는 경우 회전 방향을 말로 재진술하게 하거나 손가락 추적, 단일 90도 회전, 보기 수 유지 상태에서 반복 시행하는 방식으로 낮춰 관찰해 주세요. 본 결과는 회기 내 수행 자료이며 표준화 검사나 의학적 진단을 대체하지 않습니다.`;
  }

  function getReportBand(score) {
    if (score >= 85) return { label: '안정 수행', tone: 'strong' };
    if (score >= 70) return { label: '부분 안정', tone: 'steady' };
    if (score >= 55) return { label: '전략 지원 필요', tone: 'watch' };
    return { label: '모델링 필요', tone: 'weak' };
  }

  function buildReportAxes(reportInput) {
    const total = Math.max(1, Number(reportInput.totalQuestions || 0));
    const timeoutPenalty = Math.min(35, Number(reportInput.timeoutCount || 0) * 9);
    const directionSwitchScore = reportInput.stageTitle.includes('혼합') || reportInput.stageTitle.includes('복합')
      ? clamp(Math.round(Number(reportInput.accuracyScore || 0) - timeoutPenalty), 0, 100)
      : clamp(Math.round(Number(reportInput.accuracyScore || 0) - 4 - timeoutPenalty), 0, 100);
    return [
      { id: 'mentalRotation', label: '회전 추론', score: Number(reportInput.score || 0) },
      { id: 'accuracy', label: '정확도', score: Number(reportInput.accuracyScore || 0) },
      { id: 'workingMemory', label: '순차 작업기억', score: clamp(Math.round(Number(reportInput.score || 0) - Math.max(0, total - Number(reportInput.correctCount || 0)) * 4), 0, 100) },
      { id: 'directionSwitching', label: '좌우 전환', score: directionSwitchScore },
      { id: 'visualSearch', label: '보기 탐색', score: clamp(Math.round((Number(reportInput.accuracyScore || 0) * 0.78) + 18 - timeoutPenalty), 0, 100) },
      { id: 'responseRegulation', label: '반응 조절', score: clamp(Math.round(100 - timeoutPenalty), 0, 100) }
    ];
  }

  function buildRecommendations(analysis) {
    const lines = [];
    if (analysis.accuracy < 70) {
      lines.push('한 방향 90도 회전부터 치료자가 손가락으로 회전 방향을 함께 짚어 주고, 보기 선택 전에 최종 방향을 말로 확인합니다.');
    } else {
      lines.push('정확도가 안정적이므로 같은 그림에서 회전 지시 개수를 1개씩 늘리되, 속도보다 회전 과정을 말로 설명하는지를 우선 확인합니다.');
    }
    if (analysis.timeouts > 1) {
      lines.push('시간초과는 실패가 아니라 처리 부담 신호로 기록합니다. 다음 회기에는 시간 제한을 끄거나 단일 회전 조건으로 낮춰 성공 경험을 확보합니다.');
    } else {
      lines.push('충분한 대기 시간 안에서 반응이 가능하므로 다음 회기에는 같은 레벨을 반복해 안정성을 본 뒤 좌우 혼합 또는 누적 회전으로 확장합니다.');
    }
    if (analysis.level.mixedDirections && analysis.mixedErrors > 0) {
      lines.push('좌우가 섞인 문항에서 오류가 있어 오른쪽/왼쪽 화살표 카드를 분리해 방향 전환 억제를 연습합니다.');
    } else {
      lines.push('정답 후에는 “오른쪽으로 몇 번, 왼쪽으로 몇 번”처럼 회전 과정을 말로 설명하게 합니다.');
    }
    return lines;
  }

  function buildActionPlanSummary(analysis) {
    if (analysis.level.index === 1) {
      return '기초 단계는 시간 제한 없이 정확한 방향 이해와 보기 탐색 안정성을 먼저 봅니다.';
    }
    if (analysis.timeouts > 1 || analysis.accuracy < 60) {
      return '현재 단계는 인지 부하가 높습니다. 치료자 시범, 회전 방향 말하기, 단일 회전으로 낮춘 재시도가 필요합니다.';
    }
    if (analysis.accuracy >= 80) {
      return '정확도가 안정적입니다. 같은 레벨 반복 후 지시 수 또는 좌우 전환 부담을 한 단계만 늘립니다.';
    }
    return '부분 수행이 가능합니다. 시간 압박을 줄이고 회전 과정을 말로 설명하게 하며 같은 난이도를 반복합니다.';
  }

  function renderProfessionalReport(reportInput) {
    const report = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function'
      ? window.PlaylabReportEngine.buildReport(reportInput)
      : null;
    if (report) {
      const axes = buildReportAxes(reportInput);
      Object.assign(report, {
        integratedScore: reportInput.score,
        band: getReportBand(reportInput.score),
        axes,
        sortedAxes: axes.slice().sort((left, right) => right.score - left.score),
        highlights: [
          { label: '정답', value: `${reportInput.correctCount}/${reportInput.totalQuestions}` },
          { label: '정확도', value: `${reportInput.accuracyScore}%` },
          { label: '지원 수준', value: reportInput.details.support_level },
          { label: '평균 반응', value: reportInput.reactionTimeMs ? `${(reportInput.reactionTimeMs / 1000).toFixed(1)}초` : '관찰만' },
          { label: '시간초과', value: `${reportInput.timeoutCount}회` },
          { label: '연령 기준', value: `${reportInput.ageGroup} ${reportInput.ageRange}` }
        ],
        headline: reportInput.score >= 85
          ? '회전 방향 추적과 보기 선택이 안정적으로 관찰됩니다.'
          : '회전 방향을 따라가는 과정에서 전략 단서 또는 난이도 조절이 필요합니다.',
        accuracyRate: reportInput.accuracyScore,
        completionRate: 100,
        firstTryRate: reportInput.accuracyScore,
        avgQuestionMs: reportInput.avgQuestionMs,
        guardianSummary: reportInput.guardianSummary,
        guardianLongSummary: reportInput.guardianLongSummary,
        briefOpinion: reportInput.briefOpinion,
        teacherReviewNote: reportInput.teacherReviewNote,
        longOpinion: reportInput.longOpinion,
        reportDisplayModes: reportInput.reportDisplayModes
      });
    }
    if (report && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === 'function') {
      elements.professionalReport.innerHTML = window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' });
    } else {
      elements.professionalReport.innerHTML = `<section><h3>인지재활 전문가 소견</h3><p>${reportInput.overview}</p></section>`;
    }
    const referenceHtml = RESEARCH_REFERENCES.map((item) => `<a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>`).join('');
    elements.professionalReport.insertAdjacentHTML('beforeend', `<div class="odd-research-note"><strong>근거 기반 해석:</strong> ${RESEARCH_NOTES.join(' ')}<div class="odd-reference-list">${referenceHtml}</div></div>`);
    return report;
  }

  function buildHarnessPayload(reportInput, report) {
    const recommendations = report && Array.isArray(report.recommendations)
      ? report.recommendations.map((item) => [item.title, item.desc || item.text].filter(Boolean).join(': '))
      : reportInput.recommendations;
    const questionSnapshot = state.questions.map((question) => ({
      id: question.id,
      assetId: question.asset.id,
      label: question.asset.label,
      turns: question.turns.map((turn) => turn.label),
      expectedDegrees: question.answerDegrees
    }));
    const resultSnapshot = state.logs.map((log) => ({
      id: log.id,
      assetId: log.assetId,
      label: log.label,
      solved: log.correct,
      timeout: log.timeout,
      responseMs: log.responseMs,
      selectedDegrees: log.selectedDegrees,
      answerDegrees: log.answerDegrees
    }));
    return Object.assign({}, reportInput, {
      curriculumKey: REPORT_TYPE,
      stageKey: reportInput.stageTitle,
      stageOrder: reportInput.details.selected_level,
      correctCount: reportInput.correctCount,
      wrongCount: reportInput.errorCount,
      cleared: reportInput.correctCount === reportInput.totalQuestions,
      startedAtMs: state.startedAt,
      summary: `${reportInput.ageGroup} ${reportInput.stageTitle} 조건에서 ${reportInput.totalQuestions}문항 중 ${reportInput.correctCount}문항을 수행했습니다.`,
      briefOpinion: reportInput.briefOpinion || report?.summary || reportInput.overview,
      guardianSummary: reportInput.guardianSummary,
      guardianLongSummary: reportInput.guardianLongSummary,
      teacherReviewNote: reportInput.teacherReviewNote,
      actionPlanSummary: reportInput.actionPlanSummary,
      actionPlanPolicy: reportInput.actionPlanPolicy,
      reportDisplayModes: reportInput.reportDisplayModes,
      overview: reportInput.longOpinion || reportInput.overview,
      recommendations,
      wrongWords: state.logs.filter((log) => !log.correct).map((log) => log.label),
      questionSnapshot,
      resultSnapshot
    });
  }

  function finishGame() {
    stopTimer();
    const analysis = buildAnalysis();
    const reportInput = buildReportInput(analysis);
    elements.resultTitle.textContent = `${analysis.level.title} 완료`;
    elements.resultSummary.textContent = `${analysis.correct}/${analysis.total}문항 정답 · ${analysis.supportLevel} · 평균 반응 ${analysis.avgMs ? `${(analysis.avgMs / 1000).toFixed(1)}초` : '관찰만'}`;
    elements.resultStats.innerHTML = [
      ['정확도', `${analysis.accuracy}%`],
      ['지원 수준', analysis.supportLevel],
      ['처리 부담 지표', `${analysis.rotationLoadScore}점`],
      ['평균 반응', analysis.avgMs ? `${(analysis.avgMs / 1000).toFixed(1)}초` : '관찰만'],
      ['시간초과', `${analysis.timeouts}회`]
    ].map(([label, value]) => `<div class="odd-result-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
    setScreen('result');
    const report = renderProfessionalReport(reportInput);
    saveReport(buildHarnessPayload(reportInput, report));
  }

  function saveReport(payload) {
    if (state.savedRunId) return;
    state.savedRunId = `saving-${Date.now()}`;
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === 'function') {
      try {
        const record = window.HahaLabLearningHarness.recordSession(payload);
        if (record && record.id) state.savedRunId = record.id;
      } catch (error) {
        console.warn('[rehablab-rotation-direction] report save failed', error);
      }
    }
  }

  function openHelp() {
    elements.helpModal.classList.add('is-visible');
    elements.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    elements.helpModal.classList.remove('is-visible');
    elements.helpModal.setAttribute('aria-hidden', 'true');
  }

  function init() {
    [
      'menuView', 'gameView', 'resultView', 'stageButton', 'helpButton', 'helpModal', 'helpCloseButton',
      'levelGrid', 'startButton', 'progressChip', 'gameKicker', 'gameTitle', 'roundCounter',
      'questionImage', 'cueList', 'choiceGrid', 'timerText', 'timerBar', 'feedbackToast',
      'resultTitle', 'resultSummary', 'resultStats', 'professionalReport', 'retryButton', 'menuButton'
    ].forEach((id) => { elements[id] = document.getElementById(id); });
    if (window.supabase && !window.supabaseClient) {
      window.supabaseClient = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
    }
    renderLevels();
    document.querySelectorAll('[data-age]').forEach((button) => {
      button.addEventListener('click', () => {
        state.ageKey = button.dataset.age || '';
        updateMenuState();
      });
    });
    elements.levelGrid.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('[data-level]') : null;
      if (!button) return;
      state.levelKey = button.dataset.level || '';
      updateMenuState();
    });
    elements.startButton.addEventListener('click', startGame);
    elements.retryButton.addEventListener('click', startGame);
    elements.menuButton.addEventListener('click', () => setScreen('menu'));
    elements.stageButton.addEventListener('click', () => setScreen('menu'));
    elements.helpButton.addEventListener('click', openHelp);
    elements.helpCloseButton.addEventListener('click', closeHelp);
    elements.helpModal.addEventListener('click', (event) => {
      if (event.target && event.target.hasAttribute('data-close-help')) closeHelp();
    });
    updateMenuState();
    setScreen('menu');
  }

  window.__REHABLAB_ROTATION_DIRECTION__ = {
    reportType: REPORT_TYPE,
    ageGroups: AGE_GROUPS,
    assetPool: ASSET_POOL,
    stages: LEVELS,
    researchNotes: RESEARCH_NOTES,
    buildStageItems
  };

  init();
})();
