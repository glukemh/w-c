import { StateChannel } from "/channels/lib/state-channel.js";

/** @type {StateChannel<string[]>} */
export default new StateChannel("messages-filtered-channels", (a, b) => {
  if (a.length !== b.length) return false;
  const aCount = countOccurrences(a);
  const bCount = countOccurrences(b);
  return Object.keys(aCount).every(key => aCount[key] === bCount[key]);
});

/** @param {string[]} arr */
function countOccurrences(arr) {
  return arr.reduce((acc, val) => {
    acc[val] ??= 0;
    acc[val]++;
    return acc;
  }, /** @type {Record<string, number>} */({}));
}