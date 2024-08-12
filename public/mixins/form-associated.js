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
		/** @param {SubmitEvent} e */
		#onSubmitCallback = (e) => {
			const { form } = this.internals;
			if (!form) return;
			this.onSubmit(e, form);
		};
		/**
		 * @param {SubmitEvent} e
		 * @param {HTMLFormElement} form */
		onSubmit(e, form) {}
		/** @param {HTMLFormElement} form */
		formAssociatedCallback(form) {
			super["formAssociatedCallback"]?.(form);
			if (this.internals.form) {
				form.addEventListener("submit", this.#onSubmitCallback);
			} else {
				form.removeEventListener("submit", this.#onSubmitCallback);
			}
		}
	}
	return FormAssociated;
};

const FormAssociated = formAssociatedMixin(HTMLElement);

export default FormAssociated;
