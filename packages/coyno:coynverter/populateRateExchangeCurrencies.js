BitcoinExchangeRates = new Mongo.Collection('bitcoinExchangeRates');
Meteor.startup(function () {
  var currencies = ["EUR", "USD"];
    //22.01.2015 LFG this must be moved to a meteor package Mocha test try to populate the database every time that the server is restarted
    var Coynverter = Meteor.npmRequire("coyno-converter");
    var coynverter = new Coynverter(process.env.MONGO_URL);
    currencies.forEach(function (currency) {
      try {
        coynverter.updateExchangeRates(currency, "bitcoinExchangeRates", function (err, result) {
          if (err) {
            Log.error(err);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };
});

