Meteor.publish("transfers", function (page, numberOfResults) {
  var self = this;
  var totalAvailableResults = Transfers.find({userId: this.userId}).count();
  var handle = Transfers.find({userId: this.userId}, {skip: parseInt(page-1)*parseInt(numberOfResults), limit: numberOfResults, sort: {createdAt: -1}}).observeChanges({
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

