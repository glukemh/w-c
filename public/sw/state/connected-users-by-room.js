/** @import { Room } from "/lib/validate-room.js" */
import connectedUsers from "/channels/connected-users.js";
import connectedUsersByRoom from "/channels/connected-users-by-room.js";

connectedUsersByRoom.answerRequest(async (iter) => {
  for await (const [channel, room] of iter) {
    channel.source(connectedUsersByRoomSource(room));
  }
});

/** @param {Room} room */
async function* connectedUsersByRoomSource(room) {
  for await (const connectedUsersState of connectedUsers.subscribe()) {
    const roomMessages = connectedUsersState.get(room);
    if (!roomMessages) break;
    yield roomMessages;
  }
}