#!/usr/bin/env node
// Local-only security regression harness. All database and object-store calls are mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { sanitizeGuardianSnapshot } from '../playlab/guardian-share-snapshot.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const failures = [];
const fixtureToken = `fixture.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 7200 })).toString('base64url')}.signature`;
let passed = 0;
async function test(name, run) {
  try { await run(); passed++; console.log(`[security] PASS ${name}`); }
  catch (error) { failures.push(name); console.error(`[security] FAIL ${name}: ${error.message}`); }
}

function workerFixture(profile = { id: 'teacher-a', status: 'normal', role: 'teacher' }, rejectAuth = false, activeSession = true) {
  const calls = { auth: 0, objects: [] };
  const context = vm.createContext({
    Request, Response, Headers, URL, console, Date, Set, Map, atob, crypto: globalThis.crypto,
    fetch: async (url) => {
      calls.auth++;
      if (String(url).includes('/auth/v1/user')) return Response.json(rejectAuth ? { error: 'invalid_token' } : { id: 'user-a' }, { status: rejectAuth ? 401 : 200 });
      if (String(url).includes('/rpc/security_session_active')) return Response.json(activeSession === 'error' ? { error: 'missing_function' } : activeSession, { status: activeSession === 'error' ? 404 : 200 });
      if (String(url).includes('get_my_teacher_profile')) return Response.json([profile]);
      throw new Error(`Unexpected mocked request: ${url}`);
    },
  });
  const workerSource = read(process.env.HAHALAB_WORKER_TEST_SOURCE || 'cloudflare-worker.js')
    .replace(/export\s*\{([^}]+)\};?/g, (_statement, exports) => {
      const defaultBinding = exports.match(/([\w$]+)\s+as\s+default\b/);
      return defaultBinding ? `globalThis.__worker = ${defaultBinding[1]};` : '';
    })
    .replace(/export (?=(?:async )?function |const |let )/g, '')
    .replace('export default', 'globalThis.__worker =');
  vm.runInContext(workerSource, context);
  const env = { MY_BUCKET: { get: async (key) => {
    calls.objects.push(key);
    return { body: '<!doctype html><title>fixture</title>', httpEtag: 'fixture', writeHttpMetadata: (headers) => headers.set('Content-Type', 'text/html') };
  } } };
  return { calls, request: (pathname, init = {}) => context.__worker.fetch(new Request(/^https?:\/\//.test(pathname) ? pathname : `https://thehahalab.com${pathname}`, init), env) };
}

for (const route of ['/scratch/test_login.html', '/scripts/test.mjs', '/supabase/functions/teacher-auth-manager/index.ts', '/.env', '/.git/config', '/package.json', '/cloudflare-worker.js', '/private/playlab/test.html', '/%73cratch/test_login.html', '/%2eenv', '/private%2fplaylab/test.html', '/worksheets/originals/fixture.pdf', '/cardlab/motion-cards/motions/fixture.mp4', '/worksheets%2foriginals/fixture.pdf', '/cardlab%2fmotion-cards/motions/fixture.mp4']) {
  await test(`deny source URL ${route}`, async () => {
    const fixture = workerFixture();
    const response = await fixture.request(route);
    assert.equal(response.status, 404);
    assert.equal(fixture.calls.objects.length, 0, 'sensitive path reached object store');
  });
}

await test('public HTML and JS remain available', async () => {
  const fixture = workerFixture();
  assert.equal((await fixture.request('/class-new.html')).status, 200);
  assert.equal((await fixture.request('/js/app.js')).status, 200);
});
await test('HTTP upgrades to HTTPS without authentication or object-store access', async () => {
  const fixture = workerFixture();
  const response = await fixture.request('http://thehahalab.com/class-new.html?start=calendar');
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('Location'), 'https://thehahalab.com/class-new.html?start=calendar');
  assert.equal(fixture.calls.auth, 0);
  assert.deepEqual(fixture.calls.objects, []);
});
await test('query bearer cannot open private learning', async () => {
  const fixture = workerFixture();
  assert.equal((await fixture.request('/playlab/test.html?playlabToken=fake-token')).status, 401);
  assert.equal(fixture.calls.auth, 0);
});
await test('verified bearer opens protected learning', async () => {
  const fixture = workerFixture();
  assert.equal((await fixture.request('/playlab/test.html', { headers: { Authorization: 'Bearer fixture-token' } })).status, 200);
  assert.deepEqual(fixture.calls.objects, ['private/playlab/test.html']);
  assert.ok(fixture.calls.auth >= 2);
});
for (const status of ['paused', 'suspended', 'withdrawn', 'pending', 'pending_teacher', 'deleted', 'rejected']) {
  for (const role of ['teacher', 'admin']) {
    await test(`deny ${role} status ${status}`, async () => {
      const fixture = workerFixture({ id: 'teacher-a', role, status });
      assert.equal((await fixture.request('/playlab/test.html', { headers: { Authorization: 'Bearer fixture-token' } })).status, 403);
      assert.equal(fixture.calls.objects.length, 0);
    });
  }
}
await test('missing teacher profile fails closed', async () => {
  const fixture = workerFixture(null);
  assert.equal((await fixture.request('/playlab/test.html', { headers: { Authorization: 'Bearer fixture-token' } })).status, 403);
});
await test('revoked bearer rejected by auth server', async () => {
  const fixture = workerFixture(undefined, true);
  assert.equal((await fixture.request('/playlab/test.html', { headers: { Authorization: 'Bearer revoked-token' } })).status, 401);
  assert.equal(fixture.calls.objects.length, 0);
});
await test('malformed percent cookie cannot crash guard', async () => {
  assert.equal((await workerFixture().request('/playlab/test.html', { headers: { Cookie: '__Host-hahalab_playlab_session=%E0%A4%A' } })).status, 401);
});
for (const state of [false, null, 'error']) {
  await test(`strict server session revocation denies ${String(state)}`, async () => {
    const fixture = workerFixture(undefined, false, state);
    assert.equal((await fixture.request('/playlab/test.html', { headers: { Authorization: `Bearer ${fixtureToken}` } })).status, 401);
    assert.equal(fixture.calls.objects.length, 0);
  });
}
await test('session endpoint requires bearer', async () => {
  const response = await workerFixture().request('/api/playlab-session', { method: 'POST', headers: { Origin: 'https://thehahalab.com' } });
  assert.equal(response.status, 401);
});
await test('session cookie is HttpOnly Secure SameSite and usable', async () => {
  const fixture = workerFixture();
  const response = await fixture.request('/api/playlab-session', { method: 'POST', headers: { Authorization: `Bearer ${fixtureToken}`, Origin: 'https://thehahalab.com' } });
  assert.ok(response.ok, `session POST status ${response.status}`);
  const cookie = response.headers.getSetCookie().find((value) => value.startsWith('__Host-hahalab_playlab_session=')) || '';
  for (const flag of [/HttpOnly/i, /Secure/i, /SameSite=(Strict|Lax)/i, /Path=\//i]) assert.match(cookie, flag);
  assert.ok(Number(cookie.match(/Max-Age=(\d+)/i)?.[1]) <= 3600, 'cookie exceeds one-hour cap');
  const tokenCookie = cookie.split(';')[0];
  assert.equal((await fixture.request('/playlab/test.html', { headers: { Cookie: tokenCookie } })).status, 200);
});
for (const method of ['POST', 'DELETE']) {
  await test(`cross-origin session ${method} denied`, async () => {
    const fixture = workerFixture();
    const response = await fixture.request('/api/playlab-session', { method, headers: { Origin: 'https://attacker.invalid', Authorization: 'Bearer fixture-token' } });
    assert.equal(response.status, 403);
    assert.equal(fixture.calls.auth, 0);
    assert.equal(response.headers.get('Set-Cookie'), null);
  });
  await test(`session ${method} without Origin denied`, async () => {
    const fixture = workerFixture();
    assert.equal((await fixture.request('/api/playlab-session', { method, headers: { Authorization: 'Bearer fixture-token' } })).status, 403);
  });
}
await test('logout expires server cookie', async () => {
  const response = await workerFixture().request('/api/playlab-session', { method: 'DELETE', headers: { Origin: 'https://thehahalab.com' } });
  assert.ok(response.ok);
  assert.match(response.headers.get('Set-Cookie') || '', /Max-Age=0/i);
});
for (const route of ['/admin.html', '/class-new.html', '/class-new-mobile.html', '/playlab/test.html', '/scratch/test_login.html']) {
  await test(`security and cache headers ${route}`, async () => {
    const response = await workerFixture().request(route);
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.match(response.headers.get('Content-Security-Policy') || '', /frame-ancestors\s+('none'|'self')/i);
    assert.match(response.headers.get('Strict-Transport-Security') || '', /max-age=\d+/);
    assert.match(response.headers.get('Cache-Control') || '', /no-store/);
    assert.ok(response.headers.get('Referrer-Policy'));
  });
}

function backendFixture({ teacher = { id: 1, auth_user_id: 'user-a', teacher_id: 'teacher-a', email: 'teacher@example.test', status: 'normal' }, isAdmin = false, recoveryError = null, adminClaims = { sub: 'user-a', aal: 'aal2' }, activeSession = true, tokenSuccess = false } = {}) {
  const calls = { writes: [], recovery: [], tokenRequests: 0 };
  function query(table) {
    const chain = {};
    for (const name of ['select', 'eq', 'ilike', 'limit', 'order', 'lte']) chain[name] = () => chain;
    chain.maybeSingle = async () => ({ data: table === 'teachers' ? teacher : table === 'app_terms' ? { id: 1, content: 'fixture policy', version: '1' } : null, error: null });
    for (const method of ['insert', 'update', 'upsert', 'delete']) chain[method] = (payload) => {
      calls.writes.push({ table, method, payload });
      return Object.assign(chain, { then: (resolve) => resolve({ data: null, error: null }) });
    };
    return chain;
  }
  let handler;
  const client = { from: query, rpc: async (name) => ({ data: name === 'security_session_active' ? activeSession : isAdmin, error: activeSession === 'error' && name === 'security_session_active' ? { message: 'rpc unavailable' } : null }), auth: {
    getUser: async () => ({ data: { user: { id: 'user-a', email: 'teacher@example.test' } }, error: null }),
    resetPasswordForEmail: async (email, options) => { calls.recovery.push({ email, options }); return { error: recoveryError }; },
    admin: new Proxy({}, { get: (_, method) => async (...args) => { calls.writes.push({ method, args }); return { data: {}, error: null }; } }),
  } };
  const source = stripTypeScriptTypes(read('supabase/functions/teacher-auth-manager/index.ts').replace(/^import[^\n]+\n/, ''), { mode: 'transform' });
  const context = vm.createContext({ Request, Response, Headers, URL, TextEncoder, Uint8Array, Date, atob, crypto: globalThis.crypto, AbortController, setTimeout, clearTimeout,
    console: { error() {}, warn() {}, log() {} }, createClient: () => client,
    fetch: async () => { calls.tokenRequests++; if (tokenSuccess) return new Response(JSON.stringify({ access_token: 'fixture-access', refresh_token: 'fixture-refresh', user: { id: 'user-a' } }), { status: 200 }); throw new Error('Unexpected token request'); },
    Deno: { env: { get: () => 'fixture-config' }, serve: (fn) => { handler = fn; } },
  });
  vm.runInContext(source, context);
  const token = `fixture.${Buffer.from(JSON.stringify(adminClaims)).toString('base64url')}.signature`;
  return { calls, request: (payload, authenticated = true) => handler(new Request('https://fixture.invalid/teacher-auth-manager', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })) };
}
for (const action of ['create_user', 'validate_signup']) {
  await test(`anonymous ${action} blocked before write`, async () => {
    const fixture = backendFixture();
    assert.equal((await fixture.request({ action }, false)).status, 401);
    assert.deepEqual(fixture.calls.writes, []);
  });
  await test(`ordinary teacher ${action} blocked`, async () => {
    const fixture = backendFixture();
    assert.equal((await fixture.request({ action })).status, 403);
    assert.deepEqual(fixture.calls.writes, []);
  });
}
for (const override of [{ teacherId: 'teacher-b' }, { email: 'other@example.test' }]) {
  await test(`terms ownership mismatch ${Object.keys(override)[0]}`, async () => {
    const fixture = backendFixture();
    const response = await fixture.request({ action: 'save_terms_agreement', ...override });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error, 'OWNER_MISMATCH');
    assert.deepEqual(fixture.calls.writes, []);
  });
}
await test('own terms record uses authenticated identity', async () => {
  const fixture = backendFixture();
  assert.equal((await fixture.request({ action: 'save_terms_agreement' })).status, 200);
  assert.equal(fixture.calls.writes.length, 1);
  assert.equal(fixture.calls.writes[0].payload[0].teacher_id, 'teacher-a');
  assert.equal(fixture.calls.writes[0].payload[0].email, 'teacher@example.test');
});
for (const activeSession of [false, null, 'error']) {
  await test(`backend stale session denies writes ${String(activeSession)}`, async () => {
    for (const action of ['create_user', 'save_terms_agreement', 'withdraw_account']) {
      const fixture = backendFixture({ activeSession, isAdmin: true });
      const response = await fixture.request({ action });
      assert.equal(response.status, 401, action);
      assert.deepEqual(fixture.calls.writes, [], action);
    }
  });
}
for (const claims of [{ sub: 'user-a', aal: 'aal1' }, { sub: 'other-user', aal: 'aal2' }, {}]) {
  await test(`admin MFA claims rejected ${JSON.stringify(claims)}`, async () => {
    const fixture = backendFixture({ isAdmin: true, adminClaims: claims });
    const response = await fixture.request({ action: 'create_user' });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error, 'MFA_REQUIRED');
    assert.deepEqual(fixture.calls.writes, []);
  });
}
await test('verified MFA administrator reaches provisioning validation', async () => {
  const fixture = backendFixture({ isAdmin: true });
  const response = await fixture.request({ action: 'create_user' });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'REQUIRED_FIELDS_MISSING');
});
for (const status of ['paused', 'suspended', 'withdrawn', 'deleted', 'request', 'unknown']) {
  await test(`blocked ${status} cannot sign in, provision users or record agreement`, async () => {
    for (const action of ['sign_in_teacher', 'create_user', 'save_terms_agreement']) {
      const fixture = backendFixture({ isAdmin: true, teacher: { id: 1, auth_user_id: 'user-a', teacher_id: 'teacher-a', email: 'teacher@example.test', status } });
      const response = await fixture.request({ action, teacherId: 'teacher-a', password: 'fixture-password' });
      assert.equal(response.status, 403, action);
      assert.equal(fixture.calls.tokenRequests, 0);
      assert.deepEqual(fixture.calls.writes, []);
    }
  });
}
for (const status of ['pending', 'pending_teacher']) {
  await test(`pending account ${status} signs in and records only own terms, cannot administer`, async () => {
    const fixture = backendFixture({ isAdmin: true, tokenSuccess: true, teacher: { id: 1, auth_user_id: 'user-a', teacher_id: 'teacher-a', email: 'teacher@example.test', status } });
    const login = await fixture.request({ action: 'sign_in_teacher', teacherId: 'teacher-a', password: 'fixture-password' }, false);
    assert.equal(login.status, 200);
    assert.equal(fixture.calls.tokenRequests, 1);
    assert.equal((await fixture.request({ action: 'save_terms_agreement' })).status, 200);
    assert.equal(fixture.calls.writes.length, 1);
    assert.equal(fixture.calls.writes[0].payload[0].teacher_id, 'teacher-a');
    assert.equal((await fixture.request({ action: 'create_user' })).status, 403);
    assert.equal(fixture.calls.writes.length, 1);
    assert.equal((await fixture.request({ action: 'save_terms_agreement', teacherId: 'other' })).status, 403);
    assert.equal(fixture.calls.writes.length, 1);
  });
}
await test('withdrawn timestamp denies normal-status login and terms before token or write', async () => {
  const fixture = backendFixture({ tokenSuccess: true, teacher: { id: 1, auth_user_id: 'user-a', teacher_id: 'teacher-a', email: 'teacher@example.test', status: 'normal', withdrawn_at: '2026-01-01T00:00:00Z' } });
  for (const action of ['sign_in_teacher', 'save_terms_agreement']) assert.equal((await fixture.request({ action, teacherId: 'teacher-a', password: 'fixture-password' })).status, 403);
  assert.equal(fixture.calls.tokenRequests, 0);
  assert.deepEqual(fixture.calls.writes, []);
});
await test('reset sends recovery link and never changes existing password', async () => {
  const fixture = backendFixture();
  const response = await fixture.request({ action: 'request_password_reset', email: 'teacher@example.test', name: '테스트', contact: '010-1234-5678' }, false);
  assert.equal(response.status, 200);
  assert.equal(fixture.calls.recovery.length, 1);
  assert.deepEqual(fixture.calls.writes, []);
});
await test('reset hides account absence and delivery error', async () => {
  const payload = { action: 'request_password_reset', email: 'teacher@example.test', name: '테스트', contact: '010-1234-5678' };
  const absent = await backendFixture({ teacher: null }).request(payload, false);
  const failed = await backendFixture({ recoveryError: { code: 'EMAIL_FAILED' } }).request(payload, false);
  assert.deepEqual(await absent.json(), await failed.json());
  assert.equal(absent.status, 200);
  assert.equal(failed.status, 200);
});

function reportShareFixture({ activeSession = true, ownerStatus = 'normal', otherOwner = false, clientOwner = 'teacher-a', historyOwner = 'teacher-a', expired = false } = {}) {
  const token = 'a'.repeat(43);
  const tokenDigest = createHash('sha256').update(token).digest('hex');
  const calls = { reads: [], writes: [] };
  const storedSnapshot = { entry: { title: 'stored-capability-snapshot' }, reportInput: { title: 'server-stored-report', totalItems: 5, correctCount: 0 }, privateRecord: 'FORBIDDEN_PRIVATE' };
  const tables = {
    teachers: [{ id: 1, auth_user_id: 'user-a', teacher_id: 'teacher-a', status: ownerStatus }],
    clients: [{ id: 'client-a', teacher_id: clientOwner }],
    histories: [{ id: 'history-a', client_id: 'client-a', teacher_id: historyOwner, details: { report_input: { title: 'server-stored-report' } } }],
    report_share_links: [{ id: 'link-a', token_digest: tokenDigest, owner_user_id: otherOwner ? 'user-b' : 'user-a', snapshot: storedSnapshot, expires_at: new Date(Date.now() + (expired ? -60000 : 60000)).toISOString(), revoked_at: null, audience_scope: 'guardian', access_count: 0 }],
  };
  function query(table) {
    const filters = [];
    let mutation = null;
    const chain = { select: () => chain, limit: () => chain, eq: (key, value) => { filters.push([key, value]); return chain; } };
    const result = () => {
      if (mutation) return { data: mutation.method === 'insert' ? { id: 'link-new' } : null, error: null };
      calls.reads.push({ table, filters: [...filters] });
      return { data: (tables[table] || []).find((row) => filters.every(([key, value]) => row[key] === value)) || null, error: null };
    };
    chain.maybeSingle = async () => result();
    chain.single = async () => result();
    for (const method of ['insert', 'update', 'delete']) chain[method] = (payload) => {
      mutation = { table, method, payload, filters };
      calls.writes.push(mutation);
      return chain;
    };
    chain.then = (resolve, reject) => Promise.resolve(result()).then(resolve, reject);
    return chain;
  }
  let handler;
  const client = { from: query,
    rpc: async () => ({ data: activeSession, error: activeSession === 'error' ? { message: 'missing RPC' } : null }),
    auth: { getUser: async () => ({ data: { user: { id: 'user-a' } }, error: null }) },
  };
  const source = stripTypeScriptTypes(read('supabase/functions/report-share/index.ts').replace(/^import[^\n]+\n/gm, ''), { mode: 'transform' });
  const context = vm.createContext({ Request, Response, Headers, URL, TextEncoder, Uint8Array, Date, crypto: globalThis.crypto, btoa,
    console: { error() {} }, sanitizeGuardianSnapshot, createClient: () => client, Deno: { env: { get: () => 'fixture-config' }, serve: (fn) => { handler = fn; } },
  });
  vm.runInContext(source, context);
  return { calls, token, tokenDigest, storedSnapshot, request: (payload, authenticated = true) => handler(new Request('https://fixture.invalid/report-share', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: 'Bearer fixture-token' } : {}) }, body: JSON.stringify(payload) })) };
}
for (const action of ['create', 'revoke']) {
  await test(`report sharing ${action} requires login`, async () => {
    const fixture = reportShareFixture();
    assert.equal((await fixture.request({ action, token: fixture.token }, false)).status, 401);
    assert.deepEqual(fixture.calls.writes, []);
  });
  for (const activeSession of [false, null, 'error']) {
    await test(`report sharing ${action} stale session ${activeSession} denies writes`, async () => {
      const fixture = reportShareFixture({ activeSession });
      assert.equal((await fixture.request({ action, token: fixture.token })).status, 401);
      assert.deepEqual(fixture.calls.writes, []);
    });
  }
}
await test('other owner cannot revoke capability', async () => {
  const fixture = reportShareFixture({ otherOwner: true });
  assert.equal((await fixture.request({ action: 'revoke', token: fixture.token })).status, 404);
  assert.deepEqual(fixture.calls.writes, []);
  assert.ok(fixture.calls.reads.some((read) => read.filters.some(([key, value]) => key === 'owner_user_id' && value === 'user-a')));
});
await test('suspended share owner cannot expose stored snapshot', async () => {
  const fixture = reportShareFixture({ ownerStatus: 'suspended' });
  const response = await fixture.request({ action: 'resolve', token: fixture.token }, false);
  assert.equal(response.status, 404);
  assert.equal(Object.hasOwn(await response.json(), 'snapshot'), false);
  assert.deepEqual(fixture.calls.writes, []);
});
await test('active share owner valid capability resolves stored snapshot', async () => {
  const fixture = reportShareFixture();
  const response = await fixture.request({ action: 'resolve', token: fixture.token }, false);
  assert.equal(response.status, 200);
  const resolved = (await response.json()).snapshot;
  assert.deepEqual(resolved, sanitizeGuardianSnapshot(fixture.storedSnapshot));
  assert.equal(JSON.stringify(resolved).includes('FORBIDDEN_PRIVATE'), false);
  assert.equal(resolved.guardianInput.correctCount, 0);
  assert.ok(fixture.calls.reads.some((read) => read.filters.some(([key, value]) => key === 'token_digest' && value === fixture.tokenDigest)));
  assert.ok(fixture.calls.writes.some((write) => write.table === 'report_share_audit' && write.payload.event_type === 'viewed'));
});
await test('expired capability returns 410 and removes only expired link', async () => {
  const fixture = reportShareFixture({ expired: true });
  const response = await fixture.request({ action: 'resolve', token: fixture.token }, false);
  assert.equal(response.status, 410);
  assert.equal(Object.hasOwn(await response.json(), 'snapshot'), false);
  const deletion = fixture.calls.writes.find((write) => write.method === 'delete');
  assert.deepEqual(deletion.filters, [['id', 'link-a']]);
});
for (const override of [{ clientOwner: 'teacher-b' }, { historyOwner: 'teacher-b' }]) {
  await test(`share creation verifies tenant of ${Object.keys(override)[0]}`, async () => {
    const fixture = reportShareFixture(override);
    const response = await fixture.request({ action: 'create', clientId: 'client-a', historyId: 'history-a' });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error, 'OWNER_MISMATCH');
    assert.deepEqual(fixture.calls.writes, []);
  });
}
await test('share creation derives snapshot from owned server history', async () => {
  const fixture = reportShareFixture();
  const response = await fixture.request({ action: 'create', clientId: 'client-a', historyId: 'history-a', snapshot: { title: 'untrusted-client-snapshot' } });
  assert.equal(response.status, 201);
  const inserted = fixture.calls.writes.find((write) => write.table === 'report_share_links' && write.method === 'insert');
  assert.equal(inserted.payload.owner_user_id, 'user-a');
  assert.equal(inserted.payload.teacher_id, 'teacher-a');
  assert.equal(inserted.payload.snapshot.guardianInput.title, 'server-stored-report');
  assert.equal(Object.hasOwn(inserted.payload.snapshot, 'reportInput'), false);
  assert.equal(JSON.stringify(inserted.payload.snapshot).includes('untrusted-client-snapshot'), false);
});

await test('logout purges caches while preserving unacknowledged owner-scoped pending data', async () => {
  const source = read('js/auth.js');
  const start = source.indexOf('function _purgeSensitiveSessionData(');
  const end = source.indexOf('\nwindow.getAuthenticatedReportOwner', start);
  assert.ok(start >= 0 && end > start);
  const storage = () => {
    const store = { removeItem(key) { delete store[key]; } };
    for (const key of ['playlab_history_report_old', 'h_evi_history_report_old', 'haha_lab_learning_harness_records_v1', 'haha_lab_direct_launch_old', 'haha_lab_current_session', 'haha_lab_session', 'haha_lab_shell_view_state', 'haha_lab_last_lab_return_url', 'keep_theme', 'haha_lab_learning_harness_sync_queue_v1', 'haha_lab_learning_harness_sync_queue_v1::pending-fixture']) store[key] = 'fixture';
    return store;
  };
  let cleared = false;
  let eventName = '';
  const window = { localStorage: storage(), sessionStorage: storage(), clearSensitiveAppState: () => { cleared = true; }, dispatchEvent: (event) => { eventName = event.type; } };
  const context = vm.createContext({ window, Event });
  vm.runInContext(`${source.slice(start, end)};_purgeSensitiveSessionData();`, context);
  for (const store of [window.localStorage, window.sessionStorage]) {
    assert.deepEqual(Object.keys(store).filter((key) => typeof store[key] !== 'function'), ['haha_lab_learning_harness_records_v1', 'keep_theme', 'haha_lab_learning_harness_sync_queue_v1', 'haha_lab_learning_harness_sync_queue_v1::pending-fixture']);
  }
  assert.equal(cleared, true);
  assert.equal(eventName, 'hahalab-session-cleared');
});

function adminSessionFixture({ session = {}, user = { id: 'user-a' }, isAdmin = true, profile = { teacher_id: 'teacher-a', status: 'normal' }, aal = 'aal2', activeSession = true } = {}) {
  const source = read('admin.html');
  const start = source.indexOf('let adminAuthGeneration = 0;');
  const end = source.indexOf('// [NEW] 2:1 Ratio Image Cropper', start);
  assert.ok(start >= 0 && end > start);
  const calls = { verifiedUser: 0, mfa: 0 };
  const context = vm.createContext({
    supabase: { auth: {
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => { calls.verifiedUser++; return { data: { user }, error: null }; },
      mfa: { getAuthenticatorAssuranceLevel: async () => { calls.mfa++; return { data: { currentLevel: aal }, error: null }; } },
    }, rpc: async (name) => {
      if (name === 'security_session_active') return { data: activeSession, error: activeSession === 'error' ? { message: 'RPC_UNAVAILABLE' } : null };
      if (name === 'is_admin_user') return { data: isAdmin, error: null };
      if (name === 'bind_current_user_to_teacher') return { data: true, error: null };
      if (name === 'get_my_teacher_profile') return { data: profile ? [profile] : [], error: null };
      throw new Error(`Unexpected administrator fixture RPC ${name}`);
    } },
    getFirstRow: (value) => Array.isArray(value) ? value[0] : value, keysToCamel: (value) => value,
  });
  vm.runInContext(`${source.slice(start, end)};globalThis.check = requireAdminSession;`, context);
  return { calls, check: context.check };
}
for (const variant of [
  { name: 'missing session', input: { session: null }, error: 'AUTH_REQUIRED' },
  { name: 'revoked user', input: { user: null }, error: 'AUTH_REQUIRED' },
  { name: 'revoked session', input: { activeSession: false }, error: 'AUTH_SESSION_REVOKED' },
  { name: 'missing session RPC result', input: { activeSession: null }, error: 'AUTH_SESSION_REVOKED' },
  { name: 'session RPC unavailable', input: { activeSession: 'error' }, error: 'RPC_UNAVAILABLE' },
  { name: 'ordinary teacher', input: { isAdmin: false }, error: 'ADMIN_ONLY' },
  { name: 'missing profile', input: { profile: null }, error: 'PROFILE_NOT_FOUND' },
  { name: 'paused administrator', input: { profile: { status: 'paused' } }, error: 'ACCOUNT_BLOCKED' },
  { name: 'aal1 administrator', input: { aal: 'aal1' }, error: 'MFA_REQUIRED' },
  { name: 'aal2 administrator', input: {}, error: null },
]) {
  await test(`actual administrator gate ${variant.name}`, async () => {
    const fixture = adminSessionFixture(variant.input);
    const result = await fixture.check();
    assert.equal(result.ok, !variant.error);
    if (variant.error) assert.equal(result.error.message, variant.error);
    if (variant.name === 'aal1 administrator') assert.equal(result.mfaRequired, true);
    if (!variant.error) { assert.equal(fixture.calls.verifiedUser, 1); assert.equal(fixture.calls.mfa, 1); }
  });
}

// Exercise the actual rich-message sanitizer in a real DOM, including browser URL parsing.
await test('rich-message sanitizer rejects encoded protocols and active HTML', async () => {
  const source = read('js/app.js');
  const start = source.indexOf('function sanitizeRichMessageHtml(');
  assert.ok(start >= 0);
  const end = source.indexOf('\nfunction ', start + 10);
  const functionSource = source.slice(start, end);
  const executablePath = process.env.CHROME_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(executablePath) ? executablePath : undefined });
  try {
    const page = await browser.newPage();
    await page.setContent('<main id="fixture"></main>');
    await page.addScriptTag({ content: functionSource });
    const result = await page.evaluate(() => {
      const attacks = ['<a href="java&#10;script:window.pwned=1">x</a>', '<a href="java\tscript:window.pwned=1">x</a>', '<a href="data:text/html,<script>window.pwned=1</script>">x</a>', '<svg><a xlink:href="javascript:window.pwned=1">x</a></svg>', '<img src=x onerror="window.pwned=1">', '<form action="javascript:window.pwned=1"><button>x</button></form>', '<iframe srcdoc="<script>parent.pwned=1</script>"></iframe>'];
      const bad = [];
      for (const attack of attacks) {
        const fixture = document.querySelector('#fixture');
        fixture.innerHTML = sanitizeRichMessageHtml(attack);
        for (const node of fixture.querySelectorAll('*')) {
          if (/^(SCRIPT|IFRAME|OBJECT|EMBED|FORM|SVG|MATH|STYLE)$/.test(node.tagName)) bad.push(node.outerHTML);
          for (const attr of node.attributes) {
            if (/^on/i.test(attr.name) || /^(srcdoc|action|formaction|xlink:href)$/i.test(attr.name)) bad.push(attr.name);
            if (/^(href|src)$/i.test(attr.name) && /^(javascript|data|vbscript):/i.test(attr.value.replace(/[\x00-\x20\x7f]/g, ''))) bad.push(attr.value);
          }
        }
      }
      const safe = sanitizeRichMessageHtml('<p>공지 <strong>강조</strong> <a href="https://thehahalab.com/help" target="_blank">도움말</a></p>');
      return { bad, safe };
    });
    assert.deepEqual(result.bad, []);
    assert.match(result.safe, /<strong>강조<\/strong>/);
    assert.match(result.safe, /https:\/\/thehahalab.com\/help/);
  } finally { await browser.close(); }
});

await test('report viewer verifies session, account, teacher and expiration before rendering', async () => {
  const executablePath = process.env.CHROME_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(executablePath) ? executablePath : undefined });
  try {
    const html = read('playlab-history-report-viewer.html').replace(/<script[^>]+src=[^>]+><\/script>/g, '');
    const reportKey = 'playlab_history_report_fixture';
    const secret = 'OWNER_ONLY_PRIVATE_RECORD';
    const jwt = (claims) => `fixture.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;
    const owner = { authUserId: 'user-a', teacherId: 'teacher-a', sessionId: 'session-a', createdAt: Date.now() };
    const goodToken = jwt({ session_id: 'session-a', exp: Math.floor(Date.now() / 1000) + 3600 });
    const variants = [
      { name: 'valid own report', visible: true },
      { name: 'logged out', token: null },
      { name: 'other user', userId: 'user-b' },
      { name: 'other teacher', teacherId: 'teacher-b' },
      { name: 'different login session', owner: { ...owner, sessionId: 'session-b' } },
      { name: 'ownerless legacy record', owner: null },
      { name: 'expired local record', owner: { ...owner, createdAt: Date.now() - 31 * 60 * 1000 } },
      { name: 'expired JWT', token: jwt({ session_id: 'session-a', exp: 1 }) },
      { name: 'blocked account', status: 'paused' },
      { name: 'server revoked token', authStatus: 401 },
      { name: 'server revoked session', activeSession: false },
      { name: 'missing server session', activeSession: null },
      { name: 'revocation RPC unavailable', sessionStatus: 404 },
    ];
    for (const variant of variants) {
      const page = await browser.newPage();
      const token = Object.hasOwn(variant, 'token') ? variant.token : goodToken;
      await page.addInitScript(({ reportKey, token, payload }) => {
        // A report now arrives from the authenticated opener's memory channel,
        // never from an at-rest localStorage snapshot. Isolate transport here;
        // native cross-window channel behavior has its own remediation harness.
        window.BroadcastChannel = class {
          constructor(name) { this.name = name; }
          postMessage(request) { queueMicrotask(() => this.onmessage?.({ data: { type: 'report-payload', requestId: request.requestId, source: payload } })); }
          close() {}
        };
        if (token) localStorage.setItem('sb-gxungzlecmibgvykoiib-auth-token', JSON.stringify({ access_token: token }));
      }, { reportKey, token, payload: { owner: Object.hasOwn(variant, 'owner') ? variant.owner : owner, rawRecord: { title: secret }, entry: {} } });
      await page.route('**/*', async (route) => {
        const url = route.request().url();
        if (new URL(url).pathname.endsWith('/playlab/guardian-share-snapshot.js')) return route.fulfill({ contentType: 'application/javascript', body: read('playlab/guardian-share-snapshot.js') });
        if (url.startsWith('http://security-harness.invalid/')) return route.fulfill({ contentType: 'text/html', body: html });
        if (url.includes('/auth/v1/user')) return route.fulfill({ status: variant.authStatus || 200, json: { id: variant.userId || 'user-a' } });
        if (url.includes('security_session_active')) return route.fulfill({ status: variant.sessionStatus || 200, json: Object.hasOwn(variant, 'activeSession') ? variant.activeSession : true });
        if (url.includes('get_my_teacher_profile')) return route.fulfill({ json: [{ teacher_id: variant.teacherId || 'teacher-a', status: variant.status || 'normal' }] });
        return route.abort();
      });
      await page.goto(`http://security-harness.invalid/report?reportKey=${reportKey}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => !document.querySelector('#viewerBody').textContent.includes('로그인 권한을 확인하고 있습니다.'));
      const text = await page.locator('#viewerBody').innerText();
      assert.equal(text.includes(secret), Boolean(variant.visible), variant.name);
      if (!variant.visible) assert.equal(await page.locator('#viewerShareButton').isDisabled(), true, variant.name);
      if (variant.visible) {
        await page.evaluate(() => {
          localStorage.removeItem('sb-gxungzlecmibgvykoiib-auth-token');
          window.dispatchEvent(new StorageEvent('storage', { key: 'sb-gxungzlecmibgvykoiib-auth-token' }));
        });
        await page.waitForFunction((secret) => !document.querySelector('#viewerBody').textContent.includes(secret), secret);
        assert.equal(await page.locator('#viewerShareButton').isDisabled(), true, 'logout disables sharing');
      }
      await page.close();
    }
  } finally { await browser.close(); }
});

await test('administrator sanitizer unwraps recursively and sandbox prevents parent access', async () => {
  const executablePath = process.env.CHROME_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(executablePath) ? executablePath : undefined });
  try {
    const page = await browser.newPage();
    await page.route('**/*', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>security fixture</title>' }));
    await page.goto('http://security-harness.invalid/admin');
    const source = read('admin.html');
    const start = source.indexOf('const escapeHtml = (value) =>');
    const end = source.indexOf('const sanitizeNoticeHtml =', start);
    assert.ok(start >= 0 && end > start);
    await page.addScriptTag({ content: `${source.slice(start, end)};window.adminSanitize = sanitizeRichHtml;` });
    const result = await page.evaluate(async () => {
      const html = window.adminSanitize('<unknown><p onclick="parent.escaped=1"><a href="java&#10;script:parent.escaped=1">bad</a><strong>safe</strong></p></unknown>', { allowIframes: false });
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const bad = [...doc.querySelectorAll('*')].flatMap((node) => [...node.attributes].filter((attr) => /^on/i.test(attr.name) || /^(javascript|data):/i.test(attr.value.replace(/[\x00-\x20]/g, ''))).map((attr) => attr.name));
      const embed = window.adminSanitize('<iframe src="https://example.test/"></iframe>');
      const template = document.createElement('template');
      template.innerHTML = embed;
      const sandbox = template.content.querySelector('iframe')?.getAttribute('sandbox');
      window.escaped = false;
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', sandbox);
      iframe.srcdoc = '<script>try { parent.escaped=true; } catch(e) { parent.postMessage("sandbox-blocked", "*"); }<\/script>';
      const blocked = new Promise((resolve) => window.addEventListener('message', (event) => { if (event.data === 'sandbox-blocked') resolve(true); }, { once: true }));
      document.body.appendChild(iframe);
      await blocked;
      return { bad, html, sandbox, escaped: window.escaped };
    });
    assert.deepEqual(result.bad, []);
    assert.match(result.html, /<strong>safe<\/strong>/);
    assert.equal(result.escaped, false);
    assert.ok(result.sandbox.includes('allow-scripts'));
    assert.equal(result.sandbox.includes('allow-same-origin'), false);
    const previews = [...source.matchAll(/<iframe\b[\s\S]*?\/>/g)].map((match) => match[0]).filter((tag) => tag.includes('srcDoc='));
    assert.ok(previews.length >= 2);
    for (const tag of previews) {
      const sandbox = tag.match(/sandbox="([^"]*)"/)?.[1];
      assert.notEqual(sandbox, undefined, 'srcDoc preview missing sandbox');
      assert.equal(sandbox.includes('allow-same-origin'), false);
    }
  } finally { await browser.close(); }
});

await test('mobile logout clears private DOM and rejects delayed account responses', async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  try {
    const page = await browser.newPage();
    await page.setContent('<body class="auth-logged-in"><main id="mobileShell"><div id="mobilePeopleList">SYNTHETIC PRIVATE</div><div id="mobileReportPanel">SYNTHETIC REPORT</div><input value="SYNTHETIC CONTACT"></main><div id="mobileSheetBackdrop"></div><div class="mobile-sheet"><input value="SYNTHETIC NAME"></div></body>');
    await page.addScriptTag({ content: read('js/mobile-app.js') });
    const result = await page.evaluate(async () => {
      let release;
      const pending = new Promise((resolve) => { release = resolve; });
      const query = new Proxy({}, { get: (_, key) => key === 'then' ? pending.then.bind(pending) : () => query });
      window.currentProfile = { teacherId: 'teacher-a' };
      window.supabaseClient = { from: () => query };
      const loading = window.loadAppData();
      window.currentProfile = null;
      window.clearSensitiveAppState();
      release({ data: [{ id: 'fixture-client', name: 'SYNTHETIC LATE RESPONSE' }], error: null });
      await loading;
      return { privateMarkupGone: !document.body.textContent.includes('SYNTHETIC'), fieldsEmpty: [...document.querySelectorAll('input')].every((input) => input.value === ''), loggedOut: document.body.classList.contains('auth-logged-out') };
    });
    assert.equal(result.privateMarkupGone, true);
    assert.equal(result.fieldsEmpty, true);
    assert.equal(result.loggedOut, true);
  } finally { await browser.close(); }
});

function applicationProfileFixture({ activeSession = true, authSession = activeSession, unlinkedTeacher = false, switchDuringBootstrap = false, switchDuringBinding = false } = {}) {
  const source = read('js/auth.js');
  const profileSource = source.slice(source.indexOf('function _applyResolvedProfile('), source.indexOf('function _addDaysToIso('));
  const sessionSource = source.slice(source.indexOf('async function _isCurrentAuthSessionActive('), source.indexOf('// ─── 초기화'));
  const resolveSource = source.slice(source.indexOf('async function _resolveTeacherProfile('), source.indexOf('async function _fallbackProfileQuery('));
  const calls = { signedOut: 0, cleared: 0, persisted: 0, bound: 0, queried: 0, loaded: 0, fallback: 0, rejected: 0, rpcOrder: [] };
  let linked = !unlinkedTeacher;
  const storage = new Map();
  const token = `fixture.${Buffer.from(JSON.stringify({ session_id: 'session-a' })).toString('base64url')}.signature`;
  const context = vm.createContext({
    console, atob, Date, _intentionalLogout: false,
    TEACHER_SAFE_COLUMNS: 'id,teacher_id,auth_user_id,status',
    _currentSession: { user: { id: 'user-a' }, access_token: token },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    window: { location: { reload() {} }, bootAppShell() {} },
    _supabase: {
      auth: { signOut: async () => { calls.signedOut++; } },
      rpc: async name => {
        calls.rpcOrder.push(name);
        if (name === 'security_auth_session_active') {
          if (switchDuringBootstrap) context._currentSession = { user: { id: 'user-b' } };
          return { data: authSession, error: authSession === 'error' ? { message: 'missing bootstrap RPC' } : null };
        }
        if (name === 'security_session_active') return { data: linked ? activeSession : false, error: activeSession === 'error' ? { message: 'missing RPC' } : null };
        if (name === 'bind_current_user_to_teacher') { calls.bound++; linked = true; if (switchDuringBinding) context._currentSession = { user: { id: 'user-b' } }; return { data: true, error: null }; }
        if (name === 'get_my_teacher_profile') { calls.queried++; return { data: [{ id: 'teacher-a', teacherId: 'teacher-a', auth_user_id: 'user-a', status: 'pending_teacher' }], error: null }; }
        throw new Error(`Unexpected profile fixture RPC ${name}`);
      }
    },
    _clearAuth: () => { calls.cleared++; }, _showAuthError() {}, _purgeSensitiveSessionData() {},
    _persistTeacherSession: profile => { calls.persisted++; return { ...profile, teacherId: profile.teacherId || profile.teacher_id }; },
    _syncProtectedPlaylabCookie() {}, _updateGnbProfile() {}, _setAuthView() {}, _hideLoginOverlay() {},
    _resolveAdminUserFlag: async () => false, _updateLastSeen: async () => {},
    _fallbackProfileQuery: async () => { calls.fallback++; },
    loadAppData: () => { calls.loaded++; }, SIGNUP_ACCEPTANCE_ENABLED: false,
    _rejectUnregisteredSignup: async () => { calls.rejected++; }
  });
  vm.runInContext(`${profileSource}\n${sessionSource}\n${resolveSource}\nglobalThis.apply = _applyResolvedProfile;globalThis.resolve = _resolveTeacherProfile;`, context);
  return { calls, context, apply: profile => context.apply(profile, { id: 'user-a' }), resolve: () => context.resolve({ id: 'user-a' }) };
}

for (const status of ['active', 'normal', 'pending', 'pending_teacher']) {
  await test(`application shell accepts supported teacher status ${status}`, async () => {
    const fixture = applicationProfileFixture();
    fixture.apply({ id: 'teacher-a', teacher_id: 'teacher-a', auth_user_id: 'user-a', status });
    assert.equal(fixture.calls.persisted, 1);
    assert.equal(fixture.calls.signedOut, 0);
    assert.equal(fixture.context.window.currentProfile.status, status);
  });
}
for (const status of ['paused', 'suspended', 'withdrawn', 'deleted', 'rejected', '', 'unknown']) {
  await test(`application shell rejects unsupported teacher status ${status || '(empty)'}`, async () => {
    const fixture = applicationProfileFixture();
    assert.throws(() => fixture.apply({ id: 'teacher-a', auth_user_id: 'user-a', status }), /TEACHER_ACCOUNT_INACTIVE/);
    assert.equal(fixture.calls.persisted, 0);
    assert.equal(fixture.calls.signedOut, 1);
  });
}
await test('application shell rejects withdrawn date even with allowed status', async () => {
  const fixture = applicationProfileFixture();
  assert.throws(() => fixture.apply({ id: 'teacher-a', auth_user_id: 'user-a', status: 'normal', withdrawn_at: '2026-01-01' }), /TEACHER_ACCOUNT_INACTIVE/);
  assert.equal(fixture.calls.persisted, 0);
});
await test('application profile cannot cross authenticated user identity', async () => {
  const fixture = applicationProfileFixture();
  assert.throws(() => fixture.apply({ id: 'teacher-b', auth_user_id: 'user-b', status: 'active' }), /AUTH_PROFILE_MISMATCH/);
  assert.equal(fixture.calls.persisted, 0);
});
for (const activeSession of [false, null, 'error', 'true']) {
  await test(`profile resolution rejects inactive session before binding ${String(activeSession)}`, async () => {
    const fixture = applicationProfileFixture({ activeSession });
    await fixture.resolve();
    assert.equal(fixture.calls.bound, 0);
    assert.equal(fixture.calls.queried, 0);
    assert.equal(fixture.calls.loaded, 0);
    assert.equal(fixture.calls.signedOut, 1);
  });
}
await test('pending teacher application profile resolves only after active server session', async () => {
  const fixture = applicationProfileFixture();
  await fixture.resolve();
  assert.equal(fixture.calls.bound, 1);
  assert.equal(fixture.calls.queried, 1);
  assert.equal(fixture.calls.loaded, 1);
  assert.equal(fixture.calls.fallback, 0);
  assert.deepEqual(fixture.calls.rpcOrder.slice(0, 4), ['security_auth_session_active', 'bind_current_user_to_teacher', 'security_session_active', 'get_my_teacher_profile']);
});
await test('unlinked registered teacher maps only after strict auth-session bootstrap and before full account gate', async () => {
  const fixture = applicationProfileFixture({ unlinkedTeacher: true });
  await fixture.resolve();
  assert.equal(fixture.calls.bound, 1);
  assert.equal(fixture.calls.loaded, 1);
  assert.equal(fixture.calls.signedOut, 0);
  assert.deepEqual(fixture.calls.rpcOrder.slice(0, 4), ['security_auth_session_active', 'bind_current_user_to_teacher', 'security_session_active', 'get_my_teacher_profile']);
});
await test('valid auth bootstrap never bypasses a rejected teacher/account session', async () => {
  const fixture = applicationProfileFixture({ authSession: true, activeSession: false });
  await fixture.resolve();
  assert.equal(fixture.calls.bound, 1);
  assert.equal(fixture.calls.queried, 0);
  assert.equal(fixture.calls.loaded, 0);
  assert.equal(fixture.calls.fallback, 0);
  assert.equal(fixture.calls.signedOut, 1);
});
for (const phase of ['switchDuringBootstrap', 'switchDuringBinding']) {
  await test(`delayed ${phase} result cannot clear or load another authenticated account`, async () => {
    const fixture = applicationProfileFixture({ [phase]: true });
    await fixture.resolve();
    assert.equal(fixture.calls.loaded, 0);
    assert.equal(fixture.calls.queried, 0);
    assert.equal(fixture.calls.signedOut, 0);
    assert.equal(fixture.context._currentSession.user.id, 'user-b');
  });
}
for (const result of [{ data: null, error: null }, { data: null, error: { message: 'fixture query error' } }, { data: { id: 'teacher-a', auth_user_id: 'user-a', status: 'normal' }, error: null }]) {
  await test(`delayed fallback ${result.data ? 'profile' : result.error ? 'error' : 'empty'} cannot reject or mutate another login`, async () => {
    const fixture = applicationProfileFixture();
    const source = read('js/auth.js');
    const fallbackSource = source.slice(source.indexOf('async function _fallbackProfileQuery('), source.indexOf('// ─── Google GIS'));
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    const query = { select() { return this; }, eq() { return this; }, maybeSingle: () => pending };
    fixture.context._supabase.from = () => query;
    vm.runInContext(`${fallbackSource}\nglobalThis.fallback = _fallbackProfileQuery;`, fixture.context);
    const request = fixture.context.fallback({ id: 'user-a' });
    fixture.context._currentSession = { user: { id: 'user-b' } };
    release(result);
    await request;
    assert.equal(fixture.calls.persisted, 0);
    assert.equal(fixture.calls.rejected, 0);
    assert.equal(fixture.calls.loaded, 0);
    assert.equal(fixture.calls.signedOut, 0);
    assert.equal(fixture.context._currentSession.user.id, 'user-b');
  });
}

function installColdRestore(fixture, verifiedUser = { id: 'user-a' }) {
  const source = read('js/auth.js');
  const restoreSource = source.slice(source.indexOf('async function _restoreSession('), source.indexOf('// ─── OAuth 리다이렉트'));
  const session = { user: { id: 'user-a' }, access_token: 'fixture-cold-restore-token' };
  fixture.context._currentSession = null;
  fixture.context._supabase.auth.getSession = async () => ({ data: { session }, error: null });
  fixture.context._supabase.auth.getUser = async () => ({ data: { user: verifiedUser }, error: null });
  vm.runInContext(`${restoreSource}\nglobalThis.restore = _restoreSession;`, fixture.context);
  return session;
}
await test('cold session restore verifies auth-only before legacy binding then full teacher gate', async () => {
  const fixture = applicationProfileFixture({ unlinkedTeacher: true });
  installColdRestore(fixture);
  await fixture.context.restore();
  assert.equal(fixture.calls.bound, 1);
  assert.equal(fixture.calls.loaded, 1);
  assert.equal(fixture.calls.cleared, 0);
  assert.deepEqual(fixture.calls.rpcOrder.slice(0, 5), ['security_auth_session_active', 'security_auth_session_active', 'bind_current_user_to_teacher', 'security_session_active', 'get_my_teacher_profile']);
});
for (const activeSession of [false, null, 'error', 'true']) {
  await test(`cold restore inactive auth session ${String(activeSession)} cannot bind`, async () => {
    const fixture = applicationProfileFixture({ activeSession });
    installColdRestore(fixture);
    await fixture.context.restore();
    assert.equal(fixture.calls.bound, 0);
    assert.equal(fixture.calls.loaded, 0);
    assert.equal(fixture.calls.cleared, 1);
  });
}
await test('cold restore rejects a local session user that differs from verified server user', async () => {
  const fixture = applicationProfileFixture();
  installColdRestore(fixture, { id: 'user-b' });
  await fixture.context.restore();
  assert.equal(fixture.calls.bound, 0);
  assert.equal(fixture.calls.loaded, 0);
  assert.equal(fixture.calls.cleared, 1);
});
await test('cold restore with no SDK session clears an unchanged stale application session', async () => {
  const fixture = applicationProfileFixture();
  installColdRestore(fixture);
  fixture.context._currentSession = { user: { id: 'user-a' }, access_token: 'fixture-stale-token' };
  fixture.context._supabase.auth.getSession = async () => ({ data: { session: null }, error: null });
  await fixture.context.restore();
  assert.equal(fixture.calls.cleared, 1);
  assert.equal(fixture.calls.bound, 0);
  assert.equal(fixture.calls.loaded, 0);
});
for (const userId of ['user-b', 'user-a']) {
  await test(`late cold restore cannot clear replacement token for ${userId}`, async () => {
    const fixture = applicationProfileFixture();
    installColdRestore(fixture);
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    fixture.context._supabase.auth.getUser = () => pending;
    const restoring = fixture.context.restore();
    await Promise.resolve();
    fixture.context._currentSession = { user: { id: userId }, access_token: 'fixture-newer-token' };
    release({ data: { user: { id: 'user-a' } }, error: null });
    await restoring;
    assert.equal(fixture.calls.bound, 0);
    assert.equal(fixture.calls.loaded, 0);
    assert.equal(fixture.calls.cleared, 0);
    assert.equal(fixture.context._currentSession.access_token, 'fixture-newer-token');
  });
}

if (failures.length) {
  console.error(`[security-hardening] ${passed} passed; ${failures.length} failed`);
  process.exitCode = 1;
} else console.log(`[security-hardening] ok: ${passed} local-only behavioral checks`);
