import RequestChannel from "/lib/request-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("user-id");

/** @typedef {string} State */