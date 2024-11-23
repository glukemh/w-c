/** @import { RoomIdIterContext } from "/state/room-id-iter.js" */
import roomId, { roomIdContextTag } from "/state/room-id.js";
import roomIdIter from "/state/room-id-iter.js";
import ConnectElement from "/mixins/connect-element.js";
import { linkListMixin } from "/mixins/link-list.js";
import RoomIds from "/components/room-ids.js";

export default class RoomIdIter extends linkListMixin(ConnectElement) {
	get [roomIdContextTag]() {
		return this;
	}
	#internals = this.attachInternals();
	/**
	 * Add empty state
	 * @protected
	 * @param {RoomIdIterContext} context */
	async handleEmpty(context) {
		for await (const _ of this.whileConnected(roomIdIter.values(context))) {
			this.#internals.states.delete("empty");
			console.debug("~~~ room-id-iter: before");
			await this.connectSibling(this.whileConnected(roomId.values(this)));
			console.debug("~~~ room-id-iter: after");
			this.#internals.states.add("empty");
		}
	}

	connectedCallback() {
		const tag = customElements.getName(RoomIds);
		if (!tag) throw new Error("Expected room-ids to define an element");
		const context = this.closest(tag);
		if (context instanceof RoomIds) {
			this.connectSignal.addEventListener(
				"abort",
				roomId.provide(this, context),
				{ once: true }
			);
			const iter = this.root ? roomIdIter.values(context) : roomId.values(this);
			this.connectSibling(this.whileConnected(iter));
			this.handleEmpty(context);
		}
	}
}

customElements.define("room-id-iter", RoomIdIter);
