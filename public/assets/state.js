/**
 * @template T
 */
export default class State {
	/** @type {T} */
	#state;
	/** @type {((state: T) => void) | undefined} */
	onChange;

	/** @param {T} state */
	constructor(state) {
		this.#state = state;
	}

	/** @param {T} state */
	set state(state) {
		this.state = state;
		this.onChange?.(state);
	}

	get state() {
		return this.#state;
	}
}
