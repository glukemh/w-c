import { provideRoomId, roomIdIterResult } from "/state/room-ids.js";
import ConnectElement from "/assets/connect-element.js";
import RoomIds from "/components/room-ids.js";

export default class RoomIdIter extends ConnectElement {
	/** @type {RoomIdIter | undefined} */
	#nextSibling;
	async connectNextSibling() {
		console.debug("connectNextSibling");
		for await (const result of this.whileConnected(roomIdIterResult(this))) {
			console.debug("result", result);
			if (result.done) {
				this.remove();
				break;
			}
			if (!this.#nextSibling) {
				this.#nextSibling = /** @type {RoomIdIter} */ (this.cloneNode(true));
			}
			if (!this.#nextSibling.isConnected) {
				this.after(this.#nextSibling);
			}
		}
	}
	connectedCallback() {
		const tag = customElements.getName(RoomIds);
		if (!tag) throw new Error("Expected room-ids to define an element");
		const context = this.closest(tag);
		if (!context) return;
		this.connectSignal.addEventListener("abort", provideRoomId(this, context), {
			once: true,
		});
		this.connectNextSibling();
	}
}

customElements.define("room-id-iter", RoomIdIter);
