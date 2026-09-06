// Emergency Self-Destruct & Rollback Service Worker
// Automatically purges all caches, unregisters itself, and never intercepts requests.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.navigate) {
          client.navigate(client.url);
        }
      });
    })
  );
});

// Do not intercept any fetch requests
self.addEventListener('fetch', () => {
  return;
});
