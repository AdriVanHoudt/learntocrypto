'use strict';

// bank.js
var jsonStream = require('duplex-json-stream')
var net = require('net')
const Fs = require('fs');
const Path = require('path');
const Sodium = require('sodium-native');

const logPath = Path.resolve(__dirname, 'log.json');
const keyPairPath = Path.resolve(__dirname, 'keyPair.json');

const genesisHash = Buffer.alloc(32).toString('hex');
const keyPair = getKeyPair();
const memLog = verifyAndReturnLog();

var server = net.createServer(function (socket) {
  socket = jsonStream(socket)

  socket.on('data', function (msg) {
    console.log('Bank received:', msg)

    switch (msg.cmd) {
      case 'balance':
         
        msg.balance = calculateBalance();
      
        return socket.write(msg);
        break;
      case 'deposit': 
        
        return addTransaction(msg);
        break;
      case 'withdraw':
        msg.amount = Math.abs(msg.amount);

        if (!msg.amount || (calculateBalance() - msg.amount <= 0)) {
          return socket.write({ error: 'Needs more schmeckels' });
        }

        addTransaction({ cmd: msg.cmd, amount: msg.amount });
        return socket.write({ cmd: msg.cmd, amount: calculateBalance() })
        break;
      default:
        break;
    }
  })
})

server.listen(3876)

function calculateBalance() {

  return memLog.reduce((total, l) => {
    
    if (l.value.cmd === 'withdraw') {
      return total -= l.value.amount;
    }

    return total += l.value.amount
  }, 0);
}

function addTransaction(log) {

  const prevHash = memLog.length > 0 ? memLog[memLog.length -1].hash : genesisHash;
  const entry = {
    value: log,
    hash: hashToHex(prevHash + JSON.stringify(log)),
    signature: signHex(JSON.stringify(log))
  }

  memLog.push(entry);
  return Fs.writeFileSync(logPath, JSON.stringify(memLog, null, 2), 'utf8');
}

function verifyAndReturnLog() {

  const log = require(logPath);

  if (log.length === 0) {
    return log;
  }

  const lastHash = log[log.length - 1].hash;

  // Re-calc the hash chain to check for tampering
  log.reduce(function (prevHash, l) {
    
    const calculatedHash = hashToHex(prevHash + JSON.stringify(l.value));
    if (calculatedHash !== l.hash) {
      throw new Error('Tampering with hashes going on!');
    }

    const calculatedSignature = signHex(JSON.stringify(l.value));
    if (calculatedSignature !== l.signature) {
      throw new Error('Tamparing with signatures going on!');
    }

    return l.hash;
  }, genesisHash);

  return log;
}

function getKeyPair() {
  
  let keyPair;
  
  try {
    keyPair = require(keyPairPath);
  } catch (error) {
    keyPair = generateAndStoreKeyPair();
  }

  keyPair.publicKey = Buffer.from(keyPair.publicKey);
  keyPair.secretKey = Buffer.from(keyPair.secretKey);

  return keyPair;
}

function generateAndStoreKeyPair() {
  
  const publicKey = Buffer.alloc(Sodium.crypto_sign_PUBLICKEYBYTES);
  const secretKey = Buffer.alloc(Sodium.crypto_sign_SECRETKEYBYTES);
  
  Sodium.crypto_sign_keypair(publicKey, secretKey);
  
  const keyPair = { 
    publicKey: publicKey.toString('hex'),
    secretKey: secretKey.toString('hex') 
  };

  Fs.writeFileSync(keyPairPath, JSON.stringify(keyPair, null, 2), 'utf8');

  return keyPair;
}

function hashToHex(input) {
  
  const outBuf = Buffer.alloc(Sodium.crypto_generichash_BYTES);
  Sodium.crypto_generichash(outBuf, Buffer.from(input));
  
  return outBuf.toString('hex');
}

function signHex(input) {

  const signature = Buffer.alloc(Sodium.crypto_sign_BYTES);
  Sodium.crypto_sign_detached(signature, Buffer.from(input), keyPair.secretKey);
  
  return signature.toString('hex');
}