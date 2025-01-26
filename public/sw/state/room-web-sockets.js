/** @import { Room } from "/lib/validate-room.js" */
import State from "/lib/state.js";
import { createRoomWebSocket, roomsDifference } from "/sw/lib/room-websocket.js";
import rooms from "/sw/state/rooms.js";
import userId from "/sw/state/user-id.js";

/** @type {State<Map<Room, WebSocket>>} */
const roomWebSockets = new State();
roomWebSockets.source(roomWebSocketsSource());

export default roomWebSockets;

async function* roomWebSocketsSource() {
  yield /** @type {Map<Room, WebSocket>} */(new Map());

  for await (const roomsState of rooms.subscribe()) {
    const state = await roomWebSockets.current;

    const { roomsToAdd, roomsToRemove } = roomsDifference(roomsState, state.keys());

    for (const room of roomsToRemove) {
      state.get(room)?.close(undefined, "room exited");
      state.delete(room);
    }

    const uid = await userId.request();
    for (const room of roomsToAdd) {
      state.set(room, createRoomWebSocket(room, uid));
    }

    yield state;
  }
}

