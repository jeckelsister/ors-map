// Service Worker for static resources caching
// Improves performance and enables partial offline functionality

const CACHE_NAME = 'waymaker-v1';
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  // Add other critical static resources
];

// Service worker installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_RESOURCES);
    })
  );
});

// Activation and cleanup of old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Cache strategy: Network First for APIs, Cache First for assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle secure requests (HTTPS)
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    return;
  }

  // Whitelist of allowed external domains
  const allowedDomains = [
    'api.openrouteservice.org',
    'overpass-api.de',
    'api.open-elevation.com',
    'tile.openstreetmap.fr',
    'tile.opentopomap.org',
    'tile-cyclosm.openstreetmap.fr',
  ];

  // Check if external request is to an allowed domain
  if (
    url.hostname !== self.location.hostname &&
    !allowedDomains.some(domain => url.hostname.includes(domain))
  ) {
    return;
  }

  // API calls: Network first, fallback to cache
  if (
    url.pathname.includes('/api/') ||
    url.hostname !== self.location.hostname
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
  }
  // Static assets: Cache first
  else {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request);
      })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync if needed
  // Background sync completed
}
