export async function onRequestPost({ request, env }) {
	console.debug("env", env);
	let offer;
	let roomId;
	try {
		// Parse the request body
		({ offer, roomId } = await request.json());
		if (!offer || !roomId) {
			return new Response("Need roomId and offer", { status: 400 });
		}
	} catch (error) {
		return new Response("Expecting request to be JSON", { status: 400 });
	}

	// Return a response
	return new Response("Success", { status: 200 });
}
