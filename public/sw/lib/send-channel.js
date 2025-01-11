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

  /** @param {T} value */
  send(value) {
    this.current[0] = value;
    this.channel.postMessage({ action: "next", value });
  }
}

