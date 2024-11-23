/**
 * @template {CustomElementConstructor} T
 * @param {T} Base */
export const linkListMixin = (Base) => {
	/**
	 * @class
	 * @extends {Base} */
	class LinkList extends Base {
		/** @type {LinkList | null} */
		#nextSibling = null;
		root = true;
		/**
		 * Connect next sibling on every iteration. If not the root, removes the element when done.
		 * @protected
		 * @param {AsyncGenerator} iter */
		async connectSibling(iter) {
			try {
				console.debug("~~~ link-list: before", this);
				for await (const _ of iter) {
					console.debug("~~~ link-list: inner", _);
					if (!this.#nextSibling) {
						this.#nextSibling = /** @type {LinkList} */ (this.cloneNode(true));
						this.#nextSibling.root = false;
					}
					if (!this.#nextSibling.isConnected) {
						this.after(this.#nextSibling);
					}
				}
				console.debug("~~~ link-list: after");
			} finally {
				if (!this.root) this.remove();
			}
		}
	}

	return LinkList;
};

const LinkList = linkListMixin(HTMLElement);

export default LinkList;
