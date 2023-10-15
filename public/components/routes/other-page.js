import "/components/main-page.js";
import "/components/a-route.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("r-other-page");
export default class ROtherPage extends mixin() {}

customElements.define("r-other-page", ROtherPage);
