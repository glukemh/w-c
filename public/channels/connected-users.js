import { RequestChannel } from "/lib/request-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("connected-users");

/** @typedef {Set<Map<string, ConnectedUser>>} State */

/**
 * @typedef ConnectedUser 
 * @prop {string} user
 * @prop {string} connectionStatus */