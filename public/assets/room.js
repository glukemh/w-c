import RoomPeerConnection from "/assets/room-peer-connection.js";
import UID from "/assets/uid.js";
export default class Room {
	/**
	 * @type {((peers: string[]) => void)[]}
	 */
	#peerChangeCallbacks = [];
	/**
	 * Peer connections
	 * @type {Map<string, RoomPeerConnection>}
	 */
	peers = new Map();
	/**
	 * Websocket used for signaling
	 * @type {WebSocket}
	 */
	ws;
	get peerIds() {
		return [...this.peers.keys()];
	}
	/**
	 * Constructor takes in a room id and creates a peer connection
	 * @param {string} id
	 */
	constructor(id) {
		this.id = id;
		const url = new URL(`/api/room/${id}`, location.origin);
		url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
		url.searchParams.set("uid", UID);
		this.ws = new WebSocket(url);
		this.ws.addEventListener("open", (e) => {
			console.log("Connected to room");
		});
		this.ws.addEventListener("close", () => {
			console.log("Disconnected from websocket");
		});
		this.ws.addEventListener("error", () => {
			console.error("Error connecting to room");
		});
		this.ws.addEventListener("message", (e) => this.handleWSMessage(e));
	}

	/**
	 * Handle websocket messages
	 * @param {MessageEvent<any>} e
	 */
	async handleWSMessage(e) {
		if (typeof e.data !== "string") return;
		const data = JSON.parse(e.data);
		if (Array.isArray(data.users)) {
			// After first joining the room, an array of current users in the room is sent
			for (const user of data.users) {
				if (typeof user !== "string" || user === UID || this.peers.has(user))
					continue;
				this.#setNewUser(user, this.ws);
			}
		} else if (
			typeof data.from === "string" &&
			!this.peers.has(data.from) &&
			data.from !== UID
		) {
			// If a message is sent from a user that is not a current peer, then they should be sending an offer
			// else send an offer back
			/**
			 * @type {ConstructorParameters<typeof RoomPeerConnection>}
			 */
			const constructorParams = [data.from, this.ws];
			if (data.message?.type === "offer") {
				constructorParams.push(data.message);
			}
			this.#setNewUser(...constructorParams);
		}
	}

	/**
	 * @param {ConstructorParameters<typeof RoomPeerConnection>} params
	 */
	#setNewUser(...params) {
		const peer = new RoomPeerConnection(...params);
		this.peers.set(peer.user, peer);
		peer.connectionEvents.addEventListener("connectionstatechange", () => {
			if (peer.peerConnection.connectionState === "closed") {
				this.peers.delete(peer.user);
				this.#peersChanged();
			}
		});
		this.#peersChanged();
	}

	#peersChanged() {
		const peerIds = this.peerIds;
		for (const callback of this.#peerChangeCallbacks) {
			callback(peerIds);
		}
	}

	/**
	 * Register a callback which will be called when the list of peers changes
	 * @param {(peers: string[]) => void} callback
	 */
	onPeerChange(callback) {
		this.#peerChangeCallbacks.push(callback);
	}

	/**
	 * Broadcast message to all peers
	 * @param {string} message
	 */
	broadcastMessage(message) {
		for (const peer of this.peers.values()) {
			peer.sendMessage(message);
		}
	}

	leave() {
		this.ws.close();
		for (const peer of this.peers.values()) {
			console.debug("closing peer connection", peer.user);
			peer.close();
		}
	}
}
