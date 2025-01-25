/** @import { UserId } from "/lib/validate-user-id.js" */
/** @import { Room } from "/lib/validate-room.js" */
import { RequestChannel } from "/lib/state-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("connected-users");

/** @typedef {Map<Room, ConnectedUser[]>} State */

/**
 * @typedef ConnectedUser 
 * @prop {UserId} user
 * @prop {string} connectionStatus */