import { location } from "/state/location.js";

export default class PageRoute extends HTMLElement {
	locationSubscription = location();
	#internals = this.attachInternals();
	async connectedCallback() {
		for await (const loc of this.locationSubscription) {
			this.#internals.states.clear();
			this.#internals.states.add(loc.pathname.replaceAll("/", "_"));
		}
	}
}

customElements.define("page-route", PageRoute);
