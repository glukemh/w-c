import { Context } from "/state/state.js";
import { roomIds } from "/state/room-ids.js";

/** @typedef {{ [roomIdContextTag]: unknown }} RoomIdContext */
/** @typedef {{ [roomIdIterContextTag]: unknown }} RoomIdIterContext */

export const roomIdContextTag = Symbol("room id context");
export const roomIdIterContextTag = Symbol("room id iter context");

/** @type {Context<Set<string>>} */
const roomIdIterContext = new Context();

/**
 * Provide context for iterating over room ids.
 * @param {RoomIdIterContext} key
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
 * @param {RoomIdContext} key context key for the room id
 * @param {RoomIdIterContext} context iterator context
 * @returns {() => void} remove context provider */
export function provideRoomId(key, context) {
	roomIdIterResultContext.update(key, () => roomIdIterResultUpdater(context), {
		done: true,
		value: "",
	});
	roomIdContext.from(key, () => roomIdIterResultContext.subscribe(key));
	return () => {
		roomIdIterResultContext.remove(key);
		roomIdContext.remove(key);
	};
}

/** @param {RoomIdIterContext} context */
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
 * @param {RoomIdContext} context */
export function roomIdIterResult(context) {
	return roomIdIterResultContext.subscribe(context);
}

/**
 * Subscribe to room id changes for a given context.
 * @param {RoomIdContext} context */
export async function* roomId(context) {
	for await (const result of roomIdContext.subscribe(context)) {
		if (result.done) continue;
		yield result.value;
	}
}
