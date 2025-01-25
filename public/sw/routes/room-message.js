import validateRoom from "/lib/validate-room.js";
import { Route } from "/sw/lib/router.js";
import { roomWSWhenOpen } from "/sw/lib/room-websocket.js";
import { returnTo, badInput, somethingWrong } from "/sw/lib/response.js";
import bodyResult from "/sw/lib/body-result.js";

export default new Route('POST', async (req) => {
  try {
    const result = await bodyResult(req);
    if (result instanceof Error) {
      return badInput(result);
    }
    const room = result.get('room');
    const message = result.get('message');
    if (!validateRoom(room)) {
      return badInput('Expecting room to be a valid room name');
    }
    if (typeof message !== 'string') {
      return badInput('Expecting message to be a string');
    }
    const ws = await roomWSWhenOpen(room);

    return returnTo(result);
  } catch (e) {
    return somethingWrong(e);
  }
});