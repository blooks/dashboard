var chain = Meteor.npmRequire('chain-node');
var bitcore = Meteor.npmRequire('bitcore');

var updateAddress = function (bitcoinAddress) {
  var result_transactions = [];
  chain.apiKeyId = 'a3dcecd08d5ef5476956f88dace0521a';
  chain.apiKeySecret = '9b846d2e90118a901b9666bef6f78a2e';
  syncChain = Async.wrap(chain, ['getAddress','getAddressTransactions']);

  //TODO: Is this secure? I don't think so!
  var userId = bitcoinAddress.userId;

  var transactions = syncChain.getAddressTransactions(bitcoinAddress.address, {'limit': 500});
  console.log(transactions);
  if (transactions) {
    transactions.forEach(function (transaction) {
      var foreignId = userId + transaction.hash;
      var transfer = Transfers.findOne({"foreignId": foreignId});
      if (transfer) {//Transaction already stored for this User
        var inputs = transfer.details.inputs;
        if (! inputs) {
          console.log('INTERNAL INPUTS DO NOT EXIST!');
        }
        inputs.forEach(function (input) {
          if (input.note === bitcoinAddress.address) {
            input.nodeId = bitcoinAddress._id;
          }
        });
        var outputs = transfer.details.outputs;
        if (! outputs) {
          console.log('INTERNAL OUTPUTS DO NOT EXIST!');
        }
        outputs.forEach(function (output) {
          if (output.note === bitcoinAddress.address) {
            output.nodeId = bitcoinAddress._id;
          }
        });
        try {
          Transfers.update({"_id": transfer._id}, {$set: {"details.outputs": outputs, "details.inputs": inputs}});
          result_transactions.push(Transfers.findOne({"_id": transfer._id}));
        } catch (error) {
          console.log(error);
        }
      } else {//User has never added an address related to this transaction before
        transfer = {};
        transfer.foreignId = foreignId;
        transfer.userId = userId;
        if (transaction.block_time) {
          transfer.date = new Date(transaction.block_time);
        } else {
          transfer.date = new Date(transaction.chain_received_at);
        }
        transfer.sourceId = bitcoinAddress.walletId;
        inputs = [];
        outputs = [];
        if (! transaction.inputs) {
          console.log('INPUTS DO NOT EXIST!');
        }
        transaction.inputs.forEach(function (input) {
          if (input.addresses[0] == bitcoinAddress.address) {
            inputs.push({
                  amount: input.value,
                  nodeId: bitcoinAddress._id,
                  note: input.addresses[0]
                }
            );
          } else {
            inputs.push({
              amount: input.value,
              note: input.addresses[0]
            })
          }
        });
        if (! transaction.outputs) {
          console.log('OUTPUTS DO NOT EXIST!');
        }
        transaction.outputs.forEach(function (output) {
          if (output.addresses[0] == bitcoinAddress.address) {
            outputs.push({
                  amount: output.value,
                  nodeId: bitcoinAddress._id,
                  note: output.addresses[0]
                }
            );
          } else {
            outputs.push({
              amount: output.value,
              note: output.addresses[0]
            })
          }
        });
        transfer.details = {
          inputs: inputs,
          outputs: outputs,
          currency: 'BTC'
        };
        try {
          var transferId = Transfers.insert(transfer);
          result_transactions.push(Transfers.findOne({"_id": transferId}));
        } catch (error) {
          console.log(error);
        }
      }
    });
  }
  return result_transactions;
};

var addAddressToWallet = function(address, wallet) {
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
};

var updateBIP32Wallet = function(wallet) {
  var HierarchicalKey = bitcore.HierarchicalKey;
  var Address = bitcore.Address;
  var knownMasterPublicKey = wallet.hdseed;
  var hkey = new HierarchicalKey(knownMasterPublicKey);
  for (var i = 0; i < 40; ++i) {
    addAddressToWallet(Address.fromPubKey(hkey.derive("m/0/"+ i.toString()).eckey.public).toString(), wallet);
    addAddressToWallet(Address.fromPubKey(hkey.derive("m/1/"+ i.toString()).eckey.public).toString(), wallet);
  }
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
    addAddressToWallet(Address.fromPubKey(iterator.pubkey).as('base58'), wallet);
    iterator = iterator.next();
  }
};

var updateElectrumWallet = function(wallet) {

  var Address = bitcore.Address;
  var Electrum = bitcore.Electrum;
  var mpk = new Electrum(wallet.hdseed);

  for (var i =0; i < 100; ++i) {
    var key = mpk.generatePubKey(i);
    var addr = Address.fromPubKey(key).as('base58');
    addAddressToWallet(addr, wallet);
    var changekey = mpk.generateChangePubKey(i);
    addr = Address.fromPubKey(changekey).as('base58');
    addAddressToWallet(addr, wallet);
  }
};


Meteor.methods({
	updateBitcoinTransactionsForAddress: function (bitcoinAddress) {
      updateAddress(bitcoinAddress);
  },
    updateTx4Wallet: function(wallet) {

      switch (wallet.type) {
        case 'Armory':
        updateArmoryWallet(wallet);
              break;
        case 'Electrum':
          updateElectrumWallet(wallet);
              break;
        case 'Bitcoin Wallet (Android)' :
          updateBIP32Wallet(wallet);
              break;
      }
    }
});