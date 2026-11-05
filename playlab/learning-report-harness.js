(function () {
  'use strict';

  const STORAGE_KEY = 'haha_lab_learning_harness_records_v1';
  const SYNC_STORAGE_KEY = 'haha_lab_learning_harness_sync_queue_v1';
  const LAUNCH_PREFIX = 'haha_lab_direct_launch_';
  const COMPLETION_ACTION = '게임 완료';
  const DEFAULT_SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
  let syncInFlight = null;
  let verifiedQueueOwner = null;
  let observedAuthClient = null;
  let queueStorageCorrupt = false;
  const DURABLE_QUEUE_PREFIX = SYNC_STORAGE_KEY + '::';
  const QUEUE_NAMESPACE = 'learning-session';
  let memoryRecords = [];

  function parseMaybeJson(value, fallback) {
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

  function readLaunchContext() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const pageFileName = String(window.location.pathname || '').split('/').pop() || '';
      const inferredKind = String(params.get('labKind') || '').trim()
        || (pageFileName.startsWith('rehablab-') ? 'rehab' : '');
      const launchKey = String(params.get('labLaunchKey') || '').trim();
      // Identifying display context stays in the authenticated parent memory.
      // Only minimal routing IDs are retained in the tab's launch storage.
      if (launchKey && window.parent && window.parent !== window) {
        const transient = window.parent.readTransientLabLaunchContext?.(launchKey, window);
        if (transient) return Object.assign({}, transient, { launchKey });
      }
      if (launchKey && launchKey.indexOf(LAUNCH_PREFIX) === 0 && window.sessionStorage) {
        const parsed = parseMaybeJson(window.sessionStorage.getItem(launchKey), null);
        if (parsed && typeof parsed === 'object') return Object.assign({}, parsed, {
          launchKey,
          anonymous: parsed.anonymous === true || String(params.get('labAnonymous') || '').trim() === '1',
          kind: String(parsed.kind || inferredKind || '').trim()
        });
      }
      const teacherId = String(params.get('teacherId') || '').trim();
      const clientId = String(params.get('clientId') || '').trim();
      const anonymous = String(params.get('labAnonymous') || '').trim() === '1';
      if (teacherId || clientId || inferredKind) {
        return {
          teacherId,
          teacherName: String(params.get('teacherName') || '').trim(),
          clientId,
          clientName: String(params.get('clientName') || '').trim(),
          clientType: String(params.get('clientType') || 'client').trim() || 'client',
          anonymous,
          kind: inferredKind,
          launchKey,
          source: 'query'
        };
      }
    } catch (_error) {}
    return null;
  }

  function secureStore() {
    try { return window.HahaLabSecureQueueStore || (window.parent !== window && window.parent.HahaLabSecureQueueStore) || null; }
    catch (_error) { return window.HahaLabSecureQueueStore || null; }
  }

  async function prepareSecureStore(client, owner) {
    if (!secureStore()) {
      window.__hahaLabSecureQueueStoreLoadPromise = window.__hahaLabSecureQueueStoreLoadPromise || new Promise((resolve, reject) => {
        const script = document.createElement('script'); script.src = '/js/learning-queue-secure-store.js';
        script.onload = resolve; script.onerror = () => reject(new Error('QUEUE_STORE_UNAVAILABLE')); document.head.appendChild(script);
      }).catch(error => { window.__hahaLabSecureQueueStoreLoadPromise = null; throw error; });
      await window.__hahaLabSecureQueueStoreLoadPromise;
    }
    return secureStore().ensure(client, owner, currentQueueOwner);
  }

  function readRecords() {
    const owner = currentQueueOwner();
    if (!owner) return [];
    const store = secureStore();
    if (store?.ready(owner)) store.migrateArray('learning-record-cache', STORAGE_KEY, owner, record => belongsToQueueOwner(record, owner), record => String(record.id));
    const legacy = store?.list('learning-record-cache', owner).map(item => item.value) || [];
    const records = [...legacy, ...memoryRecords];
    return records.filter((record, index) => belongsToQueueOwner(record, owner) && records.findLastIndex(item => item.id === record.id) === index);
  }

  function writeRecords(records) {
    const owner = currentQueueOwner();
    memoryRecords = [...memoryRecords.filter(record => !belongsToQueueOwner(record, owner)), ...records];
  }

  function currentQueueOwner() {
    try {
      if (typeof window.getAuthenticatedReportOwner === 'function') return window.currentProfile && !['normal', 'active'].includes(String(window.currentProfile.status)) ? null : window.getAuthenticatedReportOwner();
      if (window.parent && window.parent !== window && typeof window.parent.getAuthenticatedReportOwner === 'function') return window.parent.currentProfile && !['normal', 'active'].includes(String(window.parent.currentProfile.status)) ? null : window.parent.getAuthenticatedReportOwner();
    } catch (_error) { return null; }
    // SDK auth transitions clear this verified identity. A 30-second cache TTL
    // must not discard an already-unlocked offline lesson before completion.
    return verifiedQueueOwner;
  }

  function belongsToQueueOwner(job, owner) {
    return Boolean(owner?.authUserId && owner?.teacherId
      && String(job?.history?.teacher_id || job?.history?.teacherId || '') === String(owner.teacherId)
      && (!job.authUserId || job.authUserId === owner.authUserId));
  }

  function readAllSyncQueue() {
    queueStorageCorrupt = false;
    const owner = currentQueueOwner();
    const store = secureStore();
    if (!owner || !store?.ready(owner)) return [];
    const identity = job => String(job.id);
    store.migrateArray(QUEUE_NAMESPACE, SYNC_STORAGE_KEY, owner, job => belongsToQueueOwner(job, owner), identity);
    for (const key of Object.keys(window.localStorage)) {
      if (!key.startsWith(DURABLE_QUEUE_PREFIX)) continue;
      const raw = window.localStorage.getItem(key);
      const job = parseMaybeJson(raw, null);
      if (!belongsToQueueOwner(job, owner)) continue;
      try {
        store.put(QUEUE_NAMESPACE, job, owner, identity);
        if (window.localStorage.getItem(key) === raw) window.localStorage.removeItem(key);
      } catch (_error) { /* Keep original unchanged until encryption is durable. */ }
    }
    const encrypted = store.list(QUEUE_NAMESPACE, owner).map(snapshot => Object.assign({}, snapshot.value, { __secureSnapshot: snapshot }));
    const blocked = [];
    const rawArray = parseMaybeJson(window.localStorage.getItem(SYNC_STORAGE_KEY), []);
    if (Array.isArray(rawArray)) blocked.push(...rawArray.filter(job => belongsToQueueOwner(job, owner)));
    for (const key of Object.keys(window.localStorage)) {
      if (!key.startsWith(DURABLE_QUEUE_PREFIX)) continue;
      const job = parseMaybeJson(window.localStorage.getItem(key), null);
      if (belongsToQueueOwner(job, owner)) blocked.push(job);
    }
    return [...encrypted, ...blocked.map(job => Object.assign({}, job, { __legacyBlocked: true }))];
  }

  function readSyncQueue() {
    const owner = currentQueueOwner();
    return owner ? readAllSyncQueue().filter((job) => belongsToQueueOwner(job, owner)) : [];
  }

  function writeSyncQueue(_queue) {
    // Immutable encrypted jobs are removed only by exact ACK; retry diagnostics
    // remain in memory rather than rewriting canonical source across tabs.
    return true;
  }

  async function resolveQueueOwner(client) {
    const provided = currentQueueOwner();
    if (provided?.authUserId && provided?.teacherId) return provided;
    // An application owner provider returning null means signed-out/blocked.
    try {
      if (typeof window.getAuthenticatedReportOwner === 'function'
        || window.parent && window.parent !== window && typeof window.parent.getAuthenticatedReportOwner === 'function') return null;
    } catch (_error) { return null; }
    try {
      if (observedAuthClient !== client && client.auth?.onAuthStateChange) {
        observedAuthClient = client;
        client.auth.onAuthStateChange((event, session) => {
          try {
            const claims = session?.access_token ? JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) : null;
            if (event !== 'SIGNED_OUT' && verifiedQueueOwner && session?.user?.id === verifiedQueueOwner.authUserId && claims?.session_id === verifiedQueueOwner.sessionId) return;
          } catch (_error) {}
          verifiedQueueOwner = null; secureStore()?.clear();
        });
      }
      const userResult = await client.auth.getUser();
      const sessionResult = await client.auth.getSession();
      const session = sessionResult?.data?.session;
      const claims = session?.access_token ? JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) : null;
      if (sessionResult?.error || session?.user?.id !== userResult?.data?.user?.id || !claims?.session_id) return null;
      if (userResult?.error || !userResult?.data?.user?.id) return null;
      const [profileResult, active] = await Promise.all([client.rpc('get_my_teacher_profile'), client.rpc('security_session_active')]);
      const profile = Array.isArray(profileResult.data) ? profileResult.data[0] : profileResult.data;
      if (profileResult.error || active.error || active.data !== true || !profile?.teacher_id || !['normal', 'active'].includes(profile.status)) return null;
      verifiedQueueOwner = { sessionId: String(claims.session_id), authUserId: userResult.data.user.id, teacherId: String(profile.teacher_id) };
      return verifiedQueueOwner;
    } catch (_error) { verifiedQueueOwner = null; return null; }
  }

  function hasRemoteContext(record) {
    const history = record && record.history ? record.history : {};
    const teacherId = String(history.teacher_id || history.teacherId || '').trim();
    const clientId = String(history.client_id || history.clientId || '').trim();
    return Boolean(teacherId && clientId && clientId !== 'local-client');
  }

  function buildRemoteHistoryRow(history) {
    if (!history || typeof history !== 'object') return null;
    const durationMinutes = Math.max(1, Math.round(safeNumber(history.duration_minutes || history.durationMinutes, 1)));
    const details = history.details && typeof history.details === 'object'
      ? history.details
      : parseMaybeJson(history.details, {});
    const metadata = history.metadata && typeof history.metadata === 'object'
      ? history.metadata
      : parseMaybeJson(history.metadata, {});
    return {
      teacher_id: String(history.teacher_id || history.teacherId || '').trim(),
      client_id: String(history.client_id || history.clientId || '').trim(),
      client_name: String(history.client_name || history.clientName || '').trim(),
      type: String(history.type || 'client').trim() || 'client',
      category: String(history.category || 'session_history').trim() || 'session_history',
      action: String(history.action || COMPLETION_ACTION).trim() || COMPLETION_ACTION,
      action_type: String(history.action_type || history.actionType || details.lab_title || details.game_name || '학습').trim() || '학습',
      event_datetime: String(history.event_datetime || history.eventDatetime || new Date().toISOString()),
      start_datetime: String(history.start_datetime || history.startDatetime || history.event_datetime || new Date().toISOString()),
      end_datetime: String(history.end_datetime || history.endDatetime || history.event_datetime || new Date().toISOString()),
      duration: `${durationMinutes} minutes`,
      duration_minutes: durationMinutes,
      details: JSON.stringify(details),
      metadata: Object.assign({}, metadata, {
        duration: `${durationMinutes} minutes`,
        duration_minutes: durationMinutes
      }),
      memo: String(history.memo || details.report_title || details.lab_title || '').trim()
    };
  }

  function buildRemoteCardlabAttemptRow(attempt) {
    if (!attempt || typeof attempt !== 'object') return null;
    const clientId = String(attempt.client_id || attempt.clientId || '').trim();
    const curriculumKey = String(attempt.curriculum_key || attempt.curriculumKey || '').trim();
    if (!clientId || !curriculumKey || clientId === 'local-client') return null;
    const totalQuestions = safeNumber(attempt.total_questions || attempt.totalQuestions, 0);
    const correctCount = safeNumber(attempt.correct_count || attempt.correctCount, 0);
    const wrongCount = safeNumber(attempt.wrong_count || attempt.wrongCount, Math.max(0, totalQuestions - correctCount));
    return {
      client_id: clientId,
      teacher_id: String(attempt.teacher_id || attempt.teacherId || '').trim(),
      curriculum_key: curriculumKey,
      stage_key: String(attempt.stage_key || attempt.stageKey || '').trim(),
      stage_title: String(attempt.stage_title || attempt.stageTitle || '').trim(),
      completed_at: String(attempt.completed_at || attempt.completedAt || new Date().toISOString()),
      score: Math.max(0, Math.min(100, Math.round(safeNumber(attempt.score, 0)))),
      correct_count: correctCount,
      wrong_count: wrongCount,
      total_questions: totalQuestions,
      duration_seconds: Math.max(0, Math.round(safeNumber(attempt.duration_seconds || attempt.durationSeconds, 0))),
      cleared: Boolean(attempt.cleared),
      wrong_words: Array.isArray(attempt.wrong_words || attempt.wrongWords) ? (attempt.wrong_words || attempt.wrongWords) : [],
      question_snapshot: Array.isArray(attempt.question_snapshot || attempt.questionSnapshot) ? (attempt.question_snapshot || attempt.questionSnapshot) : [],
      result_snapshot: Array.isArray(attempt.result_snapshot || attempt.resultSnapshot) ? (attempt.result_snapshot || attempt.resultSnapshot) : []
    };
  }

  function getSupabaseClient() {
    if (window.supabaseClient && typeof window.supabaseClient.rpc === 'function') {
      return Promise.resolve(window.supabaseClient);
    }
    if (window.HAHA_SUPABASE_CLIENT && typeof window.HAHA_SUPABASE_CLIENT.rpc === 'function') {
      return Promise.resolve(window.HAHA_SUPABASE_CLIENT);
    }
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      window.HAHA_SUPABASE_CLIENT = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
      return Promise.resolve(window.HAHA_SUPABASE_CLIENT);
    }
    return Promise.resolve(null);
  }

  function queueSyncRecord(record, options) {
    const durable = options?.durable === true;
    const fail = (code) => { if (durable) throw new Error(code); return null; };
    if (!hasRemoteContext(record)) return fail('SESSION_SYNC_OWNER_MISSING');
    const historyRow = buildRemoteHistoryRow(record.history);
    const attemptRow = buildRemoteCardlabAttemptRow(record.cardlabAttempt);
    if (!historyRow) return fail('SESSION_SYNC_HISTORY_MISSING');
    const owner = currentQueueOwner();
    if (owner && String(historyRow.teacher_id) !== String(owner.teacherId)) return fail('SESSION_SYNC_OWNER_MISMATCH');
    const queue = readAllSyncQueue();
    if (queueStorageCorrupt) return fail('SESSION_SYNC_STORAGE_UNREADABLE');
    const sessionId = String(parseMaybeJson(historyRow.details, {}).session_id || '').trim();
    const existingJob = sessionId ? queue.find((item) => String(item?.history?.teacher_id) === String(historyRow.teacher_id)
      && String(item?.history?.client_id) === String(historyRow.client_id)
      && String(parseMaybeJson(item?.history?.details, {}).session_id || '').trim() === sessionId) : null;
    if (existingJob) {
      if (existingJob.__legacyBlocked) return fail('SESSION_SYNC_LEGACY_NOT_DURABLE');
      if (JSON.stringify([existingJob.history, existingJob.cardlabAttempt]) !== JSON.stringify([historyRow, attemptRow])) return fail('SESSION_SYNC_EXISTING_PAYLOAD_MISMATCH');
      return existingJob;
    }
    const job = { id: record.id || `sync-${crypto.randomUUID()}`, createdAt: new Date().toISOString(), attempts: 0,
      history: historyRow, cardlabAttempt: attemptRow, ...(owner?.authUserId ? { authUserId: owner.authUserId } : {}) };
    const store = secureStore();
    if (!owner || !store?.ready(owner)) {
      void flushSyncQueue();
      return fail('SESSION_SYNC_KEY_UNAVAILABLE');
    }
    if (!sessionId) return fail('SESSION_SYNC_SESSION_ID_MISSING');
    if (queue.length >= 240) return fail('SESSION_SYNC_QUEUE_FULL');
    try { store.put(QUEUE_NAMESPACE, job, owner, item => String(item.id)); }
    catch (_error) { return fail('SESSION_SYNC_STORAGE_WRITE_FAILED'); }
    flushSyncQueue();
    return job;
  }

  function flushSyncQueue() {
    if (syncInFlight) return syncInFlight;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return Promise.resolve({ skipped: true });
    }
    syncInFlight = Promise.resolve().then(getSupabaseClient).then(async (client) => {
      if (!client) return { skipped: true, reason: 'supabase-client-unavailable' };
      const owner = await resolveQueueOwner(client);
      if (!owner) return { skipped: true, reason: 'verified-owner-unavailable' };
      if (!await prepareSecureStore(client, owner)) return { skipped: true, reason: 'queue-key-unavailable' };
      // Key preload can finish after synchronous producers attempted a save.
      for (const record of readRecords().filter(item => belongsToQueueOwner(item, owner) && !item.remotePayloadVerified)) {
        try { queueSyncRecord(record, { durable: true }); } catch (_error) {}
      }
      const queue = readAllSyncQueue().filter((job) => belongsToQueueOwner(job, owner));
      const outcomes = new Map();
      let synced = 0;
      for (const job of queue) {
        const session = String(parseMaybeJson(job.history?.details, {}).session_id || '');
        if (job.__legacyBlocked || queue.some(other => other !== job && String(other.history?.teacher_id) === String(job.history?.teacher_id)
          && String(other.history?.client_id) === String(job.history?.client_id) && String(parseMaybeJson(other.history?.details, {}).session_id || '') === session
          && syncJobPayloadKey(other) !== syncJobPayloadKey(job))) continue;
        const original = syncJobPayloadKey(job);
        try {
          const currentOwner = currentQueueOwner() || await resolveQueueOwner(client);
          if (!belongsToQueueOwner(job, currentOwner)) continue;
          const payload = buildSyncRpcPayload(job);
          const requestPayloadKey = JSON.stringify(payload);
          let timeoutId;
          let response;
          try {
            response = await Promise.race([
              client.rpc('record_learning_session', payload),
              new Promise((_resolve, reject) => {
                timeoutId = window.setTimeout(() => reject(new Error('SESSION_SYNC_TIMEOUT')), 30000);
              })
            ]);
          } finally {
            if (typeof window.clearTimeout === 'function') window.clearTimeout(timeoutId);
          }
          if (response?.error) throw response.error;
          const receipt = response?.data;
          if (!receipt || !['committed', 'already_committed'].includes(receipt.status)
            || receipt.session_id !== payload.p_session_id
            || typeof receipt.history_id !== 'string' || !receipt.history_id.trim()) {
            throw new Error('SESSION_SYNC_RECEIPT_MISMATCH');
          }
          outcomes.set(job.id, { original, requestPayloadKey, receipt, acknowledged: true });
          synced += 1;
        } catch (error) {
          outcomes.set(job?.id, { original, update: {
            attempts: Number(job?.attempts || 0) + 1,
            lastError: error && error.message ? error.message : String(error || 'sync failed'),
            lastTriedAt: new Date().toISOString()
          } });
        }
      }
      // Another tab or a completion event can append while RPCs are in flight.
      // Apply acknowledgements only to unchanged jobs in the latest queue.
      const remaining = readAllSyncQueue().flatMap((job) => {
        const outcome = outcomes.get(job?.id);
        if (!outcome || outcome.original !== syncJobPayloadKey(job)) return [job];
        if (outcome.acknowledged) {
          if (!preserveLocalRemoteReceipt(job, outcome)) return [Object.assign({}, job, { lastError: 'SESSION_SYNC_LOCAL_ACK_WRITE_FAILED' })];
          if (!secureStore()?.removeExact(QUEUE_NAMESPACE, job.__secureSnapshot, currentQueueOwner())) return [job];
          return [];
        }
        return [Object.assign({}, job, outcome.update)];
      });
      writeSyncQueue(remaining);
      return { synced, pending: remaining.length };
    }).catch((error) => {
      return { error };
    }).finally(() => {
      syncInFlight = null;
    });
    return syncInFlight;
  }

  function preserveLocalRemoteReceipt(job, outcome) {
    const records = readRecords();
    const matches = [];
    records.forEach((record, index) => {
      if (!record || record.id !== job.id) return;
      try {
        const localPayload = buildSyncRpcPayload({ id: record.id, createdAt: job.createdAt, history: record.history, cardlabAttempt: record.cardlabAttempt });
        if (JSON.stringify(localPayload) === outcome.requestPayloadKey && localPayload.p_session_id === outcome.receipt.session_id) matches.push(index);
      } catch (_error) {}
    });
    // Evicted or ambiguous legacy records cannot be linked by session guesses.
    if (matches.length !== 1) return true;
    const index = matches[0];
    const record = records[index];
    if (record.remotePayloadVerified === true && record.remoteHistoryId && record.remoteHistoryId !== outcome.receipt.history_id) return true;
    records[index] = Object.assign({}, record, {
      remoteHistoryId: outcome.receipt.history_id,
      remoteSessionId: outcome.receipt.session_id,
      remoteSyncStatus: outcome.receipt.status,
      remotePayloadVerified: true
    });
    writeRecords(records);
    return true;
  }

  function syncJobPayloadKey(job) {
    return JSON.stringify([job?.id, job?.history, job?.cardlabAttempt]);
  }

  function buildSyncRpcPayload(job) {
    if (!job || !String(job.id || '').trim()) throw new Error('SESSION_SYNC_JOB_ID_MISSING');
    const history = parseMaybeJson(job.history, null);
    if (!history) throw new Error('SESSION_SYNC_HISTORY_MISSING');
    const details = parseMaybeJson(history.details, {});
    if (details.session_id && details.sessionId && String(details.session_id).trim() !== String(details.sessionId).trim()) throw new Error('SESSION_SYNC_SESSION_ID_MISMATCH');
    const sessionId = String(details.session_id || details.sessionId || '').trim();
    if (!sessionId) throw new Error('SESSION_SYNC_SESSION_ID_MISSING');
    const eventTime = history.event_datetime || history.eventDatetime || job.createdAt;
    if (!eventTime) throw new Error('SESSION_SYNC_COMPLETION_TIME_MISSING');
    const normalized = buildRemoteHistoryRow(Object.assign({}, history, { event_datetime: eventTime }));
    if (!normalized.teacher_id || !normalized.client_id || normalized.client_id === 'local-client') throw new Error('SESSION_SYNC_OWNER_MISSING');
    const attemptSource = parseMaybeJson(job.cardlabAttempt, null);
    if (job.cardlabAttempt != null && !attemptSource) throw new Error('SESSION_SYNC_ATTEMPT_INVALID');
    const attempt = attemptSource ? buildRemoteCardlabAttemptRow(attemptSource) : null;
    if (attemptSource && !attempt) throw new Error('SESSION_SYNC_ATTEMPT_INVALID');
    if (attempt && (attempt.teacher_id !== normalized.teacher_id || attempt.client_id !== normalized.client_id)) throw new Error('SESSION_SYNC_OWNER_MISMATCH');
    if (attempt) {
      attempt.stage_order = safeNumber(attemptSource.stage_order ?? attemptSource.stageOrder, 0);
      attempt.wrong_asset_ids = attemptSource.wrong_asset_ids || attemptSource.wrongAssetIds || [];
      attempt.completed_at = String(attemptSource.completed_at || attemptSource.completedAt || eventTime);
    }
    return { p_session_id: sessionId, p_history: normalized, p_cardlab_attempt: attempt };
  }

  function safeNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function observedNumber(value) {
    if (typeof value !== 'number' && !(typeof value === 'string' && value.trim() !== '')) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
  }

  function firstObservedNumber(values) {
    for (const value of values) {
      const numeric = observedNumber(value);
      if (numeric !== null) return numeric;
    }
    return null;
  }

  function normalizeRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) return [];
    return recommendations.map(function (item) {
      if (typeof item === 'string') return item.trim();
      if (!item || typeof item !== 'object') return '';
      const title = String(item.title || '').trim();
      const desc = String(item.desc || item.description || item.text || '').trim();
      return [title, desc].filter(Boolean).join(': ');
    }).filter(Boolean);
  }

  function buildCardlabDualModeFields(payload, fallback) {
    const safePayload = payload && typeof payload === 'object' ? payload : {};
    const safeFallback = fallback && typeof fallback === 'object' ? fallback : {};
    const correctCount = Math.max(0, safeNumber(safePayload.correctCount, safeFallback.correctCount || 0));
    const totalQuestions = Math.max(0, safeNumber(safePayload.totalQuestions, safeFallback.totalQuestions || 0));
    const score = Math.max(0, Math.min(100, Math.round(safeNumber(safePayload.accuracyScore || safePayload.score, totalQuestions ? (correctCount / Math.max(totalQuestions, 1)) * 100 : 0))));
    const stageTitle = String(safePayload.stageTitle || safePayload.title || safeFallback.stageTitle || '').trim();
    const labTitle = String(safePayload.labTitle || safePayload.title || safeFallback.labTitle || 'CardLab 학습').trim() || 'CardLab 학습';
    const focusLabel = String(safePayload.focusLabel || stageTitle || labTitle).trim() || labTitle;
    const guardianSummary = `이번 카드 활동에서는 ${focusLabel} 과제의 참여 흐름과 정답 반응이 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.`;
    const teacherReviewNote = `CardLab 결과는 어휘 이해, 시각 단서 처리, 선택 정확도를 함께 보는 참고 기록입니다. 다음 카드 묶음과 난이도는 담당 선생님이 내담자의 반응, 컨디션, 수업 목표를 함께 확인해 조정합니다.`;
    const actionPlanSummary = '다음 카드 활동은 자동 확정하지 않고 선생님 검토 후 조정합니다.';
    return {
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      actionPlanPolicy: 'teacher-review-required',
      reportDisplayModes: {
        guardian: {
          label: '보호자 공유',
          summary: guardianSummary
        },
        teacher: {
          label: '전문가 분석',
          summary: teacherReviewNote
        }
      }
    };
  }

  function buildRehabDualModeFields(payload, fallback) {
    const safePayload = payload && typeof payload === 'object' ? payload : {};
    const safeFallback = fallback && typeof fallback === 'object' ? fallback : {};
    const score = Math.max(0, Math.min(100, Math.round(safeNumber(safePayload.score || safePayload.accuracyScore, 0))));
    const stageTitle = String(safePayload.stageTitle || safePayload.title || safeFallback.stageTitle || '').trim();
    const labTitle = String(safePayload.labTitle || safePayload.title || safeFallback.labTitle || 'RehabLab 학습').trim() || 'RehabLab 학습';
    const focusLabel = String(safePayload.focusLabel || stageTitle || labTitle).trim() || labTitle;
    const guardianSummary = `이번 재활 활동에서는 ${focusLabel} 과제의 참여 흐름과 반응 양상이 기록되었습니다. 보호자 공유 화면에서는 부담이 큰 세부 수치보다 관찰 요약만 간단히 확인합니다.`;
    const teacherReviewNote = `RehabLab 결과는 반응 정확도, 반응 속도, 오류 패턴, 자기조절 흐름을 함께 보는 전문 참고 기록입니다. 다음 활동과 난이도는 담당 선생님이 내담자의 컨디션과 수업 맥락을 함께 확인해 조정합니다.`;
    const actionPlanSummary = '다음 재활 활동은 자동 확정하지 않고 선생님 검토 후 조정합니다.';
    return {
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      actionPlanPolicy: 'teacher-review-required',
      reportDisplayModes: {
        guardian: {
          label: '보호자 공유',
          summary: guardianSummary
        },
        teacher: {
          label: '전문가 분석',
          summary: teacherReviewNote
        }
      }
    };
  }

  function buildHistoryRow(payload, context, completedAt, startedAt, durationSeconds) {
    const totalQuestions = safeNumber(payload.totalQuestions, 0);
    const correctCount = safeNumber(payload.correctCount, 0);
    const wrongCount = safeNumber(payload.wrongCount, Math.max(0, totalQuestions - correctCount));
    const score = Math.max(0, Math.min(100, Math.round(safeNumber(payload.score, totalQuestions ? (correctCount / totalQuestions) * 100 : 0))));
    const explicitAccuracy = observedNumber(payload.accuracyScore);
    const observedCorrect = observedNumber(payload.correctCount);
    const observedTotal = observedNumber(payload.totalQuestions);
    const accuracyScore = explicitAccuracy !== null
      ? Math.max(0, Math.min(100, Math.round(explicitAccuracy)))
      : observedCorrect !== null && observedTotal !== null && observedTotal > 0
        ? Math.max(0, Math.min(100, Math.round(observedCorrect / observedTotal * 100)))
        : null;
    const contextKind = String(context.kind || '').trim().toLowerCase();
    const payloadKind = String(payload.labKind || '').trim().toLowerCase();
    const reportScope = String(contextKind || payload.reportScope || payload.labScope || (payloadKind === 'playlab' ? 'playlab' : 'rehab')).trim();
    const effectiveLabKind = contextKind || payloadKind;
    const stageTitle = String(payload.stageTitle || payload.title || '').trim();
    const rawLabTitle = String(payload.labTitle || payload.title || '학습').trim();
    const labTitle = reportScope === 'rehab'
      ? rawLabTitle.replace(/^PlayLab\s*/i, '재활랩 ').replace(/^RehabLab\s*/i, '재활랩 ').trim()
      : rawLabTitle;
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
    const explicitElapsed = firstObservedNumber([payload.details?.elapsed_ms, payload.details?.elapsedMs, payload.reportInput?.elapsedMs, payload.reportInput?.elapsed_ms]);
    const explicitSeconds = firstObservedNumber([payload.details?.duration_seconds, payload.details?.durationSeconds, payload.durationSeconds]);
    const explicitMinutes = firstObservedNumber([payload.details?.duration_minutes, payload.details?.durationMinutes]);
    const hasObservedStart = observedNumber(payload.startedAtMs) !== null;
    const measuredSeconds = explicitElapsed !== null ? explicitElapsed / 1000 : (explicitSeconds ?? (hasObservedStart ? observedNumber(durationSeconds) : null));
    const durationSource = explicitElapsed !== null ? 'producer-elapsed-ms' : explicitSeconds !== null ? 'producer-duration-seconds' : hasObservedStart ? 'session-clock-elapsed' : explicitMinutes !== null ? 'producer-minute-value' : 'unavailable';
    const sessionId = String(
      payload.sessionId ||
      payload.session_id ||
      payload.details?.session_id ||
      context.launchKey ||
      [context.clientId || payload.clientId || 'local-client', payload.curriculumKey || payload.stageKey || payload.reportType || labTitle, startedAt].join(':')
    ).trim();
    const cardlabDualModeFields = String(effectiveLabKind || payload.labKind || '').trim() === 'cardlab'
      ? buildCardlabDualModeFields(payload, {
        totalQuestions,
        correctCount,
        stageTitle,
        labTitle
      })
      : null;
    const rehabDualModeFields = reportScope === 'rehab' || String(effectiveLabKind || payload.labKind || '').trim() === 'rehab'
      ? buildRehabDualModeFields(payload, {
        totalQuestions,
        stageTitle,
        labTitle
      })
      : null;
    const details = Object.assign({
      schema_version: String(payload.schemaVersion || payload.schema_version || payload.details?.schema_version || '2026.1').trim() || '2026.1',
      session_id: sessionId,
      report_scope: reportScope,
      lab_scope: reportScope,
      lab_label: String(effectiveLabKind || payload.labKind || '').trim(),
      lab_title: labTitle,
      game_name: labTitle,
      report_title: stageTitle || labTitle,
      category_title: labTitle,
      stage_id: String(payload.stageKey || payload.stageId || '').trim(),
      stage_title: stageTitle,
      score,
      accuracy_score: accuracyScore,
      accuracy_source: explicitAccuracy !== null ? 'producer-provided' : accuracyScore !== null ? 'observed-answer-counts' : 'unavailable',
      correct_count: observedCorrect,
      wrong_count: observedNumber(payload.wrongCount),
      total_questions: observedTotal,
      duration_minutes: measuredSeconds === null ? explicitMinutes : measuredSeconds / 60,
      duration_seconds: measuredSeconds,
      elapsed_ms: explicitElapsed ?? (measuredSeconds === null ? null : measuredSeconds * 1000),
      duration_precision: measuredSeconds !== null ? 'reported-elapsed' : explicitMinutes !== null ? 'minute-value' : 'unavailable',
      duration_source: durationSource,
      completed_at: completedAt,
      started_at: startedAt,
      report_type: String(payload.reportType || '').trim(),
      report_input: payload.reportInput || null,
      report_brief_opinion: String(payload.briefOpinion || payload.summary || '').trim(),
      report_guardian_summary: String(payload.guardianSummary || cardlabDualModeFields?.guardianSummary || rehabDualModeFields?.guardianSummary || payload.briefOpinion || payload.summary || '').trim(),
      report_teacher_review_note: String(payload.teacherReviewNote || cardlabDualModeFields?.teacherReviewNote || rehabDualModeFields?.teacherReviewNote || '').trim(),
      report_action_plan_summary: String(payload.actionPlanSummary || cardlabDualModeFields?.actionPlanSummary || rehabDualModeFields?.actionPlanSummary || '').trim(),
      report_action_plan_policy: String(payload.actionPlanPolicy || cardlabDualModeFields?.actionPlanPolicy || rehabDualModeFields?.actionPlanPolicy || 'teacher-review-required').trim(),
      report_display_modes: payload.reportDisplayModes || cardlabDualModeFields?.reportDisplayModes || rehabDualModeFields?.reportDisplayModes || null,
      report_overview: String(payload.overview || '').trim(),
      report_recommendations: normalizeRecommendations(payload.recommendations),
      report_cognitive_score: observedNumber(payload.cognitiveScore),
      report_reaction_score: observedNumber(payload.reactionScore),
      report_focus_key: String(payload.focusKey || payload.stageKey || '').trim(),
      report_focus_label: String(payload.focusLabel || stageTitle || labTitle).trim(),
      source_page: String(window.location.pathname || '').split('/').pop()
    }, payload.details && typeof payload.details === 'object' ? payload.details : {});
    details.report_cognitive_score = observedNumber(details.report_cognitive_score);
    details.report_reaction_score = observedNumber(details.report_reaction_score);
    details.report_metric_provenance = Object.assign({}, details.report_metric_provenance || {}, {
      cognitive: details.report_cognitive_score === null ? 'unavailable' : 'producer-provided',
      reaction: details.report_reaction_score === null ? 'unavailable' : 'producer-provided',
      duration: durationSource
    });

    return {
      id: `local-${crypto.randomUUID()}`,
      teacher_id: String(context.teacherId || payload.teacherId || '').trim(),
      teacherId: String(context.teacherId || payload.teacherId || '').trim(),
      client_id: String(context.clientId || payload.clientId || 'local-client').trim(),
      clientId: String(context.clientId || payload.clientId || 'local-client').trim(),
      client_name: String(context.clientName || payload.clientName || '').trim(),
      clientName: String(context.clientName || payload.clientName || '').trim(),
      type: String(context.clientType || payload.clientType || 'client').trim() || 'client',
      category: 'session_history',
      action: COMPLETION_ACTION,
      action_type: labTitle,
      event_datetime: completedAt,
      eventDatetime: completedAt,
      start_datetime: startedAt,
      startDatetime: startedAt,
      end_datetime: completedAt,
      endDatetime: completedAt,
      duration_minutes: durationMinutes,
      durationMinutes,
      details,
      metadata: Object.assign({
        schema_version: details.schema_version,
        session_id: details.session_id,
        report_scope: reportScope,
        lab_scope: reportScope,
        report_guardian_summary: details.report_guardian_summary,
        report_teacher_review_note: details.report_teacher_review_note,
        report_action_plan_summary: details.report_action_plan_summary,
        report_action_plan_policy: details.report_action_plan_policy,
        report_display_modes: details.report_display_modes,
        duration_minutes: details.duration_minutes,
        duration_seconds: details.duration_seconds,
        elapsed_ms: details.elapsed_ms,
        duration_precision: details.duration_precision,
        duration_source: details.duration_source,
        report_metric_provenance: details.report_metric_provenance,
        duration: `${durationMinutes} minutes`
      }, payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
      memo: stageTitle || labTitle
    };
  }

  function buildCardlabAttempt(payload, history, completedAt, durationSeconds) {
    if (String(payload.labKind || '').trim() !== 'cardlab') return null;
    // Facilitated discussion activities record participation in histories only.
    // Creating a scored attempt would incorrectly turn an open conversation into
    // a 0/100-style assessment in the integrated CardLab report.
    if (payload.skipCardlabAttempt === true || payload.scored === false) return null;
    const totalQuestions = safeNumber(payload.totalQuestions, 0);
    const correctCount = safeNumber(payload.correctCount, 0);
    const wrongCount = safeNumber(payload.wrongCount, Math.max(0, totalQuestions - correctCount));
    return {
      id: history.id,
      client_id: history.client_id,
      clientId: history.clientId,
      teacher_id: history.teacher_id,
      teacherId: history.teacherId,
      curriculum_key: String(payload.curriculumKey || payload.sourcePage || '').trim(),
      curriculumKey: String(payload.curriculumKey || payload.sourcePage || '').trim(),
      stage_key: String(payload.stageKey || payload.stageId || '').trim(),
      stageKey: String(payload.stageKey || payload.stageId || '').trim(),
      stage_title: String(payload.stageTitle || payload.title || '').trim(),
      stageTitle: String(payload.stageTitle || payload.title || '').trim(),
      completed_at: completedAt,
      completedAt,
      score: Math.max(0, Math.min(100, Math.round(safeNumber(payload.score, totalQuestions ? (correctCount / totalQuestions) * 100 : 0)))),
      correct_count: correctCount,
      correctCount,
      wrong_count: wrongCount,
      wrongCount,
      total_questions: totalQuestions,
      totalQuestions,
      duration_seconds: Math.max(0, Math.round(durationSeconds)),
      durationSeconds: Math.max(0, Math.round(durationSeconds)),
      wrong_words: Array.isArray(payload.wrongWords) ? payload.wrongWords : [],
      wrongWords: Array.isArray(payload.wrongWords) ? payload.wrongWords : [],
      question_snapshot: Array.isArray(payload.questionSnapshot) ? payload.questionSnapshot : [],
      questionSnapshot: Array.isArray(payload.questionSnapshot) ? payload.questionSnapshot : [],
      result_snapshot: Array.isArray(payload.resultSnapshot) ? payload.resultSnapshot : [],
      resultSnapshot: Array.isArray(payload.resultSnapshot) ? payload.resultSnapshot : [],
      cleared: correctCount >= totalQuestions
    };
  }

  function recordSession(payload) {
    const safePayload = payload && typeof payload === 'object' ? payload : {};
    const context = readLaunchContext() || {};
    if (context.anonymous === true) {
      return {
        id: `skipped-anonymous-${Date.now()}`,
        skipped: true,
        reason: 'anonymous-lab'
      };
    }
    const payloadKind = String(safePayload.labKind || '').trim().toLowerCase();
    const contextKind = String(context.kind || '').trim().toLowerCase();
    const requestedScope = String(contextKind || safePayload.reportScope || safePayload.labScope || '').trim().toLowerCase();
    const shouldSavePlaylab = safePayload.saveToClientReport === true || safePayload.persistToClientReport === true;
    if ((payloadKind === 'playlab' || contextKind === 'playlab' || requestedScope === 'playlab') && requestedScope !== 'rehab' && !shouldSavePlaylab) {
      return {
        id: `skipped-playlab-${Date.now()}`,
        skipped: true,
        reason: 'playlab-simple-result'
      };
    }
    const completedAt = new Date().toISOString();
    const startedAtMs = safeNumber(safePayload.startedAtMs, Date.now());
    const startedAt = new Date(startedAtMs).toISOString();
    const durationSeconds = Math.max(0, safeNumber(safePayload.durationSeconds, (Date.now() - startedAtMs) / 1000));
    const history = buildHistoryRow(safePayload, context, completedAt, startedAt, durationSeconds);
    const record = {
      id: history.id,
      labKind: String(context.kind || safePayload.labKind || '').trim(),
      clientId: history.clientId,
      teacherId: history.teacherId,
      completedAt,
      history,
      cardlabAttempt: buildCardlabAttempt(safePayload, history, completedAt, durationSeconds)
    };
    const records = readRecords();
    const sessionId = String(history?.details?.session_id || '').trim();
    const existingRecord = sessionId
      ? records.find((item) => String(item?.history?.details?.session_id || '').trim() === sessionId
        && String(item?.history?.teacher_id || '') === String(history.teacher_id || '')
        && String(item?.history?.client_id || '') === String(history.client_id || ''))
      : null;
    if (existingRecord) {
      existingRecord.pendingDurable = existingRecord.remotePayloadVerified === true || Boolean(queueSyncRecord(existingRecord));
      return existingRecord;
    }
    records.push(record);
    writeRecords(records);
    record.pendingDurable = Boolean(queueSyncRecord(record));
    try {
      window.dispatchEvent(new CustomEvent('haha-lab-learning-recorded', { detail: record }));
    } catch (_error) {}
    return record;
  }

  window.HahaLabLearningHarness = {
    storageKey: STORAGE_KEY,
    syncStorageKey: SYNC_STORAGE_KEY,
    readLaunchContext,
    readRecords,
    readSyncQueue,
    flushSyncQueue,
    queueSyncRecord,
    recordSession
  };

  if (typeof window.addEventListener === 'function') {
    window.addEventListener('hahalab-queue-key-ready', function () { void window.retryUnstoredLabCompletions?.(); });
    window.addEventListener('hahalab-session-cleared', function () { memoryRecords = memoryRecords.filter(record => record.remotePayloadVerified !== true); verifiedQueueOwner = null; secureStore()?.clear(); });
    window.addEventListener('online', function () {
      flushSyncQueue();
    });
    window.setTimeout(function () {
      flushSyncQueue();
    }, 720);
  }
})();
