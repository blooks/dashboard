# Create the meteor collection
Trades = new Meteor.Collection('trades')

Schemas = {}

# Create the schema(s)
Schemas.Amount = new SimpleSchema
  amount:
    type: String # Store amounts as string to avoid rounding issues
  currency:
    type: String

Schemas.Trade = new SimpleSchema
  _id:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # Owner
  userId:
    type: String
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

Trades.attachSchema Schemas.Trade
