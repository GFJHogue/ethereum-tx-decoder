# ethereum-tx-decoder/test

[![Build Status](https://travis-ci.org/GFJHogue/ethereum-tx-decoder.svg?branch=master)](https://travis-ci.org/GFJHogue/ethereum-tx-decoder)

Test generation taken from `ethers.js`.

- `decodeTx()` is tested (`decodeTransaction.js`).
  * Using tests replicated from `ethers.Wallet` for `Wallet.parseTransaction()`

- `FunctionDecoder` is tested (`FunctionDecoder.js`).
  * Using tests derived from `ethers.Interface` for `Interface.decodeParams()`
