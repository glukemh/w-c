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

class RoomIdContext {
	/** @type {WeakMap<WeakKey, Map<string, Set<string>>>} */
	scopes = new WeakMap();
	/** @param {Set<string>} roomIds */
	constructor(roomIds) {
		this.roomIds = roomIds;
	}
}

/** @type {State<RoomIdContext>} */
const roomIdContext = new State();
roomIdContext.from(async function* () {
	for await (const rooms of roomIds()) {
		yield new RoomIdContext(rooms);
	}
});

/**
 * @param {WeakKey} key
 * @param {string} name
 */
export async function* roomId(key, name) {
	let current = "";
	for await (const context of roomIdContext.subscribe()) {
		let map = context.scopes.get(key);
		if (!map) {
			map = new Map();
			context.scopes.set(key, map);
			map.set(name, new Set(context.roomIds));
		}

		let ids = map.get(name);
		if (!ids) {
			ids = new Set(context.roomIds);
			map.set(name, ids);
		}
		if (ids.size && !ids.has(current)) {
			current = /** @type {string} */ (ids.values().next().value);
		} else {
			return;
		}
		ids.delete(current);

		yield /** @type {const} */ ([current, ids.size]);
	}
}
