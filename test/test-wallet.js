'use strict';

var assert = require('assert');
var utils = require('./utils');

if (global.ethers) {
  console.log('Using global ethers; ' + __filename);
  var ethers = global.ethers;
} else {
  var ethers = require('ethers');
}

describe('Test Transaction Parsing', function() {
    var decodeTx = require('../src/decodeTransaction.js');
    var Wallet = ethers.Wallet;

    var getAddress = ethers.utils.getAddress;

    var tests = utils.loadTests('transactions');
    tests.forEach(function(test) {
        it(('parses and signs transaction - ' + test.name), function() {
            var wallet = new Wallet(test.privateKey);

            var transaction = {};

            var parsedTransaction = decodeTx(test.signedTransaction);

            ['nonce', 'gasLimit', 'gasPrice', 'to', 'value', 'data'].forEach(function(key) {
                var expected = test[key];

                var value = parsedTransaction[key];

                if ({ gasLimit: 1, gasPrice: 1, value: 1 }[key]) {
                    assert.ok((ethers.utils.BigNumber.isBigNumber(value)),
                        'parsed into a big number - ' + key);
                    value = value.toHexString();

                    if (!expected || expected === '0x' || expected === '0x00') { expected = '0x0'; }

                } else if (key === 'nonce') {
                    assert.equal(typeof(value), 'number',
                        'parse into a number - nonce');

                    value = utils.hexlify(value);

                    if (!expected || expected === '0x') { expected = '0x00'; }

                } else if (key === 'data') {
                    if (!expected) { expected = '0x'; }

                } else if (key === 'to') {
                    if (value) {
                        // Make sure teh address is valid
                        getAddress(value);
                        value = value.toLowerCase();
                    }
                }

                assert.equal(value, expected, 'parsed ' + key);

                transaction[key] = test[key];
            });

            /*assert.equal(parsedTransaction.from, getAddress(test.accountAddress),
                'computed from');*/

            /*assert.equal(parsedTransaction.chainId, 0, 'parsed chainId');*/

            /*var signedTransaction = wallet.sign(transaction);
            assert.equal(signedTransaction, test.signedTransaction,
                'signed transaction');*/

            // EIP155

            var parsedTransactionChainId5 = decodeTx(test.signedTransactionChainId5);
            ['data', 'from', 'nonce', 'to'].forEach(function (key) {
                assert.equal(parsedTransaction[key], parsedTransactionChainId5[key],
                    'eip155 parsed ' + key);
            });
            ['gasLimit', 'gasPrice', 'value'].forEach(function (key) {
                assert.ok(parsedTransaction[key].eq(parsedTransactionChainId5[key]),
                    'eip155 parsed ' + key);
            });
            /*assert.equal(parsedTransactionChainId5.chainId, 5,
                'eip155 parsed chainId');*/

            /*transaction.chainId = 5;
            var signedTransactionChainId5 = wallet.sign(transaction);
            assert.equal(signedTransactionChainId5, test.signedTransactionChainId5,
                'eip155 signed transaction');*/
        });
    });
});
