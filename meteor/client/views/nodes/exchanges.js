Template.currencyExchanges.helpers({
  exchanges: function () {
    return Exchanges.find().fetch();
  }
});
Template.currencyExchanges.events({
  'click .delete-transactions': function () {
    var trades = Trades.find().fetch();
    trades.forEach(function (entry) {
      Trades.remove({
        _id: entry._id
      });
    });
    var transfers = Transfers.find().fetch();
    transfers.forEach(function (entry) {
      Transfers.remove({
        _id: entry._id
      });
    });
    return true;
  },
  'click .update-trades': function () {
    Meteor.call('getBitstampData');
    Meteor.call('getKrakenData');
    BitcoinAddresses.find().fetch().forEach(function (address) {
      address.update();
    });
    return true;
  },
  'click .delete-exchange': function () {
    return Exchanges.remove({
      _id: this._id
    });
  },
  'click .update-exchange': function () {
    return this.update();
  }
});
