BitcoinWallets.helpers({
  balance: function() {
    var result = 0;
    BitcoinAddresses.find({"walletId": this._id}).fetch().forEach(
      function(address)
    {
      result += address.balance;
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