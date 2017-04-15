var Users = Meteor.users
Users.helpers({
  totalBalance: function (currency) {
    if (currency !== 'BTC') {
      return 0
    }
    var result = 0
    BitcoinWallets.find({ userId: Meteor.userId() }).forEach(function (wallet) {
      result += wallet.balance()
    })
    return result
  }
})

if (Meteor.isServer) {
  const convert = require('../server/converter').default
  Users.helpers({
    totalBalanceInFiat: function () {
      var bitcoinBalance = this.totalBalance('BTC')
      var currency = Meteor.user().profile.currency
      const now = new Date()
      var returnValue = convert({toCurrency: currency, btcAmount: bitcoinBalance, date: now})
      console.log(returnValue)
      return parseInt(returnValue, 10)
    }
  })
}

var Schema = new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date()
      }
      if (this.isUpsert) {
        return { $setOnInsert: new Date() }
      } else {
        this.unset()
      }
    },
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date()
      }
    },
    optional: true
  },
  emails: {
    type: [Object]
  },
  'emails.$.address': {
    optional: true,
    type: String,
    unique: true, // DGB 2015-01-21 06:59 Added
    index: true,
    regEx: SimpleSchema.RegEx.Email
  },
  'emails.$.verified': {
    optional: true,
    type: Boolean
  },
  profile: {
    type: Schemas.userProfile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  }
})

Meteor.users.attachSchema(Schema)

if (Meteor.isServer) {
  // DGB 2015-01-23 05:19
  // Before we delete the user, we remove related wallets first. Wallets will
  // cascade into accounts, accounts will cascade into transfers
  Meteor.users.before.remove(function (userId, doc) {
    var userWallets = BitcoinWallets.find({ 'userId': doc._id }, { fields: { id: 1 } }).fetch()
    // DGB 2015-01-23 05:17
    // Cascading removals only if the user has wallets
    userWallets.forEach(function (wallet) {
      BitcoinWallets.remove({ _id: wallet._id })
    })
  })
}
