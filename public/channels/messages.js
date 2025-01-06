import { StateChannel, FilteredStateChannel } from "/channels/lib/state-channel.js";

const name = "messages";

/** @type {StateChannel<Message[]>} */
export default new StateChannel(name, equalMessagesArray);

/** @extends {FilteredStateChannel<Message>} */
export class FilteredMessagesChannel extends FilteredStateChannel {
  /** @param {Partial<Message>} filter */
  constructor(filter) {
    super(name, filter, equalMessages);
  }
}

/**
 * True if messages are equal
 * @param {Message} a
 * @param {Message} b */
function equalMessages(a, b) {
  return a.timestamp === b.timestamp && a.room === b.room && a.user === b.user && a.text === b.text;
}

/**
 * @param {Message[]} a
 * @param {Message[]} b */
function equalMessagesArray(a, b) {
  return a.length === b.length && a.every((m, i) => equalMessages(m, b[i]));
}

/**
 * @typedef Message
 * @prop {number} timestamp
 * @prop {string} room
 * @prop {string} user
 * @prop {string} text
 */