import { GenericChannel } from "/lib/state-channel.js";

export { RequestChannel, FilterChannel, StateCommunication };

/** @template {Actions} T */
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
 * @extends {StateCommunication<RequestAction | SendAction<T> | CloseAction | FilterRequestAction<T>>} */
class RequestChannel extends StateCommunication {
  /** @param {string} channelName */
  constructor(channelName) {
    super(channelName);
    this.channel.addEventListener("message", ({ data }) => {
      switch (data.action) {
        case "request/close":
        case "send/close":
          this.channel.close();
          break;
      }
    });
  }
  request() {
    const controller = new AbortController();
    return /** @type {Promise<T>} */(new Promise((resolve) => {
      this.channel.addEventListener("message", ({ data }) => {
        switch (data.action) {
          case "send/current":
          case "send/next":
            resolve(data.value);
            controller.abort();
            break;
        }
      }, { signal: controller.signal });
      this.channel.postMessage({ action: "request/current" });
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
      this.channel.addEventListener("message", ({ data }) => {
        switch (data.action) {
          case "send/next":
            vals.push(data.value);
            next.resolve(true);
            next = Promise.withResolvers();
            break;
          case "request/close":
          case "send/close":
            next.resolve(false);
            break;
        }
      }, { signal: controller.signal });
      do {
        yield* vals;
        vals.splice(0);
      } while (await next.promise);
    } finally {
      controller.abort();
    }
  }

  close() {
    this.channel.postMessage({ action: "request/close" });
  }
}

/**
 * @template T resulting request channel state
 * @template F filter
 * @extends {StateCommunication<FilterRequestAction<F>>} */
class FilterChannel extends StateCommunication {
  static #id = 0;

  /** @param {string} channelName */
  constructor(channelName) {
    super(channelName);
  }

  /** @param {F} filter */
  requestChannel(filter) {
    /** @type {RequestChannel<T>} */
    const reqChannel = new RequestChannel(`${this.name} filter-${FilterChannel.#id++}`);
    this.channel.postMessage({ action: "request/filter", filter, channel: reqChannel.name });
    return reqChannel;
  }
}

/**
 * @typedef {RequestAction | FilterRequestAction<unknown> | SendAction<unknown> | CloseAction} Actions
 */
/**
 * @typedef RequestAction
 * @prop {Action<"request", "current">} action
 */
/**
 * @template T
 * @typedef FilterRequestAction
 * @prop {Action<"request", "filter">} action
 * @prop {T} filter
 * @prop {string} channel
 */
/**
 * @template T
 * @typedef SendAction
 * @prop {Action<"send", "current" | "next">} action
 * @prop {T} value
 */
/**
 * @typedef CloseAction
 * @prop {Action<"send" | "request", "close">} action
 */
/**
 * @template {ActionSender} U
 * @template {ActionType} T
 * @typedef {`${U}/${T}`} Action
 */
/**
 * @typedef {"current" | "next" | "filter" | "close" } ActionType
 */
/**
 * @typedef {"send" | "request"} ActionSender
 */
