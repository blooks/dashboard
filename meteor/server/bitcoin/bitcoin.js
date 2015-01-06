var Chain = Meteor.npmRequire('chain-node');
var bitcore = Meteor.npmRequire('bitcore');
var Electrum = Meteor.npmRequire('bitcore-electrum');

var chainTxToCoynoTx = function(chainTx) {
  var result = {};
  result.foreignId = Meteor.userId() + chainTx.hash;
  if (chainTx.block_time) {
    result.date = new Date(chainTx.block_time);
  } else {
    result.date = new Date(chainTx.chain_received_at);
  }
  var inputs = [];
  var outputs = [];
  if (! chainTx.inputs) {
    console.log('INPUTS DO NOT EXIST!');
  }
  chainTx.inputs.forEach(function (input) {
    inputs.push({
      amount: input.value,
      note: input.addresses[0]
    });
  });
  if (! chainTx.outputs) {
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

var addCoynoData = function(transfer, wallet) {
  transfer.userId = Meteor.userId();
  transfer.sourceId = wallet._id;
  return transfer;
};
var connectToInternalNode = function(inoutput) {
  if (! inoutput.nodeId) {
    var internalAddress = BitcoinAddresses.findOne({$and : [{'userId': Meteor.userId()},{'address': inoutput.note}]});
    if (internalAddress) {
      inoutput.nodeId = internalAddress._id;
    }
  }
  return inoutput;
};

var addTransaction = function (transaction) {
  var transfer = Transfers.findOne({"foreignId": transaction.foreignId});
  var newTransfer = false;
  if (! transfer) {//Transaction already stored for this User
    transfer = transaction;
    newTransfer = true;
  }
  var inputs = transfer.details.inputs;
  if (! inputs) {
    console.log('INTERNAL INPUTS DO NOT EXIST!');
  }
  var newInputs = [];
  inputs.forEach(function (input) {
        newInputs.push(connectToInternalNode(input));
      }
  );
  inputs = newInputs;
  var outputs = transfer.details.outputs;
  if (! outputs) {
    console.log('INTERNAL OUTPUTS DO NOT EXIST!');
  }
  var newOutputs = [];
  outputs.forEach(function (output) {
    newOutputs.push(connectToInternalNode(output));
  });
  outputs = newOutputs;
  if (newTransfer) {
    try {
      Transfers.insert(transfer);
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
    Transfers.update({"_id": transfer._id}, {$set: {"details.outputs": outputs, "details.inputs": inputs}});
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
  var chainTxs = syncChain.getAddressesTransactions(addresses, {limit : 500});
  console.log('Asked chain.com for tx for ' + addresses.length + " addresses. Got " + chainTxs.length + " transactions.");
  chainTxs.forEach(function(chainTx) {
    addTransaction(addCoynoData(chainTxToCoynoTx(chainTx),wallet));
  });
};
/**
 * Creates Coynoaddresses out of strings and puts them in the Database
 * @param {[String]} addresses array of strings giving addresses
 * @param {BitcoinWallets} wallet the wallet these addresses belong to
 */
var addAddressesToWallet = function(addresses, wallet) {
  addresses.forEach(function(address) {
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


var addAddressToWallet = function(address, wallet) {
  addAddressesToWallet([address],wallet);
};

var updateBIP32Wallet = function(wallet) {
  var HDPublicKey = bitcore.HDPublicKey;
  var PublicKey = bitcore.PublicKey;
  var Address = bitcore.Address;
  var knownMasterPublicKey = wallet.hdseed;
  var masterPubKey = new HDPublicKey(knownMasterPublicKey);
  var addresses = [];
  for (var i = 0; i < 100; ++i) {
    addresses.push(Address.fromPublicKey(masterPubKey.derive("m/0/"+ i.toString()).publicKey).toString());
    addresses.push(Address.fromPublicKey(masterPubKey.derive("m/1/"+ i.toString()).publicKey).toString());
  }
  addAddressesToWallet(addresses,wallet);
  updateBalances(wallet);
};

var updateArmoryWallet = function(wallet) {
  var Armory = bitcore.Armory;
  var Address = bitcore.Address;
  var seed = wallet.hdseed;
  var linedSeed = [];
  for (var i = 0; i < 4; ++i) {
    linedSeed.push(seed.substring(0,44));
    seed = seed.substring(45,seed.length);
  }
  console.log(linedSeed);
  var iterator = Armory.fromSeed(linedSeed.join('\n'));
  for (var i = 0; i < 10; ++i) {
    addAddressToWallet(Address.fromPublicKey(iterator.pubkey).as('base58'), wallet);
    iterator = iterator.next();
  }
};

var updateBalances = function (wallet) {
  BitcoinAddresses.find({$and : [{'userId': Meteor.userId()},{'walletId': wallet._id}]}).forEach(function(address){
    address.update();
  });
};

var updateSingleAddressWallet = function(wallet) {
  var schemaWallet = BitcoinWallets.findOne({"_id": wallet._id});
  var addresses = [];
  schemaWallet.addresses().forEach(function(address) {
    addresses.push(address.address);
  });
  addAddressesToWallet(addresses,wallet);
  updateBalances(wallet);
};

/**
 * This function will generate all nonzero addresses and update the database with the
 * corresponding transactions
 * In the end   it will trigger a balance update for the wallet.
 * @param wallet Requires a wallet from our database
 */
var updateElectrumWallet = function(wallet) {
  var Address = bitcore.Address;
  var PublicKey = bitcore.PublicKey;
  var mpk = new Electrum(wallet.hdseed);
  var addresses = [];
  for (var i =0; i < 100; ++i) {
    var key = mpk.generatePubKey(i);
    var addr = Address.fromPublicKey(new PublicKey(key)).toString();
    addresses.push(addr);
    var changekey = mpk.generateChangePubKey(i);
    var changeAddr = Address.fromPublicKey(new PublicKey(changekey)).toString();
    addresses.push(changeAddr);
  }
  addAddressesToWallet(addresses,wallet);
  updateBalances(wallet);
};


Meteor.methods({
  updateTx4Wallet: function(wallet) {
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