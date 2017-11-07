'use strict';

const Sodium = require('sodium-native');

const message = Buffer.from('secretboxing');
const cipher = Buffer.alloc(message.length + Sodium.crypto_secretbox_MACBYTES);
const nonce = Buffer.alloc(Sodium.crypto_secretbox_NONCEBYTES);
const secretKey = Buffer.alloc(Sodium.crypto_secretbox_KEYBYTES);

Sodium.randombytes_buf(nonce)
Sodium.randombytes_buf(secretKey)

Sodium.crypto_secretbox_easy(cipher, message, nonce, secretKey);

console.log('Encrypted message:', cipher.toString('hex'));

const plainText = Buffer.alloc(cipher.length - Sodium.crypto_secretbox_MACBYTES);

const isLegit = Sodium.crypto_secretbox_open_easy(plainText, cipher, nonce, secretKey);

console.log(isLegit);
