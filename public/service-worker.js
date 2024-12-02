import { use, handleFetchEvent } from "/service-worker-lib/router.js";
import roomWSRoute from "/service-worker-lib/room-websocket.js";
const ctx = castToServiceWorker(self);

const cacheName = "v1";
const staticResources = ["/", "/assets/app.js", "/assets/icon-n.svg"];

use("GET", roomWSRoute);

ctx.addEventListener("install", (event) => {
	event.waitUntil(cacheUrls());
});

ctx.addEventListener("fetch", handleFetchEvent);

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
