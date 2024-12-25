import StateChannel from "/channels/state-channel.js";

/** @type {StateChannel<string[]>} */
export default new StateChannel("rooms", (a, b) => {
  const aSet = new Set(a);
  const bSet = new Set(b);
  return aSet.isSubsetOf(bSet) && bSet.isSubsetOf(aSet);
});