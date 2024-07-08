import { State } from "/state/state.js";
import { search } from "/state/route.js";
/**
 * @extends {State<Set<string>>}
 */
class RoomIds extends State {
	constructor() {
		super((a, b) => a.isSubsetOf(b) && b.isSubsetOf(a));
		this.#init();
	}

	async #init() {
		for await (const params of search.subscribe()) {
			this.resolve(new Set(params.getAll("roomId")));
		}
	}

	/** @param {string[]} roomIds */
	add(roomIds) {
		for (const id of roomIds) {
			search.appendParam("roomId", id);
		}
	}

	/** @param {string} roomId */
	remove(roomId) {
		search.deleteParam("roomId", roomId);
	}
}
export const roomIds = new RoomIds();
