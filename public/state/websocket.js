import { State } from "/state/state.js";
import { uid } from "/state/uid.js";

/** @type {State<WebSocket>} */
const websocketState = new State();
websocketUpdater();

async function websocketUpdater() {
	const uidIter = uid();
	const { value: id, done } = await uidIter.next();
	if (done) return;
	websocketState.set(websocketFromId(id));
	for await (const id of uidIter) {
		websocketState.update((ws) => {
			ws?.close();
			return websocketFromId(id);
		});
	}
}
function websocketFromId(id) {
	const url = new URL(`/api/room/${id}`, location.origin);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.searchParams.set("uid", id);
	return new WebSocket(url);
}

export function websocket() {
	return websocketState.subscribe();
}

/** @type {State<WebSocket['readyState']>} */
const websocketReadyState = new State((a, b) => a === b);
websocketReadyStateSetter();

export function websocketConnectionState() {
	return websocketReadyState.subscribe();
}

async function websocketReadyStateSetter() {
	let controller = new AbortController();
	for await (const ws of websocketState.subscribe()) {
		if (ws === null) {
			websocketReadyState.set(WebSocket.CONNECTING);
			continue;
		}
		controller.abort();
		controller = new AbortController();
		const callback = () => websocketReadyState.set(ws.readyState);
		ws.addEventListener("open", callback, { signal: controller.signal });
		ws.addEventListener("close", callback, { signal: controller.signal });
		ws.addEventListener(
			"error",
			(e) => {
				console.error(e);
				callback();
			},
			{ signal: controller.signal }
		);
		callback();
	}
}

/** @type {State<string>} */
const websocketCloseReason = new State((a, b) => a === b);
websocketCloseReasonSetter();

export function websocketCloseReasonState() {
	return websocketCloseReason.subscribe();
}

async function websocketCloseReasonSetter() {
	let controller = new AbortController();
	for await (const ws of websocketState.subscribe()) {
		websocketCloseReason.set("");
		if (ws === null) continue;
		controller.abort();
		controller = new AbortController();
		ws.addEventListener("close", (e) => websocketCloseReason.set(e.reason), {
			signal: controller.signal,
		});
	}
}
