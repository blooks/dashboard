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
  //Set connected to false so Meteor knows that this transfer needs to be connected to the internal nodes.
  result.connected = false;
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
    isNewTransfer = true;

  if (oldTransfer) {//Transaction already stored for this User
    transfer = oldTransfer;
    isNewTransfer = false;
  }
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
          "connected": false
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
};


/**
 * Getting all transactions for the array of addresses from the
 * Bitcoin blockchain via the Chain API
 *
 * TODO: Get all transactions instead of just 500.
 * See https://github.com/chain-engineering/chain-node/issues/9
 *
 *
 * @param addresses
 * @param wallet
 */

var updateTransactionsForAddresses = function (addresses, wallet) {
  var chain = new Chain({
    keyId: 'a3dcecd08d5ef5476956f88dace0521a',
    keySecret: '9b846d2e90118a901b9666bef6f78a2e',
    blockChain: 'bitcoin'
  });
  var syncChain = Async.wrap(chain, ['getAddressesTransactions']);
  console.log('Asking chain.com now for transactions for ' + addresses.length + ' addresses');
  var chainTxs = syncChain.getAddressesTransactions(addresses, {limit: 500});
  console.log("Got " + chainTxs.length + " transactions from chain. Start to process...");
  chainTxs.forEach(function (chainTx) {
    var newTransfer = addCoynoData(chainTxToCoynoTx(chainTx), wallet);
    addTransfer(newTransfer);
  });
};

/**
 * Creates Coynoaddresses out of strings and puts them in the Database
 * It adds addresses again if the are already in the DB.
 * TODO: The latter is a bug! See below.
 *
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
      //TODO: Correct this bug. Addresses are added even
      // if they are already in the wallet!
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

/**
 * Runs over all addresses connected to the wallet
 * and triggers a balance update.
 *
 * TODO: Check for performance issues
 * current complexity: #addresses x #transactions
 *
 * @param wallet
 */
var updateBalances = function (wallet) {
  BitcoinAddresses
    .find({$and: [{'userId': Meteor.userId()}, {'walletId': wallet._id}]})
    .forEach(function (address) {
      address.update();
    });
};

/**
 * Updates a wallet in BIP32 style
 * Assumes: wallet.type is BIP32 and the wallet.hdseed is a valid seed
 * TODO: Do not only query for the first 100 addresses but all
 * TODO: addresses that could have been used.
 *
 * @param wallet
 */
var updateBIP32Wallet = function (wallet) {
  var HDPublicKey = bitcore.HDPublicKey;
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

/**
 * TODO: updateTransactions for an Armory Wallet
 * @param wallet
 */
var updateArmoryWallet = function (wallet) {
  console.log("updateArmoryWallet says: Implement me. I am doing nothing.");
  return wallet;
};


/**
 * Gets and stores all transactions for the addresses in the
 * single Addresses Wallet to the Database. An balance Update
 * for the wallet is called in the end.
 * @param wallet
 */
var updateSingleAddressWallet = function (wallet) {
  var schemaWallet = BitcoinWallets.findOne({"_id": wallet._id});
  var addresses = [];
  schemaWallet.addresses().forEach(function (address) {
    addresses.push(address.address);
    console.log(address.address);
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
  /**
   * Updating the wallet data. Getting all transactions for
   * the addresses in the wallet and pushing them to the database.
   * Then the balances get updated.
   * TODO: In case of a HD Wallet a certain buffer
   * size of non-used addresses has to be built.
   *
   * @param wallet
   */
  updateTx4Wallet: function (wallet) {
    switch (wallet.type) {
      case 'electrum':
        updateElectrumWallet(wallet);
        break;
      case 'bitcoin-wallet' :
        updateBIP32Wallet(wallet);
        break;
      case 'single-addresses' :
        updateSingleAddressWallet(wallet);
        break;
    }
  },
  isValidBitcoinAddress: function (address) {
    return bitcore.Address.isValid(address);
  }
});
