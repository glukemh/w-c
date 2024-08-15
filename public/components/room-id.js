/** @import { RoomIdContext } from "/state/room-id.js" */
import { roomId } from "/state/room-id.js";
import ConnectElement from "/mixins/connect-element.js";
import RoomIdIter from "/components/room-id-iter.js";

export default class RoomId extends ConnectElement {
	/** @param {RoomIdContext} context */
	async renderRoomId(context) {
		for await (const id of this.whileConnected(roomId(context))) {
			this.textContent = id;
		}
		this.textContent = "";
	}
	connectedCallback() {
		const tag = customElements.getName(RoomIdIter);
		if (!tag) throw new Error("Expected room-id-iter to define an element");
		const context = this.closest(tag);
		if (context instanceof RoomIdIter) {
			this.renderRoomId(context);
		}
	}
}

customElements.define("room-id", RoomId);
