/**
 * @typedef {WebSocket & { accept: () => void }} WebSocketWithAccept
 */

/**
 * @typedef {{ ROOM: DurableObjectNamespace }} Env
 */

export default {
	/**
	 *
	 * @param {Request} request
	 * @param {Env} env
	 */
	async fetch(request, env) {
		const id = env.ROOM.idFromName(new URL(request.url).pathname);
		const stub = env.ROOM.get(id);
		const response = await stub.fetch(request);
		return response;
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
		console.debug("~~~ upgradeHeader", upgradeHeader);
		if (upgradeHeader?.toLowerCase() !== "websocket") {
			return new Response("Expected websocket", { status: 426 });
		}
		const url = new URL(request.url);
		const uid = url.searchParams.get("uid");
		console.debug("~~~ uid", uid);
		if (!uid) {
			return new Response("Expected uid", { status: 400 });
		}
		let [client, server] = Object.values(new WebSocketPair());
		/** @type {WebSocketWithAccept} */ (server).accept();
		const existingClient = this.sessions.get(uid);
		if (existingClient) {
			existingClient.close();
		}

		console.debug("~~~ server", server);

		server.addEventListener("message", async (event) => {
			if (typeof event.data !== "string") {
				return;
			}
			const message = JSON.parse(event.data);
			if (typeof message.to === "string") {
				const client = this.sessions.get(message.uid);
				if (!client) return;
				client.send(JSON.stringify(message));
			} else if (Array.isArray(message.to)) {
				for (const uid of message.to) {
					if (typeof uid !== "string") continue;
					const client = this.sessions.get(uid);
					if (!client) continue;
					client.send(JSON.stringify(message));
				}
			}
		});

		this.sessions.set(uid, client);
		client.send(JSON.stringify({ users: [...this.sessions.keys()] }));
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}
}
