# Create the meteor collection
@BankAccounts = new Meteor.Collection('bankaccounts')

Schemas = {}

Schemas.BankAccounts = new SimpleSchema

  #  regEx: SimpleSchema.RegEx.Id
  ## Owner
  userId:
    type: String
    regEx: SimpleSchema.RegEx.Id
  # BankAccounts info
  label:
    type: String
    optional: true
  bank:
    type: String
    allowedValues: Meteor.settings.public.coyno.allowedBanks
    defaultValue: 'BankAccount'
  currency:
    type: String
    allowedValues: Meteor.settings.public.coyno.allowedCurrencies

# Attach the schema to the collection
BankAccounts.attachSchema Schemas.BankAccounts

# Add the created / updated fields
BankAccounts.timed()

# Ensure every document is owned by a user
BankAccounts.owned()

BankAccounts.allow
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
