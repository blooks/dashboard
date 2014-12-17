# Create the meteor collection
@Exchanges = new Meteor.Collection('exchanges')

Schemas = {}

Schemas.exchangeCredentials = new SimpleSchema
  userName:
    type: String
    optional: true
    custom: ->
      if @field("exchange").value is "Bitstamp" and not @value?
        "required"
      else
        true
  APIKey:
    type: String
  secret:
    type: String

Schemas.exchangeCredentialsSimple = new SimpleSchema
  APIKey:
    type: String
  secret:
    type: String

Schemas.Exchanges = new SimpleSchema

    #unique : true
  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Exchanges info
  exchangeLabel:
    type: String
  exchange:
    type: String
    allowedValues: Meteor.settings.public.coyno.supportedExchanges
  credentials:
    type: Schemas.exchangeCredentials
  credentialsSimple:
    type: Schemas.exchangeCredentialsSimple
    label: "Credentials"

# Attach the schema to the collection
Exchanges.attachSchema Schemas.Exchanges

# Add the created / updated fields
Exchanges.timed()

# Ensure every document is owned by a user
Exchanges.owned()

Exchanges.allow
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
