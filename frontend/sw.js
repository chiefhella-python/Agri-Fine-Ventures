const CACHE_NAME = 'agri-fine-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/main.css',
  '/app.js',
  '/state.js',
  '/greenhouse-data.js',
  '/admin.js',
  '/supervisor.js',
  '/agronomist.js',
  '/logo.png',
  '/icon-192.svg',
  '/icon-512.svg'
];

// External domains that should NEVER be intercepted by the service worker
const EXTERNAL_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'www.gstatic.com',
  'gstatic.com',
  'firebasejs',
  'firebase',
  'firebaseio.com',
  'googleapis.com',
  'api.open-meteo.com',
  'images.unsplash.com'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Check if this request is for an external domain
  let isExternal = false;
  try {
    const url = new URL(event.request.url);
    isExternal = EXTERNAL_DOMAINS.some(domain => url.hostname.includes(domain) || url.href.includes(domain));
  } catch (e) {
    // If URL parsing fails, let it pass through normally
    return;
  }

  // For external requests, do NOT intercept — let the browser handle them directly
  if (isExternal) {
    return;
  }

  // For local requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone and cache the response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // Offline fallback for navigation requests only
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            // For everything else, return a proper empty response instead of null
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Handle background sync for data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-greenhouse-data') {
    event.waitUntil(syncGreenhouseData());
  }
});

async function syncGreenhouseData() {
  console.log('Background sync triggered');
}