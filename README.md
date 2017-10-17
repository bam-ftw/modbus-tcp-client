# modbus-tcp-client

# ModbusClient

`ModbusClient` manages connection and fetches data based on provided layout
of modbus regusters and coils.

```js
const ModbusClient = require('modbus-tcp-client');

const layout = ModbusClient.ModbusLayout.fromFile('./layout.json');
const host = 'localhost';
const port = 502;

const client = new ModbusClient(host, port, layout);

client.open();

client.on('open', () => client.update());
client.on('close', () => console.log('client closed'));
client.on('update', (layout) => console.log(layout));
client.on('error', (err) => console.error(err));
```

# ModbusLayout

`ModbusLayout` class describes location and type of data stored on modbus
registers and coils.

`coils` and `discrete` arrays should consist of objects containing field
`address`. `descrete` and `holding` arrays should consist of objects containing
fields `address` and `type` (available types are listed below). If type is
omitted, `uint16` is assumed.

In addition all objects can contain `props` property which will be attached to
`ModbusCoil` and `ModbusRegister` objects created by `ModbusLayout`.

```js
const ModbusLayout = require('modbus-tcp-client').ModbusLayout;

const layout1 = ModbusLayout.fromFile('./layout.json');

const layout2 = new ModbusLayout({
  coils: [ { address: 0 }, { address: 1 } ],
  discrete: [ { address: 10000 }, { address: 10001 } ],
  input: [ { address: 30000, type: 'uint16' } ],
  holding: [ { address: 40000, type: 'uint32' } ],
});

```

Example modbus layout file:

```json
{
  "coils": [
    {
      "address": 0,
      "props": {
        "name": "Coil 1",
      }
    }, {
      "address": 1,
      "props": {
        "name": "Coil 2",
        "description": "Description of second coil",
      }
    }
  ],

  "discrete": [
    {
      "address": 10000,
      "props": {
        "name": "Discrete 1",
      }
    }, {
      "address": 10001,
    }
  ],

  "input": [
    {
      "address": 30000,
      "type": "string16",
      "props": {
        "name": "Name",
      }
    }, {
      "address": 30008,
      "type": "uint32",
      "props": {
        "name": "Age",
      }
    }
  ],

  "holding": [
    {
      "address": 40000,
      "type": "uint16",
      "props": {
        "name": "IP",
      }
    }
  ]
}

```

## Available types

Following register types are supported:

| identifier | description |
|-|-|
| int16   | 16 bit integer (2 bytes / 1 word) |
| int32   | 32 bit integer (4 bytes / 2 words) |
| int64   | 64 bit integer (8 bytes / 4 words) |
| uint16  | 16 bit unsigned integer (2 bytes / 1 word) |
| uint32  | 32 bit unsigned integer (4 bytes / 2 words) |
| uint64  | 64 bit unsigned integer (8 bytes / 4 words) |
| float   | single precision floating point number (4 bytes / 2 words) |
| double  | double precision floating point number (8 bytes / 4 words) |
| stringX | string of specified byte length, where X is the number of bytes |
