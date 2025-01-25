/** @import { Room } from "/lib/validate-room.js" */
/** @import { State, ConnectedUser } from "/channels/connected-users.js" */
import { SendChannel } from "/lib/state-channel.js";
import rooms from "/channels/rooms.js";

/** @type {SendChannel<State>} */
const connectedUsers = new SendChannel("connected-users");
connectedUsers.send(new Map());

rooms.subscribe(async (iter) => {
  for await (const roomsSet of iter) {
    const connectedUsersState = await connectedUsers.request();
    const connectedUsersRooms = new Set(connectedUsersState.keys());
    const roomsToAdd = roomsSet.difference(connectedUsersRooms);
    const roomsToRemove = connectedUsersRooms.difference(roomsSet);
    for (const room of roomsToAdd) {
      connectedUsersState.set(room, []);
    }
    for (const room of roomsToRemove) {
      connectedUsersState.delete(room);
    }
    connectedUsers.send(connectedUsersState);
  }
});

/**
 * @param {Room} room
 * @param {ConnectedUser[]} connectedUsersList */
export async function setConnectedUsers(room, connectedUsersList) {
  const currentState = await connectedUsers.request();
  if (!currentState.has(room)) return;
  currentState.set(room, connectedUsersList);
  connectedUsers.send(currentState);
}