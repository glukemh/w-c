const range = new Range();

/**
 * @type {Range["createContextualFragment"]}
 */
export const df = range.createContextualFragment.bind(range);
/**
 * @type {Document["createElement"]}
 */
export const el = document.createElement.bind(document);
/**
 * @type {Document["createAttribute"]}
 */
export const attr = document.createAttribute.bind(document);
