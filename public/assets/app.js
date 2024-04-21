import subscribe from "/assets/state-dom.js";

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

const { update } = subscribe(
	"/assets/location-state.js",
	/** @param {typeof import('/assets/location-state.js').default.state} state */ (
		state
	) => {
		if (state.href !== location.href) {
			history.pushState(null, "", state.href);
		}
	}
);

update({
	href: location.href,
	protocol: location.protocol,
	hostname: location.hostname,
	port: location.port,
	pathname: location.pathname,
	search: location.search,
	hash: location.hash,
});
