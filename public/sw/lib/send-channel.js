import StateCommunication from "/lib/state-communication.js";

/**
 * @template T
 * @extends StateCommunication<T> */
export default class SendChannel extends StateCommunication {
  /** @param {T} value */
  sendCurrent(value) {
    this.channel.postMessage({ action: "send/current", value });
  }

  /** @param {T} value */
  sendNext(value) {
    this.channel.postMessage({ action: "send/next", value });
  }
}
