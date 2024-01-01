import UserMessage from "/components/user-message.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

/**
 * @typedef {import('/assets/room.js').default} Room
 * @typedef {import('/assets/room-peer-connection.js').default} RoomPeerConnection
 */

const mixin = await mixinForShadowContent("room-messages");

export default class RoomMessages extends mixin(HTMLElement) {
	#messageList = /** @type {HTMLOListElement} */ (
		this.shadow.getElementById("message-list")
	);

	/**
	 * @type {Map<RoomPeerConnection, (e: MessageEvent) => void>}
	 */
	#peerConnections = new Map();

	#peerChangeListener = () => {
		if (!this.room) {
			this.#clearPeerConnections();
			return;
		}
		const newPeers = new Set(this.room.peers.values());
		for (const newPeer of newPeers) {
			if (!this.#peerConnections.has(newPeer)) {
				this.#addNewPeer(newPeer);
			}
		}
		for (const oldPeer of this.#peerConnections.keys()) {
			if (!newPeers.has(oldPeer)) {
				this.#removePeer(oldPeer);
			}
		}
	};

	/**
	 * @type {Room | null} associated room passed in from the parent
	 */
	#room = null;

	get room() {
		return this.#room;
	}

	set room(room) {
		this.#room?.removePeerChangeCallback(this.#peerChangeListener);
		this.#room = room;
		this.#handleRoomChange();
	}

	connectedCallback() {
		super.connectedCallback?.();
		this.#handleRoomChange();
	}

	disconnectedCallback() {
		this.#clearPeerConnections();
	}

	#clearPeerConnections() {
		for (const peer of this.#peerConnections.keys()) {
			this.#removePeer(peer);
		}
	}

	#handleRoomChange() {
		this.#clearPeerConnections();
		if (!this.room) return;
		for (const peer of this.room.peers.values()) {
			this.#addNewPeer(peer);
		}
		this.room.onPeerChange(this.#peerChangeListener);
	}

	/**
	 * Listen to messages from peers and add to peer connection set
	 * @param {RoomPeerConnection} peer
	 */
	#addNewPeer(peer) {
		/**
		 * Message listener callback for all peers
		 * @param {MessageEvent} e
		 */
		const messageListener = (e) => {
			const { data } = e;
			if (typeof data !== "string") return;
			console.debug("message event in room-messages", e, data);
			const userMessage = new UserMessage();
			userMessage.message = data;
			userMessage.user = peer.user;
			userMessage.role = "listitem";
			this.#messageList.appendChild(userMessage);
		};

		peer.messageChannel.addEventListener("message", messageListener);
		this.#peerConnections.set(peer, messageListener);
	}

	/**
	 * Removes event listeners from peer and deletes from peer connection set
	 * @param {RoomPeerConnection} peer
	 */
	#removePeer(peer) {
		const listener = this.#peerConnections.get(peer);
		if (listener) {
			peer.messageChannel.removeEventListener("message", listener);
		}
		this.#peerConnections.delete(peer);
	}
}

customElements.define("room-messages", RoomMessages);
