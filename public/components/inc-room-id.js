import roomIdState from "/assets/room-id-state.js";

export default class IncRoomId extends HTMLElement {
	constructor() {
		super();
		const button = document.createElement("button");
		button.textContent = "+";
		this.append(button);
		button.onclick = () => {
			roomIdState.update((roomId) => roomId + 1);
		};
	}
}

customElements.define("inc-room-id", IncRoomId);
