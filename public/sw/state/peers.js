/** @import { Room } from "/lib/validate-room.js" */
/** @import { State, Peer } from "/channels/peers.js" */
import { SendChannel } from "/lib/state-channel.js";
import rooms from "/channels/rooms.js";

/** @type {SendChannel<State>} */
const peers = new SendChannel("peers");
peers.send(new Map());

rooms.subscribe(async (iter) => {
  for await (const roomsSet of iter) {
    const peersState = await peers.request();
    const peersRooms = new Set(peersState.keys());
    const roomsToAdd = roomsSet.difference(peersRooms);
    const roomsToRemove = peersRooms.difference(roomsSet);
    for (const room of roomsToAdd) {
      peersState.set(room, []);
    }
    for (const room of roomsToRemove) {
      peersState.delete(room);
    }
    peers.send(peersState);
  }
});

/**
 * @param {Room} room
 * @param {Peer[]} peersList */
export async function setPeers(room, peersList) {
  const currentState = await peers.request();
  if (!currentState.has(room)) return;
  currentState.set(room, peersList);
  peers.send(currentState);
}