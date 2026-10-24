/* PWA + günlük sabah bildirimi eklentisi. Sayfanın items()/dayIso()/S fonksiyonlarını kullanır.
   Kural: Uygulama açılınca bildirim GELMEZ. Her sabah (08:00'den itibaren) o günün programı bir kez gelir.
   - Uygulama kapalıyken: hp-sw.js içindeki günlük arka plan kontrolü (Android Chrome, ana ekrana eklenmiş uygulama).
   - Uygulama 08:00'de açıksa: sayfa içi zamanlayıcı.
   Her iki yol da aynı "bugün gösterildi" kaydını kullanır; aynı gün ikinci kez bildirim gelmez. */
(function () {
  const MORNING_HOUR = 8;            // sabah bildirim saati
  const DATA_CACHE = "hp-notify-v1"; // hp-sw.js ile ortak
  const h = location.hostname;
  const preview = window.self !== window.top || /^(id-)?preview--/.test(h) || /lovableproject(-dev)?\.com$/.test(h) || /[?&]sw=off/.test(location.search);
  const scope = location.pathname.split("/").pop() || "./";

  let swReg = null;
  if ("serviceWorker" in navigator) {
    if (preview) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    else navigator.serviceWorker.register("hp-sw.js?v=2", { scope }).then((r) => { swReg = r; pushData(); setupPeriodic(); }).catch(() => {});
  }

  const LS = "hp_notify";
  const st = () => { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch (e) { return {}; } };
  const put = (o) => localStorage.setItem(LS, JSON.stringify(Object.assign(st(), o)));
  const isoOf = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const todayIso = () => isoOf(new Date());
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const enabled = () => "Notification" in window && Notification.permission === "granted" && !st().off;

  /* Kayıtlı tüm haftalardan, bugünden itibaren 14 günün bildirim metinlerini hazırla */
  function buildDays() {
    try {
      if (typeof items !== "function" || typeof dayIso !== "function" || typeof S === "undefined" || !S || !S.weeks) return null;
      const today = todayIso(), until = isoOf(new Date(Date.now() + 14 * 864e5)), out = {}, cur = S.cur;
      try {
        for (const k of Object.keys(S.weeks)) {
          const end = isoOf(new Date(new Date(k + "T00:00:00").getTime() + 6 * 864e5));
          if (end < today || k > until) continue;
          S.cur = k;
          let list;
          try { list = items().filter((i) => i.day >= 0 && (clean(i.task) || clean(i.people))); } catch (e) { continue; }
          for (let d = 0; d < 7; d++) {
            const iso = dayIso(d);
            if (iso < today || iso > until) continue;
            const di = list.filter((i) => i.day === d);
            out[iso] = di.length
              ? di.map((i) => [clean(i.time), clean(i.place), clean(i.task)].filter(Boolean).join(" · ") + (clean(i.people) ? " — " + clean(i.people) : "")).join("\n")
              : "Bugün için programda kayıt yok.";
          }
        }
      } finally { S.cur = cur; }
      return out;
    } catch (e) { return null; }
  }

  async function cacheGet(key) {
    try { const c = await caches.open(DATA_CACHE); const r = await c.match(key); return r ? await r.json() : null; } catch (e) { return null; }
  }
  async function cachePut(key, val) {
    try { const c = await caches.open(DATA_CACHE); await c.put(key, new Response(JSON.stringify(val), { headers: { "content-type": "application/json" } })); } catch (e) {}
  }

  /* Program verisini arka plan çalışanına bırak (bildirim GÖSTERMEZ) */
  async function pushData() {
    const days = buildDays();
    if (!days) return;
    const unit = (typeof UNIT !== "undefined" && UNIT && UNIT.name) || "";
    await cachePut("/__hp/data", { days, unit, hour: MORNING_HOUR, off: !enabled(), page: location.href.split("#")[0], saved: Date.now() });
  }

  async function setupPeriodic() {
    try {
      const reg = swReg || (await navigator.serviceWorker.getRegistration(scope));
      if (!reg || !("periodicSync" in reg) || !enabled()) return;
      const p = await navigator.permissions.query({ name: "periodic-background-sync" }).catch(() => null);
      if (p && p.state === "denied") return;
      await reg.periodicSync.register("hp-daily", { minInterval: 6 * 60 * 60 * 1000 });
    } catch (e) {}
  }

  async function show(title, body, tag) {
    const opt = { body, icon: "hp-icon-192.png", badge: "hp-icon-192.png", tag: tag || "hp-" + todayIso(), data: { url: location.href.split("#")[0] } };
    try { const r = swReg || (await navigator.serviceWorker.getRegistration(scope)); if (!r) throw 0; await r.showNotification(title, opt); }
    catch (e) { try { new Notification(title, opt); } catch (_) {} }
  }

  /* Sabah bildirimi: yalnızca sabah saati geldiğinde ve bugün henüz gösterilmediyse */
  async function morningNotify() {
    if (!enabled()) return;
    const t = todayIso();
    if ((await cacheGet("/__hp/shown")) === t || st().shown === t) return;
    const days = buildDays();
    if (!days || !days[t]) return;
    await cachePut("/__hp/shown", t); put({ shown: t });
    const d = new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
    show("Bugünün programı — " + d, days[t], "hp-" + t);
  }

  /* Uygulama açık kalırsa bir sonraki sabah saatinde tetikle (açılışta değil) */
  let morningT = null;
  function scheduleMorning() {
    clearTimeout(morningT);
    const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), MORNING_HOUR, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    morningT = setTimeout(() => { morningNotify(); scheduleMorning(); }, Math.min(next - now, 2147483000));
  }

  function btnLabel(b) {
    const p = "Notification" in window ? Notification.permission : "denied";
    const off = st().off;
    b.textContent = p === "granted" && !off ? "🔔 Bildirim açık" : p === "granted" && off ? "🔕 Bildirim kapalı" : p === "denied" ? "🔕 Bildirim engelli" : "🔔 Bildirimleri aç";
    b.title = p === "granted" && !off ? "Her sabah " + String(MORNING_HOUR).padStart(2, "0") + ":00'de o günün programı gelir. Kapatmak için dokunun" : "Her sabah o günün programını bildirim olarak almak için dokunun";
  }
  function refreshBtns() { document.querySelectorAll(".hpNotifyBtn").forEach(btnLabel); }

  function confirmOn() {
    show("Bildirimler açık", "Her sabah " + String(MORNING_HOUR).padStart(2, "0") + ":00'de o günün programı bildirim olarak gelecek.", "hp-on");
  }

  async function toggleNotify() {
    if (!("Notification" in window)) return alert("Bu tarayıcı bildirimleri desteklemiyor.");
    if (Notification.permission === "denied") return alert("Bildirimler tarayıcıdan engellenmiş. Chrome ayarlarında bu site için bildirimlere izin verin.");
    if (Notification.permission === "granted") {
      if (st().off) { put({ off: false }); refreshBtns(); pushData(); setupPeriodic(); confirmOn(); }   // tekrar aç
      else { put({ off: true }); refreshBtns(); pushData(); }                                          // kapat
      return;
    }
    const p = await Notification.requestPermission();
    if (p === "granted") { put({ off: false }); pushData(); setupPeriodic(); confirmOn(); }
    refreshBtns();
  }

  function makeBtn(id, cls) {
    const b = document.createElement("button");
    b.id = id; b.type = "button"; b.className = "hpNotifyBtn " + cls;
    btnLabel(b);
    b.onclick = toggleNotify;
    return b;
  }

  function addButton() {            // masaüstü: Araçlar'ın sağı
    const hd = document.querySelector("header.app");
    if (!hd || document.getElementById("hpNotifyBtn")) return;
    hd.appendChild(makeBtn("hpNotifyBtn", "btn sm"));
  }

  const isMobile = () => window.matchMedia("(max-width:760px)").matches;

  function addMobileButton() {      // telefon: üst başlıktaki durum satırının sağı; bulunamazsa yüzen buton
    if (!isMobile()) return;
    const root = document.getElementById("mobileApp");
    const row = root && (root.querySelector(".m-status") || root.querySelector(".m-header"));
    const fab = document.getElementById("hpNotifyFab");
    if (row) {
      if (fab) fab.remove();
      if (!row.querySelector(".hpNotifyBtnM")) row.appendChild(makeBtn("hpNotifyBtnM", "hpNotifyBtnM"));
    } else if (!fab && !document.querySelector(".hpNotifyBtnM")) {
      const b = makeBtn("hpNotifyFab", "hpNotifyBtnM hpFab");
      document.body.appendChild(b);
    }
  }

  (function () {
    const st0 = document.createElement("style");
    st0.textContent = ".hpNotifyBtnM{margin-left:auto;min-height:32px;padding:0 12px;border:1px solid var(--mobile-border,#ccd);border-radius:16px;background:var(--mobile-surface,#fff);color:var(--mobile-deep,#0e4a57);font:600 11px/1 inherit;white-space:nowrap;cursor:pointer}.hpFab{position:fixed;right:12px;bottom:84px;z-index:60;box-shadow:0 2px 10px rgba(0,0,0,.25);margin-left:0}";
    document.head.appendChild(st0);
  })();

  function watchMobile() {          // telefon ekranı her çizimde yenilendiği için butonu geri ekle
    addMobileButton();
    const root = document.getElementById("mobileApp");
    if (root) new MutationObserver(addMobileButton).observe(root, { childList: true, subtree: true });
    setInterval(addMobileButton, 3000);
    window.addEventListener("resize", addMobileButton);
  }

  window.addEventListener("load", () => {
    addButton();
    watchMobile();
    setTimeout(pushData, 4000);              // tablolardan veri gelince arka plana bırak (bildirim yok)
    setInterval(pushData, 5 * 60e3);         // program değiştikçe güncel tut (bildirim yok)
    scheduleMorning();                       // açık kalırsa sabah saatinde bildir
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { setTimeout(pushData, 3000); scheduleMorning(); } });
})();
