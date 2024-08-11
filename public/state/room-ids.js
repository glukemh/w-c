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

/**
 * Provide context for iterating over room ids.
 * @param {WeakKey} key
 * @returns {() => void} remove context provider */
export function provideRoomIds(key) {
	roomIdIterContext.from(key, roomIdIterSetter);
	return () => roomIdIterContext.remove(key);
}

async function* roomIdIterSetter() {
	for await (const ids of roomIds()) {
		yield new Set(ids);
	}
}

/** @type {Context<IteratorResult<string>>} */
const roomIdIterResultContext = new Context();
/** @type {Context<IteratorResult<string>>} */
const roomIdContext = new Context(
	(a, b) => !a.done && !b.done && a.value === b.value
);

/**
 * Provide context for a room id within an iterator context.
 * @param {WeakKey} key context key for the room id
 * @param {WeakKey} context iterator context
 * @returns {() => void} remove context provider */
export function provideRoomId(key, context) {
	roomIdIterResultContext.update(key, () => roomIdIterResultUpdater(context), {
		done: true,
		value: "",
	});
	roomIdContext.from(key, () => roomIdIterResultContext.subscribe(context));
	return () => {
		roomIdIterResultContext.remove(key);
		roomIdContext.remove(key);
	};
}

/** @param {WeakKey} context */
async function* roomIdIterResultUpdater(context) {
	for await (const ids of roomIdIterContext.subscribe(context)) {
		yield /** @param {IteratorResult<string>} current */ (current) => {
			if (current.done || !ids.has(current.value)) {
				current = ids.values().next();
			}
			if (!current.done) {
				ids.delete(current.value);
			}
			return current;
		};
	}
}

/**
 * Subscribe to room id iterator results for a given context.
 * @param {WeakKey} context */
export function roomIdIterResult(context) {
	return roomIdIterResultContext.subscribe(context);
}

/**
 * Subscribe to room id changes for a given context.
 * @param {WeakKey} context */
export async function* roomId(context) {
	for await (const result of roomIdContext.subscribe(context)) {
		if (result.done) break;
		yield result.value;
	}
}
