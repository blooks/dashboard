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
