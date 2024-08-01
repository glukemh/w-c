/** @import { State } from "/state/state.js" */
import { derive, context, Context } from "/state/state.js";
import { search, appendSearch, deleteSearch } from "/state/route.js";

/** @typedef {typeof roomIds extends () => AsyncGenerator<infer U, void, any> ? U : never} RoomIds */

export const roomIds = derive(
	search(),
	(s) => new Set(s.getAll("room-id")),
	(a, b) => a.isSubsetOf(b) && b.isSubsetOf(a)
);

/** @param {Iterable<string>} newIds */
export function addRooms(newIds) {
	appendSearch(new URLSearchParams([...newIds].map((id) => ["room-id", id])));
}

/** @param {Iterable<string>} removeIds */
export function removeRooms(removeIds) {
	deleteSearch(
		new URLSearchParams([...removeIds].map((id) => ["room-id", id]))
	);
}

/** @type {Context<string>} */
const roomIdContext = new Context();

const roomIdIter = derive(roomIds(), (s) => s.values());

/** @param {WeakKey} key */
export function registerRoomId(key) {
	roomIdContext.set(key, async function* () {
		for await (const iter of roomIdIter()) {
			const next = iter.next();
			if (next.done) break;
			yield next.value;
		}
	});
}

/** @param {WeakKey} key */
export function unregisterRoomId(key) {
	roomIdContext.remove(key);
}

export class RoomId {
	#key;
	/** @param {WeakKey} key */
	constructor(key) {
		this.#key = key;
	}
	subscribe() {
		return roomIdContext.subscribe(this.#key);
	}
}
