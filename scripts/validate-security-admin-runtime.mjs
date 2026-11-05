#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = process.cwd();
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    let sdk;
    let signedIn = false;
    let aal = 'aal1';
    const profile = { id: 1, auth_user_id: 'fixture-user', teacher_id: 'fixture-admin', email: 'fixture@example.test', name: '보안 검증', role: 'admin', status: 'normal' };
    const chain = new Proxy(function () {}, { get: (_, key) => key === 'then' ? (resolve) => resolve({ data: [], error: null }) : () => chain });
    const client = {
      auth: {
        getSession: async () => ({ data: { session: signedIn ? { user: { id: 'fixture-user' }, access_token: 'synthetic' } : null } }),
        getUser: async () => ({ data: { user: signedIn ? { id: 'fixture-user' } : null } }),
        signInWithPassword: async () => { signedIn = true; return { error: null }; },
        signOut: async () => { signedIn = false; return { error: null }; },
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        mfa: {
          getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: aal, nextLevel: 'aal2' } }),
          listFactors: async () => ({ data: { totp: [] } }),
          enroll: async () => ({ data: { id: 'fixture-factor', totp: { qr_code: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/></svg>') } } }),
          challengeAndVerify: async ({ code }) => {
            if (code !== '123456') return { error: new Error('invalid fixture code') };
            aal = 'aal2';
            return { error: null };
          },
        },
      },
      rpc: async (name) => ({ data: name === 'security_session_active' || name === 'is_admin_user' ? true : name === 'get_my_teacher_profile' ? profile : [], error: null }),
      from: () => chain,
      channel: () => chain,
      removeChannel() {},
    };
    Object.defineProperty(window, 'supabase', { configurable: true, get: () => sdk, set: (value) => { sdk = { ...value, createClient: () => client }; } });
  });
  await page.route('https://security-harness.invalid/**', async (route) => {
    const url = new URL(route.request().url());
    const file = path.resolve(root, '.' + url.pathname);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
    const type = file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream';
    return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) });
  });
  // No identity service, real login, database operation or account enrollment.
  await page.route('https://accounts.google.com/**', (route) => route.fulfill({ status: 200, body: '' }));
  await page.goto('https://security-harness.invalid/admin.html', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('admin@domain.com').waitFor({ timeout: 45000 });
  await page.getByPlaceholder('admin@domain.com').fill('fixture@example.test');
  await page.getByPlaceholder('관리자 비밀번호').fill('synthetic-password');
  await page.getByRole('button', { name: '관리자 로그인', exact: true }).click();
  await page.getByLabel('추가 인증 코드').waitFor();
  assert.equal(await page.getByRole('button', { name: '선생님 관리', exact: true }).count(), 0, 'aal1 must not expose admin workspace');
  const qr = page.getByAltText('관리자 추가 인증 등록 QR');
  await qr.waitFor();
  await page.waitForFunction(() => document.querySelector('img[alt="관리자 추가 인증 등록 QR"]')?.naturalWidth > 0);
  await page.getByLabel('추가 인증 코드').fill('000000');
  await page.getByRole('button', { name: '추가 인증 완료', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByRole('button', { name: '선생님 관리', exact: true }).count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'MFA screen must fit a phone');
  await page.getByLabel('추가 인증 코드').fill('123456');
  await page.getByRole('button', { name: '추가 인증 완료', exact: true }).click();
  await page.getByRole('button', { name: '선생님 관리', exact: true }).waitFor();
  assert.deepEqual(errors, [], 'admin JSX/CDN/MFA must execute without runtime errors');
  console.log('[security-admin-runtime] PASS: pinned CDN/SRI runtime, MFA enrollment QR, aal1 and bad-code denial, aal2 entry, mobile layout');
} finally { await browser.close(); }
