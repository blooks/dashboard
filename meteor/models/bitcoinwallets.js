BitcoinWallets.helpers({
  balance: function() {
    nodeId = this._id;
    var result = 0;
    BitcoinAddresses.find({"walletId": this._id}).fetch().forEach(
      function(address)
    {
      result += address.balance;
    });
    var transfers = Transfers.find(
        { $or : [
          { 'details.inputs': { $elemMatch : {'nodeId': nodeId }} },
          { 'details.outputs': { $elemMatch : {'nodeId': nodeId }} }
        ]
        }).fetch();
    transfers.forEach(function(transfer) {
      transfer.details.inputs.forEach(function(input) {
        if (input.nodeId == nodeId) {
          result -= input.amount;
        }
      });
      transfer.details.outputs.forEach(function(output) {
        if (output.nodeId == nodeId) {
          result += output.amount;
        }
      });
    });
    return result;
},
  addresses: function() {
    return BitcoinAddresses.find({"walletId": this._id}).fetch();
  }
});
BitcoinWallets.before.remove(function (userId, doc) {
  var addresses = BitcoinAddresses.find({"walletId": doc._id});
  addresses.forEach(function(address) {
    BitcoinAddresses.remove({"_id": address._id});
  });
});