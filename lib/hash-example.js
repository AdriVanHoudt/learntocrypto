'use strict';

const Sodium = require('sodium-native');

const outBuf = Buffer.alloc(Sodium.crypto_generichash_BYTES);
Sodium.crypto_generichash(outBuf, Buffer.from('Hello, World!'))

console.log(outBuf.toString('hex'));