/** @import { RoomIdContext } from "/state/room-id.js" */
import { race, Context } from "/state/state.js";
import { webSockets } from "/state/room-connections.js";
import { roomId } from "/state/room-id.js";

/** @type {Context<WebSocket>} */
const roomConnectionContext = new Context();

/** @param {RoomIdContext} context */
export function roomConnection(context) {
	return roomConnectionContext.subscribe(context, roomConnectionSource);
}

/** @param {RoomIdContext} context */
async function* roomConnectionSource(context) {
	for await (const [wsMap, id] of race(webSockets(), roomId(context))) {
		if (!wsMap[id]) continue;
		yield wsMap[id];
	}
}
