// on the client
Template.transactions.helpers({
  transactions: function(){
    return Transactions.find({},{sort: ['date','asc']}).fetch();
  }
});
Template.transactions.events({
  'click .delete-transactions' : function(event, template) {
    var myTransactions = Transactions.find().fetch();
    var result = true;
    myTransactions.forEach(function(entry) {
      result = Transactions.remove({
        _id: entry._id
      });
    });
    return result;
  },
  'click .update-transactions' : function(event, template) {
    Meteor.call('getBitstampData');
    Meteor.call('getKrakenData');
    return true;
  },
  'click .delete-transaction': function(event, template) {
    return Transactions.remove({
      _id: this._id
    });
  }
});

// Call tooltip functionality. To be fixed.
Template.transactions.rendered = function() {
  $('a[data-toggle="tooltip"]').tooltip() //initialize all tooltips in this template
};