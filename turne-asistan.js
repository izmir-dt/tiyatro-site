/* ════════════════════════════════════════════════════════════════
   TURNE ASİSTANI — Kural tabanlı, %100 ücretsiz widget
   İzmir Devlet Tiyatrosu · Tek dosya, hiçbir API anahtarı gerekmez
   Kullanım:  <script src="./turne-asistan.js"></script>
   v2.1 — Sürüklenebilir, yeniden boyutlandırılabilir, vişne teması
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.__turneAsistanLoaded) return;
  window.__turneAsistanLoaded = true;

  const API = "https://turne-backend.vercel.app/api/sheets";
  const TURNE_SHEET = "TURNE_KAYITLARI";
  const PERSONEL_SHEET = "TURNE_PERSONEL";

  // İstatistik sayfasının URL'si — aynı dizinde olduğu varsayılır
  const ISTATISTIK_URL = "./istatistik.html";

  // ───────────────────── STYLES ─────────────────────
  const css = `
  #ta-fab{position:fixed;bottom:24px;right:24px;z-index:9500;width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;box-shadow:0 6px 20px rgba(107,14,30,.45),0 2px 8px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;transition:transform .15s,box-shadow .2s;animation:taPulse 3s ease-in-out infinite;}
  #ta-fab:hover{transform:scale(1.08);box-shadow:0 8px 28px rgba(107,14,30,.6);}
  #ta-fab:active{transform:scale(.94);}
  @keyframes taPulse{0%,100%{box-shadow:0 6px 20px rgba(107,14,30,.45),0 0 0 0 rgba(160,25,46,.4);}50%{box-shadow:0 6px 24px rgba(107,14,30,.6),0 0 0 10px rgba(160,25,46,0);}}

  #ta-panel{position:fixed;right:24px;bottom:90px;z-index:9501;width:420px;max-width:calc(100vw - 32px);height:620px;max-height:calc(100vh - 120px);background:#FBF8F3;border:1px solid #E8E2D7;border-radius:18px;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(20,12,4,.22),0 4px 16px rgba(20,12,4,.12);opacity:0;pointer-events:none;transform:translateY(16px) scale(.97);transition:opacity .22s,transform .22s;overflow:hidden;font-family:'Inter','DM Sans',system-ui,sans-serif;min-width:300px;min-height:400px;}
  #ta-panel.open{opacity:1;pointer-events:all;transform:none;}
  #ta-panel.dragging{transition:none;user-select:none;}
  #ta-panel.resizing{transition:none;user-select:none;}

  /* Resize handle — sağ alt köşe */
  #ta-resize{position:absolute;right:0;bottom:0;width:18px;height:18px;cursor:se-resize;z-index:10;display:flex;align-items:flex-end;justify-content:flex-end;padding:4px;}
  #ta-resize svg{opacity:.35;transition:opacity .15s;}
  #ta-resize:hover svg{opacity:.7;}

  /* Başlık — sürükleme tutacağı */
  #ta-head{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.15);display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#A0192E 0%,#6B0E1E 100%);color:#fff;flex-shrink:0;cursor:grab;user-select:none;border-radius:18px 18px 0 0;}
  #ta-head:active{cursor:grabbing;}

  /* Logo — sitenin kare logosu */
  #ta-head .ta-logo{width:32px;height:32px;border-radius:8px;overflow:hidden;flex-shrink:0;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;}
  #ta-head .ta-logo img{width:100%;height:100%;object-fit:cover;border-radius:8px;}
  #ta-head .ta-logo-fallback{font-weight:900;font-size:10px;letter-spacing:.5px;color:#fff;}

  #ta-head .ta-title{flex:1;font-size:14px;font-weight:800;line-height:1.1;}
  #ta-head .ta-sub{font-size:10.5px;font-weight:500;opacity:.85;margin-top:2px;}

  /* Başlık sağ butonlar */
  .ta-head-btns{display:flex;align-items:center;gap:5px;}
  .ta-hbtn{width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0;}
  .ta-hbtn:hover{background:rgba(255,255,255,.25);}
  .ta-hbtn.stat-btn{font-size:11px;font-weight:700;width:auto;padding:0 8px;gap:4px;letter-spacing:.3px;}

  #ta-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#FBF8F3;}
  .ta-msg{max-width:90%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word;}
  .ta-msg.user{align-self:flex-end;background:#A0192E;color:#fff;border-bottom-right-radius:4px;}
  .ta-msg.bot{align-self:flex-start;background:#fff;color:#1A1A1A;border:1px solid #E8E2D7;border-bottom-left-radius:4px;}
  .ta-msg.bot strong{color:#A0192E;font-weight:700;}
  .ta-typing{display:inline-flex;gap:4px;padding:8px 0;}
  .ta-typing span{width:6px;height:6px;border-radius:50%;background:#A0192E;animation:taDot 1.2s infinite;}
  .ta-typing span:nth-child(2){animation-delay:.15s;} .ta-typing span:nth-child(3){animation-delay:.3s;}
  @keyframes taDot{0%,60%,100%{opacity:.3;transform:translateY(0);}30%{opacity:1;transform:translateY(-4px);}}
  #ta-sugs{padding:0 16px 8px;display:flex;flex-wrap:wrap;gap:6px;}
  .ta-sug{font-size:11.5px;padding:6px 10px;border:1px solid #E8E2D7;background:#fff;border-radius:999px;cursor:pointer;color:#4A4A4A;transition:all .15s;}
  .ta-sug:hover{border-color:#A0192E;color:#A0192E;background:#FBE8EB;}
  #ta-form{padding:12px 14px;border-top:1px solid #E8E2D7;display:flex;gap:8px;background:#fff;flex-shrink:0;}
  #ta-input{flex:1;border:1px solid #E8E2D7;border-radius:12px;padding:9px 12px;font-size:13px;outline:none;font-family:inherit;background:#FBF8F3;resize:none;max-height:90px;}
  #ta-input:focus{border-color:#A0192E;background:#fff;box-shadow:0 0 0 3px rgba(160,25,46,.12);}
  #ta-send{width:38px;height:38px;border:none;border-radius:11px;background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .1s;}
  #ta-send:hover{transform:scale(1.05);} #ta-send:disabled{opacity:.4;cursor:not-allowed;transform:none;}
  #ta-foot{font-size:10px;text-align:center;color:#8A857C;padding:6px 12px 10px;background:#fff;}
  @media(max-width:600px){#ta-panel{width:calc(100vw - 16px);right:8px;bottom:80px;height:calc(100vh - 100px);} #ta-fab{bottom:16px;right:16px;width:50px;height:50px;}}
  `;
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ───────────────────── DOM ─────────────────────
  // Logo URL — İzmir DT favicon / logo
  const LOGO_URL = "https://izmir-dt.github.io/tiyatro-site/tiyatro-site/favicon.png";

  const root = document.createElement("div");
  root.innerHTML = `
    <button id="ta-fab" title="Turne Asistanı" aria-label="Turne Asistanı">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
      </svg>
    </button>
    <div id="ta-panel" role="dialog" aria-label="Turne Asistanı">
      <div id="ta-head">
        <div class="ta-logo">
          <img src="${LOGO_URL}" alt="İDT" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
          <span class="ta-logo-fallback" style="display:none">İDT</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div class="ta-title">Turne Asistanı</div>
          <div class="ta-sub" id="ta-status">Yükleniyor…</div>
        </div>
        <div class="ta-head-btns">
          <button class="ta-hbtn stat-btn" id="ta-stat-btn" title="İstatistik sayfasına git" aria-label="İstatistik">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            İSTATİSTİK
          </button>
          <button class="ta-hbtn" id="ta-close" aria-label="Kapat">×</button>
        </div>
      </div>
      <div id="ta-msgs"></div>
      <div id="ta-sugs"></div>
      <div id="ta-form" style="padding:12px 14px;border-top:1px solid #E8E2D7;display:flex;gap:8px;background:#fff;flex-shrink:0;">
        <textarea id="ta-input" rows="1" placeholder="Turne verisi hakkında soru sorun…" autocomplete="off"></textarea>
        <button id="ta-send" aria-label="Gönder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div id="ta-foot">Kural tabanlı · LLM kullanılmaz · %100 ücretsiz</div>
      <div id="ta-resize" title="Boyutu değiştir">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="#6B0E1E" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const $ = (id) => document.getElementById(id);
  const panel = $("ta-panel"), msgs = $("ta-msgs"), sugs = $("ta-sugs");
  const input = $("ta-input"), send = $("ta-send"), status = $("ta-status");
  const head = $("ta-head"), resizeHandle = $("ta-resize");

  // ───────────────────── EVENTS ─────────────────────
  $("ta-fab").addEventListener("click", () => togglePanel(true));
  $("ta-close").addEventListener("click", () => togglePanel(false));
  $("ta-stat-btn").addEventListener("click", () => {
    window.open(ISTATISTIK_URL, "_blank");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) togglePanel(false);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); togglePanel(!panel.classList.contains("open")); }
  });
  $("ta-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input.value); }
  });
  $("ta-send").addEventListener("click", () => submit(input.value));
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 90) + "px"; });

  function togglePanel(open) {
    panel.classList.toggle("open", open);
    if (open) setTimeout(() => input.focus(), 250);
  }

  // ───────────────────── SÜRÜKLEME (DRAG) ─────────────────────
  let dragState = null;

  head.addEventListener("mousedown", (e) => {
    if (e.target.closest(".ta-hbtn")) return; // butonlara tıklayınca sürükleme başlamasın
    e.preventDefault();
    const rect = panel.getBoundingClientRect();
    // Panel fixed pozisyonunu hesapla
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      origRight: window.innerWidth - rect.right,
      origBottom: window.innerHeight - rect.bottom,
    };
    panel.classList.add("dragging");
    panel.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const newRight = Math.max(0, Math.min(window.innerWidth - 60, dragState.origRight - dx));
    const newBottom = Math.max(0, Math.min(window.innerHeight - 60, dragState.origBottom - dy));
    panel.style.right = newRight + "px";
    panel.style.bottom = newBottom + "px";
  });

  document.addEventListener("mouseup", () => {
    if (dragState) {
      dragState = null;
      panel.classList.remove("dragging");
    }
    if (resizeState) {
      resizeState = null;
      panel.classList.remove("resizing");
    }
  });

  // Touch desteği — sürükleme
  head.addEventListener("touchstart", (e) => {
    if (e.target.closest(".ta-hbtn")) return;
    const touch = e.touches[0];
    const rect = panel.getBoundingClientRect();
    dragState = {
      startX: touch.clientX,
      startY: touch.clientY,
      origRight: window.innerWidth - rect.right,
      origBottom: window.innerHeight - rect.bottom,
    };
    panel.classList.add("dragging");
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!dragState) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    const newRight = Math.max(0, Math.min(window.innerWidth - 60, dragState.origRight - dx));
    const newBottom = Math.max(0, Math.min(window.innerHeight - 60, dragState.origBottom - dy));
    panel.style.right = newRight + "px";
    panel.style.bottom = newBottom + "px";
  }, { passive: true });

  document.addEventListener("touchend", () => {
    dragState = null;
    panel.classList.remove("dragging");
  });

  // ───────────────────── YENİDEN BOYUTLANDIRMA (RESIZE) ─────────────────────
  let resizeState = null;

  resizeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = panel.getBoundingClientRect();
    resizeState = {
      startX: e.clientX,
      startY: e.clientY,
      origWidth: rect.width,
      origHeight: rect.height,
    };
    panel.classList.add("resizing");
  });

  document.addEventListener("mousemove", (e) => {
    if (!resizeState) return;
    const dx = e.clientX - resizeState.startX;
    const dy = e.clientY - resizeState.startY;
    const newW = Math.max(300, Math.min(window.innerWidth - 40, resizeState.origWidth + dx));
    const newH = Math.max(400, Math.min(window.innerHeight - 80, resizeState.origHeight + dy));
    panel.style.width = newW + "px";
    panel.style.height = newH + "px";
  });

  // ───────────────────── DATA ─────────────────────
  const norm = (s) => (s || "").toLocaleLowerCase("tr").replace(/i̇/g, "i").replace(/\s+/g, " ").trim();
  let DS = null;

  async function fetchSheet(name) {
    const r = await fetch(`${API}/${encodeURIComponent(name)}`);
    if (!r.ok) throw new Error(`${name} alınamadı (HTTP ${r.status})`);
    return r.json();
  }

  function parseTurneler(data) {
    const rows = data.rows || [];
    const h = (data.headers || []).map((x) => (x || "").trim().toLowerCase());
    const find = (pred, fb) => { const i = h.findIndex(pred); return i >= 0 ? i : fb; };
    const iOyun = find((x) => x.startsWith("oyun"), 0);
    const iIl = find((x) => x === "il" || x.startsWith("şehir") || x.startsWith("sehir"), 1);
    const iBas = find((x) => x.startsWith("başla") || x.startsWith("basla"), 2);
    const iBit = find((x) => x.startsWith("biti"), 3);
    const iSay = find((x) => x.startsWith("temsil") || x.startsWith("sayı") || x.startsWith("sayi"), 5);
    const iStat = find((x) => x.startsWith("stat"), 7);
    const iDur = find((x) => (x.startsWith("durak") && x.includes("json")) || x === "duraklar", 19);
    let iAna = h.findIndex((x) => x.startsWith("anagrup") || x === "ana_grup_id" || x === "anagrupid");
    if (iAna < 0) iAna = 42;
    return rows.map((r) => {
      if (!r || !Array.isArray(r)) return null;
      const oyun = (r[iOyun] || "").trim();
      if (!oyun || oyun === "Oyun Adı" || oyun === "ID") return null;
      const bas = (r[iBas] || "").trim();
      const bit = (r[iBit] || "").trim() || bas;
      const il = (r[iIl] || "").trim();
      const sayi = parseInt(r[iSay]) || 1;
      const statu = (r[iStat] || "taslak").trim().toLowerCase().replace(/\s+/g, "-");
      let duraklar = []; try { const dj = (r[iDur] || "").trim(); if (dj) duraklar = JSON.parse(dj); } catch (e) {}
      const anaGrupId = (r[iAna] || "").toString().trim();
      return { oyun, il, baslangic: bas, bitis: bit, sayi, statu, duraklar, katilimcilar: [], anaGrupId };
    }).filter((t) => t && !t.anaGrupId);
  }

  function parsePersonel(data) {
    const rows = data.rows || [];
    const h = (data.headers || []).map((x) => (x || "").trim().toLowerCase());
    const iOyun = h.findIndex((x) => x.startsWith("oyun"));
    const iKat = h.findIndex((x) => x.startsWith("kategori"));
    const iGor = h.findIndex((x) => x.startsWith("görev") || x.startsWith("gorev"));
    const iKisi = h.findIndex((x) => x.startsWith("kişi") || x.startsWith("kisi"));
    const out = [];
    for (const r of rows) {
      const oyun = (r[iOyun >= 0 ? iOyun : 0] || "").trim();
      const kat = (r[iKat >= 0 ? iKat : 1] || "").trim();
      const gor = (r[iGor >= 0 ? iGor : 2] || "").trim();
      const raw = (r[iKisi >= 0 ? iKisi : 3] || "").trim();
      if (!oyun || !raw) continue;
      const names = []; let depth = 0, cur = "";
      for (const ch of raw) {
        if (ch === "(") { depth++; cur += ch; }
        else if (ch === ")") { depth--; cur += ch; }
        else if (ch === "," && depth === 0) { if (cur.trim()) names.push(cur.trim()); cur = ""; }
        else cur += ch;
      }
      if (cur.trim()) names.push(cur.trim());
      for (let k of names) {
        let ge = gor;
        const m = k.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
        if (m) { k = m[1].trim(); ge = m[2].trim(); }
        if (k) out.push({ oyun, kategori: kat, gorev: ge, kisi: k });
      }
    }
    return out;
  }

  function attachKatilimcilar(turneler, personel) {
    for (const t of turneler) {
      const oyunlar = [];
      if (t.duraklar) for (const d of t.duraklar) if (d.oyun && d.oyun.trim()) oyunlar.push(d.oyun.trim());
      if (!oyunlar.length && t.oyun) for (const o of t.oyun.split("/")) { const x = o.trim(); if (x) oyunlar.push(x); }
      const oN = oyunlar.map(norm);
      const map = new Map();
      for (const p of personel) {
        const pN = norm(p.oyun);
        let m = oN.some((o) => o === pN);
        if (!m && t.oyun) { const tN = norm(t.oyun); m = tN === pN || tN.split("/").map(norm).some((x) => x === pN); }
        if (m && !map.has(p.kisi.toLowerCase())) map.set(p.kisi.toLowerCase(), { kisi: p.kisi, gorev: p.gorev, kategori: p.kategori });
      }
      t.katilimcilar = Array.from(map.values());
    }
  }

  async function loadData() {
    status.textContent = "Yükleniyor…";
    try {
      const [t, p] = await Promise.all([fetchSheet(TURNE_SHEET), fetchSheet(PERSONEL_SHEET)]);
      const turneler = parseTurneler(t);
      const personel = parsePersonel(p);
      attachKatilimcilar(turneler, personel);
      DS = { turneler, personel };
      const cities = new Set(); const ppl = new Set();
      for (const t of turneler) { if (t.il) cities.add(t.il); for (const d of t.duraklar || []) if (d.il) cities.add(d.il); for (const k of t.katilimcilar) ppl.add(k.kisi.toLowerCase()); }
      status.textContent = `${turneler.length} turne · ${cities.size} şehir · ${ppl.size} personel`;
    } catch (e) {
      status.textContent = "Bağlantı hatası";
      addMsg("⚠️ Veri alınamadı: " + e.message, "bot");
    }
  }

  // ───────────────────── ANSWER ENGINE ─────────────────────
  const MONTHS = ["ocak","şubat","mart","nisan","mayıs","haziran","temmuz","ağustos","eylül","ekim","kasım","aralık"];
  const STATU = { "tamamlandı":["tamamlan","biten","bitmiş"], "taslak":["taslak","planlanan"], "iptal":["iptal"], "yarıda-kesildi":["yarıda","kesild"] };

  function parseDate(s) {
    if (!s) return null;
    let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    return null;
  }
  function turneGun(t) {
    const a = parseDate(t.baslangic), b = parseDate(t.bitis) || a;
    if (!a || !b) return 1;
    return Math.max(1, Math.round((b - a) / 86400000) + 1);
  }

  function answer(q, ds) {
    const Q = norm(q), T = ds.turneler;
    let scope = T;
    for (const [s, keys] of Object.entries(STATU)) if (keys.some((k) => Q.includes(k))) { scope = T.filter((t) => t.statu.startsWith(s)); break; }
    const ym = Q.match(/\b(20\d{2})\b/);
    if (ym) { const y = +ym[1]; scope = scope.filter((t) => { const d = parseDate(t.baslangic); return d && d.getFullYear() === y; }); }
    const mi = MONTHS.findIndex((m) => Q.includes(m));
    if (mi >= 0) scope = scope.filter((t) => { const d = parseDate(t.baslangic); return d && d.getMonth() === mi; });

    if (/(en\s*(fazla|cok|çok)).*(kişi|kisi|personel|giden|katilan|katılan)/.test(Q)) {
      const c = new Map();
      for (const t of scope) for (const k of t.katilimcilar) c.set(k.kisi, (c.get(k.kisi) || 0) + 1);
      const top = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      return top.length ? "En fazla turneye giden kişiler:\n\n" + top.map(([k, n], i) => `${i + 1}. **${k}** — ${n} turne`).join("\n") : "Kayıt bulunamadı.";
    }
    if (/(en\s*(fazla|cok|çok)).*(gün|gun).*(yolda|turne)/.test(Q) || /yolda.*kim/.test(Q)) {
      const d = new Map(); for (const t of scope) { const g = turneGun(t); for (const k of t.katilimcilar) d.set(k.kisi, (d.get(k.kisi) || 0) + g); }
      const top = [...d.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      return top.length ? "En çok gün yolda olan kişiler:\n\n" + top.map(([k, g], i) => `${i + 1}. **${k}** — ${g} gün`).join("\n") : "Veri bulunamadı.";
    }
    if (/(toplam|kac|kaç).*(personel|kişi|kisi)/.test(Q)) {
      const s = new Set(); for (const t of scope) for (const k of t.katilimcilar) s.add(k.kisi.toLowerCase());
      return `Toplam **${s.size}** farklı personel turneye çıktı.`;
    }
    if (/(görev|gorev|kategori).*(kalabalık|kalabalik|en\s*cok|en\s*çok|en\s*fazla)/.test(Q)) {
      const c = new Map(); for (const t of scope) for (const k of t.katilimcilar) { const g = k.kategori || k.gorev || "Diğer"; if (!c.has(g)) c.set(g, new Set()); c.get(g).add(k.kisi.toLowerCase()); }
      const top = [...c.entries()].map(([g, s]) => [g, s.size]).sort((a, b) => b[1] - a[1]);
      return top.length ? "Görev grupları (personel sayısına göre):\n\n" + top.map(([g, n], i) => `${i + 1}. **${g}** — ${n} kişi`).join("\n") : "Veri yok.";
    }
    if (/(hangi\s*ay|en\s*yoğun|en\s*yogun|aylık)/.test(Q)) {
      const c = new Array(12).fill(0); for (const t of scope) { const d = parseDate(t.baslangic); if (d) c[d.getMonth()]++; }
      const r = c.map((n, i) => ({ ay: MONTHS[i], n })).sort((a, b) => b.n - a.n).slice(0, 3).filter((x) => x.n > 0);
      return r.length ? "En yoğun aylar:\n\n" + r.map((x, i) => `${i + 1}. **${x.ay[0].toUpperCase() + x.ay.slice(1)}** — ${x.n} turne`).join("\n") : "Veri yok.";
    }
    if (/(şehir|sehir|il)/.test(Q) && /(en\s*cok|en\s*çok|en\s*fazla|kac|kaç)/.test(Q)) {
      const c = new Map();
      for (const t of scope) { const ill = new Set(); if (t.il) ill.add(t.il); for (const d of t.duraklar || []) if (d.il) ill.add(d.il); for (const il of ill) c.set(il, (c.get(il) || 0) + 1); }
      if (/kac|kaç/.test(Q)) return `Toplam **${c.size}** farklı şehre gidildi.`;
      const top = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      return "En çok gidilen şehirler:\n\n" + top.map(([s, n], i) => `${i + 1}. **${s}** — ${n} turne`).join("\n");
    }
    if (/(toplam|kac|kaç).*(turne)/.test(Q)) {
      const g = scope.reduce((s, t) => s + turneGun(t), 0);
      const tm = scope.reduce((s, t) => s + (t.sayi || 0), 0);
      return `Bu kapsamda **${scope.length}** turne, **${g}** gün, **${tm}** temsil bulundu.`;
    }
    // Person lookup — önce tam ad eşleşmesi, sonra parça eşleşmesi
    const names = new Set(); for (const t of T) for (const k of t.katilimcilar) names.add(k.kisi);
    let found = null;
    // Tam ad eşleşmesi (normalize edilmiş)
    for (const n of names) { const nN = norm(n); if (nN.split(" ").length >= 2 && Q.includes(nN)) { found = n; break; } }
    // Parça eşleşmesi — en az 4 karakter olan kelimelerle
    if (!found) for (const n of names) { const parts = norm(n).split(" ").filter((p) => p.length >= 4); if (parts.some((p) => Q.includes(p))) { found = n; break; } }
    if (found) {
      // Sadece gerçekten katılımcı olarak listelendiği turneleri göster
      const list = T.filter((t) => t.katilimcilar.some((k) => norm(k.kisi) === norm(found)));
      if (list.length === 0) {
        return `**${found}** adlı kişi hiçbir turneye katılmamış olarak görünüyor. Lütfen veri sayfasını kontrol edin.`;
      }
      const gun = list.reduce((s, t) => s + turneGun(t), 0);
      const lines = list.sort((a, b) => (parseDate(b.baslangic) || 0) - (parseDate(a.baslangic) || 0)).slice(0, 15)
        .map((t) => `• ${t.baslangic || "—"} · **${t.oyun}** · ${t.il || "—"} (${t.statu})`).join("\n");
      return `**${found}** — ${list.length} turne, toplam ${gun} gün yolda\n\n` + (lines || "Kayıt yok.");
    }
    // City lookup
    const cities = new Set(); for (const t of T) { if (t.il) cities.add(t.il); for (const d of t.duraklar || []) if (d.il) cities.add(d.il); }
    for (const c of cities) {
      if (norm(c).length >= 4 && Q.includes(norm(c))) {
        const list = T.filter((t) => t.il === c || (t.duraklar || []).some((d) => d.il === c));
        return `**${c}** şehrine **${list.length}** turne yapıldı.\n\n` + list.slice(0, 10).map((t) => `• ${t.baslangic || "—"} · ${t.oyun} (${t.statu})`).join("\n");
      }
    }
    return "Bu soruyu tam çözemedim 🤔\n\nÖrnekler:\n• \"En fazla turneye giden kişi?\"\n• \"En çok gün yolda olan kimler?\"\n• \"Hangi ay en yoğun?\"\n• \"Hangi görev grubu en kalabalık?\"\n• \"En çok gidilen şehirler?\"\n• Bir kişi adı veya şehir adı\n• \"2026 yılında kaç turne?\"";
  }

  // ───────────────────── UI ─────────────────────
  function fmt(text) {
    const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }
  function addMsg(text, who) {
    const el = document.createElement("div");
    el.className = "ta-msg " + (who === "user" ? "user" : "bot");
    el.innerHTML = fmt(text);
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }
  function addTyping() {
    const el = document.createElement("div");
    el.className = "ta-msg bot";
    el.innerHTML = '<div class="ta-typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function submit(text) {
    const q = (text || "").trim();
    if (!q) return;
    if (!DS) { addMsg("Veriler henüz yüklenmedi, biraz bekleyin…", "bot"); return; }
    addMsg(q, "user");
    input.value = ""; input.style.height = "auto";
    sugs.style.display = "none";
    const typing = addTyping();
    setTimeout(() => {
      typing.remove();
      addMsg(answer(q, DS), "bot");
    }, 220);
  }

  // Welcome + suggestions
  addMsg("👋 Merhaba! Ben **Turne Asistanı**'yım.\n\nTurne verileriniz hakkında sorularınızı yanıtlarım — kişiler, şehirler, görevler, tarihler. Tamamen ücretsiz ve sınırsız.\n\n📊 İstatistik sayfasına geçmek için sağ üstteki **İSTATİSTİK** butonunu kullanabilirsiniz.", "bot");
  const SUGS = ["En fazla turneye giden kişi?", "En çok gün yolda olan kimler?", "Hangi ay en yoğun?", "Hangi görev grubu en kalabalık?", "En çok gidilen şehirler?", "Toplam kaç personel turneye çıktı?"];
  for (const s of SUGS) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "ta-sug"; b.textContent = s;
    b.addEventListener("click", () => submit(s));
    sugs.appendChild(b);
  }

  loadData();
})();
