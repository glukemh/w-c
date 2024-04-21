import State from "/assets/state.js";

/**
 * @extends {State<{
 *  href: string,
 *  protocol: string,
 *  hostname: string,
 *  port: string,
 *  pathname: string,
 *  search: string,
 *  hash: string
 * }>}
 */
class LocationState extends State {
	constructor() {
		super({
			href: location.href,
			protocol: location.protocol,
			hostname: location.hostname,
			port: location.port,
			pathname: location.pathname,
			search: location.search,
			hash: location.hash,
		});
	}
}

export default new LocationState();
