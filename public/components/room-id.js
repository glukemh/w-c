import InContext from "/components/in-context.js";
import { roomIds } from "/state/room-ids.js";
import { connectElementMixin } from "/assets/connect-element.js";

export default class RoomId extends connectElementMixin(HTMLElement) {
	onConnect() {
		const contextEl = this.closest("in-context");
		if (contextEl instanceof InContext) {
			const context = contextEl.context(roomIds, () => "");
		}
		return () => {};
	}
}

customElements.define("room-id", RoomId);
