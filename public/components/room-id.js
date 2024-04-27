import roomIdState from "/assets/room-id-state.js";

export default class RoomId extends HTMLElement {
	static get observedAttributes() {
		return ["room"];
	}
	#disconnect = () => {};
	el = document.createElement("span");
	connectedCallback() {
		const unsubscribe = roomIdState.subscribe((roomId) => {
			this.el.textContent = roomId;
		});
		this.#disconnect = () => {
			unsubscribe();
			this.el.remove();
		};
	}
	disconnectedCallback() {
		this.#disconnect();
	}

	/**
	 * @param {string} name
	 * @param {string | null} _oldValue
	 * @param {string | null} newValue
	 */
	attributeChangedCallback(name, _oldValue, newValue) {
		console.debug("attributeChangedCallback", name, newValue);
		if (name === "room") {
			if (newValue) {
				this.el.slot = newValue;
			} else {
				this.el.removeAttribute("slot");
			}
			if (newValue === null) {
				this.el.remove();
			} else if (this.el.parentElement !== this) {
				this.append(this.el);
			}
		}
	}
}

customElements.define("room-id", RoomId);
