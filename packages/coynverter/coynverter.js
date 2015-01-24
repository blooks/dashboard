var coynoconverter = Npm.require("coyno-converter");

Coynverter = {
  mongourl: process.env.MONGO_URL
};

var NodeConverter = new coynoconverter(Coynverter.mongourl);

Coynverter.update = function () {
  var syncConverter = Async.wrap(NodeConverter, ["update"]);
  var result = syncConverter.update();
  console.log("Coynverter Update done. Result was:" + result);
};

Coynverter.convert = function (fromCurrency, toCurrency, amountToConvert, date) {
  var syncConverter= Async.wrap(NodeConverter, ['convert']);
  console.log("Coynverter about to convert something!");
  var result = syncConverter.convert(fromCurrency, toCurrency, amountToConvert, date);
  console.log("Coynverter converted something. Value was:" + result);
  return result;
};

Meteor.startup(function () {
  Coynverter.update();
});
