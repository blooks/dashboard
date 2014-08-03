# Calculate base currency from an amount / currency pair
calculateBaseAmount = (amt, date = new Date()) ->
  try
    # Quick sanity test
    check amt,
      amount: String
      currency: String
    check(date, Date)
    # We only have USD rates for now
    if amt.currency isnt 'USD'
      throw new Meteor.Error('400', 'Sorry, can only convert from USD right now...')
    #to = Meteor.user.profile.baseCurrency
    to = 'EUR'
    #rate = getExchangeRate(amount.currency, to, date)
    rate = 0.74
    # Coffeescript magically makes this an object and returns it
    base =
      amount: accounting.toFixed(amt.amount * rate, 2)
      currency: to
    return base
  catch e
    console.log e
  

# Take the output from parseBitstamp and create transactions
insertBitstampTransactions = (importId, lineObjs) ->
  errors = []
  for line in lineObjs
    # Instantiate an empty transaction
    txn = {}
    txn.date = new Date(line.date) #40
    txn.importId = importId
    txn.importLineId = line._id
    txn.source = 'bitstamp'
    #
    # Trades
    #
    if line.type is '2' # trade
      if line.btc_amount.substr(0,1) is '-' # trade is a sale of bitcoin for USD
        txn.in =
          amount: line.btc_amount.substr(1) # Trim off the initial -
          currency: 'BTC'
        txn.out =
          amount: line.usd_amount
          currency: 'USD'
      else if line.usd_amount.substr(0,1) is '-' # trade is a buy of bitcoin with USD
        txn.in =
          amount: line.usd_amount.substr(1) # Trime off the initial -
          currency: 'USD'
        txn.out =
          amount: line.btc_amount
          currency: 'BTC'
    #
    # Bitstamp deposits
    #
    # Deposits of USD are the purchase of USD with EUR. Therefore, they need to
    # be included in tax calculations.
    # Deposits of BTC are simply the transfer of BTC, and need to be accounted
    # for elsewhere. Those transactions, are therefore, ignore. #
    #
    else if line.type is '0' # Deposit
      if line.btc_amount is '0.00000000' # Transfer in of USD
        txn.in =
          amount: line.usd_amount
          currency: 'USD'
        txn.out = calculateBaseAmount({amount: line.usd_amount, currency: 'USD'}, txn.date)
      #else # Transfer in of BTC
      #  addUnexplainedIncomingBtc(line.btc_amount)
    #
    # Bitstamp withdrawals
    #
    # When a user withdraws USD from their bitstamp account, they're effectively
    # buying EUR with the USD held in their bitstamp account.
    # Withdrawals of BTC are simply the transfer of BTC, and can be ignored.
    #
    else if line.type is '1' # Withdrawal, USD converted to EUR
      if line.btc_amount is '0.00000000' # Withdrawal
        txn.in = calculateBaseAmount({amount: line.usd_amount.substr(1), currency: 'USD'}, txn.date)
        txn.out =
          amount: line.usd_amount.substr(1)
          currency: 'USD'
      #else # Withdrawal of BTC
      #  addUnexplainedOutgoingBtc(line.btc_amount)
    # If we have trade data, create a transaction
    if txn.in?.currency? and txn.out?.currency?
      try
        txnId = Transactions.insert txn
      catch e
        errors.push e
        console.log e
  # If no errors, return true, otherwise, false
  errors.length is 0

# Parse the bitstamp CSV text
parseBitstamp = (csvLines) ->
  # Define the CSV format
  fields = [
    'type' # 0 = deposit, 1 = withdrawal, 2 = trade, 3/4 = ripple
    'date'
    'btc_amount'
    'usd_amount'
    'exchange_rate'
    'fee'
  ]
  # Parse the lines one at a time
  lineObjs = []
  for line in csvLines
    lineObj = {}
    for field, i in line
      lineObj[fields[i]] = field
    lineObj._id = Random.id()
    lineObjs.push(lineObj)
  # Insert the import into the imports collection
  try
    importId = Imports.insert
      source: 'bitstamp_upload_csv'
      format: 'bitstamp_csv_1'
      lines: lineObjs
  catch e
    console.log 'Inserting the import failed:'
    console.log e
    return false # If the insert failed, return false and stop here
  # Create the transactions from lineObjs
  insertBitstampTransactions(importId, lineObjs)

# Async parse CSV function
asyncParseCSV = (csvText, callback) ->
  CSV().from.string(csvText).to.array (parsedData) ->
    callback(null, parsedData)
    return
# Wrap the async in a sync wrapper for meteor friendliness
syncParseCSV = Meteor._wrapAsync(asyncParseCSV)

# Define our methods
Meteor.methods
  # Handle CSV client sent by the browser
  # Inspired by https://coderwall.com/p/7tpa8w
  'uploadCSV': (fileInfo, fileData) ->
    # file name = fileInfo.name
    # text = fileData
    # Parse the CSV with our sync wrapped function
    try
      csvLines = syncParseCSV(fileData)
    catch e
      console.log 'Parsing of the uploaded CSV data failed:'
      console.log e
      return false # If the parse failed, return false and stop here
    parseBitstamp(csvLines)
