/** @import { Setter, Updater } from "/state/state.js" */
import { State } from "/state/state.js";
import { location, updateLocation } from "/state/location.js";

/** @type {State<URLSearchParams>} */
const queryParamsState = new State((a, b) => a.toString() === b.toString());
queryParamsState.from(async function* () {
	for await (const loc of location()) {
		yield loc.searchParams;
	}
});

export async function* queryParams() {
	yield* queryParamsState.subscribe();
}

/** @param {Setter<URLSearchParams>} params */
export function setQueryParams(params) {
	updateLocation(async function* () {
		for await (const p of params()) {
			yield (url) => {
				url.search = p.toString();
				return url;
			};
		}
	});
}

/** @param {Updater<URLSearchParams>} updates */
export function updateQueryParams(updates) {
	setQueryParams(async function* () {
		for await (const update of updates()) {
			yield update(await queryParamsState.current);
		}
	});
}
