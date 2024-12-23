import { Route } from "/sw-lib/router.js";
import { roomWSWhenOpen } from "/sw-lib/room-websocket.js";
import bodyResult from "/sw-lib/body-result.js";

export default new Route('POST', async (req) => {
  const [body, error] = await bodyResult(req);
  if (error) {
    return new Response('Could not parse body based on Content-Type', { status: 400 });
  }
  let room = '';
  let message = '';
  if (body instanceof FormData) {
    const roomEntry = body.get('room');
    const messageEntry = body.get('message');
    if (typeof roomEntry === 'string' && typeof messageEntry === 'string') {
      room = roomEntry;
      message = messageEntry;
    }
  } else if (body && typeof body === "object") {
    if (typeof body['room'] === 'string' && typeof body['message'] === 'string') {
      room = body['room'];
      message = body['message'];
    }
  }
  const ws = await roomWSWhenOpen(room);
  return new Response;
});