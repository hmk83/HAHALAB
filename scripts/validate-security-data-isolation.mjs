#!/usr/bin/env node
// Production read-only gate: supply two ordinary test-account access tokens via
// environment variables. Never logs tokens, identifiers, names or record data.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync('js/auth.js', 'utf8');
const base = source.match(/const SUPABASE_URL\s*=\s*['"]([^'"]+)/)[1];
const key = source.match(/const SUPABASE_KEY\s*=\s*['"]([^'"]+)/)[1];
const tokens = [process.env.SECURITY_A_TOKEN, process.env.SECURITY_B_TOKEN];
if (tokens.some((token) => !token)) {
  console.error('[security-isolation] INCOMPLETE: two separate ordinary test-account sessions are required (SECURITY_A_TOKEN, SECURITY_B_TOKEN). No requests sent.');
  process.exit(2);
}
async function api(token, endpoint, body) {
  const response = await fetch(base + endpoint, { method: body === undefined ? 'GET' : 'POST', headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15000) });
  assert.ok(response.ok, `API gate failed (${response.status})`);
  return response.json();
}
const users = await Promise.all(tokens.map((token) => api(token, '/auth/v1/user')));
assert.notEqual(users[0].id, users[1].id, 'Two distinct users are required');
for (const token of tokens) {
  assert.equal(await api(token, '/rest/v1/rpc/is_admin_user', {}), false, 'Use ordinary accounts, not privileged administrators');
  assert.equal(await api(token, '/rest/v1/rpc/security_session_active', {}), true, 'Session revocation SQL must be active');
}
let incomplete = 0;
for (const table of ['clients', 'schedules', 'histories']) {
  const samples = await Promise.all(tokens.map((token) => api(token, `/rest/v1/${table}?select=id&limit=3`)));
  if (samples.some((rows) => !rows.length)) {
    incomplete++;
    console.log(`[security-isolation] INCOMPLETE ${table}: both accounts need existing test records`);
    continue;
  }
  for (let index = 0; index < 2; index++) {
    const ids = samples[1 - index].map((row) => String(row.id));
    const filter = encodeURIComponent(`in.(${ids.map((id) => `"${id.replace(/["\\]/g, '')}"`).join(',')})`);
    const foreign = await api(tokens[index], `/rest/v1/${table}?select=id&id=${filter}`);
    assert.equal(foreign.length, 0, `${table}: cross-account read must return no rows`);
  }
  console.log(`[security-isolation] PASS ${table}: two-way cross-account read denied`);
}
console.log(`[security-isolation] ${incomplete ? 'INCOMPLETE' : 'READ PASS'}; write/update/delete policies still require transactional database verification`);
process.exitCode = incomplete ? 2 : 0;
