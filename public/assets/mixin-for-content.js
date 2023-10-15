import fetchContent from "./fetch-content.js";

export default async function mixinForContent(handle) {
	const content = await fetchContent(handle);
	return (Base = HTMLElement) =>
		class ContentMixin extends Base {
			static get content() {
				return content.cloneNode(true);
			}
		};
}
