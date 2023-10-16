import mixinForContent from "./mixin-for-content.js";
import lightMixin from "./light-mixin.js";
import mixinForMixins from "./mixin-for-mixins.js";

export default async function mixinForLightContent(handle) {
	const mixin = await mixinForMixins([lightMixin, mixinForContent(handle)]);
	return (Base = HTMLElement) =>
		class LightContentMixin extends mixin(Base) {
			constructor() {
				super();
				this.connect(this.constructor.content);
			}
		};
}
