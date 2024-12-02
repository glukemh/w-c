class HandlerContext {
	/**
	 * @param {Request} request
	 * @param {RegExpMatchArray} match
	 */
	constructor(request, match) {
		this.request = request;
		this.match = match;
	}
}

export class Route {
	/**
	 * Route consists of pattern to match on pathname and callback to handle fetch events
	 * @param {RegExp} pattern
	 * @param {FetchHandler} handler */
	constructor(pattern, handler) {
		this.pattern = pattern;
		this.handler = handler;
	}

	/**
	 * Returns wether the url matches the routes pattern
	 * @param {URL} url */
	matches(url) {
		return url.pathname.match(this.pattern);
	}
}

/** @type {Map<string, Route[]>} */
const routes = new Map();

/**
 * Add route to routes map
 * @param {AnyMethod} method
 * @param {Route} route */
export function use(method, route) {
	let r = routes.get(method);
	if (!r) {
		r = [];
		routes.set(method, r);
	}
	r.push(route);
	return use;
}

/**
 * Delegate request to handler with matching pattern
 * @param {FetchEvent} event */
export function handleFetchEvent(event) {
	const { request } = event;
	const url = new URL(request.url);
	for (const route of routes.get(request.method) ?? []) {
		const match = route.matches(url);
		if (match) {
			event.respondWith(route.handler(new HandlerContext(request, match)));
			return;
		}
	}
	event.respondWith(cacheElseFetch(request));
}

/**
 * Return response from cache if available, otherwise response from fetch
 * @param {Request} request */
async function cacheElseFetch(request) {
	return (await caches.match(request)) ?? fetch(request);
}

/**
 * @callback FetchHandler
 * @param {HandlerContext} context
 * @returns {Response | Promise<Response>}
 */

/**
 * @typedef {'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} Method
 */
/**
 * @typedef {Method | string & {}} AnyMethod
 */
