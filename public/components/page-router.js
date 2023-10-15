import lightMixin from "/assets/light-mixin.js";

export default class PageRouter extends lightMixin() {
	static pushState(...args) {
		history.pushState(...args);
		window.dispatchEvent(new PopStateEvent("pushstate"));
	}

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
			this.constructor.currentComponentRoute
		);
		this.connect(document.createElement(customElements.getName(constructor)));
	}
}

customElements.define("page-router", PageRouter);
