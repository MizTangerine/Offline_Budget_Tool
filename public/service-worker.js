const CACHE_NAME = 'static-cache-v3';
const DATA_CACHE_NAME = 'data-cache-v2';
const FILES_TO_CACHE = [
    "/"
    , "/icons/android-chrome-192x192.png"
    , "/icons/android-chrome-512x512.png"
    , "/images/travel.jpg"
    , "/db.js"
    , "/favicon.ico"
    , "/index.js"
    , "/manifest.webmanifest"
    , "/styles.css"
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // console.log('pre-cache successfull!');
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch((err) => { console.error(err.stack); })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        // console.log('Removed old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// ***fetch
self.addEventListener('fetch', function (event) {
    // console.log('fetch working')
    if (event.request.url.includes('/api/')) {
        // console.log('testing api')
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        // If the response was good, clone it and cache it
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        // Network request failed, get it from the cache
                        return cache.match(event.request);
                    });
            })
        );
        return;
    };

    // if the request is not for the API, serve static assets using 'offline-first' approach.
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // console.log('offline sw 72')
                return response || fetch(event.request);

            })
            .catch((err) => { console.error(err.stack); })
    );
});