/** @template T */
export default class State {
  /** @type {[T] | []} */
  #current = [];
  /** @type {PromiseWithResolvers<boolean>} */
  #next = Promise.withResolvers();

  #setIt = this.#set();
  get set() {
    return this.#setIt;
  }

  #updateIt = this.#update();
  get update() {
    return this.#updateIt;
  }

  constructor() {
    this.#setIt.next();
    this.#updateIt.next();
  }

  /** @returns {Generator<undefined, void, T>} */
  * #set() {
    try {
      while (true) {
        this.#current[0] = yield;
        this.#next.resolve(true);
        this.#next = Promise.withResolvers();
      }
    } finally {
      this.#next.resolve(false);
      this.update.return();
    }
  }

  /** @returns {Generator<undefined, void, (value: T) => T>} */
  * #update() {
    try {
      while (true) {
        const f = yield;
        if (this.#current.length) this.set.next(f(this.#current[0]));
      }
    } finally {
      this.set.return();
    }
  }

  /** @param {AsyncIterable<T, void, void>} iter */
  async source(iter) {
    try {
      for await (const value of iter) {
        if (this.set.next(value).done) break;
      }
    } finally {
      this.set.return();
    }
  }

  /** @param {(iter: AsyncGenerator<T, void, void>) =>  void } [callback] */
  subscribe(callback) {
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
    callback?.(iter);
    return iter;
  }

  [Symbol.asyncIterator]() {
    return this.subscribe();
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
