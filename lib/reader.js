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
		while ((b & 0x80) != 0) {
			b = this.buffer[this.position++];
			result |= (b & 0x7F) << (7 * i++);
		}
		
		return optimizePositive ? result : ((result >>> 1) ^  - (result & 1));
	}

	readBoolean() {
		return this.buffer[this.position++] != 0;
	}

	readString() {
		var b = this.buffer[this.position++];
		
		if ((b & 0x80) == 0) {
			this.position--;
			return this.readAscii(); // ASCII.
		}
		
		// Null, empty, or UTF8.
		var charCount = this.readUtf8Length(b);
		switch (charCount) {
		case 0:
			return null;
		case 1:
			return "";
		}
		charCount--;
		return this.readUtf8(charCount);
	}

	readUtf8Length(b) {
		var result = b & 0x3F; // Mask all but first 6 bits.

		// bit 8 is the utf marker
		// bit 7 is the length marker *for the first byte*
		// then it's bit 8 again

		// just short circuit if there's no continuation
		if ((b & 0x40) == 0) {
			return result;
		}

		b = this.buffer[this.position++];
		result |= (b & 0x7F) << 6;

		var i = 1;
		while ((b & 0x80) != 0) {
			b = this.buffer[this.position++];
			result |= (b & 0x7F) << (6 + (7 * i++));
		}
				
		return result;
	}

	readUtf8(charCount) {
		let decoder = new StringDecoder("utf8");
		var result = "";

		while (result.length < charCount) {
			result += decoder.write(this.buffer.slice(this.position++, this.position));
		}

		result += decoder.end();
		return result;
	}

	readAscii() {
		var chars = [];
		var c;
		
		while ((this.buffer[this.position] & 0x80) == 0) {
			c = this.buffer[this.position++];
			chars.push(c);
		}
		
		chars.push(this.buffer[this.position++] & 0x7F);
		
		return new TextDecoder().decode(Buffer.from(chars));
	}
}

exports.Reader = Reader;
