import { GenericChannel } from "/lib/state-channel.js";

export { RequestChannel, FilterChannel, StateCommunication };

/** @template {Action} T */
class StateCommunication {
  /** @type {GenericChannel<T>} */
  #channel;
  /** @protected */
  get channel() { return this.#channel; }
  get name() { return this.#channel.name; }
  /** @param {string} channelName */
  constructor(channelName) {
    this.#channel = new GenericChannel(channelName);
  }
}

/**
 * @template T
 * @extends {StateCommunication<RequestAction<T>>} */
class RequestChannel extends StateCommunication {
  #closed = false;
  get closed() { return this.#closed; }
  /** @param {string} channelName */
  constructor(channelName) {
    super(channelName);
    this.onClose(() => {
      this.channel.close();
      this.#closed = true;
    });
  }
  /** @param {() => void} callback */
  onClose(callback) {
    this.channel.addEventListener("message", ({ data }) => {
      if (data.action === "close") callback();
    });
  }
  request() {
    const controller = new AbortController();
    return /** @type {Promise<T>} */(new Promise((resolve) => {
      this.channel.addEventListener("message", ({ data }) => {
        switch (data.action) {
          case "current":
          case "next":
            resolve(data.value);
            controller.abort();
            break;
        }
      }, { signal: controller.signal });
      this.channel.postMessage({ action: "current-request" });
    }));
  }

  /** 
   * Use callback or return value
   * @param {(iter: AsyncGenerator<T, void, unknown>) => void} [callback] */
  subscribe(callback) {
    const iter = this.#subscribe();
    callback?.(iter);
    return iter;
  }

  async * #subscribe() {
    const controller = new AbortController();
    try {
      /** @type {T[]} */
      const vals = [await this.request()];
      /** @type {PromiseWithResolvers<boolean>} */
      let next = Promise.withResolvers();
      this.onClose(() => {
        next.resolve(false);
      });
      this.channel.addEventListener("message", ({ data }) => {
        if (data.action === "next") {
          vals.push(data.value);
          next.resolve(true);
          next = Promise.withResolvers();
        }
      }, { signal: controller.signal });
      do {
        yield* vals.splice(0);
      } while (await next.promise);
    } finally {
      controller.abort();
    }
  }

  close() {
    this.channel.postMessage({ action: "close" });
  }
}

/**
 * @template T resulting request channel state
 * @template F filter
 * @extends {RequestChannel<{ channel: string, filter: F }>} */
class FilterChannel extends RequestChannel {
  static #id = 0;

  /** @param {F} filter */
  newChannel(filter) {
    /** @type {RequestChannel<T>} */
    const reqChannel = new RequestChannel(`${this.name} filter-${FilterChannel.#id++}`);
    this.channel.postMessage({ action: "next", value: { filter, channel: reqChannel.name } });
    return reqChannel;
  }
}

/**
 * @typedef {"current-request" | "current" | "next" | "close"} ActionType
 */
/**
 * @typedef {{ action: ActionType }} Action
 */
/**
 * @template T
 * @typedef { { action: "current-request" } | { action: "current", value: T } | { action: "next", value: T } | { action: "close" } } RequestAction
 */

