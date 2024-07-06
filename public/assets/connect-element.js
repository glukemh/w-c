/**
 * @template {new (...args: any[]) => {}} T
 * @param {T} Base */
export const connectElementMixin = (Base) => {
	/**
	 * @class
	 * @extends {Base}
	 */
	class ConnectElement extends Base {
		#onDisconnect = () => {};
		/** @abstract */
		onConnect() {
			return () => {};
		}
		connectedCallback() {
			super["connectedCallback"]?.();
			this.#onDisconnect = this.onConnect();
		}
		disconnectedCallback() {
			super["disconnectedCallback"]?.();
			this.#onDisconnect();
		}
	}
	return ConnectElement;
};

const ConnectElement = connectElementMixin(HTMLElement);

export default ConnectElement;
