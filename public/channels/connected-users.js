/** @import { UserId } from "/lib/validate-user-id.js" */
import { RequestChannel } from "/lib/state-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("connected-users");

/** @typedef {Set<Map<string, ConnectedUser>>} State */

/**
 * @typedef ConnectedUser 
 * @prop {UserId} user
 * @prop {string} connectionStatus */