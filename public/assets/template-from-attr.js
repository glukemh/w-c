import {
	resetElement,
	cloneAttributes,
	templateById,
	cloneContent,
} from "/assets/dom-helpers.js";

export default class TemplateFromAttr extends HTMLElement {
	/** @type {Map<string, { element: Element, attributes: Attr[], children: Node[]}>} */
	#elements = new Map();

	/** @param {string} attrName */
	#templateFromAttr(attrName) {
		if (!this.isConnected) return;
		const attrValue = this.getAttribute(attrName);
		const elementContent = this.#elements.get(attrName);
		if (!elementContent) return;
		const { element, attributes, children } = elementContent;
		if (attrValue === null) {
			element.remove();
			resetElement(element, { attributes, children });
			return;
		}
		const template = attrValue ? templateById(this, attrValue) : null;
		if (template) {
			const options = children.length
				? { children }
				: { children: cloneContent(template.content) };
			options.attributes = cloneAttributes(template, "data-", true).concat(
				attributes
			);
			resetElement(element, options);
		} else {
			resetElement(element, { attributes, children });
		}
		this.append(element);
	}

	connectedCallback() {
		for (const attrName of this.#elements.keys()) {
			this.#templateFromAttr(attrName);
		}
	}

	/**
	 * Map an attribute name to an element. The attributes value will be used to find a template by id,
	 * setting the attributes and content of the template to the element.
	 * @template {Element} T
	 * @param {string} attrName
	 * @param {T} element
	 * @returns {T} returns the element
	 */
	templateAttr(attrName, element) {
		this.#elements.set(attrName, {
			element,
			attributes: [...element.attributes].map(
				(attr) => /** @type {Attr} */ (attr.cloneNode(true))
			),
			children: [...element.childNodes].map((node) => node.cloneNode(true)),
		});
		return element;
	}

	/**
	 * @param {string} name
	 * @param {string | null} _oldValue
	 * @param {string | null} _newValue
	 */
	attributeChangedCallback(name, _oldValue, _newValue) {
		this.#templateFromAttr(name);
	}
}
