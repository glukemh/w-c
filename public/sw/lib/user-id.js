import kv from "/sw/lib/kv-str.js";

const key = 'user-id';

/** @type {Promise<string>} */
export default new Promise(async (resolve, reject) => {
  try {
    const userIdResult = await kv.get(key);
    /** @type {string} */
    let userId;
    if (userIdResult) {
      userId = userIdResult.value;
    } else {
      userId = Math.random().toString(36).substring(2);
      await kv.add({ key, value: userId }, key);
    }
    resolve(userId);
  } catch (e) {
    reject(e);
  }
});