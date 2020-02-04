"use strict";

const { StringDecoder } = require("string_decoder");

exports.Reader = class DataReader {
	constructor(dataBuffer, offset = 4) {
		this._position = offset;
		this._buffer = dataBuffer;
	}

	get isFinished() {
		return this.position >= this._buffer.length;
	}

	get position() {
		return this._position;
	}

	set position(pos) {
		let p = parseInt(pos);
		if (isNaN(p)) {
			throw new TypeError(`Unable to convert ${pos} to integer value.`)
		}
		if (p < 0 || p > this._buffer.length) {
			throw new RangeError(`Attempted to seek to position ${p}, ` +
				`buffer length is ${this._buffer.length}.`)
		}
		this._position = p;
	}

	readBoolean() {
		return this._readNextByte() != 0;
	}

	readInt(optimizePositive) {
		return optimizePositive ? this.readUnsignedInt() : this.readSignedInt();
	}

	readSignedInt() {
		let retval = this.readUnsignedInt();
		return ((retval >>> 1) ^ -(retval & 0x01));
	}

	readUnsignedInt() {
		let b = 0;
		let retval = 0;
		let shift = 0;

		do {
			b = this._readNextByte();
			let val = b & 0x7F;
			retval |= (val << shift);
			shift += 7;
		} while ((b & 0x80) != 0);

		return retval;
	}

	readString() {
		if ((this._peekNextByte() & 0x80) == 0) {
			return this.readAsciiString();
		} else {
			return this.readUtf8String();
		}
	}

	readAsciiString() {
		let c = null;
		let charArray = [];

		do {
			c = this._readNextByte();
			charArray.push(c & 0x7F);
		} while ((c & 0x80) == 0);

		let dec = new StringDecoder("ascii");
		return dec.end(Buffer.from(charArray));
	}

	readUtf8String() {
		if (this._peekNextByte() == 128) {
			this._readNextByte();
			return null;
		}

		let retval = "";
		let strlen = this._readUtf8Length() - 1;

		for (let i = 0; i < strlen; ++i) {
			retval += this._readUtf8Character();
		}

		return retval;
	}

	_readUtf8Character() {
		let byteCount = 0;
		let byteArray = [];

		let b = this._peekNextByte();
		if ((b & 0x80) == 0) {
			byteCount = 1;
		} else if ((b & 0xE0) == 0xC0) {
			byteCount = 2;
		} else if ((b & 0xF0) == 0xE0) {
			byteCount = 3;
		} else {
			byteCount = 4;
		}

		for (let i = 0; i < byteCount; ++i) {
			byteArray.push(this._readNextByte());
		}

		let dec = new StringDecoder("UTF-8");
		return dec.end(Buffer.from(byteArray));
	}

	_readUtf8Length() {
		let b = this._readNextByte();
		let retval = b & 0x3F;

		if ((b & 0x40) == 0) {
			return retval;
		}

		let shift = 6;
		do {
			b = this._readNextByte();
			let val = b & 0x7F;
			retval |= (val << shift);
			shift += 7;
		} while ((b & 0x80) != 0);

		return retval;
	}

	_peekNextByte() {
		return this._buffer.readUInt8(this.position);
	}

	_readNextByte() {
		return this._buffer.readUInt8(this.position++);
	}
}
