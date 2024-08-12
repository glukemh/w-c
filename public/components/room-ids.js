import { provideRoomIds } from "/state/room-ids.js";
import ConnectElement from "/mixins/connect-element.js";

export default class RoomIds extends ConnectElement {
	connectedCallback() {
		this.connectSignal.addEventListener("abort", provideRoomIds(this), {
			once: true,
		});
	}
}

customElements.define("room-ids", RoomIds);
