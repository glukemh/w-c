import mixinForContent from "/assets/mixin-for-content.js";
import shadowMixin from "/assets/shadow-mixin.js";

/**
 * Provides a function which will apply a shadow and content mixin to the given base class.
 * @param {string} contentHandle file handle of the html content in the assets directory
 */
export default async function mixinForShadowContent(contentHandle) {
	const contentMixin = await mixinForContent(contentHandle);
	/**
	 * @template {GConstructor<HTMLElement>} T
	 * @param {T} Base
	 */
	return (Base) =>
		class ShadowContentMixin extends shadowMixin(contentMixin(Base)) {
			/**
			 * @param  {...any} args
			 */
			constructor(...args) {
				super(...args);
				this.connect(ShadowContentMixin.content);
			}
		};
}
