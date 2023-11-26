let UID = sessionStorage.getItem("uid") || "";
if (!UID) {
	UID = Math.random().toString(36).slice(2);
	sessionStorage.setItem("uid", UID);
}

class RoomPeerConnection {
	static servers = {
		iceServers: [
			{
				urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
			},
		],
	};
	/**
	 * @type {RTCDataChannel | null}
	 */
	dataChannel = null;
	/**
	 * Promise that resolves when the websocket is connected
	 * @type {Promise<void>}
	 */
	wsConnected;
	/**
	 * Id of the other user to connect to
	 * @type {string}
	 */
	user;
	/**
	 * WebSocket used to signal
	 * @param {WebSocket} ws
	 * @param {string} user
	 * @param {RTCSessionDescriptionInit} [offer]
	 */
	constructor(user, ws, offer) {
		this.user = user;
		this.ws = ws;
		this.wsConnected = new Promise((resolve, reject) => {
			switch (ws.readyState) {
				case WebSocket.CONNECTING:
					ws.addEventListener("open", () => resolve());
					break;
				case WebSocket.OPEN:
					resolve();
					break;
				default:
					reject();
					break;
			}
		});
		this.peerConnection = new RTCPeerConnection(RoomPeerConnection.servers);
		this.peerConnection.addEventListener("icecandidate", (e) => {
			if (!e.candidate) return;
			this.signalOverWs(e.candidate);
		});
		this.peerConnection.addEventListener("datachannel", (e) => {
			console.log("datachannel", e);
			const { channel } = e;
			channel.addEventListener("open", () => {
				console.log("datachannel open");
				this.dataChannel = channel;
			});
			channel.addEventListener("message", (e) => {
				console.log("datachannel message", e);
			});
			channel.addEventListener("close", () => {
				console.log("datachannel close");
				this.dataChannel = null;
			});
		});

		this.ws.addEventListener("message", async (e) => {
			if (typeof e.data !== "string") return;
			const data = JSON.parse(e.data);
			if (data.from !== this.user) return;
			const { message } = data;
			switch (message.type) {
				case "offer":
					this.answer(/** @type {RTCSessionDescriptionInit} */ (message));
					break;
				case "answer":
					this.peerConnection.setRemoteDescription(message);
					break;
				case "candidate":
					this.peerConnection.addIceCandidate(message);
					break;
			}
		});
		if (offer) {
			this.answer(offer);
		} else {
			this.offer();
		}
	}

	/**
	 * Answer to an offer
	 * @param {RTCSessionDescriptionInit} offer
	 * @returns {Promise<void>}
	 */
	async answer(offer) {
		this.peerConnection.setRemoteDescription(offer);
		const answer = await this.peerConnection.createAnswer();
		this.peerConnection.setLocalDescription(answer);
		this.signalOverWs(answer);
	}

	/**
	 * Send an offer to the other user
	 * @returns {Promise<void>}
	 */
	async offer() {
		const offer = await this.peerConnection.createOffer();
		this.peerConnection.setLocalDescription(offer);
		this.signalOverWs(offer);
	}

	/**
	 * Send messages over websocket primarily for signaling
	 * @param {any} message
	 */
	async signalOverWs(message) {
		await this.wsConnected;
		this.ws.send(JSON.stringify({ from: UID, to: this.user, message }));
	}
}

class Room {
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
			console.log("Disconnected from room");
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
				const peer = new RoomPeerConnection(user, this.ws);
				this.peers.set(user, peer);
				peer.offer();
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
			const peer = new RoomPeerConnection(...constructorParams);
			this.peers.set(data.from, peer);
		}
	}
}

export default Room;
