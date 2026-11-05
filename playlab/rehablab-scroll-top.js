(function () {
  "use strict";

  if (!/\/rehablab-[^/]+\.html(?:$|[?#])/.test(window.location.href)) return;

  const SCROLL_CONTAINERS = [
    "html",
    "body",
    ".shell-main",
    ".playlab-main",
    ".playlab-screen",
    ".playlab-stage-screen",
    ".legacy-menu-card",
    ".legacy-game-card",
    ".spotlight-shell",
    ".colorseq-shell",
    ".orbit-shell",
    ".snack-app",
  ];

  const STAGE_ACTION_SELECTOR = [
    "#stageGrid button",
    "#levelGrid button",
    "#startButton",
    "#stageSelectButton",
    "#stageButton",
    "#resultBackButton",
    "#retryButton",
    "#backToStageButton",
    "[data-stage-id]",
    "[data-stage-index]",
    "[data-level-id]",
    "[data-level]",
    ".playlab-stage-card",
    ".legacy-level-grid button",
    ".colorseq-stage-grid button",
    ".spotlight-stage-grid button",
    ".orbit-stage-grid button",
    ".traffic-level-grid button",
    ".stroop-level-grid button",
  ].join(", ");

  function resetScrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    SCROLL_CONTAINERS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        node.scrollTop = 0;
        node.scrollLeft = 0;
      });
    });
  }

  function queueResetScroll() {
    resetScrollToTop();
    window.requestAnimationFrame(resetScrollToTop);
    [60, 160, 320].forEach((delay) => window.setTimeout(resetScrollToTop, delay));
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(STAGE_ACTION_SELECTOR)) queueResetScroll();
    },
    true
  );

  window.addEventListener("hashchange", queueResetScroll);
})();
