import { cloneAttributes, templateById } from "/assets/dom-helpers.js";

/**
 * @template {new (...args: any[]) => HTMLElement} T
 * @param {T} Base
 */
export const templateBindMixin = (Base) => {
	/**
	 * @extends {Base}
	 */
	class TemplateBindMixin extends Base {
		/** @type {Map<string, { element: Element, lockedAttributes: Set<string>, lockedChildren: boolean}>} */
		#elements = new Map();

		/** @param {string} attrName */
		#templateFromAttr(attrName) {
			const elementContent = this.#elements.get(attrName);
			if (!elementContent || !this.isConnected) return;

			const { element, lockedAttributes, lockedChildren } = elementContent;
			const attrValue = this.getAttribute(attrName);
			const template = attrValue ? templateById(this, attrValue) : null;

			if (template) {
				for (const attr of cloneAttributes(template, "data-", true)) {
					if (lockedAttributes.has(attr.name)) continue;
					element.setAttributeNode(attr);
				}
				if (!lockedChildren) {
					element.replaceChildren(
						...template.content.cloneNode(true).childNodes
					);
				}
			} else {
				for (const attr of [...element.attributes]) {
					if (lockedAttributes.has(attr.name)) continue;
					element.removeAttributeNode(attr);
				}
				if (!lockedChildren) element.replaceChildren();
			}

			if (this.hasAttribute(attrName)) {
				this.append(element);
			} else {
				element.remove();
			}
		}

		connectedCallback() {
			for (const attrName of this.#elements.keys()) {
				this.#templateFromAttr(attrName);
			}
		}

		/**
		 * Map an attribute name to an element. This element's attribute value will be used to find a template
		 * by id, setting the argument element's attributes based on the templates data attributes and setting
		 * the argument element's child nodes based on the template's content. If no template exists or the
		 * attribute value is null, attribute and child nodes will be removed. Attributes nodes that exist on
		 * the argument element when this function is called will not be replaced. If the argument element has
		 * any child nodes when this function is called, they will not be replaced.
		 * @template {Element} T
		 * @param {T} element The element will have attributes and children set from the template
		 * @param {string} attrName The attribute name used to find the template
		 * @returns {T} returns the element
		 */
		lock(element, attrName) {
			this.#elements.set(attrName, {
				element,
				lockedAttributes: new Set(
					[...element.attributes].map((attr) => attr.name)
				),
				lockedChildren: element.hasChildNodes(),
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
	return TemplateBindMixin;
};

export default class TemplateBindElement extends templateBindMixin(
	HTMLElement
) {}
