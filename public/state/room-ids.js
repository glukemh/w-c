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

/** @type {Context<Set<string>>} */
const roomIdIterContext = new Context();
/** @type {Context<string>} */
const roomIdContext = new Context((a, b) => a === b);

/** @param {WeakKey} context */
export function roomId(context) {
	return roomIdContext.subscribe(context);
}

/**
 * @param {WeakKey} key
 * @returns {() => void} remove provider */
export function provideRoomIdIter(key) {
	roomIdIterContext.from(key, roomIdIterSetter);
	return () => roomIdIterContext.remove(key);
}

async function* roomIdIterSetter() {
	for await (const ids of roomIds()) {
		yield new Set(ids);
	}
}

/**
 * @param {WeakKey} key
 * @param {WeakKey} context
 * @returns {() => void} remove provider */
export function provideRoomId(key, context) {
	roomIdContext.update(key, () => idUpdater(context), "");
	return () => roomIdContext.remove(key);
}

/** @param {WeakKey} context */
async function* idUpdater(context) {
	const subscription = roomIdIterContext.subscribe(context);
	for await (const ids of subscription) {
		yield /** @param {string} current */ (current) => {
			if (!ids.has(current)) {
				const { value, done } = ids.values().next();
				if (done) {
					subscription.return();
					return "";
				}
				current = value;
			}
			ids.delete(current);
			return current;
		};
	}
}
