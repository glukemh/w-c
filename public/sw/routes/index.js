import roomJoin from "./room-join.js";
import roomMessage from "./room-message.js";
import roomLeave from "./room-leave.js";

export default {
  '/api/room/join': roomJoin.use(),
  '/api/room/message': roomMessage.use(),
  '/api/room/leave': roomLeave.use()
};