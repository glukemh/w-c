import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("room-main-layout");

export default class RoomMainLayout extends mixin(HTMLElement) {}

customElements.define("room-main-layout", RoomMainLayout);
