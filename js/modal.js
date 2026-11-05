const regModal = document.getElementById('registrationModal');
let currentRegType = 'client';
let registrationEditClient = null;
let daumPostcodeScriptPromise = null;

function loadDaumPostcodeScript() {
    if (window.daum?.Postcode) return Promise.resolve(window.daum);
    if (daumPostcodeScriptPromise) return daumPostcodeScriptPromise;

    daumPostcodeScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-daum-postcode="true"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.daum), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('DAUM_POSTCODE_LOAD_FAILED')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        script.dataset.daumPostcode = 'true';
        script.onload = () => resolve(window.daum);
        script.onerror = () => reject(new Error('DAUM_POSTCODE_LOAD_FAILED'));
        document.head.appendChild(script);
    });

    return daumPostcodeScriptPromise;
}

function getRegField(id) {
    return document.getElementById(id);
}

function normalizeRegistrationDobInput(value) {
    const raw = String(value || '').trim();
    if (!raw) {
        return {
            raw,
            normalized: null,
            isValid: true,
            message: ''
        };
    }

    const digits = raw.replace(/\D/g, '');
    let year = '';
    let month = '';
    let day = '';

    if (/^\d{8}$/.test(digits)) {
        year = digits.slice(0, 4);
        month = digits.slice(4, 6);
        day = digits.slice(6, 8);
    } else {
        const match = raw.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
        if (match) {
            year = match[1];
            month = match[2].padStart(2, '0');
            day = match[3].padStart(2, '0');
        }
    }

    if (!year || !month || !day) {
        return {
            raw,
            normalized: null,
            isValid: false,
            message: '생년월일은 20180412 또는 2018-04-12 형식으로 입력해주세요.'
        };
    }

    const yearNumber = Number(year);
    const monthNumber = Number(month);
    const dayNumber = Number(day);
    const currentYear = new Date().getFullYear();
    const date = new Date(yearNumber, monthNumber - 1, dayNumber);
    const isRealDate = date.getFullYear() === yearNumber
        && date.getMonth() === monthNumber - 1
        && date.getDate() === dayNumber;

    if (!isRealDate || yearNumber < 1900 || yearNumber > currentYear || date.getTime() > Date.now()) {
        return {
            raw,
            normalized: null,
            isValid: false,
            message: '생년월일 날짜를 다시 확인해주세요.'
        };
    }

    return {
        raw,
        normalized: `${year}-${month}-${day}`,
        isValid: true,
        message: ''
    };
}

function bindRegistrationDobInput() {
    const dobInput = getRegField('regDob');
    if (!dobInput || dobInput.dataset.textDobBound === 'true') return;
    dobInput.dataset.textDobBound = 'true';
    dobInput.addEventListener('blur', () => {
        const parsed = normalizeRegistrationDobInput(dobInput.value);
        if (parsed.isValid && parsed.normalized) {
            dobInput.value = parsed.normalized;
        }
    });
}

function resetRegistrationForm() {
    registrationEditClient = null;
    getRegField('regClientId').value = '';
    getRegField('regName').value = '';
    getRegField('regDob').value = '';
    getRegField('regContact').value = '';
    getRegField('regZipCode').value = '';
    getRegField('regAddress').value = '';
    getRegField('regAddressDetail').value = '';
    getRegField('regGuardianName').value = '';
    getRegField('regGuardianRelation').value = '';
    getRegField('regGuardianContact').value = '';
    getRegField('regSessionTime').value = '50';
    getRegField('regAreas').value = '';
    getRegField('regDiagnosis').value = '';
    getRegField('regInitialConsult').value = '';
    getRegField('regMemo').value = '';
    getRegField('chkPrivacy').checked = false;
    const maleRadio = document.querySelector('input[name="regGender"][value="male"]');
    if (maleRadio) maleRadio.checked = true;
}

function collectRegistrationPayload() {
    const guardians = [];
    const guardianName = getRegField('regGuardianName').value.trim();
    const guardianRelation = getRegField('regGuardianRelation').value.trim();
    const guardianContact = getRegField('regGuardianContact').value.trim();
    if (guardianName || guardianRelation || guardianContact) {
        guardians.push({
            name: guardianName,
            relation: guardianRelation,
            contact: guardianContact
        });
    }

    const dobInput = getRegField('regDob');
    const parsedDob = normalizeRegistrationDobInput(dobInput.value);
    const dob = parsedDob.normalized;
    const derivedAge = typeof window.deriveAgeFromDob === 'function' ? window.deriveAgeFromDob(dob) : null;
    const areaTokens = getRegField('regAreas').value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    const areas = areaTokens.length ? { general: areaTokens } : {};
    const originalStatus = registrationEditClient?.status || 'normal';

    return {
        id: getRegField('regClientId').value || '',
        teacher_id: String((window.currentProfile || {}).teacherId || (window.currentProfile || {}).teacher_id || '').trim(),
        name: getRegField('regName').value.trim(),
        type: currentRegType,
        status: originalStatus,
        gender: document.querySelector('input[name="regGender"]:checked')?.value || 'male',
        dob,
        age: derivedAge,
        contact: getRegField('regContact').value.trim() || null,
        zip_code: getRegField('regZipCode').value.trim() || null,
        address: getRegField('regAddress').value.trim() || null,
        address_detail: getRegField('regAddressDetail').value.trim() || null,
        guardians,
        session_time: Number(getRegField('regSessionTime').value || 50) || 50,
        diagnosis: getRegField('regDiagnosis').value.trim() || null,
        initial_consult: getRegField('regInitialConsult').value.trim() || null,
        areas,
        memo: getRegField('regMemo').value.trim() || null
    };
}

function setRegType(type) {
    currentRegType = type;
    const btnClient = document.getElementById('btnTypeClient');
    const btnReserve = document.getElementById('btnTypeReserve');
    const modalTitle = document.getElementById('regModalTitle');
    const submitBtn = document.getElementById('btnSubmitRegistration');
    const sessionTimeInput = getRegField('regSessionTime');
    const diagnosisInput = getRegField('regDiagnosis');
    const isEditMode = Boolean(registrationEditClient);

    btnClient.classList.toggle('active', type === 'client');
    btnReserve.classList.toggle('active', type !== 'client');
    modalTitle.innerText = type === 'client'
        ? (isEditMode ? '내담자 수정' : '내담자 등록')
        : (isEditMode ? '상담예약자 수정' : '상담예약자 등록');
    if (submitBtn) submitBtn.innerText = isEditMode ? '수정하기' : '저장하기';

    if (type === 'reserve') {
        sessionTimeInput.value = sessionTimeInput.value || '50';
        diagnosisInput.placeholder = '상담 시 확인된 정보가 있다면 입력';
    } else {
        diagnosisInput.placeholder = '진단명 입력';
    }
}

function openRegistrationModal(client = null) {
    bindRegistrationDobInput();
    resetRegistrationForm();
    if (client && typeof client === 'object') {
        registrationEditClient = client;
        currentRegType = client.type || 'client';
        setRegType(currentRegType);
        getRegField('regClientId').value = client.id || '';
        getRegField('regName').value = client.name || '';
        getRegField('regDob').value = client.dob || '';
        getRegField('regContact').value = client.contact || '';
        getRegField('regZipCode').value = client.zipCode || client.zip_code || '';
        getRegField('regAddress').value = client.address || '';
        getRegField('regAddressDetail').value = client.addressDetail || client.address_detail || '';
        const guardians = typeof window.normalizeGuardians === 'function' ? window.normalizeGuardians(client.guardians) : [];
        const firstGuardian = guardians[0] || {};
        getRegField('regGuardianName').value = firstGuardian.name || '';
        getRegField('regGuardianRelation').value = firstGuardian.relation || '';
        getRegField('regGuardianContact').value = firstGuardian.contact || '';
        getRegField('regSessionTime').value = client.sessionTime || client.session_time || 50;
        getRegField('regAreas').value = typeof window.flattenAreas === 'function' ? window.flattenAreas(client.areas).join(', ') : '';
        getRegField('regDiagnosis').value = client.diagnosis || '';
        getRegField('regInitialConsult').value = client.initialConsult || client.initial_consult || '';
        getRegField('regMemo').value = client.memo || '';
        getRegField('chkPrivacy').checked = true;
        const genderRadio = document.querySelector(`input[name="regGender"][value="${client.gender || 'male'}"]`);
        if (genderRadio) genderRadio.checked = true;
    } else {
        registrationEditClient = null;
        setRegType('client');
    }

    const submitBtn = document.getElementById('btnSubmitRegistration');
    if (submitBtn) submitBtn.innerText = registrationEditClient ? '수정하기' : '저장하기';

    regModal.classList.add('active');
    if (typeof window.resetModalDirty === 'function') window.resetModalDirty();
}

function closeRegistrationModal() {
    regModal.classList.remove('active');
    registrationEditClient = null;
    const submitBtn = document.getElementById('btnSubmitRegistration');
    if (submitBtn) submitBtn.innerText = '저장하기';
    if (typeof window.resetModalDirty === 'function') window.resetModalDirty();
}

async function execDaumPostcode() {
    try {
        const daum = await loadDaumPostcodeScript();
        new daum.Postcode({
            oncomplete(data) {
                let addr = '';
                let extraAddr = '';

                if (data.userSelectedType === 'R') {
                    addr = data.roadAddress;
                } else {
                    addr = data.jibunAddress;
                }

                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                        extraAddr += data.bname;
                    }
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraAddr += (extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName);
                    }
                    if (extraAddr !== '') {
                        addr += ` (${extraAddr})`;
                    }
                }

                getRegField('regZipCode').value = data.zonecode || '';
                getRegField('regAddress').value = addr || '';
                getRegField('regAddressDetail').focus();
                if (typeof window.markModalDirty === 'function') window.markModalDirty();
            }
        }).open();
    } catch (_error) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
    }
}

async function submitRegistration() {
    if (!window.supabaseClient) {
        window.showAlert?.('로그인 정보가 없어 저장을 진행할 수 없습니다.');
        return;
    }

    if (!getRegField('chkPrivacy').checked) {
        window.showAlert?.('개인정보 및 민감정보 처리 동의 여부를 체크해주세요.');
        return;
    }

    const payload = collectRegistrationPayload();
    if (!payload.teacher_id) {
        window.showAlert?.('선생님 계정 정보를 찾지 못했습니다. 다시 로그인 후 시도해주세요.');
        return;
    }
    if (!payload.name) {
        window.showAlert?.('이름을 입력해주세요.');
        return;
    }
    const parsedDob = normalizeRegistrationDobInput(getRegField('regDob').value);
    if (!parsedDob.isValid) {
        window.showAlert?.(parsedDob.message);
        getRegField('regDob')?.focus();
        return;
    }
    if (parsedDob.normalized) getRegField('regDob').value = parsedDob.normalized;

    const nowIso = new Date().toISOString();
    const dbPayload = {
        teacher_id: payload.teacher_id,
        name: payload.name,
        type: payload.type,
        status: payload.status,
        gender: payload.gender,
        dob: payload.dob,
        age: payload.age,
        contact: payload.contact,
        zip_code: payload.zip_code,
        address: payload.address,
        address_detail: payload.address_detail,
        guardians: payload.guardians,
        session_time: payload.session_time,
        diagnosis: payload.diagnosis,
        initial_consult: payload.initial_consult,
        areas: payload.areas,
        memo: payload.memo,
        privacy_notice_shared_at: nowIso,
        lawful_basis_confirmed: true,
        lawful_basis_confirmed_at: nowIso,
        lawful_basis_confirmed_by: payload.teacher_id,
        guardian_consent_obtained_at: nowIso,
        data_origin: 'member_entry',
        dob_precision: payload.dob && /\d{4}-01-01$/.test(String(payload.dob)) ? 'year' : 'full'
    };

    try {
        if (payload.id) {
            let updateQuery = window.supabaseClient.from('clients').update(dbPayload).eq('id', payload.id);
            if (payload.teacher_id) updateQuery = updateQuery.eq('teacher_id', payload.teacher_id);
            const { error } = await updateQuery;
            if (error) throw error;
        } else {
            const { error } = await window.supabaseClient.from('clients').insert([dbPayload]);
            if (error) throw error;
        }

        await window.loadAppData?.();
        closeRegistrationModal();
        if (payload.id) {
            window.showBottomToast?.(payload.type === 'reserve' ? '예약자 정보가 수정되었습니다.' : '내담자 정보가 수정되었습니다.');
        } else {
            window.showAlert?.(payload.type === 'reserve' ? '상담예약자가 등록되었습니다.' : '내담자가 등록되었습니다.');
        }
    } catch (error) {
        console.error('[Registration] failed:', error);
        window.showAlert?.(`저장 중 오류가 발생했습니다: ${error.message || error}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchAddressButton = document.getElementById('btnRegSearchAddress');
    if (searchAddressButton) {
        searchAddressButton.addEventListener('click', execDaumPostcode);
    }
});

window.openRegistrationModal = openRegistrationModal;
window.closeRegistrationModal = closeRegistrationModal;
window.setRegType = setRegType;
window.submitRegistration = submitRegistration;
