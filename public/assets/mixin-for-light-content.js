import mixinForContent from "./mixin-for-content.js";
import lightMixin from "./light-mixin.js";

/**
 * A mixin for both content mixin and light mixin
 * @param {string} handle File handle for mixinForContent
 */
export default async function mixinForLightContent(handle) {
	const contentMixin = await mixinForContent(handle);
	/**
	 * @template {GConstructor<HTMLElement>} T
	 * @param {T} Base
	 */
	return (Base) => {
		class LightContentMixin extends lightMixin(contentMixin(Base)) {
			/**
			 * @param  {...any} args
			 */
			constructor(...args) {
				super(...args);
				this.connect(LightContentMixin.content);
			}
		}

		return /** @type {{ new (): InstanceType<T> & LightContentMixin } & typeof LightContentMixin} */ (
			LightContentMixin
		);
	};
}
