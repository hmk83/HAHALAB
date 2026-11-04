(function () {
  'use strict';

  const FOOD_ASSET_BASE = 'images/food-conveyor/';
  const BATCH_SIZE = 5;
  const OFTEN_FOODS = [
    ['spinach', '시금치'], ['salmon', '연어'], ['broccoli', '브로콜리'], ['blueberry', '블루베리'], ['garlic', '마늘'],
    ['avocado', '아보카도'], ['tomato', '토마토'], ['oatmeal', '귀리'], ['almond', '아몬드'], ['greek-yogurt', '플레인 그릭요거트'],
    ['olive-oil', '올리브유'], ['shiitake', '표고버섯'], ['legume', '콩'], ['egg', '달걀'], ['carrot', '당근'],
    ['kale', '케일'], ['tofu', '두부'], ['apple', '사과'], ['cabbage', '양배추'], ['walnut', '호두'],
    ['ginger', '생강'], ['paprika', '파프리카'], ['seaweed', '미역'], ['whole-wheat-bread', '통밀빵'], ['green-tea', '녹차']
    , ['samgyeopsal', '삼겹살'], ['chicken-breast', '닭가슴살'], ['brown-rice', '현미밥'], ['sweet-potato', '고구마'], ['banana', '바나나']
    , ['strawberry', '딸기'], ['orange', '오렌지'], ['kiwi', '키위'], ['pear', '배'], ['pumpkin', '단호박']
    , ['zucchini', '애호박'], ['cucumber', '오이'], ['onion', '양파'], ['green-onion', '대파'], ['enoki-mushroom', '팽이버섯']
    , ['bean-sprouts', '콩나물'], ['shrimp', '새우'], ['mackerel', '고등어'], ['tuna', '참치'], ['plain-milk', '우유']
    , ['potato', '감자'], ['sesame', '참깨'], ['perilla-leaves', '깻잎'], ['cauliflower', '콜리플라워'], ['asparagus', '아스파라거스']
  ].map(([id, label]) => ({ id, label, group: 'often', image: `${FOOD_ASSET_BASE}${id}.png` }));
  const SOMETIMES_FOODS = [
    ['soda', '탄산음료'], ['french-fries', '감자튀김'], ['processed-sausage', '가공 소시지'], ['donut', '도넛'], ['margarine', '마가린'],
    ['instant-ramen', '인스턴트 라면'], ['macaron', '마카롱'], ['butter-popcorn', '버터·카라멜 팝콘'], ['energy-drink', '에너지 드링크'], ['sweet-fruit-juice', '가당 과일 주스'],
    ['hot-dog', '핫도그'], ['canned-ham', '통조림 햄'], ['seasoned-chicken', '시판 양념 치킨'], ['sugar-cereal', '설탕 코팅 시리얼'], ['instant-tteokbokki', '즉석 떡볶이'],
    ['potato-chips', '감자칩'], ['bacon', '베이컨'], ['milk-chocolate', '시판 밀크 초콜릿 바'], ['frozen-pizza', '냉동 피자'], ['mix-coffee', '믹스커피'],
    ['churros', '츄러스'], ['sweet-iced-tea', '액상과당 아이스티'], ['tanghulu', '탕후루'], ['mayo-sauce', '마요네즈 소스'], ['marshmallow', '마시멜로']
    , ['cake', '케이크'], ['cookies', '쿠키'], ['ice-cream-sundae', '아이스크림'], ['cheeseburger', '치즈버거'], ['chicken-nuggets', '치킨 너겟']
    , ['fried-chicken', '튀김 치킨'], ['croissant', '크루아상'], ['sweet-cream-bread', '크림빵'], ['flavored-yogurt', '가당 요거트 음료'], ['fried-dumplings', '군만두']
    , ['pizza-snack', '피자 스낵'], ['creamy-pasta', '크림 파스타'], ['butter-toast', '버터 토스트'], ['cheese-corn-dog', '치즈 핫도그'], ['sweet-cupcake', '컵케이크']
    , ['mala-tang', '마라탕'], ['latiao-package', '마라맛 밀 글루텐 과자'], ['konjac-snack-package', '마라 곤약젤리'], ['spicy-sausage-package', '매운 소시지 간식'], ['spicy-cup-ramen-package', '매운 컵라면']
    , ['cheese-balls-package', '치즈볼 과자'], ['bingsu-package', '빙수'], ['ice-cream-bar-package', '아이스크림 바'], ['candy-package', '사탕 간식'], ['snack-cake-package', '포장 케이크 간식']
  ].map(([id, label]) => ({ id, label, group: 'sometimes', image: `${FOOD_ASSET_BASE}${id}.png` }));
  const ALL_FOODS = [...OFTEN_FOODS, ...SOMETIMES_FOODS];
  const VEGETABLE_IDS = new Set(['spinach', 'broccoli', 'garlic', 'tomato', 'shiitake', 'carrot', 'kale', 'cabbage', 'paprika', 'pumpkin', 'zucchini', 'cucumber', 'onion', 'green-onion', 'enoki-mushroom', 'bean-sprouts', 'perilla-leaves', 'cauliflower', 'asparagus']);
  const SNACK_IDS = new Set(['donut', 'macaron', 'butter-popcorn', 'potato-chips', 'milk-chocolate', 'churros', 'tanghulu', 'marshmallow', 'cake', 'cookies', 'ice-cream-sundae', 'croissant', 'sweet-cream-bread', 'sweet-cupcake', 'cheese-balls-package', 'bingsu-package', 'ice-cream-bar-package', 'candy-package', 'snack-cake-package']);
  const STAGES = [
    { id: 'healthy-food', title: '몸에 좋은 음식을 골라볼까요?', targetGroup: 'often', itemCount: 25 },
    { id: 'vegetables', title: '야채를 골라볼까요?', targetIds: VEGETABLE_IDS, itemCount: 25 },
    { id: 'snacks', title: '간식을 골라볼까요?', targetIds: SNACK_IDS, itemCount: 25 },
    { id: 'unhealthy-food', title: '몸에 나쁜 음식을 골라볼까요?', targetGroup: 'sometimes', itemCount: 25 }
  ];

  const refs = {
    stageScreen: document.getElementById('foodStageScreen'), gameScreen: document.getElementById('foodGameScreen'), resultScreen: document.getElementById('foodResultScreen'),
    stageGrid: document.getElementById('foodStageGrid'), lane: document.getElementById('foodConveyorLane'), scene: document.getElementById('foodConveyorScene'),
    stageValue: document.getElementById('foodStageValue'), progress: document.getElementById('foodProgressValue'), ruleEyebrow: document.getElementById('foodRuleEyebrow'), ruleTitle: document.getElementById('foodRuleTitle'),
    resultTitle: document.getElementById('foodResultTitle'), resultReviewLane: document.getElementById('foodResultReviewLane'), retry: document.getElementById('foodRetryButton'), stageButton: document.getElementById('foodStageButton'),
    help: document.getElementById('foodConveyorHelp'), helpDialog: document.getElementById('foodHelpDialog'), helpClose: document.getElementById('foodHelpClose')
  };
  const state = { stage: null, correctCount: 0, wrongCount: 0, interactions: { click: 0 }, startedAt: 0, current: null, locked: false, reactionTimer: 0, batchTimer: 0, finished: false };

  function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
  function targetCopy(stage) {
    return { eyebrow: '오늘의 문제', title: stage.title };
  }
  function stageTargets(stage) {
    if (stage.targetIds) return ALL_FOODS.filter((food) => stage.targetIds.has(food.id));
    return ALL_FOODS.filter((food) => food.group === stage.targetGroup);
  }
  function showScreen(name) {
    refs.stageScreen.hidden = name !== 'stage'; refs.gameScreen.hidden = name !== 'game'; refs.resultScreen.hidden = name !== 'result';
  }
  function renderStageGrid() {
    refs.stageGrid.innerHTML = STAGES.map((stage) => `
      <button class="food-stage-card" type="button" data-stage="${stage.id}">
        <h3>${stage.title}</h3><span>START</span>
      </button>`).join('');
    refs.stageGrid.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => startStage(button.dataset.stage)));
  }
  function buildBatches(foods, targetIds) {
    const batchCount = Math.ceil(foods.length / BATCH_SIZE);
    const batches = Array.from({ length: batchCount }, () => []);
    const targets = shuffle(foods.filter((food) => targetIds.has(food.id)));
    const distractors = shuffle(foods.filter((food) => !targetIds.has(food.id)));
    batches.forEach((batch) => { if (targets.length) batch.push(targets.pop()); });
    batches.forEach((batch) => { if (distractors.length) batch.push(distractors.pop()); });
    const remaining = shuffle([...targets, ...distractors]);
    let cursor = 0;
    remaining.forEach((food) => {
      while (batches[cursor % batchCount].length >= BATCH_SIZE) cursor += 1;
      batches[cursor % batchCount].push(food);
      cursor += 1;
    });
    return batches.map((batch) => shuffle(batch));
  }
  function buildSession() {
    const targetCount = Math.ceil(state.stage.itemCount * .46);
    const targetFoods = stageTargets(state.stage); const targetIds = new Set(targetFoods.map((food) => food.id));
    const targets = shuffle(targetFoods).slice(0, targetCount);
    const distractors = shuffle(ALL_FOODS.filter((food) => !targetIds.has(food.id))).slice(0, state.stage.itemCount - targets.length);
    const foods = shuffle([...targets, ...distractors]);
    return { targetIds, foods, batches: buildBatches(foods, targetIds), batchIndex: 0, targetTotal: targets.length, selectedIds: [], feedbackById: {}, attempts: [], startedAt: performance.now() };
  }
  function renderHud() {
    const current = state.current; const copy = targetCopy(state.stage);
    refs.stageValue.textContent = String(STAGES.indexOf(state.stage) + 1);
    refs.progress.textContent = `${state.correctCount} / ${current.targetTotal}`;
    refs.ruleEyebrow.textContent = copy.eyebrow; refs.ruleTitle.textContent = copy.title;
  }
  function foodPlateMarkup(food) {
    const outcome = state.current.feedbackById[food.id] || '';
    const answered = Boolean(outcome);
    return `<button class="food-item${answered ? ` is-answer-${outcome}` : ''}" type="button" data-food="${food.id}" aria-label="${food.label} 접시${answered ? `, ${outcome === 'correct' ? '정답' : '오답'}` : ''}"${answered ? ' disabled' : ''}>
      <span class="food-base-plate" aria-hidden="true"></span><img src="${food.image}" alt="${food.label}"><span class="food-item-label" aria-hidden="${answered ? 'false' : 'true'}">${answered ? food.label : ''}</span>
    </button>`;
  }
  function renderBatch() {
    const batch = state.current.batches[state.current.batchIndex] || [];
    renderHud();
    refs.lane.setAttribute('aria-label', `음식 선택 ${state.current.batchIndex + 1}묶음, 총 ${state.current.batches.length}묶음`);
    refs.lane.innerHTML = batch.map(foodPlateMarkup).join('');
    refs.lane.querySelectorAll('[data-food]:not(:disabled)').forEach(bindFoodPlate);
  }
  function startStage(stageId) {
    state.stage = STAGES.find((stage) => stage.id === stageId) || STAGES[0]; state.correctCount = 0; state.wrongCount = 0;
    window.clearTimeout(state.batchTimer); state.interactions = { click: 0 }; state.startedAt = Date.now(); state.current = buildSession(); state.locked = false; state.finished = false; setKidsReaction('idle'); showScreen('game'); renderBatch();
  }
  function foodById(id) { return ALL_FOODS.find((food) => food.id === id); }
  function setKidsReaction(reaction) {
    window.clearTimeout(state.reactionTimer);
    refs.scene.dataset.reaction = 'idle';
    if (reaction === 'idle') return;
    void refs.scene.offsetWidth;
    refs.scene.dataset.reaction = reaction;
    state.reactionTimer = window.setTimeout(() => { refs.scene.dataset.reaction = 'idle'; }, 900);
  }
  function showWrong(item, food, interaction) {
    state.wrongCount += 1; setKidsReaction('wrong'); state.current.feedbackById[food.id] = 'wrong';
    state.current.attempts.push({ foodId: food.id, label: food.label, target: false, outcome: 'wrong', interaction, responseMs: Math.round(performance.now() - state.current.startedAt) });
    renderBatch();
  }
  function showCorrect(item, food, interaction) {
    setKidsReaction('correct'); state.current.feedbackById[food.id] = 'correct';
    state.current.selectedIds.push(food.id); state.current.attempts.push({ foodId: food.id, label: food.label, target: true, outcome: 'correct', interaction, responseMs: Math.round(performance.now() - state.current.startedAt) });
    state.correctCount += 1; renderHud();
    renderBatch();
    const batch = state.current.batches[state.current.batchIndex];
    const completed = batch.filter((entry) => state.current.targetIds.has(entry.id)).every((entry) => state.current.selectedIds.includes(entry.id));
    if (completed) {
      state.locked = true;
      state.batchTimer = window.setTimeout(() => {
        state.current.batchIndex += 1;
        state.current.feedbackById = {};
        setKidsReaction('idle'); state.locked = false;
        if (state.current.batchIndex >= state.current.batches.length) finishStage(); else renderBatch();
      }, 1200);
    }
  }
  function selectFood(foodId, interaction) {
    if (state.locked || !state.current) return;
    const food = foodById(foodId); const item = refs.lane.querySelector(`[data-food="${foodId}"]`);
    if (!food || !item || state.current.selectedIds.includes(foodId)) return;
    state.interactions.click += 1;
    if (state.current.targetIds.has(food.id)) showCorrect(item, food, interaction); else showWrong(item, food, interaction);
  }
  function finishStage() {
    if (state.finished) return;
    state.finished = true;
    const totalTargets = state.current.targetTotal;
    const durationSeconds = Math.max(1, Math.round((Date.now() - state.startedAt) / 1000));
    const score = Math.round((state.correctCount / Math.max(1, state.correctCount + state.wrongCount)) * 100);
    const payload = {
      labKind: 'playlab', reportScope: 'playlab', saveToClientReport: true, curriculumKey: 'playlab-healthy-food-conveyor', learningId: 'playlab-healthy-food-conveyor',
      labTitle: '음식 접시 옮기기', title: '음식 접시 옮기기', stageKey: state.stage.id, stageTitle: state.stage.title,
      totalQuestions: totalTargets, correctCount: state.correctCount, wrongCount: state.wrongCount, score, accuracy: score, durationSeconds, startedAtMs: state.startedAt, endedAtMs: Date.now(),
      details: { learning_id: 'playlab-healthy-food-conveyor', learning_title: '음식 접시 옮기기', lab_title: '음식 접시 옮기기', target_rule: state.stage.id, target_total: state.current.targetTotal, presented_food_count: state.stage.itemCount, batch_size: BATCH_SIZE, batch_count: state.current.batches.length, feedback_mode: 'inline', batch_advance: 'after_all_targets', completed_all_batches: true, interaction_counts: state.interactions, batch_attempts: state.current.attempts, stream_attempts: state.current.attempts }
    };
    try { window.HahaLabLearningHarness?.recordSession?.(payload); } catch (_error) {}
    const targetFoods = state.current.foods.filter((food) => state.current.targetIds.has(food.id));
    const selectedIds = new Set(state.current.selectedIds);
    refs.resultTitle.textContent = '학습을 마쳤어요';
    const reviewItems = targetFoods.map((food) => `<div class="food-result-review-item${selectedIds.has(food.id) ? '' : ' is-missed'}" aria-label="${food.label}: ${selectedIds.has(food.id) ? '맞힌 정답' : '놓친 정답'}"><span class="food-result-review-plate" aria-hidden="true"></span><img src="${food.image}" alt=""><span>${food.label}</span></div>`).join('');
    refs.resultReviewLane.innerHTML = `<div class="food-result-review-track">${reviewItems}</div>`;
    showScreen('result');
  }
  function bindFoodPlate(item) { item.addEventListener('click', () => selectFood(item.dataset.food, 'click')); }
  function bindEvents() {
    refs.retry.addEventListener('click', () => startStage(state.stage.id)); refs.stageButton.addEventListener('click', () => { showScreen('stage'); renderStageGrid(); });
    refs.help.addEventListener('click', () => refs.helpDialog.showModal()); refs.helpClose.addEventListener('click', () => refs.helpDialog.close());
  }
  window.HahaLabFoodConveyor = {
    getCatalog: () => ({ often: OFTEN_FOODS.map((food) => ({ id: food.id, label: food.label, image: food.image })), sometimes: SOMETIMES_FOODS.map((food) => ({ id: food.id, label: food.label, image: food.image })) }),
    getState: () => ({ stageId: state.stage?.id || '', feedbackMode: 'inline', correctCount: state.correctCount, targetTotal: state.current?.targetTotal || 0, batchIndex: state.current?.batchIndex || 0, batchCount: state.current?.batches.length || 0, current: state.current ? { targetIds: [...state.current.targetIds], foods: state.current.foods.map((food) => food.id), currentBatch: (state.current.batches[state.current.batchIndex] || []).map((food) => food.id), selectedIds: [...state.current.selectedIds], feedbackById: { ...state.current.feedbackById } } : null })
  };
  renderStageGrid(); bindEvents();
})();
