const fs = require("fs");

const { Reader } = require("./lib/reader");
const parser = require("./lib/parser");

function readFromFile(filename) {
	let stateFile = fs.readFileSync(filename);
	let reader = new Reader(stateFile);

	return parser.parseState(reader);
}

function readFromStateFile() {
	let userProfileDir = process.env.HOME || process.env.USERPROFILE;

	return readFromFile(userProfileDir + "/.ghh/state");
}

module.exports = {
	Reader,
	Parser: parser,
	readFromFile,
	readFromStateFile,
};
