import "/components/single-input-form.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import PageRouter from "/components/page-router.js";
import SingleInputForm from "/components/single-input-form.js";

const mixin = await mixinForShadowContent("join-room");

class JoinRoom extends mixin(HTMLElement) {
	singleInputForm = /** @type {SingleInputForm} */ (
		this.shadow.querySelector("single-input-form")
	);
	/**
	 * Handles the form submission event.
	 * @param {SubmitEvent} e - The form submission event.
	 * @returns {void}
	 */
	handleSubmit = (e) => {
		const formData = new FormData(this.singleInputForm.form);
		const roomId = /** @type {string} */ (formData.get("room-id"));
		const url = new URL("/room", location.origin);
		url.searchParams.set("id", roomId);
		PageRouter.visit(url);
	};

	connectedCallback() {
		this.singleInputForm.addEventListener("submit", this.handleSubmit);
	}

	disconnectedCallback() {
		this.singleInputForm.removeEventListener("submit", this.handleSubmit);
	}
}

customElements.define("join-room", JoinRoom);

export default JoinRoom;
