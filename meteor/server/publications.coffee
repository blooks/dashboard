Meteor.publish "transactions", (userId) ->
  Transactions.find userId: this.userId
