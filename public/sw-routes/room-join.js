import { Route } from "/sw-lib/router.js";
import { roomWSWhenOpen } from "/sw-lib/room-websocket.js";
import { redirect } from "/sw-lib/response.js";
import bodyResult from "/sw-lib/body-result.js";

export default new Route('POST', async (req) => {
  try {
    const result = await bodyResult(req);
    if (result instanceof Error) {
      console.error(result);
      return new Response('Could not parse body based on Content-Type', { status: 400 });
    }
    const room = result.get('room');
    if (typeof room !== 'string') {
      return new Response('Incorrectly formatted request body', { status: 400 });
    }
    let returnTo = '/';
    const returnToEntry = result.get('returnTo');
    if (typeof returnToEntry === 'string') {
      returnTo = returnToEntry;
    }
    await roomWSWhenOpen(room);
    return redirect(returnTo);
  } catch (e) {
    console.error(e);
    return new Response('websocket error', { status: 500 });
  }
});