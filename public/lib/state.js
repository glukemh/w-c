/**
 * Initiate state from a source. Returning from source will close the state. Subscribe to state changes by calling next.
 * @template T
 * @param {AsyncGenerator<T, void>} source source to update state
 * @example
 * ```js
 * const subscribe = state(sourceGenerator);
 * for await (const n of subscribe.next().value) {
 *   console.log(n);
 * }
 */
export default function* state(source) {
  try {
    const instance = {
      /** @type {[T] | []} */
      value: [],
      /** @type {PromiseWithResolvers<boolean>} */
      next: Promise.withResolvers(),
      open: true,
      source,
    };
    handleSource(instance);
    while (open) {
      const returned = Promise.withResolvers();
      const iter = subscribe(instance, returned.promise);
      /** @type {typeof iter['return']} */
      const returnIter = iter.return.bind(iter);
      iter.return = () => {
        returned.resolve(false);
        return returnIter();
      };
      yield iter;
    }
    return { async *[Symbol.asyncIterator]() { } };
  } finally {
    source.return();
  }
}

/** @template T @param {Instance<T>} x @param {Promise<false>} returned */
async function* subscribe(x, returned) {
  let p;
  do {
    p = x.next.promise;
    yield* x.value;
  } while (await Promise.race([p, returned]));
}

/** @template T @param {Instance<T>} x */
async function handleSource(x) {
  for await (const v of x.source) {
    x.value[0] = v;
    x.next.resolve(true);
    x.next = Promise.withResolvers();
  }
  x.open = false;
  x.value.splice(0);
  x.next.resolve(false);
}

/** 
 * @template T
 * @typedef {{ value: [T] | [], next: PromiseWithResolvers<boolean>, open: boolean, source: AsyncGenerator<T> }} Instance
 */
