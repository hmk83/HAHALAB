(function () {
  'use strict';

  const LAB_TITLE = '컬러 블록 실제 개수 찾기';
  const CURRICULUM_KEY = 'rehablab-color-block-count';
  const REPORT_TYPE = 'rehablab-color-block-count';
  const REPORT_SCOPE = 'rehab';
  const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
  const choiceCount = 4;

  const IQ_BLOCK_COLORS = ['#fff24a', '#ffe23d', '#ffd133', '#ffbe2e', '#f6d84a', '#ffe86a'];
  const STAGE_BLOCK_PALETTES = [
    ['#fff24a', '#ffe23d', '#ffd133', '#ffbe2e', '#ffe86a'],
    ['#7dd3fc', '#38bdf8', '#0ea5e9', '#67e8f9', '#bae6fd'],
    ['#86efac', '#4ade80', '#22c55e', '#bbf7d0', '#a7f3d0'],
    ['#fbbf24', '#fb923c', '#f97316', '#fde68a', '#fed7aa'],
    ['#fca5a5', '#fb7185', '#ef4444', '#fecdd3', '#fda4af'],
    ['#c4b5fd', '#a78bfa', '#8b5cf6', '#ddd6fe', '#bfdbfe'],
    ['#5eead4', '#2dd4bf', '#14b8a6', '#99f6e4', '#a5f3fc'],
    ['#f0abfc', '#e879f9', '#d946ef', '#fbcfe8', '#f5d0fe']
  ];

  const AGE_GROUPS = {
    preschool: { key: 'preschool', label: '유아', range: '만 4-6세', countShift: -2, maxCap: 12, supportAllowance: 0.18 },
    lower: { key: 'lower', label: '초등 저', range: '초등 1-3학년', countShift: -1, maxCap: 16, supportAllowance: 0.12 },
    upper: { key: 'upper', label: '초등 고', range: '초등 4-6학년', countShift: 0, maxCap: 20, supportAllowance: 0.08 },
    teen: { key: 'teen', label: '청소년', range: '중고등', countShift: 1, maxCap: 22, supportAllowance: 0.05 },
    adult: { key: 'adult', label: '성인', range: '성인/고난도 선별', countShift: 2, maxCap: 24, supportAllowance: 0.02 }
  };

  const STAGES = [
    { index: 1, questions: 8, label: '단층 시각 탐색', focus: '바닥 1층에 놓인 3-5개 블록을 한 개씩 대응해 세어요.', min: 3, max: 5, layers: 1, layoutMode: 'single-layer-basic', hiddenMin: 0, hiddenMax: 0, hiddenStrategy: 'none', color: '#14b8a6' },
    { index: 2, questions: 8, label: '단순 복층 계수', focus: '2층 계단형 구조에서 보이는 위층과 아래층을 분리해 세어요.', min: 4, max: 7, layers: 2, layoutMode: 'simple-duplex', hiddenMin: 0, hiddenMax: 0, hiddenStrategy: 'none', color: '#0ea5e9' },
    { index: 3, questions: 8, label: '받침 관계 확인', focus: '위 블록을 받치는 아래 블록을 함께 확인하며 수량 관계를 세어요.', min: 5, max: 8, layers: 2, layoutMode: 'support-inference', hiddenMin: 0, hiddenMax: 1, hiddenStrategy: 'support', guidedHiddenVisible: true, color: '#8b5cf6' },
    { index: 4, questions: 8, label: '앞뒤 줄 분리', focus: '앞줄과 뒷줄이 겹쳐 보이는 구조를 줄 단위로 나누어 세어요.', min: 6, max: 10, layers: 2, layoutMode: 'basic-rotation', hiddenMin: 0, hiddenMax: 1, hiddenStrategy: 'rear-support', guidedHiddenVisible: true, color: '#f59e0b' },
    { index: 5, questions: 8, label: '복합 층 구조', focus: '3층 이하 구조에서 이미 센 블록과 남은 블록을 누적해 계산해요.', min: 8, max: 13, layers: 3, layoutMode: 'complex-hidden', hiddenMin: 1, hiddenMax: 2, hiddenStrategy: 'multi-support', guidedHiddenVisible: true, color: '#ef4444' },
    { index: 6, questions: 8, label: '비대칭 묶음 분석', focus: '좌우가 다른 구조를 작은 묶음으로 나누어 전체 수를 추론해요.', min: 10, max: 16, layers: 3, layoutMode: 'mental-rotation', hiddenMin: 1, hiddenMax: 3, hiddenStrategy: 'side-rear', guidedHiddenVisible: true, color: '#14b8a6' },
    { index: 7, questions: 8, label: '비어 있는 공간 제외', focus: '터널이나 ㄷ자 구조에서 비어 있는 공간을 빼고 실제 블록만 세어요.', min: 12, max: 19, layers: 4, layoutMode: 'void-structure', hiddenMin: 2, hiddenMax: 4, hiddenStrategy: 'void', guidedHiddenVisible: true, color: '#6366f1' },
    { index: 8, questions: 8, label: '복합 공간 구성', focus: '여러 묶음이 결합된 구조를 분해해 최종 수량을 확인해요.', min: 15, max: 22, layers: 4, layoutMode: 'asymmetric-rotation', hiddenMin: 2, hiddenMax: 5, hiddenStrategy: 'asymmetric', guidedHiddenVisible: true, color: '#db2777' }
  ];

  const state = {
    age: AGE_GROUPS.lower,
    stage: null,
    questions: [],
    questionIndex: 0,
    answered: false,
    startedAtMs: 0,
    questionStartedAtMs: 0,
    savedRunId: '',
    sessionId: '',
    runGeneration: 0,
    reportRevision: 0,
    rotation: { x: -32, y: 42 },
    metrics: {
      correct: 0,
      wrong: 0,
      attempts: 0,
      responseTimes: [],
      answerDistances: [],
      supportInferences: 0
    }
  };

  const els = {};
  let pdfBusy = false;

  function syncPdfButton() {
    if (!els.pdfButton) return;
    const active = els.resultView.classList.contains('is-active') && Boolean(els.professionalReport.querySelector('.block-count-dual-report'));
    els.pdfButton.classList.toggle('shell-hidden', !active);
    els.pdfButton.hidden = !active;
    // The shared help-button style uses display: inline-flex !important.
    if (active) els.pdfButton.style.removeProperty('display');
    else els.pdfButton.style.setProperty('display', 'none', 'important');
    els.pdfButton.disabled = pdfBusy || !active || typeof window.PlaylabReportEngine?.triggerPdfSave !== 'function';
    els.pdfButton.classList.toggle('is-saving', pdfBusy);
    els.pdfButton.setAttribute('aria-busy', String(pdfBusy));
  }

  function setupPdfButton() {
    const topbar = document.querySelector('.shell-topbar-side');
    if (!topbar) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'blockCountReportPdfButton';
    button.className = 'shell-icon-btn shell-help-btn shell-hidden';
    button.setAttribute('aria-label', '리포트 PDF 저장');
    button.setAttribute('title', '리포트 PDF 저장');
    button.setAttribute('data-pdf-exclude', '');
    button.innerHTML = '<svg class="playlab-report-save-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.75h9.5l4.75 4.75v11A1.5 1.5 0 0 1 18.75 21h-13.5A1.5 1.5 0 0 1 3.75 19.5v-14A1.5 1.5 0 0 1 5.25 4h.75z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 3.75v5h7v-5M8 16.25h8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
    topbar.insertBefore(button, els.helpButton);
    els.pdfButton = button;
    button.addEventListener('click', async () => {
      if (button.disabled || pdfBusy) return;
      const root = els.professionalReport.querySelector('.block-count-dual-report');
      const mode = root?.dataset.reportMode === 'teacher' ? 'teacher' : 'guardian';
      const generation = state.runGeneration;
      const startedAt = state.startedAtMs;
      const revision = state.reportRevision;
      const validate = () => Boolean(root && root.isConnected && els.resultView.classList.contains('is-active')
        && els.professionalReport.querySelector('.block-count-dual-report') === root
        && state.runGeneration === generation && state.startedAtMs === startedAt && state.reportRevision === revision
        && root.dataset.reportMode === mode
        && Array.from(root.querySelectorAll('[data-result-report-panel]')).every(panel => panel.hidden === (panel.dataset.resultReportPanel !== mode)));
      if (!validate()) return;
      pdfBusy = true; syncPdfButton();
      try {
        await window.PlaylabReportEngine.triggerPdfSave({ root, reportMode: mode, title: `${LAB_TITLE} · ${els.resultTitle.textContent}`, validateBeforeDownload: validate });
      } catch (error) {
        if (validate()) window.alert(error?.message || 'PDF 저장에 실패했습니다. 다시 시도해 주세요.');
      } finally {
        pdfBusy = false; syncPdfButton();
      }
    });
    syncPdfButton();
  }

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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function average(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function percentile(values, ratio) {
    const sorted = values.map(Number).filter(Number.isFinite).sort((left, right) => left - right);
    if (!sorted.length) return 0;
    const index = (sorted.length - 1) * ratio;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + ((sorted[upper] - sorted[lower]) * (index - lower));
  }

  function median(values) {
    return percentile(values, 0.5);
  }

  function setScreen(name) {
    state.reportRevision += 1;
    ['stageView', 'gameView', 'resultView'].forEach((id) => {
      els[id].classList.toggle('is-active', id === `${name}View`);
    });
    const inStage = name === 'stage';
    els.stageSelectButton.classList.toggle('shell-hidden', inStage);
    els.shellStageLabel.classList.toggle('shell-hidden', inStage);
    if (!inStage && state.stage) els.shellStageLabel.textContent = `${state.stage.index}단계`;
    syncPdfButton();
    window.scrollTo(0, 0);
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="block-count-stage-card" data-stage-index="${stage.index}" style="--stage-color:${stage.color}">
        <span class="block-count-stage-badge">${stage.index}단계 · ${stage.questions}문제</span>
        <strong>${escapeHtml(stage.label)}</strong>
        <p>${escapeHtml(state.age.label)} 기준 · ${escapeHtml(stage.focus)}</p>
      </button>
    `).join('');
  }

  function renderAgeButtons() {
    document.querySelectorAll('[data-age-key]').forEach((button) => {
      const active = button.dataset.ageKey === state.age.key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function getAgeAdjustedStage(stage) {
    const age = state.age || AGE_GROUPS.lower;
    const min = clamp(stage.min + age.countShift, 3, age.maxCap);
    const max = clamp(stage.max + age.countShift, min, age.maxCap);
    const hiddenMin = stage.index <= 2 ? 0 : Math.max(0, Math.round((stage.hiddenMin || 0) + age.countShift * 0.2));
    const hiddenMax = stage.index <= 2 ? 0 : clamp(Math.round((stage.hiddenMax || 0) + age.countShift * 0.35), hiddenMin, Math.max(hiddenMin, Math.min(5, max - 3)));
    return Object.assign({}, stage, {
      min,
      max,
      hiddenMin,
      hiddenMax,
      ageKey: age.key,
      ageLabel: age.label,
      ageRange: age.range
    });
  }

  function createClinicallyGradedBlocks(stage, questionOrder, profile) {
    const questionProfile = profile || createQuestionProfile(stage, questionOrder);
    const targetCount = questionProfile.targetCount;
    const blocks = buildLayoutBlocks(stage, targetCount, questionOrder, questionProfile.variant);
    const hiddenCount = getHiddenCount(stage, questionOrder, targetCount, questionProfile.variant);
    markHiddenBlocks(blocks, hiddenCount, stage.hiddenStrategy);
    applySpatialTransform(blocks, questionProfile.variant);
    const palette = getStagePalette(stage);
    return normalizeBlocks(blocks.slice(0, targetCount)).map((block, index) => Object.assign({}, block, {
      id: `q${questionOrder}-b${index}`,
      color: palette[(index + questionOrder) % palette.length]
    }));
  }

  function getStagePalette(stage) {
    return STAGE_BLOCK_PALETTES[(stage.index - 1) % STAGE_BLOCK_PALETTES.length] || IQ_BLOCK_COLORS;
  }

  function createBlocks(stage, questionOrder, profile) {
    return createClinicallyGradedBlocks(stage, questionOrder, profile);
  }

  function createQuestionProfile(stage, questionOrder) {
    const span = Math.max(1, stage.max - stage.min + 1);
    return {
      targetCount: stage.min + ((questionOrder - 1) % span),
      variant: questionOrder - 1
    };
  }

  function buildQuestionProfiles(stage) {
    const variantOffset = randomInt(0, 999);
    const profiles = [];
    const usedShapeFamilies = new Set();
    const recentSignatures = [];
    let guard = 0;

    while (profiles.length < stage.questions && guard < 360) {
      guard += 1;
      const targetCount = randomInt(stage.min, stage.max);
      const variant = variantOffset + guard * 7 + profiles.length * 13;
      const family = getShapeFamily(stage, variant);
      const signature = getPreviewSignature(stage, targetCount, variant);
      const isRepeatedFamily = usedShapeFamilies.has(family) && usedShapeFamilies.size < Math.min(stage.questions, 6);
      const isTooSimilar = recentSignatures.some((item) => getSignatureSimilarity(item, signature) > 0.68);
      const isAdjacentCountRepeat = profiles.length > 0 && profiles[profiles.length - 1].targetCount === targetCount;
      if (isRepeatedFamily || isTooSimilar || isAdjacentCountRepeat) continue;
      profiles.push({ targetCount, variant, family, signature });
      usedShapeFamilies.add(family);
      recentSignatures.push(signature);
      if (recentSignatures.length > 4) recentSignatures.shift();
    }

    while (profiles.length < stage.questions) {
      const targetCount = stage.min + ((profiles.length * 2 + randomInt(0, stage.max - stage.min)) % (stage.max - stage.min + 1));
      const variant = variantOffset + 1000 + profiles.length * 31;
      profiles.push({
        targetCount,
        variant,
        family: getShapeFamily(stage, variant),
        signature: getPreviewSignature(stage, targetCount, variant)
      });
    }

    return orderProfilesByDiversity(profiles);
  }

  function orderProfilesByDiversity(profiles) {
    const remaining = profiles.slice();
    const ordered = [];
    if (remaining.length) ordered.push(remaining.shift());
    while (remaining.length) {
      const previous = ordered[ordered.length - 1];
      let bestIndex = 0;
      let bestScore = Infinity;
      remaining.forEach((profile, index) => {
        const shapeScore = getSignatureSimilarity(previous.signature, profile.signature);
        const countPenalty = previous.targetCount === profile.targetCount ? 2 : 0;
        const score = shapeScore + countPenalty;
        if (score < bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      });
      ordered.push(remaining.splice(bestIndex, 1)[0]);
    }
    return ordered;
  }

  function getShapeFamily(stage, variant) {
    return `${stage.layoutMode}-${Math.abs(Number(variant || 0)) % 12}`;
  }

  function getPreviewSignature(stage, targetCount, variant) {
    const preview = buildLayoutBlocks(stage, targetCount, 0, variant);
    applySpatialTransform(preview, variant);
    return preview.map((block) => `${block.x}:${block.y}:${block.z}`)
      .sort()
      .join('|');
  }

  function getSignatureSimilarity(signatureA, signatureB) {
    const a = new Set(String(signatureA).split('|').filter(Boolean));
    const b = new Set(String(signatureB).split('|').filter(Boolean));
    const intersection = Array.from(a).filter((item) => b.has(item)).length;
    const union = new Set([...a, ...b]).size || 1;
    return intersection / union;
  }

  function pushUnique(blocks, seen, block) {
    const key = `${block.x},${block.y},${block.z}`;
    if (seen.has(key)) return false;
    if (block.y > 0 && !seen.has(`${block.x},${block.y - 1},${block.z}`)) return false;
    seen.add(key);
    blocks.push(block);
    return true;
  }

  function addReadableTemplate(add, targetCount, coords) {
    coords.slice(0, targetCount).forEach(([x, y, z]) => add(x, y, z));
  }

  function buildLayoutBlocks(stage, targetCount, questionOrder, variant) {
    const blocks = [];
    const seen = new Set();
    const add = (x, y, z) => pushUnique(blocks, seen, { x, y, z });
    const frontZ = 0;
    const rearZ = 1;
    const pattern = Math.abs(Number(variant || 0)) % 12;

    if (stage.layoutMode === 'single-layer-basic') {
      const templates = [
        [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]],
        [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1]],
        [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0]],
        [[0, 0], [1, 0], [1, 1], [1, 2], [0, 2]],
        [[0, 1], [1, 0], [1, 1], [2, 1], [1, 2]],
        [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1]],
        [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]
      ];
      templates[pattern % templates.length].slice(0, targetCount).forEach(([x, z]) => add(x, 0, z));
      return blocks;
    }

    if (stage.layoutMode === 'simple-duplex') {
      const templates = [
        [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0], [3, 0, 0], [2, 1, 0], [4, 0, 0], [3, 1, 0]],
        [[0, 0, 0], [1, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 1], [1, 1, 1], [2, 0, 1], [2, 1, 1]],
        [[0, 0, 0], [1, 0, 0], [2, 0, 0], [2, 1, 0], [2, 0, 1], [1, 0, 1], [1, 1, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 0, 1], [1, 0, 1], [2, 0, 1], [1, 1, 1], [2, 1, 1], [2, 0, 0], [3, 0, 1]],
        [[0, 0, 1], [1, 0, 1], [2, 0, 1], [1, 1, 1], [0, 0, 0], [2, 0, 0], [0, 1, 0], [2, 1, 0]],
        [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [0, 0, 1], [0, 1, 1], [1, 0, 1], [2, 0, 1]],
        [[1, 0, 0], [1, 0, 1], [1, 0, 2], [1, 1, 1], [0, 0, 1], [2, 0, 1], [0, 1, 1], [2, 1, 1]],
        [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [2, 1, 0], [1, 0, 1], [1, 1, 1], [3, 0, 1]]
      ];
      templates[pattern % templates.length].slice(0, targetCount).forEach(([x, y, z]) => add(x, y, z));
      return blocks;
    }

    if (stage.layoutMode === 'support-inference') {
      const templates = [
        [[0, 0, 0], [1, 0, 0], [2, 0, 0], [2, 0, 1], [2, 1, 1], [3, 0, 1], [3, 1, 1]],
        [[0, 0, 0], [0, 0, 1], [1, 0, 1], [2, 0, 1], [2, 1, 1], [1, 0, 0], [1, 1, 0]],
        [[0, 0, 1], [1, 0, 1], [2, 0, 1], [1, 1, 1], [0, 0, 0], [2, 0, 0], [2, 1, 0]],
        [[0, 0, 0], [1, 0, 0], [1, 0, 1], [1, 1, 1], [2, 0, 1], [3, 0, 1], [3, 1, 1]],
        [[0, 0, 0], [0, 0, 1], [0, 1, 1], [1, 0, 1], [2, 0, 1], [2, 1, 1], [2, 0, 0]],
        [[1, 0, 0], [1, 0, 1], [1, 1, 1], [0, 0, 1], [2, 0, 1], [2, 1, 1], [3, 0, 1]]
      ];
      templates[pattern % templates.length].slice(0, targetCount).forEach(([x, y, z]) => add(x, y, z));
      return blocks;
    }

    if (stage.layoutMode === 'basic-rotation') {
      const templates = [
        [[0, 0, 0], [1, 0, 0], [2, 0, 0], [2, 1, 0], [0, 0, 1], [1, 0, 1], [2, 0, 1], [2, 1, 1], [3, 0, 1], [3, 1, 1]],
        [[0, 0, 0], [0, 1, 0], [1, 0, 0], [2, 0, 0], [2, 1, 0], [0, 0, 1], [1, 0, 1], [2, 0, 1], [0, 1, 1], [2, 1, 1]],
        [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [3, 0, 0], [3, 1, 0], [1, 0, 1], [2, 0, 1], [2, 1, 1], [3, 0, 1]],
        [[0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1], [0, 1, 1], [3, 1, 1], [1, 0, 0], [2, 0, 0], [1, 1, 0], [2, 1, 0]],
        [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [2, 0, 1], [0, 1, 1], [2, 1, 1], [1, 0, 2], [1, 1, 2], [2, 0, 2]]
      ];
      addReadableTemplate(add, targetCount, templates[pattern % templates.length]);
      return blocks;
    }

    if (stage.layoutMode === 'complex-hidden') {
      const templates = [
        [[0,0,0],[1,0,0],[2,0,0],[0,0,1],[1,0,1],[2,0,1],[0,1,0],[1,1,0],[2,1,1],[2,2,1],[3,0,1],[3,1,1],[1,0,2],[2,0,2],[2,1,2]],
        [[0,0,0],[0,1,0],[1,0,0],[2,0,0],[2,1,0],[3,0,0],[0,0,1],[1,0,1],[2,0,1],[3,0,1],[3,1,1],[1,0,2],[1,1,2],[2,0,2],[3,0,2]],
        [[0,0,1],[1,0,1],[2,0,1],[3,0,1],[0,1,1],[3,1,1],[0,0,0],[1,0,0],[1,1,0],[2,0,0],[2,1,0],[1,0,2],[2,0,2],[2,1,2],[3,0,2]],
        [[1,0,0],[1,1,0],[2,0,0],[2,1,0],[0,0,1],[1,0,1],[2,0,1],[3,0,1],[0,1,1],[3,1,1],[0,0,2],[1,0,2],[2,0,2],[2,1,2],[3,0,2]],
        [[0,0,0],[1,0,0],[2,0,0],[3,0,0],[3,1,0],[0,0,1],[0,1,1],[1,0,1],[2,0,1],[3,0,1],[1,0,2],[1,1,2],[2,0,2],[3,0,2],[3,1,2]]
      ];
      addReadableTemplate(add, targetCount, templates[pattern % templates.length]);
      return blocks;
    }

    if (stage.layoutMode === 'mental-rotation') {
      const templates = [
        [[0,0,0],[1,0,0],[2,0,0],[3,0,0],[0,1,0],[3,1,0],[0,0,1],[1,0,1],[2,0,1],[3,0,1],[1,1,1],[2,1,1],[1,0,2],[2,0,2],[3,0,2],[3,1,2],[2,2,1],[3,2,2]],
        [[0,0,0],[0,1,0],[1,0,0],[2,0,0],[2,1,0],[3,0,0],[0,0,1],[1,0,1],[2,0,1],[3,0,1],[3,1,1],[0,0,2],[1,0,2],[1,1,2],[2,0,2],[3,0,2],[1,2,2],[3,2,1]],
        [[0,0,1],[1,0,1],[2,0,1],[3,0,1],[0,1,1],[1,1,1],[3,1,1],[0,0,0],[1,0,0],[1,1,0],[2,0,0],[3,0,0],[0,0,2],[1,0,2],[2,0,2],[2,1,2],[3,0,2],[0,2,1]],
        [[1,0,0],[2,0,0],[3,0,0],[3,1,0],[0,0,1],[1,0,1],[2,0,1],[3,0,1],[0,1,1],[2,1,1],[0,0,2],[1,0,2],[2,0,2],[3,0,2],[1,1,2],[2,1,2],[1,2,2],[3,2,0]]
      ];
      addReadableTemplate(add, targetCount, templates[pattern % templates.length]);
      return blocks;
    }

    if (stage.layoutMode === 'void-structure') {
      const templates = [
        [[0,0,0],[1,0,0],[2,0,0],[3,0,0],[0,0,1],[3,0,1],[0,0,2],[3,0,2],[0,1,0],[3,1,0],[0,1,2],[3,1,2],[0,2,0],[3,2,2],[1,0,2],[2,0,2],[1,1,2],[2,1,2],[0,2,1],[3,2,1]],
        [[0,0,0],[0,0,1],[0,0,2],[1,0,2],[2,0,2],[3,0,2],[3,0,1],[3,0,0],[0,1,0],[0,1,1],[3,1,1],[3,1,2],[1,0,0],[2,0,0],[1,1,0],[2,1,2],[0,2,0],[3,2,2],[1,2,0],[2,2,2]],
        [[0,0,0],[1,0,0],[2,0,0],[3,0,0],[1,0,1],[2,0,1],[0,0,2],[1,0,2],[2,0,2],[3,0,2],[0,1,0],[3,1,0],[1,1,1],[2,1,1],[0,1,2],[3,1,2],[0,2,0],[3,2,2],[1,2,1],[2,2,1]],
        [[0,0,1],[1,0,1],[2,0,1],[3,0,1],[0,0,0],[0,1,0],[3,0,0],[3,1,0],[0,0,2],[0,1,2],[3,0,2],[3,1,2],[1,0,0],[2,0,0],[1,1,0],[2,1,2],[0,2,1],[3,2,1],[1,2,0],[2,2,2]]
      ];
      addReadableTemplate(add, targetCount, templates[pattern % templates.length]);
      return blocks;
    }

    const templates = [
      [[0,0,0],[1,0,0],[2,0,0],[3,0,0],[0,0,1],[1,0,1],[2,0,1],[3,0,1],[0,1,0],[1,1,0],[2,1,1],[3,1,1],[0,2,0],[3,2,1],[1,0,2],[2,0,2],[3,0,2],[1,1,2],[2,1,2],[3,1,2],[1,2,2],[2,2,2],[3,2,2],[3,3,2]],
      [[0,0,0],[0,1,0],[1,0,0],[2,0,0],[2,1,0],[3,0,0],[0,0,1],[1,0,1],[2,0,1],[3,0,1],[3,1,1],[0,0,2],[1,0,2],[2,0,2],[3,0,2],[1,1,2],[2,1,2],[1,2,2],[3,2,1],[0,2,0],[2,2,0],[3,2,2],[1,3,2],[3,3,1]],
      [[0,0,1],[1,0,1],[2,0,1],[3,0,1],[4,0,1],[0,1,1],[4,1,1],[0,0,0],[1,0,0],[1,1,0],[2,0,0],[3,0,0],[3,1,0],[0,0,2],[1,0,2],[2,0,2],[3,0,2],[4,0,2],[2,1,2],[4,1,2],[1,2,0],[3,2,0],[2,2,2],[4,2,2]],
      [[1,0,0],[2,0,0],[3,0,0],[3,1,0],[0,0,1],[1,0,1],[2,0,1],[3,0,1],[0,1,1],[1,1,1],[0,0,2],[1,0,2],[2,0,2],[3,0,2],[1,1,2],[2,1,2],[3,1,2],[0,0,3],[1,0,3],[2,0,3],[2,1,3],[0,2,1],[3,2,0],[2,2,3]]
    ];
    addReadableTemplate(add, targetCount, templates[pattern % templates.length]);
    return blocks;
  }

  function buildGridBase(add, targetCount, width, depth) {
    for (let z = 0; z < depth && add && z < depth; z += 1) {
      for (let x = 0; x < width; x += 1) {
        add(x, 0, z);
      }
    }
  }

  function buildGridBasePattern(add, targetCount, width, depth, pattern) {
    const coords = [];
    for (let z = 0; z < depth; z += 1) {
      for (let x = 0; x < width; x += 1) coords.push([x, 0, z]);
    }
    let added = 0;
    sortCoordsByPattern(coords, pattern).forEach(([x, y, z]) => {
      if (added < targetCount && add(x, y, z)) added += 1;
    });
  }

  function sortCoordsByPattern(coords, pattern) {
    const copy = coords.slice();
    const mode = Math.abs(Number(pattern || 0)) % 6;
    return copy.sort((a, b) => {
      const [ax, , az] = a;
      const [bx, , bz] = b;
      if (mode === 0) return (az - bz) || (ax - bx);
      if (mode === 1) return (ax - bx) || (az - bz);
      if (mode === 2) return (bz - az) || (bx - ax);
      if (mode === 3) return (bx - ax) || (az - bz);
      if (mode === 4) return ((ax + az) - (bx + bz)) || (az - bz);
      return ((Math.abs(ax - 2) + Math.abs(az - 2)) - (Math.abs(bx - 2) + Math.abs(bz - 2))) || (ax - bx);
    });
  }

  function applySpatialTransform(blocks, variant) {
    const mode = Math.abs(Number(variant || 0)) % 8;
    blocks.forEach((block) => {
      const x = block.x;
      const z = block.z;
      if (mode === 1) {
        block.x = z;
        block.z = x;
      } else if (mode === 2) {
        block.x = -x;
        block.z = z;
      } else if (mode === 3) {
        block.x = x;
        block.z = -z;
      } else if (mode === 4) {
        block.x = -z;
        block.z = x;
      } else if (mode === 5) {
        block.x = z;
        block.z = -x;
      } else if (mode === 6) {
        block.x = -x;
        block.z = -z;
      } else if (mode === 7) {
        block.x = -z;
        block.z = -x;
      }
    });
  }

  function getHiddenCount(stage, questionOrder, targetCount, variant) {
    const min = Number(stage.hiddenMin || 0);
    const max = Number(stage.hiddenMax || min);
    if (!max) return 0;
    return Math.min(targetCount - 1, min + (Math.abs(Number(variant || questionOrder)) % (max - min + 1)));
  }

  function markHiddenBlocks(blocks, hiddenCount, strategy) {
    if (!hiddenCount) return;
    const candidates = blocks
      .map((block, index) => ({ block, index }))
      .filter(({ block }) => {
        if (strategy === 'support') return block.y === 0 && block.z > 0;
        if (strategy === 'void') return block.z > 0 || block.x > 1;
        return block.y === 0 && (block.z > 0 || block.x > 1);
      })
      .sort((a, b) => (b.block.z - a.block.z) || (b.block.y - a.block.y) || (b.block.x - a.block.x));
    candidates.slice(0, hiddenCount).forEach(({ block }) => {
      block.hidden = true;
    });
  }

  function normalizeBlocks(blocks) {
    const minX = Math.min(...blocks.map((block) => block.x));
    const minZ = Math.min(...blocks.map((block) => block.z));
    const maxX = Math.max(...blocks.map((block) => block.x));
    const maxZ = Math.max(...blocks.map((block) => block.z));
    const offsetX = -((minX + maxX) / 2);
    const offsetZ = -((minZ + maxZ) / 2);
    return blocks.map((block) => Object.assign({}, block, {
      x: block.x + offsetX,
      y: block.y,
      z: block.z + offsetZ
    }));
  }

  function makeChoices(answer, stage, visibleOnlyCount) {
    const values = new Set([answer]);
    if (visibleOnlyCount !== answer) values.add(visibleOnlyCount);
    const offsets = shuffle([-4, -3, -2, -1, 1, 2, 3, 4, 5, -5]);
    offsets.forEach((offset) => {
      if (values.size >= choiceCount) return;
      const value = answer + offset;
      if (value >= Math.max(1, stage.min - 3) && value <= stage.max + 5) values.add(value);
    });
    while (values.size < choiceCount) values.add(Math.max(1, answer + randomInt(-6, 6)));
    return shuffle(Array.from(values)).slice(0, choiceCount);
  }

  function buildQuestions(stage) {
    const profiles = buildQuestionProfiles(stage);
    return profiles.map((profile, index) => {
      const blocks = createBlocks(stage, index + 1, profile);
      return {
        id: `${stage.index}-${index + 1}`,
        blocks,
        answer: blocks.length,
        visibleOnlyCount: blocks.filter((block) => !block.hidden).length,
        hiddenCount: blocks.filter((block) => block.hidden).length,
        guidedHiddenVisible: stage.guidedHiddenVisible === true,
        stageIndex: stage.index,
        choices: makeChoices(blocks.length, stage, blocks.filter((block) => !block.hidden).length)
      };
    });
  }

  function getCubeSize(blockCount) {
    if (blockCount >= 20) return 42;
    if (blockCount >= 16) return 48;
    if (blockCount >= 13) return 52;
    if (blockCount >= 9) return 60;
    return 74;
  }

  function getGroundOffset(question, cubeSize) {
    const maxLayer = Math.max(...question.blocks.map((block) => block.y));
    const depthSpan = Math.max(...question.blocks.map((block) => block.z)) - Math.min(...question.blocks.map((block) => block.z));
    return Math.round(cubeSize * (0.74 + maxLayer * 0.2 + depthSpan * 0.03));
  }

  function renderQuestion() {
    const question = state.questions[state.questionIndex];
    state.answered = false;
    state.questionStartedAtMs = Date.now();
    state.rotation = { x: -32, y: 42 };

    els.stageChip.textContent = `${state.stage.index}단계`;
    els.questionChip.textContent = `문제 ${state.questionIndex + 1} / ${state.stage.questions}`;
    els.gameKicker.textContent = 'FIXED VIEW COUNT';
    els.gameTitle.textContent = '블록을 나누어 세고 전체 개수를 골라요.';
    els.sceneHint.textContent = `${state.age.label} · 고정 시점 · 앞줄-뒷줄-위층으로 나누어 세기`;
    els.actualCount.textContent = '';
    els.actualCount.classList.remove('is-visible');
    els.feedbackText.textContent = '';
    els.nextButton.hidden = true;
    renderCubes(question, false);
    renderChoices(question);
  }

  function getSolvedLayout(blocks, cubeSize) {
    const count = blocks.length;
    let rows = 1;
    if (count > 20) rows = 3;
    else if (count > 10) rows = 2;
    const perRow = Math.ceil(count / rows);
    const spacing = cubeSize * 1.02;
    return blocks.map((block, index) => {
      const row = Math.floor(index / perRow);
      const rowStart = row * perRow;
      const rowCount = Math.min(perRow, count - rowStart);
      const col = index - rowStart;
      return {
        x: (col - (rowCount - 1) / 2) * spacing,
        y: row * spacing * 0.92,
        z: row * 8,
        row
      };
    });
  }

  function renderCubes(question, scattered) {
    const cubeSize = getCubeSize(question.blocks.length);
    const groundY = getGroundOffset(question, cubeSize);
    const solvedLayout = getSolvedLayout(question.blocks, cubeSize);
    els.cubeScene.style.setProperty('--cube-size', `${cubeSize}px`);
    els.cubeScene.style.setProperty('--ground-y', `${groundY}px`);
    els.cubeScene.style.setProperty('--rotate-x', `${state.rotation.x}deg`);
    els.cubeScene.style.setProperty('--rotate-y', `${state.rotation.y}deg`);
    const displayBlocks = question.blocks;
    els.cubeScene.innerHTML = displayBlocks.map((block, index) => {
      const originalIndex = question.blocks.indexOf(block);
      const solved = solvedLayout[originalIndex];
      const scatterX = Math.round(solved.x - block.x * cubeSize);
      const scatterY = Math.round(solved.y + block.y * cubeSize);
      const scatterZ = Math.round(solved.z - block.z * cubeSize);
      const delayMs = originalIndex * 92;
      return `
        <div class="block-count-cube${scattered ? ' is-scattered' : ''}${scattered && block.hidden ? ' is-hidden-revealed' : ''}${block.hidden && question.guidedHiddenVisible && !scattered ? ' is-guided-support' : ''}" style="--x:${block.x};--y:${block.y};--z:${block.z};--cube-color:${block.color};--scatter-x:${scatterX}px;--scatter-y:${scatterY}px;--scatter-z:${scatterZ}px;--scatter-rx:0deg;--scatter-ry:0deg;--fall-delay:${delayMs}ms;--solved-row:${solved.row}">
          <span class="block-count-cube-face front"></span>
          <span class="block-count-cube-face back"></span>
          <span class="block-count-cube-face right"></span>
          <span class="block-count-cube-face left"></span>
          <span class="block-count-cube-face top"></span>
          <span class="block-count-cube-face bottom"></span>
        </div>
      `;
    }).join('');
  }

  function renderChoices(question) {
    els.choiceGrid.innerHTML = question.choices.map((choice) => `
      <button type="button" class="block-count-choice" data-choice="${choice}">${choice}</button>
    `).join('');
  }

  function scatterCubes() {
    applySolvedCamera();
    renderCubes(state.questions[state.questionIndex], true);
  }

  function applySolvedCamera() {
    state.rotation = { x: 0, y: 0 };
    els.cubeScene.style.setProperty('--rotate-x', `${state.rotation.x}deg`);
    els.cubeScene.style.setProperty('--rotate-y', `${state.rotation.y}deg`);
  }

  function answerQuestion(choice) {
    if (state.answered) return;
    const question = state.questions[state.questionIndex];
    const selected = Number(choice);
    const correct = selected === question.answer;
    const responseMs = Date.now() - state.questionStartedAtMs;
    state.answered = true;
    state.metrics.attempts += 1;
    state.metrics.responseTimes.push(responseMs);
    state.metrics.answerDistances.push(Math.abs(selected - question.answer));
    if (correct) state.metrics.correct += 1;
    else state.metrics.wrong += 1;

    els.choiceGrid.querySelectorAll('.block-count-choice').forEach((button) => {
      const value = Number(button.dataset.choice);
      button.disabled = true;
      button.classList.toggle('is-correct', value === question.answer);
      button.classList.toggle('is-wrong', value === selected && !correct);
    });

    scatterCubes();
    els.actualCount.textContent = `실제 ${question.answer}개`;
    els.actualCount.classList.add('is-visible');
    els.feedbackText.textContent = '';
    els.nextButton.hidden = false;
    els.nextButton.textContent = state.questionIndex + 1 >= state.stage.questions ? '결과 보기' : '다음 문제';
  }

  function nextQuestion() {
    if (!state.answered) return;
    if (state.questionIndex + 1 >= state.stage.questions) {
      showResult();
      return;
    }
    state.questionIndex += 1;
    renderQuestion();
  }

  function startStage(stageIndex) {
    state.runGeneration += 1;
    state.sessionId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `block-count-${Date.now()}-${Math.random().toString(36).slice(2)}-${state.runGeneration}`;
    const baseStage = STAGES.find((item) => item.index === stageIndex) || STAGES[0];
    const stage = getAgeAdjustedStage(baseStage);
    state.stage = stage;
    state.questions = buildQuestions(stage);
    state.questionIndex = 0;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    state.metrics = { correct: 0, wrong: 0, attempts: 0, responseTimes: [], answerDistances: [], supportInferences: 0 };
    setScreen('game');
    renderQuestion();
  }

  function showResult() {
    saveResult();
    const total = state.stage.questions;
    const accuracy = Math.round((state.metrics.correct / Math.max(total, 1)) * 100);
    const responseSeconds = state.metrics.responseTimes.map((value) => Number(value || 0) / 1000).filter((value) => value > 0);
    const medianResponse = median(responseSeconds);
    const responseIqr = Math.max(0, percentile(responseSeconds, 0.75) - percentile(responseSeconds, 0.25));
    const avgDistance = average(state.metrics.answerDistances);
    els.resultTitle.textContent = `${state.stage.index}단계 완료`;
    els.resultSummary.textContent = `${state.age.label} 기준 ${state.stage.label}에서 ${total}문제 중 ${state.metrics.correct}문제를 맞혔어요.`;
    els.resultStats.innerHTML = [
      { value: `${accuracy}%`, label: '정답률' },
      { value: `${state.metrics.correct}/${total}`, label: '정답 수' },
      { value: `${medianResponse.toFixed(1)}초`, label: '반응 중앙값' },
      { value: avgDistance.toFixed(1), label: '평균 오차' }
    ].map((stat) => `
      <div class="block-count-stat">
        <strong>${escapeHtml(stat.value)}</strong>
        <span>${escapeHtml(stat.label)}</span>
      </div>
    `).join('');
    renderProfessionalReport(accuracy, medianResponse, responseIqr, avgDistance);
    setScreen('result');
  }

  function buildClinicalInterpretation(accuracy, medianResponse, responseIqr, avgDistance) {
    const hiddenTotal = state.questions.reduce((sum, question) => sum + Number(question.hiddenCount || 0), 0);
    const countError = Number(avgDistance || 0);
    const supportLoad = hiddenTotal > 0 ? '숨은 받침 또는 뒤쪽 블록을 함께 고려해야 하는 문항이 포함되었습니다.' : '모든 블록이 비교적 직접적으로 보이는 조건에서 수행했습니다.';
    const levelFit = '같은 블록 수·층 수·보기 수를 유지한 회기를 다시 관찰합니다. 조정이 필요하면 선생님이 한 조건씩 변경하고 도움 수준을 함께 기록합니다.';
    const guardianStrength = `${state.stage.questions}문항 중 ${state.metrics.correct}문항에서 알맞은 수를 선택했습니다.`;
    const supportCondition = `${supportLoad} 세는 순서나 다시 살펴본 행동은 현재 기록만으로 확인할 수 없어 선생님 관찰이 필요합니다.`;
    const homeResponse = '가정에서는 익숙한 물건을 함께 세어 보며 세는 순서를 편하게 관찰해 주세요. 어려워하면 도움을 주고, 어떤 도움이 있었는지 선생님께 알려 주세요.';
    const guardianSummary = `${guardianStrength} ${supportCondition}`;
    const teacherReviewNote = `이번 회기의 관찰값은 정확도 ${accuracy}%(${state.metrics.correct}/${state.stage.questions}), 수량 절대 오차 평균 ${countError.toFixed(1)}개, 실제 선택 응답 중앙값 ${medianResponse.toFixed(1)}초, 반응시간 사분위 범위 ${responseIqr.toFixed(1)}초입니다. 반응시간은 정오답을 포함한 실제 선택 표본입니다. 과제 설정은 ${state.age.label} ${state.stage.label}이며 연령 규준이 아닙니다.`;
    return {
      hiddenTotal,
      guardianSummary,
      guardianStrength,
      supportCondition,
      homeResponse,
      teacherReviewNote,
      actionPlanSummary: levelFit,
      supportLoad,
      levelFit,
      limitation: '하하랩 자체 과제의 단일 회기 결과로, 표준점수나 진단 기준이 아닙니다. 조건이 확인된 기록끼리 비교하며, 3회 기준은 내부 관찰 기준으로 임상적 변화 판정 기준이 아닙니다.'
    };
  }

  function buildReportInput(accuracy, medianResponse, responseIqr, avgDistance) {
    const interpretation = buildClinicalInterpretation(accuracy, medianResponse, responseIqr, avgDistance);
    return {
      title: LAB_TITLE,
      reportType: REPORT_TYPE,
      reportScope: REPORT_SCOPE,
      labKind: REPORT_SCOPE,
      score: accuracy,
      scoreKind: 'task-accuracy-percent',
      isStandardized: false,
      accuracy,
      accuracyScore: accuracy,
      correctCount: state.metrics.correct,
      wrongCount: state.metrics.wrong,
      totalQuestions: state.stage.questions,
      medianResponseSeconds: Number(medianResponse.toFixed(2)),
      responseIqrSeconds: Number(responseIqr.toFixed(2)),
      averageAnswerDistance: Number(avgDistance.toFixed(2)),
      durationMinutes: Math.max(1, Math.round((Date.now() - state.startedAtMs) / 60000)),
      stageTitle: `${state.age.label} ${state.stage.label}`,
      focusLabel: '시공간 구성과 수량 보존',
      clinicalTargets: ['시각 탐색', '공간 구성', '부분-전체 통합', '수량 보존', '숨은 받침 추론'],
      axes: [
        { id: 'visualSearch', label: '과제 정확도', score: accuracy, observational: true },
        { id: 'spatialConstruction', label: '수량 오차 역점수', score: clamp(Math.round(100 - avgDistance * 12), 0, 100), observational: true },
        { id: 'countingAccuracy', label: '수량 보존', score: accuracy },
        { id: 'selfMonitoring', label: '자기점검', score: clamp(Math.round(100 - avgDistance * 12), 0, 100) }
      ],
      briefOpinion: interpretation.levelFit,
      longOpinion: `이번 회기에서는 ${state.stage.label} 조건에서 수량 선택이 기록되었습니다. 다만 정확한 반응만으로 시각 탐색, 공간 구성, 수량 개념 중 어느 요소가 강점인지 분리해 단정할 수 없습니다. 다음 동일 조건 회기에서 숨은 블록이 포함된 문항의 오류 위치와 필요한 단서 수준을 함께 비교합니다.`,
      guardianSummary: interpretation.guardianSummary,
      guardianStrength: interpretation.guardianStrength,
      supportCondition: interpretation.supportCondition,
      homeResponse: interpretation.homeResponse,
      teacherReviewNote: interpretation.teacherReviewNote,
      recommendations: [
        { title: '세기 전략', desc: '앞줄, 뒷줄, 위층 순서로 손가락을 짚거나 말로 표시하며 세어 봅니다.' },
        { title: '난이도 조정', desc: interpretation.actionPlanSummary },
        { title: '오답 확인', desc: '정답 공개 후 일렬로 정리된 블록을 다시 세며 빠뜨린 위치를 확인합니다.' }
      ],
      hiddenTotal: interpretation.hiddenTotal,
      limitation: interpretation.limitation,
      disclaimer: '이 리포트는 회기 기반 학습 관찰 자료이며 병원 진단이나 표준화 검사 결과를 대체하지 않습니다.'
    };
  }

  function renderProfessionalReport(accuracy, medianResponse, responseIqr, avgDistance) {
    if (!els.professionalReport) return;
    state.reportRevision += 1;
    const reportInput = buildReportInput(accuracy, medianResponse, responseIqr, avgDistance);
    const observationOpinion = window.PlaylabReportEngine?.buildEvidenceOpinion?.(reportInput);
    els.professionalReport.innerHTML = `
      <section class="block-count-dual-report" data-report-scope="rehab" data-report-mode="guardian">
        <div class="block-count-report-head">
          <div>
            <p>REHABLAB SESSION REPORT</p>
            <h3>${escapeHtml(reportInput.stageTitle)}</h3>
            <span>회기 수행 관찰 리포트 · 기준선 수집 중</span>
          </div>
          <div class="block-count-report-tabs" role="tablist" aria-label="리포트 보기 선택">
            <button type="button" data-result-report-mode="guardian" aria-pressed="true">보호자 공유</button>
            <button type="button" data-result-report-mode="teacher" aria-pressed="false">전문가 분석</button>
          </div>
        </div>
        <div class="block-count-report-panel" data-result-report-panel="guardian" data-report-audience="guardian">
          <div class="block-count-report-section is-summary">
            <span>이번 활동</span>
            <strong>${escapeHtml(state.stage.label)}</strong>
            <p>${escapeHtml(reportInput.guardianSummary)}</p>
          </div>
          <div class="block-count-report-grid">
            <article><span>관찰된 강점</span><p>${escapeHtml(reportInput.guardianStrength)}</p></article>
            <article><span>도움이 필요했던 조건</span><p>${escapeHtml(reportInput.supportCondition)}</p></article>
            <article><span>가정에서의 대응</span><p>${escapeHtml(reportInput.homeResponse)}</p></article>
            <article><span>다음 수업에서 확인</span><p>${escapeHtml(reportInput.recommendations[1].desc)}</p></article>
          </div>
          <p class="block-count-report-note">이번 회기의 학습 수행을 이해하기 쉽게 정리한 내용입니다. 진단이나 치료 효과 판정을 의미하지 않습니다.</p>
        </div>
        <div class="block-count-report-panel" data-result-report-panel="teacher" data-report-audience="teacher" hidden>
          <div class="block-count-metric-table" role="table" aria-label="회기 관찰값">
            <div role="row"><span role="cell">정확도</span><strong role="cell">${accuracy}% (${state.metrics.correct}/${state.stage.questions})</strong></div>
            <div role="row"><span role="cell">실제 선택 응답 중앙값</span><strong role="cell">${medianResponse.toFixed(1)}초</strong></div>
            <div role="row"><span role="cell">반응시간 사분위 범위</span><strong role="cell">${responseIqr.toFixed(1)}초</strong></div>
            <div role="row"><span role="cell">평균 수량 오차</span><strong role="cell">${avgDistance.toFixed(1)}개</strong></div>
          </div>
          <div class="block-count-report-grid is-teacher">
            ${observationOpinion ? window.PlaylabReportEngine.renderOpinionSections(observationOpinion, 'teacher') : `
              <article><span>관찰 사실</span><p>${escapeHtml(reportInput.teacherReviewNote)}</p></article>
              <article><span>해석 후보</span><p>${escapeHtml(reportInput.longOpinion)}</p></article>
              <article><span>수업 조정 후보</span><p>${escapeHtml(reportInput.recommendations[1].desc)}</p></article>
              <article><span>해석 한계</span><p>${escapeHtml(reportInput.limitation)}</p></article>`}
          </div>
        </div>
      </section>
    `;
    els.professionalReport.querySelectorAll('[data-result-report-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.resultReportMode === 'teacher' ? 'teacher' : 'guardian';
        const report = els.professionalReport.querySelector('.block-count-dual-report');
        if (report && report.dataset.reportMode !== mode) state.reportRevision += 1;
        if (report) report.dataset.reportMode = mode;
        els.professionalReport.querySelectorAll('[data-result-report-mode]').forEach((target) => {
          target.setAttribute('aria-pressed', target.dataset.resultReportMode === mode ? 'true' : 'false');
        });
        els.professionalReport.querySelectorAll('[data-result-report-panel]').forEach((panel) => {
          panel.hidden = panel.dataset.resultReportPanel !== mode;
        });
      });
    });
  }

  function saveResult() {
    if (state.savedRunId || !window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function') return;
    const endedAt = Date.now();
    const total = state.stage.questions;
    const accuracy = Math.round((state.metrics.correct / Math.max(total, 1)) * 100);
    const responseSeconds = state.metrics.responseTimes.map((value) => Number(value || 0) / 1000).filter((value) => value > 0);
    const medianResponse = median(responseSeconds);
    const responseIqr = Math.max(0, percentile(responseSeconds, 0.75) - percentile(responseSeconds, 0.25));
    const avgDistance = average(state.metrics.answerDistances);
    const reportInput = buildReportInput(accuracy, medianResponse, responseIqr, avgDistance);
    const durationSeconds = Math.max(1, Math.round((endedAt - state.startedAtMs) / 1000));
    const record = window.HahaLabLearningHarness.recordSession({
      sessionId: state.sessionId,
      labKind: REPORT_SCOPE,
      reportScope: REPORT_SCOPE,
      curriculumKey: CURRICULUM_KEY,
      labTitle: LAB_TITLE,
      stageKey: `${state.age.key}-stage-${state.stage.index}`,
      stageTitle: `${state.age.label} ${state.stage.label}`,
      totalQuestions: total,
      correctCount: state.metrics.correct,
      wrongCount: state.metrics.wrong,
      accuracyScore: accuracy,
      score: reportInput.score,
      durationSeconds,
      startedAtMs: state.startedAtMs,
      completedAt: new Date().toISOString(),
      action: LAB_SESSION_COMPLETION_ACTION,
      reportType: REPORT_TYPE,
      reportInput,
      briefOpinion: reportInput.briefOpinion,
      guardianSummary: reportInput.guardianSummary,
      teacherReviewNote: reportInput.teacherReviewNote,
      actionPlanSummary: reportInput.recommendations[1].desc,
      actionPlanPolicy: 'teacher-review-required',
      reportDisplayModes: {
        guardian: { label: '보호자 공유', summary: reportInput.guardianSummary },
        teacher: { label: '전문가 분석', summary: reportInput.teacherReviewNote }
      },
      overview: reportInput.longOpinion,
      recommendations: reportInput.recommendations,
      cognitiveScore: reportInput.axes.find((axis) => axis.id === 'spatialConstruction')?.score || reportInput.score,
      reactionScore: reportInput.axes.find((axis) => axis.id === 'visualSearch')?.score || reportInput.score,
      focusKey: 'color-block-count-spatial-perception',
      focusLabel: '시공간 구성과 수량 보존',
      details: {
        curriculum_key: CURRICULUM_KEY,
        report_type: REPORT_TYPE,
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        focus: state.stage.focus,
        age_group: state.age.key,
        age_group_label: state.age.label,
        age_range: state.age.range,
        level_index: state.stage.index,
        level_label: state.stage.label,
        fixed_view: true,
        rotation_enabled: false,
        hidden_block_total: reportInput.hiddenTotal,
        medianResponseSeconds: Number(medianResponse.toFixed(2)),
        responseIqrSeconds: Number(responseIqr.toFixed(2)),
        averageAnswerDistance: Number(avgDistance.toFixed(2)),
        report_schema_version: '2026.1',
        report_is_standardized: false,
        report_score_kind: 'task-accuracy-percent',
        report_comparison_key: `${CURRICULUM_KEY}:${state.age.key}:stage-${state.stage.index}:fixed-view`,
        report_guardian_summary: reportInput.guardianSummary,
        report_teacher_review_note: reportInput.teacherReviewNote,
        report_action_plan_summary: reportInput.recommendations[1].desc,
        report_action_plan_policy: 'teacher-review-required',
        report_axes: reportInput.axes,
        clinical_targets: reportInput.clinicalTargets
      },
      metadata: {
        report_scope: REPORT_SCOPE,
        lab_scope: REPORT_SCOPE,
        report_type: REPORT_TYPE,
        report_integrated_score: reportInput.score,
        report_cognitive_score: reportInput.axes.find((axis) => axis.id === 'spatialConstruction')?.score || reportInput.score,
        report_reaction_score: reportInput.axes.find((axis) => axis.id === 'visualSearch')?.score || reportInput.score,
        report_guardian_summary: reportInput.guardianSummary,
        report_teacher_review_note: reportInput.teacherReviewNote,
        report_action_plan_summary: reportInput.recommendations[1].desc,
        report_action_plan_policy: 'teacher-review-required',
        report_display_modes: {
          guardian: { label: '보호자 공유', summary: reportInput.guardianSummary },
          teacher: { label: '전문가 분석', summary: reportInput.teacherReviewNote }
        }
      },
      questionSnapshot: state.questions.map((question, index) => ({
        order: index + 1,
        answer: question.answer,
        blockCount: question.blocks.length,
        hiddenCount: question.hiddenCount,
        choices: question.choices
      }))
    });
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
  }

  function openHelp() {
    els.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    els.helpModal.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
    document.querySelectorAll('[data-age-key]').forEach((button) => {
      button.addEventListener('click', () => {
        state.age = AGE_GROUPS[button.dataset.ageKey] || AGE_GROUPS.lower;
        renderAgeButtons();
        renderStages();
      });
    });
    els.stageGrid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-stage-index]');
      if (!card) return;
      startStage(Number(card.dataset.stageIndex));
    });
    els.choiceGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-choice]');
      if (!button) return;
      answerQuestion(button.dataset.choice);
    });
    els.nextButton.addEventListener('click', nextQuestion);
    els.retryButton.addEventListener('click', () => {
      if (state.stage) startStage(state.stage.index);
    });
    els.otherStageButton.addEventListener('click', () => setScreen('stage'));
    els.stageSelectButton.addEventListener('click', () => setScreen('stage'));
    els.helpButton.addEventListener('click', openHelp);
    els.helpCloseButton.addEventListener('click', closeHelp);
    els.helpModal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeHelp();
    });
  }

  function init() {
    [
      'stageView', 'gameView', 'resultView', 'stageGrid', 'shellStageLabel', 'stageSelectButton',
      'gameKicker', 'gameTitle', 'stageChip', 'questionChip', 'sceneHint', 'sceneViewport',
      'cubeScene', 'actualCount', 'choiceGrid', 'feedbackText', 'nextButton', 'resultTitle',
      'resultSummary', 'resultStats', 'retryButton', 'otherStageButton', 'helpButton',
      'helpModal', 'helpCloseButton', 'professionalReport'
    ].forEach((id) => { els[id] = $(id); });
    setupPdfButton();
    renderAgeButtons();
    renderStages();
    bindEvents();
  }

  window.RehabLabColorBlockCount = {
    AGE_GROUPS,
    STAGES,
    STAGE_BLOCK_PALETTES,
    buildQuestions,
    makeChoices,
    getState: () => state
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
