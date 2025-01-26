/** @import { State } from "/channels/peers.js" */
/** @import { Room } from "/lib/validate-room.js" */
/** @import { UserId } from "/lib/validate-user-id.js" */
/** @import { Stringified } from "/lib/stringify.js" */
import { SendChannel } from "/lib/state-channel.js";
import { parse } from "/lib/stringify.js";
import validateUserId from "/lib/validate-user-id.js";
import { roomsDifference } from "/sw/lib/room-websocket.js";
import userId from "/sw/state/user-id.js";
import roomWebSockets from "/sw/state/room-web-sockets.js";
import roomWebSocketStatusByRoom from "/sw/state/room-web-socket-status-by-room.js";


/** @type {SendChannel<State>} */
const peers = new SendChannel("peers");
peers.source(peersSource());

export default peers;

async function* peersSource() {
  yield /** @type {State} */(new Map());
  for await (const roomWebSocketsState of roomWebSockets.subscribe()) {
    const state = await peers.request();
    const { roomsToAdd, roomsToRemove } = roomsDifference(roomWebSocketsState.keys(), state.keys());

    for (const room of roomsToRemove) {
      state.delete(room);
    }

    for (const [room, ws] of roomWebSocketsState) {
      if (!roomsToAdd.has(room)) continue;
      state.set(room, new Map());
      const controller = new AbortController();
      ws.addEventListener("message", handleWSMessage(room), { signal: controller.signal });
      ws.addEventListener("close", () => controller.abort(), { signal: controller.signal });
    }

    yield state;
  }
}

/** @param {Room} room */
function handleWSMessage(room) {
  /** @param {MessageEvent<MessageData>} e */
  return async (e) => {
    const currentPeers = await peers.request();
    const roomPeers = currentPeers.get(room);
    if (!roomPeers) return;
    const user = await userId.request();
    const message = parse(e.data);
    if ('users' in message) {
      for (const peer of message.users) {
        if (!validateUserId(peer) || user === peer) continue;
        roomPeers.set(peer, { connectionStatus: "connecting" });
        connectWithPeer(room, peer, user);
      }
    }
  };
}

/**
 * @param {Room} room 
 * @param {UserId} peer
 * @param {UserId} user 
 */
async function connectWithPeer(room, peer, user) {
  const wsState = await roomWebSockets.current;
  const ws = wsState.get(room);
  if (!ws) return;
  switch (ws.readyState) {
    case WebSocket.CONNECTING:
      ws.addEventListener("open", () => sendOffer(ws, peer, user), { once: true });
    case WebSocket.OPEN:
      sendOffer(ws, peer, user);
      break;
    case WebSocket.CLOSING:
    case WebSocket.CLOSED:
      return;
  }
}

/**
 * @param {WebSocket} ws 
 * @param {UserId} to 
 * @param {UserId} from 
 */
function sendOffer(ws, to, from) {
  ws.send(JSON.stringify({ to, type: "offer", from }));
}

/**
 * @typedef RoomUsersMessage
 * @prop {string[]} users
 * 
 * @typedef ConnectionNegotiationMessage
 * @prop {string | string[]} to users the message was sent to
 * @prop {'offer' | 'answer'} type
 * @prop {string} from
 * 
 * @typedef {Stringified<RoomUsersMessage | ConnectionNegotiationMessage>} MessageData
 */
