import { handleWebSocketFetch } from "/service-worker-lib/room-websocket.js";
const ctx = castToServiceWorker(self);

console.log("new service worker");
const cacheName = "v1";
const staticResources = ["/", "/assets/app.js", "/assets/icon-n.svg"];

ctx.addEventListener("install", (event) => {
	event.waitUntil(cacheUrls());
});

ctx.addEventListener("fetch", (event) => {
	if (handleWebSocketFetch(event)) return;
	event.respondWith(cacheElseFetch(event.request));
});

ctx.addEventListener("activate", (event) => {
	event.waitUntil(deleteOldCaches());
});

/**
 * Cache files from urls list
 */
async function cacheUrls() {
	const cache = await caches.open(cacheName);
	await cache.addAll(staticResources);
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

/** @param {globalThis} obj */
function castToServiceWorker(obj) {
	return /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (obj));
}
