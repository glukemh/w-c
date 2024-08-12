import { setLocation } from "/state/location.js";
import FormAssociated from "/mixins/form-associated.js";

export default class FormParams extends FormAssociated {
	static get observedAttributes() {
		return ["query-params"];
	}

	/**
	 * @param {SubmitEvent} e
	 * @param {HTMLFormElement} form */
	onSubmit(e, form) {
		e.preventDefault();
		const formData = new FormData(form);
		console.debug("FormParams.onSubmit", formData);
		const url = new URL(form.action);
		switch (this.getAttribute("query-params")) {
			case "delete":
				for (const [key, value] of formData) {
					if (typeof value !== "string") continue;
					url.searchParams.delete(key, value);
				}
				break;
			case "replace":
				url.search = "";
			case "append":
			default:
				for (const [key, value] of formData) {
					if (typeof value === "string") {
						url.searchParams.append(key, value);
					}
				}
		}
		console.debug("FormParams.onSubmit", url);
		setLocation(url);
	}
}

customElements.define("form-params", FormParams);
