const CACHE_NAME = 'korean-flash-v22';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) return response;
      return fetch(e.request).then(netRes => {
        // Cachear automáticamente archivos de audio MP3
        if (e.request.url.includes('.mp3')) {
          const cacheCopy = netRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
        }
        return netRes;
      });
    })
  );
});