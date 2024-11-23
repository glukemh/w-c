import { DerivedState } from "/state/state.js";

/** @extends DerivedState<URL> */
class LocationState extends DerivedState {
	constructor() {
		super((a, b) => a.href === b.href);
		super.set(new URL(window.location.href));
		window.addEventListener("popstate", () => {
			super.set(new URL(window.location.href));
		});
	}

	/** @param {URL} url */
	async set(url) {
		if (location.hash !== url.hash) {
			// trigger hash change if hash is different
			const nextHash = url.hash;
			url.hash = location.hash;
			window.history.pushState({}, "", url);
			window.location.hash = nextHash;
		} else {
			window.history.pushState({}, "", url);
			window.dispatchEvent(new PopStateEvent("popstate"));
		}
	}

	/** @param {() => AsyncGenerator<URL>} source */
	from(source) {
		return super.from(source);
	}
}

export default new LocationState();
