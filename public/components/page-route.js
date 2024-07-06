import { location } from "../state/route.js";

export default class PageRoute extends HTMLElement {
	locationSubscription = location.subscribe();
	#internals = this.attachInternals();
	async connectedCallback() {
		for await (const loc of this.locationSubscription) {
			this.#internals.states.clear();
			this.#internals.states.add(loc.pathname.replaceAll("/", "_"));
		}
	}
}

customElements.define("page-route", PageRoute);
