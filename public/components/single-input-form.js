import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("single-input-form");

/**
 * @typedef {["input-name", "type", "placeholder", "value"]} Attributes
 * @typedef {TupleToUnion<Attributes>} AttributesUnion
 */
class SingleInputForm extends mixin(HTMLElement) {
	/**
	 * @type {Attributes}
	 */
	static get observedAttributes() {
		return ["input-name", "type", "placeholder", "value"];
	}
	form = /** @type {HTMLFormElement} */ (this.shadow.querySelector("form"));
	input = /** @type {HTMLInputElement} */ (this.shadow.querySelector("input"));
	submitButton = /** @type {HTMLButtonElement} */ (
		this.shadow.querySelector("button")
	);

	/**
	 * Re-dispatch form event
	 * @param {SubmitEvent} e
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		this.dispatchEvent(new SubmitEvent(e.type, e));
	};

	connectedCallback() {
		this.form.addEventListener("submit", this.handleSubmit);
	}

	disconnectedCallback() {
		this.form.removeEventListener("submit", this.handleSubmit);
	}

	/**
	 * @type {AttributeChangedCallback<AttributesUnion>}
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "input-name":
				this.input.name = newValue || "";
				break;
			case "type":
			case "placeholder":
			case "value":
				this.input[name] = newValue || "";
				break;
		}
	}
}

customElements.define("single-input-form", SingleInputForm);

export default SingleInputForm;
