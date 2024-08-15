import { provideRoomIds, roomIdIterContextTag } from "/state/room-id.js";
import ConnectElement from "/mixins/connect-element.js";

export default class RoomIds extends ConnectElement {
	get [roomIdIterContextTag]() {
		return this;
	}
	connectedCallback() {
		this.connectSignal.addEventListener("abort", provideRoomIds(this), {
			once: true,
		});
	}
}

customElements.define("room-ids", RoomIds);
