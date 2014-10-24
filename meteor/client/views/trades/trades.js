// on the client
Template.trades.helpers({
  trades: function(){
    return Trades.find({},{sort: ['date','asc']}).fetch();
  }
});
Template.trades.events({
  'click .delete-trade': function(event, template) {
    return Trades.remove({
      _id: this._id
    });
  }
});
