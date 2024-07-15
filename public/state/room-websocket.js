import { State } from "/state/state.js";
import { uid } from "/state/uid.js";
import { roomIds } from "/state/room-ids.js";

/** @extends {State<WebSocket>} */
class RoomWebsocketConnection extends State {
	/** @type {WebSocket | null} */
	#current = null;
	constructor() {
		super();
		this.#init();
	}
	async #init() {
		for await (const [room, user] of State.race(roomId, uid)) {
			this.#current?.close();
			if (room && user) {
				const url = new URL(`/api/room/${room}`, location.origin);
				url.searchParams.set("uid", user);
				this.#current = new WebSocket(url);
				this.resolve(this.#current);
			} else {
				this.#current = null;
			}
		}
	}
}

/** @extends {MutableState<MessageEvent<any>>} */
class RoomWebsocketMessage extends MutableState {
	constructor() {
		super();
		this.#init();
	}
	async #init() {
		for await (const ws of roomWebsocketConnection.subscribe()) {
			if (ws) {
				ws.addEventListener("message", (e) => this.resolve(e));
			}
		}
	}
}

/** @extends {State<Event>} */
class RoomWebsocketError extends State {
	constructor() {
		super();
		this.#init();
	}
	async #init() {
		for await (const ws of roomWebsocketConnection.subscribe()) {
			if (ws) {
				ws.addEventListener("error", (e) => this.resolve(e));
			}
		}
	}
}

/** @extends {State<Event>} */
class RoomWebsocketOpen extends State {
	constructor() {
		super();
		this.#init();
	}
	async #init() {
		for await (const ws of roomWebsocketConnection.subscribe()) {
			if (ws) {
				ws.addEventListener("open", (e) => this.resolve(e));
			}
		}
	}
}

/** @extends {State<CloseEvent>} */
class RoomWebsocketClose extends State {
	constructor() {
		super();
		this.#init();
	}
	async #init() {
		for await (const ws of roomWebsocketConnection.subscribe()) {
			if (ws) {
				ws.addEventListener("close", (e) => this.resolve(e));
			}
		}
	}
}

export const roomWebsocketConnection = new RoomWebsocketConnection();
export const roomWebsocketMessage = new RoomWebsocketMessage();
export const roomWebsocketError = new RoomWebsocketError();
export const roomWebsocketOpen = new RoomWebsocketOpen();
export const roomWebsocketClose = new RoomWebsocketClose();
