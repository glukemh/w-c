export default class OnIndex extends HTMLElement {
	#states = this.attachInternals().states;
	constructor() {
		super();
		if (location.pathname === "/") {
			this.#states.add("index");
		}
	}
}

customElements.define("on-index", OnIndex);
