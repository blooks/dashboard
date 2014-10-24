
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
}
BitcoinAddresses.after.insert(function (userId, doc) {
	var transactions = Meteor.call('updateBitcoinTransactionsForAddress', doc);
  var balance = 0 
  try {
    balance = computeBalance(transactions, doc.address); }
    catch (error) {
      console.log(error);
    }
  BitcoinAddresses.update({"_id": doc._id},{$set : {"balance": balance}})
});
}