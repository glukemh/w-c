import { State } from "/state/state.js";
import { uid } from "/state/uid.js";
import { roomIds } from "/state/room-ids.js";

/** @type {State<Record<string, WebSocket>>} */
const webSocketState = new State();
webSocketState.updateFrom(async function* () {
	// Reconnect to all rooms when the user id changes
	for await (const id of uid()) {
		const { value: rooms, done } = await roomIds().next();
		if (done) continue;
		yield (current) => {
			for (const ws of Object.values(current)) {
				ws.close();
			}
			current = {};
			for (const room of rooms) {
				current[room] = newWebsocket(id, room);
			}
			return current;
		};
	}
}, {});
webSocketState.updateFrom(async function* () {
	// Handle websocket connection when entering and leaving rooms
	for await (const rooms of roomIds()) {
		const { value: id, done } = await uid().next();
		if (done) continue;
		yield (current) => {
			const websocketRooms = new Set(Object.keys(current));
			const roomsToOpen = rooms.difference(websocketRooms);
			const roomsToClose = websocketRooms.difference(rooms);
			for (const room of roomsToClose) {
				current[room].close();
				delete current[room];
			}
			for (const room of roomsToOpen) {
				current[room] = newWebsocket(id, room);
			}
			return current;
		};
	}
}, {});

/**
 * @param {string} uid
 * @param {string} room */
function newWebsocket(uid, room) {
	const url = new URL(`/api/room/${room}`, location.origin);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.searchParams.set("uid", uid);
	return new WebSocket(url);
}

export function webSockets() {
	return webSocketState.subscribe();
}

/** @type {State<Map<WebSocket, WebSocket['readyState']>>} */
const websocketReadyState = new State();
websocketReadyState.set(new Map());
webSocketReadyStateUpdater();

export function webSocketConnectionState() {
	return websocketReadyState.subscribe();
}

async function webSocketReadyStateUpdater() {
	const controller = new AbortController();
	/** @param {WebSocket} ws */
	const callback = (ws) => {
		websocketReadyState.update((current) => {
			if (current.has(ws)) {
				current.set(ws, ws.readyState);
			}
			return current;
		});
	};
	for await (const webSockets of webSocketState.subscribe()) {
		const webSocketSet = new Set(Object.values(webSockets));
		websocketReadyState.update((current) => {
			const currentWebSockets = new Set(current.keys());
			const newWebSockets = webSocketSet.difference(currentWebSockets);
			const oldWebSockets = currentWebSockets.difference(webSocketSet);
			for (const ws of oldWebSockets) {
				current.delete(ws);
			}
			for (const ws of newWebSockets) {
				current.set(ws, ws.readyState);
				ws.addEventListener("open", () => callback(ws), {
					signal: controller.signal,
				});
				ws.addEventListener(
					"close",
					(e) => {
						console.info("Websocket was closed\n" + e.reason);
						callback(ws);
					},
					{ signal: controller.signal }
				);
				ws.addEventListener(
					"error",
					(e) => {
						console.error(e);
						callback(ws);
					},
					{ signal: controller.signal }
				);
			}
			return current;
		});
	}
	controller.abort();
}
