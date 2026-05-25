const CACHE_NAME = 'sahih-bukhari-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
  '/manifest.json'
];

// Install Event: Pre-cache the main app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-First for static assets/fonts, Stale-While-Revalidate for APIs/dynamic files
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and http/https schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // 1. Navigation requests (HTML pages) -> Network-First, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest HTML
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
          return response;
        })
        .catch(() => {
          // If offline, serve the cached main HTML
          return caches.match('/index.html') || caches.match(event.request);
        })
    );
    return;
  }

  // 2. Static Assets (Vite bundled JS/CSS, local images, icons) -> Cache-First
  const isStaticAsset = 
    url.origin === self.location.origin && 
    (url.pathname.includes('/assets/') || 
     url.pathname.endsWith('.png') || 
     url.pathname.endsWith('.svg') || 
     url.pathname.endsWith('.ico') || 
     url.pathname.endsWith('.json'));

  const isGoogleFont = 
    url.hostname.includes('fonts.googleapis.com') || 
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset || isGoogleFont) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // If it is a Google Font style sheet, we check for updates in the background (stale-while-revalidate)
          if (isGoogleFont && url.pathname.endsWith('.css')) {
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse);
                });
              }
            }).catch(() => {/* Ignore network errors for font stylesheet update */});
          }
          return cachedResponse;
        }

        // Not in cache, fetch and cache
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch((err) => {
          console.error('[Service Worker] Fetch failed for static asset:', event.request.url, err);
          return new Response('Asset unavailable offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
    return;
  }

  // 3. API Requests (Hadith API or Supabase) -> Stale-While-Revalidate
  const isApiRequest = 
    url.hostname.includes('hadithapi.com') || 
    url.hostname.includes('supabase.co');

  if (isApiRequest) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('[Service Worker] API fetch failed (offline mode):', event.request.url, err);
            // Return cached response if available, otherwise reject
            if (cachedResponse) return cachedResponse;
            throw err;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default: Network-First with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handle Notification Clicks to Focus or Open the App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open the home page
      if (self.clients.openWindow) {
        return self.clients.openWindow('/?utm_source=notification');
      }
    })
  );
});
