const expect = require('chai').expect;
const ModbusLayout = require('../src/modbus-client').ModbusLayout;

describe('ModbusLayout', () => {
	it('should crash on non existent file', () => {
		expect(() => {
			ModbusLayout.fromFile('./no-file.json');
		}).to.throw(Error);
	});
});
