const CACHE_NAME = 'daily-games-v1';

const STATIC_PRECACHE = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: precache essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler: offline-first for app assets, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  // 1. API: Leaderboard (Network-first with cached fallback)
  if (url.pathname.startsWith('/api/leaderboard')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Other APIs: network-only or offline error
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ success: false, error: 'Offline mode active', offline: true }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // 3. Static assets & Next.js chunks: Cache-first or Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background revalidation
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          // If offline navigation, return cached home shell
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
