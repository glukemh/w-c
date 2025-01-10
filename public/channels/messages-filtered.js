/** @import { Message, State } from "/channels/messages.js" */
import { FilterChannel } from "/lib/request-channel.js";

/** @type {FilterChannel<State, Filter>} */
export default new FilterChannel("messages-filtered")

/** 
 * @typedef Filter
 * @prop {Message['room']} room
 */
