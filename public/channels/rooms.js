import { StateChannel } from "/channels/lib/state-channel.js";

/** @type {StateChannel<Set<string>>} */
export default new StateChannel("rooms", (a, b) => a.size === b.size && a.isSubsetOf(b));
