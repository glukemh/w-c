/**
 * @template T
 */
export default class State {
	/** @type {T} */
	#current;
	#next = Promise.withResolvers();

	/** @param {T} initial */
	constructor(initial) {
		this.#current = initial;
	}

	/** Returns and async generator that yields state changes. */
	async *subscribe() {
		while (true) {
			yield this.#current;
			await this.#next.promise;
		}
	}

	/** Set the state and notify subscribers.
	 * @param {T} state */
	set(state) {
		this.#current = state;
		const { resolve } = this.#next;
		this.#next = Promise.withResolvers();
		resolve(this.#current);
	}

	/** Get current state. */
	get() {
		return this.#current;
	}

	/** Set state based on the current value.
	 * @param {(state: T) => T} updater function called with current state. */
	update(updater) {
		this.set(updater(this.#current));
	}
}

/**
 * @template T
 * @param {ReturnType<State<T>['subscribe']>} iter
 * @param {(state: T) => void} callback
 */
export const forAwait = async (iter, callback) => {
	for await (const value of iter) {
		callback(value);
	}
};
