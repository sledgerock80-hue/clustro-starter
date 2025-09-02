const STATIC_CACHE='static-v2'; // bumped
const RUNTIME_CACHE='runtime-v1';
const STATIC_ASSETS=[
  './index.html','./manifest.json',
  './assets/leaflet.js','./assets/leaflet.css',
  './assets/xlsx.full.min.js','./assets/html2canvas.min.js','./assets/jspdf.umd.min.js',
  './assets/logo-192.png','./assets/logo-512.png'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(STATIC_ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![STATIC_CACHE,RUNTIME_CACHE].includes(k)).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch',e=>{
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});