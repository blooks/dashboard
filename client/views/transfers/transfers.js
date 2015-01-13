// on the client
Template.transfers.helpers({
  transfers: function () {
    return Transfers.find({}, {sort: ['date', 'asc']}).fetch();
  }
});

Template.transfers.events({
  'click .delete-transfer': function () {
    return Transfers.remove({
      _id: this._id
    });
  }
});