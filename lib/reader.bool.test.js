const Reader = require("./reader").Reader;

const bufferPrefix = Buffer.alloc(4, 0x00);

test('boolean: 0 is false', () => {
	let data = Buffer.from([0x00]);
	let r = new Reader(Buffer.concat([bufferPrefix, data]));

	expect(r.readBoolean()).toBe(false);
});

test('boolean: 1 is true', () => {
	let data = Buffer.from([0x01]);
	let r = new Reader(Buffer.concat([bufferPrefix, data]));

	expect(r.readBoolean()).toBe(true);
});

test('boolean: other nonzero is true', () => {
	let data = Buffer.from([0x02, 0xFF]);
	let r = new Reader(Buffer.concat([bufferPrefix, data]));

	expect(r.readBoolean()).toBe(true);
	expect(r.readBoolean()).toBe(true);
});

test('boolean: reading past end throws error', () => {
	let r = new Reader(bufferPrefix);

	expect(() => { r.readBoolean(); }).toThrow(RangeError);
});
