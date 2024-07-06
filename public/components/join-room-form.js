import { search, location } from "/state/route.js";

export default class JoinRoomForm extends HTMLElement {
	form = document.createElement("form");
	input = document.createElement("input");
	button = document.createElement("button");
	shadow = this.attachShadow({ mode: "open" });
	onDisconnect = () => {};
	constructor() {
		super();
		this.shadow.appendChild(this.form);
		this.form.appendChild(this.input);
		this.form.appendChild(this.button);
		this.input.type = "text";
		this.input.name = "room-id";
		this.input.placeholder = "Enter room";
		this.input.required = true;
		this.button.type = "submit";
		this.button.textContent = "Join";
	}
	connectedCallback() {
		this.form.onsubmit = (event) => {
			event.preventDefault();
			search.appendParam(this.input.name, this.input.value);
		};
	}
}

customElements.define("join-room-form", JoinRoomForm);
