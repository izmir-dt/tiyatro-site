/* ════════════════════════════════════════════════════════════════
   TURNE ASİSTANI v4.0
   İzmir Devlet Tiyatrosu
   YENİ: Turne düzenleme · Hatırlatıcı · Detaylı istatistik
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.__turneAsistanLoaded) return;
  window.__turneAsistanLoaded = true;

  const API = "https://turne-backend.vercel.app/api/sheets";
  const TURNE_SHEET = "TURNE_KAYITLARI";
  const ISTATISTIK_URL = "./istatistik.html";
  const LOGO_URL = "https://izmir-dt.github.io/tiyatro-site/tiyatro-site/favicon.png";
  const STORAGE_KEY = "ta_hatirlaticilar_v1";

  /* ─────────────────── CSS ─────────────────── */
  const css = `
  #ta-fab{position:fixed;bottom:24px;right:24px;z-index:9500;width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;
    box-shadow:0 6px 20px rgba(107,14,30,.45),0 2px 8px rgba(0,0,0,.2);
    display:flex;align-items:center;justify-content:center;transition:transform .15s,box-shadow .2s;animation:taPulse 3s ease-in-out infinite;}
  #ta-fab:hover{transform:scale(1.08);} #ta-fab:active{transform:scale(.94);}
  #ta-fab-badge{position:absolute;top:-4px;right:-4px;background:#E53E3E;color:#fff;font-size:10px;font-weight:800;
    border-radius:99px;min-width:18px;height:18px;display:none;align-items:center;justify-content:center;
    border:2px solid #fff;padding:0 4px;line-height:1;}
  #ta-fab-badge.show{display:flex;}
  @keyframes taPulse{0%,100%{box-shadow:0 6px 20px rgba(107,14,30,.45),0 0 0 0 rgba(160,25,46,.4);}
                     50%{box-shadow:0 6px 24px rgba(107,14,30,.6),0 0 0 10px rgba(160,25,46,0);}}

  /* Panel */
  #ta-panel{position:fixed;right:24px;bottom:90px;z-index:9501;
    width:440px;max-width:calc(100vw - 32px);height:640px;max-height:calc(100vh - 120px);
    background:#FBF8F3;border:1px solid #E0D5CC;border-radius:18px;
    display:flex;flex-direction:column;
    box-shadow:0 28px 70px rgba(20,8,4,.24),0 4px 16px rgba(20,8,4,.12);
    opacity:0;pointer-events:none;transform:translateY(16px) scale(.97);
    transition:opacity .22s,transform .22s;overflow:hidden;
    font-family:'Inter','DM Sans',system-ui,sans-serif;min-width:300px;min-height:420px;}
  #ta-panel.open{opacity:1;pointer-events:all;transform:none;}
  #ta-panel.dragging,#ta-panel.resizing{transition:none;user-select:none;}

  /* Resize köşe */
  #ta-resize{position:absolute;right:0;bottom:0;width:20px;height:20px;cursor:se-resize;z-index:10;
    display:flex;align-items:flex-end;justify-content:flex-end;padding:5px;}
  #ta-resize svg{opacity:.28;transition:opacity .15s;} #ta-resize:hover svg{opacity:.6;}

  /* Başlık */
  #ta-head{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.12);
    display:flex;align-items:center;gap:9px;
    background:linear-gradient(135deg,#A0192E 0%,#6B0E1E 100%);
    color:#fff;flex-shrink:0;cursor:grab;user-select:none;border-radius:18px 18px 0 0;}
  #ta-head:active{cursor:grabbing;}
  .ta-logo{width:30px;height:30px;border-radius:7px;overflow:hidden;flex-shrink:0;
    background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;}
  .ta-logo img{width:100%;height:100%;object-fit:cover;border-radius:7px;}
  .ta-logo-fb{font-weight:900;font-size:10px;color:#fff;display:none;}
  .ta-title{font-size:13px;font-weight:800;line-height:1.1;}
  .ta-sub{font-size:10px;font-weight:500;opacity:.8;margin-top:1px;}
  .ta-hbtns{display:flex;align-items:center;gap:4px;margin-left:auto;}
  .ta-hbtn{height:26px;border-radius:7px;border:1px solid rgba(255,255,255,.22);
    background:rgba(255,255,255,.1);color:#fff;font-size:13px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0;padding:0 7px;gap:4px;
    font-family:inherit;white-space:nowrap;}
  .ta-hbtn:hover{background:rgba(255,255,255,.26);}
  .ta-hbtn.sm{font-size:10px;font-weight:700;letter-spacing:.2px;}

  /* SEKMELİ NAVİGASYON */
  #ta-tabs{display:flex;background:#fff;border-bottom:1px solid #E8E2D7;flex-shrink:0;}
  .ta-tab{flex:1;padding:8px 4px;border:none;background:transparent;font-size:11px;font-weight:700;
    color:#8A857C;cursor:pointer;font-family:inherit;transition:all .15s;border-bottom:2px solid transparent;
    display:flex;align-items:center;justify-content:center;gap:4px;}
  .ta-tab:hover{color:#A0192E;background:#FBF8F3;}
  .ta-tab.active{color:#A0192E;border-bottom-color:#A0192E;background:#FBF8F3;}
  .ta-tab-badge{background:#A0192E;color:#fff;border-radius:99px;font-size:9px;font-weight:800;
    min-width:15px;height:15px;display:inline-flex;align-items:center;justify-content:center;padding:0 3px;}

  /* Sekmeler içeriği */
  .ta-view{flex:1;overflow:hidden;display:none;flex-direction:column;}
  .ta-view.active{display:flex;}

  /* ── SOHBET GÖRÜNÜMÜ ── */
  #ta-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#FBF8F3;scroll-behavior:smooth;}
  #ta-msgs::-webkit-scrollbar{width:4px;} #ta-msgs::-webkit-scrollbar-thumb{background:#D9C9BD;border-radius:4px;}
  .ta-msg{max-width:92%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.58;white-space:pre-wrap;word-wrap:break-word;animation:taFadeIn .18s ease;}
  @keyframes taFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .ta-msg.user{align-self:flex-end;background:#A0192E;color:#fff;border-bottom-right-radius:4px;}
  .ta-msg.bot{align-self:flex-start;background:#fff;color:#1A1A1A;border:1px solid #E8E2D7;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.04);}
  .ta-msg.bot strong{color:#A0192E;font-weight:700;}
  .ta-msg.bot a.ta-phone{color:#A0192E;font-weight:700;text-decoration:none;border-bottom:1px dashed rgba(160,25,46,.35);}
  .ta-msg.bot a.ta-phone:hover{border-bottom-style:solid;}
  .ta-inline-copy,.ta-inline-aktar{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 10px;
    border-radius:7px;border:1.5px solid #E8E2D7;background:#FBF8F3;font-size:11px;font-weight:700;
    cursor:pointer;font-family:inherit;color:#4A4A4A;transition:all .15s;margin:6px 4px 2px 0;vertical-align:middle;}
  .ta-inline-copy:hover{border-color:#A0192E;color:#A0192E;background:#FBE8EB;}
  .ta-inline-aktar{background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;border-color:transparent;}
  .ta-inline-aktar:hover{opacity:.88;}
  .ta-badge{display:inline-block;background:#FBE8EB;color:#7A0E1E;border-radius:5px;padding:1px 6px;font-size:10.5px;font-weight:700;}
  .ta-dismiss{float:right;margin-left:8px;margin-top:-2px;background:none;border:none;cursor:pointer;
    color:rgba(160,25,46,.4);font-size:16px;line-height:1;padding:0 2px;transition:color .15s;}
  .ta-dismiss:hover{color:#A0192E;}
  .ta-typing{display:inline-flex;gap:4px;padding:8px 2px;}
  .ta-typing span{width:6px;height:6px;border-radius:50%;background:#A0192E;animation:taDot 1.2s infinite;}
  .ta-typing span:nth-child(2){animation-delay:.15s;}.ta-typing span:nth-child(3){animation-delay:.3s;}
  @keyframes taDot{0%,60%,100%{opacity:.3;transform:translateY(0);}30%{opacity:1;transform:translateY(-4px);}}
  #ta-sugs{padding:0 12px 8px;display:flex;flex-wrap:wrap;gap:5px;background:#FBF8F3;}
  .ta-sug{font-size:11px;padding:5px 10px;border:1px solid #E8E2D7;background:#fff;border-radius:999px;cursor:pointer;
    color:#4A4A4A;transition:all .15s;white-space:nowrap;}
  .ta-sug:hover{border-color:#A0192E;color:#A0192E;background:#FBE8EB;}
  #ta-form{padding:9px 11px;border-top:1px solid #E8E2D7;display:flex;gap:7px;background:#fff;flex-shrink:0;align-items:flex-end;}
  #ta-input{flex:1;border:1.5px solid #E8E2D7;border-radius:11px;padding:7px 11px;font-size:12.5px;outline:none;
    font-family:inherit;background:#FBF8F3;resize:none;max-height:80px;line-height:1.4;transition:border-color .15s;
    overflow:hidden;}
  #ta-input:focus{border-color:#A0192E;background:#fff;box-shadow:0 0 0 3px rgba(160,25,46,.1);}
  #ta-input::placeholder{color:#B0A99E;font-size:12px;}
  #ta-send{width:36px;height:36px;border:none;border-radius:10px;
    background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;cursor:pointer;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .1s;}
  #ta-send:hover{transform:scale(1.05);} #ta-send:disabled{opacity:.35;cursor:not-allowed;transform:none;}
  #ta-foot{font-size:10px;text-align:center;color:#9A9490;padding:4px 12px 8px;background:#fff;}

  /* ── DÜZENLEME GÖRÜNÜMÜ ── */
  #ta-edit-view{background:#FBF8F3;}
  .ta-edit-header{padding:10px 14px;background:#fff;border-bottom:1px solid #E8E2D7;display:flex;align-items:center;gap:8px;}
  .ta-edit-header select{flex:1;border:1.5px solid #E8E2D7;border-radius:8px;padding:6px 10px;font-size:12.5px;
    font-family:inherit;background:#FBF8F3;outline:none;color:#1A1A1A;cursor:pointer;}
  .ta-edit-header select:focus{border-color:#A0192E;}
  .ta-edit-body{flex:1;overflow-y:auto;padding:12px;}
  .ta-edit-body::-webkit-scrollbar{width:4px;} .ta-edit-body::-webkit-scrollbar-thumb{background:#D9C9BD;border-radius:4px;}
  .ta-field{margin-bottom:10px;}
  .ta-field label{display:block;font-size:11px;font-weight:700;color:#6B0E1E;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;}
  .ta-field input,.ta-field textarea,.ta-field select{width:100%;border:1.5px solid #E8E2D7;border-radius:8px;
    padding:7px 10px;font-size:12.5px;font-family:inherit;background:#fff;outline:none;color:#1A1A1A;transition:border-color .15s;box-sizing:border-box;}
  .ta-field input:focus,.ta-field textarea:focus,.ta-field select:focus{border-color:#A0192E;box-shadow:0 0 0 3px rgba(160,25,46,.08);}
  .ta-field textarea{resize:vertical;min-height:60px;}
  .ta-field-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .ta-section-title{font-size:11px;font-weight:800;color:#A0192E;text-transform:uppercase;letter-spacing:.5px;
    padding:8px 0 6px;border-bottom:1.5px solid #E8E2D7;margin-bottom:8px;}
  .ta-edit-actions{padding:10px 12px;background:#fff;border-top:1px solid #E8E2D7;display:flex;gap:8px;flex-shrink:0;}
  .ta-btn{height:34px;padding:0 14px;border-radius:8px;border:none;font-size:12.5px;font-weight:700;
    cursor:pointer;font-family:inherit;transition:all .15s;display:inline-flex;align-items:center;gap:5px;}
  .ta-btn-primary{background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;}
  .ta-btn-primary:hover{opacity:.9;}
  .ta-btn-secondary{background:#F0EBE5;color:#6B0E1E;border:1.5px solid #E0D5CC;}
  .ta-btn-secondary:hover{background:#E8E2D7;}
  .ta-btn-danger{background:#FBE8EB;color:#A0192E;border:1.5px solid #F0C4CB;}
  .ta-btn-danger:hover{background:#F5D0D8;}
  .ta-save-status{font-size:11px;color:#2F7D4E;font-weight:600;margin-left:auto;display:flex;align-items:center;gap:4px;}

  /* ── HAT IRLATICI GÖRÜNÜMÜ ── */
  #ta-remind-view{background:#FBF8F3;}
  .ta-remind-body{flex:1;overflow-y:auto;padding:12px;}
  .ta-remind-body::-webkit-scrollbar{width:4px;} .ta-remind-body::-webkit-scrollbar-thumb{background:#D9C9BD;border-radius:4px;}
  .ta-remind-add{background:#fff;border:1.5px dashed #D9C9BD;border-radius:12px;padding:12px;margin-bottom:10px;cursor:pointer;
    text-align:center;font-size:12px;font-weight:700;color:#8A857C;transition:all .15s;}
  .ta-remind-add:hover{border-color:#A0192E;color:#A0192E;background:#FBE8EB;}
  .ta-remind-form{background:#fff;border:1.5px solid #E0D5CC;border-radius:12px;padding:12px;margin-bottom:10px;}
  .ta-remind-form .ta-field{margin-bottom:8px;}
  .ta-remind-form .ta-field:last-child{margin-bottom:0;}
  .ta-remind-item{background:#fff;border:1px solid #E8E2D7;border-radius:10px;padding:10px 12px;margin-bottom:8px;
    display:flex;align-items:flex-start;gap:8px;transition:box-shadow .15s;}
  .ta-remind-item:hover{box-shadow:0 2px 8px rgba(0,0,0,.08);}
  .ta-remind-item.overdue{border-color:#F0C4CB;background:#FFF8F8;}
  .ta-remind-item.today{border-color:#A0192E;background:#FBE8EB;}
  .ta-remind-item.done{opacity:.5;}
  .ta-remind-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;
    font-size:16px;flex-shrink:0;}
  .ta-remind-content{flex:1;min-width:0;}
  .ta-remind-text{font-size:12.5px;font-weight:700;color:#1A1A1A;line-height:1.35;word-break:break-word;}
  .ta-remind-meta{font-size:11px;color:#8A857C;margin-top:3px;}
  .ta-remind-meta strong{color:#A0192E;}
  .ta-remind-actions{display:flex;gap:4px;flex-shrink:0;}
  .ta-remind-btn{width:26px;height:26px;border-radius:6px;border:1px solid #E8E2D7;background:#FBF8F3;
    cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s;color:#6B0E1E;}
  .ta-remind-btn:hover{background:#FBE8EB;border-color:#F0C4CB;}
  .ta-remind-empty{text-align:center;padding:40px 20px;color:#B0A99E;}
  .ta-remind-empty-icon{font-size:32px;margin-bottom:8px;}
  .ta-remind-empty-text{font-size:13px;font-weight:600;}

  /* ── İSTATİSTİK GÖRÜNÜMÜ ── */
  #ta-stat-view{background:#FBF8F3;}
  .ta-stat-body{flex:1;overflow-y:auto;padding:12px;}
  .ta-stat-body::-webkit-scrollbar{width:4px;} .ta-stat-body::-webkit-scrollbar-thumb{background:#D9C9BD;border-radius:4px;}
  .ta-kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;}
  .ta-kpi{background:#fff;border:1px solid #E8E2D7;border-radius:10px;padding:10px 12px;text-align:center;}
  .ta-kpi-val{font-size:22px;font-weight:900;color:#A0192E;line-height:1;}
  .ta-kpi-lbl{font-size:10px;font-weight:700;color:#8A857C;text-transform:uppercase;letter-spacing:.4px;margin-top:3px;}
  .ta-stat-section{background:#fff;border:1px solid #E8E2D7;border-radius:10px;padding:10px 12px;margin-bottom:8px;}
  .ta-stat-section-title{font-size:11px;font-weight:800;color:#A0192E;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;}
  .ta-stat-row{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #F0EBE5;}
  .ta-stat-row:last-child{border-bottom:none;}
  .ta-stat-rank{font-size:10px;font-weight:800;color:#B0A99E;width:16px;text-align:right;flex-shrink:0;}
  .ta-stat-name{flex:1;font-size:12px;font-weight:600;color:#1A1A1A;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ta-stat-val{font-size:12px;font-weight:800;color:#A0192E;flex-shrink:0;}
  .ta-stat-bar-wrap{height:4px;background:#F0EBE5;border-radius:2px;flex:1;max-width:60px;}
  .ta-stat-bar{height:4px;background:#A0192E;border-radius:2px;transition:width .3s;}
  .ta-stat-month{display:flex;align-items:flex-end;gap:4px;height:60px;padding-top:8px;}
  .ta-stat-month-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;}
  .ta-stat-month-bar{width:100%;background:#A0192E;border-radius:3px 3px 0 0;min-height:2px;transition:height .3s;}
  .ta-stat-month-lbl{font-size:8px;font-weight:700;color:#8A857C;}
  .ta-stat-month-val{font-size:9px;font-weight:800;color:#A0192E;}

  /* ── REHBER GÖRÜNÜMÜ ── */
  #ta-rehber-view{background:#FBF8F3;}
  .ta-rehber-toolbar{padding:10px 12px;background:#fff;border-bottom:1px solid #E8E2D7;display:flex;gap:7px;align-items:center;flex-shrink:0;}
  .ta-rehber-search{flex:1;border:1.5px solid #E8E2D7;border-radius:9px;padding:6px 10px 6px 30px;font-size:12.5px;
    font-family:inherit;background:#FBF8F3;outline:none;color:#1A1A1A;transition:border-color .15s;}
  .ta-rehber-search:focus{border-color:#A0192E;background:#fff;}
  .ta-rehber-search-wrap{position:relative;flex:1;}
  .ta-rehber-search-icon{position:absolute;left:9px;top:50%;transform:translateY(-50%);pointer-events:none;color:#B0A99E;}
  .ta-rehber-filter{border:1.5px solid #E8E2D7;border-radius:9px;padding:6px 8px;font-size:11.5px;
    font-family:inherit;background:#FBF8F3;outline:none;color:#1A1A1A;cursor:pointer;}
  .ta-rehber-filter:focus{border-color:#A0192E;}
  .ta-rehber-body{flex:1;overflow-y:auto;padding:10px;}
  .ta-rehber-body::-webkit-scrollbar{width:4px;}.ta-rehber-body::-webkit-scrollbar-thumb{background:#D9C9BD;border-radius:4px;}
  .ta-rehber-card{background:#fff;border:1px solid #E8E2D7;border-radius:10px;margin-bottom:8px;overflow:hidden;transition:box-shadow .15s;}
  .ta-rehber-card:hover{box-shadow:0 3px 12px rgba(0,0,0,.09);}
  .ta-rehber-card-head{padding:10px 12px;display:flex;align-items:flex-start;gap:8px;}
  .ta-rehber-icon{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
  .ta-rehber-info{flex:1;min-width:0;}
  .ta-rehber-name{font-size:13px;font-weight:700;color:#1A1A1A;line-height:1.2;word-break:break-word;}
  .ta-rehber-tel{font-size:12px;font-weight:700;color:#A0192E;margin-top:2px;display:flex;align-items:center;gap:5px;}
  .ta-rehber-tel a{color:#A0192E;text-decoration:none;}
  .ta-rehber-tel a:hover{text-decoration:underline;}
  .ta-rehber-adres{font-size:11px;color:#6A6560;margin-top:3px;line-height:1.4;}
  .ta-rehber-tag{display:inline-block;background:#FBE8EB;color:#7A0E1E;border-radius:4px;padding:1px 6px;font-size:9.5px;font-weight:800;margin-top:4px;}
  .ta-rehber-actions{padding:0 12px 10px;display:flex;gap:6px;}
  .ta-rehber-btn{height:28px;padding:0 10px;border-radius:7px;border:1.5px solid #E8E2D7;background:#FBF8F3;
    font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:4px;
    color:#4A4A4A;transition:all .15s;}
  .ta-rehber-btn:hover{border-color:#A0192E;color:#A0192E;background:#FBE8EB;}
  .ta-rehber-btn.copied{border-color:#2F7D4E;color:#2F7D4E;background:#EDF7F1;}
  .ta-rehber-btn.aktar{background:linear-gradient(135deg,#A0192E,#6B0E1E);color:#fff;border-color:transparent;}
  .ta-rehber-btn.aktar:hover{opacity:.88;}
  .ta-rehber-empty{text-align:center;padding:40px 20px;color:#B0A99E;font-size:12.5px;font-weight:600;}

  /* Kopyalama toast */
  #ta-toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(10px);background:#1A1A1A;color:#fff;
    font-size:12px;font-weight:600;padding:8px 16px;border-radius:20px;opacity:0;pointer-events:none;
    transition:opacity .2s,transform .2s;z-index:9999;white-space:nowrap;}
  #ta-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}

  @media(max-width:600px){
    #ta-panel{width:calc(100vw - 16px);right:8px;bottom:80px;height:calc(100vh - 100px);}
    #ta-fab{bottom:16px;right:16px;width:50px;height:50px;}
  }

  /* ── GÜNÜN SÖZÜ BANNER ── */
  #ta-quote-banner{background:linear-gradient(135deg,#6B0E1E 0%,#3a0710 100%);color:#fff;padding:8px 14px 8px 12px;
    font-size:11px;line-height:1.55;display:flex;align-items:flex-start;gap:8px;flex-shrink:0;cursor:pointer;transition:opacity .2s;}
  #ta-quote-banner:hover{opacity:.88;}
  #ta-quote-banner .ta-q-icon{font-size:15px;flex-shrink:0;margin-top:1px;opacity:.8;}
  #ta-quote-banner .ta-q-text{flex:1;font-style:italic;opacity:.93;}
  #ta-quote-banner .ta-q-auth{display:block;font-style:normal;font-size:10px;opacity:.65;margin-top:2px;}
  #ta-quote-banner .ta-q-close{background:none;border:none;color:rgba(255,255,255,.5);font-size:14px;cursor:pointer;padding:0 2px;flex-shrink:0;line-height:1;transition:color .15s;}
  #ta-quote-banner .ta-q-close:hover{color:#fff;}

  /* ── GERİ SAYIM ── */
  .ta-countdown-card{background:#fff;border:1px solid #E8E2D7;border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;}
  .ta-countdown-num{font-size:28px;font-weight:900;color:#A0192E;line-height:1;min-width:36px;text-align:center;}
  .ta-countdown-info{flex:1;min-width:0;}
  .ta-countdown-label{font-size:10px;font-weight:700;color:#8A857C;text-transform:uppercase;letter-spacing:.4px;}
  .ta-countdown-title{font-size:13px;font-weight:700;color:#1A1A1A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .ta-countdown-date{font-size:11px;color:#8A857C;margin-top:2px;}

  /* ── KUTLAMA ANİMASYONU ── */
  @keyframes taCelebrate{0%{transform:scale(0.5) rotate(-10deg);opacity:0;}50%{transform:scale(1.15) rotate(3deg);}100%{transform:scale(1) rotate(0deg);opacity:1;}}
  .ta-celebrate{background:linear-gradient(135deg,#FFD700,#FFA500);color:#7A3800;border-radius:12px;padding:12px 14px;margin:6px 0;animation:taCelebrate .5s ease-out;text-align:center;font-weight:800;font-size:13px;}
  .ta-celebrate .ta-cel-emoji{font-size:28px;display:block;margin-bottom:4px;}
  .ta-celebrate .ta-cel-sub{font-size:11px;font-weight:600;opacity:.8;margin-top:2px;}

  /* ── LİDERLİK TABLOSU ── */
  .ta-lb-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #F0EBE5;}
  .ta-lb-row:last-child{border-bottom:none;}
  .ta-lb-medal{font-size:14px;width:22px;text-align:center;flex-shrink:0;}
  .ta-lb-name{flex:1;font-size:12.5px;font-weight:600;color:#1A1A1A;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ta-lb-bar-wrap{height:5px;background:#F0EBE5;border-radius:3px;width:60px;}
  .ta-lb-bar{height:5px;background:#A0192E;border-radius:3px;}
  .ta-lb-val{font-size:11.5px;font-weight:800;color:#A0192E;flex-shrink:0;min-width:50px;text-align:right;}

  /* ── ÇAKIŞMA UYARISI ── */
  .ta-conflict-item{background:#FFF8F8;border:1px solid #F0C4CB;border-radius:8px;padding:9px 11px;margin-bottom:7px;}
  .ta-conflict-name{font-size:12.5px;font-weight:800;color:#A0192E;margin-bottom:4px;}
  .ta-conflict-tours{font-size:11.5px;color:#6A6560;line-height:1.6;}

  /* ── KARŞILAŞTIRMA ── */
  .ta-cmp-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;}
  .ta-cmp-col{background:#fff;border:1px solid #E8E2D7;border-radius:10px;padding:10px 12px;}
  .ta-cmp-col-title{font-size:12px;font-weight:800;color:#A0192E;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .ta-cmp-row{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #F5F0EC;font-size:11.5px;}
  .ta-cmp-row:last-child{border-bottom:none;}
  .ta-cmp-key{color:#8A857C;font-weight:600;}
  .ta-cmp-val{font-weight:700;color:#1A1A1A;text-align:right;max-width:55%;}
  .ta-cmp-val.better{color:#2F7D4E;}
  .ta-cmp-val.worse{color:#B53030;}
  `;
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ─────────────────── DOM ─────────────────── */
  const root = document.createElement("div");
  root.innerHTML = `
    <button id="ta-fab" title="Turne Asistanı" aria-label="Turne Asistanı">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
      </svg>
      <span id="ta-fab-badge"></span>
    </button>

    <div id="ta-panel" role="dialog" aria-label="Turne Asistanı">
      <!-- BAŞLIK -->
      <div id="ta-head">
        <div class="ta-logo">
          <img src="${LOGO_URL}" alt="İDT" onerror="this.style.display='none';document.querySelector('.ta-logo-fb').style.display='flex';">
          <span class="ta-logo-fb">İDT</span>
        </div>
        <div style="min-width:0;">
          <div class="ta-title">Turne Asistanı</div>
          <div class="ta-sub" id="ta-status">Yükleniyor…</div>
        </div>
        <div class="ta-hbtns">
          <button class="ta-hbtn sm" id="ta-stat-btn" title="İstatistik sayfası">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            İSTATİSTİK
          </button>
          <button class="ta-hbtn" id="ta-close" aria-label="Kapat" style="font-size:16px;width:26px;">×</button>
        </div>
      </div>

      <!-- SEKMELİ NAV -->
      <div id="ta-tabs">
        <button class="ta-tab active" data-view="chat">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Asistan
        </button>
        <button class="ta-tab" data-view="remind">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          Hatırlatıcı
          <span class="ta-tab-badge" id="ta-remind-badge" style="display:none"></span>
        </button>
        <button class="ta-tab" data-view="stats">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 17V13M12 17V7M17 17V11"/></svg>
          İstatistik
        </button>
      </div>

      <!-- SOHBET -->
      <div class="ta-view active" id="ta-chat-view">
        <div id="ta-quote-banner" style="display:none">
          <span class="ta-q-icon">🎭</span>
          <span class="ta-q-text"><span id="ta-q-text">…</span><span class="ta-q-auth" id="ta-q-auth"></span></span>
          <button class="ta-q-close" id="ta-q-close" title="Kapat" aria-label="Kapat">×</button>
        </div>
        <div id="ta-msgs"></div>
        <div id="ta-sugs"></div>
        <div id="ta-form">
          <textarea id="ta-input" rows="1" placeholder="Soru yazın…" autocomplete="off"></textarea>
          <button id="ta-send" aria-label="Gönder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div id="ta-foot">Kural tabanlı · LLM kullanılmaz · %100 ücretsiz</div>
      </div>

      <!-- DÜZENLEME -->
      <div class="ta-view" id="ta-edit-view">
        <div class="ta-edit-header">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A0192E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <select id="ta-edit-select"><option value="">— Turne seçin —</option></select>
        </div>
        <div class="ta-edit-body" id="ta-edit-body">
          <div style="text-align:center;padding:40px 20px;color:#B0A99E;">
            <div style="font-size:28px;margin-bottom:8px;">✏️</div>
            <div style="font-size:13px;font-weight:600;">Düzenlemek için bir turne seçin</div>
          </div>
        </div>
      </div>

      <!-- HATIRLATICI -->
      <div class="ta-view" id="ta-remind-view">
        <div class="ta-remind-body" id="ta-remind-body"></div>
      </div>

      <!-- REHBER -->
      <div class="ta-view" id="ta-rehber-view">
        <div class="ta-rehber-toolbar">
          <div class="ta-rehber-search-wrap">
            <svg class="ta-rehber-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="ta-rehber-search" id="ta-rehber-q" type="search" placeholder="Firma, kişi, telefon ara…">
          </div>
          <select class="ta-rehber-filter" id="ta-rehber-cat">
            <option value="">Tümü</option>
            <option value="otel">🏨 Otel</option>
            <option value="nakliye">🚛 Nakliye</option>
            <option value="ulasim">🚌 Ulaşım</option>
            <option value="servis">🔧 Servis</option>
            <option value="diger">👤 Kişiler</option>
          </select>
        </div>
        <div class="ta-rehber-body" id="ta-rehber-body">
          <div class="ta-rehber-empty">Veriler yükleniyor…</div>
        </div>
      </div>

      <!-- İSTATİSTİK -->
      <div class="ta-view" id="ta-stats-view">
        <div class="ta-stat-body" id="ta-stat-body">
          <div style="text-align:center;padding:40px;color:#B0A99E;">
            <div style="font-size:28px;margin-bottom:8px;">📊</div>
            <div style="font-size:13px;font-weight:600;">Veriler yükleniyor…</div>
          </div>
        </div>
      </div>

      <div id="ta-resize" title="Boyutu değiştir">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M9 1L1 9M9 5L5 9" stroke="#6B0E1E" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
    </div>`;
  document.body.appendChild(root);
  // Toast
  const toast = document.createElement("div"); toast.id="ta-toast"; document.body.appendChild(toast);
  function showToast(msg, dur=1800){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),dur);}

  const $i = id => document.getElementById(id);
  const panel = $i("ta-panel"), msgs = $i("ta-msgs"), sugs = $i("ta-sugs");
  const input = $i("ta-input"), send = $i("ta-send"), status = $i("ta-status");
  const head = $i("ta-head"), resizeH = $i("ta-resize");
  const fabBadge = $i("ta-fab-badge"), remindBadge = $i("ta-remind-badge");

  /* ─────────────────── SEKMELER ─────────────────── */
  document.querySelectorAll(".ta-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ta-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".ta-view").forEach(v => v.classList.remove("active"));
      tab.classList.add("active");
      const viewId = "ta-" + tab.dataset.view + "-view";
      $i(viewId)?.classList.add("active");
      if (tab.dataset.view === "stats" && DS) renderStats();
      if (tab.dataset.view === "remind") renderReminders();
      if (tab.dataset.view === "edit" && DS) populateEditSelect();
      if (tab.dataset.view === "rehber" && DS) renderRehber();
    });
  });

  /* ─────────────────── TOGGLE / PANEL ─────────────────── */
  $i("ta-fab").addEventListener("click", () => togglePanel(true));
  $i("ta-close").addEventListener("click", () => togglePanel(false));
  $i("ta-stat-btn").addEventListener("click", () => window.open(ISTATISTIK_URL, "_blank"));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && panel.classList.contains("open")) togglePanel(false);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); togglePanel(!panel.classList.contains("open")); }
  });
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input.value); } });
  send.addEventListener("click", () => submit(input.value));
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 80) + "px"; });

  function togglePanel(open) {
    panel.classList.toggle("open", open);
    if (open) {
      setTimeout(() => input.focus(), 250);
      checkReminders();
      gosterGunSozu();
    }
  }

  /* ─────────────────── SÜRÜKLEME ─────────────────── */
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
      panel.style.right = Math.max(0, Math.min(window.innerWidth - 80, dragState.or - (e.clientX - dragState.sx))) + "px";
      panel.style.bottom = Math.max(0, Math.min(window.innerHeight - 80, dragState.ob - (e.clientY - dragState.sy))) + "px";
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

  /* ─────────────────── VERİ ─────────────────── */
  function _debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  const norm = s => (s || "").toLocaleLowerCase("tr").replace(/i̇/g, "i").replace(/\s+/g, " ").trim();
  let DS = null;

  async function fetchSheet(name) {
    const r = await fetch(`${API}/${encodeURIComponent(name)}`);
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    return r.json();
  }

  function formatTel(raw) {
    if (!raw) return "";
    const s = String(raw).replace(/\s/g, "");
    if (s.includes("e+") || s.includes("E+")) return "0" + String(Math.round(parseFloat(s)));
    return s.startsWith("0") ? s : (s.length === 10 ? "0" + s : s);
  }

  function parseTurneler(data) {
    const rows = data.rows || [];
    const h = (data.headers || []).map(x => (x || "").trim().toLowerCase());
    const fi = (pred, fb) => { const i = h.findIndex(pred); return i >= 0 ? i : fb; };
    const iOyun = fi(x => x.startsWith("oyun"), 0);
    const iIl   = fi(x => x === "il" || x.startsWith("şehir") || x.startsWith("sehir"), 1);
    const iBas  = fi(x => x.startsWith("başla") || x.startsWith("basla"), 2);
    const iBit  = fi(x => x.startsWith("biti"), 3);
    const iMekan= fi(x => x.startsWith("sahne") || x.startsWith("mekan"), 4);
    const iSay  = fi(x => x.startsWith("temsil") || x.startsWith("sayı") || x.startsWith("sayi"), 5);
    const iNot  = fi(x => x === "notlar" || x === "not", 6);
    const iStat = fi(x => x.startsWith("stat"), 7);
    const iOtel = fi(x => x.startsWith("otel") && (x.includes("ad") || x.includes("adı")), 8);
    const iOtelAdres = fi(x => x.startsWith("otel") && x.includes("adre"), 9);
    const iOtelTel   = fi(x => x.startsWith("otel") && x.includes("tel"), 10);
    const iGidis = fi(x => x.startsWith("gidiş") || x.startsWith("gidis"), 11);
    const iGidisSaat = fi(x => (x.startsWith("gidiş") || x.startsWith("gidis")) && x.includes("saat"), 12);
    const iDonus = fi(x => x.startsWith("dönüş") || x.startsWith("donus"), 13);
    const iDonusSaat = fi(x => (x.startsWith("dönüş") || x.startsWith("donus")) && x.includes("saat"), 14);
    const iDur  = fi(x => (x.startsWith("durak") && x.includes("json")) || x === "duraklar", 19);
    const iKat  = fi(x => x.startsWith("katıl") || x.startsWith("katil"), -1);
    let iAna = h.findIndex(x => x.startsWith("anagrup") || x === "ana_grup_id");
    if (iAna < 0) iAna = 42;

    return rows.map(r => {
      if (!r || !Array.isArray(r)) return null;
      const oyun = (r[iOyun] || "").trim();
      if (!oyun || oyun === "Oyun Adı" || oyun === "ID") return null;
      const bas   = (r[iBas] || "").trim();
      const bit   = (r[iBit] || "").trim() || bas;
      const il    = (r[iIl]  || "").trim();
      const mekan = (r[iMekan] || "").trim();
      const sayi  = parseInt(r[iSay]) || 1;
      const not   = (r[iNot]  || "").trim();
      const statu = (r[iStat] || "taslak").trim().toLowerCase().replace(/\s+/g, "-");
      const otelAdi   = (r[iOtel]      || "").trim();
      const otelAdres = (r[iOtelAdres] || "").trim();
      const otelTel   = formatTel(r[iOtelTel]);
      const gidisUlasim = (r[iGidis] || "").trim();
      const gidisSaat   = (r[iGidisSaat] || "").trim();
      const donusUlasim = (r[iDonus] || "").trim();
      const donusSaat   = (r[iDonusSaat] || "").trim();

      let duraklar = [];
      try { const dj = (r[iDur] || "").trim(); if (dj) duraklar = JSON.parse(dj); } catch(e) {}

      let katilimcilar = [];
      if (iKat >= 0) {
        try {
          const kj = (r[iKat] || "").trim();
          if (kj) katilimcilar = JSON.parse(kj).map(p => ({ kisi: (p.kisi||"").trim(), gorev: (p.gorev||"").trim(), kategori: (p.kategori||"").trim() })).filter(p=>p.kisi);
        } catch(e) {}
      }

      const anaGrupId = (r[iAna] || "").toString().trim();
      return { oyun, il, mekan, baslangic: bas, bitis: bit, sayi, not, statu, otelAdi, otelAdres, otelTel, gidisUlasim, gidisSaat, donusUlasim, donusSaat, duraklar, katilimcilar, anaGrupId, _rawIdx: rows.indexOf(r) };
    }).filter(t => t && !t.anaGrupId);
  }

  function parseFirmaRehberi(data) {
    const rows = data.rows || [];
    const h = (data.headers || []).map(x => (x || "").trim().toLowerCase());
    const fi = (pred, fb) => { const i = h.findIndex(pred); return i >= 0 ? i : fb; };
    return rows.map(r => {
      if (!r || !Array.isArray(r)) return null;
      const ad = (r[fi(x=>x==="ad",0)] || "").trim(); if (!ad) return null;
      return { ad, kategori: (r[fi(x=>x.startsWith("katag")||x.startsWith("kateg"),1)]||"").trim(), tel: formatTel(r[fi(x=>x==="tel",2)]), not: (r[fi(x=>x==="not",4)]||"").trim(), kaynak: (r[fi(x=>x.startsWith("kaynak"),5)]||"").trim() };
    }).filter(Boolean);
  }

  function parseDurakOteller(duraklar) {
    return (duraklar||[]).map(d => ({ il:(d.il||"").trim(), mekan:(d.mekan||"").trim(), otelAdi:(d.otelAdi||"").trim(), otelAdres:(d.otelAdres||"").trim(), otelTel:formatTel(d.otelTel), ilgiliKisi:(d.ilgiliKisi||"").trim(), ilgiliTel:formatTel(d.ilgiliTel), oyun:(d.oyun||"").trim() }));
  }

  async function loadData() {
    status.textContent = "Yükleniyor…";
    try {
      const [tData, fData] = await Promise.all([fetchSheet(TURNE_SHEET), fetchSheet("FIRMA_REHBERI").catch(()=>({rows:[],headers:[]}))]);
      const turneler = parseTurneler(tData);
      const firmalar = parseFirmaRehberi(fData);
      DS = { turneler, firmalar };
      const cities = new Set(), ppl = new Set();
      for (const t of turneler) {
        if (t.il) cities.add(t.il);
        for (const d of t.duraklar||[]) if (d.il) cities.add(d.il);
        for (const k of t.katilimcilar) ppl.add(norm(k.kisi));
      }
      status.textContent = `${turneler.length} turne · ${cities.size} şehir · ${ppl.size} personel`;
      populateEditSelect();
      checkReminders();
      renderRehber();  // ön-yükle
    } catch (e) {
      status.textContent = "Bağlantı hatası";
      addMsg("⚠️ Veri alınamadı: " + e.message, "bot");
    }
  }

  /* ─────────────────── YARDIMCILAR ─────────────────── */
  const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const AY_NORM = ["ocak","şubat","mart","nisan","mayıs","haziran","temmuz","ağustos","eylül","ekim","kasım","aralık"];

  /* ── GÜNÜN TİYATRO SÖZÜ ── */
  const TIYATRO_SOZLERI = [
    {text:"Tüm dünya bir sahnedir ve insanlar sadece oyuncular.", auth:"William Shakespeare"},
    {text:"Tiyatro, insanın kendini tanımasının en derin yoludur.", auth:"Bertolt Brecht"},
    {text:"Sahne, gerçeğin aynasıdır; oyuncu ise o aynayı tutan el.", auth:"Konstantin Stanislavski"},
    {text:"İyi bir oyuncu, seyirciye kendini unutturur — kötü bir oyuncu, kendini hatırlatır.", auth:"Molière"},
    {text:"Tiyatro olmadan uygarlık olmaz; sahne, toplumun vicdanıdır.", auth:"Victor Hugo"},
    {text:"Maskemi çıkardığımda başka bir maske buluyorum yüzümde; maskeler sonsuzdur.", auth:"Luigi Pirandello"},
    {text:"Sahnede bir dakikalık gerçek, hayatta bir yıllık yaşantıya bedeldir.", auth:"Eleonora Duse"},
    {text:"Oyunculuk, kendi ruhunu başkasına verme sanatıdır.", auth:"Sarah Bernhardt"},
    {text:"Tiyatro sorular sorar; cevapları seyirciye bırakır.", auth:"Peter Brook"},
    {text:"Sahne ışığı yandığında, dünyanın tüm sorunları kapının dışında kalır.", auth:"Arthur Miller"},
    {text:"Her yeni şehir, yeni bir seyirci; her seyirci, yeni bir ayna.", auth:"İzmir Devlet Tiyatrosu"},
    {text:"Turne yorucu olabilir, ama perde açıldığında her şeyi unutursunuz.", auth:"İzmir Devlet Tiyatrosu"},
  ];
  function gosterGunSozu() {
    const banner = $i("ta-quote-banner");
    if (!banner) return;
    const shown = sessionStorage.getItem("ta_quote_shown");
    if (shown === "1") return;
    const idx = new Date().getDate() % TIYATRO_SOZLERI.length;
    const soz = TIYATRO_SOZLERI[idx];
    $i("ta-q-text").textContent = "\u201c" + soz.text + "\u201d";
    $i("ta-q-auth").textContent = "— " + soz.auth;
    banner.style.display = "flex";
    $i("ta-q-close").addEventListener("click", (e) => { e.stopPropagation(); banner.style.display="none"; sessionStorage.setItem("ta_quote_shown","1"); });
    banner.addEventListener("click", () => { banner.style.display="none"; sessionStorage.setItem("ta_quote_shown","1"); });
  }
  const STATU_MAP = { "tamamlandı":["tamamlan","biten","bitmiş","tamamlandi"], "taslak":["taslak","planlanan","gelecek","yaklaşan"], "iptal":["iptal"], "devam":["devam","süren","aktif","onaylandi","onay-bekliyor"] };
  const STATU_LABEL = { "tamamlandi":"tamamlandı", "tamamlandi̇":"tamamlandı", "devam-ediyor":"devam ediyor", "aktif":"devam ediyor", "onaylandi":"onaylandı", "onay-bekliyor":"onay bekliyor", "yarida-kesildi":"yarıda kesildi", "taslak":"taslak", "iptal":"iptal" };
  function statuGoster(s) { return STATU_LABEL[s] || s; }

  function parseDate(s) {
    if (!s) return null;
    let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (m) return new Date(+m[3], +m[2]-1, +m[1]);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(+m[1], +m[2]-1, +m[3]);
    return null;
  }
  function fmtTarih(s) { const d = parseDate(s); if (!d) return s||"—"; return `${String(d.getDate()).padStart(2,"0")} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`; }
  function fmtTarihAralik(bas, bit) { const a=fmtTarih(bas), b=fmtTarih(bit); if (!a||a==="—") return "—"; if (a===b||!bit) return a; return `${a} – ${b}`; }
  function turneGun(t) { const a=parseDate(t.baslangic), b=parseDate(t.bitis)||a; if(!a||!b) return 1; return Math.max(1,Math.round((b-a)/86400000)+1); }
  function fmtTel(tel) {
    if (!tel) return null; const c=String(tel).replace(/\s/g,"");
    if (c.match(/^0?\d{10}$/)) { const d=c.startsWith("0")?c:"0"+c; return d.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/,"$1 $2 $3 $4"); }
    return tel;
  }

  /* ─────────────────── CEVAP MOTORUu ─────────────────── */
  function answer(q, ds) {
    const Q = norm(q), T = ds.turneler, F = ds.firmalar||[];
    let scope = T;
    for (const [s, keys] of Object.entries(STATU_MAP)) if (keys.some(k=>Q.includes(k))) { const sk=s.split("-")[0]; scope=T.filter(t=>t.statu.startsWith(sk)||keys.some(kk=>t.statu===kk)); break; }
    const ym = Q.match(/\b(20\d{2})\b/);
    if (ym) { const y=+ym[1]; scope=scope.filter(t=>{const d=parseDate(t.baslangic);return d&&d.getFullYear()===y;}); }
    const mi = AY_NORM.findIndex(m=>Q.includes(m));
    if (mi>=0) scope=scope.filter(t=>{const d=parseDate(t.baslangic);return d&&d.getMonth()===mi;});

    /* OTEL */
    if (/otel|konaklama|kal(ınan|dığı|acak)/.test(Q)) {
      const city=findCity(Q,T);
      if (city) {
        const list=T.filter(t=>t.il===city||(t.duraklar||[]).some(d=>d.il===city));
        const otels=new Map();
        for (const t of list) { for (const d of parseDurakOteller(t.duraklar).filter(d=>d.il===city)) { if (d.otelAdi&&!otels.has(d.otelAdi)) otels.set(d.otelAdi,{adres:d.otelAdres,tel:d.otelTel,ilgili:d.ilgiliKisi,ilgiliTel:d.ilgiliTel}); } if (!otels.size&&t.otelAdi) otels.set(t.otelAdi,{adres:t.otelAdres,tel:t.otelTel}); }
        if (otels.size) { let o=`**${city}** otel bilgileri:\n\n`; for (const [ad,inf] of otels) { o+=`🏨 **${ad}**\n`; if(inf.adres)o+=`   📍 ${inf.adres}\n`; if(inf.tel)o+=`   📞 <a class="ta-phone" href="tel:${inf.tel}">${fmtTel(inf.tel)||inf.tel}</a>\n`; if(inf.ilgili){o+=`   👤 ${inf.ilgili}`;if(inf.ilgiliTel)o+=` — <a class="ta-phone" href="tel:${inf.ilgiliTel}">${fmtTel(inf.ilgiliTel)||inf.ilgiliTel}</a>`;o+="\n";} o+="\n"; } return {html:o}; }
      }
      const otelF=F.filter(f=>f.kategori==="otel");
      if (otelF.length) { let o=`Rehberdeki **${otelF.length}** otel:\n\n`; for(const f of otelF){o+=`🏨 **${f.ad}**\n`;if(f.not)o+=`   📍 ${f.not}\n`;if(f.tel)o+=`   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)||f.tel}</a>\n\n`;} return {html:o}; }
    }

    /* FİRMA / NUMARA */
    if (/(firma|nakliye|ulaşım|ulasim|servis|otobüs|otobus|kamyon|rehber|numara|telefon|ara(yın|yabilirim)|iletişim|irtibat)/.test(Q)) {
      for (const f of F) { if (norm(f.ad).split(" ").filter(p=>p.length>=4).some(p=>Q.includes(p))) {
        let o=`📋 **${f.ad}**\n`;
        if(f.kaynak)o+=`   🗂 ${f.kaynak}\n`;
        if(f.not)o+=`   📍 ${f.not}\n`;
        if(f.tel)o+=`   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)||f.tel}</a>\n`;
        const copyText = `${f.ad}${f.tel?"\nTel: "+(fmtTel(f.tel)||f.tel):""}${f.not?"\nAdres: "+f.not:""}`;
        o += `\n<button class="ta-inline-copy" onclick="navigator.clipboard.writeText(${JSON.stringify(copyText)}).then(()=>{this.textContent='✓ Kopyalandı';setTimeout(()=>this.textContent='📋 Tümünü Kopyala',1800)})">📋 Tümünü Kopyala</button>`;
        if(f.kategori==="otel")o+=` <button class="ta-inline-aktar" onclick="window.__taAktar(${JSON.stringify(f.ad)},${JSON.stringify(f.tel||'')},${JSON.stringify(f.not||'')})">📥 Forma Aktar</button>`;
        return {html:o};
      } }
      let cat=null;
      if (/(nakliye|kamyon)/.test(Q)) cat="nakliye";
      else if (/(otobüs|otobus|ulaşım|ulasim|servis)/.test(Q)) cat=["ulasim","servis"];
      else if (/otel/.test(Q)) cat="otel";
      let firmalar=F; if(cat) firmalar=F.filter(f=>Array.isArray(cat)?cat.includes(f.kategori):f.kategori===cat);
      if (firmalar.length) { const lbl=cat==="nakliye"?"Nakliye firmaları":Array.isArray(cat)?"Ulaşım firmaları":cat==="otel"?"Oteller":"Firma rehberi"; let o=`**${lbl}** (${firmalar.length}):\n\n`; for(const f of firmalar){o+=`📋 **${f.ad}**`;if(f.kaynak)o+=` <span class="ta-badge">${f.kaynak.split("·").pop().trim()}</span>`;o+="\n";if(f.not)o+=`   📍 ${f.not}\n`;if(f.tel)o+=`   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)||f.tel}</a>\n\n`;} return {html:o}; }
    }

    /* İLGİLİ KİŞİ */
    if (/(ilgili|sorumlu|koordinat).*(kişi|kisi|numara|tel)/.test(Q)||(/(kişi|kisi)/.test(Q)&&/(numara|tel|ara)/.test(Q))) {
      const city=findCity(Q,T);
      if (city) { const list=T.filter(t=>t.il===city||(t.duraklar||[]).some(d=>d.il===city)); let o=`**${city}** ilgili kişiler:\n\n`; const seen=new Set(); for(const t of list){for(const d of parseDurakOteller(t.duraklar).filter(d=>d.il===city)){if(d.ilgiliKisi&&!seen.has(d.ilgiliKisi)){seen.add(d.ilgiliKisi);o+=`👤 **${d.ilgiliKisi}** (${t.oyun})\n`;if(d.ilgiliTel)o+=`   📞 <a class="ta-phone" href="tel:${d.ilgiliTel}">${fmtTel(d.ilgiliTel)||d.ilgiliTel}</a>\n`;o+="\n";}}} if(seen.size) return {html:o}; }
      const diger=F.filter(f=>f.kategori==="diger"); if(diger.length){let o=`Rehberdeki ilgili kişiler (${diger.length}):\n\n`;for(const f of diger){o+=`👤 **${f.ad}** <span class="ta-badge">${f.kaynak.split("·").pop().trim()||f.kaynak}</span>\n`;if(f.tel)o+=`   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)||f.tel}</a>\n\n`;}return {html:o};}
    }

    /* EN FAZLA TURNE */
    if (/(en\s*(fazla|cok|çok)).*(kişi|kisi|personel|giden|katılan|katilan)/.test(Q)) {
      const c=new Map(); for(const t of scope)for(const k of t.katilimcilar)c.set(k.kisi,(c.get(k.kisi)||0)+1);
      const top=[...c.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
      return top.length?"En fazla turneye giden kişiler:\n\n"+top.map(([k,n],i)=>`${i+1}. **${k}** — ${n} turne`).join("\n"):"Kayıt bulunamadı.";
    }
    /* EN FAZLA GÜN */
    if (/(en\s*(fazla|cok|çok)).*(gün|gun).*(yolda|turne)/.test(Q)||/yolda.*kim/.test(Q)) {
      const d=new Map(); for(const t of scope){const g=turneGun(t);for(const k of t.katilimcilar)d.set(k.kisi,(d.get(k.kisi)||0)+g);}
      const top=[...d.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
      return top.length?"En çok gün yolda:\n\n"+top.map(([k,g],i)=>`${i+1}. **${k}** — ${g} gün`).join("\n"):"Veri yok.";
    }
    /* TOPLAM PERSONEL */
    if (/(toplam|kac|kaç).*(personel|kişi|kisi)/.test(Q)) { const s=new Set();for(const t of scope)for(const k of t.katilimcilar)s.add(norm(k.kisi));return `Toplam **${s.size}** farklı personel turneye çıktı.`; }
    /* GÖREV */
    if (/(görev|gorev|kategori).*(kalabalık|kalabalik|en\s*cok|en\s*çok|en\s*fazla)/.test(Q)) {
      const c=new Map();for(const t of scope)for(const k of t.katilimcilar){const g=k.kategori||k.gorev||"Diğer";if(!c.has(g))c.set(g,new Set());c.get(g).add(norm(k.kisi));}
      const top=[...c.entries()].map(([g,s])=>[g,s.size]).sort((a,b)=>b[1]-a[1]);
      return top.length?"Görev grupları:\n\n"+top.map(([g,n],i)=>`${i+1}. **${g}** — ${n} kişi`).join("\n"):"Veri yok.";
    }
    /* AY */
    if (/(hangi\s*ay|en\s*yoğun|en\s*yogun|aylık)/.test(Q)) {
      const c=new Array(12).fill(0);for(const t of scope){const d=parseDate(t.baslangic);if(d)c[d.getMonth()]++;}
      const r=c.map((n,i)=>({ay:AYLAR[i],n})).sort((a,b)=>b.n-a.n).slice(0,3).filter(x=>x.n>0);
      return r.length?"En yoğun aylar:\n\n"+r.map((x,i)=>`${i+1}. **${x.ay}** — ${x.n} turne`).join("\n"):"Veri yok.";
    }
    /* ŞEHİR */
    if (/(şehir|sehir|il)/.test(Q)&&/(en\s*cok|en\s*çok|en\s*fazla|kac|kaç)/.test(Q)) {
      const c=new Map();for(const t of scope){const ill=new Set();if(t.il)ill.add(t.il);for(const d of t.duraklar||[])if(d.il)ill.add(d.il);for(const il of ill)c.set(il,(c.get(il)||0)+1);}
      if (/kac|kaç/.test(Q)) return `Toplam **${c.size}** farklı şehre gidildi.`;
      return "En çok gidilen şehirler:\n\n"+ [...c.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([s,n],i)=>`${i+1}. **${s}** — ${n} turne`).join("\n");
    }
    /* TOPLAM TURNE */
    if (/(toplam|kac|kaç).*(turne)/.test(Q)) { const g=scope.reduce((s,t)=>s+turneGun(t),0),tm=scope.reduce((s,t)=>s+(t.sayi||0),0);return `Bu kapsamda **${scope.length}** turne, **${g}** gün, **${tm}** temsil.`; }
    /* YAKLAŞAN */
    if (/(yaklaşan|yaklasan|gelecek|planlı|planli|taslak|önümüzdeki|onumuzdeki)/.test(Q)) {
      const now=new Date(),up=T.filter(t=>{const d=parseDate(t.baslangic);return d&&d>=now;}).sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0)).slice(0,8);
      if (!up.length) return "Yaklaşan turne bulunamadı.";
      const ulasimIcon=(u)=>u&&/(uçak|ucak|thy|pegasus|sunexpress|hava)/i.test(u)?"✈️":"🚌";
      let o="Yaklaşan turneler:\n\n";
      for(const t of up){
        o+=`• **${t.oyun}**\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)} · 📍 ${t.il||"—"} (${statuGoster(t.statu)})\n`;
        if(t.gidisUlasim)o+=`  ${ulasimIcon(t.gidisUlasim)} ${t.gidisUlasim}${t.gidisSaat?" · 🕐 "+t.gidisSaat:""}\n`;
      }
      return o;
    }
    /* KİŞİ */
    const found=findPerson(Q,T);
    if (found) {
      const list=T.filter(t=>t.katilimcilar.some(k=>norm(k.kisi)===norm(found.kisi)));
      if (!list.length) return `**${found.kisi}** henüz hiçbir turneye atanmamış.`;
      const gun=list.reduce((s,t)=>s+turneGun(t),0);
      const sorted=list.sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0));
      const lines=sorted.slice(0,15).map(t=>{const otel=t.duraklar?.find(d=>d.otelAdi)?.otelAdi||t.otelAdi||"";return `• **${t.oyun}**\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)} · 📍 ${t.il||"—"}${otel?" · 🏨 "+otel:""}`;}).join("\n");
      const toplamTemsil=list.reduce((s,t)=>s+(t.sayi||0),0);
      // Milestone rozeti
      const MILESTONES=[5,10,15,20,25,30,50];
      const milestone=MILESTONES.find(m=>list.length===m);
      let celebrateHtml="";
      if(milestone){
        const emojis={5:"🌟",10:"🎭",15:"🏅",20:"🎖",25:"👑",30:"🏆",50:"🌟🏆🌟"};
        celebrateHtml=`<div class="ta-celebrate"><span class="ta-cel-emoji">${emojis[milestone]||"🎉"}</span>${found.kisi} — ${milestone}. Turne!<div class="ta-cel-sub">Tebrikler! Bu özel bir kilometre taşı 🎊</div></div>\n`;
      }
      return {html: celebrateHtml + `**${found.kisi}**${found.gorev?" · "+found.gorev:""}\n📊 ${list.length} turne · 📅 **${gun} gün** yolda · 🎭 ${toplamTemsil} temsil\n\n${lines}`};
    }
    /* ŞEHİR DETAYI */
    const city=findCity(Q,T);
    if (city) {
      const list=T.filter(t=>t.il===city||(t.duraklar||[]).some(d=>d.il===city));
      let o=`**${city}** şehrine **${list.length}** turne yapıldı.\n\n`;
      for(const t of list.slice(0,10)){const duraklar=parseDurakOteller(t.duraklar).filter(d=>d.il===city);const otel=duraklar[0]?.otelAdi||t.otelAdi||"";const otelTel=duraklar[0]?.otelTel||t.otelTel||"";const ilgili=duraklar[0]?.ilgiliKisi||"";const ilgiliTel=duraklar[0]?.ilgiliTel||"";o+=`• **${t.oyun}** (${statuGoster(t.statu)})\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)}\n`;if(otel){o+=`  🏨 ${otel}`;if(otelTel)o+=` — <a class="ta-phone" href="tel:${otelTel}">${fmtTel(otelTel)||otelTel}</a>`;o+="\n";}if(ilgili){o+=`  👤 ${ilgili}`;if(ilgiliTel)o+=` — <a class="ta-phone" href="tel:${ilgiliTel}">${fmtTel(ilgiliTel)||ilgiliTel}</a>`;o+="\n";}o+="\n";}
      return {html:o};
    }
    /* OYUN DETAYI — oyun adı yazılınca hem bilgi hem düzenle butonu */
    for (const t of T) {
      if (norm(t.oyun).split(" ").filter(p=>p.length>=4).some(p=>Q.includes(p))) {
        const dur=parseDurakOteller(t.duraklar);
        const ulasimIcon = (u) => u && /(uçak|ucak|thy|pegasus|sunexpress|anadolu|boeing|airbus|havayolu|hava yolu|flight)/i.test(u) ? "✈️" : "🚌";
        let o=`**${t.oyun}**\n\n📅 ${fmtTarihAralik(t.baslangic,t.bitis)}\n📍 ${t.il||"—"}\n🎭 ${t.sayi||"?"} temsil · ${turneGun(t)} gün\n📊 Statü: ${statuGoster(t.statu)}\n`;
        if (t.gidisUlasim) o+=`${ulasimIcon(t.gidisUlasim)} Gidiş: **${t.gidisUlasim}**${t.gidisSaat?" · 🕐 "+t.gidisSaat:""}\n`;
        if (t.donusUlasim) o+=`${ulasimIcon(t.donusUlasim)} Dönüş: **${t.donusUlasim}**${t.donusSaat?" · 🕐 "+t.donusSaat:""}\n`;
        if (dur.length) { o+="\n**Duraklar:**\n"; for(const d of dur){o+=`\n🏙 **${d.il}**${d.mekan?" — "+d.mekan:""}\n`;if(d.otelAdi){o+=`   🏨 ${d.otelAdi}`;if(d.otelTel)o+=` <a class="ta-phone" href="tel:${d.otelTel}">${fmtTel(d.otelTel)||d.otelTel}</a>`;o+="\n";}if(d.ilgiliKisi){o+=`   👤 ${d.ilgiliKisi}`;if(d.ilgiliTel)o+=` — <a class="ta-phone" href="tel:${d.ilgiliTel}">${fmtTel(d.ilgiliTel)||d.ilgiliTel}</a>`;o+="\n";}}} else if(t.otelAdi){o+=`\n🏨 **${t.otelAdi}**\n`;if(t.otelAdres)o+=`   📍 ${t.otelAdres}\n`;if(t.otelTel)o+=`   📞 <a class="ta-phone" href="tel:${t.otelTel}">${fmtTel(t.otelTel)||t.otelTel}</a>\n`;}
        if (t.katilimcilar.length) { o+=`\n👥 **${t.katilimcilar.length} kişi:** ${t.katilimcilar.slice(0,5).map(k=>k.kisi).join(", ")}`;if(t.katilimcilar.length>5)o+=` ve ${t.katilimcilar.length-5} kişi daha`;o+="\n";}
        // Düzenle butonu
        const _esc=(s)=>(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
        o += `\n<button class="ta-inline-aktar ta-btn-edit-turne" data-rowidx="${t._rawIdx}">✏️ Turneyi Düzenle</button>`;
        o += `\n<button class="ta-inline-copy ta-btn-remind-turne" data-oyun="${_esc(t.oyun)}" style="border-color:#2F7D4E;color:#2F7D4E">🔔 Hatırlatıcı Ekle</button>`;
        return {html:o};
      }
    }
    /* TAKVİM & HATIRLATICI SORGUSU */
    if (/(takvim|not.*bugün|bugün.*not|hatırlatıcı|hatirlatici|ajanda|gündem|remind)/.test(Q)) {
      const calNotes=(function(){try{return JSON.parse(localStorage.getItem('calNotes_cache')||'{}');}catch(e){return {};}})();
      const today=new Date();
      const todayKey=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
      const reminders=loadReminders();
      const todayNot=calNotes[todayKey];
      const todayR=reminders.filter(r=>!r.done&&r.date&&new Date(r.date).toDateString()===today.toDateString());
      const overdueR=reminders.filter(r=>!r.done&&r.date&&new Date(r.date)<today&&new Date(r.date).toDateString()!==today.toDateString());
      const upcomingR=reminders.filter(r=>!r.done&&r.date&&new Date(r.date)>today).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,6);
      let o='';
      if(todayNot) o+=`📌 **Bugünün takvim notu:** ${todayNot}\n\n`;
      if(overdueR.length){o+=`⚠️ **Gecikmiş (${overdueR.length}):**\n`;for(const r of overdueR.slice(0,5))o+=`• ${r.text}${r.turne?' · '+r.turne:''}\n`;o+='\n';}
      if(todayR.length){o+=`⚡ **Bugün (${todayR.length}):**\n`;for(const r of todayR)o+=`• ${r.text}${r.turne?' · '+r.turne:''}\n`;o+='\n';}
      if(upcomingR.length){o+=`📅 **Yaklaşan hatırlatıcılar:**\n`;for(const r of upcomingR){const d=new Date(r.date);o+=`• ${d.getDate()} ${AYLAR[d.getMonth()]} — ${r.text}${r.turne?' · **'+r.turne+'**':''}\n`;}}
      if(!o) o='Bekleyen hatırlatıcı veya bugüne ait takvim notu yok. 🎉';
      return {html:o};
    }

    /* BUGÜN NE VAR */
    if (/(bugün|bugun|bu\s*gün|today|günün|gunun)/.test(Q)) {
      const now = new Date();
      const todayStr = now.toDateString();
      const bugun = T.filter(t => {
        const bas = parseDate(t.baslangic);
        const bit = parseDate(t.bitis) || bas;
        return bas && bit && bas <= now && bit >= now;
      });
      const baslayan = T.filter(t => {
        const d = parseDate(t.baslangic);
        return d && d.toDateString() === todayStr;
      });
      const biten = T.filter(t => {
        const d = parseDate(t.bitis);
        return d && d.toDateString() === todayStr;
      });
      const yarin = T.filter(t => {
        const d = parseDate(t.baslangic);
        if (!d) return false;
        const diff = Math.round((d - now) / 86400000);
        return diff === 1;
      });

      let o = `📅 **${fmtTarih(now.toISOString().slice(0,10))}** — Günün Özeti\n\n`;

      if (bugun.length) {
        o += `🎭 **Devam Eden Turneler (${bugun.length}):**\n`;
        for (const t of bugun) {
          const ulasimIcon = (u) => u && /(uçak|ucak|thy|pegasus|sunexpress|hava)/i.test(u) ? "✈️" : "🚌";
          o += `• **${t.oyun}** · 📍 ${t.il||"—"}\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)}\n`;
          if (t.gidisUlasim) o += `  ${ulasimIcon(t.gidisUlasim)} Gidiş: ${t.gidisUlasim}${t.gidisSaat?" · 🕐 "+t.gidisSaat:""}\n`;
          if (t.otelAdi) o += `  🏨 ${t.otelAdi}${t.otelTel?" · "+fmtTel(t.otelTel):""}\n`;
        }
        o += "\n";
      }
      if (baslayan.length) {
        o += `🟢 **Bugün Başlayan (${baslayan.length}):**\n`;
        for (const t of baslayan) o += `• **${t.oyun}** · 📍 ${t.il||"—"}\n`;
        o += "\n";
      }
      if (biten.length) {
        o += `🏁 **Bugün Biten (${biten.length}):**\n`;
        for (const t of biten) o += `• **${t.oyun}** · 📍 ${t.il||"—"}\n`;
        o += "\n";
      }
      if (yarin.length) {
        o += `⏰ **Yarın Başlıyor (${yarin.length}):**\n`;
        for (const t of yarin) {
          const ulasimIcon = (u) => u && /(uçak|ucak|thy|pegasus|sunexpress|hava)/i.test(u) ? "✈️" : "🚌";
          o += `• **${t.oyun}** · 📍 ${t.il||"—"} · 📅 ${fmtTarih(t.baslangic)}\n`;
          if (t.gidisUlasim) o += `  ${ulasimIcon(t.gidisUlasim)} Gidiş: ${t.gidisUlasim}${t.gidisSaat?" · 🕐 "+t.gidisSaat:""}\n`;
        }
      }

      if (!bugun.length && !baslayan.length && !biten.length && !yarin.length)
        return "Bugün aktif turne yok. " + (T.filter(t=>{const d=parseDate(t.baslangic);return d&&d>now;}).length ? "Yaklaşan turneleri görmek için 'yaklaşan turneler' diyebilirsiniz." : "");

      return {html: o};
    }

    /* TURNE EKLE YARDIMCISI */
    if (/(yeni.*turne|turne.*ekle|ekle.*turne|turne.*oluştur|oluştur.*turne|taslak.*oluştur|hızlı.*ekle|ekle.*taslak)/.test(Q)) {
      // Sohbetten kısmi bilgi çıkar ve modal'ı aç
      // Oyun adı tespiti: sistemdeki oyunlardan birini ara
      const oyunlar = DS ? [...new Set(DS.turneler.map(t=>t.oyun).filter(Boolean))] : [];
      let oyunTespit = null;
      for (const oy of oyunlar) if (Q.includes(norm(oy))) { oyunTespit = oy; break; }
      
      // Tarih tespiti: YYYY-MM-DD veya "gün ay" formatı
      let tarihTespit = null, bitisTespit = null;
      const tarihRe = /(\d{1,2})[.\-\/](\d{1,2})(?:[.\-\/](\d{2,4}))?/g;
      const tarihMatches = [...Q.matchAll(tarihRe)];
      if (tarihMatches.length >= 1) {
        const m = tarihMatches[0];
        const yil = m[3] ? (m[3].length===2?'20'+m[3]:m[3]) : new Date().getFullYear();
        tarihTespit = `${yil}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
      }
      if (tarihMatches.length >= 2) {
        const m = tarihMatches[1];
        const yil = m[3] ? (m[3].length===2?'20'+m[3]:m[3]) : new Date().getFullYear();
        bitisTespit = `${yil}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
      }

      // Şehir tespiti
      const sehirTespit = findCity(Q, T);

      // Formu aç ve doldur
      window._taEklePrefill = { oyun: oyunTespit, tarih: tarihTespit, bitis: bitisTespit, il: sehirTespit };
      
      const btn = document.getElementById('turne-ekle-btn');
      if (btn) btn.click();
      else if (typeof openModal === 'function') openModal();
      
      // 400ms sonra formu doldur (modal render bekleniyor)
      setTimeout(() => {
        const pf = window._taEklePrefill || {};
        if (pf.oyun) { const s=document.getElementById('m-oyun'); if(s){ for(const o of s.options)if(o.value===pf.oyun){s.value=pf.oyun;s.dispatchEvent(new Event('change'));break;} } }
        if (pf.tarih) { const el=document.getElementById('m-tarih'); if(el){el.value=pf.tarih;el.dispatchEvent(new Event('change'));} }
        if (pf.bitis) { const el=document.getElementById('m-bitis'); if(el){el.value=pf.bitis;el.dispatchEvent(new Event('change'));} }
        if (pf.il) {
          const durakIlEl = document.querySelector('#duraklar-container .durak-il-select, #duraklar-container select[name*="il"], #duraklar-container input[placeholder*="il" i], #duraklar-container input[placeholder*="şehir" i]');
          if (durakIlEl) { durakIlEl.value = pf.il; durakIlEl.dispatchEvent(new Event('change')); }
        }
        window._taEklePrefill = null;
      }, 450);

      let konfirm = '✅ Turne ekleme formu açılıyor';
      if (oyunTespit || tarihTespit || sehirTespit) {
        konfirm += ' — şunlar otomatik doldurulacak:\n';
        if (oyunTespit)  konfirm += `• 🎭 Oyun: **${oyunTespit}**\n`;
        if (tarihTespit) konfirm += `• 📅 Başlangıç: **${tarihTespit}**\n`;
        if (bitisTespit) konfirm += `• 📅 Bitiş: **${bitisTespit}**\n`;
        if (sehirTespit) konfirm += `• 📍 Şehir: **${sehirTespit}**\n`;
      } else {
        konfirm += '.\n_Oyun adı, tarih veya şehir söylerseniz formu otomatik doldururum._';
      }
      return {html: konfirm};
    }

    /* TURNE KOPYALA / BENZERİ OLUŞTUR */
    if (/(kopya|kopyala|benzer.*turne|turne.*benzer|aynı.*turne|çoğalt|cogalt)/.test(Q)) {
      // Eşleşen turneyi bul
      let tBul = null;
      for (const t of T) { if (Q.includes(norm(t.oyun))||Q.includes(norm(t.il||''))) { tBul=t; break; } }
      if (tBul) {
        return {html: `📋 **${tBul.oyun}** turnesi kopyalanacak.\n\n<button class="ta-inline-aktar ta-btn-copy-turne" data-rowidx="${tBul._rawIdx}">📋 Taslak Olarak Kopyala</button>`};
      }
      return 'Kopyalanacak turneyi bulamadım. Oyun adını veya şehri belirtin.';
    }

    /* KADRO EKSİKLİĞİ */
    if (/(kadro.*eksik|eksik.*kadro|atanmamış|atanmamis|kadro.*yok|kadro.*tam|doldu)/.test(Q)) {
      const aktifScope=scope.filter(t=>!t.statu.includes("iptal")&&!t.statu.includes("tamamlan"));
      const eksik=aktifScope.filter(t=>t.katilimcilar.length===0);
      const az=aktifScope.filter(t=>t.katilimcilar.length>0&&t.katilimcilar.length<5);
      let o='';
      if(eksik.length){o+=`🚨 **Kadro atanmamış ${eksik.length} turne:**\n\n`;for(const t of eksik.slice(0,12))o+=`• **${t.oyun}** — ${t.il||'—'} · ${fmtTarihAralik(t.baslangic,t.bitis)}\n`;o+='\n';}
      if(az.length){o+=`⚠️ **Az kadro (5'ten az kişi) ${az.length} turne:**\n\n`;for(const t of az.slice(0,8))o+=`• **${t.oyun}** — ${t.katilimcilar.length} kişi · ${t.il||'—'}\n`;}
      if(!o) o='✅ Aktif turnelerin tamamında kadro atanmış görünüyor.';
      return {html:o};
    }

    /* YAKLAŞAn TURNELER / HAFTALIK ÖZET */
    if (/(özet|ozet|haftalık|haftalik|bu\s*hafta|30.*gün|rapor|brief|genel.*bak)/.test(Q)) {
      const now2=new Date(); const son30=new Date(now2.getTime()+30*24*60*60*1000);
      const yaklasan=T.filter(t=>{const d=parseDate(t.baslangic);return d&&d>=now2&&d<=son30&&!t.statu.includes("iptal");}).sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0));
      if(!yaklasan.length) return '30 gün içinde planlanmış turne yok.';
      let o=`📋 **Önümüzdeki 30 gün — ${yaklasan.length} turne:**\n\n`;
      for(const t of yaklasan){
        const gun=Math.ceil((parseDate(t.baslangic)-now2)/(1000*60*60*24));
        o+=`• **${t.oyun}** — ${t.il||'—'} · ${fmtTarihAralik(t.baslangic,t.bitis)}\n`;
        o+=`  ⏳ ${gun} gün sonra · 👥 ${t.katilimcilar.length} kişi${t.katilimcilar.length===0?' 🚨':''}\n`;
        if(t.gidisUlasim) o+=`  ✈️ ${t.gidisUlasim}${t.gidisSaat?' '+t.gidisSaat:''}\n`;
        o+='\n';
      }
      return {html:o};
    }

    /* UÇUŞ / ULAŞIM ÖZET LİSTESİ */
    if (/(ulaşım.*listesi|ulasim.*listesi|tüm.*uçuş|tum.*ucus|sefer.*listesi)/.test(Q)) {
      const ucaklar=scope.filter(t=>t.gidisUlasim&&/(uçak|ucak|thy|pegasus|ajet|sun|express|fly)/i.test(t.gidisUlasim)).sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0));
      if(!ucaklar.length) return 'Uçaklı ulaşım bilgisi olan turne bulunamadı.';
      let o=`✈️ **Uçaklı turneler (${ucaklar.length}):**\n\n`;
      for(const t of ucaklar.slice(0,15)){
        o+=`• **${t.oyun}** — ${t.il||'—'} · ${fmtTarihAralik(t.baslangic,t.bitis)}\n`;
        if(t.gidisUlasim) o+=`  → ${t.gidisUlasim}${t.gidisSaat?' · '+t.gidisSaat:''}\n`;
        if(t.donusUlasim) o+=`  ← ${t.donusUlasim}${t.donusSaat?' · '+t.donusSaat:''}\n`;
        o+='\n';
      }
      return {html:o};
    }

    /* PERSONEL YÜK RAPORU */
    if (/(yük.*rapor|yuk.*rapor|en.*meşgul|en.*mesgul|kimler.*yoğun|yoğun.*kim|personel.*yük|cok.*calis)/.test(Q)) {
      const aktifT=T.filter(t=>!t.statu.includes("iptal")&&!t.statu.includes("tamamlan"));
      const yukMap=new Map();
      for(const t of aktifT) for(const k of t.katilimcilar) yukMap.set(k.kisi,(yukMap.get(k.kisi)||0)+turneGun(t));
      const sirali=[...yukMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12);
      if(!sirali.length) return 'Aktif turnelerde kayıtlı personel bulunamadı.';
      let o=`👥 **En yoğun personel (aktif turnelere göre):**\n\n`;
      for(const [kisi,gun] of sirali) o+=`• **${kisi}** — ${gun} gün yolda\n`;
      return {html:o};
    }

    /* ── LİDERLİK TABLOSU ── */
    if (/(lider|sıralama|siralama|ranking|en\s*aktif|şampiyon|sampiyon|puan|turne.*şampiyon)/.test(Q)) {
      const c=new Map();
      for(const t of T) for(const k of t.katilimcilar) c.set(k.kisi,(c.get(k.kisi)||0)+1);
      const top=[...c.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
      if(!top.length) return "Liderlik tablosu için yeterli veri yok.";
      const madalya=["🥇","🥈","🥉"];
      let o=`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">🏆 Turne Liderlik Tablosu</div>`;
      for(const [kisi,n] of top) {
        const i=top.indexOf(top.find(x=>x[0]===kisi));
        const medal=madalya[i]||(i+1)+".";
        const pct=Math.round(n/top[0][1]*100);
        o+=`<div class="ta-lb-row"><span class="ta-lb-medal">${medal}</span><span class="ta-lb-name">${esc(kisi)}</span><div class="ta-lb-bar-wrap"><div class="ta-lb-bar" style="width:${pct}%"></div></div><span class="ta-lb-val">${n} turne</span></div>`;
      }
      return {html:o};
    }

    /* ── GERİ SAYIM ── */
    if (/(geri\s*say|ne\s*zaman.*ilk|ilk.*turne|sonraki.*turne|bir\s*sonraki)/.test(Q)) {
      const now=new Date();
      const yaklashan=T.filter(t=>{const d=parseDate(t.baslangic);return d&&d>now&&!t.statu.includes("iptal");}).sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0));
      if(!yaklashan.length) return "Yaklaşan planlanmış turne bulunamadı.";
      const t=yaklashan[0];
      const gun=Math.ceil((parseDate(t.baslangic)-now)/(1000*60*60*24));
      let o=`<div class="ta-countdown-card"><div class="ta-countdown-num">${gun}</div><div class="ta-countdown-info"><div class="ta-countdown-label">Gün sonra ⏳</div><div class="ta-countdown-title">🎭 ${esc(t.oyun)}</div><div class="ta-countdown-date">📍 ${esc(t.il||"—")} · ${fmtTarihAralik(t.baslangic,t.bitis)}</div></div></div>`;
      if(yaklashan.length>1){
        o+=`<div style="font-size:11.5px;font-weight:700;color:#8A857C;margin:6px 0 4px;">Diğer yaklaşan turneler:</div>`;
        for(const tur of yaklashan.slice(1,4)){
          const g=Math.ceil((parseDate(tur.baslangic)-now)/(1000*60*60*24));
          o+=`<div style="font-size:12px;padding:4px 0;border-bottom:1px solid #F0EBE5;">• <strong>${esc(tur.oyun)}</strong> — ${g} gün · ${esc(tur.il||"—")}</div>`;
        }
      }
      return {html:o};
    }

    /* ── ÇAKIŞAN KADRO UYARISI ── */
    if (/(çakış|cakis|aynı.*hafta|hafta.*aynı|çift.*turne|iki.*turne.*aynı|çakışan|cakisan)/.test(Q)) {
      const aktif=T.filter(t=>!t.statu.includes("iptal")&&!t.statu.includes("tamamlan"));
      const kisiTurneler=new Map();
      for(const t of aktif) for(const k of t.katilimcilar){
        if(!kisiTurneler.has(k.kisi)) kisiTurneler.set(k.kisi,[]);
        kisiTurneler.get(k.kisi).push(t);
      }
      const cakisanlar=[];
      for(const [kisi,turneler] of kisiTurneler){
        if(turneler.length<2) continue;
        const pairs=[];
        for(let i=0;i<turneler.length;i++) for(let j=i+1;j<turneler.length;j++){
          const a=turneler[i],b=turneler[j];
          const aB=parseDate(a.baslangic),aE=parseDate(a.bitis)||aB;
          const bB=parseDate(b.baslangic),bE=parseDate(b.bitis)||bB;
          if(aB&&bB&&aB<=bE&&bB<=aE) pairs.push([a,b]);
        }
        if(pairs.length) cakisanlar.push({kisi,pairs});
      }
      if(!cakisanlar.length) return "✅ Aktif turnelerde çakışan kadro tespit edilmedi.";
      let o=`<div style="background:#FFF0F0;border:1px solid #F0C4CB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#A0192E;">⚠️ ${cakisanlar.length} personelde takvim çakışması var!</div>`;
      for(const {kisi,pairs} of cakisanlar.slice(0,8)){
        o+=`<div class="ta-conflict-item"><div class="ta-conflict-name">👤 ${esc(kisi)}</div><div class="ta-conflict-tours">`;
        for(const [a,b] of pairs) o+=`• ${esc(a.oyun)} (${fmtTarihAralik(a.baslangic,a.bitis)}) ↔ ${esc(b.oyun)} (${fmtTarihAralik(b.baslangic,b.bitis)})<br>`;
        o+=`</div></div>`;
      }
      return {html:o};
    }

    /* ── TURNE KARŞILAŞTIRMA ── */
    if (/(karşılaştır|karsilastir|kıyasla|kiyasla|fark.*turne|turne.*fark|vs\.?|versus)/.test(Q)) {
      // İki turne adı veya şehir bul
      const eslesen=T.filter(t=>Q.includes(norm(t.oyun))||Q.includes(norm(t.il||""))).slice(0,2);
      if(eslesen.length<2){
        // Sohbet yardımcısı
        const ornekler=T.slice(0,3).map(t=>t.oyun).join(", ");
        return `İki turneyi karşılaştırmak için şöyle yazabilirsin:\n\n💬 _"${T[0]?.oyun||'Oyun A'} ile ${T[1]?.oyun||'Oyun B'} karşılaştır"_\n\nMevcut turneler: ${ornekler}${T.length>3?' ve daha fazlası':''}`;
      }
      const [a,b]=eslesen;
      const gA=turneGun(a),gB=turneGun(b);
      const kA=a.katilimcilar.length,kB=b.katilimcilar.length;
      const sA=a.sayi||0,sB=b.sayi||0;
      function cmpVal(va,vb,lbl,suffix=""){
        const cl=typeof va==="number"&&typeof vb==="number"?(va>vb?"better":"worse"):"";
        const clB=typeof va==="number"&&typeof vb==="number"?(vb>va?"better":"worse"):"";
        return `<div class="ta-cmp-row"><span class="ta-cmp-key">${lbl}</span></div>
          <div class="ta-cmp-row" style="background:#FAFAF8;"><span class="ta-cmp-val ${cl}">${va}${suffix}</span><span style="font-size:10px;color:#C0B8B0">vs</span><span class="ta-cmp-val ${clB}">${vb}${suffix}</span></div>`;
      }
      let o=`<div class="ta-cmp-grid">
        <div class="ta-cmp-col"><div class="ta-cmp-col-title">🎭 ${esc(a.oyun)}</div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">📍 Şehir</span><span class="ta-cmp-val">${esc(a.il||"—")}</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">📅 Tarih</span><span class="ta-cmp-val" style="font-size:10.5px">${fmtTarihAralik(a.baslangic,a.bitis)}</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">⏱ Süre</span><span class="ta-cmp-val ${gA>=gB?'better':'worse'}">${gA} gün</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">👥 Kadro</span><span class="ta-cmp-val">${kA} kişi</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">🎫 Temsil</span><span class="ta-cmp-val ${sA>=sB?'better':'worse'}">${sA||"—"}</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">🏨 Otel</span><span class="ta-cmp-val" style="font-size:10.5px">${esc(a.otelAdi||"—")}</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">📊 Durum</span><span class="ta-cmp-val">${statuGoster(a.statu)}</span></div>
        </div>
        <div class="ta-cmp-col"><div class="ta-cmp-col-title">🎭 ${esc(b.oyun)}</div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">📍 Şehir</span><span class="ta-cmp-val">${esc(b.il||"—")}</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">📅 Tarih</span><span class="ta-cmp-val" style="font-size:10.5px">${fmtTarihAralik(b.baslangic,b.bitis)}</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">⏱ Süre</span><span class="ta-cmp-val ${gB>=gA?'better':'worse'}">${gB} gün</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">👥 Kadro</span><span class="ta-cmp-val">${kB} kişi</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">🎫 Temsil</span><span class="ta-cmp-val ${sB>=sA?'better':'worse'}">${sB||"—"}</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">🏨 Otel</span><span class="ta-cmp-val" style="font-size:10.5px">${esc(b.otelAdi||"—")}</span></div>
          <div class="ta-cmp-row"><span class="ta-cmp-key">📊 Durum</span><span class="ta-cmp-val">${statuGoster(b.statu)}</span></div>
        </div>
      </div>`;
      return {html:o};
    }

    /* ── WHATSAPP KADRO GÖNDER ── */
    if (/(whatsapp|wp|w\.a\.|wapp|kadro.*gönder|gönder.*kadro|kadro.*paylaş|paylaş.*kadro|mesaj.*kadro)/.test(Q)) {
      // Turne bul
      let tBul=null;
      for(const t of T) if(Q.includes(norm(t.oyun))||Q.includes(norm(t.il||""))) { tBul=t; break; }
      if(!tBul){
        // En yakın aktif turneyi öner
        const now=new Date();
        tBul=T.filter(t=>!t.statu.includes("iptal")).sort((a,b)=>{
          const dA=parseDate(a.baslangic),dB=parseDate(b.baslangic);
          return Math.abs((dA||0)-now)-Math.abs((dB||0)-now);
        })[0];
      }
      if(!tBul) return "Turne bulunamadı. Oyun adını veya şehri belirtin.";
      
      // WhatsApp mesajı oluştur
      const satirlar=[
        `🎭 *${tBul.oyun}*`,
        `📅 ${fmtTarihAralik(tBul.baslangic,tBul.bitis)}`,
        `📍 ${tBul.il||"—"}${tBul.mekan?" · "+tBul.mekan:""}`,
        tBul.gidisUlasim?`🚌 Gidiş: ${tBul.gidisUlasim}${tBul.gidisSaat?" · "+tBul.gidisSaat:""}`:"",
        tBul.donusUlasim?`🔄 Dönüş: ${tBul.donusUlasim}${tBul.donusSaat?" · "+tBul.donusSaat:""}`:"",
        tBul.otelAdi?`🏨 Otel: ${tBul.otelAdi}${tBul.otelTel?" ("+fmtTel(tBul.otelTel)+")":""}`:"",
        tBul.katilimcilar.length?`\n👥 *Kadro (${tBul.katilimcilar.length} kişi):*\n`+tBul.katilimcilar.map(k=>`• ${k.kisi}${k.gorev||k.kategori?" — "+(k.gorev||k.kategori):""}`)
          .join("\n"):"",
        tBul.not?`\n📝 Not: ${tBul.not}`:"",
      ].filter(Boolean).join("\n");

      const encoded=encodeURIComponent(satirlar);
      const waUrl=`https://wa.me/?text=${encoded}`;
      
      let o=`<div style="background:#F0FBF4;border:1px solid #A8D8B9;border-radius:10px;padding:10px 12px;margin-bottom:8px;">`;
      o+=`<div style="font-size:12px;font-weight:800;color:#1A5C35;margin-bottom:6px;">📋 ${esc(tBul.oyun)} — Hazır Mesaj</div>`;
      o+=`<pre style="font-size:11px;white-space:pre-wrap;word-break:break-word;color:#2D4A3A;line-height:1.6;background:none;margin:0;font-family:inherit;">${esc(satirlar)}</pre>`;
      o+=`</div>`;
      o+=`<a href="${waUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#25D366;color:#fff;border-radius:8px;padding:8px 14px;font-size:12.5px;font-weight:800;text-decoration:none;margin-right:6px;">📲 WhatsApp'ta Aç</a>`;
      o+=`<button class="ta-inline-copy" onclick="navigator.clipboard.writeText(${JSON.stringify(satirlar)}).then(()=>{this.textContent='✓ Kopyalandı';setTimeout(()=>this.textContent='📋 Kopyala',1800)})">📋 Kopyala</button>`;
      return {html:o};
    }

    return "Şu sorulara cevap verebilirim 💡\n\n👤 **Kişi:** \"Çağlar'ın turne listesi\"\n🏙 **Şehir:** \"Ankara turneleri\"\n🏨 **Otel:** \"Ankara oteli telefonu\"\n📅 **Bugün:** \"Bugün ne var?\"\n📋 **Özet:** \"30 günlük özet\"\n⚠️ **Eksik:** \"Kadro eksik turneler\"\n👥 **Yük:** \"En meşgul personel\"\n📊 **İstatistik:** \"En fazla turneye giden?\"\n🔔 **Takvim:** \"Takvim notlarım\"\n🏆 **Lider:** \"Liderlik tablosu\"\n⏳ **Sayaç:** \"Bir sonraki turne ne zaman?\"\n⚠️ **Çakışma:** \"Çakışan kadro var mı?\"\n📲 **WhatsApp:** \"[Turne adı] kadrosunu WhatsApp'a gönder\"\n🔍 **Karşılaştır:** \"[Turne A] ile [Turne B] karşılaştır\"";
  }

  function findPerson(Q,T) { const m=new Map();for(const t of T)for(const k of t.katilimcilar){const key=norm(k.kisi);if(!m.has(key))m.set(key,k);} for(const[nN,k]of m)if(nN.split(" ").length>=2&&Q.includes(nN))return k; for(const[nN,k]of m)if(nN.split(" ").filter(p=>p.length>=4).some(p=>Q.includes(p)))return k; return null; }
  function findCity(Q,T) { const c=new Set();for(const t of T){if(t.il)c.add(t.il);for(const d of t.duraklar||[])if(d.il)c.add(d.il);}for(const city of c)if(norm(city).length>=4&&Q.includes(norm(city)))return city;return null; }

  /* ─────────────────── UI: SOHBET ─────────────────── */
  function fmtHtml(text) {
    if (typeof text==="object"&&text.html) {
      // HTML içerikse: **bold** dönüşümünü tüm string üzerinde yap ama HTML tag'lerini atla
      return text.html.replace(/\*\*([^*<\n]+)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>");
    }
    const esc=text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    return esc.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>");
  }
  function addMsg(text, who, dismissable) {
    const el=document.createElement("div");
    el.className="ta-msg "+(who==="user"?"user":"bot");
    el.innerHTML=who==="bot"?fmtHtml(text):(text+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    if (dismissable&&who==="bot") { const btn=document.createElement("button");btn.className="ta-dismiss";btn.title="Kapat";btn.innerHTML="×";btn.addEventListener("click",()=>el.remove());el.insertBefore(btn,el.firstChild); }
    // Event delegation: data-attribute butonları için
    el.querySelectorAll('.ta-btn-edit-turne').forEach(btn=>{
      btn.addEventListener('click',()=>{ const idx=parseInt(btn.dataset.rowidx); if(typeof editTurne==='function')editTurne(idx); else{const m=document.getElementById('modal-overlay');if(m)m.classList.add('on');} });
    });
    el.querySelectorAll('.ta-btn-remind-turne').forEach(btn=>{
      btn.addEventListener('click',()=>{
        window._pendingRemineTurne=btn.dataset.oyun;
        togglePanel(true);
        const rt=document.querySelector('.ta-tab[data-view="remind"]');
        if(rt){document.querySelectorAll('.ta-tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.ta-view').forEach(x=>x.classList.remove('active'));rt.classList.add('active');document.getElementById('ta-remind-view').classList.add('active');renderReminders();}
        setTimeout(showAddForm,100);
      });
    });
    el.querySelectorAll('.ta-btn-copy-turne').forEach(btn=>{
      btn.addEventListener('click',()=>{ const idx=parseInt(btn.dataset.rowidx); if(typeof turneCopyala==='function')turneCopyala(idx); });
    });
    msgs.appendChild(el); msgs.scrollTop=msgs.scrollHeight; return el;
  }
  function addTyping() { const el=document.createElement("div");el.className="ta-msg bot";el.innerHTML='<div class="ta-typing"><span></span><span></span><span></span></div>';msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;return el; }
  function submit(text) {
    const q=(text||"").trim(); if (!q) return;
    if (!DS) { addMsg("Veriler yüklenmedi, bekleyin…","bot"); return; }
    addMsg(q,"user"); input.value=""; input.style.height="auto"; sugs.style.display="none";
    const typing=addTyping();
    setTimeout(()=>{typing.remove();addMsg(answer(q,DS),"bot");},200);
  }

  /* ─────────────────── DÜZENLEME SEKMESİ ─────────────────── */
  // Düzenleme sekmesi artık sitenin kendi modalına yönlendiriyor.
  // Bu fonksiyon "Turne Düzenle" butonunu/linkini tetikler.
  function openSiteEditModal(oyunAdi) {
    // Sitedeki düzenle butonunu bul — oyun adıyla eşleş
    const allBtns = document.querySelectorAll("button, a");
    for (const btn of allBtns) {
      const txt = btn.textContent.trim();
      if (/(düzenle|edit)/i.test(txt) && btn.closest("[data-oyun]")?.dataset?.oyun === oyunAdi) {
        btn.click(); return true;
      }
    }
    // Alternatif: data-id veya href ile eşleş
    const editLinks = document.querySelectorAll("a[href*='duzenle'],a[href*='edit'],button[data-action='edit']");
    for (const el of editLinks) {
      if (el.textContent.includes(oyunAdi) || el.closest("[data-title]")?.dataset?.title === oyunAdi) {
        el.click(); return true;
      }
    }
    return false;
  }

  function populateEditSelect() {
    if (!DS) return;
    const sel = $i("ta-edit-select");
    const cur = sel.value;
    while (sel.options.length > 1) sel.remove(1);
    // En yeniden en eskiye sırala
    const sorted = [...DS.turneler].sort((a,b) => (parseDate(b.baslangic)||0) - (parseDate(a.baslangic)||0));
    for (const t of sorted) {
      const opt = document.createElement("option");
      opt.value = t.oyun + "||" + t.baslangic; // unique key
      opt.textContent = `${t.oyun} — ${t.il||"?"} · ${fmtTarih(t.baslangic)}`;
      sel.appendChild(opt);
    }
    if (cur) sel.value = cur;
  }

  $i("ta-edit-select")?.addEventListener("change", function() {
    const val = this.value;
    const body = $i("ta-edit-body");
    const actions = $i("ta-edit-actions");
    if (!val || !DS) {
      body.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#B0A99E;"><div style="font-size:28px;margin-bottom:8px;">✏️</div><div style="font-size:13px;font-weight:600;">Düzenlemek için bir turne seçin</div></div>';
      actions.style.display = "none"; return;
    }
    const [oyun, bas] = val.split("||");
    const t = DS.turneler.find(x => x.oyun === oyun && x.baslangic === bas);
    if (!t) return;

    actions.style.display = "none"; // asistan içinde form yok
    body.innerHTML = `
      <div style="padding:16px 0 8px;">
        <!-- Turne özet bilgi kartı -->
        <div style="background:#fff;border:1px solid #E8E2D7;border-radius:12px;padding:14px;margin-bottom:12px;">
          <div style="font-size:13px;font-weight:800;color:#1A1A1A;margin-bottom:6px;">🎭 ${esc(t.oyun)}</div>
          <div style="font-size:12px;color:#6A6560;line-height:1.7;">
            📅 ${fmtTarihAralik(t.baslangic,t.bitis)}<br>
            📍 ${esc(t.il||"—")} ${t.mekan?"· "+esc(t.mekan):""}<br>
            🎫 ${t.sayi||"?"} temsil · ${turneGun(t)} gün · <span style="font-weight:700;color:${t.statu.includes("tamamlan")?"#2F7D4E":t.statu.includes("iptal")?"#B53030":"#A0192E"}">${statuGoster(t.statu)}</span>
          </div>
          ${t.gidisUlasim?`<div style="margin-top:6px;font-size:12px;color:#6A6560;">🚌 Gidiş: <strong>${esc(t.gidisUlasim)}</strong>${t.gidisSaat?" · ✈️ "+esc(t.gidisSaat):""}</div>`:""}
          ${t.donusUlasim?`<div style="font-size:12px;color:#6A6560;">🔄 Dönüş: <strong>${esc(t.donusUlasim)}</strong>${t.donusSaat?" · ✈️ "+esc(t.donusSaat):""}</div>`:""}
          ${t.otelAdi?`<div style="font-size:12px;color:#6A6560;">🏨 ${esc(t.otelAdi)}${t.otelTel?" · <a href='tel:"+t.otelTel+"' style='color:#A0192E;font-weight:700;text-decoration:none'>"+fmtTel(t.otelTel)+"</a>":""}</div>`:""}
          ${t.not?`<div style="margin-top:6px;font-size:11.5px;color:#8A857C;background:#FBF8F3;border-radius:6px;padding:6px 8px;">📝 ${esc(t.not)}</div>`:""}
        </div>

        <!-- Düzenle butonu — sitenin kendi modalına yönlendir -->
        <div style="background:linear-gradient(135deg,#A0192E,#6B0E1E);border-radius:12px;padding:16px;text-align:center;color:#fff;">
          <div style="font-size:18px;margin-bottom:6px;">✏️</div>
          <div style="font-size:13px;font-weight:800;margin-bottom:4px;">Turneyi Düzenle</div>
          <div style="font-size:11px;opacity:.85;margin-bottom:12px;">Düzenleme için sitenin modalını açın</div>
          <button class="ta-btn" id="ta-modal-open-btn" style="background:rgba(255,255,255,.2);color:#fff;border:1.5px solid rgba(255,255,255,.4);width:100%;justify-content:center;font-size:13px;">
            🔗 Turne Düzenleme Sayfasını Aç
          </button>
        </div>

        <!-- Kadro özeti -->
        ${t.katilimcilar.length ? `
        <div style="margin-top:12px;">
          <div class="ta-section-title">👥 Kadro (${t.katilimcilar.length} kişi)</div>
          ${t.katilimcilar.slice(0,20).map(k=>`<div style="padding:4px 8px;font-size:12px;border-bottom:1px solid #F0EBE5;display:flex;justify-content:space-between;"><span style="font-weight:600">${esc(k.kisi)}</span><span style="color:#8A857C;font-size:11px">${esc(k.gorev||k.kategori)}</span></div>`).join("")}
          ${t.katilimcilar.length>20?`<div style="text-align:center;font-size:11px;color:#B0A99E;padding:6px">+${t.katilimcilar.length-20} kişi daha</div>`:""}
        </div>` : ""}
        <div style="height:16px"></div>
      </div>`;

    // Modal açma butonu — sitenin turne edit sayfasını/modalını trigger et
    $i("ta-modal-open-btn")?.addEventListener("click", () => {
      // Önce sayfada turne adıyla eşleşen edit butonunu ara
      const found = openSiteEditModal(t.oyun);
      if (!found) {
        // Bulunamazsa panel kapat, kullanıcı sayfadan bulur
        togglePanel(false);
        showToast("⚠️ Sayfada ilgili turneyi bulup Düzenle butonuna tıklayın", 3000);
      }
    });
  });

  function esc(s) { return (s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  /* ─────────────────── HATIRLATICI SEKMESİ ─────────────────── */
  function loadReminders() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); } catch(e){ return []; } }
  function saveReminders(arr) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(arr)); } catch(e){} }

  function checkReminders() {
    const now=new Date(), today=now.toDateString();
    const arr=loadReminders();
    const due=arr.filter(r=>!r.done&&r.date&&new Date(r.date).toDateString()===today);
    const overdue=arr.filter(r=>!r.done&&r.date&&new Date(r.date)<now&&new Date(r.date).toDateString()!==today);
    const total=due.length+overdue.length;
    if (total>0) { fabBadge.textContent=total;fabBadge.classList.add("show"); } else { fabBadge.classList.remove("show"); }
    remindBadge.textContent=total; remindBadge.style.display=total>0?"inline-flex":"none";
  }

  function renderReminders() {
    const body=$i("ta-remind-body"); if(!body) return;
    const arr=loadReminders();
    const now=new Date();

    const addBtn=document.createElement("div"); addBtn.className="ta-remind-add"; addBtn.innerHTML="＋ Yeni Hatırlatıcı Ekle"; addBtn.addEventListener("click",()=>showAddForm());

    // Dışa/içe aktar satırı
    const syncRow = document.createElement("div");
    syncRow.style.cssText="display:flex;gap:6px;margin-bottom:8px;";
    syncRow.innerHTML=`
      <button class="ta-rehber-btn" id="ta-remind-export" style="flex:1;justify-content:center;" title="Tüm hatırlatıcıları JSON olarak kopyala">
        📤 Dışa Aktar
      </button>
      <button class="ta-rehber-btn" id="ta-remind-import" style="flex:1;justify-content:center;" title="JSON yapıştırarak içe aktar">
        📥 İçe Aktar
      </button>`;

    body.innerHTML="";
    body.appendChild(addBtn);
    body.appendChild(syncRow);

    $i("ta-remind-export")?.addEventListener("click", () => {
      const json = JSON.stringify(loadReminders(), null, 2);
      navigator.clipboard.writeText(json).then(()=>showToast("📤 Hatırlatıcılar kopyalandı — diğer bilgisayarda İçe Aktar'a yapıştırın",3000));
    });
    $i("ta-remind-import")?.addEventListener("click", () => {
      const raw = prompt("Hatırlatıcı JSON'unu yapıştırın:");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("Geçersiz format");
        const existing = loadReminders();
        const merged = [...existing];
        for (const r of parsed) if (!merged.find(e=>e.id===r.id)) merged.push(r);
        saveReminders(merged); checkReminders(); renderReminders();
        showToast(`✅ ${parsed.length} hatırlatıcı içe aktarıldı`,2500);
      } catch(e) { showToast("❌ Geçersiz JSON formatı",2500); }
    });

    if (!arr.length) { const empty=document.createElement("div"); empty.className="ta-remind-empty"; empty.innerHTML='<div class="ta-remind-empty-icon">🔔</div><div class="ta-remind-empty-text">Henüz hatırlatıcı yok</div><div style="font-size:11px;margin-top:4px;color:#C0BAB2">Farklı cihazlarda görmek için Dışa Aktar → İçe Aktar kullanın</div>'; body.appendChild(empty); return; }

    // Sırala: gecikmiş → bugün → gelecek → tamamlandı
    const sorted=[...arr].sort((a,b)=>{
      const da=a.date?new Date(a.date):new Date("9999");
      const db=b.date?new Date(b.date):new Date("9999");
      if (a.done!==b.done) return a.done?1:-1;
      return da-db;
    });

    for (const [idx,r] of sorted.entries()) {
      const d=r.date?new Date(r.date):null;
      const isToday=d&&d.toDateString()===now.toDateString();
      const isOverdue=d&&d<now&&!isToday;
      const item=document.createElement("div");
      item.className="ta-remind-item"+(r.done?" done":isToday?" today":isOverdue?" overdue":"");

      const icons={"turne":"🎭","otel":"🏨","ulasim":"🚌","odeme":"💰","toplanti":"📅","diger":"🔔"};
      const icon=icons[r.type||"diger"]||"🔔";
      const dateStr=d?`${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`:"Tarihi yok";
      const durum=r.done?"✅ Tamamlandı":isToday?`<strong>⚡ Bugün</strong>`:isOverdue?`<strong style="color:#B53030">⚠️ Gecikmiş</strong>`:`📅 ${dateStr}`;

      item.innerHTML=`
        <div class="ta-remind-icon" style="background:${r.done?"#F0EBE5":isToday?"#FBE8EB":isOverdue?"#FFF0F0":"#F8F4F0"}">${icon}</div>
        <div class="ta-remind-content">
          <div class="ta-remind-text">${esc(r.text)}</div>
          <div class="ta-remind-meta">${durum}${r.turne?` · <strong>${esc(r.turne)}</strong>`:""}</div>
        </div>
        <div class="ta-remind-actions">
          ${!r.done?`<button class="ta-remind-btn" data-action="done" data-id="${r.id}" title="Tamamlandı">✓</button>`:`<button class="ta-remind-btn" data-action="undone" data-id="${r.id}" title="Geri al">↩</button>`}
          <button class="ta-remind-btn" data-action="delete" data-id="${r.id}" title="Sil" style="color:#B53030">✕</button>
        </div>`;
      body.appendChild(item);
    }

    body.querySelectorAll(".ta-remind-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const id=btn.dataset.id, action=btn.dataset.action;
        let arr=loadReminders();
        if (action==="done"||action==="undone") { arr=arr.map(r=>r.id===id?{...r,done:action==="done"}:r); }
        else if (action==="delete") { arr=arr.filter(r=>r.id!==id); }
        saveReminders(arr); checkReminders(); renderReminders(); _reminderBadgeGuncelle();
      });
    });
  }

  function showAddForm() {
    const body=$i("ta-remind-body"); if(!body) return;
    const turneOptions=DS?DS.turneler.map(t=>`<option value="${esc(t.oyun)}">${esc(t.oyun)} — ${esc(t.il||"?")} · ${fmtTarih(t.baslangic)}</option>`).join(""):"";
    const form=document.createElement("div"); form.className="ta-remind-form";
    const today=new Date().toISOString().slice(0,10);
    form.innerHTML=`
      <div class="ta-field"><label>Hatırlatıcı Metni</label><input id="rf-text" placeholder="ör: Otel rezervasyonu yap, Uçak bileti al…"></div>
      <div class="ta-field-row">
        <div class="ta-field"><label>Tür</label>
          <select id="rf-type">
            <option value="diger">🔔 Genel</option>
            <option value="turne">🎭 Turne</option>
            <option value="otel">🏨 Otel</option>
            <option value="ulasim">🚌 Ulaşım</option>
            <option value="odeme">💰 Ödeme</option>
            <option value="toplanti">📅 Toplantı</option>
          </select>
        </div>
        <div class="ta-field"><label>Tarih</label><input id="rf-date" type="date" value="${today}"></div>
      </div>
      ${turneOptions?`<div class="ta-field"><label>İlgili Turne (opsiyonel)</label><select id="rf-turne"><option value="">— Seçiniz —</option>${turneOptions}</select></div>`:""}
      <div style="display:flex;gap:6px;margin-top:2px;">
        <button class="ta-btn ta-btn-primary" id="rf-save" style="flex:1">Ekle</button>
        <button class="ta-btn ta-btn-secondary" id="rf-cancel">İptal</button>
      </div>`;
    body.insertBefore(form, body.children[1]||null);
    $i("rf-text")?.focus();
    if (window._pendingRemineTurne) { const sel=$i("rf-turne"); if(sel){for(const opt of sel.options)if(opt.value===window._pendingRemineTurne){sel.value=opt.value;break;}} window._pendingRemineTurne=null; }
    $i("rf-cancel")?.addEventListener("click",()=>{form.remove();});
    $i("rf-save")?.addEventListener("click",()=>{
      const text=($i("rf-text")?.value||"").trim();
      if (!text) { $i("rf-text").style.borderColor="#A0192E"; return; }
      const arr=loadReminders();
      arr.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2), text, type:$i("rf-type")?.value||"diger", date:$i("rf-date")?.value||"", turne:$i("rf-turne")?.value||"", done:false, created:new Date().toISOString() });
      saveReminders(arr); checkReminders(); form.remove(); renderReminders(); _reminderBadgeGuncelle();
    });
  }

  /* ─────────────────── REHBER SEKMESİ ─────────────────── */
  const KAT_ICON = { otel:"🏨", nakliye:"🚛", ulasim:"🚌", servis:"🔧", diger:"👤" };
  const KAT_BG   = { otel:"#FBE8EB", nakliye:"#EDF2FB", ulasim:"#EBF5FB", servis:"#F0FBF0", diger:"#F5F0FB" };

  function renderRehber(filterQ, filterCat) {
    const body = $i("ta-rehber-body"); if (!body || !DS) return;
    const F = DS.firmalar || [];
    const q  = (filterQ  || $i("ta-rehber-q")?.value  || "").trim().toLocaleLowerCase("tr");
    const cat= (filterCat|| $i("ta-rehber-cat")?.value || "");

    const filtered = F.filter(f => {
      if (cat && f.kategori !== cat) return false;
      if (q) { const all = norm(f.ad+" "+f.tel+" "+f.not+" "+f.kaynak); return all.includes(norm(q)); }
      return true;
    });

    if (!filtered.length) { body.innerHTML='<div class="ta-rehber-empty">Sonuç bulunamadı 🔍</div>'; return; }

    body.innerHTML = "";
    for (const f of filtered) {
      const icon = KAT_ICON[f.kategori] || "📋";
      const bg   = KAT_BG[f.kategori]  || "#F8F4F0";
      const telHref = f.tel ? `<a href="tel:${f.tel}">${fmtTel(f.tel)||f.tel}</a>` : "";
      const tagCity = f.kaynak ? f.kaynak.split("·").pop().trim() : "";
      const isOtel = f.kategori === "otel";

      const card = document.createElement("div");
      card.className = "ta-rehber-card";
      card.innerHTML = `
        <div class="ta-rehber-card-head">
          <div class="ta-rehber-icon" style="background:${bg}">${icon}</div>
          <div class="ta-rehber-info">
            <div class="ta-rehber-name">${esc(f.ad)}</div>
            ${f.tel?`<div class="ta-rehber-tel">📞 ${telHref}</div>`:""}
            ${f.not?`<div class="ta-rehber-adres">📍 ${esc(f.not)}</div>`:""}
            ${tagCity?`<span class="ta-rehber-tag">${esc(tagCity)}</span>`:""}
          </div>
        </div>
        <div class="ta-rehber-actions">
          <button class="ta-rehber-btn copy-btn" data-copy="${esc(f.ad+(f.tel?"\nTel: "+(fmtTel(f.tel)||f.tel):"")+(f.not?"\nAdres: "+f.not:""))}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Kopyala
          </button>
          <button class="ta-rehber-btn copy-btn" data-copy="${esc(f.tel||"")}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84A16 16 0 0 0 16 16.91l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Sadece Tel
          </button>
          ${isOtel ? `<button class="ta-rehber-btn aktar aktar-btn"
            data-ad="${esc(f.ad)}" data-tel="${esc(f.tel||"")}" data-adres="${esc(f.not||"")}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Forma Aktar
          </button>` : ""}
        </div>`;

      // Kopyala butonları
      card.querySelectorAll(".copy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const text = btn.dataset.copy || "";
          if (!text) return;
          navigator.clipboard.writeText(text).then(()=>{
            btn.classList.add("copied"); btn.textContent = "✓ Kopyalandı";
            showToast("📋 Panoya kopyalandı!");
            setTimeout(()=>{ btn.classList.remove("copied"); btn.innerHTML = btn.dataset.copy === (f.tel||"") ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84A16 16 0 0 0 16 16.91l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Sadece Tel' : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Kopyala'; }, 2000);
          }).catch(()=>showToast("❌ Kopyalama başarısız"));
        });
      });

      // Forma Aktar butonu
      card.querySelector(".aktar-btn")?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        aktarOtelFormuna(btn.dataset.ad, btn.dataset.tel, btn.dataset.adres);
      });

      body.appendChild(card);
    }
  }

  // Rehber arama + filtre canlı güncelleme
  document.addEventListener("input", e => { if (e.target.id === "ta-rehber-q") renderRehber(); });
  document.addEventListener("change", e => { if (e.target.id === "ta-rehber-cat") renderRehber(); });

  function aktarOtelFormuna(ad, tel, adres) {
    window.__taAktar = aktarOtelFormuna; // ensure global stays fresh
    // Önce düzenleme sekmesine geç
    document.querySelectorAll(".ta-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".ta-view").forEach(v => v.classList.remove("active"));
    const editTab = document.querySelector('.ta-tab[data-view="edit"]');
    editTab?.classList.add("active");
    $i("ta-edit-view")?.classList.add("active");
    if (DS) populateEditSelect();

    // Turne seçili değilse uyar, seçiliyse doldur
    setTimeout(() => {
      const otelInput  = $i("ef-otel");
      const otelTel    = $i("ef-otelt");
      const otelAdres  = $i("ef-otela");
      if (!otelInput) {
        showToast("⚠️ Önce bir turne seçin!", 2500);
        return;
      }
      // Alanları doldur (sadece boşsa doldurmak yerine her zaman dolduruyoruz, kullanıcı isterse üzerine yazar)
      if (ad)    { otelInput.value = ad;    otelInput.dispatchEvent(new Event("input")); flashField(otelInput); }
      if (tel)   { otelTel.value   = tel;   otelTel.dispatchEvent(new Event("input"));   flashField(otelTel); }
      if (adres) { otelAdres.value = adres; otelAdres.dispatchEvent(new Event("input")); flashField(otelAdres); }
      showToast(`✅ "${ad}" forma aktarıldı`);
      // Otel bölümüne scroll
      otelInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }

  function flashField(el) {
    el.style.borderColor = "#A0192E";
    el.style.background = "#FBE8EB";
    el.style.transition = "background 0.6s, border-color 0.6s";
    setTimeout(() => { el.style.background = "#fff"; el.style.borderColor = "#E8E2D7"; }, 1200);
  }

  /* ─────────────────── İSTATİSTİK SEKMESİ ─────────────────── */
  function renderStats() {
    if (!DS) return;
    const body=$i("ta-stat-body"); if(!body) return;
    const T=DS.turneler;
    const now=new Date();

    const toplam=T.length;
    const tamamlanan=T.filter(t=>t.statu.startsWith("tamamlan")).length;
    const devam=T.filter(t=>t.statu.startsWith("devam")||t.statu==="aktif"||t.statu==="onaylandi"||t.statu==="onay-bekliyor").length;
    const iptal=T.filter(t=>t.statu==="iptal").length;
    const gelecek=T.filter(t=>{const d=parseDate(t.baslangic);return d&&d>now;}).length;
    const toplamGun=T.filter(t=>!t.statu.includes("iptal")).reduce((s,t)=>s+turneGun(t),0);
    const toplamTemsil=T.filter(t=>!t.statu.includes("iptal")).reduce((s,t)=>s+(t.sayi||0),0);
    const personelSet=new Set();T.filter(t=>!t.statu.includes("iptal")).forEach(t=>t.katilimcilar.forEach(k=>personelSet.add(norm(k.kisi))));

    // Şehir sıklığı
    const ilMap=new Map();
    T.filter(t=>!t.statu.includes("iptal")).forEach(t=>{const ils=new Set();if(t.il)ils.add(t.il);(t.duraklar||[]).forEach(d=>{if(d.il)ils.add(d.il);});ils.forEach(il=>ilMap.set(il,(ilMap.get(il)||0)+1));});
    const topIller=[...ilMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);

    // Kişi sıklığı (iptal hariç)
    const kisiMap=new Map();
    T.filter(t=>!t.statu.includes("iptal")).forEach(t=>t.katilimcilar.forEach(k=>{kisiMap.set(k.kisi,(kisiMap.get(k.kisi)||0)+1);}));
    const topKisiler=[...kisiMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);

    // Aylık dağılım
    const ayMap=new Array(12).fill(0);
    T.filter(t=>!t.statu.includes("iptal")).forEach(t=>{const d=parseDate(t.baslangic);if(d)ayMap[d.getMonth()]++;});
    const maxAy=Math.max(...ayMap,1);

    // Görev dağılımı
    const gorevMap=new Map();
    T.filter(t=>!t.statu.includes("iptal")).forEach(t=>t.katilimcilar.forEach(k=>{const rawG=k.kategori||k.gorev||"Diğer";const g=rawG==="Turne Ekstra Kadrosu"||rawG==="Ekstra"?"Ek Kadro":rawG;if(!gorevMap.has(g))gorevMap.set(g,new Set());gorevMap.get(g).add(norm(k.kisi));}));
    const topGorevler=[...gorevMap.entries()].map(([g,s])=>[g,s.size]).sort((a,b)=>b[1]-a[1]).slice(0,6);

    // Yıl dağılımı
    const yilMap=new Map();
    T.filter(t=>!t.statu.includes("iptal")).forEach(t=>{const d=parseDate(t.baslangic);if(d){const y=d.getFullYear();yilMap.set(y,(yilMap.get(y)||0)+1);}});
    const sortedYillar=[...yilMap.entries()].sort((a,b)=>a[0]-b[0]);

    body.innerHTML=`
      <!-- KPI -->
      <div class="ta-kpi-grid">
        <div class="ta-kpi"><div class="ta-kpi-val">${toplam}</div><div class="ta-kpi-lbl">Toplam Turne</div></div>
        <div class="ta-kpi"><div class="ta-kpi-val">${toplamGun}</div><div class="ta-kpi-lbl">Toplam Gün</div></div>
        <div class="ta-kpi"><div class="ta-kpi-val">${toplamTemsil}</div><div class="ta-kpi-lbl">Toplam Temsil</div></div>
        <div class="ta-kpi"><div class="ta-kpi-val">${personelSet.size}</div><div class="ta-kpi-lbl">Toplam Personel</div></div>
      </div>
      <div class="ta-kpi-grid" style="margin-bottom:12px;">
        <div class="ta-kpi"><div class="ta-kpi-val" style="color:#2F7D4E">${tamamlanan}</div><div class="ta-kpi-lbl">Tamamlandı</div></div>
        <div class="ta-kpi"><div class="ta-kpi-val" style="color:#3A6FB0">${devam}</div><div class="ta-kpi-lbl">Devam Ediyor</div></div>
        <div class="ta-kpi"><div class="ta-kpi-val" style="color:#C97A12">${gelecek}</div><div class="ta-kpi-lbl">Planlandı</div></div>
        <div class="ta-kpi"><div class="ta-kpi-val" style="color:#B53030">${iptal}</div><div class="ta-kpi-lbl">İptal</div></div>
      </div>

      <!-- AYLIK DAĞILIM -->
      <div class="ta-stat-section">
        <div class="ta-stat-section-title">📅 Aylık Dağılım</div>
        <div class="ta-stat-month">
          ${ayMap.map((n,i)=>`
            <div class="ta-stat-month-col">
              <div class="ta-stat-month-val">${n||""}</div>
              <div class="ta-stat-month-bar" style="height:${Math.round((n/maxAy)*44)+2}px;opacity:${n?1:.2}"></div>
              <div class="ta-stat-month-lbl">${AYLAR[i].slice(0,3)}</div>
            </div>`).join("")}
        </div>
      </div>

      <!-- YILLIK -->
      ${sortedYillar.length>1?`<div class="ta-stat-section">
        <div class="ta-stat-section-title">📆 Yıllara Göre</div>
        ${sortedYillar.map(([y,n],i)=>`<div class="ta-stat-row"><span class="ta-stat-rank">${i+1}</span><span class="ta-stat-name">${y}</span><div class="ta-stat-bar-wrap"><div class="ta-stat-bar" style="width:${Math.round(n/sortedYillar[0][1]*100)}%"></div></div><span class="ta-stat-val">${n}</span></div>`).join("")}
      </div>`:""}

      <!-- EN ÇOK GİDİLEN ŞEHIRLER -->
      <div class="ta-stat-section">
        <div class="ta-stat-section-title">🏙 En Çok Gidilen Şehirler</div>
        ${topIller.map(([il,n],i)=>`<div class="ta-stat-row"><span class="ta-stat-rank">${i+1}</span><span class="ta-stat-name">${il}</span><div class="ta-stat-bar-wrap"><div class="ta-stat-bar" style="width:${Math.round(n/topIller[0][1]*100)}%"></div></div><span class="ta-stat-val">${n} turne</span></div>`).join("")}
      </div>

      <!-- EN ÇOK TURNEYE GİDEN -->
      <div class="ta-stat-section">
        <div class="ta-stat-section-title">👤 En Aktif Personel</div>
        ${topKisiler.map(([k,n],i)=>`<div class="ta-stat-row"><span class="ta-stat-rank">${i+1}</span><span class="ta-stat-name">${k}</span><div class="ta-stat-bar-wrap"><div class="ta-stat-bar" style="width:${Math.round(n/topKisiler[0][1]*100)}%"></div></div><span class="ta-stat-val">${n} turne</span></div>`).join("")}
      </div>

      <!-- GÖREV DAĞILIMI -->
      <div class="ta-stat-section">
        <div class="ta-stat-section-title">🎭 Görev Dağılımı</div>
        ${topGorevler.map(([g,n],i)=>`<div class="ta-stat-row"><span class="ta-stat-rank">${i+1}</span><span class="ta-stat-name">${g}</span><div class="ta-stat-bar-wrap"><div class="ta-stat-bar" style="width:${Math.round(n/topGorevler[0][1]*100)}%"></div></div><span class="ta-stat-val">${n} kişi</span></div>`).join("")}
      </div>

      <!-- ÖZET METRİKLER -->
      <div class="ta-stat-section">
        <div class="ta-stat-section-title">📊 Özet</div>
        <div class="ta-stat-row"><span class="ta-stat-name">Ortalama turne süresi</span><span class="ta-stat-val">${T.length?Math.round(toplamGun/T.length):0} gün</span></div>
        <div class="ta-stat-row"><span class="ta-stat-name">Turne başına ortalama temsil</span><span class="ta-stat-val">${T.length?Math.round(toplamTemsil/T.length):0}</span></div>
        <div class="ta-stat-row"><span class="ta-stat-name">Turne başına ortalama kadro</span><span class="ta-stat-val">${T.length?Math.round(T.reduce((s,t)=>s+t.katilimcilar.length,0)/T.length):0} kişi</span></div>
        <div class="ta-stat-row"><span class="ta-stat-name">Tamamlanma oranı</span><span class="ta-stat-val">${toplam?Math.round(tamamlanan/toplam*100):0}%</span></div>
      </div>
      <div style="height:12px"></div>
    `;
  }


  /* ─────────────────── TURNE KARTI HATIRLATICI BADGE ─────────────── */
  function _reminderBadgeGuncelle() {
    const arr = loadReminders().filter(r => !r.done && r.turne);
    const sayac = new Map();
    for (const r of arr) { const n = norm(r.turne); sayac.set(n, (sayac.get(n)||0)+1); }
    document.querySelectorAll('.ta-remind-card-badge').forEach(b=>b.remove());
    if (!sayac.size || !DS) return;
    document.querySelectorAll('.turne-card').forEach(card => {
      const titleEl = card.querySelector('.turne-card-title');
      if (!titleEl) return;
      const oyun = titleEl.textContent.trim();
      const say = sayac.get(norm(oyun));
      if (!say) return;
      const band = card.querySelector('div[style*="padding:7px"]');
      if (!band) return;
      const badge = document.createElement('span');
      badge.className = 'ta-remind-card-badge';
      badge.setAttribute('style', 'display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:800;background:rgba(255,255,255,.92);color:#A0192E;border-radius:20px;padding:2px 7px;line-height:1.4;border:1px solid rgba(160,25,46,.35);cursor:pointer;flex-shrink:0;margin-right:4px;');
      badge.title = say + ' bekleyen hatırlatıcı';
      badge.textContent = '\uD83D\uDD14 ' + say;
      badge.onclick = (e) => { e.stopPropagation(); togglePanel(true); document.querySelector('.ta-tab[data-view="remind"]')?.click(); };
      const rightSpan = band.querySelector('span:last-child');
      if (rightSpan) rightSpan.prepend(badge);
      else band.appendChild(badge);
    });
  }
  // Kart render olunca badge'leri güncelle
  const _cardObs = new MutationObserver(_debounce(_reminderBadgeGuncelle, 400));
  function _startCardObs() {
    const grid = document.getElementById('liste-content');
    if (grid) _cardObs.observe(grid, { childList: true, subtree: false });
    else setTimeout(_startCardObs, 800);
  }
  _startCardObs();

  /* ─────────────────── BAŞLAT ─────────────────── */
  addMsg({html:"👋 Merhaba! Ben <strong>Turne Asistanı</strong>'yım.\n\nOtel numaraları, firma rehberi, kişi listeleri, tarih & istatistik sorularınızı yanıtlarım.\n\n<span style='font-size:12px;color:#8A857C'>💡 Üst sekmeleri kullanarak turne <strong>düzenleyebilir</strong>, <strong>hatırlatıcı</strong> ekleyebilir ve <strong>istatistikleri</strong> görüntüleyebilirsiniz.</span>"},"bot",true);

  const SUGS=["Bir sonraki turne ne zaman?","Liderlik tablosu","Çakışan kadro var mı?","30 günlük özet","Kadro eksik turneler"];
  for (const s of SUGS) { const b=document.createElement("button");b.type="button";b.className="ta-sug";b.textContent=s;b.addEventListener("click",()=>submit(s));sugs.appendChild(b); }

  loadData().then(()=>{ setTimeout(_reminderBadgeGuncelle, 1500); });
  setInterval(()=>{ checkReminders(); _reminderBadgeGuncelle(); }, 60000);
  window.__taAktar = aktarOtelFormuna;
})();
