const { StringDecoder } = require("string_decoder");

class Reader {
	constructor(buf) {
		this.position = 4;
		this.buffer = buf;
	}

	readInt(optimizePositive) {
		var b = this.buffer[this.position++];
		var result = b & 0x7F;

		var i = 1;
		while ((b & 0x80) != 0 && this.position < this.buffer.length) {
			b = this.buffer[this.position++];
			result |= (b & 0x7F) << (7 * i++);
		}

		return optimizePositive ? result : ((result >>> 1) ^  - (result & 1));
	}

	readBoolean() {
		return this.buffer[this.position++] != 0;
	}

	readString() {
		var peek = this.buffer[this.position];

		if ((peek & 0x80) == 0) {
			return this.readAsciiString();
		} else {
			return this.readUtf8String();
		}
	}

	readUtf8String() {
		var charCount = this.readUtf8Length();
		// length == 0 is a special code for "null"
		if (charCount == 0) {
			return null;
		} else {
			return this.readUtf8(charCount - 1);
		}
	}

	readUtf8Length() {
		// bit 8 is the utf marker
		// bit 7 is the length marker *for the first byte*
		// then it's bit 8 again

		var b = this.buffer[this.position++];
		var result = b & 0x3F; // Mask all but first 6 bits.
		var cont = b & 0x40;

		var i = 0;
		while (cont != 0 && this.position < this.buffer.length) {
			b = this.buffer[this.position++];
			result |= (b & 0x7F) << (6 + (7 * i++));
			cont = b & 0x80;
		}

		return result;
	}

	readUtf8(charCount) {
		let decoder = new StringDecoder("utf8");
		var result = "";

		while (result.length < charCount && this.position < this.buffer.length) {
			result += decoder.write(this.buffer.slice(this.position, this.position+1));
			this.position++;
		}

		result += decoder.end();
		return result;
	}

	readAsciiString() {
		// read characters until we find one with the high bit set
		// this marks the end of the string
		var chars = [];
		var c;

		while ((this.buffer[this.position] & 0x80) == 0 && this.position < this.buffer.length) {
			c = this.buffer[this.position++];
			chars.push(c);
		}

		chars.push(this.buffer[this.position++] & 0x7F);

		return new TextDecoder().decode(Buffer.from(chars));
	}
}

exports.Reader = Reader;
