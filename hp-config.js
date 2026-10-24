/* Haftalık Program bildirim ayarları — yalnızca bu dosyayı doldurun (OKU_BENI.md 3. adım).
   Bu dosya GİZLİ BİLGİ İÇERMEZ; servis hesabı .json dosyası buraya ASLA yazılmaz. */
window.HP_CONFIG = {
  pushApi: "https://script.google.com/macros/s/AKfycbxo2fDAIKT-yaV2dyUqvyBI91rnaY-n3hIb1itsK5joX-UsT80P1Kme3NEF73soZogyzA/exec",     // Apps Script > Dağıt > Web uygulaması URL'si (.../exec)
  firebase: {                                         // Firebase > Proje ayarları > Web uygulaması yapılandırması
    apiKey: "AIzaSyAUiYAaA_P_p4NO9kMzyoxRwOxdptMs0P8", authDomain: "haftalik-program-f33f1.firebaseapp.com", projectId: "haftalik-program-f33f1", messagingSenderId: "147701286672", appId: "1:147701286672:web:0a83619cad5dd2f32dc795"
  },
  vapid: "BH0s_wFNTlhDPcbaAsrtvqvBi3LtcvldXlM4ug64z7vPbRhcjAH0uAEA34H-qUl09VM_AMgQE1kcfUaxYVwFdys"          // Firebase > Cloud Messaging > Web Push sertifikaları > Key pair
};
