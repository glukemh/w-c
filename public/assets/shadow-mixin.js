export default function shadowMixin(Base = HTMLElement) {
	return class ShadowMixin extends Base {
		constructor() {
			super();
			this.attachShadow({ mode: "open" });
		}

		connect(content) {
			this.shadowRoot.replaceChildren(content);
		}
	};
}
