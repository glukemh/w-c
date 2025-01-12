import State from "/lib/state.js";

/**
 * @template {CustomElementConstructor} T
 * @param {T} Base */
export const linkListMixin = (Base) => {
	/**
	 * @class
	 * @extends Base */
	class LinkList extends Base {
		/** @type {LinkList | null} */
		prev = null;
		/** @type {LinkList | null} */
		next = null;
		get isRoot() { return this.prev === null; }

		#link = this.#newLink();
		get link() { return this.#link; }
		/** @template S */
		#newLink() {
			/** @type {State<S>} */
			const value = new State();
			/** @param {IteratorObject<S, undefined, unknown>} iter */
			const newIter = (iter) => {
				const next = iter.next();
				this.next?.link?.newIter(iter);
				if (next.done) {
					if (!this.isRoot) this.remove();
				} else {
					value.set(next.value);
					if (!this.isConnected) {
						this.prev?.after(this);
					}
					if (!this.next) {
						this.next = /** @type {LinkList} */(this.cloneNode(true));
						this.next.prev = this;
						this.next.link?.newIter(iter);
					}
				}
			};
			return /** @type {Link<S>} */({
				value(callback) {
					return value.subscribe(callback);
				},
				newIter(iter) { newIter(iter); }
			});
		}
	}

	return LinkList;
};

const LinkList = linkListMixin(HTMLElement);
export default LinkList;

/**
 * @template T
 * @typedef Link
 * @prop {State<T>["subscribe"]} value
 * @prop {(iter: IteratorObject<T, undefined, unknown>) => void} newIter
 */
