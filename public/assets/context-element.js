/** @import { Context } from "/state/state.js" */
import { State } from "/state/state.js";

export const contextElementMixin = (Base) => {
	/**
	 * @class
	 * @extends {Base}
	 */
	class ContextElementMixin extends Base {
		/** @param {ParentNode} node */
		whenDefined(node) {
			return Promise.all(
				[...node.querySelectorAll(":not(:defined)")].map((el) => el.localName)
			);
		}

		/**
		 *
		 * @param {ParentNode} parentNode
		 * @param {Node} childNode
		 * @param {Iterable} iter
		 * @param {Context} context
		 */
		async connectWithContext(parentNode, childNode, iter, context) {
			for await (const c of iter) {
				context.set(new State());
				parentNode.appendChild(childNode.cloneNode(true));
			}
		}
	}
};
