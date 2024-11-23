/**
 * @template {CustomElementConstructor} T
 * @param {T} Base */
export const formAssociatedMixin = (Base) => {
	/**
	 * @class
	 * @extends {Base}
	 */
	class FormAssociated extends Base {
		static formAssociated = true;
		internals = this.attachInternals();

		/** @param {Event} e */
		handleEvent(e) {
			if (e instanceof SubmitEvent) {
				this.onSubmit(e);
			} else if (e instanceof FormDataEvent) {
				this.onFormData(e);
			}
		}

		/** @param {SubmitEvent} e */
		onSubmit(e) {}
		/** @param {FormDataEvent} e */
		onFormData(e) {}

		/** @param {HTMLFormElement} form */
		formAssociatedCallback(form) {
			super["formAssociatedCallback"]?.(form);
			if (this.internals.form) {
				form.addEventListener("submit", this);
				form.addEventListener("formdata", this);
			} else {
				form.removeEventListener("submit", this);
				form.removeEventListener("formdata", this);
			}
		}
	}
	return FormAssociated;
};

const FormAssociated = formAssociatedMixin(HTMLElement);

export default FormAssociated;
