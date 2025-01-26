/** @import { Room } from "/lib/validate-room.js" */
/** @import { UserId } from "/lib/validate-user-id.js" */

/**
* @param {Room} room
* @param {UserId} uid */
export function createRoomWebSocket(room, uid) {
	const url = new URL(`/api/room/${room}`, location.origin);
	url.searchParams.set('userId', uid);
	return new WebSocket(url);
}

/**
 * @param {Iterable<Room>} newRooms 
 * @param {Iterable<Room>} oldRooms 
 */
export function roomsDifference(newRooms, oldRooms) {
	const newRoomsSet = new Set(newRooms);
	const oldRoomsSet = new Set(oldRooms);
	return {
		roomsToAdd: newRoomsSet.difference(oldRoomsSet),
		roomsToRemove: oldRoomsSet.difference(newRoomsSet),
	};
}


/**
 * @typedef RoomUsers
 * @prop {string[]} users
 * 
 * @typedef ConnectionNegotiation
 * @prop {string | string[]} to users the message was sent to
 * @prop {'offer' | 'answer'} type
 * @prop {string} from
 */