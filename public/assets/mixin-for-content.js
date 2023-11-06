import fetchContent from "./fetch-content.js";
import preloadStylesheets from "./preload-stylesheets.js";

/**
 * Fetches HTML content by handle in the assets directory.
 * Returns a function which will apply the content as a mixin to the given base class.
 * @param {string} handle file handle of the html content
 */
export default async function mixinForContent(handle) {
	const content = await fetchContent(handle);
	preloadStylesheets(content);
	/**
	 * @template {Constructor} T
	 * @param {T} Base
	 */
	return (Base) =>
		class ContentMixin extends Base {
			static get content() {
				return content.cloneNode(true);
			}
		};
}
