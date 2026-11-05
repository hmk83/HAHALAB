(function () {
  'use strict';

  const IS_HARNESS = Array.from(new URLSearchParams(window.location.search).keys()).some((key) => key.startsWith('harness'));
  const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const CORRECT_FEEDBACK_MS = IS_HARNESS ? 90 : (REDUCED_MOTION ? 170 : 980);
  const WRONG_FEEDBACK_MS = IS_HARNESS ? 90 : (REDUCED_MOTION ? 190 : 1250);
  const PAIR_NOTICE_MS = IS_HARNESS ? 40 : 850;
  const DEAL_READY_MS = IS_HARNESS ? 30 : (REDUCED_MOTION ? 20 : 360);
  const CORRECT_MOVE_MS = IS_HARNESS ? 24 : (REDUCED_MOTION ? 20 : 270);
  const WRONG_MOVE_MS = IS_HARNESS ? 24 : (REDUCED_MOTION ? 20 : 240);
  const WRONG_RETURN_MS = IS_HARNESS ? 62 : (REDUCED_MOTION ? 80 : 760);
  const ASSET_ROOT = 'images/category/';
  const STAGES = [
    {
      id: 'fruit', number: '1단계', title: '과일 카드', subtitle: '친숙한 과일을 같은 그림 쪽으로 보내요.',
      totalCards: 24, timeLimitSeconds: 45, mistakeAllowance: 5, accent: '#f97316', soft: 'rgba(249,115,22,.16)',
      groups: [
        pair('fruit-apple-banana', item('apple', '사과', 'fruit-apple-illust.webp'), item('banana', '바나나', 'fruit-banana-illust.webp')),
        pair('fruit-strawberry-grape', item('strawberry', '딸기', 'fruit-strawberry-illust.webp'), item('grape', '포도', 'fruit-grape-illust.webp')),
        pair('fruit-orange-watermelon', item('orange', '오렌지', 'fruit-orange-illust.webp'), item('watermelon', '수박', 'fruit-watermelon-illust.webp'))
      ]
    },
    {
      id: 'animal', number: '2단계', title: '동물 카드', subtitle: '동물 그림을 빠르게 비교해 같은 쪽으로 보내요.',
      totalCards: 32, timeLimitSeconds: 40, mistakeAllowance: 3, accent: '#4f46e5', soft: 'rgba(79,70,229,.16)',
      groups: [
        pair('animal-puppy-cat', item('puppy', '강아지', 'animal-puppy-illust.webp'), item('cat', '고양이', 'animal-cat-illust.webp')),
        pair('animal-rabbit-bear', item('rabbit', '토끼', 'animal-rabbit-illust.webp'), item('bear', '곰', 'animal-bear-illust.webp')),
        pair('animal-lion-tiger', item('lion', '사자', 'animal-lion-illust.webp'), item('tiger', '호랑이', 'animal-tiger-illust.webp')),
        pair('animal-elephant-giraffe', item('elephant', '코끼리', 'animal-elephant-illust.webp'), item('giraffe', '기린', 'animal-giraffe-illust.webp'))
      ]
    }
  ];

  const state = {
    screen: 'stage', stage: null, deck: [], index: 0, startedAtMs: 0, remainingMs: 0,
    timerId: 0, trialStartedAt: 0, locked: false, ended: false, saved: false,
    decisionClockRunning: false, lastClockMs: 0, effectTimerId: 0, motionTimerIds: [], motionToken: 0,
    motionPhase: 'idle', pendingFinish: false, presentedTrialIds: new Set(),
    mistakes: 0, firstTryCorrect: 0, completed: 0, streak: 0, bestStreak: 0,
    logs: [], attempts: [], retryCount: 0, firstChoiceMade: false, previousHadError: false,
    lastGroupId: '', resultReason: '', selectedSideCounts: { left: 0, right: 0 }
  };
  const els = {};

  function item(id, name, file) { return { id, name, image: `${ASSET_ROOT}${file}` }; }
  function pair(id, left, right) { return { id, left, right }; }
  function $(id) { return document.getElementById(id); }
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }
  function median(values) {
    const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }
  function percentile(values, p) {
    const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index); const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  }
  function formatSeconds(ms) { return `${(Math.max(0, ms) / 1000).toFixed(1)}초`; }
  function formatShortSeconds(ms) { return `${(Math.max(0, ms) / 1000).toFixed(2)}초`; }

  function stageById(id) { return STAGES.find((stage) => stage.id === id) || null; }
  function currentTrial() { return state.deck[state.index] || null; }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="speed-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-color:${stage.accent};--stage-soft:${stage.soft}">
        <span class="speed-stage-number">${escapeHtml(stage.number)}</span>
        <h2>${escapeHtml(stage.title)}</h2>
        <p>${escapeHtml(stage.subtitle)}</p>
        <div class="speed-stage-meta">
          <span>${stage.totalCards}장</span><span>${stage.timeLimitSeconds}초</span><span>실수 허용 ${stage.mistakeAllowance}회</span>
        </div>
      </button>`).join('');
  }

  function setScreen(name) {
    state.screen = name;
    document.body.dataset.speedScreen = name;
    const views = { stage: els.stageView, intro: els.introView, game: els.gameView, result: els.resultView };
    Object.entries(views).forEach(([key, view]) => view?.classList.toggle('is-active', key === name));
    els.stageButton?.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel?.classList.toggle('shell-hidden', name === 'stage');
    if (els.stageLabel) {
      els.stageLabel.textContent = name === 'game' && state.stage
        ? `${state.stage.number} · ${Math.min(state.index + 1, state.stage.totalCards)} / ${state.stage.totalCards} · ${remainingSeconds().toFixed(1)}초`
        : state.stage ? `${state.stage.number} · ${state.stage.title}` : '';
    }
  }

  function chooseStage(stageId) {
    const stage = stageById(stageId);
    if (!stage) return;
    stopTimer();
    state.stage = stage;
    els.introTitle.textContent = `${stage.number} · ${stage.title}`;
    els.introCopy.textContent = stage.subtitle;
    els.introRules.innerHTML = [`카드 ${stage.totalCards}장`, `제한시간 ${stage.timeLimitSeconds}초`, `실수 허용 ${stage.mistakeAllowance}회`, '터치 · 키보드'].map((text) => `<span>${escapeHtml(text)}</span>`).join('');
    setScreen('intro');
  }

  function createBalancedSides(count) {
    const half = Math.floor(count / 2);
    const source = Array.from({ length: count }, (_, index) => index < half ? 'left' : 'right');
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const sides = shuffle(source);
      let run = 1; let longest = 1;
      for (let index = 1; index < sides.length; index += 1) {
        run = sides[index] === sides[index - 1] ? run + 1 : 1;
        longest = Math.max(longest, run);
      }
      if (longest < 4) return sides;
    }
    return source.map((_, index) => index % 2 ? 'right' : 'left');
  }

  function buildDeck(stage) {
    const perGroup = stage.totalCards / stage.groups.length;
    return stage.groups.flatMap((group, groupIndex) => createBalancedSides(perGroup).map((expectedSide, itemIndex) => {
      const target = expectedSide === 'left' ? group.left : group.right;
      return {
        trialId: `${stage.id}-${groupIndex + 1}-${itemIndex + 1}`,
        groupId: group.id, groupIndex, left: group.left, right: group.right,
        target, expectedSide, postError: false
      };
    }));
  }

  function startGame() {
    if (!state.stage) return;
    stopTimer();
    Object.assign(state, {
      deck: buildDeck(state.stage), index: 0, startedAtMs: Date.now(), remainingMs: state.stage.timeLimitSeconds * 1000,
      locked: true, ended: false, saved: false, mistakes: 0, firstTryCorrect: 0, completed: 0,
      streak: 0, bestStreak: 0, logs: [], attempts: [], retryCount: 0, firstChoiceMade: false,
      previousHadError: false, lastGroupId: '', resultReason: '', selectedSideCounts: { left: 0, right: 0 },
      decisionClockRunning: false, lastClockMs: performance.now(), pendingFinish: false,
      motionPhase: 'idle', motionToken: state.motionToken + 1, presentedTrialIds: new Set()
    });
    setScreen('game');
    updateStatus();
    startTimer();
    renderTrial(true);
  }

  function remainingSeconds() { return Math.max(0, state.remainingMs) / 1000; }
  function advanceDecisionClock() {
    const now = performance.now();
    if (state.decisionClockRunning && !state.ended) state.remainingMs = Math.max(0, state.remainingMs - Math.max(0, now - state.lastClockMs));
    state.lastClockMs = now;
  }
  function pauseDecisionClock() { advanceDecisionClock(); state.decisionClockRunning = false; }
  function resumeDecisionClock() { state.lastClockMs = performance.now(); state.decisionClockRunning = true; }
  function startTimer() {
    stopTimer();
    state.timerId = window.setInterval(() => {
      advanceDecisionClock();
      updateStatus();
      if (!state.ended && remainingSeconds() <= 0) {
        if (state.locked) state.pendingFinish = true;
        else finishRun('timeout');
      }
    }, 160);
  }
  function stopTimer() { if (state.timerId) { window.clearInterval(state.timerId); state.timerId = 0; } }

  function updateStatus() {
    const stage = state.stage;
    if (!stage) return;
    const current = Math.min(state.index + 1, stage.totalCards);
    els.progressChip.textContent = `${current} / ${stage.totalCards}`;
    els.timeChip.textContent = `${remainingSeconds().toFixed(1)}초`;
    els.mistakeChip.textContent = `실수 ${state.mistakes} / ${stage.mistakeAllowance}`;
    els.mistakeChip.classList.toggle('is-warning', state.mistakes > stage.mistakeAllowance);
    els.stageLabel.textContent = `${stage.number} · ${current} / ${stage.totalCards} · ${remainingSeconds().toFixed(1)}초`;
  }

  function setInputsDisabled(disabled) {
    [els.leftCard, els.rightCard, els.leftButton, els.rightButton].forEach((button) => { if (button) button.disabled = disabled; });
  }

  function hideAnswerEffect() {
    if (state.effectTimerId) window.clearTimeout(state.effectTimerId);
    state.effectTimerId = 0;
    if (els.answerEffect) els.answerEffect.className = 'speed-answer-effect';
  }

  function clearMotionTimers() {
    state.motionTimerIds.forEach((timerId) => window.clearTimeout(timerId));
    state.motionTimerIds = [];
  }

  function scheduleMotion(token, callback, delay) {
    const timerId = window.setTimeout(() => {
      state.motionTimerIds = state.motionTimerIds.filter((id) => id !== timerId);
      if (state.ended || token !== state.motionToken) return;
      callback();
    }, delay);
    state.motionTimerIds.push(timerId);
  }

  function setMotionPhase(phase, side = '') {
    state.motionPhase = phase;
    if (!els.deckStack) return;
    els.deckStack.dataset.motionPhase = phase;
    els.deckStack.dataset.motionSide = side;
  }

  function setFlightDestination(side) {
    const destination = side === 'left' ? els.leftCard : els.rightCard;
    const targetRect = els.targetCard.getBoundingClientRect();
    const destinationRect = destination.getBoundingClientRect();
    const flyX = destinationRect.left + destinationRect.width / 2 - (targetRect.left + targetRect.width / 2);
    const flyY = destinationRect.top + destinationRect.height / 2 - (targetRect.top + targetRect.height / 2);
    els.deckStack.style.setProperty('--fly-x', `${Math.round(flyX)}px`);
    els.deckStack.style.setProperty('--fly-y', `${Math.round(flyY)}px`);
    els.deckStack.style.setProperty('--fly-rotate', side === 'left' ? '-8deg' : '8deg');
  }

  function showAnswerEffect(kind, side) {
    if (!els.answerEffect) return;
    hideAnswerEffect();
    void els.answerEffect.offsetWidth;
    els.answerEffect.className = `speed-answer-effect is-visible is-${kind} is-${side}`;
    state.effectTimerId = window.setTimeout(hideAnswerEffect, kind === 'correct' ? CORRECT_FEEDBACK_MS : WRONG_FEEDBACK_MS);
  }

  function preloadNextTarget() {
    const nextTrial = state.deck[state.index + 1];
    if (!nextTrial?.target?.image) return;
    const image = new Image();
    image.decoding = 'async';
    image.src = nextTrial.target.image;
  }

  function renderTrial(initial) {
    const trial = currentTrial();
    if (!trial) { finishRun('completed'); return; }
    pauseDecisionClock();
    state.locked = true;
    state.attempts = [];
    state.retryCount = 0;
    state.firstChoiceMade = false;
    trial.postError = state.previousHadError;
    state.previousHadError = false;
    state.presentedTrialIds.add(trial.trialId);
    setInputsDisabled(true);
    clearMotionTimers();
    state.motionToken += 1;
    setMotionPhase('dealing');
    hideAnswerEffect();
    const groupChanged = state.lastGroupId !== trial.groupId;
    state.lastGroupId = trial.groupId;
    els.leftCard.dataset.matchLeftId = trial.left.id;
    els.rightCard.dataset.matchRightId = trial.right.id;
    els.leftImage.src = trial.left.image; els.leftImage.alt = `${trial.left.name} 기준 카드`; els.leftName.textContent = trial.left.name;
    els.rightImage.src = trial.right.image; els.rightImage.alt = `${trial.right.name} 기준 카드`; els.rightName.textContent = trial.right.name;
    els.targetImage.src = trial.target.image; els.targetImage.alt = `${trial.target.name} 중앙 카드`;
    els.targetCard.className = 'speed-target-card';
    els.leftCard.classList.remove('is-correct-pulse', 'is-wrong-pulse');
    els.rightCard.classList.remove('is-correct-pulse', 'is-wrong-pulse');
    els.feedbackStatus.className = 'speed-feedback-status';
    els.feedbackStatus.textContent = groupChanged ? '새 기준 카드를 확인하세요.' : '같은 그림 쪽을 선택하세요.';
    els.pairNotice.textContent = groupChanged ? `${trial.left.name} · ${trial.right.name}` : '같은 그림을 찾아요';
    const delay = groupChanged ? PAIR_NOTICE_MS : (initial ? PAIR_NOTICE_MS : DEAL_READY_MS);
    void els.targetCard.offsetWidth;
    els.targetCard.classList.add('is-dealing');
    preloadNextTarget();
    window.setTimeout(() => {
      if (state.ended || currentTrial()?.trialId !== trial.trialId) return;
      state.trialStartedAt = performance.now();
      state.locked = false;
      setMotionPhase('idle');
      setInputsDisabled(false);
      resumeDecisionClock();
      els.feedbackStatus.textContent = '같은 그림 쪽을 선택하세요.';
      els.leftCard.focus({ preventScroll: true });
    }, delay);
  }

  function submitChoice(side, inputSource) {
    if (state.screen !== 'game' || state.ended || state.locked) return false;
    const trial = currentTrial();
    if (!trial || !['left', 'right'].includes(side)) return false;
    const responseMs = Math.max(0, performance.now() - state.trialStartedAt);
    const correct = side === trial.expectedSide;
    pauseDecisionClock();
    state.selectedSideCounts[side] += 1;
    state.attempts.push({ side, correct, responseMs: Math.round(responseMs), inputSource });
    if (!correct) {
      state.locked = true;
      setInputsDisabled(true);
      state.mistakes += 1;
      state.retryCount += 1;
      state.firstChoiceMade = true;
      state.streak = 0;
      state.previousHadError = true;
      const chosen = side === 'left' ? els.leftCard : els.rightCard;
      chosen.classList.add('is-wrong-pulse');
      const token = ++state.motionToken;
      setFlightDestination(side);
      setMotionPhase('moving', side);
      els.targetCard.className = 'speed-target-card is-flying';
      els.feedbackStatus.className = 'speed-feedback-status is-wrong';
      els.feedbackStatus.textContent = `다시 확인해 보세요. ${trial.target.name}와 같은 그림을 찾아요.`;
      updateStatus();
      scheduleMotion(token, () => {
        if (currentTrial()?.trialId !== trial.trialId) return;
        setMotionPhase('wrong', side);
        els.targetCard.className = 'speed-target-card is-flying is-wrong-impact';
        showAnswerEffect('wrong', side);
      }, WRONG_MOVE_MS);
      scheduleMotion(token, () => {
        if (currentTrial()?.trialId !== trial.trialId) return;
        hideAnswerEffect();
        setMotionPhase('returning', side);
        els.targetCard.className = 'speed-target-card is-returning';
      }, WRONG_RETURN_MS);
      scheduleMotion(token, () => {
        if (currentTrial()?.trialId !== trial.trialId) return;
        chosen.classList.remove('is-wrong-pulse');
        els.targetCard.className = 'speed-target-card';
        hideAnswerEffect();
        setMotionPhase('idle');
        if (state.pendingFinish) { state.pendingFinish = false; finishRun('timeout'); return; }
        state.trialStartedAt = performance.now();
        state.locked = false;
        setInputsDisabled(false);
        resumeDecisionClock();
      }, WRONG_FEEDBACK_MS);
      return false;
    }

    state.locked = true;
    setInputsDisabled(true);
    const firstTryCorrect = !state.firstChoiceMade;
    if (firstTryCorrect) state.firstTryCorrect += 1;
    state.completed += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const chosen = side === 'left' ? els.leftCard : els.rightCard;
    chosen.classList.add('is-correct-pulse');
    const token = ++state.motionToken;
    setFlightDestination(side);
    setMotionPhase('moving', side);
    els.targetCard.className = 'speed-target-card is-flying';
    els.feedbackStatus.className = 'speed-feedback-status is-correct';
    els.feedbackStatus.textContent = `${trial.target.name} · 정답!`;
    state.logs.push({
      trialId: trial.trialId, pairId: trial.groupId, stimulusId: trial.target.id,
      targetName: trial.target.name, expectedSide: trial.expectedSide, selectedSide: side,
      correct: true, firstTryCorrect, selfCorrected: !firstTryCorrect, responseMs: Math.round(responseMs),
      retryCount: state.retryCount, postError: trial.postError, inputSource,
      attempts: state.attempts.slice()
    });
    updateStatus();
    scheduleMotion(token, () => {
      setMotionPhase('burst', side);
      els.targetCard.className = 'speed-target-card is-flying is-correct-impact';
      showAnswerEffect('correct', side);
    }, CORRECT_MOVE_MS);
    scheduleMotion(token, () => {
      chosen.classList.remove('is-correct-pulse');
      hideAnswerEffect();
      if (state.pendingFinish) { state.pendingFinish = false; finishRun('timeout'); return; }
      state.index += 1;
      if (state.index >= state.deck.length) finishRun('completed');
      else renderTrial(false);
    }, CORRECT_FEEDBACK_MS);
    return true;
  }

  function finishRun(reason) {
    if (state.ended) return;
    pauseDecisionClock();
    state.ended = true;
    state.resultReason = reason;
    state.locked = true;
    clearMotionTimers();
    state.motionToken += 1;
    setMotionPhase('idle');
    stopTimer();
    setInputsDisabled(true);
    const trial = currentTrial();
    if (reason === 'timeout' && trial && !state.logs.some((log) => log.trialId === trial.trialId)) {
      state.logs.push({
        trialId: trial.trialId, pairId: trial.groupId, stimulusId: trial.target.id, targetName: trial.target.name,
        expectedSide: trial.expectedSide, selectedSide: '', correct: false, firstTryCorrect: false,
        selfCorrected: false, responseMs: 0, retryCount: state.retryCount, postError: trial.postError,
        inputSource: 'timeout', timeout: true, attempts: state.attempts.slice()
      });
    }
    renderResult();
  }

  function buildMetrics() {
    const stage = state.stage;
    const presentedCount = state.presentedTrialIds.size;
    const eligibleRtLogs = state.logs.filter((log) => log.firstTryCorrect && !log.postError);
    const validCorrectTimes = eligibleRtLogs.filter((log) => log.responseMs >= 150).map((log) => log.responseMs);
    const firstAccuracy = presentedCount ? Math.round((state.firstTryCorrect / presentedCount) * 100) : 0;
    const medianRt = Math.round(median(validCorrectTimes));
    const iqr = validCorrectTimes.length >= 4 ? Math.round(percentile(validCorrectTimes, .75) - percentile(validCorrectTimes, .25)) : 0;
    const unansweredCount = Math.max(0, presentedCount - state.completed);
    const unpresentedCount = Math.max(0, stage.totalCards - presentedCount);
    const firstErrorTrialCount = state.logs.filter((log) => !log.firstTryCorrect && !log.timeout).length;
    const selfCorrectedCount = state.logs.filter((log) => log.selfCorrected).length;
    const selfCorrectionRate = firstErrorTrialCount ? Math.round((selfCorrectedCount / firstErrorTrialCount) * 100) : 0;
    const elapsedMs = Math.max(0, Date.now() - state.startedAtMs);
    const success = state.resultReason === 'completed' && state.mistakes <= stage.mistakeAllowance;
    return {
      presentedCount, firstAccuracy, medianRt, iqr, unansweredCount, unpresentedCount,
      firstErrorTrialCount, selfCorrectedCount, selfCorrectionRate,
      validRtCount: validCorrectTimes.length, excludedFastRtCount: eligibleRtLogs.length - validCorrectTimes.length,
      completionCoverage: stage.totalCards ? Math.round((state.completed / stage.totalCards) * 100) : 0,
      elapsedMs, success
    };
  }

  function buildPayload(metrics) {
    const stage = state.stage;
    const sessionId = `speed-card-${stage.id}-${state.startedAtMs}`;
    const guardianSummary = `${stage.title}에서 제시된 카드 ${metrics.presentedCount}장 중 ${state.firstTryCorrect}장을 첫 선택에서 정확하게 분류했습니다. 처음 틀린 카드 중 ${metrics.selfCorrectedCount}장은 안내 후 다시 맞혔으며, 정확한 첫 반응의 중앙시간은 ${metrics.medianRt ? formatShortSeconds(metrics.medianRt) : '유효 표본이 부족해 산출하지 않았습니다'}.`;
    const teacherNote = `활성 판단시간 ${stage.timeLimitSeconds}초, 실수 허용 ${stage.mistakeAllowance}회 조건입니다. 계획/제시/완료 ${stage.totalCards}/${metrics.presentedCount}/${state.completed}장, 첫 선택 정확도 ${metrics.firstAccuracy}%, 자기수정 ${metrics.selfCorrectedCount}장, 미응답 ${metrics.unansweredCount}장, 미제시 ${metrics.unpresentedCount}장입니다. 오류 직후 시행을 제외한 정답 첫 반응 중앙시간 ${metrics.medianRt || 0}ms, 유효 RT ${metrics.validRtCount}건, IQR ${metrics.iqr || 0}ms를 같은 단계·기기·입력 방식 안에서 확인합니다.`;
    const actionPlan = metrics.firstAccuracy >= 85 && metrics.unansweredCount <= 1
      ? '동일 조건에서 한 회기 더 안정성을 확인한 뒤 다음 단계를 검토합니다.'
      : '속도보다 좌우 기준 카드를 말로 확인하는 절차를 먼저 연습하고 같은 단계를 반복합니다.';
    const reportDisplayModes = {
      guardian: { label: '보호자 공유', summary: guardianSummary },
      teacher: { label: '전문가 분석', summary: teacherNote }
    };
    return {
      labKind: 'playlab', reportScope: 'playlab', labScope: 'playlab', saveToClientReport: true, persistToClientReport: true,
      curriculumKey: 'playlab-speed-card-sort', reportType: 'playlab-speed-card-sort', labTitle: '쏙쏙 카드 배달',
      stageKey: stage.id, stageTitle: `${stage.number} · ${stage.title}`, totalQuestions: stage.totalCards,
      totalAttempts: state.completed + state.mistakes, correctCount: state.firstTryCorrect,
      wrongCount: Math.max(0, metrics.presentedCount - state.firstTryCorrect),
      score: metrics.firstAccuracy, accuracyScore: metrics.firstAccuracy, durationSeconds: Math.round(metrics.elapsedMs / 1000),
      startedAtMs: state.startedAtMs, summary: guardianSummary, guardianSummary, teacherReviewNote: teacherNote,
      actionPlanSummary: actionPlan, actionPlanPolicy: 'teacher-review-required', reportDisplayModes,
      overview: '이번 디지털 과제에서 중앙 카드와 좌우 기준 카드의 동일성을 비교해 방향을 선택한 수행 기록입니다. 표준화 검사나 의학적 진단을 대체하지 않습니다.',
      recommendations: [actionPlan, '정확한 기준 확인을 우선하고 시간 조건은 한 요소씩만 조절합니다.'],
      questionSnapshot: state.logs, resultSnapshot: state.logs,
      details: {
        source_page: String(window.location.pathname || '').split('/').pop() || '', session_id: sessionId,
        learning_id: 'playlab-speed-card-sort', learning_title: '쏙쏙 카드 배달', report_scope: 'playlab',
        planned_card_count: stage.totalCards, presented_card_count: metrics.presentedCount,
        completed_card_count: state.completed, completion_coverage: metrics.completionCoverage,
        total_pairs: stage.totalCards, matched_pairs: state.completed, first_try_correct: state.firstTryCorrect,
        first_try_accuracy: metrics.firstAccuracy, first_try_accuracy_presented: metrics.firstAccuracy,
        first_error_trial_count: metrics.firstErrorTrialCount,
        self_corrected_count: metrics.selfCorrectedCount, self_correction_rate: metrics.selfCorrectionRate,
        wrong_pair_attempts: state.mistakes, omission_count: metrics.unansweredCount + metrics.unpresentedCount,
        incomplete_card_count: metrics.unansweredCount + metrics.unpresentedCount,
        unanswered_presented_count: metrics.unansweredCount,
        unpresented_timeout_count: metrics.unpresentedCount,
        time_limit_seconds: stage.timeLimitSeconds, mistake_allowance: stage.mistakeAllowance,
        completion_reason: state.resultReason, timed_out: state.resultReason === 'timeout', success: metrics.success,
        timer_basis: 'active-decision-time', median_correct_response_ms: metrics.medianRt,
        response_iqr_ms: metrics.iqr, valid_response_time_n: metrics.validRtCount,
        excluded_fast_response_n: metrics.excludedFastRtCount, response_time_floor_ms: 150,
        best_streak: state.bestStreak,
        left_choice_count: state.selectedSideCounts.left, right_choice_count: state.selectedSideCounts.right,
        question_logs: state.logs, report_display_modes: reportDisplayModes,
        report_guardian_summary: guardianSummary, report_teacher_review_note: teacherNote,
        report_action_plan_summary: actionPlan,
        report_action_plan_policy: '첫 선택 정확도 85% 이상이고 누락이 1회 이하일 때 다음 단계 검토 후보로 사용합니다. 이는 운영용 초기 기준이며 임상적 절단점이 아닙니다.',
        clinical_limitation_note: '본 결과는 이번 디지털 카드 매칭 과제에서 관찰된 수행 기록입니다. 시각 동일성 비교, 지시 이해, 손 움직임, 화면 크기·입력 지연, 제한시간, 피드백 애니메이션, 피로와 게임 경험의 영향을 받을 수 있습니다. 표준화된 주의력·시지각·신경심리검사 또는 의학적 진단을 대체하지 않으며, 다른 단계·기기·입력 방식의 반응시간은 직접 비교하지 않습니다. 자기수정은 즉각적 피드백을 받은 뒤 같은 시행에서 정답으로 바꾼 기록을 뜻합니다.'
      }
    };
  }

  function saveResult(payload) {
    if (state.saved) return;
    state.saved = true;
    if (window.HahaLabLearningHarness?.recordSession) window.HahaLabLearningHarness.recordSession(payload);
  }

  function renderResult() {
    const metrics = buildMetrics();
    const stage = state.stage;
    const payload = buildPayload(metrics);
    const statusText = metrics.success ? '기준 안에서 카드 배달을 완료했어요!' : '이번 수행 기록을 확인해 보세요.';
    els.resultTitle.textContent = metrics.success ? '카드 배달 성공!' : (state.resultReason === 'timeout' ? '시간이 종료되었어요' : '카드 배달 완료');
    const unpresentedText = metrics.unpresentedCount ? ` 시간 종료로 ${metrics.unpresentedCount}장은 제시되지 않았습니다.` : '';
    els.resultSummary.textContent = `제시된 ${metrics.presentedCount}장 중 ${state.firstTryCorrect}장을 첫 선택에서 정확하게 분류했습니다.${unpresentedText} ${statusText}`;
    const stats = [
      ['첫 선택 정답', `${state.firstTryCorrect} / ${stage.totalCards}`],
      ['첫 선택 정확도', `${metrics.firstAccuracy}%`],
      ['자기수정', `${metrics.selfCorrectedCount}장`],
      ['실수 반응', `${state.mistakes}회`],
      ['미응답 카드', `${metrics.unansweredCount}장`],
      ['미제시 카드', `${metrics.unpresentedCount}장`],
      ['중앙 반응시간', metrics.medianRt ? formatShortSeconds(metrics.medianRt) : '-'],
      ['완료 상태', state.resultReason === 'timeout' ? '시간 종료' : '전체 완료']
    ];
    els.resultStats.innerHTML = stats.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
    els.professionalReport.innerHTML = `<strong>회기 관찰 안내</strong><br>${escapeHtml(payload.details.report_teacher_review_note)}<br><br>이번 회기 수행 자료이며 표준화 검사나 의학적 진단을 대체하지 않습니다.`;
    setScreen('result');
    saveResult(payload);
  }

  function showStageView() { stopTimer(); clearMotionTimers(); state.motionToken += 1; state.ended = true; state.stage = null; setMotionPhase('idle'); setScreen('stage'); renderStages(); }

  function bindEvents() {
    els.stageGrid.addEventListener('click', (event) => { const button = event.target.closest('[data-stage-id]'); if (button) chooseStage(button.dataset.stageId); });
    els.introStartButton.addEventListener('click', startGame);
    els.introBackButton.addEventListener('click', showStageView);
    els.stageButton.addEventListener('click', showStageView);
    els.leftCard.addEventListener('click', () => submitChoice('left', 'touch'));
    els.rightCard.addEventListener('click', () => submitChoice('right', 'touch'));
    els.leftButton.addEventListener('click', () => submitChoice('left', 'touch'));
    els.rightButton.addEventListener('click', () => submitChoice('right', 'touch'));
    els.retryButton.addEventListener('click', startGame);
    els.otherStageButton.addEventListener('click', showStageView);
    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      if (state.screen === 'intro' && event.key === 'Enter') { event.preventDefault(); startGame(); return; }
      if (state.screen !== 'game') return;
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) { event.preventDefault(); submitChoice('left', 'keyboard'); }
      if (['ArrowRight', 'd', 'D'].includes(event.key)) { event.preventDefault(); submitChoice('right', 'keyboard'); }
    });
    window.addEventListener('playlab:global-exit-confirmed', stopTimer);
  }

  function cacheElements() {
    ['stageView','stageGrid','introView','introTitle','introCopy','introRules','introStartButton','introBackButton','gameView','gamePanel','gameTitle','stageLabel','stageButton','progressChip','timeChip','mistakeChip','leftCard','rightCard','leftImage','rightImage','leftName','rightName','pairNotice','deckStack','targetCard','targetImage','answerEffect','leftButton','rightButton','feedbackStatus','resultView','resultTitle','resultSummary','resultStats','professionalReport','retryButton','otherStageButton'].forEach((id) => { els[id] = $(id); });
  }

  function getState() {
    const trial = currentTrial();
    return {
      screen: state.screen, stageId: state.stage?.id || '', index: state.index, total: state.stage?.totalCards || 0,
      mistakes: state.mistakes, completed: state.completed, presentedCount: state.presentedTrialIds.size,
      remainingMs: Math.max(0, Math.round(state.remainingMs)), locked: state.locked, motionPhase: state.motionPhase,
      ended: state.ended, resultReason: state.resultReason,
      currentTrial: trial ? { trialId: trial.trialId, expectedSide: trial.expectedSide, targetId: trial.target.id, groupId: trial.groupId } : null,
      logs: state.logs.map((log) => ({ ...log }))
    };
  }

  function createDeckSnapshot(stageId) {
    const stage = stageById(stageId);
    if (!stage) return [];
    return buildDeck(stage).map((trial) => ({
      trialId: trial.trialId,
      groupId: trial.groupId,
      expectedSide: trial.expectedSide,
      targetId: trial.target.id,
      leftId: trial.left.id,
      rightId: trial.right.id
    }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (IS_HARNESS) document.documentElement.dataset.speedHarness = '1';
    cacheElements(); renderStages(); bindEvents(); setScreen('stage');
    window.PlayLabSpeedCardSort = { stages: STAGES, getState, submitChoice, createDeckSnapshot };
  });
})();
