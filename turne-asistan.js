/* ════════════════════════════════════════════════════════════════
   TURNE ASİSTANI v3.0 — Akıllı, Kural tabanlı, %100 ücretsiz
   İzmir Devlet Tiyatrosu
   - Katılımcılar JSON'undan doğru kişi sayımı
   - Otel / firma numaraları
   - Türkçe tarih formatı (05 Haziran 2026)
   - Sürüklenebilir & yeniden boyutlandırılabilir panel
   - Vişne rengi tema · Site logosu
   - Karşılama mesajı kapatılabilir
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.__turneAsistanLoaded) return;
  window.__turneAsistanLoaded = true;

  const API = "https://turne-backend.vercel.app/api/sheets";
  const TURNE_SHEET = "TURNE_KAYITLARI";
  const ISTATISTIK_URL = "./istatistik.html";
  const LOGO_URL = "https://izmir-dt.github.io/tiyatro-site/tiyatro-site/favicon.png";

  /* ─── CSS ─── */
  const css = `
  #ta-fab{position:fixed;bottom:24px;right:24px;z-index:9500;width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;
    box-shadow:0 6px 20px rgba(107,14,30,.45),0 2px 8px rgba(0,0,0,.2);
    display:flex;align-items:center;justify-content:center;transition:transform .15s,box-shadow .2s;animation:taPulse 3s ease-in-out infinite;}
  #ta-fab:hover{transform:scale(1.08);box-shadow:0 8px 28px rgba(107,14,30,.6);}
  #ta-fab:active{transform:scale(.94);}
  @keyframes taPulse{0%,100%{box-shadow:0 6px 20px rgba(107,14,30,.45),0 0 0 0 rgba(160,25,46,.4);}
                     50%{box-shadow:0 6px 24px rgba(107,14,30,.6),0 0 0 10px rgba(160,25,46,0);}}

  #ta-panel{position:fixed;right:24px;bottom:90px;z-index:9501;
    width:430px;max-width:calc(100vw - 32px);height:640px;max-height:calc(100vh - 120px);
    background:#FBF8F3;border:1px solid #E0D5CC;border-radius:18px;
    display:flex;flex-direction:column;
    box-shadow:0 28px 70px rgba(20,8,4,.24),0 4px 16px rgba(20,8,4,.12);
    opacity:0;pointer-events:none;transform:translateY(16px) scale(.97);
    transition:opacity .22s,transform .22s;overflow:hidden;
    font-family:'Inter','DM Sans',system-ui,sans-serif;min-width:300px;min-height:420px;}
  #ta-panel.open{opacity:1;pointer-events:all;transform:none;}
  #ta-panel.dragging,#ta-panel.resizing{transition:none;user-select:none;}

  #ta-resize{position:absolute;right:0;bottom:0;width:20px;height:20px;cursor:se-resize;z-index:10;
    display:flex;align-items:flex-end;justify-content:flex-end;padding:5px;}
  #ta-resize svg{opacity:.3;transition:opacity .15s;} #ta-resize:hover svg{opacity:.65;}

  #ta-head{padding:13px 15px;border-bottom:1px solid rgba(255,255,255,.12);
    display:flex;align-items:center;gap:10px;
    background:linear-gradient(135deg,#A0192E 0%,#6B0E1E 100%);
    color:#fff;flex-shrink:0;cursor:grab;user-select:none;border-radius:18px 18px 0 0;}
  #ta-head:active{cursor:grabbing;}
  #ta-head .ta-logo{width:32px;height:32px;border-radius:8px;overflow:hidden;flex-shrink:0;
    background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;}
  #ta-head .ta-logo img{width:100%;height:100%;object-fit:cover;border-radius:8px;}
  #ta-head .ta-logo-fb{font-weight:900;font-size:10px;letter-spacing:.5px;color:#fff;display:none;}
  #ta-head .ta-title{flex:1;font-size:13.5px;font-weight:800;line-height:1.1;}
  #ta-head .ta-sub{font-size:10.5px;font-weight:500;opacity:.82;margin-top:2px;}
  .ta-hbtns{display:flex;align-items:center;gap:5px;}
  .ta-hbtn{min-width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,.25);
    background:rgba(255,255,255,.12);color:#fff;font-size:14px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0;padding:0 6px;}
  .ta-hbtn:hover{background:rgba(255,255,255,.28);}
  .ta-hbtn.stat-btn{font-size:10.5px;font-weight:700;gap:4px;letter-spacing:.3px;}

  /* Mesajlar alanı */
  #ta-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#FBF8F3;scroll-behavior:smooth;}
  #ta-msgs::-webkit-scrollbar{width:4px;} #ta-msgs::-webkit-scrollbar-thumb{background:#D9C9BD;border-radius:4px;}

  .ta-msg{max-width:92%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.58;white-space:pre-wrap;word-wrap:break-word;animation:taFadeIn .18s ease;}
  @keyframes taFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .ta-msg.user{align-self:flex-end;background:#A0192E;color:#fff;border-bottom-right-radius:4px;}
  .ta-msg.bot{align-self:flex-start;background:#fff;color:#1A1A1A;border:1px solid #E8E2D7;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .ta-msg.bot strong{color:#A0192E;font-weight:700;}
  .ta-msg.bot .ta-badge{display:inline-block;background:#FBE8EB;color:#7A0E1E;border-radius:6px;padding:1px 7px;font-size:11px;font-weight:700;margin:0 2px;}
  .ta-msg.bot .ta-phone{color:#A0192E;font-weight:700;cursor:pointer;text-decoration:none;border-bottom:1px dashed rgba(160,25,46,.35);}
  .ta-msg.bot .ta-phone:hover{border-bottom-style:solid;}
  .ta-msg.bot .ta-section{background:#F8F4F0;border-left:3px solid #A0192E;border-radius:0 8px 8px 0;padding:8px 11px;margin:6px 0;font-size:12.5px;}
  .ta-msg.bot .ta-kpi{display:inline-flex;align-items:center;gap:6px;background:#FBE8EB;border-radius:8px;padding:5px 10px;margin:3px 2px;font-size:12px;font-weight:600;color:#6B0E1E;}
  .ta-dismiss{float:right;margin-left:8px;margin-top:-2px;background:none;border:none;cursor:pointer;color:rgba(160,25,46,.45);font-size:16px;line-height:1;padding:0 2px;transition:color .15s;}
  .ta-dismiss:hover{color:#A0192E;}

  .ta-typing{display:inline-flex;gap:4px;padding:8px 2px;}
  .ta-typing span{width:6px;height:6px;border-radius:50%;background:#A0192E;animation:taDot 1.2s infinite;}
  .ta-typing span:nth-child(2){animation-delay:.15s;}.ta-typing span:nth-child(3){animation-delay:.3s;}
  @keyframes taDot{0%,60%,100%{opacity:.3;transform:translateY(0);}30%{opacity:1;transform:translateY(-4px);}}

  /* Öneri butonları */
  #ta-sugs{padding:0 14px 8px;display:flex;flex-wrap:wrap;gap:5px;}
  .ta-sug{font-size:11.5px;padding:5px 10px;border:1px solid #E8E2D7;background:#fff;border-radius:999px;cursor:pointer;
    color:#4A4A4A;transition:all .15s;white-space:nowrap;}
  .ta-sug:hover{border-color:#A0192E;color:#A0192E;background:#FBE8EB;}

  /* Alt form */
  #ta-form{padding:10px 12px;border-top:1px solid #E8E2D7;display:flex;gap:7px;background:#fff;flex-shrink:0;}
  #ta-input{flex:1;border:1.5px solid #E8E2D7;border-radius:12px;padding:8px 12px;font-size:13px;outline:none;
    font-family:inherit;background:#FBF8F3;resize:none;max-height:90px;line-height:1.45;transition:border-color .15s;}
  #ta-input:focus{border-color:#A0192E;background:#fff;box-shadow:0 0 0 3px rgba(160,25,46,.1);}
  #ta-input::placeholder{color:#B0A99E;}
  #ta-send{width:38px;height:38px;border:none;border-radius:11px;
    background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;cursor:pointer;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .1s,opacity .15s;}
  #ta-send:hover{transform:scale(1.05);} #ta-send:disabled{opacity:.38;cursor:not-allowed;transform:none;}
  #ta-foot{font-size:10px;text-align:center;color:#9A9490;padding:5px 12px 9px;background:#fff;letter-spacing:.2px;}

  @media(max-width:600px){
    #ta-panel{width:calc(100vw - 16px);right:8px;bottom:80px;height:calc(100vh - 100px);}
    #ta-fab{bottom:16px;right:16px;width:50px;height:50px;}
  }
  `;
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ─── DOM ─── */
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
          <img src="${LOGO_URL}" alt="İDT" onerror="this.style.display='none';document.querySelector('.ta-logo-fb').style.display='flex';">
          <span class="ta-logo-fb">İDT</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div class="ta-title">Turne Asistanı</div>
          <div class="ta-sub" id="ta-status">Yükleniyor…</div>
        </div>
        <div class="ta-hbtns">
          <button class="ta-hbtn stat-btn" id="ta-stat-btn" title="İstatistik sayfası">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            İSTATİSTİK
          </button>
          <button class="ta-hbtn" id="ta-close" aria-label="Kapat">×</button>
        </div>
      </div>
      <div id="ta-msgs"></div>
      <div id="ta-sugs"></div>
      <div id="ta-form">
        <textarea id="ta-input" rows="1" placeholder="Sorunuzu yazın… (ör: Çağlar'ın turne listesi, Ankara oteli, nakliye firması)" autocomplete="off"></textarea>
        <button id="ta-send" aria-label="Gönder">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div id="ta-foot">Kural tabanlı · LLM kullanılmaz · %100 ücretsiz</div>
      <div id="ta-resize" title="Boyutu değiştir">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M9 1L1 9M9 5L5 9" stroke="#6B0E1E" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
    </div>`;
  document.body.appendChild(root);

  const $i = id => document.getElementById(id);
  const panel = $i("ta-panel"), msgs = $i("ta-msgs"), sugs = $i("ta-sugs");
  const input = $i("ta-input"), send = $i("ta-send"), status = $i("ta-status");
  const head = $i("ta-head"), resizeH = $i("ta-resize");

  /* ─── TOGGLE ─── */
  $i("ta-fab").addEventListener("click", () => togglePanel(true));
  $i("ta-close").addEventListener("click", () => togglePanel(false));
  $i("ta-stat-btn").addEventListener("click", () => window.open(ISTATISTIK_URL, "_blank"));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && panel.classList.contains("open")) togglePanel(false);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); togglePanel(!panel.classList.contains("open")); }
  });
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input.value); } });
  send.addEventListener("click", () => submit(input.value));
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 90) + "px"; });

  function togglePanel(open) {
    panel.classList.toggle("open", open);
    if (open) setTimeout(() => input.focus(), 250);
  }

  /* ─── SÜRÜKLEME ─── */
  let dragState = null, resizeState = null;

  head.addEventListener("mousedown", e => {
    if (e.target.closest(".ta-hbtn") || e.target.closest(".ta-dismiss")) return;
    e.preventDefault();
    const r = panel.getBoundingClientRect();
    dragState = { sx: e.clientX, sy: e.clientY, or: window.innerWidth - r.right, ob: window.innerHeight - r.bottom };
    panel.classList.add("dragging");
  });
  resizeH.addEventListener("mousedown", e => {
    e.preventDefault(); e.stopPropagation();
    const r = panel.getBoundingClientRect();
    resizeState = { sx: e.clientX, sy: e.clientY, ow: r.width, oh: r.height };
    panel.classList.add("resizing");
  });
  document.addEventListener("mousemove", e => {
    if (dragState) {
      const dx = e.clientX - dragState.sx, dy = e.clientY - dragState.sy;
      panel.style.right = Math.max(0, Math.min(window.innerWidth - 80, dragState.or - dx)) + "px";
      panel.style.bottom = Math.max(0, Math.min(window.innerHeight - 80, dragState.ob - dy)) + "px";
    }
    if (resizeState) {
      panel.style.width = Math.max(300, Math.min(window.innerWidth - 32, resizeState.ow + (e.clientX - resizeState.sx))) + "px";
      panel.style.height = Math.max(420, Math.min(window.innerHeight - 80, resizeState.oh + (e.clientY - resizeState.sy))) + "px";
    }
  });
  document.addEventListener("mouseup", () => {
    dragState = null; resizeState = null;
    panel.classList.remove("dragging", "resizing");
  });
  // Touch desteği — sürükleme
  head.addEventListener("touchstart", e => {
    if (e.target.closest(".ta-hbtn")) return;
    const t = e.touches[0], r = panel.getBoundingClientRect();
    dragState = { sx: t.clientX, sy: t.clientY, or: window.innerWidth - r.right, ob: window.innerHeight - r.bottom };
    panel.classList.add("dragging");
  }, { passive: true });
  document.addEventListener("touchmove", e => {
    if (!dragState) return;
    const t = e.touches[0];
    panel.style.right = Math.max(0, Math.min(window.innerWidth - 80, dragState.or - (t.clientX - dragState.sx))) + "px";
    panel.style.bottom = Math.max(0, Math.min(window.innerHeight - 80, dragState.ob - (t.clientY - dragState.sy))) + "px";
  }, { passive: true });
  document.addEventListener("touchend", () => { dragState = null; panel.classList.remove("dragging"); });

  /* ─── DATA ─── */
  const norm = s => (s || "").toLocaleLowerCase("tr").replace(/i̇/g, "i").replace(/\s+/g, " ").trim();
  let DS = null;

  async function fetchSheet(name) {
    const r = await fetch(`${API}/${encodeURIComponent(name)}`);
    if (!r.ok) throw new Error(`${name} alınamadı (HTTP ${r.status})`);
    return r.json();
  }

  function parseTurneler(data) {
    const rows = data.rows || [];
    const h = (data.headers || []).map(x => (x || "").trim().toLowerCase());
    const fi = (pred, fb) => { const i = h.findIndex(pred); return i >= 0 ? i : fb; };
    const iOyun = fi(x => x.startsWith("oyun"), 0);
    const iIl   = fi(x => x === "il" || x.startsWith("şehir") || x.startsWith("sehir"), 1);
    const iBas  = fi(x => x.startsWith("başla") || x.startsWith("basla"), 2);
    const iBit  = fi(x => x.startsWith("biti"), 3);
    const iSay  = fi(x => x.startsWith("temsil") || x.startsWith("sayı") || x.startsWith("sayi"), 5);
    const iStat = fi(x => x.startsWith("stat"), 7);
    const iOtel = fi(x => x.startsWith("otel") && x.includes("ad"), 8);
    const iOtelTel = fi(x => x.startsWith("otel") && x.includes("tel"), 10);
    const iOtelAdres = fi(x => x.startsWith("otel") && (x.includes("adre") || x.includes("adr")), 9);
    const iDur  = fi(x => (x.startsWith("durak") && x.includes("json")) || x === "duraklar", 19);
    const iKat  = fi(x => x.startsWith("katıl") || x.startsWith("katil"), -1);
    let iAna = h.findIndex(x => x.startsWith("anagrup") || x === "ana_grup_id" || x === "anagrupid");
    if (iAna < 0) iAna = 42;

    return rows.map(r => {
      if (!r || !Array.isArray(r)) return null;
      const oyun = (r[iOyun] || "").trim();
      if (!oyun || oyun === "Oyun Adı" || oyun === "ID") return null;
      const bas = (r[iBas] || "").trim();
      const bit = (r[iBit] || "").trim() || bas;
      const il  = (r[iIl]  || "").trim();
      const sayi = parseInt(r[iSay]) || 1;
      const statu = (r[iStat] || "taslak").trim().toLowerCase().replace(/\s+/g, "-");
      const otelAdi  = (r[iOtel] || "").trim();
      const otelTel  = formatTel(r[iOtelTel]);
      const otelAdres= (r[iOtelAdres] || "").trim();

      let duraklar = [];
      try { const dj = (r[iDur] || "").trim(); if (dj) duraklar = JSON.parse(dj); } catch(e) {}

      // Katılımcıları önce "Katılımcılar" JSON kolonundan al (en doğru kaynak)
      let katilimcilar = [];
      if (iKat >= 0) {
        try {
          const kj = (r[iKat] || "").trim();
          if (kj) {
            const arr = JSON.parse(kj);
            katilimcilar = arr.map(p => ({
              kisi: (p.kisi || "").trim(),
              gorev: (p.gorev || "").trim(),
              kategori: (p.kategori || "").trim(),
            })).filter(p => p.kisi);
          }
        } catch(e) {}
      }

      const anaGrupId = (r[iAna] || "").toString().trim();
      return { oyun, il, baslangic: bas, bitis: bit, sayi, statu, otelAdi, otelTel, otelAdres, duraklar, katilimcilar, anaGrupId };
    }).filter(t => t && !t.anaGrupId);
  }

  function formatTel(raw) {
    if (!raw) return "";
    const s = String(raw).replace(/\s/g, "").replace(/[()]/g, "");
    // scientific notation e.g. 3.882327e+09
    if (s.includes("e+") || s.includes("E+")) {
      const n = Math.round(parseFloat(s));
      return "0" + String(n);
    }
    if (s.startsWith("0")) return s;
    if (s.length === 10) return "0" + s;
    return s;
  }

  function parseFirmaRehberi(data) {
    const rows = data.rows || [];
    const h = (data.headers || []).map(x => (x || "").trim().toLowerCase());
    const fi = (pred, fb) => { const i = h.findIndex(pred); return i >= 0 ? i : fb; };
    const iAd  = fi(x => x === "ad", 0);
    const iKat = fi(x => x.startsWith("katag") || x.startsWith("kateg"), 1);
    const iTel = fi(x => x === "tel", 2);
    const iNot = fi(x => x === "not", 4);
    const iKay = fi(x => x.startsWith("kaynak"), 5);
    return rows.map(r => {
      if (!r || !Array.isArray(r)) return null;
      const ad = (r[iAd] || "").trim();
      if (!ad) return null;
      return {
        ad,
        kategori: (r[iKat] || "").trim(),
        tel: formatTel(r[iTel]),
        not: (r[iNot] || "").trim(),
        kaynak: (r[iKay] || "").trim(),
      };
    }).filter(Boolean);
  }

  /* Durak bazında otel/personel bulma */
  function parseDurakOteller(duraklar) {
    return (duraklar || []).map(d => ({
      il: (d.il || "").trim(),
      mekan: (d.mekan || "").trim(),
      otelAdi: (d.otelAdi || "").trim(),
      otelAdres: (d.otelAdres || "").trim(),
      otelTel: formatTel(d.otelTel),
      ilgiliKisi: (d.ilgiliKisi || "").trim(),
      ilgiliTel: formatTel(d.ilgiliTel),
      oyun: (d.oyun || "").trim(),
      sayi: d.sayi || 0,
    }));
  }

  async function loadData() {
    status.textContent = "Yükleniyor…";
    try {
      const [tData, fData] = await Promise.all([
        fetchSheet(TURNE_SHEET),
        fetchSheet("FIRMA_REHBERI").catch(() => ({ rows: [], headers: [] })),
      ]);
      const turneler = parseTurneler(tData);
      const firmalar = parseFirmaRehberi(fData);
      DS = { turneler, firmalar };

      const cities = new Set();
      const ppl = new Set();
      for (const t of turneler) {
        if (t.il) cities.add(t.il);
        for (const d of t.duraklar || []) if (d.il) cities.add(d.il);
        for (const k of t.katilimcilar) ppl.add(norm(k.kisi));
      }
      status.textContent = `${turneler.length} turne · ${cities.size} şehir · ${ppl.size} personel`;
    } catch (e) {
      status.textContent = "Bağlantı hatası";
      addMsg("⚠️ Veri alınamadı: " + e.message, "bot");
    }
  }

  /* ─── YARDIMCI FONKSİYONLAR ─── */
  const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const AY_NORM = ["ocak","şubat","mart","nisan","mayıs","haziran","temmuz","ağustos","eylül","ekim","kasım","aralık"];
  const STATU_MAP = {
    "tamamlandı": ["tamamlan","biten","bitmiş","tamamlandi"],
    "taslak": ["taslak","planlanan","gelecek","yaklaşan"],
    "iptal": ["iptal"],
    "yarıda-kesildi": ["yarıda","kesild"],
    "devam": ["devam","süren","aktif"],
  };

  function parseDate(s) {
    if (!s) return null;
    let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (m) return new Date(+m[3], +m[2]-1, +m[1]);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(+m[1], +m[2]-1, +m[3]);
    return null;
  }

  function fmtTarih(s) {
    const d = parseDate(s);
    if (!d) return s || "—";
    return `${String(d.getDate()).padStart(2,"0")} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`;
  }

  function fmtTarihAralik(bas, bit) {
    const a = fmtTarih(bas), b = fmtTarih(bit);
    if (!a || a === "—") return "—";
    if (a === b || !bit) return a;
    return `${a} – ${b}`;
  }

  function turneGun(t) {
    const a = parseDate(t.baslangic), b = parseDate(t.bitis) || a;
    if (!a || !b) return 1;
    return Math.max(1, Math.round((b-a)/86400000)+1);
  }

  function fmtTel(tel) {
    if (!tel) return null;
    const clean = String(tel).replace(/\s/g,"");
    // Format: 0XXX XXX XX XX
    if (clean.match(/^0?\d{10}$/)) {
      const d = clean.startsWith("0") ? clean : "0"+clean;
      return d.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
    }
    return tel;
  }

  /* ─── ANSWER ENGINE ─── */
  function answer(q, ds) {
    const Q = norm(q);
    const T = ds.turneler;
    const F = ds.firmalar || [];

    /* Kapsam filtrele */
    let scope = T;
    for (const [s, keys] of Object.entries(STATU_MAP)) {
      if (keys.some(k => Q.includes(k))) { scope = T.filter(t => t.statu.startsWith(s.split("-")[0])); break; }
    }
    const ym = Q.match(/\b(20\d{2})\b/);
    if (ym) { const y = +ym[1]; scope = scope.filter(t => { const d = parseDate(t.baslangic); return d && d.getFullYear()===y; }); }
    const mi = AY_NORM.findIndex(m => Q.includes(m));
    if (mi >= 0) scope = scope.filter(t => { const d = parseDate(t.baslangic); return d && d.getMonth()===mi; });

    /* ── OTEL SORGUSU ── */
    if (/otel|konaklama|kal(ınan|dığı|acak)/.test(Q)) {
      // Belirli bir turne veya şehir içinse
      const cityHit = findCity(Q, T);
      const personHit = findPerson(Q, T);

      if (cityHit) {
        const list = T.filter(t => t.il === cityHit || (t.duraklar||[]).some(d=>d.il===cityHit));
        const otels = new Map();
        for (const t of list) {
          const durakOtels = parseDurakOteller(t.duraklar).filter(d=>d.il===cityHit);
          for (const d of durakOtels) {
            if (d.otelAdi && !otels.has(d.otelAdi)) {
              otels.set(d.otelAdi, { adres: d.otelAdres, tel: d.otelTel, ilgili: d.ilgiliKisi, ilgiliTel: d.ilgiliTel });
            }
          }
          if (!otels.size && t.otelAdi) otels.set(t.otelAdi, { adres: t.otelAdres, tel: t.otelTel });
        }
        if (otels.size) {
          let out = `**${cityHit}** şehri otel bilgileri:\n\n`;
          for (const [ad, info] of otels) {
            out += `🏨 **${ad}**\n`;
            if (info.adres) out += `   📍 ${info.adres}\n`;
            if (info.tel) out += `   📞 <a class="ta-phone" href="tel:${info.tel}">${fmtTel(info.tel)}</a>\n`;
            if (info.ilgili) out += `   👤 ${info.ilgili}`;
            if (info.ilgiliTel) out += ` — <a class="ta-phone" href="tel:${info.ilgiliTel}">${fmtTel(info.ilgiliTel)}</a>`;
            if (info.ilgili) out += "\n";
            out += "\n";
          }
          return { html: out };
        }
      }

      // Genel otel listesi
      const otelFirmalar = F.filter(f => f.kategori === "otel");
      if (otelFirmalar.length) {
        let out = `Rehberdeki **${otelFirmalar.length}** otel:\n\n`;
        for (const f of otelFirmalar) {
          out += `🏨 **${f.ad}**`;
          if (f.kaynak) out += ` <span class="ta-badge">${f.kaynak.split("·")[1]?.trim()||f.kaynak}</span>`;
          out += "\n";
          if (f.not) out += `   📍 ${f.not}\n`;
          if (f.tel) out += `   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)}</a>\n`;
          out += "\n";
        }
        return { html: out };
      }
    }

    /* ── FİRMA / NUMARA SORGUSU ── */
    if (/(firma|nakliye|ulaşım|ulasim|servis|otobüs|otobus|kamyon|rehber)/.test(Q) ||
        /(numara|telefon|tel|ara(yın|yabilirim)|iletişim|irtibat)/.test(Q)) {
      // Kategori filtresi
      let cat = null;
      if (/(nakliye|kamyon)/.test(Q)) cat = "nakliye";
      else if (/(otobüs|otobus|ulaşım|ulasim|servis)/.test(Q)) cat = ["ulasim","servis"];
      else if (/otel/.test(Q)) cat = "otel";

      let firmalar = F;
      if (cat) firmalar = F.filter(f => Array.isArray(cat) ? cat.includes(f.kategori) : f.kategori === cat);

      // İsim araması
      for (const f of F) {
        if (norm(f.ad).split(" ").filter(p=>p.length>=4).some(p=>Q.includes(p))) {
          let out = `📋 **${f.ad}**\n`;
          if (f.kaynak) out += `   🗂 ${f.kaynak}\n`;
          if (f.not) out += `   📍 ${f.not}\n`;
          if (f.tel) out += `   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)}</a>\n`;
          return { html: out };
        }
      }

      if (firmalar.length) {
        const catLabel = cat === "nakliye" ? "Nakliye firmaları" : Array.isArray(cat) ? "Ulaşım firmaları" : cat === "otel" ? "Oteller" : "Firma rehberi";
        let out = `**${catLabel}** (${firmalar.length} kayıt):\n\n`;
        for (const f of firmalar) {
          out += `📋 **${f.ad}**`;
          if (f.kaynak) out += ` <span class="ta-badge">${f.kaynak.split("·").pop().trim()}</span>`;
          out += "\n";
          if (f.not) out += `   📍 ${f.not}\n`;
          if (f.tel) out += `   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)}</a>\n`;
          out += "\n";
        }
        return { html: out };
      }
    }

    /* ── İLGİLİ KİŞİ NUMARALARI ── */
    if (/(ilgili|sorumlu|koordinat).*?(kişi|kisi|numara|tel)/.test(Q) || /(kişi|kisi).*?(numara|tel|ara)/.test(Q)) {
      const cityHit = findCity(Q, T);
      if (cityHit) {
        const list = T.filter(t => t.il===cityHit || (t.duraklar||[]).some(d=>d.il===cityHit));
        let out = `**${cityHit}** ilgili kişi bilgileri:\n\n`;
        const seen = new Set();
        for (const t of list) {
          for (const d of parseDurakOteller(t.duraklar).filter(d=>d.il===cityHit)) {
            if (d.ilgiliKisi && !seen.has(d.ilgiliKisi)) {
              seen.add(d.ilgiliKisi);
              out += `👤 **${d.ilgiliKisi}** (${t.oyun})\n`;
              if (d.ilgiliTel) out += `   📞 <a class="ta-phone" href="tel:${d.ilgiliTel}">${fmtTel(d.ilgiliTel)}</a>\n`;
              out += "\n";
            }
          }
        }
        if (seen.size) return { html: out };
      }
      // Firma rehberindeki "diger" kişiler
      const diger = F.filter(f => f.kategori === "diger");
      if (diger.length) {
        let out = `Rehberdeki ilgili kişiler (${diger.length}):\n\n`;
        for (const f of diger) {
          out += `👤 **${f.ad}** <span class="ta-badge">${f.kaynak.split("·").pop().trim()||f.kaynak}</span>\n`;
          if (f.tel) out += `   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)}</a>\n`;
          out += "\n";
        }
        return { html: out };
      }
    }

    /* ── EN FAZLA TURNE ── */
    if (/(en\s*(fazla|cok|çok)).*(kişi|kisi|personel|giden|katılan|katilan)/.test(Q)) {
      const c = new Map();
      for (const t of scope) for (const k of t.katilimcilar) {
        const key = k.kisi;
        c.set(key, (c.get(key)||0)+1);
      }
      const top = [...c.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
      return top.length
        ? "En fazla turneye giden kişiler:\n\n" + top.map(([k,n],i) => `${i+1}. **${k}** — ${n} turne`).join("\n")
        : "Kayıt bulunamadı.";
    }

    /* ── EN FAZLA GÜN ── */
    if (/(en\s*(fazla|cok|çok)).*(gün|gun).*(yolda|turne)/.test(Q) || /yolda.*kim/.test(Q)) {
      const d = new Map();
      for (const t of scope) { const g = turneGun(t); for (const k of t.katilimcilar) d.set(k.kisi,(d.get(k.kisi)||0)+g); }
      const top = [...d.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
      return top.length ? "En çok gün yolda:\n\n" + top.map(([k,g],i)=>`${i+1}. **${k}** — ${g} gün`).join("\n") : "Veri yok.";
    }

    /* ── TOPLAM PERSONEL ── */
    if (/(toplam|kac|kaç).*(personel|kişi|kisi)/.test(Q)) {
      const s = new Set(); for (const t of scope) for (const k of t.katilimcilar) s.add(norm(k.kisi));
      return `Toplam **${s.size}** farklı personel turneye çıktı.`;
    }

    /* ── GÖREV GRUPLARI ── */
    if (/(görev|gorev|kategori).*(kalabalık|kalabalik|en\s*cok|en\s*çok|en\s*fazla)/.test(Q)) {
      const c = new Map();
      for (const t of scope) for (const k of t.katilimcilar) {
        const g = k.kategori || k.gorev || "Diğer";
        if (!c.has(g)) c.set(g, new Set());
        c.get(g).add(norm(k.kisi));
      }
      const top = [...c.entries()].map(([g,s])=>[g,s.size]).sort((a,b)=>b[1]-a[1]);
      return top.length ? "Görev grupları:\n\n" + top.map(([g,n],i)=>`${i+1}. **${g}** — ${n} kişi`).join("\n") : "Veri yok.";
    }

    /* ── HANGI AY ── */
    if (/(hangi\s*ay|en\s*yoğun|en\s*yogun|aylık)/.test(Q)) {
      const c = new Array(12).fill(0);
      for (const t of scope) { const d=parseDate(t.baslangic); if(d) c[d.getMonth()]++; }
      const r = c.map((n,i)=>({ay:AYLAR[i],n})).sort((a,b)=>b.n-a.n).slice(0,3).filter(x=>x.n>0);
      return r.length ? "En yoğun aylar:\n\n" + r.map((x,i)=>`${i+1}. **${x.ay}** — ${x.n} turne`).join("\n") : "Veri yok.";
    }

    /* ── ŞEHİR ── */
    if (/(şehir|sehir|il)/.test(Q) && /(en\s*cok|en\s*çok|en\s*fazla|kac|kaç)/.test(Q)) {
      const c = new Map();
      for (const t of scope) {
        const ill = new Set();
        if (t.il) ill.add(t.il);
        for (const d of t.duraklar||[]) if(d.il) ill.add(d.il);
        for (const il of ill) c.set(il,(c.get(il)||0)+1);
      }
      if (/kac|kaç/.test(Q)) return `Toplam **${c.size}** farklı şehre gidildi.`;
      const top = [...c.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
      return "En çok gidilen şehirler:\n\n" + top.map(([s,n],i)=>`${i+1}. **${s}** — ${n} turne`).join("\n");
    }

    /* ── TOPLAM TURNE ── */
    if (/(toplam|kac|kaç).*(turne)/.test(Q)) {
      const g = scope.reduce((s,t)=>s+turneGun(t),0);
      const tm = scope.reduce((s,t)=>s+(t.sayi||0),0);
      return `Bu kapsamda **${scope.length}** turne, **${g}** gün, **${tm}** temsil.`;
    }

    /* ── KİŞİ ARAMA ── */
    const found = findPerson(Q, T);
    if (found) {
      const list = T.filter(t => t.katilimcilar.some(k => norm(k.kisi) === norm(found.kisi)));
      if (!list.length) return `**${found.kisi}** adlı kişi henüz hiçbir turneye atanmamış.`;
      const gun = list.reduce((s,t)=>s+turneGun(t),0);
      const gorev = found.gorev ? ` · ${found.gorev}` : "";
      const sorted = list.sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0));
      const lines = sorted.slice(0,15).map(t => {
        const tarih = fmtTarihAralik(t.baslangic, t.bitis);
        const otel = t.duraklar?.find(d=>d.otelAdi)?.otelAdi || t.otelAdi || "";
        return `• **${t.oyun}**\n  📅 ${tarih} · 📍 ${t.il||"—"}${otel?" · 🏨 "+otel:""}`;
      }).join("\n");
      return `**${found.kisi}**${gorev}\n${list.length} turne · ${gun} gün yolda\n\n${lines}`;
    }

    /* ── ŞEHİR ARAMA ── */
    const cityHit = findCity(Q, T);
    if (cityHit) {
      const list = T.filter(t => t.il===cityHit || (t.duraklar||[]).some(d=>d.il===cityHit));
      let out = `**${cityHit}** şehrine **${list.length}** turne yapıldı.\n\n`;
      for (const t of list.slice(0,10)) {
        const tarih = fmtTarihAralik(t.baslangic, t.bitis);
        const duraklar = parseDurakOteller(t.duraklar).filter(d=>d.il===cityHit);
        const otel = duraklar[0]?.otelAdi || t.otelAdi || "";
        const otelTel = duraklar[0]?.otelTel || t.otelTel || "";
        const ilgili = duraklar[0]?.ilgiliKisi || "";
        const ilgiliTel = duraklar[0]?.ilgiliTel || "";
        out += `• **${t.oyun}** (${t.statu})\n`;
        out += `  📅 ${tarih}\n`;
        if (otel) { out += `  🏨 ${otel}`; if(otelTel) out += ` — <a class="ta-phone" href="tel:${otelTel}">${fmtTel(otelTel)}</a>`; out+="\n"; }
        if (ilgili) { out += `  👤 ${ilgili}`; if(ilgiliTel) out += ` — <a class="ta-phone" href="tel:${ilgiliTel}">${fmtTel(ilgiliTel)}</a>`; out+="\n"; }
        out += "\n";
      }
      return { html: out };
    }

    /* ── YAKLAŞAN TURNELER ── */
    if (/(yaklaşan|yaklasan|gelecek|planlı|planli|taslak|önümüzdeki|onumuzdeki)/.test(Q)) {
      const now = new Date();
      const upcoming = T.filter(t => { const d=parseDate(t.baslangic); return d && d >= now; })
        .sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0)).slice(0,8);
      if (!upcoming.length) return "Yaklaşan turne bulunamadı.";
      return "Yaklaşan turneler:\n\n" + upcoming.map(t=>`• **${t.oyun}**\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)} · 📍 ${t.il||"—"} (${t.statu})`).join("\n");
    }

    /* ── TURNE DETAYI (oyun adı) ── */
    for (const t of T) {
      if (norm(t.oyun).split(" ").filter(p=>p.length>=4).some(p=>Q.includes(p))) {
        const duraklar = parseDurakOteller(t.duraklar);
        let out = `**${t.oyun}**\n\n`;
        out += `📅 ${fmtTarihAralik(t.baslangic,t.bitis)}\n`;
        out += `📍 ${t.il||"—"}\n`;
        out += `🎭 ${t.sayi||"?"} temsil · ${turneGun(t)} gün\n`;
        out += `📊 Statü: ${t.statu}\n\n`;
        if (duraklar.length) {
          out += `**Duraklar:**\n`;
          for (const d of duraklar) {
            out += `\n🏙 **${d.il}**`;
            if (d.mekan) out += ` — ${d.mekan}`;
            out += "\n";
            if (d.otelAdi) { out += `   🏨 ${d.otelAdi}`; if(d.otelTel) out+=` <a class="ta-phone" href="tel:${d.otelTel}">${fmtTel(d.otelTel)}</a>`; out+="\n"; }
            if (d.ilgiliKisi) { out += `   👤 ${d.ilgiliKisi}`; if(d.ilgiliTel) out+=` — <a class="ta-phone" href="tel:${d.ilgiliTel}">${fmtTel(d.ilgiliTel)}</a>`; out+="\n"; }
          }
          out += "\n";
        } else if (t.otelAdi) {
          out += `🏨 **${t.otelAdi}**\n`;
          if (t.otelAdres) out += `   📍 ${t.otelAdres}\n`;
          if (t.otelTel) out += `   📞 <a class="ta-phone" href="tel:${t.otelTel}">${fmtTel(t.otelTel)}</a>\n`;
        }
        if (t.katilimcilar.length) {
          out += `\n👥 **${t.katilimcilar.length} kişi:** ${t.katilimcilar.slice(0,5).map(k=>k.kisi).join(", ")}`;
          if (t.katilimcilar.length>5) out += ` ve ${t.katilimcilar.length-5} kişi daha`;
          out += "\n";
        }
        return { html: out };
      }
    }

    /* ── YARDIM ── */
    return "Şu sorulara cevap verebilirim 💡\n\n" +
      "👤 **Kişi sorguları:** \"Çağlar'ın turne listesi\", \"Sami Öztürk kaç turneye gitti\"\n" +
      "🏙 **Şehir sorguları:** \"Ankara turneleri\", \"Konya otel numarası\"\n" +
      "🏨 **Otel bilgileri:** \"Ankara oteli\", \"Çorum otel telefonu\"\n" +
      "📋 **Firma rehberi:** \"Nakliye firmaları\", \"Ulusoy numarası\", \"Ulasim firmaları\"\n" +
      "👤 **İlgili kişiler:** \"Ankara ilgili kişi\", \"Konya koordinatör numarası\"\n" +
      "📊 **İstatistik:** \"En fazla turneye giden?\", \"En çok gidilen şehirler\"\n" +
      "📅 **Tarih:** \"Nisan turneları\", \"2026 turne sayısı\", \"Yaklaşan turneler\"";
  }

  function findPerson(Q, T) {
    const names = new Map();
    for (const t of T) for (const k of t.katilimcilar) {
      const key = norm(k.kisi);
      if (!names.has(key)) names.set(key, k);
    }
    // Tam eşleşme
    for (const [nN, k] of names) {
      if (nN.split(" ").length >= 2 && Q.includes(nN)) return k;
    }
    // Parça eşleşmesi (≥4 karakter)
    for (const [nN, k] of names) {
      if (nN.split(" ").filter(p=>p.length>=4).some(p=>Q.includes(p))) return k;
    }
    return null;
  }

  function findCity(Q, T) {
    const cities = new Set();
    for (const t of T) {
      if (t.il) cities.add(t.il);
      for (const d of t.duraklar||[]) if(d.il) cities.add(d.il);
    }
    for (const c of cities) {
      if (norm(c).length >= 4 && Q.includes(norm(c))) return c;
    }
    return null;
  }

  /* ─── UI ─── */
  function fmtHtml(text) {
    if (typeof text === "object" && text.html) {
      // HTML mesaj — sadece **bold** dönüştür, anchor'lar zaten HTML
      const lines = text.html.split("\n").map(l => {
        return l.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      });
      return lines.join("\n");
    }
    const esc = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    return esc.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  }

  function addMsg(text, who, dismissable) {
    const el = document.createElement("div");
    el.className = "ta-msg " + (who==="user" ? "user" : "bot");
    const content = who === "bot" ? fmtHtml(text) : (text+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    el.innerHTML = content;
    if (dismissable && who === "bot") {
      const btn = document.createElement("button");
      btn.className = "ta-dismiss"; btn.title = "Kapat"; btn.innerHTML = "×";
      btn.addEventListener("click", () => el.remove());
      el.insertBefore(btn, el.firstChild);
    }
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
    const q = (text||"").trim();
    if (!q) return;
    if (!DS) { addMsg("Veriler henüz yüklenmedi, lütfen bekleyin…","bot"); return; }
    addMsg(q,"user");
    input.value=""; input.style.height="auto";
    sugs.style.display="none";
    const typing = addTyping();
    setTimeout(() => {
      typing.remove();
      addMsg(answer(q, DS), "bot");
    }, 200);
  }

  /* ─── KARŞILAMA ─── */
  addMsg({html:
    "👋 Merhaba! Ben <strong>Turne Asistanı</strong>'yım.\n\n" +
    "Turne verileriniz hakkında sorularınızı yanıtlarım:\n" +
    "🏙 Şehir otel numaraları · 📋 Firma rehberi · 👤 Kişi turne listeleri\n" +
    "📅 Tarih & istatistik — tamamen ücretsiz ve sınırsız.\n\n" +
    "📊 İstatistik için sağ üstteki <strong>İSTATİSTİK</strong> butonuna tıklayın."
  }, "bot", true);

  const SUGS = [
    "En fazla turneye giden kişi?",
    "Yaklaşan turneler",
    "Nakliye firma numaraları",
    "Otel rehberi",
    "En çok gidilen şehirler?",
    "Hangi ay en yoğun?",
    "Toplam kaç personel turneye çıktı?",
  ];
  for (const s of SUGS) {
    const b = document.createElement("button");
    b.type="button"; b.className="ta-sug"; b.textContent=s;
    b.addEventListener("click",()=>submit(s));
    sugs.appendChild(b);
  }

  loadData();
})();
