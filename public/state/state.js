/**
 * @template T
 * @typedef {(a: T, b: T) => boolean} Skip
 */

/** @template T */
export class DerivedState {
	/** @type {PromiseWithResolvers<boolean>} */
	#p = Promise.withResolvers();
	/** @type {T[]} */
	#value = [];
	/** @type {(current: T, next: T) => boolean} */
	#skip;
	/** @param {(current: T, next: T) => boolean} [skip] */
	constructor(skip) {
		this.#skip = skip ?? (() => false);
	}
	async *values() {
		yield* this.#value;
		while (await this.#p.promise) {
			yield* this.#value;
		}
	}
	/** @protected */
	return() {
		this.#value.splice(0);
		this.#p.resolve(false);
		this.#p = Promise.withResolvers();
	}
	/** @param {T} value */
	#set(value) {
		if (this.#value.length && this.#skip(this.#value[0], value)) return;
		this.#value[0] = value;
		this.#p.resolve(true);
		this.#p = Promise.withResolvers();
	}
	/**
	 * @protected
	 * @param {T} value */
	set(value) {
		this.#set(value);
	}
	/**
	 * @protected
	 * @param {() => AsyncGenerator<T>} source */
	async from(source) {
		for await (const value of source()) {
			this.#set(value);
		}
	}

	/**
	 * @template U
	 * @param {() => AsyncGenerator<U, void, void>} source */
	race(source) {
		const values = /** @type {[T, U]} */ (new Array(2));
		const iters = /** @type {const} */ ([this.values(), source()]);
		/** @type {State<[T, U]>} */
		const state = new State();
		state.from(() => setter(0));
		state.from(() => setter(1));

		return state.values();

		/** @param {0 | 1} i */
		async function* setter(i) {
			for await (const value of iters[i]) {
				values[i] = /** @type {any} */ (value);
				if (Object.keys(values).length === values.length) {
					state.set(values);
				}
			}
			iters[(i + 1) % 2].return();
			state.return();
		}
	}
}

/**
 * @template T
 * @extends DerivedState<T> */
export class State extends DerivedState {
	/** @param {T} value */
	set(value) {
		super.set(value);
	}
	/** @param {() => AsyncGenerator<T>} source */
	from(source) {
		return super.from(source);
	}
	return() {
		super.return();
	}
}

/**
 * @template {WeakKey} K
 * @template {State<unknown>} S */
export class Context {
	/** @type {WeakMap<K, S>} */
	#states = new WeakMap();
	#newState;

	/** @param {() => S} newState */
	constructor(newState) {
		this.#newState = newState;
	}

	/**
	 * @protected
	 * @param {K} key */
	state(key) {
		let state = this.#states.get(key);
		if (!state) {
			state = this.#newState();
			this.#states.set(key, state);
		}
		return state;
	}

	/**
	 * @protected
	 * @param {K} key
	 * @returns {() => void} - returns from state associated with provided key */
	returnState(key) {
		const state = this.state(key);
		return () => state.return();
	}

	/** @param {K} key */
	values(key) {
		return /** @type {S extends State<infer U> ? AsyncGenerator<U, void, unknown> : never} */ (
			this.state(key).values()
		);
	}
}
