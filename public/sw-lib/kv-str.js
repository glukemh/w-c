import { SchemaStore } from "/sw-lib/db.js";


/** @type {SchemaStore<KeyValue>} */
export default new SchemaStore('kv-str', { keyPath: 'key' })

/**
 * @typedef KeyValue
 * @prop {string} key
 * @prop {string} value
 */