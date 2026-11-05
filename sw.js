const CACHE_VERSION = '20261104-security-report-2';
const STATIC_CACHE = `haha-lab-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `haha-lab-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/class-new.html',
  '/teacher-withdrawal-retention.html',
  '/class.html',
  '/css/tailwind-build.css',
  '/css/main.css',
  '/css/modal.css?v=20260710-registration-spacing-1',
  '/css/offline.css?v=20260517-wifi-loader-1',
  '/index-app.js',
  '/js/offline.js?v=20260517-wifi-loader-1',
  '/js/clinical-workflow.js?v=20260710-clinical-cr1-1',
  '/js/app.js?v=20261104-security-report-2',
  '/css/schedule.css?v=20260827-report-integrity-1',
  '/playlab/playlab-report-engine.css?v=20260827-report-integrity-1',
  '/playlab/playlab-report-engine.js?v=20261104-security-report-2',
  '/js/modal.js?v=20260417b',
  '/js/auth.js?v=20261104-security-report-2',
  '/images/kakao_login_medium_wide.png',
  '/class-app.js?v=20260416-ui-6',
  '/class-app.chunk.js?v=20260416-ui-6',
  '/policy-docs.js',
  '/cardlab-association-course-data.js?v=20260409-1',
  '/cardlab-context-course-data.js?v=20260409-1',
  '/cardlab-idiom-course-data.js?v=20260409-1',
  '/cardlab-pair-course-data.js?v=20260409-1',
  '/cardlab-sentence-course-data.js?v=20260409-1',
  '/cardlab-sentence-quiz-data.js?v=20260409-1',
  '/playlab/images/card-word-map.js?v=20260409-1',
  '/playlab/images/card-word-fallback-map.js?v=20260409-1',
  '/cardlab-word-meaning-map.js?v=20260409-1',
  '/sound/card/manifest.json',
  '/sound/correct.mp3',
  '/sound/error.mp3',
  '/sound/happy_victory.mp3',
  '/sound/select.mp3'
];

const isCacheableSameOriginRequest = (request) => {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (/^\/playlab\/.+\.html$/i.test(url.pathname) || url.pathname.startsWith('/private/') || url.pathname.startsWith('/api/')) return false;
  if (['/admin.html', '/class-new.html', '/class-new-mobile.html', '/playlab-history-report-viewer.html', '/js/auth.js', '/js/app.js'].includes(url.pathname)) return false;
  return /\.(?:html|js|css|json|mp3|svg|png|jpe?g|webp|ico)$/i.test(url.pathname) || url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/class.html' || url.pathname === '/class-new.html' || url.pathname === '/teacher-withdrawal-retention.html';
};

const cachePutSafe = async (cacheName, request, response) => {
  if (!response || !response.ok || /no-store|private/i.test(response.headers.get('Cache-Control') || '')) return response;
  const cache = await caches.open(cacheName);
  try {
    await cache.put(request, response.clone());
  } catch (_) {
    // Ignore caching failures for opaque or non-cacheable responses.
  }
  return response;
};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok && !/no-store|private/i.test(response.headers.get('Cache-Control') || '')) {
          await cache.put(url, response.clone());
        }
      } catch (_) {
        // Precache is best-effort so core app startup is never blocked by one bad asset.
      }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (key === STATIC_CACHE || key === RUNTIME_CACHE) return null;
      return caches.delete(key);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isCacheableSameOriginRequest(request)) {
    return;
  }
  const requestUrl = new URL(request.url);

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok && !/no-store|private/i.test(response.headers.get('Cache-Control') || '')) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        return caches.match('/class-new.html') || caches.match('/index.html');
      }
    })());
    return;
  }

  if (request.destination === 'script' || requestUrl.pathname.endsWith('.js')) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      try {
        const response = await fetch(request, { cache: 'reload' });
        if (response && response.ok && !/no-store|private/i.test(response.headers.get('Cache-Control') || '')) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return caches.match(request, { ignoreSearch: false }) || caches.match(request.url);
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request, { ignoreSearch: false });
    const fetchPromise = fetch(request)
      .then((response) => cachePutSafe(RUNTIME_CACHE, request, response.clone()))
      .catch(() => null);

    if (cachedResponse) {
      event.waitUntil(fetchPromise);
      return cachedResponse;
    }

    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }

    return caches.match(request, { ignoreSearch: false }) || caches.match(request.url);
  })());
});
