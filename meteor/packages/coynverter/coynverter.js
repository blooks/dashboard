/**
 * Created by levin on 30.10.14.
 */
/**
 * Providing the methods for exchanging currencies
 */
Coynverter = (function() {

  /**
   * Get the exchange rate on a certain date
   * @param {String} from
   * @param {String} to
   * @param {Date} date
   * @returns {Number}
   */
  var exchangeRate = function( from, to, date ) {

    // TODO: usage scenarios? - decide if it'll throw errors or return nulls

    /**
     * @returns {String} User's jurisdiction (the 2-letter id). Default: 'de'
     */
    var userJurisdiction = function() {
      var _ref, _ref1;
      return ((_ref = Meteor.user) != null ? (_ref1 = _ref.profile) != null ? _ref1.jurisdiction : void 0 : void 0) != null  ?
        Meteor.user.profile.jurisdiction :
        'de';
    };

    /**
     * @returns {Number} The EUR to USD conversion rate
     */
    var eurToUsd = function() {
      var jurisdiction, year = date.getFullYear(), month = date.getMonth() + 1;
      jurisdiction = userJurisdiction();
      return (exchangeRates[jurisdiction] && exchangeRates[jurisdiction]['USD'] &&
        exchangeRates[jurisdiction]['USD'][year] && exchangeRates[jurisdiction]['USD'][year][month]) ?
        exchangeRates[jurisdiction]['USD'][year][month] :
        null;
    };

    /**
     * @returns {Number} The EUR to USD conversion rate or its inverse
     */
    var btcToFiat = function(currency) {
      var rateRecord;
      rateRecord = BtcToFiat.findOne({date: date});
      return (rateRecord && rateRecord[currency]) ? Number(rateRecord[currency]) : null;
    };

    // validate and dispatch the exchange request:
    date = date || new Date();
    var acceptedCurrencies = ['USD', 'EUR', 'BTC'];
    if (acceptedCurrencies.indexOf(from)<0 || acceptedCurrencies.indexOf(to)<0)
      throw new Error('400', 'Sorry, can\'t use currency \'' + from + '\'.');
    if (from === to)
      return 1;

    switch (from) {
      case 'BTC':
        return to === 'USD' ? btcToFiat('USD') : btcToFiat('EUR');
      case 'EUR':
        if (to === 'USD') {
          return eurToUsd();
        } else {
          var b2e = btcToFiat('EUR');
          return b2e ? 1 / b2e : null;
        }
      case 'USD':
        if (to === 'BTC') {
          var b2u = btcToFiat('USD');
          return b2u ? 1 / b2u : null;
        }
        else {
          var e2u = eurToUsd();
          return e2u ? 1 / e2u : null;
        }
    }
  };


  /**
   * Note: Base currency is always EUR at the moment
   * @param {Number} amount
   * @param {String} from
   * @param {Date} date
   * @returns {Number} The corresponding amount in the base currency
   */
  var calculateBaseAmount = function(amount, from, date) {
    var baseCurrency = 'EUR', rate;
    check( date = date || new Date(), Date );
    from = from || 'USD';
    rate = exchangeRate(from, baseCurrency, date);
    return rate ? amount * rate : null;
  };


  /**
   * Import rates from csv files
   * @param {String} currency
   * @param {String} dbOp Specifically ask to 'insert' or 'update' the records (using 'upsert' would be too slow)
   */
  var importCurrency = function(currency, dbOp) {

    var fileLines, dailyData, doc,
      filenames = {USD: 'data/HistDollarPrices.csv', EUR: 'data/HistEuroPrices.csv'};
    fileLines = Assets.getText(filenames[currency]).split('\n');
    fileLines.shift();  // remove the table header

    fileLines.forEach(function(line) {
      dailyData = line.split(',');
      if (dbOp === 'insert') {
        doc = {date: new Date(dailyData[0])};
        doc[currency] = dailyData[1];
        BtcToFiat.insert(doc);
      }
      else {
        doc = {};
        doc[currency] = dailyData[1];
        BtcToFiat.update({date: new Date(dailyData[0])}, {$set: doc})
      }
    });
  };


  /**
   * Populate the BtcToFiat rates collection
   */
  var repopulateBtcToFiat = function() {
    BtcToFiat.remove({});
    importCurrency('USD', 'insert');
    importCurrency('EUR', 'update');
  };


  // the public API:
  return {
    calculateBaseAmount: calculateBaseAmount,
    getExchangeRate: exchangeRate,
    repopulateBtcToFiat: repopulateBtcToFiat
  };
})();


// Create the BtcToUsd collection if not existing or recreate it if enforced by the environment variable COYNO_REFRESH_RATES.
Meteor.startup(function () {
  BtcToFiat = BtcToFiat || new Mongo.Collection('BtcToFiat');

  if (Meteor.isServer) {
    if (!BtcToFiat.findOne() || process.env.COYNO_REFRESH_RATES)
      Coynverter.repopulateBtcToFiat();
  }
});