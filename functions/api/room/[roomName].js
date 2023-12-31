/**
 * @typedef {{ ROOM: DurableObjectNamespace }} Env
 */

/**
 * @param {Parameters<PagesFunction<Env, "roomName">>} args
 * @returns {Promise<Response>}
 */
export async function onRequestGet(...args) {
	const [{ request, env, params }] = args;
	const { roomName } = params;
	if (typeof roomName !== "string" || roomName.length > 32) {
		return new Response("Expected roomName (shorter than 32 characters)", {
			status: 400,
		});
	}
	const { ROOM } = env;
	try {
		const room = ROOM.get(ROOM.idFromName(roomName));
		const res = await room.fetch(request);
		return res;
	} catch (error) {
		console.error(error);
		return new Response("Something went wrong", { status: 500 });
	}
}
