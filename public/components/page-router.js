export default class PageRouter extends HTMLElement {
	static pushState(...args) {
		history.pushState(...args);
		window.dispatchEvent(new PopStateEvent("pushstate"));
	}

	static componentPathFromPathname(pathname) {
		if (pathname === "/") return "/components/pages/home-page.js";
		return `/components/pages${pathname}.js`;
	}

	static get pageComponentPath() {
		return this.componentPathFromPathname(location.pathname);
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
			this.constructor.pageComponentPath
		);
		console.debug("PageRouter", constructor);
		this.replaceChildren(
			document.createElement(customElements.getName(constructor))
		);
	}
}

customElements.define("page-router", PageRouter);
