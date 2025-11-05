self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open('passgen-cache-v1');
    await cache.addAll(['/','/static/css/styles.css','/static/js/script.js']);
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    return fetch(event.request);
  })());
});
