var chain = Meteor.npmRequire('chain-node');

Meteor.methods({
	updateBitcoinTransactionsForAddress: function (bitcoinAddress) {
		chain.apiKeyId = 'a3dcecd08d5ef5476956f88dace0521a';
		chain.apiKeySecret = '9b846d2e90118a901b9666bef6f78a2e';
		syncChain = Async.wrap(chain, ['getAddress','getAddressTransactions']);
    var transactions = syncChain.getAddressTransactions(bitcoinAddress.address);
    console.log(transactions);
    transactions.forEach(function(transaction)
      {
      console.log(transaction.inputs);
      console.log(transaction.outputs);
      }
    );
    transactions.forEach(function (transaction) {
      var foreignId = Meteor.userId()+transaction.hash;
      var transfer = Transfers.findOne({"foreignId": foreignId});
      if (transfer) {//Transaction already stored for this User
        var inputs = transfer.details.inputs;
        inputs.forEach(function (input) {
            if (input.note === bitcoinAddress.address) {
              input.nodeId = bitcoinAddress._id;
            }
          }
        var outputs = transfer.details.outputs;
        outputs.forEach(function (output) {
            if (output.note === bitcoinAddress.address) {
              output.nodeId = bitcoinAddress._id;
            }
          }
        Transfers.update({"_id": tranfser._id},{$set {"details.outputs": outputs, "details.inputs": inputs}});
      } else {//User has never added an address related to this transaction before
        transfer = {};
        transfer.foreignId = foreignId;
        transfer.date = Date(transaction.time*1000);
        transfer.sourceId = true;
    }
    });
  }
});