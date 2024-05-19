/**
 * @template T
 */
export class State {
	/** @type {PromiseWithResolvers<T>} */
	#nextState = Promise.withResolvers();
	#current = this.#nextState.promise;

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
	/** @param {T} state */
	#composite = (state) => state;
	/** @type {null | (() => void)} */
	#task = null;

	/** Set the state and notify subscribers.
	 * @param {T} state */
	set(state) {
		this.resolve(state);
	}

	/** Set state based on the current value.
	 * @param {(state: T) => T} updater function called with current state. */
	update(updater) {
		const f = this.#composite;
		this.#composite = (state) => updater(f(state));
		if (!this.#task) {
			this.#task = async () => {
				for await (const value of this.subscribe()) {
					this.set(this.#composite(value));
					this.#task = null;
					this.#composite = (state) => state;
					break;
				}
			};
			this.#task();
		}
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
