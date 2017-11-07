#!/usr/bin/env node
'use strict';

// teller.js
var jsonStream = require('duplex-json-stream')
var net = require('net')
const argv = require('yargs').argv

const command = argv._[0];

var client = jsonStream(net.connect(3876))

client.on('data', function (msg) {
  console.log('Teller received:', msg)
})

switch (command) {
  case 'balance':

    client.end({ cmd: command });
    break;
  case 'deposit':

    client.end({ cmd: command, amount: argv._[1] });
    break;
  case 'withdraw':

    client.end({ cmd: command, amount: argv._[1] });
    break;
  default:
    throw new Error(`Unknown command: ${command}`)
    break;
}

// client.end can be used to send a request and close the socket
