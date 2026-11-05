(() => {
    const state = {
        clients: [],
        schedules: [],
        reports: [],
        reportClientId: '',
        peopleTab: 'client',
        activeView: 'home',
        selectedDate: '',
        scheduleMode: 'day',
        loading: false,
        cardDownloadPromptShown: false
    };
    let sensitiveSessionEpoch = 0;
    window.clearSensitiveAppState = function () {
        sensitiveSessionEpoch += 1;
        state.clients = [];
        state.schedules = [];
        state.reports = [];
        state.reportClientId = '';
        state.loading = false;
        state.cardDownloadPromptShown = false;
        closeSheets();
        closeCardDownloadPromo();
        document.querySelectorAll('#mobileShell input, #mobileShell textarea, .mobile-sheet input, .mobile-sheet textarea').forEach((field) => { field.value = ''; });
        for (const id of ['mobilePeopleList', 'mobileScheduleList', 'todayScheduleList', 'mobileReportPanel', 'reportClientSelect', 'mobileScheduleClient', 'mobileMonthGrid']) document.getElementById(id)?.replaceChildren();
        for (const id of ['mobileTeacherName', 'mobileCenterName', 'myProfileName', 'myProfileCenter', 'myProfileEmail', 'myProfileContact']) {
            const node = document.getElementById(id);
            if (node) node.textContent = '';
        }
        if (document.body.classList.contains('auth-logged-in')) {
            document.getElementById('mobileShell')?.replaceChildren();
            window.__sensitiveAppCleared = true;
            document.body.classList.remove('auth-logged-in');
            document.body.classList.add('auth-logged-out');
        }
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const CARD_DOWNLOAD_PROMO_DISMISSED_PREFIX = 'haha_lab_mobile_card_download_promo_dismissed_v1_';
    const CARD_DOWNLOAD_PROMO_SESSION_KEY = 'haha_lab_mobile_card_download_promo_closed_session_v1';
    const CARD_DOWNLOAD_PRINT_URL = 'cardlab-study-a4-sample.html';
    const today = () => formatDate(new Date());
    const escapeHtml = (value = '') => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const toCamel = (key) => key.replace(/([-_][a-z])/ig, (chunk) => chunk.toUpperCase().replace('-', '').replace('_', ''));
    const keysToCamel = (value) => {
        if (Array.isArray(value)) return value.map(keysToCamel);
        if (value && value === Object(value) && typeof value !== 'function') {
            return Object.keys(value).reduce((acc, key) => {
                acc[toCamel(key)] = keysToCamel(value[key]);
                return acc;
            }, {});
        }
        return value;
    };

    function getTeacherId() {
        const profile = window.currentProfile || {};
        return String(profile.teacherId || profile.teacher_id || '').trim();
    }

    function getCardDownloadPromoStorageKey() {
        const teacherId = getTeacherId();
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

    function openCardDownloadPromo() {
        if (!window.currentProfile || isCardDownloadPromoDismissed() || isCardDownloadPromoClosedThisSession()) return;
        const modal = $('#mobileCardDownloadPromo');
        if (!modal) return;
        state.cardDownloadPromptShown = true;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    function maybeOpenCardDownloadPromoNow() {
        if (state.cardDownloadPromptShown) return;
        window.setTimeout(openCardDownloadPromo, 120);
    }

    function closeCardDownloadPromo(options = {}) {
        const modal = $('#mobileCardDownloadPromo');
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        if (options.dismissForever) {
            try {
                window.localStorage?.setItem(getCardDownloadPromoStorageKey(), '1');
            } catch (_error) {}
        } else {
            try {
                window.sessionStorage?.setItem(CARD_DOWNLOAD_PROMO_SESSION_KEY, '1');
            } catch (_error) {}
        }
    }

    function bindCardDownloadPromo() {
        $('#mobileCardDownloadOpenBtn')?.addEventListener('click', (event) => {
            event.preventDefault();
            closeCardDownloadPromo();
            window.open(CARD_DOWNLOAD_PRINT_URL, '_blank', 'noopener,noreferrer');
        });
        $('#mobileCardDownloadCloseBtn')?.addEventListener('click', (event) => {
            event.preventDefault();
            closeCardDownloadPromo();
        });
        $('#mobileCardDownloadNeverBtn')?.addEventListener('click', (event) => {
            event.preventDefault();
            closeCardDownloadPromo({ dismissForever: true });
        });
    }

    function formatDate(date) {
        const target = date instanceof Date ? date : new Date(date);
        if (Number.isNaN(target.getTime())) return '';
        const year = target.getFullYear();
        const month = String(target.getMonth() + 1).padStart(2, '0');
        const day = String(target.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateKorean(value) {
        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) return value || '-';
        return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    }

    function addDays(value, amount) {
        const date = new Date(`${value || today()}T00:00:00`);
        date.setDate(date.getDate() + amount);
        return formatDate(date);
    }

    function addMonths(value, amount) {
        const date = new Date(`${value || today()}T00:00:00`);
        const currentDay = date.getDate();
        date.setDate(1);
        date.setMonth(date.getMonth() + amount);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        date.setDate(Math.min(currentDay, lastDay));
        return formatDate(date);
    }

    function getMonthTitle(value) {
        const date = new Date(`${value || today()}T00:00:00`);
        if (Number.isNaN(date.getTime())) return '월간 일정';
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    }

    function normalizeTime(value) {
        return String(value || '').slice(0, 5) || '-';
    }

    function addMinutes(time, minutes) {
        const [hour, minute] = String(time || '00:00').split(':').map(Number);
        const date = new Date(2000, 0, 1, hour || 0, minute || 0);
        date.setMinutes(date.getMinutes() + (Number(minutes) || 0));
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
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

    function showToast(message) {
        if (showAuthStatusModalForError(message)) return;
        const toast = document.getElementById('bottomToast');
        if (!toast) {
            alert(message);
            return;
        }
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
    }

    function showAlert(message, callback) {
        if (showAuthStatusModalForError(message, { onOk: callback })) return;
        showToast(message);
        if (typeof callback === 'function') window.setTimeout(callback, 400);
    }

    function showConfirm(message, onConfirm) {
        if (window.confirm(message) && typeof onConfirm === 'function') onConfirm();
    }

    window.showBottomToast = showToast;
    window.showAlert = showAlert;
    window.showConfirm = showConfirm;
    window.showAuthStatusModal = showAuthStatusModal;
    window.showAuthStatusModalForError = showAuthStatusModalForError;
    window.closeModal = (id) => document.getElementById(id)?.classList.remove('active');
    window.openModal = (id) => {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.removeAttribute('hidden');
        modal.classList.add('active');
    };

    function getFilteredClients(type) {
        const keyword = String($('#mobilePeopleSearch')?.value || '').trim().toLowerCase();
        return state.clients
            .filter((client) => String(client.type || 'client') === type)
            .filter((client) => {
                if (!keyword) return true;
                return [client.name, client.contact, client.memo]
                    .some((value) => String(value || '').toLowerCase().includes(keyword));
            })
            .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'ko'));
    }

    function renderSummary() {
        const clients = state.clients.filter((item) => String(item.type || 'client') === 'client');
        const reserves = state.clients.filter((item) => String(item.type || '') === 'reserve');
        const todaySchedules = state.schedules.filter((item) => item.date === today());
        setText('summaryClientCount', String(clients.length));
        setText('summaryReserveCount', String(reserves.length));
        setText('summaryTodayCount', String(todaySchedules.length));
    }

    function renderProfile() {
        const profile = window.currentProfile || {};
        const subscription = getSubscriptionSummary(profile);
        const name = profile.name || '선생님';
        const center = profile.center || profile.center_name || '센터 정보 없음';
        setText('mobileTeacherName', `${name}님`);
        setText('mobileCenterName', center);
        setText('mobileProfileInitial', String(name).charAt(0) || '?');
        setText('myProfileName', name);
        setText('myProfileCenter', center);
        setText('myProfileEmail', profile.email || '-');
        setText('myProfileContact', profile.contact || '-');
        setText('myProfilePlan', `${subscription.planName} · ${subscription.stateLabel}`);
    }

    function getSubscriptionSummary(profile = {}) {
        return {
            planBadge: 'FREE',
            planName: '무료 이용 중',
            stateLabel: '학생 무료 등록 가능'
        };
    }

    function scheduleCard(schedule) {
        const typeLabel = schedule.type === 'reserve' ? '예약' : '수업';
        const memo = schedule.memo ? `<p>${escapeHtml(schedule.memo)}</p>` : '';
        return `
            <article class="mobile-card" data-schedule-id="${escapeHtml(schedule.id || '')}">
                <div class="mobile-card-row">
                    <div>
                        <h3>${escapeHtml(schedule.clientName || schedule.client_name || '이름 없음')}</h3>
                        <p>${escapeHtml(typeLabel)} · ${escapeHtml(normalizeTime(schedule.startTime || schedule.start_time))} - ${escapeHtml(normalizeTime(schedule.endTime || schedule.end_time))}</p>
                        ${memo}
                    </div>
                    <time>${escapeHtml(formatDateKorean(schedule.date))}</time>
                </div>
            </article>
        `;
    }

    function getSchedulesForDate(dateValue) {
        return state.schedules
            .filter((item) => item.date === dateValue)
            .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')));
    }

    function renderMonthGrid() {
        const grid = $('#mobileMonthGrid');
        if (!grid) return;
        const selectedDate = state.selectedDate || today();
        const current = new Date(`${selectedDate}T00:00:00`);
        if (Number.isNaN(current.getTime())) return;
        const first = new Date(current.getFullYear(), current.getMonth(), 1);
        const last = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        const startOffset = (first.getDay() + 6) % 7;
        const cells = [];
        for (let index = 0; index < startOffset; index += 1) {
            cells.push('<span class="mobile-month-cell is-empty" aria-hidden="true"></span>');
        }
        for (let day = 1; day <= last.getDate(); day += 1) {
            const cellDate = formatDate(new Date(current.getFullYear(), current.getMonth(), day));
            const schedules = getSchedulesForDate(cellDate);
            const isSelected = cellDate === selectedDate;
            const isToday = cellDate === today();
            const preview = schedules.slice(0, 2).map((schedule) => `
                <span>${escapeHtml(normalizeTime(schedule.startTime || schedule.start_time))} ${escapeHtml(schedule.clientName || schedule.client_name || '')}</span>
            `).join('');
            const more = schedules.length > 2 ? `<em>+${schedules.length - 2}</em>` : '';
            cells.push(`
                <button type="button" class="mobile-month-cell${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}" data-month-date="${cellDate}">
                    <strong>${day}</strong>
                    ${schedules.length ? `<small>${schedules.length}</small>` : ''}
                    <div>${preview}${more}</div>
                </button>
            `);
        }
        grid.innerHTML = cells.join('');
    }

    function renderScheduleLists() {
        const selectedDate = state.selectedDate || today();
        const daySchedules = getSchedulesForDate(selectedDate);
        const todaySchedules = getSchedulesForDate(today());
        const empty = '<div class="mobile-empty">등록된 일정이 없습니다.</div>';
        $('#mobileScheduleList').innerHTML = daySchedules.length ? daySchedules.map(scheduleCard).join('') : empty;
        $('#todayScheduleList').innerHTML = todaySchedules.length ? todaySchedules.map(scheduleCard).join('') : empty;
        setText('scheduleDateLabel', state.scheduleMode === 'month' ? `${getMonthTitle(selectedDate)} · 선택일 ${formatDateKorean(selectedDate)}` : formatDateKorean(selectedDate));
        const monthPanel = $('#mobileMonthPanel');
        if (monthPanel) monthPanel.hidden = state.scheduleMode !== 'month';
        $$('[data-schedule-mode]').forEach((btn) => btn.classList.toggle('active', btn.dataset.scheduleMode === state.scheduleMode));
        renderMonthGrid();
    }

    function clientCard(client) {
        const typeLabel = client.type === 'reserve' ? '예약자' : '내담자';
        const contact = client.contact ? `<p>${escapeHtml(client.contact)}</p>` : '';
        const memo = client.memo || client.initialConsult || client.initial_consult;
        return `
            <button class="mobile-card mobile-client-card" type="button" data-client-id="${escapeHtml(client.id)}">
                <div class="mobile-card-row">
                    <div>
                        <h3>${escapeHtml(client.name || '이름 없음')}</h3>
                        ${contact}
                        ${memo ? `<p>${escapeHtml(memo)}</p>` : ''}
                    </div>
                    <span class="mobile-badge">${typeLabel}</span>
                </div>
            </button>
        `;
    }

    function renderPeople() {
        const list = getFilteredClients(state.peopleTab);
        $('#mobilePeopleList').innerHTML = list.length
            ? list.map(clientCard).join('')
            : `<div class="mobile-empty">${state.peopleTab === 'reserve' ? '등록된 예약자가 없습니다.' : '등록된 내담자가 없습니다.'}</div>`;
    }

    function renderSelects() {
        const options = state.clients
            .slice()
            .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'ko'))
            .map((client) => `<option value="${escapeHtml(client.id)}">${escapeHtml(client.name || '이름 없음')} · ${client.type === 'reserve' ? '예약자' : '내담자'}</option>`)
            .join('');
        const reportOptions = state.clients
            .filter((client) => String(client.type || 'client') === 'client')
            .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'ko'))
            .map((client) => `<option value="${escapeHtml(client.id)}">${escapeHtml(client.name || '이름 없음')}</option>`)
            .join('');
        $('#mobileScheduleClient').innerHTML = options || '<option value="">등록된 대상이 없습니다</option>';
        $('#reportClientSelect').innerHTML = reportOptions || '<option value="">등록된 내담자가 없습니다</option>';
        if (!state.reportClientId && state.clients.length) {
            const firstClient = state.clients.find((client) => String(client.type || 'client') === 'client');
            state.reportClientId = firstClient?.id || '';
        }
        if (state.reportClientId) $('#reportClientSelect').value = state.reportClientId;
    }

    function getReportMetrics(clientId) {
        const rows = state.reports.filter((item) => String(item.clientId || item.client_id || '') === String(clientId));
        const scores = rows.map((row) => Number(row.score || row.total_score || row.accuracy || 0)).filter((value) => value > 0);
        const average = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;
        const latest = rows[0];
        return { rows, average, latest };
    }

    function renderReports() {
        const clientId = state.reportClientId || $('#reportClientSelect')?.value || '';
        const client = state.clients.find((item) => String(item.id) === String(clientId));
        if (!client) {
            $('#mobileReportPanel').innerHTML = '<div class="mobile-empty">리포트를 확인할 내담자를 선택해주세요.</div>';
            return;
        }
        const { rows, average, latest } = getReportMetrics(client.id);
        const latestTitle = latest?.labTitle || latest?.lab_title || latest?.title || latest?.action || '최근 리포트 없음';
        const latestDate = latest?.eventDatetime || latest?.event_datetime || latest?.completedAt || latest?.completed_at || latest?.createdAt || latest?.created_at || '';
        $('#mobileReportPanel').innerHTML = `
            <article class="mobile-card">
                <h3>${escapeHtml(client.name)} 리포트</h3>
                <p>${escapeHtml(latestTitle)}</p>
            </article>
            <div class="mobile-report-metrics">
                <div><span>세션</span><strong>${rows.length}</strong></div>
                <div><span>평균</span><strong>${average || '-'}</strong></div>
                <div><span>최근</span><strong>${latestDate ? formatDateKorean(String(latestDate).slice(0, 10)) : '-'}</strong></div>
            </div>
            ${rows.length ? rows.slice(0, 8).map((row) => `
                <article class="mobile-card">
                    <h3>${escapeHtml(row.labTitle || row.lab_title || row.title || '학습 기록')}</h3>
                    <p>${escapeHtml(String(row.eventDatetime || row.event_datetime || row.completedAt || row.completed_at || row.createdAt || row.created_at || '').slice(0, 16))}</p>
                </article>
            `).join('') : '<div class="mobile-empty">등록된 리포트가 없습니다.</div>'}
        `;
        renderClinicalSummary(client);
    }

    async function renderClinicalSummary(client) {
        const epoch = sensitiveSessionEpoch;
        const teacherId = getTeacherId();
        const panel = $('#mobileReportPanel');
        if (!panel || !window.HahaLabClinical?.loadMobileSummary) return;
        try {
            const summary = await window.HahaLabClinical.loadMobileSummary(client.id);
            if (epoch !== sensitiveSessionEpoch || !window.currentProfile || teacherId !== getTeacherId() || String(state.reportClientId) !== String(client.id)) return;
            if (!summary) return;
            const statusLabel = { active: '진행 중', paused: '일시 정지', closed: '종결' }[summary.caseStatus] || '확인 필요';
            const goals = summary.activeGoals.length
                ? summary.activeGoals.map((goal) => `<li>${escapeHtml(goal.target || goal.functionalContext || '치료 목표')}</li>`).join('')
                : '<li>등록된 치료 목표가 없습니다.</li>';
            const soap = summary.latestSoap;
            panel.insertAdjacentHTML('beforeend', `
                <section class="mobile-clinical-summary" aria-label="임상 요약">
                    <div><span>치료 에피소드</span><strong>${escapeHtml(statusLabel)}</strong></div>
                    <div><span>최근 SOAP</span><p>${escapeHtml(soap?.assessment || soap?.plan || '기록이 없습니다.')}</p></div>
                    <div><span>활성 목표</span><ul>${goals}</ul></div>
                </section>
            `);
        } catch (error) {
            console.warn('[MobileClass] clinical summary skipped:', error);
        }
    }

    function renderAll() {
        renderProfile();
        renderSummary();
        renderScheduleLists();
        renderPeople();
        renderSelects();
        renderReports();
    }

    async function loadAppData() {
        if (state.loading) return;
        if (!window.supabaseClient || !window.currentProfile) return;
        const teacherId = getTeacherId();
        if (!teacherId) return;
        const epoch = sensitiveSessionEpoch;
        state.loading = true;
        try {
            const [clientsRes, schedulesRes, historiesRes, attemptsRes] = await Promise.all([
                window.supabaseClient.from('clients').select('*').eq('teacher_id', teacherId).order('name', { ascending: true }),
                window.supabaseClient.from('schedules').select('*').eq('teacher_id', teacherId).order('date', { ascending: true }),
                window.supabaseClient.from('histories').select('*').eq('teacher_id', teacherId).order('event_datetime', { ascending: false }).limit(160),
                window.supabaseClient.from('cardlab_learning_attempts').select('*').eq('teacher_id', teacherId).order('completed_at', { ascending: false }).limit(120)
            ]);
            if (epoch !== sensitiveSessionEpoch || !window.currentProfile || teacherId !== getTeacherId()) return;
            if (clientsRes.error) throw clientsRes.error;
            if (schedulesRes.error) throw schedulesRes.error;
            state.clients = keysToCamel(clientsRes.data || []);
            state.schedules = keysToCamel(schedulesRes.data || []);
            state.reports = [
                ...keysToCamel(historiesRes.data || []),
                ...keysToCamel(attemptsRes.data || [])
            ];
            renderAll();
        } catch (error) {
            if (epoch !== sensitiveSessionEpoch) return;
            console.error('[MobileClass] load failed:', error);
            if (showAuthStatusModalForError(error)) return;
            showToast(`데이터를 불러오지 못했습니다: ${error.message || error}`);
        } finally {
            if (epoch === sensitiveSessionEpoch) state.loading = false;
        }
    }

    window.loadAppData = loadAppData;

    function switchView(view) {
        state.activeView = view;
        $$('.mobile-view').forEach((el) => el.classList.toggle('active', el.dataset.view === view));
        $$('.mobile-bottom-nav button').forEach((btn) => btn.classList.toggle('active', btn.dataset.nav === view));
    }

    function openClientSheet(type = 'client') {
        $('#mobileClientForm').reset();
        $('#mobileClientType').value = type;
        $('#mobileClientSessionTime').value = '50';
        setText('clientSheetTitle', type === 'reserve' ? '예약자 등록' : '내담자 등록');
        openSheet('clientSheet');
    }

    function openScheduleSheet(clientId = '') {
        $('#mobileScheduleForm').reset();
        $('#mobileScheduleFormDate').value = state.selectedDate || today();
        $('#mobileScheduleTime').value = '14:00';
        $('#mobileScheduleDuration').value = '50';
        renderSelects();
        if (clientId && $(`#mobileScheduleClient option[value="${CSS.escape(clientId)}"]`)) {
            $('#mobileScheduleClient').value = clientId;
            const client = state.clients.find((item) => String(item.id) === String(clientId));
            $('#mobileScheduleDuration').value = client?.sessionTime || client?.session_time || 50;
        }
        openSheet('scheduleSheet');
    }

    function openSheet(id) {
        $('#mobileSheetBackdrop').hidden = false;
        const sheet = document.getElementById(id);
        if (sheet) sheet.hidden = false;
    }

    function closeSheets() {
        const backdrop = $('#mobileSheetBackdrop');
        if (backdrop) backdrop.hidden = true;
        $$('.mobile-sheet').forEach((sheet) => { sheet.hidden = true; });
    }

    async function submitClientForm(event) {
        event.preventDefault();
        const teacherId = getTeacherId();
        const name = $('#mobileClientName').value.trim();
        if (!teacherId) return showToast('로그인 정보가 확인되지 않습니다.');
        if (!name) return showToast('이름을 입력해주세요.');
        const guardianName = $('#mobileGuardianName').value.trim();
        const guardianContact = $('#mobileGuardianContact').value.trim();
        const guardians = guardianName || guardianContact ? [{ name: guardianName, relation: '', contact: guardianContact }] : [];
        const nowIso = new Date().toISOString();
        const payload = {
            teacher_id: teacherId,
            name,
            type: $('#mobileClientType').value || 'client',
            status: 'normal',
            gender: $('#mobileClientGender').value || 'male',
            dob: $('#mobileClientDob').value || null,
            contact: $('#mobileClientContact').value.trim() || null,
            guardians,
            session_time: Number($('#mobileClientSessionTime').value || 50) || 50,
            memo: $('#mobileClientMemo').value.trim() || null,
            privacy_notice_shared_at: nowIso,
            lawful_basis_confirmed: true,
            lawful_basis_confirmed_at: nowIso,
            lawful_basis_confirmed_by: teacherId,
            guardian_consent_obtained_at: nowIso,
            data_origin: 'mobile_member_entry'
        };
        try {
            const { error } = await window.supabaseClient.from('clients').insert([payload]);
            if (error) throw error;
            closeSheets();
            await loadAppData();
            showToast(payload.type === 'reserve' ? '예약자가 등록되었습니다.' : '내담자가 등록되었습니다.');
        } catch (error) {
            console.error('[MobileClass] client save failed:', error);
            if (showAuthStatusModalForError(error)) return;
            showToast(`저장 중 오류가 발생했습니다: ${error.message || error}`);
        }
    }

    async function submitScheduleForm(event) {
        event.preventDefault();
        const teacherId = getTeacherId();
        const clientId = $('#mobileScheduleClient').value;
        const client = state.clients.find((item) => String(item.id) === String(clientId));
        if (!teacherId) return showToast('로그인 정보가 확인되지 않습니다.');
        if (!client) return showToast('대상을 선택해주세요.');
        const startTime = normalizeTime($('#mobileScheduleTime').value);
        const duration = Number($('#mobileScheduleDuration').value || client.sessionTime || 50) || 50;
        const row = {
            teacher_id: teacherId,
            client_id: client.id,
            client_name: client.name,
            type: client.type || 'client',
            date: $('#mobileScheduleFormDate').value || today(),
            start_time: startTime,
            end_time: addMinutes(startTime, duration),
            status: 'scheduled',
            memo: $('#mobileScheduleMemo').value.trim() || null
        };
        try {
            const { error } = await window.supabaseClient.from('schedules').insert([row]);
            if (error) throw error;
            state.selectedDate = row.date;
            $('#mobileScheduleDate').value = row.date;
            closeSheets();
            await loadAppData();
            showToast('일정이 등록되었습니다.');
        } catch (error) {
            console.error('[MobileClass] schedule save failed:', error);
            if (showAuthStatusModalForError(error)) return;
            showToast(`일정 저장 중 오류가 발생했습니다: ${error.message || error}`);
        }
    }

    function bindEvents() {
        document.addEventListener('click', (event) => {
            const actionEl = event.target.closest('[data-action]');
            if (actionEl) {
                const action = actionEl.dataset.action;
                if (action === 'refresh') loadAppData();
                if (action === 'open-client-sheet') openClientSheet(actionEl.dataset.type || 'client');
                if (action === 'open-schedule-sheet') openScheduleSheet();
                if (action === 'close-sheets') closeSheets();
                if (action === 'prev-date') {
                    state.selectedDate = state.scheduleMode === 'month' ? addMonths(state.selectedDate, -1) : addDays(state.selectedDate, -1);
                    $('#mobileScheduleDate').value = state.selectedDate;
                    renderScheduleLists();
                }
                if (action === 'next-date') {
                    state.selectedDate = state.scheduleMode === 'month' ? addMonths(state.selectedDate, 1) : addDays(state.selectedDate, 1);
                    $('#mobileScheduleDate').value = state.selectedDate;
                    renderScheduleLists();
                }
                if (action === 'logout' && typeof window.logout === 'function') window.logout();
            }

            const nav = event.target.closest('[data-nav]');
            if (nav) switchView(nav.dataset.nav);

            const peopleTab = event.target.closest('[data-people-tab]');
            if (peopleTab) {
                state.peopleTab = peopleTab.dataset.peopleTab;
                $$('[data-people-tab]').forEach((btn) => btn.classList.toggle('active', btn === peopleTab));
                renderPeople();
            }

            const scheduleMode = event.target.closest('[data-schedule-mode]');
            if (scheduleMode) {
                state.scheduleMode = scheduleMode.dataset.scheduleMode || 'day';
                renderScheduleLists();
            }

            const monthDate = event.target.closest('[data-month-date]');
            if (monthDate) {
                state.selectedDate = monthDate.dataset.monthDate || today();
                state.scheduleMode = 'day';
                $('#mobileScheduleDate').value = state.selectedDate;
                renderScheduleLists();
            }

            const clientCardEl = event.target.closest('[data-client-id]');
            if (clientCardEl) openScheduleSheet(clientCardEl.dataset.clientId);
        });

        $('#mobileSheetBackdrop')?.addEventListener('click', closeSheets);
        $('#mobilePeopleSearch')?.addEventListener('input', renderPeople);
        $('#mobileScheduleDate')?.addEventListener('change', (event) => {
            state.selectedDate = event.target.value || today();
            renderScheduleLists();
        });
        $('#reportClientSelect')?.addEventListener('change', (event) => {
            state.reportClientId = event.target.value;
            renderReports();
        });
        $('#mobileClientForm')?.addEventListener('submit', submitClientForm);
        $('#mobileScheduleForm')?.addEventListener('submit', submitScheduleForm);
    }

    function init() {
        state.selectedDate = today();
        const dateInput = $('#mobileScheduleDate');
        if (dateInput) dateInput.value = state.selectedDate;
        bindEvents();
        bindCardDownloadPromo();
        const wait = window.setInterval(() => {
            if (!window.supabaseClient || !window.currentProfile) return;
            window.clearInterval(wait);
            maybeOpenCardDownloadPromoNow();
            loadAppData();
        }, 250);
        window.setTimeout(() => window.clearInterval(wait), 12000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
