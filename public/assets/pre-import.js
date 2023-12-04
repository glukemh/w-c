/**
 * Use this function to pre-import some module, so it can be immediately imported later.
 * @param {string} path
 * @returns {Promise<void>}
 */
export default async function preImport(path) {
	try {
		await import(path);
	} catch (e) {
		console.error(`Error pre-importing ${path}`, e);
	}
}
