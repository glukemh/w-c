import roomIdState from "/assets/room-id-state.js";

export default class RoomId extends HTMLElement {
	#disconnect = () => {};
	async connectedCallback() {
		const iter = roomIdState.subscribe();
		this.#disconnect = () => {
			iter.return();
		};
		for await (const roomId of iter) {
			this.textContent = roomId;
		}
	}
	disconnectedCallback() {
		this.#disconnect();
	}
}

customElements.define("room-id", RoomId);
