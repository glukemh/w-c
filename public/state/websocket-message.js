import { State } from "/state/state.js";
import { websocket } from "./room-connections.js";

/** @type {State<Map<WebSocket, { message: unknown, timestamp: number}[]>>} */
const websocketMessageState = new State();
websocketMessageState.set(new Map());
websocketMessageUpdater();

export function websocketMessage() {
	return websocketMessageState.subscribe();
}

async function websocketMessageUpdater() {
	const controller = new AbortController();
	for await (const webSockets of websocket()) {
		const webSocketSet = new Set(Object.values(webSockets));
		websocketMessageState.update((current) => {
			const currentWebSockets = new Set(current.keys());
			const newWebSockets = webSocketSet.difference(currentWebSockets);
			const oldWebSockets = currentWebSockets.difference(webSocketSet);
			for (const ws of oldWebSockets) {
				current.delete(ws);
			}
			for (const ws of newWebSockets) {
				current.set(ws, []);
				ws.addEventListener(
					"message",
					(e) => {
						if (typeof e.data !== "string") return;
						try {
							const message = JSON.parse(e.data);
							websocketMessageState.update((current) => {
								current.get(ws)?.unshift({ message, timestamp: Date.now() });
								return current;
							});
						} catch (e) {
							console.error(e);
						}
					},
					{ signal: controller.signal }
				);
			}
			return current;
		});
	}
	controller.abort();
}
