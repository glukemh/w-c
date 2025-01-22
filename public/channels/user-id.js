/** @import { UserId } from "/lib/validate-user-id.js" */
import { RequestChannel } from "/lib/request-channel.js";

/** @type {RequestChannel<State>} */
export default new RequestChannel("user-id");

/** @typedef {UserId} State */