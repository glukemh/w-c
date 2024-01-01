import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("user-message");

export default class UserMessage extends mixin(HTMLElement) {
	#userEl = /** @type {HTMLSpanElement} */ (this.shadow.getElementById("user"));
	#messageEl = /** @type {HTMLSpanElement} */ (
		this.shadow.getElementById("message")
	);

	get user() {
		return this.#userEl.textContent;
	}

	set user(user) {
		this.#userEl.textContent = user;
	}

	get message() {
		return this.#messageEl.textContent;
	}

	set message(message) {
		this.#messageEl.textContent = message;
	}
}

customElements.define("user-message", UserMessage);
