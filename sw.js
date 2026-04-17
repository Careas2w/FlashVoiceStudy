const CACHE_NAME = 'korean-app-v5';
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

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => { if(key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) return res;
      return fetch(e.request).then(response => {
        // Cacheamos los archivos de audio MP3 dinámicamente cuando se reproducen
        if (e.request.url.includes('.mp3')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});