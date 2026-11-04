import {
  applySecurityHeaders, isBlockedPublicPath, handleSessionRequest,
  getBearerToken, resolveTeacherProfile, hasPlaylabAccess, deny, noStoreHeaders,
} from '../cloudflare-worker.js';

const PLAYLAB_HTML_PATTERN = /^\/playlab\/.+\.html$/i;

async function route({ request, env, next }) {
  const url = new URL(request.url);
  if (['www.thehahalab.com', 'www.hahalab.com'].includes(url.hostname.toLowerCase())) {
    url.hostname = 'thehahalab.com';
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }
  if (url.pathname === '/api/playlab-session') return handleSessionRequest(request, url);
  if (!['GET', 'HEAD'].includes(request.method)) return deny(405, 'METHOD_NOT_ALLOWED');
  if (isBlockedPublicPath(url.pathname)) return deny(404, 'Not found');
  if (!PLAYLAB_HTML_PATTERN.test(url.pathname)) return next();
  const token = getBearerToken(request, url);
  if (!token) return deny(401, '로그인 후 이용할 수 있는 콘텐츠입니다.');
  let profile;
  try { profile = await resolveTeacherProfile(token); }
  catch (_) { return deny(401, '로그인 세션을 확인할 수 없습니다.'); }
  if (!profile || !hasPlaylabAccess(profile)) return deny(403, '현재 계정 상태에서는 콘텐츠를 이용할 수 없습니다.');
  const privateUrl = new URL(request.url);
  privateUrl.pathname = `/private${url.pathname}`;
  const response = await env.ASSETS.fetch(new Request(privateUrl, request));
  if (!response.ok) return deny(404, '콘텐츠 파일을 찾을 수 없습니다.');
  const headers = new Headers(response.headers);
  Object.entries(noStoreHeaders()).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

export async function onRequest(context) {
  return applySecurityHeaders(await route(context));
}
