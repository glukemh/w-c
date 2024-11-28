/** @type {Map<string, WebSocket>} */
const connections = new Map();
/** @param {string} room room id */
const roomWebSocket = (room) => {
	const ws = connections.get(room);
	if (
		!ws ||
		ws.readyState === WebSocket.CLOSED ||
		ws.readyState === WebSocket.CLOSING
	) {
		const url = new URL(`/api/room/${room}`, location.origin);
		url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
		const ws = new WebSocket(url);
		connections.set(room, ws);
		return ws;
	} else {
		return ws;
	}
};

/** @param {FetchEvent} ev */
export const handleWebSocketFetch = (ev) => {
	const { request } = ev;
	const url = new URL(request.url);
	const match = url.pathname.match(/^\/api\/room\/(\w+)$/);
	if (!match) return false;
	const [_, room] = match;
	const ws = roomWebSocket(room);
	const controller = new AbortController();
	const listenerOptions = { signal: controller.signal };
	const wsOpened = () => {
		controller.abort();
		ev.respondWith(new Response("websocket opened"));
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
				ev.respondWith(new Response("websocket error", { status: 500 }));
			},
			listenerOptions
		);
	}
	return true;
};
