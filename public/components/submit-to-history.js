export default class SubmitToHistory extends HTMLElement {
	static get observedAttributes() {
		return ["input-params"];
	}
	static formAssociated = true;
	/** @param {SubmitEvent} e */
	#onFormSubmit = (e) => {
		e.preventDefault();
		const { form } = this.#internals;
		if (!form) return;
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
		history.replaceState({}, "", url);
		if (url.hash) {
			location.hash = url.hash;
		}
	};
	#internals = this.attachInternals();

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
