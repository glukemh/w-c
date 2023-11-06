/**
 * A mixin for HTML elements, adding a method to replace children with content
 * @template {GConstructor<HTMLElement>} T
 * @param {T} Base
 */
export default function lightMixin(Base) {
	return class LightMixin extends Base {
		/**
		 * Replaces children with content
		 * @param {Node} content DOM node content to replace children with (usually a DocumentFragment)
		 */
		connect(content) {
			this.replaceChildren(content);
		}
	};
}
