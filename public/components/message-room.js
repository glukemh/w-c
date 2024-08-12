import FormAssociated from "/mixins/form-associated.js";

export default class MessageRoom extends FormAssociated {
	/** @param {SubmitEvent} e*/
	onSubmit(e) {
		e.preventDefault();
	}
}
