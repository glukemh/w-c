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
			/** @type { HTMLTemplateElement | null} */
			let template = null;
			if (attrValue !== null) {
				if (attrValue) {
					template = templateById(this, attrValue);
				} else {
					const child = this.children.namedItem(attrName);
					if (child instanceof HTMLTemplateElement) {
						template = child;
					}
				}
			}

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
			super["connectedCallback"]?.();
			for (const attrName of this.#elements.keys()) {
				this.#templateFromAttr(attrName);
			}
		}

		/**
		 * Map an attribute name to an element. The invoking element's attribute value will be used to find a
		 * template by id, setting the argument element's attributes based on the templates data attributes and
		 * setting the argument element's child nodes based on the template's content. If no template exists or
		 * the attribute value is null, attribute and child nodes will be removed. Attributes nodes that exist
		 * on the argument element when this function is called will not be replaced. If the argument element
		 * has any child nodes when this function is called, they will not be replaced.
		 * @template {Element} T
		 * @param {string} attrName The invoking element's attribute name used to find the template
		 * @param {T} element The element will have attributes and children set from the template
		 * @param {object} [options]
		 * @param {string[]} [options.lockedAttributes] An array of the argument element's attribute names that
		 * will not be removed
		 * @param {boolean} [options.lockedChildren] If true, the argument element's children will not be
		 * removed
		 * @returns {T} returns the argument element
		 */
		lock(attrName, element, options = {}) {
			const {
				lockedAttributes = [...element.attributes].map((attr) => attr.name),
				lockedChildren = element.hasChildNodes(),
			} = options;
			this.#elements.set(attrName, {
				element,
				lockedAttributes: new Set(lockedAttributes),
				lockedChildren,
			});
			return element;
		}

		/**
		 * @param {string} name
		 * @param {string | null} _oldValue
		 * @param {string | null} _newValue
		 */
		attributeChangedCallback(name, _oldValue, _newValue) {
			super["attributeChangedCallback"]?.(name, _oldValue, _newValue);
			this.#templateFromAttr(name);
		}
	}
	return TemplateBindMixin;
};

export default class TemplateBindElement extends templateBindMixin(
	HTMLElement
) {}
