export default class SlotList extends HTMLElement {
	#shadow = this.attachShadow({ mode: "open" });
	constructor() {
		super();
		this.#newSlot();
	}

	#newSlot() {
		const slot = document.createElement("slot");
		slot.name = this.#shadow.children.length.toString();
		slot.addEventListener("slotchange", this);
		this.#shadow.append(slot);
	}

	/** @param {Event} e */
	handleEvent(e) {
		const { target } = e;
		if (!(target instanceof HTMLSlotElement)) return;
		if (!target.assignedNodes().length) return;
		target.removeEventListener("slotchange", this);
		this.#newSlot();
	}
}

customElements.define("slot-list", SlotList);
