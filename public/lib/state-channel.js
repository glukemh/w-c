import GenericChannel from "/lib/generic-channel.js";
import { uniqueIds } from "/lib/unique-id.js";

export { RequestChannel, ContextChannel, StateCommunication, SendChannel };

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
    }, { once: true });
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

      while (vals.length || await next.promise) {
        yield* vals.splice(0);
      }
    } finally {
      controller.abort();
    }
  }

  close() {
    this.channel.postMessage({ action: "close" });
  }
}


/**
 * @template T
 * @extends RequestChannel<T> */
class SendChannel extends RequestChannel {
  /** @type {[T] | []} */
  current = [];
  /** @param {string} name */
  constructor(name) {
    super(name);

    this.channel.addEventListener("message", ({ data }) => {
      if (data.action === "current-request" && this.current.length) {
        this.channel.postMessage({ action: "current", value: this.current[0] });
      }
    });
  }

  async request() {
    if (this.current.length) {
      return this.current[0];
    }
    return super.request();
  }

  /**
   * Set values from source as long as channel is open.
   * @param {AsyncGenerator<T, void, unknown>} iter */
  async source(iter) {
    if (this.closed) {
      iter.return();
      return;
    }
    for await (const value of iter) {
      if (this.closed) break;
      this.send(value);
    }
  }

  /** @param {T} value */
  send(value) {
    this.current[0] = value;
    this.channel.postMessage({ action: "next", value });
  }
}


/**
 * Only one channel with the same name will be open at a time. Channel is closed after source returns.
 * @template T
 * @extends SendChannel<T> */
class SingleSourceChannel extends SendChannel {
  /** @type {Map<string, SendChannel>} */
  static #channels = new Map();
  /** @param {string} name */
  static hasChannel(name) { return this.#channels.has(name); }
  /** @param {string} name */
  constructor(name) {
    SingleSourceChannel.#channels.get(name)?.close();
    super(name);
    SingleSourceChannel.#channels.set(name, this);
    this.onClose(() => SingleSourceChannel.#channels.delete(name));
  }

  /** @param {AsyncGenerator<T, void, unknown>} iter */
  async source(iter) {
    try {
      await super.source(iter);
    } finally {
      this.close();
    }
  }
}

/**
 * @template T resulting request channel state
 * @template C context value
 * @extends {RequestChannel<{ channel: string, context: C }>} */
class ContextChannel extends RequestChannel {
  #id = uniqueIds();

  #uniqueId() {
    return this.#id.next().value;
  }

  /** @param {C} context */
  newRequestChannel(context) {
    /** @type {RequestChannel<T>} */
    const reqChannel = new RequestChannel(`${this.name} context-${this.#uniqueId()}`);
    this.channel.postMessage({ action: "next", value: { context, channel: reqChannel.name } });
    return reqChannel;
  }

  /** 
   * Use callback or return value
   * @param {(iter: AsyncGenerator<readonly [SingleSourceChannel<T>, C], void, unknown>) => void} [callback] */
  answerRequest(callback) {
    const iter = this.#answerRequest();
    callback?.(iter);
    return iter;
  }

  async * #answerRequest() {
    for await (const { context, channel } of this.subscribe()) {
      if (SingleSourceChannel.hasChannel(channel)) continue;
      /** @type {SingleSourceChannel<T>} */
      const singleSourceChannel = new SingleSourceChannel(channel);
      yield /** @type {const} */([singleSourceChannel, context]);
    }
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

