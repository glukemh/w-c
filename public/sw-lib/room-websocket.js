/** @type {Map<string, WebSocket>} */
const connections = new Map();
/** @param {string} room room id */
export default function roomWebSocket(room) {
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

/**
 * @param {string} room
 * @returns {Promise<WebSocket>}*/
export function roomWSWhenOpen(room) {
	return new Promise((resolve, reject) => {
		const ws = roomWebSocket(room);
		if (ws.OPEN) {
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
		}
	});
}
