/**
 * @template {new (...args: any[]) => {}} T
 * @param {T} Base */
export const connectElementMixin = (Base) => {
	/**
	 * @class
	 * @extends {Base}
	 */
	class ConnectElement extends Base {
		/** @type {(Generator<any, void, void> | AsyncGenerator<any, void, void>)[]} */
		#iters = [];
		#connectController = new AbortController();
		get connectSignal() {
			return this.#connectController.signal;
		}
		/**
		 * @template {Generator<any, void, void> | AsyncGenerator<any, void, void>} T
		 * @param {T} iterToReturn
		 * @returns {T} */
		iter(iterToReturn) {
			this.#iters.push(iterToReturn);
			return iterToReturn;
		}
		disconnectedCallback() {
			super["disconnectedCallback"]?.();
			this.#connectController.abort();
			this.#connectController = new AbortController();
			for (const iter of this.#iters) {
				iter.return();
			}
			this.#iters = [];
		}
	}
	return ConnectElement;
};

const ConnectElement = connectElementMixin(HTMLElement);

export default ConnectElement;
