var chain = Meteor.npmRequire('chain-node');

Meteor.methods({
	updateBitcoinTransactionsForAddress: function (bitcoinAddress) {
		chain.apiKeyId = 'a3dcecd08d5ef5476956f88dace0521a';
		chain.apiKeySecret = '9b846d2e90118a901b9666bef6f78a2e';
		syncChain = Async.wrap(chain, ['getAddress','getAddressTransactions']);
    var transactions = syncChain.getAddressTransactions(bitcoinAddress.address);
    transactions.forEach(function (transaction) {
      console.log(transaction.block_time);
      var foreignId = Meteor.userId()+transaction.hash;
      var transfer = Transfers.findOne({"foreignId": foreignId});
      if (transfer) {//Transaction already stored for this User
        var inputs = transfer.details.inputs;
        inputs.forEach(function (input) {
            if (input.note === bitcoinAddress.address) {
              input.nodeId = bitcoinAddress._id;
            }
          });
        var outputs = transfer.details.outputs;
        outputs.forEach(function (output) {
            if (output.note === bitcoinAddress.address) {
              output.nodeId = bitcoinAddress._id;
            }
          });
        try {
        Transfers.update({"_id": transfer._id},{$set : {"details.outputs": outputs, "details.inputs": inputs}});
      } catch (error) {
        console.log(error);
      }
      } else {//User has never added an address related to this transaction before
        transfer = {};
        transfer.foreignId = foreignId;
        transfer.userId = Meteor.userId();
        transfer.date = new Date(transaction.block_time);
        console.log(transfer.date);
        transfer.sourceId = bitcoinAddress.walletId;
        console.log("New TransactioN: "+transaction.hash);
        inputs = [];
        outputs = [];
        transaction.inputs.forEach(function(input) {
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
        transaction.outputs.forEach(function(output) {
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
        try  { Transfers.insert(transfer);
      } catch (error) {
        console.log(error);
      }
    }
    });
  }
});