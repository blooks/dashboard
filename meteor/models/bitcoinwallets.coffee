# Create the meteor collection
@BitcoinWallets = new Meteor.Collection('bitcoinwallets')

Schemas = {}

Schemas.BitcoinWallets = new SimpleSchema

  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # BitcoinWallets info
  label:
    type: String
  addresses:
    type: [String]
    optional: true

# Attach the schema to the collection
BitcoinWallets.attachSchema Schemas.BitcoinWallets

# Add the created / updated fields
BitcoinWallets.timed()

# Ensure every document is owned by a user
BitcoinWallets.owned()

BitcoinWallets.helpers balance: ->
  45
  #BitcoinWallets.findOne @_id
  #Transactions.find(userId: @userId).length

BitcoinWallets.allow
  insert: (userId, item) ->
    if not userId?
      throw new Meteor.Error 400, "You need to log in to insert."
    _.extend item, userId: userId
  update: (userId, doc, filedNames, modifier) ->
    if userId isnt doc.userId
      throw new Meteor.Error 400, "You can only edit your own entries."
    true
  remove: (userId, doc) ->
    if doc.userId isnt userId
      throw new Meteor.Error 400, "You can only delete your own entries."
    true
