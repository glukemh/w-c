import "/components/a-route.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("main-nav");
export default class MainNav extends mixin() {}

customElements.define("main-nav", MainNav);
