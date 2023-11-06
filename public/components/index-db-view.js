import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("index-db-view");
export default class IndexDbView extends mixin(HTMLElement) {}

customElements.define("index-db-view", IndexDbView);
