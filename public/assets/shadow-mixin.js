/**
 * A mixin that applies a shadowRoot and a single connect method which replaces shadowRoot children with content.
 * @template {GConstructor<HTMLElement>} T
 * @param {T} Base
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
