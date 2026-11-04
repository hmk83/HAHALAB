(function () {
  'use strict';

  const CONFIG = window.MUSICARTLAB_ACTIVITY_CONFIG || {};
  const COLORS = ['#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'];
  const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시', '도'];
  const ART_SHAPES = ['circle', 'square', 'triangle', 'diamond'];
  const ART_COLORS = ['#f97316', '#facc15', '#22c55e', '#38bdf8', '#818cf8', '#f472b6'];
  const els = {};
  const state = {
    stageIndex: 0,
    itemIndex: 0,
    correct: 0,
    wrong: 0,
    logs: [],
    startedAtMs: Date.now(),
    itemStartedAtMs: Date.now(),
    expected: [],
    input: [],
    audioReady: false,
    audioEngine: null,
    audioEnginePromise: null,
    activeToneNotes: new Set(),
  };

  function $(id) {
    return document.getElementById(id);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char]);
  }

  function stageList() {
    return Array.isArray(CONFIG.stages) ? CONFIG.stages.slice(0, 5) : [];
  }

  function currentStage() {
    return stageList()[state.stageIndex] || stageList()[0] || {};
  }

  function setAccent() {
    const accent = CONFIG.accent || '#10b981';
    document.documentElement.style.setProperty('--musicartlab-accent', accent);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', accent);
  }

  function show(view) {
    [els.stageView, els.lessonView, els.resultView].forEach((node) => {
      if (!node) return;
      node.classList.toggle('is-active', node === view);
    });
    if (els.stageSelectButton) {
      els.stageSelectButton.classList.toggle('shell-hidden', view === els.stageView);
    }
  }

  function renderStages() {
    const stages = stageList();
    els.stageGrid.innerHTML = stages.map((stage, index) => {
      const tags = (stage.tags || []).map((tag) => `<span class="musicartlab-chip">${escapeHtml(tag)}</span>`).join('');
      return `
        <button type="button" class="musicartlab-stage-card" data-stage-index="${index}">
          <span class="musicartlab-stage-number">Level ${index + 1}</span>
          <h2>${escapeHtml(stage.title)}</h2>
          <p>${escapeHtml(stage.description)}</p>
          <div class="musicartlab-stage-meta">${tags}</div>
        </button>
      `;
    }).join('');
    els.stageGrid.querySelectorAll('[data-stage-index]').forEach((button) => {
      button.addEventListener('click', () => startStage(Number(button.dataset.stageIndex || 0)));
    });
  }

  function resetRun(stageIndex) {
    state.stageIndex = clamp(stageIndex, 0, stageList().length - 1);
    state.itemIndex = 0;
    state.correct = 0;
    state.wrong = 0;
    state.logs = [];
    state.startedAtMs = Date.now();
    state.itemStartedAtMs = Date.now();
    state.expected = [];
    state.input = [];
    state.savedRunId = '';
  }

  function startStage(stageIndex) {
    resetRun(stageIndex);
    const stage = currentStage();
    if (els.shellStageLabel) {
      els.shellStageLabel.textContent = `Level ${state.stageIndex + 1} ${stage.title || ''}`;
      els.shellStageLabel.classList.remove('shell-hidden');
    }
    show(els.lessonView);
    renderQuestion();
  }

  function getQuestionTotal(stage) {
    return Number(stage.questions || 5) || 5;
  }

  function questionSeed(stage, itemIndex) {
    const level = state.stageIndex + 1;
    const length = Number(stage.length || Math.min(2 + level, 7));
    const keyCount = Number(stage.keyCount || Math.min(2 + level, 8));
    const offset = (itemIndex * 2 + level) % Math.max(keyCount, 1);
    return { level, length, keyCount, offset };
  }

  function buildMelody(stage, itemIndex) {
    const seed = questionSeed(stage, itemIndex);
    const pattern = [];
    for (let i = 0; i < seed.length; i += 1) {
      const step = (seed.offset + i * (seed.level > 3 ? 2 : 1) + (i > 1 ? itemIndex : 0)) % seed.keyCount;
      pattern.push(step);
    }
    if (seed.level >= 5 && pattern.length > 3) {
      pattern[pattern.length - 1] = (pattern[1] + 3) % seed.keyCount;
    }
    return pattern;
  }

  function buildArtQuestion(stage, itemIndex) {
    const gridSize = Number(stage.gridSize || (state.stageIndex >= 3 ? 3 : 2));
    const total = gridSize * gridSize;
    const level = state.stageIndex + 1;
    const cells = Array.from({ length: total }, (_, index) => {
      const colorIndex = (index + itemIndex + level) % Math.min(ART_COLORS.length, 2 + level);
      const shapeIndex = (index + level + Math.floor(index / gridSize)) % Math.min(ART_SHAPES.length, 1 + Math.ceil(level / 2));
      return {
        color: ART_COLORS[colorIndex],
        shape: ART_SHAPES[shapeIndex],
      };
    });
    const missingIndex = (itemIndex * 2 + level) % total;
    const answer = cells[missingIndex];
    const choices = [answer];
    let cursor = 1;
    while (choices.length < 4) {
      const option = {
        color: ART_COLORS[(ART_COLORS.indexOf(answer.color) + cursor) % ART_COLORS.length],
        shape: ART_SHAPES[(ART_SHAPES.indexOf(answer.shape) + (cursor % 3)) % ART_SHAPES.length],
      };
      if (!choices.some((choice) => choice.color === option.color && choice.shape === option.shape)) {
        choices.push(option);
      }
      cursor += 1;
    }
    return {
      gridSize,
      cells,
      missingIndex,
      answer,
      choices: choices.sort((a, b) => `${a.color}${a.shape}`.localeCompare(`${b.color}${b.shape}`)),
    };
  }

  function renderQuestion() {
    const stage = currentStage();
    state.itemStartedAtMs = Date.now();
    if (CONFIG.type === 'music') {
      renderPianoLesson(stage);
    } else {
      renderArtLesson(stage);
    }
  }

  async function ensureAudioEngine() {
    if (state.audioEngine) return state.audioEngine;
    if (state.audioEnginePromise) return state.audioEnginePromise;
    state.audioEnginePromise = createAudioEngine().then((engine) => {
      state.audioEngine = engine;
      return engine;
    }).catch(() => {
      state.audioEngine = { type: 'silent', trigger: () => {} };
      return state.audioEngine;
    });
    return state.audioEnginePromise;
  }

  async function createAudioEngine() {
    try {
      if (window.Tone && typeof window.Tone.start === 'function') {
        await window.Tone.start();
      }
      if (window.MusicArtLabPiano) {
        const piano = new window.MusicArtLabPiano({
          velocities: 4,
          maxPolyphony: 8,
          release: true,
        });
        if (typeof piano.load === 'function') await piano.load();
        return {
          type: 'MusicArtLabPiano',
          trigger: (note, duration) => piano.keyDown({ note, velocity: 0.7 }).then(() => {
            window.setTimeout(() => piano.keyUp({ note }), duration * 1000);
          }).catch(() => {}),
        };
      }
      if (window.Tone && typeof window.Tone.Sampler === 'function') {
        const sampler = new window.Tone.Sampler({
          urls: {
            C4: 'C4.mp3',
            E4: 'E4.mp3',
            G4: 'G4.mp3',
            C5: 'C5.mp3',
          },
          release: 1,
          baseUrl: 'https://tonejs.github.io/audio/salamander/',
        }).toDestination();
        if (window.Tone.loaded) await window.Tone.loaded();
        return {
          type: 'Tone.Sampler',
          trigger: (note, duration) => sampler.triggerAttackRelease(note, duration),
        };
      }
    } catch (error) {
      state.audioEngine = null;
    }
    if (window.Tone && typeof window.Tone.Synth === 'function') {
      const synth = new window.Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination();
      return {
        type: 'Tone.Synth',
        trigger: (note, duration) => synth.triggerAttackRelease(note, duration),
      };
    }
    return {
      type: 'silent',
      trigger: () => {},
    };
  }

  function setStatus(message) {
    const status = $('musicartlabStatus');
    if (status) status.textContent = message;
  }

  function setKeysDisabled(disabled) {
    document.querySelectorAll('.musicartlab-key').forEach((key) => {
      key.classList.toggle('is-disabled', disabled);
      key.disabled = disabled;
    });
  }

  async function playNote(index, duration = 0.42) {
    const note = NOTES[index % NOTES.length];
    const key = document.querySelector(`[data-note-index="${index}"]`);
    if (key) key.classList.add('is-active');
    const engine = await Promise.race([
      ensureAudioEngine(),
      wait(800).then(() => ({ type: 'pending', trigger: () => {} })),
    ]);
    try {
      engine.trigger(note, duration);
    } catch (_error) {}
    await wait(duration * 1000);
    if (key) key.classList.remove('is-active');
  }

  async function playExpectedSequence() {
    setKeysDisabled(true);
    setStatus('건반 소리를 잘 듣고 순서를 기억해요.');
    const tempo = Number(currentStage().tempo || 620);
    for (const index of state.expected) {
      await playNote(index, 0.36);
      await wait(Math.max(150, tempo - 360));
    }
    setKeysDisabled(false);
    setStatus('이제 같은 순서로 건반을 눌러요.');
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function renderPianoLesson(stage) {
    const total = getQuestionTotal(stage);
    const seed = questionSeed(stage, state.itemIndex);
    const hints = stage.showHints !== false;
    state.expected = buildMelody(stage, state.itemIndex);
    state.input = [];
    const noteDots = state.expected.map(() => '<span class="musicartlab-note-dot"></span>').join('');
    const displayKeyCount = NOTES.length;
    const keys = NOTES.map((note, index) => `
      <button type="button" class="musicartlab-key musicartlab-white-key" data-note-index="${index}" style="--key-color:${COLORS[index]};--key-hint-opacity:${hints ? 0.86 : 0.08}">
        ${hints ? escapeHtml(SOLFEGE[index]) : escapeHtml(note)}
      </button>
    `).join('');
    const blackKeySlots = [0, 1, 3, 4, 5].filter((slot) => slot < Math.max(displayKeyCount - 1, 0));
    const blackKeys = blackKeySlots.map((slot) => `
      <span class="musicartlab-black-key" style="--black-key-slot:${slot + 1}" aria-hidden="true"></span>
    `).join('');
    els.lessonMount.innerHTML = `
      <article class="musicartlab-panel musicartlab-game-panel is-music-game">
        <div class="musicartlab-lesson-head">
          <div>
            <span class="musicartlab-eyebrow">음악 · 피아노 기억</span>
            <h1>${escapeHtml(stage.title)}</h1>
            <p>${escapeHtml(stage.description)}</p>
          </div>
          <div class="musicartlab-progress">${state.itemIndex + 1} / ${total}</div>
        </div>
        <div class="musicartlab-game-console musicartlab-piano-console">
          <div class="musicartlab-game-title"><strong>Piano Memory</strong></div>
          <div class="musicartlab-sequence-preview musicartlab-note-track" id="musicartlabSequencePreview">${noteDots}</div>
          <div class="musicartlab-status" id="musicartlabStatus">먼저 소리 듣기 시작 버튼을 눌러요.</div>
          <div class="musicartlab-piano-wrap" style="--musicartlab-key-count:${displayKeyCount}">
            <div class="musicartlab-speaker-row"><span></span><span></span></div>
            <div class="musicartlab-black-key-layer">${blackKeys}</div>
            <div class="musicartlab-piano" style="--musicartlab-key-count:${displayKeyCount}">${keys}</div>
          </div>
          <div class="musicartlab-actions musicartlab-game-actions">
            <button type="button" id="musicartlabReplay" class="musicartlab-action-btn">▶ 소리 듣기 시작</button>
            <button type="button" id="musicartlabStageBack" class="musicartlab-secondary-btn">단계 다시 선택</button>
          </div>
        </div>
      </article>
    `;
    $('musicartlabReplay').addEventListener('click', playExpectedSequence);
    $('musicartlabStageBack').addEventListener('click', () => show(els.stageView));
    document.querySelectorAll('.musicartlab-key').forEach((button) => {
      button.addEventListener('click', () => handlePianoInput(Number(button.dataset.noteIndex || 0)));
    });
    setKeysDisabled(false);
  }

  async function handlePianoInput(index) {
    if (!state.expected.length) return;
    await playNote(index, 0.24);
    const position = state.input.length;
    const correct = state.expected[position] === index;
    state.input.push(index);
    const dots = document.querySelectorAll('.musicartlab-note-dot');
    if (dots[position]) {
      dots[position].classList.add('is-filled');
      dots[position].style.setProperty('--note-color', correct ? COLORS[index] : '#fb7185');
    }
    if (!correct) {
      recordQuestion(false, {
        targetAnswer: state.expected.map((item) => SOLFEGE[item]).join('-'),
        submittedAnswer: state.input.map((item) => SOLFEGE[item]).join('-'),
        errorType: 'note_sequence_error',
      });
      flashFeedback(false);
      nextQuestion();
      return;
    }
    if (state.input.length >= state.expected.length) {
      recordQuestion(true, {
        targetAnswer: state.expected.map((item) => SOLFEGE[item]).join('-'),
        submittedAnswer: state.input.map((item) => SOLFEGE[item]).join('-'),
        errorType: '',
      });
      flashFeedback(true);
      nextQuestion();
    }
  }

  function renderShape(item) {
    return `<span class="musicartlab-art-shape ${escapeHtml(item.shape)}" style="--shape-color:${escapeHtml(item.color)}"></span>`;
  }

  function renderArtLesson(stage) {
    const total = getQuestionTotal(stage);
    const question = buildArtQuestion(stage, state.itemIndex);
    state.expected = [question.answer];
    const cells = question.cells.map((item, index) => `
      <div class="musicartlab-canvas-cell ${index === question.missingIndex ? 'is-empty' : ''}">
        ${index === question.missingIndex ? '<span class="musicartlab-eyebrow">?</span>' : renderShape(item)}
      </div>
    `).join('');
    const choices = question.choices.map((item, index) => `
      <button type="button" class="musicartlab-choice" data-choice-index="${index}" data-choice-color="${escapeHtml(item.color)}" data-choice-shape="${escapeHtml(item.shape)}">
        ${renderShape(item)}
      </button>
    `).join('');
    els.lessonMount.innerHTML = `
      <article class="musicartlab-panel musicartlab-game-panel is-art-game">
        <div class="musicartlab-lesson-head">
          <div>
            <span class="musicartlab-eyebrow">미술 · 색과 구성</span>
            <h1>${escapeHtml(stage.title)}</h1>
            <p>${escapeHtml(stage.description)}</p>
          </div>
          <div class="musicartlab-progress">${state.itemIndex + 1} / ${total}</div>
        </div>
        <div class="musicartlab-game-console musicartlab-art-console">
          <div class="musicartlab-game-title"><span>★</span><strong>Color Puzzle!</strong><span>★</span></div>
          <div class="musicartlab-art-layout musicartlab-art-studio">
            <div class="musicartlab-canvas-board" style="--musicartlab-grid-size:${question.gridSize}">
              <span class="musicartlab-sticker-spark is-one" aria-hidden="true"></span>
              <span class="musicartlab-sticker-spark is-two" aria-hidden="true"></span>
              ${cells}
            </div>
            <div class="musicartlab-side-pad">
              <div class="musicartlab-status" id="musicartlabStatus">빈칸에 어울리는 색과 모양을 골라요.</div>
              <div class="musicartlab-choice-grid">${choices}</div>
            </div>
          </div>
          <div class="musicartlab-actions musicartlab-game-actions">
            <button type="button" id="musicartlabStageBack" class="musicartlab-secondary-btn">단계 선택</button>
          </div>
        </div>
      </article>
    `;
    $('musicartlabStageBack').addEventListener('click', () => show(els.stageView));
    document.querySelectorAll('.musicartlab-choice').forEach((button) => {
      button.addEventListener('click', () => {
        const selected = {
          color: button.dataset.choiceColor,
          shape: button.dataset.choiceShape,
        };
        const correct = selected.color === question.answer.color && selected.shape === question.answer.shape;
        recordQuestion(correct, {
          targetAnswer: `${question.answer.color}/${question.answer.shape}`,
          submittedAnswer: `${selected.color}/${selected.shape}`,
          errorType: correct ? '' : 'visual_composition_error',
        });
        flashFeedback(correct);
        nextQuestion();
      });
    });
  }

  function recordQuestion(correct, extra) {
    const responseMs = Date.now() - state.itemStartedAtMs;
    if (correct) state.correct += 1;
    else state.wrong += 1;
    state.logs.push(Object.assign({
      questionIndex: state.itemIndex + 1,
      stageLevel: state.stageIndex + 1,
      correct,
      responseMs,
      domain: CONFIG.type === 'music' ? 'auditory-motor-sequence' : 'visual-art-composition',
    }, extra || {}));
  }

  function flashFeedback(correct) {
    if (window.PlaylabFeedbackOverlay && typeof window.PlaylabFeedbackOverlay.show === 'function') {
      window.PlaylabFeedbackOverlay.show(correct ? 'success' : 'retry');
    }
    setStatus(correct ? '좋아요. 다음 문제로 넘어가요.' : '다시 들여다보고 다음 문제를 해요.');
  }

  function nextQuestion() {
    window.setTimeout(() => {
      state.itemIndex += 1;
      if (state.itemIndex >= getQuestionTotal(currentStage())) {
        renderResult();
      } else {
        renderQuestion();
      }
    }, 520);
  }

  function renderResult() {
    const stage = currentStage();
    const total = getQuestionTotal(stage);
    const accuracy = Math.round((state.correct / Math.max(total, 1)) * 100);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - state.startedAtMs) / 1000));
    saveLearningReport(stage, total, accuracy, elapsedSeconds);
    const focus = CONFIG.type === 'music' ? '소리 순서와 건반 반응' : '색, 모양, 위치 구성';
    els.resultMount.innerHTML = `
      <article class="musicartlab-result-card">
        <span class="musicartlab-eyebrow">MUSIC ART COMPLETE</span>
        <h2>${escapeHtml(stage.title)} 완료</h2>
        <p>${escapeHtml(focus)}을 기준으로 정확도와 반응 흐름을 기록했습니다.</p>
        <div class="musicartlab-result-stats">
          <div class="musicartlab-stat">정확도<strong>${accuracy}%</strong></div>
          <div class="musicartlab-stat">정답<strong>${state.correct}</strong></div>
          <div class="musicartlab-stat">오답<strong>${state.wrong}</strong></div>
          <div class="musicartlab-stat">시간<strong>${elapsedSeconds}s</strong></div>
        </div>
        <div class="musicartlab-actions">
          <button type="button" id="musicartlabRetry" class="musicartlab-action-btn">같은 단계 다시 하기</button>
          <button type="button" id="musicartlabBack" class="musicartlab-secondary-btn">다른 단계 보기</button>
        </div>
      </article>
    `;
    $('musicartlabRetry').addEventListener('click', () => startStage(state.stageIndex));
    $('musicartlabBack').addEventListener('click', () => show(els.stageView));
    show(els.resultView);
  }

  function saveLearningReport(stage, total, accuracy, elapsedSeconds) {
    if (!window.HahaLabLearningHarness || state.savedRunId) return;
    const wrongWords = state.logs
      .filter((log) => !log.correct)
      .map((log) => log.targetAnswer || log.errorType || '오답')
      .filter(Boolean);
    const record = window.HahaLabLearningHarness.recordSession({
      labKind: 'musicartlab',
      reportScope: 'musicartlab',
      curriculumKey: CONFIG.curriculumKey || `musicartlab-${CONFIG.type || 'activity'}`,
      stageKey: `level-${state.stageIndex + 1}`,
      stageTitle: stage.title,
      labTitle: CONFIG.title || '뮤직아트랩',
      totalQuestions: total,
      correctCount: state.correct,
      wrongCount: state.wrong,
      score: accuracy,
      accuracyScore: accuracy,
      durationSeconds: elapsedSeconds,
      startedAtMs: state.startedAtMs,
      reportType: CONFIG.type === 'music' ? 'auditory' : 'visual',
      saveToClientReport: true,
      summary: CONFIG.reportSummary || `${CONFIG.title || '뮤직아트랩'} 활동 결과입니다.`,
      overview: CONFIG.reportOverview || '표현 활동 안에서 순서 기억, 선택 정확도, 반응 조절 흐름을 함께 확인합니다.',
      recommendations: CONFIG.reportRecommendations || [],
      focusKey: CONFIG.type === 'music' ? 'piano-sequence-memory' : 'color-shape-composition',
      focusLabel: CONFIG.type === 'music' ? '피아노 순서 기억' : '색과 모양 구성',
      wrongWords,
      questionLogs: state.logs,
      details: {
        mode: CONFIG.type,
        audio_engine: state.audioEngine ? state.audioEngine.type : '',
        wrong_words: wrongWords,
        question_logs: state.logs,
        report_domain: CONFIG.type === 'music' ? '청각-운동 순서 기억' : '시지각 구성 표현',
      },
    });
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
  }

  function openHelp() {
    if (!els.helpModal) return;
    els.helpModal.classList.add('is-open');
    els.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    if (!els.helpModal) return;
    els.helpModal.classList.remove('is-open');
    els.helpModal.setAttribute('aria-hidden', 'true');
  }

  function initHelp() {
    if ($('helpTitle')) $('helpTitle').textContent = `${CONFIG.title || '뮤직아트랩'} 안내`;
    if ($('helpSummary')) $('helpSummary').textContent = CONFIG.helpSummary || '';
    if ($('helpHow')) $('helpHow').innerHTML = escapeHtml(CONFIG.helpHow || '').replace(/\n/g, '<br>');
    if ($('helpBenefit')) $('helpBenefit').innerHTML = escapeHtml(CONFIG.helpBenefit || '').replace(/\n/g, '<br>');
    if (els.helpButton) els.helpButton.addEventListener('click', openHelp);
    document.querySelectorAll('[data-modal-close], #helpClose').forEach((node) => {
      node.addEventListener('click', closeHelp);
    });
  }

  function init() {
    setAccent();
    els.stageView = $('stageSelectView');
    els.lessonView = $('lessonView');
    els.resultView = $('resultView');
    els.stageGrid = $('stageGrid');
    els.lessonMount = $('lessonMount');
    els.resultMount = $('resultMount');
    els.shellStageLabel = $('shellStageLabel');
    els.stageSelectButton = $('stageSelectButton');
    els.helpButton = $('helpButton');
    els.helpModal = $('helpModal');
    if ($('musicartlabTitle')) $('musicartlabTitle').textContent = CONFIG.title || '뮤직아트랩';
    if (els.stageSelectButton) els.stageSelectButton.addEventListener('click', () => show(els.stageView));
    renderStages();
    initHelp();
  }

  function getDebugState() {
    return {
      type: CONFIG.type || '',
      stageIndex: state.stageIndex,
      itemIndex: state.itemIndex,
      expected: JSON.parse(JSON.stringify(state.expected || [])),
    };
  }

  window.MusicArtLabCore = { init, renderPianoLesson, renderArtLesson, getDebugState };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
