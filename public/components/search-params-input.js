import { queryParams } from "/state/query-params.js";
import ConnectElement from "/mixins/connect-element.js";

export default class SearchParamsInput extends ConnectElement {
	static formAssociated = true;
	#internals = this.attachInternals();
	async queryParams() {
		for await (const s of this.whileConnected(queryParams())) {
			const formData = new FormData();
			for (const [name, value] of s.entries()) {
				formData.append(name, value);
			}
			this.#internals.setFormValue(formData);
		}
	}
	connectedCallback() {
		this.queryParams();
	}
}

customElements.define("search-params-input", SearchParamsInput);
