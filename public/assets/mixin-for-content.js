import fetchContent from "./fetch-content.js";
import preloadStylesheets from "./preload-stylesheets.js";

export default async function mixinForContent(handle) {
	const content = await fetchContent(handle);
	preloadStylesheets(content);
	return (Base = HTMLElement) =>
		class ContentMixin extends Base {
			static get content() {
				return content.cloneNode(true);
			}
		};
}
