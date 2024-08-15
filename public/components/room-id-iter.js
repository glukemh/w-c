import {
	provideRoomId,
	roomIdIterResult,
	roomIdContextTag,
} from "/state/room-id.js";
import ConnectElement from "/mixins/connect-element.js";
import RoomIds from "/components/room-ids.js";

export default class RoomIdIter extends ConnectElement {
	get [roomIdContextTag]() {
		return this;
	}
	/** @type {RoomIdIter | undefined} */
	#nextSibling;
	#internals = this.attachInternals();
	root = true;
	async connectNextSibling() {
		for await (const result of this.whileConnected(roomIdIterResult(this))) {
			if (result.done) {
				this.#internals.states.add("empty");
				if (this.root) {
					// keep root connected to listen to room id changes
					continue;
				} else {
					this.remove();
					break;
				}
			} else {
				this.#internals.states.delete("empty");
			}
			if (!this.#nextSibling) {
				this.#nextSibling = /** @type {RoomIdIter} */ (this.cloneNode(true));
				this.#nextSibling.root = false;
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
		if (context instanceof RoomIds) {
			this.connectSignal.addEventListener(
				"abort",
				provideRoomId(this, context),
				{ once: true }
			);
			this.connectNextSibling();
		}
	}
}

customElements.define("room-id-iter", RoomIdIter);
