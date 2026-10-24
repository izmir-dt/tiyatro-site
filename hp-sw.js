/* Haftalık Program arka plan çalışanı: yalnızca sabah bildirimi.
   Sayfa, önümüzdeki günlerin program metnini "hp-notify-v1" önbelleğine bırakır.
   Tarayıcı günlük arka plan kontrolünü (periodicsync) çalıştırdığında, saat sabah saatini
   geçmişse ve bugün henüz gösterilmediyse o günün programı bir kez bildirilir. */
const DATA_CACHE = "hp-notify-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const isoOf = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

async function cacheGet(key) {
  try { const c = await caches.open(DATA_CACHE); const r = await c.match(key); return r ? await r.json() : null; } catch (e) { return null; }
}
async function cachePut(key, val) {
  const c = await caches.open(DATA_CACHE);
  await c.put(key, new Response(JSON.stringify(val), { headers: { "content-type": "application/json" } }));
}

async function morningNotify() {
  const data = await cacheGet("/__hp/data");
  if (!data || data.off || !data.days) return;
  const now = new Date(), t = isoOf(now);
  if (now.getHours() < (data.hour || 8)) return;          // sabah saatinden önce gösterme
  if ((await cacheGet("/__hp/shown")) === t) return;       // bugün zaten gösterildi
  const body = data.days[t];
  if (!body) return;                                       // bugünün programı kayıtlı değil
  await cachePut("/__hp/shown", t);
  const d = now.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
  await self.registration.showNotification("Bugünün programı — " + d, {
    body, icon: "hp-icon-192.png", badge: "hp-icon-192.png", tag: "hp-" + t, data: { url: data.page || self.registration.scope },
  });
}

self.addEventListener("periodicsync", (e) => { if (e.tag === "hp-daily") e.waitUntil(morningNotify()); });

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if ("focus" in c) { try { await c.focus(); return; } catch (_) {} } }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
