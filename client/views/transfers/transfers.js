Template.transfers.rendered = function () {
  $('[data-toggle="tooltip"]').tooltip();
};

Template.transfers.helpers({
  noData: function () {
    return !Meteor.user().profile.hasTransfers;
  }
});
