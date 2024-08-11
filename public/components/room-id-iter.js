import { provideRoomId } from "/state/room-ids.js";
import ConnectElement from "/assets/connect-element.js";
import RoomIdsProvider from "/components/room-ids-provider.js";

export default class RoomIdIter extends ConnectElement {
	connectedCallback() {
		const tag = customElements.getName(RoomIdsProvider);
		if (!tag)
			throw new Error("Expected room-ids-provider to define an element");
		const context = this.closest(tag);
		if (!context) return;
		this.connectSignal.addEventListener("abort", provideRoomId(this, context), {
			once: true,
		});
	}
}

customElements.define("room-id-iter", RoomIdIter);
