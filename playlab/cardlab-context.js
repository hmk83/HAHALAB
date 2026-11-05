(function () {
  'use strict';

  try {
    const PAGE_CONFIG = window.CARDLAB_CONTEXT_PAGE_CONFIG || {};
    const PAGE_MAX_QUESTION_COUNT = clamp(Number(PAGE_CONFIG.maxRunQuestionCount || PAGE_CONFIG.runQuestionCountMax || 8) || 8, 5, 10);
    const STAGE_COLORS = [
      { accent: '#6fc7ff', soft: 'rgba(111, 199, 255, 0.16)' },
      { accent: '#7ad7a8', soft: 'rgba(122, 215, 168, 0.16)' },
      { accent: '#83d6ff', soft: 'rgba(131, 214, 255, 0.16)' },
      { accent: '#f4c75d', soft: 'rgba(244, 199, 93, 0.16)' },
      { accent: '#ffb347', soft: 'rgba(255, 179, 71, 0.16)' },
      { accent: '#ff9f1a', soft: 'rgba(255, 159, 26, 0.16)' }
    ];

    const COURSE_GUIDE = {
      title: '상황맞춤 어휘 코스 안내',
      summary: '상황맞춤 조사 연결 학습입니다. 유아 1~3과 초등 1~6학년, 학년별 3단계로 나뉘며, 각 스테이지는 문항 풀에서 무작위로 뽑아 새 문항처럼 풀 수 있어요.',
      learningFlow: [
        '유아: 색, 모양, 동물, 탈것처럼 눈에 보이는 조사부터 익히는 단계',
        '초등 1학년: 가/이, 는/은, 를/을처럼 문장 핵심 조사를 구별하는 단계',
        '초등 2학년: 에, 에서, 로/으로처럼 장소와 도구를 넓히는 단계',
        '초등 3학년: 와/과, 하고, 에게/한테처럼 연결과 관계를 익히는 단계',
        '초등 4학년: 께서, 께, 부터, 까지처럼 높임과 범위를 익히는 단계',
        '초등 5학년: 도, 만, 밖에처럼 의미를 좁히고 넓히는 단계',
        '초등 6학년: 보다, 처럼, 쯤,씩, 마다처럼 비교와 수량을 정교하게 읽는 단계'
      ],
      questionRules: [
        '각 문항은 문장 속 빈칸 1개 이상을 중심으로 풀어요.',
        '선택지는 정답 1개와 방해 낱말 2개로 구성돼요.',
        '클릭으로 바로 답할 수 있고, 드래그해서 문장 안에 넣을 수도 있어요.'
      ],
      timingRules: [
        '스테이지마다 10문항을 무작위로 출제해요.',
        '정답을 맞히면 완성된 문장을 보고 다음 문제로 넘어가요.',
        '오답은 즉시 피드백을 보여 주고 다시 풀 수 있어요.'
      ]
    };

    const STAGES = Array.isArray(window.HAHA_LAB_CONTEXT_STAGE_TEMPLATES) && window.HAHA_LAB_CONTEXT_STAGE_TEMPLATES.length
      ? window.HAHA_LAB_CONTEXT_STAGE_TEMPLATES.map(normalizeStage)
      : fallbackStages();

    const AUDIO_FILES = {
      select: '../sound/select.mp3',
      correct: '../sound/correct.mp3',
      wrong: '../sound/error.mp3',
      complete: '../sound/happy_victory.mp3'
    };
    const QUESTION_VOICE_DIR = String(PAGE_CONFIG.questionVoiceDir || '../sound/cardlab-context/');
    const QUESTION_VOICE_PREFIX = String(PAGE_CONFIG.questionVoicePrefix || 'cardlab-context');
    const RESULT_VOICE_DIR = String(PAGE_CONFIG.resultVoiceDir || '');
    const RESULT_VOICE_PREFIX = String(PAGE_CONFIG.resultVoicePrefix || 'cardlab-context-result');
    const CHOICE_VOICE_DIR = String(PAGE_CONFIG.choiceVoiceDir || '');
    const CHOICE_VOICE_PREFIX = String(PAGE_CONFIG.choiceVoicePrefix || QUESTION_VOICE_PREFIX);

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
    const questionTitle = document.getElementById('questionTitle');
    const sentenceCard = document.getElementById('sentenceCard');
    const sentencePrompt = document.getElementById('sentencePrompt');
    const selectionChip = document.getElementById('selectionChip');
    const hintToggle = document.getElementById('hintToggle');
    const choiceBoard = document.getElementById('choiceBoard');
    const answerModal = document.getElementById('answerModal');
    const answerModalTitle = document.getElementById('answerModalTitle');
    const answerModalSentence = document.getElementById('answerModalSentence');
    const answerModalSoundButton = document.getElementById('answerModalSoundButton');
    const answerModalNextButton = document.getElementById('answerModalNextButton');
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
    const effectLayer = document.getElementById('associationEffectLayer');

    if (!stageSelectView || !introView || !buildView || !completeView || !stageGrid || !shellTitle || !shellStageLabel || !stageSelectButton || !helpButton || !introBadge || !introTitle || !introSubtitle || !introLevelCopy || !introMissionCopy || !introDescription || !introStartButton || !introBackButton || !questionProgressChip || !questionTitle || !sentenceCard || !sentencePrompt || !selectionChip || !choiceBoard || !answerModal || !answerModalTitle || !answerModalSentence || !answerModalNextButton || !completeTitle || !completeCorrectCount || !completeWrongCount || !completeTotalCount || !completeStageButtonBack || !completeRetryButton || !confirmModal || !confirmModalTitle || !confirmModalDesc || !confirmModalOk || !confirmModalCancel || !effectLayer) {
      return;
    }

    const audioCache = new Map();
    const narrationCache = new Map();
    const effectAudioCache = new Map();
    const questionVoiceIndex = buildQuestionVoiceIndex();
    const resultVoiceIndex = RESULT_VOICE_DIR ? buildResultVoiceIndex() : new Map();
    const choiceVoiceIndex = CHOICE_VOICE_DIR ? buildChoiceVoiceIndex() : new Map();
    let audioEnabled = true;
    let activeAudio = null;
    let activeNarrationAudio = null;
    let activeNarrationFinish = null;
    let activeEffectAudio = null;
    let advanceTimer = null;
    let narrationSequenceToken = 0;
    let narrationDelayTimer = null;
    let answerModalDelayTimer = null;
    let hintFlashTimer = null;
    let completionFxPlayed = false;

    const state = {
      phase: 'select',
      selectedStageId: getInitialStageId(),
      selectionBackground: '',
      learningBackground: '',
      pendingModalAction: '',
      answerModalOpen: false,
      showHint: false,
      run: null
    };
    let stageLaunchLock = false;

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

    function sampleByAnswerBalance(list, count) {
      const targetCount = Math.max(0, Math.min(Array.isArray(list) ? list.length : 0, Number(count || 0)));
      if (!targetCount) return [];
      const buckets = new Map();
      (Array.isArray(list) ? list : []).forEach((item, index) => {
        const answerKey = normalizeText(item?.answer || item?.word || '');
        const key = answerKey || `__empty_${index}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(item);
      });
      const groups = shuffle(Array.from(buckets.values()).map((group) => shuffle(group)));
      const picked = [];
      while (picked.length < targetCount) {
        let advanced = false;
        for (const group of groups) {
          if (!group.length) continue;
          picked.push(group.shift());
          advanced = true;
          if (picked.length >= targetCount) break;
        }
        if (!advanced) break;
      }
      if (picked.length < targetCount) {
        const chosen = new Set(picked);
        const remaining = shuffle((Array.isArray(list) ? list : []).filter((item) => !chosen.has(item)));
        picked.push(...remaining.slice(0, targetCount - picked.length));
      }
      return picked;
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

    function splitCompoundAnswer(value) {
      return String(value || '')
        .split(/\s*-\s*/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    function normalizeQuestionText(value) {
      const text = String(value || '').trim();
      const stripped = PAGE_CONFIG.stripQuestionNumbers
        ? text.replace(/^\d+\.\s*/, '')
        : text;
      return stripped
        .replace(/\s+([.,!?])/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function buildSentenceMarkup(question) {
      const promptText = normalizeQuestionText(question?.promptText || question?.sentence || '');
      if (!promptText) return '';
      const answerParts = Array.isArray(question?.answerParts) && question.answerParts.length
        ? question.answerParts
        : splitCompoundAnswer(question?.answer || '');
      const blankCount = Math.max(1, Number(question?.blankCount || 1));
      const usesCompoundAnswer = answerParts.length > 1 && blankCount > 1;
      const fragments = promptText.split('____');
      const blankTotal = Math.max(0, fragments.length - 1);

      function buildFragmentMarkup(fragment, shouldBreakAfterFinalPeriod = false) {
        const text = String(fragment || '');
        if (!PAGE_CONFIG.breakPromptAfterPeriod) {
          return `<span class="context-sentence-fragment">${escapeHtml(text)}</span>`;
        }

        const parts = [];
        let segment = '';
        for (let index = 0; index < text.length; index += 1) {
          const character = text[index];
          segment += character;
          if (character === '.' && (text.slice(index + 1).trim() || shouldBreakAfterFinalPeriod)) {
            parts.push(`<span class="context-sentence-fragment">${escapeHtml(segment.trimEnd())}</span>`);
            parts.push('<span class="context-sentence-break" aria-hidden="true"></span>');
            segment = '';
            while (text[index + 1] === ' ') index += 1;
          }
        }
        if (segment || !parts.length) {
          parts.push(`<span class="context-sentence-fragment">${escapeHtml(segment)}</span>`);
        }
        return parts.join('');
      }

      sentencePrompt.dataset.blankCount = String(blankTotal || 1);
      return fragments.map((fragment, index) => {
        const fragmentMarkup = buildFragmentMarkup(fragment, index < blankTotal);
        if (index >= blankTotal) return fragmentMarkup;
        const slotValue = question?.solved
          ? (usesCompoundAnswer
            ? (answerParts[index] || answerParts[answerParts.length - 1] || question?.answer || '')
            : (question?.filledWord || question?.answer || ''))
          : '____';
        const slotClasses = ['context-answer-slot'];
        if (question?.solved) slotClasses.push('is-filled');
        if (!question?.solved && question?.errorChoiceId && question?.errorChoiceId === question?.selectedChoiceId) {
          slotClasses.push('is-wrong');
        }
        if (blankTotal > 1) slotClasses.push('is-multi');
        return '' +
          fragmentMarkup +
          `<button type="button" class="${slotClasses.join(' ')}" data-slot-index="${index}" aria-label="빈칸 ${index + 1}" ${question?.solved ? 'disabled' : ''}>${escapeHtml(slotValue)}</button>`;
      }).join('');
    }

    function normalizeQuestion(question, index = 0) {
      const questionId = String(question?.id || `context-q-${String(index + 1).padStart(2, '0')}`);
      const answer = String(question?.answer || question?.word || '').trim();
      const answerParts = Array.isArray(question?.answerParts) && question.answerParts.length
        ? question.answerParts.map((item) => String(item || '').trim()).filter(Boolean)
        : splitCompoundAnswer(answer);
      const distractors = uniqueWords((question?.choices || [])
        .map((choice) => String(choice?.value || '').trim())
        .filter((value) => value && value !== answer))
        .slice(0, 3);
      const choiceValues = uniqueWords([answer, ...distractors]);
      const choices = (choiceValues.length ? shuffle(choiceValues) : [''])
        .filter(Boolean)
        .map((value, choiceIndex) => ({
          id: `${questionId}-choice-${choiceIndex}`,
          value,
          isCorrect: value === answer
        }));

      return {
        id: questionId,
        promptText: normalizeQuestionText(question?.promptText || question?.sentence || ''),
        sentence: normalizeQuestionText(question?.sentence || question?.promptText || ''),
        answer,
        answerParts,
        blankCount: Math.max(1, Number(question?.blankCount || answerParts.length || 1)),
        hintText: String(question?.hintText || '').trim(),
        choices
      };
    }

    function normalizeStage(stage, index = 0) {
      const fallbackColor = STAGE_COLORS[index % STAGE_COLORS.length];
      return {
        id: String(stage?.id || `context-${String(index + 1).padStart(2, '0')}`),
        title: String(stage?.title || `도입 ${String(index + 1).padStart(2, '0')}`),
        schoolLevelLabel: String(stage?.schoolLevelLabel || `초등 ${index + 1}`),
        bandLabel: String(stage?.bandLabel || (index === 0 ? '도입' : index === 1 ? '기초' : index === 2 ? '확장' : index === 3 ? '응용' : index === 4 ? '심화' : '마스터')),
        descriptor: String(stage?.descriptor || ''),
        grammarFocus: String(stage?.grammarFocus || ''),
        goalCopy: String(stage?.goalCopy || ''),
        questionPoolLabel: String(stage?.questionPoolLabel || '문항풀 80개'),
        runQuestionCount: clamp(Number(stage?.runQuestionCount || 8) || 8, 5, PAGE_MAX_QUESTION_COUNT),
        questions: Array.isArray(stage?.questions) ? stage.questions.map(normalizeQuestion) : [],
        accent: String(stage?.accent || fallbackColor.accent),
        soft: String(stage?.soft || fallbackColor.soft)
      };
    }

    function fallbackStages() {
      return Array.from({ length: 6 }, (_, index) => normalizeStage({
        id: `context-${String(index + 1).padStart(2, '0')}`,
        title: `${index === 0 ? '도입' : index === 1 ? '기초' : index === 2 ? '확장' : index === 3 ? '응용' : index === 4 ? '심화' : '마스터'} ${String(index + 1).padStart(2, '0')}`,
        schoolLevelLabel: `초등 ${index + 1}`,
        bandLabel: index === 0 ? '도입' : index === 1 ? '기초' : index === 2 ? '확장' : index === 3 ? '응용' : index === 4 ? '심화' : '마스터',
        descriptor: '상황맞춤 어휘',
        grammarFocus: '문장 이해',
        goalCopy: '문장 속 빈칸에 알맞은 낱말을 찾아 넣어 보세요.',
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
      if (advanceTimer) {
        window.clearTimeout(advanceTimer);
        advanceTimer = null;
      }
      if (window.speechSynthesis && typeof window.speechSynthesis.cancel === 'function') {
        window.speechSynthesis.cancel();
      }
      stopNarrationAudio();
      stopEffectAudio();
      stopCachedAudio(audioCache);
      stopCachedAudio(narrationCache);
      stopCachedAudio(effectAudioCache);
    }

    function resetAudioElement(audio) {
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_error) {
        // ignore
      }
    }

    function stopCachedAudio(cache) {
      if (!cache || typeof cache.forEach !== 'function') return;
      cache.forEach((audio) => {
        resetAudioElement(audio);
      });
    }

    function stopNarrationAudio() {
      const audio = activeNarrationAudio;
      const finish = activeNarrationFinish;
      activeNarrationAudio = null;
      activeNarrationFinish = null;
      if (!audio) {
        if (finish) finish(false);
        return;
      }
      resetAudioElement(audio);
      if (finish) finish(false);
    }

    function stopEffectAudio() {
      if (!activeEffectAudio) return;
      resetAudioElement(activeEffectAudio);
      activeEffectAudio = null;
    }

    function getEffectAudio(path) {
      const normalized = String(path || '').trim();
      if (!normalized) return null;
      let audio = effectAudioCache.get(normalized);
      if (!audio) {
        audio = new Audio(normalized);
        audio.preload = 'auto';
        effectAudioCache.set(normalized, audio);
      }
      return audio;
    }

    function preloadEffectSounds() {
      Object.keys(AUDIO_FILES).forEach((key) => {
        const audio = getEffectAudio(AUDIO_FILES[key]);
        if (!audio) return;
        try {
          audio.load();
        } catch (_error) {
          // ignore
        }
      });
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
          if (activeNarrationFinish === finish) {
            activeNarrationFinish = null;
          }
          if (activeNarrationAudio === audio) {
            activeNarrationAudio = null;
          }
          resolve(Boolean(success));
        };
        activeNarrationFinish = finish;
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

    function playEffectAndWait(path, volume, maxWaitMs = 1200) {
      const normalized = String(path || '').trim();
      if (!normalized || !audioEnabled) return Promise.resolve(false);
      try {
        stopEffectAudio();
        const audio = getEffectAudio(normalized);
        if (!audio) return Promise.resolve(false);
        if (typeof volume === 'number') {
          audio.volume = clamp(volume, 0, 1);
        }
        activeEffectAudio = audio;
        return new Promise((resolve) => {
          let finished = false;
          const timeout = window.setTimeout(() => finish(true), Math.max(120, Number(maxWaitMs) || 1200));
          const finish = (success) => {
            if (finished) return;
            finished = true;
            window.clearTimeout(timeout);
            if (activeEffectAudio === audio) {
              activeEffectAudio = null;
            }
            resolve(Boolean(success));
          };
          audio.onended = () => finish(true);
          audio.onerror = () => finish(false);
          try {
            audio.currentTime = 0;
            audio.play().catch(() => finish(false));
          } catch (_error) {
            finish(false);
          }
        });
      } catch (_error) {
        return Promise.resolve(false);
      }
    }

    function playEffect(path, volume) {
      void playEffectAndWait(path, volume);
      return true;
    }

    function buildQuestionVoiceIndex() {
      const manifestMapKey = String(PAGE_CONFIG.questionVoiceMapKey || '').trim();
      const manifestMap = manifestMapKey && window.CARDLAB_AUDIO_MAPS && window.CARDLAB_AUDIO_MAPS[manifestMapKey];
      if (manifestMap && typeof manifestMap === 'object') {
        return new Map(Object.entries(manifestMap).map(([text, sequence]) => [String(text), Number(sequence)]));
      }
      const mapping = new Map();
      let sequence = 1;
      STAGES.forEach((stage) => {
        (Array.isArray(stage.questions) ? stage.questions : []).forEach((question) => {
          const id = String(question?.id || '').trim();
          if (!id || mapping.has(id)) return;
          mapping.set(id, sequence);
          sequence += 1;
        });
      });
      return mapping;
    }

    function getConfiguredSoundManifest(kind) {
      const capitalizedKind = kind === 'result' ? 'Result' : 'Choice';
      const explicitStudyName = String(PAGE_CONFIG[`${kind}SoundManifestStudyName`] || '').trim();
      const explicitGlobalName = String(PAGE_CONFIG[`${kind}SoundManifestGlobalName`] || '').trim();
      const manifestStore = window.CARDLAB_SOUND_MANIFESTS;

      if (explicitStudyName && manifestStore && typeof manifestStore === 'object' && manifestStore[explicitStudyName]) {
        return manifestStore[explicitStudyName];
      }
      if (explicitGlobalName && window[explicitGlobalName]) {
        return window[explicitGlobalName];
      }

      const fallbackStudyName = String(PAGE_CONFIG[`${kind}VoiceStudyName`] || PAGE_CONFIG[`${capitalizedKind.toLowerCase()}VoiceStudyName`] || '').trim();
      if (fallbackStudyName && manifestStore && typeof manifestStore === 'object' && manifestStore[fallbackStudyName]) {
        return manifestStore[fallbackStudyName];
      }

      return window.CARDLAB_SOUND_MANIFEST || null;
    }

    function buildChoiceVoiceIndex() {
      const soundManifest = getConfiguredSoundManifest('choice');
      const manifestItems = soundManifest && Array.isArray(soundManifest.items) ? soundManifest.items : null;
      if (manifestItems && manifestItems.length) {
        return new Map(manifestItems
          .map((item) => {
            const key = normalizeText(item?.normalizedText || item?.text || '');
            const filePath = resolveManifestAudioPath(item?.filePath || item?.file || '', CHOICE_VOICE_DIR);
            return key && filePath ? [key, filePath] : null;
          })
          .filter(Boolean));
      }

      const manifestMapKey = String(PAGE_CONFIG.choiceVoiceMapKey || '').trim();
      const manifestMap = manifestMapKey && window.CARDLAB_AUDIO_MAPS && window.CARDLAB_AUDIO_MAPS[manifestMapKey];
      if (manifestMap && typeof manifestMap === 'object') {
        return new Map(Object.entries(manifestMap).map(([text, sequence]) => [String(text), Number(sequence)]));
      }
      const mapping = new Map();
      let sequence = 1;
      STAGES.forEach((stage) => {
        (Array.isArray(stage.questions) ? stage.questions : []).forEach((question) => {
          const answer = String(question?.answer || question?.word || '').trim();
          const choices = Array.isArray(question?.choices) ? question.choices : [];
          [answer, ...choices.map((choice) => String(choice?.value || '').trim())].forEach((word) => {
            const key = normalizeText(word);
            if (!key || mapping.has(key)) return;
            mapping.set(key, sequence);
            sequence += 1;
          });
        });
      });
      return mapping;
    }

    function buildResultVoiceIndex() {
      const soundManifest = getConfiguredSoundManifest('result');
      const manifestItems = soundManifest && Array.isArray(soundManifest.items) ? soundManifest.items : null;
      const manifestByQuestionId = manifestItems && manifestItems.length
        ? new Map(manifestItems
          .map((item) => {
            const questionId = String(item?.questionId || item?.id || '').trim();
            const filePath = resolveManifestAudioPath(item?.filePath || item?.file || '', RESULT_VOICE_DIR);
            return questionId && filePath ? [questionId, filePath] : null;
          })
          .filter(Boolean))
        : null;
      const manifestHasQuestionIds = Boolean(manifestByQuestionId && manifestByQuestionId.size);
      const mapping = new Map();
      let sequence = 1;

      STAGES.forEach((stage) => {
        (Array.isArray(stage.questions) ? stage.questions : []).forEach((question) => {
          const questionId = String(question?.id || '').trim();
          if (!questionId) {
            sequence += 1;
            return;
          }
          const manifestItem = manifestItems && manifestItems[sequence - 1];
          const sequenceFile = manifestItem && String(manifestItem.filePath || manifestItem.file || '').trim();
          const manifestFile = manifestByQuestionId?.get(questionId)
            || (!manifestHasQuestionIds && sequenceFile ? resolveManifestAudioPath(sequenceFile, RESULT_VOICE_DIR) : '');
          if (manifestFile) {
            mapping.set(questionId, manifestFile);
          } else if (!manifestHasQuestionIds) {
            mapping.set(questionId, `${RESULT_VOICE_DIR}${RESULT_VOICE_PREFIX}-${String(sequence).padStart(4, '0')}.mp3`);
          }
          sequence += 1;
        });
      });

      return mapping;
    }

    function resolveManifestAudioPath(filePath, baseDir) {
      const normalizedFilePath = String(filePath || '').trim();
      if (!normalizedFilePath) return '';
      if (/^(?:[a-z]+:|\/|\.{1,2}\/)/i.test(normalizedFilePath)) {
        return normalizedFilePath;
      }
      return `${String(baseDir || '').trim()}${normalizedFilePath}`;
    }

    function getQuestionVoicePath(question) {
      const manifestMapKey = String(PAGE_CONFIG.questionVoiceMapKey || '').trim();
      const questionText = normalizeText(question?.sentence || question?.promptText || '');
      const lookupKey = manifestMapKey ? questionText : String(question?.id || '').trim();
      if (!lookupKey) return '';
      const sequence = questionVoiceIndex.get(lookupKey);
      if (!sequence) return '';
      return `${QUESTION_VOICE_DIR}${QUESTION_VOICE_PREFIX}-${String(sequence).padStart(4, '0')}.mp3`;
    }

    function getChoiceVoicePath(choiceText) {
      if (!CHOICE_VOICE_DIR) return '';
      const key = normalizeText(choiceText);
      if (!key) return '';
      const lookupValue = choiceVoiceIndex.get(key);
      if (!lookupValue) return '';
      if (typeof lookupValue === 'string') return lookupValue;
      return `${CHOICE_VOICE_DIR}${CHOICE_VOICE_PREFIX}-${String(lookupValue).padStart(4, '0')}.mp3`;
    }

    function getResultVoicePath(question) {
      if (!RESULT_VOICE_DIR) return '';
      const questionId = String(question?.id || '').trim();
      if (!questionId) return '';
      return resultVoiceIndex.get(questionId) || '';
    }

    function getNarrationAudio(path) {
      const normalized = String(path || '').trim();
      if (!normalized) return null;
      let audio = narrationCache.get(normalized);
      if (!audio) {
        audio = new Audio(normalized);
        audio.preload = 'auto';
        narrationCache.set(normalized, audio);
      }
      return audio;
    }

    function preloadNarrationPath(path) {
      const audio = getNarrationAudio(path);
      if (!audio) return;
      try {
        audio.load();
      } catch (_error) {
        // ignore
      }
    }

    function preloadRunNarrations(run) {
      const questions = Array.isArray(run?.questions) ? run.questions : [];
      questions.forEach((question) => {
        const resultPath = getResultVoicePath(question);
        if (resultPath) {
          preloadNarrationPath(resultPath);
          return;
        }
        preloadNarrationPath(getQuestionVoicePath(question));
        preloadNarrationPath(getChoiceVoicePath(question?.answer || ''));
      });
    }

    function playNarrationAudio(path) {
      const normalized = String(path || '').trim();
      if (!normalized) return Promise.resolve(false);
      if (!audioEnabled) return Promise.resolve(false);
      if (advanceTimer) {
        window.clearTimeout(advanceTimer);
        advanceTimer = null;
      }
      stopNarrationAudio();
      const audio = getNarrationAudio(normalized);
      if (!audio) return Promise.resolve(false);
      activeNarrationAudio = audio;
      return new Promise((resolve) => {
        let finished = false;
        const finish = (success) => {
          if (finished) return;
          finished = true;
          window.clearTimeout(timeout);
          if (activeNarrationFinish === finish) {
            activeNarrationFinish = null;
          }
          if (activeNarrationAudio === audio) {
            activeNarrationAudio = null;
          }
          resolve(Boolean(success));
        };
        const timeout = window.setTimeout(() => finish(false), 15000);
        activeNarrationFinish = finish;
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

    function playQuestionNarration(question) {
      const path = getQuestionVoicePath(question);
      if (!path) return Promise.resolve(false);
      return playNarrationAudio(path);
    }

    function playChoiceNarration(choiceText) {
      const text = String(choiceText || '').trim();
      if (!text) return Promise.resolve(false);
      const path = getChoiceVoicePath(text);
      if (!path) return Promise.resolve(false);
      return playNarrationAudio(path);
    }

    function speakText(text) {
      const value = String(text || '').trim();
      if (!value || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        return Promise.resolve(false);
      }
      stopAudio();
      window.speechSynthesis.cancel();
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(value);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.9;
        utterance.pitch = 1.02;
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);
        window.speechSynthesis.speak(utterance);
      });
    }

    async function playResultNarration(question) {
      const token = narrationSequenceToken;
      const mergedPath = getResultVoicePath(question);
      if (mergedPath) {
        const mergedPlayed = await playNarrationAudio(mergedPath);
        if (mergedPlayed) return true;
      }
      if (token !== narrationSequenceToken || getCurrentQuestion() !== question || !question?.solved) {
        return false;
      }
      if (PAGE_CONFIG.disableLegacyResultNarrationFallback) {
        return false;
      }
      const questionPlayed = await playQuestionNarration(question);
      if (questionPlayed) {
        const delayCompleted = await waitForNarrationDelay(120, token);
        if (!delayCompleted) return false;
      }
      if (token !== narrationSequenceToken) return false;
      return playChoiceNarration(question?.answer || '');
    }

    function playAnswerModalNarration() {
      const question = getCurrentQuestion();
      if (!question || !question.solved) return;
      if (PAGE_CONFIG.answerModalSoundMode === 'sentenceOnly') {
        void speakText(getSolvedSentence(question));
        return;
      }
      void playResultNarration(question);
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

    function getCurrentQuestion() {
      return state.run?.current || null;
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
          `    <div class="wordbuild-stage-detail">${escapeHtml(stage.goalCopy || stage.descriptor || '')}</div>` +
          '  </div>' +
          '</a>';
      }).join('');

      stageGrid.querySelectorAll('.wordbuild-stage-card').forEach((button) => {
        const stageId = button.getAttribute('data-stage-id') || '';
        button.addEventListener('click', (event) => {
          event.preventDefault();
          window.location.hash = `#${stageId}`;
          launchStage(stageId, button);
        });
        button.addEventListener('pointerup', (event) => {
          if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
          event.preventDefault();
          window.location.hash = `#${stageId}`;
          launchStage(stageId, button);
        });
      });
    }

    function launchStage(stageId, sourceElement) {
      if (stageLaunchLock) return;
      stageLaunchLock = true;
      const nextStageId = String(stageId || '').trim();
      if (!nextStageId) {
        stageLaunchLock = false;
        return;
      }
      if (state.selectedStageId !== nextStageId) {
        state.selectedStageId = nextStageId;
        renderStageCards();
      }
      if (sourceElement) {
        pulseElement(sourceElement, 'is-selected', 260);
      }
      playEffect(AUDIO_FILES.select, 0.72);
      window.setTimeout(() => {
        stageLaunchLock = false;
        startStage({ requestFullscreen: PAGE_CONFIG.requestFullscreenOnStart !== false });
      }, 40);
    }

    function renderIntro() {
      const stage = pickStage();
      introBadge.textContent = `${stage.bandLabel} · ${stage.schoolLevelLabel}`;
      introBadge.classList.remove('shell-hidden');
      introTitle.textContent = stage.title;
      introTitle.classList.remove('shell-hidden');
      introSubtitle.textContent = stage.goalCopy || COURSE_GUIDE.summary || '';
      introSubtitle.classList.remove('shell-hidden');
      introLevelCopy.textContent = `${stage.schoolLevelLabel} 기준 · ${stage.descriptor || stage.grammarFocus || '상황맞춤 어휘'}`;
      introMissionCopy.textContent = `${stage.goalCopy || COURSE_GUIDE.summary || ''} · ${stage.questionPoolLabel || '문항풀 80개'} 중 ${stage.runQuestionCount}문항을 무작위로 풀어요.`;
      introDescription.textContent = '빈칸에 알맞은 낱말을 넣어 보세요.';
      introDescription.classList.remove('shell-hidden');
    }

    function renderSelectionChip(text) {
      selectionChip.textContent = text || '선택한 낱말 없음';
    }

    function renderHint() {
      if (!hintToggle) return;
      hintToggle.setAttribute('aria-checked', state.showHint ? 'true' : 'false');
    }

    function toggleHint() {
      state.showHint = !state.showHint;
      renderHint();
      if (!state.showHint) {
        if (window.CardlabMeaningToast && typeof window.CardlabMeaningToast.hide === 'function') {
          window.CardlabMeaningToast.hide();
        }
        return;
      }
      const question = getCurrentQuestion();
      const hintText = question?.hintText || '문장을 읽고 빈칸에 들어갈 낱말을 찾아보세요.';
      if (window.CardlabMeaningToast && typeof window.CardlabMeaningToast.show === 'function') {
        window.CardlabMeaningToast.show({ title: '힌트', word: hintText, meaning: '' });
      }
    }

    function buildRun(stage) {
      const pool = Array.isArray(stage.questions) ? stage.questions : [];
      const questionCount = clamp(Number(stage.runQuestionCount || 8) || 8, 5, Math.min(PAGE_MAX_QUESTION_COUNT, pool.length || PAGE_MAX_QUESTION_COUNT));
      const questions = (PAGE_CONFIG.preferUniqueAnswers
        ? sampleByAnswerBalance(pool, questionCount)
        : sample(pool, questionCount)
      ).map((question) => ({
        id: String(question.id || ''),
        promptText: String(question.promptText || ''),
        sentence: String(question.sentence || ''),
        answer: String(question.answer || ''),
        hintText: String(question.hintText || ''),
        choices: shuffle((question.choices || []).map((choice, index) => ({
          id: String(choice?.id || `${question.id}-choice-${index}`),
          value: String(choice?.value || '').trim(),
          isCorrect: Boolean(choice?.isCorrect || String(choice?.value || '').trim() === String(question.answer || '').trim())
        }))),
        selectedChoiceId: '',
        errorChoiceId: '',
        solved: false,
        filledWord: '',
        startedAtMs: null,
        attempts: []
      }));

      return {
        id: `${stage.id}-${Date.now()}`,
        sessionId: crypto.randomUUID(),
        startedAtMs: Date.now(),
        completedAtMs: null,
        saveStarted: false,
        stage,
        questions,
        index: 0,
        current: null,
        correctCount: 0,
        wrongCount: 0
      };
    }

    function renderQuestion() {
      const question = getCurrentQuestion();
      if (!question) {
        questionProgressChip.textContent = '문항 0 / 0';
        questionTitle.textContent = '';
        sentencePrompt.innerHTML = '';
        sentencePrompt.removeAttribute('data-blank-count');
        sentencePrompt.classList.remove('is-multi');
        sentenceCard.classList.remove('is-drop-target');
        choiceBoard.innerHTML = '';
        renderSelectionChip('선택한 낱말 없음');
        renderHint();
        return;
      }

      if (question.startedAtMs === null) question.startedAtMs = Date.now();

      questionProgressChip.textContent = `문항 ${state.run.index + 1} / ${state.run.questions.length}`;
      questionTitle.textContent = question.hintText || '문장을 읽고 빈칸에 들어갈 낱말을 찾아보세요.';
      sentencePrompt.innerHTML = buildSentenceMarkup(question);
      sentencePrompt.classList.toggle('is-multi', Number(question.blankCount || 1) > 1);
      sentenceCard.classList.toggle('is-solved', Boolean(question.solved));
      sentenceCard.classList.toggle('is-drop-target', false);
      renderChoiceBoard();
      renderSelectionChip(question.solved ? `정답: ${question.answer}` : '낱말을 클릭하거나 드래그해서 빈칸에 넣어요.');
      renderHint();
    }

    function getSolvedSentence(question) {
      const promptText = normalizeQuestionText(question?.promptText || question?.sentence || '');
      const answer = String(question?.filledWord || question?.answer || '').trim();
      if (!promptText) return answer;
      const answerParts = Array.isArray(question?.answerParts) && question.answerParts.length
        ? question.answerParts
        : splitCompoundAnswer(answer);
      const blankCount = Math.max(1, Number(question?.blankCount || 1));
      let index = 0;
      return promptText.includes('____')
        ? promptText.replace(/____/g, () => {
          if (answerParts.length > 1 && blankCount <= 1) return answer;
          const value = answerParts[Math.min(index, answerParts.length - 1)] || answer;
          index += 1;
          return value;
        })
        : promptText;
    }

    function closeAnswerModal() {
      if (answerModalDelayTimer) {
        window.clearTimeout(answerModalDelayTimer);
        answerModalDelayTimer = null;
      }
      state.answerModalOpen = false;
      answerModal.classList.remove('is-active');
      answerModal.setAttribute('aria-hidden', 'true');
    }

    function openAnswerModal(question) {
      if (!question) return;
      state.answerModalOpen = true;
      answerModalTitle.textContent = '정답 확인';
      answerModalSentence.textContent = getSolvedSentence(question);
      const isLastQuestion = !state.run || state.run.index >= state.run.questions.length - 1;
      answerModalNextButton.textContent = isLastQuestion ? '학습 결과 보기' : '다음 문제';
      answerModal.classList.add('is-active');
      answerModal.setAttribute('aria-hidden', 'false');
    }

    function queueAnswerModal(question) {
      const delayMs = Math.max(0, Number(PAGE_CONFIG.answerModalDelayMs || 0));
      if (!delayMs) {
        openAnswerModal(question);
        return;
      }
      if (answerModalDelayTimer) {
        window.clearTimeout(answerModalDelayTimer);
        answerModalDelayTimer = null;
      }
      const token = narrationSequenceToken;
      answerModalDelayTimer = window.setTimeout(() => {
        answerModalDelayTimer = null;
        if (token !== narrationSequenceToken || getCurrentQuestion() !== question || !question?.solved) return;
        openAnswerModal(question);
      }, delayMs);
    }

    function continueAfterAnswerModal() {
      stopAudio();
      closeAnswerModal();
      if (!state.run) return;
      loadNextQuestion();
    }

    function renderChoiceBoard() {
      const question = getCurrentQuestion();
      if (!question) {
        choiceBoard.innerHTML = '';
        return;
      }

      choiceBoard.innerHTML = question.choices.map((choice) => {
        const matched = question.solved && choice.isCorrect;
        const wrong = question.errorChoiceId === choice.id;
        const selected = question.selectedChoiceId === choice.id;
        return '' +
          `<button type="button" class="association-choice-card ${matched ? 'is-matched' : ''} ${wrong ? 'is-wrong' : ''} ${selected ? 'is-selected' : ''}" data-choice-id="${escapeHtml(choice.id)}" ${question.solved ? 'disabled' : ''} draggable="${question.solved ? 'false' : 'true'}">` +
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
          }
          sentenceCard.classList.remove('is-drop-target');
        });
        button.addEventListener('click', () => {
          if (button.disabled) return;
          const question = getCurrentQuestion();
          if (!question) return;
          const choiceId = button.getAttribute('data-choice-id') || '';
          const completed = commitChoice(choiceId, button);
          if (!completed && PAGE_CONFIG.narrateChoiceOnClick !== false && !PAGE_CONFIG.narrateWrongChoiceOnError) {
            void playChoiceNarration(button.textContent || '');
          }
        });
      });
    }

    function renderComplete() {
      const run = state.run;
      if (!run || !run.questions.length || run.questions.some((question) => !question.solved)) return;
      const stage = run.stage;
      completeTitle.textContent = `${stage.title} 완료!`;
      completeCorrectCount.textContent = `${run.correctCount}문항`;
      completeWrongCount.textContent = `${run.wrongCount}회`;
      completeTotalCount.textContent = `${run.questions.length}문항`;
      saveCompletedRun(run);

      if (!completionFxPlayed) {
        completionFxPlayed = true;
        pulseElement(completeView.querySelector('.wordbuild-complete-hero'), 'is-complete-bounce', 900);
        spawnParticles('complete', completeView, 24);
        playEffect(AUDIO_FILES.complete, 0.9);
      }
    }

    function saveCompletedRun(run) {
      if (!run || run.saveStarted || !run.questions.length || run.questions.some((question) => !question.solved)) return;
      const harness = window.HahaLabLearningHarness;
      const context = harness && typeof harness.readLaunchContext === 'function' ? harness.readLaunchContext() : null;
      if (!harness || typeof harness.recordSession !== 'function' || !context || context.anonymous === true || !context.teacherId || !context.clientId) return;
      run.completedAtMs = run.completedAtMs || Date.now();
      const elapsedMs = Math.max(0, run.completedAtMs - run.startedAtMs);
      const title = String(PAGE_CONFIG.title || PAGE_CONFIG.pageTitle || '문맥 카드 학습');
      const questionLogs = run.questions.map((question) => {
        const attempts = question.attempts.map((attempt) => ({ ...attempt }));
        const solvedAttempt = attempts.find((attempt) => attempt.correct);
        return {
          itemId: question.id,
          questionText: question.promptText || question.sentence,
          choices: question.choices.map((choice) => ({ id: choice.id, value: choice.value, correct: choice.isCorrect })),
          response: question.filledWord,
          expectedResponse: question.answer,
          correct: question.solved,
          wrongAttempts: attempts.filter((attempt) => !attempt.correct).length,
          attempts,
          taskElapsedMs: solvedAttempt ? solvedAttempt.taskElapsedMs : null,
          timingSource: 'browser-task-elapsed-including-instructions'
        };
      });
      const perfectCount = questionLogs.filter((log) => log.attempts.length === 1 && log.attempts[0].correct).length;
      const accuracyRate = Math.round((run.correctCount / run.questions.length) * 100);
      const input = {
        reportEvidenceMode: 'observed-only',
        reportScope: 'cardlab',
        reportType: 'cardlab-context',
        title,
        stageTitle: run.stage.title,
        totalItems: run.questions.length,
        totalQuestions: run.questions.length,
        correctCount: run.correctCount,
        completionCount: run.correctCount,
        wrongCount: run.wrongCount,
        perfectCount,
        firstTryRate: Math.round((perfectCount / run.questions.length) * 100),
        accuracyRate,
        elapsedMs,
        startedAtMs: run.startedAtMs,
        completedAtMs: run.completedAtMs,
        avgQuestionMs: null,
        questionLogs
      };
      run.saveStarted = true;
      try {
        harness.recordSession({
          sessionId: run.sessionId,
          labKind: 'cardlab',
          reportScope: 'cardlab',
          curriculumKey: String(window.location.pathname).split('/').pop().replace(/\.html$/i, ''),
          labTitle: title,
          stageKey: run.stage.id,
          stageTitle: run.stage.title,
          totalQuestions: run.questions.length,
          correctCount: run.correctCount,
          wrongCount: run.wrongCount,
          accuracyScore: accuracyRate,
          score: accuracyRate,
          startedAtMs: run.startedAtMs,
          durationSeconds: elapsedMs / 1000,
          reportType: 'cardlab-context',
          reportInput: input,
          questionSnapshot: questionLogs.map((log) => ({ itemId: log.itemId, questionText: log.questionText, choices: log.choices, expectedResponse: log.expectedResponse })),
          resultSnapshot: questionLogs,
          details: {
            elapsed_ms: elapsedMs,
            duration_seconds: elapsedMs / 1000,
            duration_minutes: elapsedMs / 60000,
            report_integrated_score: null,
            report_cognitive_score: null,
            report_reaction_score: null,
            task_version: '20261104-context-raw-1',
            timing_source: 'browser-task-elapsed-including-instructions'
          }
        });
      } catch (error) {
        run.saveStarted = false;
        console.warn('[cardlab-context] completion save failed', error);
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
        renderQuestion();
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
        document.title = PAGE_CONFIG.pageTitle || '상황맞춤 어휘';
        return;
      }
      stageSelectButton.classList.remove('shell-hidden');
      stageSelectButton.textContent = '스테이지 선택';
      shellStageLabel.textContent = stage.title || `${stage.bandLabel} ${stage.schoolLevelLabel}`;
      shellStageLabel.classList.remove('shell-hidden');
      if (exitButton) exitButton.textContent = '학습 종료';
      document.title = `${PAGE_CONFIG.pageTitle || '상황맞춤 어휘'} · ${stage.title}`;
    }

    function openIntro() {
      stopAudio();
      state.run = null;
      completionFxPlayed = false;
      setView('intro');
    }

    function startStage(options = {}) {
      stopAudio();
      closeAnswerModal();
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      if (options.requestFullscreen !== false && PAGE_CONFIG.requestFullscreenOnStart !== false) {
        requestFullscreenMode();
      }
      const stage = pickStage();
      if (!stage) return;
      state.showHint = false;
      if (hintFlashTimer) {
        window.clearTimeout(hintFlashTimer);
        hintFlashTimer = null;
      }
      const run = buildRun(stage);
      preloadRunNarrations(run);
      state.run = run;
      run.current = run.questions[0] || null;
      state.learningBackground = pickLearningBackground();
      completionFxPlayed = false;
      setView('build');
      history.replaceState(null, '', `#${stage.id}`);
    }

    function loadNextQuestion() {
      if (!state.run) return;
      stopAudio();
      closeAnswerModal();
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
      stopAudio();
      closeAnswerModal();
      const stage = pickStage();
      if (!stage) return;
      state.selectedStageId = stage.id;
      startStage();
    }

    function goToSelection() {
      stopAudio();
      closeAnswerModal();
      if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
      state.run = null;
      state.selectionBackground = pickSelectionBackground();
      setView('select');
    }

    function openConfirmModal(action) {
      stopAudio();
      closeAnswerModal();
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
        const selectedStageCard = stageGrid.querySelector(`.wordbuild-stage-card[data-stage-id="${CSS.escape(nextStageId)}"]`);
        if (selectedStageCard) {
          launchStage(nextStageId, selectedStageCard);
        }
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
      if (PAGE_CONFIG.meaningRequiresHintToggle && hintToggle && !state.showHint) {
        if (window.CardlabMeaningToast && typeof window.CardlabMeaningToast.hide === 'function') {
          window.CardlabMeaningToast.hide();
        }
        return;
      }
      const resolvedMeaning = window.CardlabMeaningResolver && typeof window.CardlabMeaningResolver.resolve === 'function'
        ? window.CardlabMeaningResolver.resolve(word, context)
        : '';
      const value = resolvedMeaning || meaning;
      if (window.CardlabMeaningToast && typeof window.CardlabMeaningToast.show === 'function') {
        window.CardlabMeaningToast.show({ word, meaning: value });
      }
    }

    async function playCorrectFeedback(question) {
      if (!question) return false;
      const token = narrationSequenceToken;
      if (PAGE_CONFIG.playCorrectEffectOnAnswer !== false) {
        await playEffectAndWait(AUDIO_FILES.correct, 0.4, 900);
      }
      if (token !== narrationSequenceToken || getCurrentQuestion() !== question || !question.solved) {
        return false;
      }
      if (PAGE_CONFIG.playResultNarrationOnCorrect === false || question.resultNarrationPlayed) {
        return false;
      }
      question.resultNarrationPlayed = true;
      return playResultNarration(question);
    }

    function commitChoice(choiceId, sourceElement) {
      const question = getCurrentQuestion();
      const run = state.run;
      if (!question || !run || question.solved) return false;
      const choice = question.choices.find((item) => item.id === choiceId);
      if (!choice) return false;

      question.attempts.push({
        attemptNumber: question.attempts.length + 1,
        response: choice.value,
        expectedResponse: question.answer,
        correct: choice.isCorrect,
        completedAtMs: Date.now(),
        taskElapsedMs: Math.max(0, Date.now() - question.startedAtMs)
      });

      question.selectedChoiceId = choice.id;
      if (!choice.isCorrect) {
        run.wrongCount += 1;
        question.errorChoiceId = choice.id;
        vibrateWrong();
        playEffect(AUDIO_FILES.wrong, 0.4);
        if (PAGE_CONFIG.narrateWrongChoiceOnError) {
          void playChoiceNarration(choice.value || '');
        }
        pulseElement(sourceElement || choiceBoard, 'is-wrong', 420);
        if (!PAGE_CONFIG.suppressWrongFeedback) {
          showMeaningToast(choice.value, question.sentence || question.promptText || '', {
            module: 'context',
            sentence: question.sentence,
            promptText: question.promptText,
            selectedWord: choice.value,
            correctWord: question.answer
          });
        }
        renderQuestion();
        window.setTimeout(() => {
          if (getCurrentQuestion() === question && question.errorChoiceId === choice.id) {
            question.errorChoiceId = '';
            question.selectedChoiceId = '';
            renderQuestion();
          }
        }, 420);
        return false;
      }

      question.filledWord = choice.value;
      question.solved = true;
      run.correctCount += 1;
      question.errorChoiceId = '';
      question.selectedChoiceId = choice.id;
      question.resultNarrationPlayed = false;
      showMeaningToast(question.answer, question.sentence || question.promptText || '', {
        module: 'context',
        sentence: question.sentence,
        promptText: question.promptText
      });
      renderQuestion();
      pulseElement(sentenceCard, 'is-complete-bounce', 520);
      spawnParticles('correct', sentenceCard, 16);
      void playCorrectFeedback(question).finally(() => {
        if (!state.run || getCurrentQuestion() !== question || !question.solved) return;
        queueAnswerModal(question);
      });

      return true;
    }

    function bindStaticEvents() {
      stageSelectButton.addEventListener('click', () => openConfirmModal('list'));
      if (exitButton) {
        exitButton.addEventListener('click', () => openConfirmModal('exit'));
      }
      introStartButton.addEventListener('click', startStage);
      introBackButton.addEventListener('click', goToSelection);
      completeStageButtonBack.textContent = '다른 단계 선택하기';
      completeRetryButton.textContent = '현재 단계 다시 풀기';
      completeStageButtonBack.addEventListener('click', goToSelection);
      completeRetryButton.addEventListener('click', restartStage);
      if (answerModalSoundButton) {
        answerModalSoundButton.addEventListener('click', playAnswerModalNarration);
      }
      if (hintToggle) {
        hintToggle.addEventListener('click', toggleHint);
      }
      answerModalNextButton.addEventListener('click', continueAfterAnswerModal);
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
      stageGrid.addEventListener('click', (event) => {
        const button = event.target && event.target.closest ? event.target.closest('.wordbuild-stage-card') : null;
        if (!button || !stageGrid.contains(button)) return;
        launchStage(button.getAttribute('data-stage-id') || '', button);
      });
      stageGrid.addEventListener('pointerup', (event) => {
        const button = event.target && event.target.closest ? event.target.closest('.wordbuild-stage-card') : null;
        if (!button || !stageGrid.contains(button)) return;
        if (event.pointerType === 'touch' || event.pointerType === 'pen') {
          launchStage(button.getAttribute('data-stage-id') || '', button);
        }
      });
      sentenceCard.addEventListener('dragover', (event) => {
        event.preventDefault();
        const question = getCurrentQuestion();
        if (!question || question.solved) return;
        sentenceCard.classList.add('is-drop-target');
      });
      sentenceCard.addEventListener('dragleave', () => {
        sentenceCard.classList.remove('is-drop-target');
      });
      sentenceCard.addEventListener('drop', (event) => {
        event.preventDefault();
        const question = getCurrentQuestion();
        if (!question || question.solved) return;
        sentenceCard.classList.remove('is-drop-target');
        const choiceId = String(event.dataTransfer?.getData('text/plain') || question.draggedChoiceId || '');
        if (!choiceId) return;
        const sourceElement = Array.from(choiceBoard.querySelectorAll('.association-choice-card')).find((button) => button.getAttribute('data-choice-id') === choiceId) || sentenceCard;
        commitChoice(choiceId, sourceElement);
      });
      sentenceCard.addEventListener('click', () => {
        const question = getCurrentQuestion();
        if (!question || question.solved) return;
        renderSelectionChip('아래 낱말을 눌러 빈칸에 넣어 보세요.');
        pulseElement(sentenceCard, 'is-drop-target', 260);
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
    }

    function initFromStageSelection() {
      preloadEffectSounds();
      state.selectionBackground = pickSelectionBackground();
      state.learningBackground = pickLearningBackground();
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

    window.CARDLAB_CONTEXT_DEBUG = {
      stages: STAGES,
      guide: COURSE_GUIDE
    };
  } catch (error) {
    console.error(error);
    const stageGrid = document.getElementById('stageGrid');
    if (stageGrid) {
      const box = document.createElement('div');
      box.className = 'wordbuild-error-box';
      const heading = document.createElement('strong');
      heading.textContent = '상황맞춤 어휘 초기화 실패';
      const message = document.createElement('div');
      message.textContent = String(error && error.message ? error.message : error);
      box.append(heading, message);
      stageGrid.replaceChildren(box);
    }
    window.CARDLAB_CONTEXT_DEBUG = {
      stages: [],
      guide: {},
      error: String(error && error.stack ? error.stack : error)
    };
  }
})();
