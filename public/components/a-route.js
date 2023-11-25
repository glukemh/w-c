import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import PageRouter from "/components/page-router.js";

const mixin = await mixinForShadowContent("a-route");
export default class ARoute extends mixin(HTMLElement) {
	static get observedAttributes() {
		return ["href"];
	}

	a = /** @type {HTMLAnchorElement} */ (this.shadow.querySelector("a"));

	/**
	 * @property {string} href
	 */
	get href() {
		return this.getAttribute("href") || "";
	}

	set href(value) {
		this.setAttribute("href", value);
	}

	/**
	 * The route of the component to be imported.
	 * @property {string | null} componentRoute
	 */
	get componentRoute() {
		if (!this.a.pathname) return null;
		return PageRouter.componentRoute(this.a.pathname);
	}

	constructor() {
		super();
		this.a.addEventListener("click", (e) => this.handleNavigation(e));
	}

	connectedCallback() {
		this.handleHrefChange();
	}

	/**
	 * @type {AttributeChangedCallback}
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) return;
		switch (name) {
			case "href":
				this.handleHrefChange();
				break;
		}
	}

	/**
	 * Prevent full page reload and navigate using PageRouter.pushState.
	 * @param {MouseEvent} e
	 */
	handleNavigation(e) {
		e.preventDefault();
		PageRouter.visit(this.href);
	}

	async handleHrefChange() {
		this.a.href = this.href;
		if (!this.componentRoute) return;
		try {
			await import(this.componentRoute);
		} catch (error) {
			console.error("Error pre importing page component", this.componentRoute);
		}
	}
}

customElements.define("a-route", ARoute);
