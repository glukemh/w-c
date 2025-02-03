/** @import { Room } from "/lib/validate-room.js" */
import roomWebSocketStatusByRoom from "/channels/room-web-socket-status-by-room.js";
import roomWebSocketStatus from "/sw/state/room-web-socket-status.js";

roomWebSocketStatusByRoom.answerRequest(async (iter) => {
  for await (const [channel, room] of iter) {
    channel.source(source(room));
  }
});

/** @param {Room} room */
async function* source(room) {
  for await (const messageMap of roomWebSocketStatus.subscribe()) {
    const wsStatus = messageMap.get(room);
    if (wsStatus) yield wsStatus;
  }
}

export default roomWebSocketStatusByRoom;
