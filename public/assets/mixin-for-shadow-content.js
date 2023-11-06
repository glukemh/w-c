import mixinForContent from "./mixin-for-content.js";
import shadowMixin from "./shadow-mixin.js";

/**
 * Provides a function which will apply a shadow and content mixin to the given base class.
 * @param {string} handle file handle of the html content in the assets directory
 */
export default async function mixinForShadowContent(handle) {
	const contentMixin = await mixinForContent(handle);
	/**
	 * @template {GConstructor<HTMLElement>} T
	 * @param {T} Base
	 */
	return (Base) => {
		class ShadowContentMixin extends shadowMixin(contentMixin(Base)) {
			/**
			 * @param  {...any} args
			 */
			constructor(...args) {
				super(...args);
				this.connect(ShadowContentMixin.content);
			}
		}

		return /** @type {{ new (): InstanceType<T> & ShadowContentMixin } & typeof ShadowContentMixin} */ (
			ShadowContentMixin
		);
	};
}
