import UID from "/assets/uid.js";
import DataChannel from "/assets/data-channel.js";

export default class RoomPeerConnection {
	/**
	 * @type {"close"}
	 */
	static closeMessage = "close";

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
	 * Remove peer connection listeners
	 * @type {(() => void) | null}
	 */
	#removePeerConnectionListeners = null;

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

	#connectionChannel = new DataChannel();

	#messageChannel = new DataChannel();
	get messageChannel() {
		return this.#messageChannel;
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
		this.#peerConnectionListeners(offer);
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
			console.debug("message from websocket", data);
			const { message } = data;
			switch (message.type) {
				case "offer":
					if (this.peerConnection.connectionState === "connected") {
						const oldConnection = this.peerConnection;
						this.peerConnection = new RTCPeerConnection(
							RoomPeerConnection.servers
						);
						this.#peerConnectionListeners(message);
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
		this.messageChannel.addEventListener("message", (e) => {
			if (e instanceof MessageEvent) {
				alert(e.data);
			}
		});
		this.#connectionChannel.addEventListener("message", (e) => {
			console.debug("connection channel message", e);
			if (e instanceof MessageEvent) {
				if (e.data === RoomPeerConnection.closeMessage) {
					console.debug("closing connection");
					this.close();
				}
			}
		});
	}

	/**
	 * Adds event listeners and sets the offer. Can be used when the connection needs to be reset
	 * @param {RTCSessionDescriptionInit} [offer]
	 */
	#peerConnectionListeners(offer) {
		this.#removePeerConnectionListeners?.();

		/**
		 * Forward event  helper function
		 * @param {Event} e
		 */
		const forwardEvent = (e) => {
			this.connectionEvents.dispatchEvent(new Event(e.type));
		};

		// Define event listeners
		/**
		 * @param {Event} e
		 */
		const onIceCandidateError = (e) => {
			console.error("icecandidateerror", e);
			forwardEvent(e);
		};
		/**
		 * @param {RTCPeerConnectionIceEvent} e
		 */
		const onIceCandidate = (e) => {
			if (e.candidate) {
				this.signalOverWs(e.candidate);
			}
			forwardEvent(e);
		};
		/**
		 * @param {RTCDataChannelEvent} e
		 */
		const onDataChannel = (e) => {
			this.setDataChannel(e.channel);
			forwardEvent(e);
		};
		/**
		 * @param {Event} e
		 */
		const onIceGatheringStateChange = (e) => {
			forwardEvent(e);
		};
		/**
		 * @param {Event} e
		 */
		const onConnectionStateChange = (e) => {
			console.log(
				"connection state changed: ",
				this.peerConnection.connectionState
			);
			forwardEvent(e);
		};
		/**
		 * @param {Event} e
		 */
		const onSignalingStateChange = (e) => {
			forwardEvent(e);
		};

		// Set event listeners
		this.peerConnection.addEventListener(
			"icecandidateerror",
			onIceCandidateError
		);
		this.peerConnection.addEventListener("icecandidate", onIceCandidate);
		this.peerConnection.addEventListener("datachannel", onDataChannel);
		this.peerConnection.addEventListener(
			"icegatheringstatechange",
			onIceGatheringStateChange
		);
		this.peerConnection.addEventListener(
			"connectionstatechange",
			onConnectionStateChange
		);
		this.peerConnection.addEventListener(
			"signalingstatechange",
			onSignalingStateChange
		);

		// Set remove event listeners function
		this.#removePeerConnectionListeners = () => {
			this.peerConnection.removeEventListener(
				"icecandidateerror",
				onIceCandidateError
			);
			this.peerConnection.removeEventListener("icecandidate", onIceCandidate);
			this.peerConnection.removeEventListener("datachannel", onDataChannel);
			this.peerConnection.removeEventListener(
				"icegatheringstatechange",
				onIceGatheringStateChange
			);
			this.peerConnection.removeEventListener(
				"connectionstatechange",
				onConnectionStateChange
			);
			this.peerConnection.removeEventListener(
				"signalingstatechange",
				onSignalingStateChange
			);
		};

		// Handle offer
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
		this.setDataChannel(this.peerConnection.createDataChannel("message"));
		this.setDataChannel(this.peerConnection.createDataChannel("connection"));
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
	 * @param {RTCDataChannel} channel
	 */
	setDataChannel(channel) {
		switch (channel.label) {
			case "message":
				this.messageChannel.channel = channel;
				break;
			case "connection":
				this.#connectionChannel.channel = channel;
				break;
		}
	}

	/**
	 * Send a message through the message channel
	 * @param {string} message
	 */
	sendMessage(message) {
		this.#messageChannel.sendData(message);
	}

	/**
	 * Close the connection
	 */
	close() {
		this.#connectionChannel.sendData(RoomPeerConnection.closeMessage);
		this.peerConnection.close();
	}
}
