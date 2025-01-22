/** @import { Message, State as MessagesState } from "/channels/messages.js" */
import { FilterChannel } from "/lib/request-channel.js";
import { SendChannel } from "/sw/lib/send-channel.js";

/** @type {FilterChannel<State, Filter>} */
export default new FilterChannel("messages-filtered");

/** @extends {SendChannel<State>} */
export class SendMessagesFiltered extends SendChannel {
  /**
   * @param {string} channelName
   * @param {Filter} filter */
  constructor(channelName, filter) {
    super(channelName);
    this.filter = filter;
  }
  /** @param {State} messages */
  send(messages) {
    super.send(messages.filter((messages) => messages.room === this.filter.room));
  }
}

/** @typedef {Parameters<MessagesState['get']>[0]} Filter */
/** @typedef {Exclude<ReturnType<MessagesState['get']>, undefined>} State */
