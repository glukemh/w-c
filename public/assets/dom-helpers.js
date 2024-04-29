/** Get template from local DOM context by id
 * @param {Element} el and element connected to the DOM
 * @param {string} id id attribute of template */
export function templateById(el, id) {
	const root = el.getRootNode();
	if (!(root instanceof Document || root instanceof ShadowRoot)) {
		return null;
	}
	const template = root.getElementById(id);
	if (!(template instanceof HTMLTemplateElement)) {
		return null;
	}
	return template;
}

/** Bind attributes and children to an element
 * @param {Element} element element to bind to
 * @param {object} options
 * @param {Attr[]} [options.attributes] attributes to bind
 * @param {Node[]} [options.children] children to bind
 */
export function resetElement(element, options) {
	const { attributes, children } = options;
	if (attributes) {
		for (const attr of [...element.attributes]) {
			element.removeAttributeNode(attr);
		}
		for (const attr of attributes) {
			attr.ownerElement?.removeAttributeNode(attr);
			element.setAttributeNode(attr);
		}
	}
	if (children) {
		element.replaceChildren(...children);
	}
}

/** Convert a record object to a list of attributes.
 *	@param {Record<string, { toString(): string }>} obj object to convert to attribute list
 */
export function nodesFromObject(obj) {
	return Object.entries(obj).map(([key, value]) => {
		const attr = document.createAttribute(key);
		attr.value = value.toString();
		return attr;
	});
}

/** Clone attributes from element optionally filtering and removing by a prefix
 * @param {Element} element element to clone attributes from
 * @param {string} [prefix] prefix to filter attributes by
 * @param {boolean} [removePrefix] remove prefix from cloned attributes
 */
export function cloneAttributes(element, prefix = "", removePrefix = false) {
	return [...element.attributes]
		.filter((attr) => attr.name.startsWith(prefix))
		.map((attr) => {
			const clone = document.createAttribute(
				removePrefix ? attr.name.slice(prefix.length) : attr.name
			);
			clone.value = attr.value;
			return clone;
		});
}

/** List of cloned child nodes from parent node.
 * @param {Node} node node to clone content */
export function cloneContent(node) {
	return [...node.cloneNode(true).childNodes];
}
