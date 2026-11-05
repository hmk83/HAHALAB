(function () {
  'use strict';

  try {
    const STAGE_COLORS = [
      { accent: '#f59e0b', soft: 'rgba(245, 158, 11, 0.16)' },
      { accent: '#f97316', soft: 'rgba(249, 115, 22, 0.16)' },
      { accent: '#fb923c', soft: 'rgba(251, 146, 60, 0.16)' },
      { accent: '#fbbf24', soft: 'rgba(251, 191, 36, 0.16)' },
      { accent: '#fdba74', soft: 'rgba(253, 186, 116, 0.16)' },
      { accent: '#f59e0b', soft: 'rgba(245, 158, 11, 0.18)' }
    ];
    const AUDIO_FILES = {
      select: '../sound/cardlab-idiom/select.mp3',
      correct: '../sound/cardlab-idiom/correct.mp3',
      wrong: '../sound/cardlab-idiom/error.mp3',
      complete: '../sound/cardlab-idiom/happy_victory.mp3'
    };
    const IDIOM_AUDIO_MAP = window.CARDLAB_IDIOM_AUDIO_MAP && typeof window.CARDLAB_IDIOM_AUDIO_MAP === 'object'
      ? window.CARDLAB_IDIOM_AUDIO_MAP
      : { answers: {}, meanings: {} };
    const RAW_STAGES = Array.isArray(window.HAHA_LAB_IDIOM_STAGE_TEMPLATES) ? window.HAHA_LAB_IDIOM_STAGE_TEMPLATES : [];
    const STAGES = RAW_STAGES.map(normalizeStage);
    const IDIOM_MEANING_MAP = buildMeaningMap(STAGES);

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
    const imageButton = document.getElementById('imageButton');
    const questionImage = document.getElementById('questionImage');
    const meaningCard = document.getElementById('meaningCard');
    const meaningText = document.getElementById('meaningText');
    const meaningAudioButton = document.getElementById('meaningAudioButton');
    const selectionChip = document.getElementById('selectionChip');
    const choiceBoard = document.getElementById('choiceBoard');
    const feedbackPanel = document.getElementById('feedbackPanel');
    const feedbackBadge = document.getElementById('feedbackBadge');
    const feedbackText = document.getElementById('feedbackText');
    const solvedPanel = document.getElementById('solvedPanel');
    const solvedAnswer = document.getElementById('solvedAnswer');
    const solvedMeaning = document.getElementById('solvedMeaning');
    const answerAudioButton = document.getElementById('answerAudioButton');
    const nextQuestionButton = document.getElementById('nextQuestionButton');
    const completeTitle = document.getElementById('completeTitle');
    const completeCorrectCount = document.getElementById('completeCorrectCount');
    const completeWrongCount = document.getElementById('completeWrongCount');
    const completeTotalCount = document.getElementById('completeTotalCount');
    const completeStageButtonBack = document.getElementById('completeStageButtonBack');
    const completeRetryButton = document.getElementById('completeRetryButton');
    const imageModal = document.getElementById('imageModal');
    const imageModalImage = document.getElementById('imageModalImage');
    const imageModalCaption = document.getElementById('imageModalCaption');
    const imageModalClose = document.getElementById('imageModalClose');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalDesc = document.getElementById('confirmModalDesc');
    const confirmModalOk = document.getElementById('confirmModalOk');
    const confirmModalCancel = document.getElementById('confirmModalCancel');
    const effectLayer = document.getElementById('idiomEffectLayer');

    if (!stageSelectView || !introView || !buildView || !completeView || !stageGrid || !shellTitle || !shellStageLabel || !stageSelectButton || !helpButton || !introBadge || !introTitle || !introSubtitle || !introLevelCopy || !introMissionCopy || !introDescription || !introStartButton || !introBackButton || !questionTitle || !questionProgressChip || !imageButton || !questionImage || !meaningCard || !meaningText || !meaningAudioButton || !selectionChip || !choiceBoard || !feedbackPanel || !feedbackBadge || !feedbackText || !solvedPanel || !solvedAnswer || !solvedMeaning || !answerAudioButton || !nextQuestionButton || !completeTitle || !completeCorrectCount || !completeWrongCount || !completeTotalCount || !completeStageButtonBack || !completeRetryButton || !imageModal || !imageModalImage || !imageModalCaption || !imageModalClose || !confirmModal || !confirmModalTitle || !confirmModalDesc || !confirmModalOk || !confirmModalCancel || !effectLayer) {
      return;
    }

    const narrationCache = new Map();
    const effectCache = new Map();
    let activeNarrationAudio = null;
    let activeEffectAudio = null;
    let completionFxPlayed = false;
    let feedbackToastTimer = 0;

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
        var temp = copied[index];
        copied[index] = copied[swapIndex];
        copied[swapIndex] = temp;
      }
      return copied;
    }

    function sample(list, count) {
      return shuffle(list).slice(0, Math.max(0, Math.min((Array.isArray(list) ? list.length : 0), count)));
    }

    function normalizeImagePath(value) {
      const text = String(value || '').trim();
      if (!text) return '';
      const remoteMatch = text.match(/\/playlab\/images\/2cuts\/([^/?#]+)$/i);
      if (remoteMatch) {
        return `images/2cuts/${remoteMatch[1]}`;
      }
      if (text.indexOf('images/2cuts/') !== -1) {
        return text.slice(text.indexOf('images/2cuts/'));
      }
      return text;
    }

    function normalizeQuestion(question, index) {
      return {
        id: String(question && question.id || `idiom-question-${String(index + 1).padStart(2, '0')}`),
        answer: String(question && (question.answer || question.word || question.title) || '').trim(),
        word: String(question && (question.word || question.answer || question.title) || '').trim(),
        title: String(question && (question.title || question.answer || question.word) || '').trim(),
        meaning: String(question && question.meaning || '').trim(),
        imageUrl: normalizeImagePath(question && question.imageUrl || ''),
        choices: Array.isArray(question && question.choices) ? question.choices.map(function (choice, choiceIndex) {
          return {
            id: String(choice && choice.id || `idiom-choice-${index}-${choiceIndex}`),
            value: String(choice && choice.value || '').trim()
          };
        }).filter(function (choice) {
          return Boolean(choice.value);
        }) : []
      };
    }

    function normalizeStage(stage, index) {
      const fallback = STAGE_COLORS[index % STAGE_COLORS.length];
      return {
        id: String(stage && stage.id || `idiom-${String(index + 1).padStart(2, '0')}`),
        title: String(stage && stage.title || `스테이지 ${index + 1}`),
        schoolLevelLabel: String(stage && stage.schoolLevelLabel || ''),
        bandLabel: String(stage && stage.bandLabel || stage && stage.title || ''),
        descriptor: String(stage && stage.descriptor || ''),
        grammarFocus: String(stage && stage.grammarFocus || ''),
        goalCopy: String(stage && stage.goalCopy || ''),
        questionPoolLabel: String(stage && stage.questionPoolLabel || ''),
        runQuestionCount: clamp(Number(stage && stage.runQuestionCount || 6) || 6, 4, 10),
        questions: Array.isArray(stage && stage.questions) ? stage.questions.map(normalizeQuestion) : [],
        accent: String(stage && stage.accent || fallback.accent),
        soft: String(stage && stage.soft || fallback.soft)
      };
    }

    function buildMeaningMap(stages) {
      const registry = new Map();
      (Array.isArray(stages) ? stages : []).forEach(function (stage) {
        (Array.isArray(stage.questions) ? stage.questions : []).forEach(function (question) {
          const answer = String(question.answer || '').trim();
          const meaning = String(question.meaning || '').trim();
          if (!answer || !meaning || registry.has(answer)) return;
          registry.set(answer, meaning);
        });
      });
      return registry;
    }

    function buildQuestionRun(question, index) {
      return {
        id: question.id,
        order: index,
        answer: question.answer,
        word: question.word,
        title: question.title,
        meaning: question.meaning,
        imageUrl: question.imageUrl,
        choices: shuffle(question.choices).slice(),
        selectedChoiceId: '',
        successChoiceId: '',
        errorChoiceId: '',
        solved: false,
        wrongAttempts: 0
      };
    }

    function getInitialStageId() {
      const hashStageId = String(window.location.hash || '').replace(/^#/, '').trim();
      return STAGES.some(function (stage) { return stage.id === hashStageId; })
        ? hashStageId
        : (STAGES[0] ? STAGES[0].id : '');
    }

    function pickStage() {
      return STAGES.find(function (stage) { return stage.id === state.selectedStageId; }) || STAGES[0] || null;
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
      shellTitle.classList.add('shell-hidden');
      if (nextPhase !== 'select') renderShellStageLabel();
    }

    function renderShellStageLabel() {
      const stage = pickStage();
      shellStageLabel.textContent = stage
        ? `${stage.schoolLevelLabel || stage.bandLabel} · ${stage.title}`
        : '스테이지 준비중';
    }

    function renderStageCards() {
      stageGrid.innerHTML = STAGES.map(function (stage) {
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

      stageGrid.querySelectorAll('.wordbuild-stage-card').forEach(function (button) {
        const stageId = String(button.getAttribute('data-stage-id') || '');
        button.addEventListener('click', function (event) {
          event.preventDefault();
          selectStage(stageId, button);
        });
      });
    }

    function selectStage(stageId, button) {
      const nextStageId = String(stageId || '').trim();
      if (!nextStageId) return;
      stopAllAudio();
      state.selectedStageId = nextStageId;
      window.location.hash = `#${nextStageId}`;
      renderStageCards();
      if (button) pulseElement(button, 'is-selected', 240);
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
      introLevelCopy.textContent = `${stage.schoolLevelLabel || stage.bandLabel} 기준 · ${stage.descriptor || stage.grammarFocus || '속담·관용·사자성어'}`;
      introMissionCopy.textContent = `${stage.questionPoolLabel || `문항풀 ${stage.questions.length}개`} 중 ${stage.runQuestionCount}문항을 무작위로 풀어요.`;
      introDescription.textContent = '두 컷 장면과 뜻풀이를 함께 읽고 가장 알맞은 표현을 골라보세요.';
      introDescription.classList.remove('shell-hidden');
      renderShellStageLabel();
    }

    function startStage() {
      const stage = pickStage();
      if (!stage) return;
      stopAllAudio();
      const selectedQuestions = sample(stage.questions, stage.runQuestionCount).map(buildQuestionRun);
      state.run = {
        stage: stage,
        questions: selectedQuestions,
        questionIndex: 0,
        correctCount: 0,
        wrongCount: 0
      };
      completionFxPlayed = false;
      renderQuestion();
      setPhase('build');
    }

    function getCurrentQuestion() {
      if (!state.run) return null;
      return state.run.questions[state.run.questionIndex] || null;
    }

    function renderQuestion() {
      const run = state.run;
      const question = getCurrentQuestion();
      if (!run || !question) return;

      questionTitle.textContent = '두 컷 장면과 뜻풀이를 읽고 알맞은 표현을 골라보세요.';
      questionProgressChip.textContent = `문항 ${run.questionIndex + 1} / ${run.questions.length}`;
      questionImage.src = question.imageUrl;
      questionImage.alt = question.answer || '속담·관용·사자성어 장면';
      question.meaningRevealed = false;
      setMeaningVisibility(false);
      selectionChip.textContent = question.solved ? '정답을 확인했어요.' : '정답이라고 생각하는 표현을 골라 보세요.';
      closeAnswerModal();
      hideWrongHintToast();
      solvedAnswer.textContent = question.answer;
      solvedMeaning.textContent = question.meaning;
      answerAudioButton.disabled = !getAnswerAudioPath(question) && !getMeaningAudioPath(question);
      nextQuestionButton.textContent = run.questionIndex < run.questions.length - 1 ? '다음 문제' : '결과 보기';

      renderChoiceBoard(question);
    }

    function setMeaningVisibility(isVisible) {
      const question = getCurrentQuestion();
      const hasMeaning = !!(question && question.meaning);
      const nextVisible = !!(isVisible && hasMeaning);

      if (question) {
        question.meaningRevealed = nextVisible;
      }
      meaningCard.classList.toggle('is-collapsed', !nextVisible);
      meaningCard.classList.toggle('is-revealed', nextVisible);
      meaningCard.setAttribute('aria-expanded', String(nextVisible));
      meaningCard.setAttribute('aria-label', nextVisible ? '뜻풀이' : '뜻풀이 보기');
      meaningText.textContent = nextVisible
        ? question.meaning
        : '뜻풀이 보기';
      meaningAudioButton.hidden = !nextVisible;
      meaningAudioButton.setAttribute('aria-hidden', String(!nextVisible));
      meaningAudioButton.disabled = !nextVisible || !getMeaningAudioPath(question);
    }

    function renderChoiceBoard(question) {
      choiceBoard.innerHTML = '';
      question.choices.forEach(function (choice, index) {
        const isSuccess = question.successChoiceId === choice.id;
        const isError = question.errorChoiceId === choice.id;
        const isSelected = question.selectedChoiceId === choice.id;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'idiom-choice-card';
        if (isSelected) button.classList.add('is-selected');
        if (isSuccess) button.classList.add('is-success');
        if (isError) button.classList.add('is-error');
        button.disabled = question.solved;

        const chip = document.createElement('span');
        chip.className = 'idiom-choice-index';
        chip.textContent = `${index + 1}.`;
        button.appendChild(chip);

        const value = document.createElement('span');
        value.className = 'idiom-choice-value';
        value.textContent = choice.value;
        button.appendChild(value);

        button.addEventListener('click', function () {
          commitChoice(choice.id);
        });
        choiceBoard.appendChild(button);
      });
    }

    async function commitChoice(choiceId) {
      const run = state.run;
      const question = getCurrentQuestion();
      if (!run || !question || question.solved) return;

      const selectedChoice = question.choices.find(function (choice) {
        return choice.id === choiceId;
      });
      if (!selectedChoice) return;

      stopAllAudio();
      const selectedValue = String(selectedChoice.value || '').trim();
      const isCorrect = selectedValue === question.answer;
      question.selectedChoiceId = choiceId;
      question.successChoiceId = isCorrect ? choiceId : '';
      question.errorChoiceId = isCorrect ? '' : choiceId;
      renderChoiceBoard(question);

      if (!isCorrect) {
        question.wrongAttempts += 1;
        run.wrongCount += 1;
        showQuestionFeedback('wrong');
        showWrongHintToast(buildChoiceMeaningText(selectedValue));
        playEffect(AUDIO_FILES.wrong, 0.96);
        await playNarrationSequence([getAnswerAudioPathByValue(selectedValue)]);
        return;
      }

      question.solved = true;
      run.correctCount += 1;
      selectionChip.textContent = '정답을 확인했어요.';
      hideWrongHintToast();
      showQuestionFeedback('correct');
      renderChoiceBoard(question);
      playEffect(AUDIO_FILES.correct, 0.92);
      spawnParticles('correct', choiceBoard, 16);
      window.setTimeout(openAnswerModal, 430);
    }

    function buildChoiceMeaningText(value) {
      const text = String(value || '').trim();
      if (!text) return '뜻풀이를 다시 읽고 장면과 가장 잘 맞는 표현을 골라보세요.';
      const meaning = String(IDIOM_MEANING_MAP.get(text) || '').trim();
      return meaning
        ? `'${text}'는 ${meaning}`
        : `'${text}'의 뜻을 다시 떠올려 보고 장면과 맞는 표현을 골라보세요.`;
    }

    function showQuestionFeedback(kind) {
      const overlay = window.PlaylabFeedbackOverlay || window.HahaFeedbackOverlay;
      if (!overlay || typeof overlay.showQuestionComplete !== 'function') return;
      overlay.showQuestionComplete(kind === 'correct' ? 'correct' : 'wrong', {
        sound: false,
        durationMs: kind === 'correct' ? 760 : 820
      });
    }

    function hideWrongHintToast() {
      window.clearTimeout(feedbackToastTimer);
      feedbackPanel.classList.add('is-hidden');
    }

    function showWrongHintToast(message) {
      window.clearTimeout(feedbackToastTimer);
      feedbackBadge.textContent = '오답 힌트';
      feedbackText.textContent = message || '뜻풀이를 다시 읽고 장면과 가장 잘 맞는 표현을 골라보세요.';
      feedbackPanel.classList.remove('is-hidden');
      feedbackToastTimer = window.setTimeout(hideWrongHintToast, 3600);
    }

    function nextQuestion() {
      if (!state.run) return;
      hideWrongHintToast();
      stopAllAudio();
      closeAnswerModal();
      if (state.run.questionIndex < state.run.questions.length - 1) {
        state.run.questionIndex += 1;
        renderQuestion();
        return;
      }
      finishStage();
    }

    function finishStage() {
      if (!state.run) return;
      hideWrongHintToast();
      stopAllAudio();
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

    function getCachedAudio(cache, url) {
      const key = String(url || '').trim();
      if (!key) return null;
      if (!cache.has(key)) {
        const audio = new Audio(key);
        audio.preload = 'auto';
        cache.set(key, audio);
      }
      return cache.get(key);
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

    function stopEffectAudio() {
      if (!activeEffectAudio) return;
      try {
        activeEffectAudio.pause();
        activeEffectAudio.currentTime = 0;
      } catch (error) {
        void error;
      }
      activeEffectAudio = null;
    }

    function stopAllAudio() {
      stopNarrationAudio();
      stopEffectAudio();
    }

    function playNarration(url) {
      const audio = getCachedAudio(narrationCache, url);
      if (!audio) return Promise.resolve(false);
      stopNarrationAudio();
      activeNarrationAudio = audio;
      return new Promise(function (resolve) {
        let settled = false;
        const finish = function (success) {
          if (settled) return;
          settled = true;
          if (activeNarrationAudio === audio) {
            activeNarrationAudio = null;
          }
          resolve(Boolean(success));
        };
        audio.onended = function () { finish(true); };
        audio.onerror = function () { finish(false); };
        try {
          audio.currentTime = 0;
          const playResult = audio.play();
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
              finish(false);
            });
          }
        } catch (error) {
          void error;
          finish(false);
        }
      });
    }

    async function playNarrationSequence(urls) {
      stopNarrationAudio();
      const queue = (Array.isArray(urls) ? urls : []).map(function (url) {
        return String(url || '').trim();
      }).filter(Boolean);
      if (!queue.length) return false;
      for (let index = 0; index < queue.length; index += 1) {
        const played = await playNarration(queue[index]);
        if (!played) return false;
        if (index < queue.length - 1) {
          await new Promise(function (resolve) {
            window.setTimeout(resolve, 140);
          });
        }
      }
      return true;
    }

    function getAnswerAudioPath(question) {
      const answer = String(question && question.answer || '').trim();
      return String(IDIOM_AUDIO_MAP.answers && IDIOM_AUDIO_MAP.answers[answer] || '').trim();
    }

    function getAnswerAudioPathByValue(value) {
      const answer = String(value || '').trim();
      return String(IDIOM_AUDIO_MAP.answers && IDIOM_AUDIO_MAP.answers[answer] || '').trim();
    }

    function getMeaningAudioPath(question) {
      const meaning = String(question && question.meaning || '').trim();
      return String(IDIOM_AUDIO_MAP.meanings && IDIOM_AUDIO_MAP.meanings[meaning] || '').trim();
    }

    function playEffect(url, volume) {
      const audio = getCachedAudio(effectCache, url);
      if (!audio) return;
      stopEffectAudio();
      activeEffectAudio = audio;
      try {
        audio.currentTime = 0;
        audio.volume = clamp(Number(volume || 1) || 1, 0, 1);
        const playResult = audio.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      } catch (error) {
        void error;
      }
    }

    function playEffectSequence(url, volume) {
      const audio = getCachedAudio(effectCache, url);
      if (!audio) return Promise.resolve(false);
      stopEffectAudio();
      activeEffectAudio = audio;
      return new Promise(function (resolve) {
        let settled = false;
        const finish = function (success) {
          if (settled) return;
          settled = true;
          if (activeEffectAudio === audio) {
            activeEffectAudio = null;
          }
          resolve(Boolean(success));
        };
        audio.onended = function () { finish(true); };
        audio.onerror = function () { finish(false); };
        try {
          audio.currentTime = 0;
          audio.volume = clamp(Number(volume || 1) || 1, 0, 1);
          const playResult = audio.play();
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
              finish(false);
            });
          }
        } catch (error) {
          void error;
          finish(false);
        }
      });
    }

    function spawnParticles(tone, anchorElement, count) {
      if (!effectLayer || !anchorElement) return;
      const rect = anchorElement.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const palette = tone === 'wrong'
        ? ['#fb7185', '#fda4af', '#fecdd3']
        : ['#34d399', '#6ee7b7', '#fde68a'];
      for (let index = 0; index < (count || 12); index += 1) {
        const particle = document.createElement('span');
        particle.className = 'wordbuild-effect-particle';
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.setProperty('--dx', `${(Math.random() * 180) - 90}px`);
        particle.style.setProperty('--dy', `${-40 - (Math.random() * 90)}px`);
        particle.style.setProperty('--particle-color', palette[index % palette.length]);
        effectLayer.appendChild(particle);
        window.setTimeout(function () {
          particle.remove();
        }, 1100);
      }
    }

    function pulseElement(element, className, timeout) {
      if (!element) return;
      element.classList.remove(className);
      void element.offsetWidth;
      element.classList.add(className);
      window.setTimeout(function () {
        element.classList.remove(className);
      }, timeout || 420);
    }

    function openImageModal() {
      const question = getCurrentQuestion();
      if (!question) return;
      stopAllAudio();
      imageModalImage.src = question.imageUrl;
      imageModalImage.alt = question.answer || '속담·관용·사자성어 장면 확대';
      imageModalCaption.textContent = question.meaning;
      imageModal.classList.add('is-active');
      imageModal.setAttribute('aria-hidden', 'false');
    }

    function closeImageModal() {
      stopAllAudio();
      imageModal.classList.remove('is-active');
      imageModal.setAttribute('aria-hidden', 'true');
    }

    function openAnswerModal() {
      const question = getCurrentQuestion();
      if (!question || !question.solved) return;
      solvedPanel.classList.add('is-active');
      solvedPanel.setAttribute('aria-hidden', 'false');
    }

    function closeAnswerModal() {
      solvedPanel.classList.remove('is-active');
      solvedPanel.setAttribute('aria-hidden', 'true');
    }

    function openConfirm(action) {
      stopAllAudio();
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
      stopAllAudio();
      state.pendingAction = '';
      confirmModal.classList.remove('is-active');
      confirmModal.setAttribute('aria-hidden', 'true');
    }

    function leavePage() {
      stopAllAudio();
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
      state.run = null;
      renderStageCards();
      renderIntro();
      setPhase('select');
    }

    function bindEvents() {
      introStartButton.addEventListener('click', startStage);
      introBackButton.addEventListener('click', function () {
        stopAllAudio();
        state.run = null;
        setPhase('select');
      });
      stageSelectButton.addEventListener('click', function () {
        if (state.phase === 'build') {
          openConfirm('stage-select');
          return;
        }
        stopAllAudio();
        state.run = null;
        setPhase('select');
      });
      if (exitButton) {
        exitButton.addEventListener('click', function () {
          if (state.phase === 'build' || state.phase === 'intro' || state.phase === 'complete') {
            openConfirm('exit');
            return;
          }
          leavePage();
        });
      }
      imageButton.addEventListener('click', openImageModal);
      imageModalClose.addEventListener('click', closeImageModal);
      imageModal.addEventListener('click', function (event) {
        const target = event.target;
        if (target && target.hasAttribute('data-image-close')) {
          closeImageModal();
        }
      });
      meaningAudioButton.addEventListener('click', function () {
        const question = getCurrentQuestion();
        if (!question || !question.meaningRevealed) return;
        stopAllAudio();
        playNarrationSequence([getMeaningAudioPath(question)]);
      });
      meaningCard.addEventListener('click', function (event) {
        const target = event.target;
        if (target && typeof target.closest === 'function' && target.closest('button')) return;
        const question = getCurrentQuestion();
        if (!question || question.meaningRevealed) return;
        setMeaningVisibility(true);
      });
      meaningCard.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const question = getCurrentQuestion();
        if (!question || question.meaningRevealed) return;
        event.preventDefault();
        setMeaningVisibility(true);
      });
      answerAudioButton.addEventListener('click', function () {
        const question = getCurrentQuestion();
        if (!question) return;
        stopAllAudio();
        playNarrationSequence([
          getAnswerAudioPath(question),
          getMeaningAudioPath(question)
        ]);
      });
      nextQuestionButton.addEventListener('click', nextQuestion);
      completeRetryButton.addEventListener('click', function () {
        stopAllAudio();
        completionFxPlayed = false;
        startStage();
      });
      completeStageButtonBack.addEventListener('click', function () {
        stopAllAudio();
        state.run = null;
        setPhase('select');
      });
      confirmModalCancel.addEventListener('click', closeConfirm);
      confirmModalOk.addEventListener('click', handleConfirmOk);
      confirmModal.addEventListener('click', function (event) {
        const target = event.target;
        if (target && target.hasAttribute('data-modal-close')) {
          closeConfirm();
        }
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && imageModal.classList.contains('is-active')) {
          closeImageModal();
          return;
        }
        if (event.key === 'Escape' && solvedPanel.classList.contains('is-active')) {
          event.preventDefault();
          return;
        }
        if (event.key === 'Escape' && confirmModal.classList.contains('is-active')) {
          closeConfirm();
        }
      });
      document.addEventListener('click', function (event) {
        const target = event.target;
        if (!target) return;
        if (target === meaningAudioButton || target === answerAudioButton) return;
        stopAllAudio();
      }, true);
      window.addEventListener('pagehide', stopAllAudio);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          stopAllAudio();
        }
      });
    }

    function init() {
      if (!STAGES.length) {
        stageGrid.innerHTML = '<div class="wordbuild-error-box"><strong>속담·관용·사자성어 데이터를 불러오지 못했어요.</strong><div>stage data is empty.</div></div>';
        return;
      }
      renderStageCards();
      renderIntro();
      setPhase('select');
      bindEvents();
    }

    init();
  } catch (error) {
    console.error('[cardlab-idiom] init failed', error);
  }
})();
