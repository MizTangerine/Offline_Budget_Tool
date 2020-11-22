const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v0";
const FILES_TO_CACHE = [
    "/"
    , "/icons/icon-192x192.png"
    , "/icons/icon-512x512.png"
    , "/db.js"
    , "/index.js"
    , "/manifest.webmanifest"
    , "/styles.css"
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// self.addEventListener("activate", function (event) {
//     event.waitUntil(
//         caches.keys().then(keyList => {
//             return Promise.all(
//                 keyList.map(key => {
//                     if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//                         console.log("Removing old cache data", key);
//                         return caches.delete(key);
//                     }
//                 })
//             );
//         })
//     );

//     self.clients.claim();
// });

// // fetch
self.addEventListener("fetch", function (event) {
    console.log('fetch working')
    // cache successful requests to the API
    if (event.request.url.includes("/api/")) {
        console.log('testing api')
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(event.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }

    // if the request is not for the API, serve static assets using "offline-first" approach.
    // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});