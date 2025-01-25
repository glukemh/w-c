/** @import { Room } from "/lib/validate-room.js" */
/** @import { State as PeersState } from "/channels/peers.js" */
import { ContextChannel } from "/lib/state-channel.js";

/** @type {ContextChannel<State, Room>} */
export default new ContextChannel("peers-by-room");

/** @typedef {PeersState extends Map<Room, infer U> ? U : never} State */