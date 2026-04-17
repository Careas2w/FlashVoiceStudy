const CACHE_NAME = 'korean-audio-v1';

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response; // Si está en caché, lo devuelve
            return fetch(event.request).then(networkResponse => {
                // Si es un audio MP3, lo guardamos en la caché del iPad
                if (event.request.url.endsWith('.mp3')) {
                    const cacheCopy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
                }
                return networkResponse;
            });
        })
    );
});