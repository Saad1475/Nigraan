/* Nigraan Service Worker for Android APK Standalone Mode */

const CACHE_NAME = "nigraan-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/auth-service.js",
  "./js/firebase-service.js",
  "./js/seed-data.js",
  "./js/ai-engine.js",
  "./js/student-voice.js",
  "./js/digital-twin.js",
  "./js/ustaad-ai.js",
  "./js/simulator.js",
  "./js/recovery-plan.js",
  "./js/app.js",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => {
    return Promise.all(keys.map((key) => {
      if (key !== CACHE_NAME) return caches.delete(key);
    }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});
