/**
 * Returns a class that extends the given base class and mixes in a helper method to replace children with content.
 * @template {new (...args: any[]) => HTMLElement} T extends typeof HTMLElement
 * @param {T} Base base HTMLElement class to extend
 */
export default function lightMixin(Base) {
	return class LightMixin extends Base {
		/**
		 * Helper method to replace children with content.
		 * @param {Node} content DOM node content to replace children with (usually a DocumentFragment)
		 */
		connect(content) {
			this.replaceChildren(content);
		}
	};
}
