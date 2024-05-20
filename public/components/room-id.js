import { roomId } from "/assets/room-id.js";
import { useStateMixin } from "/assets/use-state-mixin.js";

export default class RoomId extends useStateMixin(HTMLElement) {
	connectedCallback() {
		this.subscribe(roomId, (id) => {
			this.textContent = id;
		});
	}
}

customElements.define("room-id", RoomId);
