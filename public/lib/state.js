/** @template T */
export default class State {
  #closeController = new AbortController();
  get closed() {
    return this.#closeController.signal.aborted;
  }

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
    this.#closeController.signal.addEventListener("abort", () => {
      this.#current.splice(0);
      this.#next.resolve(false);
      this.#setIt.return();
      this.#updateIt.return();
    });
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
      this.#closeController.abort();
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
      this.#closeController.abort();
    }
  }

  /** @param {AsyncGenerator<T, void, void>} iter */
  async source(iter) {
    try {
      if (this.closed) {
        iter.return();
      } else {
        this.#closeController.signal.addEventListener("abort", () => iter.return());
      }
      for await (const value of iter) {
        this.set.next(value);
      }
    } finally {
      this.#closeController.abort();
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
