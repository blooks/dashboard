Exchanges.helpers({
  balances: function() {
    var result = [{currency: 'EUR', balance: 0}];
    /**
    currencies = Meteor.settings.public.coyno.allowedCurrencies;
    var exchange = this.exchange;
    var transactionsin = Trades.find({"in.node": exchange}).fetch();
    var transactionsout = Trades.find({"out.node": exchange}).fetch();
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
    */
    return result;
  },
  update: function() {
    if (this.exchange === "Bitstamp") {
    Meteor.call('getBitstampData', this); }
  }
});
if (Meteor.isServer) {
Exchanges.before.remove(function (userId, doc) {
  var transactions = Trades.find({"venueId": doc._id});
  transactions.forEach(function(transaction) {
    Trades.remove({"_id": transaction._id});
  });
});
Exchanges.after.insert(function (userId, doc) {
  if (doc.exchange === "Bitstamp") {
    Meteor.call('getBitstampData', doc); }
});
}