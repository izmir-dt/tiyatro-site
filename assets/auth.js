(function(){
  var PROTECTED=["/gorevli-olmayan","/arsiv-oyunlar","/admin"];
  var SK="idt_auth",SKEY="idt_pin";
  function getSifre(){return localStorage.getItem(SKEY)||"525327"}
  function isProtected(){var p=location.pathname;return PROTECTED.some(function(r){return p.endsWith(r)})}
  function removeOverlay(){var o=document.getElementById("__auth_ov");if(o)o.remove()}
  function showOverlay(){
    if(!isProtected()||sessionStorage.getItem(SK)==="1")return;
    if(document.getElementById("__auth_ov"))return;
    var ov=document.createElement("div");
    ov.id="__auth_ov";
    ov.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(12,12,22,.98);display:flex;align-items:center;justify-content:center;font-family:Poppins,sans-serif";
    var box=document.createElement("div");
    box.style.cssText="background:#1a1a2e;border:1px solid #2d2d4e;border-radius:16px;padding:38px 34px;width:320px;box-shadow:0 25px 60px rgba(0,0,0,.7)";
    box.innerHTML='<h1 style="color:#e2e2f0;font-size:17px;font-weight:600;margin:0 0 12px;text-align:center">&#128274; Giri&#351; Gerekli</h1>'
      +'<input id="__auth_inp" type="password" placeholder="&#350;ifrenizi girin" maxlength="30" style="width:100%;background:#0e0e24;border:1px solid #2d2d4e;border-radius:8px;color:#e2e2f0;font-size:15px;padding:10px 13px;outline:none;margin-bottom:8px;box-sizing:border-box"/>'
      +'<div id="__auth_err" style="color:#e05c5c;font-size:12px;min-height:18px;margin-bottom:8px"></div>'
      +'<button id="__auth_btn" style="width:100%;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:600;cursor:pointer;background:#5c5cf5;color:#fff;margin-bottom:10px">Giri&#351; Yap</button>'
      +'<div style="display:flex;gap:8px">'
      +'<a href="/tiyatro-site/" style="flex:1;text-align:center;font-size:11px;color:#6868a0;text-decoration:none;padding:6px;border:1px solid #2d2d4e;border-radius:6px">&#8592; Ana Sayfa</a>'
      +'<button id="__auth_sc" style="flex:1;font-size:11px;color:#6868a0;background:none;border:1px solid #2d2d4e;border-radius:6px;cursor:pointer;padding:6px">&#350;ifre De&#287;i&#351;tir</button>'
      +'</div>'
      +'<div id="__auth_sf" style="display:none;margin-top:10px">'
      +'<input id="__auth_si" type="password" placeholder="Yeni &#351;ifre (min 4 karakter)" maxlength="30" style="width:100%;background:#0e0e24;border:1px solid #2d2d4e;border-radius:8px;color:#e2e2f0;font-size:13px;padding:8px 10px;outline:none;margin-bottom:6px;box-sizing:border-box"/>'
      +'<button id="__auth_sb" style="width:100%;border:none;border-radius:6px;padding:8px;font-size:12px;font-weight:600;cursor:pointer;background:#2d2d4e;color:#e2e2f0">Kaydet</button>'
      +'</div>';
    ov.appendChild(box);
    document.body.appendChild(ov);
    var inp=document.getElementById("__auth_inp"),btn=document.getElementById("__auth_btn"),
        err=document.getElementById("__auth_err"),scBtn=document.getElementById("__auth_sc"),
        sfDiv=document.getElementById("__auth_sf"),siInp=document.getElementById("__auth_si"),
        sbBtn=document.getElementById("__auth_sb");
    function chk(){
      if(inp.value===getSifre()){sessionStorage.setItem(SK,"1");removeOverlay()}
      else{inp.style.borderColor="#e05c5c";err.textContent="Hatali sifre!";
        setTimeout(function(){inp.style.borderColor="#2d2d4e";err.textContent=""},2000)}
    }
    btn.addEventListener("click",chk);
    inp.addEventListener("keydown",function(e){if(e.key==="Enter")chk()});
    scBtn.addEventListener("click",function(){sfDiv.style.display=sfDiv.style.display==="none"?"block":"none"});
    sbBtn.addEventListener("click",function(){
      var np=(siInp.value||"").trim();
      if(np.length<4)return;
      localStorage.setItem(SKEY,np);sfDiv.style.display="none";
      err.textContent="Sifre degistirildi!";err.style.color="#4ade80";
      setTimeout(function(){err.textContent="";err.style.color="#e05c5c"},2000);
    });
    setTimeout(function(){inp.focus()},50);
  }
  var _push=history.pushState;
  history.pushState=function(){_push.apply(history,arguments);setTimeout(showOverlay,100)};
  window.addEventListener("popstate",function(){setTimeout(showOverlay,100)});
  document.addEventListener("DOMContentLoaded",showOverlay);
})();
