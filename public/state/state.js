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

	get current() {
		return this.#current.promise;
	}

	/** @param {(a: T, b: T) => boolean} [compare] optionally return whether values are equal to skip resolves */
	constructor(compare) {
		this.#compare = compare;
	}

	/**
	 * Set values
	 * @param {T} value */
	set(value) {
		if (
			"value" in this.#current &&
			this.#compare?.(this.#current.value, value)
		) {
			return;
		}
		this.#current.promise = this.#nextState.promise;
		/** @type {{ promise: Promise<T>, value: T }} */ (this.#current).value =
			value;
		this.#nextState.resolve(value);
		this.#nextState = Promise.withResolvers();
	}

	/**
	 * Update a value only after the first value has been set
	 * @param {(state: T) => T } updater */
	update(updater) {
		if ("value" in this.#current) {
			this.set(updater(this.#current.value));
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
 */
export class Context {
	#state;
	/** @param {T} defaultState */
	constructor(defaultState) {
		this.#state = defaultState;
	}

	/**
	 * @param {T} state
	 * @param {() => void} callback
	 */
	with(state, callback) {
		const prev = this.#state;
		this.#state = state;
		callback();
		this.#state = prev;
	}

	get() {
		return this.#state;
	}
}

/**
 * @template {AsyncIterable} T
 * @param {T} iter
 * @param {(state: T extends AsyncIterable<infer U> ? U : never) => void} callback
 */
export function forAwait(iter, callback) {
	(async () => {
		for await (const value of iter) {
			callback(value);
		}
	})();
	return iter;
}

/**
 * @template {AsyncIterable} T
 * @template {(sourceState: T extends AsyncIterable<infer U> ? U : never) => any} C
 * @param {T} iter
 * @param {C} computed
 * @param {ConstructorParameters<typeof State<C extends () => infer U ? U : never>>[0]} [compare]
 */
export function derive(iter, computed, compare) {
	/** @type {State<C extends () => infer U ? U : never>} */
	const state =
		typeof compare === "function" ? new State(compare) : new State();
	forAwait(iter, (s) => {
		state.set(computed(s));
	});
	return state;
}
