(function () {
  "use strict";

  const SUPABASE_URL = "https://gxungzlecmibgvykoiib.supabase.co";
  const SUPABASE_KEY = "sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE";
  const REPORT_SCOPE = "rehab";
  const COMPLETION_ACTION = "게임 완료";
  const VERSION = "20260506-clinical-report-1";
  const QUESTION_FEEDBACK_EFFECT_MS = 980;
  const QUESTION_TRANSITION_AFTER_FEEDBACK_MS = QUESTION_FEEDBACK_EFFECT_MS + 120;

  const AGE_GROUPS = {
    toddler: { label: "유아/취학 전", range: "3-6세", note: "보기 수와 기억 부하를 낮춰 성공 경험과 규칙 이해를 우선 관찰합니다.", modifier: -1, normProfile: "preschool", benchmarkMs: 8200 },
    child: { label: "초등 저학년", range: "7-9세", note: "기초 주의, 기억, 시지각 처리 균형과 단서 활용을 함께 관찰합니다.", modifier: 0, normProfile: "lower-elementary", benchmarkMs: 7600 },
    teen: { label: "초등 고학년/청소년", range: "10-17세", note: "처리 속도, 오류 억제, 자기 점검 전략의 안정성을 함께 확인합니다.", modifier: 1, normProfile: "upper-elementary", benchmarkMs: 7000 },
    adult: { label: "성인", range: "18-64세", note: "정확도, 반응 효율, 전략 사용을 중심으로 회기 내 수행을 기록합니다.", modifier: 1, normProfile: "adult", benchmarkMs: 6400 },
    senior: { label: "고령자", range: "65세 이상", note: "속도보다 안정적 수행, 오류 양상, 피로 누적 여부를 우선 관찰합니다.", modifier: -1, normProfile: "senior", benchmarkMs: 8400 }
  };

  const LEVELS = [
    { id: 1, title: "기초", detail: "보기 수를 낮추고 규칙 이해, 성공 경험, 기본 반응 형성을 확인합니다.", clinicalLabel: "도입/스크리닝", load: 1 },
    { id: 2, title: "확장", detail: "기억해야 할 정보와 변별 요구를 조금 늘려 단서 활용을 관찰합니다.", clinicalLabel: "저부하 반복", load: 2 },
    { id: 3, title: "표준", detail: "치료실 기본 관찰에 적합한 부하로 정확도와 반응시간을 함께 봅니다.", clinicalLabel: "표준 관찰", load: 3 },
    { id: 4, title: "집중", detail: "주의 전환, 오류 억제, 후반부 수행 유지력을 함께 확인합니다.", clinicalLabel: "중등도 부하", load: 4 },
    { id: 5, title: "심화", detail: "처리 속도와 작업기억 부담을 높여 전략 유지 가능성을 봅니다.", clinicalLabel: "고부하 훈련", load: 5 },
    { id: 6, title: "종합", detail: "복합 규칙, 자기 점검, 오류 후 회복을 통합적으로 관찰합니다.", clinicalLabel: "통합 수행", load: 6 }
  ];

  const CATEGORY_IMAGES = [
    { label: "사과", src: "images/category/fruit-apple-photo.webp" },
    { label: "수박", src: "images/category/fruit-watermelon-photo.webp" },
    { label: "오이", src: "images/category/vegetable-zucchini-photo.webp" },
    { label: "가지", src: "images/category/vegetable-eggplant-illust.webp" },
    { label: "컴퓨터", src: "images/category/electronics-computer-photo.webp" },
    { label: "텔레비전", src: "images/category/electronics-television-photo.webp" },
    { label: "사자", src: "images/category/animal-lion-photo.webp" },
    { label: "판다", src: "images/category/animal-panda-illust.webp" },
    { label: "거북", src: "images/category/animal-turtle-illust.webp" },
    { label: "구름", src: "images/category/nature-cloud-photo.webp" },
    { label: "무지개", src: "images/category/nature-rainbow-illust.webp" },
    { label: "연필", src: "images/category/school-supplies-pencil-case-photo.webp" },
    { label: "크레용", src: "images/category/school-supplies-crayon-illust.webp" },
    { label: "구두", src: "images/category/clothing-shoe-illust.webp" },
    { label: "창문", src: "images/category/house-window-photo.webp" },
    { label: "병원", src: "images/category/public-place-hospital-photo.webp" }
  ];

  const FACE_IMAGES = [
    { label: "민준", src: "images/face/face-m001-photo.jpg" },
    { label: "서준", src: "images/face/face-m002-photo.jpg" },
    { label: "도윤", src: "images/face/face-m003-photo.jpg" },
    { label: "지호", src: "images/face/face-m004-photo.jpg" },
    { label: "현우", src: "images/face/face-m005-photo.jpg" },
    { label: "서아", src: "images/face/face-g001-photo.jpg" },
    { label: "하윤", src: "images/face/face-g002-photo.jpg" },
    { label: "지유", src: "images/face/face-g003-photo.jpg" },
    { label: "민서", src: "images/face/face-g004-photo.jpg" },
    { label: "예은", src: "images/face/face-g005-photo.jpg" }
  ];

  const SNACK_IMAGES = [
    { label: "빵", src: "images/snack/snack-001.webp" },
    { label: "쿠키", src: "images/snack/snack-002.webp" },
    { label: "도넛", src: "images/snack/snack-003.webp" },
    { label: "사탕", src: "images/snack/snack-004.webp" },
    { label: "케이크", src: "images/snack/snack-005.webp" },
    { label: "초콜릿", src: "images/snack/snack-006.webp" },
    { label: "과자", src: "images/snack/snack-007.webp" },
    { label: "아이스크림", src: "images/snack/snack-008.webp" }
  ];

  const CLOZE_QUESTIONS = [
    { text: "아침에 일어나면 깨끗하게 ___를 닦아요.", answer: "이", wrong: ["손", "가방", "신발"] },
    { text: "날씨가 더울 때는 시원한 ___을 마시고 싶어요.", answer: "물", wrong: ["불", "돌", "흙"] },
    { text: "비가 올 때 밖에 나가려면 ___를 써요.", answer: "우산", wrong: ["모자", "장갑", "양말"] },
    { text: "밥을 먹을 때는 숟가락과 ___를 사용해요.", answer: "젓가락", wrong: ["연필", "가위", "수건"] },
    { text: "밤이 되면 하늘에 ___이 반짝여요.", answer: "별", wrong: ["꽃", "컵", "책"] },
    { text: "책을 읽으려면 글자를 ___로 봐요.", answer: "눈", wrong: ["귀", "발", "손"] },
    { text: "추운 날에는 따뜻한 ___를 입어요.", answer: "외투", wrong: ["수영복", "부채", "슬리퍼"] },
    { text: "운동장에서는 공을 ___며 놀 수 있어요.", answer: "차", wrong: ["씻", "접", "읽"] },
    { text: "길을 건널 때는 신호등을 ___ 확인해요.", answer: "보고", wrong: ["먹고", "닫고", "접고"] },
    { text: "손이 더러우면 비누로 깨끗하게 ___요.", answer: "씻어", wrong: ["그려", "불러", "붙여"] },
    { text: "배가 고프면 맛있는 음식을 ___요.", answer: "먹어", wrong: ["입어", "접어", "열어"] },
    { text: "친구가 넘어지면 괜찮은지 ___봐요.", answer: "물어", wrong: ["던져", "잠가", "숨겨"] }
  ];

  const STORIES = [
    { prompt: "일어난 일을 순서대로 놓아보세요.", answer: ["씨앗을 심어요", "물을 줘요", "싹이 나요", "꽃이 피어요"] },
    { prompt: "아침 준비 순서를 맞춰보세요.", answer: ["일어나요", "세수를 해요", "옷을 입어요", "가방을 메요"] },
    { prompt: "간식 만드는 순서를 맞춰보세요.", answer: ["빵을 꺼내요", "잼을 발라요", "빵을 덮어요", "맛있게 먹어요"] },
    { prompt: "비 오는 날 행동 순서를 맞춰보세요.", answer: ["하늘이 흐려요", "비가 내려요", "우산을 써요", "집에 도착해요"] },
    { prompt: "병원에 가는 순서를 맞춰보세요.", answer: ["아파요", "병원에 가요", "진료를 받아요", "약을 먹어요"] },
    { prompt: "정리하는 순서를 맞춰보세요.", answer: ["장난감을 모아요", "상자에 넣어요", "뚜껑을 닫아요", "제자리에 둬요"] }
  ];

  const SYMBOL_SETS = [
    [
      ["★", "1"], ["♥", "2"], ["●", "3"], ["▲", "4"], ["◆", "5"], ["♬", "6"], ["꽃", "7"], ["번개", "8"]
    ],
    [
      ["ㄱ", "1"], ["ㄴ", "2"], ["ㄷ", "3"], ["ㄹ", "4"], ["ㅁ", "5"], ["ㅂ", "6"], ["ㅅ", "7"], ["ㅇ", "8"]
    ]
  ];

  const ROTATION_FIGURES = [
    { id: "hook", label: "ㄱ" },
    { id: "zig", label: "ㄹ" },
    { id: "tee", label: "ㅓ" },
    { id: "flag", label: "F" },
    { id: "step", label: "L" }
  ];

  const PROFILES = {
    "spatial-item-memory": {
      sourceId: "01-006-1",
      title: "공간 물건 기억",
      desc: "물건의 위치를 기억하고 다시 찾아요.",
      domain: "시공간 작업기억",
      focusKey: "working-memory",
      focusLabel: "작업기억",
      kind: "image-memory",
      pool: CATEGORY_IMAGES.concat(SNACK_IMAGES),
      totalRounds: 8
    },
    "sequence-memory": {
      sourceId: "01-007",
      title: "순서 기억",
      desc: "빛나는 순서를 기억해 같은 순서로 눌러요.",
      domain: "순차 작업기억",
      focusKey: "sequential-memory",
      focusLabel: "순서 기억",
      kind: "sequence",
      totalRounds: 8
    },
    "face-name-memory": {
      sourceId: "01-008",
      title: "얼굴 이름 기억",
      desc: "얼굴과 이름을 연결해서 기억해요.",
      domain: "시각 연합 기억",
      focusKey: "associative-memory",
      focusLabel: "연합 기억",
      kind: "image-choice",
      pool: FACE_IMAGES,
      totalRounds: 8
    },
    "shape-sequence": {
      sourceId: "01-009",
      title: "도형 순서 기억",
      desc: "도형과 색의 순서를 보고 빠진 것을 찾아요.",
      domain: "시각 순서화",
      focusKey: "visual-sequencing",
      focusLabel: "시각 순서",
      kind: "shape-sequence",
      totalRounds: 8
    },
    "pair-memory": {
      sourceId: "01-010",
      title: "짝 기억",
      desc: "같은 그림의 위치를 기억해 짝을 찾습니다.",
      domain: "시각 기억",
      focusKey: "visual-memory",
      focusLabel: "시각 기억",
      kind: "pair",
      pool: CATEGORY_IMAGES,
      totalRounds: 8
    },
    "visual-cancellation": {
      sourceId: "01-011",
      title: "매의 눈",
      desc: "많은 보기 중 목표 도형을 빠르게 찾아요.",
      domain: "선택 주의",
      focusKey: "selective-attention",
      focusLabel: "선택 주의",
      kind: "visual-search",
      totalRounds: 8
    },
    "trail-making": {
      sourceId: "01-012",
      title: "선로 잇기",
      desc: "숫자와 글자를 순서대로 연결해요.",
      domain: "주의 전환",
      focusKey: "set-shifting",
      focusLabel: "주의 전환",
      kind: "order",
      totalRounds: 6
    },
    "mental-rotation": {
      sourceId: "01-013",
      title: "회전 도형",
      desc: "돌아간 모양이 같은 도형을 골라요.",
      domain: "시공간 회전",
      focusKey: "spatial-rotation",
      focusLabel: "공간 회전",
      kind: "rotation",
      totalRounds: 8
    },
    "figure-ground": {
      sourceId: "01-015",
      title: "겹친 도형",
      desc: "겹쳐 보이는 그림 안에서 목표를 찾아요.",
      domain: "형태 변별",
      focusKey: "figure-ground",
      focusLabel: "도형 배경 변별",
      kind: "visual-search",
      totalRounds: 8
    },
    "initial-sound-fluency": {
      sourceId: "01-016",
      title: "초성 폭탄",
      desc: "초성에 맞는 낱말을 빠르게 고릅니다.",
      domain: "언어 유창성",
      focusKey: "phonemic-fluency",
      focusLabel: "음운 유창성",
      kind: "text-choice",
      totalRounds: 10
    },
    "photo-word-recognition": {
      sourceId: "01-017",
      title: "단어 인식 실사",
      desc: "실제 사진과 맞는 단어를 연결합니다.",
      domain: "시각-언어 연결",
      focusKey: "word-recognition",
      focusLabel: "단어 인식",
      kind: "image-choice",
      pool: CATEGORY_IMAGES,
      totalRounds: 10
    },
    "cloze-inference": {
      sourceId: "01-018",
      title: "빈칸 추리",
      desc: "문맥을 읽고 알맞은 낱말을 넣어요.",
      domain: "언어 추론",
      focusKey: "language-inference",
      focusLabel: "문맥 추론",
      kind: "cloze",
      totalRounds: 10
    },
    "story-sequence": {
      sourceId: "01-020",
      title: "이야기 순서",
      desc: "이야기의 앞뒤 흐름을 순서대로 정리해요.",
      domain: "이야기 조직화",
      focusKey: "narrative-sequencing",
      focusLabel: "순서 조직화",
      kind: "story-order",
      totalRounds: 6
    },
    "number-balance": {
      sourceId: "01-021",
      title: "숫자 저울",
      desc: "양쪽이 같아지는 숫자 관계를 찾아요.",
      domain: "수 추론",
      focusKey: "number-reasoning",
      focusLabel: "수 추론",
      kind: "number-choice",
      totalRounds: 8
    },
    "hanoi-planning": {
      sourceId: "01-022",
      title: "하노이의 규칙",
      desc: "원반을 규칙에 맞게 옮기는 계획을 세워요.",
      domain: "계획 및 실행기능",
      focusKey: "planning",
      focusLabel: "계획 능력",
      kind: "hanoi",
      totalRounds: 6
    },
    "pattern-matrix": {
      sourceId: "01-023",
      title: "패턴의 비밀",
      desc: "칸의 규칙을 보고 빠진 그림을 찾아요.",
      domain: "비언어 추론",
      focusKey: "pattern-reasoning",
      focusLabel: "패턴 추론",
      kind: "pattern",
      totalRounds: 8
    },
    "symbol-decoding": {
      sourceId: "01-024",
      title: "암호 해독가",
      desc: "기호와 숫자의 짝을 기억해 암호를 풉니다.",
      domain: "처리 속도와 규칙 기억",
      focusKey: "symbol-coding",
      focusLabel: "기호 부호화",
      kind: "symbol",
      totalRounds: 8
    }
  };

  const state = {
    profileId: window.REHAB_LEGACY_PROFILE || "cloze-inference",
    ageKey: "",
    level: 1,
    roundIndex: 0,
    startedAtMs: 0,
    roundStartedAtMs: 0,
    logs: [],
    currentRound: null,
    studySet: [],
    studyDurationSec: 0,
    studyCountdownId: null,
    selection: [],
    selectedChoice: null,
    answerLocked: false
  };

  const els = {};

  const $ = (id) => document.getElementById(id);
  const shuffle = (items) => items.slice().sort(() => Math.random() - 0.5);
  const sample = (items, count) => shuffle(items).slice(0, count);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
  const avg = (items) => {
    const values = items.map(Number).filter((n) => Number.isFinite(n));
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  function profile() {
    return PROFILES[state.profileId] || PROFILES["cloze-inference"];
  }

  function levelLoad() {
    const age = AGE_GROUPS[state.ageKey] || AGE_GROUPS.child;
    return clamp((Number(state.level) || 1) + age.modifier, 1, 6);
  }

  function isFaceNameProfile(current = profile()) {
    return current.kind === "image-choice" && current.focusKey === "associative-memory";
  }

  function faceNameStudyPairCount() {
    const ageAdjustment = state.ageKey === "teen" || state.ageKey === "adult" ? 1 : 0;
    return clamp(3 + Math.floor((levelLoad() - 1) / 1.25) + ageAdjustment, 3, 8);
  }

  function faceNameStudyDurationSec(pairCount) {
    const baseByAge = {
      toddler: 44,
      child: 38,
      teen: 34,
      adult: 32,
      senior: 52
    };
    const base = baseByAge[state.ageKey] || baseByAge.child;
    return clamp(base + Math.max(0, pairCount - 3) * 7 + (Number(state.level) || 1) * 2, 40, 84);
  }

  function clearStudyCountdown() {
    if (state.studyCountdownId) {
      window.clearInterval(state.studyCountdownId);
      state.studyCountdownId = null;
    }
  }

  function init() {
    cacheEls();
    const current = profile();
    document.title = current.title;
    els.shellTitle.textContent = current.title;
    els.menuTitle.textContent = current.title;
    els.menuDesc.textContent = current.desc;
    els.helpTitle.textContent = `${current.title} 안내`;
    els.helpMethod.textContent = helpMethod(current);
    els.helpEffect.textContent = helpEffect(current);
    renderAges();
    renderLevels();
    bindEvents();
    showScreen("menu");
  }

  function cacheEls() {
    [
      "shellTitle", "stageButton", "helpButton", "menuView", "gameView", "resultView",
      "menuTitle", "menuDesc", "ageRow", "levelGrid", "startButton", "gameTitle",
      "gameKicker", "roundChip", "timerChip", "questionPanel", "answerPanel",
      "feedbackToast", "resultTitle", "resultSummary", "resultStats", "professionalReport",
      "retryButton", "menuButton", "helpModal", "helpTitle", "helpMethod", "helpEffect", "helpClose"
    ].forEach((id) => { els[id] = $(id); });
  }

  function renderAges() {
    els.ageRow.innerHTML = Object.entries(AGE_GROUPS).map(([key, item]) => (
      `<button type="button" class="legacy-pill-btn" data-age="${key}">${item.label}</button>`
    )).join("");
  }

  function renderLevels() {
    els.levelGrid.innerHTML = LEVELS.map((level) => (
      `<button type="button" class="legacy-level-card" data-level="${level.id}">
        <span>${String(level.id).padStart(2, "0")}단계</span>
        <h2>${escapeHtml(level.title)}</h2>
        <p>${escapeHtml(level.detail)}</p>
      </button>`
    )).join("");
  }

  function bindEvents() {
    els.ageRow.addEventListener("click", (event) => {
      const button = event.target.closest("[data-age]");
      if (!button) return;
      state.ageKey = button.dataset.age;
      updateMenu();
    });
    els.levelGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-level]");
      if (!button) return;
      state.level = Number(button.dataset.level) || 1;
      updateMenu();
    });
    els.startButton.addEventListener("click", start);
    els.stageButton.addEventListener("click", () => {
      clearStudyCountdown();
      showScreen("menu");
    });
    els.retryButton.addEventListener("click", start);
    els.menuButton.addEventListener("click", () => {
      clearStudyCountdown();
      showScreen("menu");
    });
    els.helpButton.addEventListener("click", () => toggleHelp(true));
    els.helpClose.addEventListener("click", () => toggleHelp(false));
    els.helpModal.addEventListener("click", (event) => {
      if (event.target.dataset.closeModal !== undefined) toggleHelp(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") toggleHelp(false);
      if (event.key === "Enter" && els.gameView.classList.contains("is-active")) checkOpenAnswer();
    });
    updateMenu();
  }

  function updateMenu() {
    document.querySelectorAll("[data-age]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.age === state.ageKey);
    });
    document.querySelectorAll("[data-level]").forEach((button) => {
      button.classList.toggle("is-selected", Number(button.dataset.level) === state.level);
    });
    const ready = Boolean(state.ageKey && state.level);
    els.startButton.disabled = !ready;
    const age = AGE_GROUPS[state.ageKey];
    els.startButton.textContent = ready ? `${age.label} · ${state.level}단계 시작` : "연령과 단계를 선택해 주세요";
  }

  function showScreen(name) {
    ["menu", "game", "result"].forEach((screen) => {
      els[`${screen}View`].classList.toggle("is-active", screen === name);
    });
    if (name !== "game") clearStudyCountdown();
    els.stageButton.hidden = name === "menu";
    if (name === "result") {
      window.requestAnimationFrame(() => {
        const main = document.querySelector(".legacy-main");
        if (main) main.scrollTop = 0;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === "function") {
      window.PlaylabReportEngine.setPdfButtonVisible(name === "result", {
        title: () => `${profile().title}-재활랩-리포트`
      });
    }
  }

  function toggleHelp(open) {
    els.helpModal.classList.toggle("is-open", open);
    els.helpModal.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function start() {
    state.roundIndex = 0;
    state.startedAtMs = Date.now();
    state.logs = [];
    state.selection = [];
    state.selectedChoice = null;
    state.answerLocked = false;
    state.studySet = [];
    state.studyDurationSec = 0;
    clearStudyCountdown();
    els.gameKicker.textContent = `${AGE_GROUPS[state.ageKey].label} · ${state.level}단계`;
    els.gameTitle.textContent = profile().title;
    showScreen("game");
    if (isFaceNameProfile()) {
      renderFaceNameStudyPhase();
      return;
    }
    nextRound();
  }

  function renderFaceNameStudyPhase() {
    const current = profile();
    const pairCount = Math.min(faceNameStudyPairCount(), current.pool.length);
    state.studySet = sample(current.pool, pairCount);
    state.studyDurationSec = faceNameStudyDurationSec(pairCount);
    let remaining = state.studyDurationSec;
    const workspace = els.questionPanel.closest(".legacy-workspace");
    if (workspace) workspace.classList.add("is-single");
    els.answerPanel.hidden = true;
    els.roundChip.textContent = `이름 보기 ${pairCount}명`;
    els.timerChip.textContent = `${remaining}초`;
    els.questionPanel.innerHTML = `
      <div class="legacy-question legacy-face-study-phase">
        <div class="legacy-study-intro">
          <span class="legacy-kicker">먼저 기억하기</span>
          <h2>사진과 이름을 천천히 연결해 보세요.</h2>
          <p>이름을 소리 내어 말하거나, 얼굴 특징과 이름을 함께 떠올린 뒤 문제를 시작합니다.</p>
        </div>
        <div class="legacy-face-study-grid" aria-label="얼굴 이름 기억 카드">
          ${state.studySet.map((item) => `
            <article class="legacy-face-study-card">
              <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.label)} 얼굴 사진">
              <strong>${escapeHtml(item.label)}</strong>
            </article>
          `).join("")}
        </div>
        <div class="legacy-study-actions">
          <p id="faceNameStudyStatus">남은 시간 ${remaining}초</p>
          <button type="button" class="legacy-main-btn" id="faceNameStartQuiz" disabled>문제 풀기 시작</button>
        </div>
      </div>
    `;
    const status = $("faceNameStudyStatus");
    const startQuizButton = $("faceNameStartQuiz");
    const unlockQuiz = () => {
      clearStudyCountdown();
      els.timerChip.textContent = "준비 완료";
      if (status) status.textContent = "충분히 보았다면 문제를 시작하세요.";
      if (startQuizButton) {
        startQuizButton.disabled = false;
        startQuizButton.textContent = "문제 풀기 시작";
      }
    };
    state.studyCountdownId = window.setInterval(() => {
      remaining -= 1;
      els.timerChip.textContent = `${Math.max(0, remaining)}초`;
      if (status) status.textContent = remaining > 0 ? `남은 시간 ${remaining}초` : "충분히 보았다면 문제를 시작하세요.";
      if (remaining <= 0) unlockQuiz();
    }, 1000);
    startQuizButton.addEventListener("click", () => {
      if (startQuizButton.disabled) return;
      clearStudyCountdown();
      nextRound();
    });
  }

  function nextRound() {
    hideFeedback();
    const current = profile();
    if (state.roundIndex >= current.totalRounds) {
      finish();
      return;
    }
    state.roundStartedAtMs = Date.now();
    state.selection = [];
    state.selectedChoice = null;
    state.answerLocked = false;
    state.currentRound = buildRound(current);
    els.roundChip.textContent = `문항 ${state.roundIndex + 1} / ${current.totalRounds}`;
    els.timerChip.textContent = state.currentRound.timeLimit ? `${state.currentRound.timeLimit}초` : "시간 제한 없음";
    renderRound(state.currentRound);
  }

  function buildRound(current) {
    const builders = {
      "image-memory": buildImageMemory,
      sequence: buildSequence,
      "image-choice": buildImageChoice,
      "shape-sequence": buildShapeSequence,
      pair: buildPair,
      "visual-search": buildVisualSearch,
      order: buildTrailOrder,
      rotation: buildRotation,
      "text-choice": buildTextChoice,
      cloze: buildCloze,
      "story-order": buildStoryOrder,
      "number-choice": buildNumberChoice,
      hanoi: buildHanoi,
      pattern: buildPattern,
      symbol: buildSymbol
    };
    return (builders[current.kind] || buildTextChoice)(current);
  }

  function buildImageMemory(current) {
    const choices = sample(current.pool, 4);
    const answer = choices[Math.floor(Math.random() * choices.length)];
    return {
      mode: "choice",
      prompt: "위치를 기억한 물건을 고르세요.",
      stimulusHtml: imageGrid(choices.map((item, index) => ({ ...item, hidden: item.label === answer.label, index }))),
      choices: shuffle(choices.map((item) => ({ label: item.label, image: item.src, value: item.label }))),
      answer: answer.label,
      questionLog: answer.label
    };
  }

  function buildSequence() {
    const load = levelLoad();
    const icons = ["●", "■", "▲", "◆", "★", "♥"];
    const length = clamp(3 + Math.floor(load / 2), 3, 6);
    const seq = sample(icons, length);
    const removed = seq[seq.length - 1];
    return {
      mode: "choice",
      prompt: "순서를 보고 마지막에 올 모양을 고르세요.",
      stimulusHtml: tileRow(seq.slice(0, -1).concat("?")),
      choices: shuffle(icons).slice(0, 4).map((label) => ({ label, value: label })),
      answer: removed,
      questionLog: seq.join("-")
    };
  }

  function buildImageChoice(current) {
    const isFaceName = isFaceNameProfile(current);
    if (isFaceName && state.studySet.length) {
      const answer = state.studySet[state.roundIndex % state.studySet.length];
      const choiceCount = Math.min(state.studySet.length, clamp(3 + Math.floor(levelLoad() / 3), 3, 4));
      const distractors = sample(state.studySet.filter((item) => item.label !== answer.label), choiceCount - 1);
      return {
        mode: "choice",
        prompt: "방금 본 얼굴의 이름을 고르세요.",
        stimulusHtml: `<div class="legacy-image-card legacy-face-question-card"><img src="${answer.src}" alt="이름을 고를 얼굴 사진"></div>`,
        choices: shuffle([answer].concat(distractors)).map((item) => ({ label: item.label, value: item.label })),
        answer: answer.label,
        questionLog: `${answer.label} / study:${state.studySet.map((item) => item.label).join(",")}`
      };
    }
    const pool = sample(current.pool, Math.min(4, current.pool.length));
    const answer = pool[Math.floor(Math.random() * pool.length)];
    return {
      mode: "choice",
      prompt: isFaceName ? "얼굴에 맞는 이름을 고르세요." : "그림에 맞는 낱말을 고르세요.",
      stimulusHtml: `<div class="legacy-image-card" style="width:min(360px,70%);"><img src="${answer.src}" alt="${escapeHtml(answer.label)}"></div>`,
      choices: shuffle(pool.map((item) => ({ label: item.label, value: item.label }))),
      answer: answer.label,
      questionLog: answer.label
    };
  }

  function buildShapeSequence() {
    const shapes = ["circle", "square", "triangle", "diamond"];
    const colors = ["#ff6969", "#38a5ff", "#24c989", "#f4b740"];
    const answer = { shape: shapes[Math.floor(Math.random() * shapes.length)], color: colors[Math.floor(Math.random() * colors.length)] };
    const distractors = sample(shapes.flatMap((shape) => colors.map((color) => ({ shape, color }))).filter((item) => item.shape !== answer.shape || item.color !== answer.color), 3);
    return {
      mode: "choice",
      prompt: "빈칸에 들어갈 도형을 고르세요.",
      stimulusHtml: tileRow([shapeHtml(answer), shapeHtml(answer), "?"]),
      choices: shuffle([answer].concat(distractors)).map((item) => ({ label: shapeHtml(item), value: `${item.shape}-${item.color}`, html: shapeHtml(item) })),
      answer: `${answer.shape}-${answer.color}`,
      questionLog: `${answer.shape}-${answer.color}`
    };
  }

  function buildPair(current) {
    const pool = sample(current.pool, Math.min(5, current.pool.length));
    const answer = pool[Math.floor(Math.random() * pool.length)];
    const distractors = shuffle(pool.filter((item) => item.label !== answer.label)).slice(0, 3);
    return {
      mode: "choice",
      prompt: "처음 본 그림과 같은 짝을 고르세요.",
      stimulusHtml: `
        <div class="legacy-pair-cue">
          <div class="legacy-image-card"><img src="${answer.src}" alt="${escapeHtml(answer.label)}"></div>
          <div class="legacy-pair-plus">=</div>
          <div class="legacy-image-card legacy-memory-cover">?</div>
        </div>
      `,
      choices: shuffle([answer].concat(distractors)).map((item) => ({ label: item.label, image: item.src, value: item.label })),
      answer: answer.label,
      questionLog: answer.label
    };
  }

  function buildVisualSearch(current) {
    const shapes = ["circle", "square", "triangle", "diamond"];
    const target = shapes[Math.floor(Math.random() * shapes.length)];
    const color = ["#ff6969", "#38a5ff", "#24c989", "#f4b740"][Math.floor(Math.random() * 4)];
    const otherShapes = shapes.filter((shape) => shape !== target);
    const board = Array.from({ length: 16 }, () => otherShapes[Math.floor(Math.random() * otherShapes.length)]);
    const answerIndex = Math.floor(Math.random() * board.length);
    board[answerIndex] = target;
    return {
      mode: "choice",
      prompt: "같은 모양을 찾아 누르세요.",
      stimulusHtml: `<div class="legacy-sub-text">목표</div><div class="legacy-image-card">${shapeHtml({ shape: target, color })}</div>`,
      choices: board.map((shape, index) => ({ label: shapeHtml({ shape, color: shape === target ? color : "#9aa7b5" }), html: shapeHtml({ shape, color: shape === target ? color : "#9aa7b5" }), value: String(index) })),
      answer: String(answerIndex),
      questionLog: target,
      wide: true
    };
  }

  function buildTrailOrder() {
    const length = clamp(4 + Math.floor(levelLoad() / 2), 4, 7);
    const target = Array.from({ length }, (_, index) => String(index + 1));
    return {
      mode: "build",
      prompt: "순서대로 빈칸에 넣으세요.",
      slots: target.length,
      tokens: shuffle(target),
      answer: target,
      questionLog: target.join("-")
    };
  }

  function buildRotation() {
    const answerFigure = ROTATION_FIGURES[state.roundIndex % ROTATION_FIGURES.length];
    const rotation = [45, 90, 135, 180, 225][(state.roundIndex + levelLoad()) % 5];
    return {
      mode: "choice",
      prompt: "돌아간 모양과 같은 글자 모양을 고르세요.",
      stimulusHtml: `<div class="legacy-rotation-card" aria-label="${escapeHtml(answerFigure.label)} 회전 보기"><span style="transform:rotate(${rotation}deg);">${escapeHtml(answerFigure.label)}</span></div>`,
      choices: shuffle([answerFigure].concat(shuffle(ROTATION_FIGURES.filter((item) => item.id !== answerFigure.id)).slice(0, 3))).map((item) => ({
        label: item.label,
        html: `<span class="legacy-rotation-choice">${escapeHtml(item.label)}</span>`,
        value: item.id
      })),
      answer: answerFigure.id,
      questionLog: `${answerFigure.label}-${rotation}`
    };
  }

  function buildTextChoice() {
    const sets = [
      { cue: "ㄱ", answer: "가방", wrong: ["나무", "사과", "모자"] },
      { cue: "ㅂ", answer: "바나나", wrong: ["토마토", "신발", "고양이"] },
      { cue: "ㅅ", answer: "사자", wrong: ["오리", "기차", "라디오"] },
      { cue: "ㅁ", answer: "모자", wrong: ["연필", "우산", "공책"] },
      { cue: "ㄷ", answer: "도토리", wrong: ["바구니", "카메라", "신문"] }
    ];
    const q = sets[state.roundIndex % sets.length];
    return {
      mode: "choice",
      prompt: `초성 '${q.cue}'로 시작하는 낱말을 고르세요.`,
      stimulusHtml: `<div class="legacy-question-text">${q.cue}</div>`,
      choices: shuffle([q.answer].concat(q.wrong)).map((label) => ({ label, value: label })),
      answer: q.answer,
      questionLog: q.cue
    };
  }

  function buildCloze() {
    const q = CLOZE_QUESTIONS[state.roundIndex % CLOZE_QUESTIONS.length];
    const parts = q.text.split("___");
    return {
      mode: "build",
      prompt: "",
      stimulusHtml: `<div class="legacy-question-text">${escapeHtml(parts[0])}<span class="legacy-slot is-filled" style="display:inline-flex;min-width:140px;min-height:72px;margin:0 10px;">?</span>${escapeHtml(parts[1] || "")}</div>`,
      slots: 1,
      tokens: shuffle([q.answer].concat(q.wrong)),
      answer: [q.answer],
      questionLog: q.text
    };
  }

  function buildStoryOrder() {
    const story = STORIES[state.roundIndex % STORIES.length];
    return {
      mode: "build",
      prompt: story.prompt,
      slots: story.answer.length,
      tokens: shuffle(story.answer),
      answer: story.answer,
      questionLog: story.prompt
    };
  }

  function buildNumberChoice() {
    const a = 2 + (state.roundIndex % 5);
    const b = clamp(levelLoad(), 1, 6);
    const answer = a + b;
    return {
      mode: "choice",
      prompt: "저울이 같아지려면 어떤 숫자가 필요할까요?",
      stimulusHtml: `<div class="legacy-question-text">${a} + ${b} = ?</div>`,
      choices: shuffle([answer, answer + 1, Math.max(1, answer - 1), answer + 3]).map((n) => ({ label: String(n), value: String(n) })),
      answer: String(answer),
      questionLog: `${a}+${b}`
    };
  }

  function buildHanoi() {
    const disks = clamp(2 + Math.floor(levelLoad() / 2), 2, 4);
    const answer = Math.pow(2, disks) - 1;
    return {
      mode: "choice",
      prompt: "모든 원반을 옮기는 최소 이동 횟수를 고르세요.",
      stimulusHtml: towerHtml(disks),
      choices: shuffle([answer, answer + 1, answer + 2, answer - 1].filter((n) => n > 0)).map((n) => ({ label: String(n), value: String(n) })),
      answer: String(answer),
      questionLog: `${disks}disks`
    };
  }

  function buildPattern() {
    const values = ["●", "▲", "■", "◆"];
    const answer = values[state.roundIndex % values.length];
    const row = [answer, values[(state.roundIndex + 1) % values.length], answer, "?"];
    return {
      mode: "choice",
      prompt: "반복되는 규칙을 보고 빈칸을 고르세요.",
      stimulusHtml: tileRow(row),
      choices: shuffle(values).map((value) => ({ label: value, value })),
      answer,
      questionLog: row.join("-")
    };
  }

  function buildSymbol() {
    const set = SYMBOL_SETS[state.roundIndex % SYMBOL_SETS.length];
    const picked = sample(set, 4);
    const answerPair = picked[Math.floor(Math.random() * picked.length)];
    return {
      mode: "choice",
      prompt: "표를 보고 암호의 값을 고르세요.",
      stimulusHtml: `<div class="legacy-mini-board" data-cols="4">${picked.map((pair) => `<div class="legacy-tile">${escapeHtml(pair[0])}<small style="font-size:24px;margin-left:8px;color:#7b8ca0;">${pair[1]}</small></div>`).join("")}</div><div class="legacy-question-text" style="margin-top:20px;">${escapeHtml(answerPair[0])} = ?</div>`,
      choices: shuffle([answerPair[1]].concat(shuffle(set.map((pair) => pair[1]).filter((value) => value !== answerPair[1])).slice(0, 3))).map((value) => ({ label: value, value })),
      answer: answerPair[1],
      questionLog: `${answerPair[0]}=${answerPair[1]}`
    };
  }

  function renderRound(round) {
    hideFeedback();
    const workspace = els.questionPanel.closest(".legacy-workspace");
    if (workspace) workspace.classList.remove("is-single");
    els.answerPanel.hidden = false;
    els.questionPanel.innerHTML = `
      <div class="legacy-question">
        <div class="legacy-sub-text">${escapeHtml(round.prompt)}</div>
        ${round.stimulusHtml || ""}
      </div>
    `;
    els.answerPanel.innerHTML = "";
    if (round.mode === "choice") renderChoices(round);
    if (round.mode === "build") renderBuilder(round);
  }

  function renderChoices(round) {
    const wide = round.wide || (round.choices && round.choices.length > 4);
    els.answerPanel.innerHTML = `
      <div class="legacy-choice-grid ${wide ? "is-wide" : ""}" id="choiceGrid">
        ${round.choices.map((choice, index) => `
          <button type="button" class="legacy-choice ${choice.image ? "has-image" : ""}" data-value="${escapeHtml(choice.value)}" data-index="${index}">
            ${choice.image ? `<img src="${choice.image}" alt="${escapeHtml(choice.label)}"><span>${escapeHtml(choice.label)}</span>` : (choice.html || escapeHtml(choice.label))}
          </button>
        `).join("")}
      </div>
    `;
    els.answerPanel.querySelectorAll(".legacy-choice").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedChoice = button.dataset.value;
        els.answerPanel.querySelectorAll(".legacy-choice").forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        submitChoice(button.dataset.value, button);
      });
    });
  }

  function renderBuilder(round) {
    els.answerPanel.innerHTML = `
      <div class="legacy-slot-row" id="slotRow">
        ${Array.from({ length: round.slots }, (_, index) => `<button type="button" class="legacy-slot" data-slot="${index}" aria-label="빈칸 ${index + 1}">?</button>`).join("")}
      </div>
      <div class="legacy-word-bank" id="wordBank">
        ${round.tokens.map((token, index) => `<button type="button" draggable="true" class="legacy-token" data-token="${escapeHtml(token)}" data-index="${index}">${escapeHtml(token)}</button>`).join("")}
      </div>
      <div class="legacy-check-row"><button type="button" class="legacy-main-btn" id="checkAnswer">확인</button></div>
    `;
    const fillToken = (token, tokenButton, slotIndex) => {
      const slots = Array.from(els.answerPanel.querySelectorAll(".legacy-slot"));
      const targetSlot = Number.isInteger(slotIndex) ? slots[slotIndex] : slots.find((slot) => !slot.dataset.value);
      if (!targetSlot || !token) return;
      targetSlot.textContent = token;
      targetSlot.dataset.value = token;
      targetSlot.classList.add("is-filled");
      if (tokenButton) tokenButton.classList.add("is-used");
      state.selection = slots.map((slot) => slot.dataset.value || "");
    };
    els.answerPanel.querySelectorAll(".legacy-token").forEach((button) => {
      button.addEventListener("click", () => fillToken(button.dataset.token, button));
      button.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", button.dataset.token);
        event.dataTransfer.setData("text/index", button.dataset.index);
      });
    });
    els.answerPanel.querySelectorAll(".legacy-slot").forEach((slot) => {
      slot.addEventListener("click", () => {
        slot.textContent = "?";
        delete slot.dataset.value;
        slot.classList.remove("is-filled");
        state.selection = Array.from(els.answerPanel.querySelectorAll(".legacy-slot")).map((item) => item.dataset.value || "");
      });
      slot.addEventListener("dragover", (event) => event.preventDefault());
      slot.addEventListener("drop", (event) => {
        event.preventDefault();
        const token = event.dataTransfer.getData("text/plain");
        const index = event.dataTransfer.getData("text/index");
        const button = els.answerPanel.querySelector(`.legacy-token[data-index="${CSS.escape(index)}"]`);
        fillToken(token, button, Number(slot.dataset.slot));
      });
    });
    $("checkAnswer").addEventListener("click", checkOpenAnswer);
  }

  function checkOpenAnswer() {
    const round = state.currentRound;
    if (!round || round.mode !== "build") return;
    const slots = Array.from(els.answerPanel.querySelectorAll(".legacy-slot"));
    const response = slots.map((slot) => slot.dataset.value || "");
    const correct = response.length === round.answer.length && response.every((value, index) => value === round.answer[index]);
    submitAnswer(correct, response.join(" / "), round.answer.join(" / "));
  }

  function submitChoice(value, button) {
    const round = state.currentRound;
    if (!round || state.answerLocked) return;
    const correct = value === round.answer;
    button.classList.add(correct ? "is-correct" : "is-wrong");
    submitAnswer(correct, value, round.answer);
  }

  function submitAnswer(correct, response, answer) {
    const round = state.currentRound;
    if (!round || state.answerLocked) return;
    state.answerLocked = true;
    const reactionMs = Date.now() - state.roundStartedAtMs;
    state.logs.push({
      round: state.roundIndex + 1,
      correct,
      response,
      answer,
      reactionMs,
      stimulus: round.questionLog || round.prompt,
      profileId: state.profileId,
      sourceLegacyId: profile().sourceId
    });
    playFeedback(correct);
    showFeedback("", correct);
    state.roundIndex += 1;
    window.setTimeout(() => {
      hideFeedback();
      nextRound();
    }, QUESTION_TRANSITION_AFTER_FEEDBACK_MS);
  }

  function playFeedback(correct) {
    const src = correct ? "../sound/correct.mp3" : "../sound/error.mp3";
    try {
      const audio = new Audio(src);
      audio.volume = 0.65;
      audio.play().catch(() => {});
    } catch (_error) {}
  }

  function showFeedback(message, correct) {
    els.feedbackToast.textContent = "";
    els.feedbackToast.classList.remove("is-visible");
    if (window.HahaFeedbackOverlay) {
      window.HahaFeedbackOverlay.showQuestionComplete(correct ? "correct" : "wrong", {
        sound: false,
        durationMs: QUESTION_FEEDBACK_EFFECT_MS
      });
    }
  }

  function hideFeedback() {
    if (els.feedbackToast) els.feedbackToast.classList.remove("is-visible");
    const overlay = window.PlaylabFeedbackOverlay || window.HahaFeedbackOverlay;
    if (overlay && typeof overlay.hide === "function") overlay.hide();
  }

  function finish() {
    const current = profile();
    const selectedAge = AGE_GROUPS[state.ageKey] || AGE_GROUPS.child;
    const selectedLevel = LEVELS.find((item) => item.id === state.level) || LEVELS[2];
    const total = state.logs.length;
    const correctCount = state.logs.filter((item) => item.correct).length;
    const wrongCount = total - correctCount;
    const elapsedMs = Date.now() - state.startedAtMs;
    const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
    const avgReactionMs = Math.round(avg(state.logs.map((item) => item.reactionMs)));
    const score = Math.round(accuracy * 0.72 + clamp(100 - avgReactionMs / 45, 0, 100) * 0.28);
    const reportInput = {
      reportType: "rehab-cognitive-legacy",
      reportScope: REPORT_SCOPE,
      labKind: "rehab",
      labTitle: current.title,
      domain: current.domain,
      focusKey: current.focusKey,
      focusLabel: current.focusLabel,
      normProfile: selectedAge.normProfile,
      normProfileLabel: `${selectedAge.label} ${selectedAge.range} 기준`,
      ageGroupKey: state.ageKey,
      ageGroupLabel: selectedAge.label,
      ageRangeLabel: selectedAge.range,
      level: state.level,
      levelLabel: `${state.level}단계 ${selectedLevel.title}`,
      difficultyLabel: selectedLevel.clinicalLabel || selectedLevel.detail,
      difficultyIndex: levelLoad(),
      benchmarkMs: selectedAge.benchmarkMs,
      totalQuestions: total,
      totalItems: total,
      completionCount: total,
      correctCount,
      wrongCount,
      retryCount: wrongCount,
      accuracyScore: accuracy,
      accuracyRate: accuracy,
      firstTryRate: accuracy,
      completionRate: 100,
      score,
      avgQuestionMs: avgReactionMs,
      elapsedMs,
      questionLogs: state.logs
    };
    const report = buildReport(reportInput, current);
    els.resultTitle.textContent = `${current.title} 완료`;
    els.resultSummary.textContent = `${selectedAge.label}(${selectedAge.range}) ${state.level}단계에서 ${correctCount}/${total}개 정답, 평균 반응 ${avgReactionMs}ms로 기록되었습니다. 본 결과는 회기 내 훈련 수행 자료이며 표준화 진단 검사를 대체하지 않습니다.`;
    els.resultStats.innerHTML = `
      <div class="legacy-choice-grid">
        <div class="legacy-tile">정확도 ${accuracy}%</div>
        <div class="legacy-tile">점수 ${score}</div>
        <div class="legacy-tile">정답 ${correctCount}</div>
        <div class="legacy-tile">오답 ${wrongCount}</div>
      </div>
    `;
    els.professionalReport.innerHTML = renderReport(report);
    showScreen("result");
    saveReports(reportInput, report, { total, correctCount, wrongCount, accuracy, score, avgReactionMs, elapsedMs });
  }

  function buildReport(reportInput, current) {
    let report = null;
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === "function") {
      report = window.PlaylabReportEngine.buildReport(reportInput);
    }
    const accuracy = reportInput.accuracyScore;
    const speedScore = clamp(Math.round(100 - reportInput.avgQuestionMs / 50), 20, 100);
    const stability = clamp(Math.round((accuracy * 0.7) + (speedScore * 0.3)), 0, 100);
    const professionalOpinion = makeProfessionalOpinion(current, reportInput, stability);
    const recommendations = makeRecommendations(current, reportInput);
    return Object.assign({
      title: `${current.title} 재활랩 리포트`,
      headline: professionalOpinion.headline,
      integratedScore: reportInput.score,
      briefOpinion: professionalOpinion.brief,
      overview: professionalOpinion.overview,
      recommendations,
      axes: [
        { id: "accuracy", label: current.focusLabel, score: reportInput.accuracyScore },
        { id: "attention", label: "처리 안정성", score: stability },
        { id: "speed", label: "반응 효율", score: speedScore }
      ]
    }, report || {}, {
      headline: professionalOpinion.headline,
      briefOpinion: professionalOpinion.brief,
      overview: professionalOpinion.overview,
      recommendations,
      axes: [
        { id: "accuracy", label: current.focusLabel, score: reportInput.accuracyScore },
        { id: "attention", label: "처리 안정성", score: stability },
        { id: "speed", label: "반응 효율", score: speedScore }
      ]
    });
  }

  function renderReport(report) {
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === "function") {
      return `<div class="legacy-report-wrap">${window.PlaylabReportEngine.renderHtml(report, { variant: "standalone" })}</div>`;
    }
    return `
      <div class="legacy-report-wrap">
        <h3>${escapeHtml(report.headline)}</h3>
        <p>${escapeHtml(report.briefOpinion)}</p>
        <p>${escapeHtml(report.overview)}</p>
      </div>
    `;
  }

  function buildRehabDualModeFields({ report, metrics, stageTitle, focusLabel } = {}) {
    const guardianSummary = `이번 재활 활동에서는 ${focusLabel} 과제의 참여 흐름과 반응 양상이 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.`;
    const teacherReviewNote = "RehabLab 결과는 반응 정확도, 반응 속도, 오류 패턴, 자기조절 흐름을 함께 보는 전문 참고 기록입니다. 다음 활동과 난이도는 담당 선생님이 내담자의 컨디션과 수업 맥락을 함께 확인해 조정합니다.";
    const actionPlanSummary = "다음 재활 활동은 자동 확정하지 않고 선생님 검토 후 조정합니다.";
    return {
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      actionPlanPolicy: "teacher-review-required",
      reportDisplayModes: {
        guardian: { label: "보호자 공유", summary: guardianSummary },
        teacher: { label: "전문가 분석", summary: teacherReviewNote }
      }
    };
  }

  function saveReports(reportInput, report, metrics) {
    const current = profile();
    const selectedAge = AGE_GROUPS[state.ageKey] || AGE_GROUPS.child;
    const selectedLevel = LEVELS.find((item) => item.id === state.level) || LEVELS[2];
    const recommendationTexts = stringifyRecommendations(report.recommendations);
    const stageTitle = `${current.title} ${state.level}단계`;
    const dualModeFields = buildRehabDualModeFields({
      report,
      metrics,
      stageTitle,
      focusLabel: current.focusLabel
    });
    const payload = {
      labKind: REPORT_SCOPE,
      reportScope: REPORT_SCOPE,
      curriculumKey: `rehab-${current.sourceId}`,
      stageKey: `${current.sourceId}-lv${state.level}`,
      stageTitle,
      labTitle: current.title,
      totalQuestions: metrics.total,
      correctCount: metrics.correctCount,
      wrongCount: metrics.wrongCount,
      score: metrics.score,
      accuracyScore: metrics.accuracy,
      durationSeconds: Math.round(metrics.elapsedMs / 1000),
      startedAtMs: state.startedAtMs,
      reportType: reportInput.reportType,
      reportInput,
      briefOpinion: report.briefOpinion,
      guardianSummary: dualModeFields.guardianSummary,
      teacherReviewNote: dualModeFields.teacherReviewNote,
      actionPlanSummary: dualModeFields.actionPlanSummary,
      actionPlanPolicy: dualModeFields.actionPlanPolicy,
      reportDisplayModes: dualModeFields.reportDisplayModes,
      overview: report.overview,
      recommendations: recommendationTexts,
      cognitiveScore: metrics.score,
      reactionScore: clamp(Math.round(100 - metrics.avgReactionMs / 50), 20, 100),
      focusKey: current.focusKey,
      focusLabel: current.focusLabel,
      details: {
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_domain: current.domain,
        report_age_group_key: state.ageKey,
        report_age_group_label: selectedAge.label,
        report_age_range: selectedAge.range,
        report_level: state.level,
        report_level_label: `${state.level}단계 ${selectedLevel.title}`,
        report_difficulty_label: selectedLevel.clinicalLabel || selectedLevel.detail,
        report_norm_profile: selectedAge.normProfile,
        report_norm_profile_label: `${selectedAge.label} ${selectedAge.range} 기준`,
        report_evidence_basis: report.evidenceBasis || [],
        report_reference_links: report.referenceLinks || [],
        report_guardian_summary: dualModeFields.guardianSummary,
        report_teacher_review_note: dualModeFields.teacherReviewNote,
        report_action_plan_summary: dualModeFields.actionPlanSummary,
        report_action_plan_policy: dualModeFields.actionPlanPolicy,
        report_display_modes: dualModeFields.reportDisplayModes,
        source_legacy_id: current.sourceId,
        report_axes: report.axes,
        question_logs: state.logs
      },
      metadata: {
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_age_group_key: state.ageKey,
        report_age_group_label: selectedAge.label,
        report_age_range: selectedAge.range,
        report_level: state.level,
        report_norm_profile: selectedAge.normProfile,
        report_guardian_summary: dualModeFields.guardianSummary,
        report_teacher_review_note: dualModeFields.teacherReviewNote,
        report_action_plan_summary: dualModeFields.actionPlanSummary,
        report_action_plan_policy: dualModeFields.actionPlanPolicy,
        report_display_modes: dualModeFields.reportDisplayModes,
        source_legacy_id: current.sourceId,
        rehab_legacy_version: VERSION
      }
    };
    const harnessRecord = window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === "function"
      ? window.HahaLabLearningHarness.recordSession(payload)
      : null;
    if (!harnessRecord) saveSupabaseReport(payload, reportInput, report, metrics);
  }

  function stringifyRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) return [];
    return recommendations.map((item) => {
      if (typeof item === "string") return item;
      const title = item && item.title ? String(item.title).trim() : "";
      const desc = item && item.desc ? String(item.desc).trim() : "";
      return [title, desc].filter(Boolean).join(": ");
    }).filter(Boolean);
  }

  async function saveSupabaseReport(payload, reportInput, report, metrics) {
    const launchContext = readLaunchContext();
    if (!launchContext.teacherId || !launchContext.clientId || !window.supabase) return;
    try {
      if (!window.__rehabLegacySupabaseClient) {
        window.__rehabLegacySupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      }
      const client = window.__rehabLegacySupabaseClient;
      const completedAt = new Date().toISOString();
      const startedAt = new Date(Number(state.startedAtMs || Date.now())).toISOString();
      const durationMinutes = Math.max(1, Math.round(metrics.elapsedMs / 60000));
      const details = Object.assign({
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        lab_label: "재활랩",
        lab_title: payload.labTitle,
        game_name: payload.labTitle,
        report_title: payload.stageTitle,
        category_title: payload.labTitle,
        stage_id: payload.stageKey,
        stage_title: payload.stageTitle,
        score: payload.score,
        accuracy_score: payload.accuracyScore,
        correct_count: payload.correctCount,
        wrong_count: payload.wrongCount,
        total_questions: payload.totalQuestions,
        duration_minutes: durationMinutes,
        completed_at: completedAt,
        started_at: startedAt,
        report_type: payload.reportType,
        report_input: reportInput,
        report_integrated_score: Number(report.integratedScore || payload.score || 0),
        report_headline: String(report.headline || "").trim(),
        report_brief_opinion: payload.briefOpinion,
        report_overview: payload.overview,
        report_recommendations: payload.recommendations,
        report_axes: payload.details.report_axes,
        report_cognitive_score: payload.cognitiveScore,
        report_reaction_score: payload.reactionScore,
        report_focus_key: payload.focusKey,
        report_focus_label: payload.focusLabel,
        source_page: String(window.location.pathname || "").split("/").pop()
      }, payload.details);
      const row = {
        teacher_id: String(launchContext.teacherId || "").trim(),
        client_id: String(launchContext.clientId || "").trim(),
        client_name: String(launchContext.clientName || "").trim(),
        type: String(launchContext.clientType || "client").trim() || "client",
        category: "session_history",
        action: COMPLETION_ACTION,
        action_type: payload.labTitle,
        event_datetime: completedAt,
        start_datetime: startedAt,
        end_datetime: completedAt,
        duration: `${durationMinutes} minutes`,
        duration_minutes: durationMinutes,
        details: JSON.stringify(details),
        metadata: Object.assign({
          report_scope: REPORT_SCOPE,
          lab_scope: REPORT_SCOPE,
          report_integrated_score: details.report_integrated_score,
          report_cognitive_score: details.report_cognitive_score,
          report_reaction_score: details.report_reaction_score,
          duration_minutes: durationMinutes,
          duration: `${durationMinutes} minutes`
        }, payload.metadata),
        memo: payload.stageTitle
      };
      const result = await client.from("histories").insert(row);
      if (result && result.error) throw result.error;
    } catch (error) {
      console.error("[rehablab-legacy-cognitive] history save failed:", error);
    }
  }

  function readLaunchContext() {
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.readLaunchContext === "function") {
      return window.HahaLabLearningHarness.readLaunchContext() || {};
    }
    const params = new URLSearchParams(window.location.search);
    return {
      teacherId: params.get("teacherId") || "",
      clientId: params.get("clientId") || "",
      clientName: params.get("clientName") || "",
      clientType: params.get("clientType") || "client"
    };
  }

  function makeProfessionalOpinion(current, reportInput, stability) {
    const ageLabel = [reportInput.ageGroupLabel, reportInput.ageRangeLabel].filter(Boolean).join(" ");
    const levelLabel = [reportInput.levelLabel, reportInput.difficultyLabel].filter(Boolean).join(" / ");
    const high = reportInput.accuracyScore >= 80;
    const mid = reportInput.accuracyScore >= 60;
    const headline = high ? "해당 연령·난이도 조건에서 기능적 수행 안정성이 양호하게 관찰되었습니다." : mid ? "해당 연령·난이도 조건에서 부분 수행은 가능하나 단서와 난이도 조절이 필요합니다." : "현재 조건은 수행 부담이 높아 저부하 반복과 오류 조절이 우선됩니다.";
    const brief = `${current.domain} 과제에서 ${ageLabel || "선택 연령 기준"} ${levelLabel || "선택 난이도"} 조건으로 정확도 ${reportInput.accuracyScore}%, 평균 반응 ${reportInput.avgQuestionMs}ms, 오답 ${reportInput.wrongCount}회가 기록되었습니다. ${current.focusLabel} 관련 처리 안정성은 ${stability}점 수준이며, 단일 회기 결과이므로 병력, 관찰 소견, 표준화 평가와 함께 해석해야 합니다.`;
    const overview = high
      ? "목표 자극을 비교하고 선택하는 과정이 비교적 안정적입니다. 다음 회기에서는 동일 난이도에서 수행 재현성을 먼저 확인한 뒤 유사 자극 증가, 규칙 전환, 시간 제한을 단계적으로 적용해 일반화 수준을 관찰할 수 있습니다."
      : mid
        ? "정답 접근은 가능하지만 오류 직후 자기 수정, 반응 억제, 후반부 주의 유지에서 변동이 나타날 수 있습니다. 보기 수는 유지하되 언어적 단서와 시각적 확인 루틴을 구조화하고, 안정화 후 단서를 점차 줄이는 방식이 적절합니다."
        : "현재 조건에서는 과제 규칙 유지와 자극 변별 부담이 큽니다. 보기 수와 기억 부하를 낮추고, 예시 시행-즉각 피드백-동일 문항 재시도 순서로 성공률을 확보한 뒤 다음 단계로 확장하는 것이 우선됩니다.";
    return { headline, brief, overview };
  }

  function makeRecommendations(current, reportInput) {
    const nextLevel = reportInput.accuracyScore >= 85 && reportInput.avgQuestionMs <= Number(reportInput.benchmarkMs || 7600)
      ? "다음 회기에서 동일 과제 1회 재검 후 한 단계 상승을 고려합니다."
      : reportInput.accuracyScore >= 65
        ? "현재 단계에서 정확도 75-85%가 2회기 이상 유지되는지 확인한 뒤 상승을 결정합니다."
        : "1-2단계 낮은 조건에서 성공률을 회복한 뒤 현재 단계로 재진입합니다.";
    const base = [
      {
        title: "난이도 처방 기준",
        desc: `${nextLevel} 난이도 조정은 정확도만 보지 말고 평균 반응시간, 오답 반복, 피로 후반부 저하 여부를 함께 기준으로 삼습니다.`
      },
      {
        title: `${current.focusLabel} 임상 관찰`,
        desc: `${current.focusLabel} 수행 중 반응 전 멈춤, 단서 재확인, 오류 후 재진입 양상을 기록하고 다음 회기에서 같은 조건으로 재현성을 비교합니다.`
      },
      {
        title: "일반화 훈련 연결",
        desc: "화면 과제에서 사용한 전략을 실제 책상 활동, 물건 찾기, 순서 말하기, 일상 과제 수행 전 확인 루틴으로 연결해 기능적 전이를 관찰합니다."
      }
    ];
    if (reportInput.accuracyScore >= 80) {
      base.push({
        title: "난이도 확장",
        desc: "수행이 안정적이면 시간 제한 또는 유사 보기를 추가하되, 오류가 증가하면 즉시 이전 조건으로 낮춰 성공률과 자기점검 루틴을 회복합니다."
      });
    }
    return base.slice(0, 3);
  }

  function helpMethod(current) {
    return `${current.title}은 먼저 연령 기준과 난이도 단계를 선택한 뒤 진행합니다. 문제 화면에서는 목표 자극, 보기, 빈칸, 순서 단서를 천천히 확인하고 버튼 선택 또는 드래그 방식으로 반응합니다.\n\n수행 중에는 빠르게 누르는 것보다 기준을 다시 확인한 뒤 반응하는 흐름이 중요합니다. 정답과 오답 피드백을 받은 뒤에는 같은 전략을 다음 문항에 적용하면서 주의 유지, 오류 수정, 자기점검 루틴을 반복합니다.`;
  }

  function helpEffect(current) {
    return `${current.domain} 영역의 회기 내 수행을 관찰하기 위한 재활 과제입니다. 정확도만 보지 않고 평균 반응시간, 오류 반복, 오답 후 회복, 후반부 피로도, 단서 의존도를 함께 기록해 내담자의 수행 안정성과 난이도 적합성을 확인할 수 있습니다.\n\n재활 환경에서는 주의 지속, 작업기억, 시지각 처리, 언어적 추론, 실행기능 중 어떤 축이 강점 또는 보완 영역인지 설명하는 자료로 활용할 수 있습니다. 병원이나 센터에서는 표준화 검사를 대체하기보다, 치료 회기 사이의 변화와 가정 연계 과제 방향을 정하는 보조 관찰 자료로 사용하는 것이 적절합니다.`;
  }

  function imageGrid(items) {
    return `<div class="legacy-stimulus-row">${items.map((item) => `
      <div class="legacy-image-card">${item.hidden ? "?" : `<img src="${item.src}" alt="${escapeHtml(item.label)}">`}</div>
    `).join("")}</div>`;
  }

  function tileRow(items) {
    return `<div class="legacy-stimulus-row">${items.map((item) => `<div class="legacy-tile">${typeof item === "string" ? escapeHtml(item) : item}</div>`).join("")}</div>`;
  }

  function shapeHtml(item) {
    return `<span class="legacy-shape ${item.shape}" style="--shape-color:${item.color}"></span>`;
  }

  function towerHtml(disks) {
    const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"];
    return `<div class="legacy-tower">
      <div class="legacy-peg">${Array.from({ length: disks }, (_, index) => {
        const size = disks - index;
        return `<span class="legacy-disk" style="width:${45 + size * 18}%;background:${colors[index % colors.length]}"></span>`;
      }).join("")}</div>
      <div class="legacy-peg"></div>
      <div class="legacy-peg"></div>
    </div>`;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
