/** @import { Room } from "/lib/validate-room.js" */
import rooms from "/sw/state/rooms.js";
import userId from "/sw/state/user-id.js";


/** @type {Map<Room, WebSocket>} */
const connections = new Map();
rooms.subscribe(async (iter) => {
	for await (const roomsSet of iter) {
		for (const [room, ws] of connections) {
			if (roomsSet.has(room)) {
				roomsSet.delete(room);
				continue;
			};
			ws.close(undefined, "rooms changed");
			connections.delete(room);
		}
		// new rooms
		roomsSet.forEach(createRoomWebSocket);
	}
});

/** @param {Room} room room id */
export default async function roomWebSocket(room) {
	let ws = connections.get(room);
	/** @type {number[]} */
	const closedStates = [WebSocket.CLOSED, WebSocket.CLOSING];
	if (!ws || closedStates.includes(ws.readyState)) {
		ws = await createRoomWebSocket(room);
	}
	return ws;
};

/**
 * @param {Room} room
 * @returns {Promise<WebSocket>}*/
export async function roomWSWhenOpen(room) {
	const ws = await roomWebSocket(room);
	return new Promise((resolve, reject) => {
		if (ws.readyState === ws.OPEN) {
			resolve(ws);
		} else {
			const controller = new AbortController;
			const options = {
				signal: controller.signal
			};
			ws.addEventListener('open', () => {
				resolve(ws);
				controller.abort();
			}, options);
			ws.addEventListener('error', (e) => {
				reject(e);
				controller.abort();
			}, options);
			ws.addEventListener("message", (e) => {
				console.debug('message', e.data);
			});
		}
	});
}

/**
 * @param {Room} room */
export async function closeRoomWebSocket(room) {
	const current = await rooms.request();
	if (!current.has(room)) return;
	rooms.send(new Set([...current].filter((r) => r !== room)));
}

/** @param {Room} room */
async function createRoomWebSocket(room) {
	const url = new URL(`/api/room/${room}`, location.origin);
	const uid = await userId.request();
	url.searchParams.set('userId', uid);
	const ws = new WebSocket(url);
	connections.set(room, ws);
	const roomsSet = await rooms.request();
	if (!roomsSet.has(room)) {
		rooms.send(new Set([...roomsSet, room]));
	}
	return ws;
}