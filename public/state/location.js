/** @import { Setter, Updater, CallbackValues } from "/state/state.js" */
import { callbackValues, take, State } from "/state/state.js";

/** @type {State<URL>} */
const locationState = new State((a, b) => a.href === b.href);
locationState.from(async function* () {
	/** @type {CallbackValues<PopStateEvent>} */
	const { callback, values } = callbackValues();
	window.addEventListener("popstate", callback);
	yield new URL(window.location.href);
	for await (const _ of values()) {
		yield new URL(window.location.href);
	}
});

export function location() {
	return locationState.subscribe();
}

/** @param {URL | Setter<URL>} source */
export async function setLocation(source) {
	if (source instanceof URL) {
		handleSetLocation(source);
		return;
	}
	for await (const url of source()) {
		handleSetLocation(url);
	}
}

/** @param {Updater<URL>} updates */
export async function updateLocation(updates) {
	setLocation(async function* () {
		for await (const update of updates()) {
			for await (const current of take(location())) {
				yield update(current);
			}
		}
	});
}

/** @param {URL} url */
async function handleSetLocation(url) {
	for await (let current of take(location())) {
		current = new URL(current);
		if (current.hash !== url.hash) {
			// trigger hash change if hash is different
			const nextHash = url.hash;
			url.hash = current.hash;
			window.history.pushState({}, "", url);
			window.location.hash = nextHash;
		} else {
			window.history.pushState({}, "", url);
			window.dispatchEvent(new PopStateEvent("popstate"));
		}
	}
}
