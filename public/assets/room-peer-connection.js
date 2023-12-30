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
		this.#instantiatePeerConnection(offer);
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
					this.#instantiatePeerConnection(message);
					break;
				case "answer":
					if (!this.peerConnection) {
						this.#instantiatePeerConnection();
					} else {
						this.peerConnection.setRemoteDescription(message);
					}
					break;
				default:
					if (message.candidate !== undefined) {
						if (!this.peerConnection) {
							this.#instantiatePeerConnection();
						} else {
							this.peerConnection.addIceCandidate(message);
						}
					}
					break;
			}
		});
		this.messageChannel.addEventListener("message", (e) => {
			if (e instanceof MessageEvent) {
				alert(e.data);
			}
		});
		this.messageChannel.addEventListener("close", () => {
			console.debug("message channel closed");
			if (!this.peerConnection) return;
			this.peerConnection.close();
			// Calling close() on the peer will not trigger any events, so manually dispatch connectionstatechange event to notify any listeners
			this.peerConnection.dispatchEvent(new Event("connectionstatechange"));
		});
	}

	/**
	 * Adds event listeners and sets the offer. Can be used when the connection needs to be reset
	 * @param {RTCSessionDescriptionInit} [offer]
	 */
	#instantiatePeerConnection(offer) {
		this.#removePeerConnectionListeners?.();
		const peerConnection = new RTCPeerConnection(RoomPeerConnection.servers);
		this.peerConnection = peerConnection;

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
				this.user,
				peerConnection.connectionState
			);
			forwardEvent(e);
		};
		/**
		 * @param {Event} e
		 */
		const onSignalingStateChange = (e) => {
			forwardEvent(e);
		};

		/**
		 * @param {Event} e
		 */
		const onNegotiationNeeded = async (e) => {
			forwardEvent(e);
			console.debug("negotiation needed");
			try {
				const offer = await peerConnection.createOffer();
				await peerConnection.setLocalDescription(offer);
				await this.signalOverWs(peerConnection.localDescription);
			} catch (err) {
				console.error("negotiation error", err);
			}
		};

		// Set event listeners
		peerConnection.addEventListener("icecandidateerror", onIceCandidateError);
		peerConnection.addEventListener("icecandidate", onIceCandidate);
		peerConnection.addEventListener("datachannel", onDataChannel);
		peerConnection.addEventListener(
			"icegatheringstatechange",
			onIceGatheringStateChange
		);
		peerConnection.addEventListener(
			"connectionstatechange",
			onConnectionStateChange
		);
		peerConnection.addEventListener(
			"signalingstatechange",
			onSignalingStateChange
		);
		peerConnection.addEventListener("negotiationneeded", onNegotiationNeeded);

		// Set remove event listeners function
		this.#removePeerConnectionListeners = () => {
			peerConnection.removeEventListener(
				"icecandidateerror",
				onIceCandidateError
			);
			peerConnection.removeEventListener("icecandidate", onIceCandidate);
			peerConnection.removeEventListener("datachannel", onDataChannel);
			peerConnection.removeEventListener(
				"icegatheringstatechange",
				onIceGatheringStateChange
			);
			peerConnection.removeEventListener(
				"connectionstatechange",
				onConnectionStateChange
			);
			peerConnection.removeEventListener(
				"signalingstatechange",
				onSignalingStateChange
			);
			peerConnection.removeEventListener(
				"negotiationneeded",
				onNegotiationNeeded
			);
		};

		if (offer) {
			// Handle offer
			this.answer(offer);
		} else {
			// Create data channel
			this.setDataChannel(peerConnection.createDataChannel("message"));
		}
	}

	/**
	 * Answer to an offer
	 * @param {RTCSessionDescriptionInit} offer
	 * @returns {Promise<void>}
	 */
	async answer(offer) {
		if (!this.peerConnection) return;
		try {
			await this.peerConnection.setRemoteDescription(offer);
			const answer = await this.peerConnection.createAnswer();
			await this.peerConnection.setLocalDescription(answer);
			this.signalOverWs(answer);
		} catch (err) {
			console.error("error answering", err);
		}
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
		}
	}

	/**
	 * Send a message through the message channel
	 * @param {string} message
	 */
	sendMessage(message) {
		this.messageChannel.sendData(message);
	}

	/**
	 * Close the connection
	 */
	close() {
		this.messageChannel.close();
		this.peerConnection?.close();
	}
}
