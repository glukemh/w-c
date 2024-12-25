
/**
 * @template {AnyMethod} M 
 * @template {Response} R */
export class Route {
	/** @type {M[]} */
	#methods;
	/** @type {FetchHandler<R>} */
	#handler;
	/**
	 * Route consists of pattern to match on pathname and callback to handle fetch events
	 * @param {M | M[]} methods
	 * @param {FetchHandler<R>} handler */
	constructor(methods, handler) {
		this.#handler = handler;
		this.#methods = typeof methods === 'string' ? [methods] : methods;
	}

	use() {
		return /** @type {{ [k in M]: FetchHandler<R>}} */(Object.fromEntries(
			this.#methods.map((method) => [method, this.#handler])
		));
	}
}

/** @template T */
export class JSONResponse extends Response {
	/**
	 * @param {T} body json response requires body
	 * @param {ResponseInit} [init] */
	constructor(body, init) {
		super(JSON.stringify(body), init);
	}
	json() {
		return /** @type {Promise<T>} */(super.json());
	}
}

/**
 * @template {Response} Res
 * @callback FetchHandler
 * @param {Request} req
 * @returns {Res | Promise<Res>}
 */
/**
 * @typedef {'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} Method
 */
/**
 * @typedef {Method | string & {}} AnyMethod
 */