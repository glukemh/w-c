import { Route } from "/sw-lib/router.js";
import { roomWSWhenOpen } from "/sw-lib/room-websocket.js";
import bodyResult from "/sw-lib/body-result.js";

export default new Route('POST', async (req) => {
  try {
    let room = '';
    const [body, error] = await bodyResult(req);
    if (error) {
      return new Response('Could not parse body based on Content-Type', { status: 400 });
    }
    if (typeof body === 'string') {
      room = body;
    } else if (body instanceof FormData) {
      const roomEntry = body.get('room');
      if (typeof roomEntry === 'string') {
        room = roomEntry;
      }
    } else if (body && typeof body === 'object' && 'room' in body && typeof body.room === 'string') {
      room = body.room;
    }
    if (!room) {
      return new Response('Incorrectly formatted request body', { status: 400 });
    }
    await roomWSWhenOpen(room);
    return new Response('websocket opened', { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('websocket error', { status: 500 });
  }
});