import { el } from "/assets/node-utils.js";
import PageRouter from "/components/page-router.js";

export default class ARoute extends HTMLElement {
	static get observedAttributes() {
		return ["href"];
	}

	a = el("a");

	get href() {
		return this.getAttribute("href");
	}

	set href(value) {
		this.setAttribute("href", value);
	}

	get componentRoute() {
		if (!this.a?.pathname) return null;
		return PageRouter.componentRoute(this.a.pathname);
	}

	constructor() {
		super();
		this.a.append(el("slot"));
		this.a.addEventListener("click", (e) => this.handleNavigation(e));
		this.attachShadow({ mode: "open" }).append(this.a);
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
		if (!this.componentRoute) return;
		try {
			await import(this.componentRoute);
		} catch (error) {
			console.error("Error pre importing page component", this.componentRoute);
		}
	}
}

customElements.define("a-route", ARoute);
