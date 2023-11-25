import "/components/main-page.js";
import "/components/share-file.js";
import "/components/a-route.js";
import "/components/index-db-view.js";
import "/components/join-room.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("r-index");
export default class RIndex extends mixin(HTMLElement) {}

customElements.define("r-index", RIndex);
