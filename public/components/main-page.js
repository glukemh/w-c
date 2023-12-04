import "/components/main-layout.js";
import "/components/main-nav.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import fetchStylesheet from "/assets/fetch-stylesheet.js";

const [mixin, stylesheet] = await Promise.all([
	mixinForShadowContent("main-page"),
	fetchStylesheet("host-fade-in"),
]);
export default class MainPage extends mixin(HTMLElement) {
	constructor() {
		super();
		this.shadow.adoptedStyleSheets = [stylesheet];
	}
}

customElements.define("main-page", MainPage);
