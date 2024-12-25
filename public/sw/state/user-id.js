import kv from "/sw/lib/kv-str.js";
import userId from "/channels/user-id.js";

const key = 'user-id';

kv.get(key).then(async result => {
  if (result) {
    userId.postMessage(result.value);
  } else {
    const value = Math.random().toString(36).substring(2);
    await kv.add({ key, value }, key);
    userId.postMessage(value);
  }
});