/** @template T */
export default class GenericChannel extends BroadcastChannel {
  /** @param {T} message */
  postMessage(message) {
    super.postMessage(message);
  }

  /** 
   * @param {"message" | "messageerror"} type
   * @param {(ev: MessageEvent<T>) => void} listener
   * @param {AddEventListenerOptions} [options]*/
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
  }
}
