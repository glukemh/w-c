import { Route } from "/sw-lib/router.js";
import { roomWSWhenOpen } from "/sw-lib/room-websocket.js";
import bodyResult from "/sw-lib/body-result.js";

export default new Route('POST', async (req) => {
  const result = await bodyResult(req);
  if (result instanceof Error) {
    console.error(result);
    return new Response('Could not parse body based on Content-Type', { status: 400 });
  }
  const room = result.get('room');
  const message = result.get('message');
  if (typeof room !== 'string' || typeof message !== 'string') {
    return new Response('Incorrectly formatted request body', { status: 400 });
  }
  const ws = await roomWSWhenOpen(room);
  return new Response;
});