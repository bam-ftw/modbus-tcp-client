const Int64BE = require("int64-buffer").Int64BE;
const UInt64BE = require("int64-buffer").Uint64BE;

const typeStringRE = /^string(\d+)+$/;

// sotres word count of certain types
const typeWordSizeMap = (() => {
	const map = new Map();
	map.set('int16', 1);
	map.set('uint16', 1);
	map.set('int32', 2);
	map.set('uint32', 2);
	map.set('int64', 4);
	map.set('uint64', 4);
	map.set('float', 2);
	map.set('double', 4);
	return map;
})();

const getWordSizeFromType = (type) => {
	if (typeStringRE.test(type)) {
		const matches = typeStringRE.exec(type);
		const byteCount = Number.parseInt(matches[1]);

		if (isNaN(byteCount) === false && byteCount > 0) {
			return Math.ceil(byteCount / 2);
		} else {
			return 1;
		}
	}

	return typeWordSizeMap.get(type) || 1;
}

const getValueFromBuffer = (type, buffer) => {
	if (Buffer.isBuffer(buffer) !== true) {
		throw new Error('buffer must be of type Buffer');
	}

	if (typeStringRE.test(type)) {
		return buffer.toString('utf8');
	} else if (type == 'uint16') {
		return buffer.readUInt16BE(0);
	} else if (type == 'int16') {
		return buffer.readUInt16BE(0);
	} else if (type == 'uint32') {
		return buffer.readUInt32BE(0);
	} else if (type == 'int32') {
		return buffer.readInt32BE(0);
	} else if (type == 'uint64') {
		return new UInt64BE(buffer).toNumber();
	} else if (type == 'int64') {
		return new Int64BE(buffer).toNumber();
	} else if (type == 'float') {
		return buffer.readFloatBE(0);
	} else if (type == 'double') {
		return buffer.readDoubleBE(0);
	}

	return null;
}

const getBufferFromValue = (type, value) => {
	let buffer = null;

	if (typeStringRE.test(type)) {
		const matches = typeStringRE.exec(type);
		const byteCount = Number.parseInt(matches[1]);

		buffer = Buffer.alloc(byteCount + ((byteCount % 2 == 1) ? 1 : 0));

		const valueBuffer = Buffer.from(`${value}`);

		valueBuffer.copy(buffer, 0, 0, byteCount);

	} else if (type === 'uint16') {
		value = parseInt(value);
		if (isNaN(value) === false) {
			buffer = Buffer.allocUnsafe(2);
			buffer.writeUInt16BE(value, 0);
		}
	} else if (type === 'uint32') {
		value = parseInt(value);
		if (isNaN(value) === false) {
			buffer = Buffer.allocUnsafe(4);
			buffer.writeUInt32BE(value, 0);
		}
	} else if (type === 'uint64') {
		value = parseInt(value);
		if (isNaN(value) === false) {
			buffer = UInt64BE(value).toBuffer();
		}
	} else if (type === 'int16') {
		value = parseInt(value);
		if (isNaN(value) === false) {
			buffer = Buffer.allocUnsafe(2);
			buffer.writeInt16BE(value, 0);
		}
	} else if (type === 'int32') {
		value = parseInt(value);
		if (isNaN(value) === false) {
			buffer = Buffer.allocUnsafe(4);
			buffer.writeInt32BE(value, 0);
		}
	} else if (type === 'int64') {
		value = parseInt(value);
		if (isNaN(value) === false) {
			buffer = UInt64BE(value).toBuffer();
		}
	} else if (type === 'float') {
		value = parseFloat(value);
		if (isNaN(value) === false) {
			buffer = Buffer.allocUnsafe(4);
			buffer.writeFloatBE(value, 0);
		}
	} else if (type === 'double') {
		value = parseFloat(value);
		if (isNaN(value) === false) {
			buffer = Buffer.allocUnsafe(8);
			buffer.writeDoubleBE(value, 0);
		}
	} else {
		throw new Error('invalid type');
	}

	return buffer;
}

module.exports = {
	getWordSizeFromType,
	getValueFromBuffer,
	getBufferFromValue
};
