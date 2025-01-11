/** @import { Filter } from "/channels/messages-filtered.js" */
/** @import { State } from "/channels/messages.js" */
import { SendChannel } from "/sw/lib/send-channel.js";
import messages from "/channels/messages.js";
import messagesFiltered from "/channels/messages-filtered.js";


/** @type {Map<string, { channel: SendChannel<State>, filter: Filter}>} */
const filteredChannels = new Map();
messagesFiltered.subscribe(async (iter) => {
  for await (const { channel, filter } of iter) {
    let filteredChannel = filteredChannels.get(channel);
    if (filteredChannel) {
      filteredChannel.filter = filter;
      continue;
    }
    filteredChannel = { filter, channel: new SendChannel(channel) };
    filteredChannels.set(channel, filteredChannel);
    filteredChannel.channel.onClose(() => {
      filteredChannels.delete(channel);
    });
    messages.onClose(() => {
      filteredChannel.channel.close();
    });
    messages.subscribe(async (iter) => {
      for await (const messageArr of iter) {
        if (filteredChannel.channel.closed) break;
        const filteredMessages = messageArr.filter((message) => message.room === filteredChannel.filter.room);
        filteredChannel.channel.send(filteredMessages);
      }
    });
  }
});
