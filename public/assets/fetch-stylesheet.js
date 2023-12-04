/**
 * Fetches css stylesheet in the assets directory by file handle.
 * @param {string} handle
 * @returns {Promise<CSSStyleSheet>}
 */
export default async function fetchStylesheet(handle) {
	const res = await fetch(`/assets/${handle}.css`);
	if (!res.ok)
		throw new Error(`fetchStylesheet: ${res.status} ${res.statusText}`);
	const css = await res.text();
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(css);
	return sheet;
}
