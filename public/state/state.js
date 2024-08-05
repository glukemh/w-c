export { State, Context };

const initial = Symbol("initial state value");

class StartingState {
	get inert() {
		return /** @type {const} */ (false);
	}
	/**
	 * @template T
	 * @param {T} value
	 * @returns {ActiveState<T>}
	 */
	set(value) {
		return new ActiveState(value);
	}
	makeInert() {
		return new InertState();
	}
}

/** @template T */
class ActiveState {
	/** @param {T} value */
	constructor(value) {
		this.value = value;
	}
	get inert() {
		return /** @type {const} */ (false);
	}
	makeInert() {
		return new InertState();
	}
}

class InertState {
	get inert() {
		return /** @type {const} */ (true);
	}
}

/**
 * @template T
 * @typedef {StartingState | ActiveState<T> | InertState} CurrentState
 */

/** @template T */
class State {
	/** @type {PromiseWithResolvers<T>} */
	#nextState = Promise.withResolvers();
	#currentPromise = this.#nextState.promise;
	/** @type {CurrentState<T>} */
	#current = new StartingState();

	// #current = {
	// 	value: /** @type {T | typeof initial} */ (initial),
	// 	promise: this.#nextState.promise,
	// };
	/** @type {((a: T, b: T) => boolean) | undefined} */
	#skip;

	get current() {
		return this.#currentPromise;
	}

	/** @param {(a: T, b: T) => boolean} [skip] optionally return whether values are equal to skip resolves */
	constructor(skip) {
		this.#skip = skip;
	}

	/** @param {T} value */
	#set(value) {
		early: if (!this.#current.inert) {
			if (this.#current instanceof StartingState) {
				this.#current = this.#current.set(value);
			} else if (this.#skip?.(this.#current.value, value)) {
				break early;
			} else {
				this.#current.value = value;
			}
			this.#currentPromise = this.#nextState.promise;
			this.#nextState.resolve(value);
			this.#nextState = Promise.withResolvers();
		}
		return this.#current;
	}

	/**
	 * Returns all subscriptions. If signal is provided, then return when signal is aborted.
	 * @param {AbortSignal} [signal] */
	return(signal) {
		if (this.#current.inert) return;
		const handler = () => {
			if (this.#current.inert) return;
			this.#current = this.#current.makeInert();
			this.#nextState.reject(this.#current);
		};
		if (!signal || signal.aborted) {
			handler();
		} else {
			signal.addEventListener("abort", handler, { once: true });
		}
	}

	/**
	 * Set state from source values returning if state becomes inert.
	 * @param {AsyncGenerator<T> | (() => AsyncGenerator<T>)} source set from yielded values
	 */
	async from(source) {
		try {
			const iter = typeof source === "function" ? source() : source;
			for await (const value of iter) {
				if (this.#set(value).inert) break;
			}
		} catch (e) {
			console.error(e);
		}
	}

	/**
	 * Update state based on previous.
	 * @param {AsyncGenerator<(current: T) => T> | (() => AsyncGenerator<(current: T) => T>)} source yield functions to update state
	 * @param {T} initial initial value to use if state is not already set.
	 */
	async dynamic(initial, source) {
		try {
			if (this.#current instanceof StartingState) {
				this.#set(initial);
			}
			const iter = typeof source === "function" ? source() : source;
			for await (const f of iter) {
				if (!(this.#current instanceof ActiveState)) break;
				this.#set(f(this.#current.value));
			}
		} catch (e) {
			console.error(e);
		}
	}

	async *subscribe() {
		try {
			await this.#currentPromise;
			while (this.#current instanceof ActiveState) {
				yield this.#current.value;
				await this.#nextState.promise;
			}
		} catch (e) {
			if (!(e instanceof InertState)) throw e;
		}
	}
}

/** @template T */
class InitialContext {
	/** @type {PromiseWithResolvers<State<T>>} */
	#promise = Promise.withResolvers();
	get promise() {
		return this.#promise.promise;
	}
	/** @param {State<T>} value */
	resolve(value) {
		this.#promise.resolve(value);
		return value;
	}
	/** @param {unknown} reason */
	reject(reason) {
		this.#promise.reject(reason);
	}
}

/** @template T */
class Context {
	/** @param {WeakKey} key */
	#getStateOrInitial(key) {
		let p = this.#states.get(key);
		if (!p) {
			p = new InitialContext();
			this.#states.set(key, p);
		}
		return p;
	}
	/** @type {WeakMap<WeakKey, InitialContext<T> | State<T>>} */
	#states = new WeakMap();

	/** @param {WeakKey} key */
	remove(key) {
		const state = this.#states.get(key);
		if (state instanceof State) {
			state.return();
		} else if (state instanceof InitialContext) {
			state.reject(state);
		}
		this.#states.delete(key);
	}

	/**
	 * @param {WeakKey} key
	 * @param {AsyncGenerator<T, void>} source
	 */
	set(key, source) {
		let state = this.#states.get(key);
		if (state instanceof InitialContext) {
			const newState = new State();
			state.resolve(newState);
			state = newState;
		} else {
			this.remove(key);
			state = new State();
		}
		state.from(source);
		this.#states.set(key, state);
	}

	/**
	 * @param {WeakKey} key
	 * @returns {ReturnType<State<T>['subscribe']>} */
	async *subscribe(key) {
		try {
			let state = this.#getStateOrInitial(key);
			if (state instanceof InitialContext) {
				state = await state.promise;
			}
			yield* state.subscribe();
		} catch (e) {
			if (!(e instanceof InitialContext)) throw e;
		}
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
