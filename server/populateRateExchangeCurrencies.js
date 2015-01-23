BitcoinExchangeRates = new Mongo.Collection('bitcoinExchangeRates');
Log.warn(process.env.MONGO_URL);
Meteor.startup(function () {
  if(BitcoinExchangeRates.find().fetch().length===0){
    var currencies = ["EUR", "USD"];
    //22.01.2015 LFG this must be moved to a meteor package Mocha test try to populate the database every time that the server is restarted
    if(process.env.MONGO_URL.indexOf("mocha")===-1){
      var Coynverter = Meteor.npmRequire("coyno-converter");
      var coynverter = new Coynverter(process.env.MONGO_URL);
      currencies.forEach(function (currency) {
        coynverter.getExchangeRatesForNewCurrency(currency, "bitcoinExchangeRates", function (err, result) {
          if(err){
            Log.error(err);
          }
        });
      });
    }
  }
});

