(function () {
  'use strict';

  const LAB_TITLE = '입체 블록 수량 추론';
  const CURRICULUM_KEY = 'playlab-spatial-block-count';
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

  const STAGES = [
    { index: 1, questions: 8, label: '기초 단층 계수', focus: '2x2 또는 3x3 범위에서 바닥 1층 블록만 세어요.', min: 3, max: 5, layers: 1, layoutMode: 'single-layer-basic', occlusion: 'none', hiddenMin: 0, hiddenMax: 0, hiddenStrategy: 'none', canRotate: true, color: '#18a999' },
    { index: 2, questions: 8, label: '단순 복층 계수', focus: '눈에 보이는 계단형·ㄱ자형 2층 구조에서 높낮이를 분리해 세어요.', min: 4, max: 8, layers: 2, layoutMode: 'simple-duplex', occlusion: 'none', hiddenMin: 0, hiddenMax: 0, hiddenStrategy: 'none', canRotate: true, color: '#0ea5e9' },
    { index: 3, questions: 8, label: '기본 가려진 블록 유추', focus: '상층 블록을 받치는 1층 지지 블록을 보며 수량 관계를 확인해요.', min: 5, max: 7, layers: 2, layoutMode: 'support-inference', occlusion: 'support', hiddenMin: 1, hiddenMax: 1, hiddenStrategy: 'support', guidedHiddenVisible: true, canRotate: true, color: '#8b5cf6' },
    { index: 4, questions: 8, label: '다방향 시점 회전 - 기초', focus: '3x3x2 안에서 비스듬한 구조와 숨은 블록 1-2개를 추론해요.', min: 6, max: 10, layers: 2, layoutMode: 'basic-rotation', occlusion: 'rear', hiddenMin: 1, hiddenMax: 2, hiddenStrategy: 'rear-support', canRotate: true, color: '#f59e0b' },
    { index: 5, questions: 8, label: '복합 가려진 블록', focus: '3층 이상 구조에서 숨은 블록 3개 이상을 누적해 계산해요.', min: 10, max: 15, layers: 3, layoutMode: 'complex-hidden', occlusion: 'rear', hiddenMin: 3, hiddenMax: 5, hiddenStrategy: 'multi-support', canRotate: true, color: '#ef4444' },
    { index: 6, questions: 8, label: '정신적 회전 본격화', focus: '4x4x3 비대칭 구조를 옆면이나 뒷면에서 본다고 가정해요.', min: 12, max: 18, layers: 3, layoutMode: 'mental-rotation', occlusion: 'rear', hiddenMin: 3, hiddenMax: 6, hiddenStrategy: 'side-rear', canRotate: true, color: '#14b8a6' },
    { index: 7, questions: 8, label: '불완전 기둥 및 관통 구조', focus: '비어 있는 내부 공간을 제외하며 터널형 구조를 분석해요.', min: 14, max: 20, layers: 4, layoutMode: 'void-structure', occlusion: 'void', hiddenMin: 4, hiddenMax: 7, hiddenStrategy: 'void', canRotate: true, color: '#6366f1' },
    { index: 8, questions: 8, label: '비정형 복합 공간 회전', focus: '5x5x5 범위의 비대칭 복합 구조를 최상위 난이도로 추론해요.', min: 18, max: 24, layers: 5, layoutMode: 'asymmetric-rotation', occlusion: 'rear', hiddenMin: 5, hiddenMax: 9, hiddenStrategy: 'asymmetric', canRotate: true, color: '#db2777' }
  ];

  const state = {
    stage: null,
    questions: [],
    questionIndex: 0,
    answered: false,
    startedAtMs: 0,
    questionStartedAtMs: 0,
    savedRunId: '',
    sessionId: '',
    rotation: { x: -32, y: 42 },
    drag: null,
    metrics: {
      correct: 0,
      wrong: 0,
      attempts: 0,
      responseTimes: [],
      questionLogs: [],
      answerDistances: [],
      rotations: 0
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

  function setScreen(name) {
    ['stageView', 'gameView', 'resultView'].forEach((id) => {
      els[id].classList.toggle('is-active', id === `${name}View`);
    });
    const inStage = name === 'stage';
    els.stageSelectButton.classList.toggle('shell-hidden', inStage);
    els.shellStageLabel.classList.toggle('shell-hidden', inStage);
    if (!inStage && state.stage) els.shellStageLabel.textContent = `${state.stage.index}단계`;
    window.scrollTo(0, 0);
  }

  function renderStages() {
    els.stageGrid.innerHTML = STAGES.map((stage) => `
      <button type="button" class="block-count-stage-card" data-stage-index="${stage.index}" style="--stage-color:${stage.color}">
        <span class="block-count-stage-badge">${stage.index}단계 · ${stage.questions}문제</span>
        <strong>${escapeHtml(stage.label)}</strong>
        <p>${escapeHtml(stage.focus)} 직접 회전 가능</p>
      </button>
    `).join('');
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
    els.gameKicker.textContent = 'ROTATE AND COUNT';
    els.gameTitle.textContent = '블록을 돌려 보며 전체 개수를 골라요.';
    els.sceneHint.textContent = '드래그하거나 화살표로 돌려 보기';
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
    state.metrics.questionLogs.push({
      itemId: `stage-${state.stage.index}-question-${state.questionIndex + 1}`,
      order: state.questionIndex + 1,
      response: selected,
      expectedResponse: question.answer,
      correct,
      responseMs,
      timingSource: 'browser-wall-clock',
      attempts: 1
    });
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
    const stage = STAGES.find((item) => item.index === stageIndex) || STAGES[0];
    state.stage = stage;
    state.questions = buildQuestions(stage);
    state.questionIndex = 0;
    state.startedAtMs = Date.now();
    state.savedRunId = '';
    state.sessionId = window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID() : `spatial-${state.startedAtMs}-${Math.random().toString(36).slice(2)}`;
    state.metrics = { correct: 0, wrong: 0, attempts: 0, responseTimes: [], questionLogs: [], answerDistances: [], rotations: 0 };
    setScreen('game');
    renderQuestion();
  }

  function showResult() {
    saveResult();
    const total = state.stage.questions;
    const accuracy = Math.round((state.metrics.correct / Math.max(total, 1)) * 100);
    const avgResponse = average(state.metrics.responseTimes) / 1000;
    const avgDistance = average(state.metrics.answerDistances);
    els.resultTitle.textContent = `${state.stage.index}단계 완료`;
    els.resultSummary.textContent = `${LAB_TITLE} ${state.stage.label}에서 ${total}문제 중 ${state.metrics.correct}문제를 맞혔어요.`;
    els.resultStats.innerHTML = [
      { value: `${accuracy}%`, label: '정답률' },
      { value: `${state.metrics.correct}/${total}`, label: '정답 수' },
      { value: `${avgResponse.toFixed(1)}초`, label: '평균 반응' },
      { value: avgDistance.toFixed(1), label: '평균 오차' }
    ].map((stat) => `
      <div class="block-count-stat">
        <strong>${escapeHtml(stat.value)}</strong>
        <span>${escapeHtml(stat.label)}</span>
      </div>
    `).join('');
    setScreen('result');
  }

  function saveResult() {
    if (state.savedRunId || !window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function') return;
    const endedAt = Date.now();
    const total = state.stage.questions;
    const accuracy = Math.round((state.metrics.correct / Math.max(total, 1)) * 100);
    const durationSeconds = Math.max(1, Math.round((endedAt - state.startedAtMs) / 1000));
    const record = window.HahaLabLearningHarness.recordSession({
      sessionId: state.sessionId,
      labKind: 'playlab',
      reportScope: 'playlab',
      saveToClientReport: true,
      curriculumKey: CURRICULUM_KEY,
      labTitle: LAB_TITLE,
      stageKey: `stage-${state.stage.index}`,
      stageTitle: state.stage.label,
      totalQuestions: total,
      correctCount: state.metrics.correct,
      wrongCount: state.metrics.wrong,
      accuracyScore: accuracy,
      score: accuracy,
      durationSeconds,
      startedAtMs: state.startedAtMs,
      completedAt: new Date().toISOString(),
      reportType: CURRICULUM_KEY,
      reportInput: {
        reportEvidenceMode: 'observed-only',
        reportType: CURRICULUM_KEY,
        reportScope: 'playlab',
        title: LAB_TITLE,
        stageTitle: state.stage.label,
        totalQuestions: total,
        totalItems: total,
        correctCount: state.metrics.correct,
        wrongCount: state.metrics.wrong,
        accuracyRate: accuracy,
        elapsedMs: endedAt - state.startedAtMs,
        startedAtMs: state.startedAtMs,
        completedAtMs: endedAt,
        questionLogs: state.metrics.questionLogs.map((item) => ({ ...item })),
        measurementContext: {
          taskVersion: '20261104-raw-1',
          timingSource: 'browser-wall-clock',
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          userAgent: window.navigator.userAgent
        }
      },
      action: LAB_SESSION_COMPLETION_ACTION,
      details: {
        curriculum_key: CURRICULUM_KEY,
        focus: state.stage.focus,
        canRotate: state.stage.canRotate,
        rotations: state.metrics.rotations,
        averageResponseSeconds: Number((average(state.metrics.responseTimes) / 1000).toFixed(2)),
        averageAnswerDistance: Number(average(state.metrics.answerDistances).toFixed(2))
      },
      questionSnapshot: state.questions.map((question, index) => ({
        order: index + 1,
        answer: question.answer,
        blockCount: question.blocks.length,
        choices: question.choices
      })),
      recommendations: [
        '회전하며 확인한 뒤 앞줄, 뒷줄, 위층으로 나누어 세는 전략을 말로 설명해 봅니다.',
        '오답이 정답보다 2개 이상 차이 나면 블록을 흩어 놓고 다시 묶음별로 세어 봅니다.'
      ]
    });
    state.savedRunId = record && record.id ? record.id : `saved-${Date.now()}`;
  }

  function applyRotation() {
    els.cubeScene.style.setProperty('--rotate-x', `${state.rotation.x}deg`);
    els.cubeScene.style.setProperty('--rotate-y', `${state.rotation.y}deg`);
  }

  function bindRotation() {
    els.sceneViewport.addEventListener('pointerdown', (event) => {
      if (!state.stage || state.answered) return;
      state.drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: state.rotation.x,
        startY: state.rotation.y
      };
      els.sceneViewport.setPointerCapture(event.pointerId);
    });

    els.sceneViewport.addEventListener('pointermove', (event) => {
      if (!state.drag || event.pointerId !== state.drag.id) return;
      const dx = event.clientX - state.drag.x;
      const dy = event.clientY - state.drag.y;
      state.rotation.x = clamp(state.drag.startX - dy * 0.35, -70, -8);
      state.rotation.y = state.drag.startY + dx * 0.45;
      state.metrics.rotations += 1;
      applyRotation();
    });

    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
      els.sceneViewport.addEventListener(type, () => {
        state.drag = null;
      });
    });
  }

  function rotateByButton(action) {
    if (!state.stage || state.answered) return;
    const step = 90;
    if (action === 'left') state.rotation.y -= step;
    if (action === 'right') state.rotation.y += step;
    if (action === 'up') state.rotation.x += step;
    if (action === 'down') state.rotation.x -= step;
    state.metrics.rotations += 1;
    applyRotation();
  }

  function bindRotationButtons() {
    els.rotateControls.querySelectorAll('[data-rotate-action]').forEach((button) => {
      button.addEventListener('click', () => rotateByButton(button.dataset.rotateAction));
    });
  }

  function openHelp() {
    els.helpModal.setAttribute('aria-hidden', 'false');
  }

  function closeHelp() {
    els.helpModal.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
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
    bindRotation();
    bindRotationButtons();
  }

  function init() {
    [
      'stageView', 'gameView', 'resultView', 'stageGrid', 'shellStageLabel', 'stageSelectButton',
      'gameKicker', 'gameTitle', 'stageChip', 'questionChip', 'sceneHint', 'sceneViewport',
      'cubeScene', 'actualCount', 'choiceGrid', 'feedbackText', 'nextButton', 'resultTitle',
      'resultSummary', 'resultStats', 'retryButton', 'otherStageButton', 'helpButton',
      'helpModal', 'helpCloseButton'
    ].forEach((id) => { els[id] = $(id); });
    els.rotateControls = document.querySelector('.block-count-rotate-controls');
    renderStages();
    bindEvents();
  }

  window.PlayLabSpatialBlockCount = {
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
