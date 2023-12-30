import "/components/main-page.js";
import "/components/share-file.js";
import "/components/a-route.js";
import "/components/index-db-view.js";
import "/components/join-room.js";
import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";
import linkLoadMixin from "../../assets/links-when-loaded-mixin.js";

const mixin = await mixinForShadowContent("r-index");
export default class RIndex extends linkLoadMixin(mixin(HTMLElement)) {
	linksLoaded = this.linksWhenLoaded(this.shadow);

	connectedCallback() {
		this.fadeInWhen(this.linksLoaded);
	}
}

customElements.define("r-index", RIndex);
