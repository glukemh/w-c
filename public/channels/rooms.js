/** @import { Room } from "/lib/validate-room.js" */
import { RequestChannel } from "/lib/state-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("rooms");

/** @typedef {Set<Room>} State */
