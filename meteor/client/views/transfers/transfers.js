// on the client
Template.transfers.helpers({
  transfers: function(){
    return Transactions.find({isTrade: false},{sort: ['date','asc']}).fetch();
  }
});
Template.transfers.events({
  'click .delete-trade': function(event, template) {
    return Transactions.remove({
      _id: this._id
    });
  }
});
