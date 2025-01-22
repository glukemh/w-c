/** @import { UserId } from "/lib/validate-user-id.js" */
/** @import { Room } from "/lib/validate-room.js" */
import { RequestChannel } from "/lib/request-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("messages");

/** @typedef {Map<Room, Message[]>} State */

/**
 * @typedef Message
 * @prop {number} timestamp
 * @prop {UserId} user
 * @prop {string} text
 */
