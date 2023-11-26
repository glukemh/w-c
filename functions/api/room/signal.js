/**
 * @typedef {Object} RTCSessionDescriptionInit
 * @property {"offer" | "answer"} type
 * @property {string} sdp
 */
/**
 * @typedef {Object} RTCIceCandidateInit
 * @property {string} candidate
 * @property {string} sdpMid
 * @property {number} sdpMLineIndex
 * @property {string} usernameFragment
 */

/**
 * @typedef {{ rooms: DurableObjectNamespace }} Env
 */

/**
 * Room object stored in KV
 * @typedef {{ offer: RTCSessionDescriptionInit, offerClient: WebSocket, answer: RTCSessionDescriptionInit, answerClient: WebSocket, iceCandidates: RTCIceCandidateInit[], createdAt: number }[]} Room
 */

/**
 * @typedef {WebSocket & { accept: () => void }} WebSocketWithAccept
 */

/**
 * @param {Parameters<PagesFunction<Env>>} args
 * @returns {Promise<Response>}
 */
export async function onRequestPost(...args) {
	const [{ request, env }] = args;
	const url = new URL(request.url);
	const roomName = url.searchParams.get("roomName");
	if (!roomName || roomName.length > 32) {
		return new Response("Expected roomName (shorter than 32 characters)", {
			status: 400,
		});
	}
	const { rooms } = env;
	try {
		const room = rooms.get(rooms.idFromName(roomName));
		return room.fetch(request);
	} catch (error) {
		console.error(error);
		return new Response("Something went wrong", { status: 500 });
	}
}

/**
 * @typedef {Object} OfferAnswers
 * @property {string} uid
 * @property {RTCSessionDescriptionInit} offer
 * @property {Map<string, RTCSessionDescriptionInit>} answer Map from uid to answer
 */

export class RoomConnection {
	/**
	 * @type {Map<string, WebSocket>}
	 */
	sessions = new Map();
	/**
	 * Durable Object constructor
	 * @param {DurableObjectState} _state
	 * @param {Env} _env
	 */
	constructor(_state, _env) {}

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
		/** @type {WebSocketWithAccept} */ (server).accept();
		const existingClient = this.sessions.get(uid);
		if (existingClient) {
			existingClient.close();
		}

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
			// @ts-ignore
			webSocket: client,
		});
	}
}
