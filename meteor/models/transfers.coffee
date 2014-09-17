# Create the meteor collection
@Transfers = new Meteor.Collection('transfers')

Schemas = {}

Schemas.Transfer = new SimpleSchema

  foreignId:
    type: String
    unique : true
  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Transfer info
  from:
    type: String
  to:
    type: String
  flow:
    type: Schemas.Amount
  # Metadata
  date:
    type: Date
  source:
    type: String
  note:
    type: String
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
