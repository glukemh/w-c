const dbName = 'sw-db';
const dbVersion = 1;

/** @type {((e: IDBVersionChangeEvent) => void)[]} */
const upgradeNeededCallbacks = [];

/** @type {Promise<IDBDatabase>} */
const dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open(dbName, dbVersion);
  request.addEventListener("upgradeneeded", (e) => {
    upgradeNeededCallbacks.forEach(fn => fn(e));
  });
  resolveRequest(request).then(resolve).catch(reject);
});

/** @template T */
export class SchemaStore {
  #name;
  get name() { return this.#name; }
  #store;

  /**
   * @param {string} name name of the store
   * @param {IDBObjectStoreParameters} [options] options to create object store
   * @param {(store: IDBObjectStore) => void} [createObjectStoreCallback]*/
  constructor(name, options, createObjectStoreCallback) {
    upgradeNeededCallbacks.push((e) => {
      const db = /** @type {IDBOpenDBRequest} */(e.target).result;
      if (!db.objectStoreNames.contains(name)) {
        const store = db.createObjectStore(name, options);
        createObjectStoreCallback?.(store);
      }
    });
    this.#name = name;
    this.#store = dbPromise.then(db => db.transaction([name], 'readwrite').objectStore(name));
  }

  /** @param {Parameters<IDBObjectStore['get']>} args */
  async get(...args) {
    const store = await this.#store;
    /** @type {IDBRequest<T | undefined>} */
    const request = store.get(...args);
    return resolveRequest(request);
  }

  /** @param {Parameters<IDBObjectStore['getAll']>} args */
  async getAll(...args) {
    const store = await this.#store;
    /** @type {IDBRequest<T[]>} */
    const request = store.getAll(...args);
    return resolveRequest(request);
  }

  /** 
   * @param {T} value
   * @param {Parameters<IDBObjectStore['add']>[1]} [key]
   */
  async add(value, key) {
    const store = await this.#store;
    const request = store.add(value, key);
    return resolveRequest(request);
  }

  /** 
   * @param {T} value
   * @param {Parameters<IDBObjectStore['add']>[1]} [key]
   */
  async put(value, key) {
    const store = await this.#store;
    const request = store.put(value, key);
    return resolveRequest(request);
  }

  /** @param {Parameters<IDBObjectStore['delete']>} args */
  async delete(...args) {
    const store = await this.#store;
    const request = store.delete(...args);
    return resolveRequest(request);
  }

  async clear() {
    const store = await this.#store;
    const request = store.clear();
    return resolveRequest(request);
  }

  /** @param {Parameters<IDBObjectStore['count']>} args */
  async count(...args) {
    const store = await this.#store;
    const request = store.count(...args);
    return resolveRequest(request);
  }
}

/**
 * @template T
 * @param {IDBRequest<T>} request */
function resolveRequest(request) {
  return /** @type {Promise<T>} */(new Promise((resolve, reject) => {
    request.addEventListener("success", () => {
      resolve(request.result);
    });
    request.addEventListener("error", () => {
      reject(request.error);
    });
  }));
}