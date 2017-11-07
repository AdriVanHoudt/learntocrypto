'use strict';

const Sodium = require('sodium-native');

const publicKey = Buffer.alloc(Sodium.crypto_sign_PUBLICKEYBYTES);
const secretKey = Buffer.alloc(Sodium.crypto_sign_SECRETKEYBYTES);

Sodium.crypto_sign_keypair(publicKey, secretKey);

const signature = Buffer.alloc(Sodium.crypto_sign_BYTES);
Sodium.crypto_sign_detached(signature, Buffer.from('Hellow world'), secretKey);

console.log(signature.toString('hex'));

const legit = Sodium.crypto_sign_verify_detached(signature, Buffer.from('Hellow world'), publicKey);
console.log(legit);