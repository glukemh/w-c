import { DerivedState } from "/state/state.js";
import queryParams from "/state/query-params.js";

/** @extends DerivedState<Set<string>> */
class RoomIds extends DerivedState {
	constructor() {
		super((a, b) => a.isSubsetOf(b) && b.isSubsetOf(a));
		this.from(async function* () {
			for await (const s of queryParams.values()) {
				yield new Set(s.getAll("room-id"));
			}
		});
	}

	/** @param {Set<string>} roomIds */
	async set(roomIds) {
		for await (const params of queryParams.values()) {
			const search = new URLSearchParams(params);
			search.delete("room-id");
			for (const id of roomIds) {
				search.append("room-id", id);
			}
			queryParams.set(search);
			break;
		}
	}

	/** @param {() => AsyncGenerator<Set<string>>} source */
	from(source) {
		return super.from(source);
	}
}

export default new RoomIds();
