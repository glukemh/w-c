import mixinForShadowContent from "/assets/mixin-for-shadow-content.js";

const mixin = await mixinForShadowContent("index-db-view");

class IndexDbView extends mixin(HTMLElement) {
	/**
	 * @type {HTMLOListElement} ul Reference to the ul element.
	 */
	ol = /** @type {HTMLOListElement} */ (this.shadow.querySelector("ol"));
	/**
	 * @type {HTMLInputElement} fileInput Reference to the file input element.
	 */
	fileInput = /** @type {HTMLInputElement} */ (
		this.shadow.querySelector("input[type=file]")
	);
	/**
	 * IndexDB
	 * @type {Promise<IDBDatabase>} db Reference to the database.
	 */
	db;
	/**
	 * Resolves the db promise.
	 * @type {(value: IDBDatabase | PromiseLike<IDBDatabase>) => void}
	 */
	#resolveDB;
	/**
	 * Reject the db promise.
	 * @type {(reason?: any) => void}
	 */
	#rejectDB;
	constructor() {
		super();
		this.db = new Promise((resolve, reject) => {
			this.#resolveDB = resolve;
			this.#rejectDB = reject;
		});
	}
	connectedCallback() {
		this.resolveDB();
		this.renderDB();
		this.fileInput.addEventListener("change", async () => {
			if (!this.fileInput.files) return;
			const [file] = this.fileInput.files;
			await this.addFileToDb(file);
			this.renderDB();
		});
	}

	async renderDB() {
		this.ol.replaceChildren();
		const db = await this.db;
		if (db.objectStoreNames.contains("w-c")) {
			const transaction = db.transaction("w-c", "readonly");
			const objectStore = transaction.objectStore("w-c");
			const cursor = objectStore.openCursor();
			cursor.addEventListener("success", () => {
				const { result } = cursor;
				if (result) {
					const li = document.createElement("li");
					li.textContent = result.value.name;
					this.ol.appendChild(li);
					result.continue();
				}
			});
		}
	}

	/**
	 * Adds a file to the IndexedDB database.
	 * @param {File} file - The file to add to the database.
	 * @returns {Promise<void>} A promise that resolves when the file has been successfully added to the database.
	 */
	async addFileToDb(file) {
		const db = await this.db;
		const transaction = db.transaction("w-c", "readwrite");
		const objectStore = transaction.objectStore("w-c");
		const request = objectStore.put(file, file.name);
		return new Promise((resolve, reject) => {
			request.addEventListener("success", () => resolve());
			request.addEventListener("error", () =>
				reject(`Error adding ${file.name} to the database`)
			);
		});
	}

	async resolveDB() {
		const request = indexedDB.open("w-c", 1);
		request.addEventListener("upgradeneeded", () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("w-c")) {
				db.createObjectStore("w-c");
			}
		});
		request.addEventListener("success", () => {
			this.#resolveDB(request.result);
		});
		request.addEventListener("error", () => {
			this.#rejectDB("Error opening IndexedDB");
		});
	}
}

customElements.define("index-db-view", IndexDbView);
export default IndexDbView;
