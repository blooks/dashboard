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
/*
        {{#if isIncoming }}

            <td></td>
        {{/if}}
        {{#if isInternal }}

        {{/if}}
        {{#if isOutgoing }}
            <td colspan="4"></td>
        {{/if}}

*/