import mixinForContent from "./mixin-for-content.js";
import shadowMixin from "./shadow-mixin.js";
import mixinForMixins from "./mixin-for-mixins.js";

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
