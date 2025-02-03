/** @template T */
export default class State {
  /** @type {[T] | []} */
  #current = [];
  /** @type {PromiseWithResolvers<boolean>} */
  #next = Promise.withResolvers();

  /** @param {T} value */
  set(value) {
    this.#current[0] = value;
    this.#next.resolve(true);
    this.#next = Promise.withResolvers();
  }

  /** @param {(set: (val: T) => void, current: [T] | []) => void } callback */
  update(callback) {
    callback((val) => this.set(val), this.#current);
  }

  /** @returns {Promise<T>} */
  get current() {
    return new Promise(async (resolve, reject) => {
      let resolved = false;
      for await (const value of this) {
        resolve(value);
        resolved = true;
        break;
      }
      if (!resolved) reject(new Error("Value was never set"));
    });
  }

  /** @param {AsyncIterable<T, void, void>} iter */
  async source(iter) {
    try {
      for await (const value of iter) {
        this.set(value);
      }
    } finally {
      this.#next.resolve(false);
    }
  }

  /** @param {(iter: AsyncGenerator<T, void, void>) =>  void } [callback] */
  subscribe(callback) {
    const iter = this[Symbol.asyncIterator]();
    callback?.(iter);
    return iter;
  }

  [Symbol.asyncIterator]() {
    const controller = new AbortController();
    /** @type {Promise<false>} */
    const finish = new Promise((resolve) => {
      controller.signal.onabort = () => resolve(false);
    });
    const iter = this.#subscribe(finish);
    /** @type {typeof iter['return']} */
    const returnIter = iter.return.bind(iter);
    iter.return = () => {
      controller.abort();
      return returnIter();
    };
    return iter;
  }

  /** @param {Promise<false>} finish */
  async * #subscribe(finish) {
    let p;
    do {
      p = this.#next.promise;
      yield* this.#current;
    } while (await Promise.race([p, finish]));
  }
}
