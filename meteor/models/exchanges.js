Exchanges.helpers({
  balances: function() {
    var result = []
    currencies = Meteor.settings.public.coyno.allowedCurrencies;
    var exchange = this.exchange;
    var transactionsin = Transactions.find({"in.node": exchange}).fetch();
    var transactionsout = Transactions.find({"out.node": exchange}).fetch();
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
      result.push({currency: currency, balance: balance});
    });
  return result;
}
});