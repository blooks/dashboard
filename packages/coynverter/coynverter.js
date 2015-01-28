if (Meteor.isServer) {
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
    var syncConverter = Async.wrap(NodeConverter, ['convert']);
    var result;
    try {
      result = syncConverter.convert(fromCurrency, toCurrency, amountToConvert, date);
    } catch (error) {
      console.log("Coynverter wanted to convert something. But there was an error:");
      console.log(error);
      result = 0;
    }
    return result;
  };

  Meteor.startup(function () {
    Coynverter.update();
  });

  SyncedCron.add({
    name: 'Update Exchange Rates',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.cron('5 * * * * *');
    },
    job: function() {
      Coynverter.update();
    }
  });
  SyncedCron.start();
}
