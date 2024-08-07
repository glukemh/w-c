/** @import { Setter, Updater } from "/state/state.js" */
import { State, Context } from "/state/state.js";
import { queryParams, updateQueryParams } from "/state/query-params.js";

/** @type {State<Set<string>>} */
const roomIdsState = new State((a, b) => a.isSubsetOf(b) && b.isSubsetOf(a));
roomIdsState.from(async function* () {
	for await (const s of queryParams()) {
		yield new Set(s.getAll("room-id"));
	}
});

export function roomIds() {
	return roomIdsState.subscribe();
}

/** @param {Setter<Set<string>>} roomIds */
export function setRoomIds(roomIds) {
	updateQueryParams(async function* () {
		for await (const ids of roomIds()) {
			yield (search) => {
				search.delete("room-id");
				for (const id of ids) {
					search.append("room-id", id);
				}
				return search;
			};
		}
	});
}

/** @param {Updater<Set<string>>} updates */
export function updateRoomIds(updates) {
	setRoomIds(async function* () {
		for await (const update of updates()) {
			yield update(await roomIdsState.current);
		}
	});
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

/** @param {WeakKey} key */
export function roomIdIterFor(key) {
	return roomIdIterContext.subscribe(key);
}
