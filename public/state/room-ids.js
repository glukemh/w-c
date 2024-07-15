import { derive, forAwait } from "/state/state.js";
import { search, appendSearch, deleteSearch } from "/state/route.js";

const ids = derive(
	search(),
	(s) => new Set(s.getAll("room-id")),
	(a, b) => a.isSubsetOf(b) && b.isSubsetOf(a)
);

export async function* roomIds() {
	yield* ids.subscribe();
}

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

export async function* roomId() {
	let rooms = await ids.current;
	const roomsArray = [...rooms];
	const contexts = new WeakMap();
	let id;
	while (true) {
		const key = yield id;
		if (contexts.has(key)) {
			id = contexts.get(key);
		} else {
			const idExists = !!roomsArray.length;
			id = roomsArray.pop();
			if (idExists) {
				contexts.set(key, id);
			}
		}
	}
}
