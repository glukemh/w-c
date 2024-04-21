import subscribe from "/assets/state-dom.js";

export default class RoomId extends HTMLElement {
	#disconnect = () => {};
	connectedCallback() {
		const { unsubscribe } = subscribe("/assets/room-id-state.js", (id) => {
			this.textContent = id;
		});
		this.#disconnect = unsubscribe;
	}
	disconnectedCallback() {
		this.#disconnect();
	}
}

customElements.define("room-id", RoomId);
