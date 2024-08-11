import { setLocation } from "/state/location.js";
import ConnectElement from "/assets/connect-element.js";

export default class SubmitToHistory extends ConnectElement {
	static get observedAttributes() {
		return ["input-params"];
	}
	static formAssociated = true;

	/** @type {PromiseWithResolvers<SubmitEvent>} */
	#formSubmitPromise = Promise.withResolvers();
	/** @param {SubmitEvent} e */
	#onFormSubmit = (e) => {
		e.preventDefault();
		this.#formSubmitPromise.resolve(e);
		this.#formSubmitPromise = Promise.withResolvers();
	};
	#internals = this.attachInternals();

	async *setLocation() {
		while (this.isConnected) {
			await this.#formSubmitPromise.promise;
			const { form } = this.#internals;
			if (!form) continue;
			const formData = new FormData(form);
			const url = new URL(form.action);
			switch (this.getAttribute("input-params")) {
				case "replace":
					url.search = "";
					break;
				case "append":
				default:
					break;
			}
			for (const [key, value] of formData) {
				if (typeof value === "string") {
					url.searchParams.append(key, value);
				}
			}
			yield url;
		}
	}

	connectedCallback() {
		setLocation(() => this.whileConnected(this.setLocation()));
	}

	/** @param {HTMLFormElement} form */
	formAssociatedCallback(form) {
		if (this.#internals.form) {
			form.addEventListener("submit", this.#onFormSubmit);
		} else {
			form.removeEventListener("submit", this.#onFormSubmit);
		}
	}
}

customElements.define("submit-to-history", SubmitToHistory);
