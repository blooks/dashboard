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
  var MyCron = new Cron(600000);

  // 5 is the number of intervals between invoking the job
  // so this job will happen once every 5 minute
  MyCron.addJob(1, function () {
    Coynverter.update();
  });
}
