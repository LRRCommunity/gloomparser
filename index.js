const fs = require("fs");

const { Reader } = require("./lib/reader");
const parser = require("./lib/parser");

function readFromFile(filename) {
	let stateFile = fs.readFileSync(filename);
	let reader = new Reader(stateFile);

	return parser.parseState(reader);
}

function readFromStateFile() {
	return readFromFile(process.env.USERPROFILE + "/.ghh/state");
}
