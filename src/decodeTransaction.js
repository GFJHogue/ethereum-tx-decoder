var {bigNumberify} = require('ethers/utils/bignumber');
var RLP = require('ethers/utils/rlp');

module.exports = function decodeTx(raw_tx) {
  var decoded_tx = RLP.decode(raw_tx);

  var [
    raw_nonce,
    raw_gasPrice,
    raw_gasLimit,
    raw_to,
    raw_value,
    raw_data,
    raw_v,
    raw_r,
    raw_s
  ] = decoded_tx;

  var transaction = {
    nonce: bigNumberify(raw_nonce).toNumber(),
    gasPrice: bigNumberify(raw_gasPrice),
    gasLimit: bigNumberify(raw_gasLimit),
    to: raw_to,
    value: bigNumberify(raw_value),
    data: raw_data,
    v: bigNumberify(raw_v).toNumber(),
    r: raw_r,
    s: raw_s
  }

  if (transaction.to == '0x') delete transaction.to;

  return transaction;
}
