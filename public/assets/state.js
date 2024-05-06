/**
 * @template T
 */
export class State {
	/** @type {PromiseWithResolvers<T>} */
	#nextState = Promise.withResolvers();

	/**
	 * @protected
	 * @param {T} value */
	next(value) {
		const { resolve } = this.#nextState;
		this.#nextState = Promise.withResolvers();
		resolve(value);
	}

	async *subscribe() {
		while (true) {
			yield await this.#nextState.promise;
		}
	}
}

/**
 * @template T
 * @extends {State<T>}
 */
export class DerivedState extends State {
	async *subscribe() {
		yield this.get();
		yield* super.subscribe();
	}

	/** @protected */
	nextGet() {
		this.next(this.get());
	}

	/**
	 * Override this method to return the current state.
	 * @abstract
	 * @returns {T}
	 */
	get() {
		throw new Error("DerivedState.get() must be implemented");
	}
}

/**
 * @template T
 * @extends {State<T>}
 */
export class InitialState extends State {
	/** @type {T} */
	#current;

	/** @param {T} initial */
	constructor(initial) {
		super();
		this.#current = initial;
	}

	/**
	 * @protected
	 * @param {T} value */
	next(value) {
		this.#current = value;
		super.next(value);
	}

	async *subscribe() {
		yield this.get();
		yield* super.subscribe();
	}

	get() {
		return this.#current;
	}
}

/**
 * @template T
 * @extends {InitialState<Promise<T>>}
 */
export class PromiseState extends InitialState {
	/** @type {PromiseWithResolvers<T>['resolve'] | null} */
	#initialResolve;
	constructor() {
		/** @type {PromiseWithResolvers<T>} */
		const initial = Promise.withResolvers();
		super(initial.promise);
		this.#initialResolve = initial.resolve;
	}

	/** @param {Promise<T>} value */
	next(value) {
		if (this.#initialResolve) {
			this.#initialResolve(value);
			this.#initialResolve = null;
		} else {
			super.next(value);
		}
	}
}

/**
 * @template T
 * @extends {InitialState<T>}
 */
export class MutableState extends InitialState {
	/** Set the state and notify subscribers.
	 * @param {T} state */
	set(state) {
		this.next(state);
	}

	/** Set state based on the current value.
	 * @param {(state: T) => T} updater function called with current state. */
	update(updater) {
		this.set(updater(this.get()));
	}
}

/**
 * @template T
 * @param {ReturnType<State<T>['subscribe']>} iter
 * @param {(state: T) => void} callback
 */
export async function forAwait(iter, callback) {
	for await (const value of iter) {
		callback(value);
	}
}

/** @param {...State<any>} states*/
export async function* race(...states) {
	const iters = states.map((state) => state.subscribe());
	const promises = iters.map((iter, i) => iter.next().then(() => i));
	while (true) {
		yield;
		const i = await Promise.race(promises);
		promises[i] = iters[i].next().then(() => i);
	}
}
