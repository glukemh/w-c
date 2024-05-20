/**
 * @template T
 */
export class State {
	/**
	 * @template {[...State<any>[]]} T
	 * @param {T} states */
	static async *race(...states) {
		/**
		 * @template S
		 * @typedef {S extends State<infer U> ? U : never} StateValues
		 */
		/**
		 * @template {[...any[]]} Tuple
		 * @typedef { {[Index in keyof Tuple]: StateValues<Tuple[Index]>; } & {length: Tuple['length']}} StateIters
		 */

		let promise = Promise.all(states.map((state) => state.#current));
		while (true) {
			await promise;
			yield /** @type {Promise<StateIters<T>>} */ (
				Promise.all(states.map((state) => state.#current))
			);
			promise = Promise.race(states.map((state) => state.#nextState.promise));
		}
	}

	/** @type {PromiseWithResolvers<T>} */
	#nextState = Promise.withResolvers();
	#current = this.#nextState.promise;

	/** @protected */
	get current() {
		return this.#current;
	}

	/**
	 * @protected
	 * @param {T} value */
	resolve(value) {
		this.#nextState.resolve(value);
		this.#current = this.#nextState.promise;
		this.#nextState = Promise.withResolvers();
	}

	async *subscribe() {
		let promise = this.#current;
		while (true) {
			await promise;
			yield this.#current;
			promise = this.#nextState.promise;
		}
	}
}

/**
 * @template T
 * @extends {State<T>}
 */
export class MutableState extends State {
	/** @type {((s: T) => T)} */
	#composite = (state) => state;
	/** @type {null | (() => void) | ((s: T) => void)} */
	#task = null;
	#unset = true;

	/** Set the state and notify subscribers.
	 * @param {T} state */
	set(state) {
		this.resolve(state);
	}

	/**
	 * @protected
	 * @param {T} state */
	resolve(state) {
		this.#unset = false;
		this.#composite = () => state;
		if (!this.#task) {
			this.#task = () => {
				super.resolve(this.#composite(state));
				this.#task = null;
				this.#composite = (state) => state;
			};
			queueMicrotask(/** @type {() => void} */ (this.#task));
		}
	}

	/** Set state based on the current value.
	 * @param {(state: T) => T} updater function called with current state. */
	update(updater) {
		if (this.#unset) return;
		const f = this.#composite;
		this.#composite = (state) => updater(f(state));
		if (!this.#task) {
			this.#task = (value) => {
				super.resolve(this.#composite(value));
				this.#task = null;
				this.#composite = (state) => state;
			};
			this.current.then(this.#task);
		}
	}
}

/**
 * @template T
 * @param {AsyncGenerator<T, any, any>} iter
 * @param {(state: T) => void} callback
 */
export async function forAwait(iter, callback) {
	for await (const value of iter) {
		callback(value);
	}
}
