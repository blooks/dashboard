var CoynverterPackage = Npm.require("coyno-converter");

Coynverter = {
  mongourl: process.env.MONGO_URL,
  collection: "BitcoinExchangeRates",
  currencies: ["EUR", "USD"]
};

var CoynoCoynverter = new CoynverterPackage(Coynverter.mongourl, Coynverter.collection);

Coynverter.update = function () {
  var currencies = Coynverter.currencies;
  currencies.forEach(function (currency) {
    CoynoCoynverter.update(currency, function (err, result) {});
  });
};

Coynverter.convert = function (fromCurrency, toCurrency, amountToConvert, date) {
  var conversionSync= Async.wrap(CoynoCoynverter, ['convert']);
  var conversionResult = conversionSync.convert(fromCurrency, toCurrency, amountToConvert, date);
  return conversionResult;
};

Meteor.startup(function () {
  Coynverter.update();
  Log.info(Coynverter.convert('BTC', 'EUR', 1, '2015-01-10'));
});
