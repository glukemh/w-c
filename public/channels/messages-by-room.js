/** @import { Room } from "/lib/validate-room.js" */
/** @import { State as MessagesState } from "/channels/messages.js" */
import { FilterChannel } from "/lib/request-channel.js";

/** @type {FilterChannel<State, Room>} */
export default new FilterChannel("messages-by-room");

/** @typedef {MessagesState extends Map<Room, infer U> ? U : never} State */
