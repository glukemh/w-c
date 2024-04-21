const worker = new Worker("/assets/state-worker.js");

/** @param {ErrorEvent} event */
worker.onerror = (event) => {
	console.error("Error occurred in state worker:", event.message, event.error);
};

/** @type {Map<string, { port: MessagePort, state?: any }>} */
const portStates = new Map();

/**
 * @template T
 * @param {string} modulePath
 * @param {(state: T) => void} callback
 */
export default function subscribe(modulePath, callback) {
	/** @param {MessageEvent<T>} event */
	const handler = ({ data }) => {
		const portState = portStates.get(modulePath);
		if (portState) {
			portState.state = data;
		} else {
			console.error(`No port state found for module ${modulePath}`);
		}
		callback(data);
	};

	let portState = portStates.get(modulePath);
	if (portState) {
		// callback with the current state immediately if it exists
		if (typeof portState.state !== "undefined") {
			callback(portState.state);
		}
	} else {
		const { port1, port2 } = new MessageChannel();
		portState = { port: port1 };
		portStates.set(modulePath, portState);
		worker.postMessage(modulePath, [port2]);
		portState.port.onmessageerror = (event) => {
			console.error(`Error occurred in channel ${modulePath}:`, event);
		};
	}
	const { port } = portState;
	// event listener for state updates
	port.addEventListener("message", handler);

	return {
		unsubscribe() {
			port.removeEventListener("message", handler);
		},
		/** @param {T} state */
		update(state) {
			port.postMessage(state);
		},
	};
}
