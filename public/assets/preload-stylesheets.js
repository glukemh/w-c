import preload from "./preload.js";

export default function preloadStylesheets(node) {
	for (const link of node.querySelectorAll('link[rel="stylesheet"]')) {
		if (link.href) {
			preload(link.href, "style");
		}
	}
}
