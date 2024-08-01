const starting = Symbol("starting state value");

/** @template T */
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
	/** @type {{ promise: Promise<T>, value: T | typeof starting }} */
	#current = {
		value: starting,
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
			this.#current.value !== starting &&
			this.#compare?.(this.#current.value, value)
		) {
			return;
		}
		this.#current.promise = this.#nextState.promise;
		this.#current.value = value;
		this.#nextState.resolve(value);
		this.#nextState = Promise.withResolvers();
	}

	/**
	 * Update a value only after the first value has been set
	 * @param {(state: T) => T } updater */
	update(updater) {
		if (this.#current.value === starting) return;
		this.set(updater(this.#current.value));
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

export function context() {
	const generators = new WeakMap();
	/** @template T */
	return class Context {
		/** @type {WeakMap<WeakKey, () => AsyncGenerator<T>>} */
		get generators() {
			return generators;
		}
		/** @param {WeakKey} key */
		constructor(key) {
			this.key = key;
		}
		subscribe() {
			if (!this.generators.has(this.key)) {
				throw new Error("Invalid key access");
			}
			return /** @type {AsyncGenerator<T>} */ (
				this.generators.get(this.key)?.()
			);
		}
	};
}

/** @template T */
export class Context {
	/** @param {WeakKey} key */
	#getOrCreateSubscriptionPromise(key) {
		let p = this.#contextSubscription.get(key);
		if (!p) {
			p = Promise.withResolvers();
			this.#contextSubscription.set(key, p);
		}
		return p;
	}
	/** @type {WeakMap<WeakKey, PromiseWithResolvers<() => AsyncGenerator<T>>>} */
	#contextSubscription = new WeakMap();

	/** @param {WeakKey} key */
	remove(key) {
		const p = this.#contextSubscription.get(key);
		if (p) {
			p.reject(new Error("Key was never registered"));
		}
		this.#contextSubscription.delete(key);
	}

	/**
	 * @param {WeakKey} key
	 * @param {() => AsyncGenerator<T>} subscription
	 */
	set(key, subscription) {
		this.#getOrCreateSubscriptionPromise(key).resolve(subscription);
	}

	/**
	 * @param {WeakKey} key
	 * @returns {AsyncGenerator<T>} */
	async *subscribe(key) {
		yield* (await this.#getOrCreateSubscriptionPromise(key).promise)();
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
 * @template T
 * @template S
 * @param {AsyncIterable<S>} source any async iterable
 * @param {(sourceState: S) => T} computed compute the next state from source state
 * @param {(prev: T, next: T) => boolean} [compare] skip current iteration if true
 * @returns {() => AsyncGenerator<T, void, any>}
 */
export function derive(source, computed, compare) {
	return async function* derived() {
		/** @type {typeof starting | T} */
		let current = starting;
		for await (const val of source) {
			const next = computed(val);
			if (current === starting || !compare?.(current, next)) {
				yield (current = next);
			}
		}
	};
}
