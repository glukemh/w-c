import "/components/main-layout.js";
import "/components/main-nav.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("main-page");
export default class MainPage extends mixin() {}

customElements.define("main-page", MainPage);
