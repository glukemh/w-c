/**
 * @typedef {{ ROOM: DurableObjectNamespace }} Env
 */

export default {
	async fetch() {
		return new Response("RTC Signaling");
	},
};

export class Room {
	/**
	 * @type {Map<string, WebSocket>}
	 */
	sessions = new Map();
	/**
	 * Durable Object constructor
	 * @param {DurableObjectState} _state
	 */
	constructor(_state) {}

	/**
	 * Durable Object fetch handler
	 * @param {Request} request
	 */
	async fetch(request) {
		const upgradeHeader = request.headers.get("Upgrade");
		if (upgradeHeader?.toLowerCase() !== "websocket") {
			return new Response("Expected websocket", { status: 426 });
		}
		const url = new URL(request.url);
		const uid = url.searchParams.get("uid");
		if (!uid) {
			return new Response("Expected uid", { status: 400 });
		}
		let [client, server] = Object.values(new WebSocketPair());
		this.listenToWs(server, uid);
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	/**
	 * Adds listeners to the WebSocket
	 * @param {WebSocket} server
	 * @param {string} uid
	 */
	listenToWs(server, uid) {
		server.addEventListener("message", async (event) => {
			if (typeof event.data !== "string") {
				return;
			}
			/**
			 * @type {{ to: string | string[] }}
			 */
			const message = JSON.parse(event.data);
			if (typeof message.to === "string") {
				const ws = this.sessions.get(message.to);
				if (!ws) return;
				ws.send(JSON.stringify(message));
			} else if (Array.isArray(message.to)) {
				for (const uid of message.to) {
					if (typeof uid !== "string") continue;
					const ws = this.sessions.get(uid);
					if (!ws) continue;
					ws.send(JSON.stringify(message));
				}
			}
		});

		server.addEventListener("error", () => {
			this.sessions.delete(uid);
		});

		server.addEventListener("close", () => {
			this.sessions.delete(uid);
		});

		const existingClient = this.sessions.get(uid);
		if (existingClient) {
			existingClient.close();
		}
		this.sessions.set(uid, server);
		server.accept();

		if (server.readyState === WebSocket.READY_STATE_OPEN) {
			server.send(JSON.stringify({ users: [...this.sessions.keys()] }));
		} else if (server.readyState === WebSocket.READY_STATE_CONNECTING) {
			server.addEventListener("open", () => {
				server.send(JSON.stringify({ users: [...this.sessions.keys()] }));
			});
		} else {
			this.sessions.delete(uid);
		}
	}
}
