/**
 * A mixin that applies a shadowRoot and a single connect method which replaces shadowRoot children with content.
 * @template {GConstructor<HTMLElement>} T
 * @param {T} Base
 */
export default function linksWhenLoadedMixin(Base) {
	return class LinksWhenLoadedMixin extends Base {
		/**
		 * Any DOM node with query selecting
		 * @param {ParentNode} node
		 * @returns {Promise<HTMLLinkElement[]>}
		 */
		async linksWhenLoaded(node) {
			const links = node.querySelectorAll("link");
			const linksArray = await Promise.all(
				Array.from(links).map((link) => {
					return new Promise((resolve, reject) => {
						link.addEventListener("load", () => {
							resolve(link);
						});
						link.addEventListener("error", () => {
							reject();
						});
					});
				})
			);
			return linksArray;
		}
	};
}
