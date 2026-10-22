"use strict";
const OLD = "eski.html";
const API = "https://tiyatro-backend.vercel.app/api/sheets/" + encodeURIComponent("HAFTALIK PROGRAM") + "?fresh=1";
const UNITS = [["dekor","Dekor Aksesuar"],["kondvit","Kondüvit"],["isik","Işık"],["erkek","Erkek Terzi"],["kadin","Kadın Terzi"],["peruka","Peruka"]];
/* Henüz taşınmamış ekranlar eski siteye gider (eski.html); taşındıkça burada #hash'e dönüşür. */
const NAV = [
  {g:"Repertuvar", items:[["Ana panel",OLD+"#panel"],["Dağılım",OLD+"#dagilim"],["İstatistik",OLD+"#grafik"]]},
  {g:"Kadro", items:[["Kişiler",OLD+"#kisiler"],["Figüran",OLD+"#figuran"],["Sorgulama",OLD+"#sorgu"]]},
  {g:"Programlar", items:[["Haftalık program","#programlar"],["Aylık program",OLD+"#program"]]},
  {g:"Yönetim", items:[["Görevli olmayan",OLD+"#gorevsiz"],["Arşiv oyunlar",OLD+"#arsiv"],["Yönetim",OLD+"#yonetim"],["Turne takip","turne.html",true]]}
];
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const b64u = b => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); };
const tsLabel = ts => { try { return new Date(ts).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); } catch(e){ return ""; } };

let DATA = null, LOADERR = "", unit = "dekor", week = null;

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
  if (!DATA && !LOADERR) content = `<p class="sub">Programlar yükleniyor…</p>`;
  else if (LOADERR) content = `<div class="empty err"><h2>Programlar okunamadı</h2><p>Bağlantı hatası (${esc(LOADERR)}). Biraz sonra Yenile'ye basın.</p></div>`;
  else if (!w) content = `<div class="empty"><h2>${esc(uname)} için onaylı hafta yok</h2><p>Birim sorumlusu haftalık programı onayladığında burada görünür.</p></div>`;
  else content = (w.note ? `<div class="note">${esc(w.note)}</div>` : "") + docHtml(w.doc);
  return `<div class="pagehead"><div><h1>Haftalık program</h1><p class="sub">${esc(uname)} birimi${w ? " · " + esc(w.label) : ""}</p></div>
    <div>${w ? `<span class="chip">Onay: ${esc(tsLabel(w.ts))}</span> ` : ""}<button class="btn" type="button" data-act="refresh">Yenile</button> ${w ? `<button class="btn pri" type="button" data-act="print">Yazdır / PDF</button>` : ""}</div></div>
    <div class="controls"><div class="seg" role="group" aria-label="Birim"><span class="lbl">Birim</span>${units}</div>
    ${list.length ? `<div class="seg" role="group" aria-label="Hafta"><span class="lbl">Hafta</span>${weeks}</div>` : ""}</div>${content}`;
}

/* ---- yönlendirme: #programlar/<birim>/<hafta> ---- */
function route(){
  const [page, u, wk] = (location.hash || "#programlar").slice(1).split("/");
  if (u && UNITS.some(x => x[0] === u)) unit = u;
  week = wk || null;
  if (page !== "programlar") { location.hash = "#programlar"; return; }
  render();
}
function render(){
  $("#main").innerHTML = viewProgramlar();
  document.title = "Haftalık program · İzmir Devlet Tiyatrosu";
}
function buildNav(){
  $("#nav").innerHTML = NAV.map(g => {
    const on = g.items.some(i => i[1] === "#programlar");
    return `<div class="dd${on?" on":""}"><button class="dd-b" type="button" aria-expanded="false">${g.g}</button><div class="dd-m">${g.items.map(([l,h,ext]) =>
      `<a href="${h}"${(h==="#programlar"?" aria-current=\"page\"":"")+(" class=\""+[h==="#programlar"?"on":"",ext?"ext":""].join(" ").trim()+"\"")}${ext?' target="_blank" rel="noopener"':""}>${l}</a>`).join("")}</div></div>`;
  }).join("");
}
function closeMenus(){ document.querySelectorAll(".dd.open").forEach(d => { d.classList.remove("open"); d.firstChild.setAttribute("aria-expanded","false"); }); }
async function refresh(){
  LOADERR = ""; DATA = null; render();
  try { DATA = await load(); } catch(e){ LOADERR = (e && e.message) || "bilinmeyen"; }
  render();
}

document.addEventListener("click", e => {
  if (e.target.closest("#nav a")) { $("#nav").classList.remove("open"); $("#menu").setAttribute("aria-expanded","false"); closeMenus(); return; }
  if (!e.target.closest(".dd")) closeMenus();
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "menu") { const o = $("#nav").classList.toggle("open"); t.setAttribute("aria-expanded", o); return; }
  if (t.classList.contains("dd-b")) { const d = t.parentNode, was = d.classList.contains("open"); closeMenus(); if (!was) { d.classList.add("open"); t.setAttribute("aria-expanded","true"); } return; }
  if (t.dataset.unit) { location.hash = "#programlar/" + t.dataset.unit; }
  else if (t.dataset.week) { location.hash = "#programlar/" + unit + "/" + t.dataset.week; }
  else if (t.dataset.act === "print") window.print();
  else if (t.dataset.act === "refresh") refresh();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenus(); });
window.addEventListener("hashchange", route);
buildNav(); route(); refresh();
