/** @import { Room } from "/lib/validate-room.js" */
/** @import { State as MessagesState } from "/channels/messages.js" */
import { ContextChannel } from "/lib/state-channel.js";

/** @type {ContextChannel<State, Room>} */
export default new ContextChannel("messages-by-room");

/** @typedef {MessagesState extends Map<Room, infer U> ? U : never} State */
