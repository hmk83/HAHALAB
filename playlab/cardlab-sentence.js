(function () {
  'use strict';

  try {
    const STAGE_COLORS = [
      { accent: '#67d4ef', soft: 'rgba(103, 212, 239, 0.16)' },
      { accent: '#22c7e6', soft: 'rgba(34, 199, 230, 0.16)' },
      { accent: '#38bdf8', soft: 'rgba(56, 189, 248, 0.16)' },
      { accent: '#2dd4bf', soft: 'rgba(45, 212, 191, 0.16)' },
      { accent: '#60a5fa', soft: 'rgba(96, 165, 250, 0.16)' },
      { accent: '#7dd3fc', soft: 'rgba(125, 211, 252, 0.16)' }
    ];
    const AUDIO_FILES = {
      select: '../sound/cardlab-sentence/select.mp3',
      correct: '../sound/cardlab-sentence/correct.mp3',
      wrong: '../sound/cardlab-sentence/error.mp3',
      complete: '../sound/cardlab-sentence/happy_victory.mp3'
    };
    const STAGES = Array.isArray(window.HAHA_LAB_SENTENCE_QUIZ_STAGE_TEMPLATES)
      ? window.HAHA_LAB_SENTENCE_QUIZ_STAGE_TEMPLATES.map(normalizeStage)
      : [];
    const NEXT_PROMPT_DELAY_MS = 1150;

    const stageSelectView = document.getElementById('stageSelectView');
    const introView = document.getElementById('introView');
    const buildView = document.getElementById('buildView');
    const completeView = document.getElementById('completeView');
    const stageGrid = document.getElementById('stageGrid');
    const shellTitle = document.getElementById('shellTitle');
    const shellStageLabel = document.getElementById('shellStageLabel');
    const stageSelectButton = document.getElementById('stageSelectButton');
    const helpButton = document.getElementById('helpButton');
    const exitButton = document.getElementById('exitButton');
    const introBadge = document.getElementById('introBadge');
    const introTitle = document.getElementById('introTitle');
    const introSubtitle = document.getElementById('introSubtitle');
    const introLevelCopy = document.getElementById('introLevelCopy');
    const introMissionCopy = document.getElementById('introMissionCopy');
    const introDescription = document.getElementById('introDescription');
    const introStartButton = document.getElementById('introStartButton');
    const introBackButton = document.getElementById('introBackButton');
    const questionTitle = document.getElementById('questionTitle');
    const questionProgressChip = document.getElementById('questionProgressChip');
    const selectionChip = document.getElementById('selectionChip');
    const slotCountChip = document.getElementById('slotCountChip');
    const sentenceSlotRail = document.getElementById('sentenceSlotRail');
    const choiceBoard = document.getElementById('choiceBoard');
    const solvedPanel = document.getElementById('solvedPanel');
    const solvedKicker = document.getElementById('solvedKicker');
    const solvedSentence = document.getElementById('solvedSentence');
    const nextQuestionButton = document.getElementById('nextQuestionButton');
    const completeTitle = document.getElementById('completeTitle');
    const completeCorrectCount = document.getElementById('completeCorrectCount');
    const completeWrongCount = document.getElementById('completeWrongCount');
    const completeTotalCount = document.getElementById('completeTotalCount');
    const completeStageButtonBack = document.getElementById('completeStageButtonBack');
    const completeRetryButton = document.getElementById('completeRetryButton');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalDesc = document.getElementById('confirmModalDesc');
    const confirmModalOk = document.getElementById('confirmModalOk');
    const confirmModalCancel = document.getElementById('confirmModalCancel');
    const effectLayer = document.getElementById('sentenceEffectLayer');

    if (!stageSelectView || !introView || !buildView || !completeView || !stageGrid || !shellTitle || !shellStageLabel || !stageSelectButton || !helpButton || !introBadge || !introTitle || !introSubtitle || !introLevelCopy || !introMissionCopy || !introDescription || !introStartButton || !introBackButton || !questionTitle || !questionProgressChip || !selectionChip || !slotCountChip || !sentenceSlotRail || !choiceBoard || !solvedPanel || !solvedKicker || !solvedSentence || !nextQuestionButton || !completeTitle || !completeCorrectCount || !completeWrongCount || !completeTotalCount || !completeStageButtonBack || !completeRetryButton || !confirmModal || !confirmModalTitle || !confirmModalDesc || !confirmModalOk || !confirmModalCancel || !effectLayer) {
      return;
    }

    const audioCache = new Map();
    const narrationAudioCache = new Map();
    let activeAudio = null;
    let activeNarrationAudio = null;
    let completionFxPlayed = false;
    let nextPromptTimer = 0;

    const state = {
      phase: 'select',
      selectedStageId: getInitialStageId(),
      pendingAction: '',
      run: null
    };

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function shuffle(list) {
      const copied = Array.isArray(list) ? list.slice() : [];
      for (let index = copied.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
      }
      return copied;
    }

    function sample(list, count) {
      const copied = shuffle(list);
      return copied.slice(0, Math.max(0, Math.min(copied.length, count)));
    }

    function normalizeStage(stage, index) {
      const fallback = STAGE_COLORS[index % STAGE_COLORS.length];
      return {
        id: String(stage && stage.id || `sentence-quiz-${String(index + 1).padStart(2, '0')}`),
        title: String(stage && stage.title || `단계 ${index + 1}`),
        schoolLevelLabel: String(stage && stage.schoolLevelLabel || ''),
        bandLabel: String(stage && stage.bandLabel || stage && stage.title || `단계 ${index + 1}`),
        descriptor: String(stage && stage.descriptor || ''),
        grammarFocus: String(stage && stage.grammarFocus || ''),
        goalCopy: String(stage && stage.goalCopy || '섞인 어절 카드를 순서대로 놓아 문장을 완성해요.'),
        questionPoolLabel: String(stage && stage.questionPoolLabel || ''),
        runQuestionCount: clamp(Number(stage && stage.runQuestionCount || 10) || 10, 5, 10),
        questions: Array.isArray(stage && stage.questions) ? stage.questions.map(normalizeQuestion) : [],
        accent: String(stage && stage.accent || fallback.accent),
        soft: String(stage && stage.soft || fallback.soft)
      };
    }

    function normalizeQuestion(question, index) {
      const tokens = Array.isArray(question && question.tokens) ? question.tokens.map((token) => String(token || '').trim()).filter(Boolean) : [];
      const tokenAudioPaths = Array.isArray(question && question.tokenAudioPaths)
        ? question.tokenAudioPaths.map((audioPath) => String(audioPath || '').trim())
        : [];
      return {
        id: String(question && question.id || `sentence-question-${String(index + 1).padStart(2, '0')}`),
        sentence: String(question && question.sentence || '').trim(),
        tokens,
        tokenAudioPaths,
        sentenceAudioPath: String(question && question.sentenceAudioPath || '').trim(),
        acceptedTokenOrders: Array.isArray(question && question.acceptedTokenOrders) && question.acceptedTokenOrders.length
          ? question.acceptedTokenOrders.map((order) => Array.isArray(order) ? order.map((token) => String(token || '').trim()).filter(Boolean) : [])
          : [tokens]
      };
    }

    function getInitialStageId() {
      const hashStageId = String(window.location.hash || '').replace(/^#/, '').trim();
      return STAGES.some((stage) => stage.id === hashStageId)
        ? hashStageId
        : (STAGES[0] ? STAGES[0].id : '');
    }

    function pickStage() {
      return STAGES.find((stage) => stage.id === state.selectedStageId) || STAGES[0] || null;
    }

    function setPhase(nextPhase) {
      state.phase = nextPhase;
      stageSelectView.classList.toggle('is-active', nextPhase === 'select');
      stageSelectView.classList.toggle('is-hidden', nextPhase !== 'select');
      introView.classList.toggle('is-active', nextPhase === 'intro');
      introView.classList.toggle('is-hidden', nextPhase !== 'intro');
      buildView.classList.toggle('is-active', nextPhase === 'build');
      buildView.classList.toggle('is-hidden', nextPhase !== 'build');
      completeView.classList.toggle('is-active', nextPhase === 'complete');
      completeView.classList.toggle('is-hidden', nextPhase !== 'complete');
      stageSelectButton.classList.toggle('shell-hidden', nextPhase === 'select');
      shellStageLabel.classList.toggle('shell-hidden', nextPhase === 'select');
      shellTitle.classList.toggle('shell-hidden', nextPhase === 'build');
      if (nextPhase === 'build' || nextPhase === 'complete' || nextPhase === 'intro') {
        renderShellStageLabel();
      }
    }

    function renderShellStageLabel() {
      const stage = pickStage();
      if (!stage) {
        shellStageLabel.textContent = '스테이지 준비중';
        return;
      }
      shellStageLabel.textContent = `${stage.schoolLevelLabel || stage.bandLabel} · ${stage.title}`;
    }

    function renderStageCards() {
      stageGrid.innerHTML = STAGES.map((stage) => {
        const active = stage.id === state.selectedStageId;
        const style = `--stage-accent:${stage.accent};--stage-soft:${stage.soft};`;
        return '' +
          `<a href="#${escapeHtml(stage.id)}" class="wordbuild-stage-card" data-stage-id="${escapeHtml(stage.id)}" aria-pressed="${active ? 'true' : 'false'}" role="button" style="${style}">` +
          '  <div class="wordbuild-stage-top">' +
          `    <span class="wordbuild-stage-chip">${escapeHtml(stage.bandLabel)}</span>` +
          `    <span class="wordbuild-stage-code">${escapeHtml(stage.schoolLevelLabel)}</span>` +
          '  </div>' +
          '  <div class="wordbuild-stage-main">' +
          `    <div class="wordbuild-stage-name">${escapeHtml(stage.title)}</div>` +
          `    <div class="wordbuild-stage-detail">${escapeHtml(stage.descriptor || stage.goalCopy || '')}</div>` +
          '  </div>' +
          '</a>';
      }).join('');

      stageGrid.querySelectorAll('.wordbuild-stage-card').forEach((button) => {
        const stageId = String(button.getAttribute('data-stage-id') || '');
        button.addEventListener('click', (event) => {
          event.preventDefault();
          selectStage(stageId, button);
        });
      });
    }

    function selectStage(stageId, button) {
      const nextStageId = String(stageId || '').trim();
      if (!nextStageId) return;
      state.selectedStageId = nextStageId;
      window.location.hash = `#${nextStageId}`;
      renderStageCards();
      if (button) pulseElement(button, 'is-selected', 260);
      playEffect(AUDIO_FILES.select, 0.72);
      startStage();
    }

    function renderIntro() {
      const stage = pickStage();
      if (!stage) return;
      introBadge.textContent = `${stage.bandLabel} · ${stage.schoolLevelLabel}`;
      introBadge.classList.remove('shell-hidden');
      introTitle.textContent = stage.title;
      introTitle.classList.remove('shell-hidden');
      introSubtitle.textContent = stage.goalCopy || '';
      introSubtitle.classList.remove('shell-hidden');
      introLevelCopy.textContent = `${stage.schoolLevelLabel || stage.bandLabel} 기준 · ${stage.descriptor || stage.grammarFocus || '문장 조립'}`;
      introMissionCopy.textContent = `${stage.questionPoolLabel || `문항풀 ${stage.questions.length}개`} 중 ${stage.runQuestionCount}문항을 무작위로 풀어요.`;
      introDescription.textContent = '섞인 어절 카드를 앞에서부터 순서대로 넣어 자연스러운 문장을 완성해 보세요.';
      introDescription.classList.remove('shell-hidden');
      renderShellStageLabel();
    }

    function buildQuestionRun(question, index) {
      const cards = shuffle((question.tokens || []).map((token, tokenIndex) => ({
        id: `${question.id}-card-${tokenIndex}`,
        value: token,
        tokenOrder: tokenIndex + 1,
        audioPath: Array.isArray(question.tokenAudioPaths) ? String(question.tokenAudioPaths[tokenIndex] || '') : '',
        toneIndex: tokenIndex % 4
      })));
      return {
        id: question.id,
        order: index,
        sentence: question.sentence,
        sentenceAudioPath: String(question.sentenceAudioPath || ''),
        tokens: question.tokens.slice(),
        acceptedTokenOrders: question.acceptedTokenOrders.slice(),
        cards,
        slots: Array.from({ length: question.tokens.length }, () => null),
        solved: false,
        nextReady: false,
        revealedAnswer: false,
        wrongAttempts: 0,
        draggedCardId: '',
        dragOverSlotIndex: null,
        successSlotIndex: null,
        errorPoolId: '',
        errorSlotIndex: null
      };
    }

    function startStage() {
      const stage = pickStage();
      if (!stage) return;
      clearNextPromptTimer();
      const selectedQuestions = sample(stage.questions, stage.runQuestionCount).map(buildQuestionRun);
      state.run = {
        stage,
        questions: selectedQuestions,
        questionIndex: 0,
        correctCount: 0,
        wrongCount: 0
      };
      completionFxPlayed = false;
      renderCurrentQuestion();
      setPhase('build');
    }

    function getCurrentQuestion() {
      if (!state.run) return null;
      return state.run.questions[state.run.questionIndex] || null;
    }

    function updateRunQuestion(nextQuestion) {
      if (!state.run || !nextQuestion) return;
      state.run.questions[state.run.questionIndex] = nextQuestion;
    }

    function getSolvedSlotCount(question) {
      return Array.isArray(question && question.slots)
        ? question.slots.filter(Boolean).length
        : 0;
    }

    function getNextSlotIndex(question) {
      if (!question || !Array.isArray(question.slots)) return -1;
      return question.slots.findIndex((slot) => slot === null);
    }

    function getSentenceTokenWidth(label) {
      const length = String(label || '').trim().length || 2;
      const width = clamp(92 + (length * 18), 120, 240);
      return `${width}px`;
    }

    function getCardTextStyle(value) {
      const length = String(value || '').trim().length;
      if (length >= 14) return { fontSize: '20px' };
      if (length >= 10) return { fontSize: '24px' };
      if (length >= 7) return { fontSize: '28px' };
      return { fontSize: '32px' };
    }

    function applyStyleMap(element, styleMap) {
      if (!element || !styleMap) return;
      Object.keys(styleMap).forEach((key) => {
        element.style[key] = styleMap[key];
      });
    }

    function renderCurrentQuestion() {
      const run = state.run;
      const question = getCurrentQuestion();
      if (!run || !question) return;

      questionTitle.textContent = '위 빈칸에 어절 카드를 하나씩 넣어 문장을 완성하세요.';
      questionProgressChip.textContent = `문항 ${run.questionIndex + 1} / ${run.questions.length}`;
      selectionChip.textContent = '';
      slotCountChip.textContent = `${getSolvedSlotCount(question)}/${Math.max(1, question.slots.length)}칸`;
      solvedPanel.classList.toggle('is-hidden', !question.solved || !question.nextReady);
      solvedKicker.textContent = question.revealedAnswer ? '이렇게 완성해요' : '잘했어요!';
      solvedSentence.textContent = question.sentence;
      nextQuestionButton.textContent = run.questionIndex < run.questions.length - 1 ? '다음 문제' : '결과 보기';
      nextQuestionButton.disabled = Boolean(question.solved && !question.nextReady);

      renderSlotRail(question);
      renderChoiceBoard(question);
    }

    function renderSlotRail(question) {
      const nextSlotIndex = getNextSlotIndex(question);
      sentenceSlotRail.innerHTML = '';

      question.slots.forEach((filledCard, slotIndex) => {
        const targetValue = question.tokens[slotIndex] || '';
        const slot = document.createElement('div');
        const isNext = nextSlotIndex === -1 ? !filledCard : slotIndex === nextSlotIndex;
        const isLocked = !filledCard && !isNext && nextSlotIndex !== -1;
        slot.className = 'sentence-slot';
        if (filledCard) slot.classList.add('is-filled');
        if (isNext && !filledCard) slot.classList.add('is-next');
        if (isLocked) slot.classList.add('is-locked');
        if (question.dragOverSlotIndex === slotIndex) slot.classList.add('is-dragover');
        if (question.errorSlotIndex === slotIndex && !filledCard) slot.classList.add('is-error');
        if (question.successSlotIndex === slotIndex) slot.classList.add('is-success');
        slot.style.minWidth = getSentenceTokenWidth(targetValue || '빈칸');

        if (filledCard) {
          const text = document.createElement('span');
          text.className = 'sentence-slot-text';
          text.textContent = filledCard.value;
          applyStyleMap(text, getCardTextStyle(filledCard.value));
          slot.appendChild(text);
        } else {
          const placeholder = document.createElement('span');
          placeholder.className = 'sentence-slot-placeholder';
          placeholder.textContent = isLocked ? '다음 칸 대기' : '여기에 놓기';
          slot.appendChild(placeholder);
        }

        if (!question.solved && isNext) {
          slot.addEventListener('dragover', (event) => {
            event.preventDefault();
            question.dragOverSlotIndex = slotIndex;
            renderSlotRail(question);
          });
          slot.addEventListener('dragleave', () => {
            question.dragOverSlotIndex = null;
            renderSlotRail(question);
          });
          slot.addEventListener('drop', (event) => {
            event.preventDefault();
            const draggedCardId = String(event.dataTransfer && event.dataTransfer.getData('text/plain') || question.draggedCardId || '');
            commitCard(draggedCardId, slotIndex);
          });
        }

        sentenceSlotRail.appendChild(slot);
      });
    }

    function renderChoiceBoard(question) {
      choiceBoard.innerHTML = '';
      question.cards.forEach((card) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sentence-choice-card';
        button.setAttribute('data-tone', String(card.toneIndex % 4));
        button.setAttribute('draggable', question.solved ? 'false' : 'true');
        if (question.errorPoolId === card.id) button.classList.add('is-error');
        if (question.draggedCardId === card.id) button.classList.add('is-dragging');

        const text = document.createElement('span');
        text.className = 'sentence-choice-text';
        text.textContent = card.value;
        applyStyleMap(text, getCardTextStyle(card.value));
        button.appendChild(text);

        if (!question.solved) {
          button.addEventListener('click', () => {
            commitCard(card.id);
          });
          button.addEventListener('dragstart', (event) => {
            question.draggedCardId = card.id;
            if (event.dataTransfer) {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', card.id);
            }
            renderChoiceBoard(question);
          });
          button.addEventListener('dragend', () => {
            question.draggedCardId = '';
            question.dragOverSlotIndex = null;
            renderChoiceBoard(question);
            renderSlotRail(question);
          });
        } else {
          button.disabled = true;
        }

        choiceBoard.appendChild(button);
      });
    }

    function clearQuestionFeedback(question) {
      if (!question) return;
      question.draggedCardId = '';
      question.dragOverSlotIndex = null;
      question.successSlotIndex = null;
      question.errorPoolId = '';
      question.errorSlotIndex = null;
    }

    function isSolvedOrder(question, slots) {
      if (!question || !Array.isArray(slots) || slots.some((slot) => !slot)) return false;
      const joined = slots.map((slot) => String(slot && slot.value || '').trim()).join('||');
      return (question.acceptedTokenOrders || []).some((order) => order.join('||') === joined);
    }

    function commitCard(cardId, targetSlotIndex) {
      const run = state.run;
      const question = getCurrentQuestion();
      if (!run || !question || question.solved) return;

      const normalizedCardId = String(cardId || '').trim();
      const nextSlotIndex = getNextSlotIndex(question);
      if (!normalizedCardId || nextSlotIndex === -1) return;
      if (Number.isInteger(targetSlotIndex) && targetSlotIndex !== nextSlotIndex) return;

      const cardIndex = question.cards.findIndex((card) => String(card.id || '') === normalizedCardId);
      if (cardIndex === -1) return;

      const selectedCard = question.cards[cardIndex];
      const expectedValue = String(question.tokens[nextSlotIndex] || '').trim();
      const selectedValue = String(selectedCard.value || '').trim();
      playNarration(selectedCard.audioPath, 1);

      if (selectedValue !== expectedValue) {
        question.wrongAttempts += 1;
        run.wrongCount += 1;
        question.errorPoolId = normalizedCardId;
        question.errorSlotIndex = nextSlotIndex;
        question.successSlotIndex = null;
        showSentenceWrongFeedback();
        playEffect(AUDIO_FILES.wrong, 0.96);
        spawnParticles('wrong', choiceBoard, 10);
        updateRunQuestion(question);
        renderCurrentQuestion();
        return;
      }

      question.slots[nextSlotIndex] = selectedCard;
      question.cards.splice(cardIndex, 1);
      clearQuestionFeedback(question);
      question.successSlotIndex = nextSlotIndex;
      const solved = isSolvedOrder(question, question.slots);
      if (solved) {
        question.solved = true;
        question.nextReady = false;
        run.correctCount += 1;
        showSentenceCompleteFeedback();
        playEffect(AUDIO_FILES.correct, 0.92);
        spawnParticles('correct', sentenceSlotRail, 18);
        window.setTimeout(() => playNarration(question.sentenceAudioPath, 1), 520);
        clearNextPromptTimer();
        nextPromptTimer = window.setTimeout(() => {
          nextPromptTimer = 0;
          if (!state.run || getCurrentQuestion() !== question || !question.solved) return;
          question.nextReady = true;
          updateRunQuestion(question);
          renderCurrentQuestion();
          try {
            nextQuestionButton.focus({ preventScroll: true });
          } catch (error) {
            void error;
          }
        }, NEXT_PROMPT_DELAY_MS);
      } else {
        playEffect(AUDIO_FILES.select, 0.72);
      }
      updateRunQuestion(question);
      renderCurrentQuestion();
    }

    function nextQuestion() {
      if (!state.run) return;
      const question = getCurrentQuestion();
      if (question && question.solved && !question.nextReady) return;
      clearNextPromptTimer();
      const currentIndex = state.run.questionIndex;
      if (currentIndex < state.run.questions.length - 1) {
        state.run.questionIndex += 1;
        renderCurrentQuestion();
        return;
      }
      finishStage();
    }

    function finishStage() {
      if (!state.run) return;
      clearNextPromptTimer();
      const run = state.run;
      completeTitle.textContent = `${run.stage.title} 완료!`;
      completeCorrectCount.textContent = `${run.correctCount}개`;
      completeWrongCount.textContent = `${run.wrongCount}회`;
      completeTotalCount.textContent = `${run.questions.length}문항`;
      if (!completionFxPlayed) {
        completionFxPlayed = true;
        playEffect(AUDIO_FILES.complete, 0.9);
      }
      setPhase('complete');
    }

    function clearNextPromptTimer() {
      if (!nextPromptTimer) return;
      window.clearTimeout(nextPromptTimer);
      nextPromptTimer = 0;
    }

    function showSentenceCompleteFeedback() {
      const overlay = window.HahaFeedbackOverlay || window.PlaylabFeedbackOverlay;
      if (overlay && typeof overlay.showQuestionComplete === 'function') {
        overlay.showQuestionComplete('correct', { durationMs: 760 });
      } else if (overlay && typeof overlay.correct === 'function') {
        overlay.correct({ durationMs: 760 });
      }
    }

    function showSentenceWrongFeedback() {
      const overlay = window.HahaFeedbackOverlay || window.PlaylabFeedbackOverlay;
      if (overlay && typeof overlay.showQuestionComplete === 'function') {
        overlay.showQuestionComplete('wrong', { durationMs: 760 });
      } else if (overlay && typeof overlay.wrong === 'function') {
        overlay.wrong({ durationMs: 760 });
      }
    }

    function pulseElement(element, className, timeout) {
      if (!element) return;
      element.classList.remove(className);
      void element.offsetWidth;
      element.classList.add(className);
      window.setTimeout(() => {
        element.classList.remove(className);
      }, timeout || 420);
    }

    function spawnParticles(tone, anchorElement, count) {
      if (!effectLayer || !anchorElement) return;
      const rect = anchorElement.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const palette = tone === 'wrong'
        ? ['#fb7185', '#fda4af', '#fecdd3']
        : ['#22c55e', '#34d399', '#67e8f9'];
      for (let index = 0; index < (count || 12); index += 1) {
        const particle = document.createElement('span');
        particle.className = 'wordbuild-effect-particle';
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.setProperty('--dx', `${(Math.random() * 180) - 90}px`);
        particle.style.setProperty('--dy', `${-40 - (Math.random() * 80)}px`);
        particle.style.setProperty('--particle-color', palette[index % palette.length]);
        effectLayer.appendChild(particle);
        window.setTimeout(() => particle.remove(), 1100);
      }
    }

    function getAudio(url) {
      const key = String(url || '').trim();
      if (!key) return null;
      if (!audioCache.has(key)) {
        const audio = new Audio(key);
        audio.preload = 'auto';
        audioCache.set(key, audio);
      }
      return audioCache.get(key);
    }

    function stopActiveAudio() {
      if (!activeAudio) return;
      try {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      } catch (error) {
        void error;
      }
      activeAudio = null;
    }

    function getNarrationAudio(url) {
      const key = String(url || '').trim();
      if (!key) return null;
      if (!narrationAudioCache.has(key)) {
        const audio = new Audio(key);
        audio.preload = 'auto';
        narrationAudioCache.set(key, audio);
      }
      return narrationAudioCache.get(key);
    }

    function stopNarrationAudio() {
      if (!activeNarrationAudio) return;
      try {
        activeNarrationAudio.pause();
        activeNarrationAudio.currentTime = 0;
      } catch (error) {
        void error;
      }
      activeNarrationAudio = null;
    }

    function resolveNarrationPath(audioPath) {
      const raw = String(audioPath || '').trim();
      if (!raw) return '';
      if (/^(https?:)?\/\//i.test(raw) || /^data:/i.test(raw) || /^blob:/i.test(raw)) return raw;
      if (raw.startsWith('/')) return raw;
      const normalized = raw.replace(/^\.\//, '').replace(/^\/+/, '');
      if (normalized.startsWith('sound/')) {
        if (window.location.protocol === 'file:') {
          return new URL(`../${normalized}`, window.location.href).href;
        }
        return `/${normalized}`;
      }
      return normalized;
    }

    function playNarration(audioPath, volume = 1) {
      const audio = getNarrationAudio(resolveNarrationPath(audioPath));
      if (!audio) return;
      stopNarrationAudio();
      activeNarrationAudio = audio;
      try {
        audio.currentTime = 0;
        audio.volume = clamp(Number(volume || 1) || 1, 0, 1);
        const playResult = audio.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(() => {});
        }
      } catch (error) {
        void error;
      }
    }

    function playEffect(url, volume) {
      const audio = getAudio(url);
      if (!audio) return;
      stopActiveAudio();
      activeAudio = audio;
      try {
        audio.currentTime = 0;
        audio.volume = clamp(Number(volume || 1) || 1, 0, 1);
        const playResult = audio.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(() => {});
        }
      } catch (error) {
        void error;
      }
    }

    function openConfirm(action) {
      state.pendingAction = String(action || '');
      if (state.pendingAction === 'exit') {
        confirmModalTitle.textContent = '학습 종료';
        confirmModalDesc.textContent = '현재 학습을 끝내고 이전 페이지로 돌아갈까요?';
        confirmModalOk.textContent = '학습 종료';
      } else {
        confirmModalTitle.textContent = '스테이지 선택';
        confirmModalDesc.textContent = '현재 학습을 끝내고 스테이지 목록으로 돌아갈까요?';
        confirmModalOk.textContent = '스테이지 선택';
      }
      confirmModal.classList.add('is-active');
      confirmModal.setAttribute('aria-hidden', 'false');
    }

    function closeConfirm() {
      state.pendingAction = '';
      confirmModal.classList.remove('is-active');
      confirmModal.setAttribute('aria-hidden', 'true');
    }

    function leavePage() {
      stopActiveAudio();
      stopNarrationAudio();
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = './';
    }

    function handleConfirmOk() {
      const action = state.pendingAction;
      closeConfirm();
      if (action === 'exit') {
        leavePage();
        return;
      }
      clearNextPromptTimer();
      state.run = null;
      renderStageCards();
      renderIntro();
      setPhase('select');
    }

    function bindEvents() {
      introStartButton.addEventListener('click', startStage);
      introBackButton.addEventListener('click', () => {
        clearNextPromptTimer();
        state.run = null;
        setPhase('select');
      });
      stageSelectButton.addEventListener('click', () => {
        if (state.phase === 'build') {
          openConfirm('stage-select');
          return;
        }
        clearNextPromptTimer();
        state.run = null;
        setPhase('select');
      });
      if (exitButton) {
        exitButton.addEventListener('click', () => {
          if (state.phase === 'build' || state.phase === 'intro' || state.phase === 'complete') {
            openConfirm('exit');
            return;
          }
          leavePage();
        });
      }
      nextQuestionButton.addEventListener('click', nextQuestion);
      completeRetryButton.textContent = '현재 단계 다시 풀기';
      completeStageButtonBack.textContent = '다른 단계 선택하기';
      completeRetryButton.addEventListener('click', () => {
        completionFxPlayed = false;
        startStage();
      });
      completeStageButtonBack.addEventListener('click', () => {
        clearNextPromptTimer();
        state.run = null;
        setPhase('select');
      });
      confirmModalCancel.addEventListener('click', closeConfirm);
      confirmModalOk.addEventListener('click', handleConfirmOk);
      confirmModal.addEventListener('click', (event) => {
        const target = event.target;
        if (target && target.hasAttribute('data-modal-close')) {
          closeConfirm();
        }
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && confirmModal.classList.contains('is-active')) {
          closeConfirm();
        }
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopActiveAudio();
          stopNarrationAudio();
        }
      });
      window.addEventListener('blur', () => {
        stopActiveAudio();
        stopNarrationAudio();
      }, { passive: true });
      window.addEventListener('pagehide', () => {
        stopActiveAudio();
        stopNarrationAudio();
      }, { passive: true });
      window.addEventListener('beforeunload', () => {
        stopActiveAudio();
        stopNarrationAudio();
      }, { passive: true });
    }

    function init() {
      if (!STAGES.length) {
        stageGrid.innerHTML = '<div class="wordbuild-error-box"><strong>문장 조립 데이터를 불러오지 못했어요.</strong><div>stage data is empty.</div></div>';
        return;
      }
      renderStageCards();
      renderIntro();
      setPhase('select');
      bindEvents();
    }

    init();
  } catch (error) {
    console.error('[cardlab-sentence] init failed', error);
  }
})();
