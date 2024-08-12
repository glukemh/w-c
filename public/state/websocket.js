import { State } from "/state/state.js";
import { roomIds } from "/state/room-ids.js";
import { uid } from "/state/uid.js";

/** @type {State<WebSocket | null>} */
const websocketState = new State();
websocketState.update(async function* () {
	for await (const id of uid()) {
		const url = new URL(`/api/room/${id}`, location.origin);
		url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
		url.searchParams.set("uid", id);
		yield (ws) => {
			ws?.close();
			return new WebSocket(url);
		};
	}
}, null);

export function websocket() {
	return websocketState.subscribe();
}

/** @type {State<WebSocket['readyState']>} */
const websocketReadyState = new State((a, b) => a === b);
websocketReadyState.from(async function* () {
	for await (const ws of websocketState.subscribe()) {
		if (ws === null) {
			yield WebSocket.CONNECTING;
			continue;
		}
		let p = Promise.withResolvers();
		const callback = () => {
			p.resolve(ws.readyState);
			p = Promise.withResolvers();
		};
		ws.addEventListener("open", callback, { once: true });
		ws.addEventListener("close", callback, { once: true });
		ws.addEventListener(
			"error",
			(e) => {
				console.error(e);
				callback();
			},
			{ once: true }
		);
		while (ws.readyState !== WebSocket.CLOSED) {
			yield ws.readyState;
			await p.promise;
		}
		yield ws.readyState;
	}
});

export function websocketConnectionState() {
	return websocketReadyState.subscribe();
}
