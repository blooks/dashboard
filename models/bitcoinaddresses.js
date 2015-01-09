if (Meteor.isServer) {
  var computeBalance = function (transactions, address) {
    var result = 0;
    transactions.forEach(function (transaction) {
      if (transaction.details.currency !== "BTC") {
        throw new Meteor.Error(500, 'Minion to compute balance for Bitcoin Addresses here: You gave non bitcoin transfers to me! Shame on you!');
      }
      transaction.details.inputs.forEach(function (input) {
        var inputNode = BitcoinAddresses.findOne({"_id": input.nodeId});
        if (inputNode) {
          if (inputNode.address === address) {
            result -= input.amount;
          }
        }
      });
      transaction.details.outputs.forEach(function (output) {
        var outputNode = BitcoinAddresses.findOne({"_id": output.nodeId});
        if (outputNode) {
          if (outputNode.address === address) {
            result += output.amount;
          }
        }
      });
    });
    return result;
  };
  BitcoinAddresses.before.remove(function (userId, doc) {

    //TODO: @LEVIN redundant code! Remove!
    var transactions = function (doc) {
      var nodeId = doc._id;
      return Transfers.find(
        {
          $or: [
            {'details.inputs': {$elemMatch: {'nodeId': nodeId}}},
            {'details.outputs': {$elemMatch: {'nodeId': nodeId}}}
          ]
        });
    };
    var transfers = transactions(doc);
    transfers.forEach(function (transfer) {
      Transfers.remove({"_id": transfer._id});
    });
  });
}

BitcoinAddresses.simpleSchema().messages({
  invalidAddress: "[label] is not a Bitcoin Address"
});

BitcoinAddresses.helpers({
  update: function () {
    var transactions = this.transactions();
    var balance = computeBalance(transactions, this.address);
    BitcoinAddresses.update({"_id": this._id}, {$set: {"balance": balance}});
  },
  transactions: function () {
    var nodeId = this._id;
    return (Transfers.find(
      {
        $or: [
          {'details.inputs': {$elemMatch: {'nodeId': nodeId}}},
          {'details.outputs': {$elemMatch: {'nodeId': nodeId}}}
        ]
      }).fetch());
  }
});
