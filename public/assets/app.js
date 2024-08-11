app();
async function app() {
	try {
		const registration = await navigator.serviceWorker.register(
			"/assets/service-worker.js"
		);
		console.log(
			"ServiceWorker registration successful with scope: ",
			registration.scope
		);
	} catch (error) {
		console.error("ServiceWorker registration failed: ", error);
	}
}
