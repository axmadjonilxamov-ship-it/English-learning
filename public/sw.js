// Oddiy servis-ishchi: internet yo'q bo'lsa, oxirgi ko'rilgan sahifalarni ko'rsatadi.
const CACHE = "elc-v1";
const OFFLINE = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE, "/manifest.webmanifest", "/logo.svg"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // API so'rovlari doim tarmoqdan olinadi — natijalar eskirmasin.
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      })
      .catch(async () => (await caches.match(request)) ?? (await caches.match(OFFLINE)) ?? Response.error()),
  );
});
