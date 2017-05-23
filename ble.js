const noble = require('noble');

const startBle = function () {
	if (noble.state === "poweredOn") {
		console.log('📡 BLE state is %s, starting scan', noble.state);
		noble.startScanning();
	} else {
		console.log('📡 BLE state is %s, waiting for power on', noble.state);
		noble.on("stateChange", function (state) {
			if (state === "poweredOn") {
				noble.startScanning();
			} else {
				noble.stopScanning();
			}
		});
	}
}

const startScan = function () {
	startBle();
	noble.on('discover', function (peripheral) {
		console.log(peripheral.advertisement.localName + ' - ADDRESS: ' + peripheral.address + ' - ID: ' + peripheral.id);
	});
}

const logOutput = function (data) {
	process.stdout.write(data.toString());
}

const subscribe = function (characteristic) {
	characteristic.removeListener('data', logOutput);
	characteristic.on('data', logOutput);
	characteristic.subscribe();
}

const connect = function (peripheral) {
	console.log('👯‍ connecting to %s', peripheral.advertisement.localName);
	peripheral.connect(function (error) {
		peripheral.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
			var characteristic = characteristics[0];
			subscribe(characteristic);
		});
	});
}

const connectTo = function (identifier, options) {
	startBle();
	console.log('👀 seaching for %s...', identifier);
	noble.on('discover', function (peripheral) {
		if (peripheral.address === identifier || peripheral.id === identifier || peripheral.advertisement.localName === identifier) {
			noble.stopScanning();
			connect(peripheral);
			peripheral.on('disconnect', function () {
				console.log('😕 connection lost');
				if (options.persistConnection) {
					console.log('🙌 retrying connection');
					connect(peripheral);
				} else {
					process.exit(0);
				}
			});
		}
	});
}

module.exports = {
	scan: function () {
		startScan()
	},
	connect: function (address, options) {
		connectTo(address, options)
	}
};