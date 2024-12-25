/** @template T */
class StateChannel extends BroadcastChannel {
  /** @type {PromiseWithResolvers<boolean>} */
  #next = Promise.withResolvers();
  /** @type {[T] | []} */
  #current = [];

  /**
   * @param {string} name 
   * @param {(a: T, b: T) => boolean} [isEqual]
   */
  constructor(name, isEqual = (a, b) => a === b) {
    super(name);
    this.addEventListener("message", ({ data }) => {
      if (this.#current.length && isEqual(this.#current[0], data)) return;
      this.#current[0] = data;
      this.#next.resolve(true);
      this.#next = Promise.withResolvers();
    });
    this.addEventListener("messageerror", (e) => {
      this.#next.reject(e);
      this.#next = Promise.withResolvers();
    });
  }

  async *subscribe() {
    do {
      yield* this.#current;
    } while (await this.#next.promise);
  }

  /** @param {T} message */
  postMessage(message) {
    super.postMessage(message);
  }

  close() {
    this.#next.resolve(false);
    super.close();
  }

  /** 
   * @param {"message" | "messageerror"} type
   * @param {(ev: MessageEvent<T>) => void} listener
   * @param {AddEventListenerOptions} [options]*/
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
  }

}

export default StateChannel;
