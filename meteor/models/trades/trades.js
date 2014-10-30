var calculateBaseAmount;
calculateBaseAmount = function(amount, foreigncurrency, date) {
  var e, rate, base_currency;
  if (date == null) {
    date = new Date();
  }
  try {
    check(date, Date);
    if (foreigncurrency !== 'USD' && foreigncurrency !== 'EUR') {
      throw new Meteor.Error('400', 'Sorry, can only convert from USD right now. ' + foreigncurrency + ' not yet supported.');
    }
    base_currency = 'EUR';
    rate = getExchangeRate(foreigncurrency, base_currency, date);
    return amount * rate;
    } catch (_error) {
    e = _error;
    return console.log(e);
    }
};

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
    var knownCurrency = this.buy.currency;
    var knownCurrencyAmount = this.buy.amount - this.buy.fee;
    //We need to come back on this. What exactly happens with
    //the fees? Are they increasing the buy price?
    //What about double fees (left and right?)
    if (!currencyKnown(knownCurrency)) {
      knownCurrency = this.sell.currency;
      knownCurrencyAmount = this.sell.amount + this.sell.fee;
    }
    if(!currencyKnown(knownCurrency)) {
      console.log("Warning: Getting Base of Trade. Both currencies not known!");
    }
    var base_amount = Coynverter.calculateBaseAmount(knownCurrencyAmount, knownCurrency, this.date);
    Trades.update({"_id": doc._id},{$set : {"baseAmount": base_amount}})
  });
};