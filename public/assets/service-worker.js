/// <reference lib="webworker" />

const cacheName = "v1";
const urlsToCache = ["/assets/r-index.html", "/assets/global.css"];

self.addEventListener("install", (/** @type {ExtendableEvent} */ event) => {
	event.waitUntil(cacheUrls());
});

self.addEventListener("fetch", (/** @type {FetchEvent} */ event) => {
	event.respondWith(cacheElseFetch(event.request));
});

self.addEventListener("activate", (/** @type {ExtendableEvent} */ event) => {
	event.waitUntil(deleteOldCaches());
});

/**
 * Cache files from urls list
 */
async function cacheUrls() {
	const cache = await caches.open(cacheName);
	await cache.addAll(urlsToCache);
}

/**
 * Return response from cache if available, otherwise response from fetch
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheElseFetch(request) {
	return (await caches.match(request)) ?? fetch(request);
}

/**
 * Delete all caches other than the current one
 */
async function deleteOldCaches() {
	const cacheNames = await caches.keys();
	await Promise.all(
		cacheNames
			.filter((name) => name !== cacheName)
			.map((name) => caches.delete(name))
	);
}
