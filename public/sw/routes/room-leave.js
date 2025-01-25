import validateRoom from "/lib/validate-room.js";
import { Route } from "/sw/lib/router.js";
import { closeRoomWebSocket } from "/sw/lib/room-websocket.js";
import { returnTo, badInput, somethingWrong } from "/sw/lib/response.js";
import bodyResult from "/sw/lib/body-result.js";

export default new Route('POST', async (req) => {
  try {
    const result = await bodyResult(req);
    if (result instanceof Error) {
      return badInput(result);
    }
    const room = result.get('room');
    if (!validateRoom(room)) {
      return badInput('Expecting room to be a valid room name');
    }
    await closeRoomWebSocket(room);
    return returnTo(result);
  } catch (e) {
    return somethingWrong(e);
  }
});