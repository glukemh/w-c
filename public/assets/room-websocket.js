import State, { forAwait } from "/assets/state.js";
import { roomId } from "/assets/room-id.js";

/** @extends {State<WebSocket | null>} */
class RoomWebsocketConnection extends State {
	constructor() {
		super(null);
		forAwait(roomId.subscribe(), (roomId) => {
			this.get()?.close();
			const ws = roomId ? new WebSocket(`/api/room/${roomId}`) : null;
			this.set(ws);
		});
	}
}

/** @extends {State<MessageEvent<any> | null>} */
class RoomWebsocketMessage extends State {
	constructor() {
		super(null);
		forAwait(roomWebsocketConnection.subscribe(), (ws) => {
			if (ws) {
				ws.addEventListener("message", (e) => this.set(e));
			} else {
				this.set(null);
			}
		});
	}
}

/** @extends {State<Event | null>} */
class RoomWebsocketError extends State {
	constructor() {
		super(null);
		forAwait(roomWebsocketConnection.subscribe(), (ws) => {
			if (ws) {
				ws.addEventListener("error", (e) => this.set(e));
			} else {
				this.set(null);
			}
		});
	}
}

/** @extends {State<Event | null>} */
class RoomWebsocketOpen extends State {
	constructor() {
		super(null);
		forAwait(roomWebsocketConnection.subscribe(), (ws) => {
			if (ws) {
				ws.addEventListener("open", (e) => this.set(e));
			} else {
				this.set(null);
			}
		});
	}
}

/** @extends {State<CloseEvent | null>} */
class RoomWebsocketClose extends State {
	constructor() {
		super(null);
		forAwait(roomWebsocketConnection.subscribe(), (ws) => {
			if (ws) {
				ws.addEventListener("close", (e) => this.set(e));
			} else {
				this.set(null);
			}
		});
	}
}

export const roomWebsocketConnection = new RoomWebsocketConnection();
export const roomWebsocketMessage = new RoomWebsocketMessage();
export const roomWebsocketError = new RoomWebsocketError();
export const roomWebsocketOpen = new RoomWebsocketOpen();
export const roomWebsocketClose = new RoomWebsocketClose();
