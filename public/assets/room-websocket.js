import State from "/assets/state.js";
import roomId from "/assets/room-id.js";

/** @extends {State<WebSocket | null>} */
class RoomWebsocketConnection extends State {
	constructor() {
		super(null);
		this.#handleRoomIdIter(roomId.subscribe());
	}

	/** @param {AsyncGenerator<string, void, unknown>} iter */
	async #handleRoomIdIter(iter) {
		for await (const roomId of iter) {
			this.get()?.close();
			const ws = roomId ? new WebSocket(`/api/room/${roomId}`) : null;
			this.set(ws);
			if (!ws) continue;
			ws.addEventListener("open", (e) => {
				console.log("Connected to room");
			});
			ws.addEventListener("close", () => {
				console.log("Disconnected from websocket");
			});
			ws.addEventListener("error", () => {
				console.error("Error connecting to room");
			});
			ws.addEventListener("message", (e) => this.handleWSMessage(e));
		}
	}
}

export const roomWebsocketConnection = new RoomWebsocketConnection();
