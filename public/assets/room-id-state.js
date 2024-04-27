import State from "/assets/state.js";

const id = new URLSearchParams(location.search).get("id") || "";

/** @extends {State<string>} */
class RoomIdState extends State {
	/** @param {string} state */
	set state(state) {
		const search = new URLSearchParams(location.search);
		if (state) {
			search.set("id", state);
		} else {
			search.delete("id");
		}
		history.replaceState(null, "", `${location.pathname}?${search}`);
		super.state = state;
	}

	constructor() {
		super(id);
	}
}

export default new RoomIdState();
