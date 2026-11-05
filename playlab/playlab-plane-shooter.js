(function () {
  'use strict';

  const LAB_TITLES = {
    playlab: '하늘 타겟 슈팅',
    rehab: '재활랩 하늘 반응 억제 훈련'
  };
  const REPORT_TYPES = {
    playlab: 'playlab-plane-shooter',
    rehab: 'rehablab-plane-shooter-gonogo'
  };
  const ASSET_ROOT = 'images/kenney_tappy-plane/PNG/';
  const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';

  const PLANE_ASSETS = {
    background: 'images/kenney_tappy-plane/PNG/background.png',
    player: {
      playlab: ['images/kenney_tappy-plane/PNG/Planes/planeBlue1.png', 'images/kenney_tappy-plane/PNG/Planes/planeBlue2.png', 'images/kenney_tappy-plane/PNG/Planes/planeBlue3.png'],
      rehab: ['images/kenney_tappy-plane/PNG/Planes/planeGreen1.png', 'images/kenney_tappy-plane/PNG/Planes/planeGreen2.png', 'images/kenney_tappy-plane/PNG/Planes/planeGreen3.png']
    },
    letters: {
      A: 'images/kenney_tappy-plane/PNG/Letters/letterA.png',
      B: 'images/kenney_tappy-plane/PNG/Letters/letterB.png',
      C: 'images/kenney_tappy-plane/PNG/Letters/letterC.png',
      D: 'images/kenney_tappy-plane/PNG/Letters/letterD.png',
      E: 'images/kenney_tappy-plane/PNG/Letters/letterE.png',
      F: 'images/kenney_tappy-plane/PNG/Letters/letterF.png'
    },
    numbers: {
      1: 'images/kenney_tappy-plane/PNG/Numbers/number1.png',
      2: 'images/kenney_tappy-plane/PNG/Numbers/number2.png',
      3: 'images/kenney_tappy-plane/PNG/Numbers/number3.png',
      4: 'images/kenney_tappy-plane/PNG/Numbers/number4.png',
      5: 'images/kenney_tappy-plane/PNG/Numbers/number5.png',
      6: 'images/kenney_tappy-plane/PNG/Numbers/number6.png',
      7: 'images/kenney_tappy-plane/PNG/Numbers/number7.png',
      8: 'images/kenney_tappy-plane/PNG/Numbers/number8.png'
    },
    terrains: [
      { key: 'dirt', ground: 'images/kenney_tappy-plane/PNG/groundDirt.png', topRock: 'images/kenney_tappy-plane/PNG/rockDown.png', bottomRock: 'images/kenney_tappy-plane/PNG/rock.png' },
      { key: 'grass', ground: 'images/kenney_tappy-plane/PNG/groundGrass.png', topRock: 'images/kenney_tappy-plane/PNG/rockGrassDown.png', bottomRock: 'images/kenney_tappy-plane/PNG/rockGrass.png' },
      { key: 'ice', ground: 'images/kenney_tappy-plane/PNG/groundIce.png', topRock: 'images/kenney_tappy-plane/PNG/rockIceDown.png', bottomRock: 'images/kenney_tappy-plane/PNG/rockIce.png' },
      { key: 'rock', ground: 'images/kenney_tappy-plane/PNG/groundRock.png', topRock: 'images/kenney_tappy-plane/PNG/rockDown.png', bottomRock: 'images/kenney_tappy-plane/PNG/rock.png' },
      { key: 'snow', ground: 'images/kenney_tappy-plane/PNG/groundSnow.png', topRock: 'images/kenney_tappy-plane/PNG/rockSnowDown.png', bottomRock: 'images/kenney_tappy-plane/PNG/rockSnow.png' }
    ]
  };

  const AGE_GROUPS = {
    toddler: { label: '유아', range: '2-6세', benchmarkMs: 1700, speedWeight: 0.6, allowance: 0.18, missPenalty: 8, falseAlarmPenalty: 12 },
    child: { label: '초등', range: '7-12세', benchmarkMs: 1350, speedWeight: 0.82, allowance: 0.1, missPenalty: 9, falseAlarmPenalty: 14 },
    teen: { label: '청소년', range: '13-17세', benchmarkMs: 1100, speedWeight: 0.92, allowance: 0.06, missPenalty: 10, falseAlarmPenalty: 15 },
    adult: { label: '성인', range: '18-64세', benchmarkMs: 980, speedWeight: 1, allowance: 0.04, missPenalty: 10, falseAlarmPenalty: 16 },
    senior: { label: '고령자', range: '65세 이상', benchmarkMs: 1500, speedWeight: 0.62, allowance: 0.2, missPenalty: 8, falseAlarmPenalty: 12 }
  };

  const PLAYLAB_STAGES = [
    { id: 'number-target', index: 1, title: '숫자 목표 슈팅', desc: '초록 테두리 숫자만 맞혀요.', rule: '초록 테두리 숫자만 맞혀요.', targetKind: 'number', targetValues: ['1', '2', '3', '4'], distractorValues: ['5', '6', '7', '8'], rounds: 12, noGoRate: 0.35, speed: 170, accent: '#0ea5e9' },
    { id: 'letter-target', index: 2, title: '글자 목표 슈팅', desc: '목표 글자를 찾아 맞혀요.', rule: 'A, B, C 중 초록 테두리 글자만 맞혀요.', targetKind: 'letter', targetValues: ['A', 'B', 'C'], distractorValues: ['D', 'E', 'F'], rounds: 12, noGoRate: 0.38, speed: 185, accent: '#22c55e' },
    { id: 'mixed-target', index: 3, title: '숫자와 글자 전환', desc: '문제마다 목표 종류가 바뀌어요.', rule: '초록 테두리 목표만 맞히고 빨간 테두리는 참아요.', targetKind: 'mixed', targetValues: ['1', '3', '5', 'A', 'C', 'E'], distractorValues: ['2', '4', '6', 'B', 'D', 'F'], rounds: 14, noGoRate: 0.42, speed: 205, accent: '#8b5cf6' },
    { id: 'go-nogo-cloud', index: 4, title: '멈춤 반응 챌린지', desc: '빨간 테두리 방해 표식은 쏘지 않아요.', rule: '목표보다 방해 표식이 더 많아요. 참는 반응을 연습해요.', targetKind: 'mixed', targetValues: ['2', '4', '6', 'B', 'D'], distractorValues: ['1', '3', '5', 'A', 'C', 'E'], rounds: 14, noGoRate: 0.55, speed: 215, accent: '#f97316' },
    { id: 'obstacle-focus', index: 5, title: '장애물 집중 비행', desc: '바위를 피하면서 목표만 맞혀요.', rule: '바위를 피하고 목표 표식만 맞혀요.', targetKind: 'mixed', targetValues: ['7', '8', 'A', 'F'], distractorValues: ['1', '2', 'B', 'C'], rounds: 16, noGoRate: 0.45, obstacleRate: 0.28, speed: 230, accent: '#ef4444' }
  ];

  const REHAB_LEVELS = [
    { id: 'lv1', index: 1, label: '반응 안정화', title: '반응 안정화', desc: '목표와 비목표를 천천히 구분합니다.', rule: '목표만 반응하고 비목표는 참아요.', rounds: 12, noGoRate: 0.35, obstacleRate: 0.08, speed: 150, goLabel: '기초 목표' },
    { id: 'lv2', index: 2, label: '기초 억제', title: '기초 억제', desc: '반응 전 확인 절차를 만듭니다.', rule: '초록 테두리만 맞히고 빨간 테두리는 참아요.', rounds: 12, noGoRate: 0.42, obstacleRate: 0.12, speed: 170, goLabel: '억제 시작' },
    { id: 'lv3', index: 3, label: '선택 주의', title: '선택 주의', desc: '비슷한 표식 속에서 목표를 찾습니다.', rule: '목표 숫자/글자만 맞혀요.', rounds: 14, noGoRate: 0.45, obstacleRate: 0.14, speed: 190, goLabel: '목표 탐지' },
    { id: 'lv4', index: 4, label: '오경보 억제', title: '오경보 억제', desc: '방해 표식이 많은 조건에서 참습니다.', rule: '방해 표식이 많아도 목표만 반응해요.', rounds: 14, noGoRate: 0.56, obstacleRate: 0.16, speed: 210, goLabel: '오경보 관리' },
    { id: 'lv5', index: 5, label: '규칙 전환', title: '규칙 전환', desc: '숫자와 글자 목표가 섞입니다.', rule: '목표 종류가 바뀌어도 초록 테두리만 맞혀요.', rounds: 16, noGoRate: 0.5, obstacleRate: 0.2, speed: 230, goLabel: '전환 유지' },
    { id: 'lv6', index: 6, label: '고부하 종합', title: '고부하 종합', desc: '빠른 속도와 장애물 속에서 수행합니다.', rule: '속도가 빨라져도 멈춤-확인-반응을 유지해요.', rounds: 16, noGoRate: 0.55, obstacleRate: 0.24, speed: 250, goLabel: '종합 수행' }
  ].map((level) => Object.assign({
    targetKind: 'mixed',
    targetValues: ['1', '3', '5', 'A', 'C', 'E'],
    distractorValues: ['2', '4', '6', 'B', 'D', 'F'],
    accent: '#0f766e'
  }, level));

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const round = (value) => Math.round(Number(value || 0));
  const percent = (value, total) => total ? Math.round((Number(value || 0) / total) * 100) : 0;
  const average = (items) => {
    const values = (items || []).map(Number).filter((value) => Number.isFinite(value) && value > 0);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  };
  const pick = (items) => items[Math.floor(Math.random() * items.length)] || items[0];

  function planPlaneShooterObstacleY(assetPath = '', randomValue = Math.random()) {
    const fileName = String(assetPath || '').split('/').pop() || '';
    if (/down/i.test(fileName)) return 0;
    if (fileName) return 84 + Math.random() * 5;
    return randomValue < 0.5
      ? 10 + Math.random() * 8
      : 83 + Math.random() * 6;
  }

  let audioContext = null;
  function getAudioContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioContext) audioContext = new AudioCtor();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }

  function playPlaneShooterSound(kind) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.exponentialRampToValueAtTime(kind === 'collision' ? 0.2 : 0.13, now + 0.015);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    master.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc.type = kind === 'collision' ? 'sawtooth' : 'triangle';
    osc2.type = 'sine';
    const tones = {
      fire: [520, 760],
      hit: [720, 980],
      wrong: [210, 150],
      collision: [120, 72],
      complete: [660, 880]
    }[kind] || [440, 620];

    osc.frequency.setValueAtTime(tones[0], now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, tones[1]), now + 0.18);
    osc2.frequency.setValueAtTime(tones[1] * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(Math.max(60, tones[0]), now + 0.16);
    osc.connect(master);
    osc2.connect(master);
    osc.start(now);
    osc2.start(now + 0.015);
    osc.stop(now + 0.22);
    osc2.stop(now + 0.18);
    window.setTimeout(() => master.disconnect(), 280);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getAssetForValue(value) {
    if (/^\d$/.test(String(value))) return PLANE_ASSETS.numbers[String(value)];
    return PLANE_ASSETS.letters[String(value).toUpperCase()];
  }

  function pickTerrainObstacle() {
    const terrain = pick(PLANE_ASSETS.terrains);
    const rock = Math.random() < 0.5 ? terrain.topRock : terrain.bottomRock;
    return {
      terrainKey: terrain.key,
      ground: terrain.ground,
      rock,
      lane: /down/i.test(rock) ? 'top' : 'bottom'
    };
  }

  function renderGroundLayer() {
    if (!els.playfield) return;
    let layer = els.playfield.querySelector('.plane-ground-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'plane-ground-layer';
      els.playfield.insertBefore(layer, els.objectLayer || els.playfield.firstChild);
    }
    const terrains = PLANE_ASSETS.terrains;
    layer.innerHTML = Array.from({ length: 10 }, (_, index) => {
      const terrain = terrains[index % terrains.length];
      return `<img src="${escapeHtml(terrain.ground)}" alt="" data-terrain="${escapeHtml(terrain.key)}">`;
    }).join('');
  }

  function buildPlaneShooterMetrics({ logs = [], totalRounds = 1, elapsedMs = 0, age = AGE_GROUPS.child, level = REHAB_LEVELS[0] } = {}) {
    const hit = logs.filter((entry) => entry.outcome === 'HIT').length;
    const miss = logs.filter((entry) => entry.outcome === 'MISS').length;
    const hold = logs.filter((entry) => entry.outcome === 'CORRECT_REJECT').length;
    const falseAlarm = logs.filter((entry) => entry.outcome === 'FALSE_ALARM').length;
    const collision = logs.filter((entry) => entry.collision).length;
    const targetTotal = logs.filter((entry) => entry.target).length || hit + miss;
    const noGoTotal = logs.filter((entry) => !entry.target && !entry.obstacle).length || hold + falseAlarm;
    const correct = hit + hold;
    const wrong = miss + falseAlarm;
    const reactionValues = logs.filter((entry) => entry.outcome === 'HIT' || entry.outcome === 'FALSE_ALARM').map((entry) => entry.reactionMs);
    const avgReactionMs = round(average(reactionValues));
    const reactionMean = avgReactionMs || 0;
    const reactionVariance = reactionValues.length > 1
      ? round(reactionValues.reduce((sum, value) => sum + Math.pow(Number(value || 0) - reactionMean, 2), 0) / reactionValues.length)
      : 0;
    const accuracyRate = percent(correct, totalRounds || logs.length || 1);
    const targetRate = percent(hit, targetTotal || 1);
    const inhibitionRate = percent(hold, noGoTotal || 1);
    const allowance = Number(age.allowance || 0);
    const difficultyBonus = Number(level.index || 1) * (1.2 + allowance);
    const benchmarkMs = Number(age.benchmarkMs || 1350);
    const speedScore = avgReactionMs
      ? clamp(round(76 + ((benchmarkMs - avgReactionMs) / benchmarkMs) * (24 * Number(age.speedWeight || 0.8)) + difficultyBonus), 18, 100)
      : clamp(round(50 + allowance * 24), 18, 76);
    const targetScore = clamp(round((targetRate * 0.72) + (accuracyRate * 0.18) + difficultyBonus - (miss * Number(age.missPenalty || 8) * 0.35)), 15, 100);
    const inhibitionScore = clamp(round((inhibitionRate * 0.7) + ((100 - falseAlarm * Number(age.falseAlarmPenalty || 14)) * 0.22) + (accuracyRate * 0.08) + difficultyBonus), 12, 100);
    const attentionScore = clamp(round((accuracyRate * 0.42) + (targetRate * 0.24) + (inhibitionRate * 0.18) + 16 - (collision * 7)), 12, 100);
    const selfMonitoringScore = clamp(round(100 - (falseAlarm * Number(age.falseAlarmPenalty || 14)) - (miss * Number(age.missPenalty || 8)) - (collision * 6) + difficultyBonus), 12, 100);
    const integratedScore = clamp(round(
      inhibitionScore * 0.28 +
      targetScore * 0.24 +
      attentionScore * 0.2 +
      speedScore * 0.14 +
      selfMonitoringScore * 0.14
    ), 0, 100);
    return {
      logs,
      hit,
      miss,
      hold,
      falseAlarm,
      collision,
      targetTotal,
      noGoTotal,
      correct,
      wrong,
      totalRounds,
      elapsedMs,
      avgReactionMs,
      reactionVariance,
      accuracyRate,
      targetRate,
      inhibitionRate,
      speedScore,
      targetScore,
      inhibitionScore,
      attentionScore,
      selfMonitoringScore,
      integratedScore,
      age,
      level
    };
  }

  function getAxisAverage(report, ids) {
    const axes = report && Array.isArray(report.axes) ? report.axes : [];
    const values = ids.map((id) => axes.find((axis) => axis.id === id)).filter(Boolean).map((axis) => Number(axis.score || 0)).filter((value) => value > 0);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  }

  function recommendationLines(report) {
    return (report && Array.isArray(report.recommendations) ? report.recommendations : []).map((item) => {
      const title = String(item.title || '').trim();
      const desc = String(item.desc || '').trim();
      return title && desc ? `${title}: ${desc}` : (title || desc);
    }).filter(Boolean);
  }

  function buildReportObject(mode, stage, age, metrics, reportInput) {
    const scope = mode === 'rehab' ? 'rehab' : 'playlab';
    const engineReport = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.buildReport === 'function'
      ? window.PlaylabReportEngine.buildReport(reportInput)
      : {};
    const axes = [
      { id: 'targetDetection', label: mode === 'rehab' ? '목표 탐지' : '목표 맞히기', score: metrics.targetScore },
      { id: 'inhibition', label: '반응 억제', score: metrics.inhibitionScore },
      { id: 'attention', label: '주의 지속', score: metrics.attentionScore },
      { id: 'speed', label: '처리 속도', score: metrics.speedScore },
      { id: 'selfMonitoring', label: '자기 점검', score: metrics.selfMonitoringScore },
      { id: 'accuracy', label: '정확도', score: metrics.accuracyRate }
    ];
    const briefOpinion = scope === 'rehab'
      ? `${age?.label || '선택 연령'} ${stage.label || stage.title} 조건에서 목표 탐지 ${metrics.targetRate}%, 억제 성공 ${metrics.inhibitionRate}%, 평균 반응 ${metrics.avgReactionMs ? (metrics.avgReactionMs / 1000).toFixed(2) + '초' : '산출 없음'}가 관찰되었습니다.`
      : `${stage.title}에서 목표 ${metrics.hit}개를 맞히고 방해 표식 ${metrics.hold}개를 참았습니다. 오발 ${metrics.falseAlarm}회, 놓친 목표 ${metrics.miss}회가 기록되었습니다.`;
    const longOpinion = [
      briefOpinion,
      metrics.falseAlarm > 0
        ? '방해 표식에서 발사한 반응은 반응 전 확인 루틴을 더 안정화해야 하는 관찰 지표입니다.'
        : '방해 표식에 대한 불필요한 반응 보류가 비교적 안정적으로 관찰되었습니다.',
      metrics.miss > 0
        ? '목표를 놓친 시행은 시각 탐색 속도, 피로, 화면 내 위치 추적 부담을 함께 고려해야 합니다.'
        : '목표 표식에 대한 탐지와 반응 개시가 안정적으로 유지되었습니다.',
      '본 기록은 회기 내 수행 관찰 자료이며 의학적 진단이나 치료 효과 판정을 대체하지 않습니다.'
    ].join(' ');
    return Object.assign({}, engineReport, {
      integratedScore: metrics.integratedScore,
      accuracyRate: metrics.accuracyRate,
      firstTryRate: metrics.accuracyRate,
      completionRate: 100,
      axes,
      sortedAxes: axes.slice().sort((a, b) => a.score - b.score),
      headline: metrics.integratedScore >= 82 ? '목표 탐지와 반응 보류가 안정적으로 관찰됩니다.' : '목표 확인 후 반응을 시작하는 절차 훈련이 필요합니다.',
      briefOpinion,
      longOpinion,
      highlights: [
        { label: '통합 점수', value: `${metrics.integratedScore}점` },
        { label: '목표 타격', value: `${metrics.hit}/${metrics.targetTotal}` },
        { label: '억제 성공', value: `${metrics.inhibitionRate}%` },
        { label: '오경보', value: `${metrics.falseAlarm}회` },
        { label: '충돌', value: `${metrics.collision}회` },
        { label: '평균 반응', value: metrics.avgReactionMs ? `${(metrics.avgReactionMs / 1000).toFixed(2)}초` : '-' }
      ],
      roleNotes: [
        { id: 'rehab', title: '인지재활 관찰', text: '목표 탐지, 반응 억제, 주의 지속을 동시에 요구하는 Go/No-Go 기반 과제입니다.' },
        { id: 'behavior', title: '행동 조절 관찰', text: '오발보다 반응 전 멈춤-확인 절차가 유지되는지를 우선 관찰합니다.' },
        { id: 'learning', title: '학습 적용', text: '게임 점수보다 목표 규칙을 말로 확인하고 같은 절차를 반복하는 흐름이 중요합니다.' }
      ],
      recommendations: [
        { title: '멈춤-확인-반응', desc: '발사 전 목표 색이나 표식을 짧게 확인하고 반응하도록 안내합니다.' },
        { title: '난이도 조정 후보', desc: '정확도와 억제 성공이 안정되면 속도나 방해 표식 비율을 한 단계만 높여 관찰합니다.' },
        { title: '오류 후 회복', desc: '오발 직후에는 짧게 멈추고 다음 표식부터 다시 시작하는 루틴을 고정합니다.' }
      ]
    });
  }

  function buildPlaneShooterReportPayload({ mode = 'playlab', stage, age = AGE_GROUPS.child, metrics, startedAtMs = Date.now(), report = null } = {}) {
    const scope = mode === 'rehab' ? 'rehab' : 'playlab';
    const labTitle = LAB_TITLES[scope];
    const reportInput = {
      reportType: REPORT_TYPES[scope],
      reportScope: scope,
      labKind: scope,
      reportProfileId: scope === 'rehab' ? 'inhibition-impulse' : 'visual-discrimination',
      reportProfileLabel: scope === 'rehab' ? 'Go/No-Go 반응 억제 관찰' : '시각 주의와 반응 조절',
      stageId: stage?.id || '',
      stageTitle: stage?.label || stage?.title || '',
      title: labTitle,
      labTitle,
      totalQuestions: metrics.totalRounds,
      correctCount: metrics.correct,
      wrongCount: metrics.wrong,
      accuracyRate: metrics.accuracyRate,
      firstTryRate: metrics.accuracyRate,
      completionRate: 100,
      avgQuestionMs: metrics.avgReactionMs,
      elapsedMs: metrics.elapsedMs,
      targetCount: metrics.targetTotal,
      distractorKinds: metrics.noGoTotal,
      replayCount: metrics.falseAlarm,
      visualReplayCount: metrics.miss,
      reaction_variability: metrics.reactionVariance,
      difficultyIndex: Number(stage?.index || 1) / 6,
      benchmarkMs: Number(age?.benchmarkMs || 1350),
      domain: 'visual attention go-nogo response inhibition',
      questionLogs: metrics.logs.map((entry) => ({
        correct: entry.outcome === 'HIT' || entry.outcome === 'CORRECT_REJECT',
        outcome: entry.outcome,
        target: entry.target,
        reactionMs: entry.reactionMs || 0,
        collision: entry.collision === true
      }))
    };
    const builtReport = report || buildReportObject(scope, stage, age, metrics, reportInput);
    const axes = Array.isArray(builtReport.axes) ? builtReport.axes : [];
    const score = Number(builtReport.integratedScore || metrics.integratedScore || 0) || 0;
    const cognitiveScore = clamp(getAxisAverage(builtReport, ['targetDetection', 'attention', 'selfMonitoring']) || score, 0, 100);
    const reactionScore = clamp(getAxisAverage(builtReport, ['speed', 'inhibition', 'accuracy']) || score, 0, 100);
    const guardianSummary = scope === 'rehab'
      ? '이번 재활 활동에서는 목표 표식을 확인하고 반응을 보류하는 흐름이 기록되었습니다. 보호자 공유에서는 세부 오류보다 참여 흐름과 반응 안정성을 간단히 확인합니다.'
      : '하늘 타겟 슈팅 활동에서 목표 찾기와 방해 표식 참기 흐름이 기록되었습니다. 점수는 수업 중 관찰 자료입니다.';
    const teacherReviewNote = scope === 'rehab'
      ? 'RehabLab 결과는 목표 탐지, 반응 억제, 반응시간, 충돌, 오경보, 오류 후 회복 흐름을 함께 보는 전문 참고 기록입니다.'
      : 'PlayLab 결과는 시각 탐색, 선택적 주의, 반응 조절, 게임 중 오류 양상을 함께 보는 수업 참고 기록입니다.';
    const actionPlanSummary = scope === 'rehab'
      ? '다음 재활 활동은 자동 확정하지 않고 선생님이 컨디션과 수업 맥락을 함께 확인해 조정합니다.'
      : '다음 활동은 같은 규칙에서 안정성을 확인한 뒤 속도나 방해 표식 비율을 조정 후보로 검토합니다.';
    return {
      labKind: scope,
      reportScope: scope,
      saveToClientReport: true,
      curriculumKey: REPORT_TYPES[scope],
      stageKey: stage?.id || '',
      stageTitle: stage?.label || stage?.title || '',
      labTitle,
      totalQuestions: metrics.totalRounds,
      correctCount: metrics.correct,
      wrongCount: metrics.wrong,
      score,
      accuracyScore: metrics.accuracyRate,
      durationSeconds: Number(metrics.elapsedMs || 0) / 1000,
      startedAtMs,
      reportType: REPORT_TYPES[scope],
      reportInput,
      briefOpinion: builtReport.briefOpinion,
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      actionPlanPolicy: 'teacher-review-required',
      reportDisplayModes: {
        guardian: { label: '보호자 공유', summary: guardianSummary },
        teacher: { label: '전문가 분석', summary: teacherReviewNote }
      },
      overview: builtReport.longOpinion,
      recommendations: recommendationLines(builtReport),
      roleNotes: builtReport.roleNotes || [],
      evidenceBasis: [
        'Go/No-Go 방식의 목표 반응과 비목표 반응 보류를 분리해 기록했습니다.',
        '반응시간은 처리 속도 보조 지표이며 피로와 운동 반응 차이를 함께 고려합니다.',
        '게임 기반 과제의 효과는 근접 전이 중심으로 해석하고 진단 지표로 사용하지 않습니다.'
      ],
      cognitiveScore,
      reactionScore,
      focusKey: 'plane-shooter-go-nogo',
      focusLabel: scope === 'rehab' ? '비행 슈팅 기반 반응 억제' : '하늘 타겟 시각 주의',
      details: {
        report_scope: scope,
        lab_scope: scope,
        lab_label: scope === 'rehab' ? '재활랩' : '플레이랩',
        lab_title: labTitle,
        game_name: labTitle,
        report_title: stage?.label || stage?.title || labTitle,
        category_title: labTitle,
        stage_id: stage?.id || '',
        stage_title: stage?.label || stage?.title || '',
        score,
        accuracy_score: metrics.accuracyRate,
        correct_count: metrics.correct,
        wrong_count: metrics.wrong,
        total_questions: metrics.totalRounds,
        report_type: REPORT_TYPES[scope],
        report_input: reportInput,
        report_headline: builtReport.headline,
        report_integrated_score: score,
        report_brief_opinion: builtReport.briefOpinion,
        report_overview: builtReport.longOpinion,
        report_recommendations: recommendationLines(builtReport),
        report_guardian_summary: guardianSummary,
        report_teacher_review_note: teacherReviewNote,
        report_action_plan_summary: actionPlanSummary,
        report_action_plan_policy: 'teacher-review-required',
        report_display_modes: {
          guardian: { label: '보호자 공유', summary: guardianSummary },
          teacher: { label: '전문가 분석', summary: teacherReviewNote }
        },
        report_role_notes: builtReport.roleNotes || [],
        report_evidence_basis: [
          '컴퓨터 기반 실행기능 훈련은 주의, 작업기억, 전환 기능의 근접 전이를 중심으로 해석합니다.',
          '반응 억제 지표는 오경보와 정반응 보류를 분리해 수업 관찰 자료로 사용합니다.'
        ],
        report_axes: axes.map((axis) => ({
          id: String(axis.id || '').trim(),
          label: String(axis.label || '').trim(),
          score: Number(axis.score || 0) || 0
        })),
        report_cognitive_score: cognitiveScore,
        report_reaction_score: reactionScore,
        report_focus_key: 'plane-shooter-go-nogo',
        report_focus_label: scope === 'rehab' ? '비행 슈팅 기반 반응 억제' : '하늘 타겟 시각 주의',
        report_domain: '시각 주의, 목표 탐지, Go/No-Go 반응 억제',
        hit_count: metrics.hit,
        miss_count: metrics.miss,
        correct_reject_count: metrics.hold,
        false_alarm_count: metrics.falseAlarm,
        collision_count: metrics.collision,
        target_total: metrics.targetTotal,
        no_go_total: metrics.noGoTotal,
        target_rate: metrics.targetRate,
        inhibition_rate: metrics.inhibitionRate,
        avg_reaction_ms: metrics.avgReactionMs,
        reaction_variability: metrics.reactionVariance,
        question_logs: metrics.logs,
        source_page: scope === 'rehab' ? 'rehablab-plane-shooter.html' : 'playlab-plane-shooter.html'
      },
      metadata: {
        report_scope: scope,
        lab_scope: scope,
        report_type: REPORT_TYPES[scope],
        report_integrated_score: score,
        report_cognitive_score: cognitiveScore,
        report_reaction_score: reactionScore
      }
    };
  }

  const state = {
    mode: 'playlab',
    selectedAgeKey: 'child',
    selectedStage: null,
    startedAtMs: 0,
    run: null,
    objects: [],
    shots: [],
    logs: [],
    player: { x: 12, y: 52 },
    keys: new Set(),
    rafId: 0,
    lastMs: 0,
    spawnTimer: 0,
    savedRunId: '',
    supabaseClientPromise: null,
    planeFrame: 0
  };

  const els = {};
  const $ = (id) => document.getElementById(id);

  function setScreen(name) {
    ['stage', 'game', 'result'].forEach((key) => {
      els[`${key}View`]?.classList.toggle('is-active', key === name);
    });
    els.stageButton?.classList.toggle('shell-hidden', name === 'stage');
    els.stageLabel?.classList.toggle('shell-hidden', name === 'stage');
    if (els.stageLabel) {
      const title = state.selectedStage ? (state.selectedStage.label || state.selectedStage.title) : '스테이지 선택';
      els.stageLabel.textContent = title;
    }
    if (name !== 'game') stopLoop();
  }

  function getStages() {
    return state.mode === 'rehab' ? REHAB_LEVELS : PLAYLAB_STAGES;
  }

  function getSelectedAge() {
    return AGE_GROUPS[state.selectedAgeKey] || AGE_GROUPS.child;
  }

  function renderStageCards() {
    if (state.mode === 'rehab') {
      if (els.ageGrid) {
        els.ageGrid.innerHTML = Object.entries(AGE_GROUPS).map(([key, age]) => `
          <button type="button" class="plane-age-card ${key === state.selectedAgeKey ? 'is-selected' : ''}" data-age="${escapeHtml(key)}" style="--stage-color:#0f766e">
            <span>${escapeHtml(age.range)}</span>
            <strong>${escapeHtml(age.label)}</strong>
            <p>반응 시간 기준 ${Math.round(age.benchmarkMs / 100) / 10}초를 참고합니다.</p>
          </button>
        `).join('');
      }
      if (els.levelGrid) {
        els.levelGrid.innerHTML = REHAB_LEVELS.map((stage) => `
          <button type="button" class="plane-stage-card ${state.selectedStage?.id === stage.id ? 'is-selected' : ''}" data-stage-id="${escapeHtml(stage.id)}" style="--stage-color:#0f766e">
            <span>LV${stage.index} · ${stage.goLabel}</span>
            <strong>${escapeHtml(stage.label)}</strong>
            <p>${escapeHtml(stage.desc)}</p>
          </button>
        `).join('');
      }
      updateStartButton();
      return;
    }
    els.stageGrid.innerHTML = PLAYLAB_STAGES.map((stage) => `
      <button type="button" class="plane-stage-card" data-stage-id="${escapeHtml(stage.id)}" style="--stage-color:${escapeHtml(stage.accent)}">
        <span>${stage.index}단계 · ${stage.rounds}라운드</span>
        <strong>${escapeHtml(stage.title)}</strong>
        <p>${escapeHtml(stage.desc)}</p>
      </button>
    `).join('');
  }

  function updateStartButton() {
    if (els.startButton) els.startButton.disabled = !(state.selectedAgeKey && state.selectedStage);
  }

  function chooseStage(stageId) {
    state.selectedStage = getStages().find((stage) => stage.id === stageId) || getStages()[0];
    if (state.mode === 'rehab') {
      renderStageCards();
      return;
    }
    startStage();
  }

  function resetRun() {
    const stage = state.selectedStage || getStages()[0];
    state.selectedStage = stage;
    state.startedAtMs = Date.now();
    state.run = {
      roundIndex: 0,
      totalRounds: stage.rounds,
      correct: 0,
      wrong: 0,
      completed: false
    };
    state.objects = [];
    state.shots = [];
    state.logs = [];
    state.player = { x: 12, y: 52 };
    state.lastMs = 0;
    state.spawnTimer = 0;
    state.savedRunId = '';
    if (els.objectLayer) els.objectLayer.innerHTML = '';
    if (els.shotLayer) els.shotLayer.innerHTML = '';
    renderGroundLayer();
  }

  function startStage() {
    resetRun();
    els.taskTitle.textContent = state.selectedStage.label || state.selectedStage.title;
    els.taskRule.textContent = state.selectedStage.rule;
    els.stageKicker.textContent = state.mode === 'rehab' ? `${getSelectedAge().label} · ${state.selectedStage.label}` : `PLAYLAB ${state.selectedStage.index}`;
    els.planeMessage.textContent = state.selectedStage.rule;
    updateHud();
    setScreen('game');
    requestAnimationFrame(() => {
      els.playfield?.focus();
      startLoop();
    });
  }

  function updateHud() {
    if (!state.run) return;
    const correct = state.logs.filter((entry) => entry.outcome === 'HIT' || entry.outcome === 'CORRECT_REJECT').length;
    const falseAlarm = state.logs.filter((entry) => entry.outcome === 'FALSE_ALARM').length;
    els.roundChip.textContent = `${Math.min(state.run.roundIndex + 1, state.run.totalRounds)} / ${state.run.totalRounds}`;
    els.scoreChip.textContent = state.mode === 'rehab' ? `정반응 ${correct}` : `점수 ${correct}`;
    els.missChip.textContent = state.mode === 'rehab' ? `오경보 ${falseAlarm}` : `오발 ${falseAlarm}`;
  }

  function startLoop() {
    stopLoop();
    state.lastMs = performance.now();
    state.rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
  }

  function makeObject() {
    const stage = state.selectedStage;
    const obstacle = Math.random() < Number(stage.obstacleRate || 0);
    const target = !obstacle && Math.random() >= Number(stage.noGoRate || 0.4);
    const values = target ? stage.targetValues : stage.distractorValues;
    const value = pick(values);
    const obstacleAsset = obstacle ? pickTerrainObstacle() : null;
    return {
      id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      x: 104,
      y: obstacle ? planPlaneShooterObstacleY(obstacleAsset.rock) : 16 + Math.random() * 62,
      speed: Number(stage.speed || 180) / 10,
      target,
      obstacle,
      value,
      obstacleAsset,
      spawnedAt: Date.now(),
      element: null,
      judged: false,
      collision: false
    };
  }

  function renderObject(obj) {
    const element = document.createElement(obj.obstacle ? 'img' : 'div');
    element.className = obj.obstacle ? 'plane-rock' : `plane-target ${obj.target ? 'is-target' : 'is-distractor'}`;
    element.dataset.objectId = obj.id;
    if (obj.obstacle) {
      element.src = obj.obstacleAsset?.rock || PLANE_ASSETS.terrains[0].bottomRock;
      element.alt = '장애물';
      element.dataset.terrain = obj.obstacleAsset?.terrainKey || '';
      element.dataset.lane = obj.obstacleAsset?.lane || '';
    } else {
      const image = document.createElement('img');
      image.src = getAssetForValue(obj.value);
      image.alt = String(obj.value);
      element.appendChild(image);
    }
    els.objectLayer.appendChild(element);
    obj.element = element;
  }

  function makeShot() {
    playPlaneShooterSound('fire');
    const shot = {
      id: `shot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      x: state.player.x + 4,
      y: state.player.y,
      speed: 56,
      element: document.createElement('div')
    };
    shot.element.className = 'plane-shot';
    els.shotLayer.appendChild(shot.element);
    state.shots.push(shot);
  }

  function addPuff(x, y) {
    const puff = document.createElement('div');
    puff.className = 'plane-puff';
    puff.style.left = `${x}%`;
    puff.style.top = `${y}%`;
    els.objectLayer.appendChild(puff);
    window.setTimeout(() => puff.remove(), 450);
  }

  function removeObject(obj) {
    obj.element?.remove();
    state.objects = state.objects.filter((item) => item !== obj);
  }

  function removeShot(shot) {
    shot.element?.remove();
    state.shots = state.shots.filter((item) => item !== shot);
  }

  function logOutcome(obj, outcome, reactionMs, extra = {}) {
    if (obj.judged) return;
    obj.judged = true;
    state.logs.push({
      id: obj.id,
      value: obj.value || 'obstacle',
      target: obj.target === true,
      obstacle: obj.obstacle === true,
      outcome,
      reactionMs: round(reactionMs),
      collision: extra.collision === true,
      x: round(obj.x),
      y: round(obj.y),
      roundIndex: state.run.roundIndex + 1
    });
    state.run.roundIndex += 1;
    updateHud();
    if (state.run.roundIndex >= state.run.totalRounds) finishStage();
  }

  function tick(now) {
    if (!state.run || state.run.completed) return;
    const dt = Math.min(48, now - state.lastMs) / 1000;
    state.lastMs = now;
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.run.roundIndex + state.objects.length < state.run.totalRounds) {
      const obj = makeObject();
      renderObject(obj);
      state.objects.push(obj);
      state.spawnTimer = 1.15;
    }
    updatePlayer(dt);
    updateObjects(dt);
    updateShots(dt);
    checkCollisions();
    state.rafId = requestAnimationFrame(tick);
  }

  function updatePlayer(dt) {
    const move = 36 * dt;
    if (state.keys.has('ArrowUp') || state.keys.has('up')) state.player.y -= move;
    if (state.keys.has('ArrowDown') || state.keys.has('down')) state.player.y += move;
    if (state.keys.has('ArrowLeft') || state.keys.has('left')) state.player.x -= move;
    if (state.keys.has('ArrowRight') || state.keys.has('right')) state.player.x += move;
    state.player.x = clamp(state.player.x, 7, 42);
    state.player.y = clamp(state.player.y, 13, 78);
    state.planeFrame = (state.planeFrame + dt * 10) % 3;
    const frames = PLANE_ASSETS.player[state.mode] || PLANE_ASSETS.player.playlab;
    els.playerPlane.src = frames[Math.floor(state.planeFrame)] || frames[0];
    els.playerPlane.style.left = `${state.player.x}%`;
    els.playerPlane.style.top = `${state.player.y}%`;
  }

  function updateObjects(dt) {
    state.objects.slice().forEach((obj) => {
      obj.x -= obj.speed * dt;
      if (obj.element) {
        obj.element.style.left = `${obj.x}%`;
        obj.element.style.top = `${obj.y}%`;
      }
      if (obj.x < -6) {
        if (!obj.obstacle) {
          logOutcome(obj, obj.target ? 'MISS' : 'CORRECT_REJECT', 0);
        }
        removeObject(obj);
      }
    });
  }

  function updateShots(dt) {
    state.shots.slice().forEach((shot) => {
      shot.x += shot.speed * dt;
      shot.element.style.left = `${shot.x}%`;
      shot.element.style.top = `${shot.y}%`;
      if (shot.x > 106) removeShot(shot);
    });
  }

  function distance(a, b) {
    return Math.hypot(Number(a.x || 0) - Number(b.x || 0), Number(a.y || 0) - Number(b.y || 0));
  }

  function checkCollisions() {
    state.shots.slice().forEach((shot) => {
      const hitObj = state.objects.find((obj) => !obj.obstacle && distance(shot, obj) < 6.5);
      if (!hitObj) return;
      const outcome = hitObj.target ? 'HIT' : 'FALSE_ALARM';
      logOutcome(hitObj, outcome, Date.now() - hitObj.spawnedAt);
      addPuff(hitObj.x, hitObj.y);
      if (hitObj.target) {
        playPlaneShooterSound('hit');
      } else {
        playPlaneShooterSound('wrong');
      }
      if (window.HahaLabFeedbackOverlay && typeof window.HahaLabFeedbackOverlay.showQuestionComplete === 'function') {
        window.HahaLabFeedbackOverlay.showQuestionComplete(hitObj.target ? 'correct' : 'wrong', { sound: true, durationMs: 600 });
      }
      els.planeMessage.textContent = hitObj.target ? '목표를 맞혔어요.' : '방해 표식은 참아야 해요.';
      removeObject(hitObj);
      removeShot(shot);
    });
    state.objects.slice().forEach((obj) => {
      if (!obj.obstacle || obj.collision || distance(state.player, obj) >= 7.5) return;
      obj.collision = true;
      els.playerPlane.classList.add('is-hit');
      window.setTimeout(() => els.playerPlane.classList.remove('is-hit'), 260);
      els.planeMessage.textContent = '장애물을 피해서 목표를 확인해요.';
      playPlaneShooterSound('collision');
      state.logs.push({
        id: obj.id,
        value: 'obstacle',
        target: false,
        obstacle: true,
        outcome: 'COLLISION',
        reactionMs: 0,
        collision: true,
        x: round(obj.x),
        y: round(obj.y),
        roundIndex: state.run.roundIndex + 1
      });
      removeObject(obj);
    });
  }

  function finishStage() {
    if (!state.run || state.run.completed) return;
    state.run.completed = true;
    stopLoop();
    playPlaneShooterSound('complete');
    state.objects.forEach((obj) => obj.element?.remove());
    state.shots.forEach((shot) => shot.element?.remove());
    state.objects = [];
    state.shots = [];
    const metrics = buildPlaneShooterMetrics({
      logs: state.logs,
      totalRounds: state.run.totalRounds,
      elapsedMs: Date.now() - state.startedAtMs,
      age: getSelectedAge(),
      level: state.selectedStage
    });
    const payload = buildPlaneShooterReportPayload({
      mode: state.mode,
      stage: state.selectedStage,
      age: getSelectedAge(),
      metrics,
      startedAtMs: state.startedAtMs
    });
    renderResult(metrics, payload);
    saveReports(payload, metrics);
    setScreen('result');
  }

  function renderResult(metrics, payload) {
    els.resultTitle.textContent = state.mode === 'rehab' ? '하늘 반응 억제 훈련 완료' : '하늘 타겟 슈팅 완료';
    els.resultSummary.textContent = payload.briefOpinion;
    const stats = [
      ['통합 점수', `${payload.score}점`],
      ['정확도', `${metrics.accuracyRate}%`],
      ['목표 타격', `${metrics.hit}/${metrics.targetTotal}`],
      ['억제 성공', `${metrics.inhibitionRate}%`],
      ['오경보', `${metrics.falseAlarm}회`],
      ['충돌', `${metrics.collision}회`]
    ];
    els.resultStats.innerHTML = stats.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
    if (els.professionalReport) {
      const report = buildReportObject(state.mode, state.selectedStage, getSelectedAge(), metrics, payload.reportInput);
      els.professionalReport.innerHTML = window.PlaylabReportEngine && typeof window.PlaylabReportEngine.renderHtml === 'function'
        ? window.PlaylabReportEngine.renderHtml(report, { variant: 'standalone' })
        : `<p>${escapeHtml(payload.overview)}</p>`;
    }
  }

  function readLaunchContext() {
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.readLaunchContext === 'function') {
      return window.HahaLabLearningHarness.readLaunchContext();
    }
    try {
      const params = new URLSearchParams(window.location.search || '');
      const launchKey = String(params.get('labLaunchKey') || '').trim();
      if (launchKey && launchKey.indexOf(LAUNCH_CONTEXT_STORAGE_PREFIX) === 0 && window.sessionStorage) {
        const parsed = window.HahaLabLearningHarness?.readLaunchContext?.() || JSON.parse(window.sessionStorage.getItem(launchKey) || 'null');
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
          clientType: String(params.get('clientType') || 'client').trim() || 'client'
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

  async function saveSupabaseReport(payload, metrics) {
    const launchContext = readLaunchContext();
    if (!launchContext || !launchContext.teacherId || !launchContext.clientId) return { skipped: true };
    const client = await getSupabaseClient();
    if (!client) return { skipped: true };
    const completedAt = new Date().toISOString();
    const startedAt = new Date(Number(payload.startedAtMs || Date.now())).toISOString();
    const durationMinutes = Math.max(1, Math.round(Number(payload.durationSeconds || 0) / 60));
    const details = Object.assign({
      completed_at: completedAt,
      started_at: startedAt,
      duration_minutes: durationMinutes
    }, payload.details);
    const row = {
      teacher_id: String(launchContext.teacherId || '').trim(),
      client_id: String(launchContext.clientId || '').trim(),
      client_name: String(launchContext.clientName || '').trim(),
      type: String(launchContext.clientType || 'client').trim() || 'client',
      category: 'session_history',
      action: LAB_SESSION_COMPLETION_ACTION,
      action_type: payload.labTitle,
      event_datetime: completedAt,
      start_datetime: startedAt,
      end_datetime: completedAt,
      duration: `${durationMinutes} minutes`,
      duration_minutes: durationMinutes,
      details: JSON.stringify(details),
      metadata: Object.assign({
        report_scope: payload.reportScope,
        lab_scope: payload.reportScope,
        report_type: payload.reportType,
        report_integrated_score: payload.score,
        report_cognitive_score: payload.cognitiveScore,
        report_reaction_score: payload.reactionScore,
        duration_minutes: durationMinutes,
        hit_count: metrics.hit,
        false_alarm_count: metrics.falseAlarm
      }, payload.metadata || {}),
      memo: payload.stageTitle || payload.labTitle
    };
    try {
      const result = await client.from('histories').insert(row);
      if (result && result.error) throw result.error;
      return result;
    } catch (error) {
      console.error('[playlab-plane-shooter] history save failed:', error);
      return { error };
    }
  }

  function saveReports(payload, metrics) {
    if (state.savedRunId) return;
    state.savedRunId = `saving-${Date.now()}`;
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === 'function') {
      const record = window.HahaLabLearningHarness.recordSession(payload);
      state.savedRunId = record && record.id ? record.id : state.savedRunId;
    }
    saveSupabaseReport(payload, metrics).catch((error) => {
      console.error('[playlab-plane-shooter] supabase save failed:', error);
    });
  }

  function bindEvents() {
    els.stageGrid?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (button) chooseStage(button.dataset.stageId);
    });
    els.levelGrid?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (button) chooseStage(button.dataset.stageId);
    });
    els.ageGrid?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-age]');
      if (!button) return;
      state.selectedAgeKey = button.dataset.age || 'child';
      renderStageCards();
    });
    els.startButton?.addEventListener('click', () => {
      if (state.selectedStage) startStage();
    });
    els.stageButton?.addEventListener('click', () => setScreen('stage'));
    els.retryButton?.addEventListener('click', () => startStage());
    els.otherStageButton?.addEventListener('click', () => setScreen('stage'));
    els.fireButton?.addEventListener('click', makeShot);
    document.addEventListener('keydown', (event) => {
      if (!state.run || state.run.completed) return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        makeShot();
        return;
      }
      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        state.keys.add(event.key);
      }
    });
    document.addEventListener('keyup', (event) => {
      state.keys.delete(event.key);
    });
    document.querySelectorAll('[data-plane-action]').forEach((button) => {
      const action = button.dataset.planeAction;
      const start = () => state.keys.add(action);
      const end = () => state.keys.delete(action);
      button.addEventListener('pointerdown', start);
      button.addEventListener('pointerup', end);
      button.addEventListener('pointerleave', end);
      button.addEventListener('click', () => {
        state.keys.add(action);
        window.setTimeout(() => state.keys.delete(action), 160);
      });
    });
  }

  function init() {
    const root = document.querySelector('[data-plane-mode]');
    if (!root) return;
    state.mode = root.dataset.planeMode === 'rehab' ? 'rehab' : 'playlab';
    [
      'stageView', 'gameView', 'resultView', 'stageGrid', 'ageGrid', 'levelGrid', 'startButton',
      'stageButton', 'stageLabel', 'stageKicker', 'taskTitle', 'taskRule', 'roundChip',
      'scoreChip', 'missChip', 'playfield', 'objectLayer', 'shotLayer', 'playerPlane',
      'planeMessage', 'fireButton', 'resultTitle', 'resultSummary', 'resultStats',
      'professionalReport', 'retryButton', 'otherStageButton'
    ].forEach((id) => { els[id] = $(id); });
    state.selectedStage = state.mode === 'rehab' ? null : PLAYLAB_STAGES[0];
    renderStageCards();
    bindEvents();
    setScreen('stage');
  }

  window.__PLANE_SHOOTER_LEARNING__ = {
    stages: { playlab: PLAYLAB_STAGES, rehab: REHAB_LEVELS },
    ageGroups: AGE_GROUPS,
    assets: PLANE_ASSETS,
    buildPlaneShooterMetrics,
    buildPlaneShooterReportPayload,
    planPlaneShooterObstacleY
  };

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
