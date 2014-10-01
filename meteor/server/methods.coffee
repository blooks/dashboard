

# Take the output from parseBitstamp and create transactions
insertBitstampTransactions = (lineObjs) ->
  errors = []
  for line in lineObjs
    # Instantiate an empty transaction
    transaction = {}
    transaction.date = new Date(line.date) #40
    transaction.source = 'Bitstamp'
    transaction.userId = Meteor.userId()
    #
    # Trades
    #
    if line.type is '2' # trade
      if line.btc_amount.substr(0,1) is '-' # trade is a sale of bitcoin for USD
        transaction.in =
          amount: line.btc_amount.substr(1) # Trim off the initial -
          currency: 'BTC'
        transaction.out =
          amount: line.usd_amount
          currency: 'USD'
        transaction.base = calculateBaseAmount({amount: line.usd_amount, currency: 'USD'}, transaction.date)
      else if line.usd_amount.substr(0,1) is '-' # trade is a buy of bitcoin with USD
        transaction.in =
          amount: line.usd_amount.substr(1) # Trime off the initial -
          currency: 'USD'
        transaction.out =
          amount: line.btc_amount
          currency: 'BTC'
        transaction.base = calculateBaseAmount({amount: line.usd_amount.substr(1), currency: 'USD'}, transaction.date)
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
        transaction.in =
          amount: line.usd_amount
          currency: 'USD'
        transaction.out = calculateBaseAmount({amount: line.usd_amount, currency: 'USD'}, transaction.date)
        transaction.base = calculateBaseAmount({amount: line.usd_amount, currency: 'USD'}, transaction.date)
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
        transaction.in = calculateBaseAmount({amount: line.usd_amount.substr(1), currency: 'USD'}, transaction.date)
        transaction.out =
          amount: line.usd_amount.substr(1)
          currency: 'USD'
        transaction.base = calculateBaseAmount({amount: line.usd_amount.substr(1), currency: 'USD'}, transaction.date)
      #else # Withdrawal of BTC
      #  addUnexplainedOutgoingBtc(line.btc_amount)
    # If we have trade data, create a transaction
    if transaction.in?.currency? and transaction.out?.currency?
      try
        transactionId = Transactions.insert transaction
      catch e
        errors.push e
        console.log e
  # If no errors, return true, otherwise, false
  errors.length is 0

# Parse the bitstamp CSV text
parseBitstamp = (csvLines) ->
  # Define the CSV format
  fields = [
    'type' # 0 = deposit (SEPA or Ripple!), 1 = withdrawal (SEPA or Ripple!), 2 = trade
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
    #lineObj._id = Random.id()
    lineObjs.push(lineObj)
  # Create the transactions from lineObjs
  insertBitstampTransactions(lineObjs)

# Async parse CSV function
asyncParseCSV = (csvText, callback) ->
  CSV().from.string(csvText).to.array (parsedData) ->
    callback(null, parsedData)
    return
# Wrap the async in a sync wrapper for meteor friendliness
syncParseCSV = Meteor.wrapAsync(asyncParseCSV)

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
  'fetchNewTransactions' : () ->
