# ethereum-tx-decoder

[![npm version](https://badge.fury.io/js/ethereum-tx-decoder.svg)](https://badge.fury.io/js/ethereum-tx-decoder)[![Build Status](https://travis-ci.org/GFJHogue/ethereum-tx-decoder.svg?branch=master)](https://travis-ci.org/GFJHogue/ethereum-tx-decoder)

Lightweight utility for decoding function parameters from Ethereum transactions.

- Minimal dependencies.

- Find the exact function parameters that triggered an event.

- _[Built with ethers.js by ricmoo](https://github.com/ethers-io/ethers.js/)_.

## Usage

`npm i ethereum-tx-decoder`

### `decodeTx()`

Decode raw transactions into an Object.

```js
  var txDecoder = require('ethereum-tx-decoder');

  // transaction.raw = '0x...'
  var decodedTx = txDecoder.decodeTx(transaction.raw);
  //  {
  //    nonce:    Number
  //    gasPrice: BigNumber
  //    gasLimit: BigNumber
  //    to:       string (hex)
  //    value:    BigNumber
  //    data:     string (hex)
  //    v:        Number
  //    r:        string (hex)
  //    s:        string (hex)
  //  }
```

Need to know `from` or `chainId`? Use [`ethers.Wallet.parseTransaction()`](https://docs.ethers.io/ethers.js/html/api-wallet.html#parsing-transactions) instead.

### `class FunctionDecoder`

Decode function call data into the original parameter values.

#### New instance with [`ethers.Contract`](https://github.com/ethers-io/ethers.js/):

```js
  // contract = new Contract(address, abi, provider)
  var fnDecoder = new txDecoder.FunctionDecoder(contract.interface);
```

#### New instance with contract `abi`:

```js
  // Internally creates an ethers.Interface object.
  var fnDecoder = new txDecoder.FunctionDecoder(abi);
```

#### `decodeFn()`

```js
  fnDecoder.decodeFn(decodedTx.data);
  //  Result {
  //    ...All function parameters indexed by both name and position...
  //  }
```

Note: `decodeFn()` returns an [`Arrayish`](https://docs.ethers.io/ethers.js/html/api-utils.html#api-arrayish).

### `decodeFnFromTx()`

Shortcut for decoding a function from transaction.

```js
  fnDecoder.decodeFnFromTx(transaction.raw);
```

## BigNumber

[BigNumber Documentation (ethers.js)](https://docs.ethers.io/ethers.js/html/api-utils.html#big-numbers)
