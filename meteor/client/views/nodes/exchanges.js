Template.currencyExchanges.helpers({
  exchanges: function(){
    return Exchanges.find().fetch();
  }
  });
Template.currencyExchanges.events({
  'click .delete-trades' : function(event, template) {
    var myTransactions = Transactions.find().fetch();
    var result = true;
    myTransactions.forEach(function(entry) {
      result = Transactions.remove({
        _id: entry._id
      });
    });
    return result;
  },
  'click .update-trades' : function(event, template) {
    Meteor.call('getBitstampData');
    Meteor.call('getKrakenData');
    return true;
  }
});