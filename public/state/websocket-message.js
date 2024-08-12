import { State } from "/state/state.js";
import { websocket } from "/state/websocket.js";

/** @type {State<unknown[]>} */
const websocketMessageState = new State((a, b) => a === b);
websocketMessageUpdater();

export function websocketMessage() {
	return websocketMessageState.subscribe();
}

async function websocketMessageUpdater() {
	websocketMessageState.set([]);
	let controller = new AbortController();
	for await (const ws of websocket()) {
		if (ws === null) continue;
		controller.abort();
		controller = new AbortController();
		ws.addEventListener(
			"message",
			(e) => {
				try {
					if (typeof e.data !== "string")
						throw new Error("Expected string data from websocket");
					const data = JSON.parse(e.data);
					websocketMessageState.update((a) => {
						a.push(data);
						return a;
					});
				} catch (e) {
					console.error(e);
				}
			},
			{
				signal: controller.signal,
			}
		);
	}
}
