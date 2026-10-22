"use strict";
const BASE = "https://tiyatro-backend.vercel.app/api/sheets";
const API = BASE + "/" + encodeURIComponent("HAFTALIK PROGRAM") + "?fresh=1";
const UNITS = [["dekor","Dekor Aksesuar"],["kondvit","Kondüvit"],["isik","Işık"],["erkek","Erkek Terzi"],["kadin","Kadın Terzi"],["peruka","Peruka"]];
const NAV = [
  {g:"BÖLÜMLER", items:[["Ana panel","#panel"],["Haftalık program","#programlar"]]}
];
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const b64u = b => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); };
const tsLabel = ts => { try { return new Date(ts).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); } catch(e){ return ""; } };

let DATA = null, LOADERR = "", unit = "dekor", week = null, cur = "programlar";

/* ---- veri: her birim+hafta için en yeni eksiksiz kayıt ---- */
async function load(){
  let res;
  try { res = await fetch(API,{cache:"no-store"}); }
  catch(e){ await new Promise(r => setTimeout(r,700)); res = await fetch(API.replace("?fresh=1",""),{cache:"no-store"}); }
  if (!res.ok) throw new Error("HTTP " + res.status);
  const rows = (await res.json()).rows || [], groups = new Map();
  rows.forEach(r => { const id = String(r[0]||""); if (!/^hpub_[a-z]+_\d{4}-\d{2}-\d{2}_\d+$/.test(id)) return; (groups.get(id) || groups.set(id,[]).get(id)).push(r); });
  const best = new Map();
  for (const [id, rs] of groups){
    const total = +rs[0][3] || rs.length;
    if (new Set(rs.map(r => +r[2])).size < total) continue;
    const m = id.match(/^hpub_([a-z]+)_(\d{4}-\d{2}-\d{2})_(\d+)$/), k = m[1] + "|" + m[2], ts = +m[3], cur = best.get(k);
    if (cur && cur.ts >= ts) continue;
    try {
      const o = JSON.parse(b64u(rs.slice().sort((a,b) => a[2]-b[2]).map(r => String(r[4]||"")).join("")));
      if (o && o.doc) best.set(k,{ts,key:m[1],week:m[2],label:o.label||m[2],doc:o.doc,note:String(o.note||"").trim()});
    } catch(e){}
  }
  const out = {}; UNITS.forEach(([k]) => out[k] = []);
  for (const v of best.values()) (out[v.key] = out[v.key] || []).push(v);
  Object.values(out).forEach(a => a.sort((x,y) => x.week < y.week ? 1 : -1));
  return out;
}

/* ---- belge tablosu ---- */
function docHtml(doc){
  const body = (doc.days||[]).map(d => {
    const n = (d.rows||[]).length;
    return (d.rows||[]).map((row,i) => {
      let h = `<tr class="${i===0?"ds":""}">`;
      if (i === 0) h += `<td class="date${d.weekend?" we":""}" rowspan="${n}">${esc(d.label)}</td>`;
      ["time","place","task","ppl"].forEach(role => {
        const c = (row.cells && row.cells[role]) || {t:""};
        if (c.skip) return;
        h += `<td class="${role}"${c.span>1?` rowspan="${c.span}"`:""}>${esc(c.t)}</td>`;
      });
      return h + "</tr>";
    }).join("");
  }).join("");
  const notes = (doc.notes||[]).length ? `<ul class="notes">${doc.notes.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
  const signs = (doc.signs||[]).map(s => { const l = String(s).split("\n"); return `<div><b>${esc(l.shift())}</b>${esc(l.join(" "))}</div>`; }).join("");
  return `<article class="sheet">
    <div class="sheet-h"><div class="org">İZMİR DEVLET TİYATROSU MÜDÜRLÜĞÜ</div><h2>${esc(doc.title||"Haftalık iş planı çizelgesi")}</h2><span class="wk">${esc(doc.week||"")}</span></div>
    <div class="tw"><table><thead><tr><th>Tarih / gün</th><th>Saat</th><th>Yer</th><th>Yapılacak iş</th><th>Görevliler</th></tr></thead><tbody>${body}</tbody></table></div>
    ${notes}${signs ? `<div class="signs">${signs}</div>` : ""}</article>`;
}

/* ---- ekranlar ---- */
function viewProgramlar(){
  const list = (DATA && DATA[unit]) || [];
  const w = list.find(x => x.week === week) || list[0] || null;
  const uname = (UNITS.find(u => u[0] === unit) || [,""])[1];
  const units = UNITS.map(([k,n]) => `<button type="button" aria-pressed="${k===unit}" data-unit="${k}">${esc(n)}</button>`).join("");
  const weeks = list.map(x => `<button type="button" aria-pressed="${w && x.week===w.week}" data-week="${x.week}">${esc(x.label)}</button>`).join("");
  let content;
  if (!DATA && !LOADERR) content = skel();
  else if (LOADERR) content = `<div class="empty err"><h2>Programlar okunamadı</h2><p>İnternet bağlantınızı kontrol edip <b>Yenile</b>\'ye basın.</p></div>`;
  else if (!w) content = `<div class="empty"><h2>${esc(uname)} için onaylı hafta yok</h2><p>Bu birimin programı yayımlandığında burada görünecek.</p></div>`;
  else content = (w.note ? `<div class="note">${esc(w.note)}</div>` : "") + docHtml(w.doc);
  return `<div class="pagehead"><div><span class="eyebrow">SAHNE ARKASI · HAFTALIK PLAN</span><h1>Haftalık program</h1><p class="sub">${esc(uname)} birimi${w ? " · " + esc(w.label) : ""}</p></div>
    <div>${w ? `<span class="chip">Güncelleme: ${esc(tsLabel(w.ts))}</span> ` : ""}<button class="btn" type="button" data-act="refresh">Yenile</button> ${w ? `<button class="btn pri" type="button" data-act="print">Yazdır / PDF</button>` : ""}</div></div>
    <div class="controls"><div class="seg" role="group" aria-label="Birim"><span class="lbl">Birim</span>${units}</div>
    ${list.length ? `<div class="seg" role="group" aria-label="Hafta"><span class="lbl">Hafta</span>${weeks}</div>` : ""}</div>${content}`;
}

/* ---- Ana panel: oyunlar, afiş ve künye ---- */
const trLower = s => String(s == null ? "" : s).replace(/İ/g,"i").replace(/I/g,"ı").toLowerCase();
const norm = s => trLower(String(s || "").trim());
const unent = s => String(s == null ? "" : s).replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ");
const FIGTAG = /\(\s*fig[üu]ran\s*\)/i;
const stripTag = s => s.replace(/\(\s*fig[üu]ran\s*\)/ig,"").replace(/^"+|"+$/g,"").trim();
const names = s => s.split(",").map(x => x.trim()).filter(Boolean);
const isCocuk = n => n.includes("Ç.O") || n.includes("(Ç)");
const isFigCat = c => { const t = norm(c); return t.includes("figüran") || t.includes("figuran"); };
const sortTr = (a,b) => String(a).localeCompare(String(b),"tr");
const figNames = r => {
  const t = names(r.kisi), tg = t.filter(x => FIGTAG.test(x));
  if (tg.length) return new Set(tg.map(stripTag).filter(Boolean));
  return isFigCat(r.kategori) ? new Set(t.map(stripTag).filter(Boolean)) : new Set();
};

let PD = null, PERR = "", PBUSY = false, pq = "", pf = "tumu", openPlay = null;
async function getSheet(name, fresh){
  const res = await fetch(BASE + "/" + encodeURIComponent(name) + (fresh ? "?fresh=1" : ""), {cache:"no-store"});
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}
const soft = (name, fresh) => getSheet(name, fresh).catch(() => ({headers:[],rows:[]}));
async function loadPanel(fresh){
  if (PBUSY) return;
  PBUSY = true; PERR = ""; PD = null; render();
  try {
    const [main, img, sez, pas] = await Promise.all([getSheet("BÜTÜN OYUNLAR", fresh), soft("RESİMLER", fresh), soft("2025-2026 SEZONU", fresh), soft("PASIF_KISILER", fresh)]);
    PD = buildPanel(main, img, sez, pas);
  } catch(e){ PERR = (e && e.message) || "bilinmeyen"; }
  PBUSY = false; render();
}
function buildPanel(main, img, sez, pas){
  const H = (main.headers || []).map(h => trLower(h).trim());
  const ix = (k,d) => { const i = H.findIndex(h => h === k || h.startsWith(k)); return i < 0 ? d : i; };
  const C = {o:ix("oyun",0), k:ix("kategori",1), g:ix("görev",2), p:ix("kişi",3)};
  const cell = (r,i) => unent(String(r[i] == null ? "" : r[i]).trim());
  const rows = (main.rows || []).map(r => ({oyun:cell(r,C.o), kategori:cell(r,C.k), gorev:cell(r,C.g), kisi:cell(r,C.p)})).filter(r => r.oyun);

  const pg = new Set(), pp = new Set();
  (pas.rows || []).forEach(r => { const n = norm(unent(r[0])), o = norm(unent(r[1])); if (!n) return; if (o) pp.add(n + "|" + o); else pg.add(n); });
  const pasif = (n, oyun) => pg.has(norm(n)) || pp.has(norm(n) + "|" + norm(oyun));

  const ih = (img.headers || []).map(h => trLower(h)), io = Math.max(0, ih.findIndex(h => h.includes("oyun")));
  const posters = new Map();
  (img.rows || []).forEach(r => {
    const nm = unent(r[io]).trim(), u = (r.filter((_,i) => i !== io).join(" ").match(/https?:\/\/[^\s"'<>\[\]]+/) || [])[0];
    if (nm && u) posters.set(norm(nm), u);
  });

  const sh = (sez.headers || []).map(h => trLower(h).trim()), si = k => sh.findIndex(h => h.includes(k));
  const sO = Math.max(0, si("oyun")), sT = si("prömiyer tarihi"), sS = si("prömiyer sezonu"), sN = si("sezon sayısı") >= 0 ? si("sezon sayısı") : si("temsil");
  const season = new Map(), sv = (r,i) => i >= 0 ? String(r[i] == null ? "" : r[i]).trim() : "";
  (sez.rows || []).forEach(r => { const n = unent(r[sO]).trim(); if (n) season.set(norm(n), {tar:sv(r,sT), sez:sv(r,sS), say:sv(r,sN)}); });

  const map = new Map();
  rows.forEach(r => { if (!map.has(r.oyun)) map.set(r.oyun, []); map.get(r.oyun).push(r); });
  const plays = [...map.entries()].map(([name, rs]) => {
    const all = new Set(), figs = new Set();
    rs.forEach(r => { names(r.kisi).forEach(n => { const c = stripTag(n); if (c) all.add(c); }); figNames(r).forEach(c => figs.add(c)); });
    return {name, rows:rs, kisi:[...all].filter(n => !pasif(n,name)).length, fig:[...figs].filter(n => !pasif(n,name)).length,
      poster:posters.get(norm(name)) || "", season:season.get(norm(name)) || null, cocuk:isCocuk(name)};
  }).sort((a,b) => sortTr(a.name,b.name));

  const ppl = new Set(), fg = new Set();
  rows.forEach(r => { names(r.kisi).forEach(n => { const c = stripTag(n); if (c && !pg.has(norm(c))) ppl.add(c); }); figNames(r).forEach(c => fg.add(c)); });
  return {plays, pasif, nPeople:ppl.size, nFig:fg.size, nPoster:plays.filter(p => p.poster).length};
}

function imgFail(i){ const d = document.createElement("div"); d.className = "ph"; d.textContent = "Afiş yok"; i.replaceWith(d); }
const posterHtml = p => p.poster
  ? `<img src="${esc(p.poster)}" alt="${esc(p.name)} afişi" loading="lazy" referrerpolicy="no-referrer" onerror="imgFail(this)">`
  : `<div class="ph">Afiş yok</div>`;
const panelList = () => {
  const q = trLower(pq.trim());
  return PD.plays.filter(p => (!q || trLower(p.name).includes(q)) && (pf === "tumu" || (pf === "cocuk") === p.cocuk));
};
function gridHtml(){
  const l = panelList();
  return l.length ? `<div class="pgrid">${l.map((p,i) => `<a class="pc" style="--i:${Math.min(i,24)}" href="#panel/${encodeURIComponent(p.name)}"><div class="im">${posterHtml(p)}</div>
    ${p.cocuk ? '<span class="badge">Çocuk</span>' : ""}<div class="nm">${esc(p.name)}<div class="mt">${p.kisi} kişi${p.fig ? " · " + p.fig + " figüran" : ""}</div></div></a>`).join("")}</div>`
    : `<div class="empty"><h2>Eşleşen oyun yok</h2><p>Aramayı veya türü değiştirin.</p></div>`;
}
function kunyeHtml(p){
  const cats = new Map();
  p.rows.forEach(r => {
    const k = r.kategori || "Diğer", gk = r.gorev || "—";
    if (!cats.has(k)) cats.set(k, new Map());
    const g = cats.get(k); if (!g.has(gk)) g.set(gk, []);
    names(r.kisi).forEach(t => g.get(gk).push(t));
  });
  const nm = ts => ts.map(t => { const n = stripTag(t);
    return n ? `<span>${esc(n)}${FIGTAG.test(t) ? '<i class="tag">Figüran</i>' : ""}${PD.pasif(n,p.name) ? '<i class="tag">Pasif</i>' : ""}</span>` : ""; }).join("");
  const cnt = g => [...g.values()].reduce((s,ts) => s + ts.filter(t => stripTag(t)).length, 0);
  const grp = k => { const t = norm(k); return isFigCat(k) ? 2 : (t.includes("oyuncu") || t.includes("kadro") || t.includes("rol")) ? 0 : 1; };
  const GN = ["Oyuncular","Sanat ve teknik ekip","Figüranlar"];
  const tabs = [0,1,2].map(i => ({i, cs:[...cats].filter(c => grp(c[0]) === i)})).filter(x => x.cs.length);
  const pc = cs => cs.reduce((s,[,g]) => s + cnt(g), 0);
  return `<div class="ptabs">${tabs.map(x => `<button type="button" data-jump="kg${x.i}"><b>${pc(x.cs)}</b>${GN[x.i]}</button>`).join("")}</div>` +
    tabs.map(x => `<div class="kgroup" id="kg${x.i}"><h2 class="kg-h">${GN[x.i]}<span>${pc(x.cs)} kişi</span></h2>${x.cs.map(([k,g]) => {
    const fig = isFigCat(k);
    return `<section class="kcard${fig ? " fig" : ""}"><h3>${esc(k)}${fig ? `<i class="tag">${cnt(g)} kişi</i>` : ""}</h3>${[...g].map(([gr, ts]) => {
      const n = ts.filter(t => stripTag(t)).length;
      return (fig || n > 6)
        ? `<div class="kr bulk">${gr !== "—" ? `<div class="g">${esc(gr)} <i class="tag">${n}</i></div>` : ""}<div class="names">${nm(ts)}</div></div>`
        : `<div class="kr"><div class="g">${esc(gr)}</div><div class="p">${nm(ts)}</div></div>`;
    }).join("")}</section>`;
  }).join("")}</div>`).join("");
}
function viewPanel(){
  const refresh = `<button class="btn" type="button" data-act="refresh">Yenile</button>`;
  if (PERR) return `<div class="pagehead"><div><span class="eyebrow">İZMİR DEVLET TİYATROSU</span><h1>Ana panel</h1></div><div>${refresh}</div></div><div class="empty err"><h2>Oyunlar okunamadı</h2><p>İnternet bağlantınızı kontrol edip <b>Yenile</b>\'ye basın.</p></div>`;
  if (!PD) return `<div class="pagehead"><div><span class="eyebrow">İZMİR DEVLET TİYATROSU</span><h1>Ana panel</h1></div></div>${skel(true)}`;
  const p = openPlay && PD.plays.find(x => x.name === openPlay);
  if (p) {
    const s = p.season, facts = s ? [["Prömiyer tarihi",s.tar],["Prömiyer sezonu",s.sez],["Temsil edilen sezon sayısı",s.say]].filter(x => x[1] !== "").map(([l,v]) => `<div><span>${l}</span><b>${esc(v)}</b></div>`).join("") : "";
    return `<div class="pagehead"><div><a class="back" href="#panel">← Tüm oyunlar</a><span class="eyebrow">OYUN KÜNYESİ</span><h1>${esc(p.name)}</h1>
      <p class="sub">${p.kisi} kişi${p.fig ? " · " + p.fig + " figüran" : ""}</p></div><div>${refresh}</div></div>
      <div class="play"><div class="poster"><div class="pbox">${posterHtml(p)}</div></div>
      <div class="kunye">${facts ? `<div class="facts">${facts}</div>` : ""}${kunyeHtml(p)}</div></div>`;
  }
  const seg = [["tumu","Tümü"],["cocuk","Çocuk oyunları"],["yetiskin","Yetişkin oyunları"]].map(([k,l]) => `<button type="button" aria-pressed="${pf === k}" data-pf="${k}">${l}</button>`).join("");
  return `<div class="pagehead"><div><span class="eyebrow">İZMİR DEVLET TİYATROSU</span><h1>Ana panel</h1><p class="sub">${PD.plays.length} oyun · ${PD.nPeople} kişi · ${PD.nFig} figüran</p></div><div>${refresh}</div></div>
        <div class="controls"><input id="pq" class="search" type="search" placeholder="Oyun ara…" value="${esc(pq)}" autocomplete="off"><div class="seg" role="group" aria-label="Tür">${seg}</div></div>
    <div id="pgrid">${gridHtml()}</div>`;
}

/* ---- yönlendirme: #programlar/<birim>/<hafta> ---- */
function route(){
  const parts = (location.hash || "#programlar").slice(1).split("/"), page = parts[0];
  if (page === "programlar") { if (parts[1] && UNITS.some(x => x[0] === parts[1])) unit = parts[1]; week = parts[2] || null; }
  else if (page === "panel") { try { openPlay = parts[1] ? decodeURIComponent(parts[1]) : null; } catch(e){ openPlay = null; } }
  else { location.hash = "#programlar"; return; }
  cur = page; buildNav(); render(); window.scrollTo(0,0);
  if (page === "panel" && !PD && !PBUSY) loadPanel();
}
function skel(grid){ return grid ? `<div class="pgrid">${Array.from({length:12},() => `<div class="pc sk"><div class="im"></div><div class="nm"><i></i><i></i></div></div>`).join("")}</div>`
  : `<div class="sheet sk"><i></i><i></i>${Array.from({length:7},() => "<b></b>").join("")}</div>`; }
function render(){ $("#main").innerHTML = `<div class="view">${cur === "panel" ? viewPanel() : viewProgramlar()}</div>`; }
function buildNav(){
  const quick = [["Ana panel","#panel"],["Haftalık program","#programlar"]].map(([l,h]) => `<a class="q${h === "#" + cur ? " on" : ""}" href="${h}">${l}</a>`).join("");
  $("#nav").innerHTML = quick;
  let ov = $("#ov");
  if (!ov) { ov = document.createElement("div"); ov.id = "ov"; ov.setAttribute("aria-hidden","true"); document.body.appendChild(ov); }
  ov.innerHTML = `<div class="ov-in">${NAV.map((g,gi) => `<section style="--d:${gi}"><h4>${g.g}</h4>${g.items.map(([l,h,ext]) =>
    `<a href="${h}"${h === "#" + cur ? ' class="on" aria-current="page"' : ""}${ext ? ' target="_blank" rel="noopener"' : ""}>${l}${ext ? " ↗" : ""}</a>`).join("")}</section>`).join("")}</div>`;
}
function setOv(o){ document.body.classList.toggle("ov-open", o); $("#menu").setAttribute("aria-expanded", o); $("#ov").setAttribute("aria-hidden", !o); }
function closeMenus(){ document.querySelectorAll(".dd.open").forEach(d => { d.classList.remove("open"); d.firstChild.setAttribute("aria-expanded","false"); }); }
async function refresh(){
  LOADERR = ""; DATA = null; render();
  try { DATA = await load(); } catch(e){ LOADERR = (e && e.message) || "bilinmeyen"; }
  render();
}

document.addEventListener("click", e => {
  if (e.target.closest("#nav a, #ov a")) { setOv(false); return; }
  if (e.target.id === "ov") { setOv(false); return; }
  if (!e.target.closest(".dd")) closeMenus();
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "menu") { setOv(!document.body.classList.contains("ov-open")); return; }
  if (t.classList.contains("dd-b")) { const d = t.parentNode, was = d.classList.contains("open"); closeMenus(); if (!was) { d.classList.add("open"); t.setAttribute("aria-expanded","true"); } return; }
  if (t.dataset.jump) { document.getElementById(t.dataset.jump)?.scrollIntoView({behavior:"smooth"}); return; }
  if (t.dataset.unit) { location.hash = "#programlar/" + t.dataset.unit; }
  else if (t.dataset.week) { location.hash = "#programlar/" + unit + "/" + t.dataset.week; }
  else if (t.dataset.act === "print") window.print();
  else if (t.dataset.pf) { pf = t.dataset.pf; render(); }
  else if (t.dataset.act === "refresh") { if (cur === "panel") loadPanel(true); else refresh(); }
});
document.addEventListener("input", e => { if (e.target.id === "pq") { pq = e.target.value; const g = $("#pgrid"); if (g) g.innerHTML = gridHtml(); } });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeMenus(); setOv(false); } });
window.addEventListener("hashchange", route);
window.addEventListener("scroll", () => $(".top").classList.toggle("scrolled", scrollY > 6), {passive:true});
route(); refresh();
