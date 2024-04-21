import State from "/assets/state.js";

/** @type {Map<string, MessagePort>} */
const ports = new Map();

self.addEventListener("message", async function (event) {
	const path = event.data;
	const [port] = event.ports;
	ports.get(path)?.close();
	ports.set(path, port);
	try {
		const { default: stateInstance } = await import(path);
		if (!(stateInstance instanceof State)) {
			throw new Error("Default export is not an instance of State.");
		}

		const unsubscribe = stateInstance.subscribe((state) => {
			try {
				port.postMessage(state);
			} catch (error) {
				console.error(`Error occurred in channel ${path}:`, error);
				port.close();
				ports.delete(path);
				unsubscribe();
			}
		});

		port.onmessage = ({ data }) => {
			stateInstance.state = data;
		};

		console.debug("state", stateInstance.state);
		port.postMessage(stateInstance.state);
	} catch (error) {
		console.error(`Error occurred in channel ${path}:`, error);
		port.close();
	}
});
