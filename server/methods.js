Meteor.methods({
  calculateBaseAmount: function (amount, from, date) {
    Coynverter.calculateBaseAmount(amount, from, date, function (err, result) {
      return result;
    });
  },
  totalTransfersPages: function () {
    return Transfers.find({}).count();
  }
});
