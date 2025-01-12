import "/lib/navigation-focus.js";

try {
	const registration = await navigator.serviceWorker.register(
		"/service-worker.js",
		{ type: "module" }
	);
	console.log(
		"ServiceWorker registration successful with scope: ",
		registration.scope
	);
} catch (error) {
	console.error("ServiceWorker registration failed: ", error);
}
