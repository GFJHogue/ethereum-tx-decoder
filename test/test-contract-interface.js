'use strict';

var assert = require('assert');

var utils = require('./utils');

if (global.ethers) {
  console.log('Using global ethers; ' + __filename);
  var ethers = global.ethers;
} else {
  var ethers = require('ethers');
}

// Set this to true to compare results against Web3 coder
var testWeb3 = false;
var testEthereumLib = false;


var FORMAT_WEB3             = 'web3';
var FORMAT_ETHEREUM_LIB     = 'ethereum-lib';

var web3Coder = null;
if (testWeb3) {
    console.log('Web3 Version:', require('web3/package.json').version);
    web3Coder = require('web3/lib/solidity/coder');
}

var ethereumLibCoder = null;
if (testEthereumLib) {
    console.log('EthereumLib (abi) Version:', require('ethereumjs-abi/package.json').version);
    ethereumLibCoder = require('ethereumjs-abi');
}

function equals(a, b) {
    // Array (treat recursively)
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
    }

    if (testWeb3) {
        if (a.toJSON && a.minus) { a = utils.bigNumberify(a.toString(10)); }
        if (b.toJSON && b.minus) { b = utils.bigNumberify(b.toString(10)); }
    }

    // EthereumLib returns addresses as 160-bit big numbers
    if (testEthereumLib) {
        if (a.match && a.match(/^0x[0-9A-Fa-f]{40}$/) && b.imul) {
            a = utils.bigNumberify(a);
        }
        if (b.match && b.match(/^0x[0-9A-Fa-f]{40}$/) && a.imul) {
            b = utils.bigNumberify(a);
        }
    }

    // BigNumber
    if (a.eq) {
        if (!a.eq(b)) { return false; }
        return true;
    }

    if (testEthereumLib) {
        if (a.buffer) { a = '0x' + (new Buffer(a)).toString('hex'); }
        if (b.buffer) { b = '0x' + (new Buffer(b)).toString('hex'); }
        if (Buffer.isBuffer(a)) { a = '0x' + a.toString('hex'); }
        if (Buffer.isBuffer(b)) { b = '0x' + b.toString('hex'); }
    }

    // Uint8Array
    if (a.buffer) {
        if (!utils.isHexString(b)) { return false; }
        b = utils.arrayify(b);

        if (!b.buffer || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
        }

        return true;
    }

    if (testWeb3) {
        if (a.match && a.match(/^0x[0-9A-Fa-f]{40}$/)) { a = a.toLowerCase(); }
        if (b.match && b.match(/^0x[0-9A-Fa-f]{40}$/)) { b = b.toLowerCase(); }
    }

    // Something else
    return a === b;
}


function getValues(object, format) {
   if (Array.isArray(object)) {
       var result = [];
       object.forEach(function(object) {
           result.push(getValues(object, format));
       });
       return result;
   }

   switch (object.type) {
       case 'number':
           if (format === FORMAT_WEB3) {
                var value = utils.bigNumberify(object.value);
                value.round = function() {
                    return this;
                }
                value.lessThan = function(other) {
                    return this.lt(other);
                }
                var toString = value.toString.bind(value);
                var toHexString = value.toHexString.bind(value);
                Object.defineProperty(value, 'toString', {
                    value: function(format) {
                        if (format === 16) { return toHexString().substring(2); }
                        return toString();
                    }
                });
                return value;
           }
           return utils.bigNumberify(object.value);

       case 'boolean':
       case 'string':
           return object.value;

       case 'buffer':
           if (format === FORMAT_WEB3) {
               return object.value.toLowerCase();
           }
           return utils.arrayify(object.value);

       default:
           throw new Error('invalid type - ' + object.type);
   }
}

describe('ABI Coder Decoding', function() {
    var coder = ethers.utils.defaultAbiCoder;
    var Interface = ethers.utils.Interface;
    var FunctionDecoder = require('../src/FunctionDecoder.js');

    var tests = utils.loadTests('contract-interface');
    tests.forEach(function(test) {
        var values = getValues(JSON.parse(test.normalizedValues));
        var types = JSON.parse(test.types);
        var result = test.result;

        var title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';

        // Tweak the abi a bit to assume the test function takes the outputs as inputs.
        var abi = JSON.parse(test.interface);
        abi[0].inputs = abi[0].outputs;

        var iface = new Interface(abi);
        var sighash = iface.functions.test.sighash;
        var encoded = coder.encode(types, values);

        var fnData = sighash + encoded.substring(2);

        it(('decodes parameters - ' + test.name + ' - ' + test.types), function() {
            var fnDecoder = new FunctionDecoder(iface);

            var decoded = fnDecoder.decodeFn(fnData);
            var decodedArray = Array.prototype.slice.call(decoded);

            assert.ok(equals(values, decodedArray), 'decoded parameters - ' + title);
        });

    });
});
