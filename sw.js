// uKeep Service Worker — habilita instalação PWA e cache básico
const CACHE_NAME = 'ukeep-shell-v1';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Nunca cachear chamadas ao backend (Apps Script)
  if (req.url.includes('script.google.com')) return;

  // Só tratar GET
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        // Atualiza cache em background para assets do shell
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);

      // Network-first para o index.html (para pegar atualizações), cache-first para o resto
      if (req.mode === 'navigate' || req.url.endsWith('index.html')) {
        return network;
      }
      return cached || network;
    })
  );
});