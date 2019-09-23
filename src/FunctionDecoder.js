var {defaultAbiCoder} = require('ethers/utils/abi-coder');
var {Interface} = require('ethers/utils/interface');
var decodeTx = require('./decodeTransaction.js');

module.exports = function FunctionDecoder(iface) {
  if (!(this instanceof FunctionDecoder)) { throw new Error('missing new'); }

  if (!(Interface.isInterface(iface))) { iface = new Interface(iface); }

  var functions = {};

  for (var fnName in iface.functions) {
    var fnInfo = iface.functions[fnName];
    functions[fnInfo.sighash] = fnName;
  };

  this.decodeFn = function(data) {
    var sighash = data.substring(0, 10);
    var raw_params = '0x'+data.substring(10);

    var fnName = functions[sighash];
    var fnInfo = iface.functions[fnName];

    var result = defaultAbiCoder.decode(
      fnInfo.inputs,
      raw_params
    );

    result.signature = fnInfo.signature;
    result.sighash = fnInfo.sighash;

    return result;
  }

  this.decodeFnFromTx = function(raw_tx) {
    var decodedTx = decodeTx(raw_tx);
    return this.decodeFn(decodedTx.data);
  }
}
