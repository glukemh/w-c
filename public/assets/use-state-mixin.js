/**
 * @template {new (...args: any[]) => any} T
 * @param {T} Base
 */
export const useStateMixin = (Base) => {
	/** @extends {Base} */
	class UseStateMixin extends Base {
		#iters = new Set();
		/**
		 * Call callback on each state change. Returns on disconnectedCallback.
		 * @template T
		 * @param {import('/assets/state.js').default<T>} state
		 * @param {(value: T) => void} callback
		 */
		async subscribe(state, callback) {
			const iter = state.subscribe();
			this.#iters.add(iter);
			for await (const value of iter) {
				callback(value);
			}
		}

		disconnectedCallback() {
			for (const iter of this.#iters) {
				iter.return();
			}
			this.#iters.clear();
		}
	}
	return UseStateMixin;
};
