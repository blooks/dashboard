BitcoinExchangeRates = new Mongo.Collection('bitcoinExchangeRates');
Meteor.startup(function () {
  var currencies = ["EUR", "USD"];
    //22.01.2015 LFG this must be moved to a meteor package Mocha test try to populate the database every time that the server is restarted
    var Coynverter = Meteor.npmRequire("coyno-converter");
    var coynverter = new Coynverter(process.env.MONGO_URL);
    currencies.forEach(function (currency) {
        coynverter.update(currency);
    });
});

//TODO: Cronjob to daily get new rates.

