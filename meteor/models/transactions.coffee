# Create the meteor collection
@Transactions = new Meteor.Collection('transactions')

Schemas = {}

# Create the schema(s)
Schemas.Amount = new SimpleSchema
  amount:
    type: String # Store amounts as string to avoid rounding issues
  currency:
    type: String

Schemas.Transaction = new SimpleSchema
  _id:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Trade info
  in:
    type: Schemas.Amount
  out:
    type: Schemas.Amount
  base:
    type: Schemas.Amount
  # Metadata
  date:
    type: Date
  source:
    type: String
  importId:
    type: String
  importLineId:
    type: String

# Attach the schema to the collection
Transactions.attachSchema Schemas.Transaction

# Add the created / updated fields
Transactions.timestampable()
# Use soft delete
Transactions.softRemovable()

Transactions.allow
  insert: (userId, item) ->
    if not userId?
      throw new Meteor.Error 400, "You need to log in to insert."
    _.extend item, userId: userId
  update: (userId, doc, filedNames, modifier) ->
    if userId isnt doc.userId
      throw new Meteor.Error 400, "You can only edit your entries."
    true
