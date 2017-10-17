class ModbusElement {
	constructor(opts) {
		this.address = (typeof opts.address === 'number') ? opts.address : NaN;
		this.value = null;
		this.props = (typeof opts.props === 'object' && opts.props !== null) ? opts.props : {};
	}
}

class ModbusCoil extends ModbusElement {
	constructor(opts) {
		super(opts);
	}
}

class ModbusRegister extends ModbusElement {
	constructor(opts) {
		super(opts);
		this.type = opts.type || 'uint16';
	}
}

module.exports = {
	ModbusElement: ModbusElement,
	ModbusCoil: ModbusCoil,
	ModbusRegister: ModbusRegister,
}
