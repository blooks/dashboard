# Create the meteor collection
@Nodes = new Meteor.Collection('nodes')

Schemas = {}

Schemas.Nodes = new SimpleSchema

  name:
    type: String
    #unique : true
  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Nodes info
  note:
    type: String
    optional: true
  type:
    type: String
    allowedValues: Meteor.settings.public.coyno.allowedNodeTypes
  exchange:
    type: String
    allowedValues: Meteor.settings.public.coyno.supportedExchanges


# Attach the schema to the collection
Nodes.attachSchema Schemas.Nodes

# Add the created / updated fields
Nodes.timed()

# Ensure every document is owned by a user
Nodes.owned()

Nodes.helpers balance: ->
  45
  #Nodes.findOne @_id
  #Transactions.find(userId: @userId).length

Nodes.allow
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
