import "/components/main-page.js";
import "/components/a-route.js";
import "/components/single-input-form.js";
import PeerConnectionItem from "/components/peer-connection-item.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import Room from "/assets/room.js";
import SingleInputForm from "/components/single-input-form.js";
import linksWhenLoadedMixin from "/assets/links-when-loaded-mixin.js";

const mixin = await mixinForShadowContent("r-room");
export default class RRoom extends linksWhenLoadedMixin(mixin(HTMLElement)) {
	roomIdEl = /** @type {HTMLSpanElement} */ (
		this.shadow.getElementById("room-name")
	);
	peerListEl = /** @type {HTMLUListElement} */ (
		this.shadow.getElementById("peer-list")
	);
	broadcastForm = /** @type {SingleInputForm} */ (
		this.shadow.getElementById("broadcast-form")
	);
	/**
	 * @type {Room} room
	 */
	room = new Room(new URLSearchParams(location.search).get("id"));
	linksLoaded = this.linksWhenLoaded(this.shadow);

	connectedCallback() {
		super.connectedCallback?.();
		this.roomIdEl.textContent = this.room.id;
		this.#renderPeerNames();
		this.room.onPeerChange(() => this.#renderPeerNames());
		this.broadcastForm.addEventListener("submit", (e) => {
			const formData = new FormData(this.broadcastForm.form);
			const message = formData.get("message");
			if (!message) return;
			this.room.broadcast(message, "message");
		});
		this.style.filter = "opacity(0)";
		this.style.transition = "filter 0.3s ease-in-out";
		this.linksLoaded.then(() => {
			this.style.filter = "opacity(1)";
		});
	}

	disconnectedCallback() {
		console.debug("room disconnected");
		this.room.leave();
	}

	#renderPeerNames() {
		for (const [name, peer] of this.room.peers) {
			if (!this.peerListEl.children.namedItem(name)) {
				this.#newPeer(name);
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
