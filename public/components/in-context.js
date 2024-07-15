export default class InContext extends HTMLElement {
	#contextMap = new WeakMap();
	/**
	 * @template T
	 * @param {WeakKey} key
	 * @param {() => T} initial
	 * @returns {T} */
	context(key, initial) {
		if (!this.#contextMap.has(key)) {
			this.#contextMap.set(key, initial());
		}
		return this.#contextMap.get(key);
	}
}

customElements.define("in-context", InContext);
