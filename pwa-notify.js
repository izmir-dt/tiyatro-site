/* PWA + günlük bildirim eklentisi. Sayfanın items()/dayIso() fonksiyonlarını kullanır. */
(function () {
  const h = location.hostname;
  const preview = window.self !== window.top || /^(id-)?preview--/.test(h) || /lovableproject(-dev)?\.com$/.test(h) || /[?&]sw=off/.test(location.search);
  if ("serviceWorker" in navigator) {
    if (preview) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    else navigator.serviceWorker.register("hp-sw.js", { scope: "./HAFTALIK_PROGRAM.html" }).catch(() => {});
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
    const opt = { body, icon: "hp-icon-192.png", badge: "hp-icon-192.png", tag: "hp-" + todayIso() };
    try { const r = await navigator.serviceWorker.getRegistration(); if (!r) throw 0; await r.showNotification(title, opt); }
    catch (e) { try { new Notification(title, opt); } catch (_) {} }
  }

  function check(force) {
    if (!("Notification" in window) || Notification.permission !== "granted" || st().off) return;
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
    const off = st().off;
    b.textContent = p === "granted" && !off ? "🔔 Bildirim açık" : p === "granted" && off ? "🔕 Bildirim kapalı" : p === "denied" ? "🔕 Bildirim engelli" : "🔔 Bildirimleri aç";
    b.title = p === "granted" && !off ? "Bildirimleri kapatmak için dokunun" : "Bildirimleri açmak için dokunun";
  }
  function refreshBtns() { document.querySelectorAll(".hpNotifyBtn").forEach(btnLabel); }

  async function toggleNotify() {
    if (!("Notification" in window)) return alert("Bu tarayıcı bildirimleri desteklemiyor.");
    if (Notification.permission === "denied") return alert("Bildirimler tarayıcıdan engellenmiş. Chrome ayarlarında bu site için bildirimlere izin verin.");
    if (Notification.permission === "granted") {
      if (st().off) { put({ off: false }); refreshBtns(); check(true); }   // tekrar aç
      else { put({ off: true }); refreshBtns(); }                          // kapat
      return;
    }
    const p = await Notification.requestPermission();
    if (p === "granted") put({ off: false });
    refreshBtns();
    if (p === "granted") check(true);
  }

  function makeBtn(id, cls) {
    const b = document.createElement("button");
    b.id = id; b.type = "button"; b.className = "hpNotifyBtn " + cls;
    btnLabel(b);
    b.onclick = toggleNotify;
    return b;
  }

  function addButton() {            // masaüstü: Araçlar'ın sağı
    const h = document.querySelector("header.app");
    if (!h || document.getElementById("hpNotifyBtn")) return;
    h.appendChild(makeBtn("hpNotifyBtn", "btn sm"));
  }

  function addMobileButton() {      // telefon: üst başlıktaki durum satırının sağı
    const row = document.querySelector("#mobileApp .m-status");
    if (!row || row.querySelector(".hpNotifyBtnM")) return;
    const b = makeBtn("hpNotifyBtnM", "hpNotifyBtnM");
    row.appendChild(b);
  }

  (function () {
    const st0 = document.createElement("style");
    st0.textContent = ".hpNotifyBtnM{margin-left:auto;min-height:32px;padding:0 12px;border:1px solid var(--mobile-border,#ccd);border-radius:16px;background:var(--mobile-surface,#fff);color:var(--mobile-deep,#0e4a57);font:600 11px/1 inherit;white-space:nowrap;cursor:pointer}";
    document.head.appendChild(st0);
  })();

  function watchMobile() {          // telefon ekranı her çizimde yenilendiği için butonu geri ekle
    const root = document.getElementById("mobileApp");
    if (!root) return setTimeout(watchMobile, 500);
    addMobileButton();
    new MutationObserver(addMobileButton).observe(root, { childList: true, subtree: true });
  }

  window.addEventListener("load", () => {
    addButton();
    watchMobile();
    setTimeout(() => check(false), 4000);       // Tablolardan veri gelsin
    setInterval(() => check(false), 5 * 60e3);   // açıkken 5 dk'da bir kontrol
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(() => check(false), 3000); });
})();
