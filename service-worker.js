const APP_VERSION = '__VERSION__';
const CACHE = `anhgon-${APP_VERSION}`;
const CORE = __CORE__;
const OFFLINE = __OFFLINE__;
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if ((name.startsWith('anhgon-') || name.startsWith('mazanoke-cache-')) && name !== CACHE) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!(OFFLINE.includes(url.pathname) || url.pathname.startsWith('/assets/app/'))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') {
      try { const response = await fetch(event.request); if (response.ok) await cache.put(event.request, response.clone()); return response; }
      catch { return await cache.match(event.request) || new Response('Offline: open a previously saved page.', { status:503, headers:{ 'Content-Type':'text/plain;charset=utf-8' } }); }
    }
    const cached = await cache.match(event.request); if (cached) return cached;
    const response = await fetch(event.request); if (response.ok) await cache.put(event.request, response.clone()); return response;
  })());
});
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CACHE_OFFLINE') event.waitUntil((async () => {
    try { const cache = await caches.open(CACHE); for (const url of OFFLINE) if (!await cache.match(url)) await cache.add(url); event.ports[0]?.postMessage({ ok:true }); }
    catch { event.ports[0]?.postMessage({ ok:false }); }
  })());
});
