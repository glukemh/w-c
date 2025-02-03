/** @import { State } from "/channels/user-id.js" */
/** @import { UserId } from "/lib/validate-user-id.js" */
import uniqueId from "/lib/unique-id.js";
import kv from "/sw/lib/kv-str.js";
import { SendChannel } from "/lib/state-channel.js";
import validateUserId from "/lib/validate-user-id.js";

/** @type {SendChannel<State>} */
const userId = new SendChannel("user-id");
const key = 'user-id';

kv.get(key).then(async result => {
  /** @type {UserId} */
  let id;
  if (result && validateUserId(result.value)) {
    id = result.value;
  } else {
    const value = uniqueId();
    if (!validateUserId(value)) return;
    await kv.add({ key, value });
    id = value;
  }
  userId.send(id);
});

export default userId;