import { State, forAwait } from "/state/state.js";

/** @extends State<Location> */
class LocationState extends State {
	constructor() {
		super();
		this.resolve(window.location);
		window.addEventListener("popstate", () => {
			this.resolve(window.location);
		});
	}
}

/** @extends State<URLSearchParams> */
class SearchState extends State {
	constructor() {
		super();
		forAwait(location.subscribe(), (loc) => {
			this.resolve(new URLSearchParams(loc.search));
		});
	}

	/**
	 * Set a search parameter
	 * @param {string} param search param name
	 * @param {string} value search param value
	 */
	setParam(param, value) {
		const url = new URL(window.location.href);
		url.searchParams.set(param, value);
		window.history.pushState(window.history.state, "", url);
	}

	/**
	 * Append a search parameter
	 * @param {string} param search param name
	 * @param {string} value search param value
	 */
	appendParam(param, value) {
		const url = new URL(window.location.href);
		url.searchParams.append(param, value);
		window.history.pushState(window.history.state, "", url);
	}

	/**
	 * Delete a search parameter
	 * @param {string} param search parameter name
	 */
	deleteParam(param) {
		const url = new URL(window.location.href);
		url.searchParams.delete(param);
		window.history.pushState(window.history.state, "", url);
	}
}

export const location = new LocationState();
export const search = new SearchState();
