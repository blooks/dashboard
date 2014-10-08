// on the client
Template.trades.helpers({
  trades: function(){
    return Trades.find({},{sort: ['date','asc']}).fetch();
  }
});
Template.trades.events({
  'click .delete-trade': function(event, template) {
    /** Deactivated for the time being.
    return Trades.remove({
      _id: this._id
    });
    **/
    return true;
  }
});
