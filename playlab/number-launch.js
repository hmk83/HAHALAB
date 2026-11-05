(() => {
  const STORAGE_USER_KEY = 'haha_lab_session';
  const STORAGE_PAGE_KEY = 'haha_lab_page_state';
  const DEFAULT_USER_ID = 'numberlab-local-teacher';
  const DEFAULT_TEACHER_ID = 'numberlab-local-teacher';

  const CATEGORY_ORDER = [
    'number-learn',
    'number-explore',
    'number-animal-code',
    'number-sequence',
    'number-add-basic',
    'number-sub-basic',
    'number-add-vertical',
    'number-sub-vertical',
    'number-add-family',
    'number-operation-board',
    'number-animal-climb',
    'number-cross-math-puzzle',
    'number-compare-balance',
    'number-ten-frame',
    'number-place-value',
    'number-number-line-jump',
    'number-money-market',
    'number-clock-time',
    'number-measure-compare',
    'number-fraction-share',
    'number-data-graph',
    'number-estimate-jar'
  ];

  const CATEGORY_INDEX = CATEGORY_ORDER.reduce((map, id, index) => {
    map[id] = index;
    return map;
  }, {});

  const getConfig = () => {
    const raw = window.NUMBERLAB_LAUNCH_CONFIG;
    return raw && typeof raw === 'object' ? raw : {};
  };

  const readStoredJson = (storage, key) => {
    try {
      const raw = storage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  };

  const safeSetItem = (storage, key, value) => {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  };

  const safeRemoveItem = (storage, key) => {
    try {
      storage.removeItem(key);
    } catch (error) {
    }
  };

  const buildTeacherState = (config) => {
    const existingUser =
      readStoredJson(localStorage, STORAGE_USER_KEY) ||
      readStoredJson(sessionStorage, STORAGE_USER_KEY);
    if (existingUser && existingUser.id && String(existingUser.id) !== DEFAULT_USER_ID) {
      return existingUser;
    }
    const now = new Date().toISOString();
    const categoryId = String(config.categoryId || '').trim();
    return {
      id: DEFAULT_USER_ID,
      teacherId: DEFAULT_TEACHER_ID,
      name: '숫자랩',
      loginAt: now,
      sessionSeed: `numberlab-${categoryId || 'hub'}`
    };
  };

  const buildSessionState = (config) => {
    const now = new Date().toISOString();
    const categoryId = String(config.categoryId || '').trim();
    const categoryTitle = String(config.categoryTitle || '숫자랩').trim();
    const showHub = Boolean(config.showHub);
    const categoryIndex = Number.isFinite(Number(config.categoryIndex))
      ? Number(config.categoryIndex)
      : (categoryId in CATEGORY_INDEX ? CATEGORY_INDEX[categoryId] : 0);
    const sessionTitle = showHub ? '숫자랩' : categoryTitle;
    const progressValue = showHub ? '0/10' : `${Math.max(categoryIndex + 1, 1)}/10`;

    return {
      id: `numberlab_${categoryId || 'hub'}_${Date.now()}`,
      clientId: `numberlab_${categoryId || 'hub'}`,
      type: 'client',
      source: 'numberlab-launch',
      sessionKind: 'numberlab',
      startedAt: now,
      client: {
        id: categoryId || 'numberlab-hub',
        name: sessionTitle
      },
      sessionUi: {
        mode: 'numberlab-workspace',
        title: sessionTitle,
        progressLabel: '카테고리',
        progressValue,
        progressPercent: showHub ? 0 : Math.min(100, Math.max(1, categoryIndex + 1) * 10),
        hideGlobalGnb: false,
        labScope: 'numberlab',
        restoreState: {
          showNumberLabHub: showHub,
          hubSelectedCategoryId: showHub ? '' : categoryId,
          hubActiveStageId: ''
        },
        showLabTabs: true,
        hideSessionSwitcher: false,
        renderHubLabSwitch: false
      }
    };
  };

  const restoreStatePair = (previousUser, previousPage) => {
    if (previousUser == null) {
      safeRemoveItem(localStorage, STORAGE_USER_KEY);
      safeRemoveItem(sessionStorage, STORAGE_USER_KEY);
    } else {
      safeSetItem(localStorage, STORAGE_USER_KEY, previousUser);
      safeSetItem(sessionStorage, STORAGE_USER_KEY, previousUser);
    }

    if (previousPage == null) {
      safeRemoveItem(localStorage, STORAGE_PAGE_KEY);
      safeRemoveItem(sessionStorage, STORAGE_PAGE_KEY);
    } else {
      safeSetItem(localStorage, STORAGE_PAGE_KEY, previousPage);
      safeSetItem(sessionStorage, STORAGE_PAGE_KEY, previousPage);
    }
  };

  const applyLaunchState = () => {
    const config = getConfig();
    const teacherState = buildTeacherState(config);
    const sessionState = buildSessionState(config);
    const pageState = teacherState ? {
      userId: teacherState.id,
      teacherId: teacherState.teacherId,
      view: 'session',
      currentSession: sessionState,
      dashboardState: {},
      savedAt: new Date().toISOString()
    } : null;

    const previousUser = safeSetItem.__previousUser ?? null;
    const previousPage = safeSetItem.__previousPage ?? null;

    if (teacherState) {
      safeSetItem(localStorage, STORAGE_USER_KEY, JSON.stringify(teacherState));
      safeSetItem(sessionStorage, STORAGE_USER_KEY, JSON.stringify(teacherState));
    }
    if (pageState) {
      safeSetItem(localStorage, STORAGE_PAGE_KEY, JSON.stringify(pageState));
      safeSetItem(sessionStorage, STORAGE_PAGE_KEY, JSON.stringify(pageState));
    }

    const url = new URL(window.location.href);
    url.searchParams.set('view', 'session');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

    const pageTitle = String(config.pageTitle || sessionState.client?.name || '숫자랩').trim();
    document.title = pageTitle;
    document.documentElement.dataset.numberlabLaunch = 'ready';
    document.documentElement.dataset.numberlabCategory = String(config.categoryId || '').trim();

    window.addEventListener('beforeunload', () => {
      restoreStatePair(previousUser, previousPage);
    }, { once: true });
  };

  const snapshotExistingState = () => {
    try {
      safeSetItem.__previousUser = localStorage.getItem(STORAGE_USER_KEY);
    } catch (error) {
      safeSetItem.__previousUser = null;
    }
    try {
      safeSetItem.__previousPage = sessionStorage.getItem(STORAGE_PAGE_KEY) ?? localStorage.getItem(STORAGE_PAGE_KEY);
    } catch (error) {
      safeSetItem.__previousPage = null;
    }
  };

  snapshotExistingState();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLaunchState, { once: true });
  } else {
    applyLaunchState();
  }
})();
