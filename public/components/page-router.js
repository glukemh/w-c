import lightMixin from "/assets/light-mixin.js";

const response = await fetch("/assets/comp.xsl");
const rawXSLT = await response.text();
const processor = new XSLTProcessor();
const xslt = new DOMParser().parseFromString(rawXSLT, "text/xml");
processor.importStylesheet(xslt);
const output = processor.transformToFragment(
	document.implementation.createDocument("", "", null),
	document
);
console.debug(output);
document.body.appendChild(output);

export default class PageRouter extends lightMixin(HTMLElement) {
	/**
	 * Forwards args to history.pushState and dispatches a PopStateEvent with type "pushstate".
	 * @param  {Parameters<typeof history.pushState>} pushStateArgs arguments to be forwarded to history.pushState
	 */
	static pushState(...pushStateArgs) {
		history.pushState(...pushStateArgs);
		window.dispatchEvent(new PopStateEvent("pushstate"));
	}

	/**
	 * Visit page at pathname.
	 * @param {Parameters<typeof history.pushState>[2]} pathname
	 */
	static visit(pathname) {
		this.pushState(null, "", pathname);
	}

	/**
	 * Returns the corresponding component path from a given pathname.
	 * @param {string} pathname a pathname from a url such as location.pathname
	 */
	static componentRoute(pathname) {
		pathname += pathname.endsWith("/") ? "index.js" : ".js";
		return "/components/routes" + pathname;
	}

	static get currentComponentRoute() {
		return this.componentRoute(location.pathname);
	}

	constructor() {
		super();
		window.addEventListener("popstate", () => this.handlePageChange());
		window.addEventListener("pushstate", () => this.handlePageChange());
	}

	connectedCallback() {
		this.handlePageChange();
	}

	async handlePageChange() {
		const { default: constructor } = await import(
			PageRouter.currentComponentRoute
		);
		this.connect(document.createElement(customElements.getName(constructor)));
	}
}

customElements.define("page-router", PageRouter);
