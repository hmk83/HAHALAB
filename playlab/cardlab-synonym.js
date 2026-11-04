(function () {
  'use strict';

  try {
    const PAGE_CONFIG = window.CARDLAB_SYNONYM_PAGE_CONFIG || {};
    const STAGES = Array.isArray(window.HAHA_LAB_SYNONYM_STAGE_TEMPLATES)
      ? window.HAHA_LAB_SYNONYM_STAGE_TEMPLATES.map(normalizeStage).filter(Boolean)
      : [];

    const AUDIO_FILES = {
      select: '../sound/select.mp3',
      correct: '../sound/correct.mp3',
      wrong: '../sound/error.mp3',
      complete: '../sound/happy_victory.mp3'
    };
    const SYNONYM_VOICE_DIR = '../sound/cardlab-synonym/';
    const SESSION_STATE_KEY = 'cardlabSynonymCompareStateV1';
    const COMPARE_PAGE_PATH = 'cardlab-synonym-compare.html';

    const stageSelectView = document.getElementById('stageSelectView');
    const buildView = document.getElementById('buildView');
    const completeView = document.getElementById('completeView');
    const stageGrid = document.getElementById('stageGrid');
    const shellTitle = document.getElementById('shellTitle');
    const shellStageLabel = document.getElementById('shellStageLabel');
    const stageSelectButton = document.getElementById('stageSelectButton');
    const helpButton = document.getElementById('helpButton');
    const exitButton = document.getElementById('exitButton');
    const questionKindChip = document.getElementById('questionKindChip');
    const questionTitle = document.getElementById('questionTitle');
    const questionPrompt = document.getElementById('questionPrompt');
    const promptWord = document.getElementById('promptWord');
    const posChip = document.getElementById('posChip');
    const questionProgressChip = document.getElementById('questionProgressChip');
    const choiceBoard = document.getElementById('choiceBoard');
    const questionPanel = document.getElementById('questionPanel');
    const completeTitle = document.getElementById('completeTitle');
    const completeSummary = document.getElementById('completeSummary');
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

    if (!stageSelectView || !buildView || !completeView || !stageGrid || !shellTitle || !shellStageLabel || !stageSelectButton || !helpButton || !questionKindChip || !questionTitle || !questionPrompt || !promptWord || !posChip || !questionProgressChip || !choiceBoard || !questionPanel || !completeTitle || !completeSummary || !completeCorrectCount || !completeWrongCount || !completeTotalCount || !completeStageButtonBack || !completeRetryButton || !confirmModal || !confirmModalTitle || !confirmModalDesc || !confirmModalOk || !confirmModalCancel) {
      return;
    }

    const audioCache = new Map();
    const choiceAudioCache = new Map();
    const choiceVoiceIndex = buildChoiceVoiceIndex();
    let activeEffectAudio = null;
    let activeChoiceAudio = null;
    let advanceTimer = null;
    let completionFxPlayed = false;

    const state = {
      phase: 'select',
      selectedStageId: getInitialStageId(),
      selectionBackground: '',
      learningBackground: '',
      pendingModalAction: '',
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

    function normalizeText(value) {
      return String(value == null ? '' : value)
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    }

    function getKindDisplayLabel(kind) {
      return String(kind || '').trim() === '반의어' ? '반대인 낱말' : '같은 낱말';
    }

    function showAnswerFeedback(isCorrect) {
      const overlay = window.PlaylabFeedbackOverlay || window.HahaFeedbackOverlay;
      if (overlay && typeof overlay.showQuestionComplete === 'function') {
        overlay.showQuestionComplete(isCorrect ? 'correct' : 'wrong', {
          sound: false,
          durationMs: 720
        });
      }
    }

    function shuffle(list) {
      const arr = Array.isArray(list) ? list.slice() : [];
      for (let index = arr.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [arr[index], arr[swap]] = [arr[swap], arr[index]];
      }
      return arr;
    }

    function sample(list, count) {
      return shuffle(list).slice(0, Math.max(0, Math.min(count, list.length)));
    }

    function uniqueWords(items = []) {
      const seen = new Set();
      return (Array.isArray(items) ? items : [])
        .map((item) => String(item || '').trim())
        .filter((item) => {
          if (!item || seen.has(item)) return false;
          seen.add(item);
          return true;
        });
    }

    function normalizeStage(stage, index = 0) {
      const title = String(stage?.title || stage?.schoolLevelLabel || `스테이지 ${String(index + 1).padStart(2, '0')}`).trim();
      const schoolLevelLabel = String(stage?.schoolLevelLabel || title).trim();
      const bandLabel = String(stage?.bandLabel || schoolLevelLabel.replace(/\s*\d+단계$/, '') || '').trim();
      const accentPalette = ['#6fc7ff', '#7ad7a8', '#83d6ff', '#f4c75d', '#ffb347', '#ff9f1a', '#ff8fa3', '#82c1ff'];
      const accent = String(stage?.accent || accentPalette[index % accentPalette.length]);
      const soft = String(stage?.soft || 'rgba(255, 243, 213, 0.68)');

      return {
        id: String(stage?.id || `synonym-${String(index + 1).padStart(2, '0')}`),
        title,
        schoolLevelLabel,
        bandLabel,
        questionPoolLabel: String(stage?.questionPoolLabel || `문항풀 ${Array.isArray(stage?.questions) ? stage.questions.length : 0}개`),
        synonymCount: Number(stage?.synonymCount || 0) || 0,
        antonymCount: Number(stage?.antonymCount || 0) || 0,
        questions: Array.isArray(stage?.questions) ? stage.questions.map(normalizeQuestion) : [],
        accent,
        soft
      };
    }

    function normalizeQuestion(question, index = 0) {
      const answer = String(question?.answer || '').trim();
      const wrongs = uniqueWords(
        Array.isArray(question?.choices)
          ? question.choices
              .map((choice) => String(choice?.value || '').trim())
              .filter((value) => value && value !== answer)
          : Array.isArray(question?.wrongAnswers)
            ? question.wrongAnswers
            : []
      );
      const choiceValues = uniqueWords([answer, ...wrongs]).slice(0, 6);
      const kind = String(question?.area || question?.kind || '').trim() || '유의어';
      const promptWord = String(question?.promptWord || question?.prompt || '').trim();
      const pos = String(question?.pos || question?.partOfSpeech || '').trim();
      const questionId = String(question?.id || `synonym-q-${String(index + 1).padStart(2, '0')}`);

      return {
        id: questionId,
        kind,
        pos,
        promptWord,
        promptText: String(question?.promptText || '').trim() || (kind === '반의어'
          ? '뜻이 반대인 낱말을 고르세요.'
          : '뜻이 같은 낱말을 고르세요.'),
        titleText: String(question?.titleText || '').trim() || '알맞은 낱말을 골라 보세요.',
        answer,
        choices: shuffle(choiceValues).map((value, choiceIndex) => ({
          id: `${questionId}-choice-${choiceIndex}`,
          value,
          isCorrect: value === answer
        })),
        selectedChoiceId: '',
        errorChoiceId: '',
        solved: false,
        filledWord: ''
      };
    }

    function getInitialStageId() {
      const hashStageId = (window.location.hash || '').replace(/^#/, '').trim();
      return STAGES.some((stage) => stage.id === hashStageId) ? hashStageId : (STAGES[0] && STAGES[0].id) || '';
    }

    function pickStage() {
      return STAGES.find((stage) => stage.id === state.selectedStageId) || STAGES[0] || null;
    }

    function pickSelectionBackground() {
      return 'images/bg/s-space-bg.webp';
    }

    function pickLearningBackground() {
      const fallback = document.documentElement.dataset.learningBg || '';
      const backgrounds = [fallback, 'images/bg/city-bg.webp', 'images/bg/sea-bg.webp', 'images/bg/animal-bg.webp'].filter(Boolean);
      return backgrounds[Math.floor(Math.random() * backgrounds.length)] || backgrounds[0] || '';
    }

    function setShellBackground(imagePath) {
      if (!imagePath) return;
      const value = `url('${imagePath}')`;
      document.documentElement.style.setProperty('--shell-page-bg', value);
      document.documentElement.style.setProperty('--shell-intro-bg', value);
    }

    function stopAudio() {
      if (advanceTimer) {
        window.clearTimeout(advanceTimer);
        advanceTimer = null;
      }
      if (activeEffectAudio) {
        try {
          activeEffectAudio.pause();
          activeEffectAudio.currentTime = 0;
        } catch (_error) {
          // ignore
        }
        activeEffectAudio = null;
      }
      if (activeChoiceAudio) {
        try {
          activeChoiceAudio.pause();
          activeChoiceAudio.currentTime = 0;
        } catch (_error) {
          // ignore
        }
        activeChoiceAudio = null;
      }
    }

    function playSound(path) {
      const normalized = String(path || '').trim();
      if (!normalized) return;
      if (activeEffectAudio) {
        try {
          activeEffectAudio.pause();
          activeEffectAudio.currentTime = 0;
        } catch (_error) {
          // ignore
        }
        activeEffectAudio = null;
      }
      let audio = audioCache.get(normalized);
      if (!audio) {
        audio = new Audio(normalized);
        audio.preload = 'auto';
        audioCache.set(normalized, audio);
      }
      activeEffectAudio = audio;
      audio.play().catch(() => {});
    }

    function buildChoiceVoiceIndex() {
      const soundManifest = window.CARDLAB_SOUND_MANIFEST;
      const manifestItems = Array.isArray(soundManifest?.items) ? soundManifest.items : [];
      if (manifestItems.length) {
        return new Map(
          manifestItems
            .map((item) => [
              normalizeText(item?.normalizedText || item?.text || item?.word || ''),
              Number(item?.sequence)
            ])
            .filter(([word, sequence]) => word && Number.isFinite(sequence) && sequence > 0)
        );
      }
      const manifestMap = window.CARDLAB_AUDIO_MAPS && window.CARDLAB_AUDIO_MAPS.synonymChoiceIndex;
      if (manifestMap && typeof manifestMap === 'object') {
        return new Map(
          Object.entries(manifestMap)
            .map(([word, sequence]) => [normalizeText(word), Number(sequence)])
            .filter(([word, sequence]) => word && Number.isFinite(sequence) && sequence > 0)
        );
      }
      const mapping = new Map();
      let sequence = 1;
      STAGES.forEach((stage) => {
        (Array.isArray(stage.questions) ? stage.questions : []).forEach((question) => {
          const choices = Array.isArray(question?.choices) ? question.choices : [];
          choices.forEach((choice) => {
            const key = normalizeText(choice?.value || '');
            if (!key || mapping.has(key)) return;
            mapping.set(key, sequence);
            sequence += 1;
          });
        });
      });
      return mapping;
    }

    function getChoiceVoicePath(word) {
      const key = normalizeText(word);
      if (!key) return '';
      const sequence = choiceVoiceIndex.get(key);
      if (!sequence) return '';
      return `${SYNONYM_VOICE_DIR}cardlab-synonym-${String(sequence).padStart(4, '0')}.mp3`;
    }

    function playChoiceVoice(word) {
      const path = getChoiceVoicePath(word);
      if (!path) return Promise.resolve(false);
      let audio = choiceAudioCache.get(path);
      if (!audio) {
        audio = new Audio(path);
        audio.preload = 'auto';
        choiceAudioCache.set(path, audio);
      }
      if (activeChoiceAudio) {
        try {
          activeChoiceAudio.pause();
          activeChoiceAudio.currentTime = 0;
        } catch (_error) {
          // ignore
        }
      }
      activeChoiceAudio = audio;
      return new Promise((resolve) => {
        let finished = false;
        const finish = (success) => {
          if (finished) return;
          finished = true;
          if (activeChoiceAudio === audio) activeChoiceAudio = null;
          resolve(Boolean(success));
        };
        audio.onended = () => finish(true);
        audio.onerror = () => finish(false);
        audio.play().catch(() => finish(false));
      });
    }

    function vibrateWrong() {
      if (navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate([80, 40, 80]);
      }
    }

    function getCurrentQuestion() {
      return state.run && Array.isArray(state.run.questions)
        ? state.run.questions[state.run.index] || null
        : null;
    }

    function isValidQuestion(question) {
      return Boolean(
        question &&
        String(question.answer || '').trim() &&
        Array.isArray(question.choices) &&
        question.choices.length
      );
    }

    function isValidRunPayload(payload) {
      const run = payload && payload.run;
      if (!run || !Array.isArray(run.questions) || !run.questions.length) return false;
      const index = Number.isFinite(Number(run.index)) ? Number(run.index) : 0;
      return index >= 0 && index < run.questions.length && isValidQuestion(run.questions[index]);
    }

    function buildRun(stage) {
      const pool = Array.isArray(stage.questions) ? stage.questions.filter(isValidQuestion) : [];
      if (!pool.length) return null;
      const questionCount = clamp(10, 1, pool.length || 10);
      const questions = sample(pool, questionCount).map((question) => ({
        id: String(question.id || ''),
        kind: String(question.kind || question.area || '유의어'),
        pos: String(question.pos || ''),
        promptWord: String(question.promptWord || question.prompt || '').trim(),
        promptText: String(question.promptText || '').trim(),
        titleText: String(question.titleText || '').trim(),
        answer: String(question.answer || '').trim(),
        choices: shuffle((question.choices || []).map((choice, choiceIndex) => ({
          id: String(choice?.id || `${question.id}-choice-${choiceIndex}`),
          value: String(choice?.value || '').trim(),
          isCorrect: Boolean(choice?.isCorrect || String(choice?.value || '').trim() === String(question.answer || '').trim())
        }))),
        selectedChoiceId: '',
        errorChoiceId: '',
        solved: false,
        filledWord: ''
      }));

      if (!questions.length) return null;

      return {
        id: `${stage.id}-${Date.now()}`,
        stage,
        questions,
        index: 0,
        correctCount: 0,
        wrongCount: 0
      };
    }

    function renderStageCards() {
      if (!stageGrid) return;
      stageGrid.innerHTML = STAGES.map((stage) => {
        return '' +
          `<button type="button" class="synonym-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-accent:${escapeHtml(stage.accent)}; --stage-soft:${escapeHtml(stage.soft)};">` +
          `  <div class="synonym-stage-band">${escapeHtml(stage.bandLabel)}</div>` +
          `  <div class="synonym-stage-title">${escapeHtml(stage.title)}</div>` +
          '</button>';
      }).join('');

      stageGrid.querySelectorAll('.synonym-stage-card').forEach((button) => {
        button.addEventListener('click', () => {
          const stageId = button.getAttribute('data-stage-id') || '';
          if (!stageId) return;
          state.selectedStageId = stageId;
          try {
            history.replaceState(null, '', `#${stageId}`);
          } catch (_error) {
            window.location.hash = stageId;
          }
          playSound(AUDIO_FILES.select);
          startStage();
        });
      });
    }

    function renderQuestion() {
      const run = state.run;
      const question = getCurrentQuestion();
      if (!run || !question) {
        questionKindChip.textContent = '같은 낱말';
        questionKindChip.classList.remove('is-synonym', 'is-antonym');
        questionKindChip.classList.add('is-synonym');
        questionTitle.textContent = '';
        questionPrompt.textContent = '';
        promptWord.textContent = '-';
        posChip.textContent = '품사';
        questionProgressChip.textContent = '문항 0 / 0';
        choiceBoard.innerHTML = '';
        return;
      }

      questionProgressChip.textContent = `문항 ${run.index + 1} / ${run.questions.length}`;
      questionKindChip.textContent = getKindDisplayLabel(question.kind);
      questionKindChip.classList.toggle('is-antonym', question.kind === '반의어');
      questionKindChip.classList.toggle('is-synonym', question.kind !== '반의어');
      questionTitle.textContent = question.titleText || (question.kind === '반의어'
        ? '제시어와 뜻이 반대인 낱말을 고르세요.'
        : '제시어와 뜻이 같은 낱말을 고르세요.');
      questionPrompt.textContent = question.pos
        ? `품사: ${question.pos} · ${run.stage.schoolLevelLabel}`
        : run.stage.schoolLevelLabel;
      promptWord.textContent = question.promptWord || '-';
      posChip.textContent = question.pos || '품사';

      choiceBoard.innerHTML = question.choices.map((choice) => {
        const selected = question.selectedChoiceId === choice.id;
        const wrong = question.errorChoiceId === choice.id;
        const correct = question.solved && choice.isCorrect;
        return '' +
          `<button type="button" class="synonym-choice-card ${selected ? 'is-selected' : ''} ${wrong ? 'is-wrong' : ''} ${correct ? 'is-correct' : ''}" data-choice-id="${escapeHtml(choice.id)}" ${question.solved ? 'disabled' : ''}>` +
          `  ${escapeHtml(choice.value)}` +
          '</button>';
      }).join('');

      choiceBoard.querySelectorAll('.synonym-choice-card').forEach((button) => {
        button.addEventListener('click', () => {
          if (button.disabled) return;
          commitChoice(button.getAttribute('data-choice-id') || '');
        });
      });
    }

    function renderComplete() {
      const run = state.run;
      if (!run) return;
      const stage = run.stage;
      completeTitle.textContent = `${stage.title} 완료!`;
      completeSummary.textContent = `총 ${run.questions.length}문항 중 정답 ${run.correctCount}개 · 오답 ${run.wrongCount}회`;
      completeCorrectCount.textContent = `${run.correctCount}문항`;
      completeWrongCount.textContent = `${run.wrongCount}회`;
      completeTotalCount.textContent = `${run.questions.length}문항`;

      if (!completionFxPlayed) {
        completionFxPlayed = true;
        playSound(AUDIO_FILES.complete);
      }
    }

    function showMeaningToast(word, meaning, context = {}) {
      const resolvedMeaning = window.CardlabMeaningResolver && typeof window.CardlabMeaningResolver.resolve === 'function'
        ? window.CardlabMeaningResolver.resolve(word, context)
        : '';
      if (window.CardlabMeaningToast && typeof window.CardlabMeaningToast.show === 'function') {
        window.CardlabMeaningToast.show({ word, meaning: resolvedMeaning || meaning });
      }
    }

    function buildMeaningContext(question, selectedWord) {
      return {
        module: 'synonym',
        kind: question.kind,
        pos: question.pos,
        promptWord: question.promptWord,
        promptText: question.promptText,
        answerWord: question.answer,
        selectedWord
      };
    }

    function clearResumeState() {
      try {
        window.sessionStorage.removeItem(SESSION_STATE_KEY);
      } catch (_error) {
        // ignore
      }
    }

    function persistResumeState(resumePhase = 'build') {
      if (!state.run) return;
      const payload = {
        selectedStageId: state.selectedStageId,
        selectionBackground: state.selectionBackground,
        learningBackground: state.learningBackground,
        run: state.run,
        resumePhase
      };
      if (!isValidRunPayload(payload)) return;
      try {
        window.sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify(payload));
      } catch (_error) {
        // ignore
      }
    }

    function consumeResumeState() {
      try {
        const raw = window.sessionStorage.getItem(SESSION_STATE_KEY);
        if (!raw) return null;
        window.sessionStorage.removeItem(SESSION_STATE_KEY);
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !isValidRunPayload(parsed)) {
          return null;
        }
        return parsed;
      } catch (_error) {
        clearResumeState();
        return null;
      }
    }

    function openComparisonPage() {
      persistResumeState('build');
      const hash = state.selectedStageId ? `#${encodeURIComponent(state.selectedStageId)}` : '';
      window.location.href = `${COMPARE_PAGE_PATH}${hash}`;
    }

    function updateTopBar() {
      const stage = pickStage();
      shellTitle.classList.add('shell-hidden');
      shellTitle.textContent = '';
      helpButton.classList.toggle('shell-hidden', state.phase !== 'select');

      if (state.phase === 'select') {
        stageSelectButton.classList.add('shell-hidden');
        shellStageLabel.classList.add('shell-hidden');
        if (exitButton) exitButton.textContent = '학습 종료';
        document.title = PAGE_CONFIG.pageTitle || '유의어 · 반의어';
        return;
      }

      stageSelectButton.classList.remove('shell-hidden');
      stageSelectButton.textContent = '스테이지 선택';
      shellStageLabel.textContent = stage ? stage.title : '스테이지';
      shellStageLabel.classList.remove('shell-hidden');
      if (exitButton) exitButton.textContent = '학습 종료';
      document.title = `${PAGE_CONFIG.pageTitle || '유의어 · 반의어'} · ${stage ? stage.title : ''}`;
    }

    function setView(phase) {
      state.phase = phase;
      const isSelect = phase === 'select';
      const isBuild = phase === 'build';
      const isComplete = phase === 'complete';

      stageSelectView.classList.toggle('is-active', isSelect);
      stageSelectView.classList.toggle('is-hidden', !isSelect);
      buildView.classList.toggle('is-active', isBuild);
      buildView.classList.toggle('is-hidden', !isBuild);
      completeView.classList.toggle('is-active', isComplete);
      completeView.classList.toggle('is-hidden', !isComplete);

      if (isSelect) {
        state.selectionBackground = state.selectionBackground || pickSelectionBackground();
        setShellBackground(state.selectionBackground);
      } else {
        state.learningBackground = state.learningBackground || pickLearningBackground();
        setShellBackground(state.learningBackground);
      }

      updateTopBar();

      if (isSelect) {
        renderStageCards();
      } else if (isBuild) {
        renderQuestion();
      } else if (isComplete) {
        renderComplete();
      }
    }

    function startStage() {
      stopAudio();
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      const stage = pickStage();
      if (!stage) return;
      completionFxPlayed = false;
      clearResumeState();
      state.run = buildRun(stage);
      if (!state.run) {
        setView('select');
        return;
      }
      setView('build');
    }

    function nextQuestion() {
      const run = state.run;
      if (!run) return;
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      if (advanceTimer) {
        window.clearTimeout(advanceTimer);
        advanceTimer = null;
      }
      if (run.index < run.questions.length - 1) {
        run.index += 1;
        renderQuestion();
        return;
      }
      setView('complete');
    }

    function commitChoice(choiceId) {
      const run = state.run;
      const question = getCurrentQuestion();
      if (!run || !question || question.solved) return false;
      const choice = question.choices.find((item) => item.id === choiceId);
      if (!choice) return false;

      question.selectedChoiceId = choice.id;
      if (!choice.isCorrect) {
        question.errorChoiceId = choice.id;
        run.wrongCount += 1;
        showAnswerFeedback(false);
        showMeaningToast(choice.value || question.promptWord || '', '', buildMeaningContext(question, choice.value));
        void playChoiceVoice(choice.value);
        renderQuestion();
        vibrateWrong();
        playSound(AUDIO_FILES.wrong);
        window.setTimeout(() => {
          if (!state.run || getCurrentQuestion() !== question || question.solved) return;
          question.errorChoiceId = '';
          question.selectedChoiceId = '';
          renderQuestion();
        }, 620);
        return false;
      }

      question.filledWord = choice.value;
      question.solved = true;
      question.errorChoiceId = '';
      run.correctCount += 1;
      showAnswerFeedback(true);
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      renderQuestion();
      void playChoiceVoice(choice.value).finally(() => {
        window.setTimeout(() => {
          if (!state.run || getCurrentQuestion() !== question || !question.solved) return;
          nextQuestion();
        }, 520);
      });
      return true;
    }

    function openConfirmModal(action) {
      const nextAction = action === 'exit' ? 'exit' : 'select';
      state.pendingModalAction = nextAction;
      if (nextAction === 'exit') {
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

    function closeConfirmModal() {
      state.pendingModalAction = '';
      confirmModal.classList.remove('is-active');
      confirmModal.setAttribute('aria-hidden', 'true');
    }

    function backToStages() {
      stopAudio();
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      clearResumeState();
      state.run = null;
      completionFxPlayed = false;
      setView('select');
    }

    function goToPreviousPage() {
      stopAudio();
      clearResumeState();
      if (window.history.length > 1) {
        window.history.back();
      }
    }

    function init() {
      if (!STAGES.length) {
        stageGrid.innerHTML = '<div class="synonym-stage-card">스테이지 데이터가 준비되지 않았습니다.</div>';
        return;
      }

      const resumedState = consumeResumeState();
      if (resumedState) {
        state.selectedStageId = String(resumedState.selectedStageId || state.selectedStageId || '');
        state.selectionBackground = String(resumedState.selectionBackground || '');
        state.learningBackground = String(resumedState.learningBackground || '');
        state.run = resumedState.run;
        completionFxPlayed = false;
        setView(resumedState.resumePhase === 'complete' ? 'complete' : 'build');
      } else {
        setView('select');
      }

      stageSelectButton.addEventListener('click', () => openConfirmModal('select'));
      if (exitButton) {
        exitButton.addEventListener('click', () => openConfirmModal('exit'));
      }
      completeStageButtonBack.textContent = '다른 단계 선택하기';
      completeRetryButton.textContent = '현재 단계 다시 풀기';
      completeStageButtonBack.addEventListener('click', () => backToStages());
      completeRetryButton.addEventListener('click', () => startStage());
      confirmModalOk.addEventListener('click', () => {
        const action = state.pendingModalAction || 'select';
        closeConfirmModal();
        if (action === 'exit') {
          goToPreviousPage();
        } else {
          backToStages();
        }
      });
      confirmModalCancel.addEventListener('click', () => closeConfirmModal());
      confirmModal.addEventListener('click', (event) => {
        if (event.target && event.target.hasAttribute('data-modal-close')) {
          closeConfirmModal();
        }
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeConfirmModal();
        }
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopAudio();
        }
      });
      window.addEventListener('blur', stopAudio, { passive: true });
      window.addEventListener('pagehide', stopAudio, { passive: true });
      window.addEventListener('beforeunload', stopAudio, { passive: true });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }
  } catch (error) {
    console.error(error);
  }
})();
