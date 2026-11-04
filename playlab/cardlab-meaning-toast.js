(function () {
  'use strict';

  const STATE = {
    root: null,
    card: null,
    title: null,
    word: null,
    meaning: null,
    closeButton: null,
    visible: false,
    listenersBound: false
  };

  function normalizeText(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function ensureToast() {
    if (STATE.root) return STATE.root;

    const root = document.createElement('div');
    root.className = 'cardlab-meaning-toast is-hidden';
    root.setAttribute('aria-live', 'polite');
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '' +
      '<div class="cardlab-meaning-toast-card" role="status" aria-atomic="true">' +
      '  <div class="cardlab-meaning-toast-head">' +
      '    <div class="cardlab-meaning-toast-title">사전적 의미</div>' +
      '    <button type="button" class="cardlab-meaning-toast-close" aria-label="토스트 닫기">×</button>' +
      '  </div>' +
      '  <div class="cardlab-meaning-toast-body">' +
      '    <span class="cardlab-meaning-toast-word"></span>' +
      '    <span class="cardlab-meaning-toast-separator">: </span>' +
      '    <span class="cardlab-meaning-toast-meaning"></span>' +
      '  </div>' +
      '</div>';

    (document.body || document.documentElement).appendChild(root);

    STATE.root = root;
    STATE.card = root.querySelector('.cardlab-meaning-toast-card');
    STATE.title = root.querySelector('.cardlab-meaning-toast-title');
    STATE.word = root.querySelector('.cardlab-meaning-toast-word');
    STATE.meaning = root.querySelector('.cardlab-meaning-toast-meaning');
    STATE.closeButton = root.querySelector('.cardlab-meaning-toast-close');

    STATE.closeButton.addEventListener('click', hide);
    bindListeners();
    return root;
  }

  function show(payload) {
    ensureToast();
    const data = typeof payload === 'string' ? { word: payload } : (payload || {});
    const word = normalizeText(data.word || '');
    const meaning = normalizeText(data.meaning || '');

    STATE.title.textContent = normalizeText(data.title || '사전적 의미');
    STATE.word.textContent = word;
    STATE.meaning.textContent = meaning;
    STATE.root.classList.toggle('has-meaning', Boolean(meaning));
    STATE.root.classList.remove('is-hidden');
    STATE.root.classList.add('is-visible');
    STATE.root.setAttribute('aria-hidden', 'false');
    STATE.visible = true;
  }

  function hide() {
    if (!STATE.root) return;
    STATE.root.classList.remove('is-visible');
    STATE.root.classList.add('is-hidden');
    STATE.root.setAttribute('aria-hidden', 'true');
    STATE.visible = false;
  }

  function bindListeners() {
    if (STATE.listenersBound) return;
    STATE.listenersBound = true;

    document.addEventListener('pointerdown', function (event) {
      if (!STATE.visible || !STATE.card) return;
      const target = event.target;
      if (target && typeof STATE.card.contains === 'function' && STATE.card.contains(target)) {
        return;
      }
      hide();
    }, true);

    document.addEventListener('keydown', function (event) {
      if (!STATE.visible) return;
      if (event.key === 'Escape') {
        hide();
      }
    });
  }

  window.CardlabMeaningToast = {
    show: show,
    hide: hide
  };
})();
