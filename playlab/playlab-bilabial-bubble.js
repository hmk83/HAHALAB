(function () {
  'use strict';

  const LAB_TITLE = 'PlayLab 양순음 비눗방울';
  const DISPLAY_TITLE = '양순음 비눗방울';
  const CURRICULUM_KEY = 'playlab-bilabial-bubble';
  const LAB_SESSION_COMPLETION_ACTION = '학습 완료';
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
  const ASSET_ROOT = 'images/bilabial-bubble/';
  const SELECT_SOUND_PATH = '../sound/select.mp3';
  const SUCCESS_SOUND_PATH = '../sound/correct.mp3';
  const ERROR_SOUND_PATH = '../sound/error.mp3';

  const STAGES = [
    {
      id: 'isolated',
      index: 1,
      badge: '01',
      title: '고립음 비눗방울',
      subtitle: '모음 없이 양순음 목표 음소만 짧게 산출해요.',
      mode: 'isolate',
      accent: '#2563eb',
      kind: '고립음',
      cue: '양순 폐쇄 후 파열 또는 비음을 짧게 산출하는지 봅니다.',
      targets: [
        { text: 'ㅂ', phoneme: 'ㅂ', cue: '양순 폐쇄 후 짧은 파열을 산출해요.' },
        { text: 'ㅃ', phoneme: 'ㅃ', cue: '긴장성 양순 파열음을 또렷하게 시작해요.' },
        { text: 'ㅍ', phoneme: 'ㅍ', cue: '기식성을 동반한 양순 파열음을 관찰해요.' },
        { text: 'ㅁ', phoneme: 'ㅁ', cue: '양순 폐쇄와 비강 공명을 짧게 유지해요.' }
      ]
    },
    {
      id: 'syllable',
      index: 2,
      badge: '02',
      title: '비눗방울 징검다리',
      subtitle: '양순음과 모음을 결합해 무의미 음절을 산출해요.',
      mode: 'syllable',
      accent: '#0ea5e9',
      kind: '무의미 음절',
      cue: '목표 자음에서 모음으로 전이되는 음절 산출 안정성을 봅니다.',
      targets: [
        { text: '바', phoneme: 'ㅂ', cue: 'ㅂ에서 ㅏ로 이어지는 CV 음절을 산출해요.' },
        { text: '뽀', phoneme: 'ㅃ', cue: 'ㅃ의 긴장성을 유지하며 모음으로 전이해요.' },
        { text: '퓨', phoneme: 'ㅍ', cue: 'ㅍ의 기식성을 살려 CV 음절을 산출해요.' },
        { text: '마', phoneme: 'ㅁ', cue: '비음 산출 후 모음으로 자연스럽게 이어요.' }
      ]
    },
    {
      id: 'initial-word',
      index: 3,
      badge: '03',
      title: '첫소리 장난감 찾기',
      subtitle: '목표 음소가 어두 위치에 오는 단어를 산출해요.',
      mode: 'word-initial',
      accent: '#22c55e',
      kind: '어두 초성 단어',
      cue: '단어 어두 위치에서 목표 음소가 지연 없이 산출되는지 봅니다.',
      targets: [
        { text: '바지', phoneme: 'ㅂ', cue: '어두 /ㅂ/ 산출과 후속 모음 전이를 봅니다.' },
        { text: '포도', phoneme: 'ㅍ', cue: '어두 /ㅍ/의 기식성과 명료도를 봅니다.' },
        { text: '모자', phoneme: 'ㅁ', cue: '어두 /ㅁ/의 양순 폐쇄와 비강 공명을 봅니다.' },
        { text: '빵', phoneme: 'ㅃ', cue: '어두 /ㅃ/의 긴장성과 시작 명료도를 봅니다.' }
      ]
    },
    {
      id: 'medial-final-word',
      index: 4,
      badge: '04',
      title: '쌍둥이 비눗방울',
      subtitle: '어중과 어말 위치의 양순음을 단어 안에서 산출해요.',
      mode: 'word-medial',
      accent: '#f59e0b',
      kind: '어중·어말 단어',
      cue: '음절 간 전이와 단어 내 목표 음소 유지 여부를 관찰합니다.',
      targets: [
        { text: '나비', phoneme: 'ㅂ', cue: '어중 /ㅂ/ 산출과 음절 연결을 봅니다.' },
        { text: '우표', phoneme: 'ㅍ', cue: '어중 /ㅍ/ 산출 시 기식성과 전이를 봅니다.' },
        { text: '소파', phoneme: 'ㅍ', cue: '어중 /ㅍ/가 약화되지 않는지 관찰합니다.' },
        { text: '구름', phoneme: 'ㅁ', cue: '어말 /ㅁ/의 양순 폐쇄 유지 여부를 봅니다.' }
      ]
    },
    {
      id: 'sentence',
      index: 5,
      badge: '05',
      title: '비눗방울 열기구',
      subtitle: '목표 단어가 포함된 2-3어절 문장을 산출해요.',
      mode: 'sentence',
      accent: '#ec4899',
      kind: '짧은 문장',
      cue: '문장 수준에서 목표 음소의 유지와 구어 흐름을 봅니다.',
      targets: [
        { text: '포도를 먹어요', phoneme: 'ㅍ', cue: '문장 안에서 /ㅍ/ 산출과 말 흐름을 봅니다.' },
        { text: '바지를 입어요', phoneme: 'ㅂ', cue: '목표 단어와 후속 어절의 연결을 봅니다.' },
        { text: '모자를 써요', phoneme: 'ㅁ', cue: '어두 /ㅁ/ 산출 후 문장 흐름을 유지해요.' },
        { text: '빵을 먹어요', phoneme: 'ㅃ', cue: '긴장성 양순음이 문장 안에서 유지되는지 봅니다.' }
      ]
    },
    {
      id: 'story',
      index: 6,
      badge: '06',
      title: '비눗방울 마을 이야기',
      subtitle: '학습한 목표 단어를 넣어 자발화를 유도해요.',
      mode: 'story',
      accent: '#8b5cf6',
      kind: '자발화',
      cue: '자발화에서 목표 음소와 단어가 자연스럽게 사용되는지 관찰합니다.',
      targets: [
        { text: '포도와 나비 이야기', phoneme: 'ㅍ/ㅂ', cue: '목표 단어를 포함해 1-2문장으로 산출해요.' },
        { text: '모자와 바지 이야기', phoneme: 'ㅁ/ㅂ', cue: '상황 설명 속 목표 음소 사용을 봅니다.' },
        { text: '비눗방울 마을 이야기', phoneme: 'ㅂ/ㅍ/ㅁ', cue: '자발화에서 목표 음소 사용 빈도와 명료도를 봅니다.' }
      ]
    }
  ];

  const ASSESSMENT_RULES = {
    isolate: { minRms: 0.07, minPeak: 0.22, minDuration: 140, maxDuration: 1250, maxResponse: 6500 },
    syllable: { minRms: 0.06, minPeak: 0.2, minDuration: 260, maxDuration: 1800, maxResponse: 7500 },
    'word-initial': { minRms: 0.055, minPeak: 0.18, minDuration: 420, maxDuration: 3000, maxResponse: 8500 },
    'word-medial': { minRms: 0.055, minPeak: 0.18, minDuration: 520, maxDuration: 3400, maxResponse: 9000 },
    sentence: { minRms: 0.05, minPeak: 0.16, minDuration: 900, maxDuration: 6200, maxResponse: 11000 },
    story: { minRms: 0.045, minPeak: 0.15, minDuration: 1500, maxDuration: 13000, maxResponse: 15000 }
  };

  const state = {
    stage: null,
    targetIndex: 0,
    startedAtMs: 0,
    targetStartedAtMs: 0,
    savedRunId: '',
    audioContext: null,
    analyser: null,
    mediaStream: null,
    animationFrame: 0,
    listening: false,
    speaking: false,
    speechStartMs: 0,
    lastLoudMs: 0,
    currentPeak: 0,
    currentZcr: 0,
    latestUtterance: null,
    latestAssessment: null,
    supabaseClientPromise: null,
    metrics: {
      pass: 0,
      retry: 0,
      attempts: 0,
      responseTimes: [],
      durations: [],
      rmsValues: [],
      zcrValues: [],
      targets: [],
      decisions: []
    }
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

  function average(values) {
    const filtered = values.map(Number).filter((value) => Number.isFinite(value));
    if (!filtered.length) return 0;
    return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
  }

  function formatSeconds(ms) {
    return `${(Math.max(0, Number(ms) || 0) / 1000).toFixed(1)}초`;
  }

  function getTarget() {
    return state.stage?.targets[state.targetIndex] || state.stage?.targets[0] || null;
  }

  function playSound(path, volume = 0.42) {
    try {
      const audio = new Audio(path);
      audio.volume = volume;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_error) {}
  }

  function setScreen(name) {
    const map = { stage: els.stageView, game: els.gameView, result: els.resultView };
    Object.entries(map).forEach(([key, element]) => element?.classList.toggle('is-active', key === name));
    const inStage = name === 'stage';
    els.stageButton.classList.toggle('shell-hidden', inStage);
    els.stageLabel.classList.toggle('shell-hidden', inStage || !state.stage);
    if (!inStage && state.stage) els.stageLabel.textContent = `${state.stage.index}단계`;
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.setPdfButtonVisible === 'function') {
      window.PlaylabReportEngine.setPdfButtonVisible(name === 'result', {
        title: () => `${DISPLAY_TITLE}-${state.stage?.title || '리포트'}`
      });
    }
    window.scrollTo(0, 0);
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="bilabial-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-color:${escapeHtml(stage.accent)}">
        <span class="bilabial-stage-badge">${escapeHtml(stage.badge)} · ${escapeHtml(stage.kind)}</span>
        <strong>${escapeHtml(stage.title)}</strong>
        <p>${escapeHtml(stage.subtitle)}</p>
      </button>
    `).join('');
  }

  function setupSceneAssets() {
    els.scene.style.setProperty('--mascot-image', `url("${ASSET_ROOT}lip-mascot.webp")`);
    els.scene.style.setProperty('--bubble-image', `url("${ASSET_ROOT}main-bubble.webp")`);
    els.scene.style.setProperty('--steps-image', `url("${ASSET_ROOT}bubble-steps.webp")`);
    els.scene.style.setProperty('--toy-image', `url("${ASSET_ROOT}toy-reveal.webp")`);
    els.scene.style.setProperty('--twin-image', `url("${ASSET_ROOT}twin-bubbles.webp")`);
    els.scene.style.setProperty('--village-image', `url("${ASSET_ROOT}bubble-village.webp")`);
  }

  function renderSceneMode() {
    const mode = state.stage?.mode || 'isolate';
    els.scene.dataset.mode = mode;
    els.bubbleTrack.innerHTML = '';
    if (mode === 'syllable') {
      els.bubbleTrack.innerHTML = '<img class="scene-asset bubble-steps-asset" src="images/bilabial-bubble/bubble-steps.webp" alt="">';
    } else if (mode === 'word-initial') {
      els.bubbleTrack.innerHTML = '<img class="scene-asset toy-reveal-asset" src="images/bilabial-bubble/toy-reveal.webp" alt="">';
    } else if (mode === 'word-medial') {
      els.bubbleTrack.innerHTML = '<img class="scene-asset twin-bubbles-asset" src="images/bilabial-bubble/twin-bubbles.webp" alt="">';
    } else if (mode === 'sentence' || mode === 'story') {
      els.bubbleTrack.innerHTML = '<img class="scene-asset village-asset" src="images/bilabial-bubble/bubble-village.webp" alt="">';
    }
  }

  function renderTarget() {
    const target = getTarget();
    if (!target || !state.stage) return;
    els.stageKicker.textContent = `${state.stage.badge} · ${state.stage.kind}`;
    els.taskTitle.textContent = state.stage.title;
    els.taskSubtitle.textContent = state.stage.subtitle;
    els.roundChip.textContent = `${state.targetIndex + 1} / ${state.stage.targets.length}`;
    els.passChip.textContent = `통과 ${state.metrics.pass}`;
    els.targetKind.textContent = state.stage.kind;
    els.targetText.textContent = target.text;
    els.bubbleTarget.textContent = target.text;
    els.targetCue.textContent = target.cue || state.stage.cue;
    els.feedbackText.classList.remove('is-retry', 'is-neutral');
    els.feedbackText.classList.add('is-neutral');
    els.feedbackText.textContent = '';
    els.qualityText.textContent = '데이터 없음';
    els.qualityText.closest('.quality-row')?.classList.remove('is-accepted', 'is-retry');
    els.passButton.disabled = !state.latestUtterance;
    els.retryButton.disabled = !state.latestUtterance;
    state.targetStartedAtMs = Date.now();
    renderSceneMode();
  }

  function getAssessmentRule(stage) {
    return ASSESSMENT_RULES[stage?.mode || 'isolate'] || ASSESSMENT_RULES.isolate;
  }

  function scoreRange(value, min, max) {
    if (!Number.isFinite(value)) return 0;
    if (value < min) return Math.max(0, value / Math.max(0.001, min));
    if (value > max) return Math.max(0, 1 - ((value - max) / Math.max(1, max * 0.6)));
    return 1;
  }

  function assessUtterance(utterance) {
    const rule = getAssessmentRule(state.stage);
    const reasons = [];
    if (!utterance || !Number.isFinite(utterance.rms) || !Number.isFinite(utterance.durationMs)) {
      return { status: 'no-data', score: 0, label: '데이터 없음', reasons: ['발화 데이터가 충분히 수집되지 않았습니다.'] };
    }
    const rmsOk = utterance.rms >= rule.minRms;
    const peakOk = utterance.peak >= rule.minPeak;
    const durationOk = utterance.durationMs >= rule.minDuration && utterance.durationMs <= rule.maxDuration;
    const responseOk = utterance.responseMs <= rule.maxResponse;
    const fricationAdvisory = utterance.phoneme === 'ㅍ' && utterance.zcr < 0.028;
    if (!rmsOk) reasons.push('음향 강도가 낮아 목표 산출 여부를 확인하기 어렵습니다.');
    if (!peakOk) reasons.push('파열 또는 발화 시작 단서가 약합니다.');
    if (utterance.durationMs < rule.minDuration) reasons.push('발성 지속시간이 너무 짧습니다.');
    if (utterance.durationMs > rule.maxDuration) reasons.push('발성 지속시간이 과하게 길어 목표 산출과 분리 관찰이 필요합니다.');
    if (!responseOk) reasons.push('발화 시작 지연이 길어 즉각 산출을 다시 관찰해야 합니다.');
    if (fricationAdvisory) reasons.push('/ㅍ/의 기식성 단서가 약하게 감지되었습니다.');
    const score = Math.round(
      scoreRange(utterance.rms, rule.minRms, Math.max(rule.minRms * 2.4, 0.18)) * 34
      + scoreRange(utterance.peak, rule.minPeak, Math.max(rule.minPeak * 2.2, 0.36)) * 20
      + scoreRange(utterance.durationMs, rule.minDuration, rule.maxDuration) * 30
      + scoreRange(utterance.responseMs, 0, rule.maxResponse) * 12
      + (fricationAdvisory ? 0 : 4)
    );
    const accepted = rmsOk && peakOk && durationOk && score >= 70;
    return {
      status: accepted ? 'accepted' : 'retry',
      score,
      label: accepted ? '관찰 가능' : '다시 관찰',
      reasons: reasons.length ? reasons : ['음향 강도와 발성 지속시간이 기준 범위에 들어왔습니다.'],
      rule
    };
  }

  function renderAssessment(assessment) {
    const row = els.qualityText.closest('.quality-row');
    row?.classList.remove('is-accepted', 'is-retry');
    if (!assessment) {
      els.qualityText.textContent = '데이터 대기';
      return;
    }
    row?.classList.add(assessment.status === 'accepted' ? 'is-accepted' : 'is-retry');
    els.qualityText.textContent = `${assessment.label} · ${assessment.score}점`;
  }

  function startStage(stageId) {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    state.stage = stage;
    state.targetIndex = 0;
    state.startedAtMs = Date.now();
    state.targetStartedAtMs = Date.now();
    state.savedRunId = '';
    state.latestUtterance = null;
    state.latestAssessment = null;
    state.metrics = {
      pass: 0,
      retry: 0,
      attempts: 0,
      responseTimes: [],
      durations: [],
      rmsValues: [],
      zcrValues: [],
      targets: [],
      decisions: []
    };
    renderTarget();
    setScreen('game');
  }

  function computeAudioFeatures(buffer) {
    let sumSquares = 0;
    let peak = 0;
    let crossings = 0;
    let previous = buffer[0] - 128;
    for (let index = 0; index < buffer.length; index += 1) {
      const centered = buffer[index] - 128;
      const normalized = centered / 128;
      sumSquares += normalized * normalized;
      peak = Math.max(peak, Math.abs(normalized));
      if ((previous >= 0 && centered < 0) || (previous < 0 && centered >= 0)) crossings += 1;
      previous = centered;
    }
    return {
      rms: Math.sqrt(sumSquares / Math.max(1, buffer.length)),
      peak,
      zcr: crossings / Math.max(1, buffer.length)
    };
  }

  function updateMeters(features, durationMs) {
    const rmsPercent = Math.min(100, Math.round(features.rms * 360));
    const timingPercent = Math.min(100, Math.round((Math.max(0, durationMs) / 1300) * 100));
    els.rmsMeter.style.width = `${rmsPercent}%`;
    els.timingMeter.style.width = `${timingPercent}%`;
    els.rmsValue.textContent = String(rmsPercent);
    els.durationValue.textContent = formatSeconds(durationMs);
    els.scene.style.setProperty('--bubble-scale', String(1 + Math.min(0.44, features.rms * 1.8)));
  }

  function audioLoop() {
    if (!state.analyser || !state.listening) return;
    const data = new Uint8Array(state.analyser.fftSize);
    state.analyser.getByteTimeDomainData(data);
    const features = computeAudioFeatures(data);
    const now = Date.now();
    const isLoud = features.rms > 0.035 || features.peak > 0.18;
    if (isLoud && !state.speaking) {
      state.speaking = true;
      state.speechStartMs = now;
      state.currentPeak = features.rms;
      state.currentZcr = features.zcr;
      els.audioState.textContent = '발화 중';
      els.mascot.classList.add('is-jump');
    }
    if (isLoud) {
      state.lastLoudMs = now;
      state.currentPeak = Math.max(state.currentPeak, features.rms);
      state.currentZcr = Math.max(state.currentZcr, features.zcr);
    }
    if (state.speaking) updateMeters(features, now - state.speechStartMs);
    if (state.speaking && now - state.lastLoudMs > 360) {
      const durationMs = Math.max(160, state.lastLoudMs - state.speechStartMs);
      handleDetectedUtterance({
        rms: state.currentPeak,
        peak: features.peak,
        zcr: state.currentZcr,
        durationMs,
        simulated: false
      });
      state.speaking = false;
      state.currentPeak = 0;
      state.currentZcr = 0;
      els.mascot.classList.remove('is-jump');
    }
    state.animationFrame = window.requestAnimationFrame(audioLoop);
  }

  async function startMicrophone() {
    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('이 브라우저에서 마이크 입력을 사용할 수 없습니다.');
      }
      if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (state.audioContext.state === 'suspended') await state.audioContext.resume();
      state.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      const source = state.audioContext.createMediaStreamSource(state.mediaStream);
      state.analyser = state.audioContext.createAnalyser();
      state.analyser.fftSize = 1024;
      state.analyser.smoothingTimeConstant = 0.28;
      source.connect(state.analyser);
      state.listening = true;
      els.audioState.textContent = '감지 중';
      els.audioHint.textContent = '목표를 말하면 비눗방울이 커지고 교사 확인 버튼이 켜집니다.';
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = window.requestAnimationFrame(audioLoop);
    } catch (error) {
      els.audioState.textContent = '마이크 확인 필요';
      els.audioHint.textContent = '마이크 권한이 없으면 발화 감지 테스트 버튼으로 수업 흐름을 확인할 수 있습니다.';
      console.warn('[playlab-bilabial-bubble] microphone unavailable:', error);
    }
  }

  function stopMicrophone() {
    state.listening = false;
    window.cancelAnimationFrame(state.animationFrame);
    if (state.mediaStream) {
      state.mediaStream.getTracks().forEach((track) => track.stop());
      state.mediaStream = null;
    }
  }

  function popBubble() {
    els.mainBubble.classList.remove('is-pop');
    void els.mainBubble.offsetWidth;
    els.mainBubble.classList.add('is-pop');
    els.rewardLayer.innerHTML = '';
    for (let index = 0; index < 14; index += 1) {
      const dot = document.createElement('span');
      dot.className = 'particle';
      dot.style.left = `${48 + (Math.random() * 16 - 8)}%`;
      dot.style.top = `${44 + (Math.random() * 14 - 7)}%`;
      dot.style.setProperty('--x', `${Math.random() * 240 - 120}px`);
      dot.style.setProperty('--y', `${Math.random() * -180 - 40}px`);
      els.rewardLayer.appendChild(dot);
    }
    window.setTimeout(() => els.mainBubble.classList.remove('is-pop'), 620);
  }

  function handleDetectedUtterance(features) {
    const target = getTarget();
    if (!target || !state.stage) return;
    const responseMs = Date.now() - state.targetStartedAtMs;
    const utterance = {
      target: target.text,
      phoneme: target.phoneme,
      stageId: state.stage.id,
      stageTitle: state.stage.title,
      responseMs,
      durationMs: Math.round(features.durationMs || 0),
      rms: Number(features.rms || 0),
      peak: Number(features.peak || 0),
      zcr: Number(features.zcr || 0),
      simulated: Boolean(features.simulated)
    };
    const assessment = assessUtterance(utterance);
    utterance.preliminaryStatus = assessment.status;
    utterance.preliminaryScore = assessment.score;
    utterance.preliminaryReasons = assessment.reasons.slice();
    state.latestUtterance = utterance;
    state.latestAssessment = assessment;
    state.metrics.attempts += 1;
    state.metrics.responseTimes.push(responseMs);
    state.metrics.durations.push(utterance.durationMs);
    state.metrics.rmsValues.push(utterance.rms);
    state.metrics.zcrValues.push(utterance.zcr);
    state.metrics.targets.push(utterance);
    updateMeters({ rms: utterance.rms, peak: utterance.peak, zcr: utterance.zcr }, utterance.durationMs);
    renderAssessment(assessment);
    els.passButton.disabled = assessment.status !== 'accepted';
    els.retryButton.disabled = false;
    els.audioState.textContent = features.simulated ? '예비 판정' : '발화 분석';
    if (assessment.status === 'accepted') {
      els.feedbackText.classList.remove('is-retry', 'is-neutral');
      els.feedbackText.textContent = `예비 판정: 관찰 가능. ${assessment.reasons[0]} 교사가 실제 조음 정확도를 확인해 주세요.`;
      popBubble();
      playSound(SELECT_SOUND_PATH, 0.25);
    } else {
      els.feedbackText.classList.add('is-retry');
      els.feedbackText.classList.remove('is-neutral');
      els.feedbackText.textContent = `예비 판정: 다시 관찰. ${assessment.reasons[0]}`;
      playSound(ERROR_SOUND_PATH, 0.26);
      if (window.HahaLabFeedbackOverlay && typeof window.HahaLabFeedbackOverlay.show === 'function') {
        window.HahaLabFeedbackOverlay.show('error');
      }
    }
  }

  function advanceTarget() {
    state.targetIndex += 1;
    state.latestUtterance = null;
    state.latestAssessment = null;
    els.passButton.disabled = true;
    els.retryButton.disabled = true;
    if (state.targetIndex >= state.stage.targets.length) {
      renderResult();
      return;
    }
    renderTarget();
  }

  function applyTeacherDecision(decision) {
    if (!state.latestUtterance || !state.stage) return;
    if (decision === 'pass' && state.latestAssessment?.status !== 'accepted') {
      els.feedbackText.classList.add('is-retry');
      els.feedbackText.classList.remove('is-neutral');
      els.feedbackText.textContent = '예비 음향 판정이 기준에 도달하지 않아 다시 관찰이 필요합니다.';
      playSound(ERROR_SOUND_PATH, 0.28);
      return;
    }
    const target = getTarget();
    const record = Object.assign({}, state.latestUtterance, {
      decision,
      decidedAt: new Date().toISOString()
    });
    state.metrics.decisions.push(record);
    if (decision === 'pass') {
      state.metrics.pass += 1;
      els.feedbackText.classList.remove('is-retry', 'is-neutral');
      els.feedbackText.textContent = '좋아요. 다음 목표로 이동해요.';
      playSound(SUCCESS_SOUND_PATH, 0.44);
      if (window.HahaLabFeedbackOverlay && typeof window.HahaLabFeedbackOverlay.show === 'function') {
        window.HahaLabFeedbackOverlay.show('success');
      }
      window.setTimeout(advanceTarget, 520);
    } else {
      state.metrics.retry += 1;
      els.feedbackText.classList.add('is-retry');
      els.feedbackText.classList.remove('is-neutral');
      els.feedbackText.textContent = `${target?.text || '목표'}를 한 번 더 해볼게요.`;
      playSound(ERROR_SOUND_PATH, 0.38);
      if (window.HahaLabFeedbackOverlay && typeof window.HahaLabFeedbackOverlay.show === 'function') {
        window.HahaLabFeedbackOverlay.show('error');
      }
      state.latestUtterance = null;
      state.latestAssessment = null;
      els.passButton.disabled = true;
      els.retryButton.disabled = true;
      renderAssessment(null);
      state.targetStartedAtMs = Date.now();
    }
  }

  function buildReportInput() {
    const elapsedMs = Date.now() - state.startedAtMs;
    const attempts = Math.max(1, state.metrics.attempts);
    const accuracy = Math.round((state.metrics.pass / attempts) * 100);
    return {
      reportType: 'playlab-bilabial-bubble',
      reportProfileId: 'bilabial-articulation-observation',
      reportProfileLabel: '양순음 조음 산출 관찰',
      stageId: state.stage.id,
      stageTitle: state.stage.title,
      totalQuestions: state.stage.targets.length,
      correctCount: state.metrics.pass,
      wrongCount: state.metrics.retry,
      attemptCount: state.metrics.attempts,
      accuracyRate: accuracy,
      avgResponseMs: Math.round(average(state.metrics.responseTimes)),
      avgDurationMs: Math.round(average(state.metrics.durations)),
      avgRms: Number(average(state.metrics.rmsValues).toFixed(4)),
      avgZcr: Number(average(state.metrics.zcrValues).toFixed(4)),
      startedAtMs: state.startedAtMs,
      elapsedMs,
      decisions: state.metrics.decisions.slice(),
      targets: state.metrics.targets.slice()
    };
  }

  function buildReportPayload(input) {
    const score = input.accuracyRate;
    const briefOpinion = `${state.stage.title}에서 ${input.attemptCount}회 발화가 감지되었고, 예비 음향 판정과 교사 확인 기준 ${input.correctCount}회 통과로 기록되었습니다.`;
    const guardianSummary = '양순음 조음 산출을 비눗방울 놀이로 반복했습니다. 결과는 자동 진단이 아니라 음향 단서, 발화 시작 지연, 발성 지속시간, 교사 확인을 함께 본 수업 기록입니다.';
    const teacherReviewNote = '목표 음소별 조음 위치와 조음 방법, 발화 시작 지연, 발성 지속시간, 다시 시도 후 조절, 단어 내 음소 위치별 유지 여부를 함께 검토합니다.';
    const actionPlanSummary = '다음 회기에는 예비 판정과 교사 확인이 함께 안정된 목표는 음절-단어-문장 수준으로 확장하고, 흔들린 목표는 고립음과 무의미 음절에서 짧은 성공 산출을 반복합니다.';
    const roleNotes = [
      { title: '양순음 조음 산출', desc: 'ㅂ, ㅃ, ㅍ, ㅁ의 양순 폐쇄, 파열, 기식성, 비강 공명을 관찰합니다.' },
      { title: '발화 시작 지연', desc: '목표 제시 후 산출 시작까지의 지연과 발성 지속시간을 참고합니다.' },
      { title: '임상적 교사 판단', desc: '예비 음향 판정 이후 교사가 실제 조음 정확도와 수업 맥락을 반영합니다.' }
    ];
    const evidenceBasis = [
      'Web Audio API 기반 브라우저 내 발화 강도 및 시간 특징 추출',
      '원음 저장 없는 수치 기반 수행 기록',
      '예비 판정 이후 교사 확인을 포함한 조음 훈련 관찰',
      '고립음-무의미 음절-어두/어중/어말 단어-문장-자발화로 이어지는 단계적 과제 확장'
    ];
    return {
      labKind: 'playlab',
      reportScope: 'playlab',
      saveToClientReport: true,
      curriculumKey: CURRICULUM_KEY,
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      labTitle: LAB_TITLE,
      totalQuestions: input.totalQuestions,
      correctCount: input.correctCount,
      wrongCount: input.wrongCount,
      score,
      accuracyScore: input.accuracyRate,
      durationSeconds: Number(input.elapsedMs || 0) / 1000,
      startedAtMs: input.startedAtMs,
      reportType: input.reportType,
      reportInput: input,
      briefOpinion,
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      roleNotes,
      evidenceBasis,
      overview: `${briefOpinion}\n전문 해석: 이 학습은 양순음 산출 자체를 확정 진단하지 않고, 음향 강도, 발성 지속시간, 발화 시작 지연, 교사 확인을 함께 사용해 반복 훈련과 회기 관찰을 지원합니다.`,
      recommendations: [
        '고립음에서 안정되면 무의미 음절, 어두 단어, 어중/어말 단어, 문장으로 한 단계씩 확장합니다.',
        '다시 시도가 많은 목표는 양순 폐쇄와 파열 시작을 시각적으로 보여 주고 짧은 성공 산출을 먼저 만듭니다.',
        '자발화 단계는 정확도만 보지 않고 목표 단어 사용 빈도, 명료도, 발화 유지 시간을 함께 봅니다.'
      ],
      cognitiveScore: score,
      reactionScore: Math.max(0, Math.min(100, Math.round(100 - input.avgResponseMs / 80))),
      focusKey: 'bilabial-articulation',
      focusLabel: '양순음 조음 산출 관찰',
      details: {
        curriculum_key: CURRICULUM_KEY,
        stage_key: state.stage.id,
        report_scope: 'playlab',
        lab_scope: 'playlab',
        lab_label: '플레이랩',
        lab_title: LAB_TITLE,
        game_name: LAB_TITLE,
        report_title: state.stage.title,
        category_title: DISPLAY_TITLE,
        report_focus_key: 'bilabial-articulation',
        report_focus_label: '양순음 조음 산출 관찰',
        report_profile_id: input.reportProfileId,
        report_profile_label: input.reportProfileLabel,
        report_type: input.reportType,
        report_headline: '양순음 조음 산출 예비 판정과 교사 확인 기록',
        report_integrated_score: score,
        report_brief_opinion: briefOpinion,
        report_guardian_summary: guardianSummary,
        report_teacher_review_note: teacherReviewNote,
        report_action_plan_summary: actionPlanSummary,
        report_action_plan_policy: 'teacher-review-required',
        report_display_modes: ['teacher', 'guardian'],
        report_role_notes: roleNotes,
        report_evidence_basis: evidenceBasis,
        report_domain: '양순음 조음 산출 및 발화 타이밍 관찰',
        target_phonemes: ['ㅂ', 'ㅃ', 'ㅍ', 'ㅁ'],
        attempt_count: input.attemptCount,
        avg_response_ms: input.avgResponseMs,
        avg_duration_ms: input.avgDurationMs,
        avg_rms: input.avgRms,
        avg_zcr: input.avgZcr,
        decisions: input.decisions,
        utterance_features: input.targets
      }
    };
  }

  function parseMaybeJson(value, fallback) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return fallback;
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
      if (launchKey && launchKey.indexOf(LAUNCH_CONTEXT_STORAGE_PREFIX) === 0 && window.sessionStorage) {
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
          clientType: String(params.get('clientType') || 'client').trim() || 'client',
          source: 'query'
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

  async function saveSupabaseReport(payload, input) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = await getSupabaseClient();
    if (!client) return { skipped: true };
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(input.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(input.elapsedMs || 0) / 60000));
    const details = Object.assign({
      source_page: 'playlab-bilabial-bubble.html',
      completed_at: completedAt,
      started_at: startedAt,
      duration_minutes: durationMinutes,
      score: payload.score,
      accuracy_score: payload.accuracyScore,
      correct_count: payload.correctCount,
      wrong_count: payload.wrongCount,
      total_questions: payload.totalQuestions
    }, payload.details);
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
        report_scope: 'playlab',
        lab_scope: 'playlab',
        report_focus_key: details.report_focus_key,
        report_focus_label: details.report_focus_label,
        report_integrated_score: details.report_integrated_score,
        curriculum_key: CURRICULUM_KEY,
        duration_minutes: durationMinutes
      },
      memo: payload.stageTitle || LAB_TITLE
    };
    const result = await client.from('histories').insert(row);
    if (result && result.error) throw result.error;
    return result;
  }

  function saveLearningReport(input) {
    if (!state.stage || state.savedRunId) return;
    const payload = buildReportPayload(input);
    state.savedRunId = `saving-${Date.now()}`;
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === 'function') {
      const record = window.HahaLabLearningHarness.recordSession(payload);
      state.savedRunId = record && record.id ? record.id : state.savedRunId;
    }
    saveSupabaseReport(payload, input).catch((error) => {
      console.error('[playlab-bilabial-bubble] history save failed:', error);
    });
  }

  function renderResult() {
    stopMicrophone();
    const input = buildReportInput();
    saveLearningReport(input);
    els.resultTitle.textContent = `${state.stage.title} 완료`;
    els.resultSummary.textContent = `${input.attemptCount}회 발화 감지 중 교사 확인 ${input.correctCount}회 통과, 다시 ${input.wrongCount}회로 기록했어요.`;
    els.resultStats.innerHTML = `
      <div class="bilabial-stat"><span>통과율</span><strong>${input.accuracyRate}%</strong></div>
      <div class="bilabial-stat"><span>통과</span><strong>${input.correctCount}</strong></div>
      <div class="bilabial-stat"><span>다시</span><strong>${input.wrongCount}</strong></div>
      <div class="bilabial-stat"><span>평균 발화</span><strong>${formatSeconds(input.avgDurationMs)}</strong></div>
    `;
    els.reportOpinion.innerHTML = `
      <p><strong>전문 활용 포인트</strong></p>
      <p>양순음 조음 산출을 자동 진단하지 않고, 음향 강도·발성 지속시간·발화 시작 지연·예비 판정·교사 확인을 함께 기록했습니다. 수업에서는 목표 음소별 조음 위치와 조음 방법, 다시 시도 후 조절, 단어와 문장 속 유지 여부를 관찰 지표로 사용하세요.</p>
    `;
    setScreen('result');
  }

  function openHelp() {
    els.helpModal.classList.add('is-open');
    els.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    els.helpModal.classList.remove('is-open');
    els.helpModal.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
    els.stageGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (button) startStage(button.dataset.stageId);
    });
    els.stageButton.addEventListener('click', () => {
      stopMicrophone();
      setScreen('stage');
    });
    els.micButton.addEventListener('click', startMicrophone);
    els.simulateButton.addEventListener('click', () => {
      const rule = getAssessmentRule(state.stage);
      const durationFloor = Math.max(rule.minDuration + 120, Math.min(rule.maxDuration - 200, rule.minDuration * 1.25));
      const durationCeil = Math.max(durationFloor + 120, Math.min(rule.maxDuration - 60, rule.minDuration * 1.7));
      handleDetectedUtterance({
        rms: Math.max(rule.minRms + 0.04, 0.16) + Math.random() * 0.06,
        peak: Math.max(rule.minPeak + 0.12, 0.32) + Math.random() * 0.12,
        zcr: 0.06 + Math.random() * 0.04,
        durationMs: durationFloor + Math.random() * (durationCeil - durationFloor),
        simulated: true
      });
    });
    els.passButton.addEventListener('click', () => applyTeacherDecision('pass'));
    els.retryButton.addEventListener('click', () => applyTeacherDecision('retry'));
    els.sameStageButton.addEventListener('click', () => startStage(state.stage?.id || STAGES[0].id));
    els.otherStageButton.addEventListener('click', () => setScreen('stage'));
    els.helpButton.addEventListener('click', openHelp);
    els.helpClose.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
    window.addEventListener('playlab:global-exit-confirmed', stopMicrophone);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHelp();
    });
  }

  function cacheElements() {
    [
      'stageView', 'gameView', 'resultView', 'stageGrid', 'stageLabel', 'stageButton',
      'helpButton', 'helpModal', 'helpClose', 'helpHow', 'helpBenefit',
      'stageKicker', 'taskTitle', 'taskSubtitle', 'roundChip', 'passChip',
      'scene', 'bubbleTrack', 'mascot', 'mainBubble', 'bubbleTarget', 'rewardLayer',
      'targetKind', 'targetText', 'targetCue', 'audioState', 'rmsMeter', 'timingMeter',
      'rmsValue', 'durationValue', 'audioHint', 'micButton', 'simulateButton',
      'qualityText', 'passButton', 'retryButton', 'feedbackText', 'resultTitle', 'resultSummary',
      'resultStats', 'reportOpinion', 'sameStageButton', 'otherStageButton'
    ].forEach((id) => {
      els[id] = $(id);
    });
  }

  function initHelpText() {
    const config = window.PLAYLAB_PAGE_CONFIG || {};
    if (els.helpHow) els.helpHow.textContent = config.helpHow || '';
    if (els.helpBenefit) els.helpBenefit.textContent = config.helpBenefit || '';
  }

  function initHarnessHooks() {
    window.BilabialBubbleHarness = {
      stages: STAGES,
      computeAudioFeatures,
      startStage,
      testUtterance: handleDetectedUtterance,
      forceResult() {
        startStage('isolated');
        STAGES[0].targets.forEach((target) => {
          state.latestUtterance = {
            target: target.text,
            phoneme: target.phoneme,
            stageId: state.stage.id,
            stageTitle: state.stage.title,
            responseMs: 800,
            durationMs: 620,
            rms: 0.2,
            peak: 0.42,
            zcr: 0.08,
            simulated: true
          };
          state.metrics.attempts += 1;
          state.metrics.pass += 1;
          state.metrics.responseTimes.push(800);
          state.metrics.durations.push(620);
          state.metrics.rmsValues.push(0.2);
          state.metrics.zcrValues.push(0.08);
          state.metrics.targets.push(state.latestUtterance);
          state.metrics.decisions.push(Object.assign({ decision: 'pass', preliminaryStatus: 'accepted', preliminaryScore: 92 }, state.latestUtterance));
        });
        renderResult();
      }
    };
  }

  function init() {
    cacheElements();
    initHelpText();
    setupSceneAssets();
    renderStages();
    bindEvents();
    initHarnessHooks();
    if (new URLSearchParams(window.location.search).has('harness-result')) {
      window.setTimeout(() => window.BilabialBubbleHarness.forceResult(), 120);
    } else {
      setScreen('stage');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
