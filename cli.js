#!/usr/bin/env node
const ble = require('./ble')
const program = require('commander');

program
	.command('scan')
	.description('scans for BLE devices')
	.action(function (env, options) {
		ble.scan();
	});

program
	.command('connect [address]')
	.description('connects to the given address')
	.option('-p, --persist-connection', 'reconnect to device on disconnect')
	.action(function (address, options) {
		ble.connect(address, options);
	});

program.parse(process.argv);