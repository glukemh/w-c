import { roomId } from "/assets/room-id.js";
import TemplateBindElement from "/assets/template-bind-element.js";
export default class IncRoomId extends TemplateBindElement {
	static get observedAttributes() {
		return ["btn"];
	}
	button = document.createElement("button");
	constructor() {
		super();
		this.button.addEventListener("click", () => {
			roomId.update((roomId) => (parseInt(roomId) + 1).toString());
		});
		this.lock("btn", this.button);
	}
}

customElements.define("inc-room-id", IncRoomId);
