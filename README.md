##### CAUTION: This package is untested (for now)!

# ethereum-tx-decoder
Fully decode function parameters from raw transactions!

- A lightweight utility with minimal dependencies.

- Find the exact function parameters that triggered an event.

- _[Built with ethers.js by ricmoo](https://github.com/ethers-io/ethers.js/)_, but externally agnostic.

## Usage

`npm i ethereum-tx-decoder`

### Decode raw transactions into an Object:

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

### Decode function call data into the original parameter values:

#### Using [`ethers.Contract`](https://github.com/ethers-io/ethers.js/):

```js
  // contract = new Contract(address, abi, provider)

  var fnDecoder = new txDecoder.FunctionDecoder(contract.interface);
```

#### OR the contract's `abi`:

```js
  // Internally creates an ethers.Interface object.
  var fnDecoder = new txDecoder.FunctionDecoder(abi);
```

#### Then:

```js
  fnDecoder.decodeFn(decoded_tx.data);
  //  Result {
  //    ...All function parameters indexed by both name and position...
  //  }
```

Note: `decodeFn()` returns an [`Arrayish`](https://docs.ethers.io/ethers.js/html/api-utils.html#api-arrayish).

### Shortcut for decoding a function from transaction:

```js
  fnDecoder.decodeFnFromTx(transaction.raw);
```

## BigNumber

[BigNumber Documentation (ethers.js)](https://docs.ethers.io/ethers.js/html/api-utils.html#big-numbers)
