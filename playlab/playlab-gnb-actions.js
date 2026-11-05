(function () {
  'use strict';

  const EXIT_BUTTON_SELECTOR = '[data-playlab-global-exit]';
  const TOPBAR_SELECTORS = ['.shell-topbar-side', '.study-topbar-side'];
  const STAGE_BUTTON_SELECTORS = [
    '#stageSelectButton',
    '#stageButton',
    '[data-action="change-category"]'
  ];
  const STAGE_SELECTION_SELECTORS = [
    '#stageSelectView.is-active',
    '#stageView.is-active',
    '#menuView.is-active',
    '#introScreen.is-active',
    '#introView.is-active',
    '.numberlab-shell-selection'
  ];
  const LEARNING_SELECTORS = [
    '#lessonView.is-active',
    '#gameView.is-active',
    '#quizScreen.is-active',
    '#resultView.is-active',
    '#completeScreen.is-active',
    '.numberlab-shell-learning'
  ];
  const CLASS_SHELL_STATE_KEY = 'haha_lab_shell_view_state';
  const LAB_RETURN_KIND_KEY = 'haha_lab_return_lab_kind';
  const LAB_RETURN_URL_KEY = 'haha_lab_last_lab_return_url';
  const LAB_EXIT_MESSAGE_TYPE = 'HAHA_LAB_LEARNING_EXIT';
  const exitButtonAnchors = new WeakMap();
  let lastExitTrigger = null;

  function queryFirst(selectors, root = document) {
    for (const selector of selectors) {
      const node = root.querySelector(selector);
      if (node) return node;
    }
    return null;
  }

  function queryAll(selectors, root = document) {
    return selectors.flatMap((selector) => Array.from(root.querySelectorAll(selector)));
  }

  function getTopbarSide() {
    return queryFirst(TOPBAR_SELECTORS);
  }

  function rememberExitButtonAnchor(button) {
    if (!button || exitButtonAnchors.has(button)) return;
    exitButtonAnchors.set(button, {
      parent: button.parentNode || null,
      nextSibling: button.nextSibling || null
    });
  }

  function placeExitButton(button) {
    if (!button) return;
    const pinToViewport = !isEmbeddedInParent();
    button.classList.toggle('is-viewport-pinned', pinToViewport);
    document.documentElement.classList.toggle('playlab-exit-viewport-pinned', pinToViewport);
    if (pinToViewport) {
      if (button.parentNode !== document.body) document.body.appendChild(button);
      return;
    }
    const anchor = exitButtonAnchors.get(button);
    const topbarSide = getTopbarSide();
    const parent = anchor?.parent?.isConnected ? anchor.parent : topbarSide;
    if (!parent || button.parentNode === parent) return;
    const nextSibling = anchor?.nextSibling;
    parent.insertBefore(button, nextSibling?.parentNode === parent ? nextSibling : null);
  }

  function ensureExitButton() {
    const topbarSide = getTopbarSide();
    let button = document.querySelector(EXIT_BUTTON_SELECTOR);
    if (!button) {
      const existingExitButton = document.getElementById('exitButton');
      if (existingExitButton instanceof HTMLButtonElement) {
        button = existingExitButton;
        button.dataset.playlabGlobalExit = '1';
        button.setAttribute('aria-label', button.getAttribute('aria-label') || '학습 종료');
      }
    }
    if (!button) {
      if (!topbarSide) return null;
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'playlab-gnb-exit-btn';
      button.dataset.playlabGlobalExit = '1';
      button.setAttribute('aria-label', '학습 종료');
      button.textContent = '종료';
      button.addEventListener('click', openExitModal);
      topbarSide.appendChild(button);
    }
    rememberExitButtonAnchor(button);
    if (!exitButtonAnchors.get(button)?.parent && topbarSide) {
      topbarSide.appendChild(button);
    }
    placeExitButton(button);
    return button;
  }

  function ensureExitModal() {
    let modal = document.getElementById('playlabGlobalExitModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'playlabGlobalExitModal';
    modal.className = 'playlab-exit-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    modal.innerHTML = [
      '<div class="playlab-exit-modal-backdrop" data-playlab-exit-close></div>',
      '<section class="playlab-exit-modal-card" role="dialog" aria-modal="true" aria-labelledby="playlabGlobalExitTitle" aria-describedby="playlabGlobalExitDesc">',
      '  <div class="playlab-exit-modal-kicker">학습 종료</div>',
      '  <h2 id="playlabGlobalExitTitle" class="playlab-exit-modal-title">학습을 종료하시겠어요?</h2>',
      '  <p id="playlabGlobalExitDesc" class="playlab-exit-modal-copy">현재 학습 진행을 종료하고 이전 화면으로 이동합니다. 저장되지 않은 풀이 상태는 복구되지 않을 수 있습니다.</p>',
      '  <div class="playlab-exit-modal-actions">',
      '    <button type="button" class="playlab-exit-cancel" data-playlab-exit-close>계속 학습</button>',
      '    <button type="button" class="playlab-exit-confirm" data-playlab-exit-confirm>종료하기</button>',
      '  </div>',
      '</section>'
    ].join('');
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.matches('[data-playlab-exit-close]')) closeExitModal();
      if (target.matches('[data-playlab-exit-confirm]')) confirmExit();
    });
    return modal;
  }

  function openExitModal(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    lastExitTrigger = event && event.currentTarget instanceof HTMLElement
      ? event.currentTarget
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const modal = ensureExitModal();
    modal.removeAttribute('inert');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('playlab-exit-modal-open');
    const cancelButton = modal.querySelector('[data-playlab-exit-close].playlab-exit-cancel');
    if (cancelButton) window.setTimeout(() => cancelButton.focus({ preventScroll: true }), 30);
  }

  function moveFocusOutOfModal(modal) {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !modal.contains(active)) return;
    const restoreTarget = lastExitTrigger && document.contains(lastExitTrigger)
      ? lastExitTrigger
      : ensureExitButton();
    if (restoreTarget && document.contains(restoreTarget) && typeof restoreTarget.focus === 'function') {
      restoreTarget.focus({ preventScroll: true });
      return;
    }
    active.blur();
  }

  function closeExitModal() {
    const modal = document.getElementById('playlabGlobalExitModal');
    if (!modal) return;
    moveFocusOutOfModal(modal);
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    document.documentElement.classList.remove('playlab-exit-modal-open');
  }

  function stopActiveMedia() {
    try {
      document.querySelectorAll('audio, video').forEach((media) => {
        media.pause();
        media.currentTime = 0;
      });
    } catch (_error) {}
    try {
      if (window.speechSynthesis && typeof window.speechSynthesis.cancel === 'function') {
        window.speechSynthesis.cancel();
      }
    } catch (_error) {}
    try {
      window.dispatchEvent(new CustomEvent('playlab:global-exit-confirmed'));
    } catch (_error) {}
  }

  function normalizeLabKind(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (['number', 'numberlab', 'time', 'timelab'].includes(normalized)) return 'numberlab';
    if (['play', 'playlab'].includes(normalized)) return 'playlab';
    if (['rehab', 'rehablab'].includes(normalized)) return 'rehab';
    if (['card', 'cardlab'].includes(normalized)) return 'cardlab';
    return '';
  }

  function inferReturnLabKind() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const fromQuery = normalizeLabKind(params.get('labKind') || params.get('lab'));
      if (fromQuery) return fromQuery;
    } catch (_error) {}

    const fileName = String(window.location.pathname || '').split('/').pop().toLowerCase();
    if (/^(rehablab|rehab)-/.test(fileName)) return 'rehab';
    if (/^(numberlab|number|time)-/.test(fileName)) return 'numberlab';
    if (/^cardlab-/.test(fileName)) return 'cardlab';
    if (/^playlab-/.test(fileName)) return 'playlab';
    if (window.NUMBERLAB_STANDALONE_CONFIG || window.NUMBERLAB_AGENCY_CONFIG) return 'numberlab';
    return 'playlab';
  }

  function persistReturnLabState(labKind) {
    try {
      sessionStorage.setItem(LAB_RETURN_KIND_KEY, labKind);
    } catch (_error) {}
    try {
      const params = new URLSearchParams(window.location.search || '');
      const raw = localStorage.getItem(CLASS_SHELL_STATE_KEY);
      const current = raw ? JSON.parse(raw) : {};
      const next = {
        ...current,
        view: 'lab',
        labKind,
        labReturnView: current.labReturnView || 'detail'
      };
      const clientId = String(params.get('clientId') || current.labClientId || current.detailClientId || '').trim();
      if (clientId) {
        next.labClientId = clientId;
        next.detailClientId = current.detailClientId || clientId;
      }
      localStorage.setItem(CLASS_SHELL_STATE_KEY, JSON.stringify(next));
    } catch (_error) {}
  }

  function buildClassReturnUrl(labKind, referrer = '') {
    try {
      const base = referrer && /\/class-new\.html(?:[?#]|$)/.test(referrer)
        ? new URL(referrer)
        : new URL('/class-new.html', window.location.origin);
      base.searchParams.delete('start');
      base.searchParams.set('view', 'lab');
      base.searchParams.set('labKind', labKind);
      return base.toString();
    } catch (_error) {
      return `/class-new.html?view=lab&labKind=${encodeURIComponent(labKind)}`;
    }
  }

  function isSafeSameOriginUrl(url) {
    if (!url) return false;
    try {
      const parsed = new URL(url, window.location.href);
      if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) return false;
      return parsed.origin === window.location.origin || window.location.protocol === 'file:';
    } catch (_error) {
      return false;
    }
  }

  function normalizeReturnUrl(url) {
    if (!isSafeSameOriginUrl(url)) return '';
    try {
      return new URL(url, window.location.href).toString();
    } catch (_error) {
      return '';
    }
  }

  function readReturnUrlFromQuery() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const raw = params.get('labReturnUrl') || params.get('returnUrl') || '';
      return normalizeReturnUrl(raw);
    } catch (_error) {
      return '';
    }
  }

  function readStoredReturnUrl() {
    try {
      return normalizeReturnUrl(sessionStorage.getItem(LAB_RETURN_URL_KEY) || '');
    } catch (_error) {
      return '';
    }
  }

  function writeStoredReturnUrl(returnUrl) {
    const normalized = normalizeReturnUrl(returnUrl);
    if (!normalized) return;
    try {
      sessionStorage.setItem(LAB_RETURN_URL_KEY, normalized);
    } catch (_error) {}
  }

  function isEmbeddedInParent() {
    try {
      return window.parent && window.parent !== window;
    } catch (_error) {
      return false;
    }
  }

  function requestParentExit(labKind, returnUrl) {
    if (!isEmbeddedInParent()) return false;
    try {
      window.parent.postMessage({
        type: LAB_EXIT_MESSAGE_TYPE,
        labKind,
        returnUrl
      }, window.location.origin);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function goToPreviousPage() {
    const referrer = String(document.referrer || '');
    const labKind = inferReturnLabKind();
    persistReturnLabState(labKind);
    const explicitReturnUrl = readReturnUrlFromQuery() || readStoredReturnUrl();
    const fallback = explicitReturnUrl || buildClassReturnUrl(labKind, referrer);
    writeStoredReturnUrl(fallback);
    if (requestParentExit(labKind, fallback)) {
      return;
    }
    if (explicitReturnUrl) {
      window.location.href = explicitReturnUrl;
      return;
    }
    if (referrer && !/\/__playlab-local-login(?:[?#/]|$)/.test(referrer) && !/\/class-new\.html(?:[?#]|$)/.test(referrer)) {
      window.location.href = referrer;
      return;
    }
    if (referrer.includes('/__playlab-local-login')) {
      window.location.href = fallback;
      return;
    }
    window.location.href = fallback;
  }

  function confirmExit() {
    closeExitModal();
    stopActiveMedia();
    goToPreviousPage();
  }

  function setButtonVisible(button, visible) {
    if (!button) return;
    button.classList.toggle('shell-hidden', !visible);
    if (button.hasAttribute('hidden') || button.id === 'stageButton' || button.id === 'stageSelectButton') {
      button.hidden = !visible;
    }
    button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    button.tabIndex = visible ? 0 : -1;
  }

  function normalizeStageButton(button) {
    if (!button || button.dataset.playlabGnbStageNormalized === '1') return;
    button.dataset.playlabGnbStageNormalized = '1';
    button.textContent = '스테이지 선택';
    button.setAttribute('aria-label', '스테이지 선택 화면으로 이동');
    if (button.classList.contains('shell-icon-btn')) {
      button.classList.add('shell-header-change-btn');
    }
  }

  function getStageButtons() {
    return Array.from(new Set(queryAll(STAGE_BUTTON_SELECTORS)));
  }

  function isStageSelectionScreen() {
    if (queryFirst(LEARNING_SELECTORS)) return false;
    return Boolean(queryFirst(STAGE_SELECTION_SELECTORS));
  }

  function syncHeaderState() {
    const exitButton = ensureExitButton();
    if (exitButton) setButtonVisible(exitButton, true);

    const stageSelection = isStageSelectionScreen();
    const stageButtons = getStageButtons();
    stageButtons.forEach((button) => {
      normalizeStageButton(button);
      setButtonVisible(button, !stageSelection);
    });

    const helpButton = document.getElementById('helpButton');
    if (helpButton) setButtonVisible(helpButton, stageSelection);
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      syncHeaderState();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeExitModal();
  });

  function init() {
    syncHeaderState();
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'style']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
