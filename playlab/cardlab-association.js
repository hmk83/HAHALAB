(function () {
  'use strict';

  try {
    const PAGE_CONFIG = window.CARDLAB_ASSOCIATION_PAGE_CONFIG || {};
    const COURSE_GUIDE = window.HAHA_LAB_ASSOCIATION_COURSE_GUIDE || {};
    const STAGE_COLORS = [
      { accent: '#ffb347', soft: 'rgba(255, 179, 71, 0.16)' },
      { accent: '#ff9f1a', soft: 'rgba(255, 159, 26, 0.16)' },
      { accent: '#6fc7ff', soft: 'rgba(111, 199, 255, 0.16)' },
      { accent: '#7ad7a8', soft: 'rgba(122, 215, 168, 0.16)' },
      { accent: '#83d6ff', soft: 'rgba(131, 214, 255, 0.16)' },
      { accent: '#f48bd1', soft: 'rgba(244, 139, 209, 0.16)' }
    ];

    const STAGES = Array.isArray(window.HAHA_LAB_ASSOCIATION_STAGE_TEMPLATES) && window.HAHA_LAB_ASSOCIATION_STAGE_TEMPLATES.length
      ? window.HAHA_LAB_ASSOCIATION_STAGE_TEMPLATES.map(normalizeStage)
      : fallbackStages();

    const AUDIO_FILES = {
      select: '../sound/select.mp3',
      correct: '../sound/correct.mp3',
      wrong: '../sound/error.mp3',
      complete: '../sound/happy_victory.mp3'
    };
    const ASSOCIATION_VOICE_DIR = '../sound/cardlab-association/';

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
    const questionProgressChip = document.getElementById('questionProgressChip');
    const hintToggleButton = document.getElementById('hintToggleButton');
    const coreCard = document.getElementById('coreCard');
    const coreWord = document.getElementById('coreWord');
    const slotGrid = document.getElementById('slotGrid');
    const selectionChip = document.getElementById('selectionChip');
    const choiceBoard = document.getElementById('choiceBoard');
    const completeTitle = document.getElementById('completeTitle');
    const completeSummary = document.getElementById('completeSummary');
    const completeStageLabel = document.getElementById('completeStageLabel');
    const completeCorrectCount = document.getElementById('completeCorrectCount');
    const completeWrongCount = document.getElementById('completeWrongCount');
    const completeTotalCount = document.getElementById('completeTotalCount');
    const completeCoreWord = document.getElementById('completeCoreWord');
    const completeWords = document.getElementById('completeWords');
    const completeStageButtonBack = document.getElementById('completeStageButtonBack');
    const completeRetryButton = document.getElementById('completeRetryButton');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalDesc = document.getElementById('confirmModalDesc');
    const confirmModalOk = document.getElementById('confirmModalOk');
    const confirmModalCancel = document.getElementById('confirmModalCancel');
    const effectLayer = document.getElementById('associationEffectLayer');

    if (!stageSelectView || !introView || !buildView || !completeView || !stageGrid || !shellTitle || !shellStageLabel || !stageSelectButton || !helpButton || !introBadge || !introTitle || !introSubtitle || !introLevelCopy || !introMissionCopy || !introDescription || !introStartButton || !introBackButton || !questionProgressChip || !hintToggleButton || !coreCard || !coreWord || !slotGrid || !selectionChip || !choiceBoard || !completeTitle || !completeSummary || !completeStageLabel || !completeCorrectCount || !completeWrongCount || !completeTotalCount || !completeCoreWord || !completeWords || !completeStageButtonBack || !completeRetryButton || !confirmModal || !confirmModalTitle || !confirmModalDesc || !confirmModalOk || !confirmModalCancel || !effectLayer) {
      return;
    }

    const audioCache = new Map();
    const narrationCache = new Map();
    const choiceVoiceIndex = buildChoiceVoiceIndex();
    let audioEnabled = true;
    let activeAudio = null;
    let activeNarrationAudio = null;
    let activeEffectAudio = null;
    let advanceTimer = null;
    let narrationSequenceToken = 0;
    let narrationDelayTimer = null;
    let completionFxPlayed = false;

    const state = {
      phase: 'select',
      selectedStageId: getInitialStageId(),
      selectionBackground: '',
      learningBackground: '',
      pendingModalAction: '',
      hintsEnabled: false,
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

    function normalizeImagePath(value) {
      const text = String(value || '').trim();
      if (!text) return '';
      if (/^(https?:)?\/\//i.test(text) || /^file:/i.test(text) || /^data:/i.test(text) || /^blob:/i.test(text)) {
        return text;
      }
      return text.replace(/^\.\/+/, '').replace(/^\/+/, '');
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
      const arr = shuffle(list);
      return arr.slice(0, Math.max(0, Math.min(arr.length, count)));
    }

    function uniqueWords(items = []) {
      const seen = new Set();
      return (Array.isArray(items) ? items : []).map((item) => String(item || '').trim()).filter((item) => {
        if (!item || seen.has(item)) return false;
        seen.add(item);
        return true;
      });
    }

    function normalizeStage(stage, index = 0) {
      const fallbackColor = STAGE_COLORS[index % STAGE_COLORS.length];
      return {
        id: String(stage?.id || `association-${String(index + 1).padStart(2, '0')}`),
        title: String(stage?.title || `도입 ${String(index + 1).padStart(2, '0')}`),
        schoolLevelLabel: String(stage?.schoolLevelLabel || `초등 ${index + 1}`),
        bandLabel: String(stage?.bandLabel || (index === 0 ? '도입' : index === 1 ? '기초' : index === 2 ? '확장' : index === 3 ? '응용' : index === 4 ? '심화' : '마스터')),
        descriptor: String(stage?.descriptor || ''),
        grammarFocus: String(stage?.grammarFocus || ''),
        goalCopy: String(stage?.goalCopy || ''),
        questionPoolLabel: String(stage?.questionPoolLabel || '문항풀 50개'),
        runQuestionCount: clamp(Number(stage?.runQuestionCount || 8) || 8, 5, 12),
        timeLimitSeconds: clamp(Number(stage?.timeLimitSeconds || 30) || 30, 20, 40),
        questions: Array.isArray(stage?.questions) ? stage.questions.map(normalizeQuestion) : [],
        accent: String(stage?.accent || fallbackColor.accent),
        soft: String(stage?.soft || fallbackColor.soft)
      };
    }

    function normalizeQuestion(question, index = 0) {
      const questionId = String(question?.id || `association-q-${String(index + 1).padStart(2, '0')}`);
      const coreWord = String(question?.coreWord || question?.word || question?.answer || '').trim();
      const targetWords = uniqueWords(question?.targetWords || []).slice(0, 3);
      const choices = Array.isArray(question?.choices) && question.choices.length
        ? question.choices.map((choice, choiceIndex) => ({
            id: String(choice?.id || `${questionId}-choice-${choiceIndex}`),
            value: String(choice?.value || '').trim(),
            isCorrect: Boolean(choice?.isCorrect)
          }))
        : buildFallbackChoices(questionId, targetWords, question?.distractorPool || []);

      return {
        id: questionId,
        coreWord,
        word: coreWord,
        targetWords,
        distractorPool: uniqueWords(question?.distractorPool || []),
        choices
      };
    }

    function buildFallbackChoices(questionId, targetWords, distractorPool) {
      const pool = uniqueWords(distractorPool).filter((word) => word && !targetWords.includes(word));
      const distractors = pool.slice(0, 3);
      return [
        ...targetWords.map((value, index) => ({
          id: `${questionId}-correct-${index}`,
          value,
          isCorrect: true
        })),
        ...distractors.map((value, index) => ({
          id: `${questionId}-wrong-${index}`,
          value,
          isCorrect: false
        }))
      ];
    }

    function fallbackStages() {
      return Array.from({ length: 6 }, (_, index) => normalizeStage({
        id: `association-${String(index + 1).padStart(2, '0')}`,
        title: `${index === 0 ? '도입' : index === 1 ? '기초' : index === 2 ? '확장' : index === 3 ? '응용' : index === 4 ? '심화' : '마스터'} ${String(index + 1).padStart(2, '0')}`,
        schoolLevelLabel: `초등 ${index + 1}`,
        bandLabel: index === 0 ? '도입' : index === 1 ? '기초' : index === 2 ? '확장' : index === 3 ? '응용' : index === 4 ? '심화' : '마스터',
        descriptor: '연상 훈련',
        grammarFocus: '연상',
        goalCopy: '핵심 단어와 연결되는 낱말을 찾아보는 훈련 단계입니다.',
        runQuestionCount: index < 4 ? 6 : 5,
        timeLimitSeconds: index < 2 ? 30 : index < 4 ? 28 : 26,
        questions: []
      }, index));
    }

    function getInitialStageId() {
      const hashStageId = (window.location.hash || '').replace(/^#/, '').trim();
      return STAGES.some((stage) => stage.id === hashStageId) ? hashStageId : STAGES[0].id;
    }

    function pickStage() {
      return STAGES.find((stage) => stage.id === state.selectedStageId) || STAGES[0];
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
      if (!imagePath || !document.documentElement || !document.documentElement.style) return;
      const value = `url('${imagePath}')`;
      document.documentElement.style.setProperty('--shell-page-bg', value);
      document.documentElement.style.setProperty('--shell-intro-bg', value);
    }

    function cancelNarrationSequence() {
      narrationSequenceToken += 1;
      if (narrationDelayTimer) {
        window.clearTimeout(narrationDelayTimer);
        narrationDelayTimer = null;
      }
    }

    function waitForNarrationDelay(delayMs, token) {
      return new Promise((resolve) => {
        if (token !== narrationSequenceToken) {
          resolve(false);
          return;
        }
        narrationDelayTimer = window.setTimeout(() => {
          narrationDelayTimer = null;
          resolve(token === narrationSequenceToken);
        }, delayMs);
      });
    }

    function stopAudio() {
      cancelNarrationSequence();
      stopNarrationAudio();
      stopEffectAudio();
    }

    function clearAdvanceTimer() {
      if (!advanceTimer) return;
      window.clearTimeout(advanceTimer);
      advanceTimer = null;
    }

    function stopNarrationAudio() {
      if (!activeNarrationAudio) return;
      try {
        activeNarrationAudio.pause();
        activeNarrationAudio.currentTime = 0;
      } catch (_error) {
        // ignore
      }
      activeNarrationAudio = null;
    }

    function stopEffectAudio() {
      if (!activeEffectAudio) return;
      try {
        activeEffectAudio.pause();
        activeEffectAudio.currentTime = 0;
      } catch (_error) {
        // ignore
      }
      activeEffectAudio = null;
    }

    function vibrateWrong() {
      if (navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate([80, 40, 80]);
      }
    }

    function playAudio(path) {
      const normalized = String(path || '').trim();
      if (!normalized) return Promise.resolve(false);
      if (!audioEnabled) return Promise.resolve(false);
      stopNarrationAudio();
      let audio = audioCache.get(normalized);
      if (!audio) {
        audio = new Audio(normalized);
        audio.preload = 'auto';
        audioCache.set(normalized, audio);
      }
      activeNarrationAudio = audio;
      return new Promise((resolve) => {
        let finished = false;
        const finish = (success) => {
          if (finished) return;
          finished = true;
          if (activeNarrationAudio === audio) {
            activeNarrationAudio = null;
          }
          resolve(Boolean(success));
        };
        audio.onended = () => finish(true);
        audio.onerror = () => finish(false);
        try {
          audio.currentTime = 0;
          audio.play().catch(() => {
            finish(false);
          });
        } catch (_error) {
          finish(false);
        }
      });
    }

    function playEffect(path, volume) {
      const normalized = String(path || '').trim();
      if (!normalized || !audioEnabled) return false;
      try {
        stopEffectAudio();
        const audio = new Audio(normalized);
        audio.preload = 'auto';
        if (typeof volume === 'number') {
          audio.volume = clamp(volume, 0, 1);
        }
        activeEffectAudio = audio;
        audio.onended = () => {
          if (activeEffectAudio === audio) {
            activeEffectAudio = null;
          }
        };
        audio.play().catch(() => {});
        return true;
      } catch (_error) {
        return false;
      }
    }

    function buildChoiceVoiceIndex() {
      const mapping = new Map();
      let sequence = 1;
      STAGES.forEach((stage) => {
        (Array.isArray(stage.questions) ? stage.questions : []).forEach((question) => {
          const choices = Array.isArray(question?.choices) && question.choices.length
            ? question.choices
            : [...uniqueWords(question?.targetWords || []), ...uniqueWords(question?.distractorPool || [])].map((value) => ({ value }));
          choices.forEach((choice) => {
            const value = String(choice?.value || '').trim();
            if (!value || mapping.has(value)) return;
            mapping.set(value, sequence);
            sequence += 1;
          });
        });
      });
      return mapping;
    }

    function getChoiceVoicePath(choiceText) {
      const normalized = String(choiceText || '').trim();
      if (!normalized) return '';
      const sequence = choiceVoiceIndex.get(normalized);
      if (!sequence) return '';
      return `${ASSOCIATION_VOICE_DIR}cardlab-association-${String(sequence).padStart(4, '0')}.mp3`;
    }

    function playNarrationAudio(path) {
      const normalized = String(path || '').trim();
      if (!normalized || !audioEnabled) return Promise.resolve(false);
      stopAudio();
      let audio = narrationCache.get(normalized);
      if (!audio) {
        audio = new Audio(normalized);
        audio.preload = 'auto';
        narrationCache.set(normalized, audio);
      }
      activeNarrationAudio = audio;
      return new Promise((resolve) => {
        let finished = false;
        const finish = (success) => {
          if (finished) return;
          finished = true;
          window.clearTimeout(timeout);
          if (activeNarrationAudio === audio) {
            activeNarrationAudio = null;
          }
          resolve(Boolean(success));
        };
        const timeout = window.setTimeout(() => finish(false), 15000);
        audio.onended = () => finish(true);
        audio.onerror = () => finish(false);
        try {
          audio.currentTime = 0;
          audio.play().catch(() => {
            finish(false);
          });
        } catch (_error) {
          finish(false);
        }
      });
    }

    function playChoiceNarration(choiceText) {
      const text = String(choiceText || '').trim();
      if (!text) return Promise.resolve(false);
      const path = getChoiceVoicePath(text);
      if (path) {
        return playNarrationAudio(path);
      }
      return Promise.resolve(false);
    }

    async function playSequence(paths) {
      const list = Array.isArray(paths) ? paths.filter(Boolean) : [];
      if (!list.length) return false;
      stopAudio();
      const token = narrationSequenceToken;
      for (let index = 0; index < list.length; index += 1) {
        if (token !== narrationSequenceToken) return false;
        const played = await playAudio(list[index]);
        if (!played || token !== narrationSequenceToken) return false;
        if (index < list.length - 1) {
          const delayCompleted = await waitForNarrationDelay(140, token);
          if (!delayCompleted) return false;
        }
      }
      return true;
    }

    async function requestFullscreenMode() {
      return false;
    }

    async function exitFullscreenMode() {
      return false;
    }

    function spawnParticles(kind, targetElement, count) {
      const layerRect = effectLayer.getBoundingClientRect();
      const targetRect = (targetElement || effectLayer).getBoundingClientRect();
      const originX = targetRect.left + (targetRect.width / 2) - layerRect.left;
      const originY = targetRect.top + (targetRect.height / 2) - layerRect.top;
      const total = Math.max(8, Number(count || 14));
      const colors = kind === 'complete'
        ? ['#ffe17a', '#8fe0ff', '#f6a8ff', '#8fffb4']
        : kind === 'wrong'
          ? ['#ff7d7d', '#ffb4b4', '#ffd0d0']
          : ['#ffe182', '#ffd36d', '#fff4b0', '#96e1ff'];
      for (let index = 0; index < total; index += 1) {
        const particle = document.createElement('span');
        const angle = (Math.PI * 2 * index) / total + (Math.random() * 0.35);
        const distance = 42 + (Math.random() * 58);
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - (kind === 'wrong' ? 10 : 0);
        const size = kind === 'complete' ? (8 + Math.random() * 6) : (6 + Math.random() * 4);
        particle.className = `wordbuild-fx-particle is-${kind}`;
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = colors[index % colors.length];
        particle.style.setProperty('--tx', `${tx.toFixed(1)}px`);
        particle.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        particle.style.setProperty('--rot', `${Math.round((Math.random() * 500) - 250)}deg`);
        particle.style.animationDelay = `${Math.random() * 90}ms`;
        effectLayer.appendChild(particle);
        window.setTimeout(() => particle.remove(), 1050);
      }
    }

    function pulseElement(element, className, timeout) {
      if (!element) return;
      element.classList.remove(className);
      void element.offsetWidth;
      element.classList.add(className);
      window.setTimeout(() => element.classList.remove(className), timeout || 520);
    }

    function getStageLabel(stage) {
      return `${stage.title}`;
    }

    function renderStageCards() {
      stageGrid.innerHTML = STAGES.map((stage) => {
        const active = stage.id === state.selectedStageId;
        const style = `--stage-accent:${stage.accent};--stage-soft:${stage.soft};`;
        return '' +
          `<button type="button" class="wordbuild-stage-card" data-stage-id="${escapeHtml(stage.id)}" aria-pressed="${active ? 'true' : 'false'}" style="${style}">` +
          '  <div class="wordbuild-stage-top">' +
          `    <span class="wordbuild-stage-chip">${escapeHtml(stage.bandLabel)}</span>` +
          `    <span class="wordbuild-stage-code">${escapeHtml(stage.schoolLevelLabel)}</span>` +
          '  </div>' +
          '  <div class="wordbuild-stage-main">' +
          `    <div class="wordbuild-stage-name">${escapeHtml(stage.title)}</div>` +
          `    <div class="wordbuild-stage-detail">${escapeHtml(stage.goalCopy || stage.descriptor || '')}</div>` +
          '  </div>' +
          '</button>';
      }).join('');

      stageGrid.querySelectorAll('.wordbuild-stage-card').forEach((button) => {
        button.addEventListener('click', () => {
          const selectedStageId = button.getAttribute('data-stage-id') || state.selectedStageId;
          state.selectedStageId = selectedStageId;
          playEffect(AUDIO_FILES.select, 0.72);
          requestFullscreenMode();
          startStage();
        });
      });
    }

    function renderIntro() {
      const stage = pickStage();
      introBadge.textContent = `${stage.bandLabel} · ${stage.schoolLevelLabel}`;
      introBadge.classList.remove('shell-hidden');
      introTitle.textContent = stage.title;
      introTitle.classList.remove('shell-hidden');
      introSubtitle.textContent = stage.goalCopy || COURSE_GUIDE.summary || '';
      introSubtitle.classList.remove('shell-hidden');
      introLevelCopy.textContent = `${stage.schoolLevelLabel} 기준 · ${stage.descriptor || stage.grammarFocus || '연상 훈련'}`;
      introMissionCopy.textContent = `${stage.goalCopy || COURSE_GUIDE.summary || ''} · ${stage.questionPoolLabel || '문항풀 50개'} 중 ${stage.runQuestionCount}문항을 무작위로 출제해요.`;
      introDescription.textContent = `${stage.timeLimitSeconds}초 안에 핵심 단어와 연결되는 낱말 4개를 모두 찾아보세요.`;
      introDescription.classList.remove('shell-hidden');
    }

    function renderCoursePanel() {
      shellTitle.textContent = '';
      shellTitle.classList.add('shell-hidden');
    }

    function createPuzzleState(question) {
      const choices = shuffle((question.choices || []).map((choice, index) => ({
        id: String(choice?.id || `${question.id}-choice-${index}`),
        value: String(choice?.value || '').trim(),
        isCorrect: Boolean(choice?.isCorrect)
      })));
      return {
        id: String(question.id || ''),
        coreWord: String(question.coreWord || question.word || ''),
        targetWords: uniqueWords(question.targetWords || []).slice(0, 3),
        choices,
        matchedCardIds: [],
        matchedWords: [],
        solved: false,
        finished: false,
        selectedChoiceId: '',
        errorChoiceId: '',
        draggedChoiceId: '',
        dragOverCore: false
      };
    }

    function buildRun(stage) {
      const pool = Array.isArray(stage.questions) ? stage.questions : [];
      const questionCount = clamp(Number(stage.runQuestionCount || 8) || 8, 1, Math.max(1, pool.length || 1));
      const questions = sample(pool, questionCount).map((question) => createPuzzleState(question));
      return {
        id: `${stage.id}-${Date.now()}`,
        stage,
        questions,
        index: 0,
        current: null,
        correctCount: 0,
        wrongCount: 0
      };
    }

    function getCurrentQuestion() {
      return state.run?.current || null;
    }

    function getNextEmptySlot(question) {
      if (!question) return null;
      const index = question.matchedWords.length;
      return index < (question.targetWords?.length || 0) ? index : null;
    }

    function renderBuildHeader() {
      hintToggleButton.textContent = state.hintsEnabled ? '힌트보기 ON' : '힌트보기 OFF';
      hintToggleButton.setAttribute('aria-pressed', String(state.hintsEnabled));
      hintToggleButton.classList.toggle('is-on', state.hintsEnabled);
    }

    function renderCoreArea() {
      const question = getCurrentQuestion();
      if (!question) {
        coreWord.textContent = '?';
        questionProgressChip.textContent = '연결 0 / 0';
        return;
      }
      coreWord.textContent = question.coreWord || '?';
      questionProgressChip.textContent = `연결 ${question.matchedWords.length} / ${question.targetWords.length}`;
    }

    function renderSlotGrid() {
      const question = getCurrentQuestion();
      if (!question) {
        slotGrid.innerHTML = '';
        return;
      }
      slotGrid.innerHTML = Array.from({ length: question.targetWords.length || 0 }).map((_, index) => {
        const word = String(question.matchedWords[index] || '').trim();
        const filled = Boolean(word);
        return '' +
          `<div class="association-slot-card ${filled ? 'is-filled' : ''}" data-slot-index="${index}">` +
          `  <div class="association-slot-word">${filled ? escapeHtml(word) : '<span class="association-slot-placeholder">?</span>'}</div>` +
          '</div>';
      }).join('');
    }

    function renderSelectionChip() {
      selectionChip.textContent = '낱말을 클릭하거나 드래그해서 핵심 단어와 연결해요.';
    }

    function renderChoiceBoard() {
      const question = getCurrentQuestion();
      if (!question) {
        choiceBoard.innerHTML = '';
        renderSelectionChip();
        return;
      }

      choiceBoard.innerHTML = question.choices.map((choice) => {
        const matched = question.matchedCardIds.includes(choice.id);
        const wrong = question.errorChoiceId === choice.id;
        const selected = question.selectedChoiceId === choice.id;
        return '' +
          `<button type="button" class="association-choice-card ${matched ? 'is-matched' : ''} ${wrong ? 'is-wrong' : ''} ${selected ? 'is-selected' : ''}" data-choice-id="${escapeHtml(choice.id)}" ${matched ? 'disabled' : ''} draggable="${matched ? 'false' : 'true'}">` +
          `  ${escapeHtml(choice.value)}` +
          '</button>';
      }).join('');

      choiceBoard.querySelectorAll('.association-choice-card').forEach((button) => {
        button.addEventListener('dragstart', (event) => {
          if (button.disabled) {
            event.preventDefault();
            return;
          }
          const choiceId = button.getAttribute('data-choice-id') || '';
          const question = getCurrentQuestion();
          if (question) {
            question.draggedChoiceId = choiceId;
          }
          event.dataTransfer?.setData('text/plain', choiceId);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        });
        button.addEventListener('dragend', () => {
          const question = getCurrentQuestion();
          if (question) {
            question.draggedChoiceId = '';
            question.dragOverCore = false;
          }
          renderBuild();
        });
        button.addEventListener('click', () => {
          if (button.disabled) return;
          const question = getCurrentQuestion();
          if (!question) return;
          const narrationPromise = playChoiceNarration(button.textContent || '');
          commitChoice(button.getAttribute('data-choice-id') || '', button, { narrationPromise });
        });
      });
    }

    function renderBuild() {
      const run = state.run;
      const question = getCurrentQuestion();
      renderBuildHeader();
      if (!run || !question) {
        coreWord.textContent = '?';
        questionProgressChip.textContent = '연결 0 / 0';
        slotGrid.innerHTML = '';
        choiceBoard.innerHTML = '';
        renderSelectionChip();
        return;
      }

      renderCoreArea();
      renderSlotGrid();
      renderChoiceBoard();
      renderSelectionChip();
    }

    function renderComplete() {
      const run = state.run;
      if (!run) return;
      const stage = run.stage;
      completeTitle.textContent = `${stage.title} 완료!`;
      completeSummary.textContent = `총 ${run.questions.length}문항 중 ${run.correctCount}문항을 모두 연결했어요. 오답은 ${run.wrongCount}회였어요.`;
      completeStageLabel.textContent = stage.title;
      completeCorrectCount.textContent = `${run.correctCount}문항`;
      completeWrongCount.textContent = `${run.wrongCount}회`;
      completeTotalCount.textContent = `${run.questions.length}문항`;
      completeCoreWord.textContent = stage.title || stage.bandLabel || stage.schoolLevelLabel || '연상';
      completeWords.innerHTML = run.questions.map((question) => '' +
        `<span class="association-result-word">${escapeHtml(question.coreWord || '')}</span>`
      ).join('');

      if (!completionFxPlayed) {
        completionFxPlayed = true;
        pulseElement(completeView.querySelector('.wordbuild-complete-hero'), 'is-complete-bounce', 900);
        spawnParticles('complete', completeView, 24);
        playSequence([AUDIO_FILES.complete]);
      }
    }

    function setView(phase) {
      state.phase = phase;
      const isSelect = phase === 'select';
      const isIntro = phase === 'intro';
      const isBuild = phase === 'build';
      const isComplete = phase === 'complete';
      const isSelectionPhase = isSelect || isIntro;

      stageSelectView.classList.toggle('is-active', isSelect);
      stageSelectView.classList.toggle('is-hidden', !isSelect);
      introView.classList.toggle('is-active', isIntro);
      introView.classList.toggle('is-hidden', !isIntro);
      buildView.classList.toggle('is-active', isBuild);
      buildView.classList.toggle('is-hidden', !isBuild);
      completeView.classList.toggle('is-active', isComplete);
      completeView.classList.toggle('is-hidden', !isComplete);

      if (isSelectionPhase) {
        state.selectionBackground = state.selectionBackground || pickSelectionBackground();
        setShellBackground(state.selectionBackground);
      } else {
        state.learningBackground = state.learningBackground || pickLearningBackground();
        setShellBackground(state.learningBackground);
      }

      updateTopBar();

      if (isSelect) {
        renderStageCards();
      } else if (isIntro) {
        renderIntro();
      } else if (isBuild) {
        renderBuild();
      } else if (isComplete) {
        renderComplete();
      }
    }

    function updateTopBar() {
      const stage = pickStage();
      shellTitle.textContent = '';
      shellTitle.classList.add('shell-hidden');
      helpButton.classList.toggle('shell-hidden', state.phase !== 'select');
      if (state.phase === 'select') {
        stageSelectButton.classList.add('shell-hidden');
        shellStageLabel.classList.add('shell-hidden');
        if (exitButton) exitButton.textContent = '학습 종료';
        document.title = PAGE_CONFIG.pageTitle || '꼬리 물기 연상';
        return;
      }
      stageSelectButton.classList.remove('shell-hidden');
      stageSelectButton.textContent = '스테이지 선택';
      shellStageLabel.textContent = stage.title || `${stage.bandLabel} ${stage.schoolLevelLabel}`;
      shellStageLabel.classList.remove('shell-hidden');
      if (exitButton) exitButton.textContent = '학습 종료';
      document.title = `${PAGE_CONFIG.pageTitle || '꼬리 물기 연상'} · ${stage.title}`;
    }

    function openIntro() {
      clearAdvanceTimer();
      stopAudio();
      state.run = null;
      completionFxPlayed = false;
      setView('intro');
    }

    function startStage() {
      clearAdvanceTimer();
      stopAudio();
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      requestFullscreenMode();
      const stage = pickStage();
      if (!stage) return;
      const run = buildRun(stage);
      state.run = run;
      run.current = run.questions[0] || null;
      state.learningBackground = pickLearningBackground();
      completionFxPlayed = false;
      setView('build');
      history.replaceState(null, '', `#${stage.id}`);
    }

    function loadNextQuestion() {
      if (!state.run) return;
      clearAdvanceTimer();
      stopAudio();
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      state.run.index += 1;
      if (state.run.index >= state.run.questions.length) {
        state.run.current = null;
        setView('complete');
        return;
      }
      state.run.current = state.run.questions[state.run.index];
      setView('build');
    }

    function restartStage() {
      clearAdvanceTimer();
      stopAudio();
      const stage = pickStage();
      if (!stage) return;
      state.selectedStageId = stage.id;
      startStage();
    }

    function goToSelection() {
      clearAdvanceTimer();
      stopAudio();
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      state.run = null;
      state.selectionBackground = pickSelectionBackground();
      setView('select');
    }

    function openConfirmModal(action) {
      clearAdvanceTimer();
      stopAudio();
      state.pendingModalAction = action;
      if (action === 'exit') {
        confirmModalTitle.textContent = '학습 종료';
        confirmModalDesc.textContent = '현재 학습을 끝내고 이전 페이지로 돌아갈까요?';
        confirmModalOk.textContent = '종료';
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

    function goBackToPreviousPage() {
      exitFullscreenMode();
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      if (document.referrer) {
        window.location.href = document.referrer;
        return;
      }
      window.location.href = '../class-new.html';
    }

    function handleHashChange() {
      const nextStageId = (window.location.hash || '').replace(/^#/, '').trim();
      if (!nextStageId || !STAGES.some((stage) => stage.id === nextStageId)) return;
      state.selectedStageId = nextStageId;
      if (state.phase === 'select') {
        renderStageCards();
      }
    }

    function shouldAutoStartFromUrl() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        return params.get('autostart') === '1'
          || params.get('cardlabLaunch') === '1'
          || params.get('launch') === '1';
      } catch (_error) {
        return false;
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

    function showQuestionCompleteFeedback(kind) {
      const overlay = window.HahaFeedbackOverlay || window.PlaylabFeedbackOverlay;
      if (overlay && typeof overlay.showQuestionComplete === 'function') {
        overlay.showQuestionComplete(kind, { sound: false, durationMs: 900 });
        return;
      }
      document.dispatchEvent(new CustomEvent('hahalab:question-complete', {
        detail: {
          result: kind,
          options: { sound: false, durationMs: 900 }
        }
      }));
    }

    function commitChoice(choiceId, sourceElement, options = {}) {
      const question = getCurrentQuestion();
      const run = state.run;
      if (!question || !run || question.solved || question.finished) return false;
      const choice = question.choices.find((item) => item.id === choiceId);
      if (!choice || question.matchedCardIds.includes(choice.id)) return false;

      question.selectedChoiceId = choice.id;
      if (!choice.isCorrect) {
        run.wrongCount += 1;
        question.errorChoiceId = choice.id;
        vibrateWrong();
        playEffect(AUDIO_FILES.wrong, 0.4);
        pulseElement(sourceElement || choiceBoard, 'is-wrong', 420);
        if (state.hintsEnabled) {
          showMeaningToast(question.coreWord, question.answer || question.targetWords.join(' · ') || '', {
            module: 'association',
            targetWords: question.targetWords
          });
        } else if (window.CardlabMeaningToast) {
          window.CardlabMeaningToast.hide();
        }
        renderBuild();
        window.setTimeout(() => {
          if (getCurrentQuestion() === question && question.errorChoiceId === choice.id) {
            question.errorChoiceId = '';
            question.selectedChoiceId = '';
            renderBuild();
          }
        }, 420);
        return false;
      }

      question.matchedCardIds.push(choice.id);
      question.matchedWords.push(choice.value);
      question.errorChoiceId = '';
      const narrationPromise = options.narrationPromise || playChoiceNarration(choice.value);
      playEffect(AUDIO_FILES.correct, 0.4);
      if (state.hintsEnabled) {
        showMeaningToast(question.coreWord, question.answer || question.targetWords.join(' · ') || '', {
          module: 'association',
          targetWords: question.targetWords
        });
      } else if (window.CardlabMeaningToast) {
        window.CardlabMeaningToast.hide();
      }
      pulseElement(coreCard, 'is-complete-bounce', 520);
      spawnParticles('correct', coreCard, 14);
      renderBuild();
      if (question.matchedWords.length >= question.targetWords.length) {
        completeQuestion({ narrationPromise });
      }
      return true;
    }

    function completeQuestion(options = {}) {
      const run = state.run;
      const question = getCurrentQuestion();
      if (!run || !question || question.solved) return;
      question.solved = true;
      run.correctCount += 1;
      pulseElement(buildView.querySelector('.association-lesson'), 'is-complete-bounce', 900);
      spawnParticles('correct', buildView, 18);
      renderBuild();
      showQuestionCompleteFeedback('correct');
      clearAdvanceTimer();
      const solvedQuestion = question;
      const advance = () => {
        advanceTimer = null;
        if (!state.run || getCurrentQuestion() !== solvedQuestion) return;
        if (state.run.index < state.run.questions.length - 1) {
          loadNextQuestion();
        } else {
          state.run.current = null;
          completionFxPlayed = false;
          setView('complete');
        }
      };
      const narrationPromise = options && options.narrationPromise;
      if (narrationPromise && typeof narrationPromise.finally === 'function') {
        advanceTimer = window.setTimeout(advance, 2400);
        narrationPromise.finally(() => {
          if (!state.run || getCurrentQuestion() !== solvedQuestion || !advanceTimer) return;
          window.clearTimeout(advanceTimer);
          advanceTimer = window.setTimeout(advance, 880);
        });
        return;
      }
      advanceTimer = window.setTimeout(advance, 920);
    }

    function renderCoreDropHandlers() {
      coreCard.addEventListener('dragover', (event) => {
        event.preventDefault();
        const question = getCurrentQuestion();
        if (!question) return;
        question.dragOverCore = true;
        coreCard.classList.add('is-drop-target');
      });
      coreCard.addEventListener('dragleave', () => {
        const question = getCurrentQuestion();
        if (!question) return;
        question.dragOverCore = false;
        coreCard.classList.remove('is-drop-target');
      });
      coreCard.addEventListener('drop', (event) => {
        event.preventDefault();
        const question = getCurrentQuestion();
        if (!question) return;
        question.dragOverCore = false;
        coreCard.classList.remove('is-drop-target');
        const choiceId = String(event.dataTransfer?.getData('text/plain') || question.draggedChoiceId || '');
        if (!choiceId) return;
        const sourceElement = Array.from(choiceBoard.querySelectorAll('.association-choice-card')).find((button) => button.getAttribute('data-choice-id') === choiceId) || coreCard;
        commitChoice(choiceId, sourceElement);
      });
    }

    function bindStaticEvents() {
      stageSelectButton.addEventListener('click', () => openConfirmModal('list'));
      if (exitButton) {
        exitButton.addEventListener('click', () => openConfirmModal('exit'));
      }
      introStartButton.addEventListener('click', startStage);
      introBackButton.addEventListener('click', goToSelection);
      hintToggleButton.addEventListener('click', () => {
        state.hintsEnabled = !state.hintsEnabled;
        if (!state.hintsEnabled && window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
        renderBuildHeader();
      });
      completeStageButtonBack.textContent = '다른 단계 선택하기';
      completeRetryButton.textContent = '현재 단계 다시 풀기';
      completeStageButtonBack.addEventListener('click', goToSelection);
      completeRetryButton.addEventListener('click', restartStage);
      confirmModalOk.addEventListener('click', () => {
        const action = state.pendingModalAction || 'exit';
        closeConfirmModal();
        if (action === 'list') {
          goToSelection();
          return;
        }
        goBackToPreviousPage();
      });
      confirmModalCancel.addEventListener('click', closeConfirmModal);
      confirmModal.addEventListener('click', (event) => {
        if (event.target && event.target.hasAttribute('data-modal-close')) {
          closeConfirmModal();
        }
      });
      window.addEventListener('hashchange', handleHashChange);
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeConfirmModal();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAudio();
      });
      window.addEventListener('blur', stopAudio, { passive: true });
      window.addEventListener('pagehide', stopAudio, { passive: true });
      window.addEventListener('beforeunload', stopAudio, { passive: true });
      renderCoreDropHandlers();
    }

    function initFromStageSelection() {
      state.selectionBackground = pickSelectionBackground();
      state.learningBackground = pickLearningBackground();
      renderCoursePanel();
      renderStageCards();
      updateTopBar();
      setShellBackground(state.selectionBackground);
      setView('select');
      if (shouldAutoStartFromUrl()) {
        startStage();
      }
    }

    bindStaticEvents();

    state.selectedStageId = getInitialStageId();
    initFromStageSelection();

    window.CARDLAB_ASSOCIATION_DEBUG = {
      stages: STAGES,
      guide: COURSE_GUIDE
    };

    renderStageCards();
    updateTopBar();
    setView('select');
  } catch (error) {
    console.error(error);
    const stageGrid = document.getElementById('stageGrid');
    if (stageGrid) {
      const box = document.createElement('div');
      box.className = 'wordbuild-error-box';
      const title = document.createElement('strong');
      title.textContent = '꼬리 물기 연상 초기화 실패';
      const detail = document.createElement('div');
      detail.textContent = String(error && error.message ? error.message : error);
      box.append(title, detail);
      stageGrid.replaceChildren(box);
    }
    window.CARDLAB_ASSOCIATION_DEBUG = {
      stages: [],
      guide: {},
      error: String(error && error.stack ? error.stack : error)
    };
  }
})();
