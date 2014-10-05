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
    return accounting.toFixed(amount * rate, 2);
    } catch (_error) {
    e = _error;
    return console.log(e);
    }
};

var currencyKnown = function (currency) {
  if (Meteor.settings.public.allowedCurrencies.indexOf(currency) > -1) return true;
  return false;
}

Trades.helpers({
  base: function() {
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
    base_amount = calculateBaseAmount(knownCurrencyAmount, knownCurrency, this.date);
    var result = {
      currency : base_currency,
      amount: Math.round(base_amount)
    };
    return result;
}
}
);