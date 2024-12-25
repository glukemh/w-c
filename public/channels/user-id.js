import StateChannel from "/channels/state-channel.js";

/** @type {StateChannel<string>} */
const userId = new StateChannel("user-id");

export default userId;