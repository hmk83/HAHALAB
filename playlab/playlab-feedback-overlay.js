(function () {
  'use strict';

  if (window.HahaFeedbackOverlay) return;

  const SOUND_PATHS = {
    correct: '../sound/correct.mp3',
    wrong: '../sound/error.mp3'
  };
  const scriptBase = (function () {
    const script = document.currentScript;
    if (!script || !script.src) return '';
    return script.src.slice(0, script.src.lastIndexOf('/') + 1);
  })();
  const EFFECT_PATHS = Object.assign({
    correct: 'feedback-effects/success-green.json',
    wrong: 'feedback-effects/error-animation.json'
  }, window.HAHA_FEEDBACK_EFFECT_PATHS || {});
  const LOTTIE_SCRIPT_PATH = window.HAHA_FEEDBACK_LOTTIE_SCRIPT || 'vendor/lottie-web.min.js';

  let burst = null;
  let burstEffect = null;
  let burstCloseButton = null;
  let hideTimer = 0;
  let lastShownAt = 0;
  let lastKind = '';
  const audioCache = {};
  const effectCache = {};
  let lottieLoadPromise = null;
  let activeAnimation = null;

  function resolveFeedbackUrl(path) {
    try {
      return new URL(path, scriptBase || window.location.href).href;
    } catch (_error) {
      return path;
    }
  }

  function isAutoDetectEnabled() {
    return window.HAHA_ENABLE_FEEDBACK_OVERLAY_AUTO !== false &&
      document.documentElement.getAttribute('data-feedback-overlay-auto') !== 'off';
  }

  function isOverlayDisabled() {
    return window.HAHA_DISABLE_FEEDBACK_OVERLAY === true ||
      document.documentElement.getAttribute('data-feedback-overlay') === 'off' ||
      (document.body && document.body.getAttribute('data-feedback-overlay') === 'off');
  }

  function ensureBurst() {
    if (burst) return;
    burst = document.createElement('div');
    burst.className = 'haha-feedback-burst';
    burst.setAttribute('aria-hidden', 'true');
    burstEffect = document.createElement('div');
    burstEffect.className = 'haha-feedback-burst-effect';
    burstEffect.setAttribute('aria-hidden', 'true');
    burstCloseButton = document.createElement('button');
    burstCloseButton.type = 'button';
    burstCloseButton.className = 'haha-feedback-burst-close';
    burstCloseButton.textContent = '닫기';
    burstCloseButton.addEventListener('click', hide);
    burst.appendChild(burstEffect);
    burst.appendChild(burstCloseButton);
    document.body.appendChild(burst);
  }

  function loadLottieScript() {
    if (window.lottie && typeof window.lottie.loadAnimation === 'function') {
      return Promise.resolve(window.lottie);
    }
    if (lottieLoadPromise) return lottieLoadPromise;
    lottieLoadPromise = new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-haha-feedback-lottie="true"]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.lottie); }, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = resolveFeedbackUrl(LOTTIE_SCRIPT_PATH);
      script.async = true;
      script.defer = true;
      script.setAttribute('data-haha-feedback-lottie', 'true');
      script.addEventListener('load', function () { resolve(window.lottie); }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
    return lottieLoadPromise;
  }

  function loadEffectData(kind) {
    const src = EFFECT_PATHS[kind];
    if (!src) return Promise.resolve(null);
    if (effectCache[kind]) return effectCache[kind];
    effectCache[kind] = fetch(resolveFeedbackUrl(src), { cache: 'force-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('Feedback effect load failed: ' + response.status);
        return response.json();
      })
      .catch(function () {
        effectCache[kind] = null;
        return null;
      });
    return effectCache[kind];
  }

  function preloadEffects() {
    loadLottieScript().catch(function () {});
    loadEffectData('correct');
    loadEffectData('wrong');
  }

  function clearAnimation() {
    if (activeAnimation && typeof activeAnimation.destroy === 'function') {
      try {
        activeAnimation.destroy();
      } catch (_error) {}
    }
    activeAnimation = null;
    if (burstEffect) burstEffect.replaceChildren();
  }

  function renderEffect(kind) {
    if (!burstEffect) return;
    const showToken = String(Date.now()) + '-' + kind;
    burstEffect.dataset.renderToken = showToken;
    clearAnimation();
    Promise.all([loadLottieScript(), loadEffectData(kind)]).then(function (result) {
      const lottie = result[0];
      const animationData = result[1];
      if (!burstEffect || burstEffect.dataset.renderToken !== showToken || !animationData || !lottie) return;
      clearAnimation();
      activeAnimation = lottie.loadAnimation({
        container: burstEffect,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet'
        }
      });
    }).catch(function () {});
  }

  function playSound(kind) {
    const src = SOUND_PATHS[kind];
    if (!src || typeof Audio === 'undefined') return;
    try {
      const audio = audioCache[kind] || new Audio(src);
      audioCache[kind] = audio;
      audio.volume = kind === 'correct' ? 0.54 : 0.46;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
    } catch (error) {
      /* Sound feedback is optional for browsers that block media. */
    }
  }

  function hide() {
    window.clearTimeout(hideTimer);
    if (!burst) return;
    burst.classList.remove('is-show', 'is-manual');
    clearAnimation();
  }

  function bindManualDismiss() {
    if (!burst || burst.dataset.dismissBound === 'true') return;
    burst.dataset.dismissBound = 'true';
    burst.addEventListener('click', hide);
  }

  function show(kind, options) {
    if (isOverlayDisabled()) return;
    const normalized = kind === 'wrong' || kind === false ? 'wrong' : 'correct';
    const now = Date.now();
    if (normalized === lastKind && now - lastShownAt < 320) return;
    lastKind = normalized;
    lastShownAt = now;
    ensureBurst();
    bindManualDismiss();
    window.clearTimeout(hideTimer);
    burst.className = 'haha-feedback-burst is-show ' + (normalized === 'wrong' ? 'is-wrong' : 'is-correct');
    renderEffect(normalized);
    if (options && options.sound === true) playSound(normalized);
    if (options && options.manualClose === true) {
      burst.classList.add('is-manual');
      return;
    }
    const durationMs = Number(options && options.durationMs);
    hideTimer = window.setTimeout(function () {
      hide();
    }, Number.isFinite(durationMs) ? Math.max(240, durationMs) : 980);
  }

  function showQuestionComplete(result, options) {
    const normalized = result === 'correct' || result === true
      ? 'correct'
      : result === 'wrong' || result === false
        ? 'wrong'
        : '';
    if (!normalized) return;
    show(normalized, Object.assign({ sound: false }, options || {}));
  }

  function hasClassToken(element, tokens) {
    if (!element || !element.classList) return false;
    return tokens.some(function (token) {
      return element.classList.contains(token);
    });
  }

  function hasValue(value, values) {
    const normalized = String(value || '').trim().toLowerCase();
    return values.indexOf(normalized) !== -1;
  }

  function isQuestionAnswerElement(element) {
    if (!element || element.nodeType !== 1) return false;
    if (element.closest('.haha-feedback-burst, #feedbackToast, .legacy-feedback')) return false;
    if (element.closest('#completeScreen, #completeView, #resultView, #resultScreen, #reportPanel, #professionalReport, .playlab-report-shell, .wordbuild-complete-card, .quiz-complete, .phonics-complete-card, .cloze-complete-card, .association-result-card, .time-result-panel, .hevi-report-section')) return false;
    return Boolean(element.closest([
      'button',
      '[role="button"]',
      '[data-choice]',
      '[data-choice-id]',
      '[data-answer]',
      '[data-score]',
      '[data-action="select-answer"]',
      '.choice',
      '.choice-card',
      '.answer-choice',
      '.association-choice-card',
      '.synonym-choice-card',
      '.context-choice-card',
      '.connective-choice',
      '.josa-choice',
      '.df-choice',
      '.playlab-snack-option',
      '.playlab-iceword-option',
      '.numberlab-animal-choice-button',
      '.timelab-choice',
      '.half-mark-btn',
      '.spotlight-btn',
      '.shape-match-btn',
      '.hevi-score-btn'
    ].join(', ')));
  }

  function inferFromElement(element) {
    if (!element || element.nodeType !== 1) return '';
    if (!isQuestionAnswerElement(element)) return '';
    if (hasClassToken(element, ['is-wrong', 'wrong', 'incorrect', 'miss', 'hevi-wrong'])) return 'wrong';
    if (hasClassToken(element, ['is-correct', 'correct', 'success', 'good', 'hevi-correct'])) return 'correct';
    const dataset = element.dataset || {};
    const dataValue = dataset.feedback || dataset.feedbackKind || dataset.result || dataset.status || dataset.score || dataset.answerState || dataset.tone;
    if (hasValue(dataValue, ['wrong', 'incorrect', 'miss', 'error', 'false', '0'])) return 'wrong';
    if (hasValue(dataValue, ['correct', 'success', 'good', 'true', '1'])) return 'correct';
    return '';
  }

  function bindLightweightAutoDetect() {
    if (!isAutoDetectEnabled() || isOverlayDisabled()) return;
    ensureBurst();

    document.addEventListener('click', function (event) {
      if (isOverlayDisabled()) return;
      const target = event.target && event.target.closest('button, [role="button"], [data-choice], [data-choice-id], [data-answer], [data-score], [data-action]');
      if (!target || !isQuestionAnswerElement(target)) return;
      window.setTimeout(function () {
        const kind = inferFromElement(target);
        if (kind) show(kind, { sound: false });
      }, 120);
    }, true);

    document.addEventListener('hahalab:question-complete', function (event) {
      if (isOverlayDisabled()) return;
      const detail = event && event.detail ? event.detail : {};
      showQuestionComplete(detail.result || detail.kind || detail.correct, detail.options || {});
    });
  }

  window.HahaFeedbackOverlay = {
    show: show,
    hide: hide,
    preload: preloadEffects,
    showQuestionComplete: showQuestionComplete,
    correct: function (options) { show('correct', options); },
    wrong: function (options) { show('wrong', options); }
  };
  window.PlaylabFeedbackOverlay = window.HahaFeedbackOverlay;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      preloadEffects();
      bindLightweightAutoDetect();
    }, { once: true });
  } else {
    preloadEffects();
    bindLightweightAutoDetect();
  }
})();
