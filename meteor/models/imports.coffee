# Create the meteor collection
Imports = new Meteor.Collection('imports')

Schemas = {}

# Create the schema(s)
Schema.Line = new SimpleSchema
  _id:
    type: String
    regEx: SimpleSchema.RegEx.Id
  id:
    type: String
    optional: true

Schema.Import = new SimpleSchema
  _id:
    type: String
    regEx: SimpleSchema.RegEx.Id
  source:
    type: String
  format:
    type: String

# Add the created / updated fields
Transactions.timestampable()

# Define what's allowed
Transactions.allow
  insert: (userId, item) ->
    if not userId?
      throw new Meteor.Error 400, "You need to log in to insert."
    _.extend item, userId: userId
