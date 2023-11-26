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
 * @typedef {{ ROOM: DurableObjectNamespace }} Env
 */

/**
 * @typedef {WebSocket & { accept: () => void }} WebSocketWithAccept
 */

/**
 * @param {Parameters<PagesFunction<Env, "roomName">>} args
 * @returns {Promise<Response>}
 */
export async function onRequestGet(...args) {
	console.log("~~~ onRequestPost", args);

	const [{ request, env, params }] = args;
	const { roomName } = params;
	if (typeof roomName !== "string" || roomName.length > 32) {
		return new Response("Expected roomName (shorter than 32 characters)", {
			status: 400,
		});
	}
	const { ROOM } = env;
	console.debug("~~~ ROOM", ROOM);
	try {
		const room = ROOM.get(ROOM.idFromName(roomName));
		console.debug("~~~ room", room);
		const res = await room.fetch(request);
		console.debug("~~~ res", res);
		return res;
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

export class Room {
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
			// @ts-ignore
			webSocket: client,
		});
	}
}
