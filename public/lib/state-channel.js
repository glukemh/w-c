export {
  StateChannel,
  GenericChannel,
};

/** @template T */
class GenericChannel extends BroadcastChannel {
  /** @param {T} message */
  postMessage(message) {
    super.postMessage(message);
  }

  /** 
   * @param {"message" | "messageerror"} type
   * @param {(ev: MessageEvent<T>) => void} listener
   * @param {AddEventListenerOptions} [options]*/
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
  }
}

/**
 * @template T
 * @extends GenericChannel<T> */
class StateChannel extends GenericChannel {
  /** @type {PromiseWithResolvers<boolean>} */
  #next = Promise.withResolvers();
  /** @type {[T] | []} */
  #current = [];
  #isEqual;

  /**
   * @param {string} name 
   * @param {(current: T, next: T) => boolean} [isEqual]
   */
  constructor(name, isEqual = (a, b) => a === b) {
    super(name);
    this.#isEqual = isEqual;
    this.addEventListener("message", ({ data }) => {
      this.#current[0] = data;
      this.#next.resolve(true);
      this.#next = Promise.withResolvers();
    });
    this.addEventListener("messageerror", (e) => {
      this.#next.reject(e);
      this.#next = Promise.withResolvers();
    });
  }

  /** @param {T} message */
  postMessage(message) {
    if (this.#current.length && this.#isEqual(this.#current[0], message)) return;
    super.postMessage(message);
  }

  async *subscribe() {
    do {
      yield* this.#current;
    } while (await this.#next.promise);
  }

  close() {
    this.#next.resolve(false);
    super.close();
  }
}
