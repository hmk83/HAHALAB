(function () {
  'use strict';

  const DATA = window.HAHA_LAB_SITUATION_TALK || {};
  const SITUATIONS = Array.isArray(DATA.situations) ? DATA.situations : [];
  const CATEGORIES = Array.isArray(DATA.categories) ? DATA.categories : [];
  const LAB_TITLE = DATA.title || '그림 보고 이야기해요';
  const CURRICULUM_KEY = DATA.curriculumKey || 'cardlab-situation-talk';
  const TIP_TEXTS = [
    '아동의 말을 그대로 인정한 뒤 한두 낱말을 덧붙여 되말해 주세요.',
    '대답을 재촉하지 말고 5초 이상 기다린 뒤 그림 단서를 함께 살펴보세요.',
    '“그림에서 무엇을 보고 그렇게 생각했어?”라고 근거를 말하도록 도와주세요.',
    '어려워하면 누가·어디서·무엇을 질문부터 다시 시작해 주세요.',
    '다른 생각도 가능하다고 알려 주고 아동의 표현을 자연스럽게 확장해 주세요.',
    '“모르겠어요”라고 말해도 괜찮습니다. 필요한 단어를 짧게 모델링해 주세요.'
  ];

  const els = {
    introView: document.getElementById('introView'),
    listView: document.getElementById('listView'),
    detailView: document.getElementById('detailView'),
    completeView: document.getElementById('completeView'),
    brandButton: document.getElementById('brandButton'),
    headerStatus: document.getElementById('headerStatus'),
    listButton: document.getElementById('listButton'),
    helpButton: document.getElementById('helpButton'),
    helpModal: document.getElementById('helpModal'),
    helpCloseButton: document.getElementById('helpCloseButton'),
    helpConfirmButton: document.getElementById('helpConfirmButton'),
    startButton: document.getElementById('startButton'),
    categoryTabs: document.getElementById('categoryTabs'),
    situationGrid: document.getElementById('situationGrid'),
    situationImage: document.getElementById('situationImage'),
    situationCategory: document.getElementById('situationCategory'),
    situationNumber: document.getElementById('situationNumber'),
    situationTitle: document.getElementById('situationTitle'),
    situationStory: document.getElementById('situationStory'),
    questionProgress: document.getElementById('questionProgress'),
    questionText: document.getElementById('questionText'),
    facilitatorTip: document.getElementById('facilitatorTip'),
    previousQuestionButton: document.getElementById('previousQuestionButton'),
    nextQuestionButton: document.getElementById('nextQuestionButton'),
    completeImage: document.getElementById('completeImage'),
    completeCategory: document.getElementById('completeCategory'),
    completeTitle: document.getElementById('completeTitle'),
    completeStory: document.getElementById('completeStory'),
    completeOverview: document.getElementById('completeOverview'),
    completeLesson: document.getElementById('completeLesson'),
    chooseAnotherButton: document.getElementById('chooseAnotherButton'),
    nextSituationButton: document.getElementById('nextSituationButton')
  };

  if (!SITUATIONS.length || !els.situationGrid) return;

  const state = {
    view: 'intro',
    category: 'all',
    situation: null,
    situationIndex: -1,
    questionIndex: 0,
    startedAtMs: 0,
    questionStartedAtMs: 0,
    elapsedByQuestion: [],
    confirmedPromptIds: [],
    completedIds: new Set(),
    transitionLocked: false,
    savedSessionId: ''
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function categoryLabel(id) {
    return CATEGORIES.find((category) => category.id === id)?.label || '일상';
  }

  function situationSummary(story) {
    const text = String(story || '').trim();
    const firstSentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
    return firstSentence || text;
  }

  function showView(name) {
    state.view = name;
    ['intro', 'list', 'detail', 'complete'].forEach((key) => {
      els[`${key}View`]?.classList.toggle('is-active', key === name);
    });
    const inSession = name === 'detail' || name === 'complete';
    els.listButton?.classList.toggle('is-hidden', !inSession);
    if (els.headerStatus) {
      els.headerStatus.textContent = name === 'detail' && state.situation
        ? state.situation.title
        : name === 'list' ? `상황 ${SITUATIONS.length}개` : '상황 이야기 카드';
    }
    document.title = name === 'detail' && state.situation ? `${LAB_TITLE} · ${state.situation.title}` : LAB_TITLE;
  }

  function renderCategories() {
    els.categoryTabs.innerHTML = CATEGORIES.map((category) => (
      `<button type="button" class="talk-category-button${state.category === category.id ? ' is-active' : ''}" data-category="${escapeHtml(category.id)}" aria-pressed="${state.category === category.id ? 'true' : 'false'}">${escapeHtml(category.label)}</button>`
    )).join('');
    els.categoryTabs.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        state.category = button.getAttribute('data-category') || 'all';
        renderCategories();
        renderSituationGrid();
      });
    });
  }

  function renderSituationGrid() {
    const filtered = state.category === 'all'
      ? SITUATIONS
      : SITUATIONS.filter((situation) => situation.category === state.category);
    els.situationGrid.innerHTML = filtered.map((situation) => (
      `<button type="button" class="talk-situation-button${state.completedIds.has(situation.id) ? ' is-complete' : ''}" data-situation-id="${escapeHtml(situation.id)}">`
      + `<span class="talk-situation-thumb"><img src="${escapeHtml(situation.image)}" alt="" loading="lazy" decoding="async"></span>`
      + `<span class="talk-situation-copy"><span class="talk-situation-meta">${String(situation.number).padStart(2, '0')} · ${escapeHtml(categoryLabel(situation.category))}</span><strong>${escapeHtml(situation.title)}</strong><span class="talk-situation-summary">${escapeHtml(situationSummary(situation.story))}</span></span>`
      + '</button>'
    )).join('');
    els.situationGrid.querySelectorAll('[data-situation-id]').forEach((button) => {
      button.addEventListener('click', () => openSituation(button.getAttribute('data-situation-id') || ''));
    });
  }

  function openList() {
    renderCategories();
    renderSituationGrid();
    showView('list');
    requestAnimationFrame(() => els.categoryTabs?.querySelector('.is-active')?.focus({ preventScroll: true }));
  }

  function openSituation(id) {
    const index = SITUATIONS.findIndex((situation) => situation.id === id);
    if (index < 0) return;
    state.situationIndex = index;
    state.situation = SITUATIONS[index];
    state.questionIndex = 0;
    state.startedAtMs = Date.now();
    state.questionStartedAtMs = Date.now();
    state.elapsedByQuestion = new Array(state.situation.questions.length).fill(0);
    state.confirmedPromptIds = [];
    state.savedSessionId = '';
    renderSituation();
    renderQuestion(false);
    showView('detail');
    requestAnimationFrame(() => els.situationTitle?.focus({ preventScroll: true }));
  }

  function renderSituation() {
    const situation = state.situation;
    if (!situation) return;
    els.situationImage.src = situation.image;
    els.situationImage.alt = situation.alt;
    els.situationImage.onerror = () => {
      els.situationImage.removeAttribute('src');
      els.situationImage.alt = `${situation.alt}. 이미지를 불러오지 못했습니다.`;
      els.situationImage.closest('.talk-detail-media')?.classList.add('is-image-error');
    };
    els.situationCategory.textContent = categoryLabel(situation.category);
    els.situationNumber.textContent = `SITUATION ${String(situation.number).padStart(2, '0')}`;
    els.situationTitle.textContent = situation.title;
    els.situationStory.textContent = situation.story;
  }

  function recordQuestionElapsed() {
    if (!state.situation || !state.questionStartedAtMs) return;
    const elapsed = Math.max(0, Date.now() - state.questionStartedAtMs);
    state.elapsedByQuestion[state.questionIndex] = Number(state.elapsedByQuestion[state.questionIndex] || 0) + elapsed;
    state.questionStartedAtMs = Date.now();
  }

  function markCurrentPromptConfirmed() {
    const prompt = state.situation?.questions?.[state.questionIndex];
    if (prompt && !state.confirmedPromptIds.includes(prompt.id)) state.confirmedPromptIds.push(prompt.id);
  }

  function renderQuestion(moveFocus = true) {
    const situation = state.situation;
    const question = situation?.questions?.[state.questionIndex];
    if (!question) return;
    els.questionText.textContent = question.text;
    els.questionProgress.textContent = `${state.questionIndex + 1} / ${situation.questions.length}`;
    els.facilitatorTip.textContent = TIP_TEXTS[state.questionIndex % TIP_TEXTS.length];
    els.previousQuestionButton.disabled = state.questionIndex === 0;
    const isLast = state.questionIndex === situation.questions.length - 1;
    els.nextQuestionButton.textContent = isLast ? '✓' : '→';
    els.nextQuestionButton.setAttribute('aria-label', isLast ? '이야기 마치기' : '다음 질문');
    if (moveFocus) requestAnimationFrame(() => els.questionText?.focus({ preventScroll: true }));
  }

  function withTransitionLock(callback) {
    if (state.transitionLocked) return;
    state.transitionLocked = true;
    callback();
    window.setTimeout(() => { state.transitionLocked = false; }, 220);
  }

  function goPreviousQuestion() {
    withTransitionLock(() => {
      if (!state.situation || state.questionIndex <= 0) return;
      recordQuestionElapsed();
      state.questionIndex -= 1;
      state.questionStartedAtMs = Date.now();
      renderQuestion();
    });
  }

  function goNextQuestion() {
    withTransitionLock(() => {
      const situation = state.situation;
      if (!situation) return;
      recordQuestionElapsed();
      markCurrentPromptConfirmed();
      if (state.questionIndex >= situation.questions.length - 1) {
        completeSituation();
        return;
      }
      state.questionIndex += 1;
      state.questionStartedAtMs = Date.now();
      renderQuestion();
    });
  }

  function completeSituation() {
    const situation = state.situation;
    if (!situation) return;
    state.completedIds.add(situation.id);
    els.completeImage.src = situation.image;
    els.completeImage.alt = situation.alt;
    els.completeCategory.textContent = categoryLabel(situation.category);
    els.completeTitle.textContent = situation.title;
    els.completeStory.textContent = situation.story;
    els.completeOverview.textContent = situation.learningOverview || situation.story;
    els.completeLesson.textContent = situation.learningPoint || '그림 속 상황을 다시 살펴보고 안전하고 배려하는 행동을 함께 이야기해 보세요.';
    persistConversation();
    showView('complete');
    requestAnimationFrame(() => document.getElementById('completeTitle')?.focus({ preventScroll: true }));
  }

  function persistConversation() {
    const situation = state.situation;
    if (!situation || state.savedSessionId || !window.HahaLabLearningHarness?.recordSession) return;
    const durationSeconds = Math.max(1, Math.round((Date.now() - state.startedAtMs) / 1000));
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'cardlab',
      reportScope: 'cardlab',
      saveToClientReport: true,
      curriculumKey: CURRICULUM_KEY,
      stageKey: situation.id,
      stageTitle: situation.title,
      labTitle: LAB_TITLE,
      title: situation.title,
      focusKey: 'situational-narrative',
      focusLabel: '상황 이해·이야기 구성',
      assessmentMode: 'facilitated-discussion',
      scored: false,
      skipCardlabAttempt: true,
      totalQuestions: situation.questions.length,
      correctCount: 0,
      wrongCount: 0,
      startedAtMs: state.startedAtMs,
      durationSeconds,
      summary: `일상 상황 그림을 보며 ${state.confirmedPromptIds.length}개의 질문을 차례로 확인하고 이야기하는 활동에 참여했습니다.`,
      overview: '정답을 채점하지 않는 촉진 대화 활동으로, 사실 확인에서 원인·감정·해결·자기 경험 연결까지 질문을 한 번에 하나씩 제시합니다.',
      guardianSummary: `“${situation.title}” 상황에서 ${state.confirmedPromptIds.length}개의 질문을 함께 살펴보았습니다. 질문 확인 수는 말하기 능력 점수가 아니며, 아동이 사용한 표현은 대화 상대가 직접 관찰해 주세요.`,
      teacherReviewNote: '인물·장소·사건 언급, 시간 순서어 사용, 원인·감정·해결 설명은 담당자의 직접 관찰이 필요합니다. 화면 체류시간이나 질문 확인 수만으로 이해도·발화 수준을 판단하지 않습니다.',
      actionPlanSummary: '아동의 반응을 인정하고 한두 낱말을 확장해 되말한 뒤 충분히 기다립니다. 어려워하면 그림의 인물·장소·행동을 지칭하는 구체 질문으로 낮춥니다.',
      recommendations: [
        '아동의 말을 반복하고 한두 낱말만 확장해 자연스러운 문장 모델을 들려주세요.',
        '“왜?” 질문만 이어 가지 말고 사실 확인, 그림 근거, 감정, 해결 질문을 균형 있게 사용해 주세요.'
      ],
      details: {
        report_type: 'cardlab-situation-talk',
        assessment_mode: 'facilitated-discussion',
        scored: false,
        metric_semantics: 'conversation_progress',
        score_interpretation: 'not-applicable',
        situation_id: situation.id,
        situation_title: situation.title,
        category: situation.category,
        questions_presented: situation.questions.length,
        questions_confirmed: state.confirmedPromptIds.length,
        prompt_ids: state.confirmedPromptIds.slice(),
        elapsed_by_question_ms: state.elapsedByQuestion.slice(),
        completion_reason: 'all-prompts-viewed',
        clinical_limit: '질문 확인 수와 체류시간은 발화 정확도, 이해 수준, 발달연령을 의미하지 않습니다.'
      }
    });
    state.savedSessionId = record?.id || `${situation.id}-${Date.now()}`;
  }

  function openNextSituation() {
    const nextIndex = (state.situationIndex + 1) % SITUATIONS.length;
    openSituation(SITUATIONS[nextIndex].id);
  }

  function openHelp() {
    els.helpModal?.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => els.helpCloseButton?.focus(), 0);
  }

  function closeHelp() {
    els.helpModal?.setAttribute('aria-hidden', 'true');
    els.helpButton?.focus();
  }

  els.startButton?.addEventListener('click', openList);
  els.brandButton?.addEventListener('click', openList);
  els.listButton?.addEventListener('click', openList);
  els.previousQuestionButton?.addEventListener('click', goPreviousQuestion);
  els.nextQuestionButton?.addEventListener('click', goNextQuestion);
  els.chooseAnotherButton?.addEventListener('click', openList);
  els.nextSituationButton?.addEventListener('click', openNextSituation);
  els.helpButton?.addEventListener('click', openHelp);
  els.helpCloseButton?.addEventListener('click', closeHelp);
  els.helpConfirmButton?.addEventListener('click', closeHelp);
  els.helpModal?.addEventListener('click', (event) => {
    if (event.target?.hasAttribute('data-help-close')) closeHelp();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && els.helpModal?.getAttribute('aria-hidden') === 'false') closeHelp();
    if (state.view === 'detail' && event.key === 'ArrowRight') goNextQuestion();
    if (state.view === 'detail' && event.key === 'ArrowLeft') goPreviousQuestion();
  });

  showView('intro');

  window.CardlabSituationTalk = {
    data: DATA,
    state,
    openSituation,
    goNextQuestion,
    goPreviousQuestion,
    openList
  };
})();
