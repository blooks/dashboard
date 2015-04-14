Meteor.publish("transfers", function (page, documentsPerPage) {
  var self = this;
  var totalAvailableResults = Transfers.find({userId: this.userId}).count();
  var maxNumPages = Math.ceil(totalAvailableResults/documentsPerPage);
  page = Math.min(page, maxNumPages);
  var handle = Transfers.find({userId: this.userId}, {
    skip: parseInt(page-1, 10)*parseInt(documentsPerPage, 10),
    limit: documentsPerPage,
    sort: {date: -1}
  }).observeChanges({
    added: function(id, fields){
      fields.totalAvailable = totalAvailableResults;
      self.added("transfers", id, fields);
    },
    changed: function(id, fields) {
      fields.totalAvailable = totalAvailableResults;
      self.changed("transfers", id, fields);
    },
    removed: function(id) {
      self.removed("transfers", id);
    }
  });
  self.ready();
  self.onStop(function() {
    handle.stop();
  });
});

Meteor.publish("bitcoinwallets", function () {
  return BitcoinWallets.find({userId: this.userId});
});

Meteor.publish("bitcoinaddresses", function () {
  return BitcoinAddresses.find({userId: this.userId});
});

Meteor.publish('user', function() {
  return Meteor.users.find({_id: this.userId});
});

Meteor.publish('exchanges', function() {
  /*
    Levin:
    Very important to not share the credentials with the user. They might contain very
    sensible and powerful data like accessTokens for oauth applications.
    TODO: Move credentials to server side collection.
   */
  return Exchanges.find({userId: this.userId}, {fields: {credentials : 0} });
});
