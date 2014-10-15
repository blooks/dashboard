Coynverter = (function () {

  function calculateBaseAmount( amount, foreigncurrency, date ) {

    var e, rate, base_currency;
    date = date || new Date();
    foreigncurrency = foreigncurrency || 'USD';
    base_currency = 'EUR';

    try {
      check( date, Date );
      if ( foreigncurrency !== 'USD' && foreigncurrency !== 'EUR' ) {
        throw new Meteor.Error('400', 'Sorry, can only convert from USD right now. ' + foreigncurrency + ' not yet supported.');
      }
      rate = getExchangeRate( foreigncurrency, base_currency, date );
      return amount * rate;
    } catch (_error) {
      e = _error;
      return console.log( e );
    }
  }

  return {
    calculateBaseAmount: calculateBaseAmount,
    getExchangeRate: getExchangeRate
  };
})();