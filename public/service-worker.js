const APP_PREFIX = 'BudgetTracker-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION
const DATA_CACHE_NAME = "data-cache-" + VERSION;
const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./icons/icon-72-72.png",
  "./icons/icon-96-96.png",
  "./icons/icon-128-128.png",
  "./icons/icon-144-144.png",
  "./icons/icon-152-152.png",
  "./icons/icon-192-192.png",
  "./icons/icon-384-384.png",
  "./icons/icon-512-512.png",
  "./js/index.js",
  "./js/idb.js",
  "./manifest.json"
];

self.addEventListener("fetch", function(e) {
  if (e.request.url.includes("/api/")) {
    e.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(e.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(e.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            return cache.match(e.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request).then(function(response) {
        if (response) {
          return response;
        } else if (e.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});

// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      })
      // add current cache name to keeplist
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(keyList.map(function (key, i) {
        if (cacheKeeplist.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i] );
          return caches.delete(keyList[i]);
        }
      }));
    })
  );
});