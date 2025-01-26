/** @import { State } from "/channels/room-web-socket-status.js" */
/** @import { Room } from "/lib/validate-room.js" */
import { SendChannel } from "/lib/state-channel.js";
import roomWebSockets from "/sw/state/room-web-sockets.js";

/** @type {SendChannel<State>} */
const roomWebSocketStatus = new SendChannel("room-web-socket-status");

roomWebSocketStatus.source(source());

export default roomWebSocketStatus;

async function* source() {
  yield /** @type {State} */(new Map());
  for await (const roomWebSocketsState of roomWebSockets.subscribe()) {
    /** @type {State} */
    const state = new Map();
    for (const [room, ws] of roomWebSocketsState) {
      const status = wsStatus(ws.readyState);
      state.set(room, status);
      const controller = new AbortController();
      ws.addEventListener("open", updateState(room), { signal: controller.signal });
      ws.addEventListener("close", () => {
        controller.abort();
        updateState(room);
      }, { signal: controller.signal });
    }
    yield state;
  }
}

/** @param {Room} room */
function updateState(room) {
  return async () => {
    const roomWebSocketsState = await roomWebSockets.current;
    const ws = roomWebSocketsState.get(room);
    if (!ws) return;
    const state = await roomWebSocketStatus.request();
    state.set(room, wsStatus(ws.readyState));
    roomWebSocketStatus.send(state);
  };
}

/** @param {number} readyState */
function wsStatus(readyState) {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return "connecting";
    case WebSocket.OPEN:
      return "open";
    case WebSocket.CLOSING:
      return "closing";
    case WebSocket.CLOSED:
    default:
      return "closed";
  }
}