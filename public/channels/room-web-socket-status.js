/** @import { Room } from "/lib/validate-room.js" */
import { RequestChannel } from "/lib/state-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("room-web-socket-status");

/**
 * @typedef {Map<Room, WebSocketStatus>} State
 * 
 * @typedef {'connecting' | 'open' | 'closing' | 'closed'} WebSocketStatus
 */