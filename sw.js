const CACHE_NAME = 'stockkarte-v1';
const urlsToCache = [
  '.',
  'index.html',
  'manifest.json',
  // CDN-Ressourcen nur cachen, wenn sie geladen werden können (CORS)
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache.map(url => {
          // Ignoriere CORS-Fehler für CDN, cache trotzdem bei Erfolg
          return fetch(url, { mode: 'no-cors' }).then(response => {
            if (response.ok || response.type === 'opaque') {
              return cache.put(url, response);
            }
          }).catch(() => {});
        }));
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }))
  );
});
