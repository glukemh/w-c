/** @import { Room } from "/lib/validate-room.js" */
/** @import { State as ConnectedUsersState } from "/channels/connected-users.js" */
import { ContextChannel } from "/lib/state-channel.js";

/** @type {ContextChannel<State, Room>} */
export default new ContextChannel("connected-users-by-room");

/** @typedef {ConnectedUsersState extends Map<Room, infer U> ? U : never} State */