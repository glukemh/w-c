/**
 * @template T
 */
export default class State {
	/** @type {Set<(state: T) => void>} */
	#subscribers = new Set();
	/** @type {T} */
	#state;

	/** @param {T} state */
	set state(state) {
		this.#state = state;
		this.#subscribers.forEach((subscriber) => {
			subscriber(state);
		});
	}

	get state() {
		return this.#state;
	}

	/** @param {T} state */
	constructor(state) {
		this.#state = state;
	}

	/**
	 * Subscribe to state changes.
	 * @param {(state: T) => void} subscriber callback to be called when state changes
	 * @returns {() => boolean} unsubscribes from further state changes
	 */
	subscribe(subscriber) {
		subscriber(this.#state);
		this.#subscribers.add(subscriber);
		return () => this.#subscribers.delete(subscriber);
	}
}
