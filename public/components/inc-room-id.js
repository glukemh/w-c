import roomIdState from "/assets/room-id-state.js";
import {
	templateById,
	resetElement,
	cloneAttributes,
	cloneContent,
} from "/assets/element-helpers.js";

export default class IncRoomId extends HTMLElement {
	static get observedAttributes() {
		return ["btn"];
	}
	button = document.createElement("button");
	constructor() {
		super();
		this.append(this.button);
		this.button.addEventListener("click", () => {
			roomIdState.update((roomId) => roomId + 1);
		});
	}
	/**
	 *
	 * @param {string} name
	 * @param {string | null} _oldValue
	 * @param {string | null} newValue
	 */
	attributeChangedCallback(name, _oldValue, newValue) {
		if (name === "btn") {
			/** @type {Attr[]} */
			const attributes = [];
			/** @type {Node[]} */
			const children = [];
			if (newValue === null) {
				this.button.remove();
			} else {
				const template = templateById(this, newValue);
				if (template) {
					attributes.push(...cloneAttributes(template, "data-", true));
					children.push(...cloneContent(template.content));
				}
				this.append(this.button);
			}
			resetElement(this.button, {
				attributes,
				children,
			});
		}
	}
}

customElements.define("inc-room-id", IncRoomId);
