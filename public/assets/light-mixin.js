export default function lightMixin(Base = HTMLElement) {
	return class LightMixin extends Base {
		connect(content) {
			this.replaceChildren(content);
		}
	};
}
