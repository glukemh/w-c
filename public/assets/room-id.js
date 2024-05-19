import { MutableState } from "/assets/state.js";
/**
 * @extends {MutableState<string>}
 */
class RoomId extends MutableState {
	constructor() {
		super();
		super.set(new URLSearchParams(location.search).get("id") || "");
		window.addEventListener("popstate", () => {
			super.set(new URLSearchParams(location.search).get("id") || "");
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
