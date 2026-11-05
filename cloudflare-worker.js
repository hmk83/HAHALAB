const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
const AUTH_COOKIE_NAME = '__Host-hahalab_playlab_session';
const PRIVATE_PREFIX = '/private/';
const PLAYLAB_HTML_PATTERN = /^\/playlab\/.+\.html$/i;
const NO_STORE_STATIC_KEYS = new Set([
  'class-new.html',
  'class-new-mobile.html',
  'admin.html',
  'playlab-history-report-viewer.html',
  'teacher-withdrawal-retention.html',
  'js/app.js',
  'js/auth.js',
  'sw.js',
  'data/playlab-content-catalog.json',
  'private/playlab-content-catalog.json',
]);

function parseCookies(header = '') {
  return String(header || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf('=');
      if (index < 0) return cookies;
      const key = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      if (key) {
        try { cookies[key] = decodeURIComponent(value); } catch (_) { /* Invalid cookies are not authentication. */ }
      }
      return cookies;
    }, {});
}

function noStoreHeaders(extra = {}) {
  return {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    ...extra,
  };
}

function shouldNoStoreStaticKey(key = '') {
  return NO_STORE_STATIC_KEYS.has(String(key || '').replace(/^\/+/, ''));
}

function isBlockedPublicPath(pathname = '') {
  let path = pathname;
  try {
    for (let i = 0; i < 3; i += 1) {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    }
  } catch (_) { return true; }
  path = path.replace(/\\/g, '/');
  if (/[\u0000-\u001f\u007f]/.test(path) || path.split('/').some((part) => part.startsWith('.'))) return true;
  return /^\/(?:private|scratch|supabase|scripts|docs|artifacts|harness|node_modules|output|tmp|deliverables|functions)(?:\/|$)/i.test(path)
    // Originals and motion objects use the catalogue-checked signed URL flow.
    // A raw Worker/R2 path must not bypass visibility checks in that flow.
    || /^\/(?:worksheets\/originals|cardlab\/motion-cards)(?:\/|$)/i.test(path)
    || /\.(?:sql|ts|tsx|jsx|toml|mjs|map|env|log|bak|zip)$/i.test(path)
    || /^\/(?:cloudflare-worker\.js|package(?:-lock)?\.json|_headers|_redirects|wrangler[^/]*|AGENTS\.md)$/i.test(path);
}

function applySecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Strict-Transport-Security', 'max-age=31536000');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Existing learning handlers and the admin JSX compiler still need inline/eval.
  // Explicit sources constrain external scripts/connections; removing inline/eval
  // remains a separate migration, so this policy is not a complete XSS defense.
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://esm.sh https://cdn.tailwindcss.com https://accounts.google.com https://t1.daumcdn.net https://www.googletagmanager.com https://static.cloudflareinsights.com; connect-src 'self' https://gxungzlecmibgvykoiib.supabase.co wss://gxungzlecmibgvykoiib.supabase.co https://accounts.google.com https://people.googleapis.com https://www.googleapis.com https://texttospeech.googleapis.com https://kapi.kakao.com https://cdn.jsdelivr.net https://unpkg.com https://esm.sh https://lottie.host https://tonejs.github.io https://21a020877fab0971928ba66fc76702df.r2.cloudflarestorage.com https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com https://cdn.jsdelivr.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; worker-src 'self' blob:; frame-src 'self' blob: https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://postcode.map.daum.net https://t1.daumcdn.net; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com; manifest-src 'self'; upgrade-insecure-requests");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function handleSessionRequest(request, url) {
  const origin = request.headers.get('Origin');
  if (origin !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return deny(403, 'ORIGIN_REQUIRED');
  const expireLegacy = 'hahalab_playlab_token=; Path=/; Max-Age=0; Secure; SameSite=Lax';
  const headers = new Headers(noStoreHeaders());
  headers.append('Set-Cookie', expireLegacy);
  if (request.method === 'DELETE') {
    headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') return deny(405, 'METHOD_NOT_ALLOWED');
  const match = (request.headers.get('Authorization') || '').match(/^Bearer\s+([^\s;,]+)$/i);
  if (!match) return deny(401, 'AUTH_REQUIRED');
  const token = match[1];
  try {
    const profile = await resolveTeacherProfile(token);
    if (!profile || !hasPlaylabAccess(profile)) return deny(403, 'ACCOUNT_BLOCKED');
    const jwt = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const remaining = Math.min(3600, Math.floor(Number(jwt.exp) - Date.now() / 1000));
    if (!Number.isFinite(remaining) || remaining <= 0) return deny(401, 'AUTH_EXPIRED');
    headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${remaining}; HttpOnly; Secure; SameSite=Lax`);
    return new Response(null, { status: 204, headers });
  } catch (_) { return deny(401, 'AUTH_INVALID'); }
}

function deny(status, message) {
  if (status === 404) return notFoundResponse(message);
  return new Response(message, {
    status,
    headers: noStoreHeaders({
      'Content-Type': 'text/plain; charset=utf-8',
    }),
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

function notFoundResponse(message = '') {
  const detail = message && !/^not found$/i.test(String(message).trim())
    ? escapeHtml(message)
    : '주소가 바뀌었거나 삭제된 페이지입니다.<br>이전 화면으로 돌아가 다시 확인해 주세요.';
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>페이지를 찾을 수 없어요 | HAHA LAB</title>
  <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js" type="module"></script>
  <style>
    :root{color-scheme:light;--ink:#17223d;--muted:#6b7280;--line:rgba(109,93,252,.14);--brand:#6d5dfc;--brand2:#21b7f2;font-family:"Pretendard","Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif}
    *{box-sizing:border-box}html,body{width:100%;min-height:100%;margin:0}body{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;color:var(--ink);background:radial-gradient(circle at 18% 20%,rgba(255,211,94,.32),transparent 24%),radial-gradient(circle at 82% 76%,rgba(33,183,242,.24),transparent 28%),linear-gradient(135deg,#fffaf0 0%,#eef7ff 54%,#f8f3ff 100%);text-align:center}
    main{width:min(460px,100%);display:grid;justify-items:center;gap:12px;padding:28px 22px 32px;border:1px solid var(--line);border-radius:28px;background:rgba(255,255,255,.86);box-shadow:0 28px 70px rgba(35,47,91,.14);backdrop-filter:blur(14px)}
    dotlottie-wc{width:min(300px,72vw);height:min(300px,72vw)}h1{margin:4px 0 0;font-size:clamp(1.55rem,4vw,2.25rem);line-height:1.2;letter-spacing:0}p{margin:0;color:var(--muted);font-size:clamp(1rem,2.4vw,1.1rem);font-weight:800;line-height:1.55}a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;margin-top:8px;padding:0 18px;border-radius:999px;color:#fff;background:linear-gradient(135deg,var(--brand),var(--brand2));font-size:.96rem;font-weight:1000;text-decoration:none;box-shadow:0 16px 32px rgba(45,113,220,.22)}
  </style>
</head>
<body>
  <main aria-labelledby="notFoundTitle">
    <dotlottie-wc src="https://lottie.host/c47666ad-ed0d-4eea-80d0-64896055b38c/0s5sbm1HeP.lottie" autoplay loop></dotlottie-wc>
    <h1 id="notFoundTitle">페이지를 찾을 수 없어요</h1>
    <p>${detail}</p>
    <a href="/">홈으로 이동</a>
  </main>
</body>
</html>`;
  return new Response(html, {
    status: 404,
    headers: noStoreHeaders({
      'Content-Type': 'text/html; charset=utf-8',
    }),
  });
}

function getBearerToken(request, url) {
  const authHeader = request.headers.get('Authorization') || '';
  const authMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (authMatch?.[1]) return authMatch[1].trim();

  const cookies = parseCookies(request.headers.get('Cookie'));
  if (cookies[AUTH_COOKIE_NAME]) return cookies[AUTH_COOKIE_NAME];

  return '';
}

async function fetchSupabaseJson(path, token, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`SUPABASE_${response.status}`);
    error.payload = payload;
    throw error;
  }
  return payload;
}

function hasPlaylabAccess(profile = {}) {
  return ['normal', 'active'].includes(String(profile.status || '').trim().toLowerCase());
}

async function resolveTeacherProfile(token) {
  await fetchSupabaseJson('/auth/v1/user', token);
  const active = await fetchSupabaseJson('/rest/v1/rpc/security_session_active', token, { method: 'POST', body: '{}' });
  if (active !== true) throw new Error('AUTH_SESSION_REVOKED');
  const profilePayload = await fetchSupabaseJson('/rest/v1/rpc/get_my_teacher_profile', token, {
    method: 'POST',
    body: '{}',
  });
  const profile = Array.isArray(profilePayload) ? profilePayload[0] : profilePayload;
  return profile && typeof profile === 'object' ? profile : null;
}

function getContentType(key = '') {
  if (key.endsWith('.html')) return 'text/html; charset=utf-8';
  if (key.endsWith('.css')) return 'text/css; charset=utf-8';
  if (key.endsWith('.js') || key.endsWith('.mjs')) return 'application/javascript; charset=utf-8';
  if (key.endsWith('.json')) return 'application/json; charset=utf-8';
  if (key.endsWith('.svg')) return 'image/svg+xml';
  if (key.endsWith('.png')) return 'image/png';
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg';
  if (key.endsWith('.webp')) return 'image/webp';
  if (key.endsWith('.mp4')) return 'video/mp4';
  if (key.endsWith('.webm')) return 'video/webm';
  if (key.endsWith('.mov')) return 'video/quicktime';
  if (key.endsWith('.m4v')) return 'video/x-m4v';
  if (key.endsWith('.mp3')) return 'audio/mpeg';
  if (key.endsWith('.wav')) return 'audio/wav';
  if (key.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

async function serveR2Object(env, key, options = {}) {
  const object = await env.MY_BUCKET.get(key);
  if (object === null) return deny(404, '파일을 찾을 수 없습니다 (404)');

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  if (!headers.has('Content-Type')) headers.set('Content-Type', getContentType(key));
  if (options.noStore) {
    Object.entries(noStoreHeaders()).forEach(([name, value]) => headers.set(name, value));
  }
  return new Response(object.body, { headers });
}

async function serveProtectedPlaylabHtml(request, env, url) {
  const token = getBearerToken(request, url);
  if (!token) return deny(401, '로그인 후 이용할 수 있는 콘텐츠입니다.');

  let profile = null;
  try {
    profile = await resolveTeacherProfile(token);
  } catch (_) {
    return deny(401, '로그인 세션을 확인할 수 없습니다.');
  }

  if (!profile || !hasPlaylabAccess(profile)) {
    return deny(403, '현재 계정 상태에서는 콘텐츠를 이용할 수 없습니다.');
  }

  const privateKey = `private${url.pathname}`.replace(/^\/+/, '');
  return serveR2Object(env, privateKey, { noStore: true });
}

export default {
  async fetch(request, env) {
    return applySecurityHeaders(await routeRequest(request, env));
  },
};

async function routeRequest(request, env) {
    const url = new URL(request.url);
    if (url.protocol !== 'https:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 308);
    }

    if (url.hostname === 'www.thehahalab.com' || url.hostname === 'www.hahalab.com') {
      url.hostname = 'thehahalab.com';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/playlab-session') return handleSessionRequest(request, url);
    if (!['GET', 'HEAD'].includes(request.method)) return deny(405, 'METHOD_NOT_ALLOWED');
    if (isBlockedPublicPath(url.pathname)) {
      return deny(404, 'Not found');
    }

    if (PLAYLAB_HTML_PATTERN.test(url.pathname)) {
      return serveProtectedPlaylabHtml(request, env, url);
    }

    if (url.pathname === '/') {
      url.pathname = '/index.html';
    } else if (url.pathname.endsWith('/')) {
      url.pathname += 'index.html';
    }

    const key = url.pathname.slice(1);
    return serveR2Object(env, key, { noStore: shouldNoStoreStaticKey(key) });
}

export { applySecurityHeaders, isBlockedPublicPath, handleSessionRequest, getBearerToken, resolveTeacherProfile, hasPlaylabAccess, deny, noStoreHeaders };
