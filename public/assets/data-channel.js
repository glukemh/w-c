export default class DataChannel extends EventTarget {
	/**
	 * @type {["message", "open", "close", "closing", "error", "bufferedamountlow"]}
	 */
	static channelEventTypes = [
		"message",
		"open",
		"close",
		"closing",
		"error",
		"bufferedamountlow",
	];
	/**
	 * @type {RTCDataChannel | null}
	 */
	#channel = null;

	get channel() {
		return this.#channel;
	}

	set channel(channel) {
		this.#channel = channel;
		this.#listenToChannel(channel);
		this.#sendQueuedData();
	}

	/**
	 * @type {(() => void) | null}
	 */
	#removeChannelListeners = null;

	/**
	 * @type {Array<string>}
	 */
	#sendQueue = [];

	/**
	 * @param {RTCDataChannel} [channel] associated data channel
	 */
	constructor(channel) {
		super();
		this.channel = channel || null;
	}

	/**
	 * Send all queued data through the channel
	 */
	#sendQueuedData() {
		if (!this.channel) return;
		for (
			let data = this.#sendQueue.shift();
			data;
			data = this.#sendQueue.shift()
		) {
			this.channel.send(data);
		}
	}

	/**
	 *
	 * @param {RTCDataChannel | null} channel
	 */
	#listenToChannel(channel) {
		this.#removeChannelListeners?.();
		if (!channel) return;
		/**
		 * Forward events from the channel
		 * @param {Event} e
		 */
		const forwardEvent = (e) => {
			let newEvent =
				e instanceof MessageEvent
					? new MessageEvent(e.type, {
							data: e.data,
							lastEventId: e.lastEventId,
					  })
					: new Event(e.type);
			this.dispatchEvent(newEvent);
		};
		const handleChannelOpen = () => {
			this.#sendQueuedData();
		};
		const handleChannelClose = () => {
			this.channel = null;
		};

		for (const eventType of DataChannel.channelEventTypes) {
			channel.addEventListener(eventType, forwardEvent);
		}

		channel.addEventListener("open", handleChannelOpen);
		channel.addEventListener("close", handleChannelClose);

		this.#removeChannelListeners = () => {
			for (const eventType of DataChannel.channelEventTypes) {
				channel.removeEventListener(eventType, forwardEvent);
			}
			channel.removeEventListener("open", handleChannelOpen);
			channel.removeEventListener("close", handleChannelClose);
		};
	}

	/**
	 * Set listeners for the data channel
	 */

	/**
	 * Send data through the channel. The data will be queued to send when the channel is set and ready.
	 * @param {string} data
	 */
	sendData(data) {
		if (this.#channel?.readyState === "open") {
			this.#channel.send(data);
		} else {
			this.#sendQueue.push(data);
		}
	}

	/**
	 * Close the channel
	 */
	close() {
		this.#channel?.close();
	}
}
