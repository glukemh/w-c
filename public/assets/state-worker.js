import State from "/assets/state.js";

/** @type {Map<string, MessagePort>} */
const ports = new Map();

self.addEventListener("message", async function (event) {
	const path = event.data;
	const [port] = event.ports;
	ports.get(path)?.close();
	ports.set(path, port);
	/** @type {AsyncGenerator<any, void, unknown> | undefined} */
	let iter;
	try {
		const { default: stateInstance } = await import(path);
		if (!(stateInstance instanceof State)) {
			throw new Error("Default export is not an instance of State.");
		}
		iter = stateInstance.subscribe();
		relayState(port, iter);
		port.onmessage = ({ data }) => {
			stateInstance.set(data);
		};
	} catch (error) {
		console.error(`Error occurred in channel ${path}:`, error);
		port.close();
		iter?.return();
	}
});

/**
 *
 * @param {MessagePort} port
 * @param {AsyncGenerator} iter
 */
async function relayState(port, iter) {
	for await (const state of iter) {
		port.postMessage(state);
	}
}
