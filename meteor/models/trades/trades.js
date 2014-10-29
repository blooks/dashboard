var currencyKnown = function (currency) {
  return Meteor.settings.public.coyno.valuedCurrencies.indexOf(currency) > -1;
};

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
    base_amount = Coynverter.calculateBaseAmount(knownCurrencyAmount, knownCurrency, this.date);
    var result = {
      currency : base_currency,
      amount: Math.round(base_amount)
    };
    return result;
  },
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