/** @import { Updater, CallbackValues } from "/state/state.js" */
import { State, callbackValues } from "/state/state.js";
import { webSockets } from "/state/room-connections.js";

/** @typedef {Map<WebSocket, { message: unknown, timestamp: number}[]>} WebSocketMessageMap */

/** @type {State<WebSocketMessageMap>} */
const webSocketMessageState = new State();
webSocketMessageState.updateFrom(async function* () {
	for await (const webSocketRecord of webSockets()) {
		const webSocketSet = new Set(Object.values(webSocketRecord));

		yield /** @param {WebSocketMessageMap} current */ (current) => {
			const currentWebSockets = new Set(current.keys());
			const newWebSockets = webSocketSet.difference(currentWebSockets);
			const oldWebSockets = currentWebSockets.difference(webSocketSet);
			for (const ws of oldWebSockets) {
				current.delete(ws);
			}
			for (const ws of newWebSockets) {
				current.set(ws, []);
				webSocketMessageState.updateFrom(
					() => updateNewWebSocketMessages(ws),
					current
				);
			}
			return current;
		};
	}
}, new Map());

/**
 * @param {WebSocket} ws
 * @returns {ReturnType<Updater<WebSocketMessageMap>>}*/
async function* updateNewWebSocketMessages(ws) {
	/** @type {CallbackValues<MessageEvent<any>>} */
	const { callback, values } = callbackValues();
	const events = values();
	ws.addEventListener("message", callback);
	ws.addEventListener("close", () => events.return(), { once: true });
	try {
		for await (const event of events) {
			if (typeof event.data !== "string") continue;
			try {
				const message = JSON.parse(event.data);
				yield (current) => {
					current.get(ws)?.unshift({ message, timestamp: Date.now() });
					return current;
				};
			} catch (e) {
				console.error(e);
			}
		}
	} finally {
		ws.removeEventListener("message", callback);
	}
}

export function webSocketMessage() {
	return webSocketMessageState.subscribe();
}
