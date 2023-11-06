import { df } from "./node-utils.js";

/**
 * Fetches HTML content by handle in the assets directory, returning a document fragment.
 * @param {string} handle Handle to HTML file in assets directory
 * @returns {Promise<ReturnType<typeof df>>} Returns the fetched html content as a document fragment
 */
export default async function fetchContent(handle) {
	const res = await fetch(`/assets/${handle}.html`);
	if (!res.ok)
		throw new Error(`fetchTemplate: ${res.status} ${res.statusText}`);
	return df(await res.text());
}
