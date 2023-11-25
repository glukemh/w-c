export async function onRequestPost({ request }) {
	let answer;
	try {
		// Parse the request body
		answer = await request.json();
		if (!answer) {
			return new Response("Invalid request", { status: 400 });
		}
	} catch (error) {
		return new Response("Expecting request to be JSON", { status: 400 });
	}

	// Return a response
	return new Response("Success", { status: 200 });
}
