# Create the meteor collection
@BitcoinWallets = new Meteor.Collection('bitcoinwallets')

unless @Schemas?
  @Schemas = {}

Schemas.ArmoryRootData = new SimpleSchema

Schemas.ElectrumRootData = new SimpleSchema

Schemas.BitcoinWallets = new SimpleSchema

  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # BitcoinWallets info
  label:
    type: String
    optional: true
  type:
    type: String
    allowedValues: Meteor.settings.public.coyno.supportedBitcoinWalletTypes
  hdseed:
    type: String
    optional: true
# Attach the schema to the collection
BitcoinWallets.attachSchema Schemas.BitcoinWallets

# Add the created / updated fields
BitcoinWallets.timed()

# Ensure every document is owned by a user
BitcoinWallets.owned()
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
