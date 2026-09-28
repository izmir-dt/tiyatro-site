/* Yalnızca "uygulama olarak yüklenebilir" olması için. Önbellek YOK: tüm istekler doğrudan ağa gider, güncellemeler anında gelir. */
self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',function(e){});
