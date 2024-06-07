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
	/** @type {{ promise: Promise<T>, value?: T }} */
	#current = {
		promise: this.#nextState.promise,
	};

	/** @protected */
	get current() {
		return this.#current.promise;
	}

	/**
	 * Set values
	 * @protected
	 * @param {T} value */
	resolve(value) {
		this.#current.promise = this.#nextState.promise;
		this.#current.value = value;
		this.#nextState.resolve(value);
		this.#nextState = Promise.withResolvers();
	}

	/**
	 * Update a value only after the first value has been set
	 * @protected
	 * @param {(state: T) => T } updater */
	apply(updater) {
		if ("value" in this.#current) {
			this.resolve(updater(/** @type {T} */ (this.#current.value)));
		}
	}
	async *subscribe() {
		let promise = this.current;
		while (true) {
			await promise;
			yield /** @type {T} */ (this.#current.value);
			promise = this.#nextState.promise;
		}
	}
}

/**
 * @template T
 * @extends {State<T>}
 */
export class MutableState extends State {
	/** @param {T} state */
	set(state) {
		this.resolve(state);
	}
	/** @param {(state: T) => T} updater */
	update(updater) {
		this.apply(updater);
	}
}

/**
 * @template T
 */
export class Context {
	#state;
	/** @param {State<T>} context */
	constructor(context) {
		this.#state = context;
	}

	get() {
		return this.#state;
	}

	/** @param {State<T>} state */
	set(state) {
		this.#state = state;
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
