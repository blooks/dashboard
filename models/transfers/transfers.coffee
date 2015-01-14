# Create the meteor collection
## A Transfer is a transaction that moves one kind of a currency between
## two different accounts
@Transfers = new Meteor.Collection('transfers')

Schemas = {}

# Create the schema(s)
Schemas.VolumeFragment = new SimpleSchema
  amount:
    type: Number # Store amounts as Ints to avoid rounding issues
  nodeId:
    type: String
    regEx: SimpleSchema.RegEx.Id
    optional: true
  note:
    type: String
    optional: true


Schemas.TransferDetails = new SimpleSchema
  inputs:
    type: [Schemas.VolumeFragment]
  outputs:
    type: [Schemas.VolumeFragment]
  currency:
    type: String
    allowedValues: Meteor.settings.public.coyno.allowedCurrencies


Schemas.TransferRepresentation = new SimpleSchema
  type:
    type: String
  senderLabels:
    type: [String]
  recipientLabels:
    type: [String]
  amount:
    type: Number
  baseVolume:
    type: Number


Schemas.Transfer = new SimpleSchema

  foreignId:
    type: String
    unique: true
  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Transfer info
  details:
    type: Schemas.TransferDetails
  # Metadata
  date:
    type: Date
  sourceId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  note:
    type: String
    optional: true
  baseVolume:
    type: Number
    defaultValue: 0
  representation:
    type: Schemas.TransferRepresentation
    optional: true

# Attach the schema to the collection
Transfers.attachSchema Schemas.Transfer

# Add the created / updated fields
Transfers.timed()

# Ensure every document is owned by a user
Transfers.owned()

Transfers.allow
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
