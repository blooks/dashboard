Meteor.users.helpers({
  networthData: function () {
    var satoshiToBTC = function (amount) {
      return (amount / 10e7).toFixed(8);
    };
    var balances = [];
    var changes = [];
    var balance = 0;
    var change = 0;
    var time = 0;
    var timeDelta = 86400;
    Transfers
      .find({"details.currency": 'BTC'}, {sort: ['date', 'asc']})
      .forEach(function (transfer) {
        //Start from timedelta before the time of the first transaction
        if (time === 0) {
          time = transfer.date.getTime() - timeDelta;
        }
        while (transfer.date.getTime() >= time) {
          balances.push([time, parseFloat(satoshiToBTC(balance))]);
          changes.push([time, parseFloat(satoshiToBTC(change))]);
          change = 0;
          time += timeDelta;
        }
        if (transfer.isIncoming()) {
          balance += transfer.representation.amount;
          change += transfer.representation.amount;
        }
        if (transfer.isOutgoing()) {
          //TODO: Respect the fee!
          balance -= (transfer.representation.amount);
          change -= (transfer.representation.amount);
        }
      });
    balances.push([time, parseFloat(satoshiToBTC(balance))]);
    changes.push([time, parseFloat(satoshiToBTC(change))]);
    return [balances, changes];
  },
  totalBalance: function (currency) {
    var result = 0;
    Transfers.find({"details.currency": currency}).forEach(function (transfer) {
      if (transfer.isIncoming()) {
        result += transfer.representation.amount;
      }
      if (transfer.isOutgoing()) {
        //TODO: Respect the fee!
        result -= (transfer.representation.amount);
      }
    });
    return result;
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
