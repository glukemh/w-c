/** @import { State } from "/channels/messages.js" */
import { SendChannel } from "/lib/state-channel.js";

/** @type {SendChannel<State>} */
const messages = new SendChannel("messages");
messages.send(new Map());

export default messages;