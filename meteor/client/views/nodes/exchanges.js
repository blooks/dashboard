Template.currencyExchanges.helpers({
  exchanges: function(){
    return Exchanges.find().fetch();
  }
  });
Template.currencyExchanges.events({
  'click .delete-trades' : function(event, template) {
    var myTransactions = Trades.find().fetch();
    var result = true;
    myTransactions.forEach(function(entry) {
      result = Trades.remove({
        _id: entry._id
      });
    });
    return result;
  },
  'click .update-trades' : function(event, template) {
    Meteor.call('getBitstampData');
    Meteor.call('getKrakenData');
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