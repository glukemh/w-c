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

		link = this.newLink();
		/**
		 * @template S
		 * @param {(set: StateUpdateParams<S>[0], next: [S] | [], current: StateUpdateParams<S>[1] ) => void} [update] */
		newLink(update = (set, v) => v.length && set(v[0])) {
			/** @type {State<S>} */
			const state = new State();
			/** @param {IteratorObject<S, undefined, unknown>} iter */
			const newIter = (iter) => {
				const next = iter.next();
				this.next?.link?.newIter(iter);
				/** @type {[S] | []} */
				let nextValue = [];
				if (next.done) {
					if (!this.isRoot) this.remove();
				} else {
					nextValue = [next.value];
					if (!this.isConnected) {
						this.prev?.after(this);
					}
					if (!this.next) {
						this.next = /** @type {LinkList} */(this.cloneNode(true));
						this.next.prev = this;
						this.next.link?.newIter(iter);
					}
				}
				state.update((set, current) => update(set, nextValue, current));
			};
			return /** @type {Link<S>} */({
				values(callback) {
					return state.subscribe(callback);
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
 * @prop {State<T>["subscribe"]} values
 * @prop {(iter: IteratorObject<T, undefined, unknown>) => void} newIter
 */

/** 
 * @template T
 * @typedef {Parameters<Parameters<State<T>["update"]>[0]>} StateUpdateParams
 */
