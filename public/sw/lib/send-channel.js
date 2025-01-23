import { RequestChannel } from "/lib/request-channel.js";

/**
 * @template T
 * @extends RequestChannel<T> */
export class SendChannel extends RequestChannel {
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
export class SingleSourceChannel extends SendChannel {
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
