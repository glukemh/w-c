import { State } from "/assets/state.js";

/** @extends {State<string>} */
class Uid extends State {
	constructor() {
		super();
		let savedId = sessionStorage.getItem("uid") || "";
		if (!savedId) {
			savedId = Math.random().toString(36).slice(2);
			sessionStorage.setItem("uid", savedId);
		}
		super.resolve(savedId);
	}
}

export const uid = new Uid();
