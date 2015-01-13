Meteor.publish "trades", (userId) ->
  Trades.find userId: this.userId
Meteor.publish "transfers", (userId) ->
  Transfers.find userId: this.userId
Meteor.publish "exchanges", (userId) ->
  Exchanges.find userId: this.userId
Meteor.publish "bankaccounts", (userId) ->
  BankAccounts.find userId: this.userId
Meteor.publish "bitcoinwallets", (userId) ->
  BitcoinWallets.find userId: this.userId
Meteor.publish "bitcoinaddresses", (userId) ->
  BitcoinAddresses.find userId: this.userId
Meteor.publish 'user', ->
  Meteor.users.find({_id: this.userId})