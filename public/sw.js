// Stub service worker.
//
// MathQuest doesn't ship a service worker, but browsers (and some installed
// extensions) probe /sw.js automatically — which floods the dev console with
// 404s. This file replies 200 with no-op behaviour and, on activate, removes
// any old service worker that earlier MathQuest builds may have registered.

self.addEventListener('install', () => {
  // Take over immediately so the unregister below runs on this load.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop any cached responses left from previous SWs.
      try {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      } catch {
        /* ignore */
      }
      // Unregister this stub so the browser stops calling it on next load.
      try {
        await self.registration.unregister();
      } catch {
        /* ignore */
      }
      await self.clients.claim();
    })(),
  );
});

// No fetch handler — let the browser handle every request normally.
