import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import PageRouter from "/components/page-router.js";

const mixin = await mixinForShadowContent("a-route");
export default class ARoute extends mixin() {
	static get observedAttributes() {
		return ["href"];
	}

	a = this.shadowRoot.querySelector("a");

	get href() {
		return this.getAttribute("href");
	}

	set href(value) {
		this.setAttribute("href", value);
	}

	get componentRoute() {
		if (!this.a.pathname) return null;
		return PageRouter.componentRoute(this.a.pathname);
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
