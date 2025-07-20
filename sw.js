const appName = '_';
const version = '0.0.0';
const staticCacheName = `${appName}_${version}`;
const staticAssets = [];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('Caching shell assets');
      cache.addAll(staticAssets);
    })
  );
});

self.addEventListener('activate', (evt) => {
  console.info('Service Working active');
  evt.waitUntil(
    caches.keys().then((keys) => {
      console.log(`Cache: ${keys}`);
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches
      .match(evt.request)
      .then((cacheResp) => cacheResp ?? fetch(evt.request))
  );
});
