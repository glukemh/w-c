/**
 * A function with a single input
 * @template I input type
 * @template O output type
 * @typedef {(input: I) => O} SingleInputFunction
 */

/**
 * The input type of a SingleInputFunction
 * @template F single input function
 * @typedef {F extends SingleInputFunction<infer I, any> ? I : never} InputOf
 */

/**
 * the output type of a SingleInputFunction
 * @template F single input function
 * @typedef {F extends SingleInputFunction<any, infer O> ? O : never} OutputOf
 */

/**
 * the first type of a tuple
 * @template A tuple
 * @typedef {A extends [infer T, ...unknown[]] ? T : never} FirstOf
 */

/**
 * The last type of a tuple
 * @template A tuple
 * @typedef {A extends [...unknown[], infer T] ? T : never} LastOf
 */

/**
 * Tuple without the first element
 * @template A tuple
 * @typedef {A extends [unknown, ...(infer T)] ? T : never} RestOf
 */

/**
 * Tuple without the last element
 * @template A tuple
 * @typedef {A extends [...(infer T), unknown] ? T : never} InitialOf
 */

/**
 * True if two single input functions are composable, else false
 * @template F single input function
 * @template G single input function
 * @typedef {F extends SingleInputFunction<any, infer Output> ? (G extends SingleInputFunction<Output, any> ? true : false) : false} IsComposable
 */

/**
 * Any constructor function
 * @typedef {new (...args: any[]) => {}} Constructor
 */

/**
 * Generic constructor function
 * @template T
 * @typedef {new (...args: any[]) => T} GConstructor
 */

/**
 * Type signature for attributeChangedCallback HTMLElement method
 * @typedef {(name: string, oldValue: string | null, newValue: string | null) => void} AttributeChangedCallback
 */
