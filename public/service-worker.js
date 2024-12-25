import routes from "/sw/routes/index.js";

const ctx = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const cacheName = "v1";
const staticResources = ["/", "/assets/app.js", "/assets/icon-n.svg"];

ctx.addEventListener("install", (event) => {
	event.waitUntil(cacheUrls());
});

ctx.addEventListener("fetch", async (event) => {
	const { request, request: { url, method } } = event;
	const { pathname } = new URL(url);
	/** @type {Response | Promise<Response> | null} */
	let response = null;
	if (pathname in routes) {
		const handlers = routes[/** @type {keyof typeof routes} */(pathname)];
		if (method in handlers) {
			response = handlers[/** @type {keyof typeof handlers} */(method)](request);
		}
	}
	if (!response) {
		response = fetch(request);
		// response = cacheElseFetch(request);
	}
	event.respondWith(response);
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

/**
 * Return response from cache if available, otherwise response from fetch
 * @param {Request} request */
async function cacheElseFetch(request) {
	return (await caches.match(request)) ?? fetch(request);
}