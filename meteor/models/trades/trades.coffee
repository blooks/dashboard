# Create the meteor collection
## A Trade is a transaction that exchanges one currency for another
## on one venue (like exchange, p2p trading etc.)
@Trades = new Meteor.Collection('trades')

Schemas = {}

# Create the schema(s)
Schemas.Amount = new SimpleSchema
  amount:
    type: Number # Store amounts as string to avoid rounding issues
  currency:
    type: String
    allowedValues: Meteor.settings.public.coyno.allowedCurrencies
  fee:
    type: Number # Fee in this currency (some exchanges charge fees left and right)

Schemas.Trade = new SimpleSchema

  foreignId:
    type: String
    unique : true
  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id

  # Metadata
  date:
    type: Date
  note:
    type: String
    optional: true

  #Venue of the trade
  venueId:
    type: String
    regEx: SimpleSchema.RegEx.Id

  # Trade info
  buy:
    type: Schemas.Amount
  sell:
    type: Schemas.Amount

  baseAmount:
    type: Number
    defaultValue: 0

          

# Attach the schema to the collection
Trades.attachSchema Schemas.Trade

# Add the created / updated fields
Trades.timed()

# Ensure every document is owned by a user
Trades.owned()

Trades.allow
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
