import { State } from "/assets/state.js";
/**
 * @extends {State<string>}
 */
class RoomId extends State {
	#current = new URLSearchParams(location.search).get("id") || "";
	constructor() {
		super();
		this.resolve(this.#current);
		window.addEventListener("popstate", () => {
			this.resolve(new URLSearchParams(location.search).get("id") || "");
		});
	}
	/** @param {string} roomId */
	set(roomId) {
		const searchParams = new URLSearchParams(location.search);
		searchParams.set("id", roomId);
		history.pushState(null, "", "?" + searchParams.toString());
	}
}
export const roomId = new RoomId();
