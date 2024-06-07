import { location } from "../state/route.js";

export default class PageRoute extends HTMLElement {
	locationSubscription = location.subscribe();
	internals = this.attachInternals();
	async connectedCallback() {
		for await (const loc of this.locationSubscription) {
			console.debug(loc);
			this.internals.states.clear();
			this.internals.states.add(loc.pathname.replaceAll("/", "_"));
			console.debug(this.internals.states);
		}
	}
}

customElements.define("page-route", PageRoute);
