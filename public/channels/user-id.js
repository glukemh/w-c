import { StateChannel } from "/channels/lib/state-channel.js";

/** @type {StateChannel<string>} */
const userId = new StateChannel("user-id");

export default userId;