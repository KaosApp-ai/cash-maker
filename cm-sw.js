const CACHE_NAME = 'cashmaker-v1';
const ASSETS = [
  './cash-maker.html',
  'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // API calls — network only (always fresh data)
  if (url.hostname.includes('binance') || url.hostname.includes('mexc')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // WebSocket — pass through
  if (e.request.url.startsWith('ws')) return;
  // Static assets — cache first, network fallback
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
