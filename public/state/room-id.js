import { State } from "/state/state.js";
import { search } from "/state/route.js";
/**
 * @extends {State<string[]>}
 */
class RoomId extends State {
	constructor() {
		super();
		this.#init();
	}
	async #init() {
		for await (const params of search.subscribe()) {
			this.set(params.getAll("roomId"));
		}
	}
	/**
	 * @param {string[]} roomIds */
	add(roomIds) {
		for (const id of roomIds) {
			search.appendParam("roomId", id);
		}
	}
}
export const roomId = new RoomId();
