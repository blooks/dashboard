# Create the meteor collection
@Sources = new Meteor.Collection('sources')

Schemas = {}

Schemas.Sources = new SimpleSchema

  name:
    type: String
    #unique : true
  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Sources info
  note:
    type: String
    optional: true

# Attach the schema to the collection
Sources.attachSchema Schemas.Sources

# Add the created / updated fields
Sources.timed()

# Ensure every document is owned by a user
Sources.owned()

Sources.helpers balance: ->
  45
  #Sources.findOne @_id
  #Transactions.find(userId: @userId).length

Sources.allow
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
