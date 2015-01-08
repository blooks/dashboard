'use strict';

var Chain = Meteor.npmRequire('chain-node');
var bitcore = Meteor.npmRequire('bitcore');
var Electrum = Meteor.npmRequire('bitcore-electrum');

/**
 * Generating a Coyno style transaction out of a Chain TX
 * See https://chain.com/docs#object-bitcoin-transaction for Chain
 * Transactions Format
 *
 * TODO: Breaks for OP_Return outputs, needs to be fixed.
 *
 * It returns an object with
 *  foreignId
 *  date
 *  details
 *  currency = 'BTC'
 *
 * The return object lacks:
 *  UserId
 *  sourceId
 *  baseVolume
 *
 * @param chainTx
 * @returns {transfer} a transfer that can be put in the database
 */

var chainTxToCoynoTx = function (chainTx) {
  var result = {}, inputs = [], outputs = [];
  result.foreignId = Meteor.userId() + chainTx.hash;
  /* jshint camelcase: false */
  if (chainTx.block_time) {
    result.date = new Date(chainTx.block_time);
  } else {
    result.date = new Date(chainTx.chain_received_at);
  }
  /* jshint camelcase: true */
  if (!chainTx.inputs) { console.log('INPUTS DO NOT EXIST!'); }
  chainTx.inputs.forEach(function (input) {
    inputs.push({
      amount: input.value,
      note: input.addresses[0]
    });
  });
  if (!chainTx.outputs) {
    console.log('OUTPUTS DO NOT EXIST!');
  }
  chainTx.outputs.forEach(function (output) {
    outputs.push({
      amount: output.value,
      note: output.addresses[0]
    });
  });
  result.details = {
    inputs: inputs,
    outputs: outputs,
    currency: 'BTC'
  };
  return result;
};

/**
 * Adding additional data to the transfer object.
 * More specifically
 *  userId
 *  sourceId --> from the wallet provided
 *
 * @param transfer
 * @param wallet
 * @returns {} with added UserId and SourceId
 */
var addCoynoData = function (transfer, wallet) {
  transfer.userId = Meteor.userId();
  transfer.sourceId = wallet._id;
  return transfer;
};

/**
 * If the output address is not connected to a Coyno
 * Address for this user, this function will look up
 * whether one of the users wallets contain the address
 * and if so connect the output to it
 * @param inoutput
 * @returns {} now connected to the Coyno Database Object
 * if there is one for this address and this user
 */
var connectToInternalNode = function (inoutput) {
  if (!inoutput.nodeId) {
    var internalAddress = BitcoinAddresses.findOne(
      {$and: [{'userId': Meteor.userId()}, {'address': inoutput.note}]});
    if (internalAddress) {
      inoutput.nodeId = internalAddress._id;
    }
  }
  return inoutput;
};

/**
 * Tries to add a transfer to the database or update the transfer if it
 * has already been there (e.g. the user already added the other side of the
 * transfer as an address in one of his wallets). Will log to the console
 * if the Database push fails.
 *
 *
 * @param transfer
 */
var addTransfer = function (transfer) {
  var oldTransfer = Transfers.findOne({"foreignId": transfer.foreignId}),
    isNewTransfer = true,
    inputs = transfer.details.inputs,
    newInputs = [],
    outputs = transfer.details.outputs,
    newOutputs = [];

  if (oldTransfer) {//Transaction already stored for this User
    transfer = oldTransfer;
    isNewTransfer = false;
  }

  inputs.forEach(function (input) {
    newInputs.push(connectToInternalNode(input));
  });
  //connected inputs have been built, need to be stored
  inputs = newInputs;

  outputs.forEach(function (output) {
    newOutputs.push(connectToInternalNode(output));
  });
  //connected outputs have been built, need to be stored
  outputs = newOutputs;

  if (isNewTransfer) {
    try {
      Transfers.insert(transfer);
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      Transfers.update({"_id": transfer._id}, {
        $set: {
          "details.outputs": outputs,
          "details.inputs": inputs
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
};

var updateTransactionsForAddresses = function (addresses, wallet) {
  var chain = new Chain({
    keyId: 'a3dcecd08d5ef5476956f88dace0521a',
    keySecret: '9b846d2e90118a901b9666bef6f78a2e',
    blockChain: 'bitcoin'
  });
  var syncChain = Async.wrap(chain, ['getAddressesTransactions']);
  var chainTxs = syncChain.getAddressesTransactions(addresses, {limit: 500});
  console.log('Asked chain.com for tx for ' + addresses.length +
  " addresses. Got " + chainTxs.length + " transactions.");
  chainTxs.forEach(function (chainTx) {
    addTransfer(addCoynoData(chainTxToCoynoTx(chainTx), wallet));
  });
};
/**
 * Creates Coynoaddresses out of strings and puts them in the Database
 * @param {[String]} addresses array of strings giving addresses
 * @param {BitcoinWallets} wallet the wallet these addresses belong to
 */
var addAddressesToWallet = function (addresses, wallet) {
  addresses.forEach(function (address) {
    var coynoAddress = {
      userId: Meteor.userId(),
      walletId: wallet._id,
      address: address
    };
    try {
      BitcoinAddresses.insert(coynoAddress);
    } catch (e) {
      console.log(e);
      //console.log(transfer);
    }
  });
  if (addresses.length > 0) {
    updateTransactionsForAddresses(addresses, wallet);
  }
};

var updateBalances = function (wallet) {
  BitcoinAddresses
    .find({$and: [{'userId': Meteor.userId()}, {'walletId': wallet._id}]})
    .forEach(function (address) {
      address.update();
    });
};

var addAddressToWallet = function (address, wallet) {
  addAddressesToWallet([address], wallet);
};

var updateBIP32Wallet = function (wallet) {
  var HDPublicKey = bitcore.HDPublicKey;
  //var PublicKey = bitcore.PublicKey;
  var Address = bitcore.Address,
    knownMasterPublicKey = wallet.hdseed,
    masterPubKey = new HDPublicKey(knownMasterPublicKey),
    addresses = [];
  for (var i = 0; i < 100; ++i) {
    addresses.push(
      Address.fromPublicKey(
        masterPubKey.derive("m/0/" + i.toString()).publicKey
      ).toString());
    addresses.push(
      Address.fromPublicKey(
        masterPubKey.derive("m/1/" + i.toString()).publicKey
      ).toString());
  }
  addAddressesToWallet(addresses, wallet);
  updateBalances(wallet);
};

var updateArmoryWallet = function (wallet) {
  var Armory = bitcore.Armory;
  var Address = bitcore.Address;
  var seed = wallet.hdseed;
  var linedSeed = [];
  for (var i = 0; i < 4; ++i) {
    linedSeed.push(seed.substring(0, 44));
    seed = seed.substring(45, seed.length);
  }
  console.log(linedSeed);
  var iterator = Armory.fromSeed(linedSeed.join('\n'));
  for (i = 0; i < 10; ++i) {
    addAddressToWallet(
      Address.fromPublicKey(iterator.pubkey).as('base58'), wallet);
    iterator = iterator.next();
  }
};

var updateSingleAddressWallet = function (wallet) {
  var schemaWallet = BitcoinWallets.findOne({"_id": wallet._id});
  var addresses = [];
  schemaWallet.addresses().forEach(function (address) {
    addresses.push(address.address);
  });
  addAddressesToWallet(addresses, wallet);
  updateBalances(wallet);
};

/**
 * This function will generate all nonzero addresses and update the database
 * with the corresponding transactions
 * In the end   it will trigger a balance update for the wallet.
 * @param wallet Requires a wallet from our database
 */
var updateElectrumWallet = function (wallet) {
  var Address = bitcore.Address;
  var PublicKey = bitcore.PublicKey;
  var mpk = new Electrum(wallet.hdseed);
  var addresses = [];
  for (var i = 0; i < 100; ++i) {
    var key = mpk.generatePubKey(i);
    var addr = Address.fromPublicKey(new PublicKey(key)).toString();
    addresses.push(addr);
    var changekey = mpk.generateChangePubKey(i);
    var changeAddr = Address.fromPublicKey(new PublicKey(changekey)).toString();
    addresses.push(changeAddr);
  }
  addAddressesToWallet(addresses, wallet);
  updateBalances(wallet);
};

Meteor.methods({
  updateTx4Wallet: function (wallet) {
    switch (wallet.type) {
      case 'Armory':
        updateArmoryWallet(wallet);
        break;
      case 'Electrum':
        updateElectrumWallet(wallet);
        break;
      case 'BIP32' :
        updateBIP32Wallet(wallet);
        break;
      case 'Single Addresses' :
        updateSingleAddressWallet(wallet);
        break;
    }
  },
  isValidBitcoinAddress: function (address) {
    return bitcore.Address.isValid(address);
  }
});
