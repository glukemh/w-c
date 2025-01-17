import messages from "/channels/messages.js";
import messagesFiltered, { SendMessagesFiltered } from "/channels/messages-filtered.js";


/** @type {Map<string, SendMessagesFiltered>}>} */
const filteredChannels = new Map();
messagesFiltered.subscribe(async (iter) => {
  for await (const { channel, filter } of iter) {
    let filteredChannel = filteredChannels.get(channel);
    if (filteredChannel) {
      filteredChannel.filter = filter;
      filteredChannel.send(await messages.request());
      continue;
    }
    filteredChannel = new SendMessagesFiltered(channel, filter);
    filteredChannels.set(channel, filteredChannel);
    filteredChannel.onClose(() => {
      filteredChannels.delete(channel);
    });
    messages.onClose(() => {
      filteredChannel.close();
    });
    messages.subscribe(async (iter) => {
      for await (const messageArr of iter) {
        if (filteredChannel.closed) break;
        filteredChannel.send(messageArr);
      }
    });
  }
});
