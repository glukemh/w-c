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
		const promise = Promise.withResolvers();
		/** @param {ReturnType<State['subscribe']>} iter */
		async function iterate(iter) {
			for await (const value of iter) {
				promise.resolve(value);
				const p = Promise.withResolvers();
				promise.promise = p.promise;
				promise.resolve = p.resolve;
				promise.reject = p.reject;
			}
		}

		const iters = states.map((state) => state.subscribe());

		Promise.all(iters.map((iter) => iter.next())).then(promise.resolve);
		iters.forEach(iterate);
		try {
			while (true) {
				await promise.promise;
				yield /** @type {Promise<StateIters<T>>} */ (
					Promise.all(states.map((state) => state.#current))
				);
			}
		} finally {
			iters.forEach((iter) => iter.return());
		}
	}

	/** @type {PromiseWithResolvers<T>} */
	#nextState = Promise.withResolvers();
	/** @type {{ promise: Promise<T>, value: T } | { promise: Promise<T> }} */
	#current = {
		promise: this.#nextState.promise,
	};
	/** @type {((a: T, b: T) => boolean) | undefined} */
	#compare;

	/** @protected */
	get current() {
		return this.#current.promise;
	}

	/** @param {(a: T, b: T) => boolean} [compare] optionally return whether values are equal to skip resolves */
	constructor(compare) {
		this.#compare = compare;
	}

	/**
	 * Set values
	 * @protected
	 * @param {T} value */
	resolve(value) {
		if (
			"value" in this.#current &&
			this.#compare?.(this.#current.value, value)
		) {
			return;
		}
		this.#current = {
			promise: this.#nextState.promise,
			value,
		};
		this.#nextState.resolve(value);
		this.#nextState = Promise.withResolvers();
	}

	/**
	 * Update a value only after the first value has been set
	 * @protected
	 * @param {(state: T) => T } updater */
	apply(updater) {
		if ("value" in this.#current) {
			this.resolve(updater(this.#current.value));
		}
	}
	async *subscribe() {
		let promise = this.current;
		while (true) {
			await promise;
			if ("value" in this.#current) {
				yield this.#current.value;
			}
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
