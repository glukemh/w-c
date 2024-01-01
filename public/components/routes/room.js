import "/components/main-page.js";
import "/components/a-route.js";
import "/components/single-input-form.js";
import "/components/room-main-layout.js";
import RoomMessages from "/components/room-messages.js";
import PeerConnectionItem from "/components/peer-connection-item.js";
import SingleInputForm from "/components/single-input-form.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import Room from "/assets/room.js";
import linksWhenLoadedMixin from "/assets/links-when-loaded-mixin.js";

const mixin = await mixinForShadowContent("r-room");
export default class RRoom extends linksWhenLoadedMixin(mixin(HTMLElement)) {
	roomIdEl = /** @type {HTMLSpanElement} */ (
		this.shadow.getElementById("room-name")
	);
	peerListEl = /** @type {HTMLUListElement} */ (
		this.shadow.getElementById("peer-list")
	);
	messageSection = /** @type {HTMLElement} */ (
		this.shadow.getElementById("message")
	);
	broadcastForm = /** @type {SingleInputForm} */ (
		this.shadow.getElementById("broadcast-form")
	);
	roomMessages = /** @type {RoomMessages} */ (
		this.shadow.getElementById("room-messages")
	);
	/**
	 * @type {Room} room
	 */
	room;

	#linksLoaded = this.linksWhenLoaded(this.shadow);

	connectedCallback() {
		super.connectedCallback?.();
		this.room = new Room(new URLSearchParams(location.search).get("id"));
		this.roomMessages.room = this.room;
		this.roomIdEl.textContent = this.room.id;
		this.#renderPeerNames();
		this.room.onPeerChange(() => this.#renderPeerNames());
		this.broadcastForm.addEventListener("submit", (e) => {
			const formData = new FormData(this.broadcastForm.form);
			const message = formData.get("message");
			if (!message) return;
			this.room.broadcastMessage(message);
		});
		this.fadeInWhen(this.#linksLoaded);
	}

	disconnectedCallback() {
		this.room.leave();
	}

	#renderPeerNames() {
		for (const [name, peer] of this.room.peers) {
			const peerItem = this.peerListEl.children.namedItem(name);
			if (!peerItem) {
				this.#newPeer(name);
			} else if (
				peerItem instanceof PeerConnectionItem &&
				peerItem.peer !== peer
			) {
				peerItem.peer = peer;
			}
		}
	}

	/**
	 * Handle new peers
	 * @param {string} peerId
	 */
	#newPeer(peerId) {
		const peer = this.room.peers.get(peerId);
		if (!peer) return;
		const peerItem = new PeerConnectionItem();
		peerItem.peer = peer;
		peerItem.role = "listitem";
		peerItem.setAttribute("name", peerId);
		this.peerListEl.append(peerItem);
	}
}

customElements.define("r-room", RRoom);
