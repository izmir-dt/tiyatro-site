/* ════════════════════════════════════════════════════════════════
   TURNE ASİSTANI v5.3
   İzmir Devlet Tiyatrosu
   YENİ: Turne düzenleme · Hatırlatıcı · Detaylı istatistik
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.__turneAsistanLoaded === 'v5.3') return;
  window.__turneAsistanLoaded = 'v5.3';

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

  /* İç uyarı / giriş modalı */
  #ta-modal-backdrop{position:fixed;inset:0;background:rgba(20,8,4,.48);display:none;align-items:center;justify-content:center;z-index:9805;padding:18px;backdrop-filter:blur(2px);}
  #ta-modal-backdrop.open{display:flex;}
  #ta-modal{width:min(520px,calc(100vw - 24px));background:#1E2227;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.35);padding:22px 24px;}
  #ta-modal-title{font-size:16px;font-weight:800;line-height:1.3;margin-bottom:10px;}
  #ta-modal-desc{font-size:12.5px;line-height:1.6;color:rgba(255,255,255,.86);margin-bottom:14px;white-space:pre-wrap;}
  .ta-modal-input{width:100%;border:2px solid #A9C3F5;border-radius:12px;padding:11px 13px;font-size:14px;font-family:inherit;background:#181C20;color:#fff;outline:none;box-sizing:border-box;}
  .ta-modal-input:focus{border-color:#C6D8FF;box-shadow:0 0 0 3px rgba(169,195,245,.15);}
  .ta-modal-input::placeholder{color:rgba(255,255,255,.34);}
  #ta-modal-textarea{min-height:150px;resize:vertical;line-height:1.5;}
  #ta-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px;}
  .ta-modal-btn{min-width:92px;height:46px;border:none;border-radius:999px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:transform .12s,opacity .15s;}
  .ta-modal-btn:hover{transform:translateY(-1px);}
  .ta-modal-btn.cancel{background:#244F93;color:#EAF1FF;}
  .ta-modal-btn.ok{background:#9FC0FF;color:#10346B;}

  @media(max-width:600px){
    #ta-panel{width:calc(100vw - 16px);right:8px;bottom:80px;height:calc(100vh - 100px);}
    #ta-fab{bottom:16px;right:16px;width:50px;height:50px;}
    #ta-modal{padding:18px 16px;border-radius:16px;}
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

  /* ── SORU REHBERİ GÖRÜNÜMÜ ── */
  #ta-sorular-view{background:#FBF8F3;}
  .ta-sorular-body{flex:1;overflow-y:auto;padding:12px;}
  .ta-sorular-body::-webkit-scrollbar{width:4px;}
  .ta-sorular-body::-webkit-scrollbar-thumb{background:#D9C9BD;border-radius:4px;}
  .ta-sorular-intro{font-size:12px;color:#6A6560;line-height:1.55;margin-bottom:12px;padding:10px 12px;
    background:#fff;border:1px solid #E8E2D7;border-radius:10px;}
  .ta-sorular-search{width:100%;border:1.5px solid #E8E2D7;border-radius:9px;padding:8px 12px;font-size:12.5px;
    font-family:inherit;background:#fff;outline:none;color:#1A1A1A;margin-bottom:10px;transition:border-color .15s;}
  .ta-sorular-search:focus{border-color:#A0192E;box-shadow:0 0 0 3px rgba(160,25,46,.08);}
  .ta-sorular-cat{background:#fff;border:1px solid #E8E2D7;border-radius:10px;margin-bottom:8px;overflow:hidden;}
  .ta-sorular-cat-head{padding:9px 12px;font-size:11px;font-weight:800;color:#A0192E;text-transform:uppercase;
    letter-spacing:.5px;background:#FBF8F3;border-bottom:1px solid #E8E2D7;display:flex;align-items:center;gap:6px;}
  .ta-sorular-list{padding:8px 10px;display:flex;flex-wrap:wrap;gap:5px;}
  .ta-sorular-q{font-size:11.5px;padding:6px 11px;border:1px solid #E8E2D7;background:#FBF8F3;border-radius:999px;
    cursor:pointer;color:#1A1A1A;font-family:inherit;transition:all .15s;text-align:left;line-height:1.3;}
  .ta-sorular-q:hover{border-color:#A0192E;color:#A0192E;background:#FBE8EB;}
  .ta-sorular-empty{text-align:center;padding:30px 20px;color:#B0A99E;font-size:12.5px;font-weight:600;}
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
        <button class="ta-tab" data-view="sorular">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Soru Rehberi
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

      <!-- SORU REHBERİ -->
      <div class="ta-view" id="ta-sorular-view">
        <div class="ta-sorular-body" id="ta-sorular-body">
          <div class="ta-sorular-intro">
            Aşağıdaki sorulardan birine tıklayın; cevabı sohbet sekmesinde görün.
            Üstteki kutuya yazarak arama da yapabilirsiniz.
          </div>
          <input type="search" class="ta-sorular-search" id="ta-sorular-q" placeholder="Soru ara… (örn. otel, kadro, hava)">
          <div id="ta-sorular-list"></div>
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
  const promptModal = document.createElement("div");
  promptModal.id = "ta-modal-backdrop";
  promptModal.innerHTML = `
    <div id="ta-modal" role="dialog" aria-modal="true" aria-labelledby="ta-modal-title">
      <div id="ta-modal-title"></div>
      <div id="ta-modal-desc"></div>
      <input id="ta-modal-input" class="ta-modal-input" type="text" />
      <textarea id="ta-modal-textarea" class="ta-modal-input" style="display:none;"></textarea>
      <div id="ta-modal-actions">
        <button type="button" class="ta-modal-btn cancel" id="ta-modal-cancel">İptal</button>
        <button type="button" class="ta-modal-btn ok" id="ta-modal-ok">Tamam</button>
      </div>
    </div>`;
  document.body.appendChild(promptModal);
  function showToast(msg, dur=1800){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),dur);}

  const $i = id => document.getElementById(id);
  const panel = $i("ta-panel"), msgs = $i("ta-msgs"), sugs = $i("ta-sugs");
  const input = $i("ta-input"), send = $i("ta-send"), status = $i("ta-status");
  const head = $i("ta-head"), resizeH = $i("ta-resize");
  const fabBadge = $i("ta-fab-badge"), remindBadge = $i("ta-remind-badge");
  const modalBackdrop = $i("ta-modal-backdrop"), modalTitle = $i("ta-modal-title"), modalDesc = $i("ta-modal-desc");
  const modalInput = $i("ta-modal-input"), modalTextarea = $i("ta-modal-textarea");
  const modalOk = $i("ta-modal-ok"), modalCancel = $i("ta-modal-cancel");

  function openInlinePrompt({ title, description = "", placeholder = "", defaultValue = "", multiline = false, okText = "Tamam", cancelText = "İptal" }) {
    return new Promise(resolve => {
      modalTitle.textContent = title || "Bilgi gerekli";
      modalDesc.textContent = description || "";
      modalOk.textContent = okText;
      modalCancel.textContent = cancelText;
      const field = multiline ? modalTextarea : modalInput;
      const other = multiline ? modalInput : modalTextarea;
      other.style.display = "none";
      field.style.display = "block";
      field.placeholder = placeholder || "";
      field.value = defaultValue || "";
      modalBackdrop.classList.add("open");

      const cleanup = (value) => {
        modalBackdrop.classList.remove("open");
        modalOk.onclick = null;
        modalCancel.onclick = null;
        modalBackdrop.onclick = null;
        field.onkeydown = null;
        resolve(value);
      };

      modalOk.onclick = () => cleanup((field.value || "").trim());
      modalCancel.onclick = () => cleanup(null);
      modalBackdrop.onclick = (e) => { if (e.target === modalBackdrop) cleanup(null); };
      field.onkeydown = (e) => {
        if (e.key === "Escape") cleanup(null);
        if (!multiline && e.key === "Enter") { e.preventDefault(); cleanup((field.value || "").trim()); }
        if (multiline && (e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); cleanup((field.value || "").trim()); }
      };
      setTimeout(() => field.focus(), 30);
    });
  }

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
      if (tab.dataset.view === "sorular") renderSorular();
    });
  });

  /* ─────────────────── SORU REHBERİ ─────────────────── */
  const SORU_KATEGORILERI = [
    { baslik: "👤 Kişi & Personel", icon: "👤", sorular: [
      "Çağlar'ın turne listesi",
      "[İsim] turne geçmişi",
      "En çok yol katan kim?",
      "Personel profili: [İsim]",
      "Kişi yükü dengesi",
      "[İsim] rozeti",
      "Liderlik tablosu",
    ]},
    { baslik: "🎭 Oyun & Kadro", icon: "🎭", sorular: [
      "Kaçaklar turneleri",
      "Kaçaklar turnesini anlat",
      "Kaçaklar ve Hamlet ortak kimler?",
      "Kaçaklar kadro önerisi",
      "Kadro ısı haritası",
      "Kadro eksik turneler",
      "Çakışan kadro var mı?",
    ]},
    { baslik: "🏙 Şehir & Otel", icon: "🏙", sorular: [
      "Ankara turneleri",
      "Ankara oteli telefonu",
      "Ankara otel geçmişi",
      "Hangi şehirlere gittik?",
      "Şehir rekoru",
      "Sahne haritası",
    ]},
    { baslik: "📅 Tarih & Takvim", icon: "📅", sorular: [
      "Bugün ne var?",
      "Bu hafta",
      "Nisan 2026 turneleri",
      "Bir sonraki turne ne zaman?",
      "30 günlük özet",
      "Sezon finali sayacı",
      "Bugün tarihte",
    ]},
    { baslik: "📊 İstatistik & Rapor", icon: "📊", sorular: [
      "İstatistik özeti",
      "Mart 2026 raporu",
      "Turne karşılaştır",
      "Turne skorkartı",
      "Hangi mevsimde çok turne var?",
    ]},
    { baslik: "🛠 Operasyon", icon: "🛠", sorular: [
      "Sabah brifingi",
      "Hatırlatıcı öner",
      "Ankara turnesi kontrol listesi",
      "Eksik bilgili turneler",
      "Kaçaklar kadrosunu WhatsApp'a gönder",
    ]},
    { baslik: "🌤 Hava & Yemek", icon: "🌤", sorular: [
      "Ankara hava durumu",
      "Trabzon yemek",
      "Nerede ne yenir?",
    ]},
    { baslik: "🎲 Eğlence", icon: "🎲", sorular: [
      "Beni şaşırt",
      "Motivasyon ver",
      "Bingo oyna",
      "Şanslı turne",
      "Rastgele turne",
      "Yazı mı tura mı?",
      "Zar at",
      "Bir şaka anlat",
    ]},
  ];

  // Soru rehberinde placeholder içeren soruları çözmek için yardımcı
  async function _placeholderResolve(q) {
    if (!/\[.*?\]/.test(q)) return q;
    // Kişi adı placeholder'ları için listeden seç
    if (/\[İsim\]|\[Kişi\]|\[Personel\]/.test(q)) {
      const ppl = new Set();
      try { (DS?.turneler || []).forEach(t => (t.katilimcilar || []).forEach(k => k.kisi && ppl.add(k.kisi))); } catch(e){}
      const ad = await openInlinePrompt({
        title: "Hangi kişi için?",
        description: `Örnek: ${[...ppl].slice(0,3).join(", ") || "Çağlar"}`,
        placeholder: "Kişi adı yazın"
      });
      if (!ad || !ad.trim()) return null;
      return q.replace(/\[İsim\]|\[Kişi\]|\[Personel\]/g, ad.trim());
    }
    if (/\[Oyun\]/.test(q)) {
      const oys = new Set();
      try { (DS?.turneler || []).forEach(t => t.oyun && oys.add(t.oyun)); } catch(e){}
      const ad = await openInlinePrompt({
        title: "Hangi oyun?",
        description: `Örnek: ${[...oys].slice(0,3).join(", ") || "Kaçaklar"}`,
        placeholder: "Oyun adı yazın"
      });
      if (!ad || !ad.trim()) return null;
      return q.replace(/\[Oyun\]/g, ad.trim());
    }
    if (/\[Şehir\]/.test(q)) {
      const ad = await openInlinePrompt({
        title: "Hangi şehir?",
        description: "Örnek: Ankara",
        placeholder: "Şehir adı yazın"
      });
      if (!ad || !ad.trim()) return null;
      return q.replace(/\[Şehir\]/g, ad.trim());
    }
    return q;
  }

  function renderSorular(filter) {
    const wrap = document.getElementById("ta-sorular-list");
    if (!wrap) return;
    const f = (filter || "").trim().toLocaleLowerCase("tr");
    let html = "";
    let toplam = 0;
    for (const kat of SORU_KATEGORILERI) {
      const list = f
        ? kat.sorular.filter(s => s.toLocaleLowerCase("tr").includes(f))
        : kat.sorular;
      if (!list.length) continue;
      toplam += list.length;
      html += `<div class="ta-sorular-cat">
        <div class="ta-sorular-cat-head"><span>${kat.icon}</span> ${kat.baslik.replace(kat.icon, "").trim()}</div>
        <div class="ta-sorular-list">${
          list.map(s => `<button type="button" class="ta-sorular-q" data-q="${s.replace(/"/g, "&quot;")}">${s}</button>`).join("")
        }</div>
      </div>`;
    }
    if (!toplam) html = `<div class="ta-sorular-empty">Aramanızla eşleşen soru bulunamadı.</div>`;
    wrap.innerHTML = html;
    wrap.querySelectorAll(".ta-sorular-q").forEach(b => {
      b.addEventListener("click", async () => {
        const q = b.getAttribute("data-q");
        const resolved = await _placeholderResolve(q);
        if (!resolved) return; // kullanıcı iptal etti
        // Sohbet sekmesine geç ve soruyu gönder
        document.querySelector('.ta-tab[data-view="chat"]')?.click();
        submit(resolved);
      });
    });
  }
  // Arama
  document.getElementById("ta-sorular-q")?.addEventListener("input", e => renderSorular(e.target.value));

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

  // Inline butonlardan sorgu tetiklemek için global yardımcı
  window.__taSubmit = (text) => { togglePanel(true); submit(text); };

  // Pano kopyalama için güvenli kayıt (büyük metinleri onclick'e gömmeden)
  window.__taCopyStore = window.__taCopyStore || {};
  window.__taCopy = (id, btn) => {
    const txt = window.__taCopyStore[id]; if (!txt) return;
    navigator.clipboard.writeText(txt).then(()=>{
      if (btn) { const o=btn.textContent; btn.textContent='✓ Kopyalandı'; setTimeout(()=>btn.textContent=o,1800); }
      try { showToast('Panoya kopyalandı'); } catch(e){}
    });
  };

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
    // Scientific notation (e.g. 5.5312e+10)
    if (/e[+-]?\d+/i.test(s)) {
      const num = String(Math.round(parseFloat(s)));
      return num.startsWith("0") ? num : (num.length === 10 ? "0" + num : num);
    }
    // Sadece rakam/+/- karakterleri içeren string
    const digits = s.replace(/[^\d+]/g, "");
    if (!digits) return s; // metin/URL ise olduğu gibi döndür
    // +90 ile başlıyorsa → 0... formatına çevir
    if (digits.startsWith("+90") && digits.length === 13) return "0" + digits.slice(3);
    if (digits.startsWith("90") && digits.length === 12) return "0" + digits.slice(2);
    return digits.startsWith("0") ? digits : (digits.length === 10 ? "0" + digits : digits);
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
      const not   = (r[iNot]  || "").trim().replace(/\[LastEdit:[^\]]*\]/gi,"").replace(/\[Festival:[^\]]*\]/gi,"").replace(/\[[A-Za-z]+:[^\]]*\]/g,"").trim();
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
  function benzersizGunSay(liste) { var aralıklar=[]; liste.forEach(function(t){ var b=parseDate(t.baslangic),e=parseDate(t.bitis)||b; if(!b)return; if(!e||e<b)e=b; aralıklar.push([b.getTime(),e.getTime()]); }); if(!aralıklar.length)return 0; aralıklar.sort(function(a,b){return a[0]-b[0];}); var birl=[aralıklar[0]]; for(var i=1;i<aralıklar.length;i++){var son=birl[birl.length-1],cur=aralıklar[i]; if(cur[0]<=son[1]+86400000){if(cur[1]>son[1])son[1]=cur[1];}else{birl.push(cur);}} return birl.reduce(function(s,r){return s+Math.round((r[1]-r[0])/86400000)+1;},0); }
  function splitCityNames(raw) {
    return String(raw || "")
      .split(/[,/;+]|\s+-\s+|\s+ve\s+/i)
      .map(s => s.trim())
      .filter(Boolean);
  }
  function addCityToSet(set, raw) {
    for (const city of splitCityNames(raw)) set.add(city);
  }
  function collectUniqueCitiesFromTour(t) {
    const cities = new Set();
    // Yarıda kesilen turnelerde sadece ana ili say (duraklar gidilmemiş olabilir)
    if ((t?.statu || "") === "yarida-kesildi") {
      addCityToSet(cities, t?.il);
      return cities;
    }
    addCityToSet(cities, t?.il);
    for (const d of t?.duraklar || []) addCityToSet(cities, d?.il);
    return cities;
  }
  function cityTurneCount(T, targetCity) {
    const hedef = norm(targetCity || "");
    let count = 0;
    for (const t of T || []) {
      if ((t.statu || "").includes("iptal")) continue;
      const cities = collectUniqueCitiesFromTour(t);
      if ([...cities].some(city => norm(city) === hedef)) count++;
    }
    return count;
  }
  function fmtTel(tel) {
    if (!tel) return null; const c=String(tel).replace(/\s/g,"");
    if (c.match(/^0?\d{10}$/)) { const d=c.startsWith("0")?c:"0"+c; return d.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/,"$1 $2 $3 $4"); }
    return tel;
  }

  /* ─────────────────── CEVAP MOTORUu ─────────────────── */
  function saatSelam() {
    const h=new Date().getHours();
    if(h>=5&&h<12) return "Günaydın";
    if(h>=12&&h<18) return "İyi günler";
    if(h>=18&&h<22) return "İyi akşamlar";
    return "İyi geceler";
  }

  const SELAMLAR_KOMIK = [
    "Sahne hazır, sen hazır mısın? 🎭",
    "Perde açılıyor! Nasıl yardımcı olabilirim? 🎬",
    "Tiyatro dünyasının en zeki asistanı hizmetinde! (Mütevaziyim tabii ki 😄)",
    "Bugün kaç şehir, kaç turne? Hepsini biliyorum! 🗺️",
    "Hem sahne arkası hem ön sahne bilgisi bende! 💡",
    "Müzik çal, perde aç — Turne Asistanı burada! 🎶",
    "İzmir'den dünyaya açılan sahne — merhaba! 🌍",
  ];

  /* ════════════════════════════════════════════════════════════════
     TURNE ASİSTANI v5.0 — GENİŞLETME PAKETİ
     WhatsApp · Hatırlatıcı · Çakışma · Harcırah · Rapor · Karne
     Rozet · Streak · Doğum günü · Bingo · Yemek · Brifing · ...
     ═══════════════════════════════════════════════════════════════ */

  // Şehirlerarası kabaca km tablosu (İzmir merkezli — yaklaşık değerler)
  const _MESAFE_IZMIR = {
    "ankara":580,"istanbul":480,"bursa":325,"antalya":445,"konya":545,
    "adana":900,"gaziantep":1100,"diyarbakir":1350,"trabzon":1400,
    "samsun":1050,"erzurum":1500,"van":1700,"mardin":1450,"sanliurfa":1200,
    "kayseri":750,"mersin":850,"hatay":1050,"mugla":220,"denizli":230,
    "aydin":120,"manisa":35,"balikesir":270,"canakkale":420,"eskisehir":420,
    "kocaeli":520,"sakarya":560,"zonguldak":770,"bolu":670,"kastamonu":1000,
    "corum":920,"sivas":920,"malatya":1100,"elazig":1200,"bingol":1350,
    "rize":1450,"giresun":1300,"ordu":1200,"tokat":1000,"amasya":1050,
    "yozgat":800,"kirsehir":700,"nevsehir":700,"nigde":750,"karaman":600,
    "afyon":330,"usak":270,"isparta":420,"burdur":380,"kutahya":340,
    "edirne":620,"tekirdag":540,"kirklareli":650,"yalova":480,"duzce":620,
    "karabuk":900,"sinop":1100,"bartin":850,"agri":1600,"ardahan":1700,
    "kars":1650,"igdir":1700,"hakkari":1800,"siirt":1500,"sirnak":1550,
    "batman":1400,"bitlis":1550,"mus":1500,"tunceli":1250,"erzincan":1300,
    "gumushane":1350,"bayburt":1400,"adiyaman":1150,"kilis":1150,
    "osmaniye":950,"kahramanmaras":1000,"sakarya":560,"kirikkale":680,
    "aksaray":680,"karaman":600
  };

  // Şehirlere göre yemek önerileri
  const _YEMEK = {
    "trabzon":["Kalkanoğlu Pilavı","Akçaabat Köftesi","Hamsi tava","Kuymak"],
    "gaziantep":["Antep Baklavası","İmam Bayıldı","Lahmacun","Beyran"],
    "adana":["Adana Kebap","Şalgam","Bici Bici","Analı Kızlı"],
    "hatay":["Künefe","Tepsi Kebabı","Humus","Oruk"],
    "konya":["Etli Ekmek","Fırın Kebabı","Mevlana Şekeri","Tirit"],
    "bursa":["İskender","Kestane Şekeri","İnegöl Köfte","Cantık"],
    "edirne":["Tava Ciğer","Badem Ezmesi","Deva-i Misk"],
    "samsun":["Pide","Bafra Pidesi","Nokul"],
    "rize":["Muhlama","Laz Böreği","Hamsili Pilav"],
    "kayseri":["Mantı","Pastırma","Sucuk","Yağlama"],
    "izmir":["Boyoz","Kumru","İzmir Köfte","Gevrek"],
    "istanbul":["Balık Ekmek","Lahmacun","Kokoreç","Midye Dolma"],
    "ankara":["Beypazarı Kurusu","Çubuk Turşusu","Ankara Tava"],
    "diyarbakir":["Çiğ Köfte","Kaburga Dolması","Meftune","Lebeni"],
    "sanliurfa":["Çiğköfte","Lahmacun","Şıllık Tatlısı","Borani"],
    "mardin":["İkbebet","Kibe","Sembusek","Cevizli Sucuk"],
    "antalya":["Piyaz","Şiş Köfte","Tahinli Piyaz","Hibeş"],
    "mugla":["Çullama","Tarhana","Köfter Tatlısı","Arap Kadayıfı"],
    "canakkale":["Peynir Helvası","Kuzu Tandır","Sardalya"],
    "balikesir":["Höşmerim","Susam Helvası","Kuzu Tandır","Manda Yoğurdu"]
  };

  // Tiyatro/sahne disiplini özlü sözleri (ek havuz)
  const _SAHNE_SOZLERI = [
    "Sahne, ışığa âşık olduğun yerdir. 🎭",
    "Perde açıldığında dünya değişir.",
    "Bir oyuncu, bin hayat yaşar.",
    "Sahnede yalan söyleyemezsin — seyirci hep anlar.",
    "Tiyatro, hayatın aynası değil; hayat tiyatronun aynasıdır.",
    "İyi bir oyuncu rolünü oynamaz; rolü yaşar.",
    "Sahne korkusu yoktur, sadece hazırlıksızlık vardır.",
    "Suflör gerekiyorsa, prova eksik demektir.",
    "Provada güldürmeyen replik, sahnede de güldürmez.",
    "En zor rol: kendin olmak."
  ];

  function _gunFark(d) { return Math.floor((d - new Date()) / 86400000); }
  function _bugun() { const d=new Date(); d.setHours(0,0,0,0); return d; }
  function _yaklasan(T, gun=60) {
    const now=_bugun();
    return T.filter(t=>{const d=parseDate(t.baslangic); return d && d>=now && (d-now)/86400000<=gun;})
            .sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0));
  }
  function _gecmis(T, gun=365) {
    const now=_bugun();
    return T.filter(t=>{const d=parseDate(t.bitis||t.baslangic); return d && d<now && (now-d)/86400000<=gun;});
  }
  function _addRem(turne, gunOnce) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const d = parseDate(turne.baslangic); if (!d) return false;
      const hatirlatma = new Date(d.getTime() - gunOnce*86400000);
      const tarihStr = hatirlatma.toISOString().slice(0,10);
      // Aynı turne + gün kombinasyonu zaten varsa tekrar ekleme
      const zatenVar = arr.some(r => r.turne === turne.oyun && r.date === tarihStr && !r.done);
      if (zatenVar) return "var";
      arr.push({
        id: Date.now()+"-"+Math.random().toString(36).slice(2,7),
        text: `${gunOnce} gün kala: ${turne.oyun}`,
        date: tarihStr,
        saat: "09:00",
        type: "turne",
        turne: turne.oyun,
        not: `${turne.oyun} — ${turne.il||""} (${fmtTarih(turne.baslangic)})`,
        done: false,
        created: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      return true;
    } catch(e) { return false; }
  }

  // Çakışma bulucu — kişi bazlı
  function _cakismaBul(T) {
    const out=[];
    for (let i=0;i<T.length;i++) {
      for (let j=i+1;j<T.length;j++) {
        const a=T[i], b=T[j];
        const aB=parseDate(a.baslangic), aE=parseDate(a.bitis)||aB;
        const bB=parseDate(b.baslangic), bE=parseDate(b.bitis)||bB;
        if (!aB||!bB) continue;
        if (aE < bB || bE < aB) continue;
        if (norm(a.il||"")===norm(b.il||"") && a.oyun===b.oyun) continue;
        const ortak=a.katilimcilar.filter(p=>b.katilimcilar.some(q=>norm(q.kisi)===norm(p.kisi))).map(p=>p.kisi);
        if (ortak.length) out.push({a,b,ortak});
      }
    }
    return out;
  }

  // Genişletme dispatcher — answer() başında çağrılır
  function _taX(Q, T, F, ds, qRaw) {
    /* ── BRİFİNG / GÜNAYDIN BRİFİNG ── */
    if (/(sabah brifing|brifing modu|brifing|günlük özet|gunluk ozet)/.test(Q)) {
      const now=_bugun();
      const aktif=T.filter(t=>{const a=parseDate(t.baslangic), b=parseDate(t.bitis)||a; return a&&b&&a<=now&&b>=now;});
      const bugun7=T.filter(t=>{const d=parseDate(t.baslangic); return d&&_gunFark(d)>=0&&_gunFark(d)<=7;});
      const eksik=T.filter(t=>{const d=parseDate(t.baslangic); return d&&_gunFark(d)>=0&&_gunFark(d)<=14&&(!t.otelAdi||!t.gidisUlasim);});
      let o=`☀️ **Sabah Brifingi — ${fmtTarih(now.toISOString().slice(0,10))}**\n\n`;
      o+=`🎭 **Aktif turne:** ${aktif.length}\n`;
      if (aktif.length) for (const t of aktif) o+=`  • ${esc(t.oyun)} · 📍 ${esc(t.il||"—")} (${t.katilimcilar.length} kişi)\n`;
      o+=`\n📅 **Önümüzdeki 7 gün:** ${bugun7.length} turne\n`;
      for (const t of bugun7.slice(0,5)) o+=`  • ${fmtTarih(t.baslangic)} — ${esc(t.oyun)} · ${esc(t.il||"—")}\n`;
      if (eksik.length) o+=`\n⚠️ **Eksik bilgili (14 gün içinde):** ${eksik.length} turne\n`;
      const sz=_SAHNE_SOZLERI[Math.floor(Math.random()*_SAHNE_SOZLERI.length)];
      o+=`\n💭 _${sz}_`;
      // Yaklaşan turneler varsa hatırlatıcı öner butonu ekle
      const ykBrif=_yaklasan(T,30);
      if(ykBrif.length) o+=`\n\n<button class="ta-inline-copy" onclick="window.__taSubmit('hatırlatıcı öner')" style="border-color:#E0A030;color:#8A6010">🔔 Hatırlatıcı Öner</button>`;
      return {html:o};
    }

    /* ── WHATSAPP KADRO ŞABLONU — gelişmiş ── */
    const wpOyun=findOyun(Q,T);
    if (wpOyun && /(mesaj olarak|whatsapp|wp|mesaj hazırla|mesaj hazirla|kadro mesaj)/.test(Q)) {
      const list=T.filter(t=>norm(t.oyun)===norm(wpOyun)).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0));
      const t=list[0];
      if (!t) return null;
      const kadro=t.katilimcilar.map(p=>`• ${p.kisi}${p.gorev?" ("+p.gorev+")":""}`).join("\n");
      const tarihStr=fmtTarihAralik(t.baslangic,t.bitis);
      let msg=`🎭 *${t.oyun}* — TURNE BİLGİLENDİRME\n`;
      msg+=`📅 *Tarih:* ${tarihStr}\n`;
      msg+=`📍 *Şehir:* ${t.il||"—"}${t.mekan?" · "+t.mekan:""}\n`;
      if (t.gidisSaat||t.gidisUlasim) msg+=`🚌 *Gidiş:* ${t.gidisUlasim||""}${t.gidisSaat?" · "+t.gidisSaat:""}\n`;
      if (t.donusSaat||t.donusUlasim) msg+=`🔙 *Dönüş:* ${t.donusUlasim||""}${t.donusSaat?" · "+t.donusSaat:""}\n`;
      if (t.otelAdi) {
        msg+=`\n🏨 *Otel:* ${t.otelAdi}\n`;
        if (t.otelAdres) msg+=`📌 *Adres:* ${t.otelAdres}\n`;
        // Tel: ana kayıt boşsa duraktan da bak, regex'i gevşet (5+ rakam)
        const _wTel = t.otelTel || parseDurakOteller(t.duraklar).find(d=>d.otelAdi===t.otelAdi&&d.otelTel)?.otelTel || "";
        msg+=`☎️ *Tel:* ${_wTel&&/\d{5,}/.test(String(_wTel).replace(/\D/g,""))?(fmtTel(_wTel)||_wTel):"—"}\n`;
      }
      msg+=`\n👥 *Kadro (${t.katilimcilar.length} kişi):*\n${kadro}\n`;
      if (t.not) msg+=`\n📝 *Not:* ${t.not}\n`;
      msg+=`\nİyi turneler! 🎬`;
      const wpUrl=`https://wa.me/?text=${encodeURIComponent(msg)}`;
      const _cid = "wa_"+Date.now()+"_"+Math.floor(Math.random()*1e6);
      window.__taCopyStore[_cid] = msg;
      const html=`✅ **${esc(t.oyun)}** için WhatsApp şablonu hazır:\n\n<div style="background:#fff;border:1px solid #E8E2D7;border-radius:10px;padding:12px;font-size:12px;white-space:pre-wrap;font-family:'DM Mono',monospace;max-height:280px;overflow:auto">${esc(msg)}</div>\n\n<button class="ta-inline-aktar" onclick="window.__taCopy('${_cid}',this)">📋 Kopyala</button> <a class="ta-inline-aktar" target="_blank" href="${wpUrl}" style="text-decoration:none;">📲 WhatsApp'ta Aç</a>`;
      return {html};
    }

    /* ── HATIRLATICI ÖNERİLERİ — 7/3/1 gün ── */
    if (/(hatırlatıcı öner|hatirlatici oner|hatırlatma öner|7 gün kala|3 gün kala|otomatik hatırlatıcı)/.test(Q)) {
      const yk=_yaklasan(T,90);
      if (!yk.length) return "📭 Yaklaşan turne yok, önerilecek hatırlatıcı bulunamadı.";
      let o=`⏰ **Yaklaşan Turneler için Hatırlatıcı Önerileri**\n\n`;
      for (const t of yk.slice(0,6)) {
        const k=_gunFark(parseDate(t.baslangic));
        o+=`🎭 **${esc(t.oyun)}** — ${fmtTarih(t.baslangic)} · ${esc(t.il||"—")} (${k} gün kaldı)\n`;
        for (const g of [7,3,1]) {
          if (k>=g) {
            const safe=(t.oyun+"|"+t.baslangic).replace(/'/g,"\\'");
            o+=`  <button class="ta-inline-copy" onclick="window.__taRem('${safe}',${g})">+ ${g} gün kala</button>`;
          }
        }
        o+=`\n\n`;
      }
      o+=`<div style="font-size:11px;color:#8A857C;margin-top:4px;">💡 Butona basıldığında Hatırlatıcı sekmesine otomatik eklenir.</div>`;
      return {html:o};
    }

    /* ── ÇAKIŞMA DEDEKTÖRÜ ── */
    if (/(çakışma|cakisma|çakışan kadro|cakisan kadro|kim nerede çakış|aynı tarihte)/.test(Q)) {
      const ck=_cakismaBul(T);
      if (!ck.length) return "✅ **Hiç kadro çakışması yok!** Tüm turneler temiz.";
      let o=`🚨 **${ck.length} çakışma tespit edildi:**\n\n`;
      for (const c of ck.slice(0,12)) {
        o+=`⚠️ **${c.ortak.join(", ")}**\n`;
        o+=`  • ${esc(c.a.oyun)} — ${esc(c.a.il||"—")} (${fmtTarihAralik(c.a.baslangic,c.a.bitis)})\n`;
        o+=`  • ${esc(c.b.oyun)} — ${esc(c.b.il||"—")} (${fmtTarihAralik(c.b.baslangic,c.b.bitis)})\n\n`;
      }
      return {html:o};
    }

    /* ── HIZLI ARAMA PANELİ ── */
    if (/(hızlı arama|hizli arama|telefon paneli|acil iletişim|acil iletisim|arama paneli)/.test(Q)) {
      const list=(F||[]).slice(0,20);
      if (!list.length) return "📞 Firma rehberi boş.";
      let o=`📞 **Hızlı Arama Paneli**\n\n`;
      for (const f of list) {
        if (!f.tel) continue;
        o+=`<a class="ta-phone" href="tel:${f.tel}">☎️ ${esc(f.ad)} (${esc(f.kategori||"")}) — ${fmtTel(f.tel)||f.tel}</a>\n`;
      }
      return {html:o};
    }

    /* ── MESAFE / SÜRE HESABI ── */
    const mes=Q.match(/(?:izmir[a-z]*\s*[-→>]*\s*|izmir'dan\s+)?([a-zçğıöşü]+)\s*(?:kaç saat|kac saat|ne kadar sürer|mesafe)/);
    if (mes) {
      const sehir=mes[1].replace(/'.*$/,"").trim();
      const key=norm(sehir).replace(/[^a-z]/g,"");
      const km=_MESAFE_IZMIR[key];
      if (km) {
        const ucak=Math.max(1, Math.round(km/700*10)/10);
        const otobus=Math.round(km/70*10)/10;
        const oneri = km<300?"🚗 Karayolu kısa, otobüs/araç pratik.":km<700?"🚌 Otobüs makul, uçak hızlı.":"✈️ Uzun mesafe — uçak şiddetle önerilir.";
        return {html:`📍 **İzmir → ${esc(sehir.charAt(0).toUpperCase()+sehir.slice(1))}**\n\n📏 Mesafe: **~${km} km**\n✈️ Uçak: ~${ucak} saat\n🚌 Otobüs: ~${otobus} saat\n\n${oneri}`};
      }
    }

    /* ── HARCIRAH HESAPLAYICI ── */
    const hr=Q.match(/(.+?)\s*(?:turnesi)?\s*harcırah/);
    if (hr || /harcırah hesap|harcirah hesap/.test(Q)) {
      const ad=hr?hr[1].replace(/turnesi/g,"").trim():null;
      let t=null;
      if (ad) {
        const o=findOyun(Q,T);
        if (o) { const l=T.filter(x=>norm(x.oyun)===norm(o)).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0)); t=l[0]; }
      }
      const oran=(()=>{ try{return +(localStorage.getItem("ta_harcirah_oran")||500);}catch{return 500;} })();
      if (t) {
        const g=turneGun(t), k=t.katilimcilar.length;
        const top=g*k*oran;
        return {html:`💰 **Harcırah Hesabı — ${esc(t.oyun)}**\n\n• Gün sayısı: **${g}**\n• Kişi sayısı: **${k}**\n• Günlük oran: **${oran.toLocaleString("tr")} ₺**\n\n**TOPLAM: ${top.toLocaleString("tr")} ₺**\n\n<span style="font-size:11px;color:#8A857C">Oranı değiştirmek için: <code>harcırah oranı 750</code></span>`};
      }
      const orMatch=Q.match(/harcırah\s+oran[ıi]?\s*(\d+)/);
      if (orMatch) { try{localStorage.setItem("ta_harcirah_oran", orMatch[1]);}catch{}; return `✅ Harcırah oranı **${orMatch[1]} ₺** olarak kaydedildi.`; }
      return `💰 Hangi turnenin harcırahını hesaplayayım?\nÖrnek: *"Kaçaklar turnesi harcırah hesapla"*\n\nGünlük oran: **${oran} ₺** (değiştirmek için: \`harcırah oranı 750\`)`;
    }

    /* ── EKSİK BİLGİ TESPİTİ ── */
    if (/(eksik|otel bilgisi.*eksik|ulaşım.*eksik|ulasim.*eksik|otel girilm|ulaşım girilm|ulasim girilm|otel yok|ulaşım yok|ulasim yok)/.test(Q)) {
      const otelEksik=T.filter(t=>{const d=parseDate(t.baslangic); return d&&_gunFark(d)>=-7&&_gunFark(d)<=60&&!t.otelAdi;});
      const ulasimEksik=T.filter(t=>{const d=parseDate(t.baslangic); return d&&_gunFark(d)>=-7&&_gunFark(d)<=60&&!t.gidisUlasim;});
      let o=`🔍 **Eksik Bilgi Raporu** (önümüzdeki 60 gün)\n\n`;
      o+=`🏨 **Otel bilgisi eksik (${otelEksik.length}):**\n`;
      if (!otelEksik.length) o+="  ✅ Hepsi tamam!\n";
      for (const t of otelEksik.slice(0,8)) o+=`  • ${esc(t.oyun)} — ${esc(t.il||"—")} (${fmtTarih(t.baslangic)})\n`;
      o+=`\n🚌 **Ulaşım eksik (${ulasimEksik.length}):**\n`;
      if (!ulasimEksik.length) o+="  ✅ Hepsi tamam!\n";
      for (const t of ulasimEksik.slice(0,8)) o+=`  • ${esc(t.oyun)} — ${esc(t.il||"—")} (${fmtTarih(t.baslangic)})\n`;
      return {html:o};
    }

    /* ── KİŞİ YÜKÜ DENGESİ ── */
    if (/(kişi yükü|kisi yuku|yorgun|yoğunluk|yogunluk|kim çok turne|en çok turne|dinlenme öner|dinlenme oner|iş yükü|is yuku)/.test(Q)) {
      const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-30);
      const m=new Map();
      for (const t of T) {
        const d=parseDate(t.baslangic); if(!d||d<cutoff) continue;
        for (const p of t.katilimcilar) m.set(p.kisi,(m.get(p.kisi)||0)+1);
      }
      const arr=[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
      if (!arr.length) return "Son 30 günde turne kaydı bulunamadı.";
      let o=`⚖️ **Kişi Yükü Dengesi — Son 30 gün**\n\n`;
      for (const [kisi,n] of arr) {
        const uyari=n>=8?"🚨 *Dinlenme öner!*":n>=5?"⚠️ *Yoğun*":"";
        o+=`• **${esc(kisi)}** — ${n} turne ${uyari}\n`;
      }
      return {html:o};
    }

    /* ── AYLIK YÖNETİCİ RAPORU ── */
    const ayMatch=Q.match(/(\w+)\s+(20\d{2})\s+(rapor|raporu)/);
    if (ayMatch || /yönetici rapor|yonetici rapor/.test(Q)) {
      let yil=new Date().getFullYear(), ay=new Date().getMonth();
      if (ayMatch) {
        const ai=AY_NORM.findIndex(m=>m===norm(ayMatch[1]));
        if (ai>=0) ay=ai;
        yil=+ayMatch[2];
      }
      const list=T.filter(t=>{const d=parseDate(t.baslangic); return d&&d.getFullYear()===yil&&d.getMonth()===ay;});
      if (!list.length) return `📊 ${AYLAR[ay]} ${yil} ayında turne bulunamadı.`;
      const temsil=list.reduce((s,t)=>s+(t.sayi||0),0);
      const gun=list.reduce((s,t)=>s+turneGun(t),0);
      const sehirler=[...new Set(list.map(t=>t.il).filter(Boolean))];
      const kisiler=new Set();
      list.forEach(t=>t.katilimcilar.forEach(p=>kisiler.add(p.kisi)));
      const oran=(()=>{ try{return +(localStorage.getItem("ta_harcirah_oran")||500);}catch{return 500;} })();
      const tahminiHarcirah=list.reduce((s,t)=>s+turneGun(t)*t.katilimcilar.length*oran,0);
      let o=`📊 **${AYLAR[ay]} ${yil} — Yönetici Raporu**\n\n`;
      o+=`🎭 Turne sayısı: **${list.length}**\n`;
      o+=`🎫 Temsil sayısı: **${temsil}**\n`;
      o+=`📅 Toplam gün: **${gun}**\n`;
      o+=`📍 Şehir sayısı: **${sehirler.length}** (${sehirler.slice(0,8).join(", ")}${sehirler.length>8?"…":""})\n`;
      o+=`👥 Görev alan kişi: **${kisiler.size}**\n`;
      o+=`💰 Tahmini harcırah: **${tahminiHarcirah.toLocaleString("tr")} ₺**\n\n`;
      o+=`**Turneler:**\n`;
      for (const t of list.sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0))) {
        o+=`• ${fmtTarih(t.baslangic)} — ${esc(t.oyun)} · ${esc(t.il||"—")} (${t.katilimcilar.length} kişi)\n`;
      }
      o+=`\n<button class="ta-inline-copy" onclick="window.print()">🖨️ Yazdır / PDF Al</button>`;
      return {html:o};
    }

    /* ── PERSONEL KARNESİ ── */
    if (/(karne|karnes|personel karne|profil)/.test(Q)) {
      const kisi=findPerson(Q,T);
      if (!kisi) return null;
      const list=T.filter(t=>t.katilimcilar.some(p=>norm(p.kisi)===norm(kisi)));
      if (!list.length) return null;
      const yil=new Date().getFullYear();
      const buYil=list.filter(t=>{const d=parseDate(t.baslangic); return d&&d.getFullYear()===yil;});
      const sehirler=[...new Set(list.map(t=>t.il).filter(Boolean))];
      const oyunlar=[...new Set(list.map(t=>t.oyun))];
      const gun=list.reduce((s,t)=>s+turneGun(t),0);
      const rozetler=[];
      if (list.length>=10) rozetler.push("🏅 10+ Turne Veterani");
      if (list.length>=25) rozetler.push("🌟 Turne Efsanesi");
      if (sehirler.length>=5) rozetler.push("🗺️ 5 Şehir Kaşifi");
      if (sehirler.length>=15) rozetler.push("🌍 Anadolu Gezgini");
      if (list.some(t=>/uçak|ucak|tayyare/i.test(t.gidisUlasim||""))) rozetler.push("✈️ Uçak Yolcusu");
      if (oyunlar.length>=3) rozetler.push("🎭 Çok Yönlü Sanatçı");
      if (gun>=100) rozetler.push("📅 100+ Gün Sahnede");
      let o=`🏆 **${esc(kisi)} — Personel Karnesi**\n\n`;
      o+=`📊 **Toplam:** ${list.length} turne · ${gun} gün · ${sehirler.length} şehir · ${oyunlar.length} oyun\n`;
      o+=`📅 **${yil}:** ${buYil.length} turne\n\n`;
      if (rozetler.length) { o+=`**Rozetler:**\n`; for (const r of rozetler) o+=`  ${r}\n`; o+="\n"; }
      o+=`**Oynadığı oyunlar:** ${oyunlar.slice(0,8).map(esc).join(", ")}${oyunlar.length>8?"…":""}\n`;
      o+=`**Gittiği şehirler:** ${sehirler.slice(0,10).map(esc).join(", ")}${sehirler.length>10?"…":""}`;
      return {html:o};
    }

    /* ── SAHNE HARİTASI (basit ısı listesi) ── */
    if (/(sahne haritası|sahne haritasi|şehir haritası|sehir haritasi|gidilen şehir|gidilen sehir)/.test(Q)) {
      const sayim=new Map();
      const _aktifT=T.filter(t=>!t.statu.includes("iptal"));
      for (const t of _aktifT) {
        for (const city of collectUniqueCitiesFromTour(t)) {
          sayim.set(city,(sayim.get(city)||0)+1);
        }
      }
      const arr=[...sayim.entries()].sort((a,b)=>b[1]-a[1]);
      if (!arr.length) return "Henüz şehir verisi yok.";
      const max=arr[0][1];
      let o=`🗺️ **Türkiye Sahne Haritası — Şehir Yoğunluğu**\n\n`;
      for (const [s,n] of arr.slice(0,20)) {
        const lvl=Math.round(n/max*10);
        const bar="🟥".repeat(Math.max(1,Math.round(lvl/2)))+"⬜".repeat(Math.max(0,5-Math.round(lvl/2)));
        o+=`${bar} **${esc(s)}** — ${n} turne\n`;
      }
      o+=`\n**Toplam şehir:** ${arr.length}`;
      return {html:o};
    }

    /* ── TREND TESPİTİ ── */
    if (/(trend|geçen yıla|gecen yila|büyüme|buyume|artış|artis|kıyasla|kiyasla)/.test(Q)) {
      const buYil=new Date().getFullYear();
      const a=T.filter(t=>{const d=parseDate(t.baslangic); return d&&d.getFullYear()===buYil;});
      const g=T.filter(t=>{const d=parseDate(t.baslangic); return d&&d.getFullYear()===buYil-1;});
      if (!g.length) return `📈 Geçen yıl için karşılaştırma verisi yok. Bu yıl: ${a.length} turne.`;
      const oran=((a.length-g.length)/g.length*100).toFixed(1);
      const yon=a.length>g.length?"📈 artış":"📉 düşüş";
      const sBu=new Map(), sGec=new Map();
      a.forEach(t=>t.il&&sBu.set(t.il,(sBu.get(t.il)||0)+1));
      g.forEach(t=>t.il&&sGec.set(t.il,(sGec.get(t.il)||0)+1));
      let enBuyuyen=null, enBFark=-Infinity;
      for (const [s,n] of sBu) { const f=n-(sGec.get(s)||0); if (f>enBFark) { enBFark=f; enBuyuyen=s; } }
      return {html:`📊 **Trend Tespiti**\n\n${buYil}: **${a.length}** turne\n${buYil-1}: **${g.length}** turne\n\n${yon}: **%${Math.abs(oran)}**\n${enBuyuyen?`🏙️ En çok büyüyen şehir: **${esc(enBuyuyen)}** (+${enBFark})`:""}`};
    }

    /* ── BUGÜN TARİHTE ── */
    if (/(bugün tarihte|bugun tarihte|geçen yıl bugün|gecen yil bugun|yıllar önce|yillar once|nostalji)/.test(Q)) {
      const t=new Date();
      const m=t.getMonth(), d=t.getDate();
      const past=T.filter(x=>{const dt=parseDate(x.baslangic); return dt && dt.getMonth()===m && dt.getDate()===d && dt.getFullYear()<t.getFullYear();})
                  .sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0));
      if (!past.length) return "🕰️ Bugünün tarihinde geçmiş turne kaydı yok.";
      let o=`🕰️ **Bugün Tarihte**\n\n`;
      for (const x of past.slice(0,5)) {
        const yil=parseDate(x.baslangic).getFullYear();
        const fark=t.getFullYear()-yil;
        o+=`📌 **${fark} yıl önce bugün** — *${esc(x.oyun)}* ${esc(x.il||"")} sahnesindeydi.\n`;
      }
      return {html:o};
    }

    /* ── ŞANSLI TURNE ── */
    if (/(şanslı turne|sansli turne|rastgele turne|güzel anı|guzel ani|nostaljik turne)/.test(Q)) {
      const tamamlanan=T.filter(t=>t.statu.includes("tamamlan"));
      if (!tamamlanan.length) return "🍀 Henüz tamamlanmış turne yok.";
      const t=tamamlanan[Math.floor(Math.random()*tamamlanan.length)];
      return {html:`🍀 **Şanslı Turne**\n\n🎭 **${esc(t.oyun)}**\n📅 ${fmtTarihAralik(t.baslangic,t.bitis)}\n📍 ${esc(t.il||"—")}${t.mekan?" · "+esc(t.mekan):""}\n👥 ${t.katilimcilar.length} kişi · 🎫 ${t.sayi||1} temsil\n\n${t.not?"📝 "+esc(t.not):"İyi anılar! ✨"}`};
    }

    /* ── REPERTUVAR DJ ── */
    if (/(repertuvar dj|repertuvar|hangi oyunu izle|oyun öner|oyun oner|bugün ne izle|bugun ne izle)/.test(Q)) {
      const oyunlar=[...new Set(T.map(t=>t.oyun))];
      if (!oyunlar.length) return "🎭 Repertuvar boş.";
      const o=oyunlar[Math.floor(Math.random()*oyunlar.length)];
      const kayit=T.filter(x=>x.oyun===o);
      const sehir=[...new Set(kayit.map(x=>x.il).filter(Boolean))];
      return {html:`🎤 **Repertuvar DJ önerisi:**\n\n🎭 **${esc(o)}**\n\n📊 ${kayit.length} turne · ${sehir.length} şehir\n📍 En son: ${esc(kayit[0].il||"—")} (${fmtTarih(kayit[0].baslangic)})\n\n_${_SAHNE_SOZLERI[Math.floor(Math.random()*_SAHNE_SOZLERI.length)]}_`};
    }

    /* ── STREAK SAYACI ── */
    if (/(streak|sahne boş|sahne bos|kaç gün sahne|kac gun sahne|boş gün rekor|bos gun rekor)/.test(Q)) {
      const sorted=[...T].sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0));
      const now=_bugun();
      let aktif=0;
      for (let i=sorted.length-1;i>=0;i--) {
        const b=parseDate(sorted[i].bitis||sorted[i].baslangic); if(!b) continue;
        if (b<now) { aktif=Math.floor((now-b)/86400000); break; }
      }
      const buYil=T.filter(t=>{const d=parseDate(t.baslangic); return d&&d.getFullYear()===now.getFullYear();}).length;
      return {html:`🔥 **Streak Sayacı**\n\nSahne **${aktif} gündür** boş ${aktif<3?"(çok aktif! 🎬)":aktif<14?"(normal)":"(yakında yeni turne lazım!)"}\n\nBu yıl: **${buYil} turne**`};
    }

    /* ── BUGÜN DOĞUM GÜNÜ — kadrolardan tahmin (veri yoksa boş) ── */
    if (/(doğum günü|dogum gunu|bugün doğum|bugun dogum)/.test(Q)) {
      return "🎂 Doğum günü verisi henüz sisteme eklenmemiş. Kadro bilgilerine doğum tarihi alanı ekleyin, otomatik takip edebilirim.";
    }

    /* ── BİNGO MİNİ OYUN — 5 farklı soru tipi ── */
    if (/(bingo|mini oyun|kim hangi şehirde|kim hangi sehirde)/.test(Q)) {
      const now=_bugun();
      const aktif=T.filter(t=>{const a=parseDate(t.baslangic), b=parseDate(t.bitis)||a; return a&&b&&a<=now&&b>=now;});
      const pool=aktif.length?aktif:_yaklasan(T,60);
      const tumTurneler=T.filter(t=>!t.statu.includes("iptal"));
      if (!pool.length && !tumTurneler.length) return "🎲 Bingo için yeterli turne yok.";
      const geniPool = pool.length ? pool : tumTurneler;
      const valid = geniPool.filter(t => t.katilimcilar && t.katilimcilar.length >= 2 && t.il);
      if (!valid.length) return "🎲 Bingo için kadro bilgisi olan turne bulunamadı.";

      const tumSehirler = [...new Set(tumTurneler.flatMap(t => [...collectUniqueCitiesFromTour(t)]).filter(Boolean))];
      const tumOyunlar = [...new Set(tumTurneler.map(t=>t.oyun).filter(Boolean))];
      const tumKisiler = [...new Set(tumTurneler.flatMap(t=>t.katilimcilar.map(k=>k.kisi)).filter(Boolean))];

      // Rastgele soru tipini seç (0–4)
      let lastBingoTip = parseInt(sessionStorage.getItem("ta_last_bingo_tip") || "-1");
      let tip; do { tip = Math.floor(Math.random()*5); } while(tip===lastBingoTip);
      sessionStorage.setItem("ta_last_bingo_tip", tip);

      const turne = valid[Math.floor(Math.random() * valid.length)];
      let soru = "", dogru = "", secenekler = [], ipucu = "", badge = "";

      if (tip === 0) {
        // Tip 0: Bu kişi hangi şehirde?
        const kisi = turne.katilimcilar[Math.floor(Math.random()*turne.katilimcilar.length)].kisi;
        const turneCities = [...collectUniqueCitiesFromTour(turne)];
        dogru = turneCities[Math.floor(Math.random()*turneCities.length)] || turne.il;
        const digerler = tumSehirler.filter(s=>s&&s!==dogru).sort(()=>Math.random()-.5).slice(0,3);
        secenekler = [dogru,...digerler].sort(()=>Math.random()-.5);
        soru = `**${esc(kisi)}** bu turnede hangi şehir ayağına gidiyor?`;
        ipucu = "Aynı turnenin şehirlerinden biri 😉";
        badge = "🏙";
        window.__taBingo = { dogru, kisi };

      } else if (tip === 1) {
        // Tip 1: Bu turnenin kaç kişilik kadrosu var?
        const gercek = turne.katilimcilar.length;
        dogru = String(gercek);
        const farkliSayilar = new Set([gercek]);
        while(farkliSayilar.size < 4) { const r = gercek + Math.floor(Math.random()*6)-3; if(r>0&&r!==gercek) farkliSayilar.add(r); }
        secenekler = [...farkliSayilar].sort(()=>Math.random()-.5).map(String);
        soru = `🎭 **${esc(turne.oyun)}** turnesinde kaç kişilik kadro yer alıyor?`;
        ipucu = "Kadro listesine bakabilirsin 👀";
        badge = "👥";
        window.__taBingo = { dogru, kisi: turne.oyun };

      } else if (tip === 2) {
        // Tip 2: Bu kişi hangi oyunda?
        const kisi2 = turne.katilimcilar[Math.floor(Math.random()*turne.katilimcilar.length)].kisi;
        dogru = turne.oyun;
        const digerOyunlar = tumOyunlar.filter(o=>o!==dogru).sort(()=>Math.random()-.5).slice(0,3);
        secenekler = [dogru,...digerOyunlar].sort(()=>Math.random()-.5);
        soru = `**${esc(kisi2)}** şu anda hangi oyunun turnesinde?`;
        ipucu = "Yaklaşan/aktif turnelerden biri 🎭";
        badge = "🎭";
        window.__taBingo = { dogru, kisi: kisi2 };

      } else if (tip === 3) {
        // Tip 3: Bu turne kaç gün sürüyor?
        const gercekGun = turneGun(turne);
        dogru = String(gercekGun);
        const farkliGunler = new Set([gercekGun]);
        while(farkliGunler.size < 4) { const r = Math.max(1,gercekGun + Math.floor(Math.random()*5)-2); if(r!==gercekGun) farkliGunler.add(r); }
        secenekler = [...farkliGunler].sort(()=>Math.random()-.5).map(String);
        soru = `📅 **${esc(turne.oyun)}** (${esc(turne.il||"?")}) turnesi kaç gün sürüyor?`;
        ipucu = `${fmtTarihAralik(turne.baslangic,turne.bitis)} tarihlerine bak 📆`;
        badge = "📅";
        window.__taBingo = { dogru, kisi: turne.oyun };

      } else {
        // Tip 4: Bu kadrodan kim YOK? (yanlış kişiyi bul)
        if (turne.katilimcilar.length >= 3 && tumKisiler.length >= 4) {
          const kadroda = turne.katilimcilar.map(k=>k.kisi);
          const yabanci = tumKisiler.filter(k=>!kadroda.includes(k)).sort(()=>Math.random()-.5)[0];
          if (yabanci) {
            dogru = yabanci; // YOK olan kişi "doğru" cevap
            const ucDogruKisi = kadroda.sort(()=>Math.random()-.5).slice(0,3);
            secenekler = [dogru,...ucDogruKisi].sort(()=>Math.random()-.5);
            soru = `🕵️ Aşağıdakilerden hangisi **${esc(turne.oyun)}** turne kadrosunda **YOK**?`;
            ipucu = "Biri sahte! Kadroda olmayan ismi bul 🔍";
            badge = "🕵️";
            window.__taBingo = { dogru, kisi: turne.oyun, tip4: true };
          } else {
            // fallback → tip 0
            const kisi3 = turne.katilimcilar[0].kisi;
            const turneCities3 = [...collectUniqueCitiesFromTour(turne)];
            dogru = turneCities3[0] || turne.il;
            const digerler3 = tumSehirler.filter(s=>s&&s!==dogru).sort(()=>Math.random()-.5).slice(0,3);
            secenekler = [dogru,...digerler3].sort(()=>Math.random()-.5);
            soru = `**${esc(kisi3)}** bu turnede hangi şehir ayağına gidiyor?`;
            ipucu = "Aynı turnenin şehirlerinden biri 😉";
            badge = "🏙";
            window.__taBingo = { dogru, kisi: kisi3 };
          }
        } else {
          // fallback → tip 0
          const kisi3 = turne.katilimcilar[0].kisi;
          dogru = turne.il;
          const digerler3 = tumSehirler.filter(s=>s&&s!==dogru).sort(()=>Math.random()-.5).slice(0,3);
          secenekler = [dogru,...digerler3].sort(()=>Math.random()-.5);
          soru = `**${esc(kisi3)}** bu turnede hangi şehre gidiyor?`;
          ipucu = "Aynı turnenin şehirlerinden biri 😉";
          badge = "🏙";
          window.__taBingo = { dogru, kisi: kisi3 };
        }
      }

      let o = `🎲 **BİNGO!**\n\n${soru}\n\n`;
      for (const s of secenekler) {
        o += `<button class="ta-inline-copy" onclick="window.__taBingoCheck('${s.replace(/'/g,"\\'").replace(/"/g,"&quot;")}')">${esc(s)}</button> `;
      }
      o += `\n\n<span style="font-size:11px;color:#8A857C">İpucu: ${ipucu}</span>`;
      return { html: o };
    }

    /* ── SEZON FİNALİ SAYACI ── */
    if (/(sezon finali|sezon sonu|son turne|finalin)/.test(Q)) {
      const yk=_yaklasan(T,365);
      if (!yk.length) return "🎬 Yaklaşan turne yok.";
      const son=yk[yk.length-1];
      const fark=_gunFark(parseDate(son.baslangic));
      return {html:`🎬 **Sezon Finali Sayacı**\n\nSezonun bilinen son turnesi: **${esc(son.oyun)}** — ${esc(son.il||"—")}\n📅 ${fmtTarih(son.baslangic)}\n\n⏳ Sezon finaline **${fark} gün** kaldı!`};
    }

    /* ── YEMEK ÖNERİSİ ── */
    if (/(yemek|gastronomi|yenir|ne yenir|nerede ne yenir|lezzet)/.test(Q)) {
      // Şehir bul
      let sehir=null;
      for (const k of Object.keys(_YEMEK)) if (Q.includes(k)) { sehir=k; break; }
      if (!sehir) {
        const yk=_yaklasan(T,14);
        for (const t of yk) { const k=norm(t.il||"").replace(/[^a-z]/g,""); if (_YEMEK[k]) { sehir=k; break; } }
      }
      if (!sehir) return "🍽️ Hangi şehir için yemek önerisi istersin? Örnek: *Trabzon yemek*";
      const list=_YEMEK[sehir];
      return {html:`🍽️ **${sehir.charAt(0).toUpperCase()+sehir.slice(1)} — Yemek Önerileri**\n\n${list.map(x=>"🍴 "+x).join("\n")}\n\n_Afiyet olsun! 😋_`};
    }

    /* ── AKILLI KADRO ÖNERİSİ ── */
    const oneOyun=findOyun(Q,T);
    if (oneOyun && /(kadro öner|kadro oner|kim katılmalı|kim katilmali|akıllı öneri|akilli oneri)/.test(Q)) {
      const past=T.filter(t=>norm(t.oyun)===norm(oneOyun));
      const m=new Map();
      for (const t of past) for (const p of t.katilimcilar) m.set(p.kisi,(m.get(p.kisi)||0)+1);
      const arr=[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
      if (!arr.length) return null;
      let o=`🎯 **${esc(oneOyun)} — Akıllı Kadro Önerisi**\n\nGeçmişte en sık görev alanlar:\n\n`;
      for (const [k,n] of arr) o+=`• **${esc(k)}** — ${n} kez\n`;
      return {html:o};
    }

    return null; // hiçbir extension eşleşmedi → orijinal answer devam etsin
  }

  // Toast event listener (genişletme butonları için)
  window.addEventListener('ta-toast', e => showToast(e.detail || ""));


  function answer(q, ds) {
    // ─── v5.0 GENİŞLETME — önce extension dispatcher
    try { const __x = _taX(norm(q), ds.turneler, ds.firmalar||[], ds, q); if (__x) return __x; } catch(e) { console.warn('[taX]',e); }
    const Q = norm(q), T = ds.turneler, F = ds.firmalar||[];
    let scope = T;
    for (const [s, keys] of Object.entries(STATU_MAP)) if (keys.some(k=>Q.includes(k))) { const sk=s.split("-")[0]; scope=T.filter(t=>t.statu.startsWith(sk)||keys.some(kk=>t.statu===kk)); break; }
    const ym = Q.match(/\b(20\d{2})\b/);
    if (ym) { const y=+ym[1]; scope=scope.filter(t=>{const d=parseDate(t.baslangic);return d&&d.getFullYear()===y;}); }
    const mi = AY_NORM.findIndex(m=>Q.includes(m));
    if (mi>=0) scope=scope.filter(t=>{const d=parseDate(t.baslangic);return d&&d.getMonth()===mi;});

    /* ── SELAM / MERHABA ── */
    if (/^(selam|merhaba|hey|heyy|naber|nasılsın|nasilsin|iyi\s*günler|günaydın|iyi\s*akşam|iyi\s*geceler|sa|slm|mrb|selamlar)/.test(Q)) {
      const selam=saatSelam();
      const komik=SELAMLAR_KOMIK[Math.floor(Math.random()*SELAMLAR_KOMIK.length)];
      const h=new Date().getHours();
      const gunDurumu=h>=6&&h<20?"☀️":"🌙";
      return `${gunDurumu} **${selam}!** ${komik}\n\nSana nasıl yardımcı olabilirim? Turne listesi, otel bilgisi, kadro sorgusu — her şey burada! 😊`;
    }

    /* ── NASIL SINSIN / NABER ── */
    if (/(nasılsın|nasilsin|ne\s*yapıyorsun|ne\s*var\s*ne\s*yok|iyi\s*misin)/.test(Q)) {
      return "Harika! 🎭 Tüm turneleri aklımda tutmak biraz yorucu ama şikayetçi değilim 😄\n\nBugün sana nasıl yardımcı olabilirim?";
    }

    /* ── AY LİSTESİ (örn. "nisan 2026" veya "nisan turneleri") ── */
    if (mi>=0 && (Q.includes("turne")||Q.includes("program")||Q.includes("ne\s*var")||ym||scope.length<T.length)) {
      if(scope.length===0) return `${AYLAR[mi]} ${ym?""+ym[1]:""}ayında planlanmış turne bulunamadı.`;
      const yilStr=ym?" "+ym[1]:"";
      let o=`📅 **${AYLAR[mi]}${yilStr} — ${scope.length} turne:**\n\n`;
      for(const t of scope.sort((a,b)=>(parseDate(a.baslangic)||0)-(parseDate(b.baslangic)||0))){
        o+=`• **${t.oyun}**\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)} · 📍 ${t.il||"—"} · ${statuGoster(t.statu)}\n  👥 ${t.katilimcilar.length} kişi${t.sayi?" · 🎫 "+t.sayi+" temsil":""}\n`;
      }
      return {html:o};
    }

    /* ── OYUN ADI → tüm turneleri listele ── */
    const oyunBul = findOyun(Q,T);
    if (oyunBul && !/(whatsapp|wp|karşılaştır|karsilastir|kopya|kopyala)/.test(Q)) {
      const list=T.filter(t=>norm(t.oyun)===norm(oyunBul)).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0));
      if(list.length){
        const toplamGun=list.reduce((s,t)=>s+turneGun(t),0);
        const toplamTemsil=list.reduce((s,t)=>s+(t.sayi||0),0);
        const sehirler=[...new Set(list.map(t=>t.il).filter(Boolean))];
        let o=`🎭 **${esc(oyunBul)}** — ${list.length} turne kaydı\n`;
        o+=`📊 Toplam: ${toplamGun} gün · ${toplamTemsil} temsil · ${sehirler.length} şehir\n\n`;
        for(const t of list){
          const stClr=t.statu.includes("tamamlan")?"color:#2F7D4E":t.statu.includes("iptal")?"color:#B53030":"color:#A0192E";
          o+=`• 📅 ${fmtTarihAralik(t.baslangic,t.bitis)}\n`;
          o+=`  📍 ${t.il||"—"}${t.mekan?" · "+t.mekan:""} · <span style="${stClr};font-weight:700">${statuGoster(t.statu)}</span>\n`;
          o+=`  👥 ${t.katilimcilar.length} kişi${t.sayi?" · 🎫 "+t.sayi+" temsil":""}\n`;
          if(t.otelAdi) o+=`  🏨 ${t.otelAdi}${t.otelTel?` · <a class="ta-phone" href="tel:${t.otelTel}">${fmtTel(t.otelTel)||t.otelTel}</a>`:""}\n`;
          o+="\n";
        }
        o+=`<button class="ta-inline-copy" onclick="window.__taSubmit('${oyunBul} kadrosunu whatsapp gönder')">📲 WhatsApp'a Gönder</button>`;
        return {html:o};
      }
    }

    /* ── KISMİ İSİM ARAMASI (örn. "Mehmet") — birden fazla sonuç ── */
    {
      const qKelimeler=Q.trim().split(/\s+/).filter(p=>p.length>=3);
      // Sadece 1-2 kelime yazılmışsa ve bilinen komutlardan değilse çoklu kişi kontrolü yap
      const komutKelime=/(turne|otel|şehir|sehir|kadro|bugün|bugun|özet|ozet|lider|çakış|cakis|whatsapp|karşı|karsi|gönder|gonder|ay$|yıl|yil|toplam|eksik|yaklaş|yaklasan)/;
      if(qKelimeler.length<=2&&!komutKelime.test(Q)){
        const eslesen=findPersonAll(Q,T);
        if(eslesen.length>1){
          // Birden fazla kişi — liste göster, tıklayabilsin
          let o=`👥 **"${q}" ile ${eslesen.length} kişi bulundu:**\n\n`;
          for(const k of eslesen){
            const kTurneler=T.filter(t=>t.katilimcilar.some(x=>norm(x.kisi)===norm(k.kisi)));
            o+=`• <button class="ta-inline-copy" style="font-size:12px;padding:3px 9px;" onclick="window.__taSubmit('${k.kisi.replace(/'/g,"\\'")} turne listesi')">${esc(k.kisi)}</button>`;
            o+=` <span style="font-size:11px;color:#8A857C">${k.gorev||k.kategori||""} · ${kTurneler.length} turne</span>\n`;
          }
          return {html:o};
        }
      }
    }

    /* OTEL */
    if (/otel|konaklama|kal(ınan|dığı|acak)/.test(Q)) {
      const city=findCity(Q,T);
      if (city) {
        const list=T.filter(t=>!t.statu.includes("iptal") && [...collectUniqueCitiesFromTour(t)].some(il=>norm(il)===norm(city)));
        const otels=new Map();
        for (const t of list) {
          for (const d of parseDurakOteller(t.duraklar).filter(d=>splitCityNames(d.il).some(il=>norm(il)===norm(city)))) {
            if (d.otelAdi && !otels.has(d.otelAdi)) otels.set(d.otelAdi,{adres:d.otelAdres,tel:d.otelTel,ilgili:d.ilgiliKisi,ilgiliTel:d.ilgiliTel});
          }
          if (t.otelAdi && splitCityNames(t.il).some(il=>norm(il)===norm(city)) && !otels.has(t.otelAdi)) otels.set(t.otelAdi,{adres:t.otelAdres,tel:t.otelTel});
        }
        if (otels.size) { let o=`**${city}** otel bilgileri:\n\n`; for (const [ad,inf] of otels) { o+=`🏨 **${ad}**\n`; if(inf.adres)o+=`   📍 ${inf.adres}\n`; if(inf.tel)o+=`   📞 <a class="ta-phone" href="tel:${inf.tel}">${fmtTel(inf.tel)||inf.tel}</a>\n`; if(inf.ilgili){o+=`   👤 ${inf.ilgili}`;if(inf.ilgiliTel)o+=` — <a class="ta-phone" href="tel:${inf.ilgiliTel}">${fmtTel(inf.ilgiliTel)||inf.ilgiliTel}</a>`;o+="\n";} o+="\n"; }
          const telFirmalar=(DS?.firmalar||[]).filter(f=>f.kategori==="otel"&&[...otels.keys()].some(ad=>norm(ad)===norm(f.ad)));
          if(telFirmalar.length){for(const f of telFirmalar){if(f.tel&&![...otels.values()].some(v=>v.tel===f.tel)){o+=`🏨 **${esc(f.ad)}**\n   📞 <a class="ta-phone" href="tel:${f.tel}">${fmtTel(f.tel)||f.tel}</a>\n\n`;}}}
          return {html:o}; }
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
    if (/(en\s*(fazla|cok|çok)).*(gün|gun).*(yolda|turne)/.test(Q)||/yolda.*kim/.test(Q)||/en\s*çok\s*yol\s*katan/.test(Q)) {
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
    if (/(toplam|kac|kaç).*(turne)/.test(Q)) {
      const now2=new Date();
      const aktifScope=scope.filter(t=>!t.statu.includes("iptal"));
      const g=aktifScope.reduce((s,t)=>s+turneGun(t),0);
      const tm=aktifScope.reduce((s,t)=>s+(t.sayi||0),0);
      const tamam=aktifScope.filter(t=>t.statu.startsWith("tamamlan")||t.statu==="yarida-kesildi").length;
      const devamS=aktifScope.filter(t=>{const bas=parseDate(t.baslangic),bit=parseDate(t.bitis)||bas;return bas&&bit&&bas<=now2&&bit>=now2;}).length;
      const gelecekS=aktifScope.filter(t=>{const d=parseDate(t.baslangic);return d&&d>now2;}).length;
      const iptalS=scope.filter(t=>t.statu==="iptal").length;
      return `📊 Toplam **${scope.length}** turne kaydı:\n\n✅ Tamamlandı: **${tamam}**\n🟢 Devam ediyor: **${devamS}**\n📅 Planlandı: **${gelecekS}**\n❌ İptal: **${iptalS}**\n\n⏱ Toplam **${g}** gün · 🎫 **${tm}** temsil`;
    }
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
    const _isWaQuery=/(whatsapp|wp|w\.a\.|wapp|kadro.*gönder|kadro.*gonder|gönder.*kadro|gonder.*kadro|kadro.*paylaş|paylaş.*kadro|mesaj.*kadro)/.test(Q);
    const found=_isWaQuery?null:findPerson(Q,T);
    if (found) {
      const fullList=T.filter(t=>t.katilimcilar.some(k=>norm(k.kisi)===norm(found.kisi)));
      if (!fullList.length) return `**${found.kisi}** henüz hiçbir turneye atanmamış.`;
      const iptalSayi=fullList.filter(t=>t.statu.includes("iptal")).length;
      const list=fullList.filter(t=>!t.statu.includes("iptal"));
      const gun=list.reduce((s,t)=>s+turneGun(t),0);
      const sorted=list.sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0));
      const lines=sorted.slice(0,15).map(t=>{const otel=t.duraklar?.find(d=>d.otelAdi)?.otelAdi||t.otelAdi||"";const stIco=t.statu.includes("tamamlan")?"✅":t.statu==="yarida-kesildi"?"⚠️":"📅";return `• ${stIco} **${t.oyun}**\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)} · 📍 ${t.il||"—"}${otel?" · 🏨 "+otel:""}`;}).join("\n");
      const toplamTemsil=list.reduce((s,t)=>s+(Number(t.sayi)||0),0);
      // Milestone rozeti
      const MILESTONES=[5,10,15,20,25,30,50];
      const milestone=MILESTONES.find(m=>list.length===m);
      let celebrateHtml="";
      if(milestone){
        const emojis={5:"🌟",10:"🎭",15:"🏅",20:"🎖",25:"👑",30:"🏆",50:"🌟🏆🌟"};
        celebrateHtml=`<div class="ta-celebrate"><span class="ta-cel-emoji">${emojis[milestone]||"🎉"}</span>${found.kisi} — ${milestone}. Turne!<div class="ta-cel-sub">Tebrikler! Bu özel bir kilometre taşı 🎊</div></div>\n`;
      }
      const iptalNote = iptalSayi>0 ? `\n_(İptal edilen ${iptalSayi} turne sayıma dahil değil.)_` : "";
      return {html: celebrateHtml + `**${found.kisi}**${found.gorev?" · "+found.gorev:""}\n📊 ${list.length} aktif turne · 📅 **${gun} gün** yolda · 🎭 ${toplamTemsil} temsil${iptalNote}\n\n${lines}`};
    }
    /* ŞEHİR DETAYI */
      const city=findCity(Q,T);
    if (city) {
        const list=T.filter(t=>!t.statu.includes("iptal") && [...collectUniqueCitiesFromTour(t)].some(il=>norm(il)===norm(city)));
        let o=`**${city}** şehrine **${list.length}** turne yapıldı.\n\n`;
        for(const t of list.slice(0,10)){const duraklar=parseDurakOteller(t.duraklar).filter(d=>splitCityNames(d.il).some(il=>norm(il)===norm(city)));const anaSehirEslesiyor=splitCityNames(t.il).some(il=>norm(il)===norm(city));const otel=duraklar[0]?.otelAdi||(anaSehirEslesiyor?t.otelAdi:"")||"";const otelTel=duraklar[0]?.otelTel||(anaSehirEslesiyor?t.otelTel:"")||"";const ilgili=duraklar[0]?.ilgiliKisi||"";const ilgiliTel=duraklar[0]?.ilgiliTel||"";o+=`• **${t.oyun}** (${statuGoster(t.statu)})\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)}\n`;if(otel){o+=`  🏨 ${otel}`;if(otelTel)o+=` — <a class="ta-phone" href="tel:${otelTel}">${fmtTel(otelTel)||otelTel}</a>`;o+="\n";}if(ilgili){o+=`  👤 ${ilgili}`;if(ilgiliTel)o+=` — <a class="ta-phone" href="tel:${ilgiliTel}">${fmtTel(ilgiliTel)||ilgiliTel}</a>`;o+="\n";}o+="\n";}
      return {html:o};
    }
    /* OYUN DETAYI — oyun adı yazılınca hem bilgi hem düzenle butonu */
    if (!_isWaQuery) for (const t of T) {
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
    if (/(özet|ozet|haftalık|haftalik|bu\s*hafta|30.*gün|rapor|brief|genel.*bak)/.test(Q) && !/(istatistik|istat|sayısal|sayisal|rakam)/.test(Q)) {
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
      // Kişi başına unique turne sayısı — aynı kişinin bir turnede birden fazla kayıtlanmasını önle
      const kisiTurneler=new Map(); // kisi -> Set(turne unique key)
      for(const t of T){
        if(t.statu.includes("iptal")) continue;
        const turneKey=t.oyun+"||"+t.baslangic;
        for(const k of t.katilimcilar){
          if(!kisiTurneler.has(k.kisi)) kisiTurneler.set(k.kisi,new Set());
          kisiTurneler.get(k.kisi).add(turneKey);
        }
      }
      const top=[...kisiTurneler.entries()].map(([kisi,s])=>[kisi,s.size]).sort((a,b)=>b[1]-a[1]).slice(0,10);
      if(!top.length) return "Liderlik tablosu için yeterli veri yok.";
      const madalya=["🥇","🥈","🥉"];
      let o=`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">🏆 Turne Liderlik Tablosu</div>`;
      for(let i=0;i<top.length;i++){
        const [kisi,n]=top[i];
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
      // Spesifik oyun adları varsa direkt karşılaştır, yoksa daima seçici göster
      const adaylar=T.filter(t=>{
        const parcalar=norm(t.oyun).split(/\s+/).filter(p=>p.length>=4);
        return parcalar.length>=1 && parcalar.every(p=>Q.includes(p));
      });
      const eslesen=adaylar.slice(0,2);
      if(eslesen.length<2){
        // Seçici göster
        const recent=[...T].sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0)).slice(0,20);
        let o=`<div style="font-size:12.5px;font-weight:700;color:#1A1A1A;margin-bottom:8px;">⚖️ Karşılaştırmak istediğin iki turneyi seç:</div>`;
        o+=`<div style="display:flex;flex-direction:column;gap:6px;">`;
        o+=`<select id="ta-cmp-a" style="width:100%;border:1.5px solid #E8E2D7;border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;background:#FBF8F3;outline:none;cursor:pointer;">`;
        o+=`<option value="">1. Turne seç…</option>`;
        for(const t of recent){const stLbl=t.statu.includes("tamamlan")?"✅":t.statu==="yarida-kesildi"?"⚠️":t.statu.includes("iptal")?"❌":"📅";o+=`<option value="${esc(t.oyun+"||"+t.baslangic)}">${stLbl} ${esc(t.oyun)} · ${esc(t.il||"?")} · ${fmtTarih(t.baslangic)}</option>`;}
        o+=`</select>`;
        o+=`<select id="ta-cmp-b" style="width:100%;border:1.5px solid #E8E2D7;border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;background:#FBF8F3;outline:none;cursor:pointer;">`;
        o+=`<option value="">2. Turne seç…</option>`;
        for(const t of recent){const stLbl=t.statu.includes("tamamlan")?"✅":t.statu==="yarida-kesildi"?"⚠️":t.statu.includes("iptal")?"❌":"📅";o+=`<option value="${esc(t.oyun+"||"+t.baslangic)}">${stLbl} ${esc(t.oyun)} · ${esc(t.il||"?")} · ${fmtTarih(t.baslangic)}</option>`;}
        o+=`</select>`;
        o+=`<button id="ta-cmp-go" class="ta-btn ta-btn-primary" style="width:100%;justify-content:center;margin-top:4px;">⚖️ Karşılaştır</button>`;
        o+=`</div>`;
        return {html:o};
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
    if (/(whatsapp|wp|w\.a\.|wapp|kadro.*gönder|kadro.*gonder|gönder.*kadro|gonder.*kadro|kadro.*paylaş|kadro.*paylas|paylaş.*kadro|mesaj.*kadro|whatsapp.*gönder|whatsapp.*gonder)/.test(Q)) {
      // WA için özel temizleme: eylem/platform kelimelerini sil, kalan metinde oyun adı ara
      const waTemizQ = Q
        .replace(/(whatsapp|wapp|wp|w\.a\.)/g," ")
        .replace(/(kadrosunu|kadrosun|kadroyu|kadro)\b/g," ")
        .replace(/\b(gönder|gonder|paylaş|paylas|yolla|gönderir|gonderir|at|ilet|mesaj)\b/g," ")
        .replace(/\s+/g," ").trim();

      let tBul=null;
      // Strict matching: oyun adındaki TÜM ≥4 harf kelimeler temizlenmiş sorguda olmalı
      const oyunlar=[...new Set(T.map(t=>t.oyun).filter(Boolean))];
      let eslOyun=null;
      for(const oy of oyunlar){
        const parcalar=norm(oy).split(/\s+/).filter(p=>p.length>=4);
        if(parcalar.length>=1 && parcalar.every(p=>waTemizQ.includes(p))){ eslOyun=oy; break; }
      }
      // Minimum 2 kelimeli oyun adlarında tek kelime eşleşmesini kısıtla
      if(!eslOyun){
        for(const oy of oyunlar){
          const parcalar=norm(oy).split(/\s+/).filter(p=>p.length>=5);
          const toplamKelime=norm(oy).split(/\s+/).length;
          // Tek kelimeli oyun adları: o kelime ≥6 harf olmalı; çok kelimeli oyun adları: en az 2 kelime eşleşmeli
          if(toplamKelime===1 && parcalar.length && parcalar.every(p=>waTemizQ.includes(p))){ eslOyun=oy; break; }
          if(toplamKelime>=2){
            const eslKelimeler=parcalar.filter(p=>waTemizQ.includes(p));
            if(eslKelimeler.length>=Math.min(2,parcalar.length)){ eslOyun=oy; break; }
          }
        }
      }
      if(eslOyun) tBul=T.filter(t=>norm(t.oyun)===norm(eslOyun)).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0))[0];

      // Hâlâ eşleşme yoksa — oyun listesi göster, otomatik seçme YOK
      if(!tBul){
        const oyunListesi=T.filter(t=>!t.statu.includes("iptal")).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0)).slice(0,10).map(t=>t.oyun);
        let secimMsg=`📲 **Hangi oyunun kadrosunu göndermek istersin?**\n\n`;
        for(const oy of oyunListesi) secimMsg+=`• ${oy}\n`;
        secimMsg+=`\n_Örnek: "${oyunListesi[0]||'Oyun Adı'} kadrosunu WhatsApp'a gönder"_`;
        return {html:secimMsg};
      }
      
      // WhatsApp mesajı oluştur
      // Ana turne otelTel boşsa duraktan bul
      const _otelTelRaw = tBul.otelTel || parseDurakOteller(tBul.duraklar).find(d=>d.otelAdi===tBul.otelAdi&&d.otelTel)?.otelTel || "";
      const _otelTelGecerli = _otelTelRaw && /\d{5,}/.test(String(_otelTelRaw).replace(/\D/g,""));
      // Durak otellerini de dahil et
      const durakOtelSatirlari = parseDurakOteller(tBul.duraklar).filter(d=>d.otelAdi).map(d=>{
        const dTelRaw=d.otelTel||"";
        const dTelGecerli=dTelRaw&&/\d{5,}/.test(String(dTelRaw).replace(/\D/g,""));
        return `🏨 Otel (${d.il||"?"}): ${d.otelAdi}\n☎️ Tel: ${dTelGecerli?(fmtTel(dTelRaw)||dTelRaw):"—"}${d.otelAdres?"\n📌 Adres: "+d.otelAdres:""}`;
      });
      const satirlar=[
        `🎭 *${tBul.oyun}*`,
        `📅 ${fmtTarihAralik(tBul.baslangic,tBul.bitis)}`,
        `📍 ${tBul.il||"—"}${tBul.mekan?" · "+tBul.mekan:""}`,
        tBul.gidisUlasim?`🚌 Gidiş: ${tBul.gidisUlasim}${tBul.gidisSaat?" · ⏰ "+tBul.gidisSaat:""}`:"",
        tBul.donusUlasim?`🔄 Dönüş: ${tBul.donusUlasim}${tBul.donusSaat?" · ⏰ "+tBul.donusSaat:""}`:"",
        tBul.otelAdi?`🏨 Otel: ${tBul.otelAdi}\n☎️ Tel: ${_otelTelGecerli?(fmtTel(_otelTelRaw)||_otelTelRaw):"—"}${tBul.otelAdres?"\n📌 Adres: "+tBul.otelAdres:""}`:"",
        ...durakOtelSatirlari,
        tBul.katilimcilar.length?`\n👥 *Kadro (${tBul.katilimcilar.length} kişi):*\n`+tBul.katilimcilar.map(k=>`• ${k.kisi}${k.gorev||k.kategori?" — "+(k.gorev||k.kategori):""}`)
          .join("\n"):"",
        tBul.not?`\n📝 Not: ${tBul.not}`:"",
      ].filter(Boolean).join("\n");

      const encoded=encodeURIComponent(satirlar);
      const waUrl=`https://wa.me/?text=${encoded}`;
      
      let o=`<div style="background:#F0FBF4;border:1px solid #A8D8B9;border-radius:10px;padding:10px 12px;margin-bottom:8px;">`;
      o+=`<div style="font-size:12px;font-weight:800;color:#1A5C35;margin-bottom:6px;">📋 ${esc(tBul.oyun)} — Kadro Mesajı</div>`;
      o+=`<pre style="font-size:11px;white-space:pre-wrap;word-break:break-word;color:#2D4A3A;line-height:1.6;background:none;margin:0;font-family:inherit;">${esc(satirlar)}</pre>`;
      o+=`</div>`;
      const _cid2 = "wa_"+Date.now()+"_"+Math.floor(Math.random()*1e6);
      window.__taCopyStore[_cid2] = satirlar;
      o+=`<a href="${waUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#25D366;color:#fff;border-radius:8px;padding:8px 14px;font-size:12.5px;font-weight:800;text-decoration:none;margin-right:6px;">📲 WhatsApp'ta Aç</a>`;
      o+=`<button class="ta-inline-copy" onclick="window.__taCopy('${_cid2}',this)">📋 Kopyala</button>`;
      return {html:o};
    }

    /* ── BU HAFTA ── */
    if (/(bu\s*hafta|bu\s*hft|haftanın|haftaya)/.test(Q)&&!/(özet|ozet|rapor)/.test(Q)) {
      const now=new Date();
      const dayOfWeek=now.getDay();
      const monday=new Date(now); monday.setDate(now.getDate()-(dayOfWeek===0?6:dayOfWeek-1)); monday.setHours(0,0,0,0);
      const sunday=new Date(monday); sunday.setDate(monday.getDate()+6); sunday.setHours(23,59,59,999);
      const hafta=T.filter(t=>{
        const d=parseDate(t.baslangic), e=parseDate(t.bitis)||d;
        return d&&e&&d<=sunday&&e>=monday;
      });
      if(!hafta.length) return "Bu hafta aktif turne yok. 😴";
      let o=`📅 **Bu hafta (${hafta.length} turne):**\n\n`;
      for(const t of hafta){
        const stClr=t.statu.includes("tamamlan")?"#2F7D4E":t.statu.includes("iptal")?"#B53030":"#A0192E";
        o+=`• **${t.oyun}** · 📍 ${t.il||"—"}\n  📅 ${fmtTarihAralik(t.baslangic,t.bitis)} · <span style="color:${stClr};font-weight:700">${statuGoster(t.statu)}</span>\n  👥 ${t.katilimcilar.length} kişi\n`;
      }
      return {html:o};
    }

    /* ── ŞAKA / ESPRİ ── */
    if (/(şaka|espri|fıkra|komik|güldür|eğlen|eğlenceli)/.test(Q)) {
      const SAKALAR=[
        "Yönetmen sahneye çıkmadan önce ne der?\n\"Perde açılıyor!\" — Kapıya doğru değil sahneye! 🎭",
        "Tiyatrocu neden asla kaybolmaz?\nÇünkü her zaman sahneye geri döner! 🎬",
        "Turneye giden oyuncu ne getirir?\nHer şehirden ayrı bir anı, aynı valiz! 🧳",
        "Kaç tiyatrocu lamba değiştirmek için gerekir?\nBiri yapar, dördü nasıl yapılacağını tartışır! 💡",
        "Sahnede unutulan replik ne anlama gelir?\nDoğaçlama için mükemmel bir fırsat! 😄",
        "Turne koordinatörü neden hiç uyumaz?\nÇünkü otel rezervasyonları gece yarısı iptal olur! 🏨",
        "Oyuncu otelde ne ister?\nSahne ışığı var mı diye sorar! 💡",
        "Dekor kamyonu neden hep geç kalır?\nÇünkü ağır sahneler taşıyor! 🚌",
        "Işık tasarımcısı neden en iyi arkadaştır?\nHer şeyi aydınlatır! ✨",
        "Prompter neden gülmez?\nÇünkü metni zaten biliyor — sürpriz yok! 📄",
        "Aktör seyirciye neden teşekkür eder?\nÇünkü onlar olmasa monolog yapar! 👏",
        "Kostüm tasarımcısı seyahat edince ne der?\nBenim kıyafetlerim mi yoksa karakterin mi? 🎀",
        "İki tiyatrocu kahve içerken ne konuşur?\nHer ikisi de aynı anda konuşup birbirini dinlemez! ☕",
        "Tiyatroda en uzun sahne hangisidir?\nParke dövülürken — çünkü seyirci kaçamaz! 😂",
        "Perde neden ağladı?\nÇünkü her gece kapanıp açılmaktan yoruldu! 🎪",
      ];
      // Son gösterilen şakayı localStorage'da tut, tekrar etmesin
      let lastIdx=parseInt(localStorage.getItem("ta_last_saka")||"-1");
      let idx;
      do { idx=Math.floor(Math.random()*SAKALAR.length); } while(idx===lastIdx&&SAKALAR.length>1);
      localStorage.setItem("ta_last_saka",idx);
      return SAKALAR[idx];
    }

    /* ── RASTGELE TURNE TRİVİA ── */
    if (/(rastgele|sürpriz|surpriz|ne çıkar|ne cikar|şansıma|şansa bırak|sana bıraktım)/.test(Q)) {
      const aktifT=T.filter(t=>!t.statu.includes("iptal")&&t.katilimcilar.length>0);
      if(!aktifT.length) return "Yeterli turne verisi yok. 🎲";
      const t=aktifT[Math.floor(Math.random()*aktifT.length)];
      const gun=turneGun(t);
      const trivia=[
        `🎲 **Rastgele turne:** **${t.oyun}**\n📍 ${t.il||"—"} · 📅 ${fmtTarihAralik(t.baslangic,t.bitis)}\n👥 ${t.katilimcilar.length} kişilik kadro · ⏱ ${gun} gün`,
        `🎰 **Bugünkü sürpriz:** **${t.oyun}** — ${t.il||"?"}'da ${t.sayi||"?"} temsil!`,
        `🎭 Rastgele seçtim: **${t.oyun}** · ${fmtTarih(t.baslangic)} tarihinde ${t.il||"?"}'a gidiyor. ${t.katilimcilar.length>0?t.katilimcilar[Math.floor(Math.random()*t.katilimcilar.length)].kisi+" da bu turnede! 👋":""}`
      ];
      return {html:trivia[Math.floor(Math.random()*trivia.length)]};
    }

    /* ── ŞEHİR REKORU ── */
    if (/(şehir.*rekor|rekor.*şehir|en.*çok.*şehir|hangi.*şehir.*en|kaç.*kez.*gitti|kaç.*defa.*gitti|şehir.*sayısı|şehir.*analiz)/.test(Q)) {
      const ilMap=new Map();
      const _scope=T.filter(t=>!t.statu.includes("iptal"));
      for(const t of _scope){
        for (const city of collectUniqueCitiesFromTour(t)) {
          const k=city.toUpperCase();
          ilMap.set(k,(ilMap.get(k)||0)+1);
        }
      }
      const sorted=[...ilMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
      if(!sorted.length) return "Şehir verisi bulunamadı.";
      const madalya=["🥇","🥈","🥉"];
      let o=`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">🏙 Şehir Rekoru — En Çok Gidilen</div>`;
      for(const [il,n] of sorted){
        const i=sorted.indexOf(sorted.find(x=>x[0]===il));
        const medal=madalya[i]||(i+1)+".";
        const pct=Math.round(n/sorted[0][1]*100);
        o+=`<div class="ta-lb-row"><span class="ta-lb-medal">${medal}</span><span class="ta-lb-name">${esc(il)}</span><div class="ta-lb-bar-wrap"><div class="ta-lb-bar" style="width:${pct}%"></div></div><span class="ta-lb-val">${n} turne</span></div>`;
      }
      return {html:o};
    }

    /* ── TURNE MAPİ / KAÇINILMAZ EŞLEŞME ── */
    if (/(nereye.*gittik|hangi.*şehirler|şehir.*listesi|gidilen.*şehirler)/.test(Q)) {
      const ilSet=new Set();
      T.filter(t=>!t.statu.includes("iptal")).forEach(t=>collectUniqueCitiesFromTour(t).forEach(il=>ilSet.add(il)));
      const iller=[...ilSet].sort((a,b)=>a.localeCompare(b,"tr"));
      if(!iller.length) return "Şehir bilgisi bulunamadı.";
      const satirlar=[];
      for(let i=0;i<iller.length;i+=6) satirlar.push(iller.slice(i,i+6));
      let o=`🗺️ **Gidilen şehirler — ${iller.length} farklı şehir**\n\n`;
      o+=satirlar.map(grup=>grup.map(il=>`📍 ${il}`).join("   ")).join("\n\n");
      o+=`\n\n<span style="font-size:11px;color:#8A857C">Aynı şehir ikinci kez yazılmaz; iptal kayıtlar da sayılmaz.</span>`;
      return {html:o};
    }
    /* ── YAZITUTRA / ZAR ── */
    if (/(yazı.*tura|tura.*yazı|yazıtura|yazi.*tura)/.test(Q)) {
      const sonuc=Math.random()<0.5?"YA-ZI 📜":"TU-RA 🪙";
      const detay=Math.random()<0.5?" (Tebrikler! 🎉)":" (Şans seninle değil bugün 😄)";
      return `🪙 Yazı mı tura mı... döndürüyor...\n\n**${sonuc}**${detay}`;
    }
    if (/(zar.*at|at.*zar|zar\s*\d*|dice|zarım)/.test(Q)) {
      const adetM=Q.match(/(\d+)\s*(?:zar|d)/); const adet=Math.min(Math.max(parseInt(adetM?.[1]||1),1),5);
      const yuzM=Q.match(/d(\d+)/); const yuz=Math.min(Math.max(parseInt(yuzM?.[1]||6),2),20);
      const sonuclar=Array.from({length:adet},()=>Math.floor(Math.random()*yuz)+1);
      const toplam=sonuclar.reduce((a,b)=>a+b,0);
      const zarEmojiler=["⚀","⚁","⚂","⚃","⚄","⚅"];
      const gosterge=yuz===6?sonuclar.map(n=>zarEmojiler[n-1]).join(" "):sonuclar.join(" · ");
      // Yorum
      const max=adet*yuz, ort=(max+adet)/2;
      let yorum="";
      if (adet===1 && yuz===6) {
        const tek={1:"🌧 Bir tane geldi. Bugün dikkatli ol, küçük detaylar önemli.",
          2:"🍃 İki. Sakin bir gün, planlı ilerle.",
          3:"🎭 Üç — perde yarı açık, hazırlıkları gözden geçir.",
          4:"🚀 Dört — iyi bir tempo, devam et.",
          5:"🌟 Beş — şanslı bir gün, yeni bir adım atabilirsin.",
          6:"🔥 Altı — full puan! Bugün bir turne için ideal bir gün."};
        yorum="\n\n"+tek[sonuclar[0]];
      } else {
        if (toplam===max) yorum="\n\n🔥 Maksimum! Bugün şans tamamen senin tarafında.";
        else if (toplam===adet) yorum="\n\n🌧 Minimum geldi. Şansını yarın tekrar deneriz.";
        else if (toplam>ort) yorum="\n\n🌟 Ortalamanın üstünde — iyi bir hamle yapabilirsin.";
        else yorum="\n\n🍃 Ortalama altı — sabırlı ol, sıra sende.";
      }
      const baslik = adet===1 && yuz===6 ? "🎲 **Zar atıldı**" : `🎲 **${adet} adet d${yuz} zar atıldı**`;
      return `${baslik}\n\n${gosterge}${adet>1?`\n\nToplam: **${toplam}** / ${max}`:""}${yorum}`;
    }

    /* ── TURNE HİKAYE ÖZETİ ── */
    if (/(anlat|hikaye|hikâye|özetle|ozetle|turne.*hakkında|hakkında.*turne|turne.*nasıl|nasıl.*turne|turne.*neydi)/.test(Q)) {
      // Oyun adı bul
      const oyunBulH=findOyun(Q,T);
      let tBul=null;
      if(oyunBulH) tBul=T.filter(t=>norm(t.oyun)===norm(oyunBulH)).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0))[0];
      
      // Eşleşme bulunamadıysa — seçici göster
      if(!tBul){
        const listele=[...T].filter(t=>t.katilimcilar.length>0||t.statu!=="taslak").sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0)).slice(0,20);
        if(!listele.length) return "Anlatacak turne bulunamadı.";
        let o=`<div style="font-size:12.5px;font-weight:700;color:#1A1A1A;margin-bottom:8px;">📖 Hangi turneyi anlatayım?</div>`;
        o+=`<div style="display:flex;flex-direction:column;gap:6px;">`;
        o+=`<select id="ta-hikaye-sec" style="width:100%;border:1.5px solid #E8E2D7;border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;background:#FBF8F3;outline:none;cursor:pointer;">`;
        o+=`<option value="">Turne seç…</option>`;
        for(const t of listele){
          const stLbl=t.statu.includes("tamamlan")?"✅":t.statu.includes("iptal")?"❌":t.statu==="yarida-kesildi"?"⚠️":"📅";
          o+=`<option value="${esc(t.oyun+"||"+t.baslangic)}">${stLbl} ${esc(t.oyun)} · ${esc(t.il||"?")} · ${fmtTarih(t.baslangic)}</option>`;
        }
        o+=`</select>`;
        o+=`<button id="ta-hikaye-go" class="ta-btn ta-btn-primary" style="width:100%;justify-content:center;margin-top:4px;">📖 Hikayeyi Anlat</button>`;
        o+=`</div>`;
        return {html:o, _type:"hikaye_sec"};
      }
      
      const gun=turneGun(tBul);
      const kadroSay=tBul.katilimcilar.length;
      const ulasimIcon=(u)=>u&&/(uçak|ucak|thy|pegasus|sunexpress|hava)/i.test(u)?"✈️":"🚌";
      const ulasimMetin=tBul.gidisUlasim?`${ulasimIcon(tBul.gidisUlasim)} **${tBul.gidisUlasim}** ile yola çıkılıyor${tBul.gidisSaat?", saat **"+tBul.gidisSaat+"**'de":""}.`:"Ulaşım bilgisi henüz girilmemiş.";
      const otelMetin=tBul.otelAdi?`Konaklama için **${tBul.otelAdi}** tercih edilmiş${tBul.otelTel?" (📞 "+fmtTel(tBul.otelTel)+")":""}.`:"Otel bilgisi henüz kayıtlı değil.";
      const gorevler=new Map();
      for(const k of tBul.katilimcilar){const g=k.gorev||k.kategori||"Belirtilmemiş";gorevler.set(g,(gorevler.get(g)||0)+1);}
      const gorevMetin=[...gorevler.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([g,n])=>`${n} ${g}`).join(", ");
      const statuRenk=tBul.statu.includes("tamamlan")?"#2F7D4E":tBul.statu.includes("iptal")?"#B53030":tBul.statu==="yarida-kesildi"?"#C97A12":"#A0192E";

      let o=`<div style="background:linear-gradient(135deg,#FBE8EB,#FBF8F3);border:1px solid #E0D5CC;border-radius:12px;padding:14px;line-height:1.9;font-size:12.5px;">`;
      o+=`<div style="font-size:13px;font-weight:800;color:#A0192E;margin-bottom:10px;">📖 ${esc(tBul.oyun)} — Turne Hikayesi</div>`;
      o+=`<p style="margin:0 0 8px">🎭 <strong>${esc(tBul.oyun)}</strong>, ${fmtTarihAralik(tBul.baslangic,tBul.bitis)} tarihleri arasında <strong>${esc(tBul.il||"bilinmeyen bir şehir")}</strong>'de ${tBul.sayi?tBul.sayi+" temsil için ":""}sahne alıyor. Toplam <strong>${gun} günlük</strong> bu turnede <strong>${kadroSay} kişilik</strong> bir ekip yola çıkıyor.</p>`;
      o+=`<p style="margin:0 0 8px">🧳 ${ulasimMetin}</p>`;
      o+=`<p style="margin:0 0 8px">🏨 ${otelMetin}</p>`;
      if(gorevMetin) o+=`<p style="margin:0 0 8px">🎪 Kadroda <strong>${gorevMetin}</strong> gibi görevler yer alıyor.</p>`;
      if(tBul.not) o+=`<p style="margin:0 0 8px">📝 <em>${esc(tBul.not)}</em></p>`;
      o+=`<div style="display:inline-block;margin-top:4px;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:800;color:${statuRenk};background:${statuRenk}18;border:1px solid ${statuRenk}44;">${statuGoster(tBul.statu)}</div>`;
      o+=`</div>`;
      return {html:o};
    }

    if (/(teşekkür|tesekkur|sağ\s*ol|sagol|eyvallah|süpersin|harikasın|iyisin|mükemmel)/.test(Q)) {
      const TESEKKUR=["Rica ederim! 🎭 Her zaman buradayım!","Ne demek, asıl siz sahneyi aydınlatıyorsunuz! ✨","Yardımcı olabildimse ne mutlu! 😊"];
      return TESEKKUR[Math.floor(Math.random()*TESEKKUR.length)];
    }

    /* ── MOTİVASYON / İLHAM ── */
    if (/(motivasyon|ilham|güç\s*ver|güçlendir|hadi|haydi|yürü|cesaretlen|heyecan|coştur|enerji)/.test(Q)) {
      // Canlı istatistikler
      const _aktifMot = T.filter(t=>!t.statu.includes("iptal"));
      const _turne_say = _aktifMot.length;
      const _sehir_set = new Set(); _aktifMot.forEach(t=>collectUniqueCitiesFromTour(t).forEach(il=>_sehir_set.add(il)));
      const _sehir_say = _sehir_set.size;
      const _personel_set = new Set(); _aktifMot.forEach(t=>t.katilimcilar.forEach(k=>_personel_set.add(norm(k.kisi))));
      const _personel_say = _personel_set.size;
      const _temsil_say = _aktifMot.reduce((s,t)=>s+(t.sayi||0),0);
      const _gun_say = _aktifMot.reduce((s,t)=>s+turneGun(t),0);
      const MOTIVASYONLAR = [
        {msg:`Sahne ışığı yandığında tüm yorgunluk unutulur — ve siz tam da o ışığı taşıyorsunuz! 🎭✨`, emoji:"🌟"},
        {msg:`${_turne_say} turne, ${_sehir_say} şehir, ${_personel_say} kişilik kadro — bu bir ekip değil, bir aile! 👨‍👩‍👧‍👦❤️`, emoji:"💪"},
        {msg:`Her yeni şehir, yeni bir seyirci kitlesi. Siz İzmir'den Türkiye'ye sahne taşıyorsunuz! 🗺️🎭`, emoji:"🚀"},
        {msg:`Valizi topla, perdeyi aç — sahne her zaman seni bekliyor! 🧳🎬`, emoji:"⭐"},
        {msg:`${_temsil_say} temsil, ${_gun_say} gün, ${_sehir_say} şehir — bu rakamlarda emek, ter ve alkış var! 🙏💫`, emoji:"🎪"},
        {msg:`Turne yorucu, ama perde açıldığında? Sihir başlıyor! Hadi bakalım! 🎉`, emoji:"🔥"},
      ];
      const m=MOTIVASYONLAR[Math.floor(Math.random()*MOTIVASYONLAR.length)];
      const soz=TIYATRO_SOZLERI[Math.floor(Math.random()*TIYATRO_SOZLERI.length)];
      const now2=new Date();
      const yaklashan2=T.filter(t=>{const d=parseDate(t.baslangic);return d&&d>now2&&!t.statu.includes("iptal");});
      const gunStr=yaklashan2.length?`\n\n⏳ Önümüzde **${yaklashan2.length}** turne daha var — hazır mısınız?`:"";
      return {html:`<div style="background:linear-gradient(135deg,#FBE8EB,#FFF3E8);border:1px solid #E0C4A8;border-radius:12px;padding:14px;margin-bottom:8px;">
        <div style="font-size:20px;margin-bottom:8px;text-align:center;">${m.emoji}</div>
        <div style="font-size:13px;font-weight:700;color:#7A2E1F;line-height:1.6;text-align:center;">${esc(m.msg)}</div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(160,25,46,.15);font-size:11.5px;color:#8A6050;font-style:italic;text-align:center;">"${esc(soz.text)}"<br><span style="font-weight:700;font-style:normal;">— ${esc(soz.auth)}</span></div>
      </div>${gunStr}`};
    }

    /* ── BENİ ŞAŞIRT / TRİVİA ── */
    if (/(şaşırt|sasirt|trivia|bilgi\s*ver|ilginç|tuhaf|merak|keşif|beni.*şaşırt|bakalım\s*ne|ne\s*biliyorsun)/.test(Q)) {
      // ——— Normalize kişi & görev: aynı kişi/görev farklı yazımlarda parçalanmasın
      // İptal hariç "gerçek" aktif turneler (yarıda kesildi dahil — gidilmiş sayılır)
      const aktifTurneler=T.filter(t=>!t.statu.includes("iptal")&&t.statu!=="yarida-kesildi");
      const tumIptalDisi=T.filter(t=>!t.statu.includes("iptal")); // yarıda kesildi dahil
      const personelSet2=new Set(); tumIptalDisi.forEach(t=>t.katilimcilar.forEach(k=>personelSet2.add(norm(k.kisi))));
      // Şehir: iptal hariç (yarıda kesilenler de gidilmiş sayılır)
      const ilSet2=new Set(); tumIptalDisi.forEach(t=>collectUniqueCitiesFromTour(t).forEach(il=>ilSet2.add(norm(il))));
      const toplamGun2=aktifTurneler.reduce((s,t)=>s+turneGun(t),0);
      const enUzunTurne=aktifTurneler.slice().sort((a,b)=>turneGun(b)-turneGun(a))[0];
      const enKalabalikTurne=tumIptalDisi.filter(t=>t.katilimcilar.length>0).sort((a,b)=>b.katilimcilar.length-a.katilimcilar.length)[0];
      // kişi turne sayısı — norm anahtarla say, iptal hariç
      const kisiTurneler2=new Map(); const kisiDisplay=new Map();
      tumIptalDisi.forEach(t=>{const seen=new Set();t.katilimcilar.forEach(k=>{const key=norm(k.kisi);if(!key||seen.has(key))return;seen.add(key);
        kisiTurneler2.set(key,(kisiTurneler2.get(key)||0)+1);
        if(!kisiDisplay.has(key)) kisiDisplay.set(key,k.kisi);
      });});
      const enAktifSira=[...kisiTurneler2.entries()].sort((a,b)=>b[1]-a[1]);
      const enAktif=enAktifSira[0];
      const enAktifAd=enAktif?(kisiDisplay.get(enAktif[0])||enAktif[0]):"";
      // Şehir — sadece ANA il, iptal hariç
      const ilMap2=new Map();
      tumIptalDisi.forEach(t=>{if(t.il){const k=t.il.toLocaleUpperCase("tr");ilMap2.set(k,(ilMap2.get(k)||0)+1);}});
      const enCokIlSira=[...ilMap2.entries()].sort((a,b)=>b[1]-a[1]);
      const enCokIl=enCokIlSira[0];
      // Ek istatistikler — iptal hariç
      const ayMap2=new Array(12).fill(0);tumIptalDisi.forEach(t=>{const d=parseDate(t.baslangic);if(d)ayMap2[d.getMonth()]++;});
      const enYogunAyIdx=ayMap2.indexOf(Math.max(...ayMap2));
      const enYogunAySay=ayMap2[enYogunAyIdx];
      const toplamTemsil2b=tumIptalDisi.reduce((s,t)=>s+(t.sayi||0),0);
      const ucakTurneler=tumIptalDisi.filter(t=>t.gidisUlasim&&/(uçak|ucak|thy|pegasus|sunexpress|hava)/i.test(t.gidisUlasim));
      const otobusTurneler=tumIptalDisi.filter(t=>t.gidisUlasim&&/(otobüs|otobus|kiralık|kiralk|servis)/i.test(t.gidisUlasim));
      const enKisaTurne=aktifTurneler.filter(t=>turneGun(t)>0).sort((a,b)=>turneGun(a)-turneGun(b))[0];
      const yarida=T.filter(t=>t.statu==="yarida-kesildi");
      const iptal2b=T.filter(t=>t.statu==="iptal");
      // Görev grupları — normalize edilmiş anahtarla, ekranda en sık yazımı göster
      const gorevMap2=new Map(); const gorevDisplay=new Map();
      aktifTurneler.forEach(t=>t.katilimcilar.forEach(k=>{
        const ham=(k.gorev||k.kategori||"").trim(); if(!ham) return;
        const key=norm(ham);
        gorevMap2.set(key,(gorevMap2.get(key)||0)+1);
        if(!gorevDisplay.has(key)) gorevDisplay.set(key,ham);
      }));
      const enCokGorevSira=[...gorevMap2.entries()].sort((a,b)=>b[1]-a[1]);
      const enCokGorev=enCokGorevSira[0];
      const enCokGorevAd=enCokGorev?(gorevDisplay.get(enCokGorev[0])||enCokGorev[0]):"";
      const yilMap2=new Map();aktifTurneler.forEach(t=>{const d=parseDate(t.baslangic);if(d)yilMap2.set(d.getFullYear(),(yilMap2.get(d.getFullYear())||0)+1);});
      const enYogunYil=[...yilMap2.entries()].sort((a,b)=>b[1]-a[1])[0];
      const ortKadro=aktifTurneler.length?Math.round(aktifTurneler.reduce((s,t)=>s+t.katilimcilar.length,0)/aktifTurneler.length):0;
      const ortGun=aktifTurneler.length?Math.round(toplamGun2/aktifTurneler.length*10)/10:0;
      // Hafta sonu turneleri
      const hsTurne=aktifTurneler.filter(t=>{const d=parseDate(t.baslangic);return d&&(d.getDay()===0||d.getDay()===6);}).length;
      // Otel çeşitliliği
      const otelSet=new Set();T.forEach(t=>{if(t.otelAdi)otelSet.add(norm(t.otelAdi));});
      // Oyun çeşitliliği
      const oyunMap=new Map();aktifTurneler.forEach(t=>{const k=norm(t.oyun||"");if(k)oyunMap.set(k,(oyunMap.get(k)||0)+1);});
      const enCokOyun=[...oyunMap.entries()].sort((a,b)=>b[1]-a[1])[0];
      const enCokOyunAd=enCokOyun?(aktifTurneler.find(t=>norm(t.oyun||"")===enCokOyun[0])?.oyun||enCokOyun[0]):"";
      // İkinci en aktif personel
      const ikinciAktif=enAktifSira[1];
      const ikinciAktifAd=ikinciAktif?(kisiDisplay.get(ikinciAktif[0])||ikinciAktif[0]):"";
      // Yıl başına ortalama
      const yilSay=yilMap2.size||1;
      const ortYil=Math.round(aktifTurneler.length/yilSay*10)/10;
      // Tek kişilik turne sayısı (solo)
      const soloTurne=aktifTurneler.filter(t=>t.katilimcilar.length===1).length;
      // Aynı oyunu paylaşan en çok personel
      const top3Aktif=enAktifSira.slice(0,3).map(([k,n])=>`${kisiDisplay.get(k)||k} (${n})`).join(", ");
      const top3Sehir=enCokIlSira.slice(0,3).map(([il,n])=>`${il} (${n})`).join(", ");

      const TRIVIAS=[
        enUzunTurne?`📏 En uzun turne **${turneGun(enUzunTurne)} gün** sürdü — **${enUzunTurne.oyun}** (${enUzunTurne.il||"—"}). 🧳`:"",
        enKisaTurne&&turneGun(enKisaTurne)<=2?`⚡ En kısa turne yalnızca **${turneGun(enKisaTurne)} gün** sürdü — **${enKisaTurne.oyun}** (${enKisaTurne.il||"—"}). 😅`:"",
        enKalabalikTurne?`👥 En kalabalık kadro **${enKalabalikTurne.katilimcilar.length} kişiyle** **${enKalabalikTurne.oyun}** turnesinde sahneye çıktı. 🎪`:"",
        enAktif?`🏆 En çok turneye çıkan personel **${enAktifAd}** — toplam **${enAktif[1]} turne**. 🌟`:"",
        ikinciAktif?`🥈 Listenin ikincisi **${ikinciAktifAd}** — **${ikinciAktif[1]} turne**. 🔥`:"",
        top3Aktif?`🎖 En çok yola çıkan ilk üç: **${top3Aktif}**.`:"",
        enCokIl?`🏙 En çok gidilen şehir (ana il) **${enCokIl[0]}** — toplam **${enCokIl[1]} turne**. 🏠`:"",
        top3Sehir?`🗺️ En çok ziyaret edilen ilk üç şehir: **${top3Sehir}**.`:"",
        `🌍 Şimdiye kadar **${ilSet2.size}** farklı şehre (duraklar dahil) gidildi.`,
        `⏱️ Tüm turne günleri toplandığında **${toplamGun2} gün** yolda geçirilmiş; bu yaklaşık **${Math.round(toplamGun2/30)} ay** eder. 😮`,
        `🎭 Turnelerde görev alan toplam **${personelSet2.size}** farklı personel var.`,
        enYogunAySay>0?`📅 En yoğun ay **${AYLAR[enYogunAyIdx]}** — o ayda **${enYogunAySay} turne** gerçekleşti. 🔥`:"",
        toplamTemsil2b>0?`🎫 Toplamda **${toplamTemsil2b} temsil** verildi. ✨`:"",
        ucakTurneler.length>0?`✈️ Turnelerin **${ucakTurneler.length}** tanesinde ulaşım uçakla sağlandı.`:"",
        otobusTurneler.length>0?`🚌 Turnelerin **${otobusTurneler.length}** tanesinde ulaşım otobüsle yapıldı. 😄`:"",
        ucakTurneler.length>0&&otobusTurneler.length>0?`🆚 Ulaşım dağılımı: **${ucakTurneler.length}** uçak / **${otobusTurneler.length}** otobüs. ${ucakTurneler.length>otobusTurneler.length?"Hava yolu önde. ✈️":"Kara yolu önde. 🛣️"}`:"",
        yarida.length>0?`⚠️ Şu ana kadar **${yarida.length}** turne yarıda kesildi.`:"",
        iptal2b.length>0?`❌ Sistemde **${iptal2b.length}** iptal turne kayıtlı. 📖`:"",
        enCokGorev?`🎪 En kalabalık görev grubu **${enCokGorevAd}** — **${enCokGorev[1]} kişi**. 💪`:"",
        enCokGorevSira.length>=3?`🏷 En kalabalık ilk üç görev: **${enCokGorevSira.slice(0,3).map(([k,n])=>(gorevDisplay.get(k)||k)+" ("+n+")").join(", ")}**.`:"",
        enYogunYil?`📆 En yoğun yıl **${enYogunYil[0]}** — toplam **${enYogunYil[1]} turne**. 🏆`:"",
        ortKadro>0?`🧮 Ortalama bir turnenin kadrosu **${ortKadro} kişi**. 🤝`:"",
        ortGun>0?`📐 Bir turne ortalama **${ortGun} gün** sürüyor. 🧳`:"",
        hsTurne>0?`🎉 **${hsTurne}** turne Cumartesi veya Pazar günü başladı.`:"",
        otelSet.size>0?`🏨 Şimdiye kadar **${otelSet.size}** farklı otelde konaklandı. 🛏️`:"",
        enCokOyun?`🎭 En çok turneye çıkan oyun **${enCokOyunAd}** — **${enCokOyun[1]} turne**. ⭐`:"",
        oyunMap.size>0?`📚 Aktif turne repertuvarında **${oyunMap.size}** farklı oyun bulunuyor.`:"",
        ortYil>0?`📊 Yılda ortalama **${ortYil} turne** sahneleniyor. 📈`:"",
        soloTurne>0?`👤 Şu ana kadar **${soloTurne}** turne tek kişilik kadroyla yapıldı. 🎤`:"",
        T.length>0?`🎬 Sistemde toplam **${T.length}** turne kaydı bulunuyor (iptal dahil). 📂`:"",
        aktifTurneler.length>0?`✅ Bunların **${aktifTurneler.length}** tanesi aktif (tamamlanan + planlanan, iptal ve yarıda kesildi hariç). 📊`:"",
      ].filter(Boolean);
      
      // Son gösterilen trivia'yı tekrar etme
      let lastTriviaIdx=parseInt(sessionStorage.getItem("ta_last_trivia")||"-1");
      let tidx;
      do{tidx=Math.floor(Math.random()*TRIVIAS.length);}while(tidx===lastTriviaIdx&&TRIVIAS.length>1);
      sessionStorage.setItem("ta_last_trivia",tidx);
      const trivia=TRIVIAS[tidx];
      return {html:`<div style="background:linear-gradient(135deg,#E8F4FD,#F0FAFE);border:1px solid #B0D8F0;border-radius:12px;padding:14px;">
        <div style="font-size:11px;font-weight:800;color:#3A6FB0;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">🔍 Biliyor muydunuz?</div>
        <div style="font-size:13px;color:#1A1A1A;line-height:1.7;">${fmtHtml(trivia)}</div>
        <button class="ta-inline-copy" style="margin-top:8px;" onclick="window.__taSubmit('beni şaşırt')">🔄 Bir tane daha!</button>
      </div>`};
    }

    /* ── TURNE İSTATİSTİK ÖZET (sohbette) ── */
    if (/(istatistik|istat|sayısal|sayisal|özet.*sayı|özet.*istat|genel.*istat|rakamlar)/.test(Q)) {
      const now2=new Date();
      // İptal edilenler hariç tutuluyor; "yarida-kesildi" ayrı sayılıyor
      const aktifT     = T.filter(t => !(t.statu || "").includes("iptal"));
      const tamamlanan = aktifT.filter(t => (t.statu || "").startsWith("tamamlan")).length;
      const yarida2    = aktifT.filter(t => t.statu === "yarida-kesildi").length;
      const devam2     = aktifT.filter(t => {
        const bas = parseDate(t.baslangic), bit = parseDate(t.bitis) || bas;
        return bas && bit && bas <= now2 && bit >= now2;
      }).length;
      const gelecek2   = aktifT.filter(t => { const d = parseDate(t.baslangic); return d && d > now2; }).length;
      const iptal2     = T.filter(t => t.statu === "iptal").length;
      const toplamGun2 = aktifT.reduce((s, t) => s + turneGun(t), 0);
      const toplamTemsil2 = aktifT.reduce((s, t) => s + (Number(t.sayi) || 0), 0);
      const personelSet2 = new Set();
      aktifT.forEach(t => (t.katilimcilar || []).forEach(k => k.kisi && personelSet2.add(norm(k.kisi))));
      // Ana il (kullanıcı algısıyla uyumlu)
      const ilAna = new Set();
      aktifT.forEach(t => { if (t.il) ilAna.add(t.il); });
      // Durak dahil
      const ilHepsi = new Set(ilAna);
      aktifT.forEach(t => (t.duraklar || []).forEach(d => { if (d.il) ilHepsi.add(d.il); }));
      return {html:`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">📊 Genel İstatistikler <span style="font-weight:500;opacity:.75">(iptaller hariç)</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
          <div class="ta-kpi"><div class="ta-kpi-val">${aktifT.length}</div><div class="ta-kpi-lbl">Aktif Turne</div></div>
          <div class="ta-kpi"><div class="ta-kpi-val">${toplamGun2}</div><div class="ta-kpi-lbl">Toplam Gün</div></div>
          <div class="ta-kpi"><div class="ta-kpi-val">${toplamTemsil2}</div><div class="ta-kpi-lbl">Toplam Temsil</div></div>
          <div class="ta-kpi"><div class="ta-kpi-val">${personelSet2.size}</div><div class="ta-kpi-lbl">Personel</div></div>
        </div>
        <div style="font-size:12px;line-height:1.9;">
          ✅ Tamamlandı: <strong>${tamamlanan}</strong><br>
          🟢 Devam ediyor: <strong>${devam2}</strong><br>
          📅 Planlandı: <strong>${gelecek2}</strong><br>
          ⚠️ Yarıda kesilen: <strong>${yarida2}</strong><br>
          ❌ İptal: <strong>${iptal2}</strong><br>
          🏙 Ana il: <strong>${ilAna.size}</strong> &nbsp;·&nbsp; Durak dahil: <strong>${ilHepsi.size}</strong><br>
          📁 Sistemdeki toplam kayıt: <strong>${T.length}</strong>
        </div>
        <button class="ta-inline-copy" style="margin-top:8px;" onclick="document.querySelector('.ta-tab[data-view=&quot;stats&quot;]')?.click()">📊 Detaylı İstatistik</button>`};
    }

    /* ── KAÇINILMAZ TAHMİN / HAVA DURUMU ── */
    if (/(hava|hava\s*durumu|hava\s*nasıl|yağmur|kar\s*var|sıcaklık|sicaklik)/.test(Q)) {
      const city2=findCity(Q,T)||"";
      const cityEnc=encodeURIComponent(city2||"İzmir");
      const wttrCity=city2||"Izmir";
      return {html:`<div style="background:linear-gradient(135deg,#E8F4FD,#EEF8FF);border:1px solid #B0D8F0;border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:24px;margin-bottom:6px;">🌤️</div>
        <div style="font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:4px;">${city2?esc(city2)+" hava durumu":"Hava durumu"}</div>
        <div style="font-size:11.5px;color:#6A6560;margin-bottom:10px;">Turne öncesi hava kontrolü yapın!</div>
        <a href="https://wttr.in/${encodeURIComponent(wttrCity)}?lang=tr" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#3A6FB0;color:#fff;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;text-decoration:none;">🌐 Hava Durumunu Gör</a>
        ${city2?"":`<div style="font-size:11px;color:#8A857C;margin-top:8px;">Şehir belirtin: "Ankara hava durumu"</div>`}
      </div>`};
    }

    /* ── SEZON / DÖNEM ANALİZİ ── */
    if (/(sezon|dönem|hangi\s*sezon|mevsim|hangi.*mevsim|mevsim.*turne|yaz\s*turne|kış\s*turne|bahar\s*turne|ilkbahar|sonbahar)/.test(Q)) {
      const mevsimMap={"Kış 🌨️":[0,1,11],"İlkbahar 🌸":[2,3,4],"Yaz ☀️":[5,6,7],"Sonbahar 🍂":[8,9,10]};
      const mevsimSay={"Kış 🌨️":0,"İlkbahar 🌸":0,"Yaz ☀️":0,"Sonbahar 🍂":0};
      T.filter(t=>!t.statu.includes("iptal")).forEach(t=>{const d=parseDate(t.baslangic);if(!d)return;const ay=d.getMonth();for(const[m,aylar]of Object.entries(mevsimMap))if(aylar.includes(ay)){mevsimSay[m]++;break;}});
      const sorted=Object.entries(mevsimSay).sort((a,b)=>b[1]-a[1]);
      let o=`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">🍃 Mevsimsel Dağılım</div>`;
      for(const[m,n] of sorted){const pct=sorted[0][1]?Math.round(n/sorted[0][1]*100):0;o+=`<div class="ta-stat-row"><span class="ta-stat-name">${m}</span><div class="ta-stat-bar-wrap"><div class="ta-stat-bar" style="width:${pct}%"></div></div><span class="ta-stat-val">${n} turne</span></div>`;}
      return {html:o};
    }

    /* ── PERSONEL PROFİL / ÖZGEÇMIŞ ── */
    if (/(profil|özgeçmiş|ozgecmis|sicili|kariyer|biyografi|en\s*uzun\s*turne\s*kim|rekor\s*kıran)/.test(Q)) {
      const kisiGunMap=new Map();
      T.filter(t=>!t.statu.includes("iptal")).forEach(t=>{const g=turneGun(t);t.katilimcilar.forEach(k=>{if(!kisiGunMap.has(k.kisi))kisiGunMap.set(k.kisi,{gun:0,turne:0,gorevler:new Set(),sehirler:new Set()});const p=kisiGunMap.get(k.kisi);p.gun+=g;p.turne++;p.gorevler.add(k.gorev||k.kategori||"—");if(t.il)p.sehirler.add(t.il);});});
      const en=[...kisiGunMap.entries()].sort((a,b)=>b[1].gun-a[1].gun).slice(0,5);
      if(!en.length)return "Personel verisi bulunamadı.";
      const madalya=["🥇","🥈","🥉","4️⃣","5️⃣"];
      let o=`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">⭐ En Çok Yol Kat Eden Personel</div>`;
      for(let i=0;i<en.length;i++){const[kisi,p]=en[i];o+=`<div style="padding:8px 0;border-bottom:1px solid #F0EBE5;"><div style="font-size:12.5px;font-weight:700;">${madalya[i]} ${esc(kisi)}</div><div style="font-size:11px;color:#6A6560;margin-top:3px;">🗓 ${p.turne} turne · ⏱ ${p.gun} gün · 🏙 ${p.sehirler.size} şehir</div></div>`;}
      return {html:o};
    }


    /* ── TURNE SKORKART ── */
    if (/(skor|puan|buyukluk|büyüklük|ne kadar büyük|turne.*puanı|puanla|skorkart|scorecard)/.test(Q)) {
      const esc2=(s)=>(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const aktifT=T.filter(t=>!t.statu.includes('iptal'));
      if(!aktifT.length) return 'Puanlanacak turne bulunamadı.';
      const scoredT=aktifT.map(t=>{
        const gun=turneGun(t),kadro=t.katilimcilar.length,temsil=t.sayi||1;
        const score=Math.round(gun*1.5+kadro*2+temsil*3);
        let seviye='🌱 Küçük';if(score>=60)seviye='🌟 Büyük';else if(score>=35)seviye='🎭 Orta';else if(score>=20)seviye='🎪 Normal';
        return {t,score,seviye,gun,kadro,temsil};
      }).sort((a,b)=>b.score-a.score);
      const oyunAdiBul=findOyun(Q,T);
      let o='';
      if(oyunAdiBul){
        const tek=scoredT.find(s=>norm(s.t.oyun)===norm(oyunAdiBul));
        if(tek){
          o=`<div style="background:linear-gradient(135deg,#FBE8EB,#FFF3E8);border:1px solid #E0C4A8;border-radius:12px;padding:14px;margin-bottom:8px;"><div style="font-size:13px;font-weight:800;color:#A0192E;margin-bottom:8px;">🎯 Turne Skorkartı — ${esc2(tek.t.oyun)}</div><div class="ta-kpi-grid" style="margin-bottom:10px;"><div class="ta-kpi"><div class="ta-kpi-val">${tek.gun}</div><div class="ta-kpi-lbl">Gün ×1.5</div></div><div class="ta-kpi"><div class="ta-kpi-val">${tek.kadro}</div><div class="ta-kpi-lbl">Kadro ×2</div></div><div class="ta-kpi"><div class="ta-kpi-val">${tek.temsil}</div><div class="ta-kpi-lbl">Temsil ×3</div></div><div class="ta-kpi"><div class="ta-kpi-val" style="font-size:20px;">${tek.score}</div><div class="ta-kpi-lbl">Toplam Puan</div></div></div><div style="text-align:center;font-size:16px;font-weight:800;">${tek.seviye} · #${scoredT.findIndex(s=>s===tek)+1} sırada</div></div>`;
          return {html:o};
        }
      }
      o=`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">🎯 Turne Skorkartı — En Büyük Turneler</div><div style="font-size:10.5px;color:#8A857C;margin-bottom:8px;padding:0 4px;">Formül: Gün×1.5 + Kadro×2 + Temsil×3</div>`;
      const med=['🥇','🥈','🥉'];
      for(const[i,s] of scoredT.slice(0,8).entries()){
        const m=med[i]||(i+1)+'.';const pct=Math.round(s.score/scoredT[0].score*100);
        o+=`<div class="ta-stat-row"><span class="ta-stat-rank">${m}</span><span class="ta-stat-name">${esc2(s.t.oyun)} <span style="color:#8A857C;font-weight:400;font-size:10.5px;">${s.seviye}</span></span><div class="ta-stat-bar-wrap"><div class="ta-stat-bar" style="width:${pct}%"></div></div><span class="ta-stat-val">${s.score}p</span></div>`;
      }
      return {html:o};
    }

    /* ── CHECKLİST ÜRETİCİ ── */
    if (/(checklist|kontrol\s*list|yapılacak.*list|hazırlık.*list|hazırlık\s*çek|turne.*kontrol|kontrol.*turne|madde.*list)/.test(Q)) {
      const esc2=(s)=>(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const oyunBulCL=findOyun(Q,T);const cityBulCL=findCity(Q,T);
      let tBulCL=null;
      if(oyunBulCL) tBulCL=T.filter(t=>norm(t.oyun)===norm(oyunBulCL)).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0))[0];
      else if(cityBulCL) tBulCL=T.filter(t=>t.il===cityBulCL||(t.duraklar||[]).some(d=>d.il===cityBulCL)).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0))[0];
      const turneIsim=tBulCL?tBulCL.oyun:(cityBulCL?cityBulCL+' Turnesi':'Genel Turne');
      const hasUcak=tBulCL&&tBulCL.gidisUlasim&&/(uçak|ucak|thy|pegasus|sunexpress|hava)/i.test(tBulCL.gidisUlasim);
      const hasOtel=tBulCL&&(tBulCL.otelAdi||(tBulCL.duraklar||[]).some(d=>d.otelAdi));
      const gun=tBulCL?turneGun(tBulCL):3;
      const categories=[
        {cat:'📋 Evrak & Onay',items:['Turne onay belgesi imzalandı','Görevlendirme yazıları hazır','Seyahat emirleri düzenlendi',...(gun>5?['Uzun süreli görev belgesi alındı']:[])]},
        {cat:'👥 Kadro',items:['Katılımcı listesi tamamlandı','İletişim bilgileri güncellendi','Görev dağılımı yapıldı',...(tBulCL&&tBulCL.katilimcilar.length===0?['⚠️ Kadro henüz atanmamış!']:[])]},
        {cat:hasUcak?'✈️ Uçuş':'🚌 Ulaşım',items:[hasUcak?'Uçuş biletleri kesildi':'Otobüs/araç rezervasyonu yapıldı',hasUcak?'Havalimanı ulaşım saati belirlendi':'Hareket saati ekiple paylaşıldı','Dönüş ulaşımı ayarlandı']},
        {cat:'🏨 Konaklama',items:[hasOtel?'Otel rezervasyonu: '+esc2(tBulCL.otelAdi||'Kayıtlı otel'):'Otel rezervasyonu yapıldı','Oda dağılımı belirlendi','Otel iletişim bilgileri alındı']},
        {cat:'🎭 Sahne & Teknik',items:['Sahne teknik rider iletildi','Ses/ışık ekipman listesi hazır','Kostüm ve aksesuar sayımı yapıldı','Dekor taşıma aracı ayarlandı']},
        {cat:'📞 İletişim',items:['Gidilecek şehirdeki yetkiliyle irtibat kuruldu','Acil durum listesi paylaşıldı','WhatsApp grubu oluşturuldu']},
      ];
      let o=`<div style="background:linear-gradient(135deg,#F0FBF4,#FAFFF6);border:1px solid #A8D8B9;border-radius:12px;padding:14px;margin-bottom:8px;"><div style="font-size:13px;font-weight:800;color:#1A5C35;margin-bottom:10px;">📋 ${esc2(turneIsim)} — Kontrol Listesi</div>`;
      for(const cat of categories){
        o+=`<div style="margin-bottom:10px;"><div style="font-size:11px;font-weight:800;color:#2F7D4E;margin-bottom:5px;text-transform:uppercase;letter-spacing:.4px;">${cat.cat}</div>`;
        for(const item of cat.items){
          const isWarn=item.startsWith('⚠️');
          o+=`<div style="display:flex;align-items:flex-start;gap:7px;padding:4px 0;font-size:12px;color:${isWarn?'#C97A12':'#1A1A1A'};"><span style="width:16px;height:16px;border:1.5px solid ${isWarn?'#C97A12':'#A8D8B9'};border-radius:3px;flex-shrink:0;display:inline-block;margin-top:1px;background:${isWarn?'#FFF3E0':'#fff'}"></span>${esc2(item)}</div>`;
        }
        o+=`</div>`;
      }
      o+=`</div>`;
      return {html:o};
    }

    /* ── KADRO KARŞILAŞTIRMA — ortak kişiler ── */
    if (/(kaçaklar.*hamlet.*ortak|hamlet.*kaçaklar.*ortak|ortak.*kadro|kadro.*ortak|ortak.*kişi|kişi.*ortak|iki.*turne.*kim|kesişen|hem.*hem|hangi.*turnede.*birlikte)/.test(Q)) {
      const esc2=(s)=>(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const oyunlar2=[...new Set(T.map(t=>t.oyun).filter(Boolean))];
      const adaylar2=oyunlar2.filter(oy=>{const p=norm(oy).split(/\s+/).filter(p=>p.length>=4);return p.length&&p.every(p=>Q.includes(p));});
      if(adaylar2.length<2){
        const recent2=[...T].filter(t=>t.katilimcilar.length>0).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0)).slice(0,20);
        let o=`<div style="font-size:12.5px;font-weight:700;color:#1A1A1A;margin-bottom:8px;">👥 Ortak kadroyu bulmak için iki turne seç:</div><select id="ta-ort-a" style="width:100%;border:1.5px solid #E8E2D7;border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;background:#FBF8F3;outline:none;cursor:pointer;margin-bottom:6px;"><option value="">1. Turne seç…</option>`;
        for(const t of recent2) o+=`<option value="${esc2(t.oyun+'||'+t.baslangic)}">${esc2(t.oyun)} · ${esc2(t.il||'?')} · ${fmtTarih(t.baslangic)}</option>`;
        o+=`</select><select id="ta-ort-b" style="width:100%;border:1.5px solid #E8E2D7;border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;background:#FBF8F3;outline:none;cursor:pointer;margin-bottom:6px;"><option value="">2. Turne seç…</option>`;
        for(const t of recent2) o+=`<option value="${esc2(t.oyun+'||'+t.baslangic)}">${esc2(t.oyun)} · ${esc2(t.il||'?')} · ${fmtTarih(t.baslangic)}</option>`;
        o+=`</select><button id="ta-ort-go" class="ta-btn ta-btn-primary" style="width:100%;justify-content:center;">👥 Ortak Kadroyu Bul</button>`;
        return {html:o};
      }
      const tA2=T.filter(t=>norm(t.oyun)===norm(adaylar2[0])).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0))[0];
      const tB2=T.filter(t=>norm(t.oyun)===norm(adaylar2[1])).sort((a,b)=>(parseDate(b.baslangic)||0)-(parseDate(a.baslangic)||0))[0];
      if(!tA2||!tB2) return 'Turneler bulunamadı.';
      const setA2=new Set(tA2.katilimcilar.map(k=>norm(k.kisi)));
      const setB2=new Set(tB2.katilimcilar.map(k=>norm(k.kisi)));
      const ortak2=tA2.katilimcilar.filter(k=>setB2.has(norm(k.kisi)));
      const sadA2=tA2.katilimcilar.filter(k=>!setB2.has(norm(k.kisi)));
      const sadB2=tB2.katilimcilar.filter(k=>!setA2.has(norm(k.kisi)));
      let o=`<div style="background:#F0F8FF;border:1px solid #B0D8F0;border-radius:12px;padding:14px;margin-bottom:8px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;text-align:center;"><div style="background:#fff;border-radius:8px;padding:8px;"><div style="font-weight:800;font-size:12px;color:#A0192E">${esc2(tA2.oyun)}</div><div style="font-size:11px;color:#8A857C">${tA2.katilimcilar.length} kişi</div></div><div style="background:#fff;border-radius:8px;padding:8px;"><div style="font-weight:800;font-size:12px;color:#A0192E">${esc2(tB2.oyun)}</div><div style="font-size:11px;color:#8A857C">${tB2.katilimcilar.length} kişi</div></div></div>`;
      if(ortak2.length){o+=`<div style="margin-bottom:8px;"><div style="font-size:11px;font-weight:800;color:#2F7D4E;margin-bottom:5px;">✅ Her iki turnede var (${ortak2.length} kişi):</div>${ortak2.map(k=>`<div style="font-size:12px;padding:2px 0;">• <strong>${esc2(k.kisi)}</strong>${k.gorev?' <span style="color:#8A857C">— '+esc2(k.gorev)+'</span>':''}</div>`).join('')}</div>`;}
      else o+=`<div style="font-size:12px;color:#8A857C;margin-bottom:8px;">⚠️ Bu iki turnede ortak personel yok.</div>`;
      if(sadA2.length) o+=`<div style="margin-bottom:6px;"><div style="font-size:11px;font-weight:700;color:#A0192E;margin-bottom:4px;">Sadece ${esc2(tA2.oyun)}'da (${sadA2.length}):</div>${sadA2.slice(0,5).map(k=>`<span style="font-size:11px;background:#FBE8EB;border-radius:4px;padding:1px 6px;margin:2px;display:inline-block">${esc2(k.kisi)}</span>`).join('')}${sadA2.length>5?`<span style="font-size:11px;color:#8A857C"> +${sadA2.length-5} daha</span>`:''}</div>`;
      if(sadB2.length) o+=`<div><div style="font-size:11px;font-weight:700;color:#3A6FB0;margin-bottom:4px;">Sadece ${esc2(tB2.oyun)}'da (${sadB2.length}):</div>${sadB2.slice(0,5).map(k=>`<span style="font-size:11px;background:#E8F4FD;border-radius:4px;padding:1px 6px;margin:2px;display:inline-block">${esc2(k.kisi)}</span>`).join('')}${sadB2.length>5?`<span style="font-size:11px;color:#8A857C"> +${sadB2.length-5} daha</span>`:''}</div>`;
      o+=`</div>`;
      return {html:o};
    }

    /* ── ŞEHİR HAFIZASI — otel tercihleri ── */
    if (/(şehir.*hafıza|hafıza.*şehir|hangi.*otel.*kaldık|otel.*geçmiş|önceki.*otel|geçmiş.*otel|hangi.*otel.*tercih)/.test(Q)) {
      const esc2=(s)=>(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const cityMem=findCity(Q,T)||null;
      if(!cityMem){
        const ilOtelMap=new Map();
        T.filter(t=>!t.statu.includes('iptal')).forEach(t=>{
          const tum=[{il:t.il,otelAdi:t.otelAdi,otelTel:t.otelTel},...(t.duraklar||[])];
          tum.forEach(d=>{if(d.il&&d.otelAdi){if(!ilOtelMap.has(d.il))ilOtelMap.set(d.il,new Map());const om=ilOtelMap.get(d.il);om.set(d.otelAdi,(om.get(d.otelAdi)||0)+1);}});
        });
        if(!ilOtelMap.size) return 'Otel geçmişi bulunamadı.';
        let o=`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">🏨 Şehir Hafızası — Otel Geçmişi</div>`;
        const sirali=[...ilOtelMap.entries()].sort((a,b)=>[...b[1].values()].reduce((s,n)=>s+n,0)-[...a[1].values()].reduce((s,n)=>s+n,0)).slice(0,8);
        for(const[il,oteller]of sirali){const top=[...oteller.entries()].sort((a,b)=>b[1]-a[1])[0];o+=`<div class="ta-stat-row"><span class="ta-stat-name">📍 <strong>${esc2(il)}</strong></span><span class="ta-stat-val" style="font-size:11px;">${esc2(top[0])}${top[1]>1?' ('+top[1]+'×)':''}</span></div>`;}
        o+=`<div style="font-size:11px;color:#8A857C;margin-top:6px;">Detay için: "Ankara otel geçmişi"</div>`;
        return {html:o};
      }
      const otelMap=new Map();
      T.filter(t=>!t.statu.includes('iptal')).forEach(t=>{
        const tum=[{il:t.il,otelAdi:t.otelAdi,otelTel:t.otelTel,otelAdres:t.otelAdres},...(t.duraklar||[])];
        tum.forEach(d=>{if(norm(d.il||'')===norm(cityMem)&&d.otelAdi){if(!otelMap.has(d.otelAdi))otelMap.set(d.otelAdi,{say:0,tel:d.otelTel||'',adres:d.otelAdres||''});otelMap.get(d.otelAdi).say++;}});
      });
      if(!otelMap.size) return `**${cityMem}** için kayıtlı otel bilgisi bulunamadı.`;
      const sortedO=[...otelMap.entries()].sort((a,b)=>b[1].say-a[1].say);
      let o=`<div style="background:#FBE8EB;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;font-weight:700;color:#7A0E1E;">🏨 ${esc2(cityMem)} — Otel Geçmişi</div>`;
      for(const[ad,info]of sortedO){
        o+=`<div style="background:#fff;border:1px solid #E8E2D7;border-radius:8px;padding:8px 12px;margin-bottom:6px;"><div style="font-weight:700;font-size:12.5px;">${esc2(ad)} ${info.say>1?'<span style="background:#FBE8EB;color:#A0192E;border-radius:4px;padding:1px 6px;font-size:10px;">'+info.say+'× tercih</span>':''}</div>`;
        if(info.tel) o+=`<div style="font-size:11.5px;color:#A0192E;margin-top:3px;">📞 <a class="ta-phone" href="tel:${info.tel}">${fmtTel(info.tel)||info.tel}</a></div>`;
        if(info.adres) o+=`<div style="font-size:11px;color:#6A6560;margin-top:2px;">📍 ${esc2(info.adres)}</div>`;
        o+=`</div>`;
      }
      return {html:o};
    }

    /* ── KİŞİSEL ROZET SİSTEMİ ── */
    if (/(rozet|rozetler|ödül|unvan|başarı|basari|milestone|kilometre.*taş|achievement)/.test(Q)) {
      const esc2=(s)=>(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const kisiAdy=findPerson(Q,T);
      if(kisiAdy){
        const kisiTurne=T.filter(t=>!t.statu.includes('iptal')&&t.katilimcilar.some(k=>norm(k.kisi)===norm(kisiAdy.kisi)));
        const gun=kisiTurne.reduce((s,t)=>s+turneGun(t),0);
        const sehirler=new Set();kisiTurne.forEach(t=>{if(t.il)sehirler.add(t.il);(t.duraklar||[]).forEach(d=>{if(d.il)sehirler.add(d.il);});});
        const temsil=kisiTurne.reduce((s,t)=>s+(t.sayi||0),0);
        const ROZETLER=[
          {emoji:'🌱',ad:'İlk Adım',kos:kisiTurne.length>=1,acik:'İlk turne'},
          {emoji:'🎭',ad:'5 Turne',kos:kisiTurne.length>=5,acik:'5 turnede sahne'},
          {emoji:'🏅',ad:'10 Turne Veteran',kos:kisiTurne.length>=10,acik:'10 turne'},
          {emoji:'🎖️',ad:'20 Turne Ustası',kos:kisiTurne.length>=20,acik:'20 turne'},
          {emoji:'👑',ad:'Efsane',kos:kisiTurne.length>=30,acik:'30 turne'},
          {emoji:'🗺️',ad:'5 Şehir Gezgini',kos:sehirler.size>=5,acik:'5 farklı şehir'},
          {emoji:'🌍',ad:'10 Şehir Kâşifi',kos:sehirler.size>=10,acik:'10 farklı şehir'},
          {emoji:'⏱️',ad:'50 Gün Yolda',kos:gun>=50,acik:'50 gün turnede'},
          {emoji:'🚀',ad:'100 Gün Efsanesi',kos:gun>=100,acik:'100 gün turnede'},
          {emoji:'🎫',ad:'100 Temsil',kos:temsil>=100,acik:'100+ temsil'},
        ];
        const kazanilan=ROZETLER.filter(r=>r.kos);
        const bekleyen=ROZETLER.filter(r=>!r.kos);
        let o=`<div style="background:linear-gradient(135deg,#FBE8EB,#FFF3E8);border:1px solid #E0C4A8;border-radius:12px;padding:14px;margin-bottom:8px;"><div style="font-size:13px;font-weight:800;color:#A0192E;margin-bottom:4px;">🏅 ${esc2(kisiAdy.kisi)} — Rozetler</div><div style="font-size:11px;color:#8A857C;margin-bottom:10px;">${kisiTurne.length} turne · ${gun} gün · ${sehirler.size} şehir</div>`;
        o+=`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">`;
        for(const r of kazanilan) o+=`<div title="${r.acik}" style="display:flex;flex-direction:column;align-items:center;gap:3px;background:#fff;border:1.5px solid #E0C4A8;border-radius:10px;padding:8px 10px;min-width:64px;text-align:center;"><span style="font-size:22px;">${r.emoji}</span><span style="font-size:10px;font-weight:700;color:#7A2E1F">${r.ad}</span></div>`;
        if(!kazanilan.length) o+=`<div style="font-size:12px;color:#8A857C;">Henüz kazanılmış rozet yok — ilk turneye katılımda 🌱 rozeti açılacak!</div>`;
        o+=`</div>`;
        if(bekleyen.length){o+=`<div style="font-size:11px;font-weight:800;color:#8A857C;text-transform:uppercase;letter-spacing:.4px;margin-bottom:5px;">Sonraki hedefler</div>`;for(const r of bekleyen.slice(0,3))o+=`<div style="font-size:11.5px;color:#6A6560;padding:2px 0;">○ ${r.emoji} <strong>${r.ad}</strong> — ${r.acik}</div>`;}
        o+=`</div>`;
        if(kazanilan.length>=3){o+=`<script>setTimeout(()=>{const confetti=document.createElement('div');confetti.style.cssText='position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:99999;';document.body.appendChild(confetti);setTimeout(()=>confetti.remove(),3000);},100);<\/script>`;}
        return {html:o};
      }
      return {html:`<div style="background:linear-gradient(135deg,#FBE8EB,#FFF3E8);border:1px solid #E0C4A8;border-radius:12px;padding:14px;"><div style="font-size:13px;font-weight:800;color:#A0192E;margin-bottom:8px;">🏅 Kişisel Rozet Sistemi</div><div style="font-size:12px;color:#4A4A4A;line-height:1.9;">🌱 <strong>İlk Adım</strong> — İlk turne<br>🎭 <strong>5 Turne</strong><br>🏅 <strong>10 Turne Veteran</strong><br>🎖️ <strong>20 Turne Ustası</strong><br>👑 <strong>Efsane</strong> — 30 turne<br>🗺️ <strong>Gezgin</strong> — 5 şehir<br>🌍 <strong>Kâşif</strong> — 10 şehir<br>⏱️ <strong>50 Gün Yolda</strong><br>🚀 <strong>100 Gün Efsanesi</strong></div><div style="font-size:11px;color:#8A857C;margin-top:8px;">Kullanım: "[İsim] rozeti" yazın</div></div>`};
    }

    /* ── KADRO ISI HARİTASI ── */
    if (/(ısı.*harita|isi.*harita|heatmap|hangi.*ay.*kim|ay.*personel|personel.*ay.*yoğun|aylık.*kadro|kadro.*matris)/.test(Q)) {
      const esc2=(s)=>(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const kisiAy=new Map();
      T.filter(t=>!t.statu.includes('iptal')).forEach(t=>{const d=parseDate(t.baslangic);if(!d)return;const ay=d.getMonth();t.katilimcilar.forEach(k=>{if(!kisiAy.has(k.kisi))kisiAy.set(k.kisi,new Array(12).fill(0));kisiAy.get(k.kisi)[ay]++;});});
      if(!kisiAy.size) return 'Personel verisi bulunamadı.';
      const topK=[...kisiAy.entries()].sort((a,b)=>b[1].reduce((s,n)=>s+n,0)-a[1].reduce((s,n)=>s+n,0)).slice(0,12);
      const maxVal=Math.max(...topK.map(([,v])=>Math.max(...v)),1);
      const getColor=(n)=>{if(!n)return '#F5F5F5';const i=Math.round(n/maxVal*100);if(i<25)return '#FDECEA';if(i<50)return '#F5B7B1';if(i<75)return '#E57373';return '#A0192E';};
      let o=`<div style="background:#fff;border:1px solid #E8E2D7;border-radius:12px;padding:12px;overflow-x:auto;"><div style="font-size:12px;font-weight:800;color:#A0192E;margin-bottom:10px;">🔥 Kadro Isı Haritası — Aylık Yoğunluk</div><table style="border-collapse:collapse;font-size:10px;width:100%;"><tr><td style="padding:2px 4px;font-weight:700;color:#8A857C;min-width:80px;"></td>${AYLAR.map(a=>`<td style="padding:2px 3px;text-align:center;font-weight:700;color:#8A857C;">${a.slice(0,3)}</td>`).join('')}</tr>`;
      for(const[kisi,aylar]of topK){
        const kisimlar=kisi.split(' ');
        const kisaAd=kisimlar.length>=2?kisimlar[0]+' '+kisimlar[kisimlar.length-1]:kisi;
        o+=`<tr><td style="padding:3px 4px;font-weight:600;font-size:10.5px;color:#1A1A1A;white-space:nowrap;max-width:90px;overflow:hidden;text-overflow:ellipsis;" title="${esc2(kisi)}">${esc2(kisaAd)}</td>`;
        for(const n of aylar) o+=`<td style="padding:2px 3px;text-align:center;"><div title="${n} turne" style="width:20px;height:20px;border-radius:4px;background:${getColor(n)};margin:auto;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:${n>=2?'#fff':'#999'};">${n||''}</div></td>`;
        o+=`</tr>`;
      }
      o+=`</table><div style="font-size:10px;color:#8A857C;margin-top:6px;">En aktif ${topK.length} personel. Koyu kırmızı = çok yoğun.</div></div>`;
      return {html:o};
    }

    return "Cevap bulamadım. **Soru Rehberi** sekmesinden hazır sorulara göz atabilirsin. 💡";


  }

  function findPerson(Q,T) {
    const m=new Map();
    for(const t of T) for(const k of t.katilimcilar){const key=norm(k.kisi);if(!m.has(key))m.set(key,k);}
    // Tam ad eşleşmesi
    for(const[nN,k]of m) if(nN.split(" ").length>=2&&Q.includes(nN)) return k;
    // Parça eşleşmesi (≥4 harf)
    for(const[nN,k]of m) if(nN.split(" ").filter(p=>p.length>=4).some(p=>Q.includes(p))) return k;
    return null;
  }

  // Sadece isim yazınca (örn "Mehmet") tüm eşleşenleri döndür
  function findPersonAll(Q,T) {
    const m=new Map();
    for(const t of T) for(const k of t.katilimcilar){const key=norm(k.kisi);if(!m.has(key))m.set(key,k);}
    const kelimeler=Q.trim().split(/\s+/).filter(p=>p.length>=3);
    if(!kelimeler.length) return [];
    return [...m.values()].filter(k=>{
      const nN=norm(k.kisi);
      return kelimeler.every(p=>nN.includes(p));
    });
  }

  function findCity(Q,T) {
    const c = new Set();
    for (const t of T) {
      addCityToSet(c, t.il);
      for (const d of t.duraklar || []) addCityToSet(c, d.il);
    }
    const sorted = [...c].sort((a,b) => norm(b).length - norm(a).length);
    for (const city of sorted) if (norm(city).length >= 3 && Q.includes(norm(city))) return city;
    return null;
  }

  // Oyun adı eşleşmesi — sistemdeki oyun adlarını ara
  function findOyun(Q,T) {
    const oyunlar=[...new Set(T.map(t=>t.oyun).filter(Boolean))];
    // Tam eşleşme
    for(const oy of oyunlar) if(Q===norm(oy)) return oy;
    // Kısmi eşleşme (≥4 harf kelime)
    for(const oy of oyunlar){
      const parcalar=norm(oy).split(/\s+/).filter(p=>p.length>=4);
      if(parcalar.length&&parcalar.every(p=>Q.includes(p))) return oy;
    }
    // Tek kelime ≥5 harf
    for(const oy of oyunlar){
      const parcalar=norm(oy).split(/\s+/).filter(p=>p.length>=5);
      if(parcalar.some(p=>Q.includes(p))) return oy;
    }
    return null;
  }

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
    // Hikaye seçici butonu
    const hikayeGo=el.querySelector('#ta-hikaye-go');
    if(hikayeGo){
      hikayeGo.addEventListener('click',()=>{
        const sec=el.querySelector('#ta-hikaye-sec');
        if(!sec||!sec.value){hikayeGo.textContent='Lütfen bir turne seç!';setTimeout(()=>hikayeGo.innerHTML='📖 Hikayeyi Anlat',1500);return;}
        const [oyun,bas]=sec.value.split("||");
        const tSec=DS.turneler.find(x=>x.oyun===oyun&&x.baslangic===bas);
        if(!tSec) return;
        // Doğrudan hikaye render et
        const gun=turneGun(tSec);
        const ulasimIcon=(u)=>u&&/(uçak|ucak|thy|pegasus|sunexpress|hava)/i.test(u)?"✈️":"🚌";
        const ulasimMetin=tSec.gidisUlasim?`${ulasimIcon(tSec.gidisUlasim)} <strong>${esc(tSec.gidisUlasim)}</strong> ile yola çıkılıyor${tSec.gidisSaat?", saat <strong>"+tSec.gidisSaat+"</strong>'de":""}.`:"Ulaşım bilgisi henüz girilmemiş.";
        const otelMetin=tSec.otelAdi?`Konaklama için <strong>${esc(tSec.otelAdi)}</strong> tercih edilmiş${tSec.otelTel?" (📞 "+fmtTel(tSec.otelTel)+")":""}.`:"Otel bilgisi henüz kayıtlı değil.";
        const gorevler=new Map();
        for(const k of tSec.katilimcilar){const g=k.gorev||k.kategori||"Belirtilmemiş";gorevler.set(g,(gorevler.get(g)||0)+1);}
        const gorevMetin=[...gorevler.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([g,n])=>`${n} ${g}`).join(", ");
        const statuRenk=tSec.statu.includes("tamamlan")?"#2F7D4E":tSec.statu.includes("iptal")?"#B53030":tSec.statu==="yarida-kesildi"?"#C97A12":"#A0192E";
        let r=`<div style="background:linear-gradient(135deg,#FBE8EB,#FBF8F3);border:1px solid #E0D5CC;border-radius:12px;padding:14px;line-height:1.9;font-size:12.5px;">`;
        r+=`<div style="font-size:13px;font-weight:800;color:#A0192E;margin-bottom:10px;">📖 ${esc(tSec.oyun)} — Turne Hikayesi</div>`;
        r+=`<p style="margin:0 0 8px">🎭 <strong>${esc(tSec.oyun)}</strong>, ${fmtTarihAralik(tSec.baslangic,tSec.bitis)} tarihleri arasında <strong>${esc(tSec.il||"bilinmeyen bir şehir")}</strong>'de ${tSec.sayi?tSec.sayi+" temsil için ":""}sahne alıyor. Toplam <strong>${gun} günlük</strong> bu turnede <strong>${tSec.katilimcilar.length} kişilik</strong> bir ekip yola çıkıyor.</p>`;
        r+=`<p style="margin:0 0 8px">🧳 ${ulasimMetin}</p>`;
        r+=`<p style="margin:0 0 8px">🏨 ${otelMetin}</p>`;
        if(gorevMetin) r+=`<p style="margin:0 0 8px">🎪 Kadroda <strong>${gorevMetin}</strong> gibi görevler yer alıyor.</p>`;
        if(tSec.not) r+=`<p style="margin:0 0 8px">📝 <em>${esc(tSec.not)}</em></p>`;
        r+=`<div style="display:inline-block;margin-top:4px;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:800;color:${statuRenk};background:${statuRenk}18;border:1px solid ${statuRenk}44;">${statuGoster(tSec.statu)}</div>`;
        r+=`</div>`;
        addMsg({html:r},"bot");
      });
    }
    // Karşılaştırma seçici butonu — submit() yerine doğrudan answer() çağır
    const cmpGo = el.querySelector('#ta-cmp-go');
    if(cmpGo) {
      cmpGo.addEventListener('click',()=>{
        const selA=el.querySelector('#ta-cmp-a')?.value;
        const selB=el.querySelector('#ta-cmp-b')?.value;
        if(!selA||!selB){cmpGo.textContent='Lütfen iki turne seç!';setTimeout(()=>cmpGo.textContent='⚖️ Karşılaştır',1500);return;}
        if(selA===selB){cmpGo.textContent='Farklı iki turne seç!';setTimeout(()=>cmpGo.textContent='⚖️ Karşılaştır',1500);return;}
        const [oyunA,basA]=selA.split("||");
        const [oyunB,basB]=selB.split("||");
        const tA=DS.turneler.find(x=>x.oyun===oyunA&&x.baslangic===basA);
        const tB=DS.turneler.find(x=>x.oyun===oyunB&&x.baslangic===basB);
        if(!tA||!tB) return;
        // Doğrudan karşılaştırma HTML'ini render et — submit() çağırma (loop olur)
        const gA=turneGun(tA),gB=turneGun(tB);
        const kA=tA.katilimcilar.length,kB=tB.katilimcilar.length;
        const sA=tA.sayi||0,sB=tB.sayi||0;
        const r=`<div class="ta-cmp-grid">
          <div class="ta-cmp-col"><div class="ta-cmp-col-title">🎭 ${esc(tA.oyun)}</div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">📍 Şehir</span><span class="ta-cmp-val">${esc(tA.il||"—")}</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">📅 Tarih</span><span class="ta-cmp-val" style="font-size:10.5px">${fmtTarihAralik(tA.baslangic,tA.bitis)}</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">⏱ Süre</span><span class="ta-cmp-val ${gA>=gB?'better':'worse'}">${gA} gün</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">👥 Kadro</span><span class="ta-cmp-val">${kA} kişi</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">🎫 Temsil</span><span class="ta-cmp-val ${sA>=sB?'better':'worse'}">${sA||"—"}</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">🏨 Otel</span><span class="ta-cmp-val" style="font-size:10.5px">${esc(tA.otelAdi||"—")}</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">📊 Durum</span><span class="ta-cmp-val">${statuGoster(tA.statu)}</span></div>
          </div>
          <div class="ta-cmp-col"><div class="ta-cmp-col-title">🎭 ${esc(tB.oyun)}</div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">📍 Şehir</span><span class="ta-cmp-val">${esc(tB.il||"—")}</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">📅 Tarih</span><span class="ta-cmp-val" style="font-size:10.5px">${fmtTarihAralik(tB.baslangic,tB.bitis)}</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">⏱ Süre</span><span class="ta-cmp-val ${gB>=gA?'better':'worse'}">${gB} gün</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">👥 Kadro</span><span class="ta-cmp-val">${kB} kişi</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">🎫 Temsil</span><span class="ta-cmp-val ${sB>=sA?'better':'worse'}">${sB||"—"}</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">🏨 Otel</span><span class="ta-cmp-val" style="font-size:10.5px">${esc(tB.otelAdi||"—")}</span></div>
            <div class="ta-cmp-row"><span class="ta-cmp-key">📊 Durum</span><span class="ta-cmp-val">${statuGoster(tB.statu)}</span></div>
          </div>
        </div>`;
        addMsg({html:r},"bot");
      });
    }
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
      openInlinePrompt({
        title: "Hatırlatıcıları içe aktar",
        description: "JSON verisini aşağıya yapıştırın.\nKısayol: Ctrl/Cmd + Enter ile onaylayabilirsiniz.",
        placeholder: "[\n  {\"id\":\"...\"}\n]",
        multiline: true,
        okText: "İçe Aktar"
      }).then(raw => {
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
        <div class="ta-remind-icon" style="background:${r.done?"#F0EBE5":isToday?"#FBE8EB":isOverdue?"#FFF0F0":"#F8F4F0"};cursor:pointer;" data-action="edit" data-id="${r.id}" title="Düzenle">${icon}</div>
        <div class="ta-remind-content" style="cursor:pointer;" data-action="edit" data-id="${r.id}">
          <div class="ta-remind-text">${esc(r.text)}</div>
          <div class="ta-remind-meta">${durum}${r.turne?` · <strong>${esc(r.turne)}</strong>`:""}</div>
        </div>
        <div class="ta-remind-actions">
          <button class="ta-remind-btn" data-action="edit" data-id="${r.id}" title="Düzenle" style="color:#A0192E">✎</button>
          ${!r.done?`<button class="ta-remind-btn" data-action="done" data-id="${r.id}" title="Tamamlandı">✓</button>`:`<button class="ta-remind-btn" data-action="undone" data-id="${r.id}" title="Geri al">↩</button>`}
          <button class="ta-remind-btn" data-action="delete" data-id="${r.id}" title="Sil" style="color:#B53030">✕</button>
        </div>`;
      body.appendChild(item);
    }

    body.querySelectorAll("[data-action]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const id=btn.dataset.id, action=btn.dataset.action;
        if (action==="edit") { showEditForm(id); return; }
        let arr=loadReminders();
        if (action==="done"||action==="undone") { arr=arr.map(r=>r.id===id?{...r,done:action==="done"}:r); }
        else if (action==="delete") { arr=arr.filter(r=>r.id!==id); }
        saveReminders(arr); checkReminders(); renderReminders(); _reminderBadgeGuncelle();
      });
    });
  }

  function showEditForm(id) {
    const body=$i("ta-remind-body"); if(!body) return;
    // Zaten açık bir edit form varsa kapat
    body.querySelector(".ta-remind-edit-form")?.remove();
    const r=loadReminders().find(x=>x.id===id); if(!r) return;
    const turneOptions=DS?DS.turneler.map(t=>`<option value="${esc(t.oyun)}"${r.turne===t.oyun?" selected":""}>${esc(t.oyun)} — ${esc(t.il||"?")} · ${fmtTarih(t.baslangic)}</option>`).join(""):"";
    const form=document.createElement("div");
    form.className="ta-remind-form ta-remind-edit-form";
    form.style.cssText="border-color:#A0192E;background:#FFF8F8;";
    form.innerHTML=`
      <div style="font-size:11px;font-weight:800;color:#A0192E;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px;">✎ Hatırlatıcıyı Düzenle</div>
      <div class="ta-field"><label>Hatırlatıcı Metni</label><input id="ef-text" value="${esc(r.text)}" placeholder="Hatırlatıcı metni…"></div>
      <div class="ta-field-row">
        <div class="ta-field"><label>Tür</label>
          <select id="ef-type">
            <option value="diger" ${(r.type||"diger")==="diger"?"selected":""}>🔔 Genel</option>
            <option value="turne" ${r.type==="turne"?"selected":""}>🎭 Turne</option>
            <option value="otel" ${r.type==="otel"?"selected":""}>🏨 Otel</option>
            <option value="ulasim" ${r.type==="ulasim"?"selected":""}>🚌 Ulaşım</option>
            <option value="odeme" ${r.type==="odeme"?"selected":""}>💰 Ödeme</option>
            <option value="toplanti" ${r.type==="toplanti"?"selected":""}>📅 Toplantı</option>
          </select>
        </div>
        <div class="ta-field"><label>Tarih</label><input id="ef-date" type="date" value="${r.date||""}"></div>
      </div>
      ${turneOptions?`<div class="ta-field"><label>İlgili Turne</label><select id="ef-turne"><option value="">— Seçiniz —</option>${turneOptions}</select></div>`:""}
      <div style="display:flex;gap:6px;margin-top:2px;">
        <button class="ta-btn ta-btn-primary" id="ef-save" style="flex:1">💾 Kaydet</button>
        <button class="ta-btn ta-btn-secondary" id="ef-cancel">İptal</button>
      </div>`;
    // İlgili item'ın hemen altına ekle
    const items=[...body.children];
    const targetItem=items.find(el=>el.querySelector?.(`[data-id="${id}"]`));
    if (targetItem) targetItem.after(form);
    else body.insertBefore(form, body.children[2]||null);
    $i("ef-text")?.focus();
    $i("ef-cancel")?.addEventListener("click",()=>form.remove());
    $i("ef-save")?.addEventListener("click",()=>{
      const text=($i("ef-text")?.value||"").trim();
      if (!text) { $i("ef-text").style.borderColor="#A0192E"; return; }
      let arr=loadReminders();
      arr=arr.map(x=>x.id===id?{...x,text,type:$i("ef-type")?.value||x.type,date:$i("ef-date")?.value||x.date,turne:$i("ef-turne")?.value??x.turne}:x);
      saveReminders(arr); checkReminders(); form.remove(); renderReminders(); _reminderBadgeGuncelle();
      showToast("✅ Hatırlatıcı güncellendi",1800);
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
    // Statu bazlı doğru sayımlar — yarida-kesildi tamamlandı SAYILMAZ
    const tamamlanan=T.filter(t=>t.statu.startsWith("tamamlan")).length;
    // Devam ediyor: statu devam/aktif/onaylı VEYA bugün tarih aralığında olan
    const devam=T.filter(t=>{
      if(t.statu.includes("iptal")||t.statu.startsWith("tamamlan")||t.statu==="yarida-kesildi")return false;
      const bas=parseDate(t.baslangic), bit=parseDate(t.bitis)||bas;
      const tarihDevam=bas&&bit&&bas<=now&&bit>=now;
      const statuDevam=t.statu.startsWith("devam")||t.statu==="aktif"||t.statu==="onaylandi"||t.statu==="onay-bekliyor";
      return tarihDevam||statuDevam;
    }).length;
    const iptal=T.filter(t=>t.statu==="iptal").length;
    // Gelecek: iptal olmayan, henüz başlamamış turneler
    const gelecek=T.filter(t=>{
      if(t.statu.includes("iptal")||t.statu.startsWith("tamamlan")||t.statu==="yarida-kesildi")return false;
      const d=parseDate(t.baslangic);
      return d&&d>now;
    }).length;
    const toplamGun=benzersizGunSay(T.filter(t=>!t.statu.includes("iptal")));
    const toplamTemsil=T.filter(t=>!t.statu.includes("iptal")).reduce((s,t)=>s+(t.sayi||0),0);
    const personelSet=new Set();T.filter(t=>!t.statu.includes("iptal")).forEach(t=>t.katilimcilar.forEach(k=>personelSet.add(norm(k.kisi))));

    // Şehir sıklığı
    const ilMap=new Map();
    T.filter(t=>!t.statu.includes("iptal")).forEach(t=>{collectUniqueCitiesFromTour(t).forEach(il=>ilMap.set(il,(ilMap.get(il)||0)+1));});
    const topIller=[...ilMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);

    // Kişi sıklığı — unique turne key ile çift sayımı önle (iptal hariç)
    const kisiTurneSet=new Map();
    T.filter(t=>!t.statu.includes("iptal")).forEach(t=>{
      const turneKey=t.oyun+"||"+t.baslangic;
      t.katilimcilar.forEach(k=>{
        if(!kisiTurneSet.has(k.kisi))kisiTurneSet.set(k.kisi,new Set());
        kisiTurneSet.get(k.kisi).add(turneKey);
      });
    });
    const kisiMap=new Map([...kisiTurneSet.entries()].map(([k,s])=>[k,s.size]));
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
      ${T.filter(t=>t.statu==="yarida-kesildi").length>0?`<div class="ta-kpi-grid" style="margin-bottom:12px;">
        <div class="ta-kpi" style="border-color:#F0C4CB;background:#FFF8F8;grid-column:1/-1;"><div class="ta-kpi-val" style="color:#C97A12">${T.filter(t=>t.statu==="yarida-kesildi").length}</div><div class="ta-kpi-lbl">Yarıda Kesildi ⚠️</div></div>
      </div>`:""}

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
        <div class="ta-stat-row"><span class="ta-stat-name">Ortalama turne süresi (iptal hariç)</span><span class="ta-stat-val">${(()=>{const a=T.filter(t=>!t.statu.includes('iptal'));return a.length?Math.round(a.reduce((s,t)=>s+turneGun(t),0)/a.length):0})()} gün</span></div>
        <div class="ta-stat-row"><span class="ta-stat-name">Turne başına ortalama temsil</span><span class="ta-stat-val">${(()=>{const a=T.filter(t=>!t.statu.includes('iptal'));return a.length?Math.round(a.reduce((s,t)=>s+(t.sayi||0),0)/a.length):0})()}</span></div>
        <div class="ta-stat-row"><span class="ta-stat-name">Turne başına ortalama kadro</span><span class="ta-stat-val">${(()=>{const a=T.filter(t=>!t.statu.includes('iptal'));return a.length?Math.round(a.reduce((s,t)=>s+t.katilimcilar.length,0)/a.length):0})()} kişi</span></div>
        <div class="ta-stat-row"><span class="ta-stat-name">Tamamlanma oranı</span><span class="ta-stat-val">${toplam?Math.round(tamamlanan/toplam*100):0}%</span></div>
        <div class="ta-stat-row"><span class="ta-stat-name">Yarıda kesilen turne</span><span class="ta-stat-val" style="color:#C97A12">${T.filter(t=>t.statu==='yarida-kesildi').length}</span></div>
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
  addMsg({html:"👋 Merhaba! Ben <strong>Turne Asistanı</strong>'yım.\n\n<span style='font-size:12px;color:#8A857C'>Tüm soru örneklerini görmek için üstteki <strong>Soru Rehberi</strong> sekmesine bakabilirsiniz.</span>"},"bot",true);

  const SUGS = [
    { t: "Sabah brifingi ☀️", q: "Sabah brifingi" },
    { t: "Bugün ne var? 📅", q: "Bugün ne var?" },
    { t: "🔔 Hatırlatıcı öner", q: "Hatırlatıcı öner" },
    { t: "Bingo oyna 🎲", q: "Bingo oyna" },
    { t: "📖 Soru Rehberi", open: "sorular" },
  ];
  for (const s of SUGS) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "ta-sug"; b.textContent = s.t;
    b.addEventListener("click", () => {
      if (s.open) document.querySelector(`.ta-tab[data-view="${s.open}"]`)?.click();
      else submit(s.q);
    });
    sugs.appendChild(b);
  }

  loadData().then(()=>{
    setTimeout(_reminderBadgeGuncelle, 1500);
    // Kullanıcı tanıma — sayfadaki kullanıcı adına göre kişisel selamlama
    setTimeout(()=>{
      try {
        const kullanici = document.querySelector('.kullanici-adi, [data-kullanici], #user-name, .navbar .username')?.textContent?.trim()
          || document.querySelector('nav')?.textContent?.match(/Alper\s+\w+/i)?.[0]
          || document.title?.match(/Alper\s+\w+/i)?.[0]
          || "";
        if (!kullanici || !DS) return;
        const normK = norm(kullanici);
        // Sistemdeki turne kaydı var mı?
        const kisiTurneler = DS.turneler.filter(t=>t.katilimcilar.some(k=>norm(k.kisi).includes(normK.split(" ")[0])));
        if (!kisiTurneler.length) return;
        const turne_say = kisiTurneler.filter(t=>!t.statu.includes("iptal")).length;
        const gun_say = kisiTurneler.filter(t=>!t.statu.includes("iptal")).reduce((s,t)=>s+turneGun(t),0);
        const sehirler = new Set(kisiTurneler.flatMap(t=>[...collectUniqueCitiesFromTour(t)]));
        const hosgeldi = document.createElement("div");
        hosgeldi.className = "ta-msg bot";
        hosgeldi.style.cssText = "background:linear-gradient(135deg,#FBE8EB,#FFF3E8);border:1px solid #E0C4A8;font-size:12px;";
        hosgeldi.innerHTML = `<strong style="color:#A0192E">👑 ${esc(kullanici.split(" ")[0])}'e özel:</strong> Sistemde <strong>${turne_say} turnende</strong> <strong>${gun_say} gün</strong> yoldasın, <strong>${sehirler.size} şehir</strong> gördün! 🎭`;
        const msgs2 = document.getElementById("ta-msgs");
        if (msgs2) { msgs2.appendChild(hosgeldi); msgs2.scrollTop = msgs2.scrollHeight; }
      } catch(e) {}
    }, 2500);
  });
  setInterval(()=>{ checkReminders(); _reminderBadgeGuncelle(); }, 60000);

  // Yeni turne kaydedilince veya silinince veriyi yenile
  // 1) turne.html custom event (dispatch edilirse)
  window.addEventListener('turne-saved', ()=>{ loadData(); });
  window.addEventListener('turne-deleted', ()=>{ loadData(); });
  // 2) Manuel yenileme yardımcısı
  window.__taRefreshData = ()=>{ loadData(); showToast("🔄 Veriler yenileniyor…", 1500); };
  // 3) turne.html fetchTurneler / tumUIGuncelle tamamlanınca otomatik algıla:
  //    liste-content'in child sayısı değişince 3 sn sonra yenile
  (function _autoRefreshWatcher() {
    const grid = document.getElementById('liste-content');
    if (!grid) { setTimeout(_autoRefreshWatcher, 2000); return; }
    let _lastCount = grid.children.length;
    new MutationObserver(_debounce(() => {
      const newCount = grid.children.length;
      if (newCount !== _lastCount) {
        _lastCount = newCount;
        setTimeout(() => loadData(), 500); // yarım saniye bekle, fetch tamamlansın
      }
    }, 800)).observe(grid, { childList: true });
  })();
  window.__taAktar = aktarOtelFormuna;
  // Sohbet balonlarındaki inline butonlar için global submit
  window.__taSubmit = function(text){ submit(text); };
  // Hatırlatıcı ekleme — hatırlatıcı öneri butonlarından çağrılır
  window.__taRem = function(safe, gunOnce) {
    if (!DS) { showToast("Veriler yüklenmedi"); return; }
    const parts = safe.split("|");
    const oyunAdi = parts[0];
    const baslangic = parts[1];
    const t = DS.turneler.find(x => norm(x.oyun) === norm(oyunAdi) && x.baslangic === baslangic)
             || DS.turneler.find(x => norm(x.oyun) === norm(oyunAdi));
    if (!t) { showToast("Turne bulunamadı"); return; }
    const sonuc = _addRem(t, gunOnce);
    if (sonuc === "var") {
      showToast(`⚠️ Bu hatırlatıcı zaten mevcut`, 2000);
    } else if (sonuc) {
      showToast(`✅ Hatırlatıcı eklendi: ${gunOnce} gün kala (${t.oyun})`, 2500);
      checkReminders();
      _reminderBadgeGuncelle();
    } else {
      showToast("❌ Hatırlatıcı eklenemedi", 2000);
    }
  };
  // Bingo cevabı kontrol — tip4'te "kim YOK?" sorusu için farklı mesaj
  window.__taBingoCheck = function(secim){
    const b = window.__taBingo;
    if (!b) { showToast("Bingo turu sona ermiş"); return; }
    window.__taBingo = null; // bir kere cevaplandı, iptal et
    if (secim === b.dogru) {
      if (b.tip4) {
        addMsg({html:`✅ **Doğru!** **${esc(secim)}** bu turnede **yok**. Kadro okumasın kalbe! 🔍`}, "bot");
      } else {
        addMsg({html:`🎉 **Doğru!** Cevap: **${esc(b.dogru)}** ${b.kisi?`<br><span style="font-size:11px;color:#8A857C">— ${esc(b.kisi)}</span>`:""}<br><button class="ta-inline-copy" onclick="window.__taSubmit('bingo oyna')">🔄 Yeni soru</button>`}, "bot");
      }
    } else {
      if (b.tip4) {
        addMsg({html:`❌ **Yanlış.** ${esc(secim)} aslında bu turnede **var**. Doğru cevap: **${esc(b.dogru)}** kadro dışında.<br><button class="ta-inline-copy" onclick="window.__taSubmit('bingo oyna')">🔄 Tekrar dene</button>`}, "bot");
      } else {
        addMsg({html:`❌ **Yanlış.** Seçtiğin: ${esc(secim)} · Doğru cevap: **${esc(b.dogru)}** ${b.kisi?`<br><span style="font-size:11px;color:#8A857C">— ${esc(b.kisi)}</span>`:""}<br><button class="ta-inline-copy" onclick="window.__taSubmit('bingo oyna')">🔄 Tekrar dene</button>`}, "bot");
      }
    }
  };
})();
