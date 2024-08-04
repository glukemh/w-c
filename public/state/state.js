const initial = Symbol("initial state value");

/** @template T */
export class State {
	/** @type {PromiseWithResolvers<T | typeof initial>} */
	#nextState = Promise.withResolvers();
	#current = {
		value: /** @type {T | typeof initial} */ (initial),
		promise: this.#nextState.promise,
	};
	/** @type {((a: T, b: T) => boolean) | undefined} */
	#skip;

	#inert = false;

	/** @returns {Promise<T>} */
	get current() {
		return new Promise(async (resolve, reject) => {
			const value = await this.#current.promise;
			if (value === initial) {
				reject(new Error("State is inert"));
				return;
			}
			resolve(value);
		});
	}

	/** @param {(a: T, b: T) => boolean} [skip] optionally return whether values are equal to skip resolves */
	constructor(skip) {
		this.#skip = skip;
	}

	/**
	 * Set values.
	 * @param {T} value
	 * @returns {boolean} false if state is inert */
	set(value) {
		return this.#set(value);
	}
	/** @param {T | typeof initial} value */
	#set(value) {
		if (
			(this.#current.value === initial ||
				value === initial ||
				!this.#skip?.(this.#current.value, value)) &&
			!this.#inert
		) {
			this.#inert = value === initial;
			this.#current.promise = this.#nextState.promise;
			this.#current.value = value;
			this.#nextState.resolve(value);
			this.#nextState = Promise.withResolvers();
		}
		return !this.#inert;
	}

	/**
	 * Returns all subscriptions. If signal is provided, then return when signal is aborted.
	 * @param {AbortSignal} [signal] */
	return(signal) {
		if (this.#inert) return;
		if (signal && !signal.aborted) {
			signal.addEventListener("abort", () => this.#set(initial), {
				once: true,
			});
		} else {
			this.#set(initial);
		}
	}

	/**
	 * Update a value only after the first value has been set.
	 * @param {(state: T) => T } updater
	 * @returns {boolean} false if state is inert */
	update(updater) {
		if (this.#current.value !== initial) {
			this.set(updater(this.#current.value));
		}
		return !this.#inert;
	}

	/**
	 * Set state from source values returning if state becomes inert.
	 * @param {AsyncGenerator<T>} source */
	async source(source) {
		for await (const value of source) {
			if (!this.set(value)) break;
		}
	}

	async *subscribe() {
		await this.#current.promise;
		while (this.#current.value !== initial) {
			yield this.#current.value;
			await this.#nextState.promise;
		}
	}
}

/** @template T */
export class Context {
	/** @param {WeakKey} key */
	#getOrCreateStatePromise(key) {
		let p = this.#states.get(key);
		if (!p) {
			p = Promise.withResolvers();
			this.#states.set(key, p);
		}
		return p;
	}
	/** @type {WeakMap<WeakKey, PromiseWithResolvers<State<T>> & { value?: State<T> }>} */
	#states = new WeakMap();

	/** @param {WeakKey} key */
	remove(key) {
		const state = this.#states.get(key);
		if (state) {
			if (state.value) {
				state.value.return();
			} else {
				const inertState = new State();
				inertState.return();
				state.resolve(inertState);
			}
		}
		this.#states.delete(key);
	}

	/**
	 * @param {WeakKey} key
	 * @param {AsyncGenerator<T, void>} source
	 */
	set(key, source) {
		if (this.#getOrCreateStatePromise(key).value) {
			this.remove(key);
		}
		const state = this.#getOrCreateStatePromise(key);
		const newState = new State();
		newState.source(source);
		state.value = newState;
		state.resolve(newState);
	}

	/**
	 * @param {WeakKey} key
	 * @returns {ReturnType<State<T>['subscribe']>} */
	async *subscribe(key) {
		yield* (await this.#getOrCreateStatePromise(key).promise).subscribe();
	}
}

/**
 * @template T
 * @param {AsyncGenerator<T>} iter
 * @param {(state: T) => void | boolean} callback
 */
export async function forAwait(iter, callback) {
	for await (const value of iter) {
		if (callback(value)) break;
	}
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
		/** @type {typeof initial | T} */
		let current = initial;
		for await (const val of source) {
			const next = computed(val);
			if (current === initial || !compare?.(current, next)) {
				yield (current = next);
			}
		}
	};
}

/**
 * Yields a tuple of values from async generators every time one of them yields. Returns immediately once any generator is done.
 * Values may be skipped in favor of the most recent if a generator yields multiple times before this generator yields.
 * @template {[...AsyncGenerator<any, void, void>[]]} T
 * @param {T} generators */
export async function* race(...generators) {
	/**
	 * @template S
	 * @typedef {S extends AsyncGenerator<infer U> ? U : never} GeneratorYields
	 */
	/**
	 * @template {[...any[]]} Tuple
	 * @typedef { {[Index in keyof Tuple]: GeneratorYields<Tuple[Index]>; } & {length: Tuple['length']}} ValuesTuple
	 */

	const allUnfinished = generators.map(() => Promise.withResolvers());
	const values = /** @type {ValuesTuple<T>} */ (new Array(generators.length));
	const tuplesIter = tuples();
	generators.forEach(iterate);
	try {
		yield* tuplesIter;
	} catch (e) {
		console.error(e);
	} finally {
		generators.map((iter) => iter.return());
	}

	/**
	 * @param {AsyncGenerator} iter
	 * @param {number} i */
	async function iterate(iter, i) {
		try {
			for await (const value of iter) {
				values[i] = value;
				allUnfinished[i].resolve(true);
				allUnfinished[i] = Promise.withResolvers();
			}
		} catch (e) {
			console.error(e);
		}
		allUnfinished[i].resolve(false);
	}

	async function* tuples() {
		let unfinished = Promise.withResolvers();
		Promise.all(allUnfinished.map((p) => p.promise)).then((arr) => {
			unfinished.resolve(arr.every((x) => x));
		});
		allUnfinished.forEach(async (p) => {
			if (await p.promise) return;
			unfinished.resolve(false);
		});
		while (await unfinished.promise) {
			yield values;
			unfinished = Promise.withResolvers();
			Promise.race(allUnfinished.map((p) => p.promise)).then(
				unfinished.resolve
			);
		}
	}
}
