import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import PageRouter from "/components/page-router.js";

const mixin = await mixinForShadowContent("join-room");

class JoinRoom extends mixin(HTMLElement) {
	form = /** @type {HTMLFormElement} */ (this.shadow.querySelector("form"));
	/**
	 * Handles the form submission event.
	 * @param {Event} e - The form submission event.
	 * @returns {void}
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(this.form);
		const roomId = /** @type {string} */ (formData.get("room-id"));
		const url = new URL("/room", location.origin);
		url.searchParams.set("id", roomId);
		PageRouter.visit(url);
	};

	connectedCallback() {
		super.connectedCallback?.();
		this.form.addEventListener("submit", this.handleSubmit);
	}

	disconnectedCallback() {
		super.disconnectedCallback?.();
		this.form.removeEventListener("submit", this.handleSubmit);
	}
}

customElements.define("join-room", JoinRoom);

export default JoinRoom;
