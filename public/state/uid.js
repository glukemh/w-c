/** @import { Setter } from "/state/state.js"  */
import { State } from "/state/state.js";

/** @type {State<string>} */
const idState = new State((a, b) => a === b);
let savedId = sessionStorage.getItem("uid") || "";
if (!savedId) {
	savedId = Math.random().toString(36).slice(2);
	sessionStorage.setItem("uid", savedId);
}
idState.set(savedId);

export function uid() {
	return idState.subscribe();
}

/** @param {string | Setter<string>} source */
export function setUid(source) {
	if (typeof source === "string") {
		idState.set(source);
	} else {
		idState.from(source);
	}
}
