import fetchContent from "./fetch-content.js";
import preloadStylesheets from "./preload-stylesheets.js";

/**
 * @typedef {new (...args: any[]) => any} AnyConstructor any constructor function
 */

/**
 * @template {AnyConstructor} T any constructor function generic
 * @typedef {T & { content: Node }} ContentMixin mixin with a static content property
 */

/**
 * Fetches HTML content by handle in the assets directory.
 * Returns a function which will apply the content as a mixin to the given base class.
 * @param {string} handle file handle of the html content
 * @returns {Promise<<T extends AnyConstructor>(b: T) => ContentMixin<T>>} A promise which resolves to a function which will apply the content mixin to a base class.
 */
export default async function mixinForContent(handle) {
	const content = await fetchContent(handle);
	preloadStylesheets(content);
	return (Base) =>
		class ContentMixin extends Base {
			static get content() {
				return content.cloneNode(true);
			}
		};
}
