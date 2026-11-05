const CACHE = "wayfarer-standalone-v3.1.8";
const ASSETS = [
  "./assets/images/themes/backgrounds/bloodthirst-background.webp", "./assets/images/themes/icons/bloodthirst-theme.webp", "./assets/images/themes/characters/male-bloodthirst.webp", "./assets/images/themes/characters/female-bloodthirst.webp", "./assets/sound/bloodthirst-theme.mp3",
  "./assets/images/themes/backgrounds/ceo-background.webp", "./assets/images/themes/characters/male-ceo.webp", "./assets/images/themes/characters/female-ceo.webp", "./assets/images/themes/icons/ceo-theme.webp", "./assets/sound/ceo-theme.mp3",
  "./assets/images/themes/backgrounds/piano-background.webp",
  "./assets/images/themes/characters/male-mozart-salon.webp",
  "./assets/images/themes/characters/female-mozart-salon.webp",
  "./assets/images/themes/icons/mozart-salon-theme.webp",
  "./assets/images/themes/characters/female-spartan-endurance.webp",
  "./assets/images/themes/characters/male-spartan-endurance.webp",
  "./assets/images/themes/icons/spartan-endurance-theme.webp",
  "./assets/images/themes/backgrounds/spartan-endurance-background.webp","./", "./index.html", "./codes/styles.css", "./codes/theme-registry.js", "./codes/inventory-service.js", "./codes/artifact-service.js", "./assets/images/artifacts/artifact-01.png", "./assets/images/artifacts/artifact-02.png", "./assets/images/artifacts/artifact-03.png", "./assets/images/artifacts/artifact-04.png", "./assets/images/artifacts/artifact-05.png", "./assets/images/artifacts/artifact-06.png", "./assets/images/artifacts/artifact-07.png", "./assets/images/artifacts/artifact-08.png", "./assets/images/artifacts/artifact-09.png", "./codes/theme-service.js", "./codes/theme-music.js", "./codes/skill-catalog.js", "./codes/skill-service.js", "./codes/debug-service.js", "./codes/tabs/quests.js", "./codes/tabs/character.js", "./codes/tabs/store.js", "./codes/tabs/skills.js", "./codes/tabs/todo.js", "./codes/tabs/groceries.js", "./codes/tabs/journal.js", "./codes/tabs/settings.js", "./codes/tabs/debug.js", "./manifest.json", "./CHANGELOG.md", "./update%20rules", "./theme%20creation%20rules.md", "./assets/images/themes/characters/male-dungeon.webp", "./assets/images/themes/characters/female-dungeon.webp", "./assets/images/themes/icons/dungeon-theme.webp", "./assets/images/themes/icons/adventure-theme.webp", "./assets/images/themes/characters/male-adventurer.webp", "./assets/images/themes/characters/female-adventurer.webp", "./assets/images/themes/icons/academy-theme.webp", "./assets/images/themes/characters/female-academy.webp", "./assets/images/themes/characters/male-academy.webp", "./assets/images/themes/icons/social-interactions-theme.webp", "./assets/images/themes/characters/male-social.webp", "./assets/images/themes/characters/female-social.webp", "./assets/images/themes/icons/relationships-theme.webp", "./assets/images/themes/characters/male-relationships.webp", "./assets/images/themes/characters/female-relationships.webp", "./assets/images/themes/icons/orthodox-theme.webp", "./assets/images/themes/backgrounds/orthodox-theme-background.webp", "./assets/images/themes/backgrounds/dungeon-background.webp", "./assets/images/themes/backgrounds/adventure-background.webp", "./assets/images/themes/backgrounds/academy-background.webp", "./assets/images/themes/backgrounds/social-interactions-background.webp", "./assets/images/themes/backgrounds/relationships-background.webp", "./assets/images/themes/characters/male-orthodox.webp", "./assets/images/themes/characters/female-orthodox.webp", "./assets/sound/dungeon-theme.mp3", "./assets/sound/adventure-theme.mp3", "./assets/sound/academy-theme.mp3", "./assets/sound/social-interactions-theme.mp3", "./assets/sound/relationships-theme.mp3", "./assets/sound/orthodox-theme.mp3", "./assets/sound/fitness-theme.mp3", "./assets/sound/cardio-theme.mp3", "./assets/sound/piano-theme.mp3", "./assets/images/themes/icons/fitness-theme.webp",
  "./assets/images/themes/backgrounds/fitness-background.webp",
  "./assets/images/themes/characters/male-fitness.webp",
  "./assets/images/themes/characters/female-fitness.webp",
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
