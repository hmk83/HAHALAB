(function () {
  'use strict';

  const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const JONGSEONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  const SIDE_VOWELS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅐ', 'ㅔ', 'ㅣ'];
  const BOTTOM_VOWELS = ['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'];
  const DOUBLE_VOWELS = ['ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];
  const BASIC_INITIALS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const TENSE_INITIALS = ['ㄱ', 'ㄲ', 'ㄷ', 'ㄸ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const FINAL_BASIC = ['', 'ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];
  const FINAL_EXPANDED = ['', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const BATCHIM_BASES = ['가', '고', '구', '무', '바', '사', '소', '수', '주', '코', '파', '푸', '하', '히'];

  const STAGES = [
    {
      id: 'side-vowels',
      badge: '01',
      title: '세로모음 만들기',
      desc: 'ㄱ 옆에 ㅏ, ㅑ, ㅓ, ㅕ처럼 오른쪽에 붙는 모음을 바꿔 한 글자를 만듭니다.',
      focus: '자음 + 세로모음',
      layout: 'vertical',
      accent: '#7c3aed',
      initials: BASIC_INITIALS,
      vowels: SIDE_VOWELS,
      finals: [''],
      targets: ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하', '거', '너', '더', '러', '버', '서', '여', '재', '세', '피']
    },
    {
      id: 'bottom-vowels',
      badge: '02',
      title: '가로모음 만들기',
      desc: 'ㅗ, ㅛ, ㅜ, ㅠ처럼 자음 아래에 놓이는 모음을 좌우 버튼으로 바꿉니다.',
      focus: '자음 + 가로모음',
      layout: 'horizontal',
      accent: '#0ea5e9',
      initials: BASIC_INITIALS,
      vowels: BOTTOM_VOWELS,
      finals: [''],
      targets: ['고', '노', '도', '로', '모', '보', '소', '오', '조', '초', '코', '토', '포', '호', '구', '누', '두', '루', '무', '부', '수', '유', '주', '추']
    },
    {
      id: 'final-basic',
      badge: '03',
      title: '받침 더하기',
      desc: '가, 나, 다처럼 완성된 기본 글자에 받침을 붙이며 음절 변화를 익힙니다.',
      focus: '기본 글자 + 받침',
      layout: 'batchim',
      accent: '#10b981',
      initials: BASIC_INITIALS,
      vowels: SIDE_VOWELS.concat(BOTTOM_VOWELS),
      bases: BATCHIM_BASES,
      finals: FINAL_BASIC,
      targets: ['강', '간', '감', '갈', '공', '군', '문', '물', '밤', '발', '방', '산', '손', '술', '줄', '콩', '팔', '풀', '한', '힘']
    },
    {
      id: 'tense-initials',
      badge: '04',
      title: '된소리 구별',
      desc: 'ㄲ, ㄸ, ㅃ, ㅆ, ㅉ처럼 세게 나는 첫소리를 골라 정확히 만듭니다.',
      focus: '된소리 초성',
      layout: 'vertical',
      accent: '#f97316',
      initials: TENSE_INITIALS,
      vowels: SIDE_VOWELS.concat(BOTTOM_VOWELS),
      finals: [''],
      targets: ['까', '꼬', '꾸', '떠', '또', '뚜', '빠', '뻐', '뽀', '쏘', '써', '짜', '쩌', '찌']
    },
    {
      id: 'double-vowels',
      badge: '05',
      title: '이중모음 조합',
      desc: 'ㅘ, ㅙ, ㅚ, ㅝ, ㅞ, ㅟ, ㅢ처럼 두 소리가 합쳐진 모음을 연습합니다.',
      focus: '이중모음',
      layout: 'horizontal',
      accent: '#ec4899',
      initials: BASIC_INITIALS,
      vowels: DOUBLE_VOWELS,
      finals: [''],
      targets: ['과', '괴', '귀', '궈', '돼', '되', '뒤', '봐', '봐', '쉬', '와', '왜', '외', '위', '좌', '쥐', '최', '퀴']
    }
  ];

  const state = {
    stage: null,
    targets: [],
    index: 0,
    selected: { base: '가', initial: 'ㄱ', vowel: 'ㅏ', final: '' },
    correct: 0,
    wrong: 0,
    wrongByQuestion: {},
    attempts: 0,
    locked: false,
    startedAtMs: 0,
    savedRunId: ''
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function decompose(char) {
    const code = String(char || '').charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return { initial: 'ㄱ', vowel: 'ㅏ', final: '' };
    const offset = code - 0xac00;
    const initial = Math.floor(offset / 588);
    const vowel = Math.floor((offset % 588) / 28);
    const final = offset % 28;
    return {
      initial: CHOSEONG[initial],
      vowel: JUNGSEONG[vowel],
      final: JONGSEONG[final]
    };
  }

  function compose(initial, vowel, final) {
    const initialIndex = CHOSEONG.indexOf(initial);
    const vowelIndex = JUNGSEONG.indexOf(vowel);
    const finalIndex = JONGSEONG.indexOf(final || '');
    if (initialIndex < 0 || vowelIndex < 0 || finalIndex < 0) return '';
    return String.fromCharCode(0xac00 + (initialIndex * 588) + (vowelIndex * 28) + finalIndex);
  }

  function getCurrentTarget() {
    return state.targets[state.index] || '';
  }

  function getStageValueList(kind) {
    if (!state.stage) return [];
    if (kind === 'base') return state.stage.bases || [];
    if (kind === 'initial') return state.stage.initials;
    if (kind === 'vowel') return state.stage.vowels;
    return state.stage.finals;
  }

  function rotateValue(kind, delta) {
    if (state.locked) return;
    const list = getStageValueList(kind);
    if (!list.length) return;
    const current = state.selected[kind] || '';
    const currentIndex = Math.max(0, list.indexOf(current));
    const nextIndex = (currentIndex + Number(delta || 0) + list.length) % list.length;
    state.selected[kind] = list[nextIndex];
    if (kind === 'base') {
      const parts = decompose(state.selected.base);
      state.selected.initial = parts.initial;
      state.selected.vowel = parts.vowel;
    }
    renderComposer();
    setFeedback('');
  }

  function setScreen(name) {
    const map = { stage: els.stageView, game: els.gameView, complete: els.completeView };
    Object.entries(map).forEach(([key, element]) => element.classList.toggle('is-active', key === name));
    els.stageButton.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel.classList.toggle('shell-hidden', name === 'stage');
    const resetScroll = () => {
      try {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (_error) {
        // Some embedded preview surfaces can block scroll control.
      }
    };
    resetScroll();
    requestAnimationFrame(resetScroll);
    window.setTimeout(resetScroll, 80);
    window.setTimeout(resetScroll, 240);
    window.setTimeout(resetScroll, 520);
  }

  function setFeedback(text, tone) {
    els.feedback.textContent = text;
    els.feedback.hidden = !text;
    els.feedback.classList.toggle('is-correct', tone === 'correct');
    els.feedback.classList.toggle('is-wrong', tone === 'wrong');
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="hangul-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-color:${escapeHtml(stage.accent)}">
        <span class="hangul-stage-badge">${escapeHtml(stage.badge)}</span>
        <h2>${escapeHtml(stage.title)}</h2>
        <p>${escapeHtml(stage.desc)}</p>
        <div class="hangul-stage-meta">
          <span>${escapeHtml(stage.focus)}</span>
          <span>${stage.targets.length}글자</span>
        </div>
      </button>
    `).join('');
  }

  function renderPicker(kind, label, orientation) {
    const list = getStageValueList(kind);
    const value = state.selected[kind] || '';
    const currentIndex = Math.max(0, list.indexOf(value));
    const prevValue = list.length ? list[(currentIndex - 1 + list.length) % list.length] : '';
    const nextValue = list.length ? list[(currentIndex + 1) % list.length] : '';
    const direction = orientation === 'horizontal' ? 'is-horizontal' : 'is-vertical';
    const prevSymbol = orientation === 'horizontal' ? '‹' : '⌃';
    const nextSymbol = orientation === 'horizontal' ? '›' : '⌄';
    const displayValue = (item) => item || '없음';
    const emptyClass = (item) => item ? '' : ' is-empty';
    return `
      <div class="hangul-picker ${direction}" data-kind="${kind}" aria-label="${escapeHtml(label)} 선택">
        <button type="button" class="hangul-picker-btn" data-kind="${kind}" data-delta="-1" aria-label="${escapeHtml(label)} 이전">${prevSymbol}</button>
        <div class="hangul-jamo-window ${direction}" role="button" tabindex="0" data-kind="${kind}" data-delta="1" aria-label="${escapeHtml(label)} 다음으로 바꾸기">
          <span class="hangul-jamo-ghost${emptyClass(prevValue)}">${escapeHtml(displayValue(prevValue))}</span>
          <span class="hangul-jamo-value${emptyClass(value)}">${escapeHtml(displayValue(value))}</span>
          <span class="hangul-jamo-ghost${emptyClass(nextValue)}">${escapeHtml(displayValue(nextValue))}</span>
        </div>
        <button type="button" class="hangul-picker-btn" data-kind="${kind}" data-delta="1" aria-label="${escapeHtml(label)} 다음">${nextSymbol}</button>
      </div>
    `;
  }

  function getPartClass(kind, expected) {
    const selected = kind === 'base'
      ? compose(state.selected.initial, state.selected.vowel, '')
      : state.selected[kind] || '';
    const base = `is-${kind}`;
    return selected === expected ? `${base} is-matched` : base;
  }

  function renderProblemSyllable(target) {
    return `
      <div class="hangul-problem-syllable is-whole-letter" aria-label="${escapeHtml(target)}">
        <span class="hangul-problem-real-letter">${escapeHtml(target)}</span>
      </div>
    `;
  }

  function renderComposer() {
    const layout = state.stage.layout;
    const built = compose(state.selected.initial, state.selected.vowel, state.selected.final);
    const basePicker = layout === 'batchim' ? renderPicker('base', '기본 글자', 'horizontal') : '';
    const initialPicker = layout === 'batchim' ? '' : renderPicker('initial', '자음', layout === 'horizontal' ? 'horizontal' : 'vertical');
    const vowelPicker = layout === 'batchim' ? '' : renderPicker('vowel', '모음', layout === 'vertical' ? 'vertical' : 'horizontal');
    const finalPicker = layout === 'final' ? renderPicker('final', '받침', 'horizontal') : '';
    const batchimFinalPicker = layout === 'batchim' ? renderPicker('final', '받침', 'horizontal') : '';
    const className = layout === 'vertical' ? 'is-vertical' : layout === 'horizontal' ? 'is-horizontal' : layout === 'batchim' ? 'is-batchim' : 'has-final';

    els.composer.innerHTML = `
      <div class="hangul-composer-grid ${className}">
        ${basePicker}
        ${initialPicker}
        ${vowelPicker}
        ${finalPicker}
        ${batchimFinalPicker}
      </div>
    `;
    els.composer.setAttribute('aria-label', `만든 글자 ${built}`);
    els.problemLetter.innerHTML = renderProblemSyllable(getCurrentTarget());
    els.composer.querySelectorAll('[data-kind][data-delta]').forEach((button) => {
      button.addEventListener('click', () => {
        rotateValue(button.getAttribute('data-kind'), Number(button.getAttribute('data-delta')));
      });
    });
  }

  function renderQuestion() {
    const target = getCurrentTarget();
    if (!target) {
      renderComplete();
      return;
    }
    const parts = decompose(target);
    const base = compose(parts.initial, parts.vowel, '');
    state.selected = {
      base: state.stage.bases && state.stage.bases.includes(base) ? state.stage.bases[0] : base,
      initial: state.stage.initials.includes(parts.initial) ? state.stage.initials[0] : parts.initial,
      vowel: state.stage.vowels.includes(parts.vowel) ? state.stage.vowels[0] : parts.vowel,
      final: state.stage.finals.includes(parts.final) ? state.stage.finals[0] : ''
    };
    if (state.stage.layout === 'batchim') {
      const baseParts = decompose(state.selected.base);
      state.selected.initial = baseParts.initial;
      state.selected.vowel = baseParts.vowel;
    }
    state.locked = false;
    els.problemLetter.innerHTML = renderProblemSyllable(target);
    els.stageFocus.textContent = state.stage.focus;
    els.gameTitle.textContent = state.stage.title;
    els.progressChip.textContent = `${state.index + 1} / ${state.targets.length}`;
    els.checkButton.hidden = false;
    els.nextButton.hidden = true;
    setFeedback('');
    renderComposer();
  }

  function checkAnswer() {
    if (state.locked) return;
    state.attempts += 1;
    const built = compose(state.selected.initial, state.selected.vowel, state.selected.final);
    const target = getCurrentTarget();
    if (built === target) {
      state.correct += 1;
      state.locked = true;
      els.checkButton.hidden = true;
      els.nextButton.hidden = true;
      setFeedback('같은 글자를 만들었어요!', 'correct');
      runCorrectTransition();
      return;
    }
    state.wrong += 1;
    state.wrongByQuestion[state.index] = Number(state.wrongByQuestion[state.index] || 0) + 1;
    setFeedback(`${built} 말고 ${target}를 만들어 보세요.`, 'wrong');
  }

  function playCorrectSound() {
    return new Promise((resolve) => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        window.setTimeout(resolve, 650);
        return;
      }
      try {
        const context = new AudioContext();
        const now = context.currentTime;
        const gain = context.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
        gain.connect(context.destination);
        [523.25, 659.25, 783.99].forEach((frequency, index) => {
          const osc = context.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(frequency, now + (index * 0.1));
          osc.connect(gain);
          osc.start(now + (index * 0.1));
          osc.stop(now + 0.46 + (index * 0.08));
        });
        window.setTimeout(() => {
          context.close().catch(() => {});
          resolve();
        }, 760);
      } catch (_error) {
        window.setTimeout(resolve, 650);
      }
    });
  }

  async function runCorrectTransition() {
    els.gameView.classList.add('is-correct-effect');
    await playCorrectSound();
    els.gameView.classList.remove('is-correct-effect');
    if (!state.locked) return;
    nextQuestion();
  }

  function nextQuestion() {
    state.index += 1;
    renderQuestion();
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    state.stage = stage;
    state.targets = shuffle(stage.targets).slice(0, Math.min(12, stage.targets.length));
    state.index = 0;
    state.correct = 0;
    state.wrong = 0;
    state.wrongByQuestion = {};
    state.attempts = 0;
    state.savedRunId = '';
    state.startedAtMs = Date.now();
    els.stageLabel.textContent = `${stage.badge} ${stage.title}`;
    setScreen('game');
    renderQuestion();
  }

  function renderComplete() {
    const total = Math.max(1, state.targets.length);
    const correctCount = Math.max(0, Math.min(state.correct, total));
    const wrongCount = Math.max(0, state.wrong);
    const wrongLetters = state.targets.filter((_target, index) => Number(state.wrongByQuestion[index] || 0) > 0);
    const accuracy = Math.round((correctCount / Math.max(correctCount + wrongCount, 1)) * 100);
    const score = Math.max(0, Math.min(100, accuracy));
    saveReport({ total, correctCount, wrongCount, wrongLetters, score, accuracy });
    els.completeTitle.textContent = `${state.stage.title} 완료`;
    els.completeSummary.textContent = `${total}글자를 연습했어요. 정답 ${correctCount}개, 오답 ${wrongCount}회로 기록했어요.`;
    els.completeStats.innerHTML = `
      <div class="hangul-complete-stat"><span>전체 문항</span><strong>${total}개</strong></div>
      <div class="hangul-complete-stat"><span>정답</span><strong>${correctCount}개</strong></div>
      <div class="hangul-complete-stat"><span>오답</span><strong>${wrongCount}회</strong></div>
      <div class="hangul-complete-stat"><span>정확도</span><strong>${score}점</strong></div>
    `;
    setScreen('complete');
  }

  function saveReport(result) {
    if (!window.HahaLabLearningHarness || !state.stage || state.savedRunId) return;
    const total = Math.max(1, Number(result && result.total) || state.targets.length || 1);
    const correctCount = Math.max(0, Math.min(Number(result && result.correctCount) || state.correct || 0, total));
    const wrongCount = Math.max(0, Number(result && result.wrongCount) || state.wrong || 0);
    const wrongLetters = Array.isArray(result && result.wrongLetters)
      ? result.wrongLetters
      : state.targets.filter((_target, index) => Number(state.wrongByQuestion[index] || 0) > 0);
    const score = Math.max(0, Math.min(100, Math.round(Number(result && result.score) || (correctCount / Math.max(correctCount + wrongCount, 1)) * 100)));
    const questionSnapshot = state.targets.map((letter, index) => ({
      id: `${state.stage.id}-${index + 1}`,
      letter,
      stage: state.stage.title,
      focus: state.stage.focus
    }));
    const resultSnapshot = questionSnapshot.map((question, index) => {
      const wrongAttempts = Number(state.wrongByQuestion[index] || 0);
      return {
        id: question.id,
        letter: question.letter,
        solved: true,
        wrongAttempts,
        score: wrongAttempts > 0 ? Math.max(0, 100 - wrongAttempts * 20) : 100
      };
    });
    try {
      const record = window.HahaLabLearningHarness.recordSession({
        labKind: 'cardlab',
        reportScope: 'literacy',
        curriculumKey: 'cardlab-hangul-compose',
        stageKey: state.stage.id,
        stageTitle: state.stage.title,
        labTitle: 'CardLab 글자 바퀴 돌리기',
        totalQuestions: total,
        correctCount,
        wrongCount,
        wrongWords: wrongLetters,
        questionSnapshot,
        resultSnapshot,
        score,
        accuracyScore: score,
        durationSeconds: (Date.now() - (state.startedAtMs || Date.now())) / 1000,
        startedAtMs: state.startedAtMs || Date.now(),
        summary: `${state.stage.title}에서 목표 글자 ${total}개를 조합하고, 정답 ${correctCount}개와 오답 ${wrongCount}회를 기록했습니다.`,
        overview: '한글 조합 휠은 초성·중성·종성 위치를 선택해 목표 음절을 완성하는 과제로, 한글 음절 구조 인식과 오류 후 자기수정 흐름을 함께 확인합니다.',
        recommendations: [
          wrongCount > 0 ? '오답이 나온 글자는 초성, 중성, 종성을 따로 짚은 뒤 다시 조합하게 해주세요.' : '현재 단계는 안정적으로 수행했으므로 다음 단계에서 모음·받침 변화를 확장해도 좋습니다.',
          '정답 후에는 완성 글자를 한 번 소리 내어 읽고 같은 초성 또는 같은 모음 글자를 하나 더 만들어 봅니다.'
        ],
        focusKey: 'hangul-syllable-composition',
        focusLabel: state.stage.focus,
        details: {
          stage_layout: state.stage.layout,
          attempts: state.attempts,
          wrong_attempts: wrongCount,
          wrong_letters: wrongLetters,
          target_letters: state.targets.slice()
        },
        metadata: {
          source_page: 'cardlab-hangul-compose.html'
        },
        contentId: 'cardlab-hangul-compose',
        contentTitle: 'CardLab: 한글 조합 휠',
        total: total
      });
      state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
    } catch (_error) {
      // Report saving is optional for local play.
    }
  }

  function openHelp() {
    els.helpModal.classList.add('is-active');
    els.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    els.helpModal.classList.remove('is-active');
    els.helpModal.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
    els.stageGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (!button) return;
      startStage(button.getAttribute('data-stage-id'));
    });
    els.composer.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const control = event.target.closest('[data-kind][data-delta]');
      if (!control) return;
      event.preventDefault();
      rotateValue(control.getAttribute('data-kind'), Number(control.getAttribute('data-delta')));
    });
    els.stageButton.addEventListener('click', () => setScreen('stage'));
    els.checkButton.addEventListener('click', checkAnswer);
    els.nextButton.addEventListener('click', nextQuestion);
    els.retryButton.addEventListener('click', () => startStage(state.stage.id));
    els.otherStageButton.addEventListener('click', () => setScreen('stage'));
    els.helpButton.addEventListener('click', openHelp);
    els.helpClose.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target && event.target.hasAttribute('data-close-modal')) closeHelp();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && els.helpModal.classList.contains('is-active')) closeHelp();
    });
  }

  function init() {
    [
      'stageView', 'gameView', 'completeView', 'stageGrid', 'stageLabel', 'stageButton',
      'stageFocus', 'gameTitle', 'progressChip', 'problemLetter', 'composer',
      'feedback', 'checkButton', 'nextButton', 'completeTitle', 'completeSummary',
      'completeStats',
      'retryButton', 'otherStageButton', 'helpButton', 'helpModal', 'helpClose'
    ].forEach((id) => {
      els[id] = $(id);
    });
    if (Object.values(els).some((element) => !element)) return;
    renderStages();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
