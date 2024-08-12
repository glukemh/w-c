/**
 * @template {CustomElementConstructor} T
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
		 * Return from iter when disconnected.
		 * @template {Generator<any, void, void> | AsyncGenerator<any, void, void>} T
		 * @param {T} iter
		 * @returns {T} */
		whileConnected(iter) {
			this.#iters.push(iter);
			return iter;
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
		/**
		 * @template {CustomElementConstructor} T
		 * @param {T} constructor
		 * @returns {InstanceType<T>} context element */
		context(constructor) {
			const tag = customElements.getName(constructor);
			if (!tag)
				throw new Error(
					`Expected ${constructor.name} to define a custom element`
				);

			const el = this.closest(tag);

			if (!(el instanceof constructor)) {
				throw new Error(
					`Expected ${this.tagName} to be a descendant of ${tag}`
				);
			}
			return /** @type {InstanceType<T>} */ (el);
		}
	}
	return ConnectElement;
};

const ConnectElement = connectElementMixin(HTMLElement);

export default ConnectElement;
