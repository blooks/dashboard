BitcoinExchangeRates = new Mongo.Collection('bitcoinExchangeRates');
/**
 * [cleanData ]
 * @return {[type]} [description]
 */
var cleanData = function () {
  BitcoinExchangeRates.find().fetch().forEach( function (item) {
      BitcoinExchangeRates.remove({_id: item._id});
  });
  if(BitcoinExchangeRates.find().fetch().length===0){
    //22.01.2015 LFG this must be moved to a meteor package Mocha test try to populate the database every time that the server is restarted
    if(process.env.MONGO_URL.indexOf("mocha")===-1){
      var Coynverter = Meteor.npmRequire("coyno-converter");
      var coynverter = new Coynverter(process.env.MONGO_URL);
      var currencies = ["EUR", "USD"];
      currencies.forEach(function (currency) {
        try{
          coynverter.getExchangeRatesForNewCurrency(currency, "bitcoinExchangeRates", function (err, result) {
            if(err){
              Log.error(err);
            }
          });
        }catch(err){
          Log.error(err);
        }
      });
    }
  }
};

Meteor.startup(function () {
  cleanData();
});
