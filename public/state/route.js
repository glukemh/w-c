import { State, forAwait } from "/state/state.js";

/** @type {State<URL>} */
const locationState = new State((a, b) => a.href === b.href);
locationState.set(new URL(window.location.href));
window.addEventListener("popstate", () => {
	locationState.set(new URL(window.location.href));
});

export async function* location() {
	yield* locationState.subscribe();
}

/** @type {State<URLSearchParams>} */
const searchState = new State((a, b) => a.toString() === b.toString());

forAwait(location(), (loc) => {
	searchState.set(loc.searchParams);
});

export async function* search() {
	yield* searchState.subscribe();
}

/** @param {URLSearchParams} params */
export async function setSearch(params) {
	const current = await locationState.current;
	current.search = params.toString();
	window.history.pushState({}, "", current);
}

/** @param {URLSearchParams} params */
export async function appendSearch(params) {
	const current = await locationState.current;
	for (const [key, value] of params) {
		current.searchParams.append(key, value);
	}
	window.history.pushState({}, "", current);
}

/** @param {URLSearchParams} params */
export async function deleteSearch(params) {
	const current = await locationState.current;
	for (const [key, value] of params) {
		current.searchParams.delete(key, value);
	}
	window.history.pushState({}, "", current);
}

/** @param {string[]} keys */
export async function clearSearch(keys) {
	const current = await locationState.current;
	for (const key of keys) {
		current.searchParams.delete(key);
	}
	window.history.pushState({}, "", current);
}
