Meteor.publish("trades", function () {
  return Trades.find({userId: this.userId});
});

Meteor.publish("transfers", function (numberOfResults, page) {
  Log.info("Number of results to show: "+numberOfResults);
  Log.info("Page: "+page);
  Log.info("Result to skip: "+page*numberOfResults);
  var self = this;
  var handle = Transfers.find({}, {skip: page*numberOfResults, limit: numberOfResults, sort: {createdAt: -1}}).observeChanges({
    added: function(id, fields){
      self.added("transfers", id, fields);
    },
    changed: function(id, fields) {
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

Meteor.publish("exchanges", function() {
  return Exchanges.find({userId: this.userId});
});

Meteor.publish("bankaccounts", function() {
  return BankAccounts.find({userId: this.userId});
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
