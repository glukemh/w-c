import roomIdIter, { roomIdIterContextTag } from "/state/room-id-iter.js";
import ConnectElement from "/mixins/connect-element.js";

export default class RoomIds extends ConnectElement {
	get [roomIdIterContextTag]() {
		return this;
	}
	connectedCallback() {
		this.connectSignal.addEventListener("abort", roomIdIter.provide(this), {
			once: true,
		});
	}
}

customElements.define("room-ids", RoomIds);
