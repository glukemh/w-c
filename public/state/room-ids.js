import { derive } from "/state/state.js";
import { search, appendSearch, deleteSearch } from "/state/route.js";

const ids = derive(
	search(),
	(s) => new Set(s.getAll("room-id")),
	(a, b) => a.isSubsetOf(b) && b.isSubsetOf(a)
);

export async function* roomIds() {
	yield* ids.subscribe();
}

/** @param {Iterable<string>} newIds */
export function addRooms(newIds) {
	appendSearch(new URLSearchParams([...newIds].map((id) => ["room-id", id])));
}

/** @param {Iterable<string>} removeIds */
export function removeRooms(removeIds) {
	deleteSearch(
		new URLSearchParams([...removeIds].map((id) => ["room-id", id]))
	);
}

/** @type {() => AsyncGenerator<string, void, unknown>} */
let roomIdGenerator = async function* () {
	const rooms = await ids.current;
	for (const id of rooms) {
		yield id;
		break;
	}
};

export async function* roomId() {
	yield* roomIdGenerator();
}

export async function* roomIdContext() {
	const rooms = await ids.current;
	for (const id of rooms) {
		roomIdGenerator = async function* () {
			yield id;
			for await (const newIds of roomIds()) {
				if (!newIds.has(id)) break;
			}
		};
		yield id;
	}
}
