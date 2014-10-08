Exchanges.helpers({
  balances: function() {
    var result = [];
    currencies = Meteor.settings.public.coyno.allowedCurrencies;
    var exchangeId = this._id;
    var trades = Trades.find({"venueId": exchangeId}).fetch();
    //Performance issue!
    var transfers = Transfers.find().fetch();
    currencies.forEach(function (currency) {
      var balance = 0.0;
      trades.forEach(function (trade) {
        if (trade.buy.currency == currency) {
          balance+=(trade.buy.amount - trade.buy.fee);
        }
        if (trade.sell.currency == currency) {
          balance-=(trade.sell.amount + trade.sell.fee);
        }
      });
      transfers.forEach(function (transfer) {
        if (transfer.details.currency == currency) {
          balance+=transfer.amountIncomingToNode(exchangeId);
          balance-=transfer.amountOutgoingFromNode(exchangeId);
        }
      });
      result.push({currency: currency, balance: balance});
    });
    return result;
  },
  update: function() {
    if (this.exchange === "Bitstamp") {
    Meteor.call('getBitstampData', this); }
    if (this.exchange === "Kraken") {
    Meteor.call('getKrakenData', this);
    }
  },
  logoUrl: function() {
    if (this.exchange === "Bitstamp") {
         return "img/external-logos/Bitstamp_logo.png";
    }
    if (this.exchange === "Kraken") {
         return "img/external-logos/Kraken-logo.png";
    }
    return "img/exchange-icon-default-handshake.png";
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
    Meteor.call('getBitstampData', doc); 
  }
 // if (doc.exchange === 'Kraken') {
 //   Meteor.call('getKrakenData', doc);
 //}
});
}