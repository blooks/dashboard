var Coynverter = Npm.require("coyno-converter");

Coynverter = {
};

var CoynoCoynverter = new CoynverterPackage(Coynverter.mongourl, Coynverter.collection);

Coynverter.update = function () {
  Async.wrap()
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
