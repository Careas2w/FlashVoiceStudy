const CACHE_NAME = "korean-flashstudy-v1";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      "./",
      "./index.html"
    ]))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).then(fetchRes => {
        if(e.request.url.includes("/audio/")){
          const clone = fetchRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return fetchRes;
      });
    })
  );
});
