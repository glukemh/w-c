/** @import { Setter, Updater } from "/state/state.js" */
import { State } from "/state/state.js";

/** @type {State<URL>} */
const locationState = new State((a, b) => a.href === b.href);
locationState.from(async function* () {
	yield new URL(window.location.href);
});
locationState.fromEvent(window, "popstate", async function* (getEvent) {
	while (await getEvent()) {
		yield new URL(window.location.href);
	}
});

export function location() {
	return locationState.subscribe();
}

/** @param {Setter<URL>} urls */
export async function setLocation(urls) {
	for await (const url of urls()) {
		window.history.pushState({}, "", url);
		window.dispatchEvent(new PopStateEvent("popstate"));
	}
}

/** @param {Updater<URL>} updates */
export async function updateLocation(updates) {
	setLocation(async function* () {
		for await (const update of updates()) {
			yield update(await locationState.current);
		}
	});
}
