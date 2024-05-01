import State, { forAwait } from "/assets/state.js";
import { uid } from "/assets/uid.js";
import { roomId } from "/assets/room-id.js";

/** @extends {State<WebSocket | null>} */
class RoomWebsocketConnection extends State {
	constructor() {
		super(null);
		const iter = roomId.subscribe();
		iter.next();
		[iter, uid.subscribe()].forEach((iter) =>
			forAwait(iter, () => {
				this.get()?.close();
				if (roomId.get()) {
					const url = new URL(`/api/room/${roomId.get()}`, location.origin);
					url.searchParams.set("uid", uid.get());
					this.set(new WebSocket(url));
				} else {
					this.set(null);
				}
			})
		);
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
