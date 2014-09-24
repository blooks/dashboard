Meteor.publish "transactions", (userId) ->
  Transactions.find userId: this.userId
Meteor.publish "transfers", (userId) ->
  Transfers.find userId: this.userId
Meteor.publish "nodes", (userId) ->
  Nodes.find userId: this.userId