const Reader = require("../lib/reader").Reader;

const bufferPrefix = Buffer.alloc(4, 0x00);

test('int: positive signed', () => {
	let data = Buffer.from([
		0xFE, 0xDF, 0x04,
		0xFE, 0xFF, 0x01,
		0x80, 0x80, 0x80, 0x02
	]);
	let r = new Reader(Buffer.concat([bufferPrefix, data]));

	expect(r.readSignedInt()).toBe(38911);
	expect(r.readSignedInt()).toBe(16383);
	expect(r.readSignedInt()).toBe(2097152);
});

test('int: positive unsigned', () => {
	let data = Buffer.from([
		0xFF, 0xAF, 0x02,
		0xFF, 0x7F,
		0x80, 0x80, 0x80, 0x01
	]);
	let r = new Reader(Buffer.concat([bufferPrefix, data]));

	expect(r.readUnsignedInt()).toBe(38911);
	expect(r.readUnsignedInt()).toBe(16383);
	expect(r.readUnsignedInt()).toBe(2097152);
});

test('int: negative signed', () => {
	let data = Buffer.from([
		0xFD, 0xDF, 0x04,
		0xA9, 0x91, 0x05,
		0xFF, 0xFF, 0x9F, 0x01
	]);
	let r = new Reader(Buffer.concat([bufferPrefix, data]));

	expect(r.readSignedInt()).toBe(-38911);
	expect(r.readSignedInt()).toBe(-42069);
	expect(r.readSignedInt()).toBe(-1310720);
});

test('int: negative unsigned', () => {
	let data = Buffer.from([
		0x81, 0xD0, 0xFD, 0xFF, 0x0F,
		0xAB, 0xB7, 0xFD, 0xFF, 0x0F,
		0x80, 0x80, 0xB0, 0xFF, 0x0F
	]);
	let r = new Reader(Buffer.concat([bufferPrefix, data]));

	expect(r.readUnsignedInt()).toBe(-38911);
	expect(r.readUnsignedInt()).toBe(-42069);
	expect(r.readUnsignedInt()).toBe(-1310720);
});
