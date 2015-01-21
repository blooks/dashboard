// BitcoinExchangeRates = new Mongo.Collection('bitcoinExchangeRates');
// Meteor.startup(function () {
//   if(BitcoinExchangeRates.find().fetch().length===0){
//     var currencies = ["EUR", "USD"];
//     var Coynverter = Meteor.npmRequire("coyno-converter");
//     var coynverter = new Coynverter();
//     currencies.forEach(function (currency) {
//       coynverter.getExchangeRatesForNewCurrency("meteor", currency, "bitcoinExchangeRates", function (err, result) {
//         if(err){
//           Log.error(err);
//         }
//       });
//     });
//   }
// });