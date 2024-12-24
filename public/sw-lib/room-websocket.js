const userId = Math.random().toString(36).slice(2);

/** @type {Map<string, WebSocket>} */
const connections = new Map();
/** @param {string} room room id */
export default function roomWebSocket(room) {
	let ws = connections.get(room);
	/** @type {number[]} */
	const closedStates = [WebSocket.CLOSED, WebSocket.CLOSING];
	if (!ws || closedStates.includes(ws.readyState)) {
		const url = new URL(`/api/room/${room}`, location.origin);
		url.searchParams.set('uid', userId);
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
				ws.send('ping');
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
