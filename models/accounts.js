//This variable stores the value of the currency returnd in the callback of one method call
var valueCurrency = new ReactiveVar(0);
Meteor.users.helpers({
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
  },
  totalBalanceBasedOnUserCurrency: function (userCurrency) {
    Meteor.call('getLastExchangeRateForBTC', userCurrency, function (err, response) {
      valueCurrency.set(response);
    });
    var result = 0;
    Transfers.find({"details.currency": "BTC"}).forEach(function (transfer) {
      if (transfer.isIncoming()) {
        result += transfer.representation.amount;
      }
      if (transfer.isOutgoing()) {
        //TODO: Respect the fee!
        result -= (transfer.representation.amount);
      }
    });
    if(valueCurrency.get()!==0){
      result = ((valueCurrency.get()*result)/100000000).toFixed(8);
      return result;
    }
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
    allowedValues: ['EUR', 'USD', 'BTC']
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
