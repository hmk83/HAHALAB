(function () {
  'use strict';

  const SESSION_STATE_KEY = 'cardlabSynonymCompareStateV1';
  const RETURN_PAGE_PATH = 'cardlab-synonym.html';
  const CORRECT_AUDIO_PATH = '../sound/correct.mp3';
  const SYNONYM_VOICE_DIR = '../sound/cardlab-synonym/';

  const shellStageLabel = document.getElementById('shellStageLabel');
  const compareKindChip = document.getElementById('compareKindChip');
  const comparePromptText = document.getElementById('comparePromptText');
  const compareTitle = document.getElementById('compareTitle');
  const compareProgressChip = document.getElementById('compareProgressChip');
  const compareRelationChip = document.getElementById('compareRelationChip');
  const compareDescription = document.getElementById('compareDescription');
  const comparePromptWord = document.getElementById('comparePromptWord');
  const comparePromptMeaning = document.getElementById('comparePromptMeaning');
  const compareAnswerWord = document.getElementById('compareAnswerWord');
  const compareAnswerMeaning = document.getElementById('compareAnswerMeaning');
  const comparePromptSpeaker = document.getElementById('comparePromptSpeaker');
  const compareAnswerSpeaker = document.getElementById('compareAnswerSpeaker');
  const compareNextButton = document.getElementById('compareNextButton');

  if (!shellStageLabel || !compareKindChip || !comparePromptText || !compareTitle || !compareProgressChip || !compareRelationChip || !compareDescription || !comparePromptWord || !comparePromptMeaning || !compareAnswerWord || !compareAnswerMeaning || !comparePromptSpeaker || !compareAnswerSpeaker || !compareNextButton) {
    return;
  }

  const audioCache = new Map();
  const choiceVoiceIndex = buildChoiceVoiceIndex();
  let activeAudio = null;

  function stopAudio() {
    if (!activeAudio) return;
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (_error) {
      // ignore
    }
    activeAudio = null;
  }

  function normalizeText(value) {
    return String(value == null ? '' : value)
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
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
    const stages = Array.isArray(window.HAHA_LAB_SYNONYM_STAGE_TEMPLATES) ? window.HAHA_LAB_SYNONYM_STAGE_TEMPLATES : [];
    const mapping = new Map();
    let sequence = 1;
    stages.forEach((stage) => {
      (Array.isArray(stage?.questions) ? stage.questions : []).forEach((question) => {
        const promptWord = String(question?.promptWord || question?.prompt || '').trim();
        const answer = String(question?.answer || '').trim();
        const choices = Array.isArray(question?.choices) && question.choices.length
          ? question.choices
          : [];
        [promptWord, answer, ...choices.map((choice) => String(choice?.value || '').trim())].forEach((word) => {
          const key = normalizeText(word);
          if (!key || mapping.has(key)) return;
          mapping.set(key, sequence);
          sequence += 1;
        });
      });
    });
    return mapping;
  }

  function getWordAudioPath(word) {
    const key = normalizeText(word);
    if (!key) return '';
    const sequence = choiceVoiceIndex.get(key);
    if (!sequence) return '';
    return `${SYNONYM_VOICE_DIR}cardlab-synonym-${String(sequence).padStart(4, '0')}.mp3`;
  }

  function playCorrectSound() {
    stopAudio();
    activeAudio = new Audio(CORRECT_AUDIO_PATH);
    activeAudio.preload = 'auto';
    activeAudio.volume = 0.4;
    activeAudio.play().catch(() => {});
  }

  function playWordSound(word) {
    const path = getWordAudioPath(word);
    if (!path) return;
    stopAudio();
    let audio = audioCache.get(path);
    if (!audio) {
      audio = new Audio(path);
      audio.preload = 'auto';
      audioCache.set(path, audio);
    }
    activeAudio = audio;
    audio.play().catch(() => {});
  }

  function readResumeState() {
    try {
      const raw = window.sessionStorage.getItem(SESSION_STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!isValidComparisonState(parsed)) {
        return null;
      }
      return parsed;
    } catch (_error) {
      return null;
    }
  }

  function isValidComparisonState(state) {
    const run = state && state.run;
    if (!run || !Array.isArray(run.questions) || !run.questions.length) return false;
    const index = Number.isFinite(Number(run.index)) ? Number(run.index) : 0;
    const question = run.questions[index];
    return Boolean(
      question &&
      String(question.kind || '').trim() &&
      String(question.promptWord || '').trim() &&
      String(question.answer || '').trim()
    );
  }

  function resolveMeaningText(word, question, selectedWord, referenceWord) {
    if (!(window.CardlabMeaningResolver && typeof window.CardlabMeaningResolver.resolve === 'function')) {
      return '';
    }

    return window.CardlabMeaningResolver.resolve(word, {
      module: 'synonym',
      kind: question.kind,
      pos: question.pos,
      promptWord: question.promptWord,
      promptText: question.promptText,
      answerWord: question.answer,
      selectedWord: selectedWord || word,
      referenceWord: referenceWord || selectedWord || word
    });
  }

  function buildReturnHref(stageId) {
    const hash = stageId ? `#${encodeURIComponent(stageId)}` : '';
    return `${RETURN_PAGE_PATH}${hash}`;
  }

  function getHashStageId() {
    return (window.location.hash || '').replace(/^#/, '').trim();
  }

  function renderEmptyState() {
    shellStageLabel.textContent = '학습 정보 없음';
    compareKindChip.textContent = '뜻 비교';
    comparePromptText.textContent = '학습 정보를 찾지 못했어요.';
    compareTitle.textContent = '문제 화면으로 돌아가 다시 시작해 주세요.';
    compareProgressChip.textContent = '-';
    compareRelationChip.textContent = '준비 필요';
    compareDescription.textContent = '이 페이지는 문제를 맞힌 뒤 자동으로 열리도록 만들어졌어요.';
    comparePromptWord.textContent = '-';
    comparePromptMeaning.textContent = '현재 비교할 제시어 정보가 없어요.';
    compareAnswerWord.textContent = '-';
    compareAnswerMeaning.textContent = '현재 비교할 정답 정보가 없어요.';
    compareNextButton.textContent = '문제 화면으로 돌아가기';
    comparePromptSpeaker.disabled = true;
    compareAnswerSpeaker.disabled = true;
    comparePromptWord.disabled = true;
    compareAnswerWord.disabled = true;
  }

  function renderComparison(state) {
    const run = state && state.run;
    const question = run && run.questions ? run.questions[run.index] : null;
    if (!run || !question) {
      renderEmptyState();
      return;
    }

    const isAntonym = String(question.kind || '').includes('반의');
    const promptMeaningText = resolveMeaningText(question.promptWord, question, question.promptWord, question.answer);
    const answerMeaningText = resolveMeaningText(question.answer, question, question.answer, question.promptWord);

    shellStageLabel.textContent = run.stage && run.stage.title ? run.stage.title : '유의어 · 반의어';
    compareKindChip.textContent = question.kind || '유의어';
    comparePromptText.textContent = question.pos
      ? `품사: ${question.pos} · ${run.stage && run.stage.schoolLevelLabel ? run.stage.schoolLevelLabel : ''}`.trim()
      : (run.stage && run.stage.schoolLevelLabel) || '';
    compareTitle.textContent = isAntonym
      ? '두 낱말이 어떻게 반대되는지 살펴보세요.'
      : '두 낱말이 어떻게 비슷한지 살펴보세요.';
    compareProgressChip.textContent = `문항 ${run.index + 1} / ${run.questions.length}`;
    compareRelationChip.textContent = isAntonym ? '뜻이 반대예요' : '뜻이 같거나 비슷해요';
    compareDescription.textContent = isAntonym
      ? `${question.promptWord}와 ${question.answer}는 서로 반대되는 뜻으로 쓰여요.`
      : `${question.promptWord}와 ${question.answer}는 서로 비슷하거나 같은 뜻으로 쓰여요.`;
    comparePromptWord.textContent = question.promptWord || '-';
    comparePromptMeaning.textContent = promptMeaningText || `${question.promptWord}의 뜻을 준비 중이에요.`;
    compareAnswerWord.textContent = question.answer || '-';
    compareAnswerMeaning.textContent = answerMeaningText || `${question.answer}의 뜻을 준비 중이에요.`;
    compareNextButton.textContent = run.index < run.questions.length - 1 ? '다음 문제' : '학습 결과 보기';

    comparePromptSpeaker.disabled = !question.promptWord;
    compareAnswerSpeaker.disabled = !question.answer;
    comparePromptWord.disabled = !question.promptWord;
    compareAnswerWord.disabled = !question.answer;
  }

  function getCurrentComparisonQuestion(state) {
    const run = state && state.run;
    return run && Array.isArray(run.questions) ? run.questions[run.index] : null;
  }

  function goToLearningPage(state) {
    const stageId = state && state.selectedStageId ? state.selectedStageId : getHashStageId();
    window.location.replace(buildReturnHref(stageId));
  }

  function handleNext() {
    const state = readResumeState();
    const run = state && state.run;
    if (!run || !Array.isArray(run.questions)) {
      goToLearningPage(null);
      return;
    }

    if (run.index < run.questions.length - 1) {
      run.index += 1;
      state.resumePhase = 'build';
    } else {
      state.resumePhase = 'complete';
    }

    try {
      window.sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify(state));
    } catch (_error) {
      // ignore
    }
    goToLearningPage(state);
  }

  function init() {
    const state = readResumeState();
    const question = getCurrentComparisonQuestion(state);
    if (!isValidComparisonState(state) || !question) {
      goToLearningPage(state);
      return;
    }
    if (state && state.learningBackground) {
      const background = `url('${state.learningBackground}')`;
      document.documentElement.style.setProperty('--shell-page-bg', background);
      document.documentElement.style.setProperty('--shell-intro-bg', background);
    }

    renderComparison(state);
    playCorrectSound();

    comparePromptSpeaker.addEventListener('click', () => {
      if (question && question.promptWord) playWordSound(question.promptWord);
    });
    compareAnswerSpeaker.addEventListener('click', () => {
      if (question && question.answer) playWordSound(question.answer);
    });
    comparePromptWord.addEventListener('click', () => {
      if (question && question.promptWord) playWordSound(question.promptWord);
    });
    compareAnswerWord.addEventListener('click', () => {
      if (question && question.answer) playWordSound(question.answer);
    });

    compareNextButton.addEventListener('click', handleNext);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAudio();
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
})();
