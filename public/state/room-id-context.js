import { roomIds } from "/state/room-ids.js";
import { Context, State } from "/state/state.js";

/** @extends {Context<roomIds extends State<Array<infer U>> ? U : never>} */
class RoomIdContext extends Context {
	constructor() {
		const state = new State();
		super();
	}
}
