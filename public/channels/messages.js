import { RequestChannel } from "/lib/request-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("messages");

/** @typedef {Message[]} State */

/**
 * @typedef Message
 * @prop {number} timestamp
 * @prop {string} room
 * @prop {string} user
 * @prop {string} text
 */