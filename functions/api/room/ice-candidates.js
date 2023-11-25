export async function onRequestPost({ request }) {
	let iceCandidates;
	try {
		// Parse the request body
		iceCandidates = await request.json();
		if (!iceCandidates) {
			return new Response("Invalid request", { status: 400 });
		}
	} catch (error) {
		return new Response("Expecting request to be JSON", { status: 400 });
	}

	// Return a response
	return new Response("Success", { status: 200 });
}
