/** @import { State } from "/channels/messages.js" */
import { SendChannel } from "/sw/lib/send-channel.js";

/** @type {SendChannel<State>} */
const messages = new SendChannel("messages");
messages.send([]);

export default messages;