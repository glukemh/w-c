import "/components/main-page.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import Room from "/assets/room.js";

const mixin = await mixinForShadowContent("r-room");
export default class RRoom extends mixin(HTMLElement) {
	roomIdEl = /** @type {HTMLSpanElement} */ (
		this.shadow.getElementById("room-id")
	);
	/**
	 * @type {Room} room
	 */
	room = new Room(new URLSearchParams(location.search).get("id"));
	connectedCallback() {
		super.connectedCallback?.();
		this.roomIdEl.textContent = this.room.id;
		this.connectToRoom();
	}

	async connectToRoom() {
		await this.room.sendOffer();
	}
}

customElements.define("r-room", RRoom);
