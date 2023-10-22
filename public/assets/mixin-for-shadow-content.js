import mixinForContent from "./mixin-for-content.js";
import shadowMixin from "./shadow-mixin.js";
import mixinForMixins from "./mixin-for-mixins.js";

/**
 * Provides a function which will apply a shadow and content mixin to the given base class.
 * @param {string} handle file handle of the html content in the assets directory
 */
export default async function mixinForShadowContent(handle) {
	const mixin = await mixinForMixins([shadowMixin, mixinForContent(handle)]);
	return (Base = HTMLElement) =>
		class ShadowContentMixin extends mixin(Base) {
			constructor() {
				super();
				this.connect(this.constructor.content);
			}
		};
}
