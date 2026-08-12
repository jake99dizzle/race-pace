/* Race Pace service worker.
 *
 * Strategy:
 *   - The page itself is network-first, so an update on GitHub shows up as
 *     soon as there is signal. The cached copy is only used as a fallback
 *     when the network fails, which is what makes the app work offline.
 *   - Icons and the manifest are cache-first, since they rarely change and
 *     there is no reason to re-fetch them on every load.
 *
 * Bump CACHE_VERSION when shipping a change. With network-first on the page
 * this is a safety net rather than a requirement, but bumping it forces every
 * device to drop its old copies immediately.
 */

var CACHE_VERSION = 'v2';
var CACHE_NAME = 'race-pace-' + CACHE_VERSION;

// Relative paths so this works from a GitHub Pages project subdirectory.
var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-racepace.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(PRECACHE); })
      // Take over straight away rather than waiting for every tab to close.
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(names.map(function (name) {
          // Drop any cache from an older version.
          if (name !== CACHE_NAME) return caches.delete(name);
          return null;
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  // Only handle GETs. Anything else passes straight through.
  if (request.method !== 'GET') return;

  // Ignore cross-origin requests entirely.
  if (new URL(request.url).origin !== self.location.origin) return;

  var isPage = request.mode === 'navigate' ||
               (request.headers.get('accept') || '').indexOf('text/html') !== -1;

  if (isPage) {
    // Network-first: fresh page when online, cached page when not.
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            // Fall back to the cached shell if this exact URL isn't stored.
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Everything else (icons, manifest): cache-first.
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        // Only store good same-origin responses.
        if (response && response.status === 200 && response.type === 'basic') {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});
