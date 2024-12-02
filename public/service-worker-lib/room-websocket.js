import { Route } from "/service-worker-lib/router.js";

/** @type {Map<string, WebSocket>} */
const connections = new Map();
/** @param {string} room room id */
const roomWebSocket = (room) => {
	let ws = connections.get(room);
	/** @type {number[]} */
	const closedStates = [WebSocket.CLOSED, WebSocket.CLOSING];
	if (!ws || closedStates.includes(ws.readyState)) {
		const url = new URL(`/api/room/${room}`, location.origin);
		url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
		ws = new WebSocket(url);
		connections.set(room, ws);
	}
	return ws;
};

export default new Route(/^\/api\/room\/(\w+)$/, ({ match }) => {
	const [_, room] = match;
	const ws = roomWebSocket(room);
	const controller = new AbortController();
	const listenerOptions = { signal: controller.signal };
	return new Promise((resolve) => {
		const wsOpened = () => {
			controller.abort();
			resolve(new Response("websocket opened"));
		};
		if (ws.readyState === WebSocket.OPEN) {
			wsOpened();
		} else {
			ws.addEventListener("open", wsOpened, listenerOptions);
			ws.addEventListener(
				"error",
				(e) => {
					controller.abort();
					console.error(e);
					resolve(new Response("websocket error", { status: 500 }));
				},
				listenerOptions
			);
		}
	});
});
