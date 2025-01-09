/** @import { State } from "/channels/user-id.js" */
import kv from "/sw/lib/kv-str.js";
import SendChannel from "/sw/lib/send-channel.js";

/** @type {SendChannel<State>} */
const userId = new SendChannel("user-id");
const key = 'user-id';

kv.get(key).then(async result => {
  if (result) {
    userId.sendNext(result.value);
  } else {
    const value = Math.random().toString(36).substring(2);
    await kv.add({ key, value }, key);
    userId.sendNext(value);
  }
});