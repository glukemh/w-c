navigator.serviceWorker.register("/assets/service-worker.js").then(
	(registration) => {
		console.log("Service worker registration successful:", registration);
	},
	(error) => {
		console.error(`Service worker registration failed: ${error}`);
	}
);
