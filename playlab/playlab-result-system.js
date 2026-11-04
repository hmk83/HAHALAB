(function () {
  'use strict';

  const VERSION = '20260810-result-system-1';
  const ROOT_SELECTORS = [
    '#resultView',
    '#completeView',
    '#completeScreen',
    '#resultScreen',
    '.study-results',
    '.phonics-complete-view',
    '.synonym-complete-view'
  ];
  const CARD_SELECTORS = [
    '.playlab-result-card',
    '.number-agency-result-card',
    '.time-result-card',
    '.spotlight-result-card',
    '.colorseq-result-card',
    '.quiz-complete',
    '.sentence-complete',
    '.idiom-complete',
    '.situation-result',
    '.word-picture-complete',
    '.zoo-complete',
    '.car-complete',
    '.association-complete',
    '.context-complete',
    '.batchim-report-card',
    '.complete-panel',
    '.musicartlab-result-card',
    '.cognitive-result-card',
    '.legacy-result-card',
    '.hevi-result-card',
    '.wordbuild-complete',
    '.phonics-complete-card',
    '.association-result-card',
    '.time-result-panel',
    '.phonics-complete',
    '.synonym-complete',
    '.association-complete',
    '.context-complete',
    '.cloze-complete-card',
    '.df-complete',
    '.hangul-complete-card',
    '.jamo-report-card',
    '.language-result-card',
    '.crossmath-result-card',
    '.chase-result-card',
    '.arrow-result-card',
    '.bilabial-result-card',
    '.gridcalc-result-card',
    '.mart-result-card',
    '.taegeuk-result-card',
    '.block-count-result-card',
    '.odd-result-card',
    '.shape-result-card',
    '.stroop-result-card',
    '.traffic-result-card',
    '.orbit-result-card',
    '.half-report-card',
    '.plane-result-card'
  ];
  const TITLE_SELECTORS = [
    '.playlab-result-title',
    '.time-result-title',
    '.spotlight-result-title',
    '.quiz-complete-title',
    '.wordbuild-complete-title',
    '.language-result-title',
    '.musicartlab-result-title',
    '.cognitive-result-title',
    '.df-complete-title',
    '#resultTitle',
    '#completeTitle',
    'h1',
    'h2'
  ];
  const SUMMARY_SELECTORS = [
    '.playlab-intro-subtitle',
    '.time-result-summary',
    '.spotlight-result-summary',
    '.quiz-complete-desc',
    '.wordbuild-complete-summary',
    '.phonics-complete-summary',
    '.synonym-complete-summary',
    '.language-result-copy',
    '.musicartlab-result-summary',
    '.cognitive-result-summary',
    '.df-complete-desc',
    '#resultSummary',
    '#completeSummary'
  ];
  const STATS_SELECTORS = [
    '.playlab-result-stats',
    '.musicartlab-result-stats',
    '.cognitive-result-stats',
    '.legacy-result-stats',
    '.language-result-stats',
    '.hangul-complete-stats',
    '#resultStats',
    '#completeStats',
    '.arrow-stats',
    '.bilabial-stats',
    '.jamo-stats',
    '.half-stats',
    '.batchim-report-metrics',
    '.number-agency-result-stats',
    '.time-result-stats',
    '.spotlight-result-stats',
    '.colorseq-result-body',
    '.wordbuild-complete-stats',
    '.phonics-complete-stats',
    '.synonym-complete-stats',
    '.association-complete-stats',
    '.context-complete-stats',
    '.cloze-complete-stats',
    '.df-complete-stats',
    '.car-complete-stats',
    '.situation-result-stats',
    '.crossmath-result-stats',
    '.chase-result-stats',
    '.gridcalc-result-stats',
    '.orbit-result-stats',
    '.plane-result-stats',
    '.block-count-result-stats',
    '.odd-result-stats',
    '.shape-result-stats',
    '.stroop-result-stats',
    '.traffic-result-stats'
  ];
  const ACTION_SELECTORS = [
    '.playlab-result-actions',
    '.musicartlab-result-actions',
    '.cognitive-result-actions',
    '.legacy-result-actions',
    '.language-result-actions',
    '#resultActions',
    '#completeActions',
    '.number-agency-actions',
    '.time-result-actions',
    '.spotlight-result-actions',
    '.colorseq-result-actions',
    '.quiz-complete-actions',
    '.wordbuild-complete-actions',
    '.phonics-complete-actions',
    '.synonym-complete-actions',
    '.context-complete-actions',
    '.cloze-complete-actions',
    '.df-complete-actions',
    '.car-complete-actions',
    '.block-count-result-actions',
    '.crossmath-result-actions',
    '.chase-result-actions',
    '.arrow-result-actions',
    '.bilabial-result-actions',
    '.gridcalc-result-actions',
    '.orbit-result-actions',
    '.half-report-actions',
    '.spotlight-result-actions',
    '.odd-result-actions',
    '.shape-result-actions',
    '.stroop-result-actions',
    '.traffic-result-actions',
    '.taegeuk-result-buttons'
  ];
  const KIND_META = {
    cardlab: { label: '카드랩', shortLabel: 'CARD LAB' },
    numberlab: { label: '숫자랩', shortLabel: 'NUMBER LAB' },
    playlab: { label: '플레이랩', shortLabel: 'PLAY LAB' },
    rehab: { label: '재활랩', shortLabel: 'REHAB LAB' },
    musicartlab: { label: '뮤직아트랩', shortLabel: 'MUSIC · ART LAB' }
  };

  function queryFirst(selectors, root) {
    for (const selector of selectors) {
      const node = root.querySelector(selector);
      if (node) return node;
    }
    return null;
  }

  function queryFirstOutsideReport(selectors, root) {
    for (const selector of selectors) {
      const candidates = root.querySelectorAll(selector);
      for (const candidate of candidates) {
        if (!candidate.closest('.playlab-report-shell')) return candidate;
      }
    }
    return null;
  }

  function normalizeKindAlias(value) {
    const alias = String(value || '').trim().toLowerCase();
    if (['card', 'cardlab'].includes(alias)) return 'cardlab';
    if (['number', 'numbers', 'numberlab', 'time', 'timelab'].includes(alias)) return 'numberlab';
    if (['play', 'playlab'].includes(alias)) return 'playlab';
    if (['rehab', 'rehablab'].includes(alias)) return 'rehab';
    if (['music', 'art', 'musicart', 'musicartlab'].includes(alias)) return 'musicartlab';
    return '';
  }

  function inferKind() {
    const fileName = String(window.location.pathname || '').split('/').pop().toLowerCase();
    const params = new URLSearchParams(window.location.search || '');
    const fromQuery = normalizeKindAlias(params.get('labKind'));
    if (fromQuery) return fromQuery;
    const fromMeta = normalizeKindAlias(document.querySelector('meta[name="playlab:section"]')?.content);
    if (fromMeta) return fromMeta;
    if (/^rehablab-/.test(fileName)) return 'rehab';
    if (/^(number|time)-/.test(fileName)) return 'numberlab';
    if (/^cardlab-/.test(fileName)) return 'cardlab';
    if (/^musicartlab-/.test(fileName)) return 'musicartlab';
    return 'playlab';
  }

  function isVisible(node) {
    if (!node || node.hidden || node.getAttribute('aria-hidden') === 'true') return false;
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return node.classList.contains('is-active') || node.getClientRects().length > 0;
  }

  function findCard(root) {
    if (CARD_SELECTORS.some((selector) => root.matches(selector))) return root;
    return queryFirst(CARD_SELECTORS, root);
  }

  function classifyMetric(stat) {
    const label = String(stat.textContent || '').replace(/\s+/g, ' ').trim();
    if (/오답|오류|실패|미완료|힌트|도움|지원/.test(label)) return 'attention';
    if (/시간|반응|속도|초|분/.test(label)) return 'timing';
    if (/정답|정확|성공|완료|달성/.test(label)) return 'positive';
    return 'neutral';
  }

  function ensureContext(card, kind) {
    if (card.querySelector(':scope > .haha-result-context')) return;
    const context = document.createElement('div');
    context.className = 'haha-result-context';
    context.setAttribute('aria-label', `${KIND_META[kind].label} 학습 완료`);
    context.innerHTML = [
      `<span class="haha-result-context-kind">${KIND_META[kind].shortLabel}</span>`,
      '<span class="haha-result-context-state">학습 완료</span>'
    ].join('');
    card.insertBefore(context, card.firstChild);
  }

  function ensureMetricHeading(stats, kind) {
    if (!stats || stats.previousElementSibling?.classList.contains('haha-result-metric-heading')) return;
    const heading = document.createElement('div');
    heading.className = 'haha-result-metric-heading';
    const description = kind === 'rehab'
      ? '재활랩 과제에서 자동 기록된 디지털 수행값입니다. 진단·임상 척도·치료사 소견과 구분됩니다.'
      : '이번 활동에서 자동 기록된 과제 수행값입니다. 임상 척도·치료사 소견과 구분됩니다.';
    heading.innerHTML = [
      '<strong>디지털 수행지표</strong>',
      `<span>${description}</span>`
    ].join('');
    stats.parentNode.insertBefore(heading, stats);
  }

  function upgradeRoot(root, kind) {
    const card = findCard(root);
    if (!card || card.matches('.playlab-report-shell')) return;

    root.classList.add('haha-result-surface');
    root.setAttribute('data-lab-result', '');
    root.dataset.resultVariant = kind === 'rehab' ? 'rehab' : 'simple';
    root.dataset.hahaResultSystem = VERSION;
    root.dataset.hahaLabKind = kind;
    root.setAttribute('aria-live', root.getAttribute('aria-live') || 'polite');
    card.classList.add('haha-result-card');
    card.dataset.hahaLabKind = kind;
    ensureContext(card, kind);

    const title = queryFirstOutsideReport(TITLE_SELECTORS, card);
    if (title) {
      title.classList.add('haha-result-title');
      if (!title.id) title.id = `hahaResultTitle-${Math.random().toString(36).slice(2, 9)}`;
      root.setAttribute('aria-labelledby', title.id);
      title.tabIndex = -1;
    }
    const summary = queryFirstOutsideReport(SUMMARY_SELECTORS, card);
    if (summary) {
      summary.classList.add('haha-result-summary');
      if (!summary.id) summary.id = `hahaResultSummary-${Math.random().toString(36).slice(2, 9)}`;
      root.setAttribute('aria-describedby', summary.id);
    }

    const stats = queryFirstOutsideReport(STATS_SELECTORS, card);
    if (stats) {
      stats.classList.add('haha-result-metrics');
      stats.setAttribute('role', 'list');
      stats.setAttribute('aria-label', '디지털 수행지표');
      ensureMetricHeading(stats, kind);
      Array.from(stats.children).forEach((stat) => {
        stat.classList.add('haha-result-metric');
        stat.dataset.metricTone = classifyMetric(stat);
        stat.setAttribute('role', 'listitem');
      });
    }

    const actions = queryFirstOutsideReport(ACTION_SELECTORS, card);
    if (actions) actions.classList.add('haha-result-actions');
  }

  function sync() {
    const kind = inferKind();
    document.documentElement.dataset.hahaLabKind = kind;
    const knownRootSelector = ROOT_SELECTORS.join(',');
    const rootSet = new Set(document.querySelectorAll(knownRootSelector));
    document.querySelectorAll(CARD_SELECTORS.join(',')).forEach((card) => {
      rootSet.add(card.closest(knownRootSelector) || card);
    });
    const roots = Array.from(rootSet);
    let hasVisibleResult = false;
    roots.forEach((root) => {
      upgradeRoot(root, kind);
      const current = root.classList.contains('haha-result-surface') && isVisible(root);
      root.classList.toggle('haha-result-current', current);
      if (current && root.dataset.hahaResultAnnounced !== '1') {
        root.dataset.hahaResultAnnounced = '1';
        const title = root.querySelector('.haha-result-title');
        if (title && typeof title.focus === 'function') {
          window.setTimeout(() => title.focus({ preventScroll: true }), 30);
        }
      } else if (!current) {
        delete root.dataset.hahaResultAnnounced;
      }
      hasVisibleResult = hasVisibleResult || current;
    });
    document.body?.classList.toggle('haha-result-active', hasVisibleResult);
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  function init() {
    sync();
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'aria-hidden']
    });
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('pageshow', scheduleSync);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
