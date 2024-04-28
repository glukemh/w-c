import State from "/assets/state.js";
/**
 * @extends {State<string>}
 */
class RoomIdState extends State {
	constructor() {
		super(new URLSearchParams(location.search).get("id") || "");
		window.addEventListener("popstate", () => {
			super.set(new URLSearchParams(location.search).get("id") || "");
		});
	}
	/** @param {string} roomId */
	set(roomId) {
		super.set(roomId);
		const searchParams = new URLSearchParams(location.search);
		searchParams.set("id", roomId);
		history.pushState(null, "", "?" + searchParams.toString());
	}
}
export default new RoomIdState();
