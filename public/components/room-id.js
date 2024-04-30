import { roomId } from "/assets/room-id.js";
import { useStateMixin } from "/assets/use-state-mixin.js";

export default class RoomId extends useStateMixin(HTMLElement) {
	text = new Text();
	connectedCallback() {
		this.append(this.text);
		this.subscribe(roomId, (id) => {
			this.text.data = id;
		});
	}
}

customElements.define("room-id", RoomId);
