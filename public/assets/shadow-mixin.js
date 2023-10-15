export default function shadowMixin(Base = HTMLElement) {
	return class ShadowMixin extends Base {
		shadow = this.attachShadow({ mode: "open" });
		constructor() {
			super();
		}

		connect(content) {
			this.shadow.replaceChildren(content);
		}
	};
}
