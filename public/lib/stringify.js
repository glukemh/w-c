
/** 
 * @template T
 * @param {T} value */
export function stringify(value) {
  return /** @type {Stringified<T>} */(JSON.stringify(value));
}

/** 
 * @template T
 * @param {Stringified<T>} value */
export function parse(value) {
  return /** @type {T} */(JSON.parse(value));
}

/**
 * @template T
 * @typedef {string & { __stringified: T }} Stringified
 */