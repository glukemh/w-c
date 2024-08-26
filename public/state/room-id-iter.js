import { Context, State } from "/state/state.js";
import roomIds from "/state/room-ids.js";

/** @typedef {{ [roomIdIterContextTag]: unknown }} RoomIdIterContext */
export const roomIdIterContextTag = Symbol("room id iter context");

/** @extends Context<RoomIdIterContext,State<Set<string>>> */
class RoomIdIter extends Context {
	constructor() {
		super(() => /** @type {State<Set<string>>} */ (new State()));
	}

	/** @param {RoomIdIterContext} key */
	provide(key) {
		this.state(key).from(stateSource);
		return this.returnState(key);
	}
}

export default new RoomIdIter();

async function* stateSource() {
	for await (const ids of roomIds.values()) {
		yield new Set(ids);
	}
}
