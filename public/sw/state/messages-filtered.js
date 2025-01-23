/** @import { Room } from "/lib/validate-room.js" */
/** @import { State } from "/channels/messages-by-room.js" */
import { SingleSourceChannel } from "/sw/lib/send-channel.js";
import messages from "/channels/messages.js";
import messagesByRoom from "/channels/messages-by-room.js";

messagesByRoom.subscribe(async (iter) => {
  for await (const { channel, filter } of iter) {
    if (SingleSourceChannel.hasChannel(channel)) continue;
    /** @type {SingleSourceChannel<State>} */
    const roomMessagesChannel = new SingleSourceChannel(channel);
    roomMessagesChannel.source(filteredMessagesSource(filter));
  }
});

/** @param {Room} room */
async function* filteredMessagesSource(room) {
  for await (const messageMap of messages.subscribe()) {
    const roomMessages = messageMap.get(room);
    if (!roomMessages) break;
    yield roomMessages;
  }
}