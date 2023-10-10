import PageRouter from "/components/page-router.js";

export default class aRoute extends HTMLElement {
	static get observedAttributes() {
		return ["href"];
	}

	a = null;

	get href() {
		return this.getAttribute("href");
	}

	set href(value) {
		this.setAttribute("href", value);
	}

	get componentPath() {
		if (!this.a?.pathname) return null;
		return PageRouter.componentPathFromPathname(this.a.pathname);
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.a = document.createElement("a");
		this.a.append(document.createElement("slot"));
		this.a.addEventListener("click", (e) => this.handleNavigation(e));
		this.shadowRoot.append(this.a);
	}

	connectedCallback() {
		this.handleHrefChange();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) return;
		switch (name) {
			case "href":
				this.handleHrefChange();
				break;
		}
	}

	handleNavigation(e) {
		e.preventDefault();
		PageRouter.pushState({}, "", this.href);
	}

	async handleHrefChange() {
		this.a.href = this.href;
		if (!this.componentPath) return;
		try {
			await import(this.componentPath);
		} catch (error) {
			console.error("Error pre importing page component", this.componentPath);
		}
	}
}

customElements.define("a-route", aRoute);
