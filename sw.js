const CACHE = "wayfarer-v0.14.2-orthodox-inventory-equip-fix";
const ASSETS = ["./", "./index.html", "./manifest.json", "./CHANGELOG.md", "./assets/male-dungeon.png", "./assets/female-dungeon.png", "./assets/dungeon-theme.png", "./assets/adventure-theme.png", "./assets/male-adventurer.jpg", "./assets/female-adventurer.jpg", "./assets/academy-theme.png", "./assets/female-academy.jpg", "./assets/male-academy.jpg", "./assets/social-interactions-theme.png", "./assets/male-social.png", "./assets/female-social.png", "./assets/relationships-theme.png", "./assets/male-relationships.jpg", "./assets/female-relationships.jpg", "./assets/orthodox-theme.png", "./assets/orthodox-theme-background.png", "./assets/male-orthodox.png", "./assets/female-orthodox.png"];
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
