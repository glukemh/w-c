import { roomId } from "/assets/room-id.js";
import ShadowSlotElement from "/assets/shadow-slot-mixin.js";
export default class IncRoomId extends ShadowSlotElement {
	constructor() {
		super();
		const { el } = this.shadowSlot("button");
		el.onclick = () => {
			roomId.update((roomId) => (parseInt(roomId) + 1).toString());
		};
	}
}

customElements.define("inc-room-id", IncRoomId);
