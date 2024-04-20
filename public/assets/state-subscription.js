const worker = new Worker("/assets/state-worker.js");

/** @param {ErrorEvent} event */
worker.onerror = (event) => {
	console.error("Error occurred in state worker:", event.message, event.error);
};

/** @type {Map<string, { channel: MessageChannel, state?: any }>} */
const channels = new Map();

/**
 * @template T
 * @param {string} modulePath
 * @param {(state: T) => void} callback
 */
export default function subscribe(modulePath, callback) {
	/** @param {MessageEvent<T>} event */
	const handler = ({ data }) => {
		const channelState = channels.get(modulePath);
		if (channelState) {
			channelState.state = data;
		}
		callback(data);
	};

	let channelState = channels.get(modulePath);
	if (channelState) {
		// callback with the current state immediately if it exists
		if (typeof channelState.state !== "undefined") {
			callback(channelState.state);
		}
	} else {
		const channel = new MessageChannel();
		channelState = { channel };
		channels.set(modulePath, channelState);
		worker.postMessage(modulePath, [channel.port2]);
		channel.port1.onmessageerror = (event) => {
			console.error(`Error occurred in channel ${modulePath}:`, event);
		};
	}
	const port = channelState.channel.port1;
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
