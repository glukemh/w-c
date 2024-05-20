/**
 * @template {new (...args: any[]) => any} B
 * @param {B} Base
 */
export const useStateMixin = (Base) => {
	/** @extends {Base} */
	class UseStateMixin extends Base {
		#iters = new Set();
		/**
		 * Subscribe on connectedCallback. Returns on disconnectedCallback.
		 * @template T
		 * @param {import('/assets/state.js').State<T>} state state to subscribe to
		 * @param {(value: T) => void} callback calls on state change
		 */
		async subscribe(state, callback) {
			const iter = state.subscribe();
			this.#iters.add(iter);
			for await (const value of iter) {
				callback(value);
			}
		}

		disconnectedCallback() {
			super.disconnectedCallback?.();
			for (const iter of this.#iters) {
				iter.return();
			}
			this.#iters.clear();
		}
	}
	return UseStateMixin;
};
