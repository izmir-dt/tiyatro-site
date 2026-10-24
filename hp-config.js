/* Haftalık Program bildirim ayarları — yalnızca bu dosyayı doldurun (OKU_BENI.md 3. adım).
   Bu dosya GİZLİ BİLGİ İÇERMEZ; servis hesabı .json dosyası buraya ASLA yazılmaz. */
window.HP_CONFIG = {
  pushApi: "BURAYA_APPS_SCRIPT_WEB_UYGULAMA_URL",     // Apps Script > Dağıt > Web uygulaması URL'si (.../exec)
  firebase: {                                         // Firebase > Proje ayarları > Web uygulaması yapılandırması
    apiKey: "BURAYA", authDomain: "BURAYA", projectId: "BURAYA", messagingSenderId: "BURAYA", appId: "BURAYA"
  },
  vapid: "BURAYA_FIREBASE_WEB_PUSH_ANAHTARI"          // Firebase > Cloud Messaging > Web Push sertifikaları > Key pair
};
