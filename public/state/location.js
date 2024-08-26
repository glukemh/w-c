import { DerivedState } from "/state/state.js";

/** @extends DerivedState<URL> */
class LocationState extends DerivedState {
	constructor() {
		super((a, b) => a.href === b.href);
		window.addEventListener("popstate", () => {
			this.set(new URL(window.location.href));
		});
	}

	/** @param {URL} url */
	async set(url) {
		for await (let current of this.values()) {
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
			break;
		}
	}

	/** @param {() => AsyncGenerator<URL>} source */
	from(source) {
		return super.from(source);
	}
}

export default new LocationState();
