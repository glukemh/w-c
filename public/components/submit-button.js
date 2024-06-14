export default class SubmitButton extends HTMLElement {
	static get formAssociated() {
		return true;
	}
	/** @param {SubmitEvent} event */
	formListener = (event) => {
		event.preventDefault();
	};
	internals = this.attachInternals();
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "open" });
		const button = document.createElement("button");
		button.type = "submit";
		button.part.add("button");
		const slot = document.createElement("slot");
		button.appendChild(slot);
		shadow.appendChild(button);
	}

	/** @param {HTMLFormElement} form */
	formAssociatedCallback(form) {
		if (this.internals.form) {
			form.addEventListener("submit", this.formListener);
		} else {
			form.removeEventListener("submit", this.formListener);
		}
	}
}

customElements.define("submit-button", SubmitButton);
