const CACHE = "wayfarer-v1.17.9";
const ASSETS = [
  "./assets/images/ceo-background.webp", "./assets/images/male-ceo.webp", "./assets/images/female-ceo.webp", "./assets/images/ceo-theme.webp", "./assets/sound/ceo-theme.mp3",
  "./assets/images/piano-background.webp",
  "./assets/images/male-mozart-salon.webp",
  "./assets/images/female-mozart-salon.webp",
  "./assets/images/mozart-salon-theme.webp",
  "./assets/images/female-spartan-endurance.webp",
  "./assets/images/male-spartan-endurance.webp",
  "./assets/images/spartan-endurance-theme.webp",
  "./assets/images/spartan-endurance-background.webp","./", "./index.html", "./manifest.json", "./CHANGELOG.md", "./assets/images/male-dungeon.webp", "./assets/images/female-dungeon.webp", "./assets/images/dungeon-theme.webp", "./assets/images/adventure-theme.webp", "./assets/images/male-adventurer.webp", "./assets/images/female-adventurer.webp", "./assets/images/academy-theme.webp", "./assets/images/female-academy.webp", "./assets/images/male-academy.webp", "./assets/images/social-interactions-theme.webp", "./assets/images/male-social.webp", "./assets/images/female-social.webp", "./assets/images/relationships-theme.webp", "./assets/images/male-relationships.webp", "./assets/images/female-relationships.webp", "./assets/images/orthodox-theme.webp", "./assets/images/orthodox-theme-background.webp", "./assets/images/dungeon-background.webp", "./assets/images/adventure-background.webp", "./assets/images/academy-background.webp", "./assets/images/social-interactions-background.webp", "./assets/images/relationships-background.webp", "./assets/images/male-orthodox.webp", "./assets/images/female-orthodox.webp", "./assets/sound/dungeon-theme.mp3", "./assets/sound/adventure-theme.mp3", "./assets/sound/academy-theme.mp3", "./assets/sound/social-interactions-theme.mp3", "./assets/sound/relationships-theme.mp3", "./assets/sound/orthodox-theme.mp3", "./assets/sound/fitness-theme.mp3", "./assets/sound/cardio-theme.mp3", "./assets/sound/piano-theme.mp3", "./assets/images/fitness-theme.webp",
  "./assets/images/fitness-background.webp",
  "./assets/images/male-fitness.webp",
  "./assets/images/female-fitness.webp",
];
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
