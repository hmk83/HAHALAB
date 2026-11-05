(function () {
  'use strict';

  const config = window.REHABLAB_LANGUAGE_CARD_CONFIG || {};
  const LAB_TITLE = String(config.title || '재활랩 언어 훈련').trim();
  const REPORT_SCOPE = String(config.reportScope || 'rehab').trim() || 'rehab';
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const LAB_LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
  const REHAB_AGE_GROUPS = [
    { id: 'preschool', label: '유아', range: '4-6세', normProfile: 'preschool', questionCount: 6, accent: '#14b8a6', clinical: '짧은 문장과 친숙한 생활 장면을 중심으로 의미 연결과 기초 추론을 확인합니다.' },
    { id: 'elementary', label: '초등', range: '7-12세', normProfile: 'lower-elementary', questionCount: 8, accent: '#3b82f6', clinical: '카드 단서와 언어 규칙을 연결하며 설명 문장과 선택 근거를 안정화합니다.' },
    { id: 'teen', label: '청소년', range: '13-18세', normProfile: 'upper-elementary', questionCount: 10, accent: '#8b5cf6', clinical: '추론과 자기 점검을 함께 요구하며 화용적·의미적 간섭 조절을 관찰합니다.' },
    { id: 'adult', label: '성인', range: '19-64세', normProfile: 'adult', questionCount: 10, accent: '#f97316', clinical: '정확도와 반응시간을 함께 보며 언어 추론, 의미망 활성화, 자기 설명을 평가합니다.' },
    { id: 'senior', label: '고령자', range: '65세+', normProfile: 'senior', questionCount: 8, accent: '#64748b', clinical: '성공 경험을 우선 확보하면서 어휘 회상과 상황 이해의 유지 여부를 고령자 재활 기준으로 관찰합니다.' }
  ];
  const REHAB_LEVELS = [
    { id: 'lv1', index: 1, label: '기초 이해', desc: '친숙한 장면과 핵심 단서를 보고 기본 의미를 찾습니다.', stageStart: 0, stageCount: 2 },
    { id: 'lv2', index: 2, label: '원인 연결', desc: '왜 그런지, 무엇 때문에 그런지 인과를 연결합니다.', stageStart: 2, stageCount: 2 },
    { id: 'lv3', index: 3, label: '상황 추론', desc: '다음 행동이나 적절한 반응을 고르는 표준 단계입니다.', stageStart: 4, stageCount: 2 },
    { id: 'lv4', index: 4, label: '사회적 언어', desc: '적절한 말하기와 관점 이해를 함께 요구합니다.', stageStart: 6, stageCount: 2 },
    { id: 'lv5', index: 5, label: '고차 추론', desc: '핵심 단서를 선별하고 방해 단서를 억제합니다.', stageStart: 8, stageCount: 2 },
    { id: 'lv6', index: 6, label: '임상 심화', desc: '이유 설명과 자기 설명까지 포함해 종합적으로 관찰합니다.', stageStart: 10, stageCount: 2 }
  ];

  const state = {
    stage: null,
    selectedAgeId: '',
    selectedLevelId: '',
    trialIndex: 0,
    startedAt: 0,
    sessionId: '',
    selected: new Set(),
    cueLevel: 0,
    trialLocked: false,
    logs: [],
    savedRunId: '',
    supabaseClientPromise: null
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    stageView: $('stageView'),
    gameView: $('gameView'),
    resultView: $('resultView'),
    professionalReport: $('professionalReport'),
    levelGrid: $('levelGrid'),
    startButton: $('startButton'),
    progressChip: $('progressChip'),
    scoreChip: $('scoreChip'),
    gameTitle: $('gameTitle'),
    gamePrompt: $('gamePrompt'),
    cardStack: $('cardStack'),
    clinicalTags: $('clinicalTags'),
    taskTitle: $('taskTitle'),
    taskCopy: $('taskCopy'),
    promptBox: $('promptBox'),
    choiceGrid: $('choiceGrid'),
    actionRow: $('actionRow'),
    feedback: $('feedback'),
    resultTitle: $('resultTitle'),
    resultSummary: $('resultSummary'),
    resultStats: $('resultStats'),
    resultReport: $('resultReport'),
    retryButton: $('retryButton'),
    stageButton: $('stageButton'),
    helpButton: $('helpButton')
  };

  function normalizeStages() {
    const stages = Array.isArray(config.stages) ? config.stages.slice(0, 12) : [];
    return stages.map((stage, index) => ({
      ...stage,
      stage: index + 1,
      title: stage.title || `${index + 1}단계`,
      tasks: buildTaskPool(Array.isArray(stage.tasks) ? stage.tasks : [], index),
      baseTaskCount: Array.isArray(stage.tasks) ? stage.tasks.length : 0
    }));
  }

  const baseStages = normalizeStages();

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const next = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[next]] = [copy[next], copy[index]];
    }
    return copy;
  }

  function uniqueByLabel(items) {
    const seen = new Set();
    return items.filter((item) => {
      const label = String(item?.label || '').trim();
      if (!label || seen.has(label)) return false;
      seen.add(label);
      return true;
    });
  }

  function candidateAnswer(task) {
    return String(task.answer || task.cards?.[0]?.name || task.title || '').trim();
  }

  function collectDistractors(baseTasks, answer) {
    return baseTasks
      .map(candidateAnswer)
      .filter((label) => label && label !== answer)
      .map((label) => ({ label }));
  }

  function autoChoiceTask(task, baseTasks, variantIndex) {
    if (Array.isArray(task.choices) && task.choices.length > 0) return task;
    const answer = candidateAnswer(task);
    const distractors = shuffle(collectDistractors(baseTasks, answer)).slice(0, 3);
    const choices = uniqueByLabel([{ label: answer }, ...distractors]);
    const promptSeeds = Array.isArray(task.cues) && task.cues.length
      ? task.cues.filter(Boolean)
      : [task.prompt || `${answer} 카드를 고르세요.`];
    const seed = String(promptSeeds[variantIndex % promptSeeds.length] || task.prompt || '').trim();
    const prompt = seed.includes(answer)
      ? `${seed} 알맞은 답을 고르세요.`
      : `${seed} 알맞은 이름을 고르세요.`;
    return {
      ...task,
      prompt,
      questionWord: answer,
      correct: [0],
      choices
    };
  }

  function variantPrompt(task, variantIndex) {
    const prompts = Array.isArray(config.promptVariants) ? config.promptVariants : [];
    const answer = candidateAnswer(task);
    const fallback = String(task.prompt || '').trim();
    if (!prompts.length || !answer) return fallback;
    return prompts[variantIndex % prompts.length]
      .replaceAll('{word}', answer)
      .replaceAll('{prompt}', fallback);
  }

  function rotateCorrectChoice(task) {
    const choices = Array.isArray(task.choices) ? task.choices : [];
    const correct = Array.isArray(task.correct) ? task.correct : [];
    if (!choices.length || !correct.length) return task;
    const mixed = shuffle(choices.map((choice, index) => ({ choice, correct: correct.includes(index) })));
    return {
      ...task,
      choices: mixed.map((item) => item.choice),
      correct: mixed.reduce((indexes, item, index) => item.correct ? indexes.concat(index) : indexes, [])
    };
  }

  function buildTaskPool(baseTasks, stageIndex) {
    const multiplier = Math.max(1, Number(config.questionPoolMultiplier || 1));
    const pool = [];
    for (let round = 0; round < multiplier; round += 1) {
      const roundTasks = shuffle(baseTasks).map((task, taskIndex) => {
        const variantIndex = round + taskIndex + stageIndex;
        const choiceReady = config.cardlabAutoChoices ? autoChoiceTask(task, baseTasks, variantIndex) : task;
        const withPrompt = {
          ...choiceReady,
          id: `${choiceReady.id || `s${stageIndex + 1}-${taskIndex + 1}`}-v${round + 1}`,
          prompt: variantPrompt(choiceReady, variantIndex) || choiceReady.prompt,
          poolSourceId: choiceReady.id
        };
        return rotateCorrectChoice(withPrompt);
      });
      pool.push(...roundTasks);
    }
    return pool;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;'
    }[char]));
  }

  function getSelectedAge() {
    return REHAB_AGE_GROUPS.find((item) => item.id === state.selectedAgeId) || null;
  }

  function getSelectedLevel() {
    return REHAB_LEVELS.find((item) => item.id === state.selectedLevelId) || null;
  }

  function buildStageFromSelection() {
    const age = getSelectedAge();
    const level = getSelectedLevel();
    if (!age || !level) return null;
    const slices = baseStages.slice(level.stageStart, level.stageStart + level.stageCount);
    const taskPool = shuffle(slices.flatMap((stage) => Array.isArray(stage.tasks) ? stage.tasks : [])).slice(0, age.questionCount);
    if (!taskPool.length) return null;
    return {
      id: `${config.id}-${age.id}-${level.id}`,
      age,
      level,
      stage: level.index,
      title: `${age.label} · ${level.label}`,
      difficulty: level.label,
      goal: level.desc,
      sourceStages: slices.map((item) => item.stage),
      tasks: taskPool
    };
  }

  function setScreen(name) {
    els.stageView?.classList.toggle('is-active', name === 'stage');
    els.gameView?.classList.toggle('is-active', name === 'game');
    els.resultView?.classList.toggle('is-active', name === 'result');
  }

  function cardImage(card) {
    const src = String(card?.src || '').trim();
    if (/^https?:\/\//.test(src) || src.startsWith('/')) return src;
    return `/playlab/${src.replace(/^\/+/, '')}`;
  }

  function renderLevelGrid() {
    const age = getSelectedAge();
    els.levelGrid.innerHTML = REHAB_LEVELS.map((level) => {
      const selected = state.selectedLevelId === level.id;
      return `
        <button type="button" class="traffic-level-card${selected ? ' is-selected' : ''}" data-level-id="${level.id}" aria-pressed="${selected ? 'true' : 'false'}"${age ? '' : ' disabled'}>
          <span>LV${level.index}</span>
          <h2>${escapeHtml(level.label)}</h2>
          <p>${escapeHtml(level.desc)}</p>
        </button>
      `;
    }).join('');
    const level = getSelectedLevel();
    document.querySelectorAll('[data-age]').forEach((button) => {
      button.classList.toggle('is-selected', button.getAttribute('data-age') === state.selectedAgeId);
    });
    els.startButton.disabled = !age || !level;
    els.startButton.textContent = age && level
      ? `${age.label} · ${level.label} 시작`
      : '연령과 레벨을 선택해 주세요';
  }

  function renderCards(cards) {
    const safeCards = Array.isArray(cards) ? cards : [];
    if (!els.cardStack) return;
    els.cardStack.style.setProperty('--card-count', String(Math.max(1, safeCards.length)));
    els.cardStack.innerHTML = safeCards.map((card) => `
      <article class="language-picture-card">
        <div class="language-picture-frame">
          <img src="${cardImage(card)}" alt="${String(card.name || '카드').replace(/"/g, '&quot;')}">
        </div>
        ${config.hideCardNames ? '' : `<strong>${String(card.name || '').trim()}</strong>`}
      </article>
    `).join('');
  }

  function renderTags(task) {
    if (!els.clinicalTags) return;
    if (config.hideClinicalTags) {
      els.clinicalTags.innerHTML = '';
      els.clinicalTags.hidden = true;
      return;
    }
    els.clinicalTags.hidden = false;
    const tags = [
      config.focusLabel,
      state.stage?.level?.label,
      ...(Array.isArray(task?.targets) ? task.targets : [])
    ].filter(Boolean);
    els.clinicalTags.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join('');
  }

  function renderPrompt(task) {
    if (!els.promptBox) return;
    const prompt = String(task.prompt || '');
    const word = String(task.questionWord || task.cards?.[0]?.name || '').trim();
    const color = String(task.questionWordColor || config.questionWordColor || '').trim();
    if (!word || !color || !prompt.includes(word)) {
      els.promptBox.textContent = prompt;
      return;
    }
    els.promptBox.innerHTML = escapeHtml(prompt).replace(
      escapeHtml(word),
      `<span class="language-question-word" style="--question-word-color:${escapeHtml(color)}">${escapeHtml(word)}</span>`
    );
  }

  function getCurrentTask() {
    return state.stage?.tasks?.[state.trialIndex] || null;
  }

  function renderChoiceTask(task) {
    const choices = Array.isArray(task.choices) ? task.choices : [];
    if (els.choiceGrid) {
      els.choiceGrid.innerHTML = choices.map((choice, index) => `
        <button type="button" class="language-choice" data-choice-index="${index}">${choice.label}</button>
      `).join('');
      els.choiceGrid.querySelectorAll('[data-choice-index]').forEach((button) => {
        button.addEventListener('click', () => {
          if (config.instantChoiceFeedback) {
            chooseInstantAnswer(task, Number(button.dataset.choiceIndex || 0), button);
            return;
          }
          if (config.mode === 'multi-feature') {
            const index = Number(button.dataset.choiceIndex || 0);
            if (state.selected.has(index)) state.selected.delete(index);
            else state.selected.add(index);
            button.classList.toggle('is-selected', state.selected.has(index));
          } else {
            state.selected = new Set([Number(button.dataset.choiceIndex || 0)]);
            els.choiceGrid.querySelectorAll('.language-choice').forEach((node) => node.classList.remove('is-selected'));
            button.classList.add('is-selected');
          }
        });
      });
    }
    if (els.actionRow) {
      els.actionRow.hidden = Boolean(config.instantChoiceFeedback);
      els.actionRow.innerHTML = config.instantChoiceFeedback ? '' : `
        <button type="button" class="language-main-btn" data-action="submit">반응 기록</button>
        <button type="button" class="language-secondary-btn" data-action="support">도움 후 성공</button>
        <button type="button" class="language-secondary-btn" data-action="skip">다음 카드</button>
      `;
      if (!config.instantChoiceFeedback) bindActions(task);
    }
  }

  function chooseInstantAnswer(task, choiceIndex, button) {
    if (button.disabled || state.trialLocked) return;
    const correct = Array.isArray(task.correct) ? task.correct : [];
    let selected = [choiceIndex];
    if (config.mode === 'multi-feature' && correct.length > 1) {
      if (state.selected.has(choiceIndex)) state.selected.delete(choiceIndex);
      else state.selected.add(choiceIndex);
      els.choiceGrid?.querySelectorAll('.language-choice').forEach((node) => {
        node.classList.toggle('is-selected', state.selected.has(Number(node.getAttribute('data-choice-index'))));
      });
      if (state.selected.size < correct.length) {
        if (els.feedback) els.feedback.textContent = `의미 단서 ${correct.length}개를 선택해 주세요.`;
        return;
      }
      selected = [...state.selected];
    }
    const expected = correct.slice().sort((a, b) => a - b);
    const isCorrect = JSON.stringify(selected.slice().sort((a, b) => a - b)) === JSON.stringify(expected);
    state.trialLocked = true;
    els.choiceGrid?.querySelectorAll('.language-choice').forEach((node) => {
      node.disabled = true;
      const index = Number(node.getAttribute('data-choice-index') || -1);
      node.classList.toggle('is-correct', correct.includes(index));
    });
    button.classList.add(isCorrect ? 'is-selected' : 'is-wrong');
    state.logs.push({
      trialId: task.id || `${state.stage.stage}-${state.trialIndex + 1}`,
      title: task.title || '',
      targets: task.targets || [],
      action: isCorrect ? 'instant-correct' : 'instant-wrong',
      score: isCorrect ? 2 : 0,
      cueLevel: 0,
      selected,
      durationMs: 0,
      completedAtMs: Date.now()
    });
    if (els.feedback) els.feedback.textContent = isCorrect ? '정답입니다.' : '오답입니다. 정답 단서를 확인하고 다음 카드로 이동합니다.';
    state.trialIndex += 1;
    window.setTimeout(renderTrial, isCorrect ? 620 : 900);
  }

  function bindActions(task) {
    els.actionRow.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => recordResponse(task, button.dataset.action));
    });
  }

  function recordResponse(task, action) {
    if (state.trialLocked) return;
    state.trialLocked = true;
    els.actionRow?.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    els.choiceGrid?.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    let score = 0;
    let label = '다음 반응으로 이동합니다.';
    if (action === 'support') {
      score = 1;
      label = '도움 후 성공으로 기록했습니다.';
    } else if (action === 'submit') {
      const correct = Array.isArray(task.correct) ? task.correct : [];
      const selected = [...state.selected].sort((a, b) => a - b);
      const expected = correct.slice().sort((a, b) => a - b);
      score = selected.length > 0 && JSON.stringify(selected) === JSON.stringify(expected) ? 2 : 0;
      label = score ? '목표 반응으로 기록했습니다.' : '오반응으로 기록했습니다. 치료사 단서를 제공해 주세요.';
    }
    state.logs.push({
      trialId: task.id || `${state.stage.stage}-${state.trialIndex + 1}`,
      title: task.title || '',
      targets: task.targets || [],
      action,
      score,
      cueLevel: state.cueLevel,
      selected: [...state.selected],
      durationMs: 0,
      completedAtMs: Date.now()
    });
    if (els.feedback) els.feedback.textContent = label;
    state.trialIndex += 1;
    window.setTimeout(renderTrial, 520);
  }

  function renderTrial() {
    const task = getCurrentTask();
    if (!state.stage || !task) {
      finishStage();
      return;
    }
    state.selected = new Set();
    state.cueLevel = 0;
    state.trialLocked = false;
    const total = state.stage.tasks.length || 1;
    const correctCount = state.logs.filter((log) => log.score > 0).length;
    if (els.progressChip) els.progressChip.textContent = `${state.stage.level.label} · ${state.trialIndex + 1} / ${total}`;
    if (els.scoreChip) els.scoreChip.textContent = `정답 ${correctCount}`;
    if (els.gameTitle) els.gameTitle.textContent = config.cardlabStageCompact ? `${state.stage.age.label} · ${state.stage.level.label}` : state.stage.title;
    if (els.gamePrompt) els.gamePrompt.textContent = state.stage.goal || config.stageInstruction || '';
    if (els.taskTitle) {
      els.taskTitle.hidden = Boolean(config.hideTaskTitle);
      els.taskTitle.textContent = config.hideTaskTitle ? '' : (task.title || state.stage.title);
    }
    if (els.taskCopy) {
      els.taskCopy.hidden = Boolean(config.hideTaskCopy);
      els.taskCopy.textContent = config.hideTaskCopy ? '' : (task.clinicalReason || config.clinicalTargets || '');
    }
    renderPrompt(task);
    if (els.feedback) els.feedback.textContent = '';
    renderCards(task.cards);
    renderTags(task);
    renderChoiceTask(task);
  }

  function parseMaybeJson(value, fallback) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function readLaunchContext() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const launchKey = String(params.get('labLaunchKey') || '').trim();
      if (launchKey && launchKey.indexOf(LAB_LAUNCH_CONTEXT_STORAGE_PREFIX) === 0 && window.sessionStorage) {
        const parsed = window.HahaLabLearningHarness?.readLaunchContext?.() || parseMaybeJson(window.sessionStorage.getItem(launchKey), null);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      const teacherId = String(params.get('teacherId') || '').trim();
      const clientId = String(params.get('clientId') || '').trim();
      if (teacherId && clientId) {
        return {
          teacherId,
          teacherName: String(params.get('teacherName') || '').trim(),
          clientId,
          clientName: String(params.get('clientName') || '').trim(),
          clientType: String(params.get('clientType') || 'client').trim() || 'client'
        };
      }
    } catch (_error) {}
    return null;
  }

  function getSupabaseClient() {
    if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
    if (state.supabaseClientPromise) return state.supabaseClientPromise;
    state.supabaseClientPromise = Promise.resolve().then(() => {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }).catch(() => null);
    return state.supabaseClientPromise;
  }

  function buildPayload() {
    const totalQuestions = Math.max(1, state.logs.length);
    const independent = state.logs.filter((log) => log.score === 2).length;
    const supported = state.logs.filter((log) => log.score === 1).length;
    const score = Math.round(((independent * 2 + supported) / (totalQuestions * 2)) * 100);
    const independentAccuracy = Math.round((independent / totalQuestions) * 100);
    const elapsedMs = Math.max(0, Date.now() - state.startedAt);
    const durationSeconds = elapsedMs / 1000;
    return {
      sessionId: state.sessionId,
      labKind: 'rehab',
      reportScope: REPORT_SCOPE,
      curriculumKey: config.id,
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      stageOrder: state.stage.stage || 1,
      labTitle: LAB_TITLE,
      totalQuestions,
      correctCount: independent,
      wrongCount: state.logs.filter((log) => log.score === 0).length,
      score,
      accuracyScore: independentAccuracy,
      cleared: score >= 70,
      durationSeconds,
      startedAtMs: state.startedAt,
      summary: `${LAB_TITLE} ${state.stage.title}을 완료했습니다.`,
      overview: config.clinicalTargets,
      recommendations: config.recommendations || [],
      focusKey: config.focusKey,
      focusLabel: config.focusLabel,
      reportInput: {
        reportEvidenceMode: 'observed-only',
        scoreKind: 'language-support-weighted-percent',
        reportType: `rehab-language-card-${config.mode}`,
        title: LAB_TITLE,
        stageTitle: state.stage.title,
        ageGroupLabel: state.stage.age.label,
        ageGroupRange: state.stage.age.range,
        levelLabel: state.stage.level.label,
        levelDescription: state.stage.level.desc,
        clinicalNote: state.stage.age.clinical,
        guardianSummary: `${state.stage.age.label} 기준 ${state.stage.level.label} 과제에서 장면 단서와 언어 의미를 연결하는 수행을 관찰했습니다.`,
        teacherReviewNote: `독립 정답 ${independent}개, 도움 후 정답 ${supported}개, 오답 ${state.logs.filter((log) => log.score === 0).length}개`,
        totalQuestions,
        correctCount: independent,
        independentCount: independent,
        supportedCount: supported,
        wrongCount: state.logs.filter((log) => log.score === 0).length,
        accuracyRate: independentAccuracy,
        accuracyRateLabel: '독립 정답률',
        score,
        startedAtMs: state.startedAt,
        elapsedMs,
        avgQuestionMs: null,
        questionLogs: state.logs.map((log) => ({ ...log, targets: [...(log.targets || [])], selected: [...(log.selected || [])] })),
        timingSource: 'trial-response-time-unmeasured',
        benchmarkMs: state.stage.age.normProfile === 'senior' ? 9000 : 7000,
        reportProfileId: config.mode === 'multi-feature' ? 'semantic-feature-analysis' : 'pragmatic-language',
        normProfile: state.stage.age.normProfile,
        normProfileLabel: `${state.stage.age.label} 기준`
      },
      details: {
        duration_seconds: durationSeconds,
        duration_minutes: elapsedMs / 60000,
        elapsed_ms: elapsedMs,
        report_integrated_score: null,
        report_cognitive_score: null,
        report_reaction_score: null,
        report_type: `rehab-language-card-${config.mode}`,
        report_focus_key: config.focusKey,
        report_title: LAB_TITLE,
        source_page: `${config.id}.html`,
        task_type: config.mode,
        clinical_targets: config.clinicalTargets,
        evidence_notes: config.evidenceNotes,
        age_group: state.stage.age.label,
        age_range: state.stage.age.range,
        level_label: state.stage.level.label,
        stage_difficulty: state.stage.level.label,
        independent_count: independent,
        successful_count: independent + supported,
        supported_count: supported,
        modeled_or_wrong_count: state.logs.filter((log) => log.score === 0).length,
        result_snapshot: state.logs
      }
    };
  }

  function saveLocalReport(payload) {
    if (!window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function') return null;
    return window.HahaLabLearningHarness.recordSession(payload);
  }

  async function saveSupabaseReport(payload) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = await getSupabaseClient();
    if (!client) return { skipped: true };
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(payload.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(payload.durationSeconds || 0) / 60));
    const details = Object.assign({
      report_scope: REPORT_SCOPE,
      lab_scope: REPORT_SCOPE,
      lab_label: '재활랩',
      lab_title: LAB_TITLE,
      game_name: LAB_TITLE,
      report_title: payload.stageTitle,
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
      report_input: payload.reportInput,
      report_brief_opinion: payload.summary,
      report_overview: payload.overview,
      report_recommendations: payload.recommendations,
      report_focus_key: payload.focusKey,
      report_focus_label: payload.focusLabel
    }, payload.details || {});
    const row = {
      teacher_id: String(launchContext.teacherId || '').trim(),
      client_id: String(launchContext.clientId || '').trim(),
      client_name: String(launchContext.clientName || '').trim(),
      type: String(launchContext.clientType || 'client').trim() || 'client',
      category: 'session_history',
      action: LAB_SESSION_COMPLETION_ACTION,
      action_type: LAB_TITLE,
      event_datetime: completedAt,
      start_datetime: startedAt,
      end_datetime: completedAt,
      duration: `${durationMinutes} minutes`,
      duration_minutes: durationMinutes,
      details: JSON.stringify(details),
      metadata: {
        report_scope: REPORT_SCOPE,
        duration_minutes: durationMinutes,
        score: payload.score
      },
      memo: payload.stageTitle || LAB_TITLE
    };
    try {
      const result = await client.from('histories').insert(row);
      if (result && result.error) throw result.error;
      return result;
    } catch (error) {
      console.error('[rehablab-language-card-labs] history save failed:', error);
      return { error };
    }
  }

  function saveReport() {
    if (state.savedRunId) return;
    const payload = buildPayload();
    state.savedRunId = `local-${Date.now()}`;
    const record = saveLocalReport(payload);
    if (record?.id) state.savedRunId = record.id;
    if (!record) {
      saveSupabaseReport(payload).catch((error) => {
        console.warn('[rehablab-language-card-labs] supabase save failed', error);
      });
    }
  }

  function finishStage() {
    const payload = buildPayload();
    const independent = payload.details.independent_count;
    const supported = payload.details.supported_count;
    const needsModel = payload.details.modeled_or_wrong_count;
    if (els.resultTitle) els.resultTitle.textContent = `${payload.stageTitle} 완료`;
    if (els.resultSummary) els.resultSummary.textContent = payload.summary;
    if (els.resultStats) {
      els.resultStats.innerHTML = [
        ['문항', `${payload.totalQuestions}`],
        ['독립', `${independent}`],
        ['도움 후', `${supported}`],
        ['지원 가중 수행 점수', `${payload.score}%`]
      ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    }
    if (els.resultReport) {
      els.resultReport.textContent = needsModel > 0
        ? '오반응 문항은 같은 레벨에서 근거 설명을 추가로 유도하며 재시도하는 것이 적절합니다.'
        : '현재 레벨에서 독립 또는 최소 단서 반응이 안정적으로 관찰되었습니다.';
    }
    if (els.professionalReport && window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function') {
      const report = window.PlaylabReportEngine.buildReport(payload.reportInput);
      els.professionalReport.innerHTML = window.PlaylabReportEngine.renderHtml(report, {
        variant: 'standalone',
        reportMode: 'teacher'
      });
      [els.resultTitle, els.resultSummary, els.resultStats, els.resultReport].forEach((node) => {
        if (node) node.hidden = true;
      });
    }
    setScreen('result');
    saveReport();
  }

  function openHelp() {
    const message = [
      LAB_TITLE,
      config.clinicalTargets,
      config.evidenceNotes
    ].filter(Boolean).join('\n\n');
    window.alert(message);
  }

  function startSelectedStage() {
    const stage = buildStageFromSelection();
    if (!stage) return;
    state.stage = stage;
    state.trialIndex = 0;
    state.startedAt = Date.now();
    state.sessionId = crypto.randomUUID();
    state.selected = new Set();
    state.cueLevel = 0;
    state.logs = [];
    state.savedRunId = '';
    setScreen('game');
    renderTrial();
  }

  window.forceRehabLanguageCardResultView = finishStage;

  document.querySelectorAll('[data-age]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedAgeId = String(button.getAttribute('data-age') || '').trim();
      state.selectedLevelId = '';
      document.querySelectorAll('[data-age]').forEach((node) => {
        node.classList.toggle('is-selected', node.getAttribute('data-age') === state.selectedAgeId);
      });
      renderLevelGrid();
    });
  });

  els.levelGrid?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-level-id]');
    if (!button || !state.selectedAgeId) return;
    state.selectedLevelId = String(button.getAttribute('data-level-id') || '').trim();
    renderLevelGrid();
  });

  els.startButton?.addEventListener('click', startSelectedStage);
  els.retryButton?.addEventListener('click', startSelectedStage);
  els.stageButton?.addEventListener('click', () => setScreen('stage'));
  els.helpButton?.addEventListener('click', openHelp);

  renderLevelGrid();
  setScreen('stage');
})();
