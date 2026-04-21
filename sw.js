const CACHE_NAME = 'korean-flashstudy-v18';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app.js',
  './icons/favicon-32.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const hasRange = event.request.headers.has('range');
  const path = url.pathname.toLowerCase();
  const isAudio = path.endsWith('.mp3') || path.endsWith('.m4a') || path.endsWith('.wav') || path.includes('/audios/');

  // iOS/Safari suele usar peticiones con Range para audio.
  // Cachear respuestas 206 (Partial Content) rompe la reproducción en algunos dispositivos.
  // Por eso: audio y/o peticiones con Range => siempre a red (sin caché).
  if (isSameOrigin && (isAudio || hasRange)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const clone = response.clone();
        // Solo cachear 200 OK (evita guardar 206/404/500 y problemas en iPad)
        if (isSameOrigin && response && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
