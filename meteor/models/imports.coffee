# Create the meteor collection
@Imports = new Meteor.Collection('imports')

Schemas = {}

# Create the schema(s)
Schemas.Line = new SimpleSchema
  _id:
    type: String
    regEx: SimpleSchema.RegEx.Id
  id:
    type: String
    optional: true

Schemas.Import = new SimpleSchema
  # Disable these for now pending #35
  #_id:
  #  type: String
  #  regEx: SimpleSchema.RegEx.Id
  # Owner
  #userId:
  #  type: String
  #  regEx: SimpleSchema.RegEx.Id
  source:
    type: String
  format:
    type: String
  lines:
    type: [Schemas.Line]
    minCount: 1

# Attach the schema to the collection
Imports.attachSchema(Schemas.Import)

# Add the created / updated fields
Imports.timestampable()
# Ensure every document is owned by a user
Imports.owned()

# Define what's allowed
Imports.allow
  insert: (userId, item) ->
    if not userId?
      throw new Meteor.Error 400, "You need to log in to insert."
    _.extend item, userId: userId
