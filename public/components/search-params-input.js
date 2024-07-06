import { search } from "/state/route.js";
import { forAwait } from "/state/state.js";
import ConnectElement from "/assets/connect-element.js";

export default class SearchParamsInput extends ConnectElement {
	static formAssociated = true;
	#internals = this.attachInternals();
	onConnect() {
		const searchIter = search.subscribe();
		forAwait(searchIter, (s) => {
			const formData = new FormData();
			for (const [name, value] of s.entries()) {
				formData.append(name, value);
			}
			this.#internals.setFormValue(formData);
		});
		return () => {
			searchIter.return();
		};
	}
}

customElements.define("search-params-input", SearchParamsInput);
