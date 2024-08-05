import { State, derive, forAwait, Context } from "/state/state.js";
import { search, appendSearch, deleteSearch } from "/state/route.js";

/** @type {State<Set<string>>} */
const roomIdsState = new State((a, b) => a.isSubsetOf(b) && b.isSubsetOf(a));
roomIdsState.from(async function* () {
	for await (const s of search()) {
		yield new Set(s.getAll("room-id"));
	}
});

export function roomIds() {
	return roomIdsState.subscribe();
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

/** @type {Context<BuiltinIterator<string>>} */
const roomIdIterContext = new Context();

async function* roomIdIter() {
	for await (const s of roomIds()) yield s.values();
}

/** @param {WeakKey} key */
export function setRoomIdIterFor(key) {
	roomIdIterContext.set(key, roomIdIter());
}

/** @param {WeakKey} key */
export function removeRoomIdIterFor(key) {
	roomIdIterContext.remove(key);
}
