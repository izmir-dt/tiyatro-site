// Service worker: makes the app installable, caches the page shell (never Sheets data)
const CACHE = "hp-haftalik-v2"; // yalnızca "hp-haftalik-" ile başlayan önbelleklere dokunur
const SHELL = ["./", "index.html", "hp.webmanifest", "hp-icon-192.png", "hp-icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("hp-haftalik-") && k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Sheets backend always live
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const cp = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, cp));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((cs) => {
      for (const c of cs) if ("focus" in c) return c.focus();
      return self.clients.openWindow("./");
    })
  );
});
