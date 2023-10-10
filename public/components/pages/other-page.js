import "/components/a-route.js";
import fetchContent from "/assets/fetch-content.js";
const content = await fetchContent("other-page");
export default class OtherPage extends HTMLElement {
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

customElements.define("other-page", OtherPage);
