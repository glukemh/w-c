import { StateChannel } from "/channels/lib/state-channel.js";

/** @type {StateChannel<Set<string>>} */
export default new StateChannel("messages-filtered-channels", (a, b) => a.size === b.size && a.isSubsetOf(b));