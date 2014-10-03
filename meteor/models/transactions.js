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


Transactions.helpers({
  base: function() {
    var base_currency = 'EUR';
    var foreign_currency = this.in.currency;
    var foreign_amount = this.in.amount;
    if (foreign_currency === 'BTC') {
      foreign_currency = this.out.currency;
      foreign_amount = this.out.amount;
    }
    if (foreign_currency === 'BTC') {//Bitcoin only transactions not yet supported.
      return {
        currency : base_currency,
        amount: 0
      };
    }
    base_amount = calculateBaseAmount(foreign_amount, foreign_currency, this.date);
    var result = {
      currency : base_currency,
      amount: Math.round(base_amount)
    };
    return result;
}
}
);
Transactions.transform = function(transaction) {
    if (transaction.in.currency === transaction.out.currency) {
      transaction.isTrade = false;
    }
    transaction.isTrade = true;
    return transaction;
  };