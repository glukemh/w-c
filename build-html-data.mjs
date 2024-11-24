import fs from "fs";
import path from "path";

const outFile = "html.html-data.json";

const allFiles = getAllFiles(
	path.join(import.meta.dirname, "public", "components")
);
const htmlDataFiles = allFiles.filter((file) =>
	file.endsWith(".html-data.json")
);
const tags = tagData(htmlDataFiles);

const htmlDataFile = path.join(import.meta.dirname, outFile);
const htmlData = JSON.parse(fs.readFileSync(htmlDataFile, "utf8"));
htmlData.tags = tags;
fs.writeFileSync(htmlDataFile, JSON.stringify(htmlData, null, "\t"));
console.log("HTMl data written to " + htmlDataFile);

/** @param {string[]} files */
function tagData(files) {
	const tags = [];
	for (const file of files) {
		const htmlData = JSON.parse(fs.readFileSync(file, "utf8"));
		if ("tags" in htmlData && Array.isArray(htmlData.tags)) {
			tags.push(...htmlData.tags);
		}
	}
	return tags;
}

/**
 * @param {string} dirPath
 * @param {string[]} [arrayOfFiles] */
function getAllFiles(dirPath, arrayOfFiles = []) {
	const files = fs.readdirSync(dirPath);

	files.forEach(function (file) {
		if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
			arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
		} else {
			arrayOfFiles.push(path.join(dirPath, file));
		}
	});

	return arrayOfFiles;
}
