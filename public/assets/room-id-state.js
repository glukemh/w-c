import State from "/assets/state.js";
import locationState from "/assets/location-state.js";

/** @extends {State<string>} */
class RoomIdState extends State {
	constructor() {
		const id = new URLSearchParams(locationState.state.search).get("id") || "";
		super(id);
		locationState.subscribe(({ search }) => {
			this.state = new URLSearchParams(search).get("id") || "";
		});
	}
}

export default new RoomIdState();
