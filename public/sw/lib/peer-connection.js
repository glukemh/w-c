/** @import { Room } from "/lib/validate-room.js" */
/** @import { State as PeersState} from "/channels/peers.js" */
import State from "/lib/state.js";
import { rooms, peers, userId } from "/sw/state/index.js";
import roomWebSocket from "/sw/lib/room-websocket.js";
import validateUserId from "/lib/validate-user-id.js";

peers.subscribe(async (iter) => {
  for await (const peersState of iter) {

  }
});

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
};

/**
 * @param {Set<Room>} rooms
 * @param {PeersState} peersState */
export async function connectToPeers(rooms, peersState) {
  await Promise.all([...rooms].map(async (room) => {
    const ws = await roomWebSocket(room);
    const pc = new RTCPeerConnection(servers);
    const peersList = [];
    return new Promise((resolve) => {
      ws.addEventListener("message", async (e) => {
        /** @type {RTCIceCandidateInit | RoomUsers | ConnectionNegotiation} */
        const parsedData = JSON.parse(e.data);
        if ('users' in parsedData) {
          const newState = await handleRoomUsers(parsedData);
          peersState.set(room, newState);
        }

      });
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          ws.send(JSON.stringify({ type: "candidate", candidate: e.candidate }));
        }
      };
    });
  }));
  for (const room of rooms) {
  }
  return peersState;
}

/**
 * @param {RoomUsers} users */
async function handleRoomUsers({ users }) {
  const currentUserId = await userId.request();
  const userIds = users.filter((user) => user !== currentUserId).filter((user) => validateUserId(user));
  return new Map(userIds.map((user) => [user, { connectionStatus: "connecting" }]));
}

async function setNewUser(room, user, ws) {

}

/**
 * 
 * @param {Room} room 
 */
export async function disconnectFromPeers(room) {
}

/**
 * @param {Room} room
 * @param {Peer[]} peersList */
export async function setPeers(room, peersList) {
  const currentState = await peers.request();
  if (!currentState.has(room)) return;
  currentState.set(room, peersList);
  peers.send(currentState);
}

