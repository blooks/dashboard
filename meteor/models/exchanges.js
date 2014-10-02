Exchanges.helpers({
  balances: function() {
    var result = []
    currencies = ['USD','BTC', 'EUR'];
    var exchange = this.exchange;
    var transactions = Transactions.find({source: exchange}).fetch();
    currencies.forEach(function(currency) {
    var balance = 0.0;
    transactions.forEach(function(transaction) {
      if (transaction.in.currency == currency) {
        balance+=parseFloat(transaction.in.amount);
      } else if (transaction.out.currency == currency) {
        balance-=parseFloat(transaction.out.amount);
      }
    });
      result.push({currency: currency, balance: balance});
  });
  return result;
}
});