/** @import { Room } from "/lib/validate-room.js" */
import peers from "/channels/peers.js";
import peersByRoom from "/channels/peers-by-room.js";

peersByRoom.answerRequest(async (iter) => {
  for await (const [channel, room] of iter) {
    channel.source(peersByRoomSource(room));
  }
});

/** @param {Room} room */
async function* peersByRoomSource(room) {
  for await (const peersState of peers.subscribe()) {
    const roomMessages = peersState.get(room);
    if (!roomMessages) break;
    yield roomMessages;
  }
}