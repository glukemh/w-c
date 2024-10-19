import { location } from "/state/location.js";
import ConnectElement from "/mixins/connect-element.js";

export default class OnIndex extends ConnectElement {
	states = this.attachInternals().states;
	async handleState() {
		for await (const url of this.whileConnected(location())) {
			if (url.pathname === "/") {
				this.states.add("index");
			} else {
				this.states.delete("index");
			}
		}
	}
	connectedCallback() {
		this.handleState();
	}
}

customElements.define("on-index", OnIndex);
