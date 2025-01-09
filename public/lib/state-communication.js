import { GenericChannel } from "/lib/state-channel.js";

/** @template T */
export default class StateCommunication {
  /** @type {GenericChannel<RequestAction | SendAction<T>>} */
  #channel;
  get channel() { return this.#channel; }
  /** @param {string} channelName */
  constructor(channelName) {
    this.#channel = new GenericChannel(channelName);
  }
}

/**
 * @typedef RequestAction
 * @prop {Action<'request', ActionType>} action
 */
/**
 * @template T
 * @typedef SendAction
 * @prop {Action<'send', ActionType>} action
 * @prop {T} value
 */
/**
 * @template {ActionMethod} U
 * @template {ActionType} T
 * @typedef {`${U}/${T}`} Action
 */
/**
 * @typedef {"current" | "next"} ActionType
 */
/**
 * @typedef {"request" | "send"} ActionMethod
 */