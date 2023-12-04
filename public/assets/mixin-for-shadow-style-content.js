import mixinForAdoptedStylesheet from "/assets/mixin-for-adopted-stylesheet.js";
import mixinForContent from "/assets/mixin-for-content.js";

/**
 * Provides a function which will apply a shadow, stylesheet, and content mixin to the given base class.
 * @param {string} handle file handle should match the html content and stylesheet in the assets directory
 */
export default async function mixinForShadowStyleContent(handle) {
	const [contentMixin, styleMixin] = await Promise.all([
		mixinForContent(handle),
		mixinForAdoptedStylesheet(handle),
	]);
	/**
	 * @template {GConstructor<HTMLElement>} T
	 * @param {T} Base
	 */
	return (Base) =>
		class ShadowContentStyleMixin extends styleMixin(contentMixin(Base)) {
			/**
			 * @param  {...any} args
			 */
			constructor(...args) {
				super(...args);
				this.connect(ShadowContentStyleMixin.content);
			}
		};
}
