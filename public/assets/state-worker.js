import State from "/assets/state.js";

/** @type {Map<string, MessagePort>} */
const ports = new Map();

self.addEventListener("message", async function (event) {
	const path = event.data;
	const [port] = event.ports;
	ports.get(path)?.close();
	ports.set(path, port);
	try {
		const { default: state } = await import(path);
		if (!(state instanceof State)) {
			throw new Error("Default export is not an instance of State.");
		}

		state.onChange = port.postMessage;

		port.onmessage = ({ data }) => {
			state.setState(data);
		};
	} catch (error) {
		console.error(`Error occurred in channel ${path}:`, error);
		port.close();
	}
});
