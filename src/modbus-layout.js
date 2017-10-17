const fs             = require('fs');
const types          = require('./modbus-types');
const ModbusCoil     = require('./modbus-element').ModbusCoil;
const ModbusRegister = require('./modbus-element').ModbusRegister;

const calcAddressRange = (arr) => {
	let start = NaN;
	let end = NaN;

	for (let o of arr) {
		if (typeof o.address === 'number') {
			const typeSize = types.getWordSizeFromType(o.type);
			const s = o.address;
			const e = s + typeSize;

			if (isNaN(start) || s < start)
				start = s;

			if (isNaN(end) || e > end)
				end = e;
		}
	}

	return (isNaN(start) || isNaN(end)) ? null : { start, end };
}

class ModbusLayout {
	constructor (layout) {
		if (layout === null || typeof layout !== 'object') {
			throw new Error('layout must be an object');
		}

		this.coils = this._mapCoils(layout.coils);
		this.discrete = this._mapCoils(layout.discrete);
		this.input = this._mapRegisters(layout.input);
		this.holding = this._mapRegisters(layout.holding);

		this.ranges = {
			coils: calcAddressRange(this.coils),
			discrete: calcAddressRange(this.discrete),
			input: calcAddressRange(this.input),
			holding: calcAddressRange(this.holding),
		};
	}

	_mapCoils(arr) {
		return Array.isArray(arr) ? arr.map(el => new ModbusCoil(el)) : [];
	}

	_mapRegisters(arr) {
		return Array.isArray(arr) ? arr.map(el => new ModbusRegister(el)) : [];
	}
}

ModbusLayout.fromFile = (path) => {
	try {
		const fileContents = fs.readFileSync(path);
		return new ModbusLayout(JSON.parse(fileContents));
	} catch (err) {
		console.error(err);
		return null;
	}
}

module.exports = ModbusLayout;
