
Meteor.users.helpers({
  totalBalance: function (currency) {
    var result = 0;
    Transfers.find({"details.currency": currency}).forEach(function (transfer) {
      if (transfer.isIncoming()) {
        result += transfer.representation.amount;
      }
      if (transfer.isOutgoing()) {
        result -= (transfer.representation.fee);
        result -= (transfer.representation.amount);
      }
    });
    return result;
  },
  totalBalanceInFiat: function () {
    var bitcoinBalance = this.totalBalance('BTC');
    var currency = Meteor.user().profile.currency;
    var returnValue = 0;
    Meteor.call('convert', 'BTC', currency, bitcoinBalance, new Date(), function (err, result) {
      returnValue = parseFloat(result/10e7).toFixed(2);
    });
    return returnValue;
  }
});

var userProfile = new SimpleSchema({
  language: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  username: {
    type: String,
    optional: true
  },
  hasTransfers: {
    type: Boolean,
    defaultValue: false
  },
  hasSignedTOS: {
    type: Boolean,
    defaultValue: false
  },
  currency: {
    type: String,
    optional: true,
    allowedValues: ['EUR', 'USD', 'BTC'],
    defaultValue: 'EUR'
  }
});

var Schema = new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
      if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      }
      else {
        this.unset();
      }
    },
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    optional: true
  },
  emails: {
    type: [Object]
  },
  "emails.$.address": {
    optional: true,
    type: String,
    unique: true, //DGB 2015-01-21 06:59 Added
    index: true,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    optional: true,
    type: Boolean
  },
  profile: {
    type: userProfile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

Meteor.users.attachSchema(Schema);

if (Meteor.isServer) {
  // DGB 2015-01-23 05:19
  // Before we delete the user, we remove related wallets first. Wallets will
  // cascade into accounts, accounts will cascade into transfers
  Meteor.users.before.remove(function (userId, doc) {
    var userWallets = BitcoinWallets.find({'userId': doc._id},{fields:{id:1}}).fetch();
    // DGB 2015-01-23 05:17
    // Cascading removals only if the user has wallets
    userWallets.forEach(function(wallet) {
       BitcoinWallets.remove({_id: wallet._id});
    });
  });
}
