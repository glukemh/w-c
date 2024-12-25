/** @param {Request | Response} reqOrRes */
export default async function bodyResult(reqOrRes) {
  const contentType = reqOrRes.headers.get('Content-Type');
  let result;
  /** @type {Error | null} */
  let error = null;
  try {
    switch (contentType) {
      case 'application/json':
        result = await reqOrRes.json();
        break;
      case 'application/x-www-form-urlencoded':
      case 'multipart/form-data':
        result = await reqOrRes.formData();
        break;
      default:
        result = await reqOrRes.text();
    }
  } catch (e) {
    error = e;
  }
  return error ?? new BodyData(result);
}

class BodyData {
  #data;
  get data() {
    return this.#data;
  }
  /** @param {unknown} data */
  constructor(data) {
    this.#data = data;
  }

  /**
   * Get a value from the data whether FormData or other object
   * @param {string} key
   * @returns {unknown} */
  get(key) {
    if (this.#data instanceof FormData) {
      return this.#data.get(key);
    } else if (this.#data && typeof this.#data === 'object') {
      return this.#data[key];
    }
  }
}