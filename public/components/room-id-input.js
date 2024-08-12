import { roomId } from "/state/room-ids.js";
import ConnectElement from "/mixins/connect-element.js";
import { formAssociatedMixin } from "/mixins/form-associated.js";
import RoomIdIter from "/components/room-id-iter.js";

export default class RoomIdInput extends formAssociatedMixin(ConnectElement) {
	async setFormValue() {
		const source = this.whileConnected(roomId(this.context(RoomIdIter)));
		for await (const id of source) {
			this.internals.setFormValue(id);
		}
	}
	connectedCallback() {
		this.setFormValue();
	}
}

customElements.define("room-id-input", RoomIdInput);
