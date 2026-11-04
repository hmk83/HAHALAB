(function () {
    'use strict';

    const FEATURE_KEY = 'clinical_cr1_assessment_goal';
    const state = { flags: null, recordsByClient: new Map() };

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDate(value) {
        const date = value ? new Date(value) : null;
        if (!date || Number.isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    }

    function getCurrentTeacherStatus() {
        return String(window.currentProfile?.status || 'normal').trim().toLowerCase() || 'normal';
    }

    function canWrite() {
        return getCurrentTeacherStatus() === 'normal';
    }

    function getClientKey(client) {
        return String(client?.id || client?.clientId || client?.client_id || '').trim();
    }

    async function getFlags() {
        if (state.flags) return state.flags;
        if (!window.supabaseClient?.rpc) return [];
        const { data, error } = await window.supabaseClient.rpc('clinical_get_feature_flags');
        if (error) throw error;
        state.flags = Array.isArray(data) ? data : [];
        return state.flags;
    }

    async function isEnabled() {
        const flags = await getFlags();
        return flags.some((flag) => flag?.key === FEATURE_KEY && flag?.enabled === true);
    }

    async function isFeatureEnabled(featureKey) {
        const flags = await getFlags();
        return flags.some((flag) => flag?.key === featureKey && flag?.enabled === true);
    }

    async function loadRecords(clientId) {
        if (state.recordsByClient.has(clientId)) return state.recordsByClient.get(clientId);
        if (!window.supabaseClient?.rpc) return [];
        const { data, error } = await window.supabaseClient.rpc('clinical_list_current_records', { p_client_id: clientId });
        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        state.recordsByClient.set(clientId, rows);
        return rows;
    }

    function getRecordId(record) {
        return String(record?.record_id || record?.recordId || '').trim();
    }

    function getKind(record) {
        return String(record?.kind || '').trim();
    }

    function getPayload(record) {
        return record?.payload && typeof record.payload === 'object' ? record.payload : {};
    }

    function groupRecords(records) {
        return {
            assessments: records.filter((record) => getKind(record) === 'assessment'),
            goals: records.filter((record) => getKind(record) === 'goal'),
            baselines: records.filter((record) => getKind(record) === 'baseline')
        };
    }

    function summaryValue(payload, key, fallback = '-') {
        const value = String(payload?.[key] || '').trim();
        return value || fallback;
    }

    function renderPanel(container, client, records) {
        const grouped = groupRecords(records);
        const clientName = escapeHtml(client.name || '내담자');
        const editable = canWrite();
        const assessments = grouped.assessments.slice(0, 3).map((record) => {
            const payload = getPayload(record);
            return `
                <article class="clinical-record-card">
                    <div>
                        <p class="clinical-record-meta">${escapeHtml(summaryValue(payload, 'assessmentDate', formatDate(record.created_at)))}</p>
                        <h4>${escapeHtml(summaryValue(payload, 'functionalContext', '기능적 관찰 기록'))}</h4>
                        <p>${escapeHtml(summaryValue(payload, 'caregiverPriority', summaryValue(payload, 'referralConcern', '보호자 우선순위 미입력')))}</p>
                    </div>
                    <span>v${escapeHtml(record.version_no || 1)}</span>
                </article>
            `;
        }).join('') || '<p class="clinical-empty-copy">초기평가를 작성하면 기능 맥락과 보호자 우선순위를 기준선으로 남깁니다.</p>';
        const goals = grouped.goals.slice(0, 6).map((record) => {
            const payload = getPayload(record);
            const relatedBaseline = grouped.baselines.find((baseline) => String(getPayload(baseline).goalRecordId || '') === getRecordId(record));
            const baselinePayload = relatedBaseline ? getPayload(relatedBaseline) : null;
            const baselineText = baselinePayload
                ? `${summaryValue(baselinePayload, 'numerator', '0')} / ${summaryValue(baselinePayload, 'denominator', '0')} · ${summaryValue(baselinePayload, 'cueLevel', '단서 수준 미입력')}`
                : '기준선 미작성';
            return `
                <article class="clinical-goal-card">
                    <div class="clinical-goal-head">
                        <span>${escapeHtml(summaryValue(payload, 'domain', '영역 미지정'))}</span>
                        <small>${escapeHtml(summaryValue(payload, 'targetDate', '기한 미지정'))}</small>
                    </div>
                    <h4>${escapeHtml(summaryValue(payload, 'target', '목표 미입력'))}</h4>
                    <p>${escapeHtml(summaryValue(payload, 'functionalContext', '기능 맥락 미입력'))}</p>
                    <dl>
                        <div><dt>측정</dt><dd>${escapeHtml(summaryValue(payload, 'measurement', '측정 방식 미입력'))}</dd></div>
                        <div><dt>기준선</dt><dd>${escapeHtml(baselineText)}</dd></div>
                    </dl>
                </article>
            `;
        }).join('') || '<p class="clinical-empty-copy">활성 치료 목표가 없습니다.</p>';
        const goalOptions = grouped.goals.map((record) => {
            const payload = getPayload(record);
            return `<option value="${escapeHtml(getRecordId(record))}">${escapeHtml(summaryValue(payload, 'target', '목표'))}</option>`;
        }).join('');

        container.innerHTML = `
            <section class="clinical-workflow" data-client-id="${escapeHtml(getClientKey(client))}">
                <header class="clinical-workflow-head">
                    <div>
                        <p>CLINICAL FOUNDATION</p>
                        <h3>${clientName} 치료 계획</h3>
                        <span>초기평가, 기능적 목표, 기초선을 같은 측정 조건으로 기록합니다.</span>
                    </div>
                    <span class="clinical-status ${editable ? 'is-writable' : 'is-readonly'}">${editable ? '기록 가능' : '읽기 전용'}</span>
                </header>

                <div class="clinical-workflow-grid">
                    <section class="clinical-panel">
                        <div class="clinical-panel-head"><h4>초기평가</h4>${editable ? '<button type="button" data-clinical-action="toggle-assessment">작성</button>' : ''}</div>
                        <div class="clinical-record-list">${assessments}</div>
                        ${editable ? `
                            <form class="clinical-form" data-clinical-form="assessment" hidden>
                                <label>평가일<input name="assessmentDate" type="date" required></label>
                                <label>의뢰·보호자 요구<textarea name="referralConcern" rows="2" required></textarea></label>
                                <label>기능 맥락<textarea name="functionalContext" rows="2" placeholder="예: 또래와의 놀이에서 원하는 것을 문장으로 말하기" required></textarea></label>
                                <label>관찰·평가 방법<textarea name="observation" rows="2" required></textarea></label>
                                <label>보호자 우선순위<textarea name="caregiverPriority" rows="2"></textarea></label>
                                <button type="submit">초기평가 저장</button>
                            </form>` : ''}
                    </section>

                    <section class="clinical-panel">
                        <div class="clinical-panel-head"><h4>치료 목표와 기초선</h4>${editable ? '<button type="button" data-clinical-action="toggle-goal">목표 추가</button>' : ''}</div>
                        <div class="clinical-goal-list">${goals}</div>
                        ${editable ? `
                            <form class="clinical-form" data-clinical-form="goal" hidden>
                                <label>영역<select name="domain" required><option value="">선택</option><option>언어</option><option>어휘</option><option>의미이해</option><option>음운</option><option>인지</option><option>일상생활</option></select></label>
                                <label>기능 맥락<textarea name="functionalContext" rows="2" required></textarea></label>
                                <label>목표 행동<textarea name="target" rows="2" required></textarea></label>
                                <label>측정 방식<input name="measurement" placeholder="예: 10회 기회 중 자발 반응 수" required></label>
                                <label>목표 기준<input name="targetCriterion" placeholder="예: 10회 중 8회, 단서 1회 이하" required></label>
                                <label>목표 기한<input name="targetDate" type="date"></label>
                                <button type="submit">목표 저장</button>
                            </form>
                            ${goalOptions ? `
                                <form class="clinical-form" data-clinical-form="baseline" hidden>
                                    <label>연결 목표<select name="goalRecordId" required>${goalOptions}</select></label>
                                    <label>측정일<input name="measurementDate" type="date" required></label>
                                    <label>정반응 수<input name="numerator" type="number" min="0" required></label>
                                    <label>전체 기회 수<input name="denominator" type="number" min="1" required></label>
                                    <label>단서 수준<input name="cueLevel" placeholder="예: 시각 단서 1회" required></label>
                                    <label>환경·조건<input name="environment" placeholder="예: 조용한 개별 수업" required></label>
                                    <button type="submit">기초선 저장</button>
                                </form>` : ''}` : ''}
                    </section>
                </div>
            </section>
        `;
        bindPanel(container, client);
    }

    function toggleForm(container, selector) {
        const form = container.querySelector(selector);
        if (!form) return;
        form.hidden = !form.hidden;
        if (!form.hidden) form.querySelector('input, textarea, select')?.focus();
    }

    function formPayload(form) {
        const values = Object.fromEntries(new FormData(form).entries());
        return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value || '').trim()]));
    }

    async function writeRecord(client, kind, payload) {
        const clientId = getClientKey(client);
        if (!window.supabaseClient?.rpc) throw new Error('CLINICAL_CLIENT_UNAVAILABLE');
        const { data: caseId, error: caseError } = await window.supabaseClient.rpc('clinical_open_case', { p_client_id: clientId });
        if (caseError) throw caseError;
        const { error } = await window.supabaseClient.rpc('clinical_append_record_version', {
            p_case_id: caseId,
            p_kind: kind,
            p_payload: payload,
            p_record_id: null,
            p_change_reason: 'teacher-created'
        });
        if (error) throw error;
        state.recordsByClient.delete(clientId);
    }

    function notify(message) {
        if (typeof window.showBottomToast === 'function') window.showBottomToast(message);
        else window.alert(message);
    }

    function bindPanel(container, client) {
        container.querySelector('[data-clinical-action="toggle-assessment"]')?.addEventListener('click', () => {
            toggleForm(container, '[data-clinical-form="assessment"]');
        });
        container.querySelector('[data-clinical-action="toggle-goal"]')?.addEventListener('click', () => {
            toggleForm(container, '[data-clinical-form="goal"]');
        });
        container.querySelectorAll('[data-clinical-form]').forEach((form) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const kind = form.dataset.clinicalForm;
                const button = form.querySelector('button[type="submit"]');
                if (button) button.disabled = true;
                try {
                    await writeRecord(client, kind, formPayload(form));
                    const records = await loadRecords(getClientKey(client));
                    renderPanel(container, client, records);
                    notify(kind === 'assessment' ? '초기평가를 저장했습니다.' : kind === 'goal' ? '치료 목표를 저장했습니다.' : '기초선을 저장했습니다.');
                } catch (error) {
                    console.error('[Clinical] record save failed:', error);
                    notify('임상기록을 저장하지 못했습니다. 다시 시도해 주세요.');
                    if (button) button.disabled = false;
                }
            });
        });
    }

    async function mountAssessment(container, client) {
        if (!container || !client || !window.supabaseClient?.rpc) return false;
        try {
            if (!await isEnabled()) return false;
            const records = await loadRecords(getClientKey(client));
            renderPanel(container, client, records);
            return true;
        } catch (error) {
            console.warn('[Clinical] assessment mount skipped:', error);
            return false;
        }
    }

    window.HahaLabClinical = {
        featureKey: FEATURE_KEY,
        mountAssessment,
        clearCache(clientId) {
            if (clientId) state.recordsByClient.delete(String(clientId));
            else state.recordsByClient.clear();
            state.flags = null;
        },
        async loadMobileSummary(clientId) {
            if (!clientId || !await isFeatureEnabled('clinical_cr4_mobile_read')) return null;
            const records = await loadRecords(String(clientId));
            const grouped = groupRecords(records);
            const latestSoap = records.find((record) => getKind(record) === 'soap');
            return {
                caseStatus: records[0]?.case_status || 'active',
                activeGoals: grouped.goals.slice(0, 3).map((record) => getPayload(record)),
                latestBaseline: grouped.baselines[0] ? getPayload(grouped.baselines[0]) : null,
                latestSoap: latestSoap ? getPayload(latestSoap) : null
            };
        }
    };
}());
