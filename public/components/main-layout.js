import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("main-layout");
export default class MainNav extends mixin() {}

customElements.define("main-layout", MainNav);
