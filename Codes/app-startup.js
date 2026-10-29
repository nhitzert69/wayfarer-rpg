// Wayfarer modular script segment. Keep load order in index.html.
// Keep the hosted PWA's service worker updated when a new version is deployed.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
      .then(function (registration) { return registration.update(); })
      .catch(function (error) { console.warn("Wayfarer offline cache update failed:", error); });
  });
}


// Curated quest generation: one random quest per selected skill.
