import rooms from "/channels/rooms.js";
import userId from "/channels/user-id.js";

rooms.postMessage([]);
userId.addEventListener("message", () => {
  // rooms must be re-entered if the user id changes
  rooms.postMessage([]);
});
