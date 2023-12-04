import fetchStylesheet from "/assets/fetch-stylesheet.js";
import shadowMixin from "/assets/shadow-mixin.js";

/**
 * Fetches stylesheet by handle in the assets directory.
 * Returns a function which will apply the stylesheet as a mixin to the given base class.
 * @param {string} handle
 */
export default async function mixinForAdoptedStylesheet(handle) {
	const stylesheet = await fetchStylesheet(handle);
	/**
	 * @template {GConstructor<HTMLElement>} T
	 * @param {T} Base
	 */
	return (Base) =>
		class AdoptedStylesheetMixin extends shadowMixin(Base) {
			static get stylesheet() {
				return stylesheet;
			}
			/**
			 * @param  {...any} args
			 */
			constructor(...args) {
				super(...args);
				this.shadow.adoptedStyleSheets = [
					...this.shadow.adoptedStyleSheets,
					AdoptedStylesheetMixin.stylesheet,
				];
			}
		};
}
