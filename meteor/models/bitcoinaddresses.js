BitcoinAddresses.helpers( {
        update: function() {
          var transactions = Meteor.call('updateBitcoinTransactionsForAddress', this);
          var balance = 0;
          try {
            balance = computeBalance(transactions, this.address); }
          catch (error) {
            console.log(error);
          }
          BitcoinAddresses.update({"_id": this._id},{$set : {"balance": balance}})
        }
      }
  );

if (Meteor.isServer) {
var computeBalance = function(transactions, address) {
  var result = 0;
  transactions.forEach(function(transaction) {
    if (transaction.details.currency != "BTC") {
      throw new Meteor.Error( 500, 'Minion to compute balance for Bitcoin Addresses here: You gave non bitcoin transfers to me! Shame on you!');
    }
    transaction.details.inputs.forEach(function(input) {
      var inputNode = BitcoinAddresses.findOne({"_id": input.nodeId});
      if (inputNode) {
        if (inputNode.address == address){
          result -= input.amount;
        }
      }
    });
    transaction.details.outputs.forEach(function(output) {
      var outputNode = BitcoinAddresses.findOne({"_id": output.nodeId});
      if (outputNode) {
        if (outputNode.address == address) {
          result += output.amount;
        }
      }
    });
  });
  return result;
};
BitcoinAddresses.after.insert(function (userId, doc) {
  var address = BitcoinAddresses.findOne({'_id': doc._id});
  address.update();
});
}