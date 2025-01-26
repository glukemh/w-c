import { DurableObject } from "cloudflare:workers";

/**
 * @typedef {{ ROOM: DurableObjectNamespace }} Env
 */

export default {
	async fetch() {
		return new Response("RTC Signaling");
	},
};

export class Room extends DurableObject {
	/**
	 * Durable Object constructor
	 * @param {DurableObjectState} state
	 * @param {Env} env
	 */
	constructor(state, env) {
		super(state, env);
		this.state = state;
	}

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
		const userId = url.searchParams.get("userId");
		if (!userId) {
			return new Response('Expected userId', { status: 400 });
		}
		let [client, server] = Object.values(new WebSocketPair());
		/** @type {string[]} */
		const users = [];
		for (const ws of this.state.getWebSockets()) {
			if (ws.readyState !== WebSocket.READY_STATE_OPEN) continue;
			const attachment = ws.deserializeAttachment();
			if (attachment?.userId === userId) {
				ws.close();
			} else if (typeof attachment?.userId === "string") {
				users.push(attachment.userId);
			}
		}
		this.state.acceptWebSocket(server, [userId]);
		server.serializeAttachment({ userId });
		server.send(JSON.stringify({ users }));
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	/**
	 * Effectively a "message" event listener for a WebSocket accepted via state.acceptWebSocket()
	 * @param {WebSocket} ws
	 * @param {string | ArrayBuffer} rawMessage
	 */
	webSocketMessage(ws, rawMessage) {
		if (typeof rawMessage !== "string") {
			return;
		}
		if (rawMessage === 'ping') {
			ws.send('pong');
			return;
		}
		const message = JSON.parse(rawMessage);
		if (typeof message?.to === "string") {
			this.broadcastMessageByTag(rawMessage, message.to);
		} else if (Array.isArray(message?.to)) {
			for (const userId of message.to) {
				if (typeof userId !== "string") continue;
				this.broadcastMessageByTag(rawMessage, userId);
			}
		}
	}

	/**
	 * Called by the system when any non-disconnection related errors occur.
	 * @param {WebSocket} ws
	 * @param {any} error
	 */
	webSocketError(ws, error) {
		console.error(`Error with websocket ${ws.url}`, error);
	}

	/**
	 *
	 * @param {string} [tag]
	 * @param {Parameters<WebSocket["send"]>[0]} message
	 */
	broadcastMessageByTag(message, tag) {
		for (const ws of this.state.getWebSockets(tag)) {
			if (ws.readyState !== WebSocket.READY_STATE_OPEN) continue;
			ws.send(message);
		}
	}
}
