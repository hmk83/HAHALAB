#!/usr/bin/env node
// Read-only deployment gate. Never creates accounts or changes customer data.
const base = process.env.SECURITY_BASE_URL || 'https://thehahalab.com';
let failures = 0;
for (const [path, expected] of [
  ['/admin.html', 200], ['/class-new.html', 200], ['/class-new-mobile.html', 200],
  ['/playlab/cardlab-study.html', 401], ['/private/playlab/cardlab-study.html', 404],
  ['/scratch/test_login.html', 404], ['/supabase/functions/teacher-auth-manager/index.ts', 404],
  ['/cloudflare-worker.js', 404], ['/.env', 404],
]) {
  try {
    const response = await fetch(new URL(path, base), { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const checks = {
      status: response.status === expected,
      noSniff: response.headers.get('x-content-type-options') === 'nosniff',
      noReferrer: response.headers.get('referrer-policy') === 'no-referrer',
      frameGuard: Boolean(response.headers.get('content-security-policy')?.includes('frame-ancestors')),
      noStore: /no-store/.test(response.headers.get('cache-control') || ''),
    };
    const ok = Object.values(checks).every(Boolean);
    if (!ok) failures++;
    console.log(JSON.stringify({ path, status: response.status, expected, checks, ok }));
    await response.body?.cancel();
  } catch (error) {
    failures++;
    console.log(JSON.stringify({ path, ok: false, error: error.message }));
  }
}
console.log(`[security-live] ${failures ? 'INCOMPLETE' : 'PASS'}: ${failures} deployment gates failed; authenticated tenant isolation is a separate required gate`);
process.exitCode = failures ? 1 : 0;
