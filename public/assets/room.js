let UID = sessionStorage.getItem("uid") || "";
if (!UID) {
	UID = Math.random().toString(36).slice(2);
	sessionStorage.setItem("uid", UID);
}

export class RoomPeerConnection {
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
	 * Promise that resolves when the websocket is connected
	 * @type {Promise<void>}
	 */
	wsConnected;
	/**
	 * Events from the peer connection will be forwarded to this event target
	 * @type {EventTarget}
	 */
	connectionEvents = new EventTarget();
	/**
	 * Id of the other user to connect to
	 * @type {string}
	 */
	user;

	/**
	 * When listening to the message channel, this will be a function to remove the listeners
	 * @type {(() => void) | null}
	 */
	#removeMessageChannelListeners = null;
	/**
	 * @type {RTCDataChannel | null}
	 */
	#messageChannel = null;
	get messageChannel() {
		return this.#messageChannel;
	}

	set messageChannel(channel) {
		this.#messageChannel = channel;
		this.#messageChannelChange(channel);
	}

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
						const oldConnection = this.peerConnection;
						this.peerConnection = new RTCPeerConnection(
							RoomPeerConnection.servers
						);
						this.peerConnectionListeners(message);
						oldConnection.close();
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
	 * Add event listeners to the message channel
	 * @param {RTCDataChannel | null} channel
	 */
	#messageChannelChange(channel) {
		this.#removeMessageChannelListeners?.();
		if (!channel) return;
		/**
		 * @param {MessageEvent} e
		 */
		const onMessage = ({ data }) => {
			console.log("message: ", data);
			alert(data);
		};

		const onClose = () => {
			console.log("message channel closed");
			this.messageChannel = null;
		};

		/**
		 * @param {Event} e
		 */
		const onError = (e) => {
			console.error("message channel error", e);
		};

		const onOpen = () => {
			console.log("message channel open");
		};

		channel.addEventListener("message", onMessage);
		channel.addEventListener("close", onClose);
		channel.addEventListener("error", onError);
		channel.addEventListener("open", onOpen);

		this.#removeMessageChannelListeners = () => {
			channel.removeEventListener("message", onMessage);
			channel.removeEventListener("close", onClose);
			channel.removeEventListener("error", onError);
			channel.removeEventListener("open", onOpen);
		};
	}

	/**
	 * Adds event listeners and sets the offer. Can be used when the connection needs to be reset
	 * @param {RTCSessionDescriptionInit} [offer]
	 */
	peerConnectionListeners(offer) {
		/**
		 * @param {Event} e
		 */
		const forwardEvent = (e) =>
			this.connectionEvents.dispatchEvent(new Event(e.type));
		this.peerConnection.addEventListener("icecandidateerror", (e) => {
			console.error("icecandidateerror", e);
			forwardEvent(e);
		});
		this.peerConnection.addEventListener("icecandidate", (e) => {
			if (!e.candidate) return;
			this.signalOverWs(e.candidate);
			forwardEvent(e);
		});
		this.peerConnection.addEventListener("datachannel", (e) => {
			console.log("datachannel", e);
			this.setDataChannel(e.channel);
			forwardEvent(e);
		});
		this.peerConnection.addEventListener("icegatheringstatechange", (e) => {
			console.log(
				"ICE gathering state changed: ",
				this.peerConnection.iceGatheringState
			);
			forwardEvent(e);
		});

		this.peerConnection.addEventListener("connectionstatechange", (e) => {
			console.log(
				"connection state changed: ",
				this.peerConnection.connectionState
			);
			forwardEvent(e);
		});

		this.peerConnection.addEventListener("signalingstatechange", (e) => {
			if (this.peerConnection.signalingState === "stable") {
				console.log("signaling state stable");
			}
			forwardEvent(e);
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
		this.messageChannel = this.peerConnection.createDataChannel("message");
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
		switch (dataChannel.label) {
			case "message":
				this.messageChannel = dataChannel;
				break;
		}
	}

	/**
	 * Send data through a channel by label
	 * @param {string} data data to send through the channel
	 * @param {string} label channel label
	 */
	sendData(data, label) {
		let channel;
		switch (label) {
			case "message":
				channel = this.messageChannel;
				break;
		}
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
	 * Broadcast data to all peers
	 * @param {string} data data to broadcast
	 * @param {string} label channel to broadcast on
	 */
	broadcast(data, label) {
		for (const peer of this.peers.values()) {
			peer.sendData(data, label);
		}
	}

	leave() {
		this.ws.close();
		for (const peer of this.peers.values()) {
			console.debug("closing peer connection", peer.user);
			peer.peerConnection.close();
		}
	}
}
