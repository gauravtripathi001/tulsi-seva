const C = 'tulsiseva-v5';
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
  if (url.origin !== self.location.origin) return; /* fonts and counters go straight to the browser */
  const isDoc = e.request.mode === 'navigate';
  /* Page loads bypass the HTTP cache, otherwise a stale index.html can be served
     for the length of its max-age and the daily auto-refresh would never see a
     new version. Sub-resources may still use the normal cache. */
  const req = isDoc ? new Request(url.href, { cache: 'reload', credentials: 'same-origin' }) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      if (r && r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => {
      if (m) return m;
      if (isDoc) return caches.match('./');
      return Response.error();
    }))
  );
});
