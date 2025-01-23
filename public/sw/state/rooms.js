/** @import { State } from "/channels/rooms.js" */
import { SendChannel } from "/lib/state-channel.js";
import userId from "/sw/state/user-id.js";

/** @type {SendChannel<State>} */
const rooms = new SendChannel("rooms");

rooms.send(new Set());

userId.subscribe(async (iter) => {
  for await (const _ of iter) {
    // rooms must be re-entered if the user id changes
    rooms.send(new Set());
  }
});

export default rooms;
