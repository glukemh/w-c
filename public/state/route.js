import { DerivedState, InitialState, forAwait } from "/assets/state.js";

/** @extends DerivedState<URL> */
class LocationState extends DerivedState {
	constructor() {
		super();
		window.addEventListener("popstate", this.nextGet.bind(this));
	}

	get() {
		return new URL(location.href);
	}
}
/** @extends InitialState<string> */
class PathnameState extends InitialState {
	constructor() {
		super(locationUrl.get().pathname);
		forAwait(locationUrl.subscribe(), (url) => {
			this.next(url.pathname);
		});
	}
}

/** @extends InitialState<string> */
class SearchState extends InitialState {
	constructor() {
		super(locationUrl.get().search);
		forAwait(locationUrl.subscribe(), (url) => {
			this.next(url.search);
		});
	}
}

export const locationUrl = new LocationState();
export const pathname = new PathnameState();
export const search = new SearchState();
