/**
 * @template T
 */
export class State {
	/** @type {PromiseWithResolvers<T>} */
	#currentState = Promise.withResolvers();
	#nextState = this.#currentState;
	#source;
	/** @protected */
	get source() {
		return this.#source;
	}
	constructor() {
		this.#source = source(this);
		this.#source.next();

		/** @type {(that: State) => Generator<void, void, T>} */
		function* source(that) {
			while (true) {
				that.#nextState.resolve(yield);
				that.#currentState = that.#nextState;
				that.#nextState = Promise.withResolvers();
			}
		}
	}

	async *subscribe() {
		await this.#currentState.promise;
		yield this.#currentState.promise;
		while (true) {
			await this.#nextState.promise;
			yield this.#currentState.promise;
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
 * @extends {State<T>}
 */
export class MutableState extends State {
	/** Set the state and notify subscribers.
	 * @param {T} state */
	set(state) {
		this.source.next(state);
	}

	/** Set state based on the current value.
	 * @param {(state: T) => T} updater function called with current state. */
	async update(updater) {
		for await (const state of this.subscribe()) {
			this.set(updater(state));
			break;
		}
	}
}

let s = new MutableState();
(async () => {
	for await (const value of s.subscribe()) {
		console.log("value", value);
	}
})();
console.log("set");
s.set(1);
s.set(2);
s.set(3);
setTimeout(() => s.set(4), 1000);
// s.update((n) => n + 1);
// s.update((n) => n + 1);
// s.update((n) => n + 1);
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
