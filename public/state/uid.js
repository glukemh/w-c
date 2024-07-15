import { State } from "/state/state.js";

/** @type {State<string>} */
const id = new State((a, b) => a === b);

let savedId = sessionStorage.getItem("uid") || "";
if (!savedId) {
	savedId = Math.random().toString(36).slice(2);
	sessionStorage.setItem("uid", savedId);
}

id.set(savedId);

export async function* uid() {
	yield* id.subscribe();
}

/** @param {string} value */
export function updateUid(value) {
	id.set(value);
}
