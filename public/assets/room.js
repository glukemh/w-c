let UID = sessionStorage.getItem("uid") || "";
if (!UID) {
	UID = Math.random().toString(36).slice(2);
	sessionStorage.setItem("uid", UID);
}

class RoomPeerConnection {
	static servers = {
		iceServers: [
			{
				urls: [
					"stun:stun.l.google.com:19302",
					"stun:stun1.l.google.com:19302",
					"stun:stun2.l.google.com:19302",
				],
			},
		],
	};
	/**
	 * @type {Record<string, RTCDataChannel}
	 */
	dataChannel = {};
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
		this.peerConnection = new RTCPeerConnection(RoomPeerConnection.servers);
		this.peerConnectionListeners(offer);
		this.ws = ws;
		this.wsConnected = new Promise((resolve, reject) => {
			switch (ws.readyState) {
				case WebSocket.OPEN:
					resolve();
					break;
				case WebSocket.CONNECTING:
					ws.addEventListener("open", () => resolve());
					break;
				default:
					reject();
					break;
			}
		});
		this.ws.addEventListener("message", async (e) => {
			if (typeof e.data !== "string") return;
			const data = JSON.parse(e.data);
			if (data.from !== this.user) return;
			const { message } = data;
			switch (message.type) {
				case "offer":
					if (this.peerConnection.connectionState === "connected") {
						this.peerConnection.close();
						this.peerConnection = new RTCPeerConnection(
							RoomPeerConnection.servers
						);
						this.peerConnectionListeners(message);
					} else {
						this.answer(/** @type {RTCSessionDescriptionInit} */ (message));
					}
					break;
				case "answer":
					this.peerConnection.setRemoteDescription(message);
					break;
				default:
					if (message.candidate !== undefined) {
						this.peerConnection.addIceCandidate(message);
					}
					break;
			}
		});
	}

	/**
	 * Adds event listeners and sets the offer. Can be used when the connection needs to be reset
	 * @param {RTCSessionDescriptionInit} [offer]
	 */
	peerConnectionListeners(offer) {
		this.peerConnection.addEventListener("icecandidateerror", (e) => {
			console.error("icecandidateerror", e);
		});
		this.peerConnection.addEventListener("icecandidate", (e) => {
			if (!e.candidate) return;
			this.signalOverWs(e.candidate);
		});
		this.peerConnection.addEventListener("datachannel", (e) => {
			console.log("datachannel", e);
			const { channel } = e;
			this.setDataChannel(channel);
		});
		this.peerConnection.addEventListener("icegatheringstatechange", () => {
			console.log(
				"ICE gathering state changed: ",
				this.peerConnection.iceGatheringState
			);
		});

		this.peerConnection.addEventListener("connectionstatechange", () => {
			console.log(
				"connection state changed: ",
				this.peerConnection.connectionState
			);
		});

		this.peerConnection.addEventListener("signalingstatechange", () => {
			if (this.peerConnection.signalingState === "stable") {
				console.log("signaling state stable");
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
		await this.peerConnection.setRemoteDescription(offer);
		const answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);
		this.signalOverWs(answer);
	}

	/**
	 * Send an offer to the other user
	 * @returns {Promise<void>}
	 */
	async offer() {
		this.setDataChannel(this.peerConnection.createDataChannel("file"));
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
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

	/**
	 * @param {RTCDataChannel} dataChannel
	 */
	setDataChannel(dataChannel) {
		console.log("setDataChannel", dataChannel);
		this.dataChannel[dataChannel.label]?.close();
		this.dataChannel[dataChannel.label] = dataChannel;
		dataChannel.addEventListener("message", (e) => {
			console.log(`message on channel ${dataChannel.label}\n`, e.data);
		});
		dataChannel.addEventListener("open", () => {
			console.log(`channel ${dataChannel.label} open`);
		});
		dataChannel.addEventListener("close", () => {
			delete this.dataChannel[dataChannel.label];
		});
		dataChannel.addEventListener("error", (e) => {
			console.error(`channel ${dataChannel.label} error`, e);
		});
	}

	/**
	 * Send data through a channel by label
	 * @param {string} data data to send through the channel
	 * @param {string} label channel label
	 */
	sendData(data, label) {
		const channel = this.dataChannel[label];
		switch (channel?.readyState) {
			case "open":
				channel.send(data);
				break;
			case "connecting":
				channel.addEventListener("open", () => channel.send(data));
				break;
		}
	}
}

class Room {
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
				this.peers.set(user, new RoomPeerConnection(user, this.ws));
				this.#peersChanged();
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
			this.peers.set(data.from, new RoomPeerConnection(...constructorParams));
			this.#peersChanged();
		}
	}

	#peersChanged() {
		const peers = [...this.peers.keys()];
		for (const callback of this.#peerChangeCallbacks) {
			callback(peers);
		}
	}

	/**
	 * Register a callback which will be called when the list of peers changes
	 * @param {(peers: string[]) => void} callback
	 */
	addPeerChangeCallback(callback) {
		this.#peerChangeCallbacks.push(callback);
	}

	/**
	 * Broadcast data to all peers
	 * @param {string} data data to broadcast
	 * @param {string} label channel to broadcast on
	 */
	broadcast(data, label) {
		for (const peer of this.peers.values()) {
			peer.sendData(data, label);
		}
	}
}

export default Room;
