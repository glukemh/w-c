import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("main-layout");
export default class MainLayout extends mixin(HTMLElement) {}

customElements.define("main-layout", MainLayout);
