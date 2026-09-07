const C = 'tulsiseva-v4';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  let url;
  try { url = new URL(e.request.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; /* browser handles fonts and counters natively */
  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(C).then(c => c.put(e.request, cp));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => {
      if (m) return m;
      if (e.request.mode === 'navigate') return caches.match('./');
      return Response.error();
    }))
  );
});
