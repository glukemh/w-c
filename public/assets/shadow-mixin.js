/**
 * Returns a class that extends the given base class and mixes in a helper method to replace shadowRoot children with content.
 * @template {new (...args: any[]) => HTMLElement} T extends typeof HTMLElement
 * @param {T} Base base HTMLElement class to extend
 */
export default function shadowMixin(Base) {
	return class ShadowMixin extends Base {
		/**
		 * @property {ShadowRoot} shadow Reference to the shadowRoot.
		 */
		shadow = this.attachShadow({ mode: "open" });

		/**
		 * Connects content to the shadowRoot.
		 * @param {Node} content DOM node content to replace shadowRoot children with (usually a DocumentFragment)
		 */
		connect(content) {
			this.shadow.replaceChildren(content);
		}
	};
}
