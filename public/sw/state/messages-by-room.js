/** @import { Room } from "/lib/validate-room.js" */
import messages from "/channels/messages.js";
import messagesByRoom from "/channels/messages-by-room.js";

messagesByRoom.answerRequest(async (iter) => {
  for await (const [channel, room] of iter) {
    channel.source(messagesByRoomSource(room));
  }
});

/** @param {Room} room */
async function* messagesByRoomSource(room) {
  for await (const messageMap of messages.subscribe()) {
    const roomMessages = messageMap.get(room);
    if (roomMessages) yield roomMessages;
  }
}
