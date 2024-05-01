import State from "/assets/state.js";
let savedId = sessionStorage.getItem("uid") || "";
if (!savedId) {
	savedId = Math.random().toString(36).slice(2);
	sessionStorage.setItem("uid", savedId);
}

export const uid = new State(savedId);
