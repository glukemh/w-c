/** @import { Room } from "/lib/validate-room.js" */
/** @import { State as RoomWebSocketStatusState } from "/channels/room-web-socket-status.js" */
import { ContextChannel } from "/lib/state-channel.js";

/** @type {ContextChannel<State, Room>} */
export default new ContextChannel("room-web-socket-status-by-room");

/** @typedef {RoomWebSocketStatusState extends Map<Room, infer U> ? U : never} State */
