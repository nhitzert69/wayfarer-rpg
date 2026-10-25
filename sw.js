const CACHE = "wayfarer-v56";
const ASSETS = ["./", "./index.html", "./manifest.json"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const request = event.request;
  const isPage = request.mode === "navigate" ||
    new URL(request.url).pathname.endsWith("/index.html") ||
    new URL(request.url).pathname.endsWith("/wayfarer-rpg/");

  if (isPage) {
    // Prefer the latest deployed page; use the cached page only when offline.
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request).then(cached =>
        cached || caches.match("./index.html")
      ))
    );
    return;
  }

  // Cache-first for supporting assets, with network fallback.
  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      })
    )
  );
});
