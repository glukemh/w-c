import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("share-file");

class ShareFile extends mixin(HTMLElement) {
	/**
	 * @type {HTMLFormElement} fileInput Reference to the file input element.
	 */
	form = /** @type {HTMLFormElement} */ (this.shadow.getElementById("form"));

	handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData(this.form);
		formData.append("username", "test");
		// try {
		// 	const res = await fetch("/api/share-file", {
		// 		method: "POST",
		// 		body: formData,
		// 	});
		// 	if (!res.ok) throw new Error("Unable to share file");
		// } catch (err) {
		// 	console.error("Error fetching share-file\n", err);
		// }
	};

	connectedCallback() {
		super.connectedCallback?.();
		this.form.addEventListener("submit", this.handleSubmit);
	}

	disconnectedCallback() {
		super.disconnectedCallback?.();
		this.form.removeEventListener("submit", this.handleSubmit);
	}
}

customElements.define("share-file", ShareFile);
export default ShareFile;
