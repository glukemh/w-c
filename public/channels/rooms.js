import { RequestChannel } from "/lib/request-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("rooms");

/** @typedef {Set<string>} State */
