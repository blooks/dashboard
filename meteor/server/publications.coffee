Meteor.publish "transactions", (userId) ->
  Transactions.find userId: this.userId
Meteor.publish "transfers", (userId) ->
  Transfers.find userId: this.userId
Meteor.publish "sources", (userId) ->
  Sources.find userId: this.userId