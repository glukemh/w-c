const url = new URL("api/ws", location.origin);
url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(url);

ws.addEventListener("open", (e) => {
	console.log("websocket connected", e);
});

ws.addEventListener("message", (e) => {
	console.log(e.data);
});

ws.addEventListener("close", () => {
	console.log("websocket closed");
});

ws.addEventListener("error", (e) => {
	console.log("websocket error", e);
});

export default ws;
