import fs from "fs";
import path from "path";

const htmlDataExt = ".html-data.json";
const outFile = "html" + htmlDataExt;
const { dirname } = import.meta;
const htmlDataFile = path.join(dirname, outFile);
const componentsFolder = path.join(dirname, "public", "components");

const htmlDataFiles = getAllFiles(componentsFolder).filter((file) =>
	file.endsWith(htmlDataExt)
);
const tags = tagData(htmlDataFiles);

const htmlData = readJsonFile(htmlDataFile);
htmlData.tags = tags;
writeJsonFile(htmlDataFile, htmlData);
console.log("HTMl data written to " + htmlDataFile);

/** @param {string[]} files */
function tagData(files) {
	const tags = [];
	for (const file of files) {
		try {
			const htmlData = readJsonFile(file);
			if ("tags" in htmlData && Array.isArray(htmlData.tags)) {
				tags.push(...htmlData.tags);
			} else {
				throw "No tags property found in " + file;
			}
		} catch (e) {
			console.error("Error occurred reading file " + file, e);
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

/** @param {string} filePath */
function readJsonFile(filePath) {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * @param {string} filePath
 * @param {unknown} data */
function writeJsonFile(filePath, data) {
	fs.writeFileSync(filePath, JSON.stringify(data, null, "\t"));
}
