import { provideRoomIdIter } from "/state/room-ids.js";
import ConnectElement from "/assets/connect-element.js";

export default class RoomIdsProvider extends ConnectElement {
	connectedCallback() {
		this.connectSignal.addEventListener("abort", provideRoomIdIter(this), {
			once: true,
		});
	}
}

customElements.define("room-ids-provider", RoomIdsProvider);
