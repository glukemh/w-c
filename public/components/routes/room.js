import "/components/main-page.js";
import "/components/a-route.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import Room from "/assets/room.js";

const mixin = await mixinForShadowContent("r-room");
export default class RRoom extends mixin(HTMLElement) {
	roomIdEl = /** @type {HTMLSpanElement} */ (
		this.shadow.getElementById("room-name")
	);
	peerListEl = /** @type {HTMLUListElement} */ (
		this.shadow.getElementById("peer-list")
	);
	broadcastForm = /** @type {HTMLFormElement} */ (
		this.shadow.getElementById("broadcast-form")
	);
	/**
	 * @type {Room} room
	 */
	room = new Room(new URLSearchParams(location.search).get("id"));
	connectedCallback() {
		super.connectedCallback?.();
		this.roomIdEl.textContent = this.room.id;
		this.renderPeerNames();
		this.room.onPeerChange(() => this.renderPeerNames());
		this.broadcastForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const formData = new FormData(this.broadcastForm);
			const message = formData.get("message");
			if (!message) return;
			this.room.broadcast(message, "message");
		});
	}

	renderPeerNames() {
		this.peerListEl.replaceChildren();
		for (const peerId of this.room.peerIds) {
			const li = document.createElement("li");
			li.textContent = peerId;
			this.peerListEl.appendChild(li);
		}
	}
}

customElements.define("r-room", RRoom);
