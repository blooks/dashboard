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
  if (fromCurrency === toCurrency) {
    return amountToConvert;
  };
  var syncConverter= Async.wrap(CoynoCoynverter, ['convert']);
  return syncConverter.convert(fromCurrency, toCurrency, amountToConvert, date);
};

Meteor.startup(function () {
  Coynverter.update();
});
