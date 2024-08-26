/** @import { RoomIdIterContext } from "/state/room-id-iter.js" */
import { Context, State } from "/state/state.js";
import roomIdIter from "/state/room-id-iter.js";

/** @typedef {{ [roomIdContextTag]: unknown }} RoomIdContext */

export const roomIdContextTag = Symbol("room id context");

/** @extends Context<RoomIdContext,State<string>> */
class RoomId extends Context {
	constructor() {
		super(() => /** @type {State<string>} */ (new State()));
	}

	/**
	 * Provide context for a room id.
	 * @param {RoomIdContext} key
	 * @param {RoomIdIterContext} context */
	provide(key, context) {
		this.state(key).from(() => stateSource(context));
		return this.returnState(key);
	}
}

export default new RoomId();

/** @param {RoomIdIterContext} key */
async function* stateSource(key) {
	/** @type {string | undefined} */
	let id;
	for await (const s of roomIdIter.values(key)) {
		if (id !== undefined && s.has(id)) continue;
		let next = s.values().next();
		if (next.done) return;
		id = next.value;
		s.delete(id);
		yield id;
	}
}
