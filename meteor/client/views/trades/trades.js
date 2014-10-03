// on the client
Template.trades.helpers({
  trades: function(){
    return Transactions.find({isTrade: true},{sort: ['date','asc']}).fetch();
  }
});
Template.trades.events({
  'click .delete-trade': function(event, template) {
    return Transactions.remove({
      _id: this._id
    });
  }
});
