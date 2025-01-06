import messagesFilteredChannels from "/channels/messages-filtered-channels.js";
import { FilteredMessagesChannel } from "/channels/messages.js";

/** @type {Map<string, FilteredMessagesChannel>} */
const filteredChannels = new Map();
messagesFilteredChannels.postMessage([]);

messagesFilteredChannels.addEventListener("message", ({ data }) => {
  const currentChannels = new Set(filteredChannels.keys());
  const newChannels = new Set(data);
  const channelsToRemove = currentChannels.difference(newChannels);
  const channelsToAdd = newChannels.difference(currentChannels);
  for (const channelName of channelsToRemove) {
    filteredChannels.get(channelName)?.close();
    filteredChannels.delete(channelName);
  }
  for (const channelName of channelsToAdd) {
    try {
      const { filterEntries } = FilteredMessagesChannel.decodeName(channelName);
      filteredChannels.set(channelName, new FilteredMessagesChannel(Object.fromEntries(filterEntries)));
    } catch (error) {
      console.error(error);
    }
  }
})

