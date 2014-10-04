BitcoinWallets.helpers({
  balance: function() {
  currencies = ['BTC'];
    var bitcoinwallet = this.device;
    var transactionsin = Transactions.find({"in.node": bitcoinwallet}).fetch();
    var transactionsout = Transactions.find({"out.node": bitcoinwallet}).fetch();
    currencies.forEach(function(currency) {
      var balance = 0.0;
      transactionsin.forEach(function(transaction) {
      if (transaction.in.currency == currency) {
        balance+=parseFloat(transaction.in.amount);
      }
      });
      transactionsout.forEach(function(transaction) {
      if (transaction.out.currency == currency) {
        balance-=parseFloat(transaction.out.amount);
      }
      });
      result = balance;
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