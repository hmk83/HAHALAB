window.appClients = [];
window.appSchedules = [];
window.addEventListener('beforeunload', (event) => {
    if (!window.__hahaLabUnstoredCompletions?.size && (!currentLabDirectOverlay?.__pendingCompletionRequest || !['error', 'saving'].includes(currentLabDirectOverlay.dataset.learningCompletionSaveState))) return;
    event.preventDefault(); event.returnValue = '';
});
window.appWorksheetCategories = [];
window.appWorksheets = [];
let sensitiveAppEpoch = 0;

window.clearSensitiveAppState = function () {
    sensitiveAppEpoch += 1;
    window.__hahaLabTransientHistoryRecords = [];
    window.__hahaLabShellViewState = null;
    window.__hahaLabLaunchContexts?.clear();
    window.__hahaLabTransientReports?.forEach((entry) => entry.channel?.close());
    window.__hahaLabTransientReports?.clear();
    currentDetailClientId = '';
    closeLabDirectTargetOverlay({ restoreShell: false });
    clearDetailRealtimeChannels();
    clearMessageRealtimeChannels();
    currentEditingClassId = null;
    currentClassModalClientId = '';
    pendingScheduleConflict = null;
    pendingScheduleEditRequest = null;
    currentLabClient = null;
    currentDetailData = buildEmptyDetailData();
    currentDetailDataLoadState = { status: 'idle', clientId: '', message: '' };
    for (const key of ['appClients', 'appSchedules', 'appMessages', 'appMessageReads', 'appWorksheetCategories', 'appWorksheets']) window[key] = [];
    window.__playlabTrendViews = {};
    window.__detailTrendViews = {};
    window.clearTimeout(detailRefreshTimer);
    window.clearTimeout(detailResetTimer);
    window.clearTimeout(currentClassOnboardingStartTimer);
    document.querySelectorAll('#detail-content-area input, #detail-content-area textarea').forEach((field) => { field.value = ''; });
    document.querySelectorAll('#sched-clients, #sched-reservations, #calendarMonthGrid, #calendarWeekColumns, #calendarDayColumns').forEach((node) => node.replaceChildren());
    const detail = document.getElementById('detail-content-area');
    if (detail) detail.style.display = 'none';
    const title = document.getElementById('detailMainTitle');
    if (title) title.textContent = '내담자 상세 정보';
    const profileName = document.getElementById('gnbProfileName');
    if (profileName) profileName.textContent = '로그인 필요';
    // Remove hidden private HTML as well; a subsequent sign-in rebuilds the shell.
    if (document.body?.classList.contains('auth-logged-in')) {
        document.getElementById('mainContainer')?.replaceChildren();
        window.__sensitiveAppCleared = true;
        document.body.classList.remove('auth-logged-in');
        document.body.classList.add('auth-logged-out');
    }
};

const LAB_SESSION_COMPLETION_ACTION = '게임 완료';
const LAB_REPORT_SCOPE_REHAB = 'rehab';
const LAB_REPORT_SCOPE_PLAYLAB = 'playlab';
const LAB_REPORT_SCOPE_NUMBERLAB = 'numberlab';
const LAB_REPORT_SCOPE_MUSICARTLAB = 'musicartlab';
const LAB_LAUNCHER_EXCLUDED_FILES = new Set([
    'playlab-content-viewer.html',
    'rehablab-content-viewer.html',
    'playlab-shape-piece-match.html',
    'rehablab-shape-piece-match.html',
    'test-h-evi.html'
]);
const LAB_LAUNCH_CONTEXT_STORAGE_PREFIX = 'haha_lab_direct_launch_';
const LAB_LEARNING_HARNESS_STORAGE_KEY = 'haha_lab_learning_harness_records_v1';
const LAB_LEARNING_HARNESS_SYNC_QUEUE_KEY = 'haha_lab_learning_harness_sync_queue_v1';
const LAB_EXIT_CONFIRM_MESSAGE = '학습을 종료하고 이전 화면으로 돌아가시겠습니까?';
const LAB_KIND_GUIDE_STORAGE_PREFIX = 'haha_lab_kind_guide_hidden_v1_';
const LAB_ANONYMOUS_GUIDE_STORAGE_KEY = 'haha_lab_anonymous_guide_hidden_v1';
const LAB_LAUNCHER_FAVORITES_STORAGE_KEY = 'haha_lab_launcher_favorites_v1';
const LAB_LAUNCHER_SEARCH_HISTORY_STORAGE_KEY = 'haha_lab_launcher_search_history_v1';
const LAB_LAUNCHER_SEEN_ITEMS_STORAGE_KEY = 'haha_lab_launcher_seen_items_v1';
const CLASS_ONBOARDING_STORAGE_PREFIX = 'haha_lab_class_onboarding_seen_v1_';
const CARD_DOWNLOAD_PROMO_DISMISSED_PREFIX = 'haha_lab_card_download_promo_dismissed_v1_';
const CARD_DOWNLOAD_PROMO_SESSION_KEY = 'haha_lab_card_download_promo_closed_session_v1';
const CARD_DOWNLOAD_PRINT_URL = 'cardlab-study-a4-sample.html';
const DETAIL_REPORT_MODE_STORAGE_KEY = 'haha_lab_detail_report_mode_v1';
const DETAIL_REPORT_MODE_BY_SUBTAB_STORAGE_KEY = 'haha_lab_detail_report_mode_by_subtab_v1';
const DETAIL_SUB_TAB_STORAGE_KEY = 'haha_lab_detail_sub_tab_v1';
const REPORT_DUAL_MODE_SAMPLE_QUERY_PARAM = 'sampleReports';
const REPORT_DUAL_MODE_SAMPLE_ID_PREFIX = 'sample-report-dual-mode-';
const WORKSHEET_STORAGE_FUNCTION = 'worksheet-r2-storage';
const OUTPUT_CENTER_ACCESS_POLICY = Object.freeze({
    requiresLogin: true,
    requiresPaid: false,
    scope: 'authenticated-free-output-center'
});
const PENDING_TEACHER_GRADE_STATUSES = new Set(['pending_teacher', 'pending']);
const PENDING_TEACHER_GRADE_MESSAGE = '대기 선생님 등급은 등록된 학생 리포트만 조회할 수 있습니다.';
const SHELL_VIEW_STORAGE_KEY = 'haha_lab_shell_view_state';
const SHELL_VIEW_QUERY_PARAM = 'view';
const SHELL_LAB_KIND_QUERY_PARAM = 'labKind';
const LAB_RETURN_KIND_STORAGE_KEY = 'haha_lab_return_lab_kind';
const LAB_RETURN_URL_STORAGE_KEY = 'haha_lab_last_lab_return_url';
const LAB_EXIT_MESSAGE_TYPE = 'HAHA_LAB_LEARNING_EXIT';
const CLASS_HISTORY_STATE_FLAG = 'hahaLabClassShell';
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAY_COLUMNS = ['월', '화', '수', '목', '금', '토', '일'];
const DETAIL_REPORT_LIMIT = 8;
const FORCE_START_CALENDAR_PARAM = 'calendar';
let forceCalendarStartRequested = false;

let isModalDirty = false;
let currentEditingClassId = null;
let currentClassModalMode = 'manual';
let currentClassModalClientId = '';
let currentClassModalSingleMode = false;
let currentDetailClientId = '';
let currentDetailActionStep = '';
let currentDetailActionDeleteFuture = false;
let currentDetailData = buildEmptyDetailData();
let currentDetailDataLoadState = { status: 'idle', clientId: '', message: '' };
let detailRealtimeChannels = [];
let detailRefreshTimer = null;
let detailResetTimer = null;
let myPageProfileEditMode = false;
let bottomToastTimer = null;
let currentCalendarDate = new Date();
let currentCalendarView = 'month';
let currentDetailSubTab = readStoredDetailSubTab();
let currentDetailReportMode = readStoredDetailReportModeForSubTab(currentDetailSubTab);
let currentDetailScheduleDate = new Date();
let calendarNowTimer = null;
let calendarDragItem = null;
let pendingScheduleConflict = null;
let pendingScheduleEditRequest = null;
let currentShellView = 'calendar';
let classHistoryGuardArmed = false;
let currentLabKind = 'cardlab';
let currentLabSubcategoryId = '';
let currentLabStageId = '';
let currentLabContentId = '';
let currentLabTabletDetailOpen = false;
let currentLabWordCardDetailOpen = false;
let currentLabWordCardSelectedId = '';
let currentLabWordCardGridMode = 'two';
let currentLabWordCardCategoryFilter = 'all';
let currentLabWordCardCategoryFilters = ['all'];
let currentLabWordCardTypeFilter = 'all';
let currentLabWordCardSearchTerm = '';
let currentLabWordCardLoading = false;
let currentLabWordCardLoaded = false;
let currentLabWordCardAssets = [];
let currentLabWordCardCategories = [];
let currentLabWordCardRealtimeChannels = [];
let currentLabWordCardRefreshTimer = null;
let currentLabLauncherLoaded = false;
let currentLabLauncherLoading = false;
let currentLabLauncherLoadingPromise = null;
let currentLabLauncherRealtimeChannel = null;
let currentLabClient = null;
let currentLabReturnView = 'detail';
let currentLabPageLoading = false;
let currentLabPageLoadingStartedAt = 0;
let currentLabPageLoadingTimer = null;
let currentLabDirectOverlay = null;
let currentLabDirectOverlayBodyOverflow = '';
let currentLabDirectOverlayHtmlOverflow = '';
let currentLabDirectOverlayBodyHeight = '';
let currentLabDirectOverlayHtmlHeight = '';
let currentLabDirectOverlayBodyMinHeight = '';
let currentLabDirectOverlayHtmlMinHeight = '';
let currentLabDirectOverlayCleanup = null;
let currentLabGuideKind = '';
let currentLabGuideStep = 0;
let currentLabAnonymousMode = false;
let currentLabUpdateItems = [];
let currentClassOnboardingActive = false;
let currentClassOnboardingStartedThisSession = false;
let currentClassOnboardingStep = 0;
let currentClassOnboardingStartTimer = null;
let currentClassOnboardingPendingSurface = '';
const currentLabSelectionByKind = {
    cardlab: '',
    numberlab: '',
    playlab: '',
    musicartlab: '',
    rehab: ''
};

function buildEmptyDetailData() {
    return {
        histories: [],
        cardlabAttempts: [],
        cardlabProgress: [],
        cardlabWrongStats: []
    };
}

function setCurrentDetailDataLoadState(status = 'idle', clientId = '', message = '') {
    currentDetailDataLoadState = {
        status,
        clientId: String(clientId || '').trim(),
        message: String(message || '').trim()
    };
}

const CLASS_ONBOARDING_STEPS = [
    {
        id: 'welcome',
        mode: 'center',
        kicker: 'WELCOME',
        title: '선생님을 위한 가장 완벽한 스마트 솔루션',
        body: '가벼운 준비, 차원이 다른 수업.\n수업과 교구 준비는 HAHA LAB에 맡기세요.',
        nextLabel: '다음'
    },
    {
        id: 'client-add',
        mode: 'target',
        target: 'client-add',
        kicker: 'STEP 1',
        title: '내담자를 추가해 보세요',
        body: '내담자를 추가하고 다양한 학습을 진행하세요.',
        nextLabel: '다음'
    },
    {
        id: 'schedule-add',
        mode: 'target',
        target: 'schedule-add',
        kicker: 'STEP 2',
        title: '일정을 바로 관리할 수 있어요',
        body: '내담자 스케줄을 추가하고 반복, 관리하세요.',
        nextLabel: '다음'
    },
    {
        id: 'anonymous-lab',
        mode: 'target',
        target: 'anonymous-lab',
        kicker: 'STEP 3',
        title: '내담자 없이도 바로 시작할 수 있어요',
        body: '내담자를 등록하지 않아도 LAB을 시작할 수 있어요.',
        nextLabel: 'LAB 바로 시작'
    },
    {
        id: 'lab-intro',
        mode: 'target',
        target: 'lab-tabs',
        surface: 'lab',
        kicker: 'LAB INTRO',
        title: 'HAHA LAB은 이렇게 구성되어 있어요',
        body: '필요한 영역의 랩을 바로 골라 수업 흐름에 맞게 활용하세요.',
        nextLabel: '최종 확인'
    }
];
const LAB_SORT_OPTIONS = [
    { id: 'adminDesc', label: '신규순' },
    { id: 'recent', label: '최근 학습순' },
    { id: 'frequent', label: '많이 학습순' },
    { id: 'adminAsc', label: '오래된순' }
];
const LAB_NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const LAB_ACTIVITY_MATCH_ALIASES = {
    'cardlab-study': ['card-shell-quiz', 'cardlab-study', '그림카드 이름 알기'],
    'cardlab-quiz': ['word-quiz', 'cardlab-quiz', '무엇일까요', '단어 퀴즈'],
    'cardlab-essential-word-spell': ['cardlab-essential-word-spell', 'essential-word-spell', '무엇일까요? 필수 단어 퀴즈', '필수 단어 퀴즈'],
    'cardlab-phonics': ['hangul-phonics', 'cardlab-phonics', '음운 인식', '글자 찾기'],
    'cardlab-zoo-sound': ['zoo-sound', 'cardlab-zoo-sound', '소리 듣고 동물 찾기'],
    'cardlab-jamo-combine': ['cardlab-jamo-combine', '글자 합쳐 낱말 만들기'],
    'cardlab-wordbuild': ['cardlab-wordbuild', '자음 모음 단어 만들기'],
    'cardlab-hangul-compose': ['hangul-assembly', 'cardlab-hangul-compose', '글자 바퀴 돌리기'],
    'cardlab-batchim': ['cardlab-batchim', '받침 소리 익히기'],
    'cardlab-josa': ['sentence-particle', 'cardlab-josa', '문장에 맞는 조사'],
    'cardlab-connective': ['connective-bridge', 'cardlab-connective', '문장 이어 주는 말'],
    'cardlab-cloze-connect': ['cardlab-cloze-connect', '빈칸에 말 넣기'],
    'cardlab-sentence': ['sentence-assembly', 'cardlab-sentence', '낱말 모아 문장 만들기'],
    'cardlab-association': ['association-chain', 'cardlab-association', '생각 이어 말 찾기'],
    'cardlab-synonym': ['meaning-pair', 'cardlab-synonym', '비슷한 말 다른 말'],
    'cardlab-synonym-compare': ['cardlab-synonym-compare', '비슷한 말 뜻 비교'],
    'cardlab-context': ['context-vocabulary', 'cardlab-context', '관계가 있는 말'],
    'cardlab-description-find': ['cardlab-description-find', '설명 듣고 단어 찾기'],
    'cardlab-idiom': ['idiom-cartoon', 'cardlab-idiom', '속담 이야기 찾기'],
    'cardlab-motion': ['cardlab-motion', '움직임 카드 이야기'],
    'cardlab-car-logo': ['car-logo', 'cardlab-car-logo', '자동차 마크 맞히기'],
    'cardlab-half-reveal': ['picture-word-find', 'cardlab-half-reveal', '반쪽 보고 맞히기'],
    'cardlab-emotion-mind': ['cardlab-emotion-mind', '어떤 감정인지 맞혀보세요'],
    'cardlab-time-dayparts': ['cardlab-time-dayparts', '하루 시간 배우기'],
    'cardlab-situation-sequence': ['cardlab-situation-sequence', '상황별 스크립트 순서 맞추기', '상황 스크립트 순서화'],
    'cardlab-whats-wrong': ['cardlab-whats-wrong', '어딘가 이상해요', '이상한 장면 찾기'],
    'cardlab-situation-ox': ['cardlab-situation-ox', '생각 쑥쑥 OX 모험']
};
const currentLabTagFiltersByKind = {
    cardlab: ['all'],
    numberlab: ['all'],
    playlab: ['all'],
    rehab: ['all']
};
const currentLabSearchByKind = {
    cardlab: '',
    numberlab: '',
    playlab: '',
    musicartlab: '',
    rehab: ''
};
const currentLabSortByKind = {
    cardlab: 'adminDesc',
    numberlab: 'adminDesc',
    playlab: 'adminDesc',
    musicartlab: 'adminDesc',
    rehab: 'adminDesc'
};
const currentLabFilterExpandedByKind = {
    cardlab: false,
    numberlab: false,
    playlab: false,
    musicartlab: false,
    rehab: false
};
const currentLabStageSelectionByCategory = {
    cardlab: {},
    numberlab: {},
    playlab: {},
    musicartlab: {},
    rehab: {}
};
let currentOutputCategoryId = '';
let currentOutputSearchTerm = '';
let currentOutputWorksheetId = '';
let currentOutputAssetSelection = [];
let currentOutputPreviewIndex = 0;
let currentOutputDetailOpen = false;
let outputDownloadLoading = false;
let outputAssetUrlCache = {};
let outputAssetUrlLoading = {};
let outputRealtimeChannels = [];
let outputRefreshTimer = null;
let outputLibraryLoading = false;
let outputFeatureMessage = '';
window.appMessageCategories = [];
window.appMessages = [];
window.appMessageReads = [];
let currentMessageCategoryId = '';
let currentExpandedMessageIds = new Set();
let messageLibraryLoading = false;
let messageFeatureMessage = '';
let messageRealtimeChannels = [];
let messageRefreshTimer = null;
let messageMarkingRead = false;
let appShellBootstrapped = false;

const CALENDAR_SLOT_HEIGHT = 56;
const CALENDAR_DRAG_SNAP_MINUTES = 10;
const SCHEDULE_START_TIME = '08:00';
const SCHEDULE_END_TIME = '22:00';
const SCHEDULE_START_MINUTES = 8 * 60;
const SCHEDULE_END_MINUTES = 22 * 60;
const PLAYLAB_REPORT_ENGINE_URL = './playlab/playlab-report-engine.js?v=20261104-observation-opinion-1';
const HEVI_ASSESSMENT_PUBLIC_URL = './playlab/test-h-evi.html';
const HEVI_ASSESSMENT_FILE_URL = './private/playlab/test-h-evi.html';
const HEVI_REPORT_STORAGE_PREFIX = 'h_evi_history_report_';
let playlabReportEnginePromise = null;

function getHeviAssessmentUrl() {
    if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
        return HEVI_ASSESSMENT_FILE_URL;
    }
    return HEVI_ASSESSMENT_PUBLIC_URL;
}

function ensurePlaylabReportEngineLoaded() {
    if (window.PlaylabReportEngine) return Promise.resolve(window.PlaylabReportEngine);
    if (playlabReportEnginePromise) return playlabReportEnginePromise;

    playlabReportEnginePromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-playlab-report-engine="true"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.PlaylabReportEngine), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('PLAYLAB_REPORT_ENGINE_LOAD_FAILED')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = PLAYLAB_REPORT_ENGINE_URL;
        script.charset = 'utf-8';
        script.async = true;
        script.dataset.playlabReportEngine = 'true';
        script.onload = () => resolve(window.PlaylabReportEngine);
        script.onerror = () => reject(new Error('PLAYLAB_REPORT_ENGINE_LOAD_FAILED'));
        document.body.appendChild(script);
    }).catch((error) => {
        playlabReportEnginePromise = null;
        throw error;
    });

    return playlabReportEnginePromise;
}

const toCamel = (str) => str.replace(/([-_][a-z])/ig, (chunk) => chunk.toUpperCase().replace('-', '').replace('_', ''));

function keysToCamel(value) {
    if (Array.isArray(value)) return value.map(keysToCamel);
    if (value && value === Object(value) && typeof value !== 'function') {
        const normalized = {};
        Object.keys(value).forEach((key) => {
            normalized[toCamel(key)] = keysToCamel(value[key]);
        });
        return normalized;
    }
    return value;
}

function parseMaybeJson(value, fallback = {}) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return fallback;
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_error) {
        return fallback;
    }
}

function readLocalLearningHarnessRecords() {
    try {
        if (Array.isArray(window.__hahaLabTransientHistoryRecords)) return window.__hahaLabTransientHistoryRecords;
        const parsed = parseMaybeJson(localStorage.getItem(LAB_LEARNING_HARNESS_STORAGE_KEY), []);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function shouldSeedReportDualModeSamples() {
    try {
        const params = new URLSearchParams(window.location.search || '');
        return params.get(REPORT_DUAL_MODE_SAMPLE_QUERY_PARAM) === 'dual' || params.get('reportSamples') === 'dual';
    } catch (_error) {
        return false;
    }
}

function buildReportDualModeSampleHistory(id, details = {}, metadata = {}) {
    const completedAt = details.completed_at || details.completedAt || new Date().toISOString();
    return {
        id: `${REPORT_DUAL_MODE_SAMPLE_ID_PREFIX}${id}`,
        clientId: 'local-client',
        actionType: LAB_SESSION_COMPLETION_ACTION,
        memo: details.report_title || details.reportTitle || details.lab_title || details.labTitle || '샘플 리포트',
        createdAt: completedAt,
        playedAt: completedAt,
        details: {
            completed_at: completedAt,
            ...details
        },
        metadata: {
            saved_by: 'local-sample',
            ...metadata
        }
    };
}

function clearReportDualModeSampleRecords() {
    try {
        const currentRecords = readLocalLearningHarnessRecords();
        const filteredRecords = currentRecords
            .filter((record) => !String(record?.id || record?.history?.id || record?.cardlabAttempt?.id || '').startsWith(REPORT_DUAL_MODE_SAMPLE_ID_PREFIX));
        if (filteredRecords.length !== currentRecords.length) {
            localStorage.setItem(LAB_LEARNING_HARNESS_STORAGE_KEY, JSON.stringify(filteredRecords));
        }
    } catch (error) {
        console.warn('[ReportDualMode] sample cleanup failed:', error);
    }
}

function seedReportDualModeSampleRecords() {
    if (!shouldSeedReportDualModeSamples()) {
        clearReportDualModeSampleRecords();
        return;
    }
    try {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const isoDaysAgo = (days) => new Date(now - (days * day)).toISOString();
        const currentRecords = readLocalLearningHarnessRecords()
            .filter((record) => !String(record?.id || record?.history?.id || record?.cardlabAttempt?.id || '').startsWith(REPORT_DUAL_MODE_SAMPLE_ID_PREFIX));

        const sampleRecords = [
            {
                id: `${REPORT_DUAL_MODE_SAMPLE_ID_PREFIX}playlab-legacy`,
                history: buildReportDualModeSampleHistory('playlab-legacy', {
                    report_scope: LAB_REPORT_SCOPE_PLAYLAB,
                    lab_scope: LAB_REPORT_SCOPE_PLAYLAB,
                    lab_label: '플레이랩',
                    lab_title: '순차 기억 과제',
                    report_title: '순차 기억 반응 리포트',
                    score: 82,
                    accuracy_score: 76,
                    correct_count: 19,
                    wrong_count: 6,
                    total_questions: 25,
                    duration_minutes: 18,
                    completed_at: isoDaysAgo(1),
                    report_brief_opinion: '전문가 분석 기준으로 순차 기억 유지와 반응 전환 안정성이 함께 관찰됩니다.',
                    report_overview: '최근 수행은 오류 후 재시도 시간이 짧아졌고, 단서가 있을 때 유지 반응이 안정적입니다.',
                    report_recommendations: ['난이도 조정은 다음 회기 시작 전 선생님이 컨디션과 과제 반응을 함께 확인한 뒤 결정합니다.'],
                    report_focus_label: '작업기억',
                    report_integrated_score: 82,
                    report_cognitive_score: 79,
                    report_reaction_score: 74
                })
            },
            {
                id: `${REPORT_DUAL_MODE_SAMPLE_ID_PREFIX}numberlab-new`,
                history: buildReportDualModeSampleHistory('numberlab-new', {
                    report_scope: LAB_REPORT_SCOPE_NUMBERLAB,
                    lab_scope: LAB_REPORT_SCOPE_NUMBERLAB,
                    lab_label: '넘버랩',
                    lab_title: '수 배열 찾기',
                    report_title: '수 배열 주의집중 리포트',
                    score: 78,
                    accuracy_score: 71,
                    correct_count: 15,
                    wrong_count: 5,
                    total_questions: 20,
                    duration_minutes: 14,
                    completed_at: isoDaysAgo(3),
                    report_guardian_summary: '수 배열 활동에서 끝까지 확인하려는 태도가 보였고, 중간에 멈췄을 때 선생님 안내를 듣고 다시 이어갔습니다.',
                    report_teacher_review_note: '시각 탐색 속도보다 확인 순서 유지가 주요 관찰 포인트입니다.',
                    report_action_plan_summary: '다음 활동은 자동 확정하지 않고, 당일 컨디션과 반응을 본 뒤 선생님이 범위를 조정합니다.',
                    report_brief_opinion: '전문가 분석 기준으로 시각 탐색 과정에서 순서 유지 부담이 일부 관찰됩니다.',
                    report_focus_label: '시각 탐색',
                    report_integrated_score: 78,
                    report_cognitive_score: 75,
                    report_reaction_score: 70
                })
            },
            {
                id: `${REPORT_DUAL_MODE_SAMPLE_ID_PREFIX}rehab-legacy`,
                history: buildReportDualModeSampleHistory('rehab-legacy', {
                    report_scope: LAB_REPORT_SCOPE_REHAB,
                    lab_scope: LAB_REPORT_SCOPE_REHAB,
                    lab_label: '재활랩',
                    lab_title: '반응 억제 과제',
                    report_title: '반응 억제 관찰 리포트',
                    score: 74,
                    accuracy_score: 68,
                    correct_count: 17,
                    wrong_count: 8,
                    total_questions: 25,
                    duration_minutes: 16,
                    completed_at: isoDaysAgo(5),
                    report_brief_opinion: '전문가 분석 기준으로 충동 반응 후 재정렬 시간이 길어지는 구간이 확인됩니다.',
                    report_overview: '오답 직후의 회복 반응과 선생님 단서 수용 정도를 함께 추적할 필요가 있습니다.',
                    report_recommendations: ['보호자 공유 시에는 수치보다 활동 중 보인 조절 시도와 교사의 관찰 설명을 우선 전달합니다.'],
                    report_focus_label: '반응 억제',
                    report_integrated_score: 74,
                    report_cognitive_score: 72,
                    report_reaction_score: 67
                })
            },
            {
                id: `${REPORT_DUAL_MODE_SAMPLE_ID_PREFIX}hevi-assessment`,
                history: buildReportDualModeSampleHistory('hevi-assessment', {
                    report_scope: 'assessment',
                    lab_scope: 'assessment',
                    lab_label: 'H-EVI',
                    lab_title: '표현 어휘력 평가',
                    report_title: 'H-EVI 표현 어휘 관찰 리포트',
                    score: 86,
                    duration_minutes: 12,
                    completed_at: isoDaysAgo(2),
                    h_evi_report: {
                        mode: 'diagnosis',
                        age: '만 6세',
                        standardScore: 86,
                        accuracy: 0.72,
                        percentile: 18,
                        band: { label: '추가 관찰' },
                        correct: 18,
                        wrong: 7,
                        total: 25,
                        answered: 25,
                        recommendation: '표현 어휘 인출 과정에서 의미 단서 제공 후 반응 회복을 함께 관찰합니다.'
                    },
                    report_guardian_summary: '표현 어휘 활동에서 알고 있는 단어를 바로 말하기보다, 선생님 단서를 듣고 떠올리는 모습이 함께 보였습니다.',
                    report_teacher_review_note: '명명 실패 단어와 의미 단서 후 회복 단어를 분리해 다음 회기에서 확인합니다.',
                    report_action_plan_summary: '다음 검사나 학습은 자동 배정하지 않고, 선생님이 실제 반응과 보호자 관찰 내용을 함께 검토합니다.'
                })
            },
            {
                id: `${REPORT_DUAL_MODE_SAMPLE_ID_PREFIX}cardlab-attempt`,
                cardlabAttempt: {
                    id: `${REPORT_DUAL_MODE_SAMPLE_ID_PREFIX}cardlab-attempt`,
                    clientId: 'local-client',
                    curriculumKey: 'context-vocabulary',
                    stageKey: 'sample-context-vocabulary',
                    stageTitle: '문맥 어휘 이해',
                    completedAt: isoDaysAgo(4),
                    score: 80,
                    correctCount: 8,
                    wrongCount: 2,
                    totalQuestions: 10,
                    durationSeconds: 360,
                    cleared: true,
                    reportGuardianSummary: '카드 문맥 활동에서 정답을 바로 고르기보다 문장을 다시 확인한 뒤 선택하는 모습이 보였습니다.',
                    reportTeacherReviewNote: '오답 카드는 어휘 자체보다 문장 속 단서 확인 과정에서 흔들림이 있었습니다.',
                    reportActionPlanSummary: '다음 카드 활동은 자동 진행하지 않고, 선생님이 오답 카드를 먼저 확인한 뒤 조정합니다.'
                }
            }
        ];

        localStorage.setItem(LAB_LEARNING_HARNESS_STORAGE_KEY, JSON.stringify([...sampleRecords, ...currentRecords]));
        const storedReportMode = String(localStorage.getItem(DETAIL_REPORT_MODE_STORAGE_KEY) || '').trim();
        if (storedReportMode === 'guardian' || storedReportMode === 'teacher') {
            currentDetailReportMode = storedReportMode;
        } else {
            localStorage.setItem(DETAIL_REPORT_MODE_STORAGE_KEY, 'guardian');
            currentDetailReportMode = 'guardian';
        }
        window.__hahaLabReportDualModeSamplesSeeded = true;
    } catch (error) {
        console.warn('[ReportDualMode] sample seed failed:', error);
    }
}

function isLocalHarnessRecordForClient(record, clientId) {
    const targetId = String(clientId || '').trim();
    const recordClientId = String(record?.clientId || record?.client_id || record?.history?.clientId || record?.history?.client_id || '').trim();
    if (!targetId) return true;
    if (recordClientId === targetId) return true;
    // Sample rows are intentionally available only in the explicit dual-mode
    // fixture.  Unscoped/local-client records must never leak into a real
    // client's report when switching clients or teacher accounts.
    return shouldSeedReportDualModeSamples() && recordClientId === 'local-client';
}

function mergeRowsById(primaryRows = [], localRows = []) {
    const seen = new Set();
    return [...localRows, ...primaryRows].filter((row) => {
        const id = String(row?.id || '').trim() || JSON.stringify(row);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

function buildLocalCardlabProgress(attempts = []) {
    const grouped = new Map();
    attempts.forEach((attempt) => {
        const key = String(attempt.stageKey || attempt.stage_key || '').trim();
        if (!key) return;
        const current = grouped.get(key) || {
            id: `local-progress-${key}`,
            clientId: attempt.clientId || attempt.client_id || 'local-client',
            curriculumKey: attempt.curriculumKey || attempt.curriculum_key || '',
            stageKey: key,
            stageTitle: attempt.stageTitle || attempt.stage_title || key,
            cleared: false,
            score: 0,
            completedAt: attempt.completedAt || attempt.completed_at || ''
        };
        current.cleared = current.cleared || attempt.cleared === true;
        current.score = Math.max(Number(current.score || 0), Number(attempt.score || 0) || 0);
        current.completedAt = attempt.completedAt || attempt.completed_at || current.completedAt;
        grouped.set(key, current);
    });
    return [...grouped.values()];
}

function getVerifiedLocalRemoteHistoryId(record = {}) {
    const details = parseMaybeJson(record.history?.details, {});
    const sessionId = String(details.session_id || details.sessionId || '').trim();
    const aliasesAgree = !(details.session_id && details.sessionId)
        || String(details.session_id).trim() === String(details.sessionId).trim();
    return record.remotePayloadVerified === true
        && ['committed', 'already_committed'].includes(record.remoteSyncStatus)
        && typeof record.remoteHistoryId === 'string' && record.remoteHistoryId.trim()
        && sessionId && aliasesAgree && record.remoteSessionId === sessionId
        ? record.remoteHistoryId : '';
}

function buildLocalLearningHarnessData(clientId, options = {}) {
    const teacherId = typeof getCurrentTeacherId === 'function' ? getCurrentTeacherId() : '';
    const records = readLocalLearningHarnessRecords().filter((record) => {
        if (!isLocalHarnessRecordForClient(record, clientId)) return false;
        const sourceTeacher = String(record.history?.teacher_id || record.history?.teacherId || '').trim();
        return !teacherId || !sourceTeacher || sourceTeacher === teacherId;
    });
    const histories = records.map((record) => {
        const history = record.history;
        if (!history) return null;
        const remoteHistoryId = getVerifiedLocalRemoteHistoryId(record);
        // A receipt links this exact saved payload to a real database ID. Never
        // infer a link from a reused session ID, and never rewrite the raw record.
        return keysToCamel(remoteHistoryId ? { ...history, id: remoteHistoryId } : history);
    }).filter(Boolean);
    const cardlabAttempts = records
        .filter((record) => !(options.remoteCardlabAttemptsAvailable && getVerifiedLocalRemoteHistoryId(record)))
        .map((record) => record.cardlabAttempt)
        .filter(Boolean)
        .map(keysToCamel);
    return {
        histories,
        cardlabAttempts,
        cardlabProgress: buildLocalCardlabProgress(cardlabAttempts),
        cardlabWrongStats: []
    };
}

function mergeSupplementalWithLocal(baseData, clientId) {
    const localData = buildLocalLearningHarnessData(clientId, { remoteCardlabAttemptsAvailable: baseData.remoteCardlabAttemptsAvailable === true });
    return {
        // Server rows carry the authoritative representative and storage count.
        histories: mergeRowsById(localData.histories || [], baseData.histories || []),
        cardlabAttempts: mergeRowsById(baseData.cardlabAttempts || [], localData.cardlabAttempts || []),
        cardlabProgress: mergeRowsById(baseData.cardlabProgress || [], localData.cardlabProgress || []),
        cardlabWrongStats: mergeRowsById(baseData.cardlabWrongStats || [], localData.cardlabWrongStats || [])
    };
}

function readLocalLearningHarnessSyncQueue() {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(LAB_LEARNING_HARNESS_SYNC_QUEUE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function writeLocalLearningHarnessSyncQueue(queue) {
    try {
        window.localStorage.setItem(LAB_LEARNING_HARNESS_SYNC_QUEUE_KEY, JSON.stringify((Array.isArray(queue) ? queue : []).slice(-240)));
    } catch (_error) {}
}

async function flushLocalLearningHarnessSyncQueue() {
    const harness = window.HahaLabLearningHarness;
    if (!harness || typeof harness.flushSyncQueue !== 'function') {
        return { skipped: true, reason: 'learning-harness-unavailable', pending: readLocalLearningHarnessSyncQueue().length };
    }
    // The shared atomic RPC producer owns retries and in-flight joins. A missing
    // producer leaves the queue intact; never fall back to separate INSERTs.
    return harness.flushSyncQueue();
}

function clonePersistableState(value) {
    if (value == null) return value;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch (_error) {
        if (Array.isArray(value)) return value.slice();
        if (typeof value === 'object') return { ...value };
        return value;
    }
}

function readPersistedShellViewState() {
    try {
        const raw = localStorage.getItem(SHELL_VIEW_STORAGE_KEY);
        const preferences = raw ? JSON.parse(raw) : {};
        return { ...preferences, ...(window.__hahaLabShellViewState || {}) };
    } catch (_error) {
        return null;
    }
}

function detectForceCalendarStart() {
    try {
        const params = new URLSearchParams(window.location.search || '');
        return String(params.get('start') || '').trim().toLowerCase() === FORCE_START_CALENDAR_PARAM;
    } catch (_error) {
        return false;
    }
}

function getNavigationEntryType() {
    try {
        const entry = performance.getEntriesByType?.('navigation')?.[0];
        return String(entry?.type || '').trim().toLowerCase();
    } catch (_error) {
        return '';
    }
}

function shouldStartCalendarOnFreshEntry() {
    const navigationType = getNavigationEntryType();
    return navigationType !== 'reload';
}

function normalizeShellView(view = 'calendar') {
    const normalized = String(view || '').trim().toLowerCase();
    return ['calendar', 'detail', 'output', 'message', 'lab'].includes(normalized) ? normalized : 'calendar';
}

function normalizeLabKind(kind = 'cardlab') {
    const normalized = String(kind || '').trim().toLowerCase();
    if (['number', 'numberlab', 'time', 'timelab'].includes(normalized)) return 'numberlab';
    if (['play', 'playlab'].includes(normalized)) return 'playlab';
    if (['music', 'art', 'musicart', 'musicartlab', 'music-art-lab', 'music_art_lab', '뮤직아트랩'].includes(normalized)) return 'musicartlab';
    if (['rehab', 'rehablab'].includes(normalized)) return 'rehab';
    return 'cardlab';
}

function readShellViewFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search || '');
        const rawView = String(params.get(SHELL_VIEW_QUERY_PARAM) || '').trim().toLowerCase();
        return rawView ? normalizeShellView(rawView) : '';
    } catch (_error) {
        return '';
    }
}

function readLabKindFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search || '');
        const rawKind = String(params.get(SHELL_LAB_KIND_QUERY_PARAM) || params.get('lab') || '').trim();
        return rawKind ? normalizeLabKind(rawKind) : '';
    } catch (_error) {
        return '';
    }
}

function consumeReturnedLabKind() {
    const fromUrl = readLabKindFromUrl();
    if (fromUrl) {
        try {
            sessionStorage.removeItem(LAB_RETURN_KIND_STORAGE_KEY);
        } catch (_error) {
            // noop
        }
        return fromUrl;
    }
    try {
        const stored = String(sessionStorage.getItem(LAB_RETURN_KIND_STORAGE_KEY) || '').trim();
        if (stored) {
            sessionStorage.removeItem(LAB_RETURN_KIND_STORAGE_KEY);
            return normalizeLabKind(stored);
        }
    } catch (_error) {
        // noop
    }
    return '';
}

function syncShellViewUrl(view = 'calendar') {
    if (typeof window === 'undefined' || typeof window.history?.replaceState !== 'function') return;
    try {
        const normalizedView = normalizeShellView(view);
        const url = new URL(window.location.href);
        if (normalizedView === 'calendar') {
            url.searchParams.delete(SHELL_VIEW_QUERY_PARAM);
        } else {
            url.searchParams.set(SHELL_VIEW_QUERY_PARAM, normalizedView);
        }
        if (normalizedView === 'lab') {
            url.searchParams.set(SHELL_LAB_KIND_QUERY_PARAM, normalizeLabKind(currentLabKind || 'cardlab'));
        } else {
            url.searchParams.delete(SHELL_LAB_KIND_QUERY_PARAM);
            url.searchParams.delete('lab');
        }
        const nextPath = `${url.pathname}${url.search}${url.hash}`;
        window.history.replaceState(window.history.state || null, '', nextPath);
    } catch (_error) {
        // noop
    }
}

function getClassHistoryState(extra = {}) {
    return {
        ...(window.history?.state && typeof window.history.state === 'object' ? window.history.state : {}),
        [CLASS_HISTORY_STATE_FLAG]: true,
        view: currentShellView || 'calendar',
        ...extra
    };
}

function pushClassHistoryGuard() {
    if (typeof window === 'undefined' || typeof window.history?.pushState !== 'function') return;
    try {
        window.history.pushState(getClassHistoryState({ guard: true }), '', `${window.location.pathname}${window.location.search}${window.location.hash}`);
        classHistoryGuardArmed = true;
    } catch (_error) {
        classHistoryGuardArmed = false;
    }
}

function armClassHistoryGuard() {
    if (typeof window === 'undefined' || typeof window.history?.replaceState !== 'function') return;
    try {
        window.history.replaceState(getClassHistoryState({ root: true }), '', `${window.location.pathname}${window.location.search}${window.location.hash}`);
        if (!classHistoryGuardArmed) pushClassHistoryGuard();
    } catch (_error) {
        classHistoryGuardArmed = false;
    }
}

function handleClassBrowserBack(event) {
    const state = event?.state || {};
    if (!state?.[CLASS_HISTORY_STATE_FLAG]) return;

    if (currentLabDirectOverlay) {
        closeLabDirectTargetOverlay();
        pushClassHistoryGuard();
        return;
    }

    if (currentShellView === 'lab') {
        closeLabCenter();
        pushClassHistoryGuard();
        return;
    }

    if (currentShellView === 'detail') {
        goToList();
        pushClassHistoryGuard();
        return;
    }

    if (currentShellView === 'output' || currentShellView === 'message') {
        updateShellViewState('calendar');
        renderCalendar();
        pushClassHistoryGuard();
        return;
    }

    classHistoryGuardArmed = false;
}

function shouldForceCalendarStart() {
    return forceCalendarStartRequested === true;
}

function removeForceCalendarStartParamFromUrl() {
    if (typeof window === 'undefined' || typeof window.history?.replaceState !== 'function') return;
    try {
        const url = new URL(window.location.href);
        if (String(url.searchParams.get('start') || '').trim().toLowerCase() !== FORCE_START_CALENDAR_PARAM) return;
        url.searchParams.delete('start');
        const nextPath = `${url.pathname}${url.search}${url.hash}`;
        window.history.replaceState(window.history.state || null, '', nextPath);
    } catch (_error) {
        // noop
    }
}

function clearForceCalendarStartRequest() {
    forceCalendarStartRequested = false;
    removeForceCalendarStartParamFromUrl();
}

function normalizeCalendarView(view = 'month') {
    const normalized = String(view || '').trim().toLowerCase();
    return ['month', 'week', 'day'].includes(normalized) ? normalized : 'month';
}

function formatCalendarStorageDate(date = new Date()) {
    const candidate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(candidate.getTime())) return '';
    const year = candidate.getFullYear();
    const month = String(candidate.getMonth() + 1).padStart(2, '0');
    const day = String(candidate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseCalendarStorageDate(value = '') {
    const text = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
    const [yearText, monthText, dayText] = text.split('-');
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;
    const day = Number(dayText);
    const parsed = new Date(year, monthIndex, day);
    if (Number.isNaN(parsed.getTime())) return null;
    if (parsed.getFullYear() !== year || parsed.getMonth() !== monthIndex || parsed.getDate() !== day) return null;
    return parsed;
}

function getVisibleDetailSubTabButtons() {
    return Array.from(document.querySelectorAll('.sub-tab-btn')).filter((button) => button.style.display !== 'none');
}

function normalizeDetailReportMode(mode = '') {
    const normalizer = window.HahaLabReportDualMode?.normalizeMode;
    if (typeof normalizer === 'function') {
        const normalizedByPolicy = normalizer(mode);
        if (normalizedByPolicy === 'guardian' || normalizedByPolicy === 'teacher') return normalizedByPolicy;
    }
    const normalized = String(mode || '').trim().toLowerCase();
    if (['guardian', 'parent', 'family', 'caregiver'].includes(normalized)) return 'guardian';
    if (['teacher', 'professional', 'clinician', 'institution'].includes(normalized)) return 'teacher';
    return 'teacher';
}

function readStoredDetailReportMode() {
    try {
        return normalizeDetailReportMode(window.localStorage?.getItem(DETAIL_REPORT_MODE_STORAGE_KEY));
    } catch (_error) {
        return 'teacher';
    }
}

function readStoredDetailReportModeForSubTab(subtarget = currentDetailSubTab) {
    const normalizedSubtarget = normalizeDetailSubTab(subtarget);
    try {
        const parsed = JSON.parse(window.localStorage?.getItem(DETAIL_REPORT_MODE_BY_SUBTAB_STORAGE_KEY) || '{}');
        const stored = parsed && typeof parsed === 'object' ? parsed[normalizedSubtarget] : '';
        if (stored) return normalizeDetailReportMode(stored);
    } catch (_error) {}
    // 재활랩은 전체 차트·전문 분야 통합 소견·날짜별 원기록이 기본 화면이다.
    if (normalizedSubtarget === 'sub-rehab') return 'teacher';
    return readStoredDetailReportMode();
}

function writeStoredDetailReportMode(mode) {
    try {
        window.localStorage?.setItem(DETAIL_REPORT_MODE_STORAGE_KEY, normalizeDetailReportMode(mode));
    } catch (_error) {}
}

function writeStoredDetailReportModeForSubTab(subtarget = currentDetailSubTab, mode = currentDetailReportMode) {
    const normalizedSubtarget = normalizeDetailSubTab(subtarget);
    const normalizedMode = normalizeDetailReportMode(mode);
    try {
        const parsed = JSON.parse(window.localStorage?.getItem(DETAIL_REPORT_MODE_BY_SUBTAB_STORAGE_KEY) || '{}');
        const next = parsed && typeof parsed === 'object' ? { ...parsed } : {};
        next[normalizedSubtarget] = normalizedMode;
        window.localStorage?.setItem(DETAIL_REPORT_MODE_BY_SUBTAB_STORAGE_KEY, JSON.stringify(next));
    } catch (_error) {}
    writeStoredDetailReportMode(normalizedMode);
}

function normalizeDetailSubTab(subtarget = '') {
    const normalized = String(subtarget || '').trim();
    return ['sub-info', 'sub-schedule', 'sub-cardlab', 'sub-numlab', 'sub-playlab', 'sub-musicartlab', 'sub-rehab', 'sub-assessment'].includes(normalized)
        ? normalized
        : 'sub-info';
}

function readStoredDetailSubTab() {
    try {
        return normalizeDetailSubTab(window.localStorage?.getItem(DETAIL_SUB_TAB_STORAGE_KEY));
    } catch (_error) {
        return 'sub-info';
    }
}

function writeStoredDetailSubTab(subtarget = currentDetailSubTab) {
    try {
        window.localStorage?.setItem(DETAIL_SUB_TAB_STORAGE_KEY, normalizeDetailSubTab(subtarget));
    } catch (_error) {}
}

function isDetailReportSubTab(subtarget = currentDetailSubTab) {
    return ['sub-cardlab', 'sub-numlab', 'sub-playlab', 'sub-musicartlab', 'sub-rehab', 'sub-assessment'].includes(String(subtarget || '').trim());
}

function getDetailReportModeCopy(mode = currentDetailReportMode) {
    const normalized = normalizeDetailReportMode(mode);
    const policyConfig = window.HahaLabReportDualMode?.getReportModeConfig?.(normalized);
    if (normalized === 'guardian') {
        return {
            kicker: 'GUARDIAN SHARE',
            title: policyConfig?.label || '보호자 공유 모드',
            description: '보호자에게 공유하기 쉬운 요약만 보여주고, 진단·치료 확정처럼 읽히는 표현과 과도한 세부 지표는 줄입니다.'
        };
    }
    return {
        kicker: 'PROFESSIONAL ANALYSIS',
        title: policyConfig?.label || '전문가 분석 모드',
        description: '선생님 검토를 위해 수행 지표, 오류 유형, 반응 패턴, 조정 후보를 자세히 보여줍니다.'
    };
}

function getDetailReportModeDisclaimers(mode = currentDetailReportMode) {
    const builder = window.HahaLabReportDualMode?.buildReportDisclaimer;
    if (typeof builder === 'function') return builder(normalizeDetailReportMode(mode));
    return [
        '본 리포트는 학습 수행 기록을 바탕으로 한 관찰 자료이며, 진단이나 치료 효과 판정이 아닙니다.',
        '활동 조정은 내담자의 컨디션, 수업 맥락, 선생님의 전문 판단을 함께 고려해 결정합니다.'
    ];
}

function buildReportStorageGroupingSummary(rows = []) {
    let storedRows = 0;
    let groupedRows = 0;
    let unverifiedRows = 0;
    (Array.isArray(rows) ? rows : []).forEach((row) => {
        const value = row?.reportStorageCopyCount ?? row?.report_storage_copy_count;
        const count = typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value)) ? Number(value) : NaN;
        if (!Number.isSafeInteger(count) || count < 1 || !Number.isSafeInteger(storedRows + count)) {
            unverifiedRows += 1;
            return;
        }
        storedRows += count;
        groupedRows += 1;
    });
    return { storedRows: unverifiedRows ? null : storedRows, verifiedStoredRows: storedRows, groupedRows, unverifiedRows };
}

function renderReportStorageGroupingNotice(scopeLabel = '리포트') {
    const scopes = { '카드랩': 'cardlab', '숫자랩': LAB_REPORT_SCOPE_NUMBERLAB, '플레이랩': LAB_REPORT_SCOPE_PLAYLAB, '뮤직아트랩': LAB_REPORT_SCOPE_MUSICARTLAB, '재활랩': LAB_REPORT_SCOPE_REHAB };
    const sourceRows = Array.isArray(currentDetailData?.histories) ? currentDetailData.histories : [];
    const rows = scopes[scopeLabel]
        ? sourceRows.filter((row) => inferLabReportScopeFromHistoryRow(row) === scopes[scopeLabel])
        : scopeLabel === '검사 · 척도' ? sourceRows.filter(isHeviHistoryRow) : sourceRows;
    const summary = buildReportStorageGroupingSummary(rows);
    const storedLabel = summary.storedRows === null ? '저장행 수 미확인' : `저장행 ${summary.storedRows.toLocaleString('ko-KR')}개`;
    return `<div class="detail-report-mode-notice detail-report-storage-notice" role="note" data-storage-row-count="${summary.storedRows === null ? 'unknown' : summary.storedRows}" data-storage-group-count="${summary.groupedRows}" data-storage-unverified-row-count="${summary.unverifiedRows}"><div style="grid-column:1/-1"><strong>${storedLabel} / 동일내용 묶음 ${summary.groupedRows.toLocaleString('ko-KR')}개</strong><span>전체 내용이 동일한 저장행을 묶어 표시하며 원본은 보존합니다. 과거 재시행 여부는 구분할 수 없습니다.${summary.unverifiedRows ? ` 서버 저장 수가 확인되지 않은 표시 기록 ${summary.unverifiedRows.toLocaleString('ko-KR')}개는 저장행 수에 추정 합산하지 않습니다.` : ''}</span></div></div>`;
}

function renderDetailReportModeNotice(scopeLabel = '리포트') {
    const mode = normalizeDetailReportMode(currentDetailReportMode);
    const storageNotice = typeof renderReportStorageGroupingNotice === 'function' ? renderReportStorageGroupingNotice(scopeLabel) : '';
    if (mode === 'guardian') return storageNotice;
    const copy = getDetailReportModeCopy(mode);
    const disclaimers = getDetailReportModeDisclaimers(mode);
    return `
        <div class="detail-report-mode-notice ${mode === 'guardian' ? 'is-guardian' : 'is-teacher'}">
            <div>
                <p class="detail-report-mode-kicker">${escapeHtml(copy.kicker)}</p>
                <strong>${escapeHtml(scopeLabel)} · ${escapeHtml(copy.title)}</strong>
                <span>${escapeHtml(copy.description)}</span>
            </div>
            <ul>
                ${disclaimers.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
        </div>${storageNotice}
    `;
}

function renderDetailReportPrintHeader(scopeLabel = '리포트') {
    const client = getCurrentDetailClient();
    const clientName = String(client?.name || document.getElementById('detailMainTitle')?.textContent || '내담자').replace(/\s+/g, ' ').trim();
    const modeLabel = normalizeDetailReportMode(currentDetailReportMode) === 'guardian' ? '보호자 공유 요약' : '전문가 분석 리포트';
    const generatedAt = formatDateTimeDisplay(new Date());
    return `
        <div class="detail-report-print-header">
            <div>
                <p>HAHA LAB REPORT</p>
                <h2>${escapeHtml(clientName)} · ${escapeHtml(scopeLabel)}</h2>
                <span>${escapeHtml(modeLabel)} · ${escapeHtml(generatedAt)}</span>
            </div>
            <strong>학습 수행 기록 기반 관찰 자료</strong>
        </div>
    `;
}

function renderGuardianShareChecklist(scopeLabel = '리포트') {
    return '';
}

function buildDetailReportHelpModalContent(scopeLabel = '리포트') {
    const mode = normalizeDetailReportMode(currentDetailReportMode);
    const copy = getDetailReportModeCopy(mode);
    const disclaimers = getDetailReportModeDisclaimers(mode);
    const title = mode === 'guardian'
        ? `${scopeLabel} 보호자 공유 안내`
        : `${scopeLabel} 전문가 분석 안내`;
    const reviewItems = mode === 'guardian'
        ? [
            ['관찰된 변화', '정답률보다 활동 중 보인 참여 흐름과 반응 변화를 먼저 설명합니다.'],
            ['선생님 검토', '세부 점수, 오류 유형, 난이도 판단은 전문가 분석 화면에서 확인합니다.'],
            ['자동 확정 없음', '다음 활동은 자동 배정하지 않고 컨디션과 수업 맥락을 보고 조정합니다.']
        ]
        : [
            ['수행 지표 확인', '점수, 정확도, 반응 흐름을 선생님 검토용으로 함께 확인합니다.'],
            ['오류 유형 검토', '오답 패턴과 난이도 조정 후보를 수업 맥락 안에서 해석합니다.'],
            ['최종 판단 보류', '리포트는 관찰 보조 자료이며 최종 계획은 담당 선생님이 확정합니다.']
        ];
    return {
        kicker: copy.kicker,
        title,
        bodyHtml: `
            <div class="detail-report-help-section">
                <p class="detail-report-help-section-kicker">${escapeHtml(copy.kicker)}</p>
                <h4>${escapeHtml(copy.title)}</h4>
                <p>${escapeHtml(copy.description)}</p>
            </div>
            <div class="detail-report-help-section">
                <p class="detail-report-help-section-kicker">SHARE REVIEW</p>
                <h4>${escapeHtml(scopeLabel)} 공유 전 확인</h4>
                <div class="detail-report-help-list">
                    ${reviewItems.map(([label, text]) => `
                        <div class="detail-report-help-item">
                            <strong>${escapeHtml(label)}</strong>
                            <span>${escapeHtml(text)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="detail-report-help-section">
                <p class="detail-report-help-section-kicker">NOTICE</p>
                <ul>
                    ${disclaimers.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            </div>
        `
    };
}

function openDetailReportHelpModal() {
    const modal = document.getElementById('detailReportHelpModal');
    const title = document.getElementById('detailReportHelpTitle');
    const kicker = document.getElementById('detailReportHelpKicker');
    const body = document.getElementById('detailReportHelpBody');
    if (!modal || !title || !kicker || !body) return;
    const content = buildDetailReportHelpModalContent(getDetailReportScopeLabel());
    kicker.textContent = content.kicker;
    title.textContent = content.title;
    body.innerHTML = content.bodyHtml;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        modal.classList.add('active');
        modal.querySelector('[data-detail-report-help-close]')?.focus?.();
    });
}

function closeDetailReportHelpModal() {
    const modal = document.getElementById('detailReportHelpModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;
}

function getDetailReportScopeLabel(subtarget = currentDetailSubTab) {
    const labels = {
        'sub-cardlab': '카드랩',
        'sub-numlab': '숫자랩',
        'sub-playlab': '플레이랩',
        'sub-musicartlab': '뮤직아트랩',
        'sub-rehab': '재활랩',
        'sub-assessment': '검사 · 척도'
    };
    return labels[String(subtarget || '').trim()] || '리포트';
}

function getCurrentDetailReportExportTitle() {
    const client = getCurrentDetailClient();
    const clientName = String(client?.name || document.getElementById('detailMainTitle')?.textContent || '내담자').replace(/\s+/g, ' ').trim();
    const scopeLabel = getDetailReportScopeLabel();
    const modeLabel = normalizeDetailReportMode(currentDetailReportMode) === 'guardian' ? '보호자공유' : '전문가분석';
    return `${clientName}-${scopeLabel}-${modeLabel}`;
}

function getCurrentDetailReportShareTitle(activeReport, scopeLabel = '리포트') {
    if (!activeReport) return `${scopeLabel} 리포트`;
    const preferredSelectors = [
        '.detail-playlab-main-opinion .detail-playlab-opinion-title',
        '.detail-report-hero .detail-playlab-opinion-title',
        '.detail-report-insight .detail-playlab-opinion-title',
        '.detail-hevi-latest-card .detail-playlab-opinion-title'
    ];
    for (const selector of preferredSelectors) {
        const text = activeReport.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
        if (text) return text;
    }
    const fallbackNode = Array.from(activeReport.querySelectorAll('.detail-playlab-opinion-title'))
        .find((node) => !node.closest('.detail-guardian-check-card') && !node.closest('.detail-report-print-header'));
    const fallbackText = fallbackNode?.textContent?.replace(/\s+/g, ' ').trim();
    return fallbackText || `${scopeLabel} 리포트`;
}

function getCurrentDetailReportShareText() {
    const activeReport = document.getElementById(currentDetailSubTab);
    if (!activeReport || !isDetailReportSubTab()) return '';
    const client = getCurrentDetailClient();
    const clientName = String(client?.name || document.getElementById('detailMainTitle')?.textContent || '내담자').replace(/\s+/g, ' ').trim();
    const scopeLabel = getDetailReportScopeLabel();
    const modeLabel = normalizeDetailReportMode(currentDetailReportMode) === 'guardian' ? '보호자 공유 요약' : '전문가 분석 요약';
    const title = getCurrentDetailReportShareTitle(activeReport, scopeLabel);
    const notes = Array.from(activeReport.querySelectorAll('.detail-report-story, .detail-playlab-opinion-text, .detail-guardian-check-item p'))
        .map((node) => String(node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((text, index, source) => source.indexOf(text) === index)
        .filter((text) => !/본 리포트는|전문가 분석 화면에서 확인합니다/.test(text))
        .slice(0, 4);
    return [
        `[하하랩 ${modeLabel}]`,
        `내담자: ${clientName}`,
        `영역: ${scopeLabel}`,
        `제목: ${title}`,
        '',
        ...notes.map((text) => `- ${text}`),
        '',
        '※ 이 내용은 학습 수행 기록 기반의 관찰 요약이며, 진단이나 치료 효과 판정이 아닙니다.',
        '※ 다음 활동은 자동 확정하지 않고 담당 선생님이 컨디션과 수업 맥락을 확인해 조정합니다.'
    ].filter((line, index, source) => line !== '' || source[index - 1] !== '').join('\n');
}

async function copyTextToClipboard(text) {
    if (!text) return false;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (_error) {}
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (_error) {
        copied = false;
    }
    textarea.remove();
    return copied;
}

let detailReportPrintTitleRestore = '';
let detailReportPrintCleanupTimer = null;
let detailReportImageRendererPromise = null;

function sanitizeDetailReportFileName(value = 'report') {
    const normalized = String(value || 'report')
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim();
    return normalized || 'report';
}

function loadDetailReportImageRenderer() {
    if (typeof window.html2canvas === 'function') return Promise.resolve(window.html2canvas);
    if (detailReportImageRendererPromise) return detailReportImageRendererPromise;
    detailReportImageRendererPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = new URL('playlab/vendor/html2canvas.min.js', window.location.href).href;
        script.async = true;
        script.onload = () => {
            if (typeof window.html2canvas === 'function') {
                resolve(window.html2canvas);
            } else {
                reject(new Error('html2canvas renderer was not initialized.'));
            }
        };
        script.onerror = () => reject(new Error('html2canvas renderer failed to load.'));
        document.head.appendChild(script);
    });
    return detailReportImageRendererPromise;
}

function getCurrentDetailReportCaptureTarget() {
    if (!isDetailReportSubTab()) return null;
    const subTab = document.getElementById(currentDetailSubTab);
    if (!subTab) return null;
    return subTab.querySelector('.detail-report-shell, .detail-playlab-shell, .detail-assessment-shell') || subTab;
}

function downloadCanvasAsJpg(canvas, fileName) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('JPEG blob could not be created.'));
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${sanitizeDetailReportFileName(fileName)}.jpg`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            resolve();
        }, 'image/jpeg', 0.94);
    });
}

function cleanupDetailReportPrintMode() {
    if (detailReportPrintCleanupTimer) {
        clearTimeout(detailReportPrintCleanupTimer);
        detailReportPrintCleanupTimer = null;
    }
    document.body?.classList.remove('detail-report-printing');
    if (detailReportPrintTitleRestore) {
        document.title = detailReportPrintTitleRestore;
        detailReportPrintTitleRestore = '';
    }
}

function prepareDetailReportPrintMode() {
    if (!isDetailReportSubTab()) return false;
    if (!detailReportPrintTitleRestore) detailReportPrintTitleRestore = document.title;
    document.title = getCurrentDetailReportExportTitle();
    document.body?.classList.add('detail-report-printing');
    return true;
}

function loadDetailReportPdfExporter() {
    if (window.PlaylabReportPdf) return Promise.resolve(window.PlaylabReportPdf);
    if (window.__detailReportPdfExporterPromise) return window.__detailReportPdfExporterPromise;
    window.__detailReportPdfExporterPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const timer = window.setTimeout(() => { script.remove(); reject(new Error('PDF 저장 준비 시간이 초과되었습니다.')); }, 20000);
        script.src = new URL('playlab/playlab-report-pdf.js?v=20261104-1', document.baseURI).href;
        script.onload = () => { window.clearTimeout(timer); window.PlaylabReportPdf ? resolve(window.PlaylabReportPdf) : reject(new Error('PDF 저장 도구를 준비하지 못했습니다.')); };
        script.onerror = () => { window.clearTimeout(timer); script.remove(); reject(new Error('PDF 저장 파일을 불러오지 못했습니다.')); };
        document.head.appendChild(script);
    }).catch((error) => { window.__detailReportPdfExporterPromise = null; throw error; });
    return window.__detailReportPdfExporterPromise;
}

// Keep the legacy public handler name used by existing save buttons.
async function saveCurrentDetailReportAsJpg(triggerButton = null) {
    if (!isDetailReportSubTab()) {
        showBottomToast('리포트 탭에서만 리포트 저장을 사용할 수 있습니다.');
        return;
    }
    const captureTarget = getCurrentDetailReportCaptureTarget();
    if (!captureTarget) {
        showBottomToast('저장할 리포트를 찾지 못했습니다.');
        return;
    }
    const button = triggerButton instanceof HTMLElement ? triggerButton : null;
    if (window.__detailReportPdfSaving || button?.disabled) return;
    const previousDisabled = button?.disabled;
    const sourceEpoch = sensitiveAppEpoch;
    const sourceClient = currentDetailClientId;
    const sourceTab = currentDetailSubTab;
    const sourceMode = currentDetailReportMode;
    try {
        window.__detailReportPdfSaving = true;
        if (button) {
            button.disabled = true;
            button.classList.add('is-saving');
        }
        const exporter = await loadDetailReportPdfExporter();
        const fileName = getCurrentDetailReportExportTitle();
        await exporter.download(captureTarget, {
            title: fileName,
            reportMode: sourceMode,
            validateBeforeDownload: () => sourceEpoch === sensitiveAppEpoch && sourceClient === currentDetailClientId && sourceTab === currentDetailSubTab && sourceMode === currentDetailReportMode && captureTarget.isConnected
        });
        showBottomToast('리포트를 PDF로 저장했습니다.');
    } catch (error) {
        console.error('[DetailReport] PDF save failed', error);
        showBottomToast(error?.message || 'PDF 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
        window.__detailReportPdfSaving = false;
        if (button) {
            button.disabled = Boolean(previousDisabled);
            button.classList.remove('is-saving');
        }
    }
}

function printCurrentDetailReport() {
    return saveCurrentDetailReportAsJpg();
}

async function copyCurrentDetailReportShareText() {
    if (!isDetailReportSubTab()) {
        showBottomToast('리포트 탭에서만 공유 문구를 만들 수 있습니다.');
        return;
    }
    const text = getCurrentDetailReportShareText();
    const copied = await copyTextToClipboard(text);
    showBottomToast(copied ? '보호자 공유 문구를 복사했습니다.' : '공유 문구 복사에 실패했습니다.');
}

function syncDetailReportModeUI() {
    currentDetailReportMode = normalizeDetailReportMode(currentDetailReportMode);
    const modePanel = document.getElementById('detailReportModePanel');
    const detailContent = document.getElementById('detail-content-area');
    const visible = isDetailReportSubTab(currentDetailSubTab);
    if (modePanel) {
        modePanel.hidden = !visible;
        modePanel.classList.toggle('is-guardian', currentDetailReportMode === 'guardian');
        modePanel.classList.toggle('is-teacher', currentDetailReportMode === 'teacher');
    }
    if (detailContent) {
        detailContent.classList.toggle('detail-report-mode-guardian', currentDetailReportMode === 'guardian');
        detailContent.classList.toggle('detail-report-mode-teacher', currentDetailReportMode === 'teacher');
    }
    const copy = getDetailReportModeCopy(currentDetailReportMode);
    const kicker = document.getElementById('detailReportModeKicker');
    const title = document.getElementById('detailReportModeTitle');
    const description = document.getElementById('detailReportModeDescription');
    if (kicker) kicker.textContent = copy.kicker;
    if (title) title.textContent = copy.title;
    if (description) description.textContent = copy.description;
    document.querySelectorAll('.detail-report-mode-btn').forEach((button) => {
        const mode = normalizeDetailReportMode(button.getAttribute('data-report-mode') || '');
        const active = mode === currentDetailReportMode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
}

function setDetailReportMode(mode) {
    const normalized = normalizeDetailReportMode(mode);
    if (currentDetailReportMode === normalized) {
        syncDetailReportModeUI();
        return;
    }
    currentDetailReportMode = normalized;
    writeStoredDetailReportModeForSubTab(currentDetailSubTab, currentDetailReportMode);
    syncDetailReportModeUI();
    const client = getCurrentDetailClient();
    if (client) renderDetailReports(client);
}

function resolveDetailSubTabTarget(subtarget = '') {
    const buttons = getVisibleDetailSubTabButtons();
    if (!buttons.length) return null;
    return buttons.find((button) => button.getAttribute('data-subtarget') === subtarget) || buttons[0];
}

function activateDetailSubTab(subtarget = '', options = {}) {
    const { persist = true, scrollToTop = true } = options;
    const targetButton = resolveDetailSubTabTarget(subtarget);
    const allButtons = document.querySelectorAll('.sub-tab-btn');
    const allContents = document.querySelectorAll('.sub-tab-content');
    allButtons.forEach((button) => button.classList.remove('active'));
    allContents.forEach((content) => content.classList.remove('active'));
    if (!targetButton) {
        currentDetailSubTab = 'sub-info';
        return '';
    }
    currentDetailSubTab = targetButton.getAttribute('data-subtarget') || 'sub-info';
    if (isDetailReportSubTab(currentDetailSubTab)) {
        const nextReportMode = readStoredDetailReportModeForSubTab(currentDetailSubTab);
        const reportModeChanged = nextReportMode !== currentDetailReportMode;
        currentDetailReportMode = nextReportMode;
        if (reportModeChanged) {
            const client = getCurrentDetailClient();
            if (client) renderDetailReports(client);
        }
    }
    targetButton.classList.add('active');
    const targetContent = document.getElementById(currentDetailSubTab);
    if (targetContent) targetContent.classList.add('active');
    syncDetailReportModeUI();
    if (persist) {
        writeStoredDetailSubTab(currentDetailSubTab);
        persistShellViewState({ detailSubTab: currentDetailSubTab });
    }
    if (scrollToTop) {
        scrollDetailViewToTop();
        requestAnimationFrame(scrollDetailViewToTop);
    }
    return currentDetailSubTab;
}

function syncCalendarViewUI() {
    const activeView = normalizeCalendarView(currentCalendarView);
    currentCalendarView = activeView;
    document.querySelectorAll('.view-toggle').forEach((toggle) => {
        toggle.classList.toggle('active', (toggle.getAttribute('data-view') || 'month') === activeView);
    });
    document.querySelectorAll('.cal-view-container').forEach((view) => {
        view.classList.toggle('active', view.id === `view-${activeView}`);
    });
}

function persistShellViewState(patch = {}) {
    try {
        const current = readPersistedShellViewState() || {};
        const normalizedWordCardCategoryFilters = normalizeLabWordCardCategoryFilters(
            patch.labWordCardCategoryFilters ?? currentLabWordCardCategoryFilters ?? current.labWordCardCategoryFilters ?? [patch.labWordCardCategoryFilter ?? currentLabWordCardCategoryFilter ?? current.labWordCardCategoryFilter ?? 'all']
        );
        const next = {
            ...current,
            ...patch,
            view: patch.view || currentShellView || current.view || 'calendar',
            calendarView: normalizeCalendarView(patch.calendarView ?? currentCalendarView ?? current.calendarView ?? 'month'),
            calendarDate: formatCalendarStorageDate(patch.calendarDate ?? currentCalendarDate ?? current.calendarDate ?? new Date()),
            detailSubTab: String(patch.detailSubTab ?? currentDetailSubTab ?? current.detailSubTab ?? 'sub-info').trim() || 'sub-info',
            detailScheduleDate: formatCalendarStorageDate(patch.detailScheduleDate ?? currentDetailScheduleDate ?? current.detailScheduleDate ?? new Date()),
            detailClientId: String(patch.detailClientId ?? currentDetailClientId ?? current.detailClientId ?? '').trim(),
            labClientId: String(patch.labClientId ?? currentLabClient?.id ?? current.labClientId ?? '').trim(),
            labReturnView: String(patch.labReturnView ?? currentLabReturnView ?? current.labReturnView ?? 'calendar').trim() || 'calendar',
            labKind: String(patch.labKind ?? currentLabKind ?? current.labKind ?? 'cardlab').trim() || 'cardlab',
            labSearchByKind: {
                ...(current.labSearchByKind && typeof current.labSearchByKind === 'object' ? current.labSearchByKind : {}),
                ...currentLabSearchByKind,
                ...(patch.labSearchByKind && typeof patch.labSearchByKind === 'object' ? patch.labSearchByKind : {})
            },
            labSubcategoryId: String(patch.labSubcategoryId ?? currentLabSubcategoryId ?? current.labSubcategoryId ?? '').trim(),
            labStageId: String(patch.labStageId ?? currentLabStageId ?? current.labStageId ?? '').trim(),
            labContentId: String(patch.labContentId ?? currentLabContentId ?? current.labContentId ?? '').trim(),
            labTabletDetailOpen: Boolean(patch.labTabletDetailOpen ?? currentLabTabletDetailOpen ?? current.labTabletDetailOpen),
            labWordCardDetailOpen: Boolean(patch.labWordCardDetailOpen ?? currentLabWordCardDetailOpen ?? current.labWordCardDetailOpen),
            labWordCardSelectedId: String(patch.labWordCardSelectedId ?? currentLabWordCardSelectedId ?? current.labWordCardSelectedId ?? '').trim(),
            labWordCardGridMode: String(patch.labWordCardGridMode ?? currentLabWordCardGridMode ?? current.labWordCardGridMode ?? 'two').trim() || 'two',
            labWordCardCategoryFilter: String(patch.labWordCardCategoryFilter ?? currentLabWordCardCategoryFilter ?? current.labWordCardCategoryFilter ?? 'all').trim() || 'all',
            labWordCardCategoryFilters: normalizedWordCardCategoryFilters,
            labWordCardTypeFilter: String(patch.labWordCardTypeFilter ?? currentLabWordCardTypeFilter ?? current.labWordCardTypeFilter ?? 'all').trim() || 'all',
            labWordCardSearchTerm: String(patch.labWordCardSearchTerm ?? currentLabWordCardSearchTerm ?? current.labWordCardSearchTerm ?? '').trim(),
            outputCategoryId: String(patch.outputCategoryId ?? currentOutputCategoryId ?? current.outputCategoryId ?? '').trim(),
            outputSearchTerm: String(patch.outputSearchTerm ?? currentOutputSearchTerm ?? current.outputSearchTerm ?? '').trim(),
            outputWorksheetId: String(patch.outputWorksheetId ?? currentOutputWorksheetId ?? current.outputWorksheetId ?? '').trim(),
            outputDetailOpen: Boolean(patch.outputDetailOpen ?? currentOutputDetailOpen ?? current.outputDetailOpen),
            messageCategoryId: String(patch.messageCategoryId ?? currentMessageCategoryId ?? current.messageCategoryId ?? '').trim()
        };
        window.__hahaLabShellViewState = next;
        // Persist only bounded UI preferences, never client IDs, search text,
        // calendar/birthday dates or arbitrary fields supplied by a caller.
        const enumValue = (value, allowed, fallback) => allowed.find((candidate) => candidate === value) || fallback;
        const preferences = {
            view: enumValue(next.view, ['calendar', 'detail', 'output', 'message', 'lab'], 'calendar'),
            calendarView: enumValue(next.calendarView, ['month', 'week', 'day'], 'month'),
            labKind: enumValue(next.labKind, ['cardlab', 'numberlab', 'playlab', 'musicartlab', 'rehab'], 'cardlab'),
            labWordCardGridMode: enumValue(next.labWordCardGridMode, ['two', 'four'], 'two')
        };
        localStorage.setItem(SHELL_VIEW_STORAGE_KEY, JSON.stringify(preferences));
        return next;
    } catch (_error) {
        return null;
    }
}

function scrollLabViewPanelsToTop() {
    if (typeof document === 'undefined') return;
    const labView = document.getElementById('lab-view');
    if (labView) {
        if (typeof labView.scrollTo === 'function') {
            try {
                labView.scrollTo({ top: 0, behavior: 'instant' });
            } catch (_error) {
                labView.scrollTop = 0;
            }
        } else {
            labView.scrollTop = 0;
        }
    }
    document.querySelectorAll('.lab-subcategory-panel, .lab-preview-panel').forEach((panel) => {
        if (!panel) return;
        if (typeof panel.scrollTo === 'function') {
            try {
                panel.scrollTo({ top: 0, behavior: 'instant' });
                return;
            } catch (_error) {
                // fall through to direct scrollTop assignment
            }
        }
        panel.scrollTop = 0;
    });
    if (document.body?.classList.contains('lab-active') && typeof window.scrollTo === 'function') {
        try {
            window.scrollTo({ top: 0, behavior: 'instant' });
        } catch (_error) {
            window.scrollTo(0, 0);
        }
    }
}

function applyPersistedShellViewStateToMemory(state = null) {
    if (shouldForceCalendarStart()) {
        currentShellView = 'calendar';
        currentCalendarView = 'month';
        currentCalendarDate = new Date();
        currentDetailClientId = '';
        currentDetailSubTab = 'sub-info';
        currentDetailScheduleDate = new Date();
        currentOutputWorksheetId = '';
        currentOutputDetailOpen = false;
        currentLabReturnView = 'calendar';
        return {
            view: 'calendar',
            calendarView: 'month',
            calendarDate: formatCalendarStorageDate(currentCalendarDate),
            detailClientId: '',
            detailSubTab: 'sub-info',
            detailScheduleDate: formatCalendarStorageDate(new Date()),
            outputWorksheetId: '',
            outputDetailOpen: false
        };
    }
    const persisted = state || readPersistedShellViewState() || {};
    const urlView = readShellViewFromUrl();
    const returnedLabKind = consumeReturnedLabKind();
    if (!state && !Object.keys(persisted).length && !urlView) return null;
    currentShellView = normalizeShellView(urlView || persisted.view || 'calendar');
    currentCalendarView = normalizeCalendarView(persisted.calendarView || currentCalendarView || 'month');
    currentCalendarDate = parseCalendarStorageDate(persisted.calendarDate) || currentCalendarDate;
    currentDetailSubTab = normalizeDetailSubTab(readStoredDetailSubTab() || persisted.detailSubTab);
    currentDetailScheduleDate = parseCalendarStorageDate(persisted.detailScheduleDate) || currentDetailScheduleDate;
    currentDetailClientId = String(persisted.detailClientId || '').trim();
    currentLabClient = null;
    currentLabReturnView = String(persisted.labReturnView || (currentShellView === 'output' ? 'output' : (currentShellView === 'detail' ? 'detail' : 'calendar'))).trim() || 'calendar';
    currentLabKind = normalizeLabKind(returnedLabKind || persisted.labKind || 'cardlab');
    if (persisted.labSearchByKind && typeof persisted.labSearchByKind === 'object') {
        LAB_LAUNCHER_KIND_ORDER.forEach((kind) => {
            currentLabSearchByKind[kind] = String(persisted.labSearchByKind[kind] || '').trim();
        });
    }
    currentLabSubcategoryId = String(persisted.labSubcategoryId || '').trim();
    currentLabStageId = String(persisted.labStageId || '').trim();
    currentLabContentId = String(persisted.labContentId || '').trim();
    currentLabTabletDetailOpen = Boolean(persisted.labTabletDetailOpen);
    currentLabWordCardDetailOpen = Boolean(persisted.labWordCardDetailOpen);
    currentLabWordCardSelectedId = String(persisted.labWordCardSelectedId || '').trim();
    currentLabWordCardGridMode = String(persisted.labWordCardGridMode || 'two').trim() === 'one' ? 'one' : 'two';
    currentLabWordCardCategoryFilters = normalizeLabWordCardCategoryFilters(persisted.labWordCardCategoryFilters || persisted.labWordCardCategoryFilter || currentLabWordCardCategoryFilters);
    currentLabWordCardCategoryFilter = currentLabWordCardCategoryFilters[0] || 'all';
    currentLabWordCardTypeFilter = String(persisted.labWordCardTypeFilter || 'all').trim() || 'all';
    currentLabWordCardSearchTerm = String(persisted.labWordCardSearchTerm || '').trim();
    currentOutputCategoryId = String(persisted.outputCategoryId || '').trim();
    currentOutputSearchTerm = String(persisted.outputSearchTerm || '').trim();
    currentOutputWorksheetId = String(persisted.outputWorksheetId || '').trim();
    currentOutputDetailOpen = Boolean(persisted.outputDetailOpen);
    currentMessageCategoryId = String(persisted.messageCategoryId || '').trim();
    if (!currentLabSelectionByKind[currentLabKind]) {
        currentLabSelectionByKind[currentLabKind] = '';
    }
    currentLabSelectionByKind[currentLabKind] = currentLabSubcategoryId || currentLabSelectionByKind[currentLabKind] || '';
    if (!currentLabStageSelectionByCategory[currentLabKind]) {
        currentLabStageSelectionByCategory[currentLabKind] = {};
    }
    if (currentLabSubcategoryId && currentLabStageId) {
        currentLabStageSelectionByCategory[currentLabKind][currentLabSubcategoryId] = currentLabStageId;
    }
    return { ...persisted, view: currentShellView };
}

function getLabKindLabel(kind = 'cardlab') {
    switch (String(kind || '').toLowerCase()) {
        case 'numberlab':
            return '숫자랩';
        case 'playlab':
            return '플레이랩';
        case 'musicartlab':
            return '뮤직아트랩';
        case 'rehab':
        case 'rehablab':
            return '재활랩';
        default:
            return '카드랩';
    }
}

function getLabKindGuideContent(kind = 'cardlab') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    return LAB_KIND_GUIDE_CONTENT[normalizedKind] || LAB_KIND_GUIDE_CONTENT.cardlab;
}

function getLabKindGuideStorageKey(kind = 'cardlab') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    return `${LAB_KIND_GUIDE_STORAGE_PREFIX}${normalizedKind}`;
}

function isLabKindGuideDismissed(kind = 'cardlab') {
    try {
        return window.localStorage?.getItem(getLabKindGuideStorageKey(kind)) === '1';
    } catch (_error) {
        return false;
    }
}

function maybeOpenLabKindGuide(kind = 'cardlab') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    if (!LAB_LAUNCHER_KIND_ORDER.includes(normalizedKind)) return;
    if (isLabKindGuideDismissed(normalizedKind)) return;
    window.setTimeout(() => openLabKindGuide(normalizedKind), 80);
}

function getLabKindGuideSteps(guide = {}) {
    return [
        {
            title: guide.primaryTitle || '이 랩은 이렇게 사용합니다',
            text: guide.primaryText || '',
            items: []
        },
        {
            title: guide.differenceTitle || '다른 랩과의 차이',
            text: guide.differenceText || '',
            items: []
        },
        {
            title: '센터·병원 활용 포인트',
            text: '',
            items: Array.isArray(guide.usage) ? guide.usage : []
        }
    ];
}

function renderLabKindGuideStep() {
    const guide = getLabKindGuideContent(currentLabGuideKind || currentLabKind || 'cardlab');
    const steps = getLabKindGuideSteps(guide);
    const maxIndex = Math.max(0, steps.length - 1);
    currentLabGuideStep = Math.min(Math.max(0, currentLabGuideStep), maxIndex);
    const step = steps[currentLabGuideStep] || steps[0];
    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || '';
    };
    setText('labGuideStepTitle', step.title || '');
    setText('labGuideStepText', step.text || '');
    const stepText = document.getElementById('labGuideStepText');
    if (stepText) stepText.hidden = !String(step.text || '').trim();
    const stepList = document.getElementById('labGuideStepList');
    if (stepList) {
        const items = Array.isArray(step.items) ? step.items.filter(Boolean) : [];
        stepList.hidden = items.length === 0;
        stepList.innerHTML = items.map((item) => `<li>${escapeHtml(String(item || ''))}</li>`).join('');
    }
    const stepCount = document.getElementById('labGuideStepCount');
    if (stepCount) stepCount.textContent = `${currentLabGuideStep + 1} / ${steps.length}`;
    const dots = document.getElementById('labGuideDots');
    if (dots) {
        dots.innerHTML = steps.map((_, index) => `<span class="lab-guide-dot ${index === currentLabGuideStep ? 'is-active' : ''}"></span>`).join('');
    }
    const prevButton = document.getElementById('labGuidePrevBtn');
    const nextButton = document.getElementById('labGuideNextBtn');
    const finalButton = document.getElementById('labGuideFinalBtn');
    if (prevButton) prevButton.hidden = currentLabGuideStep === 0;
    if (nextButton) nextButton.hidden = currentLabGuideStep >= maxIndex;
    if (finalButton) finalButton.hidden = currentLabGuideStep < maxIndex;
}

function openLabKindGuide(kind = 'cardlab') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    const modal = document.getElementById('labGuideModal');
    if (!modal || !LAB_LAUNCHER_KIND_ORDER.includes(normalizedKind)) return;
    const guide = getLabKindGuideContent(normalizedKind);
    const kindMeta = getLabLauncherKind(normalizedKind) || LAB_LAUNCHER_KIND_META[normalizedKind] || LAB_LAUNCHER_KIND_META.cardlab;
    currentLabGuideKind = normalizedKind;
    modal.style.setProperty('--lab-guide-accent', kindMeta.accent || '#F59E0B');
    modal.style.setProperty('--lab-guide-soft', kindMeta.softAccent || 'rgba(245, 158, 11, 0.16)');
    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || '';
    };
    setText('labGuideIcon', kindMeta.icon || 'science');
    setText('labGuideKicker', guide.kicker || 'LAB GUIDE');
    setText('labGuideTitle', guide.title || `${getLabKindLabel(normalizedKind)} 안내`);
    setText('labGuideSubtitle', guide.subtitle || '');
    currentLabGuideStep = 0;
    renderLabKindGuideStep();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeLabKindGuide(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const modal = document.getElementById('labGuideModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function nextLabKindGuideStep(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const steps = getLabKindGuideSteps(getLabKindGuideContent(currentLabGuideKind || currentLabKind || 'cardlab'));
    currentLabGuideStep = Math.min(currentLabGuideStep + 1, Math.max(0, steps.length - 1));
    renderLabKindGuideStep();
}

function prevLabKindGuideStep(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    currentLabGuideStep = Math.max(0, currentLabGuideStep - 1);
    renderLabKindGuideStep();
}

function confirmLabKindGuide(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const normalizedKind = String(currentLabGuideKind || currentLabKind || 'cardlab').toLowerCase();
    try {
        window.localStorage?.setItem(getLabKindGuideStorageKey(normalizedKind), '1');
    } catch (_error) {}
    closeLabKindGuide();
}

function dismissLabKindGuide(event) {
    confirmLabKindGuide(event);
}

function isLabAnonymousGuideDismissed() {
    try {
        return window.localStorage?.getItem(LAB_ANONYMOUS_GUIDE_STORAGE_KEY) === '1';
    } catch (_error) {
        return false;
    }
}

function openLabAnonymousGuide() {
    const modal = document.getElementById('labAnonymousGuideModal');
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeLabAnonymousGuide(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const modal = document.getElementById('labAnonymousGuideModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function confirmLabAnonymousGuide(event) {
    closeLabAnonymousGuide(event);
}

function dismissLabAnonymousGuide(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    try {
        window.localStorage?.setItem(LAB_ANONYMOUS_GUIDE_STORAGE_KEY, '1');
    } catch (_error) {}
    closeLabAnonymousGuide();
}

function maybeOpenLabAnonymousGuide() {
    if (isLabAnonymousGuideDismissed()) return;
    window.setTimeout(() => openLabAnonymousGuide(), 80);
}

function getClassOnboardingStorageKey() {
    const teacherId = String(getCurrentTeacherId() || window.currentProfile?.teacherId || window.currentProfile?.teacher_id || '').trim();
    return teacherId ? `${CLASS_ONBOARDING_STORAGE_PREFIX}${teacherId}` : CLASS_ONBOARDING_STORAGE_PREFIX;
}

function isClassOnboardingSeen() {
    try {
        return window.localStorage?.getItem(getClassOnboardingStorageKey()) === '1';
    } catch (_error) {
        return false;
    }
}

function markClassOnboardingSeen() {
    try {
        window.localStorage?.setItem(getClassOnboardingStorageKey(), '1');
    } catch (_error) {}
    try {
        LAB_LAUNCHER_KIND_ORDER.forEach((kind) => {
            window.localStorage?.setItem(getLabKindGuideStorageKey(kind), '1');
        });
        window.localStorage?.setItem(LAB_ANONYMOUS_GUIDE_STORAGE_KEY, '1');
    } catch (_error) {}
    if (window.currentProfile && typeof window.persistTeacherSession === 'function') {
        window.currentProfile.classNewOnboardingSeenLocal = true;
        window.currentProfile = window.persistTeacherSession(window.currentProfile);
    }
}

function getCardDownloadPromoStorageKey() {
    const teacherId = String(getCurrentTeacherId() || window.currentProfile?.teacherId || window.currentProfile?.teacher_id || '').trim();
    return teacherId ? `${CARD_DOWNLOAD_PROMO_DISMISSED_PREFIX}${teacherId}` : CARD_DOWNLOAD_PROMO_DISMISSED_PREFIX;
}

function isCardDownloadPromoDismissed() {
    try {
        return window.localStorage?.getItem(getCardDownloadPromoStorageKey()) === '1';
    } catch (_error) {
        return false;
    }
}

function isCardDownloadPromoClosedThisSession() {
    try {
        return window.sessionStorage?.getItem(CARD_DOWNLOAD_PROMO_SESSION_KEY) === '1';
    } catch (_error) {
        return false;
    }
}

function closeCardDownloadPromo(options = {}) {
    const modal = document.getElementById('cardDownloadPromoModal');
    if (!modal) return;
    modal.classList.remove('active', 'card-download-promo-compact');
    modal.setAttribute('aria-hidden', 'true');
    if (options.dismissForever) {
        try {
            window.localStorage?.setItem(getCardDownloadPromoStorageKey(), '1');
        } catch (_error) {}
    } else if (options.rememberSession !== false) {
        try {
            window.sessionStorage?.setItem(CARD_DOWNLOAD_PROMO_SESSION_KEY, '1');
        } catch (_error) {}
    }
}

function openCardDownloadPrintPage() {
    window.open(CARD_DOWNLOAD_PRINT_URL, '_blank', 'noopener,noreferrer,width=1280,height=900');
}

function openCardDownloadPromo(options = {}) {
    if (!window.currentProfile || isCardDownloadPromoDismissed()) return;
    if (!options.force && isCardDownloadPromoClosedThisSession()) return;
    if (currentClassOnboardingActive || isClassOnboardingBlockingSurface()) return;
    const modal = document.getElementById('cardDownloadPromoModal');
    if (!modal) return;
    modal.classList.toggle('card-download-promo-compact', options.variant === 'compact');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function queueCardDownloadPromo(options = {}) {
    const delay = Number.isFinite(options.delay) ? options.delay : 520;
    window.setTimeout(() => openCardDownloadPromo(options), delay);
}

function bindCardDownloadPromoHandlers() {
    document.getElementById('cardDownloadPromoOpenBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        closeCardDownloadPromo({ rememberSession: true });
        openCardDownloadPrintPage();
    });
    document.getElementById('cardDownloadPromoCloseBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        closeCardDownloadPromo({ rememberSession: true });
    });
    document.getElementById('cardDownloadPromoNeverBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        closeCardDownloadPromo({ dismissForever: true });
    });
}

function getCurrentClassOnboardingStep() {
    return CLASS_ONBOARDING_STEPS[currentClassOnboardingStep] || CLASS_ONBOARDING_STEPS[0];
}

function isClassOnboardingBlockingSurface() {
    if (document.body?.classList.contains('auth-pending') || document.body?.classList.contains('auth-logged-out')) return true;
    if (document.querySelector('.login-overlay.active')) return true;
    const passwordPrompt = document.getElementById('passwordExpiryModal');
    if (passwordPrompt && passwordPrompt.hidden === false) return true;
    return false;
}

function activateClientScheduleList() {
    const clientTab = document.querySelector('.schedule-sidebar-tab[data-scheduletab="sched-clients"]');
    const reserveTab = document.querySelector('.schedule-sidebar-tab[data-scheduletab="sched-reservations"]');
    const clientList = document.getElementById('sched-clients');
    const reserveList = document.getElementById('sched-reservations');
    if (clientTab) clientTab.classList.add('active');
    if (reserveTab) reserveTab.classList.remove('active');
    if (clientList) clientList.classList.add('active');
    if (reserveList) reserveList.classList.remove('active');
    updateAlphabetIndex();
}

function getClassOnboardingTargetElement(target = '') {
    switch (String(target || '').trim()) {
        case 'client-add':
            return document.getElementById('scheduleSidebarAddBtn');
        case 'schedule-add':
            return document.getElementById('calendarAddScheduleBtn');
        case 'anonymous-lab':
            return document.querySelector('#sched-clients .schedule-lab-quickstart');
        case 'lab-tabs':
            return document.getElementById('labKindTabs');
        default:
            return null;
    }
}

function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getClassOnboardingGhostSpec(target = '', rect = null) {
    const fallbackRect = rect || { left: 20, top: 110, width: 44, height: 44 };
    const centerX = fallbackRect.left + (fallbackRect.width / 2);
    const centerY = fallbackRect.top + (fallbackRect.height / 2);
    if (target === 'client-add') {
        return {
            className: 'is-icon-only',
            width: 170,
            height: 54,
            left: centerX - 85,
            top: centerY - 27,
            html: `
                <span class="material-symbols-outlined">person_add</span>
                <span>내담자 추가</span>
            `
        };
    }
    if (target === 'schedule-add') {
        const width = Math.max(188, fallbackRect.width + 24);
        const height = Math.max(48, fallbackRect.height + 10);
        return {
            className: 'is-schedule',
            width,
            height,
            left: centerX - (width / 2),
            top: centerY - (height / 2),
            html: `
                <span class="material-symbols-outlined">edit_calendar</span>
                <span>일정 추가</span>
            `
        };
    }
    if (target === 'lab-tabs') {
        const width = Math.max(452, fallbackRect.width + 12);
        const height = Math.max(72, fallbackRect.height + 8);
        return {
            className: 'is-lab-tabs',
            width,
            height,
            left: centerX - (width / 2),
            top: centerY - (height / 2),
            html: `
                <span class="class-onboarding-target-ghost-tabs">
                    <span class="class-onboarding-target-ghost-tab is-active">
                        <span class="material-symbols-outlined" aria-hidden="true">style</span>
                        <span>카드랩</span>
                    </span>
                    <span class="class-onboarding-target-ghost-tab">
                        <span class="material-symbols-outlined" aria-hidden="true">calculate</span>
                        <span>숫자랩</span>
                    </span>
                    <span class="class-onboarding-target-ghost-tab">
                        <span class="material-symbols-outlined" aria-hidden="true">stadia_controller</span>
                        <span>플레이랩</span>
                    </span>
                    <span class="class-onboarding-target-ghost-tab">
                        <span class="material-symbols-outlined" aria-hidden="true">healing</span>
                        <span>재활랩</span>
                    </span>
                </span>
            `
        };
    }
    const width = Math.max(236, fallbackRect.width + 8);
    const height = Math.max(76, fallbackRect.height + 6);
    return {
        className: 'is-lab',
        width,
        height,
        left: centerX - (width / 2),
        top: centerY - (height / 2),
        html: `
            <span class="class-onboarding-target-ghost-card">
                <span class="class-onboarding-target-ghost-label">LAB 시작</span>
                <span class="class-onboarding-target-ghost-icon material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </span>
        `
    };
}

function positionClassOnboardingTarget(step = getCurrentClassOnboardingStep()) {
    const spotlight = document.getElementById('classOnboardingSpotlight');
    const ghost = document.getElementById('classOnboardingTargetGhost');
    if (!spotlight || !ghost) return null;

    if (step.mode !== 'target') {
        spotlight.hidden = true;
        ghost.hidden = true;
        ghost.innerHTML = '';
        ghost.className = 'class-onboarding-target-ghost';
        return null;
    }

    const element = getClassOnboardingTargetElement(step.target);
    const rawRect = element ? element.getBoundingClientRect() : null;
    const rect = rawRect && rawRect.width > 0 && rawRect.height > 0
        ? rawRect
        : { left: 24, top: 112, width: 44, height: 44 };

    const viewportWidth = window.innerWidth || 1280;
    const viewportHeight = window.innerHeight || 800;
    const spotPadding = step.target === 'anonymous-lab' ? 8 : 6;
    const spotLeft = clampNumber(rect.left - spotPadding, 12, Math.max(12, viewportWidth - rect.width - (spotPadding * 2) - 12));
    const spotTop = clampNumber(rect.top - spotPadding, 12, Math.max(12, viewportHeight - rect.height - (spotPadding * 2) - 12));
    spotlight.style.left = `${spotLeft}px`;
    spotlight.style.top = `${spotTop}px`;
    spotlight.style.width = `${rect.width + (spotPadding * 2)}px`;
    spotlight.style.height = `${rect.height + (spotPadding * 2)}px`;
    spotlight.hidden = false;

    if (step.ghost === false) {
        ghost.hidden = true;
        ghost.innerHTML = '';
        ghost.className = 'class-onboarding-target-ghost';
        return rect;
    }

    const spec = getClassOnboardingGhostSpec(step.target, rect);
    const left = clampNumber(spec.left, 12, Math.max(12, viewportWidth - spec.width - 12));
    const top = clampNumber(spec.top, 12, Math.max(12, viewportHeight - spec.height - 12));
    ghost.className = `class-onboarding-target-ghost ${spec.className}`;
    ghost.style.left = `${left}px`;
    ghost.style.top = `${top}px`;
    ghost.style.width = `${spec.width}px`;
    ghost.style.height = `${spec.height}px`;
    ghost.innerHTML = spec.html;
    ghost.hidden = false;
    return {
        left,
        top,
        width: spec.width,
        height: spec.height
    };
}

function positionClassOnboardingCard(step = getCurrentClassOnboardingStep(), anchorRect = null) {
    const card = document.getElementById('classOnboardingCard');
    if (!card) return;

    card.classList.toggle('is-centered', step.mode === 'center');
    card.classList.toggle('is-targeted', step.mode === 'target');

    if (step.mode !== 'target') {
        card.style.left = '50%';
        card.style.top = '50%';
        card.style.transform = 'translate(-50%, -50%)';
        return;
    }

    const viewportWidth = window.innerWidth || 1280;
    const viewportHeight = window.innerHeight || 800;
    const targetRect = anchorRect && anchorRect.width > 0 && anchorRect.height > 0
        ? anchorRect
        : { left: viewportWidth / 2, top: 120, width: 0, height: 0 };
    const cardRect = card.getBoundingClientRect();
    const cardWidth = cardRect.width || Math.min(step.id === 'lab-intro' ? 460 : 560, viewportWidth - 36);
    const cardHeight = cardRect.height || 320;
    const preferredLeft = step.id === 'lab-intro'
        ? targetRect.left
        : targetRect.left + (targetRect.width / 2) - (cardWidth / 2);
    const left = clampNumber(preferredLeft, 18, Math.max(18, viewportWidth - cardWidth - 18));
    const top = clampNumber(
        targetRect.top + targetRect.height + 18,
        18,
        Math.max(18, viewportHeight - cardHeight - 18)
    );
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.transform = 'none';
}

function getClassOnboardingCustomMarkup(step = getCurrentClassOnboardingStep()) {
    if (step.id !== 'lab-intro') return '';
    return `
        <div class="class-onboarding-lab-grid">
            <article class="class-onboarding-lab-card">
                <strong>카드랩</strong>
                <p>어휘와 개념 활동을 바로 열어요.</p>
            </article>
            <article class="class-onboarding-lab-card">
                <strong>숫자랩</strong>
                <p>수 개념과 연산 흐름을 연습해요.</p>
            </article>
            <article class="class-onboarding-lab-card">
                <strong>플레이랩</strong>
                <p>주의와 기억 과제를 놀이형으로 써요.</p>
            </article>
            <article class="class-onboarding-lab-card">
                <strong>재활랩</strong>
                <p>재활 목표에 맞춘 훈련에 활용해요.</p>
            </article>
        </div>
    `;
}

function renderClassOnboarding() {
    const overlay = document.getElementById('classOnboardingOverlay');
    const card = document.getElementById('classOnboardingCard');
    const kicker = document.getElementById('classOnboardingKicker');
    const title = document.getElementById('classOnboardingTitle');
    const body = document.getElementById('classOnboardingBody');
    const custom = document.getElementById('classOnboardingCustom');
    const nextBtn = document.getElementById('classOnboardingNextBtn');
    if (!overlay || !card || !kicker || !title || !body || !custom || !nextBtn) return;

    const step = getCurrentClassOnboardingStep();
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    card.classList.toggle('is-lab-intro', step.id === 'lab-intro');
    kicker.textContent = step.kicker || 'WELCOME';
    title.textContent = step.title || '';
    body.textContent = step.body || '';
    custom.innerHTML = getClassOnboardingCustomMarkup(step);
    nextBtn.textContent = step.nextLabel || '다음';
    const anchorRect = positionClassOnboardingTarget(step);
    positionClassOnboardingCard(step, anchorRect);
    window.requestAnimationFrame(() => {
        if (!currentClassOnboardingActive) return;
        const latestStep = getCurrentClassOnboardingStep();
        if (latestStep.id !== step.id) return;
        const ghost = document.getElementById('classOnboardingTargetGhost');
        const spotlight = document.getElementById('classOnboardingSpotlight');
        const source = latestStep.mode === 'target'
            ? ((latestStep.ghost === false || !ghost || ghost.hidden) ? spotlight : ghost)
            : null;
        const rect = source && !source.hidden
            ? source.getBoundingClientRect()
            : anchorRect;
        positionClassOnboardingCard(latestStep, rect);
    });
}

function closeClassOnboarding() {
    const overlay = document.getElementById('classOnboardingOverlay');
    const spotlight = document.getElementById('classOnboardingSpotlight');
    const ghost = document.getElementById('classOnboardingTargetGhost');
    if (overlay) {
        overlay.hidden = true;
        overlay.setAttribute('aria-hidden', 'true');
    }
    if (spotlight) spotlight.hidden = true;
    if (ghost) {
        ghost.hidden = true;
        ghost.innerHTML = '';
        ghost.className = 'class-onboarding-target-ghost';
    }
    const card = document.getElementById('classOnboardingCard');
    if (card) {
        card.style.left = '';
        card.style.top = '';
        card.style.transform = '';
    }
    currentClassOnboardingActive = false;
    currentClassOnboardingPendingSurface = '';
}

function dismissClassOnboarding(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    markClassOnboardingSeen();
    closeClassOnboarding();
}

async function ensureClassOnboardingSurface(step = getCurrentClassOnboardingStep()) {
    if (step.surface === 'lab') {
        if (currentShellView !== 'lab' || !currentLabAnonymousMode) {
            await openLabCenter('cardlab', null, 'calendar', {
                allowAnonymous: true,
                suppressAnonymousGuide: true,
                suppressKindGuide: true
            });
        }
        currentClassOnboardingPendingSurface = 'lab';
        return;
    }

    currentClassOnboardingPendingSurface = 'calendar';
    if (currentLabDirectOverlay) closeLabDirectTargetOverlay();
    if (currentShellView === 'lab') {
        closeLabCenter();
    } else if (currentShellView !== 'calendar') {
        resetShellToDefaultCalendar();
    } else {
        updateShellViewState('calendar');
        renderCalendar();
    }
    activateClientScheduleList();
}

async function nextClassOnboardingStep(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const step = getCurrentClassOnboardingStep();
    if (step.id === 'anonymous-lab') {
        currentClassOnboardingStep = Math.min(currentClassOnboardingStep + 1, CLASS_ONBOARDING_STEPS.length - 1);
        await ensureClassOnboardingSurface(CLASS_ONBOARDING_STEPS[currentClassOnboardingStep]);
        renderClassOnboarding();
        return;
    }
    if (currentClassOnboardingStep >= CLASS_ONBOARDING_STEPS.length - 1) {
        markClassOnboardingSeen();
        closeClassOnboarding();
        queueCardDownloadPromo({ force: true, variant: 'full', delay: 260 });
        return;
    }
    currentClassOnboardingStep += 1;
    await ensureClassOnboardingSurface(CLASS_ONBOARDING_STEPS[currentClassOnboardingStep]);
    renderClassOnboarding();
}

function prevClassOnboardingStep(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (currentClassOnboardingStep <= 0) return;
    currentClassOnboardingStep -= 1;
    ensureClassOnboardingSurface(CLASS_ONBOARDING_STEPS[currentClassOnboardingStep]).then(() => {
        renderClassOnboarding();
    });
}

async function maybeStartClassOnboarding(options = {}) {
    const force = options?.force === true;
    if (!window.currentProfile || isClassOnboardingBlockingSurface()) {
        if (!force) {
            window.clearTimeout(currentClassOnboardingStartTimer);
            currentClassOnboardingStartTimer = window.setTimeout(() => {
                maybeStartClassOnboarding(options);
            }, 320);
        }
        return;
    }
    if (!force && (currentClassOnboardingActive || currentClassOnboardingStartedThisSession || isClassOnboardingSeen())) {
        if (isClassOnboardingSeen()) {
            queueCardDownloadPromo({ variant: 'compact', delay: 720 });
        }
        return;
    }

    currentClassOnboardingStartedThisSession = true;
    currentClassOnboardingActive = true;
    currentClassOnboardingStep = 0;
    await ensureClassOnboardingSurface(CLASS_ONBOARDING_STEPS[0]);
    renderClassOnboarding();
}

function queueClassOnboardingStart(options = {}) {
    if (currentClassOnboardingActive) {
        renderClassOnboarding();
        return;
    }
    window.clearTimeout(currentClassOnboardingStartTimer);
    currentClassOnboardingStartTimer = window.setTimeout(() => {
        maybeStartClassOnboarding(options);
    }, 220);
}

function renderLabPageLoader() {
    const overlay = document.getElementById('labPageLoader');
    if (!overlay) return;
    const kindMeta = getLabLauncherKind(currentLabKind || 'cardlab');
    const kindLabel = kindMeta?.label || getLabKindLabel(currentLabKind || 'cardlab');
    overlay.hidden = !currentLabPageLoading;
    overlay.classList.toggle('is-visible', currentLabPageLoading);
    if (!currentLabPageLoading) {
        overlay.innerHTML = '';
        return;
    }
    overlay.innerHTML = `
        <div class="lab-page-loader-card">
            <div class="lab-page-loader-track" aria-hidden="true">
                <span class="lab-page-loader-dot"></span>
                <span class="lab-page-loader-dot"></span>
                <span class="lab-page-loader-dot"></span>
                <span class="lab-page-loader-dot"></span>
                <span class="lab-page-loader-dot"></span>
                <span class="lab-page-loader-dot"></span>
            </div>
            <strong class="lab-page-loader-title">카테고리를 불러오고 있습니다</strong>
            <p class="lab-page-loader-kind">${escapeHtml(kindLabel)}</p>
            <p class="lab-page-loader-desc">페이지에 들어오자마자 최신 카테고리와 학습 구성을 준비하고 있습니다. 잠시만 기다려 주세요.</p>
        </div>
    `;
}

function showLabPageLoader(kind = '') {
    currentLabKind = LAB_LAUNCHER_KIND_ORDER.includes(String(kind || '').toLowerCase())
        ? String(kind || '').toLowerCase()
        : currentLabKind;
    currentLabPageLoading = true;
    currentLabPageLoadingStartedAt = Date.now();
    clearTimeout(currentLabPageLoadingTimer);
    currentLabPageLoadingTimer = null;
    syncShellViewUrl('lab');
    renderLabPageLoader();
}

function hideLabPageLoader(options = {}) {
    const { force = false } = options;
    if (!currentLabPageLoading && !force) return;
    const elapsed = Date.now() - (currentLabPageLoadingStartedAt || 0);
    const remaining = Math.max(0, 220 - elapsed);
    clearTimeout(currentLabPageLoadingTimer);
    if (!force && remaining > 0) {
        currentLabPageLoadingTimer = window.setTimeout(() => {
            currentLabPageLoading = false;
            currentLabPageLoadingTimer = null;
            renderLabPageLoader();
        }, remaining);
        return;
    }
    currentLabPageLoading = false;
    currentLabPageLoadingTimer = null;
    renderLabPageLoader();
}

function getLabSessionUi(kind = 'cardlab') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    return {
        mode: `${normalizedKind}-workspace`,
        title: `${getLabKindLabel(normalizedKind)} 시작`,
        progressPercent: null,
        progressLabel: '',
        progressValue: '',
        hideGlobalGnb: false,
        labScope: normalizedKind,
        restoreState: null,
        showLabTabs: normalizedKind !== 'playlab',
        hideSessionSwitcher: normalizedKind === 'playlab',
        renderHubLabSwitch: normalizedKind !== 'playlab'
    };
}

const LAB_LAUNCHER_KIND_ORDER = ['cardlab', 'numberlab', 'playlab', 'musicartlab', 'rehab'];
const LAB_WORDCARD_CATEGORY_ID = 'cardlab-wordcards';
const LAB_LAUNCHER_CONFIG_TERM_TYPE = 'lab_launcher_config';
const LAB_LAUNCHER_KIND_META = {
    cardlab: {
        id: 'cardlab',
        label: '카드랩',
        subtitle: '언어 카드 · 문장 · 음운',
        description: '카드와 문장 규칙을 놀이처럼 구조화해 익히는 영역입니다.',
        accent: '#F59E0B',
        softAccent: 'rgba(245, 158, 11, 0.16)',
        icon: 'style',
        badge: '12'
    },
    numberlab: {
        id: 'numberlab',
        label: '숫자랩',
        subtitle: '수 개념 · 연산',
        description: '숫자 읽기부터 연산 길찾기까지 단계별로 설계하는 영역입니다.',
        accent: '#3B82F6',
        softAccent: 'rgba(59, 130, 246, 0.16)',
        icon: 'numbers',
        badge: '10'
    },
    playlab: {
        id: 'playlab',
        label: '플레이랩',
        subtitle: '인지 · 감각 · 놀이',
        description: '인지·감각·상호작용 영역을 게임형 활동으로 설계하는 영역입니다.',
        accent: '#10B981',
        softAccent: 'rgba(16, 185, 129, 0.16)',
        icon: 'toys',
        badge: '9'
    },
    musicartlab: {
        id: 'musicartlab',
        label: '뮤직아트랩',
        subtitle: '음악 · 미술 · 표현',
        description: '리듬, 소리, 색, 그림 표현 활동을 수업형 랩으로 설계하는 영역입니다.',
        accent: '#8B5CF6',
        softAccent: 'rgba(139, 92, 246, 0.16)',
        icon: 'artist',
        badge: '0'
    },
    rehab: {
        id: 'rehab',
        label: '재활랩',
        subtitle: '재활 · 기능 회복',
        description: '주의, 언어, 운동, 일상 기능 회복을 목표로 단계화한 재활 학습 영역입니다.',
        accent: '#EC4899',
        softAccent: 'rgba(236, 72, 153, 0.16)',
        icon: 'accessibility_new',
        badge: '0'
    }
};

const LAB_KIND_GUIDE_CONTENT = {
    cardlab: {
        kicker: 'CARD LAB GUIDE',
        title: '카드랩 활용 안내',
        subtitle: '언어 카드, 어휘, 문장, 음운 과제를 수업 흐름에 맞게 구조화하는 랩입니다.',
        primaryTitle: '카드랩은 이렇게 사용합니다',
        primaryText: '카드랩은 낱말 이해, 이름대기, 문장 구성, 음운 인식처럼 언어 학습의 기초 단계를 반복 수업으로 만들 때 적합합니다. 수업 전에는 목표 어휘나 문장 범주를 고르고, 수업 중에는 정답률과 오답 유형을 확인해 다음 회기 과제를 좁혀갑니다.',
        differenceTitle: '다른 랩과의 차이',
        differenceText: '플레이랩이 짧은 게임형 몰입과 간단한 결과 확인에 가깝다면, 카드랩은 언어 재료 자체를 중심으로 수업 자료와 학습 기록을 쌓는 영역입니다.',
        usage: [
            '언어치료실에서는 목표 어휘, 음운, 문장 구조를 회기별 과제로 묶어 반복 연습합니다.',
            '센터에서는 오답이 누적되는 단어군을 다음 상담 포인트와 가정 연계 과제로 전환합니다.',
            '초기 평가는 쉬운 범주부터 시작하고, 정답률이 안정되면 표현 길이와 문장 복잡도를 올립니다.'
        ]
    },
    numberlab: {
        kicker: 'NUMBER LAB GUIDE',
        title: '숫자랩 활용 안내',
        subtitle: '수 개념, 수 세기, 연산, 순서 처리 과제를 단계적으로 다루는 랩입니다.',
        primaryTitle: '숫자랩은 이렇게 사용합니다',
        primaryText: '숫자랩은 숫자 읽기, 수량 매칭, 덧셈·뺄셈, 계산 순서처럼 학습자가 실제로 어느 단계에서 흔들리는지 확인할 때 사용합니다. 난이도를 낮게 시작해 성공률을 확보하고, 속도보다 절차 이해와 오류 패턴을 먼저 봅니다.',
        differenceTitle: '다른 랩과의 차이',
        differenceText: '카드랩이 언어 자료 중심이라면 숫자랩은 수 개념과 절차 수행 중심입니다. 재활랩처럼 전문 소견 중심으로 보기보다, 수업 안에서 학습 단계와 반복량을 조절하는 데 초점을 둡니다.',
        usage: [
            '학습센터에서는 수 개념 결손, 연산 실수, 자리값 혼동을 구분해 보충 단원을 설계합니다.',
            '병원·재활 환경에서는 주의 유지, 작업 기억, 순서 처리의 기능 과제로 활용할 수 있습니다.',
            '결과는 점수 하나보다 어떤 유형에서 시간이 늘고 오답이 반복되는지 상담 자료로 봅니다.'
        ]
    },
    playlab: {
        kicker: 'PLAY LAB GUIDE',
        title: '플레이랩 활용 안내',
        subtitle: '게임형 활동으로 흥미, 주의, 반응, 감각 참여를 빠르게 끌어올리는 랩입니다.',
        primaryTitle: '플레이랩은 이렇게 사용합니다',
        primaryText: '플레이랩은 짧고 직관적인 활동으로 수업 시작 전 워밍업, 동기 유발, 주의 전환, 반응 확인에 적합합니다. 결과는 정답 여부와 간단한 수행 확인 중심으로 보고, 전문 해석은 재활랩에서 다룹니다.',
        differenceTitle: '재활랩과의 차이',
        differenceText: '플레이랩은 “오늘 잘 참여했는지, 과제를 끝까지 했는지”를 가볍게 확인하는 게임형 영역입니다. 재활랩은 같은 유형의 과제라도 치료 목표, 변화 추세, 전문가 소견까지 포함해 임상 기록으로 해석합니다.',
        usage: [
            '센터에서는 수업 전 3~5분 워밍업이나 강화 활동으로 사용해 참여도를 높입니다.',
            '오답이 많을 때는 진단처럼 해석하지 않고, 과제 이해도와 피로도, 흥미도를 먼저 확인합니다.',
            '정밀한 상담 자료가 필요하면 동일하거나 유사한 목표를 재활랩에서 진행해 리포트를 확인합니다.'
        ]
    },
    musicartlab: {
        kicker: 'MUSIC ART LAB GUIDE',
        title: '뮤직아트랩 활용 안내',
        subtitle: '리듬, 소리, 색, 그림 표현을 활용해 참여와 표현 반응을 관찰하는 랩입니다.',
        primaryTitle: '뮤직아트랩은 이렇게 사용합니다',
        primaryText: '뮤직아트랩은 음악과 미술 활동을 통해 청각 변별, 리듬 기억, 색과 감정 표현, 선택 반응을 가볍게 확인하는 영역입니다. 수업 안에서는 흥미 유도와 표현 확장에 쓰고, 결과는 수행 관찰 자료로 축적합니다.',
        differenceTitle: '다른 랩과의 차이',
        differenceText: '플레이랩이 게임형 인지 활동 중심이라면, 뮤직아트랩은 소리와 시각 표현을 매개로 한 반응과 선택을 봅니다. 재활랩처럼 임상 소견 중심으로 확정 해석하지 않고, 수업 참여와 표현 양상을 기록하는 데 초점을 둡니다.',
        usage: [
            '수업 도입부에서는 리듬 따라하기나 소리-색 매칭으로 주의 전환과 참여를 이끌어냅니다.',
            '표현이 제한적인 내담자에게는 색, 그림, 소리 선택을 통해 선호와 감정 표현 단서를 관찰합니다.',
            '리포트는 정답률뿐 아니라 반응 안정성, 선택 패턴, 반복 참여도를 함께 보는 보조 자료로 사용합니다.'
        ]
    },
    rehab: {
        kicker: 'REHAB LAB GUIDE',
        title: '재활랩 활용 안내',
        subtitle: '센터와 병원에서 치료 목표, 수행 변화, 전문 소견을 함께 확인하는 재활 중심 랩입니다.',
        primaryTitle: '재활랩은 이렇게 사용합니다',
        primaryText: '재활랩은 주의, 기억, 시지각, 언어, 실행 기능, 일상 기능 회복 목표를 기준으로 과제를 선택하고, 회기 결과를 전문 리포트로 확인하는 영역입니다. 내담자의 현재 기능 수준에 맞춰 낮은 단계에서 시작한 뒤 정확도, 반응 안정성, 월간 추세를 보며 난이도를 조정합니다.',
        differenceTitle: '플레이랩과의 차이',
        differenceText: '플레이랩은 흥미와 참여를 위한 간단 결과 중심이고, 재활랩은 실제 치료 계획과 상담 기록에 연결되는 전문 리포트 중심입니다. 같은 과제처럼 보여도 재활랩은 내담자 변화 추적, 상담 포인트, 전문가 소견을 남기는 용도로 사용합니다.',
        usage: [
            '병원에서는 치료 전후 변화, 주의 유지, 반응 안정성, 오류 양상을 회기 기록의 보조 자료로 확인합니다.',
            '센터에서는 월간 추세와 전문가 소견을 보호자 상담, 치료 목표 재설정, 가정 연계 과제 제안에 활용합니다.',
            '초기에는 성공 가능한 난이도로 기준선을 만들고, 2~4회기 이상 누적 후 상승·정체·변동 패턴을 해석합니다.',
            '리포트는 의료적 진단을 대체하지 않으며, 담당 전문가의 관찰과 표준화 평가 결과와 함께 사용합니다.'
        ]
    }
};

const createLabStage = (title, desc = '') => ({ title, desc });
const normalizeLabLauncherTags = (value) => {
    const rawTags = Array.isArray(value)
        ? value
        : String(value || '').split(/[,#\n]/);
    return Array.from(new Set(
        rawTags
            .map((tag) => String(tag || '').trim().replace(/^#+/, ''))
            .filter(Boolean)
    ));
};
const createLabSubcategory = (id, badge, title, desc, stages = [], accent = '#F59E0B', softAccent = 'rgba(245, 158, 11, 0.16)', targetMode = 'panel', targetUrl = '', isActive = true, options = {}) => ({
    id,
    badge,
    title,
    desc,
    stages,
    accent,
    softAccent,
    targetMode,
    targetUrl,
    tags: normalizeLabLauncherTags(options.tags || options.hashtags || options.hashTags),
    thumbnailUrl: String(options.thumbnailUrl || options.thumbnail_url || '').trim(),
    accessTier: String(options.accessTier || options.access_tier || 'paid').trim() || 'paid',
    requiresLogin: options.requiresLogin !== false && options.requires_login !== false,
    requiresPaid: options.requiresPaid !== false && options.requires_paid !== false,
    isFreePreview: options.isFreePreview !== false && options.is_free_preview !== false,
    isActive,
    sortOrder: Number.isFinite(Number(options.sortOrder)) ? Number(options.sortOrder) : null,
    scheduledAt: options.scheduledAt || '',
    createdDate: String(options.createdDate || options.created_date || '').trim(),
    modifiedDate: String(options.modifiedDate || options.modified_date || '').trim(),
    registeredAt: String(options.registeredAt || options.registered_at || options.createdDate || options.created_date || options.scheduledAt || options.scheduled_at || '').trim(),
    isHidden: options.isHidden === true
});

const DEFAULT_LAB_LAUNCHER_CATEGORIES = {
    cardlab: [
        {
            id: 'cardlab-situation-ox',
            badge: '27',
            title: '생각 쑥쑥 OX 모험',
            desc: '일상 상황 그림을 보고 행동을 판단하며 O 또는 X를 선택해요.',
            targetMode: 'direct',
            targetUrl: '/playlab/cardlab-situation-ox.html',
            tags: ['상황이해', '사회적판단', '생활안전', '화용언어', '선택반응'],
            thumbnailUrl: '/images/playlab-thumbnails/cardlab-situation-ox.webp',
            sortOrder: 270,
            registeredAt: '2026-10-21T00:00:00+09:00',
            stages: [
                createLabStage('유치원', '기본 생활·안전 · 30문항 중 12문항'),
                createLabStage('초등 저학년', '학교·친구 관계 · 30문항 중 12문항'),
                createLabStage('초등 고학년', '관점·책임 있는 선택 · 30문항 중 12문항')
            ]
        }
    ],
    numberlab: [],
    playlab: [
        {
            id: 'playlab-speed-card-sort',
            badge: '24',
            title: '쏙쏙 카드 배달',
            desc: '중앙 카드를 보고 같은 그림이 있는 왼쪽 또는 오른쪽으로 빠르게 분류해요.',
            targetMode: 'direct',
            targetUrl: '/playlab/playlab-speed-card-sort.html',
            tags: ['시각매칭', '선택적주의', '좌우변별', '처리속도', '자기점검'],
            thumbnailUrl: '/images/playlab-thumbnails/playlab-speed-card-sort.webp',
            sortOrder: 240,
            stages: [
                createLabStage('1단계', '과일 카드 · 24장 · 45초 · 실수 허용 5회'),
                createLabStage('2단계', '동물 카드 · 32장 · 40초 · 실수 허용 3회')
            ]
        },
        {
            id: 'playlab-spatial-block-count',
            badge: '25',
            title: '입체 블록 수량 추론',
            desc: '컬러 입체 블록 묶음을 관찰하고 전체 블록 개수를 추론해요.',
            targetMode: 'direct',
            targetUrl: '/playlab/playlab-spatial-block-count.html',
            tags: ['인지', '시지각', '공간지각', '추론'],
            thumbnailUrl: '/images/playlab-thumbnails/playlab-spatial-block-count.webp',
            sortOrder: 250,
            stages: [
                createLabStage('1단계', '기초 단층 계수'),
                createLabStage('2단계', '단순 복층 계수'),
                createLabStage('3단계', '기본 가려진 블록 유추'),
                createLabStage('4단계', '다방향 시점 회전 기초'),
                createLabStage('5단계', '복합 가려진 블록'),
                createLabStage('6단계', '정신적 회전'),
                createLabStage('7단계', '불완전 기둥 및 관통 구조'),
                createLabStage('8단계', '비정형 복합 공간 회전')
            ]
        }
    ],
    musicartlab: [],
    rehab: [
        {
            id: 'rehablab-color-block-count',
            badge: '61',
            title: '컬러 블록 실제 개수 찾기',
            desc: '고정 시점의 컬러 블록 묶음을 보고 실제 개수를 세며 시지각 탐색, 공간 구성, 수량 보존을 관찰해요.',
            targetMode: 'direct',
            targetUrl: '/playlab/rehablab-color-block-count.html',
            tags: ['재활', '인지', '시지각', '공간지각'],
            thumbnailUrl: '/images/playlab-thumbnails/rehablab-color-block-count.webp',
            sortOrder: 61,
            stages: [
                createLabStage('유아', '단층 탐색과 쉬운 복층 세기'),
                createLabStage('초등 저', '앞뒤 줄과 2층 구조 세기'),
                createLabStage('초등 고', '받침 관계와 복합 묶음 세기'),
                createLabStage('청소년', '비대칭 구조와 빈 공간 제외'),
                createLabStage('성인', '복합 공간 구성 선별')
            ]
        }
    ]
};

const createEmptyLabLauncherCatalog = () => ({
    cardlab: { ...LAB_LAUNCHER_KIND_META.cardlab, categories: [] },
    numberlab: { ...LAB_LAUNCHER_KIND_META.numberlab, categories: [] },
    playlab: { ...LAB_LAUNCHER_KIND_META.playlab, categories: [] },
    musicartlab: { ...LAB_LAUNCHER_KIND_META.musicartlab, categories: [] },
    rehab: { ...LAB_LAUNCHER_KIND_META.rehab, categories: [] }
});

let labLauncherCatalog = createEmptyLabLauncherCatalog();

const normalizeLabLauncherCategory = (kind, item = {}, index = 0) => {
    const kindMeta = LAB_LAUNCHER_KIND_META[kind] || LAB_LAUNCHER_KIND_META.cardlab;
    const title = String(item?.title || item?.name || '').trim();
    const idSource = String(item?.id || item?.code || item?.slug || title || `${kind}-${index + 1}`).trim();
    const badge = String(item?.badge || String(index + 1).padStart(2, '0')).trim();
    const desc = String(item?.desc || item?.description || '').trim();
    const targetMode = String(item?.targetMode || item?.launchMode || 'panel').trim() === 'direct' ? 'direct' : 'panel';
    const targetUrl = String(item?.targetUrl || item?.htmlUrl || item?.url || '').trim();
    const stages = Array.isArray(item?.stages)
        ? item.stages
            .map((stage) => createLabStage(stage?.title || '', stage?.desc || stage?.description || ''))
            .filter((stage) => String(stage.title || '').trim())
        : [];
    const explicitTags = normalizeLabLauncherTags(item?.tags || item?.hashtags || item?.hashTags);
    return createLabSubcategory(
        slugifyLabText(idSource) || `${kind}-${index + 1}`,
        badge,
        title || `카테고리 ${index + 1}`,
        desc,
        stages,
        String(item?.accent || kindMeta.accent || '#F59E0B').trim(),
        String(item?.softAccent || kindMeta.softAccent || 'rgba(245, 158, 11, 0.16)').trim(),
        targetMode,
        targetUrl,
        item?.isActive !== false,
        {
            sortOrder: item?.sortOrder ?? item?.sort_order ?? item?.order ?? index + 1,
            scheduledAt: String(item?.scheduledAt || item?.scheduled_at || item?.visibleFrom || item?.visible_from || item?.publishedAt || item?.published_at || '').trim(),
            createdDate: String(item?.createdDate || item?.created_date || item?.createdAt || item?.created_at || '').trim(),
            modifiedDate: String(item?.modifiedDate || item?.modified_date || item?.modifiedAt || item?.modified_at || '').trim(),
            registeredAt: String(item?.registeredAt || item?.registered_at || item?.createdDate || item?.created_date || item?.createdAt || item?.created_at || '').trim(),
            isHidden: (item?.isHidden ?? item?.is_hidden ?? false) === true,
            tags: explicitTags.length ? explicitTags : inferLabLauncherTags(item, kind),
            thumbnailUrl: buildLabLauncherThumbnailUrl(item),
            accessTier: item?.accessTier ?? item?.access_tier ?? 'paid',
            requiresLogin: (item?.requiresLogin ?? item?.requires_login ?? true) !== false,
            requiresPaid: (item?.requiresPaid ?? item?.requires_paid ?? true) !== false,
            isFreePreview: (item?.isFreePreview ?? item?.is_free_preview ?? true) !== false
        }
    );
};

function getLabLauncherFileName(item = {}) {
    const raw = String(item?.fileName || item?.file_name || item?.targetUrl || item?.htmlUrl || item?.url || '').trim();
    return raw.split('?')[0].split('#')[0].split('/').pop() || '';
}

function isLegacyTimeDaypartsLauncher(item = {}) {
    const fileName = getLabLauncherFileName(item);
    return fileName === 'rehablab-time-dayparts.html' || fileName === 'cardlab-time-dayparts.html';
}

function migrateLegacyTimeDaypartsLauncher(item = {}) {
    if (!isLegacyTimeDaypartsLauncher(item)) return item;
    return {
        ...item,
        id: 'cardlab-cardlab-time-dayparts-html',
        kind: 'cardlab',
        title: '하루 시간 배우기',
        fileName: 'cardlab-time-dayparts.html',
        targetUrl: 'cardlab-time-dayparts.html',
        thumbnailUrl: '/images/playlab-thumbnails/cardlab-time-dayparts.webp',
        tags: normalizeLabLauncherTags(item.tags).filter((tag) => tag !== '재활')
    };
}

function inferLabLauncherTags(item = {}, kind = 'cardlab') {
    const fileName = getLabLauncherFileName(item).toLowerCase();
    const text = [
        fileName,
        item?.title,
        item?.name,
        item?.description,
        item?.desc
    ].map((value) => String(value || '').toLowerCase()).join(' ');
    const tags = [];
    const add = (...items) => {
        items.forEach((tag) => {
            if (tag && !tags.includes(tag)) tags.push(tag);
        });
    };
    const normalizedKind = String(kind || '').toLowerCase();
    if (normalizedKind === 'cardlab') add('언어');
    if (normalizedKind === 'numberlab') add('수개념', '인지');
    if (normalizedKind === 'playlab') add('인지');
    if (normalizedKind === 'musicartlab') add('음악', '미술', '표현');
    if (normalizedKind === 'rehab') add('재활', '인지');
    if (/(music|rhythm|sound|beat|song|note|art|color|paint|draw|음악|리듬|박자|소리|노래|음표|미술|색|색깔|그림|그리기|표현)/i.test(text)) add('음악', '미술', '표현');
    if (/(phonics|jamo|hangul|batchim|sound|zoo-sound|글자|자음|모음|받침|소리|음운)/i.test(text)) add('음운', '청각처리');
    if (/(word|cardlab-study|quiz|description-find|car-logo|name|단어|낱말|이름|어휘|설명)/i.test(text)) add('어휘', '의미이해');
    if (/(sentence|josa|connective|cloze|context|idiom|문장|조사|이어|빈칸|속담|관용)/i.test(text)) add('문장', '의미이해');
    if (/(motion|emotion|social|mind|감정|마음|표정|사회|움직임)/i.test(text)) add('감정', '사회성');
    if (/(number|add|sub|operation|compare|money|clock|measure|fraction|graph|estimate|숫자|수|더하기|빼기|연산|시계|돈|분수|그래프|측정|비교)/i.test(text)) add('수개념', '연산');
    if (/(memory|sequence|remember|순서|기억|작업기억)/i.test(text)) add('기억', '작업기억');
    if (/(attention|find|spot|search|찾기|주의|집중)/i.test(text)) add('주의', '변별');
    if (/(visual|shape|color|dot|maze|puzzle|half|partial|시각|시지각|도형|색깔|그림|퍼즐|반쪽|부분)/i.test(text)) add('시지각', '공간지각');
    if (/(planning|hanoi|doorlock|logic|reasoning|problem|계획|문제|추론|규칙|실행)/i.test(text)) add('실행기능', '문제해결');
    if (/(motor|move|gesture|운동|동작|손|협응)/i.test(text)) add('운동');
    if (/(life|daily|market|time|일상|생활|시장|시간)/i.test(text)) add('일상생활');
    if (/(sensory|touch|balance|감각)/i.test(text)) add('감각통합');
    return tags.slice(0, 5);
}

function buildLabLauncherThumbnailUrl(item = {}) {
    const explicit = String(item?.thumbnailUrl || item?.thumbnail_url || item?.thumbnail || item?.thumbnailPath || item?.thumbnail_path || '').trim();
    if (explicit) {
        const normalizedExplicit = /^https?:\/\//i.test(explicit) || explicit.startsWith('/')
            ? explicit
            : `/${explicit.replace(/^\.?\/*/, '')}`;
        const pathMatch = normalizedExplicit.match(/^(https?:\/\/[^/]+)?(\/images\/(?:cardlab-thumbnails\/)?(cardlab-[^/?#]+\.webp))(.*)$/i);
        if (pathMatch) {
            return `${pathMatch[1] || ''}/images/playlab-thumbnails/${pathMatch[3]}${pathMatch[4] || ''}`;
        }
        return normalizedExplicit;
    }
    const fileName = getLabLauncherFileName(item);
    if (!fileName) return '';
    return `/images/playlab-thumbnails/${fileName.replace(/\.html?$/i, '')}.webp`;
}

function normalizeLabLauncherConfig(raw = null) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const next = createEmptyLabLauncherCatalog();
    const sourceRowsByKind = Object.fromEntries(LAB_LAUNCHER_KIND_ORDER.map((kind) => {
        const kindSource = source?.[kind];
        const rows = Array.isArray(kindSource)
            ? [...kindSource]
            : Array.isArray(kindSource?.categories)
                ? [...kindSource.categories]
                : [];
        return [kind, rows];
    }));
    const spatialBlockFileName = 'playlab-spatial-block-count.html';
    const misplacedSpatialRows = sourceRowsByKind.cardlab.filter((item) => getLabLauncherFileName(item) === spatialBlockFileName);
    if (misplacedSpatialRows.length) {
        sourceRowsByKind.cardlab = sourceRowsByKind.cardlab.filter((item) => getLabLauncherFileName(item) !== spatialBlockFileName);
        const playlabHasSpatialBlock = sourceRowsByKind.playlab.some((item) => getLabLauncherFileName(item) === spatialBlockFileName);
        if (!playlabHasSpatialBlock) sourceRowsByKind.playlab.push({ ...misplacedSpatialRows[0], kind: 'playlab' });
    }
    const legacyTimeDaypartsRow = LAB_LAUNCHER_KIND_ORDER
        .flatMap((kind) => sourceRowsByKind[kind])
        .find(isLegacyTimeDaypartsLauncher);
    LAB_LAUNCHER_KIND_ORDER.forEach((kind) => {
        const rows = sourceRowsByKind[kind];
        const sourceRows = kind === 'cardlab' && legacyTimeDaypartsRow && !rows.some(isLegacyTimeDaypartsLauncher)
            ? [...rows, migrateLegacyTimeDaypartsLauncher(legacyTimeDaypartsRow)]
            : rows;
        const sortedRows = sourceRows
            .map((item, index) => ({ item, index }))
            .sort((a, b) => {
                const aOrder = Number(a.item?.sortOrder ?? a.item?.sort_order ?? a.item?.order);
                const bOrder = Number(b.item?.sortOrder ?? b.item?.sort_order ?? b.item?.order);
                if (Number.isFinite(aOrder) && Number.isFinite(bOrder) && aOrder !== bOrder) return aOrder - bOrder;
                if (Number.isFinite(aOrder) && !Number.isFinite(bOrder)) return -1;
                if (!Number.isFinite(aOrder) && Number.isFinite(bOrder)) return 1;
                return a.index - b.index;
            })
            .map((entry) => entry.item);
        const normalizedRows = sortedRows
            .map((item) => migrateLegacyTimeDaypartsLauncher(item))
            .filter((item) => kind !== 'rehab' || !isLegacyTimeDaypartsLauncher(item))
            .map((item, index) => normalizeLabLauncherCategory(item.kind || kind, item, index))
            .filter((item) => !LAB_LAUNCHER_EXCLUDED_FILES.has(getLabLauncherFileName(item)));
        const defaultRows = Array.isArray(DEFAULT_LAB_LAUNCHER_CATEGORIES[kind])
            ? DEFAULT_LAB_LAUNCHER_CATEGORIES[kind].map((item, index) => normalizeLabLauncherCategory(kind, item, normalizedRows.length + index))
            : [];
        defaultRows.forEach((defaultItem) => {
            const defaultFileName = getLabLauncherFileName(defaultItem);
            const defaultId = String(defaultItem?.id || '').trim();
            const alreadyExists = normalizedRows.some((item) => {
                const itemFileName = getLabLauncherFileName(item);
                if (defaultFileName && itemFileName) return itemFileName === defaultFileName;
                return String(item?.id || '').trim() === defaultId;
            });
            if (!alreadyExists) normalizedRows.push(defaultItem);
        });
        next[kind] = {
            ...LAB_LAUNCHER_KIND_META[kind],
            categories: normalizedRows
        };
        next[kind].badge = String(next[kind].categories.length);
    });
    return next;
}

function applyLabLauncherCatalog(rawConfig = null) {
    labLauncherCatalog = normalizeLabLauncherConfig(rawConfig);
    window.HAHA_LAB_LAUNCHER_CATALOG = labLauncherCatalog;
    window.HAHA_LAB_LAUNCHER_KIND_META = LAB_LAUNCHER_KIND_META;
}

function parseLabLauncherConfigContent(value = null) {
    if (!value) return null;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return null;
    try {
        return JSON.parse(value);
    } catch (_error) {
        return null;
    }
}

function clearLabLauncherRealtimeChannel() {
    if (!window.supabaseClient || !currentLabLauncherRealtimeChannel) return;
    try {
        window.supabaseClient.removeChannel(currentLabLauncherRealtimeChannel);
    } catch (_error) {
        // noop
    }
    currentLabLauncherRealtimeChannel = null;
}

function bindLabLauncherRealtime() {
    if (!window.supabaseClient || currentLabLauncherRealtimeChannel) return;
    currentLabLauncherRealtimeChannel = window.supabaseClient
        .channel(`lab-launcher-config-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_terms', filter: `type=eq.${LAB_LAUNCHER_CONFIG_TERM_TYPE}` }, () => {
            currentLabLauncherLoaded = false;
            currentLabLauncherLoadingPromise = null;
            ensureLabLauncherCatalogLoaded();
        })
        .subscribe();
}

async function ensureLabLauncherCatalogLoaded() {
    if (currentLabLauncherLoaded) return labLauncherCatalog;
    if (currentLabLauncherLoadingPromise) return currentLabLauncherLoadingPromise;
    currentLabLauncherLoading = true;
    currentLabLauncherLoadingPromise = (async () => {
        try {
            if (!window.supabaseClient) {
                applyLabLauncherCatalog(null);
                return labLauncherCatalog;
            }
            const { data, error } = await window.supabaseClient
                .from('app_terms')
                .select('id,content')
                .eq('type', LAB_LAUNCHER_CONFIG_TERM_TYPE)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (error) throw error;
            const termConfig = parseLabLauncherConfigContent(data?.content);
            applyLabLauncherCatalog(termConfig);
            bindLabLauncherRealtime();
            return labLauncherCatalog;
        } catch (error) {
            console.error('[LabLauncher] config load failed:', error);
            applyLabLauncherCatalog(null);
            return labLauncherCatalog;
        } finally {
            currentLabLauncherLoading = false;
            currentLabLauncherLoaded = true;
            currentLabLauncherLoadingPromise = null;
            if (currentShellView === 'lab') {
                syncLabLauncherNewItems({ showModal: !currentLabAnonymousMode });
            }
            renderLabViewShell();
        }
    })();
    return currentLabLauncherLoadingPromise;
}

applyLabLauncherCatalog(null);

function getLabLauncherKind(kind = 'cardlab') {
    return labLauncherCatalog[String(kind || 'cardlab').toLowerCase()] || labLauncherCatalog.cardlab;
}

function getLabLauncherCategories(kind = 'cardlab') {
    const now = Date.now();
    return Array.isArray(getLabLauncherKind(kind)?.categories)
        ? getLabLauncherKind(kind).categories.filter((item) => {
            if (item?.isActive === false || item?.isHidden === true) return false;
            const scheduledAt = String(item?.scheduledAt || '').trim();
            if (!scheduledAt) return true;
            const scheduledMs = new Date(scheduledAt).getTime();
            return !Number.isFinite(scheduledMs) || scheduledMs <= now;
        })
        : [];
}

function normalizeLabFilterTagList(value = []) {
    const list = Array.isArray(value) ? value : [value];
    const normalized = list
        .map((tag) => String(tag || '').replace(/^#+/, '').trim())
        .filter(Boolean);
    if (!normalized.length || normalized.includes('all')) return ['all'];
    return Array.from(new Set(normalized));
}

function getCurrentLabTagFilters(kind = currentLabKind) {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    return normalizeLabFilterTagList(currentLabTagFiltersByKind[normalizedKind] || ['all']);
}

function getCurrentLabSort(kind = currentLabKind) {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    const value = String(currentLabSortByKind[normalizedKind] || 'adminDesc').trim();
    return LAB_SORT_OPTIONS.some((option) => option.id === value) ? value : 'adminDesc';
}

function getLabCategoryAdminOrder(category = {}, fallbackIndex = 0) {
    const candidates = [
        category.sortOrder,
        category.sort_order,
        category.order,
        category.badge,
        fallbackIndex + 1
    ];
    const resolved = candidates
        .map((value) => Number(String(value ?? '').replace(/[^0-9.-]/g, '')))
        .find((value) => Number.isFinite(value));
    return Number.isFinite(resolved) ? resolved : fallbackIndex + 1;
}

function getLabCategoryFileKey(category = {}) {
    const fileName = getLabLauncherFileName(category);
    return fileName ? fileName.replace(/\.html?$/i, '').toLowerCase() : '';
}

function collectLabActivityTokens(...values) {
    const tokens = [];
    const add = (value) => {
        const normalized = String(value || '').toLowerCase().trim();
        if (!normalized || tokens.includes(normalized)) return;
        tokens.push(normalized);
    };
    const visit = (value) => {
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        if (value && typeof value === 'object') {
            Object.values(value).forEach(visit);
            return;
        }
        const raw = String(value || '').trim();
        if (!raw) return;
        const lowered = raw.toLowerCase();
        const withoutQuery = lowered.split('?')[0].split('#')[0];
        add(lowered);
        add(withoutQuery);
        const fileName = withoutQuery.replace(/\\/g, '/').split('/').pop();
        if (fileName) {
            add(fileName);
            add(fileName.replace(/\.html?$/i, ''));
        }
    };
    values.forEach(visit);
    return tokens;
}

function getLabCategoryMatchTokens(category = {}) {
    const fileKey = getLabCategoryFileKey(category);
    return collectLabActivityTokens([
        category.id,
        category.title,
        category.label,
        category.name,
        category.targetUrl,
        category.target_url,
        category.htmlUrl,
        category.html_url,
        category.fileName,
        category.file_name,
        category.privatePath,
        category.private_path,
        category.relativePath,
        category.relative_path,
        getLabLauncherFileName(category),
        fileKey,
        LAB_ACTIVITY_MATCH_ALIASES[fileKey]
    ]);
}

function getLabHistoryComparableText(row = {}) {
    const normalizedRow = typeof normalizeLabHistoryRow === 'function' ? normalizeLabHistoryRow(row) : keysToCamel(row);
    const details = normalizedRow.details || {};
    const metadata = normalizedRow.metadata || {};
    return collectLabActivityTokens([
        normalizedRow.curriculumKey,
        normalizedRow.curriculum_key,
        normalizedRow.labTitle,
        normalizedRow.lab_title,
        normalizedRow.labLabel,
        normalizedRow.lab_label,
        normalizedRow.labKind,
        normalizedRow.lab_kind,
        normalizedRow.reportScope,
        normalizedRow.report_scope,
        normalizedRow.labScope,
        normalizedRow.lab_scope,
        normalizedRow.actionType,
        normalizedRow.action_type,
        normalizedRow.memo,
        normalizedRow.title,
        normalizedRow.stageTitle,
        normalizedRow.stage_title,
        normalizedRow.stageKey,
        normalizedRow.stage_key,
        normalizedRow.sourcePage,
        normalizedRow.source_page,
        normalizedRow.fileName,
        normalizedRow.file_name,
        normalizedRow.targetUrl,
        normalizedRow.target_url,
        details.curriculumKey,
        details.curriculum_key,
        details.labTitle,
        details.lab_title,
        details.labLabel,
        details.lab_label,
        details.labKind,
        details.lab_kind,
        details.reportScope,
        details.report_scope,
        details.labScope,
        details.lab_scope,
        details.reportFocusKey,
        details.report_focus_key,
        details.reportFocusLabel,
        details.report_focus_label,
        details.categoryTitle,
        details.category_title,
        details.gameName,
        details.game_name,
        details.title,
        details.stageTitle,
        details.stage_title,
        details.stageKey,
        details.stage_key,
        details.sourcePage,
        details.source_page,
        details.fileName,
        details.file_name,
        details.targetUrl,
        details.target_url,
        metadata.curriculumKey,
        metadata.curriculum_key,
        metadata.labTitle,
        metadata.lab_title,
        metadata.labLabel,
        metadata.lab_label,
        metadata.labKind,
        metadata.lab_kind,
        metadata.reportScope,
        metadata.report_scope,
        metadata.labScope,
        metadata.lab_scope,
        metadata.reportFocusKey,
        metadata.report_focus_key,
        metadata.reportFocusLabel,
        metadata.report_focus_label,
        metadata.categoryTitle,
        metadata.category_title,
        metadata.gameName,
        metadata.game_name,
        metadata.title,
        metadata.stageTitle,
        metadata.stage_title,
        metadata.stageKey,
        metadata.stage_key,
        metadata.sourcePage,
        metadata.source_page,
        metadata.fileName,
        metadata.file_name,
        metadata.targetUrl,
        metadata.target_url,
        typeof getLabReportRowTitle === 'function' ? getLabReportRowTitle(normalizedRow) : ''
    ]).join(' ');
}

function getLabHistoryDateMs(row = {}) {
    const candidates = [
        row.completedAt,
        row.completed_at,
        row.playedAt,
        row.played_at,
        row.eventDatetime,
        row.event_datetime,
        row.endDatetime,
        row.end_datetime,
        row.startDatetime,
        row.start_datetime,
        row.createdAt,
        row.created_at
    ];
    for (const value of candidates) {
        const parsed = new Date(String(value || '').replace(' ', 'T')).getTime();
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function getCardlabAttemptDateMs(attempt = {}) {
    const candidates = [
        attempt.completedAt,
        attempt.completed_at,
        attempt.playedAt,
        attempt.played_at,
        attempt.createdAt,
        attempt.created_at,
        attempt.startedAt,
        attempt.started_at
    ];
    for (const value of candidates) {
        const parsed = new Date(String(value || '').replace(' ', 'T')).getTime();
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

async function fetchClientSupplementalData(client) {
    const clientId = String(client?.id || '').trim();
    const teacherId = String(
        client?.teacherId ||
        client?.teacher_id ||
        (typeof getCurrentTeacherId === 'function' ? getCurrentTeacherId() : '') ||
        ''
    ).trim();
    const emptyData = { histories: [], cardlabAttempts: [], cardlabProgress: [], cardlabWrongStats: [] };
    if (!clientId || !client || client.type !== 'client' || !window.supabaseClient) {
        return mergeSupplementalWithLocal(emptyData, clientId);
    }

    await flushLocalLearningHarnessSyncQueue();
    const fetchAllHistories = async () => {
        const pageSize = 500;
        const pages = [];
        let from = 0;
        // The client report is a longitudinal record.  Keep paging until the
        // source is exhausted instead of silently treating the newest 220
        // sessions as the full history.
        while (true) {
            let query = window.supabaseClient
                .from('histories_report_exact')
                .select('*')
                .eq('client_id', clientId)
                .eq('category', 'session_history')
                .order('event_datetime', { ascending: false })
                .order('id', { ascending: false });
            // Histories use both `게임 완료` and the older `학습 완료`
            // completion label.  Fetch the full session-history category and
            // apply the completion allow-list after normalization so legacy
            // RehabLab reports are not lost before scope recovery.  The
            // explicit owner predicate also prevents a same client id/name in
            // another teacher account from being attached to this report even
            // when an older RLS policy is permissive.
            if (teacherId) query = query.eq('teacher_id', teacherId);
            const result = await query.range(from, from + pageSize - 1);
            if (result.error) return { data: pages, error: result.error };
            const rows = Array.isArray(result.data) ? result.data : [];
            pages.push(...rows);
            if (rows.length < pageSize) break;
            from += pageSize;
        }
        return { data: pages, error: null };
    };
    const [historiesRes, attemptsRes, progressRes, wrongRes] = await Promise.all([
        fetchAllHistories(),
        window.supabaseClient
            .from('cardlab_learning_attempts')
            .select('*')
            .eq('client_id', clientId)
            .order('completed_at', { ascending: false })
            .limit(140),
        window.supabaseClient
            .from('cardlab_learning_stage_progress')
            .select('*')
            .eq('client_id', clientId)
            .order('stage_order', { ascending: true }),
        window.supabaseClient
            .from('cardlab_learning_wrong_stats')
            .select('*')
            .eq('client_id', clientId)
            .order('wrong_count', { ascending: false })
            .limit(60)
    ]);

    if (historiesRes.error) {
        if (typeof document !== 'undefined') document.documentElement.dataset.labHistoryStatus = 'error';
        throw new Error(`재활랩 완료 이력을 불러오지 못했습니다: ${historiesRes.error.message || historiesRes.error}`);
    }

    const normalizedHistoryRows = keysToCamel(historiesRes.data || []);
    const completedHistoryRows = normalizedHistoryRows.filter(isCompletedLabHistoryRow);
    if (typeof document !== 'undefined') {
        document.documentElement.dataset.labHistoryStatus = 'ok';
        document.documentElement.dataset.labHistoryFetched = String(normalizedHistoryRows.length);
        document.documentElement.dataset.labHistoryCompleted = String(completedHistoryRows.length);
    }

    return mergeSupplementalWithLocal({
        histories: completedHistoryRows,
        remoteCardlabAttemptsAvailable: !attemptsRes.error,
        cardlabAttempts: keysToCamel(attemptsRes.data || []),
        cardlabProgress: keysToCamel(progressRes.data || []),
        cardlabWrongStats: keysToCamel(wrongRes.data || [])
    }, clientId);
}

async function loadLabActivityData(client) {
    const clientId = String(client?.id || '').trim();
    if (!clientId) {
        currentDetailData = mergeSupplementalWithLocal(
            { histories: [], cardlabAttempts: [], cardlabProgress: [], cardlabWrongStats: [] },
            ''
        );
        return currentDetailData;
    }

    try {
        const nextData = await fetchClientSupplementalData(client);
        if (String(currentLabClient?.id || '').trim() !== clientId) return currentDetailData;
        currentDetailData = nextData;
    } catch (error) {
        console.error('[LabData] load failed:', error);
        if (String(currentLabClient?.id || '').trim() !== clientId) return currentDetailData;
        currentDetailData = mergeSupplementalWithLocal(
            { histories: [], cardlabAttempts: [], cardlabProgress: [], cardlabWrongStats: [] },
            clientId
        );
    }
    return currentDetailData;
}

function getLabDirectHistoryScope(kind = currentLabKind) {
    const normalizedKind = normalizeLabKind(kind);
    if (normalizedKind === 'numberlab') return LAB_REPORT_SCOPE_NUMBERLAB;
    if (normalizedKind === 'musicartlab') return LAB_REPORT_SCOPE_MUSICARTLAB;
    if (normalizedKind === 'rehab') return LAB_REPORT_SCOPE_REHAB;
    return LAB_REPORT_SCOPE_PLAYLAB;
}

function appendLocalLabHistoryRecord(historyRow = {}, clientId = '') {
    try {
        const currentRecords = readLocalLearningHarnessRecords();
        const localRecord = {
            id: historyRow.id || `local-lab-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            clientId: String(clientId || historyRow.client_id || historyRow.clientId || 'local-client').trim() || 'local-client',
            history: historyRow
        };
        window.__hahaLabTransientHistoryRecords = [localRecord, ...currentRecords].slice(0, 500);
        localStorage.removeItem(LAB_LEARNING_HARNESS_STORAGE_KEY);
    } catch (error) {
        console.warn('[LabDirect] local history save failed:', error);
    }
}

function buildLabDirectCompletionHistoryRow({
    kind = currentLabKind,
    targetUrl = '',
    title = '',
    eventPayload = {}
} = {}) {
    const normalizedKind = normalizeLabKind(kind);
    const category = getLabLauncherSelectedCategory(normalizedKind);
    const client = currentLabClient || getCurrentDetailClient() || {};
    const detail = eventPayload?.detail && typeof eventPayload.detail === 'object' ? eventPayload.detail : {};
    const completedAt = new Date().toISOString();
    const startedAtMs = Number(detail.startedAtMs || detail.started_at_ms || 0);
    const startedAt = Number.isFinite(startedAtMs) && startedAtMs > 0
        ? new Date(startedAtMs).toISOString()
        : completedAt;
    const durationMinutes = Math.max(1, Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000));
    const totalQuestions = Number(detail.stageTotal || detail.totalQuestions || detail.total_questions || 0) || 0;
    const correctCount = Number(detail.perfectCount ?? detail.correctCount ?? detail.correct_count ?? (detail.correct === true ? 1 : 0)) || 0;
    const wrongCount = Number(detail.retryCount ?? detail.wrongCount ?? detail.wrong_count ?? 0) || 0;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const safeTargetUrl = String(targetUrl || '').trim();
    const fileName = (() => {
        try {
            return new URL(safeTargetUrl, window.location.href).pathname.replace(/\\/g, '/').split('/').pop() || '';
        } catch (_error) {
            return safeTargetUrl.replace(/\\/g, '/').split('?')[0].split('#')[0].split('/').pop() || '';
        }
    })();
    const titleText = String(title || category?.title || detail.title || detail.targetName || getLabKindLabel(normalizedKind)).trim();
    const reportScope = getLabDirectHistoryScope(normalizedKind);
    const detailPayload = {
        report_scope: reportScope,
        lab_scope: reportScope,
        lab_kind: normalizedKind,
        lab_label: getLabKindLabel(normalizedKind),
        lab_title: titleText,
        category_id: String(category?.id || '').trim(),
        category_title: String(category?.title || titleText).trim(),
        content_id: String(category?.id || fileName || titleText).trim(),
        content_title: titleText,
        game_id: String(category?.id || fileName || titleText).trim(),
        game_name: titleText,
        file_name: fileName,
        target_url: safeTargetUrl,
        score,
        correct_count: correctCount,
        wrong_count: wrongCount,
        total_questions: totalQuestions,
        duration_minutes: durationMinutes,
        completed_at: completedAt,
        started_at: startedAt,
        event_type: String(eventPayload?.type || '').trim(),
        ...detail
    };
    return {
        id: `lab-direct-${normalizedKind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        teacher_id: getCurrentTeacherId(),
        client_id: String(client?.id || currentDetailClientId || '').trim(),
        client_name: String(client?.name || '').trim(),
        type: String(client?.type || 'client').trim() || 'client',
        category: 'session_history',
        action: LAB_SESSION_COMPLETION_ACTION,
        action_type: titleText,
        event_datetime: completedAt,
        start_datetime: startedAt,
        end_datetime: completedAt,
        duration: `${durationMinutes} minutes`,
        duration_minutes: durationMinutes,
        details: JSON.stringify(detailPayload),
        metadata: {
            report_scope: reportScope,
            lab_scope: reportScope,
            lab_kind: normalizedKind,
            lab_label: getLabKindLabel(normalizedKind),
            action_type: titleText,
            file_name: fileName,
            target_url: safeTargetUrl,
            duration_minutes: durationMinutes,
            saved_by: 'class-new-lab-direct'
        },
        memo: titleText
    };
}

async function persistLabDirectCompletionEvent(eventPayload = {}, options = {}) {
    if (!eventPayload || String(eventPayload.type || '').trim() !== 'study-complete') return;
    const overlay = currentLabDirectOverlay;
    if (!overlay || overlay.dataset.learningCompletionSaved === 'true' || overlay.dataset.learningCompletionSaving === 'true') return;
    if (currentLabAnonymousMode) {
        overlay.dataset.learningCompletionSaved = 'skipped-anonymous';
        return;
    }
    overlay.__pendingCompletionRequest = { eventPayload, options };
    overlay.dataset.learningCompletionSaving = 'true';
    overlay.dataset.learningCompletionSaveState = 'saving';
    const saveOwner = window.getAuthenticatedReportOwner?.();
    let pendingRecord = overlay.__pendingCompletionRecord || null;
    try {
        const harness = window.HahaLabLearningHarness;
        const client = currentLabClient || getCurrentDetailClient() || {};
        const teacherId = String(getCurrentTeacherId() || '').trim();
        const clientId = String(client.id || currentDetailClientId || '').trim();
        if (!teacherId || !clientId) throw new Error('LEARNING_PENDING_OWNER_MISSING');
        let record = overlay.__pendingCompletionRecord;
        if (!record) {
            const harnessRecordId = String(eventPayload.detail?.harnessRecordId || '').trim();
            const original = options.harnessRecord || (harnessRecordId ? harness?.readRecords?.().find((item) => String(item.id || '') === harnessRecordId) : null);
            if (harnessRecordId && !original) throw new Error('LEARNING_PENDING_SOURCE_MISSING');
            const history = original ? JSON.parse(JSON.stringify(original.history)) : buildLabDirectCompletionHistoryRow({ kind: options.kind || currentLabKind, targetUrl: options.targetUrl || '', title: options.title || '', eventPayload });
            if (String(history?.teacher_id || history?.teacherId || '') !== teacherId || String(history?.client_id || history?.clientId || '') !== clientId) throw new Error('LEARNING_PENDING_OWNER_MISMATCH');
            const details = parseMaybeJson(history.details, {});
            if (details.session_id && details.sessionId && String(details.session_id) !== String(details.sessionId)) throw new Error('LEARNING_PENDING_SESSION_MISMATCH');
            const sessionId = String(details.session_id || details.sessionId || overlay.dataset.learningCompletionSessionId || '').trim()
                || `lab-direct-${typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2)}`;
            overlay.dataset.learningCompletionSessionId = sessionId;
            if (!details.session_id) details.session_id = sessionId;
            history.details = typeof history.details === 'string' ? JSON.stringify(details) : details;
            // Legacy pending data needs routing IDs and original task data, not
            // another persisted copy of the learner's display name.
            if (!original) { delete history.client_name; delete history.clientName; }
            record = { id: original?.id || history.id, clientId, history, ...(original?.cardlabAttempt ? { cardlabAttempt: JSON.parse(JSON.stringify(original.cardlabAttempt)) } : {}) };
            overlay.__pendingCompletionRecord = record;
        }
        pendingRecord = record;
        if (!harness?.queueSyncRecord || !harness?.readSyncQueue || !harness?.flushSyncQueue) throw new Error('LEARNING_PENDING_QUEUE_UNAVAILABLE');
        if (String(record.history.teacher_id || record.history.teacherId || '') !== teacherId || String(record.history.client_id || record.history.clientId || '') !== clientId) throw new Error('LEARNING_PENDING_OWNER_MISMATCH');
        const expectedDetails = parseMaybeJson(record.history.details, {});
        const sessionId = String(expectedDetails.session_id || expectedDetails.sessionId || '');
        const job = harness.queueSyncRecord(record, { durable: true });
        const queued = harness.readSyncQueue().find((item) => item.id === job?.id && String(parseMaybeJson(item.history?.details, {}).session_id || '') === sessionId);
        if (!queued || String(queued.history.teacher_id) !== teacherId || String(queued.history.client_id) !== clientId || JSON.stringify(parseMaybeJson(queued.history.details, {})) !== JSON.stringify(expectedDetails)) throw new Error('LEARNING_PENDING_DURABILITY_UNCONFIRMED');
        // The duplicate guard becomes true only after the exact pending job is
        // read back from durable storage. It is not a claim of server commit.
        window.__hahaLabUnstoredCompletions?.delete(record.id);
        overlay.dataset.learningCompletionSaved = 'true';
        overlay.dataset.learningCompletionSaveState = 'pending';
        if (typeof showBottomToast === 'function') showBottomToast('학습 기록을 임시 보관했습니다. 연결되면 서버 저장을 다시 확인합니다.');
        void harness.flushSyncQueue().then(async (result) => {
            const remains = harness.readSyncQueue().some((item) => item.id === job.id);
            if (currentLabDirectOverlay !== overlay || overlay.__pendingCompletionRecord !== record || remains || result?.error || !(result?.synced > 0)) return;
            overlay.dataset.learningCompletionSaveState = 'committed';
            if (String(currentDetailClientId || '') === clientId) {
                await loadDetailSupplementalData(getCurrentDetailClient() || currentLabClient || { id: clientId, type: 'client' });
                renderLabViewShell();
            }
        }).catch(() => {});
        void window.retryUnstoredLabCompletions?.();
    } catch (error) {
        if (pendingRecord && saveOwner?.authUserId) {
            window.__hahaLabUnstoredCompletions = window.__hahaLabUnstoredCompletions || new Map();
            window.__hahaLabUnstoredCompletions.set(pendingRecord.id, { record: pendingRecord, authUserId: saveOwner.authUserId, teacherId: saveOwner.teacherId });
        }
        overlay.dataset.learningCompletionSaved = 'false';
        overlay.dataset.learningCompletionSaveState = 'error';
        if (typeof showBottomToast === 'function') showBottomToast('학습 기록을 보관하지 못했습니다. 창을 닫지 말고 저장을 다시 시도해 주세요.');
        console.warn('[LabDirect] completion durability check failed:', error?.message || 'SAVE_FAILED');
    } finally {
        overlay.dataset.learningCompletionSaving = 'false';
    }
}


async function retryUnstoredLabCompletions() {
    const owner = window.getAuthenticatedReportOwner?.();
    const harness = window.HahaLabLearningHarness;
    if (!owner?.authUserId || !harness?.queueSyncRecord || !harness?.readSyncQueue) return;
    for (const [key, pending] of window.__hahaLabUnstoredCompletions || []) {
        if (pending.authUserId !== owner.authUserId || pending.teacherId !== owner.teacherId) continue;
        try {
            const job = harness.queueSyncRecord(pending.record, { durable: true });
            const queued = harness.readSyncQueue().find((item) => item.id === job?.id);
            if (!queued || String(queued.history.teacher_id) !== String(owner.teacherId)
                || String(queued.history.client_id) !== String(pending.record.history.client_id)
                || JSON.stringify(parseMaybeJson(queued.history.details, {})) !== JSON.stringify(parseMaybeJson(pending.record.history.details, {}))) continue;
            window.__hahaLabUnstoredCompletions.delete(key);
            if (currentLabDirectOverlay?.__pendingCompletionRecord?.id === pending.record.id) {
                currentLabDirectOverlay.dataset.learningCompletionSaved = 'true';
                currentLabDirectOverlay.dataset.learningCompletionSaveState = 'pending';
            }
        } catch (_error) { /* Keep the only raw copy in RAM until durable retry. */ }
    }
    void harness.flushSyncQueue?.();
}
window.retryUnstoredLabCompletions = retryUnstoredLabCompletions;
window.addEventListener('online', () => void retryUnstoredLabCompletions());

function isLabHistoryForKind(row = {}, kind = 'playlab') {
    const normalizedKind = normalizeLabKind(kind);
    const scope = typeof inferLabReportScopeFromHistoryRow === 'function'
        ? inferLabReportScopeFromHistoryRow(row)
        : String(row.reportScope || row.report_scope || row.labScope || row.lab_scope || '').toLowerCase();
    if (normalizedKind === 'rehab') return scope === LAB_REPORT_SCOPE_REHAB || scope === 'rehablab';
    if (normalizedKind === 'numberlab') return scope === LAB_REPORT_SCOPE_NUMBERLAB || scope === 'numberlab';
    if (normalizedKind === 'musicartlab') return scope === LAB_REPORT_SCOPE_MUSICARTLAB || scope === 'musicartlab';
    if (normalizedKind === 'playlab') return scope === LAB_REPORT_SCOPE_PLAYLAB || scope === 'playlab';
    if (normalizedKind === 'cardlab') return scope === 'cardlab' || /cardlab|카드랩/i.test(getLabHistoryComparableText(row));
    return false;
}

function isLabRecordMatchedToCategory(recordText = '', tokens = []) {
    const haystack = String(recordText || '').toLowerCase();
    if (!haystack) return false;
    return tokens.some((token) => {
        const normalized = String(token || '').toLowerCase().trim();
        return normalized && haystack.includes(normalized);
    });
}

function getLabCategoryActivity(category = {}, kind = currentLabKind, client = null) {
    const tokens = getLabCategoryMatchTokens(category);
    const clientId = String(client?.id || currentLabClient?.id || currentDetailClientId || '').trim();
    const data = currentDetailData || {};
    const stats = {
        playCount: 0,
        lastPlayedAtMs: 0,
        firstPlayedAtMs: 0,
        lastPlayedLabel: '',
        playCountLabel: '학습 0회',
        hasPlayed: false
    };
    const bump = (dateMs) => {
        stats.playCount += 1;
        if (Number.isFinite(dateMs) && dateMs > 0) {
            stats.lastPlayedAtMs = Math.max(stats.lastPlayedAtMs || 0, dateMs);
            stats.firstPlayedAtMs = stats.firstPlayedAtMs > 0 ? Math.min(stats.firstPlayedAtMs, dateMs) : dateMs;
        }
    };

    if (normalizeLabKind(kind) === 'cardlab') {
        (data.cardlabAttempts || []).forEach((attempt) => {
            if (clientId && String(attempt.clientId || attempt.client_id || '').trim() && String(attempt.clientId || attempt.client_id || '').trim() !== clientId) return;
            const attemptText = collectLabActivityTokens([
                attempt.curriculumKey,
                attempt.curriculum_key,
                attempt.labTitle,
                attempt.lab_title,
                attempt.labLabel,
                attempt.lab_label,
                attempt.labKind,
                attempt.lab_kind,
                attempt.stageTitle,
                attempt.stage_title,
                attempt.stageKey,
                attempt.stage_key,
                attempt.sourcePage,
                attempt.source_page,
                attempt.fileName,
                attempt.file_name,
                attempt.targetUrl,
                attempt.target_url,
                attempt.metadata,
                attempt.details
            ]).join(' ');
            if (isLabRecordMatchedToCategory(attemptText, tokens)) {
                bump(getCardlabAttemptDateMs(attempt));
            }
        });
    }

    (data.histories || []).forEach((history) => {
        const row = typeof normalizeLabHistoryRow === 'function' ? normalizeLabHistoryRow(history) : keysToCamel(history);
        if (clientId && String(row.clientId || row.client_id || '').trim() && String(row.clientId || row.client_id || '').trim() !== clientId) return;
        if (!isLabHistoryForKind(row, kind)) return;
        if (isLabRecordMatchedToCategory(getLabHistoryComparableText(row), tokens)) {
            bump(getLabHistoryDateMs(row));
        }
    });

    stats.hasPlayed = stats.playCount > 0;
    stats.playCountLabel = `학습 ${stats.playCount}회`;
    stats.lastPlayedLabel = stats.lastPlayedAtMs > 0
        ? `최근 ${formatDateTimeDisplay(new Date(stats.lastPlayedAtMs).toISOString()).replace(/\s오전.+$|\s오후.+$/, '')}`
        : '아직 수업 전';
    return stats;
}

function getLabFilterTagOptions(categories = []) {
    const counts = new Map();
    categories.forEach((category) => {
        normalizeLabLauncherTags(category.tags).forEach((tag) => {
            const normalized = String(tag || '').replace(/^#+/, '').trim();
            if (!normalized) return;
            counts.set(normalized, (counts.get(normalized) || 0) + 1);
        });
    });
    return Array.from(counts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((left, right) => {
            if (right.count !== left.count) return right.count - left.count;
            return left.tag.localeCompare(right.tag, 'ko');
        });
}

function readJsonStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        if (!value) return fallback;
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    } catch (_error) {
        return fallback;
    }
}

function writeJsonStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
        // Storage is optional; the LAB launcher still works without persistence.
    }
}

function getLabLauncherStorageScope() {
    return String(getCurrentTeacherId() || window.currentProfile?.id || window.currentProfile?.email || 'local').trim() || 'local';
}

function getLabCategoryIdentity(kind = currentLabKind, category = {}) {
    const normalizedKind = normalizeLabKind(kind);
    const fileName = getLabLauncherFileName(category);
    return [
        normalizedKind,
        String(category.id || '').trim(),
        fileName,
        String(category.targetUrl || category.target_url || '').trim(),
        String(category.title || '').trim()
    ].filter(Boolean).join('::').toLowerCase();
}

function getLabCategoryVersionKey(kind = currentLabKind, category = {}) {
    return [
        getLabCategoryIdentity(kind, category),
        String(category.modifiedDate || category.modified_date || '').trim(),
        String(category.createdDate || category.created_date || '').trim(),
        String(category.registeredAt || category.registered_at || '').trim(),
        String(category.scheduledAt || category.scheduled_at || '').trim(),
        String(category.sortOrder ?? category.sort_order ?? '').trim()
    ].join('::').toLowerCase();
}

function readLabFavorites() {
    const all = readJsonStorage(LAB_LAUNCHER_FAVORITES_STORAGE_KEY, {});
    const scoped = all && typeof all === 'object' ? all[getLabLauncherStorageScope()] : null;
    return scoped && typeof scoped === 'object' ? scoped : {};
}

function writeLabFavorites(nextFavorites = {}) {
    const all = readJsonStorage(LAB_LAUNCHER_FAVORITES_STORAGE_KEY, {});
    const next = all && typeof all === 'object' ? { ...all } : {};
    next[getLabLauncherStorageScope()] = nextFavorites;
    writeJsonStorage(LAB_LAUNCHER_FAVORITES_STORAGE_KEY, next);
}

function isLabCategoryFavorite(kind = currentLabKind, category = {}) {
    return readLabFavorites()[getLabCategoryIdentity(kind, category)] === true;
}

function toggleLabFavorite(kind = currentLabKind, categoryId = '') {
    const normalizedKind = normalizeLabKind(kind);
    const categories = getLabLauncherCategories(normalizedKind);
    const category = categories.find((item) => String(item.id || '').trim() === String(categoryId || '').trim());
    if (!category) return;
    const favorites = readLabFavorites();
    const identity = getLabCategoryIdentity(normalizedKind, category);
    if (favorites[identity]) delete favorites[identity];
    else favorites[identity] = true;
    writeLabFavorites(favorites);
    renderLabViewShell();
}

function readLabSearchHistory(kind = currentLabKind) {
    const all = readJsonStorage(LAB_LAUNCHER_SEARCH_HISTORY_STORAGE_KEY, {});
    const scoped = all && typeof all === 'object' ? all[getLabLauncherStorageScope()] : null;
    const normalizedKind = normalizeLabKind(kind);
    const list = scoped && typeof scoped === 'object' && Array.isArray(scoped[normalizedKind]) ? scoped[normalizedKind] : [];
    return list.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 8);
}

function writeLabSearchHistory(kind = currentLabKind, list = []) {
    const all = readJsonStorage(LAB_LAUNCHER_SEARCH_HISTORY_STORAGE_KEY, {});
    const next = all && typeof all === 'object' ? { ...all } : {};
    const scope = getLabLauncherStorageScope();
    const scoped = next[scope] && typeof next[scope] === 'object' ? { ...next[scope] } : {};
    scoped[normalizeLabKind(kind)] = Array.from(new Set(list.map((item) => String(item || '').trim()).filter(Boolean))).slice(0, 8);
    next[scope] = scoped;
    writeJsonStorage(LAB_LAUNCHER_SEARCH_HISTORY_STORAGE_KEY, next);
}

function rememberLabSearchTerm(kind = currentLabKind, term = '') {
    const normalized = String(term || '').trim();
    if (!normalized) return;
    writeLabSearchHistory(kind, [normalized, ...readLabSearchHistory(kind).filter((item) => item !== normalized)]);
}

function getLabSearchTerm(kind = currentLabKind) {
    return String(currentLabSearchByKind[normalizeLabKind(kind)] || '').trim();
}

function getHangulInitials(value = '') {
    const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    return String(value || '').split('').map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 0xac00 && code <= 0xd7a3) return CHOSUNG[Math.floor((code - 0xac00) / 588)] || char;
        return char;
    }).join('');
}

function normalizeLabSearchText(value = '') {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
}

function getLabCategorySearchTokens(category = {}) {
    const tags = normalizeLabLauncherTags(category.tags).join(' ');
    const text = [
        category.title,
        category.label,
        category.name,
        category.desc,
        category.description,
        tags,
        getLabLauncherFileName(category),
        category.targetUrl,
        category.badge
    ].map((value) => String(value || '').trim()).filter(Boolean).join(' ');
    return `${normalizeLabSearchText(text)} ${normalizeLabSearchText(getHangulInitials(text))}`;
}

function doesLabCategoryMatchSearch(category = {}, term = '') {
    const query = normalizeLabSearchText(term);
    if (!query) return true;
    return getLabCategorySearchTokens(category).includes(query);
}

function getLabSearchSuggestions(categories = [], kind = currentLabKind) {
    const term = getLabSearchTerm(kind);
    const history = readLabSearchHistory(kind).filter((item) => !term || normalizeLabSearchText(item).includes(normalizeLabSearchText(term))).slice(0, 4);
    const matches = term
        ? categories.filter((category) => doesLabCategoryMatchSearch(category, term)).slice(0, 6)
        : [];
    return { history, matches };
}

function setLabSearchTerm(value = '') {
    const normalizedKind = normalizeLabKind(currentLabKind);
    const shouldRefocus = document.activeElement?.classList?.contains('lab-search-input');
    currentLabSearchByKind[normalizedKind] = String(value || '').trim();
    currentLabTabletDetailOpen = false;
    persistShellViewState({ labKind: currentLabKind });
    renderLabViewShell();
    if (shouldRefocus) {
        requestAnimationFrame(() => {
            const input = document.querySelector('.lab-search-input');
            if (!input) return;
            input.focus({ preventScroll: true });
            const cursorAt = String(input.value || '').length;
            input.setSelectionRange?.(cursorAt, cursorAt);
        });
    }
}

function submitLabSearchTerm(value = '') {
    const normalized = String(value || '').trim();
    if (normalized) rememberLabSearchTerm(currentLabKind, normalized);
    setLabSearchTerm(normalized);
}

function selectLabSearchSuggestion(value = '') {
    submitLabSearchTerm(value);
}

function clearLabSearchTerm() {
    setLabSearchTerm('');
}

function readLabSeenItemsState() {
    const all = readJsonStorage(LAB_LAUNCHER_SEEN_ITEMS_STORAGE_KEY, {});
    const scope = getLabLauncherStorageScope();
    const scoped = all && typeof all === 'object' ? all[scope] : null;
    return scoped && typeof scoped === 'object' ? scoped : null;
}

function writeLabSeenItemsState(state = {}) {
    const all = readJsonStorage(LAB_LAUNCHER_SEEN_ITEMS_STORAGE_KEY, {});
    const next = all && typeof all === 'object' ? { ...all } : {};
    next[getLabLauncherStorageScope()] = state;
    writeJsonStorage(LAB_LAUNCHER_SEEN_ITEMS_STORAGE_KEY, next);
}

function getAllLabCategoryVersionKeys() {
    const keys = {};
    LAB_LAUNCHER_KIND_ORDER.forEach((kind) => {
        getLabLauncherCategories(kind).forEach((category) => {
            keys[getLabCategoryVersionKey(kind, category)] = true;
        });
    });
    return keys;
}

function isLabCategoryUnseen(kind = currentLabKind, category = {}) {
    const seen = readLabSeenItemsState();
    if (!seen || seen.initialized !== true) return false;
    return seen.items?.[getLabCategoryVersionKey(kind, category)] !== true;
}

function parseLabRegistrationTime(value = '') {
    const normalized = String(value || '').trim();
    if (!normalized) return 0;
    const parsed = new Date(normalized).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
}

function getLabCategoryRegistrationTime(category = {}) {
    const registeredAtMs = parseLabRegistrationTime(
        category.registeredAt || category.registered_at || category.createdDate || category.created_date || category.createdAt || category.created_at
    );
    const scheduledAtMs = parseLabRegistrationTime(category.scheduledAt || category.scheduled_at);
    return scheduledAtMs > registeredAtMs ? scheduledAtMs : registeredAtMs;
}

function isLabCategoryNew(kind = currentLabKind, category = {}, now = Date.now()) {
    const registeredAtMs = getLabCategoryRegistrationTime(category);
    const elapsedMs = Number(now) - registeredAtMs;
    return registeredAtMs > 0 && elapsedMs >= 0 && elapsedMs < LAB_NEW_WINDOW_MS;
}

function syncLabLauncherNewItems({ showModal = false } = {}) {
    const currentItems = getAllLabCategoryVersionKeys();
    const seen = readLabSeenItemsState();
    if (!seen || seen.initialized !== true) {
        writeLabSeenItemsState({ initialized: true, updatedAt: new Date().toISOString(), items: currentItems });
        currentLabUpdateItems = [];
        return [];
    }
    const newItems = [];
    LAB_LAUNCHER_KIND_ORDER.forEach((kind) => {
        getLabLauncherCategories(kind).forEach((category) => {
            const key = getLabCategoryVersionKey(kind, category);
            if (seen.items?.[key] === true) return;
            newItems.push({ kind, category, key });
        });
    });
    currentLabUpdateItems = newItems;
    if (showModal && newItems.length) openLabUpdateModal(newItems);
    return newItems;
}

function markLabUpdateItemsSeen(items = currentLabUpdateItems) {
    const seen = readLabSeenItemsState() || { initialized: true, items: {} };
    const nextItems = { ...(seen.items || {}) };
    const targetItems = Array.isArray(items) && items.length ? items : LAB_LAUNCHER_KIND_ORDER.flatMap((kind) => getLabLauncherCategories(kind).map((category) => ({ kind, category })));
    targetItems.forEach((item) => {
        const category = item.category || item;
        nextItems[item.key || getLabCategoryVersionKey(item.kind || currentLabKind, category)] = true;
    });
    writeLabSeenItemsState({ initialized: true, updatedAt: new Date().toISOString(), items: nextItems });
    currentLabUpdateItems = [];
}

function openLabUpdateModal(items = currentLabUpdateItems) {
    const modal = document.getElementById('labUpdateModal');
    const list = document.getElementById('labUpdateList');
    const title = document.getElementById('labUpdateTitle');
    const subtitle = document.getElementById('labUpdateSubtitle');
    if (!modal || !list) return;
    const safeItems = Array.isArray(items) ? items : [];
    const byKind = safeItems.reduce((map, item) => {
        const kind = normalizeLabKind(item.kind);
        if (!map[kind]) map[kind] = [];
        map[kind].push(item.category);
        return map;
    }, {});
    if (title) title.textContent = `${getLabKindLabel(currentLabKind)} 업데이트 안내`;
    if (subtitle) {
        const kindLabels = Object.keys(byKind).map((kind) => `${getLabKindLabel(kind)} ${byKind[kind].length}개`);
        subtitle.textContent = kindLabels.length
            ? `${kindLabels.join(', ')}가 새로 등록되었습니다. 수업 목적에 맞게 바로 선택할 수 있습니다.`
            : '새로 등록된 학습이 없습니다.';
    }
    list.innerHTML = safeItems.slice(0, 16).map((item) => `
        <li>
            <span class="lab-update-kind">${escapeHtml(getLabKindLabel(item.kind))}</span>
            <strong>${escapeHtml(item.category?.title || '새 학습')}</strong>
            <em>${escapeHtml(item.category?.desc || '새로운 학습 활동이 추가되었습니다.')}</em>
        </li>
    `).join('');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeLabUpdateModal({ markSeen = true } = {}) {
    const modal = document.getElementById('labUpdateModal');
    if (markSeen) markLabUpdateItemsSeen(currentLabUpdateItems);
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
    renderLabViewShell();
}

function getFilteredSortedLabCategories(categories = [], kind = currentLabKind, client = null) {
    const normalizedKind = normalizeLabKind(kind);
    const activeTags = getCurrentLabTagFilters(normalizedKind);
    const sortMode = getCurrentLabSort(normalizedKind);
    const searchTerm = getLabSearchTerm(normalizedKind);
    const prepared = categories.map((category, index) => ({
        ...category,
        __labOriginalIndex: index,
        __labAdminOrder: getLabCategoryAdminOrder(category, index),
        __labRegisteredAtMs: getLabCategoryRegistrationTime(category),
        __labActivity: getLabCategoryActivity(category, normalizedKind, client),
        __labFavorite: isLabCategoryFavorite(normalizedKind, category),
        __labNew: isLabCategoryNew(normalizedKind, category)
    }));
    const tagFiltered = activeTags.includes('all')
        ? prepared
        : prepared.filter((category) => {
            const tagSet = new Set(normalizeLabLauncherTags(category.tags).map((tag) => String(tag || '').replace(/^#+/, '').trim()));
            return activeTags.some((tag) => tagSet.has(tag));
        });
    const filtered = searchTerm
        ? tagFiltered.filter((category) => doesLabCategoryMatchSearch(category, searchTerm))
        : tagFiltered;
    return filtered.sort((left, right) => {
        if (left.__labNew !== right.__labNew) return left.__labNew ? -1 : 1;
        if (left.__labFavorite !== right.__labFavorite) return left.__labFavorite ? -1 : 1;
        if (sortMode === 'frequent') {
            const countDiff = Number(right.__labActivity?.playCount || 0) - Number(left.__labActivity?.playCount || 0);
            if (countDiff !== 0) return countDiff;
            const lastDiff = Number(right.__labActivity?.lastPlayedAtMs || 0) - Number(left.__labActivity?.lastPlayedAtMs || 0);
            if (lastDiff !== 0) return lastDiff;
            return Number(left.__labAdminOrder || 0) - Number(right.__labAdminOrder || 0);
        }
        if (sortMode === 'adminDesc') {
            const leftRegisteredAt = Number(left.__labRegisteredAtMs || 0);
            const rightRegisteredAt = Number(right.__labRegisteredAtMs || 0);
            if (leftRegisteredAt > 0 && rightRegisteredAt > 0 && leftRegisteredAt !== rightRegisteredAt) return rightRegisteredAt - leftRegisteredAt;
            if (leftRegisteredAt > 0 && rightRegisteredAt <= 0) return -1;
            if (rightRegisteredAt > 0 && leftRegisteredAt <= 0) return 1;
            return Number(right.__labOriginalIndex || 0) - Number(left.__labOriginalIndex || 0);
        }
        if (sortMode === 'adminAsc') {
            const leftRegisteredAt = Number(left.__labRegisteredAtMs || 0);
            const rightRegisteredAt = Number(right.__labRegisteredAtMs || 0);
            if (leftRegisteredAt > 0 && rightRegisteredAt > 0 && leftRegisteredAt !== rightRegisteredAt) return leftRegisteredAt - rightRegisteredAt;
            if (leftRegisteredAt > 0 && rightRegisteredAt <= 0) return -1;
            if (rightRegisteredAt > 0 && leftRegisteredAt <= 0) return 1;
            return Number(left.__labOriginalIndex || 0) - Number(right.__labOriginalIndex || 0);
        }
        const leftLast = Number(left.__labActivity?.lastPlayedAtMs || 0);
        const rightLast = Number(right.__labActivity?.lastPlayedAtMs || 0);
        if (leftLast > 0 && rightLast > 0 && leftLast !== rightLast) return rightLast - leftLast;
        if (leftLast > 0 && rightLast <= 0) return -1;
        if (rightLast > 0 && leftLast <= 0) return 1;
        const orderDiff = Number(left.__labAdminOrder || 0) - Number(right.__labAdminOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return Number(left.__labOriginalIndex || 0) - Number(right.__labOriginalIndex || 0);
    });
}

function getVisibleLabCategories(kind = currentLabKind, client = null) {
    return getFilteredSortedLabCategories(
        getLabLauncherCategories(kind),
        kind,
        currentLabAnonymousMode ? null : (client || currentLabClient || getCurrentDetailClient())
    );
}

function renderLabListControls(categories = [], visibleCategories = [], kind = currentLabKind) {
    const container = document.getElementById('labListControls');
    if (!container) return;
    const normalizedKind = normalizeLabKind(kind);
    const tagOptions = getLabFilterTagOptions(categories);
    const activeTags = getCurrentLabTagFilters(normalizedKind);
    const isExpanded = currentLabFilterExpandedByKind[normalizedKind] === true;
    const visibleTagOptions = isExpanded ? tagOptions : tagOptions.slice(0, 8);
    const sortMode = getCurrentLabSort(normalizedKind);
    const searchTerm = getLabSearchTerm(normalizedKind);
    const suggestions = getLabSearchSuggestions(categories, normalizedKind);
    container.innerHTML = `
        <div class="lab-filter-summary">
            <strong>${escapeHtml(getLabKindLabel(normalizedKind))}</strong>
            <span>${visibleCategories.length}개 학습 표시${searchTerm ? ` · "${escapeHtml(searchTerm)}" 검색` : ''}</span>
        </div>
        ${currentLabAnonymousMode ? `
            <div class="lab-anonymous-banner">
                <strong>선택된 내담자 없이 LAB을 시작했습니다.</strong>
                <span>이 진입에서는 학습 기록, 리포트, 전문 분석이 저장되지 않습니다. 기록이 필요하면 내담자를 선택한 뒤 다시 시작해 주세요.</span>
            </div>
        ` : ''}
        <div class="lab-search-panel">
            <label class="lab-search-wrap" aria-label="LAB 학습 검색">
                <span class="material-symbols-outlined">search</span>
                <input
                    type="search"
                    class="lab-search-input"
                    value="${escapeHtml(searchTerm)}"
                    placeholder="학습명, 초성, 태그, 파일명 검색"
                    autocomplete="off"
                    oninput="setLabSearchTerm(this.value)"
                    onchange="submitLabSearchTerm(this.value)"
                    onkeydown="if(event.key === 'Enter') submitLabSearchTerm(this.value)"
                >
                ${searchTerm ? `<button type="button" class="lab-search-clear" onclick="clearLabSearchTerm()" aria-label="검색어 지우기"><span class="material-symbols-outlined">close</span></button>` : ''}
            </label>
            ${(searchTerm || suggestions.history.length) ? `
                <div class="lab-search-suggestions" aria-label="검색 제안">
                    ${searchTerm ? suggestions.matches.map((category) => `
                        <button type="button" class="lab-search-suggestion" onclick="selectLabSubcategory('${escapeInlineJsString(category.id || '')}')">
                            <span class="material-symbols-outlined">north_east</span>
                            <strong>${escapeHtml(category.title || '')}</strong>
                            <em>${escapeHtml((normalizeLabLauncherTags(category.tags)[0] || getLabKindLabel(normalizedKind)))}</em>
                        </button>
                    `).join('') : ''}
                    ${suggestions.history.length ? suggestions.history.map((term) => `
                        <button type="button" class="lab-search-history" onclick="selectLabSearchSuggestion('${escapeInlineJsString(term)}')">
                            <span class="material-symbols-outlined">history</span>${escapeHtml(term)}
                        </button>
                    `).join('') : ''}
                </div>
            ` : ''}
        </div>
        <div class="lab-filter-toolbar">
            <div class="lab-filter-tags" role="group" aria-label="학습 목적 해시태그">
                <button type="button" class="lab-filter-chip${activeTags.includes('all') ? ' active' : ''}" onclick="setLabTagFilters('all')">전체</button>
                ${visibleTagOptions.map(({ tag, count }) => `
                    <button type="button" class="lab-filter-chip${activeTags.includes(tag) ? ' active' : ''}" onclick="toggleLabTagFilter('${escapeInlineJsString(tag)}')">
                        <span>#${escapeHtml(tag)}</span>
                        <em>${count}</em>
                    </button>
                `).join('')}
                ${tagOptions.length > 8 ? `
                    <button type="button" class="lab-filter-more-btn" onclick="toggleLabFilterExpanded()">
                        ${isExpanded ? '접기' : `더보기 ${tagOptions.length - 8}`}
                    </button>
                ` : ''}
            </div>
            <div class="lab-sort-chip-group" role="group" aria-label="학습 정렬">
                <span class="lab-sort-chip-label">정렬</span>
                ${LAB_SORT_OPTIONS.map((option) => `
                    <button
                        type="button"
                        class="lab-sort-chip${sortMode === option.id ? ' active' : ''}"
                        data-sort-mode="${escapeHtml(option.id)}"
                        aria-pressed="${sortMode === option.id ? 'true' : 'false'}"
                        onclick="setLabSortMode('${escapeInlineJsString(option.id)}')"
                    >${escapeHtml(option.label)}</button>
                `).join('')}
            </div>
        </div>
    `;
}

function setLabTagFilters(value = 'all') {
    const normalizedKind = normalizeLabKind(currentLabKind);
    currentLabTagFiltersByKind[normalizedKind] = normalizeLabFilterTagList(value);
    currentLabTabletDetailOpen = false;
    persistShellViewState({ labKind: currentLabKind });
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
}

function toggleLabTagFilter(tag = '') {
    const normalizedKind = normalizeLabKind(currentLabKind);
    const normalizedTag = String(tag || '').replace(/^#+/, '').trim();
    if (!normalizedTag) return;
    const current = getCurrentLabTagFilters(normalizedKind);
    const next = current.includes('all')
        ? [normalizedTag]
        : current.includes(normalizedTag)
            ? current.filter((item) => item !== normalizedTag)
            : [...current, normalizedTag];
    currentLabTagFiltersByKind[normalizedKind] = next.length ? next : ['all'];
    currentLabTabletDetailOpen = false;
    persistShellViewState({ labKind: currentLabKind });
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
}

function toggleLabFilterExpanded() {
    const normalizedKind = normalizeLabKind(currentLabKind);
    currentLabFilterExpandedByKind[normalizedKind] = currentLabFilterExpandedByKind[normalizedKind] !== true;
    renderLabViewShell();
}

function setLabSortMode(value = 'adminDesc') {
    const normalizedKind = normalizeLabKind(currentLabKind);
    const next = LAB_SORT_OPTIONS.some((option) => option.id === value) ? value : 'adminDesc';
    currentLabSortByKind[normalizedKind] = next;
    persistShellViewState({ labKind: currentLabKind });
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
}

function getLabLauncherSelectedCategory(kind = 'cardlab') {
    const categories = getVisibleLabCategories(kind);
    if (!categories.length) return null;
    const preferredId = String(currentLabSelectionByKind[String(kind || 'cardlab').toLowerCase()] || currentLabSubcategoryId || '').trim();
    return categories.find((item) => String(item.id || '').trim() === preferredId) || categories[0] || null;
}

function slugifyLabText(value = '') {
    return String(value || '')
        .toLowerCase()
        .replace(/[^0-9a-z가-힣]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .trim();
}

function getLabSelectionKey(kind = 'cardlab', categoryId = '') {
    return `${String(kind || 'cardlab').toLowerCase()}:${String(categoryId || '').trim()}`;
}

function isLabTabletLayout() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(max-width: 1200px)').matches;
}

function isLabTouchTabletLayout() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    const ua = typeof navigator !== 'undefined' ? String(navigator.userAgent || '') : '';
    const coarseTabletViewport = window.matchMedia('(pointer: coarse) and (min-width: 768px) and (max-width: 1366px)').matches;
    const androidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
    const iPadLike = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints || 0) > 1);
    return coarseTabletViewport || androidTablet || iPadLike;
}

function getLabStageId(stage = {}, index = 0) {
    const candidate = String(stage?.id || stage?.stageId || stage?.key || '').trim();
    if (candidate) return candidate;
    return slugifyLabText(`${String(stage?.title || 'stage').trim()}-${index + 1}`);
}

function getLabLauncherStages(category = {}) {
    return Array.isArray(category?.stages) ? category.stages : [];
}

function resolveLabCategoryTargetUrl(category = null) {
    const raw = String(category?.targetUrl || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw) || /^file:\/\//i.test(raw)) return raw;
    if (raw.startsWith('/')) {
        if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
            return `.${raw}`;
        }
        return raw;
    }
    const normalized = raw.replace(/^\.\//, '').replace(/^\/+/, '');
    if (/^[^/]+\.html?$/i.test(normalized)) {
        return window.location?.protocol === 'file:'
            ? `./playlab/${normalized}`
            : `/playlab/${normalized}`;
    }
    return raw.startsWith('./') ? raw : `./${raw}`;
}

function buildLabLaunchPayload(kind = 'cardlab', client = null, options = {}) {
    const normalizedKind = String(kind || 'cardlab').trim().toLowerCase();
    const normalizedClient = client && typeof client === 'object' ? client : {};
    const anonymous = options?.anonymous === true;
    return {
        kind: normalizedKind,
        teacherId: getCurrentTeacherId(),
        teacherName: getCurrentTeacherName(),
        clientId: anonymous ? '' : String(normalizedClient.id || normalizedClient.clientId || '').trim(),
        clientName: String(normalizedClient.name || '').trim(),
        clientType: String(normalizedClient.type || 'client').trim() || 'client',
        clientGender: anonymous ? '' : String(normalizedClient.gender || normalizedClient.sex || '').trim(),
        anonymous,
        createdAt: new Date().toISOString(),
        source: 'class-new'
    };
}

function buildLabReturnUrl(kind = 'cardlab') {
    if (typeof window === 'undefined') return '';
    try {
        const returnUrl = new URL(window.location.href);
        returnUrl.searchParams.delete('start');
        ['teacherName', 'clientName', 'teacherId', 'clientId', 'playlabToken'].forEach((key) => returnUrl.searchParams.delete(key));
        returnUrl.searchParams.set(SHELL_VIEW_QUERY_PARAM, 'lab');
        returnUrl.searchParams.set(SHELL_LAB_KIND_QUERY_PARAM, normalizeLabKind(kind || currentLabKind || 'cardlab'));
        return returnUrl.toString();
    } catch (_error) {
        return '';
    }
}

function persistLabReturnUrl(returnUrl = '') {
    const normalized = String(returnUrl || '').trim();
    if (!normalized) return;
    try {
        sessionStorage.setItem(LAB_RETURN_URL_STORAGE_KEY, normalized);
    } catch (_error) {
        // noop
    }
}

window.readTransientLabLaunchContext = function (launchKey, requester) {
    const record = window.__hahaLabLaunchContexts?.get(String(launchKey || ''));
    if (!record) return null;
    if (record.expiresAt <= Date.now() || record.payload.teacherId !== getCurrentTeacherId()) { window.__hahaLabLaunchContexts.delete(String(launchKey || '')); return null; }
    const frame = currentLabDirectOverlay?.querySelector('iframe');
    if (!requester || requester !== frame?.contentWindow && requester !== record.detachedWindow) return null;
    try { if (requester.location.origin !== window.location.origin) return null; } catch (_error) { return null; }
    return JSON.parse(JSON.stringify(record.payload));
};

function buildLabLaunchUrl(targetUrl = '', kind = 'cardlab', client = null, options = {}) {
    const raw = String(targetUrl || '').trim();
    if (!raw || typeof window === 'undefined') return raw;

    try {
        const resolvedUrl = new URL(raw, window.location.href);
        const isSameOrigin = resolvedUrl.origin === window.location.origin || window.location.protocol === 'file:';
        if (!isSameOrigin) return raw;
        ['teacherName', 'clientName', 'teacherId', 'clientId', 'clientType', 'playlabToken'].forEach((key) => resolvedUrl.searchParams.delete(key));

        const payload = buildLabLaunchPayload(kind, client, options);
        const returnUrl = buildLabReturnUrl(payload.kind);
        if (returnUrl) {
            resolvedUrl.searchParams.set('labReturnUrl', returnUrl);
            persistLabReturnUrl(returnUrl);
        }
        if (!payload.teacherId) return '';

        const launchKey = `${LAB_LAUNCH_CONTEXT_STORAGE_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        let stored = false;
        try {
            window.__hahaLabLaunchContexts = window.__hahaLabLaunchContexts || new Map();
            window.__hahaLabLaunchContexts.set(launchKey, { payload, expiresAt: Date.now() + 30 * 60 * 1000 });
            window.setTimeout(() => window.__hahaLabLaunchContexts?.delete(launchKey), 30 * 60 * 1000);
            const routingContext = {
                kind: normalizeLabKind(kind), teacherId: String(payload.teacherId),
                clientId: String(payload.clientId), clientType: payload.anonymous ? 'anonymous' : 'client',
                anonymous: payload.anonymous === true, source: 'class-new-routing-only'
            };
            sessionStorage.setItem(launchKey, JSON.stringify(routingContext));
            stored = true;
        } catch (_error) {
            stored = false;
        }
        if (stored) {
            resolvedUrl.searchParams.set('labLaunchKey', launchKey);
        }
        if (!stored) throw new Error('LAB_LAUNCH_CONTEXT_UNAVAILABLE');
        if (payload.anonymous) {
            resolvedUrl.searchParams.set('labAnonymous', '1');
        } else {
            resolvedUrl.searchParams.delete('labAnonymous');
        }
        resolvedUrl.searchParams.set('labKind', payload.kind);
        return resolvedUrl.toString();
    } catch (_error) {
        return '';
    }
}

function openDetachedLabWindow(preparedUrl = '') {
    if (!preparedUrl) return null;
    const target = window.open('about:blank', '_blank');
    if (!target) return null;
    try {
        const launchKey = new URL(preparedUrl, window.location.href).searchParams.get('labLaunchKey');
        const context = launchKey && sessionStorage.getItem(launchKey);
        if (context) target.sessionStorage.setItem(launchKey, context);
        const transient = window.__hahaLabLaunchContexts?.get(launchKey);
        if (transient) transient.detachedWindow = target;
        // The detached fallback receives only minimal routing IDs in storage.
        // It has no access to the full memory context after opener is cleared.
        target.opener = null;
        target.location.replace(preparedUrl);
        return target;
    } catch (_error) {
        target.close();
        return null;
    }
}

async function exitLabFullscreen() {
    if (typeof document === 'undefined') return false;
    const exit =
        document.exitFullscreen
        || document.webkitExitFullscreen
        || document.mozCancelFullScreen
        || document.msExitFullscreen;
    if (typeof exit !== 'function') return false;
    try {
        await exit.call(document);
        return true;
    } catch (_error) {
        return false;
    }
}

function closeLabDirectTargetOverlay({ restoreShell = true } = {}) {
    if (!currentLabDirectOverlay) return;

    const returnShellView = String(currentLabDirectOverlay.dataset.returnShellView || '').trim();
    const returnDetailSubTab = String(currentLabDirectOverlay.dataset.returnDetailSubTab || '').trim();
    try {
        const frame = currentLabDirectOverlay.querySelector('iframe');
        const key = frame && new URL(frame.src, window.location.href).searchParams.get('labLaunchKey');
        if (key) { window.__hahaLabLaunchContexts?.delete(key); sessionStorage.removeItem(key); }
    } catch (_error) { /* Inaccessible frames have no readable local context. */ }
    const previousBodyOverflow = currentLabDirectOverlayBodyOverflow;
    const previousHtmlOverflow = currentLabDirectOverlayHtmlOverflow;
    const previousBodyHeight = currentLabDirectOverlayBodyHeight;
    const previousHtmlHeight = currentLabDirectOverlayHtmlHeight;
    const previousBodyMinHeight = currentLabDirectOverlayBodyMinHeight;
    const previousHtmlMinHeight = currentLabDirectOverlayHtmlMinHeight;

    if (typeof currentLabDirectOverlayCleanup === 'function') {
        try {
            currentLabDirectOverlayCleanup();
        } catch (_error) {
            // noop
        }
    }

    currentLabDirectOverlayCleanup = null;

    if (currentLabDirectOverlay.parentNode) {
        currentLabDirectOverlay.parentNode.removeChild(currentLabDirectOverlay);
    }

    currentLabDirectOverlay = null;
    currentLabDirectOverlayBodyOverflow = '';
    currentLabDirectOverlayHtmlOverflow = '';
    currentLabDirectOverlayBodyHeight = '';
    currentLabDirectOverlayHtmlHeight = '';
    currentLabDirectOverlayBodyMinHeight = '';
    currentLabDirectOverlayHtmlMinHeight = '';

    if (typeof document !== 'undefined' && document.body && document.documentElement) {
        document.body.classList.remove('lab-direct-document-scroll');
        document.body.style.overflow = previousBodyOverflow || '';
        document.documentElement.style.overflow = previousHtmlOverflow || '';
        document.body.style.height = previousBodyHeight || '';
        document.documentElement.style.height = previousHtmlHeight || '';
        document.body.style.minHeight = previousBodyMinHeight || '';
        document.documentElement.style.minHeight = previousHtmlMinHeight || '';
    }

    exitLabFullscreen();

    if (restoreShell && returnShellView === 'detail' && returnDetailSubTab) {
        updateShellViewState('detail');
        activateDetailSubTab(returnDetailSubTab, { persist: true, scrollToTop: true });
        requestAnimationFrame(() => {
            activateDetailSubTab(returnDetailSubTab, { persist: true, scrollToTop: true });
        });
    } else if (restoreShell) {
        renderLabViewShell();
        requestAnimationFrame(() => scrollLabViewPanelsToTop());
    }
    if (currentShellView === 'detail' && currentDetailClientId) {
        refreshAfterClientMutation(currentDetailClientId).catch((error) => {
            console.warn('[LabDirect] detail refresh failed:', error);
        });
    }
}

function confirmCloseLabDirectTargetOverlay(options = {}) {
    if (currentLabDirectOverlay?.__pendingCompletionRequest && ['error', 'saving'].includes(currentLabDirectOverlay.dataset.learningCompletionSaveState)) {
        const request = currentLabDirectOverlay.__pendingCompletionRequest;
        if (typeof showBottomToast === 'function') showBottomToast('기록 보관을 확인하지 못했습니다. 저장을 다시 시도한 뒤 종료해 주세요.');
        if (currentLabDirectOverlay.dataset.learningCompletionSaveState === 'error') void persistLabDirectCompletionEvent(request.eventPayload, request.options);
        return;
    }
    if (currentLabDirectOverlay) {
        const existing = currentLabDirectOverlay.querySelector('.lab-direct-confirm');
        if (existing) return;

        const isReportDocumentScroll = currentLabDirectOverlay.dataset.reportDocumentScroll === 'true';
        const isAssessmentReturn = currentLabDirectOverlay.dataset.returnDetailSubTab === 'sub-assessment';
        const confirmLayer = document.createElement('div');
        confirmLayer.className = 'lab-direct-confirm';
        confirmLayer.style.position = isReportDocumentScroll ? 'fixed' : 'absolute';
        confirmLayer.style.inset = '0';
        confirmLayer.style.display = 'flex';
        confirmLayer.style.alignItems = 'center';
        confirmLayer.style.justifyContent = 'center';
        confirmLayer.style.padding = '24px';
        confirmLayer.style.background = 'rgba(15, 23, 42, 0.54)';
        confirmLayer.style.backdropFilter = 'blur(6px)';
        confirmLayer.style.zIndex = '2';

        const confirmCard = document.createElement('div');
        confirmCard.style.width = 'min(100%, 360px)';
        confirmCard.style.background = '#ffffff';
        confirmCard.style.borderRadius = '24px';
        confirmCard.style.padding = '24px 22px 20px';
        confirmCard.style.boxShadow = '0 28px 60px rgba(15, 23, 42, 0.28)';
        confirmCard.style.textAlign = 'center';

        const title = document.createElement('div');
        title.textContent = isAssessmentReturn ? '검사를 종료할까요?' : '학습을 종료할까요?';
        title.style.fontSize = '20px';
        title.style.fontWeight = '900';
        title.style.color = '#111827';
        title.style.letterSpacing = '-0.03em';

        const desc = document.createElement('div');
        desc.textContent = isAssessmentReturn
            ? 'H-EVI 로그에서 상세 리포트 확인이 가능합니다. 종료하면 검사 · 척도 화면으로 돌아갑니다.'
            : LAB_EXIT_CONFIRM_MESSAGE;
        desc.style.marginTop = '12px';
        desc.style.fontSize = '14px';
        desc.style.lineHeight = '1.6';
        desc.style.color = '#4b5563';

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'center';
        actions.style.gap = '10px';
        actions.style.marginTop = '20px';

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = '취소';
        cancelButton.style.height = '44px';
        cancelButton.style.minWidth = '112px';
        cancelButton.style.padding = '0 18px';
        cancelButton.style.borderRadius = '999px';
        cancelButton.style.border = '1px solid #d1d5db';
        cancelButton.style.background = '#ffffff';
        cancelButton.style.color = '#111827';
        cancelButton.style.fontWeight = '800';
        cancelButton.style.cursor = 'pointer';

        const okButton = document.createElement('button');
        okButton.type = 'button';
        okButton.textContent = isAssessmentReturn ? '검사종료' : '학습종료';
        okButton.style.height = '44px';
        okButton.style.minWidth = '112px';
        okButton.style.padding = '0 18px';
        okButton.style.borderRadius = '999px';
        okButton.style.border = '1px solid #d9c500';
        okButton.style.background = '#FEE500';
        okButton.style.color = '#191919';
        okButton.style.fontWeight = '900';
        okButton.style.cursor = 'pointer';
        okButton.style.boxShadow = '0 10px 22px rgba(254, 229, 0, 0.28)';

        const removeConfirmLayer = () => {
            if (confirmLayer.parentNode) {
                confirmLayer.parentNode.removeChild(confirmLayer);
            }
        };

        cancelButton.onclick = removeConfirmLayer;
        confirmLayer.onclick = (event) => {
            if (event.target === confirmLayer) removeConfirmLayer();
        };
        okButton.onclick = () => {
            removeConfirmLayer();
            closeLabDirectTargetOverlay(options);
        };

        actions.appendChild(cancelButton);
        actions.appendChild(okButton);
        confirmCard.appendChild(title);
        confirmCard.appendChild(desc);
        confirmCard.appendChild(actions);
        confirmLayer.appendChild(confirmCard);
        currentLabDirectOverlay.appendChild(confirmLayer);
        return;
    }

    showConfirm(LAB_EXIT_CONFIRM_MESSAGE, () => {
        closeLabDirectTargetOverlay(options);
    });
}

function getLabDirectFrameDocumentHeight(frame) {
    try {
        const doc = frame?.contentDocument || frame?.contentWindow?.document;
        if (!doc) return 0;
        const body = doc.body;
        const html = doc.documentElement;
        const candidates = [
            body?.scrollHeight,
            body?.offsetHeight,
            html?.scrollHeight,
            html?.offsetHeight,
            body?.getBoundingClientRect?.().height,
            html?.getBoundingClientRect?.().height
        ].map((value) => Number(value) || 0);
        [
            '.playlab-report-shell',
            '.playlab-report-dynamic:not(:empty)',
            '.playlab-snack-report-card.is-standard-report',
            '.playlab-iceword-report-card.is-standard-report',
            '.playlab-snack-modal.is-open',
            '.playlab-iceword-modal.is-open',
            '#resultScreen.is-active',
            '.hevi-result-card:not(:empty)'
        ].forEach((selector) => {
            doc.querySelectorAll(selector).forEach((element) => {
                try {
                    const view = doc.defaultView || window;
                    const style = view.getComputedStyle(element);
                    const rect = element.getBoundingClientRect();
                    if (style.display === 'none' || style.visibility === 'hidden') return;
                    if (!Number(rect.width) || !Number(rect.height)) return;
                    candidates.push((view.scrollY || 0) + rect.bottom);
                } catch (_error) {
                    // ignore inaccessible or detached nodes
                }
            });
        });
        return Math.ceil(Math.max(0, ...candidates));
    } catch (_error) {
        return 0;
    }
}

function isLabDirectFrameElementVisible(element) {
    if (!element) return false;
    try {
        const doc = element.ownerDocument;
        const view = doc?.defaultView || window;
        const style = view.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none'
            && style.visibility !== 'hidden'
            && Number(rect.width) > 0
            && Number(rect.height) > 0;
    } catch (_error) {
        return false;
    }
}

function getLabDirectFrameReportLayoutState(frame) {
    try {
        const doc = frame?.contentDocument || frame?.contentWindow?.document;
        if (!doc) return { active: false, height: 0 };
        const selectors = [
            '#resultScreen.is-active',
            '.hevi-result-card:not(:empty)',
            '.playlab-report-shell',
            '.playlab-report-dynamic:not(:empty)',
            '.playlab-snack-modal.is-open .playlab-report-shell',
            '.playlab-iceword-modal.is-open .playlab-report-shell',
            '.legacy-result-card .playlab-report-shell',
            '.playlab-result-card .playlab-report-shell'
        ];
        const hasVisibleReport = selectors.some((selector) => {
            return Array.from(doc.querySelectorAll(selector)).some(isLabDirectFrameElementVisible);
        });
        return {
            active: hasVisibleReport,
            height: getLabDirectFrameDocumentHeight(frame)
        };
    } catch (_error) {
        return { active: false, height: 0 };
    }
}

function getLabDirectFrameText(doc, selectors = []) {
    for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element && isLabDirectFrameElementVisible(element)) {
            const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
            if (text) return text;
        }
    }
    return '';
}

function getLabDirectFrameNumber(doc, selectors = []) {
    const text = getLabDirectFrameText(doc, selectors);
    const match = text.replace(/,/g, '').match(/-?\d+/);
    return match ? Number(match[0]) : 0;
}

function getLabDirectFrameCompletionState(frame) {
    try {
        const doc = frame?.contentDocument || frame?.contentWindow?.document;
        if (!doc) return { active: false, detail: {} };
        const selectors = [
            '#resultView.is-active',
            '#completeView.is-active',
            '#completeScreen.is-active',
            '#resultScreen.is-active',
            '.quiz-complete:not(.is-hidden)',
            '.wordbuild-complete:not(.is-hidden)',
            '.association-complete',
            '.context-complete',
            '.phonics-complete',
            '.cloze-complete-card',
            '.legacy-result-card',
            '.playlab-result-card',
            '.number-agency-result-card',
            '.time-result-card',
            '.spotlight-result-card',
            '.colorseq-result-card',
            '.mart-result-card',
            '.mart-story-card.is-result'
        ];
        const marker = selectors
            .flatMap((selector) => Array.from(doc.querySelectorAll(selector)))
            .find(isLabDirectFrameElementVisible);
        if (!marker) return { active: false, detail: {} };

        const titleText = getLabDirectFrameText(doc, [
            '#resultTitle',
            '#completeTitle',
            '#completeScoreText',
            '.quiz-complete-title',
            '.wordbuild-complete-title',
            '.time-result-title',
            '.spotlight-result-title',
            '.colorseq-result-title',
            '.mart-result-title',
            'h1',
            'h2'
        ]);
        const summaryText = getLabDirectFrameText(doc, [
            '#resultSummary',
            '#completeSummary',
            '#completeSummaryText',
            '.quiz-complete-summary',
            '.wordbuild-complete-summary',
            '.time-result-summary',
            '.spotlight-result-summary',
            '.colorseq-result-summary',
            '.mart-result-summary'
        ]);
        const correctCount = getLabDirectFrameNumber(doc, [
            '#completeCorrectCount',
            '#resultCorrect',
            '[data-result-correct]',
            '.complete-correct',
            '.result-correct'
        ]);
        const wrongCount = getLabDirectFrameNumber(doc, [
            '#completeWrongCount',
            '#resultWrong',
            '[data-result-wrong]',
            '.complete-wrong',
            '.result-wrong'
        ]);
        const totalQuestions = getLabDirectFrameNumber(doc, [
            '#completeTotalCount',
            '#resultTotal',
            '[data-result-total]',
            '.complete-total',
            '.result-total'
        ]);

        return {
            active: true,
            detail: {
                title: titleText || frame.title || doc.title || '',
                summary: summaryText,
                totalQuestions,
                correctCount,
                wrongCount,
                completionObserver: 'visible-result-screen'
            }
        };
    } catch (_error) {
        return { active: false, detail: {} };
    }
}

function buildLabDirectCompletionPayloadFromHarnessRecord(record = {}) {
    const history = record?.history && typeof record.history === 'object' ? record.history : {};
    const details = parseMaybeJson(history.details || {}, {});
    const metadata = history.metadata && typeof history.metadata === 'object'
        ? history.metadata
        : parseMaybeJson(history.metadata || {}, {});
    const attempt = record?.cardlabAttempt && typeof record.cardlabAttempt === 'object' ? record.cardlabAttempt : {};
    const totalQuestions = Number(details.total_questions ?? details.totalQuestions ?? attempt.totalQuestions ?? attempt.total_questions ?? 0) || 0;
    const correctCount = Number(details.correct_count ?? details.correctCount ?? attempt.correctCount ?? attempt.correct_count ?? 0) || 0;
    const wrongCount = Number(details.wrong_count ?? details.wrongCount ?? attempt.wrongCount ?? attempt.wrong_count ?? Math.max(0, totalQuestions - correctCount)) || 0;
    return {
        type: 'study-complete',
        detail: {
            title: String(details.lab_title || details.game_name || history.action_type || history.actionType || history.memo || '').trim(),
            stageTitle: String(details.stage_title || details.report_title || attempt.stageTitle || attempt.stage_title || '').trim(),
            stageKey: String(details.stage_id || details.stageId || attempt.stageKey || attempt.stage_key || '').trim(),
            totalQuestions,
            correctCount,
            wrongCount,
            score: Number(details.score ?? attempt.score ?? 0) || 0,
            startedAtMs: new Date(String(history.start_datetime || history.startDatetime || details.started_at || details.startedAt || Date.now()).replace(' ', 'T')).getTime() || Date.now(),
            sourcePage: String(details.source_page || details.sourcePage || metadata.file_name || metadata.fileName || '').trim(),
            harnessRecordId: String(record.id || history.id || '').trim(),
            completionObserver: 'learning-harness-recorded'
        }
    };
}

function openLabDirectTargetOverlay(targetUrl = '', title = '') {
    const normalizedUrl = String(targetUrl || '').trim();
    if (!normalizedUrl || typeof document === 'undefined') return false;
    let targetLabKind = '';
    const targetPath = (() => {
        try {
            const resolvedUrl = new URL(normalizedUrl, window.location.href);
            targetLabKind = String(resolvedUrl.searchParams.get('labKind') || '').trim().toLowerCase();
            return resolvedUrl.pathname;
        } catch (_) {
            return normalizedUrl;
        }
    })();
    const isPlayLabLearningTarget = /^\/playlab\/[^/]+\.html$/i.test(targetPath);
    const isTouchTabletLayout = isLabTouchTabletLayout();
    if (isPlayLabLearningTarget && isTouchTabletLayout) {
        try {
            const directUrl = new URL(normalizedUrl, window.location.href);
            directUrl.searchParams.set('labTabletDirect', '1');
            window.location.assign(directUrl.href);
        } catch (_) {
            window.location.assign(normalizedUrl);
        }
        return true;
    }
    const useChromelessLearningFrame = isPlayLabLearningTarget;

    closeLabDirectTargetOverlay({ restoreShell: false });

    const body = document.body;
    const html = document.documentElement;
    if (!body || !html) return false;
    if (!document.getElementById('labDirectOverlayLoaderStyle')) {
        const loaderStyle = document.createElement('style');
        loaderStyle.id = 'labDirectOverlayLoaderStyle';
        loaderStyle.textContent = `
            @keyframes labDirectPulse {
                0%, 80%, 100% { opacity: 0.42; transform: translateY(0) scale(0.86); }
                40% { opacity: 1; transform: translateY(-6px) scale(1); }
            }
        `;
        document.head.appendChild(loaderStyle);
    }

    currentLabDirectOverlayBodyOverflow = body.style.overflow;
    currentLabDirectOverlayHtmlOverflow = html.style.overflow;
    currentLabDirectOverlayBodyHeight = body.style.height;
    currentLabDirectOverlayHtmlHeight = html.style.height;
    currentLabDirectOverlayBodyMinHeight = body.style.minHeight;
    currentLabDirectOverlayHtmlMinHeight = html.style.minHeight;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.className = 'lab-direct-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100dvh';
    overlay.style.zIndex = '2147483647';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.background = useChromelessLearningFrame ? '#ffffff' : '#050816';
    overlay.style.overflow = 'hidden';
    overlay.dataset.returnShellView = currentShellView || '';
    overlay.dataset.returnDetailSubTab = targetLabKind === 'assessment' ? 'sub-assessment' : '';
    overlay.dataset.learningCompletionSaved = 'false';
    overlay.dataset.learningStartedAtMs = String(Date.now());

    const header = document.createElement('div');
    header.style.height = '56px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.gap = '12px';
    header.style.padding = '0 16px';
    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.12)';
    header.style.background = '#0f172a';
    header.style.color = '#fff';
    header.style.flex = '0 0 auto';

    const titleWrap = document.createElement('div');
    titleWrap.style.minWidth = '0';

    const titleLabel = document.createElement('div');
    titleLabel.style.fontWeight = '900';
    titleLabel.style.fontSize = '14px';
    titleLabel.style.lineHeight = '1.2';
    titleLabel.style.whiteSpace = 'nowrap';
    titleLabel.style.overflow = 'hidden';
    titleLabel.style.textOverflow = 'ellipsis';
    titleLabel.textContent = '하하랩 - 가벼운준비,차원이다른수업!';

    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.alignItems = 'center';
    titleRow.style.gap = '10px';
    titleRow.style.minWidth = '0';

    const symbol = document.createElement('img');
    symbol.src = './images/hahalab-P.svg';
    symbol.alt = 'HAHALAB Symbol';
    symbol.style.width = '30px';
    symbol.style.height = '30px';
    symbol.style.flex = '0 0 30px';
    symbol.style.borderRadius = '10px';
    symbol.style.background = '#ffffff';
    symbol.style.padding = '5px';

    titleRow.appendChild(symbol);
    titleRow.appendChild(titleLabel);
    titleWrap.appendChild(titleRow);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'lab-direct-learning-exit';
    closeButton.dataset.labDirectLearningExit = '1';
    closeButton.setAttribute('aria-label', '학습 종료');
    closeButton.textContent = '학습종료';
    closeButton.style.flex = '0 0 auto';
    closeButton.style.border = '1px solid #d9c500';
    closeButton.style.borderRadius = '999px';
    closeButton.style.padding = '10px 14px';
    closeButton.style.background = '#FEE500';
    closeButton.style.color = '#191919';
    closeButton.style.fontWeight = '900';
    closeButton.style.cursor = 'pointer';
    closeButton.style.transition = 'background 0.15s ease, box-shadow 0.15s ease';
    closeButton.style.boxShadow = '0 8px 18px rgba(254, 229, 0, 0.28)';
    closeButton.onmouseenter = () => {
        closeButton.style.background = '#f8dc00';
        closeButton.style.boxShadow = '0 10px 22px rgba(254, 229, 0, 0.34)';
    };
    closeButton.onmouseleave = () => {
        closeButton.style.background = '#FEE500';
        closeButton.style.boxShadow = '0 8px 18px rgba(254, 229, 0, 0.28)';
    };
    closeButton.onclick = () => confirmCloseLabDirectTargetOverlay();

    if (useChromelessLearningFrame) {
        closeButton.style.position = 'absolute';
        closeButton.style.bottom = 'max(14px, env(safe-area-inset-bottom))';
        closeButton.style.right = 'max(12px, env(safe-area-inset-right))';
        closeButton.style.zIndex = '3';
        closeButton.style.minHeight = '44px';
        closeButton.style.padding = '10px 16px';
    }

    const frame = document.createElement('iframe');
    frame.src = normalizedUrl;
    frame.title = String(title || '학습 화면').trim() || '학습 화면';
    frame.setAttribute('allow', 'autoplay');
    frame.style.width = '100%';
    frame.style.height = useChromelessLearningFrame ? '100%' : 'calc(100% - 56px)';
    frame.style.border = '0';
    frame.style.background = '#fff';
    frame.style.flex = '1 1 auto';
    frame.style.opacity = '0';
    frame.style.transition = 'opacity 0.18s ease';

    const loadingLayer = document.createElement('div');
    loadingLayer.className = 'lab-direct-overlay-loader';
    loadingLayer.setAttribute('aria-live', 'polite');
    loadingLayer.style.position = 'absolute';
    loadingLayer.style.inset = '0';
    loadingLayer.style.zIndex = '2';
    loadingLayer.style.display = 'flex';
    loadingLayer.style.alignItems = 'center';
    loadingLayer.style.justifyContent = 'center';
    loadingLayer.style.padding = '24px';
    loadingLayer.style.background = useChromelessLearningFrame
        ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
        : 'rgba(5, 8, 22, 0.82)';
    loadingLayer.style.color = useChromelessLearningFrame ? '#0f172a' : '#ffffff';
    loadingLayer.style.fontFamily = '"Noto Sans KR", "Apple SD Gothic Neo", system-ui, sans-serif';
    loadingLayer.innerHTML = `
        <div style="width:min(420px, 100%); text-align:center;">
            <div style="display:flex; justify-content:center; gap:8px; margin-bottom:18px;" aria-hidden="true">
                <span style="width:12px; height:12px; border-radius:999px; background:#facc15; animation:labDirectPulse 0.9s ease-in-out infinite;"></span>
                <span style="width:12px; height:12px; border-radius:999px; background:#38bdf8; animation:labDirectPulse 0.9s ease-in-out infinite 0.12s;"></span>
                <span style="width:12px; height:12px; border-radius:999px; background:#34d399; animation:labDirectPulse 0.9s ease-in-out infinite 0.24s;"></span>
            </div>
            <strong style="display:block; font-size:clamp(20px, 3vw, 28px); font-weight:900; line-height:1.25;">학습을 불러오고 있습니다</strong>
            <p style="margin:10px 0 0; color:${useChromelessLearningFrame ? '#64748b' : 'rgba(255,255,255,0.74)'}; font-size:15px; font-weight:800; line-height:1.5; word-break:keep-all;">${escapeHtml(String(title || getLabKindLabel(currentLabKind) || '학습').trim())} 화면을 준비하는 중입니다.</p>
        </div>
    `;

    const revealFrame = () => {
        frame.style.opacity = '1';
        if (loadingLayer.parentNode) {
            loadingLayer.style.opacity = '0';
            loadingLayer.style.pointerEvents = 'none';
            window.setTimeout(() => {
                if (loadingLayer.parentNode) loadingLayer.parentNode.removeChild(loadingLayer);
            }, 220);
        }
    };
    frame.addEventListener('load', revealFrame, { once: true });
    window.setTimeout(() => {
        if (currentLabDirectOverlay === overlay && loadingLayer.parentNode) {
            revealFrame();
        }
    }, 8000);

    const getFrameMinHeight = () => {
        const headerOffset = useChromelessLearningFrame ? 0 : 56;
        return Math.max(420, Math.round(window.innerHeight - headerOffset));
    };
    const applyDocumentScrollLayout = (active, height = 0) => {
        if (currentLabDirectOverlay !== overlay) return;
        const reportHeight = Math.max(getFrameMinHeight(), Math.ceil(Number(height) || 0));
        const isActive = Boolean(active);
        overlay.dataset.reportDocumentScroll = isActive ? 'true' : 'false';
        body.classList.toggle('lab-direct-document-scroll', isActive);
        if (isActive) {
            body.style.overflow = 'auto';
            html.style.overflow = 'auto';
            body.style.height = 'auto';
            html.style.height = 'auto';
            body.style.minHeight = '100dvh';
            html.style.minHeight = '100%';
            overlay.style.position = 'relative';
            overlay.style.inset = '';
            overlay.style.width = '100%';
            overlay.style.height = 'auto';
            overlay.style.minHeight = '100dvh';
            overlay.style.overflow = 'visible';
            overlay.style.flex = '0 0 auto';
            frame.style.flex = '0 0 auto';
            frame.style.height = `${reportHeight}px`;
            frame.setAttribute('scrolling', 'no');
            if (useChromelessLearningFrame) {
                closeButton.style.position = 'fixed';
            }
            return;
        }
        body.style.overflow = 'hidden';
        html.style.overflow = 'hidden';
        body.style.height = currentLabDirectOverlayBodyHeight || '';
        html.style.height = currentLabDirectOverlayHtmlHeight || '';
        body.style.minHeight = currentLabDirectOverlayBodyMinHeight || '';
        html.style.minHeight = currentLabDirectOverlayHtmlMinHeight || '';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100dvh';
        overlay.style.minHeight = '';
        overlay.style.overflow = 'hidden';
        overlay.style.flex = '';
        frame.style.flex = '1 1 auto';
        frame.style.height = useChromelessLearningFrame ? '100%' : 'calc(100% - 56px)';
        frame.removeAttribute('scrolling');
        if (useChromelessLearningFrame) {
            closeButton.style.position = 'absolute';
        }
    };
    const syncDocumentScrollLayout = () => {
        const state = getLabDirectFrameReportLayoutState(frame);
        applyDocumentScrollLayout(state.active, state.height);
    };
    const syncFrameCompletionState = () => {
        if (currentLabDirectOverlay !== overlay || overlay.dataset.learningCompletionSaved === 'true') return;
        const completionState = getLabDirectFrameCompletionState(frame);
        if (!completionState.active) return;
        persistLabDirectCompletionEvent({
            type: 'study-complete',
            detail: {
                title,
                startedAtMs: Number(overlay.dataset.learningStartedAtMs || 0) || Date.now(),
                ...completionState.detail
            }
        }, {
            kind: targetLabKind || currentLabKind,
            targetUrl: normalizedUrl,
            title
        }).catch((error) => {
            console.warn('[LabDirect] completion observer failed:', error);
        });
    };
    const handleFrameLayoutMessage = (event) => {
        if (event.source !== frame.contentWindow) return;
        const data = event.data || {};
        if (data && data.type === LAB_EXIT_MESSAGE_TYPE) {
            const labKind = normalizeLabKind(data.labKind || targetLabKind || currentLabKind);
            try {
                sessionStorage.setItem(LAB_RETURN_KIND_STORAGE_KEY, labKind);
            } catch (_error) {
                // noop
            }
            persistLabReturnUrl(data.returnUrl || buildLabReturnUrl(labKind));
            persistShellViewState({ view: 'lab', labKind });
            closeLabDirectTargetOverlay({ restoreShell: true });
            return;
        }
        if (!data || data.type !== 'HAHA_LAB_REPORT_LAYOUT') return;
        applyDocumentScrollLayout(Boolean(data.active), data.height);
    };
    let detachFramePlaylabEvents = null;
    const attachFramePlaylabEvents = () => {
        if (typeof detachFramePlaylabEvents === 'function') {
            detachFramePlaylabEvents();
            detachFramePlaylabEvents = null;
        }
        let frameWindow = null;
        let frameDocument = null;
        try {
            frameWindow = frame.contentWindow;
            frameDocument = frame.contentDocument || frameWindow?.document || null;
        } catch (_error) {
            return;
        }
        if (!frameWindow) return;
        const handleEmbeddedPlaylabEvent = (event) => {
            const payload = event?.detail;
            if (!payload || typeof payload !== 'object') return;
            if (String(payload.type || '').trim() === 'study-start' && currentLabDirectOverlay) {
                currentLabDirectOverlay.dataset.learningCompletionSaved = 'false';
                currentLabDirectOverlay.dataset.learningCompletionSessionId = '';
                currentLabDirectOverlay.dataset.learningCompletionSaveState = 'idle';
                delete currentLabDirectOverlay.__pendingCompletionRequest;
                delete currentLabDirectOverlay.__pendingCompletionRecord;
                currentLabDirectOverlay.dataset.learningStartedAtMs = String(Date.now());
            }
            persistLabDirectCompletionEvent(payload, {
                kind: targetLabKind || currentLabKind,
                targetUrl: normalizedUrl,
                title
            }).catch((error) => {
                console.warn('[LabDirect] completion event handling failed:', error);
            });
        };
        const handleEmbeddedLearningRecorded = (event) => {
            const payload = buildLabDirectCompletionPayloadFromHarnessRecord(event?.detail || {});
            persistLabDirectCompletionEvent(payload, {
                kind: targetLabKind || currentLabKind,
                targetUrl: normalizedUrl,
                title,
                harnessRecord: event?.detail
            }).catch((error) => {
                console.warn('[LabDirect] harness record handling failed:', error);
            });
        };
        frameWindow.addEventListener('hahalab:playlab-event', handleEmbeddedPlaylabEvent);
        frameWindow.addEventListener('haha-lab-learning-recorded', handleEmbeddedLearningRecorded);
        if (frameDocument) {
            frameDocument.addEventListener('hahalab:playlab-event', handleEmbeddedPlaylabEvent);
        }
        detachFramePlaylabEvents = () => {
            try {
                frameWindow.removeEventListener('hahalab:playlab-event', handleEmbeddedPlaylabEvent);
                frameWindow.removeEventListener('haha-lab-learning-recorded', handleEmbeddedLearningRecorded);
                frameDocument?.removeEventListener('hahalab:playlab-event', handleEmbeddedPlaylabEvent);
            } catch (_error) {
                // noop
            }
        };
    };
    const layoutPollTimer = window.setInterval(() => {
        syncDocumentScrollLayout();
        syncFrameCompletionState();
    }, 360);
    frame.addEventListener('load', () => {
        overlay.dataset.learningCompletionSaved = 'false';
        overlay.dataset.learningStartedAtMs = String(Date.now());
        attachFramePlaylabEvents();
        syncDocumentScrollLayout();
        syncFrameCompletionState();
        window.setTimeout(syncDocumentScrollLayout, 260);
        window.setTimeout(syncFrameCompletionState, 260);
        window.setTimeout(() => {
            syncDocumentScrollLayout();
            syncFrameCompletionState();
        }, 900);
    });
    window.addEventListener('resize', syncDocumentScrollLayout);
    window.addEventListener('message', handleFrameLayoutMessage);

    if (useChromelessLearningFrame) {
        overlay.appendChild(closeButton);
    } else {
        header.appendChild(titleWrap);
        header.appendChild(closeButton);
        overlay.appendChild(header);
    }
    overlay.appendChild(frame);
    overlay.appendChild(loadingLayer);
    body.appendChild(overlay);

    currentLabDirectOverlay = overlay;

    const handleKeydown = (event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        confirmCloseLabDirectTargetOverlay();
    };
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && currentLabDirectOverlay === overlay) {
            overlay.dataset.fullscreen = 'false';
        }
    };

    currentLabDirectOverlayCleanup = () => {
        window.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        window.removeEventListener('resize', syncDocumentScrollLayout);
        window.removeEventListener('message', handleFrameLayoutMessage);
        if (typeof detachFramePlaylabEvents === 'function') {
            detachFramePlaylabEvents();
            detachFramePlaylabEvents = null;
        }
        window.clearInterval(layoutPollTimer);
        body.classList.remove('lab-direct-document-scroll');
    };

    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return true;
}

function setLabStageSelection(kind = 'cardlab', categoryId = '', stageId = '') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    const key = String(categoryId || '').trim();
    if (!currentLabStageSelectionByCategory[normalizedKind]) {
        currentLabStageSelectionByCategory[normalizedKind] = {};
    }
    currentLabStageSelectionByCategory[normalizedKind][key] = String(stageId || '').trim();
}

function getLabStageSelection(kind = 'cardlab', categoryId = '') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    const key = String(categoryId || '').trim();
    return String(currentLabStageSelectionByCategory?.[normalizedKind]?.[key] || '').trim();
}

function getLabSelectedStage(kind = 'cardlab', category = null) {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    const selectedCategory = category || getLabLauncherSelectedCategory(normalizedKind);
    const stages = getLabLauncherStages(selectedCategory);
    if (!stages.length) return null;
    const preferredId = getLabStageSelection(normalizedKind, selectedCategory?.id || '');
    const resolved = stages.find((stage, index) => getLabStageId(stage, index) === preferredId);
    return resolved || stages[0] || null;
}

function getLabStageFocusText(kind = 'cardlab', stageTitle = '', categoryTitle = '') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    const title = String(stageTitle || '').trim();
    const category = String(categoryTitle || '').trim();

    const matchers = normalizedKind === 'cardlab' ? [
        [/듣고/, '소리를 듣고 알맞은 카드를 고르는'],
        [/그림|보고/, '그림 단서를 보고 알맞은 카드를 고르는'],
        [/빠른/, '짧은 시간에 빠르게 반응하는'],
        [/음운|첫소리|끝소리|운율/, '소리와 말소리를 구분하는'],
        [/조합|조립|문장/, '카드를 조합해 문장을 완성하는'],
        [/상황/, '문맥 속 알맞은 어휘를 고르는'],
        [/속담|관용|사자성어/, '표현의 뜻을 연결하는'],
        [/유의어|반의어|비슷/, '비슷한 말과 반대말을 비교하는'],
        [/조사/, '조사를 문장에 자연스럽게 붙이는'],
        [/접속어/, '문장과 문장을 이어 주는']
    ] : normalizedKind === 'numberlab' ? [
        [/숫자|배워요|탐험/, '숫자를 읽고 세며 수 감각을 익히는'],
        [/세기|찾기/, '수량을 살피고 숫자를 빠르게 찾는'],
        [/덧셈|뺄셈|연산/, '수식을 맞추고 계산하는'],
        [/세로/, '자리별로 숫자를 맞추는'],
        [/패밀리|확장/, '규칙을 바꾸며 계산을 확장하는'],
        [/길찾기/, '길을 따라 더하고 빼는']
    ] : [
        [/집중|워밍업/, '주의를 모으고 반응을 준비하는'],
        [/소리|음운|듣기|청능/, '소리와 말소리를 구분하는'],
        [/도형|패턴|시지각|공간/, '시각 정보와 공간 감각을 훈련하는'],
        [/어휘|문장|이야기/, '어휘와 문장 표현을 확장하는'],
        [/일상|사회|생활/, '일상 순서와 사회적 상황을 익히는'],
        [/소근육|색|형태|미술/, '손동작과 색감으로 표현하는'],
        [/놀이|차례|의사소통|역할/, '차례와 상호작용을 익히는']
    ];

    const found = matchers.find(([pattern]) => pattern.test(title) || pattern.test(category));
    if (found) return found[1];
    if (normalizedKind === 'cardlab') return '카드와 문장을 차례대로 고르는';
    if (normalizedKind === 'numberlab') return '수와 계산 흐름을 익히는';
    if (normalizedKind === 'rehab' || normalizedKind === 'rehablab') return '기능 회복을 위한 반복 반응과 자기조절을 익히는';
    return '놀이처럼 반응과 상호작용을 익히는';
}

function isLabWordCardCategory(category = null) {
    return String(category?.id || '').trim() === LAB_WORDCARD_CATEGORY_ID;
}

function normalizeLabWordCardCategoryRow(row = {}) {
    return {
        id: String(row?.id || row?.category || '').trim(),
        title: String(row?.titleKo || row?.title_ko || row?.title || row?.nameKo || row?.name_ko || row?.category_ko || row?.category || '').trim(),
        sortOrder: Number(row?.sortOrder ?? row?.sort_order ?? 999) || 999,
        isActive: row?.isActive ?? row?.is_active ?? true,
        notes: String(row?.notes || '').trim()
    };
}

function normalizeLabWordCardAssetRow(row = {}) {
    const thumbnailUrl = String(row?.thumbnailUrl || row?.thumbnail_url || '').trim();
    const filePath = String(row?.filePath || row?.file_path || '').trim();
    const fileName = String(row?.fileName || row?.file_name || '').trim();
    const categoryId = String(row?.category || row?.categoryId || '').trim();
    const categoryLabel = String(row?.categoryKo || row?.category_ko || categoryId || '').trim();
    const assetType = String(row?.assetType || row?.asset_type || '').trim().toLowerCase();
    const assetTypeLabel = String(row?.assetTypeKo || row?.asset_type_ko || '').trim() || (assetType === 'illust' ? '일러스트' : assetType === 'photo' ? '실사' : '기타');
    return {
        id: String(row?.id || '').trim(),
        categoryId,
        category: String(row?.category || '').trim(),
        categoryKo: String(row?.categoryKo || row?.category_ko || '').trim(),
        categoryLabel,
        assetType,
        assetTypeKo: String(row?.assetTypeKo || row?.asset_type_ko || '').trim(),
        assetTypeLabel,
        nameKo: String(row?.nameKo || row?.name_ko || row?.nameKoAuto || row?.name_ko_auto || row?.titleKo || row?.title_ko || row?.nameEn || row?.name_en || fileName || '').trim(),
        nameEn: String(row?.nameEn || row?.name_en || '').trim(),
        descriptionKo: String(row?.descriptionKo || row?.description_ko || '').trim(),
        tags: Array.isArray(row?.tags) ? row.tags : String(row?.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
        thumbnailUrl,
        filePath,
        fileName,
        sortOrder: Number(row?.sortOrder ?? row?.sort_order ?? 999) || 999,
        isPublic: row?.isPublic ?? row?.is_public ?? false,
        isApproved: row?.isApproved ?? row?.is_approved ?? false,
        isActive: row?.isActive ?? row?.is_active ?? true,
        createdAt: row?.createdAt || row?.created_at || '',
        updatedAt: row?.updatedAt || row?.updated_at || ''
    };
}

function getLabWordCardImageCandidates(asset = {}) {
    const candidates = [];
    const pushCandidate = (value) => {
        const next = String(value || '').trim();
        if (!next || candidates.includes(next)) return;
        candidates.push(next);
    };
    const baseUrl = 'https://thehahalab.com/playlab/';
    const directUrl = String(asset?.url || asset?.imageUrl || asset?.previewUrl || '').trim();
    const thumbnailUrl = String(asset?.thumbnailUrl || asset?.thumbnail_url || '').trim();
    const filePath = String(asset?.filePath || asset?.file_path || '').trim();
    const fileName = String(asset?.fileName || asset?.file_name || '').trim();
    const categoryId = String(asset?.categoryId || asset?.category || '').trim();

    if (directUrl) {
        pushCandidate(directUrl);
    }

    if (thumbnailUrl) {
        if (/^https?:\/\//i.test(thumbnailUrl)) pushCandidate(thumbnailUrl);
        else if (thumbnailUrl.startsWith('/')) pushCandidate(`https://thehahalab.com${thumbnailUrl}`);
        else pushCandidate(`${baseUrl}${thumbnailUrl.replace(/^\/+/, '')}`);
    }

    if (filePath) {
        if (/^https?:\/\//i.test(filePath)) pushCandidate(filePath);
        else if (filePath.startsWith('/')) pushCandidate(`https://thehahalab.com${filePath}`);
        else if (filePath.startsWith('playlab/')) pushCandidate(`https://thehahalab.com/${filePath}`);
        else pushCandidate(`${baseUrl}${filePath.replace(/^\/+/, '')}`);
    }

    if (fileName) {
        if (categoryId) pushCandidate(`${baseUrl}images/${categoryId}/${fileName}`);
        pushCandidate(`${baseUrl}images/${fileName}`);
    }

    return candidates;
}

function getLabWordCardImageUrl(asset = {}) {
    return getLabWordCardImageCandidates(asset)[0] || '';
}

function getLabWordCardCategoryLabel(categoryId = '') {
    const normalizedId = String(categoryId || '').trim();
    if (!normalizedId || normalizedId === 'all') return '전체';
    const category = currentLabWordCardCategories.find((item) => String(item.id || '').trim() === normalizedId);
    return String(category?.title || category?.titleKo || category?.title_ko || normalizedId).trim() || normalizedId;
}

function getLabWordCardTypeLabel(assetType = '') {
    const normalized = String(assetType || '').trim().toLowerCase();
    if (normalized === 'illust') return '일러스트';
    if (normalized === 'photo') return '실사';
    return '기타';
}

function normalizeLabWordCardCategoryFilters(value = []) {
    const list = Array.isArray(value) ? value : [value];
    const normalized = list
        .map((item) => String(item || '').trim())
        .filter(Boolean);
    if (!normalized.length) return ['all'];
    if (normalized.includes('all')) return ['all'];
    return Array.from(new Set(normalized));
}

function getLabWordCardActiveCategoryFilters() {
    return normalizeLabWordCardCategoryFilters(currentLabWordCardCategoryFilters);
}

function isLabWordCardCategoryFilterActive(categoryId = '') {
    const normalizedId = String(categoryId || '').trim();
    const active = getLabWordCardActiveCategoryFilters();
    if (!normalizedId || normalizedId === 'all') {
        return active.includes('all') || active.length === 0;
    }
    return active.includes(normalizedId);
}

function getLabWordCardCategoryCountMap() {
    const countMap = new Map();
    currentLabWordCardAssets.forEach((asset) => {
        const candidates = [
            String(asset.categoryId || '').trim(),
            String(asset.category || '').trim(),
            String(asset.categoryLabel || '').trim(),
            String(asset.categoryKo || '').trim()
        ].filter(Boolean);
        const key = candidates[0] || '';
        if (!key) return;
        countMap.set(key, (countMap.get(key) || 0) + 1);
    });
    return countMap;
}

function getLabWordCardCategoryOptions() {
    const baseOptions = [{ id: 'all', label: '전체', count: currentLabWordCardAssets.length || 0 }];
    const countMap = getLabWordCardCategoryCountMap();
    if (Array.isArray(currentLabWordCardCategories) && currentLabWordCardCategories.length > 0) {
        return [
            ...baseOptions,
            ...currentLabWordCardCategories.map((category) => ({
                id: String(category.id || '').trim(),
                label: String(category.title || category.id || '미분류').trim(),
                count: countMap.get(String(category.id || '').trim()) || 0
            })).filter((item) => item.id)
        ];
    }

    const fallbackMap = new Map();
    currentLabWordCardAssets.forEach((asset) => {
        const rawId = String(asset.categoryId || asset.categoryLabel || asset.category || '').trim();
        if (!rawId) return;
        if (!fallbackMap.has(rawId)) {
            fallbackMap.set(rawId, {
                id: rawId,
                label: getLabWordCardCategoryLabel(rawId),
                count: countMap.get(rawId) || 0
            });
        }
    });
    return [...baseOptions, ...Array.from(fallbackMap.values())];
}

function getLabWordCardFilteredAssets() {
    let list = [...currentLabWordCardAssets];
    const searchTerm = String(currentLabWordCardSearchTerm || '').trim().toLowerCase();
    const activeCategoryFilters = getLabWordCardActiveCategoryFilters();
    if (activeCategoryFilters.length && !activeCategoryFilters.includes('all')) {
        const normalizedFilters = new Set(activeCategoryFilters.map((item) => String(item || '').trim()).filter(Boolean));
        list = list.filter((asset) => {
            const candidates = [
                String(asset.categoryId || '').trim(),
                String(asset.categoryLabel || '').trim(),
                String(asset.categoryKo || '').trim(),
                String(asset.category || '').trim()
            ].filter(Boolean);
            return candidates.some((candidate) => normalizedFilters.has(candidate));
        });
    }
    if (currentLabWordCardTypeFilter !== 'all') {
        list = list.filter((asset) => String(asset.assetType || '').trim() === String(currentLabWordCardTypeFilter || '').trim());
    }
    if (searchTerm) {
        list = list.filter((asset) => {
            const haystacks = [
                asset.nameKo,
                asset.nameEn,
                asset.descriptionKo,
                asset.categoryLabel,
                ...(Array.isArray(asset.tags) ? asset.tags : [])
            ]
                .map((item) => String(item || '').toLowerCase())
                .filter(Boolean);
            return haystacks.some((value) => value.includes(searchTerm));
        });
    }
    return list.sort((a, b) => {
        const categoryA = getLabWordCardCategoryLabel(a.categoryId);
        const categoryB = getLabWordCardCategoryLabel(b.categoryId);
        if (categoryA !== categoryB) return categoryA.localeCompare(categoryB, 'ko');
        const sortA = Number(a.sortOrder || 999);
        const sortB = Number(b.sortOrder || 999);
        if (sortA !== sortB) return sortA - sortB;
        return String(a.nameKo || '').localeCompare(String(b.nameKo || ''), 'ko');
    });
}

function getLabWordCardSelectedAsset(filteredAssets = null) {
    const assets = Array.isArray(filteredAssets) ? filteredAssets : getLabWordCardFilteredAssets();
    if (!assets.length) return null;
    if (currentLabWordCardSelectedId) {
        const matched = assets.find((asset) => String(asset.id || '').trim() === String(currentLabWordCardSelectedId || '').trim());
        if (matched) return matched;
    }
    return assets[0] || null;
}

function resetLabWordCardBrowserState({ keepGridMode = true } = {}) {
    currentLabWordCardDetailOpen = false;
    currentLabWordCardSelectedId = '';
    currentLabWordCardCategoryFilter = 'all';
    currentLabWordCardCategoryFilters = ['all'];
    currentLabWordCardTypeFilter = 'all';
    currentLabWordCardSearchTerm = '';
    if (!keepGridMode) {
        currentLabWordCardGridMode = 'two';
    }
}

function setLabWordCardSearchTerm(value = '') {
    currentLabWordCardSearchTerm = String(value || '').trim();
    const filtered = getLabWordCardFilteredAssets();
    if (currentLabWordCardDetailOpen && !filtered.some((asset) => String(asset.id || '').trim() === String(currentLabWordCardSelectedId || '').trim())) {
        currentLabWordCardSelectedId = filtered[0]?.id || '';
        currentLabWordCardDetailOpen = Boolean(currentLabWordCardSelectedId);
    }
    persistShellViewState({
        labWordCardSearchTerm: currentLabWordCardSearchTerm,
        labWordCardSelectedId: currentLabWordCardSelectedId,
        labWordCardDetailOpen: currentLabWordCardDetailOpen
    });
    renderLabViewShell();
}

function setLabWordCardCategoryFilters(value = []) {
    const normalized = normalizeLabWordCardCategoryFilters(value);
    currentLabWordCardCategoryFilters = normalized;
    currentLabWordCardCategoryFilter = normalized[0] || 'all';
    const filtered = getLabWordCardFilteredAssets();
    if (currentLabWordCardDetailOpen && !filtered.some((asset) => String(asset.id || '').trim() === String(currentLabWordCardSelectedId || '').trim())) {
        currentLabWordCardSelectedId = filtered[0]?.id || '';
        currentLabWordCardDetailOpen = Boolean(currentLabWordCardSelectedId);
    }
    persistShellViewState({
        labWordCardCategoryFilter: currentLabWordCardCategoryFilter,
        labWordCardCategoryFilters: currentLabWordCardCategoryFilters,
        labWordCardSelectedId: currentLabWordCardSelectedId,
        labWordCardDetailOpen: currentLabWordCardDetailOpen
    });
    renderLabViewShell();
}

function toggleLabWordCardCategoryFilter(categoryId = '') {
    const normalizedId = String(categoryId || '').trim();
    if (!normalizedId) return;
    if (normalizedId === 'all') {
        setLabWordCardCategoryFilters(['all']);
        return;
    }

    const currentFilters = normalizeLabWordCardCategoryFilters(currentLabWordCardCategoryFilters);
    const next = currentFilters.includes('all')
        ? [normalizedId]
        : currentFilters.includes(normalizedId)
            ? currentFilters.filter((item) => item !== normalizedId)
            : [...currentFilters, normalizedId];
    setLabWordCardCategoryFilters(next.length ? next : ['all']);
}

function getLabWordCardDisplayColumns() {
    const width = Number(window?.innerWidth || 0);
    const baseColumns = width >= 1760 ? 6 : width >= 1320 ? 4 : 2;
    return baseColumns % 2 === 0 ? baseColumns : Math.max(2, baseColumns - 1);
}

function clearLabWordCardRealtimeChannels() {
    if (!window.supabaseClient) return;
    currentLabWordCardRealtimeChannels.forEach((channel) => {
        try {
            window.supabaseClient.removeChannel(channel);
        } catch (_error) {
            // noop
        }
    });
    currentLabWordCardRealtimeChannels = [];
}

function scheduleLabWordCardRefresh() {
    clearTimeout(currentLabWordCardRefreshTimer);
    currentLabWordCardRefreshTimer = window.setTimeout(() => {
        currentLabWordCardLoaded = false;
        ensureLabWordCardLibraryLoaded();
    }, 180);
}

function bindLabWordCardRealtime() {
    clearLabWordCardRealtimeChannels();
    if (!window.supabaseClient) return;

    ['cardlab_categories', 'playlab_webp_assets'].forEach((table) => {
        const channel = window.supabaseClient
            .channel(`lab-wordcard-${table}-${Date.now()}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table
            }, () => scheduleLabWordCardRefresh())
            .subscribe();
        currentLabWordCardRealtimeChannels.push(channel);
    });
}

async function ensureLabWordCardLibraryLoaded() {
    if (currentLabWordCardLoaded || currentLabWordCardLoading) return;
    if (!window.supabaseClient) {
        currentLabWordCardCategories = [];
        currentLabWordCardAssets = [];
        currentLabWordCardLoaded = true;
        currentLabWordCardLoading = false;
        renderLabViewShell();
        return;
    }
    currentLabWordCardLoading = true;
    try {
        const [categoryResult, assetResult] = await Promise.all([
            window.supabaseClient.from('cardlab_categories').select('*'),
            window.supabaseClient.from('playlab_webp_assets').select('*')
        ]);
        if (categoryResult.error) throw categoryResult.error;
        if (assetResult.error) throw assetResult.error;
        currentLabWordCardCategories = (categoryResult.data || []).map(normalizeLabWordCardCategoryRow).filter((item) => item.id);
        currentLabWordCardCategories.sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return String(a.title || a.id).localeCompare(String(b.title || b.id), 'ko');
        });
        currentLabWordCardAssets = (assetResult.data || [])
            .map(normalizeLabWordCardAssetRow)
            .filter((item) => item.id && item.isActive !== false);
        currentLabWordCardLoaded = true;
        if (currentLabWordCardRealtimeChannels.length === 0) {
            bindLabWordCardRealtime();
        }
    } catch (error) {
        console.error('[LabWordCards] load failed:', error);
        currentLabWordCardCategories = [];
        currentLabWordCardAssets = [];
        currentLabWordCardLoaded = true;
    } finally {
        currentLabWordCardLoading = false;
        renderLabViewShell();
    }
}

function setLabWordCardFilterCategory(categoryId = 'all') {
    currentLabWordCardCategoryFilter = String(categoryId || 'all').trim() || 'all';
    const filtered = getLabWordCardFilteredAssets();
    currentLabWordCardSelectedId = filtered[0]?.id || '';
    currentLabWordCardDetailOpen = false;
    persistShellViewState({
        labWordCardCategoryFilter: currentLabWordCardCategoryFilter,
        labWordCardTypeFilter: currentLabWordCardTypeFilter,
        labWordCardSearchTerm: currentLabWordCardSearchTerm,
        labWordCardSelectedId: currentLabWordCardSelectedId,
        labWordCardDetailOpen: false
    });
    renderLabViewShell();
}

function setLabWordCardFilterType(assetType = 'all') {
    currentLabWordCardTypeFilter = String(assetType || 'all').trim() || 'all';
    const filtered = getLabWordCardFilteredAssets();
    currentLabWordCardSelectedId = filtered[0]?.id || '';
    currentLabWordCardDetailOpen = false;
    persistShellViewState({
        labWordCardCategoryFilter: currentLabWordCardCategoryFilter,
        labWordCardTypeFilter: currentLabWordCardTypeFilter,
        labWordCardSearchTerm: currentLabWordCardSearchTerm,
        labWordCardSelectedId: currentLabWordCardSelectedId,
        labWordCardDetailOpen: false
    });
    renderLabViewShell();
}

function setLabWordCardGridMode(mode = 'two') {
    const normalized = 'two';
    currentLabWordCardGridMode = normalized;
    persistShellViewState({ labWordCardGridMode: normalized });
    renderLabViewShell();
}

function selectLabWordCard(cardId = '') {
    const normalized = String(cardId || '').trim();
    if (!normalized) return;
    const filtered = getLabWordCardFilteredAssets();
    if (!filtered.some((asset) => String(asset.id || '').trim() === normalized)) return;
    currentLabWordCardSelectedId = normalized;
    currentLabWordCardDetailOpen = true;
    persistShellViewState({
        labWordCardSelectedId: currentLabWordCardSelectedId,
        labWordCardSearchTerm: currentLabWordCardSearchTerm,
        labWordCardDetailOpen: true
    });
    renderLabViewShell();
}

function returnToLabWordCardGrid() {
    currentLabWordCardDetailOpen = false;
    persistShellViewState({ labWordCardDetailOpen: false, labWordCardSearchTerm: currentLabWordCardSearchTerm });
    renderLabViewShell();
}

function moveLabWordCardDetail(direction = 1) {
    const filtered = getLabWordCardFilteredAssets();
    if (!filtered.length) return;
    const currentIndex = Math.max(0, filtered.findIndex((asset) => String(asset.id || '').trim() === String(currentLabWordCardSelectedId || '').trim()));
    const nextIndex = (currentIndex + Number(direction || 0) + filtered.length) % filtered.length;
    currentLabWordCardSelectedId = filtered[nextIndex]?.id || '';
    currentLabWordCardDetailOpen = true;
    persistShellViewState({
        labWordCardSelectedId: currentLabWordCardSelectedId,
        labWordCardSearchTerm: currentLabWordCardSearchTerm,
        labWordCardDetailOpen: true
    });
    renderLabViewShell();
}

function getLabShortDescription(text = '') {
    const source = String(text || '').trim();
    if (!source) return '';
    const stripped = source
        .replace(/[.。!！?？]+$/g, '')
        .replace(/(입니다|하는 영역입니다|프로그램입니다|설계하는 영역입니다|설계합니다)$/g, '')
        .trim();
    const cut = stripped.split(/[·,\/]/).map((part) => part.trim()).filter(Boolean)[0] || stripped;
    return cut.length > 18 ? `${cut.slice(0, 18)}…` : cut;
}

function buildLabStageContents(kind = 'cardlab', category = null, stage = null, stageIndex = 0) {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    const stageTitle = String(stage?.title || '').trim();
    const categoryTitle = String(category?.title || '').trim();
    const focusText = getLabStageFocusText(normalizedKind, stageTitle, categoryTitle);
    const stageLabel = stageTitle || `${getLabKindLabel(normalizedKind)} 스테이지`;
    const defaultContentTitles = ['기본 세트', '핵심 세트', '도전 세트', '복습 세트'];
    const contentTitles = normalizedKind === 'cardlab'
        ? (stageTitle.includes('듣고') ? ['소리 듣기', '같은 소리 찾기', '빠른 선택', '마무리 복습']
            : stageTitle.includes('그림') ? ['그림 비교', '유사 그림 찾기', '빠른 반응', '정리 보기']
            : stageTitle.includes('빠른') ? ['속도 도전', '연속 반응', '오답 줄이기', '마지막 확인']
            : stageTitle.includes('음운') || stageTitle.includes('첫소리') || stageTitle.includes('끝소리') || stageTitle.includes('운율') ? ['소리 듣기', '비슷한 소리 비교', '조음 연결', '정리']
            : stageTitle.includes('조합') || stageTitle.includes('조립') ? ['단어 배열', '문장 완성', '순서 바꾸기', '복습 미션']
            : stageTitle.includes('상황') ? ['문맥 읽기', '알맞은 어휘', '비슷한 표현', '적용하기']
            : stageTitle.includes('속담') || stageTitle.includes('관용') || stageTitle.includes('사자성어') ? ['뜻 찾기', '그림 연결', '상황 적용', '정리 카드']
            : stageTitle.includes('유의어') || stageTitle.includes('반의어') ? ['비슷한 말', '반대말', '비교하기', '확장 카드']
            : stageTitle.includes('조사') ? ['문장 연결', '조사 고르기', '붙여 읽기', '마무리']
            : stageTitle.includes('접속어') ? ['문장 이어주기', '흐름 맞추기', '이유 찾기', '복습']
            : stageTitle.includes('문장') ? ['단어 배열', '빈칸 채우기', '문장 읽기', '완성']
            : defaultContentTitles)
        : normalizedKind === 'numberlab'
            ? (stageTitle.includes('배워요') || stageTitle.includes('익히기') ? ['숫자 보기', '손으로 세기', '같은 수 찾기', '정리 카드']
                : stageTitle.includes('세기') ? ['하나씩 세기', '수량 맞추기', '빠른 찾기', '마무리']
                : stageTitle.includes('덧셈') ? ['기본 덧셈', '수식 맞추기', '빠른 계산', '확장 문제']
                : stageTitle.includes('뺄셈') ? ['기본 뺄셈', '수식 맞추기', '빠른 계산', '확장 문제']
                : stageTitle.includes('세로') ? ['자리 맞추기', '위아래 계산', '정답 확인', '복습']
                : stageTitle.includes('패밀리') || stageTitle.includes('확장') ? ['규칙 보기', '수 바꾸기', '패턴 찾기', '정리']
                : stageTitle.includes('길') ? ['길 따라가기', '더하기', '빼기', '마무리']
                : defaultContentTitles)
            : (stageTitle.includes('워밍업') || stageTitle.includes('집중') ? ['준비하기', '집중 유지', '빠른 반응', '정리']
                : stageTitle.includes('소리') || stageTitle.includes('음운') || stageTitle.includes('듣기') || stageTitle.includes('청능') ? ['소리 듣기', '구별하기', '반응하기', '복습']
                : stageTitle.includes('도형') || stageTitle.includes('패턴') || stageTitle.includes('시지각') || stageTitle.includes('공간') ? ['모양 보기', '차이 찾기', '공간 맞추기', '정리']
                : stageTitle.includes('어휘') || stageTitle.includes('문장') || stageTitle.includes('이야기') ? ['단어 늘리기', '문장 만들기', '이야기 이어가기', '정리']
                : stageTitle.includes('일상') || stageTitle.includes('생활') || stageTitle.includes('사회') ? ['순서 맞추기', '상황 고르기', '응용하기', '정리']
                : stageTitle.includes('소근육') || stageTitle.includes('미술') || stageTitle.includes('색') || stageTitle.includes('형태') ? ['손 움직이기', '색 고르기', '표현 확장', '복습']
                : stageTitle.includes('놀이') || stageTitle.includes('차례') || stageTitle.includes('의사소통') || stageTitle.includes('역할') ? ['차례 지키기', '대화하기', '함께하기', '정리']
                : defaultContentTitles);

    return contentTitles.slice(0, 4).map((title, index) => {
        const badge = String(index + 1).padStart(2, '0');
        return {
            id: `${slugifyLabText(`${normalizedKind}-${category?.id || categoryTitle}-${stageLabel}-${title}`)}-${badge}`,
            badge,
            title,
            desc: `${focusText} ${index === 0 ? '쉬운' : index === 1 ? '핵심' : index === 2 ? '도전' : '복습'} 콘텐츠입니다.`,
            meta: index === 0 ? '기본' : index === 1 ? '핵심' : index === 2 ? '도전' : '복습',
            stageLabel,
            stageIndex: stageIndex + 1
        };
    });
}

function renderLabViewShell() {
    const labView = document.getElementById('lab-view');
    const chip = document.getElementById('labClientChip');
    const kindTabs = document.querySelectorAll('.lab-kind-btn');
    const subcategoryTitle = document.getElementById('labSubcategoryTitle');
    const subcategoryDesc = document.getElementById('labSubcategoryDesc');
    const subcategoryCount = document.getElementById('labSubcategoryCount');
    const subcategoryGrid = document.getElementById('labSubcategoryGrid');
    const previewTitle = document.getElementById('labPreviewTitle');
    const previewBadge = document.getElementById('labPreviewBadge');
    const previewBackBtn = document.getElementById('labPreviewBackBtn');
    const previewPath = document.getElementById('labPreviewPath');
    const previewDesc = document.getElementById('labPreviewDesc');
    const previewStages = document.getElementById('labPreviewStages');
    const previewContents = document.getElementById('labPreviewContents');
    const previewNote = document.getElementById('labPreviewNote');
    const client = currentLabAnonymousMode ? null : (currentLabClient || getCurrentDetailClient());
    const normalizedKind = String(currentLabKind || 'cardlab').toLowerCase();
    const kindMeta = getLabLauncherKind(normalizedKind);
    const baseCategories = getLabLauncherCategories(normalizedKind);
    const categories = getFilteredSortedLabCategories(baseCategories, normalizedKind, client);
    const preferredCategoryId = String(currentLabSelectionByKind[normalizedKind] || currentLabSubcategoryId || '').trim();
    const selectedCategory = categories.find((item) => String(item.id || '').trim() === preferredCategoryId) || categories[0] || null;
    const stageItems = getLabLauncherStages(selectedCategory);
    const selectedStageKey = getLabStageSelection(normalizedKind, selectedCategory?.id || '');
    const selectedStageId = selectedStageKey ? String(selectedStageKey).trim() : '';
    const accent = String(kindMeta.accent || '#F59E0B').trim();
    const softAccent = String(kindMeta.softAccent || 'rgba(245, 158, 11, 0.16)').trim();
    const tabletLayout = isLabTabletLayout();
    const tabletDetailOpen = currentLabTabletDetailOpen;
    const isWordCardBrowser = normalizedKind === 'cardlab' && isLabWordCardCategory(selectedCategory);
    const categoriesReady = currentLabLauncherLoaded && !currentLabLauncherLoading;

    if (labView) {
        labView.style.setProperty('--lab-accent', accent);
        labView.style.setProperty('--lab-accent-soft', softAccent);
        labView.hidden = false;
        labView.setAttribute('aria-hidden', 'false');
        labView.classList.toggle('lab-tablet-detail-open', tabletDetailOpen);
        labView.classList.toggle('lab-wordcard-browser', isWordCardBrowser);
        labView.classList.toggle('lab-wordcard-detail-open', isWordCardBrowser && currentLabWordCardDetailOpen);
    }
    renderLabPageLoader();
    if (categoriesReady && currentLabPageLoading) {
        hideLabPageLoader();
    }

    if (chip) {
        chip.textContent = getLabClientChipText(client);
    }

    kindTabs.forEach((button) => {
        const isActive = String(button.dataset.labkind || '') === normalizedKind;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (subcategoryTitle) {
        subcategoryTitle.textContent = '';
        subcategoryTitle.hidden = true;
    }
    if (subcategoryDesc) subcategoryDesc.textContent = '';
    if (subcategoryCount) subcategoryCount.textContent = '';
    if (previewTitle) previewTitle.hidden = false;
    renderLabListControls(baseCategories, categories, normalizedKind);

    if (isWordCardBrowser) {
        if (!currentLabWordCardLoaded && !currentLabWordCardLoading) {
            ensureLabWordCardLibraryLoaded();
        }

        const filteredWordCards = getLabWordCardFilteredAssets();
        const selectedWordCard = getLabWordCardSelectedAsset(filteredWordCards);

        if (previewTitle) {
            previewTitle.textContent = '';
            previewTitle.hidden = true;
        }
        if (previewBadge) previewBadge.textContent = `${String(filteredWordCards.length || 0).padStart(2, '0')}장`;
        if (previewNote) previewNote.textContent = '';

        if (previewBackBtn) {
            if (tabletLayout || tabletDetailOpen || currentLabWordCardDetailOpen) {
                previewBackBtn.hidden = false;
                if (currentLabWordCardDetailOpen) {
                    previewBackBtn.innerHTML = '<span class="material-symbols-outlined">arrow_back</span>목록';
                    previewBackBtn.onclick = returnToLabWordCardGrid;
                } else {
                    previewBackBtn.innerHTML = '<span class="material-symbols-outlined">arrow_back</span>카테고리';
                    previewBackBtn.onclick = returnToLabCategoryList;
                }
            } else {
                previewBackBtn.hidden = true;
            }
        }

        if (previewPath) previewPath.innerHTML = '';
        if (previewDesc) previewDesc.textContent = '';

        if (subcategoryGrid) {
            subcategoryGrid.innerHTML = categories.map((category, index) => {
                const isActive = String(category.id || '') === String(selectedCategory?.id || '');
                const isFavorite = category.__labFavorite || isLabCategoryFavorite(normalizedKind, category);
                const isNew = category.__labNew || isLabCategoryNew(normalizedKind, category);
                return `
                    <button type="button" class="lab-subcategory-card${isActive ? ' active' : ''}" onclick="selectLabSubcategory('${escapeInlineJsString(category.id)}')">
                        <span class="lab-favorite-toggle${isFavorite ? ' is-on' : ''}" role="button" tabindex="0" aria-label="${isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}" onclick="event.stopPropagation(); toggleLabFavorite('${escapeInlineJsString(normalizedKind)}', '${escapeInlineJsString(category.id || '')}')" onkeydown="if(event.key === 'Enter' || event.key === ' '){event.preventDefault(); event.stopPropagation(); toggleLabFavorite('${escapeInlineJsString(normalizedKind)}', '${escapeInlineJsString(category.id || '')}');}">
                            <span class="material-symbols-outlined">${isFavorite ? 'star' : 'star'}</span>
                        </span>
                        <div class="lab-subcategory-top">
                            <span class="lab-subcategory-badge" style="--lab-accent:${category.accent || accent};--lab-accent-soft:${category.softAccent || softAccent};">${escapeHtml(String(category.badge || String(index + 1).padStart(2, '0')))}</span>
                            <div class="min-w-0">
                                <div class="lab-subcategory-card-title">${escapeHtml(category.title || category.label || '미분류')}${isNew ? '<span class="lab-new-badge">NEW</span>' : ''}</div>
                            </div>
                        </div>
                    </button>
                `;
            }).join('');
        }

        if (previewStages) {
            const categoryOptions = getLabWordCardCategoryOptions();
            previewStages.innerHTML = `
                <div class="lab-wordcard-toolbar">
                    <div class="lab-wordcard-filter-row lab-wordcard-filter-row-top">
                        <label class="lab-wordcard-search-wrap" aria-label="카드 검색">
                            <span class="material-symbols-outlined">search</span>
                            <input
                                type="search"
                                class="lab-wordcard-search-input"
                                placeholder="카드명, 카테고리, 태그 검색"
                                value="${escapeHtml(currentLabWordCardSearchTerm || '')}"
                                oninput="setLabWordCardSearchTerm(this.value)"
                                autocomplete="off"
                            >
                        </label>
                        <div class="lab-wordcard-filter-strip" role="group" aria-label="카드 필터">
                            <div class="lab-wordcard-type-group" aria-label="보기 방식">
                                ${[
                                    { id: 'all', label: '같이 보기' },
                                    { id: 'photo', label: '사진' },
                                    { id: 'illust', label: '일러스트' }
                                ].map((type) => {
                                    const isActive = String(type.id || '') === String(currentLabWordCardTypeFilter || 'all');
                                    return `<button type="button" class="lab-wordcard-chip${isActive ? ' active' : ''}" onclick="setLabWordCardFilterType('${escapeInlineJsString(type.id)}')">${escapeHtml(type.label)}</button>`;
                                }).join('')}
                            </div>
                            <div class="lab-wordcard-category-group" aria-label="카테고리 선택">
                                ${categoryOptions.map((category) => {
                                    const isActive = isLabWordCardCategoryFilterActive(category.id);
                                    const countValue = Number(category.count || 0) || 0;
                                    const label = String(category.label || category.id || '미분류').trim();
                                    return `
                                        <button type="button" class="lab-wordcard-chip lab-wordcard-category-chip${isActive ? ' active' : ''}" onclick="toggleLabWordCardCategoryFilter('${escapeInlineJsString(category.id)}')">
                                            <span class="lab-wordcard-category-chip-label">${escapeHtml(label)}</span>
                                            <span class="lab-wordcard-category-chip-count">${countValue}</span>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (previewContents) {
            if (currentLabWordCardLoading) {
                previewContents.innerHTML = '<div class="lab-wordcard-empty">카드 목록을 불러오는 중입니다.</div>';
            } else if (!currentLabWordCardLoaded) {
                previewContents.innerHTML = '<div class="lab-wordcard-empty">카드 목록을 준비하는 중입니다.</div>';
            } else if (currentLabWordCardDetailOpen && selectedWordCard) {
                const filteredCards = filteredWordCards;
                const currentIndex = Math.max(0, filteredCards.findIndex((item) => String(item.id || '').trim() === String(selectedWordCard.id || '').trim()));
                const prevCard = filteredCards[(currentIndex - 1 + filteredCards.length) % filteredCards.length] || null;
                const nextCard = filteredCards[(currentIndex + 1) % filteredCards.length] || null;
                const imageUrl = getLabWordCardImageUrl(selectedWordCard);
                previewContents.innerHTML = `
                    <div class="lab-wordcard-detail">
                        <div class="lab-wordcard-detail-media">
                            ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(selectedWordCard.nameKo || '')}" class="lab-wordcard-detail-image">` : '<div class="lab-wordcard-detail-placeholder">이미지 없음</div>'}
                            <div class="lab-wordcard-detail-nav">
                                <button type="button" class="lab-wordcard-nav-btn" onclick="moveLabWordCardDetail(-1)" aria-label="이전 카드">
                                    <span class="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button type="button" class="lab-wordcard-nav-btn" onclick="moveLabWordCardDetail(1)" aria-label="다음 카드">
                                    <span class="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div class="lab-wordcard-detail-body">
                            <div class="lab-wordcard-detail-top">
                                <div class="lab-wordcard-detail-title">${escapeHtml(selectedWordCard.nameKo || selectedWordCard.nameEn || '제목 없음')}</div>
                                <div class="lab-wordcard-detail-badges">
                                    <span class="lab-wordcard-badge">${escapeHtml(selectedWordCard.categoryLabel || '미분류')}</span>
                                    <span class="lab-wordcard-badge">${escapeHtml(selectedWordCard.assetTypeLabel || '기타')}</span>
                                </div>
                            </div>
                            <div class="lab-wordcard-detail-desc">${escapeHtml(selectedWordCard.descriptionKo || '설명이 없습니다.')}</div>
                            <div class="lab-wordcard-detail-meta">
                                <span>${escapeHtml(selectedWordCard.fileName || selectedWordCard.id || '')}</span>
                                <span>${escapeHtml(String(currentIndex + 1).padStart(2, '0'))} / ${escapeHtml(String(filteredCards.length).padStart(2, '0'))}</span>
                            </div>
                            <div class="lab-wordcard-detail-footer">
                                <button type="button" class="lab-wordcard-detail-link" onclick="selectLabWordCard('${escapeInlineJsString(prevCard?.id || '')}')">이전 카드</button>
                                <button type="button" class="lab-wordcard-detail-link" onclick="selectLabWordCard('${escapeInlineJsString(nextCard?.id || '')}')">다음 카드</button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                const displayColumns = getLabWordCardDisplayColumns();
                previewContents.innerHTML = filteredWordCards.length
                    ? `
                        <div class="lab-wordcard-grid" style="--lab-wordcard-columns:${displayColumns};">
                            ${filteredWordCards.map((item, index) => {
                                const imageUrl = getLabWordCardImageUrl(item);
                                return `
                                    <button type="button" class="lab-wordcard-card" onclick="selectLabWordCard('${escapeInlineJsString(item.id || '')}')">
                                        <div class="lab-wordcard-card-media">
                                            ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.nameKo || '')}" class="lab-wordcard-card-image">` : '<div class="lab-wordcard-card-placeholder">이미지 없음</div>'}
                                        </div>
                                        <div class="lab-wordcard-card-copy">
                                            <div class="lab-wordcard-card-top">
                                                <span class="lab-wordcard-card-index">${String(index + 1).padStart(2, '0')}</span>
                                                <span class="lab-wordcard-card-chip">${escapeHtml(item.assetTypeLabel || '기타')}</span>
                                            </div>
                                            <div class="lab-wordcard-card-title">${escapeHtml(item.nameKo || item.nameEn || '제목 없음')}</div>
                                            <div class="lab-wordcard-card-desc">${escapeHtml(item.descriptionKo || item.categoryLabel || '')}</div>
                                        </div>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    `
                    : '<div class="lab-wordcard-empty">표시할 카드가 없습니다.</div>';
            }
        }

        return;
    }

    if (selectedCategory?.id && selectedStageId) {
        setLabStageSelection(normalizedKind, selectedCategory.id, selectedStageId);
        currentLabStageId = selectedStageId;
    } else {
        currentLabStageId = '';
    }

    if (subcategoryGrid) {
        subcategoryGrid.innerHTML = categories.length ? categories.map((item, index) => {
            const isActive = String(item.id || '') === String(selectedCategory?.id || '');
            const thumbnailUrl = buildLabLauncherThumbnailUrl(item);
            const accessLabel = item.requiresPaid ? '유료 학습' : (item.requiresLogin ? '로그인' : '무료');
            const tagItems = normalizeLabLauncherTags(item.tags).slice(0, 4);
            const activity = item.__labActivity || getLabCategoryActivity(item, normalizedKind, client);
            const isFavorite = item.__labFavorite || isLabCategoryFavorite(normalizedKind, item);
            const isNew = item.__labNew || isLabCategoryNew(normalizedKind, item);
            return `
                <button type="button" class="lab-subcategory-card${isActive ? ' active' : ''}" data-subcategory-id="${escapeHtml(item.id || '')}" onclick="selectLabSubcategory('${escapeInlineJsString(item.id || '')}')">
                    <span class="lab-favorite-toggle${isFavorite ? ' is-on' : ''}" role="button" tabindex="0" aria-label="${isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}" onclick="event.stopPropagation(); toggleLabFavorite('${escapeInlineJsString(normalizedKind)}', '${escapeInlineJsString(item.id || '')}')" onkeydown="if(event.key === 'Enter' || event.key === ' '){event.preventDefault(); event.stopPropagation(); toggleLabFavorite('${escapeInlineJsString(normalizedKind)}', '${escapeInlineJsString(item.id || '')}');}">
                        <span class="material-symbols-outlined">star</span>
                    </span>
                    <div class="lab-subcategory-thumb${thumbnailUrl ? '' : ' is-empty'}">
                        <span class="lab-subcategory-index" style="--lab-accent:${item.accent || accent};--lab-accent-soft:${item.softAccent || softAccent};">${escapeHtml(item.badge || String(index + 1).padStart(2, '0'))}</span>
                        ${isNew ? '<span class="lab-new-ribbon">NEW</span>' : ''}
                        ${thumbnailUrl ? `<img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(item.title || '')} 학습 화면" loading="lazy" decoding="async" onerror="this.closest('.lab-subcategory-thumb')?.classList.add('is-empty'); this.remove();">` : ''}
                        <div class="lab-subcategory-thumb-empty">학습 화면</div>
                    </div>
                    <div class="lab-subcategory-card-body">
                        <div class="lab-subcategory-card-title">${escapeHtml(item.title || '')}${isNew ? '<span class="lab-new-badge">NEW</span>' : ''}</div>
                        <div class="lab-subcategory-card-desc">${escapeHtml(item.desc || '')}</div>
                        ${tagItems.length ? `
                            <div class="lab-subcategory-tag-row">
                                ${tagItems.map((tag) => `<span class="lab-subcategory-tag">#${escapeHtml(tag)}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="lab-subcategory-chip-row">
                            <span class="lab-subcategory-chip">${escapeHtml(kindMeta.label || '학습')}</span>
                            <span class="lab-subcategory-chip lab-subcategory-access-chip">${escapeHtml(accessLabel)}</span>
                        </div>
                        <div class="lab-subcategory-activity-row">
                            <span class="lab-subcategory-play-count">${escapeHtml(activity.playCountLabel || '학습 0회')}</span>
                            <span class="lab-subcategory-last-play${activity.hasPlayed ? '' : ' is-empty'}">${escapeHtml(activity.lastPlayedLabel || '아직 수업 전')}</span>
                        </div>
                    </div>
                </button>
            `;
        }).join('') : `
            <div class="lab-preview-content-empty">
                <strong>${getLabSearchTerm(normalizedKind) ? '검색 결과가 없습니다.' : '등록된 카테고리가 없습니다.'}</strong>
                <span>${getLabSearchTerm(normalizedKind) ? '초성, 학습명, 태그를 다시 확인하거나 검색어를 지워 전체 학습을 확인하세요.' : '관리자에서 학습을 등록하면 이 영역에 표시됩니다.'}</span>
            </div>
        `;
    }

    if (previewTitle) previewTitle.textContent = selectedCategory?.title || kindMeta.label;
    if (previewBadge) previewBadge.textContent = selectedCategory ? `${String(stageItems.length || 0).padStart(2, '0')}개 스테이지` : '준비중';
    if (previewBackBtn) {
        previewBackBtn.hidden = !tabletDetailOpen;
    }
    if (previewPath) previewPath.innerHTML = '';
    if (previewDesc) previewDesc.textContent = '';
    if (previewStages) previewStages.innerHTML = '';
    if (previewContents) previewContents.innerHTML = '';
    if (previewNote) previewNote.textContent = '';
    if (currentClassOnboardingActive) renderClassOnboarding();
    if (isWordCardBrowser) {
        requestAnimationFrame(() => scrollLabViewPanelsToTop());
    }
}

async function openLabCenter(kind = 'cardlab', client = null, returnView = '', options = {}) {
    const anonymousMode = options?.allowAnonymous === true;
    const suppressAnonymousGuide = options?.suppressAnonymousGuide === true;
    const suppressKindGuide = options?.suppressKindGuide === true;
    closeLabAnonymousGuide();
    if (isPendingTeacherGrade()) {
        showPendingTeacherGradeNotice();
        return;
    }
    const detailClient = anonymousMode ? null : (client || getCurrentDetailClient());
    if (!anonymousMode && !detailClient) {
        showBottomToast('LAB을 시작할 대상을 찾지 못했습니다.');
        return;
    }
    if (!anonymousMode && detailClient.type !== 'client') {
        showBottomToast('예약자는 LAB을 시작할 수 없습니다.');
        return;
    }
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    showLabPageLoader(normalizedKind);
    currentLabKind = LAB_LAUNCHER_KIND_ORDER.includes(normalizedKind) ? normalizedKind : 'cardlab';
    currentLabAnonymousMode = anonymousMode;
    currentLabClient = anonymousMode ? null : clonePersistableState(detailClient);
    currentLabReturnView = String(returnView || (currentShellView === 'output' ? 'output' : (currentShellView === 'detail' ? 'detail' : 'calendar'))).trim() || 'calendar';
    await ensureLabLauncherCatalogLoaded();
    syncLabLauncherNewItems({ showModal: !anonymousMode });
    if (anonymousMode) {
        currentDetailData = buildEmptyDetailData();
    } else {
        await loadLabActivityData(detailClient);
    }
    currentLabTabletDetailOpen = false;
    resetLabWordCardBrowserState({ keepGridMode: false });
    const categories = getVisibleLabCategories(currentLabKind, anonymousMode ? null : detailClient);
    const preferredId = String(currentLabSelectionByKind[currentLabKind] || '').trim();
    const initialCategory = categories.find((item) => String(item.id || '').trim() === preferredId) || categories[0] || null;
    currentLabSelectionByKind[currentLabKind] = initialCategory?.id || '';
    currentLabSubcategoryId = currentLabSelectionByKind[currentLabKind];
    const initialStages = getLabLauncherStages(initialCategory);
    const preferredStageId = String(getLabStageSelection(currentLabKind, initialCategory?.id || '') || '').trim();
    const initialStage = initialStages.find((stage, index) => getLabStageId(stage, index) === preferredStageId) || initialStages[0] || null;
    currentLabStageId = initialStage ? getLabStageId(initialStage, 0) : '';
    currentLabContentId = '';
    if (initialCategory?.id && currentLabStageId) {
        setLabStageSelection(currentLabKind, initialCategory.id, currentLabStageId);
    }
    if (initialCategory && isLabWordCardCategory(initialCategory)) {
        ensureLabWordCardLibraryLoaded();
        if (currentLabWordCardLoaded && currentLabWordCardRealtimeChannels.length === 0) {
            bindLabWordCardRealtime();
        }
    }
    persistShellViewState({
        view: 'lab',
        labClientId: currentLabClient?.id || '',
        labReturnView: currentLabReturnView,
        labKind: currentLabKind,
        labSubcategoryId: currentLabSubcategoryId,
        labStageId: currentLabStageId,
        labContentId: currentLabContentId,
        labTabletDetailOpen: currentLabTabletDetailOpen,
        labWordCardDetailOpen: currentLabWordCardDetailOpen,
        labWordCardSelectedId: currentLabWordCardSelectedId,
        labWordCardGridMode: currentLabWordCardGridMode,
        labWordCardCategoryFilter: currentLabWordCardCategoryFilter,
        labWordCardCategoryFilters: currentLabWordCardCategoryFilters,
        labWordCardTypeFilter: currentLabWordCardTypeFilter,
        labWordCardSearchTerm: currentLabWordCardSearchTerm
    });
    updateShellViewState('lab');
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
    if (anonymousMode) {
        if (!suppressAnonymousGuide) maybeOpenLabAnonymousGuide();
    } else if (!suppressKindGuide) {
        maybeOpenLabKindGuide(currentLabKind);
    }
}

async function openHeviAssessment() {
    if (isPendingTeacherGrade()) {
        showPendingTeacherGradeNotice();
        return;
    }
    const detailClient = getCurrentDetailClient();
    if (!detailClient) {
        showBottomToast('검사를 시작할 내담자를 찾지 못했습니다.');
        return;
    }
    if (detailClient.type !== 'client') {
        showBottomToast('예약자는 검사 · 척도를 시작할 수 없습니다.');
        return;
    }
    if (typeof window.ensureProtectedPlaylabSession === 'function' && !await window.ensureProtectedPlaylabSession()) {
        showBottomToast('학습 인증을 확인하지 못했습니다. 다시 로그인해 주세요.');
        return;
    }
    const preparedUrl = buildLabLaunchUrl(getHeviAssessmentUrl(), 'assessment', detailClient);
    if (!openLabDirectTargetOverlay(preparedUrl, '하하랩 표현 어휘 지수(H-EVI)')) {
        openDetachedLabWindow(preparedUrl);
    }
}

function startClientLabFromDetail() {
    openLabCenter('cardlab', getCurrentDetailClient());
}

function startAnonymousLabFromList() {
    openLabCenter('cardlab', null, 'calendar', { allowAnonymous: true });
}

async function setLabKind(kind = 'cardlab') {
    const normalizedKind = String(kind || 'cardlab').toLowerCase();
    if (!LAB_LAUNCHER_KIND_ORDER.includes(normalizedKind)) return;
    showLabPageLoader(normalizedKind);
    currentLabKind = normalizedKind;
    syncShellViewUrl('lab');
    await ensureLabLauncherCatalogLoaded();
    syncLabLauncherNewItems({ showModal: !currentLabAnonymousMode });
    if (currentLabAnonymousMode) {
        currentDetailData = buildEmptyDetailData();
    } else {
        await loadLabActivityData(currentLabClient || getCurrentDetailClient());
    }
    currentLabTabletDetailOpen = false;
    const categories = getVisibleLabCategories(normalizedKind);
    const preferredId = String(currentLabSelectionByKind[normalizedKind] || '').trim();
    const resolved = categories.find((item) => String(item.id || '').trim() === preferredId) || categories[0] || null;
    currentLabSelectionByKind[normalizedKind] = resolved?.id || '';
    currentLabSubcategoryId = resolved?.id || '';
    if (normalizedKind !== 'cardlab') {
        resetLabWordCardBrowserState({ keepGridMode: true });
    }
    const stageItems = getLabLauncherStages(resolved);
    const preferredStageId = String(getLabStageSelection(normalizedKind, resolved?.id || '') || '').trim();
    const resolvedStage = stageItems.find((stage, index) => getLabStageId(stage, index) === preferredStageId) || stageItems[0] || null;
    currentLabStageId = resolvedStage ? getLabStageId(resolvedStage, stageItems.indexOf(resolvedStage)) : '';
    currentLabContentId = '';
    if (resolved?.id && currentLabStageId) {
        setLabStageSelection(normalizedKind, resolved.id, currentLabStageId);
    }
    if (resolved && normalizedKind === 'cardlab' && isLabWordCardCategory(resolved)) {
        ensureLabWordCardLibraryLoaded();
        if (currentLabWordCardLoaded && currentLabWordCardRealtimeChannels.length === 0) {
            bindLabWordCardRealtime();
        }
    }
    persistShellViewState({
        labKind: currentLabKind,
        labSubcategoryId: currentLabSubcategoryId,
        labStageId: currentLabStageId,
        labContentId: currentLabContentId,
        labTabletDetailOpen: currentLabTabletDetailOpen
    });
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
    if (currentLabAnonymousMode) {
        maybeOpenLabAnonymousGuide();
    } else {
        maybeOpenLabKindGuide(currentLabKind);
    }
}

async function selectLabSubcategory(subcategoryId = '') {
    const normalizedId = String(subcategoryId || '').trim();
    if (!normalizedId) return;
    showLabPageLoader(currentLabKind);
    await ensureLabLauncherCatalogLoaded();
    const categories = getLabLauncherCategories(currentLabKind);
    const resolved = categories.find((item) => String(item.id || '').trim() === normalizedId);
    if (!resolved) {
        hideLabPageLoader({ force: true });
        return;
    }
    currentLabSelectionByKind[currentLabKind] = resolved.id;
    currentLabSubcategoryId = resolved.id;
    resetLabWordCardBrowserState({ keepGridMode: true });
    const stageItems = getLabLauncherStages(resolved);
    const preferredStageId = String(getLabStageSelection(currentLabKind, resolved.id) || '').trim();
    const resolvedStage = stageItems.find((stage, index) => getLabStageId(stage, index) === preferredStageId) || stageItems[0] || null;
    currentLabStageId = resolvedStage ? getLabStageId(resolvedStage, stageItems.indexOf(resolvedStage)) : '';
    currentLabContentId = '';
    const directTargetUrl = resolveLabCategoryTargetUrl(resolved);
    if (isLabWordCardCategory(resolved)) {
        ensureLabWordCardLibraryLoaded();
        if (currentLabWordCardLoaded && currentLabWordCardRealtimeChannels.length === 0) {
            bindLabWordCardRealtime();
        }
    }
    if (resolved.id && currentLabStageId) {
        setLabStageSelection(currentLabKind, resolved.id, currentLabStageId);
    }
    currentLabTabletDetailOpen = isLabWordCardCategory(resolved);
    persistShellViewState({
        labKind: currentLabKind,
        labSubcategoryId: currentLabSubcategoryId,
        labStageId: currentLabStageId,
        labContentId: currentLabContentId,
        labTabletDetailOpen: currentLabTabletDetailOpen
    });
    if (String(resolved?.targetMode || 'panel').trim() === 'direct' && directTargetUrl) {
        if (typeof window.ensureProtectedPlaylabSession === 'function' && !await window.ensureProtectedPlaylabSession()) {
            hideLabPageLoader({ force: true });
            showBottomToast('학습 인증을 확인하지 못했습니다. 다시 로그인해 주세요.');
            return;
        }
        const preparedTargetUrl = buildLabLaunchUrl(directTargetUrl, currentLabKind, currentLabClient, { anonymous: currentLabAnonymousMode });
        hideLabPageLoader({ force: true });
        if (!openLabDirectTargetOverlay(preparedTargetUrl, resolved?.title || resolved?.label || getLabKindLabel(currentLabKind))) {
            window.location.href = preparedTargetUrl;
        }
        return;
    }
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
}

function returnToLabCategoryList() {
    currentLabTabletDetailOpen = false;
    resetLabWordCardBrowserState({ keepGridMode: true });
    persistShellViewState({
        labTabletDetailOpen: false,
        labWordCardDetailOpen: currentLabWordCardDetailOpen,
        labWordCardSelectedId: currentLabWordCardSelectedId,
        labWordCardGridMode: currentLabWordCardGridMode
    });
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
}

function returnToLabWordCardGrid() {
    currentLabWordCardDetailOpen = false;
    persistShellViewState({ labWordCardDetailOpen: false });
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
}

function selectLabStage(stageId = '') {
    const normalizedStageId = String(stageId || '').trim();
    if (!normalizedStageId) return;
    const categoryId = String(currentLabSubcategoryId || currentLabSelectionByKind[currentLabKind] || '').trim();
    if (!categoryId) return;
    const categories = getLabLauncherCategories(currentLabKind);
    const category = categories.find((item) => String(item.id || '').trim() === categoryId) || null;
    const stageItems = getLabLauncherStages(category);
    const resolved = stageItems.find((stage, index) => getLabStageId(stage, index) === normalizedStageId);
    if (!resolved) return;
    currentLabStageId = normalizedStageId;
    currentLabContentId = '';
    setLabStageSelection(currentLabKind, categoryId, normalizedStageId);
    persistShellViewState({
        labKind: currentLabKind,
        labSubcategoryId: currentLabSubcategoryId,
        labStageId: currentLabStageId,
        labContentId: currentLabContentId
    });
    renderLabViewShell();
    requestAnimationFrame(() => scrollLabViewPanelsToTop());
}

function selectLabContent(contentId = '') {
    const normalizedContentId = String(contentId || '').trim();
    if (!normalizedContentId) return;
    currentLabContentId = normalizedContentId;
    persistShellViewState({ labContentId: currentLabContentId });
    renderLabViewShell();
}

function closeLabCenter() {
    const restoreView = currentLabReturnView || 'detail';
    const restoreClientId = String(currentDetailClientId || currentLabClient?.id || '').trim();
    const restoreClient = restoreClientId ? (findClientById(restoreClientId) || currentLabClient) : null;
    hideLabPageLoader({ force: true });
    currentLabClient = null;
    currentLabAnonymousMode = false;
    currentLabKind = 'cardlab';
    currentLabSubcategoryId = '';
    currentLabTabletDetailOpen = false;
    resetLabWordCardBrowserState({ keepGridMode: false });
    closeLabAnonymousGuide();
    persistShellViewState({
        view: restoreView,
        detailClientId: restoreClientId,
        labClientId: '',
        labReturnView: restoreView,
        labKind: 'cardlab',
        labSubcategoryId: '',
        labStageId: '',
        labContentId: '',
        labTabletDetailOpen: false,
        labWordCardDetailOpen: false,
        labWordCardSelectedId: '',
        labWordCardGridMode: 'two',
        labWordCardCategoryFilter: 'all',
        labWordCardCategoryFilters: ['all'],
        labWordCardTypeFilter: 'all',
        labWordCardSearchTerm: ''
    });
    const labView = document.getElementById('lab-view');
    if (labView) {
        labView.hidden = true;
        labView.setAttribute('aria-hidden', 'true');
    }
    updateShellViewState(restoreView);
    if (restoreView === 'detail') {
        if (restoreClient) {
            openClientDetail(null, restoreClient, null, null, null, { preserveDetailSubTab: true });
            requestAnimationFrame(() => {
                const activeItem = document.querySelector(`.draggable-item[data-client-id="${escapeHtml(restoreClientId)}"]`);
                if (activeItem) activeItem.classList.add('active');
                scrollDetailViewToTop();
            });
            return;
        }
        requestAnimationFrame(scrollDetailViewToTop);
    }
}

function confirmCloseLabCenter() {
    showConfirm(LAB_EXIT_CONFIRM_MESSAGE, () => {
        closeLabCenter();
    });
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeInlineJsString(value = '') {
    return escapeHtml(String(value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n'));
}

function getCurrentTeacherId() {
    const profile = window.currentProfile || {};
    return String(profile.teacherId || profile.teacher_id || '').trim();
}

function getCurrentTeacherName() {
    const profile = window.currentProfile || {};
    return String(profile.name || '').trim();
}

function markModalDirty() {
    isModalDirty = true;
}

function resetModalDirty() {
    isModalDirty = false;
}

function parseLocalDateInput(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateLocal(dateLike) {
    const date = dateLike instanceof Date ? dateLike : parseLocalDateInput(dateLike);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateLike, withWeekday = false) {
    const date = typeof dateLike === 'string' ? parseLocalDateInput(dateLike) : dateLike;
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '-';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    if (!withWeekday) return `${year}. ${month}. ${day}`;
    return `${year}. ${month}. ${day} (${DAY_LABELS[date.getDay()]})`;
}

function formatDateTimeDisplay(value) {
    if (!value) return '-';
    const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\.$/, '');
}

function stripHtmlTags(value = '') {
    const doc = new DOMParser().parseFromString(String(value || ''), 'text/html');
    return String(doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
}

function sanitizeRichMessageHtml(value = '') {
    if (!value) return '';
    const doc = new DOMParser().parseFromString(String(value || ''), 'text/html');
    const tags = new Set('a p br strong b em i u s strike span div img table thead tbody tfoot tr td th ul ol li blockquote hr pre code h1 h2 h3 h4 h5 h6'.split(' '));
    const attributes = new Set('class title alt width height colspan rowspan'.split(' '));
    doc.body.querySelectorAll('*').forEach((node) => {
        if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !tags.has(node.localName)) {
            node.remove();
            return;
        }
        Array.from(node.attributes).forEach((attr) => {
            const name = String(attr.name || '').toLowerCase();
            if ((node.localName === 'a' && name === 'href') || (node.localName === 'img' && name === 'src')) {
                try {
                    const url = new URL(attr.value.replace(/[\u0000-\u0020\u007f]/g, ''), window.location.href);
                    const protocols = node.localName === 'img' ? ['https:', 'http:'] : ['https:', 'http:', 'mailto:', 'tel:'];
                    if (!protocols.includes(url.protocol)) node.removeAttribute(attr.name);
                } catch (_error) { node.removeAttribute(attr.name); }
            } else if (!attributes.has(name)) {
                node.removeAttribute(attr.name);
            }
        });
        if (node.localName === 'a') node.setAttribute('rel', 'noopener noreferrer');
    });
    return doc.body.innerHTML;
}

function formatMessageDateTime(value) {
    if (!value) return '-';
    const parsed = new Date(String(value || '').replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/\.$/, '');
}

function isCurrentTeacherPaidMember() {
    const profile = window.currentProfile || {};
    const planCode = String(profile.subscriptionPlanCode ?? profile.subscription_plan_code ?? 'trial').trim().toLowerCase();
    const statusCode = String(profile.subscriptionStatus ?? profile.subscription_status ?? 'active').trim().toLowerCase();
    if (!planCode || ['trial', 'free'].includes(planCode)) return false;
    return !['cancelled', 'canceled', 'ended', 'expired', 'withdrawn'].includes(statusCode);
}

function formatPhoneNumber(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return String(value || '').trim() || '-';
}

function addDaysLocal(date, offset) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + offset);
    return copy;
}

function addMinutesToTime(timeValue, minutesToAdd) {
    const raw = String(timeValue || '').slice(0, 5);
    const [hour, minute] = raw.split(':').map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return raw;
    const date = new Date();
    date.setHours(hour, minute + Number(minutesToAdd || 0), 0, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function calculateDurationMinutes(startTime, endTime) {
    const start = String(startTime || '').slice(0, 5).split(':').map(Number);
    const end = String(endTime || '').slice(0, 5).split(':').map(Number);
    if (start.length !== 2 || end.length !== 2) return 0;
    return Math.max(0, (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]));
}

function timeToMinutes(timeValue) {
    const raw = String(timeValue || '').slice(0, 5);
    const [hour, minute] = raw.split(':').map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return (hour * 60) + minute;
}

function minutesToTime(minutesValue) {
    const safeMinutes = Math.max(0, Math.min((23 * 60) + 59, Math.floor(Number(minutesValue) || 0)));
    const hour = String(Math.floor(safeMinutes / 60)).padStart(2, '0');
    const minute = String(safeMinutes % 60).padStart(2, '0');
    return `${hour}:${minute}`;
}

function validateScheduleWindow(startTime, endTime) {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (startMinutes === null || endMinutes === null) {
        return { ok: false, message: '시간 형식이 올바르지 않습니다.' };
    }
    if (startMinutes < SCHEDULE_START_MINUTES) {
        return { ok: false, message: '수업 시작 시간은 08:00 이후여야 합니다.' };
    }
    if (endMinutes > SCHEDULE_END_MINUTES) {
        return { ok: false, message: '마지막 수업은 22:00에 종료되어야 합니다.' };
    }
    if (endMinutes <= startMinutes) {
        return { ok: false, message: '종료 시간이 시작 시간보다 늦어야 합니다.' };
    }
    return { ok: true, message: '' };
}

function checkTimeOverlap(startA, endA, startB, endB) {
    const aStart = timeToMinutes(startA);
    const aEnd = timeToMinutes(endA);
    const bStart = timeToMinutes(startB);
    const bEnd = timeToMinutes(endB);
    if ([aStart, aEnd, bStart, bEnd].some((value) => value === null)) return false;
    return aStart < bEnd && bStart < aEnd;
}

function sortSchedulesByDateTime(schedules = []) {
    return [...schedules].sort((a, b) => {
        const dateCompare = String(a.date || '').localeCompare(String(b.date || ''));
        if (dateCompare !== 0) return dateCompare;
        return String(a.startTime || a.start_time || '').localeCompare(String(b.startTime || b.start_time || ''));
    });
}

function getScheduleClientIdValue(schedule) {
    return String(schedule?.clientId || schedule?.client_id || '').trim();
}

function getScheduleTypeValue(schedule) {
    return String(schedule?.type || '').trim();
}

function getScheduleStartTimeValue(schedule) {
    return String(schedule?.startTime || schedule?.start_time || '').slice(0, 5);
}

function getScheduleEndTimeValue(schedule) {
    return String(schedule?.endTime || schedule?.end_time || '').slice(0, 5);
}

function getScheduleFutureSeriesCandidates(targetSchedule, schedules = getVisibleSchedules()) {
    if (!targetSchedule || !Array.isArray(schedules)) return [];
    const targetDate = parseLocalDateInput(targetSchedule.date);
    if (!targetDate) return [];

    const targetId = String(targetSchedule.id ?? '').trim();
    const targetClientId = getScheduleClientIdValue(targetSchedule);
    const targetType = getScheduleTypeValue(targetSchedule);
    const targetStartTime = getScheduleStartTimeValue(targetSchedule);
    const targetEndTime = getScheduleEndTimeValue(targetSchedule);
    const targetDuration = calculateDurationMinutes(targetStartTime, targetEndTime);
    const targetWeekday = targetDate.getDay();
    const targetMonthDay = targetDate.getDate();

    const baseCandidates = schedules.filter((schedule) => {
        if (!schedule) return false;
        if (String(schedule.id ?? '').trim() === targetId) return false;
        if (String(schedule.status || '').trim().toLowerCase() === 'deleted') return false;
        if (getScheduleClientIdValue(schedule) !== targetClientId) return false;
        if (getScheduleTypeValue(schedule) !== targetType) return false;
        if (getScheduleStartTimeValue(schedule) !== targetStartTime) return false;
        if (getScheduleEndTimeValue(schedule) !== targetEndTime) return false;
        if (calculateDurationMinutes(getScheduleStartTimeValue(schedule), getScheduleEndTimeValue(schedule)) !== targetDuration) return false;
        const candidateDate = parseLocalDateInput(schedule.date);
        return candidateDate && candidateDate.getTime() > targetDate.getTime();
    });

    const sortedCandidates = sortSchedulesByDateTime(baseCandidates);
    const weeklyCandidates = sortedCandidates.filter((schedule) => {
        const candidateDate = parseLocalDateInput(schedule.date);
        return candidateDate && candidateDate.getDay() === targetWeekday;
    });
    const monthlyCandidates = sortedCandidates.filter((schedule) => {
        const candidateDate = parseLocalDateInput(schedule.date);
        return candidateDate && candidateDate.getDate() === targetMonthDay;
    });

    if (weeklyCandidates.length >= 1 && weeklyCandidates.length >= monthlyCandidates.length) return weeklyCandidates;
    if (monthlyCandidates.length >= 1) return monthlyCandidates;
    return sortedCandidates;
}

function getScheduleSeriesCandidates(targetSchedule, schedules = getVisibleSchedules()) {
    if (!targetSchedule || !Array.isArray(schedules)) return [];
    const targetId = String(targetSchedule.id ?? '').trim();
    const targetClientId = getScheduleClientIdValue(targetSchedule);
    const targetType = getScheduleTypeValue(targetSchedule);
    const targetStartTime = getScheduleStartTimeValue(targetSchedule);
    const targetEndTime = getScheduleEndTimeValue(targetSchedule);
    const targetDuration = calculateDurationMinutes(targetStartTime, targetEndTime);

    return sortSchedulesByDateTime(schedules.filter((schedule) => {
        if (!schedule) return false;
        if (String(schedule.status || '').trim().toLowerCase() === 'deleted') return false;
        if (getScheduleClientIdValue(schedule) !== targetClientId) return false;
        if (getScheduleTypeValue(schedule) !== targetType) return false;
        if (getScheduleStartTimeValue(schedule) !== targetStartTime) return false;
        if (getScheduleEndTimeValue(schedule) !== targetEndTime) return false;
        return calculateDurationMinutes(getScheduleStartTimeValue(schedule), getScheduleEndTimeValue(schedule)) === targetDuration
            || String(schedule.id ?? '').trim() === targetId;
    }));
}

function getDateDayOffset(fromDateStr, toDateStr) {
    const fromDate = parseLocalDateInput(fromDateStr);
    const toDate = parseLocalDateInput(toDateStr);
    if (!fromDate || !toDate) return 0;
    const fromUtc = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const toUtc = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    return Math.round((toUtc - fromUtc) / 86400000);
}

function normalizeGuardians(guardians) {
    if (!Array.isArray(guardians)) return [];
    return guardians
        .map((guardian) => ({
            name: String(guardian?.name || '').trim(),
            relation: String(guardian?.relation || '').trim(),
            contact: String(guardian?.contact || '').trim()
        }))
        .filter((guardian) => guardian.name || guardian.relation || guardian.contact);
}

function deriveAgeFromDob(dob) {
    const date = parseLocalDateInput(dob);
    if (!date) return null;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
    return age >= 0 ? age : null;
}

function getClientAgeValue(client) {
    const rawAge = Number(client.age);
    if (Number.isFinite(rawAge) && rawAge >= 0) return rawAge;
    return deriveAgeFromDob(client.dob);
}

function getClientAgeText(client) {
    const age = getClientAgeValue(client);
    return age !== null && age !== undefined ? `만 ${age}세` : '나이 미정';
}

function formatClientAgeGender(client) {
    const ageValue = getClientAgeValue(client);
    const ageText = ageValue !== null && ageValue !== undefined ? `${ageValue}세` : '미정';
    const gender = client.gender === 'female' ? '여' : client.gender === 'male' ? '남' : '';
    return gender ? `${ageText} (${gender})` : ageText;
}

function getRehabNormProfileFromAge(age) {
    const numericAge = Number(age);
    if (!Number.isFinite(numericAge) || numericAge < 0) return 'lower-elementary';
    if (numericAge < 7) return 'preschool';
    if (numericAge < 10) return 'lower-elementary';
    if (numericAge < 19) return 'upper-elementary';
    if (numericAge < 65) return 'adult';
    return 'senior';
}

function buildDetailClientReportAgeMeta(client = getCurrentDetailClient()) {
    const age = client ? getClientAgeValue(client) : null;
    const normProfile = getRehabNormProfileFromAge(age);
    const ageLabel = age !== null && age !== undefined ? `만 ${age}세` : '';
    let ageGroupLabel = '연령 미정';
    if (normProfile === 'preschool') ageGroupLabel = '유아/취학 전';
    else if (normProfile === 'lower-elementary') ageGroupLabel = '초등 저학년';
    else if (normProfile === 'upper-elementary') ageGroupLabel = '초등 고학년/청소년';
    else if (normProfile === 'adult') ageGroupLabel = '성인';
    else if (normProfile === 'senior') ageGroupLabel = '고령';
    return {
        clientAge: age,
        clientAgeLabel: ageLabel,
        ageRangeLabel: ageLabel,
        ageGroupLabel,
        normProfile
    };
}

function getLabClientChipText(client) {
    if (currentLabAnonymousMode) return '내담자 미선택';
    if (!client) return '-';
    const name = String(client.name || '').trim();
    const ageText = getClientAgeText(client);
    const typeText = client.type === 'reserve' ? '예약자' : '내담자';
    const namePart = name ? `${name}${ageText && ageText !== '나이 미정' ? `(${ageText})` : ''}` : '-';
    return `${namePart} ${typeText}`.trim();
}

function flattenAreas(areas) {
    if (!areas) return [];
    if (Array.isArray(areas)) {
        return areas.map((item) => String(item || '').trim()).filter(Boolean);
    }
    if (typeof areas === 'string') {
        return areas.split(',').map((item) => item.trim()).filter(Boolean);
    }
    if (typeof areas === 'object') {
        return Object.values(areas)
            .flatMap((value) => Array.isArray(value) ? value : [])
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }
    return [];
}

function normalizeLabReportScope(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return '';
    if (normalized === LAB_REPORT_SCOPE_REHAB || normalized === 'rehablab') return LAB_REPORT_SCOPE_REHAB;
    if (normalized === LAB_REPORT_SCOPE_MUSICARTLAB || normalized === 'musicart' || normalized === 'music-art-lab' || normalized === 'music_art_lab') return LAB_REPORT_SCOPE_MUSICARTLAB;
    if (normalized === LAB_REPORT_SCOPE_PLAYLAB || normalized === 'gamelab' || normalized === 'game') return LAB_REPORT_SCOPE_PLAYLAB;
    if (normalized === LAB_REPORT_SCOPE_NUMBERLAB || normalized === 'number') return LAB_REPORT_SCOPE_NUMBERLAB;
    return normalized;
}

function normalizeLabHistoryRow(row = {}) {
    const normalized = keysToCamel(row);
    return {
        ...normalized,
        details: parseMaybeJson(normalized.details, {}),
        metadata: parseMaybeJson(normalized.metadata, {})
    };
}

function isCompletedLabHistoryRow(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const completionActions = ['게임 완료', '학습 완료', 'lab_session_completed', 'game completed', 'learning completed'];
    // `action` is the lifecycle value. `action_type` is commonly the activity
    // title (for example "신호등-반응 억제 훈련"), so it must not override a
    // valid completion action after snake_case normalization.
    const action = String(normalized.action || '').trim().toLowerCase();
    if (action) return completionActions.includes(action);
    const legacyActionType = String(normalized.actionType || normalized.action_type || '').trim().toLowerCase();
    if (completionActions.includes(legacyActionType)) return true;
    const completedAt =
        normalized.eventDatetime || normalized.event_datetime ||
        normalized.completedAt || normalized.completed_at ||
        details.completed_at || details.completedAt ||
        metadata.completed_at || metadata.completedAt;
    const totalQuestions = Number(
        details.total_questions ?? details.totalQuestions ??
        metadata.total_questions ?? metadata.totalQuestions ??
        normalized.totalQuestions ?? normalized.total_questions ?? 0
    );
    const duration = Number(
        details.duration_seconds ?? details.durationSeconds ??
        details.duration_minutes ?? details.durationMinutes ??
        metadata.duration_seconds ?? metadata.durationSeconds ??
        metadata.duration_minutes ?? metadata.durationMinutes ??
        normalized.durationSeconds ?? normalized.duration_seconds ??
        normalized.durationMinutes ?? normalized.duration_minutes ?? 0
    );
    const hasCompletionPayload = Boolean(
        totalQuestions > 0 || duration > 0 ||
        details.report_input || details.reportInput || metadata.report_input || metadata.reportInput ||
        details.report_type || details.reportType || metadata.report_type || metadata.reportType
    );
    return Boolean(completedAt && hasCompletionPayload);
}

function inferLabReportScopeFromHistoryRow(row = {}) {
    const normalizedRow = normalizeLabHistoryRow(row);
    const details = normalizedRow.details || {};
    const metadata = normalizedRow.metadata || {};
    const reportInput = parsePlaylabStoredReportInput({ row: normalizedRow })?.input || {};
    // Some early RehabLab standalone activities were persisted by the shared
    // player with a PlayLab scope.  Preserve the recorded event, but recover
    // its intended report destination from the immutable source-page/content
    // identifier so historical RehabLab work is not silently omitted.
    const sourceIdentity = [
        details.source_page, details.sourcePage, details.file_name, details.fileName,
        details.content_id, details.contentId, details.game_id, details.gameId,
        details.report_type, details.reportType, details.report_profile_id, details.reportProfileId,
        details.target_url, details.targetUrl, details.private_path, details.privatePath,
        details.lab_kind, details.labKind,
        reportInput.report_type, reportInput.reportType, reportInput.report_scope, reportInput.reportScope,
        reportInput.lab_scope, reportInput.labScope, reportInput.lab_kind, reportInput.labKind,
        reportInput.source_page, reportInput.sourcePage, reportInput.content_id, reportInput.contentId,
        metadata.source_page, metadata.sourcePage, metadata.file_name, metadata.fileName,
        metadata.content_id, metadata.contentId, metadata.game_id, metadata.gameId,
        metadata.report_type, metadata.reportType, metadata.report_profile_id, metadata.reportProfileId,
        metadata.target_url, metadata.targetUrl, metadata.private_path, metadata.privatePath,
        metadata.lab_kind, metadata.labKind,
        normalizedRow.source_page, normalizedRow.sourcePage, normalizedRow.target_url, normalizedRow.targetUrl,
        normalizedRow.action_type, normalizedRow.actionType
    ].join(' ').toLowerCase();
    const rehabIdentity = [
        /\brehab(?:lab)?[-_/]/,
        /rehablab[-_/]/,
        /신호등[- ·]?반응 억제/,
        /도형 일치[- ·]?반응 억제/,
        /스트룹 색상[- ·]?단어/,
        /방향 회전 재활/,
        /재활 카드 스포트라이트/,
        /컬러 블록 실제 개수/,
        /재활랩 하늘 반응 억제/
    ].some((pattern) => pattern.test(sourceIdentity));
    if (rehabIdentity || normalizeLabReportScope(details.lab_kind || details.labKind || metadata.lab_kind || metadata.labKind) === LAB_REPORT_SCOPE_REHAB) {
        return LAB_REPORT_SCOPE_REHAB;
    }
    const explicitScope = normalizeLabReportScope(
        details.report_scope ||
        details.reportScope ||
        metadata.report_scope ||
        metadata.reportScope ||
        normalizedRow.reportScope ||
        normalizedRow.report_scope ||
        details.report_kind ||
        details.reportKind ||
        metadata.report_kind ||
        metadata.reportKind
    );
    if (explicitScope) return explicitScope;

    const labScope = normalizeLabReportScope(
        details.lab_scope ||
        details.labScope ||
        metadata.lab_scope ||
        metadata.labScope ||
        normalizedRow.labScope ||
        normalizedRow.lab_scope
    );
    if (labScope === LAB_REPORT_SCOPE_PLAYLAB) return LAB_REPORT_SCOPE_PLAYLAB;
    if (labScope === LAB_REPORT_SCOPE_NUMBERLAB) return LAB_REPORT_SCOPE_NUMBERLAB;
    if (labScope === LAB_REPORT_SCOPE_MUSICARTLAB) return LAB_REPORT_SCOPE_MUSICARTLAB;
    if (labScope === LAB_REPORT_SCOPE_REHAB) return LAB_REPORT_SCOPE_REHAB;

    return '';
}

function getObservedReportNumber(value) {
    if (typeof value !== 'number' && !(typeof value === 'string' && value.trim() !== '')) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function readObservedReportNumber(sources = [], keys = []) {
    for (const source of sources) {
        if (!source || typeof source !== 'object' || Array.isArray(source)) continue;
        for (const key of keys) {
            const value = getObservedReportNumber(source[key]);
            if (value !== null) return value;
        }
    }
    return null;
}

function getObservedReportAverage(values = [], digits = 0) {
    const known = values.map(getObservedReportNumber).filter((value) => value !== null);
    if (!known.length) return null;
    const scale = 10 ** digits;
    return Math.round((known.reduce((sum, value) => sum + value, 0) / known.length) * scale) / scale;
}

function formatObservedReportMetric(value, suffix = '') {
    const numeric = getObservedReportNumber(value);
    return numeric === null ? '미기록' : `${Math.round(numeric * 100) / 100}${suffix}`;
}

function getReportDurationObservation(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const input = parseMaybeJson(details.report_input ?? details.reportInput ?? metadata.report_input ?? metadata.reportInput, {}) || {};
    const elapsed = readObservedReportNumber([details, input, metadata], ['elapsed_ms', 'elapsedMs']);
    if (elapsed !== null) return { minutes: elapsed / 60000, source: 'stored-elapsed-ms', approximate: false };
    const seconds = readObservedReportNumber([details, input, metadata, normalized], ['duration_seconds', 'durationSeconds']);
    if (seconds !== null) return { minutes: seconds / 60, source: 'stored-duration-seconds', approximate: false };
    if ((details.duration_source || details.durationSource || metadata.duration_source || metadata.durationSource) === 'unavailable') return { minutes: null, source: 'unavailable', approximate: false };
    const minutes = readObservedReportNumber([details, metadata, normalized], ['duration_minutes', 'durationMinutes']);
    if (minutes !== null) {
        const precision = details.duration_precision || details.durationPrecision || metadata.duration_precision || metadata.durationPrecision;
        return { minutes, source: precision === 'reported-elapsed' ? 'stored-precise-minutes' : 'legacy-minute-value', approximate: precision !== 'reported-elapsed' && Number.isInteger(minutes) };
    }
    return { minutes: null, source: 'unavailable', approximate: false };
}

function formatObservedReportDuration(value, approximate = false) {
    const minutes = getObservedReportNumber(value);
    if (minutes === null) return '미기록';
    if (approximate) return `약 ${Math.round(minutes * 100) / 100}분 · 분단위 기록`;
    return minutes < 1 ? `${Math.round(minutes * 6000) / 100}초` : `${Math.round(minutes * 100) / 100}분`;
}

function getPlaylabStoredMetricObservation(row = {}, keys = [], metric = '') {
    const normalized = normalizeLabHistoryRow(row);
    for (const source of [normalized.details || {}, normalized.metadata || {}]) {
        const value = readObservedReportNumber([source], keys);
        if (value === null) continue;
        const provenance = source.report_metric_provenance || source.reportMetricProvenance || {};
        const declaredSource = String(provenance[metric] || '');
        return { value, source: declaredSource && declaredSource !== 'unavailable' ? declaredSource : 'stored-unverified' };
    }
    return { value: null, source: 'unavailable' };
}

function getObservedReportDelta(values = []) {
    if (values.length < 2) return null;
    const first = getObservedReportNumber(values[0]);
    const last = getObservedReportNumber(values[values.length - 1]);
    return first === null || last === null ? null : Math.round((last - first) * 100) / 100;
}

function getObservedReportSeriesAggregate(series = [], key, sum = false) {
    let numerator = 0;
    let denominator = 0;
    series.forEach((item) => {
        const value = getObservedReportNumber(item[key]);
        if (value === null) return;
        const count = getObservedReportNumber(item.metricCounts?.[key]) ?? getObservedReportNumber(item.count) ?? 0;
        if (!count) return;
        numerator += sum ? value : value * count;
        denominator += count;
    });
    if (!denominator) return null;
    const scale = key === 'durationMinutes' ? 1000000 : 100;
    return sum ? numerator : Math.round((numerator / denominator) * scale) / scale;
}

function getHistoryScore(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const candidates = [
        details.score,
        metadata.score,
        details.total_score,
        metadata.total_score,
        details.totalScore,
        metadata.totalScore,
        details.report_integrated_score,
        details.reportIntegratedScore,
        metadata.report_integrated_score,
        metadata.reportIntegratedScore
    ];
    for (const candidate of candidates) {
        const value = getObservedReportNumber(candidate);
        if (value !== null) return value;
    }
    return null;
}

function getHistoryDurationMinutes(row = {}) {
    return getReportDurationObservation(row).minutes;
}

function getHistoryAccuracyScore(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const explicit = readObservedReportNumber([details, metadata], ['accuracy_score', 'accuracyScore', 'accuracy_rate', 'accuracyRate']);
    if (explicit !== null) return explicit;
    if ([details.accuracy_source, details.accuracySource, metadata.accuracy_source, metadata.accuracySource].includes('unavailable')) return null;
    const correctCount = readObservedReportNumber([details, metadata], ['correct_count', 'correctCount']);
    const totalQuestions = readObservedReportNumber([details, metadata], ['total_questions', 'totalQuestions']);
    if (totalQuestions > 0 && correctCount !== null) {
        return Math.round((correctCount / totalQuestions) * 100);
    }
    return null;
}

function getLabReportRowTitle(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    return String(
        details.report_title ||
        details.reportTitle ||
        details.lab_title ||
        details.content_title ||
        details.contentTitle ||
        details.game_name ||
        details.gameName ||
        details.stage_title ||
        details.stageTitle ||
        details.level_title ||
        details.levelTitle ||
        normalized.memo ||
        '수업'
    ).trim() || '수업';
}

function getLabHistoryClinicalSummary(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    return String(
        details.report_brief_opinion ||
        details.reportBriefOpinion ||
        details.brief_opinion ||
        details.briefOpinion ||
        details.report_headline ||
        details.reportHeadline ||
        details.report_overview ||
        details.reportOverview ||
        metadata.report_brief_opinion ||
        metadata.reportBriefOpinion ||
        ''
    ).trim();
}

function getLabHistoryGuardianSummary(row = {}, scopeLabel = '학습') {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const explicit = String(
        details.report_guardian_summary ||
        details.reportGuardianSummary ||
        metadata.report_guardian_summary ||
        metadata.reportGuardianSummary ||
        ''
    ).trim();
    if (explicit) return explicit;
    const title = getLabReportRowTitle(row);
    const label = String(scopeLabel || details.lab_label || details.labLabel || metadata.lab_label || metadata.labLabel || '학습').trim() || '학습';
    return `최근 ${label}에서는 ${title} 활동을 진행했습니다. 보호자 공유에서는 점수보다 시작할 때의 참여도, 과제를 끝까지 유지한 흐름, 오답 뒤 다시 시도하는 모습을 중심으로 설명합니다. 이전 기록과 함께 보면 같은 조건에서 더 안정적으로 수행했는지, 도움이 더 필요했는지를 선생님이 확인합니다.`;
}

function getLabHistoryGuardianActionSummary(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const explicit = String(
        details.report_action_plan_summary ||
        details.reportActionPlanSummary ||
        metadata.report_action_plan_summary ||
        metadata.reportActionPlanSummary ||
        ''
    ).trim();
    return explicit || '다음 회기에는 같은 난이도에서 한 번 더 안정성을 확인한 뒤, 정답률과 반응 흐름이 유지되면 과제 수나 단서 난이도를 조금만 올려보는 방식이 좋습니다. 피로하거나 시작 반응이 늦으면 난이도 상승보다 짧은 성공 경험을 먼저 확보합니다.';
}

// Build comparison metadata only from explicitly stored fields. A report schema
// version, task title or row ID cannot stand in for task version/condition/session.
function buildReportOpinionRecord(record = {}) {
    const row = record.row || record;
    const details = row.details && typeof row.details === 'object' ? row.details : {};
    const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
    const parseObject = (value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) return value;
        if (typeof value === 'string') { try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}; } catch (_error) {} }
        return {};
    };
    const input = parseObject(details.report_input || details.reportInput || metadata.report_input || metadata.reportInput || record.reportInput);
    const sources = [input.comparisonContext, input.measurementContext, input, details.comparison_context, details.measurement_context, metadata.comparison_context, metadata.measurement_context, details, metadata, row, record].map(parseObject);
    const read = (...keys) => {
        for (const source of sources) for (const key of keys) {
            const value = source[key];
            if (value !== null && value !== undefined && (typeof value === 'string' || typeof value === 'number') && String(value).trim()) return String(value).trim();
        }
        return '';
    };
    const metric = (...keys) => {
        for (const source of sources) for (const key of keys) {
            const value = getObservedReportNumber(source[key]);
            if (value !== null) return value;
        }
        return null;
    };
    return {
        task_id: read('task_id', 'taskId'), task_version: read('task_version', 'taskVersion'),
        difficulty: read('difficulty', 'difficulty_id', 'difficultyId'),
        device_class: read('device_class', 'deviceClass'), input_method: read('input_method', 'inputMethod'),
        session_context: read('session_context', 'sessionContext'), session_id: read('session_id', 'sessionId'),
        accuracyRate: metric('accuracyRate', 'accuracy_rate', 'accuracy'),
        avgQuestionMs: metric('avgQuestionMs', 'avg_question_ms', 'avgReactionMs', 'avg_reaction_ms'),
        reaction_time_rule: read('reaction_time_rule', 'reactionTimeRule') || [input.reactionTimeSample, input.reaction_time_sample, details.reaction_time_sample, details.reactionTimeSample, metadata.reaction_time_sample, metadata.reactionTimeSample].map(parseObject).map((sample) => typeof sample.sampleRule === 'string' ? sample.sampleRule.trim() : '').find(Boolean) || '',
        playedAt: record.playedAt instanceof Date && Number.isFinite(record.playedAt.getTime()) ? record.playedAt.toISOString() : read('playedAt', 'event_datetime', 'eventDatetime', 'created_at', 'createdAt')
    };
}

function buildStoredReportOpinion(records = [], scopeLabel = '학습') {
    const rows = Array.isArray(records) ? records : [];
    const api = typeof window !== 'undefined' && window.PlaylabReportEngine;
    if (api && typeof api.buildLongitudinalOpinion === 'function') {
        return api.buildLongitudinalOpinion(rows.map(buildReportOpinionRecord));
    }
    return {
        stage: 'comparison-held', statusLabel: rows.length ? '비교 조건 확인' : '기록 없음',
        overview: `${scopeLabel}의 저장 기록 ${rows.length}건을 확인했습니다.`,
        synthesis: '과제·버전·난이도·기기·입력·세션 맥락이 일치하는 독립 회기를 확인하기 전에는 변화 방향을 해석하지 않습니다.',
        guidance: '담당 선생님이 원기록과 도움 제공 조건을 확인하고 다음 관찰 조건을 정합니다.',
        matchedCount: 0, excludedCount: rows.length, limits: ['동일 조건 비교 검증 전']
    };
}

function buildGuardianTrendNarrative({ scopeLabel = '학습', latestTitle = '', latestScore = null, latestAccuracy = null, recordCount = 0, records = [] } = {}) {
    const opinion = buildStoredReportOpinion(records, scopeLabel);
    const title = String(latestTitle || scopeLabel || '학습').trim();
    const count = Number.isSafeInteger(recordCount) && recordCount >= 0 ? recordCount : 0;
    return {
        ...opinion,
        nextLabel: opinion.matchedCount >= 2 ? '같은 조건 재확인' : '조건·원자료 확인',
        overview: records.length ? (opinion.guardianOverview || opinion.overview) : `${title}의 저장 기록 ${count}건을 확인했습니다.`,
        synthesis: opinion.guardianSynthesis || opinion.synthesis,
        guidance: opinion.guardianGuidance || opinion.guidance
    };
}

function buildGuardianHistoryNarrative(rows = [], scopeLabel = '학습') {
    const safeRows = Array.isArray(rows) ? rows : [];
    const latestRow = safeRows[0] || {};
    const base = buildGuardianTrendNarrative({ scopeLabel, latestTitle: getLabReportRowTitle(latestRow), recordCount: safeRows.length, records: safeRows });
    return { ...base, summary: base.overview, action: base.guidance };
}

function getLabHistoryOverview(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    return String(
        details.report_overview ||
        details.reportOverview ||
        details.overview ||
        metadata.report_overview ||
        metadata.reportOverview ||
        ''
    ).trim();
}

function getLabHistoryRecommendations(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const recommendations = details.report_recommendations || details.reportRecommendations || [];
    if (!Array.isArray(recommendations)) return [];
    return recommendations.map((item) => {
        if (typeof item === 'string') return item.trim();
        if (!item || typeof item !== 'object') return '';
        const title = String(item.title || '').trim();
        const desc = String(item.desc || item.description || item.text || '').trim();
        return [title, desc].filter(Boolean).join(': ');
    }).filter(Boolean);
}

function normalizeReportRecommendationItems(value = []) {
    if (!Array.isArray(value)) return [];
    return value.map((item) => {
        if (typeof item === 'string') {
            const text = item.trim();
            if (!text) return null;
            const separatorIndex = text.indexOf(': ');
            if (separatorIndex > 0 && separatorIndex < 28) {
                return {
                    title: text.slice(0, separatorIndex).trim(),
                    desc: text.slice(separatorIndex + 2).trim()
                };
            }
            return { title: '권장 훈련 방향', desc: text };
        }
        if (!item || typeof item !== 'object') return null;
        const title = String(item.title || item.label || item.name || '권장 훈련 방향').trim();
        const desc = String(item.desc || item.description || item.text || item.summary || '').trim();
        return desc ? { title, desc } : null;
    }).filter(Boolean);
}

function getLabHistoryRoleNotes(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const raw = details.report_role_notes ||
        details.reportRoleNotes ||
        details.report_roles ||
        details.reportRoles ||
        details.role_notes ||
        details.roleNotes ||
        metadata.report_role_notes ||
        metadata.reportRoleNotes ||
        metadata.report_roles ||
        metadata.reportRoles ||
        metadata.role_notes ||
        metadata.roleNotes ||
        null;
    if (!raw) return [];
    const source = Array.isArray(raw)
        ? raw
        : (typeof raw === 'object'
            ? Object.entries(raw).map(([key, value]) => ({
                title: key,
                ...(value && typeof value === 'object' ? value : {}),
                text: typeof value === 'string'
                    ? value
                    : String(value?.text || value?.summary || value?.detailedOpinion || value?.description || '').trim()
            }))
            : []);
    return source.map((item) => {
        if (typeof item === 'string') {
            const text = item.trim();
            return text ? { title: '전문가 소견', text } : null;
        }
        if (!item || typeof item !== 'object') return null;
        const title = String(item.title || item.label || item.name || '전문가 소견').trim();
        const text = String(item.text || item.desc || item.description || item.summary || item.detailedOpinion || '').trim();
        if (!text) return null;
        return {
            title,
            text,
            noteId: String(item.note_id || item.noteId || item.id || '').trim(),
            author: String(item.author_name || item.authorName || item.author || '').trim(),
            discipline: String(item.discipline || item.author_discipline || item.authorDiscipline || '').trim(),
            sourceType: String(item.source_type || item.sourceType || item.source || '').trim().toLowerCase(),
            reviewedAt: String(item.reviewed_at || item.reviewedAt || item.authored_at || item.authoredAt || '').trim(),
            reviewStatus: String(item.review_status || item.reviewStatus || '').trim().toLowerCase()
        };
    }).filter(Boolean);
}

function getLabHistoryEvidenceBasis(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const basis = details.report_evidence_basis || details.reportEvidenceBasis || [];
    if (!Array.isArray(basis)) return [];
    return basis.map((item) => String(item || '').trim()).filter(Boolean);
}

function getLabHistoryReferenceLinks(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const links = details.report_reference_links || details.reportReferenceLinks || [];
    if (!Array.isArray(links)) return [];
    return links.map((item) => {
        if (!item || typeof item !== 'object') return null;
        const label = String(item.label || item.title || '').trim();
        const url = String(item.url || item.href || '').trim();
        return label && url ? { label, url } : null;
    }).filter(Boolean);
}

function isCardlabProgressCompleted(row = {}) {
    const bestScore = Number(row.bestScore ?? row.best_score ?? 0) || 0;
    const latestScore = Number(row.latestScore ?? row.latest_score ?? 0) || 0;
    const clearCount = Number(row.clearCount ?? row.clear_count ?? 0) || 0;
    return row.cleared === true || row.completed === true || bestScore >= 70 || latestScore >= 70 || clearCount > 0;
}

function getCardlabCurriculumLabel(curriculumKey = '') {
    const normalized = String(curriculumKey || '').trim().toLowerCase();
    const labelMap = {
        'hangul-assembly': '한글 조합',
        'association-chain': '연상 연결',
        'context-vocabulary': '문맥 어휘',
        'meaning-pair': '의미 짝짓기',
        'sentence-particle': '조사 선택',
        'connective-bridge': '접속어 연결',
        'sentence-assembly': '문장 조합',
        'hangul-phonics': '음운 인식',
        'card-quiz': '카드 퀴즈',
        'word-quiz': '단어 퀴즈',
        'cardlab-essential-word-spell': '무엇일까요? 필수 단어 퀴즈',
        'essential-word-spell': '필수 단어 글자 완성',
        'picture-word': '사진 단어',
        'cardlab-word-picture-game': '단어 보고 그림 찾기',
        'cardlab-reaction-switch': '같거나 다르거나!',
        'cardlab-whats-wrong': '어딘가 이상해요',
        'zoo-sound': '동물 소리 찾기',
        'car-logo': '자동차 로고',
        'cardlab-time-dayparts': '하루 시간 배우기',
        'cardlab-situation-sequence': '상황 스크립트 순서화',
        'cardlab-situation-talk': '그림 보고 이야기해요',
        'cardlab-situation-ox': '생각 쑥쑥 OX 모험'
    };
    return labelMap[normalized] || '카드랩';
}

function buildCardlabClinicalSummary(attempts = [], wrongStats = [], progressRows = []) {
    const safeAttempts = Array.isArray(attempts) ? attempts : [];
    if (!safeAttempts.length) return { title: '', summary: '', detailedOpinion: '', recommendations: [] };
    const opinion = buildStoredReportOpinion(safeAttempts, '카드랩');
    const words = [...new Set((Array.isArray(wrongStats) ? wrongStats : []).map((row) => String(row.word || row.assetName || row.asset_name || '').trim()).filter(Boolean))].slice(0, 3);
    const completedStages = (Array.isArray(progressRows) ? progressRows : []).filter((row) => isCardlabProgressCompleted(row)).length;
    return {
        title: '카드랩 누적 수행 관찰',
        summary: opinion.overview,
        detailedOpinion: `${opinion.synthesis} 완료 표시 스테이지는 ${completedStages}개이며, 완료 수는 언어 능력이나 일반화 수준을 뜻하지 않습니다.${words.length ? ` 오답 집계에 포함된 항목은 ${words.join(', ')}입니다. 문항·그림·단서의 적절성과 실제 반응을 함께 확인합니다.` : '오답 집계가 없다는 이유만으로 오류가 없거나 수행이 안정적이라고 판단하지 않습니다.'}`,
        recommendations: [opinion.guidance, '독립 정답과 도움 후 정답이 구분되어 기록된 과제에서 지원 조건을 확인합니다.', '한 번에 한 조건만 바꾸는 관찰 후보를 선생님이 검토합니다.']
    };
}

function getLabReportRowSubtitle(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const category = String(details.category_title || details.categoryTitle || '').trim();
    const level = String(details.level_title || details.levelTitle || '').trim();
    const stage = String(details.stage_title || details.stageTitle || '').trim();
    return [category, level, stage].filter(Boolean).join(' · ');
}

function clampDetailReportValue(value, min = 0, max = 100) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.min(max, Math.max(min, numeric));
}

function parseHistoryDateTime(value) {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const raw = String(value || '').trim();
    if (!raw) return null;
    const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getHistoryPlayedAt(row = {}) {
    return parseHistoryDateTime(row.eventDatetime || row.event_datetime || row.createdAt || row.created_at || '');
}

function getHistoryQuestionCount(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const correctCount = Math.max(0, Number(details.correct_count ?? details.correctCount ?? metadata.correct_count ?? metadata.correctCount ?? 0) || 0);
    const wrongCount = Math.max(0, Number(details.wrong_count ?? details.wrongCount ?? metadata.wrong_count ?? metadata.wrongCount ?? 0) || 0);
    const totalQuestions = Math.max(
        correctCount + wrongCount,
        Number(details.total_questions ?? details.totalQuestions ?? metadata.total_questions ?? metadata.totalQuestions ?? 0) || 0,
        0
    );
    return {
        correctCount,
        wrongCount,
        totalQuestions
    };
}

function getHistoryAccuracy(row = {}) {
    return getHistoryAccuracyScore(row);
}

function getPlaylabFocusKey(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const explicit = String(details.report_focus_key || details.reportFocusKey || '').trim();
    if (explicit) return explicit;
    const categoryText = getLabReportRowSubtitle(row);
    const titleText = getLabReportRowTitle(row);
    const combined = `${categoryText} ${titleText}`.trim();
    if (/시간|오전|오후|저녁|오늘|어제|내일|이번달|지난달|다음달|올해|작년|내년/.test(combined)) return 'time';
    if (/도형|조각|시지각|추리|회전|모양|퍼즐/.test(combined)) return 'cognitive';
    if (/색|컬러|연결|순서|번호|추적/.test(combined)) return 'sequence';
    if (/집중|빠른|반응|탐색|속도/.test(combined)) return 'reaction';
    if (/기억|단서|부분|힌트/.test(combined)) return 'memory';
    return 'general';
}

function getPlaylabFocusLabel(focusKey) {
    const labels = {
        cognitive: '인지 처리',
        sequence: '순차 추적',
        reaction: '반응 조절',
        memory: '작업기억',
        time: '시간 개념',
        'time-sequence': '시간 순서',
        'arrow-direction-grid': '방향·공간 재구성',
        'number-cross-math-puzzle': '연산 논리·작업기억',
        general: '기초 수행'
    };
    return labels[focusKey] || labels.general;
}

function getPlaylabDifficultyScore(row = {}) {
    return getPlaylabStoredMetricObservation(row, ['report_difficulty_score', 'reportDifficultyScore', 'difficulty_score', 'difficultyScore'], 'difficulty').value;
}

function getPlaylabSpeedScore(row = {}) {
    return getPlaylabStoredMetricObservation(row, ['report_speed_score', 'reportSpeedScore', 'speed_score', 'speedScore'], 'speed').value;
}

function buildPlaylabTimelineEntries(rows = [], scope = LAB_REPORT_SCOPE_PLAYLAB) {
    return (Array.isArray(rows) ? rows : [])
        .map(normalizeLabHistoryRow)
        .filter((row) => inferLabReportScopeFromHistoryRow(row) === scope && !isHeviHistoryRow(row))
        .filter(isCompletedLabHistoryRow)
        .map((row, index) => {
            const playedAt = getHistoryPlayedAt(row);
            if (!playedAt) return null;
            const score = getHistoryScore(row);
            const accuracy = getHistoryAccuracy(row);
            const durationObservation = getReportDurationObservation(row);
            const durationMinutes = durationObservation.minutes;
            const correctCount = getPlaylabObservedMetric({ row }, ['correct_count', 'correctCount']);
            const wrongCount = getPlaylabObservedMetric({ row }, ['wrong_count', 'wrongCount']);
            const totalQuestions = getPlaylabObservedMetric({ row }, ['total_questions', 'totalQuestions']);
            const speedScore = getPlaylabSpeedScore(row);
            const difficultyScore = getPlaylabDifficultyScore(row);
            const focusKey = getPlaylabFocusKey(row);
            const details = row.details || {};
            const metadata = row.metadata || {};
            const cognitiveObservation = getPlaylabStoredMetricObservation(row, ['report_cognitive_score', 'reportCognitiveScore'], 'cognitive');
            const reactionObservation = getPlaylabStoredMetricObservation(row, ['report_reaction_score', 'reportReactionScore'], 'reaction');
            const consistencyObservation = getPlaylabStoredMetricObservation(row, ['report_consistency_score', 'reportConsistencyScore', 'consistency_score', 'consistencyScore'], 'consistency');
            const cognitiveScore = cognitiveObservation.value;
            const reactionScore = reactionObservation.value;
            return {
                id: row.id || `${scope}-history-${index + 1}`,
                row,
                playedAt,
                score,
                accuracy,
                durationMinutes,
                durationObservation,
                correctCount,
                wrongCount,
                totalQuestions,
                speedScore,
                difficultyScore,
                cognitiveScore,
                reactionScore,
                consistencyScore: consistencyObservation.value,
                metricSources: {
                    cognitive: cognitiveObservation.source,
                    reaction: reactionObservation.source,
                    speed: getPlaylabStoredMetricObservation(row, ['report_speed_score', 'reportSpeedScore', 'speed_score', 'speedScore'], 'speed').source,
                    difficulty: getPlaylabStoredMetricObservation(row, ['report_difficulty_score', 'reportDifficultyScore', 'difficulty_score', 'difficultyScore'], 'difficulty').source,
                    consistency: consistencyObservation.source,
                    duration: durationObservation.source
                },
                focusKey,
                focusLabel: getPlaylabFocusLabel(focusKey),
                title: getLabReportRowTitle(row),
                subtitle: getLabReportRowSubtitle(row)
            };
        })
        .filter(Boolean)
        .sort((left, right) => left.playedAt.getTime() - right.playedAt.getTime());
}

function getWeekStartDate(date) {
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = target.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    target.setDate(target.getDate() + diff);
    target.setHours(0, 0, 0, 0);
    return target;
}

function buildPlaylabTrendSeries(entries = [], period = 'week') {
    const buckets = new Map();
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
        if (!entry?.playedAt) return;
        let key = '';
        let sortValue = 0;
        let label = '';
        if (period === 'week') {
            const weekStart = getWeekStartDate(entry.playedAt);
            key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
            sortValue = weekStart.getTime();
            label = `${String(weekStart.getMonth() + 1).padStart(2, '0')}.${String(weekStart.getDate()).padStart(2, '0')}`;
        } else if (period === 'month') {
            key = `${entry.playedAt.getFullYear()}-${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}`;
            sortValue = new Date(entry.playedAt.getFullYear(), entry.playedAt.getMonth(), 1).getTime();
            label = `${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}월`;
        } else {
            key = String(entry.playedAt.getFullYear());
            sortValue = new Date(entry.playedAt.getFullYear(), 0, 1).getTime();
            label = `${entry.playedAt.getFullYear()}년`;
        }
        if (!buckets.has(key)) {
            buckets.set(key, {
                key,
                sortValue,
                label,
                entries: []
            });
        }
        buckets.get(key).entries.push(entry);
    });

    return [...buckets.values()]
        .sort((left, right) => left.sortValue - right.sortValue)
        .map((bucket) => {
            const count = bucket.entries.length;
            const keys = { cognitive: 'cognitiveScore', reaction: 'reactionScore', score: 'score', accuracy: 'accuracy', durationMinutes: 'durationMinutes', speed: 'speedScore', difficulty: 'difficultyScore', consistency: 'consistencyScore' };
            const metrics = {};
            const metricCounts = {};
            Object.entries(keys).forEach(([key, entryKey]) => {
                const values = bucket.entries.map((entry) => entry[entryKey]);
                metrics[key] = getObservedReportAverage(values, key === 'durationMinutes' ? 6 : 2);
                metricCounts[key] = values.filter((value) => getObservedReportNumber(value) !== null).length;
            });
            const countEntries = bucket.entries.filter((entry) => getObservedReportNumber(entry.correctCount) !== null && getObservedReportNumber(entry.totalQuestions) !== null);
            const correctCount = countEntries.length ? countEntries.reduce((sum, entry) => sum + entry.correctCount, 0) : null;
            const totalQuestions = countEntries.length ? countEntries.reduce((sum, entry) => sum + entry.totalQuestions, 0) : null;
            return {
                key: bucket.key,
                label: bucket.label,
                count,
                ...metrics,
                metricCounts,
                durationApproximate: bucket.entries.some((entry) => entry.durationObservation?.approximate),
                storedUnverifiedMetrics: bucket.entries.some((entry) => Object.values(entry.metricSources || {}).includes('stored-unverified')),
                correctCount,
                totalQuestions,
                countCoverage: countEntries.length
            };
        });
}

function buildTrendPolylinePoints(values, width, height, padding) {
    if (!Array.isArray(values) || !values.length) return '';
    if (values.some((value) => getObservedReportNumber(value) === null)) return '';
    const usableWidth = width - padding.left - padding.right;
    const usableHeight = height - padding.top - padding.bottom;
    return values.map((value, index) => {
        const x = values.length === 1
            ? padding.left + usableWidth / 2
            : padding.left + (usableWidth * index / Math.max(values.length - 1, 1));
        const y = padding.top + ((100 - clampDetailReportValue(value)) / 100) * usableHeight;
        return `${x},${y}`;
    }).join(' ');
}

function renderObservedTrendLines(values, color, width, height, padding, className = 'detail-playlab-chart-line') {
    const segments = [];
    let points = [];
    const flush = () => {
        if (points.length > 1) segments.push(`<polyline class="${escapeHtml(className)}" style="stroke:${escapeHtml(color)}" points="${points.join(' ')}"></polyline>`);
        points = [];
    };
    values.forEach((value, index) => {
        const coordinate = getTrendPointCoordinate(values, index, width, height, padding);
        if (!coordinate) { flush(); return; }
        points.push(`${coordinate.x},${coordinate.y}`);
    });
    flush();
    return segments.join('');
}

function buildTrendGridMarkup(width, height, padding, values = [20, 50, 80]) {
    const usableHeight = height - padding.top - padding.bottom;
    return values.map((value) => {
        const y = padding.top + ((100 - value) / 100) * usableHeight;
        return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="detail-playlab-chart-grid"></line>`;
    }).join('');
}

function getTrendPointCoordinate(values, index, width, height, padding) {
    if (getObservedReportNumber(values[index]) === null) return null;
    const usableWidth = width - padding.left - padding.right;
    const usableHeight = height - padding.top - padding.bottom;
    return {
        x: values.length === 1
            ? padding.left + usableWidth / 2
            : padding.left + (usableWidth * index / Math.max(values.length - 1, 1)),
        y: padding.top + ((100 - clampDetailReportValue(values[index])) / 100) * usableHeight
    };
}

function buildTrendPointDots(values, color, width, height, padding, options = {}) {
    if (!Array.isArray(values) || !values.length) return '';
    const series = Array.isArray(options.series) ? options.series : [];
    const metricLabel = String(options.metricLabel || '수치').trim() || '수치';
    const valueSuffix = String(options.valueSuffix || '점').trim();
    const labelOffset = Number(options.labelOffset || -10);
    const showValueLabels = options.showValueLabels !== false;
    return values.map((value, index) => {
        const coordinate = getTrendPointCoordinate(values, index, width, height, padding);
        if (!coordinate) return '';
        const { x, y } = coordinate;
        const item = series[index] || {};
        const sessionText = item.count ? ` · 세션 ${item.count}회` : '';
        const accuracyText = getObservedReportNumber(item.accuracy) !== null ? ` · 정확도 ${item.accuracy}%` : '';
        const durationText = getObservedReportNumber(item.durationMinutes) !== null ? ` · 평균 ${formatObservedReportDuration(item.durationMinutes, item.durationApproximate)}` : '';
        const title = `${item.label || `${index + 1}구간`} · ${metricLabel} ${value}${valueSuffix}${sessionText}${accuracyText}${durationText}`;
        const labelY = clampDetailReportValue(y + labelOffset, padding.top + 8, height - padding.bottom - 8);
        const tooltipWidth = 142;
        const tooltipHeight = 58;
        const tooltipX = Math.max(padding.left, Math.min(width - padding.right - tooltipWidth, x - tooltipWidth / 2));
        const tooltipY = Math.max(padding.top, y - tooltipHeight - 14);
        const tooltipLines = [
            `${item.label || `${index + 1}구간`} · ${metricLabel}`,
            `${value}${valueSuffix}${item.count ? ` · ${item.count}회` : ''}`,
            getObservedReportNumber(item.accuracy) !== null ? `정확도 ${item.accuracy}%${durationText}` : ''
        ].filter(Boolean);
        return `
            <g class="detail-playlab-chart-point" tabindex="0" aria-label="${escapeHtml(title)}">
                <title>${escapeHtml(title)}</title>
                <circle cx="${x}" cy="${y}" r="4.5" fill="${color}" stroke="#ffffff" stroke-width="2.5"></circle>
                ${showValueLabels ? `<text x="${x}" y="${labelY}" text-anchor="middle" class="detail-playlab-chart-value-label" fill="${color}">${escapeHtml(String(value))}</text>` : ''}
                <g class="detail-playlab-chart-tooltip" transform="translate(${tooltipX} ${tooltipY})">
                    <rect width="${tooltipWidth}" height="${tooltipHeight}" rx="10" ry="10"></rect>
                    ${tooltipLines.map((line, lineIndex) => `<text x="12" y="${18 + (lineIndex * 16)}">${escapeHtml(line)}</text>`).join('')}
                </g>
            </g>
        `;
    }).join('');
}

function buildTrendAxisLabels(series, width, height, padding) {
    if (!Array.isArray(series) || !series.length) return '';
    const usableWidth = width - padding.left - padding.right;
    const baselineY = height - 8;
    return series.map((item, index) => {
        const x = series.length === 1
            ? padding.left + usableWidth / 2
            : padding.left + (usableWidth * index / Math.max(series.length - 1, 1));
        return `<text x="${x}" y="${baselineY}" text-anchor="middle" class="detail-playlab-chart-label">${escapeHtml(item.label)}</text>`;
    }).join('');
}

function getPlaylabTrendWindowSize(period) {
    if (period === 'week') return 6;
    if (period === 'month') return 6;
    return 5;
}

function getPlaylabTrendTitle(period) {
    if (period === 'week') return '주간 추세';
    if (period === 'month') return '월간 추세';
    return '연간 추세';
}

function getPlaylabTrendDescription(period) {
    const unit = period === 'week' ? '주차' : period === 'month' ? '월' : '연도';
    return `${unit} 단위로 기록된 과제 점수와 정확도를 확인합니다. 인지·반응·속도 등의 저장 참고값은 출처가 확인되지 않을 수 있으며, 결측은 0점이나 연결선으로 보충하지 않습니다. 같은 과제·도움·기기 조건인지 확인하기 전에는 임상 변화로 해석하지 않습니다.`;
}

function renderPlaylabUnifiedTrendChartShell(chartKey) {
    return `
        <div class="detail-playlab-chart-card detail-playlab-chart-card-unified">
            <div class="detail-playlab-chart-head">
                <div>
                    <p class="detail-playlab-section-kicker">TREND</p>
                    <h4 id="${chartKey}-title" class="detail-playlab-chart-title">통합 추세 그래프</h4>
                </div>
                <div class="detail-playlab-chart-toolbar">
                    <div class="detail-playlab-chart-periods">
                        <button type="button" class="detail-playlab-period-btn" data-period="week" onclick="setPlaylabTrendPeriod('${chartKey}','week')">주간</button>
                        <button type="button" class="detail-playlab-period-btn" data-period="month" onclick="setPlaylabTrendPeriod('${chartKey}','month')">월간</button>
                        <button type="button" class="detail-playlab-period-btn" data-period="year" onclick="setPlaylabTrendPeriod('${chartKey}','year')">연간</button>
                    </div>
                    <div class="detail-playlab-chart-nav">
                        <button type="button" id="${chartKey}-prev" class="detail-playlab-nav-btn" onclick="shiftPlaylabTrendWindow('${chartKey}',-1)" aria-label="이전 구간">‹</button>
                        <button type="button" id="${chartKey}-next" class="detail-playlab-nav-btn" onclick="shiftPlaylabTrendWindow('${chartKey}',1)" aria-label="다음 구간">›</button>
                    </div>
                </div>
            </div>
            <p id="${chartKey}-desc" class="detail-playlab-chart-desc"></p>
            <div class="detail-playlab-chart-summary" id="${chartKey}-badges">
                <span class="detail-playlab-chart-badge is-cognitive">인지 참고값 미기록</span>
                <span class="detail-playlab-chart-badge is-reaction">반응 참고값 미기록</span>
                <span id="${chartKey}-range" class="detail-playlab-chart-range"></span>
            </div>
            <div id="${chartKey}-metrics" class="detail-playlab-chart-metrics"></div>
            <div id="${chartKey}-body"></div>
            <div id="${chartKey}-legend" class="detail-playlab-chart-legend"></div>
        </div>
    `;
}

function updatePlaylabTrendView(chartKey) {
    const stateMap = window.__playlabTrendViews || {};
    const viewState = stateMap[chartKey];
    if (!viewState) return;

    const period = viewState.period || 'month';
    const allSeries = Array.isArray(viewState.seriesMap?.[period]) ? viewState.seriesMap[period] : [];
    const windowSize = getPlaylabTrendWindowSize(period);
    const maxOffset = Math.max(0, allSeries.length - windowSize);
    viewState.offset = clampDetailReportValue(viewState.offset, 0, maxOffset);
    const visibleSeries = allSeries.slice(viewState.offset, viewState.offset + windowSize);

    const titleNode = document.getElementById(`${chartKey}-title`);
    const descNode = document.getElementById(`${chartKey}-desc`);
    const badgesNode = document.getElementById(`${chartKey}-badges`);
    const rangeNode = document.getElementById(`${chartKey}-range`);
    const metricsNode = document.getElementById(`${chartKey}-metrics`);
    const bodyNode = document.getElementById(`${chartKey}-body`);
    const legendNode = document.getElementById(`${chartKey}-legend`);
    const prevNode = document.getElementById(`${chartKey}-prev`);
    const nextNode = document.getElementById(`${chartKey}-next`);

    if (!bodyNode) return;
    if (!visibleSeries.length) {
        bodyNode.innerHTML = '<p class="detail-playlab-chart-empty">표시할 집계 데이터가 아직 충분하지 않습니다.</p>';
        return;
    }

    const width = 860;
    const height = 220;
    const padding = { top: 18, right: 28, bottom: 36, left: 24 };
    const dashboardMetrics = [
        { key: 'cognitive', label: '저장 인지 참고값', shortLabel: '인지 참고값', color: '#2563eb', values: visibleSeries.map((item) => item.cognitive), showLabels: true, labelOffset: -12 },
        { key: 'reaction', label: '저장 반응 참고값', shortLabel: '반응 참고값', color: '#ea580c', values: visibleSeries.map((item) => item.reaction), showLabels: true, labelOffset: 18 },
        { key: 'accuracy', label: '정확도', shortLabel: '정확', color: '#059669', values: visibleSeries.map((item) => item.accuracy), showLabels: false, labelOffset: -22 },
        { key: 'speed', label: '저장 속도 참고값', shortLabel: '속도 참고값', color: '#7c3aed', values: visibleSeries.map((item) => item.speed), showLabels: false, labelOffset: 22 },
        { key: 'difficulty', label: '저장 난이도 참고값', shortLabel: '난이도 참고값', color: '#0f766e', values: visibleSeries.map((item) => item.difficulty), showLabels: false, labelOffset: -30 },
        { key: 'consistency', label: '저장 균형 참고값', shortLabel: '균형 참고값', color: '#64748b', values: visibleSeries.map((item) => item.consistency), showLabels: false, labelOffset: 30 }
    ];
    const trendSeries = dashboardMetrics;
    const deltaByKey = dashboardMetrics.reduce((acc, item) => {
        acc[item.key] = getObservedReportDelta(item.values);
        return acc;
    }, {});
    const gridLines = buildTrendGridMarkup(width, height, padding);

    if (titleNode) titleNode.textContent = getPlaylabTrendTitle(period);
    if (descNode) descNode.textContent = getPlaylabTrendDescription(period);
    if (badgesNode) {
        badgesNode.innerHTML = dashboardMetrics.map((item) => {
            const delta = deltaByKey[item.key];
            const hasValues = item.values.some((value) => getObservedReportNumber(value) !== null);
            const text = !hasValues ? '미기록' : delta === null ? '비교자료 부족' : `${delta >= 0 ? '+' : ''}${delta}`;
            return `<span class="detail-playlab-chart-badge" style="--metric-color:${item.color}; --metric-soft:${item.color}1a;">${escapeHtml(item.shortLabel)} ${escapeHtml(text)}</span>`;
        }).join('') + `<span id="${chartKey}-range" class="detail-playlab-chart-range">${escapeHtml(`${visibleSeries[0]?.label || '-'} - ${visibleSeries[visibleSeries.length - 1]?.label || '-'}`)}</span>`;
    }
    if (rangeNode) rangeNode.textContent = `${visibleSeries[0]?.label || '-'} - ${visibleSeries[visibleSeries.length - 1]?.label || '-'}`;
    if (prevNode) prevNode.disabled = viewState.offset <= 0;
    if (nextNode) nextNode.disabled = viewState.offset >= maxOffset;

    document.querySelectorAll(`[data-period][onclick*="${chartKey}"]`).forEach((button) => {
        button.classList.toggle('is-active', button.getAttribute('data-period') === period);
    });

    const aggregateCount = visibleSeries.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    const aggregateScore = getObservedReportSeriesAggregate(visibleSeries, 'score');
    const aggregateAccuracy = getObservedReportSeriesAggregate(visibleSeries, 'accuracy');
    const aggregateDuration = getObservedReportSeriesAggregate(visibleSeries, 'durationMinutes');
    const aggregateSpeed = getObservedReportSeriesAggregate(visibleSeries, 'speed');
    const aggregateDifficulty = getObservedReportSeriesAggregate(visibleSeries, 'difficulty');
    const aggregateConsistency = getObservedReportSeriesAggregate(visibleSeries, 'consistency');
    const aggregateCorrect = visibleSeries.reduce((sum, item) => sum + (Number(item.correctCount) || 0), 0);
    const aggregateTotal = visibleSeries.reduce((sum, item) => sum + (Number(item.totalQuestions) || 0), 0);
    if (metricsNode) {
        const metricItems = [
            { label: '세션 수', value: `${aggregateCount}회` },
            { label: '평균 과제 점수', value: formatObservedReportMetric(aggregateScore, '점') },
            { label: '평균 정확도', value: formatObservedReportMetric(aggregateAccuracy, '%') },
            { label: '평균 소요시간', value: formatObservedReportDuration(aggregateDuration, visibleSeries.some((item) => item.durationApproximate)) },
            { label: '저장 속도 참고값', value: formatObservedReportMetric(aggregateSpeed, '점') },
            { label: '저장 난이도 참고값', value: formatObservedReportMetric(aggregateDifficulty, '점') },
            { label: '저장 균형 참고값', value: formatObservedReportMetric(aggregateConsistency, '점') },
            { label: '정반응 / 총문항', value: aggregateTotal > 0 ? `${aggregateCorrect}/${aggregateTotal}` : '-' }
        ];
        metricsNode.innerHTML = metricItems.map((item) => `
            <div class="detail-playlab-chart-metric">
                <span class="detail-playlab-chart-metric-label">${escapeHtml(item.label)}</span>
                <strong class="detail-playlab-chart-metric-value">${escapeHtml(item.value)}</strong>
            </div>
        `).join('');
    }
    if (legendNode) {
        legendNode.innerHTML = trendSeries.map((item) => `
            <span><i class="detail-playlab-dot" style="background:${item.color}"></i>${escapeHtml(item.label)}</span>
        `).join('');
    }

    bodyNode.innerHTML = `
        <svg class="detail-playlab-chart-svg is-unified" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(getPlaylabTrendTitle(period))}">
            ${gridLines}
            ${trendSeries.map((item) => renderObservedTrendLines(item.values, item.color, width, height, padding)).join('')}
            ${trendSeries.map((item) => buildTrendPointDots(item.values, item.color, width, height, padding, {
                series: visibleSeries,
                metricLabel: item.label,
                valueSuffix: item.key === 'accuracy' ? '%' : '점',
                labelOffset: item.labelOffset,
                showValueLabels: item.showLabels
            })).join('')}
            ${buildTrendAxisLabels(visibleSeries, width, height, padding)}
        </svg>
        <div class="detail-playlab-chart-data-grid" role="table" aria-label="${escapeHtml(getPlaylabTrendTitle(period))} 기간별 통계">
            <div class="detail-playlab-chart-data-row is-head" role="row">
                <span role="columnheader">기간</span>
                <span role="columnheader">인지</span>
                <span role="columnheader">반응</span>
                <span role="columnheader">정확도</span>
                <span role="columnheader">속도</span>
                <span role="columnheader">난이도</span>
                <span role="columnheader">균형</span>
                <span role="columnheader">세션</span>
            </div>
            ${visibleSeries.map((item) => `
                <div class="detail-playlab-chart-data-row" role="row">
                    <span role="cell">${escapeHtml(item.label)}</span>
                    <span role="cell">${formatObservedReportMetric(item.cognitive)}</span>
                    <span role="cell">${formatObservedReportMetric(item.reaction)}</span>
                    <span role="cell">${formatObservedReportMetric(item.accuracy, '%')}</span>
                    <span role="cell">${formatObservedReportMetric(item.speed)}</span>
                    <span role="cell">${formatObservedReportMetric(item.difficulty)}</span>
                    <span role="cell">${formatObservedReportMetric(item.consistency)}</span>
                    <span role="cell">${item.count}회</span>
                </div>
            `).join('')}
        </div>
    `;
}

function setPlaylabTrendPeriod(chartKey, period) {
    const stateMap = window.__playlabTrendViews || {};
    const viewState = stateMap[chartKey];
    if (!viewState) return;
    viewState.period = period;
    const series = Array.isArray(viewState.seriesMap?.[period]) ? viewState.seriesMap[period] : [];
    viewState.offset = Math.max(0, series.length - getPlaylabTrendWindowSize(period));
    updatePlaylabTrendView(chartKey);
}

function shiftPlaylabTrendWindow(chartKey, direction) {
    const stateMap = window.__playlabTrendViews || {};
    const viewState = stateMap[chartKey];
    if (!viewState) return;
    const period = viewState.period || 'month';
    const series = Array.isArray(viewState.seriesMap?.[period]) ? viewState.seriesMap[period] : [];
    const windowSize = getPlaylabTrendWindowSize(period);
    const maxOffset = Math.max(0, series.length - windowSize);
    viewState.offset = Math.max(0, Math.min(maxOffset, Number(viewState.offset || 0) + Number(direction || 0)));
    updatePlaylabTrendView(chartKey);
}

function buildDetailDualTrendSeries(entries = [], period = 'week', options = {}) {
    const primaryKey = String(options.primaryKey || 'score').trim() || 'score';
    const secondaryKey = String(options.secondaryKey || 'accuracy').trim() || 'accuracy';
    const buckets = new Map();
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
        if (!entry?.playedAt) return;
        let key = '';
        let sortValue = 0;
        let label = '';
        if (period === 'week') {
            const weekStart = getWeekStartDate(entry.playedAt);
            key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
            sortValue = weekStart.getTime();
            label = `${String(weekStart.getMonth() + 1).padStart(2, '0')}.${String(weekStart.getDate()).padStart(2, '0')}`;
        } else if (period === 'month') {
            key = `${entry.playedAt.getFullYear()}-${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}`;
            sortValue = new Date(entry.playedAt.getFullYear(), entry.playedAt.getMonth(), 1).getTime();
            label = `${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}월`;
        } else {
            key = String(entry.playedAt.getFullYear());
            sortValue = new Date(entry.playedAt.getFullYear(), 0, 1).getTime();
            label = `${entry.playedAt.getFullYear()}년`;
        }
        if (!buckets.has(key)) {
            buckets.set(key, {
                key,
                sortValue,
                label,
                entries: []
            });
        }
        buckets.get(key).entries.push(entry);
    });

    return [...buckets.values()]
        .sort((left, right) => left.sortValue - right.sortValue)
        .map((bucket) => {
            const count = bucket.entries.length;
            const primary = getObservedReportAverage(bucket.entries.map((entry) => entry[primaryKey]), 2);
            const secondary = getObservedReportAverage(bucket.entries.map((entry) => entry[secondaryKey]), 2);
            const durationMinutes = getObservedReportAverage(bucket.entries.map((entry) => entry.durationMinutes), 6);
            return {
                key: bucket.key,
                label: bucket.label,
                count,
                primary,
                secondary,
                durationMinutes,
                durationApproximate: bucket.entries.some((entry) => entry.durationObservation?.approximate),
                metricCounts: {
                    primary: bucket.entries.filter((entry) => getObservedReportNumber(entry[primaryKey]) !== null).length,
                    secondary: bucket.entries.filter((entry) => getObservedReportNumber(entry[secondaryKey]) !== null).length,
                    durationMinutes: bucket.entries.filter((entry) => getObservedReportNumber(entry.durationMinutes) !== null).length
                }
            };
        });
}

function renderDetailDualTrendChartShell(chartKey, config = {}) {
    const title = String(config.title || '학습 변화 그래프').trim() || '학습 변화 그래프';
    return `
        <div class="detail-playlab-chart-card detail-playlab-chart-card-unified">
            <div class="detail-playlab-chart-head">
                <div>
                    <p class="detail-playlab-section-kicker">TREND</p>
                    <h4 id="${chartKey}-title" class="detail-playlab-chart-title">${escapeHtml(title)}</h4>
                </div>
                <div class="detail-playlab-chart-toolbar">
                    <div class="detail-playlab-chart-periods">
                        <button type="button" class="detail-playlab-period-btn" data-period="week" onclick="setDetailTrendPeriod('${chartKey}','week')">주간</button>
                        <button type="button" class="detail-playlab-period-btn" data-period="month" onclick="setDetailTrendPeriod('${chartKey}','month')">월간</button>
                        <button type="button" class="detail-playlab-period-btn" data-period="year" onclick="setDetailTrendPeriod('${chartKey}','year')">연간</button>
                    </div>
                    <div class="detail-playlab-chart-nav">
                        <button type="button" id="${chartKey}-prev" class="detail-playlab-nav-btn" onclick="shiftDetailTrendWindow('${chartKey}',-1)" aria-label="이전 구간">‹</button>
                        <button type="button" id="${chartKey}-next" class="detail-playlab-nav-btn" onclick="shiftDetailTrendWindow('${chartKey}',1)" aria-label="다음 구간">›</button>
                    </div>
                </div>
            </div>
            <p id="${chartKey}-desc" class="detail-playlab-chart-desc"></p>
            <div class="detail-playlab-chart-summary">
                <span id="${chartKey}-badge-primary" class="detail-playlab-chart-badge is-cognitive">${escapeHtml(config.primaryLabel || '지표 A')} 비교자료 부족</span>
                <span id="${chartKey}-badge-secondary" class="detail-playlab-chart-badge is-reaction">${escapeHtml(config.secondaryLabel || '지표 B')} 비교자료 부족</span>
                <span id="${chartKey}-range" class="detail-playlab-chart-range"></span>
            </div>
            <div id="${chartKey}-metrics" class="detail-playlab-chart-metrics"></div>
            <div id="${chartKey}-body"></div>
            <div class="detail-playlab-chart-legend">
                <span><i class="detail-playlab-dot is-cognitive"></i>${escapeHtml(config.primaryLabel || '지표 A')}</span>
                <span><i class="detail-playlab-dot is-reaction"></i>${escapeHtml(config.secondaryLabel || '지표 B')}</span>
            </div>
        </div>
    `;
}

function updateDetailTrendView(chartKey) {
    const stateMap = window.__detailTrendViews || {};
    const viewState = stateMap[chartKey];
    if (!viewState) return;

    const period = viewState.period || 'month';
    const allSeries = Array.isArray(viewState.seriesMap?.[period]) ? viewState.seriesMap[period] : [];
    const windowSize = getPlaylabTrendWindowSize(period);
    const maxOffset = Math.max(0, allSeries.length - windowSize);
    viewState.offset = Math.max(0, Math.min(maxOffset, Number(viewState.offset || 0)));
    const visibleSeries = allSeries.slice(viewState.offset, viewState.offset + windowSize);

    const titleNode = document.getElementById(`${chartKey}-title`);
    const descNode = document.getElementById(`${chartKey}-desc`);
    const badgePrimaryNode = document.getElementById(`${chartKey}-badge-primary`);
    const badgeSecondaryNode = document.getElementById(`${chartKey}-badge-secondary`);
    const rangeNode = document.getElementById(`${chartKey}-range`);
    const metricsNode = document.getElementById(`${chartKey}-metrics`);
    const bodyNode = document.getElementById(`${chartKey}-body`);
    const prevNode = document.getElementById(`${chartKey}-prev`);
    const nextNode = document.getElementById(`${chartKey}-next`);
    if (!bodyNode) return;

    if (!visibleSeries.length) {
        bodyNode.innerHTML = '<p class="detail-playlab-chart-empty">표시할 집계 데이터가 아직 충분하지 않습니다.</p>';
        return;
    }

    const width = 860;
    const height = 220;
    const padding = { top: 18, right: 28, bottom: 36, left: 24 };
    const primaryValues = visibleSeries.map((item) => item.primary);
    const secondaryValues = visibleSeries.map((item) => item.secondary);
    const primaryDelta = getObservedReportDelta(primaryValues);
    const secondaryDelta = getObservedReportDelta(secondaryValues);
    const gridLines = buildTrendGridMarkup(width, height, padding);

    if (titleNode) titleNode.textContent = String(viewState.config?.title || getPlaylabTrendTitle(period)).trim() || getPlaylabTrendTitle(period);
    if (descNode) descNode.textContent = viewState.config?.descriptions?.[period] || viewState.config?.description || getPlaylabTrendDescription(period);
    const primarySuffix = String(viewState.config?.primarySuffix || '').trim();
    const secondarySuffix = String(viewState.config?.secondarySuffix || '점').trim();
    if (badgePrimaryNode) badgePrimaryNode.textContent = `${viewState.config?.primaryLabel || '지표 A'} ${primaryDelta === null ? '비교자료 부족' : `${primaryDelta >= 0 ? '+' : ''}${primaryDelta}${primarySuffix}`}`;
    if (badgeSecondaryNode) badgeSecondaryNode.textContent = `${viewState.config?.secondaryLabel || '지표 B'} ${secondaryDelta === null ? '비교자료 부족' : `${secondaryDelta >= 0 ? '+' : ''}${secondaryDelta}${secondarySuffix}`}`;
    if (rangeNode) rangeNode.textContent = `${visibleSeries[0]?.label || '-'} - ${visibleSeries[visibleSeries.length - 1]?.label || '-'}`;
    if (prevNode) prevNode.disabled = viewState.offset <= 0;
    if (nextNode) nextNode.disabled = viewState.offset >= maxOffset;

    document.querySelectorAll(`[data-period][onclick*="${chartKey}"]`).forEach((button) => {
        button.classList.toggle('is-active', button.getAttribute('data-period') === period);
    });

    const aggregateCount = visibleSeries.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    const useSumAggregation = viewState.config?.aggregateMode === 'sum';
    const aggregatePrimary = getObservedReportSeriesAggregate(visibleSeries, 'primary', useSumAggregation);
    const aggregateSecondary = getObservedReportSeriesAggregate(visibleSeries, 'secondary', useSumAggregation);
    const aggregateDuration = getObservedReportSeriesAggregate(visibleSeries, 'durationMinutes');
    if (metricsNode) {
        const metricItems = [
            { label: '세션 수', value: `${aggregateCount}회` },
            { label: viewState.config?.primaryLabel || '지표 A', value: formatObservedReportMetric(aggregatePrimary, primarySuffix || '점') },
            { label: viewState.config?.secondaryLabel || '지표 B', value: formatObservedReportMetric(aggregateSecondary, secondarySuffix) },
            { label: useSumAggregation ? '기록된 회기 평균 시간' : '평균 소요시간', value: formatObservedReportDuration(aggregateDuration, visibleSeries.some((item) => item.durationApproximate)) }
        ];
        metricsNode.innerHTML = metricItems.map((item) => `
            <div class="detail-playlab-chart-metric">
                <span class="detail-playlab-chart-metric-label">${escapeHtml(item.label)}</span>
                <strong class="detail-playlab-chart-metric-value">${escapeHtml(item.value)}</strong>
            </div>
        `).join('');
    }

    bodyNode.innerHTML = `
        <svg class="detail-playlab-chart-svg is-unified" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(String(viewState.config?.title || '학습 변화 그래프'))}">
            ${gridLines}
            ${renderObservedTrendLines(primaryValues, '#2563eb', width, height, padding, 'detail-playlab-chart-line is-cognitive')}
            ${renderObservedTrendLines(secondaryValues, '#ea580c', width, height, padding, 'detail-playlab-chart-line is-reaction')}
            ${buildTrendPointDots(primaryValues, '#2563eb', width, height, padding, { series: visibleSeries, metricLabel: viewState.config?.primaryLabel || '지표 A', valueSuffix: primarySuffix || '점', labelOffset: -10 })}
            ${buildTrendPointDots(secondaryValues, '#ea580c', width, height, padding, { series: visibleSeries, metricLabel: viewState.config?.secondaryLabel || '지표 B', valueSuffix: viewState.config?.secondarySuffix || '점', labelOffset: 18 })}
            ${buildTrendAxisLabels(visibleSeries, width, height, padding)}
        </svg>
    `;
}

function setDetailTrendPeriod(chartKey, period) {
    const stateMap = window.__detailTrendViews || {};
    const viewState = stateMap[chartKey];
    if (!viewState) return;
    viewState.period = period;
    const series = Array.isArray(viewState.seriesMap?.[period]) ? viewState.seriesMap[period] : [];
    viewState.offset = Math.max(0, series.length - getPlaylabTrendWindowSize(period));
    updateDetailTrendView(chartKey);
}

function shiftDetailTrendWindow(chartKey, direction) {
    const stateMap = window.__detailTrendViews || {};
    const viewState = stateMap[chartKey];
    if (!viewState) return;
    const period = viewState.period || 'month';
    const series = Array.isArray(viewState.seriesMap?.[period]) ? viewState.seriesMap[period] : [];
    const windowSize = getPlaylabTrendWindowSize(period);
    const maxOffset = Math.max(0, series.length - windowSize);
    viewState.offset = Math.max(0, Math.min(maxOffset, Number(viewState.offset || 0) + Number(direction || 0)));
    updateDetailTrendView(chartKey);
}

function mountDetailTrendChart(chartKey, seriesMap = {}, config = {}) {
    window.__detailTrendViews = window.__detailTrendViews || {};
    const initialPeriod = Array.isArray(seriesMap.month) && seriesMap.month.length
        ? 'month'
        : Array.isArray(seriesMap.week) && seriesMap.week.length
            ? 'week'
            : 'year';
    const initialSeries = Array.isArray(seriesMap[initialPeriod]) ? seriesMap[initialPeriod] : [];
    window.__detailTrendViews[chartKey] = {
        period: initialPeriod,
        offset: Math.max(0, initialSeries.length - getPlaylabTrendWindowSize(initialPeriod)),
        seriesMap,
        config
    };
    updateDetailTrendView(chartKey);
}

function buildPlaylabSessionClinicalNote(entry) {
    if (!entry) return '';
    const title = entry.title || '플레이랩 과제';
    const stored = parsePlaylabStoredReportInput(entry);
    const accuracy = readObservedReportNumber([stored?.input, entry], ['accuracyRate', 'accuracy']);
    return `${title} 활동의 저장 기록입니다. 과제 점수 ${formatObservedReportMetric(entry.score, '점')}, 정확도 ${formatObservedReportMetric(accuracy, '%')}입니다. 미기록 값은 추정하지 않으며, 이 기록만으로 인지 기능이나 반응 조절 수준을 판단하지 않습니다.`;
}

function getPlaylabHistoryReportType(entry) {
    const explicitType = String(
        entry?.row?.details?.report_type ||
        entry?.row?.details?.reportType ||
        entry?.row?.metadata?.report_type ||
        entry?.row?.metadata?.reportType ||
        ''
    ).trim();
    if (explicitType) return explicitType;
    const combined = `${entry?.title || ''} ${entry?.subtitle || ''}`.trim();
    if (/다른 아이콘/.test(combined)) return 'standalone-icon-odd-find';
    if (/아이콘 찾기/.test(combined)) return 'standalone-icon-find';
    if (/시간|오전|오후|저녁|오늘|어제|내일|이번달|지난달|다음달|올해|작년|내년/.test(combined)) return 'time-dayparts-quiz';
    if (/기억|메모리/.test(combined)) return 'standalone-color-memory';
    if (/도어락|비밀번호|문열기|문 열기/.test(combined)) return 'standalone-doorlock';
    if (/도형|조각|추리/.test(combined)) return 'standalone-shape';
    return 'standalone-color-trace';
}

function getPlaylabAccentColorByType(reportType) {
    if (reportType === 'time-dayparts-quiz') return '#f59e0b';
    if (reportType === 'time-dayparts-sequence') return '#8b5cf6';
    if (reportType === 'time-dayparts-relative') return '#22c55e';
    if (reportType === 'standalone-shape') return '#7c3aed';
    if (reportType === 'rehablab-shape-match-gonogo') return '#0f766e';
    if (reportType === 'standalone-icon-find' || reportType === 'standalone-icon-odd-find') return '#c2410c';
    if (reportType === 'standalone-color-memory') return '#0f766e';
    if (reportType === 'standalone-doorlock') return '#0f766e';
    return '#0369a1';
}

function extractPlaylabNumericValue(text, fallback = 0) {
    const match = String(text || '').match(/(\d+)/);
    return match ? Number(match[1]) : fallback;
}

function parsePlaylabStoredReportInput(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    for (const [sourcePath, candidate] of [
        ['details.report_input', details.report_input], ['details.reportInput', details.reportInput],
        ['metadata.report_input', metadata.report_input], ['metadata.reportInput', metadata.reportInput]
    ]) {
        const input = parseMaybeJson(candidate, null);
        if (input && typeof input === 'object' && !Array.isArray(input) && Object.keys(input).length) return { input: JSON.parse(JSON.stringify(input)), sourcePath };
    }
    return null;
}

function getPlaylabObservedMetric(entry, keys) {
    const { details, metadata } = getRehabReportSource(entry);
    const stored = parsePlaylabStoredReportInput(entry)?.input || {};
    for (const source of [details, metadata, stored]) for (const key of keys) {
        const value = source[key];
        if ((typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) && Number(value) >= 0) return Number(value);
    }
    return null;
}

function buildPlaylabHistoryReportInput(entry) {
    const { details, metadata } = getRehabReportSource(entry);
    const ageMeta = buildDetailClientReportAgeMeta();
    const levelLabel = String(
        details.level_label ||
        details.levelLabel ||
        details.level_title ||
        details.levelTitle ||
        metadata.level_label ||
        metadata.levelLabel ||
        ''
    ).trim();
    const levelId = String(details.level_id || details.levelId || metadata.level_id || metadata.levelId || '').trim();
    const stageId = String(details.stage_id || details.stageId || metadata.stage_id || metadata.stageId || '').trim();
    const stored = parsePlaylabStoredReportInput(entry);
    const storedReportInput = stored?.input || null;
    const storedProfileId = String(
        details.report_profile_id ||
        details.reportProfileId ||
        details.report_profile ||
        details.reportProfile ||
        metadata.report_profile_id ||
        metadata.reportProfileId ||
        metadata.report_profile ||
        metadata.reportProfile ||
        ''
    ).trim();
    const storedProfileLabel = String(
        details.report_profile_label ||
        details.reportProfileLabel ||
        metadata.report_profile_label ||
        metadata.reportProfileLabel ||
        ''
    ).trim();
    if (storedReportInput && typeof storedReportInput === 'object') {
        return {
            ...storedReportInput,
            originalReportInput: JSON.parse(JSON.stringify(storedReportInput.originalReportInput || storedReportInput)),
            reportDataQuality: { ...(storedReportInput.reportDataQuality || {}), source: 'stored-input', sourcePath: stored.sourcePath },
            reportScope: storedReportInput.reportScope || inferLabReportScopeFromHistoryRow(entry?.row || {}),
            normProfile: storedReportInput.normProfile || ageMeta.normProfile,
            clientAge: storedReportInput.clientAge ?? ageMeta.clientAge,
            clientAgeLabel: storedReportInput.clientAgeLabel || ageMeta.clientAgeLabel,
            ageRangeLabel: storedReportInput.ageRangeLabel || ageMeta.ageRangeLabel,
            ageGroupLabel: storedReportInput.ageGroupLabel || ageMeta.ageGroupLabel,
            levelId: storedReportInput.levelId || levelId || undefined,
            stageId: storedReportInput.stageId || stageId || undefined,
            levelLabel: storedReportInput.levelLabel || levelLabel || undefined,
            reportProfileId: storedReportInput.reportProfileId || storedReportInput.reportProfile || storedProfileId || undefined,
            reportProfileLabel: storedReportInput.reportProfileLabel || storedProfileLabel || undefined,
            accentColor: storedReportInput.accentColor || getPlaylabAccentColorByType(String(storedReportInput.reportType || '').trim())
        };
    }
    const reportType = getPlaylabHistoryReportType(entry);
    function observed(keys) {
        for (const source of [details, metadata]) for (const key of keys) {
            const value = source[key];
            if ((typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) && Number(value) >= 0) return Number(value);
        }
        return null;
    }
    const totalItems = observed(['total_questions', 'totalQuestions', 'total_items', 'totalItems']);
    const correctCount = observed(['correct_count', 'correctCount']);
    const wrongCount = observed(['wrong_count', 'wrongCount']);
    const seconds = observed(['duration_seconds', 'durationSeconds']);
    const minutes = observed(['duration_minutes', 'durationMinutes']);
    const elapsedMs = observed(['elapsed_ms', 'elapsedMs']) ?? (seconds !== null ? seconds * 1000 : minutes !== null ? minutes * 60000 : null);
    const averageQuestionMs = observed(['avg_question_ms', 'avgQuestionMs', 'avg_reaction_ms', 'avgReactionMs']);
    const rowsColsMatch = String(entry.title || '').match(/(\d+)x(\d+)/i);
    const rows = rowsColsMatch ? Number(rowsColsMatch[1]) : 0;
    const cols = rowsColsMatch ? Number(rowsColsMatch[2]) : 0;

    return {
        reportType,
        reportEvidenceMode: 'observed-only',
        reportDataQuality: { source: 'history-aggregate' },
        originalReportInput: { details: JSON.parse(JSON.stringify(details)), metadata: JSON.parse(JSON.stringify(metadata)) },
        title: entry.subtitle || '플레이랩',
        stageTitle: entry.title || '플레이랩 학습',
        totalItems,
        totalQuestions: totalItems,
        correctCount,
        completionCount: observed(['completion_count', 'completionCount']),
        wrongCount,
        perfectCount: observed(['perfect_count', 'perfectCount']),
        firstTryRate: observed(['first_try_rate', 'firstTryRate']),
        accuracyRate: observed(['accuracy_rate', 'accuracyRate', 'accuracy']),
        elapsedMs,
        avgQuestionMs: averageQuestionMs,
        questionLogs: [],
        startedAtMs: observed(['started_at_ms', 'startedAtMs']),
        rows,
        cols,
        targetCount: reportType.indexOf('icon') > -1 ? extractPlaylabNumericValue(entry.title, 1) : 0,
        oddCount: reportType === 'standalone-icon-odd-find' ? 1 : 0,
        distractorKinds: reportType.indexOf('icon') > -1 ? Math.max(1, Math.min(6, extractPlaylabNumericValue(entry.title, 3))) : 0,
        connectionCount: observed(['connection_count', 'connectionCount']),
        optionCount: observed(['option_count', 'optionCount']),
        reportScope: inferLabReportScopeFromHistoryRow(entry?.row || {}),
        normProfile: ageMeta.normProfile,
        clientAge: ageMeta.clientAge,
        clientAgeLabel: ageMeta.clientAgeLabel,
        ageRangeLabel: ageMeta.ageRangeLabel,
        ageGroupLabel: ageMeta.ageGroupLabel,
        levelId: levelId || undefined,
        stageId: stageId || undefined,
        levelLabel: levelLabel || undefined,
        reportProfileId: storedProfileId || undefined,
        reportProfileLabel: storedProfileLabel || undefined,
        accentColor: getPlaylabAccentColorByType(reportType)
    };
}

function buildPlaylabHistoryReport(entry) {
    if (!entry || !window.PlaylabReportEngine || typeof window.PlaylabReportEngine.buildReport !== 'function') return null;
    const report = window.PlaylabReportEngine.buildReport({ ...buildPlaylabHistoryReportInput(entry), reportEvidenceMode: 'observed-only' });
    if (!report) return null;
    // Summary text cannot restore inferred clinical claims when source metrics are missing.
    if (report.isObservedOnly) return report;

    const normalizedRow = normalizeLabHistoryRow(entry.row || {});
    const details = normalizedRow.details || {};
    const metadata = normalizedRow.metadata || {};
    const overview = getLabHistoryOverview(normalizedRow);
    const explicitBrief = String(
        details.report_brief_opinion ||
        details.reportBriefOpinion ||
        details.brief_opinion ||
        details.briefOpinion ||
        metadata.report_brief_opinion ||
        metadata.reportBriefOpinion ||
        ''
    ).trim();
    const guardianSummary = String(
        details.report_guardian_summary ||
        details.reportGuardianSummary ||
        metadata.report_guardian_summary ||
        metadata.reportGuardianSummary ||
        ''
    ).trim();
    const guardianLongSummary = String(
        details.report_guardian_long_summary ||
        details.reportGuardianLongSummary ||
        metadata.report_guardian_long_summary ||
        metadata.reportGuardianLongSummary ||
        ''
    ).trim();
    const roleNotes = getLabHistoryRoleNotes(normalizedRow);
    const recommendations = normalizeReportRecommendationItems(
        details.report_recommendations ||
        details.reportRecommendations ||
        []
    );
    const evidenceBasis = getLabHistoryEvidenceBasis(normalizedRow);
    const referenceLinks = getLabHistoryReferenceLinks(normalizedRow);

    if (overview) {
        report.longOpinion = overview;
    }
    if (explicitBrief) report.briefOpinion = explicitBrief;
    if (guardianSummary) report.guardianSummary = guardianSummary;
    if (guardianLongSummary) report.guardianLongSummary = guardianLongSummary;
    if (roleNotes.length) report.roleNotes = roleNotes;
    if (recommendations.length) report.recommendations = recommendations;
    if (evidenceBasis.length) report.evidenceBasis = evidenceBasis;
    if (referenceLinks.length) report.referenceLinks = referenceLinks;

    return report;
}

function buildPlaylabReportProfileStats(entries = []) {
    const statsMap = new Map();
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
        const report = buildPlaylabHistoryReport(entry);
        const profile = report?.reportProfile || null;
        const id = String(report?.reportProfileId || profile?.id || 'general').trim() || 'general';
        const label = String(report?.reportProfileLabel || profile?.label || '기초 수행 관찰형').trim();
        if (!statsMap.has(id)) {
            statsMap.set(id, {
                id,
                label,
                family: profile?.family || '통합 수행',
                count: 0,
                scoreSum: 0,
                cognitiveSum: 0,
                reactionSum: 0,
                scoreCount: 0,
                cognitiveCount: 0,
                reactionCount: 0,
                summary: profile?.summary || ''
            });
        }
        const item = statsMap.get(id);
        item.count += 1;
        [['score', 'scoreSum', 'scoreCount'], ['cognitiveScore', 'cognitiveSum', 'cognitiveCount'], ['reactionScore', 'reactionSum', 'reactionCount']].forEach(([key, sumKey, countKey]) => {
            const value = getObservedReportNumber(entry[key]);
            if (value === null) return;
            item[sumKey] += value;
            item[countKey] += 1;
        });
    });
    return [...statsMap.values()]
        .map((item) => ({
            ...item,
            averageScore: item.scoreCount ? Math.round(item.scoreSum / item.scoreCount) : null,
            averageCognitive: item.cognitiveCount ? Math.round(item.cognitiveSum / item.cognitiveCount) : null,
            averageReaction: item.reactionCount ? Math.round(item.reactionSum / item.reactionCount) : null
        }))
        .sort((left, right) => right.count - left.count || right.averageScore - left.averageScore);
}

function getPlaylabHistoryProfileLabel(entry) {
    const report = buildPlaylabHistoryReport(entry);
    return report?.reportProfileLabel || report?.reportProfile?.label || '';
}

function formatPlaylabOpinionText(text) {
    if (window.PlaylabReportEngine && typeof window.PlaylabReportEngine.formatRichText === 'function') {
        return window.PlaylabReportEngine.formatRichText(text);
    }
    return escapeHtml(text || '');
}

function persistPlaylabHistoryReportPayload(entry) {
    const owner = window.getAuthenticatedReportOwner?.();
    if (!owner) return '';
    const scope = inferLabReportScopeFromHistoryRow(entry?.row || {});
    const isRehab = scope === LAB_REPORT_SCOPE_REHAB;
    const { details, metadata } = getRehabReportSource(entry);
    const storedReportInput = parsePlaylabStoredReportInput(entry);
    const hasStoredReportInput = Boolean(storedReportInput);
    const canReconstructLegacyReport = isRehab && !hasStoredReportInput && canOpenRehabIndividualReport(entry);
    const builtReport = isRehab && !hasStoredReportInput && !canReconstructLegacyReport
        ? null
        : buildPlaylabHistoryReport(entry);
    const report = isRehab && !hasStoredReportInput && !canReconstructLegacyReport ? null : builtReport;
    const observedCounts = getRehabAccuracyCount(entry);
    const observedMinutes = getPlaylabObservedMetric(entry, ['duration_minutes', 'durationMinutes']);
    const observedSeconds = getPlaylabObservedMetric(entry, ['duration_seconds', 'durationSeconds']);
    const observedElapsed = getPlaylabObservedMetric(entry, ['elapsed_ms', 'elapsedMs']);
    const rawRecord = isRehab ? {
        scope,
        reconstructionType: hasStoredReportInput ? 'stored-input-reconstruction' : (canReconstructLegacyReport ? 'legacy-summary-reconstruction' : 'raw-summary'),
        title: entry.title || '재활랩 활동',
        subtitle: entry.subtitle || '재활랩',
        playedAt: entry.playedAt?.toISOString?.() || '',
        sessionId: String(entry?.row?.details?.session_id || entry?.row?.details?.sessionId || entry?.row?.metadata?.session_id || entry?.row?.metadata?.sessionId || entry.id || ''),
        accuracyLabel: observedCounts.label,
        correctCount: observedCounts.correct,
        wrongCount: observedCounts.wrong,
        totalQuestions: observedCounts.total,
        durationMinutes: observedMinutes ?? (observedSeconds !== null ? observedSeconds / 60 : observedElapsed !== null ? observedElapsed / 60000 : null),
        reactionLabel: getRehabReactionTimeSummary(entry).label,
        responseCondition: getRehabResponseCondition(entry),
        errorDetail: getRehabErrorDetail(entry),
        domains: getRehabDomainLabels(entry),
        reportEngineVersion: String(entry?.row?.details?.report_engine_version || entry?.row?.details?.reportEngineVersion || entry?.row?.metadata?.report_engine_version || entry?.row?.metadata?.reportEngineVersion || '')
    } : null;
    if (!report && !rawRecord) return '';
    const key = `playlab_history_report_${crypto.randomUUID()}`;
    const payload = {
        owner,
        shareContext: {
            clientId: String(entry?.row?.client_id || entry?.row?.clientId || (typeof currentDetailClientId !== 'undefined' ? currentDetailClientId : '') || '').trim(),
            historyId: String(entry?.row?.id || entry.id || '').trim()
        },
        entry: {
            id: entry.id,
            title: entry.title,
            subtitle: entry.subtitle,
            playedAt: entry.playedAt?.toISOString?.() || '',
            score: entry.score,
            accuracy: entry.accuracy,
            durationMinutes: entry.durationMinutes,
            cognitiveScore: entry.cognitiveScore,
            reactionScore: entry.reactionScore,
            reportProfileId: report?.reportProfileId || '',
            reportProfileLabel: report?.reportProfileLabel || ''
        },
        report,
        originalReportInput: storedReportInput?.input || report?.originalReportInput || null,
        reportDataQuality: report?.reportDataQuality || { source: 'history-aggregate' },
        rawRecord
    };
    try {
        if (typeof BroadcastChannel !== 'function') return '';
        window.__hahaLabTransientReports = window.__hahaLabTransientReports || new Map();
        const channel = new BroadcastChannel(key);
        const source = JSON.parse(JSON.stringify(payload));
        const expiresAt = Date.now() + 30 * 60 * 1000;
        const record = { source, channel, expiresAt };
        window.__hahaLabTransientReports.set(key, record);
        channel.onmessage = (event) => {
            const request = event.data;
            const currentOwner = window.getAuthenticatedReportOwner?.();
            if (request?.type !== 'read-report' || !currentOwner || expiresAt <= Date.now()
                || currentOwner.authUserId !== owner.authUserId || currentOwner.sessionId !== owner.sessionId || currentOwner.teacherId !== owner.teacherId
                || request.authUserId !== owner.authUserId || request.sessionId !== owner.sessionId) return;
            channel.postMessage({ type: 'report-payload', requestId: request.requestId, source });
        };
        window.setTimeout(() => { channel.close(); window.__hahaLabTransientReports?.delete(key); }, 30 * 60 * 1000);
    } catch (_error) {
        return '';
    }
    return key;
}

async function openPlaylabLogDetailReport(historyId) {
    const entries = [
        ...buildPlaylabTimelineEntries(currentDetailData.histories || [], LAB_REPORT_SCOPE_PLAYLAB),
        ...buildPlaylabTimelineEntries(currentDetailData.histories || [], LAB_REPORT_SCOPE_MUSICARTLAB),
        ...buildPlaylabTimelineEntries(currentDetailData.histories || [], LAB_REPORT_SCOPE_REHAB)
    ];
    const targetEntry = entries.find((entry) => String(entry.id) === String(historyId));
    if (!targetEntry) {
        showBottomToast('상세 리포트로 열 수 있는 학습 기록을 찾지 못했습니다.');
        return;
    }
    const targetScope = inferLabReportScopeFromHistoryRow(targetEntry.row || {});
    const isRawOnlyRehab = targetScope === LAB_REPORT_SCOPE_REHAB && !canOpenRehabIndividualReport(targetEntry);
    if (isRawOnlyRehab) {
        const rawReportKey = persistPlaylabHistoryReportPayload(targetEntry);
        if (!rawReportKey) {
            showBottomToast('수행 원기록을 준비하지 못했습니다.');
            return;
        }
        window.open(`./playlab-history-report-viewer.html?reportKey=${encodeURIComponent(rawReportKey)}`, '_blank', 'noopener');
        return;
    }
    const pendingWindow = window.open('about:blank', '_blank');
    if (!pendingWindow) {
        showBottomToast('새 창이 차단되었습니다. 브라우저의 팝업 허용 후 다시 시도해 주세요.');
        return;
    }
    try {
        pendingWindow.opener = null;
        pendingWindow.document.title = '상세 리포트 준비 중';
        pendingWindow.document.body.textContent = '상세 리포트를 준비하고 있습니다.';
    } catch (_error) {}
    if (!window.PlaylabReportEngine) {
        showBottomToast('상세 리포트를 준비하는 중입니다.');
        try {
            await ensurePlaylabReportEngineLoaded();
        } catch (_error) {
            try { pendingWindow.close(); } catch (_closeError) {}
            showBottomToast('상세 리포트를 불러오지 못했습니다.');
            return;
        }
    }
    const reportKey = persistPlaylabHistoryReportPayload(targetEntry);
    if (!reportKey) {
        try { pendingWindow.close(); } catch (_closeError) {}
        showBottomToast('상세 리포트 데이터를 준비하지 못했습니다.');
        return;
    }
    try {
        pendingWindow.location.replace(`./playlab-history-report-viewer.html?reportKey=${encodeURIComponent(reportKey)}`);
    } catch (_error) {
        pendingWindow.location.href = `./playlab-history-report-viewer.html?reportKey=${encodeURIComponent(reportKey)}`;
    }
}

function buildPlaylabLearningRecommendation(entries = [], context = {}) {
    const opinion = buildStoredReportOpinion(entries, '랩 활동');
    return {
        title: '다음 관찰·수업 조정 후보', summary: opinion.guidance,
        items: ['과제 버전·난이도·기기·입력 방식·도움 조건을 확인합니다.', '잘못된 선택, 무반응, 시간 초과를 기록된 범위에서 구분합니다.', '선생님이 한 번에 한 조건을 조정할지 검토하고 변경 이유를 남깁니다.']
    };
}

function buildGuardianIntegratedObservation(entries = [], scopeLabel = '학습') {
    const safeEntries = Array.isArray(entries) ? entries : [];
    const latestEntry = safeEntries.slice().sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime())[0] || null;
    const previousEntry = safeEntries.slice().sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime())[1] || null;
    const latestTitle = latestEntry ? (latestEntry.title || latestEntry.subtitle || scopeLabel) : scopeLabel;
    const focusLabels = [...new Set(safeEntries.map((entry) => entry.focusLabel).filter(Boolean))].slice(0, 2);
    const trendNarrative = buildGuardianTrendNarrative({
        scopeLabel,
        latestTitle,
        latestScore: latestEntry?.score ?? null,
        latestAccuracy: latestEntry?.accuracy ?? null,
        previousScore: previousEntry?.score ?? null,
        previousAccuracy: previousEntry?.accuracy ?? null,
        recordCount: safeEntries.length,
        records: safeEntries
    });
    const overview = latestEntry ? trendNarrative.overview : `${scopeLabel} 활동 기록을 보호자가 이해하기 쉬운 관찰 요약으로 정리합니다.`;
    const synthesis = focusLabels.length
        ? `${trendNarrative.synthesis}\n현재 누적 기록에서는 ${focusLabels.join(', ')} 관련 활동 흐름이 함께 보입니다. 세부 점수와 오류 유형은 전문가 분석 화면에서 담당 선생님이 확인합니다.`
        : trendNarrative.synthesis;
    const guidance = trendNarrative.guidance;
    return {
        overview,
        synthesis,
        guidance,
        learningRecommendation: {
            summary: guidance,
            items: [
                '다음 활동 전 컨디션과 피로도를 함께 확인합니다.',
                '가정에서는 정답 여부보다 시작-시도-마무리 흐름을 부담 없이 관찰합니다.',
                '이전 기록과 달라진 점은 담당 선생님이 상담 시 쉽게 풀어 설명합니다.'
            ]
        },
        tags: [trendNarrative.statusLabel, '선생님 검토'],
        statusLabel: trendNarrative.statusLabel,
        nextLabel: trendNarrative.nextLabel
    };
}

function buildPlaylabIntegratedOpinion(entries = []) {
    const safeEntries = Array.isArray(entries) ? entries : [];
    if (!safeEntries.length) return { overview: '', synthesis: '', guidance: '', strongestFocus: null, weakestFocus: null };
    const opinion = buildStoredReportOpinion(safeEntries, '플레이랩');
    const detailedReports = safeEntries.slice().sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime()).slice(0, 3).map(buildPlaylabHistoryReport).filter(Boolean);
    const notes = [...new Set(detailedReports.map((report) => report.teacherReviewNote || report.briefOpinion).filter(Boolean))];
    const profileStats = buildPlaylabReportProfileStats(safeEntries);
    return {
        overview: opinion.overview,
        synthesis: [opinion.synthesis, ...notes].join('\n'),
        guidance: opinion.guidance,
        learningRecommendation: buildPlaylabLearningRecommendation(safeEntries),
        strongestFocus: null, weakestFocus: null, profileStats,
        dominantProfile: profileStats[0] || null
    };
}

function renderPlaylabProfileDistribution(profileStats = [], totalCount = 0) {
    if (!Array.isArray(profileStats) || !profileStats.length) return '';
    const topProfiles = profileStats.slice(0, 6);
    return `
        <div class="detail-playlab-opinion-card detail-playlab-profile-card">
            <div class="detail-playlab-opinion-head">
                <div>
                    <p class="detail-playlab-section-kicker">REPORT PROFILE</p>
                    <h3 class="detail-playlab-opinion-title">저장 과제 유형 분포</h3>
                </div>
                <p class="detail-playlab-log-desc">전체 소견을 뒷받침하는 보조 분류입니다. 회기별 주 수행 특성을 누적해 상담 근거로 사용합니다.</p>
            </div>
            <div class="detail-playlab-profile-grid">
                ${topProfiles.map((profile) => {
                    const ratio = totalCount > 0 ? Math.round((profile.count / totalCount) * 100) : 0;
                    return `
                        <div class="detail-playlab-profile-item">
                            <div class="detail-playlab-profile-top">
                                <strong>${escapeHtml(profile.label)}</strong>
                                <span>${profile.count}회</span>
                            </div>
                            <p>${escapeHtml(profile.family || '통합 수행')}</p>
                            <div class="detail-playlab-profile-meter" aria-hidden="true">
                                <i style="width:${Math.max(4, Math.min(100, ratio))}%"></i>
                            </div>
                            <small>비중 ${ratio}% · 평균 ${formatObservedReportMetric(profile.averageScore, '점')}</small>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderRehabObservationBenchmarkBlock(entries = []) {
    if (!window.PlaylabReportEngine || typeof window.PlaylabReportEngine.buildReport !== 'function') return '';
    const reportItems = entries
        .map((entry) => ({
            entry,
            report: buildPlaylabHistoryReport(entry)
        }))
        .filter((item) => item.report?.observationBenchmark?.available);
    if (!reportItems.length) return '';
    const latest = reportItems[0];
    const benchmark = latest.report.observationBenchmark;
    const recent = reportItems.slice(0, 3);
    const decisionCounts = recent.reduce((acc, item) => {
        const decision = item.report.observationBenchmark.decision || 'maintain';
        acc[decision] = (acc[decision] || 0) + 1;
        return acc;
    }, {});
    const dominantDecision = ['down', 'maintain', 'up']
        .sort((left, right) => (decisionCounts[right] || 0) - (decisionCounts[left] || 0))[0];
    const decisionLabel = dominantDecision === 'up'
        ? '최근 수행 상향 검토'
        : dominantDecision === 'down'
            ? '최근 수행 지원 강화'
            : '최근 수행 유지 관찰';
    const statItems = [
        { label: '현재 평균 반응', value: benchmark.avgQuestionLabel },
        { label: '연령·레벨 기준', value: benchmark.benchmarkLabel },
        { label: '기준 대비', value: `${benchmark.ratioPercent}% · ${benchmark.timeBand}` },
        { label: '권고', value: benchmark.decisionLabel }
    ];
    return `
        <div class="detail-playlab-opinion-card detail-rehab-benchmark-card">
            <div class="detail-playlab-opinion-head">
                <div>
                    <p class="detail-playlab-section-kicker">PROFESSIONAL OBSERVATION</p>
                    <h3 class="detail-playlab-opinion-title">연령·레벨별 수행 시간 관찰</h3>
                </div>
                <div class="detail-playlab-opinion-tags">
                    <span class="detail-playlab-opinion-tag is-profile">${escapeHtml(benchmark.normProfileLabel || '연령 기준')}</span>
                    <span class="detail-playlab-opinion-tag is-strong">${escapeHtml(benchmark.levelLabel || '레벨 기준')}</span>
                    <span class="detail-playlab-opinion-tag is-weak">${escapeHtml(decisionLabel)}</span>
                </div>
            </div>
            <div class="detail-rehab-benchmark-grid">
                ${statItems.map((item) => `
                    <div class="detail-rehab-benchmark-stat">
                        <span>${escapeHtml(item.label)}</span>
                        <strong>${escapeHtml(item.value)}</strong>
                    </div>
                `).join('')}
            </div>
            <div class="detail-playlab-opinion-body detail-rehab-benchmark-body">
                <div class="detail-playlab-opinion-block">
                    <p class="detail-playlab-opinion-label">전문 관찰 해석</p>
                    <div class="detail-playlab-opinion-text">${formatPlaylabOpinionText(benchmark.summary)}</div>
                </div>
                <div class="detail-rehab-benchmark-columns">
                    <div class="detail-playlab-opinion-block">
                        <p class="detail-playlab-opinion-label">판단 근거</p>
                        <ul class="detail-playlab-recommendation-list detail-rehab-benchmark-list">
                            ${(benchmark.reasons || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="detail-playlab-opinion-block">
                        <p class="detail-playlab-opinion-label">다음 회기 조정</p>
                        <ul class="detail-playlab-recommendation-list detail-rehab-benchmark-list">
                            ${(benchmark.nextActions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <p class="detail-rehab-benchmark-disclaimer">${escapeHtml(benchmark.disclaimer || '회기 수행 관찰 기준입니다.')}</p>
            </div>
        </div>
    `;
}

function renderPlaylabClinicalReferenceBlock(entries = []) {
    const rehabEntries = entries.filter((entry) => inferLabReportScopeFromHistoryRow(entry?.row || {}) === LAB_REPORT_SCOPE_REHAB);
    if (rehabEntries.length) {
        const evidenceItems = rehabEntries
            .flatMap((entry) => getLabHistoryEvidenceBasis(entry.row))
            .filter((item, index, source) => source.indexOf(item) === index)
            .slice(0, 5);
        const referenceLinks = rehabEntries
            .flatMap((entry) => getLabHistoryReferenceLinks(entry.row))
            .filter((item, index, source) => source.findIndex((candidate) => candidate.url === item.url) === index)
            .slice(0, 5);
        const basisText = evidenceItems.length
            ? evidenceItems.join('\n')
            : '재활랩 리포트는 회기 내 정확도, 평균 반응시간, 오류 부담, 과제 완수율을 함께 해석합니다.\n억제조절, 작업기억, 시지각, 언어 인출 과제는 단독 진단 지표가 아니라 훈련 중 기능적 수행 관찰 자료로 사용합니다.\n연령 기준과 난이도 단계는 표준화 검사 점수가 아니라 같은 시스템 안에서 회기 변화를 비교하기 위한 상대 기준입니다.';
        return `
            <div class="detail-playlab-opinion-card detail-playlab-evidence-card">
                <div class="detail-playlab-opinion-head">
                    <div>
                        <p class="detail-playlab-section-kicker">CLINICAL REFERENCE</p>
                        <h3 class="detail-playlab-opinion-title">재활랩 임상 해석 기준</h3>
                    </div>
                    <div class="detail-playlab-opinion-tags">
                        <span class="detail-playlab-opinion-tag is-strong">정확도-반응시간</span>
                        <span class="detail-playlab-opinion-tag is-strong">오류 양상</span>
                        <span class="detail-playlab-opinion-tag is-weak">연령·난이도 상대 기준</span>
                    </div>
                </div>
                <div class="detail-playlab-opinion-body">
                    <div class="detail-playlab-opinion-block">
                        <p class="detail-playlab-opinion-label">근거 관점</p>
                        <div class="detail-playlab-opinion-text">${formatPlaylabOpinionText(basisText)}</div>
                    </div>
                    <div class="detail-playlab-opinion-block">
                        <p class="detail-playlab-opinion-label">주의 문구</p>
                        <div class="detail-playlab-opinion-text">${formatPlaylabOpinionText('이 리포트는 병원·센터 상담에서 사용할 수 있는 회기 기반 참고 자료입니다.\n표준화 신경심리검사, 작업치료·언어치료 평가, 의학적 진단이나 치료 판정을 대체하지 않으며 담당 전문가의 직접 관찰과 병력 정보를 함께 고려해야 합니다.')}</div>
                    </div>
                    ${referenceLinks.length ? `
                        <div class="detail-playlab-opinion-block">
                            <p class="detail-playlab-opinion-label">참고 기준</p>
                            <ul class="detail-playlab-recommendation-list">
                                ${referenceLinks.map((item) => `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a></li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    const hasSpotlight = entries.some((entry) => {
        const details = parseMaybeJson(entry?.row?.details, {});
        const sourcePage = String(details.source_page || details.sourcePage || '').trim();
        const reportType = String(details.report_type || details.reportType || '').trim();
        return sourcePage === 'playlab-card-spotlight.html' || sourcePage === 'rehablab-card-spotlight.html' || reportType === 'review-name';
    });
    if (!hasSpotlight) return '';
    return `
        <div class="detail-playlab-opinion-card detail-playlab-evidence-card">
            <div class="detail-playlab-opinion-head">
                <div>
                    <p class="detail-playlab-section-kicker">CLINICAL REFERENCE</p>
                    <h3 class="detail-playlab-opinion-title">카드 스포트라이트 해석 근거</h3>
                </div>
                <div class="detail-playlab-opinion-tags">
                    <span class="detail-playlab-opinion-tag is-strong">시지각 폐쇄</span>
                    <span class="detail-playlab-opinion-tag is-strong">명칭 회상</span>
                    <span class="detail-playlab-opinion-tag is-weak">반응시간-정확도</span>
                </div>
            </div>
            <div class="detail-playlab-opinion-body">
                <div class="detail-playlab-opinion-block">
                    <p class="detail-playlab-opinion-label">근거 관점</p>
                    <div class="detail-playlab-opinion-text">${formatPlaylabOpinionText('ASHA Practice Portal의 아동 언어 중재 관점처럼 어휘, 의미 단서, 설명하기, 자기점검을 함께 보며, 실행기능 문헌에서는 주의 유지와 처리속도를 단일 점수보다 정확도와 함께 해석합니다.\n소아 기능시각 평가 문헌에서는 시각 정보가 발달 및 일상 수행에 영향을 줄 수 있어, 부분 단서를 전체 형태로 통합하는 양상을 관찰 지표로 봅니다.')}</div>
                </div>
                <div class="detail-playlab-opinion-block">
                    <p class="detail-playlab-opinion-label">주의 문구</p>
                    <div class="detail-playlab-opinion-text">${formatPlaylabOpinionText('이 리포트는 병원 진단이나 표준화 검사 결과가 아니라 회기 기반 학습 관찰 자료입니다.\n상담 시에는 정답률, 평균 추론 시간, 후반부 피로도, 오답 이후 전략 변화와 함께 설명하는 보조 자료로 활용합니다.')}</div>
                </div>
            </div>
        </div>
    `;
}

function getRehabReportSource(entry = {}) {
    const normalized = normalizeLabHistoryRow(entry.row || {});
    return {
        details: normalized.details || {},
        metadata: normalized.metadata || {}
    };
}

function getRehabResponseCondition(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    const candidates = [
        details.report_response_condition,
        details.reportResponseCondition,
        details.response_condition,
        details.responseCondition,
        details.condition_label,
        details.conditionLabel,
        details.level_label,
        details.levelLabel,
        details.support_level,
        details.supportLevel,
        details.cue_level,
        details.cueLevel,
        metadata.report_response_condition,
        metadata.reportResponseCondition,
        metadata.response_condition,
        metadata.responseCondition,
        metadata.condition_label,
        metadata.conditionLabel,
        metadata.level_label,
        metadata.levelLabel,
        metadata.support_level,
        metadata.supportLevel,
        metadata.cue_level,
        metadata.cueLevel
    ];
    const values = candidates
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .map((value) => String(value || '').trim())
        .filter(Boolean);
    return [...new Set(values)].slice(0, 3).join(' · ') || String(entry.subtitle || '').trim() || '반응 조건 미기록';
}

function getRehabErrorDetail(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    const explicit = [
        details.report_error_types,
        details.reportErrorTypes,
        details.error_types,
        details.errorTypes,
        details.error_summary,
        details.errorSummary,
        details.wrong_items,
        details.wrongItems,
        metadata.report_error_types,
        metadata.reportErrorTypes,
        metadata.error_types,
        metadata.errorTypes,
        metadata.error_summary,
        metadata.errorSummary
    ]
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .map((value) => {
            if (value && typeof value === 'object') {
                return String(value.label || value.title || value.name || value.text || '').trim();
            }
            return String(value || '').trim();
        })
        .filter(Boolean);
    if (explicit.length) return [...new Set(explicit)].slice(0, 4).join(', ');
    if (entry.wrongCount > 0) return `${entry.wrongCount}건 · 세부 유형 미기록`;
    if (getPlaylabObservedMetric(entry, ['wrong_count', 'wrongCount']) === 0) return '기록된 오반응 0건';
    return '오류 원자료 미기록';
}

function getRehabAccuracyCount(entry = {}) {
    const correct = getPlaylabObservedMetric(entry, ['correct_count', 'correctCount']);
    const wrong = getPlaylabObservedMetric(entry, ['wrong_count', 'wrongCount']);
    const observedTotal = getPlaylabObservedMetric(entry, ['total_questions', 'totalQuestions', 'total_items', 'totalItems']);
    const total = observedTotal ?? (correct !== null && wrong !== null ? correct + wrong : null);
    return {
        correct,
        wrong,
        total,
        percentage: total > 0 && correct !== null ? Math.round((correct / total) * 100) : null,
        label: total !== null && correct !== null ? `${correct}/${total}` : '원자료 미기록'
    };
}

function getRehabSameConditionKey(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    const read = (...keys) => {
        for (const key of keys) {
            const value = details[key] ?? metadata[key];
            if (value !== undefined && value !== null && String(value).trim()) return String(value);
        }
        return '';
    };
    const activityKey = getRehabActivityKey(entry);
    const taskVersion = read('task_version', 'taskVersion', 'content_version', 'contentVersion', 'report_schema_version', 'reportSchemaVersion');
    const levelKey = read('level_id', 'levelId', 'stage_id', 'stageId', 'difficulty', 'difficulty_level', 'difficultyLevel');
    const cueKey = read('cue_level', 'cueLevel', 'support_level', 'supportLevel');
    const inputKey = read('input_method', 'inputMethod', 'interaction_mode', 'interactionMode');
    const deviceKey = read('device_family', 'deviceFamily', 'device_class', 'deviceClass', 'platform');
    const timeLimitKey = read('time_limit_ms', 'timeLimitMs', 'time_limit_seconds', 'timeLimitSeconds');
    const responseKey = read(
        'response_condition', 'responseCondition',
        'report_response_condition', 'reportResponseCondition',
        'task_condition', 'taskCondition',
        'condition_label', 'conditionLabel'
    );
    const itemCountKey = Number(entry.totalQuestions || 0) > 0 ? String(Number(entry.totalQuestions)) : '';
    const requiredValues = [activityKey, taskVersion, levelKey, cueKey, inputKey, deviceKey, timeLimitKey, responseKey, itemCountKey];
    if (requiredValues.some((value) => !String(value || '').trim())) {
        return `unknown::${String(entry.id || entry.playedAt?.getTime?.() || 'unidentified')}`;
    }
    return [
        activityKey,
        entry.title,
        taskVersion,
        levelKey,
        cueKey,
        inputKey,
        deviceKey,
        timeLimitKey,
        responseKey,
        itemCountKey
    ]
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase())
        .join('::');
}

function sanitizeGuardianReportText(value = '') {
    const safeSentences = String(value || '')
        .split(/(?<=[.!?。]|다\.)\s+|\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => !/(\d+(?:\.\d+)?\s*(?:점|%|회|분|초)|\d+\s*\/\s*\d+|정확도|인지 점수|반응 점수|통합 점수|평균 점수|복합 지표)/.test(item));
    return safeSentences.join(' ');
}

function buildRehabGuardianDocument(entries = [], scopeLabel = '재활랩') {
    const latest = [...entries].sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime())[0];
    const latestTitle = latest?.title || scopeLabel;
    const explicitSummary = latest ? sanitizeGuardianReportText(getLabHistoryGuardianSummary(latest.row, scopeLabel)) : '';
    const explicitAction = latest ? sanitizeGuardianReportText(getLabHistoryGuardianActionSummary(latest.row)) : '';
    const hasRecordedErrors = Number(latest?.wrongCount || 0) > 0;
    return [
        {
            key: 'activity',
            label: '활동 요약',
            text: latest
                ? `${formatDateTimeDisplay(latest.playedAt)}에 ${latestTitle} 활동을 진행했습니다. 활동 과정과 도움 반응은 담당 선생님이 회기 기록과 함께 확인합니다.`
                : '공유할 활동 기록이 아직 없습니다.'
        },
        {
            key: 'strength',
            label: '강점',
            text: explicitSummary || '현재 기록에는 강점을 단정할 수 있는 서술 관찰이 충분하지 않습니다. 참여 과정에서 유지된 반응을 담당 선생님이 확인해 설명합니다.'
        },
        {
            key: 'support',
            label: '지원이 필요한 조건',
            text: hasRecordedErrors
                ? `${latestTitle} 활동에서 오반응이 기록되었습니다. 어떤 도움이나 제시 방식에서 달라졌는지는 수치가 아닌 회기 관찰과 함께 확인합니다.`
                : '지원이 더 필요한 조건을 판단할 서술 기록이 충분하지 않습니다. 피로도, 과제 이해, 도움 제공 여부를 함께 확인합니다.'
        },
        {
            key: 'home',
            label: '가정 반응',
            text: explicitAction || '가정에서는 정답을 재검사하기보다 짧게 설명을 듣고 시작하는지, 어려울 때 도움을 요청하는지, 활동을 마무리하는지를 부담 없이 살펴봐 주세요.'
        },
        {
            key: 'next',
            label: '다음 회기 확인',
            text: '다음 회기에는 같은 활동 조건에서 시작 반응, 필요한 도움, 오반응 양상을 다시 확인합니다. 난이도와 활동 계획은 담당 선생님이 당일 컨디션을 보고 조정합니다.'
        }
    ];
}

function renderRehabGuardianDocument(entries = [], scopeLabel = '재활랩') {
    const sections = buildRehabGuardianDocument(entries, scopeLabel);
    return `
        <section class="detail-rehab-document detail-rehab-document-guardian" aria-label="${escapeHtml(scopeLabel)} 보호자 공유 문서">
            <header class="detail-rehab-document-head">
                <p class="detail-playlab-section-kicker">GUARDIAN REPORT</p>
                <h3>${escapeHtml(scopeLabel)} 보호자 공유</h3>
                <p>활동 중 관찰된 내용만 간단히 정리한 공유용 문서입니다.</p>
            </header>
            <div class="detail-rehab-guardian-sections">
                ${sections.map((section, index) => `
                    <section class="detail-rehab-guardian-section" data-section="${escapeHtml(section.key)}">
                        <span>${String(index + 1).padStart(2, '0')}</span>
                        <div>
                            <h4>${escapeHtml(section.label)}</h4>
                            <p class="detail-report-story">${escapeHtml(section.text)}</p>
                        </div>
                    </section>
                `).join('')}
            </div>
            <p class="detail-rehab-document-note">이 문서는 학습 수행 기록을 바탕으로 한 관찰 요약이며 진단이나 치료 효과 판정이 아닙니다.</p>
        </section>
    `;
}

function buildRehabProfessionalEvidence(entries = []) {
    const latest = [...entries].sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime())[0] || null;
    if (!latest) return null;
    const conditionKey = getRehabSameConditionKey(latest);
    const sameConditionEntries = entries
        .filter((entry) => getRehabSameConditionKey(entry) === conditionKey)
        .sort((left, right) => left.playedAt.getTime() - right.playedAt.getTime());
    const recordCount = sameConditionEntries.length;
    const latestAccuracy = getRehabAccuracyCount(latest);
    const firstAccuracy = getRehabAccuracyCount(sameConditionEntries[0]);
    let evidenceLabel = '기준선 수집 중';
    let evidenceText = '동일 조건 기록이 1건입니다. 이번 기록을 기준선으로 보관하고 다음 동일 조건 회기 전까지 변화 방향은 판단하지 않습니다.';
    if (recordCount === 2) {
        evidenceLabel = '2시점 비교';
        evidenceText = `동일 조건 2건을 점 비교합니다. 첫 기록 ${firstAccuracy.label}, 최근 기록 ${latestAccuracy.label}이며 두 시점 차이는 수행 결과의 기술 비교로만 봅니다.`;
    } else if (recordCount >= 3) {
        const percentages = sameConditionEntries.map((entry) => getRehabAccuracyCount(entry).percentage).filter((value) => value !== null);
        evidenceLabel = percentages.length >= 3 ? '동일 조건 추세' : '원자료 수집 중';
        evidenceText = percentages.length >= 3
            ? `동일 조건 ${recordCount}건 중 정확 반응 원자료가 있는 ${percentages.length}건의 범위는 ${Math.min(...percentages)}-${Math.max(...percentages)}%이며 최근 기록은 ${latestAccuracy.label}입니다. 조건이 달라진 기록은 이 추세에서 제외했습니다.`
            : `동일 조건 ${recordCount}건 중 정확 반응 원자료가 충분한 기록은 ${percentages.length}건입니다. 미기록 값을 0%로 취급하지 않으며 변화 추세는 판단하지 않습니다.`;
    }
    return {
        latest,
        latestAccuracy,
        sameConditionEntries,
        responseCondition: getRehabResponseCondition(latest),
        errorDetail: getRehabErrorDetail(latest),
        evidenceLabel,
        evidenceText
    };
}

function renderRehabSameConditionVisual(evidence) {
    const entries = evidence?.sameConditionEntries || [];
    if (!entries.length) return '';
    return `
        <div class="detail-rehab-condition-visual" data-record-count="${entries.length}">
            ${entries.map((entry) => {
                const accuracy = getRehabAccuracyCount(entry);
                return `
                    <div class="detail-rehab-condition-row">
                        <time>${escapeHtml(formatDateTimeDisplay(entry.playedAt).replace('오전 ', '').replace('오후 ', ''))}</time>
                        <div class="detail-rehab-condition-track" aria-hidden="true">
                            <i style="width:${accuracy.percentage !== null ? Math.max(3, accuracy.percentage) : 0}%"></i>
                        </div>
                        <strong>${escapeHtml(accuracy.label)}</strong>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function getRehabMetricNumber(entry = {}, keys = []) {
    const { details, metadata } = getRehabReportSource(entry);
    for (const key of keys) {
        const value = details[key] ?? metadata[key];
        const numeric = Number(value);
        if ((typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(numeric) && numeric >= 0) return numeric;
    }
    return null;
}

function getRehabReactionTimeSummary(entry = {}) {
    const medianMs = getRehabMetricNumber(entry, ['median_reaction_ms', 'medianReactionMs', 'reaction_time_median_ms', 'reactionTimeMedianMs']);
    const averageMs = getRehabMetricNumber(entry, ['avg_reaction_ms', 'avgReactionMs', 'average_reaction_ms', 'averageReactionMs']);
    const iqrMs = getRehabMetricNumber(entry, ['reaction_iqr_ms', 'reactionIqrMs', 'iqr_reaction_ms', 'iqrReactionMs']);
    const value = medianMs ?? averageMs;
    return {
        value,
        iqrMs,
        label: value === null ? '반응시간 원자료 미기록' : `${Math.round(value)}ms${iqrMs === null ? '' : ` · IQR ${Math.round(iqrMs)}ms`}`,
        sourceLabel: medianMs !== null ? '중앙값' : (averageMs !== null ? '평균 참고값' : '미기록')
    };
}

function getRehabActivityKey(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    return String(
        details.activity_id || details.activityId || details.content_id || details.contentId || details.game_id || details.gameId ||
        metadata.activity_id || metadata.activityId || metadata.content_id || metadata.contentId || metadata.game_id || metadata.gameId ||
        entry.title || ''
    ).trim() || '활동 미기록';
}

function getRehabDomainLabels(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    const rawAxes = details.report_axes ?? details.reportAxes ?? metadata.report_axes ?? metadata.reportAxes ?? {};
    const axisText = [
        ...Object.keys(rawAxes && typeof rawAxes === 'object' ? rawAxes : {}),
        ...flattenAreas(details.report_focus_key || details.reportFocusKey || metadata.report_focus_key || metadata.reportFocusKey),
        entry.focusKey, entry.focusLabel, entry.title, entry.subtitle
    ].join(' ').toLowerCase();
    const labels = [];
    if (/억제|go.?no.?go|stroop|주의|집중|반응/.test(axisText)) labels.push('주의·억제');
    if (/기억|memory|회상/.test(axisText)) labels.push('작업기억');
    if (/시지각|공간|도형|회전|figure|shape/.test(axisText)) labels.push('시지각·공간');
    if (/언어|이름|낱말|음절|소리|문장|의미/.test(axisText)) labels.push('언어·의미');
    if (/순서|추적|계획|실행|trail|sequence/.test(axisText)) labels.push('실행·순차');
    return labels.length ? labels : ['기초 수행'];
}

function buildRehabIntegratedDashboard(entries = []) {
    const safeEntries = Array.isArray(entries) ? entries : [];
    const questionEntries = safeEntries.filter((entry) => getObservedReportNumber(entry.totalQuestions) !== null);
    const correctEntries = safeEntries.filter((entry) => getObservedReportNumber(entry.correctCount) !== null);
    const totalQuestions = questionEntries.length ? questionEntries.reduce((sum, entry) => sum + entry.totalQuestions, 0) : null;
    const correctCount = correctEntries.length ? correctEntries.reduce((sum, entry) => sum + entry.correctCount, 0) : null;
    const accuracyEntries = safeEntries.filter((entry) => getObservedReportNumber(entry.correctCount) !== null && getObservedReportNumber(entry.totalQuestions) !== null);
    const accuracyTotal = accuracyEntries.reduce((sum, entry) => sum + entry.totalQuestions, 0);
    const accuracyCorrect = accuracyEntries.reduce((sum, entry) => sum + entry.correctCount, 0);
    const durationEntries = safeEntries.filter((entry) => getObservedReportNumber(entry.durationMinutes) !== null);
    const durationMinutes = durationEntries.length ? durationEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0) : null;
    const activeDays = new Set(safeEntries.map((entry) => {
        if (!entry?.playedAt) return '';
        return `${entry.playedAt.getFullYear()}-${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}-${String(entry.playedAt.getDate()).padStart(2, '0')}`;
    }).filter(Boolean)).size;
    const reactionEntries = safeEntries.map(getRehabReactionTimeSummary).filter((item) => item.value !== null);
    const domainCounts = safeEntries.reduce((map, entry) => {
        getRehabDomainLabels(entry).forEach((label) => map.set(label, (map.get(label) || 0) + 1));
        return map;
    }, new Map());
    const activityCounts = safeEntries.reduce((map, entry) => {
        const key = getRehabActivityKey(entry);
        map.set(key, (map.get(key) || 0) + 1);
        return map;
    }, new Map());
    return {
        totalQuestions,
        correctCount,
        accuracy: accuracyTotal > 0 ? Math.round((accuracyCorrect / accuracyTotal) * 100) : null,
        accuracyRecordedCount: accuracyEntries.length,
        durationMinutes,
        durationRecordedCount: durationEntries.length,
        durationApproximate: durationEntries.some((entry) => entry.durationObservation?.approximate),
        activeDays,
        reactionRecordedCount: reactionEntries.length,
        individualReportCount: safeEntries.filter(canOpenRehabIndividualReport).length,
        domainCounts: [...domainCounts.entries()].sort((a, b) => b[1] - a[1]),
        activityCount: activityCounts.size
    };
}

const REHAB_FUNCTIONAL_METRICS = [
    { id: 'speed', label: '반응속도' },
    { id: 'accuracy', label: '정확도' },
    { id: 'attention', label: '집중지속' },
    { id: 'memory', label: '작업기억' },
    { id: 'inhibition', label: '억제조절' },
    { id: 'search', label: '시지각탐색' }
];

function normalizeRehabStoredAxes(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    const raw = details.report_axes ?? details.reportAxes ?? metadata.report_axes ?? metadata.reportAxes ?? null;
    const source = Array.isArray(raw)
        ? raw
        : (raw && typeof raw === 'object'
            ? Object.entries(raw).map(([id, value]) => ({
                id,
                ...(value && typeof value === 'object' ? value : { score: value })
            }))
            : []);
    const aliases = {
        speed: ['speed', 'reaction', 'reactionSpeed', 'processingSpeed', '반응속도', '처리속도'],
        accuracy: ['accuracy', '정확도'],
        attention: ['attention', 'sustainedAttention', 'concentration', '집중지속', '주의지속'],
        memory: ['memory', 'workingMemory', 'working-memory', '작업기억', '순차기억'],
        inhibition: ['inhibition', 'responseInhibition', '억제조절', '반응억제'],
        search: ['search', 'visualSearch', 'visual-search', '시지각탐색', '시각탐색']
    };
    const normalized = new Map();
    source.forEach((axis) => {
        const identity = `${axis?.id || ''} ${axis?.key || ''} ${axis?.label || ''}`.replace(/\s+/g, '').toLowerCase();
        const metric = REHAB_FUNCTIONAL_METRICS.find((definition) => aliases[definition.id]
            .some((alias) => identity.includes(String(alias).replace(/\s+/g, '').toLowerCase())));
        const score = getObservedReportNumber(axis?.score ?? axis?.value);
        if (!metric || score === null || score > 100) return;
        normalized.set(metric.id, Math.round(score));
    });
    return normalized;
}

function getMedianNumber(values = []) {
    const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function buildRehabFunctionalProfile(entries = []) {
    const safeEntries = Array.isArray(entries) ? entries : [];
    return REHAB_FUNCTIONAL_METRICS.map((definition) => {
        const points = [];
        safeEntries.forEach((entry) => {
            const storedAxes = normalizeRehabStoredAxes(entry);
            let value = storedAxes.get(definition.id);
            let source = '저장 참고값 · 산출 출처 미검증';
            if (definition.id === 'accuracy') {
                const accuracy = getRehabAccuracyCount(entry);
                if (accuracy.total > 0) {
                    value = accuracy.percentage;
                    source = `정반응 ${accuracy.correct}/${accuracy.total}`;
                }
            }
            if (!Number.isFinite(value)) return;
            points.push({ entry, value: Math.round(value), source });
        });
        const values = points.map((point) => point.value);
        const latest = points.slice().sort((a, b) => b.entry.playedAt.getTime() - a.entry.playedAt.getTime())[0] || null;
        return {
            ...definition,
            points,
            coverageCount: points.length,
            totalCount: safeEntries.length,
            median: getMedianNumber(values),
            minimum: values.length ? Math.min(...values) : null,
            maximum: values.length ? Math.max(...values) : null,
            latest
        };
    });
}

function buildRehabFunctionalChangeProfile(entries = []) {
    const safeEntries = Array.isArray(entries) ? entries : [];
    return REHAB_FUNCTIONAL_METRICS.map((definition) => {
        const allPoints = [];
        const exactGroups = new Map();
        const referenceGroups = new Map();
        safeEntries.forEach((entry) => {
            const storedAxes = normalizeRehabStoredAxes(entry);
            let value = storedAxes.get(definition.id);
            let source = '저장 참고값 · 산출 출처 미검증';
            if (definition.id === 'accuracy') {
                const accuracy = getRehabAccuracyCount(entry);
                if (accuracy.total > 0) {
                    value = accuracy.percentage;
                    source = `정반응 ${accuracy.correct}/${accuracy.total}`;
                }
            }
            if (!Number.isFinite(value)) return;
            const point = { entry, value: Math.round(value), source };
            allPoints.push(point);
            const exactKey = getRehabSameConditionKey(entry);
            const isExact = exactKey && !exactKey.startsWith('unknown::');
            const referenceKey = [
                getRehabActivityKey(entry),
                entry.title || '',
                Number(entry.totalQuestions || 0),
                getRehabResponseCondition(entry) || ''
            ].map((item) => String(item || '').replace(/\s+/g, ' ').trim().toLowerCase()).join('::');
            const target = isExact ? exactGroups : referenceGroups;
            const key = isExact ? exactKey : referenceKey;
            if (!target.has(key)) target.set(key, []);
            target.get(key).push(point);
        });
        const sortGroupPoints = (points) => points.slice().sort((left, right) => left.entry.playedAt.getTime() - right.entry.playedAt.getTime());
        const chooseGroup = (groups) => [...groups.values()]
            .map(sortGroupPoints)
            .filter((points) => points.length >= 2)
            .sort((left, right) => {
                const latestDiff = right[right.length - 1].entry.playedAt.getTime() - left[left.length - 1].entry.playedAt.getTime();
                return latestDiff || right.length - left.length;
            })[0] || null;
        const exactPoints = chooseGroup(exactGroups);
        const comparisonPoints = exactPoints || chooseGroup(referenceGroups);
        const latestAvailable = allPoints.slice().sort((left, right) => right.entry.playedAt.getTime() - left.entry.playedAt.getTime())[0] || null;
        if (!comparisonPoints) {
            return {
                ...definition,
                points: [],
                coverageCount: allPoints.length,
                totalCount: safeEntries.length,
                comparable: false,
                comparisonQuality: 'none',
                latest: latestAvailable,
                baseline: null,
                delta: null
            };
        }
        const baseline = comparisonPoints[0];
        const latest = comparisonPoints[comparisonPoints.length - 1];
        const delta = latest.value - baseline.value;
        return {
            ...definition,
            points: comparisonPoints,
            coverageCount: allPoints.length,
            totalCount: safeEntries.length,
            comparable: true,
            comparisonQuality: exactPoints ? 'exact' : 'reference',
            baseline,
            latest,
            delta,
            direction: delta > 0 ? 'up' : (delta < 0 ? 'down' : 'flat'),
            activityLabel: latest.entry.title || getRehabActivityKey(latest.entry)
        };
    });
}

function renderRehabFunctionalSparkline(metric = {}) {
    const points = metric.points || [];
    if (points.length < 2) return '';
    const width = 240;
    const height = 72;
    const left = 12;
    const right = 12;
    const top = 12;
    const bottom = 16;
    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    const coordinates = points.map((point, index) => {
        const x = points.length === 1 ? width / 2 : left + (innerWidth * index / (points.length - 1));
        const y = top + ((100 - point.value) / 100) * innerHeight;
        return { ...point, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    });
    return `
        <svg class="detail-rehab-functional-sparkline is-${escapeHtml(metric.direction)}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(metric.label)} 첫 기록 ${metric.baseline.value}, 최근 기록 ${metric.latest.value}, 변화 ${metric.delta > 0 ? '+' : ''}${metric.delta}">
            <line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}"></line>
            <polyline points="${coordinates.map((point) => `${point.x},${point.y}`).join(' ')}"></polyline>
            ${coordinates.map((point, index) => `<circle cx="${point.x}" cy="${point.y}" r="${index === 0 || index === coordinates.length - 1 ? 4 : 2.5}"></circle>`).join('')}
            <text x="${coordinates[0].x}" y="${Math.max(10, coordinates[0].y - 7)}" text-anchor="start">${coordinates[0].value}</text>
            <text x="${coordinates[coordinates.length - 1].x}" y="${Math.max(10, coordinates[coordinates.length - 1].y - 7)}" text-anchor="end">${coordinates[coordinates.length - 1].value}</text>
        </svg>
    `;
}

function getRehabFunctionalPeriodBucket(date, period = 'month') {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    if (period === 'week') {
        const start = getWeekStartDate(date);
        return {
            key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
            label: `${String(start.getMonth() + 1).padStart(2, '0')}.${String(start.getDate()).padStart(2, '0')}`,
            sortValue: start.getTime()
        };
    }
    if (period === 'year') {
        const year = date.getFullYear();
        return { key: String(year), label: `${year}년`, sortValue: new Date(year, 0, 1).getTime() };
    }
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
        key: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: `${String(year).slice(-2)}.${String(month + 1).padStart(2, '0')}`,
        sortValue: new Date(year, month, 1).getTime()
    };
}

function buildRehabFunctionalPeriodProfile(entries = [], period = 'month') {
    const safeEntries = Array.isArray(entries) ? entries : [];
    const bucketMap = new Map();
    safeEntries.forEach((entry) => {
        const bucket = getRehabFunctionalPeriodBucket(entry?.playedAt, period);
        if (bucket && !bucketMap.has(bucket.key)) bucketMap.set(bucket.key, bucket);
    });
    const windowSize = period === 'year' ? 6 : 12;
    const visibleBuckets = [...bucketMap.values()]
        .sort((left, right) => left.sortValue - right.sortValue)
        .slice(-windowSize);

    return REHAB_FUNCTIONAL_METRICS.map((definition) => {
        const valuesByBucket = new Map(visibleBuckets.map((bucket) => [bucket.key, []]));
        safeEntries.forEach((entry) => {
            const bucket = getRehabFunctionalPeriodBucket(entry?.playedAt, period);
            if (!bucket || !valuesByBucket.has(bucket.key)) return;
            const storedAxes = normalizeRehabStoredAxes(entry);
            let value = storedAxes.get(definition.id);
            if (definition.id === 'accuracy') {
                const accuracy = getRehabAccuracyCount(entry);
                if (accuracy.total > 0) value = accuracy.percentage;
            }
            if (!Number.isFinite(value)) return;
            valuesByBucket.get(bucket.key).push(Math.round(value));
        });
        const series = visibleBuckets.map((bucket) => {
            const values = valuesByBucket.get(bucket.key) || [];
            return {
                ...bucket,
                value: getMedianNumber(values),
                sessionCount: values.length
            };
        });
        const observed = series.filter((point) => Number.isFinite(point.value));
        const baseline = observed[0] || null;
        const latest = observed[observed.length - 1] || null;
        const delta = baseline && latest && observed.length >= 2 ? latest.value - baseline.value : null;
        return {
            ...definition,
            period,
            series,
            observed,
            observedPeriodCount: observed.length,
            sessionCount: observed.reduce((sum, point) => sum + point.sessionCount, 0),
            comparable: Number.isFinite(delta),
            baseline,
            latest,
            delta,
            direction: delta > 0 ? 'up' : (delta < 0 ? 'down' : 'flat')
        };
    });
}

function renderRehabFunctionalPeriodSparkline(metric = {}) {
    const series = metric.series || [];
    if (!series.length) return '';
    const width = 300;
    const height = 118;
    const padding = { top: 16, right: 14, bottom: 30, left: 14 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const coordinates = series.map((point, index) => ({
        ...point,
        x: series.length === 1 ? width / 2 : padding.left + (innerWidth * index / Math.max(1, series.length - 1)),
        y: Number.isFinite(point.value) ? padding.top + ((100 - point.value) / 100) * innerHeight : null
    }));
    const segments = [];
    let activeSegment = [];
    coordinates.forEach((point) => {
        if (Number.isFinite(point.y)) activeSegment.push(point);
        else if (activeSegment.length) {
            segments.push(activeSegment);
            activeSegment = [];
        }
    });
    if (activeSegment.length) segments.push(activeSegment);
    const showEvery = Math.max(1, Math.ceil(series.length / 6));
    const ariaValues = metric.observed.map((point) => `${point.label} ${point.value}`).join(', ');
    return `
        <svg class="detail-rehab-functional-period-chart is-${escapeHtml(metric.direction || 'baseline')}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(metric.label)} ${escapeHtml(ariaValues || '자료 없음')}">
            <line class="is-guide" x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}"></line>
            <line class="is-guide" x1="${padding.left}" y1="${padding.top + innerHeight / 2}" x2="${width - padding.right}" y2="${padding.top + innerHeight / 2}"></line>
            <line class="is-guide" x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}"></line>
            ${segments.filter((segment) => segment.length >= 2).map((segment) => `<polyline points="${segment.map((point) => `${point.x},${point.y}`).join(' ')}"></polyline>`).join('')}
            ${coordinates.filter((point) => Number.isFinite(point.y)).map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.8"></circle>`).join('')}
            ${coordinates.map((point, index) => (index % showEvery === 0 || index === coordinates.length - 1) ? `<text x="${point.x}" y="${height - 9}" text-anchor="middle">${escapeHtml(point.label)}</text>` : '').join('')}
        </svg>
    `;
}

function getRehabFunctionalPeriodLabel(period = 'month') {
    if (period === 'week') return '주간';
    if (period === 'year') return '연간';
    return '월간';
}

function renderRehabFunctionalPeriodPanel(entries = [], period = 'month', chartKey = 'detailRehabIntegratedTrend') {
    const profile = buildRehabFunctionalPeriodProfile(entries, period);
    const comparable = profile.filter((metric) => metric.comparable);
    const rising = comparable.filter((metric) => metric.delta > 0);
    const largestRise = rising.slice().sort((left, right) => right.delta - left.delta)[0] || null;
    const periodLabel = getRehabFunctionalPeriodLabel(period);
    return `
        <section id="${escapeHtml(chartKey)}-${escapeHtml(period)}" class="detail-rehab-functional-period-panel${period === 'month' ? ' is-active' : ''}" data-rehab-functional-panel="${escapeHtml(period)}" ${period === 'month' ? '' : 'hidden'}>
            <div class="detail-rehab-functional-change-summary" aria-label="${periodLabel} 기능 변화 요약">
                <div><span>비교 가능</span><strong>${comparable.length}/6개 기능</strong></div>
                <div><span>상승 관찰</span><strong>${rising.length}개 기능</strong></div>
                <div><span>가장 큰 상승</span><strong>${largestRise ? `${escapeHtml(largestRise.label)} +${largestRise.delta}` : '자료 부족'}</strong></div>
            </div>
            <div class="detail-rehab-functional-chart" role="group" aria-label="재활랩 6개 기능별 ${periodLabel} 변화 차트">
                ${profile.map((metric) => `
                    <article class="detail-rehab-functional-metric${metric.sessionCount ? '' : ' is-missing'}${metric.comparable ? ` is-${metric.direction}` : ' is-baseline'}" data-metric="${escapeHtml(metric.id)}" data-period="${escapeHtml(period)}" data-observed-periods="${metric.observedPeriodCount}" data-session-count="${metric.sessionCount}">
                        <header><strong>${escapeHtml(metric.label)}</strong><span>${metric.observedPeriodCount}개 ${periodLabel} 구간 · ${metric.sessionCount}회</span></header>
                        ${metric.sessionCount ? `
                            ${renderRehabFunctionalPeriodSparkline(metric)}
                            ${metric.comparable ? `
                                <div class="detail-rehab-functional-period-delta">
                                    <span>${escapeHtml(metric.baseline.label)} <strong>${metric.baseline.value}</strong></span>
                                    <b class="is-${metric.direction}">${metric.delta > 0 ? '+' : ''}${metric.delta}</b>
                                    <span>${escapeHtml(metric.latest.label)} <strong>${metric.latest.value}</strong></span>
                                </div>
                            ` : `<div class="detail-rehab-functional-baseline"><strong>비교 기준선 수집 중</strong><span>${escapeHtml(metric.latest.label)} ${metric.latest.value} · 2개 이상 ${periodLabel} 구간 필요</span></div>`}
                        ` : '<p><strong>자료 없음</strong><span>해당 기능을 직접 기록한 완료 회기가 없습니다.</span></p>'}
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function setRehabFunctionalTrendPeriod(chartKey, period = 'month') {
    const shell = document.getElementById(chartKey);
    if (!shell || !['week', 'month', 'year'].includes(period)) return;
    shell.querySelectorAll('[data-rehab-functional-period]').forEach((button) => {
        const isActive = button.getAttribute('data-rehab-functional-period') === period;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    shell.querySelectorAll('[data-rehab-functional-panel]').forEach((panel) => {
        const isActive = panel.getAttribute('data-rehab-functional-panel') === period;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
    });
}

function renderRehabFunctionalProfileChart(entries = [], chartKey = 'detailRehabIntegratedTrend') {
    return `
        <div id="${escapeHtml(chartKey)}" class="detail-rehab-functional-trend-view">
            <div class="detail-rehab-functional-period-toolbar" role="tablist" aria-label="재활 기능 변화 집계 기간">
                <button type="button" data-rehab-functional-period="week" role="tab" aria-selected="false" onclick="setRehabFunctionalTrendPeriod('${escapeHtml(chartKey)}','week')">주간</button>
                <button type="button" class="is-active" data-rehab-functional-period="month" role="tab" aria-selected="true" onclick="setRehabFunctionalTrendPeriod('${escapeHtml(chartKey)}','month')">월간</button>
                <button type="button" data-rehab-functional-period="year" role="tab" aria-selected="false" onclick="setRehabFunctionalTrendPeriod('${escapeHtml(chartKey)}','year')">연간</button>
            </div>
            ${renderRehabFunctionalPeriodPanel(entries, 'week', chartKey)}
            ${renderRehabFunctionalPeriodPanel(entries, 'month', chartKey)}
            ${renderRehabFunctionalPeriodPanel(entries, 'year', chartKey)}
        </div>
        <p class="detail-rehab-functional-note">각 기능의 주·월·연 구간별 중앙값을 비교합니다. 양수는 최근 집계 구간이 첫 집계 구간보다 높음을 뜻합니다. 과제 구성과 난이도 차이, 반복 연습 효과가 포함될 수 있어 치료 효과로 해석하지 않고, 결측 구간은 연결하거나 0점으로 대체하지 않습니다.</p>
    `;
}

function getRehabTeacherReviewNote(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    return String(
        details.report_teacher_review_note ||
        details.reportTeacherReviewNote ||
        metadata.report_teacher_review_note ||
        metadata.reportTeacherReviewNote ||
        ''
    ).trim();
}

function getRehabHumanOpinion(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    const author = String(
        details.report_author_name || details.reportAuthorName || details.therapist_name || details.therapistName ||
        metadata.report_author_name || metadata.reportAuthorName || metadata.therapist_name || metadata.therapistName || ''
    ).trim();
    const discipline = String(
        details.report_author_discipline || details.reportAuthorDiscipline || details.therapist_discipline || details.therapistDiscipline ||
        metadata.report_author_discipline || metadata.reportAuthorDiscipline || metadata.therapist_discipline || metadata.therapistDiscipline || ''
    ).trim();
    const text = String(
        details.report_human_opinion || details.reportHumanOpinion || details.therapist_opinion || details.therapistOpinion ||
        metadata.report_human_opinion || metadata.reportHumanOpinion || metadata.therapist_opinion || metadata.therapistOpinion || ''
    ).trim();
    const reviewedAt = String(
        details.report_reviewed_at || details.reportReviewedAt || details.reviewed_at || details.reviewedAt ||
        metadata.report_reviewed_at || metadata.reportReviewedAt || metadata.reviewed_at || metadata.reviewedAt || ''
    ).trim();
    return text && author ? { text, author, discipline, reviewedAt } : null;
}

function getRehabApprovedIntegratedOpinion(entry = {}) {
    const { details, metadata } = getRehabReportSource(entry);
    const text = String(
        details.report_integrated_opinion || details.reportIntegratedOpinion ||
        metadata.report_integrated_opinion || metadata.reportIntegratedOpinion || ''
    ).trim();
    const author = String(
        details.report_integrated_author_name || details.reportIntegratedAuthorName || details.report_author_name || details.reportAuthorName ||
        metadata.report_integrated_author_name || metadata.reportIntegratedAuthorName || metadata.report_author_name || metadata.reportAuthorName || ''
    ).trim();
    const discipline = String(
        details.report_integrated_author_discipline || details.reportIntegratedAuthorDiscipline || details.report_author_discipline || details.reportAuthorDiscipline ||
        metadata.report_integrated_author_discipline || metadata.reportIntegratedAuthorDiscipline || metadata.report_author_discipline || metadata.reportAuthorDiscipline || ''
    ).trim();
    const reviewedAt = String(
        details.report_integrated_reviewed_at || details.reportIntegratedReviewedAt || details.report_reviewed_at || details.reportReviewedAt ||
        metadata.report_integrated_reviewed_at || metadata.reportIntegratedReviewedAt || metadata.report_reviewed_at || metadata.reportReviewedAt || ''
    ).trim();
    const sourceType = String(
        details.report_integrated_source_type || details.reportIntegratedSourceType ||
        metadata.report_integrated_source_type || metadata.reportIntegratedSourceType || ''
    ).trim().toLowerCase();
    const reviewStatus = String(
        details.report_integrated_review_status || details.reportIntegratedReviewStatus ||
        metadata.report_integrated_review_status || metadata.reportIntegratedReviewStatus || ''
    ).trim().toLowerCase();
    const isHumanSource = ['human', 'clinician', 'therapist', 'professional'].includes(sourceType);
    const isApproved = ['approved', 'reviewed', 'final'].includes(reviewStatus);
    const hasValidReviewedAt = reviewedAt && Number.isFinite(new Date(reviewedAt).getTime());
    return text && author && hasValidReviewedAt && isHumanSource && isApproved
        ? { text, author, discipline, reviewedAt, sourceType: sourceType || 'human', reviewStatus: reviewStatus || 'approved' }
        : null;
}

function getRehabRoleKey(title = '') {
    const normalized = String(title || '').toLowerCase();
    if (/심리|정서|psych/.test(normalized)) return 'psychology';
    if (/인지|작업|occup|cognit/.test(normalized)) return 'cognitive';
    if (/언어|의사소통|speech|language/.test(normalized)) return 'language';
    if (/행동|발달|behavior/.test(normalized)) return 'behavior';
    return '';
}

function buildRehabIntegratedOpinions(entries = []) {
    const sorted = (Array.isArray(entries) ? entries : [])
        .slice()
        .sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime());
    const roleDefinitions = [
        { key: 'psychology', label: '심리 관점', icon: 'psychology' },
        { key: 'cognitive', label: '인지재활 관점', icon: 'neurology' },
        { key: 'language', label: '언어재활 관점', icon: 'record_voice_over' },
        { key: 'behavior', label: '행동 관찰 관점', icon: 'accessibility_new' }
    ];
    const roleMap = new Map();
    const approvedIntegratedNotes = [];
    const automaticSummaries = [];
    const reviewNotes = [];
    const humanNotes = [];

    sorted.forEach((entry) => {
        const normalized = normalizeLabHistoryRow(entry.row || {});
        const details = normalized.details || {};
        const metadata = normalized.metadata || {};
        const brief = String(
            details.report_brief_opinion || details.reportBriefOpinion ||
            metadata.report_brief_opinion || metadata.reportBriefOpinion ||
            getLabHistoryOverview(normalized) || ''
        ).trim();
        if (brief && !automaticSummaries.some((item) => item.text === brief && String(item.entry.id) === String(entry.id))) {
            automaticSummaries.push({ text: brief, entry });
        }
        const approvedIntegrated = getRehabApprovedIntegratedOpinion(entry);
        if (approvedIntegrated && !approvedIntegratedNotes.some((item) => item.text === approvedIntegrated.text && item.author === approvedIntegrated.author && item.reviewedAt === approvedIntegrated.reviewedAt)) {
            approvedIntegratedNotes.push({ ...approvedIntegrated, entry });
        }
        const teacherNote = getRehabTeacherReviewNote(entry);
        if (teacherNote && !reviewNotes.some((item) => item.text === teacherNote)) {
            reviewNotes.push({ text: teacherNote, entry });
        }
        const humanOpinion = getRehabHumanOpinion(entry);
        if (humanOpinion && !humanNotes.some((item) => item.text === humanOpinion.text)) {
            humanNotes.push({ ...humanOpinion, entry });
        }

        let roleNotes = getLabHistoryRoleNotes(normalized);
        let roleSource = '저장 소견';
        if (!roleNotes.length && canOpenRehabIndividualReport(entry)) {
            roleNotes = buildPlaylabHistoryReport(entry)?.roleNotes || [];
            roleSource = '저장 원자료 재구성';
        }
        roleNotes.forEach((note) => {
            const key = getRehabRoleKey(note.title);
            const text = String(note.text || '').trim();
            if (!key || !text) return;
            if (!roleMap.has(key)) roleMap.set(key, []);
            const notes = roleMap.get(key);
            const isHumanSource = ['human', 'clinician', 'therapist', 'professional'].includes(String(note.sourceType || '').toLowerCase());
            const hasValidReviewedAt = Boolean(note.reviewedAt) && Number.isFinite(new Date(note.reviewedAt).getTime());
            const isApprovedHuman = isHumanSource && note.author && hasValidReviewedAt && ['approved', 'reviewed', 'final'].includes(String(note.reviewStatus || '').toLowerCase());
            const isDirectMemo = isHumanSource && note.author && !isApprovedHuman;
            const noteIdentity = note.noteId || [entry.id, key, note.author, note.reviewedAt, text].join('::');
            if (notes.some((item) => item.noteIdentity === noteIdentity)) return;
            notes.push({
                ...note,
                text,
                entry,
                noteIdentity,
                source: isApprovedHuman ? '전문가 승인 분야 소견' : (isDirectMemo ? '작성자 있는 직접 메모 · 승인 여부 미확인' : roleSource),
                isHuman: isApprovedHuman,
                isDirectMemo
            });
        });
    });

    return {
        approvedIntegratedNotes,
        automaticSummaries,
        reviewNotes,
        humanNotes,
        roles: roleDefinitions.map((definition) => ({
            ...definition,
            notes: roleMap.get(definition.key) || []
        }))
    };
}

function buildRehabActivityVolumeSeries(entries = []) {
    const buckets = new Map();
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
        if (!entry?.playedAt) return;
        const key = `${entry.playedAt.getFullYear()}-${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}`;
        if (!buckets.has(key)) {
            buckets.set(key, {
                key,
                sortValue: new Date(entry.playedAt.getFullYear(), entry.playedAt.getMonth(), 1).getTime(),
                label: `${String(entry.playedAt.getFullYear()).slice(-2)}.${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}`,
                count: 0,
                durationMinutes: 0,
                durationRecordedCount: 0,
                durationApproximate: false
            });
        }
        const bucket = buckets.get(key);
        bucket.count += 1;
        const minutes = getObservedReportNumber(entry.durationMinutes);
        if (minutes !== null) { bucket.durationMinutes += minutes; bucket.durationRecordedCount += 1; }
        bucket.durationApproximate ||= Boolean(entry.durationObservation?.approximate);
    });
    return [...buckets.values()].sort((left, right) => left.sortValue - right.sortValue).map((bucket) => ({ ...bucket, durationMinutes: bucket.durationRecordedCount ? bucket.durationMinutes : null }));
}

function buildRehabTrendSeries(entries = [], period = 'month') {
    const buckets = new Map();
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
        if (!(entry?.playedAt instanceof Date) || Number.isNaN(entry.playedAt.getTime())) return;
        let bucketDate;
        let key;
        let label;
        if (period === 'week') {
            bucketDate = getWeekStartDate(entry.playedAt);
            key = `${bucketDate.getFullYear()}-${String(bucketDate.getMonth() + 1).padStart(2, '0')}-${String(bucketDate.getDate()).padStart(2, '0')}`;
            label = `${String(bucketDate.getMonth() + 1).padStart(2, '0')}.${String(bucketDate.getDate()).padStart(2, '0')}`;
        } else if (period === 'year') {
            bucketDate = new Date(entry.playedAt.getFullYear(), 0, 1);
            key = String(entry.playedAt.getFullYear());
            label = `${key}년`;
        } else {
            bucketDate = new Date(entry.playedAt.getFullYear(), entry.playedAt.getMonth(), 1);
            key = `${entry.playedAt.getFullYear()}-${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}`;
            label = `${String(entry.playedAt.getMonth() + 1).padStart(2, '0')}월`;
        }
        if (!buckets.has(key)) {
            buckets.set(key, { key, label, sortValue: bucketDate.getTime(), count: 0, durationMinutes: 0, durationRecordedCount: 0, durationApproximate: false });
        }
        const bucket = buckets.get(key);
        bucket.count += 1;
        const minutes = getObservedReportNumber(entry.durationMinutes);
        if (minutes !== null) { bucket.durationMinutes += minutes; bucket.durationRecordedCount += 1; }
        bucket.durationApproximate ||= Boolean(entry.durationObservation?.approximate);
    });
    return [...buckets.values()]
        .sort((left, right) => left.sortValue - right.sortValue)
        .map((bucket) => ({
            key: bucket.key,
            label: bucket.label,
            count: bucket.count,
            primary: bucket.count,
            secondary: bucket.durationRecordedCount ? bucket.durationMinutes : null,
            durationMinutes: bucket.durationRecordedCount ? bucket.durationMinutes / bucket.durationRecordedCount : null,
            durationApproximate: bucket.durationApproximate,
            metricCounts: { primary: bucket.count, secondary: bucket.durationRecordedCount, durationMinutes: bucket.durationRecordedCount }
        }));
}

function buildRehabActivityStatistics(entries = []) {
    const rows = new Map();
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
        const key = getRehabActivityKey(entry);
        if (!rows.has(key)) {
            rows.set(key, {
                key,
                title: entry.title || '재활랩 활동',
                sessions: 0,
                totalQuestions: 0,
                questionRecordedCount: 0,
                durationMinutes: 0,
                durationRecordedCount: 0,
                durationApproximate: false,
                reportCount: 0,
                activeDays: new Set()
            });
        }
        const row = rows.get(key);
        row.sessions += 1;
        const questions = getObservedReportNumber(entry.totalQuestions);
        if (questions !== null) { row.totalQuestions += questions; row.questionRecordedCount += 1; }
        const minutes = getObservedReportNumber(entry.durationMinutes);
        if (minutes !== null) { row.durationMinutes += minutes; row.durationRecordedCount += 1; }
        row.durationApproximate ||= Boolean(entry.durationObservation?.approximate);
        if (canOpenRehabIndividualReport(entry)) row.reportCount += 1;
        if (entry.playedAt instanceof Date && !Number.isNaN(entry.playedAt.getTime())) {
            row.activeDays.add(`${entry.playedAt.getFullYear()}-${entry.playedAt.getMonth()}-${entry.playedAt.getDate()}`);
        }
    });
    return [...rows.values()]
        .map((row) => ({ ...row, durationMinutes: row.durationRecordedCount ? row.durationMinutes : null, activeDayCount: row.activeDays.size }))
        .sort((left, right) => right.sessions - left.sessions || left.title.localeCompare(right.title, 'ko'));
}

function renderRehabActivityStatistics(entries = []) {
    const rows = buildRehabActivityStatistics(entries);
    return `
        <section class="detail-rehab-activity-stats" aria-label="활동별 전체 수행 통계">
            <header class="detail-rehab-section-head">
                <div>
                    <p class="detail-playlab-section-kicker">ACTIVITY STATISTICS</p>
                    <h4>활동별 전체 수행 통계</h4>
                    <p>과제별 완료 횟수와 문항 노출량을 집계합니다. 서로 다른 과제의 정확도나 반응시간은 합치지 않습니다.</p>
                </div>
                <span>${rows.length}개 활동</span>
            </header>
            <div class="detail-rehab-activity-table" role="table" aria-label="재활랩 활동별 통계">
                <div class="is-head" role="row"><span role="columnheader">활동</span><span role="columnheader">완료</span><span role="columnheader">활성일</span><span role="columnheader">문항 노출</span><span role="columnheader">누적 시간</span><span role="columnheader">상세 리포트</span></div>
                ${rows.map((row) => `<div role="row"><span role="cell"><strong>${escapeHtml(row.title)}</strong></span><span role="cell">${row.sessions}회</span><span role="cell">${row.activeDayCount}일</span><span role="cell">${row.questionRecordedCount ? `${row.totalQuestions}건` : '미기록'}</span><span role="cell">${escapeHtml(formatObservedReportDuration(row.durationMinutes, row.durationApproximate))}</span><span role="cell">${row.reportCount}/${row.sessions}회</span></div>`).join('')}
            </div>
        </section>
    `;
}

function renderRehabActivityVolumeChart(entries = []) {
    const series = buildRehabActivityVolumeSeries(entries);
    const maxCount = Math.max(1, ...series.map((item) => item.count));
    return `
        <div class="detail-rehab-volume-chart" data-month-count="${series.length}" role="img" aria-label="전체 기간 월별 재활랩 완료 횟수">
            ${series.map((item) => `
                <div>
                    <strong>${item.count}회</strong>
                    <i><b style="height:${Math.max(8, Math.round((item.count / maxCount) * 100))}%"></b></i>
                    <span>${escapeHtml(item.label)}<em>${escapeHtml(formatObservedReportDuration(item.durationMinutes, item.durationApproximate))}</em></span>
                </div>
            `).join('') || '<p class="detail-rehab-empty-copy">월별 활동 기록이 없습니다.</p>'}
        </div>
    `;
}

function renderRehabDevelopmentOverview(entries = [], chartKey = 'detailRehabIntegratedTrend') {
    return `
        <section class="detail-rehab-development" aria-label="재활랩 현재 수행 및 관찰 변화">
            <header class="detail-rehab-section-head">
                <div>
                    <p class="detail-playlab-section-kicker">PERFORMANCE HISTORY</p>
                    <h4>주간 · 월간 · 연간 재활 기능 변화</h4>
                    <p>기능별 관찰값을 기간 단위로 통합해 과거부터 최근까지의 변화 흐름을 보여줍니다.</p>
                </div>
                <span>비표준화 디지털 수행지표</span>
            </header>
            <div class="detail-rehab-trend-shell">
                ${renderRehabFunctionalProfileChart(entries, chartKey)}
            </div>
            <p class="detail-rehab-development-note">비표준화 디지털 수행 기록의 기술 비교입니다. 초기 반복 연습, 당일 컨디션, 기기·단서 차이가 포함될 수 있으며 발달 수준이나 치료 효과를 판정하지 않습니다.</p>
        </section>
    `;
}

function renderRehabIntegratedOpinions(entries = []) {
    const profile = buildRehabFunctionalProfile(entries);
    const available = profile.filter((metric) => metric.coverageCount > 0);
    const sortedEntries = entries.slice().sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
    const first = sortedEntries[0];
    const last = sortedEntries[sortedEntries.length - 1];
    const languageEvidenceCount = entries.filter((entry) => /언어|음운|말|낱말|문장|명명|speech|language/i.test(`${entry.title || ''} ${entry.subtitle || ''} ${getRehabDomainLabels(entry).join(' ')}`)).length;
    const errorEntries = entries.filter((entry) => Number(entry.wrongCount || 0) > 0).length;
    const reactionEntries = entries.filter((entry) => getRehabReactionTimeSummary(entry).hasValue).length;
    const missingMetrics = profile.filter((metric) => metric.coverageCount === 0);
    const metricEvidenceText = available.length
        ? available.map((metric) => `${metric.label} ${metric.coverageCount}/${entries.length}회(중앙값 ${metric.median}, 기록 범위 ${metric.minimum}–${metric.maximum})`).join(', ')
        : '기능별 저장 관찰지표 없음';
    const scopeText = `${entries.length}회 완료 기록(${escapeHtml(formatDateTimeDisplay(first?.playedAt))}–${escapeHtml(formatDateTimeDisplay(last?.playedAt))})과 ${available.length}개 기능의 유효 지표를 통합했습니다.`;
    const cumulativeOpinion = buildStoredReportOpinion(entries, '재활랩');
    const performanceText = `${cumulativeOpinion.overview} ${cumulativeOpinion.synthesis} ${metricEvidenceText}. 축마다 과제와 산출 근거가 달라 축 간 점수의 우열이나 전체 평균은 해석하지 않습니다. 변화 방향은 아래 동일 조건 원기록이 확보된 범위에서만 별도로 검토합니다.`;
    const clinicalText = `심리·행동 관점에서는 과제 지속, 누락·성급 반응, 오류 후 재시도 양상을 직접 관찰과 대조합니다. 인지재활 관점에서는 정확도와 반응속도 기록 ${reactionEntries}/${entries.length}회의 균형, 단서 사용, 동일 조건 반복성을 우선 확인합니다. ${languageEvidenceCount ? `언어재활 관련 과제 ${languageEvidenceCount}회는 음운·명명·이해 반응의 원기록과 치료실 내 의사소통 수행을 함께 검토합니다.` : '현재 완료 기록에는 언어기능을 직접 측정한 과제 근거가 없어 언어재활 기능에 대한 해석은 보류합니다.'}`;
    const nextText = `${cumulativeOpinion.guidance} ${errorEntries ? `${errorEntries}개 회기에서 오반응이 기록되어 commission·omission·순서·시간초과·단서 의존을 과제별로 구분해 확인합니다.` : '현재 저장값만으로 반복 오류 유형을 확정하기 어렵습니다.'} 다음 회기에는 동일 과제·동일 조건을 우선 반복하고 한 번에 한 조건만 조정합니다.${missingMetrics.length ? ` ${missingMetrics.map((metric) => metric.label).join('·')}은 직접 측정 근거가 없으므로 임상 목표와 관련될 때에만 적합 과제를 선택해 기준선을 수집합니다.` : ''}`;
    return `
        <section class="detail-rehab-opinions" aria-label="재활랩 전문가 통합 소견">
            <header class="detail-rehab-section-head">
                <div>
                    <p class="detail-playlab-section-kicker">INTEGRATED OPINIONS</p>
                    <h4>전체 재활랩 통합 관찰 요약</h4>
                    <p>모든 완료 기록을 심리·인지재활·언어재활·행동의 교차 관점으로 정리한 하나의 자동 초안입니다.</p>
                </div>
                <span>전문가 검토 전 자동 초안</span>
            </header>
            <section class="detail-rehab-integrated-opinion">
                <div>
                    <span>전체 이력 통합</span>
                    <strong>${entries.length}회 · ${available.length}/6개 기능 근거</strong>
                </div>
                <article class="detail-rehab-whole-history-summary">
                    <p><strong>기록 범위</strong>${scopeText}</p>
                    <p><strong>통합 수행 관찰</strong>${escapeHtml(performanceText)}</p>
                    <p><strong>다학제 관점</strong>${escapeHtml(clinicalText)}</p>
                    <p><strong>중재 우선순위·다음 회기</strong>${escapeHtml(nextText)}</p>
                    <time>비표준화 디지털 수행기록 기반 자동 통합 관찰 초안 · 진단·임상 척도·치료 효과 판정 아님 · 담당 전문가 승인 필요</time>
                </article>
            </section>
        </section>
    `;
}

function renderRehabIntegratedDashboard(entries = []) {
    const dashboard = buildRehabIntegratedDashboard(entries);
    const maxDomainCount = Math.max(1, ...dashboard.domainCounts.map(([, count]) => count));
    return `
        <section class="detail-rehab-dashboard" aria-label="재활랩 디지털 수행지표">
            <header class="detail-rehab-dashboard-head">
                <div>
                    <p class="detail-playlab-section-kicker">DIGITAL PERFORMANCE METRICS</p>
                    <h4>재활랩 통합 수행지표</h4>
                    <p>실제 완료된 재활랩 활동의 기록을 집계합니다. 이 수치는 비표준화 디지털 과제의 수행 기록이며 임상 척도나 치료사 소견과 합산하지 않습니다.</p>
                </div>
                <span>${entries.length}개 세션</span>
            </header>
            <div class="detail-rehab-dashboard-stats">
                <div><span>활동 / 세션</span><strong>${dashboard.activityCount}개 / ${entries.length}회</strong></div>
                <div><span>활성일 / 누적시간</span><strong>${dashboard.activeDays}일 / ${dashboard.durationMinutes || '-'}분</strong></div>
                <div><span>전체 문항 노출량</span><strong>${dashboard.totalQuestions !== null ? `${dashboard.totalQuestions}건` : '원자료 미기록'}</strong></div>
                <div><span>정반응 기록량</span><strong>${dashboard.correctCount !== null ? `${dashboard.correctCount}건` : '원자료 미기록'}</strong></div>
                <div><span>반응시간 기록</span><strong>${dashboard.reactionRecordedCount}/${entries.length}세션</strong></div>
                <div><span>개별 리포트</span><strong>${dashboard.individualReportCount}/${entries.length}세션</strong></div>
            </div>
            <div class="detail-rehab-dashboard-columns">
                <section>
                    <h5>영역별 관찰 기록</h5>
                    <p>영역 태그가 포함된 세션 수이며 한 세션이 여러 영역에 중복 포함될 수 있습니다.</p>
                    <div class="detail-rehab-domain-bars">
                        ${dashboard.domainCounts.map(([label, count]) => `<div><span>${escapeHtml(label)}</span><i><b style="width:${Math.max(5, Math.round((count / maxDomainCount) * 100))}%"></b></i><strong>${count}회</strong></div>`).join('')}
                    </div>
                </section>
                <section class="detail-rehab-clinical-separation">
                    <h5>임상 척도 · 치료사 소견</h5>
                    <p>디지털 수행지표와 별도 관리합니다. 표준화 검사 결과, 임상 척도, 치료사 직접 관찰은 이 집계값과 합산하거나 정상·위험 기준으로 변환하지 않습니다.</p>
                    <span>담당 전문가가 별도 기록에서 함께 검토</span>
                </section>
            </div>
        </section>
    `;
}

function canOpenRehabIndividualReport(entry = {}) {
    if (!entry?.id) return false;
    const { details, metadata } = getRehabReportSource(entry);
    if (parsePlaylabStoredReportInput(entry)) return true;
    // A small set of historical RehabLab reports has a stable engine profile
    // and enough observed item data to reconstruct the saved report safely.
    const reportType = String(details.report_type ?? details.reportType ?? metadata.report_type ?? metadata.reportType ?? '').toLowerCase();
    const supported = /rehablab-(?:shape-match-gonogo|traffic-go-nogo|stroop-color-word)|rehab-cognitive-legacy/.test(reportType);
    return supported && Number(entry.totalQuestions || 0) > 0 && (Number(entry.correctCount || 0) + Number(entry.wrongCount || 0)) > 0;
}

function renderRehabAllSessionTable(entries = [], options = {}) {
    const guardianMode = options.guardianMode === true;
    const sortedEntries = entries.slice().sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
    return `
        <section class="detail-rehab-session-table-section detail-rehab-all-session-section${guardianMode ? ' is-guardian' : ''}">
            <div class="detail-rehab-all-session-head">
                <div>
                    <p class="detail-playlab-section-kicker">COMPLETE HISTORY</p>
                    <h4>날짜별 재활랩 학습 내역</h4>
                    <p class="detail-rehab-table-description">전체 완료 ${sortedEntries.length}건입니다. 상세보기를 누르면 선택한 회기의 저장 리포트 또는 보존된 수행 원기록이 새 창으로 열립니다.</p>
                </div>
                <strong>${sortedEntries.length}건</strong>
            </div>
            <div class="detail-rehab-session-table detail-rehab-all-session-table">
                <div class="is-head"><span>날짜</span><span>학습</span><span>영역·조건</span><span>디지털 수행</span><span>시간 기록</span><span>리포트</span></div>
                ${sortedEntries.map((entry) => {
                    const accuracy = getRehabAccuracyCount(entry);
                    const reaction = getRehabReactionTimeSummary(entry);
                    const detailAction = `<button type="button" class="detail-playlab-log-btn" onclick="openPlaylabLogDetailReport('${escapeHtml(String(entry.id))}')">${canOpenRehabIndividualReport(entry) ? '상세보기' : '원기록 상세'}</button>`;
                    const durationLabel = formatObservedReportDuration(entry.durationMinutes, entry.durationObservation?.approximate);
                    return `<div><span>${escapeHtml(formatDateTimeDisplay(entry.playedAt))}</span><span><strong>${escapeHtml(entry.title || '재활랩 활동')}</strong><em>${escapeHtml(entry.subtitle || '재활랩')}</em></span><span><strong>${escapeHtml(getRehabDomainLabels(entry).join(' · '))}</strong><em>${escapeHtml(getRehabResponseCondition(entry))}</em></span><span><strong>${escapeHtml(accuracy.label)}</strong><em>${escapeHtml(getRehabErrorDetail(entry))}</em></span><span><strong>${escapeHtml(durationLabel)}</strong><em>${escapeHtml(reaction.label)}</em></span><span>${detailAction}</span></div>`;
                }).join('')}
            </div>
        </section>
    `;
}

function renderRehabProfessionalDocument(entries = [], scopeLabel = '재활랩', chartKey = 'detailRehabIntegratedTrend') {
    const evidence = buildRehabProfessionalEvidence(entries);
    if (!evidence) return '';
    const { latest, latestAccuracy } = evidence;
    const visualLabel = evidence.sameConditionEntries.length >= 3 ? '동일 조건 추세' : (evidence.sameConditionEntries.length === 2 ? '동일 조건 2시점' : '기준선 기록');
    const oldest = entries[0] || latest;
    return `
        <section class="detail-rehab-document detail-rehab-document-professional" aria-label="${escapeHtml(scopeLabel)} 전문가 분석 문서">
            <header class="detail-rehab-document-head detail-rehab-professional-head">
                <div>
                    <p class="detail-playlab-section-kicker">PROFESSIONAL REPORT</p>
                    <h3>전체 재활랩 통합 분석</h3>
                    <p>${entries.length}회 · ${escapeHtml(formatDateTimeDisplay(oldest.playedAt))}부터 ${escapeHtml(formatDateTimeDisplay(latest.playedAt))}까지</p>
                </div>
                <span>${escapeHtml(evidence.evidenceLabel)}</span>
            </header>

            ${renderRehabIntegratedDashboard(entries)}
            ${renderRehabDevelopmentOverview(entries, chartKey)}
            ${renderRehabActivityStatistics(entries)}
            ${renderRehabIntegratedOpinions(entries)}
            <details class="detail-rehab-appendix">
                <summary>최근 회기 및 동일 조건 원기록 보기</summary>
            <section class="detail-rehab-latest-session" aria-label="최근 회기 디지털 수행지표">
                <header class="detail-rehab-section-head">
                    <div>
                        <p class="detail-playlab-section-kicker">LATEST SESSION</p>
                        <h4>최근 회기 디지털 수행지표</h4>
                        <p>${escapeHtml(formatDateTimeDisplay(latest.playedAt))} · ${escapeHtml(latest.title || '재활랩 활동')} 한 회기의 원기록입니다.</p>
                    </div>
                    <span>통합 통계와 분리</span>
                </header>
            <div class="detail-rehab-raw-grid">
                <div><span>정확 반응</span><strong>${escapeHtml(latestAccuracy.label)}</strong></div>
                <div><span>정반응 수</span><strong>${latestAccuracy.total > 0 ? `${latestAccuracy.correct}건` : '-'}</strong></div>
                <div><span>오반응 수</span><strong>${latestAccuracy.total > 0 ? `${latestAccuracy.wrong}건` : '-'}</strong></div>
                <div><span>전체 문항</span><strong>${latestAccuracy.total > 0 ? `${latestAccuracy.total}건` : '-'}</strong></div>
            </div>

            <div class="detail-rehab-professional-grid">
                <section>
                    <h4>반응 조건</h4>
                    <p>${escapeHtml(evidence.responseCondition)}</p>
                </section>
                <section>
                    <h4>오류 기록</h4>
                    <p>${escapeHtml(evidence.errorDetail)}</p>
                </section>
            </div>
            </section>

            <section class="detail-rehab-evidence-section">
                <div class="detail-rehab-evidence-head">
                    <div>
                        <p class="detail-playlab-section-kicker">SAME CONDITION ONLY</p>
                        <h4>${escapeHtml(visualLabel)}</h4>
                    </div>
                    <strong>${evidence.sameConditionEntries.length}건</strong>
                </div>
                <p>${escapeHtml(evidence.evidenceText)}</p>
                ${renderRehabSameConditionVisual(evidence)}
            </section>

            <section class="detail-rehab-session-table-section">
                <h4>동일 조건 원기록</h4>
                <div class="detail-rehab-session-table">
                    <div class="is-head"><span>일시</span><span>정확 반응</span><span>반응 조건</span><span>오류</span></div>
                    ${evidence.sameConditionEntries.slice().reverse().slice(0, 10).map((entry) => {
                        const accuracy = getRehabAccuracyCount(entry);
                        return `<div><span>${escapeHtml(formatDateTimeDisplay(entry.playedAt))}</span><span>${escapeHtml(accuracy.label)}</span><span>${escapeHtml(getRehabResponseCondition(entry))}</span><span>${escapeHtml(getRehabErrorDetail(entry))}</span></div>`;
                    }).join('')}
                </div>
            </section>
            </details>

            <p class="detail-rehab-document-note">기록 간 조건이 같을 때만 비교합니다. 이 자료는 진단이나 치료 효과 판정을 대체하지 않으며 담당 전문가의 직접 관찰과 함께 검토합니다.</p>
        </section>
    `;
}

function renderPlaylabIntegratedReport(containerId, rows = [], options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const scope = options.scope || LAB_REPORT_SCOPE_PLAYLAB;
    const scopeLabel = options.scopeLabel || (scope === LAB_REPORT_SCOPE_REHAB ? '재활랩' : (scope === LAB_REPORT_SCOPE_MUSICARTLAB ? '뮤직아트랩' : '플레이랩'));
    const emptyIcon = options.icon || (scope === LAB_REPORT_SCOPE_REHAB ? 'accessibility_new' : (scope === LAB_REPORT_SCOPE_MUSICARTLAB ? 'artist' : 'sports_esports'));
    const emptyMessage = options.emptyMessage || '등록된 리포트가 없습니다.';

    if (!window.PlaylabReportEngine) {
        ensurePlaylabReportEngineLoaded()
            .then(() => {
                if (document.getElementById(containerId) === container) {
                    renderPlaylabIntegratedReport(containerId, rows, options);
                }
            })
            .catch(() => {
                // Keep fallback report output when lazy-load fails.
            });
    }

    const entries = buildPlaylabTimelineEntries(rows, scope);
    if (scope === LAB_REPORT_SCOPE_REHAB && typeof document !== 'undefined') {
        document.documentElement.dataset.rehabHistoryInput = String(Array.isArray(rows) ? rows.length : 0);
        document.documentElement.dataset.rehabHistoryEntries = String(entries.length);
    }
    if (!entries.length) {
        renderEmptyReport(containerId, emptyIcon, emptyMessage);
        return;
    }

    const reportMode = normalizeDetailReportMode(currentDetailReportMode);
    const isGuardianMode = reportMode === 'guardian';
    const dashboard = buildRehabIntegratedDashboard(entries);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthCount = entries.filter((entry) => {
        const date = entry.playedAt;
        return date && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === monthKey;
    }).length;
    const guardianObservation = buildGuardianIntegratedObservation(entries, scopeLabel);

    container.innerHTML = `
        <div class="detail-playlab-shell detail-report-shell">
            ${renderDetailReportPrintHeader(scopeLabel)}
            ${renderDetailReportModeNotice(scopeLabel)}
            ${isGuardianMode ? renderGuardianShareChecklist(scopeLabel) : ''}
            ${renderDetailReportHero({
                kicker: isGuardianMode ? 'GUARDIAN SUMMARY' : 'REHAB LAB REPORT',
                title: isGuardianMode ? `${scopeLabel} 보호자 공유 요약` : `${scopeLabel} 통합 리포트`,
                description: isGuardianMode
                    ? '전체 재활랩 활동 흐름과 최근 관찰, 날짜별 완료 내역을 보호자가 이해하기 쉽게 정리했습니다.'
                    : '실제 완료된 재활랩 활동을 디지털 수행지표와 동일 조건 비교 기록으로 함께 확인합니다.',
                badges: isGuardianMode
                    ? [`${scopeLabel} 활동 기록`, '선생님 검토']
                    : ['디지털 수행지표', '임상 척도·치료사 소견과 분리'],
                stats: isGuardianMode ? [
                    { label: '전체 완료', value: `${entries.length}회` },
                    { label: '이번 달', value: monthCount ? `${monthCount}회` : '확인 필요' },
                    { label: '최근 변화', value: guardianObservation.statusLabel || '흐름 확인' },
                    { label: '다음 확인', value: guardianObservation.nextLabel || '선생님 검토' }
                ] : [
                    { label: '완료 횟수', value: `${entries.length}회` },
                    { label: '이번 달', value: `${monthCount}회` },
                    { label: '활동 종류', value: `${dashboard.activityCount}개` },
                    { label: '누적 시간', value: formatObservedReportDuration(dashboard.durationMinutes, dashboard.durationApproximate) }
                ]
            })}
            ${isGuardianMode ? `
                <section class="detail-rehab-development detail-rehab-guardian-history" aria-label="전체 재활랩 활동 기록">
                    <header class="detail-rehab-section-head">
                        <div>
                            <p class="detail-playlab-section-kicker">ACTIVITY HISTORY</p>
                            <h4>전체 재활랩 활동 기록</h4>
                            <p>최근 1회가 아니라 저장된 전체 완료 기록을 월별 활동량으로 표시합니다.</p>
                        </div>
                        <span>${entries.length}회 완료</span>
                    </header>
                    <div class="detail-rehab-guardian-history-chart">
                        ${renderRehabActivityVolumeChart(entries)}
                    </div>
                </section>
                ${renderRehabGuardianDocument(entries, scopeLabel)}
            ` : renderRehabProfessionalDocument(entries, scopeLabel, `${containerId}-rehab-trend`)}
            ${renderRehabAllSessionTable(entries, { guardianMode: isGuardianMode })}
        </div>
    `;

}

function getRuntimeScheduleStatus(schedule, now = new Date()) {
    const rawStatus = String(schedule?.status || 'scheduled').toLowerCase();
    if (!schedule) return rawStatus;
    if (['noshow', 'deleted', 'canceled', 'cancelled'].includes(rawStatus)) return rawStatus;

    const startDate = new Date(`${schedule.date}T${String(schedule.startTime || '').slice(0, 5)}`);
    const endDate = new Date(`${schedule.date}T${String(schedule.endTime || '').slice(0, 5)}`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return rawStatus;

    if (now >= endDate) return 'completed';
    if (now >= startDate) return 'in-progress';
    return 'scheduled';
}

function getVisibleClientsByType(type) {
    const profile = window.currentProfile || {};
    const showTerminated = Boolean(profile.showTerminatedClients ?? profile.show_terminated_clients ?? false);
    const showPaused = Boolean(profile.showPausedClients ?? profile.show_paused_clients ?? true);
    return (window.appClients || []).filter((client) => {
        if ((client.type || 'client') !== type) return false;
        const status = String(client.status || '').toLowerCase();
        if (status === 'deleted') return false;
        if (status === 'terminated' && !showTerminated) return false;
        if (status === 'paused' && !showPaused) return false;
        return true;
    });
}

function getClassModalClientOptions() {
    return [...getVisibleClientsByType('client'), ...getVisibleClientsByType('reserve')]
        .slice()
        .sort((a, b) => {
            const typeDiff = String(a.type || 'client').localeCompare(String(b.type || 'client'));
            if (typeDiff !== 0) return typeDiff;
            return String(a.name || '').localeCompare(String(b.name || ''));
        });
}

function getClientSelectionValue(client) {
    return String(client.id || client.clientId || client.name || '').trim();
}

function getClientTypeLabel(client) {
    return String(client?.type || 'client') === 'reserve' ? '예약자' : '내담자';
}

function getClientDisplayLabel(client) {
    const name = String(client.name || '이름 없음').trim() || '이름 없음';
    return `${name} (${getClientTypeLabel(client)} · ${getClientAgeText(client)})`;
}

function getSelectedClassModalClient() {
    const selectedClientId = String(document.getElementById('classClientSelect')?.value || currentClassModalClientId || '').trim();
    return getClassModalClientOptions().find((client) => getClientSelectionValue(client) === selectedClientId) || null;
}

function syncClassRegistrationMode() {
    const singleCheckbox = document.getElementById('classSingleMode');
    const singleRow = document.getElementById('classSingleModeRow');
    const singleText = document.getElementById('classSingleModeText');
    const repeatSection = document.getElementById('classRepeatSection');
    const biweeklyCheckbox = document.getElementById('classIsBiweekly');
    if (!singleCheckbox || !singleRow || !singleText || !repeatSection || !biweeklyCheckbox) return;

    const selectedClient = getSelectedClassModalClient();
    const isReserve = String(selectedClient?.type || '') === 'reserve';
    const isEditMode = currentClassModalMode === 'edit';

    if (isReserve) singleCheckbox.checked = true;
    currentClassModalSingleMode = isEditMode ? true : (isReserve || Boolean(singleCheckbox.checked));

    singleRow.style.display = isEditMode ? 'none' : 'inline-flex';
    singleCheckbox.disabled = isEditMode || isReserve;
    singleText.textContent = isReserve
        ? '예약자는 1회 일정만 등록할 수 있습니다.'
        : '1회만 등록';

    repeatSection.style.display = currentClassModalSingleMode ? 'none' : 'block';
    if (currentClassModalSingleMode) {
        biweeklyCheckbox.checked = false;
    }
}

function getClientStatusMeta(client, type) {
    const status = String(client.status || '').toLowerCase();
    if (type === 'reserve') {
        if (status === 'paused') return { label: '예약보류', badgeClass: 'status-pause', dimmed: true };
        if (status === 'terminated') return { label: '예약종결', badgeClass: 'status-pause', dimmed: true };
        return { label: '대기중', badgeClass: 'status-pause', dimmed: false };
    }
    if (status === 'paused') return { label: '일시정지', badgeClass: 'status-pause', dimmed: true };
    if (status === 'terminated') return { label: '수업종결', badgeClass: 'status-pause', dimmed: true };
    return { label: '진행중', badgeClass: 'status-active', dimmed: false };
}

function getClientSubtitle(client, type) {
    const initialConsult = String(client.initialConsult || '').trim();
    const memo = String(client.memo || '').trim();
    if (type === 'reserve') return initialConsult || memo || '초기 상담 대기';
    if (String(client.status || '').toLowerCase() === 'paused') return '일시정지 중';
    return memo || initialConsult || '';
}

function getChosung(name = '') {
    const firstChar = String(name || '').trim().charAt(0);
    if (!firstChar) return '#';
    const code = firstChar.charCodeAt(0);
    const HANGUL_START = 0xac00;
    const HANGUL_END = 0xd7a3;
    const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    if (code >= HANGUL_START && code <= HANGUL_END) {
        const chosungIndex = Math.floor((code - HANGUL_START) / 588);
        return CHOSUNG[chosungIndex] || '#';
    }
    return firstChar.toUpperCase();
}

function buildListSectionId(type, initial) {
    return type === 'reserve' ? `idx-res-${initial}` : `idx-client-${initial}`;
}

function adjustClientNameLayout(listWrapper) {
    if (!listWrapper) return;
    requestAnimationFrame(() => {
        listWrapper.querySelectorAll('.draggable-item').forEach((item) => {
            const nameBlock = item.querySelector('.drag-name');
            if (!nameBlock) return;
            item.classList.toggle('name-overflow', nameBlock.scrollWidth > nameBlock.clientWidth + 2);
        });
    });
}

function classifyAuthStatusError(errorOrMessage) {
    const raw = typeof errorOrMessage === 'string'
        ? errorOrMessage
        : [
            errorOrMessage?.message,
            errorOrMessage?.error,
            errorOrMessage?.code,
            errorOrMessage?.details,
            errorOrMessage?.hint,
            errorOrMessage?.payload?.error,
            errorOrMessage?.payload?.message
        ].filter(Boolean).join(' ');
    const text = String(raw || '').toLowerCase();
    if (!text) return null;
    if (
        text.includes('auth_required')
        || text.includes('jwt expired')
        || text.includes('invalid jwt')
        || text.includes('refresh_token')
        || text.includes('session_not_found')
        || text.includes('auth session missing')
        || text.includes('로그인 정보가 확인되지')
        || text.includes('로그인 정보가 만료')
        || text.includes('로그아웃')
        || text.includes('세션')
    ) {
        return 'logged-out';
    }
    if (
        text.includes('permission denied')
        || text.includes('not authorized')
        || text.includes('forbidden')
        || text.includes('row-level security')
        || text.includes('rls')
        || text.includes('42501')
        || text.includes('권한')
    ) {
        return 'permission';
    }
    return null;
}

function showAuthStatusModal(type = 'permission', options = {}) {
    const modal = document.getElementById('authStatusModal');
    const titleEl = document.getElementById('authStatusTitle');
    const messageEl = document.getElementById('authStatusMessage');
    const iconEl = document.getElementById('authStatusIcon');
    const okButton = document.getElementById('authStatusOkButton');
    const isLoggedOut = type === 'logged-out';
    const title = options.title || (isLoggedOut ? '로그아웃되었습니다' : '접근 권한이 없습니다');
    const message = options.message || (isLoggedOut
        ? '로그인 상태가 만료되었거나 다른 창에서 로그아웃되었습니다. 다시 로그인해 주세요.'
        : '현재 계정으로 이 기능을 사용할 수 없습니다. 다시 로그인하거나 관리자에게 문의해 주세요.');
    if (!modal || !titleEl || !messageEl || !okButton) {
        window.alert(`${title}\n${message}`);
        if (isLoggedOut) window.location.replace('./index.html');
        return;
    }
    titleEl.textContent = title;
    messageEl.textContent = message;
    if (iconEl) iconEl.textContent = isLoggedOut ? 'logout' : 'lock';
    modal.classList.add('active');
    okButton.onclick = () => {
        modal.classList.remove('active');
        if (isLoggedOut || options.redirectToIndex) {
            window.location.replace('./index.html');
        }
        if (typeof options.onOk === 'function') options.onOk();
    };
}

function showAuthStatusModalForError(errorOrMessage, options = {}) {
    const type = classifyAuthStatusError(errorOrMessage);
    if (!type) return false;
    showAuthStatusModal(type, options);
    return true;
}

function showAlert(message, onOk) {
    if (showAuthStatusModalForError(message, { onOk })) return;
    const modal = document.getElementById('alertModal');
    const messageEl = document.getElementById('alertMessage');
    if (!modal || !messageEl) return;
    messageEl.innerText = message;
    modal.classList.add('active');
    document.getElementById('btnAlertOk').onclick = () => {
        modal.classList.remove('active');
        if (onOk) onOk();
    };
}

function showConfirm(message, onOk, onCancel) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    if (!modal || !messageEl) return;
    messageEl.innerText = message;
    modal.classList.add('active');
    document.getElementById('btnConfirmOk').onclick = () => {
        modal.classList.remove('active');
        if (onOk) onOk();
    };
    document.getElementById('btnConfirmCancel').onclick = () => {
        modal.classList.remove('active');
        if (onCancel) onCancel();
    };
}

function showRecurringDeleteConfirm(configOrOnOk, onCancel) {
    const modal = document.getElementById('recurringDeleteModal');
    if (!modal) return;
    const config = typeof configOrOnOk === 'function'
        ? { onOk: configOrOnOk, onCancel }
        : (configOrOnOk || {});
    const titleEl = document.getElementById('recurDeleteTitle');
    const descEl = document.getElementById('recurDeleteDescription');
    const options = [
        {
            value: 'one',
            wrapper: document.getElementById('recurDeleteOptionOne'),
            input: modal.querySelector('input[name="recurDeleteType"][value="one"]'),
            label: document.getElementById('recurDeleteLabelOne')
        },
        {
            value: 'future',
            wrapper: document.getElementById('recurDeleteOptionFuture'),
            input: modal.querySelector('input[name="recurDeleteType"][value="future"]'),
            label: document.getElementById('recurDeleteLabelFuture')
        },
        {
            value: 'all',
            wrapper: document.getElementById('recurDeleteOptionAll'),
            input: modal.querySelector('input[name="recurDeleteType"][value="all"]'),
            label: document.getElementById('recurDeleteLabelAll')
        }
    ];
    const visibleValues = new Set((config.options || ['one', 'future', 'all']).map((value) => String(value)));
    if (titleEl) titleEl.textContent = config.title || '수업 일정 삭제';
    if (descEl) descEl.textContent = config.description || '정말 이 수업을 삭제하시겠습니까? 삭제 범위를 선택해주세요.';
    options.forEach((option) => {
        if (option.wrapper) option.wrapper.classList.toggle('is-hidden', !visibleValues.has(option.value));
        if (option.label && config.labels?.[option.value]) option.label.textContent = config.labels[option.value];
        if (option.input) option.input.checked = false;
    });
    const firstVisible = options.find((option) => visibleValues.has(option.value));
    if (firstVisible?.input) firstVisible.input.checked = true;
    modal.classList.add('active');
    document.getElementById('btnRecurDeleteOk').onclick = () => {
        const selectedOption = modal.querySelector('input[name="recurDeleteType"]:checked')?.value || 'one';
        modal.classList.remove('active');
        if (config.onOk) config.onOk(selectedOption);
    };
    document.getElementById('btnRecurDeleteCancel').onclick = () => {
        modal.classList.remove('active');
        if (config.onCancel) config.onCancel();
    };
}

function showBottomToast(message) {
    const toast = document.getElementById('bottomToast');
    if (!toast) return;
    toast.textContent = String(message || '').trim();
    toast.classList.add('active');
    if (bottomToastTimer) clearTimeout(bottomToastTimer);
    bottomToastTimer = setTimeout(() => {
        toast.classList.remove('active');
    }, 2200);
}

function closeScheduleEditScopeModal() {
    const modal = document.getElementById('scheduleEditScopeModal');
    if (modal) modal.classList.remove('active');
    pendingScheduleEditRequest = null;
}

function showScheduleEditScopeModal(request, futureCount) {
    const modal = document.getElementById('scheduleEditScopeModal');
    const descriptionEl = document.getElementById('scheduleEditScopeDescription');
    if (!modal || !descriptionEl) return;
    pendingScheduleEditRequest = request;
    descriptionEl.textContent = `이 일정과 이어지는 이후 ${futureCount}개의 일정이 함께 감지되었습니다. 변경 범위를 선택해주세요.`;
    const defaultOption = modal.querySelector('input[name="scheduleEditScopeType"][value="single"]');
    if (defaultOption) defaultOption.checked = true;
    modal.classList.add('active');
    document.getElementById('btnScheduleEditScopeCancel').onclick = closeScheduleEditScopeModal;
    document.getElementById('btnScheduleEditScopeOk').onclick = async () => {
        const scope = modal.querySelector('input[name="scheduleEditScopeType"]:checked')?.value || 'single';
        const nextRequest = pendingScheduleEditRequest;
        closeScheduleEditScopeModal();
        if (nextRequest) await applyScheduleEdit(nextRequest, scope);
    };
}

function closeScheduleConflictModal() {
    const modal = document.getElementById('scheduleConflictModal');
    if (modal) modal.classList.remove('active');
    pendingScheduleConflict = null;
}

function showScheduleConflictModal(conflictData) {
    const modal = document.getElementById('scheduleConflictModal');
    const descriptionEl = document.getElementById('scheduleConflictDescription');
    if (!modal || !descriptionEl || !conflictData) return;
    const conflictNames = (conflictData.conflicts || [])
        .map((schedule) => String(schedule.clientName || '이름 없음').trim())
        .filter(Boolean)
        .slice(0, 3);
    const targetLabel = `${conflictData.newSchedule.date} ${String(conflictData.newSchedule.startTime || '').slice(0, 5)} - ${String(conflictData.newSchedule.endTime || '').slice(0, 5)}`;
    descriptionEl.textContent = `${targetLabel}에 ${conflictNames.join(', ') || '기존 일정'}과 겹칩니다.\n처리 방식을 선택해주세요.`;
    pendingScheduleConflict = conflictData;
    modal.classList.add('active');
    document.getElementById('btnConflictCancel').onclick = closeScheduleConflictModal;
    document.getElementById('btnConflictPush').onclick = () => resolveScheduleConflict('push');
    document.getElementById('btnConflictAdjust').onclick = () => resolveScheduleConflict('adjust');
    document.getElementById('btnConflictManual').onclick = () => resolveScheduleConflict('manual');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
    if (modalId === 'myPageModal') {
        syncKakaoContactFloatVisibility();
    }
    resetModalDirty();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
}

function safeCloseModal(event, modalId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (isModalDirty) {
        showConfirm('작성 중인 내용이 저장되지 않았습니다.\n정말 나가시겠습니까?', () => closeModal(modalId));
        return;
    }
    closeModal(modalId);
}

function initDirtyCheck() {
    document.querySelectorAll('.form-input, .form-select, .form-textarea, .day-chip, input[type="checkbox"], input[type="radio"]').forEach((input) => {
        input.addEventListener('change', markModalDirty);
        input.addEventListener('input', markModalDirty);
    });
}

function toggleDayChip(el) {
    if (!el) return;
    el.classList.toggle('active');
    markModalDirty();
}

function updateSidebarCounts() {
    const clientCount = getVisibleClientsByType('client').length;
    const reserveCount = getVisibleClientsByType('reserve').length;
    const profile = window.currentProfile || {};
    const maxLimitRaw = profile.maxClientLimit ?? profile.max_client_limit ?? 80;
    const maxLimit = Number(maxLimitRaw) > 0 ? Number(maxLimitRaw) : 80;
    const registeredRatio = maxLimit > 0 ? (clientCount / maxLimit) * 100 : 0;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('schedClientCount', String(clientCount));
    setText('schedReserveCount', String(reserveCount));
    setText('schedClientRegistered', `${clientCount} / ${maxLimit}`);
    const gauge = document.getElementById('schedClientGaugeFill');
    if (gauge) gauge.style.width = `${Math.max(0, Math.min(100, registeredRatio))}%`;
    updateMyPageProfileView();
}

function updateAlphabetIndex() {
    const activeList = document.querySelector('.schedule-list.active');
    const indexContainer = document.querySelector('.alphabet-index');
    if (!activeList || !indexContainer) return;
    indexContainer.innerHTML = '';
    activeList.querySelectorAll('.list-section-header').forEach((header) => {
        const char = header.innerText.trim();
        const link = document.createElement('a');
        link.innerText = char;
        link.onclick = () => scrollToIdx(char);
        indexContainer.appendChild(link);
    });
}

function scrollToIdx(char) {
    const activeTab = document.querySelector('.schedule-list.active');
    if (!activeTab) return;
    const prefix = activeTab.id === 'sched-reservations' ? 'idx-res-' : 'idx-client-';
    const targetElement = document.getElementById(prefix + char);
    if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function startOfWeek(date) {
    const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    base.setDate(base.getDate() - base.getDay());
    return base;
}

function endOfWeek(date) {
    return addDaysLocal(startOfWeek(date), 6);
}

function isSameDate(a, b) {
    return a instanceof Date && b instanceof Date
        && a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function formatMonthTitle(date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function formatWeekTitle(date) {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    if (start.getMonth() === end.getMonth()) {
        return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getDate()}일`;
    }
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
}

function formatDayTitle(date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatTimeLabel(hour, minute = 0) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getScheduleDateObject(schedule) {
    return parseLocalDateInput(schedule.date);
}

function getVisibleSchedules() {
    return (window.appSchedules || []).filter((schedule) => {
        const status = String(schedule.status || '').toLowerCase();
        return !['deleted', 'canceled', 'cancelled'].includes(status);
    });
}

function getSchedulesForDate(date) {
    return getVisibleSchedules()
        .filter((schedule) => {
            const scheduleDate = getScheduleDateObject(schedule);
            return scheduleDate && isSameDate(scheduleDate, date);
        })
        .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')));
}

const BIRTHDAY_NOTICE_DAYS = 7;

function getDateDiffInDays(fromDate, toDate) {
    if (!(fromDate instanceof Date) || !(toDate instanceof Date)) return 0;
    const fromUtc = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const toUtc = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    return Math.round((toUtc - fromUtc) / 86400000);
}

function getClientBirthdayDateForYear(client, year) {
    const dob = parseLocalDateInput(client?.dob);
    if (!dob) return null;
    if (String(client?.dobPrecision || client?.dob_precision || '').toLowerCase() === 'year') return null;

    const month = dob.getMonth();
    const day = dob.getDate();
    const birthday = new Date(year, month, day);
    if (birthday.getMonth() !== month) {
        return month === 1 && day === 29 ? new Date(year, 1, 28) : null;
    }
    return birthday;
}

function getUpcomingBirthdayMeta(client, fromDate = new Date()) {
    const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    let birthday = getClientBirthdayDateForYear(client, today.getFullYear());
    if (!birthday) return null;
    let daysUntil = getDateDiffInDays(today, birthday);
    if (daysUntil < 0) {
        birthday = getClientBirthdayDateForYear(client, today.getFullYear() + 1);
        if (!birthday) return null;
        daysUntil = getDateDiffInDays(today, birthday);
    }

    const label = daysUntil === 0 ? '오늘 생일' : `D-${daysUntil}`;
    const state = daysUntil === 0 ? 'today' : daysUntil <= 3 ? 'soon' : 'upcoming';
    return {
        birthday,
        daysUntil,
        label,
        state,
        isInNoticeWindow: daysUntil >= 0 && daysUntil <= BIRTHDAY_NOTICE_DAYS
    };
}

function getBirthdayClientsForDate(date) {
    if (!(date instanceof Date)) return [];
    return getVisibleClientsByType('client')
        .map((client) => ({
            client,
            birthday: getClientBirthdayDateForYear(client, date.getFullYear())
        }))
        .filter((entry) => entry.birthday && isSameDate(entry.birthday, date))
        .sort((a, b) => String(a.client.name || '').localeCompare(String(b.client.name || '')))
        .map((entry) => entry.client);
}

function buildBirthdayDateMarkup(date, limit = 3) {
    const birthdayClients = getBirthdayClientsForDate(date);
    if (!birthdayClients.length) return '';
    const visible = birthdayClients.slice(0, limit);
    const hiddenCount = Math.max(0, birthdayClients.length - visible.length);
    const chips = visible.map((client) => `
        <div class="cal-birthday-chip" data-client-id="${escapeHtml(String(client.id || ''))}" title="${escapeHtml(client.name || '이름 없음')} 생일">
            <span class="cal-birthday-icon" aria-hidden="true">cake</span>
            <span class="cal-birthday-name">${escapeHtml(client.name || '이름 없음')}</span>
        </div>
    `).join('');
    const more = hiddenCount > 0 ? `<div class="cal-birthday-more">+${hiddenCount}명</div>` : '';
    return `<div class="cal-birthday-stack" aria-label="생일자">${chips}${more}</div>`;
}

function getBirthdaySortRank(client) {
    const meta = getUpcomingBirthdayMeta(client);
    if (!meta || !meta.isInNoticeWindow) return Number.POSITIVE_INFINITY;
    return meta.daysUntil;
}

function buildClientBirthdayBadge(client) {
    const meta = getUpcomingBirthdayMeta(client);
    if (!meta || !meta.isInNoticeWindow) return '';
    return `
        <span class="drag-birthday-badge is-${escapeHtml(meta.state)}" title="${escapeHtml(formatDateDisplay(meta.birthday))} 생일">
            <span class="material-symbols-outlined" aria-hidden="true">cake</span>
            <span>${escapeHtml(meta.label)}</span>
        </span>
    `;
}

function getScheduleTheme(schedule, index = 0) {
    if (schedule.type === 'reserve') {
        return {
            monthBg: '#FFF3E0',
            monthColor: '#EF6C00',
            monthBorder: '#FFE0B2',
            cardBg: '#FFF7ED',
            cardColor: '#C2410C',
            cardBorder: '#FED7AA'
        };
    }
    const themes = [
        {
            monthBg: '#E8F5E9',
            monthColor: '#2E7D32',
            monthBorder: '#C8E6C9',
            cardBg: '#ECFDF3',
            cardColor: '#166534',
            cardBorder: '#BBF7D0'
        },
        {
            monthBg: '#E3F2FD',
            monthColor: '#1565C0',
            monthBorder: '#BBDEFB',
            cardBg: '#EFF6FF',
            cardColor: '#1D4ED8',
            cardBorder: '#BFDBFE'
        },
        {
            monthBg: '#F3E8FF',
            monthColor: '#7C3AED',
            monthBorder: '#DDD6FE',
            cardBg: '#F5F3FF',
            cardColor: '#6D28D9',
            cardBorder: '#DDD6FE'
        }
    ];
    return themes[index % themes.length];
}

function buildTimeAxisMarkup() {
    return Array.from({ length: 24 }, (_, hour) => (
        `<div class="cal-time-label">${formatTimeLabel(hour)}</div>`
    )).join('');
}

function getTimeOffsetPx(timeValue) {
    const raw = String(timeValue || '').slice(0, 5);
    const [hour, minute] = raw.split(':').map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
    return ((hour * 60) + minute) / 60 * CALENDAR_SLOT_HEIGHT;
}

function getDurationHeightPx(schedule) {
    const durationMinutes = Math.max(30, calculateDurationMinutes(schedule.startTime, schedule.endTime) || 50);
    return Math.max(36, (durationMinutes / 60) * CALENDAR_SLOT_HEIGHT);
}

function renderMonthView() {
    const grid = document.getElementById('calendarMonthGrid');
    if (!grid) return;

    const base = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
    const gridStart = addDaysLocal(base, -base.getDay());
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let markup = '';

    for (let index = 0; index < 42; index += 1) {
        const cellDate = addDaysLocal(gridStart, index);
        const schedules = getSchedulesForDate(cellDate);
        const isOtherMonth = cellDate.getMonth() !== currentCalendarDate.getMonth();
        const isToday = isSameDate(cellDate, todayDate);
        const day = cellDate.getDay();
        const headerClasses = ['cal-cell-header'];
        if (day === 0) headerClasses.push('is-sunday');
        if (day === 6) headerClasses.push('is-saturday');
        if (isOtherMonth) headerClasses.push('is-muted');
        if (isToday) headerClasses.push('is-today');

        const eventsMarkup = schedules.slice(0, 3).map((schedule, eventIndex) => {
            const theme = getScheduleTheme(schedule, eventIndex);
            return `
                <div class="cal-month-event calendar-event-card-compact" data-schedule-id="${escapeHtml(String(schedule.id || ''))}" draggable="true" style="background:${theme.monthBg}; color:${theme.monthColor}; border-color:${theme.monthBorder};">
                    ${escapeHtml(String(schedule.startTime || '').slice(0, 5))} ${escapeHtml(schedule.clientName || '이름 없음')}
                </div>
            `;
        }).join('');

        const moreMarkup = schedules.length > 3
            ? `<div class="cal-month-more">+${schedules.length - 3}개 더보기</div>`
            : '';
        const birthdayMarkup = buildBirthdayDateMarkup(cellDate);

        markup += `
            <div class="cal-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}${birthdayMarkup ? ' has-birthday' : ''}" data-date="${formatDateLocal(cellDate)}">
                <div class="${headerClasses.join(' ')}">${cellDate.getDate()}</div>
                ${birthdayMarkup}
                <div class="cal-month-events">${eventsMarkup}${moreMarkup}</div>
            </div>
        `;
    }

    grid.innerHTML = markup;
}

function renderWeekHeader(headerId, dates, singleDay = false) {
    const header = document.getElementById(headerId);
    if (!header) return;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    header.innerHTML = dates.map((date) => {
        const dayIndex = date.getDay();
        const classes = ['cal-week-header-cell'];
        if (dayIndex === 0) classes.push('is-sunday');
        if (dayIndex === 6) classes.push('is-saturday');
        if (isSameDate(date, todayDate)) classes.push('is-today');
        const label = singleDay
            ? `${date.getMonth() + 1}월 ${date.getDate()}일 ${DAY_LABELS[dayIndex]}요일${isSameDate(date, todayDate) ? ' (오늘)' : ''}`
            : `${DAY_LABELS[dayIndex]} (${date.getDate()})`;
        return `<div class="${classes.join(' ')}">${label}</div>`;
    }).join('');
}

function renderTimeColumns(columnsId, dates) {
    const columns = document.getElementById(columnsId);
    if (!columns) return;

    columns.style.setProperty('--calendar-slot-height', `${CALENDAR_SLOT_HEIGHT}px`);
    columns.innerHTML = dates.map((date, columnIndex) => {
        const schedules = getSchedulesForDate(date);
        const birthdayMarkup = buildBirthdayDateMarkup(date, 4);
        const hourGridMarkup = Array.from({ length: 24 }, (_, hour) => (
            `<div class="cal-hour-slot" data-hour="${hour}"></div>`
        )).join('');
        const eventsMarkup = schedules.map((schedule, eventIndex) => {
            const theme = getScheduleTheme(schedule, eventIndex + columnIndex);
            const top = getTimeOffsetPx(schedule.startTime);
            const height = getDurationHeightPx(schedule);
            return `
                <div class="calendar-event-card" data-schedule-id="${escapeHtml(String(schedule.id || ''))}" draggable="true" style="top:${top}px; height:${height}px; background:${theme.cardBg}; color:${theme.cardColor}; border:1px solid ${theme.cardBorder};">
                    <span class="calendar-event-time">${escapeHtml(String(schedule.startTime || '').slice(0, 5))} - ${escapeHtml(String(schedule.endTime || '').slice(0, 5))}</span>
                    <span class="calendar-event-title">${escapeHtml(schedule.clientName || '이름 없음')}</span>
                </div>
            `;
        }).join('');
        return `<div class="cal-day-col${birthdayMarkup ? ' has-birthday' : ''}" data-date="${formatDateLocal(date)}"><div class="cal-hour-grid" aria-hidden="true">${hourGridMarkup}</div>${birthdayMarkup}${eventsMarkup}</div>`;
    }).join('');
}

function renderCurrentTimeLine(columnsId, dates) {
    const columns = document.getElementById(columnsId);
    if (!columns) return;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const top = ((today.getHours() * 60) + today.getMinutes()) / 60 * CALENDAR_SLOT_HEIGHT;

    dates.forEach((date, index) => {
        if (!isSameDate(date, todayDate)) return;
        const targetColumn = columns.children[index];
        if (!targetColumn) return;
        const label = `${formatTimeLabel(today.getHours(), today.getMinutes())}`;
        targetColumn.insertAdjacentHTML('beforeend', `
            <div class="calendar-now-line" style="top:${top}px;">
                <span class="calendar-now-label">${label}</span>
            </div>
        `);
    });
}

function autoScrollTimeGrid(wrapperId, dates) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const includesToday = dates.some((date) => isSameDate(date, todayDate));
    const targetTop = includesToday
        ? (((today.getHours() * 60) + today.getMinutes()) / 60 * CALENDAR_SLOT_HEIGHT) - (wrapper.clientHeight * 0.35)
        : (8 * CALENDAR_SLOT_HEIGHT) - 24;

    requestAnimationFrame(() => {
        wrapper.scrollTop = Math.max(0, targetTop);
    });
}

function renderWeekView() {
    const weekStart = startOfWeek(currentCalendarDate);
    const dates = Array.from({ length: 7 }, (_, index) => addDaysLocal(weekStart, index));
    const axis = document.getElementById('calendarWeekTimeAxis');
    if (axis) {
        axis.style.setProperty('--calendar-slot-height', `${CALENDAR_SLOT_HEIGHT}px`);
        axis.innerHTML = buildTimeAxisMarkup();
    }
    renderWeekHeader('calendarWeekHeader', dates, false);
    renderTimeColumns('calendarWeekColumns', dates);
    renderCurrentTimeLine('calendarWeekColumns', dates);
    autoScrollTimeGrid('calendarWeekTimeWrapper', dates);
}

function renderDayView() {
    const dates = [new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), currentCalendarDate.getDate())];
    const axis = document.getElementById('calendarDayTimeAxis');
    if (axis) {
        axis.style.setProperty('--calendar-slot-height', `${CALENDAR_SLOT_HEIGHT}px`);
        axis.innerHTML = buildTimeAxisMarkup();
    }
    renderWeekHeader('calendarDayHeader', dates, true);
    renderTimeColumns('calendarDayColumns', dates);
    renderCurrentTimeLine('calendarDayColumns', dates);
    autoScrollTimeGrid('calendarDayTimeWrapper', dates);
}

function updateCalendarTitle() {
    const title = document.getElementById('calendarTitle');
    if (!title) return;
    if (currentCalendarView === 'week') {
        title.textContent = formatWeekTitle(currentCalendarDate);
        return;
    }
    if (currentCalendarView === 'day') {
        title.textContent = formatDayTitle(currentCalendarDate);
        return;
    }
    title.textContent = formatMonthTitle(currentCalendarDate);
}

function renderCalendar() {
    syncCalendarViewUI();
    updateCalendarTitle();
    renderMonthView();
    renderWeekView();
    renderDayView();
    bindCalendarInteractions();
    persistShellViewState({
        calendarView: currentCalendarView,
        calendarDate: currentCalendarDate
    });
    if (currentClassOnboardingActive) renderClassOnboarding();
}

function moveCalendar(step) {
    const nextDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), currentCalendarDate.getDate());
    if (currentCalendarView === 'week') {
        nextDate.setDate(nextDate.getDate() + (step * 7));
    } else if (currentCalendarView === 'day') {
        nextDate.setDate(nextDate.getDate() + step);
    } else {
        nextDate.setMonth(nextDate.getMonth() + step, 1);
    }
    currentCalendarDate = nextDate;
    renderCalendar();
}

function openCalendarMonthPicker() {
    const picker = document.getElementById('calendarMonthPicker');
    if (!picker) return;
    picker.value = `${currentCalendarDate.getFullYear()}-${String(currentCalendarDate.getMonth() + 1).padStart(2, '0')}`;
    if (typeof picker.showPicker === 'function') {
        picker.showPicker();
        return;
    }
    picker.focus();
    picker.click();
}

function handleCalendarMonthPickerChange(value) {
    const text = String(value || '').trim();
    if (!/^\d{4}-\d{2}$/.test(text)) return;
    const [yearText, monthText] = text.split('-');
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;
    if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return;

    const day = currentCalendarDate.getDate();
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    currentCalendarDate = new Date(year, monthIndex, Math.min(day, lastDay));
    renderCalendar();
}

function goToToday() {
    const today = new Date();
    currentCalendarDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    renderCalendar();
}

function bindCalendarNavigation() {
    const prevBtn = document.getElementById('calendarPrevBtn');
    const nextBtn = document.getElementById('calendarNextBtn');
    const todayBtn = document.getElementById('calendarTodayBtn');
    const titleBtn = document.getElementById('calendarTitle');
    const monthPicker = document.getElementById('calendarMonthPicker');
    if (prevBtn && !prevBtn.dataset.bound) {
        prevBtn.dataset.bound = 'true';
        prevBtn.addEventListener('click', () => moveCalendar(-1));
    }
    if (nextBtn && !nextBtn.dataset.bound) {
        nextBtn.dataset.bound = 'true';
        nextBtn.addEventListener('click', () => moveCalendar(1));
    }
    if (todayBtn && !todayBtn.dataset.bound) {
        todayBtn.dataset.bound = 'true';
        todayBtn.addEventListener('click', goToToday);
    }
    if (titleBtn && !titleBtn.dataset.bound) {
        titleBtn.dataset.bound = 'true';
        titleBtn.addEventListener('click', openCalendarMonthPicker);
    }
    if (monthPicker && !monthPicker.dataset.bound) {
        monthPicker.dataset.bound = 'true';
        monthPicker.addEventListener('change', () => handleCalendarMonthPickerChange(monthPicker.value));
    }
}

function handleCalendarDragStart(type, id, event) {
    const normalizedId = String(id || '').trim();
    if (!normalizedId) return;
    if (type === 'client') {
        const client = findClientById(normalizedId);
        if (!client) return;
        calendarDragItem = { type: 'client', data: client };
    } else {
        const schedule = (window.appSchedules || []).find((item) => String(item.id) === normalizedId);
        if (!schedule) return;
        calendarDragItem = { type: 'schedule', data: schedule };
    }
    if (event?.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', `${type}:${normalizedId}`);
    }
    document.body.classList.add('calendar-dragging');
}

function clearCalendarDragState() {
    calendarDragItem = null;
    document.body.classList.remove('calendar-dragging');
    document.querySelectorAll('.calendar-drop-target').forEach((element) => element.classList.remove('calendar-drop-target'));
}

function getDropTimeFromPointer(column, event) {
    const wrapper = column.closest('.cal-time-wrapper');
    const rect = column.getBoundingClientRect();
    const wrapperScrollTop = wrapper ? wrapper.scrollTop : 0;
    const relativeY = (event.clientY - rect.top) + wrapperScrollTop;
    const rawMinutes = (relativeY / CALENDAR_SLOT_HEIGHT) * 60;
    const snappedMinutes = Math.round(rawMinutes / CALENDAR_DRAG_SNAP_MINUTES) * CALENDAR_DRAG_SNAP_MINUTES;
    return minutesToTime(Math.max(0, Math.min((23 * 60) + 50, snappedMinutes)));
}

async function handleCalendarDrop(targetDate, targetTime = '') {
    if (!window.supabaseClient || !calendarDragItem) return;
    const teacherId = getCurrentTeacherId();
    if (!teacherId) {
        showAlert('로그인 정보가 확인되지 않아 일정을 변경할 수 없습니다.');
        return;
    }

    if (calendarDragItem.type === 'client') {
        const client = calendarDragItem.data;
        const startTime = String(targetTime || SCHEDULE_START_TIME).slice(0, 5);
        const duration = Math.max(1, Number(client.sessionTime || 50) || 50);
        const endTime = addMinutesToTime(startTime, duration);
        const rangeCheck = validateScheduleWindow(startTime, endTime);
        if (!rangeCheck.ok) {
            showBottomToast(`${rangeCheck.message} (허용 범위 ${SCHEDULE_START_TIME}~${SCHEDULE_END_TIME})`);
            return;
        }

        const newSchedule = {
            teacherId,
            clientId: client.id,
            clientName: client.name,
            type: client.type || 'client',
            date: targetDate,
            startTime,
            endTime,
            status: 'scheduled',
            memo: null
        };
        const conflicts = getVisibleSchedules().filter((schedule) => (
            schedule.date === targetDate
            && checkTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)
        ));

        if (conflicts.length > 0) {
            showScheduleConflictModal({
                newSchedule,
                conflicts,
                detailClientId: client.id,
                manualAction: () => {
                    openClassRegistrationModal('calendar');
                    const select = document.getElementById('classClientSelect');
                    if (select) {
                        select.value = String(client.id);
                        currentClassModalClientId = String(client.id);
                    }
                    document.getElementById('classStartDate').value = targetDate;
                    document.getElementById('classStartTime').value = startTime;
                    syncClassRegistrationMode();
                }
            });
            return;
        }

        const { error } = await window.supabaseClient.from('schedules').insert([buildScheduleInsertPayload(newSchedule)]);
        if (error) {
            showAlert(`일정 저장 중 오류가 발생했습니다: ${error.message || error}`);
            return;
        }
        await refreshAfterScheduleMutation(client.id);
        showBottomToast('일정이 등록되었습니다.');
        return;
    }

    if (calendarDragItem.type === 'schedule') {
        const schedule = calendarDragItem.data;
        const duration = Math.max(1, calculateDurationMinutes(schedule.startTime, schedule.endTime) || 50);
        const startTime = String(targetTime || schedule.startTime || '').slice(0, 5);
        const endTime = addMinutesToTime(startTime, duration);
        const rangeCheck = validateScheduleWindow(startTime, endTime);
        if (!rangeCheck.ok) {
            showBottomToast(`${rangeCheck.message} (허용 범위 ${SCHEDULE_START_TIME}~${SCHEDULE_END_TIME})`);
            return;
        }

        const conflicts = getVisibleSchedules().filter((item) => (
            String(item.id) !== String(schedule.id)
            && item.date === targetDate
            && checkTimeOverlap(startTime, endTime, item.startTime, item.endTime)
        ));

        if (conflicts.length > 0) {
            showScheduleConflictModal({
                newSchedule: { ...schedule, date: targetDate, startTime, endTime },
                conflicts,
                originalSchedule: schedule,
                detailClientId: schedule.clientId || schedule.client_id || currentDetailClientId,
                manualAction: () => {
                    openEditClassModal(schedule.id);
                    document.getElementById('classStartDate').value = targetDate;
                    document.getElementById('classStartTime').value = startTime;
                }
            });
            return;
        }

        let updateQuery = window.supabaseClient.from('schedules').update({
            date: targetDate,
            start_time: startTime,
            end_time: endTime
        }).eq('id', schedule.id);
        if (teacherId) updateQuery = updateQuery.eq('teacher_id', teacherId);
        const { error } = await updateQuery;
        if (error) {
            showAlert(`일정 변경 중 오류가 발생했습니다: ${error.message || error}`);
            return;
        }
        await refreshAfterScheduleMutation(schedule.clientId || schedule.client_id || currentDetailClientId);
        showBottomToast('일정이 변경되었습니다.');
    }
}

function bindCalendarInteractions() {
    document.querySelectorAll('.calendar-event-card, .calendar-event-card-compact').forEach((card) => {
        const scheduleId = card.getAttribute('data-schedule-id');
        if (!scheduleId) return;
        card.addEventListener('click', () => openEditClassModal(scheduleId));
        card.addEventListener('dragstart', (event) => handleCalendarDragStart('schedule', scheduleId, event));
        card.addEventListener('dragend', clearCalendarDragState);
    });

    document.querySelectorAll('.cal-cell[data-date], .cal-day-col[data-date]').forEach((target) => {
        target.addEventListener('dragover', (event) => {
            if (!calendarDragItem) return;
            event.preventDefault();
            target.classList.add('calendar-drop-target');
        });
        target.addEventListener('dragleave', () => {
            target.classList.remove('calendar-drop-target');
        });
        target.addEventListener('drop', async (event) => {
            if (!calendarDragItem) return;
            event.preventDefault();
            target.classList.remove('calendar-drop-target');
            const targetDate = target.getAttribute('data-date');
            const targetTime = target.classList.contains('cal-day-col') ? getDropTimeFromPointer(target, event) : '';
            try {
                await handleCalendarDrop(targetDate, targetTime);
            } finally {
                clearCalendarDragState();
            }
        });
    });
}

function bindSidebarTabs() {
    const schedTabs = document.querySelectorAll('.schedule-sidebar-tab');
    const schedLists = document.querySelectorAll('.schedule-list');
    schedTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            schedTabs.forEach((item) => item.classList.remove('active'));
            schedLists.forEach((list) => list.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(tab.getAttribute('data-scheduletab'));
            if (target) target.classList.add('active');
            updateAlphabetIndex();
        });
    });
}

function bindSubTabs() {
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    subTabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            activateDetailSubTab(btn.getAttribute('data-subtarget') || 'sub-info');
        });
    });
}

function bindDetailReportModeControls() {
    const helpButton = document.getElementById('detailReportHelpBtn');
    if (helpButton && helpButton.dataset.bound !== 'true') {
        helpButton.dataset.bound = 'true';
        helpButton.addEventListener('click', openDetailReportHelpModal);
    }
    document.querySelectorAll('[data-detail-report-help-close]').forEach((button) => {
        if (button.dataset.bound === 'true') return;
        button.dataset.bound = 'true';
        button.addEventListener('click', closeDetailReportHelpModal);
    });
    document.querySelectorAll('.detail-report-mode-btn').forEach((button) => {
        if (button.dataset.bound === 'true') return;
        button.dataset.bound = 'true';
        button.addEventListener('click', () => {
            setDetailReportMode(button.getAttribute('data-report-mode') || 'teacher');
        });
    });
    document.querySelectorAll('.detail-report-action-btn').forEach((button) => {
        if (button.dataset.bound === 'true') return;
        button.dataset.bound = 'true';
        button.addEventListener('click', () => {
            const action = String(button.getAttribute('data-report-action') || '').trim();
            if (action === 'save' || action === 'print') {
                saveCurrentDetailReportAsJpg(button);
            } else if (action === 'copy') {
                copyCurrentDetailReportShareText();
            }
        });
    });
    syncDetailReportModeUI();
}

function bindViewToggles() {
    const viewToggles = document.querySelectorAll('.view-toggle');
    viewToggles.forEach((toggle, index) => {
        toggle.addEventListener('click', () => {
            const view = toggle.getAttribute('data-view') || ['month', 'week', 'day'][index];
            currentCalendarView = normalizeCalendarView(view);
            syncCalendarViewUI();
            renderCalendar();
        });
    });
}

function renderGroupedClientList(targetId, clients, type) {
    const listWrapper = document.getElementById(targetId);
    if (!listWrapper) return;
    listWrapper.innerHTML = '';

    const buildQuickStartMarkup = () => `
        <span class="schedule-lab-quickstart-copy">
            <strong>LAB 시작</strong>
        </span>
        <span class="schedule-lab-quickstart-icon material-symbols-outlined" aria-hidden="true">arrow_forward</span>
    `;

    if (type === 'client') {
        const quickStart = document.createElement('button');
        quickStart.type = 'button';
        quickStart.className = 'schedule-lab-quickstart';
        if (isPendingTeacherGrade()) {
            quickStart.disabled = true;
            quickStart.title = PENDING_TEACHER_GRADE_MESSAGE;
            quickStart.onclick = showPendingTeacherGradeNotice;
        } else {
            quickStart.onclick = () => startAnonymousLabFromList();
        }
        quickStart.innerHTML = buildQuickStartMarkup();
        listWrapper.appendChild(quickStart);
    }

    if (!clients.length) {
        listWrapper.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-light); font-size: 14px;">${type === 'reserve' ? '등록된 예약자가 없습니다.' : '등록된 내담자가 없습니다.'}</div>`;
        if (type === 'client') {
            const quickStart = document.createElement('button');
            quickStart.type = 'button';
            quickStart.className = 'schedule-lab-quickstart';
            if (isPendingTeacherGrade()) {
                quickStart.disabled = true;
                quickStart.title = PENDING_TEACHER_GRADE_MESSAGE;
                quickStart.onclick = showPendingTeacherGradeNotice;
            } else {
                quickStart.onclick = () => startAnonymousLabFromList();
            }
            quickStart.innerHTML = buildQuickStartMarkup();
            listWrapper.prepend(quickStart);
        }
        return;
    }

    const birthdayRankMap = new Map();
    if (type === 'client') {
        clients.forEach((client) => {
            const rank = getBirthdaySortRank(client);
            if (Number.isFinite(rank)) birthdayRankMap.set(String(client.id || ''), rank);
        });
    }

    const birthdayClients = type === 'client'
        ? clients
            .filter((client) => birthdayRankMap.has(String(client.id || '')))
            .slice()
            .sort((a, b) => {
                const rankDiff = birthdayRankMap.get(String(a.id || '')) - birthdayRankMap.get(String(b.id || ''));
                if (rankDiff !== 0) return rankDiff;
                return String(a.name || '').localeCompare(String(b.name || ''));
            })
        : [];
    const birthdayIdSet = new Set(birthdayClients.map((client) => String(client.id || '')));

    const appendClientItem = (client) => {
        const item = document.createElement('div');
        const statusMeta = getClientStatusMeta(client, type);
        const isActive = String(client.id || '') === String(currentDetailClientId || '');
        const birthdayBadge = type === 'client' ? buildClientBirthdayBadge(client) : '';
        item.className = `draggable-item ${client.gender === 'female' ? 'gender-female' : 'gender-male'}${isActive ? ' active' : ''}${birthdayBadge ? ' has-birthday' : ''}`;
        item.dataset.clientId = String(client.id || '');
        item.draggable = true;
        if (statusMeta.dimmed) item.style.opacity = '0.5';
        item.onclick = (event) => openClientDetail(event.currentTarget, client);
        item.addEventListener('dragstart', (event) => handleCalendarDragStart('client', client.id, event));
        item.addEventListener('dragend', clearCalendarDragState);
        item.innerHTML = `
            <div class="drag-info">
                <span class="drag-name">
                    <span class="gender-dot"></span>
                    <span class="drag-name-text">${escapeHtml(client.name || '이름 없음')}</span>
                    ${birthdayBadge}
                    <span class="drag-age">${escapeHtml(getClientAgeText(client))}</span>
                </span>
                ${type !== 'client' && getClientSubtitle(client, type) ? `<span class="drag-sub">${escapeHtml(getClientSubtitle(client, type))}</span>` : ''}
            </div>
        `;
        listWrapper.appendChild(item);
    };

    if (birthdayClients.length) {
        const birthdayHeader = document.createElement('div');
        birthdayHeader.className = 'list-section-header birthday-section-header';
        birthdayHeader.id = buildListSectionId(type, '생일');
        birthdayHeader.textContent = '생일';
        listWrapper.appendChild(birthdayHeader);
        birthdayClients.forEach(appendClientItem);
    }

    const groupedClients = new Map();
    [...clients]
        .filter((client) => !birthdayIdSet.has(String(client.id || '')))
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
        .forEach((client) => {
            const initial = getChosung(client.name);
            if (!groupedClients.has(initial)) groupedClients.set(initial, []);
            groupedClients.get(initial).push(client);
        });

    [...groupedClients.keys()].sort((a, b) => a.localeCompare(b)).forEach((initial) => {
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'list-section-header';
        sectionHeader.id = buildListSectionId(type, initial);
        sectionHeader.textContent = initial;
        listWrapper.appendChild(sectionHeader);

        groupedClients.get(initial).forEach((client) => {
            appendClientItem(client);
        });
    });

    adjustClientNameLayout(listWrapper);
}

function renderClientList() {
    renderGroupedClientList('sched-clients', getVisibleClientsByType('client'), 'client');
    updateAlphabetIndex();
    updateSidebarCounts();
    if (currentClassOnboardingActive) renderClassOnboarding();
}

function renderReservationList() {
    renderGroupedClientList('sched-reservations', getVisibleClientsByType('reserve'), 'reserve');
    updateAlphabetIndex();
    updateSidebarCounts();
}

function fillText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function isPendingTeacherGrade(profile = window.currentProfile || {}) {
    const status = String(profile?.status || '').trim().toLowerCase();
    return PENDING_TEACHER_GRADE_STATUSES.has(status);
}

function showPendingTeacherGradeNotice() {
    showBottomToast(PENDING_TEACHER_GRADE_MESSAGE);
}

function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function formatDisplayDateOnly(value) {
    if (!value) return '-';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        return formatDateDisplay(value.trim());
    }
    const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return '-';
    return formatDateDisplay(parsed);
}

function getFutureScheduleCount() {
    const today = formatDateLocal(new Date());
    return (window.appSchedules || []).filter((schedule) => {
        const status = String(schedule.status || '').toLowerCase();
        if (['deleted', 'canceled', 'cancelled'].includes(status)) return false;
        return String(schedule.date || '') >= today;
    }).length;
}

function getTeacherSubscriptionSummary(profile = {}) {
    return {
        planBadge: 'FREE',
        planName: '무료 이용 중',
        stateLabel: '학생 무료 등록 가능',
        maxLimit: '무제한',
        summaryLabel: '하하랩은 현재 모든 콘텐츠와 학생 등록을 무료로 제공합니다.',
        nextBillingLabel: '계속 무료',
        lastPaidLabel: '-',
        paymentMethodLabel: '무료 등록 가능'
    };
}

function updateMyPageProfileView() {
    const profile = window.currentProfile;
    if (!profile) return;

    const clientCount = getVisibleClientsByType('client').length;
    const reserveCount = getVisibleClientsByType('reserve').length;
    const futureScheduleCount = getFutureScheduleCount();
    const subscription = getTeacherSubscriptionSummary(profile);
    const email = String(profile.email || '').trim() || '-';
    const contact = String(profile.contact || '').trim();
    const genderRaw = String(profile.gender || '').trim().toLowerCase();
    const genderValue = genderRaw === '여성' ? 'female' : genderRaw === '남성' ? 'male' : genderRaw;
    const lastSeen = profile.lastSeen ?? profile.last_seen;

    const avatar = document.querySelector('.profile-avatar-large');
    if (avatar) avatar.textContent = (profile.name || '?').charAt(0);

    fillText('myPageProfileName', profile.name || '-');
    fillText('myPageProfileCenter', profile.center || '소속 센터 없음');
    fillText('myPageProfilePeriod', subscription.summaryLabel);
    fillText('myPagePlanChip', subscription.planBadge);
    fillText('myPageStatusChip', subscription.stateLabel);
    fillText('myPageClientCapacity', `${clientCount} / ${subscription.maxLimit}명`);
    fillText('myPageReserveSchedule', `${reserveCount}명 / ${futureScheduleCount}건`);
    fillText('myPageStatusSummary', `${subscription.planName} · ${subscription.stateLabel}`);
    fillText('myPageStatusHelp', '현재 하하랩은 모든 내담자를 무료로 등록할 수 있습니다.');
    fillText('myPageLastPaidAt', subscription.lastPaidLabel);
    fillText('myPageCapacityText', `${clientCount} / ${subscription.maxLimit}명`);
    fillText('myPageReserveScheduleDetail', `${reserveCount}명 / ${futureScheduleCount}건`);

    setInputValue('myPageFieldCenter', profile.center || '');
    setInputValue('myPageFieldName', profile.name || '');
    setInputValue('myPageFieldLoginId', email);
    setInputValue('myPageFieldContact', contact ? formatPhoneNumber(contact) : '');
    setInputValue('myPageFieldGender', genderValue);
    setInputValue('myPageFieldAge', profile.age || '');
    setInputValue('myPageFieldLastSeen', formatDateTimeDisplay(lastSeen));

    fillText('myPageBillingBadge', subscription.planBadge);
    fillText('myPageBillingPlanName', subscription.planName);
    fillText('myPageBillingLimit', '내담자 등록도 현재 무료로 이용할 수 있습니다.');
    fillText('myPageBillingStatus', subscription.stateLabel);
    fillText('myPageBillingNextPayment', subscription.nextBillingLabel);
    fillText('myPageBillingPaymentMethod', subscription.paymentMethodLabel);
}

function openWithdrawalRetentionPage() {
    const next = new URL('../teacher-withdrawal-retention.html', window.location.href);
    next.searchParams.set('returnUrl', 'class-new.html');
    window.location.href = next.href;
}

function getTeacherWithdrawalStats() {
    const clients = Array.isArray(window.appClients) ? window.appClients : [];
    const schedules = Array.isArray(window.appSchedules) ? window.appSchedules : [];
    const activeClientCount = clients.filter((client) => {
        const type = String(client?.type || 'client').toLowerCase();
        const status = String(client?.status || '').toLowerCase();
        return type === 'client' && !['deleted', 'terminated'].includes(status);
    }).length;
    const reserveClientCount = clients.filter((client) => {
        const type = String(client?.type || 'client').toLowerCase();
        const status = String(client?.status || '').toLowerCase();
        return type === 'reserve' && !['deleted', 'terminated'].includes(status);
    }).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureScheduleCount = schedules.filter((schedule) => {
        const status = String(schedule?.status || '').toLowerCase();
        if (['deleted', 'cancelled', 'canceled', 'completed'].includes(status)) return false;
        const date = new Date(`${schedule?.date || ''}T00:00:00`);
        if (Number.isNaN(date.getTime())) return false;
        return date >= today;
    }).length;
    return {
        activeClientCount,
        reserveClientCount,
        futureScheduleCount,
        hasPendingOperations: activeClientCount > 0 || reserveClientCount > 0 || futureScheduleCount > 0
    };
}

function setTeacherWithdrawalError(message = '') {
    const errorEl = document.getElementById('withdrawalErrorMessage');
    if (!errorEl) return;
    const text = String(message || '').trim();
    errorEl.textContent = text;
    errorEl.classList.toggle('active', Boolean(text));
}

function resetTeacherWithdrawalForm() {
    [
        'withdrawalConfirmDelete',
        'withdrawalConfirmRetention',
        'withdrawalConfirmIrreversible',
        'withdrawalConfirmForceCleanup'
    ].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.checked = false;
    });
    const reasonEl = document.getElementById('withdrawalReason');
    const textEl = document.getElementById('withdrawalConfirmationText');
    if (reasonEl) reasonEl.value = '';
    if (textEl) textEl.value = '';
    setTeacherWithdrawalError('');
    updateTeacherWithdrawalState();
}

function openTeacherWithdrawalModal() {
    const modal = document.getElementById('teacherWithdrawalModal');
    if (!modal) return;
    const stats = getTeacherWithdrawalStats();
    const fillText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };
    fillText('withdrawalActiveClientCount', `${stats.activeClientCount}명`);
    fillText('withdrawalReserveClientCount', `${stats.reserveClientCount}명`);
    fillText('withdrawalFutureScheduleCount', `${stats.futureScheduleCount}건`);
    const forceItem = document.getElementById('withdrawalForceCleanupItem');
    if (forceItem) forceItem.style.display = stats.hasPendingOperations ? 'flex' : 'none';
    modal.dataset.hasPendingOperations = stats.hasPendingOperations ? 'true' : 'false';
    resetTeacherWithdrawalForm();
    modal.classList.add('active');
}

function closeTeacherWithdrawalModal() {
    const modal = document.getElementById('teacherWithdrawalModal');
    if (modal) modal.classList.remove('active');
    setTeacherWithdrawalError('');
}

function updateTeacherWithdrawalState() {
    const modal = document.getElementById('teacherWithdrawalModal');
    const hasPendingOperations = modal?.dataset?.hasPendingOperations === 'true';
    const confirmDelete = Boolean(document.getElementById('withdrawalConfirmDelete')?.checked);
    const confirmRetention = Boolean(document.getElementById('withdrawalConfirmRetention')?.checked);
    const confirmIrreversible = Boolean(document.getElementById('withdrawalConfirmIrreversible')?.checked);
    const confirmForceCleanup = Boolean(document.getElementById('withdrawalConfirmForceCleanup')?.checked);
    const confirmationText = String(document.getElementById('withdrawalConfirmationText')?.value || '').trim();
    const ready = confirmDelete
        && confirmRetention
        && confirmIrreversible
        && (!hasPendingOperations || confirmForceCleanup)
        && confirmationText === '탈퇴합니다';
    const submitButton = document.getElementById('withdrawalSubmitButton');
    if (submitButton) submitButton.disabled = !ready;
}

async function callTeacherWithdrawalManager(payload) {
    const client = window.supabaseClient;
    if (!client?.auth?.getSession) throw new Error('AUTH_CLIENT_MISSING');
    const { data } = await client.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (!accessToken) throw new Error('AUTH_REQUIRED');
    const baseUrl = typeof SUPABASE_URL !== 'undefined'
        ? SUPABASE_URL
        : 'https://gxungzlecmibgvykoiib.supabase.co';
    const functionName = typeof TEACHER_AUTH_MANAGER_FUNCTION !== 'undefined'
        ? TEACHER_AUTH_MANAGER_FUNCTION
        : 'teacher-auth-manager';
    const response = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ action: 'withdraw_account', ...(payload || {}) })
    });
    let result = null;
    try {
        result = await response.json();
    } catch (_) {
        result = null;
    }
    if (!response.ok || result?.error || result?.ok === false) {
        const error = new Error(result?.message || result?.error || `HTTP_${response.status}`);
        error.payload = result || null;
        throw error;
    }
    return result || {};
}

async function submitTeacherWithdrawal() {
    updateTeacherWithdrawalState();
    const submitButton = document.getElementById('withdrawalSubmitButton');
    if (!submitButton || submitButton.disabled) {
        setTeacherWithdrawalError('필수 확인 항목을 모두 체크하고 확인 문구 “탈퇴합니다”를 정확히 입력해 주세요.');
        return;
    }
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '처리 중...';
    setTeacherWithdrawalError('');
    try {
        const result = await callTeacherWithdrawalManager({
            reason: String(document.getElementById('withdrawalReason')?.value || '').trim(),
            confirmationText: String(document.getElementById('withdrawalConfirmationText')?.value || '').trim(),
            confirmDelete: Boolean(document.getElementById('withdrawalConfirmDelete')?.checked),
            confirmRetention: Boolean(document.getElementById('withdrawalConfirmRetention')?.checked),
            confirmIrreversible: Boolean(document.getElementById('withdrawalConfirmIrreversible')?.checked),
            confirmForceCleanup: Boolean(document.getElementById('withdrawalConfirmForceCleanup')?.checked)
        });
        if (result?.ok === false) throw new Error(result?.message || 'WITHDRAW_FAILED');
        if (window.supabaseClient?.auth?.signOut) {
            await window.supabaseClient.auth.signOut();
        }
        closeTeacherWithdrawalModal();
        showAlert('탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.', () => {
            window.location.replace('./index.html');
        });
    } catch (error) {
        console.error('[Withdrawal] failed:', error);
        const code = String(error?.message || '');
        const message = code === 'AUTH_REQUIRED' || code === 'AUTH_CLIENT_MISSING'
            ? '로그인 정보가 만료되었습니다. 다시 로그인 후 시도해 주세요.'
            : '탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        setTeacherWithdrawalError(message);
        submitButton.disabled = false;
        submitButton.textContent = originalText || '탈퇴 진행';
        updateTeacherWithdrawalState();
    }
}

function setProfileEditMode(enabled) {
    myPageProfileEditMode = Boolean(enabled);
    document.querySelectorAll('#tab-profile .mypage-editable-field').forEach((field) => {
        const isSelect = field.tagName === 'SELECT';
        field.classList.toggle('mypage-editable-disabled', !myPageProfileEditMode);
        if (isSelect) {
            field.disabled = !myPageProfileEditMode;
        } else {
            field.readOnly = !myPageProfileEditMode;
        }
    });

    const button = document.getElementById('myPageProfileEditButton');
    if (button) button.textContent = myPageProfileEditMode ? '저장' : '정보 수정';
}

function syncMyPageSettingsControls() {
    const profile = window.currentProfile || {};
    setInputValue('myPageSettingDefaultSessionTime', String(Number(profile.defaultSessionTime ?? profile.default_session_time) || 50));

    const alertBefore5 = Boolean(profile.alertBefore5 ?? profile.alert_before_5 ?? true);
    const showTerminated = Boolean(profile.showTerminatedClients ?? profile.show_terminated_clients ?? false);
    const alertCheckbox = document.getElementById('myPageSettingAlertBefore5');
    const hideTerminatedCheckbox = document.getElementById('myPageSettingHideTerminated');
    if (alertCheckbox) alertCheckbox.checked = alertBefore5;
    if (hideTerminatedCheckbox) hideTerminatedCheckbox.checked = !showTerminated;
}

async function updateClassSettings(field, value, changedLabel, changedValueLabel) {
    const profile = window.currentProfile;
    if (!profile?.id || !window.supabaseClient) {
        showAlert('설정 정보를 저장할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    const payload = { [field]: value };
    let updateQuery = window.supabaseClient.from('teachers').update(payload).eq('id', profile.id);
    const teacherId = String(profile.teacherId || profile.teacher_id || '').trim();
    if (teacherId) updateQuery = updateQuery.eq('teacher_id', teacherId);
    const { error } = await updateQuery;
    if (error) {
        showAlert(`설정 저장 중 오류가 발생했습니다: ${error.message}`);
        syncMyPageSettingsControls();
        return;
    }

    Object.assign(window.currentProfile, payload);
    if (typeof window.persistTeacherSession === 'function') {
        window.currentProfile = window.persistTeacherSession(window.currentProfile);
    }
    if (field === 'show_terminated_clients') {
        renderClientList();
        renderReservationList();
    }
    showBottomToast(`${changedLabel}이(가) ${changedValueLabel}로 변경되었습니다.`);
}

function bindMyPageSettingsHandlers() {
    const defaultSessionSelect = document.getElementById('myPageSettingDefaultSessionTime');
    const alertBeforeCheckbox = document.getElementById('myPageSettingAlertBefore5');
    const hideTerminatedCheckbox = document.getElementById('myPageSettingHideTerminated');

    if (defaultSessionSelect && !defaultSessionSelect.dataset.bound) {
        defaultSessionSelect.dataset.bound = 'true';
        defaultSessionSelect.addEventListener('change', () => {
            const value = Number(defaultSessionSelect.value) || 50;
            updateClassSettings('default_session_time', value, '기본 수업 시간', `${value}분`);
        });
    }

    if (alertBeforeCheckbox && !alertBeforeCheckbox.dataset.bound) {
        alertBeforeCheckbox.dataset.bound = 'true';
        alertBeforeCheckbox.addEventListener('change', () => {
            updateClassSettings('alert_before_5', alertBeforeCheckbox.checked, '수업 시작 5분 전 알림', alertBeforeCheckbox.checked ? '켜짐' : '꺼짐');
        });
    }

    if (hideTerminatedCheckbox && !hideTerminatedCheckbox.dataset.bound) {
        hideTerminatedCheckbox.dataset.bound = 'true';
        hideTerminatedCheckbox.addEventListener('change', () => {
            updateClassSettings('show_terminated_clients', !hideTerminatedCheckbox.checked, '종결 내담자 숨기기', hideTerminatedCheckbox.checked ? '켜짐' : '꺼짐');
        });
    }
}

function findClientById(clientId) {
    return (window.appClients || []).find((client) => String(client.id) === String(clientId)) || null;
}

function toggleDetailTabVisibility(client) {
    const reportTargets = ['sub-cardlab', 'sub-numlab', 'sub-playlab', 'sub-musicartlab', 'sub-rehab', 'sub-assessment'];
    document.querySelectorAll('.sub-tab-btn').forEach((button) => {
        const target = button.getAttribute('data-subtarget');
        if (reportTargets.includes(target)) {
            button.style.display = client.type === 'client' ? '' : 'none';
        }
    });
}

function renderDetailInfo(client) {
    const guardians = normalizeGuardians(client.guardians);
    const firstGuardian = guardians[0] || {};
    const areaText = flattenAreas(client.areas).join(', ') || '-';
    const dobText = client.dob ? `${formatDateDisplay(client.dob)} (${getClientAgeText(client)})` : getClientAgeText(client);
    fillText('disp-name', client.name || '-');
    fillText('disp-type', client.type === 'reserve' ? '상담예약자' : '내담자');
    fillText('disp-gender', client.gender === 'female' ? '여' : client.gender === 'male' ? '남' : '-');
    fillText('disp-dob-age', dobText || '-');
    fillText('disp-contact', formatPhoneNumber(client.contact));
    fillText('disp-session-time', `${Number(client.sessionTime || 50) || 50}분`);
    fillText('disp-zip-code', client.zipCode || '-');
    fillText('disp-address', client.address || '-');
    fillText('disp-address-detail', client.addressDetail || '-');
    fillText('disp-guardian-name', firstGuardian.name || '-');
    fillText('disp-guardian-relation', firstGuardian.relation || '-');
    fillText('disp-guardian-contact', firstGuardian.contact ? formatPhoneNumber(firstGuardian.contact) : '-');
    fillText('disp-areas', areaText);
    fillText('disp-diagnosis', client.diagnosis || '-');
    fillText('disp-initial-consult', client.initialConsult || '-');
    fillText('disp-memo', client.memo || '-');
}

function getClientSchedules(clientId) {
    return (window.appSchedules || [])
        .filter((schedule) => String(schedule.clientId || schedule.client_id || '') === String(clientId))
        .filter((schedule) => String(schedule.status || '').toLowerCase() !== 'deleted');
}

function formatDetailScheduleHeaderDate(dateLike) {
    const date = dateLike instanceof Date ? dateLike : parseLocalDateInput(dateLike);
    if (!date || Number.isNaN(date.getTime())) return '';
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function formatDetailScheduleWeekLabel(weekStart) {
    const startDate = weekStart instanceof Date ? weekStart : parseLocalDateInput(weekStart);
    if (!startDate || Number.isNaN(startDate.getTime())) return '';
    const endDate = addDaysLocal(startDate, 6);
    return `${formatDateLocal(startDate).replace(/-/g, '.')} - ${formatDateLocal(endDate).replace(/-/g, '.')}`;
}

function syncDetailScheduleWeekLabel() {
    const labelEl = document.getElementById('detailScheduleWeekLabel');
    if (!labelEl) return;
    labelEl.textContent = formatDetailScheduleWeekLabel(startOfWeek(currentDetailScheduleDate || new Date()));
}

function moveDetailScheduleWeek(step = 0) {
    const offset = Number(step) || 0;
    const baseDate = currentDetailScheduleDate instanceof Date ? currentDetailScheduleDate : new Date();
    currentDetailScheduleDate = addDaysLocal(baseDate, offset * 7);
    persistShellViewState({ detailScheduleDate: currentDetailScheduleDate });
    const client = getCurrentDetailClient();
    if (!client) return;
    renderDetailWeeklyBoard(client);
}

function renderDetailWeeklyBoard(client) {
    const board = document.getElementById('detailWeeklyBoard');
    if (!board) return;

    syncDetailScheduleWeekLabel();

    const schedules = getClientSchedules(client.id);
    if (!schedules.length) {
        board.innerHTML = `
            <div class="detail-report-empty">
                <span class="material-symbols-outlined">event_busy</span>
                <p>등록된 스케줄이 없습니다.\n스케줄을 등록해서 편리하게 관리하세요.</p>
            </div>
        `;
        return;
    }

    const weekStart = startOfWeek(currentDetailScheduleDate || new Date());
    const weekDates = Array.from({ length: 7 }, (_, index) => addDaysLocal(weekStart, index));
    const todayDate = new Date();
    const hasSchedulesThisWeek = schedules.some((schedule) => {
        const date = parseLocalDateInput(schedule.date);
        return date && weekDates.some((weekDate) => isSameDate(date, weekDate));
    });

    board.innerHTML = weekDates.map((weekDate, index) => {
        const label = WEEKDAY_COLUMNS[index];
        const daySchedules = schedules
            .filter((schedule) => {
                const date = parseLocalDateInput(schedule.date);
                return date && isSameDate(date, weekDate);
            })
            .sort((left, right) => String(left.startTime || '').localeCompare(String(right.startTime || '')));

        const uniqueSchedules = Array.from(
            new Map(
                daySchedules.map((schedule) => [
                    [
                        String(schedule.startTime || '').slice(0, 5),
                        String(schedule.endTime || '').slice(0, 5),
                        String(schedule.memo || '').trim()
                    ].join('|'),
                    schedule
                ])
            ).values()
        );

        const cards = uniqueSchedules.map((schedule) => {
            const runtimeStatus = getRuntimeScheduleStatus(schedule);
            const statusText = runtimeStatus === 'noshow' ? '미출석' : runtimeStatus === 'completed' ? '완료' : runtimeStatus === 'in-progress' ? '진행중' : '';
            return `
                <div class="class-card" data-schedule-id="${escapeHtml(schedule.id)}" data-client-id="${escapeHtml(client.id)}" onclick="openEditClassModal('${escapeHtml(schedule.id)}')">
                    ${schedule.memo && /격주/.test(String(schedule.memo)) ? '<div class="badge-biweekly">격주</div>' : ''}
                    <div class="class-time">${escapeHtml(String(schedule.startTime || '').slice(0, 5))}</div>
                    ${statusText ? `<div class="class-info">${escapeHtml(statusText)}</div>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="day-column${isSameDate(weekDate, todayDate) ? ' today' : ''}">
                <div class="day-header">
                    <span class="day-header-date">${formatDetailScheduleHeaderDate(weekDate)}</span>
                    <span class="day-header-weekday">${label}</span>
                </div>
                ${cards}
            </div>
        `;
    }).join('') + (!hasSchedulesThisWeek ? `
        <div class="detail-weekly-board-empty">
            <span class="material-symbols-outlined">event_upcoming</span>
            <p>선택한 주에는 등록된 수업이 없습니다.</p>
        </div>
    ` : '');
}

function renderAttendanceList(client) {
    const list = document.getElementById('detailAttendanceList');
    if (!list) return;

    const items = getClientSchedules(client.id)
        .map((schedule) => ({ ...schedule, runtimeStatus: getRuntimeScheduleStatus(schedule) }))
        .filter((schedule) => ['completed', 'noshow'].includes(schedule.runtimeStatus))
        .sort((left, right) => {
            const leftKey = `${left.date} ${String(left.startTime || '').slice(0, 5)}`;
            const rightKey = `${right.date} ${String(right.startTime || '').slice(0, 5)}`;
            return rightKey.localeCompare(leftKey);
        })
        .slice(0, DETAIL_REPORT_LIMIT);

    if (!items.length) {
        list.innerHTML = `
            <div class="detail-report-empty">
                <span class="material-symbols-outlined">event_busy</span>
                <p>출석 완료 또는 미출석으로 기록된 일정이 아직 없습니다.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map((schedule) => `
        <div class="detail-attendance-item">
            <div class="detail-attendance-meta">
                <span class="detail-attendance-date">${escapeHtml(formatDateDisplay(schedule.date, true))}</span>
                <span class="detail-attendance-time">${escapeHtml(String(schedule.startTime || '').slice(0, 5))} - ${escapeHtml(String(schedule.endTime || '').slice(0, 5))}</span>
            </div>
            <span class="status-badge ${schedule.runtimeStatus === 'noshow' ? 'status-pause' : 'status-active'}">${schedule.runtimeStatus === 'noshow' ? '미출석' : '출석 완료'}</span>
        </div>
    `).join('');
}

function renderEmptyReport(containerId, icon, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
    container.innerHTML = `
        <div class="detail-report-empty">
            <span class="material-symbols-outlined">${escapeHtml(icon)}</span>
            <p>${safeMessage}</p>
        </div>
    `;
}

function renderReportLoadError(containerId, message = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="detail-report-empty detail-report-load-error" role="alert">
            <span class="material-symbols-outlined">cloud_off</span>
            <p>${escapeHtml(message || '리포트 기록을 불러오지 못했습니다.')}</p>
            <button type="button" class="detail-report-retry-button" onclick="retryCurrentDetailReports()">
                <span class="material-symbols-outlined">refresh</span>
                다시 시도
            </button>
        </div>
    `;
}

async function retryCurrentDetailReports() {
    const client = getCurrentDetailClient();
    if (!client) return;
    await loadDetailSupplementalData(client);
}

function renderAssessmentPlaceholder(containerId, message = '준비중입니다.') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="detail-playlab-opinion-card detail-assessment-placeholder">
            <div class="detail-playlab-opinion-head">
                <div class="detail-report-head-main">
                    <p class="detail-playlab-section-kicker">ASSESSMENT</p>
                    <h4 class="detail-playlab-opinion-title">검사 · 척도</h4>
                    <p class="detail-playlab-chart-desc detail-report-hero-desc">표준화 검사 결과, 척도 변화, 상담 연계 기록을 한 화면에서 정리할 수 있도록 준비하고 있습니다.</p>
                </div>
                <div class="detail-playlab-opinion-tags detail-assessment-tags">
                    <span class="detail-playlab-opinion-tag is-strong">준비중</span>
                    <span class="detail-playlab-opinion-tag is-weak">추후 연동</span>
                </div>
            </div>
            <div class="detail-assessment-grid">
                <div class="detail-assessment-item">
                    <span class="detail-assessment-item-label">검사 결과 요약</span>
                    <strong class="detail-assessment-item-title">핵심 결과 한눈에 보기</strong>
                    <p class="detail-assessment-item-desc">기관별 주요 검사 결과를 요약 카드로 모아 빠르게 확인할 수 있게 준비 중입니다.</p>
                </div>
                <div class="detail-assessment-item">
                    <span class="detail-assessment-item-label">척도 변화 추적</span>
                    <strong class="detail-assessment-item-title">회기별 변화 흐름</strong>
                    <p class="detail-assessment-item-desc">초기 평가부터 재평가까지 점수 흐름을 비교해 경과를 쉽게 볼 수 있도록 준비 중입니다.</p>
                </div>
                <div class="detail-assessment-item">
                    <span class="detail-assessment-item-label">상담 연계 메모</span>
                    <strong class="detail-assessment-item-title">해석과 기록 연결</strong>
                    <p class="detail-assessment-item-desc">검사 결과와 상담 메모를 함께 연결해 임상 해석을 정리할 수 있도록 준비 중입니다.</p>
                </div>
            </div>
            <div class="detail-report-empty detail-assessment-empty">
                <span class="material-symbols-outlined">monitoring</span>
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
    `;
}

function isHeviHistoryRow(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const combined = [
        details.content_id,
        details.contentId,
        details.lab_label,
        details.labLabel,
        details.lab_title,
        details.labTitle,
        details.action_type,
        details.actionType,
        normalized.actionType,
        normalized.action_type,
        normalized.memo,
        metadata.lab_label,
        metadata.labLabel,
        metadata.action_type,
        metadata.actionType
    ].map((value) => String(value || '')).join(' ');
    return Boolean(details.h_evi_report || details.hEviReport || /h-?evi|표현 어휘 지수|표현 어휘력 평가/i.test(combined));
}

function getHeviReportFromHistoryRow(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const report = details.h_evi_report || details.hEviReport || null;
    return report && typeof report === 'object' ? report : null;
}

function formatHeviAccuracy(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return '-';
    if (numeric <= 1) return `${Math.round(numeric * 100)}%`;
    return `${Math.round(numeric)}%`;
}

function getHeviBandLabel(report = {}) {
    if (report?.band && typeof report.band === 'object') return String(report.band.label || '').trim();
    return String(report?.band || '').trim();
}

function buildHeviAssessmentEntries(rows = []) {
    return (Array.isArray(rows) ? rows : [])
        .map(normalizeLabHistoryRow)
        .filter(isHeviHistoryRow)
        .map((row, index) => {
            const report = getHeviReportFromHistoryRow(row);
            const details = row.details || {};
            const metadata = row.metadata || {};
            const playedAt = getHistoryPlayedAt(row);
            const mode = String(report?.mode || details.content_title || details.contentTitle || '').trim();
            const score = Number(report?.standardScore ?? details.score ?? metadata.score ?? 0) || 0;
            const accuracy = report?.accuracy ?? metadata.accuracy ?? 0;
            const correctCount = Number(report?.correct ?? details.correct_count ?? details.correctCount ?? 0) || 0;
            const wrongCount = Number(report?.wrong ?? details.wrong_count ?? details.wrongCount ?? 0) || 0;
            const totalQuestions = Number(report?.total ?? details.total_questions ?? details.totalQuestions ?? 0) || 0;
            const answered = Number(report?.answered ?? details.completed_count ?? details.completedCount ?? totalQuestions) || 0;
            const reportModeLabel = mode === 'diagnosis' || /평가|진단/.test(mode) ? '표현 어휘력 평가' : '진단 대비 학습';
            return {
                id: row.id || report?.runId || `hevi-history-${index + 1}`,
                row,
                report,
                playedAt,
                mode: mode === 'diagnosis' ? 'diagnosis' : mode === 'learning' ? 'learning' : (/평가|진단/.test(mode) ? 'diagnosis' : 'learning'),
                modeLabel: reportModeLabel,
                age: String(report?.age || details.level_title || details.levelTitle || '-').trim() || '-',
                score,
                accuracy,
                percentile: Number(report?.percentile || 0) || 0,
                bandLabel: getHeviBandLabel(report),
                correctCount,
                wrongCount,
                totalQuestions,
                answered,
                durationMinutes: getHistoryDurationMinutes(row),
                recommendation: String(report?.recommendation || buildRecommendationFromHeviReport(report) || '').trim(),
                guardianSummary: String(details.report_guardian_summary || details.reportGuardianSummary || metadata.report_guardian_summary || metadata.reportGuardianSummary || report?.guardianSummary || '').trim(),
                teacherReviewNote: String(details.report_teacher_review_note || details.reportTeacherReviewNote || metadata.report_teacher_review_note || metadata.reportTeacherReviewNote || report?.teacherReviewNote || '').trim(),
                actionPlanSummary: String(details.report_action_plan_summary || details.reportActionPlanSummary || metadata.report_action_plan_summary || metadata.reportActionPlanSummary || report?.actionPlanSummary || '').trim()
            };
        })
        .filter((entry) => entry.playedAt)
        .sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime());
}

function buildRecommendationFromHeviReport(report = null) {
    if (!report) return '';
    const score = Number(report.standardScore || 0) || 0;
    if (score >= 115) return '이번 기록에서 표현 어휘 인출 반응이 상대적으로 높았습니다. 단일 점수로 강점을 확정하지 않고 같은 평가 조건의 추가 기록과 함께 검토합니다.';
    if (score >= 90) return '연령 기대 범위의 수행으로, 누적 오답 단어 중심의 짧은 복습을 권장합니다.';
    if (score >= 80) return '경계 범위 수행으로, 의미 단서와 첫 음절 단서를 단계적으로 줄이는 중재가 필요합니다.';
    if (score > 0) return '표현 어휘 인출 지원이 우선이며, 오류 단어를 작은 묶음으로 나누어 구조화 중재를 권장합니다.';
    return '';
}

function buildHeviGuardianNarrative(entry = null, previousEntry = null, totalCount = 0) {
    const trend = buildGuardianTrendNarrative({
        scopeLabel: 'H-EVI',
        latestTitle: entry?.age ? `${entry.age} 표현 어휘` : '표현 어휘 검사',
        latestScore: Number(entry?.score || 0) || 0,
        latestAccuracy: Number(entry?.accuracy || 0) || 0,
        previousScore: Number(previousEntry?.score || 0) || 0,
        previousAccuracy: Number(previousEntry?.accuracy || 0) || 0,
        recordCount: totalCount,
        records: [entry, previousEntry].filter(Boolean)
    });
    const report = entry?.report || {};
    const focusWords = Array.isArray(report.focus)
        ? report.focus.map((item) => item.word).filter(Boolean).slice(0, 5)
        : [];
    const wrongWords = Array.isArray(report.wrongResults)
        ? report.wrongResults.map((item) => item?.item?.word).filter(Boolean).slice(0, 5)
        : [];
    const vocabularyNote = wrongWords.length
        ? `이번 기록에서는 ${wrongWords.join(', ')} 같은 단어에서 오답 또는 단서 반응을 보여, 실제 사물 보기-이름 말하기-짧은 문장으로 말하기 순서로 다시 확인하면 좋습니다.`
        : focusWords.length
            ? `누적 중점 단어는 ${focusWords.join(', ')}입니다. 알고 있는 단어를 설명하거나 같은 범주 단어로 묶어 말하는 확장 활동이 도움이 됩니다.`
            : '오답 단어군이 충분히 누적되면 보호자 상담에서 반복되는 범주와 도움 방식까지 함께 설명할 수 있습니다.';
    return {
        ...trend,
        overview: entry?.guardianSummary || `${trend.overview} H-EVI는 표현 어휘 반응을 보는 기록이므로, 보호자에게는 점수보다 어떤 단어에서 바로 말했는지, 어떤 단어에서 단서가 필요했는지, 이전보다 말하기가 안정되었는지를 중심으로 설명합니다.`,
        synthesis: `${trend.synthesis}\n${vocabularyNote}`,
        guidance: entry?.actionPlanSummary || `${trend.guidance} 다음에는 틀린 단어를 많이 반복하기보다 3~5개씩 작은 묶음으로 나누고, 의미 단서와 첫소리 단서를 천천히 줄여가며 확인합니다.`
    };
}

function buildHeviLatestSummary(entry = null, entries = []) {
    const isGuardianMode = normalizeDetailReportMode(currentDetailReportMode) === 'guardian';
    if (!entry) {
        return `
            <div class="detail-playlab-opinion-card detail-hevi-latest-card is-empty">
                <div class="detail-playlab-opinion-head">
                    <div>
                        <p class="detail-playlab-section-kicker">LATEST REPORT</p>
                        <h3 class="detail-playlab-opinion-title">${isGuardianMode ? 'H-EVI 보호자 공유 요약' : '마지막 리포트 요약'}</h3>
                    </div>
                </div>
                <div class="detail-report-empty detail-hevi-empty">
                    <span class="material-symbols-outlined">monitoring</span>
                    <p>아직 저장된 H-EVI 리포트가 없습니다. 검사를 진행하면 이곳에 마지막 리포트의 핵심 내용이 표시됩니다.</p>
                </div>
            </div>
        `;
    }
    const report = entry.report || {};
    const focusWords = Array.isArray(report.focus)
        ? report.focus.map((item) => item.word).filter(Boolean).slice(0, 5)
        : [];
    const wrongWords = Array.isArray(report.wrongResults)
        ? report.wrongResults.map((item) => item?.item?.word).filter(Boolean).slice(0, 5)
        : [];
    const heviGuardianNarrative = isGuardianMode
        ? buildHeviGuardianNarrative(entry, (Array.isArray(entries) ? entries : [])[1] || null, Array.isArray(entries) ? entries.length : 1)
        : null;
    const summaryNotes = [
        isGuardianMode ? heviGuardianNarrative.overview : entry.recommendation,
        isGuardianMode ? heviGuardianNarrative.synthesis : '',
        isGuardianMode ? heviGuardianNarrative.guidance : '',
        isGuardianMode ? '' : (focusWords.length ? `누적 중점 단어: ${focusWords.join(', ')}` : ''),
        isGuardianMode ? '' : (wrongWords.length ? `최근 오답/단서 반응: ${wrongWords.join(', ')}` : '')
    ].filter(Boolean);

    return `
        <div class="detail-playlab-opinion-card detail-hevi-latest-card">
            <div class="detail-playlab-opinion-head">
                <div>
                    <p class="detail-playlab-section-kicker">LATEST REPORT</p>
                    <h3 class="detail-playlab-opinion-title">${isGuardianMode ? 'H-EVI 보호자 공유 요약' : '마지막 리포트 요약'}</h3>
                    <p class="detail-playlab-chart-desc">${escapeHtml(formatDateTimeDisplay(entry.playedAt))} · ${escapeHtml(entry.modeLabel)} · ${escapeHtml(entry.age)}</p>
                </div>
                ${isGuardianMode ? '' : `<div class="detail-playlab-opinion-tags">
                    <span class="detail-playlab-opinion-tag is-strong">H-EVI ${entry.score || '-'}점</span>
                    ${entry.bandLabel ? `<span class="detail-playlab-opinion-tag is-weak">${escapeHtml(entry.bandLabel)}</span>` : ''}
                </div>`}
            </div>
            ${isGuardianMode ? `
                <div class="detail-report-summary detail-report-summary-hero detail-hevi-summary-grid">
                    <div class="detail-report-stat">
                        <p class="detail-report-stat-label">검사 기록</p>
                        <p class="detail-report-stat-value">있음</p>
                    </div>
                    <div class="detail-report-stat">
                        <p class="detail-report-stat-label">최근 변화</p>
                        <p class="detail-report-stat-value">${escapeHtml(heviGuardianNarrative?.statusLabel || '흐름 확인')}</p>
                    </div>
                    <div class="detail-report-stat">
                        <p class="detail-report-stat-label">다음 확인</p>
                        <p class="detail-report-stat-value">${escapeHtml(heviGuardianNarrative?.nextLabel || '전문가 검토')}</p>
                    </div>
                </div>
            ` : `<div class="detail-report-summary detail-report-summary-hero detail-hevi-summary-grid">
                <div class="detail-report-stat">
                    <p class="detail-report-stat-label">정확도</p>
                    <p class="detail-report-stat-value">${escapeHtml(formatHeviAccuracy(entry.accuracy))}</p>
                </div>
                <div class="detail-report-stat">
                    <p class="detail-report-stat-label">백분위 추정</p>
                    <p class="detail-report-stat-value">${entry.percentile ? `${entry.percentile}%ile` : '-'}</p>
                </div>
                <div class="detail-report-stat">
                    <p class="detail-report-stat-label">진행 문항</p>
                    <p class="detail-report-stat-value">${entry.answered || 0}/${entry.totalQuestions || 0}</p>
                </div>
                <div class="detail-report-stat">
                    <p class="detail-report-stat-label">오답/무반응</p>
                    <p class="detail-report-stat-value">${entry.wrongCount || 0}개</p>
                </div>
            </div>`}
            ${summaryNotes.length ? `
                <div class="detail-playlab-opinion-body">
                    <div class="detail-playlab-opinion-block">
                        <p class="detail-playlab-opinion-label">주요 내용</p>
                        <div class="detail-playlab-opinion-text">${summaryNotes.map(escapeHtml).join('<br>')}</div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function persistHeviHistoryReportPayload(entry = null) {
    if (!entry?.report) return '';
    const key = `${HEVI_REPORT_STORAGE_PREFIX}${entry.id}_${Date.now()}`;
    const payload = {
        entry: {
            id: entry.id,
            playedAt: entry.playedAt?.toISOString?.() || '',
            modeLabel: entry.modeLabel,
            age: entry.age,
            score: entry.score
        },
        report: entry.report
    };
    try {
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (_error) {
        return '';
    }
    return key;
}

function openHeviAssessmentReport(historyId) {
    const entries = buildHeviAssessmentEntries(currentDetailData.histories || []);
    const targetEntry = entries.find((entry) => String(entry.id) === String(historyId));
    if (!targetEntry?.report) {
        showBottomToast('상세 리포트 데이터를 찾지 못했습니다.');
        return;
    }
    const reportKey = persistHeviHistoryReportPayload(targetEntry);
    if (!reportKey) {
        showBottomToast('상세 리포트를 준비하지 못했습니다.');
        return;
    }
    const reportUrl = (() => {
        try {
            const url = new URL(getHeviAssessmentUrl(), window.location.href);
            url.searchParams.set('reportKey', reportKey);
            return url.toString();
        } catch (_error) {
            return `${getHeviAssessmentUrl()}?reportKey=${encodeURIComponent(reportKey)}`;
        }
    })();
    window.open(reportUrl, '_blank', 'noopener,noreferrer');
}

function showAssessmentPreparing() {
    showBottomToast('현재 준비중입니다.');
}

function renderHeviAssessmentReport(containerId, rows = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const entries = buildHeviAssessmentEntries(rows);
    const latest = entries[0] || null;
    const diagnosisCount = entries.filter((entry) => entry.mode === 'diagnosis').length;
    const averageScore = entries.length
        ? Math.round(entries.reduce((sum, entry) => sum + (Number(entry.score) || 0), 0) / entries.length)
        : 0;
    const latestScore = latest?.score || 0;
    const reportMode = normalizeDetailReportMode(currentDetailReportMode);
    const isGuardianMode = reportMode === 'guardian';
    const heviGuardianNarrative = isGuardianMode ? buildHeviGuardianNarrative(latest, entries[1] || null, entries.length) : null;

    container.innerHTML = `
        <div class="detail-report-shell detail-assessment-shell">
            ${renderDetailReportPrintHeader('검사 · 척도')}
            ${renderDetailReportModeNotice('검사 · 척도')}
            ${isGuardianMode ? renderGuardianShareChecklist('검사 · 척도') : ''}
            <div class="detail-assessment-tabbar" role="tablist" aria-label="검사 · 척도">
                <button type="button" class="detail-assessment-tab is-active" role="tab" aria-selected="true">
                    <span class="material-symbols-outlined">psychology</span>
                    H-EVI
                </button>
                <button type="button" class="detail-assessment-tab" role="tab" aria-selected="false" onclick="showAssessmentPreparing()">
                    <span class="material-symbols-outlined">pending</span>
                    상호작용 척도
                </button>
            </div>

            <section class="detail-hevi-hero-card">
                <div class="detail-hevi-hero-copy">
                    <p class="detail-playlab-section-kicker">ASSESSMENT</p>
                    <h3>하하랩 표현 어휘 지수(H-EVI)</h3>
                    <strong>HaHa-Expressive Vocabulary Index</strong>
                    <p>${isGuardianMode ? '최근 검사 및 학습 기록을 보호자가 이해하기 쉬운 관찰 요약으로 확인합니다.' : '연령별 언어 규준을 바탕으로 능동적 어휘 표현 능력을 확인합니다.'}</p>
                    <p>${isGuardianMode ? '세부 판정은 선생님과 전문가 검토를 함께 거쳐 설명합니다.' : '단어 명명, 의미 인출, 언어적 유연성을 종합해 발달 및 재활 지표를 제시합니다.'}</p>
                </div>
                <div class="detail-hevi-hero-actions">
                    <div class="detail-hevi-mini-stats">
                        ${isGuardianMode ? `
                            <span>검사 기록 <strong>${entries.length ? '있음' : '-'}</strong></span>
                            <span>최근 변화 <strong>${escapeHtml(heviGuardianNarrative?.statusLabel || '흐름 확인')}</strong></span>
                            <span>다음 확인 <strong>${escapeHtml(heviGuardianNarrative?.nextLabel || '전문가 검토')}</strong></span>
                        ` : `
                            <span>최근 지수 <strong>${latestScore || '-'}</strong></span>
                            <span>진단 로그 <strong>${diagnosisCount}회</strong></span>
                            <span>평균 지수 <strong>${averageScore || '-'}</strong></span>
                        `}
                    </div>
                    <button type="button" class="detail-hevi-start-btn" onclick="openHeviAssessment()">
                        <span class="material-symbols-outlined">open_in_full</span>
                        H-EVI 실행
                    </button>
                </div>
            </section>

            ${buildHeviLatestSummary(latest, entries)}

            <div class="detail-playlab-log-card detail-hevi-log-card">
                <div class="detail-playlab-log-head">
                    <div>
                        <p class="detail-playlab-section-kicker">ASSESSMENT LOG</p>
                        <h3 class="detail-playlab-opinion-title">H-EVI ${isGuardianMode ? '최근 기록' : '로그'}</h3>
                    </div>
                    <p class="detail-playlab-log-desc">${isGuardianMode ? '최신 기록부터 날짜와 핵심 요약만 확인합니다.' : '상세 리포트는 새창에서 확인하고, 30일 후 자동 만료되는 보호자 공유 URL을 복사할 수 있습니다.'}</p>
                </div>
                ${entries.length ? `
                    <div class="detail-playlab-log-table">
                        <div class="detail-playlab-log-row detail-hevi-log-row is-head">
                            <span>일시</span>
                            <span>구분</span>
                            <span>연령</span>
                            <span>${isGuardianMode ? '최근 변화' : 'H-EVI'}</span>
                            <span>${isGuardianMode ? '다음 확인' : '정확도'}</span>
                            <span>주요 내용</span>
                            <span>상세</span>
                        </div>
                        ${entries.slice(0, 20).map((entry, index) => {
                            const detailButton = isGuardianMode
                                ? '<span class="detail-hevi-log-muted">선생님 검토</span>'
                                : entry.mode === 'diagnosis' && entry.report
                                ? `<button type="button" class="detail-playlab-log-btn" onclick="openHeviAssessmentReport('${escapeHtml(entry.id)}')">상세 리포트</button>`
                                : '<span class="detail-hevi-log-muted">학습 기록</span>';
                            return `
                                <div class="detail-playlab-log-row detail-hevi-log-row">
                                    <span>${escapeHtml(formatDateTimeDisplay(entry.playedAt).replace('오전 ', '').replace('오후 ', ''))}</span>
                                    <span>
                                        <strong>${escapeHtml(entry.modeLabel)}</strong>
                                        <em>하하랩 표현 어휘 지수</em>
                                    </span>
                                    <span>${escapeHtml(entry.age)}</span>
                                    <span>${isGuardianMode ? escapeHtml(buildHeviGuardianNarrative(entry, entries[index + 1] || null, entries.length - index).statusLabel) : (entry.score ? `${entry.score}점` : '-')}</span>
                                    <span>${isGuardianMode ? escapeHtml(buildHeviGuardianNarrative(entry, entries[index + 1] || null, entries.length - index).nextLabel) : escapeHtml(formatHeviAccuracy(entry.accuracy))}</span>
                                    <span>${escapeHtml(isGuardianMode ? buildHeviGuardianNarrative(entry, entries[index + 1] || null, entries.length - index).overview : (entry.recommendation || entry.bandLabel || '기록된 주요 소견을 확인해 주세요.'))}</span>
                                    <span>${detailButton}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="detail-report-empty detail-hevi-empty">
                        <span class="material-symbols-outlined">clinical_notes</span>
                        <p>아직 H-EVI 로그가 없습니다. 검사를 실행하면 이 영역에 기록이 쌓입니다.</p>
                    </div>
                `}
            </div>
            ${isGuardianMode ? '' : '<div id="clinicalAssessmentPanel" class="clinical-assessment-panel" aria-live="polite"></div>'}
        </div>
    `;

    if (!isGuardianMode) {
        window.HahaLabClinical?.mountAssessment(
            document.getElementById('clinicalAssessmentPanel'),
            getCurrentDetailClient()
        );
    }
}

function renderDetailReportStatGrid(stats = []) {
    const safeStats = (Array.isArray(stats) ? stats : []).filter((item) => item && item.label);
    if (!safeStats.length) return '';
    return `
        <div class="detail-report-summary detail-report-summary-hero">
            ${safeStats.map((item) => `
                <div class="detail-report-stat">
                    <p class="detail-report-stat-label">${escapeHtml(item.label)}</p>
                    <p class="detail-report-stat-value">${escapeHtml(item.value || '-')}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderDetailReportHero({ kicker = 'REPORT', title = '', description = '', badges = [], stats = [] } = {}) {
    const safeBadges = (Array.isArray(badges) ? badges : []).map((item) => String(item || '').trim()).filter(Boolean);
    return `
        <div class="detail-playlab-opinion-card detail-report-hero">
            <div class="detail-playlab-opinion-head">
                <div class="detail-report-head-main">
                    <p class="detail-playlab-section-kicker">${escapeHtml(kicker)}</p>
                    <h4 class="detail-playlab-opinion-title">${escapeHtml(title || '학습 리포트')}</h4>
                    ${description ? `<p class="detail-playlab-chart-desc detail-report-hero-desc">${escapeHtml(description)}</p>` : ''}
                </div>
                ${safeBadges.length ? `
                    <div class="detail-playlab-opinion-tags detail-report-hero-tags">
                        ${safeBadges.map((badge, index) => `
                            <span class="detail-playlab-opinion-tag ${index === 0 ? 'is-strong' : 'is-weak'}">${escapeHtml(badge)}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            ${renderDetailReportStatGrid(stats)}
        </div>
    `;
}

function renderDetailInsightCard({ kicker = 'CLINICAL OPINION', title = '', summary = '', overview = '', tags = [] } = {}) {
    const safeTags = (Array.isArray(tags) ? tags : []).map((item) => String(item || '').trim()).filter(Boolean);
    const safeSummary = String(summary || '').trim();
    const safeOverview = String(overview || '').trim();
    if (!safeSummary && !safeOverview && !safeTags.length) return '';
    return `
        <div class="detail-playlab-opinion-card detail-report-insight">
            <div class="detail-playlab-opinion-head">
                <div class="detail-report-head-main">
                    <p class="detail-playlab-section-kicker">${escapeHtml(kicker)}</p>
                    <h4 class="detail-playlab-opinion-title">${escapeHtml(title || '전문가 해석')}</h4>
                </div>
                ${safeTags.length ? `
                    <div class="detail-playlab-opinion-tags">
                        ${safeTags.map((tag, index) => `
                            <span class="detail-playlab-opinion-tag ${index === 0 ? 'is-strong' : 'is-weak'}">${escapeHtml(tag)}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            ${safeSummary ? `<p class="detail-report-story">${escapeHtml(safeSummary)}</p>` : ''}
            ${safeOverview ? `<p class="detail-report-story detail-report-story-secondary">${escapeHtml(safeOverview)}</p>` : ''}
        </div>
    `;
}

function renderDetailTimelineCard({ kicker = 'SESSION LOG', title = '', description = '', tableHtml = '', itemsHtml = '' } = {}) {
    return `
        <div class="detail-playlab-log-card detail-report-timeline">
            <div class="detail-playlab-log-head">
                <div class="detail-report-head-main">
                    <p class="detail-playlab-section-kicker">${escapeHtml(kicker)}</p>
                    <h4 class="detail-playlab-opinion-title detail-report-log-title">${escapeHtml(title || '최근 세션')}</h4>
                    ${description ? `<p class="detail-playlab-log-desc">${escapeHtml(description)}</p>` : ''}
                </div>
            </div>
            ${tableHtml ? tableHtml : `<div class="detail-report-list">${itemsHtml}</div>`}
        </div>
    `;
}

function getNumberTimedDrillDetails(row = {}) {
    const normalized = normalizeLabHistoryRow(row);
    const details = normalized.details || {};
    const metadata = normalized.metadata || {};
    const reportType = String(
        details.reportType ||
        details.report_type ||
        metadata.reportType ||
        metadata.report_type ||
        ''
    ).trim();
    const records = details.timedDrillRecords || details.timed_drill_records || metadata.timedDrillRecords || metadata.timed_drill_records || [];
    if (reportType !== 'number_timed_multiplication' || !Array.isArray(records) || !records.length) return null;
    const totalSeconds = Number(details.timedDrillTotalSeconds ?? details.timed_drill_total_seconds ?? metadata.timedDrillTotalSeconds ?? metadata.timed_drill_total_seconds ?? 0) || 0;
    const averageSeconds = Number(details.timedDrillAverageSeconds ?? details.timed_drill_average_seconds ?? metadata.timedDrillAverageSeconds ?? metadata.timed_drill_average_seconds ?? 0) || 0;
    const firstTryCount = Number(details.timedDrillFirstTryCount ?? details.timed_drill_first_try_count ?? metadata.timedDrillFirstTryCount ?? metadata.timed_drill_first_try_count ?? 0) || 0;
    const wrongOnceCount = Number(details.timedDrillWrongOnceCount ?? details.timed_drill_wrong_once_count ?? metadata.timedDrillWrongOnceCount ?? metadata.timed_drill_wrong_once_count ?? 0) || 0;
    return {
        stageTitle: String(details.stageTitle || details.stage_title || metadata.stageTitle || metadata.stage_title || getLabReportRowTitle(row)).trim(),
        factor: Number(details.timedDrillFactor ?? details.timed_drill_factor ?? metadata.timedDrillFactor ?? metadata.timed_drill_factor ?? 0) || 0,
        orientation: String(details.timedDrillOrientation || details.timed_drill_orientation || metadata.timedDrillOrientation || metadata.timed_drill_orientation || '').trim(),
        totalSeconds,
        averageSeconds,
        firstTryCount,
        wrongOnceCount,
        records
    };
}

function formatReportSeconds(seconds) {
    const safeSeconds = Math.max(0, Number(seconds || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const rest = Math.round(safeSeconds % 60);
    return minutes > 0 ? `${minutes}분 ${String(rest).padStart(2, '0')}초` : `${safeSeconds.toFixed(1)}초`;
}

function renderNumberTimedDrillReportCard(entries = [], isGuardianMode = false) {
    if (!Array.isArray(entries) || !entries.length || isGuardianMode) return '';
    const entry = entries[0];
    const drill = entry.drill || {};
    const rows = Array.isArray(drill.records) ? drill.records : [];
    return renderDetailTimelineCard({
        kicker: 'TIMED DRILL DATA',
        title: '가로·세로 곱셈식 풀이 기록',
        description: `${drill.stageTitle || '곱셈식'}의 전체 시간, 문항별 시간, 오답 후 정답까지 걸린 시도 수를 확인합니다.`,
        tableHtml: `
            <div class="detail-playlab-log-table">
                <div class="detail-playlab-log-row is-head is-report">
                    <span>문항</span>
                    <span>식</span>
                    <span>정답</span>
                    <span>판정</span>
                    <span>시도</span>
                    <span>시간</span>
                </div>
                ${rows.map((record) => {
                    const durationSeconds = Number(record.durationSeconds ?? record.duration_seconds ?? ((Number(record.durationMs || record.duration_ms || 0) || 0) / 1000)) || 0;
                    const attempts = Math.max(1, Number(record.attempts || 1));
                    const wasWrong = Boolean(record.wasWrong || record.was_wrong || String(record.status || '') === '오답');
                    return `
                        <div class="detail-playlab-log-row is-report">
                            <span>${escapeHtml(String(record.index || ''))}</span>
                            <span><strong>${escapeHtml(record.expression || `${record.factor || ''} x ${record.groups || ''}`)}</strong><em>${escapeHtml(drill.orientation === 'vertical' ? '세로 곱셈식' : '가로 곱셈식')}</em></span>
                            <span>${escapeHtml(String(record.answer ?? ''))}</span>
                            <span>${wasWrong ? '오답' : '정답'}</span>
                            <span>${attempts}번</span>
                            <span>${formatReportSeconds(durationSeconds)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <p class="detail-playlab-chart-desc">전체 ${formatReportSeconds(drill.totalSeconds)} · 평균 ${formatReportSeconds(drill.averageSeconds)} · 첫 시도 정답 ${drill.firstTryCount}문항 · 오답 ${drill.wrongOnceCount}문항</p>
        `
    });
}

function renderSimpleHistoryReport(containerId, rows, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const reportRows = rows
        .map(normalizeLabHistoryRow)
        .filter((row) => inferLabReportScopeFromHistoryRow(row) === options.scope)
        .sort((left, right) => {
            const leftTime = new Date(String(left.eventDatetime || left.createdAt || 0).replace(' ', 'T')).getTime() || 0;
            const rightTime = new Date(String(right.eventDatetime || right.createdAt || 0).replace(' ', 'T')).getTime() || 0;
            return rightTime - leftTime;
        });

    if (!reportRows.length) {
        renderEmptyReport(containerId, options.icon || 'analytics', options.emptyMessage || '저장된 리포트가 아직 없습니다.');
        return;
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const scoredRows = reportRows.filter((row) => getHistoryScore(row) > 0);
    const averageScore = scoredRows.length ? Math.round(scoredRows.reduce((sum, row) => sum + getHistoryScore(row), 0) / scoredRows.length) : 0;
    const totalMinutes = reportRows.reduce((sum, row) => sum + getHistoryDurationMinutes(row), 0);
    const latestRow = reportRows[0] || {};
    const reportMode = normalizeDetailReportMode(currentDetailReportMode);
    const isGuardianMode = reportMode === 'guardian';
    const guardianNarrative = buildGuardianHistoryNarrative(reportRows, options.scopeLabel || '학습');
    const expertNarrative = buildStoredReportOpinion(reportRows, options.scopeLabel || '학습');
    const latestSummary = isGuardianMode
        ? guardianNarrative.summary
        : expertNarrative.overview;
    const latestOverview = isGuardianMode
        ? [guardianNarrative.synthesis, guardianNarrative.action || guardianNarrative.guidance].filter(Boolean).join('\n')
        : [expertNarrative.synthesis, expertNarrative.guidance].filter(Boolean).join('\n');
    const latestRecommendations = [expertNarrative.guidance, '원자료의 오류 유형과 도움 제공 조건을 확인한 뒤 다음 수업을 조정합니다.'];
    const latestScore = getHistoryScore(latestRow);
    const trendEntries = reportRows.map((row) => ({
        playedAt: new Date(String(row.eventDatetime || row.event_datetime || row.createdAt || row.created_at || '').replace(' ', 'T')),
        score: getHistoryScore(row),
        accuracy: getHistoryAccuracyScore(row),
        durationMinutes: getHistoryDurationMinutes(row)
    })).filter((entry) => entry.playedAt instanceof Date && !Number.isNaN(entry.playedAt.getTime()));
    const chartKey = `${containerId}-trend`;
    const monthCount = reportRows.filter((row) => {
        const rawDate = String(row.eventDatetime || row.event_datetime || row.createdAt || row.created_at || '').slice(0, 10);
        const date = parseLocalDateInput(rawDate);
        return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === monthKey : false;
    }).length;
    const reportModeLabel = isGuardianMode ? '보호자 공유 요약' : '종합 리포트';
    const numberTimedDrillRows = options.scope === LAB_REPORT_SCOPE_NUMBERLAB
        ? reportRows.map((row) => ({ row, drill: getNumberTimedDrillDetails(row) })).filter((entry) => entry.drill)
        : [];

    container.innerHTML = `
        <div class="detail-playlab-shell detail-report-shell">
            ${renderDetailReportPrintHeader(options.scopeLabel || '학습')}
            ${renderDetailReportModeNotice(options.scopeLabel || '학습')}
            ${isGuardianMode ? renderGuardianShareChecklist(options.scopeLabel || '학습') : ''}
            ${renderDetailReportHero({
                kicker: isGuardianMode ? 'GUARDIAN SUMMARY' : `${String(options.scopeLabel || '학습').toUpperCase()} REPORT`,
                title: `${options.scopeLabel || '학습'} ${reportModeLabel}`,
                description: isGuardianMode
                    ? `${options.scopeLabel || '학습'} 최근 활동을 보호자가 이해하기 쉬운 변화와 관찰 포인트 중심으로 정리했습니다.`
                    : `${options.scopeLabel || '학습'} 최근 수행을 플레이랩 리포트 화면과 같은 흐름으로 정리했습니다.`,
                badges: [
                    isGuardianMode ? `${options.scopeLabel || '리포트'} 활동 기록` : (latestScore > 0 ? `통합 ${latestScore}점` : `${options.scopeLabel || '리포트'} 기록`),
                    isGuardianMode ? '선생님 검토' : (monthCount > 0 ? `이번 달 ${monthCount}회` : `누적 ${reportRows.length}회`)
                ],
                stats: isGuardianMode ? [
                    { label: '최근 활동', value: `${reportRows.length}회` },
                    { label: '이번 달', value: monthCount > 0 ? `${monthCount}회` : '확인 필요' },
                    { label: '최근 변화', value: guardianNarrative.statusLabel || '흐름 확인' },
                    { label: '다음 확인', value: guardianNarrative.nextLabel || '선생님 검토' }
                ] : [
                    { label: '완료 횟수', value: `${reportRows.length}회` },
                    { label: '이번 달', value: `${monthCount}회` },
                    { label: '평균 점수', value: averageScore > 0 ? `${averageScore}점` : '-' },
                    { label: '평균 시간', value: reportRows.length ? `${Math.round(totalMinutes / reportRows.length)}분` : '-' }
                ]
            })}
            ${isGuardianMode ? '' : renderDetailDualTrendChartShell(chartKey, {
                title: `${options.scopeLabel || '학습'} 변화 그래프`,
                primaryLabel: '통합 점수',
                secondaryLabel: '정확도',
                secondarySuffix: '%',
                descriptions: {
                    week: '주 단위 집계값을 기술적으로 비교하며 과제 조건 차이는 별도로 확인합니다.',
                    month: '월 단위 집계값의 범위를 확인하며 변화 효과를 단정하지 않습니다.',
                    year: '연간 단위로 장기 변화 흐름을 확인합니다.'
                }
            })}
            ${renderDetailInsightCard({
                kicker: isGuardianMode ? 'OBSERVATION SUMMARY' : 'CLINICAL OPINION',
                title: isGuardianMode
                    ? `${options.scopeLabel || '학습'} 관찰 요약`
                    : (getLabReportRowTitle(latestRow) || `${options.scopeLabel || '학습'} 전문가 해석`),
                summary: latestSummary || getLabReportRowSubtitle(latestRow),
                overview: latestOverview,
                tags: isGuardianMode
                    ? ['활동 기록', '선생님 검토']
                    : latestRecommendations
            })}
            ${renderDetailTimelineCard({
                kicker: isGuardianMode ? 'RECENT ACTIVITY' : 'SESSION LOG',
                title: `${options.scopeLabel || '학습'} 최근 ${isGuardianMode ? '활동' : '세션'}`,
                description: isGuardianMode
                    ? '최신 활동부터 날짜와 핵심 요약만 확인합니다.'
                    : '최신 회기부터 순서대로 핵심 기록을 정리합니다.',
                tableHtml: `
                    <div class="detail-playlab-log-table">
                        <div class="detail-playlab-log-row is-head is-report ${isGuardianMode ? 'is-guardian' : ''}">
                            <span>일시</span>
                            <span>학습</span>
                            <span>${isGuardianMode ? '최근 변화' : '통합'}</span>
                            <span>${isGuardianMode ? '다음 확인' : '정확도'}</span>
                            ${isGuardianMode ? '' : '<span>시간</span>'}
                            <span>핵심 메모</span>
                        </div>
                        ${reportRows.slice(0, DETAIL_REPORT_LIMIT).map((row, index) => `
                            <div class="detail-playlab-log-row is-report ${isGuardianMode ? 'is-guardian' : ''}">
                                <span>${escapeHtml(formatDateTimeDisplay(row.eventDatetime || row.event_datetime || row.createdAt || row.created_at || '').replace('오전 ', '').replace('오후 ', ''))}</span>
                                <span>
                                    <strong>${escapeHtml(getLabReportRowTitle(row))}</strong>
                                    <em>${escapeHtml(getLabReportRowSubtitle(row) || (options.scopeLabel || '리포트'))}</em>
                                </span>
                                <span>${isGuardianMode ? escapeHtml(buildGuardianHistoryNarrative(reportRows.slice(index, index + 2), options.scopeLabel || '학습').statusLabel || '흐름 확인') : (getHistoryScore(row) > 0 ? `${getHistoryScore(row)}점` : '-')}</span>
                                <span>${isGuardianMode ? escapeHtml(buildGuardianHistoryNarrative(reportRows.slice(index, index + 2), options.scopeLabel || '학습').nextLabel || '선생님 확인') : (getHistoryAccuracyScore(row) > 0 ? `${getHistoryAccuracyScore(row)}점` : '-')}</span>
                                ${isGuardianMode ? '' : `<span>${getHistoryDurationMinutes(row) > 0 ? `${getHistoryDurationMinutes(row)}분` : '-'}</span>`}
                                <span>${escapeHtml(isGuardianMode ? getLabHistoryGuardianSummary(row, options.scopeLabel || '학습') : (getLabHistoryClinicalSummary(row) || '-'))}</span>
                            </div>
                        `).join('')}
                    </div>
                `
            })}
            ${renderNumberTimedDrillReportCard(numberTimedDrillRows, isGuardianMode)}
        </div>
    `;

    if (!isGuardianMode) {
        mountDetailTrendChart(chartKey, {
            week: buildDetailDualTrendSeries(trendEntries, 'week', { primaryKey: 'score', secondaryKey: 'accuracy' }),
            month: buildDetailDualTrendSeries(trendEntries, 'month', { primaryKey: 'score', secondaryKey: 'accuracy' }),
            year: buildDetailDualTrendSeries(trendEntries, 'year', { primaryKey: 'score', secondaryKey: 'accuracy' })
        }, {
            title: `${options.scopeLabel || '학습'} 변화 그래프`,
            primaryLabel: '통합 점수',
            secondaryLabel: '정확도',
            secondarySuffix: '%',
            descriptions: {
                week: '주 단위 집계값을 기술적으로 비교하며 과제 조건 차이는 별도로 확인합니다.',
                month: '월 단위 집계값의 범위를 확인하며 변화 효과를 단정하지 않습니다.',
                year: '연간 단위로 장기 변화 흐름을 확인합니다.'
            }
        });
    }
}

function renderCardlabReport() {
    const containerId = 'detailCardlabReport';
    const activityOnlyRows = (currentDetailData.histories || [])
        .map(normalizeLabHistoryRow)
        .filter((row) => {
            if (inferLabReportScopeFromHistoryRow(row) !== 'cardlab') return false;
            const details = row.details || {};
            const metadata = row.metadata || {};
            const reportType = String(
                details.report_type || details.reportType ||
                metadata.report_type || metadata.reportType || ''
            ).trim().toLowerCase();
            const assessmentMode = String(
                details.assessment_mode || details.assessmentMode ||
                metadata.assessment_mode || metadata.assessmentMode || ''
            ).trim().toLowerCase();
            const scoreInterpretation = String(
                details.score_interpretation || details.scoreInterpretation ||
                metadata.score_interpretation || metadata.scoreInterpretation || ''
            ).trim().toLowerCase();
            const scored = details.scored ?? metadata.scored;
            return reportType === 'cardlab-situation-talk'
                || assessmentMode === 'facilitated-discussion'
                || scoreInterpretation === 'not-applicable'
                || scored === false
                || String(scored).toLowerCase() === 'false';
        })
        .sort((left, right) => getLabHistoryDateMs(right) - getLabHistoryDateMs(left));
    const formatActivityDuration = (row = {}) => {
        const normalized = normalizeLabHistoryRow(row);
        const details = normalized.details || {};
        const metadata = normalized.metadata || {};
        const seconds = Number(
            details.duration_seconds ?? details.durationSeconds ??
            metadata.duration_seconds ?? metadata.durationSeconds ??
            normalized.durationSeconds ?? normalized.duration_seconds ?? 0
        );
        if (Number.isFinite(seconds) && seconds > 0 && seconds < 60) return `${Math.max(1, Math.round(seconds))}초`;
        const minutes = getHistoryDurationMinutes(normalized);
        return minutes > 0 ? `${minutes}분` : '-';
    };
    const renderActivityOnlyTimeline = () => activityOnlyRows.length ? renderDetailTimelineCard({
        kicker: 'RECENT SESSION',
        title: '최근 세션',
        description: '최근 완료된 대화 활동의 일시와 학습 시간을 확인합니다.',
        tableHtml: `
            <div class="detail-playlab-log-table">
                <div class="detail-playlab-log-row is-session-brief is-head">
                    <span>일시</span>
                    <span>학습 시간</span>
                </div>
                ${activityOnlyRows.slice(0, DETAIL_REPORT_LIMIT).map((row) => `
                    <div class="detail-playlab-log-row is-session-brief">
                        <span>${escapeHtml(formatDateTimeDisplay(getHistoryPlayedAt(row)).replace('오전 ', '').replace('오후 ', ''))}</span>
                        <span>${escapeHtml(formatActivityDuration(row))}</span>
                    </div>
                `).join('')}
            </div>
        `
    }) : '';
    const attempts = (currentDetailData.cardlabAttempts || []).slice().sort((left, right) => {
        const leftTime = new Date(String(left.completedAt || left.completed_at || 0).replace(' ', 'T')).getTime() || 0;
        const rightTime = new Date(String(right.completedAt || right.completed_at || 0).replace(' ', 'T')).getTime() || 0;
        return rightTime - leftTime;
    });
    if (!attempts.length) {
        if (!activityOnlyRows.length) {
            renderEmptyReport(containerId, 'style', '등록된 리포트가 없습니다.');
            return;
        }
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="detail-playlab-shell detail-report-shell detail-cardlab-activity-only-shell">
                ${renderDetailReportPrintHeader('카드랩')}
                ${renderDetailReportModeNotice('카드랩')}
                ${renderActivityOnlyTimeline()}
            </div>
        `;
        return;
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthCount = attempts.filter((attempt) => {
        const raw = String(attempt.completedAt || attempt.completed_at || '').slice(0, 10);
        const date = parseLocalDateInput(raw);
        return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === monthKey : false;
    }).length;
    const totalSeconds = attempts.reduce((sum, attempt) => sum + Math.max(0, Number(attempt.durationSeconds ?? attempt.duration_seconds) || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const formatCardlabDuration = (value) => {
        const seconds = Math.max(0, Math.round(Number(value) || 0));
        if (!seconds) return '-';
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds % 60;
        return minutes ? `${minutes}분${remainder ? ` ${remainder}초` : ''}` : `${seconds}초`;
    };
    const averageScore = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + (Number(attempt.score) || 0), 0) / attempts.length) : 0;
    const weakWords = (currentDetailData.cardlabWrongStats || []).slice(0, 3);
    const progressCount = (currentDetailData.cardlabProgress || []).filter((row) => isCardlabProgressCompleted(row)).length;
    const chartKey = `${containerId}-trend`;
    const trendEntries = attempts.map((attempt) => {
        const correctCount = Number(attempt.correctCount || attempt.correct_count || 0) || 0;
        const wrongCount = Number(attempt.wrongCount || attempt.wrong_count || 0) || 0;
        const totalQuestions = Math.max(Number(attempt.totalQuestions || attempt.total_questions || 0) || 0, correctCount + wrongCount);
        const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : Math.max(0, Math.min(100, Number(attempt.score) || 0));
        return {
            playedAt: new Date(String(attempt.completedAt || attempt.completed_at || '').replace(' ', 'T')),
            score: Math.max(0, Math.min(100, Number(attempt.score) || 0)),
            accuracy,
            durationMinutes: Math.max(0, Math.round((Number(attempt.durationSeconds || attempt.duration_seconds) || 0) / 60))
        };
    }).filter((entry) => entry.playedAt instanceof Date && !Number.isNaN(entry.playedAt.getTime()));
    const averageAccuracy = trendEntries.length
        ? Math.round(trendEntries.reduce((sum, entry) => sum + entry.accuracy, 0) / trendEntries.length)
        : 0;
    const recentAttempt = attempts[0] || {};
    const recentLabel = getCardlabCurriculumLabel(recentAttempt.curriculumKey || recentAttempt.curriculum_key || '') || '카드랩 학습';
    const getCardlabAttemptGuardianSummary = (attempt = {}, fallbackLabel = '카드랩 학습') => {
        const explicit = String(
            attempt.reportGuardianSummary ||
            attempt.report_guardian_summary ||
            attempt.guardianSummary ||
            attempt.guardian_summary ||
            ''
        ).trim();
        if (explicit) return explicit;
        const label = getCardlabCurriculumLabel(attempt.curriculumKey || attempt.curriculum_key || '') || fallbackLabel;
        return `최근 카드랩에서는 ${label} 활동을 중심으로 어휘를 보고 이해한 뒤 선택하는 흐름을 확인했습니다. 보호자 공유에서는 점수보다 카드에 대한 관심, 설명을 듣고 다시 찾는 모습, 오답 카드가 반복되는지 여부를 중심으로 설명합니다.`;
    };
    const getCardlabAttemptTeacherReviewNote = (attempt = {}) => String(
        attempt.reportTeacherReviewNote ||
        attempt.report_teacher_review_note ||
        attempt.teacherReviewNote ||
        attempt.teacher_review_note ||
        ''
    ).trim();
    const getCardlabAttemptActionSummary = (attempt = {}) => String(
        attempt.reportActionPlanSummary ||
        attempt.report_action_plan_summary ||
        attempt.actionPlanSummary ||
        attempt.action_plan_summary ||
        ''
    ).trim();
    const cardlabOpinion = buildStoredReportOpinion(attempts, '카드랩');
    const simpleSummary = [cardlabOpinion.overview, cardlabOpinion.synthesis].filter(Boolean).join(' ');
    const guardianSummary = cardlabOpinion.guardianOverview || cardlabOpinion.overview;
    const guardianReviewNote = getCardlabAttemptTeacherReviewNote(recentAttempt) || (weakWords.length
        ? `주의 항목은 선생님이 다음 회기 전에 확인합니다.`
        : '세부 오답 유형은 전문가 분석 화면에서 선생님이 확인합니다.');
    const guardianActionSummary = getCardlabAttemptActionSummary(recentAttempt) || '다음 카드 활동은 자동 확정하지 않고, 선생님이 실제 반응과 오답 카드를 확인한 뒤 조정합니다.';
    const simpleRecommendations = [cardlabOpinion.guidance, '오답 카드의 문항·이미지 적절성과 실제 선택 반응을 함께 확인합니다.', '독립 정답과 도움 후 정답을 구분해 기록하고, 조건 변경은 선생님이 검토합니다.'];
    const reportMode = normalizeDetailReportMode(currentDetailReportMode);
    const isGuardianMode = reportMode === 'guardian';
    const previousAttempt = attempts[1] || {};
    const getAttemptAccuracy = (attempt = {}) => {
        const correctCount = Number(attempt.correctCount || attempt.correct_count || 0) || 0;
        const wrongCount = Number(attempt.wrongCount || attempt.wrong_count || 0) || 0;
        const totalQuestions = Math.max(Number(attempt.totalQuestions || attempt.total_questions || 0) || 0, correctCount + wrongCount, 0);
        return totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : Math.max(0, Math.min(100, Number(attempt.score) || 0));
    };
    const guardianCardlabNarrative = buildGuardianTrendNarrative({
        scopeLabel: '카드랩',
        latestTitle: recentLabel,
        latestScore: Number(recentAttempt.score || 0) || 0,
        latestAccuracy: getAttemptAccuracy(recentAttempt),
        previousScore: Number(previousAttempt.score || 0) || 0,
        previousAccuracy: getAttemptAccuracy(previousAttempt),
        recordCount: attempts.length,
        records: attempts
    });

    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="detail-playlab-shell detail-report-shell">
            ${renderDetailReportPrintHeader('카드랩')}
            ${renderDetailReportModeNotice('카드랩')}
            ${isGuardianMode ? renderGuardianShareChecklist('카드랩') : ''}
            ${renderDetailReportHero({
                kicker: isGuardianMode ? 'GUARDIAN SUMMARY' : 'CARD LAB REPORT',
                title: isGuardianMode ? '카드랩 보호자 공유 요약' : '카드랩 통합 심플 리포트',
                description: isGuardianMode
                    ? '카드랩 활동 흐름을 보호자가 보기 쉬운 참여와 변화 중심으로 정리했습니다.'
                    : '카드랩 수행 흐름을 점수, 정답률, 최근 세션 중심으로 간단히 통합했습니다.',
                badges: isGuardianMode ? [
                    '카드랩 활동 기록',
                    '선생님 검토'
                ] : [
                    averageScore > 0 ? `평균 ${averageScore}점` : '카드랩 기록',
                    `완료 스테이지 ${progressCount}개`
                ],
                stats: isGuardianMode ? [
                    { label: '최근 활동', value: `${attempts.length}회` },
                    { label: '이번 달', value: monthCount > 0 ? `${monthCount}회` : '확인 필요' },
                    { label: '최근 변화', value: guardianCardlabNarrative.statusLabel || '흐름 확인' },
                    { label: '다음 확인', value: guardianCardlabNarrative.nextLabel || '선생님 검토' }
                ] : [
                    { label: '완료 횟수', value: `${attempts.length}회` },
                    { label: '이번 달', value: `${monthCount}회` },
                    { label: '평균 점수', value: averageScore > 0 ? `${averageScore}점` : '-' },
                    { label: '누적 시간', value: formatCardlabDuration(totalSeconds) }
                ]
            })}
            ${isGuardianMode ? '' : renderDetailDualTrendChartShell(chartKey, {
                title: '카드랩 변화 그래프',
                primaryLabel: '학습 점수',
                secondaryLabel: '정확도',
                secondarySuffix: '%',
                descriptions: {
                    week: '주 단위 집계값을 기술적으로 비교하며 카드 조건 차이는 별도로 확인합니다.',
                    month: '월간 평균으로 카드 조합 및 언어 과제의 정착 흐름을 확인합니다.',
                    year: '연 단위 집계값의 범위를 확인하며 장기 효과를 단정하지 않습니다.'
                }
            })}
            ${renderDetailInsightCard({
                kicker: isGuardianMode ? 'OBSERVATION SUMMARY' : 'SIMPLE SUMMARY',
                title: isGuardianMode ? '카드랩 관찰 요약' : '카드랩 통합 요약',
                summary: isGuardianMode ? guardianSummary : simpleSummary,
                overview: isGuardianMode ? [guardianCardlabNarrative.synthesis, guardianReviewNote, guardianActionSummary].filter(Boolean).join('\n') : [
                    weakWords.length ? `최근 주의 항목은 ${weakWords.map((row) => row.word || row.assetName || row.asset_name).filter(Boolean).join(', ')} 입니다.` : '최근 주의 항목은 별도로 누적되지 않았습니다.'
                ].filter(Boolean).join(' '),
                tags: isGuardianMode
                    ? [guardianCardlabNarrative.statusLabel || '참여 흐름', '선생님 확인', '자동 배정 없음']
                    : simpleRecommendations
            })}
            ${renderDetailTimelineCard({
                kicker: isGuardianMode ? 'RECENT ACTIVITY' : 'SESSION LOG',
                title: `카드랩 최근 ${isGuardianMode ? '활동' : '세션'}`,
                description: isGuardianMode
                    ? '최신 카드랩 활동부터 날짜와 핵심 요약만 확인합니다.'
                    : '최신 카드랩 시도부터 점수와 소요 시간을 확인할 수 있습니다.',
                tableHtml: `
                    <div class="detail-playlab-log-table">
                        <div class="detail-playlab-log-row is-head is-report ${isGuardianMode ? 'is-guardian' : ''}">
                            <span>일시</span>
                            <span>학습</span>
                            <span>${isGuardianMode ? '최근 변화' : '점수'}</span>
                            <span>${isGuardianMode ? '다음 확인' : '정확도'}</span>
                            ${isGuardianMode ? '' : '<span>시간</span>'}
                            <span>핵심 메모</span>
                        </div>
                        ${attempts.slice(0, DETAIL_REPORT_LIMIT).map((attempt, index) => {
                            const correctCount = readObservedReportNumber([attempt], ['correctCount', 'correct_count']);
                            const wrongCount = readObservedReportNumber([attempt], ['wrongCount', 'wrong_count']);
                            const totalQuestions = readObservedReportNumber([attempt], ['totalQuestions', 'total_questions'])
                                ?? (correctCount !== null && wrongCount !== null ? correctCount + wrongCount : null);
                            const accuracy = correctCount !== null && totalQuestions > 0 && correctCount <= totalQuestions
                                ? Math.round((correctCount / totalQuestions) * 100) : null;
                            const score = getObservedReportNumber(attempt.score);
                            const durationSeconds = Math.max(0, Number(attempt.durationSeconds ?? attempt.duration_seconds) || 0);
                            const noteText = index === 0
                                ? (isGuardianMode ? guardianSummary : simpleSummary)
                                : (isGuardianMode ? getCardlabAttemptGuardianSummary(attempt) : `${getCardlabCurriculumLabel(attempt.curriculumKey || attempt.curriculum_key || '')} · ${attempt.cleared === true ? '클리어' : '진행 기록'}`);
                            return `
                                <div class="detail-playlab-log-row is-report ${isGuardianMode ? 'is-guardian' : ''}">
                                    <span>${escapeHtml(formatDateTimeDisplay(attempt.completedAt || attempt.completed_at || '').replace('오전 ', '').replace('오후 ', ''))}</span>
                                    <span>
                                    <strong>${escapeHtml(attempt.stageTitle || attempt.stageKey || '카드랩 학습')}</strong>
                                    <em>${escapeHtml(getCardlabCurriculumLabel(attempt.curriculumKey || attempt.curriculum_key || ''))}</em>
                                </span>
                                    <span>${isGuardianMode ? escapeHtml(buildGuardianTrendNarrative({
                                        scopeLabel: '카드랩',
                                        latestTitle: getCardlabCurriculumLabel(attempt.curriculumKey || attempt.curriculum_key || '') || '카드랩 학습',
                                        latestScore: Number(attempt.score || 0) || 0,
                                        latestAccuracy: accuracy,
                                        previousScore: Number((attempts[index + 1] || {}).score || 0) || 0,
                                        previousAccuracy: getAttemptAccuracy(attempts[index + 1] || {}),
                                        recordCount: attempts.length - index,
                                        records: attempts.slice(index)
                                    }).statusLabel) : (score !== null ? `${score}점` : '미기록')}</span>
                                    <span>${isGuardianMode ? escapeHtml(buildGuardianTrendNarrative({
                                        scopeLabel: '카드랩',
                                        latestTitle: getCardlabCurriculumLabel(attempt.curriculumKey || attempt.curriculum_key || '') || '카드랩 학습',
                                        latestScore: Number(attempt.score || 0) || 0,
                                        latestAccuracy: accuracy,
                                        previousScore: Number((attempts[index + 1] || {}).score || 0) || 0,
                                        previousAccuracy: getAttemptAccuracy(attempts[index + 1] || {}),
                                        recordCount: attempts.length - index,
                                        records: attempts.slice(index)
                                    }).nextLabel) : (accuracy !== null ? `${accuracy}%` : '미기록')}</span>
                                    ${isGuardianMode ? '' : `<span>${formatCardlabDuration(durationSeconds)}</span>`}
                                    <span>${escapeHtml(noteText)}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `
            })}
            ${renderActivityOnlyTimeline()}
        </div>
    `;

    if (!isGuardianMode) {
        mountDetailTrendChart(chartKey, {
            week: buildDetailDualTrendSeries(trendEntries, 'week', { primaryKey: 'score', secondaryKey: 'accuracy' }),
            month: buildDetailDualTrendSeries(trendEntries, 'month', { primaryKey: 'score', secondaryKey: 'accuracy' }),
            year: buildDetailDualTrendSeries(trendEntries, 'year', { primaryKey: 'score', secondaryKey: 'accuracy' })
        }, {
            title: '카드랩 변화 그래프',
            primaryLabel: '학습 점수',
            secondaryLabel: '정확도',
            secondarySuffix: '%',
            descriptions: {
                week: '주 단위 집계값을 기술적으로 비교하며 카드 조건 차이는 별도로 확인합니다.',
                month: '월간 평균으로 카드 조합 및 언어 과제의 정착 흐름을 확인합니다.',
                year: '연 단위 집계값의 범위를 확인하며 장기 효과를 단정하지 않습니다.'
            }
        });
    }
}

function renderDetailReports(client) {
    const isLoadError = currentDetailDataLoadState.status === 'error'
        && currentDetailDataLoadState.clientId === String(client?.id || '');
    if (isLoadError) {
        const message = currentDetailDataLoadState.message || '리포트 기록을 불러오지 못했습니다.';
        renderReportLoadError('detailCardlabReport', message);
        renderReportLoadError('detailNumlabReport', message);
        renderReportLoadError('detailPlaylabReport', message);
        renderReportLoadError('detailMusicartlabReport', message);
        renderReportLoadError('detailRehabReport', message);
        renderReportLoadError('detailAssessmentReport', message);
        return;
    }
    if (client.type !== 'client') {
        renderEmptyReport('detailCardlabReport', 'style', '예약자는 카드랩 리포트를 지원하지 않습니다.');
        renderEmptyReport('detailNumlabReport', 'count_down', '예약자는 숫자랩 리포트를 지원하지 않습니다.');
        renderEmptyReport('detailPlaylabReport', 'sports_esports', '예약자는 플레이랩 리포트를 지원하지 않습니다.');
        renderEmptyReport('detailMusicartlabReport', 'artist', '예약자는 뮤직아트랩 리포트를 지원하지 않습니다.');
        renderEmptyReport('detailRehabReport', 'accessibility_new', '예약자는 재활랩 리포트를 지원하지 않습니다.');
        renderEmptyReport('detailAssessmentReport', 'monitoring', '예약자는 검사 · 척도 메뉴를 지원하지 않습니다.');
        return;
    }

    if (!window.PlaylabReportEngine) {
        const reportClientId = String(client.id || '');
        const reportDataSnapshot = currentDetailData;
        ensurePlaylabReportEngineLoaded().then(() => {
            if (String(currentDetailClientId || '') === reportClientId && currentDetailData === reportDataSnapshot) renderDetailReports(client);
        }).catch(() => {});
    }
    renderCardlabReport();
    renderSimpleHistoryReport('detailNumlabReport', currentDetailData.histories || [], {
        scope: LAB_REPORT_SCOPE_NUMBERLAB,
        scopeLabel: '숫자랩',
        icon: 'count_down',
        emptyMessage: '등록된 리포트가 없습니다.'
    });
    renderSimpleHistoryReport('detailPlaylabReport', currentDetailData.histories || [], {
        scope: LAB_REPORT_SCOPE_PLAYLAB,
        scopeLabel: '플레이랩',
        icon: 'sports_esports',
        emptyMessage: '등록된 결과가 없습니다.'
    });
    renderSimpleHistoryReport('detailMusicartlabReport', currentDetailData.histories || [], {
        scope: LAB_REPORT_SCOPE_MUSICARTLAB,
        scopeLabel: '뮤직아트랩',
        icon: 'artist',
        emptyMessage: '등록된 결과가 없습니다.'
    });
    renderPlaylabIntegratedReport('detailRehabReport', currentDetailData.histories || [], {
        scope: LAB_REPORT_SCOPE_REHAB,
        scopeLabel: '재활랩',
        icon: 'accessibility_new',
        emptyMessage: '등록된 리포트가 없습니다.'
    });
    renderHeviAssessmentReport('detailAssessmentReport', currentDetailData.histories || []);
}

function getCurrentDetailClient() {
    return currentDetailClientId ? findClientById(currentDetailClientId) : null;
}

function resetDetailActionState() {
    currentDetailActionStep = '';
    currentDetailActionDeleteFuture = false;
    renderDetailActionControls(getCurrentDetailClient());
}

function setDetailClientAction(step) {
    const client = getCurrentDetailClient();
    if (!client) {
        showAlert('대상 내담자 정보를 찾지 못했습니다.');
        return;
    }
    if (step === 'delete') {
        showConfirm(`${client.name || '선택한 내담자'} 프로필을 삭제할까요?\n삭제 후에는 이 화면에서 복구할 수 없습니다.`, () => {
            deleteCurrentDetailClient();
        });
        return;
    }
    if (step === 'terminate') {
        showConfirm(`${client.name || '선택한 내담자'}의 수업을 종결할까요?\n기존 수업과 리포트 기록은 유지됩니다.`, () => {
            currentDetailActionStep = 'terminate';
            currentDetailActionDeleteFuture = false;
            updateCurrentDetailClientStatus('terminated');
        });
        return;
    }
    currentDetailActionStep = step || '';
    currentDetailActionDeleteFuture = false;
    renderDetailActionControls(getCurrentDetailClient());
    if (currentDetailActionStep) {
        requestAnimationFrame(() => {
            const verifyInput = document.getElementById('detailClientVerifyName');
            if (verifyInput && verifyInput.style.display !== 'none') {
                verifyInput.focus();
            }
        });
    }
}

function renderDetailActionControls(client) {
    const section = document.getElementById('detailClientActionSection');
    const buttons = document.getElementById('detailClientActionButtons');
    const confirm = document.getElementById('detailClientActionConfirm');
    const title = document.getElementById('detailClientActionTitle');
    const futureWrap = document.getElementById('detailClientDeleteFutureWrap');
    const futureCheckbox = document.getElementById('detailClientDeleteFuture');
    const verifyInput = document.getElementById('detailClientVerifyName');
    const confirmBtn = document.getElementById('detailClientActionConfirmBtn');
    const cancelBtn = document.getElementById('detailClientActionCancelBtn');
    const editBtn = document.getElementById('detailClientEditButton');
    const labBtn = document.getElementById('detailClientLabTopButton') || document.getElementById('detailClientLabButton');
    const deleteBtn = document.getElementById('detailClientDeleteButton');
    const pauseBtn = document.getElementById('detailClientPauseButton');
    const terminateBtn = document.getElementById('detailClientTerminateButton');
    const convertBtn = document.getElementById('detailClientConvertButton');
    const resumeBtn = document.getElementById('detailClientResumeButton');
    if (!section || !buttons || !confirm || !title || !futureWrap || !futureCheckbox || !verifyInput || !confirmBtn || !cancelBtn || !editBtn || !deleteBtn || !pauseBtn || !terminateBtn || !convertBtn || !resumeBtn) return;

    const isClient = Boolean(client && client.type === 'client');
    const isReserve = Boolean(client && client.type === 'reserve');
    section.style.display = client ? 'block' : 'none';
    if (!client) {
        currentDetailActionStep = '';
        currentDetailActionDeleteFuture = false;
        if (labBtn) labBtn.style.display = 'none';
        confirm.style.display = 'none';
        return;
    }
    if (isReserve && !['', 'delete', 'convert'].includes(currentDetailActionStep)) {
        currentDetailActionStep = '';
    }

    const status = String(client.status || '').toLowerCase();
    const pauseDate = new Date(client.updated_at || client.updatedAt || client.createdAt || client.created_at || Date.now());
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - pauseDate) / (1000 * 60 * 60 * 24));
    const isResumeLocked = status === 'paused' && diffDays < 14;

    buttons.style.display = currentDetailActionStep ? 'none' : 'flex';
    confirm.style.display = currentDetailActionStep ? 'flex' : 'none';

    const actionMap = {
        delete: {
            title: '삭제 확인:',
            confirmLabel: '삭제',
            placeholder: '이름 입력',
            showFuture: false,
            requiresName: true,
            message: '이 작업을 진행하면 해당 정보가 삭제됩니다.'
        },
        pause: {
            title: '수업 정지 확인:',
            confirmLabel: '확인',
            placeholder: '이름 입력',
            showFuture: false,
            requiresName: false,
            message: '수업을 정지할까요?'
        },
        terminate: {
            title: '종결 확인:',
            confirmLabel: '확인',
            placeholder: '이름 입력',
            showFuture: false,
            requiresName: false,
            message: '수업을 종결할까요?'
        },
        convert: {
            title: '정규 내담자 등록 확인:',
            confirmLabel: '등록',
            placeholder: '이름 입력',
            showFuture: false,
            requiresName: true,
            message: '선택한 예약자를 정규 내담자로 등록합니다.'
        }
    };

    const action = actionMap[currentDetailActionStep];
    if (action) {
        title.textContent = action.title;
        verifyInput.placeholder = action.placeholder;
        verifyInput.value = '';
        verifyInput.style.display = action.requiresName ? 'block' : 'none';
        const message = document.getElementById('detailClientActionMessage');
        if (message) message.textContent = action.message || '';
        confirmBtn.textContent = action.confirmLabel;
        futureWrap.style.display = action.showFuture ? 'inline-flex' : 'none';
        futureCheckbox.checked = currentDetailActionDeleteFuture;
        resumeBtn.style.display = 'none';
    } else {
        confirm.style.display = 'none';
        buttons.style.display = 'flex';
        futureWrap.style.display = 'none';
        futureCheckbox.checked = false;
        verifyInput.value = '';
        verifyInput.placeholder = '이름 입력';
        verifyInput.style.display = 'block';
        const message = document.getElementById('detailClientActionMessage');
        if (message) message.textContent = '';
        editBtn.style.display = 'inline-flex';
        if (labBtn) labBtn.style.display = isClient ? 'inline-flex' : 'none';
        deleteBtn.style.display = 'inline-flex';

        if (isReserve) {
            if (labBtn) labBtn.style.display = 'none';
            pauseBtn.style.display = 'none';
            terminateBtn.style.display = 'none';
            convertBtn.style.display = 'inline-flex';
            resumeBtn.style.display = 'none';
            resumeBtn.disabled = false;
            resumeBtn.title = '';
        } else {
            convertBtn.style.display = 'none';
            if (status === 'paused' || status === 'terminated') {
                pauseBtn.style.display = 'none';
                terminateBtn.style.display = 'none';
                resumeBtn.style.display = 'inline-flex';
                resumeBtn.disabled = Boolean(isResumeLocked);
                resumeBtn.title = isResumeLocked ? `수업 정지 후 14일이 지나야 재개가 가능합니다. (남은 기간: ${14 - diffDays}일)` : '수업 재개';
            } else {
                pauseBtn.style.display = 'inline-flex';
                terminateBtn.style.display = 'inline-flex';
                resumeBtn.style.display = 'none';
                resumeBtn.disabled = false;
                resumeBtn.title = '';
            }
        }
    }

    futureCheckbox.onchange = (event) => {
        currentDetailActionDeleteFuture = Boolean(event.target.checked);
    };
    verifyInput.oninput = () => {};
    confirmBtn.onclick = handleDetailActionConfirm;
    cancelBtn.onclick = () => {
        currentDetailActionStep = '';
        currentDetailActionDeleteFuture = false;
        renderDetailActionControls(getCurrentDetailClient());
    };
}

async function refreshAfterClientMutation(detailClientId = '') {
    const nextDetailClientId = String(detailClientId || currentDetailClientId || '').trim();
    await loadAppData({ preserveDetail: Boolean(nextDetailClientId), detailClientId: nextDetailClientId });
    if (!nextDetailClientId) return;
    const detailClient = findClientById(nextDetailClientId);
    if (detailClient) {
        renderDetailView(detailClient);
        await loadDetailSupplementalData(detailClient);
        requestAnimationFrame(() => {
            scrollDetailViewToTop();
        });
        return;
    }
    goToList();
}

function openDetailEditModal() {
    const client = getCurrentDetailClient();
    if (!client) {
        showAlert('수정할 정보를 찾지 못했습니다.');
        return;
    }
    showConfirm(`${client.name || '선택한 내담자'} 프로필을 수정할까요?\n확인 후 편집 화면이 열립니다.`, () => {
        currentDetailActionStep = '';
        currentDetailActionDeleteFuture = false;
        renderDetailActionControls(client);
        if (typeof openRegistrationModal === 'function') openRegistrationModal(client);
    });
}

async function deleteCurrentDetailClient() {
    const client = getCurrentDetailClient();
    if (!client || !window.supabaseClient) {
        showAlert('삭제할 정보를 찾지 못했습니다.');
        return;
    }
    const teacherId = getCurrentTeacherId();

    const deleteQuery = teacherId
        ? window.supabaseClient.from('clients').delete().eq('id', client.id).eq('teacher_id', teacherId)
        : window.supabaseClient.from('clients').delete().eq('id', client.id);
    const { error } = await deleteQuery;
    if (error) {
        showAlert(`${client.type === 'reserve' ? '예약자' : '내담자'} 삭제 중 오류가 발생했습니다: ${error.message || error}`);
        return;
    }

    currentDetailActionStep = '';
    currentDetailActionDeleteFuture = false;
    await loadAppData();
    goToList();
    showBottomToast(client.type === 'reserve' ? '예약자가 삭제되었습니다.' : '내담자가 삭제되었습니다.');
}

async function convertCurrentDetailReserve() {
    const client = getCurrentDetailClient();
    if (!client || client.type !== 'reserve' || !window.supabaseClient) {
        showAlert('정규 내담자로 전환할 예약자 정보를 찾지 못했습니다.');
        return;
    }

    const teacherId = getCurrentTeacherId();
    if (!teacherId) {
        showAlert('로그인 정보가 확인되지 않아 전환할 수 없습니다.');
        return;
    }

    const { error } = await window.supabaseClient
        .from('clients')
        .update({
            type: 'client',
            status: 'active'
        })
        .eq('id', client.id)
        .eq('teacher_id', teacherId);
    if (error) {
        showAlert(`정규 내담자 전환 중 오류가 발생했습니다: ${error.message || error}`);
        return;
    }

    currentDetailActionStep = '';
    currentDetailActionDeleteFuture = false;
    await refreshAfterClientMutation(client.id);
    showBottomToast('정규 내담자로 등록되었습니다.');
}

async function updateCurrentDetailClientStatus(nextStatus) {
    const client = getCurrentDetailClient();
    if (!client || !window.supabaseClient) {
        showAlert('상태를 변경할 내담자 정보를 찾지 못했습니다.');
        return;
    }

    const teacherId = getCurrentTeacherId();
    if (!teacherId) {
        showAlert('로그인 정보가 확인되지 않아 상태를 변경할 수 없습니다.');
        return;
    }

    const { error } = await window.supabaseClient
        .from('clients')
        .update({ status: nextStatus })
        .eq('id', client.id)
        .eq('teacher_id', teacherId);
    if (error) {
        showAlert(`상태 변경 중 오류가 발생했습니다: ${error.message || error}`);
        return;
    }

    let deletedFutureCount = 0;
    if ((currentDetailActionStep === 'pause' || currentDetailActionStep === 'terminate') && currentDetailActionDeleteFuture) {
        const today = formatDateLocal(new Date());
        const futureSchedules = (window.appSchedules || []).filter((schedule) => (
            String(schedule.clientId || schedule.client_id || '') === String(client.id)
            && String(schedule.date || '') >= today
            && String(schedule.status || '').toLowerCase() !== 'deleted'
        ));
        deletedFutureCount = futureSchedules.length;
        if (futureSchedules.length > 0) {
            const { error: scheduleError } = await window.supabaseClient
                .from('schedules')
                .delete()
                .eq('client_id', client.id)
                .eq('teacher_id', teacherId)
                .gte('date', today);
            if (scheduleError) {
                showAlert(`상태는 변경되었으나 일정 삭제 중 오류가 발생했습니다: ${scheduleError.message || scheduleError}`);
                await refreshAfterClientMutation(client.id);
                return;
            }
        }
    }

    currentDetailActionStep = '';
    currentDetailActionDeleteFuture = false;
    await refreshAfterClientMutation(client.id);

    if (nextStatus === 'active') {
        showBottomToast(client.type === 'reserve' ? '예약 진행 상태로 변경되었습니다.' : '수업이 재개되었습니다.');
        return;
    }

    if (deletedFutureCount > 0) {
        showBottomToast('상태 변경 및 미래 일정이 삭제되었습니다.');
    } else {
        showBottomToast('상태가 변경되었습니다.');
    }
}

async function handleDetailActionConfirm() {
    const client = getCurrentDetailClient();
    if (!client) {
        showAlert('대상 내담자 정보를 찾지 못했습니다.');
        return;
    }

    if (currentDetailActionStep === 'delete') {
        const verifyInput = document.getElementById('detailClientVerifyName');
        if (!verifyInput || String(verifyInput.value || '').trim() !== String(client.name || '').trim()) {
            showAlert('이름이 일치하지 않습니다.');
            return;
        }
        await deleteCurrentDetailClient();
        return;
    }

    if (currentDetailActionStep === 'pause') {
        await updateCurrentDetailClientStatus('paused');
        return;
    }

    if (currentDetailActionStep === 'terminate') {
        await updateCurrentDetailClientStatus('terminated');
        return;
    }

    if (currentDetailActionStep === 'convert') {
        const verifyInput = document.getElementById('detailClientVerifyName');
        if (!verifyInput || String(verifyInput.value || '').trim() !== String(client.name || '').trim()) {
            showAlert('이름이 일치하지 않습니다.');
            return;
        }
        await convertCurrentDetailReserve();
    }
}

async function resumeCurrentDetailClient() {
    const client = getCurrentDetailClient();
    if (!client) {
        showAlert('내담자 정보를 찾지 못했습니다.');
        return;
    }

    const status = String(client.status || '').toLowerCase();
    if (status === 'paused' && client.updated_at) {
        const pauseDate = new Date(client.updated_at || client.createdAt || Date.now());
        const today = new Date();
        const diffTime = Math.abs(today - pauseDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 14) {
            showBottomToast(`수업 정지 후 14일이 지나야 재개가 가능합니다. (남은 기간: ${14 - diffDays}일)`);
            return;
        }
    }

    await updateCurrentDetailClientStatus('active');
}

function renderDetailView(client) {
    if (!client) return;
    toggleDetailTabVisibility(client);
    renderDetailInfo(client);
    renderDetailWeeklyBoard(client);
    renderAttendanceList(client);
    renderDetailReports(client);
    renderDetailActionControls(client);
}

async function loadDetailSupplementalData(client) {
    const requestEpoch = sensitiveAppEpoch;
    const clientId = String(client?.id || '').trim();
    setCurrentDetailDataLoadState('loading', clientId);
    try {
        const nextData = await fetchClientSupplementalData(client);
        if (requestEpoch !== sensitiveAppEpoch || !window.currentProfile) return;
        if (String(currentDetailClientId || '') !== clientId) return;
        currentDetailData = nextData;
        setCurrentDetailDataLoadState('ready', clientId);
    } catch (error) {
        if (requestEpoch !== sensitiveAppEpoch || !window.currentProfile) return;
        console.error('[DetailData] load failed:', error);
        if (String(currentDetailClientId || '') !== clientId) return;
        currentDetailData = mergeSupplementalWithLocal(
            { histories: [], cardlabAttempts: [], cardlabProgress: [], cardlabWrongStats: [] },
            clientId
        );
        setCurrentDetailDataLoadState('error', clientId, '리포트 기록을 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.');
    }

    const freshClient = findClientById(client.id) || client;
    renderDetailReports(freshClient);
}

function clearDetailRealtimeChannels() {
    if (!window.supabaseClient) return;
    detailRealtimeChannels.forEach((channel) => {
        try {
            window.supabaseClient.removeChannel(channel);
        } catch (_error) {
            // noop
        }
    });
    detailRealtimeChannels = [];
}

function scrollDetailViewToTop() {
    const detailView = document.getElementById('detail-view');
    const contentArea = document.getElementById('detail-content-area');
    if (detailView) detailView.scrollTop = 0;
    if (contentArea) contentArea.scrollTop = 0;
}

function scheduleDetailRefresh(clientId) {
    clearTimeout(detailRefreshTimer);
    detailRefreshTimer = window.setTimeout(async () => {
        await loadAppData({ preserveDetail: true, detailClientId: clientId });
        const client = findClientById(clientId);
        if (client) {
            renderDetailView(client);
            await loadDetailSupplementalData(client);
            requestAnimationFrame(scrollDetailViewToTop);
        }
    }, 180);
}

function bindDetailRealtime(clientId) {
    clearDetailRealtimeChannels();
    if (!window.supabaseClient || !clientId) return;

    const makeChannel = (name, table, filter) => {
        const channel = window.supabaseClient
            .channel(`${name}-${clientId}-${Date.now()}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table,
                filter
            }, () => scheduleDetailRefresh(clientId))
            .subscribe();
        detailRealtimeChannels.push(channel);
    };

    makeChannel('detail-client', 'clients', `id=eq.${clientId}`);
    makeChannel('detail-schedules', 'schedules', `client_id=eq.${clientId}`);
    makeChannel('detail-histories', 'histories', `client_id=eq.${clientId}`);
    makeChannel('detail-cardlab-attempts', 'cardlab_learning_attempts', `client_id=eq.${clientId}`);
    makeChannel('detail-cardlab-progress', 'cardlab_learning_stage_progress', `client_id=eq.${clientId}`);
    makeChannel('detail-cardlab-wrong', 'cardlab_learning_wrong_stats', `client_id=eq.${clientId}`);
}

async function openClientDetail(el, clientOrName, ageGender, statusTxt, statusClass, options = {}) {
    if (detailResetTimer) {
        clearTimeout(detailResetTimer);
        detailResetTimer = null;
    }
    document.querySelectorAll('.draggable-item').forEach((item) => item.classList.remove('active'));
    const triggerEl = el && el.classList && typeof el.classList.add === 'function' ? el : null;
    if (triggerEl) triggerEl.classList.add('active');
    const previousDetailClientId = String(currentDetailClientId || '').trim();

    let client = null;
    if (!clientOrName && el && typeof el === 'object' && !triggerEl) {
        client = el;
    } else if (clientOrName && typeof clientOrName === 'object') {
        client = clientOrName;
    } else {
        const name = String(clientOrName || '').trim();
        client = (window.appClients || []).find((item) => String(item.name || '').trim() === name) || null;
    }

    if (!client) {
        currentDetailClientId = '';
        currentDetailActionStep = '';
        currentDetailActionDeleteFuture = false;
        clearDetailRealtimeChannels();
        renderDetailActionControls(null);
        if (triggerEl) triggerEl.classList.remove('active');
        document.getElementById('detailMainTitle').innerText = '내담자 상세 정보';
        document.getElementById('detail-empty-state').style.display = 'flex';
        document.getElementById('detail-content-area').style.display = 'none';
        updateShellViewState('calendar');
        persistShellViewState({ detailClientId: '', detailScheduleDate: currentDetailScheduleDate });
        return;
    } else {
        currentDetailClientId = String(client.id);
        if (!options.preserveDetailSubTab) {
            currentDetailSubTab = 'sub-info';
        }
        if (previousDetailClientId !== currentDetailClientId) {
            currentDetailScheduleDate = new Date();
        }
        currentDetailData = { histories: [], cardlabAttempts: [], cardlabProgress: [], cardlabWrongStats: [] };
        currentDetailActionStep = '';
        currentDetailActionDeleteFuture = false;
        document.getElementById('detailMainTitle').innerText = `${client.name || '내담자'} 상세 정보`;
        renderDetailView(client);
        bindDetailRealtime(currentDetailClientId);
        await loadDetailSupplementalData(client);
        if (previousDetailClientId !== currentDetailClientId) {
            showBottomToast(`${client.name || '선택한 대상'} ${client.type === 'reserve' ? '예약자를 선택했습니다.' : '내담자를 선택했습니다.'}`);
        }
    }

    const filterStatuses = ['초기세션', '보호자동반', '그룹세션'];
    const statusMeta = client ? getClientStatusMeta(client, client.type === 'reserve' ? 'reserve' : 'client') : null;
    const effectiveStatusTxt = String(statusTxt || statusMeta?.label || '').trim();
    const effectiveStatusClass = String(statusClass || statusMeta?.badgeClass || '').trim();
    const badge = document.getElementById('detailStatusBadge');
    if (badge) {
        if (!effectiveStatusTxt || filterStatuses.includes(effectiveStatusTxt)) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'inline-block';
            badge.innerText = effectiveStatusTxt;
            badge.className = `status-badge ${effectiveStatusClass || 'status-active'}`;
        }
    }

    document.getElementById('detail-empty-state').style.display = 'none';
    document.getElementById('detail-content-area').style.display = 'block';
    toggleDetailTabVisibility(client || { type: 'reserve' });
    activateDetailSubTab(options.preserveDetailSubTab ? (currentDetailSubTab || 'sub-info') : 'sub-info');
    updateShellViewState('detail');
    persistShellViewState({
        detailClientId: currentDetailClientId,
        detailSubTab: currentDetailSubTab,
        detailScheduleDate: currentDetailScheduleDate
    });
    requestAnimationFrame(() => {
        scrollDetailViewToTop();
    });
}

function goToList() {
    if (currentShellView === 'lab') {
        confirmCloseLabCenter();
        return;
    }
    if (detailResetTimer) {
        clearTimeout(detailResetTimer);
        detailResetTimer = null;
    }
    currentDetailClientId = '';
    currentDetailActionStep = '';
    currentDetailActionDeleteFuture = false;
    currentDetailScheduleDate = new Date();
    currentDetailData = { histories: [], cardlabAttempts: [], cardlabProgress: [], cardlabWrongStats: [] };
    clearDetailRealtimeChannels();
    updateShellViewState('calendar');
    persistShellViewState({ detailClientId: '', detailScheduleDate: currentDetailScheduleDate });
    detailResetTimer = setTimeout(() => {
        document.getElementById('detail-empty-state').style.display = 'flex';
        document.getElementById('detail-content-area').style.display = 'none';
        document.querySelectorAll('.draggable-item').forEach((item) => item.classList.remove('active'));
        renderDetailActionControls(null);
        detailResetTimer = null;
    }, 350);
}

function populateClassClientSelect(selectedClientId = '') {
    const select = document.getElementById('classClientSelect');
    if (!select) return;

    const clients = getClassModalClientOptions();
    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '내담자 또는 예약자를 선택해주세요';
    placeholder.disabled = true;
    placeholder.selected = !selectedClientId;
    select.appendChild(placeholder);

    if (!clients.length) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '등록된 내담자/예약자가 없습니다';
        option.selected = true;
        select.appendChild(option);
        select.disabled = true;
        syncClassRegistrationMode();
        return;
    }

    select.disabled = false;
    clients.forEach((client) => {
        const option = document.createElement('option');
        option.value = getClientSelectionValue(client);
        option.textContent = getClientDisplayLabel(client);
        if (selectedClientId && String(option.value) === String(selectedClientId)) option.selected = true;
        select.appendChild(option);
    });
    syncClassRegistrationMode();
}

function setClassClientSectionVisible(isVisible) {
    const section = document.getElementById('classClientSection');
    const select = document.getElementById('classClientSelect');
    if (!section || !select) return;
    section.style.display = isVisible ? 'block' : 'none';
    select.required = isVisible;
    if (!isVisible) select.value = '';
}

function buildScheduleInsertPayload(schedule) {
    return {
        teacher_id: schedule.teacherId || getCurrentTeacherId(),
        client_id: schedule.clientId,
        client_name: schedule.clientName,
        type: schedule.type || 'client',
        date: schedule.date,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
        status: schedule.status || 'scheduled',
        actual_start_time: schedule.actualStartTime || null,
        actual_end_time: schedule.actualEndTime || null,
        memo: schedule.memo || null
    };
}

async function refreshAfterScheduleMutation(detailClientId = '') {
    const nextDetailClientId = String(detailClientId || currentDetailClientId || '').trim();
    await loadAppData({ preserveDetail: Boolean(nextDetailClientId), detailClientId: nextDetailClientId });
    if (!nextDetailClientId) return;
    const detailClient = findClientById(nextDetailClientId);
    if (detailClient) {
        renderDetailView(detailClient);
        await loadDetailSupplementalData(detailClient);
    }
}

async function resolveScheduleConflict(method) {
    if (!pendingScheduleConflict || !window.supabaseClient) return;
    const conflictData = pendingScheduleConflict;
    closeScheduleConflictModal();
    const teacherId = getCurrentTeacherId();

    const { newSchedule, conflicts = [], originalSchedule, closeModalId, detailClientId } = conflictData;
    const isMove = Boolean(originalSchedule);

    if (method === 'manual') {
        if (typeof conflictData.manualAction === 'function') {
            conflictData.manualAction();
        }
        return;
    }

    if (method === 'push') {
        const baseRangeCheck = validateScheduleWindow(newSchedule.startTime, newSchedule.endTime);
        if (!baseRangeCheck.ok) {
            showBottomToast(baseRangeCheck.message);
            return;
        }

        const sortedConflicts = [...conflicts].sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')));
        let currentTime = newSchedule.endTime;
        const updates = [];

        for (const conflict of sortedConflicts) {
            const duration = Math.max(1, calculateDurationMinutes(conflict.startTime, conflict.endTime) || 50);
            const nextStart = currentTime;
            const nextEnd = addMinutesToTime(nextStart, duration);
            const rangeCheck = validateScheduleWindow(nextStart, nextEnd);
            if (!rangeCheck.ok) {
                showBottomToast('겹치는 일정을 뒤로 밀면 22:00 이후로 넘어가 등록할 수 없습니다.');
                return;
            }
            updates.push({ id: conflict.id, startTime: nextStart, endTime: nextEnd });
            currentTime = nextEnd;
        }

        const { error } = await window.supabaseClient.rpc('apply_schedule_conflict_push', {
            p_teacher_id: String(teacherId || ''),
            p_operation: isMove ? 'move' : 'insert',
            p_schedule: isMove
                ? {
                    id: String(originalSchedule.id || ''),
                    date: newSchedule.date,
                    start_time: newSchedule.startTime,
                    end_time: newSchedule.endTime
                }
                : buildScheduleInsertPayload(newSchedule),
            p_updates: updates.map((update) => ({
                id: String(update.id || ''),
                start_time: update.startTime,
                end_time: update.endTime
            }))
        });
        if (error) {
            showAlert(`일정 자동 조정 중 오류가 발생했습니다. 변경된 일정은 없습니다. (${error.message || error})`);
            return;
        }

        await refreshAfterScheduleMutation(detailClientId || originalSchedule?.clientId || originalSchedule?.client_id || newSchedule.clientId || currentDetailClientId);
        showBottomToast(isMove ? '수업이 이동되고 기존 일정들이 조정되었습니다.' : '일정이 등록되고 기존 일정들이 조정되었습니다.');
        if (!isMove && closeModalId) closeModal(closeModalId);
        return;
    }

    if (method === 'adjust') {
        const sortedConflicts = [...conflicts].sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')));
        const firstConflict = sortedConflicts[0];
        if (!firstConflict || String(firstConflict.startTime || '') <= String(newSchedule.startTime || '')) {
            showBottomToast('같은 시간대 수업이 있어 단축이 불가능합니다.');
            return;
        }

        const adjustedEndTime = String(firstConflict.startTime || '').slice(0, 5);
        const rangeCheck = validateScheduleWindow(newSchedule.startTime, adjustedEndTime);
        if (!rangeCheck.ok) {
            showBottomToast(rangeCheck.message);
            return;
        }

        if (isMove) {
            let moveQuery = window.supabaseClient.from('schedules').update({
                date: newSchedule.date,
                start_time: newSchedule.startTime,
                end_time: adjustedEndTime
            }).eq('id', originalSchedule.id);
            if (teacherId) moveQuery = moveQuery.eq('teacher_id', teacherId);
            const { error } = await moveQuery;
            if (error) {
                showAlert(`일정 이동 중 오류가 발생했습니다: ${error.message || error}`);
                return;
            }
            await refreshAfterScheduleMutation(detailClientId || originalSchedule.clientId || originalSchedule.client_id || currentDetailClientId);
            showBottomToast('수업이 이동되고 시간이 자동 단축되었습니다.');
        } else {
            const { error } = await window.supabaseClient.from('schedules').insert([buildScheduleInsertPayload({
                ...newSchedule,
                endTime: adjustedEndTime
            })]);
            if (error) {
                showAlert(`일정 저장 중 오류가 발생했습니다: ${error.message || error}`);
                return;
            }
            await refreshAfterScheduleMutation(detailClientId || newSchedule.clientId || currentDetailClientId);
            showBottomToast('일정이 자동 단축되어 등록되었습니다.');
            if (closeModalId) closeModal(closeModalId);
        }
    }
}

async function applyScheduleEdit(request, scope = 'single') {
    if (!window.supabaseClient || !request?.originalSchedule) return;
    const { originalSchedule, selectedClient, startDate, startTime, endTime, memo } = request;
    const teacherId = getCurrentTeacherId();
    const futureSchedules = scope === 'future' ? getScheduleFutureSeriesCandidates(originalSchedule, getVisibleSchedules()) : [];
    const schedulesToUpdate = [originalSchedule, ...futureSchedules];
    const targetIdSet = new Set(schedulesToUpdate.map((schedule) => String(schedule.id)));
    const dayOffset = getDateDayOffset(originalSchedule.date, startDate);
    const updates = schedulesToUpdate.map((schedule) => {
        const baseDate = parseLocalDateInput(schedule.date);
        const shiftedDate = baseDate ? addDaysLocal(baseDate, dayOffset) : parseLocalDateInput(startDate);
        return {
            id: schedule.id,
            date: shiftedDate ? formatDateLocal(shiftedDate) : startDate,
            startTime,
            endTime,
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            type: selectedClient.type || 'client',
            memo,
            original: schedule
        };
    });

    const conflictTarget = updates.find((update) => getVisibleSchedules().some((schedule) => (
        !targetIdSet.has(String(schedule.id))
        && schedule.date === update.date
        && checkTimeOverlap(update.startTime, update.endTime, schedule.startTime, schedule.endTime)
    )));

    if (conflictTarget) {
        showBottomToast(scope === 'future' && futureSchedules.length > 0
            ? '이후 일정까지 변경하면 겹치는 일정이 생깁니다.'
            : '해당 시간에 이미 등록된 일정이 있습니다.');
        return;
    }

    for (const update of updates) {
        let updateQuery = window.supabaseClient.from('schedules').update({
            client_id: update.clientId,
            client_name: update.clientName,
            type: update.type,
            date: update.date,
            start_time: update.startTime,
            end_time: update.endTime,
            memo: update.memo || null
        }).eq('id', update.id);
        if (teacherId) updateQuery = updateQuery.eq('teacher_id', teacherId);
        const { error } = await updateQuery;
        if (error) {
            showAlert(`일정 변경 중 오류가 발생했습니다: ${error.message || error}`);
            return;
        }
    }

    await refreshAfterScheduleMutation(selectedClient.id || currentDetailClientId);
    closeModal('classRegistrationModal');
    showBottomToast(scope === 'future' && futureSchedules.length > 0
        ? `선택한 일정과 이후 ${futureSchedules.length}개의 일정이 함께 변경되었습니다.`
        : '일정이 변경되었습니다.');
}

function openClassRegistrationModal(mode = 'manual') {
    const detailClient = currentDetailClientId ? findClientById(currentDetailClientId) : null;
    const defaultClientId = detailClient ? String(detailClient.id) : '';
    currentEditingClassId = null;
    currentClassModalMode = mode;
    currentClassModalClientId = mode === 'manual' ? defaultClientId : '';
    currentClassModalSingleMode = false;
    document.getElementById('classRegModalTitle').innerText = mode === 'calendar'
        ? '일정 추가'
        : (detailClient?.type === 'reserve' ? '일정 등록' : '수업 등록');
    document.getElementById('btnSaveClass').innerText = '등록하기';
    document.getElementById('btnDeleteClass').style.display = 'none';
    setClassClientSectionVisible(mode !== 'manual' || Boolean(defaultClientId));
    populateClassClientSelect(currentClassModalClientId);
    document.getElementById('classStartDate').value = formatDateLocal(new Date());
    document.getElementById('classStartTime').value = '14:00';
    document.getElementById('classSingleMode').checked = false;
    document.getElementById('classIsBiweekly').checked = false;
    document.querySelectorAll('.day-chip').forEach((chip) => chip.classList.remove('active'));
    syncClassRegistrationMode();
    document.getElementById('classRegistrationModal').classList.add('active');
    resetModalDirty();
}

function openEditClassModal(id) {
    const schedule = (window.appSchedules || []).find((item) => String(item.id) === String(id));
    if (!schedule) {
        showAlert('수정할 일정을 찾지 못했습니다.');
        return;
    }
    currentEditingClassId = String(id);
    currentClassModalMode = 'edit';
    currentClassModalClientId = String(schedule.clientId || schedule.client_id || '');
    currentClassModalSingleMode = true;
    document.getElementById('classRegModalTitle').innerText = '수업 수정';
    document.getElementById('btnSaveClass').innerText = '수정 완료';
    document.getElementById('btnDeleteClass').style.display = 'block';
    setClassClientSectionVisible(true);
    populateClassClientSelect(currentClassModalClientId);
    document.getElementById('classStartDate').value = schedule.date || formatDateLocal(new Date());
    document.getElementById('classStartTime').value = String(schedule.startTime || '').slice(0, 5) || '14:00';
    document.getElementById('classSingleMode').checked = true;
    document.getElementById('classIsBiweekly').checked = /격주/.test(String(schedule.memo || ''));
    const scheduleDate = parseLocalDateInput(schedule.date);
    const scheduleDay = scheduleDate ? scheduleDate.getDay() : 1;
    const dayLabel = WEEKDAY_COLUMNS[scheduleDay === 0 ? 6 : scheduleDay - 1];
    document.querySelectorAll('.day-chip').forEach((chip) => {
        chip.classList.toggle('active', chip.innerText.trim() === dayLabel);
    });
    syncClassRegistrationMode();
    document.getElementById('classRegistrationModal').classList.add('active');
    resetModalDirty();
}

function generateScheduleDates(startDate, selectedDayIndexes, isBiweekly) {
    const baseDate = parseLocalDateInput(startDate);
    if (!baseDate) return [];
    const daySet = new Set(selectedDayIndexes);
    const results = [];
    const intervalDays = isBiweekly ? 14 : 7;

    for (let offset = 0; offset < 365; offset += 1) {
        const date = addDaysLocal(baseDate, offset);
        if (!date) continue;
        if (!daySet.has(date.getDay())) continue;
        const diff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(diff / 7);
        if (isBiweekly && weeks % 2 !== 0) continue;
        results.push(formatDateLocal(date));
    }

    return Array.from(new Set(results)).sort((a, b) => a.localeCompare(b));
}

async function submitClassRegistration() {
    if (!window.supabaseClient || !getCurrentTeacherId()) {
        showAlert('로그인 정보가 확인되지 않아 일정을 저장할 수 없습니다.');
        return;
    }

    const startDate = document.getElementById('classStartDate').value;
    const startTime = String(document.getElementById('classStartTime').value || '').slice(0, 5);
    const isBiweekly = document.getElementById('classIsBiweekly').checked;
    const activeDays = Array.from(document.querySelectorAll('.day-chip.active')).map((chip) => chip.innerText.trim());
    const selectedClient = getSelectedClassModalClient();
    const isSingleMode = currentClassModalMode === 'edit'
        ? true
        : (String(selectedClient?.type || '') === 'reserve' || Boolean(document.getElementById('classSingleMode')?.checked));

    if (!selectedClient) {
        showAlert('내담자 또는 예약자를 선택해주세요.');
        return;
    }
    if (!startDate || !startTime) {
        showAlert('시작 일자와 시간을 입력해주세요.');
        return;
    }
    if (currentClassModalMode !== 'edit' && !isSingleMode && !activeDays.length) {
        showAlert('수업 요일을 최소 하나 이상 선택해주세요.');
        return;
    }

    const duration = Math.max(1, Number(selectedClient.sessionTime || 50) || 50);
    const endTime = addMinutesToTime(startTime, duration);
    const rangeCheck = validateScheduleWindow(startTime, endTime);
    if (!rangeCheck.ok) {
        showBottomToast(`${rangeCheck.message} (허용 범위 ${SCHEDULE_START_TIME}~${SCHEDULE_END_TIME})`);
        return;
    }
    const teacherId = getCurrentTeacherId();
    const dayMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };
    const targetDates = currentClassModalMode === 'edit' || isSingleMode
        ? [startDate]
        : generateScheduleDates(startDate, activeDays.map((day) => dayMap[day]), isBiweekly).slice(0, 52);
    const memo = !isSingleMode && isBiweekly ? '격주' : null;

    try {
        if (currentClassModalMode === 'edit' && currentEditingClassId) {
            const originalSchedule = (window.appSchedules || []).find((item) => String(item.id) === String(currentEditingClassId));
            if (!originalSchedule) {
                showAlert('수정할 일정을 찾지 못했습니다.');
                return;
            }
            const hasChanges = (
                String(originalSchedule.clientId || originalSchedule.client_id || '') !== String(selectedClient.id)
                || String(originalSchedule.date || '') !== startDate
                || String(originalSchedule.startTime || '').slice(0, 5) !== startTime
                || String(originalSchedule.endTime || '').slice(0, 5) !== endTime
                || String(originalSchedule.memo || '') !== String(memo || '')
            );
            if (!hasChanges) {
                closeModal('classRegistrationModal');
                showBottomToast('변경된 내용이 없습니다.');
                return;
            }

            const editRequest = { originalSchedule, selectedClient, startDate, startTime, endTime, memo };
            const futureSchedules = getScheduleFutureSeriesCandidates(originalSchedule, getVisibleSchedules());
            if (futureSchedules.length > 0) {
                showScheduleEditScopeModal(editRequest, futureSchedules.length);
                return;
            }
            await applyScheduleEdit(editRequest, 'single');
        } else {
            const conflictsByDate = targetDates
                .map((dateValue) => ({
                    date: dateValue,
                    conflicts: getVisibleSchedules().filter((schedule) => (
                        schedule.date === dateValue
                        && checkTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)
                    ))
                }))
                .filter((entry) => entry.conflicts.length > 0);

            if (conflictsByDate.length > 0) {
                const firstConflict = conflictsByDate[0];
                showScheduleConflictModal({
                    newSchedule: {
                        teacherId,
                        clientId: selectedClient.id,
                        clientName: selectedClient.name,
                        type: selectedClient.type || 'client',
                        date: firstConflict.date,
                        startTime,
                        endTime,
                        status: 'scheduled',
                        memo
                    },
                    conflicts: firstConflict.conflicts,
                    closeModalId: 'classRegistrationModal',
                    detailClientId: selectedClient.id
                });
                return;
            }

            const rows = targetDates.map((dateValue) => buildScheduleInsertPayload({
                teacherId,
                clientId: selectedClient.id,
                clientName: selectedClient.name,
                type: selectedClient.type || 'client',
                date: dateValue,
                startTime,
                endTime,
                status: 'scheduled',
                memo
            }));
            const { error } = await window.supabaseClient.from('schedules').insert(rows);
            if (error) throw error;
            await refreshAfterScheduleMutation(currentDetailClientId || selectedClient.id);
            showAlert('일정이 등록되었습니다.', () => closeModal('classRegistrationModal'));
            return;
        }
        return;
    } catch (error) {
        console.error('[ScheduleSave] failed:', error);
        showAlert(`일정 저장 중 오류가 발생했습니다: ${error.message || error}`);
    }
}

async function handleDeleteClassFromModal() {
    if (!currentEditingClassId || !window.supabaseClient) return;
    const targetSchedule = (window.appSchedules || []).find((item) => String(item.id) === String(currentEditingClassId));
    if (!targetSchedule) {
        showAlert('삭제할 일정을 찾지 못했습니다.');
        return;
    }

    const futureSchedules = getScheduleFutureSeriesCandidates(targetSchedule, getVisibleSchedules());
    const allSeriesSchedules = getScheduleSeriesCandidates(targetSchedule, getVisibleSchedules());
    const teacherId = getCurrentTeacherId();

    const deleteByScope = async (scope) => {
        const schedulesToDelete = scope === 'all'
            ? allSeriesSchedules
            : scope === 'future'
                ? [targetSchedule, ...futureSchedules]
                : [targetSchedule];
        const targetIds = schedulesToDelete.map((schedule) => schedule?.id).filter(Boolean);
        if (!targetIds.length) {
            showAlert('삭제할 일정을 찾지 못했습니다.');
            return;
        }

        const query = targetIds.length === 1
            ? window.supabaseClient.from('schedules').delete().eq('id', targetIds[0])
            : window.supabaseClient.from('schedules').delete().in('id', targetIds);
        const scopedQuery = teacherId
            ? (targetIds.length === 1
                ? query.eq('teacher_id', teacherId)
                : query.eq('teacher_id', teacherId))
            : query;
        const { error } = await scopedQuery;
        if (error) {
            showAlert(`수업 삭제 중 오류가 발생했습니다: ${error.message || error}`);
            return;
        }

        await refreshAfterScheduleMutation(currentDetailClientId || targetSchedule.clientId || targetSchedule.client_id);
        closeModal('classRegistrationModal');
        if (scope === 'future' && futureSchedules.length > 0) {
            showBottomToast(`선택한 일정과 이후 ${futureSchedules.length}개의 일정이 삭제되었습니다.`);
            return;
        }
        if (scope === 'all' && allSeriesSchedules.length > 1) {
            showBottomToast('연결된 전체 일정이 삭제되었습니다.');
            return;
        }
        showBottomToast('일정이 삭제되었습니다(기록 보존)');
    };

    if (futureSchedules.length > 0 || allSeriesSchedules.length > 1) {
        showRecurringDeleteConfirm({
            title: '수업 일정 삭제',
            description: futureSchedules.length > 0
                ? `이 일정과 이어지는 이후 ${futureSchedules.length}개의 일정이 있습니다. 삭제 범위를 선택해주세요.`
                : '연결된 일정이 있어 삭제 범위를 선택해주세요.',
            options: [
                'one',
                ...(futureSchedules.length > 0 ? ['future'] : []),
                ...(allSeriesSchedules.length > 1 ? ['all'] : [])
            ],
            labels: {
                one: '이번 일정만 삭제',
                future: '이번 포함 이후 일정 삭제',
                all: '연결된 전체 일정 삭제'
            },
            onOk: deleteByScope
        });
        return;
    }

    showConfirm('일정을 삭제하시겠습니까?', () => deleteByScope('one'));
}

function openMyPage() {
    document.getElementById('myPageModal').classList.add('active');
    switchMyPageTab('profile');
    setProfileEditMode(false);
    syncMyPageSettingsControls();
    updateMyPageProfileView();
    syncKakaoContactFloatVisibility();
}

function openPolicyDocument(type = 'terms') {
    const normalized = String(type || '').trim().toLowerCase() === 'privacy' ? 'privacy' : 'terms';
    const targetUrl = new URL(`./${normalized}.html`, window.location.href).href;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

function switchMyPageTab(tabId) {
    document.querySelectorAll('.mypage-menu-item').forEach((item) => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.mypage-tab-content').forEach((content) => content.classList.remove('active'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add('active');
}

async function saveProfile() {
    const profile = window.currentProfile;
    if (!profile?.id || !window.supabaseClient) {
        showAlert('프로필 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    if (!myPageProfileEditMode) {
        setProfileEditMode(true);
        document.getElementById('myPageFieldCenter')?.focus();
        return;
    }

    const centerInput = document.getElementById('myPageFieldCenter');
    const contactInput = document.getElementById('myPageFieldContact');
    const genderInput = document.getElementById('myPageFieldGender');
    const ageInput = document.getElementById('myPageFieldAge');
    if (!centerInput || !contactInput || !genderInput || !ageInput) {
        showAlert('저장할 필드를 찾지 못했습니다.');
        return;
    }

    const payload = {
        center: centerInput.value.trim() || profile.center,
        contact: contactInput.value.trim(),
        gender: genderInput.value.trim(),
        age: ageInput.value.trim()
    };

    let updateQuery = window.supabaseClient.from('teachers').update(payload).eq('id', profile.id);
    const teacherId = String(profile.teacherId || profile.teacher_id || '').trim();
    if (teacherId) updateQuery = updateQuery.eq('teacher_id', teacherId);
    const { error } = await updateQuery;
    if (error) {
        showAlert(`저장 중 오류가 발생했습니다: ${error.message}`);
        return;
    }

    Object.assign(window.currentProfile, payload);
    if (typeof window.persistTeacherSession === 'function') {
        window.currentProfile = window.persistTeacherSession(window.currentProfile);
    }
    if (typeof window._updateGnbProfile === 'function') {
        window._updateGnbProfile(window.currentProfile);
    } else {
        const nameEl = document.getElementById('gnbProfileName');
        const avatarEl = document.getElementById('gnbAvatarInitial');
        if (nameEl) nameEl.textContent = `${window.currentProfile.name || '-'}${window.currentProfile.center ? ` (${window.currentProfile.center})` : ''}`;
        if (avatarEl) avatarEl.textContent = (window.currentProfile.name || '?').charAt(0);
    }
    setProfileEditMode(false);
    updateMyPageProfileView();
    showBottomToast('프로필 정보가 저장되었습니다.');
}

function isMissingDbObjectError(error) {
    const message = String(error?.message || error?.details || error?.hint || error || '').toLowerCase();
    return [
        'does not exist',
        'schema cache',
        'could not find',
        'relation',
        'table',
        'function'
    ].some((token) => message.includes(token));
}

function slugifyWorksheetCategory(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function normalizeWorksheetTags(value) {
    const rawValues = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(/[,，\n]/g)
            : Array.isArray(parseMaybeJson(value, []))
                ? parseMaybeJson(value, [])
                : [];
    return Array.from(new Set(rawValues.map((item) => String(item || '').trim()).filter(Boolean)));
}

function normalizeWorksheetAssets(value) {
    const parsed = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? parseMaybeJson(value, [])
            : parseMaybeJson(value, []);
    return (Array.isArray(parsed) ? parsed : [])
        .map((asset, index) => {
            if (typeof asset === 'string') {
                const text = String(asset || '').trim();
                return text ? {
                    key: '',
                    url: text,
                    downloadUrl: text,
                    name: `자료 ${index + 1}`,
                    storageProvider: 'url',
                    contentType: 'image/*',
                    size: 0
                } : null;
            }

            const normalized = asset || {};
            const url = String(normalized.url || normalized.downloadUrl || '').trim();
            const key = String(normalized.key || normalized.storageKey || '').trim();
                const name = String(normalized.name || normalized.fileName || normalized.filename || `자료 ${index + 1}`).trim();
                if (!url && !key && !name) return null;
                const inferredContentType = /\.pdf($|\?)/i.test(`${name} ${url} ${key}`) ? 'application/pdf' : 'image/*';
                return {
                    ...normalized,
                    key,
                    url,
                    downloadUrl: url,
                    name,
                    storageProvider: String(normalized.storageProvider || (key ? 'r2' : 'url')).trim(),
                    contentType: String(normalized.contentType || normalized.mimeType || inferredContentType).trim(),
                    size: Number(normalized.size || 0) || 0
                };
            })
        .filter(Boolean);
}

function isWorksheetPdfAsset(asset = {}) {
    const type = String(asset?.contentType || asset?.mimeType || '').toLowerCase();
    const source = String(`${asset?.name || ''} ${asset?.url || ''} ${asset?.downloadUrl || ''} ${asset?.key || ''}`).toLowerCase();
    return type === 'application/pdf' || /\.pdf($|\?|\s)/i.test(source);
}

function isWorksheetImageAsset(asset = {}) {
    if (isWorksheetPdfAsset(asset)) return false;
    const type = String(asset?.contentType || asset?.mimeType || '').toLowerCase();
    const source = String(`${asset?.name || ''} ${asset?.url || ''} ${asset?.downloadUrl || ''} ${asset?.key || ''}`).toLowerCase();
    return type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)($|\?|\s)/i.test(source);
}

function getWorksheetAssetKindLabel(asset = {}) {
    return isWorksheetPdfAsset(asset) ? 'PDF' : '이미지';
}

function getWorksheetAssetCountLabel(assets = []) {
    const list = Array.isArray(assets) ? assets : [];
    const pdfCount = list.filter((asset) => isWorksheetPdfAsset(asset)).length;
    const imageCount = Math.max(0, list.length - pdfCount);
    if (pdfCount && imageCount) return `이미지 ${imageCount}장 · PDF ${pdfCount}개`;
    if (pdfCount) return `PDF ${pdfCount}개`;
    return `${list.length}장`;
}

function normalizeWorksheetRow(row = {}) {
    const normalized = keysToCamel(row || {});
    const categoryId = String(normalized.categoryId || normalized.category_id || '').trim();
    const title = String(normalized.title || '').trim();
    return {
        ...normalized,
        id: normalized.id,
        categoryId,
        category_id: categoryId,
        categoryTitle: String(normalized.categoryTitle || normalized.category_title || '').trim(),
        title,
        hashtags: normalizeWorksheetTags(normalized.hashtags),
        thumbnailUrl: String(normalized.thumbnailUrl || normalized.thumbnail_url || '').trim(),
        assets: normalizeWorksheetAssets(normalized.assets),
        downloadCount: Number(normalized.downloadCount ?? normalized.download_count ?? 0) || 0,
        isHidden: (normalized.isHidden ?? normalized.is_hidden ?? false) === true,
        isActive: (normalized.isActive ?? normalized.is_active ?? true) !== false,
        createdAt: normalized.createdAt || normalized.created_at || '',
        updatedAt: normalized.updatedAt || normalized.updated_at || ''
    };
}

function normalizeWorksheetCategoryRow(row = {}) {
    const normalized = keysToCamel(row || {});
    const title = String(normalized.title || '').trim();
    const id = String(normalized.id || slugifyWorksheetCategory(title) || '').trim();
    return {
        ...normalized,
        id,
        title,
        description: String(normalized.description || '').trim(),
        sortOrder: Number(normalized.sortOrder ?? normalized.sort_order ?? 0) || 0,
        isActive: (normalized.isActive ?? normalized.is_active ?? true) !== false
    };
}

function mergeWorksheetCategories(rows = []) {
    const mapped = new Map();
    rows.forEach((row) => {
        const normalized = normalizeWorksheetCategoryRow(row);
        if (!normalized.id) return;
        mapped.set(normalized.id, normalized);
    });
    return Array.from(mapped.values()).sort((a, b) => {
        const sortDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
        if (sortDiff !== 0) return sortDiff;
        return String(a.title || '').localeCompare(String(b.title || ''));
    });
}

function getWorksheetAssetDisplayName(worksheetTitle, assetIndex) {
    const baseTitle = String(worksheetTitle || '출력 자료').trim() || '출력 자료';
    return `${baseTitle}_${String(assetIndex + 1).padStart(2, '0')}`;
}

function getWorksheetAssetExtension(asset, blob) {
    const assetName = String(asset?.name || '').toLowerCase();
    const blobType = String(blob?.type || '').toLowerCase();
    const matchedName = assetName.match(/\.([a-z0-9]+)$/i)?.[1];
    if (matchedName) return matchedName;
    if (isWorksheetPdfAsset(asset)) return 'pdf';
    if (blobType === 'image/jpeg') return 'jpg';
    if (blobType === 'image/png') return 'png';
    if (blobType === 'image/webp') return 'webp';
    if (blobType === 'application/pdf') return 'pdf';
    return 'jpg';
}

function isFreshWorksheetSignedUrl(entry) {
    return !!entry?.url && Number(entry?.expiresAt || 0) > Date.now() + 30_000;
}

function resolveWorksheetAssetUrl(asset, overrideCache = {}) {
    if (!asset) return '';
    const directUrl = String(asset.url || asset.downloadUrl || '').trim();
    if (directUrl) return directUrl;
    const key = String(asset.key || '').trim();
    if (!key) return '';
    const overrideEntry = overrideCache[key];
    if (overrideEntry && isFreshWorksheetSignedUrl(overrideEntry)) return overrideEntry.url;
    const cachedEntry = outputAssetUrlCache[key];
    if (cachedEntry && isFreshWorksheetSignedUrl(cachedEntry)) return cachedEntry.url;
    return '';
}

function getWorksheetSameOriginAssetUrl(asset = {}) {
    const key = String(asset?.key || '').trim().replace(/^\/+/, '');
    if (!key || !/^worksheets\/originals\//i.test(key)) return '';
    const origin = String(window.location?.origin || '').trim();
    if (!origin || origin === 'null') return '';
    return `${origin}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

async function callWorksheetStorageFunction(payload = {}) {
    if (!window.supabaseClient) {
        throw new Error('SUPABASE_CLIENT_NOT_READY');
    }

    const { data: sessionData, error: sessionError } = await window.supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    const accessToken = String(sessionData?.session?.access_token || '').trim();
    if (!accessToken) {
        throw new Error('OUTPUT_LOGIN_REQUIRED');
    }
    if (OUTPUT_CENTER_ACCESS_POLICY.requiresPaid) {
        throw new Error('OUTPUT_POLICY_MISCONFIGURED');
    }

    const baseUrl = typeof SUPABASE_URL !== 'undefined'
        ? SUPABASE_URL
        : 'https://gxungzlecmibgvykoiib.supabase.co';
    const apiKey = typeof SUPABASE_KEY !== 'undefined'
        ? SUPABASE_KEY
        : 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';

    const response = await fetch(`${baseUrl}/functions/v1/${WORKSHEET_STORAGE_FUNCTION}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload || {})
    });

    let result = null;
    try {
        result = await response.json();
    } catch (_) {
        result = null;
    }

    if (!response.ok || result?.error) {
        const error = new Error(result?.error || result?.message || `WORKSHEET_STORAGE_${response.status}`);
        error.payload = result || null;
        throw error;
    }

    return result?.data && !result.items ? result.data : (result || {});
}

async function ensureWorksheetAssetUrls(assets = []) {
    const keys = Array.from(new Set(
        (Array.isArray(assets) ? assets : [])
            .map((asset) => String(asset?.key || '').trim())
            .filter(Boolean)
            .filter((key) => {
                const cached = outputAssetUrlCache[key];
                const loading = outputAssetUrlLoading[key];
                return !isFreshWorksheetSignedUrl(cached) && !loading;
            })
    ));

    if (keys.length === 0) return {};

    setOutputAssetLoadingState(keys, true);
    try {
        const result = await callWorksheetStorageFunction({
            action: 'createDownloadUrls',
            keys
        });
        const items = Array.isArray(result?.items) ? result.items : [];
        const overrideCache = {};
        items.forEach((item) => {
            const key = String(item?.key || '').trim();
            const url = String(item?.downloadUrl || item?.url || '').trim();
            if (!key || !url) return;
            const expiresAt = Date.now() + Math.max(60, Number(item?.expiresIn || 20 * 60)) * 1000;
            overrideCache[key] = { url, expiresAt };
        });
        if (Object.keys(overrideCache).length > 0) {
            outputAssetUrlCache = { ...outputAssetUrlCache, ...overrideCache };
        }
        return overrideCache;
    } catch (error) {
        console.warn('[Output] signed url fetch failed:', error);
        return {};
    } finally {
        setOutputAssetLoadingState(keys, false);
    }
}

function setOutputAssetLoadingState(keys, isLoading) {
    const nextState = { ...outputAssetUrlLoading };
    keys.forEach((key) => {
        if (isLoading) {
            nextState[key] = true;
        } else {
            delete nextState[key];
        }
    });
    outputAssetUrlLoading = nextState;
}

function isJpegAsset(asset, blob) {
    const assetName = String(asset?.name || '').toLowerCase();
    const blobType = String(blob?.type || '').toLowerCase();
    return /\.jpe?g($|\?)/i.test(assetName) || blobType === 'image/jpeg';
}

function createImageElementFromBlob(blob) {
    return new Promise((resolve, reject) => {
        const tempUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(tempUrl);
            resolve(img);
        };
        img.onerror = (error) => {
            URL.revokeObjectURL(tempUrl);
            reject(error);
        };
        img.src = tempUrl;
    });
}

async function appendWorksheetWatermarkToJpeg(blob) {
    const sourceImage = await createImageElementFromBlob(blob);
    const footerHeight = Math.max(64, Math.round(sourceImage.height * 0.09));
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height + footerHeight;
    const context = canvas.getContext('2d');
    if (!context) return blob;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);

    context.fillStyle = '#f8fafc';
    context.fillRect(0, sourceImage.height, canvas.width, footerHeight);
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = Math.max(1, Math.round(sourceImage.width * 0.002));
    context.beginPath();
    context.moveTo(0, sourceImage.height);
    context.lineTo(canvas.width, sourceImage.height);
    context.stroke();

    const fontSize = Math.max(12, Math.round(footerHeight * 0.2));
    context.fillStyle = '#111827';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `800 ${fontSize}px Pretendard, Apple SD Gothic Neo, sans-serif`;
    context.fillText('© HAHALAB', canvas.width / 2, sourceImage.height + (footerHeight / 2));

    const watermarkedBlob = await new Promise((resolve) => {
        canvas.toBlob((nextBlob) => resolve(nextBlob || blob), 'image/jpeg', 0.95);
    });
    return watermarkedBlob || blob;
}

async function syncWorksheetDownloadCount(worksheetId, count) {
    const numericId = Number(worksheetId);
    if (!Number.isFinite(numericId) || numericId <= 0 || count <= 0) return;
    const { error } = await window.supabaseClient.rpc('increment_worksheet_download', {
        p_worksheet_id: numericId,
        p_downloaded_count: count
    });
    if (error && !isMissingDbObjectError(error)) {
        console.warn('[Output] download count update failed:', error);
    }
}

async function downloadWorksheetAsset(asset, worksheetTitle, assetIndex, overrideCache = {}) {
    const sameOriginUrl = getWorksheetSameOriginAssetUrl(asset);
    const resolvedUrl = sameOriginUrl || resolveWorksheetAssetUrl(asset, overrideCache);
    if (!resolvedUrl) {
        throw new Error('ASSET_URL_NOT_READY');
    }
    if (isWorksheetPdfAsset(asset)) {
        const link = document.createElement('a');
        link.href = resolvedUrl;
        link.download = `하하랩-${getWorksheetAssetDisplayName(worksheetTitle || '자료', assetIndex)}.${getWorksheetAssetExtension(asset)}`;
        link.target = '_blank';
        link.rel = 'noopener';
        link.style.display = 'none';
        document.body.appendChild(link);
        await new Promise((resolve) => {
            window.setTimeout(() => {
                link.click();
                window.setTimeout(() => link.remove(), 1000);
                resolve();
            }, 0);
        });
        return;
    }
    const response = await fetch(resolvedUrl);
    if (!response.ok) throw new Error('DOWNLOAD_FAILED');
    const originalBlob = await response.blob();
    const blob = isJpegAsset(asset, originalBlob)
        ? await appendWorksheetWatermarkToJpeg(originalBlob)
        : originalBlob;
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fallbackName = `하하랩-${getWorksheetAssetDisplayName(worksheetTitle || '자료', assetIndex)}.${getWorksheetAssetExtension(asset, blob)}`;
    link.href = objectUrl;
    link.download = fallbackName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function getVisibleWorksheetCategories() {
    return mergeWorksheetCategories(window.appWorksheetCategories || []).filter((item) => (item.isActive ?? true) !== false);
}

function getVisibleWorksheets() {
    return (window.appWorksheets || []).filter((worksheet) => (worksheet.isHidden ?? false) !== true);
}

function getFilteredWorksheetsForOutput() {
    const visibleWorksheets = getVisibleWorksheets();
    return visibleWorksheets.filter((worksheet) => {
        const worksheetCategoryId = String(worksheet.categoryId || worksheet.category_id || '').trim();
        if (currentOutputCategoryId && worksheetCategoryId !== currentOutputCategoryId) return false;
        if (!currentOutputSearchTerm) return true;
        const title = String(worksheet.title || '').toLowerCase();
        const tags = normalizeWorksheetTags(worksheet.hashtags).join(' ').toLowerCase();
        const assetNames = normalizeWorksheetAssets(worksheet.assets).map((asset) => String(asset.name || '').toLowerCase()).join(' ');
        return [title, tags, assetNames].some((text) => text.includes(currentOutputSearchTerm));
    });
}

function getOutputSelectedWorksheet() {
    const worksheets = getFilteredWorksheetsForOutput();
    if (currentOutputWorksheetId) {
        const selected = worksheets.find((item) => String(item.id) === String(currentOutputWorksheetId));
        if (selected) return selected;
    }
    return null;
}

function getOutputWorksheetIndex(worksheetId) {
    const worksheets = getFilteredWorksheetsForOutput();
    return worksheets.findIndex((item) => String(item.id) === String(worksheetId));
}

function setOutputSelectionState(worksheet, resetAssets = true) {
    currentOutputWorksheetId = String(worksheet?.id || '');
    if (resetAssets) {
        const assets = normalizeWorksheetAssets(worksheet?.assets);
        currentOutputAssetSelection = assets.map((_, index) => String(index));
        currentOutputPreviewIndex = 0;
    }
    if (worksheet?.assets?.length) {
        const missingAssets = normalizeWorksheetAssets(worksheet.assets).filter((asset) => (
            asset.key
            && isWorksheetImageAsset(asset)
            && !resolveWorksheetAssetUrl(asset)
        ));
        if (missingAssets.length > 0) {
            ensureWorksheetAssetUrls(missingAssets).then(() => {
                if (String(currentOutputWorksheetId) === String(worksheet.id)) {
                    renderOutputCenter();
                }
            });
        }
    }
    persistShellViewState({ outputWorksheetId: currentOutputWorksheetId });
}

function openOutputWorksheetDetail(worksheetId) {
    const worksheet = getFilteredWorksheetsForOutput().find((item) => String(item.id) === String(worksheetId)) || null;
    if (!worksheet) return;
    currentOutputDetailOpen = true;
    setOutputSelectionState(worksheet, true);
    persistShellViewState({ outputWorksheetId: currentOutputWorksheetId, outputDetailOpen: true });
    renderOutputCenter();
}

function closeOutputWorksheetDetail() {
    currentOutputDetailOpen = false;
    currentOutputWorksheetId = '';
    currentOutputAssetSelection = [];
    currentOutputPreviewIndex = 0;
    persistShellViewState({ outputWorksheetId: '', outputDetailOpen: false });
    renderOutputCenter();
}

function moveOutputWorksheetDetail(direction = 1) {
    const worksheets = getFilteredWorksheetsForOutput();
    if (!worksheets.length) return;
    let currentIndex = getOutputWorksheetIndex(currentOutputWorksheetId);
    if (currentIndex < 0) currentIndex = 0;
    const nextIndex = (currentIndex + Number(direction || 0) + worksheets.length) % worksheets.length;
    const worksheet = worksheets[nextIndex];
    if (!worksheet) return;
    currentOutputDetailOpen = true;
    setOutputSelectionState(worksheet, true);
    persistShellViewState({ outputWorksheetId: currentOutputWorksheetId, outputDetailOpen: true });
    renderOutputCenter();
}

function setOutputCategoryFilter(categoryId = '') {
    currentOutputCategoryId = String(categoryId || '').trim();
    persistShellViewState({ outputCategoryId: currentOutputCategoryId });
    renderOutputCenter();
}

function setOutputSearchTerm(value = '') {
    currentOutputSearchTerm = String(value || '').trim().toLowerCase();
    persistShellViewState({ outputSearchTerm: currentOutputSearchTerm });
    renderOutputCenter();
}

function setOutputPreviewIndex(index = 0) {
    currentOutputPreviewIndex = Math.max(0, Number(index) || 0);
    persistShellViewState({ outputPreviewIndex: currentOutputPreviewIndex });
    renderOutputCenter();
}

function toggleOutputAssetSelection(index = 0) {
    const key = String(index);
    currentOutputAssetSelection = currentOutputAssetSelection.includes(key)
        ? currentOutputAssetSelection.filter((item) => item !== key)
        : [...currentOutputAssetSelection, key];
    persistShellViewState();
    renderOutputCenter();
}

function setOutputAssetSelectionMode(mode = 'all') {
    const selectedWorksheet = getOutputSelectedWorksheet();
    const assets = normalizeWorksheetAssets(selectedWorksheet?.assets);
    if (mode === 'none') {
        currentOutputAssetSelection = [];
    } else {
        currentOutputAssetSelection = assets.map((_, index) => String(index));
    }
    persistShellViewState();
    renderOutputCenter();
}

function updateShellViewState(view = 'calendar') {
    currentShellView = normalizeShellView(view);
    const container = document.getElementById('mainContainer');
    const labView = document.getElementById('lab-view');
    if (container) {
        container.classList.toggle('detail-active', currentShellView === 'detail');
        container.classList.toggle('output-active', currentShellView === 'output');
        container.classList.toggle('message-active', currentShellView === 'message');
    }
    document.body.classList.toggle('lab-active', currentShellView === 'lab');
    if (labView) {
        labView.hidden = currentShellView !== 'lab';
        labView.setAttribute('aria-hidden', currentShellView === 'lab' ? 'false' : 'true');
    }
    const outputBtn = document.getElementById('gnbOutputBtn');
    if (outputBtn) {
        outputBtn.classList.toggle('active', currentShellView === 'output');
    }
    const notificationBtn = document.getElementById('gnbNotificationBtn');
    if (notificationBtn) {
        notificationBtn.classList.toggle('active', currentShellView === 'message');
    }
    syncShellViewUrl(currentShellView);
    persistShellViewState({ view: currentShellView });
    syncKakaoContactFloatVisibility();
}

function syncKakaoContactFloatVisibility() {
    const button = document.getElementById('kakaoContactFloat');
    if (!button) return;
    const myPageOpen = document.getElementById('myPageModal')?.classList.contains('active') === true;
    const shouldShow = currentShellView === 'calendar' || myPageOpen;
    button.classList.toggle('is-hidden', !shouldShow);
}

function scrollOutputViewToTop() {
    const grid = document.getElementById('outputWorksheetGrid');
    const detailPane = document.getElementById('outputDetailPane');
    const detailScroll = detailPane?.querySelector('.output-detail-scroll');
    if (grid) grid.scrollTop = 0;
    if (detailScroll) detailScroll.scrollTop = 0;
}

function renderOutputCenter() {
    const categoryListEl = document.getElementById('outputCategoryList');
    const featureMessageEl = document.getElementById('outputFeatureMessage');
    const gridEl = document.getElementById('outputWorksheetGrid');
    const detailPaneEl = document.getElementById('outputDetailPane');
    const searchInput = document.getElementById('outputSearchInput');
    const resultPillEl = document.getElementById('outputResultPill');
    if (!categoryListEl || !gridEl || !detailPaneEl) return;

    const categories = getVisibleWorksheetCategories();
    const visibleWorksheets = getVisibleWorksheets();
    if (currentOutputCategoryId && !categories.some((category) => String(category.id) === String(currentOutputCategoryId))) {
        currentOutputCategoryId = '';
    }
    const filteredWorksheets = getFilteredWorksheetsForOutput();
    const isEmptyGridState = (outputLibraryLoading && visibleWorksheets.length === 0) || filteredWorksheets.length === 0;
    gridEl.classList.toggle('is-empty', isEmptyGridState);

    if (searchInput && searchInput.value !== currentOutputSearchTerm) {
        searchInput.value = currentOutputSearchTerm;
    }

    if (resultPillEl) {
        const activeCategory = categories.find((category) => String(category.id) === String(currentOutputCategoryId));
        const scopeLabel = activeCategory?.title || '전체';
        resultPillEl.textContent = `${scopeLabel} ${filteredWorksheets.length}`;
    }

    let selectedWorksheet = null;
    if (currentOutputWorksheetId) {
        selectedWorksheet = filteredWorksheets.find((item) => String(item.id) === String(currentOutputWorksheetId)) || null;
    }
    if (currentOutputDetailOpen && !selectedWorksheet && filteredWorksheets.length > 0) {
        selectedWorksheet = filteredWorksheets[0];
        setOutputSelectionState(selectedWorksheet, true);
    }
    if (currentOutputDetailOpen && !selectedWorksheet && filteredWorksheets.length === 0) {
        currentOutputDetailOpen = false;
        currentOutputWorksheetId = '';
        currentOutputAssetSelection = [];
        currentOutputPreviewIndex = 0;
    }

    categoryListEl.innerHTML = [
        `
            <button type="button" class="output-category-btn${!currentOutputCategoryId ? ' active' : ''}" onclick="setOutputCategoryFilter('')">
                <span class="output-category-main">
                    <span class="output-category-title">전체 자료</span>
                </span>
            </button>
        `,
        ...categories.map((category) => `
            <button type="button" class="output-category-btn${String(currentOutputCategoryId) === String(category.id) ? ' active' : ''}" onclick="setOutputCategoryFilter('${escapeHtml(String(category.id || ''))}')">
                <span class="output-category-main">
                    <span class="output-category-title">${escapeHtml(category.title || '카테고리')}</span>
                </span>
            </button>
        `)
    ].join('');

    if (featureMessageEl) {
        const message = outputLibraryLoading
            ? '출력소 자료를 불러오는 중입니다.'
            : String(outputFeatureMessage || '').trim();
        featureMessageEl.style.display = message ? 'block' : 'none';
        featureMessageEl.textContent = message;
    }

    if (outputLibraryLoading && visibleWorksheets.length === 0) {
        gridEl.innerHTML = `
            <div class="output-grid-empty">
                <span class="material-symbols-outlined">hourglass_empty</span>
                <div class="output-grid-empty-title">출력소 자료를 불러오는 중입니다.</div>
            </div>
        `;
        detailPaneEl.hidden = true;
        detailPaneEl.setAttribute('aria-hidden', 'true');
        detailPaneEl.innerHTML = '';
        detailPaneEl.onclick = null;
        return;
    }

    if (filteredWorksheets.length === 0) {
        gridEl.innerHTML = `
            <div class="output-grid-empty">
                <span class="material-symbols-outlined">image_search</span>
                <div class="output-grid-empty-title">조건에 맞는 출력 자료가 없습니다.</div>
                <div class="output-grid-empty-desc">관리자에서 자료를 등록하면 이곳에 바로 나타납니다.</div>
            </div>
        `;
        detailPaneEl.hidden = true;
        detailPaneEl.setAttribute('aria-hidden', 'true');
        detailPaneEl.innerHTML = '';
        detailPaneEl.onclick = null;
        return;
    }

    const categoryMap = new Map(categories.map((category) => [String(category.id), category]));
    gridEl.innerHTML = filteredWorksheets.map((worksheet) => {
        const category = categoryMap.get(String(worksheet.categoryId || worksheet.category_id || '')) || null;
        const assets = normalizeWorksheetAssets(worksheet.assets);
        const isActive = String(worksheet.id) === String(selectedWorksheet?.id || currentOutputWorksheetId);
        const firstImageAsset = assets.find((asset) => isWorksheetImageAsset(asset) && resolveWorksheetAssetUrl(asset));
        const representativeAsset = assets[0] || null;
        const thumbnailUrl = String(worksheet.thumbnailUrl || worksheet.thumbnail_url || '').trim() || resolveWorksheetAssetUrl(firstImageAsset) || '';
        return `
            <button
                type="button"
                class="output-card${isActive ? ' active' : ''}"
                onclick="selectOutputWorksheet('${escapeHtml(String(worksheet.id || ''))}')"
            >
                <div class="output-card-thumb">
                    ${thumbnailUrl ? `
                        <img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(worksheet.title || '출력 자료')}" loading="lazy" decoding="async">
                    ` : `
                        <div class="output-card-thumb-empty">
                            <span class="material-symbols-outlined" style="font-size: 30px;">${isWorksheetPdfAsset(representativeAsset) ? 'picture_as_pdf' : 'image'}</span>
                        </div>
                    `}
                </div>
                <div class="output-card-body">
                    <div class="output-card-meta">
                        <div class="min-w-0">
                            <div class="output-card-category">${escapeHtml(category?.title || '기본 자료')}</div>
                            <div class="output-card-title">${escapeHtml(worksheet.title || '제목 없음')}</div>
                        </div>
                        <span class="output-card-chip">${escapeHtml(getWorksheetAssetCountLabel(assets))}</span>
                    </div>
                    <div class="output-card-tags">
                        ${normalizeWorksheetTags(worksheet.hashtags).slice(0, 3).map((tag) => `
                            <span class="output-card-tag">#${escapeHtml(tag)}</span>
                        `).join('')}
                    </div>
                </div>
            </button>
        `;
    }).join('');

    if (!currentOutputDetailOpen || !selectedWorksheet) {
        detailPaneEl.hidden = true;
        detailPaneEl.setAttribute('aria-hidden', 'true');
        detailPaneEl.innerHTML = '';
        detailPaneEl.onclick = null;
        return;
    }

    const selectedCategory = categoryMap.get(String(selectedWorksheet.categoryId || selectedWorksheet.category_id || '')) || null;
    const selectedIndex = Math.max(0, filteredWorksheets.findIndex((item) => String(item.id) === String(selectedWorksheet.id)));
    const selectedAssets = normalizeWorksheetAssets(selectedWorksheet.assets);
    if (currentOutputPreviewIndex >= selectedAssets.length) {
        currentOutputPreviewIndex = 0;
    }
    const previewAsset = selectedAssets[currentOutputPreviewIndex] || selectedAssets[0] || null;
    const previewIsPdf = isWorksheetPdfAsset(previewAsset);
    const previewUrl = previewIsPdf
        ? ''
        : (resolveWorksheetAssetUrl(previewAsset) || String(selectedWorksheet.thumbnailUrl || selectedWorksheet.thumbnail_url || '').trim());
    if (!previewIsPdf && previewAsset?.key && !previewUrl) {
        ensureWorksheetAssetUrls([previewAsset]).then(() => {
            if (String(currentOutputWorksheetId) === String(selectedWorksheet.id)) {
                renderOutputCenter();
            }
        });
    }
    const selectedAssetRows = selectedAssets.map((asset, index) => {
        const assetUrl = resolveWorksheetAssetUrl(asset);
        const assetIsPdf = isWorksheetPdfAsset(asset);
        const isSelected = currentOutputAssetSelection.includes(String(index));
        const isPreviewing = Number(currentOutputPreviewIndex) === index;
        return `
            <div class="output-asset-item${isPreviewing ? ' active' : ''}">
                <label class="output-asset-check-wrap" aria-label="${escapeHtml(getWorksheetAssetDisplayName(selectedWorksheet.title, index))} 선택">
                    <input type="checkbox" class="output-asset-check" ${isSelected ? 'checked' : ''} onchange="toggleOutputAssetSelection(${index})">
                </label>
                <button type="button" class="output-asset-thumb${assetIsPdf ? ' is-pdf' : ''}" onclick="setOutputPreviewIndex(${index})">
                    ${assetUrl && !assetIsPdf ? `
                        <img src="${escapeHtml(assetUrl)}" alt="${escapeHtml(getWorksheetAssetDisplayName(selectedWorksheet.title, index))}" loading="lazy" decoding="async">
                    ` : `
                        <span class="material-symbols-outlined" style="font-size: 20px; color: ${assetIsPdf ? '#ef4444' : '#cbd5e1'};">${assetIsPdf ? 'picture_as_pdf' : 'image'}</span>
                    `}
                </button>
                <div class="output-asset-meta">
                    <div class="output-asset-name">${escapeHtml(getWorksheetAssetDisplayName(selectedWorksheet.title, index))}</div>
                    <div class="output-asset-type">${escapeHtml(getWorksheetAssetKindLabel(asset))} · ${escapeHtml(asset.contentType || 'image/*')}</div>
                </div>
                <button type="button" class="output-asset-download-btn" onclick="handleOutputDownload('one', ${index})" ${outputDownloadLoading ? 'disabled' : ''} aria-label="${escapeHtml(getWorksheetAssetDisplayName(selectedWorksheet.title, index))} 다운로드">
                    <span class="material-symbols-outlined">download</span>
                </button>
            </div>
        `;
    }).join('');
    const selectedCount = currentOutputAssetSelection.filter((item) => Number(item) >= 0 && Number(item) < selectedAssets.length).length;

    detailPaneEl.innerHTML = `
        <div class="output-detail-panel" role="dialog" aria-modal="true" aria-label="출력소 상세 보기" onclick="event.stopPropagation()">
            <div class="output-detail-header">
                <div class="output-detail-header-main">
                    <div class="output-detail-kicker">PRINT SHOP DETAIL</div>
                    <div class="output-detail-header-title">${escapeHtml(selectedWorksheet.title || '제목 없음')}</div>
                    <div class="output-detail-header-sub">${escapeHtml(selectedCategory?.title || '기본 자료')} · ${selectedIndex + 1} / ${filteredWorksheets.length}</div>
                </div>
                <div class="output-detail-nav-group">
                    <button type="button" class="output-detail-nav-btn" onclick="moveOutputWorksheetDetail(-1)" aria-label="이전 자료">
                        <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button type="button" class="output-detail-nav-btn" onclick="moveOutputWorksheetDetail(1)" aria-label="다음 자료">
                        <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                    <button type="button" class="output-detail-close-btn" onclick="closeOutputWorksheetDetail()" aria-label="닫기">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
            <div class="output-detail-body">
                <div class="output-detail-scroll">
                    <div class="output-detail-preview">
                        ${previewIsPdf ? `
                            <div class="output-pdf-preview">
                                <span class="material-symbols-outlined">picture_as_pdf</span>
                                <strong>PDF 자료</strong>
                                <p>미리보기 대신 다운로드로 확인해주세요.</p>
                            </div>
                        ` : previewUrl ? `
                            <img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(selectedWorksheet.title || '출력 자료')}" loading="lazy" decoding="async">
                            <div class="output-detail-watermark" aria-hidden="true"><span>HAHALAB</span></div>
                        ` : `
                            <div class="output-detail-preview-empty">
                                <span class="material-symbols-outlined" style="font-size: 34px;">draft</span>
                                <div style="font-size: 12px; font-weight: 700;">미리보기를 불러올 수 없습니다</div>
                            </div>
                        `}
                    </div>
                    <div class="output-detail-meta">
                        <div class="output-detail-category">${escapeHtml(selectedCategory?.title || '기본 자료')}</div>
                        <div class="output-detail-title">${escapeHtml(selectedWorksheet.title || '제목 없음')}</div>
                        <div class="output-detail-desc">
                            ${escapeHtml(selectedWorksheet.description || selectedCategory?.description || '관리자에서 등록한 출력 자료입니다.')}
                        </div>
                        <div class="output-detail-tags">
                            <span class="output-card-chip">등록일 ${escapeHtml(formatDateTimeDisplay(selectedWorksheet.createdAt || selectedWorksheet.created_at || new Date()))}</span>
                            <span class="output-card-chip">다운로드 ${Number(selectedWorksheet.downloadCount || selectedWorksheet.download_count || 0)}회</span>
                            <span class="output-card-chip">${escapeHtml(getWorksheetAssetCountLabel(selectedAssets))}</span>
                        </div>
                        <div class="output-detail-tags">
                            ${normalizeWorksheetTags(selectedWorksheet.hashtags).map((tag) => `<span class="output-detail-tag">#${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="output-detail-actions">
                        <button type="button" class="output-detail-action-btn ghost" onclick="handleOutputDownload('one', ${Number(currentOutputPreviewIndex) || 0})" ${outputDownloadLoading || selectedAssets.length === 0 ? 'disabled' : ''}>
                            현재 자료 다운로드
                        </button>
                        <button type="button" class="output-detail-action-btn primary" onclick="handleOutputDownload('selected')" ${outputDownloadLoading ? 'disabled' : ''}>
                            선택 ${selectedCount}개 다운로드
                        </button>
                        <button type="button" class="output-detail-action-btn secondary" onclick="handleOutputDownload('all')" ${outputDownloadLoading ? 'disabled' : ''}>
                            전체 ${selectedAssets.length}개 다운로드
                        </button>
                    </div>
                    <div class="output-detail-assets">
                        <div class="output-detail-assets-head">
                            <div>
                                <strong>다운로드할 자료</strong>
                                <span>${selectedCount} / ${selectedAssets.length}개 선택됨</span>
                            </div>
                            <div class="output-detail-assets-tools">
                                <button type="button" onclick="setOutputAssetSelectionMode('all')">전체 선택</button>
                                <button type="button" onclick="setOutputAssetSelectionMode('none')">선택 해제</button>
                            </div>
                        </div>
                        ${selectedAssetRows || `
                            <div class="output-detail-empty" style="padding: 28px 16px;">
                                <span class="material-symbols-outlined">draft</span>
                                <h3>첨부 자료가 없습니다.</h3>
                                <p>관리자에서 이미지 또는 PDF가 연결되면 이곳에 표시됩니다.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    detailPaneEl.hidden = false;
    detailPaneEl.setAttribute('aria-hidden', 'false');
    detailPaneEl.onclick = (event) => {
        if (event.target === detailPaneEl) {
            closeOutputWorksheetDetail();
        }
    };
}

async function loadWorksheetLibraryData() {
    if (!window.supabaseClient) return;
    outputLibraryLoading = true;
    outputFeatureMessage = '';
    renderOutputCenter();

    try {
        const [categoryResult, worksheetResult] = await Promise.all([
            window.supabaseClient.from('worksheet_categories').select('*').order('sort_order', { ascending: true }),
            window.supabaseClient.from('worksheets').select('*').order('created_at', { ascending: false })
        ]);

        if (categoryResult.error) {
            if (!isMissingDbObjectError(categoryResult.error)) {
                console.error('[Output] category load failed:', categoryResult.error);
                outputFeatureMessage = '출력소 카테고리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
            } else {
                outputFeatureMessage = '출력소 기능 준비 중입니다. 관리자 SQL 패치 적용 후 자동으로 활성화됩니다.';
            }
            window.appWorksheetCategories = [];
        } else {
            window.appWorksheetCategories = mergeWorksheetCategories(categoryResult.data || []);
        }

        if (worksheetResult.error) {
            if (!isMissingDbObjectError(worksheetResult.error)) {
                console.error('[Output] worksheet load failed:', worksheetResult.error);
                outputFeatureMessage = outputFeatureMessage || '출력소 자료를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
            } else {
                outputFeatureMessage = outputFeatureMessage || '출력소 자료가 아직 등록되지 않았습니다. 관리자에서 먼저 등록해주세요.';
            }
            window.appWorksheets = [];
        } else {
            window.appWorksheets = (worksheetResult.data || []).map((row) => normalizeWorksheetRow(row));
            if (window.appWorksheets.length === 0 && !outputFeatureMessage) {
                outputFeatureMessage = '출력소 자료가 아직 등록되지 않았습니다. 관리자에서 먼저 등록해주세요.';
            }
        }

        if (outputRealtimeChannels.length === 0) {
            bindOutputRealtime();
        }
    } catch (error) {
        console.error('[Output] load failed:', error);
        outputFeatureMessage = '출력소 자료를 불러오는 중 오류가 발생했습니다.';
        window.appWorksheetCategories = [];
        window.appWorksheets = [];
    } finally {
        outputLibraryLoading = false;
        renderOutputCenter();
    }
}

function clearOutputRealtimeChannels() {
    if (!window.supabaseClient) return;
    outputRealtimeChannels.forEach((channel) => {
        try {
            window.supabaseClient.removeChannel(channel);
        } catch (_error) {
            // noop
        }
    });
    outputRealtimeChannels = [];
}

function scheduleOutputRefresh() {
    clearTimeout(outputRefreshTimer);
    outputRefreshTimer = window.setTimeout(() => {
        loadWorksheetLibraryData();
    }, 180);
}

function bindOutputRealtime() {
    clearOutputRealtimeChannels();
    if (!window.supabaseClient) return;

    ['worksheet_categories', 'worksheets'].forEach((table) => {
        const channel = window.supabaseClient
            .channel(`output-${table}-${Date.now()}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table
            }, () => scheduleOutputRefresh())
            .subscribe();
        outputRealtimeChannels.push(channel);
    });
}

function selectOutputWorksheet(worksheetId) {
    const worksheet = getFilteredWorksheetsForOutput().find((item) => String(item.id) === String(worksheetId)) || null;
    if (!worksheet) return;
    currentOutputDetailOpen = true;
    setOutputSelectionState(worksheet, true);
    renderOutputCenter();
}

async function handleOutputDownload(mode = 'selected', assetIndex = null) {
    const selectedWorksheet = getOutputSelectedWorksheet();
    if (!selectedWorksheet) {
        showBottomToast('선택된 출력 자료가 없습니다.');
        return;
    }

    const selectedAssets = normalizeWorksheetAssets(selectedWorksheet.assets);
    const targetAssets = selectedAssets
        .map((asset, index) => ({ asset, index }))
        .filter((entry) => (
            mode === 'all'
            || (mode === 'one' && entry.index === Number(assetIndex))
            || (mode !== 'one' && currentOutputAssetSelection.includes(String(entry.index)))
        ));

    if (targetAssets.length === 0) {
        showBottomToast('다운로드할 자료를 먼저 선택해주세요.');
        return;
    }

    outputDownloadLoading = true;
    renderOutputCenter();
    try {
        const fetchedSignedUrls = await ensureWorksheetAssetUrls(targetAssets.map((entry) => entry.asset));
        const orderedTargetAssets = [
            ...targetAssets.filter((entry) => !isWorksheetPdfAsset(entry.asset)),
            ...targetAssets.filter((entry) => isWorksheetPdfAsset(entry.asset))
        ];
        for (const { asset, index } of orderedTargetAssets) {
            if (!asset.url && asset.key && !resolveWorksheetAssetUrl(asset, fetchedSignedUrls)) {
                throw new Error('ASSET_URL_NOT_READY');
            }
            await downloadWorksheetAsset(asset, selectedWorksheet.title, index, fetchedSignedUrls);
            await new Promise((resolve) => setTimeout(resolve, isWorksheetPdfAsset(asset) ? 350 : 120));
        }
        await syncWorksheetDownloadCount(selectedWorksheet.id, targetAssets.length);
        const nextCount = Number(selectedWorksheet.downloadCount || selectedWorksheet.download_count || 0) + targetAssets.length;
        window.appWorksheets = (window.appWorksheets || []).map((item) => (
            String(item.id) === String(selectedWorksheet.id)
                ? { ...item, downloadCount: nextCount, download_count: nextCount }
                : item
        ));
        outputFeatureMessage = outputFeatureMessage || '';
        showBottomToast(`${targetAssets.length}개 자료 다운로드를 시작했습니다.`);
        renderOutputCenter();
    } catch (error) {
        console.error('[Output] download failed:', error);
        showBottomToast('자료 다운로드 준비 중 오류가 발생했습니다.');
    } finally {
        outputDownloadLoading = false;
        renderOutputCenter();
    }
}

function openOutputCenter() {
    updateShellViewState('output');
    currentOutputCategoryId = '';
    currentOutputSearchTerm = '';
    currentOutputDetailOpen = false;
    currentOutputWorksheetId = '';
    currentOutputAssetSelection = [];
    currentOutputPreviewIndex = 0;
    persistShellViewState({
        view: 'output',
        outputCategoryId: currentOutputCategoryId,
        outputSearchTerm: currentOutputSearchTerm,
        outputWorksheetId: '',
        outputDetailOpen: false
    });
    if ((!window.appWorksheets || window.appWorksheets.length === 0) && !outputLibraryLoading) {
        loadWorksheetLibraryData();
    } else {
        renderOutputCenter();
    }
    requestAnimationFrame(scrollOutputViewToTop);
}

function normalizeMessageCategoryRow(row = {}) {
    const normalized = keysToCamel(row || {});
    const slug = String(normalized.slug || normalized.id || '').trim().toLowerCase();
    const id = String(normalized.id || slug || '').trim();
    return {
        ...normalized,
        id,
        slug: slug || id || 'other',
        title: String(normalized.title || normalized.name || '기타').trim() || '기타',
        description: String(normalized.description || '').trim(),
        sortOrder: Number(normalized.sortOrder ?? normalized.sort_order ?? 0) || 0,
        isActive: (normalized.isActive ?? normalized.is_active ?? true) !== false,
        isSystem: (normalized.isSystem ?? normalized.is_system ?? false) === true
    };
}

function getDefaultMessageCategories() {
    return [
        { id: 'message', slug: 'message', title: '메시지', description: '개별 사용자 알림', sortOrder: 1, isActive: true, isSystem: true },
        { id: 'notice', slug: 'notice', title: '공지사항', description: '기본 공지', sortOrder: 2, isActive: true, isSystem: true },
        { id: 'event', slug: 'event', title: '이벤트', description: '프로모션, 이벤트', sortOrder: 3, isActive: true, isSystem: true },
        { id: 'update', slug: 'update', title: '업데이트', description: '기능 변경 및 배포', sortOrder: 4, isActive: true, isSystem: true },
        { id: 'other', slug: 'other', title: '기타', description: '기타 운영 알림', sortOrder: 5, isActive: true, isSystem: true }
    ];
}

function isDirectMessageCategorySlug(value = '') {
    return String(value || '').trim().toLowerCase() === 'message';
}

function mergeMessageCategories(rows = []) {
    const map = new Map();
    getDefaultMessageCategories().forEach((row) => {
        const normalized = normalizeMessageCategoryRow(row);
        map.set(normalized.slug, normalized);
    });
    (Array.isArray(rows) ? rows : []).forEach((row) => {
        const normalized = normalizeMessageCategoryRow(row);
        if (!normalized.slug && !normalized.id) return;
        map.set(normalized.slug || normalized.id, normalized);
    });
    return Array.from(map.values())
        .filter((item) => item.isActive !== false)
        .sort((a, b) => {
            const sortDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
            if (sortDiff !== 0) return sortDiff;
            return String(a.title || '').localeCompare(String(b.title || ''));
        });
}

function normalizeAppMessageRow(row = {}) {
    const normalized = keysToCamel(row || {});
    const categorySlug = String(normalized.categorySlug || normalized.category_slug || '').trim().toLowerCase();
    const deliveryScope = String(normalized.deliveryScope || normalized.delivery_scope || 'teacher').trim().toLowerCase();
    const recipientScope = String(normalized.recipientScope || normalized.recipient_scope || (deliveryScope === 'public' ? 'public' : 'all_members')).trim().toLowerCase();
    return {
        ...normalized,
        id: String(normalized.id || '').trim(),
        categoryId: String(normalized.categoryId || normalized.category_id || '').trim(),
        categorySlug: categorySlug || 'notice',
        title: String(normalized.title || '제목 없음').trim() || '제목 없음',
        contentHtml: String(normalized.contentHtml || normalized.content_html || '').trim(),
        contentText: String(normalized.contentText || normalized.content_text || '').trim(),
        deliveryScope,
        recipientScope,
        scheduledAt: normalized.scheduledAt || normalized.scheduled_at || normalized.createdAt || normalized.created_at || '',
        isHidden: (normalized.isHidden ?? normalized.is_hidden ?? false) === true,
        createdAt: normalized.createdAt || normalized.created_at || '',
        updatedAt: normalized.updatedAt || normalized.updated_at || ''
    };
}

function getVisibleTeacherMessages() {
    const paidMember = isCurrentTeacherPaidMember();
    const now = Date.now();
    return (window.appMessages || [])
        .map((row) => normalizeAppMessageRow(row))
        .filter((message) => {
            if (!['public', 'teacher'].includes(message.deliveryScope)) return false;
            if (message.isHidden) return false;
            const scheduledMs = message.scheduledAt ? new Date(message.scheduledAt).getTime() : 0;
            if (scheduledMs && scheduledMs > now) return false;
            if (message.deliveryScope === 'public') return true;
            if (message.recipientScope === 'paid_members') return paidMember;
            return true;
        })
        .sort((a, b) => {
            const aTime = new Date(a.scheduledAt || a.createdAt || 0).getTime();
            const bTime = new Date(b.scheduledAt || b.createdAt || 0).getTime();
            return bTime - aTime;
        });
}

function getMessageReadIdSet() {
    return new Set(
        (window.appMessageReads || [])
            .map((row) => String(row.messageId || row.message_id || '').trim())
            .filter(Boolean)
    );
}

function getMessageAudienceLabel(message) {
    switch (String(message?.recipientScope || '').toLowerCase()) {
        case 'paid_members':
            return '유료 회원';
        case 'selected_users':
            return '지정 회원';
        case 'public':
            return '전체 노출';
        default:
            return '전체 회원';
    }
}

function getMessageCategoryMetaMap(messages = []) {
    const merged = mergeMessageCategories(window.appMessageCategories || []);
    const map = new Map(merged.map((category) => [String(category.slug || category.id), category]));
    messages.forEach((message) => {
        const slug = String(message.categorySlug || '').trim().toLowerCase() || 'other';
        if (!map.has(slug)) {
            map.set(slug, normalizeMessageCategoryRow({
                id: slug,
                slug,
                title: slug === 'message'
                    ? '메시지'
                    : slug === 'notice'
                        ? '공지사항'
                        : slug === 'event'
                            ? '이벤트'
                            : slug === 'update'
                                ? '업데이트'
                                : '기타',
                sortOrder: 999,
                isActive: true
            }));
        }
    });
    return map;
}

function renderMessageNotificationState() {
    const notificationBtn = document.getElementById('gnbNotificationBtn');
    const badgeEl = document.getElementById('gnbNotificationBadge');
    const unreadCount = getVisibleTeacherMessages().filter((message) => !getMessageReadIdSet().has(String(message.id))).length;
    if (notificationBtn) {
        notificationBtn.classList.toggle('has-new', unreadCount > 0);
        notificationBtn.classList.toggle('active', currentShellView === 'message');
    }
    if (badgeEl) {
        badgeEl.hidden = unreadCount <= 0;
        badgeEl.textContent = unreadCount > 99 ? '99+' : String(unreadCount || 0);
    }
}

function scrollMessageViewToTop() {
    const list = document.getElementById('messageList');
    if (list) list.scrollTop = 0;
}

function toggleMessageCard(messageId = '') {
    const normalizedId = String(messageId || '').trim();
    if (!normalizedId) return;
    let shouldMarkAsRead = false;
    if (currentExpandedMessageIds.has(normalizedId)) {
        currentExpandedMessageIds.delete(normalizedId);
    } else {
        currentExpandedMessageIds.add(normalizedId);
        shouldMarkAsRead = true;
    }
    renderMessageCenter();
    if (shouldMarkAsRead) {
        markVisibleMessagesAsRead();
    }
}

function renderMessageCenter() {
    const categoryListEl = document.getElementById('messageCategoryList');
    const featureMessageEl = document.getElementById('messageFeatureMessage');
    const listEl = document.getElementById('messageList');
    const unreadSummaryEl = document.getElementById('messageUnreadSummary');
    const summaryHelpEl = document.getElementById('messageSummaryHelp');
    if (!categoryListEl || !listEl) {
        renderMessageNotificationState();
        return;
    }

    const messages = getVisibleTeacherMessages();
    const readIdSet = getMessageReadIdSet();
    const categoryMap = getMessageCategoryMetaMap(messages);
    const categories = Array.from(categoryMap.values())
        .filter((category) => messages.some((message) => String(message.categorySlug || 'other') === String(category.slug || category.id)))
        .sort((a, b) => {
            const sortDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
            if (sortDiff !== 0) return sortDiff;
            return String(a.title || '').localeCompare(String(b.title || ''));
        });

    if (currentMessageCategoryId && !categories.some((category) => String(category.slug || category.id) === String(currentMessageCategoryId))) {
        currentMessageCategoryId = '';
    }

    const countByCategory = messages.reduce((acc, message) => {
        const key = String(message.categorySlug || 'other');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    categoryListEl.innerHTML = [
        `
            <button type="button" class="message-category-btn${!currentMessageCategoryId ? ' active' : ''}" onclick="setMessageCategoryFilter('')">
                <span class="message-category-title">전체</span>
                <span class="message-category-count">${messages.length}</span>
            </button>
        `,
        ...categories.map((category) => {
            const key = String(category.slug || category.id);
            return `
                <button type="button" class="message-category-btn${currentMessageCategoryId === key ? ' active' : ''}" onclick="setMessageCategoryFilter('${escapeHtml(key)}')">
                    <span class="message-category-title">${escapeHtml(category.title || '기타')}</span>
                    <span class="message-category-count">${countByCategory[key] || 0}</span>
                </button>
            `;
        })
    ].join('');

    if (featureMessageEl) {
        featureMessageEl.style.display = 'none';
        featureMessageEl.textContent = '';
    }

    const unreadMessages = messages.filter((message) => !readIdSet.has(String(message.id)));
    if (unreadSummaryEl) unreadSummaryEl.textContent = `${unreadMessages.length}건`;
    if (summaryHelpEl) {
        summaryHelpEl.textContent = '';
        summaryHelpEl.hidden = true;
    }

    const filteredMessages = currentMessageCategoryId
        ? messages.filter((message) => String(message.categorySlug || 'other') === String(currentMessageCategoryId))
        : messages;

    if (messageLibraryLoading && messages.length === 0) {
        listEl.innerHTML = `
            <div class="message-empty">
                <span class="material-symbols-outlined">hourglass_empty</span>
                <div class="message-empty-title">알림을 불러오는 중입니다.</div>
            </div>
        `;
        renderMessageNotificationState();
        return;
    }

    if (filteredMessages.length === 0) {
        listEl.innerHTML = `
            <div class="message-empty">
                <span class="material-symbols-outlined">notifications_off</span>
                <div class="message-empty-title">알림이 없습니다.</div>
            </div>
        `;
        renderMessageNotificationState();
        return;
    }

    listEl.innerHTML = filteredMessages
        .map((message) => {
            const categoryKey = String(message.categorySlug || 'other').trim().toLowerCase();
            const category = categoryMap.get(categoryKey) || normalizeMessageCategoryRow({ slug: categoryKey, title: '기타' });
            const categoryChipClass = isDirectMessageCategorySlug(categoryKey) ? 'message' : 'category';
            const isUnread = !readIdSet.has(String(message.id));
            const isExpanded = currentExpandedMessageIds.has(String(message.id));
            const contentHtml = sanitizeRichMessageHtml(message.contentHtml || '');
            const safeBody = contentHtml || `<p>${escapeHtml(message.contentText || stripHtmlTags(message.contentHtml || '') || '내용이 없습니다.')}</p>`;
            return `
                <article class="message-card${isUnread ? ' is-new' : ''}${isExpanded ? ' is-open' : ''}">
                    <button type="button" class="message-card-toggle" onclick="toggleMessageCard('${escapeHtml(String(message.id || ''))}')">
                        <div class="message-card-meta">
                            <div class="message-card-badges">
                                <span class="message-card-chip ${categoryChipClass}">${escapeHtml(category.title || '기타')}</span>
                                ${isUnread ? '<span class="message-card-chip new">NEW</span>' : ''}
                            </div>
                            <div class="message-card-date">${escapeHtml(formatMessageDateTime(message.scheduledAt || message.createdAt))}</div>
                        </div>
                        <div class="message-card-headline">
                            <div class="message-card-title">${escapeHtml(message.title || '제목 없음')}</div>
                            <span class="message-card-chevron material-symbols-outlined">${isExpanded ? 'expand_less' : 'expand_more'}</span>
                        </div>
                    </button>
                    <div class="message-card-body-wrap${isExpanded ? ' is-open' : ''}">
                        <div class="message-card-body">${safeBody}</div>
                    </div>
                </article>
            `;
        })
        .join('');

    renderMessageNotificationState();
}

function clearMessageRealtimeChannels() {
    if (!window.supabaseClient) return;
    messageRealtimeChannels.forEach((channel) => {
        try {
            window.supabaseClient.removeChannel(channel);
        } catch (_error) {
            // noop
        }
    });
    messageRealtimeChannels = [];
}

function scheduleMessageRefresh() {
    clearTimeout(messageRefreshTimer);
    messageRefreshTimer = window.setTimeout(() => {
        loadMessageLibraryData();
    }, 180);
}

function bindMessageRealtime() {
    clearMessageRealtimeChannels();
    if (!window.supabaseClient) return;
    ['app_message_categories', 'app_messages', 'app_message_targets', 'app_message_reads'].forEach((table) => {
        const channel = window.supabaseClient
            .channel(`message-${table}-${Date.now()}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table
            }, () => scheduleMessageRefresh())
            .subscribe();
        messageRealtimeChannels.push(channel);
    });
}

async function loadMessageLibraryData() {
    const requestEpoch = sensitiveAppEpoch;
    if (!window.supabaseClient || !window.currentProfile) return;
    const teacherId = getCurrentTeacherId();
    if (!teacherId) return;

    messageLibraryLoading = true;
    messageFeatureMessage = '';
    renderMessageCenter();

    try {
        const [categoryResult, messageResult, readResult] = await Promise.all([
            window.supabaseClient.from('app_message_categories').select('*').order('sort_order', { ascending: true }),
            window.supabaseClient.from('app_messages').select('*').in('delivery_scope', ['public', 'teacher']).order('scheduled_at', { ascending: false }).order('created_at', { ascending: false }),
            window.supabaseClient.from('app_message_reads').select('message_id, teacher_id, read_at').eq('teacher_id', teacherId).order('read_at', { ascending: false })
        ]);
        if (requestEpoch !== sensitiveAppEpoch || !window.currentProfile || getCurrentTeacherId() !== teacherId) return;

        if (categoryResult.error) {
            if (!isMissingDbObjectError(categoryResult.error)) {
                console.error('[Message] category load failed:', categoryResult.error);
                messageFeatureMessage = '알림 카테고리를 불러오지 못했습니다.';
            } else {
                messageFeatureMessage = '알림 기능 준비 중입니다.';
            }
            window.appMessageCategories = [];
        } else {
            window.appMessageCategories = (categoryResult.data || []).map((row) => normalizeMessageCategoryRow(row));
        }

        if (messageResult.error) {
            if (!isMissingDbObjectError(messageResult.error)) {
                console.error('[Message] message load failed:', messageResult.error);
                messageFeatureMessage = messageFeatureMessage || '알림을 불러오지 못했습니다.';
            } else {
                messageFeatureMessage = messageFeatureMessage || '알림 테이블이 아직 준비되지 않았습니다.';
            }
            window.appMessages = [];
        } else {
            window.appMessages = (messageResult.data || []).map((row) => normalizeAppMessageRow(row));
            if (window.appMessages.length === 0 && !messageFeatureMessage) {
                messageFeatureMessage = '알림이 없습니다.';
            }
        }

        if (readResult.error) {
            if (!isMissingDbObjectError(readResult.error)) {
                console.error('[Message] reads load failed:', readResult.error);
            }
            window.appMessageReads = [];
        } else {
            window.appMessageReads = keysToCamel(readResult.data || []);
        }

        if (messageRealtimeChannels.length === 0) {
            bindMessageRealtime();
        }
    } catch (error) {
        console.error('[Message] load failed:', error);
        messageFeatureMessage = '알림을 불러오는 중 오류가 발생했습니다.';
        window.appMessageCategories = [];
        window.appMessages = [];
        window.appMessageReads = [];
    } finally {
        messageLibraryLoading = false;
        renderMessageCenter();
    }
}

async function markVisibleMessagesAsRead() {
    if (messageMarkingRead || !window.supabaseClient) return;
    const teacherId = getCurrentTeacherId();
    if (!teacherId) return;

    const readIdSet = getMessageReadIdSet();
    const expandedIdSet = new Set(
        Array.from(currentExpandedMessageIds || [])
            .map((messageId) => String(messageId || '').trim())
            .filter(Boolean)
    );
    const unreadRows = getVisibleTeacherMessages()
        .filter((message) => expandedIdSet.has(String(message.id || '').trim()))
        .filter((message) => !readIdSet.has(String(message.id)))
        .map((message) => ({
            message_id: String(message.id || '').trim(),
            teacher_id: teacherId,
            read_at: new Date().toISOString()
        }))
        .filter((row) => row.message_id);

    if (!unreadRows.length) {
        renderMessageNotificationState();
        return;
    }

    messageMarkingRead = true;
    try {
        const { data, error } = await window.supabaseClient
            .from('app_message_reads')
            .upsert(unreadRows, { onConflict: 'message_id,teacher_id' })
            .select('message_id, teacher_id, read_at');
        if (error) {
            if (!isMissingDbObjectError(error)) {
                console.warn('[Message] mark read failed:', error);
            }
            return;
        }
        const nextMap = new Map(
            (window.appMessageReads || []).map((row) => [String(row.messageId || row.message_id || ''), keysToCamel(row)])
        );
        (data || []).forEach((row) => {
            const normalized = keysToCamel(row);
            nextMap.set(String(normalized.messageId || normalized.message_id || ''), normalized);
        });
        window.appMessageReads = Array.from(nextMap.values());
        renderMessageCenter();
    } catch (error) {
        console.warn('[Message] mark read exception:', error);
    } finally {
        messageMarkingRead = false;
        renderMessageNotificationState();
    }
}

function setMessageCategoryFilter(categoryId = '') {
    currentMessageCategoryId = String(categoryId || '').trim();
    currentExpandedMessageIds = new Set();
    persistShellViewState({ messageCategoryId: currentMessageCategoryId });
    renderMessageCenter();
}

function openMessageCenter() {
    currentExpandedMessageIds = new Set();
    updateShellViewState('message');
    persistShellViewState({
        view: 'message',
        messageCategoryId: currentMessageCategoryId
    });
    renderMessageCenter();
    loadMessageLibraryData().then(() => {
        markVisibleMessagesAsRead();
    });
    requestAnimationFrame(scrollMessageViewToTop);
}

function resetShellToDefaultCalendar() {
    currentShellView = 'calendar';
    currentCalendarView = 'month';
    currentCalendarDate = new Date();
    currentDetailClientId = '';
    currentDetailSubTab = 'sub-info';
    currentDetailScheduleDate = new Date();
    currentOutputWorksheetId = '';
    currentOutputDetailOpen = false;
    updateShellViewState('calendar');
    renderCalendar();
    persistShellViewState({
        view: 'calendar',
        calendarView: 'month',
        calendarDate: currentCalendarDate,
        detailClientId: '',
        detailSubTab: 'sub-info',
        detailScheduleDate: currentDetailScheduleDate,
        outputWorksheetId: '',
        outputDetailOpen: false
    });
}

async function restorePersistedShellViewAfterDataLoad() {
    if (shouldForceCalendarStart()) {
        resetShellToDefaultCalendar();
        clearForceCalendarStartRequest();
        return;
    }

    const state = readPersistedShellViewState() || {};
    const urlView = readShellViewFromUrl();
    const returnedLabKind = consumeReturnedLabKind();
    if (!Object.keys(state).length && !urlView) return;

    const view = normalizeShellView(urlView || state.view || currentShellView || 'calendar');
    if (view === 'lab') {
        const labClientId = String(state.labClientId || state.detailClientId || currentDetailClientId || '').trim();
        const labClient = labClientId ? findClientById(labClientId) : getCurrentDetailClient();
        if (!labClient) return;
        await openLabCenter(returnedLabKind || state.labKind || currentLabKind || 'cardlab', labClient, state.labReturnView || 'calendar');
        const selectedCategoryId = String(state.labSubcategoryId || '').trim();
        if (selectedCategoryId) {
            currentLabSelectionByKind[currentLabKind] = selectedCategoryId;
            currentLabSubcategoryId = selectedCategoryId;
        }
        currentLabStageId = String(state.labStageId || currentLabStageId || '').trim();
        currentLabContentId = String(state.labContentId || currentLabContentId || '').trim();
        currentLabTabletDetailOpen = Boolean(state.labTabletDetailOpen);
        currentLabWordCardGridMode = String(state.labWordCardGridMode || 'two').trim() === 'one' ? 'one' : 'two';
        currentLabWordCardCategoryFilters = normalizeLabWordCardCategoryFilters(state.labWordCardCategoryFilters || state.labWordCardCategoryFilter || ['all']);
        currentLabWordCardCategoryFilter = currentLabWordCardCategoryFilters[0] || 'all';
        currentLabWordCardTypeFilter = String(state.labWordCardTypeFilter || 'all').trim() || 'all';
        currentLabWordCardSearchTerm = String(state.labWordCardSearchTerm || '').trim();
        currentLabWordCardSelectedId = String(state.labWordCardSelectedId || '').trim();
        currentLabWordCardDetailOpen = Boolean(state.labWordCardDetailOpen);
        currentLabTabletDetailOpen = Boolean(state.labTabletDetailOpen) && isLabWordCardCategory(getLabLauncherSelectedCategory(currentLabKind));
        persistShellViewState({
            view: 'lab',
            labClientId: labClient.id || '',
            labKind: currentLabKind,
            labSubcategoryId: currentLabSubcategoryId,
            labStageId: currentLabStageId,
            labContentId: currentLabContentId,
            labTabletDetailOpen: currentLabTabletDetailOpen,
            labWordCardGridMode: currentLabWordCardGridMode,
            labWordCardCategoryFilter: currentLabWordCardCategoryFilter,
            labWordCardCategoryFilters: currentLabWordCardCategoryFilters,
            labWordCardTypeFilter: currentLabWordCardTypeFilter,
            labWordCardSearchTerm: currentLabWordCardSearchTerm,
            labWordCardSelectedId: currentLabWordCardSelectedId,
            labWordCardDetailOpen: currentLabWordCardDetailOpen
        });
        renderLabViewShell();
        if (isLabWordCardCategory(getLabLauncherSelectedCategory(currentLabKind)) && !currentLabWordCardLoaded) {
            ensureLabWordCardLibraryLoaded();
        }
        return;
    }

    if (view === 'output') {
        currentOutputCategoryId = '';
        currentOutputSearchTerm = '';
        currentOutputWorksheetId = '';
        currentOutputDetailOpen = false;
        currentOutputAssetSelection = [];
        currentOutputPreviewIndex = 0;
        updateShellViewState('output');
        renderOutputCenter();
        return;
    }

    if (view === 'message') {
        currentMessageCategoryId = String(state.messageCategoryId || '').trim();
        updateShellViewState('message');
        renderMessageCenter();
        markVisibleMessagesAsRead();
        return;
    }

    if (view === 'detail' && state.detailClientId) {
        const detailClient = findClientById(state.detailClientId);
        if (detailClient) {
            await openClientDetail(null, detailClient, null, null, null, { preserveDetailSubTab: true });
            return;
        }
    }

    if (view === 'calendar') {
        updateShellViewState('calendar');
        renderCalendar();
        return;
    }
}

async function loadAppData(options = {}) {
    const requestEpoch = sensitiveAppEpoch;
    if (window.__sensitiveAppCleared) return;
    if (!appShellBootstrapped) {
        bootAppShell();
    }
    if (!window.supabaseClient || !window.currentProfile) return;
    const teacherId = getCurrentTeacherId();
    if (!teacherId) return;

    try {
        const worksheetLoadPromise = loadWorksheetLibraryData();
        const messageLoadPromise = loadMessageLibraryData();
        const [clientsRes, schedulesRes] = await Promise.all([
            window.supabaseClient.from('clients').select('*').eq('teacher_id', teacherId).order('name', { ascending: true }),
            window.supabaseClient.from('schedules').select('*').eq('teacher_id', teacherId).order('date', { ascending: true })
        ]);

        if (clientsRes.error) throw clientsRes.error;
        if (schedulesRes.error) throw schedulesRes.error;
        await worksheetLoadPromise;
        await messageLoadPromise;
        if (requestEpoch !== sensitiveAppEpoch || !window.currentProfile || getCurrentTeacherId() !== teacherId) return;

        window.appClients = keysToCamel(clientsRes.data || []);
        window.appSchedules = keysToCamel(schedulesRes.data || []);

        renderClientList();
        renderReservationList();
        updateSidebarCounts();
        renderCalendar();

        if (options.preserveDetail && options.detailClientId) {
            const client = findClientById(options.detailClientId);
            if (client) {
                renderDetailView(client);
            } else if (String(currentDetailClientId || '') === String(options.detailClientId)) {
                goToList();
            }
        }
        await restorePersistedShellViewAfterDataLoad();
        renderMessageNotificationState();
        queueClassOnboardingStart();
    } catch (error) {
        console.error('[AppData] load failed:', error);
        showAuthStatusModalForError(error);
    }
}

function init() {
    const requestedShellView = readShellViewFromUrl();
    forceCalendarStartRequested = detectForceCalendarStart() || (!requestedShellView && shouldStartCalendarOnFreshEntry());
    if (forceCalendarStartRequested) {
        // Fresh entries should land on the calendar, while reload can keep the current workspace.
        removeForceCalendarStartParamFromUrl();
    }
    bindSidebarTabs();
    bindSubTabs();
    bindDetailReportModeControls();
    bindViewToggles();
    bindCalendarNavigation();
    bindMyPageSettingsHandlers();
    bindCardDownloadPromoHandlers();
    initDirtyCheck();
    applyPersistedShellViewStateToMemory();
    seedReportDualModeSampleRecords();
    armClassHistoryGuard();
    if (!window.__hahaLabClassHistoryBackBound) {
        window.__hahaLabClassHistoryBackBound = true;
        window.addEventListener('popstate', handleClassBrowserBack);
    }
    updateShellViewState(currentShellView || 'calendar');
    updateAlphabetIndex();
    if (currentShellView === 'output') {
        renderOutputCenter();
        renderMessageCenter();
    } else if (currentShellView === 'message') {
        renderCalendar();
        renderOutputCenter();
        renderMessageCenter();
    } else if (currentShellView === 'lab') {
        renderLabViewShell();
        renderMessageCenter();
    } else {
        renderCalendar();
        renderOutputCenter();
        renderMessageCenter();
    }
    renderMessageNotificationState();
    window.setTimeout(() => {
        flushLocalLearningHarnessSyncQueue();
    }, 1200);

    const outputSearchInput = document.getElementById('outputSearchInput');
    if (outputSearchInput && !outputSearchInput.dataset.bound) {
        outputSearchInput.dataset.bound = 'true';
        outputSearchInput.addEventListener('input', (event) => {
            setOutputSearchTerm(event.target.value);
        });
    }

    if (calendarNowTimer) clearInterval(calendarNowTimer);
    calendarNowTimer = setInterval(() => {
        renderCalendar();
    }, 60000);

    const saveClassBtn = document.getElementById('btnSaveClass');
    if (saveClassBtn) saveClassBtn.onclick = submitClassRegistration;
    const classClientSelect = document.getElementById('classClientSelect');
    if (classClientSelect && !classClientSelect.dataset.bound) {
        classClientSelect.dataset.bound = 'true';
        classClientSelect.addEventListener('change', () => {
            currentClassModalClientId = String(classClientSelect.value || '').trim();
            syncClassRegistrationMode();
        });
    }
    const classSingleMode = document.getElementById('classSingleMode');
    if (classSingleMode && !classSingleMode.dataset.bound) {
        classSingleMode.dataset.bound = 'true';
        classSingleMode.addEventListener('change', syncClassRegistrationMode);
    }

    if (!window.__labWordCardResizeBound) {
        window.__labWordCardResizeBound = true;
        window.addEventListener('resize', () => {
            if (!document.getElementById('lab-view') || document.getElementById('lab-view').hidden) return;
            if (!isLabWordCardCategory(getLabLauncherSelectedCategory(currentLabKind))) return;
            if (window.__labWordCardResizeTimer) {
                window.clearTimeout(window.__labWordCardResizeTimer);
            }
            window.__labWordCardResizeTimer = window.setTimeout(() => {
                renderLabViewShell();
            }, 80);
        });
    }

    if (!window.__classOnboardingResizeBound) {
        window.__classOnboardingResizeBound = true;
        window.addEventListener('resize', () => {
            if (!currentClassOnboardingActive) return;
            window.clearTimeout(window.__classOnboardingResizeTimer);
            window.__classOnboardingResizeTimer = window.setTimeout(() => {
                renderClassOnboarding();
            }, 90);
        });
    }
}

function bootAppShell() {
    if (appShellBootstrapped) return;
    appShellBootstrapped = true;
    init();
}

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    if (!body) return;
    if (body.classList.contains('auth-pending') || body.classList.contains('auth-logged-out')) return;
    bootAppShell();
});

window.addEventListener('beforeprint', prepareDetailReportPrintMode);
window.addEventListener('afterprint', cleanupDetailReportPrintMode);

window.addEventListener('pageshow', (event) => {
    if (!event.persisted || !appShellBootstrapped) return;
    resetShellToDefaultCalendar();
});

window.escapeHtml = escapeHtml;
window.keysToCamel = keysToCamel;
window.markModalDirty = markModalDirty;
window.resetModalDirty = resetModalDirty;
window.showAlert = showAlert;
window.showConfirm = showConfirm;
window.showAuthStatusModal = showAuthStatusModal;
window.showAuthStatusModalForError = showAuthStatusModalForError;
window.showRecurringDeleteConfirm = showRecurringDeleteConfirm;
window.safeCloseModal = safeCloseModal;
window.closeModal = closeModal;
window.toggleDayChip = toggleDayChip;
window.openClientDetail = openClientDetail;
window.goToList = goToList;
window.moveDetailScheduleWeek = moveDetailScheduleWeek;
window.startClientLabFromDetail = startClientLabFromDetail;
window.openLabCenter = openLabCenter;
window.setLabKind = setLabKind;
window.openLabKindGuide = openLabKindGuide;
window.closeLabKindGuide = closeLabKindGuide;
window.nextLabKindGuideStep = nextLabKindGuideStep;
window.prevLabKindGuideStep = prevLabKindGuideStep;
window.confirmLabKindGuide = confirmLabKindGuide;
window.dismissLabKindGuide = dismissLabKindGuide;
window.openLabAnonymousGuide = openLabAnonymousGuide;
window.closeLabAnonymousGuide = closeLabAnonymousGuide;
window.confirmLabAnonymousGuide = confirmLabAnonymousGuide;
window.dismissLabAnonymousGuide = dismissLabAnonymousGuide;
window.selectLabSubcategory = selectLabSubcategory;
window.selectLabStage = selectLabStage;
window.selectLabContent = selectLabContent;
window.setLabSearchTerm = setLabSearchTerm;
window.submitLabSearchTerm = submitLabSearchTerm;
window.selectLabSearchSuggestion = selectLabSearchSuggestion;
window.clearLabSearchTerm = clearLabSearchTerm;
window.toggleLabFavorite = toggleLabFavorite;
window.closeLabUpdateModal = closeLabUpdateModal;
window.returnToLabCategoryList = returnToLabCategoryList;
window.confirmCloseLabCenter = confirmCloseLabCenter;
window.closeLabCenter = closeLabCenter;
window.startAnonymousLabFromList = startAnonymousLabFromList;
window.setDetailClientAction = setDetailClientAction;
window.saveCurrentDetailReportAsJpg = saveCurrentDetailReportAsJpg;
window.retryCurrentDetailReports = retryCurrentDetailReports;
window.openDetailEditModal = openDetailEditModal;
window.resumeCurrentDetailClient = resumeCurrentDetailClient;
window.convertCurrentDetailReserve = convertCurrentDetailReserve;
window.handleDetailActionConfirm = handleDetailActionConfirm;
window.scrollToIdx = scrollToIdx;
window.updateAlphabetIndex = updateAlphabetIndex;
window.populateClassClientSelect = populateClassClientSelect;
window.setClassClientSectionVisible = setClassClientSectionVisible;
window.openClassRegistrationModal = openClassRegistrationModal;
window.openEditClassModal = openEditClassModal;
window.handleDeleteClassFromModal = handleDeleteClassFromModal;
window.submitClassRegistration = submitClassRegistration;
window.maybeStartClassOnboarding = maybeStartClassOnboarding;
window.nextClassOnboardingStep = nextClassOnboardingStep;
window.prevClassOnboardingStep = prevClassOnboardingStep;
window.dismissClassOnboarding = dismissClassOnboarding;
window.openMyPage = openMyPage;
window.getCurrentLabState = function getCurrentLabState() {
    return {
        shellView: currentShellView,
        anonymousMode: currentLabAnonymousMode,
        labKind: currentLabKind,
        clientId: String(currentLabClient?.id || '').trim()
    };
};
window.getClassOnboardingState = function getClassOnboardingState() {
    const step = getCurrentClassOnboardingStep();
    return {
        active: currentClassOnboardingActive,
        startedThisSession: currentClassOnboardingStartedThisSession,
        seen: isClassOnboardingSeen(),
        stepIndex: currentClassOnboardingStep,
        stepId: step?.id || '',
        pendingSurface: currentClassOnboardingPendingSurface || '',
        shellView: currentShellView
    };
};
window.openPolicyDocument = openPolicyDocument;
window.switchMyPageTab = switchMyPageTab;
window.saveProfile = saveProfile;
window.openWithdrawalRetentionPage = openWithdrawalRetentionPage;
window.openTeacherWithdrawalModal = openTeacherWithdrawalModal;
window.closeTeacherWithdrawalModal = closeTeacherWithdrawalModal;
window.updateTeacherWithdrawalState = updateTeacherWithdrawalState;
window.submitTeacherWithdrawal = submitTeacherWithdrawal;
window.loadAppData = loadAppData;
window.openOutputCenter = openOutputCenter;
window.openMessageCenter = openMessageCenter;
window.setMessageCategoryFilter = setMessageCategoryFilter;
window.toggleMessageCard = toggleMessageCard;
window.setOutputCategoryFilter = setOutputCategoryFilter;
window.setOutputSearchTerm = setOutputSearchTerm;
window.openOutputWorksheetDetail = openOutputWorksheetDetail;
window.closeOutputWorksheetDetail = closeOutputWorksheetDetail;
window.moveOutputWorksheetDetail = moveOutputWorksheetDetail;
window.selectOutputWorksheet = selectOutputWorksheet;
window.toggleOutputAssetSelection = toggleOutputAssetSelection;
window.setOutputPreviewIndex = setOutputPreviewIndex;
window.handleOutputDownload = handleOutputDownload;
window.setPlaylabTrendPeriod = setPlaylabTrendPeriod;
window.shiftPlaylabTrendWindow = shiftPlaylabTrendWindow;
window.openPlaylabLogDetailReport = openPlaylabLogDetailReport;
window.openHeviAssessment = openHeviAssessment;
window.openHeviAssessmentReport = openHeviAssessmentReport;
window.showAssessmentPreparing = showAssessmentPreparing;
window.refreshAfterClientMutation = refreshAfterClientMutation;
window.getVisibleClientsByType = getVisibleClientsByType;
window.getClassModalClientOptions = getClassModalClientOptions;
window.getClientSelectionValue = getClientSelectionValue;
window.getClientDisplayLabel = getClientDisplayLabel;
window.goToToday = goToToday;
window.formatPhoneNumber = formatPhoneNumber;
window.flattenAreas = flattenAreas;
window.normalizeGuardians = normalizeGuardians;
window.deriveAgeFromDob = deriveAgeFromDob;
window.bootAppShell = bootAppShell;
window.formatDateLocal = formatDateLocal;
