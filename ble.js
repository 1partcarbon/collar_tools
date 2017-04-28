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
		console.log(peripheral.advertisement.localName + ' - ' + peripheral.address);
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
	console.log('👯‍ connecting to %s', peripheral.address);
	peripheral.connect(function (error) {
		peripheral.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
			var characteristic = characteristics[0];
			subscribe(characteristic);
		});
	});
}

const connectTo = function (address, options) {
	startBle();
	console.log('👀 seaching for %s...', address);
	noble.on('discover', function (peripheral) {
		if (peripheral.address === address) {
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