import roomIdState from "/assets/room-id-state.js";

export default class RoomId extends HTMLElement {
	#disconnect = () => {};
	text = new Text();
	async connectedCallback() {
		const iter = roomIdState.subscribe();
		this.append(this.text);
		this.#disconnect = () => {
			iter.return();
		};
		for await (const roomId of iter) {
			this.text.data = roomId;
		}
	}
	disconnectedCallback() {
		this.#disconnect();
	}
}

customElements.define("room-id", RoomId);
