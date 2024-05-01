/**
 * @param {new() => HTMLElement} Base
 */
export const shadowSlotMixin = (Base) => {
	/**
	 * @extends {Base}
	 */
	class ShadowSlotMixin extends Base {
		/**
		 * @template {keyof HTMLElementTagNameMap} T
		 * @param {T} tag
		 * @returns {{shadow: ShadowRoot, el: HTMLElementTagNameMap[T], slotEl: HTMLSlotElement}}
		 */
		shadowSlot(tag) {
			const shadow = this.attachShadow({ mode: "open" });
			const el = document.createElement(tag);
			const slotEl = document.createElement("slot");
			el.setAttribute("part", tag);
			shadow.appendChild(el);
			el.appendChild(slotEl);
			return { shadow, el, slotEl };
		}
	}
	return ShadowSlotMixin;
};

export default class ShadowSlotElement extends shadowSlotMixin(HTMLElement) {}
