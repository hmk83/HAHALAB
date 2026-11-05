(() => {
  // This launcher configures presentation only. Authenticated learner/teacher
  // context is owned by the parent bridge and the verified learning harness.
  const applyLaunchState = () => {
    const raw = window.NUMBERLAB_LAUNCH_CONFIG;
    const config = raw && typeof raw === 'object' ? raw : {};
    const categoryTitle = config.showHub ? '숫자랩' : String(config.categoryTitle || '숫자랩').trim();
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'session');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    document.title = String(config.pageTitle || categoryTitle || '숫자랩').trim();
    document.documentElement.dataset.numberlabLaunch = 'ready';
    document.documentElement.dataset.numberlabCategory = String(config.categoryId || '').trim();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLaunchState, { once: true });
  } else {
    applyLaunchState();
  }
})();
