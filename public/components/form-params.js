import FormAssociated from "/mixins/form-associated.js";

export default class FormParams extends FormAssociated {
	static get observedAttributes() {
		return ["query-params"];
	}

	/** @param {FormDataEvent} e */
	onFormData(e) {
		const { formData, target } = e;
		if (!(target instanceof HTMLFormElement)) return;
		const url = new URL(target.action);
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
	}
}

customElements.define("form-params", FormParams);
