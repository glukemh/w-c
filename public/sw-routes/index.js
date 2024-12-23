import roomJoin from "./room-join.js";
import roomMessage from "./room-message.js";

export default {
  '/api/room/join': roomJoin.use(),
  '/api/room/message': roomMessage.use()
};