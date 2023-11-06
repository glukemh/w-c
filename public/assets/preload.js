/**
 * Appends a preload link to the head of the document for the given asset.
 * @param {HTMLLinkElement["href"]} href Path to asset to preload
 * @param {HTMLLinkElement["as"]} as The "as" attribute value for the preload link, e.g. "style" or "script"
 * @returns {void}
 */
export default function preload(href, as) {
	if (document.head.querySelector(`link[rel="preload"][href="${href}"]`))
		return;
	const link = document.createElement("link");
	link.rel = "preload";
	link.href = href;
	link.as = as;
	document.head.append(link);
}
