/* PWA + günlük bildirim eklentisi. Sayfanın items()/dayIso() fonksiyonlarını kullanır. */
(function () {
  const h = location.hostname;
  const preview = window.self !== window.top || /^(id-)?preview--/.test(h) || /lovableproject(-dev)?\.com$/.test(h) || /[?&]sw=off/.test(location.search);
  if ("serviceWorker" in navigator) {
    if (preview) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    else navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  const LS = "hp_notify";
  const st = () => { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch (e) { return {}; } };
  const put = (o) => localStorage.setItem(LS, JSON.stringify(Object.assign(st(), o)));
  const todayIso = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

  function todayItems() {
    try {
      if (typeof items !== "function" || typeof dayIso !== "function") return null;
      const t = todayIso();
      return items().filter((i) => i.day >= 0 && dayIso(i.day) === t && (clean(i.task) || clean(i.people)));
    } catch (e) { return null; }
  }

  async function show(title, body) {
    const opt = { body, icon: "icon-192.png", badge: "icon-192.png", tag: "hp-" + todayIso() };
    try { const r = await navigator.serviceWorker.getRegistration(); if (!r) throw 0; await r.showNotification(title, opt); }
    catch (e) { try { new Notification(title, opt); } catch (_) {} }
  }

  function check(force) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const list = todayItems();
    if (list == null) return;
    const body = list.length
      ? list.map((i) => [clean(i.time), clean(i.place), clean(i.task)].filter(Boolean).join(" · ") + (clean(i.people) ? " — " + clean(i.people) : "")).join("\n")
      : "Bugün için programda kayıt yok.";
    const sig = todayIso() + "|" + body;
    const s = st();
    if (!force && s.sig === sig) return;
    const first = !s.sig || !s.sig.startsWith(todayIso());
    put({ sig });
    const d = new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
    show((first || force ? "Bugünün programı — " : "Program güncellendi — ") + d, body);
  }

  function btnLabel(b) {
    const p = "Notification" in window ? Notification.permission : "denied";
    b.textContent = p === "granted" ? "🔔 Bildirim açık" : p === "denied" ? "🔕 Bildirim kapalı" : "🔔 Bildirimleri aç";
  }

  function addButton() {
    const h = document.querySelector("header.app");
    if (!h || document.getElementById("hpNotifyBtn")) return;
    const b = document.createElement("button");
    b.id = "hpNotifyBtn"; b.className = "btn sm";
    btnLabel(b);
    b.onclick = async () => {
      if (!("Notification" in window)) return alert("Bu tarayıcı bildirimleri desteklemiyor.");
      if (Notification.permission === "denied") return alert("Bildirimler engellenmiş. Chrome ayarlarından bu site için bildirimlere izin verin.");
      const p = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      btnLabel(b);
      if (p === "granted") check(true);
    };
    h.appendChild(b);
  }

  window.addEventListener("load", () => {
    addButton();
    setTimeout(() => check(false), 4000);       // Tablolardan veri gelsin
    setInterval(() => check(false), 5 * 60e3);   // açıkken 5 dk'da bir kontrol
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(() => check(false), 3000); });
})();
