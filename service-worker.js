const STATIC_CACHE = 'static-v2';
const RUNTIME_CACHE = 'runtime-v1';

const STATIC_ASSETS = [
  './index.html',
  './manifest.json',
  './assets/leaflet.js',
  './assets/leaflet.css',
  './assets/xlsx.full.min.js',
  './assets/html2canvas.min.js',
  './assets/jspdf.umd.min.js',
  './assets/logo-192.png',
  './assets/logo-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 정적 자원: 캐시 우선
  if (STATIC_ASSETS.some(p => url.pathname.endsWith(p.replace('./','/')))) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
    return;
  }

  // 지도 타일 / 외부 CDN: 네트워크 우선 + 실패 시 캐시
  if (/(tile\.openstreetmap\.org|xdworld\.vworld\.kr|unpkg\.com|cdn\.jsdelivr\.net)/.test(url.host)) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // 기본: 네트워크 → 실패 시 캐시
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

