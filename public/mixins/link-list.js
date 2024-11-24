/**
 * @template {CustomElementConstructor} T
 * @param {T} Base */
export const linkListMixin = (Base) => {
	/**
	 * @class
	 * @extends Base */
	class LinkList extends Base {
		/** @type {LinkList | null} */
		#nextSibling = null;
		root = true;
		/**
		 * Connect next sibling on every iteration. If not the root, removes the element when done.
		 * @protected
		 * @template T
		 * @param {AsyncGenerator<T>} iter
		 * @param {(val: T) => void} [callback] */
		async connectSibling(iter, callback) {
			const { value, done } = await iter.next();
			if (done) {
				this.remove();
				return;
			}
			callback?.(value);
			if (!this.#nextSibling) {
				this.#nextSibling = /** @type {LinkList} */ (this.cloneNode(true));
				this.#nextSibling.root = false;
			}
			if (!this.#nextSibling.isConnected) {
				this.after(this.#nextSibling);
			}
		}
	}

	return LinkList;
};

const LinkList = linkListMixin(HTMLElement);

export default LinkList;
