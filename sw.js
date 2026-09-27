// Service worker: lets the app open offline. Videos always stream from GitHub.
const CACHE = 'golu-v1';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'content.json',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Videos: let the browser stream them directly (needed for seeking on iPhone)
  if (url.pathname.includes('/videos/') || req.headers.has('range')) return;

  const sameOrigin = url.origin === self.location.origin;
  const isImage = req.destination === 'image';
  const isFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');

  // Pages, code and content.json: newest from GitHub, cached copy when offline
  if (sameOrigin && !isImage) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
        )
    );
    return;
  }

  // Thumbnails and fonts: show cached copy instantly, refresh in the background
  if (isImage || isFont) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const fresh = fetch(req)
            .then((res) => {
              if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
              return res;
            })
            .catch(() => hit);
          return hit || fresh;
        })
      )
    );
  }
});
