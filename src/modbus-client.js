const types          = require('./modbus-types');
const async          = require('async');
const jsmodbus       = require('jsmodbus');
const EventEmitter   = require('events');
const ModbusLayout   = require('./modbus-layout');
const ModbusCoil     = require('./modbus-element').ModbusCoil;
const ModbusRegister = require('./modbus-element').ModbusRegister;

module.exports = class ModbusClient extends EventEmitter {
	constructor(host, port, layout) {
		super();
		this.host = host;
		this.port = port;
		this.layout = layout;
		this.client = null;
	}

	open() {
		this.close();

		this.client = jsmodbus.client.tcp.complete({
			host             : this.host,
			port             : this.port,
			autoReconnect    : false,
			reconnectTimeout : 1000,
			timeout          : 1500,
			unitId           : 0,
			protocolVersion  : 0
		});

		this.client.connect();

		this.client.on('connect', () => {
			this.emit('open');
		});

		this.client.on('close', () => {
			this.client = null;
			this.emit('close');
		});

		this.client.on('error', (err) => {
			this.client = null;
			this.emit('error', err);
		});
	}

	close() {
		if (this.client) {
			this.client.close();
			this.client = null;
		}
	}

	update(cb) {
		cb = (typeof cb === 'function') ? cb : ()=>{};

		if (this.layout instanceof ModbusLayout !== true) {
			const err = new Error('invalid layout');
			this.emit('error', err);
			return setImmediate(cb, err);
		}

		if (this.client === null) {
			const err = new Error('client is not connected')
			this.emit('error', err);
			return setImmediate(cb, err);
		}

		async.parallel({
			coils: (callback) => this._coilReader(this.layout.ranges.coils, 'readCoils', callback),
			discrete: (callback) => this._coilReader(this.layout.ranges.discrete, 'readDiscreteInputs', callback),
			input: (callback) => this._regReader(this.layout.ranges.input, 'readInputRegisters', callback),
			holding: (callback) => this._regReader(this.layout.ranges.holding, 'readHoldingRegisters', callback)
		}, (err, buffers) => {
			if (err) {
				this.emit('error', err);
				return setImmediate(cb, err);
			}

			this._coilParser(this.layout.ranges.coils.start, buffers.coils, this.layout.coils),
			this._coilParser(this.layout.ranges.discrete.start, buffers.discrete, this.layout.discrete),
			this._registerParser(this.layout.ranges.input.start, buffers.input, this.layout.input),
			this._registerParser(this.layout.ranges.holding.start, buffers.holding, this.layout.holding)

			setImmediate(cb, null, this.layout);
			this.emit('update', this.layout);
		});
	}

	write(elem, value, cb) {
		cb = (typeof cb === 'function') ? cb : ()=>{};

		if (elem instanceof ModbusCoil) {
			this.client.writeSingleCoil(elem.address, !!value).then((resp) => {
				setImmediate(cb, null);
			}, (err) => {
				setImmediate(cb, err);
			});

		} else if (elem instanceof ModbusRegister) {
			if (Buffer.isBuffer(value) !== true) {
				value = types.getBufferFromValue(elem.type, value);
			}

			this.client.writeMultipleRegisters(elem.address, value).then((resp) => {
				setImmediate(cb, null);
			}, (err) => {
				setImmediate(cb, err);
			});
		} else {
			setImmediate(cb, new Error('invalid element type'));
		}
	}

	_coilParser(addrOffset, buffer, arr) {
		if (Buffer.isBuffer(buffer) !== true || Array.isArray(arr) !== true) {
			return {};
		}

		arr.forEach(el => {
			const idxStart = el.address - addrOffset;
			const byteIdx = Math.floor(idxStart / 8);
			const bitIdx = idxStart % 8;

			const value = (buffer.readUInt8(byteIdx) & (1 << bitIdx)) ? 1 : 0;

			el.value = value;
		});
	}

	_registerParser(addrOffset, buffer, arr) {
		if (Buffer.isBuffer(buffer) !== true || Array.isArray(arr) !== true) {
			return {};
		}

		arr.forEach(el => {
			const type = el.type;
			const idxStart = el.address - addrOffset;
			const idxStop = idxStart + types.getWordSizeFromType(type);

			const subBuffer = buffer.slice(idxStart * 2, idxStop * 2);

			el.value = types.getValueFromBuffer(type, subBuffer);
		});
	}

	_coilReader (obj, fnName, callback) {
		if (obj === null)
			return callback(null, null);

		const address = obj.start;
		const count = obj.end - address;

		this.client[fnName](address, count).then(resp => {
			callback(null, resp.payload);
		}, callback);
	}

	_regReader (obj, fnName, callback) {
		if (obj === null)
			return callback(null, null);

		const address = obj.start;
		const count = obj.end - address;

		this.client[fnName](address, count).then(resp => {
			callback(null, resp.payload);
		}, callback);
	}
};

module.exports.Types = types;
module.exports.ModbusCoil = ModbusCoil;
module.exports.ModbusRegister = ModbusRegister;
