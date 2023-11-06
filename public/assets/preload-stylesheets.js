import preload from "./preload.js";

/**
 * Preloads all stylesheets descendent from the given node.
 * @param {ParentNode} node A node to search for link elements with rel="stylesheet" and preload them
 */
export default function preloadStylesheets(node) {
	for (const link of node.querySelectorAll('link[rel="stylesheet"]')) {
		if (link instanceof HTMLLinkElement) {
			preload(link.href, "style");
		}
	}
}
