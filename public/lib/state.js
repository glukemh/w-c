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

  get current() {
    return new Promise(async (resolve, reject) => {
      let resolved = false;
      for await (const value of this.subscribe()) {
        resolve(value);
        resolved = true;
        break;
      }
      if (!resolved) reject(new Error("Value was never set"));
    });
  }

  /** @param {(iter: AsyncGenerator<T, void, unknown>) => void } [callback] */
  subscribe(callback) {
    const iter = this.#subscribe();
    callback?.(iter);
    return iter;
  }

  async * #subscribe() {
    do {
      yield* this.#current;
    } while (await this.#next.promise);
  }
}