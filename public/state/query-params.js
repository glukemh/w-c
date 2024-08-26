import { DerivedState } from "/state/state.js";
import location from "/state/location.js";

/** @extends DerivedState<URLSearchParams> */
class QueryParams extends DerivedState {
	constructor() {
		super((a, b) => a.toString() === b.toString());
		this.from(async function* () {
			for await (const loc of location.values()) {
				yield loc.searchParams;
			}
		});
	}

	/** @param {URLSearchParams} params */
	async set(params) {
		for await (const loc of location.values()) {
			const url = new URL(loc);
			url.search = params.toString();
			location.set(url);
			break;
		}
	}

	/** @param {() => AsyncGenerator<URLSearchParams>} source */
	from(source) {
		return super.from(source);
	}
}

export default new QueryParams();
