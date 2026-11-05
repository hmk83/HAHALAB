/**
 * auth.js - HAHA LAB 인증 부트스트랩
 * 
 * class-app.jsx의 인증 흐름을 계승한 프로덕션 구현체.
 * - Supabase Auth + teachers 테이블 연동
 * - Google OAuth (signInWithOAuth) 일반 로그인
 * - Google signInWithIdToken 관리자 로그인
 * - bind_current_user_to_teacher / get_my_teacher_profile RPC 기반
 * - auth_user_id로 바인딩하고 teacher_id를 실제 테넌트 키로 사용
 */

// ─── 설정값 (공개용 키만 사용) ───────────────────────────────────────────────
const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
const GOOGLE_CLIENT_ID = '676053673202-crnrisqsuj48mbd66q83ksi1t5gu9j09.apps.googleusercontent.com';
const GOOGLE_ADMIN_EMAIL = 'hahalab83@gmail.com';
const GOOGLE_PEOPLE_ME_URL = 'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers';
const TEACHER_AUTH_MANAGER_FUNCTION = 'teacher-auth-manager';
const PASSWORD_CHANGE_INTERVAL_DAYS = 90;
const PASSWORD_POLICY_COLUMNS_ENABLED = false;
const GENERAL_ACCOUNT_AUTH_ENABLED = false;
const SIGNUP_ACCEPTANCE_ENABLED = false;
const ACCOUNT_LOGIN_UNLOCK_COUNT = 5;

// teachers 테이블 전체 컬럼 (class-app.jsx TEACHER_SAFE_COLUMNS와 동일)
const TEACHER_BASE_COLUMNS = [
    'id','created_at','teacher_id','auth_user_id',
    'name','center','gender','age','contact','email','status','memo','role','max_client_limit','last_seen',
    'subscription_plan_code','subscription_status',
    'subscription_scheduled_start_at','subscription_current_period_start','subscription_current_period_end',
    'subscription_last_paid_at','subscription_cancel_at_period_end','subscription_cancel_requested_at',
    'subscription_updated_at','subscription_note','subscription_ended_at',
    'subscription_billing_cycle','subscription_term_months'
].join(',');
const TEACHER_SAFE_COLUMNS = TEACHER_BASE_COLUMNS +
    ',free_trial_end,default_session_time,alert_before_5,alert_after_5' +
    ',show_paused_clients,show_terminated_clients,calendar_default_view,withdrawn_at';

// sessionStorage 키 (class-app.jsx와 동일)
const SIGNUP_CONTEXT_KEY  = 'haha_google_signup_context';
const SIGNUP_REVIEW_KEY   = 'haha_google_signup_review_required';
const AUTH_PENDING_KEY    = 'haha_google_auth_pending';
const TEACHER_SESSION_KEY = 'haha_lab_session';
const TEACHER_CURRENT_SESSION_KEY = 'haha_lab_current_session';
const PROTECTED_PLAYLAB_AUTH_COOKIE = 'hahalab_playlab_token';

// ─── 전역 상태 ────────────────────────────────────────────────────────────────
window.currentProfile  = null; // teachers 레코드
window.supabaseClient  = null;
let _supabase          = null;
let _currentSession    = null;
let _intentionalLogout = false;
let _signupGoogleUser  = null; // Google OAuth에서 받아온 임시 유저 정보
let _signupPhoneDuplicate = false;
let _signupPhoneCheckToken = 0;
let _signupDuplicateInfo = null;
let _signupDuplicateChecks = {
    email: { checked: false, value: '', duplicate: false },
    phone: { checked: false, value: '', duplicate: false }
};
let _signupMode = 'social';
let _passwordChangePromptProfile = null;
let _protectedSessionRequest = Promise.resolve(false);
let _protectedSessionToken = '';
let _passwordRecoveryActive = false;

function _purgeSensitiveSessionData({ clearAppState = true } = {}) {
    for (const storage of [window.localStorage, window.sessionStorage]) {
        try {
            Object.keys(storage).forEach((key) => {
                // Acknowledged caches can be purged, but unsent source data must
                // survive refresh/logout until its verified owner can retry.
                if (key === 'haha_lab_learning_harness_records_v1' || key === 'haha_lab_learning_harness_sync_queue_v1' || key.startsWith('haha_lab_learning_harness_sync_queue_v1::')) return;
                if (/^(?:playlab_history_report_|h_evi_history_report_|haha_lab_(?:learning_harness_|direct_launch_|current_session|session$|sensitive_session_owner|shell_view_state|last_lab_return_url))/.test(key)) storage.removeItem(key);
            });
        } catch (_error) { /* Storage may be disabled. */ }
    }
    if (clearAppState && typeof window.clearSensitiveAppState === 'function') window.clearSensitiveAppState();
    window.dispatchEvent(new Event('hahalab-session-cleared'));
}

window.getAuthenticatedReportOwner = function () {
    const token = _currentSession?.access_token;
    if (!token || !_currentSession?.user?.id || !window.currentProfile) return null;
    try {
        const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (!claims.session_id) return null;
        return { authUserId: _currentSession.user.id, sessionId: claims.session_id, teacherId: window.currentProfile.teacherId, createdAt: Date.now() };
    } catch (_error) { return null; }
};

const _toCamel = (str) => str.replace(/([-_][a-z])/ig, (chunk) => chunk.toUpperCase().replace('-', '').replace('_', ''));

function _setAuthView(mode = 'pending') {
    const body = document.body;
    if (!body) return;
    body.classList.remove('auth-pending', 'auth-logged-out', 'auth-logged-in', 'auth-signup');
    body.classList.add(`auth-${mode}`);
}

function _syncProtectedPlaylabCookie(session = null) {
    const token = String(session?.access_token || '').trim();
    if (!token) {
        return _clearProtectedPlaylabCookie();
    }
    if (_protectedSessionToken === token) return _protectedSessionRequest;
    _protectedSessionToken = token;
    _protectedSessionRequest = _protectedSessionRequest.catch(() => false).then(async () => {
        try {
            const response = await fetch('/api/playlab-session', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error('PROTECTED_SESSION_REJECTED');
            return true;
        } catch (error) {
            if (_protectedSessionToken === token) _protectedSessionToken = '';
            console.warn('[Auth] Protected learning session unavailable');
            return false;
        }
    });
    return _protectedSessionRequest;
}

function _clearProtectedPlaylabCookie() {
    _protectedSessionToken = '';
    const secureFlag = window.location?.protocol === 'https:' ? '; Secure' : '';
    // Remove cookies created by older clients; only the server can clear HttpOnly cookies.
    document.cookie = `${PROTECTED_PLAYLAB_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
    _protectedSessionRequest = _protectedSessionRequest.catch(() => false).then(() => fetch('/api/playlab-session', {
        method: 'DELETE', credentials: 'same-origin', cache: 'no-store'
    }).then((response) => response.ok).catch(() => false));
    return _protectedSessionRequest;
}

window.ensureProtectedPlaylabSession = async () => Boolean(await _syncProtectedPlaylabCookie(_currentSession));

function _keysToCamel(value) {
    if (Array.isArray(value)) {
        return value.map(_keysToCamel);
    }
    if (value && value === Object(value) && typeof value !== 'function') {
        const normalized = {};
        Object.keys(value).forEach((key) => {
            normalized[_toCamel(key)] = _keysToCamel(value[key]);
        });
        return normalized;
    }
    return value;
}

function _readStoredTeacherSession() {
    // The server-verified profile lives only in memory. Remove the old duplicate
    // browser profile cache, including any password-policy/contact fields.
    try { localStorage.removeItem(TEACHER_SESSION_KEY); } catch (_error) {}
    return window.currentProfile || null;
}

function _normalizeTeacherProfile(profile, authUser = _currentSession?.user || null) {
    const rawProfile = profile || {};
    const camelProfile = _keysToCamel(rawProfile);
    const teacherId = String(camelProfile.teacherId || rawProfile.teacher_id || rawProfile.teacherId || '').trim();
    const authUserId = String(camelProfile.authUserId || rawProfile.auth_user_id || rawProfile.authUserId || authUser?.id || '').trim();
    const storedSession = _readStoredTeacherSession();
    const loginAt = storedSession?.id === camelProfile.id && storedSession?.loginAt
        ? storedSession.loginAt
        : new Date().toISOString();

    return {
        ...rawProfile,
        ...camelProfile,
        teacherId,
        teacher_id: teacherId,
        authUserId,
        auth_user_id: authUserId,
        email: camelProfile.email || rawProfile.email || authUser?.email || '',
        loginAt
    };
}

function _persistTeacherSession(profile, authUser = _currentSession?.user || null) {
    const normalizedProfile = _normalizeTeacherProfile(profile, authUser);
    try { localStorage.removeItem(TEACHER_SESSION_KEY); } catch (_error) {}
    // Supabase's own session storage is unchanged; do not persist a second copy
    // of the teacher record or credentials as an application cache.
    return normalizedProfile;
}

function _buildFallbackTeacherId(email, authUserId) {
    const localPart = String(email || '')
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');
    const suffix = String(authUserId || '').replace(/-/g, '').slice(0, 8);
    return (localPart || 'teacher') + (suffix ? `_${suffix}` : '');
}

function _applyResolvedProfile(profile, authUser = _currentSession?.user || null) {
    const profileAuthUserId = String(profile?.auth_user_id || profile?.authUserId || '');
    if (!authUser?.id || authUser.id !== _currentSession?.user?.id || (profileAuthUserId && profileAuthUserId !== authUser.id)) throw new Error('AUTH_PROFILE_MISMATCH');
    const status = String(profile?.status || '').trim().toLowerCase();
    if (!['active', 'normal', 'pending', 'pending_teacher'].includes(status) || profile?.withdrawn_at || profile?.withdrawnAt) {
        _clearAuth();
        void _supabase?.auth?.signOut();
        _showAuthError('이용 가능한 계정이 아닙니다. 관리자에게 문의해 주세요.');
        throw new Error('TEACHER_ACCOUNT_INACTIVE');
    }
    let sessionId = '';
    try { sessionId = JSON.parse(atob(String(_currentSession?.access_token || '').split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).session_id || ''; } catch (_error) { /* Invalid sessions are rejected by the auth server. */ }
    const ownerKey = `${authUser?.id || ''}:${sessionId}`;
    if (window.__hahaLabSensitiveSessionOwner !== ownerKey) {
        _purgeSensitiveSessionData({ clearAppState: Boolean(window.__hahaLabSensitiveSessionOwner || window.currentProfile) });
    }
    window.__hahaLabSensitiveSessionOwner = ownerKey;
    // Retire the old raw auth-user/session-id marker, not the SDK session.
    try { localStorage.removeItem('haha_lab_sensitive_session_owner'); } catch (_error) {}
    const normalizedProfile = _persistTeacherSession(profile, authUser);
    window.currentProfile = normalizedProfile;
    void window.HahaLabLearningHarness?.flushSyncQueue?.();
    void window.retryUnstoredLabCompletions?.();
    _syncProtectedPlaylabCookie(_currentSession);
    if (window.__sensitiveAppCleared) {
        window.location.reload();
        return normalizedProfile;
    }
    _updateGnbProfile(normalizedProfile);
    _setAuthView('logged-in');
    _hideLoginOverlay();
    if (typeof window.bootAppShell === 'function') {
        window.bootAppShell();
    }
    return normalizedProfile;
}

function _addDaysToIso(value, days) {
    const base = value ? new Date(value) : new Date();
    const safeBase = Number.isNaN(base.getTime()) ? new Date() : base;
    safeBase.setDate(safeBase.getDate() + Number(days || 0));
    return safeBase.toISOString();
}

function _getPasswordPolicyPayload(changedAt = new Date().toISOString()) {
    return {
        password_changed_at: changedAt,
        password_change_due_at: _addDaysToIso(changedAt, PASSWORD_CHANGE_INTERVAL_DAYS),
        password_change_required: false,
        password_change_reminded_at: null
    };
}

function _readPasswordPolicyDate(profile, key) {
    if (!profile) return null;
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    return profile[camelKey] || profile[key] || null;
}

function _isPasswordPolicyDue(profile) {
    const dueAt = _readPasswordPolicyDate(profile, 'password_change_due_at');
    if (dueAt && new Date(dueAt).getTime() <= Date.now()) return true;
    const changedAt = _readPasswordPolicyDate(profile, 'password_changed_at') || profile?.createdAt || profile?.created_at;
    if (!changedAt) return false;
    const changedTime = new Date(changedAt).getTime();
    if (!Number.isFinite(changedTime)) return false;
    return Date.now() - changedTime >= PASSWORD_CHANGE_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
}

async function _updateTeacherPasswordPolicy(profile, payload) {
    if (!PASSWORD_POLICY_COLUMNS_ENABLED) return null;
    const rowId = profile?.id || window.currentProfile?.id;
    const teacherId = profile?.teacherId || profile?.teacher_id || window.currentProfile?.teacherId || window.currentProfile?.teacher_id;
    if (!rowId && !teacherId) return null;

    try {
        let query = _supabase.from('teachers').update(payload);
        query = rowId ? query.eq('id', rowId) : query.eq('teacher_id', teacherId);
        const { data, error } = await query
            .select('id,password_changed_at,password_change_due_at,password_change_required,password_change_reminded_at')
            .maybeSingle();
        if (error) throw error;
        return data || payload;
    } catch (error) {
        console.warn('[Auth] password policy update failed:', error);
        return null;
    }
}

async function _fetchTeacherPasswordPolicy(profile) {
    if (!PASSWORD_POLICY_COLUMNS_ENABLED) return null;
    const rowId = profile?.id;
    const teacherId = profile?.teacherId || profile?.teacher_id;
    if (!rowId && !teacherId) return null;

    try {
        let query = _supabase
            .from('teachers')
            .select('id,password_changed_at,password_change_due_at,password_change_required,password_change_reminded_at');
        query = rowId ? query.eq('id', rowId) : query.eq('teacher_id', teacherId);
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.warn('[Auth] password policy fetch failed:', error);
        return null;
    }
}

async function _hydratePasswordPolicy(profile) {
    const policy = await _fetchTeacherPasswordPolicy(profile);
    if (!policy) return profile;

    const merged = _normalizeTeacherProfile({ ...profile, ...policy });
    window.currentProfile = _persistTeacherSession(merged);
    return window.currentProfile;
}

async function _markInitialPasswordPolicy(profile) {
    const changedAt = new Date().toISOString();
    const saved = await _updateTeacherPasswordPolicy(profile, _getPasswordPolicyPayload(changedAt));
    if (!saved) return;
    window.currentProfile = _persistTeacherSession({ ...(window.currentProfile || profile || {}), ...saved });
}

async function _maybePromptPasswordChangeAfterLogin() {
    const hydratedProfile = await _hydratePasswordPolicy(window.currentProfile || {});
    if (!hydratedProfile || !_isPasswordPolicyDue(hydratedProfile)) return;
    await _updateTeacherPasswordPolicy(hydratedProfile, {
        password_change_required: true,
        password_change_due_at: _readPasswordPolicyDate(hydratedProfile, 'password_change_due_at') || new Date().toISOString()
    });
    _showPasswordChangePrompt(hydratedProfile);
}

function _getTeacherAuthManagerUrl() {
    return `${SUPABASE_URL}/functions/v1/${TEACHER_AUTH_MANAGER_FUNCTION}`;
}

async function _callTeacherAuthManager(action, payload = {}) {
    const response = await fetch(_getTeacherAuthManagerUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action, ...(payload || {}) })
    });

    let result = null;
    try {
        result = await response.json();
    } catch (_) {
        result = null;
    }

    if (!response.ok || result?.error) {
        const error = new Error(result?.error || `HTTP_${response.status}`);
        error.payload = result || null;
        throw error;
    }

    return result || {};
}

async function _applyTeacherAuthSession(sessionPayload) {
    const accessToken = sessionPayload?.access_token;
    const refreshToken = sessionPayload?.refresh_token;
    if (!accessToken || !refreshToken) {
        throw new Error('SESSION_MISSING');
    }

    const { data, error } = await _supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    if (error) throw error;
    _currentSession = data?.session || null;
    _syncProtectedPlaylabCookie(_currentSession);
    return _currentSession;
}

async function _waitForTeacherSessionReady({ attempts = 6, delayMs = 150 } = {}) {
    for (let index = 0; index < attempts; index += 1) {
        const { data, error } = await _supabase.auth.getSession();
        if (!error && data?.session?.access_token) {
            _currentSession = data.session;
            _syncProtectedPlaylabCookie(_currentSession);
            return data.session;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error('AUTH_SESSION_NOT_READY');
}

async function _resolveAdminUserFlag() {
    try {
        const { data, error } = await _supabase.rpc('is_admin_user');
        if (error) throw error;
        const resolved = Array.isArray(data) ? data[0] : data;
        return Boolean(resolved?.is_admin_user ?? resolved?.is_admin ?? resolved?.admin ?? resolved);
    } catch (error) {
        console.warn('[Auth] is_admin_user RPC failed:', error);
        return false;
    }
}

async function isAdminUser() {
    return _resolveAdminUserFlag();
}

async function _isCurrentAuthSessionActive(options = {}) {
    try {
        const result = await _supabase.rpc(options.authOnly ? 'security_auth_session_active' : 'security_session_active');
        return !result.error && result.data === true;
    } catch (_error) {
        return false;
    }
}

// ─── 초기화 ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    _setAuthView('pending');
    _initAccountLoginUnlock();
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabaseClient = _supabase;

    // 세션 변경 감지 (OAuth 리다이렉트 복귀 포함)
    _supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
            _passwordRecoveryActive = true;
            _currentSession = session;
            setTimeout(() => {
                _showPasswordChangePrompt(null);
                const copy = document.getElementById('passwordExpiryCopy');
                if (copy) copy.textContent = '이메일 확인이 완료되었습니다. 새 비밀번호를 설정해 주세요.';
                document.querySelector('#passwordExpiryModal .password-expiry-later-btn')?.setAttribute('hidden', '');
            }, 0);
        } else if (event === 'TOKEN_REFRESHED' && session) {
            _currentSession = session;
            _syncProtectedPlaylabCookie(session);
            setTimeout(() => _resolveTeacherProfile(session.user), 0);
        } else if (event === 'SIGNED_IN' && session) {
            if (_currentSession?.user?.id && _currentSession.user.id !== session.user?.id) {
                _purgeSensitiveSessionData();
                window.currentProfile = null;
            }
            _intentionalLogout = false;
            _currentSession = session;
            _syncProtectedPlaylabCookie(session);
            // OAuth 리다이렉트 복귀 처리
            // Avoid awaiting Supabase operations from inside its auth-event lock.
            setTimeout(() => _handleOAuthReturn(session), 0);
        } else if (event === 'SIGNED_OUT') {
            const hadProfile = Boolean(window.currentProfile || _currentSession);
            _clearAuth();
            if (!_intentionalLogout && hadProfile && typeof window.showAuthStatusModal === 'function') {
                window.showAuthStatusModal('logged-out');
            }
            if (!_intentionalLogout && hadProfile) {
                void _protectedSessionRequest.finally(() => window.location.replace('./index.html'));
            }
        }
    });

    // 기존 세션 복원 (새로고침 시)
    _restoreSession();

});

// ─── 세션 복원 ────────────────────────────────────────────────────────────────
async function _restoreSession() {
    let restoringSession = null;
    const priorSession = _currentSession;
    const superseded = () => _intentionalLogout || Boolean(_currentSession && _currentSession !== priorSession && _currentSession.access_token !== restoringSession?.access_token);
    try {
        const { data: { session } } = await _supabase.auth.getSession();
        restoringSession = session;
        if (superseded()) return;
        if (session) {
            const verified = await _supabase.auth.getUser(session.access_token);
            if (superseded()) return;
            if (verified.error || !verified.data?.user || verified.data.user.id !== session.user?.id) throw new Error('AUTH_SESSION_INVALID');
            const active = await _isCurrentAuthSessionActive({ authOnly: true });
            if (superseded()) return;
            if (!active) throw new Error('AUTH_SESSION_REVOKED');
            _currentSession = { ...session, user: verified.data.user };
            await _resolveTeacherProfile(verified.data.user);
            return;
        }
    } catch (error) {
        if (superseded()) return;
        console.warn('[Auth] restore session failed:', error);
    }
    _clearAuth();
}

// ─── OAuth 리다이렉트 복귀 처리 ──────────────────────────────────────────────
async function _handleOAuthReturn(session) {
    const ctx = _getSignupContext();
    const user = session.user;

    // 이미 가입 컨텍스트가 있으면 → 회원가입 완성 단계
    if (ctx && ctx.mode === 'signup') {
        if (!SIGNUP_ACCEPTANCE_ENABLED) {
            await _rejectUnregisteredSignup();
            return;
        }
        _signupGoogleUser = { ...user, googleAccessToken: ctx.accessToken };
        _showSignupModal({
            email: user?.email || '',
            phone: ctx.phone || '',
            name: _extractSignupProfileFromAuthUser(user).name || ''
        });
        return;
    }

    // 일반 로그인 흐름 → teachers 프로필 확인
    await _resolveTeacherProfile(user);
}

// ─── teachers 프로필 확인 및 분기 ─────────────────────────────────────────────
async function _resolveTeacherProfile(authUser) {
    if (!authUser?.id || _currentSession?.user?.id !== authUser.id) return;
    // Verify live auth.sessions before the legacy teacher mapping exists. The
    // full tenant/account gate still runs before any profile or app data loads.
    const authSessionActive = await _isCurrentAuthSessionActive({ authOnly: true });
    if (_currentSession?.user?.id !== authUser.id) return;
    if (!authSessionActive) {
        _clearAuth();
        void _supabase.auth.signOut();
        _showAuthError('로그인 세션이 종료되었습니다. 다시 로그인해 주세요.');
        return;
    }
    // Binding is also guarded inside the server RPC. A failed mapping never
    // bypasses security_session_active or falls through to an unscoped lookup.
    try {
        await _supabase.rpc('bind_current_user_to_teacher');
    } catch (error) {
        console.warn('[Auth] teacher binding RPC failed:', error);
    }
    if (_currentSession?.user?.id !== authUser.id) return;
    const teacherSessionActive = await _isCurrentAuthSessionActive();
    if (_currentSession?.user?.id !== authUser.id) return;
    if (!teacherSessionActive) {
        _clearAuth();
        void _supabase.auth.signOut();
        _showAuthError('이용 가능한 계정이 아니거나 로그인 세션이 종료되었습니다. 관리자에게 문의해 주세요.');
        return;
    }
    try {
        // 프로필 조회
        const { data: profileData, error } = await _supabase.rpc('get_my_teacher_profile');
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;

        if (error) throw error;

        if (profile) {
            // 기존 가입자 → 로그인 완료
            const resolvedProfile = _applyResolvedProfile(profile, authUser);
            if (window.currentProfile) {
                const isAdmin = await _resolveAdminUserFlag();
                if (_currentSession?.user?.id !== authUser.id) return;
                window.currentProfile.isAdminUser = isAdmin;
                window.currentProfile = _persistTeacherSession(window.currentProfile, authUser);
            }
            await _updateLastSeen(resolvedProfile.id);
            if (_currentSession?.user?.id !== authUser.id) return;
            if (typeof loadAppData === 'function') loadAppData();
        } else {
            // 미가입자 → 회원가입 폼
            if (!SIGNUP_ACCEPTANCE_ENABLED) {
                await _rejectUnregisteredSignup();
                return;
            }
            _signupGoogleUser = authUser;
            _showSignupModal(_extractSignupProfileFromAuthUser(authUser));
        }
    } catch (err) {
        if (_currentSession?.user?.id !== authUser.id) return;
        if (['TEACHER_ACCOUNT_INACTIVE', 'AUTH_PROFILE_MISMATCH'].includes(err?.message)) return;
        console.warn('[Auth] _resolveTeacherProfile error:', err);
        // 폴백: auth_user_id로 직접 조회
        await _fallbackProfileQuery(authUser);
    }
}

async function _fallbackProfileQuery(authUser) {
    if (!authUser?.id || _currentSession?.user?.id !== authUser.id) return;
    try {
        const { data, error } = await _supabase
            .from('teachers')
            .select(TEACHER_SAFE_COLUMNS)
            .eq('auth_user_id', authUser.id)
            .maybeSingle();
        if (_currentSession?.user?.id !== authUser.id) return;

        if (!error && data) {
            _applyResolvedProfile(data, authUser);
            if (window.currentProfile) {
                const isAdmin = await _resolveAdminUserFlag();
                if (_currentSession?.user?.id !== authUser.id) return;
                window.currentProfile.isAdminUser = isAdmin;
                window.currentProfile = _persistTeacherSession(window.currentProfile, authUser);
            }
            if (typeof loadAppData === 'function') loadAppData();
        } else {
            if (!SIGNUP_ACCEPTANCE_ENABLED) {
                await _rejectUnregisteredSignup();
                return;
            }
            _signupGoogleUser = authUser;
            _showSignupModal(_extractSignupProfileFromAuthUser(authUser));
        }
    } catch (e) {
        if (_currentSession?.user?.id !== authUser.id) return;
        if (['TEACHER_ACCOUNT_INACTIVE', 'AUTH_PROFILE_MISMATCH'].includes(e?.message)) return;
        console.error('[Auth] fallback query failed:', e);
        if (!SIGNUP_ACCEPTANCE_ENABLED) {
            await _rejectUnregisteredSignup();
            return;
        }
        _signupGoogleUser = authUser;
        _showSignupModal(_extractSignupProfileFromAuthUser(authUser));
    }
}

// ─── Google GIS (One-Tap / 관리자 흐름) ──────────────────────────────────────
function _waitForGoogle(cb) {
    if (window.google?.accounts?.id) { cb(); }
    else { setTimeout(() => _waitForGoogle(cb), 100); }
}

// GIS One-Tap 콜백 (id_token 방식 → 관리자 인증 포함)
async function _handleGISCredential(response) {
    const idToken = response.credential;
    try {
        const { data, error } = await _supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken
        });
        if (error) throw error;
        _currentSession = data.session;
        _syncProtectedPlaylabCookie(_currentSession);
        await _resolveTeacherProfile(data.user);
    } catch (err) {
        console.error('[Auth] GIS sign-in failed:', err);
        _showAuthError('Google 로그인에 실패했습니다. 다시 시도해주세요.');
    }
}

// ─── 일반 Google OAuth 로그인 (signInWithOAuth 리다이렉트 방식) ────────────────
async function handleGoogleLogin() {
    await _startOAuthLogin('google', 'googleOAuthBtn', '연결 중...', '구글로 시작하기', {
        scopes: 'email profile',
        queryParams: { access_type: 'offline', prompt: 'consent' }
    });
}

// ─── 이메일/비밀번호 로그인 ────────────────────────────────────────────────────
async function handleEmailLogin() {
    const manualForm = document.querySelector('.test-login-form');
    const manualLoginUnlocked = manualForm?.dataset?.manualUnlocked === 'true';
    if (!GENERAL_ACCOUNT_AUTH_ENABLED && !manualLoginUnlocked) {
        _showAuthError('일반 로그인은 현재 사용할 수 없습니다.');
        return;
    }
    const emailEl = document.getElementById('testId');
    const pwEl    = document.getElementById('testPw');
    const btn     = document.getElementById('emailLoginBtn');

    const loginId  = (emailEl?.value || '').trim();
    const password = (pwEl?.value || '').trim();
    const isEmailLogin = loginId.includes('@');

    if (!loginId || !password) {
        _showAuthError('아이디 또는 이메일과 비밀번호를 입력해주세요.');
        return;
    }

    const idleButtonLabel = btn?.dataset?.idleLabel || (isEmailLogin ? '이메일 로그인' : '아이디 로그인');
    if (btn) { btn.disabled = true; btn.textContent = '로그인 중...'; }

    try {
        if (isEmailLogin) {
            const { data, error } = await _supabase.auth.signInWithPassword({ email: loginId, password });
            if (error) throw error;
            _currentSession = data.session;
            _syncProtectedPlaylabCookie(_currentSession);
            await _resolveTeacherProfile(data.user);
            await _maybePromptPasswordChangeAfterLogin();
        } else {
            const authResult = await _callTeacherAuthManager('sign_in_teacher', {
                teacherId: loginId,
                password
            });
            const sessionPayload = authResult?.session || authResult;
            await _applyTeacherAuthSession(sessionPayload);
            const session = await _waitForTeacherSessionReady();
            if (!session?.user) {
                throw new Error('AUTH_USER_MISSING');
            }
            await _resolveTeacherProfile(session.user);
            await _maybePromptPasswordChangeAfterLogin();
        }
    } catch (err) {
        console.error('[Auth] Email login error:', err);
        _showAuthError(_friendlyAuthError(err.message, { isEmailLogin }));
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = idleButtonLabel; }
    }
}

function _unlockAccountLoginForm() {
    const divider = document.getElementById('accountLoginDivider') || document.querySelector('.login-divider');
    const form = document.getElementById('accountLoginForm') || document.querySelector('.test-login-form');
    const errorEl = document.getElementById('loginErrorMsg');
    if (!form) return;

    form.dataset.manualUnlocked = 'true';
    form.hidden = false;
    divider?.removeAttribute('hidden');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }
    setTimeout(() => document.getElementById('testId')?.focus?.(), 40);
}

function _initAccountLoginUnlock() {
    const trigger = document.getElementById('loginCopyrightTrigger');
    const form = document.getElementById('accountLoginForm') || document.querySelector('.test-login-form');
    if (!trigger || !form) return;

    let clickCount = 0;
    let resetTimer = null;
    trigger.addEventListener('click', () => {
        clickCount += 1;
        window.clearTimeout(resetTimer);
        if (clickCount >= ACCOUNT_LOGIN_UNLOCK_COUNT) {
            clickCount = 0;
            _unlockAccountLoginForm();
            return;
        }
        resetTimer = window.setTimeout(() => {
            clickCount = 0;
        }, 2500);
    });
}

function _showPasswordPromptError(message) {
    const errorEl = document.getElementById('passwordExpiryError');
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
}

function _clearPasswordPromptError() {
    const errorEl = document.getElementById('passwordExpiryError');
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.hidden = true;
}

function _showPasswordChangePrompt(profile) {
    _passwordChangePromptProfile = profile || window.currentProfile || null;
    _clearPasswordPromptError();
    const newPwEl = document.getElementById('passwordExpiryNew');
    const confirmPwEl = document.getElementById('passwordExpiryConfirm');
    if (newPwEl) newPwEl.value = '';
    if (confirmPwEl) confirmPwEl.value = '';
    document.getElementById('passwordExpiryModal')?.removeAttribute('hidden');
    setTimeout(() => newPwEl?.focus?.(), 50);
}

function _hidePasswordChangePrompt() {
    document.getElementById('passwordExpiryModal')?.setAttribute('hidden', '');
    _passwordChangePromptProfile = null;
}

async function deferPasswordChangePrompt() {
    if (_passwordRecoveryActive) return;
    const profile = _passwordChangePromptProfile || window.currentProfile;
    await _updateTeacherPasswordPolicy(profile, {
        password_change_required: true,
        password_change_reminded_at: new Date().toISOString()
    });
    _hidePasswordChangePrompt();
}

async function submitPasswordChangeFromPrompt() {
    const btn = document.getElementById('passwordExpirySubmitBtn');
    const newPassword = String(document.getElementById('passwordExpiryNew')?.value || '').trim();
    const confirmPassword = String(document.getElementById('passwordExpiryConfirm')?.value || '').trim();

    _clearPasswordPromptError();
    if (!_validateSignupPassword(newPassword)) {
        _showPasswordPromptError('비밀번호는 8자 이상 입력해 주세요.');
        return;
    }
    if (newPassword !== confirmPassword) {
        _showPasswordPromptError('비밀번호가 일치하지 않습니다.');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = '변경 중...';
    }

    try {
        const { error } = await _supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;

        const changedAt = new Date().toISOString();
        const saved = await _updateTeacherPasswordPolicy(
            _passwordChangePromptProfile || window.currentProfile,
            _getPasswordPolicyPayload(changedAt)
        );
        if (saved) {
            window.currentProfile = _persistTeacherSession({ ...(window.currentProfile || {}), ...saved });
        }
        _hidePasswordChangePrompt();
        if (_passwordRecoveryActive) {
            _passwordRecoveryActive = false;
            await _supabase.auth.signOut();
            _clearAuth();
            _showAuthError('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.');
        }
        if (typeof showBottomToast === 'function') {
            showBottomToast('비밀번호가 변경되었습니다.');
        }
    } catch (error) {
        console.warn('[Auth] password prompt update failed:', error);
        _showPasswordPromptError('비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '비밀번호 변경';
        }
    }
}

window.deferPasswordChangePrompt = deferPasswordChangePrompt;
window.submitPasswordChangeFromPrompt = submitPasswordChangeFromPrompt;
// HTML onclick에서 호출 가능하도록 window에도 등록
window.handleTestLogin = handleEmailLogin;
window.isAdminUser = isAdminUser;
window.openManualSignup = openManualSignup;
window.openAccountRecovery = openAccountRecovery;
window.closeAccountRecovery = closeAccountRecovery;
window.setAccountRecoveryTab = setAccountRecoveryTab;
window.submitFindTeacherId = submitFindTeacherId;
window.submitPasswordResetRequest = submitPasswordResetRequest;

async function _rejectUnregisteredSignup() {
    try {
        await _supabase?.auth?.signOut();
    } catch (_error) {
        // noop
    }
    _currentSession = null;
    window.currentProfile = null;
    _clearProtectedPlaylabCookie();
    _showLoginOverlay();
    _showAuthError('등록된 테스트 계정만 로그인할 수 있습니다.');
}

// ─── 에러 메시지 친화적 변환 ─────────────────────────────────────────────────
function _friendlyAuthError(message, { isEmailLogin = true } = {}) {
    const m = String(message || '').toLowerCase();
    if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) {
        return isEmailLogin
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
    if (m.includes('teacher_not_found') || m.includes('profile_missing') || m.includes('user not found')) {
        return isEmailLogin ? '존재하지 않는 이메일 계정입니다.' : '존재하지 않는 아이디입니다.';
    }
    if (m.includes('email not confirmed')) return '이메일 인증이 완료되지 않았습니다.';
    if (m.includes('too many requests')) return '잠시 후 다시 시도해주세요.';
    if (m.includes('network') || m.includes('fetch')) return '네트워크 오류가 발생했습니다.';
    return isEmailLogin ? '이메일 로그인 중 오류가 발생했습니다.' : '아이디 로그인 중 오류가 발생했습니다.';
}

function _showAuthError(msg) {
    if (document.getElementById('signupModal')?.classList.contains('active') && typeof showBottomToast === 'function') {
        showBottomToast(msg);
        return;
    }
    const el = document.getElementById('loginErrorMsg');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 5000);
    } else {
        alert(msg);
    }
}

function openAccountRecovery(defaultTab = 'id') {
    if (!GENERAL_ACCOUNT_AUTH_ENABLED) {
        _showAuthError('아이디 · 비밀번호 찾기는 현재 사용할 수 없습니다.');
        return;
    }
    const modal = document.getElementById('accountRecoveryModal');
    if (!modal) return;
    _setAccountRecoveryResult('', '');
    setAccountRecoveryTab(defaultTab);
    modal.classList.add('active');
    setTimeout(() => {
        const firstInput = defaultTab === 'password'
            ? document.getElementById('findPwEmail')
            : document.getElementById('findIdName');
        firstInput?.focus();
    }, 0);
}

function closeAccountRecovery() {
    document.getElementById('accountRecoveryModal')?.classList.remove('active');
}

function setAccountRecoveryTab(tab = 'id') {
    const normalizedTab = tab === 'password' ? 'password' : 'id';
    const idTab = document.getElementById('accountRecoveryIdTab');
    const pwTab = document.getElementById('accountRecoveryPasswordTab');
    const idPanel = document.getElementById('accountRecoveryIdPanel');
    const pwPanel = document.getElementById('accountRecoveryPasswordPanel');
    idTab?.classList.toggle('active', normalizedTab === 'id');
    pwTab?.classList.toggle('active', normalizedTab === 'password');
    idPanel?.classList.toggle('active', normalizedTab === 'id');
    pwPanel?.classList.toggle('active', normalizedTab === 'password');
    idTab?.setAttribute('aria-selected', normalizedTab === 'id' ? 'true' : 'false');
    pwTab?.setAttribute('aria-selected', normalizedTab === 'password' ? 'true' : 'false');
    _setAccountRecoveryResult('', '');
}

function _setAccountRecoveryResult(type = '', message = '') {
    const resultEl = document.getElementById('accountRecoveryResult');
    if (!resultEl) return;
    resultEl.classList.remove('is-success', 'is-error');
    if (!message) {
        resultEl.hidden = true;
        resultEl.textContent = '';
        return;
    }
    resultEl.hidden = false;
    if (type) resultEl.classList.add(`is-${type}`);
    resultEl.textContent = message;
}

function _setAccountRecoveryButtonLoading(buttonId, isLoading, loadingText, defaultText) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.disabled = Boolean(isLoading);
    btn.textContent = isLoading ? loadingText : defaultText;
}

function _showAccountRecoveryMissingMessage() {
    const message = '등록된 계정정보가 없습니다. 입력한 정보를 다시 확인해 주세요.';
    if (typeof showBottomToast === 'function') {
        showBottomToast(message);
    }
    _setAccountRecoveryResult('error', message);
}

async function submitFindTeacherId() {
    const name = String(document.getElementById('findIdName')?.value || '').trim();
    const contact = _formatSignupPhone(document.getElementById('findIdContact')?.value || '');
    if (!name || !_isValidSignupMobilePhone(contact)) {
        _setAccountRecoveryResult('error', '가입 시 입력한 이름과 휴대폰 번호를 확인해 주세요.');
        return;
    }

    _setAccountRecoveryButtonLoading('findIdSubmitBtn', true, '확인 중...', '아이디 찾기');
    try {
        const result = await _callTeacherAuthManager('find_teacher_id', { name, contact });
        const maskedId = String(result?.maskedTeacherId || '').trim();
        if (!result?.found || !maskedId) {
            _showAccountRecoveryMissingMessage();
            return;
        }
        _setAccountRecoveryResult('success', `가입하신 아이디는 ${maskedId} 입니다.`);
    } catch (error) {
        console.warn('[Auth] find teacher id failed:', error);
        _setAccountRecoveryResult('error', '아이디 찾기에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
        _setAccountRecoveryButtonLoading('findIdSubmitBtn', false, '확인 중...', '아이디 찾기');
    }
}

async function submitPasswordResetRequest() {
    const email = _normalizeSignupEmail(document.getElementById('findPwEmail')?.value || '');
    const name = String(document.getElementById('findPwName')?.value || '').trim();
    const contact = _formatSignupPhone(document.getElementById('findPwContact')?.value || '');
    if (!_isUsableSignupEmail(email) || !name || !_isValidSignupMobilePhone(contact)) {
        _setAccountRecoveryResult('error', '가입 이메일, 이름, 휴대폰 번호를 모두 정확히 입력해 주세요.');
        return;
    }

    _setAccountRecoveryButtonLoading('findPwSubmitBtn', true, '발송 중...', '비밀번호 재설정 이메일 받기');
    try {
        const result = await _callTeacherAuthManager('request_password_reset', { email, name, contact });
        if (!result?.sent) {
            _showAccountRecoveryMissingMessage();
            return;
        }
        _setAccountRecoveryResult('success', '등록된 계정이면 비밀번호 재설정 이메일을 발송합니다. 이메일의 링크에서 새 비밀번호를 설정해 주세요.');
    } catch (error) {
        console.warn('[Auth] password reset request failed:', error);
        _setAccountRecoveryResult('error', '재설정 이메일 발송을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
        _setAccountRecoveryButtonLoading('findPwSubmitBtn', false, '발송 중...', '비밀번호 재설정 이메일 받기');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const recoveryTrigger = document.getElementById('accountRecoveryTrigger');
    if (recoveryTrigger) {
        recoveryTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            openAccountRecovery();
        });
    }
    ['findIdContact', 'findPwContact'].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('input', () => {
            input.value = _formatSignupPhone(input.value);
        });
    });
});

// ─── 회원가입 폼 ─────────────────────────────────────────────────────────────
function _normalizeKakaoPhone(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';

    if (digits.startsWith('82')) {
        const domestic = `0${digits.slice(2)}`;
        return _formatSignupPhone(domestic);
    }
    return _formatSignupPhone(digits);
}

function _pickFirstNonEmpty(...values) {
    for (const value of values) {
        const normalized = String(value || '').trim();
        if (normalized) return normalized;
    }
    return '';
}

function _extractSignupProfileFromAuthUser(authUser) {
    const metadata = authUser?.user_metadata || {};
    const identities = Array.isArray(authUser?.identities) ? authUser.identities : [];
    const identityData = identities
        .map((identity) => identity?.identity_data || {})
        .find((data) => data && Object.keys(data).length > 0) || {};
    const metadataKakaoAccount = metadata?.kakao_account || {};
    const identityKakaoAccount = identityData?.kakao_account || {};
    const metadataProfile = metadataKakaoAccount?.profile || metadata?.profile || {};
    const identityProfile = identityKakaoAccount?.profile || identityData?.profile || {};

    const email = _pickFirstNonEmpty(
        authUser?.email
        , metadata?.email
        , metadataKakaoAccount?.email
        , identityData?.email
        , identityKakaoAccount?.email
    );

    const name = _pickFirstNonEmpty(
        metadata?.name
        , metadataKakaoAccount?.name
        , metadataKakaoAccount?.profile_nickname
        , metadataProfile?.nickname
        , metadata?.full_name
        , metadata?.nickname
        , identityData?.name
        , identityKakaoAccount?.name
        , identityKakaoAccount?.profile_nickname
        , identityProfile?.nickname
        , identityData?.nickname
        , identityData?.profile_nickname
    );

    const phone = _normalizeKakaoPhone(
        _pickFirstNonEmpty(
            metadata?.phone
            , metadata?.phone_number
            , metadataKakaoAccount?.phone_number
            , identityData?.phone_number
            , identityData?.phone
            , identityKakaoAccount?.phone_number
        )
    );

    return { email, name, phone };
}

function _setSignupFieldReadonly(fieldId, shouldLock) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.readOnly = Boolean(shouldLock);
    el.classList.toggle('signup-readonly-input', Boolean(shouldLock));
}

function _isManualSignupMode() {
    return _signupMode === 'manual';
}

function _setSignupMode(mode = 'social') {
    _signupMode = mode === 'manual' ? 'manual' : 'social';

    const isManual = _isManualSignupMode();
    const eyebrowEl = document.getElementById('signupPageEyebrow');
    const headingEl = document.getElementById('signupPageHeading');
    const subcopyEl = document.getElementById('signupPageSubcopy');
    const passwordSection = document.getElementById('signupPasswordSection');
    const passwordEl = document.getElementById('signupPassword');
    const passwordConfirmEl = document.getElementById('signupPasswordConfirm');
    const signupBtn = document.getElementById('signupBtn');
    const manualCheckControls = document.querySelectorAll('.signup-manual-check-control');

    if (eyebrowEl) eyebrowEl.textContent = isManual ? '일반 회원가입' : '회원가입 완료';
    if (headingEl) headingEl.textContent = isManual ? '계정 만들기' : '추가 정보 입력';
    if (subcopyEl) {
        subcopyEl.textContent = isManual
            ? '서비스 이용을 위해 로그인 계정과 센터 정보를 입력해주세요.'
            : '서비스 이용을 위해 센터 및 본인 정보를 입력해주세요.';
    }
    if (passwordSection) passwordSection.hidden = !isManual;
    if (passwordEl && !isManual) passwordEl.value = '';
    if (passwordConfirmEl && !isManual) passwordConfirmEl.value = '';
    if (signupBtn) signupBtn.textContent = isManual ? '회원가입' : '가입 완료';
    manualCheckControls.forEach((control) => { control.hidden = !isManual; });
    _clearSignupDuplicateState();
}

async function _getCurrentProviderToken() {
    const directToken = String(
        _currentSession?.provider_token
        || _currentSession?.providerToken
        || ''
    ).trim();
    if (directToken) return directToken;

    try {
        const { data } = await _supabase.auth.getSession();
        const token = String(
            data?.session?.provider_token
            || data?.session?.providerToken
            || ''
        ).trim();
        return token;
    } catch (error) {
        console.warn('[Auth] provider token lookup failed:', error);
        return '';
    }
}

async function _fetchKakaoProfileFromApi() {
    const provider = _getCurrentSignupProvider();
    if (provider !== 'kakao') return null;

    const providerToken = await _getCurrentProviderToken();
    if (!providerToken) return null;

    try {
        const response = await fetch('https://kapi.kakao.com/v2/user/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${providerToken}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP_${response.status}`);
        }

        const result = await response.json();
        const kakaoAccount = result?.kakao_account || {};
        const profile = kakaoAccount?.profile || {};

        return {
            email: _pickFirstNonEmpty(kakaoAccount?.email),
            name: _pickFirstNonEmpty(kakaoAccount?.name, profile?.nickname),
            phone: _normalizeKakaoPhone(_pickFirstNonEmpty(kakaoAccount?.phone_number))
        };
    } catch (error) {
        console.warn('[Auth] Kakao profile fetch failed:', error);
        return null;
    }
}

async function _hydrateSignupProfileFromProvider() {
    const provider = _getCurrentSignupProvider();
    if (provider !== 'kakao') return;

    const nameEl = document.getElementById('signupName');
    const emailEl = document.getElementById('signupEmail');
    const phoneEl = document.getElementById('signupPhone');
    if (!nameEl || !emailEl || !phoneEl) return;

    const currentName = String(nameEl.value || '').trim();
    const currentEmail = String(emailEl.value || '').trim();
    const currentPhone = _normalizeKakaoPhone(phoneEl.value || '');

    if (currentName && currentEmail && currentPhone) {
        _setSignupFieldReadonly('signupName', true);
        _setSignupFieldReadonly('signupPhone', true);
        return;
    }

    const remoteProfile = await _fetchKakaoProfileFromApi();
    if (!remoteProfile) return;

    if (!currentEmail && remoteProfile.email) {
        emailEl.value = remoteProfile.email;
    }
    if (!currentName && remoteProfile.name) {
        nameEl.value = remoteProfile.name;
    }
    if (!currentPhone && remoteProfile.phone) {
        phoneEl.value = remoteProfile.phone;
    }

    _setSignupFieldReadonly('signupName', Boolean(String(nameEl.value || '').trim()));
    _setSignupFieldReadonly('signupPhone', Boolean(_normalizeKakaoPhone(phoneEl.value || '')));
    _validateSignupForm();
    if (String(phoneEl.value || '').trim()) {
        void _checkSignupPhoneDuplicate({ showToast: false });
    }
}

function _showSignupModal(prefill = {}) {
    _setSignupMode(prefill?.mode === 'manual' ? 'manual' : 'social');
    const emailEl = document.getElementById('signupEmail');
    const passwordEl = document.getElementById('signupPassword');
    const passwordConfirmEl = document.getElementById('signupPasswordConfirm');
    const nameEl = document.getElementById('signupName');
    const phoneEl = document.getElementById('signupPhone');
    const centerEl = document.getElementById('signupCenter');
    const agreeAllEl = document.getElementById('agreeAll');
    const agreeTermsEl = document.getElementById('agreeTerms');
    const agreePrivacyEl = document.getElementById('agreePrivacy');

    if (emailEl) emailEl.value = String(prefill?.email || '').trim();
    if (passwordEl) passwordEl.value = '';
    if (passwordConfirmEl) passwordConfirmEl.value = '';
    if (nameEl) nameEl.value = String(prefill?.name || '').trim();
    if (phoneEl) phoneEl.value = _normalizeKakaoPhone(prefill?.phone || '');
    if (centerEl) centerEl.value = String(prefill?.center || '').trim();
    _setSignupFieldReadonly('signupEmail', !_isManualSignupMode());
    _setSignupFieldReadonly('signupName', !_isManualSignupMode() && Boolean(String(prefill?.name || '').trim()));
    _setSignupFieldReadonly('signupPhone', !_isManualSignupMode() && Boolean(_normalizeKakaoPhone(prefill?.phone || '')));
    if (agreeAllEl) agreeAllEl.checked = false;
    if (agreeTermsEl) agreeTermsEl.checked = false;
    if (agreePrivacyEl) agreePrivacyEl.checked = false;
    _clearSignupDuplicateState();
    _signupPhoneCheckToken += 1;
    _validateSignupForm();
    _setAuthView('signup');
    const signupModal = document.getElementById('signupModal');
    if (signupModal) {
        signupModal.removeAttribute('hidden');
        signupModal.classList.add('active');
    } else if (typeof openModal === 'function') {
        openModal('signupModal');
    }
    _hideLoginOverlay();
    if (!_isManualSignupMode()) {
        void _hydrateSignupProfileFromProvider();
    }
}

function toggleAllAgreements(checkbox) {
    document.querySelectorAll('.agree-item').forEach(el => {
        el.checked = checkbox.checked;
    });
    _validateSignupForm();
}

function _setSignupFieldInvalid(fieldId, shouldHighlight) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.toggle('signup-invalid', Boolean(shouldHighlight));
}

function _setSignupAgreementInvalid(shouldHighlight) {
    const agreementCard = document.getElementById('signupAgreementCard');
    if (!agreementCard) return;
    agreementCard.classList.toggle('signup-invalid', Boolean(shouldHighlight));
}

function _focusSignupField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    if (typeof field.focus === 'function') field.focus();
}

function _getSignupValidationState() {
    const email = (document.getElementById('signupEmail')?.value || '').trim();
    const center = (document.getElementById('signupCenter')?.value || '').trim();
    const name = (document.getElementById('signupName')?.value || '').trim();
    const phone = (document.getElementById('signupPhone')?.value || '').trim();
    const password = (document.getElementById('signupPassword')?.value || '').trim();
    const passwordConfirm = (document.getElementById('signupPasswordConfirm')?.value || '').trim();
    const agreeTerms = Boolean(document.getElementById('agreeTerms')?.checked);
    const agreePrivacy = Boolean(document.getElementById('agreePrivacy')?.checked);

    const missing = [];
    if (!email) missing.push({ id: 'signupEmail', label: '이메일 계정' });
    if (email && !_isUsableSignupEmail(email)) missing.push({ id: 'signupEmail', label: '올바른 이메일 형식' });
    if (_isManualSignupMode() && !password) missing.push({ id: 'signupPassword', label: '비밀번호' });
    if (_isManualSignupMode() && !passwordConfirm) missing.push({ id: 'signupPasswordConfirm', label: '비밀번호 확인' });
    if (!center) missing.push({ id: 'signupCenter', label: '소속 센터명' });
    if (!name) missing.push({ id: 'signupName', label: '이름' });
    if (!phone) missing.push({ id: 'signupPhone', label: '연락처' });
    if (phone && !_isValidSignupMobilePhone(phone)) missing.push({ id: 'signupPhone', label: '휴대폰 번호' });
    if (!agreeTerms) missing.push({ id: 'agreeTerms', label: '서비스 이용약관 동의', type: 'agreement' });
    if (!agreePrivacy) missing.push({ id: 'agreePrivacy', label: '개인정보 수집 및 이용 동의', type: 'agreement' });

    return {
        valid: missing.length === 0,
        missing
    };
}

function _isSignupRequiredInputComplete() {
    const email = (document.getElementById('signupEmail')?.value || '').trim();
    const center = (document.getElementById('signupCenter')?.value || '').trim();
    const name = (document.getElementById('signupName')?.value || '').trim();
    const phone = (document.getElementById('signupPhone')?.value || '').trim();
    const password = (document.getElementById('signupPassword')?.value || '').trim();
    const passwordConfirm = (document.getElementById('signupPasswordConfirm')?.value || '').trim();
    const agreeTerms = Boolean(document.getElementById('agreeTerms')?.checked);
    const agreePrivacy = Boolean(document.getElementById('agreePrivacy')?.checked);

    if (!email || !center || !name || !phone || !agreeTerms || !agreePrivacy) return false;
    if (_isManualSignupMode() && (!password || !passwordConfirm)) return false;
    return true;
}

function _areManualSignupDuplicateChecksComplete() {
    if (!_isManualSignupMode()) return true;
    const email = _normalizeSignupEmail(document.getElementById('signupEmail')?.value || '');
    const phone = _formatSignupPhone(document.getElementById('signupPhone')?.value || '');
    return Boolean(
        _signupDuplicateChecks.email.checked
        && _signupDuplicateChecks.email.value === email
        && !_signupDuplicateChecks.email.duplicate
        && _signupDuplicateChecks.phone.checked
        && _signupDuplicateChecks.phone.value === phone
        && !_signupDuplicateChecks.phone.duplicate
    );
}

function _applySignupValidationUi(validationState, { showErrors = false } = {}) {
    const missingIds = new Set((validationState?.missing || []).map((item) => item.id));

    _setSignupFieldInvalid('signupEmail', showErrors && missingIds.has('signupEmail'));
    _setSignupFieldInvalid('signupPassword', showErrors && missingIds.has('signupPassword'));
    _setSignupFieldInvalid('signupPasswordConfirm', showErrors && missingIds.has('signupPasswordConfirm'));
    _setSignupFieldInvalid('signupCenter', showErrors && missingIds.has('signupCenter'));
    _setSignupFieldInvalid('signupName', showErrors && missingIds.has('signupName'));
    _setSignupFieldInvalid('signupPhone', showErrors && missingIds.has('signupPhone'));
    _setSignupAgreementInvalid(
        showErrors && (missingIds.has('agreeTerms') || missingIds.has('agreePrivacy'))
    );

    const btn = document.getElementById('signupBtn');
    const requiredInputComplete = _isSignupRequiredInputComplete();
    if (btn) {
        if (btn.dataset.loading !== 'true') {
            btn.disabled = !requiredInputComplete;
        }
        btn.classList.toggle('is-disabled', !requiredInputComplete || Boolean(_signupPhoneDuplicate));
        btn.setAttribute('aria-disabled', requiredInputComplete ? 'false' : 'true');
    }
}

function _reportSignupValidationErrors(validationState) {
    if (validationState.valid) return;
    const labels = validationState.missing.map((item) => item.label);
    const message = `${labels.join(', ')} 항목을 입력하거나 체크해주세요.`;
    if (typeof showBottomToast === 'function') {
        showBottomToast(message);
    } else {
        _showAuthError(message);
    }

    _applySignupValidationUi(validationState, { showErrors: true });

    const firstMissing = validationState.missing[0];
    if (!firstMissing) return;
    if (firstMissing.type === 'agreement') {
        _focusSignupField(firstMissing.id);
        return;
    }
    _focusSignupField(firstMissing.id);
}

// 폼 입력 감지 → 버튼 활성화
document.addEventListener('DOMContentLoaded', () => {
    const signupModal = document.getElementById('signupModal');
    if (!signupModal) return;
    signupModal.addEventListener('input', _validateSignupForm);
    signupModal.addEventListener('change', _validateSignupForm);
    const emailInput = document.getElementById('signupEmail');
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            _clearSignupDuplicateState('email');
            _validateSignupForm();
        });
    }
    const phoneInput = document.getElementById('signupPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.value = _formatSignupPhone(phoneInput.value);
            _clearSignupDuplicateState('phone');
            _validateSignupForm();
        });
    }
});

function _validateSignupForm() {
    const validationState = _getSignupValidationState();
    _applySignupValidationUi(validationState, { showErrors: false });
    return validationState;
}
window.validateSignupForm = _validateSignupForm;

function _validateSignupPassword(password) {
    return /^(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]).{8,}$/.test(String(password || ''));
}

function _getSignupErrorMessage(error) {
    const code = String(error?.payload?.error || error?.message || '').trim();
    if (code === 'INVALID_PASSWORD') return '비밀번호는 8자 이상, 특수문자를 포함해 주세요.';
    if (code === 'REQUIRED_FIELDS_MISSING') return '필수 항목을 모두 입력해 주세요.';
    if (code === 'INVALID_NAME') return '이름은 한글로 입력해 주세요.';
    if (code === 'INVALID_CONTACT') return '연락처를 다시 확인해 주세요.';
    if (code === 'DUPLICATE_EMAIL') return '이미 사용 중인 이메일입니다.';
    if (code === 'DUPLICATE_CONTACT') return '이미 가입된 연락처입니다.';
    if (code === 'DUPLICATE_TEACHER_ID') return '이미 사용 중인 계정입니다. 다른 이메일을 입력해 주세요.';
    return '가입 중 오류가 발생했습니다. 입력 정보를 다시 확인해 주세요.';
}

function _formatSignupPhone(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function _getCurrentSignupProvider() {
    const provider = String(
        _signupGoogleUser?.app_metadata?.provider
        || _currentSession?.user?.app_metadata?.provider
        || _signupGoogleUser?.identities?.[0]?.provider
        || _currentSession?.user?.identities?.[0]?.provider
        || ''
    ).trim().toLowerCase();
    return provider;
}

function _getCurrentSignupConsentSource() {
    const provider = _getCurrentSignupProvider();
    if (provider === 'google') return 'google_signup';
    if (provider === 'kakao') return 'kakao_signup';
    return 'signup';
}

function _normalizeSignupEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function _isUsableSignupEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_normalizeSignupEmail(value));
}

function _isValidSignupMobilePhone(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return /^01[016789]\d{7,8}$/.test(digits);
}

function _maskAccountId(value) {
    const raw = String(value || '').trim();
    if (!raw) return '기존 계정';
    if (raw.includes('@')) {
        const [local, domain] = raw.split('@');
        const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
        const hiddenLength = Math.max(3, Math.min(6, local.length - visible.length || 3));
        return `${visible}${'*'.repeat(hiddenLength)}@${domain || ''}`;
    }
    if (raw.length <= 2) return `${raw.slice(0, 1)}**`;
    return `${raw.slice(0, 2)}${'*'.repeat(Math.max(3, Math.min(6, raw.length - 2)))}`;
}

function _getSignupAgreementSource(row, agreementRows = []) {
    const teacherId = String(row?.teacher_id || '').trim();
    const email = _normalizeSignupEmail(row?.email || '');
    const matched = agreementRows.find((agreement) => {
        const agreementTeacherId = String(agreement?.teacher_id || '').trim();
        const agreementEmail = _normalizeSignupEmail(agreement?.email || '');
        return (teacherId && agreementTeacherId === teacherId) || (email && agreementEmail === email);
    });
    return String(
        matched?.meta?.consent_source
        || matched?.meta?.consentSource
        || matched?.meta?.provider
        || ''
    ).trim().toLowerCase();
}

function _getSignupProviderLabel(row, agreementRows = []) {
    const source = _getSignupAgreementSource(row, agreementRows);
    if (source.includes('kakao')) return '카카오';
    if (source.includes('google')) return '구글';
    if (source.includes('manual') || source === 'signup') return '일반';
    return row?.auth_user_id ? '소셜' : '기존';
}

function _buildSignupDuplicateAccountLabel(row, agreementRows = []) {
    const providerLabel = _getSignupProviderLabel(row, agreementRows);
    const accountId = _maskAccountId(row?.email || row?.teacher_id || '');
    return `${providerLabel} 가입 내역 ${accountId}`;
}

function _setSignupDuplicateNotice(messages = []) {
    const noticeEl = document.getElementById('signupDuplicateNotice');
    if (!noticeEl) return;
    const visibleMessages = messages.filter(Boolean);
    if (!visibleMessages.length) {
        noticeEl.hidden = true;
        noticeEl.textContent = '';
        return;
    }
    noticeEl.textContent = visibleMessages.join('\n');
    noticeEl.hidden = false;
}

function _setSignupCheckStatus(kind, state, message) {
    const statusEl = document.getElementById(kind === 'email' ? 'signupEmailCheckStatus' : 'signupPhoneCheckStatus');
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || '';
    statusEl.classList.toggle('is-ok', state === 'ok');
    statusEl.classList.toggle('is-error', state === 'error');
}

function _clearSignupDuplicateState(scope = 'all') {
    if (scope === 'all' || scope === 'email') {
        _signupDuplicateChecks.email = { checked: false, value: '', duplicate: false };
        _setSignupCheckStatus('email', '', '');
    }
    if (scope === 'all' || scope === 'phone') {
        _signupDuplicateChecks.phone = { checked: false, value: '', duplicate: false };
        _setSignupCheckStatus('phone', '', '');
    }
    _signupPhoneDuplicate = Boolean(_signupDuplicateChecks.email.duplicate || _signupDuplicateChecks.phone.duplicate);
    if (!_signupPhoneDuplicate) {
        _signupDuplicateInfo = null;
        _setSignupDuplicateNotice();
    }
}

async function _fetchSignupAgreementRows(teacherRows = []) {
    const teacherIds = [...new Set(teacherRows.map((row) => String(row?.teacher_id || '').trim()).filter(Boolean))];
    const emails = [...new Set(teacherRows.map((row) => _normalizeSignupEmail(row?.email || '')).filter(Boolean))];
    const queries = [];

    if (teacherIds.length) {
        queries.push(
            _supabase
                .from('app_terms_agreements')
                .select('teacher_id,email,meta,agreed_at')
                .in('teacher_id', teacherIds)
                .order('agreed_at', { ascending: false })
        );
    }

    if (emails.length) {
        queries.push(
            _supabase
                .from('app_terms_agreements')
                .select('teacher_id,email,meta,agreed_at')
                .in('email', emails)
                .order('agreed_at', { ascending: false })
        );
    }

    if (!queries.length) return [];

    const results = await Promise.all(queries);
    return results.reduce((rows, result) => {
        if (result?.error) {
            console.warn('[Auth] signup agreement lookup failed:', result.error);
            return rows;
        }
        return rows.concat(Array.isArray(result?.data) ? result.data : []);
    }, []);
}

function _buildSignupDuplicateMessages({ emailRow, phoneRow, agreementRows }) {
    const messages = [];
    if (emailRow) {
        messages.push(`이미 사용 중인 이메일입니다. 이메일은 아이디로 사용되므로 다른 이메일을 입력해 주세요. 기존 계정: ${_buildSignupDuplicateAccountLabel(emailRow, agreementRows)}`);
    }
    if (phoneRow) {
        messages.push(`이미 가입된 연락처가 있습니다. 기존 계정: ${_buildSignupDuplicateAccountLabel(phoneRow, agreementRows)}. 혹시 기존에 가입한 적이 있는지 확인해 주세요. 동일한 연락처는 사용할 수 없습니다.`);
    }
    return messages;
}

async function _checkSignupPhoneDuplicate({ showToast = false } = {}) {
    return _checkSignupDuplicates({ showToast, scope: 'phone' });
}

async function _checkSignupDuplicates({ showToast = false, scope = 'all' } = {}) {
    const email = _normalizeSignupEmail(document.getElementById('signupEmail')?.value || '');
    const phone = _formatSignupPhone(document.getElementById('signupPhone')?.value || '');
    const digits = phone.replace(/\D/g, '');
    const shouldCheckEmail = scope !== 'phone' && _isUsableSignupEmail(email);
    const shouldCheckPhone = scope !== 'email' && _isValidSignupMobilePhone(phone);

    if (scope === 'email' && !_isUsableSignupEmail(email)) {
        _signupDuplicateChecks.email = { checked: false, value: email, duplicate: false };
        _setSignupCheckStatus('email', 'error', '올바른 이메일 형식으로 입력해 주세요.');
        _setSignupFieldInvalid('signupEmail', true);
        _validateSignupForm();
        return true;
    }

    if (scope === 'phone' && !_isValidSignupMobilePhone(phone)) {
        _signupDuplicateChecks.phone = { checked: false, value: phone, duplicate: false };
        _setSignupCheckStatus('phone', 'error', '01로 시작하는 휴대폰 번호만 등록할 수 있습니다.');
        _setSignupFieldInvalid('signupPhone', true);
        _validateSignupForm();
        return true;
    }

    if (!shouldCheckEmail && !shouldCheckPhone) {
        _clearSignupDuplicateState(scope);
        _validateSignupForm();
        return false;
    }

    const requestToken = ++_signupPhoneCheckToken;
    try {
        const emailQuery = shouldCheckEmail
            ? _supabase
                .from('teachers')
                .select('id, teacher_id, auth_user_id, email, contact')
                .ilike('email', email)
                .limit(3)
            : Promise.resolve({ data: [], error: null });
        const phoneQuery = shouldCheckPhone
            ? _supabase
                .from('teachers')
                .select('id, teacher_id, auth_user_id, email, contact')
                .eq('contact', phone)
                .limit(3)
            : Promise.resolve({ data: [], error: null });

        const [emailResult, phoneResult] = await Promise.all([emailQuery, phoneQuery]);

        if (requestToken !== _signupPhoneCheckToken) return _signupPhoneDuplicate;
        if (emailResult?.error) throw emailResult.error;
        if (phoneResult?.error) throw phoneResult.error;

        const currentAuthUserId = String(_currentSession?.user?.id || _signupGoogleUser?.id || '').trim();
        const isOtherAccount = (row) => {
            const rowAuthUserId = String(row?.auth_user_id || '').trim();
            return !currentAuthUserId || !rowAuthUserId || rowAuthUserId !== currentAuthUserId;
        };
        const emailRows = (Array.isArray(emailResult?.data) ? emailResult.data : []).filter(isOtherAccount);
        const phoneRows = (Array.isArray(phoneResult?.data) ? phoneResult.data : []).filter(isOtherAccount);
        const emailRow = emailRows[0] || null;
        const phoneRow = phoneRows[0] || null;
        const seenDuplicateKeys = new Set();
        const duplicateRows = [...emailRows, ...phoneRows].filter((row, index) => {
            const key = String(row?.id || row?.teacher_id || row?.email || `row-${index}`);
            if (seenDuplicateKeys.has(key)) return false;
            seenDuplicateKeys.add(key);
            return true;
        });
        const agreementRows = duplicateRows.length ? await _fetchSignupAgreementRows(duplicateRows) : [];
        const messages = _buildSignupDuplicateMessages({ emailRow, phoneRow, agreementRows });
        const duplicate = Boolean(emailRow || phoneRow);

        if (scope === 'all' || scope === 'email') {
            _signupDuplicateChecks.email = {
                checked: shouldCheckEmail,
                value: email,
                duplicate: Boolean(emailRow)
            };
            _setSignupCheckStatus(
                'email',
                emailRow ? 'error' : 'ok',
                emailRow ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.'
            );
        }
        if (scope === 'all' || scope === 'phone') {
            _signupDuplicateChecks.phone = {
                checked: shouldCheckPhone,
                value: phone,
                duplicate: Boolean(phoneRow)
            };
            _setSignupCheckStatus(
                'phone',
                phoneRow ? 'error' : 'ok',
                phoneRow ? '이미 가입된 연락처입니다.' : '사용 가능한 휴대폰 번호입니다.'
            );
        }
        _signupPhoneDuplicate = Boolean(_signupDuplicateChecks.email.duplicate || _signupDuplicateChecks.phone.duplicate || duplicate);
        _signupDuplicateInfo = duplicate ? { emailRow, phoneRow, agreementRows } : null;
        _setSignupDuplicateNotice(messages);
        if (duplicate && showToast && typeof showBottomToast === 'function') {
            showBottomToast(phoneRow ? '이미 가입된 연락처가 있습니다.' : '이미 사용 중인 이메일입니다.');
        }
    } catch (error) {
        console.warn('[Auth] signup duplicate check failed:', error);
        _clearSignupDuplicateState(scope);
    }

    _validateSignupForm();
    return _signupPhoneDuplicate;
}

async function checkSignupEmailDuplicate() {
    await _checkSignupDuplicates({ showToast: true, scope: 'email' });
}

async function checkSignupPhoneDuplicate() {
    await _checkSignupDuplicates({ showToast: true, scope: 'phone' });
}

window.checkSignupEmailDuplicate = checkSignupEmailDuplicate;
window.checkSignupPhoneDuplicate = checkSignupPhoneDuplicate;

async function _startOAuthLogin(provider, buttonId, loadingText, defaultText, options = {}) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.textContent = loadingText;
    }

    try {
        let redirectTo = null;
        if (window.location.protocol !== 'file:') {
            const currentUrl = new URL(window.location.href);
            currentUrl.search = '';
            currentUrl.hash = '';
            redirectTo = currentUrl.toString();
        }

        if (!redirectTo) {
            alert('소셜 로그인은 http:// 또는 https:// 환경에서만 작동합니다.');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = btn.dataset.originalHtml || defaultText;
            }
            return;
        }

        const { data, error } = await _supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
                skipBrowserRedirect: true,
                ...(options || {})
            }
        });
        if (error) throw error;
        const oauthUrl = String(data?.url || '').trim();
        if (!oauthUrl) {
            throw new Error('OAUTH_URL_MISSING');
        }
        window.location.assign(oauthUrl);
    } catch (err) {
        console.error(`[Auth] ${provider} OAuth error:`, err);
        const errorMessage = String(err?.message || err?.msg || '').trim();
        const providerLabel = defaultText.replace('으로 시작하기', '');
        if (provider === 'kakao' && /missing oauth secret/i.test(errorMessage)) {
            _showAuthError('카카오 Client Secret이 Supabase에 등록되지 않았습니다. Kakao Developers에서 Client Secret을 발급한 뒤 Supabase Kakao provider에 입력해주세요.');
        } else if (provider === 'kakao' && /unsupported provider|provider is not enabled/i.test(errorMessage)) {
            _showAuthError('카카오 로그인이 아직 활성화되지 않았습니다. Supabase Authentication > Providers에서 Kakao를 켜고 REST API Key와 Client Secret을 등록해주세요.');
        } else {
            _showAuthError(`${providerLabel} 로그인 중 오류가 발생했습니다.`);
        }
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.originalHtml || defaultText;
        }
    }
}

// 회원가입 제출
async function submitSignup() {
    const btn    = document.getElementById('signupBtn');
    const validationState = _getSignupValidationState();
    const currentEmail = _normalizeSignupEmail(document.getElementById('signupEmail')?.value || '');
    const currentPhone = _formatSignupPhone(document.getElementById('signupPhone')?.value || '');
    const currentPassword = (document.getElementById('signupPassword')?.value || '').trim();
    const currentPasswordConfirm = (document.getElementById('signupPasswordConfirm')?.value || '').trim();

    if (!validationState.valid) {
        _reportSignupValidationErrors(validationState);
        return;
    }

    if (_isManualSignupMode() && currentPassword !== currentPasswordConfirm) {
        _setSignupFieldInvalid('signupPasswordConfirm', true);
        _focusSignupField('signupPasswordConfirm');
        if (typeof showBottomToast === 'function') {
            showBottomToast('비밀번호가 일치하지 않습니다.');
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
        return;
    }
    if (_isManualSignupMode() && !_validateSignupPassword(currentPassword)) {
        _setSignupFieldInvalid('signupPassword', true);
        _focusSignupField('signupPassword');
        if (typeof showBottomToast === 'function') {
            showBottomToast('비밀번호는 8자 이상, 특수문자를 포함해 주세요.');
        } else {
            alert('비밀번호는 8자 이상, 특수문자를 포함해 주세요.');
        }
        return;
    }

    if (_isManualSignupMode()) {
        if (!_isUsableSignupEmail(currentEmail)) {
            _setSignupFieldInvalid('signupEmail', true);
            _setSignupCheckStatus('email', 'error', '올바른 이메일 형식으로 입력해 주세요.');
            _focusSignupField('signupEmail');
            return;
        }
        if (!_isValidSignupMobilePhone(currentPhone)) {
            _setSignupFieldInvalid('signupPhone', true);
            _setSignupCheckStatus('phone', 'error', '01로 시작하는 휴대폰 번호만 등록할 수 있습니다.');
            _focusSignupField('signupPhone');
            return;
        }
        if (!_areManualSignupDuplicateChecksComplete()) {
            if (btn) {
                btn.dataset.loading = 'true';
                btn.disabled = true;
                btn.classList.remove('is-disabled');
                btn.textContent = '확인 중...';
            }
            const hasDuplicate = await _checkSignupDuplicates({ showToast: true, scope: 'all' });
            if (btn) {
                btn.dataset.loading = 'false';
                btn.disabled = false;
                btn.textContent = '회원가입';
            }
            if (hasDuplicate || !_areManualSignupDuplicateChecksComplete()) {
                const needsEmailCheck = !_signupDuplicateChecks.email.checked || _signupDuplicateChecks.email.value !== currentEmail || _signupDuplicateChecks.email.duplicate;
                _focusSignupField(needsEmailCheck ? 'signupEmail' : 'signupPhone');
                return;
            }
        }
    } else if (await _checkSignupDuplicates({ showToast: true })) {
        if (_signupDuplicateInfo?.emailRow) _setSignupFieldInvalid('signupEmail', true);
        if (_signupDuplicateInfo?.phoneRow) _setSignupFieldInvalid('signupPhone', true);
        _focusSignupField(_signupDuplicateInfo?.emailRow ? 'signupEmail' : 'signupPhone');
        return;
    }
    const name   = (document.getElementById('signupName')?.value || '').trim();
    const center = (document.getElementById('signupCenter')?.value || '').trim();
    const phone  = _formatSignupPhone(document.getElementById('signupPhone')?.value || '');
    const gender = 'unspecified';
    const age    = 0;
    const email  = (document.getElementById('signupEmail')?.value || '').trim();
    const password = currentPassword;

    if (btn) {
        btn.dataset.loading = 'true';
        btn.disabled = true;
        btn.classList.remove('is-disabled');
        btn.textContent = '처리 중...';
    }

    try {
        if (_isManualSignupMode()) {
            const teacherId = _buildFallbackTeacherId(email, phone || Date.now());
            const result = await _callTeacherAuthManager('create_user', {
                email,
                password,
                name,
                teacherId,
                center,
                gender,
                age,
                contact: phone,
                status: 'active',
                consentSource: 'manual_signup',
                locale: navigator.language || 'ko-KR',
                uiVersion: '2026.04',
                consentScope: {
                    serviceTermsAgreed: true,
                    privacyTermsAgreed: true
                }
            });

            const sessionPayload = result?.session || result?.authSession || null;
            if (sessionPayload?.access_token && sessionPayload?.refresh_token) {
                await _applyTeacherAuthSession(sessionPayload);
            } else {
                const signInResult = await _callTeacherAuthManager('sign_in_teacher', {
                    teacherId,
                    password
                });
                await _applyTeacherAuthSession(signInResult?.session || signInResult);
            }

            const session = await _waitForTeacherSessionReady();
            await _resolveTeacherProfile(session.user);
            await _markInitialPasswordPolicy(window.currentProfile);
            _clearSignupContext();
            if (typeof closeModal === 'function') closeModal('signupModal');
            if (typeof loadAppData === 'function') loadAppData();
            return;
        }

        const authId = _currentSession?.user?.id || _signupGoogleUser?.id;
        if (!authId) throw new Error('AUTH_MISSING');
        const consentSource = _getCurrentSignupConsentSource();

        // teachers 테이블에 insert (Edge Function teacher-auth-manager를 통하는 것이 안전하나
        // 현재 환경에서는 직접 insert 시도)
        const payload = {
            name,
            center,
            contact: phone,
            gender,
            age,
            email,
            teacher_id: _buildFallbackTeacherId(email, authId),
            auth_user_id: authId,
            status: 'active',
            role: 'teacher'
        };

        const { data, error } = await _supabase
            .from('teachers')
            .insert([payload])
            .select(TEACHER_SAFE_COLUMNS)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (data) {
            window.currentProfile = _applyResolvedProfile(data);
        } else {
            window.currentProfile = _applyResolvedProfile(payload);
        }

        try {
            await _callTeacherAuthManager('save_terms_agreement', {
                teacherId: window.currentProfile?.teacherId || window.currentProfile?.teacher_id || payload.teacher_id,
                email,
                agreedAt: new Date().toISOString(),
                consentSource,
                locale: navigator.language || 'ko-KR',
                uiVersion: '2026.04',
                consentScope: {
                    serviceTermsAgreed: true,
                    privacyTermsAgreed: true
                },
                meta: {
                    center,
                    name,
                    contact: phone,
                    provider: _getCurrentSignupProvider() || 'manual'
                }
            });
        } catch (agreementError) {
            console.warn('[Auth] save_terms_agreement failed:', agreementError);
        }

        _clearSignupContext();
        if (typeof closeModal === 'function') closeModal('signupModal');

        if (typeof loadAppData === 'function') loadAppData();

    } catch (err) {
        console.error('[Auth] Signup error:', err);
        _showAuthError(_getSignupErrorMessage(err));
    } finally {
        if (btn) {
            btn.dataset.loading = 'false';
            btn.disabled = false;
            btn.textContent = _isManualSignupMode() ? '회원가입' : '가입 완료';
        }
        _validateSignupForm();
    }
}

function cancelSignupFlow() {
    if (typeof closeModal === 'function') closeModal('signupModal');
    _showLoginOverlay();
}

async function handleKakaoLogin() {
    await _startOAuthLogin('kakao', 'kakaoOAuthBtn', '연결 중...', '카카오로 시작하기', {
        scopes: 'account_email'
    });
}

function openManualSignup() {
    if (!GENERAL_ACCOUNT_AUTH_ENABLED) {
        _showAuthError('일반 회원가입은 현재 사용할 수 없습니다.');
        return;
    }
    _signupGoogleUser = null;
    _clearSignupDuplicateState();
    _signupPhoneCheckToken += 1;
    _showSignupModal({ mode: 'manual' });
}

async function _signupViaEdgeFunction(payload) {
    console.warn('[Auth] _signupViaEdgeFunction is disabled for social signup:', payload);
    _showAuthError('계정 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
}

// ─── 로그아웃 ─────────────────────────────────────────────────────────────────
async function logout() {
    if (typeof showConfirm === 'function') {
        showConfirm('정말 로그아웃 하시겠습니까?', async () => {
            await _performLogout();
        });
    } else {
        if (confirm('정말 로그아웃 하시겠습니까?')) await _performLogout();
    }
}

async function _performLogout() {
    _intentionalLogout = true;
    _clearAuth();
    await Promise.allSettled([_supabase.auth.signOut(), _protectedSessionRequest]);
    // A network failure must not restore the old browser session on reload.
    localStorage.removeItem('sb-gxungzlecmibgvykoiib-auth-token');
    localStorage.removeItem('sb-gxungzlecmibgvykoiib-auth-token-code-verifier');
    location.replace('./index.html');
}

// ─── 헬퍼 함수들 ──────────────────────────────────────────────────────────────

function _hideLoginOverlay() {
    document.getElementById('loginOverlay')?.classList.remove('active');
}

function _showLoginOverlay() {
    document.getElementById('loginOverlay')?.classList.add('active');
    _setAuthView('logged-out');
}

function _clearAuth() {
    window.__hahaLabSensitiveSessionOwner = '';
    window.currentProfile = null;
    _currentSession = null;
    _signupGoogleUser = null;
    _passwordChangePromptProfile = null;
    _passwordRecoveryActive = false;
    _purgeSensitiveSessionData();
    _clearProtectedPlaylabCookie();
    localStorage.removeItem(TEACHER_SESSION_KEY);
    localStorage.removeItem(TEACHER_CURRENT_SESSION_KEY);
    _showLoginOverlay();
}

function _updateGnbProfile(profile) {
    if (!profile) return;
    const name   = profile.name   || '선생님';
    const center = profile.center || '';
    const displayText = center ? `${name} (${center})` : name;

    // GNB 버튼
    const gnbName   = document.getElementById('gnbProfileName');
    const gnbAvatar = document.getElementById('gnbAvatarInitial');
    if (gnbName)   gnbName.textContent   = displayText;
    if (gnbAvatar) gnbAvatar.textContent = name.charAt(0);

    // 마이페이지 모달 헤더
    const mpName = document.getElementById('myPageProfileName');
    if (mpName) mpName.textContent = name;

    // 마이페이지 프로필 탭 입력 필드 자동 채우기
    const fields = {
        'signupName':   name,
        'signupCenter': center,
        'signupGender': profile.gender || '',
        'signupAge':    profile.age    || ''
    };
    // 마이페이지 내부 편집 필드들 (openMyPage에서도 호출하나 여기서 미리 세팅)
    const mpName2   = document.querySelector('#tab-profile .mp-field-name');
    if (mpName2)   mpName2.value  = name;
    const mpCenter2 = document.querySelector('#tab-profile .mp-field-center');
    if (mpCenter2) mpCenter2.value = center;
}

async function _updateLastSeen(teacherDbId) {
    if (!teacherDbId) return;
    try {
        await _supabase.from('teachers')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', teacherDbId);
    } catch (e) {
        console.warn('[Auth] last_seen update failed:', e);
    }
}

function _getSignupContext() {
    try {
        const raw = sessionStorage.getItem(SIGNUP_CONTEXT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function _clearSignupContext() {
    sessionStorage.removeItem(SIGNUP_CONTEXT_KEY);
    sessionStorage.removeItem(SIGNUP_REVIEW_KEY);
    sessionStorage.removeItem(AUTH_PENDING_KEY);
}

window.persistTeacherSession = _persistTeacherSession;
