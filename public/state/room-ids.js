import { searchParams, updateParams } from "/state/query-params.js";

const rooms = searchParams().getAll("room-id");
export function roomIds() {
	return new Set(rooms);
}

/** @param {(ids: Set<string>) => Set<string>} update */
export function updateRooms(update) {
	updateParams((params) => {
		params.delete("room-id");
		for (const id of update(roomIds())) {
			params.append("room-id", id);
		}
		return params;
	});
}
