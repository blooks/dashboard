# Create the meteor collection
@Transactions = new Meteor.Collection('transactions')

Schemas = {}

# Create the schema(s)
Schemas.Amount = new SimpleSchema
  amount:
    type: String # Store amounts as string to avoid rounding issues
  currency:
    type: String
    allowedValues: Meteor.settings.public.coyno.allowedCurrencies
  node:
    type: String
    optional: true;

Schemas.Transaction = new SimpleSchema

  foreignId:
    type: String
    unique : true
  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Trade info
  in:
    type: Schemas.Amount
  out:
    type: Schemas.Amount
  # Metadata
  date:
    type: Date
  source:
    type: String
    allowedValues: Meteor.settings.public.coyno.supportedExchanges
  note:
    type: String
    optional: true
  isTrade:
    type: Boolean
    autoValue: ->
      if @isInsert
        inField = @field("in")
        outField = @field("out")
        if inField.value.currency == outField.value.currency
          false
        else
          true
          

# Attach the schema to the collection
Transactions.attachSchema Schemas.Transaction

# Add the created / updated fields
Transactions.timed()

# Ensure every document is owned by a user
Transactions.owned()

Transactions.allow
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
