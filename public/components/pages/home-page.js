import "/components/a-route.js";
import fetchContent from "/assets/fetch-content.js";
const content = await fetchContent("home-page");
export default class HomePage extends HTMLElement {
	static get content() {
		return content.cloneNode(true);
	}
	constructor() {
		super();
	}

	connectedCallback() {
		this.append(this.constructor.content);
	}
}

customElements.define("home-page", HomePage);
