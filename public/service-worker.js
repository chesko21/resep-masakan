// service-worker.js

const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Daftar sumber daya lain yang ingin Anda cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.hostname === 'www.youtube.com') {

    const modifiedRequest = new Request(event.request, { mode: 'no-cors' });

    event.respondWith(fetch(modifiedRequest));
  } else {

    event.respondWith(
      fetch(event.request).catch(() => {

      })
    );
  }
});
