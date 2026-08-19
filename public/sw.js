// Minimal service worker: makes NexApp installable and gives a graceful
// offline fallback. It does NOT try to cache Supabase data or dynamic
// pages — those always need a network round trip — it only precaches the
// static app shell (icons, manifest, offline page) and falls back to the
// offline page for navigations when the network is unreachable.

const CACHE_NAME = "nexapp-shell-v1";
const SHELL_ASSETS = [
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle page navigations specially; let every other request
  // (API calls, Supabase, images, etc.) go straight to the network as
  // normal so nothing gets served stale.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html"))
    );
  }
});
