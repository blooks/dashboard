Trades.helpers({
  venue: function() {
    var exchange = Exchanges.findOne({"_id": this.venueId});
    return exchange.exchangeLabel;
  },
  inflow: function() {
    return {
      amount: this.buy.amount - this.buy.fee,
      currency: this.buy.currency
    }
  },
  outflow: function() {
    return {
      amount: this.sell.amount + this.sell.fee,
      currency: this.sell.currency
    }
  }
});
if (Meteor.isServer) {
  var currencyKnown = function (currency) {
    return (Meteor.settings.public.coyno.valuedCurrencies.indexOf(currency) > -1);
  };
  Trades.after.insert(function(userId, doc) {
    var base_currency = 'EUR';
    var knownCurrency = doc.buy.currency;
    var knownCurrencyAmount = doc.buy.amount - doc.buy.fee;
    //We need to come back on doc. What exactly happens with
    //the fees? Are they increasing the buy price?
    //What about double fees (left and right?)
    if (doc.sell.currency == 'EUR' || knownCurrency == 'Altcoin') {
      knownCurrency = doc.sell.currency;
      knownCurrencyAmount = doc.sell.amount + doc.sell.fee;
    }
    var base_amount = Coynverter.calculateBaseAmount(knownCurrencyAmount, knownCurrency, doc.date);
    Trades.update({"_id": doc._id},{$set : {"baseAmount": base_amount}});
  });
}