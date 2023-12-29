import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("peer-connection-state-indicator");

export default class PeerConnectionStateIndicator extends mixin(HTMLElement) {}

customElements.define(
	"peer-connection-state-indicator",
	PeerConnectionStateIndicator
);
