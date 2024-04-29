import roomIdState from "/assets/room-id-state.js";
import TemplateBindElement from "/assets/template-bind-element.js";
export default class IncRoomId extends TemplateBindElement {
	static get observedAttributes() {
		return ["btn"];
	}
	button = document.createElement("button");
	text = new Text("Increment Room ID");
	constructor() {
		super();
		this.button.addEventListener("click", () => {
			roomIdState.update((roomId) => roomId + 1);
		});
		this.button.append(this.text);
		this.lock(this.button, "btn");
	}
}

customElements.define("inc-room-id", IncRoomId);
