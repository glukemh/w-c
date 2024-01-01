import "/components/peer-connection-state-indicator.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

/**
 * @typedef {import("/components/peer-connection-state-indicator.js").default} PeerConnectionStateIndicator
 * @typedef {import("/assets/room-peer-connection").default} RoomPeerConnection
 */

const mixin = await mixinForShadowContent("peer-connection-item");

export default class PeerConnectionItem extends mixin(HTMLElement) {
	userEl = /** @type {HTMLSpanElement} */ (this.shadow.getElementById("user"));
	connectionStateIndicator = /** @type {PeerConnectionStateIndicator} */ (
		this.shadow.querySelector("peer-connection-state-indicator")
	);
	/**
	 * @type {RoomPeerConnection} associated room peer connection
	 */
	#peer;
	#connectionStateChangeCallback = () => {
		this.connectionStateIndicator.title = this.connectionState || "";
		if (this.connectionState === "closed") {
			setTimeout(() => {
				if (!this.peer || this.connectionState === "closed") {
					this.remove();
				}
			}, 5000);
		}
	};

	get peer() {
		return this.#peer;
	}

	set peer(peer) {
		this.#newPeer(peer);
	}

	get connectionState() {
		return this.peer.peerConnection?.connectionState || null;
	}

	connectedCallback() {
		this.#renderAndSetListener();
	}

	disconnectedCallback() {
		this.#removeListener();
	}

	/**
	 * Sets a new peer and adds event listeners only when connected
	 * @param {RoomPeerConnection} peer
	 */
	#newPeer(peer) {
		this.#removeListener();
		this.#peer = peer;
		if (!this.isConnected) return;
		this.#renderAndSetListener();
	}

	#removeListener() {
		this.peer?.connectionEvents.removeEventListener(
			"connectionstatechange",
			this.#connectionStateChangeCallback
		);
	}

	#renderAndSetListener() {
		this.#connectionStateChangeCallback();
		this.userEl.textContent = this.peer?.user || "";
		this.peer?.connectionEvents.addEventListener(
			"connectionstatechange",
			this.#connectionStateChangeCallback
		);
	}
}

customElements.define("peer-connection-item", PeerConnectionItem);
