/** @import { State } from "/state/state.js" */
import { derive } from "/state/state.js";
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

/**
 * @param {RoomIds} currentIds
 * @returns {Generator<string, void, unknown>}*/
function* idIter(currentIds) {
	/** @type {Map<unknown, string>} */
	const contexts = new Map();
	let key = yield "";
	for (const id of currentIds) {
		contexts.set(key, id);
		while (contexts.has(key)) {
			key = yield /** @type {string} */ (contexts.get(key));
		}
	}
}

export async function* roomIdContext() {
	for await (const ids of roomIds()) {
		yield idIter(ids);
	}
}
