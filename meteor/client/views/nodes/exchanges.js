Template.currencyExchanges.helpers({
  exchanges: function(){
    return Exchanges.find().fetch();
  }
  });
Template.currencyExchanges.events({
  'click .delete-transactions' : function(event, template) {
    var trades = Trades.find().fetch();
    trades.forEach(function(entry) {
      result = Trades.remove({
        _id: entry._id
      });
    });
    var transfers = Transfers.find().fetch();
    transfers.forEach(function(entry) {
      result = Transfers.remove({
        _id: entry._id
      });
    });
    return true;
  },
  'click .update-trades' : function(event, template) {
    Meteor.call('getBitstampData');
    Meteor.call('getKrakenData');
    BitcoinAddresses.find().fetch().forEach(function(address) {
      address.update();
    });
    return true;
  },
  'click .delete-exchange':  function(event, template) {
    return Exchanges.remove({
      _id: this._id
    });
  },
  'click .update-exchange': function(event, template) {
    return this.update();
  }
});